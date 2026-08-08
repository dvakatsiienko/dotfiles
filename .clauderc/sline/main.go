package main

import (
	"encoding/json"
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"time"
)

// ANSI color codes for terminal styling
const (
	Reset           = "\033[0m"
	Bold            = "\033[1m"
	NodeColor       = "\033[38;5;71m"
	NodeIconColor   = "\033[38;5;71m"
	PnpmColor       = "\033[38;5;202m"
	PnpmIconColor   = "\033[38;5;202m"
	DirColor        = "\033[38;5;248m"
	BranchColor     = "\033[32m"
	AddColor        = "\033[32m"
	DelColor        = "\033[31m"
	CleanColor      = "\033[2;37m"
	StashColor      = "\033[96m"
	UsageOkColor    = "\033[38;5;214m" // orange for normal quota usage
	UsageWarnColor  = "\033[38;5;208m" // deeper orange past 75%
	UsageCritColor  = "\033[38;5;196m" // red past 90%
	SyncAheadColor  = "\033[32m"       // green for ahead
	SyncBehindColor = "\033[31m"       // red for behind
)

// Retro gradient colors for model name
var gradientColors = []string{
	"\033[95m", // bright magenta
	"\033[94m", // bright blue
	"\033[96m", // bright cyan
	"\033[92m", // bright green
	"\033[93m", // bright yellow
	"\033[91m", // bright red
}

// Emoji arrays
var modelEmojis = []string{
	"👽", "👻", "💫", "💨", "💭", "🐺", "🦊",
	"🐆", "🦄", "🦌", "🦬", "🐄", "🐖", "🐪", "🦙", "🦏", "🐇",
	"🦇", "🐻", "🦥", "🦨", "🦘", "🐓", "🐣", "🐥", "🦅", "🦢",
	"🦉", "🦩", "🐢", "🦎", "🦭", "🪸", "🐌", "🦂", "🌾", "🍀",
	"🍌", "🥭", "🥝", "🥥", "🍆", "🥕", "🌶️", "🧀", "🍕", "🎃",
	"🥋", "🔮", "🧸", "🪵", "🪂", "⛈️", "⚡️", "🌈", "🎹", "🕯️", "💡",
}

// Claude Code context structure (v1.0.85+)
// Reference: https://docs.anthropic.com/en/docs/claude-code/statusline#json-input-structure
type ClaudeContext struct {
	SessionID      string `json:"session_id"`
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
	ContextWindow *struct {
		UsedPercentage *float64 `json:"used_percentage"`
	} `json:"context_window"`
}

// One rate limit window, derived from Anthropic's own response — not a local estimate.
type RateLimitWindow struct {
	UsedPercentage float64 `json:"used_percentage"`
	ResetsAt       int64   `json:"resets_at"`
}

// State management for emoji rotation
type EmojiState struct {
	CurrentIndex   int   `json:"current_index"`
	LastUpdateTime int64 `json:"last_update_time"`
}

// Git sync status structure
type GitSyncStatus struct {
	Ahead       int
	Behind      int
	HasUpstream bool
}

// =============================================================================
// COLOR AND STYLING FUNCTIONS
// =============================================================================

func applyGradient(text string) string {
	var result strings.Builder
	colorCount := len(gradientColors)

	for i, char := range text {
		colorIndex := i % colorCount
		result.WriteString(gradientColors[colorIndex])
		result.WriteRune(char)
	}

	result.WriteString(Reset)
	return result.String()
}

// =============================================================================
// DIRECTORY AND PATH FUNCTIONS
// =============================================================================

func getCurrentDirName() string {
	wd, err := os.Getwd()
	if err != nil {
		return "unknown"
	}

	homeDir, _ := os.UserHomeDir()

	if wd == "/" {
		return "/"
	}
	if wd == homeDir {
		return "~"
	}

	if strings.HasPrefix(wd, homeDir) {
		relativePath := strings.TrimPrefix(wd, homeDir)
		if relativePath == "" {
			return "~"
		}
		return "~" + relativePath
	}

	return wd
}

// =============================================================================
// EMOJI AND STATE MANAGEMENT FUNCTIONS
// =============================================================================

func getGitEmoji() string {
	hour := time.Now().Hour()
	if hour >= 6 && hour < 18 {
		return "🦔" // Day hedgehog
	}
	return "🦦" // Night otter
}

func getStateFilePath() string {
	homeDir, _ := os.UserHomeDir()
	return filepath.Join(homeDir, ".claude", "sline", "sline-db.json")
}

func initStateFile(filePath string) {
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		os.MkdirAll(filepath.Dir(filePath), 0755)
		state := EmojiState{CurrentIndex: 0, LastUpdateTime: 0}
		data, _ := json.Marshal(state)
		os.WriteFile(filePath, data, 0644)
	}
}

func getModelEmoji() string {
	stateFile := getStateFilePath()
	initStateFile(stateFile)

	data, err := os.ReadFile(stateFile)
	if err != nil {
		return modelEmojis[0]
	}

	var state EmojiState
	if err := json.Unmarshal(data, &state); err != nil {
		return modelEmojis[0]
	}

	currentTime := time.Now().Unix()

	if currentTime-state.LastUpdateTime >= 3600 {
		state.CurrentIndex = (state.CurrentIndex + 1) % len(modelEmojis)
		state.LastUpdateTime = currentTime

		data, _ := json.Marshal(state)
		os.WriteFile(stateFile, data, 0644)
	}

	return modelEmojis[state.CurrentIndex]
}

// =============================================================================
// MODEL AND VERSION DETECTION FUNCTIONS
// =============================================================================

// extractVersionFromModelID parses version from Claude model IDs.
// Handles dated ("claude-opus-4-7-20251001") and suffixed ("claude-opus-4-7[1m]") forms.
func extractVersionFromModelID(modelID string) string {
	re := regexp.MustCompile(`^claude-\w+-(\d+)(?:-(\d+))?`)
	matches := re.FindStringSubmatch(modelID)
	if len(matches) == 3 {
		if matches[2] != "" {
			return matches[1] + "." + matches[2]
		}
		return matches[1]
	}
	return ""
}

// extractVersionFromDisplayName parses "Opus 4.7 (1M context)" -> "4.7", "Sonnet 5" -> "5".
func extractVersionFromDisplayName(displayName string) string {
	re := regexp.MustCompile(`\d+(?:\.\d+)?`)
	return re.FindString(displayName)
}

// extractModelFamily removes version numbers from display name
// Example: "Sonnet 4.5" -> "Sonnet", "Opus 4.1" -> "Opus", "Fable 5" -> "Fable"
func extractModelFamily(displayName string) string {
	// Remove version patterns like "4.5", "4.1", "5", etc.
	re := regexp.MustCompile(`\s+\d+(?:\.\d+)?.*$`)
	return strings.TrimSpace(re.ReplaceAllString(displayName, ""))
}

func getModelFromSettings() string {
	homeDir, _ := os.UserHomeDir()
	settingsPath := filepath.Join(homeDir, ".claude", "settings.json")

	data, err := os.ReadFile(settingsPath)
	if err != nil {
		return "sonnet"
	}

	re := regexp.MustCompile(`"model"\s*:\s*"([^"]*)"`)
	matches := re.FindStringSubmatch(string(data))
	if len(matches) > 1 {
		return matches[1]
	}

	return "sonnet"
}

func getModelDisplayName(claudeContext *ClaudeContext) string {
	lightGrayColor := "\033[38;5;250m"
	enSpace := "\u2002"

	var modelFamily, version string

	if claudeContext != nil && claudeContext.Model.ID != "" {
		modelFamily = strings.ToLower(extractModelFamily(claudeContext.Model.DisplayName))
		version = extractVersionFromDisplayName(claudeContext.Model.DisplayName)
		if version == "" {
			version = extractVersionFromModelID(claudeContext.Model.ID)
		}
		if version == "" {
			version = "v.err"
		}
	} else {
		// No stdin JSON (running from a bare terminal): show family only.
		modelFamily = getModelFromSettings()
	}

	displayName := modelFamily
	if modelFamily == "opusplan" {
		displayName = "opus plan"
	}

	if version == "" {
		return enSpace + applyGradient(displayName)
	}
	return enSpace + applyGradient(displayName) + lightGrayColor + " " + version + Reset
}

func runCommand(command string, args ...string) string {
	cmd := exec.Command(command, args...)
	output, err := cmd.Output()
	if err != nil {
		return ""
	}
	return strings.TrimSpace(string(output))
}

func getNodeVersion() string {
	version := runCommand("node", "--version")
	if version != "" {
		return version
	}
	return "none"
}

func getPnpmVersion() string {
	version := runCommand("pnpm", "--version")
	if version != "" {
		return "v" + version
	}
	return "none"
}

// =============================================================================
// GIT REPOSITORY FUNCTIONS
// =============================================================================

func isGitRepo() bool {
	cmd := exec.Command("git", "rev-parse", "--git-dir")
	return cmd.Run() == nil
}

func getGitTag() string {
	tag := runCommand("git", "describe", "--exact-match", "HEAD")
	return tag
}

func getGitCommitHash() string {
	hash := runCommand("git", "rev-parse", "--short", "HEAD")
	return hash
}

func getGitBranch() string {
	branch := runCommand("git", "branch", "--show-current")
	if branch == "" {
		// Check if we're on a tag
		tag := getGitTag()
		if tag != "" {
			return "🏷️  " + tag
		}
		// Arbitrary commit - show hash with pin emoji
		hash := getGitCommitHash()
		if hash != "" {
			return "📍 " + hash
		}
		return "📍 detached"
	}
	return "🌿 " + branch
}

func parseIntSafe(s string) int {
	val, err := strconv.Atoi(s)
	if err != nil {
		return 0
	}
	return val
}

func toSuperscript(n int) string {
	superscripts := []string{"⁰", "¹", "²", "³", "⁴", "⁵", "⁶", "⁷", "⁸", "⁹"}

	if n == 0 {
		return superscripts[0]
	}

	result := ""
	temp := n

	for temp > 0 {
		digit := temp % 10
		result = superscripts[digit] + result
		temp /= 10
	}

	return result
}

func getBranchSyncStatus() GitSyncStatus {
	status := GitSyncStatus{Ahead: 0, Behind: 0, HasUpstream: false}

	output := runCommand("git", "status", "-b", "--porcelain")
	if output == "" {
		return status
	}

	lines := strings.Split(output, "\n")
	if len(lines) == 0 {
		return status
	}

	branchLine := lines[0]
	if !strings.HasPrefix(branchLine, "## ") {
		return status
	}

	if !strings.Contains(branchLine, "...") {
		return status
	}

	status.HasUpstream = true

	if strings.Contains(branchLine, "[ahead ") {
		re := regexp.MustCompile(`\[ahead (\d+)`)
		matches := re.FindStringSubmatch(branchLine)
		if len(matches) > 1 {
			if val := parseIntSafe(matches[1]); val > 0 {
				status.Ahead = val
			}
		}
	}

	if strings.Contains(branchLine, "behind ") {
		re := regexp.MustCompile(`behind (\d+)`)
		matches := re.FindStringSubmatch(branchLine)
		if len(matches) > 1 {
			if val := parseIntSafe(matches[1]); val > 0 {
				status.Behind = val
			}
		}
	}

	return status
}

func formatSyncIndicator(status GitSyncStatus) string {
	if !status.HasUpstream {
		return ""
	}

	if status.Ahead > 0 && status.Behind > 0 {
		aheadStr := toSuperscript(status.Ahead)
		behindStr := toSuperscript(status.Behind)
		return fmt.Sprintf("%s↕%s%s↓%s", SyncBehindColor, aheadStr, behindStr, Reset)
	} else if status.Ahead > 0 {
		aheadStr := toSuperscript(status.Ahead)
		return fmt.Sprintf("%s↑%s%s", SyncAheadColor, aheadStr, Reset)
	} else if status.Behind > 0 {
		behindStr := toSuperscript(status.Behind)
		return fmt.Sprintf("%s↓%s%s", SyncBehindColor, behindStr, Reset)
	}

	return ""
}

func getUntrackedFileLines() (int, error) {
	untrackedFiles := runCommand("git", "ls-files", "--others", "--exclude-standard")
	if untrackedFiles == "" {
		return 0, nil
	}

	totalLines := 0
	for _, file := range strings.Split(strings.TrimSpace(untrackedFiles), "\n") {
		if file == "" {
			continue
		}
		
		output := runCommand("wc", "-l", file)
		if output != "" {
			parts := strings.Fields(output)
			if len(parts) > 0 {
				if lineCount := parseIntSafe(parts[0]); lineCount > 0 {
					totalLines += lineCount
				}
			}
		}
	}
	
	return totalLines, nil
}

func parseGitStats(stats string) (insertions, deletions string) {
	if stats == "" {
		return "0", "0"
	}

	insertionRe := regexp.MustCompile(`(\d+) insertion`)
	deletionRe := regexp.MustCompile(`(\d+) deletion`)

	insertionMatches := insertionRe.FindStringSubmatch(stats)
	deletionMatches := deletionRe.FindStringSubmatch(stats)

	insertions = "0"
	deletions = "0"

	if len(insertionMatches) > 1 {
		insertions = insertionMatches[1]
	}

	if len(deletionMatches) > 1 {
		deletions = deletionMatches[1]
	}

	return insertions, deletions
}

func getFileCount(command string, args ...string) int {
	output := runCommand(command, args...)
	if output == "" {
		return 0
	}
	return len(strings.Split(strings.TrimSpace(output), "\n"))
}

func getStashCount() int {
	output := runCommand("git", "stash", "list")
	if output == "" {
		return 0
	}
	return len(strings.Split(output, "\n"))
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

// Helper function to check if file descriptor is a terminal
func isTerminal(fd int) bool {
	stat, err := os.Stdin.Stat()
	if err != nil {
		return false
	}
	return (stat.Mode() & os.ModeCharDevice) != 0
}


// =============================================================================
// USAGE INFORMATION FUNCTIONS
// =============================================================================

// usageColor grades a 0-100 percentage: calm below half, warning past 75, alarm past 90.
func usageColor(pct float64) string {
	switch {
	case pct >= 90:
		return UsageCritColor
	case pct >= 75:
		return UsageWarnColor
	default:
		return UsageOkColor
	}
}

// formatResetIn renders seconds until a window resets as "2h 14m" or "43m".
func formatResetIn(seconds int64) string {
	if seconds <= 0 {
		return ""
	}
	minutes := seconds / 60
	if minutes < 60 {
		return fmt.Sprintf("%dm", minutes)
	}
	return fmt.Sprintf("%dh %02dm", minutes/60, minutes%60)
}

func formatWindow(label string, window *RateLimitWindow, withReset bool) string {
	if window == nil {
		return ""
	}

	segment := fmt.Sprintf("%s %s%.0f%%%s",
		label, usageColor(window.UsedPercentage), window.UsedPercentage, Reset)

	if withReset && window.ResetsAt > 0 {
		if resetIn := formatResetIn(window.ResetsAt - time.Now().Unix()); resetIn != "" {
			segment += fmt.Sprintf(" %s⏳ %s%s", CleanColor, resetIn, Reset)
		}
	}

	return segment
}

// getUsageInfo renders subscription quota and context window usage. Every field is
// server-provided; when none are present the line is omitted entirely rather than
// falling back to a client-side estimate.
func getUsageInfo(context *ClaudeContext) string {
	if context == nil {
		return ""
	}

	var segments []string

	if cost := context.Cost; cost != nil && cost.TotalCostUSD > 0 {
		segments = append(segments,
			fmt.Sprintf("%s~$%.2f%s", UsageOkColor, cost.TotalCostUSD, Reset))
	}

	if limits := context.RateLimits; limits != nil {
		if segment := formatWindow("5h", limits.FiveHour, true); segment != "" {
			segments = append(segments, segment)
		}
		if segment := formatWindow("week", limits.SevenDay, false); segment != "" {
			segments = append(segments, segment)
		}
	}

	if ctxWindow := context.ContextWindow; ctxWindow != nil && ctxWindow.UsedPercentage != nil {
		pct := *ctxWindow.UsedPercentage
		segments = append(segments, fmt.Sprintf("🧠 %s%.0f%%%s", usageColor(pct), pct, Reset))
	}

	if len(segments) == 0 {
		return ""
	}

	return "📡 " + strings.Join(segments, " • ")
}

// =============================================================================
// MAIN STATUSLINE GENERATION
// =============================================================================

func generateStatusline() string {
	var output strings.Builder

	// Check for JSON input from Claude Code v1.0.85+
	var claudeContext *ClaudeContext
	if !isTerminal(0) {
		input, err := io.ReadAll(os.Stdin)
		if err == nil && len(input) > 0 {
			var ctx ClaudeContext
			if json.Unmarshal(input, &ctx) == nil && ctx.SessionID != "" {
				claudeContext = &ctx
			}
		}
	}

	// Add explicit reset at start
	output.WriteString(Reset)

	// Directory section
	dirName := getCurrentDirName()
	output.WriteString(fmt.Sprintf("%s%s%s", DirColor, dirName, Reset))

	// Model section
	model := getModelDisplayName(claudeContext)
	modelEmoji := getModelEmoji()
	output.WriteString(fmt.Sprintf(" • %s%s", modelEmoji, model))

	// Node and PNPM section
	nodeVersion := getNodeVersion()
	pnpmVersion := getPnpmVersion()
	output.WriteString(fmt.Sprintf(" • %s%s󰎙%s %s%s%s • %s📦%s %s%s%s",
		Bold, NodeIconColor, Reset, NodeColor, nodeVersion, Reset,
		PnpmIconColor, Reset, PnpmColor, pnpmVersion, Reset))

	// Git section
	if isGitRepo() {
		branch := getGitBranch()
		syncStatus := getBranchSyncStatus()
		syncIndicator := formatSyncIndicator(syncStatus)

		if syncIndicator != "" {
			output.WriteString(fmt.Sprintf(" • %s%s%s %s", BranchColor, branch, Reset, syncIndicator))
		} else {
			output.WriteString(fmt.Sprintf(" • %s%s%s", BranchColor, branch, Reset))
		}

		// Git diff stats
		stagedStats := runCommand("git", "diff", "--cached", "--shortstat")
		unstagedStats := runCommand("git", "diff", "--shortstat")

		stagedFileCount := getFileCount("git", "diff", "--cached", "--name-only")
		modifiedFileCount := getFileCount("git", "diff", "--name-only")
		untrackedCount := getFileCount("git", "ls-files", "--others", "--exclude-standard")
		totalFileCount := stagedFileCount + modifiedFileCount + untrackedCount

		stagedInsertions, stagedDeletions := parseGitStats(stagedStats)
		unstagedInsertions, unstagedDeletions := parseGitStats(unstagedStats)

		// Add untracked file lines to unstaged insertions
		untrackedLines, _ := getUntrackedFileLines()
		if untrackedLines > 0 {
			unstagedInsertionsInt := parseIntSafe(unstagedInsertions)
			totalUnstagedInsertions := unstagedInsertionsInt + untrackedLines
			unstagedInsertions = fmt.Sprintf("%d", totalUnstagedInsertions)
		}

		gitEmoji := getGitEmoji()
		hasUnstagedChanges := unstagedStats != "" || untrackedCount > 0

		// Calculate net diff metric (only show if both + and - are present)
		totalInsertions := parseIntSafe(stagedInsertions) + parseIntSafe(unstagedInsertions)
		totalDeletions := parseIntSafe(stagedDeletions) + parseIntSafe(unstagedDeletions)
		netDiffStr := ""
		if totalInsertions > 0 && totalDeletions > 0 {
			netResult := totalInsertions - totalDeletions
			if netResult > 0 {
				netDiffStr = fmt.Sprintf(" %s+%d%s", CleanColor, netResult, Reset)
			} else {
				netDiffStr = fmt.Sprintf(" %s%d%s", CleanColor, netResult, Reset)
			}
		}

		if stagedStats != "" && hasUnstagedChanges {
			output.WriteString(fmt.Sprintf(" • %s %s(%d)%s %s+%s%s%s-%s%s %s✓%s %s+%s%s%s-%s%s",
				gitEmoji, CleanColor, totalFileCount, Reset, AddColor, stagedInsertions, Reset,
				DelColor, stagedDeletions, Reset, AddColor, Reset, AddColor, unstagedInsertions,
				Reset, DelColor, unstagedDeletions, Reset))
			if netDiffStr != "" {
				output.WriteString(netDiffStr)
			}
		} else if stagedStats != "" {
			output.WriteString(fmt.Sprintf(" • %s %s(%d)%s %s+%s%s%s-%s%s %s✓%s",
				gitEmoji, CleanColor, stagedFileCount, Reset, AddColor, stagedInsertions, Reset,
				DelColor, stagedDeletions, Reset, AddColor, Reset))
			if netDiffStr != "" {
				output.WriteString(netDiffStr)
			}
		} else if hasUnstagedChanges {
			unstagedFileCount := modifiedFileCount + untrackedCount
			output.WriteString(fmt.Sprintf(" • %s %s(%d)%s %s+%s%s%s-%s%s",
				gitEmoji, CleanColor, unstagedFileCount, Reset, AddColor, unstagedInsertions,
				Reset, DelColor, unstagedDeletions, Reset))
			if netDiffStr != "" {
				output.WriteString(netDiffStr)
			}
		} else {
			output.WriteString(fmt.Sprintf(" • %s %sclean%s", gitEmoji, CleanColor, Reset))
		}

		// Stash count
		stashCount := getStashCount()
		if stashCount > 0 {
			output.WriteString(fmt.Sprintf(" • 💾 %sstash: %d%s", StashColor, stashCount, Reset))
		}
	} else {
		gitEmoji := getGitEmoji()
		output.WriteString(fmt.Sprintf(" • %s %sno git%s", gitEmoji, CleanColor, Reset))
	}

	// Subscription quota + context window, when Claude Code supplies them
	usageInfo := getUsageInfo(claudeContext)
	if usageInfo != "" {
		output.WriteString(fmt.Sprintf("\n%s", usageInfo))
	}

	return output.String()
}

func main() {
	output := generateStatusline()
	fmt.Print(output)
}
