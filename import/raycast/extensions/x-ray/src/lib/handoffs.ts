import { readFile, readdir, stat } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';

export const handoffDir = join(homedir(), '.claude', 'shelf', 'handoffs');

export const readHandoffList = async (): Promise<Handoff[]> => {
    const entries = await readdir(handoffDir).catch(onShelfReadError);
    const handoffList = await Promise.all(
        entries.filter((name) => name.endsWith('.md')).map(readHandoff),
    );

    return handoffList
        .filter((handoff) => handoff !== null)
        .sort((a, b) => b.modifiedAt - a.modifiedAt);
};

export const readHandoffBody = (path: string) => readFile(path, 'utf8');

// `/cclio:init` boots the successor, `/x:handoff-ingest <topic>` picks this file out of the shelf.
export const toIngestCommand = (handoff: Handoff) =>
    `/cclio:init /x:handoff-ingest ${handoff.topic}`;

export const toPointerLine = (handoff: Handoff) => {
    const origin = handoff.lane
        ? `${handoff.lane} lane · by ${handoff.author}`
        : 'legacy name';

    return `${handoff.topic} — ${origin} · ~/.claude/shelf/handoffs/${handoff.fileName}`;
};

export const toAge = (modifiedAt: number) => {
    const minutes = Math.max(0, Math.round((Date.now() - modifiedAt) / 60_000));

    if (minutes < 60) return `${minutes}m`;
    if (minutes < 60 * 48) return `${Math.round(minutes / 60)}h`;

    return `${Math.round(minutes / (60 * 24))}d`;
};

/* Helpers */

// Mirrors cclio/.claude/hooks/boot-prefetch.sh. The grammar is
// `<audience>--<lane>--<topic>--by-<author>--<stamp>`, optionally suffixed `-shared`;
// a legacy name carries no `--` at all and only its first `-` field ever meant an audience.
const parseFileName = (fileName: string) => {
    const name = fileName.replace(/\.md$/, '');
    const isShared = name.endsWith('-shared');
    const stem = isShared ? name.slice(0, -'-shared'.length) : name;
    const [audience, lane, topic, authorField, ...stampField] =
        stem.split('--');

    if (
        !audience ||
        !lane ||
        !topic ||
        !authorField ||
        stampField.length === 0
    ) {
        return {
            audience: stem.split('-')[0] ?? stem,
            author: null,
            isShared,
            lane: null,
            stamp: null,
            topic: stem,
        };
    }

    return {
        audience,
        author: authorField.replace(/^by-/, ''),
        isShared,
        lane,
        stamp: stampField.join('--'),
        topic,
    };
};

// A whitelist, so an unparsed audience can never wrongly claim a file is someone else's
// and get it left behind forever.
const foreignAudienceList = ['cw', 'ccli', 'dpatch'] as const;

// The shelf directory only exists once something has been handed off, so a missing one is
// an empty shelf. Anything else — this directory is 0700, and an i/o fault is possible —
// has to reach the failure toast instead of rendering as "the shelf is empty".
const onShelfReadError = (error: NodeJS.ErrnoException): string[] => {
    if (error.code === 'ENOENT') return [];

    throw error;
};

// `/x:handoff-ingest` deletes a file the moment it succeeds, so one can disappear between
// the readdir and this stat. That file is gone, not a reason to fail the whole list.
const readHandoff = async (fileName: string): Promise<Handoff | null> => {
    const path = join(handoffDir, fileName);
    const parsed = parseFileName(fileName);
    const stats = await stat(path).catch(() => null);

    if (!stats) return null;

    return {
        ...parsed,
        fileName,
        isForeign: foreignAudienceList.some(
            (audience) => audience === parsed.audience,
        ),
        modifiedAt: stats.mtimeMs,
        path,
    };
};

/* Types */
export interface Handoff {
    audience: string;
    author: string | null;
    fileName: string;
    isForeign: boolean;
    isShared: boolean;
    lane: string | null;
    modifiedAt: number;
    path: string;
    stamp: string | null;
    topic: string;
}
