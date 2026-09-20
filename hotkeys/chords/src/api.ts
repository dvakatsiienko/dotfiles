// The four things the daemon answers. Nothing here is cached: the scan is a file read, the
// notes are a file read, and the presses arrive on their own.
import type { Hotkey } from '@hotkeys/manual.ts';

const json = async <T>(input: string, init?: RequestInit): Promise<T> => {
    const response = await fetch(input, init);

    if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as {
            error?: string;
        };

        throw new Error(body.error ?? `${input} answered ${response.status}`);
    }

    return response.json() as Promise<T>;
};

export const fetchScan = () => json<ScanPayload>('/api/hotkeys');

export const fetchNotes = () => json<NoteStore>('/api/notes');

export const putNote = (note: NoteInput) =>
    json<NoteStore>('/api/notes', {
        body: JSON.stringify(note),
        headers: { 'content-type': 'application/json' },
        method: 'PUT',
    });

export const postManualEdit = (edit: ManualEdit) =>
    json<{ ok: true }>('/api/manual', {
        body: JSON.stringify(edit),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
    });

// One stream, two kinds of news: a chord was pressed, or the bindings behind the board moved.
// EventSource reconnects on its own, so a daemon restart costs the page a few seconds and no
// reload — which is the whole reason the 2s poll is gone.
export const subscribeLive = (handlers: LiveHandlers) => {
    const source = new EventSource('/api/presses');

    source.addEventListener('presses', (event) => {
        handlers.onPresses(JSON.parse((event as MessageEvent<string>).data));
    });
    source.addEventListener('bindings', () => handlers.onBindings());

    return () => source.close();
};

/* Types */
export interface ScanPayload {
    hotkeys: Hotkey[];
    scannedAt: string;
}
export interface PressPayload {
    counts: Record<string, number>;
    updatedAt: string | null;
}
export interface NoteInput {
    key: string;
    layer: string;
    text: string;
}
export interface Note extends NoteInput {
    updatedAt: string;
}
export type NoteStore = Record<string, Note>;
export interface ManualEdit {
    from: { app: string; mods: string; key: string; action: string };
    to: { mods: string; key: string; action: string };
}
interface LiveHandlers {
    onBindings: () => void;
    onPresses: (payload: PressPayload) => void;
}
