// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

package console

import (
	"context"
	"net/http"
	"path/filepath"
	"testing"
	"time"
)

func TestRepoOpenSwitchesRepository(t *testing.T) {
	server, httpServer, _ := newTestServer(t, nil)
	target := newGitRepo(t)

	res := doRequest(t, http.MethodPost, httpServer.URL+"/api/repo/open", testToken, map[string]string{"path": target})
	if res.StatusCode != http.StatusOK {
		t.Fatalf("status = %d, want %d", res.StatusCode, http.StatusOK)
	}
	repo := decodeJSON[RepoInfo](t, res)
	if !samePath(repo.Path, target) || !repo.IsGit {
		t.Errorf("opened repo = %+v, want %s", repo, target)
	}
	if !samePath(server.repoRoot(), target) {
		t.Errorf("server repo = %q, want %q", server.repoRoot(), target)
	}

	res = doRequest(t, http.MethodGet, httpServer.URL+"/api/meta", "", nil)
	meta := decodeJSON[metaResponse](t, res)
	if !samePath(meta.Repo.Path, target) {
		t.Errorf("meta repo = %q, want %q", meta.Repo.Path, target)
	}

	res = doRequest(t, http.MethodGet, httpServer.URL+"/api/repo", "", nil)
	current := decodeJSON[RepoInfo](t, res)
	if !samePath(current.Path, target) {
		t.Errorf("repo endpoint = %q, want %q", current.Path, target)
	}
}

func TestRepoOpenRejectsInvalidPath(t *testing.T) {
	_, httpServer, _ := newTestServer(t, nil)

	cases := []struct {
		name string
		body map[string]string
	}{
		{name: "missing", body: map[string]string{}},
		{name: "blank", body: map[string]string{"path": "   "}},
		{name: "nonexistent", body: map[string]string{"path": filepath.Join(t.TempDir(), "missing")}},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			res := doRequest(t, http.MethodPost, httpServer.URL+"/api/repo/open", testToken, tc.body)
			if res.StatusCode != http.StatusBadRequest {
				t.Fatalf("status = %d, want %d", res.StatusCode, http.StatusBadRequest)
			}
		})
	}
}

func TestRepoOpenAcceptsNonGitDirectory(t *testing.T) {
	server, httpServer, _ := newTestServer(t, nil)
	target := t.TempDir()

	res := doRequest(t, http.MethodPost, httpServer.URL+"/api/repo/open", testToken, map[string]string{"path": target})
	if res.StatusCode != http.StatusOK {
		t.Fatalf("status = %d, want %d", res.StatusCode, http.StatusOK)
	}
	repo := decodeJSON[RepoInfo](t, res)
	if repo.IsGit || !samePath(server.repoRoot(), target) {
		t.Errorf("repo = %+v, server repo = %q", repo, server.repoRoot())
	}
}

func TestRepoOpenRejectsRunningJob(t *testing.T) {
	server, httpServer, runner := newTestServer(t, nil)
	release := make(chan struct{})
	finished := make(chan struct{})
	runner.run = func(ctx context.Context, spec Spec, onLine func(Stream, string)) RunResult {
		defer close(finished)
		<-release
		return RunResult{ExitCode: 0}
	}

	if _, err := server.jobs.Start(Spec{Kind: "review", Args: []string{"review"}, Dir: server.repoRoot()}); err != nil {
		t.Fatalf("start job: %v", err)
	}

	res := doRequest(t, http.MethodPost, httpServer.URL+"/api/repo/open", testToken, map[string]string{"path": t.TempDir()})
	if res.StatusCode != http.StatusConflict {
		t.Fatalf("status = %d, want %d", res.StatusCode, http.StatusConflict)
	}

	close(release)
	select {
	case <-finished:
	case <-time.After(5 * time.Second):
		t.Fatal("job did not finish")
	}
}
