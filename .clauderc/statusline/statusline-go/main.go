package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strings"
	"time"

)


// Legacy color definitions (keeping for compatibility)
const (
	Reset          = "\033[0m"
	Bold           = "\033[1m"
	NodeColor      = "\033[38;5;71m"
	NodeIconColor  = "\033[38;5;71m"
	PnpmColor      = "\033[38;5;202m"
	PnpmIconColor  = "\033[38;5;202m"
	ModelColor     = "\033[38;5;201m"
	ModelIconColor = "\033[38;5;201m"
	DirColor       = "\033[38;5;248m" // Lighter gray for directory
	DirIconColor   = "\033[38;5;248m" // Lighter gray for directory icon
	BranchColor    = "\033[32m"
	AddColor       = "\033[32m"
	DelColor       = "\033[31m"
	CleanColor     = "\033[2;37m"
	StashColor     = "\033[96m"
	SyncAheadColor = "\033[33m"     // yellow for ahead
	SyncBehindColor = "\033[31m"    // red for behind  
	SyncDivergedColor = "\033[35m"  // magenta for diverged
	SyncUpToDateColor = "\033[32m"  // green for up to date
)

// Retro gradient colors for model name (bright ANSI codes 90-97 range)
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
	"👽", "👻", "💫", "💨", "💭", "🤷‍♂️", "🤦‍♂️", "🏄‍♂️", "🐺", "🦊",
	"🐆", "🦄", "🦌", "🦬", "🐄", "🐖", "🐪", "🦙", "🦏", "🐇",
	"🦇", "🐻", "🦥", "🦨", "🦘", "🐓", "🐣", "🐥", "🦅", "🦢",
	"🦉", "🦩", "🐢", "🦎", "🦭", "🪸", "🐌", "🦂", "🌾", "🍀",
	"🍌", "🥭", "🥝", "🥥", "🍆", "🥕", "🌶️", "🧀", "🍕", "🎃",
	"🥋", "🔮", "🧸", "🪵", "🪂", "⛈️", "⚡", "🌈", "🎹", "🕯️", "💡",
}

// State management for emoji rotation
type EmojiState struct {
	CurrentIndex   int   `json:"current_index"`
	LastUpdateTime int64 `json:"last_update_time"`
}

// Git sync status structure
type GitSyncStatus struct {
	Ahead  int
	Behind int
	HasUpstream bool
}




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


func getCurrentDirName() string {
	wd, err := os.Getwd()
	if err != nil {
		return "unknown"
	}
	
	homeDir, _ := os.UserHomeDir()
	
	// Handle special cases
	if wd == "/" {
		return "/"
	}
	if wd == homeDir {
		return "~"
	}
	
	// If we're in home directory or subdirectory, use ~ prefix
	if strings.HasPrefix(wd, homeDir) {
		relativePath := strings.TrimPrefix(wd, homeDir)
		if relativePath == "" {
			return "~"
		}
		return "~" + relativePath
	}
	
	// If we're outside home directory, return full path from root
	return wd
}

func getGitEmoji() string {
	hour := time.Now().Hour()
	if hour >= 6 && hour < 18 {
		return "🦔" // Day hedgehog
	}
	return "🦦" // Night otter
}

func getStateFilePath() string {
	homeDir, _ := os.UserHomeDir()
	return filepath.Join(homeDir, ".claude", "statusline", "statusline-db.json")
}


func initStateFile(filePath string) {
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		os.MkdirAll(filepath.Dir(filePath), 0755)
		state := EmojiState{CurrentIndex: 0, LastUpdateTime: 0}
		data, _ := json.Marshal(state)
		ioutil.WriteFile(filePath, data, 0644)
	}
}

func getModelEmoji() string {
	stateFile := getStateFilePath()
	initStateFile(stateFile)
	
	data, err := ioutil.ReadFile(stateFile)
	if err != nil {
		return modelEmojis[0]
	}
	
	var state EmojiState
	if err := json.Unmarshal(data, &state); err != nil {
		return modelEmojis[0]
	}
	
	currentTime := time.Now().Unix()
	
	// Check if 1+ hours (3600 seconds) have passed
	if currentTime-state.LastUpdateTime >= 3600 {
		// Rotate to next emoji
		state.CurrentIndex = (state.CurrentIndex + 1) % len(modelEmojis)
		state.LastUpdateTime = currentTime
		
		// Update state file
		data, _ := json.Marshal(state)
		ioutil.WriteFile(stateFile, data, 0644)
	}
	
	return modelEmojis[state.CurrentIndex]
}

func getModelFromSettings() string {
	homeDir, _ := os.UserHomeDir()
	settingsPath := filepath.Join(homeDir, ".claude", "settings.json")
	
	data, err := ioutil.ReadFile(settingsPath)
	if err != nil {
		return "sonnet"
	}
	
	// Simple regex to extract model value
	re := regexp.MustCompile(`"model"\s*:\s*"([^"]*)"`)
	matches := re.FindStringSubmatch(string(data))
	if len(matches) > 1 {
		return matches[1]
	}
	
	return "sonnet"
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
		// Node.js already includes 'v' prefix, so just return it
		return version
	}
	return "none"
}

func getPnpmVersion() string {
	version := runCommand("pnpm", "--version")
	if version != "" {
		// Add 'v' prefix to pnpm version
		return "v" + version
	}
	return "none"
}

func isGitRepo() bool {
	cmd := exec.Command("git", "rev-parse", "--git-dir")
	return cmd.Run() == nil
}

func getGitBranch() string {
	branch := runCommand("git", "branch", "--show-current")
	if branch == "" {
		return "detached"
	}
	return branch
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

func getUntrackedCount() int {
	output := runCommand("git", "ls-files", "--others", "--exclude-standard")
	if output == "" {
		return 0
	}
	return len(strings.Split(strings.TrimSpace(output), "\n"))
}

func getUntrackedLineCount() int {
	files := runCommand("git", "ls-files", "--others", "--exclude-standard")
	if files == "" {
		return 0
	}
	
	totalLines := 0
	fileList := strings.Split(strings.TrimSpace(files), "\n")
	
	for _, file := range fileList {
		if file != "" {
			content := runCommand("wc", "-l", file)
			if content != "" {
				// wc -l output format: "   123 filename"
				parts := strings.Fields(content)
				if len(parts) > 0 {
					if lines := parseIntSafe(parts[0]); lines > 0 {
						totalLines += lines
					}
				}
			}
		}
	}
	
	return totalLines
}

func getStagedFileCount() int {
	output := runCommand("git", "diff", "--cached", "--name-only")
	if output == "" {
		return 0
	}
	return len(strings.Split(strings.TrimSpace(output), "\n"))
}

func getModifiedFileCount() int {
	output := runCommand("git", "diff", "--name-only")
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

func getBranchSyncStatus() GitSyncStatus {
	status := GitSyncStatus{Ahead: 0, Behind: 0, HasUpstream: false}
	
	// Get branch status with tracking info
	output := runCommand("git", "status", "-b", "--porcelain")
	if output == "" {
		return status
	}
	
	// Parse first line which contains branch info
	lines := strings.Split(output, "\n")
	if len(lines) == 0 {
		return status
	}
	
	branchLine := lines[0]
	// Format: ## branch...origin/branch [ahead 2, behind 1]
	if !strings.HasPrefix(branchLine, "## ") {
		return status
	}
	
	// Check if branch has upstream
	if !strings.Contains(branchLine, "...") {
		return status // No upstream
	}
	
	status.HasUpstream = true
	
	// Parse ahead/behind info
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

func parseIntSafe(s string) int {
	val := 0
	for _, char := range s {
		if char >= '0' && char <= '9' {
			val = val*10 + int(char-'0')
		} else {
			break
		}
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
	
	// Convert each digit to superscript
	for temp > 0 {
		digit := temp % 10
		result = superscripts[digit] + result
		temp /= 10
	}
	
	return result
}

func formatSyncIndicator(status GitSyncStatus) string {
	if !status.HasUpstream {
		return "" // No upstream, no indicator
	}
	
	if status.Ahead > 0 && status.Behind > 0 {
		// Diverged: arrows and numbers in red
		aheadStr := toSuperscript(status.Ahead)
		behindStr := toSuperscript(status.Behind)
		return fmt.Sprintf("%s↕%s%s↓%s%s", 
			SyncBehindColor, aheadStr, behindStr, Reset)
	} else if status.Ahead > 0 {
		// Ahead only: ↑ and number in green
		aheadStr := toSuperscript(status.Ahead)
		return fmt.Sprintf("%s↑%s%s", BranchColor, aheadStr, Reset)
	} else if status.Behind > 0 {
		// Behind only: ↓ and number in yellow
		behindStr := toSuperscript(status.Behind)
		return fmt.Sprintf("%s↓%s%s", SyncAheadColor, behindStr, Reset)
	} else {
		// Up to date: no indicator, just clean branch display
		return ""
	}
}


func generateStatusline() string {
	var output strings.Builder
	
	// Add explicit reset at start to fix first-position dimming
	output.WriteString(Reset)
	
	// Directory section (first)
	dirName := getCurrentDirName()
	output.WriteString(fmt.Sprintf("%s%s%s", DirColor, dirName, Reset))
	
	// Model section (second)
	model := getModelFromSettings()
	modelEmoji := getModelEmoji()
	gradientModel := applyGradient(model)
	output.WriteString(fmt.Sprintf(" • %s%s%s %s", ModelIconColor, modelEmoji, Reset, gradientModel))
	
	// Merged Node and PNPM section (third)
	nodeVersion := getNodeVersion()
	pnpmVersion := getPnpmVersion()
	output.WriteString(fmt.Sprintf(" • %s%s󰎙%s %s%s%s · %s%s%s", 
		Bold, NodeIconColor, Reset, NodeColor, nodeVersion, Reset, PnpmColor, pnpmVersion, Reset))
	
	// Git section
	if isGitRepo() {
		branch := getGitBranch()
		syncStatus := getBranchSyncStatus()
		syncIndicator := formatSyncIndicator(syncStatus)
		
		if syncIndicator != "" {
			output.WriteString(fmt.Sprintf(" • 🌿 %s%s%s %s", BranchColor, branch, Reset, syncIndicator))
		} else {
			output.WriteString(fmt.Sprintf(" • 🌿 %s%s%s", BranchColor, branch, Reset))
		}
		
		// Git diff stats
		stagedStats := runCommand("git", "diff", "--cached", "--shortstat")
		unstagedStats := runCommand("git", "diff", "--shortstat")
		
		// File counts
		stagedFileCount := getStagedFileCount()
		modifiedFileCount := getModifiedFileCount()
		untrackedCount := getUntrackedCount()
		totalFileCount := stagedFileCount + modifiedFileCount + untrackedCount
		
		stagedInsertions, stagedDeletions := parseGitStats(stagedStats)
		unstagedInsertions, unstagedDeletions := parseGitStats(unstagedStats)
		
		// Note: Untracked files are counted in file count but NOT in line diff stats
		// Git's --shortstat only shows changes to tracked files, not new file additions
		
		gitEmoji := getGitEmoji()
		hasUnstagedChanges := unstagedStats != "" || untrackedCount > 0
		
		if stagedStats != "" && hasUnstagedChanges {
			// Both staged and unstaged changes
			output.WriteString(fmt.Sprintf(" • %s %s(%d)%s %s+%s%s%s-%s%s %s✓%s | %s+%s%s%s-%s%s",
				gitEmoji, CleanColor, totalFileCount, Reset, AddColor, stagedInsertions, Reset, DelColor, stagedDeletions, Reset,
				AddColor, Reset, AddColor, unstagedInsertions, Reset, DelColor, unstagedDeletions, Reset))
		} else if stagedStats != "" {
			// Only staged changes
			output.WriteString(fmt.Sprintf(" • %s %s(%d)%s %s+%s%s%s-%s%s %s✓%s",
				gitEmoji, CleanColor, stagedFileCount, Reset, AddColor, stagedInsertions, Reset, DelColor, stagedDeletions, Reset, AddColor, Reset))
		} else if hasUnstagedChanges {
			// Only unstaged changes (modified + untracked)
			unstagedFileCount := modifiedFileCount + untrackedCount
			output.WriteString(fmt.Sprintf(" • %s %s(%d)%s %s+%s%s%s-%s%s",
				gitEmoji, CleanColor, unstagedFileCount, Reset, AddColor, unstagedInsertions, Reset, DelColor, unstagedDeletions, Reset))
		} else {
			// Clean repo
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
	
	// System Performance Section removed - matching statusline.sh
	
	
	// Add bottom margin for consistent spacing
	output.WriteString("\n")
	return output.String()
}

func main() {
	// Static output for statusline usage
	output := generateStatusline()
	fmt.Print(output)
}