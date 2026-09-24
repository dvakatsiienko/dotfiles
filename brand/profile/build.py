import base64, io, pathlib, re, shutil
from PIL import Image
import lettering
from fontTools.ttLib import TTFont
from lettering import outline, width
from tour import FRAMES, bytes_icon, frame_icon

HERE = pathlib.Path(__file__).resolve().parent
OUT = HERE / 'out'

# ---------- the shared blocks ----------

def avatar(name):
    im = Image.open(HERE / name).convert('RGB').resize((72, 72), Image.LANCZOS)
    buf = io.BytesIO(); im.save(buf, 'PNG', optimize=True)
    return 'data:image/png;base64,' + base64.b64encode(buf.getvalue()).decode()

ROWS = [('owl.png', 'cclio', 'coordinates', '23 tickets closed · 6 planned'), ('bulldog.png', 'coder', 'crafts', '290 commits · last FRM-258'),
        ('basset.png', 'reviewer', 'reviews', '5 prs · 3 findings'), ('../avatars/fleet/verifier/verifier-dalmatian-space.png', 'verifier', 'verifies', '4 rounds · 1 finding')]
SKILLS = sum(1 for p in (HERE.parents[1] / 'home/.claude/plugin-x/skills').iterdir() if p.is_dir())
FOOT = ['this week: ', ('290', ' agent commits · '), ('23', ' tickets · '), (str(SKILLS), ' skills in the kit')]

# the terminal panel stays gruvbox-dark in both themes; lettering is Operator Mono, seeded into lettering's font cache
MONO_FACE = str(pathlib.Path.home() / 'Library/Fonts/Operator Mono %s Regular.otf')
lettering.fonts |= {w: TTFont(MONO_FACE % w) for w in ('Book', 'Medium')}
GV = dict(panel='#282828', bar='#3c3836', mute='#665c54', aqua='#8ec07c', blue='#83a598', ink='#ebdbb2', dim='#a89984', red='#fb4934', yellow='#fabd2f', green='#b8bb26', pink='#d3869b')
STATE = dict(cclio=('idle', 'green'), coder=('working', 'yellow'), reviewer=('reviewing', 'pink'), verifier=('idle', 'green'))

def traffic(): return ''.join(f'<circle cx="{cx}" cy="15" r="5" fill="{GV[c]}"/>' for cx, c in ((20, 'red'), (38, 'yellow'), (56, 'green')))

def board():
    g = GV; rows = ''
    for n, (av, name, role, fact) in enumerate(ROWS):
        word, c = STATE[name]
        rows += f'''<g transform="translate(28 {46 + n * 58})"><clipPath id="av{n}"><rect width="44" height="44" rx="8"/></clipPath><image href="{avatar(av)}" width="44" height="44" clip-path="url(#av{n})"/>
{outline(name, 60, 19, 15, 'Medium', fill=g['ink'])}{outline(role, 60, 37, 13, 'Book', fill=g['dim'])}
<circle cx="276" cy="23" r="4.5" fill="{g[c]}"/>{outline(word, 288, 28, 14, 'Book', fill=g[c])}{outline(fact, 410, 28, 14, 'Book', fill=g['ink'])}</g>'''
    x = 44; foot = f'<path d="M28 294l6 6-6 6" fill="none" stroke="{g["green"]}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>'
    foot += outline(FOOT[0], x, 305, 14, 'Book', fill=g['dim']); x += width(FOOT[0], 14, 'Book')
    for num, text in FOOT[1:]:
        foot += outline(num, x, 305, 14, 'Medium', fill=g['ink']); x += width(num, 14, 'Medium')
        foot += outline(text, x, 305, 14, 'Book', fill=g['dim']); x += width(text, 14, 'Book')
    return f'''<svg xmlns="http://www.w3.org/2000/svg" class="board" viewBox="0 0 800 324" width="800" height="324" role="img" aria-label="fleet board, last seven days: cclio coordinates, coder crafts, reviewer reviews, verifier verifies">
<rect width="800" height="324" rx="10" fill="{g['panel']}"/><path d="M10 0h780a10 10 0 0 1 10 10v20H0V10A10 10 0 0 1 10 0z" fill="{g['bar']}"/>{traffic()}{outline('frame · fleet', 400, 20, 13, 'Book', 'middle', g['dim'])}
{rows}<rect x="0" y="278" width="800" height="1" fill="{g['bar']}"/>{foot}<rect x="{x + 6:.1f}" y="293" width="8" height="15" fill="{g['ink']}"/></svg>'''

def barcard(title, data, unit, top_fill, aria):
    g = GV; fmt = lambda v: f'{v}{unit}'
    lab_w = max(width(l, 13, 'Book') for l, _ in data)
    val_w = max(width(fmt(v), 13, 'Medium') for _, v in data)
    x0 = 20 + lab_w + 14
    span = 390 - 20 - val_w - 8 - x0
    mx = max(v for _, v in data); step = 22 if len(data) > 4 else 27; rows = ''
    for n, (lab, v) in enumerate(data):
        y = 46 + n * step; w = span * v / mx; top = v == mx
        rows += (f'<g><title>{lab}: {fmt(v)}</title>{outline(lab, 20, y + 11, 13, "Book", fill=g["ink"] if top else g["dim"])}'
                 f'<rect x="{x0:.1f}" y="{y}" width="{w:.1f}" height="14" rx="2" fill="{g[top_fill] if top else g["mute"]}"/>'
                 f'{outline(fmt(v), x0 + w + 8, y + 11, 13, "Medium" if top else "Book", fill=g["ink"] if top else g["dim"])}</g>')
    return f'''<svg xmlns="http://www.w3.org/2000/svg" class="card" viewBox="0 0 390 170" width="390" height="170" role="img" aria-label="{aria}">
<rect width="390" height="170" rx="10" fill="{g['panel']}"/><path d="M10 0h370a10 10 0 0 1 10 10v20H0V10A10 10 0 0 1 10 0z" fill="{g['bar']}"/>{traffic()}
{outline(title, 74, 20, 12, 'Book', fill=g['dim'])}{rows}</svg>'''

LANGS = [('typescript', 58.4), ('shell', 17.2), ('swift', 11.6), ('python', 7.9), ('css', 4.9)]
LAZY = [('morning', 372), ('daytime', 892), ('evening', 1383), ('night', 585)]
def langs(): return barcard('top langs', LANGS, '%', 'aqua', 'top languages: typescript 58.4, shell 17.2, swift 11.6, python 7.9, css 4.9 percent')
def lazy(): return barcard('laziness levels · commits by time of day', LAZY, '', 'blue', 'commits by time of day: morning 372, daytime 892, evening 1383, night 585')

# ---------- stack: one wrapping strip ----------
STACK = ('typescript react nextdotjs vite reactquery zustand jotai graphql prisma drizzle clerk betterauth vitest prettier '
         'biome nodedotjs bun pnpm tailwindcss shadcnui neovim claude anthropic vercel railway docker').split()
HOME = dict(typescript='https://www.typescriptlang.org', react='https://react.dev', nextdotjs='https://nextjs.org', vite='https://vite.dev',
 reactquery='https://tanstack.com/query', graphql='https://graphql.org', prisma='https://www.prisma.io', drizzle='https://orm.drizzle.team',
 clerk='https://clerk.com', betterauth='https://www.better-auth.com', vitest='https://vitest.dev', prettier='https://prettier.io', biome='https://biomejs.dev',
 nodedotjs='https://nodejs.org', bun='https://bun.sh', pnpm='https://pnpm.io', tailwindcss='https://tailwindcss.com', shadcnui='https://ui.shadcn.com',
 neovim='https://neovim.io', claude='https://claude.ai', anthropic='https://www.anthropic.com', vercel='https://vercel.com', railway='https://railway.com', docker='https://www.docker.com',
 zustand='https://zustand.docs.pmnd.rs', jotai='https://jotai.org')
NEUTRAL = dict(light='#1d2021', dark='#ebdbb2')

def lum(hex6):
    c = [int(hex6[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    c = [x / 12.92 if x <= .04045 else ((x + .055) / 1.055) ** 2.4 for x in c]
    return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]

def stack(k):
    cells = ''
    for n in STACK:
        v = (HERE / 'icons' / f'{n}.svg').read_text()
        hex6 = re.search(r'fill="#([0-9A-Fa-f]{6})"', v).group(1)
        if not .05 < lum(hex6) < .9: v = v.replace(f'fill="#{hex6}"', f'fill="{NEUTRAL[k]}"', 1)
        v = re.sub(r'<title>.*?</title>', '', v).replace('<svg ', '<svg width="28" height="28" aria-hidden="true" ', 1)
        cells += f'<a class="ic" href="{HOME[n]}" title="{n}" aria-label="{n}">{v}</a>'
    return f'<div class="stack">{cells}</div>'

# ---------- the comp page ----------
def hero(scene, mode): return f'<img class="hero" src="hero-{scene}-{mode}.svg" width="800" height="300" alt="{scene} hero, {mode}">'
def dn(light, dark): return f'<div class="dn day">{light}</div><div class="dn night">{dark}</div>'

TOUR_TITLE = 'around the camp'
FRAME_TAKE = 'lantern'

def tile(repo, art, cap):
    url = f'https://github.com/dvakatsiienko/{repo}'
    return f'<figure><a href="{url}">{art}</a><figcaption><a href="{url}">{repo}</a> — {cap}</figcaption></figure>'

def mock(hero_light, hero_dark):
    tour = (tile('frame', dn(frame_icon(FRAME_TAKE, 'light'), frame_icon(FRAME_TAKE, 'dark')), 'the machine as data')
            + tile('bytes', dn(bytes_icon('light'), bytes_icon('dark')), 'the apps'))
    picks = ''.join(f'<figure>{dn(frame_icon(t, "light"), frame_icon(t, "dark"))}<figcaption>{"abc"[i]} · {t}</figcaption></figure>' for i, t in enumerate(FRAMES))
    week = board() + f'<div class="cards">{langs()}{lazy()}</div>'
    return f'''<div class="gh"><div class="file">README.md</div>{dn(hero_light, hero_dark)}
<p class="opener" align="center">🍒 hey 🥝 привіт 🍓 привет 🫐 konnichiwa 🍀</p>
<h3>{TOUR_TITLE}</h3><div class="tour">{tour}</div>
<p class="picks">frame, three takes — pick one</p><div class="tour">{picks}</div>
<h3>this week, by the fleet</h3>{week}
<h3>stack</h3>{dn(stack('light'), stack('dark'))}</div>'''

def section(n, title, sub, body, notes):
    return f'<article class="take"><h2>{n} · {title} <small>{sub}</small></h2><div class="main">{body}</div><dl class="notes">{notes}</dl></article>'

def build():
    OUT.mkdir(exist_ok=True)
    for p in HERE.glob('hero-grove-*.svg'):
        shutil.copy(p, OUT / p.name)
    files = {}
    for k in ('light', 'dark'):
        files |= {f'board-{k}.svg': board(), f'langs-{k}.svg': langs(), f'lazy-{k}.svg': lazy(),
                  f'tour-bytes-{k}.svg': bytes_icon(k)} | {f'tour-frame-{t}-{k}.svg': frame_icon(t, k) for t in FRAMES}
    for name, text in files.items():
        (OUT / name).write_text(text)

    takes = [section('v', 'the readme', 'grove hero, final — one page, both themes', mock(hero('grove', 'day'), hero('grove', 'night')),
        '<dt>hero</dt><dd>grove, day and night, 800×300, one svg per theme.</dd>'
        '<dt>tag</dt><dd>paper sign on two threads, top left, no dot: «hey, welcome to my crafting place»</dd>'
        '<dt>greeting</dt><dd>one centered line under the hero, <code>&lt;p align="center"&gt;</code>: github strips <code>style</code> but keeps <code>align</code> on <code>&lt;p&gt;</code>.</dd>'
        '<dt>fleet</dt><dd>board and both cards are gruvbox terminals, dark in both themes; lettering is Operator Mono outlined to paths.</dd>'
        '<dt>stack icons</dt><dd>a 12 × 2 grid of 36 px cells; brand hex from simple-icons; a black or white brand takes #1d2021 on light and #ebdbb2 on dark, one svg per theme, since currentColor renders black inside a readme <code>&lt;img&gt;</code>.</dd>')]
    page = (HERE / 'shell.html').read_text().replace('%TAKES%', '\n'.join(takes))
    (OUT / 'index.html').write_text(page)
    for n in sorted(files): print(f'{n:22} {len(files[n]) / 1024:6.1f} KB')

if __name__ == '__main__':
    build()
