import bpy, bmesh, math, random
from mathutils import Vector, Matrix, Euler

C = bpy.context
D = bpy.data
MATS = {}


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    MATS.clear()


def srgb2lin(h):
    h = h.lstrip('#')
    out = []
    for i in (0, 2, 4):
        c = int(h[i:i + 2], 16) / 255
        out.append(c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4)
    return out


def mat(hexc, rough=0.65, metal=0.0, emit=None, es=1.0, name=None, alpha=1.0):
    key = (hexc, rough, metal, emit, es, name, alpha)
    if key in MATS:
        return MATS[key]
    m = D.materials.new(name or "c%s_%d" % (hexc.lstrip('#'), len(MATS)))
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*srgb2lin(hexc), 1)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    if emit:
        b.inputs["Emission Color"].default_value = (*srgb2lin(emit), 1)
        b.inputs["Emission Strength"].default_value = es
    if alpha < 1:
        b.inputs["Alpha"].default_value = alpha
        try:
            m.surface_render_method = 'BLENDED'
        except Exception:
            pass
    MATS[key] = m
    return m


def link(o, parent=None):
    C.scene.collection.objects.link(o)
    if parent is not None:
        o.parent = parent
    return o


def xf(loc=(0, 0, 0), rot=(0, 0, 0), scale=(1, 1, 1)):
    if not isinstance(scale, (tuple, list)):
        scale = (scale, scale, scale)
    S = Matrix.Diagonal((*scale, 1))
    R = Euler([math.radians(a) for a in rot], 'XYZ').to_matrix().to_4x4()
    return Matrix.Translation(loc) @ R @ S


def finish(bm, name, m, smooth=True, sharp=None):
    me = D.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    o = D.objects.new(name, me)
    link(o)
    if m is not None:
        me.materials.append(m)
    if smooth:
        me.polygons.foreach_set("use_smooth", [True] * len(me.polygons))
        if sharp is not None:
            try:
                me.set_sharp_from_angle(angle=math.radians(sharp))
            except Exception:
                pass
    return o


def sphere(loc=(0, 0, 0), r=1, m=None, rot=(0, 0, 0), seg=20, ring=12, name="sph"):
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=ring, radius=1)
    if not isinstance(r, (tuple, list)):
        r = (r, r, r)
    bmesh.ops.transform(bm, matrix=xf(loc, rot, r), verts=bm.verts)
    return finish(bm, name, m)


def ico(loc=(0, 0, 0), r=1, m=None, rot=(0, 0, 0), sub=1, name="ico", smooth=False):
    bm = bmesh.new()
    bmesh.ops.create_icosphere(bm, subdivisions=sub, radius=1)
    if not isinstance(r, (tuple, list)):
        r = (r, r, r)
    bmesh.ops.transform(bm, matrix=xf(loc, rot, r), verts=bm.verts)
    return finish(bm, name, m, smooth=smooth)


def box(size=(1, 1, 1), loc=(0, 0, 0), m=None, bev=0.04, rot=(0, 0, 0), seg=2, name="box"):
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1)
    bmesh.ops.scale(bm, vec=size, verts=bm.verts)
    if bev > 0:
        bev = min(bev, min(size) * 0.45)
        bmesh.ops.bevel(bm, geom=list(bm.edges), offset=bev, segments=seg, affect='EDGES', profile=0.5)
    bmesh.ops.transform(bm, matrix=xf(loc, rot), verts=bm.verts)
    return finish(bm, name, m, sharp=40)


def cyl(r=0.5, h=1, loc=(0, 0, 0), m=None, rot=(0, 0, 0), seg=16, r2=None, bev=0.0, name="cyl", sharp=50):
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=seg, radius1=r,
                          radius2=r if r2 is None else r2, depth=h)
    if bev > 0:
        rim = [e for e in bm.edges if len(e.link_faces) == 2 and
               any(len(f.verts) > 4 for f in e.link_faces)]
        bmesh.ops.bevel(bm, geom=rim, offset=bev, segments=2, affect='EDGES')
    bmesh.ops.transform(bm, matrix=xf(loc, rot), verts=bm.verts)
    return finish(bm, name, m, sharp=sharp)


def cone(r=0.5, h=1, loc=(0, 0, 0), m=None, rot=(0, 0, 0), seg=12, name="cone"):
    return cyl(r, h, loc, m, rot, seg, r2=0.0, name=name)


def torus(R=1, r=0.2, loc=(0, 0, 0), m=None, rot=(0, 0, 0), su=32, sv=12, arc=360, name="tor", scale=(1, 1, 1)):
    bm = bmesh.new()
    full = arc >= 360
    nu = su if full else su + 1
    rows = []
    for i in range(nu):
        a = math.radians(arc) * i / su
        row = []
        for j in range(sv):
            b = 2 * math.pi * j / sv
            x = (R + r * math.cos(b)) * math.cos(a)
            y = (R + r * math.cos(b)) * math.sin(a)
            z = r * math.sin(b)
            row.append(bm.verts.new((x, y, z)))
        rows.append(row)
    for i in range(su if full else su):
        i2 = (i + 1) % nu
        for j in range(sv):
            j2 = (j + 1) % sv
            bm.faces.new((rows[i][j], rows[i2][j], rows[i2][j2], rows[i][j2]))
    if not full:
        for row in (rows[0], rows[-1]):
            try:
                bm.faces.new(row if row is rows[-1] else list(reversed(row)))
            except Exception:
                pass
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bmesh.ops.transform(bm, matrix=xf(loc, rot, scale), verts=bm.verts)
    return finish(bm, name, m)


def prism(pts2d, depth, loc=(0, 0, 0), m=None, rot=(0, 0, 0), bev=0.0, name="prism"):
    """Extrude a 2D polygon (x,z plane) along Y by depth (centred)."""
    bm = bmesh.new()
    vs = [bm.verts.new((x, -depth / 2, z)) for x, z in pts2d]
    f = bm.faces.new(vs)
    res = bmesh.ops.extrude_face_region(bm, geom=[f])
    nv = [g for g in res['geom'] if isinstance(g, bmesh.types.BMVert)]
    bmesh.ops.translate(bm, vec=(0, depth, 0), verts=nv)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    if bev > 0:
        bmesh.ops.bevel(bm, geom=list(bm.edges), offset=bev, segments=2, affect='EDGES')
    bmesh.ops.transform(bm, matrix=xf(loc, rot), verts=bm.verts)
    return finish(bm, name, m, sharp=40)


def star_pts(n=5, ro=1, ri=0.45, rot=90):
    pts = []
    for i in range(n * 2):
        a = math.radians(rot) + math.pi * i / n
        rr = ro if i % 2 == 0 else ri
        pts.append((math.cos(a) * rr, math.sin(a) * rr))
    return pts


def blob(elems, name, m, res=0.05, thresh=0.6, ratio=None):
    """elems: list of (co, radius) or (co, radius, (sx,sy,sz)) ellipsoids."""
    mb = D.metaballs.new(name + "MB")
    mb.resolution = res
    mb.threshold = thresh
    o = D.objects.new(name + "MBobj", mb)
    link(o)
    for el in elems:
        e = mb.elements.new()
        e.co = el[0]
        e.radius = el[1]
        if len(el) > 2:
            e.type = 'ELLIPSOID'
            e.size_x, e.size_y, e.size_z = el[2]
    dg = C.evaluated_depsgraph_get()
    me = D.meshes.new_from_object(o.evaluated_get(dg))
    D.objects.remove(o)
    D.metaballs.remove(mb)
    ob = D.objects.new(name, me)
    link(ob)
    me.materials.clear()
    if m is not None:
        me.materials.append(m)
    me.polygons.foreach_set("use_smooth", [True] * len(me.polygons))
    if ratio:
        decimate(ob, ratio)
    return ob


def decimate(ob, ratio):
    mod = ob.modifiers.new("dec", 'DECIMATE')
    mod.ratio = ratio
    apply_mods(ob)


def apply_mods(ob):
    dg = C.evaluated_depsgraph_get()
    me = D.meshes.new_from_object(ob.evaluated_get(dg))
    old = ob.data
    ob.modifiers.clear()
    ob.data = me
    D.meshes.remove(old)
    me.polygons.foreach_set("use_smooth", [True] * len(me.polygons))


def join(objs, name, origin=None):
    objs = [o for o in objs if o is not None]
    if len(objs) == 1:
        o = objs[0]
    else:
        with C.temp_override(active_object=objs[0], object=objs[0],
                             selected_objects=objs, selected_editable_objects=objs):
            bpy.ops.object.join()
        o = objs[0]
    o.name = name
    o.data.name = name
    if origin is not None:
        o.data.transform(Matrix.Translation(-Vector(origin)))
        o.location = Vector(origin)
    return o


def group(name, children, loc=(0, 0, 0)):
    e = D.objects.new(name, None)
    link(e)
    e.location = loc
    for c in children:
        if c is None:
            continue
        mw = c.matrix_world.copy()
        c.parent = e
        c.matrix_parent_inverse = e.matrix_world.inverted()
    return e


def surf_points(center, radii, n, seed=1, zmin=-2):
    rnd = random.Random(seed)
    pts = []
    i = 0
    while len(pts) < n and i < n * 20:
        i += 1
        u = rnd.uniform(-1, 1)
        t = rnd.uniform(0, 2 * math.pi)
        s = math.sqrt(1 - u * u)
        d = Vector((s * math.cos(t), s * math.sin(t), u))
        if d.z < zmin:
            continue
        pts.append(Vector(center) + Vector((d.x * radii[0], d.y * radii[1], d.z * radii[2])))
    return pts


def export(path):
    bpy.ops.export_scene.gltf(filepath=path, export_format='GLB', export_apply=True,
                              export_yup=True, export_materials='EXPORT',
                              export_cameras=False, export_lights=False)
