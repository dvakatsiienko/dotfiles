/**
 * ? What a push does to Linear, and how to undo the half of it nobody asked for.
 * ?
 * ? Linear's github integration watches pushes. A commit body carrying a magic
 * ? word writes to that ticket — and writes TWICE: the state move you asked for
 * ? by choosing the keyword, plus an assignee it was never asked for. There is no
 * ? setting; Linear resolves the actor from the pusher, so a commit-author
 * ? identity does not reach it either. The only fix is to reverse it after.
 * ?
 * ? Everything here is pure, because the guard that makes the reversal safe is a
 * ? time window and a time window is exactly the thing that must be testable
 * ? without a real push.
 */

/** One line of git's pre-push stdin: `<local ref> <local oid> <remote ref> <remote oid>`. */
export type PushedRef = {
    localOid: string;
    localRef: string;
    remoteOid: string;
    remoteRef: string;
};

export type MagicRef = {
    /** A closing keyword's state move is wanted, so it is never reverted. */
    closing: boolean;
    id: string;
};

export type HistoryNode = {
    createdAt: string;
    fromState: { id: string; name: string; type: string } | null;
    toAssignee: { name: string } | null;
    toState: { id: string; name: string; type: string } | null;
};

export type Revert =
    | { kind: 'state'; stateId: string; stateName: string }
    | { kind: 'unassign' };

export type Plan = {
    reverts: Revert[];
    /** One line per decision, kept whether or not anything is reverted. */
    reasons: string[];
};

/**
 * The two guards that keep this off other people's work, and off Dima's tracker
 * when a foreign repo happens to share a ticket prefix. Both are one-line edits
 * when a new org or a new team appears; neither string is repeated anywhere else.
 */
export const ALLOWED_OWNERS = new Set(['dvakatsiienko']);
export const ALLOWED_HOST = 'github.com';
export const TEAM_PREFIXES = ['DOT', 'BYT'] as const;

const ZERO_OID = /^0+$/;

// Covers the three shapes git writes: scp-style ssh, ssh:// and https, with or
// without the .git suffix. Anything else returns null and the caller stands down.
const REMOTE_URL =
    /^(?:git@|ssh:\/\/git@|https:\/\/)([^/:]+)[/:]([^/]+)\/(.+?)(?:\.git)?$/;

// `\b` is what keeps `refs` from matching inside `refactor`. The two-word forms
// are written out rather than made optional — `part` alone is not a magic word.
const NON_CLOSING =
    'refs?|references|part of|contributes towards?|contributes to|towards?';
const CLOSING =
    'close[sd]?|fix(?:e[sd])?|resolve[sd]?|complete[sd]?|implement(?:s|ed)?';
const TICKET = `((?:${TEAM_PREFIXES.join('|')})-\\d+)`;

const magicWord = (words: string) =>
    new RegExp(`\\b(?:${words})\\s+${TICKET}\\b`, 'gi');

/**
 * Fail closed: an unparseable url, a foreign host or a foreign owner all mean
 * "not Dima's repo", and the correct behaviour in someone else's repo is to do
 * nothing at all. The reason is returned rather than logged here so the caller
 * can say which of the two it was — "guarded" must be legible from "broken".
 */
export function checkRemoteOwner(url: string): { ok: boolean; reason: string } {
    const match = REMOTE_URL.exec(url.trim());
    if (!match)
        return { ok: false, reason: `remote url not recognised: ${url}` };

    const [, host = '', owner = ''] = match;
    if (host !== ALLOWED_HOST)
        return {
            ok: false,
            reason: `remote host ${host} is not ${ALLOWED_HOST}`,
        };
    if (!ALLOWED_OWNERS.has(owner))
        return {
            ok: false,
            reason: `remote owner ${owner} is not one of ours`,
        };

    return { ok: true, reason: `${host}/${owner}` };
}

export function parsePushedRefs(stdin: string): PushedRef[] {
    return stdin
        .split('\n')
        .map((line) => line.trim().split(/\s+/))
        .filter((parts) => parts.length === 4)
        .map(([localRef, localOid, remoteRef, remoteOid]) => ({
            localOid: localOid ?? '',
            localRef: localRef ?? '',
            remoteOid: remoteOid ?? '',
            remoteRef: remoteRef ?? '',
        }))
        .filter((ref) => !ZERO_OID.test(ref.localOid));
}

/**
 * Revision args for `git log`, scoped to what this ref actually adds to the
 * remote. A brand-new branch has no remote oid to subtract, so it is bounded by
 * every other remote instead — without that it would walk the whole history and
 * re-revert tickets that were settled months ago.
 */
export function pushRange(ref: PushedRef): string[] {
    return ZERO_OID.test(ref.remoteOid)
        ? [ref.localOid, '--not', '--remotes']
        : [`${ref.remoteOid}..${ref.localOid}`];
}

/** Closing wins: a ticket both referenced and closed is being closed. */
export function magicRefsIn(messages: string[]): MagicRef[] {
    const found = new Map<string, boolean>();
    for (const message of messages)
        for (const [words, closing] of [
            [NON_CLOSING, false],
            [CLOSING, true],
        ] as const)
            for (const match of message.matchAll(magicWord(words))) {
                const id = match[1]?.toUpperCase();
                if (id) found.set(id, closing || (found.get(id) ?? false));
            }

    return [...found].map(([id, closing]) => ({ closing, id }));
}

/**
 * Decide what to undo on one ticket.
 *
 * The window is the whole guard. The integration writes AS Dima, so the actor
 * field cannot tell his edits from its own — only the fact that its write lands
 * within seconds of the push can. Anything stamped before the push is his, and
 * is untouchable.
 */
export function planRevert(options: {
    closing: boolean;
    currentStateId: string | null;
    history: HistoryNode[];
    pushedAtMs: number;
}): Plan {
    const { closing, currentStateId, history, pushedAtMs } = options;
    const reasons: string[] = [];
    const reverts: Revert[] = [];

    const fresh = history
        .filter((node) => Date.parse(node.createdAt) >= pushedAtMs)
        .sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));

    if (fresh.length === 0) {
        reasons.push(
            'no history entry after the push — the integration wrote nothing',
        );
        return { reasons, reverts };
    }

    if (fresh.some((node) => node.toAssignee !== null)) {
        reverts.push({ kind: 'unassign' });
        reasons.push('assignee was set after the push — clearing it');
    }

    // The oldest post-push move holds the state the ticket had before the
    // integration touched it; anything later is its own churn.
    const moved = fresh.find((node) => node.toState !== null);
    if (!moved?.fromState || !moved.toState) {
        reasons.push('no state move after the push — leaving state alone');
        return { reasons, reverts };
    }

    if (closing)
        reasons.push(
            `${moved.fromState.name} → ${moved.toState.name} came from a closing keyword — wanted, keeping it`,
        );
    else if (moved.toState.type === 'completed')
        reasons.push(
            `${moved.toState.name} is a completed state — refusing to reopen it automatically`,
        );
    else if (currentStateId === moved.fromState.id)
        reasons.push(
            `state is already back at ${moved.fromState.name} — nothing to undo`,
        );
    else
        reverts.push({
            kind: 'state',
            stateId: moved.fromState.id,
            stateName: moved.fromState.name,
        });

    return { reasons, reverts };
}
