#!/usr/bin/env node

/**
 * ? linear-push-revert — undo the two writes Linear's github integration makes
 * ? to a ticket when a pushed commit carries a magic word.
 * ?
 * ?   pnpm linear-push-revert hook          # from lefthook's pre-push, refs on stdin
 * ?   pnpm linear-push-revert run --ids=DOT-159:ref --pushed-at=<epoch-seconds>
 * ?   pnpm linear-push-revert run --ids=DOT-159:ref --pushed-at=<epoch> --dry-run
 * ?
 * ? `hook` never blocks and never fails the push: it reads the refs, works out
 * ? which tickets are about to be written to, detaches `run` into the background
 * ? and exits 0 whatever happened. A Linear outage must not stop Dima pushing.
 * ?
 * ? `run` waits for the integration to fire (~10-15s after a push), then reverses
 * ? what it did inside a time window anchored on the push. The window is the only
 * ? guard there is — see planRevert.
 */

/* Core */
import { spawn } from 'node:child_process';
import { openSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import * as zx from 'zx';

import {
    type HistoryNode,
    type MagicRef,
    type Plan,
    checkRemoteOwner,
    magicRefsIn,
    parsePushedRefs,
    planRevert,
    pushRange,
} from './lib/linear-push.ts';
/* Instruments */
import { dim, note } from './lib/print.ts';

// The integration fires ~10-15s after the push. Several short waits rather than
// one long one, so a fast write is undone quickly and a slow one is still caught.
const POLL_DELAYS_MS = [12_000, 15_000, 15_000, 20_000];
const HISTORY_PAGE = 20;

// No cwd is set on purpose: the hook runs in whatever repo is being pushed,
// and this script must never assume it lives in that repo's checkout.
zx.$.verbose = false;
const selfPath = fileURLToPath(import.meta.url);

const [verb] = zx.argv._ as string[];

if (verb === 'hook') await hook();
else if (verb === 'run') await run();
else {
    console.error(
        'usage: linear-push-revert hook <remote-name> <remote-url> | run --ids=… --pushed-at=…',
    );
    process.exit(1);
}

/* Verbs */

/**
 * Wrapped whole: this runs inside a git hook, so any throw at all would fail the
 * push. There is no failure mode here worth losing a push over.
 */
async function hook() {
    try {
        const pushedAt = Math.floor(Date.now() / 1000);
        const [, remoteName = '', remoteUrl = ''] = zx.argv._ as string[];
        const stdin = await readStdin();

        // Guard one: the repo has to be ours. Resolved from git's own pre-push
        // argv, never from the name `origin`, which means nothing on its own.
        const owner = checkRemoteOwner(
            remoteUrl ||
                (
                    await zx.$`git config --get remote.${remoteName}.url`.nothrow()
                ).stdout,
        );
        if (!owner.ok)
            return note(dim(`linear: standing down — ${owner.reason}`));

        const refs = parsePushedRefs(stdin);
        const messages: string[] = [];

        for (const ref of refs) {
            const log =
                await zx.$`git log --format=%B%x00 ${pushRange(ref)}`.nothrow();
            if (log.exitCode === 0)
                messages.push(...log.stdout.split('\0').filter(Boolean));
        }

        const magic = magicRefsIn(messages);
        if (magic.length === 0) return;

        // --git-common-dir, not --git-dir: one log per repo, shared by its worktrees.
        const gitDir = (
            await zx.$`git rev-parse --path-format=absolute --git-common-dir`
        ).stdout.trim();
        const logPath = `${gitDir}/linear-push-revert.log`;
        const fd = openSync(logPath, 'a');
        spawn(
            process.execPath,
            [
                selfPath,
                'run',
                `--ids=${magic.map((m) => `${m.id}:${m.closing ? 'closing' : 'ref'}`).join(',')}`,
                `--pushed-at=${pushedAt}`,
            ],
            { detached: true, stdio: ['ignore', fd, fd] },
        ).unref();

        note(
            `linear: undoing the auto-assign on ${magic.map((m) => m.id).join(', ')} in the background${dim(` → ${logPath}`)}`,
        );
    } catch {
        /* Never fail a push. */
    }
}

async function run() {
    const ids = parseIds(String(zx.argv.ids ?? ''));
    const pushedAtMs = Number(zx.argv['pushed-at']) * 1000;
    const dryRun = Boolean(zx.argv['dry-run']);

    if (ids.length === 0 || !Number.isFinite(pushedAtMs)) {
        console.error(
            'run needs --ids=DOT-1:ref,… and --pushed-at=<epoch seconds>',
        );
        process.exit(1);
    }

    log(
        `push at ${new Date(pushedAtMs).toISOString()}, watching ${ids.map((i) => i.id).join(', ')}${dryRun ? ' (dry run)' : ''}`,
    );

    const outstanding = new Map(ids.map((ref) => [ref.id, ref]));
    for (const delay of POLL_DELAYS_MS) {
        if (outstanding.size === 0) break;
        await zx.sleep(dryRun ? 0 : delay);

        for (const [id, ref] of [...outstanding]) {
            const plan = await inspect(ref, pushedAtMs);
            if (plan === null) continue;
            if (plan.reverts.length === 0) {
                // Nothing yet is not nothing ever — the integration may still be
                // in flight, so this id stays outstanding until the deadline.
                if (dryRun) report(id, plan, dryRun);
                continue;
            }

            report(id, plan, dryRun);
            if (!dryRun) await apply(id, plan);
            outstanding.delete(id);
        }

        if (dryRun) break;
    }

    for (const id of outstanding.keys())
        log(`${id}: nothing to undo inside the window`);
}

/* Helpers */
async function inspect(
    ref: MagicRef,
    pushedAtMs: number,
): Promise<Plan | null> {
    const query = `query { issue(id: "${ref.id}") { state { id } history(first: ${HISTORY_PAGE}) { nodes { createdAt fromState { id name type } toState { id name type } toAssignee { name } } } } }`;
    const result = await zx.$`linear api ${query}`.nothrow();
    if (result.exitCode !== 0) {
        log(`${ref.id}: linear api failed — ${result.stderr.trim()}`);
        return null;
    }

    const issue = JSON.parse(result.stdout).data?.issue as {
        history: { nodes: HistoryNode[] };
        state: { id: string } | null;
    } | null;
    if (!issue) {
        log(`${ref.id}: no such issue`);
        return null;
    }

    return planRevert({
        closing: ref.closing,
        currentStateId: issue.state?.id ?? null,
        history: issue.history.nodes,
        pushedAtMs,
    });
}

async function apply(id: string, plan: Plan) {
    for (const revert of plan.reverts) {
        const input =
            revert.kind === 'unassign'
                ? 'assigneeId: null'
                : `stateId: "${revert.stateId}"`;
        const result =
            await zx.$`linear api ${`mutation { issueUpdate(id: "${id}", input: { ${input} }) { success } }`}`.nothrow();
        log(
            result.exitCode === 0
                ? `${id}: applied ${revert.kind}`
                : `${id}: ${revert.kind} FAILED — ${result.stderr.trim()}`,
        );
    }
}

function report(id: string, plan: Plan, dryRun: boolean) {
    for (const reason of plan.reasons) log(`${id}: ${reason}`);
    for (const revert of plan.reverts)
        log(
            `${id}: ${dryRun ? 'would revert' : 'reverting'} ${revert.kind === 'unassign' ? 'assignee → none' : `state → ${revert.stateName}`}`,
        );
}

function parseIds(raw: string): MagicRef[] {
    return raw
        .split(',')
        .filter(Boolean)
        .map((entry) => {
            const [id = '', kind] = entry.split(':');
            return { closing: kind === 'closing', id };
        })
        .filter((ref) => /^(?:DOT|BYT)-\d+$/.test(ref.id));
}

function readStdin() {
    return new Promise<string>((resolve) => {
        if (process.stdin.isTTY) return resolve('');
        let buffer = '';
        process.stdin.setEncoding('utf8');
        process.stdin.on('data', (chunk) => {
            buffer += chunk;
        });
        process.stdin.on('end', () => resolve(buffer));
        process.stdin.on('error', () => resolve(''));
    });
}

function log(message: string) {
    console.log(`[${new Date().toISOString()}] ${message}`);
}
