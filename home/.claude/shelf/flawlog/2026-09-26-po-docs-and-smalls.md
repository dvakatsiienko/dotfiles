# 2026-09-26 · po-docs-and-smalls · run cc·20260925·diorama

- zsh `echo ====` separator aborted a chained probe again (4th sighting; method-silent-failures names it) · one retry · lesson: the attention fix failed 4×; a PreToolUse Bash hook that flags an unquoted word starting with `=` is the mechanical fix
- good find: cc 2.1.283 ships a built-in `verify` skill (user-invocable `/verify`, model invocation behind a gate, so it never shows in the skill list) that bootstraps a project `.claude/skills/verify/SKILL.md`; the pr-prep nudge asks for it before commits · a capability we held unseen — probe the binary at cc bumps for gated skills
