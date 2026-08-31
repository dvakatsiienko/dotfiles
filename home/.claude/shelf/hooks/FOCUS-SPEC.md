# FOCUS-SPEC — the focus/status seam

Single definition of the two files under `~/.claude/focus/`, cited by every side that touches
them: `sline-focus.sh` and `sline-status-fetch.sh` here, `focus.go` and `status.go` in sline, and
the pin step in the `pm` skill. Edit here, never fork the text.

**The shape of the seam: hooks write, sline reads.** sline never writes either file, and neither
script ever renders anything. That split is why a slow Linear call cannot slow a redraw, and it is
the one rule that must survive any change below.

## The focus file — `~/.claude/focus/<session-id>.json`

Per session, so parallel sessions never fight over one slot.

```json
{ "pin": "DOT-233", "pin_at": 1756654800 }
```

- **`pin`** — one ticket id, `^(DOT|BYT)-[0-9]+$`, uppercase. One slot, never a list: a write is a
  replace, so there is nothing to merge. `{}` means no pin.
- **`pin_at`** — unix seconds, when the pin was last written. Absent or `0` means unknown age.

The id shape is also the injection guard: `sline-status-fetch.sh` interpolates the id into a
GraphQL query, and the regex above is what makes that safe.

### Writers — one implementation

`shelf/hooks/sline-focus.sh`, and nothing else. It takes a `UserPromptSubmit` payload on stdin
(`.session_id`, `.prompt`) and writes the slot.

- **Dima** types `claim DOT-23` / `pin DOT-23` on a line of its own, or `tickets fly` to clear it.
  The keyword must start the line and be the whole line, so ordinary prose stays inert.
- **An agent** pinning the ticket it just started calls the same script with a synthesised payload
  rather than writing the file itself — see the `pm` skill. Two writers of one format is how the
  format rots; the script is also what kicks off the status fetch, which a raw write skips.

### Readers

- `sline/focus.go` — renders `🪄 DOT-N`, dims the id past `pinStaleAfter`.
- `sline-status-fetch.sh` — reads `.pin` to know which id to fetch.

## The status cache — `~/.claude/focus/status-cache.json`

One file, shared by every session, keyed by ticket id. Not per session: two sessions on the same
ticket should not each pay for the fetch.

```json
{ "DOT-233": { "status": "In Progress", "type": "started", "at": 1756654800 } }
```

- **`status`** — Linear's own state name, renameable by Dima at any time.
- **`type`** — Linear's stable enum (`unstarted`/`started`/`completed`/`canceled`), the fallback
  when a renamed state is not in sline's colour map.
- **`at`** — unix seconds, when this entry was fetched.

### Writer

`shelf/hooks/sline-status-fetch.sh`, and nothing else. Two callers, one implementation:
`sline-focus.sh` runs it after a prompt writes the focus file, and sline fires it detached on
render. Neither waits — a Linear call costs ~325ms.

**Merge, never replace.** Each session knows only its own id; a replacing write would have
parallel sessions wiping each other's entries.

### Reader

`sline/status.go` — renders the badge beside the pin.

## The four durations, and what each one is for

Two are about spending a request, two are about telling the truth on screen. They are deliberately
different numbers.

- **fetch TTL — 60s.** `ttl` in `sline-status-fetch.sh`. Do not hit the network again for this id
  inside a minute. The script is the authority; it re-checks before spending a request.
- **fetch TTL, sline's copy — 60s.** `statusFetchTTL` in `status.go`. Exists only so sline does not
  spawn a process on every render to be told "not yet". Must track the number above; the script
  still decides.
- **status honesty — 10m.** `statusStaleAfter` in `status.go`. Past this the badge drops its colour
  and gains a `?`. Longer than the fetch TTL on purpose: between the two, a status is merely
  un-refreshed, which is the normal state of an idle session.
- **pin honesty — 8h.** `pinStaleAfter` in `focus.go`. Past this the id dims. A pin nobody
  refreshed all day must look forgotten rather than quietly assert a ticket we left.

## Retention — two policies, deliberately not unified

They govern different objects, so one number would be wrong for one of them.

- **Focus files age out at 7 days** (`find -mtime +7` in `sline-focus.sh`). These are whole files,
  one per session id, and sessions are minted constantly — without a sweep the directory grows
  forever. A week is long enough that a paused session resumed after a weekend still finds its pin.
- **Cache entries age out at 24 hours** (the `86400` filter in `sline-status-fetch.sh`). These are
  entries inside one shared file, and a ticket nobody has pinned for a day is not worth carrying.
  Dropping an entry costs one refetch; dropping a focus file loses state nothing else holds.

📌 The 7-day sweep matches `*.json` in the same directory the shared cache lives in, so it excludes
`status-cache.json` by name. Without that guard a quiet week would delete the cache every session
shares — a per-session rule reaching a file that is not per session.
