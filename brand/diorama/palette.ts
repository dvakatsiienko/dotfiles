const day = {
    isNight: false,
    sky: ['#86BDE6', '#B9DAF0', '#E4F1F7'],
    sun: { disc: '#F8CF66', core: '#FBE3A0', ray: '#F3B545' },
    cloud: { face: '#FFFFFF', shade: '#DCE9F2' },
    mountain: ['#BCD3DE', '#A7C5CF'],
    ridge: { far: '#93B8AE', pines: '#7FA997' },
    hill: { back: '#A6CB84', mid: '#95C074', front: '#86B566', edge: '#77A85A' },
    creek: { water: '#7CC3D6', shine: '#D2EEF4', bank: '#6E9E55' },
    path: { dirt: '#E4CFA3', edge: '#CDB184', pebble: '#F3E6C8' },
    pine: { body: '#3E6B57', dark: '#2F5646', lit: '#56836B', trunk: '#6A4A38' },
    cabin: { log: '#A06A48', logLit: '#B98059', logEnd: '#E0B98B', ring: '#B88A5E', roof: '#5E7189', roofLit: '#7488A0', stone: '#A9A49C', door: '#6E4630', window: '#CDE7F2', frame: '#F3EAD7', smoke: '#FFFFFF' },
    town: { wall: '#F2E6CF', wallShade: '#DCCDB1', roof: '#5E7189', roofAlt: '#8B7BB3', window: '#6B7F96', flag: '#E07A5F', hill: '#9DBF86' },
    bridge: { plank: '#B98059', rail: '#8A5A3B' },
    stone: { face: '#B7B3AA', lit: '#D3CFC6' },
    flora: { coral: '#E27D60', marigold: '#F2B134', lapis: '#4E7FB8', lilac: '#9C8CE0', cream: '#F7F1E6', leaf: '#5E9A5A', leafLit: '#86BC6E', stem: '#4F8450', grass: '#6FA656' },
    dino: { hide: '#C8553D', lit: '#D9694F', shade: '#A5432F', belly: '#EDB38E', spot: '#9E3F2C', eye: '#2A2230', scarf: '#3F6FB0', scarfStripe: '#F2EBDD', claw: '#F3E6C8' },
    wren: { body: '#9A6B4B', wing: '#7B5139', belly: '#E9D2B0' },
    room: { wall: '#DCE7EF', wallShade: '#C7D6E2', trim: '#F4F0E6', floor: '#B58A63', floorShade: '#9C7453' },
    brass: { base: '#D9A441', lit: '#F2CD72', shade: '#A57828', gem: '#4E7FB8' },
    iron: '#34405A',
    stoneWall: { face: '#D6DCE6', joint: '#B9C2D1', lit: '#E6EAF0' },
    magic: { smoke: '#B3A6EE', core: '#DCD4FF', ink: '#4B3F8F' },
    glow: '#FFD978',
    shadow: { color: '#1E3246', opacity: 0.22 },
};

type Palette = typeof day;

const night: Palette = {
    isNight: true,
    sky: ['#141934', '#232A55', '#39417A'],
    sun: { disc: '#EFE9CE', core: '#F8F4E2', ray: '#DAD2B0' },
    cloud: { face: '#2F3668', shade: '#262C58' },
    mountain: ['#2F3860', '#283154'],
    ridge: { far: '#243049', pines: '#1D2940' },
    hill: { back: '#233A45', mid: '#1F3540', front: '#1B3039', edge: '#172A32' },
    creek: { water: '#35527F', shine: '#8FB3E0', bank: '#1A2F36' },
    path: { dirt: '#4F506A', edge: '#3C3D55', pebble: '#6A6A86' },
    pine: { body: '#17292E', dark: '#101E23', lit: '#22393F', trunk: '#231A1A' },
    cabin: { log: '#4A3431', logLit: '#5B403A', logEnd: '#7A5F52', ring: '#5E4A40', roof: '#2B3450', roofLit: '#37415F', stone: '#4A4B58', door: '#2E2020', window: '#FFC766', frame: '#8F7F6A', smoke: '#9AA3C8' },
    town: { wall: '#4D4E6C', wallShade: '#3E3F5A', roof: '#2B3450', roofAlt: '#473E6E', window: '#FFD27A', flag: '#9A5A55', hill: '#223743' },
    bridge: { plank: '#5B403A', rail: '#3F2D29' },
    stone: { face: '#44475A', lit: '#5A5E74' },
    flora: { coral: '#A2584B', marigold: '#B58A3E', lapis: '#3D5E8F', lilac: '#7465AE', cream: '#8A87A0', leaf: '#284A3E', leafLit: '#34604C', stem: '#223F36', grass: '#274639' },
    dino: { hide: '#7A3A33', lit: '#8E463C', shade: '#5E2C28', belly: '#9C6A5C', spot: '#5A2A26', eye: '#1A1520', scarf: '#35568C', scarfStripe: '#A8A4B8', claw: '#A8A08E' },
    wren: { body: '#5A4238', wing: '#46332B', belly: '#8E7E6E' },
    room: { wall: '#262D52', wallShade: '#1F2545', trim: '#6F6A86', floor: '#4A3530', floorShade: '#3A2A27' },
    brass: { base: '#C8963E', lit: '#F4D27E', shade: '#7E5A22', gem: '#6D93D6' },
    iron: '#4B5379',
    stoneWall: { face: '#3A4064', joint: '#2C3150', lit: '#474E78' },
    magic: { smoke: '#9C8CF0', core: '#E4DDFF', ink: '#2A2260' },
    glow: '#FFD978',
    shadow: { color: '#05070F', opacity: 0.5 },
};

export const palettes = { day, night } as const;

/* Types */

export type { Palette };
