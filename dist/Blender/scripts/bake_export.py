"""Bake lighting for a diorama and export it for the web.

blender -b public/Blender/<scene>.blend --python public/Blender/scripts/bake_export.py -- \
    --out <dir for glb> --exr <dir for raw .hdr bakes> [--res 4096] [--samples 128] [--device CPU|ONEAPI]

Steps:
 1. join objects by (group, kind) so the web scene has only a handful of draw calls
 2. lightmap-style UVs per atlas (scene["atlas_<name>"] lists the groups in each atlas)
 3. Cycles DIFFUSE bake of the *lighting only* (direct + indirect, no albedo) into a float
    lightmap per atlas - material colours stay crisp and the lightmap carries soft light/shadow.
    Small / leafy parts (people, furniture, mullions, foliage) would shatter the atlas into
    tens of thousands of islands, so their light is baked into a per-corner colour attribute.
 4. export a GLB with the original materials; the web app multiplies them by the lightmaps
"""
import math
import os
import sys
from collections import defaultdict

import bmesh
import bpy
import numpy as np

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from tkc_lib import GLTF_EXPORT  # noqa: E402

argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []


def arg(name, default=None):
    return argv[argv.index(name) + 1] if name in argv else default


OUT = arg("--out")
EXR = arg("--exr")
RES = int(arg("--res", 4096))
SAMPLES = int(arg("--samples", 128))
DEVICE = arg("--device", "CPU")
NAME = os.path.splitext(os.path.basename(bpy.data.filepath))[0]
scene = bpy.context.scene


def log(*a):
    print("[bake]", *a, flush=True)


def select_only(objs, active=None):
    for ob in scene.objects:
        ob.select_set(False)
    for ob in objs:
        ob.select_set(True)
    bpy.context.view_layer.objects.active = active or (objs[0] if objs else None)


def join(objs, name):
    if len(objs) > 1:
        select_only(objs)
        with bpy.context.temp_override(active_object=objs[0], selected_editable_objects=objs, selected_objects=objs):
            bpy.ops.object.join()
    ob = objs[0]
    ob.name = name
    ob.data.name = name
    return ob


def safe(s):
    return s.replace(":", "-")


# ------------------------------------------------------------------ 1. join

meshes = [o for o in scene.objects if o.type == "MESH" and "grp" in o]
buckets = defaultdict(list)
for ob in meshes:
    grp, kind = ob["grp"], ob["kind"]
    if grp in ("anim", "move"):  # animated in the browser: keep their own nodes
        continue
    mat = ob.data.materials[0].name if ob.data.materials else "none"
    key = (grp, kind, "" if kind == "bake" else mat)
    buckets[key].append(ob)

for (grp, kind, mat), objs in buckets.items():
    name = f"{kind}-{safe(grp)}" + (f"-{mat}" if mat else "")
    ob = join(objs, name)
    ob["grp"], ob["kind"] = grp, kind
    if mat:
        ob["mat"] = mat
    if grp.startswith("hot:"):
        ob["hot"] = grp[4:]
for ob in scene.objects:
    if ob.get("grp") == "anim":
        ob["kind"] = "anim"

# light scale shared with process_lightmaps.py: stored value = shoulder(raw * SCALE) / 2
SCALE, SHOULDER = 0.85, 1.6
SMALL_AREA = 8.0  # m^2: loose parts smaller than this are vertex-lit
FOLIAGE = {"leaf", "leafdark", "leaflight", "bark"}


def split_vertex_lit(ob):
    """Move small loose parts and foliage of a joined bake object into a sibling 'vbake' object."""
    bm = bmesh.new()
    bm.from_mesh(ob.data)
    bm.faces.ensure_lookup_table()
    parent = list(range(len(bm.faces)))

    def find(i):
        while parent[i] != i:
            parent[i] = parent[parent[i]]
            i = parent[i]
        return i

    for e in bm.edges:
        fs = e.link_faces
        for f in fs[1:]:
            parent[find(f.index)] = find(fs[0].index)
    names = [m.name if m else "" for m in ob.data.materials]
    area = defaultdict(float)
    leafy = set()
    for f in bm.faces:
        r = find(f.index)
        area[r] += f.calc_area()
        if names[f.material_index] in FOLIAGE or names[f.material_index].startswith("leaf"):
            leafy.add(r)
    small = {f.index for f in bm.faces if area[find(f.index)] < SMALL_AREA or find(f.index) in leafy}
    if not small:
        bm.free()
        return
    vb = ob.copy()
    vb.data = ob.data.copy()
    for c in ob.users_collection:
        c.objects.link(vb)
    vb.name = vb.data.name = ob.name.replace("bake-", "vbake-", 1)
    vb["kind"] = "vbake"
    bmesh.ops.delete(bm, geom=[f for f in bm.faces if f.index in small], context="FACES")
    bm.to_mesh(ob.data)
    bm.free()
    bm = bmesh.new()
    bm.from_mesh(vb.data)
    bm.faces.ensure_lookup_table()
    bmesh.ops.delete(bm, geom=[f for f in bm.faces if f.index not in small], context="FACES")
    bm.to_mesh(vb.data)
    bm.free()
    for uv in list(vb.data.uv_layers):
        vb.data.uv_layers.remove(uv)
    log("vertex-lit", vb.name, len(small), "faces")
    if not ob.data.polygons:
        bpy.data.objects.remove(ob)


for ob in [o for o in scene.objects if o.type == "MESH" and o.get("kind") == "bake"]:
    split_vertex_lit(ob)
log("objects after join:", len([o for o in scene.objects if o.type == "MESH"]))

# ------------------------------------------------------------------ 2. UVs

atlases = {k[len("atlas_") :]: v.split(",") for k, v in scene.items() if k.startswith("atlas_")}


def atlas_of(ob):
    grp = ob.get("grp")
    if grp == "anim":
        grp = "hot:" + ob.get("hot", "")
    for name, groups in atlases.items():
        if grp in groups:
            return name
    return None


bake_sets = defaultdict(list)
for ob in scene.objects:
    if ob.type == "MESH" and ob.get("kind") in ("bake", "anim"):
        a = atlas_of(ob)
        if a:
            bake_sets[a].append(ob)
        else:
            log("WARNING no atlas for", ob.name, ob.get("grp"))

for a, objs in bake_sets.items():
    for ob in objs:
        me = ob.data
        uv = me.uv_layers.get("bake") or me.uv_layers.new(name="bake")
        me.uv_layers.active = uv
        uv.active_render = True
    select_only(objs)
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.uv.smart_project(angle_limit=math.radians(60), island_margin=0.0015, area_weight=0.0, correct_aspect=True, scale_to_bounds=False)
    bpy.ops.uv.pack_islands(rotate=True, margin_method="FRACTION", margin=0.002)
    bpy.ops.object.mode_set(mode="OBJECT")
    used = 0.0
    for ob in objs:
        uv = np.empty(len(ob.data.loops) * 2)
        ob.data.uv_layers["bake"].data.foreach_get("uv", uv)
        uv = uv.reshape(-1, 2)
        for p in ob.data.polygons:
            q = uv[p.loop_start : p.loop_start + p.loop_total]
            used += 0.5 * abs(np.dot(q[:, 0], np.roll(q[:, 1], 1)) - np.dot(q[:, 1], np.roll(q[:, 0], 1)))
    log("unwrapped", a, len(objs), "objects, atlas coverage", f"{used:.0%}")

# ------------------------------------------------------------------ 3. bake

scene.render.engine = "CYCLES"
scene.cycles.samples = SAMPLES
scene.cycles.use_adaptive_sampling = False
scene.cycles.max_bounces = 6
scene.cycles.diffuse_bounces = 4
scene.cycles.glossy_bounces = 2
scene.cycles.transmission_bounces = 2
if DEVICE != "CPU":
    prefs = bpy.context.preferences.addons["cycles"].preferences
    prefs.compute_device_type = DEVICE
    prefs.get_devices()
    for d in prefs.devices:
        d.use = d.type == DEVICE
    scene.cycles.device = "GPU"
else:
    scene.cycles.device = "CPU"

# glass is drawn live in the browser; hide it so light reaches the interiors.
# Moving actors are hidden too, or their shadows would stay painted where they started.
for ob in scene.objects:
    if ob.get("kind") in ("glass", "move"):
        ob.hide_render = True

os.makedirs(EXR, exist_ok=True)
images = {}
for a, objs in bake_sets.items():
    img = bpy.data.images.new(f"{NAME}_{a}", RES, RES, alpha=False, float_buffer=True)
    images[a] = img
    mats = {m for ob in objs for m in ob.data.materials if m}
    for m in mats:
        nodes = m.node_tree.nodes
        node = nodes.get("BakeTarget") or nodes.new("ShaderNodeTexImage")
        node.name = "BakeTarget"
        node.image = img
        nodes.active = node
        node.select = True
    select_only(objs)
    log("baking", a, f"{RES}px", f"{SAMPLES} spp", len(objs), "objects ...")
    bpy.ops.object.bake(type="DIFFUSE", pass_filter={"DIRECT", "INDIRECT"}, margin=12, use_clear=True, target="IMAGE_TEXTURES")
    img.filepath_raw = os.path.join(EXR, f"{NAME}_{a}.hdr")
    img.file_format = "HDR"  # Radiance: opencv reads it without the OpenEXR codec
    img.save()
    log("saved", img.filepath_raw)

vobjs = [o for o in scene.objects if o.type == "MESH" and o.get("kind") in ("vbake", "move")]
if vobjs:
    for ob in vobjs:
        ob.hide_render = False
    for ob in vobjs:
        attr = ob.data.color_attributes.new("bake", "FLOAT_COLOR", "CORNER")
        ob.data.color_attributes.active_color = attr
    scene.cycles.samples = min(SAMPLES * 2, 192)  # one sample set per corner: needs more to stay clean
    select_only(vobjs)
    log("baking vertex light", len(vobjs), "objects ...")
    bpy.ops.object.bake(type="DIFFUSE", pass_filter={"DIRECT", "INDIRECT"}, target="VERTEX_COLORS")
    for ob in vobjs:
        a = ob.data.color_attributes["bake"]
        c = np.empty(len(a.data) * 4, np.float32)
        a.data.foreach_get("color", c)
        c = c.reshape(-1, 4)
        c[:, :3] = SHOULDER * np.tanh(c[:, :3] * SCALE / SHOULDER) / 2
        a.data.foreach_set("color", c.ravel())

# ------------------------------------------------------------------ 4. export

for a, objs in bake_sets.items():
    for ob in objs:
        ob["atlas"] = a
        me = ob.data
        for uv in [u for u in me.uv_layers if u.name != "bake"]:
            me.uv_layers.remove(uv)
for m in bpy.data.materials:
    if m.node_tree and m.node_tree.nodes.get("BakeTarget"):
        m.node_tree.nodes.remove(m.node_tree.nodes["BakeTarget"])

for ob in scene.objects:
    ob.hide_render = False
export = [o for o in scene.objects if o.type in ("MESH", "EMPTY")]
select_only(export)
os.makedirs(OUT, exist_ok=True)
glb = os.path.join(OUT, f"{NAME}.glb")
bpy.ops.export_scene.gltf(filepath=glb, **GLTF_EXPORT)
log("exported", glb, os.path.getsize(glb) // 1024, "KB")
bpy.ops.wm.save_as_mainfile(filepath=bpy.data.filepath.replace(".blend", "_baked.blend"))
log("done")
