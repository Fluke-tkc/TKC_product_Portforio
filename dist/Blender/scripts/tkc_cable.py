"""Smart-cables props for the dioramas (built on tkc_lib / tkc_arch / tkc_logi).

Pipes and cables are batched tube segments: one object per call and material, but every segment stays a loose
part no longer than ~3 m, so bake_export.py vertex-lights them instead of shattering the lightmap atlas.
Conventions as in tkc_lib: loc = bottom centre, rot_z = heading (vehicles face local +x), `face` = compass angle
a screen looks towards.
"""
import math
import random

import bmesh
from mathutils import Vector

import tkc_arch as A
import tkc_lib as L
import tkc_logi as G
import tkc_med as M
from tkc_lib import box, cyl, sphere

L.OUTFITS["crew"] = {"shirt": "orange", "pants": "cloth_navy"}  # hi-vis street-works crew
UP = Vector((0, 0, 1))
STEP = 3.0  # longest tube segment (vertex light is sampled at every joint)


def _at(loc, rot_z):
    x, y, z = loc
    c, s = math.cos(rot_z), math.sin(rot_z)
    return lambda dx, dy, dz: (x + c * dx - s * dy, y + s * dx + c * dy, z + dz)


# ------------------------------------------------------------------ tubes

def _tube(bm, a, b, r, verts):
    a, b = Vector(a), Vector(b)
    d = b - a
    g = bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=verts, radius1=r, radius2=r, depth=d.length)
    bmesh.ops.rotate(bm, cent=(0, 0, 0), matrix=UP.rotation_difference(d.normalized()).to_matrix(), verts=g["verts"])
    bmesh.ops.translate(bm, vec=(a + b) / 2, verts=g["verts"])


def tubes(name, segs, mat, verts=8):
    """Many cylinders as one object: segs = [(a, b, r)]."""
    if not segs:
        return None
    bm = bmesh.new()
    for a, b, r in segs:
        _tube(bm, a, b, r, verts)
    ob = L._finish(bm, name, mat)
    for p in ob.data.polygons:
        p.use_smooth = p.loop_total == 4  # smooth sides, flat caps
    return ob


def split(pts, step=STEP):
    """Polyline -> (a, b) pieces no longer than step."""
    out = []
    for a, b in zip(pts, pts[1:]):
        a, b = Vector(a), Vector(b)
        n = max(1, math.ceil((b - a).length / step))
        out += [(a.lerp(b, k / n), a.lerp(b, (k + 1) / n)) for k in range(n)]
    return out


def bezier(p0, p1, p2, p3, n=12):
    p0, p1, p2, p3 = map(Vector, (p0, p1, p2, p3))
    return [((1 - t) ** 3) * p0 + 3 * ((1 - t) ** 2) * t * p1 + 3 * (1 - t) * t * t * p2 + t ** 3 * p3 for t in (k / n for k in range(n + 1))]


def pipe_y(name, x, z, y0, y1, r, mat, joint=2.4, collar="black", cut=None):
    """Pipe along +y with collars at every joint; cut=(core mats) shows a cable section at the y0 end."""
    n = max(1, round((y1 - y0) / joint))
    ys = [y0 + (y1 - y0) * k / n for k in range(n + 1)]
    tubes(name, [((x, a, z), (x, b, z), r) for a, b in zip(ys, ys[1:])], mat, verts=24)
    tubes(f"{name}_collar", [((x, y - 0.13, z), (x, y + 0.13, z), r * 1.12) for y in ys[1:-1]], collar, verts=24)
    if cut:
        tubes(f"{name}_sheath", [((x, y0 - 0.012, z), (x, y0, z), r * 0.84)], "cable_black", verts=20)
        for k, mat_ in enumerate(cut):
            a = k * math.tau / len(cut) + 0.5
            c = (x + math.cos(a) * r * 0.38, y0 - 0.02, z + math.sin(a) * r * 0.38)
            tubes(f"{name}_core{k}", [(c, (c[0], y0, c[2]), r * 0.3)], mat_, verts=12)


def _frame(t):
    n = t.cross(UP)
    if n.length < 1e-4:
        n = t.cross(Vector((1, 0, 0)))
    n.normalize()
    return n, t.cross(n).normalized()


HEX = [(0, 0)] + [(math.cos(k * math.pi / 3), math.sin(k * math.pi / 3)) for k in range(6)] + [(1.9 * math.cos(k * math.pi / 6 + 0.26), 1.9 * math.sin(k * math.pi / 6 + 0.26)) for k in range(12)]


def bundle(name, path, n, r, colours, tie_every=1.2, tie="steel", labels=True, seed=0):
    """n cables (radius r) packed round a centre polyline, with cable ties and a few ID tags."""
    rnd = random.Random(seed)
    pts = [Vector(p) for p in path]
    frames = []
    for i, p in enumerate(pts):
        t = (pts[min(i + 1, len(pts) - 1)] - pts[max(i - 1, 0)]).normalized()
        frames.append(_frame(t))
    by_mat = {}
    for k in range(n):
        u, v = HEX[k % len(HEX)]
        line = [p + nn * u * r * 2.05 + bb * v * r * 2.05 for p, (nn, bb) in zip(pts, frames)]
        by_mat.setdefault(colours[k % len(colours)], []).extend((a, b, r) for a, b in split(line))
    for mat, segs in by_mat.items():
        tubes(f"{name}_{mat}", segs, mat, verts=8)
    rad = r * (2.05 * (1.9 if n > 7 else 1.0) + 1.1)
    ties, tags = [], []
    acc = tie_every / 2
    for a, b in zip(pts, pts[1:]):
        seg = (b - a).length
        while acc < seg:
            c = a.lerp(b, acc / seg)
            t = (b - a).normalized()
            ties.append((c - t * 0.018, c + t * 0.018, rad))
            if labels and rnd.random() < 0.3:
                nn, bb = _frame(t)
                tags.append(c - bb * (rad + 0.04))
            acc += tie_every
        acc -= seg
    tubes(f"{name}_ties", ties, tie, verts=10)
    for k, c in enumerate(tags):  # RFID / QR ID tags hanging off the ties
        box(f"{name}_tag{k}", (0.012, 0.08, 0.06), (c.x, c.y, c.z - 0.03), "cloth_white" if k % 3 else "cable_yellow", bevel=0)


# ------------------------------------------------------------------ trays, racks, equipment

def ladder_tray(name, x_wall, side, y0, y1, z, width=0.5, cables=(), seed=0):
    """Cable ladder along y on a wall at x_wall, reaching `side` (+1/-1) into the channel, rungs at z.
    cables: [(mat, r)] laid side by side across the tray."""
    items = []
    xi, xo = x_wall + side * 0.03, x_wall + side * width
    xm = (xi + xo) / 2
    for a, b in split([(0, y0, 0), (0, y1, 0)]):
        ym, ln = (a.y + b.y) / 2, b.y - a.y
        for xx in (xi, xo):
            items.append(("steel", (xx, ym, z - 0.02), (0.025, ln - 0.01, 0.09)))
    k = 0
    y = y0 + 0.15
    while y < y1:
        items.append(("steel", (xm, y, z - 0.02), (width - 0.03, 0.035, 0.02)))
        if k % 5 == 0:  # wall bracket with a strut
            items.append(("frame_dark", (xm, y, z - 0.08), (width, 0.05, 0.06)))
            items.append(("frame_dark", (x_wall + side * 0.03, y, z - 0.4), (0.04, 0.06, 0.4)))
        y += 0.3
        k += 1
    G._boxes_mesh(name, items)
    rnd = random.Random(seed)
    x = xi + side * 0.04
    for i, (mat, r) in enumerate(cables):
        x += side * (r + 0.004)
        tubes(f"{name}_c{i}", [((x, a.y, z + r), (x, b.y, z + r), r) for a, b in split([(0, y0, 0), (0, y1, 0)])], mat, verts=8 if r > 0.02 else 6)
        x += side * (r + 0.004 + rnd.uniform(0, 0.01))


def cable_rack(name, x_wall, side, y0, y1, z0, z1, tiers, arm=0.6, pitch=2.0):
    """Wall-mounted C-channel uprights with cantilever arms at every tier."""
    items = []
    y = y0 + pitch / 2
    while y < y1:
        items.append(("frame_dark", (x_wall + side * 0.04, y, z0), (0.06, 0.08, z1 - z0)))
        for z in tiers:
            items.append(("steel", (x_wall + side * arm / 2, y, z - 0.05), (arm, 0.06, 0.05)))
            items.append(("steel", (x_wall + side * (arm - 0.02), y, z), (0.03, 0.06, 0.08)))
        y += pitch
    G._boxes_mesh(name, items)


def smart_cabinet(name, loc, face, screen="screen_diag", w=1.0, d=0.5, h=1.5):
    """Diagnostics cabinet: white body, screen, status LEDs, a row of smart connectors with patch leads."""
    x, y, z = loc
    rz = face + math.pi / 2  # local x along the front
    at = _at(loc, face)  # local +x = out of the front
    box(f"{name}_plinth", (d, w, 0.1), at(0, 0, 0), "darkgray", bevel=0.01, rot=(0, 0, face))
    box(f"{name}_body", (d, w, h), at(0, 0, 0.1), "robot_white", bevel=0.03, rot=(0, 0, face))
    box(f"{name}_vent", (d * 0.8, w * 0.8, 0.06), at(0, 0, h + 0.1), "panel_grey", bevel=0.01, rot=(0, 0, face))
    M.screen_at(f"{name}_scr", (w * 0.55, w * 0.38), at(d / 2 + 0.01, -w * 0.12, 0.1 + h * 0.72), face, screen, bezel=0.02, depth=0.03)
    for k, mat in enumerate(("led_green", "led_green", "led_cyan", "led_red" if "_a" in name else "led_green")):
        box(f"{name}_led{k}", (0.02, 0.04, 0.04), at(d / 2 + 0.01, w * 0.3, 0.1 + h * 0.86 - k * 0.07), mat, bevel=0, rot=(0, 0, face))
    for k in range(8):  # smart connectors (data + power through one cable)
        dy = -w * 0.38 + k * w * 0.1
        box(f"{name}_port{k}", (0.03, 0.05, 0.05), at(d / 2 + 0.015, dy, 0.1 + h * 0.36), "bezel", bevel=0, rot=(0, 0, face))
        box(f"{name}_boot{k}", (0.07, 0.035, 0.035), at(d / 2 + 0.06, dy, 0.1 + h * 0.36 + 0.008), "duct_blue" if k % 2 else "cloth_white", bevel=0, rot=(0, 0, face))
        lead = bezier(at(d / 2 + 0.1, dy, 0.1 + h * 0.36 + 0.025), at(d / 2 + 0.3, dy, 0.1 + h * 0.2), at(d / 2 + 0.25, dy, 0.1 + h * 0.05), at(d / 2 + 0.05, dy, 0.06), 6)
        tubes(f"{name}_lead{k}", [(a, b, 0.012) for a, b in zip(lead, lead[1:])], "duct_blue" if k % 2 else "cloth_white", verts=6)


def gland_panel(name, loc, face, cols=8, rows=5, pitch=0.26):
    """Wall panel of round cable glands with ID labels (the organised connection wall of the artwork)."""
    at = _at(loc, face)
    w, h = cols * pitch + 0.2, rows * pitch + 0.25
    box(f"{name}_panel", (0.05, w, h), at(0.025, 0, 0), "panel_grey", bevel=0.01, rot=(0, 0, face))
    rim, core, leads = [], [], []
    for r in range(rows):
        for c in range(cols):
            p = Vector(at(0.05, -w / 2 + 0.1 + (c + 0.5) * pitch, 0.2 + (r + 0.5) * pitch))
            n = Vector((math.cos(face), math.sin(face), 0))
            rim.append((p, p + n * 0.05, 0.09))
            core.append((p + n * 0.05, p + n * 0.07, 0.05))
            leads.append((p + n * 0.06 + Vector((0, 0, -0.02)), Vector(at(0.12, -w / 2 + 0.1 + (c + 0.5) * pitch, -0.02)) + n * 0.0, 0.018))
    tubes(f"{name}_rim", rim, "steel", verts=16)
    tubes(f"{name}_core", core, "bezel", verts=12)
    by = {}
    for k, s in enumerate(leads):
        by.setdefault(("duct_blue", "cloth_white", "cable_black")[k % 3], []).append(s)
    for mat, segs in by.items():
        tubes(f"{name}_lead_{mat}", segs, mat, verts=6)
    for r in range(rows):
        box(f"{name}_labels{r}", (0.01, w - 0.2, 0.04), at(0.055, 0, 0.2 + r * pitch + 0.02), "cloth_white", bevel=0, rot=(0, 0, face))


def cable_coil(name, loc, r=0.55, turns=5, colours=("cable_red", "duct_blue", "cable_yellow", "duct_green", "duct_orange")):
    x, y, z = loc
    for k in range(turns):
        rr = r - k * 0.035
        pts = [(x + math.cos(a * math.tau / 20) * rr, y + math.sin(a * math.tau / 20) * rr, z + 0.03 + (k % 2) * 0.05) for a in range(21)]
        tubes(f"{name}_t{k}", [(a, b, 0.03) for a, b in zip(pts, pts[1:])], colours[k % len(colours)], verts=6)


def rail_robot(name):
    """Tunnel inspection robot hanging under a monorail, built at the origin (origin = rail underside), facing +x."""
    box(f"{name}_trolley", (0.5, 0.2, 0.12), (0, 0, -0.12), "darkgray", bevel=0.02)
    for dx in (-0.16, 0.16):
        cyl(f"{name}_wheel{dx}", 0.05, 0.05, (dx, 0.1, -0.05), "black", verts=10, rot=(math.pi / 2, 0, 0))
    box(f"{name}_body", (0.62, 0.34, 0.34), (0, 0, -0.48), "robot_white", bevel=0.05)
    box(f"{name}_band", (0.64, 0.36, 0.05), (0, 0, -0.36), "led_cyan", bevel=0)
    box(f"{name}_stem", (0.06, 0.06, 0.12), (0.14, 0, -0.6), "darkgray", bevel=0)
    sphere(f"{name}_gimbal", 0.1, (0.14, 0, -0.66), "darkgray", subdiv=2)
    sphere(f"{name}_lens", 0.045, (0.23, 0, -0.66), "led_cyan", subdiv=1)
    cyl(f"{name}_ant", 0.01, 0.2, (-0.2, 0.1, -0.16), "black", verts=6)


# ------------------------------------------------------------------ people

def hat(name, loc):
    x, y, z = loc
    sphere(f"{name}_hat", 0.13, (x, y, z), "white", scale=(1.05, 1.0, 0.7), subdiv=2)
    cyl(f"{name}_brim", 0.155, 0.02, (x, y, z - 0.03), "white", verts=16)


def vest(name, loc, rot_z, base):
    """Reflective bands round a hi-vis vest (torso of tkc_lib.human sits at base..base+0.6)."""
    for k, dz in enumerate((0.18, 0.34)):
        box(f"{name}_band{k}", (0.27, 0.44, 0.045), (loc[0], loc[1], loc[2] + base + dz), "steel", bevel=0.01, rot=(0, 0, rot_z))


def crew(name, loc, rot_z=0.0, seed=0, pose="stand"):
    """Street-works crew member: orange hi-vis, reflective bands, white hard hat."""
    L.human(name, loc, rot_z=rot_z, seed=seed, pose=pose, outfit="crew")
    base = 0.52 if pose == "sit" else 0.82
    vest(name, loc, rot_z, base)
    hat(name, (loc[0], loc[1], loc[2] + base + 0.86))


def crew_carry(prefix):
    """walker(carry=...) builds this at the walker's origin: vest bands and a hard hat."""
    vest(prefix, (0, 0, 0), 0.0, 0.82)
    hat(prefix, (0, 0, 1.68))


# ------------------------------------------------------------------ street works

def excavator(name, loc, rot_z=0.0, reach=5.6):
    """Tracked excavator facing +x of rot_z, boom lowered towards a pit `reach` metres ahead."""
    at = _at(loc, rot_z)
    r = (0, 0, rot_z)
    for side in (-1, 1):
        L.prism(f"{name}_track{side}", [(-2.0, 0.0), (2.0, 0.0), (2.3, 0.45), (2.0, 0.85), (-2.0, 0.85), (-2.3, 0.45)], 0.6, at(0, side * 1.05, 0), "cable_black", rot_z=rot_z, bevel=0.05)
        for k in range(5):
            cyl(f"{name}_roller{side}{k}", 0.2, 0.62, at(-1.6 + k * 0.8, side * 1.05 + 0.31, 0.3), "darkgray", verts=12, rot=(math.pi / 2, 0, rot_z))
    box(f"{name}_under", (3.2, 1.6, 0.35), at(0, 0, 0.55), "darkgray", bevel=0.04, rot=r)
    cyl(f"{name}_slew", 0.9, 0.2, at(0, 0, 0.9), "darkgray", verts=24)
    box(f"{name}_deck", (3.4, 2.4, 0.3), at(-0.3, 0, 1.1), "forklift", bevel=0.05, rot=r)
    box(f"{name}_engine", (1.9, 2.3, 0.85), at(-1.0, -0.05, 1.4), "forklift", bevel=0.08, rot=r)
    box(f"{name}_weight", (0.55, 2.4, 0.95), at(-1.85, 0, 1.2), "darkgray", bevel=0.12, rot=r)
    box(f"{name}_grille", (0.9, 0.02, 0.4), at(-1.0, 1.16, 1.6), "darkgray", bevel=0, rot=r)
    box(f"{name}_cab", (1.3, 0.95, 1.55), at(0.55, 0.68, 1.4), "forklift", bevel=0.06, rot=r)
    box(f"{name}_glass", (1.1, 0.97, 1.05), at(0.65, 0.68, 1.75), "carglass", bevel=0.02, rot=r)
    box(f"{name}_glassf", (0.02, 0.8, 1.0), at(1.21, 0.68, 1.78), "carglass", bevel=0, rot=r)
    box(f"{name}_beacon", (0.14, 0.14, 0.12), at(0.3, 0.68, 2.95), "orange", bevel=0.02, rot=r)
    # boom rises from the front of the deck, stick drops into the pit
    fwd = Vector((math.cos(rot_z), math.sin(rot_z), 0))
    pivot = Vector(at(0.9, -0.35, 1.6))
    elbow = pivot + fwd * (reach * 0.52) + Vector((0, 0, 2.6))
    wrist = pivot + fwd * reach + Vector((0, 0, -1.6))
    knee = pivot.lerp(elbow, 0.5) + Vector((0, 0, 0.45))
    tubes(f"{name}_boom", [(pivot, knee, 0.26), (knee, elbow, 0.26)], "forklift", verts=12)
    tubes(f"{name}_stick", [(elbow + fwd * 0.2, wrist, 0.19)], "forklift", verts=12)
    tubes(f"{name}_ram", [(pivot + fwd * 0.3 + Vector((0, 0, -0.35)), knee + Vector((0, 0, -0.2)), 0.09), (knee + Vector((0, 0, 0.25)), elbow + Vector((0, 0, 0.35)) - fwd * 0.2, 0.08)], "steel", verts=10)
    sphere(f"{name}_joint", 0.3, tuple(elbow), "forklift", subdiv=2)
    box(f"{name}_bucket", (0.9, 1.0, 0.7), (wrist.x, wrist.y, wrist.z - 0.55), "darkgray", bevel=0.06, rot=r)
    for k in range(4):
        box(f"{name}_tooth{k}", (0.12, 0.08, 0.12), (wrist.x + fwd.x * 0.35 - fwd.y * (k - 1.5) * 0.2, wrist.y + fwd.y * 0.35 + fwd.x * (k - 1.5) * 0.2, wrist.z - 0.65), "steel", bevel=0, rot=r)


def water_barrier(name, loc, rot_z=0.0, colour="orange"):
    at = _at(loc, rot_z)
    L.prism(f"{name}", [(-0.28, 0.0), (0.28, 0.0), (0.12, 0.8), (-0.12, 0.8)], 1.9, at(0, 0, 0), colour, rot_z=rot_z + math.pi / 2, bevel=0.04)
    for side in (-1, 1):
        box(f"{name}_strip{side}", (1.7, 0.03, 0.1), at(0, side * 0.215, 0.35), "white", bevel=0, rot=(0, 0, rot_z))


def cone(name, loc):
    x, y, z = loc
    box(f"{name}_foot", (0.36, 0.36, 0.04), (x, y, z), "cable_black", bevel=0.01)
    cyl(f"{name}_body", 0.13, 0.62, (x, y, z + 0.04), "orange", verts=12, r2=0.03)
    cyl(f"{name}_band", 0.095, 0.1, (x, y, z + 0.28), "white", verts=12, r2=0.075)


def cable_drum(name, loc, rot_z=0.0, colour="duct_orange"):
    """Cable drum on a two-wheel trailer; the drum axle runs along local y."""
    at = _at(loc, rot_z)
    r = (0, 0, rot_z)
    box(f"{name}_chassis", (2.8, 1.6, 0.18), at(0, 0, 0.5), "darkgray", bevel=0.02, rot=r)
    box(f"{name}_hitch", (1.4, 0.12, 0.1), at(2.0, 0, 0.55), "darkgray", bevel=0, rot=r)
    for side in (-1, 1):
        cyl(f"{name}_wheel{side}", 0.38, 0.25, at(0, side * 0.95 + 0.125, 0.38), "tyre", verts=20, rot=(math.pi / 2, 0, rot_z))
        cyl(f"{name}_flange{side}", 0.95, 0.06, at(0, side * 0.62 + 0.03, 1.65), "wood", verts=32, rot=(math.pi / 2, 0, rot_z))
        box(f"{name}_stand{side}", (0.12, 0.08, 1.15), at(0, side * 0.72, 0.68), "safety_yellow", bevel=0, rot=r)
    cyl(f"{name}_wound", 0.78, 1.18, at(0, 0.59, 1.65), colour, verts=32, rot=(math.pi / 2, 0, rot_z))
    for k in range(6):
        cyl(f"{name}_turn{k}", 0.8, 0.05, at(0, -0.5 + k * 0.2 + 0.025, 1.65), colour, verts=32, rot=(math.pi / 2, 0, rot_z))


# ------------------------------------------------------------------ city

def apartment(name, x0, y0, x1, y1, floors, street, seed=0, body="facade_beige", z=0.16, balconies=True):
    """Mid-rise residential block: glazed core, white floor slabs, piers, shops on the ground floor facing the
    street (street=+1: street at +x), balconies with glass rails and planters on the street and front (-y) sides."""
    rnd = random.Random(seed)
    g, fh = 4.2, 3.2
    top = z + g + (floors - 1) * fh
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    items = []
    # glazed core (inset) and the ground-floor shop box set back further on the street side
    items.append(("tower_glass2", (cx, cy, z + g), (x1 - x0 - 0.6, y1 - y0 - 0.6, top - z - g - 0.3)))
    sx0, sx1 = (x0 + 0.3, x1 - 2.2) if street > 0 else (x0 + 2.2, x1 - 0.3)
    items.append(("facade_warm", ((sx0 + sx1) / 2, cy, z), (sx1 - sx0, y1 - y0 - 0.6, g)))
    for k in range(1, floors + 1):  # slab under every upper floor, top flush with the floor level, and the roof
        items.append(("hosp_white", (cx, cy, min(z + g + (k - 1) * fh, top) - 0.28), (x1 - x0 + 0.3, y1 - y0 + 0.3, 0.28)))
    # piers on every face
    for side_y, yy in ((-1, y0), (1, y1)):
        n = max(2, round((x1 - x0) / 3.6))
        for i in range(n + 1):
            items.append((body, (x0 + (x1 - x0) * i / n, yy, z + g), (0.7, 0.5, top - z - g)))
    for xx in (x0, x1):
        n = max(2, round((y1 - y0) / 3.6))
        for i in range(n + 1):
            items.append((body, (xx, y0 + (y1 - y0) * i / n, z + g), (0.5, 0.7, top - z - g)))
    # ground-floor columns on the street side
    sxf = x1 if street > 0 else x0
    n = max(2, round((y1 - y0) / 4.5))
    for i in range(n + 1):
        items.append((body, (sxf, y0 + (y1 - y0) * i / n, z), (0.5, 0.5, g)))
    # roof: parapet, plant room, water tank, solar
    for (ax, ay, bx, by) in ((x0, y0, x1, y0 + 0.2), (x0, y1 - 0.2, x1, y1), (x0, y0, x0 + 0.2, y1), (x1 - 0.2, y0, x1, y1)):
        items.append(("hosp_white", ((ax + bx) / 2, (ay + by) / 2, top + 0.28), (bx - ax, by - ay, 0.9)))
    items.append(("panel_grey", (cx - (x1 - x0) * 0.2, cy + (y1 - y0) * 0.2, top + 0.28), (4.0, 3.0, 2.6)))
    for i in range(3):
        for j in range(2):
            items.append(("solar", (cx + 1.5 + i * 2.1, cy - 3.0 + j * 2.6, top + 0.6), (1.9, 2.2, 0.08)))
    G._boxes_mesh(name, items)
    cyl(f"{name}_tank", 1.0, 1.8, (cx - (x1 - x0) * 0.25, cy - (y1 - y0) * 0.22, top + 0.28), "robot_white", verts=20)
    A.bushes_along(f"{name}_roofgreen", A.rect_poly(cx + 3.0, cy + (y1 - y0) * 0.3, (x1 - x0) * 0.4, 1.4), spacing=0.8, z=top + 0.28, r=0.4, seed=seed)
    # shopfront glass just inside the columns, warm ceiling light in the shop, awning outside
    sx = sxf - street * 0.3
    box(f"{name}_shopglass", (0.04, y1 - y0 - 1.0, g - 0.6), (sx, cy, z), "glass", bevel=0)
    for i in range(int((y1 - y0 - 1.0) / 2.2) + 1):
        box(f"{name}_shopmull{i}", (0.08, 0.08, g - 0.6), (sx, y0 + 0.5 + i * 2.2, z), "frame_dark", bevel=0)
    box(f"{name}_shoplight", (0.6, y1 - y0 - 1.4, 0.04), (sxf - street * 1.2, cy, z + g - 0.36), "led_warm", bevel=0)
    box(f"{name}_awning", (1.6, y1 - y0 - 1.0, 0.1), (sxf + street * 0.8, cy, z + g - 0.75), "awning", bevel=0.02, rot=(0, -street * 0.12, 0))
    box(f"{name}_sign", (0.1, (y1 - y0) * 0.5, 0.45), (sxf + street * 0.3, cy, z + g - 0.55), "robot_white", bevel=0.02)
    if not balconies:
        return
    # balconies: street side (every bay) and front side (-y)
    faces = [("s", sxf, street)]
    bal, rails, planters, clumps = [], [], [], []
    for k in range(1, floors):
        zz = z + g + (k - 1) * fh
        for tag, xf, sgn in faces:
            n = max(2, round((y1 - y0) / 3.6))
            for i in range(n):
                if rnd.random() < 0.12:
                    continue
                yc = y0 + (y1 - y0) * (i + 0.5) / n
                bal.append(("hosp_white", (xf + sgn * 0.7, yc, zz - 0.22), (1.4, (y1 - y0) / n - 0.8, 0.22)))
                rails.append((xf + sgn * 1.38, yc, zz, (y1 - y0) / n - 0.8))
                if rnd.random() < 0.6:
                    planters.append(("woodlight", (xf + sgn * 1.2, yc, zz), (0.3, (y1 - y0) / n - 1.2, 0.35)))
                    for j in range(3):
                        clumps.append(((xf + sgn * 1.2, yc + (j - 1) * ((y1 - y0) / n - 1.4) / 3, zz + 0.55), rnd.uniform(0.28, 0.4), rnd.randint(0, 9999)))
        n = max(2, round((x1 - x0) / 3.6))
        for i in range(n):
            if rnd.random() < 0.35:
                continue
            xc = x0 + (x1 - x0) * (i + 0.5) / n
            bal.append(("hosp_white", (xc, y0 - 0.6, zz - 0.22), ((x1 - x0) / n - 0.8, 1.2, 0.22)))
            rails.append((xc, y0 - 1.18, zz, -((x1 - x0) / n - 0.8)))
            if rnd.random() < 0.5:
                clumps.append(((xc, y0 - 0.95, zz + 0.4), rnd.uniform(0.3, 0.42), rnd.randint(0, 9999)))
    G._boxes_mesh(f"{name}_bal", bal + planters)
    for k, (x, y, zz, ln) in enumerate(rails):  # ln < 0: rail runs along x (front balconies)
        box(f"{name}_rail{k}", (0.03, ln, 1.0) if ln > 0 else (-ln, 0.03, 1.0), (x, y, zz), "glass", bevel=0)
    if clumps:
        A.foliage(f"{name}_plants", clumps, subdiv=1)


def bus_shelter(name, loc, face):
    """Glass bus shelter; the open side faces `face` (towards the kerb)."""
    at = _at(loc, face)
    r = (0, 0, face)
    for dy in (-1.8, 1.8):
        box(f"{name}_post{dy}", (0.08, 0.08, 2.5), at(-0.6, dy, 0), "frame_dark", bevel=0, rot=r)
        box(f"{name}_side{dy}", (1.2, 0.03, 2.1), at(0, dy, 0.2), "glass", bevel=0, rot=r)
    box(f"{name}_back", (0.03, 3.6, 2.1), at(-0.6, 0, 0.2), "glass", bevel=0, rot=r)
    box(f"{name}_roof", (1.5, 4.0, 0.12), at(-0.1, 0, 2.5), "robot_white", bevel=0.02, rot=r)
    box(f"{name}_bench", (0.4, 2.2, 0.06), at(-0.35, 0, 0.45), "wood", bevel=0.01, rot=r)
    M.screen_at(f"{name}_ad", (0.8, 1.3), at(-0.56, 1.3, 1.2), face, "screen_ad", bezel=0.04)
