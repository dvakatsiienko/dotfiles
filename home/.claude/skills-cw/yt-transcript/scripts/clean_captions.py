#!/usr/bin/env python3
import sys, re, html
TIMESTAMP_LINE = re.compile(r"^\s*\d{2}:\d{2}:\d{2}[.,]\d{3}\s*-->\s*\d{2}:\d{2}:\d{2}[.,]\d{3}")
INLINE_TAG = re.compile(r"<[^>]+>")
CUE_NUMBER = re.compile(r"^\d+$")
def clean_line(line):
    stripped = INLINE_TAG.sub('', line)
    return html.unescape(stripped).replace('\xa0', ' ').strip()
def main():
    src, dst = sys.argv[1], sys.argv[2]
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
    with open(dst, 'w', encoding='utf-8') as f: f.write(output)
    print(f'Wrote {len(output)} chars, {len(deduped)} caption lines -> {dst}')
main()
