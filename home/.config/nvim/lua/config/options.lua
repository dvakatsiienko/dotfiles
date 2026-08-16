-- Options are automatically loaded before lazy.nvim startup
-- Default options that are always set: https://github.com/LazyVim/LazyVim/blob/main/lua/lazyvim/config/options.lua

-- sync system clipboard with vim clipboard
vim.opt.clipboard = "unnamedplus"

if vim.g.vscode then
  -- spell checking and UI features interfere with VSCode
  vim.opt.spell = false
  vim.opt.spelllang = {}
  vim.opt.signcolumn = "no"
  vim.opt.wrap = false

  vim.api.nvim_create_autocmd("FileType", {
    pattern = "*",
    callback = function()
      vim.opt_local.spell = false
    end,
  })
end
