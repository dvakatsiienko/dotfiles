import { defineConfig } from 'vitest/config';

// a bg coder's worktree under .claude/worktrees carries a full copy of the tests;
// without this exclude every count doubles (measured 2026-09-03: 166 = 2 × 83)
// biome-ignore lint/style/noDefaultExport: vitest reads the default export
export default defineConfig({
    test: { exclude: ['**/node_modules/**', '.claude/worktrees/**'] },
});
