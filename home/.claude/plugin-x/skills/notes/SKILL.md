---
name: notes
description: Load BEFORE any read or edit of an obsidian vault note (inbox, flowlog, the vault) or a notion page — «edit the note», «append to inbox», «rename the note», «update the notion page», a vault path, a notion url.
---

# notes — the channel per op, measured

one suite, six lanes, 2026-09-10 (`docs/research/bench/notes-stack/results-2026-09-10.md`). the
pick per op is the cheapest lane that does not break the vault; nothing here is a preference.

## obsidian

- **read · append · property edit → raw files.** `cat`, `>>`, a frontmatter edit in place. 2–5 ms
  per note, payload only, nothing to time out. the vault lives at
  `~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Obsidian Dima's Vault/`.
- **rename · move → the `obsidian` cli, only.** `obsidian vault="Obsidian Dima's Vault" rename
  path="<dir>/<note>.md" name="<new name>"` rewrites every wikilink through the running app
  (231/231 in 0.4 s); a plain `mv` breaks every one. needs the app open.
- **link graph → the cli**: `backlinks` · `unresolved` · `orphans` · `deadends` · `search
  query="…" format=json` (off obsidian's index, 24 ms, half the bytes of a grep).
- 🚨 **drive the cli with `timeout 15 … </dev/null`, and judge a rename by the file landing**
  (`until [ -f "<new path>" ]`), never by the process returning — it hung on a read and on a rename
  that had already finished. an open stdin in a script makes it eat the loop.
- `property:set` reformats the whole frontmatter (inline lists → yaml lists). fine, diff-noisy.
- 🚫 the `Local REST API` plugin / any obsidian mcp: 5× the cli, no rename endpoint. not installed.
- 🚫 icloud sync is whole-file, last-writer-wins: never write while a mobile device may hold a
  stale copy; re-read right before every write (`rules/fleet-hazards.md`, the vault).

## notion

- **a page → `ntn`** (`brew "notion-cli"`, token in `~/.zshenv.local`): `ntn pages get <id>`
  returns markdown (~170 bytes a page); `ntn pages create --parent page:<id> --content '# title …'`;
  append = `ntn api /v1/pages/<id>/markdown -X PATCH --notion-version 2026-03-11 -d
  '{"type":"insert_content","insert_content":{"content":"\n…\n","position":{"type":"end"}}}'`.
- **a batch → `xargs -P4`** over `ntn`, or the raw api at concurrency 4. gains stop at 4; at 8 notion
  throttles and drops results. every call `</dev/null` — `ntn api` hangs on an open stdin.
- `ntn api` needs `-X PATCH|POST` and a bare `/v1/…` path; `ntn pages trash` needs `--yes`
  non-interactively; writes echo the whole page — `| jq -r .id` to keep the reply small.
- 🚫 the notion connector (hosted mcp) for edits: one appended paragraph cost 23 s, 5 tool calls
  and 1 % of a 5-hour window; `ntn` did it in 0.7 s and 271 bytes. it is disconnected.

## cw

cw has no cheap door. the connector cost 1 % of a 5-hour window and 23 s for one appended
paragraph; `ntn` through Desktop Commander's shell cost the same 1 % (9 `start_process` calls, three
lost to the blocking wrapper's timeouts). the process wrapper is the price, not the api. so on cw:
reads through the connector are fine, an edit is one paragraph at a time either way, and a batch
belongs to cc on the mac — hand it over. a chat thread on mobile has no shell at all.
