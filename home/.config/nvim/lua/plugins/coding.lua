return {
  -- vim-surround experience: ys / cs / ds / visual S
  -- Runs inside vscode-neovim's embedded Neovim too, so it stays enabled in VSCode/Cursor.
  -- cond = true overrides the blanket plugin allowlist that LazyVim's `vscode`
  -- extra installs as a global default cond under vim.g.vscode (it only
  -- whitelists mini.surround by name, not this plugin).
  {
    "kylechui/nvim-surround",
    version = "*",
    event = "VeryLazy",
    cond = true,
    opts = {},
  },
  -- flash.nvim's default `s`/`S` jump binds shadow nvim-surround's cs/ds/ys in
  -- operator-pending mode under vscode-neovim. Cursor's own search/jump UI
  -- already covers this, so disable flash there and free up `s` for surround.
  {
    "folke/flash.nvim",
    enabled = not vim.g.vscode,
  },
}
