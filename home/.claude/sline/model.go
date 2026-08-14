package main

import (
	"encoding/json"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strings"
	"time"
)

// Emoji rotation pool for the model segment
var modelEmojis = []string{
	"👽", "👻", "💫", "💨", "💭", "🐺", "🦊",
	"🐆", "🦄", "🦌", "🦬", "🐄", "🐖", "🐪", "🦙", "🦏", "🐇",
	"🦇", "🐻", "🦥", "🦨", "🦘", "🐓", "🐣", "🐥", "🦅", "🦢",
	"🦉", "🦩", "🐢", "🦎", "🦭", "🪸", "🐌", "🦂", "🌾", "🍀",
	"🍌", "🥭", "🥝", "🥥", "🍆", "🥕", "🌶️", "🧀", "🍕", "🎃",
	"🥋", "🔮", "🧸", "🪵", "🪂", "⛈️", "⚡️", "🌈", "🎹", "🕯️", "💡",
}

// SlineState persists across renders in sline-state.json: emoji rotation plus a
// pnpm version cache (pnpm --version is a ~200ms node script — too slow to run
// every render now that refreshInterval re-renders each minute).
type SlineState struct {
	CurrentIndex   int    `json:"current_index"`
	LastUpdateTime int64  `json:"last_update_time"`
	PnpmPath       string `json:"pnpm_path,omitempty"`
	PnpmVersion    string `json:"pnpm_version,omitempty"`
	PnpmCheckedAt  int64  `json:"pnpm_checked_at,omitempty"`
}

func stateFilePath() string {
	homeDir, _ := os.UserHomeDir()
	return filepath.Join(homeDir, ".claude", "sline", "sline-state.json")
}

func loadState() SlineState {
	var state SlineState
	if data, err := os.ReadFile(stateFilePath()); err == nil {
		json.Unmarshal(data, &state)
	}
	return state
}

// saveState writes via temp file + rename so concurrent renders (multiple CC
// sessions share this file) can't interleave into a torn JSON.
func saveState(state SlineState) {
	path := stateFilePath()
	os.MkdirAll(filepath.Dir(path), 0755)
	data, err := json.Marshal(state)
	if err != nil {
		return
	}
	tmp := path + ".tmp"
	if os.WriteFile(tmp, data, 0644) == nil {
		os.Rename(tmp, path)
	}
}

// modelEmoji advances the rotation hourly; reports whether state changed.
func modelEmoji(state *SlineState) (string, bool) {
	now := time.Now().Unix()
	if now-state.LastUpdateTime >= 3600 {
		state.CurrentIndex = (state.CurrentIndex + 1) % len(modelEmojis)
		state.LastUpdateTime = now
		return modelEmojis[state.CurrentIndex], true
	}
	if state.CurrentIndex < 0 || state.CurrentIndex >= len(modelEmojis) {
		return modelEmojis[0], false
	}
	return modelEmojis[state.CurrentIndex], false
}

// =============================================================================
// MODEL NAME
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

// extractModelFamily removes version numbers from display name.
// Example: "Sonnet 4.5" -> "Sonnet", "Fable 5" -> "Fable"
func extractModelFamily(displayName string) string {
	re := regexp.MustCompile(`\s+\d+(?:\.\d+)?.*$`)
	return strings.TrimSpace(re.ReplaceAllString(displayName, ""))
}

// getModelFromSettings is the bare-terminal fallback when no stdin JSON exists.
func getModelFromSettings() string {
	homeDir, _ := os.UserHomeDir()
	data, err := os.ReadFile(filepath.Join(homeDir, ".claude", "settings.json"))
	if err != nil {
		return "sonnet"
	}
	var settings struct {
		Model string `json:"model"`
	}
	if json.Unmarshal(data, &settings) != nil || settings.Model == "" {
		return "sonnet"
	}
	return settings.Model
}

// getEffortFromSettings reads the persisted /effort default; the statusline
// stdin JSON doesn't carry effort, so settings.json is the source of truth.
func getEffortFromSettings() string {
	homeDir, _ := os.UserHomeDir()
	data, err := os.ReadFile(filepath.Join(homeDir, ".claude", "settings.json"))
	if err != nil {
		return ""
	}
	var settings struct {
		EffortLevel string `json:"effortLevel"`
	}
	if json.Unmarshal(data, &settings) != nil {
		return ""
	}
	return settings.EffortLevel
}

// Effort dial: one ramp glyph per level, colored cold→hot so the throttle
// position reads at a glance without spelling the word out loud.
var effortDial = map[string]struct{ glyph, color string }{
	"low":    {"▂", NodeColor},
	"medium": {"▄", UsageOkColor},
	"high":   {"▆", UsageWarnColor},
	"xhigh":  {"▇", UsageCritColor},
	"max":    {"█", UsageCritColor},
}

func effortBadge(level string) string {
	d, ok := effortDial[level]
	if !ok {
		return ""
	}
	return EffortTrackBg + d.color + d.glyph + Reset + " " + applyGradientStops(effortGradientStops, level)
}

func getModelDisplayName(claudeContext *ClaudeContext) string {
	lightGrayColor := VersionColor
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
		modelFamily = getModelFromSettings()
	}

	displayName := modelFamily
	if modelFamily == "opusplan" {
		displayName = "opus plan"
	}

	rendered := enSpace + applyGradient(displayName)
	if version != "" {
		rendered += lightGrayColor + " " + version + Reset
	}
	if badge := effortBadge(getEffortFromSettings()); badge != "" {
		rendered += " " + badge
	}
	return rendered
}

// =============================================================================
// TOOL VERSIONS
// =============================================================================

func getNodeVersion() string {
	if version := runCommand("node", "--version"); version != "" {
		return version
	}
	return "none"
}

// getPnpmVersion caches by resolved binary path with a 12h TTL. fnm gives each
// shell its own multishell path, so a path change invalidates the cache naturally.
func getPnpmVersion(state *SlineState) (string, bool) {
	path, err := exec.LookPath("pnpm")
	if err != nil {
		return "none", false
	}
	now := time.Now().Unix()
	if state.PnpmPath == path && state.PnpmVersion != "" && now-state.PnpmCheckedAt < 12*3600 {
		return state.PnpmVersion, false
	}
	version := runCommand("pnpm", "--version")
	if version == "" {
		return "none", false
	}
	state.PnpmPath = path
	state.PnpmVersion = "v" + version
	state.PnpmCheckedAt = now
	return state.PnpmVersion, true
}
