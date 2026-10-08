"""Shared modelling helpers for the TKC smart-solution dioramas (Blender 5.x, Z up, metres).

Every object gets two custom properties used by bake_export.py:
  grp  - which baked group it is joined into ("static_building", "static_site", "hot:<id>", ...)
  kind - "bake" (lit by the light bake), "glass", "led", "screen" or "anim"
"""
import math
import random

import bmesh
import bpy
from mathutils import Euler, Matrix, Vector

COL = None
CURRENT_GRP = "static_site"
LOW = 0  # >0 while building small props: no bevels, coarser spheres / cylinders


class low_detail:
    def __enter__(self):
        global LOW
        LOW += 1

    def __exit__(self, *a):
        global LOW
        LOW -= 1


def lowpoly(fn):
    def wrapped(*a, **kw):
        with low_detail():
            return fn(*a, **kw)

    wrapped.__name__ = fn.__name__
    return wrapped


def set_group(grp):
    global CURRENT_GRP
    CURRENT_GRP = grp


class group:
    """with group("hot:iot"): ... puts everything created inside into that group."""

    def __init__(self, grp):
        self.grp = grp

    def __enter__(self):
        self.prev = CURRENT_GRP
        set_group(self.grp)

    def __exit__(self, *a):
        set_group(self.prev)


def reset_scene():
    global COL
    bpy.ops.wm.read_factory_settings(use_empty=True)
    COL = bpy.data.collections.new("Diorama")
    bpy.context.scene.collection.children.link(COL)


# ------------------------------------------------------------------ materials

PALETTE = {
    "white": ((0.93, 0.935, 0.94), 0.45),
    "offwhite": ((0.86, 0.87, 0.88), 0.6),
    "lightgray": ((0.74, 0.76, 0.79), 0.6),
    "midgray": ((0.52, 0.55, 0.59), 0.5),
    "darkgray": ((0.16, 0.17, 0.19), 0.4),
    "black": ((0.05, 0.055, 0.06), 0.35),
    "wood": ((0.5, 0.26, 0.12), 0.55),
    "woodlight": ((0.8, 0.64, 0.45), 0.55),
    "stone": ((0.82, 0.8, 0.77), 0.8),
    "carpet": ((0.62, 0.65, 0.69), 0.95),
    "asphalt": ((0.24, 0.25, 0.27), 0.9),
    "concrete": ((0.72, 0.72, 0.7), 0.85),
    "grass": ((0.1, 0.24, 0.05), 0.95),
    "leaf": ((0.07, 0.2, 0.045), 0.7),
    "leafdark": ((0.03, 0.12, 0.03), 0.7),
    "leaflight": ((0.15, 0.3, 0.06), 0.7),
    "soil": ((0.25, 0.18, 0.12), 1.0),
    "bark": ((0.35, 0.25, 0.17), 0.9),
    "navy": ((0.05, 0.12, 0.3), 0.4),
    "brand": ((0.12, 0.37, 0.84), 0.4),
    "red": ((0.72, 0.1, 0.08), 0.35),
    "silver": ((0.66, 0.68, 0.71), 0.3),
    "tyre": ((0.07, 0.07, 0.075), 0.8),
    "carglass": ((0.08, 0.11, 0.15), 0.1),
    "solar": ((0.05, 0.1, 0.25), 0.25),
    "aluminium": ((0.78, 0.8, 0.82), 0.3),
    "fabric": ((0.3, 0.33, 0.37), 0.95),
    "fabriclight": ((0.82, 0.83, 0.84), 0.95),
    "paint_white": ((0.95, 0.95, 0.95), 0.6),
    "paint_green": ((0.05, 0.38, 0.2), 0.7),
    "paint_yellow": ((0.95, 0.75, 0.15), 0.6),
    "bezel": ((0.03, 0.035, 0.04), 0.25),
    "frame": ((0.58, 0.6, 0.63), 0.22),
    "frame_dark": ((0.42, 0.45, 0.49), 0.3),
    "copper": ((0.6, 0.3, 0.14), 0.45),
    "terrazzo": ((0.86, 0.84, 0.8), 0.7),
    "paving": ((0.5, 0.45, 0.4), 0.85),
    "paving_dark": ((0.3, 0.28, 0.26), 0.85),
    "planter": ((0.55, 0.57, 0.6), 0.6),
    "tower_glass": ((0.2, 0.3, 0.42), 0.15),
    "tower_glass2": ((0.32, 0.42, 0.5), 0.15),
    "tower_frame": ((0.7, 0.72, 0.74), 0.4),
    "skin1": ((0.85, 0.65, 0.5), 0.6),
    "skin2": ((0.62, 0.43, 0.3), 0.6),
    "skin3": ((0.4, 0.27, 0.18), 0.6),
    "hair": ((0.08, 0.06, 0.05), 0.7),
    "hair2": ((0.35, 0.22, 0.12), 0.7),
    "cloth_navy": ((0.08, 0.13, 0.28), 0.9),
    "cloth_beige": ((0.76, 0.66, 0.5), 0.9),
    "cloth_red": ((0.66, 0.14, 0.12), 0.9),
    "cloth_white": ((0.9, 0.9, 0.9), 0.9),
    "cloth_black": ((0.06, 0.06, 0.07), 0.9),
    "cloth_teal": ((0.1, 0.45, 0.46), 0.9),
    "cloth_gray": ((0.45, 0.47, 0.5), 0.9),
    "cloth_denim": ((0.18, 0.27, 0.45), 0.9),
    "cloth_yellow": ((0.9, 0.7, 0.2), 0.9),
    "goods1": ((0.85, 0.3, 0.25), 0.6),
    "goods2": ((0.25, 0.55, 0.8), 0.6),
    "goods3": ((0.95, 0.8, 0.3), 0.6),
    "goods4": ((0.35, 0.65, 0.4), 0.6),
    "umbrella": ((0.92, 0.9, 0.86), 0.8),
    # colour set for Smart Hospital onwards (softened to sit closer to Smart Building)
    "tile_blue": ((0.236, 0.434, 0.68), 0.25),
    "tile_line": ((0.7, 0.844, 0.928), 0.4),
    "mint": ((0.343, 0.667, 0.523), 0.6),
    "coral": ((0.777, 0.357, 0.309), 0.6),
    "carpet_blue": ((0.058, 0.106, 0.376), 0.9),
    "hosp_white": ((0.911, 0.929, 0.953), 0.35),
    "robot_white": ((0.954, 0.96, 0.972), 0.2),
    "teal": ((0.175, 0.505, 0.535), 0.6),
    "teal_dark": ((0.09, 0.258, 0.294), 0.6),
    "accent_blue": ((0.127, 0.295, 0.685), 0.35),
    "sky_blue": ((0.385, 0.625, 0.805), 0.4),
    "scrub_pink": ((0.58, 0.142, 0.34), 0.85),
    "scrub_green": ((0.179, 0.455, 0.335), 0.85),
    "scrub_blue": ((0.182, 0.35, 0.644), 0.85),
    "coat_white": ((0.937, 0.949, 0.967), 0.8),
    "gown": ((0.507, 0.699, 0.837), 0.9),
    "mattress": ((0.68, 0.824, 0.908), 0.8),
    "blanket": ((0.215, 0.515, 0.665), 0.9),
    "flower_pink": ((0.681, 0.147, 0.381), 0.7),
    "flower_yellow": ((0.892, 0.724, 0.304), 0.7),
    "flower_purple": ((0.396, 0.156, 0.606), 0.7),
    "flower_red": ((0.675, 0.153, 0.141), 0.7),
    "cross_red": ((0.61, 0.094, 0.106), 0.4),
    "orange": ((0.799, 0.439, 0.199), 0.5),
    "lime": ((0.553, 0.793, 0.313), 0.6),
    "leafv": ((0.207, 0.435, 0.177), 0.7),
    "leafv_dark": ((0.114, 0.27, 0.114), 0.7),
    "leafv_light": ((0.396, 0.612, 0.252), 0.7),
    "lawn": ((0.212, 0.41, 0.17), 0.95),
    "tower_blue": ((0.161, 0.293, 0.533), 0.12),
    "tower_teal": ((0.17, 0.392, 0.47), 0.12),
    # smart learning
    "wood_desk": ((0.545, 0.413, 0.293), 0.5),
    "floor_dark": ((0.037, 0.04, 0.049), 0.15),
    "rug_teal": ((0.143, 0.413, 0.443), 0.95),
    "rug_purple": ((0.227, 0.095, 0.431), 0.95),
    "rug_orange": ((0.751, 0.391, 0.193), 0.95),
    "rug_yellow": ((0.887, 0.707, 0.317), 0.95),
    "purple": ((0.284, 0.122, 0.524), 0.5),
    "court_blue": ((0.104, 0.218, 0.506), 0.7),
    "court_orange": ((0.743, 0.365, 0.191), 0.7),
    "bus_yellow": ((0.851, 0.599, 0.251), 0.4),
    "vegbed": ((0.216, 0.156, 0.114), 0.95),
    # smart logistics (same softened saturation)
    "carton": ((0.52, 0.36, 0.2), 0.85),
    "carton2": ((0.62, 0.47, 0.3), 0.85),
    "wrap": ((0.84, 0.87, 0.9), 0.3),
    "pallet_wood": ((0.5, 0.38, 0.25), 0.9),
    "rack_blue": ((0.16, 0.3, 0.55), 0.5),
    "rack_orange": ((0.8, 0.45, 0.16), 0.5),
    "truck_teal": ((0.18, 0.36, 0.44), 0.4),
    "safety_yellow": ((0.82, 0.68, 0.2), 0.6),
    "concrete_floor": ((0.6, 0.61, 0.6), 0.7),
    "panel_grey": ((0.7, 0.73, 0.76), 0.5),
    "belt": ((0.1, 0.11, 0.12), 0.8),
    "forklift": ((0.8, 0.52, 0.15), 0.4),
    "tote_blue": ((0.22, 0.4, 0.62), 0.6),
    "tote_yellow": ((0.82, 0.66, 0.22), 0.6),
    "container_red": ((0.55, 0.22, 0.17), 0.6),
    "container_blue": ((0.22, 0.35, 0.52), 0.6),
    "container_green": ((0.26, 0.44, 0.33), 0.6),
    # smart cables (same softened saturation)
    "duct_blue": ((0.2, 0.4, 0.62), 0.35),
    "duct_green": ((0.25, 0.5, 0.3), 0.4),
    "duct_orange": ((0.78, 0.46, 0.2), 0.4),
    "cable_red": ((0.64, 0.2, 0.16), 0.5),
    "cable_yellow": ((0.84, 0.68, 0.24), 0.5),
    "cable_black": ((0.07, 0.075, 0.08), 0.5),
    "steel": ((0.7, 0.72, 0.75), 0.25),
    "sand": ((0.74, 0.63, 0.46), 0.95),
    "gravel": ((0.52, 0.5, 0.47), 0.95),
    "clay": ((0.47, 0.35, 0.25), 0.95),
    "facade_beige": ((0.84, 0.79, 0.71), 0.7),
    "facade_warm": ((0.76, 0.66, 0.55), 0.7),
    "flower_white": ((0.93, 0.93, 0.9), 0.7),
    "awning": ((0.2, 0.36, 0.5), 0.8),
    # autonomous (same softened saturation)
    "auto_blue": ((0.24, 0.46, 0.7), 0.3),
    "cyber_navy": ((0.08, 0.13, 0.26), 0.35),
    "cyber_floor": ((0.2, 0.3, 0.46), 0.6),
    "cyber_glass": ((0.14, 0.25, 0.45), 0.12),
    "roof_slate": ((0.25, 0.28, 0.33), 0.55),
    "house_cream": ((0.93, 0.9, 0.83), 0.75),
    "timber": ((0.4, 0.28, 0.19), 0.7),
    "insulator": ((0.36, 0.55, 0.52), 0.25),
    "grid_green": ((0.46, 0.56, 0.5), 0.5),
    "arm_orange": ((0.85, 0.5, 0.16), 0.35),
    "hazard_black": ((0.06, 0.06, 0.065), 0.6),
    "crop": ((0.24, 0.48, 0.17), 0.8),
    "crop_dark": ((0.15, 0.36, 0.12), 0.8),
    "field": ((0.36, 0.26, 0.17), 1.0),
    "taxi_yellow": ((0.9, 0.7, 0.22), 0.35),
    "car_pink": ((0.78, 0.4, 0.56), 0.35),
}

EMISSIVE = {
    "led_cyan": ((0.25, 0.72, 1.0), 14.0),
    "led_pink": ((1.0, 0.2, 0.6), 6.0),
    "holo": ((0.2, 0.85, 1.0), 3.0),
    "led_warm": ((1.0, 0.78, 0.5), 8.0),
    "led_white": ((1.0, 1.0, 1.0), 6.0),
    "led_green": ((0.3, 1.0, 0.55), 5.0),
    "led_red": ((1.0, 0.25, 0.22), 5.0),
    "led_blue": ((0.3, 0.55, 1.0), 5.0),
}


def material(name):
    m = bpy.data.materials.get(name)
    if m:
        return m
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes.get("Principled BSDF")
    if name in PALETTE:
        col, rough = PALETTE[name]
        bsdf.inputs["Base Color"].default_value = (*col, 1)
        bsdf.inputs["Roughness"].default_value = rough
    elif name in EMISSIVE:
        col, strength = EMISSIVE[name]
        bsdf.inputs["Base Color"].default_value = (*col, 1)
        bsdf.inputs["Emission Color"].default_value = (*col, 1)
        bsdf.inputs["Emission Strength"].default_value = strength
    elif name.startswith("screen_"):
        bsdf.inputs["Base Color"].default_value = (0.2, 0.45, 0.85, 1)
        bsdf.inputs["Emission Color"].default_value = (0.35, 0.65, 1.0, 1)
        bsdf.inputs["Emission Strength"].default_value = 2.5
    elif name.startswith("glass"):
        bsdf.inputs["Base Color"].default_value = (0.6, 0.78, 0.9, 1)
        bsdf.inputs["Roughness"].default_value = 0.0
        bsdf.inputs["Transmission Weight"].default_value = 1.0
        bsdf.inputs["IOR"].default_value = 1.52
    return m


def kind_of(mat_name):
    if mat_name.startswith(("glass", "holo")):  # see-through: drawn live in the browser, not baked
        return "glass"
    if mat_name.startswith("led_"):
        return "led"
    if mat_name.startswith("screen_"):
        return "screen"
    return "bake"


# ------------------------------------------------------------------ objects

def _finish(bm, name, mat, loc=(0, 0, 0), rot=(0, 0, 0), smooth=False, kind=None, grp=None):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    if smooth:
        for p in me.polygons:
            p.use_smooth = abs(p.normal.z) < 0.95 if smooth == "sides" else True
    ob = bpy.data.objects.new(name, me)
    COL.objects.link(ob)
    ob.location = loc
    ob.rotation_euler = Euler(rot)
    m = material(mat)
    me.materials.append(m)
    ob["kind"] = kind or kind_of(mat)
    ob["grp"] = grp or CURRENT_GRP
    return ob


def _finish_multi(bm, name, mats, smooth=False, grp=None):
    """Like _finish but keeps per-face material_index into `mats` (all baked materials)."""
    ob = _finish(bm, name, mats[0], smooth=smooth, grp=grp)
    for m in mats[1:]:
        ob.data.materials.append(material(m))
    return ob


def box(name, size, loc, mat="white", bevel=0.02, rot=(0, 0, 0), segments=2, **kw):
    """Axis-aligned box: size (x, y, z), loc = centre of the bottom face."""
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    bmesh.ops.scale(bm, vec=Vector(size), verts=bm.verts)
    bmesh.ops.translate(bm, vec=Vector((0, 0, size[2] / 2)), verts=bm.verts)
    b = min(bevel, min(size) * 0.45)
    if b > 0.001 and not LOW:
        bmesh.ops.bevel(bm, geom=list(bm.edges), offset=b, segments=segments, affect="EDGES", profile=0.5)
    return _finish(bm, name, mat, loc, rot, **kw)


def cyl(name, r, h, loc, mat="white", verts=24, rot=(0, 0, 0), r2=None, bevel=0.0, **kw):
    """Cylinder standing on loc (bottom centre)."""
    bm = bmesh.new()
    if LOW:
        verts = max(6, verts // 2)
        bevel = 0.0
    bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=verts, radius1=r, radius2=r if r2 is None else r2, depth=h)
    bmesh.ops.translate(bm, vec=Vector((0, 0, h / 2)), verts=bm.verts)
    if bevel > 0:
        rim = [e for e in bm.edges if len(e.link_faces) == 2 and abs(e.link_faces[0].normal.z - e.link_faces[1].normal.z) > 0.5]
        bmesh.ops.bevel(bm, geom=rim, offset=bevel, segments=2, affect="EDGES", profile=0.5)
    kw.setdefault("smooth", "sides")
    return _finish(bm, name, mat, loc, rot, **kw)


def sphere(name, r, loc, mat="leaf", scale=(1, 1, 1), subdiv=2, rot=(0, 0, 0), **kw):
    bm = bmesh.new()
    bmesh.ops.create_icosphere(bm, subdivisions=min(subdiv, 1) if LOW else subdiv, radius=r)
    bmesh.ops.scale(bm, vec=Vector(scale), verts=bm.verts)
    kw.setdefault("smooth", True)
    return _finish(bm, name, mat, loc, rot, **kw)


def plane(name, size, loc, mat, rot=(0, 0, 0), **kw):
    """Quad with UVs 0..1 (used for screens). size = (w, h); faces +Y after rot=(90deg,0,0)."""
    bm = bmesh.new()
    uv = bm.loops.layers.uv.new("UVMap")
    w, h = size
    v = [bm.verts.new(p) for p in ((-w / 2, -h / 2, 0), (w / 2, -h / 2, 0), (w / 2, h / 2, 0), (-w / 2, h / 2, 0))]
    f = bm.faces.new(v)
    for loop, co in zip(f.loops, ((0, 0), (1, 0), (1, 1), (0, 1))):
        loop[uv].uv = co
    return _finish(bm, name, mat, loc, rot, **kw)


def upright_screen(name, size, center, facing, mat, **kw):
    """Vertical screen quad centred at `center`, facing a compass direction: '-y', '+y', '-x', '+x'."""
    rot = {"-y": (math.pi / 2, 0, 0), "+y": (math.pi / 2, 0, math.pi), "+x": (math.pi / 2, 0, math.pi / 2), "-x": (math.pi / 2, 0, -math.pi / 2)}[facing]
    return plane(name, size, center, mat, rot=rot, **kw)


def empty(name, loc):
    ob = bpy.data.objects.new(name, None)
    ob.empty_display_size = 0.5
    ob.location = loc
    COL.objects.link(ob)
    ob["kind"] = "empty"
    ob["grp"] = "none"
    return ob


# ------------------------------------------------------------------ furniture & props

def tree(name, loc, h=6.0, spread=1.0, seed=1, style="round"):
    rnd = random.Random(seed)
    x, y, z = loc
    cyl(f"{name}_trunk", 0.16 * spread, h * 0.45, (x, y, z), "bark", verts=10)
    if style == "cone":
        for i in range(3):
            r = (1.5 - i * 0.35) * spread
            cyl(f"{name}_c{i}", r, h * 0.35, (x, y, z + h * (0.3 + i * 0.2)), "leafdark", verts=16, r2=0.05)
        return
    shades = ["leaf", "leafdark", "leaflight"]
    for i in range(6):
        a = rnd.random() * math.tau
        d = rnd.random() * 0.9 * spread
        r = (0.9 + rnd.random() * 0.6) * spread
        sphere(
            f"{name}_f{i}",
            r,
            (x + math.cos(a) * d, y + math.sin(a) * d, z + h * 0.62 + rnd.random() * h * 0.28),
            shades[i % 3],
            scale=(1, 1, 0.85),
            subdiv=2,
        )


@lowpoly
def potted_plant(name, loc, h=1.4, seed=2, pot="white"):
    rnd = random.Random(seed)
    x, y, z = loc
    cyl(f"{name}_pot", 0.26, 0.45, (x, y, z), pot, verts=24, r2=0.22, bevel=0.02)
    cyl(f"{name}_soil", 0.24, 0.02, (x, y, z + 0.42), "soil", verts=20)
    cyl(f"{name}_stem", 0.025, h * 0.7, (x, y, z + 0.44), "bark", verts=6)
    for i in range(11):
        a = i * 2.4 + rnd.random() * 0.3
        t = 0.35 + (i / 11) * 0.6
        lz = z + 0.44 + h * t
        rr = 0.12 + (1 - t) * 0.25
        sphere(
            f"{name}_leaf{i}",
            0.22,
            (x + math.cos(a) * rr, y + math.sin(a) * rr, lz),
            "leaf" if i % 2 else "leaflight",
            scale=(1.0, 0.42, 0.08),
            rot=(0.5 + rnd.random() * 0.4, 0, a + math.pi / 2),
            subdiv=2,
        )


@lowpoly
def office_chair(name, loc, rot_z=0.0, fabric="fabric"):
    x, y, z = loc
    parts = []
    for i in range(5):
        a = rot_z + i * math.tau / 5
        parts.append(box(f"{name}_leg{i}", (0.34, 0.05, 0.04), (x + math.cos(a) * 0.16, y + math.sin(a) * 0.16, z + 0.06), "midgray", bevel=0.01, rot=(0, 0, a)))
        parts.append(sphere(f"{name}_wheel{i}", 0.035, (x + math.cos(a) * 0.32, y + math.sin(a) * 0.32, z + 0.035), "black", subdiv=1))
    cyl(f"{name}_lift", 0.03, 0.36, (x, y, z + 0.08), "aluminium", verts=12)
    box(f"{name}_seat", (0.5, 0.48, 0.09), (x, y, z + 0.44), fabric, bevel=0.035, rot=(0, 0, rot_z))
    bx = x - math.cos(rot_z) * 0.24
    by = y - math.sin(rot_z) * 0.24
    box(f"{name}_back", (0.07, 0.46, 0.55), (bx, by, z + 0.56), fabric, bevel=0.03, rot=(0, -0.12, rot_z))


@lowpoly
def desk(name, loc, w=1.6, d=0.8, rot_z=0.0, top="white", monitors=1):
    x, y, z = loc
    c, s = math.cos(rot_z), math.sin(rot_z)
    box(f"{name}_top", (w, d, 0.04), (x, y, z + 0.72), top, bevel=0.012, rot=(0, 0, rot_z))
    for sx in (-1, 1):
        lx = x + c * sx * (w / 2 - 0.06)
        ly = y + s * sx * (w / 2 - 0.06)
        box(f"{name}_leg{sx}", (0.05, d * 0.9, 0.72), (lx, ly, z), "midgray", bevel=0.01, rot=(0, 0, rot_z))
    for k in range(monitors):
        off = (k - (monitors - 1) / 2) * 0.62
        mx = x + c * off - s * (d * 0.28)
        my = y + s * off + c * (d * 0.28)
        box(f"{name}_mstand{k}", (0.22, 0.16, 0.015), (mx, my, z + 0.76), "midgray", bevel=0.005, rot=(0, 0, rot_z))
        box(f"{name}_mneck{k}", (0.04, 0.03, 0.2), (mx, my, z + 0.775), "midgray", bevel=0.005, rot=(0, 0, rot_z))
        box(f"{name}_mon{k}", (0.58, 0.035, 0.36), (mx, my, z + 0.93), "bezel", bevel=0.01, rot=(0, 0, rot_z))
        # screen faces the chair (towards -local y)
        sx_ = mx - s * -0.019
        sy_ = my + c * -0.019
        plane(f"{name}_scr{k}", (0.54, 0.32), (sx_, sy_, z + 1.11), "screen_monitor", rot=(math.pi / 2, 0, rot_z))
    box(f"{name}_kb", (0.42, 0.14, 0.02), (x + s * 0.1, y - c * 0.1, z + 0.76), "offwhite", bevel=0.005, rot=(0, 0, rot_z))


@lowpoly
def sofa(name, loc, w=2.2, rot_z=0.0, fabric="fabriclight"):
    x, y, z = loc
    c, s = math.cos(rot_z), math.sin(rot_z)
    box(f"{name}_base", (w, 0.9, 0.42), (x, y, z), fabric, bevel=0.06, rot=(0, 0, rot_z))
    box(f"{name}_back", (w, 0.22, 0.45), (x + s * 0.34, y - c * 0.34, z + 0.38), fabric, bevel=0.07, rot=(0, 0, rot_z))
    for sx in (-1, 1):
        box(f"{name}_arm{sx}", (0.2, 0.9, 0.62), (x + c * sx * (w / 2 - 0.1), y + s * sx * (w / 2 - 0.1), z), fabric, bevel=0.07, rot=(0, 0, rot_z))


def prism(name, profile, width, loc, mat, rot_z=0.0, bevel=0.08, segments=3, **kw):
    """Extrude a side profile [(x, z), ...] (counter-clockwise) across `width` (local y)."""
    bm = bmesh.new()
    front = [bm.verts.new((x, -width / 2, z)) for x, z in profile]
    face = bm.faces.new(front)
    ret = bmesh.ops.extrude_face_region(bm, geom=[face])
    moved = [e for e in ret["geom"] if isinstance(e, bmesh.types.BMVert)]
    bmesh.ops.translate(bm, vec=Vector((0, width, 0)), verts=moved)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    if bevel > 0:
        bmesh.ops.bevel(bm, geom=list(bm.edges), offset=bevel, segments=segments, affect="EDGES", profile=0.5, clamp_overlap=True)
    return _finish(bm, name, mat, loc, (0, 0, rot_z), **kw)


def _arched(x0, x1, zb, wheels, r):
    """Bottom edge of a side profile from x0 to x1 at height zb, with a round arch over each wheel."""
    pts = [(x0, zb)]
    for wx in wheels:
        pts += [(wx + r * math.cos(math.pi * (1 - k / 8)), zb + r * math.sin(math.pi * (1 - k / 8))) for k in range(9)]
    return pts + [(x1, zb)]


def car(name, loc, rot_z=0.0, paint="white", length=4.4):
    """Stylised compact car: shaped body, tumblehome glass cabin, roof panel, wheels with hubs."""
    x, y, z = loc
    k = length / 4.4
    c, s = math.cos(rot_z), math.sin(rot_z)

    def at(dx, dy, dz):
        return (x + c * dx - s * dy, y + s * dx + c * dy, z + dz)

    body = _arched(-2.2, 2.2, 0.24, (-1.38, 1.38), 0.46) + [(2.2, 0.62), (1.95, 0.84), (0.95, 0.94), (-1.95, 0.97), (-2.2, 0.86)]
    prism(f"{name}_body", [(px * k, pz) for px, pz in body], 1.76, at(0, 0, 0), paint, rot_z=rot_z, bevel=0.06)
    cabin = [(0.98, 0.9), (0.2, 1.37), (-1.3, 1.37), (-1.98, 0.93)]
    prism(f"{name}_cabin", [(px * k, pz) for px, pz in cabin], 1.6, at(0, 0, 0), "carglass", rot_z=rot_z, bevel=0.06)
    roof = [(0.16, 1.34), (-1.26, 1.34), (-1.28, 1.42), (0.14, 1.42)]
    prism(f"{name}_roof", [(px * k, pz) for px, pz in roof], 1.5, at(0, 0, 0), paint, rot_z=rot_z, bevel=0.03, segments=2)
    for dx in (-1.38 * k, 1.38 * k):
        for dy in (-0.8, 0.8):
            side = 1 if dy > 0 else -1
            # cylinders extend along local -y once rotated upright; offset so they sit centred on dy
            cyl(f"{name}_w{dx:.1f}{dy:.1f}", 0.34, 0.24, at(dx, dy + 0.12, 0.34), "tyre", verts=24, rot=(math.pi / 2, 0, rot_z), bevel=0.05)
            cyl(f"{name}_hub{dx:.1f}{dy:.1f}", 0.2, 0.02, at(dx, dy + side * 0.121 + (0.02 if side > 0 else 0), 0.34), "silver", verts=16, rot=(math.pi / 2, 0, rot_z))
    for dy in (-0.62, 0.62):
        box(f"{name}_hl{dy}", (0.04, 0.34, 0.09), at(2.19 * k, dy, 0.66), "led_white", bevel=0.0, rot=(0, 0, rot_z))
        box(f"{name}_tl{dy}", (0.04, 0.34, 0.08), at(-2.19 * k, dy, 0.7), "led_red", bevel=0.0, rot=(0, 0, rot_z))
    box(f"{name}_grille", (0.03, 0.9, 0.12), at(2.2 * k, 0, 0.36), "darkgray", bevel=0.01, rot=(0, 0, rot_z))


def text_mesh(name, text, loc, size, depth, mat, rot=(math.pi / 2, 0, 0), align="CENTER", resolution=None, **kw):
    """Extruded 3D lettering converted to a mesh. `resolution` (curve steps, no bevel) keeps far signage light."""
    cu = bpy.data.curves.new(name, "FONT")
    cu.body = text
    cu.size = size
    cu.extrude = depth / 2
    cu.bevel_depth = min(0.02, depth / 4) if resolution is None else 0.0
    if resolution is not None:
        cu.resolution_u = resolution
    cu.align_x = align
    cu.align_y = "BOTTOM"
    tmp = bpy.data.objects.new(name + "_tmp", cu)
    COL.objects.link(tmp)
    dg = bpy.context.evaluated_depsgraph_get()
    me = bpy.data.meshes.new_from_object(tmp.evaluated_get(dg))
    bpy.data.objects.remove(tmp)
    bpy.data.curves.remove(cu)
    bm = bmesh.new()
    bm.from_mesh(me)
    bpy.data.meshes.remove(me)
    return _finish(bm, name, mat, loc, rot, **kw)


@lowpoly
def person(name, loc, rot_z=0.0, mat="white", h=1.75, pose="stand"):
    """Architectural-model figure: rounded legs, torso and head."""
    x, y, z = loc
    k = h / 1.75
    c, s = math.cos(rot_z), math.sin(rot_z)
    stride = 0.12 if pose == "walk" else 0.0
    for side in (-1, 1):
        lx = x - s * side * 0.1 + c * side * stride
        ly = y + c * side * 0.1 + s * side * stride
        box(f"{name}_leg{side}", (0.14 * k, 0.16 * k, 0.86 * k), (lx, ly, z), mat, bevel=0.06 * k, rot=(0, -side * stride * 1.2, rot_z))  # foot off-centre, top back at the hip
    box(f"{name}_torso", (0.26 * k, 0.44 * k, 0.62 * k), (x, y, z + 0.84 * k), mat, bevel=0.1 * k, rot=(0, 0, rot_z))
    for side in (-1, 1):
        ax = x - s * side * 0.27 * k
        ay = y + c * side * 0.27 * k
        box(f"{name}_arm{side}", (0.11 * k, 0.11 * k, 0.56 * k), (ax, ay, z + 0.88 * k), mat, bevel=0.05 * k, rot=(0, -side * stride, rot_z))
    sphere(f"{name}_head", 0.12 * k, (x, y, z + 1.6 * k), mat, scale=(0.9, 0.85, 1.05), subdiv=2)


SHIRTS = ["cloth_navy", "cloth_beige", "cloth_red", "cloth_white", "cloth_black", "cloth_teal", "cloth_gray", "cloth_yellow"]
PANTS = ["cloth_denim", "cloth_black", "cloth_gray", "cloth_beige", "cloth_navy"]
SKINS = ["skin1", "skin2", "skin3"]
# medical staff and patients: shirt / trousers / long coat / cap colours
# glTF export used by bake_export.py and recolor_export.py (Draco: decoded in the browser from public/draco/)
GLTF_EXPORT = dict(
    export_format="GLB",
    use_selection=True,
    export_apply=True,
    export_texcoords=True,
    export_normals=True,
    export_vertex_color="ACTIVE",
    export_materials="EXPORT",
    export_image_format="NONE",
    export_extras=True,
    export_yup=True,
    export_cameras=False,
    export_lights=False,
    export_draco_mesh_compression_enable=True,
    export_draco_mesh_compression_level=7,
    export_draco_position_quantization=16,
    export_draco_normal_quantization=10,
    export_draco_texcoord_quantization=14,
)

OUTFITS = {
    "doctor": {"shirt": "scrub_blue", "pants": "cloth_navy", "coat": "coat_white"},
    "doctor2": {"shirt": "cloth_teal", "pants": "cloth_gray", "coat": "coat_white"},
    "nurse": {"shirt": "scrub_pink", "pants": "scrub_pink"},
    "nurse2": {"shirt": "scrub_blue", "pants": "scrub_blue"},
    "surgeon": {"shirt": "scrub_green", "pants": "scrub_green", "cap": "scrub_green"},
    "patient": {"shirt": "gown", "pants": "gown"},
    "paramedic": {"shirt": "orange", "pants": "cloth_navy"},
    "student": {"shirt": "cloth_white", "pants": "cloth_navy"},
    "student2": {"shirt": "sky_blue", "pants": "cloth_gray"},
    "teacher": {"shirt": "accent_blue", "pants": "cloth_gray"},
    "worker": {"shirt": "safety_yellow", "pants": "cloth_navy"},
}


@lowpoly
def human(name, loc, rot_z=0.0, seed=0, pose="stand", h=1.72, outfit=None):
    """Clothed figure (stand / walk / sit) built from rounded parts, facing +x of rot_z.
    outfit: a key of OUTFITS (doctor, nurse, surgeon, patient, ...) or None for street clothes."""
    rnd = random.Random(seed)
    shirt = rnd.choice(SHIRTS)
    pants = rnd.choice(PANTS)
    skin = rnd.choice(SKINS)
    hair = "hair" if rnd.random() < 0.75 else "hair2"
    wear = OUTFITS.get(outfit, {})
    shirt, pants = wear.get("shirt", shirt), wear.get("pants", pants)
    coat, cap = wear.get("coat"), wear.get("cap")
    x, y, z = loc
    k = h / 1.72
    c, s = math.cos(rot_z), math.sin(rot_z)

    def at(fx, sy, up):
        return (x + c * fx - s * sy, y + s * fx + c * sy, z + up * k)

    stride = 0.14 if pose == "walk" else 0.0
    if pose == "sit":
        for side in (-1, 1):
            box(f"{name}_thigh{side}", (0.46 * k, 0.15 * k, 0.15 * k), at(0.2 * k, side * 0.1 * k, 0.43), pants, bevel=0.06 * k, rot=(0, 0, rot_z))
            box(f"{name}_shin{side}", (0.14 * k, 0.14 * k, 0.45 * k), at(0.42 * k, side * 0.1 * k, 0.0), pants, bevel=0.06 * k, rot=(0, 0, rot_z))
        base = 0.52
    else:
        for side in (-1, 1):
            box(f"{name}_leg{side}", (0.15 * k, 0.15 * k, 0.84 * k), at(side * stride, side * 0.1 * k, 0.0), pants, bevel=0.06 * k, rot=(0, -side * stride * 1.3, rot_z))  # foot off-centre, top back at the hip
            box(f"{name}_shoe{side}", (0.26 * k, 0.12 * k, 0.07 * k), at(side * stride + 0.05, side * 0.1 * k, 0.0), "cloth_black", bevel=0.03 * k, rot=(0, 0, rot_z))
        base = 0.82
    box(f"{name}_torso", (0.25 * k, 0.42 * k, 0.6 * k), at(0, 0, base), shirt, bevel=0.1 * k, rot=(0, 0, rot_z))
    if coat:  # open lab coat over the shirt, down to the knees when standing
        for side in (-1, 1):
            box(f"{name}_coat{side}", (0.29 * k, 0.17 * k, 0.62 * k), at(-0.01, side * 0.14 * k, base), coat, bevel=0.06 * k, rot=(0, 0, rot_z))
        if pose != "sit":
            box(f"{name}_coattail", (0.28 * k, 0.46 * k, 0.36 * k), at(-0.02, 0, base - 0.34 * k), coat, bevel=0.06 * k, rot=(0, 0, rot_z))
    sleeve = coat or (shirt if rnd.random() < 0.7 else skin)
    for side in (-1, 1):
        swing = side * stride * 1.2  # opposite the leg on that side; hand moved so the top stays at the shoulder
        box(f"{name}_arm{side}", (0.11 * k, 0.11 * k, 0.55 * k), at(-side * stride * 0.65, side * 0.27 * k, base + 0.03), sleeve, bevel=0.05 * k, rot=(0, swing, rot_z))
    cyl(f"{name}_neck", 0.05 * k, 0.08 * k, at(0, 0, base + 0.6), skin, verts=10)
    sphere(f"{name}_head", 0.115 * k, at(0, 0, base + 0.78), skin, scale=(0.95, 0.88, 1.08), subdiv=2)
    sphere(f"{name}_hair", 0.12 * k, at(-0.015, 0, base + 0.82), cap or hair, scale=(1.0, 0.92, 0.85), subdiv=2)


@lowpoly
def cafe_set(name, loc, seed=0, chairs=3, people=True, umbrella=False):
    rnd = random.Random(seed)
    x, y, z = loc
    cyl(f"{name}_base", 0.22, 0.03, (x, y, z), "black", verts=20)
    cyl(f"{name}_stem", 0.035, 0.72, (x, y, z), "black", verts=10)
    cyl(f"{name}_top", 0.42, 0.035, (x, y, z + 0.72), "terrazzo", verts=28, bevel=0.01)
    cup_mats = ["white", "cloth_white"]
    for k in range(chairs):
        a = k * math.tau / chairs + rnd.random() * 0.4
        cx, cy = x + math.cos(a) * 0.72, y + math.sin(a) * 0.72
        face = a + math.pi
        box(f"{name}_seat{k}", (0.42, 0.42, 0.05), (cx, cy, z + 0.44), "woodlight", bevel=0.015, rot=(0, 0, face))
        bx, by = cx - math.cos(face) * 0.19, cy - math.sin(face) * 0.19
        box(f"{name}_back{k}", (0.04, 0.4, 0.42), (bx, by, z + 0.49), "woodlight", bevel=0.012, rot=(0, -0.08, face))
        for q in range(4):
            qa = face + math.pi / 4 + q * math.pi / 2
            cyl(f"{name}_leg{k}{q}", 0.015, 0.44, (cx + math.cos(qa) * 0.2, cy + math.sin(qa) * 0.2, z), "black", verts=6)
        if people and rnd.random() < 0.7:
            human(f"{name}_p{k}", (cx - math.cos(face) * 0.05, cy - math.sin(face) * 0.05, z), rot_z=face, seed=seed * 13 + k, pose="sit")
        cyl(f"{name}_cup{k}", 0.04, 0.09, (x + math.cos(a) * 0.22, y + math.sin(a) * 0.22, z + 0.755), rnd.choice(cup_mats), verts=10)
    if umbrella:
        cyl(f"{name}_upole", 0.03, 2.4, (x, y, z), "frame_dark", verts=8)
        cyl(f"{name}_ucanopy", 1.4, 0.35, (x, y, z + 2.3), "umbrella", verts=16, r2=0.05)


@lowpoly
def pendant(name, loc, drop=0.9, r=0.22, mat="copper"):
    x, y, z = loc
    cyl(f"{name}_cord", 0.008, drop, (x, y, z - drop), "black", verts=4)
    cyl(f"{name}_shade", r, 0.22, (x, y, z - drop - 0.2), mat, verts=20, r2=0.05)
    sphere(f"{name}_bulb", r * 0.45, (x, y, z - drop - 0.2), "led_warm", subdiv=1)


@lowpoly
def shelf(name, loc, w=1.6, rot_z=0.0, seed=0):
    rnd = random.Random(seed)
    x, y, z = loc
    c, s = math.cos(rot_z), math.sin(rot_z)
    box(f"{name}_frame", (w, 0.45, 1.9), (x, y, z), "white", bevel=0.02, rot=(0, 0, rot_z))
    for lvl in range(4):
        zz = z + 0.25 + lvl * 0.42
        n = int(w / 0.22)
        for k in range(n):
            if rnd.random() < 0.25:
                continue
            off = -w / 2 + 0.12 + k * (w - 0.2) / n
            hh = 0.15 + rnd.random() * 0.18
            box(f"{name}_g{lvl}{k}", (0.16, 0.3, hh), (x + c * off - s * 0.08, y + s * off + c * 0.08, zz), f"goods{rnd.randint(1, 4)}", bevel=0.01, rot=(0, 0, rot_z))


def van(name, loc, rot_z=0.0, paint="white"):
    x, y, z = loc
    c, s = math.cos(rot_z), math.sin(rot_z)

    def at(dx, dy, dz):
        return (x + c * dx - s * dy, y + s * dx + c * dy, z + dz)

    body = _arched(-2.6, 2.6, 0.3, (-1.7, 1.7), 0.48) + [(2.6, 0.9), (2.2, 1.35), (1.6, 2.2), (-2.6, 2.2)]
    prism(f"{name}_body", body, 1.9, at(0, 0, 0), paint, rot_z=rot_z, bevel=0.08)
    glass = [(2.25, 1.38), (1.65, 2.12), (0.9, 2.12), (0.9, 1.38)]
    prism(f"{name}_ws", glass, 1.97, at(0, 0, 0), "carglass", rot_z=rot_z, bevel=0.04)
    for dx in (-1.7, 1.7):
        for dy in (-0.88, 0.88):
            cyl(f"{name}_w{dx}{dy}", 0.36, 0.26, at(dx, dy + 0.13, 0.36), "tyre", verts=24, rot=(math.pi / 2, 0, rot_z), bevel=0.05)
    for dy in (-0.7, 0.7):
        box(f"{name}_hl{dy}", (0.04, 0.3, 0.12), at(2.59, dy, 0.8), "led_white", bevel=0, rot=(0, 0, rot_z))


def street_light(name, loc, rot_z=0.0, h=6.0):
    x, y, z = loc
    c, s = math.cos(rot_z), math.sin(rot_z)
    cyl(f"{name}_base", 0.14, 0.4, (x, y, z), "darkgray", verts=16)
    cyl(f"{name}_pole", 0.06, h, (x, y, z), "darkgray", verts=12)
    box(f"{name}_arm", (1.4, 0.1, 0.08), (x + c * 0.65, y + s * 0.65, z + h - 0.05), "darkgray", bevel=0.02, rot=(0, 0, rot_z))
    box(f"{name}_head", (0.7, 0.24, 0.1), (x + c * 1.25, y + s * 1.25, z + h - 0.14), "darkgray", bevel=0.03, rot=(0, 0, rot_z))
    box(f"{name}_lamp", (0.6, 0.18, 0.02), (x + c * 1.25, y + s * 1.25, z + h - 0.16), "led_warm", bevel=0.0, rot=(0, 0, rot_z))


@lowpoly
def bench(name, loc, rot_z=0.0, w=1.8):
    x, y, z = loc
    c, s = math.cos(rot_z), math.sin(rot_z)
    box(f"{name}_seat", (w, 0.5, 0.08), (x, y, z + 0.42), "wood", bevel=0.02, rot=(0, 0, rot_z))
    for sx in (-1, 1):
        box(f"{name}_leg{sx}", (0.08, 0.46, 0.42), (x + c * sx * (w / 2 - 0.15), y + s * sx * (w / 2 - 0.15), z), "darkgray", bevel=0.01, rot=(0, 0, rot_z))


def rotate_about(ob, pivot, angle_z):
    """Rotate an object about a world pivot on Z (keeps it upright)."""
    m = Matrix.Translation(pivot) @ Matrix.Rotation(angle_z, 4, "Z") @ Matrix.Translation(-Vector(pivot))
    ob.matrix_world = m @ ob.matrix_world


def join_into(target, others):
    """Join `others` into `target` (keeps target's origin, which is used as a pivot)."""
    objs = [target, *others]
    for o in bpy.context.scene.objects:
        o.select_set(False)
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = target
    with bpy.context.temp_override(active_object=target, selected_editable_objects=objs, selected_objects=objs):
        bpy.ops.object.join()
    target.select_set(False)
    return target


# ------------------------------------------------------------------ moving actors
# grp/kind "move": never joined, left out of the lightmap bake (no ghost shadows), vertex-lit,
# animated in the browser from their extras (see src/three/model/baked.jsx).

def rigid(objs, name, pivot=(0.0, 0.0, 0.0)):
    """Join parts into one 'move' mesh named `name` whose origin sits at `pivot` (world)."""
    bpy.context.view_layer.update()  # new objects' matrix_world is stale until the depsgraph runs
    for o in objs:
        o.data.transform(o.matrix_world)
        o.matrix_world = Matrix.Identity(4)
    ob = join_into(objs[0], objs[1:]) if len(objs) > 1 else objs[0]
    ob.name = ob.data.name = name
    ob.data.transform(Matrix.Translation(-Vector(pivot)))
    ob.location = pivot
    ob["grp"] = ob["kind"] = "move"
    return ob


def _parts(prefix):
    # only parts built in a "move" group: a static neighbour sharing the prefix (the 06 "shuttle_stop" shelter for
    # the "shuttle", 03's "bus_bay" for a "bus") would otherwise be swallowed and drive off with the mover
    return [o for o in COL.objects if o.name.startswith(prefix + "_") and o.get("grp") == "move"]


def _top_centre(objs):
    bpy.context.view_layer.update()
    pts = [o.matrix_world @ v.co for o in objs for v in o.data.vertices]
    return (sum(p.x for p in pts) / len(pts), sum(p.y for p in pts) / len(pts), max(p.z for p in pts))


def place(ob, loc, heading, **props):
    ob.location = loc
    ob.rotation_euler = (0.0, 0.0, heading)
    for k, v in props.items():
        ob[k] = v
    return ob


def path_length(path, closed):
    pts = list(path) + ([path[0]] if closed else [])
    return sum(math.hypot(b[0] - a[0], b[1] - a[1]) for a, b in zip(pts, pts[1:]))


def path_point(path, closed, d):
    """Position and heading at distance d along a polyline [(x, y), ...] (wraps around)."""
    pts = list(path) + ([path[0]] if closed else [])
    d %= path_length(path, closed)
    for a, b in zip(pts, pts[1:]):
        seg = math.hypot(b[0] - a[0], b[1] - a[1])
        if seg > 1e-6 and d <= seg:
            t = d / seg
            return (a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t), math.atan2(b[1] - a[1], b[0] - a[0])
        d -= seg
    return pts[-1], 0.0


def _on_path(body, key, speed, path, closed, at, z):
    (x, y), heading = path_point(path, closed, at)
    flat = [round(c, 3) for p in path for c in p]
    return place(body, (x, y, z), heading, **{key: speed}, path=flat, closed=int(closed), path_at=round(at, 3))


def walker(name, path, speed, at, closed=True, seed=0, z=0.16, outfit=None, carry=None, h=1.72):
    """Pedestrian walking along a polyline (Blender xy), starting `at` metres along it.
    Legs and arms are child meshes pivoting at hip / shoulder so the browser can swing them.
    carry(prefix) may build something in front of the walker (it faces +x at the origin)."""
    with group("move"):
        human(name, (0, 0, 0), rot_z=0.0, seed=seed, pose="stand", outfit=outfit, h=h)
    parts = _parts(name)
    limbs = []
    for side in (-1, 1):
        leg = [o for o in parts if o.name in (f"{name}_leg{side}", f"{name}_shoe{side}")]
        arm = [o for o in parts if o.name == f"{name}_arm{side}"]
        for bits, tag, phase in ((leg, "leg", side), (arm, "arm", -side)):
            top = _top_centre(bits)
            limb = rigid(bits, f"{name}_{tag}{side}", (0.0, top[1], top[2]))
            limb["limb"] = phase
            limbs.append(limb)
            parts = [o for o in parts if o not in bits]
    body = rigid(parts, name)
    for limb in limbs:
        limb.parent = body
    if carry:
        with group("move"):
            carry(f"{name}_carry")
        rigid(_parts(f"{name}_carry"), f"{name}_carry").parent = body
    return _on_path(body, "walk", speed, path, closed, at, z)


def driver(name, path, speed, at, closed=True, paint="white", kind="car", z=0.02):
    """Car or van driving along a polyline; open lanes should start and end off the base."""
    with group("move"):
        (van if kind == "van" else car)(name, (0, 0, 0), rot_z=0.0, paint=paint)
    return _on_path(rigid(_parts(name), name), "drive", speed, path, closed, at, z)


def best_phase(lane, loop, loopers, half_x, samples=480):
    """Phase (metres) for a through-car on an open `lane` that keeps it clear of cars circulating on the closed
    `loop` (all at one speed; the lane must be a whole fraction of the loop so their phases never drift).
    Only same-lane / crossing conflicts count; returns (phase, clearance)."""
    total = path_length(loop, True)

    def clearance(phase):
        worst = 1e9
        for k in range(samples):
            d = k * total / samples
            p, _ = path_point(lane, False, phase + d)
            if abs(p[0]) > half_x + 2:
                continue
            for at in loopers:
                q, _ = path_point(loop, True, at + d)
                if abs(q[0]) < half_x + 2 and abs(p[1] - q[1]) < 2.8:
                    worst = min(worst, math.hypot(p[0] - q[0], p[1] - q[1]))
        return worst

    phase = max(range(0, int(path_length(lane, False))), key=clearance)
    return phase, clearance(phase)
