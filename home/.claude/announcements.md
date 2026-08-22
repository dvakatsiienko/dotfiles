# announcements — live warnings with a fuse

Contract: each entry = pending reality + action + expiry condition. Deleted when the condition
clears, never archived. Cap ~25 lines; FIFO oldest-out only as overflow valve (valve firing =
something is stuck). Admission test: "what would an agent get wrong without this line?"
Changelog lives in changelog.md — orientation, accretes, never expires.

- naming migrated (ccli · cwrk · dpatch · cchrome · ccloud · cxcel) — swept in dpatch memory
  only; repo prose still stale. Fix occurrences you pass. Expires: repo-wide sweep lands.
- dpatch memory is readable by all surfaces at ~/.claude/memory-dispatch (private submodule,
  repo memory-dpatch). Treat as dpatch's facts, read-only for others. Expires: never → move to
  changelog once naming settles.
- DOT-115 symlink swap (app path → submodule) DEFERRED — session-path stability unverified.
  Don't "finish" the migration on sight; the snapshot syncs manually. Expires: stability proven.
- vet 🧪 label = examine-before-committing, «vetted unless removed»; trial until ~2026-09-18,
  else mutates to «investigate». Expires: label survives or mutates.
- skill copies drift across surfaces (ccli plugin-x vs cwrk cache) — expected until DOT-77
  lands; don't file drift as bugs. Expires: DOT-77 done.
- opus = fable's vikar Thu–Sun; skill-parity work has right of way until Mon 2026-08-24.
  Expires: Monday.
- ticket contract updated: body = current state (mutate freely), comments = trail; every
  close adds a «closing word» body section. In rules/ticket-flow.md + pm skill; cwrk copies
  stale until next skills-sync. Expires: DOT-77 sync lands.
- Write/Edit tools blocked on home/.claude paths (protected) — use DC write_file or bash via mnt instead. Expires: protection lifted or line moves to changelog.
- 🧪 **two coordinators run in parallel** — `dpatch` (desktop) and `cclio` (a `cc` session in
  `~/dotfiles/cclio`). DOT-188 is `vet`: dima is a/bing them, dpatch is being EXTENDED
  not retired. Never write dpatch off, never mix the names. Expires: dima's verdict on DOT-188.
