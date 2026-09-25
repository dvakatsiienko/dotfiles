import * as THREE from 'three';
import type { Palette } from '../../palette.ts';
import { svg } from '../../paper.ts';
import type { Layer } from '../../paper.ts';
import { sheetSvg } from '../../valley.ts';

export const texW = 3200;
export const texH = 1200;

/** one scene layer as a texture: the same svg the node generator writes, drawn at 2× */
export const loadSheet = (p: Palette, layer: Layer) =>
    new Promise<THREE.CanvasTexture>((resolve, reject) => {
        const url = URL.createObjectURL(new Blob([svg(1600, 600, layer.name, sheetSvg(p, layer))], { type: 'image/svg+xml' }));
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = texW;
            canvas.height = texH;
            canvas.getContext('2d')?.drawImage(img, 0, 0, texW, texH);
            URL.revokeObjectURL(url);
            const texture = new THREE.CanvasTexture(canvas);
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.anisotropy = 8;
            resolve(texture);
        };
        img.onerror = () => reject(new Error(`sheet ${layer.name} did not load`));
        img.src = url;
    });

/** fine fibre noise and a soft vignette on one transparent sheet */
export const paperTexture = (isNight: boolean) => {
    const canvas = document.createElement('canvas');
    canvas.width = texW;
    canvas.height = texH;
    const g = canvas.getContext('2d');
    if (!g) throw new Error('no 2d context');
    const noise = g.createImageData(texW, texH);
    let seed = 7;
    const rand = () => {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        return seed / 2 ** 32;
    };
    for (let i = 0; i < noise.data.length; i += 4) {
        const v = rand() < 0.5 ? 0 : 255;
        noise.data[i] = v;
        noise.data[i + 1] = v;
        noise.data[i + 2] = v;
        noise.data[i + 3] = rand() * (isNight ? 10 : 14);
    }
    g.putImageData(noise, 0, 0);
    for (let i = 0; i < 900; i++) {
        g.strokeStyle = `rgba(80,60,40,${0.03 + rand() * 0.04})`;
        const x = rand() * texW;
        const y = rand() * texH;
        const a = rand() * Math.PI;
        g.beginPath();
        g.moveTo(x, y);
        g.quadraticCurveTo(x + 10, y + 6, x + Math.cos(a) * 26, y + Math.sin(a) * 26);
        g.stroke();
    }
    const vignette = g.createRadialGradient(texW / 2, texH * 0.45, texH * 0.35, texW / 2, texH / 2, texW * 0.62);
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, isNight ? 'rgba(4,6,20,.42)' : 'rgba(30,50,70,.16)');
    g.fillStyle = vignette;
    g.fillRect(0, 0, texW, texH);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
};

/** a paper-fibre normal map: soft noise heights turned into normals, tiled across every sheet */
export const fibreNormals = () => {
    const size = 512;
    const heights = new Float32Array(size * size);
    let seed = 11;
    const rand = () => {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        return seed / 2 ** 32;
    };
    for (let i = 0; i < heights.length; i++) heights[i] = rand();
    for (let pass = 0; pass < 2; pass++)
        for (let y = 0; y < size; y++)
            for (let x = 0; x < size; x++) {
                const at = (dx: number, dy: number) => heights[((y + dy + size) % size) * size + ((x + dx + size) % size)] ?? 0;
                heights[y * size + x] = (at(0, 0) * 2 + at(1, 0) + at(-1, 0) + at(0, 1) * 0.5 + at(0, -1) * 0.5) / 5;
            }
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const g = canvas.getContext('2d');
    if (!g) throw new Error('no 2d context');
    const image = g.createImageData(size, size);
    for (let y = 0; y < size; y++)
        for (let x = 0; x < size; x++) {
            const h = (dx: number, dy: number) => heights[((y + dy + size) % size) * size + ((x + dx + size) % size)] ?? 0;
            const nx = (h(-1, 0) - h(1, 0)) * 4;
            const ny = (h(0, -1) - h(0, 1)) * 4;
            const len = Math.hypot(nx, ny, 1);
            const i = (y * size + x) * 4;
            image.data[i] = ((nx / len) * 0.5 + 0.5) * 255;
            image.data[i + 1] = ((ny / len) * 0.5 + 0.5) * 255;
            image.data[i + 2] = ((1 / len) * 0.5 + 0.5) * 255;
            image.data[i + 3] = 255;
        }
    g.putImageData(image, 0, 0);
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(12, 4.5);
    return texture;
};
