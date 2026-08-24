# settings-json drift

`~/.claude/settings.json` is **not static** — CC writes it at runtime (plugin toggles, `autoMode`
learning), so the symlink into dotfiles is the only thing keeping repo and live equal.

The drift traced to commit `d03f3da`, which placed a real file where the link belonged; the repo
copy froze while live kept moving, surfacing only at a pre-push refusal months later.

- **Watch:** a real file where the symlink belongs means an app replaced it on write —
  `boot-prefetch.sh` checks this every boot; a real file there is the early warning.
- ⚠️ **Before any future merge of this file, verify the `permissions` blocks byte-identical and
  say so** — Dima was once storm-hit by a permission change and is rightly wary.

Related: [[surface-boundaries]]
