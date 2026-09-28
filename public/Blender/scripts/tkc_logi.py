"""Smart-logistics props for the dioramas (built on tkc_lib / tkc_arch / tkc_med).

Conventions as in tkc_lib: loc = bottom centre, rot_z = heading (vehicles face local +x), `face` = compass
angle a screen looks towards; screens use materials named screen_* (drawn in src/three/model/screens.js).
"""
import math
import random

import bmesh
from mathutils import Matrix, Vector

import tkc_arch as A
import tkc_lib as L
import tkc_med as M
from tkc_lib import box, cyl, sphere

CARTONS = ("carton", "carton", "carton2", "carton", "wrap")


def _at(loc, rot_z):
    x, y, z = loc
    c, s = math.cos(rot_z), math.sin(rot_z)
    return lambda dx, dy, dz: (x + c * dx - s * dy, y + s * dx + c * dy, z + dz)


def _boxes_mesh(name, items, rot_z=0.0):
    """Many boxes as one mesh per material: items = [(mat, centre_bottom, size)]."""
    bms = {}
    for mat, (x, y, z), (sx, sy, sz) in items:
        bm = bms.setdefault(mat, bmesh.new())
        g = bmesh.ops.create_cube(bm, size=1.0)
        bmesh.ops.scale(bm, vec=Vector((sx, sy, sz)), verts=g["verts"])
        bmesh.ops.rotate(bm, cent=(0, 0, 0), matrix=Matrix.Rotation(rot_z, 3, "Z"), verts=g["verts"])
        bmesh.ops.translate(bm, vec=Vector((x, y, z + sz / 2)), verts=g["verts"])
    return [L._finish(bm, f"{name}_{mat}", mat) for mat, bm in bms.items()]


# ------------------------------------------------------------------ storage

def pallet_load(rnd, at, dx, dy, z, items):
    """A pallet with a stack of cartons (or a wrapped block) at local (dx, dy), height z."""
    items.append(("pallet_wood", at(dx, dy, z), (1.2, 1.0, 0.15)))
    if rnd.random() < 0.3:
        items.append(("wrap", at(dx, dy, z + 0.15), (1.16, 0.96, rnd.uniform(0.7, 1.2))))
        return
    for i in range(2):
        for j in range(2):
            for k in range(rnd.randint(1, 3)):
                items.append((rnd.choice(CARTONS[:4]), at(dx - 0.29 + i * 0.58, dy - 0.24 + j * 0.48, z + 0.15 + k * 0.4), (0.55, 0.45, 0.38)))


def pallet_rack(name, x, y0, y1, depth=1.1, levels=4, pitch=1.55, seed=0, fill=0.8, z0=0.0):
    """Selective pallet racking along y at x standing on z0: blue uprights, orange beams, pallets on every level."""
    rnd = random.Random(seed)
    items = []
    bays = max(1, int((y1 - y0) / 2.8))
    bay = (y1 - y0) / bays
    height = levels * pitch + 0.3
    for b in range(bays + 1):
        yy = y0 + b * bay
        for dx in (-depth / 2, depth / 2):
            items.append(("rack_blue", (x + dx, yy, z0), (0.09, 0.09, height)))
    for lv in range(levels):
        z = z0 + 0.12 + lv * pitch
        for dx in (-depth / 2, depth / 2):
            items.append(("rack_orange", (x + dx, (y0 + y1) / 2, z), (0.08, y1 - y0, 0.12)))
        for b in range(bays):
            for p in range(2):
                if rnd.random() < fill:
                    cy = y0 + (b + 0.25 + p * 0.5) * bay
                    pallet_load(rnd, lambda dx, dy, dz: (x + dx, cy + dy, dz), 0.0, 0.0, z + 0.12, items)
    return _boxes_mesh(name, items)


def carton_stack(name, loc, rot_z=0.0, seed=0, layers=3):
    rnd = random.Random(seed)
    items = []
    pallet_load(rnd, _at(loc, rot_z), 0.0, 0.0, 0.0, items)
    for k in range(layers - 3):
        items.append((rnd.choice(CARTONS[:4]), _at(loc, rot_z)(0, 0, 1.3 + k * 0.4), (0.55, 0.45, 0.38)))
    return _boxes_mesh(name, items, rot_z)


# ------------------------------------------------------------------ handling

def conveyor(name, path, z, width=0.8):
    """Belt conveyor following a closed polyline: dark belt, yellow side rails, legs."""
    pts = list(path) + [path[0]]
    for i, (a, b) in enumerate(zip(pts, pts[1:])):
        ln = math.hypot(b[0] - a[0], b[1] - a[1])
        if ln < 1e-3:
            continue
        ang = math.atan2(b[1] - a[1], b[0] - a[0])
        c = ((a[0] + b[0]) / 2, (a[1] + b[1]) / 2)
        n = (-math.sin(ang), math.cos(ang))
        box(f"{name}_belt{i}", (ln + 0.02, width, 0.08), (c[0], c[1], z - 0.08), "belt", bevel=0, rot=(0, 0, ang))
        for side in (-1, 1):
            box(f"{name}_rail{i}{side}", (ln + 0.02, 0.05, 0.14), (c[0] + n[0] * side * (width / 2 + 0.03), c[1] + n[1] * side * (width / 2 + 0.03), z - 0.1), "safety_yellow", bevel=0, rot=(0, 0, ang))
        for k in range(int(ln / 1.6) + 1):
            t = k / max(1, int(ln / 1.6))
            px, py = a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t
            for side in (-1, 1):  # legs from the floor (belt top is 0.9 above it)
                cyl(f"{name}_leg{i}_{k}{side}", 0.03, 0.8, (px + n[0] * side * width * 0.4, py + n[1] * side * width * 0.4, z - 0.9), "darkgray", verts=6)


def scan_tunnel(name, loc, rot_z=0.0):
    """Arch over the belt with scanner heads, LED halo and a status screen."""
    at = _at(loc, rot_z)
    r = (0, 0, rot_z)
    for side in (-1, 1):
        box(f"{name}_post{side}", (0.6, 0.18, 1.6), at(0, side * 0.72, 0), "robot_white", bevel=0.03, rot=r)
        box(f"{name}_led{side}", (0.5, 0.02, 1.2), at(0, side * 0.62, 0.2), "led_cyan", bevel=0, rot=r)
    box(f"{name}_top", (0.7, 1.62, 0.3), at(0, 0, 1.6), "robot_white", bevel=0.04, rot=r)
    box(f"{name}_topled", (0.5, 1.4, 0.02), at(0, 0, 1.59), "led_cyan", bevel=0, rot=r)
    M.screen_at(f"{name}_scr", (1.0, 0.56), at(0, 0, 2.3), rot_z - math.pi / 2, "screen_scan", bezel=0.04)
    cyl(f"{name}_mast", 0.03, 0.4, at(0, 0, 1.9), "silver", verts=6)


def dimensioner(name, loc, rot_z=0.0):
    """Cargo dimensioning gantry with 3D cameras over a weighing platform, plus a readout screen."""
    at = _at(loc, rot_z)
    r = (0, 0, rot_z)
    box(f"{name}_scale", (1.8, 1.6, 0.08), at(0, 0, 0), "darkgray", bevel=0.01, rot=r)
    box(f"{name}_scale_edge", (1.84, 1.64, 0.02), at(0, 0, 0.08), "safety_yellow", bevel=0, rot=r)
    for sx in (-1, 1):
        box(f"{name}_leg{sx}", (0.14, 0.14, 3.0), at(sx * 1.05, 0.9, 0), "robot_white", bevel=0.02, rot=r)
        box(f"{name}_legb{sx}", (0.14, 0.14, 3.0), at(sx * 1.05, -0.9, 0), "robot_white", bevel=0.02, rot=r)
    box(f"{name}_beam", (2.24, 2.0, 0.16), at(0, 0, 3.0), "robot_white", bevel=0.02, rot=r)
    for k, (dx, dy) in enumerate(((0, 0), (-0.8, 0.7), (0.8, -0.7))):
        box(f"{name}_cam{k}", (0.22, 0.14, 0.12), at(dx, dy, 2.88), "darkgray", bevel=0.02, rot=r)
        sphere(f"{name}_lens{k}", 0.04, at(dx, dy, 2.86), "led_cyan", subdiv=1)
    cyl(f"{name}_pole", 0.04, 1.6, at(1.5, -1.0, 0), "silver", verts=8)
    M.screen_at(f"{name}_scr", (0.9, 0.56), at(1.5, -1.02, 1.9), rot_z - math.pi / 2, "screen_volume", bezel=0.04)


def packing_station(name, loc, rot_z=0.0, seed=0):
    at = _at(loc, rot_z)
    r = (0, 0, rot_z)
    box(f"{name}_top", (1.8, 0.8, 0.05), at(0, 0, 0.88), "wood_desk", bevel=0.01, rot=r)
    for sx in (-1, 1):
        box(f"{name}_leg{sx}", (0.06, 0.7, 0.88), at(sx * 0.84, 0, 0), "darkgray", bevel=0, rot=r)
    box(f"{name}_shelf", (1.8, 0.3, 0.04), at(0, 0.3, 1.5), "darkgray", bevel=0, rot=r)
    M.screen_at(f"{name}_scr", (0.5, 0.3), at(-0.5, 0.25, 1.35), rot_z - math.pi / 2, "screen_scan", bezel=0.02)
    box(f"{name}_printer", (0.3, 0.25, 0.2), at(0.55, 0.2, 0.93), "robot_white", bevel=0.02, rot=r)
    box(f"{name}_parcel", (0.45, 0.35, 0.28), at(0.1, -0.1, 0.93), "carton", bevel=0.01, rot=r)
    L.human(f"{name}_p", at(0, -0.7, 0), rot_z=rot_z + math.pi / 2, seed=seed, outfit="worker")
    handheld(f"{name}_gun", at(0.3, -0.45, 1.05), rot_z + math.pi / 2)


def handheld(name, loc, heading):
    """Handheld barcode scanner (held at about hand height) with a red scan beam."""
    x, y, z = loc
    box(f"{name}_body", (0.08, 0.16, 0.06), (x, y, z), "darkgray", bevel=0.01, rot=(0, 0, heading))
    box(f"{name}_beam", (0.02, 0.1, 0.01), (x + math.cos(heading) * 0.12, y + math.sin(heading) * 0.12, z + 0.02), "led_red", bevel=0, rot=(0, 0, heading))


# ------------------------------------------------------------------ vehicles & robots

def forklift(name, loc, rot_z=0.0, seed=0, load=True):
    """Counterbalance forklift facing +x of rot_z with a driver and a pallet on the forks."""
    at = _at(loc, rot_z)
    r = (0, 0, rot_z)
    box(f"{name}_body", (1.6, 1.1, 0.9), at(-0.2, 0, 0.25), "forklift", bevel=0.08, rot=r)
    box(f"{name}_weight", (0.4, 1.12, 0.8), at(-0.95, 0, 0.3), "darkgray", bevel=0.08, rot=r)
    for dx in (-0.65, 0.4):
        for side in (-1, 1):
            cyl(f"{name}_w{dx}{side}", 0.3 if dx > 0 else 0.25, 0.22, at(dx, side * 0.44 + 0.11 * side, 0.3 if dx > 0 else 0.25), "tyre", verts=16, rot=(math.pi / 2, 0, rot_z))
    for side in (-1, 1):
        box(f"{name}_guard{side}", (0.06, 0.06, 1.3), at(0.15, side * 0.48, 1.15), "darkgray", bevel=0, rot=r)
        box(f"{name}_guardb{side}", (0.06, 0.06, 1.3), at(-0.75, side * 0.48, 1.15), "darkgray", bevel=0, rot=r)
        box(f"{name}_mast{side}", (0.1, 0.1, 2.4), at(0.75, side * 0.3, 0.1), "darkgray", bevel=0, rot=r)
        box(f"{name}_fork{side}", (1.1, 0.12, 0.05), at(1.35, side * 0.28, 0.15), "darkgray", bevel=0, rot=r)
    box(f"{name}_roof", (1.0, 1.02, 0.06), at(-0.3, 0, 2.45), "darkgray", bevel=0, rot=r)
    box(f"{name}_beacon", (0.1, 0.1, 0.08), at(-0.3, 0, 2.51), "orange", bevel=0, rot=r)
    L.human(f"{name}_driver", at(-0.35, 0, 0.55), rot_z=rot_z, seed=seed, pose="sit", outfit="worker")
    if load:
        box(f"{name}_pallet", (1.1, 1.0, 0.14), at(1.35, 0, 0.2), "pallet_wood", bevel=0, rot=r)
        box(f"{name}_goods", (1.0, 0.9, 0.8), at(1.35, 0, 0.34), "carton", bevel=0.02, rot=r)


def amr(name, loc, rot_z=0.0, seed=0):
    """Autonomous mobile robot carrying a shelf pod of totes, facing +x of rot_z."""
    rnd = random.Random(seed)
    at = _at(loc, rot_z)
    r = (0, 0, rot_z)
    box(f"{name}_base", (0.95, 0.75, 0.32), at(0, 0, 0.04), "orange", bevel=0.06, rot=r)
    box(f"{name}_led", (0.02, 0.5, 0.05), at(0.48, 0, 0.2), "led_cyan", bevel=0, rot=r)
    for sx in (-1, 1):
        for sy in (-1, 1):
            box(f"{name}_pod_leg{sx}{sy}", (0.05, 0.05, 1.5), at(sx * 0.42, sy * 0.33, 0.36), "rack_blue", bevel=0, rot=r)
    for k in range(4):
        box(f"{name}_pod_shelf{k}", (0.9, 0.72, 0.03), at(0, 0, 0.5 + k * 0.4), "rack_blue", bevel=0, rot=r)
        for t in range(2):
            box(f"{name}_tote{k}{t}", (0.38, 0.6, 0.24), at(-0.21 + t * 0.42, 0, 0.53 + k * 0.4), rnd.choice(("tote_blue", "tote_yellow", "carton")), bevel=0.01, rot=r)


def box_truck(name, loc, rot_z=0.0, paint="truck_teal", text="TKC LOGISTICS"):
    """Rigid box truck (about 8.4 m) facing +x of rot_z: cab, cargo box, six wheels, livery."""
    at = _at(loc, rot_z)
    r = (0, 0, rot_z)
    cab = L._arched(1.9, 4.2, 0.45, (3.3,), 0.55) + [(4.2, 1.5), (4.05, 2.2), (3.7, 2.9), (1.9, 2.95)]
    L.prism(f"{name}_cab", cab, 2.4, at(0, 0, 0), "robot_white", rot_z=rot_z, bevel=0.1)
    box(f"{name}_ws", (0.02, 2.1, 0.75), at(4.04, 0, 1.9), "carglass", bevel=0, rot=(0, -0.3, rot_z))
    for side in (-1, 1):
        box(f"{name}_sidewin{side}", (1.1, 0.02, 0.6), at(3.0, side * 1.21, 2.0), "carglass", bevel=0, rot=r)
    box(f"{name}_chassis", (6.6, 1.2, 0.35), at(-0.8, 0, 0.55), "darkgray", bevel=0, rot=r)
    box(f"{name}_box", (6.2, 2.5, 2.8), at(-1.3, 0, 0.9), paint, bevel=0.05, rot=r)
    box(f"{name}_door", (0.04, 2.3, 2.6), at(-4.42, 0, 1.0), "panel_grey", bevel=0, rot=r)
    for side in (-1, 1):
        box(f"{name}_stripe{side}", (6.0, 0.02, 0.3), at(-1.3, side * 1.26, 1.2), "robot_white", bevel=0, rot=r)
        L.text_mesh(f"{name}_txt{side}", text, at(-1.3, side * 1.27, 2.4), 0.42, 0.02, "robot_white", rot=(math.pi / 2, 0, rot_z + (0 if side < 0 else math.pi)))
        for dx in (-3.2, -2.1, 3.3):  # cylinders run along local -y once upright: offset so they centre on 1.05
            cyl(f"{name}_w{dx}{side}", 0.5, 0.34, at(dx, side * 1.05 + 0.17, 0.5), "tyre", verts=24, rot=(math.pi / 2, 0, rot_z), bevel=0.05)
    for dy in (-0.85, 0.85):
        box(f"{name}_hl{dy}", (0.04, 0.34, 0.16), at(4.2, dy, 0.85), "led_white", bevel=0, rot=r)
        box(f"{name}_tl{dy}", (0.04, 0.2, 0.2), at(-4.45, dy * 1.2, 0.95), "led_red", bevel=0, rot=r)


def pos_van(name, loc, rot_z=0.0):
    """Delivery van in the artwork's livery with a big POS lettering."""
    L.van(name, loc, rot_z, paint="truck_teal")
    at = _at(loc, rot_z)
    for side in (-1, 1):
        L.text_mesh(f"{name}_txt{side}", "POS", at(-0.8, side * 0.97, 1.05), 0.8, 0.03, "robot_white", rot=(math.pi / 2, 0, rot_z + (0 if side < 0 else math.pi)))


def container(name, loc, rot_z=0.0, colour="container_blue"):
    """20 ft shipping container with ribbed sides, long axis along local x."""
    at = _at(loc, rot_z)
    r = (0, 0, rot_z)
    box(f"{name}_body", (6.06, 2.44, 2.59), at(0, 0, 0), colour, bevel=0.03, rot=r)
    for k in range(14):
        for side in (-1, 1):
            box(f"{name}_rib{k}{side}", (0.12, 0.04, 2.3), at(-2.8 + k * 0.43, side * 1.23, 0.15), colour, bevel=0, rot=r)
    for side in (-1, 1):
        box(f"{name}_bar{side}", (0.05, 0.06, 2.4), at(3.04, side * 0.4, 0.1), "silver", bevel=0, rot=r)


# ------------------------------------------------------------------ building & site

def dock_door(name, x, y, z, width=3.2, height=3.6, open_=True, face=1):
    """Loading dock on a wall at x (facing +x when face=1): roll-up door, leveler, bumpers, traffic light."""
    fx = x + face * 0.05
    if open_:
        box(f"{name}_roll", (0.5, width + 0.2, 0.5), (fx, y, z + height), "panel_grey", bevel=0.05)
    else:
        box(f"{name}_panel", (0.06, width, height), (fx, y, z), "panel_grey", bevel=0)
        for k in range(8):
            box(f"{name}_rib{k}", (0.08, width, 0.03), (fx + face * 0.02, y, z + 0.3 + k * 0.42), "silver", bevel=0)
    box(f"{name}_frame_l", (0.1, 0.12, height + 0.3), (fx, y - width / 2 - 0.06, z), "safety_yellow", bevel=0)
    box(f"{name}_frame_r", (0.1, 0.12, height + 0.3), (fx, y + width / 2 + 0.06, z), "safety_yellow", bevel=0)
    box(f"{name}_leveler", (1.6, width - 0.3, 0.06), (x - face * 0.8, y, z - 0.03), "silver", bevel=0)
    for side in (-1, 1):
        box(f"{name}_bumper{side}", (0.2, 0.3, 0.4), (fx + face * 0.1, y + side * (width / 2 - 0.4), z - 0.55), "black", bevel=0.03)
    for k, mat in enumerate(("led_red", "led_green")):
        box(f"{name}_light{k}", (0.06, 0.2, 0.2), (fx + face * 0.04, y + width / 2 + 0.5, z + 1.6 + k * 0.26), mat if (k == 1) == open_ else "darkgray", bevel=0.02)


def chimney(name, x, y, h=22.0, r=1.1):
    cyl(f"{name}", r, h, (x, y, 0.16), "panel_grey", verts=24, r2=r * 0.8)
    for k in range(3):
        cyl(f"{name}_band{k}", r * 0.92 - k * 0.04 + 0.02, 0.8, (x, y, 0.16 + h - 3.0 - k * 2.4), "container_red" if k % 2 == 0 else "robot_white", verts=24)
