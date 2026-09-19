import { Action, ActionPanel, Color, Detail, Icon, List } from '@raycast/api';
import { useCachedPromise, usePromise } from '@raycast/utils';

import {
    type Handoff,
    handoffDir,
    readHandoffBody,
    readHandoffList,
    toAge,
    toCclioInitLine,
    toIngestLine,
} from './lib/handoffs';

const Handoffs = () => {
    const { data, isLoading } = useCachedPromise(readHandoffList, [], {
        failureToastOptions: { title: 'could not read the handoff shelf' },
        initialData: [],
    });

    const handoffListJSX = data.map((handoff) => {
        return (
            <List.Item
                accessories={toAccessoryList(handoff)}
                actions={
                    <ActionPanel>
                        <Action.Push
                            icon={Icon.Book}
                            target={<HandoffDetail handoff={handoff} />}
                            title='read handoff'
                        />
                        <HandoffShelfActions handoff={handoff} />
                    </ActionPanel>
                }
                icon={scrollEmoji}
                key={handoff.fileName}
                keywords={toKeywordList(handoff)}
                subtitle={handoff.isShared ? 'shared' : undefined}
                title={handoff.topic}
            />
        );
    });

    const emptyViewJSX = (
        <List.EmptyView
            description={`nothing in ${handoffDir} — a /handoff is what writes one.`}
            icon={Icon.Tray}
            title='the shelf is empty'
        />
    );

    return (
        <List
            isLoading={isLoading}
            searchBarPlaceholder='search by topic, lane or author…'>
            {handoffListJSX.length === 0 ? emptyViewJSX : handoffListJSX}
        </List>
    );
};

const HandoffDetail = (props: HandoffDetailProps) => {
    const { data, isLoading } = usePromise(
        readHandoffBody,
        [props.handoff.path],
        {
            failureToastOptions: { title: 'could not read the transcript' },
        },
    );

    return (
        <Detail
            actions={
                <ActionPanel>
                    <HandoffShelfActions handoff={props.handoff} />
                </ActionPanel>
            }
            isLoading={isLoading}
            markdown={data}
            navigationTitle={props.handoff.topic}
        />
    );
};

// Three sections, because the verbs are three: paste into the session in front of you, copy
// for somewhere else, open the file. Within each the cclio line leads — it is the one that
// boots a coordinator, and the plain ingest line is the fallback for a session already booted.
const HandoffShelfActions = (props: HandoffShelfActionsProps) => {
    return (
        <>
            <ActionPanel.Section>
                <Action.Paste
                    content={toCclioInitLine(props.handoff)}
                    icon={Icon.Terminal}
                    shortcut={{ key: 'return', modifiers: ['cmd'] }}
                    title='paste cclio init line'
                />
                <Action.Paste
                    content={toIngestLine(props.handoff)}
                    icon={Icon.Terminal}
                    shortcut={{ key: 'return', modifiers: ['cmd', 'shift'] }}
                    title='paste ingest line'
                />
            </ActionPanel.Section>
            <ActionPanel.Section>
                <Action.CopyToClipboard
                    content={toCclioInitLine(props.handoff)}
                    icon={Icon.Clipboard}
                    shortcut={{ key: 'c', modifiers: ['cmd'] }}
                    title='copy cclio init line'
                />
                <Action.CopyToClipboard
                    content={toIngestLine(props.handoff)}
                    icon={Icon.Clipboard}
                    shortcut={{ key: 'c', modifiers: ['cmd', 'shift'] }}
                    title='copy ingest line'
                />
                <Action.CopyToClipboard
                    content={props.handoff.path}
                    icon={Icon.Finder}
                    shortcut={{ key: '.', modifiers: ['cmd'] }}
                    title='copy file path'
                />
            </ActionPanel.Section>
            <ActionPanel.Section>
                <Action.Open
                    application='Cursor'
                    icon={Icon.Code}
                    shortcut={{ key: 'return', modifiers: ['opt'] }}
                    target={props.handoff.path}
                    title='open in cursor'
                />
            </ActionPanel.Section>
        </>
    );
};

export default Handoffs;

/* Helpers */
// The command icon is this same scroll rendered to a png — the emoji is the shelf's mark on
// both surfaces. A foreign handoff is already called out by its Lock accessory.
const scrollEmoji = '📜';

// Raycast's own filtering reads the title and these keywords, and nothing else — lane
// and author live in accessories, which are not indexed, so the search bar would
// otherwise promise a filter that hides every row.
const toKeywordList = (handoff: Handoff) => {
    return [
        handoff.lane,
        handoff.author,
        handoff.audience,
        handoff.fileName,
    ].filter((keyword) => keyword !== null);
};

// The four lanes are a closed set in CST-SPEC, so the colours are named rather than derived:
// a lane always reads the same colour, and one the spec never defined falls back to plain
// text instead of being given a meaning it does not have.
const laneColor: Record<string, Color> = {
    code: Color.Blue,
    design: Color.Magenta,
    pm: Color.Purple,
    research: Color.Yellow,
};

const toAccessoryList = (handoff: Handoff): List.Item.Accessory[] => {
    const authorAccessory: List.Item.Accessory[] = handoff.author
        ? [
              {
                  text: {
                      color: Color.SecondaryText,
                      value: `by ${handoff.author}`,
                  },
                  tooltip: 'author',
              },
          ]
        : [];

    // Orange is the one warning in the row: this handoff is addressed to someone else and
    // ingesting it takes it away from them. It replaces the lock icon, which said the same
    // thing without naming who.
    const audienceAccessory: List.Item.Accessory[] = [
        {
            text: {
                color: handoff.isForeign ? Color.Orange : Color.Green,
                value: `for ${handoff.audience}`,
            },
            tooltip: handoff.isForeign
                ? `addressed to ${handoff.audience} — leave it`
                : 'audience',
        },
    ];

    const laneAccessory: List.Item.Accessory[] = handoff.lane
        ? [
              {
                  tag: {
                      color: laneColor[handoff.lane] ?? Color.SecondaryText,
                      value: handoff.lane,
                  },
                  tooltip: 'lane',
              },
          ]
        : [
              {
                  tag: { color: Color.SecondaryText, value: 'legacy' },
                  tooltip: 'legacy filename — no lane, no author',
              },
          ];

    return [
        ...authorAccessory,
        ...audienceAccessory,
        ...laneAccessory,
        { text: toAge(handoff.modifiedAt), tooltip: 'age' },
    ];
};

/* Types */
interface HandoffDetailProps {
    handoff: Handoff;
}

interface HandoffShelfActionsProps {
    handoff: Handoff;
}
