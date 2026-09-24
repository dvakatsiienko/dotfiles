import base64, io, json, pathlib, re, shutil, subprocess
from PIL import Image
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from tour import FRAMES, bytes_icon, frame_icon

HERE = pathlib.Path(__file__).resolve().parent
OUT = HERE / 'out'
README = OUT / 'readme'
GH = 'https://github.com/dvakatsiienko'

# ---------- inputs for redraw.ts: it draws the board and the cards, here and in the weekly action ----------
MONO_FACE = str(pathlib.Path.home() / 'Library/Fonts/Operator Mono %s Regular.otf')
AVATARS = dict(cclio='owl.png', coder='bulldog.png', reviewer='basset.png', verifier='../avatars/fleet/verifier/verifier-dalmatian-space.png')

def export_glyphs():
    faces, upm = {}, 0
    for w in ('Book', 'Medium'):
        font = TTFont(MONO_FACE % w); gs = font.getGlyphSet(); cmap = font.getBestCmap(); upm = font['head'].unitsPerEm
        faces[w] = {}
        for c in [chr(i) for i in range(32, 127)] + ['·']:
            pen = SVGPathPen(gs); gs[cmap[ord(c)]].draw(pen)
            faces[w][c] = [gs[cmap[ord(c)]].width, pen.getCommands()]
    (HERE / 'glyphs.json').write_text(json.dumps(dict(upm=upm, faces=faces), ensure_ascii=False, separators=(',', ':')))

def export_avatars():
    def uri(name):
        im = Image.open(HERE / name).convert('RGB').resize((72, 72), Image.LANCZOS)
        buf = io.BytesIO(); im.save(buf, 'PNG', optimize=True)
        return 'data:image/png;base64,' + base64.b64encode(buf.getvalue()).decode()
    (HERE / 'avatars.json').write_text(json.dumps({k: uri(v) for k, v in AVATARS.items()}, indent=1))

def panels(out, data):
    subprocess.run(['node', str(HERE / 'redraw.ts'), '--data', str(data), '--out', str(out)], check=True)

# ---------- stack: one grid of linked icons ----------
STACK = ('typescript swift react nextdotjs vite reactquery zustand jotai graphql prisma drizzle convex clerk betterauth vitest prettier '
         'biome nodedotjs bun pnpm turborepo homebrew tailwindcss shadcnui motion anthropic claude cursor neovim raycast linear '
         'vercel railway docker').split()
LABEL = dict(claude='claude code')
WIDE = {'jotai'}
HOME = dict(typescript='https://www.typescriptlang.org', react='https://react.dev', nextdotjs='https://nextjs.org', vite='https://vite.dev',
 reactquery='https://tanstack.com/query', graphql='https://graphql.org', prisma='https://www.prisma.io', drizzle='https://orm.drizzle.team',
 clerk='https://clerk.com', betterauth='https://www.better-auth.com', vitest='https://vitest.dev', prettier='https://prettier.io', biome='https://biomejs.dev',
 nodedotjs='https://nodejs.org', bun='https://bun.sh', pnpm='https://pnpm.io', tailwindcss='https://tailwindcss.com', shadcnui='https://ui.shadcn.com',
 neovim='https://neovim.io', claude='https://www.anthropic.com/claude-code', anthropic='https://www.anthropic.com', vercel='https://vercel.com', railway='https://railway.com', docker='https://www.docker.com',
 zustand='https://zustand.docs.pmnd.rs', jotai='https://jotai.org', swift='https://www.swift.org', convex='https://www.convex.dev',
 turborepo='https://turborepo.com', homebrew='https://brew.sh', motion='https://motion.dev', cursor='https://cursor.com',
 raycast='https://www.raycast.com', linear='https://linear.app')
NEUTRAL = dict(light='#1d2021', dark='#ebdbb2')

def lum(hex6):
    c = [int(hex6[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    c = [x / 12.92 if x <= .04045 else ((x + .055) / 1.055) ** 2.4 for x in c]
    return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]

def icon(n, k):
    v = (HERE / 'icons' / f'{n}.svg').read_text()
    hex6 = re.search(r'fill="#([0-9A-Fa-f]{6})"', v).group(1)
    if v.count('fill="#') == 1 and not .05 < lum(hex6) < .9: v = v.replace(f'fill="#{hex6}"', f'fill="{NEUTRAL[k]}"', 1)
    return re.sub(r'<title>.*?</title>', '', v)

def stack(k):
    cells = ''
    for n in STACK:
        v = icon(n, k).replace('<svg ', f'<svg width="{72 if n in WIDE else 28}" height="28" aria-hidden="true" ', 1)
        cells += f'<a class="ic{" wide" if n in WIDE else ""}" href="{HOME[n]}" title="{LABEL.get(n, n)}" aria-label="{LABEL.get(n, n)}">{v}</a>'
    return f'<div class="stack">{cells}</div>'

# ---------- the readme: every image a light/dark pair unless both themes draw the same ----------
FRUIT = '🍒 hey 🥝 привіт 🍓 привет 🫐 konnichiwa 🍀'
TOUR_TITLE = 'around the camp'
FRAME_TAKE = 'djinni'
TOURS = [('frame', lambda k: frame_icon(FRAME_TAKE, k)), ('bytes', bytes_icon)]
GAZETTE = f'{GH}/frame/tree/main/cclio/gazette'
COLS = 12

def picture(name, alt, width, light, dark=None):
    (README / 'assets' / f'{name}{"-light" if dark else ""}.svg').write_text(light)
    img = f'<img src="assets/{name}{"-light" if dark else ""}.svg" width="{width}" alt="{alt}">'
    if not dark: return img
    (README / 'assets' / f'{name}-dark.svg').write_text(dark)
    return f'<picture><source media="(prefers-color-scheme: dark)" srcset="assets/{name}-dark.svg">{img}</picture>'

def round_hero(svg, r=12):
    head, body = svg.split('>', 1)
    body = body.removesuffix('</svg>')
    return f'{head}><clipPath id="hero-round"><rect width="800" height="300" rx="{r}"/></clipPath><g clip-path="url(#hero-round)">{body}</g></svg>'

def cell(n, k):
    w = 80 if n in WIDE else 36
    inner = re.sub(r'<svg ', f'<svg x="4" y="4" width="{w - 8}" height="28" ', icon(n, k).replace(' xmlns="http://www.w3.org/2000/svg"', ''), count=1)
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} 36" width="{w}" height="36">{inner}</svg>'

def readme():
    shutil.rmtree(README, ignore_errors=True); (README / 'assets' / 'stack').mkdir(parents=True)
    for k, mode in (('light', 'day'), ('dark', 'night')):
        (README / 'assets' / f'hero-{k}.svg').write_text(round_hero((HERE / f'hero-grove-{mode}.svg').read_text()))
    hero = '<picture><source media="(prefers-color-scheme: dark)" srcset="assets/hero-dark.svg"><img src="assets/hero-light.svg" width="100%" alt="a paper-cut grove: a cabin, a campfire, a castle on the hill and a t-rex; a sign says hey, welcome to my crafting place"></picture>'
    tour = ' '.join(f'<a href="{GH}/{r}">{picture(f"tour-{r}", f"{r}", "49%", art("light"), art("dark"))}</a>' for r, art in TOURS)
    shutil.copy(HERE / 'fleet.json', README / 'assets' / 'fleet.json'); panels(README / 'assets', README / 'assets' / 'fleet.json')
    rows, row, used = [], '', 0
    for n in STACK:
        span = 2 if n in WIDE else 1
        if used + span > COLS: rows.append(row); row, used = '', 0
        light, dark = cell(n, 'light'), cell(n, 'dark')
        if light == dark:
            (README / 'assets' / 'stack' / f'{n}.svg').write_text(light); img = f'<img src="assets/stack/{n}.svg" alt="{LABEL.get(n, n)}">'
        else:
            for k, v in (('light', light), ('dark', dark)): (README / 'assets' / 'stack' / f'{n}-{k}.svg').write_text(v)
            img = f'<picture><source media="(prefers-color-scheme: dark)" srcset="assets/stack/{n}-dark.svg"><img src="assets/stack/{n}-light.svg" alt="{LABEL.get(n, n)}"></picture>'
        row += f'<a href="{HOME[n]}" title="{LABEL.get(n, n)}">{img}</a>'; used += span
    rows.append(row)
    stack_md = '<br>'.join(rows)
    (README / 'README.md').write_text(f'''{hero}

<p align="center">{FRUIT}</p>

### {TOUR_TITLE}

<p align="center">{tour}</p>

### [this week, by the fleet]({GAZETTE})

<img src="assets/board.svg" width="100%" alt="fleet board: this week's agent commits, tickets and skills">
<p align="center"><img src="assets/langs.svg" width="49%" alt="top languages"> <img src="assets/lazy.svg" width="49%" alt="commits by time of day"></p>

### stack

<p>{stack_md}</p>
''')

# ---------- the comp page ----------
def hero(scene, mode): return f'<img class="hero" src="hero-{scene}-{mode}.svg" width="800" height="300" alt="{scene} hero, {mode}">'
def dn(light, dark): return f'<div class="dn day">{light}</div><div class="dn night">{dark}</div>'

def mock(hero_light, hero_dark):
    tour = ' '.join(f'<a href="{GH}/{r}">{dn(art("light"), art("dark"))}</a>' for r, art in TOURS)
    week = (OUT / 'board.svg').read_text() + f'<div class="cards">{(OUT / "langs.svg").read_text()}{(OUT / "lazy.svg").read_text()}</div>'
    return f'''<div class="gh"><div class="file">README.md</div>{dn(hero_light, hero_dark)}
<p class="opener" align="center">{FRUIT}</p>
<h3>{TOUR_TITLE}</h3><div align="center" class="tour">{tour}</div>
<h3><a href="{GAZETTE}">this week, by the fleet</a></h3>{week}
<h3>stack</h3>{dn(stack('light'), stack('dark'))}</div>'''

def section(n, title, sub, body, notes):
    return f'<article class="take"><h2>{n} · {title} <small>{sub}</small></h2><div class="main">{body}</div><dl class="notes">{notes}</dl></article>'

def build():
    OUT.mkdir(exist_ok=True)
    if pathlib.Path(MONO_FACE % 'Book').exists(): export_glyphs(); export_avatars()
    for p in HERE.glob('hero-grove-*.svg'):
        shutil.copy(p, OUT / p.name)
    panels(OUT, HERE / 'fleet.json')
    files = {}
    for k in ('light', 'dark'):
        files |= {f'tour-bytes-{k}.svg': bytes_icon(k), f'tour-frame-{k}.svg': frame_icon(FRAME_TAKE, k)} | {f'tour-frame-{t}-{k}.svg': frame_icon(t, k) for t in FRAMES}
    for name, text in files.items():
        (OUT / name).write_text(text)
    readme()

    takes = [section('v', 'the readme', 'grove hero, final — one page, both themes', mock(hero('grove', 'day'), hero('grove', 'night')),
        '<dt>hero</dt><dd>grove, day and night, 800×300, one svg per theme.</dd>'
        '<dt>greeting</dt><dd>one centered line under the hero, <code>&lt;p align="center"&gt;</code>: github strips <code>style</code> but keeps <code>align</code> on <code>&lt;p&gt;</code>.</dd>'
        '<dt>fleet</dt><dd>board and cards are drawn by <code>redraw.ts</code> from <code>fleet.json</code> — here, and weekly in the profile repo\'s action.</dd>'
        '<dt>stack icons</dt><dd>brand hex from simple-icons; a black or white brand takes #1d2021 on light and #ebdbb2 on dark.</dd>')]
    page = (HERE / 'shell.html').read_text().replace('%TAKES%', '\n'.join(takes))
    (OUT / 'index.html').write_text(page)
    print(f'readme: {README / "README.md"}, {sum(1 for _ in (README / "assets").rglob("*.svg"))} svgs')

if __name__ == '__main__':
    build()
