// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

package console

import (
	"errors"
	"net/http"
	"strconv"
	"strings"

	"github.com/alibaba/open-code-review/internal/model"
	"github.com/alibaba/open-code-review/internal/session"
)

// SessionStore reads and deletes persisted review sessions. It is an interface
// so handler tests can work without a sessions directory.
type SessionStore interface {
	List(repoDir string) ([]session.Summary, error)
	Detail(repoDir, sessionID string) (*session.Summary, []session.ItemDetail, error)
	Comments(repoDir, sessionID string) ([]model.LlmComment, error)
	Delete(repoDir, sessionID string) error
}

type packageSessionStore struct{}

func (packageSessionStore) List(repoDir string) ([]session.Summary, error) {
	return session.ListSessions(repoDir)
}

func (packageSessionStore) Detail(repoDir, sessionID string) (*session.Summary, []session.ItemDetail, error) {
	return session.LoadDetail(repoDir, sessionID)
}

func (packageSessionStore) Comments(repoDir, sessionID string) ([]model.LlmComment, error) {
	return session.LoadComments(repoDir, sessionID)
}

func (packageSessionStore) Delete(repoDir, sessionID string) error {
	return session.DeleteSession(repoDir, sessionID)
}

type sessionsResponse struct {
	Sessions []session.Summary `json:"sessions"`
	Total    int               `json:"total"`
}

type sessionDetailResponse struct {
	Summary  *session.Summary     `json:"summary"`
	Items    []session.ItemDetail `json:"items"`
	Comments []model.LlmComment   `json:"comments"`
}

func (s *Server) handleSessions(w http.ResponseWriter, r *http.Request) {
	limit := 100
	if raw := r.URL.Query().Get("limit"); raw != "" {
		parsed, err := strconv.Atoi(raw)
		if err != nil || parsed < 1 || parsed > 500 {
			writeError(w, http.StatusBadRequest, "limit must be between 1 and 500")
			return
		}
		limit = parsed
	}
	query := strings.ToLower(strings.TrimSpace(r.URL.Query().Get("q")))

	all, err := s.sessions.List(s.repoRoot())
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	filtered := make([]session.Summary, 0, len(all))
	for _, summary := range all {
		if query != "" && !sessionMatches(summary, query) {
			continue
		}
		filtered = append(filtered, summary)
	}
	total := len(filtered)
	if len(filtered) > limit {
		filtered = filtered[:limit]
	}
	if filtered == nil {
		filtered = []session.Summary{}
	}
	writeJSON(w, http.StatusOK, sessionsResponse{Sessions: filtered, Total: total})
}

func sessionMatches(summary session.Summary, query string) bool {
	fields := []string{
		summary.SessionID,
		summary.Model,
		summary.GitBranch,
		summary.ReviewMode,
		summary.DiffFrom,
		summary.DiffTo,
		summary.DiffCommit,
	}
	for _, field := range fields {
		if strings.Contains(strings.ToLower(field), query) {
			return true
		}
	}
	return false
}

func (s *Server) handleSessionDetail(w http.ResponseWriter, r *http.Request) {
	sessionID := r.PathValue("id")
	if err := session.ValidateSessionID(sessionID); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	summary, items, err := s.sessions.Detail(s.repoRoot(), sessionID)
	if err != nil {
		writeSessionError(w, err)
		return
	}
	comments, err := s.sessions.Comments(s.repoRoot(), sessionID)
	if err != nil {
		writeSessionError(w, err)
		return
	}
	if items == nil {
		items = []session.ItemDetail{}
	}
	if comments == nil {
		comments = []model.LlmComment{}
	}
	writeJSON(w, http.StatusOK, sessionDetailResponse{Summary: summary, Items: items, Comments: comments})
}

func (s *Server) handleSessionDelete(w http.ResponseWriter, r *http.Request) {
	sessionID := r.PathValue("id")
	if err := session.ValidateSessionID(sessionID); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	if err := s.sessions.Delete(s.repoRoot(), sessionID); err != nil {
		writeSessionError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}

func writeSessionError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, session.ErrSessionNotFound):
		writeError(w, http.StatusNotFound, err.Error())
	case errors.Is(err, session.ErrSessionOtherRepo), errors.Is(err, session.ErrSessionUnverifiable):
		writeError(w, http.StatusBadRequest, err.Error())
	default:
		writeError(w, http.StatusInternalServerError, err.Error())
	}
}
