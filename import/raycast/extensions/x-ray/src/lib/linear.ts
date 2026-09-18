import { getPreferenceValues } from '@raycast/api';

const linearApi = 'https://api.linear.app/graphql';
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
        priority
        updatedAt
        description
        assignee {
          displayName
        }
        team {
          key
          name
        }
        labels {
          nodes {
            id
            name
            color
          }
        }
        state {
          name
          type
          color
        }
      }
    }
  }
`;

export const searchIssues = async (term: string): Promise<LinearIssue[]> => {
    const response = await fetch(linearApi, {
        body: JSON.stringify({
            query: searchQuery,
            variables: { first: resultLimit, term },
        }),
        headers: {
            Authorization:
                getPreferenceValues<LinearPreferences>().linearApiKey,
            'Content-Type': 'application/json',
        },
        method: 'POST',
    });

    if (!response.ok) {
        throw new Error(
            `Linear replied ${response.status} ${response.statusText}`,
        );
    }

    const payload = (await response.json()) as SearchPayload;
    const firstError = payload.errors?.[0];

    if (firstError) {
        throw new Error(firstError.message);
    }

    return payload.data?.issues.nodes ?? [];
};

// The api hands back the web url; the same path under the linear:// scheme opens the desktop app.
export const toLinearAppUrl = (url: string) =>
    url.replace(/^https:\/\//, 'linear://');

// The shortcut lane never sees an api url — an identifier typed or selected is the whole
// input — so this is the one place the workspace slug has to be spelled out.
export const toIssueAppUrl = (identifier: string) =>
    `linear://linear.app/x-com/issue/${identifier}`;

/* Types */
// Declared here rather than taken from the generated `Preferences.LinearQueryWide`:
// raycast-env.d.ts is gitignored, so that namespace does not exist on a fresh checkout
// and ci would typecheck red. Mirrors the command preference in package.json.
interface LinearPreferences {
    linearApiKey: string;
}

export interface LinearIssue {
    assignee: LinearUser | null;
    description: string | null;
    id: string;
    identifier: string;
    labels: { nodes: LinearLabel[] };
    priority: number;
    state: LinearState;
    team: LinearTeam;
    title: string;
    updatedAt: string;
    url: string;
}

export interface LinearTeam {
    key: string;
    name: string;
}

export interface LinearUser {
    displayName: string;
}

export interface LinearLabel {
    color: string;
    id: string;
    name: string;
}

export interface LinearState {
    color: string;
    name: string;
    // Linear's workflow-state category — triage, backlog, unstarted, started, completed,
    // canceled. Left as a string because it arrives over the wire: a category added later
    // must fall back to a plain circle, not crash the row.
    type: string;
}

interface SearchPayload {
    data?: { issues: { nodes: LinearIssue[] } };
    errors?: { message: string }[];
}
