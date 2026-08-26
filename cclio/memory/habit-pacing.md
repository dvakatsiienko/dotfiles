# pacing — how a big drop gets processed

Dima thinks of things while resting, so a fat multi-item drop (usually via inbox) is normal, not
an emergency. His steer, 2026-08-26:

- **batch where batching is optimal** — grab a few related items per turn when that is the
  efficient shape, or when he explicitly widens the grab.
- **a huge query never demands one turn.** the priority is EVERY ask handled, smallest included —
  a missed ask (data loss) is the worst outcome, far worse than slowness.
- **quality over speed, balance over both extremes** — not a turtle, but never running so fast the
  chunk causes a stumble.

The working shape that fits: labeled sub-batches with a checkpoint message after each.

Related: [craft-pm](craft-pm.md) (the pace contract — propose before resolving)
