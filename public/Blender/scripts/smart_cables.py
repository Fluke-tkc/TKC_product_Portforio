"""Smart Organized Communication Cables - modelled after the Smart Cables AI artwork.

A green city boulevard whose median is opened up as a cut-away underground utility trench of three channels:
armored steel pipes, blue / green ducts and fibre sub-ducts on saddles and racks (underground cables); a blue-lit
smart tunnel with ladder trays, glowing fibre, diagnostics cabinets, a gland wall and a rail-mounted inspection
robot, next to colour-coded, tied and tagged cable bundles with service loops (organised cables). The front edge
of the plinth is a soil section with a duct bank, direct-buried cables under warning tape and other utilities.
Street works on the left kerb lane (excavator, shored pit with a duct bank being laid, cable drum), apartments
with green balconies and shops on both sides, traffic, pedestrians and crew.

blender -b --factory-startup --python public/Blender/scripts/smart_cables.py
Coordinates: Z up, metres. The viewer looks in from the front-right (+X, -Y).
"""
import math
import os
import random
import sys

import bmesh
import bpy
from mathutils import Vector

sys.path.append(os.path.dirname(__file__))
import tkc_arch as A  # noqa: E402
import tkc_cable as C  # noqa: E402
import tkc_lib as L  # noqa: E402
import tkc_logi as G  # noqa: E402
import tkc_med as M  # noqa: E402
from tkc_lib import box, cyl, empty, group  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
BLEND = os.path.join(HERE, "..", "smart_cables.blend")
A.FOLIAGE_MATS = ("leafv", "leafv_dark", "leafv_light")

BASE = (40.0, 34.0)
X, Y = BASE
BOT = -6.0  # plinth underside
SLAB, FLOOR = -3.6, -3.3  # trench base slab and channel floor
TRX = 5.6  # outer faces of the trench walls
Y0, Y1 = -Y, 13.6  # the trench runs from the front section to its end wall
CH_L, CH_M, CH_R = (-5.2, -2.0), (-1.7, 1.7), (2.0, 5.2)
PIT = (-13.6, -7.0, -10.8, -2.0)  # street-works pit in the left kerb lane
PIT_Z = -1.8
SURF = -0.25  # underside of the road / paving / soil surface layer
STRATA = ((-0.9, SURF, "gravel"), (-1.8, -0.9, "sand"), (-5.7, -1.8, "clay"), (BOT, -5.7, "rack_blue"))
LANE_N, LANE_S = (-8.45,), (8.45, 12.15)  # northbound (+y, keep left) / southbound lanes
CROSS = (18.5, 21.5)  # zebra crossing


def rect(x0, y0, x1, y1):
    return [(x0, y0), (x1, y0), (x1, y1), (x0, y1)]


def racetrack(x0, y0, x1, y1, r):
    return A.fillet_poly(rect(x0, y0, x1, y1), r, 6)


def plate(name, r, z0, z1, mat):
    """Box over rectangle r without its (hidden) bottom face, so it costs no lightmap space."""
    x0, y0, x1, y1 = r
    ob = box(name, (x1 - x0, y1 - y0, z1 - z0), ((x0 + x1) / 2, (y0 + y1) / 2, z0), mat, bevel=0)
    bm = bmesh.new()
    bm.from_mesh(ob.data)
    bmesh.ops.delete(bm, geom=[f for f in bm.faces if f.normal.z < -0.99], context="FACES")
    bm.to_mesh(ob.data)
    bm.free()
    return ob


def minus(r, h):
    """Rectangle r minus hole h, as up to four rectangles."""
    x0, y0, x1, y1 = r
    hx0, hy0, hx1, hy1 = h
    if hx0 >= x1 or hx1 <= x0 or hy0 >= y1 or hy1 <= y0:
        return [r]
    out = []
    if hy0 > y0:
        out.append((x0, y0, x1, hy0))
    if hy1 < y1:
        out.append((x0, hy1, x1, y1))
    if hx0 > x0:
        out.append((x0, max(y0, hy0), hx0, min(y1, hy1)))
    if hx1 < x1:
        out.append((hx1, max(y0, hy0), x1, min(y1, hy1)))
    return out


def flowers(name, pts, z, n, seed, mat="flower_white"):
    rnd = random.Random(seed)
    bm = bmesh.new()
    xs, ys = [p[0] for p in pts], [p[1] for p in pts]
    for _ in range(n):
        g = bmesh.ops.create_icosphere(bm, subdivisions=1, radius=rnd.uniform(0.03, 0.045))
        bmesh.ops.translate(bm, vec=Vector((rnd.uniform(min(xs), max(xs)), rnd.uniform(min(ys), max(ys)), z + rnd.uniform(0, 0.15))), verts=g["verts"])
    return L._finish(bm, name, mat)


# ---------------------------------------------------------------- ground: hollow plinth with a soil section

def ground():
    L.set_group("static_site")
    t = 0.05
    for i, (z0, z1, mat) in enumerate(STRATA):
        parts = []
        if z0 < SLAB:  # below the trench the section runs the full width
            parts.append((-X, X, z0, min(z1, SLAB)))
        if z1 > SLAB:
            parts += [(-X, -TRX, max(z0, SLAB), z1), (TRX, X, max(z0, SLAB), z1)]
        for k, (a, b, za, zb) in enumerate(parts):
            box(f"sec_front{i}{k}", (b - a, t, zb - za), ((a + b) / 2, -Y + t / 2, za), mat, bevel=0)
        box(f"sec_back{i}", (2 * X, t, z1 - z0), (0, Y - t / 2, z0), mat, bevel=0)
        box(f"sec_left{i}", (t, 2 * Y, z1 - z0), (-X + t / 2, 0, z0), mat, bevel=0)
        box(f"sec_right{i}", (t, 2 * Y, z1 - z0), (X - t / 2, 0, z0), mat, bevel=0)
    # surfaces
    for k, r in enumerate(minus((-14.0, -Y, -6.6, Y), PIT)):
        plate(f"road_n{k}", r, SURF, 0.02, "asphalt")
    plate("road_s", (6.6, -Y, 14.0, Y), SURF, 0.02, "asphalt")
    for s in (-1, 1):
        plate(f"walk{s}", (min(14 * s, 19 * s), -Y, max(14 * s, 19 * s), Y), SURF, 0.16, "concrete")
        plate(f"plot{s}", (min(19 * s, X * s), -Y, max(19 * s, X * s), Y), SURF, 0.16, "stone")
        plate(f"hedge_soil{s}", (min(5.6 * s, 6.6 * s), -Y, max(5.6 * s, 6.6 * s), Y), SURF, 0.12, "soil")
    plate("median_soil", (-TRX, Y1 + 0.4, TRX, Y), SURF, 0.1, "soil")
    plate("median_lawn", (-TRX, Y1 + 0.4, TRX, Y), 0.1, 0.16, "lawn")
    plate("crossing_path", (-6.6, CROSS[0], 6.6, CROSS[1]), 0.1, 0.18, "concrete")
    # road markings
    for s, xs in ((-1, (-10.3,)), (1, (10.3,))):
        for x in xs:
            for i in range(int(2 * Y / 6)):
                y = -Y + 1.5 + i * 6.0
                if CROSS[0] - 1 < y < CROSS[1] + 1:
                    continue
                box(f"dash{s}{i}", (0.15, 2.6, 0.005), (x, y + 1.3, 0.02), "paint_white", bevel=0)
    for s in (-1, 1):
        for i in range(7):
            x = s * (7.2 + i * 0.98)
            box(f"zebra{s}{i}", (0.5, CROSS[1] - CROSS[0], 0.005), (x, sum(CROSS) / 2, 0.021), "paint_white", bevel=0)
        for x in (s * 6.75, s * 13.85):
            box(f"edge{s}{x}", (0.12, 2 * Y, 0.005), (x, 0, 0.02), "paint_white", bevel=0)
    # the pit: strata on its walls (plates just outside the hole), floor
    x0, y0, x1, y1 = PIT
    for i, (z0, z1, mat) in enumerate(STRATA[:2]):
        box(f"pit_w{i}", (t, y1 - y0, z1 - z0), (x0 - t / 2, (y0 + y1) / 2, z0), mat, bevel=0)
        box(f"pit_e{i}", (t, y1 - y0, z1 - z0), (x1 + t / 2, (y0 + y1) / 2, z0), mat, bevel=0)
        box(f"pit_s{i}", (x1 - x0 + 2 * t, t, z1 - z0), ((x0 + x1) / 2, y0 - t / 2, z0), mat, bevel=0)
        box(f"pit_n{i}", (x1 - x0 + 2 * t, t, z1 - z0), ((x0 + x1) / 2, y1 + t / 2, z0), mat, bevel=0)
    plate("pit_floor", PIT, PIT_Z - 0.1, PIT_Z, "clay")


def soil_section():
    """What the front cut reveals besides the trench: duct bank, direct-buried cables, other utilities."""
    f = -Y - 0.02
    with group("hot:underground-cables"):
        box("db_block", (2.2, 0.06, 1.1), (-16.5, -Y + 0.03, -2.0), "concrete", bevel=0.01)
        for c in range(3):
            for r in range(2):
                x, z = -17.2 + c * 0.7, -1.7 + r * 0.5
                C.tubes(f"db_duct{c}{r}", [((x, f, z), (x, -Y + 0.02, z), 0.16)], "duct_orange", verts=20)
                C.tubes(f"db_cab{c}{r}", [((x, f - 0.005, z), (x, -Y, z), 0.09)], "cable_black", verts=14)
        # direct-buried cables in a sand bed: trefoil, protective cover tiles, warning tape
        for k, (dx, dz) in enumerate(((-0.08, 0.0), (0.08, 0.0), (0.0, 0.14))):
            for j, x in enumerate((16.0, 17.2)):
                C.tubes(f"dbc{j}{k}", [((x + dx, f, -1.35 + dz), (x + dx, -Y + 0.02, -1.35 + dz), 0.075)], ("cable_black", "cable_red", "duct_blue")[k] if j else "cable_black", verts=14)
        box("dbc_tiles", (2.2, 0.06, 0.06), (16.6, -Y + 0.02, -1.05), "cable_red", bevel=0)
        box("dbc_tape", (1.6, 0.06, 0.02), (16.6, -Y + 0.02, -0.55), "cable_yellow", bevel=0)
    L.set_group("static_site")
    C.tubes("storm_drain", [((-10.2, f, -2.9), (-10.2, -Y + 0.02, -2.9), 0.6)], "concrete", verts=28)
    C.tubes("storm_drain_in", [((-10.2, f - 0.005, -2.9), (-10.2, -Y, -2.9), 0.48)], "darkgray", verts=28)
    C.tubes("water_main", [((11.6, f, -1.55), (11.6, -Y + 0.02, -1.55), 0.28)], "tile_blue", verts=24)
    C.tubes("gas_main", [((9.4, f, -1.2), (9.4, -Y + 0.02, -1.2), 0.12)], "cable_yellow", verts=16)


# ---------------------------------------------------------------- the trench

def trench():
    L.set_group("static_site")
    plate("tr_slab", (-TRX, Y0, TRX, Y1 + 0.4), SLAB, FLOOR, "concrete")
    for s in (-1, 1):
        box(f"tr_outer{s}", (0.4, Y1 + 0.4 - Y0, 0.3 - FLOOR), (s * (TRX - 0.2), (Y0 + Y1 + 0.4) / 2, FLOOR), "concrete", bevel=0)
        box(f"tr_coping{s}", (0.52, Y1 + 0.46 - Y0, 0.06), (s * (TRX - 0.2), (Y0 + Y1 + 0.46) / 2, 0.3), "hosp_white", bevel=0.01)
        box(f"tr_inner{s}", (0.3, Y1 - Y0, 0.05 - FLOOR), (s * 1.85, (Y0 + Y1) / 2, FLOOR), "concrete", bevel=0)
        box(f"tr_inner_cap{s}", (0.34, Y1 - Y0, 0.04), (s * 1.85, (Y0 + Y1) / 2, 0.05), "hosp_white", bevel=0)
    box("tr_end", (2 * TRX - 0.8, 0.4, 0.3 - FLOOR), (0, Y1 + 0.2, FLOOR), "concrete", bevel=0)
    box("tr_end_coping", (2 * TRX, 0.52, 0.06), (0, Y1 + 0.2, 0.3), "hosp_white", bevel=0.01)
    # guard rails along the open edges, access ladder at the end wall
    posts, rails = [], []
    for s in (-1, 1):
        y = Y0 + 0.4
        while y < Y1:
            posts.append(((s * (TRX - 0.2), y, 0.36), (s * (TRX - 0.2), y, 1.4), 0.03))
            y += 2.4
        for z in (0.9, 1.4):
            rails += [((s * (TRX - 0.2), a.y, z), (s * (TRX - 0.2), b.y, z), 0.028) for a, b in C.split([(0, Y0 + 0.2, 0), (0, Y1 + 0.2, 0)])]
    for z in (0.9, 1.4):
        rails.append(((-TRX + 0.2, Y1 + 0.2, z), (TRX - 0.2, Y1 + 0.2, z), 0.028))
    C.tubes("tr_posts", posts, "safety_yellow", verts=10)
    C.tubes("tr_rails", rails, "steel", verts=10)
    for s in (-0.25, 0.25):
        C.tubes(f"ladder_rail{s}", [((s, Y1 - 0.18, FLOOR), (s, Y1 - 0.18, 1.2), 0.025)], "safety_yellow", verts=8)
    C.tubes("ladder_rungs", [((-0.25, Y1 - 0.18, z), (0.25, Y1 - 0.18, z), 0.018) for z in [FLOOR + 0.3 * (k + 1) for k in range(11)]], "steel", verts=6)


def channel_left():
    """Underground cables: armored steel pipes with collars (cut open at the front), blue / green ducts,
    orange fibre sub-ducts and colour bundles on saddles and a two-level steel rack."""
    x0, x1 = CH_L
    xc = (x0 + x1) / 2
    with group("hot:underground-cables"):
        sad, frames = [], []
        y = Y0 + 1.5
        while y < Y1:
            sad.append(("concrete", (xc, y, FLOOR), (x1 - x0 - 0.1, 0.3, 0.3)))
            for xx in (x0 + 0.06, x1 - 0.06):
                frames.append(("frame_dark", (xx, y, FLOOR + 0.3), (0.08, 0.1, 1.95)))
            for z in (-2.25, -1.55):
                frames.append(("frame_dark", (xc, y, z - 0.08), (x1 - x0 - 0.1, 0.1, 0.08)))
            y += 3.0
        G._boxes_mesh("lc_saddle", sad)
        G._boxes_mesh("lc_frame", frames)
        cut = ("cable_red", "cable_yellow", "duct_blue")
        for k, (x, r, mat) in enumerate(((-4.62, 0.26, "steel"), (-4.02, 0.2, "duct_blue"), (-3.44, 0.26, "steel"), (-2.86, 0.2, "duct_green"), (-2.38, 0.14, "duct_orange"))):
            C.pipe_y(f"lc_low{k}", x, FLOOR + 0.3 + r, Y0, Y1, r, mat, collar="black" if mat == "steel" else mat, cut=cut if mat == "steel" else None)
        for k, (x, r, mat) in enumerate(((-4.5, 0.22, "steel"), (-3.85, 0.17, "duct_blue"), (-3.25, 0.22, "steel"), (-2.6, 0.18, "duct_green"))):
            C.pipe_y(f"lc_mid{k}", x, -2.25 + r, Y0, Y1, r, mat, collar="black" if mat == "steel" else mat, cut=cut if mat == "steel" else None)
        for k, (x, cols) in enumerate(((-4.55, ("duct_orange", "cable_red", "cable_yellow")), (-3.75, ("duct_blue", "duct_green", "cloth_white")), (-2.95, ("cable_red", "duct_blue", "cable_yellow", "duct_green")))):
            C.bundle(f"lc_top{k}", [(x, Y0, -1.44), (x, Y1, -1.44)], 7, 0.035, cols, tie_every=1.5, labels=False, seed=k)
        empty("pin_underground-cables", (-3.6, -24.0, 2.6))


def channel_mid():
    """Organised smart tunnel: ladder trays (glowing fibre on top), diagnostics cabinets, gland wall,
    splice closures, IoT sensors, LED lines and the monorail of the inspection robot."""
    x0, x1 = CH_M
    with group("hot:organize-cables"):
        for k, (a, b) in enumerate(C.split([(0, Y0 + 0.1, 0), (0, Y1 - 0.1, 0)])):
            box(f"mc_grate{k}", (1.1, b.y - a.y - 0.03, 0.05), (0, (a.y + b.y) / 2, FLOOR), "frame_dark", bevel=0)
        tiers = (
            (-2.65, [("cable_black", 0.045)] * 5),
            (-2.05, [("copper", 0.03)] * 4 + [("duct_orange", 0.03)] * 4),
            (-1.45, [("cloth_white", 0.025), ("panel_grey", 0.025)] * 5),
            (-0.85, [("sky_blue", 0.02)] * 6),
        )
        for k, (z, cables) in enumerate(tiers):
            C.ladder_tray(f"mc_tray{k}", x0, 1, Y0, Y1, z, 0.5, cables, seed=k)
        C.ladder_tray("mc_tray_r", x1, -1, Y0, Y1, -0.85, 0.5, [("cable_black", 0.035)] * 3 + [("duct_blue", 0.025)] * 4, seed=9)
        glow = [((x, a.y, -0.83), (x, b.y, -0.83), 0.022) for x in (-1.36, -1.3) for a, b in C.split([(0, Y0, 0), (0, Y1, 0)])]
        C.tubes("mc_fibre_glow", glow, "led_blue", verts=6)
        for y in (-26.0, -9.0, 7.0):
            C.smart_cabinet(f"mc_cab{int(y)}", (x1 - 0.25, y, FLOOR), math.pi)
        C.smart_cabinet("mc_cab_a", (x1 - 0.18, -31.6, FLOOR), math.pi, w=0.9, d=0.35, h=1.0)
        C.gland_panel("mc_glands", (x1, -18.0, FLOOR + 0.4), math.pi, cols=8, rows=4)
        box("mc_trunking", (0.16, 2.3, 0.38), (x1 - 0.1, -18.0, FLOOR), "panel_grey", bevel=0.01)
        for k, y in enumerate((-22.0, -4.0, 10.0)):  # splice closures under the right tray
            C.tubes(f"mc_splice{k}", [((1.42, y - 0.35, -1.05), (1.42, y + 0.35, -1.05), 0.09)], "cable_black", verts=16)
        for k, y in enumerate(range(int(Y0) + 5, int(Y1), 6)):  # IoT sensor nodes clipped to tier 2
            box(f"mc_iot{k}", (0.1, 0.16, 0.09), (x0 + 0.56, y, -2.07), "robot_white", bevel=0.01)
            box(f"mc_iot{k}_led", (0.02, 0.04, 0.02), (x0 + 0.615, y, -2.02), "led_green", bevel=0)
        # struts and monorail for the robot
        struts, rail = [], []
        y = Y0 + 2.0
        while y < Y1 - 0.5:
            struts.append(("frame_dark", (0, y, -0.3), (x1 - x0, 0.14, 0.2)))
            y += 4.0
        for a, b in C.split([(0, Y0 + 1.0, 0), (0, Y1 - 0.4, 0)]):
            rail.append(("steel", (0, (a.y + b.y) / 2, -0.4), (0.09, b.y - a.y, 0.1)))
        G._boxes_mesh("mc_struts", struts + rail)
        for s in (-1, 1):
            box(f"mc_ledwall{s}", (0.03, Y1 - Y0, 0.04), (s * (x1 - 0.02), (Y0 + Y1) / 2, -0.62), "led_cyan", bevel=0)
            box(f"mc_ledfloor{s}", (0.04, Y1 - Y0 - 0.4, 0.02), (s * 0.58, (Y0 + Y1) / 2, FLOOR), "led_cyan", bevel=0)
        C.cable_coil("mc_coil", (-1.05, -32.6, FLOOR))
        box("mc_crate", (0.5, 0.5, 0.42), (0.35, -31.6, FLOOR + 0.05), "wood", bevel=0.02)
        C.crew("crew_tunnel", (0.35, -31.6, FLOOR + 0.05), rot_z=0.0, seed=501, pose="sit")
        empty("pin_organize-cables", (3.6, -10.0, 2.6))


def channel_right():
    """Organised cables: racks on both walls carrying colour-coded bundles with ties, ID tags and service loops."""
    x0, x1 = CH_R
    tiers = (-2.7, -2.1, -1.5, -0.9)
    families = (
        ("cable_red", "duct_orange", "cable_red"),
        ("copper", "duct_orange", "cable_yellow"),
        ("duct_blue", "sky_blue", "cloth_white"),
        ("duct_green", "lime", "cable_yellow"),
    )
    with group("hot:organize-cables"):
        C.cable_rack("rc_rack_l", x0, 1, Y0, Y1, FLOOR, -0.5, tiers)
        C.cable_rack("rc_rack_r", x1, -1, Y0, Y1, FLOOR, -0.5, tiers)
        for side, xw in ((1, x0), (-1, x1)):
            for k, z in enumerate(tiers):
                xb, zb = xw + side * 0.3, z + 0.15
                fam = families[(k + (side < 0)) % 4]
                yl = -26.0 + ((k * 13 + (side < 0) * 7) % 34)  # service loop, staggered
                loop = C.bezier((xb, yl - 1.6, zb), (xb + side * 0.9, yl - 0.9, zb + 0.35), (xb + side * 0.9, yl + 0.9, zb + 0.35), (xb, yl + 1.6, zb), 14)
                path = [(xb, Y0, zb)] + [tuple(p) for p in loop] + [(xb, Y1, zb)]
                C.bundle(f"rc_b{side}{k}", path, 12, 0.03, fam, tie_every=1.2, seed=k * 3 + side)
        sad = []
        y = Y0 + 1.5
        while y < Y1:
            sad.append(("concrete", (3.6, y, FLOOR), (0.6, 0.25, 0.15)))
            y += 3.0
        G._boxes_mesh("rc_saddle", sad)
        C.pipe_y("rc_floorduct", 3.6, FLOOR + 0.35, Y0, Y1, 0.2, "duct_green", collar="duct_green")


def median_end():
    """Past the trench end: lawn median with cable chambers, a smart street cabinet and trees."""
    L.set_group("static_site")
    for k, y in enumerate((16.2, 25.5, 31.0)):
        cyl(f"chamber{k}", 0.55, 0.03, (0, y, 0.16), "darkgray", verts=24)
        cyl(f"chamber{k}_rim", 0.62, 0.02, (0, y, 0.16), "steel", verts=24)
    for k, (x, y) in enumerate(((3.4, 27.5), (-3.2, 31.2), (3.2, 15.8))):
        A.tree(f"mtree{k}", (x, y, 0.16), h=6.0, spread=0.85, seed=600 + k)
    with group("hot:organize-cables"):
        box("sc_pad", (1.6, 1.0, 0.12), (-3.0, 24.0, 0.16), "concrete", bevel=0.02)
        C.smart_cabinet("sc_cab", (-3.0, 24.0, 0.28), -math.pi / 2, screen="screen_iot", w=1.3, d=0.6, h=1.6)
        cyl("sc_mast", 0.05, 2.6, (-2.3, 24.35, 0.28), "steel", verts=10)
        box("sc_antenna", (0.12, 0.12, 0.5), (-2.3, 24.35, 2.8), "robot_white", bevel=0.02)
        box("sc_antenna_led", (0.13, 0.13, 0.04), (-2.3, 24.35, 3.1), "led_cyan", bevel=0)


def hedges():
    L.set_group("static_site")
    for s in (-1, 1):
        x0, x1 = min(5.75 * s, 6.5 * s), max(5.75 * s, 6.5 * s)
        for k, (y0, y1) in enumerate(((-Y + 0.3, CROSS[0] - 0.3), (CROSS[1] + 0.3, Y - 0.3))):
            pts = rect(x0, y0, x1, y1)
            A.bushes_along(f"hedge{s}{k}", pts, spacing=0.75, z=0.12, r=0.42, seed=700 + k + (s > 0) * 5)
            flowers(f"hedge_fl{s}{k}", pts, 0.55, int((y1 - y0) * 9), 710 + k + (s > 0) * 5)


# ---------------------------------------------------------------- street works (left kerb lane)

def street_works():
    L.set_group("static_site")
    x0, y0, x1, y1 = PIT
    # barriers along the lane line, a cone taper where traffic arrives
    k = 0
    y = -19.0
    while y < 11.0:
        C.water_barrier(f"wbar{k}", (-10.35, y, 0.02), math.pi / 2, ("orange", "white")[k % 2])
        y += 2.0
        k += 1
    for k in range(7):
        t = k / 6
        C.cone(f"cone{k}", (-10.4 - t * 3.2, -20.4 - t * 6.0, 0.02))
    C.crew("crew_flag", (-13.2, -27.2, 0.02), rot_z=-math.pi / 2, seed=510)
    cyl("flag_pole", 0.02, 1.8, (-13.2, -27.62, 0.02), "darkgray", verts=6)
    cyl("flag_sign", 0.3, 0.02, (-13.2, -27.6, 1.95), "cable_red", verts=16, rot=(math.pi / 2, 0, 0))
    C.excavator("excavator", (-12.2, -13.0, 0.02), math.pi / 2, reach=6.2)
    A.foliage("spoil", [((-13.0 + dx, -17.3 + dy, 0.0), r, 800 + i) for i, (dx, dy, r) in enumerate(((0, 0, 0.9), (0.6, 0.7, 0.7), (-0.4, 0.8, 0.6)))], mats=("soil", "clay"), subdiv=2)
    van = "tkcvan"
    L.van(van, (-12.2, 7.4, 0.02), rot_z=math.pi / 2, paint="robot_white")
    for s in (-1, 1):
        L.text_mesh(f"{van}_txt{s}", "TKC NETWORK", (-12.2 - s * 0.97, 7.0, 1.1), 0.34, 0.03, "rack_blue", rot=(math.pi / 2, 0, math.pi / 2 + (0 if s < 0 else math.pi)))
    with group("hot:underground-cables"):
        # shoring plates and struts, a duct bank being laid along the lane, the drum feeding a new duct
        for s, xx in ((1, x0 + 0.05), (-1, x1 - 0.05)):
            box(f"shore{s}", (0.06, y1 - y0 - 0.2, 0.1 - PIT_Z), (xx, (y0 + y1) / 2, PIT_Z), "rack_blue", bevel=0)
        C.tubes("shore_struts", [((x0 + 0.1, y, z), (x1 - 0.1, y, z), 0.05) for y in (-5.8, -3.2) for z in (-0.6, -1.3)], "safety_yellow", verts=10)
        for c in range(3):
            for r in range(2):
                x, z = -12.6 + c * 0.4, PIT_Z + 0.2 + r * 0.38
                C.tubes(f"pit_duct{c}{r}", [((x, y0, z), (x, y1, z), 0.14)], "duct_orange", verts=16)
        for yy in (-5.0, -3.6):
            box(f"pit_spacer{yy}", (1.3, 0.08, 0.85), (-12.2, yy, PIT_Z + 0.02), "cable_black", bevel=0)
        C.cable_drum("drum", (-12.2, 0.6, 0.02), math.pi / 2)
        feed = C.bezier((-12.2, 0.0, 1.17), (-12.2, -1.6, 0.9), (-12.2, -2.4, 0.2), (-12.2, -3.0, PIT_Z + 0.96), 12)
        C.tubes("drum_feed", [(a, b, 0.06) for a, b in zip(feed, feed[1:])], "duct_orange", verts=10)
    C.crew("crew_pit", (-11.5, -2.9, PIT_Z), rot_z=math.pi * 1.1, seed=511)
    C.crew("crew_drum", (-11.0, 1.8, 0.02), rot_z=-math.pi / 2, seed=512)


# ---------------------------------------------------------------- city blocks and street furniture

def city():
    L.set_group("static_building")
    for name, r, floors, street, body, seed in (
        ("blkL1", (-37, -29.5, -22, -13), 6, 1, "facade_beige", 1),
        ("blkL2", (-38, -8.5, -22, 9), 7, 1, "facade_warm", 2),
        ("blkL3", (-37, 14, -22, 31), 6, 1, "facade_beige", 3),
        ("blkR1", (22, -29.5, 37, -15), 3, -1, "facade_warm", 4),
        ("blkR2", (22, -10, 38, 8), 5, -1, "facade_beige", 5),
        ("blkR3", (22, 13, 37, 31), 6, -1, "facade_warm", 6),
    ):
        C.apartment(name, *r, floors, street, seed=seed, body=body)
    L.set_group("static_site")
    rnd = random.Random(900)
    for s in (-1, 1):
        for k, y in enumerate(range(-30, 31, 8)):
            A.tree(f"stree{s}{k}", (s * 15.0, y, 0.16), h=6.2 + rnd.random(), spread=0.9, seed=910 + k + (s > 0) * 20)
        for k, y in enumerate(range(-26, 31, 8)):
            if s > 0 and y == 6:
                continue  # bus stop
            L.street_light(f"lamp{s}{k}", (s * 14.5, y, 0.16), rot_z=0.0 if s < 0 else math.pi, h=6.5)
    for k, (x, y) in enumerate(((-20.5, -11.0), (-20.5, 11.5), (20.5, -12.5), (20.5, 10.5), (-39.0, -11.0), (39.0, 10.5), (-30.0, -31.5), (30.0, -31.5))):
        A.tree(f"ptree{k}", (x, y, 0.16), h=6.8 + rnd.random(), spread=1.0, seed=950 + k)
    for k, (x, y, rz) in enumerate(((-26.0, -31.8, 0.0), (-33.0, -31.8, 0.0), (27.0, -31.8, 0.0), (34.0, -31.8, 0.0), (-20.5, -8.0, math.pi / 2), (20.5, 7.0, math.pi / 2))):
        L.bench(f"bench{k}", (x, y, 0.16), rot_z=rz)
    for k, y in enumerate((-25.0, -21.5, -18.0)):
        L.cafe_set(f"cafe{k}", (20.3, y, 0.16), seed=960 + k, chairs=3, umbrella=True)
    C.bus_shelter("busstop", (15.6, 6.0, 0.16), math.pi)
    L.human("bus_wait0", (15.9, 5.2, 0.16), rot_z=math.pi, seed=970)
    L.human("bus_wait1", (15.3, 7.1, 0.16), rot_z=math.pi * 1.2, seed=971)
    # hand-hole on the right footway opened for a diagnostics check
    box("handhole", (0.9, 0.9, 0.02), (16.0, -19.5, 0.16), "cable_black", bevel=0)
    box("handhole_lid", (0.9, 0.06, 0.9), (16.0, -18.98, 0.16), "darkgray", bevel=0.01, rot=(-0.3, 0, 0))
    C.crew("crew_check", (16.6, -19.3, 0.16), rot_z=math.pi, seed=520, pose="sit")
    box("check_case", (0.5, 0.35, 0.2), (15.6, -20.4, 0.16), "safety_yellow", bevel=0.03)


# ---------------------------------------------------------------- life

def life():
    v = 7.0
    lanes = [((x, -Y - 8), (x, Y + 8)) for x in LANE_N] + [((x, Y + 8), (x, -Y - 8)) for x in LANE_S]
    fleet = (
        (("silver", "car"), ("robot_white", "van")),
        (("navy", "car"), ("sky_blue", "car")),
        (("robot_white", "van"), ("coral", "car")),
    )
    for i, (a, b) in enumerate(lanes):
        length = math.hypot(b[0] - a[0], b[1] - a[1])
        for j, (paint, kind) in enumerate(fleet[i]):
            L.driver(f"drv{i}{j}", [a, b], v, (j * length / 2 + i * 13.0) % length, closed=False, paint=paint, kind=kind)
    n = 0
    for path, count, speed in ((racetrack(-18.3, -32.6, -17.5, 32.6, 0.39), 3, 1.2), (racetrack(17.5, -32.6, 18.3, 32.6, 0.39), 3, 1.25)):
        length = L.path_length(path, True)
        for j in range(count):
            L.walker(f"ped{n}", path, speed, (j + 0.3) * length / count, seed=1000 + n, z=0.16)
            n += 1
    tunnel = racetrack(-0.42, -28.4, 0.18, 11.0, 0.29)
    L.walker("tunnelcrew", tunnel, 0.9, 3.0, seed=1010, z=FLOOR + 0.05, outfit="crew", carry=C.crew_carry)
    # inspection robot shuttles along the monorail (symmetric, so the flip at each end is invisible)
    with group("move"):
        C.rail_robot("railbot")
    bot = L.rigid(L._parts("railbot"), "railbot")
    bot["blob"] = [0.01, 0.01]
    L._on_path(bot, "drive", 0.8, [(0.0, Y0 + 2.0), (0.0, Y1 - 1.2)], True, 6.0, -0.4)
    # light pulses racing through the glowing fibres
    k = 0
    for x in (-1.36, -1.3):
        path = [(x, -Y - 4), (x, Y1 + 0.8)]
        length = L.path_length(path, False)
        for j in range(5):
            with group("move"):
                p = box(f"pulse{k}_b", (0.5, 0.06, 0.06), (0, 0, -0.03), "led_cyan", bevel=0)
            body = L.rigid([p], f"pulse{k}")
            body["blob"] = [0.01, 0.01]
            L._on_path(body, "drive", 5.0, path, False, j * length / 5 + (x > -1.33) * 3.1, -0.83)
            k += 1


def icons():
    with group("move"):
        for i, (x, y, z, kind) in enumerate(((-3.6, -24.0, 4.2, "cable"), (3.6, -10.0, 4.2, "plug"))):
            L.plane(f"icon_{kind}{i}", (1.3, 1.3), (x, y, z), f"screen_icon_{kind}", rot=(math.pi / 2, 0, -math.pi / 4 + math.pi / 2))
            bpy.data.objects[f"icon_{kind}{i}"]["bob"] = i * 0.9


def lighting(sun_elev=40, sun_dir=(0.62, -0.78)):
    scene = bpy.context.scene
    world = bpy.data.worlds.new("Sky")
    scene.world = world
    nt = world.node_tree
    bg = nt.nodes["Background"]
    sky = nt.nodes.new("ShaderNodeTexSky")
    sky.sky_type = "MULTIPLE_SCATTERING"
    sky.sun_elevation = math.radians(sun_elev)
    sky.sun_rotation = math.radians(210)
    try:
        sky.sun_disc = False
    except AttributeError:
        pass
    nt.links.new(sky.outputs["Color"], bg.inputs["Color"])
    bg.inputs["Strength"].default_value = 0.3
    sun_data = bpy.data.lights.new("Sun", "SUN")
    sun_data.energy = 5.0
    sun_data.angle = math.radians(1.5)
    sun_data.color = (1.0, 0.93, 0.82)
    sun = bpy.data.objects.new("Sun", sun_data)
    L.COL.objects.link(sun)
    el = math.radians(sun_elev)
    h = Vector((sun_dir[0], sun_dir[1], 0)).normalized()
    to_sun = Vector((h.x * math.cos(el), h.y * math.cos(el), math.sin(el)))
    sun.rotation_euler = (-to_sun).to_track_quat("-Z", "Y").to_euler()
    # the channels are deep and narrow: soft fill from above, cool in the smart tunnel
    for i, ((x0, x1), z, colour, k) in enumerate(((CH_L, -0.3, (1.0, 0.96, 0.9), 1.6), (CH_M, -0.5, (0.72, 0.86, 1.0), 2.4), (CH_R, -0.3, (1.0, 0.96, 0.9), 1.6))):
        a = bpy.data.lights.new(f"Channel{i}", "AREA")
        a.shape = "RECTANGLE"
        a.size, a.size_y = (x1 - x0) * 0.8, (Y1 - Y0) * 0.95
        a.energy = k * (x1 - x0) * (Y1 - Y0)
        a.color = colour
        ob = bpy.data.objects.new(f"Channel{i}", a)
        L.COL.objects.link(ob)
        ob.location = ((x0 + x1) / 2, (Y0 + Y1) / 2, z)


ATLASES = {
    "site": ["static_site", "hot:underground-cables", "hot:organize-cables"],
    "building": ["static_building"],
}


def build():
    L.reset_scene()
    ground()
    soil_section()
    trench()
    channel_left()
    channel_mid()
    channel_right()
    median_end()
    hedges()
    street_works()
    city()
    life()
    icons()
    lighting()
    for name, groups in ATLASES.items():
        bpy.context.scene[f"atlas_{name}"] = ",".join(groups)
    bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(BLEND))
    print("objects:", len(bpy.context.scene.objects), "tris:", sum(len(o.data.polygons) for o in bpy.context.scene.objects if o.type == "MESH"))


if __name__ == "__main__":
    build()
