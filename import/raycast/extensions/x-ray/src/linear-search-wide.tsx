import { useState } from 'react';
import {
    Action,
    ActionPanel,
    Color,
    Icon,
    type LaunchProps,
    List,
} from '@raycast/api';
import { useCachedPromise } from '@raycast/utils';

import { type LinearIssue, searchIssues, toLinearAppUrl } from './lib/linear';

const LinearSearchWide = (props: LinearSearchWideProps) => {
    const [searchText, setSearchText] = useState(props.arguments.query ?? '');
    const term = searchText.trim();

    const { data, isLoading } = useCachedPromise(searchIssues, [term], {
        execute: term.length > 0,
        failureToastOptions: { title: 'Linear search failed' },
        initialData: [],
        keepPreviousData: true,
    });

    // keepPreviousData holds the last result after `execute` goes false, so an emptied
    // search bar would otherwise keep rendering the hits of the term the user just cleared.
    const hits = term.length === 0 ? [] : data.filter(isCurrentShape);

    const issueListJSX = hits.map((issue) => {
        return (
            <List.Item
                accessories={toAccessoryList(issue)}
                actions={
                    <ActionPanel>
                        <Action.Open
                            icon={Icon.ArrowRight}
                            target={toLinearAppUrl(issue.url)}
                            title='Open in Linear'
                        />
                        <Action.CopyToClipboard
                            content={issue.url}
                            title='Copy Issue URL'
                        />
                    </ActionPanel>
                }
                icon={toStateIcon(issue)}
                key={issue.id}
                subtitle={issue.title}
                title={issue.identifier}
            />
        );
    });

    const isPrompting = term.length === 0 || isLoading;

    const emptyViewJSX = (
        <List.EmptyView
            description={
                isPrompting
                    ? "Reads titles, bodies and comments — Linear's own search reads titles only."
                    : `Nothing in this workspace contains "${term}".`
            }
            icon={Icon.MagnifyingGlass}
            title={isPrompting ? 'Search Linear' : 'No matches'}
        />
    );

    return (
        <List
            isLoading={isLoading}
            onSearchTextChange={setSearchText}
            searchBarPlaceholder='Search titles, bodies and comments…'
            searchText={searchText}
            throttle>
            {issueListJSX.length === 0 ? emptyViewJSX : issueListJSX}
        </List>
    );
};

export default LinearSearchWide;

/* Helpers */
// useCachedPromise builds its cache key from the arguments alone — the function body is not
// part of it, so a payload written by an older version of this command survives every change
// to the query, and gets rendered before the refetch behind it lands. The version that
// shipped before labels existed crashes the row that renders them, so a hit that does not
// carry the current shape is dropped rather than shown.
const isCurrentShape = (issue: LinearIssue) => {
    return Array.isArray(issue.labels?.nodes);
};

const stateIcon: Record<string, Icon> = {
    backlog: Icon.CircleEllipsis,
    canceled: Icon.XMarkCircle,
    completed: Icon.CheckCircle,
    started: Icon.CircleProgress50,
    triage: Icon.QuestionMarkCircle,
    unstarted: Icon.Circle,
};

const priorityGlyph: Record<number, PriorityGlyph> = {
    1: { icon: Icon.ExclamationMark, name: 'urgent', tint: Color.Red },
    2: { icon: Icon.ArrowUp, name: 'high', tint: Color.Orange },
    3: { icon: Icon.Minus, name: 'medium', tint: Color.Yellow },
    4: { icon: Icon.ArrowDown, name: 'low', tint: Color.SecondaryText },
};

// Shape carries the category, tint carries the colour the workspace picked for that exact
// state — the same pairing linear's own sidebar uses, so a row reads without being read.
const toStateIcon = (issue: LinearIssue) => {
    return {
        source: stateIcon[issue.state.type] ?? Icon.Circle,
        tintColor: issue.state.color,
    };
};

const toAccessoryList = (issue: LinearIssue): List.Item.Accessory[] => {
    const labelAccessoryList: List.Item.Accessory[] = issue.labels.nodes.map(
        (label) => {
            return { tag: { color: label.color, value: label.name } };
        },
    );

    const priority = priorityGlyph[issue.priority];
    // Priority 0 is "no priority" and has no glyph — an icon for it would be noise on
    // most rows, since the board leaves it unset by default.
    const priorityAccessoryList: List.Item.Accessory[] = priority
        ? [
              {
                  icon: { source: priority.icon, tintColor: priority.tint },
                  tooltip: `priority: ${priority.name}`,
              },
          ]
        : [];

    return [
        { text: issue.state.name, tooltip: 'state' },
        ...labelAccessoryList,
        ...priorityAccessoryList,
    ];
};

/* Types */
// The generated `Arguments.LinearSearchWide` is not used here: raycast-env.d.ts is
// gitignored, so that namespace is missing on a fresh checkout and ci would typecheck red.
// Mirrors the command argument in package.json.
type LinearSearchWideProps = LaunchProps<{ arguments: { query?: string } }>;

interface PriorityGlyph {
    icon: Icon;
    name: string;
    tint: Color;
}
