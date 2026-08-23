#!/usr/bin/env python3
"""Repair mangled filenames in a caption transcript using the video's own metadata.

Captions and every ASR model tested spell technical filenames wrong in the same
way: near-misses, not noise. `Claude MD`, `cloud.md` and `ClaudeMD` are all within
two edits of `CLAUDE.md` once case, dots and spaces are stripped. The correct
spellings are usually already in the video's title, description, chapters or tags,
so the vocabulary needs no hand-maintained list — the video ships it.

Measured on DOT-211's two test videos: captions alone spell `CLAUDE.md` right 5 of
18 times; with this pass, 18 of 18. See docs/research/asr-for-technical-talks.md.
"""

import json
import re
import sys

# Harvested vocabulary covers what a video names; these are the files talks assume
# everyone knows and therefore never write down. Six entries, no per-video edits.
CORE = frozenset(
    {
        'AGENTS.md',
        'CLAUDE.md',
        'README.md',
        'SKILLS.md',
        'package.json',
        'tsconfig.json',
    }
)

# Only extensions whose repair was actually measured. `.ts`/`.go`/`.sh` are left
# out on purpose: they are ordinary English words, so a candidate regex built on
# them would fire on running prose.
EXTENSIONS = ('md', 'json')

MAX_WORDS = 3
# Two edits is safe on a long name and sloppy on a short one.
LONG_NAME = 7
GUARD = 2  # runner-up must be this much further away, or nothing is rewritten

FILENAME = re.compile(
    r'\b[A-Za-z][A-Za-z0-9_-]{1,20}\.(?:' + '|'.join(EXTENSIONS) + r')\b'
)
# The gate. Nothing without a recognised extension is ever a candidate, which is
# what keeps `Cloudflare`, `WebMD` and a bare `Claude` out of reach of the matcher.
CANDIDATE = re.compile(
    r"\b(?:[A-Za-z][A-Za-z0-9'’]{0,20}[ .\-]{0,2}){0,"
    + str(MAX_WORDS - 1)
    + r"}[A-Za-z][A-Za-z0-9'’]{0,20}[ .\-]{0,2}(?:"
    + '|'.join(EXTENSIONS)
    + r')\b',
    re.I,
)


def normalise(text):
    return re.sub(r'[^a-z0-9]', '', text.lower())


def distance(a, b):
    # Bail early on a length gap no substitution budget could close.
    if abs(len(a) - len(b)) > GUARD + 1:
        return 99
    previous = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        current = [i]
        for j, cb in enumerate(b, 1):
            current.append(
                min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + (ca != cb))
            )
        previous = current
    return previous[-1]


def harvest(meta):
    """Filenames named anywhere in the video's own metadata, plus the core list."""
    fields = [meta.get('title') or '', meta.get('description') or '']
    fields += [c.get('title') or '' for c in (meta.get('chapters') or [])]
    fields += [t for t in (meta.get('tags') or []) if isinstance(t, str)]
    return set(FILENAME.findall(' '.join(fields))) | set(CORE)


def canonical(vocabulary):
    """Map normalised name -> best spelling.

    YouTube lowercases tags, so the same file can arrive as both `CLAUDE.md` and
    `claude.md`. The spelling with more capitals came from prose a human wrote,
    so it wins.
    """
    best = {}
    for term in vocabulary:
        key = normalise(term)
        if key not in best or sum(c.isupper() for c in term) > sum(
            c.isupper() for c in best[key]
        ):
            best[key] = term
    return best


def _match(span, table):
    """Shortest trailing window that resolves, so leading filler is never absorbed.

    'and Claude MD' resolves on 'Claude MD' and keeps 'and'; 'read me MD' needs
    all three words. Trying short first is what stops the filler word from
    pushing the string out of edit range.
    """
    words = span.split()
    for start in range(len(words) - 1, -1, -1):
        key = normalise(' '.join(words[start:]))
        if len(key) < 4:
            continue
        ranked = sorted((distance(key, k), k) for k in table)
        limit = GUARD if len(key) >= LONG_NAME else 1
        if ranked[0][0] <= limit and (
            len(ranked) == 1 or ranked[1][0] >= ranked[0][0] + GUARD
        ):
            return start, table[ranked[0][1]]
    return None, None


def repair(transcript, vocabulary):
    """Returns the repaired text and a {wrong: right} report of what changed."""
    table = canonical(vocabulary)
    changed = {}

    def replace(match):
        span = match.group(0)
        start, name = _match(span, table)
        if name is None:
            return span
        words = span.split()
        rebuilt = ' '.join(words[:start] + [name])
        if rebuilt != span:
            changed[span] = rebuilt
        return rebuilt

    return CANDIDATE.sub(replace, transcript), changed


def load_vocabulary(path):
    if not path:
        return set(CORE)
    try:
        with open(path, encoding='utf-8') as handle:
            return harvest(json.load(handle))
    except (OSError, ValueError):
        # Metadata is an enhancement, never a dependency: a missing or malformed
        # dump degrades to the core list rather than failing the fetch.
        return set(CORE)


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(
            'Usage: repair_identifiers.py <transcript.txt> [yt-dlp-metadata.json]',
            file=sys.stderr,
        )
        sys.exit(1)
    target = sys.argv[1]
    with open(target, encoding='utf-8') as handle:
        source = handle.read()
    fixed, report = repair(source, load_vocabulary(sys.argv[2] if len(sys.argv) > 2 else None))
    with open(target, 'w', encoding='utf-8') as handle:
        handle.write(fixed)
    print(f'Repaired {sum(1 for _ in report)} distinct identifier spelling(s) in {target}')
    for wrong, right in sorted(report.items()):
        print(f'  {wrong!r} -> {right!r}')
