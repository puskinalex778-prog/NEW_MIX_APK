import sys, math
import os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
# usage: python3 preview.py file.glb out.png [names,comma] [cols] [spacing] [camdist]
glb, out = sys.argv[1], sys.argv[2]
names = sys.argv[3].split(',') if len(sys.argv) > 3 and sys.argv[3] != '-' else None
cols = int(sys.argv[4]) if len(sys.argv) > 4 else 4
sp = float(sys.argv[5]) if len(sys.argv) > 5 else 3
reset()
bpy.ops.import_scene.gltf(filepath=glb)
roots = [o for o in D.objects if o.parent is None]
if names:
    keep = [o for o in roots if o.name in names]
    for o in roots:
        if o not in keep:
            o.hide_render = True
            for c in o.children_recursive:
                c.hide_render = True
    roots = sorted(keep, key=lambda o: names.index(o.name))
for i, o in enumerate(roots):
    o.location = ((i % cols - (min(cols, len(roots)) - 1) / 2) * sp, -(i // cols) * sp, 0)
    if o.type == 'EMPTY' or True:
        o.rotation_euler = (0, 0, math.radians(-25))
rows = (len(roots) + cols - 1) // cols
sc = C.scene
sc.render.engine = 'CYCLES'
sc.cycles.samples = 24
sc.cycles.device = 'CPU'
sc.render.resolution_x, sc.render.resolution_y = 1100, 700
w = D.worlds.new('w'); sc.world = w; w.use_nodes = True
w.node_tree.nodes['Background'].inputs[0].default_value = (0.75, 0.82, 0.85, 1)
w.node_tree.nodes['Background'].inputs[1].default_value = 0.9
sun = D.lights.new('sun', 'SUN'); sun.energy = 3.5
so = D.objects.new('sun', sun); link(so); so.rotation_euler = (math.radians(50), math.radians(10), math.radians(-30))
floor = box((80, 80, 0.1), (0, 0, -0.05), mat('#c9d6b5', 0.9), bev=0)
cam = D.cameras.new('cam'); cam.lens = 45
co = D.objects.new('cam', cam); link(co); sc.camera = co
span = max(min(cols, len(roots)), 1) * sp
d = float(sys.argv[6]) if len(sys.argv) > 6 else span * 1.15 + rows * sp * 0.6
cy = -(rows - 1) * sp / 2
co.location = (0, cy + d * 0.85, d * 0.5)
direction = Vector((0, cy, sp * 0.25)) - co.location
co.rotation_euler = direction.to_track_quat('-Z', 'Y').to_euler()
sc.render.filepath = out
bpy.ops.render.render(write_still=True)
print('rendered', out)
