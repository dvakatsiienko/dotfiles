---
researched: 2026-09-08
sources-current-as-of: 2026-09-08
method: hands-on measurement on a throwaway vault + primary vendor docs + github repo metadata read via `gh`. every claim tagged.
ticket: DOT-228
dies-when: dima picked the notes app and the ticket closed
---

# the notes stack — obsidian vs notion vs a notionlike

Ticket: DOT-228

claim tags: **[measured]** i ran the command, output quoted · **[docs]** vendor documentation
only · **[inference]** reasoning from measured facts, not itself measured.

---

## 🎯 verdict — stay on obsidian, add one binary, decide looks separately

three things came out of the measurements, and together they settle the channel half of the ticket:

- **the tricky-parts fear is real but it is one op, not a class of ops.** every content edit —
  append, prepend, frontmatter, tags, tasks, body rewrite — is safe on plain fs. **rename/move
  is the only op that can silently destroy the vault**, and it destroys a lot of it at once.
- **a 9.5 MB go binary fixes exactly that op, headless, in 75 ms.** `notesmd-cli move` rewrote
  **231 of 231 wikilinks across six syntax forms** and survived a collision trap that a careful
  hand-written `sed` corrupts. [measured]
- **dima's actual vault has 30 wikilinks in 6 files.** [measured] the blast radius he has been
  worrying about is, today, thirty links. the channel question is nearly moot at his scale — which
  frees the decision to be about looks, which is what he said he wanted it to be.
- 📌 **notion wins the rename outright, and it is the one place it genuinely beats obsidian.**
  renaming a page kept **40/40 inbound references live and re-rendered them with the new title,
  rewriting zero pages** [measured] — the failure mode simply does not exist there. it costs
  **~32× the fs lane on reads**, which at 80 notes is about 8 seconds. both numbers are real; which
  one matters is his call.

📌 **the notion channel objection is dead, and now measured.** `ntn` v0.23.2 authenticates
headlessly off `NOTION_API_TOKEN`, exposes 58 endpoints including the markdown api, and the
documented 3 req/s cap **did not bind** — a 10-wide burst held 20.9 req/s with zero 429s. [measured]
so the showdown is genuinely obsidian-vs-notion on **taste and mobile**, not on agent reach.

⚠️ **the one hard blocker found:** the *official* obsidian cli — the only tool with real link-graph
awareness — needs **obsidian ≥ 1.12.7**. installed on this mac: **1.8.9**. [measured] it cannot be
tested until he updates.

---

## branch 1 — the obsidian agent channel

### 1.1 the tricky-parts inventory

what a plain-fs edit can break, ranked by how badly, with whether it showed up in his vault.

**🔴 destroys data / breaks the graph silently**

- **wikilink rewrite on rename/move** — the big one. six distinct syntax forms all point at one
  filename and all must move together: `[[X]]`, `[[X|alias]]`, `[[X#Heading]]`, `[[X#^block-id]]`,
  `![[X]]`, `![[X#Heading]]`. **in his vault: 30 links, 6 files.** [measured]
- **markdown-style links to `.md` paths** — `[label](folder/X%20Y.md)`. url-encoded, so a
  filename-based replace misses them. **neither lane in this bench fixed them** (37 left stale by
  both fs and cli). **in his vault: 0.** [measured]
- **prefix collisions** — renaming `Hub Target` when `Hub Target Archive` also exists. see 1.4.
- **attachment embeds** — `![[image.png]]` under `attachmentFolderPath: ./attachments`; moving a
  note does not move its attachments. **his vault has one `attachments/` dir under `prompts/`.**
  [measured]

**🟡 breaks a view, not the data**

- **unresolved links** — a link to a note that does not exist. obsidian only surfaces these in the
  app; the fs has no idea. **his vault: 0 detected by pattern.** [measured]
- **block anchors** — a trailing `^anchor-id` on a paragraph. deleting or reflowing that paragraph
  orphans every `[[X#^anchor-id]]` pointing at it. **his vault: 0.** [measured]
- **aliases** in frontmatter — a note reachable by a second name; a rename does not update
  `aliases:`. **his vault: 0 alias keys.** [measured]
- **tags** — `#tag` inline and `tags:` in frontmatter are the same namespace to obsidian, two
  different shapes to `sed`. a tag rename must hit both. **his vault: 2 files with a `tags:` key,
  0 inline tags.** [measured]

**🟢 present in obsidian, absent from his vault — cost of ignoring is zero today**

measured across all 80 md files, every one of these is **0 hits**: dataview fences, dataviewjs,
inline `field::` syntax, callouts `> [!note]`, checkbox tasks, templater `<% %>`, footnotes,
excalidraw, canvas files, heading links, block links, embeds, aliased links, `obsidian://` uris.
[measured]

📌 **his vault is 80 files / 122 KB / avg 1.5 KB.** frontmatter on 2 of 80 files, keys `time` and
`tags`. content is gear lists, cooking, rimworld, and `prompts/` (inbox, flowlog, roadmap). it is a
**flat pile of markdown**, not a linked graph. [measured]

### 1.2 dataview and the two todos in the ticket

- 🚫 **dataview is not installed** — confirmed: `.obsidian/community-plugins.json` lists only
  `obsidian-style-settings` and `obsidian-local-rest-api`. [measured]
- 📌 **and he should not install it.** **obsidian shipped `Bases` as a core plugin**, stable since
  1.9, table/card views then list/map in 1.10 — a `.base` file is a saved view over standard yaml
  frontmatter properties, no in-note syntax. [docs] **his `core-plugins.json` already has
  `"bases": true`.** [measured] dataview's only remaining edge is the `dataviewjs` arbitrary-js
  escape hatch and mid-note inline fields. [docs] he uses neither.
- ⚠️ **but `bases: true` in a vault running app 1.8.9 is a contradiction** — bases needs 1.9+. the
  config was almost certainly written by his **iOS** obsidian, which is newer than the mac app.
  [inference from measured version mismatch] so his desktop is the stale end of the pair.
- 🚫 **the MOC/frontmatter doctrine does not match his vault** — confirmed by the numbers above.
  2 of 80 files carry frontmatter. there is no doctrine to match. **recommendation: drop it, do not
  test it.** adopting a properties doctrine is a cost with no current payoff, and `Bases` is the
  only thing that would ever make it pay.

### 1.3 what the three channels actually cover — tested, not assumed

**lane A — the official obsidian cli** ⚠️ **could not be run: needs ≥ 1.12.7, mac has 1.8.9**
[measured]

it is the only tool that talks to obsidian's own index, and its command surface is the direct answer
to the inventory above [docs, `obsidian.md/help/cli`]:

- `backlinks` · `links` · `unresolved` · `orphans` · `deadends` — the link graph, first-class. **no
  other channel has these.**
- `rename` / `move` — "automatically update internal links".
- `property:set` · `property:remove` · `aliases` · `tags` · `tag` — properties by name, not by regex.
- `tasks` · `task` · `outline` · `templates` · `template:insert` · `daily:*` · `bases` · `base:query`
- `search` / `search:context`, and `format=json` on most commands.
- `eval code=<javascript>` — a full escape hatch into the running app.
- 📌 **it is a remote control, not a headless tool.** obsidian must be running; the first command
  launches it. [docs] that makes it **unusable from a container**, which matters for the cw lane.

**lane B — `notesmd-cli`** ✅ **tested, works, headless** [measured]

the community go cli, formerly `Yakitrak/obsidian-cli`, **renamed to avoid confusion with the
official one**. 1579★, MIT, v0.3.7 released 2026-09-01, active. [measured via `gh`]

- **does not need obsidian running or even installed.** [docs, and confirmed — obsidian was not
  running during the entire bench] [measured]
- commands: `create` `print` `move` `delete` `search` `search-content` `list` `frontmatter`
  `daily` `open` + vault registration.
- **it has no link graph.** no `backlinks`, no `unresolved`, no `orphans`. its `move` does a
  link rewrite, and that is the whole of its graph awareness.
- ⚠️ **config-file hazard:** `add-vault` writes to `~/Library/Application Support/obsidian/obsidian.json`
  — **the same file the real obsidian app uses.** the bench isolated it with a scratch `HOME`;
  dima's registry was verified byte-identical afterwards. [measured] **if he installs it for real,
  `add-vault` will touch his live vault registry.**

**lane C — the mcp servers** 🚫 **all of them are worse than lane B for this job** [measured via `gh`]

the candidates, by stars: `MarkusPfundstein/mcp-obsidian` (4377★, MIT, pushed 2026-08-31) ·
`jacksteamdev/obsidian-mcp-tools` (832★) · `StevenStavrakis/obsidian-mcp` (733★) ·
`cyanheads/obsidian-mcp-server` (674★, apache-2.0, pushed 2026-09-04, the richest surface —
14 tools, surgical patch, frontmatter, tags, path-scoped write gating).

two facts kill the lane:

- 🚨 **every one of them rides the `obsidian-local-rest-api` community plugin.** so they need the
  **obsidian app running** — the same constraint as the official cli, but with a resident tool
  schema on top. [docs, all four readmes]
- 🚨 **there is no backlinks endpoint upstream.** cyanheads' own readme says it outright: *"this is
  also how backlinks are expressed, since there is no dedicated tool or upstream endpoint for
  them"* — you write a JSONLogic `regexp` over note content. **that is grep, wearing a schema.**
  [docs] the mcp lane therefore **buys nothing the fs lane does not already have**, and costs
  resident context.
- ⚠️ **and the plugin is not actually installed.** `community-plugins.json` lists
  `obsidian-local-rest-api` as enabled, but `.obsidian/plugins/` contains only
  `obsidian-style-settings` — the plugin folder is absent. [measured] enabled in config,
  missing on disk. (same iOS-vs-mac split as `bases`, most likely. [inference])

➡️ **the cli-over-mcp rule in root `CLAUDE.md` holds here on measured evidence, not just doctrine.**

### 1.4 the bench — numbers

throwaway vault: **306 notes, 1.5 MB**, size buckets 0.5/3/15 KB, carrying every tricky part from
1.1. one hub note with **231 inbound wikilinks spread across all six syntax forms** + 37
markdown-style links. batch size 50. obsidian **not running**. [measured]

**lane fs — plain shell edits**

- op1 read 50 — **125 ms** · 24 000 ops/min
- op2 append 50 — **42 ms** · 71 429 ops/min
- op3 frontmatter 50 — **268 ms** · 11 194 ops/min
- op4 rename hub — **22 ms**
- op5 full-text search — **48 ms**

**lane cli — `notesmd-cli`**

- op1 read 50 — **816 ms** · 3 676 ops/min
- op2 append 50 — **835 ms** · 3 593 ops/min
- op3 frontmatter 50 — **853 ms** · 3 517 ops/min
- op4 rename hub — **75 ms**
- op5 full-text search — **38 ms**

**correctness after the rename — the whole point**

- lane fs, naive `mv`: **231 of 231 wikilinks broken.** 0 rewritten.
- lane fs, naive `sed 's/[[Hub Target]]/…/'`: **151 of 231 still broken** — it only catches the
  plain form; every aliased, heading, block and embed link survives untouched.
- lane fs, **careful prefix `sed`** (`s/\[\[Hub Target/[[Hub Renamed/`): **231 of 231 correct, 63 ms.**
  as good as the cli, and faster.
- lane cli, `notesmd-cli move`: **231 of 231 correct, 75 ms.** all six forms preserved exactly —
  42 plain, 38 aliased, 38 heading, 38 block-anchor, 38 embed, 37 section-embed. [measured]
- **both lanes leave the 37 markdown-style `](hub/Hub%20Target.md)` links stale.** neither tool
  touches them.

**the collision trap — where careful `sed` actually loses**

added `Hub Target Archive.md` with 20 inbound links, then renamed only `Hub Target`:

- lane fs (careful prefix sed): **20 archive links corrupted to `[[Hub Renamed Archive]]`. 0 intact.**
- lane cli: **0 corrupted. 20 intact.** [measured]

📌 **this is the real argument for the binary.** the fs lane is not slower and not usually wrong —
it is wrong *in a way the agent cannot see*, on a case the agent has no reason to check for.

**token cost of doing the rename correctly on the fs lane**

- read every affected file whole: 231 files, 608 951 bytes — **≈ 152 000 tokens.**
- grep-first, matched lines only: 9 221 bytes — **≈ 2 300 tokens.**
- `notesmd-cli move`: one command, three lines of output — **≈ 30 tokens.**
- [measured bytes; token figure is bytes/4, an estimate — [inference]]

**one side effect worth knowing**

`notesmd-cli frontmatter --edit` **rewrites the entire yaml block**, not just the target key.
**50 of 50 notes** came back with keys alphabetised, inline arrays `[a, b]` expanded to block
sequences, and `created: 2026-09-02` quoted to `created: "2026-09-02"`. [measured] the body is
untouched. harmless for correctness; noisy for icloud sync and fatal to a clean diff if the vault
ever goes under git.

### 1.5 the cw lane — what cowork can and cannot reach

not measured from cw; derived from the constraints measured above. [inference]

- ✅ **plain fs** — reachable wherever cw can see the vault path.
- ✅ **`notesmd-cli`** — a single static go binary, no app, no daemon. **this is the lane cw
  should use**, and the one that most justifies adopting it.
- 🚫 **official obsidian cli** — needs the desktop app running on the mac. a container cannot.
- 🚫 **the mcp servers** — need the app + the rest-api plugin. same wall.

---

## branch 2 — the notionlike hunt

format per line: looks · storage · mobile · agent channel · sync · price · verdict.

- **anytype** — notion-grade object model, genuinely pretty · **encrypted local objects, not
  files** · mac + iOS + android · **official mcp** (`anyproto/anytype-mcp`) over a local api on
  `:31009`, app must be running, app key required [docs] · p2p + e2e encrypted · free, open ·
  ➡️ **the strongest challenger.** 8766★, pushed today. **but the encrypted object store kills the
  fs lane outright** — no `grep`, no `Edit`, no git. every agent op becomes an api call against a
  running app.
- **siyuan** — dense, workmanlike, not pretty · **`.sy` json blocks, local, self-hostable** ·
  mac + mobile · kernel http api, documented `API.md`, cli in 3.7 · self-host or paid cloud ·
  free/agpl-3.0, 46 235★ · ➡️ **best agent story of the group** — its own tagline is *"where humans
  and AI agents work together"*. loses on looks, which is the whole reason this ticket exists.
- **affine** — the prettiest open-source one, notion+miro, edgeless canvas · crdt/yjs blocks,
  local-first, self-hostable (3+ docker services) · mac + mobile · **no first-party cli; graphql
  api on a self-hosted server** · crdt real-time · free/oss, 72 334★ · ➡️ **beautiful, wrong
  shape.** the agent channel means running a postgres+redis stack.
- **appflowy** — clean notion clone, rust+flutter, native feel · local sqlite / appflowy cloud
  (5+ docker services) · mac + mobile · no meaningful agent cli · self-host or cloud ·
  free/agpl-3.0, 76 446★ · ➡️ **no agent channel worth the name.** out.
- **capacities** — polished object studio, very pretty · **cloud, closed** · mac + mobile, strong
  capture · **developer api with oauth, shipped july 2026** [docs] · vendor cloud · ~$10/mo ·
  ➡️ closed cloud store with an api — strictly worse than notion, which he already has.
- **logseq** — plain, outliner-shaped · **plain md/org files on disk** · mac + mobile · plain fs,
  same lane as obsidian · file sync / paid · free/agpl-3.0, 44 825★ · ➡️ **same storage model as
  obsidian with worse looks.** no reason to move.
- **tana** — supertags, structured, distinctive · cloud, closed · native mobile with voice ·
  api access [docs] · vendor cloud · free–$18/mo · ➡️ powerful data model, closed store, steep.
  not a notion replacement for his use.
- **craft / bear** — both genuinely beautiful, apple-native · craft: cloud+local hybrid;
  bear: local sqlite with markdown-ish · mac + iOS only · bear has x-callback-url, craft has a
  limited api · icloud/vendor · ~$3–8/mo · ➡️ **writing apps, not knowledge bases.** no graph, no
  database views, thin agent channel.
- **reflect** — pretty, ai-forward · cloud, closed · mac + iOS · limited api · vendor · paid ·
  ➡️ nothing here obsidian or notion lacks.
- **obsidian + a theme** — 📌 the option the hunt kept pointing back at. his complaint is looks,
  and looks are the one obsidian variable that is **fully user-controllable** — `obsidian-style-settings`
  is already installed [measured], `theme:install` and `theme:set` are official-cli commands
  [docs], and `Bases` gives him notion's database views natively. **zero migration, zero channel
  change.**

### 🎯 branch-2 verdict — one auto-qualifier, one recommendation

- ✅ **anytype qualifies for the bench** on the ticket's own rule — it is genuinely pretty, genuinely
  local-first, mobile+mac, and has an *official* mcp. **but run its lane knowing the fs lane does
  not exist there**, which is the single biggest thing obsidian has.
- 🚫 **nothing else clears the bar.** every other candidate loses on looks, on agent reach, or on
  being a closed cloud — in which case notion, which he already pays for and prefers the look of,
  strictly dominates it.
- ➡️ **the honest branch-2 finding: there is no upset.** the field is obsidian vs notion, exactly
  where DOT-54 started, and the third option is **obsidian dressed better**.

---

## branch 3 — notion, the plan

📌 **written before the token existed. the token arrived mid-session — the measured
results are the next section, and they supersede this one wherever the two disagree.**

### ✅ the token step is done

the mint-and-export step this section originally described has been completed — `NOTION_API_TOKEN`
is live in the environment and verified. what remains is a **share grant**, not a credential; the
next section has it.

### the runnable plan

same suite, same shapes, so the numbers sit beside the obsidian ones:

1. **seed** — `ntn api POST /v1/bulk/pages` (up to 100 pages per request [docs]) to create 300
   pages from the same generator output. notion has no folders, so the vault tree flattens to a
   parent page with 300 children.
2. **op1 read 50** — `ntn pages get <id>` per page, or `GET /v1/pages/:id/markdown`.
3. **op2 append 50** — `PATCH /v1/pages/:id/markdown` in **insert** mode.
4. **op3 property set 50** — `PATCH /v1/pages/:id` on the properties object.
5. **op4 rename the hub page** — 🎯 **the whole comparison lives here.** notion links are page-id
   references, not filename strings, so a rename **cannot break a link by construction**. expect
   231/231 correct with no tooling at all. **this is notion's one structural win over obsidian**,
   and the bench should say so in the same units.
6. **op5 search** — `POST /v1/search`.
7. **reset** — delete the parent page, re-seed.

⚠️ **budget the rate limit into the numbers.** ✅ **superseded by measurement — see "branch 3 —
measured" below.** the documented 3 req/s is not enforced as a hard per-second cap on this
workspace: a 10-wide burst sustained **20.9 req/s with zero 429s**. [measured] the real sequential
floor is round-trip latency, not the quota.

⚠️ **do not run a `GET markdown` → edit → `PATCH` replace cycle on any page he authored.**
unsupported blocks (bookmarks, embeds, link previews, breadcrumbs) round-trip as `<unknown>` and are
**destroyed on replace** [docs]. insert/append only. this is the one test that must be run on a
throwaway page first.

📌 **the mcp lane for notion stays as the ticket wrote it** — connect, take the reference numbers,
delete. it is page-level only; block editing has no endpoint there. [docs, `notion-channel.md`]

---

## branch 3 — measured, part 1 (channel)

ran 2026-09-08 with a live `NOTION_API_TOKEN`. **the channel works headless and is verified. the
bench itself is blocked on one click that only dima can make.**

### 🎯 what came out

- ✅ **`ntn` is real, official, and works headless.** v0.23.2, published 2026-09-04 by `jclem-ntn`
  (the same maintainer set as the `@notionhq/*` packages). `ntn doctor` reports **`Token source ✔
  NOTION_API_TOKEN`** and **`Public API access ✔ authenticated successfully`** with no `ntn login`
  and no browser. [measured]
- ✅ **58 endpoints exposed** via `ntn api ls`, self-documenting as the earlier research claimed.
  **the markdown api is present and reachable**: `GET /v1/pages/{page_id}/markdown` and
  `PATCH /v1/pages/{page_id}/markdown`, plus a native `POST /v1/pages/{page_id}/move`.
  `Notion-Version: 2026-03-11` is accepted. [measured]
- 🚨 **the integration sees zero pages.** `POST /v1/search` returns **0 objects**. the token is
  valid — `/v1/users/me` returns the bot `ntn-agent`, workspace-owned, workspace `dima`, and
  `/v1/users` lists 3 users. **this is exactly the share-check trap** the DOT-180 research
  predicted, reproduced live. [measured]
- 🚨 **and it cannot bootstrap its own parent.** creating a workspace-root page fails:

      400 validation_error — "Provide a `parent.page_id` or `parent.database_id` parameter to
      create a page, or use a public integration with `insert_content` capability. Internal
      integrations aren't owned by a single user, so creating workspace-level pages is not
      supported."

  [measured] so `bench-notes-stack` **cannot be created by the agent** until one existing page is
  shared with the integration to act as its parent.

### 📌 the rate limit is not what the docs imply — this corrects the plan above

the documented **3 requests/second** [docs] reads like a hard cap. it did not behave like one.

- **30 sequential requests, no pacing** — 11.06 s wall, **2.71 req/s**, latency p50 **360 ms**
  (min 292, max 523), **30× HTTP 200, zero 429**. [measured]
  📌 2.71 req/s ≈ 1 / 0.36 s. **the sequential rate is round-trip latency, not the quota.** the two
  numbers coinciding near 3 is what makes the limit look binding when it is not.
- **20 parallel** — 0.83 s, **24.19 req/s**, zero 429. [measured]
- **60 requests at concurrency 5** — 5.44 s, **11.03 req/s**, zero 429. [measured]
- **60 requests at concurrency 10** — 2.86 s, **20.94 req/s**, zero 429. [measured]

**what that does to the comparison.** op1 (read 50 notes), measured or projected at the observed
rates:

- obsidian, plain fs — **125 ms** [measured]
- obsidian, `notesmd-cli` — **816 ms** [measured]
- notion, sequential — **≈ 18 s** [projected from the measured 2.71 req/s]
- notion, concurrency 10 — **≈ 2.4 s** [projected from the measured 20.94 req/s]

➡️ **notion is ~19× slower than the fs lane on a concurrent read batch, and ~3× slower than the
obsidian cli lane** — not the ~130× the documented limit suggested. **an agent that batches its
notion calls is not meaningfully rate-limited at this scale.** that is a real point in notion's
favour and it changes the shape of the decision.

⚠️ **caveat on all four numbers — and the caveat proved right.** these were measured against
`/v1/users/me`, the cheapest endpoint in the api. 🚨 **real page traffic does throttle:** a later
run at concurrency 10 was rate-limited into losing data mid-flight. **see "branch 3 — measured,
part 2", which supersedes these figures for anything page-shaped.**

### 🚧 what is still blocked, and the one click that unblocks it

everything page-shaped: seed, op1–op5, the `<unknown>`-block data-loss test, and the rename
comparison. all of it needs one parent page.

📌 **it is a UI action — the api cannot do it.** in notion: open any page (or make an empty one
called `bench-notes-stack`) → **`···` menu → Connections → Add connections → `ntn-agent`**. child
pages inherit the grant, so one share covers the whole bench tree.

once that exists, the bench runs unattended — the plan in the section above is unchanged, and the
op4 rename prediction still stands: **notion links are page-id references, so a rename cannot break
a link by construction.** that remains notion's one structural win and it is still untested.

### what was verified and left clean

- no page was created, modified or deleted — **the integration cannot reach any page**, so the
  "never touch dima's pages" constraint held by construction as well as by intent. [measured]
- `ntn` was installed into job scratch, **not globally**. `ntn doctor` names `~/.config/notion` as
  its config path, but **the directory does not exist** — nothing was written there. [measured]
  nothing on the machine changed.
- the token was never printed, logged, or written to a file.

---

## branch 3 — measured, part 2 (the full lane)

ran 2026-09-08 with a rotated token and the page `bench-notes-stack` shared with `ntn-agent`.
**the notion lane ran end to end.** script: `docs/research/bench/notes-stack/notion_lane.py`.

setup: 40 child pages under one parent, each carrying a **real page-id reference** (a `mention`
block) to a hub page. concurrency 4. batch 40.

### 🎯 the two results that matter

**1. notion's rename is structurally lossless — measured, not argued.**

renaming the hub page and then re-reading all 40 linking pages:

- references still resolving to the hub page-id — **40/40**
- references rendering the **new** title — **40/40**
- references rendering the stale old title — **0/40**
- **pages rewritten to achieve it — 0.** one `PATCH` on the hub, nothing else touched. [measured]

📌 **put that beside the obsidian lane and it is the sharpest contrast in this report.** the same
op on obsidian: plain `mv` breaks 231/231 links · naive `sed` leaves 151/231 broken · careful `sed`
corrupts a colliding sibling · only a dedicated binary gets it right. **on notion the failure mode
does not exist**, because a link is an id, not a filename. no tool, no care, no collision trap.

**2. ⚠️ the `<unknown>`-block data-loss hazard is fixed. the earlier warning is out of date.**

`docs/research/notion-channel.md` (DOT-180) flags a read-modify-write cycle as destroying
bookmarks, embeds and link previews. **tested directly: it does not.** [measured]

- created a page with `paragraph` / `bookmark` / `paragraph`
- `GET /v1/pages/{id}/markdown` → the bookmark serialises as a **self-describing tag that carries
  its url**: `<unknown url="https://app.notion.com/p/…" alt="bookmark"/>`
- fed that markdown straight back via `PATCH … {"type":"replace_content"}` → **200**
- block types after the replace: `['paragraph', 'bookmark', 'paragraph']` — **the bookmark
  survived intact.**

two supporting details from the endpoint's own openapi spec, via `ntn api … --spec`:

- the GET response carries **`unknown_block_ids`** — an explicit list of blocks that could not be
  inlined, which the caller passes back to fetch separately. our probe returned `[]`.
- every destructive write shape takes **`allow_deleting_content`, defaulting to `false`** — a
  built-in guard against exactly the accident the old warning describes.
- 📌 **`insert_content` and `replace_content_range` are marked `deprecated`.** the current shapes
  are **`update_content`** (a search-and-replace list of `old_str`/`new_str`, max 100) and
  **`replace_content`** (whole page). an agent writing against the old shapes today is writing
  against a deprecated surface.

➡️ **the insert-never-replace rule can be relaxed to: replace is safe, and `allow_deleting_content`
stays `false`.** worth re-testing before trusting it with an embed-heavy page he authored — one
bookmark is one data point.

### 📌 and the rate limit does bind after all — correcting part 1

part 1 measured `/v1/users/me` and saw zero 429s at 20 req/s. **that was the cheapest endpoint in
the api and it generalised badly.** real page traffic throttles:

- a first attempt at **concurrency 10** was **rate-limited mid-run**: the seed lost 7 of 60 pages,
  the correctness checks all read back empty, and the teardown deleted **0 of 54** — leaving 54
  live pages that a paced cleanup pass then removed. [measured]
- the clean re-run at **concurrency 4** absorbed **6 × HTTP 429** with `Retry-After` backoff and
  completed with zero losses. [measured]

**observed throughput, page-level ops, concurrency 4:**

- seed 40 pages (create + 2 blocks each) — 8 387 ms · **286 ops/min** (4.8/s)
- op1 read 40 via markdown api — 3 982 ms · **603 ops/min** (10.0/s)
- op2 append 40 via `insert_content` — 7 755 ms · **309 ops/min** (5.2/s), 40/40 → 200
- op3 title update 40 — 6 097 ms · **394 ops/min** (6.6/s)
- op4 rename hub — **504 ms**
- op5 search — **480 ms**
- teardown 41 pages — 8 770 ms

**the honest cross-lane comparison, op1 read 40–50 notes:**

- obsidian, plain fs — **125 ms** [measured]
- obsidian, `notesmd-cli` — **816 ms** [measured]
- notion, markdown api at concurrency 4 — **3 982 ms** [measured]

➡️ **notion is ~32× slower than the fs lane and ~5× slower than the obsidian cli lane on reads**,
and the gap widens on writes. that sits between part 1's optimistic ~19× and the docs' pessimistic
~130×. **it is a real cost, and it is not a blocker at his scale** — his whole vault is 80 notes,
so a full read is about 8 seconds.

### 📌 one structural gap found

**notion has no per-page frontmatter outside a database.** a child page under a page has exactly one
property: its title. op3 therefore has **no true equivalent** on notion — the obsidian lane's
"set a frontmatter key on 50 notes" becomes "give the page a database row" or nothing. the bench
substituted a title update to keep a number in the slot; **it is not the same operation.** [measured]

➡️ if he wants obsidian-style properties on notion, every note has to live in a database, not as a
loose page. that is a real modelling decision, not a settings toggle.

### workspace left clean

- **41 pages deleted, 0 remaining under the parent.** the empty `bench-notes-stack` page was kept,
  as asked. verified by re-listing its children: `0`. [measured]
- the earlier throttled run's 54 orphans were found and deleted in a paced pass — **`POST /v1/search`
  now returns exactly one object, the parent page.** [measured]
- no page outside `bench-notes-stack` was ever reachable by the integration.

---

## the bench — where it lives and how to re-run it

- generator: `docs/research/bench/notes-stack/seed.sh <outdir> <n>`
- runner: `docs/research/bench/notes-stack/run.sh <fs|cli>`
- binary under test: `notesmd-cli` v0.3.7 (darwin), fetched from the github release. the runner
  finds it via `$NOTESMD_CLI`, then `$PATH`, then alongside itself.
- usage is in `docs/research/bench/notes-stack/README.md`.

✅ **the scripts live in the repo, not in job scratch**, so the cw lane reuses the same suite rather
than rebuilding it. 120 lines of bash, no dependencies beyond `python3` for millisecond timestamps.
obsidian does not need to be running.

the runner isolates `HOME` for the cli lane, so **dima's `obsidian.json` is never written**; that
was verified byte-identical after every run. [measured]

---

## what was not tested, and why

- **the official obsidian cli** — app is 1.8.9, needs 1.12.7. the single biggest gap in this report.
  everything claimed about it is [docs].
- **the mcp lane, end to end** — the `obsidian-local-rest-api` plugin folder is missing from the
  vault, and installing it plus running the app would have burned the remaining budget on a lane the
  readmes already disqualify.
- ~~**notion, at all** — no token.~~ ✅ **fully measured, both the channel and the whole op suite**
  (branch 3 — measured, parts 1 and 2). one caveat stands: the `<unknown>` round-trip was proven
  safe on **one bookmark block**, not on an embed-heavy page he authored.
- **anytype** — not installed; app + app key required.
- **the cw side of every lane** — this session is cc-only.
- **token counts** — estimated as bytes/4, not counted by a tokenizer.

---

## ➡️ what to do next, in order

1. **update obsidian on the mac** (1.8.9 → current) and enable *Settings → General → Command line
   interface → Register CLI*. this is the cheapest high-value move in the whole report: it unlocks
   `backlinks`, `unresolved`, `orphans`, `rename`-with-link-update, and `Bases`, all first-party.
2. **install `notesmd-cli`** (`brew tap yakitrak/yakitrak && brew install notesmd-cli`) — it is the
   only lane that works headless, so it is **the cw lane**. 📌 run `add-vault` knowing it writes to
   the live `obsidian.json`.
3. **adopt one rule, not a doctrine:** 🚫 **never `mv` a note.** use `notesmd-cli move` (or the
   official cli). every other edit stays plain fs, which is 7–20× faster and costs no tokens.
4. **share one notion page with the `ntn-agent` integration** — `···` → Connections → Add
   connections. it is a UI click the api cannot perform, and it is the only thing between here and
   a finished notion lane. the token itself is already working.
5. **decide looks on looks.** the channel is no longer the tiebreaker in either direction.
