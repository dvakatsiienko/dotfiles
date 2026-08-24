# CLAUDE.md: dotfiles

Hey.
Welcome to my repo with dotfiles. Here we improve the dotfiles by themselves, build other
interesting tools like `sline`, tweak configs, and — not least — tune and improve your own memory
and infra. Most of the internal tooling and the system overhaul (zsh, git, brew, and the rest)
cook here too. A mix.
Main environment is macOS, managed by symlinks.
This is where the agent system itself (currently Claude Code CLI) is developed (`home/.claude/`).

## the dotfiles

### the mirror rule

**A path under `home/` IS the path under `~`.** Everything symlinked into the home directory lives
at its literal relative path, so the link map is _derived by walking the tree_ rather than
hand-maintained. Anything imported by hand into an app instead of symlinked lives in `import/`.

A directory is linked wholesale **unless** the matching path in `~` is already a real directory
holding content this repo does not own (`~/.config`, `~/.claude`) — then it descends and links the
leaves. `noLink` in `lib/manifest.ts` names the few dirs stored here but referenced by absolute path.

📌 Two different `.claude` dirs exist here, and they are not the same thing: `home/.claude/` is the
global `~/.claude` config (the agent system, every session reads it); `.claude/` at repo root is
this project's own config. The global one nests under `home/` precisely so the two never collide.

### the link commands

```bash
pnpm dotfiles-link apply                  # link everything not linked yet
pnpm dotfiles-link register ~/.foo        # move a file into the mirror and link it back
pnpm dotfiles-link untrack ~/.gitconfig   # hand a file back to ~, drop it from the repo
```

`package.json` `scripts` is the full list — read it rather than a copy here.

## scripts

- **`lib/manifest.ts`** decides (walks `home/`, derives the expected link set), `dotfiles-link.ts`
  acts — status / apply / untrack, idempotent, refuses to clobber a real file. Never run the
  manifest directly.
- **`macos-setup.ts`** — `brew bundle` against the root `Brewfile`, the macOS defaults this repo
  owns, `duti` bindings, vim-plug. Packages live in the `Brewfile`, never in the script.
- **Scripts are `.ts`, run by node 24 directly** — no `tsx`, no build. `tsconfig.json` sets
  `erasableSyntaxOnly`, which bans any syntax needing real compilation. `pnpm typecheck` checks.
- Anything directly under `script/` is a runnable entrypoint with a matching `pnpm` script;
  `script/lib/` is library code, never invoked directly.
- Formatter and linter is **biome** (`pnpm check`). Git hooks run through **lefthook** — biome on
  staged files plus `pnpm typecheck` and `pnpm test` at commit, `dotfiles-link` at push. Nothing in
  a hook writes to your files.

## what lives in `home/.claude/` that `ls` does not explain

- **`plugin-x/`** — the personal plugin, registered as marketplace "x". `CST-SPEC.md` there is the
  single definition of the handoff format.
- **`mcp-x-cw/`** — local stdio MCP server giving `cw` handoff, transcript and pm tools against the
  shared shelf. Build: `pnpm mcp:build`.
- **`shelf/`** — everything we bake, symlinked wholesale into `~/.claude/`: handoffs,
  transcripts, flawlog, plus the `hooks/` settings.json points at and the `sounds/` they
  play. Colocate our produce here rather than scattering it across `~/.claude`.
- **`sline/`** — this repo's statusline. Its own `CLAUDE.md` loads when working under it.

## docs and tracker

- GitHub issues are retired; everything tracker-shaped lives in Linear per `rules/ticket-flow.md`.
- **Multi-context layout** — `CONTEXT-MAP.md` at root. Repo context: `CONTEXT.md` + `docs/adr/`
  (ADR-nnnn). Tracker context: `docs/tracker/CONTEXT.md` + `docs/tracker/adr/` (TRK-nnnn).
- **Research** — `docs/research/<subject>.md`, subject-first filename, never a ticket-id prefix, so
  a doc survives the ticket that prompted it. `Ticket: DOT-N` on its own line at the top when one
  owns it.

📌 **1Password is required** for SSH signing. Vim plugins need a manual `:PlugInstall` after setup.

## 💡 tips and tricks

<!-- contract: rules/tips-and-tricks.md. scope here: this repo + the modern stack (ts/react/next/tailwind/vite/genAI). -->

- 🔗 2026-08-24 — feared desktop git-sync would break symlinked plugin skills → it materializes them fine: a thin plugin of symlinks (plugin-x-cw) cherry-picks skills with zero copies
- 🔌 2026-08-24 — wanted MCP prompts as desktop slash commands → desktop never calls prompts/get (0 call sites vs 19 for tools), so it cannot work; claude code consumes prompts fine
