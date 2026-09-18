import { useState } from 'react';
import { Action, ActionPanel, Icon, List } from '@raycast/api';
import { useCachedPromise } from '@raycast/utils';

import { searchIssues, toLinearAppUrl } from './lib/linear';

const LinearSearchWide = () => {
    const [searchText, setSearchText] = useState('');
    const term = searchText.trim();

    const { data, isLoading } = useCachedPromise(searchIssues, [term], {
        execute: term.length > 0,
        failureToastOptions: { title: 'Linear search failed' },
        initialData: [],
        keepPreviousData: true,
    });

    // keepPreviousData holds the last result after `execute` goes false, so an emptied
    // search bar would otherwise keep rendering the hits of the term the user just cleared.
    const hits = term.length === 0 ? [] : data;

    const issueListJSX = hits.map((issue) => {
        return (
            <List.Item
                accessories={[{ text: issue.state.name }]}
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
                icon={Icon.Ticket}
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
            throttle>
            {issueListJSX.length === 0 ? emptyViewJSX : issueListJSX}
        </List>
    );
};

export default LinearSearchWide;
