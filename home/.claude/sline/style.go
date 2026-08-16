package main

import (
	"fmt"
	"math"
	"strings"
)

// Gruvbox-material palette (truecolor) — matches the terminal theme, so every
// supporting segment sits calmly on the warm dark background. The model-name
// gradient is the one deliberate outsider and stays synthwave.
const (
	Reset = "\033[0m"
	Bold  = "\033[1m"

	DirColor        = "\033[38;2;168;153;132m" // gray   #a89984
	SessionColor    = "\033[38;2;216;166;87m"  // yellow #d8a657
	VersionColor    = "\033[38;2;189;174;147m" // fg3    #bdae93
	NodeColor       = "\033[38;2;169;182;101m" // green  #a9b665
	NodeIconColor   = "\033[38;2;169;182;101m" // green  #a9b665
	PnpmColor       = "\033[38;2;231;138;78m"  // orange #e78a4e
	PnpmIconColor   = "\033[38;2;231;138;78m"  // orange #e78a4e
	BranchColor     = "\033[38;2;212;190;152m" // fg0    #d4be98 — cream "title" tone, unmistakable next to sync green
	AddColor        = "\033[38;2;169;182;101m" // green  #a9b665
	DelColor        = "\033[38;2;234;105;98m"  // red    #ea6962
	CleanColor      = "\033[38;2;146;131;116m" // gray   #928374
	StashColor      = "\033[38;2;211;134;155m" // purple #d3869b
	TicketColor     = "\033[38;2;125;174;163m" // blue   #7daea3 — pinned ticket, distinct from the yellow session name beside it
	UsageOkColor    = "\033[38;2;216;166;87m"  // yellow #d8a657 — calm
	UsageWarnColor  = "\033[38;2;231;138;78m"  // orange #e78a4e past 75%
	UsageCritColor  = "\033[38;2;234;105;98m"  // red    #ea6962 past 90%
	SyncAheadColor  = "\033[38;2;169;182;101m" // green  #a9b665
	SyncBehindColor = "\033[38;2;234;105;98m"  // red    #ea6962
	EffortTrackBg   = "\033[48;2;80;73;69m"    // bg2    #504945 — dial track behind the ramp glyph

	// Sep dims the inter-segment bullet (#7c6f64) so segments read as islands.
	Sep = " \033[38;2;124;111;100m•\033[0m "
)

// Truecolor gradient stops for the model name. A glyph can only be one solid
// color, so smoothness lives in how close neighbouring letters' hues are —
// two nearby stops read as a sweep; a full rainbow reads as confetti.
// Gruvbox-native sweep: purple → blue from the same material palette as the
// rest of the line, so the model name leads without shouting. Both endpoints
// sit ~5.4:1 on #282828 — evenly matched brightness.
var gradientStops = [][3]int{
	{211, 134, 155}, // gruvbox purple #d3869b
	{125, 174, 163}, // gruvbox blue   #7daea3
}

// Complementary warm sweep for the effort word — orange → yellow, the
// counterpoint to the model name's cool purple → blue.
var effortGradientStops = [][3]int{
	{231, 138, 78}, // gruvbox orange #e78a4e
	{216, 166, 87}, // gruvbox yellow #d8a657
}

func applyGradient(text string) string {
	return applyGradientStops(gradientStops, text)
}

func applyGradientStops(stops [][3]int, text string) string {
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
		c := gradientAt(stops, t)
		fmt.Fprintf(&result, "\033[38;2;%d;%d;%dm", c[0], c[1], c[2])
		result.WriteRune(r)
	}
	result.WriteString(Reset)
	return result.String()
}

// gradientAt maps t in [0,1] onto the stop sequence with linear interpolation.
func gradientAt(stops [][3]int, t float64) [3]int {
	segments := len(stops) - 1
	pos := t * float64(segments)
	i := int(pos)
	if i >= segments {
		i = segments - 1
	}
	f := pos - float64(i)
	from, to := stops[i], stops[i+1]
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
