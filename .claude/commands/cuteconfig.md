---
description: update CLAUDE.md configuration files with specified changes
argument-hint: scope, prompt
---

**Syntax**: `/cuteconfig [arguments]`

## Behavior

- **Default scope**: Updates project-level CLAUDE.md in current working directory
- **Root scope**: Use `/cuteconfig root [arguments]` to update root/user-level CLAUDE.md

## Examples

```
/cuteconfig sync feature X           → Investigate feature X and update project CLAUDE.md
/cuteconfig add build tool webpack   → Document webpack integration in project config
/cuteconfig root always use 😅 emoji → Update root config with emoji requirement
/cuteconfig root prefer vitest       → Update root config testing preference
```

## Scope Rules

- Commands without `root` prefix update the project-level CLAUDE.md in current directory
- Commands with `root` prefix update the root user-level CLAUDE.md (this file)
- Follows the Working Directory Context Rules defined in maintenance policy

## Implementation

1. Parse command for `root` prefix to determine scope
2. Apply Working Directory Context Rules for target file selection
3. Investigate specified feature/change if needed
4. Update appropriate CLAUDE.md file with relevant documentation
5. Follow maintenance policy guidelines for content quality and necessity

## Context Integration

This command integrates with the CLAUDE.md maintenance system by:

- Respecting the Working Directory Context Rules
- Following the established maintenance policy principles
- Only adding necessary information to avoid over-documentation
- Maintaining separation between root and project-level configurations

## Usage Notes

- Always check current working directory to determine correct scope
- Use `root` prefix explicitly when updating global configuration
- Investigate features thoroughly before documenting changes
- Remove outdated information when updating configurations
