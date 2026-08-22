#!/usr/bin/env python3
"""Build the shelf directory name for a video: <channel>-<title>-<video_id>.

Channel leads so the store groups by creator when sorted alphabetically. The id
is always the tail after a hyphen, so a dedupe lookup can anchor on it. Nothing
in the name needs shell quoting.
"""
import re, sys, unicodedata

MAX_CHANNEL = 24
MAX_TITLE = 50
APOSTROPHES = re.compile(r"['‘’ʼ`´]")
NON_SLUG = re.compile(r'[^a-z0-9]+')
VIDEO_ID = re.compile(r'^[A-Za-z0-9_-]{1,32}$')

def slugify(text, max_len):
    # NFD, not NFKD: it folds accents but leaves lookalike punctuation alone, so
    # Theo's "t3․gg" (one-dot leader) drops to "t3gg" while a real "CLAUDE.md"
    # still becomes "claude-md".
    ascii_only = (unicodedata.normalize('NFD', text)
                  .encode('ascii', 'ignore').decode('ascii'))
    # dropped rather than hyphenated, so "don't" becomes "dont", not "don-t"
    collapsed = NON_SLUG.sub('-', APOSTROPHES.sub('', ascii_only).lower()).strip('-')
    if len(collapsed) > max_len:
        cut = collapsed[:max_len]
        last = cut.rfind('-')
        if last > max_len // 2:
            cut = cut[:last]
        collapsed = cut.strip('-')
    return collapsed

def dir_name(channel, title, video_id):
    if not VIDEO_ID.match(video_id):
        raise ValueError(f'refusing to build a name from a malformed video id: {video_id!r}')
    parts = [slugify(channel, MAX_CHANNEL), slugify(title, MAX_TITLE) or 'video', video_id]
    return '-'.join(p for p in parts if p)

if __name__ == '__main__':
    if len(sys.argv) != 4:
        print('Usage: python3 sanitize_title.py "<channel>" "<title>" "<video_id>"', file=sys.stderr)
        sys.exit(1)
    try:
        print(dir_name(sys.argv[1], sys.argv[2], sys.argv[3]))
    except ValueError as err:
        print(err, file=sys.stderr)
        sys.exit(1)
