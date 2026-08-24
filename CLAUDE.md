# CLAUDE.md: dotfiles

<!-- dima: i'd like to keep this info. you - suggest a an edit to make it sound better or do not do anything. -->
Hey.
Welcome to my repo with dotfiles. Here we will improve dotfiles by themselves, build other
interesting tools like `sline`, tweak configs, and if not most importantly - tune and improve your own memory ind infra.
We will cook most of internal tooling and overhaul my system (zsh, git, brew, and rest) inside dotfiles too.
A mix.
Main environment is macOS, managed by symlinks.
This is a place where the agent (currently, Claude Code CLI) system itself is developed (`home/.claude/`).

## the dotfiles

### the mirror rule

<!-- dima: does this truly helps you navigate dotfiles? or you just could ls in the root and immdediately see that home is a symlink? -->
<!-- dima: my take - appears to be useful. just wanted to be sure it is truly useful for you, a machine. me personally — not need this info here, i know the setup. -->
**A path under `home/` IS the path under `~`.** Everything symlinked into the home directory lives
at its literal relative path, so the link map is _derived by walking the tree_ rather than
hand-maintained. Anything imported by hand into an app instead of symlinked lives in `import/`.

<!-- dima: i think this one is to keep :D -->
A directory is linked wholesale **unless** the matching path in `~` is already a real directory
holding content this repo does not own (`~/.config`, `~/.claude`) — then it descends and links the
leaves. `noLink` in `lib/manifest.ts` names the few dirs stored here but referenced by absolute path.

<!-- dima: i get the idea, but phrasing is a bit confusing (i was opus) - can someone decypher this? -->
📌 `home/.claude/` (global config) and `.claude/` (this project's config) are deliberately distinct.
That collision is exactly why the global config is nested under `home/`.

<!-- dima: i saw you often stumbled on symlink editing before. but maybe this is worth to hoist into /rule somewhere? looks liks a global warning. -->
🚫 **Never edit `~/.claude/…` directly** — edit `home/.claude/…` and the symlink carries it.

### the two commands with non-obvious grammar
<!-- dima: how to make these obvious then? -->

```bash
pnpm dotfiles-link apply                  # link everything not linked yet
pnpm dotfiles-link untrack ~/.gitconfig   # hand a file back to ~, drop it from the repo
```

<!-- dima: well, i think this whole block appears to be useful in general. are trims or reshapes possible? it is informative, but looks like it could be assembled into more guide-like -->
Registering a new dotfile is a **move, not a command**: `mv ~/.foo home/.foo && pnpm dotfiles-link apply`.

`package.json` `scripts` is the full list — read it rather than a copy here.

## how the scripts work
<!-- dima: not sure about this whole blocks. scripts are not a hi math. and dotfiles already described above. if not useful - delete or prune, or tell why useful. -->

- **`lib/manifest.ts`** — the engine. Walks `home/`, derives the expected link set. Never run
  directly; it decides, `dotfiles-link.ts` acts.
- **`dotfiles-link.ts`** — status / apply / untrack. Idempotent, and it **refuses to clobber a real
  file** rather than moving it into a backup nobody reads.
- **`macos-setup.ts`** — `brew bundle` against the root `Brewfile`, the macOS defaults this repo
  owns, `duti` file-type bindings, vim-plug. Packages live in the `Brewfile`, never in the script.

## typescript here has no build step

<!-- isn't the setup is self-descriptive? do you need this block? i won't object too much, but wana know how it is useful to you. -->

**Scripts are `.ts`, run by node directly** — node 24 strips types natively, so there is no `tsx`
and no compile. `tsconfig.json` sets `erasableSyntaxOnly`, which **bans any syntax needing real
compilation**. `pnpm typecheck` is the checker.

**Layout:** anything directly under `script/` is a runnable entrypoint with a matching `pnpm`
script; anything under `script/lib/` is a library and is never invoked directly.

<!-- isn't the setup is self-descriptive? this particlar piece might be useful, because you know about lefthook only after first commit, but with this you are aware upfront. is this true? or also not needed? thing is - we have lefthook in bytes too, and maybe will have more of this. so rule is a dupe generator. -->
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
  prefer colocating our produce in `shelf` reather that scattering everywhere.
- **`sline/`** — this repo's statusline. Its own `CLAUDE.md` loads when working under it.

## docs and tracker
<!-- dima: i think linear part should be extracted into either ticket-flow.md, or your pm memory or pm skill.¹ -->

- Issues live in **Linear**, workspace `x-com`, teams `DOT` / `BYT`, via the `linear` CLI.
  🚫 Never the Linear MCP. GitHub issues are retired.
- **Multi-context layout** — `CONTEXT-MAP.md` at root. Repo context: `CONTEXT.md` + `docs/adr/`
  (ADR-nnnn). Tracker context: `docs/tracker/CONTEXT.md` + `docs/tracker/adr/` (TRK-nnnn).
- **Authoring guides** — `docs/agents/authoring-memory.md` and `authoring-skill.md` carry the
  harness mechanics; matt's `writing-for-agents` carries the craft. <!-- dima: this one is tricky. we have started comprehensive memory and skill editing exploration activity. where then this entry should go? global memory or say here in leaft? since this memory file is in dotfiles, and rules/ along with root claude.md also accessible via symlink but their source is here - you kinda must to navigate into this dir first, to edit them? when makes you must-read this project claude.md to edit any of your global memory files or skills? if yes-that means it is likely correct place to store this info here. then ccli will only load it if asked go tweak memories or fix a skill. this one is important print me into thread before changing it -->
- **Research** — `docs/research/<subject>.md`, subject-first filename, never a ticket-id prefix, so
  a doc survives the ticket that prompted it. `Ticket: DOT-N` on its own line at the top when one
  owns it. <!-- dima: we defined naming convs somewhere else, they must be written in a way so these dupes do not appear. are they? -->

<!-- dima: is this line truley needed? -->
📌 **1Password is required** for SSH signing. Vim plugins need a manual `:PlugInstall` after setup.
