package main

import (
	"encoding/json"
	"os"
	"os/exec"
	"strings"
	"syscall"
	"time"
)

// Linear status for the pinned id. sline only ever READS this — shelf/hooks/sline-status-fetch.sh
// owns the fetch, because a linear call costs ~325ms and sline renders on every
// prompt and again every minute. See DOT-81.
//
// The cache format, its writer and its retention are specified once in
// shelf/hooks/FOCUS-SPEC.md; this struct is the reading half of that contract.
type ticketStatus struct {
	Status string `json:"status"` // Linear's own state name, e.g. "In Progress"
	Type   string `json:"type"`   // stable enum: unstarted/started/completed/canceled/…
	At     int64  `json:"at"`
}

// statusStaleAfter is deliberately longer than the 60s fetch TTL: between the two
// a status is merely un-refreshed, which is normal for an idle session. Past this
// it has gone unrefreshed through many prompts, so it stops asserting and starts
// admitting. Every duration in this seam: shelf/hooks/FOCUS-SPEC.md.
const statusStaleAfter = 10 * time.Minute

// Short forms, chosen over full names because line 1 is already crowded and a
// spelled-out state buys nothing a three-letter one does not. Anything not
// listed renders lowercased as Linear names it.
var statusShort = map[string]string{
	"In Progress": "wip",
	"In Review":   "review",
	"Canceled":    "cancel",
	"Cancelled":   "cancel",
}

// One colour per state, all from the existing palette. Colour is a second signal
// here, never the only one — the word still says it, per fleet-voice.md.
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

// statusFetchTTL mirrors `ttl` in shelf/hooks/sline-status-fetch.sh, and must be
// changed with it. The script is the authority — it re-checks before spending a
// request. This copy exists only so sline does not spawn a process on every
// single render to be told "not yet". FOCUS-SPEC.md, "The four durations".
const statusFetchTTL = 60 * time.Second

// refreshDue reports whether the pinned id is missing from the cache or has aged
// past the TTL. Only the pinned id is considered: entries left behind by ids
// that have moved on keep old timestamps forever. An empty pin is never due —
// treating it as a missing status made sline spawn a fetch on every render.
func refreshDue(cache map[string]ticketStatus, id string) bool {
	if id == "" {
		return false
	}
	st, ok := cache[id]
	return !ok || st.At <= time.Now().Add(-statusFetchTTL).Unix()
}

// triggerRefresh fires the fetch and walks away. sline redraws every minute, so
// this render shows the cache as it stands and the next one picks up the result.
// Waiting was never an option: a linear call is ~325ms in a path that runs on
// every prompt.
//
// Setpgid detaches the child from sline's process group, so it survives sline
// exiting a few milliseconds later. Nothing is waited on and nothing is read —
// the script's only output is the cache file.
func triggerRefresh(sessionID string) {
	if sessionID == "" {
		return
	}
	script := claudeHome("shelf", "hooks", "sline-status-fetch.sh")
	if _, err := os.Stat(script); err != nil {
		return
	}
	cmd := exec.Command("bash", script, focusPath(sessionID))
	cmd.SysProcAttr = &syscall.SysProcAttr{Setpgid: true}
	_ = cmd.Start()
}
