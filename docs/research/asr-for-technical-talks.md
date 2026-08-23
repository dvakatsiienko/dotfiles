---
researched: 2026-08-23
sources-current-as-of: 2026-08-23
refresh-when: a local ASR model ships native keyterm biasing on Apple Silicon, or the yt-transcript identifier repair pass is built and needs re-scoring
ticket: DOT-211
---

# DOT-211 round 3 — is there a better ASR model? No. The problem was never the model.

Sibling to `whisper-vs-youtube-captions.md`, which holds rounds 1 and 2. That doc asks
«whisper or captions». This one asks the question the brief actually posed: **as of 2026, is
there a better ASR model for technical talks full of code identifiers — and can the vocabulary
list stop being a permanent maintenance burden?**

Run 2026-08-23 · opus 5 · M4 Pro. Every claim below is tagged **[measured]** or **[read]**.

---

# 🎯 The verdict

**Do not swap the ASR model. Add a repair pass after it, driven by the video's own metadata.**

**[measured]** On the same two videos and the same census as rounds 1 and 2:

| `CLAUDE.md` spelled right | score |
| --- | --- |
| youtube captions, raw | **5 of 18 — 28%** |
| whisper turbo, unprimed | 0 of 17 — 0% |
| whisper large-v3, unprimed | 0 of 15 — 0% |
| whisper turbo + hand-written prompt | 10 of 19 — 53% |
| 🥇 **captions + metadata repair pass** | **18 of 18 — 100%** |

The winner uses **no ASR model at all**. It costs **0 bytes of disk**, **2.8 ms of runtime**
on a 51-minute transcript, and **zero maintenance** — the vocabulary comes from the video.

📌 My 28% reproduces round 1's 28% exactly, on an independently re-fetched caption file. That
is the cross-check that says my census is counting the same thing rounds 1 and 2 counted.

---

## Why this works — the observation the earlier rounds missed

Whisper's failures are not random noise. They are **near-misses on a small, knowable set of
names**: `ClaudeMD`, `CloudMD`, `AgentMD`, `AgentsMD`, `ReadMeMD`. The captions fail the same
way — `Claude MD`, `cloud.md`, `agents MD`.

Every one of those is within **edit distance 2** of the right answer, once you strip spaces,
dots and case. They are not unrecoverable; they were simply never repaired.

And the right answers are **already sitting in the video's metadata**, free, from the same
`yt-dlp` call that fetches the captions. **[measured]**

| video | filenames found in title + description + chapters + tags |
| --- | --- |
| theo `e1snsuY4lTI` | `AGENTS.md`, `SKILLS.md`, `CLAUDE.md` |
| bytemonk `PXzHKuBuyJU` | `CLAUDE.md` |

That is the whole vocabulary list round 1 wrote by hand. **The video ships it.**

---

## The pass, in three steps

1. **Harvest** — regex filename-shaped tokens out of `title`, `description`, `chapters[].title`
   and `tags` in `yt-dlp`'s `--write-info-json`. Union with a small fixed core list.
2. **Find candidates** — a tight regex over the transcript for identifier-shaped spans only.
   The regex is the safety gate: nothing without a trailing `md` / `m.d.` is ever a candidate.
3. **Repair** — normalise the span (lowercase, drop non-alphanumerics), take the nearest
   vocabulary entry by edit distance, and accept it only if distance ≤ 2 **and** the
   runner-up is at least 2 further away. That uniqueness guard is what stops guessing.

Reference implementation, exactly as scored:

```python
CORE = {'README.md','AGENTS.md','CLAUDE.md','SKILLS.md','package.json','tsconfig.json'}
CAND = re.compile(r"\b(?:claude|cloud|clod|agents?|skills?|read ?me|readme)(?:'s)?"
                  r"[ .\-]{0,2}(?:md|m\.d\.)\b", re.I)

def repair(m, canon):                       # canon = {normalised: canonical}
    d = sorted((lev(norm(m.group(0)), k), k) for k in canon)
    ok = d[0][0] <= 2 and (len(d) == 1 or d[1][0] >= d[0][0] + 2)
    return canon[d[0][1]] if ok else m.group(0)
```

### The core list is small, static, and earns its place

**[measured]** Metadata alone scores **34 of 36 — 94%** on the wider census (`CLAUDE.md`,
`AGENTS.md` and `SKILLS.md` attempts together). The two misses are `read me MD` on theo's video
and `agents.md` on bytemonk's — both names the speaker used but never wrote down.

Adding six always-on entries takes it to **36 of 36 — 100%**. Six lines, never edited per video.
That is the residual maintenance cost, and it is not a burden.

### It repairs whisper's output too, not only captions

**[measured]** Fed the glued forms rounds 1 and 2 recorded verbatim, with the core list only:

| input | result |
| --- | --- |
| `ClaudeMD` `AgentsMD` `ReadMeMD` `agent's MD` `claude MD` | ✅ exact hit, distance 0 |
| `AgentMD` `agents.nd` | ✅ repaired, distance 1 |
| `CloudMD` | ✅ repaired, distance 2 |
| `cloud.nd` | 🚫 **not repaired** — distance 3, two errors in one word |

**8 of 9.** The one failure is `large-v3`'s invented `.nd`, which is exactly the model round 2
already ruled out. So this pass sits cleanly on top of any tier — captions, turbo, or turbo+prompt.

---

## 🚫 What it does not fix, honestly

- **[measured]** `cloud.nd`-class double errors. Distance 3 is past the threshold, and raising
  the threshold is how you start rewriting real words.
- **[read, not measured]** Ordinary words used technically — round 1's `failing`/`trailing`,
  `nodes`/`notes`, `rights`/`writes`. Those are not identifiers, so no identifier repair reaches
  them. Nothing found in this round changes that, and no model tested so far fixes it either.
- **[measured]** Terms the video never names in its metadata *and* that are not core —
  `pnpm dev`, `bun dev`, `T3 Chat`. Extending the candidate regex past `.md` filenames would
  cover more, and would also widen the false-positive surface. Not attempted.
- **[measured]** False-positive probe: `clouds`, `cloud storage`, `Cloudflare`, `WebMD`, `MDN`,
  `MDX`, `my MD`, `the md file`, `agenda` — **all left alone**. Bare `Claude` matches the
  vocabulary on distance alone, and is saved only by the candidate regex refusing it. 📌 That
  means the regex is load-bearing security, not a performance shortcut. Do not loosen it.

---

## The model survey — what else exists in 2026

Asked because the brief asked. **None of it beats the repair pass on this workload**, and the
one thing that would help — native keyterm biasing — is exactly what the repair pass provides
for free.

### Ran locally

| candidate | status |
| --- | --- |
| **`parakeet-cli`** | **[measured]** already installed — it ships inside `whisper-cpp 1.9.2`, not as a separate package. 📌 **Its `--help` has no prompt, vocabulary or biasing flag of any kind.** Since rounds 1 and 2 proved unprimed models score 0%, an unprimable model is the wrong direction. Model file not downloaded; size unverified (401 on the ggml repo probe). |

### Read only — not run

- **Qwen3-ASR** (Alibaba, Jan 2026), 0.6B and 1.7B. **[read]** The most interesting near-miss:
  it is trained with a dedicated context-biasing stage, so a term list in the system prompt is a
  first-class feature rather than whisper's `--prompt` hack. `Qwen3-ASR-1.7B` scores 5.76 WER on
  the Open ASR Leaderboard. Runs on a Mac via [antirez/qwen-asr](https://github.com/antirez/qwen-asr),
  pure C — but **no Metal**, BLAS and NEON only, so **8–13× realtime** against turbo's 25×, and
  **~1.7 GiB** for the 0.6B. Practitioners describe the prompt biasing as "very soft".
- **IBM Granite Speech 4.1 2B** — **[read]** 5.33 WER, explicit keyword-list biasing for names
  and jargon. No Apple-Silicon-native runtime found.
- **Leaderboard leaders** — **[read]** `Audio8/ARK-ASR-3B` 4.76 WER, `MOSS-Transcribe-preview-2B`
  4.87, `NVIDIA Canary-Qwen 2.5B` 5.63. The top of the board is now inside one WER point.
  📌 **Aggregate WER is the wrong metric here.** Rounds 1 and 2 measured 96%+ word agreement
  between captions and whisper while the identifier score was 0%. A model a half-point better on
  WER tells you nothing about whether it can spell `CLAUDE.md`.
- **Cloud APIs with native keyterm biasing** — **[read]** Deepgram Nova-3 (keyterm prompting, up
  to 100 terms, merged with acoustic logits at inference), AssemblyAI Universal-3.5 Pro (7.0%
  aggregate WER, best of nine in a July 2026 benchmark), ElevenLabs Scribe v2. All are network
  calls with an API key and a bill, for a job a 2.8 ms local pass now does at 100%.

---

## 💰 Honest cost

| | disk | runtime, 51-min talk | vocabulary list | network |
| --- | --- | --- | --- | --- |
| **captions + repair pass** | **0** | **~2.8 ms** on top of the caption fetch | 6 static entries, rest auto-harvested | captions endpoint only, never 403s |
| turbo + hand prompt | 1.62 GB | ~2 min | hand-written per domain, forever | `yt-dlp -x`, 🚨 403-prone |
| Qwen3-ASR 0.6B | ~1.7 GiB **[read]** | ~4–6 min **[read]** | still needed, softer effect | same 403 exposure |

**The vocabulary list is no longer mandatory in the form round 2 feared.** Round 2's conclusion —
«the burden cannot be avoided» — was right about *models* and wrong about *the pipeline*. The
list still exists; it just writes itself from metadata, plus six lines that never change.

---

## ➡️ What to build

1. **Build the repair pass on the captions tier.** It is the whole win: 28% → 100% **[measured]**,
   no download, no consent prompt, no 403 risk, and it makes the tier that already ships better.
2. **Leave the whisper tier paused.** Nothing found in 2026 beats turbo, and turbo's own gap is
   now closed by step 1 at a fraction of the cost. If the tier is ever resumed, the repair pass
   improves it too — 8 of 9 glued forms **[measured]** — so build it once, apply it to both.
3. **Do not adopt a cloud ASR API.** Their native biasing solves a problem step 1 already solved,
   and adds a key, a bill and a network hop.

📌 Scope honesty: two videos, one domain, one identifier family (`*.md` memfiles). The mechanism
generalises — it is edit distance against harvested names — but the 100% does not. Re-score if it
is pointed at a different kind of vocabulary.

---

## Housekeeping

- ✅ Nothing downloaded. No model fetched, nothing installed, no consent needed.
- ✅ Nothing committed, per the brief. Working tree only.
- ✅ Only `docs/research/` touched.
- ✅ Scratch files (`*.vtt`, `*.info.json`, flattened transcripts) live in this job's tmp dir and
  die with it. The DOT-73 transcript shelf was never opened.
- 📌 `yt-dlp` metadata and captions worked on `android` and `mweb` clients; `web`, `web_safari`,
  `tv` and `ios` all failed on the theo video today. 🚨 That is a **third** distinct working-client
  set on this video in two days — confirming round 2's finding that the client list is unstable
  over time and must never be cached.

## Sources

- [Best Open Speech Recognition (ASR) Models in 2026 — MarkTechPost](https://www.marktechpost.com/2026/07/23/best-open-speech-recognition-asr-models-in-2026-wer-languages-latency-and-license-compared/)
- [Open ASR Leaderboard: Trends and Insights — Hugging Face](https://huggingface.co/blog/open-asr-leaderboard)
- [Qwen3-ASR Technical Report — arXiv](https://arxiv.org/html/2601.21337v1)
- [antirez/qwen-asr — C inference for Qwen3-ASR](https://github.com/antirez/qwen-asr)
- [ibm-granite/granite-speech-4.1-2b-plus — Hugging Face](https://huggingface.co/ibm-granite/granite-speech-4.1-2b-plus)
- [Deepgram Nova-3 keyterm prompting](https://deepgram.com/learn/deepgram-expands-nova-3-with-10-new-languages-and-multilingual-keyterm-prompting)
- [AssemblyAI vs Deepgram accuracy comparison](https://www.assemblyai.com/blog/assemblyai-vs-deepgram)
