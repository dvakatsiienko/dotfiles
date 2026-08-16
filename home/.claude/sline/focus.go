package main

import (
	"encoding/json"
	"os"
	"path/filepath"
	"time"
)

// focusState is written by hooks/focus.sh (Dima's clam/touch/fly keywords) and
// by the agent on ticket grab and close. Keyed per session id so parallel
// sessions never fight over one file.
type focusState struct {
	Pin     string   `json:"pin"`
	PinAt   int64    `json:"pin_at"`
	Touch   []string `json:"touch"`
	TouchAt int64    `json:"touch_at"`
}

// pinStaleAfter dims a pin nobody refreshed — a forgotten pin must look
// forgotten rather than quietly assert a ticket we left hours ago.
const pinStaleAfter = 8 * time.Hour

func loadFocus(sessionID string) *focusState {
	if sessionID == "" {
		return nil
	}
	homeDir, err := os.UserHomeDir()
	if err != nil {
		return nil
	}
	data, err := os.ReadFile(filepath.Join(homeDir, ".claude", "focus", sessionID+".json"))
	if err != nil {
		return nil
	}
	var st focusState
	if json.Unmarshal(data, &st) != nil {
		return nil
	}
	return &st
}

func focusSegment(claudeContext *ClaudeContext) string {
	if claudeContext == nil {
		return ""
	}
	st := loadFocus(claudeContext.SessionID)
	if st == nil || (st.Pin == "" && len(st.Touch) == 0) {
		return ""
	}

	out := ""
	if st.Pin != "" {
		color := TicketColor
		if st.PinAt > 0 && time.Since(time.Unix(st.PinAt, 0)) > pinStaleAfter {
			color = CleanColor
		}
		out += "🪄 " + paint(color, ticketLink(st.Pin))
	}
	// Touches only earn space where they disagree with the pin — that
	// disagreement is the whole point: it is the drift the pin is guarding.
	first := st.Pin == ""
	for _, id := range st.Touch {
		if id == "" || id == st.Pin {
			continue
		}
		if first {
			out += paint(CleanColor, ticketLink(id))
			first = false
			continue
		}
		out += " " + paint(CleanColor, "· "+ticketLink(id))
	}
	return out
}

// ticketLink makes the id clickable — the linear:// scheme opens the macOS app
// directly, and a hover in Warp reveals the target, which is the closest a
// statusline gets to a tooltip.
func ticketLink(id string) string {
	if id == "" {
		return ""
	}
	return hyperlink("linear://linear.app/issue/"+id, id)
}
