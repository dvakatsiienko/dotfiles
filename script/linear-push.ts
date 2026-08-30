#!/usr/bin/env node

/**
 * ? linear-push — link a pushed commit to its ticket ourselves, so Linear's own
 * ? parser never has to, and undo the writes it still makes for commits that
 * ? were written with its keywords.
 * ?
 * ?   node script/linear-push.ts hook <remote-name> <remote-url>   # refs on stdin
 * ?   node script/linear-push.ts run --job=<path>                  # the detached half
 * ?
 * ? It is a `lefthook` pre-push job, called from `dotfiles` by relative path and
 * ? from `bytes` by absolute path — one implementation, two callers. It stands
 * ? down in any repo that is not Dima's — see parseRemote.
 * ?
 * ? `hook` never blocks and never fails the push: it reads the refs, works out
 * ? what the push means for Linear, detaches `run` into the background and exits
 * ? 0 whatever happened. A Linear outage must not stop Dima pushing.
 * ?
 * ? `run` waits for the push to actually reach the remote, then links the
 * ? commits and closes what a closing marker closed. Anything Linear wrote on
 * ? its own is reversed inside a time window anchored on the push — see
 * ? planRevert.
 */

/* Core */
import { spawn } from 'node:child_process';
import { openSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import * as zx from 'zx';

import {
    type Commit,
    type HistoryNode,
    type LinkTarget,
    type MagicRef,
    type PushedRef,
    type Remote,
    type State,
    branchOf,
    linkTargetsIn,
    magicRefsIn,
    parsePushedRefs,
    parseRemote,
    pickDoneState,
    planRevert,
    pushRange,
} from './lib/linear-push.ts';
/* Instruments */
import { dim, note } from './lib/print.ts';

// Our own push is usually visible on the remote within a second or two; the
// long tail is a slow network, not a slow server.
const LAND_DELAYS_MS = [1_500, 3_000, 6_000, 10_000];
// Linear's integration fires ~10-15s after a push. Several short waits rather
// than one long one, so a fast write is undone quickly and a slow one is still
// caught.
const REVERT_DELAYS_MS = [12_000, 15_000, 15_000, 20_000];
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
        'usage: linear-push hook <remote-name> <remote-url> | run --job=<path>',
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
        const pushedAt = Date.now();
        const [, remoteName = '', remoteUrl = ''] = zx.argv._ as string[];
        const stdin = await readStdin();

        // Guard one: the repo has to be ours. Resolved from git's own pre-push
        // argv, never from the name `origin`, which means nothing on its own.
        const parsed = parseRemote(
            remoteUrl ||
                (
                    await zx.$`git config --get remote.${remoteName}.url`.nothrow()
                ).stdout,
        );
        if (!parsed.ok)
            return note(dim(`linear: standing down — ${parsed.reason}`));

        const refs = parsePushedRefs(stdin);
        const commits: Commit[] = [];
        for (const ref of refs) commits.push(...(await commitsIn(ref)));

        const links = linkTargetsIn(commits);
        const magic = magicRefsIn(commits.map((commit) => commit.body));
        if (links.length === 0 && magic.length === 0) return;

        // --git-common-dir, not --git-dir: one log per repo, shared by its worktrees.
        const gitDir = (
            await zx.$`git rev-parse --path-format=absolute --git-common-dir`
        ).stdout.trim();
        const root = (await zx.$`git rev-parse --show-toplevel`).stdout.trim();

        const jobPath = `${gitDir}/linear-push-job-${process.pid}.json`;
        writeFileSync(
            jobPath,
            JSON.stringify({
                landing: refs.map(({ localOid, remoteRef }) => ({
                    localOid,
                    remoteRef,
                })),
                links,
                magic,
                pushedAt,
                remote: parsed.remote,
                remoteName,
                root,
            } satisfies Job),
        );

        const logPath = `${gitDir}/linear-push.log`;
        const fd = openSync(logPath, 'a');
        spawn(process.execPath, [selfPath, 'run', `--job=${jobPath}`], {
            detached: true,
            stdio: ['ignore', fd, fd],
        }).unref();

        const said = [
            links.length > 0 &&
                `linking ${commitCount(links)} to ${links.map((link) => link.id).join(', ')}`,
            magic.length > 0 &&
                `undoing the auto-assign on ${magic.map((ref) => ref.id).join(', ')}`,
        ].filter((line) => typeof line === 'string');

        note(`linear: ${said.join(' + ')}${dim(` → ${logPath}`)}`);
    } catch {
        /* Never fail a push. */
    }
}

async function run() {
    const jobPath = String(zx.argv.job ?? '');
    if (!jobPath) {
        console.error('run needs --job=<path>');
        process.exit(1);
    }

    const job = JSON.parse(readFileSync(jobPath, 'utf8')) as Job;
    rmSync(jobPath, { force: true });

    log(
        `push at ${new Date(job.pushedAt).toISOString()} → ${job.remote.owner}/${job.remote.repo}`,
    );

    // Nothing is written to Linear on the strength of a push that never landed:
    // pre-push runs before the transfer, and the transfer can still be refused.
    if (!(await landed(job)))
        return log('the push never reached the remote — wrote nothing');

    for (const target of job.links) await link(target, job.remote);
    if (job.magic.length > 0) await revert(job);
}

/* Helpers */

async function commitsIn(ref: PushedRef): Promise<Commit[]> {
    const log =
        await zx.$`git log --format=%H%x1f%s%x1f%B%x00 ${pushRange(ref)}`.nothrow();
    if (log.exitCode !== 0) return [];

    return log.stdout
        .split('\0')
        .map((entry) => entry.replace(/^\n/, '').split('\x1f'))
        .filter(([sha]) => Boolean(sha))
        .map(([sha = '', subject = '', body = '']) => ({
            body,
            branch: branchOf(ref),
            sha,
            subject,
        }));
}

async function landed(job: Job): Promise<boolean> {
    for (const delay of LAND_DELAYS_MS) {
        await zx.sleep(delay);

        const seen = await Promise.all(
            job.landing.map(async (ref) => {
                const result =
                    await zx.$`git -C ${job.root} ls-remote ${job.remoteName} ${ref.remoteRef}`.nothrow();
                return result.stdout.startsWith(ref.localOid);
            }),
        );
        if (seen.every(Boolean)) return true;
    }

    return false;
}

async function link(target: LinkTarget, remote: Remote) {
    for (const commit of target.commits) {
        const url = `https://${remote.host}/${remote.owner}/${remote.repo}/commit/${commit.sha}`;
        // Same url on the same issue returns the existing attachment rather than
        // a second one, so a re-push is free.
        const result = await callLinear(
            `mutation { attachmentCreate(input: { issueId: "${target.id}", url: "${url}", title: ${quote(commit.subject)}, subtitle: ${quote(`${short(commit.sha)} · ${commit.branch}`)} }) { success } }`,
        );
        log(
            result === null
                ? `${target.id}: linking ${short(commit.sha)} FAILED`
                : `${target.id}: linked ${short(commit.sha)}`,
        );
    }

    if (target.closing) await close(target.id);
}

async function close(id: string) {
    const issue = await callLinear<{
        state: { type: string } | null;
        team: { states: { nodes: State[] } };
    }>(
        `query { issue(id: "${id}") { state { type } team { states(first: 50) { nodes { id name position type } } } } }`,
        'issue',
    );
    if (!issue) return log(`${id}: could not read the issue — not closing it`);

    if (issue.state?.type === 'completed')
        return log(`${id}: already completed — leaving it`);

    const done = pickDoneState(issue.team.states.nodes);
    if (!done) return log(`${id}: the team has no completed state`);

    const result = await callLinear(
        `mutation { issueUpdate(id: "${id}", input: { stateId: "${done.id}" }) { success } }`,
    );
    log(
        result === null
            ? `${id}: closing FAILED`
            : `${id}: closed — state → ${done.name}`,
    );
}

/** The legacy half: commits written with Linear's own keywords still get both writes. */
async function revert(job: Job) {
    const outstanding = new Map(job.magic.map((ref) => [ref.id, ref]));

    for (const delay of REVERT_DELAYS_MS) {
        if (outstanding.size === 0) break;
        await zx.sleep(delay);

        for (const [id, ref] of [...outstanding]) {
            const issue = await callLinear<{
                history: { nodes: HistoryNode[] };
                state: { id: string } | null;
            }>(
                `query { issue(id: "${id}") { state { id } history(first: ${HISTORY_PAGE}) { nodes { createdAt fromState { id name type } toState { id name type } toAssignee { name } } } } }`,
                'issue',
            );
            if (!issue) continue;

            const plan = planRevert({
                closing: ref.closing,
                currentStateId: issue.state?.id ?? null,
                history: issue.history.nodes,
                pushedAtMs: job.pushedAt,
            });
            // Nothing yet is not nothing ever — the integration may still be in
            // flight, so this id stays outstanding until the deadline.
            if (plan.reverts.length === 0) continue;

            for (const reason of plan.reasons) log(`${id}: ${reason}`);
            for (const item of plan.reverts) {
                const input =
                    item.kind === 'unassign'
                        ? 'assigneeId: null'
                        : `stateId: "${item.stateId}"`;
                const result = await callLinear(
                    `mutation { issueUpdate(id: "${id}", input: { ${input} }) { success } }`,
                );
                log(
                    result === null
                        ? `${id}: ${item.kind} FAILED`
                        : `${id}: applied ${item.kind}`,
                );
            }
            outstanding.delete(id);
        }
    }

    for (const id of outstanding.keys())
        log(`${id}: nothing to undo inside the window`);
}

async function callLinear<T = unknown>(
    query: string,
    field?: string,
): Promise<T | null> {
    const result = await zx.$`linear api ${query}`.nothrow();
    if (result.exitCode !== 0) {
        log(`linear api failed — ${result.stderr.trim()}`);
        return null;
    }

    const body = JSON.parse(result.stdout);
    if (body.errors) {
        log(`linear api errored — ${JSON.stringify(body.errors)}`);
        return null;
    }

    return (field ? body.data?.[field] : body.data) ?? null;
}

// Declarations, not const arrows: the verb dispatch at the top of this file runs
// before a const initialiser further down has been evaluated.
/** A commit subject is arbitrary text going into a GraphQL string literal. */
function quote(value: string) {
    return JSON.stringify(value);
}

function short(sha: string) {
    return sha.slice(0, 7);
}

function commitCount(links: LinkTarget[]) {
    const shas = new Set(
        links.flatMap((link) => link.commits.map((commit) => commit.sha)),
    );
    return `${shas.size} commit${shas.size === 1 ? '' : 's'}`;
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

/* Types */
type Job = {
    landing: { localOid: string; remoteRef: string }[];
    links: LinkTarget[];
    magic: MagicRef[];
    pushedAt: number;
    remote: Remote;
    remoteName: string;
    root: string;
};
