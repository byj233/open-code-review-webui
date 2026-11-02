// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

package console

import (
	"context"
	"net/http"
	"strings"
	"testing"
	"time"
)

func intPtr(value int) *int { return &value }

func validReviewRequest() reviewRequest {
	return reviewRequest{Concurrency: intPtr(8), Timeout: intPtr(15)}
}

func TestNormalizeReviewRequest(t *testing.T) {
	valid := []struct {
		name string
		req  reviewRequest
	}{
		{name: "workspace", req: validReviewRequest()},
		{name: "commit", req: reviewRequest{Mode: "commit", Commit: "HEAD~1", Concurrency: intPtr(4), Timeout: intPtr(0)}},
		{name: "range", req: reviewRequest{Mode: "range", From: "main", To: "feature/x", Concurrency: intPtr(8), Timeout: intPtr(15), Effort: "high"}},
		{name: "preview", req: reviewRequest{Preview: true, Concurrency: intPtr(8), Timeout: intPtr(15)}},
		{name: "resume", req: reviewRequest{Mode: "range", From: "main", To: "feature", Resume: "20250601-100000-abc123", Concurrency: intPtr(8), Timeout: intPtr(15)}},
	}
	for _, tt := range valid {
		t.Run(tt.name, func(t *testing.T) {
			if err := normalizeReviewRequest(&tt.req); err != nil {
				t.Fatalf("normalize: %v", err)
			}
		})
	}

	invalid := []struct {
		name string
		req  reviewRequest
	}{
		{name: "workspace with commit", req: reviewRequest{Commit: "abc", Concurrency: intPtr(8), Timeout: intPtr(15)}},
		{name: "commit without commit", req: reviewRequest{Mode: "commit", Concurrency: intPtr(8), Timeout: intPtr(15)}},
		{name: "commit with range", req: reviewRequest{Mode: "commit", Commit: "abc", From: "main", Concurrency: intPtr(8), Timeout: intPtr(15)}},
		{name: "range missing to", req: reviewRequest{Mode: "range", From: "main", Concurrency: intPtr(8), Timeout: intPtr(15)}},
		{name: "unknown mode", req: reviewRequest{Mode: "sideways", Concurrency: intPtr(8), Timeout: intPtr(15)}},
		{name: "ref starts with dash", req: reviewRequest{Mode: "commit", Commit: "-r", Concurrency: intPtr(8), Timeout: intPtr(15)}},
		{name: "ref range", req: reviewRequest{Mode: "commit", Commit: "a..b", Concurrency: intPtr(8), Timeout: intPtr(15)}},
		{name: "resume workspace", req: reviewRequest{Resume: "20250601-100000-abc123", Concurrency: intPtr(8), Timeout: intPtr(15)}},
		{name: "resume preview", req: reviewRequest{Mode: "range", From: "main", To: "feat", Resume: "20250601-100000-abc123", Preview: true, Concurrency: intPtr(8), Timeout: intPtr(15)}},
		{name: "bad resume id", req: reviewRequest{Mode: "range", From: "main", To: "feat", Resume: "../escape", Concurrency: intPtr(8), Timeout: intPtr(15)}},
		{name: "bad effort", req: reviewRequest{Effort: "extreme", Concurrency: intPtr(8), Timeout: intPtr(15)}},
		{name: "concurrency low", req: reviewRequest{Concurrency: intPtr(0), Timeout: intPtr(15)}},
		{name: "concurrency high", req: reviewRequest{Concurrency: intPtr(65), Timeout: intPtr(15)}},
		{name: "timeout high", req: reviewRequest{Concurrency: intPtr(8), Timeout: intPtr(1441)}},
		{name: "negative max tokens", req: reviewRequest{Concurrency: intPtr(8), Timeout: intPtr(15), MaxTokens: intPtr(-1)}},
		{name: "negative budget", req: reviewRequest{Concurrency: intPtr(8), Timeout: intPtr(15), MaxTokensBudget: intPtr(-1)}},
		{name: "bad provider", req: reviewRequest{Provider: "bad name", Concurrency: intPtr(8), Timeout: intPtr(15)}},
		{name: "model newline", req: reviewRequest{Model: "bad\nmodel", Concurrency: intPtr(8), Timeout: intPtr(15)}},
		{name: "long background", req: reviewRequest{Background: strings.Repeat("x", maxBackgroundChars+1), Concurrency: intPtr(8), Timeout: intPtr(15)}},
		{name: "long exclude", req: reviewRequest{Exclude: strings.Repeat("x", maxExcludeChars+1), Concurrency: intPtr(8), Timeout: intPtr(15)}},
	}
	for _, tt := range invalid {
		t.Run(tt.name, func(t *testing.T) {
			if err := normalizeReviewRequest(&tt.req); err == nil {
				t.Fatal("expected an error")
			}
		})
	}
}

func TestBuildReviewSpec(t *testing.T) {
	req := reviewRequest{
		Mode:            "range",
		From:            "main",
		To:              "feature/x",
		Background:      "rate limiting",
		Exclude:         "**/generated/*",
		Provider:        "anthropic",
		Model:           "claude-opus-4-6",
		Effort:          "high",
		Concurrency:     intPtr(4),
		Timeout:         intPtr(0),
		MaxTokens:       intPtr(32000),
		MaxTokensBudget: intPtr(100000),
		NoFilter:        true,
		Preview:         true,
	}
	spec, err := buildReviewSpec(req, "/tmp/repo")
	if err != nil {
		t.Fatalf("buildReviewSpec: %v", err)
	}
	joined := strings.Join(spec.Args, " ")
	for _, want := range []string{
		"review --format json --audience human",
		"--from main --to feature/x",
		"--background rate limiting",
		"--exclude **/generated/*",
		"--provider anthropic",
		"--model claude-opus-4-6",
		"--effort high",
		"--concurrency 4",
		"--timeout 0",
		"--max-tokens 32000",
		"--max-tokens-budget 100000",
		"--no-filter",
		"--preview",
	} {
		if !strings.Contains(joined, want) {
			t.Errorf("args missing %q: %s", want, joined)
		}
	}
	if spec.Kind != "review" || spec.Dir != "/tmp/repo" || !spec.ExpectJSON {
		t.Errorf("spec = %+v", spec)
	}
	if spec.Title != "Preview main..feature/x" {
		t.Errorf("title = %q", spec.Title)
	}

	commitSpec, err := buildReviewSpec(reviewRequest{
		Mode: "commit", Commit: "abcdef1234567890", Concurrency: intPtr(8), Timeout: intPtr(15),
	}, "/tmp/repo")
	if err != nil {
		t.Fatalf("commit spec: %v", err)
	}
	if !strings.Contains(strings.Join(commitSpec.Args, " "), "--commit abcdef1234567890") {
		t.Errorf("commit args = %v", commitSpec.Args)
	}
	if commitSpec.Title != "Review commit abcdef1234567890" {
		t.Errorf("commit title = %q", commitSpec.Title)
	}
}

func TestBuildReviewSpecRejectsInvalid(t *testing.T) {
	if _, err := buildReviewSpec(reviewRequest{Mode: "commit"}, "/tmp"); err == nil {
		t.Fatal("expected an error")
	}
}

func TestBuildScanSpec(t *testing.T) {
	req := scanRequest{
		Paths:           "src/,internal/agent",
		Background:      "audit",
		Exclude:         "**/vendor/*",
		Provider:        "openai",
		Model:           "gpt-5.4",
		Batch:           "by-language",
		Concurrency:     intPtr(6),
		Timeout:         intPtr(30),
		MaxTokens:       intPtr(40000),
		MaxTokensBudget: intPtr(900000),
		NoPlan:          true,
		NoDedup:         true,
		NoSummary:       true,
		Preview:         true,
	}
	spec, err := buildScanSpec(req, "/tmp/repo")
	if err != nil {
		t.Fatalf("buildScanSpec: %v", err)
	}
	joined := strings.Join(spec.Args, " ")
	for _, want := range []string{
		"scan --format json --audience human",
		"--path src/,internal/agent",
		"--background audit",
		"--exclude **/vendor/*",
		"--provider openai",
		"--model gpt-5.4",
		"--batch by-language",
		"--concurrency 6",
		"--timeout 30",
		"--max-tokens 40000",
		"--max-tokens-budget 900000",
		"--no-plan",
		"--no-dedup",
		"--no-summary",
		"--preview",
	} {
		if !strings.Contains(joined, want) {
			t.Errorf("args missing %q: %s", want, joined)
		}
	}
	if spec.Kind != "scan" || spec.Title != "Preview scan of selected paths" {
		t.Errorf("spec = %+v", spec)
	}
}

func TestNormalizeScanRequestValidation(t *testing.T) {
	invalid := []scanRequest{
		{Paths: "/absolute"},
		{Paths: "C:\\work\\repo"},
		{Paths: "../outside"},
		{Paths: "src/../outside"},
		{Paths: "-flag"},
		{Paths: "src, .."},
		{Batch: "by-topic"},
		{Concurrency: intPtr(0)},
		{Timeout: intPtr(2000)},
		{MaxTokens: intPtr(-1)},
		{Resume: "../escape"},
		{Preview: true, Resume: "20250601-100000-abc123"},
	}
	for i, req := range invalid {
		if err := normalizeScanRequest(&req); err == nil {
			t.Errorf("case %d: expected an error for %+v", i, req)
		}
	}
	valid := scanRequest{Paths: "src/, main.go, internal/agent", Batch: "by-directory", Concurrency: intPtr(8), Timeout: intPtr(15)}
	if err := normalizeScanRequest(&valid); err != nil {
		t.Errorf("valid scan rejected: %v", err)
	}
}

func TestStartReviewHandler(t *testing.T) {
	runner := &fakeRunner{run: func(context.Context, Spec, func(Stream, string)) RunResult {
		return RunResult{Stdout: []byte(`{"files":[],"total_files":0}`), ExitCode: 0}
	}}
	server, httpServer, _ := newTestServer(t, func(opts *Options) { opts.Runner = runner })
	res := doRequest(t, http.MethodPost, httpServer.URL+"/api/review", testToken, map[string]any{
		"mode":        "workspace",
		"preview":     true,
		"concurrency": 8,
		"timeout":     15,
	})
	if res.StatusCode != http.StatusAccepted {
		t.Fatalf("status = %d", res.StatusCode)
	}
	job := decodeJSON[JobSnapshot](t, res)
	waitJob(t, server.jobs, job.ID)

	res = doRequest(t, http.MethodPost, httpServer.URL+"/api/review", testToken, map[string]any{
		"mode": "commit",
	})
	if res.StatusCode != http.StatusBadRequest {
		t.Errorf("invalid review status = %d", res.StatusCode)
	}
	res.Body.Close()

	res = doRequest(t, http.MethodPost, httpServer.URL+"/api/review", testToken, "not json")
	if res.StatusCode != http.StatusBadRequest {
		t.Errorf("bad body status = %d", res.StatusCode)
	}
	res.Body.Close()
}

func TestStartScanHandler(t *testing.T) {
	runner := &fakeRunner{run: func(context.Context, Spec, func(Stream, string)) RunResult {
		return RunResult{Stdout: []byte(`{"files":[],"total_files":0}`), ExitCode: 0}
	}}
	server, httpServer, _ := newTestServer(t, func(opts *Options) { opts.Runner = runner })
	res := doRequest(t, http.MethodPost, httpServer.URL+"/api/scan", testToken, map[string]any{
		"paths":       "src/",
		"preview":     true,
		"concurrency": 8,
		"timeout":     15,
	})
	if res.StatusCode != http.StatusAccepted {
		t.Fatalf("status = %d", res.StatusCode)
	}
	job := decodeJSON[JobSnapshot](t, res)
	waitJob(t, server.jobs, job.ID)

	res = doRequest(t, http.MethodPost, httpServer.URL+"/api/scan", testToken, map[string]any{
		"paths": "../outside",
	})
	if res.StatusCode != http.StatusBadRequest {
		t.Errorf("invalid scan status = %d", res.StatusCode)
	}
	res.Body.Close()
}

func TestLLMTestHandler(t *testing.T) {
	runner := &fakeRunner{run: func(_ context.Context, spec Spec, onLine func(Stream, string)) RunResult {
		onLine(StreamStdout, "Connection test successful")
		return RunResult{Stdout: []byte("Connection test successful\n"), ExitCode: 0}
	}}
	server, httpServer, _ := newTestServer(t, func(opts *Options) { opts.Runner = runner })
	res := doRequest(t, http.MethodPost, httpServer.URL+"/api/llm/test", testToken, map[string]any{})
	if res.StatusCode != http.StatusAccepted {
		t.Fatalf("status = %d", res.StatusCode)
	}
	job := decodeJSON[JobSnapshot](t, res)
	finished := waitJob(t, server.jobs, job.ID)
	if finished.Status != StatusSucceeded {
		t.Errorf("status = %q", finished.Status)
	}
	if len(finished.Logs) != 1 {
		t.Errorf("logs = %d", len(finished.Logs))
	}
}

func TestReviewTitles(t *testing.T) {
	tests := []struct {
		req  reviewRequest
		want string
	}{
		{req: reviewRequest{Mode: "workspace"}, want: "Review workspace changes"},
		{req: reviewRequest{Mode: "commit", Commit: "abcdef"}, want: "Review commit abcdef"},
		{req: reviewRequest{Mode: "range", From: "main", To: "feat"}, want: "Review main..feat"},
		{req: reviewRequest{Mode: "workspace", Preview: true}, want: "Preview workspace changes"},
	}
	for _, tt := range tests {
		if got := reviewTitle(tt.req); got != tt.want {
			t.Errorf("reviewTitle(%+v) = %q, want %q", tt.req, got, tt.want)
		}
	}
	if got := scanTitle(scanRequest{}); got != "Scan repository" {
		t.Errorf("scanTitle = %q", got)
	}
	if got := scanTitle(scanRequest{Paths: "src"}); got != "Scan selected paths" {
		t.Errorf("scanTitle = %q", got)
	}
	if got := shortRef(strings.Repeat("a", 30)); !strings.HasSuffix(got, "...") {
		t.Errorf("shortRef = %q", got)
	}
}

func TestHandlerRejectsCrossOrigin(t *testing.T) {
	_, httpServer, _ := newTestServer(t, nil)
	req, _ := http.NewRequest(http.MethodPost, httpServer.URL+"/api/llm/test", strings.NewReader("{}"))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set(tokenHeader, testToken)
	req.Header.Set("Origin", "http://evil.example")
	res, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatal(err)
	}
	defer res.Body.Close()
	if res.StatusCode != http.StatusForbidden {
		t.Errorf("cross-origin status = %d", res.StatusCode)
	}
}

func TestStartReviewConflict(t *testing.T) {
	runner := &fakeRunner{run: func(ctx context.Context, _ Spec, _ func(Stream, string)) RunResult {
		<-ctx.Done()
		return RunResult{Err: ctx.Err(), ExitCode: -1}
	}}
	server, httpServer, _ := newTestServer(t, func(opts *Options) { opts.Runner = runner })
	blocking, err := server.jobs.Start(Spec{Kind: "review", Args: []string{"review"}})
	if err != nil {
		t.Fatal(err)
	}
	res := doRequest(t, http.MethodPost, httpServer.URL+"/api/review", testToken, map[string]any{
		"mode": "workspace", "concurrency": 8, "timeout": 15,
	})
	if res.StatusCode != http.StatusConflict {
		t.Errorf("conflict status = %d", res.StatusCode)
	}
	res.Body.Close()
	server.jobs.Cancel(blocking.ID)
	waitJob(t, server.jobs, blocking.ID)
}

func TestStartScanConflictAndBadBody(t *testing.T) {
	runner := &fakeRunner{run: func(ctx context.Context, _ Spec, _ func(Stream, string)) RunResult {
		<-ctx.Done()
		return RunResult{Err: ctx.Err(), ExitCode: -1}
	}}
	server, httpServer, _ := newTestServer(t, func(opts *Options) { opts.Runner = runner })
	blocking, err := server.jobs.Start(Spec{Kind: "scan", Args: []string{"scan"}})
	if err != nil {
		t.Fatal(err)
	}
	res := doRequest(t, http.MethodPost, httpServer.URL+"/api/scan", testToken, map[string]any{
		"paths": "src/", "concurrency": 8, "timeout": 15,
	})
	if res.StatusCode != http.StatusConflict {
		t.Errorf("scan conflict status = %d", res.StatusCode)
	}
	res.Body.Close()

	res = doRequest(t, http.MethodPost, httpServer.URL+"/api/scan", testToken, "not an object")
	if res.StatusCode != http.StatusBadRequest {
		t.Errorf("bad scan body status = %d", res.StatusCode)
	}
	res.Body.Close()
	server.jobs.Cancel(blocking.ID)
	waitJob(t, server.jobs, blocking.ID)
}

func TestLLMTestConflict(t *testing.T) {
	runner := &fakeRunner{run: func(ctx context.Context, _ Spec, _ func(Stream, string)) RunResult {
		<-ctx.Done()
		return RunResult{Err: ctx.Err(), ExitCode: -1}
	}}
	server, httpServer, _ := newTestServer(t, func(opts *Options) { opts.Runner = runner })
	blocking, err := server.jobs.Start(Spec{Kind: "llm-test", Args: []string{"llm", "test"}})
	if err != nil {
		t.Fatal(err)
	}
	res := doRequest(t, http.MethodPost, httpServer.URL+"/api/llm/test", testToken, map[string]any{})
	if res.StatusCode != http.StatusConflict {
		t.Errorf("llm conflict status = %d", res.StatusCode)
	}
	res.Body.Close()
	server.jobs.Cancel(blocking.ID)
	waitJob(t, server.jobs, blocking.ID)
}

func TestJobTimeoutDoesNotHang(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping timing test in short mode")
	}
	runner := &fakeRunner{run: func(ctx context.Context, _ Spec, _ func(Stream, string)) RunResult {
		select {
		case <-ctx.Done():
			return RunResult{Err: ctx.Err(), ExitCode: -1}
		case <-time.After(50 * time.Millisecond):
			return RunResult{ExitCode: 0}
		}
	}}
	server, _, _ := newTestServer(t, func(opts *Options) { opts.Runner = runner })
	job, err := server.jobs.Start(Spec{Kind: "review", Args: []string{"review"}})
	if err != nil {
		t.Fatal(err)
	}
	finished := waitJob(t, server.jobs, job.ID)
	if finished.Status != StatusSucceeded {
		t.Errorf("status = %q", finished.Status)
	}
}
