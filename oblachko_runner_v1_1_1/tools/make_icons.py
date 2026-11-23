from PIL import Image, ImageDraw, ImageFilter
import math
import os, sys
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
A = os.path.join(ROOT, 'assets') + '/'
hero = Image.open(sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'assets', 'icon_hero_render.png')).convert('RGBA')
def bg(size):
    im = Image.new('RGBA', (size, size))
    px = im.load(); c0 = (86, 199, 182); c1 = (31, 112, 108)
    for y in range(size):
        for x in range(size):
            d = min(1, math.hypot(x - size * 0.42, y - size * 0.34) / (size * 0.85))
            px[x, y] = tuple(int(c0[i] + (c1[i] - c0[i]) * d) for i in range(3)) + (255,)
    # soft sun rays
    rays = Image.new('L', (size, size), 0); dr = ImageDraw.Draw(rays)
    cx, cy = size * 0.42, size * 0.34
    for k in range(14):
        a = k * math.pi * 2 / 14
        dr.polygon([(cx, cy), (cx + math.cos(a - 0.09) * size * 1.2, cy + math.sin(a - 0.09) * size * 1.2), (cx + math.cos(a + 0.09) * size * 1.2, cy + math.sin(a + 0.09) * size * 1.2)], fill=26)
    rays = rays.filter(ImageFilter.GaussianBlur(size / 60))
    white = Image.new('RGBA', (size, size), (255, 255, 240, 255))
    im = Image.composite(white, im, rays)
    return im
def shadowed(h, size):
    sh = Image.new('RGBA', h.size, (0, 0, 0, 0)); a = h.split()[3].point(lambda v: v * 0.35)
    sh.putalpha(a); sh = sh.filter(ImageFilter.GaussianBlur(size / 80))
    out = Image.new('RGBA', h.size, (0, 0, 0, 0)); out.alpha_composite(sh, (int(size * 0.012), int(size * 0.02))); out.alpha_composite(h)
    return out
S = 1024
b = bg(S)
b.convert('RGB').save(A + 'icon-background.png')
full = b.copy(); full.alpha_composite(shadowed(hero, S)); full.convert('RGB').save(A + 'icon-only.png')
# adaptive icon foreground: keep the lamb inside the 66% safe zone
fg = Image.new('RGBA', (S, S), (0, 0, 0, 0)); k = 0.74
hs = shadowed(hero, S).resize((int(S * k), int(S * k)), Image.LANCZOS)
fg.alpha_composite(hs, ((S - hs.width) // 2, S - hs.height))
fg.save(A + 'icon-foreground.png')
# splash screens: rounded icon on cream / dark
for name, col in (('splash.png', (246, 234, 210)), ('splash-dark.png', (30, 52, 49))):
    sp = Image.new('RGBA', (2732, 2732), col + (255,))
    ic = full.resize((760, 760), Image.LANCZOS)
    m = Image.new('L', ic.size, 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, 759, 759), 170, fill=255)
    sp.paste(ic, ((2732 - 760) // 2, (2732 - 760) // 2), m)
    sp.convert('RGB').save(A + name)
# preview
pv = Image.new('RGB', (1100, 380), (240, 240, 235))
pv.paste(full.resize((340, 340)).convert('RGB'), (20, 20))
c = b.resize((340, 340)); c.alpha_composite(fg.resize((340, 340))); m = Image.new('L', (340, 340), 0); ImageDraw.Draw(m).ellipse((0, 0, 339, 339), fill=255); pv.paste(c.convert('RGB'), (380, 20), m)
for i, s in enumerate((96, 48)):
    pv.paste(full.resize((s, s), Image.LANCZOS).convert('RGB'), (760 + i * 130, 20))
pv.save(os.path.join(ROOT, 'assets', 'icon_preview.png'))
