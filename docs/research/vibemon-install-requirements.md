# VibeMon install requirements vs. Claude Pro/Max

Research date: 2026-08-13.

## What VibeMon is

VibeMon ("Gamify your Coding Life") is a third-party gamification layer for AI coding agents — "a pixel pet that grows from your AI agent's hook events." It supports **Claude Code · Cursor · Gemini CLI · Codex** ([vibemon.dev](https://vibemon.dev/)). It is not an Anthropic product, a Claude Code plugin distributed by Anthropic, or a model wrapper — it listens to the coding agent's local **hook events** (tool-use/edit events) and reports XP to VibeMon's own backend for the pixel-pet/leaderboard mechanic.

## Install mechanism

Site instructions (`https://vibemon.dev/#install`):

```
curl -fsSL https://vibemon.dev/install.sh | bash -s -- YOUR_API_KEY
```

On success the installer prints `✓ API key saved`. The script installs Claude Code **hooks** (merged into existing hook config, non-destructively) and writes local config to `~/.vibemon/config.json` — corroborated by a secondary source describing the Claude-specific installer variant `curl -fsSL https://vibemon.io/install.py | python3 - --claude --token my_token` (via web search, [vibemon.io/docs](https://vibemon.io/docs)).

**Key finding:** the page itself does not explain what `YOUR_API_KEY` is, where to obtain it, or state any subscription requirement — it's presented as a bare CLI parameter with no accompanying prose (confirmed by direct fetch of the `#install` anchor).

## Does it need an Anthropic API key or a Pro/Max subscription?

No evidence found of either. Reasoning, from the mechanism observed:

- VibeMon integrates via **Claude Code's hook system** (the same mechanism used for local automations, e.g. this repo's own `.clauderc/hooks/`) — hooks fire on local tool-use events regardless of how Claude Code itself is authenticated (subscription login *or* a pay-per-token Anthropic API key).
- The `YOUR_API_KEY` in the install command is almost certainly a **VibeMon account token** (obtained by signing up on vibemon.dev), not an Anthropic credential — it authenticates the local hook-event reporter to VibeMon's own backend, separate from whatever Claude Code itself uses to talk to Anthropic.
- The vibemon.dev page makes **no mention of Claude Pro, Claude Max, or Anthropic API keys anywhere** — it only names "Claude Code" as one of four supported agents, alongside Cursor, Gemini CLI, and Codex (tools with entirely different billing models, which would be nonsensical if VibeMon itself required Anthropic-specific billing).

**Conclusion:** VibeMon rides on top of however Claude Code is already authenticated. If Claude Code is already working locally under a **Claude Pro** subscription, VibeMon should install and function fine — VibeMon is not itself gating on plan tier or consuming Anthropic API credits; it only needs a VibeMon-issued token. This is inferred from the installer's hook-based design and the absence of any subscription-gating language on the site, not from an explicit statement on vibemon.dev (the site simply doesn't address the question).

## Claude Pro vs. Claude Max — actual current pricing (the user's "$100" question)

Per [claude.com/pricing](https://claude.com/pricing) (redirects from anthropic.com/pricing):

| Plan | Price | Claude Code included? |
|---|---|---|
| **Claude Pro** | **$20/mo billed monthly**, or **$17/mo ($200 billed annually)** | Yes — "Includes Claude Code," plus Claude Cowork, Claude Design, Claude Science, unlimited projects, research access |
| **Claude Max** | **From $100/mo** (5x tier), with a higher 20x tier above that | Yes — "Everything in Pro, plus" significantly higher output/usage limits, early feature access, priority access at peak times |

So: **the user conflated the two plans.** $20/mo is Pro; **$100/mo is the entry tier of Max**, not Pro. Both tiers include Claude Code access — Max just raises usage ceilings, it doesn't unlock Claude Code itself (Pro already includes it).

## Bottom line

- VibeMon **should work with a Claude Pro ($20/mo) subscription** — it hooks into Claude Code locally and does not appear to require Anthropic API pay-per-token access or a specific plan tier; it needs only a VibeMon-issued API token.
- The **$100/mo price point belongs to Claude Max** (its lower usage tier), not Pro — Pro is $20/mo monthly or $17/mo annually.
- Caveat: vibemon.dev does not explicitly document auth requirements or plan compatibility, so this is a well-supported inference from the site's own install command and hook-based architecture, not a directly quoted guarantee from the vendor.

## Pricing — trial vs. free tier

**There is a genuine free tier — not trial-then-paid-only.** Confirmed directly on VibeMon's own FAQ page ([vibemon.dev/faq](https://vibemon.dev/faq)):

> "Yes, the core loop is free. Free accounts include one custom slime slot, full access to growth and certification features, and the public gallery."

A paid upsell exists on top of that free tier — **"VibeMon Pro,"** explicitly billed as an in-app purchase managed by RevenueCat (a subscription-management platform, not a custom billing system):

> "VibeMon Pro (managed by RevenueCat) unlocks up to 20 custom slime slots, additional species packs, and advanced live feed filters. Pricing and current offers are inside the mobile app." ([vibemon.dev/faq](https://vibemon.dev/faq))

**No mention of any free trial** was found on vibemon.dev, its `/faq`, or the main marketing page — the site frames Pro as a straightforward upgrade from a permanently-free base tier, not a time-limited trial that auto-converts.

**App Store listing** ([apps.apple.com — Vibemon App, id6758671525](https://apps.apple.com/id/app/vibemon/id6758671525)) corroborates this as a primary source required by Apple to disclose IAP terms: the app is **"Free with In-App Purchases,"** listing subscription products **"VibeMon Pro Monthly"** and **"VibeMon Pro Annual"** (priced in IDR on the fetched listing — i.e., regional pricing, not a fixed USD figure). Apple's standard subscription boilerplate is present ("Payment will be charged to your Apple ID account at confirmation of purchase," auto-renews "unless canceled at least 24 hours before the end of the current period") — but **no free-trial period is disclosed on the listing itself**. If Apple/Google surface a trial, it would appear as a "free trial" badge/duration on the subscription product in-app — this was not visible in the fetched listing content.

**Google Play listing** ([play.google.com — Vibemon: AI Coding Tracker, com.streamize.vibemon](https://play.google.com/store/apps/details?id=com.streamize.vibemon&hl=en_US)) was fetched but returned truncated content without extractable pricing/IAP details — not usable as a corroborating source in this pass; flagged rather than guessed.

**Bottom line:** VibeMon is **free-tier-plus-optional-paid-upgrade**, not trial-then-paid-only. No evidence of a 1-month free trial was found on the website or the Apple listing. Exact Pro subscription pricing (USD) is not published on the website — the FAQ explicitly defers pricing to "inside the mobile app," and the only concrete figures found were regional (IDR) figures on the App Store listing, not confirmed USD pricing or trial terms.

## Sources

- [vibemon.dev](https://vibemon.dev/) — product description, agent list, install command, `#install` anchor
- [vibemon.dev/faq](https://vibemon.dev/faq) — free tier confirmation, Pro tier description, RevenueCat billing mention
- [apps.apple.com — Vibemon App](https://apps.apple.com/id/app/vibemon/id6758671525) — App Store listing: Free + IAP, subscription product names/prices, auto-renewal terms, no disclosed trial
- [play.google.com — Vibemon: AI Coding Tracker](https://play.google.com/store/apps/details?id=com.streamize.vibemon&hl=en_US) — fetched but truncated, not usable for pricing detail
- [vibemon.io/docs](https://vibemon.io/docs) (via search) — Claude-specific installer variant, hook config details
- [claude.com/pricing](https://claude.com/pricing) — Pro/Max pricing and feature inclusion (redirected from anthropic.com/pricing)
