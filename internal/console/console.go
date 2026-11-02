// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

// Package console implements the browser UI for the ocr CLI. It serves a
// Vite-built Vue application from the binary and exposes a small JSON API that
// runs the real CLI for review, scan, settings, and connection tests.
package console

import (
	"crypto/rand"
	"crypto/subtle"
	"embed"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"io/fs"
	"mime"
	"net"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"runtime"
	"strings"
	"sync"
	"time"

	"github.com/alibaba/open-code-review/internal/config/template"
	"github.com/alibaba/open-code-review/internal/viewer"
)

//go:embed all:assets
var embeddedAssets embed.FS

const (
	defaultAddr      = "localhost:5484"
	tokenPlaceholder = "__OCR_CONSOLE_TOKEN__"
	tokenHeader      = "X-OCR-Token"
	envAllowedHosts  = "OCR_CONSOLE_ALLOWED_HOSTS"
)

// Options configures the console server. Zero values select production
// defaults; tests inject a fake runner and sessions store.
type Options struct {
	Addr           string
	Open           string
	RepoDir        string
	Version        string
	ConfigPath     string
	Runner         Runner
	Sessions       SessionStore
	Out            io.Writer
	OpenBrowser    func(string) error
	ShouldAutoOpen func(string) (bool, string)
}

// Server holds the console's state and HTTP handler.
type Server struct {
	repoMu     sync.RWMutex
	repoDir    string
	configPath string
	version    string
	token      string
	jobs       *Jobs
	sessions   SessionStore
	runner     Runner
	assets     fs.FS
	handler    http.Handler
	addr       string

	configMu sync.Mutex
}

// New constructs a console server. It does not listen or open a browser.
func New(opts Options) (*Server, error) {
	if opts.Addr == "" {
		opts.Addr = defaultAddr
	}
	if opts.RepoDir == "" {
		wd, err := os.Getwd()
		if err != nil {
			return nil, fmt.Errorf("resolve working directory: %w", err)
		}
		opts.RepoDir = wd
	}
	repoDir, err := resolveRepoDir(opts.RepoDir)
	if err != nil {
		return nil, err
	}
	configPath := opts.ConfigPath
	if configPath == "" {
		configPath, err = defaultConfigPath()
		if err != nil {
			return nil, err
		}
	}
	runner := opts.Runner
	if runner == nil {
		runner = ExecRunner{}
	}
	sessions := opts.Sessions
	if sessions == nil {
		sessions = packageSessionStore{}
	}
	assets, err := fs.Sub(embeddedAssets, "assets")
	if err != nil {
		return nil, fmt.Errorf("open embedded assets: %w", err)
	}
	version := opts.Version
	if version == "" {
		version = "dev"
	}
	server := &Server{
		repoDir:    repoDir,
		configPath: configPath,
		version:    version,
		token:      newToken(),
		jobs:       NewJobs(runner, repoDir),
		sessions:   sessions,
		runner:     runner,
		assets:     assets,
		addr:       opts.Addr,
	}
	server.handler = server.routes()
	return server, nil
}

// Handler returns the fully wrapped HTTP handler.
func (s *Server) Handler() http.Handler {
	return s.handler
}

// repoRoot returns the directory reviews and scans run in. The console can
// switch it at runtime, so every handler reads it through here.
func (s *Server) repoRoot() string {
	s.repoMu.RLock()
	defer s.repoMu.RUnlock()
	return s.repoDir
}

func (s *Server) setRepoRoot(dir string) {
	s.repoMu.Lock()
	s.repoDir = dir
	s.repoMu.Unlock()
}

// StartServer binds the listen address and serves until the listener fails.
func StartServer(opts Options) error {
	return startServer(opts, nil)
}

// startServer is StartServer with an injectable listener, so tests can drive
// the ready/open path without a fixed port.
func startServer(opts Options, listener net.Listener) error {
	if strings.TrimSpace(opts.Addr) == "" {
		opts.Addr = defaultAddr
	}
	server, err := New(opts)
	if err != nil {
		return err
	}
	openMode := opts.Open
	if openMode == "" {
		openMode = viewer.OpenAuto
	}
	if err := viewer.ValidateOpenMode(openMode); err != nil {
		return err
	}
	autoOpenFn := opts.ShouldAutoOpen
	if autoOpenFn == nil {
		autoOpenFn = viewer.ShouldAutoOpen
	}
	openFn := opts.OpenBrowser
	if openFn == nil {
		openFn = viewer.OpenBrowser
	}
	out := opts.Out
	if out == nil {
		out = os.Stdout
	}

	ln := listener
	if ln == nil {
		ln, err = net.Listen("tcp", opts.Addr)
		if err != nil {
			return fmt.Errorf("listen on %s: %w", opts.Addr, err)
		}
	}
	defer ln.Close()

	_, port, err := net.SplitHostPort(ln.Addr().String())
	if err != nil {
		return fmt.Errorf("parse listener address: %w", err)
	}
	host := splitBindHost(opts.Addr)
	displayURL := "http://" + net.JoinHostPort(displayAddrHost(host), port)

	httpServer := &http.Server{
		Handler:           server.Handler(),
		ReadHeaderTimeout: 10 * time.Second,
		IdleTimeout:       120 * time.Second,
	}
	serveErr := make(chan error, 1)
	go func() { serveErr <- httpServer.Serve(ln) }()

	autoOpen, suppressed := autoOpenFn(openMode)
	if suppressed != "" {
		fmt.Fprintf(out, "Web Console ready: %s (browser not opened: %s)\n", displayURL, suppressed)
	} else {
		fmt.Fprintf(out, "Web Console ready: %s\n", displayURL)
	}
	if autoOpen {
		go func() {
			if err := openFn(displayURL); err != nil {
				fmt.Fprintf(os.Stderr, "[ocr] WARNING: could not open browser: %v\n", err)
			}
		}()
	}
	return <-serveErr
}

func (s *Server) routes() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /api/health", s.handleHealth)
	mux.HandleFunc("GET /api/meta", s.handleMeta)
	mux.HandleFunc("GET /api/repo", s.handleRepo)
	mux.HandleFunc("POST /api/repo/open", s.handleRepoOpen)
	mux.HandleFunc("GET /api/config", s.handleConfig)
	mux.HandleFunc("POST /api/config/apply", s.handleConfigApply)
	mux.HandleFunc("GET /api/providers", s.handleProviders)
	mux.HandleFunc("POST /api/providers/activate", s.handleActivateProvider)
	mux.HandleFunc("GET /api/sessions", s.handleSessions)
	mux.HandleFunc("GET /api/sessions/{id}", s.handleSessionDetail)
	mux.HandleFunc("DELETE /api/sessions/{id}", s.handleSessionDelete)
	mux.HandleFunc("GET /api/rules", s.handleRules)
	mux.HandleFunc("POST /api/rules/check", s.handleRuleCheck)
	mux.HandleFunc("POST /api/review", s.handleStartReview)
	mux.HandleFunc("POST /api/scan", s.handleStartScan)
	mux.HandleFunc("POST /api/llm/test", s.handleLLMTest)
	mux.HandleFunc("GET /api/jobs", s.handleJobs)
	mux.HandleFunc("GET /api/jobs/{id}", s.handleJob)
	mux.HandleFunc("POST /api/jobs/{id}/cancel", s.handleJobCancel)
	mux.HandleFunc("GET /api/jobs/{id}/events", s.handleJobEvents)
	mux.HandleFunc("GET /assets/", s.handleAsset)
	mux.HandleFunc("GET /", s.handleSPA)
	mux.HandleFunc("GET /api", func(w http.ResponseWriter, r *http.Request) {
		writeError(w, http.StatusNotFound, "unknown API endpoint")
	})
	// A single "/api/" pattern would conflict with "GET /" under Go's routing
	// precedence, so each unsafe method gets the same not-found fallback.
	for _, method := range []string{"GET", "POST", "PUT", "PATCH", "DELETE"} {
		mux.HandleFunc(method+" /api/", func(w http.ResponseWriter, r *http.Request) {
			writeError(w, http.StatusNotFound, "unknown API endpoint")
		})
	}

	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if isUnsafeMethod(r.Method) {
			if origin := r.Header.Get("Origin"); origin != "" && !sameOrigin(origin, r.Host) {
				writeError(w, http.StatusForbidden, "cross-origin request rejected")
				return
			}
			if strings.HasPrefix(r.URL.Path, "/api/") {
				supplied := r.Header.Get(tokenHeader)
				if subtle.ConstantTimeCompare([]byte(supplied), []byte(s.token)) != 1 {
					writeError(w, http.StatusForbidden, "missing or invalid console token")
					return
				}
			}
		}
		mux.ServeHTTP(w, r)
	})

	allowed := buildAllowedHosts(splitBindHost(s.addr))
	return securityHeaders(hostGuard(allowed, handler))
}

func (s *Server) handleHealth(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]any{
		"ok":      true,
		"version": s.version,
		"repo":    s.repoRoot(),
	})
}

type metaDefaults struct {
	Concurrency     int      `json:"concurrency"`
	Timeout         int      `json:"timeout"`
	MaxTokens       int      `json:"max_tokens"`
	MaxTokensBudget int      `json:"max_tokens_budget"`
	Modes           []string `json:"modes"`
}

type metaResponse struct {
	Version     string            `json:"version"`
	Platform    string            `json:"platform"`
	Repo        RepoInfo          `json:"repo"`
	Config      configSummaryView `json:"config"`
	Efforts     []string          `json:"efforts"`
	Defaults    metaDefaults      `json:"defaults"`
	RunningJobs int               `json:"running_jobs"`
}

func (s *Server) handleMeta(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, metaResponse{
		Version:  s.version,
		Platform: runtime.GOOS + "/" + runtime.GOARCH,
		Repo:     inspectRepo(s.repoRoot()),
		Config:   buildConfigSummary(s.configPath),
		Efforts:  template.EffortNames(),
		Defaults: metaDefaults{
			Concurrency:     8,
			Timeout:         15,
			MaxTokens:       0,
			MaxTokensBudget: 0,
			Modes:           []string{"workspace", "commit", "range"},
		},
		RunningJobs: s.jobs.Running(),
	})
}

func (s *Server) handleRepo(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, inspectRepo(s.repoRoot()))
}

type repoOpenRequest struct {
	Path string `json:"path"`
}

// handleRepoOpen points the console at another directory. Switching is refused
// while a job is running so an in-flight review cannot be attributed to the
// wrong repository.
func (s *Server) handleRepoOpen(w http.ResponseWriter, r *http.Request) {
	var req repoOpenRequest
	if err := readJSON(w, r, &req); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	path := strings.TrimSpace(req.Path)
	if path == "" {
		writeError(w, http.StatusBadRequest, "repository path is required")
		return
	}
	dir, err := resolveRepoDir(path)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	if running := s.jobs.Running(); running > 0 {
		writeError(w, http.StatusConflict, "cancel running jobs before switching repositories")
		return
	}
	s.setRepoRoot(dir)
	writeJSON(w, http.StatusOK, inspectRepo(dir))
}

func (s *Server) handleJobs(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]any{
		"jobs":    s.jobs.List(),
		"running": s.jobs.Running(),
	})
}

func (s *Server) handleJob(w http.ResponseWriter, r *http.Request) {
	snapshot, ok := s.jobs.Get(r.PathValue("id"))
	if !ok {
		writeError(w, http.StatusNotFound, "job not found")
		return
	}
	writeJSON(w, http.StatusOK, snapshot)
}

func (s *Server) handleJobCancel(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	exists, canceled := s.jobs.Cancel(id)
	if !exists {
		writeError(w, http.StatusNotFound, "job not found")
		return
	}
	snapshot, _ := s.jobs.Get(id)
	if !canceled {
		writeJSON(w, http.StatusOK, snapshot)
		return
	}
	writeJSON(w, http.StatusAccepted, snapshot)
}

func (s *Server) handleJobEvents(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if _, ok := s.jobs.Get(id); !ok {
		writeError(w, http.StatusNotFound, "job not found")
		return
	}
	flusher, ok := w.(http.Flusher)
	if !ok {
		writeError(w, http.StatusInternalServerError, "streaming is not supported by this connection")
		return
	}
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache, no-transform")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("X-Accel-Buffering", "no")
	fmt.Fprint(w, "retry: 1500\n\n")
	flusher.Flush()

	lastVersion := -1
	lastWrite := time.Now()
	ticker := time.NewTicker(250 * time.Millisecond)
	defer ticker.Stop()
	for {
		current, exists := s.jobs.Get(id)
		if !exists {
			writeSSEEvent(w, "error", `{"error":"job not found"}`)
			flusher.Flush()
			return
		}
		if current.Version != lastVersion {
			data, err := json.Marshal(current)
			if err == nil {
				writeSSEEvent(w, "job", string(data))
				flusher.Flush()
				lastVersion = current.Version
				lastWrite = time.Now()
			}
		}
		if current.Terminal() {
			writeSSEEvent(w, "done", `{}`)
			flusher.Flush()
			return
		}
		if time.Since(lastWrite) > 15*time.Second {
			fmt.Fprint(w, ": ping\n\n")
			flusher.Flush()
			lastWrite = time.Now()
		}
		select {
		case <-r.Context().Done():
			return
		case <-ticker.C:
		}
	}
}

func writeSSEEvent(w io.Writer, event, data string) {
	fmt.Fprintf(w, "event: %s\ndata: %s\n\n", event, data)
}

func (s *Server) handleAsset(w http.ResponseWriter, r *http.Request) {
	name := strings.TrimPrefix(r.URL.Path, "/assets/")
	if name == "" || strings.Contains(name, "..") {
		writeError(w, http.StatusNotFound, "asset not found")
		return
	}
	// Vite emits bundles under dist/assets/ and references them as /assets/...,
	// so the embedded path keeps that leading directory.
	data, err := fs.ReadFile(s.assets, "assets/"+name)
	if err != nil {
		writeError(w, http.StatusNotFound, "asset not found")
		return
	}
	contentType := assetContentType(name)
	w.Header().Set("Content-Type", contentType)
	w.Header().Set("Cache-Control", "public, max-age=31536000, immutable")
	_, _ = w.Write(data)
}

// assetContentType pins the extensions Vite emits. Windows' registry can map
// .js and .svg to unexpected types, and a module script served with the wrong
// MIME type is blocked by nosniff.
func assetContentType(name string) string {
	switch strings.ToLower(filepath.Ext(name)) {
	case ".js", ".mjs":
		return "text/javascript; charset=utf-8"
	case ".css":
		return "text/css; charset=utf-8"
	case ".svg":
		return "image/svg+xml"
	case ".json":
		return "application/json; charset=utf-8"
	case ".woff2":
		return "font/woff2"
	case ".woff":
		return "font/woff"
	}
	if contentType := mime.TypeByExtension(filepath.Ext(name)); contentType != "" {
		return contentType
	}
	return "application/octet-stream"
}

func (s *Server) handleSPA(w http.ResponseWriter, r *http.Request) {
	name := strings.TrimPrefix(r.URL.Path, "/")
	if name != "" && !strings.Contains(name, "..") && name != "index.html" {
		if data, err := fs.ReadFile(s.assets, name); err == nil {
			w.Header().Set("Content-Type", assetContentType(name))
			w.Header().Set("Cache-Control", "no-cache")
			_, _ = w.Write(data)
			return
		}
	}
	s.serveIndex(w)
}

func (s *Server) serveIndex(w http.ResponseWriter) {
	data, err := fs.ReadFile(s.assets, "index.html")
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.Header().Set("Cache-Control", "no-store")
	if err != nil {
		_, _ = io.WriteString(w, fallbackHTML)
		return
	}
	html := string(data)
	if strings.Contains(html, tokenPlaceholder) {
		html = strings.ReplaceAll(html, tokenPlaceholder, s.token)
	} else {
		meta := fmt.Sprintf(`<meta name="ocr-console-token" content="%s" />`, s.token)
		html = strings.Replace(html, "</head>", meta+"\n</head>", 1)
	}
	_, _ = io.WriteString(w, html)
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("Cache-Control", "no-store")
	w.WriteHeader(status)
	encoder := json.NewEncoder(w)
	encoder.SetEscapeHTML(false)
	_ = encoder.Encode(payload)
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, map[string]string{"error": message})
}

func readJSON(w http.ResponseWriter, r *http.Request, target any) error {
	if r.Body == nil {
		return errors.New("request body is required")
	}
	r.Body = http.MaxBytesReader(w, r.Body, 1<<20)
	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(target); err != nil {
		return fmt.Errorf("invalid JSON body: %w", err)
	}
	var extra any
	if err := decoder.Decode(&extra); err != io.EOF {
		return errors.New("request body must contain a single JSON object")
	}
	return nil
}

func isUnsafeMethod(method string) bool {
	switch method {
	case http.MethodPost, http.MethodPut, http.MethodPatch, http.MethodDelete:
		return true
	default:
		return false
	}
}

func sameOrigin(origin, host string) bool {
	parsed, err := url.Parse(origin)
	if err != nil || parsed.Host == "" {
		return false
	}
	return strings.EqualFold(parsed.Host, host)
}

func newToken() string {
	var buf [24]byte
	if _, err := rand.Read(buf[:]); err != nil {
		return fmt.Sprintf("%d", time.Now().UnixNano())
	}
	return hex.EncodeToString(buf[:])
}

func defaultConfigPath() (string, error) {
	home, err := os.UserHomeDir()
	if err != nil {
		return "", fmt.Errorf("cannot determine home directory: %w", err)
	}
	return filepath.Join(home, ".opencodereview", "config.json"), nil
}

func securityHeaders(next http.Handler) http.Handler {
	const csp = "default-src 'self'; " +
		"script-src 'self'; " +
		"style-src 'self' 'unsafe-inline'; " +
		"img-src 'self' data:; " +
		"font-src 'self' data:; " +
		"connect-src 'self'; " +
		"object-src 'none'; " +
		"base-uri 'none'; " +
		"frame-ancestors 'none'; " +
		"form-action 'self'"
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		h := w.Header()
		h.Set("Content-Security-Policy", csp)
		h.Set("X-Content-Type-Options", "nosniff")
		h.Set("X-Frame-Options", "DENY")
		h.Set("Referrer-Policy", "no-referrer")
		h.Set("Permissions-Policy", "geolocation=(), camera=(), microphone=()")
		next.ServeHTTP(w, r)
	})
}

func hostGuard(allowed map[string]struct{}, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		host := hostOnly(r.Host)
		if host == "" {
			writeError(w, http.StatusForbidden, "forbidden host")
			return
		}
		if isLoopbackHost(host) {
			next.ServeHTTP(w, r)
			return
		}
		if _, ok := allowed[host]; ok {
			next.ServeHTTP(w, r)
			return
		}
		writeError(w, http.StatusForbidden, "forbidden host")
	})
}

func hostOnly(hostPort string) string {
	hostPort = strings.TrimSpace(hostPort)
	if hostPort == "" {
		return ""
	}
	if host, _, err := net.SplitHostPort(hostPort); err == nil {
		return strings.ToLower(host)
	}
	if strings.HasPrefix(hostPort, "[") && strings.HasSuffix(hostPort, "]") {
		return strings.ToLower(hostPort[1 : len(hostPort)-1])
	}
	if strings.Count(hostPort, ":") > 1 {
		return ""
	}
	return strings.ToLower(hostPort)
}

func isLoopbackHost(host string) bool {
	switch host {
	case "localhost", "127.0.0.1", "::1", "0:0:0:0:0:0:0:1":
		return true
	}
	if ip := net.ParseIP(host); ip != nil && ip.IsLoopback() {
		return true
	}
	return false
}

func buildAllowedHosts(bindHost string) map[string]struct{} {
	allowed := map[string]struct{}{
		"localhost": {}, "127.0.0.1": {}, "::1": {},
	}
	host := strings.ToLower(strings.TrimSpace(bindHost))
	if strings.HasPrefix(host, "[") && strings.HasSuffix(host, "]") {
		host = host[1 : len(host)-1]
	}
	if host != "" && host != "0.0.0.0" && host != "::" && host != "*" {
		allowed[host] = struct{}{}
	}
	for _, entry := range strings.Split(os.Getenv(envAllowedHosts), ",") {
		entry = strings.ToLower(strings.TrimSpace(entry))
		if entry != "" {
			allowed[entry] = struct{}{}
		}
	}
	return allowed
}

func splitBindHost(addr string) string {
	if addr == "" {
		return ""
	}
	if host, _, err := net.SplitHostPort(addr); err == nil {
		return host
	}
	return addr
}

func displayAddrHost(host string) string {
	switch host {
	case "", "0.0.0.0", "::":
		return "localhost"
	default:
		return host
	}
}

const fallbackHTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Open Code Review - Console assets missing</title>
<style>
  :root { color-scheme: light; }
  body { margin: 0; min-height: 100vh; display: grid; place-items: center;
    background: #faf9f5; color: #1f1e1d;
    font-family: -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
  main { max-width: 620px; padding: 48px; background: #fff;
    border: 1px solid #e7e2d6; border-radius: 18px;
    box-shadow: 0 24px 60px -40px rgba(35, 30, 20, .35); }
  .mark { width: 38px; height: 38px; border-radius: 12px; display: grid;
    place-items: center; background: #f6e6df; color: #c96442;
    font-size: 22px; margin-bottom: 22px; }
  h1 { font-family: Georgia, "Times New Roman", serif; font-weight: 500;
    font-size: 30px; margin: 0 0 12px; letter-spacing: -.02em; }
  p { line-height: 1.65; color: #5c5952; margin: 0 0 16px; }
  code { background: #f3f1ea; border: 1px solid #e7e2d6; border-radius: 6px;
    padding: 2px 6px; font-family: Consolas, Menlo, monospace; font-size: .9em; }
  pre { background: #262522; color: #f4f0e6; padding: 16px 18px;
    border-radius: 10px; overflow: auto; font-size: 13px; }
</style>
</head>
<body>
<main>
  <div class="mark">&#10035;</div>
  <h1>Console assets are not built yet.</h1>
  <p>The Go server is running, but this binary was compiled without the Vue
  bundle. Build the interface and rebuild the binary:</p>
  <pre>cd frontend
npm install
npm run build
cd ..
go build -o dist/opencodereview ./cmd/opencodereview</pre>
  <p>Or run <code>make frontend</code> from the repository root.</p>
</main>
</body>
</html>`
