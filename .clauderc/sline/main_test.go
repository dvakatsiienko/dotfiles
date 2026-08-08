package main

import (
	"fmt"
	"strings"
	"testing"
)

func TestFormatResetIn(t *testing.T) {
	cases := []struct {
		seconds int64
		want    string
	}{
		{0, ""},
		{-5, ""},
		{59, "0m"},
		{35 * 60, "35m"},
		{116 * 60, "1h 56m"},
		{(24*60 + 1) * 60, "1d 0h 01m"},
		{(5*24*60 + 5*60) * 60, "5d 5h 00m"},
	}
	for _, c := range cases {
		if got := formatResetIn(c.seconds); got != c.want {
			t.Errorf("formatResetIn(%d) = %q, want %q", c.seconds, got, c.want)
		}
	}
}

func TestToSuperscript(t *testing.T) {
	cases := map[int]string{0: "⁰", 1: "¹", 9: "⁹", 12: "¹²", 205: "²⁰⁵"}
	for n, want := range cases {
		if got := toSuperscript(n); got != want {
			t.Errorf("toSuperscript(%d) = %q, want %q", n, got, want)
		}
	}
}

func TestParseGitStats(t *testing.T) {
	ins, del := parseGitStats(" 2 files changed, 68 insertions(+), 59 deletions(-)")
	if ins != "68" || del != "59" {
		t.Errorf("got %s/%s, want 68/59", ins, del)
	}
	ins, del = parseGitStats(" 1 file changed, 1 insertion(+)")
	if ins != "1" || del != "0" {
		t.Errorf("got %s/%s, want 1/0", ins, del)
	}
	ins, del = parseGitStats("")
	if ins != "0" || del != "0" {
		t.Errorf("got %s/%s, want 0/0", ins, del)
	}
}

func TestParseGitStatusV2(t *testing.T) {
	fixture := strings.Join([]string{
		"# branch.oid d421b9c253d183b251b866cb34e0bba5e70a9949",
		"# branch.head main",
		"# branch.upstream origin/main",
		"# branch.ab +3 -2",
		"# stash 2",
		"1 .M N... 100644 100644 100644 aaa bbb modified.txt",
		"1 A. N... 000000 100644 100644 000 ccc staged.txt",
		"1 MM N... 100644 100644 100644 ddd eee both.txt",
		"u UU N... 100644 100644 100644 100644 fff ggg hhh conflicted.txt",
		"? untracked.txt",
		"? another.txt",
	}, "\n")

	st := parseGitStatusV2(fixture)
	if !st.IsRepo || st.Head != "main" || !st.HasUpstream {
		t.Fatalf("header parse failed: %+v", st)
	}
	if st.Ahead != 3 || st.Behind != 2 || st.Stash != 2 {
		t.Errorf("ahead/behind/stash = %d/%d/%d, want 3/2/2", st.Ahead, st.Behind, st.Stash)
	}
	if st.Staged != 2 || st.Modified != 3 || st.Untracked != 2 || st.Entries != 4 {
		t.Errorf("staged/modified/untracked/entries = %d/%d/%d/%d, want 2/3/2/4",
			st.Staged, st.Modified, st.Untracked, st.Entries)
	}
	if len(st.UntrackedPaths) != 2 || st.UntrackedPaths[0] != "untracked.txt" {
		t.Errorf("untracked paths = %v", st.UntrackedPaths)
	}
}

func TestParseGitStatusV2Detached(t *testing.T) {
	st := parseGitStatusV2("# branch.oid abc\n# branch.head (detached)\n")
	if st.Head != "" || st.HasUpstream {
		t.Errorf("detached parse failed: %+v", st)
	}
}

func TestFormatSyncIndicator(t *testing.T) {
	if got := formatSyncIndicator(GitStatus{HasUpstream: false, Ahead: 1}); got != "" {
		t.Errorf("no upstream should render empty, got %q", got)
	}
	diverged := formatSyncIndicator(GitStatus{HasUpstream: true, Ahead: 1, Behind: 2})
	if !strings.Contains(diverged, "↑¹") || !strings.Contains(diverged, "↓²") {
		t.Errorf("diverged = %q, want ↑¹ and ↓²", diverged)
	}
	ahead := formatSyncIndicator(GitStatus{HasUpstream: true, Ahead: 12})
	if !strings.Contains(ahead, "↑¹²") {
		t.Errorf("ahead = %q, want ↑¹²", ahead)
	}
}

func TestExtractVersions(t *testing.T) {
	if got := extractVersionFromModelID("claude-opus-4-7-20251001"); got != "4.7" {
		t.Errorf("dated id = %q, want 4.7", got)
	}
	if got := extractVersionFromModelID("claude-fable-5"); got != "5" {
		t.Errorf("fable id = %q, want 5", got)
	}
	if got := extractVersionFromDisplayName("Opus 4.7 (1M context)"); got != "4.7" {
		t.Errorf("display = %q, want 4.7", got)
	}
	if got := extractModelFamily("Fable 5"); got != "Fable" {
		t.Errorf("family = %q, want Fable", got)
	}
}

func TestApplyGradient(t *testing.T) {
	// Rune-based interpolation: two runes must span the full stop range.
	got := applyGradient("éé")
	first := gradientStops[0]
	last := gradientStops[len(gradientStops)-1]
	if !strings.Contains(got, fmt.Sprintf("38;2;%d;%d;%d", first[0], first[1], first[2])) {
		t.Errorf("first rune should get the first stop, got %q", got)
	}
	if !strings.Contains(got, fmt.Sprintf("38;2;%d;%d;%d", last[0], last[1], last[2])) {
		t.Errorf("last rune should get the last stop, got %q", got)
	}
	if applyGradient("x") == "" || applyGradient("") != "" {
		t.Error("single-rune and empty inputs must not panic or misrender")
	}
}

func TestGradientAt(t *testing.T) {
	if gradientAt(0) != gradientStops[0] {
		t.Error("t=0 must return the first stop")
	}
	if gradientAt(1) != gradientStops[len(gradientStops)-1] {
		t.Error("t=1 must return the last stop")
	}
}
