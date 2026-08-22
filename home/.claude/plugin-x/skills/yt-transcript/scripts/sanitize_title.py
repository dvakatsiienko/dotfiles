#!/usr/bin/env python3
"""Build the shelf directory name for a video: <kebab-slug>-<video_id>.

The id is the last 11 characters and is always preceded by a hyphen, so a
dedupe lookup can anchor on it. Nothing in the name needs shell quoting.
"""
import re, sys, unicodedata

MAX_SLUG = 70
APOSTROPHES = re.compile(r"['‘’ʼ`´]")
NON_SLUG = re.compile(r'[^a-z0-9]+')
VIDEO_ID = re.compile(r'^[A-Za-z0-9_-]{1,32}$')

def slugify(title, max_len=MAX_SLUG):
    ascii_only = (unicodedata.normalize('NFKD', title)
                  .encode('ascii', 'ignore').decode('ascii'))
    # dropped rather than hyphenated, so "don't" becomes "dont", not "don-t"
    collapsed = NON_SLUG.sub('-', APOSTROPHES.sub('', ascii_only).lower()).strip('-')
    if len(collapsed) > max_len:
        cut = collapsed[:max_len]
        last = cut.rfind('-')
        if last > max_len // 2:
            cut = cut[:last]
        collapsed = cut.strip('-')
    return collapsed or 'video'

def dir_name(title, video_id):
    if not VIDEO_ID.match(video_id):
        raise ValueError(f'refusing to build a name from a malformed video id: {video_id!r}')
    return f'{slugify(title)}-{video_id}'

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print('Usage: python3 sanitize_title.py "<title>" "<video_id>"', file=sys.stderr)
        sys.exit(1)
    try:
        print(dir_name(sys.argv[1], sys.argv[2]))
    except ValueError as err:
        print(err, file=sys.stderr)
        sys.exit(1)
