// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

package console

import (
	"net/http"
	"strings"
	"sync"

	"github.com/alibaba/open-code-review/internal/config/rules"
)

var (
	builtinRulesOnce sync.Once
	builtinRules     *rules.SystemRule
	builtinRulesErr  error
)

func loadBuiltinRules() (*rules.SystemRule, error) {
	builtinRulesOnce.Do(func() {
		builtinRules, builtinRulesErr = rules.LoadDefault()
	})
	return builtinRules, builtinRulesErr
}

type rulePatternView struct {
	Pattern string `json:"pattern"`
	Rule    string `json:"rule"`
}

type rulesResponse struct {
	DefaultRule string            `json:"default_rule"`
	Patterns    []rulePatternView `json:"patterns"`
}

type ruleCheckRequest struct {
	Path string `json:"path"`
}

type ruleCheckResponse struct {
	Path      string `json:"path"`
	Source    string `json:"source"`
	Pattern   string `json:"pattern"`
	Rule      string `json:"rule"`
	SniffedAs string `json:"sniffed_as,omitempty"`
}

func (s *Server) handleRules(w http.ResponseWriter, r *http.Request) {
	systemRule, err := loadBuiltinRules()
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	response := rulesResponse{
		DefaultRule: systemRule.DefaultRule,
		Patterns:    make([]rulePatternView, 0, len(systemRule.PathRules)),
	}
	for _, entry := range systemRule.PathRules {
		response.Patterns = append(response.Patterns, rulePatternView{Pattern: entry.Pattern, Rule: entry.Rule})
	}
	writeJSON(w, http.StatusOK, response)
}

func (s *Server) handleRuleCheck(w http.ResponseWriter, r *http.Request) {
	var req ruleCheckRequest
	if err := readJSON(w, r, &req); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	req.Path = strings.TrimSpace(req.Path)
	if req.Path == "" {
		writeError(w, http.StatusBadRequest, "path is required")
		return
	}
	if len(req.Path) > 500 {
		writeError(w, http.StatusBadRequest, "path is limited to 500 characters")
		return
	}
	if strings.ContainsRune(req.Path, '\x00') {
		writeError(w, http.StatusBadRequest, "path contains a NUL character")
		return
	}

	resolver, _, err := rules.NewResolver(s.repoDir, "", rules.ResolverOptions{})
	if err != nil {
		writeError(w, http.StatusBadRequest, "load rules: "+err.Error())
		return
	}
	detailResolver, ok := resolver.(rules.DetailResolver)
	if !ok {
		writeError(w, http.StatusInternalServerError, "resolver does not expose rule details")
		return
	}
	detail := detailResolver.ResolveDetail(req.Path)
	writeJSON(w, http.StatusOK, ruleCheckResponse{
		Path:      req.Path,
		Source:    detail.Source,
		Pattern:   detail.Pattern,
		Rule:      detail.Rule,
		SniffedAs: detail.SniffedAs,
	})
}
