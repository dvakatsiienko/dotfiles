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
	} `json:"rate_limits"`
	ContextWindow *ContextWindowInfo `json:"context_window"`
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

// displayDir shortens the working directory with ~; prefers the dir Claude Code
// reports over the process cwd.
func displayDir(claudeContext *ClaudeContext) string {
	wd := ""
	if claudeContext != nil && claudeContext.Workspace.CurrentDir != "" {
		wd = claudeContext.Workspace.CurrentDir
	} else if cwd, err := os.Getwd(); err == nil {
		wd = cwd
	} else {
		return "unknown"
	}

	homeDir, _ := os.UserHomeDir()
	if homeDir != "" {
		if wd == homeDir {
			return "~"
		}
		if strings.HasPrefix(wd, homeDir+"/") {
			return "~" + wd[len(homeDir):]
		}
	}
	return wd
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

func gitSegment() string {
	st := readGitStatus()
	gitEmoji := getGitEmoji()

	if !st.IsRepo {
		return fmt.Sprintf("%s%s %sno git%s", Sep, gitEmoji, CleanColor, Reset)
	}

	var out strings.Builder

	branch := branchLabel(st)
	if sync := formatSyncIndicator(st); sync != "" {
		out.WriteString(fmt.Sprintf("%s%s%s%s %s", Sep, BranchColor, branch, Reset, sync))
	} else {
		out.WriteString(fmt.Sprintf("%s%s%s%s", Sep, BranchColor, branch, Reset))
	}

	stagedStats := runCommand("git", "diff", "--cached", "--shortstat")
	unstagedStats := runCommand("git", "diff", "--shortstat")
	stagedInsertions, stagedDeletions := parseGitStats(stagedStats)
	unstagedInsertions, unstagedDeletions := parseGitStats(unstagedStats)

	if untrackedLines := untrackedLineCount(st.UntrackedPaths); untrackedLines > 0 {
		unstagedInsertions = fmt.Sprintf("%d", parseIntSafe(unstagedInsertions)+untrackedLines)
	}

	hasStagedChanges := stagedStats != ""
	hasUnstagedChanges := unstagedStats != "" || st.Untracked > 0
	totalFileCount := st.Entries + st.Untracked

	// Net diff metric (only shown when both + and - are present)
	totalInsertions := parseIntSafe(stagedInsertions) + parseIntSafe(unstagedInsertions)
	totalDeletions := parseIntSafe(stagedDeletions) + parseIntSafe(unstagedDeletions)
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
		out.WriteString(fmt.Sprintf("%s%s %s(%d)%s %s+%s%s%s-%s%s %s✓%s %s+%s%s%s-%s%s",
			Sep, gitEmoji, CleanColor, totalFileCount, Reset, AddColor, stagedInsertions, Reset,
			DelColor, stagedDeletions, Reset, AddColor, Reset, AddColor, unstagedInsertions,
			Reset, DelColor, unstagedDeletions, Reset))
		out.WriteString(netDiffStr)
	case hasStagedChanges:
		out.WriteString(fmt.Sprintf("%s%s %s(%d)%s %s+%s%s%s-%s%s %s✓%s",
			Sep, gitEmoji, CleanColor, st.Staged, Reset, AddColor, stagedInsertions, Reset,
			DelColor, stagedDeletions, Reset, AddColor, Reset))
		out.WriteString(netDiffStr)
	case hasUnstagedChanges:
		out.WriteString(fmt.Sprintf("%s%s %s(%d)%s %s+%s%s%s-%s%s",
			Sep, gitEmoji, CleanColor, st.Modified+st.Untracked, Reset, AddColor, unstagedInsertions,
			Reset, DelColor, unstagedDeletions, Reset))
		out.WriteString(netDiffStr)
	default:
		out.WriteString(fmt.Sprintf("%s%s %sclean%s", Sep, gitEmoji, CleanColor, Reset))
	}

	if st.Stash > 0 {
		out.WriteString(fmt.Sprintf("%s💾 %sstash: %d%s", Sep, StashColor, st.Stash, Reset))
	}

	return out.String()
}

func generateStatusline() string {
	claudeContext := readClaudeContext()

	state := loadState()
	emoji, emojiChanged := modelEmoji(&state)
	pnpmVersion, pnpmChanged := getPnpmVersion(&state)
	if emojiChanged || pnpmChanged {
		saveState(state)
	}

	var output strings.Builder
	output.WriteString(Reset)

	output.WriteString(fmt.Sprintf("📼 %s%s%s", DirColor, displayDir(claudeContext), Reset))
	output.WriteString(fmt.Sprintf("%s%s%s󰎙%s %s%s%s%s%s📦%s %s%s%s",
		Sep, Bold, NodeIconColor, Reset, NodeColor, getNodeVersion(), Reset,
		Sep, PnpmIconColor, Reset, PnpmColor, pnpmVersion, Reset))
	output.WriteString(gitSegment())

	// Session identity closes line 1; the model leads line 2's usage gauges.
	if label := sessionLabel(claudeContext); label != "" {
		output.WriteString(fmt.Sprintf("%s%s🧵 %s%s", Sep, SessionColor, label, Reset))
		// TEMPORARY ⚠ segment — see peerSocketAlive in session.go (CC issue #85497).
		if !peerSocketAlive() {
			output.WriteString(fmt.Sprintf(" %s⚠ unreachable%s", UsageCritColor, Reset))
		}
	}
	line2 := fmt.Sprintf("%s%s", emoji, getModelDisplayName(claudeContext))
	if usageInfo := getUsageInfo(claudeContext); usageInfo != "" {
		line2 += Sep + usageInfo
	}
	output.WriteString("\n" + line2)

	return output.String()
}

func main() {
	fmt.Print(generateStatusline())
}
