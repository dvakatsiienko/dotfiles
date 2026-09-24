import pathlib
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

FONT = str(pathlib.Path.home() / 'Library/Fonts/TypeType - TT Commons %s.otf')
fonts = {}

def _font(w):
    f = fonts.get(w)
    if not f:
        f = fonts[w] = TTFont(FONT % w)
    return f, f.getGlyphSet(), f.getBestCmap(), f['head'].unitsPerEm

def width(text, size, w='Bold', ls=0):
    _, gs, cmap, upm = _font(w)
    return sum(gs[cmap.get(ord(c), 'space')].width * size / upm + ls for c in text) - ls

def outline(text, x, y, size, w='Bold', anchor='start', fill='currentColor', ls=0, extra=''):
    _, gs, cmap, upm = _font(w)
    s = size / upm
    total = width(text, size, w, ls)
    cx = x - (total if anchor == 'end' else total / 2 if anchor == 'middle' else 0)
    pen = SVGPathPen(gs)
    for c in text:
        g = cmap.get(ord(c), 'space')
        gs[g].draw(TransformPen(pen, (s, 0, 0, -s, cx, y)))
        cx += gs[g].width * s + ls
    return f'<path fill="{fill}" {extra} d="{pen.getCommands()}"/>'

