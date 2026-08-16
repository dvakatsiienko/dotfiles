package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strconv"
	"strings"
)

// Session registry entries (~/.claude/sessions/<pid>.json) map session ids to the
// human names ListAgents/SendMessage address by — the statusline JSON has no name field.
type sessionRegistryEntry struct {
	SessionID string `json:"sessionId"`
	Name      string `json:"name"`
}

func resolveSessionName(sessionsDir, sessionID string) string {
	if sessionID == "" {
		return ""
	}
	entries, err := os.ReadDir(sessionsDir)
	if err != nil {
		return ""
	}
	for _, e := range entries {
		if e.IsDir() || !strings.HasSuffix(e.Name(), ".json") {
			continue
		}
		data, err := os.ReadFile(filepath.Join(sessionsDir, e.Name()))
		if err != nil {
			continue
		}
		var entry sessionRegistryEntry
		if json.Unmarshal(data, &entry) != nil {
			continue
		}
		if entry.SessionID == sessionID && entry.Name != "" {
			return entry.Name
		}
	}
	return ""
}

func sessionSegment(claudeContext *ClaudeContext) string {
	label := sessionLabel(claudeContext)
	if label == "" {
		return ""
	}
	return paint(SessionColor, "🧵 "+label)
}

// sessionLabel shows the human-readable session name (CC's session_name, i.e.
// the thread title) for the user, falling back to the peer-registry codename,
// then a bare id. The [8-char session id] always rides along — it's the
// machine-resolvable identifier: a cst pull maps it to the registry/transcript
// deterministically, no name guessing.
func sessionLabel(context *ClaudeContext) string {
	if context == nil {
		return ""
	}
	name := context.SessionName
	if name == "" && context.SessionID != "" {
		homeDir, _ := os.UserHomeDir()
		name = resolveSessionName(filepath.Join(homeDir, ".claude", "sessions"), context.SessionID)
	}
	if name == "" {
		if len(context.SessionID) >= 8 {
			return context.SessionID[:8]
		}
		return context.SessionID
	}
	label := truncateLabel(kebabLabel(name), 52)
	if len(context.SessionID) >= 8 {
		label += " " + paintf(CleanColor, "[%s]", context.SessionID[:8])
	}
	return label
}

// peerSocketAlive reports whether an ancestor process owns a peer socket in
// /tmp/cc-socks — the CC process that spawned this statusline should. A missing
// socket means peers cannot message this session (silent CC listener failure;
// restart heals it). Errors resolve to true — never cry wolf on a lookup fail.
//
// TEMPORARY — compensates for a CC bug (session registers but never binds its
// socket). Check occasionally; once fixed upstream, delete this func, its
// alert in alert.go, and the KNOWN CC BUG bullet in the pull-handoff skill's
// Etiquette section. Tracking:
//
//	https://github.com/anthropics/claude-code/issues/85497 (ours)
//	dupes/related: #85412, #84945, #85160, #84894
func peerSocketAlive() bool {
	pid := os.Getppid()
	for depth := 0; depth < 4 && pid > 1; depth++ {
		if _, err := os.Stat(fmt.Sprintf("/tmp/cc-socks/%d.sock", pid)); err == nil {
			return true
		}
		out := runCommand("ps", "-o", "ppid=", "-p", strconv.Itoa(pid))
		next, err := strconv.Atoi(strings.TrimSpace(out))
		if err != nil {
			return true
		}
		pid = next
	}
	return false
}

// kebabLabel lowercases and hyphenates a name for display only — CC sometimes
// auto-titles sessions "Like This"; the real registry name is untouched, so
// SendMessage/cst addressing is unaffected.
func kebabLabel(s string) string {
	return strings.Join(strings.Fields(strings.ToLower(s)), "-")
}

func truncateLabel(s string, max int) string {
	runes := []rune(s)
	if len(runes) <= max {
		return s
	}
	return string(runes[:max-1]) + "…"
}

// handoffPendingCount counts unconsumed CST files; read-only — cleanup belongs to
// the handoff skill, never the statusline.
func handoffPendingCount(dir string) int {
	entries, err := os.ReadDir(dir)
	if err != nil {
		return 0
	}
	count := 0
	for _, e := range entries {
		if !e.IsDir() && strings.HasSuffix(e.Name(), ".md") {
			count++
		}
	}
	return count
}
