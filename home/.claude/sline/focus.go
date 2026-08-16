package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"time"
)

// focusState is written by hooks/focus.sh (touch slot, and pin when the user
// types the literal `focus DOT-N`) and by the x:pm skill (pin, on ticket grab).
// Keyed per session id so parallel sessions never fight over one file.
type focusState struct {
	Pin     string `json:"pin"`
	PinAt   int64  `json:"pin_at"`
	Touch   string `json:"touch"`
	TouchAt int64  `json:"touch_at"`
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
	if st == nil || (st.Pin == "" && st.Touch == "") {
		return ""
	}

	out := Sep
	if st.Pin != "" {
		color := TicketColor
		if st.PinAt > 0 && time.Since(time.Unix(st.PinAt, 0)) > pinStaleAfter {
			color = CleanColor
		}
		out += fmt.Sprintf("🎫 %s%s%s", color, st.Pin, Reset)
	}
	// The touch slot only earns space when it disagrees with the pin — that
	// disagreement is the whole point: it is the drift the pin is guarding.
	if st.Touch != "" && st.Touch != st.Pin {
		if st.Pin == "" {
			out += fmt.Sprintf("%s%s%s", CleanColor, st.Touch, Reset)
		} else {
			out += fmt.Sprintf(" %s· %s%s", CleanColor, st.Touch, Reset)
		}
	}
	return out
}
