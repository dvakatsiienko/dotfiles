package main

import (
	"os"
	"path/filepath"
)

// Every location sline reads under ~/.claude, named once. Five files used to
// each resolve the home directory and re-spell a path segment, which meant the
// layout of a directory none of them owns was duplicated across the package.
//
// This is also where a move lands: CONTEXT.md plans a consolidated artifact
// shelf at ~/.claude/shelf/ with handoffs as one family under it. That shelf
// does not exist yet, so these point at today's layout — and when it arrives,
// this file is the only thing that changes.

func claudeHome(parts ...string) string {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		return ""
	}
	return filepath.Join(append([]string{homeDir, ".claude"}, parts...)...)
}

// slineStatePath is the cross-render cache — disposable, never git-tracked.
func slineStatePath() string { return claudeHome("sline", "sline-state.json") }

// settingsPath holds the launch-time model and effort defaults.
func settingsPath() string { return claudeHome("settings.json") }

// sessionsDir maps session ids to the names peers address.
func sessionsDir() string { return claudeHome("sessions") }

// focusPath is per session id, so parallel sessions never fight over one file.
func focusPath(sessionID string) string { return claudeHome("focus", sessionID+".json") }

// handoffsDir is the CST store every handoff frontend shares.
func handoffsDir() string { return claudeHome("handoffs") }

// outputStylePath resolves a style to its markdown source. Callers pass the bare
// style name as rendered ("ELI5"); "output-" is this repo's filing prefix on
// disk and is added here, so exactly one place knows the naming convention.
func outputStylePath(styleName string) string {
	if styleName == "" {
		return ""
	}
	return claudeHome("output-styles", "output-"+styleName+".md")
}
