import type { SceneName } from './scene.ts';
import { sceneNames } from './scene.ts';
import { looks } from './settings.ts';
import type { ChoiceKey, NumberKey, Settings, ToggleKey } from './settings.ts';

type Row =
    | { kind: 'number'; key: NumberKey; label: string; min: number; max: number; step: number; unit?: string }
    | { kind: 'toggle'; key: ToggleKey; label: string }
    | { kind: 'choice'; key: ChoiceKey; label: string; options: readonly string[] };

const groups: readonly { title: string; rows: readonly Row[] }[] = [
    {
        title: 'look',
        rows: [
            { kind: 'choice', key: 'look', label: 'tone mapping', options: looks },
            { kind: 'number', key: 'exposure', label: 'exposure', min: 0.5, max: 2, step: 0.01 },
        ],
    },
    {
        title: 'light',
        rows: [
            { kind: 'number', key: 'sunAzimuth', label: 'sun direction', min: -80, max: 80, step: 1, unit: '°' },
            { kind: 'number', key: 'sunElevation', label: 'sun height', min: 5, max: 80, step: 1, unit: '°' },
            { kind: 'number', key: 'ambient', label: 'fill light', min: 0.2, max: 0.95, step: 0.01 },
            { kind: 'number', key: 'shadowSoftness', label: 'shadow softness', min: 1, max: 30, step: 1 },
        ],
    },
    {
        title: 'depth and lens',
        rows: [
            { kind: 'number', key: 'depthStep', label: 'sheet spacing', min: 0, max: 0.4, step: 0.005 },
            { kind: 'number', key: 'tilt', label: 'camera tilt', min: -1, max: 1, step: 0.01 },
            { kind: 'toggle', key: 'hasLens', label: 'lens blur' },
            { kind: 'number', key: 'focus', label: 'focus sheet', min: 0, max: 9, step: 0.1 },
            { kind: 'number', key: 'aperture', label: 'blur amount', min: 0, max: 3, step: 0.05 },
        ],
    },
    {
        title: 'atmosphere',
        rows: [
            { kind: 'toggle', key: 'hasHaze', label: 'haze between sheets' },
            { kind: 'number', key: 'haze', label: 'haze density', min: 0, max: 1, step: 0.01 },
            { kind: 'number', key: 'fireLight', label: 'fire light', min: 0, max: 3, step: 0.05 },
            { kind: 'number', key: 'windowLight', label: 'window light', min: 0, max: 3, step: 0.05 },
        ],
    },
    {
        title: 'paper',
        rows: [
            { kind: 'toggle', key: 'hasThickness', label: 'card thickness' },
            { kind: 'number', key: 'thickness', label: 'edge depth', min: 0, max: 1, step: 0.01 },
            { kind: 'toggle', key: 'hasFibre', label: 'paper fibre' },
            { kind: 'number', key: 'fibre', label: 'fibre relief', min: 0, max: 1.5, step: 0.01 },
            { kind: 'number', key: 'grain', label: 'grain', min: 0, max: 1, step: 0.01 },
        ],
    },
    {
        title: 'glow',
        rows: [
            { kind: 'number', key: 'bloom', label: 'bloom', min: 0, max: 2, step: 0.01 },
            { kind: 'number', key: 'bloomThreshold', label: 'bloom threshold', min: 0, max: 1, step: 0.01 },
        ],
    },
    {
        title: 'motion',
        rows: [
            { kind: 'toggle', key: 'hasWind', label: 'wind in the ferns and pines' },
            { kind: 'number', key: 'wind', label: 'wind strength', min: 0, max: 1.5, step: 0.01 },
            { kind: 'toggle', key: 'hasCloudDrift', label: 'drifting clouds' },
            { kind: 'toggle', key: 'hasSmoke', label: 'chimney smoke' },
            { kind: 'toggle', key: 'hasBirds', label: 'birds (day)' },
            { kind: 'toggle', key: 'hasFireflies', label: 'fireflies (night)' },
            { kind: 'toggle', key: 'hasEmbers', label: 'embers (night)' },
            { kind: 'toggle', key: 'hasCameraDrift', label: 'camera drift' },
        ],
    },
];

const sunIcon = '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="4"/><path d="M10 1.5v2.5M10 16v2.5M1.5 10h2.5M16 10h2.5M4 4l1.8 1.8M14.2 14.2 16 16M4 16l1.8-1.8M14.2 5.8 16 4"/></svg>';
const moonIcon = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M15.5 12.5A6.5 6.5 0 0 1 7.5 4.5a6.5 6.5 0 1 0 8 8Z"/></svg>';

const copyIcon = '<svg viewBox="0 0 20 20" aria-hidden="true"><rect x="6.5" y="6.5" width="9" height="10" rx="2"/><path d="M4.5 13V5a1.5 1.5 0 0 1 1.5-1.5h7"/></svg>';
const checkIcon = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="m4.5 10.5 3.5 3.5 7.5-8"/></svg>';

const decimals = (step: number) => (step >= 1 ? 0 : step >= 0.1 ? 1 : step >= 0.01 ? 2 : 3);
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const snap = (value: number, step: number) => Number((Math.round(value / step) * step).toFixed(decimals(step)));

const numberRow = (row: Extract<Row, { kind: 'number' }>, value: number) =>
    `<div class="row num-row"><label for="n-${row.key}">${row.label}<code>${row.key}</code></label><div class="field"><input id="n-${row.key}" class="num" type="text" inputmode="decimal" autocomplete="off" spellcheck="false" value="${value.toFixed(decimals(row.step))}">${row.unit ? `<span class="unit">${row.unit}</span>` : ''}</div><button type="button" class="copy" data-key="${row.key}" aria-label="copy ${row.key}" title="copy «${row.key}: value»">${copyIcon}</button><input id="s-${row.key}" type="range" min="${row.min}" max="${row.max}" step="${row.step}" value="${value}" aria-label="${row.label}"></div>`;

const choiceRow = (row: Extract<Row, { kind: 'choice' }>, value: string) =>
    `<div class="row choice-row"><span id="l-${row.key}">${row.label}<code>${row.key}</code></span><button type="button" class="copy" data-key="${row.key}" aria-label="copy ${row.key}" title="copy «${row.key}: value»">${copyIcon}</button><div class="seg seg-small" role="group" aria-labelledby="l-${row.key}">${row.options.map((o) => `<button type="button" data-choice="${row.key}" data-value="${o}" aria-pressed="${o === value}">${o}</button>`).join('')}</div></div>`;

const toggleRow = (row: Extract<Row, { kind: 'toggle' }>, value: boolean) =>
    `<div class="row switch-row"><span id="l-${row.key}">${row.label}<code>${row.key}</code></span><button type="button" class="copy" data-key="${row.key}" aria-label="copy ${row.key}" title="copy «${row.key}: value»">${copyIcon}</button><button type="button" role="switch" class="switch" id="t-${row.key}" aria-labelledby="l-${row.key}" aria-checked="${value}"><span></span></button></div>`;

export const mountPanel = ({ settings, time, scene, onScene, onChange, onTime, onPlay, onCopy, onReset, onDownload }: PanelSpec) => {
    const panel = document.createElement('aside');
    panel.className = 'panel';
    panel.setAttribute('aria-label', 'stage controls');
    const rows = groups
        .map((group) => `<section><h2>${group.title}</h2>${group.rows.map((row) => (row.kind === 'number' ? numberRow(row, settings[row.key]) : row.kind === 'choice' ? choiceRow(row, settings[row.key]) : toggleRow(row, settings[row.key]))).join('')}</section>`)
        .join('');
    panel.innerHTML = `<header><h1>diorama stage</h1><div class="seg seg-scenes" role="group" aria-label="scene">${sceneNames.map((s) => `<button type="button" data-scene="${s}" aria-pressed="${s === scene}">${s}</button>`).join('')}</div><div class="seg" role="group" aria-label="time of day"><button type="button" id="time-day" aria-pressed="${time === 'day'}">${sunIcon}day</button><button type="button" id="time-night" aria-pressed="${time === 'night'}">${moonIcon}night</button></div></header>
<div class="scroll">${rows}<section><h2>play</h2><div class="row switch-row"><span id="l-play">play motion</span><span></span><button type="button" role="switch" class="switch" id="t-play" aria-labelledby="l-play" aria-checked="false"><span></span></button></div></section></div>
<footer><button type="button" id="copy">copy all settings</button><button type="button" id="reset">reset</button><button type="button" id="download" class="primary">download 2× png</button></footer>
<p class="status" role="status" id="status"></p>`;
    document.body.append(panel);

    const status = (text: string) => {
        const el = panel.querySelector('#status');
        if (el) el.textContent = text;
    };

    /** show a setting's current value in every control that carries it */
    const sync = (row: Row) => {
        if (row.kind === 'number') {
            const field = panel.querySelector<HTMLInputElement>(`#n-${row.key}`);
            const range = panel.querySelector<HTMLInputElement>(`#s-${row.key}`);
            if (field && document.activeElement !== field) field.value = settings[row.key].toFixed(decimals(row.step));
            if (range) range.value = String(settings[row.key]);
            field?.classList.remove('invalid');
        } else if (row.kind === 'choice')
            panel.querySelectorAll<HTMLButtonElement>(`[data-choice="${row.key}"]`).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.value === settings[row.key])));
        else panel.querySelector(`#t-${row.key}`)?.setAttribute('aria-checked', String(settings[row.key]));
    };

    for (const group of groups)
        for (const row of group.rows) {
            if (row.kind === 'number') {
                const field = panel.querySelector<HTMLInputElement>(`#n-${row.key}`);
                const range = panel.querySelector<HTMLInputElement>(`#s-${row.key}`);
                if (!field || !range) continue;
                let committed = settings[row.key];
                const set = (value: number) => {
                    settings[row.key] = clamp(value, row.min, row.max);
                    range.value = String(settings[row.key]);
                    onChange();
                };
                const commit = () => {
                    committed = settings[row.key];
                    field.value = committed.toFixed(decimals(row.step));
                    field.classList.remove('invalid');
                };
                range.addEventListener('input', () => {
                    set(Number(range.value));
                    commit();
                });
                field.addEventListener('input', () => {
                    const value = Number(field.value.replace(',', '.').trim());
                    const isValid = field.value.trim() !== '' && Number.isFinite(value);
                    field.classList.toggle('invalid', !isValid || value < row.min || value > row.max);
                    if (isValid) set(value);
                });
                field.addEventListener('blur', commit);
                field.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') commit();
                    if (e.key === 'Escape') {
                        set(committed);
                        commit();
                    }
                    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                        e.preventDefault();
                        const factor = e.shiftKey ? 10 : e.altKey ? 0.1 : 1;
                        set(snap(settings[row.key] + (e.key === 'ArrowUp' ? 1 : -1) * row.step * factor, Math.min(row.step, row.step * factor)));
                        commit();
                        field.select();
                    }
                });
                field.addEventListener('focus', () => field.select());
            } else if (row.kind === 'choice') {
                panel.querySelectorAll<HTMLButtonElement>(`[data-choice="${row.key}"]`).forEach((b) =>
                    b.addEventListener('click', () => {
                        settings.look = (looks.find((l) => l === b.dataset.value) ?? 'exact');
                        sync(row);
                        onChange();
                    }),
                );
            } else {
                const button = panel.querySelector<HTMLButtonElement>(`#t-${row.key}`);
                button?.addEventListener('click', () => {
                    settings[row.key] = !settings[row.key];
                    sync(row);
                    onChange();
                });
            }
        }

    panel.querySelectorAll<HTMLButtonElement>('.copy').forEach((button) =>
        button.addEventListener('click', async () => {
            const key = button.dataset.key as keyof Settings;
            const line = `${key}: ${settings[key]}`;
            try {
                await navigator.clipboard.writeText(line);
                status(`copied «${line}»`);
            } catch {
                status(`copy refused — ${line}`);
            }
            button.innerHTML = checkIcon;
            button.classList.add('done');
            setTimeout(() => {
                button.innerHTML = copyIcon;
                button.classList.remove('done');
            }, 1200);
        }),
    );

    const play = panel.querySelector<HTMLButtonElement>('#t-play');
    play?.addEventListener('click', () => {
        const isOn = play.getAttribute('aria-checked') !== 'true';
        play.setAttribute('aria-checked', String(isOn));
        onPlay(isOn);
    });
    panel.querySelectorAll<HTMLButtonElement>('[data-scene]').forEach((b) =>
        b.addEventListener('click', () => {
            const next = sceneNames.find((s) => s === b.dataset.scene);
            if (!next) return;
            panel.querySelectorAll('[data-scene]').forEach((o) => o.setAttribute('aria-pressed', String(o === b)));
            onScene(next);
        }),
    );
    for (const next of ['day', 'night'] as const)
        panel.querySelector(`#time-${next}`)?.addEventListener('click', () => {
            panel.querySelectorAll('[id^="time-"]').forEach((b) => b.setAttribute('aria-pressed', String(b.id === `time-${next}`)));
            onTime(next);
        });
    panel.querySelector('#copy')?.addEventListener('click', async () => {
        status((await onCopy()) ? 'all settings copied' : 'copy refused: settings printed to the console');
    });
    panel.querySelector('#reset')?.addEventListener('click', () => {
        onReset();
        for (const group of groups) for (const row of group.rows) sync(row);
        status('back to defaults');
    });
    panel.querySelector('#download')?.addEventListener('click', () => {
        status('rendering 3200 × 1200…');
        void onDownload().then(() => status('png saved'));
    });

    return { status };
};

/* Types */

interface PanelSpec {
    settings: Settings;
    time: 'day' | 'night';
    scene: SceneName;
    onScene: (scene: SceneName) => void;
    onChange: () => void;
    onTime: (time: 'day' | 'night') => void;
    onPlay: (isOn: boolean) => void;
    onCopy: () => Promise<boolean>;
    onReset: () => void;
    onDownload: () => Promise<void>;
}
