# open — parked items

`/queue`'s store. the skill walks **up** from cwd and writes to the nearest `OPEN.md`, so in a
cclio session it lands here without anything being hardcoded. that is why this file exists and
why it is not folded into the obsidian `flowlog.md` — different owner, different reach: obsidian
is dima's channel (icloud, phone-editable), this is the repo's.

two sections, never merged. `## queue` = work parked by `/queue` in an earlier session, offered
at the next boot. `## parks` = long-lived items that outlive many sessions.

**anything that has a linear ticket does not belong here.** the boot ritual queries the board
directly, so a copy of a ticket in this file is a fifth copy that goes stale silently.

## queue

_empty._

## parks

- ⚠️ **dotfiles relocates to `~/dotfiles`, and it must happen BEFORE
  [DOT-195](linear://linear.app/issue/DOT-195)** — [DOT-202](linear://linear.app/issue/DOT-202).
  cclio runs from inside dotfiles at `~/projects/dotfiles/cclio`, which is safe **only while
  `~/projects/CLAUDE.md` does not exist**. the moment DOT-195 creates the coder-global, this path
  inherits it and the coordinator stops being isolated. **ordering is blocking, not preference.**
  dima's own reason stands alone: the cursor multi-root view degrades as file count grows.
  📌 kept here rather than left to the tracker because `/cclio:init` step 2 points at it by name.
