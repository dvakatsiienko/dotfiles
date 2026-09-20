import vitePluginTailwind from '@tailwindcss/vite';
import vitePluginReact from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import { chordsDevPort, chordsPort } from '../ports.ts';

export default defineConfig({
    plugins: [vitePluginReact(), vitePluginTailwind()],
    server: {
        port: chordsDevPort,
        // Every api call goes to the daemon, dev or built — it is the only thing that can
        // read the press log and write manual.ts, and it is always running anyway.
        proxy: { '/api': `http://localhost:${chordsPort}` },
        // Fail rather than auto-bump: a silent bump leaves the page talking to nothing.
        strictPort: true,
    },
});
