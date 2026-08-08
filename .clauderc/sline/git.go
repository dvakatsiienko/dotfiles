package main

import (
	"fmt"
	"os"
	"regexp"
	"strconv"
	"strings"
)

// GitStatus is parsed from a single `git status --porcelain=v2` invocation —
// branch, sync, file counts, untracked paths and stash all come from one process.
type GitStatus struct {
	IsRepo         bool
	Head           string // branch name; empty when detached
	HasUpstream    bool
	Ahead          int
	Behind         int
	Staged         int // entries with a staged change
	Modified       int // entries with an unstaged change (incl. unmerged)
	Untracked      int
	Entries        int // unique tracked paths with any change
	UntrackedPaths []string
	Stash          int
}

func readGitStatus() GitStatus {
	out := runCommand("git", "status", "--porcelain=v2", "--branch", "--show-stash")
	if out == "" {
		// Distinguish "not a repo" from "clean repo": a repo always emits headers.
		return GitStatus{}
	}
	return parseGitStatusV2(out)
}

func parseGitStatusV2(out string) GitStatus {
	st := GitStatus{IsRepo: true}
	for _, line := range strings.Split(out, "\n") {
		switch {
		case strings.HasPrefix(line, "# branch.head "):
			if head := strings.TrimPrefix(line, "# branch.head "); head != "(detached)" {
				st.Head = head
			}
		case strings.HasPrefix(line, "# branch.ab "):
			st.HasUpstream = true
			fmt.Sscanf(strings.TrimPrefix(line, "# branch.ab "), "+%d -%d", &st.Ahead, &st.Behind)
		case strings.HasPrefix(line, "# stash "):
			st.Stash = parseIntSafe(strings.TrimPrefix(line, "# stash "))
		case strings.HasPrefix(line, "1 "), strings.HasPrefix(line, "2 "):
			st.Entries++
			if len(line) >= 4 {
				if line[2] != '.' {
					st.Staged++
				}
				if line[3] != '.' {
					st.Modified++
				}
			}
		case strings.HasPrefix(line, "u "):
			st.Entries++
			st.Modified++
		case strings.HasPrefix(line, "? "):
			st.Untracked++
			st.UntrackedPaths = append(st.UntrackedPaths, line[2:])
		}
	}
	return st
}

// branchLabel resolves the display name; tag/hash lookups only run on the
// rare detached-HEAD path.
func branchLabel(st GitStatus) string {
	if st.Head != "" {
		return "🌿 " + st.Head
	}
	if tag := runCommand("git", "describe", "--exact-match", "HEAD"); tag != "" {
		return "🏷️  " + tag
	}
	if hash := runCommand("git", "rev-parse", "--short", "HEAD"); hash != "" {
		return "📍 " + hash
	}
	return "📍 detached"
}

func formatSyncIndicator(st GitStatus) string {
	if !st.HasUpstream {
		return ""
	}
	switch {
	case st.Ahead > 0 && st.Behind > 0:
		return fmt.Sprintf("%s↑%s%s%s↓%s%s",
			SyncAheadColor, toSuperscript(st.Ahead), Reset,
			SyncBehindColor, toSuperscript(st.Behind), Reset)
	case st.Ahead > 0:
		return fmt.Sprintf("%s↑%s%s", SyncAheadColor, toSuperscript(st.Ahead), Reset)
	case st.Behind > 0:
		return fmt.Sprintf("%s↓%s%s", SyncBehindColor, toSuperscript(st.Behind), Reset)
	}
	return ""
}

var (
	insertionRe = regexp.MustCompile(`(\d+) insertion`)
	deletionRe  = regexp.MustCompile(`(\d+) deletion`)
)

func parseGitStats(stats string) (insertions, deletions string) {
	insertions, deletions = "0", "0"
	if m := insertionRe.FindStringSubmatch(stats); len(m) > 1 {
		insertions = m[1]
	}
	if m := deletionRe.FindStringSubmatch(stats); len(m) > 1 {
		deletions = m[1]
	}
	return insertions, deletions
}

// untrackedLineCount counts newlines in untracked files without spawning wc.
// Files over 4MB are skipped — an untracked build artifact must not stall the render.
func untrackedLineCount(paths []string) int {
	const maxSize = 4 << 20
	total := 0
	for _, path := range paths {
		info, err := os.Stat(path)
		if err != nil || info.IsDir() || info.Size() > maxSize {
			continue
		}
		data, err := os.ReadFile(path)
		if err != nil {
			continue
		}
		total += strings.Count(string(data), "\n")
	}
	return total
}

func parseIntSafe(s string) int {
	val, err := strconv.Atoi(s)
	if err != nil {
		return 0
	}
	return val
}
