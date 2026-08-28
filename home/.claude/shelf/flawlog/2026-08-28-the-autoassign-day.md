# 2026-08-28 — the autoassign day

run id cclio-memory-bridge · fable-5

## 1. an inbox link dropped at the parse

**what broke.** the S1 mini inbox item carried a youtube url; the flowlog line kept the words
and lost the link. dima expected the transcript pulled; instead he had to point at the miss.

**why it slipped.** the parse copied the ask, not the payload — a url read as decoration around
the question. the parse is the completeness guarantee; a line without its link is data loss at
the exact step built to prevent it.

**fix in place:** transcript fetched, verdict given, flowlog line rewritten with the url.

## 2. «when we get there» read as a gate

**what broke.** the pm icon/colour pass parked as ⏸️ because dima's own note said «when we get
there». he expected it done — it was ten minutes of api calls.

**why it slipped.** his phrase named a *context*, not a blocker; i read a schedule into it.
the freebie test («how big is it?») was never asked.

**fix in place:** done same session, 12/12 projects.

## 3. `go --help` opened the repo

**what broke.** the new `go` shell function used `&& … || gh browse`; the toolchain exits 2 on
`--help`, so the browse branch fired too.

**why it slipped.** shell short-circuit read as if/else. classic, caught by dima in one try.

**fix in place:** proper `if (( $# ))`, commit `68146b1`.
