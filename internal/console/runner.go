// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

package console

import (
	"bufio"
	"bytes"
	"context"
	"errors"
	"fmt"
	"io"
	"os"
	"os/exec"
	"regexp"
	"strings"
	"sync"
)

// Stream names the pipe a log line came from. Progress lives on stderr for
// machine-readable ocr output, so the console keeps the two apart.
type Stream string

const (
	StreamStdout Stream = "stdout"
	StreamStderr Stream = "stderr"
)

// Spec describes one ocr invocation. Args exclude the binary name; Dir is the
// repository the command runs in. StreamStdout is for commands whose stdout is
// human-readable (llm test); for review and scan stdout carries JSON and only
// stderr progress is streamed.
type Spec struct {
	Kind         string
	Title        string
	Args         []string
	Dir          string
	StreamStdout bool
	ExpectJSON   bool
}

// RunResult is the outcome of one invocation. Stdout and Stderr are captured
// up to the configured cap so callers can parse or display them.
type RunResult struct {
	Stdout   []byte
	Stderr   []byte
	ExitCode int
	Err      error
}

// Runner runs one ocr command. It is an interface so tests can drive the
// console without spawning processes.
type Runner interface {
	Run(ctx context.Context, spec Spec, onLine func(Stream, string)) RunResult
}

// ExecRunner spawns the ocr binary. The console is part of that binary, so an
// empty Binary resolves to the running executable.
type ExecRunner struct {
	Binary string
	// MaxOutput caps the bytes retained per pipe. Zero means 16 MiB.
	MaxOutput int
}

// Run implements Runner.
func (r ExecRunner) Run(ctx context.Context, spec Spec, onLine func(Stream, string)) RunResult {
	binary := r.Binary
	if binary == "" {
		resolved, err := os.Executable()
		if err != nil {
			return RunResult{ExitCode: -1, Err: fmt.Errorf("resolve ocr executable: %w", err)}
		}
		binary = resolved
	}

	cmd := exec.CommandContext(ctx, binary, spec.Args...)
	cmd.Dir = spec.Dir
	// LC_ALL keeps git messages parseable and English, matching the Makefile's
	// test environment. GIT_TERMINAL_PROMPT avoids a credential prompt holding
	// a web request open forever.
	cmd.Env = append(os.Environ(), "LC_ALL=C", "GIT_TERMINAL_PROMPT=0")

	stdoutPipe, err := cmd.StdoutPipe()
	if err != nil {
		return RunResult{ExitCode: -1, Err: fmt.Errorf("stdout pipe: %w", err)}
	}
	stderrPipe, err := cmd.StderrPipe()
	if err != nil {
		return RunResult{ExitCode: -1, Err: fmt.Errorf("stderr pipe: %w", err)}
	}
	if err := cmd.Start(); err != nil {
		return RunResult{ExitCode: -1, Err: fmt.Errorf("start ocr: %w", err)}
	}

	maxOutput := r.MaxOutput
	if maxOutput <= 0 {
		maxOutput = 16 << 20
	}
	stdout := &cappedBuffer{max: maxOutput}
	stderr := &cappedBuffer{max: 1 << 20}

	var wg sync.WaitGroup
	wg.Add(2)
	go func() {
		defer wg.Done()
		consumePipe(stdoutPipe, StreamStdout, spec.StreamStdout, stdout, onLine)
	}()
	go func() {
		defer wg.Done()
		consumePipe(stderrPipe, StreamStderr, true, stderr, onLine)
	}()
	wg.Wait()
	waitErr := cmd.Wait()

	result := RunResult{
		Stdout:   stdout.Bytes(),
		Stderr:   stderr.Bytes(),
		ExitCode: 0,
	}
	if waitErr != nil {
		result.Err = waitErr
		result.ExitCode = -1
		var exitErr *exec.ExitError
		if errors.As(waitErr, &exitErr) {
			result.ExitCode = exitErr.ExitCode()
		}
	}
	if ctxErr := ctx.Err(); ctxErr != nil {
		result.Err = ctxErr
	}
	return result
}

// consumePipe splits a pipe into log lines and copies the raw bytes into
// capture. Progress bars use carriage returns, so both CR and LF end a line.
func consumePipe(r io.Reader, stream Stream, streamLines bool, capture *cappedBuffer, onLine func(Stream, string)) {
	scanner := bufio.NewScanner(io.TeeReader(r, capture))
	scanner.Buffer(make([]byte, 64*1024), 4*1024*1024)
	scanner.Split(splitLogLines)
	for scanner.Scan() {
		line := sanitizeLogLine(scanner.Text())
		if !streamLines || line == "" || onLine == nil {
			continue
		}
		onLine(stream, line)
	}
	if err := scanner.Err(); err != nil && onLine != nil {
		onLine(stream, fmt.Sprintf("[console] error reading %s: %v", stream, err))
	}
}

// splitLogLines is bufio.ScanLines extended to treat a lone CR as a line end.
// It also waits for the byte after a trailing CR, so CRLF stays one line.
func splitLogLines(data []byte, atEOF bool) (advance int, token []byte, err error) {
	if atEOF && len(data) == 0 {
		return 0, nil, nil
	}
	for i, b := range data {
		if b != '\n' && b != '\r' {
			continue
		}
		if b == '\r' && i+1 == len(data) && !atEOF {
			return 0, nil, nil
		}
		advance = i + 1
		if b == '\r' && i+1 < len(data) && data[i+1] == '\n' {
			advance++
		}
		return advance, data[:i], nil
	}
	if atEOF {
		return len(data), data, nil
	}
	return 0, nil, nil
}

// cappedBuffer retains at most max bytes without failing the writer.
type cappedBuffer struct {
	buf       bytes.Buffer
	max       int
	truncated bool
}

func (b *cappedBuffer) Write(p []byte) (int, error) {
	remaining := b.max - b.buf.Len()
	if remaining <= 0 {
		b.truncated = true
		return len(p), nil
	}
	if len(p) > remaining {
		b.buf.Write(p[:remaining])
		b.truncated = true
		return len(p), nil
	}
	b.buf.Write(p)
	return len(p), nil
}

func (b *cappedBuffer) Bytes() []byte {
	out := make([]byte, b.buf.Len())
	copy(out, b.buf.Bytes())
	return out
}

var ansiEscapeRE = regexp.MustCompile(`\x1b(?:\[[0-9;?]*[ -/]*[@-~]|\][^\x07]*(?:\x07|\x1b\\))`)

// sanitizeLogLine drops color codes and control characters. The browser log is
// plain text, so an escape sequence would otherwise show up as noise. Tabs
// survive; CR/LF never reach here because the splitter consumed them.
func sanitizeLogLine(line string) string {
	line = ansiEscapeRE.ReplaceAllString(line, "")
	line = strings.Map(func(r rune) rune {
		switch {
		case r == '\t':
			return r
		case r < 0x20 || r == 0x7f:
			return -1
		default:
			return r
		}
	}, line)
	return strings.TrimSpace(line)
}

// DisplayCommand renders a copyable ocr command line. Args are quoted for
// display only: execution never goes through a shell.
func DisplayCommand(args []string) string {
	parts := make([]string, 0, len(args)+1)
	parts = append(parts, "ocr")
	for _, arg := range args {
		parts = append(parts, quoteArg(arg))
	}
	return strings.Join(parts, " ")
}

func quoteArg(arg string) string {
	arg = strings.ReplaceAll(arg, "\r", " ")
	arg = strings.ReplaceAll(arg, "\n", `\n`)
	if len(arg) > 240 {
		arg = arg[:240] + "..."
	}
	if arg == "" {
		return `""`
	}
	safe := true
	for _, r := range arg {
		switch {
		case r >= 'a' && r <= 'z', r >= 'A' && r <= 'Z', r >= '0' && r <= '9':
		case strings.ContainsRune("_./:=@%+,-", r):
		default:
			safe = false
		}
		if !safe {
			break
		}
	}
	if safe {
		return arg
	}
	return "'" + strings.ReplaceAll(arg, "'", `'\''`) + "'"
}
