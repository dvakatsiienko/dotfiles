---
researched: 2026-08-30
sources-current-as-of: 2026-08-30
method: primary sources only — notion's own developer docs, github repo metadata and readmes read through `gh`, zapier's documented behaviour via a vendor-neutral writeup. web search used to find sources, never as a source. claims tagged; anything i could not confirm is labelled rather than smoothed over.
ticket: DOT-180
dies-when: DOT-180 carries the verdict and dima has picked notion or obsidian
---

# notion channel, octoport, zapier — three verdicts

Ticket: DOT-180

context: dima is split between notion and obsidian. he prefers notion (looks, ui/ux) but
agent-side editing through the notion mcp is clunky and often fails. the parent verdict
([DOT-185](https://linear.app/x-com/issue/DOT-185)) is already settled: **cli where a shell exists, mcp where none does.** this
doc asks whether that rule has a good answer for notion, and vets two automation layers.

claim tags: **[verified]** i ran it or read the primary artifact · **[docs]** vendor
documentation only · **[inferred]** reasoning, not evidence · **[unknown]**

---

## 1. notion editing without the mcp

### 🎯 verdict — yes, and it is not close. stay on notion if you want to.

**the block model is no longer the wall. the hosted mcp was.** notion shipped two things in 2026
that did not exist when the notion pain was formed: an official cli built for coding agents, and a
markdown read/write api. either one on its own dissolves the problem dima is describing.

### why the mcp felt atrocious — the mechanism, not a vibe

🚨 **the hosted notion mcp is restricted to page-level operations. individual block manipulation is
not exposed at all.** [docs, 2026] so "editing" through it was never really available — a request to
change part of a page has no endpoint behind it on that channel. the clunkiness was structural.

the other documented pitfalls of that server, same source [docs]:

- a valid integration token returns **404** on any page not explicitly shared with the integration —
  the failure looks like "missing", not "unauthorised"
- the hosted server requires oauth 2.0 through a browser, so **no headless use**
- property access is deeply nested — `properties.Name.title[0].text.content` rather than a field
- database queries are `POST /v1/databases/{id}/query` with filters in the body; an agent that
  reaches for `GET` with query params just gets errors
- neither hosted nor local mcp exposes file upload or attachment access

### the official cli — `ntn` [verified: docs page + notion's own skill repo]

notion's own command-line interface, positioned by notion as "made just for developers and coding
agents".

- install: `curl -fsSL https://ntn.dev | bash` (npm install also offered)
- auth: `ntn login` stores in the system keychain, **or** it picks up `NOTION_API_TOKEN` from the
  environment with no login step — the headless path the mcp lacks
- **`ntn pages get <page-id>` returns the page as markdown** — this is the read half of the problem,
  solved in one command
- command groups: api requests · data sources (create, query, manage) · file uploads · workers
  (deployable typescript for syncs, tools, webhooks)
- 🎯 **it is self-documenting, which is what makes it good for an agent**: `ntn api ls` lists every
  public endpoint, `ntn api <path> --help` gives methods and usage, `--docs` prints the official
  docs, `--spec` prints a reduced openapi fragment. an agent discovers the surface at runtime
  instead of carrying it in context.
- status: beta as of 2026-05 [docs]

📌 **notion also publishes an agent skill for it**: `makenotion/skills`, MIT, 161 stars, last pushed
2026-06-16, containing exactly one skill — `notion-cli` [verified via `gh`]. it is a normal
`SKILL.md` with the frontmatter trigger pattern we already use. **this is directly adoptable into
`plugin-x` as-is**, the same way matt's skills are mirrored.

### the markdown api — the part that actually kills the block model [docs]

three endpoints, all requiring `Notion-Version: 2026-03-11`:

- `POST /v1/pages` — create a page from a `markdown` body parameter
- `GET /v1/pages/:page_id/markdown` — read the whole page as markdown
- `PATCH /v1/pages/:page_id/markdown` — insert into or replace existing content

notion calls the dialect **"notion-flavored markdown"** and documents it as covering most block
types — headings, lists, code blocks, tables, callouts, media embeds. the docs position it
explicitly as an alternative to the block api, "especially useful for agentic systems and developer
tools that work natively with markdown".

capabilities required per operation: `insert_content`, `read_content`, `update_content`.

⚠️ **the one real hazard, and it is a data-loss hazard.** unsupported block types — bookmarks,
embeds, link previews, breadcrumbs, templates — come back as `<unknown>` tags [docs]. a naive
read-modify-write cycle (`GET markdown` → edit → `PATCH` replace) therefore **destroys every one of
those blocks on the page**. [inferred, but directly from the documented behaviour]

- 🎯 the safe pattern is **insert/append, not replace**, on any page that might hold an embed
- a full-page replace is only safe on pages an agent authored end to end
- worth one real test before trusting it with anything of his

### the other limits worth knowing [docs]

- **3 requests/second** rate limit on the api generally
- **100 blocks per append request**; longer content must be chunked
- the markdown api truncates around **20,000 blocks per page**
- 2026-02-01: **bulk operations** — `POST /v1/bulk/pages`, up to 100 pages in one request
- 2026-03-01: **webhooks** — real-time change detection that does **not** count against the
  3 req/s budget. this is the one that makes a notion↔local sync cheap rather than a polling tax.

### community clis — now mostly redundant [verified via `gh`, 2026-08-30]

- **`4ier/notion-cli`** — go, MIT, 243 stars, full api coverage in one binary, 44 commands including
  block-tree operations and markdown output. created 2026-02-18, **last pushed 2026-07-18**, 12 open
  issues. it was the best answer before notion shipped `ntn`; it is now a second-best with a slower
  pulse.
- `kris-hansen/notion-cli-go` — 26 stars, last pushed 2026-03-12. thin, task-oriented.
- `ZenoxZX/notion-cli` — 1 star, C#, last pushed 2026-01-22. effectively dormant.
- markdown bridges (`tryfabric/martian`, `souvikinator/notion-to-md`) still exist and are healthy,
  but the official markdown api makes a third-party converter unnecessary for our case. [inferred]

### what this means for the obsidian-vs-notion decision

the channel objection to notion is **gone**. the honest remaining differences are not channel
quality:

- obsidian is **local plain files** — an agent edits them with `Read`/`Edit`, zero api, zero rate
  limit, zero auth, and full git history. notion over `ntn` is a network call with 3 req/s and a
  token.
- our obsidian vault is **not under git and syncs through icloud** with a documented lag hazard
  (`rules/fleet-hazards.md`) — so "local files" is not automatically safer today.
- 📌 the decision is now genuinely about what dima *likes*, which is what he said he wanted it to be.
  he prefers notion's ui. the thing that was blocking that preference no longer blocks it.

---

## 2. octoport

### 🎯 verdict — it is not a mini-zapier. the premise in DOT-126 is wrong.

🚨 **octoport is an mcp gateway and observability layer, not an automation platform.** its own
one-liner: *"one local mcp endpoint for every ai coding tool. 8 arms, 1 port."* [verified — repo
readme read via `gh`, 2026-08-30]

there is no app-action catalog, no trigger/zap concept, nothing zapier-shaped in it. the note in
[DOT-126](https://linear.app/x-com/issue/DOT-126) calling it "a local, free, customizable mini-zapier" should be corrected — and note
that a plain web search also returns a wrong answer for this name, describing an unrelated
port-tunnelling tool. the repo is the only reliable source.

### what it actually does [verified: readme]

two halves, and the second exists to enable the first:

**observability** — it sits on the path of every mcp call and records client, identity, server,
tool, latency, risk badge, and a canonical failure diagnosis. failures are classified
deterministically (`AUTH · token_expired`, `NETWORK · dns`, `SERVER · circuit_open`) instead of
surfacing a raw stack trace. per-server and per-tool reliability stats: success rate, p50/p95/p99,
timeout and auth-failure counts, anomaly alerts on consecutive failures and restart loops.
`octoport doctor` answers "why won't this mcp setup work" with evidence and a fix.

**gateway** — n clients × m servers collapses to 1 × m. process supervision for stdio servers with
crash isolation, jittered backoff, circuit breaker after 8 straight failures. hosted servers with
oauth (PKCE, dynamic client registration). full catalog aggregation across tools, prompts and
resources. named access tokens with `admin` vs `mcp` scopes. loopback binding with host/origin
validation by default. **blocked tools** — a per-server denylist enforced at `tools/list` and on
every call.

📌 the sharpest single feature: **tool-surface integrity.** every server's catalog is snapshotted
and diffed, so a server that quietly grows a `delete_repository` tool raises a risk-classified
warning you must accept — or block for every client at once. that is a real supply-chain control
and nothing else in our stack has it.

### maturity — young [verified via `gh`, 2026-08-30]

- created **2026-08-13**, last pushed 2026-08-25 — **seventeen days old**
- **3 stars, 1 fork.** typescript, MIT
- 🚨 **the npm package is not published yet** — the readme's own install instruction is to clone and
  build from source. `npx octoport up --open` is aspirational at the top of that readme.
- single maintainer

### pricing

free. MIT-licensed, runs locally, stores in sqlite on the machine. no hosted tier exists.

### the "someone at anthropic" claim — ⚠️ unverified

i could not confirm it. the `nullarch` github account has **no company and no bio**, 72 public
repos, 17 followers, created 2014. i found no anthropic changelog or video reference tying the
project to anthropic. [verified: the account metadata; the affiliation itself stays [unknown]]
**do not repeat the attribution as fact.** it does not change whether the tool is useful, and it
should not be doing any persuading.

### would it help dima?

**not yet — but for a specific, checkable reason.** the gateway's value is the ratio n×m → 1×m, and
his m is about one: `mcp-x-cw` is the local server. the claude.ai notion/desktop connectors are
hosted by anthropic and configured on their side, so octoport cannot front them. [inferred]
fronting one server with a gateway adds a hop and a dependency and collapses nothing.

what *is* genuinely attractive, independent of the ratio:

- 🔎 **the flight recorder.** "the mcp did something and i cannot see what" is a real recurring cost
  on `mcp-x-cw`, and `octoport doctor` is aimed exactly at it.
- 🔎 **tool-surface diffing**, if we ever add a third-party mcp server.

against adopting now:

- it would sit **on the path of every mcp call** — a seventeen-day-old, three-star, single-maintainer
  project as a hard dependency of the one automated channel onto a surface dima uses daily
- unpublished npm means an install is a clone-and-build, and updates are manual
- ⚠️ it wants to **rewrite client configs** (with backups) to point them at itself. our
  `settings.json` already has a documented drift hazard (`sys-settings-drift`); a second writer to
  those files is exactly the shape that bit us before.

**recommendation: watch, do not adopt.** revisit if we run three or more local mcp servers, or the
next time `mcp-x-cw` misbehaves in a way we cannot diagnose — at which point run it once as a
debugger rather than installing it as infrastructure. a comparable, more mature option in the same
niche if the need becomes real: `MikkoParkkola/mcp-gateway` (rust, single binary, flat ~15-tool
surface, claims ~89% tool-list token reduction on a 100-tool stack) [docs — vendor's own claim,
untested].

---

## 3. zapier for agents

dima's read, quoted for the record:

> zapier mcp is one mcp routing to a network of other mcps, so in theory even heavier, with the
> bonus of a single interface — which only pays if you use ~5 different harnesses

### 🎯 verdict — the conclusion is right, two of the three premises are wrong.

**he should not adopt it.** but not for the reasons he gave, and the wrong reasons matter because
they would misprice the next tool of this shape.

### ❌ "routing to a network of other mcps" — no

zapier mcp routes to **zapier's own action layer** — 40,000+ prebuilt app actions — not to other mcp
servers. [docs] nothing in it speaks mcp on the far side. **octoport is the thing that fronts other
mcp servers**; the two got conflated. worth separating, because they answer different questions.

### ❌ "in theory even heavier" — the opposite is true

🚨 **the surface is flat.** zapier mcp exposes **15 static meta-tools** covering action management,
execution, configuration, skills and feedback. the context weight stays constant no matter how many
apps are connected, because individual action schemas are never loaded upfront — `auto_provision_mcp`
runs on oauth connect and `enable_zapier_action` expands reach at runtime. [docs]

so as a *token* proposition it is **lighter** than running native mcps for the same apps, not
heavier. the 2026-08-18 seed on [DOT-126](https://linear.app/x-com/issue/DOT-126) estimated ~2–4k baseline for this and looks about
right; the tool count has since moved 14 → 15.

⚠️ the flip side, and it is not a token cost: **runtime tool enabling is non-deterministic**, which
the docs themselves call unsuitable for scheduled work. [docs]

### ✅ "only pays with ~5 harnesses" — right instinct, wrong axis

the payoff is real but it does not scale with **harnesses** (surfaces). it scales with the number of
**long-tail apps** you would otherwise need a separate native mcp for. [inferred, from the flat-surface
mechanics above]

for dima that axis reads: gmail, calendar, misc saas — the apps in the 2026-08-18 seed. two surfaces
(cc cli + claude desktop) neither helps nor hurts the math. so the honest framing is "i have almost
no long-tail app automations", and that is what makes it not pay — not the surface count.

### what actually disqualifies it — the metering [docs]

- **every successful mcp tool call costs 2 zapier tasks.** failed calls are free. zapier's own
  example puts "search and update 10 records" at 11 calls = **22 tasks**.
- as of 2026-06 **zaps, ai steps, code, mcp and sdk all draw from one shared account-wide task pool**
- mcp access itself is free on free/pro/team; the tasks are the meter
- 🚨 **the blast radius is account-wide.** one agent looping on retries drains the pool every other
  automation depends on. an agent that searches before it writes is exactly the loop this punishes,
  and free tier is ~50 calls/mo.
- **zapier agents (~$20/mo) and chatbots (~$20/mo) are separate paid add-ons**, metered in
  "activities", not included in any core plan

### what the actions api has that mcp does not [docs]

relevant if a zapier-shaped need ever appears — the api, not the mcp, is the grown-up channel:

- **idempotency** — `idempotency_id` dedupes within 72 hours; mcp has none at all
- **async execution** — returns 202 + run id for polling or callbacks; mcp is synchronous only
- **paged bulk reads** — `read_bulk` with cursor state, api-only
- **events** — only the trigger inbox api delivers app events; not exposed as mcp tools

📌 which is a nice restatement of the [DOT-185](https://linear.app/x-com/issue/DOT-185) verdict from a third vendor: where a shell
exists, the api/cli is the better channel and the mcp is the lossy convenience wrapper.

### standing recommendation

unchanged from the 2026-08-18 seed, now with firmer numbers: **keep linear, vercel and git native/cli.
do not adopt zapier.** if a real long-tail need appears (send a gmail, create a calendar event), the
cheap probe is the free tier in dynamic mode — and the thing to measure is **task burn**, not tokens,
because tokens are the part zapier already got right.

---

## sources

- notion cli overview — https://developers.notion.com/cli/get-started/overview
- notion markdown api — https://developers.notion.com/guides/data-apis/working-with-markdown-content
- notion's own agent skill — https://github.com/makenotion/skills (skill: `notion-cli`)
- notion mcp pitfalls + 2026 api features — https://kansei-link.com/en/insights/notion-mcp-deep-dive-2026
- community cli — https://github.com/4ier/notion-cli
- octoport — https://github.com/nullarch/octoport
- comparable gateway — https://github.com/MikkoParkkola/mcp-gateway
- zapier mcp vs actions api — https://www.scalekit.com/blog/zapier-mcp-vs-api
