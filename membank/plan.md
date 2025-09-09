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
- [x] Create `membank/libsource/` directory
- [x] Create `membank/libsource/core/` for Python CRUD scripts  
- [x] Create `membank/libsource/sources/` for .txt files
- [x] Create `membank/cli/` for search.py and server.py
- [x] Create `membank/rag/` for RAG modules
- [x] Create `membank/scripts/` for utility scripts
- [x] Create `membank/config/` for configuration files

### 1.2 Initialize Core Files
- [x] Create empty `membank/db.sqlite` (SQLite)
- [ ] Create `membank/.gitignore` with appropriate exclusions
- [ ] Create `membank/README.md` with quick start guide

## Phase 2: Safe Renaming of Current System
*Goal: Mark old system clearly for easy identification and later removal*

### 2.1 Rename Databases and Update Ports
- [x] Keep old server on port 1408 (simplified approach)
- [x] Configure new server for port 1409
- [x] Start new server on port 1409

### 2.2 Mark Old Directories
- [x] Skipped renaming (kept original locations per request)

### 2.3 Rename Configuration
- [x] Skipped renaming (kept original config per request)

## Phase 3: Copy and Adapt Components
*Goal: Populate membank with adapted versions of existing components*

### 3.1 Migrate Core Scripts
- [x] Copy `libsource_add.py` → `membank/libsource/core/add.py`
- [x] Copy `libsource_list.py` → `membank/libsource/core/list.py`
- [x] Copy `libsource_update.py` → `membank/libsource/core/update.py`
- [x] Copy `libsource_delete.py` → `membank/libsource/core/delete.py`
- [x] Copy `libsource_restore.py` → `membank/libsource/core/restore.py`
- [x] Copy `libsource_utils.py` → `membank/libsource/core/utils.py`
- [x] Create `membank/libsource/core/__init__.py`

### 3.2 Migrate CLI Components
- [x] Copy `search.py` → `membank/cli/search.py`
- [x] Copy `server.py` → `membank/cli/server.py`

### 3.3 Migrate RAG Modules
- [x] Copy entire RAG module structure to `membank/rag/`
- [x] Maintain: chunker.py, processor.py, tagger.py, indexer.py, search.py, server.py

### 3.4 Migrate Utility Scripts
- [x] Copy benchmark scripts to `membank/scripts/`
- [x] Copy test scripts to `membank/scripts/`

## Phase 4: Path Updates and Configuration
*Goal: Update all internal references to use new membank paths*

### 4.1 Update Python Import Paths
- [x] Update all imports in `membank/libsource/core/*.py`
- [x] Update all imports in `membank/cli/*.py`
- [x] Update all imports in `membank/rag/*.py`
- [x] Fix relative imports to use new structure

### 4.2 Update File Paths
- [x] Update database path to `membank/db.sqlite`
- [x] Update config path to `membank/libsource/.libsource-config.json`
- [x] Update libsource directory to `membank/libsource/sources/`
- [x] Update all hardcoded paths in Python scripts

### 4.3 Configuration Migration
- [x] Copy `.libsource-config.json` → `membank/libsource/.libsource-config.json`
- [x] Update all file paths in config to point to new locations
- [ ] Add version field to track migration state

## Phase 5: Data Migration
*Goal: Copy all libsources and rebuild RAG database*

### 5.1 Copy Libsource Files (Keep Old Intact)
- [x] Copy all 15 .txt files to membank/libsource/sources/
- [x] Keep original files in original location
- [x] Verify file integrity
- [x] Update .libsource-config.json with new paths
- [x] Note: New libsources will be added iteratively to membank only

### 5.2 Build New RAG Database
- [x] Initialize empty db.sqlite with proper schema
- [x] Run indexer on all libsources to populate db.sqlite
- [x] Verify chunk counts (19,303 total chunks)
- [x] Compare search results between old and new databases

## Phase 6: Testing and Validation
*Goal: Ensure complete functionality before cutover*

### 6.1 Unit Testing
- [x] Test list.py shows all 15 libsources
- [x] Test update.py refreshes existing libsource
- [ ] Test add.py with new libsource
- [ ] Test delete.py removes libsource and RAG data
- [ ] Test restore.py from backup

### 6.2 Integration Testing
- [x] Start membank server on port 1409 (new system)
- [x] Test search API endpoint with various queries
- [x] Test health endpoint
- [ ] Test all API endpoints (search/all, libraries, chunk, stats)
- [ ] Benchmark performance

### 6.3 CLI Testing
- [x] Test `pnpm lib:list` with new backend
- [x] Test `pnpm lib:server start/stop/status`
- [ ] Test all lib:* commands work correctly

## Phase 7: Package.json Updates
*Goal: Point all scripts to new membank system*

### 7.1 Update Script Paths
- [x] Update `lib:add` → `membank/libsource/core/add.py`
- [x] Update `lib:list` → `membank/libsource/core/list.py`
- [x] Update `lib:update` → `membank/libsource/core/update.py`
- [x] Update `lib:delete` → `membank/libsource/core/delete.py`
- [x] Update `lib:restore` → `membank/libsource/core/restore.py`
- [x] Update `lib:search` → `membank/cli/search.py`
- [x] Update `lib:server` → `membank/cli/server.py`
- [x] Update `rag:*` commands to use membank paths

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
- [x] Membank server running on port 1409
- [x] Old system still available on port 1408 as fallback
- [x] Document both ports for reference

### 9.2 Validate Production Port
- [x] Verify membank on port 1409 fully operational
- [x] Keep old system on 1408 running as backup
- [x] Run smoke tests on port 1409

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