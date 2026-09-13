// hand-kept stores: raycast and cleanshot keep their bindings in encrypted or sealed files,
// 1password writes only the customised ones. re-type from the app's shortcuts pane.
export const manualHotkeys = [
    ...(
        [
            ['r', '1Password'],
            ['x', 'Calculator'],
            ['k', 'Calendar'],
            ['a', 'Claude'],
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
    {
        action: 'Capture Fullscreen',
        app: 'cleanshot',
        key: '3',
        mods: 'cmd+shift',
    },
    { action: 'Capture Area', app: 'cleanshot', key: '4', mods: 'cmd+shift' },
    { action: 'All-In-One', app: 'cleanshot', key: '5', mods: 'cmd+shift' },
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
}
