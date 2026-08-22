# rollback — DOT-190 coordinator home

cclio lives at `~/dotfiles/cclio`, a plain directory inside the dotfiles repo. it is
NOT a nested git repo — dotfiles' git tracks every file here.

## the one-liner

```
cd ~/dotfiles && git rm -r cclio/ && git commit -m "revert: unfold cclio"
```

that is the whole rollback. nothing outside `cclio/` was created or deleted by the scaffold.

undoing the fold itself (the move into dotfiles) instead: `git revert <fold-sha>` in dotfiles.
either way the files leave; nothing else in the repo moves.

## what exists (all inside cclio/)

```
cclio/
├── CLAUDE.md                        coordinator memfile
├── README.md                        what/how/undo
├── ROLLBACK.md                      this file
├── memory/
│   └── MEMORY.md                    empty barrel index, format documented
├── docs/                            contracts + reports
├── plugin-cclio/                    the `cclio` plugin — source of the four rituals
│   ├── .claude-plugin/              marketplace.json + plugin.json
│   └── commands/                    init · report · flawlog · graceful-halt
└── .claude/
    ├── settings.json                registers plugin-cclio at project scope
    └── x-queue.md                   `/queue`'s store for this place
```

## what was touched outside cclio/

path references only, in files that pointed at the old standalone location: `docs/spec/ccli-coordinator-mvp.md`,
`docs/spec/ccli-coordinator-boot-prompt.md` and `docs/agents/claude-fleet-capabilities.md`. no
behaviour changed. (the `dpatch-refresh-cclio-sysprompt` skill was retargeted in the same pass,
then removed from `plugin-x` entirely — it runs on dispatch only and now lives on Dima's account
there.)

still untouched, as before:

- `~/.claude/CLAUDE.md` — NOT edited (owned by DOT-192)
- `~/projects/CLAUDE.md` — NOT created (owned by DOT-195)
- no shell rc, no PATH entry, no launchd, no symlink

## partial rollback

every file is in dotfiles' history:

```
cd ~/dotfiles && git log --oneline -- cclio/
cd ~/dotfiles && git checkout <sha> -- cclio/
```

## prior history

cclio began as a standalone repo at `~/cclio`, three commits, last one `e4274cb`. that repo is
retired; its files were carried across without graft. the shas above are dotfiles' shas.

## what this scaffold does NOT do

it does not switch dima's coordinator over. it is inert until he boots a cli session in
`~/dotfiles/cclio` and types `/cclio:init`. leaving the dir unused costs nothing.
