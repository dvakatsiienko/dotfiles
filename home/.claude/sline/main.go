package main

import (
	"encoding/json"
	"fmt"
	"io"
	"os"
	"os/exec"
	"strings"
	"time"
)

// Claude Code context structure (v1.0.85+)
// Reference: https://docs.anthropic.com/en/docs/claude-code/statusline#json-input-structure
type ClaudeContext struct {
	SessionID      string `json:"session_id"`
	SessionName    string `json:"session_name"`
	TranscriptPath string `json:"transcript_path"`
	Cwd            string `json:"cwd"`
	Version        string `json:"version"`
	Model          struct {
		ID          string `json:"id"`
		DisplayName string `json:"display_name"`
	} `json:"model"`
	Workspace struct {
		CurrentDir string `json:"current_dir"`
		ProjectDir string `json:"project_dir"`
	} `json:"workspace"`
	// API-equivalent value of this session's tokens. On a subscription nothing is
	// billed per-unit, so this is what the tokens would have cost at API rates —
	// a token-volume gauge, not a bill. Rendered with a leading "~" to say so.
	Cost *struct {
		TotalCostUSD float64 `json:"total_cost_usd"`
	} `json:"cost"`
	// Server-provided subscription quota. Pro/Max only, and only after the
	// first API response of a session — each window may be independently absent.
	RateLimits *struct {
		FiveHour *RateLimitWindow `json:"five_hour"`
		SevenDay *RateLimitWindow `json:"seven_day"`
		// Per-model weekly windows. Some plans report the weekly quota split by
		// model instead of as one figure, leaving seven_day absent — without
		// these the week bar silently vanishes on those plans.
		SevenDayOpus   *RateLimitWindow `json:"seven_day_opus"`
		SevenDaySonnet *RateLimitWindow `json:"seven_day_sonnet"`
	} `json:"rate_limits"`
	ContextWindow *ContextWindowInfo `json:"context_window"`
	// Reasoning effort as CC currently has it. Authoritative over settings.json,
	// which /effort does not rewrite mid-session.
	Effort *struct {
		Level string `json:"level"`
	} `json:"effort"`
	// Opus running with faster output — Opus 5/4.8 only, absent elsewhere, so
	// it marks a state that silently cannot apply on other models.
	FastMode bool `json:"fast_mode"`
	// Active output style. "default" when none is selected, which is not news.
	OutputStyle *struct {
		Name string `json:"name"`
	} `json:"output_style"`
}

type ContextWindowInfo struct {
	UsedPercentage    *float64 `json:"used_percentage"`
	ContextWindowSize int      `json:"context_window_size"`
	CurrentUsage      *struct {
		InputTokens              int `json:"input_tokens"`
		CacheCreationInputTokens int `json:"cache_creation_input_tokens"`
		CacheReadInputTokens     int `json:"cache_read_input_tokens"`
		OutputTokens             int `json:"output_tokens"`
	} `json:"current_usage"`
}

// One rate limit window, derived from Anthropic's own response — not a local estimate.
type RateLimitWindow struct {
	UsedPercentage float64 `json:"used_percentage"`
	ResetsAt       int64   `json:"resets_at"`
}

func runCommand(command string, args ...string) string {
	output, err := exec.Command(command, args...).Output()
	if err != nil {
		return ""
	}
	return strings.TrimSpace(string(output))
}

func isStdinPiped() bool {
	stat, err := os.Stdin.Stat()
	if err != nil {
		return false
	}
	return (stat.Mode() & os.ModeCharDevice) == 0
}

func readClaudeContext() *ClaudeContext {
	if !isStdinPiped() {
		return nil
	}
	input, err := io.ReadAll(os.Stdin)
	if err != nil || len(input) == 0 {
		return nil
	}
	var ctx ClaudeContext
	if json.Unmarshal(input, &ctx) != nil || ctx.SessionID == "" {
		return nil
	}
	return &ctx
}

// workingDir reports the directory absolutely and as displayed. The absolute
// form feeds the Finder link; the ~-shortened form is what gets rendered. Prefers
// the dir Claude Code reports over the process cwd.
func workingDir(claudeContext *ClaudeContext) (abs, display string) {
	if claudeContext != nil && claudeContext.Workspace.CurrentDir != "" {
		abs = claudeContext.Workspace.CurrentDir
	} else if cwd, err := os.Getwd(); err == nil {
		abs = cwd
	} else {
		return "", "unknown"
	}

	homeDir, _ := os.UserHomeDir()
	switch {
	case homeDir != "" && abs == homeDir:
		return abs, "~"
	case homeDir != "" && strings.HasPrefix(abs, homeDir+"/"):
		return abs, "~" + abs[len(homeDir):]
	}
	return abs, abs
}

func dirSegment(claudeContext *ClaudeContext) string {
	abs, display := workingDir(claudeContext)
	return fmt.Sprintf("📼 %s%s%s", DirColor, hyperlink(editorURL(abs), display), Reset)
}

func getGitEmoji() string {
	hour := time.Now().Hour()
	if hour >= 6 && hour < 18 {
		return "🦔" // Day hedgehog
	}
	return "🦦" // Night otter
}

// =============================================================================
// STATUSLINE ASSEMBLY
// =============================================================================

// repoDir is the directory sline reports git for: the session's project, not
// wherever the shell has wandered to. Travelling out of the repo mid-session
// used to blank the segment.
func repoDir(claudeContext *ClaudeContext) string {
	if claudeContext == nil {
		return ""
	}
	if claudeContext.Workspace.ProjectDir != "" {
		return claudeContext.Workspace.ProjectDir
	}
	return claudeContext.Workspace.CurrentDir
}

func gitSegments(claudeContext *ClaudeContext) []string {
	return renderGitStatus(readGitStatus(repoDir(claudeContext)))
}

// renderGitStatus formats an already-read status as up to three segments —
// branch, working tree, stash. It reads nothing itself, so every branch below is
// reachable from a GitStatus literal in a test.
func renderGitStatus(st GitStatus) []string {
	gitEmoji := getGitEmoji()

	if !st.IsRepo {
		return []string{fmt.Sprintf("%s %sno git%s", gitEmoji, CleanColor, Reset)}
	}

	branch := branchLabel(st)
	branchSegment := fmt.Sprintf("%s%s%s", BranchColor, branch, Reset)
	if sync := formatSyncIndicator(st); sync != "" {
		branchSegment += " " + sync
	}

	var out strings.Builder

	hasStagedChanges := st.Staged > 0
	hasUnstagedChanges := st.Modified > 0 || st.Untracked > 0
	totalFileCount := st.Entries + st.Untracked

	// Net diff metric (only shown when both + and - are present)
	totalInsertions := st.StagedInsertions + st.UnstagedInsertions
	totalDeletions := st.StagedDeletions + st.UnstagedDeletions
	netDiffStr := ""
	if totalInsertions > 0 && totalDeletions > 0 {
		net := totalInsertions - totalDeletions
		if net > 0 {
			netDiffStr = fmt.Sprintf(" %s+%d%s", CleanColor, net, Reset)
		} else {
			netDiffStr = fmt.Sprintf(" %s%d%s", CleanColor, net, Reset)
		}
	}

	switch {
	case hasStagedChanges && hasUnstagedChanges:
		out.WriteString(fmt.Sprintf("%s %s(%d)%s %s+%d%s%s-%d%s %s✓%s %s+%d%s%s-%d%s",
			gitEmoji, CleanColor, totalFileCount, Reset, AddColor, st.StagedInsertions, Reset,
			DelColor, st.StagedDeletions, Reset, AddColor, Reset, AddColor, st.UnstagedInsertions,
			Reset, DelColor, st.UnstagedDeletions, Reset))
		out.WriteString(netDiffStr)
	case hasStagedChanges:
		out.WriteString(fmt.Sprintf("%s %s(%d)%s %s+%d%s%s-%d%s %s✓%s",
			gitEmoji, CleanColor, st.Staged, Reset, AddColor, st.StagedInsertions, Reset,
			DelColor, st.StagedDeletions, Reset, AddColor, Reset))
		out.WriteString(netDiffStr)
	case hasUnstagedChanges:
		out.WriteString(fmt.Sprintf("%s %s(%d)%s %s+%d%s%s-%d%s",
			gitEmoji, CleanColor, st.Modified+st.Untracked, Reset, AddColor, st.UnstagedInsertions,
			Reset, DelColor, st.UnstagedDeletions, Reset))
		out.WriteString(netDiffStr)
	default:
		out.WriteString(fmt.Sprintf("%s %sclean%s", gitEmoji, CleanColor, Reset))
	}

	segments := []string{branchSegment, out.String()}
	if st.Stash > 0 {
		segments = append(segments,
			fmt.Sprintf("💾 %sstash: %d%s", StashColor, st.Stash, Reset))
	}
	return segments
}

func generateStatusline() string {
	claudeContext := readClaudeContext()

	state := loadState()
	emoji, emojiChanged := modelEmoji(&state)
	pnpmVersion, pnpmChanged := getPnpmVersion(&state)
	if emojiChanged || pnpmChanged {
		saveState(state)
	}

	// The line, in order. Anything that renders empty drops out and takes its
	// separator with it — see segment.go.
	line1 := joinSegments(flatten(
		[]string{
			dirSegment(claudeContext),
			fmt.Sprintf("%s%s󰎙%s %s%s%s", Bold, NodeIconColor, Reset, NodeColor, getNodeVersion(), Reset),
			fmt.Sprintf("%s📦%s %s%s%s", PnpmIconColor, Reset, PnpmColor, pnpmVersion, Reset),
		},
		gitSegments(claudeContext),
		// Session identity, then the ticket in focus.
		[]string{
			sessionSegment(claudeContext),
			focusSegment(claudeContext),
		},
		// Alerts close line 1 — one place for every active fault. See alert.go.
		alertSegments(claudeContext),
	)...)

	// The model leads line 2's usage gauges.
	line2 := joinSegments(flatten(
		[]string{emoji + getModelDisplayName(claudeContext)},
		usageSegments(claudeContext),
	)...)

	return Reset + line1 + "\n" + line2
}

func main() {
	fmt.Print(generateStatusline())
}
