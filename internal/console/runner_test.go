// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

package console

import (
	"bufio"
	"bytes"
	"context"
	"errors"
	"fmt"
	"os"
	"os/exec"
	"strings"
	"testing"
	"time"
)

const (
	helperEnv    = "OCR_CONSOLE_EXEC_HELPER"
	helperStdout = "OCR_CONSOLE_EXEC_STDOUT"
	helperStderr = "OCR_CONSOLE_EXEC_STDERR"
	helperExit   = "OCR_CONSOLE_EXEC_EXIT"
	helperDelay  = "OCR_CONSOLE_EXEC_DELAY"
)

func TestExecRunnerHelperProcess(t *testing.T) {
	if os.Getenv(helperEnv) != "1" {
		return
	}
	if stdout := os.Getenv(helperStdout); stdout != "" {
		fmt.Fprint(os.Stdout, stdout)
	}
	if stderr := os.Getenv(helperStderr); stderr != "" {
		fmt.Fprint(os.Stderr, stderr)
	}
	if delay, err := time.ParseDuration(os.Getenv(helperDelay)); err == nil {
		time.Sleep(delay)
	}
	code := 0
	if raw := os.Getenv(helperExit); raw != "" {
		_, _ = fmt.Sscanf(raw, "%d", &code)
	}
	os.Exit(code)
}

func helperSpec(streamStdout bool) Spec {
	return Spec{
		Kind:         "test",
		Args:         []string{"-test.run=^TestExecRunnerHelperProcess$"},
		Dir:          os.TempDir(),
		StreamStdout: streamStdout,
	}
}

func TestExecRunnerCapturesAndStreams(t *testing.T) {
	t.Setenv(helperEnv, "1")
	t.Setenv(helperStdout, `{"ok":true}`)
	t.Setenv(helperStderr, "progress line\n")
	runner := ExecRunner{Binary: os.Args[0]}

	var lines []string
	res := runner.Run(context.Background(), helperSpec(false), func(stream Stream, text string) {
		lines = append(lines, string(stream)+":"+text)
	})
	if res.Err != nil {
		t.Fatalf("Run error: %v", res.Err)
	}
	if res.ExitCode != 0 {
		t.Errorf("exit code = %d, want 0", res.ExitCode)
	}
	if string(res.Stdout) != `{"ok":true}` {
		t.Errorf("stdout = %q", res.Stdout)
	}
	if !strings.Contains(string(res.Stderr), "progress line") {
		t.Errorf("stderr = %q", res.Stderr)
	}
	if len(lines) != 1 || lines[0] != "stderr:progress line" {
		t.Errorf("streamed lines = %v, want only stderr progress", lines)
	}

	lines = nil
	res = runner.Run(context.Background(), helperSpec(true), func(stream Stream, text string) {
		lines = append(lines, string(stream)+":"+text)
	})
	if len(lines) != 2 {
		t.Fatalf("streamed lines = %v, want stdout and stderr", lines)
	}
	joined := strings.Join(lines, "|")
	if !strings.Contains(joined, `stdout:{"ok":true}`) || !strings.Contains(joined, "stderr:progress line") {
		t.Errorf("streamed lines = %v", lines)
	}
}

func TestExecRunnerNonZeroExit(t *testing.T) {
	t.Setenv(helperEnv, "1")
	t.Setenv(helperExit, "3")
	t.Setenv(helperStderr, "boom")
	res := ExecRunner{Binary: os.Args[0]}.Run(context.Background(), helperSpec(false), nil)
	if res.ExitCode != 3 {
		t.Errorf("exit code = %d, want 3", res.ExitCode)
	}
	var exitErr *exec.ExitError
	if !errors.As(res.Err, &exitErr) {
		t.Errorf("error = %v, want *exec.ExitError", res.Err)
	}
	if !strings.Contains(string(res.Stderr), "boom") {
		t.Errorf("stderr = %q", res.Stderr)
	}
}

func TestExecRunnerCancel(t *testing.T) {
	t.Setenv(helperEnv, "1")
	t.Setenv(helperDelay, "5s")
	ctx, cancel := context.WithCancel(context.Background())
	go func() {
		time.Sleep(120 * time.Millisecond)
		cancel()
	}()
	start := time.Now()
	res := ExecRunner{Binary: os.Args[0]}.Run(ctx, helperSpec(false), nil)
	defer cancel()
	if !errors.Is(res.Err, context.Canceled) {
		t.Errorf("error = %v, want context.Canceled", res.Err)
	}
	if time.Since(start) > 3*time.Second {
		t.Errorf("cancellation took too long: %s", time.Since(start))
	}
}

func TestExecRunnerMissingBinary(t *testing.T) {
	res := ExecRunner{Binary: os.TempDir() + string(os.PathSeparator) + "ocr-console-missing-binary"}.Run(
		context.Background(), helperSpec(false), nil)
	if res.Err == nil {
		t.Fatal("expected an error for a missing binary")
	}
	if res.ExitCode != -1 {
		t.Errorf("exit code = %d, want -1", res.ExitCode)
	}
}

func TestSplitLogLines(t *testing.T) {
	tests := []struct {
		name  string
		input string
		want  []string
	}{
		{name: "lf", input: "one\ntwo\n", want: []string{"one", "two"}},
		{name: "cr", input: "one\rtwo\r", want: []string{"one", "two"}},
		{name: "crlf", input: "one\r\ntwo\r\n", want: []string{"one", "two"}},
		{name: "mixed", input: "a\r\nb\nc\rd", want: []string{"a", "b", "c", "d"}},
		{name: "empty", input: "", want: nil},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			scanner := bufio.NewScanner(strings.NewReader(tt.input))
			scanner.Split(splitLogLines)
			var got []string
			for scanner.Scan() {
				got = append(got, scanner.Text())
			}
			if err := scanner.Err(); err != nil {
				t.Fatalf("scan: %v", err)
			}
			if strings.Join(got, "|") != strings.Join(tt.want, "|") {
				t.Errorf("lines = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestSanitizeLogLine(t *testing.T) {
	tests := []struct {
		input string
		want  string
	}{
		{input: "plain", want: "plain"},
		{input: "\x1b[31mred\x1b[0m", want: "red"},
		{input: "  padded  ", want: "padded"},
		{input: "tab\there", want: "tab\there"},
		{input: "nul\x00byte", want: "nulbyte"},
		{input: "\x1b]0;title\x07after", want: "after"},
	}
	for _, tt := range tests {
		if got := sanitizeLogLine(tt.input); got != tt.want {
			t.Errorf("sanitizeLogLine(%q) = %q, want %q", tt.input, got, tt.want)
		}
	}
}

func TestCappedBuffer(t *testing.T) {
	buf := &cappedBuffer{max: 5}
	if n, err := buf.Write([]byte("abc")); n != 3 || err != nil {
		t.Fatalf("Write = %d, %v", n, err)
	}
	if n, err := buf.Write([]byte("defgh")); n != 5 || err != nil {
		t.Fatalf("Write = %d, %v", n, err)
	}
	if got := string(buf.Bytes()); got != "abcde" {
		t.Errorf("bytes = %q, want abcde", got)
	}
	if !buf.truncated {
		t.Error("truncated = false, want true")
	}
	if n, _ := buf.Write([]byte("x")); n != 1 {
		t.Errorf("Write after cap = %d, want 1", n)
	}
	if got := string(buf.Bytes()); got != "abcde" {
		t.Errorf("bytes after cap = %q", got)
	}
}

func TestConsumePipe(t *testing.T) {
	var capture cappedBuffer
	capture.max = 1024
	var lines []string
	consumePipe(strings.NewReader("one\ntwo\n"), StreamStderr, true, &capture, func(stream Stream, text string) {
		lines = append(lines, string(stream)+":"+text)
	})
	if len(lines) != 2 {
		t.Fatalf("lines = %v", lines)
	}
	if string(capture.Bytes()) != "one\ntwo\n" {
		t.Errorf("raw capture = %q", capture.Bytes())
	}

	lines = nil
	consumePipe(strings.NewReader("stdout only\n"), StreamStdout, false, &cappedBuffer{max: 10}, func(Stream, string) {
		t.Error("stdout should not stream when streamLines is false")
	})
	if len(lines) != 0 {
		t.Errorf("unexpected lines: %v", lines)
	}
}

func TestDisplayCommand(t *testing.T) {
	tests := []struct {
		args []string
		want string
	}{
		{args: []string{"review"}, want: "ocr review"},
		{args: []string{"review", "--from", "main", "--to", "feat/x"}, want: "ocr review --from main --to feat/x"},
		{args: []string{"review", "--background", "hello world"}, want: "ocr review --background 'hello world'"},
		{args: []string{"review", "--background", "it's fine"}, want: `ocr review --background 'it'\''s fine'`},
		{args: []string{"review", "--background", ""}, want: `ocr review --background ""`},
		{args: []string{"scan", "--path", "a\nb"}, want: `ocr scan --path 'a\nb'`},
	}
	for _, tt := range tests {
		if got := DisplayCommand(tt.args); got != tt.want {
			t.Errorf("DisplayCommand(%v) = %q, want %q", tt.args, got, tt.want)
		}
	}
}

func TestQuoteArgTruncatesLongValues(t *testing.T) {
	long := strings.Repeat("a", 300)
	got := quoteArg(long)
	if !strings.HasSuffix(got, "...") {
		t.Errorf("quoteArg(long) = %q", got)
	}
	if len(got) > 260 {
		t.Errorf("quoteArg(long) length = %d, want capped", len(got))
	}
}

func TestCappedBufferEmpty(t *testing.T) {
	buf := &cappedBuffer{max: 3}
	if data := buf.Bytes(); len(data) != 0 {
		t.Errorf("Bytes() = %v, want empty", data)
	}
	var out bytes.Buffer
	out.Write(buf.Bytes())
	if out.Len() != 0 {
		t.Errorf("buffer = %q", out.String())
	}
}
