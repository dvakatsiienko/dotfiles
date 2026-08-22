import re, sys

SRT = "/Users/dima/Documents/claude-youtube-transcripts/videos/Baldur's Gate High Level Ability Guide [mlR9ajsUOqU]/transcript.srt"

blocks = open(SRT, encoding='utf-8', errors='ignore').read().split('\n\n')
cues = []
for b in blocks:
    lines = [l for l in b.strip().split('\n') if l.strip()]
    if len(lines) < 2: continue
    tm = None
    for l in lines:
        if '-->' in l: tm = l
    if not tm: continue
    start = tm.split('-->')[0].strip()
    h, m, rest = start.split(':')
    s = int(float(rest.replace(',', '.')))
    secs = int(h)*3600 + int(m)*60 + s
    text = ' '.join(l for l in lines if '-->' not in l and not l.strip().isdigit())
    text = re.sub(r'<[^>]+>', '', text).lower()
    cues.append((secs, text))

# merge into rolling window text
terms = [
 "energy blades","storm of vengeance","elemental summoning","retribution",
 "globe of blades","global blades","implosion","mass raise","aura of flaming","armor of flaming",
 "spirit form","favor to the spirits","favored of the spirits","shadow twin","shadow maze","shadow form",
 "evasion","greater evasion","using the item","use any item","assassination","avoid death",
 "alchemy","scribe scrolls","described scrolls","extra level six","extra level 6","extra level seven","extra level 7",
 "section level 8","extra level eight","improved alacrity","frugal a qwerty","dragon breath","dragon's breath",
 "comet","planet are","planetar","whirlwind","whirl on attack","death blow","resist magic","power attack",
 "critical strike","smite","war cry","work roy","hardiness","heartiness","greater elemental",
 "someone dave","summon deva","fire elemental transformation","earth elemental","tracking",
 "set spike trap","sets by track","exploding trap","time trap","bard's song","bart's song","magic flute",
]

for t in terms:
    hits = [secs for secs, text in cues if t in text]
    if hits:
        # cluster: report first hit and any hit > 120s after previous
        out = []
        prev = -999
        for h in hits:
            if h - prev > 120:
                out.append(h)
            prev = h
        print(f"{t:35s} -> {out[:6]}")
    else:
        print(f"{t:35s} -> NONE")
