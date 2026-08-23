---
researched: 2026-08-22
sources-current-as-of: 2026-08-22
refresh-when: whisper.cpp ships a model claiming better rare-word handling, or the yt-transcript whisper tier is picked up again
ticket: DOT-211
---

# DOT-211 — whisper vs youtube captions: the verdict

# 🎯 whisper WINS — but only if you tell it the words first. Exactly as the ticket specifies it, with no vocabulary prompt, it LOSES badly.

Run 2026-08-22 · opus 5 · M4 Pro, Metal GPU · `ggml-large-v3-turbo.bin` (1,624,555,275 bytes)

## the number that decides it

The failure captions actually have is technical terms. Both videos are about agent memfiles, so the
sharpest countable thing is how often each transcript spells the filename **`CLAUDE.md`** correctly
— meaning the word *Claude*, a dot, and *md*. This is a **census, not a sample**: every occurrence
in both transcripts, found by regex over the full text, then read in context.

| | captions | whisper (as specced) | whisper + vocabulary prompt |
| --- | --- | --- | --- |
| bytemonk (6m35s) | 2 right / 4 wrong | **0 right / 6 wrong** | 3 right / 3 wrong |
| theo (51m15s) | 3 right / 9 wrong | **0 right / 11 wrong** | 7 right / 6 wrong |
| **total** | **5 of 18 — 28% right** | **0 of 17 — 0% right** | **10 of 19 — 53% right** |

Read that middle column again. Unprimed whisper got the central filename of both videos right
**zero times out of seventeen.** It is not marginally worse than captions; it is a total loss on the
one thing the tier exists to fix.

Add one line of prompt and it roughly **doubles captions' accuracy**, 53% against 28%.

### the failure mode, and why the prompt fixes it

Unprimed whisper glues identifiers together. On the long video it produced **17 glued forms** where
the captions produced **2**:

```
ClaudeMD ×6   CloudMD ×5   AgentMD ×3   AgentsMD ×2   ReadMeMD ×1
also:  pnpmdev,  bundev,  T3GG,  T3Chat,  T3Code,  agent's MD
```

Those are the worst kind of error — unsearchable and non-obvious. `Claude MD` at least reads.
`ClaudeMD` and `pnpmdev` look like real identifiers and are not.

Priming with the vocabulary cut glued forms from **17 to 1**, and produced `CLAUDE.md` in correct
casing six times — something neither the captions nor unprimed whisper ever managed once.

The prompt used (a `--prompt` plus `--carry-initial-prompt`, one line):

```
Technical talk about Claude Code. Terms used: CLAUDE.md, AGENTS.md, SKILL.md, Claude,
Anthropic, Codex, Cursor, MCP, pnpm, npm, TypeScript, monorepo, subagents, hooks, T3 Chat, T3 Code.
```

## ⏱️ wall-clock — speed is a non-issue

| stage | bytemonk (395s audio) | theo (3,075s audio) |
| --- | --- | --- |
| model download | 1.62 GB, **one time only** | — |
| `yt-dlp -x` | ~15s (66 MB) | ~40s (517 MB) |
| ffmpeg → 16 kHz mono | **0s** | **1s** |
| whisper, unprimed | **15s** | **123s** |
| whisper, primed | **14s** | **109s** |
| ratio | **26× realtime** | **25× realtime** |

**A 51-minute talk transcribes in about two minutes.** The worry in the ticket — «is it 5 minutes
or 20 on the M4 Pro» — is answered: it is two, and the GPU does the work. Speed never enters the
decision.

## what captions still do better — whisper is not ahead on everything

Judged by reading each divergence in context, not by counting alone:

- **Ordinary words used technically.** Captions wrote `trailing new line`, `those notes`, and `both
  writes in one transaction`. Whisper heard `failing`, `nodes`, and `rights` — and the prompt did
  **not** fix any of the three, because they are common words, not names.
- **Path-shaped strings.** Captions kept `path-scoped` and `source/payments`; unprimed whisper flattened
  both. (Priming recovered `path-scoped`.)
- **Word-level timing, but only as i ran it.** `captions.vtt` carries per-word timestamps and the
  `.srt` i produced is sentence-level. 📌 This is **not** a real whisper limitation: `whisper-cli`
  offers `-ml`/`-sow` for finer segments and `--dtw` for token-level timestamps. I did not run
  either, so treat the gap as an artefact of my flags rather than a point against whisper.

Whisper wins on: punctuation and sentence segmentation, compound words (`lifecycle`, `block-level`,
`sub-agents`), `Anthropic` spelled right where captions wrote `Antropics`, and one badly garbled
caption phrase — «way command doesn't really do much» became «vague comment does very little».

Overall word-level similarity between captions and whisper was **96.5%** (bytemonk) and **96.3%**
(theo). The two transcripts mostly agree; the disagreement is concentrated exactly where the ticket
predicted, on the technical vocabulary.

## 🚨 an operational finding that will bite whoever builds this

**`yt-dlp -x` fails with HTTP 403 on the default player client, and the client that works differs
per video.**

| video | working `--extractor-args "youtube:player_client=…"` |
| --- | --- |
| bytemonk `PXzHKuBuyJU` | `web_safari` (`web`, `tv`, `ios`, default all failed) |
| theo `e1snsuY4lTI` | `mweb` (`web_safari` failed here) |

So an audio path cannot hardcode one client — it has to try a list. 📌 Captions are unaffected;
they come from a different endpoint and never 403'd. This is a cost the whisper tier carries and
the captions tier does not.

## what i could NOT verify

- 🚫 **Only `large-v3-turbo` was tested**, as the ticket specified. Turbo is the pruned, speed-built
  decoder, and pruning is exactly what hurts rare words. **Full `large-v3` was never run** — it may
  need no prompt at all. That is the single most valuable untested lever.
- 🚫 **Two videos, one speaker each, both English, both same domain.** The prompt worked because the
  vocabulary was known in advance. For Dima's use (agent and coding videos) that vocabulary is
  stable, so this is fair — but it is not a general result.
- 🚫 **No ground-truth transcript exists.** Where captions and whisper disagreed on an ordinary word
  i judged from context; where context could not settle it, i counted it for neither side.
- 🚫 **`parakeet-cli` untouched**, as instructed.

## ➡️ recommendation

**The gate passes, conditionally — so do not close this as canceled.** But do not build what the
ticket describes either, because that exact recipe scored zero.

If the tier is built, the vocabulary prompt is **mandatory, not an option** — it is the whole
difference between winning and total loss. Before building, the cheap next experiment is full
`large-v3` unprimed: it costs one 3 GB download and about four minutes of compute, and it would say
whether the prompt is needed at all.

**I built nothing.** The brief said measure first, and the follow-up said finish the verdict and
stop. The build decision is unblocked and is yours to assign.

## housekeeping

- ✅ **The two DOT-73 transcripts were never touched.** Verified before and after: 59,452 and 6,608
  bytes, md5 `5a26a3d4cde040f058e5dbe081ca37e3` and `eba71d9a3acf75a1f281eb9210cda8d1`.
- ✅ Whisper output went to `~/.claude/shelf/yt-transcripts/.whisper-test/`, a dot-directory, so it
  is invisible to the skill's `ls` recall and cannot match its anchored dedupe. Confirmed by running
  both.
- ✅ All `audio.wav` / `audio_raw.wav` deleted after each run. The lab holds only text now.
- 📌 The model sits at `~/.claude/shelf/yt-transcripts/.models/ggml-large-v3-turbo.bin`, 1.62 GB.
  **Delete it if this tier is dropped** — nothing else uses it.
- 📌 The store is gitignored, so none of this reached the repo.

## coordination — answering the push question

**It was not me. I have never run `git push` in this session**, and there is evidence rather than
just my word: `git reflog show origin/main` records my last two commits arriving here as
`fetch origin: fast-forward` at 21:58:45. A push from this checkout writes `update by push`; a fetch
means they reached origin from somewhere else and this checkout learned about it afterwards.

📌 That same reflog shows three genuine `update by push` events from **this** working copy at
21:20:54, 21:33:50 and 21:43:37 — which carried my earlier commits. Something sharing this checkout
is pushing. Worth finding, since neither of us is doing it deliberately.

Also noted: DOT-213 cancelled, never started. I did not touch `home/.claude/mcp-x-cw/`.

---

# round 2 — full `large-v3`, unprimed

# 🎯 OUTCOME 3. `large-v3` unprimed is **no better than turbo**, and 3× slower. The pruning theory was wrong.

Run 2026-08-22, same machine, same audio, same census, same method. Model
`ggml-large-v3.bin`, **3,095,033,483 bytes**.

## the question, answered

> Does full `large-v3`, with no vocabulary prompt, beat youtube's captions on the same census?

**No. It does not even beat turbo.** It scored **0% on both videos**, exactly as turbo did.

| `CLAUDE.md` spelled right | captions | turbo unprimed | **large-v3 unprimed** | turbo + prompt |
| --- | --- | --- | --- | --- |
| bytemonk (6m35s) | 2 / 4 — **33%** | 0 / 6 — 0% | **0 / 4 — 0%** | 3 / 3 — 50% |
| theo (51m15s) | 3 / 9 — **25%** | 0 / 11 — 0% | **0 / 11 — 0%** | 7 / 6 — 54% |
| **total** | **5 of 18 — 28%** | 0 of 17 — 0% | **0 of 15 — 0%** | **10 of 19 — 53%** |

Glued identifiers on the long video: captions **0**, turbo **17**, **large-v3 15**, primed **1**.
Fifteen against seventeen is noise, not an improvement — and the same words fail:

```
large-v3:  CloudMD ×6  ClaudeMD ×5  AgentsMD ×2  AgentMD ×1  ReadMeMD ×1
turbo:     ClaudeMD ×6  CloudMD ×5  AgentMD ×3  AgentsMD ×2  ReadMeMD ×1
```

📌 **`large-v3` also invented a failure turbo did not have.** It wrote `cloud.nd` and `agents.nd` —
**`.nd`, not `.md`** — three times on the short video, where captions and turbo both produced zero.
On that one point the bigger model is strictly worse.

## ⏱️ and it costs 3× the time

| | audio | turbo | large-v3 | slowdown |
| --- | --- | --- | --- | --- |
| bytemonk | 395s | **15s** (26× realtime) | **43s** (9.2× realtime) | 2.9× |
| theo | 3,075s | **123s** (25× realtime) | **403s** (7.6× realtime) | 3.3× |

A 51-minute talk goes from two minutes to nearly seven, and buys nothing.

## what this settles

The theory in round 1 — «turbo is the pruned decoder and pruning is what hurts rare words» —
**is falsified.** The undistilled model fails the same way, on the same words, at a third of the
speed. The failure is not the model's size. Whisper simply does not know these identifiers exist,
and nothing but telling it fixes that.

So the round-1 conclusion stands and is now stronger:

- **The vocabulary prompt is mandatory, not an optimisation.** It is the only lever that has ever
  moved this number, and it moved it from 0% to 53% — past captions' 28%.
- **If the tier is built, build it on turbo.** Half the disk, a third of the runtime, identical
  accuracy. There is no argument left for the big model.
- The burden the round-2 test hoped to avoid — maintaining a vocabulary list — **cannot be
  avoided.** It is the price of the tier. Worth knowing before building, not after.

## 💾 disk — what to delete, by outcome

Currently stored, **4.72 GB total**:

```
.models/ggml-large-v3-turbo.bin   1,624,555,275 bytes   (1.62 GB)
.models/ggml-large-v3.bin         3,095,033,483 bytes   (3.10 GB)
```

- **Delete `ggml-large-v3.bin` now, either way.** This round proved it is strictly worse than turbo
  — slower, no more accurate, and with an extra failure mode. Nothing will want it again. That is
  **3.10 GB back immediately.**
- **If the tier gets built** → keep `ggml-large-v3-turbo.bin` (1.62 GB). It is the one to build on.
- **If the tier is dropped** → delete both and the whole `.models/` directory. 4.72 GB back, and
  nothing else on this machine uses them.

```sh
rm ~/.claude/shelf/yt-transcripts/.models/ggml-large-v3.bin          # always safe
rm -rf ~/.claude/shelf/yt-transcripts/.models                        # only if the tier is dropped
```

## housekeeping, round 2

- ✅ **The two DOT-73 transcripts are still untouched** — md5 re-checked after this round:
  `5a26a3d4cde040f058e5dbe081ca37e3` and `eba71d9a3acf75a1f281eb9210cda8d1`, unchanged.
- ✅ All `audio.wav` deleted. The lab holds text only.
  📌 A `rm` in my run script silently did nothing because zsh aborts a command when a glob matches
  nothing — `audio_raw.wav` was already gone, so `audio.wav` survived too. Caught it by listing
  rather than trusting the exit code, and removed them by hand. Same lesson as the `ls`-not-exit-code
  rule already in the skill.
- ✅ **I built nothing**, as instructed.
- 📌 The per-video `player_client` finding got worse: `bytemonk` needed `web_safari` at 22:06 and
  **`mweb` at 22:20**. So the working client is unstable **over time**, not merely per video. Any
  audio path must try a list on every run and must not cache the winner.

---

# ➡️ round 3 lives in a sibling doc

The question outgrew this title. Round 3 asked «is there a better model in 2026» and answered
**no — the problem was never the model**. A metadata-driven repair pass scores **100%** on the
same census, against this doc's best result of 53%, with no model and no disk cost.

📌 It also revises round 2's conclusion that the vocabulary list is an unavoidable burden: the
list is real, but it harvests itself from the video's own metadata.

See `docs/research/asr-for-technical-talks.md`.
