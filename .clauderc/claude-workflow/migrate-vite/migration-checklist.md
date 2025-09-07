# Vite Migration Checklist

## Pre-Installation Preparation ✅

### Phase 3 Completed Items
- [x] Dependency audit completed
- [x] Webpack patterns analyzed
- [x] Import patterns verified
- [x] Asset pipeline documented
- [x] Environment variables identified

### Ready for Deployment
The codebase is now fully prepared for Vite migration:
- No blocking webpack-specific code
- All assets properly organized
- Import patterns are Vite-compatible
- Clear migration path identified

---

## Installation Phase (DO NOT START YET)

### Step 1: Install Vite & Plugins
```bash
pnpm add -D vite@^7.0.0 @vitejs/plugin-react-swc vite-tsconfig-paths
```

### Step 2: Create Vite Config
Create `vite.config.ts` with:
- React SWC plugin for MobX decorators
- Path aliases (@, ~)
- Port 8080 for dev server
- Build output to dist/

### Step 3: Move HTML Entry
1. Move `public/index.html` → `index.html`
2. Add module script: `<script type="module" src="/src/index.tsx"></script>`
3. Remove HtmlWebpackPlugin markers

### Step 4: Move iframeAPI Files
```bash
mv iframeAPI.html public/
mv iframeAPI.js public/
```

### Step 5: Update Environment Variables
Replace in 3 files:
- `process.env.ENV` → `import.meta.env.VITE_ENV`
- `process.env.SSR` → `import.meta.env.SSR`
- `process.env.IFRAME_URL` → `import.meta.env.VITE_IFRAME_URL`

### Step 6: Create .env Files
```bash
# .env.development
VITE_ENV=dev
VITE_IFRAME_URL=http://localhost:8080

# .env.production  
VITE_ENV=prod
```

### Step 7: Update Package Scripts
```json
{
  "dev": "vite --port 8080",
  "build": "vite build",
  "preview": "vite preview"
}
```

---

## Validation Checklist

### Before Removing Webpack
- [ ] Dev server starts on port 8080
- [ ] All pages load correctly
- [ ] HMR works for React components
- [ ] MobX decorators function
- [ ] CSS hot reload works
- [ ] Icons display properly
- [ ] iframeAPI accessible at root
- [ ] Environment variables load
- [ ] Production build succeeds
- [ ] Build output structure matches requirements

### Production Build Validation
- [ ] Assets have hash in filename
- [ ] CSS is extracted and minified
- [ ] JavaScript is minified
- [ ] Source maps generated (if configured)
- [ ] All routes work in preview mode

---

## Cleanup Phase (After Validation)

### Remove Webpack Files
```bash
rm webpack.config.ts
rm webpack.config.dev.ts
rm webpack.config.prod.ts
```

### Remove Webpack Dependencies
```bash
pnpm remove webpack webpack-cli webpack-dev-server webpack-merge \
  copy-webpack-plugin css-loader css-minimizer-webpack-plugin \
  dotenv-webpack html-webpack-plugin mini-css-extract-plugin \
  swc-loader swc-minify-webpack-plugin @types/dotenv-webpack
```

### Update Documentation
- [ ] Update README.md with Vite commands
- [ ] Update CLAUDE.md build system section
- [ ] Document any Vite-specific gotchas
- [ ] Update Docker/CI configs

---

## Risk Mitigation

### Backup Points
1. ✅ Current state (post-SCSS removal, icons modernized)
2. ⏳ Before Vite installation
3. ⏳ After Vite working but before webpack removal
4. ⏳ Final migrated state

### Rollback Plan
If issues occur:
1. Git reset to last working commit
2. Restore package.json and lock file
3. Clear node_modules and reinstall
4. Verify webpack build works

### Known Gotchas
- Vite requires `type="module"` in script tags
- Env vars need `VITE_` prefix for client exposure
- Public dir files served at root (no `/public/` prefix)
- HMR port might conflict - check firewall/other services

---

## Success Metrics

### Performance Targets
- [ ] Dev server start: <500ms (from 3-5s)
- [ ] HMR update: <100ms (from 1-2s)
- [ ] Production build: <10s (from 30-60s)
- [ ] Bundle size: ≤ current or smaller

### Developer Experience
- [ ] Faster feedback loop
- [ ] Better error messages
- [ ] Simpler configuration
- [ ] Modern tooling ecosystem

---

## Next Action

**STOP HERE** - Ready for deployment before Vite installation.

Current status:
- ✅ All preparation complete
- ✅ No blocking issues identified
- ✅ Clear migration path documented
- 🛑 Awaiting deployment approval before installation