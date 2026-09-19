const endpoint = 'https://api.typesafe.ai/v1/systemone';

// pinned on purpose: thresholds are tuned per version, `jev-latest` moves under them
export const model = 'jev-1.13.0';

export async function judge<Q extends Record<string, Question>>(
    state: unknown,
    questions: Q,
) {
    const apiKey = process.env.TYPESAFE_API_KEY;
    if (!apiKey)
        throw new Error(
            'TYPESAFE_API_KEY missing — run through script/op-run.sh',
        );

    for (let attempt = 0; ; attempt++) {
        const res = await fetch(endpoint, {
            body: JSON.stringify({ model, questions, state }),
            headers: {
                authorization: `Bearer ${apiKey}`,
                'content-type': 'application/json',
            },
            method: 'POST',
        });
        if (res.ok) return (await res.json()) as JevResponse<Q>;
        if ((res.status === 429 || res.status === 529) && attempt < 3) {
            await new Promise((r) => setTimeout(r, 500 * 2 ** attempt));
            continue;
        }
        throw new Error(`jev ${res.status}: ${await res.text()}`);
    }
}

/* Types */

export type Question =
    | {
          type: 'noul';
          instructions: string;
          criteria?: { true: string; false: string };
      }
    | {
          type: 'choice';
          instructions: string;
          criteria: Record<string, string | null>;
      }
    | { type: 'score'; instructions: string; criteria: readonly string[] };

type Answer<Q extends Question> = Q extends { type: 'noul' }
    ? { type: 'noul'; noul: number }
    : Q extends { type: 'choice'; criteria: infer C }
      ? {
            type: 'choice';
            choice: keyof C & string;
            probabilities: Record<keyof C & string, number>;
            confidence: number;
        }
      : {
            type: 'score';
            score: number;
            legend: string;
            probabilities: Record<string, number>;
            confidence: number;
        };

export type JevResponse<Q extends Record<string, Question>> = {
    model: string;
    answers: { [K in keyof Q]: Answer<Q[K]> };
    usage: { input_tokens: number; output_tokens: number };
};
