---
drafted: 2026-08-22
status: gathering — a starter, grown as guardrails are discovered
ticket: DOT-73
---

# memory authoring — where a fact goes, decided BEFORE it is written

sibling to `skill-authoring.md`: that one is how to write a skill, this one is where anything
written belongs. the sanitization pass in [DOT-73] exists because facts were written wherever the agent happened to
be standing. this file exists so the next one is not needed: **placement is decided before the
write, not repaired after it.**

📌 this is a starter. it grows as guardrails are found, and it is the raw material for a
memory-writing skill. `writing-for-agents` covers skills; nothing yet covers memory.

---

## the pre-write checklist

before writing or editing ANY memory, rule, or `CLAUDE.md`, answer these four. if you cannot, the
fact is not ready to be written down.

1. **who needs this?** everyone on the machine · every coder · one project · one surface · one role
2. **what does it cost?** a `rules/` file is resident in **every** session, forever. a skill's
   `description:` is resident in every session. a command costs nothing until typed. a doc costs
   nothing until read
3. **does it already exist somewhere?** a second copy of a rule is worse than no rule, because the
   two drift and nobody can tell which is live
4. **is it a fact, a rule, or a story?** they have different homes and different decay rates. a
   rule without its reason can only be obeyed or deleted, never re-aimed

---

## the buckets, and the test for each

| bucket | holds | the test |
| --- | --- | --- |
| root `CLAUDE.md` | guiding for **everyone** — what we do, why, the main dos and donts | would a brand new session in any repo be worse without it? |
| `rules/*.md` | granular globals — the same audience as root, split so one file is not a dump | same test as root, **plus**: is it worth paying for in every session on the machine? |
| project `CLAUDE.md` | only what is true of **this** project | would it be wrong or meaningless in another repo? |
| coordinator memory | one decision, coordinator-only | would a coder session be confused or misled by it? |
| `docs/` | reference read **on demand** | is it long, occasional, or a lookup? then it is a doc, not a rule |

**the sharpest single rule:** anything only ONE surface needs is a **peek-on-demand doc**, never a
rule. `identity.md` grew fat exactly this way — it accumulated capabilities that belong in
`claude-fleet-capabilities.md`, and every coder in every repo pays for them.

---

## a project `CLAUDE.md` has TWO jobs, and we conflate them

1. **represent the project** — what it is, how it is shaped, what its vocabulary means
2. **say how agents work in it** — how PRs get filed, how dev servers get run, how to seed test
   data, and 🚨 **how not to kill the server the human is already using**

most of ours do only the first. they have different audiences and different decay rates, so they
should be visibly separate sections rather than one blended wall.

**tone continuity is a requirement.** a project file should read in the root file's voice. nothing
checks this today, and the drift is invisible: each file is written alone and only feels wrong when
read side by side.

---

## what NEVER goes in

- **timestamps and provenance in prose.** «adopted 2026-08-20», «split out of DOT-73», «per the
  research». the tracker stores times natively and a relation carries lineage. **keep** a date that
  IS the fact — an expiry, a deadline, a scheduled review — and keep the machine run stamp
- **an expanded version for the reader.** dima's spec, verbatim: *info that is useful to **you**, in
  a format appropriate to **you***. roughly 70% of written text is not needed
- **a rule inferred but not tested.** labelling it «inferred» does not help — a rule reads as a rule
  regardless of its caveat. the auto-unassign fix was marked inferred, written into two binding
  files, and falsified by the first push. **test it, then write it**
- **a claim relayed from another agent, asserted as your own.** attribute it, or verify it

---

## hazards that bite silently

- ❗ **a broken `@import` loads NOTHING and says nothing.** paths resolve relative to the
  **importing file**. from inside `memory/MEMORY.md` a sibling is `@leaf.md`; the intuitive
  `@memory/leaf.md` resolves to `memory/memory/leaf.md` and fails in total silence. **on-disk
  presence is not evidence of being loaded** — probe a leaf-only fact
- ❗ **a hand-written barrel can lie.** add a leaf, skip the pointer, and the index says it does not
  exist. `cclio/memory/` is index-**authoritative** (a leaf loads only if imported), so a missing
  line genuinely disables that memory
- ❗ **a subagent does not inherit the parent's cwd** — it gets the git repo root. **every path
  written into a brief or a memfile must be absolute**
- ❗ **a rule that describes another surface is still resident everywhere.** `dispatch.md` costs
  every bytes coder ~2.1k tokens describing a coordinator it will never be

---

## how the files are organised

- **one leaf, one decision.** not a topic dump
- **colocate by hot spot.** 40 flat files is unnavigable for a human. group by AREA — output and
  formatting is one, everything tracker-shaped is another, spawning is another. the test is dima's:
  *«optimize your linear activity habits»* should land him in ONE place
- **filenames are subject-first** and readable at a glance, for the agent first and dima second
- **a stale pointer means delete both the line and the file.** no tombstones
- **the emoji prefix is a salience marker** (❗ 📌 ⏰ 🧭 ⭐ 🚫), never decoration

---

## the method, when a file needs rethinking

⭐ **write TWO alternative drafts and let dima pick, rather than editing in place.** his standing
rule for visual work already says exactly this — build several mocks, publish, wait for a pick.
incremental editing preserves the layout, and a rethink exists precisely because the layout is
wrong.

---

## trimming — the order is binding

the «why» paragraphs are **scaffolding, not fat**, while a surface is still being built: a rule
without its reason can only be obeyed or deleted, never corrected. they come out **last**, in this
order, and no earlier:

1. the coordinator's own story reaches a verdict
2. the obsidian `worklog.md` and `inbox.md` are exhausted
3. frozen handoffs are reviewed and resolved
4. **then** the memory is freed from clutter
