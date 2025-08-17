---
description: update libsource files
argument-hint: [lib-name]
---

## libsource-update command function

This command updates libsource files by re-fetching fresh repository snapshots (remote or local) and refreshing metadata.

### Usage

`/libsource-update [lib-name]`  - Update specific library
`/libsource-update`             - Update all registered libraries

### Function

When you run `/libsource-update mobx`, I will:

1. **Execute update script** - Run `python3 ~/.dotfiles/.clauderc/scripts/libsource-update.py [lib-name]`
2. **Monitor the process** - Track the update and change detection
3. **Identify changed libraries** - Note which libraries had actual content changes
4. **Perform quality re-evaluation** - Automatically analyze and rate only libraries that actually changed

### What the script does

- **Re-fetch repository data** - Use gitingest tool to get latest repository snapshot (GitHub or local)
- **Validate source paths** - Check if stored paths/URLs are still valid and accessible
- **Update libsource file** - Replace with fresh content using same gitingest settings
- **Refresh metadata** - Update file size, LOC, and timestamp in `.libsource-config.json`
- **Reset quality ratings** - Set quality to `null` for all updated libraries (requires re-evaluation)
- **Detect changes** - Compare old vs new metrics to identify actual content changes

### Source Path Handling

The script supports both source types:
- **GitHub URLs** - Re-downloads latest repository snapshot from remote
- **Local paths** - Re-processes current local repository state
- **Path validation** - Verifies local paths still exist before updating
- **Error handling** - Reports invalid or missing sources clearly

### Change Detection

The script tracks which libraries actually changed:
- **File size differences** - New vs old byte count
- **LOC differences** - New vs old line count
- **Content unchanged** - Same metrics but still resets quality rating

### Post-Update Workflow

After the script completes, I will:
- Identify libraries that had actual changes
- Automatically perform quality analysis for changed libraries only
- Update config file with new quality ratings
- Skip re-evaluation for unchanged libraries (preserves existing quality ratings)

### Batch Updates

When run without arguments:
- Updates all registered libraries sequentially
- Shows progress counter `[2/11]` for each library
- Reports summary of total updated vs changed libraries
- Provides targeted re-evaluation suggestions

### Example Output

**Remote repository update:**
```
🔄 Updating mobx source from https://github.com/mobxjs/mobx...
✅ Successfully updated mobx source!
📊 File size: 1,996,581 bytes (1.9 MB)
📈 Changes detected:
   📊 Size: 1,950,000 → 1,996,581 bytes (+46,581)
   📏 LOC: 67,500 → 68,000 lines (+500)
   ⭐ Quality: 85% → reset to null (needs re-evaluation)
```

**Local repository update:**
```
🔄 Updating next-local source from local path: /Users/dima/projects/next.js...
✅ Successfully updated next-local source!
📊 File size: 8,245,123 bytes (7.9 MB)
📈 Changes detected:
   📊 Size: 8,100,000 → 8,245,123 bytes (+145,123)
   📏 LOC: 280,000 → 285,500 lines (+5,500)
   ⭐ Quality: null → reset to null (needs re-evaluation)
```

**Post-update quality analysis:**
```
📊 Performing automatic quality analysis for changed libraries...
🎯 Overall Score: 87% (Very Good)
✅ Quality rating updated in config
```

This command ensures your libsource collection stays current with upstream changes while maintaining
quality assessment accuracy through systematic re-evaluation.
