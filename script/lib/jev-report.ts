/**
 * ? jev report — one block per flow, the shape dima approved (2026-09-21): glyph + window in the
 * ? header, fixed sub-labels one fact each, then a session line and a health line. pure: the files
 * ? are read by `script/jev-report.ts`, this renders.
 */

/* Core */
import { appendFileSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { Registry, Verdict } from './jev-vet.ts';
/* Instruments */
import { VET_DIR, cleanDays } from './jev-vet.ts';

const RUNS_LOG = join(VET_DIR, 'runs.log');
// a pick inside the band is a near-miss: neither confident nor rejected (verdictBand's numbers)
const BAND = { high: 0.7, low: 0.3 } as const;

/** every jev caller appends one line per run: `ts · flow · items · tokens · picks` */
export const runsLog = (
    flow: string,
    items: number,
    tokens: number,
    picks: Pick[],
) =>
    appendFileSync(
        RUNS_LOG,
        `${new Date().toISOString()}\t${flow}\t${items}\t${tokens}\t${picks.map((p) => `${p.name}:${p.conf.toFixed(2)}`).join(',') || '-'}\n`,
    );

const dayOf = (line: string) => line.slice(0, 10);

export const runsRead = (today: string, path = RUNS_LOG): Run[] =>
    (existsSync(path) ? readFileSync(path, 'utf8') : '')
        .split('\n')
        .filter((l) => dayOf(l) === today)
        .map((l) => {
            const [, flow = '', items = '0', tokens = '0', picks = '-'] =
                l.split('\t');
            return {
                flow,
                items: Number(items),
                picks:
                    picks === '-'
                        ? []
                        : picks.split(',').map((p) => {
                              const at = p.lastIndexOf(':');
                              return {
                                  conf: Number(p.slice(at + 1)),
                                  name: p.slice(0, at),
                              };
                          }),
                tokens: Number(tokens),
            };
        });

export const verdictsRead = (
    registry: Registry,
    today: string,
    dir = VET_DIR,
): VerdictRow[] =>
    Object.keys(registry.flows).flatMap((flow) => {
        const path = join(dir, `${flow}.log`);
        if (!existsSync(path)) return [];
        return readFileSync(path, 'utf8')
            .split('\n')
            .filter((l) => dayOf(l) === today)
            .map((l) => {
                const [, verdict = 'ok', note = '-'] = l.split('\t');
                return { flow, note, verdict: verdict as Verdict };
            });
    });

/** the day a flow last heard a verdict, or undefined — the boot prints «no verdict since» off it */
export const lastVerdictDay = (flow: string, dir = VET_DIR) => {
    const path = join(dir, `${flow}.log`);
    if (!existsSync(path)) return undefined;
    return readFileSync(path, 'utf8').trim().split('\n').at(-1)?.slice(0, 10);
};

export const reportLines = (
    registry: Registry,
    runs: Run[],
    verdicts: VerdictRow[],
    today: string,
    health: Health = { api: true, fixture: true, key: true },
) => {
    const lines: string[] = [];
    for (const [name, flow] of Object.entries(registry.flows)) {
        const mine = runs.filter((r) => r.flow === name);
        const said = verdicts.filter((v) => v.flow === name);
        const misses = said.filter((v) => v.verdict === 'miss');
        const isGreen = flow.state === 'green';
        const glyph = misses.length
            ? '🔴'
            : !mine.length && !said.length
              ? '⚪'
              : isGreen
                ? '🟢'
                : '🟡';
        const days = Math.min(cleanDays(flow, today), registry.windowDays);
        const window =
            flow.since === today && misses.length ? 'restarted today' : 'clean';
        lines.push(
            isGreen
                ? `${glyph} **${name}**`
                : `${glyph} **${name}** — 🧪 ${days}/${registry.windowDays} ${window}`,
        );
        if (!mine.length && !said.length) {
            lines.push('- today — no runs');
            continue;
        }
        const items = mine.reduce((n, r) => n + r.items, 0);
        const picks = mine.flatMap((r) => r.picks);
        const loads = picks.filter((p) => p.conf >= BAND.high).length;
        const near = picks.filter(
            (p) => p.conf >= BAND.low && p.conf < BAND.high,
        );
        lines.push(
            `- today — **${items}** prompts, **${loads}** loads, **${misses.length}** false`,
        );
        for (const m of misses) lines.push(`- miss — ${m.note}`);
        if (!misses.length && near.length)
            lines.push(
                `- watch — ${near.map((p) => `${p.name} ${p.conf.toFixed(2)}`).join(', ')}`,
            );
        const sharpened = said.filter((v) => /reword|sharpen/i.test(v.note));
        for (const s of sharpened) lines.push(`- sharpened — ${s.note}`);
        if (!isGreen)
            lines.push(
                `- verdicts — ${flow.verdicts - flow.misses} ok, ${flow.misses} misses`,
            );
    }
    const perFlow = Object.keys(registry.flows)
        .map(
            (f) =>
                [
                    f,
                    runs
                        .filter((r) => r.flow === f)
                        .reduce((n, r) => n + r.items, 0),
                ] as const,
        )
        .filter(([, n]) => n > 0);
    const items = perFlow.reduce((n, [, c]) => n + c, 0);
    const tokens = runs.reduce((n, r) => n + r.tokens, 0);
    lines.push(
        `📊 **session** — ${perFlow.length} flows, **${items}** items, **~${Math.round(tokens / 1000)}k** tokens (${perFlow.map(([f, n]) => `${f} ${n}`).join(', ')})`,
    );
    const missing = perFlow
        .map(([f]) => f)
        .filter((f) => !verdicts.some((v) => v.flow === f));
    const ok = (isOk: boolean) => (isOk ? 'ok' : 'FAIL');
    lines.push(
        `🚦 **health** — api ${ok(health.api)}, key ${ok(health.key)}, fixture probe ${ok(health.fixture)}, verdicts missing: ${missing.join(', ') || 'none'}`,
    );
    return lines;
};

/* Types */
export type Pick = { name: string; conf: number };
export type Run = {
    flow: string;
    items: number;
    tokens: number;
    picks: Pick[];
};
export type VerdictRow = { flow: string; verdict: Verdict; note: string };
export type Health = { api: boolean; key: boolean; fixture: boolean };
