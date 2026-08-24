package main

import (
	"encoding/json"
	"os"
	"time"
)

// focusState is written by hooks/sline-focus.sh (Dima's clam/touch/fly keywords) and
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
	data, err := os.ReadFile(focusPath(sessionID))
	if err != nil {
		return nil
	}
	var st focusState
	if json.Unmarshal(data, &st) != nil {
		return nil
	}
	return &st
}

func focusSegment(sessionID string) string {
	st := loadFocus(sessionID)
	if st == nil || (st.Pin == "" && len(st.Touch) == 0) {
		return ""
	}

	status := loadStatuses()
	// Fire-and-forget when something has aged out: the hook only runs when Dima
	// types, and sline redraws every minute regardless — so this is what keeps
	// the line fresh while a session sits idle. This render uses the cache as it
	// stands; the next one picks up whatever comes back.
	if refreshDue(status, append([]string{st.Pin}, st.Touch...)) {
		triggerRefresh(sessionID)
	}
	// withStatus keeps the id and its state one visual unit.
	withStatus := func(rendered, id string) string {
		if badge := statusBadge(status, id); badge != "" {
			return rendered + " " + badge
		}
		return rendered
	}

	out := ""
	if st.Pin != "" {
		color := TicketColor
		if st.PinAt > 0 && time.Since(time.Unix(st.PinAt, 0)) > pinStaleAfter {
			color = CleanColor
		}
		out += withStatus("🪄 "+paint(color, ticketLink(st.Pin)), st.Pin)
	}
	// Touches only earn space where they disagree with the pin — that
	// disagreement is the whole point: it is the drift the pin is guarding.
	first := st.Pin == ""
	for _, id := range st.Touch {
		if id == "" || id == st.Pin {
			continue
		}
		if first {
			out += withStatus(paint(CleanColor, ticketLink(id)), id)
			first = false
			continue
		}
		out += " " + withStatus(paint(CleanColor, "· "+ticketLink(id)), id)
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
