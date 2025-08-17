---
description: update libsource files
argument-hint: [lib-name]
---

## 1. libsource-update command function

This command prompts with an instruction to update libsource files in the collection.

### Usage

`/libsource-update [lib-name]`

### Function

When you run `/libsource-update mobx`, I will:

1. **Check current libsource** - Examine existing `libsource-[lib-name].txt` file
2. **Fetch fresh repository data** - Use gitingest tool to get latest repository snapshot
3. **Compare versions** - Analyze differences between current and new versions
4. **Update libsource file** - Replace with updated content
5. **Update config** - Refresh metadata in `.libsource-config.json` including:
    - Last updated timestamp
    - File size and LOC estimates
    - Quality score if changed significantly
6. **Update CLAUDE.md** - Sync any significant changes to library metrics

### What gets updated

- Repository content (latest commit)
- File structure and directory listings
- Source code snippets and documentation
- Configuration files and build scripts
- Package metadata and dependencies

### Maintenance

This command helps keep your libsource collection current with upstream changes, ensuring you have
access to the latest patterns, APIs, and implementation approaches from the source libraries.
