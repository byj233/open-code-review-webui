// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

package console

import (
	"context"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"sync"
	"testing"

	"github.com/alibaba/open-code-review/internal/model"
	"github.com/alibaba/open-code-review/internal/session"
)

const testToken = "test-console-token"

type fakeRunner struct {
	mu    sync.Mutex
	specs []Spec
	run   func(context.Context, Spec, func(Stream, string)) RunResult
}

func (f *fakeRunner) Run(ctx context.Context, spec Spec, onLine func(Stream, string)) RunResult {
	f.mu.Lock()
	f.specs = append(f.specs, spec)
	run := f.run
	f.mu.Unlock()
	if run != nil {
		return run(ctx, spec, onLine)
	}
	return RunResult{ExitCode: 0}
}

func (f *fakeRunner) calls() []Spec {
	f.mu.Lock()
	defer f.mu.Unlock()
	return append([]Spec(nil), f.specs...)
}

func (f *fakeRunner) reset() {
	f.mu.Lock()
	defer f.mu.Unlock()
	f.specs = nil
}

func (f *fakeRunner) callArgs() [][]string {
	calls := f.calls()
	out := make([][]string, 0, len(calls))
	for _, call := range calls {
		out = append(out, call.Args)
	}
	return out
}

type fakeSessionStore struct {
	list      []session.Summary
	listErr   error
	summary   *session.Summary
	items     []session.ItemDetail
	comments  []model.LlmComment
	detailErr error
	commentEr error
	deleteErr error
	deleted   []string
}

func (f *fakeSessionStore) List(string) ([]session.Summary, error) {
	return f.list, f.listErr
}

func (f *fakeSessionStore) Detail(_, _ string) (*session.Summary, []session.ItemDetail, error) {
	return f.summary, f.items, f.detailErr
}

func (f *fakeSessionStore) Comments(_, _ string) ([]model.LlmComment, error) {
	return f.comments, f.commentEr
}

func (f *fakeSessionStore) Delete(_ string, sessionID string) error {
	if f.deleteErr != nil {
		return f.deleteErr
	}
	f.deleted = append(f.deleted, sessionID)
	return nil
}

func newTestServer(t *testing.T, configure func(*Options)) (*Server, *httptest.Server, *fakeRunner) {
	t.Helper()
	home := t.TempDir()
	t.Setenv("HOME", home)
	t.Setenv("USERPROFILE", home)
	runner := &fakeRunner{}
	sessions := &fakeSessionStore{}
	opts := Options{
		RepoDir:    t.TempDir(),
		Version:    "test-version",
		ConfigPath: filepath.Join(home, ".opencodereview", "config.json"),
		Runner:     runner,
		Sessions:   sessions,
		Out:        io.Discard,
	}
	if configure != nil {
		configure(&opts)
	}
	server, err := New(opts)
	if err != nil {
		t.Fatalf("New: %v", err)
	}
	server.token = testToken
	server.handler = server.routes()
	httpServer := httptest.NewServer(server.handler)
	t.Cleanup(httpServer.Close)
	return server, httpServer, runner
}

func doRequest(t *testing.T, method, url, token string, body any) *http.Response {
	t.Helper()
	var reader io.Reader
	if body != nil {
		data, err := json.Marshal(body)
		if err != nil {
			t.Fatalf("marshal body: %v", err)
		}
		reader = strings.NewReader(string(data))
	}
	req, err := http.NewRequest(method, url, reader)
	if err != nil {
		t.Fatalf("new request: %v", err)
	}
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}
	if token != "" {
		req.Header.Set(tokenHeader, token)
	}
	res, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatalf("%s %s: %v", method, url, err)
	}
	return res
}

func decodeJSON[T any](t *testing.T, res *http.Response) T {
	t.Helper()
	defer res.Body.Close()
	var value T
	if err := json.NewDecoder(res.Body).Decode(&value); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	return value
}

func writeConfig(t *testing.T, path, body string) {
	t.Helper()
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		t.Fatalf("mkdir config dir: %v", err)
	}
	if err := os.WriteFile(path, []byte(body), 0o600); err != nil {
		t.Fatalf("write config: %v", err)
	}
}

func gitAvailable() bool {
	_, err := exec.LookPath("git")
	return err == nil
}

func runGit(t *testing.T, dir string, args ...string) string {
	t.Helper()
	cmd := exec.Command("git", args...)
	cmd.Dir = dir
	output, err := cmd.CombinedOutput()
	if err != nil {
		t.Fatalf("git %s: %v\n%s", strings.Join(args, " "), err, output)
	}
	return strings.TrimSpace(string(output))
}

func newGitRepo(t *testing.T) string {
	t.Helper()
	if !gitAvailable() {
		t.Skip("git is not installed")
	}
	dir := t.TempDir()
	runGit(t, dir, "init", "-q")
	runGit(t, dir, "config", "user.email", "console@example.com")
	runGit(t, dir, "config", "user.name", "Console Test")
	if err := os.WriteFile(filepath.Join(dir, "main.go"), []byte("package main\n\nfunc main() {}\n"), 0o644); err != nil {
		t.Fatalf("write tracked file: %v", err)
	}
	runGit(t, dir, "add", ".")
	runGit(t, dir, "commit", "-q", "-m", "Initial commit")
	return dir
}
