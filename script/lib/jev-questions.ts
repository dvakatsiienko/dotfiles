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
                'A concrete todo an agent can finish this session or the next, alongside other work, with no plan and no decision from dima: a freebie, a check, a leftovers sweep, or an fyi whose only action is updating a file, a map, or a list the fleet keeps. Logged in the flowlog with a status.',
            fold: 'Attaches to an existing ticket or a thread already tracked: the text names or links the ticket, or says «+1», «add this», «fold». No new ticket.',
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

// bands from the self-consistency cookbook: below → act, between → dima's ⏳ block, above → act
export const verdictBand = { high: 0.7, low: 0.3 } as const;
