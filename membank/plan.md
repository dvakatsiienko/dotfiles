# Membank Migration Plan

## Overview
Migrate from scattered libsource system to unified membank architecture with zero downtime and safe rollback capability.

**Key Principles:**
- Seamless transition with -old suffix for existing system
- Full backwards compatibility during migration
- Test-driven migration with validation at each phase
- Modular documentation approach

## Phase 1: Infrastructure Setup
*Goal: Create membank skeleton without disrupting current system*

### 1.1 Create Directory Structure
- [ ] Create `membank/libsource/` directory
- [ ] Create `membank/libsource/core/` for Python CRUD scripts  
- [ ] Create `membank/libsource/sources/` for .txt files
- [ ] Create `membank/cli/` for search.py and server.py
- [ ] Create `membank/rag/` for RAG modules
- [ ] Create `membank/scripts/` for utility scripts
- [ ] Create `membank/config/` for configuration files

### 1.2 Initialize Core Files
- [ ] Create empty `membank/membank.db` (SQLite)
- [ ] Create `membank/.gitignore` with appropriate exclusions
- [ ] Create `membank/README.md` with quick start guide

## Phase 2: Safe Renaming of Current System
*Goal: Mark old system clearly for easy identification and later removal*

### 2.1 Rename Databases and Update Ports
- [ ] Stop RAG server on port 1408
- [ ] Rename `.clauderc/.membank/libsource-scripts/data/libsources.db` → `libsources-old.db`
- [ ] Update old server.py to use `libsources-old.db` and run on port 1409
- [ ] Start old server on port 1409 (keeping it as backup)
- [ ] Keep port 1408 free for new membank server

### 2.2 Mark Old Directories
- [ ] Rename `.clauderc/.membank/libsource/` → `.clauderc/.membank/libsource-old/`
- [ ] Rename `.clauderc/.membank/libsource-scripts/` → `.clauderc/.membank/libsource-scripts-old/`
- [ ] Update all package.json script paths to use -old directories

### 2.3 Rename Configuration
- [ ] Rename `.libsource-config.json` → `.libsource-config-old.json`
- [ ] Update Python scripts to use renamed config file

## Phase 3: Copy and Adapt Components
*Goal: Populate membank with adapted versions of existing components*

### 3.1 Migrate Core Scripts
- [ ] Copy `libsource_add.py` → `membank/libsource/core/add.py`
- [ ] Copy `libsource_list.py` → `membank/libsource/core/list.py`
- [ ] Copy `libsource_update.py` → `membank/libsource/core/update.py`
- [ ] Copy `libsource_delete.py` → `membank/libsource/core/delete.py`
- [ ] Copy `libsource_restore.py` → `membank/libsource/core/restore.py`
- [ ] Copy `libsource_utils.py` → `membank/libsource/core/utils.py`
- [ ] Create `membank/libsource/core/__init__.py`

### 3.2 Migrate CLI Components
- [ ] Copy `search.py` → `membank/cli/search.py`
- [ ] Copy `server.py` → `membank/cli/server.py`

### 3.3 Migrate RAG Modules
- [ ] Copy entire RAG module structure to `membank/rag/`
- [ ] Maintain: chunker.py, processor.py, tagger.py, indexer.py, search.py, server.py

### 3.4 Migrate Utility Scripts
- [ ] Copy benchmark scripts to `membank/scripts/`
- [ ] Copy test scripts to `membank/scripts/`

## Phase 4: Path Updates and Configuration
*Goal: Update all internal references to use new membank paths*

### 4.1 Update Python Import Paths
- [ ] Update all imports in `membank/libsource/core/*.py`
- [ ] Update all imports in `membank/cli/*.py`
- [ ] Update all imports in `membank/rag/*.py`
- [ ] Fix relative imports to use new structure

### 4.2 Update File Paths
- [ ] Update database path to `membank/membank.db`
- [ ] Update config path to `membank/libsource/.libsource-config.json`
- [ ] Update libsource directory to `membank/libsource/sources/`
- [ ] Update all hardcoded paths in Python scripts

### 4.3 Configuration Migration
- [ ] Copy `.libsource-config-old.json` → `membank/libsource/.libsource-config.json`
- [ ] Update all file paths in config to point to new locations
- [ ] Add version field to track migration state

## Phase 5: Data Migration
*Goal: Copy all libsources and rebuild RAG database*

### 5.1 Copy Libsource Files (Keep Old Intact)
- [ ] Copy all 15 .txt files from libsource-old/ to membank/libsource/sources/
- [ ] Keep original files in libsource-old/ with -old suffix for reference
- [ ] Verify file integrity with checksums
- [ ] Update .libsource-config.json with new paths
- [ ] Note: New libsources will be added iteratively to membank only

### 5.2 Build New RAG Database
- [ ] Initialize empty membank.db with proper schema
- [ ] Run indexer on all libsources to populate membank.db
- [ ] Verify chunk counts match old system
- [ ] Compare search results between old and new databases

## Phase 6: Testing and Validation
*Goal: Ensure complete functionality before cutover*

### 6.1 Unit Testing
- [ ] Test add.py with new libsource
- [ ] Test list.py shows all 15 libsources
- [ ] Test update.py refreshes existing libsource
- [ ] Test delete.py removes libsource and RAG data
- [ ] Test restore.py from backup

### 6.2 Integration Testing
- [ ] Start membank server on port 1408 (new system)
- [ ] Test search API endpoint with various queries
- [ ] Compare results between port 1408 (new) and port 1409 (old)
- [ ] Test all API endpoints (search, search/all, libraries, chunk, stats)
- [ ] Benchmark performance (should be similar or better)

### 6.3 CLI Testing
- [ ] Test `pnpm lib:search` with new backend
- [ ] Test `pnpm lib:server start/stop/status`
- [ ] Test all lib:* commands work correctly

## Phase 7: Package.json Updates
*Goal: Point all scripts to new membank system*

### 7.1 Update Script Paths
- [ ] Update `lib:add` → `membank/libsource/core/add.py`
- [ ] Update `lib:list` → `membank/libsource/core/list.py`
- [ ] Update `lib:update` → `membank/libsource/core/update.py`
- [ ] Update `lib:delete` → `membank/libsource/core/delete.py`
- [ ] Update `lib:restore` → `membank/libsource/core/restore.py`
- [ ] Update `lib:search` → `membank/cli/search.py`
- [ ] Update `lib:server` → `membank/cli/server.py`
- [ ] Update `rag:*` commands to use membank paths

### 7.2 Add Migration Scripts
- [ ] Add `membank:migrate` script for data migration
- [ ] Add `membank:validate` script for validation
- [ ] Add `membank:rollback` script for emergency rollback

## Phase 8: Documentation Update
*Goal: Modular documentation with proper separation of concerns*

### 8.1 Create Membank Documentation
- [ ] Create comprehensive `membank/CLAUDE.md` with:
  - [ ] Architecture overview
  - [ ] API documentation
  - [ ] CLI command reference
  - [ ] Troubleshooting guide
  - [ ] Development guide

### 8.2 Update Root Documentation
- [ ] Remove detailed libsource content from `~/.dotfiles/CLAUDE.md`
- [ ] Add high-level membank reference pointing to `@membank/CLAUDE.md`
- [ ] Keep only essential quick-start info in root

### 8.3 Update Global Documentation
- [ ] Update `~/.claude/CLAUDE.md` to reference membank at port 1408
- [ ] Update priority chain to use "membank" terminology
- [ ] Update API examples with new paths

## Phase 9: Cutover
*Goal: Switch production to membank system*

### 9.1 Verify New System
- [ ] Membank server already running on port 1408 (from testing)
- [ ] Old system still available on port 1409 as fallback
- [ ] Document both ports for reference

### 9.2 Validate Production Port
- [ ] Verify membank on port 1408 fully operational
- [ ] Keep old system on 1409 running as backup
- [ ] Run smoke tests on production port 1408

### 9.3 Monitor and Validate
- [ ] Monitor for errors in first hour
- [ ] Test all major use cases
- [ ] Check performance metrics

## Phase 10: Cleanup
*Goal: Remove old system after confirming stability*

### 10.1 Verification Period (Keep Until Requested)
- [ ] Use system normally until deletion requested
- [ ] Document any issues found
- [ ] Fix any discovered bugs
- [ ] Keep old system on port 1409 as backup

### 10.2 Remove Old System (When Requested)
**All -old marked items for easy identification:**
- [ ] Stop old server on port 1409
- [ ] Delete `.clauderc/.membank/libsource-old/` directory
- [ ] Delete `.clauderc/.membank/libsource-scripts-old/` directory
- [ ] Delete `libsources-old.db` database file
- [ ] Delete all `*-old.txt` libsource files
- [ ] Delete `.libsource-config-old.json` config file
- [ ] Remove -old references from package.json
- [ ] Remove port 1409 references from documentation

### 10.3 Final Cleanup
- [ ] Update .gitignore to exclude new paths
- [ ] Remove any temporary migration scripts
- [ ] Archive migration documentation

## Rollback Plan
*In case of critical issues during migration*

1. **Quick Rollback (< 30 seconds)**
   - Simply switch to port 1409 (old system already running)
   - Update documentation to point to port 1409 temporarily
   - Fix issues with membank on port 1408 without pressure

2. **Data Rollback**
   - Restore from libsources-old.db
   - Re-index if necessary
   - Verify all libsources accessible

3. **Configuration Rollback**
   - Restore .libsource-config-old.json
   - Update all script paths
   - Test core functionality

## Success Criteria
- [ ] All 15 libsources accessible via membank
- [ ] Search performance equal or better than old system
- [ ] Zero data loss during migration
- [ ] All CLI commands functional
- [ ] API backwards compatible
- [ ] Documentation complete and accurate
- [ ] Clean separation between old and new during transition
- [ ] Successful operation for 48 hours post-migration

## Notes
- Keep old system with -old suffix until fully confident
- Test each phase thoroughly before proceeding
- Document any deviations from plan
- Prioritize data integrity over speed