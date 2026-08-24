# comms-casing — golden prompt

Ticket: DOT-66

dima's own words, stitched from DOT-66 and the thread that followed on 2026-08-16.
verbatim, typos kept. this is the source of intent for `home/.claude/rules/fleet-output-format.md`;
when the rule and this file disagree, this file is right and the rule is wrong.

the skill this describes was retired on 2026-08-16 — a skill had to be remembered and loaded,
so it was missed. it is now an always-loaded rule file instead.

## from DOT-66 (ticket body)

> across all communication channels. evertwhetere. docs, prompts, messaging. (but only for
> casual messaging). Applyjob letters and similar are standard writing casing).
>
> start now and continue until told to stop. fix in place mostly unless it risks to break
> something.
>
> but you need to grill me because it may be very tricky. before grilling:
>
> * create this general comms rule.
> * only ours docs lowercased if we contribute we align with project choice.
>
> and literally write in skill "(claude-important) this skills are still in being
> developed. while using this skill, pay attention to casing related issues. and suggests
> smart tunings to make a skill pretty (claude-important)" so you would know to actiovely
> edit it to polish it fast.
>
> The quality of this skill effects output at scale so must be taken care of properly.
>
> User is allowed to sent you uppercased messages occasionally. Because he also types you
> from a mobdevices and there, each new sentence first word would produce its fist letter
> Capitalized. It's hard to lowercase here (bad ux dx). Btw do you know it typing on iOS
> cloud be lowercased and uppercase opt in via shift?
>
> the lowercased text reads better. lower the eye strain. when a text is like aline, flows.
> with no unnecessarily disturbing bumps such as a Capital letter. at level of perception -
> this is how this skill makes text to read better(visual lvl). users preference. always
> turned on our side. togglable by you easily.

## on scope

> This rule only for our pet projects (everything in projects dir st least).
>
> When opening any external project this skill ideally not even loads.

## on how to ask him things

> Note I type on iPad. It is very slow to type here. I literally write a message for whole
> 2 min at least. Ask me questions that I can answer ina few words. Or y n.

## on rollout

> Let's start from messages. We will definitely break content. Only lowercase your
> responses. Except like var names, and others. Keep listening evergreen.
>
> You or me will find flaws. And fix them then expand to readme.md rewrite them lowercase.
> Then expand more etc. gradual adoption. Message lowercasing message is less error effect
> heavy so let's fine tune it before expansion.

## what he asked for and got

- the `(claude-important)` line, verbatim in intent, compressed to one line at his request
  ("You may zip Claude important part").
- a grilling round before anything ships.
- `case-bench`, an interactive tester for the four open rules:
  https://claude.ai/code/artifact/9d4e69e9-b8d1-4f89-ad8a-039cb83799ed
