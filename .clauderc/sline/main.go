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
	CostColor       = "\033[38;5;214m" // orange for cost info
	SyncAheadColor  = "\033[32m"       // green for ahead
	SyncBehindColor = "\033[31m"       // red for behind
	TokenWarningColor = "\033[38;5;196m" // bright red for token warning
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
	Cost *struct {
		TotalCostUSD       float64 `json:"total_cost_usd"`
		TotalDurationMs    int64   `json:"total_duration_ms"`
		TotalApiDurationMs int64   `json:"total_api_duration_ms"`
		TotalLinesAdded    int     `json:"total_lines_added"`
		TotalLinesRemoved  int     `json:"total_lines_removed"`
	} `json:"cost"`
	Exceeds200kTokens *bool `json:"exceeds_200k_tokens,omitempty"`
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

func getModelDisplayName() string {
	modelName := getModelFromSettings()
	lightGrayColor := "\033[38;5;250m"
	enSpace := "\u2002"

	switch modelName {
	case "opus":
		return enSpace + applyGradient("opus") + lightGrayColor + " 4.1" + Reset
	case "opusplan":
		return enSpace + applyGradient("opus plan") + lightGrayColor + " 4.1" + Reset
	case "sonnet":
		return enSpace + applyGradient("sonnet") + lightGrayColor + " 4" + Reset
	case "haiku":
		return enSpace + applyGradient("haiku") + lightGrayColor + " 3.5" + Reset
	default:
		return enSpace + applyGradient(modelName)
	}
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

func getAnthropicResetTime() string {
	now := time.Now()

	// Anthropic resets usage every 5 hours: 03:00, 08:00, 13:00, 18:00, 22:00
	resetTimes := []int{3, 8, 13, 18, 22}

	var nextReset time.Time
	today := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())

	// Find the next reset time today
	for _, hour := range resetTimes {
		candidate := today.Add(time.Duration(hour) * time.Hour)
		if now.Before(candidate) {
			nextReset = candidate
			break
		}
	}

	// If no reset found today, use first reset tomorrow (03:00)
	if nextReset.IsZero() {
		tomorrow := today.Add(24 * time.Hour)
		nextReset = tomorrow.Add(time.Duration(resetTimes[0]) * time.Hour)
	}

	duration := nextReset.Sub(now)
	hours := int(duration.Hours())
	minutes := int(duration.Minutes()) % 60

	if hours > 0 {
		return fmt.Sprintf("%dh %dm", hours, minutes)
	}
	return fmt.Sprintf("%dm", minutes)
}

// =============================================================================
// COST INFORMATION FUNCTIONS
// =============================================================================

func getNativeCostInfo(context *ClaudeContext) string {
	if context == nil || context.Cost == nil {
		return ""
	}

	cost := context.Cost

	// Calculate burn rate ($ per hour)
	var burnRate float64
	if cost.TotalDurationMs > 0 {
		hoursElapsed := float64(cost.TotalDurationMs) / (1000 * 60 * 60) // ms to hours
		burnRate = cost.TotalCostUSD / hoursElapsed
	}

	// Format native cost info (2 decimal places)
	sessionCost := fmt.Sprintf("$%.2f", cost.TotalCostUSD)
	burnRateStr := ""
	if burnRate > 0 {
		burnRateStr = fmt.Sprintf(" | $%.2f/hr", burnRate)
	}

	// Add Anthropic reset time instead of lines
	resetTime := getAnthropicResetTime()
	resetInfo := fmt.Sprintf(" | ⏰ %s", resetTime)

	result := fmt.Sprintf("📡 %s session%s%s", sessionCost, burnRateStr, resetInfo)
	return fmt.Sprintf("%s%s%s", CostColor, result, Reset)
}

func getTokenWarning(context *ClaudeContext) string {
	if context == nil || context.Exceeds200kTokens == nil || !*context.Exceeds200kTokens {
		return ""
	}
	
	warning := "⚠️  Context exceeds 200k tokens - /compact may auto-run"
	return fmt.Sprintf("%s%s%s", TokenWarningColor, warning, Reset)
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
	model := getModelDisplayName()
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

	// Native Claude Code cost information only
	nativeCostInfo := getNativeCostInfo(claudeContext)
	if nativeCostInfo != "" {
		output.WriteString(fmt.Sprintf("\n%s", nativeCostInfo))
	}

	// Token warning (v1.0.88+)
	tokenWarning := getTokenWarning(claudeContext)
	if tokenWarning != "" {
		output.WriteString(fmt.Sprintf("\n%s", tokenWarning))
	}

	return output.String()
}

func main() {
	output := generateStatusline()
	fmt.Print(output)
}
