import sys, math
import os
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from common import *
reset()
bpy.ops.import_scene.gltf(filepath=os.path.join(HERE, '..', 'www', 'assets', 'heroes.glb'))
keep = D.objects['hero_oblachko']
for o in list(D.objects):
    if o.parent is None and o is not keep and o.type == 'EMPTY':
        for c in o.children_recursive: c.hide_render = True
        o.hide_render = True
keep.rotation_mode = 'XYZ'; keep.rotation_euler = (0, 0, math.radians(-18))  # glTF importer root is Y-up converted
for c in keep.children:
    n = c.name.split('.')[0]
    c.rotation_mode = 'XYZ'
    if n == 'arm_l': c.rotation_euler.rotate(Euler((math.radians(-25), math.radians(-135), 0)))
    if n == 'arm_r': c.rotation_euler.rotate(Euler((0, math.radians(12), 0)))
    if n == 'head': c.rotation_euler.rotate(Euler((0, 0, math.radians(-12))))
sc = C.scene; sc.render.engine = 'CYCLES'; sc.cycles.samples = 96; sc.cycles.device = 'CPU'
sc.view_settings.view_transform = 'Standard'; sc.view_settings.look = 'None'
size = int(sys.argv[1]); sc.render.resolution_x = sc.render.resolution_y = size
w = D.worlds.new('w'); sc.world = w; w.use_nodes = True
w.node_tree.nodes['Background'].inputs[0].default_value = (*srgb2lin('#dff3ee'), 1); w.node_tree.nodes['Background'].inputs[1].default_value = 0.9
sun = D.lights.new('sun', 'SUN'); sun.energy = 3.2; sun.angle = math.radians(8); so = D.objects.new('sun', sun); link(so); so.rotation_euler = (math.radians(50), math.radians(10), math.radians(-30))
fill = D.lights.new('fill', 'AREA'); fill.energy = 120; fill.size = 3; fo = D.objects.new('fill', fill); link(fo); fo.location = (-2.5, 3.5, 2.0); fo.rotation_euler = (Vector((0, 0, 1.2)) - fo.location).to_track_quat('-Z', 'Y').to_euler()
cam = D.cameras.new('cam'); cam.lens = 85; co = D.objects.new('cam', cam); link(co); sc.camera = co
tgt = Vector((0.04, 0, float(sys.argv[3]) if len(sys.argv) > 3 else 1.12))
co.location = tgt + Vector((0.5, 4.4, 0.35)) * float(sys.argv[4] if len(sys.argv) > 4 else 1.0)
co.rotation_euler = (tgt - co.location).to_track_quat('-Z', 'Y').to_euler()
sc.render.film_transparent = True
sc.render.filepath = sys.argv[2]
bpy.ops.render.render(write_still=True)
