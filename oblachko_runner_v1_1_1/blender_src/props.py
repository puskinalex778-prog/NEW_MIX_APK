import sys, math, random
import os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *

reset()
R = random.Random(42)
PROPS = []


def prop(name, parts, origin=(0, 0, 0)):
    o = join(parts, 'p_' + name)
    PROPS.append(o)
    return o


def bake(o):
    """apply object transform into mesh"""
    o.data.transform(o.matrix_basis)
    o.matrix_basis = Matrix.Identity(4)
    return o


# ---------------- palette -----------------
WOOD = mat('#b0825a', 0.8, name='wood')
WOOD_D = mat('#7d573d', 0.85, name='wood_dark')
WOOD_L = mat('#d9b285', 0.8, name='wood_light')
GOLD = mat('#f6c344', 0.28, 0.75, emit='#8a5a00', es=0.25, name='gold')
GOLD_D = mat('#d99a22', 0.3, 0.7, name='gold_dark')
RED = mat('#d9534a', 0.5, name='red')
WHITE = mat('#f3efe6', 0.6, name='white')
GREY = mat('#9aa3a6', 0.55, name='grey')
DARK = mat('#3a4046', 0.6, name='dark')
METAL = mat('#c7ced2', 0.3, 0.8, name='metal')
GLASS = mat('#8fc3d6', 0.15, 0.1, name='window')
TIRE = mat('#2f3336', 0.8, name='tire')
LEAF = [mat('#6fae52', 0.85, name='leaf1'), mat('#86bd5a', 0.85, name='leaf2'), mat('#5a9a4f', 0.85, name='leaf3')]
BARK = mat('#7a5a44', 0.9, name='bark')
GLOW = mat('#ffe3a0', 0.5, emit='#ffc76b', es=2.5, name='lamp_glow')
HAY = mat('#e2c063', 0.95, name='hay')
HAY_D = mat('#c49d45', 0.95, name='hay_dark')
ROCK = mat('#a7a39a', 0.9, name='rock')
SNOW = mat('#f4f8fb', 0.8, name='snow')


# ================= COLLECTIBLES ===================
def coin():
    p = [cyl(0.32, 0.09, (0, 0, 0), GOLD, rot=(90, 0, 0), seg=28, bev=0.025),
         torus(0.27, 0.025, (0, -0.045, 0), GOLD_D, rot=(90, 0, 0), su=28, sv=6),
         torus(0.27, 0.025, (0, 0.045, 0), GOLD_D, rot=(90, 0, 0), su=28, sv=6),
         prism(star_pts(5, 0.17, 0.075), 0.13, (0, 0, 0), GOLD_D, bev=0.01)]
    prop('coin', p)


def heart_pts(s=1.0):
    pts = []
    for i in range(40):
        t = 2 * math.pi * i / 40
        x = 16 * math.sin(t) ** 3
        y = 13 * math.cos(t) - 5 * math.cos(2 * t) - 2 * math.cos(3 * t) - math.cos(4 * t)
        pts.append((x / 17 * 0.38 * s, y / 17 * 0.38 * s))
    return pts


def heart():
    prop('heart', [prism(heart_pts(), 0.16, (0, 0, 0), mat('#e8505b', 0.35, name='heart'), bev=0.04)])


def magnet():
    rm = mat('#e2483f', 0.35, name='magnet_red')
    p = [torus(0.24, 0.085, (0, 0, 0.05), rm, rot=(90, 0, 0), arc=180, su=18, sv=12)]
    p[0].data.transform(Matrix.Rotation(math.radians(180), 4, 'Y'))
    for s in (1, -1):
        p.append(cyl(0.085, 0.2, (s * 0.24, 0, 0.0), rm, seg=14))
        p.append(cyl(0.086, 0.14, (s * 0.24, 0, -0.17), METAL, seg=14))
    prop('magnet', p)


def shield():
    pts = [(0, -0.42)] + [(math.sin(a) * 0.34, 0.05 + math.cos(a) * 0.3) for a in [math.radians(x) for x in range(-100, 101, 20)]]
    pts = [(0, -0.42), (0.33, -0.1), (0.34, 0.25), (0.15, 0.33), (0, 0.36), (-0.15, 0.33), (-0.34, 0.25), (-0.33, -0.1)]
    b = mat('#4fa3d9', 0.3, name='shield_blue')
    p = [prism(pts, 0.12, (0, 0, 0), b, bev=0.03),
         prism([(x * 0.7, y * 0.7 + 0.01) for x, y in pts], 0.16, (0, 0, 0), mat('#bfe6f7', 0.3, name='shield_light'), bev=0.02),
         prism(star_pts(5, 0.11, 0.05), 0.2, (0, 0, 0.02), GOLD, bev=0.005)]
    prop('shield', p)


def text_mesh(txt, size=0.5, extrude=0.05, m=None):
    cu = D.curves.new('t', 'FONT')
    cu.body = txt
    cu.size = size
    cu.extrude = extrude
    cu.align_x = 'CENTER'
    cu.align_y = 'CENTER'
    cu.bevel_depth = 0.01
    o = D.objects.new('t', cu)
    link(o)
    dg = C.evaluated_depsgraph_get()
    me = D.meshes.new_from_object(o.evaluated_get(dg))
    D.objects.remove(o)
    ob = D.objects.new('tm', me)
    link(ob)
    me.materials.clear()
    if m:
        me.materials.append(m)
    me.transform(Matrix.Rotation(math.radians(90), 4, 'X'))
    return ob


def x2():
    pm = mat('#8a63d2', 0.3, 0.2, name='x2_purple')
    p = [cyl(0.34, 0.1, (0, 0, 0), pm, rot=(90, 0, 0), seg=28, bev=0.03),
         torus(0.3, 0.03, (0, 0, 0), GOLD, rot=(90, 0, 0), su=28, sv=6)]
    t = text_mesh('x2', 0.36, 0.04, WHITE)
    t.data.transform(Matrix.Translation((0, -0.07, 0)))
    p.append(t)
    prop('x2', p)


def boots():
    g = mat('#59b26c', 0.4, name='boot_green')
    p = [box((0.26, 0.48, 0.2), (0, 0.02, 0.16), g, bev=0.08),
         sphere((0, -0.16, 0.2), (0.14, 0.14, 0.14), g),
         box((0.29, 0.54, 0.07), (0, 0.02, 0.04), WHITE, bev=0.03)]
    for k in range(4):
        p.append(torus(0.1, 0.022, (0, 0.02, -0.04 - k * 0.07), METAL, su=16, sv=6))
    for s in (1, -1):
        w = sphere((s * 0.2, -0.05, 0.3), (0.04, 0.16, 0.08), WHITE, rot=(0, 0, 0))
        p.append(w)
    prop('boots', p)


def seeds():
    sack = mat('#d9b98a', 0.95, name='sack')
    p = [blob([((0, 0, 0.25), 0.32, (1, 0.85, 1.05)), ((0, 0, 0.5), 0.14)], 'sack', sack, res=0.03),
         torus(0.1, 0.035, (0, 0, 0.47), mat('#d6453d', 0.6, name='ribbon'), su=16, sv=8),
         sphere((0.1, -0.08, 0.5), (0.08, 0.03, 0.05), mat('#d6453d', 0.6, name='ribbon')),
         sphere((-0.1, -0.08, 0.5), (0.08, 0.03, 0.05), mat('#d6453d', 0.6, name='ribbon'))]
    for i in range(5):
        p.append(sphere((R.uniform(-.06, .06), R.uniform(-.04, .04), 0.6 + R.uniform(0, .03)), (0.03, 0.02, 0.04), mat('#5b4a2f', 0.7, name='seed')))
    o = prop('seeds', p)
    o.data.transform(Matrix.Translation((0, 0, -0.3)))


def backpack():
    b = mat('#4d8fd1', 0.6, name='pack_blue')
    p = [box((0.5, 0.3, 0.6), (0, 0, 0), b, bev=0.12),
         box((0.36, 0.1, 0.26), (0, -0.17, -0.1), mat('#f2c14e', 0.6, name='pack_yellow'), bev=0.06),
         torus(0.08, 0.02, (0, 0, 0.33), DARK, rot=(90, 0, 90), su=12, sv=6)]
    for s in (1, -1):
        p.append(box((0.07, 0.04, 0.55), (s * 0.15, 0.16, 0), DARK, bev=0.015))
    prop('backpack', p)


def gift(name='gift', col='#d9534a', rib='#f6d36b', size=0.55):
    c = mat(col, 0.5, name='gift_' + col.lstrip('#'))
    r = mat(rib, 0.4, name='rib_' + rib.lstrip('#'))
    s = size
    p = [box((s, s, s * 0.85), (0, 0, s * 0.425), c, bev=0.03),
         box((s * 1.04, s * 0.18, s * 0.87), (0, 0, s * 0.425), r, bev=0.01),
         box((s * 0.18, s * 1.04, s * 0.87), (0, 0, s * 0.425), r, bev=0.01)]
    for a in (45, -45, 135, -135):
        o = sphere((0, 0, 0), (s * 0.16, s * 0.06, s * 0.1), r)
        o.data.transform(Matrix.Translation((0, 0, s * 0.9)) @ Matrix.Rotation(math.radians(a), 4, 'Z') @ Matrix.Translation((s * 0.12, 0, 0)))
        p.append(o)
    return p


def star():
    st = mat('#ffd75e', 0.3, 0.3, emit='#ffb92e', es=1.2, name='star_glow')
    prop('star', [prism(star_pts(5, 0.42, 0.19), 0.16, (0, 0, 0), st, bev=0.05)])


def lantern_item():
    pap = mat('#ef6b4f', 0.6, emit='#ff8a4a', es=0.8, name='paper_lantern')
    p = [blob([((0, 0, 0), 0.32, (1, 1, 1.15))], 'lan', pap, res=0.04),
         cyl(0.13, 0.06, (0, 0, 0.33), DARK, seg=14), cyl(0.13, 0.06, (0, 0, -0.33), DARK, seg=14),
         torus(0.06, 0.012, (0, 0, 0.42), DARK, rot=(90, 0, 0), su=12, sv=6)]
    for k in range(4):
        p.append(torus(0.25 - abs(k - 1.5) * 0.06, 0.008, (0, 0, -0.2 + k * 0.13), mat('#c94a33', 0.6, name='lan_rib'), su=24, sv=4))
    prop('lantern', p)


def squish():
    pk = mat('#f59ab8', 0.7, name='squish')
    p = [blob([((0, 0, 0), 0.3, (1.1, 1, 0.95)), ((0.2, 0, 0.22), 0.1), ((-0.2, 0, 0.22), 0.1)], 'sq', pk, res=0.03)]
    for s in (1, -1):
        p.append(sphere((s * 0.1, -0.27, 0.04), (0.035, 0.02, 0.045), IRIS_M))
    p.append(torus(0.045, 0.01, (0, 0, 0), IRIS_M, arc=150, su=10, sv=5))
    p[-1].data.transform(Matrix.Translation((0, -0.29, -0.06)) @ Matrix.Rotation(math.radians(90), 4, 'X') @ Matrix.Rotation(math.radians(195), 4, 'Z'))
    prop('squish', p)


def ticket():
    t = mat('#f4d27a', 0.5, name='ticket')
    p = [box((0.6, 0.04, 0.34), (0, 0, 0), t, bev=0.02),
         box((0.08, 0.05, 0.3), (-0.17, 0, 0), RED, bev=0.01)]
    for k in range(3):
        p.append(box((0.26, 0.05, 0.025), (0.08, -0.002, 0.08 - k * 0.07), mat('#a8743a', 0.5, name='ticket_ink'), bev=0.005))
    prop('ticket', p)


def letter():
    e = mat('#f7f1e1', 0.7, name='envelope')
    p = [box((0.6, 0.05, 0.4), (0, 0, 0), e, bev=0.02),
         prism([(-0.29, 0.19), (0.29, 0.19), (0, -0.04)], 0.06, (0, -0.005, 0), mat('#e9ddc0', 0.7, name='envelope2'), bev=0.005),
         cyl(0.06, 0.07, (0, -0.03, 0.0), RED, rot=(90, 0, 0), seg=14)]
    prop('letter', p)


IRIS_M = mat('#3b2a24', 0.3, name='iris_prop')


def tooth_star():
    # fairy glimmer: small crescent moon
    m = mat('#cfe3ff', 0.2, emit='#9ec3ff', es=1.5, name='moon_glow')
    o = torus(0.22, 0.09, (0, 0, 0), m, arc=230, su=20, sv=10, rot=(90, 0, 0))
    prop('moon', [o])


# ================= OBSTACLES ===================
def stripes(w, h, d, loc, n=6, c1=RED, c2=WHITE):
    p = []
    sw = w / n
    for i in range(n):
        p.append(box((sw, d, h), (loc[0] - w / 2 + sw * (i + .5), loc[1], loc[2]), c1 if i % 2 == 0 else c2, bev=0.012))
    return p


def barrier():
    p = stripes(2.1, 0.3, 0.12, (0, 0, 0.72), 7)
    for s in (1, -1):
        p.append(box((0.1, 0.1, 0.9), (s * 0.85, 0, 0.45), GREY, bev=0.02))
        p.append(box((0.12, 0.6, 0.06), (s * 0.85, 0, 0.03), GREY, bev=0.02))
        p.append(sphere((s * 0.85, -0.07, 0.95), 0.07, mat('#ffb547', 0.4, emit='#ff9a1f', es=1.5, name='blink')))
    prop('barrier', p)


def arch(name, bar_mat=None, deco=None, post=GREY, sign=True):
    p = []
    for s in (1, -1):
        p.append(box((0.16, 0.16, 2.0), (s * 1.12, 0, 1.0), post, bev=0.03))
        p.append(box((0.4, 0.4, 0.08), (s * 1.12, 0, 0.04), post, bev=0.03))
    if bar_mat is None:
        p += stripes(2.4, 0.55, 0.12, (0, 0, 1.48), 8, mat('#f2b134', 0.5, name='yellow'), DARK)
    else:
        p.append(box((2.4, 0.12, 0.55), (0, 0, 1.48), bar_mat, bev=0.03))
    if sign:
        p.append(cyl(0.2, 0.05, (0, -0.1, 1.48), WHITE, rot=(90, 0, 0), seg=20))
        p.append(prism([(-0.09, 0.04), (0.09, 0.04), (0, -0.1)], 0.07, (0, -0.12, 1.47), mat('#3b6fd1', 0.5, name='arrow_blue')))
        p.append(box((0.05, 0.07, 0.08), (0, -0.12, 1.55), mat('#3b6fd1', 0.5, name='arrow_blue'), bev=0.0))
    if deco:
        p += deco()
    prop(name, p)


def flags():
    p = []
    cols = ['#e05d5d', '#f2c14e', '#5cb3d6', '#7cc46a', '#e78bc0']
    for i in range(9):
        x = -1.05 + i * 0.26
        p.append(prism([(-0.11, 0), (0.11, 0), (0, -0.28)], 0.02, (x, -0.08, 1.2), mat(cols[i % 5], 0.6, name='flag' + str(i % 5))))
    return p


def web():
    w = mat('#e9e4f0', 0.6, name='web')
    p = []
    for a in range(0, 181, 30):
        r = math.radians(a)
        o = cyl(0.012, 1.0, (0, 0, 0), w, seg=4)
        o.data.transform(Matrix.Translation((0, -0.1, 1.21)) @ Matrix.Rotation(r, 4, 'Y') @ Matrix.Rotation(math.radians(90), 4, 'Y') @ Matrix.Translation((0, 0, 0.5)))
        p.append(o)
    for k in range(3):
        p.append(torus(0.25 + k * 0.25, 0.012, (0, -0.1, 1.21), w, rot=(-90, 0, 0), arc=180, su=16, sv=4))
        p[-1].data.transform(Matrix.Translation((0, 0, 0)))
    sp = mat('#2c2433', 0.6, name='spider')
    p.append(sphere((0.6, -0.15, 0.95), 0.09, sp))
    p.append(cyl(0.006, 0.28, (0.6, -0.15, 1.1), w, seg=4))
    return p


def arch_web():
    arch('arch_web', mat('#5a4a6b', 0.7, name='spooky_purple'), web, post=mat('#4b3f55', 0.8, name='spooky_post'), sign=False)


def arch_ice():
    ice = mat('#bfe4f2', 0.15, 0.05, name='ice')
    def icicles():
        p = []
        for i in range(10):
            p.append(cone(0.07, 0.3 + (i % 3) * 0.1, (-1.0 + i * 0.22, -0.02, 1.08 - (i % 3) * 0.05), ice, rot=(180, 0, 0), seg=6))
        return p
    arch('arch_ice', ice, icicles, post=mat('#9fcfe2', 0.2, name='ice_post'), sign=True)


def arch_lantern():
    def lans():
        p = []
        for i in range(4):
            x = -0.8 + i * 0.53
            p.append(sphere((x, -0.05, 1.05), (0.13, 0.13, 0.16), mat('#ef6b4f', 0.6, emit='#ff8a4a', es=1.0, name='paper_lantern')))
            p.append(cyl(0.008, 0.18, (x, -0.05, 1.22), DARK, seg=4))
        return p
    arch('arch_lantern', mat('#c8423a', 0.5, name='lacquer'), lans, post=mat('#b23a33', 0.5, name='lacquer_post'), sign=False)


def arch_branch():
    p = []
    for s in (1, -1):
        p.append(cyl(0.3, 1.3, (s * 1.0, 0, 0.65), BARK, seg=12, r2=0.26))
        p.append(cyl(0.29, 0.03, (s * 1.0, 0, 1.31), WOOD_L, seg=12))
    lg = cyl(0.26, 2.9, (0, 0, 1.55), BARK, rot=(0, 90, 0), seg=14)
    p.append(lg)
    for s in (1, -1):
        p.append(cyl(0.25, 0.02, (s * 1.45, 0, 1.55), WOOD_L, rot=(0, 90, 0), seg=14))
    for i in range(5):
        p.append(blob([((-0.9 + i * 0.45, -0.05, 1.8), 0.16), ((-0.8 + i * 0.45, 0.05, 1.85), 0.13)], 'moss%d' % i, LEAF[i % 3], res=0.05))
    prop('arch_branch', p)


def hay():
    o = cyl(0.5, 2.0, (0, 0, 0.5), HAY, rot=(0, 90, 0), seg=24, bev=0.08)
    p = [o]
    for s in (1, -1):
        p.append(cyl(0.38, 0.02, (s * 1.0, 0, 0.5), HAY_D, rot=(0, 90, 0), seg=20))
    for x in (-0.5, 0.5):
        p.append(torus(0.505, 0.02, (x, 0, 0.5), RED, rot=(0, 90, 0), su=24, sv=5))
    prop('hay', p)


def crate(name='crate', size=(2.0, 1.0, 0.95), loc=(0, 0, 0), add=True):
    w, d, h = size
    p = [box((w, d, h), (loc[0], loc[1], loc[2] + h / 2), WOOD, bev=0.04)]
    for s in (1, -1):
        p.append(box((0.12, d + 0.04, h + 0.02), (loc[0] + s * (w / 2 - 0.06), loc[1], loc[2] + h / 2), WOOD_D, bev=0.02))
    p.append(box((w - 0.1, 0.05, 0.1), (loc[0], loc[1] - d / 2 - 0.01, loc[2] + h / 2), WOOD_D, bev=0.015))
    o = prism([(-w / 2 + 0.15, h - 0.12), (-w / 2 + 0.25, h - 0.12), (w / 2 - 0.15, 0.12), (w / 2 - 0.25, 0.12)], 0.05,
              (loc[0], loc[1] - d / 2 - 0.02, loc[2]), WOOD_D)
    p.append(o)
    if add:
        prop(name, p)
    return p


def crate_stack():
    p = crate(size=(2.0, 1.1, 1.0), add=False)
    p += crate(size=(1.3, 1.0, 0.9), loc=(0.25, 0, 1.0), add=False)
    p.append(box((0.7, 0.7, 0.5), (-0.6, 0.0, 1.25), mat('#c9a978', 0.9, name='cardboard'), bev=0.03))
    prop('crate_stack', p)


def cones():
    o = mat('#f07c32', 0.5, name='cone_orange')
    p = [box((2.1, 0.35, 0.06), (0, 0, 0.03), DARK, bev=0.02)]
    for x in (-0.7, 0, 0.7):
        p.append(box((0.5, 0.5, 0.07), (x, 0, 0.06), o, bev=0.03))
        p.append(cyl(0.22, 0.8, (x, 0, 0.48), o, r2=0.04, seg=18))
        p.append(cyl(0.16, 0.12, (x, 0, 0.5), WHITE, r2=0.12, seg=18))
    p.append(box((1.6, 0.06, 0.12), (0, 0, 0.62), WHITE, bev=0.02))
    prop('cones', p)


def cart():
    p = []
    m = METAL
    for s in (1, -1):
        for y in (-0.6, 0.6):
            p.append(cyl(0.1, 0.08, (s * 0.55, y, 0.1), TIRE, rot=(0, 90, 0), seg=12))
    p.append(box((1.3, 1.6, 0.06), (0, 0, 0.32), DARK, bev=0.02))
    # basket wire frame
    for s in (1, -1):
        p.append(box((0.04, 1.6, 0.04), (s * 0.65, 0, 1.25), m, bev=0.0))
        p.append(box((1.3, 0.04, 0.04), (0, s * 0.8, 1.25), m, bev=0.0))
        for k in range(7):
            p.append(box((0.025, 0.025, 0.85), (s * 0.65, -0.75 + k * 0.25, 0.82), m, bev=0))
        for k in range(5):
            p.append(box((0.025, 0.025, 0.85), (-0.6 + k * 0.3, s * 0.8, 0.82), m, bev=0))
    p.append(box((1.3, 0.08, 0.08), (0, 0.95, 1.38), mat('#3da36d', 0.5, name='handle_green'), bev=0.03))
    for i, c in enumerate(['#d9534a', '#f2c14e', '#6fae52']):
        p.append(box((0.4, 0.35, 0.5), (-0.35 + i * 0.35, -0.3 + i * 0.25, 0.6), mat(c, 0.6, name='goods' + str(i)), bev=0.04))
    prop('cart', p)


def wheel(x, y, z=0.38, r=0.38):
    return [cyl(r, 0.26, (x, y, z), TIRE, rot=(0, 90, 0), seg=18, bev=0.05),
            cyl(r * 0.55, 0.28, (x, y, z), METAL, rot=(0, 90, 0), seg=14)]


def car(name, col, van=False):
    c = mat(col, 0.35, 0.15, name='paint_' + name)
    L, W = (4.3, 1.95)
    p = [box((W, L, 0.75), (0, 0, 0.72), c, bev=0.2, seg=3)]
    if van:
        p.append(box((W - 0.06, L * 0.78, 1.25), (0, 0.4, 1.55), c, bev=0.22, seg=3))
        p.append(box((W - 0.1, 0.1, 0.62), (0, -1.16, 1.65), GLASS, bev=0.05))
        p.append(box((0.05, 2.2, 0.55), (W / 2 - 0.02, 0.5, 1.7), GLASS, bev=0.02))
        p.append(box((0.05, 2.2, 0.55), (-W / 2 + 0.02, 0.5, 1.7), GLASS, bev=0.02))
    else:
        p.append(box((W - 0.25, 2.3, 0.7), (0, 0.25, 1.35), c, bev=0.25, seg=3))
        p.append(box((W - 0.3, 0.06, 0.48), (0, -0.92, 1.36), GLASS, bev=0.04, rot=(-25, 0, 0)))
        p.append(box((W - 0.3, 0.06, 0.45), (0, 1.42, 1.36), GLASS, bev=0.04, rot=(25, 0, 0)))
        for s in (1, -1):
            p.append(box((0.05, 1.9, 0.45), (s * (W / 2 - 0.13), 0.25, 1.38), GLASS, bev=0.03))
    for s in (1, -1):
        p += wheel(s * 0.9, -1.35) + wheel(s * 0.9, 1.35)
        p.append(sphere((s * 0.62, -L / 2 + 0.03, 0.82), (0.2, 0.05, 0.12), mat('#fff4cf', 0.2, emit='#fff0c0', es=2.0, name='headlight')))
        p.append(box((0.32, 0.05, 0.14), (s * 0.7, L / 2 - 0.02, 0.85), mat('#d23b3b', 0.3, emit='#a01010', es=0.6, name='taillight'), bev=0.02))
    p.append(box((W + 0.05, 0.18, 0.2), (0, -L / 2 - 0.02, 0.45), GREY, bev=0.06))
    p.append(box((W + 0.05, 0.18, 0.2), (0, L / 2 + 0.02, 0.45), GREY, bev=0.06))
    p.append(box((0.9, 0.05, 0.25), (0, -L / 2 - 0.05, 0.75), DARK, bev=0.03))
    prop(name, p)


def bus():
    c = mat('#f2b134', 0.4, 0.1, name='paint_bus')
    L, W = 9.0, 2.35
    p = [box((W, L, 2.4), (0, 0, 1.6), c, bev=0.25, seg=3),
         box((W + 0.02, L - 0.6, 0.2), (0, 0.2, 1.0), WHITE, bev=0.05),
         box((W - 0.25, 0.08, 1.0), (0, -L / 2, 2.1), GLASS, bev=0.06)]
    for s in (1, -1):
        for k in range(5):
            p.append(box((0.05, 1.3, 0.75), (s * W / 2, -2.8 + k * 1.5, 2.15), GLASS, bev=0.03))
        p += wheel(s * 1.0, -2.9, 0.48, 0.48) + wheel(s * 1.0, 2.9, 0.48, 0.48)
        p.append(sphere((s * 0.85, -L / 2, 0.85), (0.18, 0.05, 0.12), mat('#fff4cf', 0.2, emit='#fff0c0', es=2.0, name='headlight')))
    p.append(box((1.6, 0.06, 0.32), (0, -L / 2 - 0.02, 2.85), mat('#2f4a5e', 0.4, emit='#7ad1ff', es=0.6, name='bus_sign'), bev=0.03))
    prop('bus', p)


def wagon(name='wagon', col='#4f8f7a'):
    c = mat(col, 0.45, 0.2, name='paint_' + name)
    L, W, H = 10.0, 2.3, 2.5
    p = [box((W, L, H - 0.5), (0, 0, 0.5 + (H - 0.5) / 2), c, bev=0.12),
         box((W + 0.1, L + 0.1, 0.12), (0, 0, H + 0.03), mat('#6c7275', 0.6, name='roof'), bev=0.05),
         box((W - 0.3, L - 0.4, 0.3), (0, 0, 0.35), DARK, bev=0.04)]
    for s in (1, -1):
        for k in range(4):
            p.append(box((0.05, 1.5, 0.8), (s * W / 2, -3.4 + k * 2.3, 1.6), GLASS, bev=0.03))
        for y in (-3.6, -2.6, 2.6, 3.6):
            p.append(cyl(0.32, 0.12, (s * 0.75, y, 0.33), METAL, rot=(0, 90, 0), seg=14))
        p.append(box((0.06, L - 0.2, 0.12), (s * (W / 2 + 0.01), 0, 1.0), mat('#f2e2b8', 0.6, name='trim'), bev=0.01))
    p.append(box((1.4, 0.06, 0.9), (0, -L / 2 - 0.01, 1.55), mat('#e8d7a8', 0.5, name='wagon_front'), bev=0.04))
    p.append(cyl(0.18, 0.05, (0, -L / 2 - 0.03, 2.2), mat('#fff4cf', 0.2, emit='#fff0c0', es=2.5, name='headlight'), rot=(90, 0, 0), seg=16))
    prop(name, p)


def ramp():
    c = mat('#c79a5b', 0.8, name='ramp_wood')
    L, W, H = 5.0, 2.3, 2.5
    p = [prism([(-L / 2, 0), (L / 2, 0), (L / 2, H)], W, (0, 0, 0), c, bev=0.03)]
    p[0].data.transform(Matrix.Rotation(math.radians(90), 4, 'Z'))
    for k in range(9):
        y = -L / 2 + 0.3 + k * 0.55
        z = (y + L / 2) / L * H
        o = box((W + 0.04, 0.12, 0.06), (0, y, z + 0.02), WOOD_D, bev=0.01, rot=(math.degrees(math.atan2(H, L)), 0, 0))
        p.append(o)
    for s in (1, -1):
        p.append(box((0.1, 0.1, H), (s * (W / 2 + 0.02), L / 2 - 0.1, H / 2), WOOD_D, bev=0.02))
    prop('ramp', p)


def log():
    p = [cyl(0.36, 2.2, (0, 0, 0.36), BARK, rot=(0, 90, 0), seg=16)]
    for s in (1, -1):
        p.append(cyl(0.33, 0.02, (s * 1.1, 0, 0.36), WOOD_L, rot=(0, 90, 0), seg=16))
        p.append(torus(0.18, 0.01, (s * 1.11, 0, 0.36), WOOD_D, rot=(0, 90, 0), su=16, sv=4))
    p.append(blob([((0.3, 0, 0.7), 0.13), ((0.5, 0.05, 0.68), 0.11), ((-0.6, 0, 0.7), 0.12)], 'mosslog', LEAF[2], res=0.05))
    p.append(cyl(0.1, 0.5, (0.6, -0.1, 0.75), BARK, rot=(-20, 30, 0), seg=8, r2=0.05))
    prop('log', p)


def rock():
    o = ico((0, 0, 0.9), (1.1, 0.9, 1.0), ROCK, sub=2)
    me = o.data
    rr = random.Random(5)
    for v in me.vertices:
        v.co *= 1 + rr.uniform(-0.12, 0.12)
        v.co.z = max(v.co.z, -0.95)
    o2 = ico((0.5, -0.3, 0.4), 0.45, mat('#b7b3a9', 0.9, name='rock2'), sub=1)
    p = [o, o2, blob([((-0.3, 0.1, 1.75), 0.25, (1.4, 1, 0.5)), ((0.3, -0.1, 1.7), 0.2, (1.3, 1, 0.5))], 'moss', LEAF[0], res=0.06)]
    prop('rock', p)


def pumpkin(loc=(0, 0, 0), s=1.0, face=False):
    pm = mat('#e8862e', 0.6, name='pumpkin')
    p = []
    for j in range(8):
        a = j * math.pi * 2 / 8
        p.append(sphere((loc[0] + math.sin(a) * .18 * s, loc[1] + math.cos(a) * .18 * s, loc[2] + .36 * s), (.24 * s, .24 * s, .33 * s), pm, rot=(0, 0, -math.degrees(a)), seg=14, ring=10))
    p.append(cyl(.05 * s, .2 * s, (loc[0], loc[1], loc[2] + .75 * s), mat('#5d7a3a', 0.7, name='stem'), seg=8, rot=(10, 0, 0)))
    if face:
        g = mat('#ffd27a', 0.5, emit='#ffa23c', es=3, name='pumpkin_glow')
        for sx in (-1, 1):
            p.append(prism([(-0.07, 0), (0.07, 0), (0, 0.11)], 0.08, (loc[0] + sx * .14 * s, loc[1] - .39 * s, loc[2] + .45 * s), g))
        p.append(prism([(-0.17, 0.0), (0.17, 0.0), (0.1, -0.08), (0, -0.04), (-0.1, -0.08)], 0.08, (loc[0], loc[1] - .38 * s, loc[2] + .3 * s), g))
    return p


def pumpkins():
    p = pumpkin((-0.65, 0, 0), 1.0, True) + pumpkin((0.2, 0.1, 0), 0.9, True) + pumpkin((0.85, -0.1, 0), 0.75)
    prop('pumpkins', p)


def snowdrift():
    els = []
    for i in range(9):
        els.append(((-1.0 + i * 0.25, R.uniform(-.1, .1), 0.15), R.uniform(0.32, 0.45)))
    o = blob(els, 'drift', SNOW, res=0.06, ratio=0.5)
    o.data.transform(Matrix.Diagonal((1, 1, 1.0, 1)))
    p = [o]
    for i in range(3):
        p.append(ico((-0.7 + i * 0.7, -0.35, 0.05), 0.08, mat('#b8d6e6', 0.2, name='ice_crystal'), sub=0))
    prop('snowdrift', p)


def snowman():
    p = [sphere((0, 0, 0.55), 0.6, SNOW, seg=24, ring=16), sphere((0, 0, 1.38), 0.43, SNOW, seg=24, ring=16), sphere((0, 0, 1.98), 0.3, SNOW, seg=20, ring=14)]
    p.append(cone(0.06, 0.32, (0, -0.4, 1.98), mat('#f08a3c', 0.5, name='carrot'), rot=(90, 0, 0), seg=10))
    for s in (1, -1):
        p.append(sphere((s * 0.1, -0.26, 2.07), 0.035, IRIS_M))
        p.append(cyl(0.03, 0.75, (s * 0.65, 0, 1.55), BARK, rot=(0, s * -60, 0), seg=6))
    p.append(cyl(0.24, 0.32, (0, 0, 2.3), DARK, seg=18))
    p.append(cyl(0.34, 0.04, (0, 0, 2.15), DARK, seg=18))
    p.append(torus(0.32, 0.07, (0, 0, 1.72), mat('#d9534a', 0.8, name='snowman_scarf'), su=20, sv=8))
    for k in range(3):
        p.append(sphere((0, -0.42 + k * 0.03, 1.55 - k * 0.17), 0.04, IRIS_M))
    prop('snowman', p)


def gift_pile():
    p = []
    cfg = [((-0.6, 0, 0), '#d9534a', '#f6d36b', 0.85), ((0.45, 0.05, 0), '#4f8fd1', '#f3efe6', 0.95),
           ((-0.1, -0.05, 0.85), '#6fae52', '#d9534a', 0.65), ((0.5, 0, 0.95), '#e78bc0', '#f6d36b', 0.55)]
    for loc, c, r, s in cfg:
        for o in gift('g', c, r, s):
            o.data.transform(Matrix.Translation(loc))
            p.append(o)
    prop('gift_pile', p)


def bench():
    p = []
    for k in range(3):
        p.append(box((2.0, 0.16, 0.06), (0, -0.2 + k * 0.2, 0.55), WOOD, bev=0.02))
    for k in range(2):
        p.append(box((2.0, 0.06, 0.14), (0, 0.32, 0.8 + k * 0.2), WOOD, bev=0.02))
    for s in (1, -1):
        p.append(box((0.08, 0.6, 0.55), (s * 0.85, 0.05, 0.28), DARK, bev=0.02))
        p.append(box((0.08, 0.06, 0.5), (s * 0.85, 0.35, 0.8), DARK, bev=0.02))
    prop('bench', p)


def barrels():
    p = []
    for x in (-0.6, 0.6):
        p.append(cyl(0.45, 0.95, (x, 0, 0.48), WOOD, seg=18, bev=0.05))
        for z in (0.2, 0.76):
            p.append(torus(0.46, 0.025, (x, 0, z), METAL, su=20, sv=5))
        p.append(cyl(0.4, 0.02, (x, 0, 0.96), WOOD_D, seg=18))
    prop('barrels', p)


def tractor():
    c = mat('#d9534a', 0.4, 0.1, name='paint_tractor')
    p = [box((1.4, 2.6, 0.8), (0, -0.4, 1.0), c, bev=0.15),
         box((1.6, 1.5, 1.4), (0, 0.85, 1.85), c, bev=0.1),
         box((1.45, 1.3, 0.05), (0, 0.85, 2.6), WHITE, bev=0.03),
         box((1.5, 0.05, 0.8), (0, 0.1, 1.95), GLASS, bev=0.03),
         cyl(0.08, 0.7, (0.4, -1.1, 1.7), DARK, seg=10)]
    for s in (1, -1):
        p.append(cyl(0.75, 0.5, (s * 0.95, 1.1, 0.75), TIRE, rot=(0, 90, 0), seg=22, bev=0.08))
        p.append(cyl(0.42, 0.52, (s * 0.95, 1.1, 0.75), mat('#f2c14e', 0.4, name='rim_yellow'), rot=(0, 90, 0), seg=16))
        p.append(cyl(0.45, 0.35, (s * 0.8, -1.2, 0.45), TIRE, rot=(0, 90, 0), seg=18, bev=0.06))
        p.append(cyl(0.25, 0.37, (s * 0.8, -1.2, 0.45), mat('#f2c14e', 0.4, name='rim_yellow'), rot=(0, 90, 0), seg=12))
        p.append(sphere((s * 0.45, -1.72, 1.1), (0.14, 0.05, 0.1), mat('#fff4cf', 0.2, emit='#fff0c0', es=2.0, name='headlight')))
    prop('tractor', p)


# ================= SCENERY ===================
def tree_round(name, seed, h=2.4, cs=1.0, leaf=None, trunk=BARK):
    rr = random.Random(seed)
    p = [cyl(0.2, h, (0, 0, h / 2), trunk, r2=0.12, seg=10)]
    for k in range(2):
        a = rr.uniform(0, 6.28)
        p.append(cyl(0.07, 0.9, (math.cos(a) * 0.25, math.sin(a) * 0.25, h * 0.75), trunk, rot=(math.degrees(math.sin(a) * 0.7), math.degrees(-math.cos(a) * 0.7), 0), seg=6, r2=0.04))
    els = [((0, 0, h + 0.6 * cs), 0.9 * cs)]
    for q in surf_points((0, 0, h + 0.7 * cs), (0.95 * cs, 0.95 * cs, 0.75 * cs), 11, seed, zmin=-0.5):
        els.append((q, rr.uniform(0.45, 0.62) * cs))
    p.append(blob(els, name + 'c', leaf or LEAF[seed % 3], res=0.12 * cs, ratio=0.45))
    prop(name, p)


def pine(name, seed, h=1.0, snowy=False):
    rr = random.Random(seed)
    green = mat('#3f7d5c', 0.85, name='pine') if not snowy else mat('#4f7f6a', 0.85, name='pine_snowy')
    p = [cyl(0.18 * h, 1.2 * h, (0, 0, 0.6 * h), BARK, seg=8)]
    for k in range(4):
        r = (1.45 - k * 0.3) * h
        z = (1.0 + k * 0.85) * h
        c = cyl(r, 1.25 * h, (0, 0, z + 0.6 * h), green, r2=0.05, seg=9)
        for v in c.data.vertices:
            if v.co.z < z + 0.1 * h:
                v.co.z -= rr.uniform(0, 0.15) * h
        p.append(c)
        if snowy:
            s = cyl(r * 0.75, 0.55 * h, (0, 0, z + 0.98 * h), SNOW, r2=0.05, seg=9)
            p.append(s)
    prop(name, p)


def bush(name, seed, col=None):
    rr = random.Random(seed)
    els = [((0, 0, 0.35), 0.45)] + [(q, rr.uniform(0.25, 0.35)) for q in surf_points((0, 0, 0.35), (0.55, 0.45, 0.3), 8, seed, zmin=-0.3)]
    p = [blob(els, name, col or LEAF[(seed + 1) % 3], res=0.08, ratio=0.5)]
    if seed % 2 == 0:
        for q in surf_points((0, 0, 0.4), (0.6, 0.5, 0.38), 7, seed + 9, zmin=0):
            p.append(sphere(q, 0.06, mat(['#f2a7c0', '#f6d36b', '#ffffff'][seed % 3], 0.6, name='flowerb%d' % (seed % 3)), seg=8, ring=6))
    prop(name, p)


def flowers():
    p = []
    cols = ['#f2a7c0', '#f6d36b', '#ffffff', '#b28be0', '#e8605b']
    for i in range(14):
        x, y = R.uniform(-1.2, 1.2), R.uniform(-1.2, 1.2)
        h = R.uniform(0.25, 0.45)
        p.append(cyl(0.015, h, (x, y, h / 2), LEAF[0], seg=4))
        p.append(sphere((x, y, h), (0.08, 0.08, 0.04), mat(cols[i % 5], 0.6, name='petal%d' % (i % 5)), seg=8, ring=5))
        p.append(sphere((x, y, h + 0.02), 0.03, mat('#f2c14e', 0.6, name='flower_c'), seg=6, ring=4))
    prop('flowers', p)


def sunflower_patch():
    p = []
    for i in range(6):
        x, y = (i % 3 - 1) * 0.7 + R.uniform(-.1, .1), (i // 3) * 0.7
        h = R.uniform(1.4, 1.9)
        p.append(cyl(0.04, h, (x, y, h / 2), LEAF[2], seg=6))
        p.append(sphere((x + 0.1, y, h * 0.5), (0.2, 0.03, 0.1), LEAF[0], seg=8, ring=5))
        p.append(cyl(0.3, 0.06, (x, y - 0.03, h), mat('#f2c033', 0.6, name='sunpetal'), rot=(80, 0, 0), seg=14))
        p.append(cyl(0.15, 0.08, (x, y - 0.06, h), mat('#6b4a2a', 0.8, name='suncenter'), rot=(80, 0, 0), seg=12))
    prop('sunflowers', p)


def fence():
    p = []
    w = WHITE
    for k in range(5):
        p.append(box((0.12, 0.12, 1.1), (-2.4 + k * 1.2, 0, 0.55), w, bev=0.02))
        p.append(cone(0.09, 0.12, (-2.4 + k * 1.2, 0, 1.16), w, seg=4, rot=(0, 0, 45)))
    for z in (0.4, 0.85):
        p.append(box((4.9, 0.06, 0.14), (0, 0.06, z), w, bev=0.02))
    prop('fence', p)


def barn():
    r = mat('#c2463e', 0.75, name='barn_red')
    roof = mat('#5a5552', 0.7, name='barn_roof')
    p = [box((6, 5, 3.6), (0, 0, 1.8), r, bev=0.06)]
    p.append(prism([(-3.1, 3.6), (3.1, 3.6), (0, 5.6)], 5.0, (0, 0, 0), r))
    for s in (1, -1):
        o = box((3.6, 5.4, 0.15), (0, 0, 0), roof, bev=0.03)
        o.data.transform(Matrix.Translation((s * 1.62, 0, 4.62)) @ Matrix.Rotation(math.radians(s * 32.8), 4, 'Y'))
        p.append(o)
    p.append(box((2.2, 0.1, 2.6), (0, -2.51, 1.3), WHITE, bev=0.03))
    p.append(box((2.0, 0.12, 2.4), (0, -2.53, 1.25), r, bev=0.02))
    for a in (40, -40):
        o = box((0.12, 0.14, 3.0), (0, 0, 0), WHITE, bev=0.02)
        o.data.transform(Matrix.Translation((0, -2.56, 1.25)) @ Matrix.Rotation(math.radians(a), 4, 'Y'))
        p.append(o)
    p.append(box((1.0, 0.12, 0.8), (0, -2.52, 4.2), WHITE, bev=0.03))
    p.append(box((0.8, 0.14, 0.6), (0, -2.54, 4.2), mat('#3d2f2a', 0.8, name='hayloft'), bev=0.02))
    prop('barn', p)


def farmhouse():
    wall = mat('#f1e3c6', 0.8, name='house_wall')
    roof = mat('#b65e3f', 0.7, name='house_roof')
    p = [box((5, 4, 2.8), (0, 0, 1.4), wall, bev=0.05)]
    p.append(prism([(-2.6, 2.8), (2.6, 2.8), (0, 4.4)], 4.0, (0, 0, 0), wall))
    for s in (1, -1):
        o = box((3.2, 4.5, 0.15), (0, 0, 0), roof, bev=0.03)
        o.data.transform(Matrix.Translation((s * 1.36, 0, 3.65)) @ Matrix.Rotation(math.radians(s * 31.6), 4, 'Y'))
        p.append(o)
    p.append(box((0.5, 0.5, 1.4), (1.3, 0.8, 4.2), mat('#a0624a', 0.8, name='chimney'), bev=0.03))
    p.append(box((0.9, 0.1, 1.8), (0, -2.02, 0.9), WOOD_D, bev=0.03))
    for x in (-1.6, 1.6):
        p.append(box((0.9, 0.1, 0.9), (x, -2.02, 1.6), GLASS, bev=0.03))
        p.append(box((1.05, 0.12, 0.08), (x, -2.04, 1.12), WHITE, bev=0.02))
        for s in (1, -1):
            p.append(box((0.28, 0.08, 0.9), (x + s * 0.6, -2.05, 1.6), mat('#5d8f6b', 0.7, name='shutter'), bev=0.02))
    for s in (1, -1):
        p.append(box((0.08, 1.0, 0.8), (s * 2.52, 0, 1.6), GLASS, bev=0.02))
    p.append(box((2.2, 1.0, 0.12), (0, -2.6, 2.0), roof, bev=0.03, rot=(-15, 0, 0)))
    for s in (1, -1):
        p.append(box((0.1, 0.1, 2.0), (s * 1.0, -3.0, 1.0), WHITE, bev=0.02))
    prop('farmhouse', p)


def windmill():
    w = mat('#efe3cf', 0.8, name='mill_wall')
    p = [cyl(1.6, 7.0, (0, 0, 3.5), w, r2=1.05, seg=16),
         cone(1.35, 1.8, (0, 0, 7.9), mat('#8c4f3a', 0.7, name='mill_roof'), seg=16),
         box((0.9, 0.12, 1.5), (0, -1.56, 0.75), WOOD_D, bev=0.03, rot=(-5, 0, 0)),
         box((0.5, 0.12, 0.6), (0, -1.25, 4.2), GLASS, bev=0.03, rot=(-4, 0, 0))]
    body = prop('windmill', p)
    blades = [cyl(0.3, 0.6, (0, 0, 0), WOOD_D, rot=(90, 0, 0), seg=12)]
    for k in range(4):
        b = box((0.25, 0.08, 3.6), (0, 0, 0), WOOD_L, bev=0.02)
        bl = box((0.9, 0.05, 2.8), (0, 0, 0), mat('#f8f3e6', 0.8, name='sail'), bev=0.01)
        b.data.transform(Matrix.Rotation(math.radians(k * 90), 4, 'Y') @ Matrix.Translation((0, 0, 1.9)))
        bl.data.transform(Matrix.Rotation(math.radians(k * 90), 4, 'Y') @ Matrix.Translation((0.55, -0.02, 2.2)))
        blades += [b, bl]
    bo = join(blades, 'blades')
    bo.location = (0, -1.45, 6.8)
    bo.parent = body


def station():
    wall = mat('#e8d6b4', 0.8, name='station_wall')
    p = [box((7, 4, 3.0), (0, 0, 1.5), wall, bev=0.05),
         box((8.0, 5.0, 0.25), (0, 0, 3.2), mat('#5f7f76', 0.6, name='station_roof'), bev=0.06),
         box((3.0, 0.15, 0.7), (0, -2.1, 3.65), mat('#3e6458', 0.5, name='station_sign'), bev=0.04)]
    for x in (-2.3, 0, 2.3):
        p.append(box((1.1, 0.1, 1.6), (x, -2.02, 1.4), GLASS if x else WOOD_D, bev=0.03))
    p.append(cyl(0.35, 0.08, (2.6, -2.1, 2.6), WHITE, rot=(90, 0, 0), seg=20))
    p.append(cyl(0.38, 0.05, (2.6, -2.08, 2.6), DARK, rot=(90, 0, 0), seg=20))
    prop('station', p)


def building(name, col, floors=4, w=6.0, d=6.0, roofcol='#6b6f78', shop=False):
    c = mat(col, 0.8, name='facade_' + name)
    h = floors * 2.6 + 0.4
    p = [box((w, d, h), (0, 0, h / 2), c, bev=0.05),
         box((w + 0.3, d + 0.3, 0.3), (0, 0, h + 0.1), mat(roofcol, 0.7, name='cornice'), bev=0.05)]
    for f in range(floors):
        z = 1.5 + f * 2.6
        if shop and f == 0:
            p.append(box((w - 1.2, 0.12, 2.0), (0, -d / 2 - 0.02, 1.2), GLASS, bev=0.04))
            p.append(box((w - 0.4, 1.0, 0.12), (0, -d / 2 - 0.5, 2.45), mat('#e86f5a', 0.6, name='awning'), bev=0.03, rot=(-12, 0, 0)))
            continue
        for k in range(3):
            x = -w / 3 + k * w / 3
            p.append(box((1.1, 0.1, 1.35), (x, -d / 2 - 0.02, z), GLASS, bev=0.03))
            p.append(box((1.3, 0.16, 0.1), (x, -d / 2 - 0.05, z - 0.75), mat('#e9e4d8', 0.7, name='sill'), bev=0.02))
        for s in (1, -1):
            for k in range(2):
                y = -d / 4 + k * d / 2
                p.append(box((0.1, 1.1, 1.35), (s * (w / 2 + 0.02), y, z), GLASS, bev=0.03))
    if not shop:
        p.append(box((1.3, 0.12, 2.1), (0, -d / 2 - 0.03, 1.05), WOOD_D, bev=0.04))
    prop(name, p)


def lamp():
    m = mat('#465560', 0.5, 0.4, name='lamp_pole')
    p = [cyl(0.1, 4.6, (0, 0, 2.3), m, seg=10, r2=0.07),
         cyl(0.2, 0.25, (0, 0, 0.12), m, seg=12),
         box((0.08, 1.0, 0.08), (0, -0.45, 4.55), m, bev=0.02),
         cyl(0.22, 0.25, (0, -0.9, 4.45), m, r2=0.08, seg=12),
         sphere((0, -0.9, 4.3), (0.17, 0.17, 0.1), GLOW, seg=12, ring=8)]
    prop('lamp', p)


def bus_stop():
    m = mat('#3d6e8c', 0.5, 0.3, name='stop_frame')
    p = [box((3.2, 1.4, 0.1), (0, 0, 2.5), m, bev=0.03),
         box((3.0, 0.06, 2.2), (0, 0.65, 1.3), mat('#bfe0ec', 0.1, name='stop_glass', alpha=1), bev=0.02),
         box((2.6, 0.4, 0.08), (0, 0.4, 0.55), WOOD, bev=0.02),
         box((0.6, 0.08, 0.6), (0, -0.7, 2.9), mat('#2c8a5a', 0.5, name='stop_sign'), bev=0.03)]
    for s in (1, -1):
        p.append(box((0.1, 0.1, 2.5), (s * 1.5, 0.6, 1.25), m, bev=0.02))
    prop('bus_stop', p)


def shelf():
    m = mat('#e5e2d6', 0.6, name='shelf_white')
    p = [box((1.2, 8.0, 0.2), (0, 0, 0.1), m, bev=0.03), box((0.15, 8.0, 3.2), (0.5, 0, 1.6), m, bev=0.03)]
    cols = ['#d27951', '#c9aa50', '#78946a', '#718f9b', '#c76a8a', '#e3c04f']
    for li, z in enumerate((0.25, 1.0, 1.75, 2.5)):
        p.append(box((1.05, 8.0, 0.06), (0, 0, z), mat('#b8c2b3', 0.5, name='shelf_board'), bev=0.01))
        p.append(box((0.05, 8.0, 0.12), (-0.5, 0, z + 0.05), mat('#f5d18a', 0.5, name='price_tag'), bev=0.0))
        y = -3.8
        k = 0
        while y < 3.7:
            c = mat(cols[(k + li) % 6], 0.6, name='product%d' % ((k + li) % 6))
            if (k + li) % 3 == 0:
                p.append(cyl(0.13, 0.45, (-0.15, y + 0.15, z + 0.26), c, seg=10))
                y += 0.32
            else:
                p.append(box((0.6, 0.28, 0.5), (-0.1, y + 0.15, z + 0.28), c, bev=0.03))
                y += 0.34
            k += 1
    prop('shelf', p)


def checkout():
    p = [box((1.2, 3.0, 0.95), (0, 0, 0.47), mat('#7da38f', 0.6, name='counter_green'), bev=0.05),
         box((1.25, 3.05, 0.06), (0, 0, 0.97), DARK, bev=0.02),
         box((0.5, 0.4, 0.35), (0, 1.0, 1.15), mat('#2d3a40', 0.4, name='register'), bev=0.04),
         box((0.45, 0.05, 0.3), (0, 0.79, 1.3), mat('#7ad1ff', 0.3, emit='#5fbfff', es=0.6, name='screen'), bev=0.02),
         cyl(0.05, 1.6, (0.45, -1.3, 1.6), METAL, seg=8),
         box((0.5, 0.05, 0.35), (0.45, -1.3, 2.4), mat('#f2b134', 0.5, name='yellow'), bev=0.03)]
    prop('checkout', p)


def ceiling_light():
    prop('ceiling_light', [box((2.6, 0.6, 0.1), (0, 0, 0), mat('#fffbe8', 0.5, emit='#fff6da', es=1.5, name='ceiling_glow'), bev=0.03),
                           box((2.7, 0.7, 0.06), (0, 0, 0.07), METAL, bev=0.02)])


def mushroom():
    p = [cyl(0.12, 0.5, (0, 0, 0.25), WHITE, seg=10, r2=0.09),
         blob([((0, 0, 0.55), 0.34, (1, 1, 0.55))], 'cap', mat('#d9534a', 0.5, name='mush_red'), res=0.04)]
    for q in surf_points((0, 0, 0.6), (0.3, 0.3, 0.15), 7, 3, zmin=0.2):
        p.append(sphere(q, 0.045, WHITE, seg=8, ring=5))
    prop('mushroom', p)


def fern():
    p = []
    for k in range(7):
        a = k * 360 / 7
        o = sphere((0, 0, 0), (0.12, 0.55, 0.03), LEAF[2], seg=8, ring=6)
        o.data.transform(Matrix.Rotation(math.radians(a), 4, 'Z') @ Matrix.Translation((0, 0.45, 0.35)) @ Matrix.Rotation(math.radians(-30), 4, 'X'))
        p.append(o)
    prop('fern', p)


def stump():
    p = [cyl(0.45, 0.6, (0, 0, 0.3), BARK, r2=0.38, seg=14), cyl(0.38, 0.02, (0, 0, 0.6), WOOD_L, seg=14),
         torus(0.2, 0.012, (0, 0, 0.61), WOOD_D, su=14, sv=4)]
    for k in range(4):
        a = k * 1.57 + 0.4
        p.append(cyl(0.12, 0.7, (math.cos(a) * 0.45, math.sin(a) * 0.45, 0.06), BARK, rot=(90, 0, math.degrees(a) + 90), seg=6, r2=0.04))
    prop('stump', p)


def big_rock(name, seed):
    rr = random.Random(seed)
    o = ico((0, 0, 1.0), (2.0, 1.6, 1.5), mat('#9b968c', 0.9, name='cliff'), sub=2)
    for v in o.data.vertices:
        v.co *= 1 + rr.uniform(-0.15, 0.15)
    o2 = ico((1.4, 0.6, 0.5), (1.0, 0.9, 0.8), ROCK, sub=1)
    prop(name, [o, o2])


def lighthouse():
    p = []
    for k in range(5):
        c = RED if k % 2 == 0 else WHITE
        r1 = 1.5 - k * 0.18
        p.append(cyl(r1, 2.0, (0, 0, 1.0 + k * 2.0), c, r2=r1 - 0.18, seg=20))
    p.append(cyl(0.9, 0.2, (0, 0, 10.1), DARK, seg=20))
    p.append(cyl(0.6, 1.2, (0, 0, 10.8), mat('#fff2b0', 0.2, emit='#ffd76b', es=3.0, name='beacon'), seg=16))
    p.append(cone(0.85, 0.9, (0, 0, 11.85), RED, seg=16))
    p.append(torus(0.95, 0.05, (0, 0, 10.4), DARK, su=24, sv=5))
    p.append(box((0.7, 0.1, 1.4), (0, -1.48, 0.7), WOOD_D, bev=0.03, rot=(-5, 0, 0)))
    prop('lighthouse', p)


def boat():
    hull = mat('#3f78b5', 0.5, name='boat_hull')
    p = [blob([((0, 0, 0.4), 0.7, (1.0, 2.6, 0.55))], 'hull', hull, res=0.08, ratio=0.5),
         box((1.3, 3.4, 0.1), (0, 0, 0.62), WOOD_L, bev=0.03),
         cyl(0.06, 3.2, (0, 0.3, 2.2), WOOD_D, seg=8),
         prism([(0, 0.8), (0, 3.6), (1.3, 0.8)], 0.04, (0, 0.3, 0), WHITE)]
    p[0].data.transform(Matrix.Translation((0, 0, -0.05)))
    prop('boat', p)


def beach_hut():
    st = [mat('#6ec1d6', 0.7, name='hut_blue'), WHITE]
    p = []
    for k in range(8):
        p.append(box((0.4, 2.4, 2.4), (-1.4 + k * 0.4, 0, 1.4), st[k % 2], bev=0.02))
    p.append(prism([(-1.8, 2.6), (1.8, 2.6), (0, 3.6)], 2.6, (0, 0, 0), mat('#e86f5a', 0.7, name='hut_roof')))
    p.append(box((3.4, 2.6, 0.2), (0, 0, 0.1), WOOD, bev=0.03))
    p.append(box((1.0, 0.1, 1.8), (0, -1.22, 1.1), mat('#f2c14e', 0.6, name='hut_door'), bev=0.03))
    prop('beach_hut', p)


def umbrella():
    p = [cyl(0.04, 2.4, (0, 0, 1.2), WHITE, seg=8)]
    for k in range(8):
        c = mat(['#e86f5a', '#f6e7c8'][k % 2], 0.7, name='umb%d' % (k % 2))
        a0, a1 = k * math.pi / 4, (k + 1) * math.pi / 4
        p.append(prism([(0, 0), (math.cos(a0) * 1.3, math.sin(a0) * 1.3), (math.cos(a1) * 1.3, math.sin(a1) * 1.3)], 0.03, (0, 0, 0), c))
        p[-1].data.transform(Matrix.Translation((0, 0, 2.3)) @ Matrix.Rotation(math.radians(90), 4, 'X'))
    for v in [vv for o in p[1:] for vv in o.data.vertices]:
        d = math.hypot(v.co.x, v.co.y)
        v.co.z -= d * 0.35
    p.append(box((1.6, 0.7, 0.15), (0.6, 0.6, 0.1), mat('#4fa3d9', 0.8, name='towel'), bev=0.03))
    prop('umbrella', p)


def pier_post():
    p = [cyl(0.18, 2.0, (0, 0, 0.6), WOOD_D, seg=10), torus(0.2, 0.05, (0, 0, 1.2), mat('#c9a66b', 0.9, name='rope'), su=14, sv=6)]
    p.append(torus(0.32, 0.1, (0.35, -0.1, 0.9), RED, rot=(80, 0, 20), su=20, sv=8))
    prop('pier_post', p)


def house_snow():
    wall = mat('#a46a4d', 0.8, name='log_wall')
    p = [box((5, 4, 2.6), (0, 0, 1.3), wall, bev=0.06)]
    for k in range(6):
        p.append(cyl(0.12, 5.1, (0, -2.0, 0.2 + k * 0.42), mat('#8a553c', 0.85, name='log_ring'), rot=(0, 90, 0), seg=8))
    p.append(prism([(-2.6, 2.6), (2.6, 2.6), (0, 4.2)], 4.0, (0, 0, 0), wall))
    for s in (1, -1):
        o = box((3.2, 4.6, 0.35), (0, 0, 0), SNOW, bev=0.12)
        o.data.transform(Matrix.Translation((s * 1.36, 0, 3.52)) @ Matrix.Rotation(math.radians(s * 31.6), 4, 'Y'))
        p.append(o)
    for x in (-1.4, 1.4):
        p.append(box((0.9, 0.1, 0.9), (x, -2.03, 1.5), mat('#ffd98a', 0.4, emit='#ffb54d', es=1.5, name='warm_window'), bev=0.03))
        p.append(box((1.1, 0.25, 0.15), (x, -2.1, 1.0), SNOW, bev=0.06))
    p.append(box((0.9, 0.1, 1.8), (0, -2.03, 0.9), WOOD_D, bev=0.03))
    p.append(box((0.5, 0.5, 1.2), (-1.3, 0.8, 4.0), DARK, bev=0.03))
    p.append(box((0.6, 0.6, 0.2), (-1.3, 0.8, 4.65), SNOW, bev=0.08))
    prop('house_snow', p)


def xmas_tree():
    green = mat('#2f7a55', 0.8, name='xmas_green')
    p = [cyl(0.3, 1.0, (0, 0, 0.5), BARK, seg=10)]
    for k in range(5):
        r = 2.4 - k * 0.45
        z = 1.0 + k * 1.3
        p.append(cyl(r, 1.8, (0, 0, z + 0.9), green, r2=0.1, seg=12))
    cols = ['#ff6b6b', '#ffd36b', '#6bc8ff', '#ff9be0']
    for i in range(36):
        t = i / 36
        a = i * 2.4
        z = 1.2 + t * 6.0
        r = 2.3 * (1 - t) + 0.25
        p.append(sphere((math.cos(a) * r, math.sin(a) * r, z), 0.12, mat(cols[i % 4], 0.3, emit=cols[i % 4], es=2.0, name='bulb%d' % (i % 4)), seg=8, ring=6))
    p.append(prism(star_pts(5, 0.6, 0.27), 0.2, (0, 0, 8.3), mat('#ffd75e', 0.3, 0.3, emit='#ffb92e', es=2.0, name='star_glow')))
    prop('xmas_tree', p)


def sakura_tree(name, seed):
    pink = [mat('#f6b8cf', 0.8, name='sakura1'), mat('#f9cfe0', 0.8, name='sakura2')]
    rr = random.Random(seed)
    p = [cyl(0.25, 2.2, (0, 0, 1.1), mat('#6b4a44', 0.9, name='sakura_bark'), r2=0.16, seg=10)]
    for k in range(3):
        a = k * 2.1 + rr.uniform(0, 1)
        p.append(cyl(0.11, 1.6, (math.cos(a) * 0.5, math.sin(a) * 0.5, 2.5), mat('#6b4a44', 0.9, name='sakura_bark'),
                     rot=(math.degrees(math.sin(a) * 0.8), math.degrees(-math.cos(a) * 0.8), 0), seg=6, r2=0.05))
    for k in range(2):
        els = [(q, rr.uniform(0.5, 0.75)) for q in surf_points((0, 0, 3.4), (1.6, 1.6, 0.8), 9, seed + k, zmin=-0.3)]
        p.append(blob(els, name + 'c%d' % k, pink[k], res=0.14, ratio=0.45))
    prop(name, p)


def stone_lantern():
    s = mat('#a9a59b', 0.9, name='stone')
    p = [box((0.7, 0.7, 0.2), (0, 0, 0.1), s, bev=0.04), cyl(0.15, 1.0, (0, 0, 0.7), s, seg=8),
         box((0.6, 0.6, 0.5), (0, 0, 1.45), s, bev=0.04), box((0.4, 0.62, 0.3), (0, 0, 1.45), mat('#ffd98a', 0.4, emit='#ffb54d', es=2, name='warm_window'), bev=0.02),
         cyl(0.6, 0.35, (0, 0, 1.85), s, r2=0.1, seg=4, rot=(0, 0, 45)), sphere((0, 0, 2.1), 0.1, s, seg=8, ring=6)]
    prop('stone_lantern', p)


def gate():
    r = mat('#c8423a', 0.5, name='lacquer_post')
    p = []
    for s in (1, -1):
        p.append(cyl(0.22, 5.0, (s * 3.0, 0, 2.5), r, seg=12))
        p.append(cyl(0.3, 0.3, (s * 3.0, 0, 0.15), DARK, seg=12))
    p.append(box((8.0, 0.5, 0.35), (0, 0, 5.0), DARK, bev=0.05))
    p.append(box((7.2, 0.4, 0.3), (0, 0, 4.0), r, bev=0.04))
    p.append(box((0.4, 0.3, 1.0), (0, 0, 4.5), r, bev=0.03))
    prop('gate', p)


def dead_tree():
    b = mat('#4b3f46', 0.9, name='dead_bark')
    p = [cyl(0.3, 3.2, (0, 0, 1.6), b, r2=0.15, seg=8)]
    rr = random.Random(3)
    for k in range(6):
        a = k * 1.1
        z = 1.8 + k * 0.35
        p.append(cyl(0.08, 1.5, (math.cos(a) * 0.6, math.sin(a) * 0.6, z + 0.4), b, rot=(math.degrees(math.sin(a) * 1.0), math.degrees(-math.cos(a) * 1.0), 0), seg=5, r2=0.02))
    prop('dead_tree', p)


def ghost():
    g = mat('#f2eef7', 0.4, emit='#d9d0ff', es=0.4, name='ghost')
    els = [((0, 0, 1.4), 0.5, (1, 0.9, 1.1)), ((0, 0, 1.0), 0.42)]
    for i in range(-1, 2):
        els.append(((i * 0.25, 0, 0.62), 0.2))
    p = [blob(els, 'ghost', g, res=0.05)]
    for s in (1, -1):
        p.append(sphere((s * 0.14, -0.42, 1.5), (0.06, 0.03, 0.09), IRIS_M))
        p.append(sphere((s * 0.45, -0.1, 1.15), (0.18, 0.1, 0.08), g))
    p.append(sphere((0, -0.43, 1.32), (0.05, 0.03, 0.06), IRIS_M))
    prop('ghost', p)


def spooky_house():
    wall = mat('#5d5168', 0.8, name='spooky_wall')
    roof = mat('#3a3142', 0.7, name='spooky_roof')
    p = [box((5, 4, 4.5), (0, 0, 2.25), wall, bev=0.05),
         prism([(-2.7, 4.5), (2.7, 4.5), (0, 7.0)], 4.2, (0, 0, 0), roof),
         cyl(0.9, 3.2, (2.2, -1.2, 4.0), wall, seg=10), cone(1.15, 2.2, (2.2, -1.2, 6.6), roof, seg=10)]
    for x, z in [(-1.3, 1.6), (1.0, 1.6), (-1.3, 3.4), (0.4, 3.4), (2.2, 4.2)]:
        p.append(box((0.8, 0.1, 1.0), (x, -2.02 if x < 2 else -2.1, z), mat('#ffcf6b', 0.4, emit='#ff9a2e', es=2, name='spooky_window'), bev=0.03))
    p.append(box((0.9, 0.1, 1.6), (0, -2.02, 0.8), WOOD_D, bev=0.03))
    prop('spooky_house', p)


def garland_post():
    p = [cyl(0.08, 4.5, (0, 0, 2.25), WOOD_D, seg=8)]
    cols = ['#ffd36b', '#ff8a6b', '#8ad1ff']
    for k in range(6):
        p.append(sphere((0.0, -0.3 - k * 0.5, 4.2 - math.sin(k / 5 * math.pi) * 0.6), 0.1, mat(cols[k % 3], 0.3, emit=cols[k % 3], es=2.5, name='bulbg%d' % (k % 3)), seg=8, ring=6))
    prop('garland_post', p)


def balloons():
    p = []
    cols = ['#e05d5d', '#f2c14e', '#5cb3d6', '#7cc46a', '#e78bc0']
    for i in range(5):
        x, y, z = R.uniform(-0.5, 0.5), R.uniform(-0.4, 0.4), 2.4 + R.uniform(0, 0.8)
        p.append(sphere((x, y, z), (0.32, 0.32, 0.4), mat(cols[i], 0.25, name='balloon%d' % i), seg=16, ring=10))
        p.append(cyl(0.006, z - 0.35, (x / 2, y / 2, (z - 0.35) / 2), WHITE, seg=4))
    p.append(box((0.5, 0.5, 0.3), (0, 0, 0.15), mat('#8a6ac0', 0.6, name='balloon_weight'), bev=0.05))
    prop('balloons', p)


def finish_arch():
    banner = mat('#ffffff', 0.6, name='banner')
    p = []
    for s in (1, -1):
        p.append(cyl(0.3, 5.0, (s * 5.2, 0, 2.5), mat('#f2c14e', 0.5, name='finish_post'), seg=14))
        for k in range(4):
            p.append(sphere((s * 5.2, -0.05, 5.3 + k * 0.05), (0.45, 0.45, 0.5), mat(['#e05d5d', '#5cb3d6', '#7cc46a', '#e78bc0'][k], 0.25, name='balloon%d' % k), seg=14, ring=10))
            p[-1].data.transform(Matrix.Translation((s * (k - 1.5) * 0.25, k % 2 * 0.3, 0)))
    p.append(box((10.4, 0.3, 1.5), (0, 0, 4.4), banner, bev=0.06))
    prop('finish_arch', p)


def checker_banner():
    pass


def cloud(name, seed):
    rr = random.Random(seed)
    els = [((0, 0, 0), 1.6, (1.6, 1, 0.7))]
    for i in range(9):
        els.append(((rr.uniform(-2.6, 2.6), rr.uniform(-0.8, 0.8), rr.uniform(-0.2, 0.7)), rr.uniform(0.9, 1.4)))
    o = blob(els, name, mat('#ffffff', 0.9, emit='#e8f0ff', es=0.35, name='cloud'), res=0.25, ratio=0.4)
    prop(name, [o])


# ---------------- build all -----------------
for fn in [coin, heart, magnet, shield, x2, boots, seeds, backpack, star, lantern_item, squish, ticket, letter, tooth_star,
           barrier, hay, crate_stack, cones, cart, bus, ramp, log, rock, pumpkins, snowdrift, snowman, gift_pile, bench, barrels, tractor,
           fence, barn, farmhouse, windmill, station, lamp, bus_stop, shelf, checkout, ceiling_light, mushroom, fern, stump,
           lighthouse, boat, beach_hut, umbrella, pier_post, house_snow, xmas_tree, stone_lantern, gate, dead_tree, ghost, spooky_house,
           garland_post, balloons, flowers, sunflower_patch, finish_arch]:
    fn()
prop('gift', gift())
crate()
arch('arch', None)
arch('arch_flags', mat('#7cc46a', 0.6, name='festival_green'), flags, post=WOOD_D, sign=True)
arch_web(); arch_ice(); arch_lantern(); arch_branch()
car('car', '#e2574c'); car('car2', '#4f97c9'); car('car3', '#f2c14e'); car('van', '#f1ede4', van=True)
wagon('wagon', '#4f8f7a'); wagon('wagon2', '#c2604a'); wagon('wagon3', '#d9a441')
tree_round('tree_a', 1); tree_round('tree_b', 2, h=2.0, cs=0.8); tree_round('tree_c', 4, h=2.8, cs=1.15)
tree_round('tree_autumn', 6, h=2.4, cs=1.0, leaf=mat('#e39a46', 0.85, name='leaf_autumn'))
pine('pine_a', 1, 1.0); pine('pine_b', 2, 1.3); pine('pine_snow', 3, 1.1, snowy=True)
bush('bush_a', 2); bush('bush_b', 3)
building('bld_a', '#d8b49a', 4); building('bld_b', '#a9c2b0', 3); building('bld_c', '#b5c4cf', 5, roofcol='#8a6f5a')
building('bld_d', '#e6cf9d', 2, w=7, shop=True); building('market_front', '#eef0e6', 2, w=10, shop=True, roofcol='#4f9a68')
big_rock('cliff_a', 3); big_rock('cliff_b', 8)
sakura_tree('sakura_a', 1); sakura_tree('sakura_b', 5)
cloud('cloud_a', 1); cloud('cloud_b', 7)

# merge vertices / triangulate count
tris = 0
for o in PROPS:
    o.location = (0, 0, 0) if o.name != 'blades' else o.location
    tris += sum(len(p.vertices) - 2 for p in o.data.polygons)
print('PROPS', len(PROPS), 'tris', tris)
for o in sorted(PROPS, key=lambda o: -sum(len(p.vertices) - 2 for p in o.data.polygons))[:12]:
    print(o.name, sum(len(p.vertices) - 2 for p in o.data.polygons))
export(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'www', 'assets', 'props.glb'))
print('PROPS OK')
