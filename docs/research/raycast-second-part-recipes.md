---
dies-when: distilled into DOT-237's second-part walkthrough and the kept set lives in the ticket body
---

Ticket: DOT-237

# raycast second part — borrowed recipes for aliases, snippets, calc, notes, calendar

the rule this doc obeys (dima, 2026-09-16): no 100 aliases nobody uses. every line below is
something at least one published setup runs daily, with the url that proves it.

## aliases

**what it is.** an alias is a short keyword typed in root search that hard-prioritises one
command; matching is strict **prefix**, not fuzzy, so it is predictable muscle memory. allowed
characters are `a–z`, `0–9` and space. since raycast 2 both alias and hotkey are set from the
action panel (`⌘K` → configure command) without opening settings.
source: [command aliases and hotkeys](https://manual.raycast.com/command-aliases-and-hotkeys)

**borrowed recipes**
- two-letter app launchers for the 4–6 apps you open by name daily (`gc` chrome) — the manual's own
  example and the one pattern every setup repeats · [manual](https://manual.raycast.com/command-aliases-and-hotkeys)
- `cb` for clipboard history — named in the manual as the canonical non-app alias; earns a slot only
  if the hotkey is not already in your fingers · [manual](https://manual.raycast.com/command-aliases-and-hotkeys)
- `gg` google search / `gif` gif search — search-scope aliases, the shape that actually recurs in
  published setups · [beard.fm guide](https://wiki.beard.fm/productivity/how-to-automate-your-mac-with-raycast-a-guide-to-hotkeys-ali)
- `n` for the notes/notion search command — one letter for the one capture surface · [beard.fm](https://wiki.beard.fm/productivity/how-to-automate-your-mac-with-raycast-a-guide-to-hotkeys-ali)
- `ww` for the window-management group — only relevant where a hotkey is not already bound;
  yours are · [beard.fm](https://wiki.beard.fm/productivity/how-to-automate-your-mac-with-raycast-a-guide-to-hotkeys-ali)
- an alias per **quicklink family prefix** (`q`+letter grammar already exists here) — aliases and
  quicklink keywords live in the same namespace, so keep one grammar, not two · [manual](https://manual.raycast.com/command-aliases-and-hotkeys)

**skip**
- an alias for anything that already has a hotkey — two doors to one command is the clutter he named.
- aliases for extension commands you invoke less than weekly; prefix matching already finds them.
- `et` (empty trash) and similar chore aliases — real but rare; typing the name is fine.

**open question.** aliases vs the existing `q`-prefixed quicklink grammar: one shared namespace with
`q` reserved for links and bare letters for commands, or aliases only for apps? his grammar taste decides.

## snippets

**what it is.** keyword-triggered text expansion, system-wide, with tags for grouping, import from
json / textexpander / espanso, and export for backup. snippets can embed other snippets
(`{snippet name="…"}`), so a signature updates in one place. 2026: snippets can be created straight
from ai chat, the composer or notes, and team snippets sync to ios.
sources: [snippets](https://manual.raycast.com/snippets) · [changelog](https://www.raycast.com/changelog)

**placeholders** (all of these are the payload of the recipes below):
`{clipboard}` `{clipboard offset=1}` `{selection}` `{cursor}` `{date}` `{time}` `{datetime}` `{day}`
`{uuid}` `{calculator}` `{browser-tab}` `{argument name="x"}` — with `format="yyyy-MM-dd"`,
`offset="+2d -3M"`, `locale=` and chainable modifiers `uppercase|lowercase|trim|percent-encode|json-stringify|raw`.
source: [dynamic placeholders](https://manual.raycast.com/dynamic-placeholders)

**borrowed recipes, ranked by how often independent setups run them**
- **iso date** — `;;d` → `{date format="yyyy-MM-dd"}`. used for pr titles, file names, journal
  headers; the single most-repeated snippet in published setups · [dataders dotfiles](https://github.com/dataders/dotfiles/issues/14)
- **ticket link** — `;;t` → `[{argument name="ticket"}](https://linear.app/issue/{argument name="ticket"})`.
  one argument reused twice; exactly the jira recipe, retargeted at linear · [dataders](https://github.com/dataders/dotfiles/issues/14)
- **share clipboard** — `;;s` → prose + `{clipboard}`. the manual's own teaching example because it
  is the one people keep · [beard.fm](https://wiki.beard.fm/productivity/how-to-automate-your-mac-with-raycast-a-guide-to-hotkeys-ali)
- **standup / daily log** — `;;stand` → yesterday `{date offset="-1d"}` + today `{date}` + `{cursor}`.
  the offset modifier's main real use · [dataders](https://github.com/dataders/dotfiles/issues/14)
- **command template with args** — `;;run` → a cli line with `{argument name="…" default="…"}`.
  the shape that replaces a dozen static snippets with one · [dataders](https://github.com/dataders/dotfiles/issues/14)
- **signature / boilerplate composed from a sub-snippet** — the email template embeds the signature
  snippet so one edit propagates · [manual](https://manual.raycast.com/snippets)
- 📌 **prefix every keyword** (`;;` or `!`) — the published convention that stops accidental
  expansion inside code and prose · [dataders](https://github.com/dataders/dotfiles/issues/14)

**skip**
- code snippets as text expansion — your editor and its own snippets own that surface.
- long templates with 3+ arguments; past two slots a script command reads better.
- team/shared snippets — solo setup, no audience.
- `{uuid}` / `{calculator}` inline — real, but neither shows up in any daily setup found.

**open question.** prefix character: `;;` (published convention, never appears in ukrainian or english
prose) vs a leading `!`. `;;` is safer for a typescript keyboard; his fingers decide.

## calc

**what it is.** root-search calculator over natural language: units, live currency, percentages,
trigonometry, date math, time-zone comparison, iso 8601, and design conversions (inches→pixels).
2026 added a **calculator history** widget plus an interactive currency widget and a control-center control.
sources: [manual](https://manual.raycast.com/calculator) · [calculator feature page](https://www.raycast.com/core-features/calculator) · [changelog](https://www.raycast.com/changelog)

**borrowed recipes**
- `100 usd in uah` / `5 eur to pln` — live currency, the single most-used calc case in every writeup · [feature page](https://www.raycast.com/core-features/calculator)
- `5pm ldn in kyiv` — time-zone translation typed as prose; the recipe that kills a browser tab for
  anyone working across zones · [feature page](https://www.raycast.com/core-features/calculator)
- `monday in 3 weeks` / `days until 25 dec` — date math for scheduling and deadline counts · [feature page](https://www.raycast.com/core-features/calculator)
- `32% of 5` and `145 mins to timespan` — percentage and duration normalisation, the estimate-math case · [feature page](https://www.raycast.com/core-features/calculator)
- `23C to F`, `4 feet to cm` — unit conversion; earns a slot only because it is zero-setup · [feature page](https://www.raycast.com/core-features/calculator)
- pin the **calculator history** widget if you re-use results — new in 2026, otherwise results vanish · [changelog](https://www.raycast.com/changelog)

**skip**
- nothing to install here; calc is pure recall. the only «setup» is knowing the phrasings above.
- the currency home-screen widget unless currency is a daily check.

**open question.** does a dedicated hotkey for calc earn a slot, or is root search + typing fast enough?

## notes

**what it is.** a markdown scratchpad that floats over any app; notes stack like pages, pinned notes
open on `⌘0–9`, `⌘[`/`⌘]` walk history, `⌘P` lists them, `⇧⌘C` copies as plaintext. cloud sync across
macs and ios, encrypted store, export to txt/markdown/html or into apple notes, 60-day recovery.
📌 **free tier caps at 5 notes** — unlimited is pro. 2026 added a setting for whether a new note starts
as H1 or paragraph.
sources: [manual](https://manual.raycast.com/notes) · [feature page](https://www.raycast.com/core-features/notes) · [changelog](https://www.raycast.com/changelog)

**borrowed recipes**
- **one pinned scratch note on a hotkey** — the dominant published use: a single always-there sticky
  for the thing you are holding in your head right now · [hn thread](https://news.ycombinator.com/item?id=39433899)
- **keep it floating while you work** — the note stays over the app you are reading; that is the
  whole reason it beats a real notes app · [scott willsey](https://scottwillsey.com/raycast-notes/)
- **capture-then-route** — capture in raycast, move into the real system (obsidian here) later;
  every writeup that lasts treats it as a buffer, not a store · [scott willsey](https://scottwillsey.com/raycast-notes/)
- `⌘P` browser + pinned `⌘1–3` for the two or three live topics · [manual](https://manual.raycast.com/notes)
- `⇧⌘C` plaintext copy — the escape hatch from raycast's auto-markdown link pasting · [scott willsey](https://scottwillsey.com/raycast-notes/)

**skip**
- notes as a knowledge base — the author who uses it daily says explicitly it cannot replace
  obsidian/notion, and a second store is the thing your vault rules already forbid · [scott willsey](https://scottwillsey.com/raycast-notes/)
- pasting urls expecting plaintext; they auto-convert to markdown links.

**open question.** does a raycast scratch note earn a place next to the obsidian inbox at all, or does
a second capture surface just split the stream? his call — the 5-note free cap makes «one scratch
note, never a library» the natural answer.

## calendar

**what it is.** reads macos calendar via eventkit, so whatever is in calendar.app (google, icloud,
microsoft/exchange) is in raycast. `my schedule` groups events by this week / next week / rest of
month; root search surfaces the next meeting's join button. auto-join can open a call as it starts,
with optional camera preview. menu-bar agenda shows the next event. shortcuts: `⌘⏎` join,
`⌃A`/`⌃D` rsvp, `⇧⌘B` block time. 2026 added riverside and streamyard to the 15 supported providers
(zoom, meet, teams, slack huddles, webex, facetime, …).
sources: [manual](https://manual.raycast.com/calendar) · [changelog](https://www.raycast.com/changelog)

**borrowed recipes**
- **join the next call from root search** — `⌘⏎` on the next event; the one calendar feature every
  writeup keeps · [manual](https://manual.raycast.com/calendar)
- **menu-bar next event** — ambient «what's next» with no window; pairs with your existing menu-bar
  discipline · [manual](https://manual.raycast.com/calendar)
- **`my schedule` on an alias** (`sch`) instead of opening calendar.app · [manual](https://manual.raycast.com/calendar)
- **`⇧⌘B` block time** — carve a focus block without leaving the launcher · [manual](https://manual.raycast.com/calendar)
- **create event from raycast** with attendees/location inline, for the one-off invite · [manual](https://manual.raycast.com/calendar)

**skip**
- auto-join — it opens meetings without asking; hostile on a machine you share with deep work.
- meeting transcription — a whole separate consent question, and wispr flow already owns dictation.
- the calendar setup at all if the mac calendar.app holds no accounts; eventkit is the only source.

**open question.** is the mac calendar.app actually connected to his google account? without that,
every recipe here is dead, and the slice becomes a 2-minute check rather than a walkthrough.

## suggested first set — the smallest thing worth installing on day one

- snippets: `;;d` iso date · `;;t` linear ticket link · `;;s` share-with-clipboard — three, prefixed `;;`
- snippets: adopt the `;;` prefix as the standing convention before writing a fourth one
- aliases: 3–4 two-letter app launchers for the apps opened by name daily, nothing else
- aliases: `sch` for `my schedule`, only if calendar.app has his accounts
- calc: no install — learn five phrasings (`x usd in uah`, `5pm ldn in kyiv`, `monday in 3 weeks`,
  `32% of 5`, `4ft to cm`)
- notes: exactly one pinned scratch note on a hotkey, treated as a buffer that drains into obsidian
- calendar: menu-bar next event on, auto-join off
- everything else stays uninstalled until a second sighting of the same ask
