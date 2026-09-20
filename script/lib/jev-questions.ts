import type { Question } from './jev.ts';

// every rubric the fleet sends to jev lives here, so a wording change is a reviewable diff.
// criteria carry the fleet's meaning: jev knows no word we do not define (playground, 2026-09-19:
// null criteria → 73 % ticket; defined criteria → 89 % flowlog on the same line).

export const inboxQuestions = {
    lane: {
        criteria: {
            answer: 'Dima wants a reply: a question, or an idea filed under the `💡` ideas section, where he expects a reaction and a suggestion, not a build.',
            drop: 'Nothing to do and nothing to record: an observation or a thought with no action wanted.',
            flowlog:
                'A concrete todo an agent can finish this session or the next, alongside other work, with no plan and no decision from dima: a freebie, a check, a leftovers sweep, a deletion or cleanup job dima describes step by step and wants done now, or an fyi whose only action is updating a file, a map, or a list the fleet keeps. Logged in the flowlog with a status.',
            fold: 'Attaches to an existing ticket or a thread already tracked: the text names a ticket id (DOT-N, BYT-N) or links the ticket, or says «+1», «add this», «fold», «resolve <id>». No new ticket, even when the ask is large.',
            ticket: 'New work that needs its own session: a plan, a design, a decision from dima, or a coder spawned for it. Becomes a new linear ticket.',
        },
        instructions:
            'Which lane should the coordinator route `item` to? `section` is the inbox heading dima filed it under and says what he expects back. A freebie is a small change an agent can finish in one pass without approval.',
        type: 'choice',
    },
    needsVerdict: {
        criteria: {
            false: 'The item states what to do clearly enough that an agent can act and report.',
            true: 'The item leaves a choice open (which option, whether at all, how much) that an agent must not guess.',
        },
        instructions:
            'Does resolving `item` require a decision only dima can make before an agent acts?',
        type: 'noul',
    },
} as const satisfies Record<string, Question>;

// a flawlog line at the halt flush: where does it go? (the flawlog skill's own rule: fixed in place
// → never logged; only what survives the attempt reaches the log, and the flush places each line)
export const flawlogQuestions = {
    lane: {
        criteria: {
            drop: 'Already resolved, or a one-off with nothing transferable: the line names a fix that was applied, says «drop», or records a good find with no rule behind it.',
            memory: 'A standing fact or habit one agent role keeps: a measured behaviour of a tool, a convention cclio or a coder must remember, a thing that belongs in a memory leaf, an AGENTS.md or a skill.',
            rule: 'A hazard or floor that bites more than one surface and every session must know: it belongs in a fleet-wide rules file such as fleet-hazards.',
            story: "A line marked GOOD, or a catch where dima's felt sense arrived before the reason: kept as a story in dima-stories, never as a rule.",
            ticket: 'Needs code, a script, a build, or a decision from dima before it is closed: work with its own session, tracked in linear.',
        },
        instructions:
            'Where should the coordinator place `line` at the flawlog flush? `log` is the session log it came from.',
        type: 'choice',
    },
} as const satisfies Record<string, Question>;

// bands from the self-consistency cookbook: below → act, between → dima's ⏳ block, above → act
export const verdictBand = { high: 0.7, low: 0.3 } as const;
