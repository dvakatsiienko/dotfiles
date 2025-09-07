# Asset Pipeline Requirements

## Current Asset Structure

```
public/
├── favicon.jpg         # Site favicon
├── index.html          # HTML template
├── images/
│   └── turbo-sports.png  # Brand logo
└── svg/
    ├── beter.svg       # Beter brand logo
    └── sprite.svg      # Icon sprite system

Root files (need copying):
├── iframeAPI.html      # Widget API demo page
└── iframeAPI.js        # Widget API implementation
```

## Asset Handling Requirements

### Static Files (Copy to dist)
**iframeAPI files** - Must be copied as-is to dist root:
- `iframeAPI.html` - Demo page for widget testing
- `iframeAPI.js` - Client-side API implementation

Current webpack config:
```javascript
new CopyWebpackPlugin({
  patterns: [
    { from: './iframeAPI.html', to: '.' },
    { from: './iframeAPI.js', to: '.' }
  ]
})
```

Vite solution options:
1. Move to `public/` directory (auto-copied)
2. Use `vite-plugin-static-copy` plugin
3. Add custom build script

### HTML Entry Point
Current: `public/index.html` processed by HtmlWebpackPlugin
Vite: Move to root `index.html` with module script tag

Changes needed:
```html
<!-- Current webpack -->
<!-- Scripts injected by HtmlWebpackPlugin -->

<!-- Vite -->
<script type="module" src="/src/index.tsx"></script>
```

### Favicon
Current: `public/favicon.jpg` referenced in webpack config
Vite: Keep in `public/`, reference in HTML directly

### Image Assets
Current handling: Webpack asset modules with hash
Vite handling: Automatic with same hash support

Files using images:
- `src/app/parts/Header/Header.tsx` - imports logos
- `src/elements/SVGIcon.tsx` - imports sprite

## Environment-Specific Assets

### Development
- Local dev server serves from `public/`
- HMR for all assets
- No optimization/minification

### Production
- Assets copied to `dist/`
- Images optimized
- CSS/JS minified
- Content hashing for cache busting

## Build Output Structure

Required dist structure:
```
dist/
├── index.html
├── favicon.jpg
├── iframeAPI.html      # Must be at root
├── iframeAPI.js        # Must be at root
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── [images with hash]
├── images/
│   └── turbo-sports.png
└── svg/
    ├── beter.svg
    └── sprite.svg
```

## Special Considerations

1. **Public Directory Files**: All files in `public/` are served at root
2. **Import References**: Assets imported in JS/TS get hashed
3. **Direct HTML References**: Assets referenced in HTML use public path
4. **iframeAPI Location**: Critical - must be at domain root for widget compatibility

## Migration Steps

1. Move `public/index.html` → `index.html` (root)
2. Keep `public/favicon.jpg` (auto-served)
3. Move `iframeAPI.*` files → `public/` directory
4. Update `index.html` with module script tag
5. Configure Vite public dir and build output

## Testing Checklist

- [ ] iframeAPI.html loads at `/iframeAPI.html`
- [ ] iframeAPI.js loads and executes
- [ ] Favicon displays correctly
- [ ] All images load with correct paths
- [ ] SVG sprite icons render properly
- [ ] Assets have cache-busting hashes in production