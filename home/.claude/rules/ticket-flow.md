# Ticket flow

Always loaded, sibling to `voice.md` and `text-formatting.md`. Those two govern how you talk;
this one governs how you keep the tracker honest **while you work**.

The split is deliberate. The `x:pm` skill is the PM handbook — field contracts, priorities,
projects, quota, CLI mechanics — and it is only loaded when ticket work is the task. But tickets
get touched in the middle of doing something else, with `pm` nowhere in context. Everything here
is what must hold in that case. Anything past it: load `x:pm`.

⚠️ **`cw` cannot read this file.** It has no `rules/` mechanism — one skill, uploaded as a zip,
and no always-loaded layer. So anything moved here becomes unreachable on that side, and a `cc`
skill that defers to this file is, from `cw`'s view, a skill that lost a rule.

The obligation runs one way and must be honoured by hand: **whatever `plugin-x/skills/<x>` defers
to this file, `skills-cw/<x>` inlines.** Duplication is correct here — two runtimes, no shared
loader — and pretending otherwise is what silently degraded `cw` on 2026-08-16. `.source-sha`
cannot catch it: it detects that a source moved, never what should have been carried across.
Problem recorded on DOT-62; no mechanism yet.

## Where tickets live

- **Linear**, workspace `x-com`. Two teams: **`DOT`** = tooling, approaches, how-we-work.
  **`BYT`** = building apps. Split by the nature of the work, never by which repo the files sit in.
- Channel is the **`linear` CLI** (`cc`: Bash · `cw`: Desktop Commander). **Never the Linear MCP.**
  `linear api '<graphql>'` is the fallback for anything the CLI lacks.

## State tracks reality — the rule that gets forgotten

**The moment work on a ticket actually starts, move it to In Progress.** Same turn, not
retroactively, not when the commit lands. `linear issue update DOT-N --state "In Progress"`
(`linear issue start` needs a default team and usually fails here).

📌 Why this is yours and cannot be automated away: **no magic word reaches In Progress.** Commit
keywords only reach Done. And the default lane here is commit straight to `main` with no PR, so
the PR automations that would fire `start → In Progress` never run at all. If you do not move it,
nothing does.

The same applies at the other end — a ticket whose work is finished does not sit in In Progress
waiting for someone to notice.

## The focus pin — sline's ambient indicator

Sline renders the session's pinned ticket from `~/.claude/focus/<session_id>.json`. Two slots:
`pin` (the ticket we agreed to resolve — sticky, rendered `🪄 DOT-23`) and `touch` (up to the last
3 ids we poked, newest first, each rendered dim after a `·`). An id lives in **exactly one** slot;
the hook moves it between them rather than duplicating.

Dima's keywords, handled by `hooks/focus.sh`: `clam <id>` pins (aliases: `claim`, `pin`),
`touch <id>` touches, `ticket fly <id>` unsets that id, `tickets fly` clears both. The hook only
fires on a keyword that **starts a line** and carries its argument — bare ids never write anything.

Moving the pin when *work* moves is yours; a hook cannot see a decision:

- **We start resolving a ticket** → write `pin` + `pin_at` (epoch seconds), same turn, never later.
  Id only — sline renders no title. Move the ticket to **In Progress** in the same turn: the pin
  and the board state describe the same fact and must never disagree.
- **We close or drop it** → clear `pin` + `pin_at` in the same turn, without being asked. A pin
  outliving its ticket is worse than no pin. Closing includes the case where a `Closes DOT-N`
  commit does the closing — the pin is yours to clear either way. Leave `touch` alone.
- Merely *reading* a ticket never moves the pin. Only committing to work on it does.
- Print `🪄 clam DOT-N` in the reply as the receipt, so Dima sees the pin changed without hunting
  for it in sline.

Sline also renders each id's Linear state, cached by the same hook (`status-cache.json`). It only
ever reads that cache — never fetch Linear from the render path.

## Ids are never invented

An id comes from Dima, from the conversation, or from the branch name. **Nowhere else.** Never
guess one, never grep for a plausible match, never write `DOT-?`. Most commits have no ticket, and
omitting the line is always correct.

Commit magic words (`ref DOT-N` to link, `Closes DOT-N` to finish) are defined in the `x:cmt`
skill, which loads on every commit. One thing holds even without it: **a closing keyword resolves
the ticket and assigns it to the commit author**, so name the ticket you are about to close in
your reply rather than closing it silently.

## Rendering an id back to Dima

Always a link plus a short tldr, never a bare id — format lives in `text-formatting.md`.
