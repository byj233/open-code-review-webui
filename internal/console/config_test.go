// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

package console

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"strings"
	"testing"

	"github.com/alibaba/open-code-review/internal/llm"
)

func clearLLMEnv(t *testing.T) {
	t.Helper()
	for _, key := range []string{
		"OCR_LLM_URL", "OCR_LLM_TOKEN", "OCR_LLM_MODEL", "OCR_LLM_TIMEOUT", "OCR_LLM_EXTRA_HEADERS",
		"ANTHROPIC_BASE_URL", "ANTHROPIC_AUTH_TOKEN", "ANTHROPIC_API_KEY", "ANTHROPIC_MODEL",
		"ANTHROPIC_USE_ANTHROPIC", "OPENAI_API_KEY", "OPENAI_BASE_URL", "OPENAI_MODEL",
		"ANTHROPIC_API_KEY",
	} {
		t.Setenv(key, "")
	}
}

func TestReadConfigFile(t *testing.T) {
	t.Run("missing", func(t *testing.T) {
		cfg, exists, err := readConfigFile(filepath.Join(t.TempDir(), "missing.json"))
		if err != nil || exists || cfg.Provider != "" {
			t.Fatalf("readConfigFile = %+v, %v, %v", cfg, exists, err)
		}
	})
	t.Run("empty", func(t *testing.T) {
		path := filepath.Join(t.TempDir(), "config.json")
		writeConfig(t, path, "  \n")
		_, exists, err := readConfigFile(path)
		if err != nil || !exists {
			t.Fatalf("exists = %v, err = %v", exists, err)
		}
	})
	t.Run("valid", func(t *testing.T) {
		path := filepath.Join(t.TempDir(), "config.json")
		writeConfig(t, path, `{"provider":"anthropic","model":"claude-sonnet-4-6"}`)
		cfg, exists, err := readConfigFile(path)
		if err != nil || !exists || cfg.Provider != "anthropic" || cfg.Model != "claude-sonnet-4-6" {
			t.Fatalf("readConfigFile = %+v, %v, %v", cfg, exists, err)
		}
	})
	t.Run("invalid", func(t *testing.T) {
		path := filepath.Join(t.TempDir(), "config.json")
		writeConfig(t, path, `{"provider":`)
		if _, _, err := readConfigFile(path); err == nil {
			t.Fatal("expected a parse error")
		}
	})
}

func TestActiveConfigVariants(t *testing.T) {
	tests := []struct {
		name   string
		config string
		env    map[string]string
		want   activeView
	}{
		{
			name:   "preset api key",
			config: `{"provider":"anthropic","providers":{"anthropic":{"api_key":"secret","model":"claude-sonnet-4-6"}}}`,
			want: activeView{
				Provider: "anthropic", ProviderKind: "preset", Source: "provider",
				Model: "claude-sonnet-4-6", AuthMode: "api_key", KeySet: true, Configured: true,
				Protocol: "anthropic", BaseURL: "https://api.anthropic.com", EnvVar: "ANTHROPIC_API_KEY",
			},
		},
		{
			name:   "preset environment",
			config: `{"provider":"anthropic","providers":{"anthropic":{"model":"claude-sonnet-4-6"}}}`,
			env:    map[string]string{"ANTHROPIC_API_KEY": "env-key"},
			want: activeView{
				Provider: "anthropic", ProviderKind: "preset", Source: "provider",
				Model: "claude-sonnet-4-6", AuthMode: "env", EnvSet: true, Configured: true, EnvVar: "ANTHROPIC_API_KEY",
				Protocol: "anthropic", BaseURL: "https://api.anthropic.com",
			},
		},
		{
			name:   "ambient auth",
			config: `{"provider":"bedrock","providers":{"bedrock":{"model":"us.anthropic.claude-opus-5"}}}`,
			want: activeView{
				Provider: "bedrock", ProviderKind: "preset", Source: "provider",
				Model: "us.anthropic.claude-opus-5", AuthMode: "ambient", Configured: true,
				Protocol: "anthropic-bedrock",
			},
		},
		{
			name:   "external auth",
			config: `{"provider":"chatgpt","model":"gpt-5.4"}`,
			want: activeView{
				Provider: "chatgpt", ProviderKind: "preset", Source: "provider",
				Model: "gpt-5.4", AuthMode: "sign_in",
				Protocol: "openai-responses", BaseURL: "https://api.openai.com/v1",
			},
		},
		{
			name:   "custom provider",
			config: `{"provider":"gateway","custom_providers":{"gateway":{"url":"https://gw.example/v1","protocol":"openai","model":"my-model","api_key":"secret"}}}`,
			want: activeView{
				Provider: "gateway", ProviderKind: "custom", Source: "provider",
				Model: "my-model", AuthMode: "api_key", KeySet: true, Configured: true,
				Protocol: "openai", BaseURL: "https://gw.example/v1",
			},
		},
		{
			name:   "unknown provider",
			config: `{"provider":"ghost"}`,
			want: activeView{
				Provider: "ghost", ProviderKind: "unknown", Source: "provider", AuthMode: "none",
			},
		},
		{
			name:   "legacy endpoint",
			config: `{"llm":{"url":"https://legacy.example/v1","model":"legacy-model","auth_token":"token"}}`,
			want: activeView{
				Source: "legacy", Model: "legacy-model", BaseURL: "https://legacy.example/v1",
				Protocol: "anthropic", AuthMode: "api_key", Configured: true,
			},
		},
		{
			name:   "legacy openai",
			config: `{"llm":{"url":"https://legacy.example/v1","model":"legacy-model","auth_token_cmd":"echo token","protocol":"openai"}}`,
			want: activeView{
				Source: "legacy", Model: "legacy-model", BaseURL: "https://legacy.example/v1",
				Protocol: "openai", AuthMode: "api_key", Configured: true,
			},
		},
		{
			name: "ocr environment",
			env: map[string]string{
				"OCR_LLM_URL": "https://env.example/v1", "OCR_LLM_TOKEN": "token", "OCR_LLM_MODEL": "env-model",
			},
			want: activeView{
				Source: "ocr-env", Model: "env-model", BaseURL: "https://env.example/v1",
				Protocol: "anthropic", AuthMode: "env", Configured: true, EnvSet: true,
			},
		},
		{
			name: "claude environment",
			env: map[string]string{
				"ANTHROPIC_BASE_URL": "https://claude.example", "ANTHROPIC_AUTH_TOKEN": "token", "ANTHROPIC_MODEL": "claude-model",
			},
			want: activeView{
				Source: "claude-env", Model: "claude-model", BaseURL: "https://claude.example",
				Protocol: "anthropic", AuthMode: "env", Configured: true, EnvSet: true,
			},
		},
		{
			name: "none",
			want: activeView{Source: "none", AuthMode: "none"},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			clearLLMEnv(t)
			for key, value := range tt.env {
				t.Setenv(key, value)
			}
			var cfg configFile
			if tt.config != "" {
				loaded, _, err := readConfigFile(writeTempConfig(t, tt.config))
				if err != nil {
					t.Fatalf("read config: %v", err)
				}
				cfg = loaded
			}
			got := activeFromConfig(cfg)
			if got.Provider != tt.want.Provider ||
				got.ProviderKind != tt.want.ProviderKind ||
				got.Source != tt.want.Source ||
				got.Model != tt.want.Model ||
				got.AuthMode != tt.want.AuthMode ||
				got.KeySet != tt.want.KeySet ||
				got.EnvSet != tt.want.EnvSet ||
				got.Configured != tt.want.Configured ||
				got.Protocol != tt.want.Protocol ||
				got.BaseURL != tt.want.BaseURL {
				t.Errorf("activeFromConfig = %+v, want %+v", got, tt.want)
			}
			if tt.want.EnvVar != "" && got.EnvVar != tt.want.EnvVar {
				t.Errorf("EnvVar = %q, want %q", got.EnvVar, tt.want.EnvVar)
			}
		})
	}
}

func writeTempConfig(t *testing.T, body string) string {
	t.Helper()
	path := filepath.Join(t.TempDir(), "config.json")
	writeConfig(t, path, body)
	return path
}

func TestBuildConfigViewAndSummary(t *testing.T) {
	clearLLMEnv(t)
	path := writeTempConfig(t, `{
		"provider":"anthropic",
		"max_tokens":32000,
		"effort":"high",
		"language":"English",
		"providers":{"anthropic":{"api_key":"super-secret","model":"claude-sonnet-4-6","timeout_sec":45}},
		"custom_providers":{"gateway":{"url":"https://gw.example/v1","protocol":"openai","model":"gw-model","api_key_cmd":"pass show llm"}},
		"llm":{"url":"https://legacy.example/v1","model":"legacy","auth_token":"legacy-token"},
		"telemetry":{"enabled":true,"exporter":"otlp","otlp_endpoint":"http://localhost:4318","content_logging":true},
		"mcp_servers":{"github":{"type":"stdio","command":"npx","args":["-y","server"]},"remote":{"type":"remote","url":"https://mcp.example"}}
	}`)

	summary := buildConfigSummary(path)
	if summary.Error != "" || summary.MaxTokens != 32000 || summary.Effort != "high" || summary.Language != "English" {
		t.Errorf("summary = %+v", summary)
	}
	if summary.MCPServerCount != 2 {
		t.Errorf("MCPServerCount = %d, want 2", summary.MCPServerCount)
	}
	if !summary.Active.Configured || summary.Active.Model != "claude-sonnet-4-6" {
		t.Errorf("active = %+v", summary.Active)
	}

	view := buildConfigView(path)
	if view.Providers["anthropic"].APIKeySet != true {
		t.Error("api key should be marked set")
	}
	if strings.Contains(safeJSON(t, view), "super-secret") {
		t.Error("config view leaked the API key")
	}
	if view.CustomProviders["gateway"].APIKeyCmd != "pass show llm" {
		t.Errorf("custom provider = %+v", view.CustomProviders["gateway"])
	}
	if view.LLM.AuthTokenSet != true || view.LLM.URL != "https://legacy.example/v1" {
		t.Errorf("llm view = %+v", view.LLM)
	}
	if view.Telemetry == nil || !view.Telemetry.Enabled || view.Telemetry.Exporter != "otlp" {
		t.Errorf("telemetry = %+v", view.Telemetry)
	}
	if len(view.MCPServers) != 2 || view.MCPServers[0].Name != "github" || view.MCPServers[1].Name != "remote" {
		t.Errorf("mcp servers = %+v", view.MCPServers)
	}
	if !view.Exists {
		t.Error("Exists = false")
	}
}

func safeJSON(t *testing.T, value any) string {
	t.Helper()
	data, err := json.Marshal(value)
	if err != nil {
		t.Fatalf("marshal: %v", err)
	}
	return string(data)
}

func TestBuildConfigHandlesMalformedFile(t *testing.T) {
	path := writeTempConfig(t, "{not json")
	summary := buildConfigSummary(path)
	if summary.Error == "" {
		t.Error("summary.Error = empty for malformed config")
	}
	view := buildConfigView(path)
	if view.Error == "" {
		t.Error("view.Error = empty for malformed config")
	}
	response := buildProvidersResponse(path)
	if response.Error == "" {
		t.Error("providers response error = empty")
	}
	if response.Providers == nil || response.Custom == nil {
		t.Error("providers arrays must be non-nil even on parse errors")
	}
}

func TestBuildProvidersResponse(t *testing.T) {
	clearLLMEnv(t)
	path := writeTempConfig(t, `{
		"provider":"anthropic",
		"providers":{"anthropic":{"api_key":"secret","model":"claude-sonnet-4-6"}},
		"custom_providers":{"gateway":{"url":"https://gw.example/v1","protocol":"openai","model":"gw-model"}}
	}`)
	response := buildProvidersResponse(path)
	if len(response.Providers) != len(llm.ListProviders()) {
		t.Errorf("providers = %d, want %d", len(response.Providers), len(llm.ListProviders()))
	}
	if len(response.Custom) != 1 || response.Custom[0].Name != "gateway" {
		t.Errorf("custom = %+v", response.Custom)
	}
	if !response.Active.Configured || response.Active.Provider != "anthropic" {
		t.Errorf("active = %+v", response.Active)
	}
	var anthropicCard providerCard
	for _, card := range response.Providers {
		if card.Name == "anthropic" {
			anthropicCard = card
		}
	}
	if !anthropicCard.Active || !anthropicCard.KeySet || anthropicCard.AuthMode != "api_key" || anthropicCard.Model != "claude-sonnet-4-6" {
		t.Errorf("anthropic card = %+v", anthropicCard)
	}
	if response.Custom[0].Configured {
		t.Error("custom card without a key should not be configured")
	}

	t.Setenv("ANTHROPIC_API_KEY", "env-secret")
	path = writeTempConfig(t, `{"provider":"anthropic","providers":{"anthropic":{"model":"claude-sonnet-4-6"}}}`)
	response = buildProvidersResponse(path)
	for _, card := range response.Providers {
		if card.Name == "anthropic" {
			if !card.EnvSet || card.AuthMode != "env" || !card.Configured {
				t.Errorf("env-backed card = %+v", card)
			}
		}
	}
}

func TestConfigKeyValidation(t *testing.T) {
	valid := []string{
		"provider", "model", "max_tokens", "effort", "language",
		"llm.url", "llm.auth_token", "llm.auth_token_cmd", "llm.auth_header", "llm.model",
		"llm.timeout_sec", "llm.protocol", "llm.use_anthropic", "llm.extra_headers", "llm.retry_codes", "llm.extra_body",
		"telemetry.enabled", "telemetry.exporter", "telemetry.otlp_endpoint", "telemetry.content_logging",
		"providers.anthropic.api_key", "providers.gateway.url", "providers.x.models",
		"custom_providers.gateway.protocol", "custom_providers.gateway.extra_headers",
		"mcp_servers.github.command", "mcp_servers.remote.headers",
	}
	for _, key := range valid {
		if !validConfigKey(key) {
			t.Errorf("validConfigKey(%q) = false", key)
		}
	}
	invalid := []string{
		"", "evil", "providers.x", "providers.x.unknown", "providers..api_key", "custom_providers.x",
		"LLM.URL", "mcp_servers.x.bad", "provider.extra", "providers.x.api_key.extra",
	}
	for _, key := range invalid {
		if validConfigKey(key) {
			t.Errorf("validConfigKey(%q) = true", key)
		}
	}

	validUnset := []string{"provider", "max_tokens", "effort", "custom_providers.gateway", "mcp_servers.github"}
	for _, key := range validUnset {
		if !unsetConfigKeyRE.MatchString(key) {
			t.Errorf("unset key %q rejected", key)
		}
	}
	for _, key := range []string{"model", "llm.url", "custom_providers.", "mcp_servers.", "provider.x"} {
		if unsetConfigKeyRE.MatchString(key) {
			t.Errorf("unset key %q accepted", key)
		}
	}

	for _, key := range []string{"providers.x.api_key", "llm.auth_token", "providers.x.API_KEY"} {
		if !isSecretConfigKey(key) {
			t.Errorf("isSecretConfigKey(%q) = false", key)
		}
	}
	if isSecretConfigKey("providers.x.api_key_cmd") || isSecretConfigKey("model") {
		t.Error("non-secret key classified as secret")
	}
}

func TestConfigValueValidation(t *testing.T) {
	if err := validateConfigValue("model", strings.Repeat("m", 100)); err != nil {
		t.Errorf("valid value rejected: %v", err)
	}
	if err := validateConfigValue("model", "a\x00b"); err == nil {
		t.Error("NUL value accepted")
	}
	if err := validateConfigValue("providers.x.api_key", strings.Repeat("k", 9000)); err == nil {
		t.Error("oversized secret accepted")
	}
	if err := validateConfigValue("model", strings.Repeat("m", 20000)); err == nil {
		t.Error("oversized value accepted")
	}
}

func TestConfigOrdering(t *testing.T) {
	keys := sortedConfigKeys(map[string]string{
		"model": "m", "provider": "p", "language": "en", "max_tokens": "1",
	})
	want := []string{"language", "max_tokens", "provider", "model"}
	if strings.Join(keys, ",") != strings.Join(want, ",") {
		t.Errorf("sorted keys = %v, want %v", keys, want)
	}
	unset := sortedUnsetKeys([]string{"mcp_servers.x", "effort", "provider", "custom_providers.y", "max_tokens"})
	wantUnset := []string{"provider", "effort", "max_tokens", "mcp_servers.x", "custom_providers.y"}
	if strings.Join(unset, ",") != strings.Join(wantUnset, ",") {
		t.Errorf("sorted unset = %v, want %v", unset, wantUnset)
	}
}

func TestHandleConfigApply(t *testing.T) {
	server, _, runner := newTestServer(t, nil)

	apply := func(body string) *httptest.ResponseRecorder {
		req := httptest.NewRequest(http.MethodPost, "/api/config/apply", strings.NewReader(body))
		rec := httptest.NewRecorder()
		server.handleConfigApply(rec, req)
		return rec
	}

	rec := apply(`{"set":{"provider":"anthropic","language":"English","model":"claude-sonnet-4-6"},"unset":["effort"]}`)
	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d, body = %s", rec.Code, rec.Body.String())
	}
	var response configApplyResponse
	if err := json.Unmarshal(rec.Body.Bytes(), &response); err != nil {
		t.Fatalf("decode: %v", err)
	}
	if !response.OK || len(response.Applied) != 4 {
		t.Errorf("response = %+v", response)
	}
	if strings.Join(response.Applied, ",") != "language,provider,model,effort" {
		t.Errorf("applied order = %v", response.Applied)
	}
	calls := runner.callArgs()
	if len(calls) != 4 || calls[0][2] != "language" || calls[1][2] != "provider" || calls[3][1] != "unset" {
		t.Errorf("runner calls = %v", calls)
	}

	runner.run = func(_ context.Context, spec Spec, _ func(Stream, string)) RunResult {
		return RunResult{Stdout: []byte("Set providers.x.api_key = demo***key\n")}
	}
	rec = apply(`{"set":{"providers.x.api_key":"super-secret-key"}}`)
	if rec.Code != http.StatusOK {
		t.Fatalf("secret apply status = %d, body = %s", rec.Code, rec.Body.String())
	}
	body := rec.Body.String()
	if strings.Contains(body, "demo***key") || strings.Contains(body, "super-secret") {
		t.Errorf("secret leaked in response: %s", body)
	}
	if !strings.Contains(body, "***") {
		t.Errorf("response does not acknowledge the secret: %s", body)
	}

	rec = apply(`{"set":{}}`)
	if rec.Code != http.StatusBadRequest {
		t.Errorf("empty apply status = %d", rec.Code)
	}
	rec = apply(`{"set":{"evil.key":"x"}}`)
	if rec.Code != http.StatusBadRequest {
		t.Errorf("invalid key status = %d", rec.Code)
	}
	rec = apply(`{"unset":["model"]}`)
	if rec.Code != http.StatusBadRequest {
		t.Errorf("invalid unset status = %d", rec.Code)
	}
	rec = apply(`not json`)
	if rec.Code != http.StatusBadRequest {
		t.Errorf("invalid JSON status = %d", rec.Code)
	}

	many := make(map[string]string)
	for i := 0; i < 31; i++ {
		many[fmt.Sprintf("mcp_servers.s%d.command", i)] = "x"
	}
	bodyBytes, _ := json.Marshal(map[string]any{"set": many})
	rec = apply(string(bodyBytes))
	if rec.Code != http.StatusBadRequest {
		t.Errorf("too many changes status = %d", rec.Code)
	}

	runner.run = func(context.Context, Spec, func(Stream, string)) RunResult {
		return RunResult{Stdout: []byte("boom"), ExitCode: 1}
	}
	rec = apply(`{"set":{"language":"English"}}`)
	if rec.Code != http.StatusBadRequest {
		t.Errorf("runner failure status = %d, body = %s", rec.Code, rec.Body.String())
	}
}

func TestHandleActivateProvider(t *testing.T) {
	server, _, runner := newTestServer(t, nil)
	activate := func(body string) *httptest.ResponseRecorder {
		req := httptest.NewRequest(http.MethodPost, "/api/providers/activate", strings.NewReader(body))
		rec := httptest.NewRecorder()
		server.handleActivateProvider(rec, req)
		return rec
	}

	rec := activate(`{"name":"anthropic","model":"claude-opus-4-6","api_key":"key-value"}`)
	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d, body = %s", rec.Code, rec.Body.String())
	}
	var response activateProviderResponse
	if err := json.Unmarshal(rec.Body.Bytes(), &response); err != nil {
		t.Fatalf("decode: %v", err)
	}
	if !response.OK || len(response.Messages) != 1 {
		t.Errorf("response = %+v", response)
	}
	if strings.Contains(rec.Body.String(), "key-value") {
		t.Error("activation response leaked the API key")
	}
	calls := runner.callArgs()
	if len(calls) != 3 ||
		strings.Join(calls[0], " ") != "config set providers.anthropic.api_key key-value" ||
		strings.Join(calls[1], " ") != "config set provider anthropic" ||
		strings.Join(calls[2], " ") != "config set model claude-opus-4-6" {
		t.Errorf("calls = %v", calls)
	}

	runner.reset()
	if rec := activate(`{"name":"anthropic","model":"claude-opus-4-6"}`); rec.Code != http.StatusOK {
		t.Errorf("activation without a key status = %d", rec.Code)
	}
	if calls := runner.callArgs(); len(calls) != 2 {
		t.Errorf("calls without key = %v", calls)
	}

	runner.reset()
	rec = activate(`{"name":"gateway","model":"gw","api_key":"gw-key","url":"https://gw.example/v1","protocol":"openai","create_custom":true}`)
	if rec.Code != http.StatusOK {
		t.Fatalf("custom status = %d, body = %s", rec.Code, rec.Body.String())
	}
	calls = runner.callArgs()
	if len(calls) != 5 ||
		calls[0][2] != "provider" ||
		calls[1][2] != "custom_providers.gateway.url" ||
		calls[2][2] != "custom_providers.gateway.protocol" ||
		calls[3][2] != "custom_providers.gateway.api_key" ||
		calls[4][2] != "model" {
		t.Errorf("custom calls = %v", calls)
	}

	runner.reset()
	rec = activate(`{"name":"gateway","model":"gw","create_custom":true}`)
	if rec.Code != http.StatusBadRequest {
		t.Errorf("missing custom url status = %d", rec.Code)
	}
	rec = activate(`{"name":"unknown","model":"x"}`)
	if rec.Code != http.StatusBadRequest {
		t.Errorf("unknown provider status = %d", rec.Code)
	}
	rec = activate(`{"name":"anthropic","model":""}`)
	if rec.Code != http.StatusBadRequest {
		t.Errorf("missing model status = %d", rec.Code)
	}
	rec = activate(`{"name":"bad name","model":"x"}`)
	if rec.Code != http.StatusBadRequest {
		t.Errorf("bad name status = %d", rec.Code)
	}
	rec = activate(`{"name":"anthropic","model":"x","api_key":"line\nbreak"}`)
	if rec.Code != http.StatusBadRequest {
		t.Errorf("multiline key status = %d", rec.Code)
	}
	rec = activate(`{"name":"gateway","model":"x","url":"ftp://gw","create_custom":true}`)
	if rec.Code != http.StatusBadRequest {
		t.Errorf("bad URL status = %d", rec.Code)
	}
	rec = activate(`{"name":"gateway","model":"x","url":"https://gw","protocol":"weird","create_custom":true}`)
	if rec.Code != http.StatusBadRequest {
		t.Errorf("bad protocol status = %d", rec.Code)
	}
	rec = activate(`{"name":"gateway","model":"x","create_custom":true,"url":"https://gw"}`)
	if rec.Code != http.StatusOK {
		t.Errorf("default protocol status = %d, body = %s", rec.Code, rec.Body.String())
	}

	runner.reset()
	rec = activate(`{"name":"team.gateway","model":"gw","api_key":"k","url":"https://gw.example/v1","protocol":"openai","create_custom":true}`)
	if rec.Code != http.StatusOK {
		t.Fatalf("dotted custom status = %d, body = %s", rec.Code, rec.Body.String())
	}
	calls = runner.callArgs()
	if len(calls) != 5 || calls[0][2] != "provider" || calls[1][2] != "custom_providers.team.gateway.url" {
		t.Errorf("dotted custom calls = %v", calls)
	}
}

func TestActiveModelPrefersConfiguredOverride(t *testing.T) {
	if got := activeModel("global-model", "entry-model"); got != "global-model" {
		t.Errorf("activeModel override = %q", got)
	}
	if got := activeModel("", "entry-model"); got != "entry-model" {
		t.Errorf("activeModel entry = %q", got)
	}
	if got := activeModel("", ""); got != "" {
		t.Errorf("activeModel empty = %q", got)
	}
}

func TestRunConfigCommandRedaction(t *testing.T) {
	server, _, runner := newTestServer(t, nil)

	runner.run = func(context.Context, Spec, func(Stream, string)) RunResult {
		return RunResult{Stdout: []byte("Set providers.x.api_key = demo***key\n")}
	}
	message, err := server.runConfigCommand("set", "providers.x.api_key", "super-secret-key")
	if err != nil {
		t.Fatalf("runConfigCommand: %v", err)
	}
	if strings.Contains(message, "demo") || !strings.Contains(message, "***") {
		t.Errorf("message = %q", message)
	}

	runner.run = func(context.Context, Spec, func(Stream, string)) RunResult {
		return RunResult{Stderr: []byte("failed: api_key = super-secret-key was rejected"), ExitCode: 1}
	}
	_, err = server.runConfigCommand("set", "providers.x.api_key", "super-secret-key")
	if err == nil {
		t.Fatal("expected an error")
	}
	if strings.Contains(err.Error(), "super-secret-key") {
		t.Errorf("error leaked the key: %v", err)
	}
	if !strings.Contains(err.Error(), "***") {
		t.Errorf("error not redacted: %v", err)
	}
}

func TestValidateProviderURL(t *testing.T) {
	for _, raw := range []string{"https://gw.example/v1", "http://localhost:4000/v1"} {
		if err := validateProviderURL(raw); err != nil {
			t.Errorf("validateProviderURL(%q) = %v", raw, err)
		}
	}
	for _, raw := range []string{"ftp://gw", "gw.example", "https://", ""} {
		if err := validateProviderURL(raw); err == nil {
			t.Errorf("validateProviderURL(%q) = nil", raw)
		}
	}
}

func TestRunConfigCommandFailure(t *testing.T) {
	server, _, runner := newTestServer(t, nil)
	runner.run = func(context.Context, Spec, func(Stream, string)) RunResult {
		return RunResult{ExitCode: -1, Err: context.DeadlineExceeded}
	}
	if _, err := server.runConfigCommand("set", "language", "English"); err == nil {
		t.Fatal("expected an error")
	}
}

func TestActiveConfigIgnoresPartialEnvironment(t *testing.T) {
	clearLLMEnv(t)
	t.Setenv("OCR_LLM_URL", "https://env.example/v1")
	t.Setenv("OCR_LLM_TOKEN", "token")
	if _, ok := activeFromEnvironment(); ok {
		t.Error("partial OCR environment was treated as complete")
	}
}
