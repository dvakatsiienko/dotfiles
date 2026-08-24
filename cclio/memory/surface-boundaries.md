# surface boundaries

**An agent mutates only its own memory** — `cw` and cloud `cc` keep their own stores.

- 🎯 a «surfaces are out of sync» symptom → ask whether the two sides need to be two sides;
  never propose another sync mechanism. The old sync program died by deletion, and that was the
  fix.
- **mcp vs cli — which machine does the shell reach?** cclio's shell is the mac → cli. `cw`'s
  shell is a throwaway container → a local mcp server is its only door to the real filesystem.
  Say that inside the tool's description. Decides [DOT-185](linear://linear.app/issue/DOT-185).
- fleet-bound facts queue on [DOT-186](linear://linear.app/issue/DOT-186); several pm leaves here
  are fleet-wide in a private store — placement is
  [DOT-73](linear://linear.app/issue/DOT-73) step 3, never moved unilaterally.
