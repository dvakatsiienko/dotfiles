# bakes Young Serif outlines into glyphs.json so the .ts generators letter text as plain paths
import json, pathlib, string
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

here = pathlib.Path(__file__).resolve().parent
font = TTFont(here / 'YoungSerif-Regular.ttf')
cmap, glyphs, metrics = font.getBestCmap(), font.getGlyphSet(), font['hmtx'].metrics
out = {}
for ch in string.ascii_letters + string.digits + " .,:;!?'-–—·←→&()/+%#@":
    name = cmap.get(ord(ch))
    if not name:
        continue
    pen = SVGPathPen(glyphs)
    glyphs[name].draw(TransformPen(pen, (1, 0, 0, -1, 0, 0)))
    out[ch] = {'d': pen.getCommands(), 'adv': metrics[name][0]}
data = {'unitsPerEm': font['head'].unitsPerEm, 'glyphs': out}
(here / 'glyphs.json').write_text(json.dumps(data, separators=(',', ':')))
print(len(out), 'glyphs')
