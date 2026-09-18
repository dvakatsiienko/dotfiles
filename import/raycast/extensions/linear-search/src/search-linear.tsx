import { Action, ActionPanel, Icon, List, getPreferenceValues } from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";
import { useState } from "react";

const SearchLinear = () => {
    const [searchText, setSearchText] = useState("");
    const term = searchText.trim();

    const { data, isLoading } = useCachedPromise(searchIssues, [term], {
        execute: term.length > 0,
        initialData: [],
        keepPreviousData: true,
        failureToastOptions: { title: "Linear search failed" },
    });

    const issueListJSX = data.map((issue) => {
        return (
            <List.Item
                key={issue.id}
                icon={Icon.Ticket}
                title={issue.identifier}
                subtitle={issue.title}
                accessories={[{ text: issue.state.name }]}
                actions={
                    <ActionPanel>
                        <Action.Open
                            icon={Icon.ArrowRight}
                            target={toAppUrl(issue.url)}
                            title="Open in Linear"
                        />
                        <Action.CopyToClipboard content={issue.url} title="Copy Issue URL" />
                    </ActionPanel>
                }
            />
        );
    });

    const isPrompting = term.length === 0 || isLoading;

    const emptyViewJSX = (
        <List.EmptyView
            description={
                isPrompting
                    ? "Reads titles, descriptions and comments — Linear's own search reads titles only."
                    : `Nothing in this workspace contains "${term}".`
            }
            icon={Icon.MagnifyingGlass}
            title={isPrompting ? "Search Linear" : "No matches"}
        />
    );

    return (
        <List
            isLoading={isLoading}
            onSearchTextChange={setSearchText}
            searchBarPlaceholder="Search titles, descriptions and comments…"
            throttle
        >
            {issueListJSX.length === 0 ? emptyViewJSX : issueListJSX}
        </List>
    );
};

export default SearchLinear;

/* Helpers */
const linearApi = "https://api.linear.app/graphql";
const resultLimit = 20;

const searchQuery = `
  query FullTextSearch($term: String!, $first: Int!) {
    issues(
      first: $first
      filter: {
        or: [
          { title: { containsIgnoreCase: $term } }
          { description: { containsIgnoreCase: $term } }
          { comments: { body: { containsIgnoreCase: $term } } }
        ]
      }
    ) {
      nodes {
        id
        identifier
        title
        url
        state {
          name
        }
      }
    }
  }
`;

const searchIssues = async (term: string): Promise<Issue[]> => {
    const response = await fetch(linearApi, {
        method: "POST",
        headers: {
            Authorization: getPreferenceValues<Preferences>().linearApiKey,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: searchQuery, variables: { term, first: resultLimit } }),
    });

    if (!response.ok) {
        throw new Error(`Linear replied ${response.status} ${response.statusText}`);
    }

    const payload = (await response.json()) as SearchPayload;
    const firstError = payload.errors?.[0];

    if (firstError) {
        throw new Error(firstError.message);
    }

    return payload.data?.issues.nodes ?? [];
};

// The api hands back the web url; the same path under the linear:// scheme opens the desktop app.
const toAppUrl = (url: string) => url.replace(/^https:\/\//, "linear://");

/* Types */
interface Issue {
    id: string;
    identifier: string;
    title: string;
    url: string;
    state: { name: string };
}

interface SearchPayload {
    data?: { issues: { nodes: Issue[] } };
    errors?: { message: string }[];
}
