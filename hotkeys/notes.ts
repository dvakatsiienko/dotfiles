// What dima wants on a chord, one note per chord. The file is committed, so a note written on
// the page is readable by every agent and survives the browser it was typed in — the old page
// kept these in one browser's localStorage and a copy button was the only way out.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export const notesFile = join(import.meta.dirname, 'notes.json');

export const noteId = (layer: string, key: string) =>
    `${layer || 'none'}__${key}`;

export const readNotes = (): NoteStore => {
    if (!existsSync(notesFile)) return {};

    try {
        return JSON.parse(readFileSync(notesFile, 'utf8')) as NoteStore;
    } catch {
        // A note is worth less than the page it feeds: a half-written file must not take the
        // whole app down, and the next save rewrites it whole anyway.
        return {};
    }
};

// Empty text is the delete: the page has one textarea and clearing it is how dima drops a note.
export const saveNote = (note: NoteInput): NoteStore => {
    const notes = readNotes();
    const id = noteId(note.layer, note.key);

    if (note.text.trim() === '') delete notes[id];
    else notes[id] = { ...note, updatedAt: new Date().toISOString() };

    const ordered = Object.fromEntries(
        Object.entries(notes).sort(([a], [z]) => a.localeCompare(z)),
    );

    writeFileSync(notesFile, `${JSON.stringify(ordered, null, 4)}\n`);

    return ordered;
};

/* Types */
export interface NoteInput {
    key: string;
    layer: string;
    text: string;
}
export interface Note extends NoteInput {
    updatedAt: string;
}
export type NoteStore = Record<string, Note>;
