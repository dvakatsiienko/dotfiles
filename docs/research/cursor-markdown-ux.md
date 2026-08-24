# cursor markdown ux

reading and editing `.md` in cursor with the vim binding kept, on a wide monitor.
researched 2026-08-24. every config claim below is checked against the versions actually installed
on this mac — cursor's shipped bundle and `asvetliakov.vscode-neovim` 1.19.0 — not against docs.

## tldr — the three moves

1. **map `j`/`k` to `gj`/`gk` with `remap = true`, never `noremap`.** the extension already binds
   `gj`/`gk`/`g0`/`g$` to vscode's own wrapped-line motions. a non-recursive map bypasses them and
   is exactly why "j → gj doesn't work" is the most-repeated complaint in that repo. this single
   line is the whole soft-wrap cure.
2. **turn wrap back on for markdown only**, bounded to a column, so code files stay unwrapped:
   `"[markdown]": { "editor.wordWrap": "bounded", "editor.wordWrapColumn": 100 }`.
3. **per-language font works** — `"[markdown]": { "editor.fontFamily": "iA Writer DuoS" }`. this is
   the ia-writer-feel-inside-cursor move, and the web says it is impossible. the web is stale.

moves 1 and 2 together mean **hard wrapping is optional**, not required. see the lane below anyway.

## 1. the soft-wrap fix

### why it breaks today

three facts stack up.

- **the extension forces `wrap = false` inside nvim.** it is not a preference —
  `runtime/lua/vscode/force-options.lua` sets `opt.wrap = false` on `VimEnter`, `BufEnter` and
  `FileType`. nvim never wraps, so nvim's own `gj`/`gk` collapse to plain `j`/`k`.
- **nvim's window is not the viewport.** `vscode-neovim.neovimWidth` is a fixed number unrelated to
  the editor's real width, so nvim could not compute display lines even if wrap were on.
- **vscode does the wrapping, and the extension forwards the motions to it.** the whole of
  `runtime/vscode/overrides/vscode-motion.vim`:

  ```vim
  function! s:toFirstCharOfScreenLine()
      call VSCodeNotify('cursorMove', { 'to': 'wrappedLineFirstNonWhitespaceCharacter' })
  endfunction

  function! s:toLastCharOfScreenLine()
      call VSCodeNotify('cursorMove', { 'to': 'wrappedLineLastNonWhitespaceCharacter' })
      " Offfset cursor moving to the right caused by calling VSCode command in Vim mode
      call VSCodeNotify('cursorLeft')
  endfunction

  nnoremap g0 <Cmd>call <SID>toFirstCharOfScreenLine()<CR>
  nnoremap g$ <Cmd>call <SID>toLastCharOfScreenLine()<CR>

  " Note: Using these in macro will break it
  nnoremap gk <Cmd>call VSCodeNotify('cursorMove', { 'to': 'up', 'by': 'wrappedLine', 'value': v:count1 })<CR>
  nnoremap gj <Cmd>call VSCodeNotify('cursorMove', { 'to': 'down', 'by': 'wrappedLine', 'value': v:count1 })<CR>
  ```

📌 the answer to the key lead: **yes, mapping `j`/`k` → `gj`/`gk` fully cures soft-wrap navigation
in normal mode**, and `g0`/`g$` already exist. the catch is `remap`, and the caveats are visual
mode, operator-pending and macros — all listed below.

### the config

this goes in the nvim config, not `settings.json` — that is the vscodevim answer, and vscodevim is
not what is installed here. the vscode-only block already exists at
[`lua/config/vscode.lua`](../../home/.config/nvim/lua/config/vscode.lua):

```lua
-- soft-wrap navigation: vscode owns the wrapping, so j/k must reach the extension's
-- gj/gk, which forward to vscode's cursorMove. remap = true is load-bearing —
-- noremap hits nvim's builtin gj, which is a no-op because the extension forces nowrap.
local function visual_line(key)
  return function()
    return vim.v.count == 0 and ("g" .. key) or key
  end
end

vim.keymap.set({ "n", "x" }, "j", visual_line("j"), { expr = true, remap = true, silent = true })
vim.keymap.set({ "n", "x" }, "k", visual_line("k"), { expr = true, remap = true, silent = true })
vim.keymap.set({ "n", "x" }, "0", "g0", { remap = true, silent = true })
vim.keymap.set({ "n", "x" }, "$", "g$", { remap = true, silent = true })
```

the `v:count` guard keeps `10j` meaning ten real lines — which is what relative line numbers are
for — while a bare `j` moves one visual line. drop the guard if you want `10j` to be ten visual
lines too; `gj` already honours the count via `v:count1`.

if the arrow keys are also in play, add `<Down>`/`<Up>` to the same `vim.keymap.set` mode list.

### what this does not cover

- ⚠️ **visual and operator-pending modes are not fixed by the extension.** the four overrides are
  `nnoremap` — normal mode only. adding `"x"` above is harmless but is a no-op: in visual mode the
  map resolves to nvim's builtin `gj`, which does nothing under forced `nowrap`. `d g$` likewise
  deletes to the end of the *logical* line. this is upstream
  [issue #2493](https://github.com/vscode-neovim/vscode-neovim/issues/2493), still open.
- ⚠️ **macros break.** the extension's own source comment says so: `gj`/`gk` are asynchronous
  `VSCodeNotify` calls, so a macro recorded with `q` that contains `j` will replay wrong. if macros
  over prose matter, gate the maps behind a toggle and turn them off while recording.
- 📌 **`g0` is really `g^`.** the extension binds `g0` to `wrappedLineFirstNonWhitespaceCharacter`,
  not to column zero. mapping `0` → `g0` therefore lands on the first non-blank of the screen line.
  usually what you want in prose; not what vim's `0` classically means.
- there is a community plugin,
  [`vscode-neovim-fix-word-wrap`](https://github.com/YouSame2/vscode-neovim-fix-word-wrap), that
  wraps this same technique plus macro-safety. **5 stars, last pushed 2025-09** — it fails the
  top-tier bar. take the four lines above instead; the plugin's value is the idea, not the code.

### the redundant line

[`lua/config/options.lua`](../../home/.config/nvim/lua/config/options.lua) sets `vim.opt.wrap =
false` under `if vim.g.vscode`. harmless, but dead: `force-options.lua` sets it anyway, on three
autocmds, and cannot be overridden. safe to delete.

## 2. the hard-wrap lane

### where things stand right now

- `[markdown]` is already formatted by `esbenp.prettier-vscode`, and conform.nvim routes markdown to
  prettier too — the two agree.
- there is **no prettier config anywhere in `dotfiles`**, so prettier runs on defaults:
  `printWidth: 80`, **`proseWrap: "preserve"`**. preserve means prettier does not touch prose
  wrapping at all. so today, nothing rewraps.
- `"editor.formatOnSave": false` globally, so markdown is only formatted on demand.
- **biome will not close this gap.** its [2026 roadmap](https://biomejs.dev/blog/roadmap-2026/) says
  markdown parsing is not resourced. the `.md` → prettier note in `settings.json` stays true.

### enabling it

`.prettierrc` at the repo root, plus one line of settings:

```json
{
  "printWidth": 100,
  "proseWrap": "always"
}
```

```jsonc
"[markdown]": { "editor.formatOnSave": true },
```

`proseWrap` takes exactly three values — `"always"` (wrap to `printWidth`), `"never"` (one line per
paragraph), `"preserve"` (default, hands off).

### the tradeoffs, honestly

- **diff noise is real.** adding one word to a paragraph reflows every line after it. a one-word
  change becomes a six-line diff. this is the reason prettier ships `preserve` as the default —
  their docs cite linebreak-sensitive renderers as the motivation.
- **it will fight the hand-set breaks.** the files under `home/.claude/rules/` are wrapped by hand
  at ~100 with breaks chosen for rhythm. `proseWrap: "always"` reflows all of them on first save,
  and the em-dash-and-clause cadence goes with it. if this lane is taken, scope it: a
  `.prettierignore` covering `home/.claude/**` and `CLAUDE.md`, or an `overrides` block in
  `.prettierrc` limiting `proseWrap: "always"` to `docs/**`.
- **the non-classic alternative: one sentence per line.** keep `proseWrap: "preserve"`, and break
  after every sentence or clause. diffs become one line per changed sentence — strictly better than
  either wrap mode — and no tool has to run. cost: you must write that way, and rendered output is
  unaffected either way since markdown joins soft breaks. it also composes with move 1 rather than
  competing: short logical lines mean fewer wrapped lines to navigate.

📌 **recommendation: skip lane 2, or take the one-sentence-per-line variant.** with moves 1 and 2 in
place, the reason to hard-wrap is gone — the narrow column is a render setting now, not a file
property. the remaining argument for hard wrap is diffs, and one-sentence-per-line beats
`proseWrap: "always"` on exactly that axis.

## 3. settings

everything below is language-scoped, so code files are untouched. **verified**: the `editor`
configuration node ships with `scope: 6` — language-overridable — in cursor's bundle, and the
workbench re-reads editor options through `textResourceConfigurationService` on every
`onDidChangeModelLanguage`. per-language `editor.*` really does apply, `fontFamily` included.

```jsonc
"[markdown]": {
  // narrow column on a 32" — "bounded" wraps at min(viewport, wordWrapColumn)
  "editor.wordWrap": "bounded",
  "editor.wordWrapColumn": 100,
  "editor.wrappingIndent": "same",

  // the ia writer feel. DuoS is duospaced — tables and code fences still align.
  // swap to "iA Writer QuattroS" for proportional prose, at the cost of ragged tables.
  "editor.fontFamily": "iA Writer DuoS, Hack Nerd Font Mono, monospace",
  "editor.fontSize": 17,
  "editor.lineHeight": 1.7,
  "editor.fontLigatures": false,

  // prose is not code
  "editor.rulers": [100],
  "editor.minimap.enabled": false,
  "editor.quickSuggestions": { "other": "off", "comments": "off", "strings": "off" },
  "editor.suggestOnTriggerCharacters": false,
  "editor.stickyScroll.enabled": false,
  "editor.occurrencesHighlight": "off",

  // typewriter scrolling — keeps the caret vertically centred. see the caveat below.
  "editor.cursorSurroundingLines": 999,
  "editor.cursorSurroundingLinesStyle": "all"
},
```

notes on the block:

- `"bounded"` is the setting that matters on a wide monitor. `"on"` wraps at the viewport, which on a
  32" is still too wide; `"wordWrapColumn"` ignores the viewport entirely and overflows in a narrow
  split. `bounded` takes the smaller of the two. confirmed in the layout code: `on` and `bounded`
  both set viewport wrapping, `wordWrapColumn` sets a fixed column.
- `wordWrapColumn` defaults to `80`, so it must be set explicitly for 100.
- `editor.renderWhitespace: "boundary"` — already global — renders everything **except** single
  spaces between words, so prose stays clean and trailing spaces (markdown's hard break) become
  visible. no override needed. leave it.
- ⚠️ `editor.cursorSurroundingLines` is **not confirmed under vscode-neovim**. the extension has no
  `scrolloff` sync and scrolling is vscode's job, so it should work, but it was not tested here.
  five seconds to check: set it, hold `j`, see whether the caret pins to the middle.
- fonts install cleanly: `brew install --cask font-ia-writer-duo font-ia-writer-quattro`. the casks
  pull from [`iaolo/iA-Fonts`](https://github.com/iaolo/iA-Fonts) — 4.1k stars, stable since 2023,
  and fonts do not rot. family names are `iA Writer DuoS` / `iA Writer QuattroS` for the static cut,
  `…DuoV` / `…QuattroV` for the variable one. worth adding to the `Brewfile` next to
  `font-hack-nerd-font`.
- the preview pane takes its own font: `"markdown.preview.fontFamily"` and
  `"markdown.preview.fontSize"` (the latter is already 16).

### centred layout on a wide monitor

built in, no extension:

- `workbench.action.toggleCenteredLayout` — pins the editor to the middle of the window. bind it.
- `"workbench.editor.centeredLayoutFixedWidth": true` — default `false`, which makes the centred
  width follow the window. set it to `true` for a stable column.
- `"workbench.editor.centeredLayoutAutoResize": true` (default) — expands back when a second group
  opens.

zen mode is the heavier version, and its knobs are `zenMode.fullScreen`, `zenMode.centerLayout`,
`zenMode.showTabs`, `zenMode.hideLineNumbers`, `zenMode.hideActivityBar`, `zenMode.hideStatusBar`,
`zenMode.silentNotifications`, `zenMode.restore`. all verified present in the shipped bundle.

## 4. extensions

install counts and last-updated dates are from the marketplace api on 2026-08-24.

| extension | what it does | why it clears the bar |
| --- | --- | --- |
| `DavidAnson.vscode-markdownlint` | lint + autofix for markdown style | 12.0M installs, updated **2026-08-02** — the freshest thing in the category, single maintainer who ships constantly. `MD013` is the line-length rule; set `line_length: 100`, or turn it off if lane 2 is skipped |
| `yzhang.markdown-all-in-one` | TOC generation, list continuation, table formatting, section folding, math | 14.3M installs, the category default for a decade. table formatter and TOC are the two things nothing else does as well |
| `bierner.markdown-mermaid` | mermaid diagrams inside the **built-in** preview | 5.2M installs, updated 2026-05. by a vscode core maintainer. lighter than the vendor `mermaidchart` extension already installed, and it extends the native preview instead of adding a second one |
| `esbenp.prettier-vscode` | the markdown formatter | 71M installs — already installed and already wired to `[markdown]`. only relevant if lane 2 is taken |
| `shd101wyy.markdown-preview-enhanced` | pandoc/pdf/html export, presentation mode | 10.1M installs, updated 2026-06. **only if export is needed** — it replaces the native preview and brings its own everything. otherwise it is weight |

### deliberately not recommended

- **`mushan.vscode-paste-image`** — last updated **2019**. dead, and unnecessary: cursor has this
  built in. `markdown.editor.filePaste.enabled`, `markdown.editor.drop.enabled`,
  `markdown.copyFiles.destination`, plus `markdown.editor.pasteUrlAsFormattedLink.enabled` and
  `markdown.editor.updateLinksOnPaste.enabled`. all verified in the shipped
  `markdown-language-features` extension. paste an image, get a link and a file.
- **`be5invis.vscode-custom-css`** — the usual "custom CSS in vscode" answer. it patches the
  application bundle in place, so every cursor update breaks it and raises the *installation is
  corrupt* banner. with per-language `editor.fontFamily` working, the main reason to reach for it
  is gone.
- **`fcrespo82.markdown-table-formatter`** — 2023, 124k installs. prettier and markdown-all-in-one
  both format tables already.
- **`takumii.markdowntable`**, **`tchayen.markdown-links`** — small install bases, no active
  development. skip.

## 5. non-classic approaches

- **a dedicated writing profile.** cursor inherits vscode profiles:
  `workbench.action.switchProfile`. a `writing` profile can carry iA fonts globally, wrap on,
  centred layout, line numbers off, and only the markdown extensions enabled — the closest thing to
  launching iA writer without leaving the editor or losing vim. cost: switching profiles reloads
  the window, so it is a mode you enter, not a thing you toggle mid-thought. the per-language block
  in section 3 gets ~80% of this with zero switching, which is why it is the recommendation and this
  is the alternative.
- **`vscode-neovim.editorLangIdExclusions`** — the extension can be disabled per language id.
  setting it to `["markdown"]` gives a pure, unmodal reading surface for `.md`. listed for
  completeness; it trades away the thing that must be kept, so it is almost certainly wrong here.
- **markdown preview locked side-by-side.** `markdown.preview.scrollPreviewWithEditor` and
  `markdown.preview.scrollEditorWithPreview` are both on by default — `cmd+k v` opens the preview
  beside the source and the two scroll together. a reading mode that costs nothing and keeps the
  vim buffer live in the other pane.
- **`markdown.styles`** takes a list of stylesheet urls for the preview. a small local CSS file with
  iA Writer Quattro, a 68ch measure and generous leading turns the preview into a genuine reading
  view — and unlike `vscode-custom-css`, it is a supported setting that survives updates.
- **the outline view is the TOC.** built in, no extension: it renders the header tree for the active
  markdown file and is filterable. markdown-all-in-one is for writing a TOC *into* the document;
  outline is for navigating one.

## sources

- [`asvetliakov.vscode-neovim` README](https://github.com/vscode-neovim/vscode-neovim) — and the
  installed 1.19.0 bundle, which is what the motion and forced-option claims are read from
- [discussion #1253](https://github.com/vscode-neovim/vscode-neovim/discussions/1253) — the
  maintainer's statement that vim wrap is forced off and motions must be forwarded to vscode
- [discussion #2503](https://github.com/vscode-neovim/vscode-neovim/discussions/2503) — the
  `remap = true` vs `noremap = true` resolution
- [issue #2493](https://github.com/vscode-neovim/vscode-neovim/issues/2493) — operator-pending
  `g0`/`g$`, open
- [vscode built-in commands](https://code.visualstudio.com/api/references/commands) — `cursorMove`
  argument reference
- [vscode markdown docs](https://code.visualstudio.com/docs/languages/markdown)
- [prettier options](https://prettier.io/docs/options) — `proseWrap`, `printWidth`
- [markdownlint rules](https://github.com/DavidAnson/markdownlint/blob/main/doc/Rules.md) — `MD013`
- [biome 2026 roadmap](https://biomejs.dev/blog/roadmap-2026/) — markdown not resourced
- [iA-Fonts](https://github.com/iaolo/iA-Fonts)
