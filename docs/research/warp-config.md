# Warp config surface — can a TUI-printed link open Cursor?

Researched 2026-08-14 against primary sources only (docs.warp.dev, warpdotdev/Warp issues, the
local `~/.warp` config on this machine). Established empirical facts from the prior session
(OSC 8 rejects `cursor://`; `file://` OSC 8 opens Finder, not LaunchServices; the plain-path
linkifier does not run over alternate-screen output) are taken as given and not retested.

## 1. Where Warp config lives on macOS

Per <https://docs.warp.dev/terminal/settings/file-locations/>:

- `~/.warp/settings.toml` — the settings file, plain TOML, hot-reloaded on save
  (<https://docs.warp.dev/terminal/settings>)
- `~/.warp/keybindings.yaml` — keybindings
- `~/.warp/themes/`, `~/.warp/tab_configs/`, `~/.warp/default_tab_configs/`,
  `~/.warp/workflows/`, `~/.warp/launch_configurations/`
- `~/.warp/.mcp.json`, `~/.warp/skills/`, `~/.agents/` — agent-side config
- legacy user prefs: macOS `defaults` domain `dev.warp.Warp-Stable`
- state (not config): `~/Library/Logs/warp.log*`,
  `~/Library/Group Containers/2BBY89MBSN.dev.warp/…`

Confirmed locally: `~/.warp/settings.toml` exists here and already carries
`[code.editor] open_file_editor = { external_editor = "cursor" }` plus the same for
`open_code_panels_file_editor`.

The full documented key list is <https://docs.warp.dev/terminal/settings/all-settings/>. Reading
the `defaults` domain `dev.warp.Warp-Stable` turned up only mirrors of GUI settings
(`OpenFileEditor`, `CursorBlink`, …) plus telemetry/experiment bookkeeping (`ExperimentId`,
`SeenFeatureIntroIds`). **No hidden pref, feature-flag panel, or undocumented escape hatch for
link handling was found** — neither in the docs nor in the local prefs dump. If one exists it is
not observable from either source.

## 2. Is the OSC 8 scheme allowlist configurable?

**No — not documented, not in `all-settings`, not in the prefs domain.**

The OSC 8 implementation tracker is
[warpdotdev/Warp#4194](https://github.com/warpdotdev/Warp/issues/4194) ("Add support for OSC 8:
Hyperlinks in the terminal"). Notably, that issue itself carries an explicit open question:
*which URL schemes will be permitted, and whether `file://` links should open in an editor or
Finder*. So the allowlist and the Finder-vs-editor behaviour were a known design decision at
implementation time, resolved the way you observed, and never exposed as a setting.
[#6541](https://github.com/warpdotdev/Warp/issues/6541) is a duplicate of it.

The docs page <https://docs.warp.dev/terminal/more-features/files-and-links/> documents OSC 8 as
"Warp renders only the visible text and makes it clickable" and says nothing about scheme
restrictions or configuring them.

## 3. Making `file://` respect LaunchServices / the configured editor

**No such setting exists in the documented surface.** `[code.editor] open_file_editor` (values
`system_default`, `warp`, `env_editor`, or an external-editor object incl. `cursor`) governs
Warp's own *path linkifier*, not OSC 8 `file://` targets
(<https://docs.warp.dev/terminal/settings/all-settings/>).

Relevant issue history:

- [#177](https://github.com/warpdotdev/Warp/issues/177) — open. Asks exactly for "open the path
  with its associated application", suggesting Warp "piggyback off the `open` command". Still
  open, i.e. the LaunchServices path was never adopted.
- [#3970](https://github.com/warpdotdev/Warp/issues/3970) — `file:///path:35:24` links do
  nothing on click.
- [#7417](https://github.com/warpdotdev/Warp/issues/7417) — path linkification truncates before
  the end of long paths; **closed as not planned**. No TUI/alt-screen mention.
- [#2669](https://github.com/warpdotdev/Warp/issues/2669), [#2752](https://github.com/warpdotdev/Warp/issues/2752),
  [#3813](https://github.com/warpdotdev/Warp/issues/3813) — editor-picker limitations; all about
  the linkifier, none about OSC 8.

## 4. Hooks / custom actions / URI handler a TUI could invoke

The only Warp-side URI handler is the `warp://` scheme
(<https://docs.warp.dev/terminal/more-features/uri-scheme/>): `warp://action/new_window`,
`warp://action/new_tab`, `warp://launch/<config>`, `warp://tab_config/<name>`,
`warp://settings[/...]`. **None of these opens a file in an external editor or invokes an
arbitrary app.** Launch Configurations
(<https://docs.warp.dev/terminal/sessions/launch-configurations/>, legacy, superseded by Tab
Configs) only describe window/tab/pane layouts and startup commands — they are not click
handlers.

Warp exposes **no click hook, no custom-action, no per-scheme handler config** anywhere I could
find. [#950](https://github.com/warpdotdev/Warp/issues/950) ("custom clickable files" — make a
regex match clickable and run a command) is the feature that would provide this; it is open and
unimplemented.

[#5659](https://github.com/warpdotdev/Warp/issues/5659) — "Hope mouse click could support custom
URL Schemes" (`vscode://`, `custom_link://`), opened 2025-01-08, **open**, labels
`Enhancement` + `Triaged`, internal importance **3/10**, unassigned, no maintainer engagement,
no PR. This is the closest existing tracker for `cursor://`.

## 5. Extending the path linkifier over alternate-screen/TUI output

**Not configurable, and not documented as possible.** `all-settings` contains no linkifier scope
setting. The only alt-screen-related key is `[appearance.full_screen_apps] alt_screen_padding`,
which is purely visual padding. `[terminal] smart_select` affects double-click selection
semantics (URLs, emails, file paths), not click-to-open in alt-screen. I found **no issue
tracking "linkify inside alternate screen"** — the behaviour appears to be undiscussed publicly.

## 6. Issues tracking this exact problem (editor links from Claude Code in Warp)

- Warp ships an official Claude Code integration:
  <https://github.com/warpdotdev/claude-code-warp> (`/plugin marketplace add
  warpdotdev/claude-code-warp`). Its scope per the README is **native notifications and
  similar** — not link handling. Worth watching as the natural home for such a feature.
- [anthropics/claude-code#54606](https://github.com/anthropics/claude-code/issues/54606) — URLs
  in CC's TUI not clickable when wrapped across lines in Warp; the fix is CC emitting OSC 8.
  This is the http-URL case, adjacent but **not** the editor-open case.
- Other CC-in-Warp issues (context, not this problem):
  [#12094](https://github.com/warpdotdev/warp/issues/12094) scroll wheel hits CC's input,
  [#8490](https://github.com/warpdotdev/Warp/issues/8490) duplicate lines/ghosting in WSL,
  [#10347](https://github.com/warpdotdev/warp/issues/10347) and
  [#11819](https://github.com/warpdotdev/warp/issues/11819) external/zen editor for CC's input,
  [#7166](https://github.com/warpdotdev/warp/issues/7166) Warpify fails inside CC,
  [#12118](https://github.com/warpdotdev/warp/issues/12118) launch CC from Agent Mode.

**No issue exists for "make a path/link printed by a TUI agent open in my configured editor".**
The two adjacent open requests are #5659 (custom schemes) and #177 (LaunchServices for paths).

## 7. Other Warp settings worth knowing for a heavy Claude Code user

From <https://docs.warp.dev/terminal/settings/all-settings/>:

- `[appearance.full_screen_apps] alt_screen_padding` — padding around alt-screen TUIs
- `[terminal] maximum_grid_size` (default 50000) — scrollback rows
- `[terminal] osc52_clipboard_access` — `deny` / `write_only` / `read_write`; this machine is on
  `write_only`, which is what lets CC copy out
- `[terminal] smart_select` — double-click selection classes
- `[general] link_tooltip` — hover tooltips on links
- `[terminal.input] middle_click_paste_enabled`
- `settings.toml` is hot-reloaded, so it can be committed to dotfiles and edited freely
  (<https://docs.warp.dev/terminal/settings>)

**Not found anywhere:** any glyph/emoji-width or Unicode-width setting. If Warp has one it is
undocumented.

## Verdict

**No.** Warp exposes no configuration — documented, hidden, or via hooks/URI handlers — that
would make a path or link printed inside Claude Code's alternate-screen TUI open in Cursor.
`cursor://` is blocked by the unconfigurable OSC 8 scheme allowlist, `file://` is hardwired to
Finder, and the editor-aware path linkifier does not run over alt-screen output; there is no
third mechanism.

## Worth filing

**Yes — file it.** No existing issue covers this case. The nearest neighbours are
[#5659](https://github.com/warpdotdev/Warp/issues/5659) (custom URL schemes, open, importance
3/10, zero maintainer traction — commenting there is unlikely to move it) and
[#177](https://github.com/warpdotdev/Warp/issues/177) (open the path with its LaunchServices
default, open for years). The strongest new ask, and the one with the best odds given Warp's
own Claude Code integration exists, is: **honour `[code.editor] open_file_editor` for OSC 8
`file://` links instead of revealing in Finder** — a one-line behavioural change that needs no
new scheme allowlist and would immediately make CC's `footerLinksRegexes` output work. Consider
filing it on <https://github.com/warpdotdev/claude-code-warp> as well, since that repo has an
active owner and this is squarely its use case.
