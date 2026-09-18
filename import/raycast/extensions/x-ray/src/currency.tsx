import { useState } from 'react';
import { Action, ActionPanel, Color, Icon, List } from '@raycast/api';
import { useLocalStorage, usePromise } from '@raycast/utils';

import {
    type Rate,
    type RateSnapshot,
    currency,
    parseAmount,
    readRateList,
    toRateId,
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
    const {
        isLoading: isPinnedLoading,
        setValue: setPinnedIdList,
        value: storedPinnedIdList,
    } = useLocalStorage<string[]>(pinnedKey, []);

    const rateList = data ? toRateList(data.quoteList) : [];
    const pinnedIdList = storedPinnedIdList ?? [];
    const staleNote = toStaleNote(data);

    const handlePin = (rate: Rate) => {
        const id = toRateId(rate);

        return setPinnedIdList(
            pinnedIdList.includes(id)
                ? pinnedIdList.filter((pinnedId) => pinnedId !== id)
                : [...pinnedIdList, id],
        );
    };

    const toRowJSX = (rate: Rate) => {
        return (
            <RateRow
                amount={amount}
                isPinned={pinnedIdList.includes(toRateId(rate))}
                key={toRateId(rate)}
                onPin={handlePin}
                rate={rate}
                staleNote={staleNote}
            />
        );
    };

    // The pinned section reads from the stored ids rather than filtering the rate list, so
    // the rows sit in the order he pinned them in.
    const pinnedListJSX = pinnedIdList.flatMap((id) => {
        const rate = rateList.find((candidate) => toRateId(candidate) === id);

        return rate ? [toRowJSX(rate)] : [];
    });
    const restListJSX = rateList
        .filter((rate) => !pinnedIdList.includes(toRateId(rate)))
        .map(toRowJSX);

    const emptyViewJSX = (
        <List.EmptyView
            description='monobank sent no usd or eur pair, and nothing was cached.'
            icon={Icon.Coins}
            title={isLoading ? 'Reading monobank…' : 'No rates'}
        />
    );

    return (
        <List
            isLoading={isLoading || isPinnedLoading}
            onSearchTextChange={setSearchText}
            searchBarPlaceholder='An amount to convert at the sell rate — 250, 1k, 10k'>
            {rateList.length === 0 && emptyViewJSX}
            {pinnedListJSX.length > 0 && (
                <List.Section title='Pinned'>{pinnedListJSX}</List.Section>
            )}
            {restListJSX.length > 0 && (
                <List.Section title='All'>{restListJSX}</List.Section>
            )}
        </List>
    );
};

const RateRow = (props: RateRowProps) => {
    const converted =
        props.amount === null ? null : props.amount * props.rate.sell;

    return (
        <List.Item
            accessories={toAccessoryList(props)}
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
                        content={String(props.rate.sell)}
                        title='Copy Sell Rate'
                    />
                    <Action.CopyToClipboard
                        content={String(props.rate.buy)}
                        title='Copy Buy Rate'
                    />
                    <Action
                        icon={props.isPinned ? Icon.PinDisabled : Icon.Pin}
                        onAction={() => props.onPin(props.rate)}
                        shortcut={{ key: 'p', modifiers: ['cmd', 'shift'] }}
                        title={props.isPinned ? 'Unpin Pair' : 'Pin Pair'}
                    />
                </ActionPanel>
            }
            icon={currency[props.rate.from].flag}
            subtitle={toRateText(props.rate)}
            title={`${props.rate.from} – ${props.rate.to}`}
        />
    );
};

export default Currency;

/* Helpers */
const pinnedKey = 'currency-pinned';
const amountFormat = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
});
const rateFormat = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 4,
    minimumFractionDigits: 2,
});

const toRateText = (rate: Rate) => {
    return `${rateFormat.format(rate.buy)} / ${rateFormat.format(rate.sell)}`;
};

const toConversion = (rate: Rate, amount: number) => {
    const from = `${amountFormat.format(amount)} ${currency[rate.from].symbol}`;
    const to = `${amountFormat.format(amount * rate.sell)} ${currency[rate.to].symbol}`;

    return `${from} = ${to}`;
};

const toAccessoryList = (props: RateRowProps): List.Item.Accessory[] => {
    const conversionAccessoryList: List.Item.Accessory[] =
        props.amount === null
            ? []
            : [
                  {
                      tag: {
                          color: Color.Green,
                          value: toConversion(props.rate, props.amount),
                      },
                  },
              ];

    const staleAccessoryList: List.Item.Accessory[] = props.staleNote
        ? [
              {
                  icon: { source: Icon.Warning, tintColor: Color.Orange },
                  tooltip: props.staleNote,
              },
          ]
        : [];

    return [
        ...conversionAccessoryList,
        ...staleAccessoryList,
        {
            text: `${currency[props.rate.from].name} – ${currency[props.rate.to].name}`,
        },
    ];
};

// A stale snapshot means the refresh failed and these are older numbers. A rate shown as
// current when it is not is the one way this command can mislead, so the warning rides every
// row — a section header would disappear the moment every pair is pinned.
const toStaleNote = (snapshot: RateSnapshot | undefined) => {
    if (!snapshot?.isStale) return null;

    const minutes = Math.round((Date.now() - snapshot.fetchedAt) / 60_000);

    return `could not refresh — these numbers are ${minutes}m old`;
};

/* Types */
interface RateRowProps {
    amount: number | null;
    isPinned: boolean;
    onPin: (rate: Rate) => void;
    rate: Rate;
    staleNote: string | null;
}
