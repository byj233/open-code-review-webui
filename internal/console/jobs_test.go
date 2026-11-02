// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

package console

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"testing"
	"time"
)

func waitJob(t *testing.T, jobs *Jobs, id string) JobSnapshot {
	t.Helper()
	done, ok := jobs.Done(id)
	if !ok {
		t.Fatalf("job %q not found", id)
	}
	select {
	case <-done:
	case <-time.After(10 * time.Second):
		t.Fatalf("job %q did not finish", id)
	}
	snapshot, ok := jobs.Get(id)
	if !ok {
		t.Fatalf("job %q disappeared", id)
	}
	return snapshot
}

func TestJobsSuccessJSON(t *testing.T) {
	runner := &fakeRunner{run: func(_ context.Context, _ Spec, onLine func(Stream, string)) RunResult {
		onLine(StreamStderr, "[ocr] starting")
		onLine(StreamStderr, "[ocr] reviewing 2 files")
		return RunResult{Stdout: []byte(`{"status":"success","comments":[]}`), ExitCode: 0}
	}}
	jobs := NewJobs(runner, t.TempDir())
	snapshot, err := jobs.Start(Spec{Kind: "review", Args: []string{"review", "--preview"}, ExpectJSON: true})
	if err != nil {
		t.Fatalf("Start: %v", err)
	}
	if snapshot.Status != StatusRunning {
		t.Errorf("initial status = %q, want running", snapshot.Status)
	}
	finished := waitJob(t, jobs, snapshot.ID)
	if finished.Status != StatusSucceeded {
		t.Fatalf("status = %q, error = %q", finished.Status, finished.Error)
	}
	if finished.ExitCode == nil || *finished.ExitCode != 0 {
		t.Errorf("exit code = %v", finished.ExitCode)
	}
	if len(finished.Logs) != 2 {
		t.Errorf("logs = %d, want 2", len(finished.Logs))
	}
	if string(finished.Result) != `{"status":"success","comments":[]}` {
		t.Errorf("result = %s", finished.Result)
	}
	if finished.CommandPreview == "" || finished.EndedAt == nil {
		t.Errorf("snapshot missing preview/end time: %+v", finished)
	}
}

func TestJobsNonJSONOutput(t *testing.T) {
	runner := &fakeRunner{run: func(context.Context, Spec, func(Stream, string)) RunResult {
		return RunResult{Stdout: []byte("connection ok\n"), ExitCode: 0}
	}}
	jobs := NewJobs(runner, t.TempDir())
	started, err := jobs.Start(Spec{Kind: "llm-test", Args: []string{"llm", "test"}})
	if err != nil {
		t.Fatalf("Start: %v", err)
	}
	finished := waitJob(t, jobs, started.ID)
	if finished.Status != StatusSucceeded {
		t.Errorf("status = %q, want succeeded", finished.Status)
	}
	if finished.Output != "connection ok\n" {
		t.Errorf("output = %q", finished.Output)
	}
	if finished.Result != nil {
		t.Errorf("result = %s, want nil", finished.Result)
	}
}

func TestJobsInvalidJSON(t *testing.T) {
	runner := &fakeRunner{run: func(context.Context, Spec, func(Stream, string)) RunResult {
		return RunResult{Stdout: []byte("not json"), ExitCode: 0}
	}}
	jobs := NewJobs(runner, t.TempDir())
	started, _ := jobs.Start(Spec{Kind: "review", Args: []string{"review"}, ExpectJSON: true})
	finished := waitJob(t, jobs, started.ID)
	if finished.Status != StatusFailed {
		t.Errorf("status = %q, want failed", finished.Status)
	}
	if !strings.Contains(finished.Error, "invalid JSON") {
		t.Errorf("error = %q", finished.Error)
	}
	if !strings.Contains(finished.Output, "not json") {
		t.Errorf("output = %q", finished.Output)
	}
}

func TestJobsFailedWithValidJSONKeepsResult(t *testing.T) {
	runner := &fakeRunner{run: func(context.Context, Spec, func(Stream, string)) RunResult {
		return RunResult{
			Stdout:   []byte(`{"status":"failed","comments":[{"path":"x.go"}]}`),
			ExitCode: 1,
			Err:      errors.New("exit status 1"),
		}
	}}
	jobs := NewJobs(runner, t.TempDir())
	started, _ := jobs.Start(Spec{Kind: "review", Args: []string{"review"}, ExpectJSON: true})
	finished := waitJob(t, jobs, started.ID)
	if finished.Status != StatusFailed {
		t.Errorf("status = %q, want failed", finished.Status)
	}
	if finished.Result == nil {
		t.Error("result was dropped for a failed run with valid JSON")
	}
}

func TestJobsFailureUsesStderrOutput(t *testing.T) {
	runner := &fakeRunner{run: func(context.Context, Spec, func(Stream, string)) RunResult {
		return RunResult{Stderr: []byte("provider rejected the key"), ExitCode: 2}
	}}
	jobs := NewJobs(runner, t.TempDir())
	started, _ := jobs.Start(Spec{Kind: "review", Args: []string{"review"}, ExpectJSON: true})
	finished := waitJob(t, jobs, started.ID)
	if finished.Status != StatusFailed {
		t.Errorf("status = %q, want failed", finished.Status)
	}
	if !strings.Contains(finished.Output, "provider rejected") {
		t.Errorf("output = %q", finished.Output)
	}
	if finished.ExitCode == nil || *finished.ExitCode != 2 {
		t.Errorf("exit code = %v", finished.ExitCode)
	}
}

func TestJobsCancel(t *testing.T) {
	runner := &fakeRunner{run: func(ctx context.Context, _ Spec, _ func(Stream, string)) RunResult {
		<-ctx.Done()
		return RunResult{ExitCode: -1, Err: ctx.Err()}
	}}
	jobs := NewJobs(runner, t.TempDir())
	started, _ := jobs.Start(Spec{Kind: "review", Args: []string{"review"}})
	exists, canceled := jobs.Cancel(started.ID)
	if !exists || !canceled {
		t.Fatalf("Cancel = %v, %v", exists, canceled)
	}
	canceling, _ := jobs.Get(started.ID)
	if canceling.Status != StatusCanceling && canceling.Status != StatusCanceled {
		t.Errorf("status after cancel = %q", canceling.Status)
	}
	finished := waitJob(t, jobs, started.ID)
	if finished.Status != StatusCanceled {
		t.Errorf("status = %q, want canceled", finished.Status)
	}
	if finished.Error != "Canceled." {
		t.Errorf("error = %q", finished.Error)
	}
	if _, canceled := jobs.Cancel(started.ID); canceled {
		t.Error("Cancel on a finished job returned true")
	}
}

func TestJobsOnePerKind(t *testing.T) {
	release := make(chan struct{})
	runner := &fakeRunner{run: func(ctx context.Context, _ Spec, _ func(Stream, string)) RunResult {
		select {
		case <-release:
			return RunResult{ExitCode: 0}
		case <-ctx.Done():
			return RunResult{ExitCode: -1, Err: ctx.Err()}
		}
	}}
	jobs := NewJobs(runner, t.TempDir())
	first, err := jobs.Start(Spec{Kind: "review", Args: []string{"review"}})
	if err != nil {
		t.Fatalf("first Start: %v", err)
	}
	if _, err := jobs.Start(Spec{Kind: "review", Args: []string{"review"}}); !errors.Is(err, ErrJobRunning) {
		t.Errorf("second Start error = %v, want ErrJobRunning", err)
	}
	second, err := jobs.Start(Spec{Kind: "scan", Args: []string{"scan"}})
	if err != nil {
		t.Errorf("scan Start should be allowed alongside review: %v", err)
	}
	if jobs.Running() != 2 {
		t.Errorf("running = %d, want 2", jobs.Running())
	}
	jobs.Cancel(first.ID)
	jobs.Cancel(second.ID)
	waitJob(t, jobs, first.ID)
	waitJob(t, jobs, second.ID)
	close(release)
}

func TestJobsListExcludesDetails(t *testing.T) {
	runner := &fakeRunner{run: func(_ context.Context, _ Spec, onLine func(Stream, string)) RunResult {
		onLine(StreamStderr, "line")
		return RunResult{Stdout: []byte(`{"ok":true}`), ExitCode: 0}
	}}
	jobs := NewJobs(runner, t.TempDir())
	first, _ := jobs.Start(Spec{Kind: "review", Args: []string{"review"}, ExpectJSON: true})
	waitJob(t, jobs, first.ID)
	second, _ := jobs.Start(Spec{Kind: "scan", Args: []string{"scan"}, ExpectJSON: true})
	waitJob(t, jobs, second.ID)

	list := jobs.List()
	if len(list) != 2 {
		t.Fatalf("list length = %d", len(list))
	}
	if list[0].ID != second.ID || list[1].ID != first.ID {
		t.Errorf("list order = %s, %s", list[0].ID, list[1].ID)
	}
	if list[0].Logs != nil || list[0].Result != nil {
		t.Error("list snapshots should not include logs or result")
	}
	if jobs.Running() != 0 {
		t.Errorf("running = %d, want 0", jobs.Running())
	}
}

func TestJobsPrune(t *testing.T) {
	runner := &fakeRunner{}
	jobs := NewJobs(runner, t.TempDir())
	jobs.max = 2
	var ids []string
	for i := 0; i < 3; i++ {
		started, err := jobs.Start(Spec{Kind: fmt.Sprintf("kind-%d", i), Args: []string{"review"}})
		if err != nil {
			t.Fatalf("Start %d: %v", i, err)
		}
		ids = append(ids, started.ID)
		waitJob(t, jobs, started.ID)
	}
	if len(jobs.List()) != 2 {
		t.Errorf("list length = %d, want 2", len(jobs.List()))
	}
	if _, ok := jobs.Get(ids[0]); ok {
		t.Error("oldest job was not pruned")
	}
}

func TestJobsLogTruncation(t *testing.T) {
	runner := &fakeRunner{run: func(_ context.Context, _ Spec, onLine func(Stream, string)) RunResult {
		for i := 0; i < maxJobLogs+120; i++ {
			onLine(StreamStderr, fmt.Sprintf("line %d", i))
		}
		return RunResult{ExitCode: 0}
	}}
	jobs := NewJobs(runner, t.TempDir())
	started, _ := jobs.Start(Spec{Kind: "review", Args: []string{"review"}})
	finished := waitJob(t, jobs, started.ID)
	if len(finished.Logs) != maxJobLogs {
		t.Errorf("logs = %d, want %d", len(finished.Logs), maxJobLogs)
	}
	if !finished.LogsTruncated {
		t.Error("LogsTruncated = false")
	}
	if finished.Logs[0].Seq <= 1 {
		t.Errorf("first retained sequence = %d, expected dropped lines", finished.Logs[0].Seq)
	}
}

func TestJobsUnknownAndDone(t *testing.T) {
	jobs := NewJobs(&fakeRunner{}, t.TempDir())
	if _, ok := jobs.Get("missing"); ok {
		t.Error("Get(missing) = true")
	}
	if exists, canceled := jobs.Cancel("missing"); exists || canceled {
		t.Errorf("Cancel(missing) = %v, %v", exists, canceled)
	}
	if _, ok := jobs.Done("missing"); ok {
		t.Error("Done(missing) = true")
	}
}

func TestJobsNonJSONExpectationWithStartError(t *testing.T) {
	runner := &fakeRunner{run: func(context.Context, Spec, func(Stream, string)) RunResult {
		return RunResult{ExitCode: -1, Err: errors.New("start ocr: permission denied")}
	}}
	jobs := NewJobs(runner, t.TempDir())
	started, _ := jobs.Start(Spec{Kind: "review", Args: []string{"review"}})
	finished := waitJob(t, jobs, started.ID)
	if finished.Status != StatusFailed {
		t.Errorf("status = %q", finished.Status)
	}
	if !strings.Contains(finished.Error, "permission denied") {
		t.Errorf("error = %q", finished.Error)
	}
}

func TestParseJSONResult(t *testing.T) {
	tests := []struct {
		name    string
		input   string
		wantErr bool
	}{
		{name: "object", input: `{"a":1}`},
		{name: "empty", input: "  ", wantErr: true},
		{name: "invalid", input: "{", wantErr: true},
		{name: "array", input: `[1,2]`, wantErr: true},
		{name: "scalar", input: `"text"`, wantErr: true},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := parseJSONResult([]byte(tt.input))
			if (err != nil) != tt.wantErr {
				t.Fatalf("error = %v, wantErr %v", err, tt.wantErr)
			}
			if !tt.wantErr && !json.Valid(got) {
				t.Errorf("result is not valid JSON: %s", got)
			}
		})
	}
}

func TestTruncateText(t *testing.T) {
	if got := truncateText("short", 20); got != "short" {
		t.Errorf("truncateText(short) = %q", got)
	}
	got := truncateText(strings.Repeat("x", 30), 10)
	if !strings.HasPrefix(got, strings.Repeat("x", 10)) || !strings.Contains(got, "truncated") {
		t.Errorf("truncateText(long) = %q", got)
	}
}

func TestNewJobID(t *testing.T) {
	first := newJobID()
	second := newJobID()
	if len(first) != 16 || len(second) != 16 {
		t.Errorf("ids = %q, %q", first, second)
	}
	if first == second {
		t.Error("job ids collided")
	}
}
