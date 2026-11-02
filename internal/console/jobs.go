// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

package console

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"sync"
	"time"
)

// Job status values exposed by the console API.
const (
	StatusRunning   = "running"
	StatusCanceling = "canceling"
	StatusSucceeded = "succeeded"
	StatusFailed    = "failed"
	StatusCanceled  = "canceled"
)

const (
	maxJobLogs      = 4000
	maxJobOutput    = 128 << 10
	maxRetainedJobs = 40
)

// ErrJobRunning reports that another job of the same kind is in flight. The
// console allows one review and one scan at a time so a double click cannot
// quietly double the LLM spend.
var ErrJobRunning = errors.New("a job of this kind is already running")

// LogLine is one sanitized progress line.
type LogLine struct {
	Seq    int       `json:"seq"`
	Time   time.Time `json:"time"`
	Stream Stream    `json:"stream"`
	Text   string    `json:"text"`
}

// JobSnapshot is the JSON-facing view of a job. Logs and the result are only
// included by Get, not by List.
type JobSnapshot struct {
	ID             string          `json:"id"`
	Kind           string          `json:"kind"`
	Title          string          `json:"title"`
	Status         string          `json:"status"`
	Command        []string        `json:"command"`
	CommandPreview string          `json:"command_preview"`
	StartedAt      time.Time       `json:"started_at"`
	EndedAt        *time.Time      `json:"ended_at,omitempty"`
	ExitCode       *int            `json:"exit_code,omitempty"`
	Error          string          `json:"error,omitempty"`
	Logs           []LogLine       `json:"logs,omitempty"`
	LogsTruncated  bool            `json:"logs_truncated,omitempty"`
	Result         json.RawMessage `json:"result,omitempty"`
	Output         string          `json:"output,omitempty"`
	Version        int             `json:"version"`
}

// Terminal reports whether the job has finished.
func (s JobSnapshot) Terminal() bool {
	switch s.Status {
	case StatusSucceeded, StatusFailed, StatusCanceled:
		return true
	default:
		return false
	}
}

type job struct {
	mu sync.Mutex

	id      string
	kind    string
	title   string
	status  string
	command []string

	startedAt    time.Time
	endedAt      time.Time
	exitCode     int
	hasExit      bool
	errMsg       string
	logs         []LogLine
	logSeq       int
	truncated    bool
	result       json.RawMessage
	output       string
	version      int
	jsonExpected bool

	cancel     context.CancelFunc
	done       chan struct{}
	doneClosed bool
}

func newJob(id string, spec Spec, cancel context.CancelFunc) *job {
	return &job{
		id:        id,
		kind:      spec.Kind,
		title:     spec.Title,
		status:    StatusRunning,
		command:   append([]string(nil), spec.Args...),
		startedAt: time.Now(),
		cancel:    cancel,
		done:      make(chan struct{}),
	}
}

func (j *job) addLine(stream Stream, text string) {
	j.mu.Lock()
	defer j.mu.Unlock()
	if j.doneClosed || text == "" {
		return
	}
	j.logSeq++
	j.logs = append(j.logs, LogLine{Seq: j.logSeq, Time: time.Now(), Stream: stream, Text: text})
	if len(j.logs) > maxJobLogs {
		drop := len(j.logs) - maxJobLogs
		j.logs = append([]LogLine(nil), j.logs[drop:]...)
		j.truncated = true
	}
	j.version++
}

func (j *job) finish(res RunResult) {
	j.mu.Lock()
	defer j.mu.Unlock()
	if j.doneClosed {
		return
	}
	now := time.Now()
	cancelRequested := j.status == StatusCanceling
	j.endedAt = now
	j.hasExit = true
	j.exitCode = res.ExitCode
	j.status = StatusSucceeded

	switch {
	case cancelRequested:
		j.status = StatusCanceled
		j.errMsg = "Canceled."
	case res.Err != nil && errors.Is(res.Err, context.Canceled):
		j.status = StatusCanceled
		j.errMsg = "Canceled."
	case res.Err != nil:
		j.status = StatusFailed
		j.errMsg = res.Err.Error()
	case res.ExitCode != 0:
		j.status = StatusFailed
		j.errMsg = fmt.Sprintf("command exited with code %d", res.ExitCode)
	}

	if j.status != StatusCanceled && len(j.result) == 0 && j.jsonExpected {
		if raw, err := parseJSONResult(res.Stdout); err == nil {
			j.result = raw
		} else if j.status == StatusSucceeded {
			j.status = StatusFailed
			j.errMsg = err.Error()
		}
	}

	if j.result == nil || j.status == StatusFailed {
		j.output = truncateText(string(res.Stdout), maxJobOutput)
	}
	if j.status == StatusFailed && j.errMsg == "" {
		j.errMsg = "command failed"
	}
	if j.status == StatusFailed && j.output == "" && len(res.Stderr) > 0 {
		j.output = truncateText(string(res.Stderr), maxJobOutput)
	}

	j.version++
	j.doneClosed = true
	close(j.done)
}

func (j *job) snapshot(includeDetails bool) JobSnapshot {
	j.mu.Lock()
	defer j.mu.Unlock()
	snap := JobSnapshot{
		ID:             j.id,
		Kind:           j.kind,
		Title:          j.title,
		Status:         j.status,
		Command:        append([]string(nil), j.command...),
		CommandPreview: DisplayCommand(j.command),
		StartedAt:      j.startedAt,
		Error:          j.errMsg,
		Version:        j.version,
	}
	if !j.endedAt.IsZero() {
		ended := j.endedAt
		snap.EndedAt = &ended
	}
	if j.hasExit {
		exitCode := j.exitCode
		snap.ExitCode = &exitCode
	}
	if includeDetails {
		snap.Logs = append([]LogLine(nil), j.logs...)
		snap.LogsTruncated = j.truncated
		snap.Result = append(json.RawMessage(nil), j.result...)
		snap.Output = j.output
	}
	return snap
}

func (j *job) cancelJob() bool {
	j.mu.Lock()
	defer j.mu.Unlock()
	if j.doneClosed {
		return false
	}
	if j.status == StatusRunning {
		j.status = StatusCanceling
		j.version++
	}
	j.cancel()
	return true
}

// Jobs owns the in-memory job table and the single-runner-per-kind rule.
type Jobs struct {
	mu     sync.Mutex
	runner Runner
	dir    string
	max    int
	order  []string
	jobs   map[string]*job
}

// NewJobs constructs a job table.
func NewJobs(runner Runner, dir string) *Jobs {
	return &Jobs{runner: runner, dir: dir, max: maxRetainedJobs, jobs: make(map[string]*job)}
}

// Start launches a job and returns its first snapshot. It fails when a job of
// the same kind is still running.
func (m *Jobs) Start(spec Spec) (JobSnapshot, error) {
	m.mu.Lock()
	for _, id := range m.order {
		existing := m.jobs[id]
		if existing == nil {
			continue
		}
		existing.mu.Lock()
		active := existing.kind == spec.Kind && !existing.doneClosed
		existing.mu.Unlock()
		if active {
			m.mu.Unlock()
			return JobSnapshot{}, fmt.Errorf("%w: %s", ErrJobRunning, spec.Kind)
		}
	}

	ctx, cancel := context.WithCancel(context.Background())
	j := newJob(newJobID(), spec, cancel)
	j.jsonExpected = spec.ExpectJSON
	m.jobs[j.id] = j
	m.order = append(m.order, j.id)
	m.pruneLocked()
	m.mu.Unlock()

	go func() {
		res := m.runner.Run(ctx, spec, j.addLine)
		j.finish(res)
	}()

	return j.snapshot(true), nil
}

// Get returns one job including logs and result.
func (m *Jobs) Get(id string) (JobSnapshot, bool) {
	m.mu.Lock()
	j := m.jobs[id]
	m.mu.Unlock()
	if j == nil {
		return JobSnapshot{}, false
	}
	return j.snapshot(true), true
}

// List returns summaries, newest first.
func (m *Jobs) List() []JobSnapshot {
	m.mu.Lock()
	order := append([]string(nil), m.order...)
	m.mu.Unlock()

	out := make([]JobSnapshot, 0, len(order))
	for i := len(order) - 1; i >= 0; i-- {
		m.mu.Lock()
		j := m.jobs[order[i]]
		m.mu.Unlock()
		if j == nil {
			continue
		}
		out = append(out, j.snapshot(false))
	}
	return out
}

// Running counts jobs that have not finished.
func (m *Jobs) Running() int {
	m.mu.Lock()
	defer m.mu.Unlock()
	count := 0
	for _, j := range m.jobs {
		j.mu.Lock()
		if !j.doneClosed {
			count++
		}
		j.mu.Unlock()
	}
	return count
}

// Cancel asks a running job to stop. It reports false when the job is already
// finished or unknown.
func (m *Jobs) Cancel(id string) (bool, bool) {
	m.mu.Lock()
	j := m.jobs[id]
	m.mu.Unlock()
	if j == nil {
		return false, false
	}
	return true, j.cancelJob()
}

// Done returns a channel closed when the job finishes. It is used by tests and
// by stream handlers deciding when to stop.
func (m *Jobs) Done(id string) (<-chan struct{}, bool) {
	m.mu.Lock()
	j := m.jobs[id]
	m.mu.Unlock()
	if j == nil {
		return nil, false
	}
	return j.done, true
}

func (m *Jobs) pruneLocked() {
	for len(m.order) > m.max {
		removed := false
		for i, id := range m.order {
			j := m.jobs[id]
			if j == nil {
				m.order = append(m.order[:i], m.order[i+1:]...)
				removed = true
				break
			}
			j.mu.Lock()
			finished := j.doneClosed
			j.mu.Unlock()
			if finished {
				delete(m.jobs, id)
				m.order = append(m.order[:i], m.order[i+1:]...)
				removed = true
				break
			}
		}
		if !removed {
			return
		}
	}
}

func parseJSONResult(stdout []byte) (json.RawMessage, error) {
	trimmed := strings.TrimSpace(string(stdout))
	if trimmed == "" {
		return nil, errors.New("the command produced no JSON output")
	}
	if !json.Valid([]byte(trimmed)) {
		return nil, errors.New("the command produced invalid JSON output")
	}
	var object map[string]json.RawMessage
	if err := json.Unmarshal([]byte(trimmed), &object); err != nil {
		return nil, errors.New("the command did not emit a JSON object")
	}
	return json.RawMessage(trimmed), nil
}

func truncateText(s string, max int) string {
	if len(s) <= max {
		return s
	}
	return s[:max] + "\n[console] output truncated"
}

func newJobID() string {
	var buf [8]byte
	if _, err := rand.Read(buf[:]); err != nil {
		return fmt.Sprintf("job-%d", time.Now().UnixNano())
	}
	return hex.EncodeToString(buf[:])
}
