---
dies-when: DOT-34 stack verdict lands
---

Ticket: DOT-34

# zsh stack 2026 — freshness research

scoped to dima's wants: fast shell, theming + autocompletes (what omz does), prompt verdict
(starship vs newer), warp interplay, research-before-tickets. no space engineering.

## 1. shell — zsh stays

- zsh is still the macos default and the safe 2026 pick; installed here via brew
  (`/opt/homebrew/bin/zsh`, 5.9.2) on top of the os-shipped one — brew updates it, fine.
- challengers: fish is lovely but breaks posix muscle memory and every existing alias;
  nushell is a paradigm shift, not a shell swap. neither earns a migration for this setup —
  the pain points here are framework/prompt/warp, not the shell itself.
  ([oh-my-zsh alternatives overview](https://magnus919.com/notes/oh-my-zsh-alternatives/))

## 2. framework — omz is a ghost here; drop it for plain sourcing (or antidote if plugins grow)

- measured local state: `.zshrc` has `plugins=()` — omz provides ONLY the `$ZSH_CUSTOM`
  auto-source glob and compinit. the two real plugins (autosuggestions, syntax-highlighting)
  already load from brew directly, bypassing omz entirely.
- 2026 benchmarks: antidote/sheldon lead plugin-manager speed; zinit's turbo mode wins
  first-command lag but is heavier to own; zim is a full framework again.
  ([rossmacarthur benchmark](https://github.com/rossmacarthur/zsh-plugin-manager-benchmark),
  [antidote/fast](https://antidote.sh/fast),
  [framework comparison gist](https://gist.github.com/laggardkernel/4a4c4986ccdcaf47b91e8227f9868ded))
- for ~2 brew-installed plugins, a plugin manager is machinery without a load: **plain
  sourcing + own `compinit` call** replaces omz at zero cost
  ([zsh_unplugged](https://github.com/mattmc3/zsh_unplugged) is the canonical writeup).
  runner-up: antidote, the moment the plugin list grows past ~4.

## 3. prompt — starship confirmed still best-in-class

- starship: actively maintained, 10-15ms renders, cross-shell, single `starship.toml`.
- powerlevel10k is on life support (author stepped back)
  ([writeup](https://hashir.blog/2025/06/powerlevel10k-is-on-life-support-hello-starship/));
  spaceship is the thing dima already left — no reason to return; oh-my-posh is the only live
  rival and wins nothing relevant here.
  ([omz → starship 2026](https://dev.to/trung_hoang_52851df1766f0/elevate-your-terminal-from-oh-my-zsh-to-starship-in-2026-3e58))
- verdict: keep starship, invest in the toml, not in switching.

## 4. autocomplete/highlighting — the minimal good set

- keep: `zsh-autosuggestions` + `zsh-syntax-highlighting` (both already installed via brew).
- optional adds, only on felt need: `fzf-tab` (fzf-powered tab menu) — the one genuinely
  high-value addition; carapace is over-engineering for this setup.
- note: warp ships its own completions/suggestions UI which overlaps both plugins (see 5) —
  decide the warp question first, or the plugin verdicts are half-blind.

## 5. warp interplay — the load-bearing answer

- **the setting exists: settings → appearance → input → input type = «shell (PS1)»**
  (aka «honor user's custom prompt»; also right-click the prompt → «use my own prompt»).
  default is warp's universal input, which is why every new window renders warp's own prompt
  and ignores starship. ([warp prompt docs](https://docs.warp.dev/terminal/appearance/prompt/),
  [discussion #422](https://github.com/warpdotdev/Warp/discussions/422))
- `rezsh` «fixing» it is an illusion of the same fact: re-execing zsh prints PS1 into the
  block output; the setting was never on.
- starship-under-warp has documented workarounds: **disable multi-line prompt**, set
  `command_timeout`, and warp's compat table marks starship «works with limitations».
  ([docs](https://docs.warp.dev/terminal/appearance/prompt/),
  [issue #3981 two-line prompt](https://github.com/warpdotdev/Warp/issues/3981))
- the trade: with shell (PS1) input, warp's own prompt disappears; warp completions/blocks
  largely keep working, but the jumpy-prompt issue with warp AI is open
  ([issue #6962](https://github.com/warpdotdev/warp/issues/6962)).
- escape hatch for config that misbehaves only in warp:
  `if [[ $TERM_PROGRAM != "WarpTerminal" ]]` guards (official docs recommendation).
- honest fork in the road: EITHER flip the setting and run starship everywhere (uniform prompt,
  lose warp's prompt niceties) OR accept warp's prompt in warp and keep starship for other
  terminals. this is a taste call for dima, made cheap: the setting is one toggle, reversible.

## 6. startup speed — mostly already done here

- the repo's `zsh_init_cached` helper (version-stamped cache for fnm/starship/zoxide init)
  IS the 2026 best practice — the DOT-35 plan is already implemented in `.zshrc`. remaining
  hygiene: omz removal (its sourcing is the biggest leftover cost), one compinit with a cached
  dump, and the known `.zshenv` bugs (unexpanded `~` PATH entries, forced TERM).

## recommended vector

- **shell: keep zsh** (brew-managed) — fish/nushell not worth the migration.
- **framework: drop omz, plain-source the custom dir + own compinit** — antidote only if the
  plugin list grows.
- **prompt: keep starship**, tune `starship.toml` (single-line under warp, command_timeout).
- **plugins: keep the brew pair**, consider fzf-tab after the warp decision.
- **warp: flip input type → shell (PS1)** and live with it a week — the a/b is one toggle.
- **speed: the cache helper already landed; the wins left are omz removal + zshenv bugfixes.**

sources beyond inline: [warp PS1 blog](https://www.warp.dev/blog/whats-so-special-about-ps1),
[starship](https://starship.rs/).
