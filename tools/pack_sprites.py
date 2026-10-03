#!/usr/bin/env python3
"""Rebuild images/sprites.png from the individual images in images/sprites/.

The rectangles the game uses are written out longhand in common.js, so this
reads them from there: every source image is pasted back into the rectangle the
code already points at. That keeps the coordinates valid, which the Rakefile
does not - sprite_factory repacks the whole sheet into a new layout and writes
the result to images/sprites.js, which nothing loads at runtime.
"""
import re, sys, os
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the repository root
APPLY = '--apply' in sys.argv

common = open(os.path.join(ROOT, 'common.js')).read()
block  = re.search(r'var SPRITES = \{(.*?)\n\};', common, re.S).group(1)
rects  = re.findall(r'^\s*([A-Z0-9_]+):\s*\{ x:\s*(\d+), y:\s*(\d+), w:\s*(\d+), h:\s*(\d+) \}',
                    block, re.M)

atlas = Image.open(os.path.join(ROOT, 'images/sprites.png')).convert('RGBA')
out   = atlas.copy()
ok = missing = wrong = 0

for name, x, y, w, h in rects:
    x, y, w, h = int(x), int(y), int(w), int(h)
    src = os.path.join(ROOT, 'images/sprites', name.lower() + '.png')
    if not os.path.exists(src):
        print(f'  no source for {name:24s} (rect {w}x{h}) - left as it was')
        missing += 1
        continue
    im = Image.open(src).convert('RGBA')
    if im.size != (w, h):
        print(f'  SIZE {name:24s} source {im.size[0]}x{im.size[1]} vs rect {w}x{h} - cropped')
        wrong += 1
        c = Image.new('RGBA', (w, h), (0, 0, 0, 0))
        c.paste(im.crop((0, 0, w, h)), (0, 0))
        im = c
    # clear the rectangle first: pasting straight over the old artwork leaves
    # the source's semi-transparent edge pixels blended with it, and every
    # repack would blend them again. Clearing makes the result exactly the
    # source file, and makes running this twice a no-op.
    out.paste(Image.new('RGBA', (w, h), (0, 0, 0, 0)), (x, y))
    out.paste(im, (x, y))
    ok += 1

print(f'\n{ok} pasted, {wrong} size mismatches, {missing} without a source')
if APPLY:
    out.save(os.path.join(ROOT, 'images/sprites.png'))
    print('images/sprites.png written', out.size)
else:
    print('(dry run - pass --apply to write)')
