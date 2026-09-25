import { oles } from './dino.ts';
import { rex } from './rex.ts';

/** which Oles the scenes draw: `rex` is v1's t-rex polished (dima's pick), `clean` is the v2 rig kept in dino.ts */
const models = { clean: oles, rex } as const;

export const dino = models.rex;
