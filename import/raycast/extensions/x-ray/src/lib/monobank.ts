import { LocalStorage } from '@raycast/api';

// https://api.monobank.ua/bank/currency — public, no token, and cached five minutes
// server-side: asking more often answers 429. The LocalStorage copy keeps the command
// inside that budget however often raycast refreshes, and stands in when the network is gone.
const monobankApi = 'https://api.monobank.ua/bank/currency';
const cacheKey = 'monobank-currency';
const maxAgeMs = 5 * 60 * 1000;

export const currency = {
    EUR: { code: 978, flag: '🇪🇺', name: 'Euro', symbol: '€' },
    UAH: { code: 980, flag: '🇺🇦', name: 'Hryvnia', symbol: '₴' },
    USD: { code: 840, flag: '🇺🇸', name: 'US Dollar', symbol: '$' },
} as const;

// The pin list is stored as these ids, so a pin survives a reorder of `pairList`.
export const toRateId = (pair: Pair) => `${pair.from}-${pair.to}`;

export const readRateList = async (): Promise<RateSnapshot> => {
    const cached = await readCache();

    if (cached && Date.now() - cached.fetchedAt < maxAgeMs) {
        return { ...cached, isStale: false };
    }

    try {
        const snapshot: Snapshot = {
            fetchedAt: Date.now(),
            quoteList: await fetchQuoteList(),
        };
        await LocalStorage.setItem(cacheKey, JSON.stringify(snapshot));

        return { ...snapshot, isStale: false };
    } catch (error) {
        // A throttled or offline refresh keeps the previous copy rather than replacing live
        // rates with an error. Nothing cached yet is the only hard failure.
        if (!cached) throw error;

        return { ...cached, isStale: true };
    }
};

export const toRateList = (quoteList: Quote[]): Rate[] => {
    return pairList.flatMap((pair) => {
        const quote = quoteList.find((candidate) => {
            return (
                candidate.currencyCodeA === currency[pair.from].code &&
                candidate.currencyCodeB === currency[pair.to].code
            );
        });

        // monobank drops a pair from the feed rather than sending a stale one, and a pair
        // quoted only as a cross rate carries no buy/sell for us to show.
        if (!quote?.rateBuy || !quote.rateSell) return [];

        const rate: Rate = {
            buy: quote.rateBuy,
            from: pair.from,
            sell: quote.rateSell,
            to: pair.to,
        };

        return [rate, toInverseRate(rate)];
    });
};

// "1k" and "10k" are how the amount actually gets typed; a bare number is the rest of it.
export const parseAmount = (searchText: string) => {
    const match = /^(\d+(?:[.,]\d+)?)\s*(k?)$/i.exec(searchText.trim());

    if (!match) return null;

    const amount = Number(match[1]?.replace(',', '.')) * (match[2] ? 1000 : 1);

    return amount > 0 ? amount : null;
};

/* Helpers */
// monobank quotes a pair in one direction only and never sends the reverse, so the other
// side is derived. Inverting a buy/sell quote swaps the two columns as well as the two
// currencies: the rate the bank buys usd at is the rate it sells hryvnia at.
const toInverseRate = (rate: Rate): Rate => ({
    buy: 1 / rate.sell,
    from: rate.to,
    sell: 1 / rate.buy,
    to: rate.from,
});

const pairList = [
    { from: 'USD', to: 'UAH' },
    { from: 'EUR', to: 'UAH' },
    { from: 'EUR', to: 'USD' },
] as const satisfies readonly Pair[];

const readCache = async (): Promise<Snapshot | null> => {
    const raw = await LocalStorage.getItem<string>(cacheKey);

    if (!raw) return null;

    // LocalStorage outlives any shape this module ever had, so a copy written by an older
    // version is treated as no cache rather than trusted into the ui.
    try {
        const parsed = JSON.parse(raw) as Snapshot;

        const isUsable =
            Array.isArray(parsed.quoteList) &&
            Number.isFinite(parsed.fetchedAt);

        return isUsable ? parsed : null;
    } catch {
        return null;
    }
};

const fetchQuoteList = async (): Promise<Quote[]> => {
    const response = await fetch(monobankApi);

    if (!response.ok) {
        throw new Error(
            `monobank replied ${response.status} ${response.statusText}`,
        );
    }

    return (await response.json()) as Quote[];
};

/* Types */
export interface Rate extends Pair {
    buy: number;
    sell: number;
}

export interface RateSnapshot extends Snapshot {
    isStale: boolean;
}

export interface Pair {
    from: CurrencyName;
    to: CurrencyName;
}

interface Snapshot {
    fetchedAt: number;
    quoteList: Quote[];
}

interface Quote {
    currencyCodeA: number;
    currencyCodeB: number;
    rateBuy?: number;
    rateSell?: number;
}

type CurrencyName = keyof typeof currency;
