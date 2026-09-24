---
dies-when: FRM-258 ships the new profile page
---
Ticket: FRM-258

# github profile — tools, rules, voice, hero

verified = source opened or probed on 2026-09-24 (`gh api repos/…` for liveness, `curl -I` for headers). «unverified» = memory or a secondary source.

## verdict

- drop the 54 shields and the broken `Top Langs`: the public vercel instance is rate-limited and upstream now points to a successor; self-hosting is the only fix, and it is not worth it for one card.
- reuse frame's pixel badge generator for the profile: a weekly action in the profile repo commits the svgs, so camo sees repo files and one look carries across both repos.
- hero: a layered-paper t-rex svg with css-in-svg motion and `prefers-color-scheme` day/night. the text is short and about the work: agentic systems first, frontend second.

## 1. badge tools today

liveness = last push per `gh api repos/<r>` on 2026-09-24.

- [shields.io](https://shields.io/badges/static-badge) — alive. free, and self-hostable via docker.
  - static: `badge/label-message-color`
  - dynamic: [endpoint badge](https://shields.io/badges/endpoint-badge) reads your own json `{schemaVersion,label,message,color}`; also [dynamic json](https://shields.io/badges/dynamic-json-badge) by jsonpath.
- [badgen.net](https://badgen.net) — alive (pushed 2026-09-24). faster and plainer than shields, with fewer styles.
- [simple-icons](https://simpleicons.org) — alive (pushed 2026-09-20). it feeds shields' `logo=`. `claude` and `anthropic` slugs both answer 200 on `cdn.simpleicons.org` (probed).
- [skill-icons](https://github.com/tandpfun/skill-icons) — alive-ish (pushed 2026-02). renders a row of rounded icon tiles, `skillicons.dev/icons?i=ts,react,...`, on a free public instance. it is the compact replacement for 54 shields.
- [github-readme-stats](https://github.com/anuraghazra/github-readme-stats) — carries a deprecation notice pointing at [github-stats-extended](https://github.com/stats-organization/github-stats-extended) (successor, pushed 2026-09-23). it renders stats, top-langs and pin cards.
  - 📌 why `Top Langs` breaks: the shared `github-readme-stats.vercel.app` exhausts the github api quota and returns 503 / paused, so the image falls back to its alt text. see [issue #4431](https://github.com/anuraghazra/github-readme-stats/issues/4431).
  - fix: self-host with your own PAT, either as a [vercel fork](https://dev.to/uya0526design/self-host-your-github-stats-badge-on-vercel-fixing-the-broken-image-on-your-profile-readme-la0) or a [cloudflare worker fork](https://github.com/lukecartledge/github-readme-stats-worker). or drop the card.
- [readme-typing-svg](https://github.com/DenverCoder1/readme-typing-svg) — alive (pushed 2026-09-17). a typed-lines animated svg on a free public instance.
- [github-profile-trophy](https://github.com/ryo-ma/github-profile-trophy) — alive (pushed 2026-07). renders a trophy grid; the public instance has a history of rate-limit outages, so self-host on vercel if used («unverified» current status).
- [streak-stats](https://github.com/DenverCoder1/github-readme-streak-stats) — alive (pushed 2026-09-17). renders current and longest streak; public herokuapp/demo instance, self-host documented.
- [waka-readme](https://github.com/athul/waka-readme) — alive (pushed 2026-02). an action that writes a wakatime language/time bar into the readme. it needs a wakatime account and editor plugin.
- [activity graph](https://github.com/Ashutosh00710/github-readme-activity-graph) — alive (pushed 2026-05). a 30-day contribution line chart as an svg, on a public instance.
- [capsule-render](https://github.com/kyechan99/capsule-render) — alive (pushed 2026-09-24). renders a wave or banner header svg with text.

## 2. external vs in-house badges

yes, frame's `script/badges-sync.ts` pixel badges can serve the profile. the three options:

- (a) commit the svgs into the profile repo — simplest. repo-relative images update on push. but a copy drifts unless something recopies it.
- (b) reference `raw.githubusercontent.com/dvakatsiienko/frame/badges/<x>.svg` — works today for frame's ci badge. it answers `cache-control: max-age=300` and `content-type: image/svg+xml` (probed). but camo still sits in front, and camo is known to ignore the origin's `Cache-Control` ([community #156383](https://github.com/orgs/community/discussions/156383), [github/markup #224](https://github.com/github/markup/issues/224)), so updates can lag by hours or more.
- (c) a weekly action in the profile repo runs the generator and commits the svgs — ➡️ recommended. it keeps (a)'s freshness and removes the drift. the generator needs profile-level numbers (repos, commits, skills count) through `gh api`, not frame's local repo numbers.
- cache-busting: a `?v=<sha>` query on an external url forces a new camo key. the [github-badge-cache-buster](https://github.com/sbts/github-badge-cache-buster) PURGE trick works on some urls («unverified» today).

## 3. beyond tech badges — ranked by fit for agentic-systems work

1. «what my agents did this week» — an in-house svg counter (commits by coder app, tickets closed, skills shipped) drawn by the same weekly action. nobody else has it, and it is his actual work. no external tool; build on (c).
2. «currently building» — a short list of links to `frame`, `bytes`, `sline` and `chords`, with the frame clips reused. static markdown.
3. [metrics by lowlighter](https://github.com/lowlighter/metrics) — one action with 30+ plugins (isocalendar, languages, recent activity, lines of code). heavy, but it can replace stats, langs and the activity graph at once.
4. [contribution snake, Platane/snk](https://github.com/Platane/snk) — an action that writes a dark/light snake svg to an `output` branch. it fits the playful pixel look.
5. [activity graph](https://github.com/Ashutosh00710/github-readme-activity-graph) — honest recency signal.
6. [waka-readme](https://github.com/athul/waka-readme) — only if wakatime is installed; agent-written code skews it anyway.
7. last blog posts — [blog-post-workflow](https://github.com/gautamkrishnar/blog-post-workflow) («unverified» liveness). only if a blog exists.
8. [spotify now playing](https://github.com/novatorem/novatorem) — fun but off-message («unverified» liveness).
9. streaks and [trophies](https://github.com/ryo-ma/github-profile-trophy) — gamified vanity; weakest fit, and rate-limit prone.
10. hire/sponsor status — one line of text when it is true, no tool.

## 4. what github allows in a profile readme

- the sanitizer drops `<style>`, `<script>` and the `style=` attribute. surviving tags include `div p span img picture source details summary table kbd sub sup br`, with `align`, `width`, `height`. see [html-pipeline sanitization_filter](https://raw.githubusercontent.com/gjtorikian/html-pipeline/main/lib/html_pipeline/sanitization_filter.rb); github runs its own fork, so the exact list is «unverified».
- `<picture>` + `<source media="(prefers-color-scheme: dark)">` is the official theme switch. see [changelog 2022-05-19](https://github.blog/changelog/2022-05-19-specify-theme-context-for-images-in-markdown-beta/) and [basic formatting docs](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax).
- `<details>`/`<summary>` need a blank line after `</summary>`. see [collapsed sections docs](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/organizing-information-with-collapsed-sections).
- svg rules:
  - an external svg via `<img>` renders, and inline `<svg>` in markdown is stripped.
  - inside the svg FILE, `<style>`, css keyframes and SMIL play through camo. see [css-tricks](https://css-tricks.com/custom-styles-in-github-readmes/); frame's `sline.svg` proves it live.
  - the svg is loaded as an image, so it cannot fetch anything: no web fonts, no external `<image href>`. outline the text to paths or base64 a woff2, and put images in as `data:` uris.
  - `@media (prefers-color-scheme)` inside the svg follows the os, not github's theme toggle («unverified»).
- known tricks:
  - animated headers: [readme-typing-svg](https://github.com/DenverCoder1/readme-typing-svg) and [capsule-render](https://github.com/kyechan99/capsule-render).
  - the snake: [Platane/snk](https://github.com/Platane/snk).
  - [metrics](https://github.com/lowlighter/metrics).
  - dark/light `<picture>`.
  - gif banners (a play-once gif, like frame's).
  - `<details>` foldouts for the long stack list.
  - `<img align="right">` float plus `<br clear="right">`.
  - animated banner generators: [ryme.md](https://ryme.md/) and [readme-SVG](https://github.com/readme-SVG) — found by parallel-cli.

## 5. text rewrite guidance

- voice:
  - no «i», no «passionate», no fun facts.
  - nouns about the work, lowercase ok, one idea per line.
  - lead with agentic systems and keep frontend as the craft underneath.
- draft a:
  > agentic systems and the frontends around them. a claude code fleet that plans, codes and reviews: a coordinator, background coders, a verifier, a skill library. react and typescript for everything a human looks at.
- draft b:
  > building flows where agents do the work and people steer. fleets, coordinators, skills, tooling. frontend is still home: react, next.js, typescript, tailwind. everything lives in two repos — `frame` for the machine and the fleet, `bytes` for the apps.
- draft c:
  > ten years of frontend, now pointed at agents. what ships here: claude code fleets, pm flows over linear, hotkey and statusline tools, and the web apps they serve. less boilerplate, more loops that close by themselves.
- section order:
  1. hero svg
  2. opening block
  3. «currently building» with links and clips
  4. «this week, by the fleet» counter
  5. stack as one skill-icons row, with a `<details>` for the long tail
  6. activity (snake or graph)
  7. contact line

## 6. svg hero ideas

inspirations read:
- the paper-cut diorama, day and night screenshots: layered cut sheets with drop shadows, hanging sun and clouds on threads, a label tag, and a day/night toggle.
- ava's space-fill wordmark.
- 📌 the newton `.avif` in drops was not readable by the tool; newton's theme is described from memory («unverified»).

1. **paper t-rex diorama** — 4–6 paper layers: ridge, pines, ferns, ground. a t-rex silhouette in 3 cut shapes (body, head, arm). sun and moon on threads, and a paper tag reading «dvakatsiienko · plate i».
   - technique: static svg with `feDropShadow` per layer and an `feTurbulence` paper grain, plus css-in-svg: a slow thread sway, finite or with a long idle gap. day/night via `@media (prefers-color-scheme)` inside the file, or `<picture>`.
   - size: ~25–60 kb, hand-drawn paths. grain filters cost render, not bytes.
   - fit: soft contrast to frame's pixels. ➡️ the profile hero.
2. **pixel trex runner, 80s** — the chrome-dino homage: a pixel t-rex runs across a scanline horizon while cacti pass as commit counts.
   - technique: SMIL `<animate>` on sprite frames with a `steps()` css background scroll, drawn with `shape-rendering: crispEdges`.
   - size: ~10–20 kb.
   - fit: native to frame's pixel badges and mac.svg. ➡️ a frame visit-card site, or the profile's footer strip.
3. **space-fill wordmark (ava take)** — «dima» or «x-com» in rounded glyphs clipped over a starfield or nebula, with a thruster drop under two letters.
   - technique: `clipPath` of outlined text over an embedded `data:` jpeg/webp, plus a slow twinkle on a few circles.
   - size: 60–150 kb because of the raster; keep it under ~200 kb.
   - fit: a brand mark, not pixel. ➡️ the bytes re-theme logo.
4. **fleet control board** — an ascii/terminal panel: coordinator, coder and verifier rows with the owl, bulldog and basset avatars, and a live-looking status line that types in.
   - technique: css-in-svg typing like sline.svg, with numbers drawn weekly by the action from option (c).
   - size: ~15–30 kb.
   - fit: closest to what the profile says. ➡️ the profile, as section 4 or as the hero.
5. **newton-style calm envelope** — a flat, airy gradient card with one floating object (a letter, or a folded paper plane) and a soft parallax of two shapes.
   - technique: static svg with gradient stops and a single css float.
   - size: ~5–10 kb.
   - fit: quiet and product-like, off frame's look. ➡️ the bytes re-theme, not the profile.

## tooling note

- parallel-cli (advanced mode) ran for two queries and found animated-banner projects WebSearch did not surface: [ryme.md](https://ryme.md/), [GitBanner](https://github.com/Saviru/GitBanner) and [github-readme-svg-hero-prompt](https://github.com/cemdenizexe/github-readme-svg-hero-prompt).
- on the trophy/streak query it returned noise: outage trackers and a raw-ip mirror of github.
- WebSearch was stronger on the specific facts: the #4431 rate limit, the upstream deprecation, and camo ignoring cache-control.
- 📌 a `echo ==` separator aborted the first zsh chain, and that is the shape `method-silent-failures` already names.
