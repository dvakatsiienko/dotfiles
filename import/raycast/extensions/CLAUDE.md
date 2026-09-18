# raycast extensions — every dir here is one private extension (x-ray, …)

- **keep raycast in dev mode while you code**: run `pnpm dev` (`ray develop`) in the extension dir
  and leave it running for the whole job — every save rebuilds and reloads the command in raycast,
  so dima sees each change live. stop it only at the end. a `ray build` alone registers nothing new.
  📌 first check whether one already runs — dima may have started it on his side: `ps -eo pid,command | grep '[r]ay develop'`; a live one means you start nothing and stop nothing.
- **the type gate is `pnpm typecheck`**, never `ray build` — ray bundles with esbuild and prints
  success over type errors (typescript 7 is the native port; ray finds no compiler api).
- each extension is a member of the dotfiles pnpm workspace: no own lockfile, no own typescript;
  `pnpm install` from the repo root; esbuild's build script is allowed in the root
  `pnpm-workspace.yaml`.
- biome only (root `biome.jsonc` re-includes this path); no eslint, no prettier, no `ray lint`.
- icons: 512×512 png, rounded-square tile (~22 % radius), transparent outside the tile; an emoji
  string is a valid raycast image source — flags and glyphs need no png.
- command titles and the extension title are lowercase.
