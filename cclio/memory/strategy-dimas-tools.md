Branch of [[dima-strategies]]. Linear project: `dima's tools`. Stories: DOT-39 (major sweep),
DOT-17 (shell layer), DOT-159 (git), DOT-160 (zsh/omz).

## the aim

**Tools good enough that the agent can act confidently in them.** The reframe that makes this branch
strategic rather than cosmetic is Dima's, and it is sharp:

> «i'll soon ask you to review my git setup because my git is used by both of us. you use it ~98%
> more than me. you can even calc it — go scrape git histories, you will eventually find a pattern
> that distinctly separates your commits from mine despite the same author. so you'd be interested
> to have a proper git setup. so you could do your sweeps more confidently 😏»

These are not his tools that agents borrow. They are **shared tools where the agent is the majority
user**. That inverts who the ergonomics should serve.

## the strategic problem

Agent and human commit under the same identity, with no way to tell the work apart after the fact.
That is a review problem, an attribution problem and a trust problem at once — and it caps how
confidently an agent can sweep, because a bad sweep is indistinguishable from his own work.

## the moves

- **git (DOT-159)** — scrape the histories, find the fingerprint that already separates agent
  commits from his, then design the setup around it. The scrape is a genuine research task and he
  is curious about the answer, not just the config.
- **shell / omz (DOT-160, DOT-17)** — 79 aliases and 2 functions to audit, the init load path to
  rewrite, starship-vs-sline overlap to resolve
- **dotfiles** — the mirror rule holds; the seed script (DOT-147) and the brand README (DOT-26) are
  the remaining shape

## sequencing

Deliberately **after** the fleet migration settles. Dima flagged it as interesting but not now, and
the reason is sound: touching git and shell while everything else is open spawns six tickets. This
branch waits, and waiting is not neglect.
