// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

package console

import (
	"bytes"
	"context"
	"encoding/json"
	"io"
	"net"
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"strings"
	"testing"
	"testing/fstest"
	"time"
)

func TestNewDefaults(t *testing.T) {
	home := t.TempDir()
	t.Setenv("HOME", home)
	t.Setenv("USERPROFILE", home)
	server, err := New(Options{
		RepoDir:  t.TempDir(),
		Runner:   &fakeRunner{},
		Sessions: &fakeSessionStore{},
	})
	if err != nil {
		t.Fatalf("New: %v", err)
	}
	if server.version != "dev" || server.addr != defaultAddr {
		t.Errorf("version/addr = %q/%q", server.version, server.addr)
	}
	if !strings.HasPrefix(server.configPath, home) {
		t.Errorf("configPath = %q, want under %q", server.configPath, home)
	}
	if len(server.token) < 32 {
		t.Errorf("token length = %d", len(server.token))
	}
	if server.Handler() == nil {
		t.Error("Handler() = nil")
	}
}

func TestNewRejectsInvalidRepo(t *testing.T) {
	home := t.TempDir()
	t.Setenv("HOME", home)
	t.Setenv("USERPROFILE", home)
	if _, err := New(Options{
		RepoDir:  filepath.Join(t.TempDir(), "missing"),
		Runner:   &fakeRunner{},
		Sessions: &fakeSessionStore{},
	}); err == nil {
		t.Fatal("New accepted a missing repository")
	}
}

func TestHealthMetaAndRepo(t *testing.T) {
	server, httpServer, _ := newTestServer(t, nil)

	res := doRequest(t, http.MethodGet, httpServer.URL+"/api/health", "", nil)
	health := decodeJSON[map[string]any](t, res)
	if health["ok"] != true || health["version"] != "test-version" {
		t.Errorf("health = %+v", health)
	}

	res = doRequest(t, http.MethodGet, httpServer.URL+"/api/meta", "", nil)
	meta := decodeJSON[metaResponse](t, res)
	if meta.Version != "test-version" || len(meta.Efforts) != 3 {
		t.Errorf("meta = %+v", meta)
	}
	if !samePath(meta.Repo.Path, server.repoDir) {
		t.Errorf("meta repo = %q, want %q", meta.Repo.Path, server.repoDir)
	}
	if meta.Defaults.Concurrency != 8 || meta.Defaults.Timeout != 15 {
		t.Errorf("defaults = %+v", meta.Defaults)
	}

	res = doRequest(t, http.MethodGet, httpServer.URL+"/api/repo", "", nil)
	repo := decodeJSON[RepoInfo](t, res)
	if !samePath(repo.Path, server.repoDir) {
		t.Errorf("repo path = %q", repo.Path)
	}

	res = doRequest(t, http.MethodGet, httpServer.URL+"/api/config", "", nil)
	config := decodeJSON[configView](t, res)
	if config.Path == "" || config.Active.Source != "none" {
		t.Errorf("config view = %+v", config)
	}
	res = doRequest(t, http.MethodGet, httpServer.URL+"/api/providers", "", nil)
	providers := decodeJSON[providersResponse](t, res)
	if providers.Providers == nil || providers.Custom == nil || len(providers.Providers) == 0 {
		t.Errorf("providers view = %+v", providers)
	}
}

func TestSecurityHeadersAndHostGuard(t *testing.T) {
	_, httpServer, _ := newTestServer(t, nil)
	res := doRequest(t, http.MethodGet, httpServer.URL+"/api/health", "", nil)
	defer res.Body.Close()
	if !strings.Contains(res.Header.Get("Content-Security-Policy"), "default-src 'self'") {
		t.Errorf("CSP = %q", res.Header.Get("Content-Security-Policy"))
	}
	if res.Header.Get("X-Frame-Options") != "DENY" || res.Header.Get("X-Content-Type-Options") != "nosniff" {
		t.Errorf("missing security headers: %v", res.Header)
	}

	req, _ := http.NewRequest(http.MethodGet, httpServer.URL+"/api/health", nil)
	req.Host = "evil.example"
	bad, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatal(err)
	}
	defer bad.Body.Close()
	if bad.StatusCode != http.StatusForbidden {
		t.Errorf("forbidden-host status = %d", bad.StatusCode)
	}
}

func TestTokenAndOriginChecks(t *testing.T) {
	_, httpServer, _ := newTestServer(t, nil)
	body := map[string]any{"set": map[string]string{"language": "English"}}

	res := doRequest(t, http.MethodPost, httpServer.URL+"/api/config/apply", "", body)
	if res.StatusCode != http.StatusForbidden {
		t.Errorf("missing token status = %d", res.StatusCode)
	}
	res.Body.Close()

	res = doRequest(t, http.MethodPost, httpServer.URL+"/api/config/apply", "wrong", body)
	if res.StatusCode != http.StatusForbidden {
		t.Errorf("wrong token status = %d", res.StatusCode)
	}
	res.Body.Close()

	res = doRequest(t, http.MethodPost, httpServer.URL+"/api/config/apply", testToken, body)
	if res.StatusCode != http.StatusOK {
		t.Errorf("valid token status = %d", res.StatusCode)
	}
	res.Body.Close()

	host := strings.TrimPrefix(httpServer.URL, "http://")
	req, _ := http.NewRequest(http.MethodPost, httpServer.URL+"/api/config/apply", strings.NewReader(`{"set":{"language":"English"}}`))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set(tokenHeader, testToken)
	req.Header.Set("Origin", "http://"+host)
	res, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatal(err)
	}
	if res.StatusCode != http.StatusOK {
		t.Errorf("same-origin status = %d", res.StatusCode)
	}
	res.Body.Close()

	req, _ = http.NewRequest(http.MethodPost, httpServer.URL+"/api/config/apply", strings.NewReader(`{"set":{"language":"English"}}`))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set(tokenHeader, testToken)
	req.Header.Set("Origin", "http://evil.example")
	res, err = http.DefaultClient.Do(req)
	if err != nil {
		t.Fatal(err)
	}
	if res.StatusCode != http.StatusForbidden {
		t.Errorf("cross-origin status = %d", res.StatusCode)
	}
	res.Body.Close()
}

func TestJobRoutesAndEvents(t *testing.T) {
	runner := &fakeRunner{run: func(_ context.Context, _ Spec, onLine func(Stream, string)) RunResult {
		onLine(StreamStderr, "[ocr] done")
		return RunResult{Stdout: []byte(`{"files":[],"total_files":0}`), ExitCode: 0}
	}}
	server, httpServer, _ := newTestServer(t, func(opts *Options) { opts.Runner = runner })
	started, err := server.jobs.Start(Spec{Kind: "scan", Title: "Scan demo", Args: []string{"scan"}, ExpectJSON: true})
	if err != nil {
		t.Fatal(err)
	}
	waitJob(t, server.jobs, started.ID)

	res := doRequest(t, http.MethodGet, httpServer.URL+"/api/jobs", "", nil)
	jobs := decodeJSON[map[string]json.RawMessage](t, res)
	var list []JobSnapshot
	if err := json.Unmarshal(jobs["jobs"], &list); err != nil {
		t.Fatalf("decode jobs: %v", err)
	}
	if len(list) != 1 || list[0].ID != started.ID {
		t.Errorf("jobs = %+v", list)
	}

	res = doRequest(t, http.MethodGet, httpServer.URL+"/api/jobs/"+started.ID, "", nil)
	job := decodeJSON[JobSnapshot](t, res)
	if len(job.Logs) != 1 || job.Result == nil {
		t.Errorf("job = %+v", job)
	}

	res = doRequest(t, http.MethodGet, httpServer.URL+"/api/jobs/missing", "", nil)
	if res.StatusCode != http.StatusNotFound {
		t.Errorf("missing job status = %d", res.StatusCode)
	}
	res.Body.Close()

	res = doRequest(t, http.MethodPost, httpServer.URL+"/api/jobs/missing/cancel", testToken, map[string]any{})
	if res.StatusCode != http.StatusNotFound {
		t.Errorf("missing cancel status = %d", res.StatusCode)
	}
	res.Body.Close()

	res = doRequest(t, http.MethodPost, httpServer.URL+"/api/jobs/"+started.ID+"/cancel", testToken, map[string]any{})
	if res.StatusCode != http.StatusOK {
		t.Errorf("finished cancel status = %d", res.StatusCode)
	}
	res.Body.Close()

	res, err = http.Get(httpServer.URL + "/api/jobs/" + started.ID + "/events")
	if err != nil {
		t.Fatalf("events: %v", err)
	}
	defer res.Body.Close()
	eventBody, _ := io.ReadAll(res.Body)
	events := string(eventBody)
	if !strings.Contains(events, "event: job") || !strings.Contains(events, "event: done") {
		t.Errorf("events = %q", events)
	}
	if !strings.Contains(events, `"total_files":0`) {
		t.Errorf("events missing result: %q", events)
	}
}

func TestCancelJobRoute(t *testing.T) {
	release := make(chan struct{})
	runner := &fakeRunner{run: func(ctx context.Context, _ Spec, _ func(Stream, string)) RunResult {
		select {
		case <-release:
			return RunResult{ExitCode: 0}
		case <-ctx.Done():
			return RunResult{Err: ctx.Err(), ExitCode: -1}
		}
	}}
	server, httpServer, _ := newTestServer(t, func(opts *Options) { opts.Runner = runner })
	started, err := server.jobs.Start(Spec{Kind: "review", Args: []string{"review"}})
	if err != nil {
		t.Fatal(err)
	}
	res := doRequest(t, http.MethodPost, httpServer.URL+"/api/jobs/"+started.ID+"/cancel", testToken, map[string]any{})
	if res.StatusCode != http.StatusAccepted {
		t.Errorf("cancel status = %d", res.StatusCode)
	}
	res.Body.Close()
	finished := waitJob(t, server.jobs, started.ID)
	if finished.Status != StatusCanceled {
		t.Errorf("status = %q", finished.Status)
	}
	close(release)
}

func TestAssetContentType(t *testing.T) {
	tests := map[string]string{
		"app.js":          "text/javascript; charset=utf-8",
		"app.mjs":         "text/javascript; charset=utf-8",
		"style.css":       "text/css; charset=utf-8",
		"logo.svg":        "image/svg+xml",
		"data.json":       "application/json; charset=utf-8",
		"font.woff2":      "font/woff2",
		"unknown.ocrtest": "application/octet-stream",
	}
	for name, want := range tests {
		if got := assetContentType(name); got != want {
			t.Errorf("assetContentType(%q) = %q, want %q", name, got, want)
		}
	}
}

func TestUnknownAPIReturnsJSON(t *testing.T) {
	_, httpServer, _ := newTestServer(t, nil)
	for _, method := range []string{http.MethodGet, http.MethodPost} {
		token := ""
		if method == http.MethodPost {
			token = testToken
		}
		path := "/api/does-not-exist"
		if method == http.MethodGet {
			path = "/api"
		}
		res := doRequest(t, method, httpServer.URL+path, token, nil)
		if res.StatusCode != http.StatusNotFound {
			t.Errorf("%s unknown API status = %d", method, res.StatusCode)
		}
		var payload map[string]string
		if err := json.NewDecoder(res.Body).Decode(&payload); err != nil {
			t.Errorf("%s unknown API body is not JSON: %v", method, err)
		}
		res.Body.Close()
	}
}

func TestStaticHandlers(t *testing.T) {
	server := &Server{
		token: "tok-123",
		assets: fstest.MapFS{
			"index.html":    &fstest.MapFile{Data: []byte(`<html><head><meta name="ocr-console-token" content="__OCR_CONSOLE_TOKEN__" /></head><body>app</body></html>`)},
			"favicon.svg":   &fstest.MapFile{Data: []byte("<svg/>")},
			"assets/app.js": &fstest.MapFile{Data: []byte("console.log(1)")},
		},
	}

	rec := httptest.NewRecorder()
	server.handleSPA(rec, httptest.NewRequest(http.MethodGet, "/sessions", nil))
	if !strings.Contains(rec.Body.String(), "tok-123") || !strings.Contains(rec.Body.String(), "<body>app</body>") {
		t.Errorf("SPA body = %q", rec.Body.String())
	}
	if rec.Header().Get("Cache-Control") != "no-store" {
		t.Errorf("index cache = %q", rec.Header().Get("Cache-Control"))
	}

	rec = httptest.NewRecorder()
	server.handleSPA(rec, httptest.NewRequest(http.MethodGet, "/favicon.svg", nil))
	if rec.Body.String() != "<svg/>" {
		t.Errorf("favicon body = %q", rec.Body.String())
	}

	rec = httptest.NewRecorder()
	server.handleAsset(rec, httptest.NewRequest(http.MethodGet, "/assets/app.js", nil))
	if rec.Code != http.StatusOK || rec.Body.String() != "console.log(1)" {
		t.Errorf("asset = %d, %q", rec.Code, rec.Body.String())
	}
	if !strings.Contains(rec.Header().Get("Cache-Control"), "immutable") {
		t.Errorf("asset cache = %q", rec.Header().Get("Cache-Control"))
	}

	rec = httptest.NewRecorder()
	server.handleAsset(rec, httptest.NewRequest(http.MethodGet, "/assets/missing.js", nil))
	if rec.Code != http.StatusNotFound {
		t.Errorf("missing asset = %d", rec.Code)
	}

	rec = httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/assets/../secret", nil)
	req.URL.Path = "/assets/../secret"
	server.handleAsset(rec, req)
	if rec.Code != http.StatusNotFound {
		t.Errorf("traversal asset = %d", rec.Code)
	}

	empty := &Server{token: "tok", assets: fstest.MapFS{}}
	rec = httptest.NewRecorder()
	empty.serveIndex(rec)
	if !strings.Contains(rec.Body.String(), "Console assets are not built yet") {
		t.Errorf("fallback body = %q", rec.Body.String())
	}

	noPlaceholder := &Server{
		assets: fstest.MapFS{"index.html": &fstest.MapFile{Data: []byte("<html><head></head><body></body></html>")}},
		token:  "injected",
	}
	rec = httptest.NewRecorder()
	noPlaceholder.serveIndex(rec)
	if !strings.Contains(rec.Body.String(), `content="injected"`) {
		t.Errorf("token was not injected: %q", rec.Body.String())
	}
}

func TestJobEventsErrors(t *testing.T) {
	server, httpServer, _ := newTestServer(t, nil)
	res := doRequest(t, http.MethodGet, httpServer.URL+"/api/jobs/missing/events", "", nil)
	if res.StatusCode != http.StatusNotFound {
		t.Errorf("missing events status = %d", res.StatusCode)
	}
	res.Body.Close()

	job, err := server.jobs.Start(Spec{Kind: "review", Args: []string{"review"}})
	if err != nil {
		t.Fatal(err)
	}
	waitJob(t, server.jobs, job.ID)

	req := httptest.NewRequest(http.MethodGet, "/api/jobs/"+job.ID+"/events", nil)
	req.SetPathValue("id", job.ID)
	rec := &flushlessResponseWriter{header: http.Header{}}
	server.handleJobEvents(rec, req)
	if rec.status != http.StatusInternalServerError {
		t.Errorf("flushless status = %d", rec.status)
	}
}

type flushlessResponseWriter struct {
	header http.Header
	status int
	body   bytes.Buffer
}

func (w *flushlessResponseWriter) Header() http.Header { return w.header }

func (w *flushlessResponseWriter) Write(data []byte) (int, error) {
	if w.status == 0 {
		w.status = http.StatusOK
	}
	return w.body.Write(data)
}

func (w *flushlessResponseWriter) WriteHeader(status int) { w.status = status }

func TestTerminalStatuses(t *testing.T) {
	for _, status := range []string{StatusRunning, StatusSucceeded, StatusFailed, StatusCanceled, StatusCanceling} {
		snapshot := JobSnapshot{Status: status}
		want := status == StatusSucceeded || status == StatusFailed || status == StatusCanceled
		if got := snapshot.Terminal(); got != want {
			t.Errorf("Terminal(%q) = %v, want %v", status, got, want)
		}
	}
}

func TestPruneKeepsRunningJobs(t *testing.T) {
	release := make(chan struct{})
	runner := &fakeRunner{run: func(ctx context.Context, _ Spec, _ func(Stream, string)) RunResult {
		select {
		case <-release:
			return RunResult{ExitCode: 0}
		case <-ctx.Done():
			return RunResult{Err: ctx.Err(), ExitCode: -1}
		}
	}}
	jobs := NewJobs(runner, t.TempDir())
	jobs.max = 1
	first, _ := jobs.Start(Spec{Kind: "first", Args: []string{"review"}})
	second, _ := jobs.Start(Spec{Kind: "second", Args: []string{"scan"}})
	if _, ok := jobs.Get(first.ID); !ok {
		t.Error("running job was pruned")
	}
	if _, ok := jobs.Get(second.ID); !ok {
		t.Error("running job was pruned")
	}
	jobs.Cancel(first.ID)
	jobs.Cancel(second.ID)
	waitJob(t, jobs, first.ID)
	waitJob(t, jobs, second.ID)
	close(release)
}

func TestHostGuardEmptyHost(t *testing.T) {
	handler := hostGuard(map[string]struct{}{"allowed.example": {}}, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	req.Host = ""
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)
	if rec.Code != http.StatusForbidden {
		t.Errorf("empty host status = %d", rec.Code)
	}

	req = httptest.NewRequest(http.MethodGet, "/", nil)
	req.Host = "allowed.example:8080"
	rec = httptest.NewRecorder()
	handler.ServeHTTP(rec, req)
	if rec.Code != http.StatusOK {
		t.Errorf("allowed host status = %d", rec.Code)
	}
}

func TestHelpers(t *testing.T) {
	if !sameOrigin("http://localhost:5484", "localhost:5484") || !sameOrigin("https://localhost:5484", "localhost:5484") {
		t.Error("sameOrigin rejected a matching host")
	}
	if sameOrigin("http://evil.example", "localhost:5484") || sameOrigin("::bad", "localhost") {
		t.Error("sameOrigin accepted a mismatched origin")
	}

	hosts := map[string]string{
		"localhost:5484": "localhost",
		"[::1]:5484":     "::1",
		"[::1]":          "::1",
		"example.com":    "example.com",
		"a:b:c":          "",
		"":               "",
	}
	for input, want := range hosts {
		if got := hostOnly(input); got != want {
			t.Errorf("hostOnly(%q) = %q, want %q", input, got, want)
		}
	}

	for _, host := range []string{"localhost", "127.0.0.1", "127.0.0.9", "::1"} {
		if !isLoopbackHost(host) {
			t.Errorf("isLoopbackHost(%q) = false", host)
		}
	}
	if isLoopbackHost("example.com") {
		t.Error("isLoopbackHost(example.com) = true")
	}

	t.Setenv(envAllowedHosts, "box.local, 192.168.1.5")
	allowed := buildAllowedHosts("10.0.0.4")
	for _, host := range []string{"localhost", "127.0.0.1", "10.0.0.4", "box.local", "192.168.1.5"} {
		if _, ok := allowed[host]; !ok {
			t.Errorf("allowed hosts missing %q: %v", host, allowed)
		}
	}
	wildcard := buildAllowedHosts("0.0.0.0")
	if _, ok := wildcard["0.0.0.0"]; ok {
		t.Error("wildcard bind host was added to the allowlist")
	}

	if got := splitBindHost("localhost:5484"); got != "localhost" {
		t.Errorf("splitBindHost = %q", got)
	}
	if got := splitBindHost("localhost"); got != "localhost" {
		t.Errorf("splitBindHost(no port) = %q", got)
	}
	if got := displayAddrHost(""); got != "localhost" {
		t.Errorf("displayAddrHost(empty) = %q", got)
	}
	if got := displayAddrHost("::1"); got != "::1" {
		t.Errorf("displayAddrHost(::1) = %q", got)
	}
}

func TestDefaultConfigPath(t *testing.T) {
	home := t.TempDir()
	t.Setenv("HOME", home)
	t.Setenv("USERPROFILE", home)
	path, err := defaultConfigPath()
	if err != nil {
		t.Fatalf("defaultConfigPath: %v", err)
	}
	if !strings.HasPrefix(path, home) || !strings.HasSuffix(path, filepath.Join(".opencodereview", "config.json")) {
		t.Errorf("path = %q", path)
	}
}

func TestTokensAreUnique(t *testing.T) {
	first := newToken()
	second := newToken()
	if len(first) != 48 || len(second) != 48 {
		t.Errorf("token lengths = %d, %d", len(first), len(second))
	}
	if first == second {
		t.Error("tokens collided")
	}
}

func TestStartServerLifecycle(t *testing.T) {
	home := t.TempDir()
	t.Setenv("HOME", home)
	t.Setenv("USERPROFILE", home)
	repo := newGitRepo(t)
	configPath := filepath.Join(home, ".opencodereview", "config.json")
	runner := &fakeRunner{}
	store := &fakeSessionStore{}
	ln, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatal(err)
	}
	addr := ln.Addr().String()
	var out bytes.Buffer
	errCh := make(chan error, 1)
	go func() {
		errCh <- startServer(Options{
			Addr:       addr,
			Open:       "never",
			RepoDir:    repo,
			Version:    "startup-test",
			ConfigPath: configPath,
			Runner:     runner,
			Sessions:   store,
			Out:        &out,
		}, ln)
	}()

	url := "http://" + addr
	deadline := time.Now().Add(5 * time.Second)
	var health *http.Response
	for time.Now().Before(deadline) {
		health, err = http.Get(url + "/api/health")
		if err == nil {
			break
		}
		time.Sleep(20 * time.Millisecond)
	}
	if err != nil {
		t.Fatalf("server did not become ready: %v", err)
	}
	health.Body.Close()

	ln.Close()
	select {
	case <-errCh:
	case <-time.After(5 * time.Second):
		t.Fatal("startServer did not return after the listener closed")
	}
	if !strings.Contains(out.String(), "Web Console ready: "+url) {
		t.Errorf("ready output = %q", out.String())
	}
}

func TestStartServerAutoOpen(t *testing.T) {
	home := t.TempDir()
	t.Setenv("HOME", home)
	t.Setenv("USERPROFILE", home)
	ln, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatal(err)
	}
	opened := make(chan string, 1)
	errCh := make(chan error, 1)
	go func() {
		errCh <- startServer(Options{
			Addr:       ln.Addr().String(),
			Open:       "always",
			RepoDir:    t.TempDir(),
			ConfigPath: filepath.Join(home, "config.json"),
			Runner:     &fakeRunner{},
			Sessions:   &fakeSessionStore{},
			Out:        io.Discard,
			ShouldAutoOpen: func(string) (bool, string) {
				return true, ""
			},
			OpenBrowser: func(url string) error {
				opened <- url
				return nil
			},
		}, ln)
	}()
	select {
	case got := <-opened:
		if !strings.HasPrefix(got, "http://") {
			t.Errorf("opened URL = %q", got)
		}
	case <-time.After(5 * time.Second):
		t.Fatal("browser opener was not called")
	}
	ln.Close()
	select {
	case <-errCh:
	case <-time.After(5 * time.Second):
		t.Fatal("startServer did not return")
	}
}

func TestStartServerSuppressedOpenAndErrors(t *testing.T) {
	home := t.TempDir()
	t.Setenv("HOME", home)
	t.Setenv("USERPROFILE", home)
	ln, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatal(err)
	}
	addr := ln.Addr().String()
	var out bytes.Buffer
	errCh := make(chan error, 1)
	go func() {
		errCh <- startServer(Options{
			Addr:       addr,
			Open:       "auto",
			RepoDir:    t.TempDir(),
			ConfigPath: filepath.Join(home, "config.json"),
			Runner:     &fakeRunner{},
			Sessions:   &fakeSessionStore{},
			Out:        &out,
			ShouldAutoOpen: func(string) (bool, string) {
				return false, "no display"
			},
		}, ln)
	}()
	readyDeadline := time.Now().Add(5 * time.Second)
	for time.Now().Before(readyDeadline) {
		res, err := http.Get("http://" + addr + "/api/health")
		if err == nil {
			res.Body.Close()
			break
		}
		time.Sleep(20 * time.Millisecond)
	}
	ln.Close()
	select {
	case <-errCh:
	case <-time.After(5 * time.Second):
		t.Fatal("startServer did not return")
	}
	if !strings.Contains(out.String(), "browser not opened: no display") {
		t.Errorf("output = %q", out.String())
	}

	badDir := filepath.Join(t.TempDir(), "missing")
	if err := StartServer(Options{
		Addr:       "127.0.0.1:0",
		Open:       "never",
		RepoDir:    badDir,
		ConfigPath: filepath.Join(home, "config.json"),
		Runner:     &fakeRunner{},
		Sessions:   &fakeSessionStore{},
	}); err == nil {
		t.Error("StartServer accepted a missing repo")
	}

	if err := StartServer(Options{
		Addr:       "127.0.0.1:0",
		Open:       "sometimes",
		RepoDir:    t.TempDir(),
		ConfigPath: filepath.Join(home, "config.json"),
		Runner:     &fakeRunner{},
		Sessions:   &fakeSessionStore{},
	}); err == nil {
		t.Error("StartServer accepted an invalid open mode")
	}

	if err := StartServer(Options{
		Addr:       "bad::addr",
		Open:       "never",
		RepoDir:    t.TempDir(),
		ConfigPath: filepath.Join(home, "config.json"),
		Runner:     &fakeRunner{},
		Sessions:   &fakeSessionStore{},
	}); err == nil {
		t.Error("StartServer accepted an invalid listen address")
	}
}

func TestReadJSONRejectsTrailingObjects(t *testing.T) {
	_, httpServer, _ := newTestServer(t, nil)
	req, _ := http.NewRequest(http.MethodPost, httpServer.URL+"/api/config/apply",
		strings.NewReader(`{"set":{"language":"English"}}{"set":{}}`))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set(tokenHeader, testToken)
	res, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatal(err)
	}
	defer res.Body.Close()
	if res.StatusCode != http.StatusBadRequest {
		t.Errorf("status = %d", res.StatusCode)
	}
}
