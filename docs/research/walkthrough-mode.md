Ticket: DOT-158

# walkthrough mode — maintainer notes for a `/walkthrough` skill

field notes from two walkthroughs run on 2026-08-19 (claude dirs · macos filesystem), written as
input for a reusable fleet skill. dima's verdict on the mode: *"now i am macos fs expert 😎"*.

## 1 · the per-step shape

every step used the same four beats, in this order. deviating broke the rhythm.

1. **anchor command** — one command he runs himself. short, read-only, output that fits a screen.
2. **observation** — name what he is now looking at, in his output's own words. never generic.
3. **insight** — the *why*. the part he could not have got from the output alone.
4. **next hook** — one line naming what the next step covers, ending the turn.

📌 **the anchor must come before the explanation, not after.** explaining first and then saying "now
run this" turns the command into homework. running first makes the explanation land on something
already on screen.

📌 **one insight per step.** two competing insights read as a lecture.

## 2 · pacing

- **one step per turn. always end on the hook and stop.** the temptation is to bundle two steps when
  they are related; it kills the interactive quality.
- **4–5 steps per walkthrough.** both runs landed there naturally. beyond ~6 attention drops.
- **fewer, bigger steps for complex topics** (dima's note) — not more small ones. a hard subject
  needs more air per step, not more steps.
- **mid-to-high overview pace.** cover the territory; go deep only where a real hazard lives.
- **answer digressions in full, then resume.** he asked "what is `com.apple.callintelligenced`?"
  mid-tour; answering properly and returning to the numbered step cost nothing and raised trust.
  ⚠️ do **not** fold the digression into the step count.

## 3 · the upfront plan

state the stops at the start, and restate the list when it ends. when he asked *"where were we?"*
mid-tour, having a numbered plan made that a one-line answer.

⚠️ **and say when the tour is over.** it is not obvious from inside. "the walkthrough is finished,
here are the five stops" is a required beat, not a flourish.

## 4 · live examples over lecture — the rule that carried it

**every claim demonstrated on the user's own machine.** not a generic example, not a man page.

- ✅ *"`brew --prefix` → `/opt/homebrew`, and there are **zero** homebrew entries in your
  `/usr/local/bin`"*
- 🚫 *"homebrew usually installs to /opt/homebrew on apple silicon"*

the second is the same fact and persuades nobody.

**corollary: verify before answering a guess.** dima guessed `/bin` held hand-made clis. running
`touch /bin/.t` → `Operation not permitted` taught the sealed volume in one line. a flat "no" would
have taught nothing. 📌 **a wrong guess is the best teaching moment available — spend a command on it.**

## 5 · teach through near-misses, not warnings

the strongest moments were real mistakes and near-mistakes from the work itself:

- `vm_bundles` (9.6 gib) looked exactly like a cache and was a **live vm**, nearly proposed for deletion.
- 851 mib of spark mail was one `codesign --entitlements` check away from being deleted with a dead app.
- two apple caches, 301 mib each, **vanished on their own** within a day — measured, and it settles
  the "should i clean apple's folders?" question permanently.

📌 a story with a number and an outcome outperforms a rule stated flat. the skill should tell agents
to **mine the current session's own findings for these** rather than invent examples.

## 6 · what felt clunky

- ⚠️ **the walkthrough kept getting interrupted by real work** (deletions, tickets, a security
  finding). that is fine, but the agent must **re-anchor** on resume — restate which step is next.
  losing the thread reads as disorganisation.
- **step 1 ran long.** it carried the framing *and* the first insight. next time: framing gets its
  own short step.
- **the format has no natural close.** without a deliberate "that is the walkthrough" beat, it just
  trails off.
- ⚠️ **an agent's own post-checks can lie.** a grep-based check reported the crowdstrike extension
  "still registered" when its state read `terminated waiting to uninstall on reboot`. **check state,
  not presence** — and when correcting yourself, do it in one line and move on.

## 7 · what a skill must capture

- the four-beat step shape (§1), enforced.
- one step per turn; stop on the hook.
- 4–5 steps; fewer and bigger for hard topics.
- an upfront plan, restated at the end, with an explicit close.
- **every claim demonstrated with a command run on the user's machine.**
- spend a command on a user's wrong guess rather than correcting flat.
- mine the session's real findings for near-miss stories.
- answer digressions fully, then re-anchor.
- end with the small number of rules the tour produced — three worked well; more would not.
- **write it down afterwards.** both walkthroughs became `docs/research/` guides. the tour teaches;
  the doc is what survives the chat.
