// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

package console

import (
	"context"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"sort"
	"strings"
	"time"
)

// RepoInfo is the repository digest the console shows on its overview page and
// uses to populate ref pickers.
type RepoInfo struct {
	Path      string       `json:"path"`
	Name      string       `json:"name"`
	IsGit     bool         `json:"is_git"`
	TopLevel  string       `json:"top_level,omitempty"`
	Branch    string       `json:"branch,omitempty"`
	Detached  bool         `json:"detached,omitempty"`
	Head      string       `json:"head,omitempty"`
	Dirty     int          `json:"dirty"`
	Staged    int          `json:"staged"`
	Unstaged  int          `json:"unstaged"`
	Untracked int          `json:"untracked"`
	Ahead     int          `json:"ahead"`
	Behind    int          `json:"behind"`
	Commits   []CommitInfo `json:"commits"`
	Branches  []string     `json:"branches"`
	Tags      []string     `json:"tags"`
	Error     string       `json:"error,omitempty"`
}

// CommitInfo is one row of the recent-commit list.
type CommitInfo struct {
	Hash    string `json:"hash"`
	Short   string `json:"short"`
	Author  string `json:"author"`
	Date    string `json:"date"`
	Subject string `json:"subject"`
}

// resolveRepoDir anchors the console at the git top level when dir belongs to a
// work tree, matching how `ocr review` resolves its repo.
func resolveRepoDir(dir string) (string, error) {
	abs, err := filepath.Abs(dir)
	if err != nil {
		return "", fmt.Errorf("resolve repository path: %w", err)
	}
	info, err := os.Stat(abs)
	if err != nil {
		return "", fmt.Errorf("stat repository path: %w", err)
	}
	if !info.IsDir() {
		return "", fmt.Errorf("%s is not a directory", abs)
	}
	top, err := gitOutput(abs, "rev-parse", "--show-toplevel")
	if err == nil && strings.TrimSpace(top) != "" {
		return strings.TrimSpace(top), nil
	}
	return abs, nil
}

func inspectRepo(dir string) RepoInfo {
	info := RepoInfo{
		Path:     dir,
		Name:     filepath.Base(dir),
		Commits:  []CommitInfo{},
		Branches: []string{},
		Tags:     []string{},
	}
	if info.Name == "." || info.Name == string(filepath.Separator) {
		info.Name = dir
	}

	top, err := gitOutput(dir, "rev-parse", "--show-toplevel")
	if err != nil || strings.TrimSpace(top) == "" {
		info.Error = "not a git repository"
		if err != nil {
			if detail := gitErrorText(err); detail != "" {
				info.Error = detail
			}
		}
		return info
	}
	info.IsGit = true
	info.TopLevel = strings.TrimSpace(top)

	if branch, err := gitOutput(dir, "symbolic-ref", "--short", "-q", "HEAD"); err == nil {
		info.Branch = strings.TrimSpace(branch)
	} else {
		info.Detached = true
	}
	if head, err := gitOutput(dir, "rev-parse", "--short", "HEAD"); err == nil {
		info.Head = strings.TrimSpace(head)
	}

	info.Staged, info.Unstaged, info.Untracked, info.Dirty = worktreeCounts(dir)

	if counts, err := gitOutput(dir, "rev-list", "--count", "--left-right", "@{upstream}...HEAD"); err == nil {
		fields := strings.Fields(counts)
		if len(fields) == 2 {
			fmt.Sscanf(fields[0], "%d", &info.Behind)
			fmt.Sscanf(fields[1], "%d", &info.Ahead)
		}
	}

	info.Commits = recentCommits(dir)
	info.Branches = listRefs(dir, 100, "refs/heads", "refs/remotes")
	info.Tags = listRefs(dir, 50, "refs/tags")
	return info
}

func worktreeCounts(dir string) (staged, unstaged, untracked, dirty int) {
	status, err := gitOutput(dir, "status", "--porcelain=v1")
	if err != nil {
		return 0, 0, 0, 0
	}
	for _, line := range strings.Split(status, "\n") {
		if len(line) < 2 {
			continue
		}
		x, y := line[0], line[1]
		if x == '?' && y == '?' {
			untracked++
		} else {
			if x != ' ' && x != '?' {
				staged++
			}
			if y != ' ' && y != '?' {
				unstaged++
			}
		}
		dirty++
	}
	return staged, unstaged, untracked, dirty
}

func recentCommits(dir string) []CommitInfo {
	out, err := gitOutput(dir, "log", "-n", "12", "--date=short", "--pretty=format:%H%x1f%h%x1f%an%x1f%ad%x1f%s")
	if err != nil || strings.TrimSpace(out) == "" {
		return []CommitInfo{}
	}
	commits := make([]CommitInfo, 0, 12)
	for _, line := range strings.Split(out, "\n") {
		fields := strings.SplitN(line, "\x1f", 5)
		if len(fields) != 5 {
			continue
		}
		commits = append(commits, CommitInfo{
			Hash:    fields[0],
			Short:   fields[1],
			Author:  fields[2],
			Date:    fields[3],
			Subject: fields[4],
		})
	}
	return commits
}

func listRefs(dir string, limit int, namespaces ...string) []string {
	args := []string{"for-each-ref", "--sort=-committerdate", "--format=%(refname:short)"}
	args = append(args, namespaces...)
	out, err := gitOutput(dir, args...)
	if err != nil {
		return []string{}
	}
	seen := make(map[string]struct{})
	refs := make([]string, 0, limit)
	for _, line := range strings.Split(out, "\n") {
		ref := strings.TrimSpace(line)
		if ref == "" || strings.HasSuffix(ref, "/HEAD") {
			continue
		}
		if _, ok := seen[ref]; ok {
			continue
		}
		seen[ref] = struct{}{}
		refs = append(refs, ref)
		if len(refs) >= limit {
			break
		}
	}
	sort.Strings(refs)
	return refs
}

func gitOutput(dir string, args ...string) (string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()
	cmd := exec.CommandContext(ctx, "git", args...)
	cmd.Dir = dir
	cmd.Env = append(os.Environ(), "LC_ALL=C", "GIT_TERMINAL_PROMPT=0", "GIT_PAGER=cat")
	var stdout, stderr strings.Builder
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr
	err := cmd.Run()
	if err != nil {
		msg := strings.TrimSpace(stderr.String())
		if msg == "" {
			msg = err.Error()
		}
		return strings.TrimSpace(stdout.String()), fmt.Errorf("git %s: %s", strings.Join(args, " "), msg)
	}
	return stdout.String(), nil
}

func gitErrorText(err error) string {
	msg := err.Error()
	if idx := strings.Index(msg, ": "); idx >= 0 {
		return msg[idx+2:]
	}
	return msg
}
