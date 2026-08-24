-- VSCode Neovim specific settings, loaded from init.lua only when vim.g.vscode is set

-- VSCodeCommentary for commenting functionality
vim.keymap.set({ "x", "n", "o" }, "gc", "<Plug>VSCodeCommentary")
vim.keymap.set("n", "gcc", "<Plug>VSCodeCommentaryLine")

-- multi-cursor highlight color (vscode-multi-cursor.nvim)
vim.api.nvim_set_hl(0, "VSCodeCursor", { bg = "#ffe100", fg = "black", default = true })
vim.api.nvim_set_hl(0, "VSCodeCursorRange", { bg = "#ffe100", fg = "black", default = true })

-- soft-wrap navigation: vscode owns the wrapping, so j/k must reach the extension's
-- gj/gk, which forward to vscode's cursorMove. remap = true is load-bearing —
-- noremap hits nvim's builtin gj, a no-op because the extension forces nowrap.
local function visual_line(key)
  return function()
    return vim.v.count == 0 and ("g" .. key) or key
  end
end

vim.keymap.set({ "n", "x" }, "j", visual_line("j"), { expr = true, remap = true, silent = true })
vim.keymap.set({ "n", "x" }, "k", visual_line("k"), { expr = true, remap = true, silent = true })
vim.keymap.set({ "n", "x" }, "0", "g0", { remap = true, silent = true })
vim.keymap.set({ "n", "x" }, "$", "g$", { remap = true, silent = true })
