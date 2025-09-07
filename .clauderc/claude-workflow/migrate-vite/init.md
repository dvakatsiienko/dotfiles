# Vite 7 Migration Initiative

## Overview

Our primary direction with this project is to migrate from Webpack 5 to Vite 7. However, this codebase has significant legacy cruft that makes a direct migration problematic. We need a strategic, phased approach to eliminate blockers first, then smoothly transition to Vite.

## Migration Roadmap

### Phase 1: Icon System Modernization (PARTIALLY COMPLETE ⚠️)
**Goal**: Replace legacy webfonts-loader with modern SVG sprite system

1. **SVG Cleanup** ✅
   - Analysis complete in `claude-workflows/icons.md`
   - ~17 unused SVG files identified for deletion
   - Must carefully verify icon usage in CSS, JSX, and dynamic references

2. **Icon Font Decoupling** 🚧 **IN PROGRESS**
   - ✅ MenuNav and MenuMode components migrated to SVGIcon
   - ⚠️ **DeviceStatusbar still uses iconFont** (network, wifi, battery icons)
   - ⚠️ **SCSS files have direct SVG imports** (Header.scss, Layout.scss)
   - Legacy iconFont system needs complete removal

3. **Modern SVG Implementation** 🚧 **NEEDS COMPLETION**
   - ✅ Created consolidated SVG sprite in `src/img/sprite.svg`
   - ✅ Implemented `SVGIcon.tsx` component with proper TypeScript interfaces
   - ✅ Replaced MenuNav/MenuMode icon font references
   - ✅ SVG sprite processed via webpack as asset for proper URL handling
   - ✅ All icons use `fill="currentColor"` for theme consistency
   - ✅ Fixed malformed XML that was breaking sprite parsing
   - ❌ **Missing icons**: network, wifi, battery (needed for DeviceStatusbar)
   - ❌ **webfonts-loader still active** - blocks Vite migration

### Phase 2: Build System Preparation
**Goal**: Simplify webpack config for easier Vite migration

1. **Dependency Audit**
   - Remove webpack-specific plugins that Vite handles natively
   - Identify Vite-incompatible patterns in current setup
   - Document required feature parity checklist

2. **Path Resolution Cleanup**
   - Standardize alias usage (`@/*`, `~/*`)
   - Remove legacy aliases (`img`, `scss`)
   - Ensure consistent import patterns

3. **Asset Pipeline Simplification**
   - Consolidate asset handling strategies
   - Remove redundant copy operations
   - Prepare for Vite's native asset handling

### Phase 3: Vite Integration
**Goal**: Run Vite alongside Webpack initially

1. **Vite Installation & Config**
   - Install Vite 7 and required plugins
   - Create `vite.config.ts` mirroring webpack functionality
   - Set up dev server with HMR

2. **Feature Parity Implementation**
   - Environment variables (`.env` support)
   - MobX decorators support
   - SCSS with legacy `@import` handling
   - Content hash for production builds
   - SWC integration for fast compilation

3. **Parallel Testing**
   - Run both build systems temporarily
   - Compare bundle sizes and performance
   - Validate all features work identically

### Phase 4: Webpack Removal
**Goal**: Complete migration to Vite

1. **Final Migration**
   - Update all npm scripts to use Vite
   - Migrate CI/CD pipelines (Docker, Jenkins)
   - Remove webpack dependencies

2. **Optimization**
   - Implement Vite-specific optimizations
   - Configure build chunking strategy
   - Set up proper caching headers

## Technical Blockers to Address

### Critical Issues
1. **Icon Font System** - Tightly coupled to webpack via `webfonts-loader`
2. **Legacy SCSS Imports** - May need adjustments for Vite
3. **MobX Decorators** - Requires specific transpilation setup
4. **Environment Variables** - Different handling between webpack/Vite

### Risk Areas
- Dynamic imports in iframe API
- PostMessage communication patterns
- Multi-brand configuration logic
- Legacy browser support requirements

## Success Criteria

- [ ] All icon fonts replaced with SVG components (Phase 1 - PARTIAL ⚠️)
  - [x] MenuNav and MenuMode components ✅
  - [ ] DeviceStatusbar component (network, wifi, battery icons)
  - [ ] All iconFont CSS classes removed
  - [ ] webfonts-loader completely removed
- [ ] Webpack config simplified to essential features
- [ ] Vite dev server running with full HMR support
- [ ] Production builds identical in functionality
- [ ] Build time reduced by >50%
- [ ] Bundle size maintained or reduced
- [ ] All CI/CD pipelines updated
- [ ] Zero regression in functionality

## Timeline Estimation

- **Phase 1**: 2-3 days (Icon system modernization)
- **Phase 2**: 1-2 days (Build preparation)
- **Phase 3**: 3-4 days (Vite integration)
- **Phase 4**: 1-2 days (Webpack removal)

**Total**: ~10 days of focused work

## Notes

This migration is necessary because:
- Webpack config has accumulated significant technical debt
- Build times are unnecessarily slow
- Vite 7 offers superior DX with instant HMR
- Modern tooling will make future maintenance easier
- Current setup blocks adoption of modern patterns

The phased approach ensures we can:
- Test each change in isolation
- Maintain working builds throughout
- Roll back if issues arise
- Learn and adapt as we progress