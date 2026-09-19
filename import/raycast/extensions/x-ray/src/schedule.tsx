import { useState } from 'react';
import { Action, ActionPanel, Color, Icon, List } from '@raycast/api';
import { useCachedPromise } from '@raycast/utils';

import {
    type Agent,
    type AgentSource,
    type Health,
    readAgentList,
    toHealth,
    toNextFire,
} from './lib/launchd';

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
                        {agent.openTarget && (
                            <Action.Open
                                icon={Icon.Globe}
                                target={agent.openTarget}
                                title='open'
                            />
                        )}
                        {agent.stdoutPath && (
                            <Action.Open
                                application='Cursor'
                                icon={Icon.Document}
                                shortcut={
                                    agent.openTarget
                                        ? { key: 'return', modifiers: ['cmd'] }
                                        : undefined
                                }
                                target={agent.stdoutPath}
                                title='open the log'
                            />
                        )}
                        <Action.Open
                            application='Cursor'
                            icon={Icon.Cog}
                            shortcut={{
                                key: 'return',
                                modifiers: agent.openTarget
                                    ? ['cmd', 'shift']
                                    : ['cmd'],
                            }}
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
                key={agent.label}
                keywords={[agent.label, agent.schedule]}
                subtitle={agent.what ?? undefined}
                title={`${agent.emoji ?? fallbackGlyph} ${agent.name}`}
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
            markdown={toDetailMarkdown(props.agent)}
            metadata={
                <List.Item.Detail.Metadata>
                    <List.Item.Detail.Metadata.Label
                        icon={sourceBadge[props.agent.source]}
                        text={sourceTooltip[props.agent.source]}
                        title='source'
                    />
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
                            tintColor: healthColor[toHealth(props.agent)],
                        }}
                        text={`${props.agent.state} · ${toStateNote(props.agent)}`}
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
// The badge answers "can this row be trusted live?" — a launchd job is polled from launchctl
// every open, a cloud job is only as true as the last heartbeat it left behind.
const sourceBadge = { cowork: '☁️', launchd: '🖥️' } satisfies Record<
    AgentSource,
    string
>;

const sourceTooltip = {
    cowork: 'runs in the cloud — state inferred from its heartbeat file',
    launchd: 'runs on this mac — state polled from launchctl',
} satisfies Record<AgentSource, string>;

// The job emoji rides in the TITLE, not the icon slot: raycast renders an emoji passed as an
// icon through its template pipeline and drains the colour out of it, while title and accessory
// text leave it alone. A job that declared none still gets a glyph, so every title lines up.
const fallbackGlyph = '⏰';

// `toHealth` picks the word; these two only draw it. 💤 is dima's pick over a white dot, which
// vanished into raycast's light background — it means nothing has run yet, not switched off.
// The off state is `not loaded`, and that one is already red.
const healthGlyph = {
    dead: '🔴',
    idle: '💤',
    ok: '✅',
    running: '🟢',
    unknown: '❓',
} satisfies Record<Health, string>;

// A daily job spends almost all its life between slots, which is health, not a fault — so grey
// is the resting colour and only a genuinely dead job reads red.
const healthColor = {
    dead: Color.Red,
    idle: Color.SecondaryText,
    ok: Color.Green,
    running: Color.Green,
    unknown: Color.SecondaryText,
} satisfies Record<Health, Color>;

// The pane used to print the raw plist comment, which markdown collapses into one run-on
// paragraph. The heading carries the name, an italic line carries the timing, and the body is
// rebuilt below so a hand-wrapped comment survives the trip.
const toDetailMarkdown = (agent: Agent) => {
    const nextFire = toNextFire(agent);
    const next = nextFire ? nextFire.toLocaleString() : 'on demand';
    const body = agent.whatFull
        ? toBodyMarkdown(agent.whatFull, agent.name)
        : '_no description in the plist._';

    const heading = agent.emoji ? `${agent.emoji} ${agent.name}` : agent.name;

    return `# ${heading}\n\n_${agent.schedule} · next ${next}_\n\n${body}`;
};

const toBodyMarkdown = (comment: string, name: string) =>
    comment
        .split(/\n{2,}/)
        .map((paragraph) => toParagraphMarkdown(paragraph, name))
        .filter((paragraph) => paragraph.length > 0)
        .join('\n\n');

const toParagraphMarkdown = (paragraph: string, name: string) => {
    // The heading already prints the name, so a comment opening with it says it twice.
    if (paragraph.startsWith(`${name} — `)) {
        return toProse(paragraph.slice(name.length + 3));
    }

    const lineList = paragraph.split('\n');

    return lineList.every(isListLine)
        ? lineList.map(toBulletMarkdown).join('\n')
        : toProse(paragraph);
};

// A hard wrap inside a paragraph is the author's line length, not a line break — markdown
// honours it only inside a list, so prose is rejoined into one line.
const toProse = (paragraph: string) => paragraph.replace(/\s+/g, ' ').trim();

// A list line is either literal (`- …`) or a short `key — value` head. The bound on the key is
// what keeps a wrapped prose line that happens to carry an em dash out of the list.
const isListLine = (line: string) => /^-\s+\S|^\S[^—\n]{0,20} — \S/.test(line);

const toBulletMarkdown = (line: string) => {
    const pair = /^-?\s*([^—]+?) — (.+)$/.exec(line);
    const key = pair?.[1];
    const value = pair?.[2];

    if (!key || !value) return `- ${line.replace(/^-\s+/, '')}`;

    return `- **${key}** — ${value}`;
};

// `exit 0` only ever repeated what a healthy state already said, and a cowork row's exit code is
// synthesised from its heartbeat rather than measured — so only a real failure earns a slot.
const toAccessoryList = (agent: Agent): List.Item.Accessory[] => {
    const hasFailed =
        agent.source === 'launchd' &&
        agent.lastExit !== null &&
        agent.lastExit !== 0;
    const exitAccessoryList: List.Item.Accessory[] = hasFailed
        ? [
              {
                  tag: { color: Color.Red, value: `exit ${agent.lastExit}` },
                  tooltip: 'the last run ended badly',
              },
          ]
        : [];

    // Raycast packs accessories from the RIGHT edge at their own width, so the order is chosen
    // from that edge inwards: the two rightmost are single glyphs of fixed width, which pins the
    // schedule's right edge to the same column on every row. Put a variable-width word out there
    // instead and everything to its left drifts — `not running` is four characters wider than
    // `running`, which was the whole problem.
    //
    // The state word is not lost: it is in the tooltip and spelled out in the detail pane.
    //
    // Emoji go through `text`, never `icon` — raycast tints an accessory ICON to secondary grey,
    // which drains the colour straight out of them.
    return [
        { tag: agent.schedule, tooltip: 'schedule' },
        ...exitAccessoryList,
        {
            text: healthGlyph[toHealth(agent)],
            tooltip: `${agent.state} — ${toStateNote(agent)}`,
        },
        {
            text: sourceBadge[agent.source],
            tooltip: sourceTooltip[agent.source],
        },
    ];
};

// A cloud job has no boot and no run count — saying "0 run(s)" about one is just wrong.
const toStateNote = (agent: Agent) =>
    agent.source === 'cowork'
        ? 'derived from the heartbeat, not measured'
        : `${agent.runs} run(s) this boot`;

/* Types */
interface AgentDetailProps {
    agent: Agent;
}
