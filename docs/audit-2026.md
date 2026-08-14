# Setup audit — verdict map

Deliverable of DOT-20. Read-only pass over every script, config and root entry ahead of the restructure. One row per item: **keep** / **rewrite** / **delete**, plus the bugs found on the way.

Date: 2026-08-14. Machine: Darwin 25.5.0, arm64.

## `script/`

| File | LOC | Verdict | Rationale |
| --- | --- | --- | --- |
| `install-dotfiles.mjs` | 209 | **rewrite** | Hardcoded symlink map, duplicated per-scope backup/link plumbing. Becomes a tree walk over `home/` in DOT-21 |
| `list-symlinks.mjs` | 113 | **rewrite** | Second copy of the same map; `.dotfiles/source` hardcoded in the target check |
| `untrack-dotfile.mjs` | 125 | **rewrite** | Third copy, as an if/else path-guessing ladder (`.config/oh-my-zsh-custom` → `.config` → `.ssh` → root) |
| `install-macos.mjs` | 89 | **rewrite** | Formula list inline and badly drifted (DOT-22) |
| `skills-desk-sync.mjs` | 87 | **keep** | Newest and healthiest script here — `$.cwd` rooted, sha-stamped drift check, clean subcommands. Only path constants change |
| `lib.mjs` | 12 | **keep** | Six chalk shorthands. Absorbs shared fs/symlink helpers in DOT-21 |

### Bugs found in `script/`

1. ⚠️ **`functions-zoxide.zsh` is never symlinked by the installer.** `dotfile_list_omzsh` (`install-dotfiles.mjs:38`) lists only `aliases.zsh` and `functions.zsh`, but the source dir holds three files and `.zshrc:21` sources `$ZSH_CUSTOM/functions-zoxide.zsh`. The live symlink exists only because it was made by hand in Aug 2025 — **a fresh machine gets a broken shell**.
2. ⚠️ **`known_hosts` is phantom.** `list-symlinks.mjs:42` checks for it; nothing ever links it; it isn't in the repo. Permanent false "missing".
3. ⚠️ **The whole `~/.claude` symlink set is unmanaged.** `CLAUDE.md`, `settings.json`, `hooks/`, `commands/`, `themes/`, `sline`, `keybindings.json` are hand-linked — no script creates them, `list-symlinks` can't see them. DOT-21's mirror rule fixes this by construction.
4. ⚠️ **Target dirs are never created.** Only *backup* dirs get `mkdir -p`. On a fresh machine `~/.config/oh-my-zsh-custom` doesn't exist and `ln -s` fails. `starship_backup_dir` also never gets an explicit `create_backup_dir` call — it survives only because the omzsh `mkdir -p` happens to create its parent first. Order-dependent by accident.
5. 🔸 `untrack-dotfile.mjs:114` — `dotfiles_source_dir.replace('source', '')` rewrites the *first* match anywhere in the path. Breaks for any user whose home path contains "source".
6. 🔸 `untrack-dotfile.mjs:15` reads `process.argv[3]`, coupling the script to one specific zx invocation form.
7. 🔸 Errors are swallowed as green-path prose — `install-dotfiles.mjs:206` prints "symlink already exists" for *every* failure, and `install-macos.mjs:44` calls `zx.$\`exit 1\`` (spawns a shell that exits; the script keeps running).

## `source/` configs

| Item | Verdict | Notes |
| --- | --- | --- |
| `.zshenv` | **rewrite** | Two dead PATH lines (below); `TERM` forced |
| `.zshrc` | **rewrite** | Duplicate `fnm env`; oh-my-zsh removal (approved); appended LM Studio block |
| `.zprofile` | **keep** | Four lines, correct |
| `.gitconfig` | **keep** | `allowedSignersFile` already fixed under DOT-19 |
| `.vimrc` | **keep** | Untouched by the restructure |
| `.hushlogin` | **keep** | Empty by design |
| `.ssh/config`, `.ssh/allowed_signers` | **keep** | Cleared by the DOT-19 sweep |
| `.config/starship.toml` | **keep** | — |
| `.config/oh-my-zsh-custom/*.zsh` | **keep** | Content review is DOT-17's job, not this pass |
| `iTerm2/` | **move → `import/iterm2/`** | Its own `NOTE.md` said it must not be symlinked — iTerm loads prefs from a folder chosen in its preferences. It had been sitting on the wrong side of the symlinked/imported line. `NOTE.md` deleted: the `import/` directory name now carries that fact |

### Bugs found in `source/`

1. ⚠️ **Unexpanded tildes = dead PATH entries.** `.zshenv:81` `export PATH="$PATH:~/.lmstudio/bin"` and `.zshenv:84` `export PATH="~/.local/bin:$PATH"` — a `~` inside double quotes is literal, so both append a directory that doesn't exist. Line 85 does `.local/bin` correctly with `$HOME`, and `.zshrc:24` does the LM Studio path correctly with an absolute path. **Both broken lines are pure dead weight — delete.**
2. 🔸 `.zshrc:13-14` — `eval "\`fnm env\`"` immediately followed by `eval "$(fnm env --use-on-cd …)"`. The first is redundant; drop it.
3. 🔸 `.zshenv:50` — `export TERM=xterm-256color` overrides what the terminal advertises. Warp and iTerm both set a better `TERM` themselves; forcing this can cost truecolor.
4. ⚠️ **oh-my-zsh is dead weight — approved for removal.** `plugins=()` is empty, yet `oh-my-zsh.sh` is still sourced on every interactive shell. The only thing leaning on it is `$ZSH_CUSTOM`, a variable this repo defines itself (`.zshenv:13`) and could point anywhere. Removing it means: drop `source $ZSH/oh-my-zsh.sh`, drop the three `ZSH*` exports, source the custom `.zsh` files directly, and confirm nothing in `aliases.zsh`/`functions.zsh` uses an omz helper. Tracked in DOT-17.

## Root entries

| Entry | Verdict | Rationale |
| --- | --- | --- |
| `.clauderc/` | **move → `home/.claude/`** | 3.0M, the repo's second purpose. DOT-21 |
| `source/` | **rename → `home/`** | DOT-21 |
| `themes/` | **move → `import/`** | Name collided with `.clauderc/themes` (CC themes). Split by mechanism: these are hand-imported (`terminal/`, `vscode/`, `warp/`) |
| `raycast/` | **move → `import/raycast/`** | Same mechanism as iTerm2: an app pointed at a folder, not a symlink — so it belongs on the imported side of the line. Content untouched (still the live keyboard-layout switcher); Raycast's script directory needs re-pointing by hand |
| `docs/` | **keep** | — |
| `libsources.db` | **delete** | 0 bytes, untracked, already matched by `*.db` in `.gitignore` |
| `.conductor/settings.local.toml` | **untrack** | Machine-local tool config, tracked in a public repo. No secrets (DOT-19), but it doesn't belong in git |
| `.dotfiles.code-workspace` | **keep, adjust** | Second folder is `../.claude`; still correct after the move, but worth re-pointing at the repo's own `home/.claude` once that exists |
| `.editorconfig` | **keep** | — |
| `prettier.config.mjs` + `prettier` + `prettier-config-polished` | **keep** | Not redundant after all — Dima formats file types biome doesn't cover (biome has no formatter for markdown/yaml). The two are complementary, not duplicated. Worth adding a `format` script so the prettier half stops being invisible |
| `biome.jsonc` | **keep, fix** | `vcs.defaultBranch` is `"master"` — this repo is `main`. VCS-aware filtering is comparing against a branch that doesn't exist |
| `package.json` | **keep** | Deps are current (`zx` 8.8.5, biome 2.5.5) |
| `.DS_Store` | **delete + gitignore** | Present at root; `.gitignore` has `.DS_STORE` in the wrong case — HFS is case-insensitive but git's matching is not |

## Doc drift

`CLAUDE.md` states **Node >=18.12.0, pnpm >=8.5.0**. `package.json` actually requires **node >=22.17.0, pnpm >=10.14.0**. It also documents a `script/` and `source/` layout that DOT-21 replaces wholesale, and a `home/.claude/commands/` directory that is now empty. Docs get corrected inside the commits that move things, per the DoD on DOT-21/DOT-22.

## Summary

- **keep**: 9 · **rewrite**: 6 · **move/rename**: 4 · **delete**: 3
- **11 bugs** found. Four are user-visible breakage (fresh-machine shell, unmanaged `~/.claude` links, two dead PATH lines); the rest are latent or cosmetic.
- The single worst finding is #1 under `script/`: **the installer has never been able to reproduce this machine.** `functions-zoxide.zsh` proves the map and the source tree drifted apart and nobody noticed, because nobody re-runs the installer. The mirror rule in DOT-21 removes the class of bug, not just this instance.
