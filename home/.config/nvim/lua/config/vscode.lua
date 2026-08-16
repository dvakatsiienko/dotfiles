-- VSCode Neovim specific settings, loaded from init.lua only when vim.g.vscode is set

-- VSCodeCommentary for commenting functionality
vim.keymap.set({ "x", "n", "o" }, "gc", "<Plug>VSCodeCommentary")
vim.keymap.set("n", "gcc", "<Plug>VSCodeCommentaryLine")

-- multi-cursor highlight color (vscode-multi-cursor.nvim)
vim.api.nvim_set_hl(0, "VSCodeCursor", { bg = "#ffe100", fg = "black", default = true })
vim.api.nvim_set_hl(0, "VSCodeCursorRange", { bg = "#ffe100", fg = "black", default = true })
