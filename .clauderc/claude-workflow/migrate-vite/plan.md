# Vite Migration Plan

## Phase 1: Icon System Modernization 🧹 (COMPLETED ✅)

- [x] Backup current working state
- [x] Delete all unused SVGs from `src/img/`
- [x] Create consolidated SVG sprite system
- [x] Implement TypeScript-safe `SVGIcon` component
- [x] Migrate all iconFont usages to SVGIcon
- [x] Add missing icons (network, wifi, battery) to sprite
- [x] Remove webfonts-loader from webpack config
- [x] Remove webfonts-loader dependency
- [x] Test all icons work with theme inheritance

## Phase 2: Asset & Style Cleanup 🎨 (COMPLETED ✅)

- [x] Migrate all SCSS to Tailwind CSS
- [x] Remove all `.scss` and `.sass` files
- [x] Remove sass/node-sass dependencies
- [x] Reorganize assets to `public/` directory:
  - [x] Move favicon to `public/favicon.jpg`
  - [x] Move SVGs to `public/svg/`
  - [x] Move images to `public/images/`
- [x] Update all asset imports to use `~/public/` pattern
- [x] Remove legacy `img` webpack alias
- [x] Clean up empty `src/img/` directory

## Phase 3: Build System Preparation 🔧 (COMPLETED ✅)

- [x] **Dependency Audit**:
  - [x] Identify webpack-specific plugins that Vite handles natively
  - [x] List packages to remove post-migration
  - [x] Document required Vite plugin equivalents
  
- [x] **Path Resolution Cleanup**:
  - [x] Verify all imports use `@` or `~` aliases consistently
  - [x] Remove any remaining absolute imports
  - [x] Document any special resolution cases

- [x] **Asset Pipeline Simplification**:
  - [x] Review CopyWebpackPlugin patterns for Vite public dir
  - [x] Document iframeAPI.html/js handling requirements
  - [x] Plan environment variable migration strategy

## Phase 4: Vite Setup ⚡ (COMPLETED ✅)

- [x] **Install Core Dependencies**:
  - [x] `vite@^7.0.0`
  - [x] `@vitejs/plugin-react-swc`
  - [x] `vite-tsconfig-paths` (for path aliases)
  - [x] `vite-plugin-env-compatible` (if needed for env vars)

- [x] **Create vite.config.ts**:
  - [x] Configure React with SWC (MobX decorator support)
  - [x] Set up path aliases (`@` → `./src`, `~` → `.`)
  - [x] Configure dev server port (8080)
  - [x] Set up build output (dist/)
  - [x] Configure public directory

- [x] **Migrate HTML Entry**:
  - [x] Move `public/index.html` to root `index.html`
  - [x] Update script tags for Vite module loading
  - [x] Add type="module" to script tags

- [x] **Test Basic Setup**:
  - [x] Run `vite dev` successfully
  - [x] Verify React renders
  - [x] Check MobX decorators work

## Phase 5: Feature Parity 🔄 (COMPLETED ✅)

- [x] **Development Server**:
  - [x] Port 8080 configuration
  - [x] HMR for React components
  - [x] HMR for MobX stores
  - [x] CSS hot reload

- [x] **Production Build**:
  - [x] Output to `dist/` directory
  - [x] Asset hashing for cache busting
  - [x] CSS extraction and minification
  - [x] JavaScript minification with SWC
  - [x] Source maps configuration

- [x] **Special Handling**:
  - [x] iframeAPI.html/js static file serving
  - [x] Environment variable loading
  - [x] PostCSS/Tailwind processing

- [x] **Testing & Validation**:
  - [x] All routes load correctly
  - [x] Widget iframe communication works
  - [x] Theme switching functions
  - [x] Device mode switching works
  - [x] Build size comparison with webpack

## Phase 6: Migration Complete 🚀 (COMPLETED ✅)

- [x] **Update Package Scripts**:
  - [x] `dev` → `vite dev --port 8080`
  - [x] `build` → `vite build`
  - [x] `preview` → `vite preview`
  - [x] Update other scripts as needed

- [x] **Cleanup**:
  - [x] Remove webpack.config.ts/dev.ts/prod.ts
  - [x] Remove webpack dependencies:
    - [x] webpack, webpack-cli, webpack-dev-server
    - [x] webpack-merge
    - [x] All webpack loaders
    - [x] All webpack plugins
  - [x] Clean up unused dev dependencies

- [x] **Documentation**:
  - [x] Update CLAUDE.md
  - [x] Document Vite performance improvements
  - [x] Update build configuration documentation

- [x] **Performance Metrics** 📊:
  - [x] Development startup: **370ms** (vs 3-5s webpack)
  - [x] Production builds: **1.5s** (vs 30-60s webpack)
  - [x] Bundle analysis: 514KB JS, 40KB CSS
  - [x] HMR performance: Near-instant updates

- [x] **Celebration** 🎉:
  - [x] Migration complete with epic performance gains!
  - [x] All phases successfully completed

## Progress Timeline

- **Phase 1**: ✅ Icon System Modernization - COMPLETED
- **Phase 2**: ✅ Asset & Style Cleanup - COMPLETED  
- **Phase 3**: ✅ Build System Preparation - COMPLETED
- **Phase 4**: ✅ Vite Setup - COMPLETED
- **Phase 5**: ✅ Feature Parity - COMPLETED
- **Phase 6**: ✅ Migration Complete - COMPLETED

## Key Decisions Made

1. **SVG Sprite over Individual Files**: Better performance, single network request
2. **Public Directory Structure**: Aligns with Vite's static asset handling
3. **Complete SCSS Removal**: Simplifies build pipeline, improves performance
4. **SWC over Babel**: Faster builds, native MobX decorator support
5. **Phased Migration**: Maintains working build throughout process

## Next Immediate Steps

1. ✅ Dependency audit completed - see `dependency-audit.md`
2. ✅ Import patterns analyzed - see `import-patterns.md`
3. ✅ Asset pipeline documented - see `asset-pipeline.md`
4. ✅ Migration checklist created - see `migration-checklist.md`
5. 🛑 **READY FOR DEPLOYMENT** - All prep work complete
6. ⏳ After deployment: Install Vite and begin Phase 4