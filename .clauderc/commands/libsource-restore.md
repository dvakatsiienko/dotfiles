---
description: restore missing libsource files
argument-hint: [lib-name]
---

## libsource-restore command function

This command restores missing libsource files by fetching them from their registered URLs. Essential for cache-based libsource architecture.

### Usage

`/libsource-restore [lib-name]`  - Restore specific missing library
`/libsource-restore`             - Restore all missing libraries

### Function

When you run `/libsource-restore`, I will:

1. **Execute restore script** - Run `python3 ~/.dotfiles/.clauderc/scripts/libsource-restore.py [lib-name]`
2. **Check missing files** - Identify which libsource files are missing from local cache
3. **Show restoration plan** - Display what will be downloaded and total size
4. **Confirm operation** - Ask for user confirmation before bulk downloads
5. **Fetch missing files** - Download using gitingest with same settings as original
6. **Update metadata** - Refresh file size, LOC, and timestamps in config

### Cache-Based Architecture

The libsource system treats `.txt` files as regenerable cache:

- **Config tracking** - `.libsource-config.json` maintains library registry with URLs
- **Local cache** - `libsource-*.txt` files are working copies (not git-tracked)
- **Auto-recovery** - Missing files automatically fetched when needed
- **Fresh clones** - New repo clones need restore to populate cache

### When to Use

#### Post-Clone Setup
```
git clone repo
cd repo
/libsource-restore    # Populates entire libsource cache
```

#### Selective Restoration
```
/libsource-restore react    # Restore only React libsource
/libsource-restore vite     # Restore only Vite libsource
```

#### Cache Verification
```
/libsource-list --verify    # Check what's missing
/libsource-restore          # Restore all missing files
```

### Auto-Recovery Integration

Other libsource commands automatically trigger restoration:

- **`/libsource-read`** - Auto-fetches if file missing before analysis
- **`/libsource-update`** - Ensures files exist before updating
- **`/libsource-list`** - Shows file status with missing indicators

### Example Output

**Single Library Restoration:**
```
🔍 Checking react libsource...
📥 Fetching react source from https://github.com/facebook/react...
✅ Successfully fetched react! (16.6 MB)
✅ react libsource is ready!
```

**Bulk Restoration:**
```
🔍 Found 3 missing libsource files out of 11 total
  📥 react (16.6MB) from https://github.com/facebook/react
  📥 webpack (8.6MB) from https://github.com/webpack/webpack
  📥 vite (3.6MB) from https://github.com/vitejs/vite

📊 Total download size: 28.8MB

🔄 Restore 3 missing libsource files? (Y/n): y

[1/3] Restoring react...
✅ Successfully fetched react! (16.6 MB)

[2/3] Restoring webpack...
✅ Successfully fetched webpack! (8.6 MB)

[3/3] Restoring vite...
✅ Successfully fetched vite! (3.6 MB)

🎉 Successfully restored all 3 missing libsource files!
```

### Benefits

- **Lightweight repos** - No large files tracked in git
- **Always fresh** - Restored files use latest gitingest extraction
- **Selective caching** - Only download what you need
- **Network resilient** - Graceful fallbacks and error handling
- **Transparent operation** - Seamlessly integrates with existing workflows

### Performance Notes

- **Parallel safe** - Multiple restore operations don't conflict
- **Incremental** - Only downloads actually missing files
- **Size-aware** - Shows download size before confirmation
- **Progress tracking** - Clear progress indicators for bulk operations

This command enables the cache-based libsource architecture, making dotfiles repositories lightweight while maintaining full functionality through on-demand file restoration.