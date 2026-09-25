# Oles — the character spec

**the model:** `character.ts` picks it. `rex` is v1's paper t-rex, polished — the default, dima's pick. `clean` is
the v2 rig in `dino.ts`, saved as an alternative. the rules below hold for both.

the one rule: **Oles is calm and a little stern.** a real t-rex drawn clean: stoic, weathered, never
cute. a reader should respect him first and like him second.

## silhouette

- modern posture: the spine runs near horizontal, the body tilts forward about 15°, the tail
  balances the head and never drags on the ground.
- the head is big and long, a box with softened corners; the snout is squared off.
- the mouth is shut, a straight line with a row of teeth showing. no smile, no blush.
- one visible eye: amber with a slit pupil, set under a heavy brow ridge.
- a short thick neck, a pear-shaped body, heavy thighs, three-toed feet.
- tiny two-fingered arms held close to the chest. they are the joke, so they stay tiny.
- the back carries dark tapered stripes, thinning toward the tail.

## proportions — in head lengths (H)

- total length ≈ 5 H, nose to tail tip
- hip height ≈ 0.75 H, so the head rides well above the hip
- arm ≈ 0.25 H
- the tail tapers to a point over ≈ 2.2 H

## colour — tokens from `palette.ts`

- hide — `dino.hide` terracotta, the one warm focal colour in every frame
- belly — `dino.belly`, a pale peach band from the chin to the underside of the tail
- stripes — `dino.spot`, shade — `dino.shade`
- scarf — `dino.scarf` lapis, **occasional**: worn on cold nights, dried on the line by day. clothes
  and small vanity items appear now and then, never as a uniform
- at night the hide keeps its hue and drops in value; the side facing a lantern or the fire gets
  a warm rim.

## poses — the rig in `dino.ts`

- `walk` — mid-stride. the stash walk.
- `stand` — both feet planted. the homestead, the market, the workshop.
- props hang from the tail tip: `hasLantern`, `hasBasket`. `hasWren`, `hasList`, `hasScarf` add the rest.
- planned: `sleep` — curled on the rug, the tail wrapped round.

## don't

- no roaring pose: the rex model keeps v1's slightly parted jaw, never a wide-open roar
- no smile, no blush, no big round cartoon eyes
- no glasses: the v1 reading t-rex wore them, this one does not
- nothing that makes him small: he is always the biggest thing near him
