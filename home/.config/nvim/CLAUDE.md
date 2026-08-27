# CLAUDE.md

Neovim configuration based on **LazyVim** (v16+). Dual-mode: native Neovim and VSCode-Neovim (`vim.g.vscode`).

## Architecture

```
init.lua                  → requires config.lazy; loads config.vscode when vim.g.vscode
lua/config/
  lazy.lua                → lazy.nvim bootstrap + setup (spec imports lazyvim.plugins, then plugins/)
  options.lua             → auto-loaded by LazyVim before startup
  keymaps.lua             → auto-loaded by LazyVim on VeryLazy
  autocmds.lua            → auto-loaded by LazyVim
  vscode.lua              → NOT auto-loaded; required explicitly from init.lua in VSCode mode only
lua/plugins/              → every file returns lazy.nvim specs, auto-imported
  ui.lua                  → colorscheme (gruvbox)
  coding.lua              → nvim-surround (vim-surround port: ys/cs/ds/S)
  formatting.lua          → conform.nvim biome/prettier filetype split
  vscode.lua              → vscode-multi-cursor.nvim
lazyvim.json              → LazyVim extras registry (managed via :LazyExtras, editable by hand)
lazy-lock.json            → committed lockfile; update via :Lazy sync
```

LazyVim auto-loads exactly `config.options`, `config.keymaps`, `config.autocmds`. Any other module under `lua/config/` must be required explicitly.

## Usage context

- Primary usage is **Cursor via the [vscode-neovim](https://marketplace.cursorapi.com/items/?itemName=asvetliakov.vscode-neovim) extension** — not the native terminal Nvim. Native Nvim in a terminal is used rarely. Debugging keymap/plugin issues should start from the `vim.g.vscode` branch of the config.
- Owner is not a Lua/Vim expert — prefer well-known, high-leverage plugins over hand-rolled config, and explain non-obvious Vim motions/tricks when introducing them rather than assuming familiarity.
- Intent is a lean, fluent editing setup, not a full IDE-in-Nvim. Default to LazyVim's extras and small, focused plugins already in `lua/plugins/`; avoid adding heavy/overlapping plugins unless they clearly earn their spot.

## Resolved issues

- **Surround was broken under Cursor** (`ysiw"` etc. did nothing / dropped into flash.nvim's jump-label UI instead, or later just entered insert mode / jumped to line 1). Two separate bugs stacked on top of each other:
  1. `nvim-surround` was disabled under `vim.g.vscode`, and `vim.g.vscode_surround_enable` (meant to cover the gap) is a VSCodeVim setting, not a vscode-neovim one — a no-op leftover from an older config. With no plugin owning `cs`/`ds`/`ys`, plain `c` fell back to Vim's built-in change operator, and `s` resolved to flash.nvim's operator-pending jump motion instead. Fix: enable `nvim-surround` unconditionally (it runs fine inside vscode-neovim's embedded real Neovim) and disable `flash.nvim` under `vim.g.vscode` instead (Cursor's own search/jump UI covers that need), freeing `s` back up for surround.
  2. Even after that fix, `nvim-surround` still showed as **Disabled** in `:Lazy` under Cursor. Root cause: the `lazyvim.plugins.extras.vscode` extra (enabled via `lazyvim.json`) installs a global default `cond` for every plugin spec that doesn't set its own — an allowlist-by-plugin-name that only whitelists `mini.surround`, not `kylechui/nvim-surround`. `enabled` and `cond` are separate gates in lazy.nvim, so unconditionally setting `enabled = true` (bug 1's fix) didn't clear this. Fix: `cond = true` on the `nvim-surround` spec, explicitly overriding the extra's default.

## Conventions

- Formatting: stylua, 2-space indent, double quotes (`stylua.toml`). Run `stylua .` after editing Lua.
- One purposeful file per domain in `lua/plugins/` — no catch-all `plugins.lua`.
- Language/tooling support goes through LazyVim extras in `lazyvim.json`, not hand-rolled LSP setup.
- VSCode-only behavior is guarded by `vim.g.vscode` (plugin specs use `cond`/`enabled`, config uses `if vim.g.vscode`).
- No dead code: no commented-out blocks, no unused specs.
- `lazy-lock.json` is always committed together with plugin changes.

## Formatting/linting policy (biome + prettier)

- **biome** owns: js, jsx, ts, tsx, json, jsonc, css, graphql — via conform's `biome-check` (format + organize imports + safe fixes) and the biome LSP for diagnostics. Config resolves per-project `biome.jsonc`, which extends the shared `biome-config-polished` npm package. No global biome config lives in this repo.
- **prettier** owns only what biome can't: markdown, mdx, yaml, html, scss, less.
- The per-filetype lists in `lua/plugins/formatting.lua` intentionally *replace* the extras' appended defaults to prevent double-formatting.

## External dependencies

- `tree-sitter` CLI (npm global) — required by nvim-treesitter `main` branch to compile parsers
- `stylua` (brew) — Lua formatting
- node via fnm — mason package installs
- Mason-managed: vtsls, tailwindcss-language-server, biome, prettier, lua-language-server

## Verification

```sh
stylua --check .
nvim --headless "+lua print('ok')" +qa          # startup smoke test
nvim --headless "+Lazy! sync" +qa               # sync plugins + lockfile
nvim --headless -c "Lazy! load mason.nvim nvim-treesitter" -c "checkhealth lazy mason nvim-treesitter" -c "silent w! /tmp/health.txt" -c "qa!"
```

Commit only when explicitly asked.
