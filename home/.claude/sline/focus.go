package main

import (
	"encoding/json"
	"os"
	"time"
)

// focusState is written by shelf/hooks/sline-focus.sh when Dima names the ticket
// he is on (`clam DOT-23`). One slot, never a list. Keyed per session id so
// parallel sessions never fight over one file.
type focusState struct {
	Pin   string `json:"pin"`
	PinAt int64  `json:"pin_at"`
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
	if st == nil || st.Pin == "" {
		return ""
	}

	status := loadStatuses()
	// Fire-and-forget when the status has aged out: the hook only runs when Dima
	// types, and sline redraws every minute regardless — so this is what keeps
	// the line fresh while a session sits idle. This render uses the cache as it
	// stands; the next one picks up whatever comes back.
	if refreshDue(status, st.Pin) {
		triggerRefresh(sessionID)
	}

	color := TicketColor
	if st.PinAt > 0 && time.Since(time.Unix(st.PinAt, 0)) > pinStaleAfter {
		color = CleanColor
	}
	out := "🪄 " + paint(color, ticketLink(st.Pin))
	// The id and its state stay one visual unit.
	if badge := statusBadge(status, st.Pin); badge != "" {
		out += " " + badge
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
