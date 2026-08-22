import re

SRT = "/Users/dima/Documents/claude-youtube-transcripts/videos/Baldur's Gate High Level Ability Guide [mlR9ajsUOqU]/transcript.srt"
blocks = open(SRT, encoding='utf-8', errors='ignore').read().split('\n\n')
cues = []
for b in blocks:
    lines = [l for l in b.strip().split('\n') if l.strip()]
    tm = next((l for l in lines if '-->' in l), None)
    if not tm: continue
    start = tm.split('-->')[0].strip()
    h, m, rest = start.split(':')
    secs = int(h)*3600 + int(m)*60 + int(float(rest.replace(',', '.')))
    text = ' '.join(l for l in lines if '-->' not in l and not l.strip().isdigit())
    cues.append((secs, re.sub(r'<[^>]+>', '', text).lower()))

# "up next" markers = section transitions
for secs, text in cues:
    if 'up next' in text or 'up x' in text or 'objects' in text or 'up mixes' in text:
        print(secs, '|', text[:150])
