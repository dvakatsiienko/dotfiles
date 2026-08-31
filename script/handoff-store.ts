#!/usr/bin/env node
/**
 * ? handoff-store — the one door to the CST handoff store.
 * ?
 * ?   handoff-store list [--for <audience>]        # read-only, age-flagged
 * ?   handoff-store peek <slug>                    # META block only
 * ?   handoff-store write --audience <a> --slug <s> [--shared] [--replaces <slug>]
 * ?   handoff-store ingest [<slug>] [--for <a>]    # prints the CST, deletes the file
 * ?   handoff-store delete <slug> | --all
 * ?
 * ? `write` takes the CST body on stdin. `--replaces` is the upmerge: the named
 * ? sibling goes away and this handoff takes its place, so one thread leaves one
 * ? pending file.
 * ?
 * ? Every frontend — the cc skills, the x-cw mcp server — calls this instead of
 * ? re-implementing the rules. Nothing here deletes on age; `list` flags and
 * ? stops there.
 */

/* Core */
import * as zx from 'zx';

import type { Audience, Entry } from './lib/handoff-store.ts';
import {
    AUDIENCES,
    ageOf,
    defaultRoot,
    deleteHandoffs,
    ingestHandoff,
    isAudience,
    listStore,
    peekHandoff,
    runIdOf,
    sizeLabel,
    writeHandoff,
} from './lib/handoff-store.ts';
/* Instruments */
import { bb, bold, dim, gb, rb, yb } from './lib/print.ts';

// ? zx turns colour on regardless of where stdout goes, and this tool's output
// ? is read by the mcp server and the skills as often as by a human. Escape
// ? codes in a tool result are noise the model has to step over.
if (!process.stdout.isTTY) zx.chalk.level = 0;

const USAGE = [
    'usage:',
    '  handoff-store list [--for <audience>]',
    '  handoff-store peek [<slug>]',
    '  handoff-store write --audience <a> --slug <s> [--shared] [--replaces <slug>]',
    '  handoff-store ingest [<slug>] [--for <audience>]',
    '  handoff-store delete <slug> | --all',
    '',
    `audiences: ${AUDIENCES.join(', ')}`,
    'store root: --root <path>, or $HANDOFF_STORE_ROOT, or ~/.claude/shelf/handoffs',
].join('\n');

const [verb = 'list', argument] = zx.argv._.map(String);
const root = String(
    zx.argv.root ?? process.env.HANDOFF_STORE_ROOT ?? defaultRoot,
);
const slug = argument ?? optional('slug');

if (verb === 'list') await list();
else if (verb === 'peek') await peek();
else if (verb === 'write') await write();
else if (verb === 'ingest') await ingest();
else if (verb === 'delete') await remove();
else if (verb === 'help' || zx.argv.help) zx.echo(USAGE);
else fail(`unknown verb: ${verb}\n\n${USAGE}`);

async function list() {
    const reader = audienceFlag('for');
    const all = await listStore({ root });
    const mine =
        reader === undefined
            ? all
            : all.filter(
                  (entry) =>
                      entry.audience === 'any' || entry.audience === reader,
              );

    if (all.length === 0) {
        zx.echo(dim('handoff store is clean — nothing pending.'));
        process.exit(0);
    }

    zx.echo(
        `${bold(`${mine.length} pending`)}${reader ? dim(` for ${reader}`) : ''} ${dim(`· newest first · ${root}`)}`,
    );
    for (const entry of mine) zx.echo(await row(entry));

    const others = all.filter((entry) => !mine.includes(entry));
    if (others.length > 0) {
        zx.echo(
            dim(
                `\n${others.length} addressed to another agent — do not pull, do not delete:`,
            ),
        );
        for (const entry of others)
            zx.echo(dim(`  · ${entry.slug} → for ${entry.audience}`));
    }
}

async function peek() {
    const found = await peekHandoff({ root, slug });
    if (found.error !== null) fail(found.error);

    const { entry, meta } = found.value;
    const age = ageOf(entry.mtimeMs);
    zx.echo(
        dim(
            `META of ${entry.name} (${age.label} old, ${sizeLabel(entry.size)}). nothing ingested, file untouched.`,
        ),
    );
    zx.echo('');
    zx.echo(
        meta ??
            'no META block in this CST — unusual, but ingest would still take it whole.',
    );
}

async function write() {
    const audience = audienceFlag('audience') ?? 'any';
    const topic = optional('slug');
    if (topic === undefined) fail(`write needs --slug <topic>\n\n${USAGE}`);

    const body = await readStdin();
    if (body.trim() === '')
        fail('write takes the CST body on stdin, and stdin was empty.');

    const written = await writeHandoff({
        audience,
        body,
        replaces: optional('replaces'),
        root,
        shared: zx.argv.shared === true ? true : undefined,
        slug: topic,
    });
    if (written.error !== null) fail(written.error);

    const replaced = written.value.removed[0];
    if (replaced) zx.echo(dim(`replaced ${replaced.name}`));
    zx.echo(`${gb('written')} ${written.value.path}`);
}

async function ingest() {
    const taken = await ingestHandoff({
        reader: audienceFlag('for'),
        root,
        slug,
    });
    if (taken.error !== null) fail(taken.error);

    const { body, entry, kept } = taken.value;
    zx.echo(
        dim(
            `CST from ${entry.name} — ${kept ? 'shared, file kept for other pullers' : 'file deleted on ingest'}.`,
        ),
    );
    zx.echo('');
    zx.echo(body);
}

async function remove() {
    const all = zx.argv.all === true;
    if (!all && slug === undefined)
        fail(`delete needs a slug, or --all\n\n${USAGE}`);

    const deleted = await deleteHandoffs({ all, root, slug });
    if (deleted.error !== null) fail(deleted.error);

    zx.echo(
        deleted.value.length === 0
            ? dim('handoff store already empty.')
            : `${yb('deleted')} ${deleted.value.length}: ${deleted.value.map((entry) => entry.slug).join(', ')}`,
    );
}

/* Helpers */
async function row(entry: Entry) {
    const age = ageOf(entry.mtimeMs);
    const runId = await runIdOf(entry);
    const head = `  ${bb(entry.slug)}${entry.shared ? dim(' (shared)') : ''}`;
    const facts = dim(
        ` — for ${entry.audience} · ${age.label} · ${sizeLabel(entry.size)} · run ${runId ?? 'unknown'}`,
    );

    // ? Mild on purpose. Age is information Dima acts on, never a thing this
    // ? tool acts on — no frontend deletes by age any more.
    return `${head}${facts}${age.stale ? yb(`  ⚠ ${age.days}d old`) : ''}`;
}

function optional(flag: string) {
    const value = zx.argv[flag];
    return value === undefined ? undefined : String(value);
}

function audienceFlag(flag: string): Audience | undefined {
    const value = optional(flag);
    if (value === undefined) return undefined;
    if (!isAudience(value))
        fail(`unknown audience "${value}". known: ${AUDIENCES.join(', ')}`);
    return value as Audience;
}

async function readStdin() {
    if (process.stdin.isTTY) return '';

    const chunks: Buffer[] = [];
    for await (const chunk of process.stdin) chunks.push(Buffer.from(chunk));
    return Buffer.concat(chunks).toString('utf8');
}

function fail(message: string): never {
    console.error(rb(message));
    process.exit(1);
}
