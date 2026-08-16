package main

import "sort"

// Alerts are the one place an active fault renders. Anything that is wrong
// right now lands here instead of squatting in whichever cluster sits nearest —
// fast mode used to ride along with the model name, where it read as a feature
// badge rather than the money leak it is.
//
// Colour never carries the meaning alone: the word does, so the segment survives
// a colour-blind or low-contrast terminal.

type alertLevel int

const (
	alertWarn alertLevel = iota
	alertCrit
)

type alert struct {
	label string
	level alertLevel
}

func (a alert) color() string {
	if a.level == alertCrit {
		return UsageCritColor
	}
	return UsageWarnColor
}

func collectAlerts(claudeContext *ClaudeContext) []alert {
	var alerts []alert

	// Fast mode bills usage credits outside the subscription, and the first
	// enable in a conversation re-bills the whole context uncached. Read per
	// render and held nowhere, so it clears on toggle-off and on a switch to a
	// model that cannot run it.
	if claudeContext != nil && claudeContext.FastMode {
		alerts = append(alerts, alert{label: "↯ FAST", level: alertCrit})
	}

	// TEMPORARY — see peerSocketAlive in session.go (CC issue #85497).
	if !peerSocketAlive() {
		alerts = append(alerts, alert{label: "⚠ msg2peer", level: alertWarn})
	}

	sort.SliceStable(alerts, func(i, j int) bool {
		return alerts[i].level > alerts[j].level
	})
	return alerts
}

// alertSegments renders one segment per active fault — each is its own island,
// so two faults never read as one run-on label.
func alertSegments(claudeContext *ClaudeContext) []string {
	var segments []string
	for _, a := range collectAlerts(claudeContext) {
		segments = append(segments, paint(a.color(), a.label))
	}
	return segments
}
