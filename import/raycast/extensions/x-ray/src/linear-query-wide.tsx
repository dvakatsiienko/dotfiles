import { useEffect, useState } from 'react';
import {
    Action,
    ActionPanel,
    Color,
    Icon,
    type LaunchProps,
    List,
    closeMainWindow,
    getSelectedText,
    open,
} from '@raycast/api';
import { useCachedPromise, usePromise } from '@raycast/utils';

import {
    type LinearIssue,
    searchIssues,
    toIssueAppUrl,
    toLinearAppUrl,
} from './lib/linear';

const LinearQueryWide = (props: LinearQueryWideProps) => {
    const argument = props.arguments.query ?? '';
    const [searchText, setSearchText] = useState(argument);
    const [isShowingDetail, setIsShowingDetail] = useState(false);
    const term = searchText.trim();

    // The shortcut lane: an identifier reaches the issue itself instead of searching for it.
    const { data: shortcutId, isLoading: isResolvingShortcut } = usePromise(
        toShortcutId,
        [argument],
    );

    useEffect(() => {
        if (!shortcutId) return;

        open(toIssueAppUrl(shortcutId)).then(() => closeMainWindow());
    }, [shortcutId]);

    const { data, isLoading } = useCachedPromise(searchIssues, [term], {
        execute: term.length > 0 && !isResolvingShortcut && !shortcutId,
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
                accessories={
                    isShowingDetail ? undefined : toAccessoryList(issue)
                }
                actions={
                    <ActionPanel>
                        <Action.Open
                            icon={Icon.ArrowRight}
                            target={toLinearAppUrl(issue.url)}
                            title='Open in Linear'
                        />
                        <Action
                            icon={Icon.Sidebar}
                            onAction={() =>
                                setIsShowingDetail(!isShowingDetail)
                            }
                            shortcut={{ key: 'd', modifiers: ['cmd', 'shift'] }}
                            title={
                                isShowingDetail
                                    ? 'Hide Details'
                                    : 'Show Details'
                            }
                        />
                        <Action.CopyToClipboard
                            content={issue.identifier.toUpperCase()}
                            shortcut={{ key: '.', modifiers: ['cmd'] }}
                            title='Copy Identifier'
                        />
                        <Action.CopyToClipboard
                            content={issue.url}
                            title='Copy Issue URL'
                        />
                    </ActionPanel>
                }
                detail={<IssueDetail issue={issue} />}
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
            isLoading={isLoading || isResolvingShortcut}
            isShowingDetail={isShowingDetail && issueListJSX.length > 0}
            onSearchTextChange={setSearchText}
            searchBarPlaceholder='Search titles, bodies and comments…'
            searchText={searchText}
            throttle>
            {issueListJSX.length === 0 ? emptyViewJSX : issueListJSX}
        </List>
    );
};

const IssueDetail = (props: IssueDetailProps) => {
    const labelList = props.issue.labels.nodes;

    const labelTagJSX = labelList.map((label) => {
        return (
            <List.Item.Detail.Metadata.TagList.Item
                color={label.color}
                key={label.id}
                text={label.name}
            />
        );
    });

    return (
        <List.Item.Detail
            markdown={toBodyPreview(props.issue)}
            metadata={
                <List.Item.Detail.Metadata>
                    <List.Item.Detail.Metadata.Label
                        icon={toStateIcon(props.issue)}
                        text={props.issue.state.name}
                        title='State'
                    />
                    <List.Item.Detail.Metadata.Label
                        text={props.issue.team.name}
                        title='Team'
                    />
                    <List.Item.Detail.Metadata.Label
                        text={props.issue.assignee?.displayName ?? 'unassigned'}
                        title='Assignee'
                    />
                    {labelList.length === 0 ? (
                        <List.Item.Detail.Metadata.Label
                            text='none'
                            title='Labels'
                        />
                    ) : (
                        <List.Item.Detail.Metadata.TagList title='Labels'>
                            {labelTagJSX}
                        </List.Item.Detail.Metadata.TagList>
                    )}
                </List.Item.Detail.Metadata>
            }
        />
    );
};

export default LinearQueryWide;

/* Helpers */
const issueIdPattern = /^(DOT|BYT)-\d+$/i;
const bodyPreviewLineCount = 12;

// The argument wins; a bare launch falls back to whatever is selected in the frontmost app,
// which is how the `ql` quicklink was used. getSelectedText throws when nothing is selected
// or accessibility is off — both are the ordinary case here, not a failure worth a toast.
const toShortcutId = async (argument: string) => {
    const typed = argument.trim();

    if (typed) return issueIdPattern.test(typed) ? typed.toUpperCase() : null;

    const selected = (await getSelectedText().catch(() => '')).trim();

    return issueIdPattern.test(selected) ? selected.toUpperCase() : null;
};

// useCachedPromise builds its cache key from the arguments alone — the function body is not
// part of it, so a payload written by an older version of this command survives every change
// to the query, and gets rendered before the refetch behind it lands. Reading a field that
// version never fetched throws, so a hit that predates the current shape is dropped.
// 📌 Adding a field to the query means adding it here.
const isCurrentShape = (issue: LinearIssue) => {
    return Array.isArray(issue.labels?.nodes) && Boolean(issue.team);
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
    const priority = priorityGlyph[issue.priority];
    // Priority 0 is "no priority", which most of the board is — a glyph for it would be a
    // dash on nearly every row saying nothing.
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
        { date: new Date(issue.updatedAt), tooltip: 'updated' },
        ...priorityAccessoryList,
    ];
};

const toBodyPreview = (issue: LinearIssue) => {
    const body = issue.description?.trim();

    if (!body) return `## ${issue.title}\n\n_No description._`;

    const lineList = body.split('\n');
    const preview = lineList.slice(0, bodyPreviewLineCount).join('\n');
    const isClipped = lineList.length > bodyPreviewLineCount;

    return `## ${issue.title}\n\n${preview}${isClipped ? '\n\n_…_' : ''}`;
};

/* Types */
// The generated `Arguments.LinearQueryWide` is not used here: raycast-env.d.ts is gitignored,
// so that namespace is missing on a fresh checkout and ci would typecheck red.
// Mirrors the command argument in package.json.
type LinearQueryWideProps = LaunchProps<{ arguments: { query?: string } }>;

interface IssueDetailProps {
    issue: LinearIssue;
}

interface PriorityGlyph {
    icon: Icon;
    name: string;
    tint: Color;
}
