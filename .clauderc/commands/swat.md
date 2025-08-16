---
description: initiate 🦅 S.W.A.T. protocol
model: sonnet
---

this command is intended to pefrorm an issue elimination operation.

## briefing

1. given an instruction, call @swat agent to:

- identify root cause of an issue
- gather relevant information, and print summary about it following this agent's instruction
- present info to me and ask for permission to move to next step

2. analyze the info @stat agent gathered and decide if @itel agent is needed to perform an additional research

- if so, execute @itel agent and lookup necessary info
  - when done, print @intel result summary and ask permission to procesd
- if not, identify issue complexity and decide of @architect input is required
- if issue is too complext ask @architect to invent an architectural solution
  - when done, print @architect result summary and ask permission to procesd
- if issue is resoanably simple to fix, execute @engineer right away

## notes

- before passing summary from one agent to another, always
  - print agent result summary
  - ask for a permission to advance
