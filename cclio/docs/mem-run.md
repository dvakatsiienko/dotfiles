# mem-run — the memory + skills sweep

the working file for the run. **dima's plan lives here now**, moved out of
[DOT-73](linear://linear.app/issue/DOT-73)'s body so a ticket body is not a granular plan.

three homes, and nothing crosses them:

| home | carries |
| -- | -- |
| the linear board | deliverables that outlive the run |
| **this file** | the ordered steps · the file map · per-file verdicts |
| obsidian `flowlog.md` | cross-session carry-over only |

📌 **this file is dima's recipe, written by him.** an agent may improve it, never replace it.
📌 it is also the seed of phase 4's reusable checkup. keep it evergreen from the first step.

---

## working rules for the whole run

- 🚫 **no auto-commit.** dima reads the diffs, then commits. do not `cmt` through this activity.
- 👣 **step by step.** he approves more this time and wants to see diffs.
- 📉 **do not overload him.** report in the per-file shape below, not in walls.
- 🧭 **trace well, fix in place.** flaws get patched while the trace is hot.
- 🤝 objections and suggestions welcome on any part.
- 🔥 the run happens in a fresh session and finishes there.

### the per-file report shape

```
[memfile filename]: what it is about
issue
suggestion how to solve
```

expand only when he asks. when he does, print the diff of what you are about to do.

### who executes — settled

**approach b: the coordinator is the executor**, not a spawn. dima's reasoning, and it holds:
memory and skills is exactly where the context gap between coordinator and coder hurts most —
you must see the whole picture to change the system correctly. the coordinator already holds
every leaf resident; a spawn pays ~50k to rebuild a worse copy.

- **b** for cclio's own leaves, root `CLAUDE.md`, and `rules/`
- **a** (spawn) for the outer project `CLAUDE.md`s — bulk retrieval, no judgment
- parallel **research** spawns stay allowed throughout
- whoever edits must apply `writing-for-agents` for skills, and the memory-writing guide once
  phase 0 produces one

⚠️ **context is the known constraint.** cold boot is ~115k. the coordinator may ask for a fresh
session mid-sweep; when it does, it must say plainly **why**. dima watches the pacing himself.

---

## phase 0 · research first — the base mover

no random writes. everything the bucketing does is steered by this phase, so it runs before any
file is touched.

1. research the **newest best practices for writing memfiles and skills** — what works, what does
   not, tools and tricks.
2. 🎯 **the context-size question — dima's, and it is the one with a number attached.**

   > «what is the current target best practice of keeping the ctx size for an llm to perform well?
   > previously it was ~120k tok — a number after which performance starts to lower. what is the
   > number now? which number to hunt? your current boot ctx is 115k, and after first boot it
   > becomes ~200k. 120k target is not realistic. **what do we do wrong?**»

   - find the **current** number, not the remembered one. the ~120k degradation figure is old and
     may not hold for a 1M-context model.
   - ⚠️ **the last clause is the real question.** «what do we do wrong» outranks the number: a
     115k cold boot that reaches 200k after one turn is either normal for this class of work or a
     symptom. answer which, with evidence, before proposing a target.
   - 📌 the answer steers [DOT-198](linear://linear.app/issue/DOT-198) directly — that ticket's
     old 25k target was dispatch's invention and was removed for being made up. do not replace one
     invented number with another.
   - measure before optimising: what actually fills the window here is memory files (72k of 115k),
     and that is what the bucketing changes.

3. a **third researcher** on the harder question: *«how do you teach agents to properly
   write and maintain skills and memory?»* — and dima's sharper version: *«who is better at writing
   skills and mems — a human or an agent?»*
4. distill the research into guides in `docs/`: `authoring-memory.md` and `authoring-skill.md` **exist**;
   `authoring-memory-project.md` (how to write a good project-level `CLAUDE.md`) **does not** and
   is an output of this phase.
5. then read matt's `writing-for-agents` against the landed research:
   - still useful? does the research replicate it? does it have flaws?
   - option to evaluate in place: **proxy the research file through the skill** so both apply, with
     matt's skill taking the final word. ❓ is that both-worlds or bloat — answer it, do not assume.
   - 📌 dima's update, and it changes the shape: *«writing-for-agents most likely is only good for
     skills»*. if so, a **mem-writing skill is missing** and this phase must produce it.
   - ❓ **do we still need skillsmith** ([DOT-132](linear://linear.app/issue/DOT-132))?

📌 decide skill-vs-doc size **after** the research lands. `skillsmith` stays thin with a pointer
into the bigger guide rather than swallowing it.

---

## phase 1 · scan and map — before moving anything

- read **everything**, project-level `CLAUDE.md`s included. many have not been touched in a long
  time and are prime candidates.
- **build the map** — right here in this file: every place holding memfile-shaped content, a short
  note on what it holds, obvious flaws, and a pre-suggestion of the change needed.
- the map stays a **main resident** for the whole run.

### the order, from dima — binding

1. **gather ALL memfiles** — root `CLAUDE.md` plus every leaf `CLAUDE.md` across every repo.
2. **eval cc's default «go upd memory» behaviour.** when asked twice, where does the information
   actually land? the right places? poems? do this **diff-based**, before and after.
3. **map the `rules/` pointers** — which memfile references which rule, and which links are dead.
4. **map the voice / formatting / writing-style wiring** — how it is connected today.
5. **build the connection graph FIRST.** analysis before any edit; dima will ask for a drawing of
   it, so it has to be a real graph, not prose.
6. **then the update plan.** think hard. no edits before the plan exists.
7. flush.
8. **touch every piece.** a partial pass leaves exactly the ambiguity this is meant to end.

### connector pass vs content pass — keep them apart

- 🎯 **the connector layer is the target**: pointers, precedence, placement. **not the content.**
- 🚫 pruning the *content* of `rules/`, voices and writing-styles is a **separate** concern and does
  not ride along here.
- **precedence to encode**: leaf `CLAUDE.md` overrides root. one line in root, and conflicts get
  cheap.

### the deliverables of this phase

- **the connection graph** — what points at what, and what points at nothing.
- **the placement decision table** — `rules/` vs root mem vs leaf mem vs skill body vs
  `conventions/`. one table, so information stops landing in two homes.
- **the failure capture.** run in a persistent session, record every failure point found, and write
  the findings somewhere durable — a rule, or the skill that comes out of phase 0. 🎯 dima's
  principle, and it is the whole point: **no cleaning is needed when no trash is produced.**

### the map

_empty — filled in phase 1._

---

## phase 2 · bucket hopping — in this order, top to bottom

### the buckets

| bucket | what belongs in it |
| -- | -- |
| **root** `CLAUDE.md` | overall guiding for everyone. what we do, why, how. the main dos and don'ts. dima's own section there is the reference for how a memfile should read — guiding tone, non-machine words |
| `rules/` | also global, also for everyone. the granular extension of root, so root does not become one dump file |
| `~/projects/CLAUDE.md` | the coder-global layer — see phase 3 |
| **project** `CLAUDE.md` | only what is specific to that project |
| **cclio memory** | only what is specific to the coordinator |

### the order is binding

1. **root +** `rules/` **first.** sort, place, trim fluff. if something must leave but may be
   useful later, migrate it into `docs/` rather than deleting it.
2. **then cclio's own memory, leaf by leaf.** read fully first to hold the picture, then process
   one at a time: read → good or not → is this the right place → keep / trim / move into root or a
   `rules/` member. new files allowed; do not spawn a file army.
   - bucketing **across** cclio's own leaves is allowed during this
   - fix leftover comments from earlier sessions while there
   - judge each filename — pretty for dima first, then for the agent. 🅠 **queue a filename sweep
     for afterwards**, since relevance shifts once things move
3. **then project** `CLAUDE.md`**s**, top to bottom: **dotfiles first**, then `bytes`,
   `dvakatsiienko`, `inner-marker`, `reinforcement-learning`.
4. **then the skills**, one by one, same process.
5. **then a final pass: code review, full picture.**

📌 skills are held **in mind during the memory buckets**, not deferred to step 4 — if a memory is
really a skill, say so when you see it. that is the whole reason mems and skills run together:
splitting them forces a second bucketing round.

**effort split ≈ 60% mems / 40% skills** — not because mems matter more, but because mems are the
mess and skills are «+- ok».

### the tricky call: only-cclio vs everyone

a real contradiction, and dima named it. example: «always print ticket ids as links that open the
linear app» — he wants it as cclio's memory **and** available to any plain ccli session. but he
does **not** want anyone except cclio to even know about linear milestones.

**the rule of thumb he gave:** cclio is the **pm lead**; everyone else is a **senior contributor,
not a junior**. a senior does not file a `cli` ticket into `bytes/tooling` when told «go fold a
ticket about this cli stuff». find the balance, **weighted slightly toward globals**.

### dispatch, while bucketing

⚠️ **the steer changed and this is the current one:** dispatch's influence **decreases**. it is a
minor fleet member now. cclio takes over its responsibilities and updates references to it
everywhere they appear; dispatch's own facts collapse into `fleet-capabilities.md`.

the **one** thing still planned with it: **after cclio's setup is fully done**, try linking cclio's
memories into dispatch by symlink. that is all. [DOT-115](linear://linear.app/issue/DOT-115) holds it.

⛔ **do not touch dispatch's own memfiles.**

### carried in: provenance ([DOT-106](linear://linear.app/issue/DOT-106), folded here)

the rule already lives twice in cclio memory (`claims-carry-their-test`,
`research-vs-lived-evidence`) and once as the CST truth rule. what is left is **generalising it**
so a plain ccli session inherits it: write «an agent-sourced claim is written attributed — *per cc:
X* — never asserted» into `CST-SPEC.md`, `x:pm`, and `rules/`. one bucketing bullet, not a ticket.

---

## phase 3 · the coder-global layer

`~/projects/CLAUDE.md` exists as a deliberate **stub** ([DOT-195](linear://linear.app/issue/DOT-195)).
filling it is a bucketing place in its own right.

❓ **the part dima explicitly does not know how to solve** — `guide-react`, `guide-typescript`,
`guide-code`. his words:

> basically the info at those files is what ccli code do when codifying. this was my intention when
> i asked ccli opus to create these at a skill lvl. but i was looking far, with idea of
> modularization — pick right tool at right time. reality is when you do code, then it is 90%
> typescript and/or react, and both are code. 🤔

- python and go (sline) exist too, and there the agent teaches him, not the reverse
- his own counter-point: skills are **lazy loaded**, so they cost nothing at rest — which weakens
  the case for merging them
- 📌 his decision: **observe how the bucketing goes and move as we go.** do not settle it up front

---

## phase 4 · the system checkup — runs in parallel, from the start

dima's idea, written while he was writing the plan:

> what do you think about creating a major cc system checkup based on this run? enable tracing at
> the start (fresh sess), and in parallel to all other activities write / evergreenify the checkup
> plan — and fix-improve it in place while we go and open new discoveries?

- tracing on at the **start**, never retroactively
- the checkup plan is written **while** the run happens, not after
- **the problem it names:** memory files and skills will never be in a good enough shape. regular
  maintenance is needed — weekly, fortnightly or monthly. **no timers, no schedulers, just a fact.**
- it exists so dima never has to print a similar checkup plan again
- start as a plain file, `claude-memory-system-health-check.md`. it **may** become a skill
- 🅠 remind him about it when the run is done — it is a deliverable, not a side note

---

## carried forward from DOT-73's old body

still true, demoted below the plan.

### barrels — decide during the run, do not build early

`docs/INDEX.md` and `cclio/memory/MEMORY.md` are hand-written and **can silently lie**: add a leaf,
skip the line, the index says it does not exist. same rot class that killed membank v1.

- proposed fix: **generate the barrel from each leaf's frontmatter.** ⚠️ not standalone — building
  it before the bucketing bakes today's layout in
- a generator cannot fix **hook quality**, and a lossy one-line hook is what makes an index fail to
  surface something. stays a human job
- open: **index-authoritative vs index-descriptive.** `cclio/memory/` is already authoritative — a
  leaf loads only if the barrel imports it. is that the fleet-wide model?
- 📌 `rules/` has **no index**. only `cclio/memory/` does

### what a project `CLAUDE.md` owes

**two jobs, currently conflated.** a project file must *represent the project* AND say *how agents
should work in it*. ours mostly do the first.

**tone continuity is a requirement.** a project file should read in the same voice as root. nothing
checks this today, and drift is invisible.

**operational categories written down nowhere:**

- how PRs get filed in this repo
- how dev servers get run here
- how to seed test data from wherever the real data lives
- 🚨 **how not to kill the server the human is already using.** no rule of this class exists at
  all. same shape as the destructive-ops guard, aimed at *processes*
- a **glossary** per project — the domain-modeling `CONTEXT.md` shape already agreed

**method worth stealing: write TWO alternative drafts and pick, rather than editing in place.**
dima's standing rule for visual work already says exactly this, and it fits bucketing better than
incremental editing — the whole point is that the current layout is wrong.

### 🌍 entity-first naming goes global

**the entity name leads, the verb follows.** `handoff_delete`, `handoff_list` — never
`delete_handoff`. scope is everything with a name.

📌 the same rule is currently recorded **three times under three names** — subject-first in
`~/.claude/CLAUDE.md`, family-first in cclio memory, entity-first in the mcp rename. that
triplication is exactly what this run kills: **one statement, in the root memfile, the other two
deleted.**

🚨 **measured:** four tools shipped as `transcript_*`. a `cw` thread listed them, read only the
names, decided they meant session CSTs and refused to use them — while the descriptions said
«YouTube». renamed `yt_transcript_*`, worked first try. **a wrong entity is not recoverable by a
good description.**

**still needs the pass:** the `x:*` and `cclio:*` skill names, the `plugin-x` skill directories,
the `script/` entrypoints.

### the failure-mode scrape — demoted, not dropped

look through dima's history with fable, opus and sonnet on this machine, bucket the most common
failure modes, and count how often each model hits them — so the upgrade steers away from what
actually breaks rather than what we assume breaks.

- corpus: `~/.claude/projects/` (~28 dirs, **240M**), `~/.claude/history.jsonl` (2768 lines),
  `~/.claude/shelf/flawlog/` (10 hand-written logs — the labelled set to calibrate against)
- 🚫 codex and gpt are out of scope
- shape: resolve each transcript's model **first**, extract events not opinions, bucket then count
- ⚠️ 240M does not fit a context window. this is a **scripted extraction**, never an agent reading
  transcripts — pretending otherwise silently samples 2% and reports a total

📌 phase 0's research is the prep that steers this run. the scrape is a second, independent input
and may run in parallel or be deferred.

---

## the finding this run exists for

opus writes long by default — replies, tickets, and **its own internals**. asked who the long
version served, it answered «the user». dima: **«i do not need 90% of it, it only overwhelms me. i
tell you when i want it expanded.»** roughly **70% of written text is not needed.**

the question that made it a story: **does that scale to skills, rules and** `CLAUDE.md`**?** those
are written with the same assumption, and the assumption is wrong there too.

dima's spec for what those files should hold, verbatim and complete:

> info that is useful to **you**, in a format appropriate to **you**

no expanded version for the reader. binding on every skill and rule write, asked for or
self-initiated. the enforceable ruleset is [DOT-127](linear://linear.app/issue/DOT-127).

---

## 🚨 why this file exists at all

the plan sat in dima's obsidian inbox for a day and **never reached the ticket**. an earlier
session read the whole drop, folded every immediately-actionable item correctly, and skipped the
block marked *«to be done after setting up you as coordinator»* — future-dated work summarised to
nothing.

the worse half: the body was **not empty**. it held an agent-written ordering that read finished,
which is why nobody noticed dima's plan was missing.

**the flaw class: a summary replaced a source, and the summary read better than the thing it
replaced.** same shape as a silently-failing `@import` — complete-looking from both sides.

**the guard:** a fold is scoped to what was **said**, never to what is actionable now. a
future-dated block is written down in full and marked deferred. deferring is a state, not a reason
to compress.

---

## open questions owed to dima

- ❓ story shape — a new «ccli memory nurture» story holding the non-p0 children of DOT-73 and
  DOT-184, with `memory:` / `skill:` title prefixes. proposed, awaiting his word.
- ❓ where the t3 reference (`AGENTS-t3-code-ref.md`) finally lands.
- ❓ is proxying the research guides through `writing-for-agents` both-worlds, or bloat?
- ❓ does `writing-for-agents` apply to memory files, or only to skills?
- ❓ do we still need skillsmith once the guides exist?
