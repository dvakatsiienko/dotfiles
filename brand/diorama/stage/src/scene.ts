import * as THREE from 'three';
import { marketLayers } from '../../market.ts';
import type { Palette } from '../../palette.ts';
import type { Layer } from '../../paper.ts';
import { homesteadLayers } from '../../valley.ts';
import { birds, embers, fireGlow, fireflies, smoke, windowLight } from './motion.ts';
import type { Settings } from './settings.ts';
import { fibreNormals, loadSheet, paperTexture } from './sheets.ts';

export const cameraDistance = 20;

/** what moves in a scene and what lights it, beyond its paper sheets; objects are built at z 0 and placed by `apply` */
interface Extras {
    objects: THREE.Object3D[];
    apply: (settings: Settings) => void;
    tick: (t: number, settings: Settings) => void;
}

interface SceneSpec {
    layers: (p: Palette) => readonly Layer[];
    /** sheet name → how the wind moves it: `rooted` bends more toward the top, `hanging` bobs evenly */
    wind: Record<string, { mode: 'rooted' | 'hanging'; strength: number }>;
    extras: (p: Palette) => Extras;
}

const homestead: SceneSpec = {
    layers: (p) => homesteadLayers(p, { hasFireflies: false, hasSmoke: false, hasGlow: false }),
    wind: { foreground: { mode: 'rooted', strength: 1 }, edge: { mode: 'rooted', strength: 0.35 } },
    extras: (p) => {
        const flies = fireflies(40, 0.012);
        const fire = fireGlow(790, 486, 0);
        const chimney = smoke(594, 272, 0, p.isNight);
        const lamp = windowLight(583, 410, 0);
        const sparks = embers(790, 486, 0);
        const flock = birds(0);
        const townLight = windowLight(1140, 250, 0);
        return {
            objects: [flies.object, fire.object, chimney.object, lamp.object, sparks.object, flock.object, townLight.object],
            apply: (settings) => {
                const yard = -2.4 * settings.depthStep;
                fire.object.position.z = yard;
                chimney.object.position.z = yard + 0.004;
                lamp.object.position.z = yard;
                sparks.object.position.z = yard + 0.006;
                flock.object.position.z = -8.4 * settings.depthStep;
                townLight.object.position.z = -6 * settings.depthStep;
                flies.object.visible = p.isNight && settings.hasFireflies;
                chimney.object.visible = settings.hasSmoke;
                fire.object.visible = p.isNight;
                sparks.object.visible = p.isNight && settings.hasEmbers;
                flock.object.visible = !p.isNight && settings.hasBirds;
                lamp.update(p.isNight ? settings.windowLight : 0);
                townLight.update(p.isNight ? settings.windowLight * 1.4 : 0);
            },
            tick: (t, settings) => {
                flies.update(t);
                fire.update(t, settings.fireLight);
                chimney.update(t);
                sparks.update(t);
                flock.update(t);
            },
        };
    },
};

const market: SceneSpec = {
    layers: (p) => marketLayers(p, { hasFireflies: false }),
    wind: { bunting: { mode: 'hanging', strength: 1 } },
    extras: (p) => {
        const flies = fireflies(30, 0.012);
        const street = windowLight(1296, 300, 0);
        const shopLights = [140, 384, 628, 872, 1116].map((x) => windowLight(x, 330, 0));
        const flock = birds(0);
        return {
            objects: [flies.object, street.object, flock.object, ...shopLights.map((l) => l.object)],
            apply: (settings) => {
                street.object.position.z = -1.4 * settings.depthStep;
                for (const light of shopLights) light.object.position.z = -2.6 * settings.depthStep;
                flock.object.position.z = -8.4 * settings.depthStep;
                flies.object.visible = p.isNight && settings.hasFireflies;
                flock.object.visible = !p.isNight && settings.hasBirds;
                street.update(p.isNight ? settings.windowLight * 1.2 : 0);
                for (const light of shopLights) light.update(p.isNight ? settings.windowLight * 0.6 : 0);
            },
            tick: (t) => {
                flies.update(t);
                flock.update(t);
            },
        };
    },
};

export const scenes = { homestead, market } as const;
export const sceneNames = ['homestead', 'market'] as const satisfies readonly (keyof typeof scenes)[];
export type SceneName = (typeof sceneNames)[number];

const unlit = new Set(['sky']);
const noShadowOnto = new Set(['sky', 'mountains', 'foreground']);

/** bend a sheet in the vertex shader; t loops over [0, 1) */
const addWind = (material: THREE.Material, uniforms: WindUniforms, mode: 'rooted' | 'hanging') => {
    const move =
        mode === 'rooted'
            ? `float lift = max(position.y + 3.0, 0.0);
               transformed.x += (sin(6.2831853 * uTime + position.x * 0.9) * 0.6 + sin(12.5663706 * uTime + position.x * 2.3) * 0.4) * uWind * lift * lift * 0.012;`
            : `transformed.y += sin(6.2831853 * uTime * 2.0 + position.x * 1.7) * uWind * 0.025;
               transformed.x += sin(6.2831853 * uTime + position.x * 0.6) * uWind * 0.012;`;
    material.onBeforeCompile = (shader) => {
        Object.assign(shader.uniforms, uniforms);
        shader.vertexShader = `uniform float uTime;\nuniform float uWind;\n${shader.vertexShader}`.replace('#include <begin_vertex>', `#include <begin_vertex>\n${move}`);
    };
};

/** one scene for one time of day: paper sheets, their cut edges, the lights and the moving bits */
export const buildScene = async (name: SceneName, p: Palette, onProgress: (label: string) => void) => {
    const spec = scenes[name];
    const scene = new THREE.Scene();
    const sun = new THREE.DirectionalLight(p.isNight ? 0xc9d3ff : 0xffffff, 1);
    sun.castShadow = true;
    sun.shadow.mapSize.set(4096, 4096);
    Object.assign(sun.shadow.camera, { left: -10, right: 10, top: 5, bottom: -5, near: 1, far: 60 });
    sun.shadow.blurSamples = 24;
    sun.shadow.bias = -0.0004;
    const ambient = new THREE.AmbientLight(0xffffff, 1);
    scene.add(sun, ambient);

    const normals = fibreNormals();
    const sheets: Sheet[] = [];
    for (const layer of spec.layers(p)) {
        onProgress(`sheet ${layer.name}`);
        const map = await loadSheet(p, layer);
        const material = new THREE.MeshLambertMaterial({ map, transparent: true, alphaTest: 0.04, normalMap: unlit.has(layer.name) ? null : normals });
        const wind = spec.wind[layer.name];
        const mesh = new THREE.Mesh(wind ? new THREE.PlaneGeometry(16, 6, 96, 36) : new THREE.PlaneGeometry(16, 6), material);
        mesh.castShadow = !unlit.has(layer.name);
        mesh.receiveShadow = !noShadowOnto.has(layer.name);
        mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map, alphaTest: 0.5 });
        // the cut edge: the same silhouette in a dark card tone, one step behind and down-right
        const edge = new THREE.Mesh(mesh.geometry, new THREE.MeshBasicMaterial({ map, color: p.isNight ? 0x0b0d1c : 0x4a3a30, transparent: true, alphaTest: 0.5, fog: false }));
        const uniforms: WindUniforms = { uTime: { value: 0 }, uWind: { value: 0 } };
        if (wind) {
            addWind(material, uniforms, wind.mode);
            addWind(edge.material, uniforms, wind.mode);
        }
        scene.add(edge, mesh);
        sheets.push({ name: layer.name, mesh, edge, depth: layer.depth, material, bend: wind?.strength ?? 0, uniforms });
    }

    const paper = new THREE.Mesh(new THREE.PlaneGeometry(16, 6), new THREE.MeshBasicMaterial({ map: paperTexture(p.isNight), transparent: true, depthWrite: false, fog: false }));
    paper.position.z = 0.03;
    scene.add(paper);

    const extras = spec.extras(p);
    scene.add(...extras.objects);
    const sky = new THREE.Color(p.sky[2]);

    /** push the settings into this scene */
    const apply = (settings: Settings) => {
        const overscan = 1 + Math.abs(settings.tilt) * 0.12 + (settings.hasCameraDrift ? 0.08 : 0);
        for (const { mesh, edge, depth, material } of sheets) {
            const z = -depth * settings.depthStep;
            const scale = ((cameraDistance - z) / cameraDistance) * overscan;
            mesh.position.set(0, 0, z);
            mesh.scale.setScalar(scale);
            const cut = settings.hasThickness ? 0.006 + settings.thickness * 0.022 : 0;
            edge.position.set(cut, -cut, z - 0.002);
            edge.scale.setScalar(scale);
            edge.visible = settings.hasThickness && mesh.castShadow && depth < 7;
            material.normalScale.setScalar(settings.hasFibre ? settings.fibre : 0);
        }
        const az = (settings.sunAzimuth * Math.PI) / 180;
        const el = (settings.sunElevation * Math.PI) / 180;
        const dir = new THREE.Vector3(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el));
        sun.position.copy(dir).multiplyScalar(20);
        // a lit spot shows its map exactly: (ambient + sun · cosθ) / π = 1; a shadow keeps the ambient share
        const share = p.isNight ? settings.ambient - 0.1 : settings.ambient;
        ambient.intensity = Math.PI * share;
        sun.intensity = (Math.PI * (1 - share)) / Math.max(0.2, dir.z);
        sun.shadow.radius = settings.shadowSoftness;
        scene.fog = settings.hasHaze ? new THREE.Fog(sky, cameraDistance - 0.1, cameraDistance + 1.2 + (1 - settings.haze) * 8) : null;
        paper.material.opacity = settings.grain;
        extras.apply(settings);
    };

    const tick = (t: number, settings: Settings) => {
        for (const sheet of sheets) {
            sheet.uniforms.uTime.value = t;
            sheet.uniforms.uWind.value = settings.hasWind ? settings.wind * sheet.bend : 0;
            if (sheet.name === 'clouds') {
                const drift = settings.hasCloudDrift ? Math.sin(Math.PI * 2 * t) * 0.35 : 0;
                sheet.mesh.position.x = drift;
                sheet.edge.position.x = drift;
            }
        }
        extras.tick(t, settings);
    };

    const dispose = () =>
        scene.traverse((object) => {
            if (object instanceof THREE.Mesh || object instanceof THREE.Sprite || object instanceof THREE.Points) {
                object.geometry.dispose();
                const materials = Array.isArray(object.material) ? object.material : [object.material];
                for (const m of materials) {
                    for (const value of Object.values(m)) if (value instanceof THREE.Texture) value.dispose();
                    m.dispose();
                }
            }
        });

    return { scene, apply, tick, dispose };
};

export type Stage = Awaited<ReturnType<typeof buildScene>>;

interface WindUniforms {
    uTime: { value: number };
    uWind: { value: number };
}

interface Sheet {
    name: string;
    mesh: THREE.Mesh;
    edge: THREE.Mesh;
    depth: number;
    material: THREE.MeshLambertMaterial;
    bend: number;
    uniforms: WindUniforms;
}
