# Sline displays only server-provided numbers

Every number sline renders (quota percentages, context usage, the value gauge)
comes from the statusline JSON Claude Code pipes on stdin — sline never computes
estimates client-side. A segment whose field is absent is omitted rather than
approximated.

## Considered Options

A burn-rate segment (cost ÷ wall-clock duration) existed and was removed: it
decayed while the session sat idle and spiked in the first seconds. On a display
glanced at all day, honest-but-missing beats plausible-but-wrong.
