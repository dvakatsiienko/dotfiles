import math, pathlib
from lettering import outline, width

HERE = pathlib.Path(__file__).resolve().parent

# ---------- paper cuts ----------
REX = dict(
 tail='M0 78C30 70 70 58 105 50C125 45 145 44 160 50C172 55 178 64 176 78C172 96 158 106 138 110C118 114 100 110 88 104C60 96 30 88 0 82Z',
 head='M150 56C150 38 158 22 172 15L214 9C225 8 232 14 232 23L232 31L204 33L200 37L182 38C176 50 170 62 162 72Z',
 jaw='M184 41L224 40C224 47 217 52 207 52L186 54C182 50 182 45 184 41Z',
 thigh='M98 92C106 78 134 78 140 96C144 110 136 122 126 128L130 146L146 146L148 151L110 151L113 128C101 120 94 104 98 92Z',
 leg='M140 100C150 97 159 108 155 120L151 146L165 146L167 151L136 151L141 124Z',
 arm='M166 74C172 78 177 84 175 90L182 92L180 95L173 94L177 98L174 100L168 95C165 89 162 83 159 78Z')
REX_W = 232

def pine(x, base, H, c1, c2, f, tiers=4):
    o = f'<rect x="{x-H*.035:.1f}" y="{base-H*.18:.1f}" width="{H*.07:.1f}" height="{H*.18:.1f}" fill="#5a4030"/>'
    for k in range(tiers):
        w = H * .62 * (1 - k * .2); yb = base - H * .14 - k * H * .19; yt = yb - H * .34
        teeth = 5; pts = [(x + w / 2, yb)]
        for t in range(1, teeth):
            px = x + w / 2 - w * t / teeth; pts += [(px + w / teeth / 2, yb - H * .04), (px, yb)]
        pts.append((x - w / 2, yb))
        d = f'M{x:.1f} {yt:.1f}' + ''.join(f'L{a:.1f} {b:.1f}' for a, b in pts) + 'Z'
        o += f'<path filter="url(#{f})" fill="{c1}" d="{d}"/><path fill="{c2}" d="M{x:.1f} {yt:.1f}L{x+w/2:.1f} {yb:.1f}L{x:.1f} {yb-H*.04:.1f}Z" opacity=".55"/>'
    return f'<g>{o}</g>'

def frond(h, ang, c):
    leaves = ''
    n = 9
    for k in range(n):
        t = (k + .6) / n; L = h * .28 * (1 - t * .75); y = -h * t
        for sgn in (1, -1):
            a = sgn * (62 - t * 25)
            leaves += f'<path transform="translate(0 {y:.1f}) rotate({a:.0f})" d="M0 0q{L/2:.1f} {-L*.3:.1f} {L:.1f} 0q{-L/2:.1f} {L*.3:.1f} {-L:.1f} 0z"/>'
    return f'<g transform="rotate({ang})" fill="{c}"><path d="M0 0Q{h*.06:.1f} {-h/2:.1f} 0 {-h:.1f}" stroke="{c}" stroke-width="1.6" fill="none"/>{leaves}</g>'

def fern(x, y, h, c, f):
    return f'<g transform="translate({x} {y})" filter="url(#{f})">' + ''.join(frond(h * k, a, c) for a, k in [(-58, .7), (-30, .9), (0, 1), (30, .88), (56, .72)]) + '</g>'

def tuft(x, y, s, c):
    return f'<path fill="{c}" d="M{x} {y}' + ''.join(f'q{dx*s*.3:.1f} {-hh*s*.6:.1f} {dx*s:.1f} {-hh*s:.1f}q{-dx*s*.2+2:.1f} {hh*s*.6:.1f} 2 {hh*s:.1f}' for dx, hh in [(-6, 10), (-2, 16), (3, 13), (6, 9)]) + 'z"/>'

def mush(x, y, s, P, f):
    return f'<g filter="url(#{f})" transform="translate({x} {y}) scale({s})"><path fill="{P["stem"]}" d="M-3 0h6l-1-12h-4z"/><path fill="{P["cap"]}" d="M-11-10q11-16 22 0z"/><circle cx="-4" cy="-14" r="1.6" fill="{P["dot"]}"/><circle cx="3" cy="-16" r="1.3" fill="{P["dot"]}"/><circle cx="6" cy="-12" r="1" fill="{P["dot"]}"/></g>'

def bush(x, y, s, P, f):
    blobs = ''.join(f'<circle cx="{x+dx*s}" cy="{y+dy*s}" r="{r*s}" fill="{c}"/>' for dx, dy, r, c in [(-18, -8, 12, P['bush2']), (16, -9, 12, P['bush2']), (-6, -18, 14, P['bush']), (8, -16, 13, P['bush']), (0, -6, 14, P['bush'])])
    ber = ''.join(f'<circle cx="{x+dx*s}" cy="{y+dy*s}" r="{2.3*s}" fill="{P["berry"]}"/>' for dx, dy in [(-10, -14), (-6, -10), (4, -20), (9, -12), (13, -15), (-14, -4), (2, -6)])
    return f'<g filter="url(#{f})">{blobs}{ber}</g>'

def stone(x, y, rx, ry, P, f):
    return f'<g filter="url(#{f})"><ellipse cx="{x}" cy="{y}" rx="{rx}" ry="{ry}" fill="{P["rock"]}"/><path d="M{x-rx*.5} {y-ry*.35}q{rx*.4} {-ry*.5} {rx*.8} 0" stroke="{P["hl"]}" stroke-width="1.4" fill="none"/></g>'

def rex(P, i, cx, ty):
    """a paper t-rex looking left, centred on cx"""
    tr = f'translate({cx - REX_W / 2:.0f} {ty}) translate({REX_W} 0) scale(-1 1)'
    f = f'ps{i}'
    stripes = ''.join(f'<path d="M{x} {y}q4 8 0 16" stroke="{P["rex2"]}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"/>' for x, y in [(60, 64), (78, 58), (96, 54), (120, 50)])
    spikes = ''.join(f'<path fill="{P["rex2"]}" d="M{x} {y}l5-8 5 8z"/>' for x, y in [(40, 70), (60, 64), (80, 59), (100, 53), (120, 48), (140, 47), (158, 24)])
    return f'''<g transform="{tr}">{spikes}<path fill="{P['rex2']}" filter="url(#{f})" d="{REX['leg']}"/><path fill="{P['rex2']}" filter="url(#{f})" d="{REX['arm']}"/>
<path fill="{P['rex']}" filter="url(#{f})" d="{REX['tail']}"/><path fill="{P['belly']}" d="M104 96C120 104 140 104 156 94C150 104 138 110 122 110C112 108 106 102 104 96Z"/>{stripes}
<path fill="{P['rex2']}" filter="url(#{f})" d="{REX['jaw']}"/><path fill="#f7efdc" d="M190 38l3 5 3-5zM200 38l3 5 3-5zM210 37l3 5 3-5zM192 42l3-4 3 4zM204 42l3-4 3 4z"/>
<path fill="{P['rex']}" filter="url(#{f})" d="{REX['head']}"/><circle cx="206" cy="20" r="3" fill="#2b1e16"/><circle cx="207" cy="19" r="1" fill="#fff"/><circle cx="226" cy="18" r="1.3" fill="#2b1e16"/><path d="M198 15l14-2" stroke="#2b1e16" stroke-width="2" stroke-linecap="round"/>
<path fill="{P['rex']}" filter="url(#{f})" d="{REX['thigh']}"/><path fill="#f7efdc" d="M146 151l3-4 2 4zM152 151l3-4 2 4zM161 151l3-4 2 4zM167 151l3-4 2 4z"/></g>'''

def orb(P, night, f, x, y=96):
    thread = f'<line x1="{x}" y1="0" x2="{x}" y2="{y-26}" stroke="{P["thr"]}" stroke-width="1.2"/><circle fill="{P["orb"]}" cx="{x}" cy="{y}" r="26" filter="url(#{f})"/>'
    if night:
        return thread + f'<circle cx="{x-8}" cy="{y-6}" r="5" fill="#d6cfb5"/><circle cx="{x+10}" cy="{y+8}" r="3.5" fill="#d6cfb5"/><circle cx="{x+6}" cy="{y-10}" r="2.5" fill="#d6cfb5"/>'
    rays = ''.join(f'<path d="M{x+32*math.cos(a):.1f} {y+32*math.sin(a):.1f}l{6*math.cos(a):.1f} {6*math.sin(a):.1f}" stroke="#f29c38" stroke-width="3" stroke-linecap="round"/>' for a in [k * math.pi / 6 for k in range(12)])
    return thread + f'<circle cx="{x}" cy="{y}" r="18" fill="#f6b862"/>' + rays

TAG_TEXT = 'hey, welcome to my crafting place.'
def tag(i, P, x=24):
    w = width(TAG_TEXT, 15) + 28
    cx = x + w / 2
    threads = ''.join(f'<line x1="{tx:.1f}" y1="0" x2="{tx:.1f}" y2="40" stroke="{P["thr"]}" stroke-width="1.2"/>' for tx in (x + 18, x + w - 18))
    return f'{threads}<g filter="url(#ps{i})" transform="rotate(-2 {cx:.1f} 54)"><rect x="{x}" y="38" width="{w:.1f}" height="32" fill="{P["tag"]}"/>{outline(TAG_TEXT, cx, 59, 15, "Bold", "middle", P["ink"])}</g>'

def aurora(i):
    """soft curtains: a tall faint band plus a thin bright hem, both blurred"""
    curtains = [(300, 790, 70, 14, 0.0, 58, 'aug'), (380, 800, 92, 10, 1.9, 40, 'auc'), (430, 760, 52, 12, 3.6, 34, 'auv'), (520, 800, 110, 8, 0.8, 30, 'aug')]
    out = ''
    for x0, x1, yc, amp, ph, H, g in curtains:
        top, hem, bot = [], [], []
        for n in range(41):
            t = n / 40; x = x0 + (x1 - x0) * t
            y = yc + amp * math.sin(2 * math.pi * 1.2 * t + ph)
            h = H * math.sin(math.pi * t) ** .8
            top.append((x, y - h)); hem.append((x, y - h * .22)); bot.append((x, y + 3 * math.sin(math.pi * t)))
        band = lambda up: 'M' + 'L'.join(f'{a:.1f} {b:.1f}' for a, b in up + bot[::-1]) + 'Z'
        out += f'<path fill="url(#{g}{i})" filter="url(#aub{i})" opacity=".55" d="{band(top)}"/><path fill="url(#{g}{i})" filter="url(#auh{i})" opacity=".8" d="{band(hem)}"/>'
    return f'<g>{out}</g>'

def aurora_defs(i):
    grad = lambda gid, c: f'<linearGradient id="{gid}{i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{c}" stop-opacity="0"/><stop offset=".8" stop-color="{c}" stop-opacity=".9"/><stop offset="1" stop-color="{c}" stop-opacity=".4"/></linearGradient>'
    return (grad('aug', '#5ff2c8') + grad('auc', '#7dd8ff') + grad('auv', '#b48cff')
            + f'<filter id="aub{i}" x="-10%" y="-60%" width="120%" height="220%"><feGaussianBlur stdDeviation="9"/></filter>'
            + f'<filter id="auh{i}" x="-10%" y="-60%" width="120%" height="220%"><feGaussianBlur stdDeviation="3.5"/></filter>')

def fire(P, night, f, fx, fy, i):
    glow = f'<ellipse cx="{fx}" cy="{fy-10}" rx="{140 if night else 60}" ry="{110 if night else 40}" fill="url(#glow{i})"/>'
    ring = ''.join(stone(fx + dx, fy + dy, 8, 4.5, P, f) for dx, dy in [(-26, 2), (-14, 7), (0, 9), (14, 7), (26, 2)])
    logs = f'<g filter="url(#{f})"><path fill="#6b4630" d="M{fx-24} {fy}l46-12 3 6-46 12z"/><path fill="#7c5236" d="M{fx+24} {fy}l-46-12-3 6 46 12z"/></g>'
    if night:
        flames = (f'<g filter="url(#{f})"><path fill="#e2552c" d="M{fx-16} {fy-6}q-2-22 10-34q-2 14 8 18q2-16 12-24q-4 22 4 30q2 8-6 10z"/><path fill="#f29c38" d="M{fx-9} {fy-6}q0-14 8-22q0 10 6 12q2-8 8-12q-2 14 0 20q0 4-4 4z"/><path fill="#fbe0a0" d="M{fx-3} {fy-6}q0-8 5-12q1 6 4 6q0 4-1 6z"/></g>'
                  + ''.join(f'<circle cx="{fx+dx}" cy="{fy+dy}" r="1.4" fill="#fbd27a"/>' for dx, dy in [(-6, -48), (8, -58), (-2, -66), (12, -44)]))
    else:
        flames = f'<path d="M{fx} {fy-8}c-8-14 8-22 0-36s8-20 2-34" stroke="#b9b6ae" stroke-width="5" fill="none" stroke-linecap="round" opacity=".55"/><path fill="#e2552c" d="M{fx-5} {fy-6}q2-8 6-10q2 6 5 10z"/>'
    return glow, ring + logs + flames

def defs(i, night, P, extra=''):
    glow = f'<radialGradient id="glow{i}" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffb24a" stop-opacity="{.55 if night else .18}"/><stop offset="1" stop-color="#ffb24a" stop-opacity="0"/></radialGradient>'
    return f'''<defs><filter id="ps{i}" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="2" dy="3.5" stdDeviation="2.2" flood-color="{'#03050c' if night else '#4a321a'}" flood-opacity="{.55 if night else .3}"/></filter>
<filter id="gr{i}"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="3" seed="4"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="table" tableValues="0 .09"/></feComponentTransfer></filter>
<linearGradient id="sk{i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{P['sky']}"/><stop offset="1" stop-color="{P['sky2']}"/></linearGradient>{glow}{extra}</defs>'''

def svg(aria, body):
    return f'<svg xmlns="http://www.w3.org/2000/svg" class="hero" viewBox="0 0 800 300" width="800" height="300" role="img" aria-label="{aria}">{body}</svg>'

STARS = [(70, 40, 1.6), (130, 90, 1.2), (260, 30, 1.8), (330, 70, 1), (420, 24, 1.4), (500, 60, 1.1), (560, 30, 1.7), (740, 50, 1.2), (770, 110, 1), (40, 120, 1.1), (300, 120, 1), (200, 60, 1), (380, 40, 1.3), (460, 90, .9), (610, 20, 1.2), (690, 90, 1), (160, 20, 1.1)]
def stars(): return ''.join(f'<circle cx="{x}" cy="{y}" r="{r}" fill="#f4efdc"/>' for x, y, r in STARS)
def clouds(P, f, at): return ''.join(f'<path fill="{P["sky2"]}" filter="url(#{f})" d="M{x} {y}q10-16 26-8q12-12 28 0q16 0 16 12h-78q-2-6 8-4z"/>' for x, y in at)

DAY = dict(sky='#f3e2c0', sky2='#f7ebd2', r0='#eed6ad', r1='#e8c795', r2='#cf9f68', pine='#7d9463', pineS='#4f6b3e', pine2='#5d7a4c', fern='#4f6b3e', fern2='#6f8a52', gr='#8c6a44', gr2='#6f5236', rock='#a58f75', hl='#d8c7ae', rex='#c0573a', rex2='#9c4430', belly='#e0a275', orb='#f29c38', thr='#6b5a48', tag='#fffaf0', ink='#4a3b2c',
 bush='#6f8a52', bush2='#55703f', berry='#c43a3a', cap='#c0573a', stem='#f3e7cf', dot='#fffaf0', grass='#7d9463')
NIGHT = dict(sky='#141b31', sky2='#243052', r0='#2c3760', r1='#34406a', r2='#2a3558', pine='#2b4a44', pineS='#16302b', pine2='#1f3a35', fern='#1a302b', fern2='#264038', gr='#2e2a33', gr2='#221f27', rock='#4a4d5e', hl='#6c7086', rex='#7a3b36', rex2='#5e2c2a', belly='#9a6558', orb='#ece6cf', thr='#9aa1b4', tag='#e6e2d4', ink='#2b2f3e',
 bush='#264038', bush2='#1a302b', berry='#b0435a', cap='#8a4b5e', stem='#b9b3a2', dot='#e6e2d4', grass='#2b4a44')
CDAY = dict(DAY, sky='#dfe6e4', sky2='#f6e6cf', r0='#d6dcd6', r1='#c3cfc3', r2='#a9b99e', pine='#6f8a64', pine2='#56704c', orb='#f4b870')
CNIGHT = dict(NIGHT, sky='#0a1124', sky2='#18244a', r0='#1a2644', r1='#1c2a4a', r2='#16213c', pine='#1d3a3a', pine2='#132a2a', gr='#1e1f2b', gr2='#15151e', fern='#16302b', rock='#3e4152', hl='#8a6a50')

GOLD_L, GOLD_R = 306, 496  # the two golden-ratio verticals of an 800 px scene

def ridges(P, f):
    far = ''.join(pine(x, 172, 34, P['r2'], P['r2'], f, 3) for x in range(12, 800, 46))
    return (f'<path fill="{P["r0"]}" filter="url(#{f})" d="M0 150L90 120L170 134L260 104L340 130L430 110L520 128L600 112L700 132L800 118V300H0Z"/>{far}'
            f'<path fill="{P["r1"]}" filter="url(#{f})" d="M0 170L70 138L130 156L210 118L300 162L380 132L470 166L560 128L660 164L740 142L800 152V300H0Z"/>'
            f'<path fill="{P["r2"]}" filter="url(#{f})" d="M0 196C60 178 110 184 170 170S280 160 340 178S460 168 540 184S680 166 800 180V300H0Z"/>')

# ---------- plate i: the diorama ----------
def plate1(night, i):
    P = NIGHT if night else DAY; f = f'ps{i}'
    sky = stars() if night else clouds(P, f, [(70, 150), (470, 50), (720, 120), (560, 150)])
    mid = ''.join(pine(x, 206, H, P['pine'], P['pineS'], f) for x, H in [(40, 82), (84, 64), (118, 54), (604, 92), (646, 60), (700, 80), (752, 68), (790, 56)])
    near = ''.join(pine(x, 216, H, P['pine2'], P['pineS'], f) for x, H in [(196, 52), (240, 68), (690, 50), (730, 38)])
    ferns = fern(140, 236, 46, P['fern'], f) + fern(600, 238, 40, P['fern2'], f) + fern(720, 242, 52, P['fern'], f) + fern(40, 244, 36, P['fern2'], f)
    tufts = ''.join(tuft(x, y, s, P['grass']) for x, y, s in [(96, 248, 1), (212, 246, 1.2), (300, 250, .9), (452, 248, 1.1), (620, 250, 1), (760, 248, 1.2), (372, 262, 1), (520, 264, .8)])
    body = f'''{defs(i, night, P)}<rect width="800" height="300" fill="url(#sk{i})"/>{sky}{orb(P, night, f, GOLD_L)}{ridges(P, f)}{mid}
<path fill="{P['gr']}" filter="url(#{f})" d="M0 218C80 208 170 216 260 210S420 218 520 212S680 216 800 210V300H0Z"/>{near}
{bush(356, 226, 1.1, P, f)}{rex(P, i, GOLD_R, 66)}{ferns}
{stone(640, 240, 14, 7, P, f)}{stone(664, 244, 9, 5, P, f)}
{mush(200, 240, 1, P, f)}{mush(214, 244, .7, P, f)}{mush(770, 248, .9, P, f)}
<path fill="{P['gr2']}" filter="url(#{f})" d="M0 254C120 244 260 256 400 250S640 244 800 254V300H0Z"/>{tufts}
<path fill="{P['rock']}" filter="url(#{f})" d="M600 300C596 276 616 256 650 252C690 246 720 262 730 280L736 300Z"/><path d="M640 268l20-6M672 262l18 10" stroke="{P['gr2']}" stroke-width="2" fill="none" opacity=".5"/>
{bush(90, 284, 1.3, P, f)}{mush(560, 286, 1.2, P, f)}{tag(i, P)}
<rect width="800" height="300" filter="url(#gr{i})"/>'''
    return svg(f"paper-cut diorama, {'night' if night else 'day'}: layered pines, ferns, a berry bush, mushrooms and stones; a paper t-rex looks left toward the {'moon' if night else 'sun'}", body)

# ---------- plate ii: the campfire clearing ----------
def plate2(night, i):
    P = CNIGHT if night else CDAY; f = f'ps{i}'
    sky = stars() + aurora(i) if night else f'<circle cx="{GOLD_L}" cy="92" r="40" fill="#f6c98a" opacity=".6"/><circle cx="{GOLD_L}" cy="92" r="26" fill="#f8d6a0"/>'
    tallL = pine(46, 250, 200, P['pine2'], P['pineS'], f, 6) + pine(110, 244, 160, P['pine'], P['pineS'], f, 5) + pine(-8, 256, 170, P['pine2'], P['pineS'], f, 5)
    tallR = pine(760, 250, 210, P['pine2'], P['pineS'], f, 6) + pine(700, 238, 150, P['pine'], P['pineS'], f, 5) + pine(806, 254, 170, P['pine'], P['pineS'], f, 5)
    far = ''.join(pine(x, 184, 40, P['r2'], P['r2'], f, 3) for x in range(160, 660, 38))
    fx, fy = 250, 256
    glow, camp = fire(P, night, f, fx, fy, i)
    path = ''.join(stone(x, y, rx, ry, P, f) for x, y, rx, ry in [(420, 296, 24, 8), (372, 285, 20, 7), (334, 277, 17, 6), (304, 271, 14, 5)])
    tufts = ''.join(tuft(x, y, s, P['grass']) for x, y, s in [(180, 262, 1.1), (560, 272, 1), (620, 266, 1), (660, 278, 1.2), (500, 288, .9), (140, 286, 1.3), (700, 290, 1)])
    body = f'''{defs(i, night, P, aurora_defs(i) if night else '')}<rect width="800" height="300" fill="url(#sk{i})"/>{sky}
<path fill="{P['r0']}" filter="url(#{f})" d="M0 170L110 140L220 156L330 128L430 150L540 132L650 152L800 138V300H0Z"/>{far}
<path fill="{P['r2']}" filter="url(#{f})" d="M0 206C120 190 240 200 360 192S600 198 800 190V300H0Z"/>
<path fill="{P['gr']}" filter="url(#{f})" d="M0 236C150 226 300 232 450 228S680 230 800 226V300H0Z"/>
{glow}{bush(620, 240, .9, P, f)}{bush(178, 240, 1.1, P, f)}
{rex(P, i, GOLD_R, 96)}{camp}
{fern(150, 258, 40, P['fern'], f)}{fern(760, 264, 40, P['fern2'], f)}
{mush(340, 262, 1, P, f)}{mush(354, 266, .7, P, f)}{mush(640, 280, .9, P, f)}
<path fill="{P['gr2']}" filter="url(#{f})" d="M0 270C140 262 260 272 400 268S640 262 800 270V300H0Z"/>{path}{tufts}
{tallL}{tallR}{bush(110, 292, 1.3, P, f)}{bush(720, 294, 1.2, P, f)}{tag(i, P)}
<rect width="800" height="300" filter="url(#gr{i})"/>'''
    return svg(f"paper-cut clearing, {'night under a soft aurora' if night else 'morning'}: tall pines on both sides, a campfire on the left, a paper t-rex on the right looking at it", body)

# ---------- plate iii: the merge ----------
def plate3(night, i):
    P = dict(NIGHT, sky=CNIGHT['sky'], sky2=CNIGHT['sky2']) if night else DAY; f = f'ps{i}'
    sky = stars() + aurora(i) if night else clouds(P, f, [(70, 150), (470, 40), (720, 120), (580, 140)])
    mid = ''.join(pine(x, 206, H, P['pine'], P['pineS'], f) for x, H in [(40, 82), (84, 64), (118, 54), (604, 92), (646, 60), (700, 80), (752, 68), (790, 56)])
    near = ''.join(pine(x, 216, H, P['pine2'], P['pineS'], f) for x, H in [(176, 60), (690, 50), (730, 38)])
    fx, fy = GOLD_L - 40, 240
    glow, camp = fire(P, night, f, fx, fy, i)
    ferns = fern(150, 238, 46, P['fern'], f) + fern(600, 238, 40, P['fern2'], f) + fern(720, 242, 52, P['fern'], f) + fern(40, 244, 36, P['fern2'], f)
    path = ''.join(stone(x, y, rx, ry, P, f) for x, y, rx, ry in [(372, 290, 22, 7), (340, 274, 17, 6), (314, 262, 13, 5)])
    tufts = ''.join(tuft(x, y, s, P['grass']) for x, y, s in [(96, 248, 1), (212, 250, 1.2), (452, 248, 1.1), (620, 250, 1), (760, 248, 1.2), (420, 266, 1), (520, 264, .8)])
    body = f'''{defs(i, night, P, aurora_defs(i) if night else '')}<rect width="800" height="300" fill="url(#sk{i})"/>{sky}{orb(P, night, f, GOLD_L)}{ridges(P, f)}{mid}
<path fill="{P['gr']}" filter="url(#{f})" d="M0 218C80 208 170 216 260 210S420 218 520 212S680 216 800 210V300H0Z"/>{near}
{glow}{bush(380, 226, 1, P, f)}{rex(P, i, GOLD_R, 66)}{camp}{ferns}
{stone(640, 240, 14, 7, P, f)}{stone(664, 244, 9, 5, P, f)}
{mush(214, 246, 1, P, f)}{mush(228, 250, .7, P, f)}{mush(770, 248, .9, P, f)}
<path fill="{P['gr2']}" filter="url(#{f})" d="M0 254C120 244 260 256 400 250S640 244 800 254V300H0Z"/>{path}{tufts}
<path fill="{P['rock']}" filter="url(#{f})" d="M600 300C596 276 616 256 650 252C690 246 720 262 730 280L736 300Z"/><path d="M640 268l20-6M672 262l18 10" stroke="{P['gr2']}" stroke-width="2" fill="none" opacity=".5"/>
{bush(90, 284, 1.3, P, f)}{mush(560, 286, 1.2, P, f)}{tag(i, P)}
<rect width="800" height="300" filter="url(#gr{i})"/>'''
    return svg(f"paper-cut forest, {'night: moon, stars and a soft aurora' if night else 'day: sun and clouds'}; a campfire on the left, a paper t-rex on the right looking left at the fire", body)

SCENES = {'diorama': plate1, 'campfire': plate2, 'merge': plate3}

if __name__ == '__main__':
    for name, draw in SCENES.items():
        for mode, night in (('day', False), ('night', True)):
            p = HERE / f'hero-{name}-{mode}.svg'
            p.write_text(draw(night, ''))
            print(f'{p.name:26} {p.stat().st_size / 1024:6.1f} KB')
