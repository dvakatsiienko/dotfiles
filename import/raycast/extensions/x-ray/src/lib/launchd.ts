import { execFile } from 'node:child_process';
import { readFile, readdir } from 'node:fs/promises';
import { homedir, userInfo } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

const run = promisify(execFile);
const agentDir = join(homedir(), 'Library', 'LaunchAgents');

// Only ours. The folder also holds agents from installed apps, and this command is a window
// onto what we run, not a launchd browser.
const labelPrefix = 'com.dima.';

// A daemon has to be told apart from a scheduled job: `not running` is health for a daily
// slot and death for something launchd is meant to keep alive.
const alwaysOnSchedule = 'always on';

// A cowork row's state word carries its whole verdict, because there is no exit code behind
// it to check against — launchctl never saw this job and never will.
const coworkOkState = 'last run ok';

// A cloud job runs on anthropic's machines, so launchctl will never know it. Each one drops a
// heartbeat here instead — ONE FILE PER JOB, so a second cloud job needs no code change — and
// freshness is the only state anything local can derive.
const coworkStateDir = join(homedir(), 'frame', 'schedule', 'state');

// One daily slot plus two hours of slack: a beat older than this means a run went missing.
const coworkStaleMs = 26 * 60 * 60 * 1000;

// A job may open its description with an emoji it picked for itself; the list shows it instead of
// the generic clock. Extended_Pictographic covers the whole range, and the optional variation
// selector keeps a glyph like ⌨️ from being cut in half.
const emojiHead = /^(\p{Extended_Pictographic}️?)\s+/u;

// A job may name one thing worth opening — a page it feeds, a dashboard. It says so in its
// plist comment, in the same `key — value` shape as every other line there, and the row turns
// that into its primary action. Nothing here knows what the target is: macOS `open` routes a
// file:// url to the browser and an https one to the same place, so the reader stays dumb.
const openLine = /^-\s*open\s+—\s+(\S+)\s*$/m;

export const readAgentList = async (): Promise<Agent[]> => {
    const [nameList, coworkList] = await Promise.all([
        readdir(agentDir).catch(onAgentDirError),
        readCoworkList(),
    ]);
    const agentList = await Promise.all(
        nameList
            .filter(
                (name) =>
                    name.startsWith(labelPrefix) && name.endsWith('.plist'),
            )
            .map((name) => readAgent(join(agentDir, name))),
    );

    const rowList = [
        ...agentList.filter((agent) => agent !== null),
        ...coworkList,
    ];

    return rowList.sort((a, b) => a.name.localeCompare(b.name));
};

export const readCoworkList = async (): Promise<Agent[]> => {
    const nameList = await readdir(coworkStateDir).catch(onAgentDirError);
    const agentList = await Promise.all(
        nameList
            .filter((name) => name.endsWith('.json'))
            .map((name) => readCoworkAgent(join(coworkStateDir, name))),
    );

    return agentList.filter((agent) => agent !== null);
};

// What a glance needs, in five values. `unknown` stays its own: "we could not read it" is not
// the claim "it is fine", and rounding it to either side is how a broken job goes unnoticed.
export const toHealth = (agent: Agent): Health => {
    if (isDead(agent)) return 'dead';
    if (agent.state === 'running') return 'running';
    if (agent.state === 'unknown') return 'unknown';

    return hasRunWell(agent) ? 'ok' : 'idle';
};

export const toNextFire = (agent: Agent): Date | null => {
    if (!agent.calendar) return null;

    const next = new Date();
    next.setHours(agent.calendar.hour, agent.calendar.minute, 0, 0);

    // A slot already past today fires tomorrow; launchd never runs it twice in one day.
    if (next.getTime() <= Date.now()) next.setDate(next.getDate() + 1);

    return next;
};

/* Helpers */
// Three ways a job can be saying nothing will run: launchd not holding it at all, a run that
// ended badly, and a cloud task whose heartbeat never arrived.
const deadStateList = ['failed', 'missed', 'not loaded'];

// …and a fourth that reads identical to health: `not running`. On a daily job that is simply
// the gap between slots, but on a job launchd is meant to keep alive it means the thing is
// DEAD. Same word from launchctl, opposite meaning — and a monitor that hides a dead monitor
// is worse than no monitor.
const isDead = (agent: Agent) =>
    deadStateList.includes(agent.state) ||
    (agent.schedule === alwaysOnSchedule && agent.state !== 'running');

// A launchd row needs both halves: exit 0 with no runs this boot is LAST boot's success, which
// says nothing about today. A cowork row has no exit code at all, so its state word is the
// only place the verdict lives.
const hasRunWell = (agent: Agent) =>
    agent.source === 'cowork'
        ? agent.state === coworkOkState
        : agent.lastExit === 0 && agent.runs > 0;

const onAgentDirError = (error: NodeJS.ErrnoException): string[] => {
    if (error.code === 'ENOENT') return [];

    throw error;
};

const readAgent = async (plistPath: string): Promise<Agent | null> => {
    const [raw, plist] = await Promise.all([
        readFile(plistPath, 'utf8').catch(() => null),
        readPlist(plistPath),
    ]);

    if (!plist?.Label) return null;

    const name = plist.Label.slice(labelPrefix.length);
    const comment = raw ? toComment(raw) : null;
    const calendar = toCalendar(plist);

    return {
        calendar,
        emoji: toEmoji(comment ?? undefined),
        label: plist.Label,
        name,
        openTarget: comment ? (openLine.exec(comment)?.[1] ?? null) : null,
        plistPath,
        programPath: plist.ProgramArguments?.[0] ?? null,
        schedule: toScheduleText(plist, calendar),
        source: 'launchd',
        stderrPath: plist.StandardErrorPath ?? null,
        stdoutPath: plist.StandardOutPath ?? null,
        what: comment ? toFirstSentence(stripEmoji(comment), name) : null,
        whatFull: comment ? stripEmoji(comment) : null,
        ...(await readLiveState(plist.Label)),
    };
};

// `plutil` drops xml comments, so the prose is read from the file and the fields from json —
// two reads of one file, because neither channel carries what the other has.
const readPlist = async (plistPath: string): Promise<PlistShape | null> => {
    try {
        const { stdout } = await run('plutil', [
            '-convert',
            'json',
            '-o',
            '-',
            plistPath,
        ]);

        return JSON.parse(stdout) as PlistShape;
    } catch {
        return null;
    }
};

// A single leading tab is the top level of `launchctl print`; the nested blocks repeat
// `state = ` several levels deep, so an unanchored match reads the wrong one.
const readLiveState = async (label: string): Promise<LiveState> => {
    try {
        const { stdout } = await run('launchctl', [
            'print',
            `gui/${userInfo().uid}/${label}`,
        ]);
        const exitText = /^\tlast exit code = (.+)$/m.exec(stdout)?.[1] ?? '';

        return {
            lastExit: /^-?\d+$/.test(exitText) ? Number(exitText) : null,
            runs: Number(/^\truns = (\d+)$/m.exec(stdout)?.[1] ?? '0'),
            state: /^\tstate = (.+)$/m.exec(stdout)?.[1] ?? 'unknown',
        };
    } catch {
        // launchctl exits non-zero for a label nobody bootstrapped — a real state, not a fault.
        return { lastExit: null, runs: 0, state: 'not loaded' };
    }
};

// Nothing validates these files but us — each is written by a cloud session, so a half-written
// or hand-edited beat has to read as "no job" rather than take the whole list down.
const readCoworkAgent = async (beatPath: string): Promise<Agent | null> => {
    const beat = await readCoworkBeat(beatPath);

    if (!beat) return null;

    const firedAt = new Date(beat.firedAt);

    if (Number.isNaN(firedAt.getTime())) return null;

    return {
        calendar: toCoworkCalendar(beat.schedule),
        emoji: toEmoji(beat.what),
        label: beat.label,
        name: beat.name,
        openTarget: null,
        // No plist and no log exist for a cloud job, so both open actions land on the
        // heartbeat itself — the only file here that says anything about it.
        plistPath: beatPath,
        programPath: null,
        schedule: beat.schedule,
        source: 'cowork',
        stderrPath: null,
        stdoutPath: beatPath,
        what: beat.what
            ? toFirstSentence(stripEmoji(beat.what), beat.name)
            : null,
        whatFull: beat.detail ? stripEmoji(beat.detail) : null,
        ...toCoworkState(beat, firedAt),
    };
};

const readCoworkBeat = async (beatPath: string): Promise<CoworkBeat | null> => {
    try {
        const beat = JSON.parse(await readFile(beatPath, 'utf8')) as CoworkBeat;

        return beat.label && beat.name && beat.schedule && beat.firedAt
            ? beat
            : null;
    } catch {
        return null;
    }
};

const toEmoji = (text: string | undefined) =>
    text ? (emojiHead.exec(text)?.[1] ?? null) : null;

const stripEmoji = (text: string) => text.replace(emojiHead, '');

// Nothing to poll, so freshness IS the state: a beat inside the window means the last run
// reported, and anything older means a slot came and went unanswered.
export const toCoworkState = (beat: CoworkBeat, firedAt: Date): LiveState => {
    if (Date.now() - firedAt.getTime() > coworkStaleMs) {
        return { lastExit: null, runs: 0, state: 'missed' };
    }

    return {
        lastExit: null,
        runs: 0,
        state: beat.ok ? coworkOkState : 'failed',
    };
};

// The beat writes its schedule in the shape `toScheduleText` prints, so reading the two numbers
// back hands `toNextFire` a slot. A cron grammar would buy nothing more.
const toCoworkCalendar = (schedule: string): Calendar | null => {
    const slot = /^daily (\d{1,2}):(\d{2})$/.exec(schedule);

    if (!slot) return null;

    return { hour: Number(slot[1]), minute: Number(slot[2]) };
};

const toComment = (raw: string) => {
    const body = /<!--([\s\S]*?)-->/.exec(raw)?.[1];

    if (!body) return null;

    return body
        .split('\n')
        .map((line) => line.trim())
        .join('\n')
        .trim();
};

// The row already carries the name, so a comment opening with it says it twice.
const toFirstSentence = (comment: string, name: string) => {
    const paragraph = (comment.split('\n\n')[0] ?? '')
        .replace(/\s+/g, ' ')
        .trim();
    const stop = paragraph.indexOf('. ');
    const sentence = stop === -1 ? paragraph : paragraph.slice(0, stop + 1);

    return sentence.startsWith(`${name} — `)
        ? sentence.slice(name.length + 3)
        : sentence;
};

const toCalendar = (plist: PlistShape): Calendar | null => {
    const interval = Array.isArray(plist.StartCalendarInterval)
        ? plist.StartCalendarInterval[0]
        : plist.StartCalendarInterval;

    if (!interval) return null;

    return { hour: interval.Hour ?? 0, minute: interval.Minute ?? 0 };
};

const toScheduleText = (plist: PlistShape, calendar: Calendar | null) => {
    if (calendar) {
        const hour = String(calendar.hour).padStart(2, '0');
        const minute = String(calendar.minute).padStart(2, '0');

        return `daily ${hour}:${minute}`;
    }

    if (typeof plist.StartInterval === 'number') {
        return `every ${plist.StartInterval}s`;
    }

    if (plist.KeepAlive && plist.RunAtLoad) return alwaysOnSchedule;

    return 'manual';
};

/* Types */
// One word per thing the list draws: dead, running, the last run went fine, nothing has run
// yet, and we could not tell.
export type Health = 'dead' | 'idle' | 'ok' | 'running' | 'unknown';

export interface Agent extends LiveState {
    calendar: Calendar | null;
    emoji: string | null;
    label: string;
    name: string;
    openTarget: string | null;
    plistPath: string;
    programPath: string | null;
    schedule: string;
    source: AgentSource;
    stderrPath: string | null;
    stdoutPath: string | null;
    what: string | null;
    whatFull: string | null;
}

// Where the row came from, and what that means: a `launchd` row is polled live from
// launchctl, a `cowork` row is inferred from the freshness of a heartbeat file.
export type AgentSource = 'cowork' | 'launchd';

interface LiveState {
    lastExit: number | null;
    runs: number;
    state: string;
}

interface Calendar {
    hour: number;
    minute: number;
}

interface CalendarInterval {
    Hour?: number;
    Minute?: number;
}

// The heartbeat a cowork session leaves behind. `what` and `detail` are prose it writes for
// this list, so a beat without them is still a valid beat.
export interface CoworkBeat {
    detail?: string;
    firedAt: string;
    label: string;
    name: string;
    ok: boolean;
    schedule: string;
    what?: string;
}

interface PlistShape {
    KeepAlive?: boolean;
    Label?: string;
    ProgramArguments?: string[];
    RunAtLoad?: boolean;
    StandardErrorPath?: string;
    StandardOutPath?: string;
    StartCalendarInterval?: CalendarInterval | CalendarInterval[];
    StartInterval?: number;
}
