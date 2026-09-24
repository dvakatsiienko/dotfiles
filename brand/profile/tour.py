"""The visit-tour tiles: the bytes jar and the frame takes, one svg per theme, one light source (top left)."""

W, H = 240, 180
PAPER = ('#f3f1ec', '#e4e0d8')
NIGHT = '#141a2e'


def defs(p, k):
    light = k == 'light'
    return f'''<defs>
<linearGradient id="{p}brass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f8e3a0"/><stop offset=".4" stop-color="#d4a543"/><stop offset=".75" stop-color="#a67a2a"/><stop offset="1" stop-color="#6e4f18"/></linearGradient>
<linearGradient id="{p}brassv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f8e3a0"/><stop offset=".5" stop-color="#c9973a"/><stop offset="1" stop-color="#7a5a1e"/></linearGradient>
<linearGradient id="{p}steel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4f6f8"/><stop offset=".6" stop-color="#b9c3cc"/><stop offset="1" stop-color="#7e8a96"/></linearGradient>
<radialGradient id="{p}dish" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#cfd7de"/><stop offset="1" stop-color="#8b97a3"/></radialGradient>
<linearGradient id="{p}glass" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffffff" stop-opacity="{.55 if light else .22}"/><stop offset=".35" stop-color="#bfe3f0" stop-opacity="{.16 if light else .08}"/><stop offset="1" stop-color="#7fb4d6" stop-opacity="{.35 if light else .2}"/></linearGradient>
<radialGradient id="{p}warm" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffcf6a" stop-opacity="{.35 if light else .6}"/><stop offset="1" stop-color="#ffcf6a" stop-opacity="0"/></radialGradient>
<radialGradient id="{p}fly" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffe7a3" stop-opacity=".95"/><stop offset=".35" stop-color="#ffd58a" stop-opacity=".45"/><stop offset="1" stop-color="#ffd58a" stop-opacity="0"/></radialGradient>
<radialGradient id="{p}flame" cx=".5" cy=".7" r=".6"><stop offset="0" stop-color="#fffbe6"/><stop offset=".4" stop-color="#ffd24a"/><stop offset="1" stop-color="#ff7a1a"/></radialGradient>
<radialGradient id="{p}magic" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="{'#8f78d6' if light else '#cbb8ff'}" stop-opacity="{.35 if light else .55}"/><stop offset="1" stop-color="#cbb8ff" stop-opacity="0"/></radialGradient>
<linearGradient id="{p}candle" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fffaf0"/><stop offset=".6" stop-color="#f1e4c8"/><stop offset="1" stop-color="#cdb98f"/></linearGradient>
<linearGradient id="{p}paper" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{PAPER[0]}"/><stop offset="1" stop-color="{PAPER[1]}"/></linearGradient>
<filter id="{p}sh" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#2b2622" flood-opacity=".2"/></filter>
</defs>'''


def ground(p, k):
    if k == 'light':
        return f'<rect x="6" y="5" width="{W - 12}" height="{H - 14}" rx="14" fill="url(#{p}paper)" stroke="#d6cfc2" filter="url(#{p}sh)"/>'
    stars = ''.join(f'<circle cx="{x}" cy="{y}" r="{r}" fill="#eee6cf" opacity=".7"/>' for x, y, r in
                    [(28, 24, 1.2), (62, 44, .9), (206, 30, 1.3), (188, 62, .8), (40, 88, .8), (216, 104, 1)])
    return f'<rect width="{W}" height="{H}" rx="12" fill="{NIGHT}"/>{stars}'


def tile(name, k, label, body):
    p = f'{name}-{k}-'
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" role="img" aria-label="{label}">'
            f'{defs(p, k)}{ground(p, k)}{body(p, k)}</svg>')


def shadow(cx, cy, rx):
    return f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="6" fill="#000" opacity=".18"/>'


def jar(p, k):
    light = k == 'light'
    spots = [(104, 98), (133, 88), (118, 118), (143, 114), (100, 130), (127, 136)]
    if light:
        fx = ''.join(f'<circle cx="{x}" cy="{y}" r="7" fill="url(#{p}fly)" opacity=".7"/>'
                     f'<path transform="translate({x} {y})" d="M0-5L1.3-1.3 5 0 1.3 1.3 0 5-1.3 1.3-5 0-1.3-1.3z" fill="#e89a2c"/>' for x, y in spots)
    else:
        fx = ''.join(f'<circle cx="{x}" cy="{y}" r="11" fill="url(#{p}fly)"/>'
                     f'<ellipse cx="{x - 2.5}" cy="{y - 2.5}" rx="2.6" ry="1.3" fill="#ffffff" opacity=".45" transform="rotate(-30 {x - 2.5} {y - 2.5})"/>'
                     f'<circle cx="{x}" cy="{y}" r="2.6" fill="#fff3c4"/>' for x, y in spots)
    ridges = ''.join(f'<rect x="{x}" y="30" width="1.6" height="14" fill="#5a3f12" opacity=".35"/>' for x in range(98, 143, 6))
    return f'''{shadow(120, 157, 48)}
<circle cx="120" cy="112" r="{46 if light else 58}" fill="url(#{p}warm)"/>
<path d="M100 52h40v6c18 6 24 18 24 34v44q0 16-16 16h-56q-16 0-16-16V92c0-16 6-28 24-34z" fill="url(#{p}glass)" stroke="#7fb4d6" stroke-opacity=".7" stroke-width="1.5"/>
{fx}
<path d="M86 92q-3 24 1 46" stroke="#fff" stroke-opacity=".75" stroke-width="4" stroke-linecap="round" fill="none"/><circle cx="90" cy="82" r="2.2" fill="#fff" opacity=".8"/>
<path d="M156 98q2 20-1 38" stroke="#335a78" stroke-opacity=".35" stroke-width="2" stroke-linecap="round" fill="none"/>
<rect x="95" y="44" width="50" height="10" rx="3" fill="url(#{p}glass)" stroke="#7fb4d6" stroke-opacity=".7"/>
<rect x="92" y="28" width="56" height="18" rx="4" fill="url(#{p}brass)"/>{ridges}<rect x="94" y="29.5" width="52" height="3" rx="1.5" fill="#fff" opacity=".45"/>'''


def dish(p, k):
    light = k == 'light'
    wave = '#c9772a' if light else '#ffd58a'
    struts = ''.join(f'<line x1="{x}" y1="{y}" x2="0" y2="-44" stroke="#7e8a96" stroke-width="1.6"/>' for x, y in ((-40, -6), (40, -6), (0, -20)))
    waves = ''.join(f'<path d="M{-r} {-54 - r * .5}q{r} {-r * .7} {2 * r} 0" stroke="{wave}" stroke-width="3" stroke-linecap="round" fill="none" opacity="{o}"/>'
                    for r, o in ((8, .9), (15, .6), (22, .35)))
    bolts = ''.join(f'<circle cx="{x}" cy="112" r="1.4" fill="#5d6873"/>' for x in (106, 134))
    return f'''{shadow(120, 157, 50)}
<path d="M120 116L92 152M120 116L148 152M120 116v38" stroke="url(#{p}steel)" stroke-width="5" stroke-linecap="round"/>
<path d="M120 116L92 152M120 116L148 152" stroke="#5d6873" stroke-opacity=".35" stroke-width="1.5"/>
<ellipse cx="120" cy="154" rx="6" ry="2.5" fill="#5d6873"/><ellipse cx="92" cy="152" rx="5" ry="2" fill="#5d6873"/><ellipse cx="148" cy="152" rx="5" ry="2" fill="#5d6873"/>
<rect x="102" y="104" width="36" height="14" rx="4" fill="url(#{p}steel)"/>{bolts}<rect x="104" y="105.5" width="32" height="2.5" rx="1.2" fill="#fff" opacity=".6"/>
<rect x="115" y="92" width="10" height="14" fill="url(#{p}steel)"/><circle cx="120" cy="94" r="8" fill="url(#{p}brass)"/><circle cx="120" cy="94" r="3" fill="#6e4f18"/>
<g transform="translate(120 86) rotate(-38)">
<path d="M-54 -6Q0 40 54 -6z" fill="url(#{p}steel)"/><path d="M-50 -2Q0 30 50 -2" stroke="#fff" stroke-opacity=".5" stroke-width="2" fill="none"/>
<ellipse cx="0" cy="-6" rx="54" ry="15" fill="url(#{p}dish)" stroke="#7e8a96" stroke-width="1.5"/>
<ellipse cx="0" cy="-6" rx="40" ry="10.5" fill="none" stroke="#7e8a96" stroke-opacity=".35"/><ellipse cx="0" cy="-6" rx="24" ry="6" fill="none" stroke="#7e8a96" stroke-opacity=".3"/>
<path d="M-46 -12a54 15 0 0 1 40 -8" stroke="#fff" stroke-width="2.5" stroke-linecap="round" fill="none"/>
{struts}<path d="M-5 -42h10l-2 -8h-6z" fill="url(#{p}brass)"/><circle cx="0" cy="-50" r="2.2" fill="#fb4934"/>{waves}</g>
<path d="M126 118q16 26 44 34" stroke="#3a3f47" stroke-width="2" fill="none" stroke-linecap="round"/>'''


def lantern(p, k):
    light = k == 'light'
    rivets = lambda y, xs: ''.join(f'<circle cx="{x}" cy="{y}" r="1.3" fill="#6e4f18"/>' for x in xs)
    vents = ''.join(f'<ellipse cx="{x}" cy="40" rx="2.2" ry="1.4" fill="#4a3510"/>' for x in (106, 114, 122, 130))
    drips = '<path d="M112 110q-1 6 1 8M126 110q1 4-1 6" stroke="#e9dcbc" stroke-width="2.4" stroke-linecap="round" fill="none"/>'
    return f'''{shadow(120, 158, 42)}<ellipse cx="120" cy="156" rx="{40 if light else 64}" ry="9" fill="url(#{p}warm)"/>
<circle cx="120" cy="90" r="{46 if light else 70}" fill="url(#{p}warm)"/>
<path d="M108 20a12 12 0 0 1 24 0" stroke="url(#{p}brass)" stroke-width="3.5" fill="none" stroke-linecap="round"/><rect x="118.5" y="20" width="3" height="18" fill="url(#{p}brassv)"/><circle cx="120" cy="37" r="4" fill="url(#{p}brass)"/>
<path d="M92 52q28-30 56 0z" fill="url(#{p}brass)"/>{vents}<path d="M98 46q22-20 44 0" stroke="#fff" stroke-opacity=".45" stroke-width="2" fill="none"/>
<rect x="88" y="50" width="64" height="8" rx="3" fill="url(#{p}brassv)"/>{rivets(54, (94, 108, 120, 132, 146))}
<rect x="94" y="58" width="52" height="68" fill="url(#{p}glass)"/>
<rect x="107" y="96" width="26" height="30" rx="2" fill="url(#{p}candle)"/>{drips}<ellipse cx="120" cy="96" rx="13" ry="3" fill="#fffaf0"/>
<line x1="120" y1="96" x2="120" y2="90" stroke="#3a2a1a" stroke-width="1.5"/>
<circle cx="120" cy="80" r="{14 if light else 20}" fill="url(#{p}fly)"/>
<path d="M120 64q9 12 5 20q-2 5-5 5q-3 0-5-5q-4-8 5-20z" fill="url(#{p}flame)"/><path d="M120 76q3 5 1 9q-1 2-1 2q-1 0-2-2q-1-4 2-9z" fill="#fffbe6"/><ellipse cx="120" cy="88" rx="2.2" ry="1.4" fill="#8fd3ff" opacity=".8"/>
<rect x="91" y="56" width="5" height="72" rx="2" fill="url(#{p}brass)"/><rect x="144" y="56" width="5" height="72" rx="2" fill="url(#{p}brass)"/>
<line x1="96" y1="92" x2="144" y2="92" stroke="url(#{p}brass)" stroke-width="1.5" opacity=".7"/>
<path d="M100 62q-3 28 0 60" stroke="#fff" stroke-opacity=".75" stroke-width="3" stroke-linecap="round" fill="none"/><path d="M139 64v24" stroke="#fff" stroke-opacity=".35" stroke-width="1.5" stroke-linecap="round"/>
<rect x="86" y="126" width="68" height="10" rx="3" fill="url(#{p}brassv)"/>{rivets(131, (92, 106, 120, 134, 148))}
<path d="M92 136h56l6 12h-68z" fill="url(#{p}brass)"/><rect x="84" y="147" width="72" height="5" rx="2" fill="url(#{p}brassv)"/>
<rect x="88" y="127.5" width="64" height="2" rx="1" fill="#fff" opacity=".5"/>'''


def djinni(p, k):
    light = k == 'light'
    smoke = '#9a88c9' if light else '#d9ccff'
    sparks = ''.join(f'<path transform="translate({x} {y}) scale({s})" d="M0-5L1.3-1.3 5 0 1.3 1.3 0 5-1.3 1.3-5 0-1.3-1.3z" fill="{"#c9a13a" if light else "#fff3c4"}"/>'
                     for x, y, s in ((146, 30, .9), (176, 52, .6), (132, 58, .5), (196, 26, .7)))
    filigree = ''.join(f'<path d="M{x} 122q6 -8 12 0" stroke="#6e4f18" stroke-opacity=".55" stroke-width="1.3" fill="none"/>' for x in (92, 106, 120, 134))
    dots = ''.join(f'<circle cx="{x}" cy="128" r="1.2" fill="#6e4f18" opacity=".6"/>' for x in range(94, 148, 7))
    return f'''{shadow(122, 156, 52)}
<circle cx="170" cy="56" r="{40 if light else 56}" fill="url(#{p}magic)"/>
<path d="M199 76c-9-12 7-20 0-34c-6-11-22-8-21 3c1 8 12 7 11-1" stroke="{smoke}" stroke-width="6" stroke-linecap="round" fill="none" opacity=".35"/>
<path d="M199 76c-9-12 7-20 0-34c-6-11-22-8-21 3c1 8 12 7 11-1" stroke="{smoke}" stroke-width="2.2" stroke-linecap="round" fill="none" opacity=".85"/>{sparks}
<path d="M84 116c-26-10-34 20-8 20" stroke="url(#{p}brass)" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M82 118c-18-6-24 12-8 14" stroke="#fff" stroke-opacity=".4" stroke-width="1.8" fill="none" stroke-linecap="round"/>
<path d="M108 138h28l6 12h-40z" fill="url(#{p}brass)"/><ellipse cx="122" cy="150" rx="22" ry="4" fill="url(#{p}brassv)"/>
<path d="M150 112c18-4 32-12 44-22l5 5c-10 14-26 26-46 32z" fill="url(#{p}brass)"/><path d="M154 114c16-4 28-11 40-21" stroke="#fff" stroke-opacity=".5" stroke-width="1.5" fill="none"/>
<ellipse cx="122" cy="120" rx="42" ry="20" fill="url(#{p}brass)"/>{filigree}{dots}
<path d="M88 112q14-12 34-12" stroke="#fff" stroke-opacity=".7" stroke-width="3" stroke-linecap="round" fill="none"/>
<ellipse cx="122" cy="102" rx="24" ry="6" fill="url(#{p}brassv)"/><path d="M100 102q22-26 44 0z" fill="url(#{p}brass)"/>
<path d="M108 94q10-10 22-6" stroke="#fff" stroke-opacity=".55" stroke-width="2" fill="none" stroke-linecap="round"/>
<rect x="119" y="74" width="6" height="8" rx="2" fill="url(#{p}brassv)"/><circle cx="122" cy="72" r="4.5" fill="url(#{p}brass)"/><circle cx="120.5" cy="70.5" r="1.3" fill="#fff" opacity=".7"/>
<circle cx="199" cy="88" r="{9 if light else 13}" fill="url(#{p}fly)"/><path d="M199 78q5 6 3 10q-1 2-3 2q-2 0-3-2q-2-4 3-10z" fill="url(#{p}flame)"/>'''


BYTES = ('bytes: a glass jar with a brass lid, fireflies glowing inside', jar)
FRAMES = {
    'dish': ('frame: a satellite dish on a tripod, sending signal waves', dish),
    'lantern': ('frame: a brass lantern with a candle flame', lantern),
    'djinni': ('frame: a brass djinni lamp with a flame and a curl of magic smoke', djinni),
}


def bytes_icon(k): return tile('bytes', k, *BYTES)
def frame_icon(take, k): return tile(f'frame-{take}', k, *FRAMES[take])
