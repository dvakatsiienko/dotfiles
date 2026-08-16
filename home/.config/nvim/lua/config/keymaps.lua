-- Keymaps are automatically loaded on the VeryLazy event
-- Default keymaps that are always set: https://github.com/LazyVim/LazyVim/blob/main/lua/lazyvim/config/keymaps.lua

-- paste without overriding the register
vim.keymap.set("v", "p", "P")

-- redo
vim.keymap.set("n", "U", "<C-r>")

if vim.g.vscode then
  -- start multi-cursor word selection (vscode-multi-cursor.nvim)
  vim.keymap.set("n", "<C-d>", "mciw*<Cmd>nohl<CR>", { remap = true })
end
