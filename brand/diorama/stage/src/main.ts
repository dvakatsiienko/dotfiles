import './style.css';
import * as THREE from 'three';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { palettes } from '../../palette.ts';
import { buildScene, cameraDistance, sceneNames } from './scene.ts';
import type { SceneName, Stage } from './scene.ts';
import { defaults } from './settings.ts';
import type { Look, Settings } from './settings.ts';
import { texH, texW } from './sheets.ts';
import { mountPanel } from './ui.ts';

/* ?scene=market · ?time=night · ?bake renders one 3200 × 1200 frame and sets the title to «done» · ?loop=N exposes window.stageFrame(i) for frame i of N · ?set={json} overrides settings in a bake */

const params = new URLSearchParams(location.search);
const isBake = params.has('bake') || params.has('loop');
const loopFrames = Number(params.get('loop') ?? 0);
const settings: Settings = { ...defaults, ...(isBake ? readOverrides() : readSaved()) };
let time: 'day' | 'night' = params.get('time') === 'night' ? 'night' : 'day';
let sceneName: SceneName = sceneNames.find((s) => s === params.get('scene')) ?? 'homestead';

document.body.classList.toggle('bake', isBake);
document.body.dataset.time = time;
addEventListener('error', (e) => {
    document.title = `error: ${e.message}`;
});

const canvas = document.querySelector<HTMLCanvasElement>('#stage');
if (!canvas) throw new Error('no #stage canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.VSMShadowMap;
renderer.setPixelRatio(1);

const camera = new THREE.PerspectiveCamera((2 * Math.atan(3 / cameraDistance) * 180) / Math.PI, 16 / 6, 0.1, 100);
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(new THREE.Scene(), camera);
const bokeh = new BokehPass(new THREE.Scene(), camera, { focus: cameraDistance, aperture: 0, maxblur: 0.004 });
const bloom = new UnrealBloomPass(new THREE.Vector2(texW, texH), 0, 0.6, 0.78);
composer.addPass(renderPass);
composer.addPass(bokeh);
composer.addPass(bloom);
composer.addPass(new OutputPass());

const toneMappings: Record<Look, THREE.ToneMapping> = {
    exact: THREE.NoToneMapping,
    agx: THREE.AgXToneMapping,
    aces: THREE.ACESFilmicToneMapping,
    neutral: THREE.NeutralToneMapping,
};

let stage: Stage | null = null;
let clock = 0;

const load = async (next: 'day' | 'night', nextScene: SceneName = sceneName) => {
    const built = await buildScene(nextScene, palettes[next], (label) => {
        document.title = label;
    });
    stage?.dispose();
    stage = built;
    time = next;
    sceneName = nextScene;
    document.body.dataset.time = next;
    renderPass.scene = built.scene;
    bokeh.scene = built.scene;
    apply();
};

/** the settings that live outside the scene: camera, lens, bloom */
function apply() {
    stage?.apply(settings);
    camera.position.set(settings.tilt * 3, settings.tilt * -0.4, cameraDistance);
    camera.lookAt(0, 0, 0);
    const uniforms = bokeh.uniforms as Record<string, { value: number }>;
    if (uniforms.focus) uniforms.focus.value = cameraDistance + settings.focus * settings.depthStep;
    if (uniforms.aperture) uniforms.aperture.value = settings.hasLens ? settings.aperture / 1000 : 0;
    bloom.strength = time === 'night' ? settings.bloom : settings.bloom * 0.15;
    bloom.threshold = settings.bloomThreshold;
    renderer.toneMapping = toneMappings[settings.look];
    renderer.toneMappingExposure = settings.exposure;
}

const size = (width?: number) => {
    const w = width ?? (isBake ? Number(params.get('w') ?? texW) : Math.min(texW, Math.round(canvas.clientWidth * devicePixelRatio)));
    const h = Math.round((w * 6) / 16);
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    if (isBake) canvas.style.width = `${w}px`;
};

const frame = (t: number) => {
    if (!stage) return;
    const drift = settings.hasCameraDrift ? Math.sin(Math.PI * 2 * t) * 0.9 : 0;
    camera.position.set(settings.tilt * 3 + drift, settings.tilt * -0.4, cameraDistance);
    camera.lookAt(0, 0, 0);
    stage.tick(t, settings);
    composer.render();
};

await load(time);
size();

if (loopFrames > 0) {
    // the loop exporter calls this once per frame and screenshots after the title changes
    Object.assign(window, {
        stageFrame: (index: number) => {
            frame(index / loopFrames);
            document.title = `done frame ${index}`;
        },
    });
    frame(0);
    document.title = 'done frame 0';
} else if (isBake) {
    frame(0);
    document.title = 'done';
} else {
    document.querySelector('#note')?.remove();
    document.title = 'diorama stage';
    let isPlaying = false;
    let started = 0;
    const loop = (now: number) => {
        if (!isPlaying) return;
        clock = ((now - started) / 6000) % 1;
        frame(clock);
        requestAnimationFrame(loop);
    };
    const panel = mountPanel({
        settings,
        time,
        scene: sceneName,
        onScene: (next) => {
            panel.status(`drawing the ${next}…`);
            void load(time, next).then(() => {
                frame(clock);
                panel.status('');
                document.title = 'diorama stage';
            });
        },
        onChange: () => {
            apply();
            save();
            if (!isPlaying) frame(clock);
        },
        onTime: (next) => {
            panel.status(`drawing the ${next}…`);
            void load(next).then(() => {
                frame(clock);
                panel.status('');
                document.title = 'diorama stage';
            });
        },
        // motion is opt-in: a render loop at this size keeps the gpu busy, so still is the default
        onPlay: (isOn) => {
            isPlaying = isOn;
            started = performance.now() - clock * 6000;
            if (isOn) requestAnimationFrame(loop);
        },
        onCopy: async () => {
            const text = JSON.stringify(settings, null, 4);
            try {
                await navigator.clipboard.writeText(text);
                return true;
            } catch {
                console.log(text);
                return false;
            }
        },
        onReset: () => {
            Object.assign(settings, defaults);
            apply();
            save();
            frame(clock);
        },
        onDownload: async () => {
            size(texW);
            frame(clock);
            const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
            size();
            frame(clock);
            if (!blob) return;
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${sceneName}-${time}.png`;
            link.click();
            URL.revokeObjectURL(link.href);
        },
    });
    new ResizeObserver(() => {
        size();
        frame(clock);
    }).observe(canvas);
    frame(0);
}

/** `?set={"look":"agx"}` — a bake with settings other than the defaults, without touching them */
function readOverrides(): Partial<Settings> {
    try {
        return JSON.parse(params.get('set') ?? '{}') as Partial<Settings>;
    } catch {
        return {};
    }
}

function readSaved(): Partial<Settings> {
    try {
        return JSON.parse(localStorage.getItem('diorama-stage') ?? '{}') as Partial<Settings>;
    } catch {
        return {};
    }
}

function save() {
    try {
        localStorage.setItem('diorama-stage', JSON.stringify(settings));
    } catch {
        /* a private window keeps no settings; the stage still works */
    }
}
