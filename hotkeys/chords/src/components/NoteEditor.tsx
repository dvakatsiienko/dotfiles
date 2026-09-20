import { useEffect, useRef, useState } from 'react';

const BUTTON =
    'cursor-pointer rounded-md border px-3 py-1.5 font-sans text-[13px] font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';

export const NoteEditor = (props: NoteEditorProps) => {
    const [draft, setDraft] = useState(props.text);
    const [status, setStatus] = useState('');
    const field = useRef<HTMLTextAreaElement>(null);

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

    const save = async (text: string) => {
        setDraft(text);

        try {
            await props.onSave(text);
            setStatus('saved');
        } catch (error) {
            setStatus(`not saved: ${(error as Error).message}`);
        }
    };

    const copy = async () => {
        const markdown = props.notesMarkdown();

        if (!markdown) return setStatus('no notes to copy');

        await navigator.clipboard.writeText(markdown);
        setStatus('copied');
    };

    return (
        <>
            <textarea
                aria-label='what you want on this chord'
                className='min-h-[72px] w-full resize-y rounded-md border border-line bg-cap px-2.5 py-2 font-sans text-[14px]/[1.45] text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent'
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
                    onClick={() => void save(draft)}
                    type='button'>
                    save note
                </button>
                <button
                    className={`${BUTTON} border-line bg-transparent text-ink-2`}
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
