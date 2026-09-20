// The one port pair for chords, imported by both sides so they cannot drift: the daemon's
// server (dist plus the api) and vite's dev server, which proxies /api back to it.
export const chordsPort = 7373;
export const chordsDevPort = 7374;
