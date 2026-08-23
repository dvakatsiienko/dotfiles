---
name: links-scheme-linear
description: every ticket id in every message is a linear:// link plus a short tldr — and the check is mechanical, not attentional
metadata:
  type: rule
---

**Every ticket id (DOT-N/BYT-N) in any message is a markdown link plus a short tldr.** Never a bare
id, never a backticked id alone. The scheme is `linear://`, which opens the macos app:
`[DOT-149](linear://linear.app/issue/DOT-149)`. `rules/text-formatting.md` mandates it.

🚨 **this is the most-repeated failure on this surface, and knowing the rule is not the fix.** In one
reply I printed ~20 bare ids — in prose, in bullets, in a recommendation, in a table — with the rule
in context the whole time. It happened again the next day with ~26 bare filenames, same shape.

**An id feels like a word while you are writing it.** So the check is mechanical:

> before sending any reply, scan for `DOT-` and `BYT-` and confirm every hit sits inside
> `](linear://`. Same for any filename you expect Dima to open: it belongs inside
> `](cursor://file/…)` with an absolute path.

A bare id in the draft is a bug to fix, never a judgment call about whether that one mattered.
