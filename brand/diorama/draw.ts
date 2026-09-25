import { mkdirSync, writeFileSync } from 'node:fs';
import type { Palette } from './palette.ts';
import { palettes } from './palette.ts';
import { svg } from './paper.ts';
import { market } from './market.ts';
import { appNames, appSign, signSize } from './signs.ts';
import { tileSize, tourBytes, tourFrame } from './tiles.ts';
import { homestead, valley } from './valley.ts';
import { workshop } from './workshop.ts';

const pieces: readonly Piece[] = [
    { file: 'profile/hero', w: 1600, h: 600, title: 'Pinefold: Oles the t-rex at home by his cabin, the kettle over the fire, Lanternhill on the far hill', draw: homestead },
    { file: 'stash/walk', w: 1600, h: 600, title: 'stash: Oles walks the creek path between his cabin and Lanternhill', draw: valley },
    { file: 'profile/tour-frame', ...tileSize, title: 'frame: the brass lamp on the workbench, Dym curling out of the spout', draw: tourFrame },
    { file: 'profile/tour-bytes', ...tileSize, title: 'bytes: a shop sign and a firefly lantern on a Lanternhill wall', draw: tourBytes },
    { file: 'frame/hero', w: 1600, h: 600, title: 'the workshop: the cabin cut open, one room per section — fleet, machine, chords, mirror, link it', draw: workshop },
    { file: 'bytes/hero', w: 1600, h: 600, title: 'Lanternhill market at midday: five firefly shops, and Oles with a basket on his tail reading the list the wren holds', draw: market },
    ...appNames.map((app) => ({ file: `bytes/sign-${app}`, ...signSize, title: `${app}: its shop sign in Lanternhill`, draw: appSign(app) })),
];

for (const { file, w, h, title, draw } of pieces) {
    const target = new URL(`out/${file}`, import.meta.url);
    mkdirSync(new URL('./', target), { recursive: true });
    writeFileSync(new URL(`out/${file}-light.svg`, import.meta.url), svg(w, h, title, draw(palettes.day)));
    writeFileSync(new URL(`out/${file}-dark.svg`, import.meta.url), svg(w, h, `${title}, at night`, draw(palettes.night)));
}

/* Types */

interface Piece {
    file: string;
    w: number;
    h: number;
    title: string;
    draw: (p: Palette) => string;
}
