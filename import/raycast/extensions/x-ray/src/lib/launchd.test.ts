import { describe, expect, it } from 'vitest';

import {
    type Agent,
    type CoworkBeat,
    toCoworkState,
    toHealth,
} from './launchd';

describe('toHealth', () => {
    it('reads a fresh ok heartbeat as a run that went fine', () => {
        expect(toHealth(toCoworkAgent({ ok: true }))).toBe('ok');
    });

    it('reads a fresh failed heartbeat as dead', () => {
        expect(toHealth(toCoworkAgent({ ok: false }))).toBe('dead');
    });

    it('reads a heartbeat past the staleness window as dead', () => {
        const agent = toCoworkAgent({ firedAt: toAgedStamp(27), ok: true });

        expect(toHealth(agent)).toBe('dead');
    });

    it('reads an always-on job launchd is not holding up as dead', () => {
        const agent = toLaunchdAgent({
            schedule: alwaysOnSchedule,
            state: 'not running',
        });

        expect(toHealth(agent)).toBe('dead');
    });

    it('reads an always-on job launchd is running as running', () => {
        const agent = toLaunchdAgent({
            schedule: alwaysOnSchedule,
            state: 'running',
        });

        expect(toHealth(agent)).toBe('running');
    });

    it('reads a daily job that exited 0 this boot as a run that went fine', () => {
        expect(toHealth(toLaunchdAgent({ lastExit: 0, runs: 1 }))).toBe('ok');
    });

    it('reads a daily job with no run this boot as idle', () => {
        expect(toHealth(toLaunchdAgent({ lastExit: 0, runs: 0 }))).toBe('idle');
    });

    it('reads a job launchctl could not answer for as unknown', () => {
        expect(toHealth(toLaunchdAgent({ state: 'unknown' }))).toBe('unknown');
    });
});

describe('toCoworkState', () => {
    it('leaves a cloud row without an exit code', () => {
        const beat = toBeat({ ok: true });

        expect(toCoworkState(beat, new Date(beat.firedAt)).lastExit).toBeNull();
    });
});

/* Helpers */
// `toScheduleText` prints this for a KeepAlive plist; the literal is the contract between the
// two, so the test names it rather than importing a symbol only the test would need.
const alwaysOnSchedule = 'always on';

const toAgedStamp = (hours: number) =>
    new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

const toBeat = (shape: Partial<CoworkBeat>): CoworkBeat => ({
    firedAt: new Date().toISOString(),
    label: 'cowork.gazette',
    name: 'gazette-sync',
    ok: true,
    schedule: 'daily 09:02',
    ...shape,
});

const toCoworkAgent = (shape: Partial<CoworkBeat>): Agent => {
    const beat = toBeat(shape);

    return {
        calendar: null,
        emoji: null,
        label: beat.label,
        name: beat.name,
        plistPath: '/probe/gazette-sync.json',
        programPath: null,
        schedule: beat.schedule,
        source: 'cowork',
        stderrPath: null,
        stdoutPath: null,
        what: null,
        whatFull: null,
        ...toCoworkState(beat, new Date(beat.firedAt)),
    };
};

const toLaunchdAgent = (shape: LaunchdShape): Agent => ({
    calendar: null,
    emoji: null,
    label: 'com.dima.x-probe',
    lastExit: shape.lastExit ?? null,
    name: 'x-probe',
    plistPath: '/probe/com.dima.x-probe.plist',
    programPath: null,
    runs: shape.runs ?? 0,
    schedule: shape.schedule ?? 'daily 09:00',
    source: 'launchd',
    state: shape.state ?? 'not running',
    stderrPath: null,
    stdoutPath: null,
    what: null,
    whatFull: null,
});

/* Types */
interface LaunchdShape {
    lastExit?: number | null;
    runs?: number;
    schedule?: string;
    state?: string;
}
