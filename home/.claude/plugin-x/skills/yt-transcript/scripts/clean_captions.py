#!/usr/bin/env python3
import sys, re, html

# Set before the import below: this script lives in a git-tracked skill directory,
# and a __pycache__ next to it would be rewritten on every transcript fetch.
sys.dont_write_bytecode = True

# Same directory, so the script's own dir is already on sys.path.
from repair_identifiers import load_vocabulary, repair
TIMESTAMP_LINE = re.compile(r"^\s*\d{2}:\d{2}:\d{2}[.,]\d{3}\s*-->\s*\d{2}:\d{2}:\d{2}[.,]\d{3}")
INLINE_TAG = re.compile(r"<[^>]+>")
CUE_NUMBER = re.compile(r"^\d+$")
def clean_line(line):
    stripped = INLINE_TAG.sub('', line)
    return html.unescape(stripped).replace('\xa0', ' ').strip()
def main():
    src, dst = sys.argv[1], sys.argv[2]
    # Optional yt-dlp -J dump. Its title/description/chapters/tags supply the
    # vocabulary that repairs mangled filenames; absent, only the core list is used.
    meta = sys.argv[3] if len(sys.argv) > 3 else None
    with open(src, 'r', encoding='utf-8', errors='replace') as f:
        raw_lines = f.readlines()
    text_lines = []
    for raw in raw_lines:
        line = raw.rstrip('\n')
        if not line.strip(): continue
        if line.strip() == 'WEBVTT': continue
        if line.startswith('NOTE') or line.startswith('Kind:') or line.startswith('Language:'): continue
        if TIMESTAMP_LINE.match(line): continue
        if CUE_NUMBER.match(line.strip()): continue
        cleaned = clean_line(line)
        if cleaned: text_lines.append(cleaned)
    deduped = []
    for line in text_lines:
        if deduped and (line == deduped[-1] or line.startswith(deduped[-1])):
            deduped[-1] = line
            continue
        if deduped and deduped[-1].startswith(line):
            continue
        deduped.append(line)
    paragraphs = []
    chunk = []
    for i, line in enumerate(deduped, 1):
        chunk.append(line)
        if i % 25 == 0:
            paragraphs.append(' '.join(chunk)); chunk = []
    if chunk: paragraphs.append(' '.join(chunk))
    output = '\n\n'.join(paragraphs)
    output, repaired = repair(output, load_vocabulary(meta))
    with open(dst, 'w', encoding='utf-8') as f: f.write(output)
    print(f'Wrote {len(output)} chars, {len(deduped)} caption lines -> {dst}')
    if repaired:
        print(f'Repaired {len(repaired)} identifier spelling(s): '
              + ', '.join(f'{k} -> {v}' for k, v in sorted(repaired.items())))
main()
