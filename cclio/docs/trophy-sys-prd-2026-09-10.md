# trophy-sys — what shipped 2026-09-10

**scope:** the features built in one evening session, and nothing else. pre-existing behaviour is
not described here — `apps/trophy-sys/CLAUDE.md` is the app's own memory and was refreshed to match.

**why this file exists:** dima asked for a prd of the new features so the follow-up iterations have
something to work against. it records the ask, what shipped, the decisions taken on his behalf, and
what was deliberately left undone.

**the session's shape:** one coordinating session plus eight background agents, file ownership split
so none collided. everything below was verified by clicking through a real browser or by live curl,
never by typecheck alone.

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
  - **token paste** — a field with a client-side 64-character guard; the pasted token outranks the
    env var from that moment on.
  - **settings** — one checkbox so far, `hide 0-trophy games`.
  - **survivability** — `/admin` is a router sibling of the app shell, not a child, so it renders
    when every psn call is failing. that is the state it exists for. a `defaultErrorComponent`
    catches a thrown render error and links to `/admin`.
- **decisions taken on his behalf**
  - 📌 **credentials live in env vars, never in code.** he offered `12345` in chat; the app reads
    `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_SECRET`. a public url plus a committed password is
    not a thing to ship.
  - 📌 **missing config fails shut.** if any of the three vars is absent every admin route answers
    **503**, never an open door. a misconfigured deploy can never be an unlocked one.
  - 📌 **no invented «is this a real game» filter.** psn lists entitlements; classifying them is a
    judgement he wanted to keep. the presets only fill the filter box — nothing hides until he
    presses the button. `ost` was deliberately excluded as a preset because as a substring it
    claims *ghost of tsushima*.
- **the route surface** — `POST /api/admin/login` · `/logout` · `GET /api/admin/session` (never
  401, the ui uses it to pick a screen) · `GET`+`POST /api/admin/hidden` · `POST /api/admin/npsso` ·
  `POST /api/admin/settings` · `GET /api/admin/token`. plus public `GET /api/settings`, readable
  without a cookie because the charts need it.

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
- **chart bottom padding** — every x-axis chart carried its own bottom margin: effort 36, the ranked
  bar charts 22, everyone else 26, drifted apart over months. one `AXIS_BOTTOM` constant now. the
  ranked charts had also been hanging 2px past their own box.
- **`@ui/kit` wired into trophy-sys** — the app had no shadcn at all. `components.json`, the
  workspace dependency, `resolve.dedupe`, and the shadcn l2 token vocabulary mapped onto the
  existing gruvbox `--p-*` palette at `--radius: 0px`. 📌 **no second colour system, no raw hex** —
  a kit button comes out square, mono and orange, native to the app.
- **tests** — the app had 3 test files and nothing covering any of the above. 24 new tests: cookie
  round-trip, tampered signature, tampered expiry, malformed shapes proving `timingSafeEqual` never
  throws, the throttle's lock / clear / self-recovery / cap, the merge's dedupe and cross-gen cases,
  and the `isStateWritable === false` 501 branch that had never been exercised.

---

## deliberately not done

- 🟢 **the architecture deepening candidates.** an `improve-codebase-architecture` pass ran and
  produced six ranked candidates in an html report. the top one — a `PlotSurface` module absorbing
  the sizing and tooltip wiring that six chart files each re-hand-roll — is the actual cure for the
  margin drift that a hoisted constant only treated. these touch six chart files and were held back
  from an unattended overnight push. **they want dima's eyes.**
- **a chart-layout invariant test** — a headless assertion that every x-axis chart ends the same
  distance above its panel edge. would have caught the margin drift the day it happened, and is the
  machine-checkable finish line that would make a ralph loop usable on layout bugs. he said «yes,
  later».
- **the 16 soundtracks and artbooks are still visible.** the tool exists; the button has not been
  pressed. that is his call to make, by eye.
- **a separate upstash store for preview.** preview shares production's kv, so a preview deploy
  writes the live token and the live hidden set. mitigated by leaving preview's admin vars unset —
  it can read, it cannot write — but a guard is not a fix.
- **production `Secure` cookie flag** — only ever exercised on localhost, where it is deliberately
  dropped. one curl against production settles it.
- **error boundary logs nothing.** a production render error is currently invisible.
