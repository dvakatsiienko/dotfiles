---
researched: 2026-08-30
method: anthropic primary sources only — claude.com blog, support.claude.com help center, official release notes. no execution, no third-party press.
dies-when: the memory-bridge procedure (`cclio/docs/procedures/memory-bridge-refresh-cw.md`) encodes the verdict below
---

# cw memory regeneration — does anything rewrite our lines?

claim tags: **[docs]** stated in an anthropic primary source · **[inferred]** reasoning from
those sources, not stated · **[verified]** we measured it ourselves · **[unknown]**

## verdict

✅ **the nightly regeneration is gone, and it was removed on purpose.** anthropic replaced the
daily-summary memory format with individual entries on **2026-07-10**. nothing in current anthropic
documentation describes a scheduled, background, or automatic rewrite of memory entries.

📌 the one real risk left is not a schedule — it is **an agent turn**. memory is written and updated
*during conversations*, by the model. any cw thread that decides an entry is stale can rewrite the
line. that is the same failure mode as a human edit, just faster.

## what the sources say

### 1. the format change — the nightly regen was retired

- **[docs] 2026-07-10, official release notes** — «updated memory for claude»: the system moved to
  «a set of individual, categorized entries that Claude reads and updates during your
  conversations», **replacing the previous format based on daily summaries**.
  → the "daily summaries" wording is the old nightly job. it is named as the thing that was replaced.
- **[docs] 2026-08-25, claude.com blog** — «Claude now adds topics to memory as you chat, instead of
  summarizing conversations after they end.»
- **[docs] help center, current** — «Claude saves memory as a set of individual topics as you chat,
  rather than summarizing conversations after they end.» and «Claude's memory reflects changes to
  your conversations as they happen.»

📌 **no anthropic source mentions any scheduled job**: no nightly regeneration, no consolidation
pass, no periodic summarisation, no "memory refresh". checked the blog post, the release notes
index, the chat-search-and-memory article, the cowork-projects article, and the import/export
article. **[inferred]** absence across five primary sources is strong, not proof — anthropic does
not document internal maintenance jobs either way.

### 2. one store, shipped 2026-08-25

- **[docs] release notes 2026-08-25** — «memory in claude cowork, editable topics, and a sensitive
  topics setting». memory now works across both chat and cowork **in the cloud**.
- **[docs] blog, same date** — «Cowork now has memory, and it's the same one you use in chat» ·
  «what comes up in Cowork carries back to chat.»
- **[docs] help center** — «What Claude remembers from your chats is available when you hand it a
  task in Cowork in the cloud, and what comes up in a Cowork task carries back to chat.»

so: **one global store, shared chat ↔ cowork.** dima's hypothesis is confirmed and dated.

### 3. the partitioning that survives — read this before trusting a bridge write

two carve-outs remain, and both matter to us:

- **[docs] projects are separate stores.** «Each project has its own separate memory space and
  dedicated project summary, so the context within each of your projects is focused, relevant, and
  separate from other projects or non-project chats.» for cowork projects: «Memory is scoped to the
  project, so what Claude learns in one project doesn't carry over to others.»
  → ⚠️ **a line written into global memory is not visible inside a cowork project thread.** if the
  bridge targets global entries and dima works in a project, the bridge misses.
- **[docs] local cowork has no memory at all.** «Memory across Cowork and chat only works when
  Cowork runs in the cloud. It isn't available in Cowork sessions that run locally on your
  computer.»
  → the bridge only reaches **cloud** cw sessions.

### 4. who rewrites a line

- **[docs]** entries are «read and update[d] during your conversations» — the writer is the model,
  inside a turn, in response to what is being said.
- **[docs]** the user can edit or delete any entry by hand under settings → memory → topics.
- **[docs]** import filters: «Claude may not retain imported personal details unrelated to work.»
  → **[inferred]** a work-focus filter runs on the *import* path. no source says it runs on
  existing entries.
- **[unknown]** whether a model turn that updates a topic rewrites the whole entry file or appends.
  our own measurement suggests it does not touch untouched lines.

### 5. our own evidence

- **[verified] 2026-08-28 → 2026-08-30, 2 days** — 12 entries, 145 `[stated]` lines byte-identical.
  no regeneration observed. consistent with the documented design.

## the bridge assumption

**«written lines persist verbatim until a user or agent edits them» — safe.** ✅

it is safe for the reason the docs give, not by luck: there is no scheduled writer in the system
anymore. the only writers are a conversation turn and dima's hand.

## recommendation

✅ **stop the daily probe.** documentation-grade confirmation plus 2 days of byte-identical
measurement is enough. a probe that repeats a settled answer is cost with no signal.

📌 **one probe of a different shape is worth running once** — not a persistence probe, a
**collision probe**. persistence is answered; what is unanswered is what happens when a cw turn
decides one of our entries is stale.

- shape: in a cloud cw thread, talk *around* a topic one of our `[stated]` lines covers, in a way
  that invites an update. then diff the entry.
- what it tells us: whether a model-side update rewrites the whole entry (our lines lost) or edits
  narrowly (our lines survive).
- 📌 this is the actual bridge risk. the nightly job never was.

**and re-probe on a trigger, never on a clock:** a memory-related line in the release notes, or the
first byte-diff we ever see.

## sources

- [release notes — anthropic help center](https://support.claude.com/en/articles/12138966-release-notes) — 2026-07-10 and 2026-08-25 entries
- [claude's memory works everywhere, and you decide what's in it](https://claude.com/blog/claudes-memory-works-everywhere-and-you-decide-whats-in-it) — 2026-08-25
- [use claude's chat search and memory to build on previous context](https://support.claude.com/en/articles/11817273-use-claude-s-chat-search-and-memory-to-build-on-previous-context)
- [organize your tasks with projects in claude cowork](https://support.claude.com/en/articles/14116274-organize-your-tasks-with-projects-in-claude-cowork)
- [import and export your memory from claude](https://support.claude.com/en/articles/12123587-import-and-export-your-memory-from-claude)

📌 **not used as evidence:** the change was also covered by the new stack, engadget, 9to5mac and
androidheadlines on 2026-08-25. press-grade, flagged, load-bearing on nothing here.
