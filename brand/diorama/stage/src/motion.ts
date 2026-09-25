import * as THREE from 'three';

/* everything that moves repeats over t ∈ [0, 1) with whole-number frequencies, so frame 0 follows the last frame seamlessly */

const tau = Math.PI * 2;

/** svg pixels (1600 × 600) to world units on the plane at z = 0 */
export const toWorld = (x: number, y: number) => new THREE.Vector2((x / 1600 - 0.5) * 16, (0.5 - y / 600) * 6);

const glowSprite = (inner: string, outer: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const g = canvas.getContext('2d');
    if (!g) throw new Error('no 2d context');
    const gradient = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, inner);
    gradient.addColorStop(0.25, outer);
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gradient;
    g.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(canvas);
};

export const fireflies = (count: number, z: number) => {
    let seed = 23;
    const rand = () => {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        return seed / 2 ** 32;
    };
    const flies = Array.from({ length: count }, () => ({
        base: toWorld(120 + rand() * 1380, 330 + rand() * 230),
        phase: [rand(), rand(), rand()] as const,
        reach: 0.05 + rand() * 0.1,
    }));
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const positionAttr = new THREE.BufferAttribute(positions, 3);
    const colorAttr = new THREE.BufferAttribute(colors, 3);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', positionAttr);
    geometry.setAttribute('color', colorAttr);
    const material = new THREE.PointsMaterial({ size: 0.8, map: glowSprite('rgba(255,250,215,1)', 'rgba(255,217,120,.55)'), vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    const points = new THREE.Points(geometry, material);
    const update = (t: number) => {
        flies.forEach(({ base, phase, reach }, i) => {
            positions[i * 3] = base.x + Math.sin(tau * (t + phase[0])) * reach;
            positions[i * 3 + 1] = base.y + Math.sin(tau * (2 * t + phase[1])) * reach * 0.5;
            positions[i * 3 + 2] = z;
            const pulse = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(tau * (t + phase[2])));
            colors[i * 3] = pulse;
            colors[i * 3 + 1] = pulse * 0.92;
            colors[i * 3 + 2] = pulse * 0.6;
        });
        positionAttr.needsUpdate = true;
        colorAttr.needsUpdate = true;
    };
    update(0);
    return { object: points, update };
};

/** a warm light and a glow that breathe over the fire */
export const fireGlow = (x: number, y: number, z: number) => {
    const at = toWorld(x, y);
    const light = new THREE.PointLight(0xffa04a, 0, 3.2, 1.6);
    light.position.set(at.x, at.y, z + 0.3);
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowSprite('rgba(255,210,120,.9)', 'rgba(242,140,60,.35)'), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    glow.position.set(at.x, at.y + 0.1, z + 0.02);
    const group = new THREE.Group();
    group.add(light, glow);
    const update = (t: number, strength: number) => {
        const flicker = 0.82 + 0.1 * Math.sin(tau * 3 * t) + 0.06 * Math.sin(tau * 7 * t + 1.3) + 0.04 * Math.sin(tau * 11 * t + 0.4);
        light.intensity = 2.5 * strength * flicker;
        glow.scale.setScalar(0.5 * flicker);
        glow.material.opacity = 0.4 * flicker;
    };
    update(0, 1);
    return { object: group, update };
};

/** puffs that rise from the chimney, swell and fade; each puff restarts where the one before it began */
export const smoke = (x: number, y: number, z: number, isNight: boolean) => {
    const at = toWorld(x, y);
    const map = glowSprite(isNight ? 'rgba(154,163,200,.8)' : 'rgba(255,255,255,.95)', isNight ? 'rgba(154,163,200,.45)' : 'rgba(255,255,255,.6)');
    const puffs = Array.from({ length: 5 }, () => new THREE.Sprite(new THREE.SpriteMaterial({ map, transparent: true, depthWrite: false })));
    const group = new THREE.Group();
    group.add(...puffs);
    const update = (t: number) => {
        puffs.forEach((puff, i) => {
            const age = (t * 2 + i / puffs.length) % 1;
            puff.position.set(at.x + Math.sin(tau * age) * 0.08 + age * 0.35, at.y + age * 1.1, z);
            puff.scale.setScalar(0.12 + age * 0.34);
            puff.material.opacity = (isNight ? 0.4 : 0.75) * Math.sin(Math.PI * age);
        });
    };
    update(0);
    return { object: group, update };
};

/** a warm light that sits in a window and spills onto the yard */
export const windowLight = (x: number, y: number, z: number) => {
    const at = toWorld(x, y);
    const light = new THREE.PointLight(0xffc766, 0, 2.6, 1.8);
    light.position.set(at.x, at.y, z + 0.25);
    return { object: light, update: (strength: number) => void (light.intensity = 1.6 * strength) };
};

/** sparks that lift off the fire, drift and die out */
export const embers = (x: number, y: number, z: number) => {
    const at = toWorld(x, y);
    const map = glowSprite('rgba(255,236,190,1)', 'rgba(255,150,60,.7)');
    const sparks = Array.from({ length: 12 }, (_, i) => ({ sprite: new THREE.Sprite(new THREE.SpriteMaterial({ map, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })), phase: i / 12, sway: ((i * 7) % 5) / 5 - 0.5 }));
    const group = new THREE.Group();
    group.add(...sparks.map((s) => s.sprite));
    const update = (t: number) => {
        for (const { sprite, phase, sway } of sparks) {
            const age = (t * 3 + phase) % 1;
            sprite.position.set(at.x + sway * 0.25 * age + Math.sin(tau * (age * 2 + phase)) * 0.04, at.y + 0.1 + age * 0.9, z);
            sprite.scale.setScalar(0.05 * (1 - age * 0.6));
            sprite.material.opacity = Math.sin(Math.PI * age) * 0.95;
        }
    };
    update(0);
    return { object: group, update };
};

const birdSprite = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 32;
    const g = canvas.getContext('2d');
    if (!g) throw new Error('no 2d context');
    g.strokeStyle = '#2f4a45';
    g.lineWidth = 4;
    g.lineCap = 'round';
    g.beginPath();
    g.moveTo(6, 10);
    g.quadraticCurveTo(20, 4, 32, 20);
    g.quadraticCurveTo(44, 4, 58, 10);
    g.stroke();
    return new THREE.CanvasTexture(canvas);
};

/** a small flock crossing the day sky; each bird leaves the right edge as it re-enters the left, so the loop holds */
export const birds = (z: number) => {
    const map = birdSprite();
    const flock = [
        { lane: 1.9, phase: 0, size: 0.16 },
        { lane: 2.05, phase: 0.04, size: 0.12 },
        { lane: 1.75, phase: 0.07, size: 0.13 },
    ].map((b) => ({ ...b, sprite: new THREE.Sprite(new THREE.SpriteMaterial({ map, transparent: true, depthWrite: false, opacity: 0.7 })) }));
    const group = new THREE.Group();
    group.add(...flock.map((b) => b.sprite));
    const update = (t: number) => {
        for (const { sprite, lane, phase, size } of flock) {
            const x = -9.5 + ((t + phase) % 1) * 19;
            sprite.position.set(x, lane + Math.sin(tau * (t * 2 + phase)) * 0.08, z);
            const flap = 0.55 + 0.45 * Math.abs(Math.sin(tau * (t * 12 + phase * 5)));
            sprite.scale.set(size * 2, size * flap, 1);
        }
    };
    update(0);
    return { object: group, update };
};
