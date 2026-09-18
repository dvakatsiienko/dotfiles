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

export const readAgentList = async (): Promise<Agent[]> => {
    const nameList = await readdir(agentDir).catch(onAgentDirError);
    const agentList = await Promise.all(
        nameList
            .filter(
                (name) =>
                    name.startsWith(labelPrefix) && name.endsWith('.plist'),
            )
            .map((name) => readAgent(join(agentDir, name))),
    );

    return agentList
        .filter((agent) => agent !== null)
        .sort((a, b) => a.name.localeCompare(b.name));
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
        label: plist.Label,
        name,
        plistPath,
        programPath: plist.ProgramArguments?.[0] ?? null,
        schedule: toScheduleText(plist, calendar),
        stderrPath: plist.StandardErrorPath ?? null,
        stdoutPath: plist.StandardOutPath ?? null,
        what: comment ? toFirstSentence(comment, name) : null,
        whatFull: comment,
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

    if (plist.KeepAlive && plist.RunAtLoad) return 'always on';

    return 'manual';
};

/* Types */
export interface Agent extends LiveState {
    calendar: Calendar | null;
    label: string;
    name: string;
    plistPath: string;
    programPath: string | null;
    schedule: string;
    stderrPath: string | null;
    stdoutPath: string | null;
    what: string | null;
    whatFull: string | null;
}

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
