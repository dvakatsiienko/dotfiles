// The http side of the always-on hotkey daemon: it serves the chords build and the four
// endpoints that build needs. It lives in the daemon rather than beside the app because the
// daemon is the only thing already watching the press log and the config sources — a second
// process would duplicate both watchers to answer the same questions.
//
// Everything the old page could not do follows from being served instead of opened off disk:
// fetch works, so the seed scripts are gone; a note can be written to a file; and presses
// arrive as server-sent events, so the page holds no timer at all.
//
// 📌 Bound to 127.0.0.1 on purpose. It writes manual.ts and notes.json with no auth of any
// kind, which is fine for a socket nothing off this mac can open, and only that.
import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, relative, resolve } from 'node:path';

import type { Hotkey } from './manual.ts';
import {
    type ManualEdit,
    ManualEditError,
    editManualText,
} from './manual-edit.ts';
import { type NoteInput, readNotes, saveNote } from './notes.ts';
import { chordsPort } from './ports.ts';
import type { IncomingMessage, ServerResponse } from 'node:http';

const DIST = join(import.meta.dirname, 'chords/dist');
const MANUAL = join(import.meta.dirname, 'manual.ts');
const SCAN_SNAPSHOT = join(import.meta.dirname, 'hotkeys.json');
const MAX_BODY = 64 * 1024;

const MIME: Record<string, string> = {
    '.css': 'text/css; charset=utf-8',
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.woff2': 'font/woff2',
};

export const startChordsServer = () => {
    const streams = new Set<ServerResponse>();
    let presses: PressPayload = { counts: {}, updatedAt: null };

    const emit = (event: string, data: unknown) => {
        const frame = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;

        for (const stream of streams) stream.write(frame);
    };

    const server = createServer((request, response) => {
        handle(request, response, { presses: () => presses, streams }).catch(
            (error: unknown) => {
                send(response, 500, { error: String(error) });
            },
        );
    });

    server.listen(chordsPort, '127.0.0.1', () => {
        console.log(`chords served on http://localhost:${chordsPort}`);
    });

    return {
        pushBindings: () => emit('bindings', { at: new Date().toISOString() }),
        pushPresses: (next: PressPayload) => {
            presses = next;
            emit('presses', next);
        },
    };
};

/* Helpers */

const send = (response: ServerResponse, status: number, body: unknown) => {
    const text = JSON.stringify(body);

    response.writeHead(status, {
        'cache-control': 'no-store',
        'content-type': MIME['.json'] as string,
    });
    response.end(text);
};

const readBody = (request: IncomingMessage) =>
    new Promise<string>((done, fail) => {
        let text = '';

        request.on('data', (chunk: Buffer) => {
            text += chunk;
            // Nothing this api takes is large, and an unbounded body on a server that writes
            // files is a way to fill memory by accident.
            if (text.length > MAX_BODY) {
                fail(new Error('body too large'));
                request.destroy();
            }
        });
        request.on('end', () => done(text));
        request.on('error', fail);
    });

// The rows manual.ts exports, freshly read: the ui's edit is checked against them before a
// single byte of that file moves. The mtime in the specifier is what gets past node's module
// cache — the file changes under this process on every edit and every hand edit.
const manualRows = async (): Promise<readonly Hotkey[]> => {
    const module = await import(`./manual.ts?at=${statSync(MANUAL).mtimeMs}`);

    return module.manualHotkeys as readonly Hotkey[];
};

const applyManualEdit = async (edit: ManualEdit) => {
    const text = readFileSync(MANUAL, 'utf8');
    const next = editManualText(text, await manualRows(), edit);

    writeFileSync(MANUAL, next);
};

const api = async (
    request: IncomingMessage,
    response: ServerResponse,
    url: URL,
    live: LiveState,
) => {
    if (url.pathname === '/api/hotkeys') {
        if (!existsSync(SCAN_SNAPSHOT)) {
            return send(response, 503, {
                error: 'no scan yet — run pnpm hotkeys:scan',
            });
        }

        return send(
            response,
            200,
            JSON.parse(readFileSync(SCAN_SNAPSHOT, 'utf8')),
        );
    }

    if (url.pathname === '/api/notes') {
        if (request.method === 'GET') return send(response, 200, readNotes());

        if (request.method === 'PUT') {
            const note = JSON.parse(await readBody(request)) as NoteInput;

            if (
                typeof note?.key !== 'string' ||
                typeof note?.text !== 'string'
            ) {
                return send(response, 400, {
                    error: 'a note needs key, layer and text',
                });
            }

            return send(response, 200, saveNote(note));
        }
    }

    if (url.pathname === '/api/manual' && request.method === 'POST') {
        const edit = JSON.parse(await readBody(request)) as ManualEdit;

        try {
            await applyManualEdit(edit);
        } catch (error) {
            if (error instanceof ManualEditError) {
                return send(response, 409, { error: error.message });
            }

            throw error;
        }

        // The daemon's own mtime watch reruns the scan and pushes `bindings` from there, so
        // nothing here tells the page what changed — one road in, one road out.
        return send(response, 200, { ok: true });
    }

    if (url.pathname === '/api/presses') {
        response.writeHead(200, {
            'cache-control': 'no-store',
            connection: 'keep-alive',
            'content-type': 'text/event-stream; charset=utf-8',
        });
        // Whatever the daemon knows right now, before any press lands: a page that opened
        // between two presses would otherwise draw an empty keyboard until dima typed.
        response.write(
            `event: presses\ndata: ${JSON.stringify(live.presses())}\n\n`,
        );
        live.streams.add(response);
        request.on('close', () => live.streams.delete(response));

        return;
    }

    return send(response, 404, { error: `no route for ${url.pathname}` });
};

const serveStatic = (response: ServerResponse, pathname: string) => {
    if (!existsSync(DIST)) {
        response.writeHead(503, { 'content-type': MIME['.html'] as string });

        return response.end(
            '<h1>chords is not built</h1><p>run <code>pnpm chords:build</code></p>',
        );
    }

    const wanted = resolve(DIST, `.${pathname}`);
    const inside = !relative(DIST, wanted).startsWith('..');
    // One page, so anything that is not a real file is the page — and anything outside dist
    // is someone walking up with ../, which gets the same answer as a typo.
    const file =
        inside && existsSync(wanted) && statSync(wanted).isFile()
            ? wanted
            : join(DIST, 'index.html');

    response.writeHead(200, {
        'cache-control': file.endsWith('index.html')
            ? 'no-store'
            : 'max-age=3600',
        'content-type': MIME[extname(file)] ?? 'application/octet-stream',
    });
    response.end(readFileSync(file));
};

const handle = async (
    request: IncomingMessage,
    response: ServerResponse,
    live: LiveState,
) => {
    const url = new URL(request.url ?? '/', `http://localhost:${chordsPort}`);

    if (url.pathname.startsWith('/api/'))
        return api(request, response, url, live);

    return serveStatic(response, url.pathname);
};

/* Types */
export interface PressPayload {
    counts: Record<string, number>;
    updatedAt: string | null;
}
interface LiveState {
    presses: () => PressPayload;
    streams: Set<ServerResponse>;
}
