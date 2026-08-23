**The tool did the wrong thing and said nothing.** That is what these share, and why they sit in one
file: each leaves the system looking healthy from both sides.

🎯 **The generalisable fix, and it is the whole point: a discipline fix for a mechanism failure fails
twice.** When a tool will silently do the wrong thing, the fix is **a different invocation**, never a
firmer intention. Attention is exactly what runs out.

## ❗ a broken `@import` loads NOTHING and says nothing

No error, no warning, no missing-file line. The file sits on disk, reads fine in the editor,
appears in the barrel, and is simply not in context. **Presence on disk is not evidence of loading.**

Paths resolve relative to the **importing file**, never the cwd. Inside `memory/MEMORY.md` a leaf is
`@slug.md`; writing `@memory/slug.md` resolves to `memory/memory/slug.md` and loads nothing quietly.

**The probe, and it is the only detector that exists:** name a fact that lives ONLY in a leaf body.
The commit hash `d03f3da` in [[settings-json-drift]] is the standard one — it appears
in no barrel line. Cannot name it → the chain is broken, say so 🚨 and read the barrel by hand.
`/cclio:init` step 2 runs this. **Re-probe after any rename, move, or barrel edit** — a rename that
misses one pointer disconnects exactly one leaf, the hardest case to notice.

🚫 Counting files and matching pointers to filenames proves the files exist. It proves nothing about
what loaded. Two different questions.

## ❗ a bare `git commit` takes the WHOLE index

```sh
git commit -F msg.txt -- <explicit paths>   # the fix: pathspec on COMMIT
git diff --cached --name-only               # or read the index before every commit
```

`git add <paths>` narrows what you **stage**. It does nothing about what is already staged.

It fired twice in one day, and the first remedy was *«be careful, check `git show --stat`
afterwards»* — which catches it and does not prevent it. The second time it reached the remote,
where the cheap fix no longer exists. A failed pre-commit hook leaves the index dirty, so **a failed
commit attempt is a second writer too**; its leftovers are indistinguishable from a peer's.

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

## ❗ an «everywhere» delete is a graph operation, not a file operation

Two agent files were deleted on request. They were spawned **by name** in three places inside a
skill, so the `rm` alone would have left that skill erroring on its own main loop — and nothing
would have said so until someone ran it.

**One `grep` for the name before the `rm` is the whole check.** The same shape as a barrel pointer,
a wikilink, or a rules reference: the file is a node, and deleting a node without walking its edges
leaves the edges pointing at nothing.

📌 All of these generalise the same way: **when a mechanism returns nothing, suspect your own inputs
before the mechanism.** Two probes here once read as «nested imports are unsupported» when the real
cause was a path base.

Related: [[research-vs-lived-evidence]], [[claims-carry-their-test]]
