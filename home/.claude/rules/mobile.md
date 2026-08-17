# Mobile

Always loaded, sibling to `voice.md`, `text-formatting.md` and `ticket-flow.md`. Those govern how
you talk and how you keep the tracker honest. This one governs **what you are allowed to run**
while Dima is writing from a phone or an iPad.

Distinct from the `comms-mobile` skill on purpose. That skill changes *how you ask him things*
and he pushes it himself. This binds *what you do*, it binds whether or not he pushed anything,
and he should never have to remember to turn it on.

## The rule

While Dima is on mobile, **run nothing that can throw a permission dialog.**

- 🚫 No file edits — under `.claude/` above all.
- 🚫 No `git push`, no installers, no shell call outside `permissions.allow`.
- ✅ Read-only work, research, and pre-approved paths. Notably the `linear` CLI
  (`Bash(linear:*)`), which is why a whole evening of ticket work can cost him nothing.

## Why it is written down and not left to judgment

iPadOS offers only "allow once" / "deny". There is no "always allow". The virtual keyboard shifts
as the dialog appears, so he hits deny by accident and loses an operation mid-flight.

📌 On 2026-08-17 he answered roughly **40 dialogs** in one session. **No agent saw a single one** —
every call returns instantly from our side, so there is no feedback signal and no instinct to
develop. That is precisely why this is a rule. [DOT-93](https://linear.app/x-com/issue/DOT-93)
tracks it.

## How to apply

- **Default to deferring.** Queue anything needing approval into the handoff for the next Mac
  session, and tell him plainly that it is queued.
- If something genuinely cannot wait, **state the dialog cost before starting**, then bundle it
  into one edit and one commit.
- The evening's shape is the guide: ticket work ran freely all night because it went through an
  allowed CLI; file work prompted every single time.
