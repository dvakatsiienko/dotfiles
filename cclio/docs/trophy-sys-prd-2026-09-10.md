---
dies-when: the «prd / product-owner» problem dima is about to introduce (2026-09-10) is solved and prds have a real home — move or delete this
---

# trophy-sys — what shipped 2026-09-10

**scope:** the features built in one evening session, plus the follow-up round that answered them
([BYT-83](https://linear.app/x-com/issue/BYT-83), PR #67, merged 2026-09-10). pre-existing behaviour
is not described here — `apps/trophy-sys/CLAUDE.md` is the app's own memory and tracks both rounds.

**why this file exists:** dima asked for a prd of the new features so the follow-up iterations have
something to work against. it records the ask, what shipped, the decisions taken on his behalf, and
what was deliberately left undone.

**the session's shape:** one coordinating session plus eight background agents, file ownership split
so none collided. everything below was verified by clicking through a real browser or by live curl,
never by typecheck alone.

📌 **the follow-up round is folded in below, not appended.** where it reversed a decision the first
round took, both are kept — the reversal is the more useful record, and three of them came from
dima looking at the running app rather than from any test or reviewer.

---

## 1. the owned library — 110 → 258 titles

- **the ask** — «why does sys not show my full lib? i had rogue legacy 2 in lib but did not open
  it. it only appeared as game 110 after i downloaded it and launched it once.»
- **the cause** — the library came from psn's **trophy** endpoint, which only knows a title after it
  has been launched. an owned-but-unopened game has no trophy record and therefore cannot appear.
- **what shipped** — `purchasedFetch` reads psn's entitlement list (`getPurchasedGames`, a persisted
  graphql query, **same access token**, no extra scope) and `gamesFetch` merges the two lists.
- **decisions** — dedupe reuses the existing measured name matcher rather than growing a second
  one. `source` on `Game` says which list a row came from.
- 📌 **two limits are psn's, not ours** — the endpoint is ps4/ps5 only, so nothing from ps3 or vita
  will ever appear; and entitlements are not games, so ~16 of the 258 are soundtracks and artbooks.
- 📌 **unverified** — ps plus catalogue titles may count as owned. nobody has checked a title dima
  only ever had through plus. worth one look.

## 2. the admin area at `/admin`

- **the ask** — «create caveman admin so i can hide/unhide games. give me possibility to paste the
  token so i wont wake you up. admin must work if token is expired and app is crashed. and create a
  login for me, so only i can enter, blocked for everyone else.»
- **what shipped**
  - **auth** — hmac-sha256 signed `sys_admin` cookie, `timingSafeEqual` on both password and
    signature, 30-day expiry, `Secure` dropped only on localhost.
  - **hide/unhide** — filtered list over 258 titles, text filter, `soundtracks` / `artbooks` filter
    presets, hide-all / unhide-all matching, per-row toggle with per-row pending state, sort
    defaulting to hidden-first, pager capped at 60 rows, live `N matching · M hidden of 258` count.
  - **auto-hide, added in the follow-up** — `isNonGame(name)` hides soundtracks and artbooks by
    name, so a title bought tomorrow arrives hidden with nothing written for it. the stores hold
    only *deviations* from that rule: `trophy-sys:hidden` the ids it would show, `trophy-sys:shown`
    the ids it would hide — which is what makes an unhide survive every later sync. the row says
    which is which: `[x] auto` · `[x] hidden` · `[ ] kept` · `[ ] visible`.
  - **the bulk buttons have their own pending flag** — they read the mutation's global `isPending`,
    so toggling any one of 258 rows greyed them both out.
  - **token paste** — a field with a client-side 64-character guard. kv is the source; the panel
    reads paste → save → where to get one → age.
  - **settings** — one checkbox so far, `hide 0-trophy games`, **on by default** since the
    follow-up.
  - **survivability** — `/admin` is a router sibling of the app shell, not a child, so it renders
    when every psn call is failing. that is the state it exists for. a `defaultErrorComponent`
    catches a thrown render error and links to `/admin`.
- **decisions taken on his behalf**
  - 📌 **credentials live in env vars, never in code.** he offered `12345` in chat; the app reads
    `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_SECRET`. a public url plus a committed password is
    not a thing to ship.
  - 📌 **missing config fails shut.** if any of the three vars is absent every admin route answers
    **503**, never an open door. a misconfigured deploy can never be an unlocked one.
  - 🔁 **«no invented is-this-a-real-game filter» — reversed in the follow-up, on his ask.** the
    first round refused to classify entitlements: the presets only filled the filter box and
    nothing hid until he pressed the button. he then asked for exactly that classification — «keep
    them hidden by default always unless unchecked» — because a manual sweep after every purchase
    is the thing a rule is for. what survives the reversal is the *escape hatch*: the row says
    `auto` rather than `hidden`, and one press overrules it permanently. `ost` is still excluded as
    a pattern because as a substring it claims *ghost of tsushima*.
- **the route surface** — `POST /api/admin/login` · `/logout` · `GET /api/admin/session` (never
  401, the ui uses it to pick a screen) · `GET`+`POST /api/admin/hidden` · `POST /api/admin/npsso` ·
  `POST /api/admin/settings` · `GET /api/admin/token`. plus public `GET /api/settings`, readable
  without a cookie because the charts need it.
- 📌 **`POST /api/admin/hidden` takes an intent, `{ ids, hide }`, not a finished set.** with a rule
  in play a set no longer expresses intent — leaving a rule-hidden id out of one is
  indistinguishable from asking to show it, and only the server knows which of the two lists an id
  belongs in.
- ⚠️ **`?all=1` is the admin's view and is cookie-gated.** an unauthenticated caller gets the
  filtered list rather than a 401 — refusing would confirm the parameter exists.

## 3. the npsso renewal loop

- **the ask** — implicit. the app went down mid-session because the token had expired, and the
  error rendered as sony's raw multi-line prose with a bare unclickable url.
- **what shipped**
  - the server collapses an expired-token failure to one sentinel, and the header renders
    **«PSN sign-in expired — Get new NPSSO code.»** as a real link.
  - `npssoRead()` prefers a stored token over the env var. vercel env vars cannot be written at
    runtime, so a pasted token has to live in the kv store — that ordering is the whole feature.
- **the loop is now** — app breaks → header offers the link → copy 64 chars from sony → paste in
  `/admin` → done. no redeploy, no `.env` edit, no agent.
- 📌 **kv is the source; `NPSSO` is a bootstrap seed and nothing else.** read only while kv is
  empty, so a first deploy works before anything is pasted, and the first paste retires it for
  good. `.env.example` says so at the top — it used to open with «NPSSO comes from .env», which
  taught a fresh setup the wrong model.
- 🔁 **a two-source design was built in the follow-up and then removed, on his word.** it compared
  the pasted token against the env var, reported which one had actually minted the live session,
  retried with the env token when psn refused the pasted one, and offered a button to hand the app
  back to vercel. his verdict after using it: «confuses more than it protects». the removal was 346
  lines out, 55 in.
- 📌 **the lesson from that reversal, kept because the code is not.** one extra source needed four
  pieces of interface to explain one piece of behaviour — a comparison row, a «which is actually
  working» row, a note for the fallback, and a destructive button to undo it. each followed
  honestly from the last. the moment to stop was before the first one, not after the fourth.
- 📌 a `token in use` row survived one round longer and was cut too: with a single source it said
  the same thing on every read after the first paste, and the one state it existed for — a deploy
  still on the seed — is carried by `age: unknown` plus the note beneath it.

## 4. measuring the npsso lifetime

- **the ask** — «let's measure. setup measurement so i see in admin eg roughly days to expire.»
- **why** — sony publishes no lifetime. the internet says ~60 days. **the repo's own history says
  ≤25**: the vercel var was written 2026-08-16 and the token was dead on 2026-09-10. an upper
  bound, since nobody knows the day it actually died.
- **what shipped** — the stored token became a record carrying `savedAt`; the first psn rejection
  stamps `diedAt` once; each renewal appends one measured lifetime to a list. `GET /api/admin/token`
  reports age, death, and the samples, and never carries the token itself.
- **decisions**
  - 📌 **a retired-early token contributes nothing to the average.** its age is a floor, not a
    lifetime, and mixing the two poisons the number.
  - 📌 **the readout must under-claim.** with zero samples it offers no estimate at all; with one it
    says «1 sample». a confident average built on one death is exactly how the wrong 60-day figure
    got believed in the first place.
- 📌 **the clock only runs where a token was pasted.** local dev writes a json file, production
  writes upstash. production begins measuring at its first paste, not at deploy.

## 5. hidden means hidden everywhere

- **the bug** — `/api/games` filtered hidden ids, but the stats archive never read the hidden set.
  a hidden game vanished from `/library` while still inflating every kpi and drawing a mark on every
  chart. two screens silently disagreeing about what the library is.
- **the decision** — hidden means hidden everywhere. he hides a game because he does not want to
  see it.
- **what shipped** — a **read-time** filter, so the archive stays complete and hide/unhide is
  instant. scan-time filtering would have made every unhide cost a rescan. `ARCHIVE_VERSION`
  deliberately not bumped, since the stored shape did not change.
- 🔎 **a latent bug found on the way** — the stats scan read the library under cache key `games:800`,
  the same key `/api/games` uses for the **hidden-filtered** list. whichever populated first won, so
  the trophy delta scan could silently skip hidden titles depending on click order. repointed to the
  raw key. this one only misbehaves after something is hidden, and only sometimes.

## 6. login throttling

- **the ask** — none. raised as a hole and he said to do it.
- **the risk** — a public url plus a guessable password plus unlimited attempts.
- **what shipped** — 5 failures then a cooldown doubling 60s → 900s cap. a **global** counter, not
  per-ip: there is exactly one legitimate user, and a per-ip key off `x-forwarded-for` hands an
  attacker a free reset.
- 📌 **`lockedUntil` is a timestamp, never a flag**, so every lockout expires on its own and no
  amount of attacker traffic can shut dima out permanently. hammering during a cooldown does not
  extend it.
- ⚠️ **it is in-process, therefore best-effort on serverless.** vercel does not share memory between
  invocations, so a determined attacker hitting cold instances gets more than 5 tries. a shared
  counter in the kv store is the real fix and was not built. this is a speed bump, not a wall.

## 7. the smaller ones

- **refetch on window focus** — was off, and `staleTime` was 60s, so even turning it on would have
  been a no-op inside the api's own memo window. now on, with `staleTime` at 10s. the server's own
  60s cache means a client refetch inside that window costs nothing at psn.
- **chart margins** — every x-axis chart carried its own bottom margin: effort 36, the ranked bar
  charts 22, everyone else 26, drifted apart over months. one `AXIS_BOTTOM` constant now. the ranked
  charts had also been hanging 2px past their own box.
- ⚠️ **the follow-up found four more axis faults, all by eye, none caught by any test or reviewer.**
  the first round's own note said «not visually verified», and nobody had ever opened these charts
  in a browser. what a check at 390 and 1280 found: y labels cut on the left, so `2,000` drew as
  `,000` for months (the left margins had drifted 38/42/38, and 38 was simply too small); month
  labels printing over each other at 390, because both month charts asked for 6 ticks at every
  width; the last month label hanging half past the right edge; and — created by turning the
  0-trophy default on — a log axis emitting 26 overlapping labels.
  📌 **the log one is a d3 behaviour worth knowing: it abandons the tick count you pass once a log
  domain spans fewer decades than that count, and emits every minor tick instead.** `AXIS_LEFT`,
  `MONTH_AXIS_RIGHT`, `monthTicks(innerWidth, n)` and `decadeTicks` are the fixes.
- **`@ui/kit` wired into trophy-sys** — the app had no shadcn at all. `components.json`, the
  workspace dependency, `resolve.dedupe`, and the shadcn l2 token vocabulary mapped onto the
  existing gruvbox `--p-*` palette at `--radius: 0px`. 📌 **no second colour system, no raw hex** —
  a kit button comes out square, mono and orange, native to the app.
- **tests** — the app had 3 test files and nothing covering any of the above. 24 new tests: cookie
  round-trip, tampered signature, tampered expiry, malformed shapes proving `timingSafeEqual` never
  throws, the throttle's lock / clear / self-recovery / cap, the merge's dedupe and cross-gen cases,
  and the `isStateWritable === false` 501 branch that had never been exercised. the follow-up took
  it to **61**, covering the token readout's honesty rules and the auto-hide rule's false positives.

## 8. what the follow-up changed outside trophy-sys

- **`@ui/kit`'s `cn` in `apps/financial`** — the last `clsx` straggler in the monorepo. the app was
  not wired to the kit at all, so it gained `@ui/kit: workspace:*` and `transpilePackages`.
  📌 `cn` is clsx **plus tailwind-merge**, so a conflicting class pair now resolves last-wins
  instead of by stylesheet order. checked all 7 call sites; the one real conflict is pagination's
  `border-rule` against `border-seal` on the active page, where last-wins is the intent.
- **`typescript.ignoreBuildErrors` removed from all four next apps** — cv, figmentation, financial
  and x-com-chat. every one was already clean under `tsc`, and each `next build` now runs the check
  itself in under 300ms. the flag only ever bought a window where a build goes green on code `tsc`
  would reject.
- **`.cursor/rules/` deleted** — five files from 2025-07, every line of them since covered by the
  fleet rules or the `x:guide-*` skills. eight lines that were not went to those guides instead.
- 📌 **removing a setting is not done when the code is gone.** two memory files still documented
  `ignoreBuildErrors` as deliberate, with a rationale, after it was deleted — `apps/x-com-chat/CLAUDE.md`
  and `apps/cv/AGENTS.md`. `.env.example` did the same for the npsso env var. **grep for what
  *taught* a setting, not just what set it**; docs outlive code by a commit or two, and they are
  what the next reader learns from.

---

## deliberately not done

- 🟢 **the architecture deepening candidates — still all six, verified unimplemented on main.** an
  `improve-codebase-architecture` pass produced six ranked candidates in an html report. the top
  one — a `PlotSurface` module absorbing the sizing and tooltip wiring that six chart files each
  re-hand-roll — is the actual cure for the margin drift that hoisted constants only treat, and the
  follow-up's four extra axis faults are the same disease again. 📌 **five of the six touch
  `stats.tsx` and the chart modules, which a redesign would rewrite**, so the honest order is: settle
  the redesign / next.js question first, then take these. **they want dima's eyes.**
- 🔴 **production still stores `effortHideUntouched: false`.** `settingsLoad` spreads the store over
  the defaults, so a key already written outranks a changed default forever. flipping the code
  default therefore reaches a fresh install and nothing else — the live value needs one tick of the
  checkbox in `/admin`. no production write was made from the follow-up.
  ([BYT-85](https://linear.app/x-com/issue/BYT-85))
- **the refresh-grant instrument.** dima's real want is a token that resumes itself. three lifetimes
  are in play and the ask conflates two: the access token (~1h, already refreshed in memory), the
  **refresh grant** (the ~10 days measured — this, not the npsso), and the npsso (≤25 days
  observed). «paste once ever» is not reachable, but storing the refresh token in kv and refreshing
  it on the existing daily cron turns days between pastes into weeks. 📌 **measure the grant's real
  lifetime before building it** — store the expiry at mint, record the first refusal, same shape the
  npsso deaths already use. ([BYT-85](https://linear.app/x-com/issue/BYT-85))
- **a chart-layout invariant test** — a headless assertion that every x-axis chart ends the same
  distance above its panel edge, and that no axis label is clipped. would have caught the margin
  drift the day it happened **and the four faults the follow-up found by eye**, and is the
  machine-checkable finish line that would make a ralph loop usable on layout bugs. he said «yes,
  later». this is the highest-value item on this list.
- **a separate upstash store for preview.** preview shares production's kv, so a preview deploy
  writes the live token and the live hidden set. mitigated by leaving preview's admin vars unset —
  it can read, it cannot write — but a guard is not a fix.
- **production `Secure` cookie flag** — only ever exercised on localhost, where it is deliberately
  dropped. one curl against production settles it.
- **error boundary logs nothing.** a production render error is currently invisible.
- **the login throttle is still in-process.** §6's ⚠️ stands unchanged: a shared counter in kv is
  the real fix.

---

## what the follow-up measured about reviewing

not product, but the sharpest thing this round produced. across the whole of PR #67:

- five reviewers over three rounds found **one** real defect between them (`monthTicks` drawing a
  duplicate label on a one-month archive, caught by coderabbit and matt's spec pass independently).
  ci `@claude` later found two more, both in code the earlier rounds had already passed.
- **three defects came from running the app**, and no reviewer found any of them: four axis faults
  from a browser at two widths, and `liveSource` outliving the session it described, from testing
  the token clear end to end.
- **three more came from dima looking at the running thing** — the two-source cut, the `token in
  use` row, the panel order. none from a test, a reviewer, or the coder.
- 📌 the shape of that is the finding: a lane with five reading steps and no running step finds
  what reading finds.
