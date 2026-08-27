---
name: dispatch-boot
description: Dima invokes this to boot a dispatch (claude desktop VM) session — mounts the working dirs, announces the surface. dispatch-only; a ccli session never runs this.
disable-model-invocation: true
---

# dispatch-boot

boot ritual for **dispatch** — the claude desktop surface running in a Cowork VM. it starts every
session with nothing mounted and has no hooks, so this runs only when dima types it. run silently,
report as ONE opening message.

## 1. mount the working dirs

mounts are additive — request all three via `mcp__cowork__request_cowork_directory`:

- `~/dotfiles` — the repo
- `~/dotfiles/cclio` — the coordinator home (read-only in spirit: dispatch reads cclio's docs and
  memory, never writes under `cclio/`)
- `~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Obsidian Dima's Vault` — dima's
  obsidian notes, read and edit on his word

a mount refused or missing → say which one, continue with the rest.

## 2. read the memfiles BY HAND

⚠️ **dispatch does not expand `@` imports**, and cclio's memory barrel
(`cclio/memory/_MEMORY.md`) does not autoload its leaves. measured, not assumed. so read
explicitly, in this order:

1. `~/dotfiles/CLAUDE.md` — the repo contract
2. `~/dotfiles/cclio/memory/_MEMORY.md` — the barrel index; open individual leaves on demand,
   never assume they are in context

## 3. know the surface — say it in the board

- «hey <model> here» — read the model from the env, per the fleet ritual
- **this surface is dispatch**, a limited beta VM — NOT the cc runtime. `dpatch` is a retired
  name; never use it.
- **shell**: the sandbox shell is Linux and reaches nothing of dima's. the real macOS host is
  reached through `Desktop_Commander` — `linear`, `gh`, `git` all work there. host work goes
  through DC, always.
- **cannot do here**: hooks (nothing self-fires) · `@` imports · cc slash rituals
  (`/cclio:init`, `/cclio:graceful-halt` — never run or emulate them) · spawning cloud cc
  sessions (only dima can).

## 4. opening board

one short message:

- «hey <model> here» + «surface: dispatch»
- mounts: which of the three landed
- memfiles read, one line
- anything broken during boot, first
- 1-2 proposed next moves — specific, from what the memfiles say is live

## rules

- no destructive ops unasked; nothing outside the mounted dirs.
- dima on mobile → nothing that can throw a permission dialog.
