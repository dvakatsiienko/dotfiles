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

def rex(P, i, cx, ty, detail=False):
    """a paper t-rex looking left, centred on cx"""
    tr = f'translate({cx - REX_W / 2:.0f} {ty}) translate({REX_W} 0) scale(-1 1)'
    f = f'ps{i}'
    stripes = ''.join(f'<path d="M{x} {y}q4 8 0 16" stroke="{P["rex2"]}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"/>' for x, y in [(60, 64), (78, 58), (96, 54), (120, 50)])
    spikes = ''.join(f'<path fill="{P["rex2"]}" d="M{x} {y}l5-8 5 8z"/>' for x, y in [(40, 70), (60, 64), (80, 59), (100, 53), (120, 48), (140, 47), (158, 24)])
    mouth = hi_body = hi_head = over = ''
    if detail:
        hi, dk = P['rexHi'], P['rex2']
        mouth = '<path fill="#5a1f1c" d="M184 38L224 38L222 43C216 48 200 50 186 50Z"/><path fill="#d9737a" d="M192 46q8-4 16 0q-8 4-16 0z"/>'
        hi_body = (f'<path fill="{hi}" d="M8 78C40 70 78 58 108 51C128 46 146 45 158 50C146 50 128 52 108 57C78 64 40 74 8 81Z"/>'
                   + ''.join(f'<path d="M{x} 99q2 5 0 9" stroke="{dk}" stroke-width="1.4" fill="none" opacity=".35"/>' for x in (112, 120, 128, 136, 144))
                   + ''.join(f'<circle cx="{x}" cy="{y}" r="1.5" fill="{dk}" opacity=".6"/>' for x, y in [(30, 80), (52, 74), (70, 72), (88, 67), (62, 84), (84, 80), (108, 63), (130, 59), (146, 61), (118, 74), (100, 89)])
                   + ''.join(f'<path d="M{x} {y}q4 8 0 16" stroke="{dk}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"/>' for x, y in [(26, 74), (42, 70)]))
        hi_head = (f'<path fill="{hi}" d="M160 50C160 36 166 24 176 19L212 13C218 12 222 14 224 17L178 23C170 28 166 38 164 50Z" opacity=".8"/>'
                   + ''.join(f'<circle cx="{x}" cy="{y}" r="1.4" fill="{dk}" opacity=".6"/>' for x, y in [(168, 30), (176, 36), (172, 46), (184, 28)])
                   + f'<path d="M160 58q-4 6-2 12M166 56q-4 6-2 12" stroke="{dk}" stroke-width="1.4" fill="none" opacity=".6"/>')
        over = (f'<path d="M104 102q12-14 30-4" stroke="{dk}" stroke-width="2" fill="none" opacity=".6"/><path d="M112 88q10-8 22-2" stroke="{hi}" stroke-width="2" fill="none" stroke-linecap="round"/>'
                f'<path fill="#f7efdc" d="M182 92l3 1-2 2zM177 98l3 2-3 1z"/>'
                )
    return f'''<g transform="{tr}">{spikes}<path fill="{P['rex2']}" filter="url(#{f})" d="{REX['leg']}"/><path fill="{P['rex2']}" filter="url(#{f})" d="{REX['arm']}"/>
<path fill="{P['rex']}" filter="url(#{f})" d="{REX['tail']}"/><path fill="{P['belly']}" d="M104 96C120 104 140 104 156 94C150 104 138 110 122 110C112 108 106 102 104 96Z"/>{stripes}{hi_body}
{mouth}<path fill="{P['rex2']}" filter="url(#{f})" d="{REX['jaw']}"/><path fill="#f7efdc" d="M190 38l3 5 3-5zM200 38l3 5 3-5zM210 37l3 5 3-5zM192 42l3-4 3 4zM204 42l3-4 3 4z"/>
<path fill="{P['rex']}" filter="url(#{f})" d="{REX['head']}"/><circle cx="206" cy="20" r="3" fill="#2b1e16"/><circle cx="207" cy="19" r="1" fill="#fff"/><circle cx="226" cy="18" r="1.3" fill="#2b1e16"/><path d="M198 15l14-2" stroke="#2b1e16" stroke-width="2" stroke-linecap="round"/>{hi_head}
<path fill="{P['rex']}" filter="url(#{f})" d="{REX['thigh']}"/><path fill="#f7efdc" d="M146 151l3-4 2 4zM152 151l3-4 2 4zM161 151l3-4 2 4zM167 151l3-4 2 4z"/>{over}</g>'''

def orb(P, night, f, x, y=96):
    thread = f'<line x1="{x}" y1="0" x2="{x}" y2="{y-26}" stroke="{P["thr"]}" stroke-width="1.2"/><circle fill="{P["orb"]}" cx="{x}" cy="{y}" r="26" filter="url(#{f})"/>'
    if night:
        return thread + f'<circle cx="{x-8}" cy="{y-6}" r="5" fill="#d6cfb5"/><circle cx="{x+10}" cy="{y+8}" r="3.5" fill="#d6cfb5"/><circle cx="{x+6}" cy="{y-10}" r="2.5" fill="#d6cfb5"/>'
    rays = ''.join(f'<path d="M{x+32*math.cos(a):.1f} {y+32*math.sin(a):.1f}l{6*math.cos(a):.1f} {6*math.sin(a):.1f}" stroke="#f29c38" stroke-width="3" stroke-linecap="round"/>' for a in [k * math.pi / 6 for k in range(12)])
    return thread + f'<circle cx="{x}" cy="{y}" r="18" fill="#f6b862"/>' + rays

TAG_TEXT = 'hey, welcome to my crafting place'
def tag(i, P, x=24):
    w = width(TAG_TEXT, 15) + 28
    cx = x + w / 2
    threads = ''.join(f'<line x1="{tx:.1f}" y1="0" x2="{tx:.1f}" y2="40" stroke="{P["thr"]}" stroke-width="1.2"/>' for tx in (x + 18, x + w - 18))
    return f'{threads}<g filter="url(#ps{i})" transform="rotate(-2 {cx:.1f} 54)"><rect x="{x}" y="38" width="{w:.1f}" height="32" fill="{P["tag"]}"/>{outline(TAG_TEXT, cx, 59, 15, "Bold", "middle", P["ink"])}</g>'

AURORA = [(300, 790, 70, 14, 0.0, 58, 'aug'), (380, 800, 92, 10, 1.9, 40, 'auc'), (430, 760, 52, 12, 3.6, 34, 'auv'), (520, 800, 110, 8, 0.8, 30, 'aug')]
def aurora(i, curtains=AURORA, k=1):
    """soft curtains: a tall faint band plus a thin bright hem, both blurred"""
    out = ''
    for x0, x1, yc, amp, ph, H, g in curtains:
        top, hem, bot = [], [], []
        for n in range(41):
            t = n / 40; x = x0 + (x1 - x0) * t
            y = yc + amp * math.sin(2 * math.pi * 1.2 * t + ph)
            h = H * math.sin(math.pi * t) ** .8
            top.append((x, y - h)); hem.append((x, y - h * .22)); bot.append((x, y + 3 * math.sin(math.pi * t)))
        band = lambda up: 'M' + 'L'.join(f'{a:.1f} {b:.1f}' for a, b in up + bot[::-1]) + 'Z'
        out += f'<path fill="url(#{g}{i})" filter="url(#aub{i})" opacity="{.55 * k:.2f}" d="{band(top)}"/><path fill="url(#{g}{i})" filter="url(#auh{i})" opacity="{.8 * k:.2f}" d="{band(hem)}"/>'
    return f'<g>{out}</g>'

def aurora_defs(i):
    grad = lambda gid, c: f'<linearGradient id="{gid}{i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{c}" stop-opacity="0"/><stop offset=".8" stop-color="{c}" stop-opacity=".9"/><stop offset="1" stop-color="{c}" stop-opacity=".4"/></linearGradient>'
    return (grad('aug', '#5ff2c8') + grad('auc', '#7dd8ff') + grad('auv', '#b48cff')
            + f'<filter id="aub{i}" x="-10%" y="-60%" width="120%" height="220%"><feGaussianBlur stdDeviation="9"/></filter>'
            + f'<filter id="auh{i}" x="-10%" y="-60%" width="120%" height="220%"><feGaussianBlur stdDeviation="3.5"/></filter>')

def fire(P, night, f, fx, fy, i):
    glow = f'<ellipse cx="{fx}" cy="{fy-10}" rx="{140 if night else 60}" ry="{110 if night else 40}" fill="url(#glow{i})"/>'
    shade = f'<ellipse cx="{fx}" cy="{fy+7}" rx="38" ry="7" fill="#000" opacity="{.35 if night else .14}"/>'
    stones = [(-28, 1, 8, 4.5), (-17, 7, 9, 5), (-3, 10, 8, 4.5), (11, 9, 9, 5), (24, 4, 8, 4.5)]
    back = ''.join(stone(fx + dx, fy + dy, rx, ry, P, f) for dx, dy, rx, ry in stones if dy < 5)
    front = ''.join(stone(fx + dx, fy + dy, rx, ry, P, f) for dx, dy, rx, ry in stones if dy >= 5)
    log = lambda ang, c, end: f'<g transform="translate({fx} {fy-2}) rotate({ang})"><rect x="-24" y="-4" width="48" height="8" rx="4" fill="{c}"/><ellipse cx="{end}" cy="0" rx="3" ry="4" fill="#d9b48a"/></g>'
    logs = f'<g filter="url(#{f})">{log(-16, "#6b4630", 22)}{log(16, "#7c5236", -22)}</g>'
    big = (f'<path fill="#e2552c" d="M{fx-16} {fy-6}q-2-22 10-34q-2 14 8 18q2-16 12-24q-4 22 4 30q2 8-6 10z"/><path fill="#f29c38" d="M{fx-9} {fy-6}q0-14 8-22q0 10 6 12q2-8 8-12q-2 14 0 20q0 4-4 4z"/><path fill="#fbe0a0" d="M{fx-3} {fy-6}q0-8 5-12q1 6 4 6q0 4-1 6z"/>')
    if night:
        flames = f'<g filter="url(#{f})">{big}</g>' + ''.join(f'<circle cx="{fx+dx}" cy="{fy+dy}" r="1.4" fill="#fbd27a"/>' for dx, dy in [(-6, -48), (8, -58), (-2, -66), (12, -44)])
    else:
        smoke = f'<path d="M{fx+2} {fy-26}c-8-12 8-20 0-32s8-18 2-30" stroke="#fffaf0" stroke-width="5" fill="none" stroke-linecap="round" opacity=".6"/>'
        flames = smoke + f'<g filter="url(#{f})" transform="translate({fx} {fy-6}) scale(.6) translate({-fx} {-(fy-6)})">{big}</g>'
    return glow, shade + back + logs + flames + front

def seat(x, y, f):
    return (f'<g filter="url(#{f})"><rect x="{x-26}" y="{y-14}" width="52" height="14" rx="7" fill="#7c5236"/>'
            f'<path d="M{x-20} {y-9}h30M{x-14} {y-4}h26" stroke="#6b4630" stroke-width="1.6" stroke-linecap="round"/>'
            f'<ellipse cx="{x+26}" cy="{y-7}" rx="5" ry="7" fill="#d9b48a"/><ellipse cx="{x+26}" cy="{y-7}" rx="2.4" ry="3.6" fill="none" stroke="#a87b52" stroke-width="1.2"/></g>')

def shadow(x, y, rx, night):
    return f'<ellipse cx="{x}" cy="{y}" rx="{rx}" ry="{rx*.12:.1f}" fill="#000" opacity="{.35 if night else .14}"/>'

def boulder(P, f):
    return (f'<path fill="{P["rock"]}" filter="url(#{f})" d="M600 300C596 276 616 256 650 252C690 246 720 262 730 280L736 300Z"/>'
            f'<path fill="{P["hl"]}" opacity=".35" d="M612 280C618 264 634 256 652 255L646 276Z"/>'
            f'<path fill="{P["grass"]}" d="M628 256q22-12 50-5q-8 7-18 5q-10 5-20 1q-6 3-12-1z"/>'
            f'<path d="M672 262l18 10M662 282l12 8" stroke="{P["gr2"]}" stroke-width="2" fill="none" opacity=".5"/>')

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
{bush(356, 226, 1.1, P, f)}{shadow(474, 218, 50, night)}{rex(P, i, GOLD_R, 66)}{ferns}
{stone(640, 240, 14, 7, P, f)}{stone(664, 244, 9, 5, P, f)}
{mush(200, 240, 1, P, f)}{mush(214, 244, .7, P, f)}{mush(770, 248, .9, P, f)}
<path fill="{P['gr2']}" filter="url(#{f})" d="M0 254C120 244 260 256 400 250S640 244 800 254V300H0Z"/>{tufts}
{boulder(P, f)}
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
{shadow(474, 248, 50, night)}{rex(P, i, GOLD_R, 96)}{shadow(186, 264, 30, night)}{seat(186, 262, f)}{camp}
{fern(96, 262, 40, P['fern'], f)}{fern(760, 264, 40, P['fern2'], f)}
{mush(340, 262, 1, P, f)}{mush(354, 266, .7, P, f)}{mush(640, 280, .9, P, f)}
<path fill="{P['gr2']}" filter="url(#{f})" d="M0 270C140 262 260 272 400 268S640 262 800 270V300H0Z"/>{path}{tufts}
{tallL}{tallR}{bush(110, 292, 1.3, P, f)}{bush(720, 294, 1.2, P, f)}{tag(i, P)}
<rect width="800" height="300" filter="url(#gr{i})"/>'''
    return svg(f"paper-cut clearing, {'night under a soft aurora' if night else 'morning'}: tall pines on both sides, a campfire on the left, a paper t-rex on the right looking at it", body)

# ---------- master: the settled scene ----------
WOOD = dict(day=dict(wall='#a86d42', log='#7c5236', end='#d9b48a', roof='#5b4636', roof2='#48382c', door='#5a3c28', win='#cfe0f0', metal='#8a8f98', rope='#6b5a48'),
            night=dict(wall='#5e4235', log='#44302a', end='#8a6a50', roof='#33282a', roof2='#271f22', door='#2e211c', win='#ffd27a', metal='#5a5f6c', rope='#9aa1b4'))

def star5(x, y, r, fill, f=None, rot=-8):
    pts = []
    for k in range(10):
        a = math.radians(rot - 90 + k * 36); rr = r if k % 2 == 0 else r * .45
        pts.append(f'{x + rr * math.cos(a):.1f} {y + rr * math.sin(a):.1f}')
    flt = f' filter="url(#{f})"' if f else ''
    return f'<path fill="{fill}"{flt} d="M{"L".join(pts)}Z"/>'

def hanging_stars(P, f, at):
    return ''.join(f'<line x1="{x}" y1="0" x2="{x}" y2="{y-r*.8:.1f}" stroke="{P["thr"]}" stroke-width="1" opacity=".7"/>{star5(x, y, r, "#f2c14e", f)}' for x, y, r in at)

def comet(i, x, y):
    return (f'<path fill="url(#cmt{i})" d="M{x} {y-2.2}L{x-78} {y-26}L{x-80} {y-23}L{x} {y+2.2}Z"/>'
            f'<circle cx="{x}" cy="{y}" r="6" fill="#fff6c8" opacity=".25"/>{star5(x, y, 5, "#fff6c8", rot=10)}')

def comet_defs(i):
    return f'<radialGradient id="ff{i}"><stop offset="0" stop-color="#f7f3a0" stop-opacity=".55"/><stop offset="1" stop-color="#f7f3a0" stop-opacity="0"/></radialGradient><linearGradient id="cmt{i}" x1="1" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#fff6c8" stop-opacity=".85"/><stop offset="1" stop-color="#fff6c8" stop-opacity="0"/></linearGradient>'

def fireflies(i, at):
    return ''.join(f'<circle cx="{x}" cy="{y}" r="7" fill="url(#ff{i})"/><circle cx="{x}" cy="{y}" r="1.5" fill="#fbf7c8"/>' for x, y in at)

def cabin(cx, base, W, night, f, i):
    w, h = 88, 44; x0 = cx - w / 2; top = base - h
    logs = ''.join(f'<line x1="{x0}" y1="{top + k * h / 6:.1f}" x2="{x0 + w}" y2="{top + k * h / 6:.1f}" stroke="{W["log"]}" stroke-width="1.6"/>' for k in range(1, 6))
    ends = ''.join(f'<circle cx="{sx}" cy="{top + (k + .5) * h / 6:.1f}" r="2.6" fill="{W["end"]}"/>' for k in range(6) for sx in (x0 - 1, x0 + w + 1))
    win = f'<rect x="{x0 + w - 36}" y="{top + 11}" width="22" height="16" fill="{W["win"]}"/><path d="M{x0 + w - 25} {top + 11}v16M{x0 + w - 36} {top + 19}h22" stroke="{W["log"]}" stroke-width="2"/>'
    glow = f'<ellipse cx="{x0 + w - 25}" cy="{top + 19}" rx="34" ry="26" fill="url(#glow{i})"/>' if night else ''
    chimney = f'<rect x="{x0 + w - 28}" y="{top - 34}" width="11" height="26" fill="{W["roof2"]}"/><rect x="{x0 + w - 30}" y="{top - 36}" width="15" height="4" fill="{W["roof"]}"/>'
    smoke = f'<path d="M{x0 + w - 22} {top - 40}c-8-10 6-16 0-26s6-14 2-24" stroke="{"#fffaf0" if not night else "#9aa1b4"}" stroke-width="4" fill="none" stroke-linecap="round" opacity="{.55 if not night else .25}"/>'
    lantern = (f'<line x1="{x0 + 34}" y1="{top + 4}" x2="{x0 + 34}" y2="{top + 10}" stroke="{W["metal"]}" stroke-width="1.2"/>'
               f'<rect x="{x0 + 31}" y="{top + 10}" width="6" height="8" rx="1.5" fill="{"#ffd27a" if night else W["metal"]}"/>'
               + (f'<circle cx="{x0 + 34}" cy="{top + 14}" r="10" fill="#ffd27a" opacity=".22"/>' if night else ''))
    return (f'{smoke}<g filter="url(#{f})">{chimney}<rect x="{x0}" y="{top}" width="{w}" height="{h}" fill="{W["wall"]}"/>{logs}{ends}'
            f'<rect x="{x0 + 12}" y="{top + 16}" width="16" height="{h - 16}" fill="{W["door"]}"/><circle cx="{x0 + 25}" cy="{top + 31}" r="1.3" fill="{W["end"]}"/>{win}'
            f'<path fill="{W["roof"]}" d="M{x0 - 12} {top + 2}L{cx} {top - 32}L{x0 + w + 12} {top + 2}Z"/><path fill="{W["roof2"]}" d="M{x0 - 12} {top + 2}L{x0 + w + 12} {top + 2}L{x0 + w + 8} {top + 6}L{x0 - 8} {top + 6}Z"/></g>{lantern}{glow}')

def barrel(x, base, W, f, s=1):
    w, h = 16 * s, 22 * s
    return (f'<g filter="url(#{f})"><path fill="{W["wall"]}" d="M{x - w / 2} {base}q-3 {-h / 2} 0 {-h}h{w}q3 {h / 2} 0 {h}z"/>'
            f'<ellipse cx="{x}" cy="{base - h}" rx="{w / 2}" ry="{2.6 * s}" fill="{W["end"]}"/>'
            + ''.join(f'<path d="M{x - w / 2 - 1.2} {base - h * t:.1f}h{w + 2.4}" stroke="{W["metal"]}" stroke-width="1.8"/>' for t in (.22, .78)) + '</g>')

def bucket(x, base, W, f):
    return (f'<g filter="url(#{f})"><path fill="{W["metal"]}" d="M{x - 6} {base - 10}h12l-2 10h-8z"/><ellipse cx="{x}" cy="{base - 10}" rx="6" ry="1.6" fill="{W["door"]}"/></g>'
            f'<path d="M{x - 6} {base - 10}q6-9 12 0" stroke="{W["metal"]}" stroke-width="1.2" fill="none"/>')

def well(x, base, P, W, f):
    stones = ''.join(f'<path d="M{x - 18} {base - k}h36" stroke="{P["hl"]}" stroke-width="1" opacity=".5"/>' for k in (6, 12))
    return (f'<g filter="url(#{f})"><rect x="{x - 16}" y="{base - 52}" width="3.5" height="36" fill="{W["log"]}"/><rect x="{x + 12.5}" y="{base - 52}" width="3.5" height="36" fill="{W["log"]}"/>'
            f'<path fill="{W["roof"]}" d="M{x - 24} {base - 48}L{x} {base - 64}L{x + 24} {base - 48}Z"/>'
            f'<line x1="{x}" y1="{base - 46}" x2="{x}" y2="{base - 30}" stroke="{W["rope"]}" stroke-width="1"/><path fill="{W["metal"]}" d="M{x - 4} {base - 30}h8l-1.5 6h-5z"/>'
            f'<rect x="{x - 18}" y="{base - 18}" width="36" height="18" rx="2" fill="{P["rock"]}"/>{stones}<ellipse cx="{x}" cy="{base - 18}" rx="18" ry="3.2" fill="{P["gr2"]}"/></g>')

def stump_axe(x, base, W, f):
    return (f'<g filter="url(#{f})"><path fill="{W["log"]}" d="M{x - 11} {base}v-12h22v12z"/><ellipse cx="{x}" cy="{base - 12}" rx="11" ry="3.4" fill="{W["end"]}"/>'
            f'<path d="M{x + 2} {base - 14}l10-18" stroke="{W["door"]}" stroke-width="2.6" stroke-linecap="round"/><path fill="{W["metal"]}" d="M{x} {base - 17}l6-4 3 6-7 1z"/></g>')

def plate_master(night, i):
    P = NIGHT if night else DAY; W = WOOD['night' if night else 'day']; f = f'ps{i}'
    if night:
        P = dict(P, dot='#9ff5e6')
        sky = (stars() + aurora(i, [(330, 590, 64, 7, .6, 24, 'aug'), (380, 610, 76, 5, 2.2, 16, 'auc')], .7)
               + hanging_stars(P, f, [(318, 92, 7), (452, 60, 10), (540, 36, 6), (736, 34, 7)]) + comet(i, 404, 30))
        extra = aurora_defs(i) + comet_defs(i)
    else:
        sky = clouds(P, f, [(330, 110), (470, 50), (560, 140)])
        extra = ''
    sun_x = 662
    tallL = pine(46, 250, 200, P['pine2'], P['pineS'], f, 6) + pine(-8, 256, 170, P['pine2'], P['pineS'], f, 5)
    tallR = pine(772, 250, 210, P['pine2'], P['pineS'], f, 6) + pine(810, 254, 170, P['pine'], P['pineS'], f, 5)
    grove = ''.join(pine(x, base, H, P['pine'], P['pineS'], f) for x, base, H in [(120, 232, 110), (296, 230, 96), (160, 226, 70), (262, 224, 64)])
    fx, fy = 362, 262
    glow, camp = fire(P, night, f, fx, fy, i)
    path = ''.join(stone(x, y, rx, ry, P, f) for x, y, rx, ry in [(474, 296, 22, 7), (440, 285, 18, 6), (412, 276, 14, 5)])
    tufts = ''.join(tuft(x, y, s, P['grass']) for x, y, s in [(180, 262, 1.1), (560, 272, 1), (620, 266, 1), (660, 278, 1.2), (520, 288, .9), (140, 286, 1.3), (700, 290, 1), (250, 276, 1)])
    flies = fireflies(i, [(92, 214), (236, 196), (330, 214), (470, 236), (716, 222), (686, 270), (414, 250), (560, 196), (150, 270)]) if night else ''
    body = f'''{defs(i, night, P, extra)}<rect width="800" height="300" fill="url(#sk{i})"/>{sky}{orb(P, night, f, sun_x, 72)}{ridges(P, f)}
<path fill="{P['gr']}" filter="url(#{f})" d="M0 236C150 226 300 232 450 228S680 230 800 226V300H0Z"/>{grove}
{cabin(212, 240, W, night, f, i)}{barrel(276, 246, W, f)}{barrel(292, 250, W, f, .85)}{bucket(306, 252, W, f)}{stump_axe(140, 252, W, f)}
<path fill="{P['gr2']}" filter="url(#{f})" d="M0 270C140 262 260 272 400 268S640 262 800 270V300H0Z"/>{glow}{well(448, 252, P, W, f)}{bush(520, 246, .9, P, f)}
{shadow(578, 248, 50, night)}{rex(P, i, 600, 96)}{shadow(308, 280, 26, night)}{seat(308, 278, f)}{camp}
{fern(96, 262, 40, P['fern'], f)}{fern(740, 264, 40, P['fern2'], f)}
{mush(530, 272, 1, P, f)}{mush(544, 276, .7, P, f)}{mush(660, 282, .9, P, f)}{mush(236, 270, .8, P, f)}
{path}{tufts}
{tallL}{tallR}{bush(110, 292, 1.3, P, f)}{bush(724, 294, 1.2, P, f)}{flies}{tag(i, P)}
<rect width="800" height="300" filter="url(#gr{i})"/>'''
    return svg(f"paper-cut forest camp, {'night: moon, hanging stars, a comet, fireflies and a faint aurora' if night else 'day: sun and clouds'}; a log cabin among pines, barrels, a bucket, a well and a campfire on the left; a paper t-rex on the right looking left at the camp", body)

# ---------- grove: the master, forked ----------
WOOD2 = dict(day=dict(WOOD['day'], wall='#b5764a', log='#8a5634', end='#e3c08f', roof='#7a3f2c', roof2='#5e2f22', trim='#efe2c4', shutter='#5d7a4c', flower='#c43a3a'),
             night=dict(WOOD['night'], roof='#4a2a24', roof2='#361e1a', trim='#8f8778', shutter='#264038', flower='#b0435a'))

def sunburst(x, y, P, f):
    n = 24
    pts = ' '.join(f'{x + (40 if k % 2 == 0 else 31) * math.cos(math.pi * k / n):.1f},{y + (40 if k % 2 == 0 else 31) * math.sin(math.pi * k / n):.1f}' for k in range(2 * n))
    return (f'<line x1="{x}" y1="0" x2="{x}" y2="{y - 36}" stroke="{P["thr"]}" stroke-width="1.2"/>'
            f'<polygon points="{pts}" fill="#e8742c" filter="url(#{f})"/><circle cx="{x}" cy="{y}" r="29" fill="#f29c38"/>'
            f'<circle cx="{x}" cy="{y}" r="22" fill="#f6b862"/><circle cx="{x - 6}" cy="{y - 7}" r="9" fill="#fbd49a" opacity=".75"/>')

def cabin2(cx, base, P, W, night, f, i):
    w, h = 92, 44; x0 = cx - w / 2; top = base - 6 - h; wb = base - 6
    logs = ''.join(f'<line x1="{x0}" y1="{top + k * h / 6:.1f}" x2="{x0 + w}" y2="{top + k * h / 6:.1f}" stroke="{W["log"]}" stroke-width="1.6"/>' for k in range(1, 6))
    ends = ''.join(f'<circle cx="{sx}" cy="{top + (k + .5) * h / 6:.1f}" r="2.6" fill="{W["end"]}"/>' for k in range(6) for sx in (x0 - 1, x0 + w + 1))
    found = f'<rect x="{x0 - 4}" y="{wb}" width="{w + 8}" height="6" fill="{P["rock"]}"/>' + ''.join(f'<path d="M{x0 - 4 + k * 14} {wb}v6" stroke="{P["hl"]}" stroke-width="1" opacity=".6"/>' for k in range(1, 7))
    wx, wy = x0 + w - 38, top + 12
    window = (f'<rect x="{wx - 7}" y="{wy}" width="6" height="16" fill="{W["shutter"]}"/><rect x="{wx + 23}" y="{wy}" width="6" height="16" fill="{W["shutter"]}"/>'
              f'<rect x="{wx - 1}" y="{wy - 1}" width="24" height="18" fill="{W["trim"]}"/><rect x="{wx + 1}" y="{wy + 1}" width="20" height="14" fill="{W["win"]}"/>'
              f'<path d="M{wx + 11} {wy + 1}v14M{wx + 1} {wy + 8}h20" stroke="{W["trim"]}" stroke-width="2"/>'
              f'<rect x="{wx - 2}" y="{wy + 18}" width="26" height="5" fill="{W["log"]}"/>'
              + ''.join(f'<circle cx="{wx + dx}" cy="{wy + 17}" r="2.4" fill="{W["flower"] if k % 2 == 0 else "#f2c14e"}"/>' for k, dx in enumerate((2, 8, 14, 20))))
    dx0 = x0 + 12
    door = (f'<rect x="{dx0 - 2}" y="{top + 14}" width="20" height="{wb - top - 14}" fill="{W["trim"]}"/><rect x="{dx0}" y="{top + 16}" width="16" height="{wb - top - 16}" fill="{W["door"]}"/>'
            f'<path d="M{dx0 + 8} {top + 16}v{wb - top - 16}" stroke="{W["log"]}" stroke-width="1"/><circle cx="{dx0 + 13}" cy="{top + 31}" r="1.3" fill="{W["end"]}"/>'
            f'<rect x="{dx0 - 4}" y="{base - 3}" width="24" height="3" fill="{P["hl"]}"/>')
    apex = top - 34; eave = top + 2; L, R = x0 - 12, x0 + w + 12
    shingles = ''.join(f'<path d="M{L + (cx - L) * t:.1f} {eave - (eave - apex) * t:.1f}H{R - (R - cx) * t:.1f}" stroke="{W["roof2"]}" stroke-width="1.4"/>' for t in (.22, .44, .66))
    roof = (f'<path fill="{W["roof"]}" d="M{L} {eave}L{cx} {apex}L{R} {eave}Z"/>{shingles}'
            f'<path d="M{L - 2} {eave + 1}L{cx} {apex - 2}L{R + 2} {eave + 1}" stroke="{W["trim"]}" stroke-width="2.4" fill="none" stroke-linejoin="round"/>')
    chimney = (f'<rect x="{x0 + w - 28}" y="{top - 36}" width="12" height="28" fill="{P["rock"]}"/><path d="M{x0 + w - 28} {top - 28}h12M{x0 + w - 28} {top - 20}h12" stroke="{P["hl"]}" stroke-width="1" opacity=".6"/>'
               f'<rect x="{x0 + w - 30}" y="{top - 38}" width="16" height="4" fill="{P["gr2"]}"/>')
    smoke = f'<path d="M{x0 + w - 22} {top - 42}c-8-10 6-16 0-26s6-14 2-24" stroke="{"#fffaf0" if not night else "#9aa1b4"}" stroke-width="4" fill="none" stroke-linecap="round" opacity="{.55 if not night else .25}"/>'
    lx = x0 + 36
    lantern = (f'<path d="M{lx} {top + 4}h-4" stroke="{W["metal"]}" stroke-width="1.4"/><line x1="{lx - 4}" y1="{top + 4}" x2="{lx - 4}" y2="{top + 9}" stroke="{W["metal"]}" stroke-width="1.2"/>'
               f'<rect x="{lx - 7}" y="{top + 9}" width="6" height="8" rx="1.5" fill="{"#ffd27a" if night else W["metal"]}"/>'
               + (f'<circle cx="{lx - 4}" cy="{top + 13}" r="10" fill="#ffd27a" opacity=".22"/>' if night else ''))
    glow = f'<ellipse cx="{wx + 11}" cy="{wy + 8}" rx="36" ry="26" fill="url(#glow{i})"/>' if night else ''
    return (f'{smoke}<g filter="url(#{f})">{chimney}<rect x="{x0}" y="{top}" width="{w}" height="{h}" fill="{W["wall"]}"/>{logs}{ends}{found}{door}{window}{roof}</g>{lantern}{glow}')

def river(night, i):
    p0, p1, p2, p3 = (632, 206), (712, 224), (596, 252), (722, 300)
    pts = []
    for n in range(31):
        t = n / 30; u = 1 - t
        x = u**3 * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t**3 * p3[0]
        y = u**3 * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t**3 * p3[1]
        pts.append((x, y, 2 + 64 * t ** 1.5, t))
    shape = lambda dx, dy: 'M' + 'L'.join(f'{x - w / 2 + dx:.1f} {y + dy:.1f}' for x, y, w, _ in pts) + 'L' + 'L'.join(f'{x + w / 2 + dx:.1f} {y + dy:.1f}' for x, y, w, _ in pts[::-1]) + 'Z'
    deep, water, glint = ('#212c55', '#34457a', '#cfd6f0') if night else ('#6a9aa8', '#8fc1cc', '#f4fbfb')
    glints = ''.join(f'<path d="M{x - w * (.18 if k % 2 else -.05):.1f} {y:.1f}h{max(3, w * .16):.1f}" stroke="{glint}" stroke-width="1.6" stroke-linecap="round" opacity="{.5 if night else .8}"/>'
                     for k, (x, y, w, t) in enumerate(pts) if t > .25 and k % 3 == 0)
    return f'<path fill="{deep}" d="{shape(0, 0)}"/><path fill="{water}" d="{shape(2, 3)}"/>{glints}'

def wizard_tower(cx, base, night, i=''):
    stone, shade, roof, roof2, line = ('#48507a', '#3a4168', '#5a4a86', '#473a70', '#5c6590') if night else ('#d4bd98', '#bea27c', '#9677b0', '#7d5f98', '#b39a74')
    win = '#ffd27a' if night else '#6b5a8a'
    body = f'<path fill="{stone}" d="M{cx-9} {base}L{cx-7} {base-44}H{cx+7}L{cx+9} {base}Z"/><path fill="{shade}" d="M{cx+1} {base}V{base-44}H{cx+7}L{cx+9} {base}Z"/>'
    lines = ''.join(f'<path d="M{cx-7.5} {base-k}h{15 if k % 2 else 9}" stroke="{line}" stroke-width=".9"/>' for k in (8, 17, 26, 35))
    turret = (f'<path fill="{stone}" d="M{cx+8} {base-18}h7v-12h-7z"/><path fill="{roof2}" d="M{cx+7} {base-30}L{cx+11.5} {base-42}L{cx+16} {base-30}Z"/>')
    ledge = f'<rect x="{cx-10}" y="{base-46}" width="20" height="3" rx="1" fill="{shade}"/>'
    cone = f'<path fill="{roof}" d="M{cx-12} {base-45}Q{cx-3} {base-58} {cx} {base-76}Q{cx+3} {base-58} {cx+12} {base-45}Z"/><path fill="{roof2}" d="M{cx} {base-76}Q{cx+3} {base-58} {cx+12} {base-45}H{cx+2}Z"/>'
    flag = f'<path d="M{cx} {base-76}v-8" stroke="{shade}" stroke-width="1"/><path fill="#c0573a" d="M{cx} {base-84}l7 2-7 2.5z"/>'
    window = f'<path fill="{win}" d="M{cx-2.5} {base-33}v-4a2.5 2.5 0 0 1 5 0v4z"/><rect x="{cx-2}" y="{base-14}" width="4" height="5" rx="1" fill="{win}"/>'
    glow = (f'<circle cx="{cx}" cy="{base-35}" r="12" fill="url(#ff{i})"/>'
            + ''.join(f'<path fill="#cfd6f0" d="M{x} {y-3}l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/>' for x, y in [(cx-18, base-66), (cx+17, base-72), (cx+22, base-54)])) if night else ''
    return f'<g>{turret}{body}{lines}{ledge}{cone}{flag}{window}{glow}</g>'

def meadow(P, f, night=False, i=''):
    far = ''.join(pine(x, 172, 34, P['r2'], P['r2'], f, 3) for x in range(12, 800, 46))
    return (f'<path fill="{P["r0"]}" filter="url(#{f})" d="M0 150L90 120L170 134L260 104L340 130L430 110L520 128L600 112L700 132L800 118V300H0Z"/>{far}{wizard_tower(408, 146, night, i)}'
            f'<path fill="{P["r1"]}" filter="url(#{f})" d="M0 170L70 138L130 156L210 118L300 162L380 132L470 166L560 128L660 164L740 142L800 152V300H0Z"/>'
            f'<path fill="{P["meadow"]}" filter="url(#{f})" d="M0 196C60 178 110 184 170 170S280 160 340 178S460 168 540 184S680 166 800 180V300H0Z"/>'
            f'<path fill="{P["meadow2"]}" opacity=".6" d="M0 206C90 194 160 198 250 190S420 196 520 200S700 186 800 196V214C680 206 560 216 440 210S200 214 0 222Z"/>')

def river_bg(night):
    p0, p1, p2, p3 = (452, 180), (506, 190), (396, 206), (452, 238)
    pts = []
    for n in range(25):
        t = n / 24; u = 1 - t
        pts.append((u**3 * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t**3 * p3[0],
                    u**3 * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t**3 * p3[1], 2 + 30 * t ** 1.4, t))
    shape = lambda dx, dy: 'M' + 'L'.join(f'{x - w / 2 + dx:.1f} {y + dy:.1f}' for x, y, w, _ in pts) + 'L' + 'L'.join(f'{x + w / 2 + dx:.1f} {y + dy:.1f}' for x, y, w, _ in pts[::-1]) + 'Z'
    deep, water, glint = ('#34457a', '#4a5f96', '#cfd6f0') if night else ('#7aaab4', '#9cc7cf', '#f4fbfb')
    glints = ''.join(f'<path d="M{x - w * .15:.1f} {y:.1f}h{max(2.5, w * .2):.1f}" stroke="{glint}" stroke-width="1.3" stroke-linecap="round" opacity="{.5 if night else .8}"/>'
                     for k, (x, y, w, t) in enumerate(pts) if t > .3 and k % 3 == 0)
    return f'<path fill="{deep}" d="{shape(0, 0)}"/><path fill="{water}" d="{shape(1.5, 2)}"/>{glints}'

def plate_grove(night, i):
    P = dict(NIGHT, rexHi='#8e4a43', meadow='#34506a', meadow2='#3d5a78') if night else dict(DAY, rexHi='#d77552', meadow='#a9c07e', meadow2='#bdd096')
    W = WOOD2['night' if night else 'day']; f = f'ps{i}'
    if night:
        P = dict(P, dot='#9ff5e6')
        sky = (''.join(f'<circle cx="{x}" cy="{y}" r="{r}" fill="#f4efdc"/>' for x, y, r in STARS if (x, y) != (70, 40))
               + hanging_stars(P, f, [(318, 92, 7), (452, 60, 10), (540, 36, 6), (736, 34, 7)]) + comet(i, 404, 30))
        extra = comet_defs(i)
        sun = orb(P, night, f, 662, 72)
    else:
        sky = clouds(P, f, [(318, 76), (478, 44)])
        extra = ''
        sun = sunburst(662, 72, P, f)
    tallL = pine(46, 250, 148, P['pine2'], P['pineS'], f, 6) + pine(-8, 256, 170, P['pine2'], P['pineS'], f, 5) + pine(118, 262, 140, P['pine'], P['pineS'], f, 5)
    tallR = pine(772, 250, 210, P['pine2'], P['pineS'], f, 6) + pine(810, 254, 170, P['pine'], P['pineS'], f, 5)
    grove = ''.join(pine(x, base, H, P['pine'], P['pineS'], f) for x, base, H in [(20, 238, 120), (78, 234, 128), (140, 230, 96), (170, 226, 70), (262, 224, 64), (298, 230, 96), (334, 226, 60), (644, 226, 70), (694, 230, 104)])
    fx, fy = 362, 262
    glow, camp = fire(P, night, f, fx, fy, i)
    path = ''.join(stone(x, y, rx, ry, P, f) for x, y, rx, ry in [(488, 295, 20, 6.5), (456, 287, 17, 5.6), (430, 281, 14, 4.8), (409, 276, 11.5, 4)])
    ferns = ''.join(fern(x, y, h, P['fern' if k % 2 else 'fern2'], f) for k, (x, y, h) in enumerate([(30, 272, 36), (96, 262, 40), (640, 262, 28), (612, 292, 40), (782, 276, 44)]))
    tufts = ''.join(tuft(x, y, s, P['grass']) for x, y, s in [(180, 262, 1.1), (560, 272, 1), (620, 266, 1), (660, 290, 1.2), (520, 288, .9), (140, 286, 1.3), (250, 276, 1), (330, 290, 1), (600, 296, .9), (760, 296, 1)])
    flies = fireflies(i, [(92, 214), (236, 196), (330, 214), (470, 236), (716, 222), (686, 262), (414, 250), (560, 196), (150, 270), (760, 250)]) if night else ''
    body = f'''{defs(i, night, P, extra)}<rect width="800" height="300" fill="url(#sk{i})"/>{sky}{sun}{meadow(P, f, night, i)}{river_bg(night)}
<path fill="{P['gr']}" filter="url(#{f})" d="M0 236C150 226 300 232 450 228S680 230 800 226V300H0Z"/>{grove}
{cabin2(212, 246, P, W, night, f, i)}{barrel(276, 246, W, f)}{barrel(292, 250, W, f, .85)}{bucket(306, 252, W, f)}{stump_axe(160, 262, W, f)}
<path fill="{P['gr2']}" filter="url(#{f})" d="M0 270C140 262 260 272 400 268S640 262 800 270V300H0Z"/>{glow}{bush(520, 246, .9, P, f)}
{shadow(578, 248, 50, night)}{rex(P, i, 600, 96, detail=True)}{shadow(282, 276, 26, night)}{seat(282, 274, f)}{camp}
{well(700, 272, P, W, f)}{ferns}{mush(536, 280, 1, P, f)}{mush(550, 284, .7, P, f)}{mush(700, 290, .9, P, f)}{mush(244, 282, .8, P, f)}
{path}{tufts}
{tallL}{tallR}{bush(96, 292, 1.3, P, f)}{bush(790, 298, 1.1, P, f)}{flies}{tag(i, P)}
<rect width="800" height="300" filter="url(#gr{i})"/>'''
    return svg(f"paper-cut grove, {'night: moon, hanging stars, a comet, fireflies and a faint aurora' if night else 'day: a paper sunburst and clouds'}; a log cabin among pines, barrels, a bucket, a well and a campfire on the left, a river winding through the meadow behind; a paper t-rex looking left at the camp", body)

SCENES = {'diorama': plate1, 'campfire': plate2, 'master': plate_master, 'grove': plate_grove}

if __name__ == '__main__':
    for name, draw in SCENES.items():
        for mode, night in (('day', False), ('night', True)):
            p = HERE / f'hero-{name}-{mode}.svg'
            p.write_text(draw(night, ''))
            print(f'{p.name:26} {p.stat().st_size / 1024:6.1f} KB')
