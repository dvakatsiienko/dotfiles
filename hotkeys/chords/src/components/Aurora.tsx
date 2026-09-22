import { useEffect, useRef } from 'react';

// The strip above the deck: the rail's eight colours as slow aurora bands, drawn on the GPU.
// Raw WebGPU rather than vgpu — the same WGSL, none of the 6.6 MB and no three.js peer. It is
// still by default: one frame at mount, and it only moves for a bounded moment after the
// layer turns, a drag starts, or a rebind lands. A browser without WebGPU gets the plain deck.
const SHADER = /* wgsl */ `
struct Uniforms { time: f32, seed: f32, width: f32, height: f32 };
@group(0) @binding(0) var<uniform> u: Uniforms;

struct Out { @builtin(position) pos: vec4f, @location(0) uv: vec2f };

@vertex fn vs(@builtin(vertex_index) i: u32) -> Out {
  var p = array<vec2f, 3>(vec2f(-1, -1), vec2f(3, -1), vec2f(-1, 3));
  var o: Out;
  o.pos = vec4f(p[i], 0, 1);
  o.uv = p[i] * 0.5 + 0.5;
  return o;
}

fn hash(p: vec2f) -> f32 {
  return fract(sin(dot(p, vec2f(127.1, 311.7))) * 43758.5453);
}
fn noise(p: vec2f) -> f32 {
  let i = floor(p); let f = fract(p);
  let a = hash(i); let b = hash(i + vec2f(1, 0));
  let c = hash(i + vec2f(0, 1)); let d = hash(i + vec2f(1, 1));
  let s = f * f * (3 - 2 * f);
  return mix(mix(a, b, s.x), mix(c, d, s.x), s.y);
}
fn fbm(p: vec2f) -> f32 {
  var v = 0.0; var a = 0.5; var q = p;
  for (var k = 0; k < 4; k++) { v += a * noise(q); q = q * 2.1 + 7.0; a *= 0.5; }
  return v;
}

// The rail, top to bottom, as a ramp.
fn rail(t: f32) -> vec3f {
  let c0 = vec3f(0.31, 0.49, 1.00); let c1 = vec3f(0.18, 0.77, 0.71);
  let c2 = vec3f(0.24, 0.86, 0.52); let c3 = vec3f(1.00, 0.82, 0.25);
  let c4 = vec3f(1.00, 0.31, 0.37);
  let x = clamp(t, 0, 1) * 4;
  if (x < 1) { return mix(c0, c1, x); }
  if (x < 2) { return mix(c1, c2, x - 1); }
  if (x < 3) { return mix(c2, c3, x - 2); }
  return mix(c3, c4, x - 3);
}

@fragment fn fs(@location(0) uv: vec2f) -> @location(0) vec4f {
  let aspect = u.width / max(u.height, 1.0);
  let p = vec2f(uv.x * aspect, uv.y) * 0.9 + u.seed * 3.7;
  let t = u.time * 0.12;
  let drift = fbm(p + vec2f(t, -t * 0.4));
  let band = fbm(p * 0.7 + vec2f(-t * 0.6, drift));
  let hue = fract(uv.x * 0.9 + band * 0.55 + u.seed * 0.21);
  let glow = smoothstep(0.32, 0.8, band) * (0.6 + 0.4 * drift);
  // Fade at the top edge so the strip melts into the desk rather than cutting across it.
  let edge = smoothstep(0.0, 0.35, uv.y) * smoothstep(1.0, 0.75, uv.y);
  return vec4f(rail(hue) * glow * edge, glow * edge);
}
`;

export const Aurora = (props: AuroraProps) => {
    const canvas = useRef<HTMLCanvasElement | null>(null);
    const drawRef = useRef<((time: number) => void) | null>(null);

    useEffect(() => {
        const element = canvas.current;
        const gpu = navigator.gpu;

        if (!(element && gpu)) return;

        let disposed = false;
        let cleanup = () => undefined as void;

        (async () => {
            const adapter = await gpu.requestAdapter();
            const device = await adapter?.requestDevice();
            const context = element.getContext('webgpu');

            if (!(device && context) || disposed) return;

            const format = gpu.getPreferredCanvasFormat();
            context.configure({ alphaMode: 'premultiplied', device, format });

            const module = device.createShaderModule({ code: SHADER });
            const pipeline = device.createRenderPipeline({
                fragment: {
                    entryPoint: 'fs',
                    module,
                    targets: [
                        {
                            blend: {
                                alpha: {
                                    dstFactor: 'one-minus-src-alpha',
                                    srcFactor: 'one',
                                },
                                color: {
                                    dstFactor: 'one-minus-src-alpha',
                                    srcFactor: 'one',
                                },
                            },
                            format,
                        },
                    ],
                },
                layout: 'auto',
                primitive: { topology: 'triangle-list' },
                vertex: { entryPoint: 'vs', module },
            });
            const uniforms = device.createBuffer({
                size: 16,
                usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
            });
            const bindGroup = device.createBindGroup({
                entries: [{ binding: 0, resource: { buffer: uniforms } }],
                layout: pipeline.getBindGroupLayout(0),
            });

            const fit = () => {
                const scale = Math.min(window.devicePixelRatio, 2);
                element.width = Math.max(1, element.clientWidth * scale);
                element.height = Math.max(1, element.clientHeight * scale);
            };

            drawRef.current = (time) => {
                if (disposed) return;
                fit();
                device.queue.writeBuffer(
                    uniforms,
                    0,
                    new Float32Array([
                        time,
                        props.seed,
                        element.width,
                        element.height,
                    ]),
                );
                const encoder = device.createCommandEncoder();
                const pass = encoder.beginRenderPass({
                    colorAttachments: [
                        {
                            clearValue: { a: 0, b: 0, g: 0, r: 0 },
                            loadOp: 'clear',
                            storeOp: 'store',
                            view: context.getCurrentTexture().createView(),
                        },
                    ],
                });
                pass.setPipeline(pipeline);
                pass.setBindGroup(0, bindGroup);
                pass.draw(3);
                pass.end();
                device.queue.submit([encoder.finish()]);
            };
            drawRef.current(0);

            const onResize = () => drawRef.current?.(lastTime.current);
            window.addEventListener('resize', onResize);
            cleanup = () => {
                window.removeEventListener('resize', onResize);
                device.destroy();
            };
        })();

        return () => {
            disposed = true;
            drawRef.current = null;
            cleanup();
        };
    }, [props.seed]);

    // A bounded run: `props.wake` changes → ~900ms of frames, then still again. Nothing loops
    // while the page is idle.
    const lastTime = useRef(0);

    useEffect(() => {
        if (!props.wake) return;
        if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        const started = performance.now();
        const base = lastTime.current;
        let frame = 0;

        const tick = (now: number) => {
            const elapsed = (now - started) / 1000;

            lastTime.current = base + elapsed;
            drawRef.current?.(lastTime.current);
            if (elapsed < 0.9) frame = requestAnimationFrame(tick);
        };

        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, [props.wake]);

    return (
        <canvas
            aria-hidden
            className='pointer-events-none block h-[44px] w-full'
            ref={canvas}
        />
    );
};

/* Types */
interface AuroraProps {
    // Which layer is showing; each layer gets its own field.
    seed: number;
    // A value that changes whenever the strip should move for a moment.
    wake: string;
}
