---
name: guide-code
description: Core values binding on ALL code — load EVERY time you write, edit, or review code in any language, before the language-specific guides. Less is better.
---

# Code Guide

The values every language shares. Language-specific rules live in `guide-typescript`,
`guide-react`, and their siblings — those refine, these govern.

## Less is better

The best version of a change is the one that leaves the least behind. Volume is not
progress; a diff that removes more than it adds is usually the stronger one.

Reach for, in order:

1. **Delete it.** The code that isn't there needs no tests, no docs, no maintenance,
   and cannot break.
2. **Derive it.** A fact computed from something that already exists cannot drift from
   it. A list somebody maintains by hand always will.
3. **Inline it.** One obvious place beats an abstraction used twice.
4. **Then write it** — the smallest thing that does the job.

Applies to everything countable: files, dependencies, options, verbs, layers, config
keys, branches, lines.

**Before adding, ask what it removes.** A change that only adds needs a reason a
subtraction couldn't cover.

Specific calls this decides:

- A rare operation gets a documented one-liner, not a command.
- A wrapper that only forwards arguments gets deleted, not renamed.
- Dead code goes on sight, whether or not it's related to the task.
- A config option is a decision you failed to make — pick the default, delete the knob.
- Two ways to do one thing means one of them is wrong; find out which.

**Less is not fewer characters.** Terse names, collapsed conditionals, and clever
one-liners spend the reader's attention to save your keystrokes — that's more, not
less. What you are minimising is what a reader has to hold in their head.

**Completion criterion:** code work is done when the diff was walked against the ladder —
what got deleted, derived, or inlined before anything was written — and a change that only
adds names the reason a subtraction couldn't cover. One sentence in the report, not a section.
