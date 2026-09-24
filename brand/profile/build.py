import base64, io, pathlib, re, shutil
from PIL import Image
from lettering import outline, width

HERE = pathlib.Path(__file__).resolve().parent
OUT = HERE / 'out'

# ---------- the shared blocks ----------
TH = dict(
 light=dict(bg='#f3e2c0', card='#fffaf0', ink='#4a3b2c', dim='#6f5c47', acc=['#c0573a', '#5d7a4c', '#9a6410', '#6a5a9a'], bar='#c0573a', mute='#d9bf93', shadow=.22),
 dark=dict(bg='#141a2e', card='#1c2440', ink='#eee6cf', dim='#a9b2c8', acc=['#ff9a3c', '#5ff2c8', '#8fd3ff', '#d3a6ff'], bar='#ff9a3c', mute='#3a4670', shadow=.35))
def shadow(T): return f'<filter id="sh" x="-5%" y="-10%" width="110%" height="130%"><feDropShadow dx="2" dy="3" stdDeviation="1.6" flood-color="#000" flood-opacity="{T["shadow"]}"/></filter>'

def avatar(name):
    im = Image.open(HERE / name).convert('RGB').resize((72, 72), Image.LANCZOS)
    buf = io.BytesIO(); im.save(buf, 'PNG', optimize=True)
    return 'data:image/png;base64,' + base64.b64encode(buf.getvalue()).decode()

ROWS = [('owl.png', 'cclio', 'coordinates', '23 tickets closed · 6 planned'), ('bulldog.png', 'coder', 'crafts', '290 commits · last FRM-258'),
        ('basset.png', 'reviewer', 'reviews', '5 prs · 3 findings'), ('../avatars/fleet/verifier/verifier-dalmatian-clipboard-space.png', 'verifier', 'verifies', '4 rounds · 1 finding')]
SKILLS = sum(1 for p in (HERE.parents[1] / 'home/.claude/plugin-x/skills').iterdir() if p.is_dir())
FOOT = [('this week: ', 'Regular'), ('290', 'Bold'), (' agent commits · ', 'Regular'), ('23', 'Bold'), (' tickets · ', 'Regular'), (str(SKILLS), 'Bold'), (' skills in the kit', 'Regular')]

def board(T):
    rows = ''
    for n, (av, name, role, fact) in enumerate(ROWS):
        y = 16 + n * 56; c = T['acc'][n]
        rows += f'''<g transform="translate(16 {y})"><rect width="768" height="48" rx="8" fill="{T['card']}" filter="url(#sh)"/><rect x="0" y="8" width="3" height="32" rx="1.5" fill="{c}"/>
<clipPath id="av{n}"><rect x="12" y="6" width="36" height="36" rx="8"/></clipPath><image href="{avatar(av)}" x="12" y="6" width="36" height="36" clip-path="url(#av{n})"/>
{outline(name, 60, 22, 15, 'Bold', fill=T['ink'])}{outline(role, 60, 39, 13, 'Regular', fill=T['dim'])}
<circle cx="236" cy="24" r="4" fill="{c}"/>{outline(fact, 248, 29, 15, 'Regular', fill=T['ink'])}</g>'''
    x, foot = 20, ''
    for text, w in FOOT:
        foot += outline(text, x, 252, 14, w, fill=T['ink'] if w == 'Bold' else T['dim']); x += width(text, 14, w)
    return f'''<svg xmlns="http://www.w3.org/2000/svg" class="board" viewBox="0 0 800 268" width="800" height="268" role="img" aria-label="fleet board, last seven days: cclio coordinates, coder crafts, reviewer reviews, verifier verifies">
<defs>{shadow(T)}</defs><rect width="800" height="268" rx="12" fill="{T['bg']}"/>{rows}{foot}</svg>'''

def barcard(T, title, data, unit, aria):
    fmt = lambda v: f'{v}{unit}'
    lab_w = max(width(l, 13, 'Regular') for l, _ in data)
    val_w = max(width(fmt(v), 13, 'Bold') for _, v in data)
    x0 = 16 + lab_w + 12
    span = 384 - 14 - val_w - 6 - x0
    mx = max(v for _, v in data); step = 22 if len(data) > 4 else 27; rows = ''
    for n, (lab, v) in enumerate(data):
        y = 46 + n * step; w = span * v / mx; top = v == mx
        rows += (f'<g><title>{lab}: {fmt(v)}</title>{outline(lab, 16, y + 11, 13, "Regular", fill=T["ink"])}'
                 f'<rect x="{x0:.1f}" y="{y}" width="{w:.1f}" height="14" rx="4" fill="{T["bar"] if top else T["mute"]}"/>'
                 f'{outline(fmt(v), x0 + w + 6, y + 11, 13, "Bold" if top else "Regular", fill=T["ink"] if top else T["dim"])}</g>')
    return f'''<svg xmlns="http://www.w3.org/2000/svg" class="card" viewBox="0 0 390 170" width="390" height="170" role="img" aria-label="{aria}"><defs>{shadow(T)}</defs>
<rect width="390" height="170" rx="12" fill="{T['bg']}"/><rect x="6" y="6" width="378" height="158" rx="9" fill="{T['card']}" filter="url(#sh)"/>
{outline(title, 16, 30, 15, 'Bold', fill=T['ink'])}{rows}</svg>'''

LANGS = [('typescript', 58.4), ('shell', 17.2), ('swift', 11.6), ('python', 7.9), ('css', 4.9)]
LAZY = [('morning', 372), ('daytime', 892), ('evening', 1383), ('night', 585)]
def langs(T): return barcard(T, 'top langs', LANGS, '%', 'top languages: typescript 58.4, shell 17.2, swift 11.6, python 7.9, css 4.9 percent')
def lazy(T): return barcard(T, 'laziness levels · commits by time of day', LAZY, '', 'commits by time of day: morning 372, daytime 892, evening 1383, night 585')

def bytes_icon(k):
    light = k == 'light'; bg = TH[k]['bg']
    motes = ''.join(f'<circle cx="{x}" cy="{y}" r="7" fill="#ffd58a" opacity=".25"/><circle cx="{x}" cy="{y}" r="3" fill="{"#e89a2c" if light else "#ffd58a"}"/>' for x, y in [(48, 48), (66, 40), (72, 62), (52, 66), (60, 54)])
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 90" width="120" height="90" role="img" aria-label="bytes: glowing things in a bottle"><rect width="120" height="90" rx="8" fill="{bg}"/><path d="M44 22h32v6c10 4 12 12 12 20v22q0 6-6 6H38q-6 0-6-6V48c0-8 2-16 12-20z" fill="#8fb3d9" opacity="{.35 if light else .18}" stroke="#8fb3d9" stroke-opacity=".6"/><rect x="42" y="16" width="36" height="7" rx="2" fill="#8a7f6e"/>{motes}</svg>'

def frame_icon(k):
    light = k == 'light'; bg = TH[k]['bg']
    body = '#e8dcc6' if light else '#c9c2b0'; bez = '#4a3b2c' if light else '#2a2d3a'
    crew = ''.join(f'<g transform="translate({x} 58)"><circle r="3.2" cy="-9" fill="{c}"/><path d="M-4.5 0q0-6 4.5-6t4.5 6z" fill="{c}"/></g>' for x, c in [(50, '#c0573a'), (60, '#ffd58a'), (70, '#8fb3d9')])
    holes = ''.join(f'<rect x="{x}" y="{y}" width="4" height="3" rx="1" fill="{bez}"/>' for y in (20, 59) for x in range(36, 86, 8))
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 90" width="120" height="90" role="img" aria-label="frame: a paper mac with a film-frame screen and three crew"><rect width="120" height="90" rx="8" fill="{bg}"/>
<rect x="28" y="12" width="64" height="58" rx="7" fill="{body}"/><rect x="33" y="17" width="54" height="46" rx="3" fill="{bez}"/>{holes}
<rect x="36" y="25" width="48" height="32" rx="2" fill="#8fb3d9"/><rect x="36" y="46" width="48" height="11" fill="#6f8fb8"/>{crew}
<rect x="52" y="70" width="16" height="6" fill="{body}"/><rect x="42" y="76" width="36" height="4" rx="2" fill="{body}"/><circle cx="84" cy="66" r="1.4" fill="#c0573a"/></svg>'''

# ---------- stack: one wrapping strip ----------
STACK = [['typescript react nextdotjs vite', 'reactquery graphql', 'prisma drizzle clerk betterauth', 'vitest prettier biome'],
         ['nodedotjs bun pnpm', 'tailwindcss shadcnui', 'neovim', 'claude anthropic', 'vercel railway docker']]
HOME = dict(typescript='https://www.typescriptlang.org', react='https://react.dev', nextdotjs='https://nextjs.org', vite='https://vite.dev',
 reactquery='https://tanstack.com/query', graphql='https://graphql.org', prisma='https://www.prisma.io', drizzle='https://orm.drizzle.team',
 clerk='https://clerk.com', betterauth='https://www.better-auth.com', vitest='https://vitest.dev', prettier='https://prettier.io', biome='https://biomejs.dev',
 nodedotjs='https://nodejs.org', bun='https://bun.sh', pnpm='https://pnpm.io', tailwindcss='https://tailwindcss.com', shadcnui='https://ui.shadcn.com',
 neovim='https://neovim.io', claude='https://claude.ai', anthropic='https://www.anthropic.com', vercel='https://vercel.com', railway='https://railway.com', docker='https://www.docker.com')
MONO_FILL = '#6e7781'  # 4.5:1 on github light, 4.1:1 on github dark: one svg survives both themes as an <img>
MONO = {'anthropic', 'betterauth', 'bun', 'nextdotjs', 'prisma', 'railway', 'shadcnui', 'vercel', 'drizzle', 'vitest'}

def stack_row(row):
    groups = []
    for names in row:
        items = ''
        for n in names.split():
            v = (HERE / 'icons' / f'{n}.svg').read_text()
            if n in MONO: v = re.sub(r'fill="#[0-9A-Fa-f]{6}"', f'fill="{MONO_FILL}"', v, count=1)
            v = re.sub(r'<title>.*?</title>', '', v).replace('<svg ', '<svg width="28" height="28" aria-hidden="true" ', 1)
            items += f'<a class="ic" href="{HOME[n]}" title="{n}" aria-label="{n}">{v}</a>'
        groups.append(f'<span class="grp">{items}</span>')
    return '<p class="stack">' + ''.join(groups) + '</p>'

def stack(): return ''.join(stack_row(r) for r in STACK)

# ---------- the comp page ----------
def hero(scene, mode): return f'<img class="hero" src="hero-{scene}-{mode}.svg" width="800" height="300" alt="{scene} hero, {mode}">'
def dn(light, dark): return f'<div class="dn day">{light}</div><div class="dn night">{dark}</div>'

def mock(hero_light, hero_dark):
    tour = ''.join(f'<figure><a href="https://github.com/dvakatsiienko/{n}">{dn(icon("light"), icon("dark"))}</a><figcaption><a href="https://github.com/dvakatsiienko/{n}">{n}</a> — {cap}</figcaption></figure>'
                   for n, icon, cap in [('frame', frame_icon, 'the machine as data'), ('bytes', bytes_icon, 'the apps')])
    week = dn(board(TH['light']) + f'<div class="cards">{langs(TH["light"])}{lazy(TH["light"])}</div>',
              board(TH['dark']) + f'<div class="cards">{langs(TH["dark"])}{lazy(TH["dark"])}</div>')
    return f'''<div class="gh"><div class="file">README.md</div>{dn(hero_light, hero_dark)}
<p class="opener" align="center">🍒 hey 🥝 привіт 🍓 привет 🫐 konnichiwa 🍀</p>
<h3>visit tour</h3><div class="tour">{tour}</div>
<h3>this week, by the fleet</h3>{week}
<h3>stack</h3>{stack()}
<p class="contact">mail · linkedin · <a href="https://github.com/dvakatsiienko">@dvakatsiienko</a></p></div>'''

def pair(a, b, la, lb):
    return f'<div class="pair"><figure><figcaption>{la}</figcaption>{a}</figure><figure><figcaption>{lb}</figcaption>{b}</figure></div>'

def section(n, title, sub, body, notes):
    return f'<article class="take"><h2>{n} · {title} <small>{sub}</small></h2><div class="main">{body}</div><dl class="notes">{notes}</dl></article>'

def build():
    OUT.mkdir(exist_ok=True)
    for p in HERE.glob('hero-*.svg'):
        shutil.copy(p, OUT / p.name)
    files = {}
    for k in ('light', 'dark'):
        T = TH[k]
        files |= {f'board-{k}.svg': board(T), f'langs-{k}.svg': langs(T), f'lazy-{k}.svg': lazy(T),
                  f'tour-frame-{k}.svg': frame_icon(k), f'tour-bytes-{k}.svg': bytes_icon(k)}
    for name, text in files.items():
        (OUT / name).write_text(text)

    takes = [
      section('iii', 'the merge', 'final candidate — plate i\'s forest, plate ii\'s fire and aurora', mock(hero('merge', 'day'), hero('merge', 'night')),
        '<dt>composition</dt><dd>golden-ratio verticals at 306 and 496 px: sun or moon plus the campfire on the left one, the rex on the right one, looking left at both.</dd>'
        '<dt>from plate i</dt><dd>the ridges, the tiny far pines, sun and moon on their thread, ferns, stones, mushrooms, the foreground rock.</dd>'
        '<dt>from plate ii</dt><dd>the campfire with its ring and logs, a smoke curl by day, flames and a warm glow by night, the aurora, a short stone path to the fire.</dd>'
        '<dt>tag</dt><dd>paper sign on two threads, top left, no dot: «hey, welcome to my crafting place.»</dd>'
        '<dt>greeting</dt><dd>one centered line under the hero, <code>&lt;p align="center"&gt;</code>: github strips <code>style</code> but keeps <code>align</code> on <code>&lt;p&gt;</code>.</dd>'
        '<dt>stack icons</dt><dd>mono marks carry a fixed #6e7781 fill, not currentColor: inside a readme <code>&lt;img&gt;</code> currentColor renders black and vanishes on dark.</dd>'),
      section('i', 'the diorama, refined', 'plate i', pair(hero('diorama', 'day'), hero('diorama', 'night'), 'day · light theme', 'night · dark theme'),
        '<dt>changes</dt><dd>rex mirrored to look left and moved to the right golden line; sun and moon moved to the left golden line, drawn as before; near pines and the bush moved off the rex; the tag is the greeting.</dd>'),
      section('ii', 'the campfire, refined', 'plate ii', pair(hero('campfire', 'day'), hero('campfire', 'night'), 'morning · light theme', 'aurora · dark theme'),
        '<dt>changes</dt><dd>fog and mist gone in both; the aurora is four overlapping curtains, each a blurred tapered band plus a sharper hem, no vertical edges; fire on the left, rex on the right looking at it; the stone path now leads to the fire.</dd>'),
    ]
    page = (HERE / 'shell.html').read_text().replace('%TAKES%', '\n'.join(takes))
    (OUT / 'index.html').write_text(page)
    for n in sorted(files): print(f'{n:22} {len(files[n]) / 1024:6.1f} KB')

if __name__ == '__main__':
    build()
