import { useEffect, useState } from 'react';
import {
    Icon,
    type LaunchProps,
    List,
    PopToRootType,
    closeMainWindow,
    getSelectedText,
    open,
} from '@raycast/api';
import { useCachedPromise, usePromise } from '@raycast/utils';

import { IssueListItem } from './components/IssueListItem';
import {
    type LinearIssue,
    readRecentIssueList,
    searchIssues,
    toIssueAppUrl,
} from './lib/linear';

const LinearQueryTickets = (props: LinearQueryTicketsProps) => {
    const argument = props.arguments.query ?? '';
    const [searchText, setSearchText] = useState(argument);
    const term = searchText.trim();
    const isSearching = term.length > 0;

    // The shortcut lane: an identifier reaches the issue itself instead of searching for it.
    const { data: shortcutId, isLoading: isResolvingShortcut } = usePromise(
        toShortcutId,
        [argument],
    );

    useEffect(() => {
        if (!shortcutId) return;

        // Closing with the default pop behaviour leaves this command's view alive, so the
        // NEXT press of the hotkey re-enters that list instead of mounting the command —
        // no effect runs, nothing opens, and raycast appears to have swallowed the press.
        // Popping to root immediately makes every launch a fresh one.
        open(toIssueAppUrl(shortcutId)).then(() =>
            closeMainWindow({
                clearRootSearch: true,
                popToRootType: PopToRootType.Immediate,
            }),
        );
    }, [shortcutId]);

    const isReadable = !isResolvingShortcut && !shortcutId;

    const { data: hitList, isLoading: isSearchLoading } = useCachedPromise(
        searchIssues,
        [term],
        {
            execute: isSearching && isReadable,
            failureToastOptions: { title: 'linear search failed' },
            initialData: [],
            keepPreviousData: true,
        },
    );

    // An empty search bar opens on the workspace's most recent work rather than an empty
    // window — the same landing linear's own search gives.
    const { data: recentList, isLoading: isRecentLoading } = useCachedPromise(
        readRecentIssueList,
        [],
        {
            execute: !isSearching && isReadable,
            failureToastOptions: { title: 'could not read recent issues' },
            initialData: [],
        },
    );

    const issueList = (isSearching ? hitList : recentList).filter(
        isCurrentShape,
    );
    const isLoading = isSearchLoading || isRecentLoading || isResolvingShortcut;

    const issueListJSX = issueList.map((issue) => {
        return <IssueListItem issue={issue} key={issue.id} />;
    });

    // The shortcut lane is meant to be invisible: while the selection is being read, and
    // once an id is found, the window is on its way out — rendering the search prompt in
    // that gap is what makes a hotkey press look like "raycast opened instead".
    if (isResolvingShortcut || shortcutId) return <List isLoading />;

    const emptyViewJSX = (
        <List.EmptyView
            description={
                isSearching && !isLoading
                    ? `nothing in this workspace contains "${term}".`
                    : "reads titles, bodies and comments — linear's own search reads titles only."
            }
            icon={Icon.MagnifyingGlass}
            title={isSearching && !isLoading ? 'no matches' : 'search linear'}
        />
    );

    return (
        <List
            isLoading={isLoading}
            onSearchTextChange={setSearchText}
            searchBarPlaceholder='search titles, bodies and comments…'
            searchText={searchText}
            throttle>
            {issueListJSX.length === 0 ? (
                emptyViewJSX
            ) : (
                <List.Section
                    subtitle={toCountText(issueListJSX.length)}
                    title={isSearching ? 'matches' : 'updated recently'}>
                    {issueListJSX}
                </List.Section>
            )}
        </List>
    );
};

export default LinearQueryTickets;

/* Helpers */
const issueIdPattern = /^(DOT|BYT)-\d+$/i;

const toCountText = (count: number) =>
    count === 1 ? '1 issue' : `${count} issues`;

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
// 📌 Adding a container field to the query means adding it here.
const isCurrentShape = (issue: LinearIssue) => {
    return (
        Array.isArray(issue.labels?.nodes) &&
        Array.isArray(issue.attachments?.nodes) &&
        Boolean(issue.team)
    );
};

/* Types */
// The generated `Arguments.LinearQueryTickets` is not used here: raycast-env.d.ts is gitignored,
// so that namespace is missing on a fresh checkout and ci would typecheck red.
// Mirrors the command argument in package.json.
type LinearQueryTicketsProps = LaunchProps<{ arguments: { query?: string } }>;
