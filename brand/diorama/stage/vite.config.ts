import { defineConfig } from 'vite';

export default defineConfig({
    server: { port: 7380, strictPort: true },
    preview: { port: 7381, strictPort: true },
});
