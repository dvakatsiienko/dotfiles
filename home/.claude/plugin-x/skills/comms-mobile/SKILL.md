---
name: comms-mobile
description: Mobile mode — Dima is typing on a phone keyboard, so ask for the least input possible. USER-INVOKED ONLY (/x:comms-mobile). Never load this on your own, never infer it from context, never suggest it.
intended-models: fable, opus
argument-hint: "[off]"
---

# Mobile mode

Dima is on a virtual keyboard. Every character he types is expensive. Typing one prompt
there costs him minutes.

`off` in `$ARGUMENTS` → mode ends, normal behaviour resumes. Say `📱 mobile mode off` and stop.
Otherwise mode is **on for the rest of the conversation**, and he can end it any time by
saying so in plain words.

Confirm with `📱 mobile mode on` and one line: what you need from him next.

## What changes — how you ask

- Ask so the answer is **`y` / `n`**. That is the target shape for every question.
- If y/n cannot carry it, offer **two named options**, answerable by one word: `a` or `b`.
- **One question per turn.** Never a round of three.
- Never ask him to type a path, a name, or a sentence you can derive, guess, or look up.
  Guess, state the guess, ask `y?`.
- Prefer acting on the safe default and reporting it over asking. Ask only when a wrong
  guess costs real work.
- Reading a one-word answer literally is correct. `y` means go. Silence on an option
  means your ➡️ recommendation, same as always.

📌 This skill covers how you *ask*. What you may *run* on mobile is `rules/mobile.md`, which is
always loaded and binds whether or not this skill was pushed.

## Count the dialogs before you start

Every tool call that needs approval is a dialog he must hit, and **you never see one** — each call
returns instantly from your side, so there is no signal you are burying him. On 2026-08-17 that
cost him ~40 dialogs across four tasks and nobody noticed until he said so.

So before starting any queue of work:

1. **Count** the approval-needing calls it implies. Edits, pushes, installers, anything outside
   `permissions.allow`.
2. **Say the number first**, in one line, before the first call.
3. Offer two ways: **batch** it into one edit + one commit, or **defer** it to the Mac.
   ➡️ Recommend defer whenever the work can wait.

While working: **one edit and one commit per task**, not fifteen calls. Group the file writes,
commit once. If a task genuinely needs several edits, say so when you state the count.

DOT-94.

## Where it sits

This is a **voice layer**, pushed on top of whatever is already applied — normally `eli5`.
Everything below it stays in effect, and it wins any point it disagrees with them on, because
it went on last. The rule lives in the voice-stack section of `rules/voice.md`.

The floor is the exception and is never in the contest: `identity.md`, the shape rules, and
`text-formatting.md` hold whatever is stacked above them.

One thing to keep in mind on top of them: he is reading on a small screen. Answer the
question. Do not hand him a field guide to the whole subject.
