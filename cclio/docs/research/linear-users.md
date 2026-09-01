---
dies-when: proposal accepted or dropped by dima
---

# linear users for agents — mechanics + proposal

research for the linear-users reminder: give cclio and coders their own linear identities
instead of everything posting as dima.

## 1. seat vs api-actor — the verdict

- **no seat needed.** linear's agent model runs on an **oauth app actor** (`actor=app`):
  the app installation creates a dedicated workspace user representing the agent, with its
  own token, name and avatar. official line: *«agents installed in your workspace do not
  count as billable users»* ([agents docs](https://linear.app/developers/agents)).
- a **personal api key** (what `linear` cli + our hooks use today) always acts as the key's
  owner — every action attributes to dima. no per-key identity switch exists.
- the **agent session api** (2025+) sits on top: mention or delegate an issue to the agent →
  a session spawns with prompt context, webhook events drive the loop
  ([getting started](https://linear.app/developers/agents),
  [actor authorization](https://linear.app/developers/oauth-actor-authorization)).
- auth for a headless service: **client credentials grant** issues app-actor tokens without a
  browser dance ([oauth docs](https://linear.app/developers/oauth-2-0-authentication)).

## 2. cost

- app actors: **free**, on every plan.
- a real member seat would cost basic $10 / business $16 per user/mo — pointless here.
- agent *sessions* only cost money when using linear's own hosted agents (ai credits);
  a self-hosted app actor costs nothing.

## 3. one shared coder user vs per-session

- identities are **per oauth app**, not per token — so the natural grain is one identity per
  role: e.g. app «cclio» + app «coder». per-session apps would mean per-session admin installs —
  nobody does that.
- the escape hatch for finer attribution: `createAsUser` + `displayIconUrl` on `issueCreate` /
  `commentCreate` — renders as **«name (via app)»** per request. a coder session could stamp
  its run id there: «dot-233-coder (via coder)». works only with app-actor tokens, not personal
  keys ([actor authorization](https://linear.app/developers/oauth-actor-authorization)).
- working recipes in the wild:
  - [cyrus](https://hookdeck.com/webhooks/platforms/how-to-run-claude-code-as-a-linear-agent-with-cyrus-and-hookdeck-cli) —
    open-source runner wiring claude code to the agent sdk; claude appears as an assignable
    agent in the workspace.
  - [linear's claude bridge](https://www.blog.brightcoding.dev/2026/05/31/stop-building-ai-agents-from-scratch-use-linears-claude-bridge-instead) —
    implements the `actor=app` flow as the install step.
  - [linear cli + `claude -p` loop](https://backgroundclaude.com/blog/linear-cli) — the
    poor-man's variant, no identity, polling.
  - official agents directory: [linear.app/integrations/agents](https://linear.app/integrations/agents).

## 4. own-linker attribution (`script/linear-push.ts`)

- today the pre-push hook links commits via dima's personal key → attribution is dima.
- swap the token for an app-actor token (client credentials) and the same graphql mutations
  attribute to the agent app; optionally `createAsUser: "<repo> push"` per mutation.
- the hook change is small (token + optional attribution fields); the admin work is creating
  the oauth app once.

## 5. assignee utilization

- linear deliberately keeps agents as **delegates, not assignees** when `app:assignable` is
  granted — the human keeps ownership, the agent shows in a delegate slot. this fits the
  current convention (assignee = dima's commitment) perfectly: nothing breaks.
- practical use once identities exist: delegate a ticket to «coder» when a coder session picks
  it up → board shows who's actively working what; dima's assignee field stays his signal.
- mentions (`app:mentionable`) let dima @-ping an agent from a comment — only useful if we
  wire a webhook listener (cyrus-shaped); optional, not required for identity.

## proposal

- **create two oauth apps in the x-com workspace: «cclio» and «coder»** (names + avatars =
  the identity dima sees). install each with `actor=app`. grant `app:assignable` +
  `app:mentionable` on «coder», minimal scopes on «cclio».
- use **client credentials** to mint app-actor tokens; store beside the existing key
  (e.g. `LINEAR_TOKEN_CCLIO`, `LINEAR_TOKEN_CODER`).
- **phase 1 (cheap, immediate):** `linear-push.ts` + agent-made comments switch to the coder
  token — commits and comment trails stop impersonating dima. cclio's board edits switch to
  the cclio token. the `linear` cli keeps dima's key for his own use.
- **phase 2 (optional, later):** webhook listener for delegation/mentions — only if the
  «assign an issue to claude» loop earns its keep; cyrus is the reference implementation.
- per-session attribution rides `createAsUser` stamps, no extra apps.
- **dima's admin hands:** create the two oauth apps (settings → api → applications), enable
  client credentials, install with `actor=app`, hand over the client id/secret pairs.
- **cost line: $0** — app actors are not billable seats.
