---
researched: 2026-08-21
sources-current-as-of: 2026-08-21
refresh-when: claude code minor version bump, or 60 days
ticket: DOT-189
---

# Context Engineering and Agent Memory

Aimed at: a coordinator agent whose boot context has grown ~50k → ~67k tokens, looking for a lean, tailored memory system. Synthesized from Anthropic primary sources — no training-data guessing.

## 1. Context engineering principles

Anthropic frames **context engineering** as the successor discipline to prompt engineering: not just writing good instructions, but curating the *entire* token budget the model sees at inference — system prompt, tools, memory, message history, retrieved data. [Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) (Anthropic Engineering, Sep 2025) is the primary source; everything below is drawn from it unless cited otherwise.

**Core guiding principle:** find the *smallest possible set of high-signal tokens* that maximizes the probability of the desired outcome. Minimal ≠ short — you still need enough information to constrain behavior, but every token included should be pulling weight.

**Right altitude for system prompts.** There's a Goldilocks zone between two failure modes:
- Too low altitude: brittle, hardcoded if-else logic trying to enumerate every case → fragile, expensive to maintain.
- Too high altitude: vague guidance that assumes shared context the model doesn't have → the model has no concrete signal for what "good" looks like.
- The right altitude is specific enough to steer behavior, flexible enough to let the model use judgment. Organize into clear sections (`<background_information>`, `<instructions>`, `## Tool guidance`, `## Output description`) via XML tags or Markdown headers.

**Context rot.** As token count in the context window rises, recall accuracy falls — this holds across all models tested, some degrade more gently than others, but none are immune. Cause is architectural: transformer attention is O(n²) pairwise, so attention gets "stretched thin" as n grows; additionally, training data skews toward shorter sequences, so models have fewer specialized parameters for long-range dependencies. Anthropic's own research citation: [context rot study](https://research.trychroma.com/context-rot) (Chroma). This is not a hard cliff — it's a *performance gradient*: capability remains high but precision degrades for retrieval/long-range reasoning as context grows. Treat context as a finite resource with diminishing marginal returns, analogous to human [limited working memory](https://journals.sagepub.com/doi/abs/10.1177/0963721409359277) — an "attention budget" that every added token depletes.

**Just-in-time (JIT) retrieval vs. pre-loading.** Two philosophies:
- *Pre-inference retrieval* (traditional RAG-style): embed and pull relevant context before the turn starts.
- *JIT retrieval*: the agent keeps lightweight identifiers (file paths, stored queries, links) and dynamically loads data at runtime via tools, rather than stuffing everything up front. Claude Code does this for large-database analysis — write targeted queries, store results, use `head`/`tail`, never load full objects into context.
- JIT mirrors human cognition: we don't memorize corpora, we build external indexes (filesystems, inboxes, bookmarks) and retrieve on demand.
- Metadata itself carries signal: a file named `test_utils.py` under `tests/` implies something different than the same name under `src/core_logic/`. Naming, folder hierarchy, timestamps are "free" context for both humans and agents (**progressive disclosure**).
- Trade-off: JIT is slower (runtime exploration) and requires the agent to have well-designed navigation tools/heuristics, or it wastes context chasing dead ends.
- **Hybrid is common and often best.** Claude Code itself is hybrid: `CLAUDE.md` is naively pre-loaded (stable, low-dynamism content), while `glob`/`grep` retrieve files just-in-time (avoids stale indexing). Anthropic's advice: "do the simplest thing that works," and expect the need for pre-loading to shrink as models get smarter and more able to navigate autonomously.

**Tool design as context hygiene.** Bloated tool sets with overlapping functionality are one of the most common failure modes — "if a human engineer can't definitively say which tool applies, neither can the agent." A minimal, non-overlapping toolset is itself a context-engineering lever, not just a UX nicety (ties directly to your "deferred tools" pattern already in use).

## 2. Memory tool / memory directory pattern

Source: [Memory tool docs](https://docs.claude.com/en/docs/agents-and-tools/tool-use/memory-tool) (Claude Platform Docs) and the same Anthropic engineering post.

- The `memory_20250818` tool is **generally available** on the Messages API (no beta header needed) for Claude 4+ models. It gives Claude `view`/`create`/`str_replace`/`insert`/`delete`/`rename` operations over a `/memories` directory.
- It's **client-side**: Claude only issues file-operation requests; your application executes them against storage you control (local disk, DB, cloud). This is the "lighter than rolling your own RAG" framing — no embeddings, no vector DB, just files.
- **Protocol Claude follows automatically** (auto-injected into system prompt when the tool is present): "ALWAYS VIEW YOUR MEMORY DIRECTORY BEFORE DOING ANYTHING ELSE" — check for earlier progress, record status as you go, assume interruption/context-reset at any moment.
- **When to read vs. search:** the doc frames the whole point as *just-in-time* — Claude doesn't load all memory up front, it `view`s the directory listing first (cheap: filenames + sizes, 2 levels deep), then selectively opens files relevant to the task. This is the built-in analogue of an index-plus-leaf pattern: directory listing = index, individual files = leaves loaded only when needed.
- Practical constraints worth knowing: files >16,000 chars get truncated on `view` (use `view_range` to page); `create` differs by implementation on whether it overwrites; you're responsible for size caps, expiration/pruning of stale files, and path-traversal validation (`/memories/../../secrets` class attacks) — none of that is enforced server-side.
- **Multisession pattern Anthropic explicitly recommends** ("Multisession software development pattern" in the docs): an *initializer session* sets up memory deliberately before work starts — a progress log, a feature checklist, a reference to any init script — rather than writing memory ad hoc as you go. Every subsequent session opens by reading those files first (restores state without re-exploration), and does an end-of-session update to the progress log before finishing. Key discipline: mark work "done" only after end-to-end verification, not when code is written — keeps the log trustworthy. Full case study: [Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents).
- Memory pairs with **context editing** (server-side clearing of stale tool-call/thinking blocks) and with **compaction** (see §3) — Anthropic's explicit recommendation for long-running agents is to use *both*: compaction keeps active context small without client bookkeeping, memory preserves what must survive summarization. Reported gains: 39% improvement combining context editing + memory tool over baseline (vs. 29% for context editing alone) — per search-result summary of Anthropic's Sonnet 4.5 launch material.

## 3. Compaction and summarization

Source: [Compaction docs](https://platform.claude.com/docs/en/build-with-claude/compaction) (beta, `compact-2026-01-12`) and the engineering post's "long-horizon tasks" section.

**How it works (Claude Code's implementation, per the engineering post):** message history is passed to the model to summarize; the model is instructed to preserve architectural decisions, unresolved bugs, and implementation details while discarding redundant tool outputs/messages. Continuation happens with the compressed summary **plus the 5 most recently accessed files** kept verbatim.

**What gets lost / what to tune for:** Anthropic's explicit guidance for engineers building compaction — tune the summarization prompt on real complex traces, *maximize recall first* (capture everything that might matter), then iterate down to precision (cut the superfluous). The single safest, lowest-risk form of compaction they call out is **tool-result clearing**: once a tool call is deep in history, the raw result rarely needs to stay verbatim — clear it while keeping the call/intent.

**API mechanics (compaction beta):**
- Trigger on an input-token threshold (default 150k, minimum 50k configurable).
- Produces a `compaction` content block wrapping a `<summary>` — this replaces everything before it; you must pass the compaction block back in `messages` on the next call, and the API drops everything prior to it.
- `pause_after_compaction` lets you intervene — inject verbatim "keep these N messages" content after the auto-summary before continuing, useful for guaranteeing recent exchanges survive verbatim rather than being summarized away.
- `instructions` fully *replaces* (not appends to) the default summarization prompt — if you customize it, you own the recall/precision tradeoff entirely. Documented failure mode: with tools defined, the model can call a tool mid-summarization instead of writing text, yielding a `null` summary — mitigate by explicitly instructing "do not call tools while writing this summary."
- Compaction is billed as an extra sampling step; usage shows up in `usage.iterations`, separate from top-level `input_tokens`/`output_tokens`.

**Writing handoff/continuation artifacts that survive compaction:** the practical implication for your CST/handoff pattern is exactly the memory-tool multisession pattern above — anything that must survive should be written to a *persisted file*, not left to hope the summarizer keeps it. Compaction summaries are lossy and best-effort; memory files are the durable layer. Cache the compaction summary block itself (`cache_control` on it) if it will be re-read across turns — see §4.

## 4. Prompt caching

Source: [Prompt caching docs](https://platform.claude.com/docs/en/build-with-claude/prompt-caching).

**Mechanics:** cache breakpoints are set via `cache_control` on a content block (system/tools/messages, checked in that hierarchy — tools → system → messages). A write happens *only* at the exact block marked; a read requires the *cumulative hash* of everything from the start up to and including that block to match a prior write. The system does **not** search for "stable content behind the breakpoint" — it only finds prior *writes*, walking backward at most 20 blocks (lookback window) from the current breakpoint.

**TTL:** default 5 minutes, refreshed on each hit at no extra cost (lifetime measured from request start, not response end — a 4-minute stream leaves ~1 minute before the next request must land to hit). 1-hour TTL available at 2x write cost, for cadences slower than 5 min. Cache read cost ≈ 0.1x base input price; 5-min write ≈ 1.25x; 1-hour write ≈ 2x.

**What invalidates the cache** (table in the doc, condensed):
- Tool definition changes → invalidates tools + system + messages caches entirely (the whole hierarchy below it).
- System prompt changes, web-search toggle, citations toggle, speed setting → invalidate system + messages, tools cache survives.
- `tool_choice` changes, images added/removed → invalidate messages cache only.
- Thinking config / effort setting changes → always invalidate messages; model-specific on tools/system.
- **Common mistake explicitly documented:** putting the breakpoint on a block that changes every request (e.g., a timestamp or the live user message appended after a static system block). The lookback walks backward but finds *no prior write* at those earlier positions (because writes only happen at breakpoints), so you get a cache miss and a fresh write **every single request** — the worst case, paying write-price repeatedly with zero read benefit. Fix: put the breakpoint on the last block that is identical across the calls you want to share a cache, i.e., end of the static prefix.

**Why a stable system-prompt prefix matters:** this is the direct lever for cost — a system prompt (or memory-derived boot content) that mutates on every turn/session never accumulates cache hits; one that stays byte-identical across many calls gets nearly free re-reads (0.1x price) after the first write. Compaction interacts with this directly: the doc recommends putting a *separate* `cache_control` breakpoint at the end of the system prompt so that when a compaction summary is injected (new content), only the summary needs a fresh write — the system prompt cache stays valid and isn't invalidated by unrelated churn later in the prompt.

**Implication for how often you mutate memory files:** since boot context (CLAUDE.md + memory index + any pre-loaded rules) is presumably concatenated into or near the system prompt on every coordinator turn, every edit to those files during a session effectively invalidates the cached prefix on the *next* call after the edit (new bytes → new hash → miss → fresh write). This argues for: (a) editing memory/boot files in batches, not continuously mid-session; (b) keeping frequently-churned material (session-scoped scratch notes, in-progress facts) *out* of the boot-context path and in on-demand files instead, so the stable prefix (rules, identity, index) doesn't get invalidated by volatile content; (c) placing volatile content, if it must be in-context, *after* a dedicated breakpoint so only that tail gets rewritten.

## 5. Structuring memory for retrieval

Cross-referencing the memory-tool docs' directory-listing behavior with the engineering post's "progressive disclosure" framing:

- **Index-plus-leaf.** `view /memories` returns a cheap directory listing (filenames + sizes, 2 levels deep) before any file content is read — this is a built-in index. The equivalent pattern for a hand-rolled memory system (like the current `MEMORY.md`) is exactly what's already in place: one index file with one-line summaries linking to leaf files, so the model reads ~N lines to decide what's worth opening rather than paying for every fact's full text on every boot.
- **One-fact-per-file** (or one-topic-per-file) lets the agent open only the leaves it needs — this is what the JIT/progressive-disclosure principle argues for structurally: granular files, not monolith documents, so partial relevance doesn't force loading irrelevant adjacent content.
- **Frontmatter/description for relevance:** the docs don't prescribe a frontmatter schema (that's your own convention, as seen in `MEMORY.md`'s bracket-link + short-gloss format), but the underlying principle — filenames and short descriptors act as retrieval signal without opening the file — is exactly the "metadata carries meaning" point from the engineering post (test_utils.py under tests/ vs core_logic/). A consistent, greppable naming convention is doing real retrieval work, not just organization.
- **Linking between memories:** not natively supported by the memory tool (no graph/relation primitive) — links are just text references the agent reads and follows manually via `view`. So cross-linking is a convention you enforce in file content, not something the tool infrastructure gives you for free.
- **What to NOT store:** the docs are explicit — Claude will usually refuse to write sensitive data itself, but that's not a guarantee; validate/strip PII before persisting. Beyond security: don't store anything that's cheaply re-derivable by querying live state (the existing `pm-scrape-strategy` memory — "state always queried fresh, never answer board state from memory" — is precisely the right instinct: memory should hold *conventions and facts about how things work*, not a cache of external system state that can drift and go stale). Anthropic also calls out periodic expiration of files that haven't been read in a long time — memory that's never retrieved is pure boot-context tax with no offsetting value.

## 6. Concrete diet techniques for a bloated boot context

Drawing together the JIT-retrieval principle (§1), the memory-tool's lazy-view behavior (§2), and Claude Code's own hybrid model (CLAUDE.md pre-loaded, everything else via glob/grep):

1. **Measure what's resident.** Before cutting anything, get an actual token count of what's concatenated into the boot/system context today (CLAUDE.md + memory index + any skill/tool descriptions that are always-loaded rather than deferred). You can't diet what you haven't weighed — the existing `explain-usage` skill or the token-counting endpoint (`/v1/messages/count_tokens`, mentioned in the compaction docs) does this.
2. **Split always-loaded rules from on-demand ones.** The single highest-leverage move per Anthropic's own architecture: CLAUDE.md-style files stay pre-loaded only because they're small, stable, and near-universally relevant; anything narrower (a specific workflow, a specific integration's quirks) belongs in a file that's *referenced* from the index but opened only when that workflow is actually invoked.
3. **Defer tools aggressively** (already partially in place via the deferred-tool mechanism seen in this very session) — a bloated tool list is called out explicitly as a common failure mode and a direct token cost, independent of memory files.
4. **Convert content into pointers.** Where a memory file currently holds prose explanation, replace with a one-line pointer ("see docs/X for the how") — this is the index-plus-leaf pattern applied ruthlessly. The index should be readable in a few seconds; detail lives one hop away.
5. **Move session-scoped/volatile facts out of the boot path.** Anything that changes within a session (in-progress task state, temp findings) shouldn't sit in the same file that's concatenated into every system prompt — keep it in a scratch/leaf file read only when relevant, both for context-rot reasons (§1) and for prompt-cache stability (§4): volatile content in the stable prefix kills cache hit rate for everything after it.
6. **Prune dead memory.** Anthropic explicitly recommends expiring files that haven't been accessed in a long time — an index entry that's never followed is a permanent boot-context tax; run a periodic reflective pass (the `consolidate-memory` skill already exists for this) to merge duplicates and cut stale entries.
7. **Lazy-load skills instead of pre-loading their full bodies.** Skill descriptions (one line each) are cheap; full skill bodies should load only on trigger — this mirrors the memory tool's own directory-listing-before-content-view behavior and is the direct analogue for a skills system.
8. **Coordinator vs. coder split** — see §7 below; the biggest single diet move available to a *coordinator* specifically is recognizing that most of what currently sits in its always-loaded memory is actually coder-shaped detail it doesn't need at all.

## 7. Coordinator vs. coder: what belongs in always-loaded memory

Evidence-backed synthesis (no single Anthropic doc states this split directly — it's the direct application of §1's "right altitude" + JIT-retrieval principle, plus the sub-agent architecture section of the engineering post, to two different agent roles):

**The structural argument from Anthropic's own sub-agent pattern:** in the multi-agent research system, sub-agents "may use tens of thousands of tokens" internally but return only a condensed 1,000–2,000 token summary to the lead agent — "clear separation of concerns: detailed search context remains isolated within sub-agents, while the lead agent focuses on synthesizing and analyzing results" ([multi-agent research system post](https://www.anthropic.com/engineering/multi-agent-research-system), referenced from the context-engineering post). A coordinator is structurally the "lead agent" in this pattern; a coder is structurally closer to the "sub-agent" doing deep, narrow, tool-heavy work.

**What this implies for always-loaded memory:**

- **Coordinator's boot context should be identity + routing + protocol, not domain detail.** It needs: who it is, what tools/agents/skills exist and when to reach for each (routing table, not implementation), cross-cutting safety rules (no destructive ops, no clobbering), and the *index* to everything else. It does not need the deep how-to for any single domain — e.g., it needs to know "PM state is queried live, never from memory" (a routing/discipline rule) but not the full Linear query syntax (that's coder/skill-shaped detail pulled in only when a PM task fires).
- **A coder agent's always-loaded context should be narrower but deeper** — the specific codebase's conventions, build/test commands, the mirror rule, the manifest engine's logic — because a coder spawned for a task is *already* scoped to that task; it doesn't need a routing table across unrelated domains (tracker, skills-sync, wrap ritual) that a coordinator carries. Its "index" is smaller because its task is smaller, but what it does load can be more detailed per-topic since there's no cross-domain competition for attention budget.
- **Concretely for this repo:** the coordinator (dpatch) memory index currently mixes identity/safety/spawning rules (correctly always-loaded — cross-cutting, small, stable) with what look like domain-specific procedural facts (PM label conventions, skill-sync mechanics, specific ticket-numbered reminders) that are better modeled as *leaf files linked from the index*, read only when a PM or skill-sync task actually fires — exactly the JIT pattern in §1. The "⭐" and "📌" markers already visible in MEMORY.md are doing informal prioritization; formalizing that into "always-resident index entry (one line) vs. leaf file opened on trigger" is the concrete mechanism, and it's the same mechanism the memory tool itself uses natively (directory listing vs. file view).
- **Anti-pattern to avoid:** pre-loading a coder's deep tooling knowledge into the coordinator "just in case it needs to explain something," or pre-loading the coordinator's full cross-domain routing table into every spawned coder. Both violate "smallest set of high-signal tokens for the outcome at hand" — the outcome for a coordinator turn is routing/orchestration; the outcome for a coder turn is a specific code change. Different outcomes justify different resident context.

## Diet plan — ordered moves with expected savings

Rough estimates; validate against an actual token count of the current MEMORY.md + CLAUDE.md concatenation before committing to numbers.

1. **Measure baseline precisely** (token-count the exact boot concatenation, not an estimate). *Savings: 0 tokens, but required — everything else is guesswork without it.*
2. **Convert every memory-index entry from "explanation" to "one-line pointer + link"** where it currently isn't already. Several entries in MEMORY.md already do this well (bracket-link format); audit for any that have drifted into inline prose and trim to a pointer. *Estimated: 2-5k tokens if a handful of entries have crept long.*
3. **Pull ticket-numbered/time-boxed reminders (⏰ items) out of the permanent index into a separate "active reminders" leaf file**, keeping only a one-line "see reminders.md" pointer in the index. These are inherently temporary and don't belong competing for attention budget in the always-loaded path. *Estimated: 1-2k tokens, plus a correctness win (stale ⏰ items stop bloating every boot).*
4. **Split domain-specific procedural knowledge (PM/Linear conventions, skill-sync drift mechanics, domain-modeling fleet detail) into leaf docs referenced by one line each**, loaded only when that skill/task fires — this is already partly true (x:pm owns the operating contract) but MEMORY.md still carries a dozen PM-specific bullet facts that could be one pointer to x:pm's own doc. *Estimated: 3-6k tokens — likely the single biggest line item, since PM/skills sections are the densest part of the current index.*
5. **Prune or merge duplicate/stale facts via a `consolidate-memory` pass** (skill already exists) — run it now given the 50k→67k drift, not just periodically. *Estimated: 1-3k tokens depending on accumulated drift.*
6. **Stabilize the boot prefix for prompt-cache benefit**: ensure whatever *does* stay always-loaded is edited in batches (not per-turn), and that any genuinely volatile content (session scratch, in-flight task state) lives after a separate cache breakpoint or outside the system-prompt path entirely. *Savings: not token-count reduction, but cost/latency reduction on every subsequent call in a session — compounds with move 2-5 since a smaller stable prefix is cheaper to rewrite on each edit.*
7. **Adopt the memory-tool's index-before-content discipline explicitly as a boot rule**: coordinator reads the index (cheap) and only opens leaf files when a task actually touches that domain, rather than a habit of loading "just in case" context. *Savings: this is behavioral, not structural — but it's what prevents the diet from re-bloating after moves 1-5.*
8. **Re-measure after each move** and stop once back near the ~50k baseline or the point of diminishing returns — remember context rot is a gradient, not a cliff, so there's no need to over-optimize past "comfortably lean."

## Sources

- [Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) — Anthropic Engineering
- [Memory tool](https://docs.claude.com/en/docs/agents-and-tools/tool-use/memory-tool) — Claude Platform Docs
- [Compaction](https://platform.claude.com/docs/en/build-with-claude/compaction) — Claude Platform Docs
- [Prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching) — Claude Platform Docs
- [Context rot research](https://research.trychroma.com/context-rot) — Chroma (cited by Anthropic)
- [How we built our multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system) — Anthropic Engineering
- [Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents) — Anthropic Engineering
