"""The visit-tour tiles: the bytes jar and the frame takes, one svg per theme, one light source (top left)."""

from lettering import outline, width

W, H = 240, 180
CAP_H = 26
NIGHT = ('#141b31', '#243052')  # the hero's night sky, top to bottom
CAP = dict(light=('#0969da', '#59636e'), dark=('#4493f8', '#9198a1'))


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
</defs>'''


def night_sky():
    return f'<defs><linearGradient id="night-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{NIGHT[0]}"/><stop offset="1" stop-color="{NIGHT[1]}"/></linearGradient></defs>'


def ground(k):
    if k == 'light':
        return ''
    stars = ''.join(f'<circle cx="{x}" cy="{y}" r="{r}" fill="#eee6cf" opacity=".7"/>' for x, y, r in
                    [(28, 24, 1.2), (62, 44, .9), (206, 30, 1.3), (188, 62, .8), (40, 88, .8), (216, 104, 1)])
    return f'{night_sky()}<rect width="{W}" height="{H}" rx="12" fill="url(#night-sky)"/>{stars}'


def caption(k, repo, text):
    rest = f' — {text}'
    x = W / 2 - (width(repo, 10, 'Bold') + width(rest, 10, 'Regular')) / 2
    return outline(repo, x, H + 17, 10, 'Bold', fill=CAP[k][0]) + outline(rest, x + width(repo, 10, 'Bold'), H + 17, 10, 'Regular', fill=CAP[k][1])


def tile(name, k, label, body, repo, text):
    p = f'{name}-{k}-'
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H + CAP_H}" width="{W}" height="{H + CAP_H}" role="img" aria-label="{repo} — {text}: {label}">'
            f'{defs(p, k)}{ground(k)}{body(p, k)}{caption(k, repo, text)}</svg>')


def shadow(cx, cy, rx):
    return f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="6" fill="#000" opacity=".18"/>'


def jar(p, k):
    light = k == 'light'
    spots = [(104, 98), (133, 88), (118, 118), (143, 114), (100, 130), (127, 136)]
    spark = 'M0-5L1.3-1.3 5 0 1.3 1.3 0 5-1.3 1.3-5 0-1.3-1.3z'
    if light:
        fx = ''.join(f'<circle cx="{x}" cy="{y}" r="7" fill="url(#{p}fly)" opacity=".7"/>'
                     f'<path transform="translate({x} {y})" d="{spark}" fill="#e89a2c"/>' for x, y in spots)
        fx += ''.join(f'<circle cx="{x}" cy="{y}" r=".9" fill="#e89a2c" opacity=".7"/>' for x, y in ((112, 106), (139, 126), (108, 142), (126, 96), (147, 100)))
        trails = ''
    else:
        fx = ''.join(f'<circle cx="{x}" cy="{y}" r="11" fill="url(#{p}fly)"/>'
                     f'<ellipse cx="{x - 2.5}" cy="{y - 2.5}" rx="2.6" ry="1.3" fill="#ffffff" opacity=".45" transform="rotate(-30 {x - 2.5} {y - 2.5})"/>'
                     f'<circle cx="{x}" cy="{y}" r="2.6" fill="#fff3c4"/>' for x, y in spots)
        trails = ''.join(f'<path d="{d}" stroke="#ffd58a" stroke-width="1.2" stroke-dasharray="1 3.5" stroke-linecap="round" fill="none" opacity=".6"/>'
                         for d in ('M104 98q-8 8-4 18', 'M133 88q12 2 12 14', 'M118 118q-8 6-2 14'))
    ridges = ''.join(f'<rect x="{x}" y="31" width="1.6" height="13" fill="#5a3f12" opacity=".35"/>' for x in range(98, 143, 6))
    body = 'M100 52h40v6c18 6 24 18 24 34v44q0 16-16 16h-56q-16 0-16-16V92c0-16 6-28 24-34z'
    pool = '' if light else f'<ellipse cx="120" cy="156" rx="44" ry="8" fill="url(#{p}warm)"/>'
    return f'''{shadow(120, 157, 48)}{pool}
<circle cx="120" cy="112" r="{46 if light else 58}" fill="url(#{p}warm)"/>
<path d="{body}" fill="url(#{p}glass)" stroke="#7fb4d6" stroke-opacity=".7" stroke-width="1.5"/>
<path d="{body}" transform="translate(120 104) scale(.93) translate(-120 -104)" fill="none" stroke="#fff" stroke-opacity=".28"/>
<ellipse cx="120" cy="146" rx="38" ry="5" fill="#bfe3f0" opacity="{.45 if light else .18}"/><path d="M88 146q32 6 64 0" stroke="#fff" stroke-opacity=".55" stroke-width="1.2" fill="none"/>
{fx}{trails}
<path d="M86 92q-3 24 1 46" stroke="#fff" stroke-opacity=".75" stroke-width="4" stroke-linecap="round" fill="none"/><circle cx="90" cy="82" r="2.2" fill="#fff" opacity=".8"/>
<rect x="146" y="72" width="5" height="13" rx="2" fill="#fff" opacity=".45" transform="rotate(24 148 78)"/><rect x="153" y="79" width="4" height="9" rx="2" fill="#fff" opacity=".35" transform="rotate(24 155 83)"/>
<path d="M156 98q2 20-1 38" stroke="#335a78" stroke-opacity=".35" stroke-width="2" stroke-linecap="round" fill="none"/>
<rect x="95" y="44" width="50" height="10" rx="3" fill="url(#{p}glass)" stroke="#7fb4d6" stroke-opacity=".7"/><path d="M97 48.5h46M97 51.5h46" stroke="#7fb4d6" stroke-opacity=".5"/>
<path d="M99 58q21 5 42 0" stroke="#a97c45" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M99 59.5q21 5 42 0" stroke="#6e4f18" stroke-opacity=".4" stroke-width=".8" fill="none"/>
<path d="M140 58q6-6 8 0q-6 4-8 0zM140 58q-2 7 4 8" stroke="#a97c45" stroke-width="1.6" fill="none" stroke-linecap="round"/>
<path d="M142 60q8 6 12 12" stroke="#a97c45" stroke-width="1.1" fill="none"/>
<g transform="rotate(16 158 78)"><rect x="150" y="72" width="17" height="11" rx="1.5" fill="#d9b98a" stroke="#a97c45" stroke-width=".8"/><circle cx="153.5" cy="77.5" r="1.3" fill="{'#ffffff' if light else '#1b243f'}" stroke="#a97c45" stroke-width=".6"/><path d="M157 76h7M157 79h5" stroke="#8a6a3a" stroke-width=".9" stroke-linecap="round"/></g>
<rect x="92" y="28" width="56" height="18" rx="4" fill="url(#{p}brass)"/>{ridges}<ellipse cx="120" cy="29.5" rx="27" ry="2.6" fill="#f8e3a0" opacity=".85"/><rect x="92" y="43" width="56" height="2" fill="#5a3f12" opacity=".3"/>'''


def dish(p, k):
    light = k == 'light'
    wave = '#c9772a' if light else '#ffd58a'
    struts = ''.join(f'<line x1="{x}" y1="{y}" x2="0" y2="-44" stroke="#7e8a96" stroke-width="1.6"/>' for x, y in ((-40, -6), (40, -6), (0, -20)))
    waves = ''.join((f'<path d="M{-r} {-56 - r * .5}q{r} {-r * .7} {2 * r} 0" stroke="{wave}" stroke-width="7" stroke-linecap="round" fill="none" opacity="{o * .25}"/>' if not light else '')
                    + f'<path d="M{-r} {-56 - r * .5}q{r} {-r * .7} {2 * r} 0" stroke="{wave}" stroke-width="3" stroke-linecap="round" fill="none" opacity="{o}"/>'
                    for r, o in ((8, .95), (15, .65), (22, .4)))
    ribs = ''.join(f'<path d="M{x} -4q{-x * .15} {14 - abs(x) * .2} {-x * .3} {22 - abs(x) * .3}" stroke="#5d6873" stroke-opacity=".3" stroke-width="1.2" fill="none"/>' for x in (-30, -10, 10, 30))
    vents = ''.join(f'<rect x="{x}" y="128" width="2" height="8" rx="1" fill="#5d6873" opacity=".6"/>' for x in (96, 101, 106))
    return f'''{shadow(116, 157, 54)}
<path d="M116 118L90 152M116 118L142 152M116 118v36" stroke="url(#{p}steel)" stroke-width="5" stroke-linecap="round"/>
<path d="M100 139h32" stroke="url(#{p}steel)" stroke-width="2.5" stroke-linecap="round"/><path d="M116 118L90 152M116 118L142 152" stroke="#5d6873" stroke-opacity=".35" stroke-width="1.5"/>
<ellipse cx="116" cy="155" rx="6" ry="2.5" fill="#5d6873"/><ellipse cx="90" cy="152" rx="6" ry="2.4" fill="#5d6873"/><ellipse cx="142" cy="152" rx="6" ry="2.4" fill="#5d6873"/><ellipse cx="89" cy="151" rx="3" ry="1" fill="#fff" opacity=".35"/><ellipse cx="141" cy="151" rx="3" ry="1" fill="#fff" opacity=".35"/>
<rect x="92" y="124" width="22" height="16" rx="3" fill="url(#{p}steel)" stroke="#7e8a96" stroke-width=".8"/>{vents}<circle cx="110" cy="129" r="1.8" fill="#8ec07c"/><circle cx="110" cy="134.5" r="1.8" fill="#fabd2f"/><rect x="94" y="137" width="12" height="1.6" rx=".8" fill="#5d6873" opacity=".5"/>
<rect x="98" y="104" width="36" height="14" rx="4" fill="url(#{p}steel)"/><circle cx="104" cy="112" r="1.4" fill="#5d6873"/><circle cx="128" cy="112" r="1.4" fill="#5d6873"/><rect x="100" y="105.5" width="32" height="2.5" rx="1.2" fill="#fff" opacity=".6"/>
<rect x="111" y="92" width="10" height="14" fill="url(#{p}steel)"/>
<g transform="translate(116 86) rotate(38)">
<path d="M-54 -6Q0 40 54 -6z" fill="url(#{p}steel)"/>{ribs}<path d="M-50 -2Q0 30 50 -2" stroke="#fff" stroke-opacity=".45" stroke-width="2" fill="none"/>
<ellipse cx="0" cy="-6" rx="54" ry="15" fill="url(#{p}dish)" stroke="#7e8a96" stroke-width="1.5"/><ellipse cx="0" cy="-6" rx="50.5" ry="13" fill="none" stroke="#fff" stroke-opacity=".6"/>
<ellipse cx="0" cy="-6" rx="36" ry="9.5" fill="none" stroke="#7e8a96" stroke-opacity=".35"/><ellipse cx="0" cy="-6" rx="20" ry="5.2" fill="none" stroke="#7e8a96" stroke-opacity=".3"/><line x1="0" y1="-6" x2="40.0" y2="-6.0" stroke="#7e8a96" stroke-opacity=".3" stroke-width=".8"/><line x1="0" y1="-6" x2="28.3" y2="1.4" stroke="#7e8a96" stroke-opacity=".3" stroke-width=".8"/><line x1="0" y1="-6" x2="0.0" y2="4.5" stroke="#7e8a96" stroke-opacity=".3" stroke-width=".8"/><line x1="0" y1="-6" x2="-28.3" y2="1.4" stroke="#7e8a96" stroke-opacity=".3" stroke-width=".8"/><line x1="0" y1="-6" x2="-40.0" y2="-6.0" stroke="#7e8a96" stroke-opacity=".3" stroke-width=".8"/><line x1="0" y1="-6" x2="-28.3" y2="-13.4" stroke="#7e8a96" stroke-opacity=".3" stroke-width=".8"/><line x1="0" y1="-6" x2="-0.0" y2="-16.5" stroke="#7e8a96" stroke-opacity=".3" stroke-width=".8"/><line x1="0" y1="-6" x2="28.3" y2="-13.4" stroke="#7e8a96" stroke-opacity=".3" stroke-width=".8"/><circle cx="52.0" cy="-6.0" r="1" fill="#5d6873"/><circle cx="45.0" cy="1.0" r="1" fill="#5d6873"/><circle cx="26.0" cy="6.1" r="1" fill="#5d6873"/><circle cx="0.0" cy="8.0" r="1" fill="#5d6873"/><circle cx="-26.0" cy="6.1" r="1" fill="#5d6873"/><circle cx="-45.0" cy="1.0" r="1" fill="#5d6873"/><circle cx="-52.0" cy="-6.0" r="1" fill="#5d6873"/><circle cx="-45.0" cy="-13.0" r="1" fill="#5d6873"/><circle cx="-26.0" cy="-18.1" r="1" fill="#5d6873"/><circle cx="-0.0" cy="-20.0" r="1" fill="#5d6873"/><circle cx="26.0" cy="-18.1" r="1" fill="#5d6873"/><circle cx="45.0" cy="-13.0" r="1" fill="#5d6873"/><circle cx="0" cy="-6" r="2.4" fill="#7e8a96"/>
<path d="M-46 -12a54 15 0 0 1 40 -8" stroke="#fff" stroke-width="2.5" stroke-linecap="round" fill="none"/>
{struts}<path d="M-37 -5L-3 -41" stroke="#3a3f47" stroke-width="1" stroke-dasharray="3 1.5"/><rect x="-6" y="-50" width="12" height="9" rx="2" fill="url(#{p}brass)"/><path d="M-4 -50l-2 -6h12l-2 6z" fill="url(#{p}brassv)"/><circle cx="0" cy="-59" r="2.4" fill="#fb4934"/>{waves}</g>
<path d="M100 134q-14 6-10 14q4 7 16 3q14-4 34 2" stroke="#3a3f47" stroke-width="2" fill="none" stroke-linecap="round"/>'''


def djinni(p, k):
    light = k == 'light'
    smoke = '#9a88c9' if light else '#d9ccff'
    star = "#c9a13a" if light else "#fff3c4"
    sparks = ''.join(f'<path transform="translate({x} {y}) scale({s})" d="M0-5L1.3-1.3 5 0 1.3 1.3 0 5-1.3 1.3-5 0-1.3-1.3z" fill="{star}"/>'
                     for x, y, s in ((150, 26, .9), (182, 46, .6), (140, 50, .5), (200, 22, .7), (164, 66, .45)))
    filigree = ''.join(f'<path d="M{x} 124q6 -8 12 0" stroke="#6e4f18" stroke-opacity=".55" stroke-width="1.3" fill="none"/>' for x in (90, 104, 128, 142))
    dots = ''.join(f'<circle cx="{x}" cy="131" r="1.2" fill="#6e4f18" opacity=".6"/>' for x in range(92, 154, 7))
    rivets = ''.join(f'<circle cx="{x}" cy="{105 + abs(x - 122) * .08}" r="1.3" fill="#6e4f18" opacity=".7"/>' for x in range(104, 142, 6))
    wisp = 'M199 76c-9-12 7-20 0-34c-6-11-22-8-21 3c1 8 12 7 11-1'
    return f'''<g transform="translate(-12 0)">{shadow(122, 157, 54)}
<circle cx="172" cy="52" r="{42 if light else 60}" fill="url(#{p}magic)"/>
<g transform="translate(0 -9)"><path d="{wisp}" stroke="{smoke}" stroke-width="9" stroke-linecap="round" fill="none" opacity=".2"/>
<path d="{wisp}" stroke="{smoke}" stroke-width="4" stroke-linecap="round" fill="none" opacity=".4"/>
<path d="{wisp}" stroke="{smoke}" stroke-width="1.8" stroke-linecap="round" fill="none" opacity=".9"/>
<path d="M195 70c-4-6 2-10 0-16" stroke="{smoke}" stroke-width="1.2" stroke-linecap="round" fill="none" opacity=".6"/><path d="M201 72c6-10-4-16 2-26c3-5 9-6 12-2" stroke="{smoke}" stroke-width="1" stroke-linecap="round" fill="none" opacity=".55"/></g>{sparks}
<path d="M84 116c-26-10-34 20-8 20" stroke="url(#{p}brass)" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M82 118c-18-6-24 12-8 14" stroke="#fff" stroke-opacity=".4" stroke-width="1.8" fill="none" stroke-linecap="round"/>
<path d="M108 140h28l6 10h-40z" fill="url(#{p}brass)"/><path d="M104 148h36" stroke="#6e4f18" stroke-opacity=".5"/><path d="M111 141l-0.9 6" stroke="#6e4f18" stroke-opacity=".35" stroke-width=".9"/><path d="M115 141l-0.6 6" stroke="#6e4f18" stroke-opacity=".35" stroke-width=".9"/><path d="M119 141l-0.2 6" stroke="#6e4f18" stroke-opacity=".35" stroke-width=".9"/><path d="M123 141l0.1 6" stroke="#6e4f18" stroke-opacity=".35" stroke-width=".9"/><path d="M127 141l0.4 6" stroke="#6e4f18" stroke-opacity=".35" stroke-width=".9"/><path d="M131 141l0.7 6" stroke="#6e4f18" stroke-opacity=".35" stroke-width=".9"/><ellipse cx="122" cy="151" rx="24" ry="4.5" fill="url(#{p}brassv)"/>
<path d="M150 112c18-4 32-12 44-22l5 5c-10 14-26 26-46 32z" fill="url(#{p}brass)"/><path d="M154 114c16-4 28-11 40-21" stroke="#fff" stroke-opacity=".5" stroke-width="1.5" fill="none"/><path d="M188 89l5 7" stroke="#6e4f18" stroke-width="3.2" stroke-opacity=".5" stroke-linecap="round"/><path d="M188.6 88.4l5 7" stroke="#f8e3a0" stroke-width="1" stroke-opacity=".8"/><path d="M178 102q7-4 11-9" stroke="#fff3c4" stroke-opacity=".85" stroke-width="1.5" fill="none" stroke-linecap="round"/>
<path d="M160 108l5 12" stroke="#6e4f18" stroke-width="3" stroke-opacity=".55"/><path d="M161 107l5 12" stroke="#f8e3a0" stroke-width="1" stroke-opacity=".7"/>
<ellipse cx="122" cy="122" rx="44" ry="20" fill="url(#{p}brass)"/>{filigree}{dots}<path d="M79 126Q122 142 165 126" stroke="#6e4f18" stroke-opacity=".45" stroke-width="1.3" fill="none"/><path d="M79 127.8Q122 143.8 165 127.8" stroke="#f8e3a0" stroke-opacity=".5" fill="none"/><path d="M150 118c4-7 11-4 9 1c-1 3-5 2-4-1" stroke="#6e4f18" stroke-opacity=".55" stroke-width="1.1" fill="none" stroke-linecap="round"/><path d="M94 118c-4-7-11-4-9 1c1 3 5 2 4-1" stroke="#6e4f18" stroke-opacity=".55" stroke-width="1.1" fill="none" stroke-linecap="round"/>
<path d="M122 115.5l7.5 4.5v8l-7.5 4.5-7.5-4.5v-8z" fill="url(#{p}brassv)" stroke="#6e4f18" stroke-width=".8"/><path d="M122 117.5l6 3.5v6.2l-6 3.5-6-3.5V121z" fill="#6a3fb5"/><path d="M122 120l3 1.8v3.4l-3 1.8-3-1.8v-3.4z" fill="#a98be8"/><path d="M122 117.5V120M128 121l-3 .8M128 127.2l-3-2M122 130.7v-3.7M116 127.2l3-2M116 121l3 .8" stroke="#3d2170" stroke-width=".6" stroke-opacity=".8"/><path d="M116 121l6-3.5v2.5l-3 1.8z" fill="#fff" opacity=".45"/><circle cx="120.4" cy="121.2" r=".9" fill="#fff"/>
<path d="M92 136q30 8 60 0" stroke="#fff" stroke-opacity=".2" stroke-width="2" fill="none"/>
<ellipse cx="122" cy="104" rx="26" ry="6" fill="url(#{p}brassv)"/>{rivets}
<path d="M102 104q20-22 40 0z" fill="url(#{p}brass)"/><ellipse cx="122" cy="90" rx="10" ry="3" fill="url(#{p}brassv)"/><path d="M112 90q10-12 20 0z" fill="url(#{p}brass)"/>
<path d="M108 98q8-8 16-6" stroke="#fff" stroke-opacity=".55" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="122" cy="97" r="2.6" fill="#3fb6a8"/><circle cx="121.2" cy="96.2" r=".9" fill="#fff" opacity=".8"/>
<rect x="120" y="72" width="4" height="14" rx="2" fill="url(#{p}brassv)"/><circle cx="122" cy="71" r="4.5" fill="url(#{p}brass)"/><circle cx="120.5" cy="69.5" r="1.3" fill="#fff" opacity=".7"/>
<circle cx="199" cy="88" r="{10 if light else 15}" fill="url(#{p}fly)"/><path d="M199 76q6 7 3.5 11q-1.2 2.5-3.5 2.5q-2.3 0-3.5-2.5q-2.5-4 3.5-11z" fill="url(#{p}flame)"/><path d="M199 82q2 3 1 5q-.5 1-1 1q-.5 0-1-1q-1-2 1-5z" fill="#fffbe6"/></g>'''


BYTES = ('bytes: a glass jar with a brass lid, fireflies glowing inside', jar)
FRAMES = {
    'dish': ('frame: a satellite dish on a tripod, turned up and right, sending signal waves', dish),
    'djinni': ('frame: a brass djinni lamp with gems, a flame and a curl of magic smoke', djinni),
}


def bytes_icon(k): return tile('bytes', k, *BYTES, 'bytes', 'the apps')
def frame_icon(take, k): return tile(f'frame-{take}', k, *FRAMES[take], 'frame', 'the machine as data')
