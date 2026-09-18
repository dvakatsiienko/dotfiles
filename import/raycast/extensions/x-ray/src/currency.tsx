import { useState } from 'react';
import { Action, ActionPanel, Icon, List } from '@raycast/api';
import { usePromise } from '@raycast/utils';

import {
    type Rate,
    type RateSnapshot,
    currency,
    parseAmount,
    readRateList,
    toRateList,
} from './lib/monobank';

const Currency = () => {
    const [searchText, setSearchText] = useState('');
    const amount = parseAmount(searchText);

    const { data, isLoading } = usePromise(readRateList, [], {
        failureToastOptions: {
            title: 'monobank is unreachable and nothing is cached',
        },
    });

    const rateListJSX = (data ? toRateList(data.quoteList) : []).map((rate) => {
        const converted = amount === null ? null : amount * rate.sell;

        return (
            <List.Item
                accessories={[
                    { text: `buy ${rateFormat.format(rate.buy)}` },
                    { tag: `sell ${rateFormat.format(rate.sell)}` },
                ]}
                actions={
                    <ActionPanel>
                        {converted !== null && (
                            <Action.CopyToClipboard
                                content={converted.toFixed(2)}
                                icon={Icon.Clipboard}
                                title='Copy Converted Amount'
                            />
                        )}
                        <Action.CopyToClipboard
                            content={String(rate.sell)}
                            title='Copy Sell Rate'
                        />
                        <Action.CopyToClipboard
                            content={String(rate.buy)}
                            title='Copy Buy Rate'
                        />
                    </ActionPanel>
                }
                icon={Icon.Coins}
                key={`${rate.from}-${rate.to}`}
                subtitle={
                    amount === null ? undefined : toConversion(rate, amount)
                }
                title={`${rate.from} → ${rate.to}`}
            />
        );
    });

    const emptyViewJSX = (
        <List.EmptyView
            description='monobank sent no usd or eur pair, and nothing was cached.'
            icon={Icon.Coins}
            title={isLoading ? 'Reading monobank…' : 'No rates'}
        />
    );

    return (
        <List
            isLoading={isLoading}
            onSearchTextChange={setSearchText}
            searchBarPlaceholder='An amount to convert at the sell rate — 250, 1k, 10k'>
            {rateListJSX.length === 0 ? (
                emptyViewJSX
            ) : (
                <List.Section title={toSectionTitle(data)}>
                    {rateListJSX}
                </List.Section>
            )}
        </List>
    );
};

export default Currency;

/* Helpers */
const amountFormat = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
});
const rateFormat = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 4,
    minimumFractionDigits: 2,
});

const toConversion = (rate: Rate, amount: number) => {
    const from = `${amountFormat.format(amount)} ${currency[rate.from].symbol}`;
    const to = `${amountFormat.format(amount * rate.sell)} ${currency[rate.to].symbol}`;

    return `${from} = ${to}`;
};

// A stale snapshot means the refresh failed and these are older numbers. A rate shown as
// current when it is not is the one way this command can mislead.
const toSectionTitle = (snapshot: RateSnapshot | undefined) => {
    if (!snapshot?.isStale) return 'monobank';

    const minutes = Math.round((Date.now() - snapshot.fetchedAt) / 60_000);

    return `monobank — could not refresh, ${minutes}m old`;
};
