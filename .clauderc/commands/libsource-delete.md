---
description: remove library from libsource collection
argument-hint: [lib-name] [--force]
---

## libsource-delete command function

This command removes a library from the libsource collection, deleting both the cached file and configuration entry.

### Usage

`/libsource-delete [lib-name]`         - Interactive deletion with confirmation
`/libsource-delete [lib-name] --force` - Skip confirmation prompt

### Function

When you run `/libsource-delete react`, I will:

1. **Execute delete script** - Run `python3 ~/.dotfiles/.clauderc/scripts/libsource-delete.py [lib-name]`
2. **Show library details** - Display URL, file location, and last update date
3. **Confirm deletion** - Ask for user confirmation (unless --force or non-interactive)
4. **Remove files** - Delete the `libsource-[lib-name].txt` file from cache
5. **Update config** - Remove library entry from `.libsource-config.json`

### Smart Confirmation

The script automatically detects the execution context:

- **Interactive terminal**: Shows confirmation prompt
- **Non-interactive mode**: Auto-confirms (when called programmatically)
- **Force flag**: Skips confirmation entirely (`--force`)

### Examples

#### Interactive Deletion
```
/libsource-delete vue
📚 Found library: vue
   🔗 URL: https://github.com/vuejs/core
   📁 File: libsource-vue.txt
   📅 Last updated: 2025-08-17

⚠️  Are you sure you want to delete 'vue'? (y/N): y
🗑️  Deleted file: /Users/user/.claude/.membank/libsource/libsource-vue.txt
📝 Updated config: removed 'vue' entry
✅ Successfully deleted library 'vue'!
📊 Remaining libraries: 11
```

#### Forced Deletion
```
/libsource-delete vue --force
📚 Found library: vue
   🔗 URL: https://github.com/vuejs/core
   📁 File: libsource-vue.txt
   📅 Last updated: 2025-08-17

🗑️  Deleted file: /Users/user/.claude/.membank/libsource/libsource-vue.txt
📝 Updated config: removed 'vue' entry
✅ Successfully deleted library 'vue'!
📊 Remaining libraries: 11
```

#### Programmatic Deletion
```
/libsource-delete vue
📚 Found library: vue
   🔗 URL: https://github.com/vuejs/core
   📁 File: libsource-vue.txt
   📅 Last updated: 2025-08-17
🤖 Non-interactive mode detected, auto-confirming deletion...
🗑️  Deleted file: /Users/user/.claude/.membank/libsource/libsource-vue.txt
📝 Updated config: removed 'vue' entry
✅ Successfully deleted library 'vue'!
📊 Remaining libraries: 11
```

### Safety Features

- **Library validation**: Confirms library exists before attempting deletion
- **File safety**: Handles missing files gracefully (shows warning, continues)
- **Config backup**: Updates configuration atomically
- **Error handling**: Graceful handling of file permission errors
- **Cancellation**: Easy to cancel with 'n' or Ctrl+C

### Use Cases

#### Cleanup Operations
- Remove outdated or unused libraries
- Clean up test entries
- Free up disk space

#### Library Management
- Remove libraries before re-adding with different settings
- Clean up duplicate entries
- Maintain collection hygiene

#### Automation
- Programmatic cleanup scripts
- Batch operations with `--force`
- CI/CD integration

### Integration

Works seamlessly with other libsource commands:

- **After deletion**: Use `/libsource-list` to verify removal
- **Re-adding**: Use `/libsource-add` to add library back
- **Verification**: Use `/libsource-list --verify` to check collection integrity

This command ensures clean removal of libraries from the libsource collection while maintaining data integrity and providing appropriate user feedback.