package main

import (
	"fmt"
	"math"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"
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

func TestCacheCold(t *testing.T) {
	dir := t.TempDir()
	transcript := filepath.Join(dir, "transcript.jsonl")
	if err := os.WriteFile(transcript, []byte("{}"), 0o600); err != nil {
		t.Fatal(err)
	}

	if cacheCold(transcript) {
		t.Error("fresh transcript reported cold")
	}

	old := time.Now().Add(-cacheTTL - time.Minute)
	if err := os.Chtimes(transcript, old, old); err != nil {
		t.Fatal(err)
	}
	if !cacheCold(transcript) {
		t.Error("transcript idle past TTL not reported cold")
	}

	if cacheCold("") {
		t.Error("empty path reported cold")
	}
	if cacheCold(filepath.Join(dir, "missing.jsonl")) {
		t.Error("missing file reported cold")
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

func TestResolveSessionName(t *testing.T) {
	dir := t.TempDir()
	write := func(name, content string) {
		if err := os.WriteFile(filepath.Join(dir, name), []byte(content), 0644); err != nil {
			t.Fatal(err)
		}
	}
	write("100.json", `{"sessionId":"aaa-bbb","name":"alpha-thread"}`)
	write("200.json", `{"sessionId":"ccc-ddd","name":"beta-thread"}`)
	write("300.json", `broken json`)
	write("notes.txt", `ignored`)

	if got := resolveSessionName(dir, "ccc-ddd"); got != "beta-thread" {
		t.Errorf("got %q, want beta-thread", got)
	}
	if got := resolveSessionName(dir, "zzz"); got != "" {
		t.Errorf("unknown id should be empty, got %q", got)
	}
	if got := resolveSessionName(dir, ""); got != "" {
		t.Errorf("empty id should be empty, got %q", got)
	}
	if got := resolveSessionName(filepath.Join(dir, "missing"), "aaa-bbb"); got != "" {
		t.Errorf("missing dir should be empty, got %q", got)
	}
}

func TestKebabLabel(t *testing.T) {
	cases := map[string]string{
		"Check auto capture enabled status": "check-auto-capture-enabled-status",
		"already-kebab":                     "already-kebab",
		"  Spaced   Out  ":                  "spaced-out",
		"":                                  "",
	}
	for in, want := range cases {
		if got := kebabLabel(in); got != want {
			t.Errorf("kebabLabel(%q) = %q, want %q", in, got, want)
		}
	}
}

func TestProgressBarWidth(t *testing.T) {
	cells := func(bar string) (filled, empty int) {
		return strings.Count(bar, "▮"), strings.Count(bar, "▯")
	}
	f, e := cells(progressBar(0))
	if f != 0 || e != barWidth {
		t.Errorf("0%% = %d filled / %d empty, want 0/%d", f, e, barWidth)
	}
	f, e = cells(progressBar(50))
	if want := int(math.Round(0.5 * barWidth)); f != want || f+e != barWidth {
		t.Errorf("50%% = %d filled / %d empty, want %d/%d", f, e, want, barWidth-want)
	}
	f, e = cells(progressBar(100))
	if f != barWidth || e != 0 {
		t.Errorf("100%% = %d filled / %d empty, want %d/0", f, e, barWidth)
	}
	f, e = cells(progressBar(150))
	if f != barWidth || e != 0 {
		t.Errorf("overflow must clamp, got %d/%d", f, e)
	}
}

func TestContextTokens(t *testing.T) {
	// Fallback path: pct × assumed 200k window.
	if got := contextTokens(&ContextWindowInfo{}, 7); got != "~14k" {
		t.Errorf("7%% of 200k = %q, want ~14k", got)
	}
	// Explicit window size wins over the 200k assumption.
	if got := contextTokens(&ContextWindowInfo{ContextWindowSize: 1_000_000}, 10); got != "~100k" {
		t.Errorf("10%% of 1M = %q, want ~100k", got)
	}
	// Server usage numbers win over any percentage math.
	w := &ContextWindowInfo{}
	w.CurrentUsage = &struct {
		InputTokens              int `json:"input_tokens"`
		CacheCreationInputTokens int `json:"cache_creation_input_tokens"`
		CacheReadInputTokens     int `json:"cache_read_input_tokens"`
		OutputTokens             int `json:"output_tokens"`
	}{InputTokens: 20_000, CacheReadInputTokens: 60_400, OutputTokens: 1_000}
	if got := contextTokens(w, 7); got != "~81k" {
		t.Errorf("usage sum = %q, want ~81k", got)
	}
	if got := contextTokens(&ContextWindowInfo{}, 0); got != "" {
		t.Errorf("0%% should render nothing, got %q", got)
	}
}

func TestTruncateLabel(t *testing.T) {
	if got := truncateLabel("short", 28); got != "short" {
		t.Errorf("got %q", got)
	}
	if got := truncateLabel("abcdefghij", 5); got != "abcd…" {
		t.Errorf("got %q, want abcd…", got)
	}
}

func TestHandoffPendingCount(t *testing.T) {
	dir := t.TempDir()
	os.WriteFile(filepath.Join(dir, "a.md"), []byte("x"), 0600)
	os.WriteFile(filepath.Join(dir, "b.md"), []byte("x"), 0600)
	os.WriteFile(filepath.Join(dir, "c.txt"), []byte("x"), 0600)
	if got := handoffPendingCount(dir); got != 2 {
		t.Errorf("got %d, want 2", got)
	}
	if got := handoffPendingCount(filepath.Join(dir, "missing")); got != 0 {
		t.Errorf("missing dir should be 0, got %d", got)
	}
}

func TestFormatWindowRollover(t *testing.T) {
	// resets_at in the past means the window rolled over while idle: the stale
	// pre-reset percentage must render as a fresh 0%, with no countdown.
	stale := &RateLimitWindow{UsedPercentage: 101, ResetsAt: 1000}
	got := formatWindow("5h", stale)
	if !strings.Contains(got, "0%") || strings.Contains(got, "101") || strings.Contains(got, "→") {
		t.Errorf("stale window should render fresh 0%% without countdown, got %q", got)
	}
}

func TestNormalizeRemoteURL(t *testing.T) {
	cases := map[string]string{
		"git@github.com:dvakatsiienko/.dotfiles.git": "https://github.com/dvakatsiienko/.dotfiles",
		"https://github.com/user/repo.git":           "https://github.com/user/repo",
		"https://github.com/user/repo":               "https://github.com/user/repo",
		"ssh://weird/path":                           "",
		"":                                           "",
	}
	for in, want := range cases {
		if got := normalizeRemoteURL(in); got != want {
			t.Errorf("normalizeRemoteURL(%q) = %q, want %q", in, got, want)
		}
	}
}

func TestHyperlink(t *testing.T) {
	if got := hyperlink("", "main"); got != "main" {
		t.Errorf("empty url must return bare text, got %q", got)
	}
	got := hyperlink("https://x.dev", "main")
	if !strings.Contains(got, "\033]8;;https://x.dev\033\\main\033]8;;\033\\") {
		t.Errorf("bad OSC 8 wrapping: %q", got)
	}
}

func TestGradientAt(t *testing.T) {
	if gradientAt(gradientStops, 0) != gradientStops[0] {
		t.Error("t=0 must return the first stop")
	}
	if gradientAt(gradientStops, 1) != gradientStops[len(gradientStops)-1] {
		t.Error("t=1 must return the last stop")
	}
}

func TestRepoDirFollowsTheSessionNotTheShell(t *testing.T) {
	ctx := &ClaudeContext{}
	ctx.Workspace.ProjectDir = "/repo"
	ctx.Workspace.CurrentDir = "/tmp"

	// Travelling out of the repo must not blank the git segment.
	if got := repoDir(ctx); got != "/repo" {
		t.Errorf("repoDir = %q, want /repo", got)
	}

	ctx.Workspace.ProjectDir = ""
	if got := repoDir(ctx); got != "/tmp" {
		t.Errorf("repoDir without project_dir = %q, want /tmp", got)
	}

	if got := repoDir(nil); got != "" {
		t.Errorf("repoDir(nil) = %q, want empty", got)
	}
}
