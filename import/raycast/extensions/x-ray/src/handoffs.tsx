import { Action, ActionPanel, Detail, Icon, List } from '@raycast/api';
import { useCachedPromise, usePromise } from '@raycast/utils';

import {
    type Handoff,
    handoffDir,
    readHandoffBody,
    readHandoffList,
    toAge,
    toIngestCommand,
    toPointerLine,
} from './lib/handoffs';

const Handoffs = () => {
    const { data, isLoading } = useCachedPromise(readHandoffList, [], {
        failureToastOptions: { title: 'Could not read the handoff shelf' },
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
                            title='Read Handoff'
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
            description={`Nothing in ${handoffDir} — a /handoff is what writes one.`}
            icon={Icon.Tray}
            title='The shelf is empty'
        />
    );

    return (
        <List
            isLoading={isLoading}
            searchBarPlaceholder='Search by topic, lane or author…'>
            {handoffListJSX.length === 0 ? emptyViewJSX : handoffListJSX}
        </List>
    );
};

const HandoffDetail = (props: HandoffDetailProps) => {
    const { data, isLoading } = usePromise(
        readHandoffBody,
        [props.handoff.path],
        {
            failureToastOptions: { title: 'Could not read the transcript' },
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

const HandoffShelfActions = (props: HandoffShelfActionsProps) => {
    return (
        <ActionPanel.Section>
            <Action.Paste
                content={toIngestCommand(props.handoff)}
                icon={Icon.Terminal}
                shortcut={{ key: 'return', modifiers: ['cmd'] }}
                title='Paste Ingest Command'
            />
            <Action.Open
                application='Cursor'
                icon={Icon.Code}
                shortcut={{ key: 'return', modifiers: ['opt'] }}
                target={props.handoff.path}
                title='Open in Cursor'
            />
            <Action.CopyToClipboard
                content={toPointerLine(props.handoff)}
                icon={Icon.Clipboard}
                shortcut={{ key: 'c', modifiers: ['cmd'] }}
                title='Copy Pointer Line'
            />
        </ActionPanel.Section>
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

const toAccessoryList = (handoff: Handoff): List.Item.Accessory[] => {
    const laneAccessory: List.Item.Accessory[] = handoff.lane
        ? [{ tag: handoff.lane, tooltip: 'lane' }]
        : [{ tag: 'legacy', tooltip: 'legacy filename — no lane, no author' }];
    const authorAccessory: List.Item.Accessory[] = handoff.author
        ? [{ text: `by ${handoff.author}` }]
        : [];
    const foreignAccessory: List.Item.Accessory[] = handoff.isForeign
        ? [
              {
                  icon: Icon.Lock,
                  tooltip: `addressed to ${handoff.audience} — leave it`,
              },
          ]
        : [];

    return [
        ...laneAccessory,
        ...authorAccessory,
        { text: toAge(handoff.modifiedAt), tooltip: 'age' },
        ...foreignAccessory,
    ];
};

/* Types */
interface HandoffDetailProps {
    handoff: Handoff;
}

interface HandoffShelfActionsProps {
    handoff: Handoff;
}
