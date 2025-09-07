# Vite Migration - Technical Evaluation

## Current State

### Webpack Setup (What We're Escaping From)
- **Webpack 5.101.3** with 3 config files (base, dev, prod)
- **SWC loader** for TS/JSX compilation (good, we'll keep this)
- **webfonts-loader** generating icon fonts from SVGs (blocking Vite)
- **MobX decorators** requiring special transpilation
- **SCSS** with legacy imports everywhere
- **~500KB bundle** with React 19

### Icon System Analysis
Based on `claude-workflows/icons.md`:
- **32 total SVGs**, only ~15 actually used
- Icons processed by webpack's `webfonts-loader` plugin
- Referenced via `iconFont-icon-{name}` CSS classes
- ~17 files ready for deletion (500KB+ savings)

### Migration Blockers
1. **Icon font generator** - Webpack-specific plugin, no Vite equivalent
2. **MobX decorators** - Needs proper Vite plugin setup
3. **Legacy SCSS imports** - May need path adjustments
4. **Environment variables** - Different handling in Vite

### What's Good
- Already using SWC (Vite supports it)
- Clean path aliases (`@/*`, `~/*`)
- No SSR complexity
- Simple static output

## Risk Assessment

**Low Risk:**
- Path aliases migration
- Environment variables
- SCSS compilation

**Medium Risk:**
- MobX decorator support
- Development server parity
- Build output structure

**High Risk:**
- Icon font system (needs complete replacement)

## Effort Estimate

~10 days total, but front-loading the icon cleanup makes everything else smooth.