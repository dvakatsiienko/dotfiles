---
dies-when: FRM-26's readme ships and its tricks are folded into it
---
Ticket: FRM-26

# github readme look — what renders, what to steal

Verified = the source was opened on 2026-09-23. «unverified» = from memory or a secondary source, not opened.

## 1. layout: what github markdown allows

- the sanitizer allowlist (html-pipeline, the lib github's own filter is derived from) permits `div p span img picture source details summary table figure kbd sub sup` and more. `style`, `<style>` and `<script>` are dropped. [sanitization_filter.rb](https://raw.githubusercontent.com/gjtorikian/html-pipeline/main/lib/html_pipeline/sanitization_filter.rb)
  - global attributes include `align`, `width`, `height`, so `<img align="right" width="…">` and `<p align="center">` survive. same source.
  - 📌 github.com runs its own fork of the filter, so the exact list there is «unverified»; the attributes above are proven in the wild (starship's readme uses `align="right"` and `align="center"`, checked via `gh api repos/starship/starship/readme`).
- `<picture>` is officially supported. [github docs, basic formatting](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax)
- theme switching uses `<picture>` + `<source media="(prefers-color-scheme: dark)">`. [github changelog 2022-05-19](https://github.blog/changelog/2022-05-19-specify-theme-context-for-images-in-markdown-beta/)
- `<details>`/`<summary>` collapse any markdown, and `open` expands it by default. You need a blank line after `</summary>` or the markdown will not render. [github docs, collapsed sections](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/organizing-information-with-collapsed-sections)

**float-right ascii art next to a left toc: yes, with an image, not with text.**

- `align="right"` floats only an `<img>`/`<picture>`, not a `<pre>` block, because the ascii art has to be an image. Render it to an svg with a `<text>` per line (or export it from a vhs/ansi tool). Then the markdown list after it wraps on the left.
- a `<pre>` cannot float. The only text-side-by-side option is a borderless-looking 2-cell `<table>`, but github always draws table borders, so it reads as a table. «unverified» that no trick removes the borders; none is known to work because `style` is stripped.

```html
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/readme/frame-ascii-dark.svg">
  <img align="right" width="320" alt="frame, drawn in ascii" src="docs/readme/frame-ascii-light.svg">
</picture>

**contents**

- [mirror](#mirror) — `home/` is `~`
- [machine](#machine) — brew, defaults, duti
- [fleet](#fleet) — skills, sline, cclio
- [setup](#setup)

<br clear="right">
```

- limits:
  - mobile (github app and narrow web): the float collapses and the image stacks above the toc. That is fine, just keep `width` ≤ ~340 so it never overflows. «unverified» on the app, observed behaviour on the web.
  - end the float with `<br clear="right">` or the next heading wraps beside the art too. `clear` on `br` is inherited html; it works on github.com but is «unverified» against the sanitizer source.
  - `align` belongs on the `<img>` inside `<picture>`, not on `<picture>`. This is the common pattern in readmes; «unverified» for the other placement.
  - dark mode: the `<picture>` handles it. A single svg with its own `@media (prefers-color-scheme: dark)` works too (section 2).
  - the toc: github already renders an auto outline button on every readme, so the hand toc is decoration. Keep it short.

## 2. theme-aware animated svg banners

- the technique: an svg FILE referenced by `<img>` can hold `<style>`, css `@keyframes` and SMIL, and they play. `<foreignObject>` embeds html inside. [css-tricks, custom styles in readmes](https://css-tricks.com/custom-styles-in-github-readmes/)
- one file serves both themes when it has `@media (prefers-color-scheme: dark)` inside its `<style>`. The image follows the os/browser scheme, not github's own theme toggle, so a user on «dark github, light os» sees the light variant. `<picture>` with two files follows the same media query. «unverified» which one tracks github's in-page theme setting.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 160" role="img" aria-label="frame">
  <style>
    :root { --bg:#f4ecdf; --fg:#2b2233; --glow:#c2477a; }
    @media (prefers-color-scheme: dark) { :root { --bg:#14111c; --fg:#e8d9ff; --glow:#ff6fae; } }
    rect { fill: var(--bg); }
    path { fill: var(--fg); }
    .scan { fill: var(--glow); opacity:.08; animation: scan 6s linear infinite; }
    @keyframes scan { from { transform: translateY(-160px) } to { transform: translateY(160px) } }
    @media (prefers-reduced-motion: reduce) { .scan { animation: none } }
  </style>
  <rect width="800" height="160"/>
  <!-- wordmark as outlined <path>, never <text> with a web font -->
  <rect class="scan" width="800" height="40"/>
</svg>
```

- gotchas:
  - fonts: an `<img>` svg is sandboxed, with no external fetches, so `@import` and google-font urls fail. Either outline the text to paths (the safe path) or base64-embed a woff2 in `@font-face`. System fonts also work. [css-tricks](https://css-tricks.com/custom-styles-in-github-readmes/). The base64 route is «unverified» here.
  - external images inside the svg do not load either (same sandbox); embed them as `data:` uris. «unverified».
  - animations play, but there is no interaction: no hover and no js. Keep them slow and low-contrast. 📌 dima's rule against continuously repainting css applies, so prefer a finite `animation-iteration-count` or a long idle gap.
  - caching: images in a readme are proxied through `camo.githubusercontent.com`. A repo-relative svg (`docs/readme/banner.svg`) is served from `raw`/the blob and updates on push. External urls (badges, hosted svgs) can go stale behind camo and depend on the origin's `Cache-Control`. The github doc on anonymized urls was a 404 when fetched, so the details are «unverified»; the old doc path was `docs.github.com/…/about-anonymized-urls`.
  - `<foreignObject>` html renders inconsistently across browsers (safari especially). Pure svg shapes and text are safer. «unverified».
- examples (checked via `gh api …/readme`):
  - [catppuccin/catppuccin](https://github.com/catppuccin/catppuccin): six `<picture>` blocks with `prefers-color-scheme`, svg logos and palette strips.
  - [sindresorhus/awesome](https://github.com/sindresorhus/awesome): a `<picture>`-switched svg header, centered.
  - [readme-SVG toolkit](https://github.com/readme-SVG): generated animated svgs (typing and similar). A quick look only, «unverified» quality.

## 3. badges

- [shields.io](https://shields.io/badges/static-badge) is still the standard.
  - params: `style` = `flat` · `flat-square` · `plastic` · `for-the-badge` · `social`
  - `color` (right half) and `labelColor` (left half) take hex/rgb/hsl/css names.
  - `logo` = a [simple-icons](https://simpleicons.org) slug, and `logoColor` sets its color.
  - static path: `label-message-color`, where `_` or `%20` is a space and `--` is a literal dash. All from the source above.
- alternatives: [badgen.net](https://badgen.net) (faster, fewer styles) and github's own workflow badge `https://github.com/<o>/<r>/actions/workflows/<file>.yml/badge.svg`. That one is first-party with no camo staleness risk; it is «unverified» in this pass, but it is the documented actions badge url.
- badges that carry information for frame:
  - ci: the github actions workflow badge. Only add it if a workflow exists; frame's gates are lefthook-local, so there may be nothing to badge (check `.github/workflows`).
  - node: `https://img.shields.io/badge/node-24-…?logo=nodedotjs`, static. The dynamic `github/package-json/v` style reads `engines` via `/github/package-json/<field>` («unverified» for nested `engines.node`).
  - pnpm: static, from `packageManager`. `pnpm toolchain:sync` owns the source of truth, so a static badge drifts. Either regenerate it in that script or skip it.
  - last commit: `https://img.shields.io/github/last-commit/dvakatsiienko/frame`. Useful: it says «alive».
  - license: `github/license/<o>/<r>`.
  - stack: static `macos` · `claude code` · `typescript` badges with logos. Cheap, and they tell a visitor the tiers at a glance.
  - drop star and follower counts: no information for this repo.
- retro palette: `style=flat-square`, then a dark `labelColor` plus a muted neon `color`. Catppuccin does exactly this: `?colorA=363a4f&colorB=f5…` (checked via `gh api`).

```md
![last commit](https://img.shields.io/github/last-commit/dvakatsiienko/frame?style=flat-square&labelColor=1b1726&color=c2477a)
![node](https://img.shields.io/badge/node-24-7fb8a4?style=flat-square&labelColor=1b1726&logo=nodedotjs&logoColor=7fb8a4)
![claude code](https://img.shields.io/badge/claude_code-fleet-e0a458?style=flat-square&labelColor=1b1726&logo=anthropic&logoColor=e0a458)
```

  - `logo=anthropic` exists in simple-icons: «unverified».
- 📌 a badge palette in two themes: shields renders one svg for both, so pick mid-tone colors that read on both backgrounds, or wrap the badge row in `<picture>`, which is heavy and not worth it.

## 4. standout-but-tasteful readmes (checked via `gh api …/readme`)

- [catppuccin/catppuccin](https://github.com/catppuccin/catppuccin): the palette IS the look, with the same hexes in svg strips and badge `colorA`/`colorB`. Steal: one palette carried through banner, badges and dividers.
- [charmbracelet/gum](https://github.com/charmbracelet/gum): 13 gifs, one vhs tape per command. Steal: a small gif beside each feature, not one giant demo.
- [starship/starship](https://github.com/starship/starship): a centered hero, `flat-square` badges and an `align="right"` image in the body. Steal: the right-floated image next to text, the exact pattern from section 1.
- [sindresorhus/awesome](https://github.com/sindresorhus/awesome): a theme-switched svg header via `<picture>`. Steal: two-file dark/light banners.
- [mathiasbynens/dotfiles](https://github.com/mathiasbynens/dotfiles): the plain canonical dotfiles readme. Steal the restraint (install, then what's inside), not the look. «unverified» (not re-opened).

## 5. images recipe

- [unsplash api](https://unsplash.com/documentation): free under the Unsplash license. The api guidelines require crediting the photographer and unsplash and hotlinking via their urls. «unverified» this pass.
- [pexels api](https://www.pexels.com/api/documentation/): free to use, and the api terms ask for a visible «photos provided by pexels» link. «unverified».
- [openverse api](https://api.openverse.org/v1/): CC/public-domain search, anonymous access is rate-limited, and `license=cc0,pdm` filters to no-attribution items. The docs page did not render when fetched, so this is «unverified».
- [wikimedia commons](https://commons.wikimedia.org/wiki/Commons:Reusing_content_outside_Wikimedia): per-file license; PD/CC0 needs no credit, CC-BY needs author + license + link. «unverified».
- 📌 simplest for frame: ship only self-made svg/vhs output (no license question at all), and use CC0/PD from openverse when a photo is truly needed.

## 6. `vhs` for readme gifs

- source: [charmbracelet/vhs](https://github.com/charmbracelet/vhs) (opened).
  - a `.tape` sets `Output`, `Require`, `Set` (FontSize, Width, Height, Theme, TypingSpeed, Framerate, PlaybackSpeed, Padding), then `Type`, `Enter`, `Sleep`, and `Hide`/`Show` to keep setup off-camera.
  - several `Output` lines render gif + mp4/webm in one run.
  - `vhs publish` hosts the result on vhs.charm.sh.

```tape
Output docs/readme/sline.gif
Require sline
Set Theme "Catppuccin Mocha"
Set FontSize 18
Set Width 900
Set Height 360
Set Framerate 24
Set TypingSpeed 60ms
Hide
Type "clear" Enter
Show
Type "pnpm frame:link status" Sleep 300ms Enter
Sleep 2.5s
```

- keeping gifs light: these are the common practice, «unverified» against a single source.
  - small Width/Height (~800×400)
  - a Framerate of 15–24
  - short takes (<8 s), with `Hide` for setup
  - one gif per feature
  - run through `gifsicle -O3 --lossy=80` afterwards
  - or output `.webm`/`.mp4`: github renders an uploaded mp4 inline, but a repo-relative video in a readme does not play («unverified»), so gif stays the safe readme format.
- 📌 a custom vhs `Theme` json can carry the frame palette, so the terminal gifs match the banner and badges.
