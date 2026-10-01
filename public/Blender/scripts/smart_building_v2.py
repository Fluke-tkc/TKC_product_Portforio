"""Smart Building v2 - modelled after the Smart Building AI artwork.

Stacked rounded glass "pods" with brushed frames, blue LED floor lines, timber-slat soffits,
green terraces with hanging plants, a café podium with an arcade, set on a street corner.

blender -b --factory-startup --python public/Blender/scripts/smart_building_v2.py -- [--preview out.png] [--view street|iso]
Coordinates: Z up, metres. The viewer looks from the street corner at the front-right (+X, -Y).
"""
import math
import os
import random
import re
import sys

import bmesh
import bpy
from mathutils import Vector

sys.path.append(os.path.dirname(__file__))
import tkc_arch as A  # noqa: E402
import tkc_lib as L  # noqa: E402
from tkc_lib import box, cyl, empty, group, sphere, upright_screen  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
BLEND = os.path.join(HERE, "..", "smart_building.blend")

# ---------------------------------------------------------------- massing

PODIUM_RAW = [(-30, -16), (-8, -12), (14, -17), (22, -8), (21, 18), (-30, 18)]
L1_Z0, L1_H = 6.4, 4.9  # first-floor band sitting over the café arcade
T1 = L1_Z0 + L1_H  # first terrace level

FRAME = 0.8  # thickness of the top / bottom frames of every pod
BAND = 0.35  # intermediate floor band

# name, centre x, y, width, depth, corner radius, rotation, bottom z, storeys, storey height, use
# A and B stand on the first-floor terrace, inside its planters: A within the left edge, B's front following the
# terrace's curve (the entrance notch) instead of a box poking through the glass rail
PODS = [
    ("A", -25.2, -6.0, 8, 11, 2.6, 0.0, T1, 1, 4.6, "office"),  # A, E and D are placed clear of B, C and F:
    ("B", -10.0, -6.85, 20, 12.7, 3.5, 0.0, T1, 2, 4.2, "retail"),
    ("C", 12.0, -5.0, 20, 15, 4.0, 0.06, 16.2, 2, 4.2, "office"),
    ("E", -22.0, 6.0, 16, 11, 3.0, -0.08, 18.6, 1, 4.6, "lounge"),  # pods may stack but never cut into each other
]


def pod_height(storeys, sh):
    return FRAME * 2 + storeys * sh + (storeys - 1) * BAND


def _pod_top(p):
    return p[7] + pod_height(p[8], p[9])


PODS.append(("D", -6.5, 1.5, 14, 13, 3.5, 0.1, _pod_top(PODS[1]), 2, 4.2, "office"))
PODS.append(("F", 12.5, 6.0, 19, 13, 5.0, -0.04, _pod_top(PODS[2]), 1, 5.0, "lounge"))
POD = {p[0]: p for p in PODS}
CORE = (-6.0, 13.0, 9.0, 9.0)  # x, y, w, d (behind the pods)


# B's front runs 0.8 m inside the podium line (2 m inside the terrace edge, behind its planters), notch and all
_B_FRONT = A.offset_poly(PODIUM_RAW, 0.8)
POD_SHAPE = {"B": [(-20.0, A.facade_y(_B_FRONT, -20.0)), _B_FRONT[1], (0.0, A.facade_y(_B_FRONT, 0.0)), (0.0, -0.5), (-20.0, -0.5)]}


def pod_raw(p):
    _, cx, cy, w, d, r, rot, *_ = p
    return POD_SHAPE.get(p[0]) or A.rect_poly(cx, cy, w, d, rot)


def pod_outline(p, inset=0.0, segs=8):
    return A.outline(pod_raw(p), p[5], inset, segs)


COL_R = 0.3


def pod_columns(p):
    """Structural grid of a pod, aligned with its axes (~7 m bays, 2.2 m in from the glass)."""
    _, cx, cy, w, d, r, rot, *_ = p
    c, s = math.cos(rot), math.sin(rot)

    def axis(span):
        n = max(2, round((span - 4.4) / 7.0) + 1)
        return [-(span / 2 - 2.2) + i * (span - 4.4) / (n - 1) for i in range(n)]

    inside = pod_outline(p, 1.6)  # a shaped pod (B) drops grid points that fall outside it
    return [q for q in ((cx + c * u - s * v, cy + s * u + c * v) for u in axis(w) for v in axis(d)) if A.point_in_poly(q, inside)]


# entrance: automatic doors in the shopfront, gates 2 m behind them, reception beyond
DOOR_X = -8.0
LOBBY = A.rect_poly(-8.0, -6.0, 12.0, 11.0)
PODIUM_COLS = [q for q in A.grid_in_poly(A.outline(PODIUM_RAW, 4.0, 3.2), 8.0, 0.0, 5) if not A.point_in_poly(q, LOBBY)]


# surface car park east of the building: entry aisle / driveway, exit aisle / driveway, two bay rows
LOT_IN = (26.5, 30.5)
LOT_OUT = (40.1, 44.0)
LANE_IN, LANE_OUT = 28.5, 41.85
DIVIDER_X = 35.3
BAY_Y0, BAY_W, BAYS = -16.0, 2.6, 17
EV_BAYS = (13, 14, 15, 16)  # west row, north end


def keep_clear(cols, size=2.6):
    return [A.rect_poly(x, y, size, size) for x, y in cols]


# ---------------------------------------------------------------- building parts


def glass_volume(name, outer_raw, r, z0, storeys, sh, use, seed, cols=()):
    """Frames, curved glass, mullions, LED lines, soffit and interiors for one pod."""
    out = A.outline(outer_raw, r)
    glass = A.outline(outer_raw, r, 0.28)
    # bottom slab (rounded frame) + timber soffit + downlights
    A.solid(f"{name}_bottom", out, z0, FRAME, "frame", bevel=0.28, segments=4)
    soffit = A.outline(outer_raw, r, 0.55)
    A.slats(f"{name}_slats", soffit, z0 - 0.005, spacing=0.34, width=0.14, depth=0.12, angle=0.0, mat="wood")
    A.solid(f"{name}_soffit", soffit, z0 - 0.02, 0.02, "copper")
    A.downlights(f"{name}_dl", A.outline(outer_raw, r, 1.4), z0 - 0.12, spacing=2.6)
    z = z0 + FRAME
    for s in range(storeys):
        A.wall(f"{name}_glass{s}", glass, z, sh, "glass")
        A.mullions(f"{name}_mull{s}", glass, z, sh, spacing=2.6, size=(0.05, 0.14), mat="frame_dark")
        # blue LED line just under the next band (the glow seen in the artwork)
        A.ring(f"{name}_led{s}", A.outline(outer_raw, r, 0.3), A.outline(outer_raw, r, 0.46), z + sh - 0.34, 0.16, "led_cyan")
        interior(f"{name}_in{s}", outer_raw, r, z, sh, use, seed * 10 + s, avoid=keep_clear(cols))
        z += sh
        if s < storeys - 1:
            A.ring(f"{name}_band{s}", out, A.outline(outer_raw, r, 0.7), z, BAND, "frame", round_outer=0.15)
            z += BAND
    A.solid(f"{name}_top", out, z, FRAME, "frame", bevel=0.28, segments=4)
    return z + FRAME


def interior(name, raw, r, z, h, use, seed, avoid=None):
    rnd = random.Random(seed)
    floor_pts = A.outline(raw, r, 0.5)
    A.solid(f"{name}_floor", floor_pts, z, 0.03, {"retail": "terrazzo", "office": "carpet", "lounge": "woodlight", "cafe": "terrazzo"}.get(use, "terrazzo"))
    inner = A.outline(raw, r, 2.2)
    spots = [q for q in A.grid_in_poly(inner, 3.4, 0.8, seed) if not any(A.point_in_poly(q, a) for a in (avoid or ()))]
    for i, (x, y) in enumerate(spots):
        roll = rnd.random()
        rot = rnd.random() * math.tau
        if use == "retail":
            if roll < 0.45:
                L.shelf(f"{name}_sh{i}", (x, y, z), w=1.8, rot_z=rnd.choice((0, math.pi / 2)), seed=seed + i)
            elif roll < 0.75:
                L.human(f"{name}_h{i}", (x, y, z), rot_z=rot, seed=seed + i, pose=rnd.choice(("stand", "walk")))
            else:
                L.potted_plant(f"{name}_pl{i}", (x, y, z), h=1.8, seed=seed + i)
        elif use == "office":
            if roll < 0.55:
                L.desk(f"{name}_d{i}", (x, y, z), rot_z=rnd.choice((0, math.pi)), monitors=rnd.choice((1, 2)))
                L.office_chair(f"{name}_c{i}", (x, y - 0.7, z), rot_z=math.pi / 2)
                if rnd.random() < 0.6:
                    L.human(f"{name}_h{i}", (x, y - 0.75, z), rot_z=math.pi / 2, seed=seed + i, pose="sit")
            elif roll < 0.8:
                L.human(f"{name}_h{i}", (x, y, z), rot_z=rot, seed=seed + i, pose=rnd.choice(("stand", "walk")))
            else:
                L.potted_plant(f"{name}_pl{i}", (x, y, z), h=1.7, seed=seed + i)
        else:  # lounge / cafe
            if roll < 0.55:
                L.cafe_set(f"{name}_t{i}", (x, y, z), seed=seed + i, chairs=rnd.choice((2, 3, 4)))
            elif roll < 0.75:
                L.sofa(f"{name}_s{i}", (x, y, z), w=2.0, rot_z=rot, fabric=rnd.choice(("fabriclight", "cloth_teal", "cloth_beige")))
            else:
                L.potted_plant(f"{name}_pl{i}", (x, y, z), h=2.0, seed=seed + i)
    for i, (x, y) in enumerate(A.grid_in_poly(A.outline(raw, r, 1.6), 3.0, 0.0, seed + 7)):
        if rnd.random() < 0.45 and not any(A.point_in_poly((x, y), a) for a in (avoid or ())):
            L.pendant(f"{name}_pd{i}", (x, y, z + h), drop=0.9, r=0.2, mat=rnd.choice(("copper", "black", "white")))


def terrace(name, raw, r, z, seed, trees=0, furniture=0, vines_len=2.4, avoid=None):
    """Planted edge, glass balustrade, hanging greenery and optional trees / seating."""
    rnd = random.Random(seed)
    avoid = avoid or []
    A.solid(f"{name}_deck", A.outline(raw, r, 0.3), z, 0.04, "woodlight")
    A.ring(f"{name}_planter", A.outline(raw, r, 0.3), A.outline(raw, r, 1.5), z, 0.6, "planter")
    A.ring(f"{name}_soil", A.outline(raw, r, 0.35), A.outline(raw, r, 1.45), z + 0.6, 0.02, "soil")
    A.bushes_along(f"{name}_bush", A.outline(raw, r, 0.9), spacing=0.95, z=z + 0.55, r=0.46, seed=seed, avoid=avoid)
    A.bushes_along(f"{name}_bush2", A.outline(raw, r, 1.2), spacing=2.0, z=z + 0.8, r=0.55, seed=seed + 1, avoid=avoid)
    A.wall(f"{name}_rail", A.outline(raw, r, 0.18), z, 1.25, "glass")
    A.ring(f"{name}_railcap", A.outline(raw, r, 0.15), A.outline(raw, r, 0.21), z + 1.25, 0.05, "frame")
    A.vines(f"{name}_vines", A.outline(raw, r, -0.05), spacing=1.1, z=z + 0.4, length=vines_len, seed=seed + 2, avoid=avoid)
    inner = A.outline(raw, r, 3.0)
    free = [q for q in A.grid_in_poly(inner, 5.5, 1.5, seed + 3) if not any(A.point_in_poly(q, a) for a in avoid)]
    for i, (x, y) in enumerate(free[:trees]):
        A.tree(f"{name}_tree{i}", (x, y, z + 0.04), h=4.5 + rnd.random() * 2, spread=0.8, seed=seed * 5 + i, detail=1)
        A.solid(f"{name}_pit{i}", A.outline(A.rect_poly(x, y, 1.6, 1.6), 0.4), z, 0.45, "planter")
    seats = [q for q in A.grid_in_poly(inner, 4.0, 1.0, seed + 9) if not any(A.point_in_poly(q, a) for a in avoid)]
    for i, (x, y) in enumerate(seats[trees : trees + furniture]):
        L.cafe_set(f"{name}_cafe{i}", (x, y, z + 0.04), seed=seed * 3 + i, chairs=rnd.choice((2, 3, 4)), umbrella=rnd.random() < 0.5)


def building():
    L.set_group("static_building")
    raw = PODIUM_RAW
    l1_raw = A.offset_poly(raw, -1.2)
    # --- café podium: recessed shopfront behind an arcade
    shop = A.outline(raw, 4.0, 1.6)
    A.solid("podium_floor", A.outline(raw, 4.0, 0.0), 0.0, 0.16, "terrazzo")
    A.wall("podium_glass", shop, 0.16, L1_Z0 - 0.16, "glass")
    A.mullions("podium_mull", shop, 0.16, L1_Z0 - 0.16, spacing=2.2, size=(0.08, 0.2), mat="frame_dark")
    A.ring("podium_transom", shop, A.outline(raw, 4.0, 1.75), 3.4, 0.12, "frame_dark")
    for i, ((x, y), ang) in enumerate(A.stations(A.outline(raw, 4.0, -0.4), 6.5)):
        if abs(x - DOOR_X) > 4.6:  # keep the entrance approach clear
            cyl(f"arcade_col{i}", 0.32, L1_Z0, (x, y, 0.16), "frame", verts=24)
    interior("cafe", raw, 4.0, 0.16, L1_Z0 - 0.16, "cafe", 11, avoid=[LOBBY] + keep_clear(PODIUM_COLS))
    entrance(shop)
    # --- first-floor band (wide glass ribbon over the arcade) + big terrace on top
    glass_volume("L1", l1_raw, 5.0, L1_Z0, 1, L1_H - 2 * FRAME, "retail", 3, cols=PODIUM_COLS)
    footprints = {p[0]: pod_outline(p, -1.0) for p in PODS}
    core_fp = A.outline(A.rect_poly(CORE[0], CORE[1], CORE[2] + 2, CORE[3] + 2), 1.2)
    # nothing grows under the pods: their pilotis come down onto this terrace
    terrace("T1", l1_raw, 5.0, T1, 21, trees=6, furniture=8, vines_len=2.8, avoid=[footprints[k] for k in "ABCDEF"] + [core_fp])
    # brand sign on the band above the entrance notch
    L.text_mesh("tkc_sign", "TKC", (-8.0, -13.9, L1_Z0 + 1.6), 1.5, 0.25, "brand", rot=(math.pi / 2, 0, -0.18))
    # --- service core
    core_tower()
    # --- stacked pods
    for p in PODS:
        name, x, y, w, d, r, rot, z0, storeys, sh, use = p
        raw_p = pod_raw(p)
        top = glass_volume(f"pod{name}", raw_p, r, z0, storeys, sh, use, ord(name), cols=pod_columns(p))
        above = {"B": ["D"], "C": ["F"], "A": ["E"]}.get(name, [])
        avoid = [footprints[k] for k in above] + ([core_fp] if name in ("D", "F", "E") else [])
        terrace(f"T{name}", raw_p, r, top, ord(name) * 7, trees=2 if name in ("A", "E", "C", "B") else 0, furniture=2 if name in ("E", "B") else 0, avoid=avoid)


CORE_Z = (T1, 34.5)


def core_tower():
    """Service / IoT core behind the pods: pale panels with floor bands and per-floor fins, a panoramic glass lift
    on the front with its car, louvred plant floors on the sides, LED lines and a lettered parapet under the mast."""
    cx, cy, cw, cd = CORE
    z0, z1 = CORE_Z
    r, fh = 1.2, 3.6
    n = int((z1 - z0) / fh)
    A.solid("core", A.outline(A.rect_poly(cx, cy, cw, cd), r), z0, z1 - z0, "panel_grey", bevel=0.1)
    band_out = A.outline(A.rect_poly(cx, cy, cw + 0.16, cd + 0.16), r + 0.08)
    band_in = A.outline(A.rect_poly(cx, cy, cw - 0.06, cd - 0.06), r - 0.03)
    for k in range(1, n + 1):
        A.ring(f"core_band{k}", band_out, band_in, z0 + k * fh - 0.15, 0.3, "white")
    A.ring("core_parapet", A.outline(A.rect_poly(cx, cy, cw + 0.2, cd + 0.2), r + 0.1), A.outline(A.rect_poly(cx, cy, cw - 0.4, cd - 0.4), r - 0.2), z1, 0.9, "white")
    front = cy - cd / 2
    lift_w, plant = 2.8, (2, n - 1)  # the lift on the front face; louvred plant floors on the sides
    bm = bmesh.new()
    for (x, y), ang, _ in A._face_stations(cx, cy, cw, cd, r + 0.3, 1.2):
        on_front = abs(y - front) < 0.01
        on_side = abs(abs(x - cx) - cw / 2) < 0.01
        if on_front and abs(x - cx) < lift_w / 2 + 0.4:
            continue
        for k in range(n):
            if on_side and k in plant and abs(y - cy) < 2.6:
                continue
            A._bm_box(bm, (x, y, z0 + k * fh + 0.15 + (fh - 0.3) / 2), (0.08, 0.22, fh - 0.3), ang)
    L._finish(bm, "core_fins", "white")
    for s in (-1, 1):  # louvres on the plant floors
        for k in plant:
            for j in range(11):
                box(f"core_louvre{s + 1}{k}_{j}", (0.12, 5.0, 0.08), (cx + s * (cw / 2 + 0.06), cy, z0 + k * fh + 0.4 + j * 0.27), "frame_dark", bevel=0)
    # panoramic lift: glass shaft standing proud of the front face, the car halfway up, overrun cap on top
    ly = front - 0.75
    box("lift_glass", (lift_w, 1.5, z1 + 1.6 - z0), (cx, ly, z0), "glass", bevel=0)
    for sx in (-1, 1):
        box(f"lift_post{sx + 1}", (0.14, 0.14, z1 + 1.6 - z0), (cx + sx * lift_w / 2, front - 1.5, z0), "white", bevel=0)
    for k in range(1, n + 1):
        box(f"lift_ring{k}", (lift_w + 0.1, 1.55, 0.12), (cx, ly, z0 + k * fh - 0.06), "white", bevel=0)
    box("lift_cap", (lift_w + 0.3, 1.8, 0.4), (cx, ly, z1 + 1.6), "white", bevel=0.04)
    box("lift_car", (2.0, 1.1, 2.4), (cx, ly, z0 + 2 * fh + 0.3), "robot_white", bevel=0.05)
    box("lift_car_led", (1.8, 0.02, 0.06), (cx, ly - 0.56, z0 + 2 * fh + 2.5), "led_cyan", bevel=0)
    for sx in (-1, 1):
        box(f"core_led{sx + 1}", (0.06, 0.04, z1 - z0), (cx + sx * (lift_w / 2 + 0.9), front - 0.03, z0), "led_cyan", bevel=0)
    L.text_mesh("core_label", "SMART BUILDING", (cx, front - 0.14, z1 + 0.22), 0.52, 0.05, "brand", resolution=3)


def clip_terraces():
    """Terrace planters, hedges, rails and vines stop where a pod stands on (or just above) the terrace: they used
    to run straight through that pod's floor and glass."""
    bpy.context.view_layer.update()
    levels = {"T1": T1, **{f"T{p[0]}": _pod_top(p) for p in PODS}}
    parts = ("_planter", "_soil", "_bush", "_rail", "_vines")  # prefixes: also _bush2, _railcap
    removed = 0
    for tname, tz in levels.items():
        cuts = [pod_outline(p, -0.15) for p in PODS if tz - 0.2 <= p[7] <= tz + 2.0]
        if not cuts:
            continue
        for ob in [o for o in bpy.data.objects if o.type == "MESH" and o.name.startswith(tuple(tname + s for s in parts))]:
            bm = bmesh.new()
            bm.from_mesh(ob.data)
            mw = ob.matrix_world
            dead = [f for f in bm.faces if any(A.point_in_poly(tuple((mw @ f.calc_center_median()).xy), c) for c in cuts)]
            if dead:
                bmesh.ops.delete(bm, geom=dead, context="FACES")
                bm.to_mesh(ob.data)
                removed += len(dead)
            bm.free()
    print("clip_terraces: removed", removed, "faces")


def _surface_below(x, y, z, with_object=False):
    """Height of the first solid surface under (x, y, z), looking through glass and foliage."""
    scene = bpy.context.scene
    dg = bpy.context.evaluated_depsgraph_get()
    origin = Vector((x, y, z))
    while True:
        hit, loc, _n, _i, ob, _m = scene.ray_cast(dg, origin, Vector((0, 0, -1)))
        if not hit:
            return (0.0, None) if with_object else 0.0
        mat = ob.data.materials[0].name if ob.data.materials else ""
        if ob.get("kind") != "glass" and not mat.startswith(("leaf", "glass")):
            return (loc.z, ob) if with_object else loc.z
        origin = loc - Vector((0, 0, 0.01))


def overhang_legs():
    """Columns under every pod edge that overhangs open space (the structural grid alone left the cantilevered
    rims floating): stations every ~5.5 m just inside the rim, skipped near an existing column and wherever the
    ground below is a planter, tree pit or café set rather than a deck."""
    bpy.context.view_layer.update()
    cols = [c for p in PODS for c in pod_columns(p)] + list(PODIUM_COLS)
    added = 0
    for p in PODS:
        name, z0 = p[0], p[7]
        for i, ((x, y), _) in enumerate(A.stations(pod_outline(p, 1.1), 5.5)):
            if any(math.hypot(x - cx, y - cy) < 3.2 for cx, cy in cols):
                continue
            ground, ob = _surface_below(x, y, z0 - 0.4, with_object=True)
            if z0 - ground < 0.6 or ob is None or re.search(r"planter|_pit|soil|cafe|tree|bush|rail|sofa|_pl\d", ob.name):
                continue
            cyl(f"leg{name}{i}", COL_R + 0.1, z0 - ground, (x, y, ground), "frame", verts=24)
            cols.append((x, y))
            added += 1
    print("overhang_legs: added", added)


def structure():
    """Columns: a grid through every pod and the podium, and pilotis wherever a pod overhangs."""
    L.set_group("static_building")
    bpy.context.view_layer.update()
    for p in PODS:
        name, z0 = p[0], p[7]
        top = _pod_top(p)
        for i, (x, y) in enumerate(pod_columns(p)):
            cyl(f"col{name}{i}", COL_R, top - z0 - 2 * FRAME, (x, y, z0 + FRAME), "white", verts=20)
            ground = _surface_below(x, y, z0 - 0.4)
            if z0 - ground > 0.6:
                cyl(f"pilotis{name}{i}", COL_R + 0.1, z0 - ground, (x, y, ground), "frame", verts=24)
    for i, (x, y) in enumerate(PODIUM_COLS):
        cyl(f"pcol{i}", COL_R + 0.05, L1_Z0 - 0.16, (x, y, 0.16), "white", verts=20)
        cyl(f"pcolL1{i}", COL_R, L1_H - 2 * FRAME, (x, y, L1_Z0 + FRAME), "white", verts=20)
    overhang_legs()


def entrance(shop):
    """Main entrance: canopy, portal, automatic sliding doors and a face-scan terminal."""
    fy = A.facade_y(shop, DOOR_X)
    x0 = DOOR_X
    # open the shopfront glass and mullions where the portal goes
    for ob in (bpy.data.objects["podium_glass"], bpy.data.objects["podium_mull"]):
        A.carve(ob, x0 - 3.4, x0 + 3.4, fy - 1.6, fy + 1.0, 3.45)
    with group("hot:access-control"):
        box("ent_canopy", (8.6, 3.4, 0.28), (x0, fy - 1.9, 3.5), "frame", bevel=0.08)
        for k in (-1, 0, 1):
            cyl(f"ent_dl{k}", 0.16, 0.02, (x0 + k * 2.4, fy - 2.0, 3.48), "led_warm", verts=16)
        for side in (-1, 1):
            box(f"ent_jamb{side}", (0.4, 1.6, 3.3), (x0 + side * 3.5, fy - 0.35, 0.16), "frame_dark", bevel=0.04)
            box(f"ent_side{side}", (1.66, 0.04, 2.84), (x0 + side * 2.47, fy - 0.1, 0.16), "glass", bevel=0)
        box("ent_header", (7.4, 1.6, 0.45), (x0, fy - 0.35, 3.0), "frame_dark", bevel=0.04)
        box("ent_header_led", (6.6, 0.03, 0.06), (x0, fy - 1.16, 3.18), "led_cyan", bevel=0)
        box("ent_mat", (3.4, 1.6, 0.012), (x0, fy - 1.3, 0.16), "darkgray", bevel=0)
        box("face_post", (0.32, 0.22, 1.35), (x0 + 4.1, fy - 0.9, 0.16), "frame_dark", bevel=0.04)
        upright_screen("face_scr", (0.24, 0.34), (x0 + 4.1, fy - 1.02, 1.25), "-y", "screen_face")
        empty("pin_access-control", (x0, fy - 3.4, 4.3))
    # sliding leaves open when someone comes within `sense` metres (animated in the browser)
    for side in (-1, 1):
        with group("move"):
            parts = [box(f"door{side}_pane", (1.56, 0.03, 2.8), (0, 0, 0.02), "glass", bevel=0)]
            for k, (fx, fz, sx, sz) in enumerate(((0, 0, 1.6, 0.06), (0, 2.78, 1.6, 0.06), (-0.78, 0, 0.05, 2.84), (0.78, 0, 0.05, 2.84))):
                parts.append(box(f"door{side}_f{k}", (sx, 0.06, sz), (fx, 0, fz), "frame_dark", bevel=0))
            parts.append(box(f"door{side}_bar", (0.04, 0.08, 1.2), (-side * 0.62, -0.05, 0.9), "silver", bevel=0))
        leaf = L.rigid(parts, f"door{side}")
        L.place(leaf, (x0 + side * 0.8, fy - 0.3, 0.16), 0.0, slide=side, slide_dist=1.5, sense=3.2, hot="access-control")
    return fy


def roof_systems():
    d = POD["D"]
    f = POD["F"]
    d_top = _pod_top(d) + 0.04
    f_top = _pod_top(f) + 0.04
    with group("hot:renewable-energy"):
        for k, (px, py, rows, cols) in enumerate(((d[1] - 1.5, d[2] - 1.0, 3, 6), (f[1] - 3.5, f[2] - 1.5, 3, 7))):
            base = d_top if k == 0 else f_top
            for rr in range(rows):
                for cc in range(cols):
                    x = px + (cc - (cols - 1) / 2) * 1.15
                    y = py + (rr - (rows - 1) / 2) * 2.4
                    box(f"pv{k}_{rr}{cc}", (1.08, 1.75, 0.05), (x, y, base + 0.7), "solar", bevel=0.015, rot=(0.42, 0, 0))
                    box(f"pvf{k}_{rr}{cc}", (1.12, 1.79, 0.03), (x, y, base + 0.69), "aluminium", bevel=0.01, rot=(0.42, 0, 0))
                box(f"pvrail{k}_{rr}", (cols * 1.15, 0.08, 0.7), (px, py + (rr - (rows - 1) / 2) * 2.4 + 0.55, base), "aluminium", bevel=0.01)
        cyl("hawt_mast", 0.14, 7.5, (f[1] + 6.2, f[2] + 3.2, f_top), "white", verts=16, r2=0.09)
        box("hawt_nacelle", (1.2, 0.4, 0.4), (f[1] + 6.2, f[2] + 3.2, f_top + 7.4), "white", bevel=0.12)
        L.set_group("anim")
        blades = []
        for k in range(3):
            a = k * math.tau / 3
            blades.append(L.box(f"hawt_blade{k}", (0.12, 0.28, 2.6), (0, 0, 0), "white", bevel=0.05, rot=(0, 0, 0)))
            blades[-1].rotation_euler = (a, 0, 0)
            blades[-1].location = (0, 0, 0)
        hub = L.sphere("anim_hawt", 0.22, (0, 0, 0), "white", subdiv=2)
        for b in blades:
            b.select_set(True)
        L.join_into(hub, blades)
        hub.location = (f[1] + 6.85, f[2] + 3.2, f_top + 7.6)
        hub["hot"] = "renewable-energy"
        hub["spin"] = "x"
        L.set_group("hot:renewable-energy")
        empty("pin_renewable-energy", (f[1] - 3.5, f[2] - 1.5, f_top + 2.6))

    with group("hot:building-automation"):
        for k in range(3):
            x = f[1] + 1.8 + k * 2.5
            y = f[2] - 3.5
            box(f"ahu{k}", (2.2, 2.6, 1.6), (x, y, f_top), "aluminium", bevel=0.06)
            cyl(f"ahu{k}_ring", 0.7, 0.14, (x, y, f_top + 1.6), "frame_dark", verts=32)
            L.set_group("anim")
            fan = L.box(f"anim_fan{k}", (1.2, 0.14, 0.03), (0, 0, 0), "black", bevel=0.01)
            fan2 = L.box(f"anim_fan{k}_b", (0.14, 1.2, 0.03), (0, 0, 0), "black", bevel=0.01)
            L.join_into(fan, [fan2])
            fan.location = (x, y, f_top + 1.68)
            fan["hot"] = "building-automation"
            fan["spin"] = "z"
            L.set_group("hot:building-automation")
        box("bms_cabinet", (1.8, 0.7, 2.0), (f[1] + 4.3, f[2] + 1.2, f_top), "white", bevel=0.05)
        upright_screen("bms_screen", (1.3, 0.8), (f[1] + 4.3, f[2] + 0.84, f_top + 1.35), "-y", "screen_bms")
        empty("pin_building-automation", (f[1] + 4.3, f[2] - 3.5, f_top + 3.0))

    with group("hot:iot"):
        cx, cy, *_ = CORE
        z = 34.5
        box("iot_gateway", (1.4, 1.0, 1.2), (cx - 2.2, cy, z), "white", bevel=0.06)
        box("iot_gateway_led", (1.0, 0.02, 0.06), (cx - 2.2, cy - 0.51, z + 0.95), "led_green", bevel=0)
        cyl("iot_mast", 0.14, 8.0, (cx, cy, z), "frame", verts=16, r2=0.08)
        for k in range(3):
            a = k * math.tau / 3
            box(f"iot_ant{k}", (0.16, 0.36, 1.4), (cx + math.cos(a) * 0.35, cy + math.sin(a) * 0.35, z + 6.2), "white", bevel=0.04, rot=(0, 0, a))
        sphere("iot_dish", 0.6, (cx, cy - 0.5, z + 4.0), "white", scale=(1, 0.4, 1), rot=(0.35, 0, 0))
        sphere("iot_beacon", 0.12, (cx, cy, z + 8.1), "led_red")
        empty("pin_iot", (cx, cy, z + 9.2))


def street_level():
    L.set_group("static_site")
    A.solid("plinth", A.outline(A.rect_poly(0, 0, 88, 80), 2.0), -2.0, 2.0, "offwhite", bevel=0.15)
    # roads
    box("road_front", (88, 8, 0.02), (0, -32, 0), "asphalt", bevel=0)
    for i in range(14):
        box(f"dash_f{i}", (2.4, 0.15, 0.005), (-41 + i * 6.2, -32, 0.02), "paint_white", bevel=0)
    for i in range(9):
        box(f"zebra_f{i}", (0.55, 5.0, 0.005), (12.0 + i * 1.1, -32, 0.021), "paint_white", bevel=0)
    # sidewalks; the front one is cut by the car-park driveways
    for name, x0, x1 in (("sidewalk_f", -44.0, LOT_IN[0]), ("sidewalk_f2", LOT_IN[1], LOT_OUT[0])):
        box(name, (x1 - x0, 6, 0.16), ((x0 + x1) / 2, -25, 0), "paving", bevel=0.03)
    box("sidewalk_far", (88, 4, 0.16), (0, -38, 0), "paving", bevel=0.03)
    for i in range(44):
        x = -43 + i * 2
        if x < LOT_IN[0] or LOT_IN[1] < x < LOT_OUT[0]:
            box(f"joint_f{i}", (0.03, 6, 0.003), (x, -25, 0.16), "paving_dark", bevel=0)
    box("lot_paving", (70.5, 62, 0.16), (-8.75, 9, 0), "paving", bevel=0.03)
    # street trees with grates, lamps, bins, benches
    rnd = random.Random(8)
    k = 0
    for x in range(-40, 22, 8):
        box(f"grate_f{k}", (1.4, 1.4, 0.02), (x, -24.5, 0.16), "frame_dark", bevel=0)
        A.tree(f"stree_f{k}", (x, -24.5, 0.16), h=6.5 + rnd.random() * 1.5, spread=0.95, seed=100 + k)
        L.street_light(f"slamp_f{k}", (x + 4, -27.6, 0.16), rot_z=-math.pi / 2, h=6.5)
        k += 1
    for y in range(-14, 31, 8):  # along the walkway beside the car park
        box(f"grate_r{k}", (1.4, 1.4, 0.02), (25.8, y, 0.16), "frame_dark", bevel=0)
        A.tree(f"stree_r{k}", (25.8, y, 0.16), h=6.0 + rnd.random() * 1.2, spread=0.85, seed=100 + k)
        k += 1
    for x in range(-38, 40, 11):
        A.tree(f"stree_far{k}", (x, -38.5, 0.16), h=6.0 + rnd.random(), spread=0.9, seed=200 + k, detail=1)
        k += 1
    for i, (x, y, r) in enumerate(((-20, -23.2, 0), (-4, -23.2, 0))):
        L.bench(f"sbench{i}", (x, y, 0.16), rot_z=r)
    # bus stop
    box("bus_roof", (6.0, 2.2, 0.15), (-28, -26.8, 2.7), "frame", bevel=0.05)
    for x in (-30.8, -25.2):
        box(f"bus_post{x}", (0.1, 0.1, 2.6), (x, -26.0, 0.16), "frame_dark", bevel=0.02)
    box("bus_back", (5.6, 0.04, 2.3), (-28, -25.95, 0.35), "glass", bevel=0)
    upright_screen("bus_ad", (1.2, 1.9), (-30.2, -26.0, 1.4), "-y", "screen_ad")
    box("bus_bench", (3.0, 0.45, 0.45), (-27.6, -26.2, 0.16), "woodlight", bevel=0.03)
    # people waiting / chatting
    for i, (x, y, h) in enumerate(((-27.0, -26.9, 1.6), (-29.2, -27.0, 1.4), (-14.5, -19.5, 0.4), (-13.8, -19.9, 3.4), (12.5, -19.6, 2.0))):
        L.human(f"stander{i}", (x, y, 0.16), rot_z=h, seed=280 + i, pose="stand")
    # pedestrians walk closed loops, so nobody has to vanish at the edge of the base:
    # both directions around the building block, up and down the far sidewalk, and in / out of the lobby
    block = A.rect_poly(-4.8, 0.55, 58.4, 44.9)  # centre line: y -21.9 .. 23, x -34 .. 24.4
    loops = [
        (A.fillet_poly(A.offset_poly(block, 0.4), 2.6, 6), 6, 1.3),
        (list(reversed(A.fillet_poly(A.offset_poly(block, -0.4), 3.4, 6))), 6, 1.2),
        (A.fillet_poly(A.rect_poly(0.0, -38.2, 80.0, 2.0), 0.99, 6), 4, 1.25),
        (A.fillet_poly(A.rect_poly(DOOR_X - 0.6, -12.55, 1.4, 14.5), 0.69, 6), 2, 1.15),
    ]
    n = 0
    for path, count, speed in loops:
        length = L.path_length(path, True)
        for j in range(count):  # same speed per loop and even spacing: nobody walks through anybody
            L.walker(f"walker{n}", path, speed, (j + 0.37) * length / count, seed=300 + n)
            n += 1
    # café tables under the arcade
    for i, (x, y) in enumerate(((-22, -17.5), (-16, -16.2), (2, -16.4), (8, -18.4), (19.5, -10.5), (21.5, -2))):
        L.cafe_set(f"arcade_cafe{i}", (x, y, 0.16), seed=400 + i, chairs=3)
    traffic()


def traffic():
    """Cars all drive at one speed. Three circulate through the car park; the road lanes are exactly a
    third of that loop long (running off the base at both ends), so their relative phases never drift
    and the through cars can be phased once to keep clear of the loop cars."""
    v = 7.0
    loop = A.fillet_poly([(-47.0, -30.2), (LANE_IN, -30.2), (LANE_IN, 33.6), (LANE_OUT, 33.6), (LANE_OUT, -33.8), (-47.0, -33.8)], 3.5, 6)
    total = L.path_length(loop, True)
    a = total / 6
    loopers = [i * total / 3 for i in range(3)]

    def clearance(lane, phase):
        worst = 1e9
        for k in range(480):
            d = k * total / 480
            p, _ = L.path_point(lane, False, phase + d)
            if abs(p[0]) > 46:
                continue
            for at in loopers:
                q, _ = L.path_point(loop, True, at + d)
                if abs(q[0]) < 46 and abs(p[1] - q[1]) < 2.8:  # same lane or cutting across it
                    worst = min(worst, math.hypot(p[0] - q[0], p[1] - q[1]))
        return worst

    lanes = {"east": [(-a, -30.2), (a, -30.2)], "west": [(a, -33.8), (-a, -33.8)]}
    for i, at in enumerate(loopers):
        L.driver(f"car_loop{i}", loop, v, at, closed=True, paint=("brand", "white", "red")[i])
    for i, (key, lane) in enumerate(lanes.items()):
        phase = max(range(0, int(2 * a)), key=lambda ph: clearance(lane, ph))
        print(f"traffic {key}: phase {phase} clearance {clearance(lane, phase):.1f} m")
        L.driver(f"car_{key}", lane, v, phase, closed=False, paint=("silver", "navy")[i], kind=("car", "van")[i])


def signage_and_security():
    with group("hot:lighting"):
        # building directory by the main entrance
        x, y = DOOR_X + 6.0, -16.5
        box("totem", (1.6, 0.45, 4.2), (x, y, 0.16), "frame_dark", bevel=0.06)
        upright_screen("totem_scr", (1.4, 3.6), (x, y - 0.235, 2.36), "-y", "screen_totem")
        L.set_group("hot:lighting")
        # media screen wrapped on the first-floor band near the corner
        mx, my, ma = 19.35, -13.75, 0.85
        box("media_frame", (7.8, 0.14, 3.4), (mx - math.sin(ma) * 0.05, my + math.cos(ma) * 0.05, L1_Z0 + 0.75), "frame_dark", bevel=0.03, rot=(0, 0, ma))
        L.plane("media_screen", (7.5, 3.1), (mx + math.sin(ma) * 0.03, my - math.cos(ma) * 0.03, L1_Z0 + 2.45), "screen_media", rot=(math.pi / 2, 0, ma))
        empty("pin_lighting", (mx + 0.6, my - 0.6, L1_Z0 + 4.4))

    with group("hot:surveillance"):
        x, y = 23.6, -20.0
        cyl("cctv_pole", 0.1, 5.4, (x, y, 0.16), "frame_dark", verts=16)
        box("cctv_arm", (0.9, 0.1, 0.1), (x - 0.4, y, 5.4), "frame_dark", bevel=0.02)
        box("cctv_body", (0.36, 0.8, 0.32), (x - 0.8, y - 0.2, 5.15), "white", bevel=0.06, rot=(-0.35, 0, 0.8))
        cyl("cctv_lens", 0.1, 0.06, (x - 1.05, y - 0.55, 5.02), "black", verts=16, rot=(math.pi / 2 - 0.35, 0, 0.8))
        sphere("cctv_led", 0.03, (x - 0.7, y - 0.45, 5.4), "led_red")
        for k, (dx, dy) in enumerate(((-6, -12.6), (6, -13.8), (18.8, -6))):
            cyl(f"dome{k}_base", 0.22, 0.06, (dx, dy, L1_Z0 - 0.2), "white", verts=20)
            sphere(f"dome{k}", 0.16, (dx, dy, L1_Z0 - 0.21), "black", scale=(1, 1, 0.7))
        empty("pin_surveillance", (x - 0.6, y, 6.4))

    with group("hot:motion-sensors"):
        for k, (x, y) in enumerate(((1.0, -13.0), (4.0, -13.7), (7.0, -14.4))):
            cyl(f"pir{k}", 0.2, 0.1, (x, y, L1_Z0 - 0.26), "white", verts=24, bevel=0.03)
            cyl(f"pir{k}_ring", 0.21, 0.02, (x, y, L1_Z0 - 0.2), "led_cyan", verts=24)
            sphere(f"pir{k}_dome", 0.13, (x, y, L1_Z0 - 0.26), "offwhite", scale=(1, 1, 0.7))
        empty("pin_motion-sensors", (4.0, -16.8, 4.2))

    with group("hot:access-control"):
        posts = [-11.4, -10.0, -8.6, -7.2, -5.8, -4.4]
        yy = -8.4
        for i, x in enumerate(posts):
            box(f"gate{i}", (0.26, 1.4, 1.05), (x, yy, 0.16), "frame", bevel=0.05)
            box(f"gate{i}_led", (0.2, 1.2, 0.02), (x, yy, 1.21), "led_cyan", bevel=0)
            box(f"gate{i}_reader", (0.18, 0.18, 0.03), (x, yy - 0.5, 1.22), "led_blue", bevel=0)
            if i < len(posts) - 1:
                for sgn in (0.3, 0.7):
                    at = (x + (posts[i + 1] - x) * sgn, yy, 0.4)
                    if i in (1, 2):  # lanes used by the people walking in and out
                        with group("move"):
                            flap = L.rigid([box(f"flap{i}_{sgn}", (0.5, 0.03, 0.8), (0, 0, 0), "glass", bevel=0)], f"flap{i}_{sgn}")
                        L.place(flap, at, 0.0, slide=-1 if sgn < 0.5 else 1, slide_dist=0.42, sense=1.0, hot="access-control")
                    else:
                        box(f"gate{i}_flap{sgn}", (0.5, 0.03, 0.8), at, "glass", bevel=0)
        box("reception", (5.0, 1.0, 1.1), (-8.0, -3.0, 0.16), "white", bevel=0.08)
        box("reception_top", (5.2, 1.15, 0.05), (-8.0, -3.0, 1.26), "woodlight", bevel=0.02)

    parking_lot()


def parking_lot():
    """Surface car park: bays with occupancy sensors, EV charging, barrier gates with ANPR, guidance sign."""
    rnd = random.Random(31)
    L.set_group("static_site")
    box("lot_asphalt", (LOT_OUT[1] - LOT_IN[0], 60, 0.02), ((LOT_IN[0] + LOT_OUT[1]) / 2, 8, 0), "asphalt", bevel=0)
    for name, (x0, x1) in (("drive_in", LOT_IN), ("drive_out", LOT_OUT)):
        box(name, (x1 - x0, 6, 0.02), ((x0 + x1) / 2, -25, 0), "asphalt", bevel=0)
    # islands: front (gates, sign) and back, planter along the far edge
    box("island_front", (LOT_OUT[0] - LOT_IN[1], 5.2, 0.15), (DIVIDER_X, -19.0, 0.02), "paving", bevel=0.05)
    box("island_back", (LOT_OUT[0] - LOT_IN[1], 2.0, 0.15), (DIVIDER_X, 29.8, 0.02), "paving", bevel=0.05)
    box("lot_planter", (16.0, 1.4, 0.5), (34.5, 38.9, 0.02), "planter", bevel=0.05)
    for i, (x, y, h) in enumerate(((32.6, -18.2, 4.2), (38.0, -18.2, 4.0), (32.0, 29.8, 4.4), (38.6, 29.8, 4.1), (28.5, 38.9, 3.4), (33.5, 38.9, 3.2), (38.5, 38.9, 3.5))):
        A.tree(f"lot_tree{i}", (x, y, 0.17 if y < 35 else 0.52), h=h, spread=0.6, seed=500 + i, detail=1)
    for i, y in enumerate((BAY_Y0 + 5 * BAY_W, BAY_Y0 + 11 * BAY_W, 30.3)):
        L.street_light(f"lot_lamp{i}", (DIVIDER_X, y, 0.02), rot_z=math.pi / 2, h=6.0)
    parked = []
    free = 0
    with group("hot:smart-parking"):
        for i in range(BAYS + 1):
            for cx in (DIVIDER_X - 2.4, DIVIDER_X + 2.4):
                box(f"bay_line{cx:.0f}_{i}", (4.8, 0.1, 0.004), (cx, BAY_Y0 + i * BAY_W, 0.021), "paint_white", bevel=0)
        box("bay_divider", (0.12, BAYS * BAY_W, 0.004), (DIVIDER_X, BAY_Y0 + BAYS * BAY_W / 2, 0.021), "paint_white", bevel=0)
        for row, (cx, heading, puck_x) in enumerate(((DIVIDER_X - 2.4, 0.0, LOT_IN[1] + 0.35), (DIVIDER_X + 2.4, math.pi, LOT_OUT[0] - 0.35))):
            for i in range(BAYS):
                y = BAY_Y0 + (i + 0.5) * BAY_W
                ev = row == 0 and i in EV_BAYS
                taken = rnd.random() < (0.5 if ev else 0.7)
                if ev:
                    box(f"ev_paint{i}", (4.6, 2.3, 0.004), (cx, y, 0.0205), "paint_green", bevel=0)
                    box(f"ev_charger{i}", (0.3, 0.5, 1.45), (DIVIDER_X - 0.25, y, 0.02), "white", bevel=0.05)
                    box(f"ev_led{i}", (0.02, 0.36, 0.4), (DIVIDER_X - 0.41, y, 0.85), "led_blue" if taken else "led_green", bevel=0)
                # occupancy sensor at the mouth of every bay: red = taken, green = free
                cyl(f"bay_sensor{row}_{i}", 0.17, 0.035, (puck_x, y, 0.02), "led_red" if taken else "led_green", verts=16)
                if taken:
                    parked.append((cx - (0.5 if ev else 0.0), y, heading))
                else:
                    free += 1
        # gates: barrier arms lift for approaching cars (animated in the browser)
        for tag, pivot_x, heading, arm, lane_x in (("in", LOT_IN[1] - 0.2, 0.0, 3.8, LANE_IN), ("out", LOT_OUT[0] + 0.2, math.pi, 3.7, LANE_OUT)):
            y = -19.8
            side = 1 if tag == "in" else -1
            box(f"gate_{tag}_post", (0.42, 0.42, 1.1), (pivot_x, y, 0.02), "frame_dark", bevel=0.03)
            box(f"kiosk_{tag}", (0.5, 0.6, 1.35), (pivot_x + side * 0.3, y - 1.1, 0.17), "white", bevel=0.05)
            upright_screen(f"kiosk_{tag}_scr", (0.3, 0.26), (pivot_x - side * 0.06, y - 1.1, 1.2), "-x" if tag == "in" else "+x", "screen_monitor")
            cyl(f"anpr_{tag}_pole", 0.07, 2.9, (pivot_x + side * 0.9, -17.6, 0.17), "frame_dark", verts=12)
            box(f"anpr_{tag}_arm", (1.2, 0.08, 0.08), (pivot_x + side * 0.4, -17.6, 2.95), "frame_dark", bevel=0)
            box(f"anpr_{tag}_cam", (0.24, 0.46, 0.22), (lane_x + side * 1.2, -17.8, 2.75), "white", bevel=0.05, rot=(-0.3, 0, 0))
            with group("move"):
                parts = [box(f"barrier_{tag}", (arm, 0.1, 0.1), (-arm / 2, 0, -0.05), "white", bevel=0)]
                parts += [box(f"barrier_{tag}_s{k}", (0.42, 0.105, 0.105), (-0.6 - k * 0.9, 0, -0.052), "red", bevel=0) for k in range(4)]
            L.place(L.rigid(parts, f"barrier_{tag}"), (pivot_x, y, 1.12), heading, lift=1, sense=7.0, sense_for="drive", hot="smart-parking")
        # guidance sign facing the street
        cyl("psign_pole", 0.09, 3.4, (DIVIDER_X, -21.0, 0.17), "frame_dark", verts=12)
        box("psign", (2.0, 0.28, 1.2), (DIVIDER_X, -21.0, 3.1), "brand", bevel=0.05)
        upright_screen("psign_scr", (1.7, 0.72), (DIVIDER_X, -21.16, 3.7), "-y", "screen_parking")
        empty("pin_smart-parking", (DIVIDER_X, 4.0, 3.4))
    for i, (x, y, heading) in enumerate(parked):
        L.car(f"pcar{i}", (x, y, 0.02), rot_z=heading, paint=rnd.choice(("white", "silver", "navy", "red", "black", "brand", "white", "silver")))
    print("parking: free bays", free, "of", 2 * BAYS)


def background_towers():
    L.set_group("static_site")
    specs = [(-36, 34, 12, 10, 58), (-20, 35.5, 14, 8, 44), (16, 34.5, 12, 10, 64), (-40.5, 12, 6, 14, 38)]
    for i, (x, y, w, d, h) in enumerate(specs):
        A.office_tower(f"tower{i}", x, y, w, d, h, glass="tower_glass" if i % 2 else "tower_glass2", seed=7 + i, mast=i == 2, style=i % 2)


def lighting(sun_elev=24, sun_azim=205):
    scene = bpy.context.scene
    world = bpy.data.worlds.new("Sky")
    scene.world = world
    nt = world.node_tree
    bg = nt.nodes["Background"]
    sky = nt.nodes.new("ShaderNodeTexSky")
    try:
        sky.sky_type = "MULTIPLE_SCATTERING"
    except TypeError:
        print("sky types:", [i.identifier for i in sky.bl_rna.properties["sky_type"].enum_items])
    sky.sun_elevation = math.radians(sun_elev)
    sky.sun_rotation = math.radians(sun_azim)
    try:
        sky.sun_disc = False
    except AttributeError:
        pass
    nt.links.new(sky.outputs["Color"], bg.inputs["Color"])
    bg.inputs["Strength"].default_value = 0.22
    sun_data = bpy.data.lights.new("Sun", "SUN")
    sun_data.energy = 5.5
    sun_data.angle = math.radians(1.5)
    sun_data.color = (1.0, 0.9, 0.78)
    sun = bpy.data.objects.new("Sun", sun_data)
    L.COL.objects.link(sun)
    el = math.radians(sun_elev)
    hdir = Vector((-0.55, -0.8, 0.0)).normalized()
    to_sun = Vector((hdir.x * math.cos(el), hdir.y * math.cos(el), math.sin(el)))
    sun.rotation_euler = (-to_sun).to_track_quat("-Z", "Y").to_euler()
    # warm interior fill per pod storey so the glazing glows like the artwork
    for p in PODS + [("L1", -4.0, 0.0, 50, 34, 5, 0, L1_Z0, 1, 3.3, "retail"), ("cafe", -4.0, 0.0, 46, 30, 4, 0, 0.16, 1, 6.2, "cafe")]:
        name, x, y, w, d, r, rot, z0, storeys, sh, use = p
        for s in range(storeys):
            a = bpy.data.lights.new(f"Fill_{name}{s}", "AREA")
            a.shape = "RECTANGLE"
            a.size, a.size_y = w * 0.8, d * 0.8
            a.energy = 6.0 * w * d
            a.color = (1.0, 0.7, 0.45)
            ob = bpy.data.objects.new(f"Fill_{name}{s}", a)
            L.COL.objects.link(ob)
            ob.location = (x, y, z0 + FRAME + s * (sh + BAND) + sh - 0.3)
            ob.rotation_euler = (0, 0, rot)


def preview(path, view="iso", samples=40, res=(1600, 1000)):
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
    cam = bpy.data.objects.new("Cam", cam_data)
    L.COL.objects.link(cam)
    if view == "street":
        cam_data.lens = 24
        cam.location = (46, -48, 9)
        target = Vector((-2, 0, 17))
    else:
        cam_data.lens = 45
        cam.location = (88, -102, 78)
        target = Vector((-2, 0, 10))
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
    street_level()
    building()
    clip_terraces()
    roof_systems()
    signage_and_security()
    background_towers()
    structure()
    lighting()
    for name, groups in ATLASES.items():
        bpy.context.scene[f"atlas_{name}"] = ",".join(groups)
    bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(BLEND))
    print("objects:", len(bpy.context.scene.objects), "tris:", sum(len(o.data.polygons) for o in bpy.context.scene.objects if o.type == "MESH"))


if __name__ == "__main__":
    args = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    build()
    if "--preview" in args:
        preview(args[args.index("--preview") + 1], view=args[args.index("--view") + 1] if "--view" in args else "iso")
