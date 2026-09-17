// hand-kept stores: raycast and cleanshot keep their bindings in encrypted or sealed files,
// 1password writes only the customised ones. re-type from the app's shortcuts pane.
export const manualHotkeys = [
    ...(
        [
            ['r', '1Password'],
            ['x', 'Calculator'],
            ['k', 'Calendar'],
            ['a', 'Claude'],
            ['b', 'Bartender toggle'],
            ['2', 'Cursor'],
            ['3', 'Figma'],
            ['f', 'Finder'],
            ['1', 'Google Chrome'],
            ['e', 'Linear'],
            ['n', 'Notion'],
            ['z', 'Numi'],
            ['d', 'Obsidian'],
            ['c', 'Slack'],
            ['s', 'Spark'],
            ['v', 'Things'],
            ['t', 'Warp'],
            ['w', 'Wispr Flow'],
            ['space', 'Search Emoji & Symbols'],
            ['u', 'Toggle Focus Session'],
            ['y', 'Raycast Notes'],
        ] as const
    ).map(
        ([key, action]): Hotkey => ({
            action,
            app: 'raycast',
            key,
            mods: 'hyper',
        }),
    ),
    { action: 'Raycast', app: 'raycast', key: 'space', mods: 'cmd' },
    {
        action: 'Switch Windows (disabled)',
        app: 'raycast',
        key: 'tab',
        mods: 'opt',
    },
    {
        action: 'Switch to English (Birman)',
        app: 'raycast',
        key: '1',
        mods: 'opt',
    },
    { action: 'Switch to Ukrainian', app: 'raycast', key: '2', mods: 'opt' },
    {
        action: 'Switch to Russian (Birman)',
        app: 'raycast',
        key: '3',
        mods: 'opt',
    },
    // cleanshot commands, bound in raycast's cleanshot extension (sealed 2026-09-17; reshuffle from the monitor in ~2 weeks)
    {
        action: 'Capture Window',
        app: 'cleanshot',
        key: '1',
        mods: 'cmd+shift',
        since: '2026-09-17',
    },
    {
        action: 'Capture Text (OCR)',
        app: 'cleanshot',
        key: '2',
        mods: 'cmd+shift',
    },
    {
        action: 'Capture Fullscreen',
        app: 'cleanshot',
        key: '3',
        mods: 'cmd+shift',
    },
    { action: 'Capture Area', app: 'cleanshot', key: '4', mods: 'cmd+shift' },
    {
        action: 'Scrolling Capture',
        app: 'cleanshot',
        key: '5',
        mods: 'cmd+shift',
    },
    {
        action: 'All-In-One',
        app: 'cleanshot',
        key: '6',
        mods: 'cmd+shift',
        since: '2026-09-17',
    },
    {
        action: 'Open History',
        app: 'cleanshot',
        key: '7',
        mods: 'cmd+shift',
        since: '2026-09-17',
    },
    {
        action: 'Annotate',
        app: 'cleanshot',
        key: '8',
        mods: 'cmd+shift',
        since: '2026-09-17',
    },
    {
        action: 'Record Screen',
        app: 'cleanshot',
        key: '9',
        mods: 'cmd+shift',
        since: '2026-09-17',
    },
    {
        action: 'Open from Clipboard',
        app: 'cleanshot',
        key: '0',
        mods: 'cmd+shift',
    },
    // system settings → accessibility → read & speak → speak selection (siri voice 4); hotkey buried in its ⓘ sheet
    {
        action: 'Speak selection (read aloud)',
        app: 'macos',
        key: 'esc',
        mods: 'opt',
    },
    // system chords — obvious, but a labelled row beats a bare one in `hk`
    ...(
        [
            ['tab', 'switch app'],
            ['v', 'paste'],
            ['c', 'copy'],
            ['a', 'select all'],
            ['w', 'close window'],
            ['q', 'quit app'],
            ['k', 'app command palette / link'],
            [',', 'app settings'],
            ['left', 'line start'],
            ['right', 'line end'],
            ['esc', 'accessibility reader (read & speak)'],
        ] as const
    ).map(
        ([key, action]): Hotkey => ({ action, app: 'macos', key, mods: 'cmd' }),
    ),
    ...(
        [
            ['left', 'word left'],
            ['right', 'word right'],
            ['backspace', 'delete word'],
        ] as const
    ).map(
        ([key, action]): Hotkey => ({ action, app: 'macos', key, mods: 'opt' }),
    ),
    {
        action: 'select word left',
        app: 'macos',
        key: 'left',
        mods: 'opt+shift',
    },
    {
        action: 'select word right',
        app: 'macos',
        key: 'right',
        mods: 'opt+shift',
    },
    { action: 'Autofill', app: '1password', key: '\\', mods: 'cmd' },
    { action: 'Lock 1Password', app: '1password', key: 'l', mods: 'cmd+shift' },
] satisfies readonly Hotkey[];

/* Types */
export interface Hotkey {
    app: string;
    mods: string;
    key: string;
    action: string;
    note?: string;
    // ISO date the binding took this meaning; a press before it keeps the older row's label
    since?: string;
}
