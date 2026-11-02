// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

package console

import (
	"errors"
	"fmt"
	"net/http"
	"regexp"
	"strconv"
	"strings"

	"github.com/alibaba/open-code-review/internal/config/template"
	"github.com/alibaba/open-code-review/internal/session"
)

const (
	maxBackgroundChars = 20000
	maxExcludeChars    = 4000
	maxModelChars      = 200
	maxProviderChars   = 100
)

var providerNameRE = regexp.MustCompile(`^[A-Za-z0-9][A-Za-z0-9._-]*$`)

type reviewRequest struct {
	Mode            string `json:"mode"`
	From            string `json:"from"`
	To              string `json:"to"`
	Commit          string `json:"commit"`
	Resume          string `json:"resume"`
	Background      string `json:"background"`
	Exclude         string `json:"exclude"`
	Provider        string `json:"provider"`
	Model           string `json:"model"`
	Effort          string `json:"effort"`
	Concurrency     *int   `json:"concurrency"`
	Timeout         *int   `json:"timeout"`
	MaxTokens       *int   `json:"max_tokens"`
	MaxTokensBudget *int   `json:"max_tokens_budget"`
	NoFilter        bool   `json:"no_filter"`
	Preview         bool   `json:"preview"`
}

type scanRequest struct {
	Paths           string `json:"paths"`
	Background      string `json:"background"`
	Exclude         string `json:"exclude"`
	Provider        string `json:"provider"`
	Model           string `json:"model"`
	Batch           string `json:"batch"`
	Concurrency     *int   `json:"concurrency"`
	Timeout         *int   `json:"timeout"`
	MaxTokens       *int   `json:"max_tokens"`
	MaxTokensBudget *int   `json:"max_tokens_budget"`
	NoPlan          bool   `json:"no_plan"`
	NoDedup         bool   `json:"no_dedup"`
	NoSummary       bool   `json:"no_summary"`
	Preview         bool   `json:"preview"`
	Resume          string `json:"resume"`
}

func intOrDefault(v *int, fallback int) int {
	if v == nil {
		return fallback
	}
	return *v
}

func validateRef(name, flag string) error {
	if name == "" {
		return fmt.Errorf("%s is required", flag)
	}
	if len(name) > 255 {
		return fmt.Errorf("%s is too long", flag)
	}
	if strings.HasPrefix(name, "-") {
		return fmt.Errorf("%s must not start with '-'", flag)
	}
	if strings.Contains(name, "..") {
		return fmt.Errorf("%s must be a single ref, not a range", flag)
	}
	if strings.ContainsAny(name, " \t\r\n\x00") {
		return fmt.Errorf("%s contains an unsupported character", flag)
	}
	return nil
}

func validateOptionalText(value, label string, maxLen int) error {
	if len(value) > maxLen {
		return fmt.Errorf("%s is limited to %d characters", label, maxLen)
	}
	if strings.ContainsRune(value, '\x00') {
		return fmt.Errorf("%s contains a NUL character", label)
	}
	return nil
}

func validateModelAndProvider(provider, model string) error {
	if provider != "" {
		if len(provider) > maxProviderChars || !providerNameRE.MatchString(provider) {
			return fmt.Errorf("invalid provider name %q", provider)
		}
	}
	if len(model) > maxModelChars {
		return fmt.Errorf("model is limited to %d characters", maxModelChars)
	}
	if strings.ContainsAny(model, "\x00\r\n") {
		return fmt.Errorf("model contains an unsupported character")
	}
	return nil
}

func normalizeReviewRequest(req *reviewRequest) error {
	req.Mode = strings.TrimSpace(req.Mode)
	req.From = strings.TrimSpace(req.From)
	req.To = strings.TrimSpace(req.To)
	req.Commit = strings.TrimSpace(req.Commit)
	req.Resume = strings.TrimSpace(req.Resume)
	req.Provider = strings.TrimSpace(req.Provider)
	req.Model = strings.TrimSpace(req.Model)
	req.Effort = strings.TrimSpace(strings.ToLower(req.Effort))

	switch req.Mode {
	case "", "workspace":
		req.Mode = "workspace"
		if req.From != "" || req.To != "" || req.Commit != "" {
			return errors.New("workspace mode does not accept a ref or commit")
		}
	case "commit":
		if err := validateRef(req.Commit, "commit"); err != nil {
			return err
		}
		if req.From != "" || req.To != "" {
			return errors.New("commit mode does not accept from/to")
		}
	case "range":
		if err := validateRef(req.From, "from"); err != nil {
			return err
		}
		if err := validateRef(req.To, "to"); err != nil {
			return err
		}
		if req.Commit != "" {
			return errors.New("range mode does not accept a commit")
		}
	default:
		return fmt.Errorf("unknown review mode %q", req.Mode)
	}

	if req.Resume != "" {
		if req.Mode == "workspace" {
			return errors.New("resume requires commit or range mode")
		}
		if err := session.ValidateSessionID(req.Resume); err != nil {
			return err
		}
	}
	if req.Preview && req.Resume != "" {
		return errors.New("preview and resume cannot be combined")
	}
	if err := validateOptionalText(req.Background, "background", maxBackgroundChars); err != nil {
		return err
	}
	if err := validateOptionalText(req.Exclude, "exclude", maxExcludeChars); err != nil {
		return err
	}
	if err := validateModelAndProvider(req.Provider, req.Model); err != nil {
		return err
	}
	if req.Effort != "" {
		if _, err := template.ParseEffort(req.Effort); err != nil {
			return err
		}
	}
	if err := validateIntRange(intOrDefault(req.Concurrency, 8), "concurrency", 1, 64); err != nil {
		return err
	}
	if err := validateIntRange(intOrDefault(req.Timeout, 15), "timeout", 0, 1440); err != nil {
		return err
	}
	if err := validateIntRange(intOrDefault(req.MaxTokens, 0), "max_tokens", 0, 10_000_000); err != nil {
		return err
	}
	if err := validateIntRange(intOrDefault(req.MaxTokensBudget, 0), "max_tokens_budget", 0, 1_000_000_000); err != nil {
		return err
	}
	return nil
}

func normalizeScanRequest(req *scanRequest) error {
	req.Paths = strings.TrimSpace(req.Paths)
	req.Provider = strings.TrimSpace(req.Provider)
	req.Model = strings.TrimSpace(req.Model)
	req.Batch = strings.TrimSpace(req.Batch)
	req.Resume = strings.TrimSpace(req.Resume)

	if err := validateOptionalText(req.Background, "background", maxBackgroundChars); err != nil {
		return err
	}
	if err := validateOptionalText(req.Exclude, "exclude", maxExcludeChars); err != nil {
		return err
	}
	if err := validateModelAndProvider(req.Provider, req.Model); err != nil {
		return err
	}
	if err := validateScanPaths(req.Paths); err != nil {
		return err
	}
	switch req.Batch {
	case "", "none", "by-language", "by-directory":
	default:
		return fmt.Errorf("unknown batch strategy %q", req.Batch)
	}
	if req.Resume != "" {
		if err := session.ValidateSessionID(req.Resume); err != nil {
			return err
		}
	}
	if req.Preview && req.Resume != "" {
		return errors.New("preview and resume cannot be combined")
	}
	if err := validateIntRange(intOrDefault(req.Concurrency, 8), "concurrency", 1, 64); err != nil {
		return err
	}
	if err := validateIntRange(intOrDefault(req.Timeout, 15), "timeout", 0, 1440); err != nil {
		return err
	}
	if err := validateIntRange(intOrDefault(req.MaxTokens, 0), "max_tokens", 0, 10_000_000); err != nil {
		return err
	}
	if err := validateIntRange(intOrDefault(req.MaxTokensBudget, 0), "max_tokens_budget", 0, 1_000_000_000); err != nil {
		return err
	}
	return nil
}

func validateScanPaths(paths string) error {
	for _, raw := range strings.Split(paths, ",") {
		p := strings.TrimSpace(raw)
		if p == "" {
			continue
		}
		if strings.HasPrefix(p, "-") {
			return fmt.Errorf("scan path %q must not start with '-'", p)
		}
		if strings.ContainsAny(p, "\x00\r\n") {
			return fmt.Errorf("scan path %q contains an unsupported character", p)
		}
		normalized := strings.ReplaceAll(p, `\`, "/")
		if strings.HasPrefix(normalized, "/") || (len(normalized) > 1 && normalized[1] == ':') {
			return fmt.Errorf("scan path %q must be repo-relative", p)
		}
		for _, segment := range strings.Split(normalized, "/") {
			if segment == ".." {
				return fmt.Errorf("scan path %q must stay inside the repository", p)
			}
		}
	}
	return nil
}

func validateIntRange(value int, label string, minValue, maxValue int) error {
	if value < minValue || value > maxValue {
		return fmt.Errorf("%s must be between %d and %d", label, minValue, maxValue)
	}
	return nil
}

func buildReviewSpec(req reviewRequest, repoDir string) (Spec, error) {
	if err := normalizeReviewRequest(&req); err != nil {
		return Spec{}, err
	}
	args := []string{"review", "--format", "json", "--audience", "human"}
	switch req.Mode {
	case "commit":
		args = append(args, "--commit", req.Commit)
	case "range":
		args = append(args, "--from", req.From, "--to", req.To)
	}
	if req.Resume != "" {
		args = append(args, "--resume", req.Resume)
	}
	if req.Background != "" {
		args = append(args, "--background", req.Background)
	}
	if req.Exclude != "" {
		args = append(args, "--exclude", req.Exclude)
	}
	if req.Provider != "" {
		args = append(args, "--provider", req.Provider)
	}
	if req.Model != "" {
		args = append(args, "--model", req.Model)
	}
	if req.Effort != "" {
		args = append(args, "--effort", req.Effort)
	}
	args = append(args, "--concurrency", strconv.Itoa(intOrDefault(req.Concurrency, 8)))
	args = append(args, "--timeout", strconv.Itoa(intOrDefault(req.Timeout, 15)))
	if intOrDefault(req.MaxTokens, 0) > 0 {
		args = append(args, "--max-tokens", strconv.Itoa(*req.MaxTokens))
	}
	if intOrDefault(req.MaxTokensBudget, 0) > 0 {
		args = append(args, "--max-tokens-budget", strconv.Itoa(*req.MaxTokensBudget))
	}
	if req.NoFilter {
		args = append(args, "--no-filter")
	}
	if req.Preview {
		args = append(args, "--preview")
	}
	return Spec{
		Kind:       "review",
		Title:      reviewTitle(req),
		Args:       args,
		Dir:        repoDir,
		ExpectJSON: true,
	}, nil
}

func reviewTitle(req reviewRequest) string {
	prefix := "Review"
	if req.Preview {
		prefix = "Preview"
	}
	switch req.Mode {
	case "commit":
		return fmt.Sprintf("%s commit %s", prefix, shortRef(req.Commit))
	case "range":
		return fmt.Sprintf("%s %s..%s", prefix, shortRef(req.From), shortRef(req.To))
	default:
		if req.Resume != "" {
			return fmt.Sprintf("%s resumed session", prefix)
		}
		return prefix + " workspace changes"
	}
}

func buildScanSpec(req scanRequest, repoDir string) (Spec, error) {
	if err := normalizeScanRequest(&req); err != nil {
		return Spec{}, err
	}
	args := []string{"scan", "--format", "json", "--audience", "human"}
	if req.Paths != "" {
		args = append(args, "--path", req.Paths)
	}
	if req.Background != "" {
		args = append(args, "--background", req.Background)
	}
	if req.Exclude != "" {
		args = append(args, "--exclude", req.Exclude)
	}
	if req.Provider != "" {
		args = append(args, "--provider", req.Provider)
	}
	if req.Model != "" {
		args = append(args, "--model", req.Model)
	}
	if req.Batch != "" {
		args = append(args, "--batch", req.Batch)
	}
	args = append(args, "--concurrency", strconv.Itoa(intOrDefault(req.Concurrency, 8)))
	args = append(args, "--timeout", strconv.Itoa(intOrDefault(req.Timeout, 15)))
	if intOrDefault(req.MaxTokens, 0) > 0 {
		args = append(args, "--max-tokens", strconv.Itoa(*req.MaxTokens))
	}
	if intOrDefault(req.MaxTokensBudget, 0) > 0 {
		args = append(args, "--max-tokens-budget", strconv.Itoa(*req.MaxTokensBudget))
	}
	if req.NoPlan {
		args = append(args, "--no-plan")
	}
	if req.NoDedup {
		args = append(args, "--no-dedup")
	}
	if req.NoSummary {
		args = append(args, "--no-summary")
	}
	if req.Preview {
		args = append(args, "--preview")
	}
	if req.Resume != "" {
		args = append(args, "--resume", req.Resume)
	}
	return Spec{
		Kind:       "scan",
		Title:      scanTitle(req),
		Args:       args,
		Dir:        repoDir,
		ExpectJSON: true,
	}, nil
}

func scanTitle(req scanRequest) string {
	prefix := "Scan"
	if req.Preview {
		prefix = "Preview scan of"
	}
	if req.Paths != "" {
		return prefix + " selected paths"
	}
	return prefix + " repository"
}

func shortRef(ref string) string {
	if len(ref) > 24 {
		return ref[:24] + "..."
	}
	return ref
}

func (s *Server) handleStartReview(w http.ResponseWriter, r *http.Request) {
	var req reviewRequest
	if err := readJSON(w, r, &req); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	spec, err := buildReviewSpec(req, s.repoRoot())
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	job, err := s.jobs.Start(spec)
	if err != nil {
		if errors.Is(err, ErrJobRunning) {
			writeError(w, http.StatusConflict, err.Error())
			return
		}
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusAccepted, job)
}

func (s *Server) handleStartScan(w http.ResponseWriter, r *http.Request) {
	var req scanRequest
	if err := readJSON(w, r, &req); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	spec, err := buildScanSpec(req, s.repoRoot())
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	job, err := s.jobs.Start(spec)
	if err != nil {
		if errors.Is(err, ErrJobRunning) {
			writeError(w, http.StatusConflict, err.Error())
			return
		}
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusAccepted, job)
}

func (s *Server) handleLLMTest(w http.ResponseWriter, r *http.Request) {
	job, err := s.jobs.Start(Spec{
		Kind:         "llm-test",
		Title:        "Test LLM connection",
		Args:         []string{"llm", "test"},
		Dir:          s.repoRoot(),
		StreamStdout: true,
	})
	if err != nil {
		if errors.Is(err, ErrJobRunning) {
			writeError(w, http.StatusConflict, err.Error())
			return
		}
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusAccepted, job)
}
