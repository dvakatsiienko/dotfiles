---
name: git-commit-takes-the-index
description: A bare git commit takes the WHOLE index, not the paths you just added — pass the pathspec to commit itself
metadata:
  node_type: memory
  type: feedback
---

❗ **`git add <paths>` narrows what you STAGE. it does nothing about what is ALREADY staged, and a
bare `git commit` takes the whole index either way.**

```sh
git commit -F msg.txt -- <explicit paths>   # the fix: pathspec on COMMIT
git diff --cached --name-only               # or read the index before every commit
```

**Why this is a leaf and not a note:** it fired **twice in one session**, and the first remedy was
*«be careful — check `git show --stat` afterwards»*. That catches it; it does not prevent it. The
second time it reached the remote, where the cheap fix (a soft reset) no longer exists.

- run 1: a failed pre-commit hook left the index dirty. the retry's `git add` named one path; the
  commit took both, and a run file landed inside a commit describing an mcp change.
- run 2: a staged `git rm` rode along on an unrelated small commit whose message never mentions it.
  pushed before anyone looked.

🎯 **the generalisable lesson, and it is the valuable half: a discipline fix for a mechanism failure
fails twice.** when a tool will silently do the wrong thing, the fix is **a different invocation**,
never a firmer intention — attention is exactly what runs out.

📌 the same shape applies with a live peer: `spawn-contract` already forbids `git add -A` while
another agent works the tree. that rule was right and still insufficient, because it governs `add`.

Related: [[spawning]], [[claims-carry-their-test]]
