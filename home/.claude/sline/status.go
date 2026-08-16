package main

import (
	"encoding/json"
	"os"
	"strings"
	"time"
)

// Linear status for the ids in focus. sline only ever READS this — hooks/focus.sh
// owns the fetch, because a linear call costs ~325ms and sline renders on every
// prompt and again every minute. See DOT-81.
type ticketStatus struct {
	Status string `json:"status"` // Linear's own state name, e.g. "In Progress"
	Type   string `json:"type"`   // stable enum: unstarted/started/completed/canceled/…
	At     int64  `json:"at"`
}

// statusStaleAfter is deliberately longer than the hook's 5m fetch TTL: between
// the two a status is merely un-refreshed, which is normal. Past this it has gone
// unrefreshed through many prompts, so it stops asserting and starts admitting.
const statusStaleAfter = 10 * time.Minute

// Short forms, chosen over full names because four ids in focus with "in progress"
// spelled out runs to 65 columns — most of line 1. Anything not listed renders
// lowercased as Linear names it.
var statusShort = map[string]string{
	"In Progress": "wip",
	"In Review":   "review",
	"Canceled":    "cancel",
	"Cancelled":   "cancel",
}

// One colour per state, all from the existing palette. Colour is a second signal
// here, never the only one — the word still says it, per voice.md.
var statusColorByName = map[string]string{
	"Todo":        CleanColor,
	"In Progress": UsageOkColor,
	"In Review":   TicketColor,
	"Done":        AddColor,
	"Canceled":    DelColor,
	"Cancelled":   DelColor,
}

// Fallback for states this map has never seen — Linear's type enum is stable
// where its display names are renameable.
var statusColorByType = map[string]string{
	"started":   UsageOkColor,
	"completed": AddColor,
	"canceled":  DelColor,
}

func loadStatuses() map[string]ticketStatus {
	data, err := os.ReadFile(statusCachePath())
	if err != nil {
		return nil
	}
	var cache map[string]ticketStatus
	if json.Unmarshal(data, &cache) != nil {
		return nil
	}
	return cache
}

// statusBadge renders one id's state, or "" when nothing is cached for it —
// which is the normal state of affairs before the first fetch lands.
func statusBadge(cache map[string]ticketStatus, id string) string {
	st, ok := cache[id]
	if !ok || st.Status == "" {
		return ""
	}

	label, named := statusShort[st.Status]
	if !named {
		label = strings.ToLower(st.Status)
	}

	color, ok := statusColorByName[st.Status]
	if !ok {
		if color, ok = statusColorByType[st.Type]; !ok {
			color = CleanColor
		}
	}

	// Past the staleness window the status admits it rather than asserting: the
	// colour drops out and a ? goes on. Same honesty the pin already practises.
	if st.At > 0 && time.Since(time.Unix(st.At, 0)) > statusStaleAfter {
		return paint(CleanColor, label+"?")
	}
	return paint(color, label)
}
