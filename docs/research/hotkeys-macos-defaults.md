---
dies-when: folded into the DOT-237 phase-5 walkthrough plan
---

Ticket: DOT-237

# hotkeys — macos defaults, the wipe question, and the phase-5 vectors

pre-research for phase 5. measured on this mac: **macos 27.0, build 26A428** (`sw_vers`), raycast
hyper key = caps lock with shift included, karabiner **not installed** (only stale prefs).
every claim carries a url or says «inferred».

## «is it worth it, and is it safe overall? … will macos 28 bring its own new hotkeys?»

**the storage is three domains, not one.** measured here with `defaults export`:

- `~/Library/Preferences/com.apple.symbolichotkeys.plist` — the Keyboard Shortcuts pane. `AppleSymbolicHotKeys`, keyed by integer id, each `{enabled, value.parameters:[charCode, keyCode, modifierMask]}`. [storage confirmed](https://discussions.apple.com/thread/1180067)
- `com.apple.universalaccess` — accessibility owns its own registry. measured: `UserAssignableHotKeys` (5 entries, fn+ctrl+F2…F6, all enabled) and `closeViewCustomHotkeyKey` (zoom, `closeViewHotkeysEnabled = true`). apple's own key is misspelled `sybmolichotkey` — it is a **separate list that happens to reference the same ids**
- `com.apple.speech.synthesis.general.prefs` — speak-selection. measured `SpokenUIUseSpeakingHotKeyFlag = true`; the `opt+esc` chord is the unstored default
- per-app overrides live in `NSUserKeyEquivalents` inside each app's domain, or `.GlobalPreferences` for «All Applications». measured on this mac: **zero exist**. [format](https://www.oreilly.com/library/view/modding-mac-os/0596007094/ch08s06.html) · audit with `defaults find NSUserKeyEquivalents`

📌 **the user plist holds only deltas.** measured: 22 entries, while the documented id space runs
past 180 ([id map](https://github.com/andyjakubowski/dotfiles/blob/main/AppleSymbolicHotKeys%20Mappings)).
id 32 (mission control, ctrl+↑) is **absent** from dima's plist and still works — proof that an
absent id means «system default, enabled».

**that single fact answers the macos-28 question.** a new feature ships a **new id**. dima has no
override for an id that does not exist yet, so it arrives **enabled at apple's chord**. wiping
everything today buys nothing against future clashes.

- 🔎 the documented precedent: macos 15 sequoia added window tiling with new defaults `fn+ctrl+←→↑↓ / F / C`, which [collided with ctrl+home / ctrl+end](https://discussions.apple.com/thread/255886122) and [broke in vs code](https://github.com/microsoft/vscode/issues/228850)
- 🔎 macos 26 tahoe rebuilt spotlight and added `⌘1–4` panes plus string «quick keys» — [a whole new trigger surface](https://www.macrumors.com/how-to/do-more-with-spotlight-in-macos-tahoe/) that is not a symbolic hotkey at all
- an in-place upgrade does not wipe `~/Library/Preferences`, so a disabled entry survives — **inferred** from the delta model above; no apple doc states it, and community reports of shortcuts resetting after updates exist ([mackup #1989](https://github.com/lra/mackup/issues/1989))

**what a blanket wipe actually breaks** — the checks before touching anything:

- input-source switching — ids 60/61 already disabled here. with two non-latin layouts installed (`Ukrainian-PC`, `Russian – Ilya Birman Typography`) the only remaining switch is id 263 (`⇧space`, enabled) and the menu bar. killing that strands the layout
- accessibility — zoom, keyboard navigation and speak-selection live in the **other two domains**; a symbolichotkeys wipe misses them entirely, and `opt+cmd+F5` (accessibility shortcuts panel) is the recovery hatch
- recovery and boot chords (`cmd+R` at boot, safe mode) are **firmware**, not symbolichotkeys — untouched by any of this
- screenshots — ids 28/29/30/31/184/261 already disabled here, cleanshot owns them by design

**the reversible recipe:**

- snapshot first — `defaults export com.apple.symbolichotkeys <path>` plus the two accessibility domains, committed to dotfiles **before** the first change
- write with `defaults write com.apple.symbolichotkeys AppleSymbolicHotKeys -dict-add <id> '<dict><key>enabled</key><false/></dict>'`, or `PlistBuddy -c "Set :AppleSymbolicHotKeys:<id>:enabled NO"`
- ⚠️ a write does not take effect until `/System/Library/PrivateFrameworks/SystemAdministration.framework/Resources/activateSettings -u` runs — [measured by zameer manji](https://zameermanji.com/blog/2021/6/8/applying-com-apple-symbolichotkeys-changes-instantaneously/), binary confirmed present on 27.0
- 📌 **`defaults write` on a running system races cfprefsd.** the ticket's own rule already covers it: verify by eye in System Settings, never by shell echo

➡️ **verdict: do it surgically, never as a wipe.** disable the ~12 chords that actually collide,
snapshot all three domains into dotfiles first, and accept that macos 28 will ship new enabled
bindings regardless — so the real defence is a **re-audit script**, not a one-time purge.

## the macos built-ins pass — what is on, by pane

measured from dima's plist; `[default]` means absent from it, so enabled at apple's chord.

- **mission control** — `ctrl+↑` mission control (id 32, `[default]`, **dima uses**) · `ctrl+↓` app windows (id 35, `[default]`) · `ctrl+←/→` move a space (ids 79–82, **enabled, dima uses**) · `ctrl+1–4` switch to desktop n (ids 118–121, **off**)
- **screenshots** — `⇧⌘3/4/5/6` (ids 28–31, 184, 261) — **all off**, cleanshot owns them
- **spotlight** — `⌘space` (id 64) and `⌥⌘space` (id 65) — **off**, raycast holds `⌘space`. 📌 on macos 26+ **F4 also opens spotlight** and is not a symbolic hotkey; `com.apple.keyboard.fnState = 0` here, so the f-row sends media keys — check whether the air75's F4 reaches it
- **input sources** — `ctrl+space` / `ctrl+⌥+space` (ids 60/61) — **off**. `⇧space` (id 263) **on**
- **dock** — `⌥⌘D` dock hiding (id 52) — **off**
- **accessibility** — keyboard nav `fn+ctrl+F2…F6` **all on** · zoom `cmd+⌥+F` **on** · reader `cmd+esc` off in universalaccess but id 260 (`cmd+esc`) **on** in symbolichotkeys — a genuine split-brain worth one look · speak selection `opt+esc` **on**, ~1500 presses/30d
- **window tiling** — `com.apple.WindowManager` measured `GloballyEnabled = 0`, `EnableTilingByEdgeDrag = 0` — sequoia's `fn+ctrl+arrows` are effectively out of the way
- **apple's own catalogue** of the rest (finder, document, sleep/lock) — [support.apple.com/102650](https://support.apple.com/en-us/102650)

**free candidates** (unused, still on): `ctrl+↓` app windows · id 260 `cmd+esc` · the five
`fn+ctrl+F2…F6` nav chords · id 164 (unbound already).

➡️ **verdict: the surface is already 60 % clean.** the live-and-unused set is ~8 chords, not
«a lot of them» — a ten-minute pass, and `ctrl+↑` / `ctrl+←→` stay.

## «sometimes when i press this combo in chrome page it reloads a page instead — duno why»

**measured config, and it is the lead.** `com.raycast.macos` →
`raycast_hyperKey_state = {enabled: 1, includeShiftKey: 1, keyCode: 57}`. keyCode 57 = caps lock,
and **shift is included**, so caps+r emits `⌃⌥⌘⇧R`. chrome's hard reload is `⌘⇧R`.

- 🔎 **chromium matches accelerators on exact modifiers** — extra modifiers prevent the match ([chromium mac hotkey doc](https://chromium.googlesource.com/chromium/src/+/114.0.5735.133/docs/mac/about_hotkeys_and_keycodes.md), corroborated by [helium-macos #271](https://github.com/imputnet/helium-macos/issues/271)). so a **complete** hyper chord cannot trigger reload
- **therefore the reload proves the chord arrived degraded** — chrome saw `⌘⇧R`, not `⌃⌥⌘⇧R`. the remap was partially or wholly not applied for that one event (**inferred**, and the inference is forced by the exact-match rule)
- two sourced mechanisms produce exactly a bad-first-event: **secure input** — raycast ships `raycast_HyperKeySecureInputMode = 1` here, and its changelog records «improved recovery from a stuck Secure Input state that prevents the app from remapping Caps Lock» ([hyper key manual](https://manual.raycast.com/hyper-key)); and **`kCGEventTapDisabledByTimeout`** — macos switches a slow event tap off and the app must re-enable it, the first events passing through meanwhile ([openkey #332](https://github.com/tuyenvm/OpenKey/pull/332), [ghostty #11819](https://github.com/ghostty-org/ghostty/discussions/11819))
- chrome is where password fields live, so it is the app most likely to hold secure input — matching «happens in chrome»
- karabiner is **not** the cause: no `/Applications/Karabiner*.app`, no `~/.config/karabiner`, no running process. only orphan prefs in `~/Library/Preferences/org.pqrs.*` — worth deleting to stop raycast's diagnostic flagging it

**the fix ladder, cheapest first:**

- **turn «Include Shift» off** — hyper becomes `⌃⌥⌘`, and a degraded event can no longer land on `⌘⇧R`. one toggle, zero cost, removes the specific collision
- move 1password off `r` — `⌃⌥⌘⇧R` overlaps chrome's hard reload only because shift is in the hyper
- run **Settings → Keyboard → Hyper Key → the green dot → Hyper Key Diagnostic** ([documented](https://manual.raycast.com/hyper-key)); it names secure-input, karabiner and caps-lock-mapping conflicts directly
- trash the stale `org.pqrs.*` plists

➡️ **verdict: turn «Include Shift» off first.** it is the one change that makes the failure mode
impossible rather than rarer, and it costs one checkbox.

## «hotkeys — review the essentials, optimize the map»

- raycast's own rule: **hotkey = «triggered dozens of times a day», alias = «often but not constantly»**, and a command can hold both ([manual](https://manual.raycast.com/command-aliases-and-hotkeys)). «keep the number of hotkeys manageable to avoid conflicts» is their wording, not ours
- **audit tool that already exists**: root search → Shortcuts settings → the **«Hotkey Set» / «Alias Set» filters** list every assigned binding. the v2 recorder detects conflicts live and names the owning command
- **v2 unlocks three new slots** ([new in v2](https://manual.raycast.com/new-in-v2)): `fn` alone as a hotkey · **left and right modifiers bound separately** · double-tap modifiers
- 🎯 the L/R split is the answer to «wispr is on ctrl and fires on other ctrl chords»: **bind right-ctrl alone**, leaving left-ctrl free for `ctrl+↑` and `ctrl+←→`. same finger habit, zero collision
- the namespace idea from the ticket (gate cursor behind `ctrl+cmd`) is the right shape — it is what the hyper already does for raycast. one modifier prefix per owner is the only scheme that scales

➡️ **verdict: one layer per owner** — caps(hyper) = raycast, `ctrl+cmd` = cursor, bare `ctrl`
arrows = macos spaces, right-ctrl = wispr. audit through the Hotkey Set filter, not by memory.

## «which keys are most natural for a human to press» — the air75 heuristic

- the air75 v3 is a **75 % ANSI, 84 keys**, 318.9 × 128.9 mm, 3.5 mm travel ([nuphy](https://nuphy.com/products/nuphy-air75-v3), [specs](https://inputarena.com/product/nuphy-air75-v3-full-specification/)). no numpad, full f-row, a right-hand column — so the **left half is the hotkey field** and the right column is dead weight for chords
- the ergonomics literature is about typing, not chords, but the one transferable rule is **«each finger stays within one key of its home position»** ([layout design](https://keebsforall.com/blogs/mechanical-keyboards-101/design-ergonomic-keyboard-layout))
- caps lock sits **immediately left of `a`**, on the home row, under the left pinky — the reason the hyper lives there. from a pinky held on caps, the comfortable field is the left-hand home and upper rows: **a s d f g / q w e r t / z x c v**, plus `1 2 3 4`
- 📌 the direct finding for chords: [ergonomic-keyboard research](https://arxiv.org/pdf/1707.03753) flags `X Z C V` as **badly placed for ctrl-chording** because the modifier and the letter sit too far apart. the same test applies to hyper: **the letter must be reachable while the pinky holds caps**
- against dima's current map — `a` (claude), `w` (slack), `e` (linear), `d` (obsidian), `r` (1password), `1` `2` are all inside the comfortable field ✅. `t` (terminal) and `n` (notion) are the two reaches, and both are **semantic** — the ticket already accepts that trade
- the real conflict is semantics vs distance, and the resolution is **frequency**: distance is paid once per press, so the hottest binding wins the nearest key even when the letter is arbitrary. `pnpm hotkeys:top` (DOT-247) is the input that settles it

➡️ **verdict: the current map is already close to optimal.** keep semantic letters inside
`qwert/asdfg/zxcv`, and only demote a semantic match when the frequency data says the key is
carrying a rarely-pressed app.

## «double-tap — a double-tap hotkey (esc esc?) for something high-frequency»

- raycast supports double-tap hotkeys since [v1.42](https://www.raycast.com/changelog/1-42-0), for commands, apps and quicklinks
- v2 extends it to **modifiers**: `⌘⌘` / `ctrlctrl` as a chord, and **L⌘+R⌘ pressed together is a separate hotkey** from the double-tap ([new in v2](https://manual.raycast.com/new-in-v2))
- ⚠️ **`esc esc` is the wrong pick.** esc is the highest-traffic bail-out key on the system — vim, modals, chrome full-screen, raycast's own dismiss. a double-tap listener there adds a timing window to every escape
- the safe double-tap surface is a **modifier that is otherwise idle**: `⇧⇧` or `L⌥+R⌥`. no app claims either, and a modifier double-tap cannot eat a printable key

➡️ **verdict: skip `esc esc`, take `⇧⇧`.** highest-frequency candidate worth a zero-key chord is
wispr hands-free or the clipboard history — decide from `hotkeys:top`.

## «hotkeys vs quicklinks — power usage, under-used today»

- they are **orthogonal**, not alternatives: a quicklink is the *destination*, an alias or hotkey is the *trigger*, and raycast lets one quicklink carry both ([manual](https://manual.raycast.com/command-aliases-and-hotkeys))
- the ticket's sealed grammar (`q` + 1–3 letters, 7 live quicklinks, argument-or-path to earn a slot) is already the discipline raycast's own guidance recommends
- the split that matters: **a quicklink with an argument wants an alias** (you are typing anyway), **a quicklink without one wants a hotkey** (nothing to type, so the launcher round-trip is pure cost)
- 📌 the known tax, already in the ticket: raycast cannot overwrite a quicklink by import, so an update is delete → re-import → retype the alias

➡️ **verdict: argument ⇒ alias, no argument ⇒ hotkey.** that one rule covers all 7 live
quicklinks and stops the «should this be a hotkey» question recurring per item.

## «cleanshot x — hotkeys used natively today; centralize in raycast via cleanshot:// deep links»

- the full command set is first-party documented at [cleanshot.com/docs-api](https://cleanshot.com/docs-api): `capture-area`, `capture-window`, `capture-fullscreen`, `capture-previous-area`, `scrolling-capture`, `all-in-one`, `capture-text`, `record-screen`, `open-history`, `open-annotate`, `open-from-clipboard`, `self-timer`, `pin`, `restore-recently-closed`, `add-quick-access-overlay`, `open-settings`
- the `action=` parameter (**v4.7+**) sets the destination per link — `copy` / `save` / `annotate` / `upload` / `pin`. that is strictly more than a native hotkey can express, since a native chord uses the global after-capture setting
- `capture-text` needs **v3.8.1+**; spatial params (`x/y/width/height/display`) need 4.7+
- 📌 the ticket's own caveat holds and is the whole cost: cleanshot binds 3-key chords (`⇧⌘4`), raycast quicklinks bind modifier+key — **hoisting trades chord depth for a shallower layer**. with `⇧⌘0–9` already sealed that trade is mostly already made

➡️ **verdict: hoist via quicklinks, and use `action=` to earn the move.** a deep link that also
picks its destination beats the native chord; a like-for-like hoist does not.

## «cleanshot OCR works very well! a thing i was looking for a long time» — the ocr shootout

- **all three candidates call the same apple Vision framework**, so accuracy is not the axis — [the comparison](https://notchy.dev/blog/best-mac-ocr-apps/) puts it plainly: they «differ less on accuracy than on where the text ends up»
- cleanshot's `capture-text` is already installed, already deep-linkable, and already has dima's endorsement in the ticket
- raycast's own Screenshots text recognition and the `screenocr` ext add a second and third trigger for an identical result

➡️ **verdict: cleanshot `capture-text`, the other two off.** no accuracy argument exists for
keeping a second OCR path, and each one costs a chord.

## «brewui hotkey»

- by raycast's own threshold — hotkeys for «dozens of times a day», aliases for «often but not constantly» ([manual](https://manual.raycast.com/command-aliases-and-hotkeys)) — installing and inspecting brew packages is a weekly action, not a daily one
- a global hotkey is the scarcest resource in this whole map; brewui cannot outbid an app switch

➡️ **verdict: alias, not a hotkey.** `br` from root search; revisit only if `hotkeys:top` ever
shows it in the daily band.

## «quick translate — not sure which is better»

- the decision has a mechanism: **the selected-text path only fires on hotkey invocation.** raycast's own Translate fills the source field from the foreground selection when launched by hotkey ([manual](https://manual.raycast.com/translate)); an alias goes through root search, which has no selection to read
- ⚠️ **caveat measured against the free tier**: raycast's native Translate is marked **Pro Exclusive** ([manual](https://manual.raycast.com/translate.md)). dima is on free, so the live command is gebeto's [Google Translate](https://www.raycast.com/gebeto/translate) — whose store page documents **no** selected-text preference. unverified whether it reads the selection at all

➡️ **verdict: hotkey if gebeto's Quick Translate reads the selection, alias if not** — a
30-second check at the walkthrough, and the answer decides it outright.

## what is NOT answered

- **no primary apple source** states what an in-place upgrade does to a disabled symbolichotkeys entry. the delta model makes preservation near-certain, but it is inferred — the honest test is `defaults export` before the macos 28 upgrade and a diff after
- **no complete id→name table exists.** the best community map covers ~40 ids; four live entries here (**164**, **260**, **261**, **263**) are unidentified. each needs a press-and-see check
- **the caps+r trigger condition is not pinned** — which of secure-input vs tap-timeout fires it, and why it clears on the second press. the diagnostic panel will say; the fix does not wait on it
- **gebeto's Quick Translate selected-text behaviour** — store page silent, needs a live check
- **the air75's F4** — whether it reaches macos as spotlight's trigger, given `fnState = 0`
- **no measured frequency data yet.** every «hottest key» claim here is dima's self-report; `pnpm hotkeys:top` (DOT-247) replaces it in ~2 weeks and should re-run this ranking before the map is sealed
