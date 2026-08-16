---
name: comms-mobile
description: Mobile mode — Dima is typing on a phone keyboard, so ask for the least input possible. USER-INVOKED ONLY (/x:comms-mobile). Never load this on your own, never infer it from context, never suggest it.
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

## What does not change

Your reply *style* is set in `rules/voice.md` and `rules/text-formatting.md`. Those files
win. Do not restyle, do not shorten below what they ask for.

One thing to keep in mind on top of them: he is reading on a small screen. Answer the
question. Do not hand him a field guide to the whole subject.
