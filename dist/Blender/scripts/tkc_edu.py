"""Smart-learning props for the dioramas (built on tkc_lib / tkc_arch / tkc_med).

Conventions as in tkc_lib: loc = bottom centre, rot_z = heading, `face` = compass angle a screen looks
towards; screens use materials named screen_* (content drawn in the browser, src/three/model/screens.js).
"""
import math
import random

import bmesh
from mathutils import Matrix, Vector

import tkc_arch as A
import tkc_lib as L
import tkc_med as M
from tkc_lib import box, cyl, sphere

BOOK_COLOURS = ("flower_red", "flower_yellow", "sky_blue", "lime", "orange", "accent_blue", "flower_purple", "teal", "coral", "mint")


def _at(loc, rot_z):
    x, y, z = loc
    c, s = math.cos(rot_z), math.sin(rot_z)
    return lambda dx, dy, dz: (x + c * dx - s * dy, y + s * dx + c * dy, z + dz)


def tilted_screen(name, size, center, face, tilt, mat, back="bezel"):
    """Screen leaning back by `tilt` (tablet on a stand, laptop lid), with a dark back so it reads from behind."""
    L.plane(name, size, center, mat, rot=(math.pi / 2 - tilt, 0, face + math.pi / 2))
    if back:  # faces the other way, just behind the screen
        n = Vector((math.cos(face) * math.cos(tilt), math.sin(face) * math.cos(tilt), math.sin(tilt)))
        c = Vector(center) - n * 0.012
        L.plane(f"{name}_back", (size[0] + 0.02, size[1] + 0.02), tuple(c), back, rot=(math.pi / 2 + tilt, 0, face + math.pi * 1.5))


# ------------------------------------------------------------------ furniture

@L.lowpoly
def student_desk(name, loc, rot_z=0.0, w=1.3, d=0.62, top="wood_desk"):
    at = _at(loc, rot_z)
    r = (0, 0, rot_z)
    box(f"{name}_top", (w, d, 0.04), at(0, 0, 0.72), top, bevel=0.012, rot=r)
    box(f"{name}_apron", (w - 0.1, 0.03, 0.12), at(0, d / 2 - 0.06, 0.6), "darkgray", bevel=0, rot=r)
    for sx in (-1, 1):
        for sy in (-1, 1):
            cyl(f"{name}_leg{sx}{sy}", 0.022, 0.72, at(sx * (w / 2 - 0.06), sy * (d / 2 - 0.06), 0), "darkgray", verts=8)


@L.lowpoly
def school_chair(name, loc, rot_z=0.0, colour="teal"):
    """Moulded shell chair facing +x of rot_z."""
    at = _at(loc, rot_z)
    box(f"{name}_seat", (0.42, 0.42, 0.05), at(0.02, 0, 0.44), colour, bevel=0.02, rot=(0, 0, rot_z))
    box(f"{name}_back", (0.05, 0.42, 0.4), at(-0.2, 0, 0.5), colour, bevel=0.02, rot=(0, -0.15, rot_z))
    for sx in (-1, 1):
        for sy in (-1, 1):
            cyl(f"{name}_leg{sx}{sy}", 0.015, 0.44, at(sx * 0.17, sy * 0.17, 0), "darkgray", verts=6)


def seated_student(name, loc, rot_z, seed, gear=None, outfit=None, h=1.55):
    """Student on a school chair facing +x of rot_z; gear: None / 'vr' / 'phones'."""
    school_chair(f"{name}_chair", loc, rot_z, colour=random.Random(seed).choice(("teal", "coral", "sky_blue", "mint", "flower_yellow")))
    L.human(name, loc, rot_z=rot_z, seed=seed, pose="sit", h=h, outfit=outfit or random.Random(seed + 5).choice(("student", "student2", None)))
    k = h / 1.72
    head = _at(loc, rot_z)(0, 0, (0.52 + 0.78) * k)
    if gear == "vr":
        box(f"{name}_vr", (0.14, 0.24, 0.12), _at(head, rot_z)(0.12 * k, 0, -0.06), "robot_white", bevel=0.03, rot=(0, 0, rot_z))
        box(f"{name}_vr_led", (0.01, 0.18, 0.02), _at(head, rot_z)(0.195 * k, 0, 0.0), "led_cyan", bevel=0, rot=(0, 0, rot_z))
    elif gear == "phones":
        for side in (-1, 1):
            sphere(f"{name}_cup{side}", 0.055, _at(head, rot_z)(0, side * 0.12 * k, 0), "black", scale=(1, 0.6, 1), subdiv=1)
        box(f"{name}_band", (0.04, 0.26 * k, 0.03), _at(head, rot_z)(0, 0, 0.13 * k), "black", bevel=0, rot=(0, 0, rot_z))


def tablet_on_desk(name, loc, face, screen="screen_tablet"):
    """Tablet propped up on a desk top (loc = desk surface point)."""
    x, y, z = loc
    tilted_screen(name, (0.26, 0.18), (x, y, z + 0.1), face, 0.55, screen)


def laptop(name, loc, face, screen="screen_laptop"):
    x, y, z = loc
    box(f"{name}_base", (0.34, 0.24, 0.02), (x, y, z), "silver", bevel=0.005, rot=(0, 0, face + math.pi / 2))
    n = (math.cos(face), math.sin(face))
    tilted_screen(name, (0.32, 0.2), (x - n[0] * 0.13, y - n[1] * 0.13, z + 0.1), face, 0.25, screen, back="silver")


@L.lowpoly
def imac(name, loc, face, screen="screen_imac"):
    x, y, z = loc
    n = (math.cos(face), math.sin(face))
    rz = face + math.pi / 2
    box(f"{name}_foot", (0.2, 0.16, 0.01), (x, y, z), "silver", bevel=0, rot=(0, 0, rz))
    box(f"{name}_neck", (0.12, 0.03, 0.26), (x - n[0] * 0.06, y - n[1] * 0.06, z), "silver", bevel=0, rot=(0, 0, rz))
    box(f"{name}_body", (0.62, 0.03, 0.46), (x, y, z + 0.18), "robot_white", bevel=0.01, rot=(0, 0, rz))
    M.screen_at(name, (0.56, 0.32), (x + n[0] * 0.017, y + n[1] * 0.017, z + 0.47), face, screen, bezel=0)


def bookshelf(name, loc, rot_z=0.0, w=2.0, h=2.4, depth=0.36, seed=0, frame="wood_desk"):
    """Open shelf (front faces local -y) packed with colourful books, one mesh per book colour."""
    rnd = random.Random(seed)
    at = _at(loc, rot_z)
    r = (0, 0, rot_z)
    box(f"{name}_back", (w, 0.03, h), at(0, depth / 2 - 0.015, 0), frame, bevel=0, rot=r)
    for sx in (-1, 1):
        box(f"{name}_side{sx}", (0.04, depth, h), at(sx * (w / 2 - 0.02), 0, 0), frame, bevel=0, rot=r)
    shelves = max(3, int(h / 0.42))
    pitch = h / shelves
    for k in range(shelves + 1):
        box(f"{name}_shelf{k}", (w, depth, 0.03), at(0, 0, min(k * pitch, h - 0.03)), frame, bevel=0, rot=r)
    bms = {}
    for k in range(shelves):
        x = -w / 2 + 0.06
        while x < w / 2 - 0.1:
            bw = rnd.uniform(0.03, 0.07)
            bh = pitch * rnd.uniform(0.6, 0.85)
            if rnd.random() < 0.08:  # gap
                x += bw * 2
                continue
            col = rnd.choice(BOOK_COLOURS)
            bm = bms.setdefault(col, bmesh.new())
            g = bmesh.ops.create_cube(bm, size=1.0)
            bmesh.ops.scale(bm, vec=Vector((bw, depth * 0.8, bh)), verts=g["verts"])
            bmesh.ops.rotate(bm, cent=(0, 0, 0), matrix=Matrix.Rotation(rot_z, 3, "Z"), verts=g["verts"])
            p = at(x + bw / 2, -0.02, k * pitch + 0.03 + bh / 2)
            bmesh.ops.translate(bm, vec=Vector(p), verts=g["verts"])
            x += bw + 0.004
    for col, bm in bms.items():
        L._finish(bm, f"{name}_books_{col}", col)


@L.lowpoly
def beanbag(name, loc, colour="orange"):
    x, y, z = loc
    sphere(f"{name}_bag", 0.5, (x, y, z + 0.28), colour, scale=(1.0, 1.0, 0.58), subdiv=2)


@L.lowpoly
def podium(name, loc, face):
    x, y, z = loc
    rz = face + math.pi / 2
    box(f"{name}_body", (0.7, 0.5, 1.05), (x, y, z), "wood_desk", bevel=0.03, rot=(0, 0, rz))
    box(f"{name}_stripe", (0.72, 0.51, 0.08), (x, y, z + 0.3), "orange", bevel=0.01, rot=(0, 0, rz))
    tilted_screen(f"{name}_tab", (0.4, 0.28), (x, y, z + 1.14), face + math.pi, 0.9, "screen_tablet")


def ring_light(name, center, r, ceiling, cable_angles=(0.0, 2.094, 4.189)):
    """Suspended circular LED ring (the halo fixture from the artwork) hung from the structure above."""
    x, y, z = center
    M.disc_ring(f"{name}_led", r, r - 0.12, (x, y, z - 0.04), 0.05, "led_warm", n=64)
    M.disc_ring(f"{name}_body", r + 0.08, r - 0.2, (x, y, z + 0.04), 0.12, "robot_white", n=64)
    for k, a in enumerate(cable_angles):
        cyl(f"{name}_cable{k}", 0.012, ceiling - z - 0.1, (x + math.cos(a) * r, y + math.sin(a) * r, z + 0.1), "black", verts=6)


def duct(name, x0, x1, y, z, r=0.32):
    """Exposed round air duct along x with hanger straps."""
    d = cyl(f"{name}", r, x1 - x0, (x0, y, z), "silver", verts=20, rot=(0, math.pi / 2, 0))
    for k in range(int((x1 - x0) / 3) + 1):
        cyl(f"{name}_clamp{k}", r + 0.02, 0.06, (x0 + 0.3 + k * 3, y, z), "frame_dark", verts=20, rot=(0, math.pi / 2, 0))
    return d


# ------------------------------------------------------------------ assessment & LMS

def exam_pod(name, loc, seed, gear=None, panel="coral"):
    """Exam booth: desk facing +y with privacy panels, laptop facing the candidate, candidate on a chair."""
    x, y, z = loc
    student_desk(f"{name}_desk", (x, y, z), 0.0, w=1.1, d=0.6, top="robot_white")
    for sx in (-1, 1):
        box(f"{name}_side{sx}", (0.04, 0.8, 0.6), (x + sx * 0.57, y + 0.05, z + 0.74), panel, bevel=0.01)
    box(f"{name}_front", (1.18, 0.04, 0.6), (x, y + 0.33, z + 0.74), panel, bevel=0.01)
    box(f"{name}_led", (1.1, 0.02, 0.03), (x, y + 0.31, z + 1.36), "led_cyan", bevel=0)
    laptop(f"{name}_pc", (x, y + 0.08, z + 0.74), -math.pi / 2, "screen_lrn_exam")
    seated_student(f"{name}_s", (x, y - 0.55, z), math.pi / 2, seed, gear=gear)


def charging_cart(name, loc, rot_z=0.0):
    at = _at(loc, rot_z)
    r = (0, 0, rot_z)
    box(f"{name}_body", (1.0, 0.55, 1.0), at(0, 0, 0.08), "robot_white", bevel=0.04, rot=r)
    for k in range(8):
        box(f"{name}_tab{k}", (0.02, 0.32, 0.24), at(-0.4 + k * 0.11, 0, 1.08), ("sky_blue", "lime", "coral", "flower_purple")[k % 4], bevel=0, rot=r)
    box(f"{name}_led", (0.9, 0.02, 0.04), at(0, -0.28, 0.9), "led_green", bevel=0, rot=r)
    for sx in (-0.4, 0.4):
        for sy in (-0.2, 0.2):
            sphere(f"{name}_w{sx}{sy}", 0.05, at(sx, sy, 0.05), "black", subdiv=1)


# ------------------------------------------------------------------ outdoors

def basketball_court(name, x0, y0, x1, y1):
    """Court (long axis along x) with coloured keys, white lines and two hoops."""
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    box(f"{name}_surface", (x1 - x0, y1 - y0, 0.03), (cx, cy, 0.16), "court_blue", bevel=0)
    for side in (-1, 1):
        kx = cx + side * ((x1 - x0) / 2 - 2.4)
        box(f"{name}_key{side}", (4.8, 4.9, 0.004), (kx, cy, 0.19), "court_orange", bevel=0)
        A.ring(f"{name}_arc{side}", M.circle(1.85, 32, kx - side * 2.4, cy), M.circle(1.78, 32, kx - side * 2.4, cy), 0.192, 0.004, "paint_white")
        hx = cx + side * ((x1 - x0) / 2 - 0.4)
        cyl(f"{name}_pole{side}", 0.08, 3.1, (hx + side * 0.6, cy, 0.19), "darkgray", verts=12)
        box(f"{name}_arm{side}", (0.7, 0.08, 0.08), (hx + side * 0.25, cy, 3.1), "darkgray", bevel=0)
        box(f"{name}_board{side}", (0.05, 1.8, 1.05), (hx, cy, 2.75), "robot_white", bevel=0.01)
        box(f"{name}_square{side}", (0.06, 0.6, 0.45), (hx - side * 0.005, cy, 2.95), "cross_red", bevel=0)
        M.disc_ring(f"{name}_rim{side}", 0.25, 0.22, (hx - side * 0.3, cy, 3.05), 0.02, "orange", n=20)
    A.ring(f"{name}_lines", [(x0, y0), (x1, y0), (x1, y1), (x0, y1)], [(x0 + 0.08, y0 + 0.08), (x1 - 0.08, y0 + 0.08), (x1 - 0.08, y1 - 0.08), (x0 + 0.08, y1 - 0.08)], 0.19, 0.004, "paint_white")
    box(f"{name}_mid", (0.08, y1 - y0, 0.004), (cx, cy, 0.19), "paint_white", bevel=0)
    A.ring(f"{name}_centre", M.circle(1.8, 32, cx, cy), M.circle(1.72, 32, cx, cy), 0.192, 0.004, "paint_white")


def bleachers(name, x0, x1, y, rows=4, face_y=1):
    """Stepped aluminium stands along x, facing +y (face_y=1) or -y, with coloured seat boards."""
    cols = ("flower_red", "flower_yellow", "sky_blue", "lime")
    for k in range(rows):
        yy = y - face_y * k * 0.7
        box(f"{name}_step{k}", (x1 - x0, 0.7, 0.4 * (k + 1)), ((x0 + x1) / 2, yy, 0.16), "aluminium", bevel=0)
        box(f"{name}_seat{k}", (x1 - x0, 0.32, 0.05), ((x0 + x1) / 2, yy + face_y * 0.12, 0.16 + 0.4 * (k + 1)), cols[k % 4], bevel=0.01)


def school_bus(name, loc, rot_z=0.0):
    """Flat-front yellow school bus facing +x of rot_z (9 m): a window row of separate glass panes, a windscreen,
    seat rows with students inside, and a two-leaf folding door on the left (kerb) side ahead of the front wheels.
    The door leaves are built as {name}_door0_* / {name}_door1_* so the caller can hinge them (fold)."""
    at = _at(loc, rot_z)
    r = (0, 0, rot_z)
    hw, z0, zs, zt, zr = 1.22, 0.38, 1.42, 2.28, 2.92  # half width, body bottom, window sill, window top, roof
    rear_ax, front_ax = -2.7, 2.6
    # lower body: behind the door it is one piece with wheel arches; ahead of it the driver's side and a front cap
    # frame an open stairwell (two steps) on the left
    L.prism(f"{name}_body", L._arched(-4.5, 3.3, z0, (rear_ax, front_ax), 0.56) + [(3.3, zs), (-4.5, zs)], 2 * hw, at(0, 0, 0), "bus_yellow", rot_z=rot_z, bevel=0.06)
    box(f"{name}_drv", (1.2, 1.32, zs - z0), at(3.9, -0.56, z0), "bus_yellow", bevel=0.04, rot=r)
    box(f"{name}_cap", (0.3, 1.12, zs - z0), at(4.35, 0.66, z0), "bus_yellow", bevel=0.04, rot=r)
    box(f"{name}_step1", (0.86, 0.38, 0.18), at(3.75, 0.99, z0), "darkgray", bevel=0.01, rot=r)
    box(f"{name}_step2", (0.86, 0.5, 0.38), at(3.75, 0.55, z0), "darkgray", bevel=0.01, rot=r)
    box(f"{name}_well", (0.02, 1.1, zs - 0.76), at(3.31, 0.66, 0.76), "darkgray", bevel=0, rot=r)
    # window row: pillars between separate panes, glass set just inside them
    for side in (-1, 1):
        for k in range(9):
            box(f"{name}_pil{side}_{k}", (0.12, 0.06, zt - zs), at(-4.38 + k * 0.954, side * (hw - 0.03), zs), "bus_yellow", bevel=0.01, rot=r)
        for z, h in ((0.95, 0.08), (1.3, 0.06)):
            x0, x1 = -4.5, (3.3 if side > 0 else 4.5)
            box(f"{name}_rail{side}_{z}", (x1 - x0, 0.02, h), at((x0 + x1) / 2, side * (hw + 0.005), z), "black", bevel=0, rot=r)
    box(f"{name}_pil_fl", (0.26, 0.06, zt - zs), at(4.33, hw - 0.03, zs), "bus_yellow", bevel=0.01, rot=r)
    box(f"{name}_pil_fr", (0.12, 0.06, zt - zs), at(4.4, -(hw - 0.03), zs), "bus_yellow", bevel=0.01, rot=r)
    box(f"{name}_glass_l", (7.63, 0.02, zt - zs), at(-0.565, hw - 0.07, zs), "glass", bevel=0, rot=r)
    box(f"{name}_glass_r", (8.78, 0.02, zt - zs), at(0.01, -(hw - 0.07), zs), "glass", bevel=0, rot=r)
    box(f"{name}_glass_b", (0.02, 2.2, zt - zs), at(-4.47, 0, zs), "glass", bevel=0, rot=r)
    box(f"{name}_ws", (0.02, 2.24, zt - zs + 0.12), at(4.47, 0, zs - 0.12), "glass", bevel=0, rot=r)
    for x, w, mat in ((4.48, 0.04, "black"), (-4.48, 0.06, "bus_yellow")):  # windscreen / emergency-door posts
        box(f"{name}_post{x}", (w, 0.08, zt - zs), at(x, 0, zs), mat, bevel=0, rot=r)
    box(f"{name}_roof", (9.0, 2 * hw, zr - zt), at(0, 0, zt), "bus_yellow", bevel=0.12, segments=3, rot=r)
    for side in (-1, 1):
        L.text_mesh(f"{name}_txt{side}", "SCHOOL BUS", at(-0.4, side * (hw + 0.005), 2.46), 0.26, 0.02, "black", rot=(math.pi / 2, 0, rot_z + (0 if side < 0 else math.pi)), resolution=3)
    L.text_mesh(f"{name}_txt_f", "SCHOOL BUS", at(4.505, 0, 2.47), 0.2, 0.02, "black", rot=(math.pi / 2, 0, rot_z + math.pi / 2), resolution=3)
    # bumpers, lights, mirrors, the stop arm on the driver's side
    for x in (4.55, -4.55):
        box(f"{name}_bumper{x}", (0.14, 2.3, 0.24), at(x, 0, z0), "black", bevel=0.03, rot=r)
    box(f"{name}_grille", (0.02, 0.9, 0.22), at(4.51, 0, 0.62), "darkgray", bevel=0, rot=r)
    for dy in (-1, 1):
        box(f"{name}_hl{dy}", (0.03, 0.32, 0.16), at(4.51, dy * 0.82, 0.75), "led_white", bevel=0, rot=r)
        box(f"{name}_tl{dy}", (0.03, 0.2, 0.26), at(-4.51, dy * 0.95, 0.8), "led_red", bevel=0, rot=r)
        box(f"{name}_amber{dy}", (0.06, 0.2, 0.12), at(4.47, dy * 0.85, 2.72), "orange", bevel=0.01, rot=r)
        box(f"{name}_red{dy}", (0.06, 0.2, 0.12), at(-4.47, dy * 0.85, 2.72), "cross_red", bevel=0.01, rot=r)
        box(f"{name}_marm{dy}", (0.05, 0.3, 0.04), at(4.42, dy * 1.36, 2.05), "black", bevel=0, rot=r)
        box(f"{name}_mirror{dy}", (0.06, 0.12, 0.35), at(4.42, dy * 1.5, 1.72), "black", bevel=0.02, rot=r)
    cyl(f"{name}_stoparm", 0.22, 0.02, at(2.0, -hw - 0.02, 1.6), "cross_red", verts=8, rot=(math.pi / 2, 0, rot_z))
    for dx in (rear_ax, front_ax):
        for side in (-1, 1):
            # cylinders extend along local -y once rotated upright: offset so they sit centred on side * 1.05
            cyl(f"{name}_w{dx}{side}", 0.48, 0.3, at(dx, side * 1.05 + 0.15, 0.48), "tyre", verts=24, rot=(math.pi / 2, 0, rot_z), bevel=0.05)
            cyl(f"{name}_hub{dx}{side}", 0.26, 0.02, at(dx, side * 1.2 + (0.02 if side > 0 else 0), 0.48), "silver", verts=16, rot=(math.pi / 2, 0, rot_z))
    # inside: a dark floor at sill height (the lower body is solid), seat rows, the driver and a few students
    box(f"{name}_floor", (7.6, 2.3, 0.02), at(-0.6, 0, zs), "darkgray", bevel=0, rot=r)
    for k in range(8):
        x = -3.9 + k * 0.9
        for side in (-1, 1):
            box(f"{name}_seat{k}{side}", (0.45, 0.9, 0.1), at(x + 0.24, side * 0.68, zs), "teal_dark", bevel=0.02, rot=r)
            box(f"{name}_back{k}{side}", (0.08, 0.9, 0.52), at(x, side * 0.68, zs), "teal_dark", bevel=0.02, rot=r)
    box(f"{name}_dseat", (0.45, 0.5, 0.1), at(3.75, -0.6, zs), "black", bevel=0.02, rot=r)
    cyl(f"{name}_wheel", 0.2, 0.03, at(4.2, -0.6, 1.85), "black", verts=16, rot=(0, -1.1, rot_z))
    L.human(f"{name}_driver", at(3.85, -0.6, zs + 0.1 - 0.44), rot_z=rot_z, seed=960, pose="sit", h=1.7, outfit="teacher")
    for k, (row, side) in enumerate(((0, 1), (1, -1), (2, 1), (4, -1), (5, 1), (3, -1))):
        L.human(f"{name}_pax{k}", at(-3.9 + row * 0.9 + 0.2, side * 0.68, zs + 0.1 - 0.44), rot_z=rot_z, seed=961 + k, pose="sit", h=1.45, outfit=("student", "student2")[k % 2])
    # folding door: two leaves hinged at the edges of the opening (3.32 and 4.18), dark glass in black frames
    for k, (hx, s) in enumerate(((3.32, 1), (4.18, -1))):
        c = hx + s * 0.215
        box(f"{name}_door{k}_pane", (0.39, 0.02, zt - 0.5), at(c, hw - 0.02, 0.48), "carglass", bevel=0, rot=r)
        box(f"{name}_door{k}_top", (0.43, 0.04, 0.06), at(c, hw - 0.02, zt - 0.06), "black", bevel=0, rot=r)
        box(f"{name}_door{k}_bot", (0.43, 0.04, 0.12), at(c, hw - 0.02, 0.42), "black", bevel=0, rot=r)
        for px in (hx + s * 0.02, hx + s * 0.41):
            box(f"{name}_door{k}_post{px:.2f}", (0.04, 0.04, zt - 0.42), at(px, hw - 0.02, 0.42), "black", bevel=0, rot=r)
