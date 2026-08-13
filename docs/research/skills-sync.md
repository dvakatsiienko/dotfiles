# CC ↔ claude.ai/Desktop custom-skills sync

Research date: 2026-08-13. Scope: individual Pro/Max user, macOS. Primary sources only.

## TL;DR verdict

**No sanctioned programmatic path up to claude.ai exists; the stamp+zip+drag pipeline is the optimum for skill-form artifacts.** But the 3 handoff desk skills are already thin wrappers around the local `handoff` MCP server — fold their instructions into the server (tool descriptions + MCP prompts, generated from the same `SKILL.md` files at build time) and they need **no upload ever, zero drift**. Keep the zip pipeline only for `pm` (and future desk skills that need model-driven auto-trigger via connectors). Notable one-way asymmetry: skills now sync **claude.ai → Claude Code** (CC changelog confirms hardening of "skills synced from claude.ai"); the reverse direction — the one we need — does not exist.

## 1. Programmatic path to claude.ai per-user skills

- **None documented.** Upload is manual UI only: Settings → Capabilities/Customize → Skills, zip with the skill folder as zip root (not a subfolder), folder name = skill name, `SKILL.md` required. Sources: [support 12512198](https://support.claude.com/en/articles/12512198), [12512180](https://support.claude.com/en/articles/12512180).
- **Re-upload same name = update in place**, not a duplicate; shared/provisioned recipients "automatically get the updated version" ([12512180](https://support.claude.com/en/articles/12512180)). Good: drag-over refresh works, no delete-first dance.
- Size limits: acknowledged to exist ("zip file size limits") but thresholds unpublished ([12512180](https://support.claude.com/en/articles/12512180)).
- API skills (`/v1/skills`, beta `skills-2025-10-02`) explicitly **not available on claude.ai** ([platform docs, cross-surface availability](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)).
- The Settings UI necessarily hits an internal claude.ai endpoint — **unofficial, undocumented, session-cookie-authed, fragile; do not build on it** (ToS + silent-breakage risk). Not investigated further on purpose.

## 2. Desktop local skill locations / extensions

- **No user-writable local skills dir.** `~/Library/Application Support/Claude/local-agent-mode-sessions/skills-plugin/` is a cloud-synced cache of server `skillIds` (manifest.json) — read-only, overwritten by sync.
- **MCP Bundles (.mcpb/.dxt) carry MCP servers only.** `MANIFEST.md` in [anthropics/mcpb](https://github.com/anthropics/mcpb) has zero mentions of skills; the spec bundles a server + manifest, nothing else ([engineering blog](https://www.anthropic.com/engineering/desktop-extensions)). Extensions cannot smuggle skills in.
- What an extension/local server CAN carry: **tool descriptions and MCP prompts** — see §4.

## 3. Org/API management + gap-closing signals

- Org provisioning of skills = **Team/Enterprise admin only** ([12512198](https://support.claude.com/en/articles/12512198)); nothing for individual plans.
- **claude.ai → CC sync shipped** (one-way, down): CC changelog hardens "skills synced from claude.ai" — sanitized descriptions, no `!`/`@` execution locally ([anthropics/claude-code CHANGELOG](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md)). Signal the surfaces are converging, but the up-direction (local file → claude.ai) has no announced path.
- [Agent Skills open standard](https://support.claude.com/en/articles/12512176) (agentskills.io) standardizes the *format*, not distribution.
- Watch item: since claude.ai→CC sync exists, a future "manage skills on claude.ai as the hub" flow could invert our architecture (author on claude.ai, sync down). Today it would mean losing git as source of truth — not acceptable.

## 4. Skills-as-MCP alternative (fit per desk skill)

The local `handoff` MCP server (`~/.dotfiles/.clauderc/mcp-handoff-desktop/`) is already installed in Desktop. MCP offers two carriers: **tool descriptions** (always model-visible once server enabled — de facto auto-trigger) and **prompts** (user-invoked from Desktop's + menu — no auto-trigger).

- ✅ `handoff` (12 lines) — near-total fit. SKILL.md is "call `save_handoff` per the spec in its tool description". The CST spec ALREADY lives in the tool description; move the remaining 5 lines of procedure into it → skill redundant.
- ✅ `handoff-pull` (12 lines) — same shape; ingest contract already referenced to the tool description. Fold in.
- ✅ `handoff-prune` (10 lines) — trivially "call `prune_handoffs`". Fold in.
- ⚠️ `pm` (42 lines) — **doesn't fit tool descriptions**: it uses the GitHub/Linear *connectors*, not the handoff server; a handoff-server tool description about PM'ing would be a semantic hack. Could ship as an MCP *prompt* on the server (static text, user-invokes like a slash command) — but that loses skill auto-triggering ("close #N" without invoking anything). pm is the one skill where description-based auto-load earns its keep → keep as uploaded skill.

Drift math for the folded trio: tool descriptions are emitted by the server at runtime → single source, **zero drift, zero manual sync steps** after the one-time refactor. Bonus: the trio's per-skill "requires the handoff MCP server" preamble disappears (tools present ⇔ instructions present, atomically).

## 5. Recommendation

| Option | Manual steps per skill change | Drift risk | Fragile deps |
| --- | --- | --- | --- |
| A. Status quo: stamp+zip+drag (`script/skills-desk-sync.mjs`) | 2 (run script, drag zip) | Low (sha stamps detect; human must act) | None |
| B. Unofficial claude.ai upload endpoint | 0 | Low | 🚫 High — undocumented, ToS/breakage risk. Rejected. |
| C. Handoff trio → MCP tool descriptions; pm stays zip | 0 for trio; 2 for pm (rare) | **Zero** for trio (runtime single-source); low for pm | None (server already installed) |
| D. All four → MCP prompts | 0 | Zero | Loses auto-trigger for pm; prompts UX in Desktop is clunkier than skills |

➡️ **Do C.** Strictly fewer manual steps AND strictly less drift risk for 3 of 4 skills, no new dependency — passes the bar. Concretely: move the handoff/handoff-pull/handoff-prune procedure text into the corresponding tool descriptions in `mcp-handoff-desktop` (build step may read the `skills-desk/*/SKILL.md` files or the files just get deleted in favor of inline descriptions), rebuild (`pnpm mcp:build`), delete the three uploaded skills from claude.ai, keep `pm` on the existing zip pipeline. The sync script shrinks to a one-skill job.

Residual manual surface after C: only `pm` edits ever need a drag; frequency ≈ rare. That IS the practical optimum for an individual plan today.
