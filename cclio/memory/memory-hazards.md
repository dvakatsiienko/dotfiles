Every hazard here is silent. That is what they have in common and why they share a file: each one
leaves the store looking healthy from both sides.

## ❗ a broken `@import` loads NOTHING and says nothing

No error, no warning, no missing-file line. The file sits on disk, reads fine in the editor,
appears in the barrel, and is simply not in context. **Presence on disk is not evidence of loading.**

Paths resolve relative to the **importing file**, never the cwd. Inside `memory/MEMORY.md` a leaf is
`@slug.md`; writing `@memory/slug.md` resolves to `memory/memory/slug.md` and loads nothing quietly.

**The probe, and it is the only detector that exists:** name a fact that lives ONLY in a leaf body.
The commit hash `d03f3da` in [[settings-json-drifts-when-unlinked]] is the standard one — it appears
in no barrel line. Cannot name it → the chain is broken, say so 🚨 and read the barrel by hand.
`/cclio:init` step 2 runs this. **Re-probe after any rename, move, or barrel edit** — a rename that
misses one pointer disconnects exactly one leaf, the hardest case to notice.

🚫 Counting files and matching pointers to filenames proves the files exist. It proves nothing about
what loaded. Two different questions.

## ❗ `open(path,"w")` truncates before the read nested inside it

```python
open(p,"w").writelines([l for l in open(p) if ...])   # ❌ empties the file
lines = open(p).read().split("\n"); open(p,"w").write(...)  # ✅ read fully, then truncate
```

This emptied `MEMORY.md` — 9,408 bytes to 0 — and the empty file was committed. **The verification
passed**, because a grep for the removed name returns nothing on an empty file and a leaf count does
not look at the barrel. It surfaced only when a token tally printed a zero.

🎯 **never verify a deletion with a check that an empty file also passes.** Assert what must REMAIN:
pointer count, byte count, a known-good line.

## ❗ a truncated read recorded as a truncated source

A quote was read as breaking mid-sentence at «info that», written down as incomplete, and turned
into a precondition that blocked real work. The bullet simply continued onto its own line.
**When a quote looks incomplete, re-read the original before writing the gap into a rule.**

📌 All three generalise the same way: **when a mechanism returns nothing, suspect your own inputs
before the mechanism.** Two probes here once read as «nested imports are unsupported» when the real
cause was a path base.

Related: [[research-vs-lived-evidence]], [[claims-carry-their-test]]
