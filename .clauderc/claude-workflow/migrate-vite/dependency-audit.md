# Vite Migration - Dependency Audit

## Webpack Dependencies to Remove (Post-Migration)

### Core Webpack
- `webpack` - bundler core
- `webpack-cli` - command line interface
- `webpack-dev-server` - development server
- `webpack-merge` - config merging utility

### Webpack Loaders
- `css-loader` - CSS imports → Vite handles natively
- `postcss-loader` - PostCSS processing → Vite handles via postcss.config
- `swc-loader` - SWC compilation → Use @vitejs/plugin-react-swc

### Webpack Plugins
- `copy-webpack-plugin` - static file copying → vite-plugin-static-copy or public dir
- `css-minimizer-webpack-plugin` - CSS minification → Vite handles natively
- `dotenv-webpack` - env vars → Vite handles natively
- `html-webpack-plugin` - HTML generation → Vite uses index.html directly
- `mini-css-extract-plugin` - CSS extraction → Vite handles natively
- `swc-minify-webpack-plugin` - JS minification → Vite/SWC handles natively

### Type Definitions
- `@types/dotenv-webpack` - no longer needed

## Vite Replacements Required

| Webpack Feature | Vite Replacement | Notes |
|-----------------|------------------|-------|
| webpack-dev-server | Vite dev server | Built-in, port configurable |
| css-loader + mini-css-extract | Native CSS handling | Automatic in Vite |
| dotenv-webpack | Native env handling | Uses .env files automatically |
| html-webpack-plugin | index.html entry | Direct HTML file support |
| swc-loader | @vitejs/plugin-react-swc | Official Vite plugin |
| copy-webpack-plugin | vite-plugin-static-copy | For iframeAPI files |

## Dependencies to Keep

### Build Tools (Still Needed)
- `@swc/core` - SWC compiler core
- `@swc/helpers` - SWC runtime helpers
- `typescript` - TypeScript compiler
- `tsx` - TypeScript execution

### CSS Processing
- `postcss` - CSS processing
- `@tailwindcss/postcss` - Tailwind PostCSS plugin
- `tailwindcss` - Tailwind CSS framework

### Development Tools
- `@biomejs/biome` - Linting/formatting
- `knip` - Unused code detection
- `cloc` - Code line counter
- `npm-run-all` - Script runner
- `rimraf` - Directory cleaning
- `serve` - Static file server (for preview)

### React & Libraries
- All React/MobX/Router dependencies
- All UI libraries (Radix, Lucide, etc.)
- All utility libraries

## Environment Variables Migration

Current usage in codebase:
- `process.env.ENV` → `import.meta.env.VITE_ENV`
- `process.env.SSR` → `import.meta.env.SSR` (Vite built-in)
- `process.env.IFRAME_URL` → `import.meta.env.VITE_IFRAME_URL`

Vite requires `VITE_` prefix for custom env vars exposed to client.

## Build Output Comparison

### Current Webpack Output
```
dist/
├── assets/
│   ├── css/style.css
│   ├── js/main.js
│   └── img/[name]-[hash].[ext]
├── index.html
├── iframeAPI.html
└── iframeAPI.js
```

### Expected Vite Output
```
dist/
├── assets/
│   ├── [name]-[hash].css
│   ├── [name]-[hash].js
│   └── [images with hash]
├── index.html
├── iframeAPI.html
└── iframeAPI.js
```

## Notes

- Total packages to remove: 14 webpack-related
- Estimated node_modules reduction: ~50-100MB
- Build time improvement expected: 5-10x faster
- HMR performance improvement: Near-instant vs 1-2s