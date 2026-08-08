package main

import (
	"fmt"
	"strings"
	"time"
)

// usageColor grades a 0-100 percentage: calm below 75, warning past 75, alarm past 90.
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

// formatResetIn renders seconds until a window resets as "2d 5h 14m", "2h 14m" or "43m".
func formatResetIn(seconds int64) string {
	if seconds <= 0 {
		return ""
	}
	minutes := seconds / 60
	if minutes < 60 {
		return fmt.Sprintf("%dm", minutes)
	}
	if minutes < 24*60 {
		return fmt.Sprintf("%dh %02dm", minutes/60, minutes%60)
	}
	return fmt.Sprintf("%dd %dh %02dm", minutes/(24*60), (minutes%(24*60))/60, minutes%60)
}

func formatWindow(label string, window *RateLimitWindow) string {
	if window == nil {
		return ""
	}

	segment := fmt.Sprintf("%s %s%.0f%%%s",
		label, usageColor(window.UsedPercentage), window.UsedPercentage, Reset)

	if window.ResetsAt > 0 {
		if resetIn := formatResetIn(window.ResetsAt - time.Now().Unix()); resetIn != "" {
			// → (U+2192) has no emoji presentation, so it renders single-width as
			// plain text — no color-emoji fallback to mis-size, unlike ⏳ (U+23F3).
			segment += fmt.Sprintf(" %s→ %s%s", CleanColor, resetIn, Reset)
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
		if segment := formatWindow("5h", limits.FiveHour); segment != "" {
			segments = append(segments, segment)
		}
		if segment := formatWindow("week", limits.SevenDay); segment != "" {
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
