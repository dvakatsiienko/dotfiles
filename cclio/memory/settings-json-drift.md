---
name: settings-json-drifts-when-unlinked
type: reference
---

`~/.claude/settings.json` is **not a static config** — Claude Code writes to it at runtime (plugin
enable/disable, `autoMode` learning, `skipDangerousModePermissionPrompt`). So the symlink into
dotfiles is the only thing keeping repo and live equal.

The divergence traced to commit `d03f3da` (the mirror-rule restructure), which placed a real file
where the link belonged. From that moment the repo copy froze while live kept being rewritten. It
surfaced only when the pre-push hook refused, months of drift later.

**Resolved:** repo copy set equal to live, then relinked. `permissions` blocks were byte-identical,
so nothing about permission behaviour changed — verify that programmatically before any future merge,
because Dima was once storm-hit by a permission change and is rightly wary.

**Watch:** if the symlink ever becomes a real file again, an app replaced it on write. Check
`ls -l ~/.claude/settings.json` at boot alongside `pnpm dotfiles-link` status. A real file there is
the early warning, not the push failure.

Related: [[memory-divergence-store]].
