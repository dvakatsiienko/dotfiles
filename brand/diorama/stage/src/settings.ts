/** the light, lens and effects a bake uses; the panel starts here, «copy settings» prints a new set to paste back */
export const defaults = {
    sunAzimuth: 26,
    sunElevation: 31,
    ambient: 0.6,
    shadowSoftness: 14,
    depthStep: 0.12,
    tilt: 0,
    focus: 2.4,
    aperture: 0.35,
    haze: 0.25,
    fireLight: 0.2,
    windowLight: 1,
    thickness: 0.6,
    fibre: 0.4,
    grain: 1,
    bloom: 0.01,
    bloomThreshold: 0.78,
    wind: 0.5,
    hasWind: true,
    hasCloudDrift: true,
    hasFireflies: true,
    hasSmoke: true,
    hasThickness: true,
    hasFibre: true,
    hasHaze: true,
    hasLens: true,
    hasBirds: true,
    hasEmbers: true,
    hasCameraDrift: false,
    look: 'exact' as Look,
    exposure: 1,
};

export const looks = ['exact', 'agx', 'aces', 'neutral'] as const;
export type Look = (typeof looks)[number];

export type Settings = typeof defaults;
export type NumberKey = { [K in keyof Settings]: Settings[K] extends number ? K : never }[keyof Settings];
export type ToggleKey = { [K in keyof Settings]: Settings[K] extends boolean ? K : never }[keyof Settings];
export type ChoiceKey = { [K in keyof Settings]: Settings[K] extends string ? K : never }[keyof Settings];
