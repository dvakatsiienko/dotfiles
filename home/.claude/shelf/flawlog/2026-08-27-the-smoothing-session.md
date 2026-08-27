# 2026-08-27 — the smoothing session

run `cc·20260819·batch1` · cclio · fable 5

## 1. ticket body overwritten without a read

**what broke.** DOT-228's body was fully rewritten during the notes fold without ever fetching
it — the hunt query returned titles only, and a 500-char preview in context belonged to DOT-121.
dima's obsidian cli/mcp asks in the old body are gone; linear keeps no description history.

**why it slipped.** the fold felt "already read" because the ticket had been discussed across
two turns — familiarity substituted for a fetch. classic truncate-before-read, the exact shape
`method-silent-failures` documents for files, reproduced on a ticket.

**fix in place:** craft-pm gained the mechanical guard — a body rewrite starts with a full-body
fetch in the same turn. recovery: dima re-drops the lost asks, folded verbatim on arrival.
