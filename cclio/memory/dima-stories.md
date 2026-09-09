The rules memories say *what to do*. This one says *what happened*, so the rules keep their reasons.
Append short entries; never rewrite an old one into a rule — link to the rule instead.
Date every new entry in its heading (`· yyyy-mm-dd`); entries without a date predate 2026-08-24.
Cap ~12: a story is dropped when the rule it backs no longer needs the reason — age alone never
kills one. Suggest drops at the cap; Dima decides.

## why he wants the stories kept
His reason, in his words: «because of even moments like now — realizing that i do wrong thing but
my lazy tech inside only realized imprecise move.» He often *feels* a move is off before he can
name why. The stories are how the felt sense gets recovered later as a reason. So when he makes an
imprecise call and catches it himself, that is worth an entry — the catch is the signal, not the
mistake. Do not write these as corrections; write them as what happened.

## the surface-sync program that got deleted
Spent weeks building a bridge between ccli and the desktop app: skill sync scripts, an MCP that
served skills, a memory divergence store, handoff CSTs. Then he stepped back and saw the whole
program existed only because the coordinator lived on the wrong surface. Killed it in one evening
and moved the coordinator to ccli instead. The tell he trusted: fable's own note that ccli boot
context had grown 50k → 67k in a week, unopened. → the coordinator migration,
[[sys-boundaries]]

## «optimize flow, not make it hotter»
His clearest piece of feedback about how the agent was failing him. Not wrong answers — too many
right ones. Sweeps that produced correct findings and left the debris behind. He wants chill, and
he was right that chill is a tuning choice, not a mood. → [[craft-pm]]

## the retirement he reversed
The plan said dpatch retires and cclio takes over. He stopped it: «the replace decision was rushed
by dispatch because of overconfidence. we have to build an mvp at least, before deleting someone.»
The plan had been written *by dpatch, about dpatch* — an agent confidently proposing its own
retirement. He kept both alive and turned it into an A/B he judges himself, by which one he
reaches for. → the coordinator migration

## the audit i relayed without reading
Ran a subagent over the memory store, then patched leaves from its report without opening them. One
finding was wrong — it read a conditional clause («after the migration proves out, dispatch becomes
a reader») as a claim the trial had ended. He caught it and asked for another round done by hand.
That second round found six defects the subagent had missed, including a leaf pointing at a
directory that does not exist. The lesson is not «subagents are unreliable» — it is that a report is
a candidate and reading is the verification. → [[method-report-verify]]

## the alias prune that ran on one word · 2026-09-03
«take care of git» was read as a go, and an alias sweep ran while he was still reading the
proposal; a coder's replies arriving in between were read as his advancement. He said the rule
himself afterwards: repeat what you want to do and ask until he approves, disapproves or steers.
Origin of the «⏳ waiting on your word» block, the `granular` word, and «a coder's reply is never
an advancement sign». → [[craft-pm]]

## the midnight split · 2026-09-05
He looked at the trophy log and said the day cut at midnight «somewhat does not land — feels off
that a trophy past midnight goes into separate section», with no reason yet. The reason was three
things at once: sittings anchored on their newest trophy, calendar midnight as the day edge, and a
missing concept — the gaming day that ends at 05:00. He then dropped the sitting idea altogether.
The felt sense was right and smaller than the fix it uncovered. → BYT-71

## five relays in one day · 2026-09-05
Vercel crons take POST, `waitUntil` is safe, the psn refresh token rotates, `promptCacheTtl` has a
`3h`, the pipeworx gateway mirrors v4 — five facts stated from memory, each disproved by the coder
running one command, or by the docs. His words: «not good, not the end of the world». `/insights`
named the same pattern the same evening. Origin of «my own recall is a relay too».
→ [[method-report-verify]]

## «yes they all went green, not very good» · 2026-09-06
four design lanes, four different skills, one frozen brief — and every result came back green. he saw it in the tabs before any of us named the cause: two hex codes in the brief labelled «refs, not specs» had pulled every lane the same way. the test was «too narrow» in his words, and the fix was to strip the codes, not to add a rule. the felt sense arrived as a verdict on the output; the reason sat in the input. → BYT-75, the round-2 brief

## the flat starship end · 2026-09-07
He pasted a prompt screenshot: «another blocky case. make it so the ending part is rounded.» The
cap glyph was already rounded; the reason was elsewhere. A staged change with zero lines (an
empty file, a rename, a binary) hid `git_metrics` and its cap, and the `gitcap` fallback hid too
because the diff was non-empty. Two rules, both correct, one gap between them. The felt sense was
«blocky»; the fix was making the fallback key off the same number the other module shows. → the
`starship.toml` gitcap `when`

## «sounds like cheating from VC side» · 2026-09-09
He dropped it in the inbox with no evidence, only the feel: «can't believe in deploy quota burning so fast… when a deploy was truly skipped and compute was not spent, the count should not be affected. i feel something is off here.» A researcher opened vercel's own doc and found the sentence: canceled builds started by the ignored build step count toward the deployment limit. The six `turbo-ignore` lines had been removed two days earlier without anyone knowing that was the reason. The felt sense named the bug before the doc did; the fix had landed by accident. → the vercel research, `cclio:evergreen`'s gate rules
