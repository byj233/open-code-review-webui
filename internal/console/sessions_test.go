// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

package console

import (
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/alibaba/open-code-review/internal/model"
	"github.com/alibaba/open-code-review/internal/session"
)

func testSessionSummary(id string) session.Summary {
	return session.Summary{
		SessionID:      id,
		Model:          "claude-sonnet-4-6",
		GitBranch:      "feature/x",
		ReviewMode:     "range",
		DiffFrom:       "main",
		DiffTo:         "feature/x",
		StartTime:      time.Now().Add(-time.Hour),
		SelectedFiles:  3,
		CompletedFiles: 2,
		TotalComments:  4,
	}
}

func TestSessionsListEndpoint(t *testing.T) {
	store := &fakeSessionStore{list: []session.Summary{
		testSessionSummary("20250601-100000-aaaaaa"),
		testSessionSummary("20250601-110000-bbbbbb"),
	}}
	_, httpServer, _ := newTestServer(t, func(opts *Options) { opts.Sessions = store })

	res := doRequest(t, http.MethodGet, httpServer.URL+"/api/sessions?limit=1", "", nil)
	if res.StatusCode != http.StatusOK {
		t.Fatalf("status = %d", res.StatusCode)
	}
	payload := decodeJSON[sessionsResponse](t, res)
	if payload.Total != 2 || len(payload.Sessions) != 1 {
		t.Errorf("payload = %+v", payload)
	}

	res = doRequest(t, http.MethodGet, httpServer.URL+"/api/sessions?q=feature", "", nil)
	payload = decodeJSON[sessionsResponse](t, res)
	if payload.Total != 2 {
		t.Errorf("query total = %d, want 2", payload.Total)
	}

	res = doRequest(t, http.MethodGet, httpServer.URL+"/api/sessions?q=no-such-term", "", nil)
	payload = decodeJSON[sessionsResponse](t, res)
	if payload.Total != 0 || payload.Sessions == nil {
		t.Errorf("filtered payload = %+v", payload)
	}

	res = doRequest(t, http.MethodGet, httpServer.URL+"/api/sessions?limit=0", "", nil)
	if res.StatusCode != http.StatusBadRequest {
		t.Errorf("limit=0 status = %d", res.StatusCode)
	}
	res.Body.Close()

	store.listErr = errors.New("disk failure")
	res = doRequest(t, http.MethodGet, httpServer.URL+"/api/sessions", "", nil)
	if res.StatusCode != http.StatusInternalServerError {
		t.Errorf("list error status = %d", res.StatusCode)
	}
	res.Body.Close()
}

func TestSessionDetailEndpoint(t *testing.T) {
	summary := testSessionSummary("20250601-100000-aaaaaa")
	store := &fakeSessionStore{
		summary: &summary,
		items: []session.ItemDetail{
			{Type: "review_item_done", FilePath: "main.go", Comments: 2},
		},
		comments: []model.LlmComment{
			{Path: "main.go", StartLine: 1, EndLine: 2, Severity: "high", Content: "issue"},
		},
	}
	_, httpServer, _ := newTestServer(t, func(opts *Options) { opts.Sessions = store })

	res := doRequest(t, http.MethodGet, httpServer.URL+"/api/sessions/20250601-100000-aaaaaa", "", nil)
	if res.StatusCode != http.StatusOK {
		t.Fatalf("status = %d", res.StatusCode)
	}
	payload := decodeJSON[sessionDetailResponse](t, res)
	if payload.Summary == nil || payload.Summary.SessionID != summary.SessionID {
		t.Errorf("summary = %+v", payload.Summary)
	}
	if len(payload.Items) != 1 || len(payload.Comments) != 1 {
		t.Errorf("payload = %+v", payload)
	}

	store.items = nil
	store.comments = nil
	res = doRequest(t, http.MethodGet, httpServer.URL+"/api/sessions/20250601-100000-aaaaaa", "", nil)
	payload = decodeJSON[sessionDetailResponse](t, res)
	if payload.Items == nil || payload.Comments == nil {
		t.Error("empty items/comments must encode as arrays, not null")
	}

	store.detailErr = session.ErrSessionNotFound
	res = doRequest(t, http.MethodGet, httpServer.URL+"/api/sessions/20250601-100000-aaaaaa", "", nil)
	if res.StatusCode != http.StatusNotFound {
		t.Errorf("not found status = %d", res.StatusCode)
	}
	res.Body.Close()

	store.detailErr = session.ErrSessionOtherRepo
	res = doRequest(t, http.MethodGet, httpServer.URL+"/api/sessions/20250601-100000-aaaaaa", "", nil)
	if res.StatusCode != http.StatusBadRequest {
		t.Errorf("other repo status = %d", res.StatusCode)
	}
	res.Body.Close()

	store.detailErr = errors.New("boom")
	res = doRequest(t, http.MethodGet, httpServer.URL+"/api/sessions/20250601-100000-aaaaaa", "", nil)
	if res.StatusCode != http.StatusInternalServerError {
		t.Errorf("generic error status = %d", res.StatusCode)
	}
	res.Body.Close()
}

func TestSessionDeleteEndpoint(t *testing.T) {
	summary := testSessionSummary("20250601-100000-aaaaaa")
	store := &fakeSessionStore{summary: &summary}
	_, httpServer, _ := newTestServer(t, func(opts *Options) { opts.Sessions = store })

	res := doRequest(t, http.MethodDelete, httpServer.URL+"/api/sessions/20250601-100000-aaaaaa", testToken, nil)
	if res.StatusCode != http.StatusOK {
		t.Fatalf("status = %d", res.StatusCode)
	}
	decodeJSON[map[string]bool](t, res)
	if len(store.deleted) != 1 || store.deleted[0] != "20250601-100000-aaaaaa" {
		t.Errorf("deleted = %v", store.deleted)
	}

	store.deleteErr = session.ErrSessionNotFound
	res = doRequest(t, http.MethodDelete, httpServer.URL+"/api/sessions/20250601-100000-aaaaaa", testToken, nil)
	if res.StatusCode != http.StatusNotFound {
		t.Errorf("not found status = %d", res.StatusCode)
	}
	res.Body.Close()

	store.deleteErr = session.ErrSessionOtherRepo
	res = doRequest(t, http.MethodDelete, httpServer.URL+"/api/sessions/20250601-100000-aaaaaa", testToken, nil)
	if res.StatusCode != http.StatusBadRequest {
		t.Errorf("other repo status = %d", res.StatusCode)
	}
	res.Body.Close()

	store.deleteErr = errors.New("boom")
	res = doRequest(t, http.MethodDelete, httpServer.URL+"/api/sessions/20250601-100000-aaaaaa", testToken, nil)
	if res.StatusCode != http.StatusInternalServerError {
		t.Errorf("generic status = %d", res.StatusCode)
	}
	res.Body.Close()
}

func TestSessionMatches(t *testing.T) {
	summary := testSessionSummary("20250601-100000-aaaaaa")
	for _, query := range []string{"20250601", "claude", "feature", "main", "range"} {
		if !sessionMatches(summary, strings.ToLower(query)) {
			t.Errorf("sessionMatches(%q) = false", query)
		}
	}
	if sessionMatches(summary, "no-match") {
		t.Error("sessionMatches(no-match) = true")
	}
}

func TestSessionDetailErrors(t *testing.T) {
	summary := testSessionSummary("20250601-100000-aaaaaa")
	store := &fakeSessionStore{summary: &summary}
	server, _, _ := newTestServer(t, func(opts *Options) { opts.Sessions = store })

	req := httptest.NewRequest(http.MethodGet, "/api/sessions/../bad", nil)
	req.SetPathValue("id", "../bad")
	rec := httptest.NewRecorder()
	server.handleSessionDetail(rec, req)
	if rec.Code != http.StatusBadRequest {
		t.Errorf("invalid id status = %d", rec.Code)
	}

	store.commentEr = errors.New("comments failure")
	req = httptest.NewRequest(http.MethodGet, "/api/sessions/20250601-100000-aaaaaa", nil)
	req.SetPathValue("id", "20250601-100000-aaaaaa")
	rec = httptest.NewRecorder()
	server.handleSessionDetail(rec, req)
	if rec.Code != http.StatusInternalServerError {
		t.Errorf("comment error status = %d", rec.Code)
	}

	req = httptest.NewRequest(http.MethodDelete, "/api/sessions/../bad", nil)
	req.SetPathValue("id", "../bad")
	rec = httptest.NewRecorder()
	server.handleSessionDelete(rec, req)
	if rec.Code != http.StatusBadRequest {
		t.Errorf("invalid delete id status = %d", rec.Code)
	}
}

func TestPackageSessionStoreMissingSession(t *testing.T) {
	home := t.TempDir()
	t.Setenv("HOME", home)
	t.Setenv("USERPROFILE", home)
	repo := t.TempDir()
	store := packageSessionStore{}
	list, err := store.List(repo)
	if err != nil || len(list) != 0 {
		t.Errorf("List = %v, %v", list, err)
	}
	if _, _, err := store.Detail(repo, "20250601-100000-aaaaaa"); err == nil {
		t.Error("Detail on a missing session succeeded")
	}
	if _, err := store.Comments(repo, "20250601-100000-aaaaaa"); err == nil {
		t.Error("Comments on a missing session succeeded")
	}
	if err := store.Delete(repo, "20250601-100000-aaaaaa"); err == nil {
		t.Error("Delete on a missing session succeeded")
	}
}

func TestSessionsEndpointRequiresTokenForDelete(t *testing.T) {
	store := &fakeSessionStore{}
	_, httpServer, _ := newTestServer(t, func(opts *Options) { opts.Sessions = store })
	res := doRequest(t, http.MethodDelete, httpServer.URL+"/api/sessions/20250601-100000-aaaaaa", "", nil)
	if res.StatusCode != http.StatusForbidden {
		t.Errorf("status = %d, want 403", res.StatusCode)
	}
	res.Body.Close()
}
