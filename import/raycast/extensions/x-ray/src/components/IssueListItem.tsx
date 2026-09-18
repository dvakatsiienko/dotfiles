import { Action, ActionPanel, Icon, List } from '@raycast/api';

import type { LinearIssue } from '../lib/linear';
import { toLinearAppUrl } from '../lib/linear';
import {
    toPriorityIcon,
    toPriorityName,
    toStateIcon,
    toUserIcon,
} from '../lib/linear-ui';

export const IssueListItem = (props: IssueListItemProps) => {
    return (
        <List.Item
            accessories={
                props.isShowingDetail ? undefined : toAccessoryList(props.issue)
            }
            actions={
                <ActionPanel>
                    <Action.Open
                        icon={Icon.ArrowRight}
                        target={toLinearAppUrl(props.issue.url)}
                        title='open in linear'
                    />
                    <Action
                        icon={Icon.Sidebar}
                        onAction={props.onToggleDetail}
                        shortcut={{ key: 'd', modifiers: ['cmd', 'shift'] }}
                        title={
                            props.isShowingDetail
                                ? 'hide details'
                                : 'show details'
                        }
                    />
                    <Action.CopyToClipboard
                        content={props.issue.identifier.toUpperCase()}
                        shortcut={{ key: '.', modifiers: ['cmd'] }}
                        title='copy id'
                    />
                    <Action.CopyToClipboard
                        content={props.issue.url}
                        title='copy issue url'
                    />
                </ActionPanel>
            }
            detail={<IssueDetail issue={props.issue} />}
            icon={{
                tooltip: `priority: ${toPriorityName(props.issue.priority)}`,
                value: toPriorityIcon(props.issue.priority),
            }}
            key={props.issue.id}
            keywords={toKeywordList(props.issue)}
            subtitle={props.issue.title}
            title={props.issue.identifier}
        />
    );
};

const IssueDetail = (props: IssueDetailProps) => {
    const labelList = props.issue.labels.nodes;
    const linkCount = props.issue.attachments.nodes.length;
    const cycle = props.issue.cycle;

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
            markdown={toMarkdown(props.issue)}
            metadata={
                <List.Item.Detail.Metadata>
                    <List.Item.Detail.Metadata.Label
                        icon={toStateIcon(props.issue.state)}
                        text={props.issue.state.name}
                        title='status'
                    />
                    <List.Item.Detail.Metadata.Label
                        icon={toPriorityIcon(props.issue.priority)}
                        text={toPriorityName(props.issue.priority)}
                        title='priority'
                    />
                    <List.Item.Detail.Metadata.Label
                        icon={toUserIcon(props.issue.assignee)}
                        text={props.issue.assignee?.displayName ?? 'unassigned'}
                        title='assignee'
                    />
                    <List.Item.Detail.Metadata.Label
                        text={
                            props.issue.estimate === null
                                ? 'none'
                                : `${props.issue.estimate} points`
                        }
                        title='estimate'
                    />
                    <List.Item.Detail.Metadata.Separator />
                    {labelList.length === 0 ? (
                        <List.Item.Detail.Metadata.Label
                            text='none'
                            title='labels'
                        />
                    ) : (
                        <List.Item.Detail.Metadata.TagList title='labels'>
                            {labelTagJSX}
                        </List.Item.Detail.Metadata.TagList>
                    )}
                    <List.Item.Detail.Metadata.Label
                        text={String(linkCount)}
                        title='links'
                    />
                    <List.Item.Detail.Metadata.Label
                        text={
                            cycle
                                ? `cycle ${cycle.number}${cycle.name ? ` · ${cycle.name}` : ''}`
                                : 'no cycle'
                        }
                        title='cycle'
                    />
                    <List.Item.Detail.Metadata.Label
                        text={props.issue.project?.name ?? 'no project'}
                        title='project'
                    />
                    <List.Item.Detail.Metadata.Label
                        text={props.issue.team.key}
                        title='team'
                    />
                </List.Item.Detail.Metadata>
            }
        />
    );
};

/* Helpers */
// Raycast indexes the title and these keywords and nothing else — the identifier is the
// title here, so everything a search would reasonably match on has to be listed.
const toKeywordList = (issue: LinearIssue) => {
    return [
        issue.title,
        issue.state.name,
        issue.priorityLabel,
        issue.team.key,
        issue.assignee?.displayName,
        issue.project?.name,
    ].filter((keyword) => keyword !== undefined);
};

const toAccessoryList = (issue: LinearIssue): List.Item.Accessory[] => {
    const labelList = issue.labels.nodes;

    const labelAccessoryList: List.Item.Accessory[] =
        labelList.length === 0
            ? []
            : [
                  {
                      icon: Icon.Tag,
                      text: String(labelList.length),
                      tooltip: labelList.map((label) => label.name).join(', '),
                  },
              ];

    const assigneeAccessoryList: List.Item.Accessory[] = issue.assignee
        ? [
              {
                  icon: toUserIcon(issue.assignee),
                  tooltip: `assignee: ${issue.assignee.displayName}`,
              },
          ]
        : [];

    return [
        { date: new Date(issue.updatedAt), tooltip: 'updated' },
        ...labelAccessoryList,
        ...assigneeAccessoryList,
        { icon: toStateIcon(issue.state), tooltip: issue.state.name },
    ];
};

const toMarkdown = (issue: LinearIssue) => {
    const body = issue.description?.trim();

    return `# ${issue.title}\n\n${body || '_no description._'}`;
};

/* Types */
interface IssueListItemProps {
    isShowingDetail: boolean;
    issue: LinearIssue;
    onToggleDetail: () => void;
}

interface IssueDetailProps {
    issue: LinearIssue;
}
