---
dies-when: distilled into the studio spec ticket (the stack section) — then delete
---

Ticket: FRM-263

# art studio tooling — what widens the agent's art toolset

two lanes on 2026-09-25, same question: `parallel-cli research run --processor core` (275 s) and an
opus agent (124 s, ~108k tokens). versions read by the agent via `npm view` + github api.

## the stack both lanes agree on

- `three` 0.186.1 — `SVGLoader`; `ShapeGeometry` for flat sheets, `ExtrudeGeometry` (depth ~0.02, small bevel) for a paper edge that catches light
- `@react-three/fiber` 9.8.1 + `@react-three/drei` 10.7.8 — 📌 r3f peer range is `react >=19 <19.4`
- `@react-three/postprocessing` 3.1.2 — `Bloom`, `TiltShift2`, `Noise`, `ToneMapping`
- `simplex-noise` 4.0.3 — coherent edge wobble, grain, wind
- `perfect-freehand` 1.2.3 — hand-drawn strokes as polygons (icons, linework)
- clipper2 — offsets + booleans: paper borders, windows, shadow shapes. opus picks `clipper2-ts` (prerelease), parallel picks `clipper2-wasm` 0.4.0; the wasm one is the fallback
- `playwright` 1.63.0 + `sharp` 0.35.4 — 2× capture, animated webp via `join: { animated: true }`
- `leva` 0.10.1 — live controls; half-maintained, still the react-native pick
- paper grain: a procedural `DataTexture` (simplex fBm), no package

## only opus found

- `@thi.ng/geom` + `@thi.ng/random` — resample, subdivide, jitter from one seeded cut: the foxglove edge in one call
- drei `AccumulativeShadows` — soft shadows between sheets, made for static bakes
- `n8ao` 2.0.1 — contact darkening where sheets overlap
- `three-custom-shader-material` 6.4.0 — fibre + grain on top of standard lighting
- `poisson-disk-sampling` — natural scatter (stars, grass, specks)
- `svgo` 4.1.0 + `@resvg/resvg-js` — shipped svg and browserless icon raster

## where the lanes disagree

- `roughjs`: parallel «use sparingly», opus «skip, stalled since 2023, pen-sketch not cut paper» → skip
- take storage: parallel `idb-keyval` (browser), opus a folder of webp + json → folder: takes must be git-tracked and readable by the agent
- comparison: `img-comparison-slider` (parallel) vs `react-compare-slider` 4.0.0 (opus) → the react one

## other styles (inference, both lanes)

most detail per effort: paper-cut in three.js with dof + ao, or flat svg with jittered paths + `feTurbulence`. toon via `MeshToonMaterial` + drei `Outlines` is cheap; watercolour shaders are costly and brittle; pixel drops detail.

## round 2 — how an agent makes art without an image model

- 🎯 **the reference bar uses no library.** 8 of 8 sampled pages in the MiaAI-Lab set, 018 included, have zero `<script src>`. 018's look is a recipe: `mulberry32` seed → `trace(poly, jitter≈0.7, step≈7)` subdivides and nudges every edge → 9 svg layers, two css drop-shadows each (1px light rim + depth-scaled shade) → a 160px canvas noise tile as an svg `<pattern>` grain → vignette + one glow filter. the pages that use three.js still paint textures with canvas 2d + noise
- **most detail per effort:** a render → screenshot → critique → revise loop with the reference beside the render; dense one-sentence scene specs (every element, hexes, layer count, shadow rule, grain); a library of seeded shape functions (`pine`, `fern`, `mushroom` …); cheap texture (noise tile, `feTurbulence` + `feDisplacementMap`, canvas blend modes). shaders/sdf pay off for light, glow, water, but cost more loop turns
- the loop papers (IntroSVG, Render-in-the-Loop, RefineSVG) mostly train on it; the gain for a stock model is inference, not measured

## round 2 — renderer and helpers

- keep `three` + r3f + postprocessing; `WebGPURenderer` + TSL works through r3f's async `gl` factory, still experimental — an experiment, never the only bake path
- `vgpu` 0.5.0 (vercel labs, MIT, peer `three >=0.180 <0.200`) — typed WGSL imports, one api for browser + headless node + tests, agent docs (`npx vgpu docs`, `llms.txt`, mcp). verdict: a sidecar for grain/paper shaders and headless shader bakes, trial only (0.x)
- `lygia` — copy the noise/sdf functions we use, no dependency
- `remotion` — later, only if atelier makes video
- skip: babylon, playcanvas (same job, no react gain), ogl, regl, twgl, p5, canvas-sketch (copy the ideas), pixi, canvaskit, rive (needs its editor), motion canvas (stalled)
- zoom/pan: `react-zoom-pan-pinch` 4.2.0 (peer react `*`) + `image-rendering: pixelated` past 100 %

versions verified with `npm view` on 2026-09-25 where the lanes disagreed: `vgpu` 0.5.0 and `react-zoom-pan-pinch` 4.2.0 — parallel reported 0.3.1 and 4.0.4 (stale).
