// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

package console

import (
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestBuiltinRules(t *testing.T) {
	systemRule, err := loadBuiltinRules()
	if err != nil {
		t.Fatalf("loadBuiltinRules: %v", err)
	}
	if strings.TrimSpace(systemRule.DefaultRule) == "" {
		t.Error("default rule is empty")
	}
	if len(systemRule.PathRules) < 40 {
		t.Errorf("path rules = %d, want the built-in catalog", len(systemRule.PathRules))
	}
}

func TestRulesEndpoint(t *testing.T) {
	_, httpServer, _ := newTestServer(t, nil)
	res := doRequest(t, http.MethodGet, httpServer.URL+"/api/rules", "", nil)
	if res.StatusCode != http.StatusOK {
		t.Fatalf("status = %d", res.StatusCode)
	}
	payload := decodeJSON[rulesResponse](t, res)
	if payload.DefaultRule == "" || len(payload.Patterns) < 40 {
		t.Errorf("rules payload = default %q, %d patterns", payload.DefaultRule, len(payload.Patterns))
	}
	foundGo := false
	for _, pattern := range payload.Patterns {
		if pattern.Pattern == "**/*.go" && strings.Contains(pattern.Rule, "Go") {
			foundGo = true
		}
	}
	if !foundGo {
		t.Error("built-in Go rule missing")
	}
}

func TestRuleCheckEndpoint(t *testing.T) {
	server, httpServer, _ := newTestServer(t, nil)
	res := doRequest(t, http.MethodPost, httpServer.URL+"/api/rules/check", testToken, map[string]string{
		"path": "src/main.go",
	})
	if res.StatusCode != http.StatusOK {
		t.Fatalf("status = %d", res.StatusCode)
	}
	payload := decodeJSON[ruleCheckResponse](t, res)
	if payload.Source != "system" || payload.Pattern != "**/*.go" || payload.Rule == "" {
		t.Errorf("rule check = %+v", payload)
	}

	ruleDir := filepath.Join(server.repoDir, ".opencodereview")
	if err := os.MkdirAll(ruleDir, 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(ruleDir, "rule.json"),
		[]byte(`{"rules":[{"path":"**/*.go","rule":"project-go-rule"}]}`), 0o644); err != nil {
		t.Fatal(err)
	}
	res = doRequest(t, http.MethodPost, httpServer.URL+"/api/rules/check", testToken, map[string]string{
		"path": "src/main.go",
	})
	payload = decodeJSON[ruleCheckResponse](t, res)
	if payload.Source != "project" || payload.Rule != "project-go-rule" {
		t.Errorf("project rule = %+v", payload)
	}

	res = doRequest(t, http.MethodPost, httpServer.URL+"/api/rules/check", testToken, map[string]string{"path": ""})
	if res.StatusCode != http.StatusBadRequest {
		t.Errorf("empty path status = %d", res.StatusCode)
	}
	res.Body.Close()

	res = doRequest(t, http.MethodPost, httpServer.URL+"/api/rules/check", testToken, map[string]string{"path": strings.Repeat("a", 501)})
	if res.StatusCode != http.StatusBadRequest {
		t.Errorf("long path status = %d", res.StatusCode)
	}
	res.Body.Close()

	res = doRequest(t, http.MethodPost, httpServer.URL+"/api/rules/check", testToken, map[string]string{"path": "bad\x00path"})
	if res.StatusCode != http.StatusBadRequest {
		t.Errorf("NUL path status = %d", res.StatusCode)
	}
	res.Body.Close()

	res = doRequest(t, http.MethodPost, httpServer.URL+"/api/rules/check", testToken, "not json")
	if res.StatusCode != http.StatusBadRequest {
		t.Errorf("bad JSON status = %d", res.StatusCode)
	}
	res.Body.Close()
}
