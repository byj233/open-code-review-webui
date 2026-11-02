// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

package console

import (
	"errors"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func samePath(left, right string) bool {
	normalize := func(value string) string {
		value = filepath.Clean(value)
		if os.PathSeparator == '\\' {
			value = strings.ReplaceAll(value, "/", "\\")
		}
		return strings.ToLower(value)
	}
	return normalize(left) == normalize(right)
}

func TestInspectRepo(t *testing.T) {
	dir := newGitRepo(t)
	if err := os.WriteFile(filepath.Join(dir, "main.go"), []byte("package main\n\nfunc main() { println(1) }\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(dir, "staged.txt"), []byte("staged\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	runGit(t, dir, "add", "staged.txt")
	if err := os.WriteFile(filepath.Join(dir, "untracked.txt"), []byte("untracked\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	runGit(t, dir, "branch", "feature/x")
	runGit(t, dir, "tag", "v1.0.0")

	info := inspectRepo(dir)
	if !info.IsGit {
		t.Fatalf("IsGit = false, error = %q", info.Error)
	}
	if !samePath(info.TopLevel, dir) {
		t.Errorf("TopLevel = %q, want %q", info.TopLevel, dir)
	}
	if info.Branch == "" || info.Head == "" || info.Detached {
		t.Errorf("branch/head = %q/%q detached=%v", info.Branch, info.Head, info.Detached)
	}
	if info.Dirty != 3 || info.Staged != 1 || info.Unstaged != 1 || info.Untracked != 1 {
		t.Errorf("worktree counts = dirty %d, staged %d, unstaged %d, untracked %d",
			info.Dirty, info.Staged, info.Unstaged, info.Untracked)
	}
	if len(info.Commits) != 1 {
		t.Fatalf("commits = %d", len(info.Commits))
	}
	commit := info.Commits[0]
	if len(commit.Hash) != 40 || len(commit.Short) != 7 || commit.Subject != "Initial commit" || commit.Author != "Console Test" {
		t.Errorf("commit = %+v", commit)
	}
	if !containsString(info.Branches, "feature/x") {
		t.Errorf("branches = %v", info.Branches)
	}
	if !containsString(info.Tags, "v1.0.0") {
		t.Errorf("tags = %v", info.Tags)
	}
}

func containsString(values []string, want string) bool {
	for _, value := range values {
		if value == want {
			return true
		}
	}
	return false
}

func TestInspectRepoWithoutGit(t *testing.T) {
	dir := t.TempDir()
	info := inspectRepo(dir)
	if info.IsGit {
		t.Error("IsGit = true for a plain directory")
	}
	if info.Error == "" {
		t.Error("Error = empty for a plain directory")
	}
	if info.Commits == nil || info.Branches == nil || info.Tags == nil {
		t.Error("slices must be non-nil")
	}
}

func TestResolveRepoDir(t *testing.T) {
	if !gitAvailable() {
		t.Skip("git is not installed")
	}
	dir := newGitRepo(t)
	sub := filepath.Join(dir, "sub", "dir")
	if err := os.MkdirAll(sub, 0o755); err != nil {
		t.Fatal(err)
	}
	resolved, err := resolveRepoDir(sub)
	if err != nil {
		t.Fatalf("resolveRepoDir: %v", err)
	}
	if !samePath(resolved, dir) {
		t.Errorf("resolved = %q, want %q", resolved, dir)
	}

	if _, err := resolveRepoDir(filepath.Join(dir, "missing")); err == nil {
		t.Error("missing path resolved successfully")
	}
	file := filepath.Join(dir, "main.go")
	if _, err := resolveRepoDir(file); err == nil {
		t.Error("file path resolved as a directory")
	}
}

func TestWorktreeCounts(t *testing.T) {
	dir := newGitRepo(t)
	if err := os.WriteFile(filepath.Join(dir, "main.go"), []byte("changed\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	staged, unstaged, untracked, dirty := worktreeCounts(dir)
	if staged != 0 || unstaged != 1 || untracked != 0 || dirty != 1 {
		t.Errorf("counts = %d, %d, %d, %d", staged, unstaged, untracked, dirty)
	}

	if err := os.WriteFile(filepath.Join(dir, "new.txt"), []byte("new\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	runGit(t, dir, "add", "new.txt")
	staged, unstaged, untracked, dirty = worktreeCounts(dir)
	if staged != 1 || unstaged != 1 || untracked != 0 || dirty != 2 {
		t.Errorf("counts after add = %d, %d, %d, %d", staged, unstaged, untracked, dirty)
	}
}

func TestListRefsAndGitErrors(t *testing.T) {
	dir := newGitRepo(t)
	runGit(t, dir, "branch", "feature/a")
	runGit(t, dir, "tag", "v2")

	refs := listRefs(dir, 1, "refs/heads")
	if len(refs) != 1 {
		t.Errorf("limit not applied: %v", refs)
	}
	tags := listRefs(dir, 10, "refs/tags")
	if !containsString(tags, "v2") {
		t.Errorf("tags = %v", tags)
	}
	if _, err := gitOutput(dir, "rev-parse", "--verify", "no-such-ref"); err == nil {
		t.Error("gitOutput succeeded for a bad ref")
	}
}

func TestInspectRepoDetached(t *testing.T) {
	dir := newGitRepo(t)
	head := runGit(t, dir, "rev-parse", "HEAD")
	runGit(t, dir, "checkout", "-q", head)
	info := inspectRepo(dir)
	if !info.Detached {
		t.Errorf("Detached = false, branch = %q", info.Branch)
	}
	if info.Head == "" {
		t.Error("Head is empty in detached state")
	}
}

func TestGitErrorText(t *testing.T) {
	if got := gitErrorText(errors.New("plain failure")); got != "plain failure" {
		t.Errorf("gitErrorText = %q", got)
	}
	if got := gitErrorText(errors.New("git log: fatal: bad revision")); got != "fatal: bad revision" {
		t.Errorf("gitErrorText = %q", got)
	}
}

func TestInspectRepoNoCommits(t *testing.T) {
	if !gitAvailable() {
		t.Skip("git is not installed")
	}
	dir := t.TempDir()
	runGit(t, dir, "init", "-q")
	info := inspectRepo(dir)
	if !info.IsGit {
		t.Fatalf("IsGit = false for an empty repository: %q", info.Error)
	}
	if len(info.Commits) != 0 {
		t.Errorf("commits = %v", info.Commits)
	}
	if info.Head != "" {
		t.Errorf("head = %q for an empty repository", info.Head)
	}
}
