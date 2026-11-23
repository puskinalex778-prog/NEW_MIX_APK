#!/usr/bin/env python3
"""
Генератор иллюстраций для Хранитоникс и Хранитоникс Бокс.

Собирает сцены из готовых персонажей (res/drawable-nodpi/char_*.webp) и рисует:
  • баннеры сцен (scene_*.webp) — онбординг, награды, инструкция, правила;
  • медали достижений (badge_*.webp);
  • картинки шагов инструкции (guide_*.webp, box_guide_*.webp) — телефоны-макеты;
  • героя Бокса (box_hero.webp) и аватары детей в Боксе.

Запуск из корня репозитория:
    python3 graphics-src/scenes.py
"""
import math
import os
import random

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
APP_RES = os.path.join(ROOT, "app/src/main/res/drawable-nodpi")
BOX_RES = os.path.join(ROOT, "box/src/main/res/drawable-nodpi")

EMOJI_FONT = "/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf"
BOLD_FONT = "/usr/share/fonts/opentype/inter/Inter-ExtraBold.otf"
MONO_FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf"

random.seed(7)


# ------------------------------------------------------------------ helpers
def char(name, mood, size):
    im = Image.open(os.path.join(APP_RES, f"char_{name}_{mood}.webp")).convert("RGBA")
    return im.resize((size, size), Image.LANCZOS)


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(len(a)))


def vgradient(w, h, top, bottom):
    g = Image.new("RGBA", (w, h))
    d = ImageDraw.Draw(g)
    for y in range(h):
        d.line([(0, y), (w, y)], fill=lerp(top, bottom, y / max(1, h - 1)) + (255,))
    return g


def dgradient(w, h, c1, c2):
    """Диагональный градиент."""
    g = Image.new("RGBA", (w, h))
    px = g.load()
    for y in range(h):
        for x in range(0, w):
            t = (x / w * 0.55 + y / h * 0.45)
            px[x, y] = lerp(c1, c2, t) + (255,)
    return g


def rounded_mask(w, h, r):
    m = Image.new("L", (w, h), 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, w - 1, h - 1], r, fill=255)
    return m


def shadow(im, offset=(0, 14), blur=18, alpha=90):
    a = im.split()[-1]
    sh = Image.new("RGBA", im.size, (20, 20, 50, 0))
    sh.putalpha(a.point(lambda v: v * alpha // 255))
    pad = blur * 3
    big = Image.new("RGBA", (im.width + pad * 2, im.height + pad * 2), (0, 0, 0, 0))
    big.paste(sh, (pad + offset[0], pad + offset[1]), sh)
    return big.filter(ImageFilter.GaussianBlur(blur)), pad


def paste_with_shadow(base, im, xy, blur=16, alpha=80, offset=(0, 12)):
    sh, pad = shadow(im, offset, blur, alpha)
    base.alpha_composite(sh, (xy[0] - pad, xy[1] - pad))
    base.alpha_composite(im, xy)


_emoji_cache = {}


def emoji(ch, size):
    key = (ch, size)
    if key in _emoji_cache:
        return _emoji_cache[key]
    f = ImageFont.truetype(EMOJI_FONT, 109)
    im = Image.new("RGBA", (160, 160), (0, 0, 0, 0))
    ImageDraw.Draw(im).text((80, 80), ch, font=f, embedded_color=True, anchor="mm")
    bbox = im.getbbox() or (0, 0, 160, 160)
    im = im.crop(bbox)
    s = size / max(im.width, im.height)
    im = im.resize((max(1, int(im.width * s)), max(1, int(im.height * s))), Image.LANCZOS)
    _emoji_cache[key] = im
    return im


def paste_center(base, im, cx, cy):
    base.alpha_composite(im, (int(cx - im.width / 2), int(cy - im.height / 2)))


def sparkles(d, w, h, n, color=(255, 255, 255), rmax=5):
    for _ in range(n):
        x, y = random.randint(0, w), random.randint(0, h)
        r = random.randint(1, rmax)
        a = random.randint(90, 220)
        d.ellipse([x - r, y - r, x + r, y + r], fill=color + (a,))


def bubbles(base, n, colors, rmin=30, rmax=120):
    lay = Image.new("RGBA", base.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    for _ in range(n):
        x, y = random.randint(-40, base.width + 40), random.randint(-40, base.height + 40)
        r = random.randint(rmin, rmax)
        c = random.choice(colors)
        d.ellipse([x - r, y - r, x + r, y + r], fill=c + (random.randint(28, 60),))
    base.alpha_composite(lay.filter(ImageFilter.GaussianBlur(2)))


def round_card(im, r):
    out = Image.new("RGBA", im.size, (0, 0, 0, 0))
    out.paste(im, (0, 0), rounded_mask(im.width, im.height, r))
    return out


def save(im, folder, name, q=88):
    os.makedirs(folder, exist_ok=True)
    p = os.path.join(folder, name + ".webp")
    im.save(p, "WEBP", quality=q, method=6)
    print("  ", os.path.relpath(p, ROOT), im.size, os.path.getsize(p) // 1024, "KB")


# ------------------------------------------------------------------ сцены
PALETTES = {
    "welcome": ((108, 92, 231), (0, 184, 212)),
    "rules": ((255, 138, 101), (255, 64, 129)),
    "rewards": ((255, 179, 0), (255, 112, 67)),
    "guide": ((0, 150, 136), (63, 81, 181)),
    "apps": ((94, 53, 177), (236, 64, 122)),
    "night": ((26, 35, 126), (74, 20, 140)),
}


def hill(base, color, y0, amp, phase):
    d = ImageDraw.Draw(base)
    w, h = base.size
    pts = [(0, h)]
    for x in range(0, w + 10, 10):
        pts.append((x, y0 + amp * math.sin(x / w * math.pi * 2 + phase)))
    pts.append((w, h))
    d.polygon(pts, fill=color)


def scene(name, chars, props, w=1200, h=640):
    c1, c2 = PALETTES[name]
    base = dgradient(w, h, c1, c2)
    bubbles(base, 14, [(255, 255, 255)], 40, 160)
    d = ImageDraw.Draw(base, "RGBA")
    sparkles(d, w, h // 2, 60)
    if name == "night":
        for _ in range(40):
            x, y = random.randint(0, w), random.randint(0, h // 2)
            d.ellipse([x - 2, y - 2, x + 2, y + 2], fill=(255, 255, 255, 220))
        d.ellipse([w - 230, 50, w - 110, 170], fill=(255, 245, 200, 255))
        d.ellipse([w - 200, 35, w - 90, 145], fill=c1 + (255,))
    hill(base, (255, 255, 255, 70), h * 0.78, 18, 0.5)
    hill(base, (255, 255, 255, 120), h * 0.86, 12, 2.0)
    # реквизит
    for (ch, size, x, y, rot) in props:
        e = emoji(ch, size)
        if rot:
            e = e.rotate(rot, resample=Image.BICUBIC, expand=True)
        paste_with_shadow(base, e, (int(x - e.width / 2), int(y - e.height / 2)), blur=10, alpha=60, offset=(0, 8))
    # персонажи
    n = len(chars)
    size = int(h * (0.72 if n <= 2 else 0.62))
    gap = w / (n + 1)
    for i, (nm, mood) in enumerate(chars):
        im = char(nm, mood, size)
        x = int(gap * (i + 1) - size / 2)
        y = int(h - size - h * 0.02 + (12 if i % 2 else 0))
        paste_with_shadow(base, im, (x, y), blur=14, alpha=70)
    return round_card(base, 48)


# ------------------------------------------------------------------ медали
BADGES = {
    "first": ("🚀", (124, 77, 255), (0, 176, 255)),
    "balance": ("⚖️", (0, 200, 83), (0, 150, 136)),
    "week": ("🏆", (255, 193, 7), (255, 111, 0)),
    "breaks": ("🧘", (0, 188, 212), (63, 81, 181)),
    "charge": ("🔋", (118, 255, 3), (0, 150, 136)),
    "codes": ("🔑", (255, 64, 129), (156, 39, 176)),
    "night": ("🌙", (63, 81, 181), (26, 35, 126)),
    "streak": ("🔥", (255, 87, 34), (213, 0, 0)),
}


def badge(icon, c1, c2, S=320):
    im = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    # ленточки
    rib = (S * 0.30, S * 0.62)
    for sx, col in ((-1, lerp(c1, (255, 255, 255), 0.0)), (1, c2)):
        cx = S / 2 + sx * S * 0.14
        pts = [(cx - 26, rib[1]), (cx + 26, rib[1]), (cx + 26 + sx * 10, S - 10), (cx + sx * 10, S - 40), (cx - 26 + sx * 10, S - 10)]
        d.polygon(pts, fill=col + (255,))
    # звезда-зубчатый край
    cx, cy, R = S / 2, S * 0.44, S * 0.40
    pts = []
    for i in range(48):
        a = i / 48 * math.pi * 2
        r = R if i % 2 == 0 else R * 0.92
        pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    d.polygon(pts, fill=(255, 214, 0, 255))
    inner = dgradient(int(R * 1.64), int(R * 1.64), c1, c2)
    m = Image.new("L", inner.size, 0)
    ImageDraw.Draw(m).ellipse([0, 0, inner.width - 1, inner.height - 1], fill=255)
    im.paste(inner, (int(cx - inner.width / 2), int(cy - inner.height / 2)), m)
    d = ImageDraw.Draw(im, "RGBA")
    # блик
    gl = Image.new("RGBA", im.size, (0, 0, 0, 0))
    ImageDraw.Draw(gl).ellipse([cx - R * 0.62, cy - R * 0.74, cx + R * 0.30, cy - R * 0.28], fill=(255, 255, 255, 38))
    im.alpha_composite(gl.filter(ImageFilter.GaussianBlur(6)))
    d.ellipse([cx - R * 0.82, cy - R * 0.82, cx + R * 0.82, cy + R * 0.82], outline=(255, 255, 255, 160), width=5)
    e = emoji(icon, int(R * 0.95))
    paste_center(im, e, cx, cy + 4)
    return im


# ------------------------------------------------------------------ телефоны
def phone(w, h, screen_top, screen_bottom, content):
    """Макет телефона: content(draw_layer, sw, sh) рисует экран."""
    ph = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(ph)
    d.rounded_rectangle([0, 0, w - 1, h - 1], int(w * 0.16), fill=(30, 32, 48, 255))
    m = int(w * 0.045)
    sw, sh = w - 2 * m, h - 2 * m
    scr = vgradient(sw, sh, screen_top, screen_bottom)
    content(scr, sw, sh)
    ph.paste(scr, (m, m), rounded_mask(sw, sh, int(w * 0.12)))
    d = ImageDraw.Draw(ph)
    d.rounded_rectangle([w * 0.38, m + 10, w * 0.62, m + 26], 8, fill=(30, 32, 48, 255))
    return ph


def bar(d, x, y, w, h, col, r=None):
    d.rounded_rectangle([x, y, x + w, y + h], r if r is not None else h // 2, fill=col)


def text(d, xy, s, size, col, font=BOLD_FONT, anchor="mm"):
    d.text(xy, s, font=ImageFont.truetype(font, size), fill=col, anchor=anchor)


def screen_icon(icon, rows=3, accent=(124, 77, 255), extra=None):
    def f(scr, sw, sh):
        d = ImageDraw.Draw(scr, "RGBA")
        bar(d, sw * 0.1, sh * 0.08, sw * 0.8, sh * 0.06, accent + (255,), 18)
        e = emoji(icon, int(sw * 0.42))
        paste_center(scr, e, sw / 2, sh * 0.34)
        y = sh * 0.56
        for i in range(rows):
            bar(d, sw * 0.12, y, sw * 0.76, sh * 0.065, (255, 255, 255, 235), 18)
            bar(d, sw * 0.17, y + sh * 0.02, sw * (0.25 + 0.12 * (i % 3)), sh * 0.025, (180, 186, 210, 255), 8)
            d.ellipse([sw * 0.74, y + sh * 0.012, sw * 0.74 + sh * 0.04, y + sh * 0.052], fill=accent + (255,))
            y += sh * 0.09
        if extra:
            extra(scr, sw, sh, d)
    return f


def guide_card(name, c1, c2, phone_fn, chname, mood, step=None, phone2_fn=None, arrow=False, W=1000, H=560):
    base = dgradient(W, H, c1, c2)
    bubbles(base, 10, [(255, 255, 255)], 30, 130)
    d = ImageDraw.Draw(base, "RGBA")
    sparkles(d, W, H, 40)
    pw, ph_ = int(H * 0.50), int(H * 0.92)
    p1 = phone(pw, ph_, (248, 249, 255), (232, 236, 255), phone_fn)
    if phone2_fn:
        p2 = phone(pw, ph_, (240, 255, 250), (220, 245, 238), phone2_fn)
        x1 = int(W * 0.05) if step is None else int(W * 0.12)
        gap = int(W * 0.12)
        paste_with_shadow(base, p1, (x1, int(H * 0.04)))
        paste_with_shadow(base, p2, (x1 + pw + gap, int(H * 0.04)))
        if arrow:
            ax = x1 + pw + 14
            ay = H * 0.48
            d.rounded_rectangle([ax, ay - 12, ax + gap - 40, ay + 12], 12, fill=(255, 255, 255, 230))
            d.polygon([(ax + gap - 52, ay - 30), (ax + gap - 22, ay), (ax + gap - 52, ay + 30)], fill=(255, 255, 255, 240))
        cs = int(H * 0.58)
        paste_with_shadow(base, char(chname, mood, cs), (int(W - cs * 0.98), int(H - cs)), alpha=70)
    else:
        paste_with_shadow(base, p1, (int(W * 0.12), int(H * 0.04)))
        cs = int(H * 0.86)
        paste_with_shadow(base, char(chname, mood, cs), (int(W * 0.50), int(H - cs)), alpha=70)
    if step is not None:
        d = ImageDraw.Draw(base, "RGBA")
        d.ellipse([22, 22, 112, 112], fill=(255, 255, 255, 240))
        text(d, (67, 69), str(step), 52, c1 + (255,))
    return round_card(base, 44)


def code_screen(code, accent):
    def extra(scr, sw, sh, d):
        bar(d, sw * 0.08, sh * 0.46, sw * 0.84, sh * 0.11, (255, 255, 255, 255), 22)
        text(d, (sw / 2, sh * 0.515), code, int(sw * 0.105), accent + (255,), MONO_FONT)
    return extra


def key_screen(accent):
    def extra(scr, sw, sh, d):
        bar(d, sw * 0.06, sh * 0.46, sw * 0.88, sh * 0.10, (255, 255, 255, 255), 22)
        text(d, (sw / 2, sh * 0.51), "1RWS-HA1M-Y0QV-T99Q-Q", int(sw * 0.052), accent + (255,), MONO_FONT)
    return extra


def ring_screen(accent):
    def f(scr, sw, sh):
        d = ImageDraw.Draw(scr, "RGBA")
        bar(d, sw * 0.1, sh * 0.08, sw * 0.8, sh * 0.06, accent + (255,), 18)
        cx, cy, r = sw / 2, sh * 0.36, sw * 0.27
        d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=(220, 224, 240, 255), width=int(sw * 0.07))
        d.arc([cx - r, cy - r, cx + r, cy + r], -90, 160, fill=accent + (255,), width=int(sw * 0.07))
        text(d, (cx, cy), "40", int(sw * 0.16), (40, 44, 70, 255))
        y = sh * 0.62
        for i, ic in enumerate(["📱", "🎮", "📺"]):
            bar(d, sw * 0.1, y, sw * 0.8, sh * 0.075, (255, 255, 255, 240), 18)
            paste_center(scr, emoji(ic, int(sh * 0.05)), sw * 0.2, y + sh * 0.037)
            bar(d, sw * 0.3, y + sh * 0.028, sw * (0.45 - 0.1 * i), sh * 0.02, accent + (200,), 6)
            y += sh * 0.1
    return f


def apps_screen(accent):
    def f(scr, sw, sh):
        d = ImageDraw.Draw(scr, "RGBA")
        bar(d, sw * 0.1, sh * 0.08, sw * 0.8, sh * 0.06, accent + (255,), 18)
        icons = ["📞", "💬", "📚", "🗺️", "🎵", "📷"]
        y = sh * 0.2
        for i, ic in enumerate(icons):
            bar(d, sw * 0.08, y, sw * 0.84, sh * 0.1, (255, 255, 255, 240), 20)
            paste_center(scr, emoji(ic, int(sh * 0.06)), sw * 0.2, y + sh * 0.05)
            bar(d, sw * 0.32, y + sh * 0.04, sw * 0.3, sh * 0.022, (180, 186, 210, 255), 6)
            ok = i < 4
            col = (0, 200, 83, 255) if ok else (220, 224, 240, 255)
            d.rounded_rectangle([sw * 0.72, y + sh * 0.03, sw * 0.86, y + sh * 0.07], 14, fill=col)
            d.ellipse([sw * (0.80 if ok else 0.72), y + sh * 0.026, sw * (0.86 if ok else 0.78), y + sh * 0.074], fill=(255, 255, 255, 255))
            y += sh * 0.125
    return f


def lock_screen(icon, accent):
    def f(scr, sw, sh):
        d = ImageDraw.Draw(scr, "RGBA")
        d.rectangle([0, 0, sw, sh], fill=(28, 30, 52, 255))
        paste_center(scr, emoji(icon, int(sw * 0.46)), sw / 2, sh * 0.33)
        text(d, (sw / 2, sh * 0.58), "04:59", int(sw * 0.17), (255, 255, 255, 255))
        bar(d, sw * 0.12, sh * 0.72, sw * 0.76, sh * 0.07, accent + (255,), 20)
        bar(d, sw * 0.12, sh * 0.82, sw * 0.76, sh * 0.07, (255, 255, 255, 40), 20)
    return f


def main():
    os.makedirs(BOX_RES, exist_ok=True)
    print("Сцены:")
    save(scene("welcome", [("sema", "happy"), ("timma", "happy"), ("olezhka", "happy"), ("hroni", "happy")],
               [("⭐", 60, 140, 110, -10), ("☁️", 110, 980, 120, 0), ("🎈", 90, 1090, 260, 8)]), APP_RES, "scene_welcome")
    save(scene("rewards", [("timma", "happy"), ("sema", "charged")],
               [("🏆", 190, 600, 210, 0), ("⭐", 70, 470, 120, -12), ("⭐", 60, 740, 110, 14), ("🎉", 90, 1080, 140, 0), ("🥇", 90, 120, 150, -8)]), APP_RES, "scene_rewards")
    save(scene("guide", [("hroni", "happy"), ("olezhka", "happy")],
               [("📖", 160, 600, 220, -6), ("💡", 80, 140, 130, 0), ("✅", 70, 1060, 140, 8)]), APP_RES, "scene_guide")
    save(scene("rules", [("sema", "break"), ("hroni", "stop")],
               [("⏰", 170, 600, 220, 6), ("📵", 80, 140, 140, -8), ("☕", 80, 1070, 160, 0)]), APP_RES, "scene_rules")
    save(scene("apps", [("olezhka", "gamer"), ("timma", "gamer")],
               [("📱", 170, 600, 230, -6), ("🎮", 80, 130, 140, 0), ("📺", 80, 1070, 150, 8)]), APP_RES, "scene_apps")
    save(scene("night", [("sema", "sleep"), ("hroni", "sleep")],
               [("💤", 90, 600, 200, 0), ("⭐", 50, 400, 120, 0)]), APP_RES, "scene_night")

    print("Медали:")
    for k, (ic, c1, c2) in BADGES.items():
        save(badge(ic, c1, c2), APP_RES, f"badge_{k}", 92)

    print("Инструкция (Хранитоникс):")
    V, T, O, P, B = (124, 77, 255), (0, 150, 136), (255, 112, 67), (236, 64, 122), (63, 81, 181)
    save(guide_card("g1", (124, 77, 255), (0, 176, 255), screen_icon("🔐", 3, V), "hroni", "happy", 1), APP_RES, "guide_1")
    save(guide_card("g2", (0, 150, 136), (0, 200, 83), screen_icon("✅", 4, T), "sema", "charged", 2), APP_RES, "guide_2")
    save(guide_card("g3", (255, 112, 67), (255, 64, 129), ring_screen(O), "timma", "break", 3), APP_RES, "guide_3")
    save(guide_card("g4", (94, 53, 177), (236, 64, 122), apps_screen(P), "olezhka", "happy", 4), APP_RES, "guide_4")
    save(guide_card("g5", (63, 81, 181), (0, 188, 212), lock_screen("⏸️", B), "hroni", "stop", 5), APP_RES, "guide_5")
    save(guide_card("g6", (0, 137, 123), (63, 81, 181), screen_icon("🔗", 0, T, key_screen(T)), "sema", "happy", 6,
                    screen_icon("🔗", 0, T, key_screen(T)), arrow=True), APP_RES, "guide_6")

    print("Бокс:")
    save(guide_card("hero", (0, 137, 123), (0, 188, 212), screen_icon("🎁", 0, T, code_screen("389-876-082", T)), "hroni", "happy", None,
                    lock_screen("⏸️", T), arrow=True, W=1200, H=600), BOX_RES, "box_hero")
    save(guide_card("b1", (0, 150, 136), (0, 200, 83), screen_icon("⚙️", 3, T), "sema", "happy", 1), BOX_RES, "box_guide_1")
    save(guide_card("b2", (63, 81, 181), (0, 188, 212), screen_icon("🔗", 0, B, key_screen(B)), "timma", "happy", 2,
                    screen_icon("🔗", 0, B, key_screen(B)), arrow=True), BOX_RES, "box_guide_2")
    save(guide_card("b3", (255, 112, 67), (255, 179, 0), screen_icon("⏱️", 0, O, code_screen("389-876-082", O)), "olezhka", "happy", 3), BOX_RES, "box_guide_3")
    save(guide_card("b4", (124, 77, 255), (236, 64, 122), screen_icon("💬", 0, V, code_screen("389-876-082", V)), "hroni", "happy", 4,
                    lock_screen("🔓", V), arrow=True), BOX_RES, "box_guide_4")
    save(guide_card("b5", (26, 35, 126), (74, 20, 140), lock_screen("🌙", B), "sema", "sleep", 5), BOX_RES, "box_guide_5")
    save(badge("👨‍👩‍👧", (0, 150, 136), (0, 188, 212)), BOX_RES, "box_family", 92)

    print("Аватары детей в Боксе:")
    for nm in ("sema", "timma", "olezhka", "hroni"):
        for mood in ("happy", "gamer", "sleep"):
            im = char(nm, mood, 384)
            save(im, BOX_RES, f"char_{nm}_{mood}", 86)

    # витрина для README
    sheet_files = ["scene_welcome", "scene_rewards", "scene_guide", "scene_rules", "scene_apps", "scene_night"]
    sheet = Image.new("RGBA", (1200 * 2 + 30, 640 * 3 + 40), (245, 246, 251, 255))
    for i, n in enumerate(sheet_files):
        im = Image.open(os.path.join(APP_RES, n + ".webp")).convert("RGBA")
        sheet.alpha_composite(im, ((i % 2) * 1215, (i // 2) * 660))
    sheet.convert("RGB").resize((sheet.width // 2, sheet.height // 2), Image.LANCZOS).save(os.path.join(ROOT, "docs/scenes.png"))
    row = Image.new("RGBA", (len(BADGES) * 330, 330), (245, 246, 251, 255))
    for i, k in enumerate(BADGES):
        row.alpha_composite(Image.open(os.path.join(APP_RES, f"badge_{k}.webp")).convert("RGBA"), (i * 330 + 5, 5))
    row.convert("RGB").save(os.path.join(ROOT, "docs/badges.png"))
    g = Image.new("RGBA", (1000 * 3 + 40, 560 * 2 + 20), (245, 246, 251, 255))
    for i in range(6):
        im = Image.open(os.path.join(APP_RES, f"guide_{i + 1}.webp")).convert("RGBA")
        g.alpha_composite(im, ((i % 3) * 1020, (i // 3) * 580))
    g.convert("RGB").resize((g.width // 2, g.height // 2), Image.LANCZOS).save(os.path.join(ROOT, "docs/guide.png"))
    bx = Image.new("RGBA", (1000 * 3 + 40, 560 * 2 + 20), (245, 246, 251, 255))
    for i in range(5):
        im = Image.open(os.path.join(BOX_RES, f"box_guide_{i + 1}.webp")).convert("RGBA")
        bx.alpha_composite(im, ((i % 3) * 1020, (i // 3) * 580))
    hero = Image.open(os.path.join(BOX_RES, "box_hero.webp")).convert("RGBA").resize((1000, 500))
    bx.alpha_composite(hero, (2040, 590))
    bx.convert("RGB").resize((bx.width // 2, bx.height // 2), Image.LANCZOS).save(os.path.join(ROOT, "docs/box.png"))


if __name__ == "__main__":
    main()
