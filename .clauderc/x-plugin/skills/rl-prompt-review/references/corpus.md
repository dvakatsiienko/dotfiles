# The corpus — five real prompts, measured

Every prompt in the task tree. Four are reference tasks;
`vite-wintertc-middleware` is ours. Treat all five as accepted work: when a review rule
would fail one of them, the rule is wrong.

Statistics quoted from `prompt-guide.md` are measured across the full dataset (39
prompts), not just these five. The five are for **shape calibration** — what an accepted
prompt actually looks like.

## Shape table

| Task | Words | Paras | Backticks | Headings | Bullets | Scope line |
| --- | --- | --- | --- | --- | --- | --- |
| `vite-wintertc-middleware` | 66 | 1 | 0 | 0 | 0 | yes |
| `nextjs-app-router-location-state` | 175 | 3 | 11 | 0 | 5 | no |
| `openclaw-bounded-recurrence` | 236 | 1 | 0 | 0 | 0 | no |
| `typeorm-class-table-inheritance` | 256 | 3 | 1 | 0 | 0 | no |
| `medusa-b2b-credit-engine` | 263 | 6 | 47 | 0 | 11 | no |

Range 66–263 words, median 236. **Zero headings across all five** — consistent with 4 of
39 in the full dataset. Backticks range 0–47; **two of five have none**. One of five
carries a scope line, matching the dataset's 13%.

Full-dataset figures for reference: half between 190 and 470 words, shortest merged 112,
longest 2,287; 72% quote identifiers in backticks; 36% carry a measured number; 36% name
a real file or symbol.

---

## `vite-wintertc-middleware` — 66 words

> Vite's dev server middlewares only work via Node's Connect-style (req, res, next)
> signature, forcing WinterTC-style runtimes (Hono-like) to create adapters to integrate.
> Extend server.middlewareMode to accept "winter-tc", exposing server.fetch(request) to
> run the middleware stack against a standard Request and return a standard Response,
> allowing seamless integration. Request/Response bodies must support streaming and
> buffering. Headers must be preserved across the conversion. WebSocket proxying is out
> of scope.

**Worth copying.** Two gradable requirements in seven words ("streaming and buffering" —
a mediocre implementation collects the body, satisfying buffering and silently failing
streaming). Carries exactly the two names the verifiers assert and nothing more. The
scope line is precise: *WebSocket* proxying, not "proxy" — HTTP proxying works through
the adapter and is verified, so a blanket exclusion would be inaccurate.

**Deviations, accepted.** 66 words is below the dataset's shortest merged prompt (112).
Zero backticks. Single paragraph rather than the typical several.

**Coupling, verified.** The verifier suite asserts `winter-tc` (24 occurrences) and
`.fetch(`. Both appear in the prompt. Pass 2 forward-check is clean.

> ⚠️ The annotated copy at
> `x:rl-task-authoring` → `examples/instruction-annotated.md` renders this prompt **with**
> backticks. The shipped `instruction.md` has none. The annotation added formatting for
> readability; do not cite it as evidence of the file's shape.

---

## `nextjs-app-router-location-state` — 175 words

Two prose paragraphs stating the problem and the goal, then five bullets pinning the
observable contract: the `state` option on `router.push`/`router.replace`, the `state`
prop on `Link`, `useNavigationState()` on the client, `navigationState()` on the server.

**Worth copying.** The negative-space bullet: *"Soft navigations without state, cold
document loads, full reloads, and hard navigations expose no client state for either
API."* One sentence pinning behavior on the far side of four boundaries — a fork two
engineers would otherwise resolve differently. This is "ambiguities pinned" done well.

**Do not miscount it as a scope line.** It states tested behavior at a boundary, not what
is outside the job.

**Deviations, accepted.** 175 words, below the 190–470 middle half.

---

## `openclaw-bounded-recurrence` — 236 words

A single 236-word paragraph, first person throughout, zero backticks — including on the
CLI flags `--until`, `--max-runs`, `--on-exhausted`, `--clear-until`, `--clear-max-runs`.

**Worth copying.** Dense boundary resolution in prose rather than a grid: what consumes
budget (executed occurrences, success or failure), what does not (skips), how retries
count (one unit), what survives restart, and what happens to occurrences missed while the
gateway was down. Every one of those is a fork a verifier would otherwise have to
adjudicate.

**Guards this prompt exists to protect.**

- *"I rely on OpenClaw's scheduled jobs…"* — first person, and it is **not preamble**.
  The first sentence carries the present-tense problem.
- *"…missed while it was down **may** catch up after restart only while the end date has
  not passed and budget remains"* — permission, precisely bounded. Not hedging.
- *"Existing jobs and one-shot jobs keep behaving exactly as today."* — a regression
  guard, and a **needed** one: the task changes recurrence firing behavior, so the
  boundary of what is untouched is a real requirement.
- Zero backticks on five CLI flags a verifier must call. The names are present and
  unambiguous; the formatting convention is absent. **Judgment call at most.**

---

## `typeorm-class-table-inheritance` — 256 words

Three prose paragraphs. One backtick span in the whole prompt —
`@TableInheritance({ pattern: "CTI" })`, the single name a verifier must call.

**Worth copying.** Behavior described entirely without design: "saving must write the
hierarchy in parent-to-child order, propagate generated or assigned identifiers, and
avoid leaving partial state when an operation fails." Every clause is assertable; none
names a class, method, or file. Also pins a genuine fork — root-repository queries use the
discriminator but load only root-owned state rather than joining every child table.

**Guard this prompt exists to protect.** Five spec-level "should"s — *"A subclass should
still behave like one entity"*, *"Queries … should expose"*, *"should use the
discriminator"*, *"should continue to behave"* — against explicit "must" elsewhere in the
same prompt. The must/should distinction is stable and deliberate. **Not hedging.**

Also carries a needed regression guard: *"Existing single-table inheritance mappings and
entities without inheritance should continue to behave as they do today"* — necessary,
because the task adds a second strategy alongside the default.

---

## `medusa-b2b-credit-engine` — 263 words

Two prose paragraphs, then eleven bullets enumerating the admin API: every endpoint, its
request fields, its types, and its failure statuses.

**Guard this prompt exists to protect.** Those bullets are the **public API surface** —
the exact names and values the verifiers assert (`net_30`, `available_credit`,
`reference_id`, `405` on mutation of an immutable ledger entry). They are the 🟢
write-it-down category, and enumerating them is mandatory, not over-specification.

A rubric that reads "tidy bullet grid" as over-specification flags this prompt and, if
acted on, deletes the names the tests require — the `teleport-ttl` failure mode.
Over-specification is enumerating *edge cases* so the model transcribes instead of
thinking, or dictating internal design.

**Genuine deviation.** It names a path: *"as a custom credit-engine module in
`src/modules/credit-engine`"*. Prompts normally leave file layout to the implementer.
Defensible here because Medusa v2 modules are resolved by directory convention, so the
path is closer to public interface than to internal structure — but it is the one line in
the corpus a reviewer could fairly argue with.

---

## Measured coupling across the corpus

Pass 2 run against every task's real verifier suite. Counts are occurrences in
`tests/test.patch` vs `instruction.md`.

| Task | Identifier | Verifier | Prompt |
| --- | --- | --- | --- |
| `openclaw` | `--max-runs` | 35 | 1 |
| | `--until` | 25 | 1 |
| | `--on-exhausted` | 15 | 1 |
| | `--clear-until` / `--clear-max-runs` | 4 / 4 | 1 / 1 |
| `medusa` | `credit_limit` | 51 | 2 |
| | `available_credit` | 23 | 2 |
| | `reference_id` | 15 | 2 |
| | `payment_terms` | 14 | 2 |
| | `405` | 5 | 1 |
| `nextjs` | `router.push` | 21 | 1 |
| | `navigationState` | 9 | 2 |
| | `useNavigationState` | 8 | 1 |
| `vite` | `winter-tc` | 24 | 1 |
| | `.fetch(` | 3 | 1 |

**Every accepted prompt states every name its verifiers lean on.** No exceptions across
five tasks — this is the property Pass 2 checks, and the corpus shows it holds
universally.

It also settles the `medusa` argument empirically: `credit_limit` carries 51 assertions.
An endpoint enumeration that dense is not the author over-specifying, it is the author
paying the mandatory cost of a broad public API surface. A review that tells them to trim
it is telling them to fail correct solutions.

Note the asymmetry — one or two mentions in the prompt sustain dozens of assertions. A
name needs to appear **once, unambiguously**. Repetition is not the goal; presence is.

---

# What a naive scoring rubric does to this corpus

Recorded from testing a 0–100 deduction rubric (built from the same `prompt-guide.md`
statistics) against all five. These are the receipts for why this skill emits a verdict
instead of a score.

| Prompt | Score | Fires on |
| --- | --- | --- |
| `vite-wintertc-middleware` | 85 | under 112-word floor −10; no backticks −10; scope line +5 |
| `medusa-b2b-credit-engine` | 80 | 11-bullet endpoint grid read as over-specification −20 |
| `nextjs-app-router-location-state` | 80–100 | below 190-word band; 5 bullets → grid? |
| `openclaw-bounded-recurrence` | 40–90 | first-person opener → preamble? unbacktick'd flags −10; "may" → hedging −15; regression guard −15 |
| `typeorm-class-table-inheritance` | 70–100 | five spec-level "should"s → hedging −15 |

**Spread on known-good material: 40–100, penalizing four of five accepted prompts.**

Four failure modes, each now a guard in `SKILL.md`:

1. **Descriptive statistics as prescriptive thresholds.** 190–470 is an interquartile
   range — half of merged prompts fall outside by construction. 72% backtick usage means
   28% do not, and two of five here have zero.
2. **API surface confused with edge-case enumeration.** The most damaging error, because
   acting on the finding breaks grading.
3. **Keyword-matched hedging and regression-guard detection.** Cannot see the must/should
   discipline in `typeorm`, the bounded permission in `openclaw`, or the "unless needed"
   clause the gate checklist actually carries.
4. **Missing most of the real gate.** Covers roughly four of the ten checklist items and
   never checks name coupling — the property that actually fails correct solutions.

The rubric's declared weights (25/25/30/20%) are also never applied; the deductions are
flat points. The arithmetic is decorative.
