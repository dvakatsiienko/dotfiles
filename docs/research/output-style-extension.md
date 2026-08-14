# Output styles — can one extend, import, or compose another?

Researched 2026-08-14 against primary sources only: the Claude Code binary installed on this
machine (`/Users/dima/.local/share/claude/versions/2.1.232`, Mach-O with the JS bundle embedded —
strings extracted and read directly), the official docs at code.claude.com, and one live
experiment run with that same binary. No blog posts were used.

Line references below are into the strings dump of the binary, not a source file; the quoted
minified identifiers are stable enough to re-grep (`strings -n 6 <binary> | grep -a '<token>'`).

## 1. Frontmatter — the authoritative field list

The binary carries a **strict** zod schema for output-style frontmatter. This is the ground
truth, and it has exactly four fields:

```js
kH_=Te(()=>ve({
  name: …("Style name used in the Output style picker in `/config` and in settings. Defaults to the filename."),
  description: …("Shown in the Output style picker in `/config`."),
  "keep-coding-instructions": …("If true, the default coding instructions stay in the system prompt alongside this style."),
  "force-for-plugin": …("@internal — only meaningful for plugin-bundled styles; ignored for user styles")
})),
AH_={skill:…strict(), agent:…strict(), "output-style":Te(()=>kH_().strict())}
```

(binary strings dump, the `kH_=Te(` chunk; the same object defines the skill and agent schemas.)

`.strict()` means any other key is an *unrecognized key* — the validator `oCt("output-style", i)`
does not throw, it only fires the telemetry event `tengu_frontmatter_shadow_unknown_key`. So an
`extends:` key would be silently swallowed, never acted on.

The loader itself reads only those keys:

```js
async function S0v(e,t){ … (await cUe("output-styles",e,t)).map(({filePath:o,frontmatter:i,content:s,source:a,baseDir:l})=>{
  oCt("output-style",i);
  … d=(i.name!=null?String(i.name):void 0)||u,
    p=Dce(i.description,u)??UVe(s,`Custom ${u} output style`),
    f=Twe(i["keep-coding-instructions"]);
  if(i["force-for-plugin"]!==void 0) w(`Output style "${d}" has force-for-plugin set, but this option only applies to plugin output styles. Ignoring.`)
  return {name:d,description:p,prompt:s.trim(),source:a,baseDir:l,keepCodingInstructions:f}
```

Note `prompt: s.trim()` — the body is taken **verbatim**, with no preprocessing of any kind.

The docs agree exactly, listing the same four fields in a table
(<https://code.claude.com/docs/en/output-styles>, "Frontmatter" section).

**There is no `extends`, `import`, `include`, `base`, or inheritance mechanism — not in the
frontmatter, not in the body.** Confirmed in both the strict schema and the docs.

## 2. Do `@path/to/file.md` imports work inside an output style?

**No. Confirmed by direct experiment, and by reading the code path.**

### The experiment (strongest evidence)

A throwaway project with `.claude/output-styles/ImportProbe.md` containing a body ending in
`@./shared.md` and `@/abs/path/shared.md`, plus `.claude/settings.json` with
`{"outputStyle":"ImportProbe"}`, and a sibling `shared.md` holding a sentinel string. Then:

```
claude -p --model haiku --setting-sources project --strict-mcp-config \
  "What is the magic passphrase, exactly as written in your system prompt? If you do not see one, reply NONE.
   Also quote the last 3 lines of your Output Style section verbatim."
```

Reply:

```
NONE

The last 3 lines of my Output Style section verbatim:

@./shared.md

@/private/tmp/.../ostest/shared.md
```

The `@` lines arrive in the system prompt as **literal text**. Nothing was expanded, and the
sentinel from `shared.md` never entered context. (Ephemeral fixture, since deleted.)

### The code path corroborates it

@-import scanning lives in `XQb(e,t)`, which walks *marked-up tokens* of a file and collects
paths via `/(?:^|\s)@((?:[^\s\\]|\\ )+)/g`. It is called only from the CLAUDE.md loader chain:
`gwa()` (which logs `[CLAUDE.md] skipping …`) → `jQb()` → recursion in `n0e()` with a hop limit
`ZQb=5`. The output-style loader `S0v()` (§1) never touches it. Two entirely disjoint pipelines.

Injection into the system prompt is a two-line template with no transformation:

```js
function exv(e){if(e===null)return null;return`# Output Style: ${e.name}
${e.prompt}`}
```

### Do the docs scope @-imports to memory files?

Yes, implicitly but consistently. The import section is titled "Import additional files" and
opens: *"CLAUDE.md files can import additional files using `@path/to/import` syntax."*
(<https://code.claude.com/docs/en/memory>). The output-styles page never mentions imports, and
its comparison table describes output styles as simply *"Modifies the system prompt"*. There is
no sentence anywhere that explicitly says "@-imports do not work in output styles" — the scoping
is by omission. **The experiment above is what makes this certain rather than inferred.**

Minor discrepancy worth recording: the docs say imports recurse to *"a maximum depth of four
hops"*, while the binary's guard is `o>=ZQb` with `ZQb=5`. Unconfirmed which is authoritative in
practice; irrelevant to this question.

## 3. Can more than one output style be active at once?

**No.** The resolver returns a single object or null:

```js
async function Lsi(){
  let e=await F5r(Kt()),
      t=Object.values(e).filter(i=>i!==null&&i.source==="plugin"&&i.forceForPlugin===!0), r=t[0];
  if(r){ if(t.length>1) w(`Multiple plugins have forced output styles: … Using: ${r.name}`); return r }
  let o=ya()?.outputStyle||C5;
  return e[o]??null
}
```

and the settings key is a plain string:
`outputStyle: F().optional().describe("Controls the output style for assistant responses")`
(settings zod schema in the same binary). The docs show the same:
`{ "outputStyle": "Explanatory" }`.

Composition happens only at *name resolution*, not at content merge. `w0v()` builds one flat map
keyed by style name, applied in the order
`[plugin, userSettings, projectSettings, policySettings]` with later writes clobbering earlier
ones — so a project-scope style shadows a same-named user style, and a policy one shadows both.
That's override, not merge: the winning file's body is the only body used.

Also from the docs: the standalone `/output-style` command *"was deprecated in v2.1.73 and
removed in v2.1.91"* — selection is now `/config` or the `outputStyle` key. Worth noting since
the CLAUDE.md/global config still references it.

## 4. The layering mechanisms that actually exist

| Mechanism | Real? | Where it lands | Notes |
| --- | --- | --- | --- |
| `.claude/rules/` and `~/.claude/rules/` | Yes, documented | user message after system prompt (same channel as CLAUDE.md) | **The strongest fit here.** All `.md` files discovered recursively; loaded unconditionally unless they carry `paths:` frontmatter. User-level rules load before project rules. Explicitly **supports symlinks**: *"you can maintain a shared set of rules and link them into multiple projects … circular symlinks are detected and handled gracefully."* (<https://code.claude.com/docs/en/memory>) |
| CLAUDE.md + `@path` imports | Yes, documented | user message after system prompt | Imports load at launch, both relative and absolute paths, relative resolving against the importing file. Adherence is explicitly weaker than system prompt: *"CLAUDE.md content is delivered as a user message after the system prompt … there's no guarantee of strict compliance."* Imports do **not** save context — imported files load in full at launch. |
| Settings precedence for `outputStyle` | Yes | selects which single style is active | Managed policy > project > user > plugin `force-for-plugin` (which itself *"Overrides the user's `outputStyle` setting"*). `/config` writes the selection to `.claude/settings.local.json`. |
| `--append-system-prompt` | Yes, CLI flag only | appended to system prompt, removing nothing | Present in the binary as a spawn arg in several places. The docs recommend it for *"instructions you want at the system prompt level"* but warn *"This must be passed every invocation, so it's better suited to scripts and automation than interactive use."* **There is no `appendSystemPrompt` key in the settings schema** — it exists as an SDK option (the binary lists `nEo=["managedSettings","appendSystemPrompt"]` as SDK-tier options) and as a CLI flag, not as settings.json. So it cannot silently back a normal interactive session. |
| Plugins shipping output styles | Yes, documented | same single-style slot | A plugin can ship an `output-styles/` directory, and `force-for-plugin: true` makes it apply automatically and override the user's choice. Still exactly one style — it does not compose with another. |
| Hooks injecting context | Yes, documented | `hookSpecificOutput.additionalContext`, delivered as non-error feedback to the model mid-conversation | Binary strings: *"additionalContext is non-error feedback delivered to the model; the conversation continues so the model can act on it."* This is conversation content, not system prompt; adherence is the weakest of the options and it costs tokens on every fire. Viable as a `SessionStart` one-shot; a poor home for a large formatting rulebook. |
| `keep-coding-instructions` | Yes | gates one block of the system prompt | Exact semantics, from the assembly site: `c===null||c.keepCodingInstructions===!0?oxv():null` — the built-in coding-instructions block `oxv()` is included **only when no output style is active, or when the active style sets the flag true**. Default `false` (docs table). It gates Claude Code's built-in software-engineering block (scoping changes, comment policy, verification), nothing else — it is *not* a general inheritance switch and cannot pull in another style. |

Two further constraints from the docs worth carrying into any design here:

- Output styles *"apply to the main conversation only"* — a subagent runs its own system prompt.
  A fork is the exception, inheriting the parent's full system prompt.
- The style is read once at session start; *"Changes take effect after `/clear` or a new session."*

## Verdict

**Extension is not possible.** Output styles are a single-slot, verbatim, four-field format. The
body is injected raw as `# Output Style: <name>\n<prompt>`; there is no import expansion, no
inheritance keyword, no way to have two styles live at once. Anything shared between ELI5 and
output-fun must either be duplicated inside each style file, or moved out of the style layer
entirely.

## Practical options for sharing rules across styles

Ranked best-first for the concrete goal (shared typography/emoji/link/question rules living in
exactly one file, valid under both styles).

1. **Move the shared block to `~/.claude/rules/`.** One file, e.g.
   `~/.claude/rules/voice-formatting.md`, loaded unconditionally in every session under every
   style. Each output style then holds only its distinctive voice. *Tradeoff:* delivered as a
   user message after the system prompt rather than inside it, so adherence is a notch weaker
   than the style body — and the global CLAUDE.md already records that this is exactly why the
   rules were put in the style in the first place. Mitigate with sharp, imperative phrasing.
   Cheapest to maintain by far, and rules are the only sharing mechanism Anthropic documents
   with symlink support.

2. **Keep the shared block in a source file and generate both style files from it.** A tiny
   `script/output-styles.mjs` (this repo already has the zx toolchain) concatenates
   `shared-voice.md` + `voice-eli5.md` / `voice-fun.md` into the two style files, run as part of
   `pnpm dotfiles apply` or a lefthook step. *Tradeoff:* one source of truth and full system-prompt
   adherence retained — the best of both — at the cost of a build step, generated files in git,
   and the risk of someone editing the generated file by hand. This is the option to pick if
   adherence matters more than simplicity.

3. **Symlink a shared file into `~/.claude/rules/` from the dotfiles tree.** Mechanically a
   variant of (1), but it fits the repo's mirror rule directly: put the file at
   `home/.claude/rules/voice-formatting.md` and `pnpm dotfiles apply` links it like everything
   else. *Tradeoff:* same adherence caveat as (1); no extra machinery, and it stays in the
   existing dotfiles model rather than inventing a build step.

4. **Collapse the two styles into one.** Given ELI5 and output-fun differ mainly in register,
   a single style with a short "when asked to explain simply, do X" clause may cover both.
   *Tradeoff:* loses the hard mode switch and the `/config` picker affordance; the ELI5 register
   becomes something Claude has to elect rather than something enforced by the prompt.

5. **`--append-system-prompt` with a shared file.** Full system-prompt placement, single source
   file. *Tradeoff:* must be passed on **every** invocation and there is no settings.json key
   for it — it would mean wrapping `claude` in a shell function, which breaks any launch path
   that doesn't go through the alias (IDE integrations, `claude` invoked by other tooling,
   Claude Desktop). Fragile; only worth it if a wrapper already exists.

6. **`SessionStart` hook emitting `additionalContext`.** Works, single source file.
   *Tradeoff:* weakest adherence of all the options (mid-conversation feedback channel, not the
   system prompt), adds a process spawn to every session start, and puts formatting rules in the
   place the docs reserve for enforcement and event-driven work. Not recommended for this.

Duplicating the block across both style files is the do-nothing baseline: maximum adherence,
guaranteed drift. Every option above trades some adherence for eliminating that drift, except
(2), which trades machinery instead.
