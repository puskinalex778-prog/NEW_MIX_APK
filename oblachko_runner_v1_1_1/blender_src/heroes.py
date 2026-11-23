# Two-legged lambs for «Облачко: Большой забег».
# Every hero stands on its hind legs, front legs work as arms.
# Run:  python3 blender_src/heroes.py        (needs `pip install bpy`)
import os, sys, math, random
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from common import *

OUT = os.path.join(HERE, '..', 'www', 'assets', 'heroes.glb')
reset()

EYE_W = mat('#ffffff', 0.25, name='eye_white')
IRIS = mat('#2b1d18', 0.2, name='iris')
IRIS_RING = mat('#7a5a3c', 0.3, name='iris_ring')
SHINE = mat('#ffffff', 0.1, emit='#ffffff', es=0.6, name='eye_shine')
LID = None

HC = Vector((0, 0.05, 1.33))      # head centre
NECK = (0, 0.02, 1.08)            # head pivot


def wool_body(key, col, seed):
    m = mat(col, 0.95, name='wool_' + key)
    c = (0, 0, 0.75)
    els = [(c, 0.32, (0.86, 0.85, 1.12))]
    rnd = random.Random(seed)
    for p in surf_points(c, (0.27, 0.27, 0.36), 70, seed):
        els.append((p, rnd.uniform(0.11, 0.145)))
    # shoulder puffs (sleeves) and chest fluff
    for s in (1, -1):
        for p in surf_points((s * 0.27, 0.04, 0.96), (0.06, 0.06, 0.05), 6, seed + (5 if s > 0 else 9)):
            els.append((p, 0.085))
    for p in surf_points((0, 0.24, 0.9), (0.16, 0.08, 0.14), 10, seed + 3):
        els.append((p, 0.1))
    return blob(els, key + '_body', m, res=0.028, thresh=0.6, ratio=0.35)


def wool_tuft(key, col, center, n=16, rad=(0.15, 0.12, 0.08), seed=7, size=0.075):
    m = mat(col, 0.95, name='wool_' + key)
    els = [(center, size * 1.4)]
    for p in surf_points(center, rad, n, seed, zmin=-0.2):
        els.append((p, size))
    return blob(els, key + '_tuft', m, res=0.02, thresh=0.6, ratio=0.4)


def leg(name, s, skin, hoof):
    x = s * 0.12
    hip = (x, 0.0, 0.52)
    sk = mat(skin, 0.7, name='skin_' + skin.lstrip('#'))
    hf = mat(hoof, 0.45, name='hoof_' + hoof.lstrip('#'))
    parts = [
        cyl(0.062, 0.42, (x, 0.0, 0.31), sk, r2=0.055, seg=14),
        sphere((x, 0.0, 0.5), (0.085, 0.085, 0.07), sk, seg=12, ring=8),
        sphere((x, 0.0, 0.14), (0.065, 0.065, 0.055), sk, seg=10, ring=8),
        # hoof "shoe" a bit longer forward so it reads as a foot
        sphere((x, 0.035, 0.065), (0.085, 0.115, 0.07), hf, seg=16, ring=10),
        box((0.15, 0.2, 0.03), (x, 0.035, 0.015), hf, bev=0.012),
    ]
    return join(parts, name, origin=hip)


def arm(name, s, skin, hoof):
    sh = (s * 0.29, 0.04, 0.97)
    sk = mat(skin, 0.7, name='skin_' + skin.lstrip('#'))
    hf = mat(hoof, 0.45, name='hoof_' + hoof.lstrip('#'))
    parts = [
        cyl(0.052, 0.34, (s * 0.355, 0.06, 0.8), sk, r2=0.047, seg=12, rot=(0, s * -14, 0)),
        sphere((s * 0.395, 0.065, 0.625), (0.064, 0.064, 0.072), hf, seg=12, ring=8),
        sphere((s * 0.31, 0.05, 0.95), (0.07, 0.07, 0.07), sk, seg=10, ring=8),
    ]
    return join(parts, name, origin=sh)


def eye(s, x=0.082, y=0.205, z=1.39, big=1.0):
    return [
        sphere((s * x, HC.y + y - 0.05 + 0.0, z), (0.072 * big, 0.05, 0.085 * big), EYE_W, seg=18, ring=12),
        sphere((s * (x - 0.008), HC.y + y - 0.05 + 0.04, z - 0.012), (0.04 * big, 0.022, 0.047 * big), IRIS_RING, seg=14, ring=10),
        sphere((s * (x - 0.008), HC.y + y - 0.05 + 0.052, z - 0.012), (0.026 * big, 0.016, 0.031 * big), IRIS, seg=12, ring=8),
        sphere((s * (x - 0.022), HC.y + y - 0.05 + 0.066, z + 0.016), 0.014, SHINE, seg=8, ring=6),
    ]


def build_lamb(key, wool, face, hoof, scarf, acc, body_scale=1.0, head_scale=1.0, seed=1, lashes=False, tuft=True, blush=None):
    root = D.objects.new('hero_' + key, None)
    link(root)
    fm = mat(face, 0.62, name='face_' + key)
    mouth = mat('#6b3f3a' if face_dark(face) else '#5a3530', 0.5, name='mouth_' + key)
    nost = mat('#1b1412' if face_dark(face) else '#c97b80', 0.4, name='nostril_' + key)
    ear_in = mat('#a06f68' if face_dark(face) else '#f0b3b0', 0.6, name='earin_' + key)

    body = wool_body(key, wool, seed)
    tail = join([wool_tuft(key + 't', wool, (0, -0.33, 0.6), n=9, rad=(0.07, 0.05, 0.07), size=0.055)],
                'tail', origin=(0, -0.28, 0.6))
    legs = [leg('leg_l', 1, face, hoof), leg('leg_r', -1, face, hoof)]
    arms = [arm('arm_l', 1, face, hoof), arm('arm_r', -1, face, hoof)]

    # head ------------------------------------------------------------
    hp = []
    hp.append(sphere(HC, (0.2, 0.2, 0.215), fm, seg=28, ring=18))
    hp.append(sphere((0, HC.y + 0.15, HC.z - 0.085), (0.135, 0.12, 0.105), fm, seg=24, ring=14))
    hp += eye(1) + eye(-1)
    # nostrils + smile
    for s in (1, -1):
        hp.append(sphere((s * 0.035, HC.y + 0.262, HC.z - 0.07), (0.018, 0.01, 0.012), nost, seg=8, ring=6))
    sm_ = torus(0.042, 0.009, (0, 0, 0), mouth, arc=140, su=10, sv=6)
    sm_.data.transform(Matrix.Translation((0, HC.y + 0.255, HC.z - 0.125)) @ Matrix.Rotation(math.radians(90), 4, 'X') @ Matrix.Rotation(math.radians(200), 4, 'Z'))
    hp.append(sm_)
    for s in (1, -1):
        if blush:
            hp.append(sphere((s * 0.13, HC.y + 0.17, HC.z - 0.06), (0.035, 0.015, 0.024), mat(blush, 0.6, name='blush_' + key), seg=10, ring=6))
        # floppy ears sticking out sideways
        e1 = sphere((s * 0.25, HC.y - 0.02, HC.z + 0.03), (0.15, 0.05, 0.065), fm, rot=(0, s * 18, s * -12), seg=16, ring=10)
        e2 = sphere((s * 0.255, HC.y + 0.012, HC.z + 0.028), (0.105, 0.02, 0.04), ear_in, rot=(0, s * 18, s * -12), seg=12, ring=8)
        hp += [e1, e2]
        if lashes:
            for k in range(3):
                hp.append(cone(0.011, 0.05, (s * (0.05 + k * 0.03), HC.y + 0.2, HC.z + 0.135 - abs(k - 1) * 0.01), mouth,
                               rot=(-20, s * (k - 1) * 25, 0), seg=6))
    if tuft:
        hp.append(wool_tuft(key + 'h', wool, (0, HC.y + 0.02, HC.z + 0.2), n=18, rad=(0.13, 0.12, 0.05), seed=seed + 11))
        # little fringe falling onto the forehead
        hp.append(wool_tuft(key + 'f', wool, (0, HC.y + 0.13, HC.z + 0.16), n=7, rad=(0.08, 0.04, 0.03), seed=seed + 12, size=0.05))
    for o in hp:
        if o.rotation_euler != Euler((0, 0, 0)):
            o.data.transform(o.matrix_basis)
            o.matrix_basis = Matrix.Identity(4)
    hp += acc(key)
    head = join(hp, 'head', origin=NECK)
    head.scale = (head_scale,) * 3

    # scarf -----------------------------------------------------------
    sm = mat(scarf[0], 0.9, name='scarf_' + key)
    sparts = [torus(0.165, 0.055, (0, 0.03, 1.07), sm, rot=(12, 0, 0), su=28, sv=10)]
    if len(scarf) > 1:
        st = mat(scarf[1], 0.9, name='scarfstripe_' + key)
        sparts.append(torus(0.172, 0.02, (0, 0.03, 1.11), st, rot=(12, 0, 0), su=28, sv=8))
    scarf_ring = join(sparts, 'scarf')
    tparts = [box((0.11, 0.04, 0.3), (0.07, -0.2, 0.93), sm, bev=0.018, rot=(-8, 0, 6))]
    if len(scarf) > 1:
        tparts.append(box((0.115, 0.045, 0.03), (0.07, -0.205, 0.85), mat(scarf[1], 0.9, name='scarfstripe_' + key), bev=0.01, rot=(-8, 0, 6)))
    tparts.append(cyl(0.06, 0.035, (0.068, -0.21, 0.775), mat(scarf[-1], 0.9, name='scarfstripe_' + key), rot=(-8, 0, 6), seg=10))
    scarf_tail = join(tparts, 'scarf_tail', origin=(0.06, -0.17, 1.07))

    for o in [body, tail, scarf_ring, scarf_tail, head] + legs + arms:
        o.parent = root
    root.scale = (body_scale,) * 3
    return root


def face_dark(h):
    h = h.lstrip('#')
    return sum(int(h[i:i + 2], 16) for i in (0, 2, 4)) < 380


def acc_oblachko(key):
    # clover clip in the wool tuft
    g = mat('#5fae58', 0.6, name='clover')
    parts = []
    cx, cy, cz = 0.1, HC.y + 0.06, HC.z + 0.25
    for a in (0, 120, 240):
        r = math.radians(a)
        parts.append(sphere((cx + math.cos(r) * 0.028, cy, cz + math.sin(r) * 0.028), (0.03, 0.012, 0.03), g, seg=10, ring=6))
    parts.append(sphere((cx, cy + 0.006, cz), 0.011, mat('#f2c14e', 0.5, name='clover_c'), seg=8, ring=6))
    return parts


def acc_pugovka(key):
    hat = mat('#f4b13e', 0.9, name='beanie')
    rim = mat('#e0703f', 0.9, name='beanie_rim')
    parts = [sphere((0, HC.y - 0.03, HC.z + 0.2), (0.2, 0.2, 0.16), hat, seg=24, ring=14)]
    parts.append(torus(0.19, 0.038, (0, HC.y - 0.015, HC.z + 0.165), rim, rot=(-10, 0, 0), su=28, sv=10))
    parts.append(ico((0, HC.y - 0.06, HC.z + 0.38), 0.06, rim, sub=2, smooth=True))
    parts.append(torus(0.165, 0.018, (0, HC.y - 0.025, HC.z + 0.26), rim, rot=(-10, 0, 0), su=28, sv=8))
    return parts


def acc_bella(key):
    pink = mat('#ec6f9f', 0.45, name='bow')
    dark = mat('#cf4f82', 0.45, name='bow_knot')
    bx, by, bz = 0.15, HC.y + 0.0, HC.z + 0.24
    parts = [
        sphere((bx - 0.085, by, bz + 0.02), (0.095, 0.04, 0.065), pink, rot=(0, -25, 10), seg=16, ring=10),
        sphere((bx + 0.085, by, bz - 0.02), (0.095, 0.04, 0.065), pink, rot=(0, 25, -10), seg=16, ring=10),
        sphere((bx, by + 0.008, bz), 0.04, dark, seg=12, ring=8),
    ]
    for o in parts:
        o.data.transform(o.matrix_basis)
        o.matrix_basis = Matrix.Identity(4)
    return parts


# Облачко — белая шерсть, тёмная мордочка, бирюзовый шарф
build_lamb('oblachko', '#f8f5ee', '#3e3431', '#221a18', ('#2f8f8a', '#f2c14e'), acc_oblachko, seed=3)
# Пуговка — младший брат: карамельная мордочка, шапочка
build_lamb('pugovka', '#fbf8f2', '#b8896a', '#5e4033', ('#6cc3a8',), acc_pugovka, body_scale=0.82, head_scale=1.16, seed=5, tuft=False, blush='#e79b8e')
# Белла — кремовая шерсть, светлая мордочка, бант
build_lamb('bella', '#f7eadb', '#f1d8c4', '#6e4c3d', ('#b8325a', '#f6c6d6'), acc_bella, seed=9, lashes=True, blush='#f2a7a4')

if __name__ == '__main__':
    export(os.path.abspath(OUT))
    print('HEROES OK', len(D.objects))
