# dotfiles

Personal macOS environment, managed by symlink. Also where the agent system itself is developed
(`home/.claude/`).

## the mirror rule

**A path under `home/` IS the path under `~`.** Everything symlinked into the home directory lives
at its literal relative path, so the link map is *derived by walking the tree* rather than
hand-maintained. Anything imported by hand into an app instead of symlinked lives in `import/`.

A directory is linked wholesale **unless** the matching path in `~` is already a real directory
holding content this repo does not own (`~/.config`, `~/.claude`) — then it descends and links the
leaves. `noLink` in `lib/manifest.ts` names the few dirs stored here but referenced by absolute path.

📌 `home/.claude/` (global config) and `.claude/` (this project's config) are deliberately distinct.
That collision is exactly why the global config is nested under `home/`.

🚫 **Never edit `~/.claude/…` directly** — edit `home/.claude/…` and the symlink carries it.

## the two commands with non-obvious grammar

```bash
pnpm dotfiles-link apply                  # link everything not linked yet
pnpm dotfiles-link untrack ~/.gitconfig   # hand a file back to ~, drop it from the repo
```

Registering a new dotfile is a **move, not a command**: `mv ~/.foo home/.foo && pnpm dotfiles-link apply`.

`package.json` `scripts` is the full list — read it rather than a copy here.

## how the scripts work

- **`lib/manifest.ts`** — the engine. Walks `home/`, derives the expected link set. Never run
  directly; it decides, `dotfiles-link.ts` acts.
- **`dotfiles-link.ts`** — status / apply / untrack. Idempotent, and it **refuses to clobber a real
  file** rather than moving it into a backup nobody reads.
- **`macos-setup.ts`** — `brew bundle` against the root `Brewfile`, the macOS defaults this repo
  owns, `duti` file-type bindings, vim-plug. Packages live in the `Brewfile`, never in the script.

## typescript here has no build step

**Scripts are `.ts`, run by node directly** — node 24 strips types natively, so there is no `tsx`
and no compile. `tsconfig.json` sets `erasableSyntaxOnly`, which **bans any syntax needing real
compilation**. `pnpm typecheck` is the checker.

**Layout:** anything directly under `script/` is a runnable entrypoint with a matching `pnpm`
script; anything under `script/lib/` is a library and is never invoked directly.

Formatter and linter is **biome** (`pnpm check`). Git hooks run through **lefthook** — biome on
staged files plus `pnpm typecheck` and `pnpm test` at commit, `dotfiles-link` at push. Nothing in a
hook writes to your files.

## what lives in `home/.claude/` that `ls` does not explain

- **`plugin-x/`** — the personal plugin, registered as marketplace "x". `CST-SPEC.md` there is the
  single definition of the handoff format.
- **`mcp-x-cw/`** — local stdio MCP server giving `cw` handoff, transcript and pm tools against the
  shared shelf. Build: `pnpm mcp:build`.
- **`skills-cw/`** — hand-adapted `cw` copies, shipped as zips uploaded by hand. Not `cc`-loadable;
  drift is expected.
- **`shelf/`** — durable artifacts (handoffs, transcripts, flawlog), symlinked into `~/.claude/`.
- **`sline/`** — this repo's statusline. Its own `CLAUDE.md` loads when working under it.

## docs and tracker

- Issues live in **Linear**, workspace `x-com`, teams `DOT` / `BYT`, via the `linear` CLI.
  🚫 Never the Linear MCP. GitHub issues are retired.
- **Multi-context layout** — `CONTEXT-MAP.md` at root. Repo context: `CONTEXT.md` + `docs/adr/`
  (ADR-nnnn). Tracker context: `docs/tracker/CONTEXT.md` + `docs/tracker/adr/` (TRK-nnnn).
- **Authoring guides** — `docs/agents/authoring-memory.md` and `authoring-skill.md` carry the
  harness mechanics; matt's `writing-for-agents` carries the craft.
- **Research** — `docs/research/<subject>.md`, subject-first filename, never a ticket-id prefix, so
  a doc survives the ticket that prompted it. `Ticket: DOT-N` on its own line at the top when one
  owns it.

📌 **1Password is required** for SSH signing. Vim plugins need a manual `:PlugInstall` after setup.
