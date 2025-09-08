# Webpack to Vite Migration - Implementation Guide

## Pre-Migration Audit

### Dependency Analysis
Review and categorize all Webpack dependencies:

```bash
# List all webpack-related packages
npm ls | grep webpack
```

**Webpack Plugins → Vite Alternatives:**
| Webpack Plugin | Vite Alternative | Action Required |
|---------------|------------------|-----------------|
| html-webpack-plugin | Built-in | Remove |
| mini-css-extract-plugin | Built-in | Remove |
| copy-webpack-plugin | vite-plugin-static-copy | Replace |
| dotenv-webpack | Built-in | Remove |
| webpack-bundle-analyzer | rollup-plugin-visualizer | Replace |
| terser-webpack-plugin | Built-in | Remove |

### Import Pattern Analysis

**Patterns to Update:**
```javascript
// Webpack-specific → Vite
require.context('./dir', true, /\.js$/)  →  import.meta.glob('./dir/**/*.js')
require('./file')                         →  import './file'
process.env.NODE_ENV                      →  import.meta.env.MODE
process.env.CUSTOM_VAR                    →  import.meta.env.VITE_CUSTOM_VAR
__webpack_public_path__                   →  import.meta.env.BASE_URL
```

### Asset Pipeline Migration

**Asset Handling Changes:**
```javascript
// Webpack loaders → Vite native handling
import imgUrl from './img.png'           // Works as-is
import './styles.scss'                   // Works as-is
import Worker from './worker.js?worker'  // Vite suffix syntax
import rawText from './file.txt?raw'     // Vite suffix syntax
```

## Implementation Steps

### Step 1: Install Vite Dependencies

```bash
# Core Vite
npm install -D vite

# Framework plugins (choose one)
npm install -D @vitejs/plugin-react       # React
npm install -D @vitejs/plugin-vue         # Vue
npm install -D @sveltejs/vite-plugin-svelte # Svelte

# Common plugins
npm install -D @vitejs/plugin-legacy      # Legacy browser support
npm install -D vite-plugin-static-copy    # Copy static files
```

### Step 2: Create vite.config.ts

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '~': resolve(__dirname, './src')
    }
  },
  
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  },
  
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['lodash', 'dayjs']
        }
      }
    }
  },
  
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`
      }
    }
  }
})
```

### Step 3: Update package.json Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "dev:webpack": "webpack serve --config webpack.dev.js",
    "build:webpack": "webpack --config webpack.prod.js"
  }
}
```

### Step 4: Environment Variables Migration

1. Rename `.env` variables:
```bash
# .env
REACT_APP_API_URL=http://api.example.com  →  VITE_API_URL=http://api.example.com
VUE_APP_TITLE=My App                      →  VITE_APP_TITLE=My App
```

2. Update code references:
```javascript
// Before (Webpack)
const apiUrl = process.env.REACT_APP_API_URL

// After (Vite)
const apiUrl = import.meta.env.VITE_API_URL
```

### Step 5: Update Index HTML

Move `public/index.html` to project root and update:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <link rel="icon" type="image/svg+xml" href="/vite.svg" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>%VITE_APP_TITLE%</title>
</head>
<body>
  <div id="root"></div>
  <!-- Add module script -->
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>
```

## Migration Checklist

### Phase 1: Preparation
- [ ] Audit all Webpack plugins and find Vite alternatives
- [ ] Document custom Webpack configurations
- [ ] List all environment variables
- [ ] Identify dynamic imports and require.context usage
- [ ] Review build output requirements

### Phase 2: Implementation
- [ ] Install Vite and required plugins
- [ ] Create vite.config.ts
- [ ] Update package.json scripts
- [ ] Migrate environment variables
- [ ] Move and update index.html
- [ ] Update import statements
- [ ] Fix asset imports

### Phase 3: Testing
- [ ] Test development server
- [ ] Verify HMR functionality
- [ ] Test production build
- [ ] Compare bundle sizes
- [ ] Validate all features
- [ ] Test in target browsers

### Phase 4: Cleanup
- [ ] Remove Webpack configuration files
- [ ] Uninstall Webpack dependencies
- [ ] Update CI/CD pipelines
- [ ] Update documentation
- [ ] Clean up package.json

## Common Issues and Solutions

### Issue: Dynamic Imports Not Working
```javascript
// Webpack
const module = await import(`./modules/${name}.js`)

// Vite - use glob import
const modules = import.meta.glob('./modules/*.js')
const module = await modules[`./modules/${name}.js`]()
```

### Issue: require.context Not Supported
```javascript
// Webpack
const context = require.context('./components', true, /\.vue$/)

// Vite
const modules = import.meta.glob('./components/**/*.vue')
```

### Issue: Global SCSS Variables Not Available
```javascript
// vite.config.ts
css: {
  preprocessorOptions: {
    scss: {
      additionalData: `
        @import "@/styles/variables.scss";
        @import "@/styles/mixins.scss";
      `
    }
  }
}
```

### Issue: Build Output Structure Different
```javascript
// vite.config.ts
build: {
  rollupOptions: {
    output: {
      entryFileNames: 'js/[name].[hash].js',
      chunkFileNames: 'js/[name].[hash].js',
      assetFileNames: ({ name }) => {
        if (/\.(css)$/.test(name ?? '')) {
          return 'css/[name].[hash][extname]'
        }
        if (/\.(png|jpe?g|gif|svg|webp|ico)$/.test(name ?? '')) {
          return 'images/[name].[hash][extname]'
        }
        return 'assets/[name].[hash][extname]'
      }
    }
  }
}
```

## Performance Optimization

### Development Optimizations
```javascript
export default defineConfig({
  server: {
    warmup: {
      clientFiles: ['./src/main.tsx', './src/App.tsx']
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'lodash-es']
  }
})
```

### Production Optimizations
```javascript
export default defineConfig({
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    reportCompressedSize: false,
    chunkSizeWarningLimit: 500
  }
})
```

## Validation Script

Create `validate-migration.js`:
```javascript
import { execSync } from 'child_process'
import fs from 'fs'

const checks = {
  'Vite config exists': () => fs.existsSync('vite.config.ts'),
  'Index.html in root': () => fs.existsSync('index.html'),
  'Dev server starts': () => {
    try {
      execSync('npm run dev -- --help')
      return true
    } catch {
      return false
    }
  },
  'Build succeeds': () => {
    try {
      execSync('npm run build')
      return fs.existsSync('dist')
    } catch {
      return false
    }
  }
}

Object.entries(checks).forEach(([name, check]) => {
  console.log(`${check() ? '✅' : '❌'} ${name}`)
})
```