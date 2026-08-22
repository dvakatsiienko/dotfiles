# flawlog — 2026-08-21 · run cclio·20260821·boot1

first cclio boot from `~/dotfiles/cclio`.

## reference point
- boot context cost: **67.9k / 1m (7%)** at `/context`, opus 5.
  breakdown: memory files 27.5k (2.7%) · system tools 21.5k · system prompt 12.3k ·
  skills 6.4k · mcp deferred 7.7k.
- 📌 dima's note: "mems have lots of good stuff. but lots is the emphasis." memory layer is
  the single biggest slice — 11 always-loaded memfiles. candidate for a diet pass.

## flaws

- **`~/projects/CLAUDE.md` does not exist yet** — confirmed at boot, isolation intact. the
  relocation deadline is real but not yet breached.
- **wrote a measured number into a commit body without measuring it.** `85d21ef` claims
  "15053 → 13830 chars"; the real figure is **14249**. I predicted the saving from the drop list
  instead of running `wc -c` after the edit, which is the same failure the identity charter names
  ("verified or labelled"). the commit is unpushed but not amendable under the no-amend rule, so
  the wrong number stands in history. cost: one false figure in the log, and a corrected one only
  here. lesson: a number in a commit body is a claim — measure it in the same command that writes it.
- **read absence of a listing as absence of the thing.** told dima "`computer-use` is gone, not
  dormant" because it was missing from `~/.claude.json` and from `claude mcp list`. it is installed
  and disabled — and a disabled server is invisible, which is the exact fact under discussion.
  i had the evidence that explained the absence and still read the absence as deletion.
  cost: one false statement about his own machine, caught by him. lesson: before concluding a thing
  is gone, ask what its expected footprint would be if it were present-but-off.

## flush — the repeating class

three flaws today, and they are one flaw. same class runs back through the archive:

| date | the claim | how it was reached |
| --- | --- | --- |
| 2026-08-19 | mcp prompts give slash+autocomplete on cwrk | assumed the client supports the spec |
| 2026-08-19c | a subagent's verdict on skill-sync | relayed without review |
| 2026-08-21 | "15053 → 13830 chars" | predicted from a drop list, never measured |
| 2026-08-21 | "computer-use is gone" | inferred from absence of a listing |

**the class: a claim reached by inference, reported in the voice of a measurement.**

📌 the rule against it already exists — identity tenet 2, «verified or labelled». it is not
missing, it is not being *triggered*. in all four cases the inference felt like knowledge, so no
verification step suggested itself. a fifth rule saying the same thing will not fire either.

what would actually fire: a **shape** test, not a values test. before any factual claim in a
reply or a commit body, ask «what one command would prove this?» — if a command exists, run it;
if none exists, the claim is an inference and must be labelled as one. the trigger is cheap
because it needs no judgment about importance.

decision owed to dima: fold this into identity tenet 2 as the *how*, or leave it in the log.

## memory hot spots — 2026-08-21, after adopting dpatch's 50 leaves

fixed in place this turn, not logged as open: 4 dead leaves deleted (`dpatch-can-mount-dirs`,
`dispatch-detailed-view-trick`, `dispatch-format-unset`, `wrap-protocol`) and 3 rewritten in
cclio's terms (`spawn-types`, `skill-edits-are-file-edits`, `skill-namespaces`). originals all
survive untouched in the `memory-dispatch` submodule — nothing destroyed.

what could NOT be closed on the spot:

- **9 PM leaves are fleet-wide, not dpatch's** — `links-always-https`, `no-timestamps-in-prose`,
  `native-relations-always`, `linear-fetch-contract`, `pm-scrape-strategy`, `tickets-must-be-pretty`,
  `pm-label-proactively`, `ticket-heavy-replies-need-structure`, `no-glyph-runon-cta`. they sat in
  dpatch's private brain, so no `cc` session on this mac ever saw them, while `rules/ticket-flow.md`
  and `x:pm` cover overlapping ground in different words. · cost: every ccli session has been
  running without PM rules dima considers settled. · lesson: a memory in one surface's private store
  is a rule the fleet does not have. needs DOT-73 step 3 (colocation), not a unilateral move.
- **the barrel is now ~2.9k tokens on read** (8272 chars, 46 pointers). not resident — cclio reads
  it at boot by ritual, not by auto-load — but it is the single biggest deliberate read in the boot
  path. · lesson: watch it; the index-plus-leaf design only pays while the index stays cheap.
- **⏰ `skill-naming-pattern` carried a live reminder that died with it**: "snapshot-sync memory →
  memory-dispatch at every wrap until DOT-115". that sync was dpatch's obligation, not cclio's, and
  DOT-115 is still open. · cost: none yet. · lesson: dropping a leaf can drop a reminder nobody
  re-homed — check for ⏰ before deleting.

## good finds
- **the barrel header now states provenance per leaf.** an unreviewed leaf reads as dpatch's fact,
  not cclio's rule. cheap, and it makes a half-migrated store honest instead of misleading.
- **`research-vs-lived-evidence`** — dima's daily observation outranks a report; never relay a
  subagent verdict unreviewed. the same class as today's tenet-2 sharpening, found independently
  by dpatch. two surfaces converging on one lesson is the strongest signal we have.
