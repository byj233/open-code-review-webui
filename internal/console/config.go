// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

package console

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"os"
	"regexp"
	"sort"
	"strings"
	"time"

	"github.com/alibaba/open-code-review/internal/llm"
)

// configFile mirrors the parts of ~/.opencodereview/config.json the console
// reads. It is never written: mutations go through `ocr config`, so validation
// and unknown-field preservation stay in one place.
type configFile struct {
	Provider        string                  `json:"provider"`
	Model           string                  `json:"model"`
	MaxTokens       int                     `json:"max_tokens"`
	Effort          string                  `json:"effort"`
	Language        string                  `json:"language"`
	Providers       map[string]providerFile `json:"providers"`
	CustomProviders map[string]providerFile `json:"custom_providers"`
	LLM             llmFile                 `json:"llm"`
	Telemetry       *telemetryFile          `json:"telemetry"`
	MCPServers      map[string]mcpFile      `json:"mcp_servers"`
}

type providerFile struct {
	APIKey     string   `json:"api_key"`
	APIKeyCmd  string   `json:"api_key_cmd"`
	URL        string   `json:"url"`
	Protocol   string   `json:"protocol"`
	Model      string   `json:"model"`
	Models     []string `json:"models"`
	AuthHeader string   `json:"auth_header"`
	TimeoutSec int      `json:"timeout_sec"`
	AWSProfile string   `json:"aws_profile"`
	AWSRegion  string   `json:"aws_region"`
}

type llmFile struct {
	URL          string            `json:"url"`
	AuthToken    string            `json:"auth_token"`
	AuthTokenCmd string            `json:"auth_token_cmd"`
	AuthHeader   string            `json:"auth_header"`
	Model        string            `json:"model"`
	Protocol     string            `json:"protocol"`
	TimeoutSec   int               `json:"timeout_sec"`
	UseAnthropic *bool             `json:"use_anthropic"`
	ExtraHeaders map[string]string `json:"extra_headers"`
	RetryCodes   []int             `json:"retry_codes"`
}

type telemetryFile struct {
	Enabled      bool   `json:"enabled"`
	Exporter     string `json:"exporter"`
	OTLPEndpoint string `json:"otlp_endpoint"`
	ContentLog   bool   `json:"content_logging"`
}

type mcpFile struct {
	Type    string            `json:"type"`
	Command string            `json:"command"`
	Args    []string          `json:"args"`
	Env     []string          `json:"env"`
	URL     string            `json:"url"`
	Headers map[string]string `json:"headers"`
	Tools   []string          `json:"tools"`
	Setup   string            `json:"setup"`
}

type activeView struct {
	Provider      string `json:"provider,omitempty"`
	ProviderLabel string `json:"provider_label,omitempty"`
	ProviderKind  string `json:"provider_kind,omitempty"`
	Model         string `json:"model,omitempty"`
	Source        string `json:"source"`
	Protocol      string `json:"protocol,omitempty"`
	BaseURL       string `json:"base_url,omitempty"`
	EnvVar        string `json:"env_var,omitempty"`
	AuthMode      string `json:"auth_mode"`
	KeySet        bool   `json:"key_set"`
	EnvSet        bool   `json:"env_set"`
	Configured    bool   `json:"configured"`
}

type configSummaryView struct {
	Path           string     `json:"path"`
	Exists         bool       `json:"exists"`
	Error          string     `json:"error,omitempty"`
	Active         activeView `json:"active"`
	MaxTokens      int        `json:"max_tokens"`
	Effort         string     `json:"effort,omitempty"`
	Language       string     `json:"language,omitempty"`
	MCPServerCount int        `json:"mcp_server_count"`
}

type configView struct {
	configSummaryView
	Providers       map[string]providerEntryView `json:"providers,omitempty"`
	CustomProviders map[string]providerEntryView `json:"custom_providers,omitempty"`
	LLM             llmConfigView                `json:"llm"`
	Telemetry       *telemetryView               `json:"telemetry,omitempty"`
	MCPServers      []mcpServerView              `json:"mcp_servers,omitempty"`
}

type providerEntryView struct {
	URL          string   `json:"url,omitempty"`
	Protocol     string   `json:"protocol,omitempty"`
	Model        string   `json:"model,omitempty"`
	Models       []string `json:"models,omitempty"`
	AuthHeader   string   `json:"auth_header,omitempty"`
	TimeoutSec   int      `json:"timeout_sec,omitempty"`
	AWSProfile   string   `json:"aws_profile,omitempty"`
	AWSRegion    string   `json:"aws_region,omitempty"`
	APIKeySet    bool     `json:"api_key_set"`
	APIKeyCmd    string   `json:"api_key_cmd,omitempty"`
	APIKeyCmdSet bool     `json:"api_key_cmd_set"`
}

type llmConfigView struct {
	URL          string `json:"url,omitempty"`
	Model        string `json:"model,omitempty"`
	Protocol     string `json:"protocol,omitempty"`
	AuthHeader   string `json:"auth_header,omitempty"`
	TimeoutSec   int    `json:"timeout_sec,omitempty"`
	UseAnthropic *bool  `json:"use_anthropic,omitempty"`
	AuthTokenSet bool   `json:"auth_token_set"`
	AuthTokenCmd string `json:"auth_token_cmd,omitempty"`
}

type telemetryView struct {
	Enabled      bool   `json:"enabled"`
	Exporter     string `json:"exporter,omitempty"`
	OTLPEndpoint string `json:"otlp_endpoint,omitempty"`
	ContentLog   bool   `json:"content_logging"`
}

type mcpServerView struct {
	Name    string   `json:"name"`
	Type    string   `json:"type,omitempty"`
	Command string   `json:"command,omitempty"`
	URL     string   `json:"url,omitempty"`
	Tools   []string `json:"tools,omitempty"`
}

func readConfigFile(path string) (configFile, bool, error) {
	var cfg configFile
	data, err := os.ReadFile(path)
	if err != nil {
		if errors.Is(err, os.ErrNotExist) {
			return cfg, false, nil
		}
		return cfg, false, fmt.Errorf("read config: %w", err)
	}
	if len(strings.TrimSpace(string(data))) == 0 {
		return cfg, true, nil
	}
	if err := json.Unmarshal(data, &cfg); err != nil {
		return configFile{}, true, fmt.Errorf("parse config: %w", err)
	}
	return cfg, true, nil
}

func buildConfigSummary(path string) configSummaryView {
	cfg, exists, err := readConfigFile(path)
	view := configSummaryView{
		Path:           path,
		Exists:         exists,
		Active:         activeFromConfig(cfg),
		MaxTokens:      cfg.MaxTokens,
		Effort:         cfg.Effort,
		Language:       cfg.Language,
		MCPServerCount: len(cfg.MCPServers),
	}
	if err != nil {
		view.Error = err.Error()
		view.Active = activeView{Source: "none", AuthMode: "none"}
	}
	return view
}

func activeFromConfig(cfg configFile) activeView {
	if cfg.Provider != "" {
		if preset, ok := llm.LookupProvider(cfg.Provider); ok {
			entry := cfg.Providers[cfg.Provider]
			view := activeView{
				Provider:      preset.Name,
				ProviderLabel: preset.DisplayName,
				ProviderKind:  "preset",
				Model:         activeModel(cfg.Model, entry.Model),
				Source:        "provider",
				Protocol:      preset.Protocol,
				BaseURL:       preset.BaseURL,
				EnvVar:        preset.EnvVar,
				KeySet:        strings.TrimSpace(entry.APIKey) != "" || strings.TrimSpace(entry.APIKeyCmd) != "",
				EnvSet:        preset.EnvVar != "" && strings.TrimSpace(os.Getenv(preset.EnvVar)) != "",
			}
			if entry.URL != "" {
				view.BaseURL = entry.URL
			}
			if entry.Protocol != "" {
				view.Protocol = llm.NormalizeProtocol(entry.Protocol)
			}
			switch {
			case preset.AmbientAuth:
				view.AuthMode = "ambient"
				view.Configured = true
			case preset.ExternalAuth:
				view.AuthMode = "sign_in"
			case view.KeySet:
				view.AuthMode = "api_key"
				view.Configured = true
			case view.EnvSet:
				view.AuthMode = "env"
				view.Configured = true
			default:
				view.AuthMode = "none"
			}
			return view
		}
		if entry, ok := cfg.CustomProviders[cfg.Provider]; ok {
			view := activeView{
				Provider:     cfg.Provider,
				ProviderKind: "custom",
				Model:        activeModel(cfg.Model, entry.Model),
				Source:       "provider",
				Protocol:     llm.NormalizeProtocol(entry.Protocol),
				BaseURL:      entry.URL,
				KeySet:       strings.TrimSpace(entry.APIKey) != "" || strings.TrimSpace(entry.APIKeyCmd) != "",
			}
			if view.KeySet {
				view.AuthMode = "api_key"
				view.Configured = true
			} else {
				view.AuthMode = "none"
			}
			return view
		}
		return activeView{
			Provider:     cfg.Provider,
			ProviderKind: "unknown",
			Model:        cfg.Model,
			Source:       "provider",
			AuthMode:     "none",
		}
	}
	if env, ok := activeFromEnvironment(); ok {
		return env
	}
	if cfg.LLM.URL != "" || cfg.LLM.Model != "" {
		view := activeView{
			ProviderLabel: "Custom endpoint (llm.*)",
			Source:        "legacy",
			Model:         cfg.LLM.Model,
			Protocol:      llm.NormalizeProtocol(cfg.LLM.Protocol),
			BaseURL:       cfg.LLM.URL,
			AuthMode:      "none",
		}
		if view.Protocol == "" {
			if cfg.LLM.UseAnthropic != nil && !*cfg.LLM.UseAnthropic {
				view.Protocol = llm.ProtocolOpenAIChatCompletions
			} else {
				view.Protocol = llm.ProtocolAnthropic
			}
		}
		if strings.TrimSpace(cfg.LLM.AuthToken) != "" || strings.TrimSpace(cfg.LLM.AuthTokenCmd) != "" {
			view.AuthMode = "api_key"
			view.Configured = true
		}
		return view
	}
	return activeView{Source: "none", AuthMode: "none"}
}

func activeModel(global, entry string) string {
	if global != "" {
		return global
	}
	return entry
}

func activeFromEnvironment() (activeView, bool) {
	ocrURL := strings.TrimSpace(os.Getenv("OCR_LLM_URL"))
	ocrToken := strings.TrimSpace(os.Getenv("OCR_LLM_TOKEN"))
	ocrModel := strings.TrimSpace(os.Getenv("OCR_LLM_MODEL"))
	if ocrURL != "" && ocrToken != "" && ocrModel != "" {
		return activeView{
			ProviderLabel: "OCR environment variables",
			Source:        "ocr-env",
			Model:         ocrModel,
			Protocol:      llm.ProtocolAnthropic,
			BaseURL:       ocrURL,
			AuthMode:      "env",
			EnvSet:        true,
			Configured:    true,
		}, true
	}
	claudeURL := strings.TrimSpace(os.Getenv("ANTHROPIC_BASE_URL"))
	claudeToken := strings.TrimSpace(os.Getenv("ANTHROPIC_AUTH_TOKEN"))
	if claudeToken == "" {
		claudeToken = strings.TrimSpace(os.Getenv("ANTHROPIC_API_KEY"))
	}
	claudeModel := strings.TrimSpace(os.Getenv("ANTHROPIC_MODEL"))
	if claudeURL != "" && claudeToken != "" && claudeModel != "" {
		return activeView{
			ProviderLabel: "Claude Code environment",
			Source:        "claude-env",
			Model:         claudeModel,
			Protocol:      llm.ProtocolAnthropic,
			BaseURL:       claudeURL,
			AuthMode:      "env",
			EnvSet:        true,
			Configured:    true,
		}, true
	}
	return activeView{}, false
}

func buildConfigView(path string) configView {
	cfg, exists, err := readConfigFile(path)
	view := configView{
		configSummaryView: buildConfigSummary(path),
		LLM: llmConfigView{
			URL:          cfg.LLM.URL,
			Model:        cfg.LLM.Model,
			Protocol:     cfg.LLM.Protocol,
			AuthHeader:   cfg.LLM.AuthHeader,
			TimeoutSec:   cfg.LLM.TimeoutSec,
			UseAnthropic: cfg.LLM.UseAnthropic,
			AuthTokenSet: strings.TrimSpace(cfg.LLM.AuthToken) != "",
			AuthTokenCmd: cfg.LLM.AuthTokenCmd,
		},
	}
	view.Exists = exists
	if err != nil {
		view.Error = err.Error()
		return view
	}
	if len(cfg.Providers) > 0 {
		view.Providers = make(map[string]providerEntryView, len(cfg.Providers))
		for name, entry := range cfg.Providers {
			view.Providers[name] = providerEntryToView(entry)
		}
	}
	if len(cfg.CustomProviders) > 0 {
		view.CustomProviders = make(map[string]providerEntryView, len(cfg.CustomProviders))
		for name, entry := range cfg.CustomProviders {
			view.CustomProviders[name] = providerEntryToView(entry)
		}
	}
	if cfg.Telemetry != nil {
		view.Telemetry = &telemetryView{
			Enabled:      cfg.Telemetry.Enabled,
			Exporter:     cfg.Telemetry.Exporter,
			OTLPEndpoint: cfg.Telemetry.OTLPEndpoint,
			ContentLog:   cfg.Telemetry.ContentLog,
		}
	}
	names := make([]string, 0, len(cfg.MCPServers))
	for name := range cfg.MCPServers {
		names = append(names, name)
	}
	sort.Strings(names)
	for _, name := range names {
		server := cfg.MCPServers[name]
		view.MCPServers = append(view.MCPServers, mcpServerView{
			Name:    name,
			Type:    server.Type,
			Command: server.Command,
			URL:     server.URL,
			Tools:   append([]string(nil), server.Tools...),
		})
	}
	return view
}

func providerEntryToView(entry providerFile) providerEntryView {
	return providerEntryView{
		URL:          entry.URL,
		Protocol:     entry.Protocol,
		Model:        entry.Model,
		Models:       append([]string(nil), entry.Models...),
		AuthHeader:   entry.AuthHeader,
		TimeoutSec:   entry.TimeoutSec,
		AWSProfile:   entry.AWSProfile,
		AWSRegion:    entry.AWSRegion,
		APIKeySet:    strings.TrimSpace(entry.APIKey) != "",
		APIKeyCmd:    entry.APIKeyCmd,
		APIKeyCmdSet: strings.TrimSpace(entry.APIKeyCmd) != "",
	}
}

type providersResponse struct {
	Active    activeView     `json:"active"`
	Providers []providerCard `json:"providers"`
	Custom    []providerCard `json:"custom"`
	Error     string         `json:"error,omitempty"`
}

type providerCard struct {
	Name         string   `json:"name"`
	DisplayName  string   `json:"display_name"`
	Protocol     string   `json:"protocol,omitempty"`
	BaseURL      string   `json:"base_url,omitempty"`
	EnvVar       string   `json:"env_var,omitempty"`
	AmbientAuth  bool     `json:"ambient_auth,omitempty"`
	ExternalAuth bool     `json:"external_auth,omitempty"`
	Models       []string `json:"models"`
	Model        string   `json:"model,omitempty"`
	Configured   bool     `json:"configured"`
	AuthMode     string   `json:"auth_mode"`
	KeySet       bool     `json:"key_set"`
	EnvSet       bool     `json:"env_set"`
	Active       bool     `json:"active"`
	Custom       bool     `json:"custom"`
}

func buildProvidersResponse(path string) providersResponse {
	cfg, _, err := readConfigFile(path)
	active := activeFromConfig(cfg)
	response := providersResponse{
		Active:    active,
		Providers: []providerCard{},
		Custom:    []providerCard{},
	}
	if err != nil {
		response.Error = err.Error()
	}
	for _, preset := range llm.ListProviders() {
		entry := cfg.Providers[preset.Name]
		card := providerCard{
			Name:         preset.Name,
			DisplayName:  preset.DisplayName,
			Protocol:     preset.Protocol,
			BaseURL:      preset.BaseURL,
			EnvVar:       preset.EnvVar,
			AmbientAuth:  preset.AmbientAuth,
			ExternalAuth: preset.ExternalAuth,
			Models:       mergeModels(preset.Models, entry.Models),
			Model:        entry.Model,
			KeySet:       strings.TrimSpace(entry.APIKey) != "" || strings.TrimSpace(entry.APIKeyCmd) != "",
			EnvSet:       preset.EnvVar != "" && strings.TrimSpace(os.Getenv(preset.EnvVar)) != "",
			Active:       cfg.Provider == preset.Name,
			Custom:       false,
		}
		if entry.URL != "" {
			card.BaseURL = entry.URL
		}
		if entry.Protocol != "" {
			card.Protocol = llm.NormalizeProtocol(entry.Protocol)
		}
		switch {
		case preset.AmbientAuth:
			card.AuthMode = "ambient"
			card.Configured = true
		case preset.ExternalAuth:
			card.AuthMode = "sign_in"
		case card.KeySet:
			card.AuthMode = "api_key"
			card.Configured = true
		case card.EnvSet:
			card.AuthMode = "env"
			card.Configured = true
		default:
			card.AuthMode = "none"
		}
		if card.Active {
			card.Model = activeModel(cfg.Model, entry.Model)
		}
		response.Providers = append(response.Providers, card)
	}
	for name, entry := range cfg.CustomProviders {
		card := providerCard{
			Name:        name,
			DisplayName: name,
			Protocol:    llm.NormalizeProtocol(entry.Protocol),
			BaseURL:     entry.URL,
			Models:      mergeModels(entry.Models, nil),
			Model:       entry.Model,
			KeySet:      strings.TrimSpace(entry.APIKey) != "" || strings.TrimSpace(entry.APIKeyCmd) != "",
			Active:      cfg.Provider == name,
			Custom:      true,
		}
		if card.KeySet {
			card.AuthMode = "api_key"
			card.Configured = true
		} else {
			card.AuthMode = "none"
		}
		if card.Active {
			card.Model = activeModel(cfg.Model, entry.Model)
		}
		response.Custom = append(response.Custom, card)
	}
	sort.Slice(response.Custom, func(i, j int) bool { return response.Custom[i].Name < response.Custom[j].Name })
	return response
}

func mergeModels(base, extra []string) []string {
	seen := make(map[string]struct{}, len(base)+len(extra))
	out := make([]string, 0, len(base)+len(extra))
	for _, list := range [][]string{base, extra} {
		for _, model := range list {
			model = strings.TrimSpace(model)
			if model == "" {
				continue
			}
			if _, ok := seen[model]; ok {
				continue
			}
			seen[model] = struct{}{}
			out = append(out, model)
		}
	}
	return out
}

var (
	providerConfigKeyRE = regexp.MustCompile(`^providers\.[A-Za-z0-9][A-Za-z0-9._-]*\.(api_key|api_key_cmd|model|models|url|protocol|auth_header|timeout_sec|aws_region|aws_profile)$`)
	customConfigKeyRE   = regexp.MustCompile(`^custom_providers\.[A-Za-z0-9][A-Za-z0-9._-]*\.(api_key|api_key_cmd|model|models|url|protocol|auth_header|timeout_sec|extra_body|extra_headers|retry_codes)$`)
	mcpConfigKeyRE      = regexp.MustCompile(`^mcp_servers\.[A-Za-z0-9][A-Za-z0-9._-]*\.(type|command|args|env|url|headers|tools|setup)$`)
	unsetConfigKeyRE    = regexp.MustCompile(`^(provider|max_tokens|effort|custom_providers\.[A-Za-z0-9][A-Za-z0-9._-]*|mcp_servers\.[A-Za-z0-9][A-Za-z0-9._-]*)$`)
)

var exactConfigKeys = map[string]struct{}{
	"provider": {}, "model": {}, "max_tokens": {}, "effort": {}, "language": {},
	"llm.url": {}, "llm.auth_token": {}, "llm.auth_token_cmd": {}, "llm.auth_header": {},
	"llm.model": {}, "llm.timeout_sec": {}, "llm.protocol": {}, "llm.use_anthropic": {},
	"llm.extra_headers": {}, "llm.retry_codes": {}, "llm.extra_body": {},
	"telemetry.enabled": {}, "telemetry.exporter": {}, "telemetry.otlp_endpoint": {}, "telemetry.content_logging": {},
}

type configApplyRequest struct {
	Set   map[string]string `json:"set"`
	Unset []string          `json:"unset"`
}

type configApplyResponse struct {
	OK       bool     `json:"ok"`
	Applied  []string `json:"applied"`
	Messages []string `json:"messages"`
}

func validConfigKey(key string) bool {
	if _, ok := exactConfigKeys[key]; ok {
		return true
	}
	return providerConfigKeyRE.MatchString(key) ||
		customConfigKeyRE.MatchString(key) ||
		mcpConfigKeyRE.MatchString(key)
}

func isSecretConfigKey(key string) bool {
	normalized := strings.ToLower(strings.ReplaceAll(key, "_", ""))
	return strings.HasSuffix(normalized, "apikey") || strings.HasSuffix(normalized, "authtoken")
}

func configKeyRank(key string) int {
	switch key {
	case "provider":
		return 3
	case "model":
		return 4
	default:
		return 1
	}
}

func configUnsetRank(key string) int {
	if key == "provider" {
		return 0
	}
	if key == "custom_providers" || strings.HasPrefix(key, "custom_providers.") {
		return 2
	}
	return 1
}

func sortedConfigKeys(values map[string]string) []string {
	keys := make([]string, 0, len(values))
	for key := range values {
		keys = append(keys, key)
	}
	sort.Slice(keys, func(i, j int) bool {
		ri, rj := configKeyRank(keys[i]), configKeyRank(keys[j])
		if ri != rj {
			return ri < rj
		}
		return keys[i] < keys[j]
	})
	return keys
}

func sortedUnsetKeys(keys []string) []string {
	out := append([]string(nil), keys...)
	sort.Slice(out, func(i, j int) bool {
		ri, rj := configUnsetRank(out[i]), configUnsetRank(out[j])
		if ri != rj {
			return ri < rj
		}
		return out[i] < out[j]
	})
	return out
}

func validateConfigValue(key, value string) error {
	if strings.ContainsRune(value, '\x00') {
		return fmt.Errorf("%s contains a NUL character", key)
	}
	limit := 16384
	if isSecretConfigKey(key) {
		limit = 8192
	}
	if len(value) > limit {
		return fmt.Errorf("value for %s is limited to %d characters", key, limit)
	}
	return nil
}

type activateProviderRequest struct {
	Name         string `json:"name"`
	Model        string `json:"model"`
	APIKey       string `json:"api_key"`
	URL          string `json:"url"`
	Protocol     string `json:"protocol"`
	CreateCustom bool   `json:"create_custom"`
}

type activateProviderResponse struct {
	OK       bool     `json:"ok"`
	Messages []string `json:"messages"`
}

func (s *Server) handleConfig(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, buildConfigView(s.configPath))
}

func (s *Server) handleProviders(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, buildProvidersResponse(s.configPath))
}

func (s *Server) handleConfigApply(w http.ResponseWriter, r *http.Request) {
	var req configApplyRequest
	if err := readJSON(w, r, &req); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	if len(req.Set) == 0 && len(req.Unset) == 0 {
		writeError(w, http.StatusBadRequest, "no configuration changes were provided")
		return
	}
	if len(req.Set) > 30 || len(req.Unset) > 30 {
		writeError(w, http.StatusBadRequest, "at most 30 changes are allowed per request")
		return
	}
	for key := range req.Set {
		if !validConfigKey(key) {
			writeError(w, http.StatusBadRequest, fmt.Sprintf("unsupported config key %q", key))
			return
		}
	}
	for _, key := range req.Unset {
		if !unsetConfigKeyRE.MatchString(key) {
			writeError(w, http.StatusBadRequest, fmt.Sprintf("unsupported unset key %q", key))
			return
		}
	}

	s.configMu.Lock()
	defer s.configMu.Unlock()

	response := configApplyResponse{OK: true}
	for _, key := range sortedConfigKeys(req.Set) {
		value := req.Set[key]
		if err := validateConfigValue(key, value); err != nil {
			writeError(w, http.StatusBadRequest, err.Error())
			return
		}
		message, err := s.runConfigCommand("set", key, value)
		if err != nil {
			writeError(w, http.StatusBadRequest, fmt.Sprintf("config set %s failed: %v", key, err))
			return
		}
		response.Applied = append(response.Applied, key)
		if message != "" {
			response.Messages = append(response.Messages, message)
		}
	}
	for _, key := range sortedUnsetKeys(req.Unset) {
		message, err := s.runConfigCommand("unset", key)
		if err != nil {
			writeError(w, http.StatusBadRequest, fmt.Sprintf("config unset %s failed: %v", key, err))
			return
		}
		response.Applied = append(response.Applied, key)
		if message != "" {
			response.Messages = append(response.Messages, message)
		}
	}
	writeJSON(w, http.StatusOK, response)
}

func (s *Server) handleActivateProvider(w http.ResponseWriter, r *http.Request) {
	var req activateProviderRequest
	if err := readJSON(w, r, &req); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	req.Name = strings.TrimSpace(req.Name)
	req.Model = strings.TrimSpace(req.Model)
	req.APIKey = strings.TrimSpace(req.APIKey)
	req.URL = strings.TrimSpace(req.URL)
	req.Protocol = strings.TrimSpace(req.Protocol)
	if err := validateModelAndProvider(req.Name, req.Model); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	if req.Name == "" {
		writeError(w, http.StatusBadRequest, "provider name is required")
		return
	}
	if req.Model == "" {
		writeError(w, http.StatusBadRequest, "model is required")
		return
	}
	if err := validateConfigValue("api_key", req.APIKey); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	if strings.ContainsAny(req.APIKey, "\r\n") {
		writeError(w, http.StatusBadRequest, "api_key must be a single line")
		return
	}

	cfg, _, err := readConfigFile(s.configPath)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	_, isPreset := llm.LookupProvider(req.Name)
	_, isCustom := cfg.CustomProviders[req.Name]
	if !isPreset && !isCustom && !req.CreateCustom {
		writeError(w, http.StatusBadRequest, fmt.Sprintf("provider %q is not configured; create it as a custom provider first", req.Name))
		return
	}

	steps := make([]configStep, 0, 6)
	if !isPreset {
		// A new custom provider with a dot in its name cannot receive field
		// writes until it exists, so select it first; the CLI creates the empty
		// entry as part of that write.
		if req.CreateCustom {
			steps = append(steps, configStep{key: "provider", value: req.Name})
		}
		protocol := llm.NormalizeProtocol(req.Protocol)
		if protocol == "" && req.CreateCustom {
			protocol = llm.ProtocolOpenAIChatCompletions
		}
		if protocol != "" {
			if err := llm.ValidateProtocol(protocol); err != nil {
				writeError(w, http.StatusBadRequest, err.Error())
				return
			}
		}
		if req.URL != "" {
			if err := validateProviderURL(req.URL); err != nil {
				writeError(w, http.StatusBadRequest, err.Error())
				return
			}
			steps = append(steps, configStep{key: "custom_providers." + req.Name + ".url", value: req.URL})
		} else if req.CreateCustom {
			writeError(w, http.StatusBadRequest, "url is required for a new custom provider")
			return
		}
		if protocol != "" {
			steps = append(steps, configStep{key: "custom_providers." + req.Name + ".protocol", value: protocol})
		}
		if req.APIKey != "" {
			steps = append(steps, configStep{key: "custom_providers." + req.Name + ".api_key", value: req.APIKey})
		}
	} else if req.APIKey != "" {
		steps = append(steps, configStep{key: "providers." + req.Name + ".api_key", value: req.APIKey})
	}
	if !req.CreateCustom {
		steps = append(steps, configStep{key: "provider", value: req.Name})
	}
	steps = append(steps, configStep{key: "model", value: req.Model})

	s.configMu.Lock()
	defer s.configMu.Unlock()
	response := activateProviderResponse{OK: true}
	for _, step := range steps {
		message, err := s.runConfigCommand("set", step.key, step.value)
		if err != nil {
			writeError(w, http.StatusBadRequest, fmt.Sprintf("config set %s failed: %v", step.key, err))
			return
		}
		if message != "" {
			response.Messages = append(response.Messages, message)
		}
	}
	writeJSON(w, http.StatusOK, response)
}

type configStep struct {
	key   string
	value string
}

func validateProviderURL(raw string) error {
	parsed, err := url.Parse(raw)
	if err != nil {
		return fmt.Errorf("invalid provider url: %w", err)
	}
	if parsed.Scheme != "http" && parsed.Scheme != "https" {
		return errors.New("provider url must start with http:// or https://")
	}
	if parsed.Host == "" {
		return errors.New("provider url must include a host")
	}
	return nil
}

func (s *Server) runConfigCommand(action, key string, values ...string) (string, error) {
	args := append([]string{"config", action, key}, values...)
	ctx, cancel := context.WithTimeout(context.Background(), 45*time.Second)
	defer cancel()
	result := s.runner.Run(ctx, Spec{Args: args, Dir: s.repoDir}, nil)
	output := strings.TrimSpace(string(result.Stdout))
	if output == "" {
		output = strings.TrimSpace(string(result.Stderr))
	}
	if len(values) > 0 && isSecretConfigKey(key) && values[0] != "" {
		output = strings.ReplaceAll(output, values[0], "***")
	}
	if result.Err != nil || result.ExitCode != 0 {
		detail := strings.TrimSpace(string(result.Stderr))
		if detail == "" {
			detail = output
		}
		if len(values) > 0 && isSecretConfigKey(key) {
			detail = redactSecret(detail, values[0])
		}
		if detail == "" && result.Err != nil {
			detail = result.Err.Error()
		}
		if detail == "" {
			detail = fmt.Sprintf("exit code %d", result.ExitCode)
		}
		return "", errors.New(truncateText(detail, 2000))
	}
	if isSecretConfigKey(key) {
		// The CLI prints a masked key for confirmation. The console never
		// returns key fragments, even masked ones.
		return fmt.Sprintf("Set %s = ***", key), nil
	}
	return output, nil
}

var secretAssignmentRE = regexp.MustCompile(`(?i)((?:api[_-]?key|auth[_-]?token)\s*=\s*)\S+`)

func redactSecret(text, secret string) string {
	if secret != "" {
		text = strings.ReplaceAll(text, secret, "***")
	}
	return secretAssignmentRE.ReplaceAllString(text, "${1}***")
}
