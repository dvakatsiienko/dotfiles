# routing + url shape

**routing state belongs in the path, not in a query string.** if a thing is a resource or a place,
it gets a path segment. search params are only for genuine view state nobody would link to.

- ✅ `/library/NPWR21924_00`
- 🚫 `/library?game=NPWR21924_00`

a tab is navigation. a selected game is a resource. both are paths. sorting, a filter toggle, an
open panel — view state, and search params are right for those.

the test: **would anyone paste this url to someone else?** if yes it is a place, and a place has a
path.

## what it cost

`trophy-sys` was first built on search-param routing and rebuilt on paths after review — the
router, every component reading the params, and the rewrite rule that makes deep links load. the
rule is one line; the correction was a full router rewrite.

## where else this is written

`~/projects/bytes/CLAUDE.md` carries the same rule for that repo, so it fires there without this
skill loading at all.
