---
dies-when: dima has applied the adopt + delete picks, then delete this file
---

# apps sweep — /Applications vs homebrew

Ticket: DOT-237

report-only. nothing was installed, adopted, uninstalled or edited to produce this. every row
carries the command or the measurement it came from.

## counts

- 69 items in `/Applications` — 67 `.app` bundles, one empty `Utilities` folder, one `Warcraft III` game folder
- 31 items in `~/Applications` — 28 steam/gog launcher stubs, two `.localized` folders, and our own `Claude Code URL Handler.app`. 8.0M for the whole tree, so the games themselves live elsewhere
- 10 already under brew as app casks (`brew list --cask`)
- 13 from the app store (`mas list`)
- 32 hand-installed **and hoistable** — an app cask exists, vendor verified, adopt is safe
- 4 hand-installed and **not** hoistable by adopt — 3 pkg casks, 1 cask mismatch
- 21 remaining have no cask at all or are app-store-only

## 1. hoist under brew

all 32 below are owned by `dima`, so none needs a tty. checked with
`ls -ld /Applications/<App>.app` — every one came back `dima:staff` or `dima:admin`.

**the `--adopt` removal hazard does not fire on any of them.** the refusal happens when a cask
links a binary the installed bundle does not carry. five casks here link binaries — `cursor`,
`github`, `macvim`, `neovide`, `visual-studio-code` — and two use a command wrapper —
`betterdisplay`, `firefox`. every target was tested for existence and all seven passed:

```
/Applications/Cursor.app/Contents/Resources/app/bin/code                  OK
/Applications/GitHub Desktop.app/Contents/Resources/app/static/github.sh   OK
/Applications/MacVim.app/Contents/bin/mvim                                OK
/Applications/Neovide.app/Contents/MacOS/neovide                          OK
/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code       OK
/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code-tunnel OK
/Applications/BetterDisplay.app/Contents/MacOS/BetterDisplay              OK
/Applications/Firefox.app/Contents/MacOS/firefox                          OK
```

### the commands

```bash
brew install --cask --adopt 1password
brew install --cask --adopt bartender
brew install --cask --adopt betterdisplay
brew install --cask --adopt claude
brew install --cask --adopt cleanshot
brew install --cask --adopt comet
brew install --cask --adopt comfyui
brew install --cask --adopt conductor
brew install --cask --adopt cursor
brew install --cask --adopt discord
brew install --cask --adopt figma
brew install --cask --adopt firefox
brew install --cask --adopt github
brew install --cask --adopt google-chrome
brew install --cask --adopt granola
brew install --cask --adopt linear-linear
brew install --cask --adopt lm-studio
brew install --cask --adopt loom
brew install --cask --adopt macvim
brew install --cask --adopt neovide
brew install --cask --adopt notion
brew install --cask --adopt notion-calendar
brew install --cask --adopt nuphyio
brew install --cask --adopt numi
brew install --cask --adopt perplexity
brew install --cask --adopt slack
brew install --cask --adopt spotify
brew install --cask --adopt steam
brew install --cask --adopt t3-code
brew install --cask --adopt tunnelbear
brew install --cask --adopt viber
brew install --cask --adopt visual-studio-code
```

### how each cask was verified

18 casks declare the bundle id themselves, in an `uninstall quit:` or `zap` stanza, and it matched
the installed `CFBundleIdentifier` exactly:

- `1password` `bartender` `betterdisplay` `claude` `cleanshot` `discord` `firefox` `granola`
  `lm-studio` `notion` `nuphyio` `numi` `perplexity` `slack` `spotify` `steam` `tunnelbear`
  `visual-studio-code`

14 casks declare no bundle id. those were verified by codesign team, which matched the vendor on
the cask homepage in every case:

- `comet` — Perplexity AI Inc. (7S8W4W365S)
- `comfyui` — Drip Artificial Inc (6FXBT88W8J)
- `conductor` — Charlie Holtz (27XN666UJ7)
- `cursor` — Hilary Stout (VDXQ22DGB9)
- `figma` — Figma, Inc. (T8RA8NE3B7)
- `github` — GitHub (VEKTX9H2N7)
- `google-chrome` — Google, keystone agents matched
- `linear-linear` — Linear Orbit, Inc. (7VZ2S3V9RV)
- `loom` — Loom, Inc (QGD2ZPXZZG)
- `macvim` — Yee Cheng Chin (WG3S88DD2E)
- `neovide` — ALEXSANDE FALCUCCI DOS SANTOS (X8CNW77992)
- `notion-calendar` — Notion Labs, Incorporated (LBQJ96FQ8D)
- `t3-code` — T3 Tools, Inc. (ARK85ZXQ4Z)
- `viber` — Viber Media SARL. (86ZW9CB9ZQ)

### two rows to read before running the batch

- **`numi` would be a downgrade.** installed is `3.34`, the cask is `3.32.721`. adopt writes the
  cask's version into the receipt, so the next `brew upgrade` replaces a newer app with an older
  one. hoist it last, or skip it until the cask catches up.
- **`viber` versions do not share a scheme.** installed is `26.1.2`, the cask says
  `1.0.0.107,2154`. the vendor and bundle id match, so adopt is safe, but brew will report a
  version that means nothing. cosmetic, named so it is not a surprise later.

### version drift adopt will surface

these are behind the cask and will show as outdated the moment they are adopted, which is the
point of hoisting them. no action needed beyond a later `brew upgrade`:

- `cleanshot` 4.8.10 → 5.0
- `comet` 144.0.7559.43118 → 145.2.7632.4581
- `comfyui` 1.0.15 → 1.0.47
- `conductor` 0.79.0 → 0.85.0
- `discord` 0.0.397 → 0.0.412
- `firefox` 140.0.4 → 156.0
- `github` 3.6.4 → 3.6.6
- `google-chrome` 152.0.7977.83 → 153.0.8010.48
- `granola` 7.543.2 → 7.568.0
- `lm-studio` 0.4.9+1 → 0.4.24
- `loom` 0.361.0 → 0.375.0
- `nuphyio` 2.2.6 → 2.2.7
- `perplexity` 26.35.0 → 26.36.0
- `spotify` 1.2.92.147 → 1.3.0.277
- `t3-code` 0.0.39 → 0.0.40
- `visual-studio-code` 1.130.0 → 1.138.0

## 2. non-hoistable, with the reason

### a cask exists but `--adopt` cannot take it — pkg artifacts

`--adopt` is not implemented for `pkg` artifacts. measured, not assumed:
`grep -c adopt /opt/homebrew/Library/Homebrew/cask/artifact/pkg.rb` returns **0**, while
`app.rb`, `binary.rb` and `command_wrapper.rb` all thread the flag through. these three casks
install a vendor `.pkg`, so there is nothing for adopt to take. bringing them under brew means a
plain `brew install --cask`, which runs the vendor installer over the existing copy. all three
bundles are root-owned, so the installer needs a password prompt.

- **`Google Drive.app`** — cask `google-drive`, `pkg` artifact, bundle is `root:wheel`, installed
  130.0 vs cask 131.0.2. **dima runs it:** `brew install --cask google-drive`
- **`Microsoft Teams.app`** — cask `microsoft-teams`, `pkg` artifact, bundle is `root:wheel`,
  installed 26163.407.4839.8659 vs cask 26225.1706.5101.3140. also a delete candidate below, so
  decide that first. **dima runs it:** `brew install --cask microsoft-teams`
- **`zoom.us.app`** — cask `zoom`, `pkg` + `postflight_steps`, bundle is `root:admin`, installed
  7.0.6 vs cask 7.1.5.84650. also a delete candidate below. **dima runs it:**
  `brew install --cask zoom`

### the cask name collides with a different app

- **`Sherlock.app`** — 📌 **do not adopt.** `brew search --cask sherlock` resolves to
  `sherlock-app`, which is an **iOS simulator visual debugger** from `sherlock.inspiredcode.io`,
  version 2.12.0. the installed app is `com.sherlock.sherlock` version 1.0.6, signed by
  *Abhishek Kaushik (VAARXM66Y6)*. different product, same word. adopting it would register the
  wrong cask and the next upgrade would replace the app.

### no cask exists at all

`brew search --cask` returned nothing usable for these:

- **`EcoFlow.app`** — not a mac app. it is an iOS app running on apple silicon: the bundle has no
  `Contents/`, only `WrappedBundle -> Wrapper/EcoFlow_oversea.app`. app store only, never
  hoistable.
- **`Newton.app`** — `com.CloudMagic.MacMail`. no cask.
- **`Otter.app`** — `com.otterai.desktop`. no cask; the nearest search hits are `otty` and
  `pingplotter`.
- **`RimSort.app`** — `RimSort`. no cask.
- **`Stardrop.app`** — `stardrop`. no cask; the nearest hit is `start`.

### app store only — mas manages them, brew should not

13 apps carry a `_MASReceipt` and are updated by the app store. leave them there.

- `1Password for Safari` · `Draw Things` · `iA Writer` · `Keka` · `Keynote Creator Studio` ·
  `Magnet` · `Marco` · `Numbers Creator Studio` · `Pages Creator Studio` · `Spark` · `Speedtest` ·
  `Telegram` · `Things3`

📌 **`Keka` is already in both.** `brew list --cask` includes `keka`, and
`/opt/homebrew/Caskroom/keka/1.6.7/Keka.app` is a symlink to `/Applications/Keka.app` — a bundle
that still carries its `_MASReceipt` and is `root:wheel`. so it was adopted at some point and the
app store still owns the updates. harmless today, but it means two updaters believe they manage
the same bundle. worth deciding which one keeps it.

### already under brew

10 app casks, nothing to do: `battle-net` · `homebrew-app` · `iterm2` · `keka` · `mole-app` ·
`obsidian` · `raycast` · `superwhisper` · `warp` · `wispr-flow`.
plus 6 casks that install no app:

- `1password-cli`
- `coderabbit`
- `notion-cli`
- `font-hack-nerd-font`
- `font-ia-writer-duo`
- `font-ia-writer-quattro`

### system

`Safari.app` is a 0-byte stub pointing into `/System`, SIP-owned. `/Applications/Utilities` holds
only a `.localized` file — macos 26 moved the built-in utilities under `/System/Applications`,
which is read-only. **there is nothing sweepable among the macos built-ins in `/Applications`.**

## 3. delete candidates

every row is a candidate with its evidence. none is a recommendation to delete — intent is dima's.

### orphans — the thing is gone, its launch items are not

- **OpenVPN Client** — 🔎 **no app anywhere on disk.** what survives it:
  - `/Library/LaunchDaemons/org.openvpn.helper.plist`, **enabled** in `sfltool dumpbtm`
  - `/Library/Frameworks/OVPNHelper.framework`, dated Jun 21 2025
  - `/Library/Frameworks/OpenVPNConnect.framework`
  - a `developer` entry named `OpenVPN Client` in the login-item database, still listed
  - this is the same shape as the appcleaner `SmartDelete` leftover from 2026-09-15: the bundle
    went, the login items stayed.
- **`Battle.net-Setup` background task** — enabled in `dumpbtm` as `8192.net.battle.bootstrapper`,
  pointing at `/opt/homebrew/Caskroom/battle-net/1.19.3.3219/`. the installer stub, not the app.
  `Battle.net.app` itself is used and stays.

### never opened

`mdls -name kMDItemLastUsedDate` returned null.

- **`Keynote Creator Studio.app`** 643M, **`Pages Creator Studio.app`** 604M,
  **`Numbers Creator Studio.app`** 490M — **1.7G combined**, none ever opened, all three from the
  app store, all `root:wheel`. no login items.
- **`Microsoft Teams.app`** 1.1G — never opened, `root:wheel`. but it ships live updaters:
  `/Library/LaunchAgents/com.microsoft.update.agent.plist` and
  `/Library/LaunchDaemons/com.microsoft.autoupdate.helper.plist`, both **enabled**.
- **`zoom.us.app`** 436M — never opened, `root:admin`. three **enabled** launch items:
  `us.zoom.updater.plist`, `us.zoom.updater.login.check.plist`, `us.zoom.ZoomDaemon.plist`.
- **`Firefox.app`** 419M — never opened, and 16 major versions behind (140.0.4 vs 156.0). no login
  item.
- **`Comfy Desktop.app`** 404M — never opened, 32 patch versions behind. no login item.
- **`Notion Calendar.app`** 317M — never opened. no login item. `Notion.app` itself is used daily.
- **`1Password for Safari.app`** 394M — never opened directly, but it is the safari extension
  host, not a launchable app. `Safari.app` was used today. 📌 evidence says unused, behaviour says
  otherwise — treat this row as informational.
- **`Google Docs.app`** 68K, **`Google Sheets.app`** 68K, **`Google Slides.app`** 72K — never
  opened, `root:wheel`. drivefs shortcut stubs, created by `Google Drive.app`. deleting them
  without removing Drive means Drive recreates them.

### idle for months

- **`Comet.app`** 602M — last opened **2026-02-22**, seven months ago. duplicates `Perplexity.app`
  (same vendor, opened 2026-09-13). login item **disabled**.
- **`Stardrop.app`** 103M — last opened **2026-02-19**. a `Stardew Valley` mod manager;
  `Stardew Valley.app` itself was last opened 2026-02-08.
- **`LM Studio.app`** 585M — last opened **2026-04-02**. local model runner.
- **`Viber.app`** 338M — last opened **2026-06-19**. login item **disabled**.
- **`Draw Things.app`** 252M — last opened **2026-06-20**. app store, `root:wheel`.
- **`Discord.app`** 445M — last opened **2026-07-02**. no login item.
- **`Loom.app`** 817M — last opened **2026-07-10**. **largest idle app.** overlaps `CleanShot X`,
  which is settled and was opened today.
- **`EcoFlow.app`** 686M — last opened **2026-07-18**. iOS app, never hoistable, battery app.
- **`RimSort.app`** 1.8G — last opened **2026-07-29**. a `RimWorld` mod manager, and the second
  largest app in `/Applications`. `RimWorld.app` in `~/Applications` was last opened
  **2025-12-22**.
- **`iTerm.app`** 176M — last opened **2026-08-14**. `Warp.app` is the settled terminal and was
  opened today. 📌 iterm is already a brew cask, so this is a `brew uninstall --zap --cask iterm2`
  decision, not a drag to trash.
- **`Otter.app`** 584M — last opened **2026-08-28**. overlaps three settled tools: `superwhisper`
  (2026-09-14), `Wispr Flow` (today), `Granola` (2026-09-09).

### duplicates a settled tool, but still in use

not idle, so not a size play. listed because the pair is the real question.

- **`Magnet.app`** 3.4M — opened 2026-09-15, login item **enabled**. `raycast` ships window
  management. tiny, so this is a tidiness call, not a disk call.
- **`Spark.app`** (2026-09-15) and **`Newton.app`** (today) — two mail clients, both live, 1.1G
  combined. the flawlog already records four mail apps coming and going this week.
- **`Visual Studio Code.app`** 1.5G (2026-08-16), **`Cursor.app`** 1.3G (today),
  **`T3 Code (Alpha).app`** 437M (2026-09-07), **`Conductor.app`** 195M (2026-09-12) — four
  editors, **3.4G combined**. only `Cursor` was opened today.
- **`GitHub Desktop.app`** 681M — opened **today**, so not idle, despite the `git` cli being the
  settled path. informational only.

### the big one, outside the app list

- **`/Applications/Warcraft III`** — **33G**, by far the largest item in `/Applications` and larger
  than every app in this report combined. a `battle-net` managed game folder holding `Data`,
  `_retail_` and `Warcraft III Launcher.app`, not a plain bundle. `Battle.net.app` was opened
  2026-09-15, so the launcher is live; the game folder's own last-use was not readable from the
  folder. 📌 if this goes, it goes through the `Battle.net` client's own uninstall, never a
  `trash` of the folder — battle.net keeps its install manifest elsewhere and would be left
  believing the game is present.

### size roll-up of the delete candidates

- never opened, no live use: **4.3G** (the three iWork apps, Teams, zoom, Firefox, Comfy, Notion
  Calendar)
- idle for months: **6.3G** (Comet, Stardrop, LM Studio, Viber, Draw Things, Discord, Loom,
  EcoFlow, RimSort, iTerm, Otter)
- the game folder: **33G**
