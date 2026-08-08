package main

import (
	"fmt"
	"math"
	"strings"
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
	SyncAheadColor  = "\033[32m"
	SyncBehindColor = "\033[31m"
)

// Truecolor gradient stops for the model name. A glyph can only be one solid
// color, so smoothness lives in how close neighbouring letters' hues are —
// two nearby stops read as a sweep; a full rainbow reads as confetti.
var gradientStops = [][3]int{
	{255, 95, 255}, // hot magenta
	{95, 235, 255}, // cyan
}

func applyGradient(text string) string {
	runes := []rune(text)
	n := len(runes)
	if n == 0 {
		return ""
	}
	var result strings.Builder
	for i, r := range runes {
		t := 0.0
		if n > 1 {
			t = float64(i) / float64(n-1)
		}
		c := gradientAt(t)
		fmt.Fprintf(&result, "\033[38;2;%d;%d;%dm", c[0], c[1], c[2])
		result.WriteRune(r)
	}
	result.WriteString(Reset)
	return result.String()
}

// gradientAt maps t in [0,1] onto the stop sequence with linear interpolation.
func gradientAt(t float64) [3]int {
	segments := len(gradientStops) - 1
	pos := t * float64(segments)
	i := int(pos)
	if i >= segments {
		i = segments - 1
	}
	f := pos - float64(i)
	from, to := gradientStops[i], gradientStops[i+1]
	return [3]int{lerp(from[0], to[0], f), lerp(from[1], to[1], f), lerp(from[2], to[2], f)}
}

func lerp(from, to int, f float64) int {
	return from + int(math.Round(float64(to-from)*f))
}

var superscripts = []string{"⁰", "¹", "²", "³", "⁴", "⁵", "⁶", "⁷", "⁸", "⁹"}

func toSuperscript(n int) string {
	if n == 0 {
		return superscripts[0]
	}
	result := ""
	for n > 0 {
		result = superscripts[n%10] + result
		n /= 10
	}
	return result
}
