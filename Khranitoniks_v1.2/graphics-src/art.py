#!/usr/bin/env python3
# УСТАРЕЛО: персонажи теперь — растровые иллюстрации app/src/main/res/drawable-nodpi/char_*.webp.
# Этот генератор старых векторных картинок оставлен для истории; не запускайте его, иначе появятся дубликаты ресурсов.
"""Генератор векторной графики «Хранитоникс».
Рисует персонажей (4 шт.) × эмоции (10 шт.), иконки приложений и значки уведомлений.
Выход: Android VectorDrawable XML + SVG-превью."""
import math, os, sys

OUT = "#2B2B35"  # контур


def f(v):
    s = ("%.2f" % v).rstrip("0").rstrip(".")
    return "0" if s in ("-0", "") else s


def P(x, y):
    return f"{f(x)},{f(y)}"


class El:
    def __init__(self, kind, **kw):
        self.kind = kind
        self.kw = kw
        self.children = []


class Art:
    def __init__(self, w=200, h=200):
        self.w, self.h = w, h
        self.root = El("group")
        self.stack = [self.root]

    def add(self, el):
        self.stack[-1].children.append(el)

    def path(self, d, fill=None, stroke=None, sw=0, alpha=1.0, evenodd=False, cap="round", join="round"):
        self.add(El("path", d=d, fill=fill, stroke=stroke, sw=sw, alpha=alpha, evenodd=evenodd, cap=cap, join=join))

    def group(self, tx=0, ty=0, sx=1, sy=1, rot=0, px=0, py=0):
        g = El("group", tx=tx, ty=ty, sx=sx, sy=sy, rot=rot, px=px, py=py)
        self.add(g)
        self.stack.append(g)
        return self

    def end(self):
        self.stack.pop()

    # ---------- export ----------
    def to_vd(self, size_dp=None):
        wdp = size_dp or self.w
        hdp = size_dp * self.h / self.w if size_dp else self.h
        lines = ['<?xml version="1.0" encoding="utf-8"?>',
                 f'<vector xmlns:android="http://schemas.android.com/apk/res/android"',
                 f'    android:width="{f(wdp)}dp"', f'    android:height="{f(hdp)}dp"',
                 f'    android:viewportWidth="{self.w}"', f'    android:viewportHeight="{self.h}">']

        def emit(el, ind):
            sp = "    " * ind
            if el.kind == "path":
                k = el.kw
                a = [f'{sp}<path android:pathData="{k["d"]}"']
                if k["fill"]:
                    a.append(f'{sp}    android:fillColor="{k["fill"]}"')
                    if k["alpha"] != 1.0:
                        a.append(f'{sp}    android:fillAlpha="{f(k["alpha"])}"')
                if k["evenodd"]:
                    a.append(f'{sp}    android:fillType="evenOdd"')
                if k["stroke"]:
                    a.append(f'{sp}    android:strokeColor="{k["stroke"]}"')
                    a.append(f'{sp}    android:strokeWidth="{f(k["sw"])}"')
                    a.append(f'{sp}    android:strokeLineCap="{k["cap"]}"')
                    a.append(f'{sp}    android:strokeLineJoin="{k["join"]}"')
                    if k["alpha"] != 1.0:
                        a.append(f'{sp}    android:strokeAlpha="{f(k["alpha"])}"')
                a[-1] += " />"
                lines.extend(a)
            else:
                k = el.kw
                if el is self.root:
                    for c in el.children:
                        emit(c, ind)
                    return
                attrs = []
                if k.get("tx"): attrs.append(f'android:translateX="{f(k["tx"])}"')
                if k.get("ty"): attrs.append(f'android:translateY="{f(k["ty"])}"')
                if k.get("sx", 1) != 1: attrs.append(f'android:scaleX="{f(k["sx"])}"')
                if k.get("sy", 1) != 1: attrs.append(f'android:scaleY="{f(k["sy"])}"')
                if k.get("rot"): attrs.append(f'android:rotation="{f(k["rot"])}"')
                if k.get("px"): attrs.append(f'android:pivotX="{f(k["px"])}"')
                if k.get("py"): attrs.append(f'android:pivotY="{f(k["py"])}"')
                lines.append(f'{sp}<group ' + " ".join(attrs) + ">")
                for c in el.children:
                    emit(c, ind + 1)
                lines.append(f"{sp}</group>")

        emit(self.root, 1)
        lines.append("</vector>")
        return "\n".join(lines) + "\n"

    def to_svg(self):
        out = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{self.w}" height="{self.h}" viewBox="0 0 {self.w} {self.h}">']

        def emit(el):
            if el.kind == "path":
                k = el.kw
                s = f'<path d="{k["d"]}" fill="{k["fill"] or "none"}"'
                if k["fill"] and k["alpha"] != 1.0:
                    s += f' fill-opacity="{k["alpha"]}"'
                if k["evenodd"]:
                    s += ' fill-rule="evenodd"'
                if k["stroke"]:
                    s += f' stroke="{k["stroke"]}" stroke-width="{k["sw"]}" stroke-linecap="{k["cap"]}" stroke-linejoin="{k["join"]}"'
                    if k["alpha"] != 1.0:
                        s += f' stroke-opacity="{k["alpha"]}"'
                out.append(s + "/>")
            else:
                k = el.kw
                if el is self.root:
                    for c in el.children: emit(c)
                    return
                px, py = k.get("px", 0), k.get("py", 0)
                t = f'translate({k.get("tx",0)},{k.get("ty",0)}) translate({px},{py}) rotate({k.get("rot",0)}) scale({k.get("sx",1)},{k.get("sy",1)}) translate({-px},{-py})'
                out.append(f'<g transform="{t}">')
                for c in el.children: emit(c)
                out.append("</g>")

        emit(self.root)
        out.append("</svg>")
        return "\n".join(out)


# ---------- геометрия ----------
def circle(cx, cy, r):
    return f"M{P(cx-r,cy)} A{f(r)},{f(r)} 0 1,0 {P(cx+r,cy)} A{f(r)},{f(r)} 0 1,0 {P(cx-r,cy)} Z"


def ellipse(cx, cy, rx, ry, rot=0):
    a = math.radians(rot)
    x1, y1 = cx - rx * math.cos(a), cy - rx * math.sin(a)
    x2, y2 = cx + rx * math.cos(a), cy + rx * math.sin(a)
    return f"M{P(x1,y1)} A{f(rx)},{f(ry)} {f(rot)} 1,0 {P(x2,y2)} A{f(rx)},{f(ry)} {f(rot)} 1,0 {P(x1,y1)} Z"


def rrect(x, y, w, h, r):
    r = min(r, w / 2, h / 2)
    return (f"M{P(x+r,y)} H{f(x+w-r)} A{f(r)},{f(r)} 0 0,1 {P(x+w,y+r)} V{f(y+h-r)} "
            f"A{f(r)},{f(r)} 0 0,1 {P(x+w-r,y+h)} H{f(x+r)} A{f(r)},{f(r)} 0 0,1 {P(x,y+h-r)} "
            f"V{f(y+r)} A{f(r)},{f(r)} 0 0,1 {P(x+r,y)} Z")


def poly(pts, close=True):
    d = "M" + " L".join(P(x, y) for x, y in pts)
    return d + (" Z" if close else "")


def star(cx, cy, ro, ri, n=5, rot=-90):
    pts = []
    for i in range(n * 2):
        r = ro if i % 2 == 0 else ri
        a = math.radians(rot + i * 180 / n)
        pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    return poly(pts)


def sparkle(cx, cy, r):
    k = r * 0.25
    return (f"M{P(cx,cy-r)} Q{P(cx+k,cy-k)} {P(cx+r,cy)} Q{P(cx+k,cy+k)} {P(cx,cy+r)} "
            f"Q{P(cx-k,cy+k)} {P(cx-r,cy)} Q{P(cx-k,cy-k)} {P(cx,cy-r)} Z")


def octagon(cx, cy, r):
    return poly([(cx + r * math.cos(math.radians(22.5 + 45 * i)), cy + r * math.sin(math.radians(22.5 + 45 * i))) for i in range(8)])


def blob(a, shapes, fill, sw=3.2, stroke=OUT):
    """Общий силуэт: сначала контуры всех фигур, затем заливки поверх (без внутренних линий)."""
    for d in shapes:
        a.path(d, fill=fill, stroke=stroke, sw=sw * 2)
    for d in shapes:
        a.path(d, fill=fill)


# ---------- персонажи ----------
def body_cat(a):
    grey, dark, light = "#9AA4AE", "#7A8590", "#E4E8EC"
    # хвост
    a.path(f"M{P(64,172)} C{P(28,176)} {P(18,140)} {P(38,124)}", stroke=OUT, sw=17)
    a.path(f"M{P(64,172)} C{P(28,176)} {P(18,140)} {P(38,124)}", stroke=grey, sw=11)
    a.path(f"M{P(31,138)} L{P(40,134)}", stroke=dark, sw=3)
    a.path(f"M{P(27,152)} L{P(37,150)}", stroke=dark, sw=3)
    blob(a, [ellipse(90, 150, 38, 34), ellipse(72, 182, 13, 8), ellipse(108, 182, 13, 8),
             ellipse(90, 88, 52, 45)], grey)
    a.path(ellipse(90, 158, 22, 20), fill=light)
    # сложенные ушки (шотландская вислоухая)
    for s in (1, -1):
        cx = 90 - s * 34
        a.path(f"M{P(cx - s*16,62)} Q{P(cx - s*14,42)} {P(cx + s*8,46)} Q{P(cx + s*2,58)} {P(cx - s*16,62)} Z",
               fill=dark, stroke=OUT, sw=3)
    for x1, x2 in ((90, 90), (79, 81), (101, 99)):
        a.path(f"M{P(x1,47)} L{P(x2,57)}", stroke=dark, sw=3)
    a.path(ellipse(90, 106, 20, 13), fill=light)
    a.path(poly([(85, 98), (95, 98), (90, 104)]), fill="#F48FB1", stroke=OUT, sw=1.5)
    for s in (1, -1):
        a.path(f"M{P(90 - s*18,105)} L{P(90 - s*46,99)}", stroke="#5F6770", sw=2)
        a.path(f"M{P(90 - s*18,110)} L{P(90 - s*45,113)}", stroke="#5F6770", sw=2)
    return dict(eyes=((70, 84), (110, 84)), er=12, iris="#D9952B", mouth=(90, 111), mw=14,
                cheeks=((62, 100), (118, 100)), shoulder=(116, 138), hand=(138, 142),
                arm=grey, paw=grey, browc=dark, head_top=(90, 42), head_r=(140, 70))


def body_rat(a):
    white, grey, pink = "#FAFAFA", "#9E9E9E", "#F6B5C6"
    a.path(f"M{P(62,174)} C{P(22,186)} {P(6,150)} {P(30,134)} C{P(44,124)} {P(42,112)} {P(26,108)}",
           stroke=OUT, sw=9)
    a.path(f"M{P(62,174)} C{P(22,186)} {P(6,150)} {P(30,134)} C{P(44,124)} {P(42,112)} {P(26,108)}",
           stroke="#F2A7B8", sw=5)
    for cx in (54, 126):
        a.path(circle(cx, 56, 21), fill=white, stroke=OUT, sw=3.2)
        a.path(circle(cx, 57, 13), fill=pink)
    blob(a, [ellipse(90, 150, 34, 34), ellipse(74, 182, 12, 7), ellipse(106, 182, 12, 7),
             ellipse(90, 84, 40, 37), ellipse(90, 108, 23, 17)], white)
    # серая полоска на спине: от макушки вниз по спине (видна сбоку туловища)
    a.path(f"M{P(90,48)} Q{P(91,58)} {P(90,66)}", stroke=grey, sw=9)
    a.path(f"M{P(63,124)} Q{P(55,150)} {P(64,176)}", stroke=grey, sw=8)
    a.path(ellipse(90, 117, 6.5, 4.5), fill="#F48FB1", stroke=OUT, sw=1.5)
    a.path(rrect(85.5, 126, 4.5, 6, 1), fill="#FFFFFF", stroke=OUT, sw=1.2)
    a.path(rrect(90, 126, 4.5, 6, 1), fill="#FFFFFF", stroke=OUT, sw=1.2)
    for s in (1, -1):
        a.path(f"M{P(90 - s*14,114)} L{P(90 - s*44,106)}", stroke="#8D8D8D", sw=1.8)
        a.path(f"M{P(90 - s*14,118)} L{P(90 - s*44,120)}", stroke="#8D8D8D", sw=1.8)
    return dict(eyes=((74, 82), (106, 82)), er=10, iris="#4A2C2A", mouth=(90, 122), mw=10,
                cheeks=((66, 100), (114, 100)), shoulder=(114, 138), hand=(136, 142),
                arm=white, paw=pink, browc=grey, head_top=(90, 46), head_r=(132, 66))


def body_roach(a):
    brown, dark, head = "#8D4A24", "#5A2E14", "#B9773F"
    for s in (1, -1):
        x0 = 90 - s * 10
        a.path(f"M{P(x0,60)} Q{P(90 - s*30,30)} {P(90 - s*44,12)}", stroke=dark, sw=3.5)
        a.path(circle(90 - s * 44, 12, 4), fill=dark)
    legs = [((62, 136), (40, 128), (30, 144)), ((60, 154), (38, 156), (30, 170)),
            ((66, 172), (50, 182), (44, 194)), ((118, 154), (140, 158), (148, 172)),
            ((114, 172), (130, 182), (136, 194))]
    for p0, p1, p2 in legs:
        a.path(f"M{P(*p0)} L{P(*p1)} L{P(*p2)}", stroke=dark, sw=4.5)
    blob(a, [ellipse(90, 150, 32, 38)], brown)
    a.path(f"M{P(90,116)} L{P(90,186)}", stroke=dark, sw=3)
    a.path(ellipse(77, 146, 7, 20), fill="#B06A3F", alpha=0.8)
    a.path(ellipse(103, 146, 7, 20), fill="#B06A3F", alpha=0.8)
    blob(a, [ellipse(90, 88, 40, 33)], head)
    a.path(f"M{P(82,113)} Q{P(80,120)} {P(85,122)}", stroke=dark, sw=2.5)
    a.path(f"M{P(98,113)} Q{P(100,120)} {P(95,122)}", stroke=dark, sw=2.5)
    return dict(eyes=((75, 84), (105, 84)), er=12, iris="#3B2314", mouth=(90, 104), mw=14,
                cheeks=((64, 98), (116, 98)), shoulder=(116, 136), hand=(138, 142),
                arm=None, paw=dark, browc=dark, head_top=(90, 55), head_r=(132, 70), leg=dark)


def body_robot(a):
    metal, dark, body = "#B0BEC5", "#78909C", "#90A4AE"
    a.path(f"M{P(90,40)} L{P(90,22)}", stroke=dark, sw=4)
    a.path(circle(90, 18, 6.5), fill="#E53935", stroke=OUT, sw=2)
    a.path(f"M{P(55,130)} L{P(40,162)}", stroke=OUT, sw=13)
    a.path(f"M{P(55,130)} L{P(40,162)}", stroke=dark, sw=8)
    a.path(circle(40, 164, 7), fill=metal, stroke=OUT, sw=2.5)
    a.path(rrect(66, 174, 15, 16, 3), fill="#607D8B", stroke=OUT, sw=2.5)
    a.path(rrect(99, 174, 15, 16, 3), fill="#607D8B", stroke=OUT, sw=2.5)
    a.path(rrect(81, 108, 18, 12, 2), fill=dark, stroke=OUT, sw=2.5)
    a.path(rrect(54, 118, 72, 60, 13), fill=body, stroke=OUT, sw=3.2)
    a.path(circle(90, 147, 16), fill="#ECEFF1", stroke=OUT, sw=2.5)
    a.path(f"M{P(90,147)} L{P(90,136)}", stroke=OUT, sw=2.5)
    a.path(f"M{P(90,147)} L{P(99,147)}", stroke="#E53935", sw=2.5)
    a.path(circle(90, 147, 2.2), fill=OUT)
    a.path(rrect(40, 64, 11, 22, 3), fill=dark, stroke=OUT, sw=2.5)
    a.path(rrect(129, 64, 11, 22, 3), fill=dark, stroke=OUT, sw=2.5)
    a.path(rrect(47, 38, 86, 72, 17), fill=metal, stroke=OUT, sw=3.2)
    a.path(rrect(57, 50, 66, 48, 11), fill="#1E2A33")
    a.path(circle(60, 46, 2), fill="#FFFFFF", alpha=0.7)
    return dict(eyes=((76, 70), (104, 70)), er=8.5, iris="#4DD0E1", mouth=(90, 87), mw=18,
                cheeks=((64, 84), (116, 84)), shoulder=(124, 130), hand=(140, 144),
                arm=dark, paw=metal, browc="#4DD0E1", head_top=(90, 14), head_r=(136, 58), robot=True)


BODIES = {"sema": body_cat, "timma": body_rat, "olezhka": body_roach, "hroni": body_robot}

# ---------- лица ----------
CY = "#4DD0E1"


def eye(a, x, y, r, style, iris, robot, side):
    gx, gy = 0, 0
    if style == "up":
        gx, gy = 2.5, -3
    if robot:
        c = CY
        if style in ("open", "up", "sparkle"):
            a.path(ellipse(x + gx * .6, y + gy * .6, r * 0.75, r * 0.95), fill=c)
            if style == "sparkle":
                a.path(sparkle(x - r * 0.25, y - r * 0.35, r * 0.45), fill="#FFFFFF")
        elif style == "happy":
            a.path(f"M{P(x-r,y+3)} Q{P(x,y-r*1.2)} {P(x+r,y+3)}", stroke=c, sw=3.5)
        elif style == "closed":
            a.path(f"M{P(x-r,y)} Q{P(x,y+r*0.8)} {P(x+r,y)}", stroke=c, sw=3.5)
        elif style in ("half", "tired"):
            a.path(f"M{P(x-r,y)} L{P(x+r,y)} A{f(r)},{f(r*0.7)} 0 0,1 {P(x-r,y)} Z", fill=c)
        elif style == "angry":
            k = 1 if side == 0 else -1
            a.path(poly([(x - r, y - k * r * 0.5), (x + r, y + k * r * 0.5), (x + r * 0.8, y + r), (x - r * 0.8, y + r)]), fill=c)
        elif style == "worried":
            a.path(ellipse(x, y + 1, r * 0.7, r * 0.85), fill=c)
        return
    if style == "happy":
        a.path(f"M{P(x-r,y+3)} Q{P(x,y-r*1.3)} {P(x+r,y+3)}", stroke=OUT, sw=3.5)
        return
    if style == "closed":
        a.path(f"M{P(x-r,y-1)} Q{P(x,y+r*0.9)} {P(x+r,y-1)}", stroke=OUT, sw=3.5)
        return
    a.path(circle(x, y, r), fill="#FFFFFF", stroke=OUT, sw=2.5)
    ir = r * 0.66
    a.path(circle(x + gx, y + gy, ir), fill=iris)
    a.path(circle(x + gx, y + gy, ir * 0.55), fill="#1A1A1A")
    a.path(circle(x + gx - ir * 0.35, y + gy - ir * 0.4, ir * 0.3), fill="#FFFFFF")
    if style == "sparkle":
        a.path(sparkle(x + gx + ir * 0.35, y + gy + ir * 0.3, ir * 0.35), fill="#FFFFFF")
    if style in ("half", "tired"):
        lid = "#00000000"
        a.path(f"M{P(x-r,y)} A{f(r)},{f(r)} 0 0,1 {P(x+r,y)} Z", fill="#C9CED6" if style == "half" else "#B7BEC8",
               stroke=OUT, sw=2.5)
    if style == "angry":
        k = 1 if side == 0 else -1
        a.path(poly([(x - r - 1, y - r - 1), (x + r + 1, y - r - 1), (x + r + 1, y - r * (0.1 if k == 1 else 0.9)),
                     (x - r - 1, y - r * (0.9 if k == 1 else 0.1))]), fill="#C9CED6")


def brow(a, x, y, r, style, side, color):
    if style is None:
        return
    k = 1 if side == 0 else -1  # 0 = левый глаз
    yy = y - r - 7
    w = r * 0.9
    if style == "angry":
        p1, p2 = (x - k * w, yy - 4), (x + k * w * 0.9, yy + 4)
    elif style == "worried":
        p1, p2 = (x - k * w, yy + 3), (x + k * w * 0.9, yy - 4)
    elif style == "serious":
        p1, p2 = (x - k * w, yy - 1), (x + k * w * 0.9, yy + 2)
    else:
        p1, p2 = (x - w, yy), (x + w, yy - 2)
    a.path(f"M{P(*p1)} L{P(*p2)}", stroke=color, sw=4)


def mouth(a, x, y, w, style, robot):
    ink = CY if robot else OUT
    fillm = CY if robot else "#6D2B2B"
    h = w / 2
    if style == "smile":
        a.path(f"M{P(x-h,y)} Q{P(x,y+w*0.55)} {P(x+h,y)}", stroke=ink, sw=3)
    elif style == "big":
        a.path(f"M{P(x-h*1.1,y-1)} Q{P(x,y+w*1.0)} {P(x+h*1.1,y-1)} Z", fill=fillm, stroke=ink, sw=2.5)
        if not robot:
            a.path(ellipse(x, y + w * 0.32, w * 0.28, w * 0.13), fill="#F06292")
    elif style == "grin":
        a.path(f"M{P(x-h*1.1,y-1)} Q{P(x,y+w*0.9)} {P(x+h*1.1,y-1)} Z", fill="#FFFFFF" if not robot else "#1E2A33",
               stroke=ink, sw=2.5)
        a.path(f"M{P(x-h*0.9,y+3)} L{P(x+h*0.9,y+3)}", stroke=ink, sw=1.8)
    elif style == "flat":
        a.path(f"M{P(x-h*0.8,y+2)} L{P(x+h*0.8,y+2)}", stroke=ink, sw=3)
    elif style == "frown":
        a.path(f"M{P(x-h,y+5)} Q{P(x,y-w*0.35)} {P(x+h,y+5)}", stroke=ink, sw=3)
    elif style == "o":
        a.path(ellipse(x, y + 3, w * 0.22, w * 0.27), fill=fillm, stroke=ink, sw=2)
    elif style == "wavy":
        pts = [(x - h + i * w / 6, y + 3 + (2.5 if i % 2 else -2.5)) for i in range(7)]
        a.path(poly(pts, close=False), stroke=ink, sw=2.6)
    elif style == "pant":
        a.path(ellipse(x, y + 4, w * 0.38, w * 0.33), fill=fillm, stroke=ink, sw=2.5)
        if not robot:
            a.path(ellipse(x, y + 8, w * 0.22, w * 0.14), fill="#F06292")


MOODS = {
    #           eyes      brow       mouth   prop        blush
    "happy":    ("happy", None,      "big",   "star",     True),
    "charged":  ("sparkle", None,    "big",   "battery_full", True),
    "break":    ("half",  None,      "smile", "cup",      True),
    "stop":     ("open",  "serious", "flat",  "stop",     False),
    "charging": ("up",    None,      "o",     "plug",     False),
    "low":      ("open",  "worried", "wavy",  "battery_low", False),
    "sleep":    ("closed", None,     "o",     "moon",     True),
    "angry":    ("angry", "angry",   "frown", "lock",     False),
    "gamer":    ("open",  "serious", "grin",  "gamepad",  False),
    "hot":      ("tired", "worried", "pant",  "thermo",   True),
}


# ---------- реквизит (локальные координаты вокруг 0,0) ----------
def prop(a, name):
    if name == "star":
        a.path(star(0, 0, 23, 10), fill="#FFC107", stroke=OUT, sw=3)
        a.path(star(-3, -3, 9, 4), fill="#FFE082")
    elif name in ("battery_full", "battery_low"):
        a.path(rrect(-6, -30, 12, 7, 2), fill="#90A4AE", stroke=OUT, sw=2.5)
        a.path(rrect(-15, -24, 30, 48, 6), fill="#FFFFFF", stroke=OUT, sw=3)
        if name == "battery_full":
            a.path(rrect(-10, -19, 20, 38, 3), fill="#43A047")
            a.path(poly([(3, -15), (-6, 2), (0, 2), (-3, 15), (7, -3), (1, -3)]), fill="#FFEB3B", stroke=OUT, sw=1.5)
        else:
            a.path(rrect(-10, 12, 20, 7, 2), fill="#E53935")
            a.path(rrect(-2.5, -15, 5, 17, 2), fill="#E53935")
            a.path(circle(0, 7, 2.6), fill="#E53935")
    elif name == "cup":
        for i, dx in enumerate((-8, 0, 8)):
            a.path(f"M{P(dx,-16)} C{P(dx-5,-21)} {P(dx+5,-25)} {P(dx,-31)}", stroke="#B0BEC5", sw=3)
        a.path(f"M{P(14,-4)} C{P(26,-5)} {P(26,12)} {P(13,12)}", stroke=OUT, sw=7)
        a.path(f"M{P(14,-4)} C{P(26,-5)} {P(26,12)} {P(13,12)}", stroke="#FF8A65", sw=3.5)
        a.path(rrect(-16, -12, 31, 31, 6), fill="#FF8A65", stroke=OUT, sw=3)
        a.path(rrect(-12, -8, 23, 5, 2), fill="#6D4C41")
        a.path(f"M{P(-6,6)} Q{P(-1,1)} {P(0,6)} Q{P(1,1)} {P(6,6)} L{P(0,12)} Z", fill="#FFFFFF")
    elif name == "stop":
        a.path(f"M{P(0,6)} L{P(0,46)}", stroke=OUT, sw=7)
        a.path(f"M{P(0,6)} L{P(0,46)}", stroke="#B0BEC5", sw=4)
        a.path(octagon(0, -10, 24), fill="#E53935", stroke=OUT, sw=3)
        a.path(octagon(0, -10, 19.5), stroke="#FFFFFF", sw=2.5)
        a.path(rrect(-12, -13.5, 24, 7, 2), fill="#FFFFFF")
    elif name == "plug":
        a.path(f"M{P(0,12)} C{P(0,34)} {P(-30,30)} {P(-34,50)}", stroke=OUT, sw=7)
        a.path(f"M{P(0,12)} C{P(0,34)} {P(-30,30)} {P(-34,50)}", stroke="#455A64", sw=4)
        a.path(rrect(-6.5, -26, 4.5, 12, 1.5), fill="#CFD8DC", stroke=OUT, sw=2)
        a.path(rrect(2, -26, 4.5, 12, 1.5), fill="#CFD8DC", stroke=OUT, sw=2)
        a.path(rrect(-12, -16, 24, 28, 6), fill="#546E7A", stroke=OUT, sw=3)
        a.path(poly([(22, -36), (12, -20), (19, -20), (14, -6), (28, -25), (21, -25)]), fill="#FFEB3B", stroke=OUT, sw=2)
    elif name == "moon":
        # полумесяц из двух дуг
        R, r2, ox, oy = 20, 17, 9, -6
        d = math.hypot(ox, oy)
        aa = (R * R - r2 * r2 + d * d) / (2 * d)
        hh = math.sqrt(max(R * R - aa * aa, 0))
        mx, my = aa * ox / d, aa * oy / d
        p1 = (mx + hh * oy / d, my - hh * ox / d)
        p2 = (mx - hh * oy / d, my + hh * ox / d)
        dd = f"M{P(*p1)} A{R},{R} 0 1,1 {P(*p2)} A{r2},{r2} 0 1,0 {P(*p1)} Z"
        a.path(dd, fill="#FFD54F", stroke=OUT, sw=3)
        a.path(sparkle(-26, -18, 6), fill="#FFF59D")
        a.path(sparkle(20, 22, 4.5), fill="#FFF59D")
    elif name == "lock":
        a.path(f"M{P(-10,-4)} V{f(-14)} A10,10 0 0,1 {P(10,-14)} V{f(-4)}", stroke=OUT, sw=9)
        a.path(f"M{P(-10,-4)} V{f(-14)} A10,10 0 0,1 {P(10,-14)} V{f(-4)}", stroke="#B0BEC5", sw=5)
        a.path(rrect(-17, -6, 34, 28, 6), fill="#FFB300", stroke=OUT, sw=3)
        a.path(circle(0, 5, 4.5), fill=OUT)
        a.path(rrect(-2, 6, 4, 9, 1.5), fill=OUT)
    elif name == "gamepad":
        body = (f"M{P(-20,-12)} H{f(20)} C{P(32,-12)} {P(36,14)} {P(26,16)} C{P(20,17)} {P(16,6)} {P(10,6)} "
                f"H{f(-10)} C{P(-16,6)} {P(-20,17)} {P(-26,16)} C{P(-36,14)} {P(-32,-12)} {P(-20,-12)} Z")
        a.path(body, fill="#5C6BC0", stroke=OUT, sw=3)
        a.path(rrect(-20, -4.5, 13, 4.5, 1), fill="#E8EAF6")
        a.path(rrect(-15.75, -9, 4.5, 13, 1), fill="#E8EAF6")
        a.path(circle(14, -6, 3.3), fill="#EF5350")
        a.path(circle(21, -1, 3.3), fill="#66BB6A")
        a.path(circle(14, 3, 3.3), fill="#FFCA28")
    elif name == "thermo":
        a.path(rrect(-6.5, -32, 13, 46, 6.5), fill="#FFFFFF", stroke=OUT, sw=3)
        a.path(circle(0, 18, 10), fill="#E53935", stroke=OUT, sw=3)
        a.path(rrect(-3, -24, 6, 40, 3), fill="#E53935")
        for yy in (-20, -12, -4):
            a.path(f"M{P(3,yy)} L{P(7,yy)}", stroke=OUT, sw=1.5)


PROP_POS = {"star": (156, 118), "battery_full": (158, 120), "battery_low": (158, 120), "cup": (156, 128),
            "stop": (158, 112), "plug": (160, 122), "moon": (156, 42), "lock": (158, 124),
            "gamepad": (152, 132), "thermo": (160, 118)}
HELD = {"star", "battery_full", "battery_low", "cup", "stop", "plug", "lock", "gamepad", "thermo"}


def effects(a, mood, an):
    hx, hy = an["head_r"]
    if mood in ("happy", "charged"):
        for (x, y, r) in ((30, 40, 8), (172, 70, 6), (40, 120, 5)):
            a.path(sparkle(x, y, r), fill="#FFD54F")
    if mood == "sleep":
        for (x, y, s) in ((132, 78, 13), (146, 60, 10), (157, 45, 7)):
            pass
        for (x, y, s) in ((112, 64, 0),):
            pass
        zs = ((150, 92, 14), (168, 74, 10), (181, 60, 7))
        for x, y, s in zs:
            a.path(poly([(x - s / 2, y - s / 2), (x + s / 2, y - s / 2), (x - s / 2, y + s / 2), (x + s / 2, y + s / 2)], close=False),
                   stroke="#7986CB", sw=3)
    if mood in ("low", "hot"):
        a.path(f"M{P(hx,hy-10)} Q{P(hx+7,hy+2)} {P(hx,hy+5)} Q{P(hx-7,hy+2)} {P(hx,hy-10)} Z", fill="#81D4FA", stroke=OUT, sw=2)
    if mood == "hot":
        a.path(f"M{P(28,60)} Q{P(22,70)} {P(30,78)}", fill="#81D4FA", stroke=OUT, sw=2)
        a.path(f"M{P(28,58)} Q{P(36,70)} {P(30,78)}", fill="#81D4FA")
        for dx in ((-18, 18) if an.get("robot") else (-14, 0, 14)):
            x0, y0 = an["head_top"][0] + dx, an["head_top"][1] - 6 + (30 if an.get("robot") else 0)
            a.path(f"M{P(x0,y0)} q{P(-4,-5)} {P(0,-10)} q{P(4,-5)} {P(0,-10)}", stroke="#FF7043", sw=2.8)
    if mood == "angry":
        x, y = hx - 4, hy - 16
        for ang in (0, 90, 180, 270):
            g = math.radians(ang)
            c, s = math.cos(g), math.sin(g)
            p0 = (x + 4 * c - 0 * s, y + 4 * s)
            pts = [(3, -2), (8, -7)]
            px = lambda u, v: (x + u * c - v * s, y + u * s + v * c)
            a.path(f"M{P(*px(4,-7))} Q{P(*px(8,0))} {P(*px(4,7))}", stroke="#E53935", sw=3.5)
    if mood == "gamer":
        for (x, y) in ((30, 50), (176, 168)):
            a.path(f"M{P(x-6,y)} L{P(x+6,y)} M{P(x,y-6)} L{P(x,y+6)}", stroke="#7E57C2", sw=3)


def character(cid, mood):
    a = Art()
    an = BODIES[cid](a)
    eyes_s, brow_s, mouth_s, pr, blush = MOODS[mood]
    robot = an.get("robot", False)
    if blush:
        for (x, y) in an["cheeks"]:
            a.path(ellipse(x, y, 7, 4.5), fill="#FF8A80" if not robot else "#F48FB1", alpha=0.55)
    for i, (x, y) in enumerate(an["eyes"]):
        eye(a, x, y, an["er"], eyes_s, an["iris"], robot, i)
        brow(a, x, y, an["er"], brow_s, i, an["browc"] if not robot else CY)
    mx, my = an["mouth"]
    mouth(a, mx, my, an["mw"], mouth_s, robot)
    px, py = PROP_POS[pr]
    sx, sy = an["shoulder"]
    hx, hy = an["hand"]
    if pr in HELD:
        hx, hy = px - 18, py + 18 if pr != "stop" else py + 30
        if pr == "gamepad":
            hx, hy = px - 22, py + 10
    if pr in HELD:
        if an.get("leg"):
            a.path(f"M{P(sx,sy)} L{P((sx+hx)/2+4,(sy+hy)/2+8)} L{P(hx,hy)}", stroke=an["leg"], sw=4.5)
        elif an["arm"]:
            a.path(f"M{P(sx,sy)} L{P(hx,hy)}", stroke=OUT, sw=13 if robot else 15)
            a.path(f"M{P(sx,sy)} L{P(hx,hy)}", stroke=an["arm"], sw=8 if robot else 9)
    a.group(tx=px, ty=py)
    prop(a, pr)
    a.end()
    if pr in HELD:
        a.path(circle(hx, hy, 8 if not an.get("leg") else 5), fill=an["paw"], stroke=OUT, sw=2.5)
    else:
        # рука опущена
        if an.get("leg"):
            a.path(f"M{P(sx,sy)} L{P(sx+20,sy+6)} L{P(sx+26,sy+22)}", stroke=an["leg"], sw=4.5)
        elif an["arm"]:
            a.path(f"M{P(sx,sy)} L{P(sx+10,sy+22)}", stroke=OUT, sw=13 if robot else 15)
            a.path(f"M{P(sx,sy)} L{P(sx+10,sy+22)}", stroke=an["arm"], sw=8 if robot else 9)
            a.path(circle(sx + 10, sy + 24, 8), fill=an["paw"], stroke=OUT, sw=2.5)
    effects(a, mood, an)
    return a


# ---------- иконки ----------
def robot_head(a, cx, cy, s, smile=True):
    a.group(tx=cx - 50 * s, ty=cy - 50 * s, sx=s, sy=s)
    a.path(f"M{P(50,14)} L{P(50,2)}", stroke="#CFD8DC", sw=4)
    a.path(circle(50, 2, 5), fill="#FF5252")
    a.path(rrect(2, 30, 10, 22, 3), fill="#90A4AE")
    a.path(rrect(88, 30, 10, 22, 3), fill="#90A4AE")
    a.path(rrect(8, 12, 84, 70, 18), fill="#ECEFF1")
    a.path(rrect(18, 24, 64, 46, 12), fill="#1E2A33")
    a.path(ellipse(37, 44, 6.5, 8.5), fill=CY)
    a.path(ellipse(63, 44, 6.5, 8.5), fill=CY)
    if smile:
        a.path(f"M{P(38,57)} Q{P(50,66)} {P(62,57)}", stroke=CY, sw=3.5)
    a.end()


def launcher(round_=False):
    a = Art(108, 108)
    if round_:
        a.path(circle(54, 54, 54), fill="#3949AB")
        a.path(circle(54, 54, 46), fill="#5C6BC0")
    else:
        a.path(rrect(0, 0, 108, 108, 24), fill="#3949AB")
        a.path(rrect(6, 6, 96, 96, 20), fill="#5C6BC0")
    robot_head(a, 54, 50, 0.62)
    # значок часов-щита
    a.path(f"M{P(70,66)} L{P(86,72)} V{f(82)} C{P(86,92)} {P(78,97)} {P(70,100)} C{P(62,97)} {P(54,92)} {P(54,82)} V{f(72)} Z",
           fill="#FFC107", stroke="#283593", sw=2.5)
    a.path(f"M{P(70,76)} V{f(84)} L{P(76,87)}", stroke="#283593", sw=3)
    return a


def box_launcher(round_=False):
    a = Art(108, 108)
    if round_:
        a.path(circle(54, 54, 54), fill="#00796B")
        a.path(circle(54, 54, 46), fill="#26A69A")
    else:
        a.path(rrect(0, 0, 108, 108, 24), fill="#00796B")
        a.path(rrect(6, 6, 96, 96, 20), fill="#26A69A")
    # подарочная коробка
    a.path(rrect(26, 50, 56, 36, 5), fill="#FFB300", stroke="#4E342E", sw=2.5)
    a.path(rrect(22, 40, 64, 14, 4), fill="#FFCA28", stroke="#4E342E", sw=2.5)
    a.path(rrect(49, 40, 10, 46, 2), fill="#E53935")
    a.path(f"M{P(54,40)} C{P(40,22)} {P(28,34)} {P(54,40)} Z", fill="#E53935", stroke="#4E342E", sw=2)
    a.path(f"M{P(54,40)} C{P(68,22)} {P(80,34)} {P(54,40)} Z", fill="#E53935", stroke="#4E342E", sw=2)
    # циферблат
    a.path(circle(78, 30, 12), fill="#FFFFFF", stroke="#004D40", sw=2.5)
    a.path(f"M{P(78,30)} V{f(23)} M{P(78,30)} L{P(83,33)}", stroke="#004D40", sw=2.2)
    return a


def stat_icon():
    a = Art(24, 24)
    shield = f"M{P(12,2)} L{P(20,5)} V{f(11)} C{P(20,16.5)} {P(16.5,20.5)} {P(12,22)} C{P(7.5,20.5)} {P(4,16.5)} {P(4,11)} V{f(5)} Z"
    clock = circle(12, 12, 5.2)
    a.path(shield + " " + clock, fill="#FFFFFF", evenodd=True)
    a.path(f"M{P(12,9)} V{f(12)} L{P(14.2,13.4)}", stroke="#FFFFFF", sw=1.6)
    return a


def stat_box_icon():
    a = Art(24, 24)
    a.path(rrect(4, 10, 16, 11, 1.5) + " " + rrect(3, 6.5, 18, 4.5, 1), fill="#FFFFFF")
    a.path(f"M{P(12,6.5)} C{P(8,2)} {P(5,5)} {P(12,6.5)} Z M{P(12,6.5)} C{P(16,2)} {P(19,5)} {P(12,6.5)} Z", fill="#FFFFFF")
    return a


CHARS = ["sema", "timma", "olezhka", "hroni"]

if __name__ == "__main__":
    root = sys.argv[1]
    app_dr = os.path.join(root, "app/src/main/res/drawable")
    box_dr = os.path.join(root, "box/src/main/res/drawable")
    prev = os.path.join(sys.argv[2] if len(sys.argv) > 2 else "/tmp/prev")
    for d in (app_dr, box_dr, prev):
        os.makedirs(d, exist_ok=True)
    for c in CHARS:
        for m in MOODS:
            art = character(c, m)
            open(os.path.join(app_dr, f"char_{c}_{m}.xml"), "w").write(art.to_vd())
            open(os.path.join(prev, f"char_{c}_{m}.svg"), "w").write(art.to_svg())
    for name, art, dr in (("ic_launcher", launcher(), app_dr), ("ic_launcher_round", launcher(True), app_dr),
                          ("ic_stat_guard", stat_icon(), app_dr),
                          ("ic_launcher", box_launcher(), box_dr), ("ic_launcher_round", box_launcher(True), box_dr),
                          ("ic_stat_box", stat_box_icon(), box_dr)):
        open(os.path.join(dr, f"{name}.xml"), "w").write(art.to_vd(size_dp=108 if art.w == 108 else 24))
        open(os.path.join(prev, f"{'box' if dr == box_dr else 'app'}_{name}.svg"), "w").write(art.to_svg())
    # робот для Бокса (иллюстрация)
    art = character("hroni", "happy")
    open(os.path.join(box_dr, "char_hroni_happy.xml"), "w").write(art.to_vd())
    print("ok")
