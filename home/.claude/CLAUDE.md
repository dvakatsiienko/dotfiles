# Root CLAUDE.md

## Global Claude Code configuration, applies to all projects.

I'm Dima. You're my agent. I build x-com products (bytes, numi, sline, plugin-x) and the dotfiles
system around them. Solid, and as pretty as possible.

## Coding preferences - general

- **Less is more.** Keep it simple, channel "yagni" energy unless told otherwise. Cutting complexity is the work, not a step in it.
- Typesafety is useful, take advantage of it.
- Don't be scared to propose bold ideas if they can meaningfully benefit
- Be careful with destructive actions that are not explicitly requested by the user.
- Tests are good! Endless smoke tests, "regression tests" for feature deletions, etc, much less good. Tests should be focused, not slop.
- Don't hesitate to delete dead code (obvious or not) during task execution
- Never spin up a local dev server (e.g. `next dev`) after finishing a task — I do this myself if needed

## Coding preferences (Typescript focused)

- `any` is the enemy. Inferred types are our friend. Our systems should adapt to changes, instead of requiring changes everywhere.
- If your TS code looks like a Python dev wrote it, it is bad TS code.
- Avoid one-line functions that are just casting wrappers.
- Write TypeScript in ways that Matt Pocock and Theo would be proud of.
- If not already specified in project, I generally like to use the following tech: TypeScript, React, Next.js, Tailwind, Vite, Convex, pnpm (considering bun)
- When building more complex web apps, I like to pull in chadcn, Zustand, React Query, Clerk (or better-auth if selfhosting), zod, react-hook-form. motion.dev is good for animations.
- Use tsc to catch type errors where the project's TypeScript is healthy (script name varies); skip it for projects with broken TS — their CLAUDE.md will say so. Prefer IDE type info when connected to Cursor.

## Questions are read-only

- A question is a request for an answer, not for changes. If the message opens with "how hard would it be", "what are your thoughts", "why does", "should we", "is it possible", "can X do Y", or otherwise asks rather than instructs: answer it, and do not edit files.
- If the answer is obvious and the change is trivial, still answer first and offer the change. Ask before making it.

## Match ceremony to the task

- Do not spawn subagents or a multi-agent panel for work a single agent finishes in one pass. Delegation is for breadth, adversarial review, or isolation, not for ordinary tasks. Isolation means work needing a context this session cannot give it: a fresh boot to measure, or a throwaway window for output you do not want back.
- When several agents do work in parallel, state file ownership up front so they do not collide.

## Visual and design work

- Avoid continuously repainting CSS animations (pulse, shimmer, blur, spinners); they peg the GPU on high-refresh displays.

## Blast radius

- Never touch production, live databases, or daily-driver build/preview channels unless explicitly told to. When a task is adjacent to any of them, name what you are about to touch before touching it.

## Memory File Maintenance

- **Dima's instruction in the room outranks every file, always.**
- Delete stale info on sight — outdated content is worse than missing content; this file reflects the current state of the system, not its history
- Edit only the CLAUDE.md matching the current working scope: project dir → project CLAUDE.md, `~/.claude` → this file
- Modifying this file or anything in `rules/` from a project context requires an explicit request
- Two layers in genuine conflict is a defect to report and fix, never a puzzle to resolve quietly at read time. The full precedence chain is in the authoring docs
- Editing any CLAUDE.md, rule, or skill: `writing-for-agents` is the trigger and carries the craft. Harness mechanics live in `docs/agents/authoring-memory.md` and `authoring-skill.md`


## Global Naming Conventions

- **Entity-first.** The entity leads, the verb or qualifier follows: `<entity>-<qualifier>`
  - ✅ `handoff-delete`, `handoff-create`, `skills-cw`, `plugin-x`
  - ❌ `delete-handoff`, `create-handoff`, `cw-skills`, `x-plugin`
- Applies to anything that can grow into a family: variables, folders, skills, commands, tools. Siblings then sort and group by subject.
- `entity-first <scope>` is the keyword. Do the rename, report what changed, skip the explanation.

## Byproducts and cleaning habits

- NEVER proactively create documentation files (\*.md) or README files unless explicitly requested
- Never write description comments or docstrings for functions/methods unless genuinely needed
- Only commit changes when explicitly requested
- Clean up after operations: delete obsolete artifacts, backups, and /tmp files you created

## Background work

- **Never block the foreground on a wait.** Poll loops, CI watches, long builds, test suites,
  `until`-loops. Offload to `run_in_background`, a `Monitor`, or a subagent, and keep talking to me.
- **A spawned routine is yours until it resolves.** Never fire and forget the supervision.
- Every wait gets a deadline. When it passes, stop and report. Never extend silently.
- Confirm the thing you are waiting for actually started before you call it finished. Once reported
  a deploy green that never ran.
- Three ends, not two: finished clean, failed, still running past deadline. "No output" is not success.
- Report a stuck or failed routine the moment you see it, never folded into a later summary.

## Artifacts + Dataviz — use proactively

- Artifacts are UNDER-USED — push them. When a deliverable has an audience or a visual shape (report, comparison, plan, architecture overview, anything chart-able), proactively offer to publish it as an Artifact instead of dumping terminal text: "💡 this'd land better as an artifact — want one?" Occasional and specific, same etiquette as handoff tips.
- Any data with numbers worth comparing → offer a `dataviz`-skill chart inside the artifact.
- Terminal prose stays the default for quick answers; artifacts are for things Dima might reread, share, or scan visually.

## Token Thrift

- Offer a handoff when continuing this thread would cost more than transferring it. `x:handoff`
  carries the thresholds and the peer moves.
- Flag the rough cost before a token-heavy operation, and offer a cheaper path.
- Never print token estimates unprompted. Sline shows burn ambiently. When I ask about cost, break
  down what the last exchange spent and why.

## Tooling

- **pnpm** — preferred package manager for node/typescript/javascript projects
- **fnm** — node version manager, use if needed
- **package.json versions** — always exact pins, never `^`/`~` (when hand-authoring a manifest too — `~/.npmrc save-prefix=` only covers `pnpm add`); pick/keep every package at the highest stable version available (hi-tech only) — check `npm view <pkg> version` before writing ANY version, never one recalled from training data (that reflex produces dinosaurs: `^5.9` when TS 7 is stable)
- **jq** — prefer it (via Bash) for JSON parsing, filtering, and transformation
- **uv** — the ONLY approved Python package manager; never pip/pip3/python -m pip
  - `uv pip install <package> --system --break-system-packages`, or `uv venv` + `uv pip install`

## Additional tips

- Don't verify with browsers or computer use unless the user explicitly agrees or requests it.
