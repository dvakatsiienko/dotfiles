return {
  -- The biome and prettier extras both append their formatter to every filetype
  -- they support, which would run biome AND prettier on the same file.
  -- This override makes the split explicit:
  --   biome-check (format + organize imports + safe lint fixes, resolves the
  --   project's biome.jsonc which extends biome-config-polished) owns its
  --   supported filetypes; prettier only covers what biome cannot handle.
  {
    "stevearc/conform.nvim",
    opts = {
      formatters_by_ft = {
        javascript = { "biome-check" },
        javascriptreact = { "biome-check" },
        typescript = { "biome-check" },
        typescriptreact = { "biome-check" },
        json = { "biome-check" },
        jsonc = { "biome-check" },
        css = { "biome-check" },
        graphql = { "biome-check" },
        markdown = { "prettier" },
        ["markdown.mdx"] = { "prettier" },
        yaml = { "prettier" },
        html = { "prettier" },
        scss = { "prettier" },
        less = { "prettier" },
      },
    },
  },
}
