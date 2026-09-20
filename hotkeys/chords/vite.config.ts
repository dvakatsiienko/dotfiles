import { fileURLToPath } from 'node:url';
import vitePluginTailwind from '@tailwindcss/vite';
import vitePluginReact from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import { chordsDevPort, chordsPort } from '../ports.ts';

export default defineConfig({
    plugins: [vitePluginReact(), vitePluginTailwind()],
    // `@/` is the house alias in every bytes app; `@hotkeys/` plays the role `@ui/kit/` does
    // there — a named door to code outside this package. Without it the same two modules wear
    // two spellings, `../../` from src and `../../../` from src/components.
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
            '@hotkeys': fileURLToPath(new URL('..', import.meta.url)),
        },
    },
    server: {
        port: chordsDevPort,
        // Every api call goes to the daemon, dev or built — it is the only thing that can
        // read the press log and write manual.ts, and it is always running anyway.
        proxy: { '/api': `http://localhost:${chordsPort}` },
        // Fail rather than auto-bump: a silent bump leaves the page talking to nothing.
        strictPort: true,
    },
});
