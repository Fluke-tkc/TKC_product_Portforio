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


# ------------------------------------------------------------------ back-row landmarks (fronts face -y)

def _segments(z0, h, step=3.0):
    """(foot, height) pieces of a tall member, so each piece is small enough to bake vertex-lit."""
    return [(z0 + k * step, min(step, h - k * step)) for k in range(int(h / step) + 1) if h - k * step > 0.2]


def hub_tower(name, x, y, w, d, h, glass, label, accent, screen, seed=1, style=0):
    """Operations tower: an A.office_tower whose roof is a drone port (two pads, a parked delivery drone, a
    drone-in-a-box dock, a telematics mast with dishes), its name on the parapet and a media screen showing
    `screen` hung on the upper shaft."""
    import tkc_auto as T  # imported here: tkc_auto imports this module at load time

    z_up, zr = A.office_tower(name, x, y, w, d, h, glass=glass, seed=seed, style=style, roof="deck")
    w2, d2 = w - 1.8, d - 1.8
    front = y - d2 / 2
    L.text_mesh(f"{name}_label", label, (x, front - 0.16, zr + 0.22), 0.72, 0.06, accent, resolution=3)
    sw = min(6.4, w2 - 1.6)
    sh = sw * 0.6
    zc = z_up + 1.3 + sh / 2  # clear of the terrace hedge below
    M.screen_at(f"{name}_media", (sw, sh), (x, front - 0.45, zc), -math.pi / 2, screen, bezel=0.12, depth=0.2)
    for sx in (-1, 1):
        for sz in (-1, 1):
            box(f"{name}_media_arm{sx + 1}{sz + 1}", (0.12, 0.4, 0.12), (x + sx * (sw / 2 - 0.4), front - 0.2, zc + sz * (sh / 2 - 0.3)), "frame_dark", bevel=0)
    s = min(2.8, d2 - 0.4)
    T.drone_pad(f"{name}_pad0", (x - w2 / 4, y, zr), s)
    T.drone_pad(f"{name}_pad1", (x + w2 / 4, y, zr), s)
    M.drone(f"{name}_drone", (x - w2 / 4, y, zr + 0.53), 0.4)
    bx = x + w2 / 4  # drone-in-a-box: open dock with its lid up
    box(f"{name}_dock", (1.3, 1.1, 0.6), (bx, y, zr + 0.06), "robot_white", bevel=0.05)
    box(f"{name}_dock_lid", (1.3, 0.06, 0.55), (bx, y + 0.58, zr + 0.62), "robot_white", bevel=0.02, rot=(-0.35, 0, 0))
    box(f"{name}_dock_led", (1.0, 0.02, 0.05), (bx, y - 0.56, zr + 0.4), "led_green", bevel=0)
    mx, my = x + w2 / 2 - 0.5, y + d2 / 2 - 0.5
    cyl(f"{name}_tmast", 0.09, 4.2, (mx, my, zr), "frame", verts=10)
    for k in range(3):
        a = k * math.tau / 3
        box(f"{name}_tant{k}", (0.12, 0.26, 0.9), (mx + math.cos(a) * 0.22, my + math.sin(a) * 0.22, zr + 3.2), "white", bevel=0.03, rot=(0, 0, a))
    for k, (dz, a) in enumerate(((1.6, 0.6), (2.4, 2.2))):  # satellite dishes looking up to the sky
        sphere(f"{name}_dish{k}", 0.42, (mx + math.cos(a) * 0.45, my + math.sin(a) * 0.45, zr + dz), "white", scale=(1, 1, 0.3), subdiv=2, rot=(0.7, 0, a + math.pi / 2))
    return zr


def asrs_warehouse(name, x, y, w, d, h, accent="truck_teal", seed=0, z0=0.16):
    """Automated high-bay warehouse (AS/RS): ribbed white cladding, a full-height glazed slot showing the pallet
    racks and a stacker crane carrying a pallet, a coloured band with AS/RS, a staff entrance with a canopy and
    solar panels on the roof."""
    rnd = random.Random(seed)
    y0 = y - d / 2
    sw, sd = 3.4, 2.4  # the glazed slot, near the left end
    sx = x - w / 2 + 1.4 + sw / 2
    lw, rw = sx - sw / 2 - (x - w / 2), (x + w / 2) - (sx + sw / 2)
    box(f"{name}_l", (lw, d, h), (x - w / 2 + lw / 2, y, z0), "white", bevel=0)
    box(f"{name}_r", (rw, d, h), (x + w / 2 - rw / 2, y, z0), "white", bevel=0)
    box(f"{name}_m", (sw, d - sd, h), (sx, y + sd / 2, z0), "white", bevel=0)
    box(f"{name}_slot_top", (sw, sd, 0.5), (sx, y0 + sd / 2, z0 + h - 0.5), "white", bevel=0)
    box(f"{name}_slot_glass", (sw, 0.04, h - 0.5), (sx, y0 + 0.02, z0), "glass", bevel=0)
    items = []
    for k in range(1, int((h - 0.5) / 3.0) + 1):  # transoms of the glazing
        items.append(("frame", (sx, y0 - 0.02, z0 + k * 3.0 - 0.06), (sw, 0.1, 0.12)))
    # cladding ribs on the front and both ends
    ribs = [(x - w / 2 + 0.35 + i * 0.7, y0 - 0.05) for i in range(int(lw / 0.7))]
    ribs += [(sx + sw / 2 + 0.35 + i * 0.7, y0 - 0.05) for i in range(int(rw / 0.7))]
    ribs += [(x + s * (w / 2 + 0.05), y0 + 0.35 + i * 0.7) for s in (-1, 1) for i in range(int(d / 0.7))]
    for rx, ry in ribs:
        for zb, hh in _segments(z0, h - 2.6):
            items.append(("white", (rx, ry, zb), (0.1, 0.1, hh)))
    # racks at the back of the slot, a stacker crane in front of them carrying a pallet
    ry = y0 + sd - 0.55
    for ux in (-sw / 2 + 0.1, 0.0, sw / 2 - 0.1):
        for dy in (-0.5, 0.5):
            for zb, hh in _segments(z0, h - 0.5):
                items.append(("rack_blue", (sx + ux, ry + dy, zb), (0.09, 0.09, hh)))
    for lv in range(int((h - 1.6) / 1.55)):
        z = z0 + 0.2 + lv * 1.55
        for dy in (-0.5, 0.5):
            items.append(("rack_orange", (sx, ry + dy, z), (sw - 0.1, 0.08, 0.12)))
        for dx in (-0.8, 0.8):
            if rnd.random() < 0.85:
                pallet_load(rnd, lambda a, b, c: (sx + a, ry + b, c), dx, 0.0, z + 0.12, items)
    cy = y0 + 0.7
    for zb, hh in _segments(z0, h - 0.6):
        items.append(("safety_yellow", (sx - 0.9, cy, zb), (0.36, 0.36, hh)))
    items.append(("safety_yellow", (sx, cy, z0), (sw - 0.2, 0.5, 0.3)))
    items.append(("safety_yellow", (sx, cy, z0 + h - 0.95), (sw - 0.2, 0.4, 0.3)))
    zc = z0 + round(h * 0.55 / 1.55) * 1.55 + 0.2
    items.append(("safety_yellow", (sx - 0.2, cy, zc - 0.3), (1.6, 0.9, 0.3)))
    pallet_load(rnd, lambda a, b, c: (sx - 0.1 + a, cy + b, c), 0.0, 0.0, zc, items)
    _boxes_mesh(f"{name}_kit", items)
    sphere(f"{name}_crane_led", 0.1, (sx - 0.9, cy - 0.2, zc + 0.2), "led_red", subdiv=1)
    # band with lettering, coping, entrance, solar roof
    box(f"{name}_band", (w + 0.12, d + 0.12, 1.8), (x, y, z0 + h - 2.6), accent, bevel=0)
    box(f"{name}_coping", (w + 0.16, d + 0.16, 0.25), (x, y, z0 + h), "panel_grey", bevel=0)
    L.text_mesh(f"{name}_label", "AS/RS", (sx + sw / 2 + rw / 2, y0 - 0.08, z0 + h - 2.35), 1.3, 0.06, "robot_white", resolution=3)
    ex = x + w / 2 - rw / 2
    box(f"{name}_door", (1.8, 0.08, 2.5), (ex, y0 - 0.04, z0), "frame_dark", bevel=0.01)
    box(f"{name}_canopy", (2.8, 1.5, 0.12), (ex, y0 - 0.75, z0 + 2.9), "panel_grey", bevel=0.02)
    for s in (-1, 1):
        cyl(f"{name}_canopy_col{s + 1}", 0.06, 2.9, (ex + s * 1.2, y0 - 1.35, z0), "silver", verts=10)
    for rr in range(2):
        for cc in range(int((w - 1.2) / 1.2)):
            box(f"{name}_pv{rr}{cc}", (1.1, 1.4, 0.05), (x - w / 2 + 1.2 + cc * 1.2, y - d / 4 + rr * 2.0, z0 + h + 0.35), "solar", bevel=0.015, rot=(0.35, 0, 0))


def cold_store(name, x, y, w, d, h, accent="brand", z0=0.16):
    """Cold-chain distribution centre: insulated white panels on a dock-height concrete plinth, a band with its
    name and temperature, an IoT temperature screen, a staff entrance, insulated dock doors on the +x side,
    refrigeration condensers and pipework on the roof and a row of solar panels."""
    y0 = y - d / 2
    box(f"{name}_plinth", (w + 0.1, d + 0.1, 1.0), (x, y, z0), "concrete", bevel=0)
    box(f"{name}_body", (w, d, h - 1.0), (x, y, z0 + 1.0), "white", bevel=0.04)
    items = []
    for k in range(1, int((h - 2.8) / 1.1) + 1):  # panel joints
        z = z0 + 1.0 + k * 1.1
        items.append(("panel_grey", (x, y0 - 0.01, z), (w - 0.1, 0.04, 0.04)))
        for s in (-1, 1):
            items.append(("panel_grey", (x + s * (w / 2 + 0.01), y, z), (0.04, d - 0.1, 0.04)))
    _boxes_mesh(f"{name}_joints", items)
    top = z0 + h
    box(f"{name}_band", (w + 0.12, d + 0.12, 1.5), (x, y, top - 1.5), accent, bevel=0)
    L.text_mesh(f"{name}_label", "COLD CHAIN", (x - 1.2, y0 - 0.08, top - 1.3), 0.95, 0.06, "robot_white", resolution=3)
    L.text_mesh(f"{name}_temp_label", "-25 °C", (x + w / 2 - 1.6, y0 - 0.08, top - 1.25), 0.8, 0.06, "robot_white", resolution=3)
    M.screen_at(f"{name}_temp", (2.2, 1.3), (x + w / 2 - 2.0, y0 - 0.07, z0 + 4.4), -math.pi / 2, "screen_iot", bezel=0.06, depth=0.08)
    ex = x - w / 2 + 2.0
    box(f"{name}_door", (1.6, 0.08, 2.4), (ex, y0 - 0.04, z0), "frame_dark", bevel=0.01)
    box(f"{name}_canopy", (2.6, 1.4, 0.12), (ex, y0 - 0.7, z0 + 2.8), "panel_grey", bevel=0.02)
    for s in (-1, 1):
        cyl(f"{name}_canopy_col{s + 1}", 0.06, 2.8, (ex + s * 1.1, y0 - 1.25, z0), "silver", verts=10)
    for k, dy in enumerate((-d / 4, d / 4)):
        dock_door(f"{name}_dock{k}", x + w / 2, y + dy, z0 + 1.0, width=2.2, height=2.8, open_=False, face=1)
    for i in range(max(2, int((w - 1.0) / 2.7))):  # refrigeration condensers, two fans each
        cx = x - w / 2 + 1.6 + i * 2.7
        box(f"{name}_cond{i}", (2.2, 1.1, 0.9), (cx, y + d / 4, top), "panel_grey", bevel=0.03)
        for k in (-1, 1):
            cyl(f"{name}_cond{i}_fan{k + 1}", 0.38, 0.06, (cx + k * 0.52, y + d / 4, top + 0.9), "frame_dark", verts=18)
            cyl(f"{name}_cond{i}_hub{k + 1}", 0.1, 0.08, (cx + k * 0.52, y + d / 4, top + 0.9), "steel", verts=10)
    for k, dz in enumerate((0.25, 0.45)):  # refrigerant lines along the roof and down the +x wall
        py = y + d / 4 - 0.8 - k * 0.2
        cyl(f"{name}_pipe{k}", 0.07, w - 1.2, (x - w / 2 + 0.6, py, top + dz), "silver", verts=10, rot=(0, math.pi / 2, 0))
        cyl(f"{name}_drop{k}", 0.07, h - 1.0 + dz, (x + w / 2 + 0.12, py, z0 + 1.0), "silver", verts=10)
    for cc in range(int((w - 1.2) / 1.2)):
        box(f"{name}_pv{cc}", (1.1, 1.3, 0.05), (x - w / 2 + 1.2 + cc * 1.2, y - d / 4, top + 0.3), "solar", bevel=0.015, rot=(0.35, 0, 0))
