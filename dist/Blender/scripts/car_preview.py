"""Look-dev renders for tkc_cars.py (it imports this with `-- preview out.png [variant ...]`): each variant alone, front and
rear three-quarter views, AO from the vertex colours, a stand-in cargo box behind the truck cab."""
import math
import sys

import bpy
from mathutils import Vector

PAINTS = {"sedan": (0.62, 0.05, 0.04), "hatch": (0.85, 0.85, 0.86), "suv": (0.03, 0.06, 0.16), "van": (0.75, 0.76, 0.78), "ambulance": (0.9, 0.9, 0.9), "truck": (0.9, 0.9, 0.9), "pod": (0.95, 0.75, 0.1), "shuttle": (0.9, 0.9, 0.9), "cart": (0.9, 0.9, 0.9)}


def look(cam, at):
    d = Vector(at) - cam.location
    cam.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()


def ao_materials():
    """Multiply every base colour by the baked AO in the 'Col' vertex colours (as the browser does)."""
    for m in list(bpy.data.materials):
        if not m.node_tree or m.name in ("glass", "ground"):
            continue
        nt = m.node_tree
        p = nt.nodes.get("Principled BSDF")
        if not p:
            continue
        a = nt.nodes.new("ShaderNodeAttribute")
        a.attribute_name = "Col"
        mix = nt.nodes.new("ShaderNodeMix")
        mix.data_type = "RGBA"
        mix.blend_type = "MULTIPLY"
        mix.inputs["Factor"].default_value = 1.0
        src = p.inputs["Base Color"].links[0].from_socket if p.inputs["Base Color"].links else None
        if src:  # interior / people / plate already read 'base' (gone after the bake): Col holds base * AO
            nt.links.new(a.outputs["Color"], p.inputs["Base Color"])
            continue
        mix.inputs["A"].default_value = p.inputs["Base Color"].default_value
        nt.links.new(a.outputs["Color"], mix.inputs["B"])
        nt.links.new(mix.outputs["Result"], p.inputs["Base Color"])


def render(roots, out):
    want = sys.argv[sys.argv.index("--") + 3:] if "--" in sys.argv else []
    sc = bpy.context.scene
    ao_materials()
    for r in roots:
        paint = bpy.data.materials["paint"].copy()
        nodes = paint.node_tree.nodes
        mix = [n for n in nodes if n.type == "MIX"][0]
        mix.inputs["A"].default_value = (*PAINTS[r.name], 1)
        for c in r.children_recursive:
            for i, m in enumerate(c.data.materials):
                if m and m.name == "paint":
                    c.data.materials[i] = paint
    for r in roots:  # the old cargo box the truck cab is put in front of
        if r.name == "truck":
            bpy.ops.mesh.primitive_cube_add(size=1, location=(r.location.x - 1.3, r.location.y, r.location.z + 2.3))
            bx = bpy.context.active_object
            bx.scale = (6.2, 2.5, 2.8)
            bm_ = bpy.data.materials.new("box")
            bm_.use_nodes = True
            bm_.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (0.1, 0.5, 0.5, 1)
            bx.data.materials.append(bm_)
            bx.parent = r
            bx.location = (-1.3, 0, 2.3)
    bpy.ops.mesh.primitive_plane_add(size=200, location=(0, 0, 0))
    g = bpy.context.active_object
    gm = bpy.data.materials.new("ground")
    gm.use_nodes = True
    gm.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (0.32, 0.33, 0.34, 1)
    g.data.materials.append(gm)
    sun = bpy.data.objects.new("sun", bpy.data.lights.new("sun", "SUN"))
    sun.data.energy = 3.2
    sun.data.angle = math.radians(3)
    sun.rotation_euler = (math.radians(40), 0, math.radians(-35))
    sc.collection.objects.link(sun)
    w = sc.world
    w.use_nodes = True
    bg = w.node_tree.nodes["Background"]
    sky = w.node_tree.nodes.new("ShaderNodeTexSky")
    w.node_tree.links.new(sky.outputs["Color"], bg.inputs["Color"])
    bg.inputs["Strength"].default_value = 0.35
    cam = bpy.data.objects.new("cam", bpy.data.cameras.new("cam"))
    sc.collection.objects.link(cam)
    sc.camera = cam
    sc.render.engine = "CYCLES"
    sc.cycles.samples = 24
    sc.cycles.use_denoising = True
    sc.render.resolution_x, sc.render.resolution_y = 1100, 640
    sc.view_settings.view_transform = "AgX"
    for r in roots:
        if want and r.name not in want:
            continue
        for o in roots:
            for c in [o, *o.children_recursive]:
                c.hide_render = o is not r or c.name.endswith("_lod")
        o = r.location
        L = {"van": 5.4, "ambulance": 5.4, "truck": 9.5, "shuttle": 7.0, "cart": 3.4}.get(r.name, 4.5)
        for tag, d, h in (("front", (0.75, -0.62), 0.32), ("rear", (-0.8, -0.55), 0.36)):
            cam.location = (o.x + d[0] * L * 1.25, o.y + d[1] * L * 1.25, o.z + L * h)
            cam.data.lens = 40
            look(cam, (o.x + d[0] * 0.3, o.y, o.z + 0.75))
            sc.render.filepath = out.replace(".png", f"_{r.name}_{tag}.png")
            bpy.ops.render.render(write_still=True)
            print("rendered", sc.render.filepath)
