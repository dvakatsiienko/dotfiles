# vercel cli vs vercel mcp for agent use

researched 2026-08-16, primary sources only: `vercel.com/docs/cli/*`, `vercel.com/docs/agent-resources/vercel-mcp/*`, `vercel.com/docs/rest-api`, `vercel.com/docs/logs`.

## verdict

**mostly yes, with three real gaps the cli cannot close.** `vercel api` is a documented, generally-available escape hatch to the full rest api surface — deploy management, web analytics, logs, purchases all round-trip through it. the cli's own subcommands (`logs`, `metrics`, `buy`, `firewall`, `sandbox`, `flags`, `redirects`, `routes`, ...) now cover most of what used to require a dashboard click. what the cli categorically cannot reach, because no rest endpoint backs it: **vercel toolbar comment threads**, **eve agent-run observability** (`list_agent_runs`, `get_agent_run`, `get_agent_run_trace`), and the mcp's **pre-clustered runtime-error groups** (`get_runtime_errors`). those three are mcp-only. everything else — including web analytics, which looked like a gap on paper — has a rest endpoint reachable through `vercel api`.

the context-cost tradeoff dima is optimizing for still favors the cli: the mcp server ships ~30 tool schemas up front regardless of use; `vercel --help` and `vercel api ls` are called on demand. the discoverability edge mcp has is small in practice, because vercel shipped its own discovery command — `vercel api` with no endpoint enters an **interactive mode** that searches the openapi spec, and `vercel api ls --format json` dumps every endpoint machine-readably. that is a cli-native answer to "the one thing mcp has that cli doesn't."

## 1. `vercel api` — beta status, scope, flags

still marked beta as of the current docs (`last_updated: 2026-07-15`):

> 💡 note: the `vercel api` command is currently in beta. features and behavior may change.

source: [vercel api](https://vercel.com/docs/cli/api)

it reaches the entire documented rest api, not a subset — it's a generic authenticated http client against `https://api.vercel.com`, with no endpoint allowlist. interactive mode (`vercel api` with no args) fetches vercel's openapi spec for endpoint search and parameter prompts, and `--refresh` forces a re-fetch of that cached spec.

flags confirmed from the doc:

- `-X, --method` — http method, defaults to `GET` (or `POST` if a body is given)
- `-F, --field` / `-f, --raw-field` — typed vs. raw string body fields
- `-H, --header` — custom headers
- `--input <file>` — request body from file or `-` for stdin
- `--paginate` — auto-follow pagination, combine all pages
- `-i, --include` — include response headers
- `--silent` — suppress output, use exit code
- `--verbose` — full request/response debug dump
- `--raw` — unformatted json
- `--generate=curl` — print an equivalent `curl` command instead of executing
- `--dangerously-skip-permissions` — skip the confirmation prompt on `DELETE`
- `--scope <team>` — team scoping, shown in the "list projects" example

subcommand: `vercel api ls` (alias for `list`) prints every available endpoint; `vercel api ls --format json` gives the same list as structured json — this is the cli's answer to mcp-style discoverability.

source: [vercel api](https://vercel.com/docs/cli/api)

## 2. logs — build vs runtime vs errors

three distinct surfaces, confirmed across two docs:

- **build logs** (`vercel build` output / dashboard) — build-tool version, warnings/errors during build, dependency install/compile details. source: [logs overview](https://vercel.com/docs/logs)
- **runtime logs** (`vercel logs`) — request-scoped logs: `console.log` output, errors, execution detail from vercel functions. retention "depends on your plan and whether observability plus is enabled." source: [logs overview](https://vercel.com/docs/logs), [vercel logs](https://vercel.com/docs/cli/logs)
- **runtime errors** — not a cli concept at all. only the mcp exposes it as a distinct, pre-aggregated resource (see §3).

`vercel logs` command surface, all confirmed flags:

- default: request logs, last 24h, linked project + current git branch
- `-f, --follow` — switches to **live runtime log streaming** for the latest deployment on the current branch (or `--deployment` for a specific one); streams for up to 5 minutes unless interrupted
- `-j, --json` — **json lines output**, meant to pipe into `jq`
- `-x, --expand` — full untruncated message per line
- `-n, --limit` — max entries, default 100
- `--environment production|preview`
- `--level error|warning|info|fatal` (repeatable)
- `--status-code` — exact code or wildcard (`5xx`)
- `--source serverless|edge-function|edge-middleware|static` (repeatable)
- `-q, --query` — full-text search
- `--request-id`
- `--since` / `--until` — iso 8601 or relative (`1h`, `30m`); default window is 24h
- `-b, --branch` / `--no-branch`
- `-p, --project`, `-d, --deployment`

source: [vercel logs](https://vercel.com/docs/cli/logs)

`vercel inspect --logs` and `--wait` also exist per the cli overview page but the dedicated inspect reference page was not fetched in this pass — 📌 **unverified**: exact output shape and whether it differs from `vercel logs --deployment`.

the rest api backing this is a single documented endpoint: `GET /v1/projects/{projectId}/deployments/{deploymentId}/runtime-logs` — [get logs for a deployment](https://vercel.com/docs/rest-api/logs/get-logs-for-a-deployment). deployment-scoped only; there is no project-wide, cross-deployment rest endpoint for runtime logs outside what `vercel logs`/`get_runtime_logs` already wrap.

for dima's stated use case — a green deploy whose functions 404 or die at import — `vercel logs --level error --since 1h --json | jq` is the direct cli path, and it is strictly more scriptable than the mcp's `get_runtime_logs` (same filters: level, status code, source, time range, full-text query, `group_by`).

## 3. vercel mcp — full tool inventory

source: [tools reference](https://vercel.com/docs/agent-resources/vercel-mcp/tools) (`last_updated: 2026-07-23`). the page's own summary: "available tools ... for searching docs, managing teams, projects, deployments, web analytics, runtime logs and errors, agent runs, design [import], and toolbar [comments]." full list by category:

**documentation** — `search_vercel_documentation`

**project management** — `list_teams`, `list_projects`, `get_project`

**deployment** — `list_deployments`, `get_deployment`, `get_deployment_build_logs`, `get_runtime_logs`, `get_runtime_errors`, `deploy_to_vercel` (deploy raw files without git or the cli)

**web analytics** — `get_web_analytics` (visits/events, count or aggregate mode)

**agent runs observability** (eve framework) — `list_agent_run_projects`, `list_agent_runs`, `get_agent_run`, `get_agent_run_trace`

**domains** — `check_domain_availability_and_price`

**purchases** — `get_purchase_quote`, `buy_pro`, `buy_credits`, `buy_addon`, `buy_domain`, `get_domain_order`

**access** — `get_access_to_vercel_url` (shareable bypass link for protected deployments), `web_fetch_vercel_url`

**design import** — `import-claude-design-from-url` (deploy a claude design html bundle)

**toolbar** — `list_toolbar_threads`, `get_toolbar_thread`, `change_toolbar_thread_resolve_status`, `reply_to_toolbar_thread`, `edit_toolbar_message`, `add_toolbar_reaction`

**cli** — `use_vercel_cli` ("instructs the llm to use vercel cli commands with `--help` flag for information")

📌 that last tool is the whole argument in miniature: vercel's *own* mcp server, for an unspecified subset of actions, tells the calling model to go shell out to the cli instead of using an mcp tool. mcp is not positioned internally as a full replacement for the cli even by its authors.

## what the mcp can do that the cli cannot

cross-checked every mcp tool category against the [rest api reference](https://vercel.com/docs/rest-api) section list (`access-groups`, `ai-gateway`, `artifacts`, `billing`, `checks-v2`, `deployments`, `dns`, `domains(-registrar)`, `drains`, `edge-cache`, `global-config`, `environment`, `feature-flags`, `integrations`, `marketplace`, `observability`, `projectMembers`, `project-routes`, `projects`, `rolling-release`, `sandboxes`, `security`, `storage`, `teams`, `vcr`, `web-analytics`, `webhooks`, `aliases`, `certs`, `logs`). anything with a section here is reachable via `vercel api`.

| mcp capability | cli/`vercel api` equivalent | verdict |
| --- | --- | --- |
| `get_runtime_errors` (grouped error clusters: name, count, affected routes, first/last seen, up to 7d) | none — rest exposes only raw per-deployment `runtime-logs`, no clustering endpoint | **mcp-only** |
| `list_agent_runs`, `get_agent_run`, `get_agent_run_trace`, `list_agent_run_projects` (eve agent observability) | none — no `agent-run` section in the rest api reference | **mcp-only** |
| `list_toolbar_threads`, `get_toolbar_thread`, `change_toolbar_thread_resolve_status`, `reply_to_toolbar_thread`, `edit_toolbar_message`, `add_toolbar_reaction` (toolbar comments) | none — no `comments`/`toolbar` section in the rest api reference | **mcp-only** |
| `get_web_analytics` | `web-analytics` rest section (`/v1/query/web-analytics/*`) via `vercel api`, or `vercel metrics` cli command | covered |
| `deploy_to_vercel` (deploy inline files, no git/cli) | `POST /v13/deployments` via `vercel api`, or plain `vercel deploy` | covered |
| purchase tools (`buy_pro`, `buy_credits`, `buy_addon`, `buy_domain`) | `vercel buy credits|pro|domain` cli command exists natively | covered |
| `get_access_to_vercel_url` (shareable bypass link) | `deployment-protection` rest coverage not directly confirmed in this pass — 📌 **unverified** | unverified |
| `import-claude-design-from-url` | claude design → vercel is a proprietary bridge; no independent rest endpoint found | **likely mcp-only**, low relevance to dima's workflow |
| `search_vercel_documentation` | no cli doc-search command; `vercel skills` is a different, narrower feature (surfaces agent skills for the linked framework, not general doc search) | **mcp-only**, but web search covers the same need outside the tool |

everything else — teams, projects, deployments list/get, build logs, runtime logs, domains check/price — has both a cli subcommand and a rest path.

## 4. recent agent-oriented cli additions (between 50.x and current)

confirmed present in the current cli overview ([vercel cli overview](https://vercel.com/docs/cli), `last_updated: 2026-07-29`) but **not individually dated** — the changelog fetch for this pass only surfaced the most recent page (58.4.4, july 30) and did not reach far enough back to bracket 50.x → 59.1.3 with per-version deltas. 📌 **unverified**: exact version each landed in.

commands present now that read as agent-oriented:

- **`vercel agent init`** — generates an `AGENTS.md` file with vercel deployment best practices for coding agents
- **`vercel skills`** — discovers agent skills relevant to the linked project, or searches the skill catalog (`--json` supported)
- **`vercel mcp`** — sets up mcp client config for the linked project (this is the cli configuring *other* mcp clients, not a replacement for the hosted server)
- experimental **native cli binaries** (`@vercel/vc-native*`) — reduces node.js dependency for container/ci environments, relevant to agent sandboxes specifically

source: [vercel cli overview](https://vercel.com/docs/cli)

## 5. json/scriptable output

not just `vercel api` — several subcommands now carry their own structured-output flags, confirmed from the cli overview's command list:

- `vercel logs --json` / `-j` — json lines
- `vercel api ls --format json`
- `vercel contract --format json`
- `vercel skills nextjs --json`
- `vercel upgrade --format=json`

📌 dima's earlier finding that `vercel ls --json` fails with "unknown option" on 50.35.0 stands as tested — `list` was not in this set of json-capable commands per the current docs either, so that gap is likely still current on 59.x, not merely a version-lag artifact. **unverified on 59.1.3 directly** — not re-tested against the live binary in this pass.

`vercel api` remains the only **guaranteed** machine-readable path, since it returns raw json for literally any endpoint; the per-command `--json`/`--format json` flags are opt-in and inconsistently rolled out across the command set.

## sources

- [vercel api](https://vercel.com/docs/cli/api)
- [vercel logs](https://vercel.com/docs/cli/logs)
- [vercel cli overview](https://vercel.com/docs/cli)
- [logs overview](https://vercel.com/docs/logs)
- [use vercel's mcp server](https://vercel.com/docs/agent-resources/vercel-mcp)
- [vercel mcp tools reference](https://vercel.com/docs/agent-resources/vercel-mcp/tools)
- [vercel rest api reference](https://vercel.com/docs/rest-api)
- [get logs for a deployment (rest api)](https://vercel.com/docs/rest-api/logs/get-logs-for-a-deployment)
