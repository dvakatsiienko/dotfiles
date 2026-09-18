import { useState } from 'react';
import { Action, ActionPanel, Color, Icon, List } from '@raycast/api';
import { useCachedPromise } from '@raycast/utils';

import { type Agent, readAgentList, toNextFire } from './lib/launchd';

const Schedule = () => {
    const [isShowingDetail, setIsShowingDetail] = useState(false);

    const { data, isLoading } = useCachedPromise(readAgentList, [], {
        failureToastOptions: { title: 'could not read the launch agents' },
        initialData: [],
    });

    const agentListJSX = data.map((agent) => {
        return (
            <List.Item
                accessories={
                    isShowingDetail ? undefined : toAccessoryList(agent)
                }
                actions={
                    <ActionPanel>
                        {agent.stdoutPath && (
                            <Action.Open
                                application='Cursor'
                                icon={Icon.Document}
                                target={agent.stdoutPath}
                                title='open the log'
                            />
                        )}
                        <Action.Open
                            application='Cursor'
                            icon={Icon.Cog}
                            shortcut={{ key: 'return', modifiers: ['cmd'] }}
                            target={agent.plistPath}
                            title='open the plist'
                        />
                        <Action
                            icon={Icon.Sidebar}
                            onAction={() =>
                                setIsShowingDetail(!isShowingDetail)
                            }
                            shortcut={{ key: 'd', modifiers: ['cmd', 'shift'] }}
                            title={
                                isShowingDetail
                                    ? 'hide details'
                                    : 'show details'
                            }
                        />
                        <Action.CopyToClipboard
                            content={agent.label}
                            shortcut={{ key: 'c', modifiers: ['cmd'] }}
                            title='copy the label'
                        />
                    </ActionPanel>
                }
                detail={<AgentDetail agent={agent} />}
                icon={{ source: Icon.Clock, tintColor: toStateColor(agent) }}
                key={agent.label}
                keywords={[agent.label, agent.schedule]}
                subtitle={agent.what ?? undefined}
                title={agent.name}
            />
        );
    });

    const emptyViewJSX = (
        <List.EmptyView
            description='nothing in ~/Library/LaunchAgents starts with com.dima.'
            icon={Icon.Clock}
            title={isLoading ? 'reading launch agents…' : 'no agents of ours'}
        />
    );

    return (
        <List
            isLoading={isLoading}
            isShowingDetail={isShowingDetail && agentListJSX.length > 0}
            searchBarPlaceholder='search by name, label or schedule…'>
            {agentListJSX.length === 0 ? emptyViewJSX : agentListJSX}
        </List>
    );
};

const AgentDetail = (props: AgentDetailProps) => {
    const nextFire = toNextFire(props.agent);

    return (
        <List.Item.Detail
            markdown={props.agent.whatFull ?? '_no description in the plist._'}
            metadata={
                <List.Item.Detail.Metadata>
                    <List.Item.Detail.Metadata.Label
                        text={props.agent.schedule}
                        title='schedule'
                    />
                    <List.Item.Detail.Metadata.Label
                        text={
                            nextFire ? nextFire.toLocaleString() : 'on demand'
                        }
                        title='next fire'
                    />
                    <List.Item.Detail.Metadata.Label
                        icon={{
                            source: Icon.Dot,
                            tintColor: toStateColor(props.agent),
                        }}
                        text={`${props.agent.state} · ${props.agent.runs} run(s)`}
                        title='state'
                    />
                    <List.Item.Detail.Metadata.Separator />
                    <List.Item.Detail.Metadata.Label
                        text={props.agent.programPath ?? 'none'}
                        title='program'
                    />
                    <List.Item.Detail.Metadata.Label
                        text={props.agent.stdoutPath ?? 'none'}
                        title='stdout'
                    />
                    <List.Item.Detail.Metadata.Label
                        text={props.agent.stderrPath ?? 'none'}
                        title='stderr'
                    />
                    <List.Item.Detail.Metadata.Label
                        text={props.agent.plistPath}
                        title='plist'
                    />
                </List.Item.Detail.Metadata>
            }
        />
    );
};

export default Schedule;

/* Helpers */
// A daily job spends almost all its life "not running", which is health, not a fault — so
// grey is the resting colour and only an agent launchd does not hold at all reads red.
const toStateColor = (agent: Agent) => {
    if (agent.state === 'not loaded') return Color.Red;

    return agent.state === 'running' ? Color.Green : Color.SecondaryText;
};

const toAccessoryList = (agent: Agent): List.Item.Accessory[] => {
    const exitAccessoryList: List.Item.Accessory[] =
        agent.lastExit === null
            ? []
            : [
                  {
                      text: {
                          color: agent.lastExit === 0 ? Color.Green : Color.Red,
                          value: `exit ${agent.lastExit}`,
                      },
                      tooltip: 'last exit code',
                  },
              ];

    return [
        { text: agent.schedule, tooltip: 'schedule' },
        {
            text: { color: toStateColor(agent), value: agent.state },
            tooltip: `${agent.runs} run(s) this boot`,
        },
        ...exitAccessoryList,
    ];
};

/* Types */
interface AgentDetailProps {
    agent: Agent;
}
