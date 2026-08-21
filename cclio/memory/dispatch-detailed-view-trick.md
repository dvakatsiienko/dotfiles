---
name: dispatch-detailed-view-trick
description: "Model/effort knobs and Background tasks live on the CODE surface, not dispatch — dispatch has no model picker at all"
metadata: 
  node_type: memory
  type: reference
  originSessionId: 4f5e3770-3bb4-46bf-9c13-b2042ecfcc42
  modified: 2026-08-19T12:35:26.193Z
---

**Rewritten 2026-08-19 after grepping the Claude.app bundle. The old "spawn a probe to unlock the button in dpatch" advice was wrong — it cost Dima four wasted probe spawns. Do not repeat it.**

Findings from `/Applications/Claude.app/Contents/Resources/ion-dist`:

- **"Background tasks" is a CODE-surface panel.** Every changelog string for it is tagged `surface:"code"`. In the panel menu it sits beside Files / Plan / Agent / Transcript, gated on `k || w>0 || alreadyOpen` — it renders only when a running-task count is above zero. Entry point = the icon row at the top-right of a **code session** (>_ terminal, panel, globe, ⋮). It never appears in dispatch, no matter what gets spawned.
- **Model + effort knobs are per-code-session**, shown in that session's composer bar bottom-right (e.g. «Opus 5 · Low»). Always visible there, nothing to unlock.
- **Dispatch has NO model picker.** No `dispatchModel` / model-picker binding exists among the ~60 dispatch-prefixed identifiers in the bundle. Session JSON stores no model field either — the system prompt carries a `{{modelName}}` template filled at request time. So Dima cannot see or change the dispatch model from the dispatch UI, and I cannot change my own model mid-session.
- The dpatch ⋮ menu contains only: Clear background tasks / Report content / Clear memory / Delete conversation.

**Practical lever:** `start_code_task` DOES accept a `model` param — so work that must run on a specific model gets routed to a spawned code session pinned to it. `start_task` (cowork child) still has no model param and inherits.

**Perm-prompt visibility trap (2026-08-19):** MCP tool approvals (DC, handoff, computer-use…) render in the COMPACT dispatch view; in expanded/detailed view Dima doesn't see them → dpatch looks stuck while silently waiting. No allow-all switch exists on the dispatch surface (code sessions get bypass from ccli settings.json; dispatch MCP approvals are app-side and per-tool «always allow» only). Mitigations: Dima clicks «always allow» per tool as prompts appear (accumulates to effective allow-all); when a perm-throwing call is coming, dpatch says so in the reply so he peeks at compact view. If truly stuck-looking: check compact view first.

Related: [[announce-model-at-open]], [[dispatch-spawn-types]], [[model-picking-for-spawns]]
