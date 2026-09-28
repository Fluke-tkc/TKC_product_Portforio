"""Smart Building diorama.

Run:  blender -b --python public/Blender/scripts/smart_building.py -- [--preview out.png]
Builds the scene, saves public/Blender/smart_building.blend and optionally renders a preview.
Coordinates: Blender Z up, metres. The viewer looks from the front-right (+X, -Y).
"""
import math
import os
import random
import sys

import bpy
from mathutils import Vector

sys.path.append(os.path.dirname(__file__))
import tkc_lib as L  # noqa: E402
from tkc_lib import box, cyl, empty, group, plane, sphere, upright_screen  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
BLEND = os.path.join(HERE, "..", "smart_building.blend")

# building footprint and levels
BX0, BX1, BY0, BY1 = -20.0, 2.0, 2.0, 18.0
GROUND = 0.12
FLOORS = [GROUND, 4.72, 8.62, 12.52]  # finished floor levels
ROOF = 16.42  # top of roof slab
SLAB = 0.3
CEIL = [FLOORS[1] - SLAB, FLOORS[2] - SLAB, FLOORS[3] - SLAB, ROOF - SLAB]


def site():
    L.set_group("static_site")
    box("plinth", (44, 40, 1.2), (0, 0, -1.2), "offwhite", bevel=0.12, segments=3)
    # road + kerbs
    box("road", (44, 5, 0.02), (0, -17.5, 0), "asphalt", bevel=0)
    for i in range(8):
        box(f"road_dash{i}", (2.2, 0.16, 0.005), (-19 + i * 5.5, -17.5, 0.02), "paint_white", bevel=0)
    box("sidewalk_l", (34, 2, 0.12), (-5, -14, 0), "concrete", bevel=0.02)
    box("sidewalk_r", (6, 2, 0.12), (19, -14, 0), "concrete", bevel=0.02)
    box("driveway", (4, 2, 0.02), (14, -14, 0), "asphalt", bevel=0)
    # plaza + lawns
    box("plaza", (26, 15, 0.12), (-9, -5.5, 0), "stone", bevel=0.02)
    for i in range(12):
        box(f"plaza_joint{i}", (0.03, 15, 0.004), (-21.5 + i * 2.2, -5.5, 0.12), "concrete", bevel=0)
    box("lawn_left", (2, 18, 0.1), (-21, 11, 0), "grass", bevel=0.03)
    box("lawn_back", (44, 2, 0.1), (0, 19, 0), "grass", bevel=0.03)
    box("lawn_mid", (3, 16, 0.1), (3.5, 10, 0), "grass", bevel=0.03)
    box("under_building", (22.6, 16.6, 0.12), ((BX0 + BX1) / 2, (BY0 + BY1) / 2, 0), "stone", bevel=0.02)
    box("lawn_right", (0.8, 29, 0.1), (21.6, 1.5, 0), "grass", bevel=0.03)

    # trees
    rnd = random.Random(4)
    spots = [(-21, 4.5), (-21, 9.5), (-21, 14.5), (-14, 19), (-6, 19), (2, 19), (10, 19), (17.5, 19), (3.5, 6), (3.5, 12.5), (21.6, -8), (21.6, 0), (21.6, 8)]
    for i, (x, y) in enumerate(spots):
        L.tree(f"tree{i}", (x, y, 0.1), h=5.5 + rnd.random() * 1.8, spread=0.9 + rnd.random() * 0.3, seed=i + 10)
    for i, (x, y) in enumerate([(-19, -2.5), (-19, -9.5)]):
        box(f"planter{i}", (2.4, 4.2, 0.55), (x, y, 0.12), "white", bevel=0.05)
        box(f"planter_soil{i}", (2.1, 3.9, 0.02), (x, y, 0.64), "soil", bevel=0)
        L.tree(f"ptree{i}", (x, y + 0.6, 0.66), h=4.8, spread=0.8, seed=30 + i)
        for k in range(4):
            sphere(f"pshrub{i}_{k}", 0.45, (x + (k % 2 - 0.5) * 1.2, y - 1.2 + (k // 2) * 0.5, 0.8), "leaflight", scale=(1, 1, 0.7))
    L.bench("bench0", (-15.5, -3, 0.12), rot_z=math.pi / 2)
    L.bench("bench1", (-15.5, -9, 0.12), rot_z=math.pi / 2)
    for i, x in enumerate((-18, -8, 2)):
        L.street_light(f"slight{i}", (x, -13.4, 0.12), rot_z=-math.pi / 2)
    # people (architectural-model figures)
    for i, (x, y, r, m, pose) in enumerate(
        (
            (-8.2, -3.0, 1.4, "white", "walk"),
            (-7.4, -4.4, -1.8, "lightgray", "walk"),
            (-13.0, -6.0, 0.3, "white", "stand"),
            (-12.4, -6.3, 3.4, "brand", "stand"),
            (-5.8, -10.2, 1.6, "white", "walk"),
            (-17.0, -13.8, 0.0, "lightgray", "walk"),
            (-1.0, -14.2, 3.14, "white", "walk"),
            (12.8, -3.0, 1.57, "white", "walk"),
            (10.4, 6.0, -1.57, "lightgray", "stand"),
            (-15.4, -3.4, 0.0, "white", "stand"),
        )
    ):
        L.person(f"person{i}", (x, y, 0.12 if y > -13 else 0.12), rot_z=r, mat=m, pose=pose)
    # traffic
    L.car("road_car0", (-12, -16.3, 0.02), rot_z=0, paint="brand")
    L.car("road_car1", (6, -18.7, 0.02), rot_z=math.pi, paint="silver")


def windows_wall(name, axis, fixed, a0, a1, z0, z1, thickness=0.3, spacing=3.0, win=2.0, sill=0.9, head=0.5):
    """Solid wall with a row of windows (glass panes) between sill and head."""
    length = a1 - a0

    def piece(nm, c, span, zb, h, mat="white"):
        if span <= 0.01:
            return None
        if axis == "x":
            return box(nm, (span, thickness, h), (c, fixed, zb), mat, bevel=0.015)
        return box(nm, (thickness, span, h), (fixed, c, zb), mat, bevel=0.015)

    piece(f"{name}_sill", (a0 + a1) / 2, length, z0, sill)
    piece(f"{name}_head", (a0 + a1) / 2, length, z1 - head, head)
    n = max(1, int(length // spacing))
    edge = (length - n * spacing) / 2
    centres = [a0 + edge + spacing * (i + 0.5) for i in range(n)]
    g_z = z0 + sill
    g_h = z1 - head - g_z
    bounds = [a0] + [v for c in centres for v in (c - win / 2, c + win / 2)] + [a1]
    for i in range(0, len(bounds), 2):
        lo, hi = bounds[i], bounds[i + 1]
        piece(f"{name}_p{i // 2}", (lo + hi) / 2, hi - lo, g_z, g_h)
    for i, c in enumerate(centres):
        if axis == "x":
            box(f"{name}_g{i}", (win, 0.03, g_h), (c, fixed, g_z), "glass", bevel=0)
        else:
            box(f"{name}_g{i}", (0.03, win, g_h), (fixed, c, g_z), "glass", bevel=0)


def curtain_wall(name, axis, fixed, a0, a1, z0, z1, spacing=1.5):
    if axis == "x":
        box(f"{name}_glass", (a1 - a0, 0.03, z1 - z0), ((a0 + a1) / 2, fixed, z0), "glass", bevel=0)
    else:
        box(f"{name}_glass", (0.03, a1 - a0, z1 - z0), (fixed, (a0 + a1) / 2, z0), "glass", bevel=0)
    n = int((a1 - a0) / spacing)
    for i in range(n + 1):
        a = a0 + i * (a1 - a0) / n
        if axis == "x":
            box(f"{name}_m{i}", (0.07, 0.14, z1 - z0), (a, fixed, z0), "darkgray", bevel=0.01)
        else:
            box(f"{name}_m{i}", (0.14, 0.07, z1 - z0), (fixed, a, z0), "darkgray", bevel=0.01)
    for zz, nm in ((z0, "b"), (z1 - 0.1, "t")):
        if axis == "x":
            box(f"{name}_{nm}", (a1 - a0, 0.16, 0.1), ((a0 + a1) / 2, fixed, zz), "darkgray", bevel=0.01)
        else:
            box(f"{name}_{nm}", (0.16, a1 - a0, 0.1), (fixed, (a0 + a1) / 2, zz), "darkgray", bevel=0.01)


def shell():
    L.set_group("static_building")
    cx, cy = (BX0 + BX1) / 2, (BY0 + BY1) / 2
    for i, z in enumerate(CEIL):
        ov = 1.5 if i < 3 else 0.5  # balconies on the upper floors, a slim eave at the roof
        x0, x1, y0, y1 = BX0 - 0.3, BX1 + ov, BY0 - ov, BY1 + 0.3
        box(f"slab{i}", (x1 - x0, y1 - y0, SLAB), ((x0 + x1) / 2, (y0 + y1) / 2, z), "white", bevel=0.05)
        box(f"slab_soffit{i}", (x1 - x0 - 0.1, y1 - y0 - 0.1, 0.02), ((x0 + x1) / 2, (y0 + y1) / 2, z - 0.02), "woodlight", bevel=0)
        # LED line along the exposed front / right slab edges
        box(f"slab_led_f{i}", (x1 - x0, 0.03, 0.06), ((x0 + x1) / 2, y0 - 0.01, z + 0.08), "led_cyan", bevel=0)
        box(f"slab_led_r{i}", (0.03, y1 - y0, 0.06), (x1 + 0.01, (y0 + y1) / 2, z + 0.08), "led_cyan", bevel=0)
        if i < 3:
            top = z + SLAB
            box(f"bal_rail_f{i}", (x1 - x0 - 0.2, 0.03, 1.05), ((x0 + x1) / 2, y0 + 0.08, top), "glass", bevel=0)
            box(f"bal_rail_r{i}", (0.03, y1 - y0 - 0.2, 1.05), (x1 - 0.08, (y0 + y1) / 2, top), "glass", bevel=0)
            box(f"bal_cap_f{i}", (x1 - x0 - 0.2, 0.06, 0.05), ((x0 + x1) / 2, y0 + 0.08, top + 1.05), "aluminium", bevel=0.01)
            box(f"bal_cap_r{i}", (0.06, y1 - y0 - 0.2, 0.05), (x1 - 0.08, (y0 + y1) / 2, top + 1.05), "aluminium", bevel=0.01)
            # planter troughs with shrubs along the balcony edges
            rnd = random.Random(20 + i)
            for j in range(9):
                px = BX0 + 1.5 + j * 2.35
                box(f"planter_f{i}_{j}", (1.7, 0.5, 0.45), (px, y0 + 0.45, top), "white", bevel=0.04)
                for q in range(3):
                    sphere(f"pshrub_f{i}_{j}_{q}", 0.3 + rnd.random() * 0.1, (px - 0.5 + q * 0.5, y0 + 0.45, top + 0.55), ["leaf", "leaflight", "leafdark"][(j + q) % 3], scale=(1, 0.8, 0.8))
            for j in range(6):
                py = BY0 + 1.2 + j * 2.5
                box(f"planter_r{i}_{j}", (0.5, 1.7, 0.45), (x1 - 0.45, py, top), "white", bevel=0.04)
                for q in range(3):
                    sphere(f"pshrub_r{i}_{j}_{q}", 0.3 + rnd.random() * 0.1, (x1 - 0.45, py - 0.5 + q * 0.5, top + 0.55), ["leaf", "leaflight", "leafdark"][(j + q) % 3], scale=(0.8, 1, 0.8))
    # parapet
    for nm, size, loc in (
        ("par_b", (BX1 - BX0 + 0.6, 0.25, 0.9), (cx, BY1 + 0.175, ROOF)),
        ("par_f", (BX1 - BX0 + 0.6, 0.25, 0.9), (cx, BY0 - 0.175, ROOF)),
        ("par_l", (0.25, BY1 - BY0 + 0.1, 0.9), (BX0 - 0.175, cy, ROOF)),
        ("par_r", (0.25, BY1 - BY0 + 0.1, 0.9), (BX1 + 0.175, cy, ROOF)),
    ):
        box(nm, size, loc, "white", bevel=0.05)
    box("roof_floor", (BX1 - BX0 - 0.2, BY1 - BY0 - 0.2, 0.02), (cx, cy, ROOF), "lightgray", bevel=0)
    # brand lettering on the front parapet
    L.text_mesh("tkc_logo", "TKC", (-5.2, BY0 - 0.4, ROOF + 0.08), 1.1, 0.2, "brand")
    L.text_mesh("tkc_logo_sub", "SMART BUILDING", (-3.6, BY0 - 0.34, ROOF + 0.14), 0.36, 0.08, "darkgray", align="LEFT")

    for i in range(4):
        z0 = FLOORS[i]
        z1 = CEIL[i]
        windows_wall(f"wall_back{i}", "x", BY1 - 0.15, BX0, BX1, z0, z1)
        windows_wall(f"wall_left{i}", "y", BX0 + 0.15, BY0, BY1 - 0.3, z0, z1)
        curtain_wall(f"cw_front{i}", "x", BY0, BX0 + 0.3, BX1, z0, z1)
        curtain_wall(f"cw_right{i}", "y", BX1, BY0, BY1 - 0.3, z0, z1)
        # floor finishes
        fin = ["stone", "carpet", "woodlight", "midgray"][i]
        box(f"floor{i}", (BX1 - BX0 - 0.4, BY1 - BY0 - 0.4, 0.015), (cx, cy, z0), fin, bevel=0)
        # ceiling light strips
        for k in range(4):
            for j in range(3):
                box(f"clight{i}_{k}_{j}", (2.4, 0.12, 0.03), (-16.5 + k * 5.2, 5.5 + j * 4.2, z1 - 0.035), "led_warm" if i != 3 else "led_white", bevel=0)
        # columns just inside the curtain walls
        for k, (x, y) in enumerate(((-13.0, 2.5), (-6.5, 2.5), (1.5, 2.5), (1.5, 10.0))):
            cyl(f"col{i}_{k}", 0.2, z1 - z0, (x, y, z0), "white", verts=20)
    # core (lifts + stairs) at the back-left
    box("core", (4, 4, ROOF + 1.4 - GROUND), (-18, 16, GROUND), "white", bevel=0.05)
    for i in range(4):
        box(f"lift{i}", (0.02, 1.2, 2.3), (-15.99, 16, FLOORS[i]), "aluminium", bevel=0)
    # entrance canopy
    box("canopy", (6.5, 2.8, 0.25), (-7.5, 0.6, 4.0), "white", bevel=0.05)
    box("canopy_soffit", (6.3, 2.6, 0.02), (-7.5, 0.6, 3.98), "wood", bevel=0)
    box("canopy_led", (6.3, 0.04, 0.05), (-7.5, -0.78, 4.02), "led_cyan", bevel=0)
    for x in (-10.4, -4.6):
        cyl(f"canopy_col{x}", 0.09, 3.9, (x, -0.55, GROUND), "darkgray", verts=12)
    box("door_frame", (3.2, 0.12, 3.0), (-7.5, BY0 + 0.05, GROUND), "darkgray", bevel=0.02)
    box("door_glass", (3.0, 0.14, 2.9), (-7.5, BY0 + 0.05, GROUND), "glass", bevel=0)


def lobby():
    z = FLOORS[0]
    L.set_group("static_building")
    # reception + logo wall
    box("reception", (4.2, 0.9, 1.05), (-12, 12.3, z), "white", bevel=0.06)
    box("reception_top", (4.4, 1.05, 0.05), (-12, 12.3, z + 1.05), "woodlight", bevel=0.015)
    box("logo_wall", (6.5, 0.25, 3.6), (-12, 17.4, z), "wood", bevel=0.02)
    upright_screen("logo_sign", (3.4, 0.9), (-12, 17.26, z + 2.5), "-y", "screen_logo")
    L.office_chair("rchair0", (-12.8, 13.3, z), rot_z=math.pi / 2)
    L.office_chair("rchair1", (-11.2, 13.3, z), rot_z=math.pi / 2)
    # lounge
    L.sofa("sofa0", (-3.5, 14.8, z), w=2.6)
    L.sofa("sofa1", (-0.2, 12.5, z), w=2.2, rot_z=math.pi / 2)
    cyl("coffee_table", 0.6, 0.4, (-3.2, 12.6, z), "woodlight", verts=32, bevel=0.02)
    for i, (x, y) in enumerate(((-18.8, 3.4), (-5.2, 16.6), (0.9, 16.4), (-15.2, 12.0))):
        L.potted_plant(f"lplant{i}", (x, y, z), h=1.7, seed=40 + i)
    L.person("lobby_p0", (-12.0, 13.5, z), rot_z=-math.pi / 2, mat="lightgray")
    L.person("lobby_p1", (-7.0, 7.2, z), rot_z=-math.pi / 2, mat="white", pose="walk")
    L.person("lobby_p2", (-3.6, 11.2, z), rot_z=math.pi / 2, mat="brand")

    with group("hot:access-control"):
        posts = [-10.2, -8.9, -7.6, -6.3, -5.0]
        for i, x in enumerate(posts):
            box(f"gate_post{i}", (0.24, 1.3, 1.0), (x, 5.2, z), "aluminium", bevel=0.04)
            box(f"gate_led{i}", (0.18, 1.1, 0.02), (x, 5.2, z + 1.0), "led_cyan", bevel=0)
            box(f"gate_reader{i}", (0.16, 0.16, 0.03), (x, 4.75, z + 1.01), "led_blue", bevel=0)
            if i < len(posts) - 1:
                box(f"gate_flap{i}", ((posts[i + 1] - x) * 0.4, 0.03, 0.75), (x + (posts[i + 1] - x) * 0.3, 5.2, z + 0.25), "glass", bevel=0)
                box(f"gate_flap{i}b", ((posts[i + 1] - x) * 0.4, 0.03, 0.75), (x + (posts[i + 1] - x) * 0.7, 5.2, z + 0.25), "glass", bevel=0)
        # face-recognition kiosk
        box("face_kiosk", (0.4, 0.3, 1.5), (-11.6, 4.6, z), "white", bevel=0.05)
        upright_screen("face_scr", (0.3, 0.42), (-11.6, 4.44, z + 1.2), "-y", "screen_face")
        empty("pin_access-control", (-7.6, 5.2, z + 1.9))


def office():
    z = FLOORS[1]
    L.set_group("static_building")
    for cx_ in (-14.5, -6.5):
        for k in range(2):
            y = 6.4 + k * 3.2
            L.desk(f"desk{cx_}_{k}a", (cx_ - 0.85, y, z), rot_z=0)
            L.desk(f"desk{cx_}_{k}b", (cx_ + 0.85, y, z), rot_z=0)
            L.desk(f"desk{cx_}_{k}c", (cx_ - 0.85, y + 0.8, z), rot_z=math.pi)
            L.desk(f"desk{cx_}_{k}d", (cx_ + 0.85, y + 0.8, z), rot_z=math.pi)
            for j, (dx, dy, r) in enumerate(((-0.85, -0.65, math.pi / 2), (0.85, -0.65, math.pi / 2), (-0.85, 1.45, -math.pi / 2), (0.85, 1.45, -math.pi / 2))):
                L.office_chair(f"ochair{cx_}_{k}_{j}", (cx_ + dx, y + dy, z), rot_z=r)
    for i, (x, y) in enumerate(((-18.9, 3.2), (-1.2, 3.4), (0.8, 16.6), (-10.5, 16.8))):
        L.potted_plant(f"oplant{i}", (x, y, z), h=1.5, seed=60 + i)
    L.person("office_p0", (-2.8, 8.0, z), rot_z=math.pi, mat="white", pose="walk")
    # phone booth
    box("booth", (1.4, 1.4, 2.4), (-2.2, 15.8, z), "white", bevel=0.05)
    box("booth_glass", (1.2, 0.04, 2.1), (-2.2, 15.08, z + 0.1), "glass", bevel=0)

    with group("hot:motion-sensors"):
        cyl("pir_body", 0.2, 0.12, (-10.5, 9.8, CEIL[1] - 0.12), "white", verts=24, bevel=0.03)
        sphere("pir_dome", 0.14, (-10.5, 9.8, CEIL[1] - 0.12), "offwhite", scale=(1, 1, 0.7))
        cyl("pir_ring", 0.21, 0.02, (-10.5, 9.8, CEIL[1] - 0.06), "led_cyan", verts=24)
        box("pir_wall", (0.12, 0.08, 0.16), (-19.72, 6.0, z + 2.3), "white", bevel=0.02)
        box("pir_wall_led", (0.02, 0.06, 0.04), (-19.65, 6.0, z + 2.36), "led_cyan", bevel=0)
        empty("pin_motion-sensors", (-10.5, 9.8, CEIL[1] - 0.55))


def meeting_floor():
    z = FLOORS[2]
    L.set_group("static_building")
    # glass meeting room back-left
    box("meet_glass_f", (7.5, 0.04, CEIL[2] - z), (-12.0, 11.0, z), "glass", bevel=0)
    box("meet_glass_r", (0.04, 6.5, CEIL[2] - z), (-8.25, 14.25, z), "glass", bevel=0)
    box("meet_frame", (7.5, 0.08, 0.08), (-12.0, 11.0, CEIL[2] - 0.08), "darkgray", bevel=0)
    box("meet_table", (3.4, 1.3, 0.05), (-12.5, 14.2, z + 0.72), "woodlight", bevel=0.02)
    box("meet_table_base", (2.6, 0.5, 0.72), (-12.5, 14.2, z), "white", bevel=0.03)
    for k in range(3):
        L.office_chair(f"mchair{k}a", (-13.7 + k * 1.2, 13.2, z), rot_z=math.pi / 2, fabric="fabriclight")
        L.office_chair(f"mchair{k}b", (-13.7 + k * 1.2, 15.2, z), rot_z=-math.pi / 2, fabric="fabriclight")
    upright_screen("meet_display", (2.6, 1.5), (-12.5, 17.62, z + 1.7), "-y", "screen_meeting")
    box("meet_display_bezel", (2.75, 0.06, 1.62), (-12.5, 17.66, z + 0.94), "screen_bezel", bevel=0.01)
    for k in range(2):
        y = 5.8 + k * 3.2
        for dx, r in ((-0.85, 0), (0.85, 0)):
            L.desk(f"mdesk{k}{dx}", (-4.5 + dx, y, z), rot_z=r)
            L.office_chair(f"mdchair{k}{dx}", (-4.5 + dx, y - 0.65, z), rot_z=math.pi / 2)
    L.sofa("msofa", (-16.5, 5.2, z), w=2.4, rot_z=math.pi)
    for i, (x, y) in enumerate(((-7.5, 16.6), (0.9, 16.6), (-19.0, 9.5))):
        L.potted_plant(f"mplant{i}", (x, y, z), h=1.6, seed=80 + i)


def control_room():
    z = FLOORS[3]
    L.set_group("static_building")
    with group("hot:building-automation"):
        # video wall 3 x 2
        for r in range(2):
            for c in range(3):
                x = -12.4 + c * 2.05
                zz = z + 1.35 + r * 1.18
                box(f"vw_bezel{r}{c}", (2.0, 0.08, 1.13), (x, 17.66, zz - 0.565), "screen_bezel", bevel=0.01)
                upright_screen(f"vw_scr{r}{c}", (1.9, 1.05), (x, 17.61, zz), "-y", f"screen_vw{r}{c}")
        # curved operator console
        for k, (x, y, rz) in enumerate(((-12.4, 12.4, -0.25), (-10.35, 12.1, 0.0), (-8.3, 12.4, 0.25))):
            L.desk(f"console{k}", (x, y, z), w=2.0, d=0.9, rot_z=rz, monitors=2, top="darkgray")
            L.office_chair(f"cchair{k}", (x + math.sin(rz) * 1.0, y - math.cos(rz) * 1.0, z), rot_z=math.pi / 2 + rz, fabric="fabric")
        # server racks with status LEDs
        for k in range(4):
            x = -4.0 + k * 0.75
            box(f"rack{k}", (0.65, 1.1, 2.1), (x, 16.6, z), "darkgray", bevel=0.02)
            for j in range(6):
                box(f"rack{k}_led{j}", (0.45, 0.01, 0.02), (x, 16.04, z + 0.4 + j * 0.28), "led_green" if (j + k) % 3 else "led_blue", bevel=0)
        # rooftop HVAC is controlled from here too
        for k in range(2):
            x = -2.2 + k * 2.8
            box(f"ahu{k}", (2.3, 3.2, 1.5), (x, 14.8, ROOF), "aluminium", bevel=0.05)
            for j in range(2):
                y = 13.9 + j * 1.8
                cyl(f"ahu{k}_ring{j}", 0.62, 0.12, (x, y, ROOF + 1.5), "darkgray", verts=32)
                L.set_group("anim")
                fan = L.box(f"anim_fan_{k}{j}", (1.05, 0.12, 0.03), (0, 0, 0), "black", bevel=0.01)
                fan2 = L.box(f"anim_fan_{k}{j}_b", (0.12, 1.05, 0.03), (0, 0, 0), "black", bevel=0.01)
                join_into(fan, [fan2])
                fan.location = (x, y, ROOF + 1.55)
                fan["hot"] = "building-automation"
                L.set_group("hot:building-automation")
        cyl("ahu_duct", 0.3, 5.2, (-0.8, 12.4, ROOF + 0.55), "aluminium", verts=16, rot=(0, math.pi / 2, 0))
        empty("pin_building-automation", (-10.35, 16.8, z + 3.3))
    for i, (x, y) in enumerate(((-18.8, 3.4), (0.8, 3.4))):
        L.potted_plant(f"cplant{i}", (x, y, z), h=1.5, seed=90 + i)
    L.person("ctrl_p0", (-6.2, 14.6, z), rot_z=math.pi / 2, mat="lightgray")
    box("bms_label", (0.02, 0.02, 0.02), (-18, 3, z), "white", bevel=0)


def roof():
    L.set_group("hot:renewable-energy")
    with group("hot:renewable-energy"):
        for r in range(3):
            for c in range(8):
                x = -18.4 + c * 1.18
                y = 4.0 + r * 2.7
                box(f"pv{r}{c}", (1.08, 1.7, 0.05), (x, y, ROOF + 0.55), "solar", bevel=0.015, rot=(0.35, 0, 0))
                box(f"pv_frame{r}{c}", (1.12, 1.74, 0.03), (x, y, ROOF + 0.54), "aluminium", bevel=0.01, rot=(0.35, 0, 0))
            box(f"pv_rail{r}", (9.6, 0.08, 0.5), (-14.3, 4.0 + r * 2.7 + 0.5, ROOF), "aluminium", bevel=0.01)
            box(f"pv_railf{r}", (9.6, 0.08, 0.2), (-14.3, 4.0 + r * 2.7 - 0.5, ROOF), "aluminium", bevel=0.01)
        # vertical-axis turbine
        cyl("vawt_pole", 0.07, 2.2, (-6.2, 4.8, ROOF), "aluminium", verts=12)
        L.set_group("anim")
        rotor = []
        for k in range(3):
            a = k * math.tau / 3
            rotor.append(L.box(f"vawt_blade{k}", (0.08, 0.35, 2.0), (math.cos(a) * 0.55, math.sin(a) * 0.55, 0), "white", bevel=0.03, rot=(0, 0.18, a)))
        hub = L.cyl("anim_turbine", 0.05, 2.0, (0, 0, 0), "aluminium", verts=8)
        join_into(hub, rotor)
        hub.location = (-6.2, 4.8, ROOF + 2.2)
        hub["hot"] = "renewable-energy"
        L.set_group("hot:renewable-energy")
        empty("pin_renewable-energy", (-14.3, 6.7, ROOF + 2.4))

    with group("hot:iot"):
        x, y = -17.2, 13.6
        box("iot_gateway", (0.9, 0.6, 1.0), (x + 1.2, y, ROOF), "white", bevel=0.05)
        box("iot_gateway_led", (0.6, 0.02, 0.05), (x + 1.2, y - 0.31, ROOF + 0.8), "led_green", bevel=0)
        cyl("iot_mast", 0.09, 5.2, (x, y, ROOF), "aluminium", verts=12, r2=0.06)
        for k in range(3):
            a = k * math.tau / 3
            box(f"iot_ant{k}", (0.12, 0.3, 1.0), (x + math.cos(a) * 0.28, y + math.sin(a) * 0.28, ROOF + 3.9), "white", bevel=0.03, rot=(0, 0, a))
        sphere("iot_dish", 0.42, (x, y + 0.35, ROOF + 2.6), "white", scale=(1, 0.4, 1), rot=(0.3, 0, 0))
        sphere("iot_beacon", 0.09, (x, y, ROOF + 5.25), "led_red")
        for k, (nx, ny) in enumerate(((-19.95, 9.0), (-8.0, 18.2), (2.2, 10.0))):
            box(f"iot_node{k}", (0.24, 0.24, 0.3), (nx, ny, ROOF + 0.9), "white", bevel=0.03)
            box(f"iot_node{k}_led", (0.26, 0.26, 0.03), (nx, ny, ROOF + 1.1), "led_green", bevel=0)
        empty("pin_iot", (x, y, ROOF + 6.0))

    L.set_group("static_building")
    # small roof garden
    box("roof_garden", (6.0, 3.2, 0.35), (-3.5, 5.0, ROOF), "white", bevel=0.05)
    box("roof_garden_soil", (5.7, 2.9, 0.02), (-3.5, 5.0, ROOF + 0.35), "grass", bevel=0)
    for k in range(7):
        sphere(f"rg_shrub{k}", 0.38, (-5.8 + k * 0.76, 5.0 + (k % 2 - 0.5) * 0.9, ROOF + 0.55), "leaflight" if k % 2 else "leaf", scale=(1, 1, 0.75))
    for px in (-6.4, -0.6):
        for py in (7.2, 10.6):
            box(f"perg_post{px}{py}", (0.16, 0.16, 2.6), (px, py, ROOF), "woodlight", bevel=0.02)
    for k in range(9):
        box(f"perg_beam{k}", (6.2, 0.1, 0.2), (-3.5, 7.0 + k * 0.45, ROOF + 2.6), "woodlight", bevel=0.02)
    box("roof_bench", (4.0, 0.6, 0.45), (-3.5, 9.0, ROOF), "wood", bevel=0.04)


def plaza_items():
    with group("hot:lighting"):
        x, y = -2.2, -6.5
        box("totem", (1.4, 0.4, 3.2), (x, y, 0.12), "darkgray", bevel=0.05)
        upright_screen("totem_scr_f", (1.2, 2.7), (x, y - 0.21, 1.72), "-y", "screen_totem")
        upright_screen("totem_scr_b", (1.2, 2.7), (x, y + 0.21, 1.72), "+y", "screen_totem")
        box("totem_base", (1.6, 0.6, 0.12), (x, y, 0.12), "midgray", bevel=0.03)
        # smart bollard lights along the entrance path
        for k in range(4):
            by = -2.5 - k * 2.6
            cyl(f"bollard{k}", 0.1, 0.9, (-4.6, by, 0.12), "darkgray", verts=16)
            cyl(f"bollard{k}_led", 0.105, 0.12, (-4.6, by, 0.82), "led_warm", verts=16)
            cyl(f"bollard_b{k}", 0.1, 0.9, (-10.4, by, 0.12), "darkgray", verts=16)
            cyl(f"bollard_b{k}_led", 0.105, 0.12, (-10.4, by, 0.82), "led_warm", verts=16)
        empty("pin_lighting", (x, y, 3.9))

    with group("hot:surveillance"):
        x, y = 3.2, 0.6
        cyl("cctv_pole", 0.08, 4.4, (x, y, 0.12), "darkgray", verts=14)
        box("cctv_arm", (0.7, 0.08, 0.08), (x - 0.3, y, 4.4), "darkgray", bevel=0.02)
        box("cctv_body", (0.32, 0.72, 0.28), (x - 0.62, y - 0.2, 4.2), "white", bevel=0.05, rot=(-0.35, 0, 0.7))
        cyl("cctv_lens", 0.09, 0.06, (x - 0.86, y - 0.52, 4.08), "black", verts=16, rot=(math.pi / 2 - 0.35, 0, 0.7))
        sphere("cctv_led", 0.025, (x - 0.52, y - 0.4, 4.42), "led_red")
        # dome cameras under the canopy and on the building corner
        for k, (dx, dy, dz) in enumerate(((-7.5, 0.0, 3.97), (2.15, 1.85, 4.2))):
            cyl(f"dome{k}_base", 0.2, 0.06, (dx, dy, dz - 0.06), "white", verts=20)
            sphere(f"dome{k}", 0.15, (dx, dy, dz - 0.07), "black", scale=(1, 1, 0.7))
        empty("pin_surveillance", (x - 0.4, y, 5.2))


BAY_W = 2.7
ROW_A_X = 8.0
ROW_B_X = 18.4


def parking():
    with group("hot:smart-parking"):
        box("lot", (16.3, 28, 0.02), (13.05, 1.0, 0), "asphalt", bevel=0)
        paints = ["white", "silver", "navy", "red", "black", "brand", "white", "silver", "midgray", "white", "navy"]
        occupied = {("A", 0), ("A", 2), ("A", 3), ("A", 5), ("A", 7), ("B", 1), ("B", 2), ("B", 4), ("B", 6), ("B", 7), ("B", 8)}
        p = 0
        for row, cx, face in (("A", ROW_A_X, 1), ("B", ROW_B_X, -1)):
            for k in range(10):
                yb = -10.35 + k * BAY_W
                box(f"bay{row}{k}", (5.4, 0.1, 0.004), (cx, yb, 0.02), "paint_white", bevel=0)
            for k in range(9):
                y = -9.0 + k * BAY_W
                full = (row, k) in occupied
                lx = cx + face * 2.45
                cyl(f"baysensor{row}{k}", 0.12, 0.04, (lx, y, 0.02), "led_red" if full else "led_green", verts=16)
                if full:
                    L.car(f"pcar{row}{k}", (cx - face * 0.1, y, 0.02), rot_z=0 if face > 0 else math.pi, paint=paints[p % len(paints)])
                    p += 1
        # EV chargers on row A
        for k in (6, 7, 8):
            y = -9.0 + k * BAY_W
            box(f"ev{k}", (0.3, 0.5, 1.5), (5.15, y + 0.9, 0.02), "white", bevel=0.06)
            box(f"ev{k}_led", (0.02, 0.3, 0.5), (5.31, y + 0.9, 0.7), "led_blue", bevel=0)
            box(f"ev{k}_scr", (0.02, 0.26, 0.18), (5.31, y + 0.9, 1.25), "led_cyan", bevel=0)
        box("ev_paint", (5.2, 3 * BAY_W, 0.004), (ROW_A_X, -9.0 + 7 * BAY_W, 0.021), "brand", bevel=0)
        # entry barrier, booth, ANPR camera, guidance sign
        box("booth", (1.4, 1.8, 2.5), (17.1, -12.1, 0.02), "white", bevel=0.06)
        box("booth_glass", (0.04, 1.4, 1.1), (16.38, -12.1, 1.2), "glass", bevel=0)
        box("barrier_post", (0.4, 0.4, 1.1), (15.9, -11.4, 0.02), "darkgray", bevel=0.03)
        L.set_group("anim")
        arm = L.box("anim_barrier", (4.9, 0.1, 0.1), (-2.45, 0, 0), "white", bevel=0.02)
        stripes = [L.box(f"barrier_stripe{k}", (0.45, 0.105, 0.105), (-0.7 - k * 1.3, 0, 0), "red", bevel=0) for k in range(4)]
        join_into(arm, stripes)
        arm.location = (15.9, -11.4, 1.05)
        arm["hot"] = "smart-parking"
        L.set_group("hot:smart-parking")
        cyl("anpr_pole", 0.06, 2.6, (16.0, -12.9, 0.02), "darkgray", verts=12)
        box("anpr_cam", (0.24, 0.5, 0.2), (15.8, -12.7, 2.5), "white", bevel=0.04, rot=(0, 0, -0.5))
        cyl("sign_pole", 0.08, 3.6, (9.4, -12.4, 0.02), "darkgray", verts=12)
        box("sign_box", (0.25, 1.5, 1.2), (9.4, -12.4, 3.0), "brand", bevel=0.04)
        upright_screen("sign_scr", (1.3, 0.55), (9.26, -12.4, 3.55), "-x", "screen_parking")
        upright_screen("sign_scr2", (1.3, 0.55), (9.54, -12.4, 3.55), "+x", "screen_parking")
        empty("pin_smart-parking", (13.6, 0.0, 2.6))


def join_into(target, others):
    for o in others:
        o.select_set(True)
    target.select_set(True)
    bpy.context.view_layer.objects.active = target
    with bpy.context.temp_override(active_object=target, selected_editable_objects=[target, *others]):
        bpy.ops.object.join()
    target.select_set(False)
    return target


def lighting():
    scene = bpy.context.scene
    world = bpy.data.worlds.new("Studio")
    scene.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes["Background"]
    bg.inputs["Color"].default_value = (0.86, 0.9, 0.95, 1)
    bg.inputs["Strength"].default_value = 1.15
    sun_data = bpy.data.lights.new("Sun", "SUN")
    sun_data.energy = 3.2
    sun_data.angle = math.radians(9)
    sun_data.color = (1.0, 0.96, 0.9)
    sun = bpy.data.objects.new("Sun", sun_data)
    L.COL.objects.link(sun)
    direction = Vector((0.45, 0.62, -0.75)).normalized()
    sun.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
    # soft fill inside each storey so the cut-away interiors read clearly
    for i in range(4):
        a = bpy.data.lights.new(f"Fill{i}", "AREA")
        a.shape = "RECTANGLE"
        a.size = 20
        a.size_y = 14
        a.energy = 1400
        a.color = (1.0, 0.95, 0.88)
        ob = bpy.data.objects.new(f"Fill{i}", a)
        L.COL.objects.link(ob)
        ob.location = ((BX0 + BX1) / 2, (BY0 + BY1) / 2, CEIL[i] - 0.1)


def preview(path, samples=48, res=(1600, 1000)):
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.samples = samples
    scene.cycles.use_denoising = True
    scene.render.resolution_x, scene.render.resolution_y = res
    try:
        scene.view_settings.view_transform = "AgX"
        scene.view_settings.look = "AgX - Medium High Contrast"
    except TypeError:
        pass
    cam_data = bpy.data.cameras.new("Cam")
    cam_data.lens = 58
    cam = bpy.data.objects.new("Cam", cam_data)
    L.COL.objects.link(cam)
    cam.location = (58, -62, 48)
    target = Vector((-2, 3, 5))
    cam.rotation_euler = (target - cam.location).to_track_quat("-Z", "Y").to_euler()
    scene.camera = cam
    scene.render.filepath = path
    bpy.ops.render.render(write_still=True)


ATLASES = {
    "building": ["static_building", "hot:access-control", "hot:motion-sensors", "hot:building-automation", "hot:renewable-energy", "hot:iot"],
    "site": ["static_site", "hot:lighting", "hot:surveillance", "hot:smart-parking"],
}


def build():
    L.reset_scene()
    site()
    shell()
    lobby()
    office()
    meeting_floor()
    control_room()
    roof()
    plaza_items()
    parking()
    lighting()
    for name, groups in ATLASES.items():
        bpy.context.scene[f"atlas_{name}"] = ",".join(groups)
    bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(BLEND))


if __name__ == "__main__":
    args = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    build()
    if "--preview" in args:
        preview(args[args.index("--preview") + 1])
