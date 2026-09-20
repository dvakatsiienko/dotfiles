import { useEffect, useRef, useState } from 'react';

import { apiTrouble } from '@/components/Notice.tsx';

const BUTTON =
    'cursor-pointer rounded-md border px-3 py-1.5 font-sans text-[13px] font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-default disabled:border-line disabled:bg-cap-free disabled:text-ink-3';

export const NoteEditor = (props: NoteEditorProps) => {
    const [draft, setDraft] = useState(props.text);
    const [status, setStatus] = useState('');
    const [saving, setSaving] = useState(false);
    const field = useRef<HTMLTextAreaElement>(null);
    // A note is filed under a key, so with no key chosen there is nothing to write it to. The
    // board's own save returned silently in that case and this said «saved» over the top of
    // it — the one place the page claimed something it had not done.
    const armed = props.chord !== null;

    // Refilling a textarea under a typing hand eats the note, so the draft is reset when the
    // subject changes and at no other time — presses keep arriving the whole while.
    // biome-ignore lint/correctness/useExhaustiveDependencies: text is read, the chord is the trigger
    useEffect(() => {
        setDraft(props.text);
        setStatus('');
        if (props.chord) field.current?.focus();
    }, [props.chord]);

    useEffect(() => {
        if (!status) return;

        const timer = setTimeout(() => setStatus(''), 2500);

        return () => clearTimeout(timer);
    }, [status]);

    // `saving` is the double-press guard as much as it is the label: the write lands in a file
    // and a held return sent one request per repeat.
    const save = async (text: string) => {
        if (!armed || saving) return;

        setDraft(text);
        setSaving(true);

        try {
            await props.onSave(text);
            setStatus('saved');
        } catch (error) {
            setStatus(`not saved — ${apiTrouble((error as Error).message)}`);
        } finally {
            setSaving(false);
        }
    };

    const copy = async () => {
        const markdown = props.notesMarkdown();

        if (!markdown) return setStatus('no notes to copy');

        // The clipboard rejects outright when the document is not focused, and an unhandled
        // rejection left the button looking like it had worked.
        try {
            await navigator.clipboard.writeText(markdown);
            setStatus('copied');
        } catch {
            setStatus('not copied — the window has to be focused');
        }
    };

    return (
        <>
            <textarea
                aria-label='what you want on this chord'
                className='min-h-[72px] w-full resize-y rounded-md border border-line bg-cap px-2.5 py-2 font-sans text-[15px]/[1.45] text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent'
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                    if (
                        event.key === 'Enter' &&
                        (event.metaKey || event.ctrlKey)
                    ) {
                        void save(draft);
                    }
                }}
                placeholder='what you want on this chord — a note for the rebind session. saved to hotkeys/notes.json, never written into any app.'
                ref={field}
                value={draft}
            />
            <div className='flex items-center gap-2'>
                <button
                    className={`${BUTTON} border-accent bg-accent text-on-accent`}
                    disabled={!armed || saving}
                    onClick={() => void save(draft)}
                    type='button'>
                    {saving ? 'saving…' : 'save note'}
                </button>
                <button
                    className={`${BUTTON} border-line bg-transparent text-ink-2`}
                    disabled={!armed || saving}
                    onClick={() => void save('')}
                    type='button'>
                    clear
                </button>
                <button
                    className={`${BUTTON} border-line bg-transparent text-ink-2`}
                    onClick={() => void copy()}
                    type='button'>
                    copy notes
                </button>
                <span className='text-[12px] text-ink-3'>{status}</span>
            </div>
        </>
    );
};

/* Types */
interface NoteEditorProps {
    chord: string | null;
    notesMarkdown: () => string;
    onSave: (text: string) => Promise<void>;
    text: string;
}
