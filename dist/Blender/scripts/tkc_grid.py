"""Smart-grid props for the dioramas (built on tkc_lib / tkc_arch / tkc_med / tkc_cable).

Conventions as in tkc_lib: loc = bottom centre, rot_z = heading (local +x), `face` = compass angle a front looks
towards. Lattice members and wires are batches of short tubes, so the bake lights them per vertex (no dark seams).
"""
import math
import random

from mathutils import Vector

import tkc_arch as A
import tkc_cable as C
import tkc_lib as L
import tkc_med as M
from tkc_lib import box, cyl


def _at(loc, rot_z):
    x, y, z = loc
    c, s = math.cos(rot_z), math.sin(rot_z)
    return lambda dx, dy, dz: Vector((x + c * dx - s * dy, y + s * dx + c * dy, z + dz))


def _pieces(a, b, r, step=2.6):
    """A straight member as tubes no longer than `step`."""
    return [(p, q, r) for p, q in C.split([a, b], step)]


# ------------------------------------------------------------------ transmission

def insulator(name, top, length=1.9, discs=7, r=0.16):
    """Suspension string hanging from `top`: a rod threaded with glass discs. Returns the bottom (the clamp)."""
    top = Vector(top)
    bot = top - Vector((0, 0, length))
    segs = [(bot, top, 0.035)]
    for k in range(discs):
        z = top.z - 0.3 - k * (length - 0.55) / max(1, discs - 1)
        segs.append((Vector((top.x, top.y, z - 0.035)), Vector((top.x, top.y, z + 0.035)), r))
    C.tubes(name, segs, "insulator", verts=10)
    return bot


def pylon(name, loc, h=26.0, rot_z=0.0, base=5.4, arms=(6.0, 7.0, 5.6), mat="steel"):
    """Double-circuit lattice tower. Four legs taper to a waist and run up as a square shaft with X-bracing on every
    face; three pairs of cross-arms (along local x) carry insulator strings, a peak carries the earth wire.
    The line runs along local y. Returns the conductor clamps [left top..bottom, right top..bottom] and the peak."""
    at = _at(loc, rot_z)
    waist, shaft = h * 0.55, 0.85
    tip = h * 0.93

    def half(z):
        return base / 2 + (shaft - base / 2) * min(1.0, z / waist)

    levels = [waist * k / 6 for k in range(7)] + [waist + (tip - waist) * k / 5 for k in range(1, 6)]
    legs, ring, brace = [], [], []
    corners = ((-1, -1), (1, -1), (1, 1), (-1, 1))
    for z0, z1 in zip(levels, levels[1:]):
        for sx, sy in corners:
            legs.append((at(sx * half(z0), sy * half(z0), z0), at(sx * half(z1), sy * half(z1), z1), 0.11 if z0 < waist else 0.08))
        for i, (sx, sy) in enumerate(corners):
            tx, ty = corners[(i + 1) % 4]
            a0, b0 = at(sx * half(z0), sy * half(z0), z0), at(tx * half(z0), ty * half(z0), z0)
            a1, b1 = at(sx * half(z1), sy * half(z1), z1), at(tx * half(z1), ty * half(z1), z1)
            ring.append((a1, b1, 0.045))
            brace += _pieces(a0, b1, 0.04) + _pieces(b0, a1, 0.04)
    # cross-arms: a tapering truss out to each side, an insulator string under its tip
    clamps = {-1: [], 1: []}
    arm_z = [tip - (tip - waist) * f for f in (0.0, 0.42, 0.84)]
    arm = []
    for za, ln in zip(arm_z, arms):
        hw = half(za)
        for sx in (-1, 1):
            end = at(sx * ln, 0, za)
            for sy in (-1, 1):
                arm += _pieces(at(sx * hw, sy * hw, za), end, 0.06)  # bottom chords
                arm += _pieces(at(sx * hw, sy * hw, za + 1.3), end, 0.05)  # top chords
                for f in (0.35, 0.68):  # verticals and diagonals inside the truss
                    p = at(sx * (hw + (ln - hw) * f), sy * hw * (1 - f), za)
                    q = at(sx * (hw + (ln - hw) * f), sy * hw * (1 - f), za + 1.3 * (1 - f))
                    arm.append((p, q, 0.035))
            clamps[sx].append(insulator(f"{name}_ins{sx}_{len(clamps[sx])}", end - Vector((0, 0, 0.05))))
    # peak: the four legs meet over the top arm, a short beam for the earth wire
    apex = at(0, 0, h + 2.4)
    for sx, sy in corners:
        arm += _pieces(at(sx * shaft, sy * shaft, tip), apex, 0.06)
    arm += _pieces(at(-1.6, 0, h + 2.2), at(1.6, 0, h + 2.2), 0.05)
    # concrete footings
    for sx, sy in corners:
        f = at(sx * base / 2, sy * base / 2, 0)
        cyl(f"{name}_foot{sx}{sy}", 0.45, 0.5, (f.x, f.y, f.z - 0.2), "concrete", verts=12)
    C.tubes(f"{name}_legs", legs, mat, verts=8)
    C.tubes(f"{name}_ring", ring, mat, verts=6)
    C.tubes(f"{name}_brace", brace, mat, verts=6)
    C.tubes(f"{name}_arms", arm, mat, verts=6)
    box(f"{name}_sign", (0.5, 0.04, 0.6), at(0, -half(2.6) - 0.05, 2.4), "safety_yellow", bevel=0.01, rot=(0, 0, rot_z))
    return clamps[-1] + clamps[1], [at(s * 1.6, 0, h + 2.2) for s in (-1, 1)]


def span(name, a, b, sag=1.4, r=0.04, mat="cable_black", n=14):
    """A conductor hanging between two clamps (parabola), in short pieces."""
    a, b = Vector(a), Vector(b)
    pts = [a.lerp(b, k / n) - Vector((0, 0, sag * 4 * (k / n) * (1 - k / n))) for k in range(n + 1)]
    return C.tubes(name, [(p, q, r) for p, q in zip(pts, pts[1:])], mat, verts=6)


def gantry(name, loc, w=9.0, h=11.0, rot_z=0.0, phases=3, mat="steel"):
    """Substation line gantry: two lattice posts and a beam (across local x) with strain insulators.
    Returns the phase clamp points under the beam."""
    at = _at(loc, rot_z)
    segs = []
    for sx in (-1, 1):
        for cx, cy in ((-0.4, -0.4), (0.4, -0.4), (0.4, 0.4), (-0.4, 0.4)):
            segs += _pieces(at(sx * w / 2 + cx, cy, 0), at(sx * w / 2 + cx * 0.6, cy * 0.6, h), 0.07)
        for k in range(6):
            z0, z1 = h * k / 6, h * (k + 1) / 6
            segs.append((at(sx * w / 2 - 0.4, -0.4, z0), at(sx * w / 2 + 0.4, -0.4, z1), 0.035))
            segs.append((at(sx * w / 2 - 0.4, 0.4, z1), at(sx * w / 2 + 0.4, 0.4, z0), 0.035))
        cyl(f"{name}_foot{sx}", 0.7, 0.4, at(sx * w / 2, 0, -0.1), "concrete", verts=12)
    for cy in (-0.35, 0.35):
        for cz in (0.0, 0.7):
            segs += _pieces(at(-w / 2, cy, h + cz), at(w / 2, cy, h + cz), 0.06)
    for k in range(9):
        x = -w / 2 + w * k / 8
        segs.append((at(x, -0.35, h), at(x, 0.35, h + 0.7), 0.03))
    C.tubes(f"{name}_steel", segs, mat, verts=6)
    out = []
    for k in range(phases):
        x = -w / 2 + w * (k + 1) / (phases + 1)
        out.append(insulator(f"{name}_ins{k}", at(x, 0, h - 0.05), length=1.6, discs=6))
    return out


def post_insulator(name, loc, h=2.2, r=0.18):
    """Station post insulator on a steel pedestal (busbars and disconnectors sit on these)."""
    x, y, z = loc
    cyl(f"{name}_ped", 0.12, h, (x, y, z), "steel", verts=8)
    segs = [(Vector((x, y, z + h)), Vector((x, y, z + h + 1.4)), 0.07)]
    for k in range(6):
        zz = z + h + 0.15 + k * 0.22
        segs.append((Vector((x, y, zz)), Vector((x, y, zz + 0.06)), r))
    C.tubes(f"{name}_shed", segs, "insulator", verts=10)
    return Vector((x, y, z + h + 1.45))


def power_transformer(name, loc, rot_z=0.0, s=1.0, label=None):
    """Main transformer: tank with radiator banks both sides, conservator tank, HV and LV bushings, fan units,
    a bunded plinth. s scales it (1 = about 6 x 3.5 x 6 m)."""
    at = _at(loc, rot_z)
    r = (0, 0, rot_z)
    box(f"{name}_bund", (7.6 * s, 6.0 * s, 0.35), at(0, 0, 0), "concrete", bevel=0.04, rot=r)
    box(f"{name}_tank", (4.8 * s, 2.6 * s, 3.6 * s), at(0, 0, 0.35), "grid_green", bevel=0.08, rot=r)
    box(f"{name}_lid", (5.0 * s, 2.8 * s, 0.18), at(0, 0, 0.35 + 3.6 * s), "grid_green", bevel=0.04, rot=r)
    for sy in (-1, 1):  # radiator banks: thin fins (vertex-lit) on headers
        for k in range(7):
            box(f"{name}_fin{sy}_{k}", (0.05, 0.9 * s, 2.6 * s), at(-1.8 * s + k * 0.6 * s, sy * 1.85 * s, 0.75), "grid_green", bevel=0, rot=r)
        for zz in (0.75, 0.75 + 2.6 * s):
            box(f"{name}_hdr{sy}{zz:.1f}", (4.0 * s, 0.18, 0.18), at(-0.0, sy * 1.85 * s, zz - 0.09), "grid_green", bevel=0.02, rot=r)
        box(f"{name}_fan{sy}", (1.2 * s, 0.5, 0.9 * s), at(1.9 * s, sy * 1.85 * s, 0.4), "panel_grey", bevel=0.04, rot=r)
    cz = 0.35 + 3.8 * s
    cyl(f"{name}_cons", 0.42 * s, 3.2 * s, at(-1.6 * s, 0.9 * s, cz + 0.7 * s), "grid_green", verts=16, rot=(0, math.pi / 2, rot_z))
    for k in range(2):
        cyl(f"{name}_cons_leg{k}", 0.06, 0.7 * s, at(-2.6 * s + k * 2.0 * s, 0.9 * s, cz), "steel", verts=6)
    bush = []
    for k in range(3):  # HV bushings: tall, shedded
        b = at(-1.2 * s + k * 1.2 * s, -0.5 * s, cz)
        bush.append((b, b + Vector((0, 0, 2.2 * s)), 0.11))
        for j in range(7):
            p = b + Vector((0, 0, 0.35 + j * 0.25 * s))
            bush.append((p, p + Vector((0, 0, 0.06)), 0.24 * s))
    for k in range(3):  # LV bushings: short
        b = at(1.0 * s + k * 0.5 * s, 0.6 * s, cz)
        bush.append((b, b + Vector((0, 0, 0.9 * s)), 0.08))
        for j in range(3):
            p = b + Vector((0, 0, 0.2 + j * 0.22 * s))
            bush.append((p, p + Vector((0, 0, 0.05)), 0.16 * s))
    C.tubes(f"{name}_bush", bush, "insulator", verts=10)
    box(f"{name}_plate", (0.02, 0.6, 0.4), at(2.41 * s, 0, 2.0 * s), "silver", bevel=0, rot=r)
    box(f"{name}_led", (0.02, 0.4, 0.05), at(2.42 * s, 0, 2.5 * s), "led_green", bevel=0, rot=r)
    if label:
        L.text_mesh(f"{name}_txt", label, at(0, -1.31 * s, 2.4 * s), 0.34, 0.02, "white", rot=(math.pi / 2, 0, rot_z), resolution=3)
    return [at(-1.2 * s + k * 1.2 * s, -0.5 * s, cz + 2.2 * s) for k in range(3)]


def breaker(name, loc, rot_z=0.0):
    """Dead-tank circuit breaker: three grey tanks on a frame, each with two bushings, a control box."""
    at = _at(loc, rot_z)
    box(f"{name}_frame", (3.0, 1.0, 1.2), at(0, 0, 0), "steel", bevel=0.02, rot=(0, 0, rot_z))
    segs = []
    for k in range(3):
        x = -1.0 + k * 1.0
        cyl(f"{name}_tank{k}", 0.32, 1.6, at(x, 0.8, 1.52), "panel_grey", verts=14, rot=(math.pi / 2, 0, rot_z))
        for sy in (-0.45, 0.45):
            b = at(x, sy, 1.78)
            segs.append((b, b + Vector((0, 0, 1.3)), 0.06))
            for j in range(4):
                p = b + Vector((0, 0, 0.3 + j * 0.25))
                segs.append((p, p + Vector((0, 0, 0.05)), 0.14))
    C.tubes(f"{name}_bush", segs, "insulator", verts=8)
    box(f"{name}_ctl", (0.8, 0.5, 1.4), at(1.9, 0, 0), "panel_grey", bevel=0.03, rot=(0, 0, rot_z))
    box(f"{name}_ctl_led", (0.02, 0.2, 0.04), at(2.31, 0, 1.2), "led_green", bevel=0, rot=(0, 0, rot_z))


def control_house(name, loc, w=8.0, d=5.0, h=3.6, rot_z=0.0, label="SUBSTATION 115/22 kV"):
    """Substation control building: rendered block, metal door, louvres, roof AC units and a GIS-like antenna."""
    at = _at(loc, rot_z)
    r = (0, 0, rot_z)
    box(f"{name}_body", (w, d, h), at(0, 0, 0), "offwhite", bevel=0.05, rot=r)
    box(f"{name}_parapet", (w + 0.2, d + 0.2, 0.3), at(0, 0, h), "panel_grey", bevel=0.03, rot=r)
    box(f"{name}_door", (1.2, 0.06, 2.3), at(-w / 4, -d / 2 - 0.02, 0), "panel_grey", bevel=0.01, rot=r)
    for k in range(3):
        box(f"{name}_louvre{k}", (1.4, 0.05, 0.8), at(0.4 + k * 1.8, -d / 2 - 0.02, 1.6), "darkgray", bevel=0.01, rot=r)
    for k in range(2):
        box(f"{name}_ac{k}", (1.0, 0.8, 0.7), at(-w / 4 + k * w / 2, 0.6, h + 0.3), "robot_white", bevel=0.04, rot=r)
    cyl(f"{name}_ant", 0.04, 3.0, at(w / 2 - 0.6, d / 2 - 0.6, h + 0.3), "steel", verts=6)
    if label:
        L.text_mesh(f"{name}_txt", label, at(0.6, -d / 2 - 0.03, h - 0.65), 0.28, 0.02, "accent_blue", rot=(math.pi / 2, 0, rot_z), resolution=3)


# ------------------------------------------------------------------ distribution

def dist_pole(name, loc, h=9.5, rot_z=0.0, transformer=False, concentrator=False, lamp=None, riser=False):
    """Concrete distribution pole: crossarm with three pin insulators (the 22 kV line runs along local y),
    an optional pole-mounted transformer, an AMI data concentrator with antenna, a street lamp arm pointing at
    compass angle `lamp`, a cable riser (the feeder comes up from underground).
    Returns the three line points."""
    at = _at(loc, rot_z)
    r = (0, 0, rot_z)
    cyl(f"{name}_pole", 0.17, h, at(0, 0, 0), "concrete", verts=12, r2=0.12)
    box(f"{name}_arm", (2.6, 0.12, 0.12), at(0, 0, h - 0.6), "steel", bevel=0.01, rot=r)
    C.tubes(f"{name}_brace", [(at(-0.9, 0, h - 0.6), at(0, 0, h - 1.5), 0.03), (at(0.9, 0, h - 0.6), at(0, 0, h - 1.5), 0.03)], "steel", verts=6)
    pins = []
    for x in (-1.15, 0.0, 1.15):
        p = at(x, 0, h - 0.54)
        segs = [(p, p + Vector((0, 0, 0.32)), 0.035)] + [(p + Vector((0, 0, 0.08 + j * 0.1)), p + Vector((0, 0, 0.12 + j * 0.1)), 0.09) for j in range(2)]
        C.tubes(f"{name}_pin{x:.1f}", segs, "insulator", verts=8)
        pins.append(p + Vector((0, 0, 0.32)))
    if transformer:
        cyl(f"{name}_tx", 0.42, 1.1, at(0.45, 0, h - 3.4), "panel_grey", verts=16)
        cyl(f"{name}_tx_lid", 0.45, 0.08, at(0.45, 0, h - 2.3), "panel_grey", verts=16)
        box(f"{name}_tx_bkt", (0.3, 0.1, 0.5), at(0.2, 0, h - 3.2), "steel", bevel=0.01, rot=r)
        C.tubes(f"{name}_tx_bush", [(at(0.3 + k * 0.15, 0, h - 2.22), at(0.3 + k * 0.15, 0, h - 1.85), 0.04) for k in range(2)], "insulator", verts=8)
    if concentrator:
        box(f"{name}_dcu", (0.42, 0.24, 0.55), at(0, -0.26, 3.2), "robot_white", bevel=0.03, rot=r)
        box(f"{name}_dcu_led", (0.02, 0.08, 0.03), at(0.12, -0.39, 3.6), "led_cyan", bevel=0, rot=r)
        cyl(f"{name}_dcu_ant", 0.02, 1.0, at(0.12, -0.26, 3.75), "darkgray", verts=6)
        sphere_pos = at(0.12, -0.26, 4.78)
        L.sphere(f"{name}_dcu_tip", 0.05, (sphere_pos.x, sphere_pos.y, sphere_pos.z), "led_cyan", subdiv=1)
    if lamp is not None:
        la = _at(loc, lamp)
        box(f"{name}_lamp_arm", (1.6, 0.08, 0.08), la(0.8, 0, h - 2.4), "darkgray", bevel=0.01, rot=(0, 0, lamp))
        box(f"{name}_lamp", (0.6, 0.22, 0.1), la(1.55, 0, h - 2.5), "darkgray", bevel=0.02, rot=(0, 0, lamp))
        box(f"{name}_lamp_led", (0.5, 0.16, 0.02), la(1.55, 0, h - 2.52), "led_warm", bevel=0, rot=(0, 0, lamp))
    if riser:
        cyl(f"{name}_riser", 0.06, h - 1.2, at(0, 0.2, 0), "panel_grey", verts=8)
        box(f"{name}_riser_guard", (0.22, 0.12, 2.4), at(0, 0.22, 0), "steel", bevel=0.01, rot=r)
    return pins


def smart_meter(name, loc, face, screen="screen_meter"):
    """Wall-mounted smart meter: white case, small LCD, comms LED, a conduit down into the wall base."""
    at = _at(loc, face)
    rz = face + math.pi / 2
    box(f"{name}_case", (0.14, 0.34, 0.48), at(0.07, 0, 0), "robot_white", bevel=0.03, rot=(0, 0, rz - math.pi / 2))
    M.screen_at(f"{name}_scr", (0.22, 0.12), at(0.15, 0, 0.32), face, screen, bezel=0.015, depth=0.01)
    box(f"{name}_led", (0.02, 0.04, 0.04), at(0.15, 0.11, 0.14), "led_cyan", bevel=0, rot=(0, 0, rz))
    cyl(f"{name}_conduit", 0.025, loc[2] - 0.05, at(0.05, -0.1, -(loc[2] - 0.05)), "panel_grey", verts=6)


# ------------------------------------------------------------------ storage

def bess_container(name, loc, rot_z=0.0, label=None):
    """40 ft battery container on a plinth: ribbed walls, four door pairs on the front (-y local), HVAC units at
    one end, fire-suppression box, status LED strip, a little screen."""
    at = _at(loc, rot_z)
    r = (0, 0, rot_z)
    ln, w, h = 12.2, 2.44, 2.9
    box(f"{name}_plinth", (ln + 0.8, w + 0.8, 0.3), at(0, 0, 0), "concrete", bevel=0.03, rot=r)
    box(f"{name}_body", (ln, w, h), at(0, 0, 0.3), "robot_white", bevel=0.05, rot=r)
    box(f"{name}_roof", (ln + 0.06, w + 0.06, 0.08), at(0, 0, 0.3 + h), "panel_grey", bevel=0.02, rot=r)
    box(f"{name}_band", (ln + 0.02, w + 0.02, 0.18), at(0, 0, 0.3 + h - 0.42), "accent_blue", bevel=0, rot=r)
    for k in range(4):  # door pairs with handles on the front
        x = -ln / 2 + 1.7 + k * 2.6
        for sx in (-0.55, 0.55):
            box(f"{name}_door{k}{sx}", (1.05, 0.04, 2.3), at(x + sx, -w / 2 - 0.01, 0.55), "offwhite", bevel=0.01, rot=r)
        box(f"{name}_bar{k}", (0.04, 0.05, 2.0), at(x, -w / 2 - 0.04, 0.7), "steel", bevel=0, rot=r)
    for k in range(14):  # ribs on the back
        box(f"{name}_rib{k}", (0.1, 0.05, h - 0.3), at(-ln / 2 + 0.5 + k * 0.86, w / 2 + 0.01, 0.45), "offwhite", bevel=0, rot=r)
    for k in range(2):  # HVAC packs on the end wall
        box(f"{name}_hvac{k}", (0.5, 1.0, 1.2), at(ln / 2 + 0.25, -0.55 + k * 1.1, 1.1), "panel_grey", bevel=0.04, rot=r)
        box(f"{name}_grille{k}", (0.02, 0.8, 0.8), at(ln / 2 + 0.51, -0.55 + k * 1.1, 1.3), "darkgray", bevel=0, rot=r)
    box(f"{name}_fire", (0.4, 0.12, 0.5), at(-ln / 2 + 0.6, -w / 2 - 0.06, 1.6), "cross_red", bevel=0.02, rot=r)
    box(f"{name}_led", (ln * 0.8, 0.03, 0.05), at(0, -w / 2 - 0.02, 0.3 + h - 0.62), "led_green", bevel=0, rot=r)
    M.screen_at(f"{name}_scr", (0.6, 0.36), at(ln / 2 - 0.9, -w / 2 - 0.03, 1.7), rot_z - math.pi / 2, "screen_bess", bezel=0.03, depth=0.02)
    if label:
        L.text_mesh(f"{name}_txt", label, at(-1.2, -w / 2 - 0.03, 0.3 + h - 0.36), 0.3, 0.02, "accent_blue", rot=(math.pi / 2, 0, rot_z), resolution=3)


def pcs_skid(name, loc, rot_z=0.0):
    """Power conversion skid: two inverter cabinets and a compact MV transformer on a steel base, a cable trench."""
    at = _at(loc, rot_z)
    r = (0, 0, rot_z)
    box(f"{name}_base", (6.0, 2.4, 0.3), at(0, 0, 0), "steel", bevel=0.02, rot=r)
    for k in range(2):
        box(f"{name}_inv{k}", (1.6, 1.2, 2.3), at(-2.0 + k * 1.75, 0, 0.3), "robot_white", bevel=0.04, rot=r)
        box(f"{name}_inv_vent{k}", (1.2, 0.02, 0.6), at(-2.0 + k * 1.75, -0.61, 1.6), "darkgray", bevel=0, rot=r)
        box(f"{name}_inv_led{k}", (0.3, 0.02, 0.05), at(-2.0 + k * 1.75, -0.62, 2.3), "led_cyan", bevel=0, rot=r)
    box(f"{name}_tx", (2.0, 1.6, 2.0), at(1.8, 0, 0.3), "grid_green", bevel=0.05, rot=r)
    for k in range(5):
        box(f"{name}_tx_fin{k}", (0.05, 0.3, 1.4), at(1.0 + k * 0.4, -0.95, 0.55), "grid_green", bevel=0, rot=r)
    box(f"{name}_trench", (6.4, 0.6, 0.06), at(0, 1.6, 0), "panel_grey", bevel=0.01, rot=r)


def home_battery(name, loc, face):
    """Wall battery with its hybrid inverter beside it (prosumer homes)."""
    at = _at(loc, face)
    rz = face - math.pi / 2
    box(f"{name}_bat", (0.75, 0.18, 1.05), at(0.09, 0, 0.3), "robot_white", bevel=0.05, rot=(0, 0, rz))
    box(f"{name}_bat_led", (0.02, 0.3, 0.04), at(0.19, 0, 1.15), "led_green", bevel=0, rot=(0, 0, face))
    box(f"{name}_inv", (0.48, 0.16, 0.6), at(0.08, 0.75, 0.6), "panel_grey", bevel=0.03, rot=(0, 0, rz))
    box(f"{name}_inv_led", (0.02, 0.12, 0.03), at(0.17, 0.75, 1.05), "led_cyan", bevel=0, rot=(0, 0, face))


def wall_charger(name, loc, face):
    """Home EV wall box with a coiled lead."""
    at = _at(loc, face)
    box(f"{name}_box", (0.12, 0.32, 0.42), at(0.06, 0, 0), "robot_white", bevel=0.03, rot=(0, 0, face))
    box(f"{name}_led", (0.02, 0.18, 0.03), at(0.13, 0, 0.32), "led_green", bevel=0, rot=(0, 0, face))
    lead = C.bezier(at(0.12, 0.1, 0.05), at(0.35, 0.2, -0.4), at(0.4, -0.2, -0.5), at(0.15, -0.12, 0.0), 8)
    C.tubes(f"{name}_lead", [(a, b, 0.02) for a, b in zip(lead, lead[1:])], "cable_black", verts=6)


def dc_charger(name, loc, face, screen="screen_charge"):
    """Public DC fast charger: tall white body with a screen, a light bar and a holstered cable."""
    at = _at(loc, face)
    box(f"{name}_base", (0.6, 0.9, 0.12), at(0, 0, 0), "concrete", bevel=0.02, rot=(0, 0, face))
    box(f"{name}_body", (0.42, 0.7, 1.9), at(0, 0, 0.12), "robot_white", bevel=0.06, rot=(0, 0, face))
    box(f"{name}_cap", (0.46, 0.74, 0.08), at(0, 0, 2.02), "accent_blue", bevel=0.02, rot=(0, 0, face))
    box(f"{name}_bar", (0.02, 0.06, 1.2), at(0.22, -0.3, 0.5), "led_cyan", bevel=0, rot=(0, 0, face))
    M.screen_at(f"{name}_scr", (0.42, 0.32), at(0.22, 0.04, 1.45), face, screen, bezel=0.02, depth=0.02)
    lead = C.bezier(at(0.22, 0.25, 1.0), at(0.6, 0.35, 0.4), at(0.55, 0.3, 0.15), at(0.3, 0.3, 0.6), 8)
    C.tubes(f"{name}_lead", [(a, b, 0.03) for a, b in zip(lead, lead[1:])], "cable_black", verts=6)


# ------------------------------------------------------------------ homes

def house(name, loc, rot_z=0.0, w=8.0, d=6.6, floors=2, seed=0, wall="house_cream", roof="roof_slate", trim="timber",
          pv=(5, 2), timber=True, chimney=True, door_x=-1.2):
    """Two-storey family house facing local -y: plinth, rendered walls, half-timbering on the upper floor, framed
    windows, a door under a canopy, a gable roof (ridge along local x) with a PV array on the front slope.
    Returns a dict of useful points: front wall y, eave height, door position."""
    rnd = random.Random(seed)
    at = _at(loc, rot_z)
    R = (0, 0, rot_z)
    fh = 2.9
    z0 = 0.45
    eave = z0 + floors * fh
    p = math.radians(36)
    over = 0.5
    rise = (d / 2) * math.tan(p)
    box(f"{name}_plinth", (w + 0.16, d + 0.16, z0), at(0, 0, 0), "stone", bevel=0.03, rot=R)
    box(f"{name}_walls", (w, d, eave - z0), at(0, 0, z0), wall, bevel=0.03, rot=R)
    L.prism(f"{name}_gable", [(-d / 2, 0), (d / 2, 0), (0, rise)], w, at(0, 0, eave - 0.01), wall, rot_z=rot_z + math.pi / 2, bevel=0)
    # roof: two slabs with an overhang, a ridge cap, fascia boards
    sl = (d / 2 + over) / math.cos(p)
    t = 0.16
    for side in (-1, 1):
        ym = side * (d / 2 + over) / 2
        zm = eave - over * math.tan(p) + (d / 2 + over) * math.tan(p) / 2
        box(f"{name}_roof{side}", (w + 0.7, sl, t), at(0, ym, zm), roof, bevel=0.02, rot=(-side * p, 0, rot_z))
        box(f"{name}_fascia{side}", (w + 0.72, 0.06, 0.24), at(0, side * (d / 2 + over), eave - over * math.tan(p) - 0.12), "white", bevel=0, rot=R)
    box(f"{name}_ridge", (w + 0.72, 0.36, 0.14), at(0, 0, eave + rise + t / math.cos(p) - 0.08), roof, bevel=0.04, rot=R)
    # PV on the front slope (local -y): rows up the slope, columns across
    cols, rows = pv
    if cols:
        pw, ph = 1.05, 1.7
        for i in range(cols):
            for j in range(rows):
                u = 0.75 + j * (ph + 0.08) + ph / 2  # along the slope from the eave
                xx = -(cols - 1) * (pw + 0.05) / 2 + i * (pw + 0.05)
                yy = -(d / 2 + over) + u * math.cos(p)
                zz = eave - over * math.tan(p) + u * math.sin(p) + t / math.cos(p) + 0.02
                box(f"{name}_pv{i}{j}", (pw, ph, 0.05), at(xx, yy, zz), "solar", bevel=0, rot=(p, 0, rot_z))
    if chimney:
        cx = w / 2 - 1.3
        box(f"{name}_chimney", (0.6, 0.6, rise + 1.3), at(cx, 0.9, eave), "stone", bevel=0.03, rot=R)
        box(f"{name}_chimney_cap", (0.75, 0.75, 0.1), at(cx, 0.9, eave + rise + 1.3), "darkgray", bevel=0.02, rot=R)
    # windows: front and back two per floor (the ground floor front keeps the door), one per floor each side
    def window(tag, x, y, z, rot, ww=1.1, hh=1.3):
        a = _at(tuple(at(x, y, z)), rot)
        box(f"{name}_wf{tag}", (0.06, ww + 0.16, hh + 0.16), a(0.0, 0, 0), "white", bevel=0.01, rot=(0, 0, rot))
        box(f"{name}_wg{tag}", (0.04, ww, hh), a(0.02, 0, 0.08), "tower_glass", bevel=0, rot=(0, 0, rot))
        box(f"{name}_wb{tag}", (0.03, 0.05, hh), a(0.045, 0, 0.08), "white", bevel=0, rot=(0, 0, rot))
        box(f"{name}_ws{tag}", (0.18, ww + 0.3, 0.07), a(0.06, 0, -0.06), "white", bevel=0.01, rot=(0, 0, rot))
    front, back, right, left = rot_z - math.pi / 2, rot_z + math.pi / 2, rot_z, rot_z + math.pi
    for f in range(floors):
        zz = z0 + f * fh + 0.95
        for k, x in enumerate((-w / 4 - 0.4, w / 4 + 0.4)):
            if f == 0 and abs(x - door_x) < 1.4:
                continue
            window(f"f{f}{k}", x, -d / 2 - 0.02, zz, front)
            window(f"b{f}{k}", x, d / 2 + 0.02, zz, back)
        window(f"r{f}", w / 2 + 0.02, 0, zz, right)
        window(f"l{f}", -w / 2 - 0.02, 0, zz, left)
    # half-timbering over the upper floor front (the artwork's cottages)
    if timber and floors > 1:
        zt = z0 + fh
        bars = [(0, -d / 2 - 0.04, zt - 0.05, w - 0.1, 0.16), (0, -d / 2 - 0.04, eave - 0.18, w - 0.1, 0.16)]
        for x, y, z, ln, hh in bars:
            box(f"{name}_tb{z:.1f}", (ln, 0.06, hh), at(x, y, z), trim, bevel=0, rot=R)
        for k, x in enumerate((-w / 2 + 0.25, -w / 4 + 0.6, 0.0, w / 4 - 0.6, w / 2 - 0.25)):
            box(f"{name}_tv{k}", (0.16, 0.06, fh - 0.2), at(x, -d / 2 - 0.04, zt + 0.05), trim, bevel=0, rot=R)
    # door, canopy, step
    box(f"{name}_door", (1.0, 0.08, 2.15), at(door_x, -d / 2 - 0.02, z0), trim, bevel=0.01, rot=R)
    box(f"{name}_door_glass", (0.3, 0.02, 0.9), at(door_x, -d / 2 - 0.07, z0 + 1.0), "tower_glass", bevel=0, rot=R)
    box(f"{name}_canopy", (1.7, 0.9, 0.1), at(door_x, -d / 2 - 0.45, z0 + 2.5), "white", bevel=0.02, rot=R)
    box(f"{name}_step", (1.6, 0.8, 0.22), at(door_x, -d / 2 - 0.4, 0.0), "stone", bevel=0.02, rot=R)
    box(f"{name}_lamp", (0.12, 0.08, 0.2), at(door_x + 0.75, -d / 2 - 0.05, z0 + 1.9), "led_warm", bevel=0, rot=R)
    return {"front_y": -d / 2, "eave": eave, "door": at(door_x, -d / 2 - 0.4, 0.0), "at": at, "z0": z0}


def picket(name, pts, h=0.9, mat="white"):
    """Low garden fence along a polyline: posts and two rails."""
    segs = []
    for a, b in zip(pts, pts[1:]):
        a, b = Vector((*a, 0.16)), Vector((*b, 0.16))
        n = max(1, round((b - a).length / 1.2))
        for k in range(n + 1):
            p = a.lerp(b, k / n)
            segs.append((p, p + Vector((0, 0, h)), 0.04))
        for zz in (0.35, h - 0.12):
            segs += _pieces(a + Vector((0, 0, zz)), b + Vector((0, 0, zz)), 0.025, 2.4)
    C.tubes(name, segs, mat, verts=6)


# ------------------------------------------------------------------ generation

def solar_carport(name, x0, x1, y0, y1, z=0.16, bays=None, tilt=0.1, mat="robot_white"):
    """Car park canopy over a row of bays: steel columns at the back, cantilevered beams, a PV roof sloping to the
    front, a lit fascia and gutters. Columns stand on the back line (y1), the front is open for the cars."""
    n = bays or max(2, round((x1 - x0) / 2.7))
    h_back, h_front = 3.4, 3.4 - (y1 - y0) * math.tan(tilt)
    cols = []
    for k in range(0, n + 1, 2):
        x = x0 + (x1 - x0) * k / n
        cols.append((Vector((x, y1 - 0.6, z)), Vector((x, y1 - 0.6, z + h_back)), 0.16))
        box(f"{name}_foot{k}", (0.6, 0.6, 0.25), (x, y1 - 0.6, z - 0.05), "concrete", bevel=0.03)
        beam = [Vector((x, y1 - 0.3, z + h_back)), Vector((x, y0 + 0.2, z + h_front))]
        cols += _pieces(beam[0], beam[1], 0.12)
        cols += _pieces(Vector((x, y1 - 0.6, z + h_back - 1.2)), Vector((x, y1 - 2.2, z + h_back - 0.1)), 0.06)
    C.tubes(f"{name}_steel", cols, mat, verts=10)
    rot = (tilt, 0, 0)  # +y (the back) up
    ln = (y1 - y0 + 0.6) / math.cos(tilt)
    cy = (y0 + y1) / 2
    cz = z + (h_back + h_front) / 2 + 0.12
    box(f"{name}_deck", (x1 - x0 + 0.6, ln, 0.1), ((x0 + x1) / 2, cy, cz), "panel_grey", bevel=0.02, rot=rot)
    m = int((x1 - x0) / 1.08)
    for i in range(m):
        for j in range(3):
            v = -ln / 2 + 0.3 + (j + 0.5) * (ln - 0.6) / 3
            x = x0 + 0.3 + (i + 0.5) * (x1 - x0 - 0.0) / m
            box(f"{name}_pv{i}_{j}", ((x1 - x0) / m - 0.06, (ln - 0.6) / 3 - 0.08, 0.05), (x, cy + v * math.cos(tilt), cz + 0.1 + v * math.sin(tilt)), "solar", bevel=0, rot=rot)
    box(f"{name}_fascia", (x1 - x0 + 0.7, 0.12, 0.3), ((x0 + x1) / 2, y0 - 0.1, z + h_front - 0.12), mat, bevel=0.02)
    box(f"{name}_fascia_led", (x1 - x0 + 0.6, 0.03, 0.05), ((x0 + x1) / 2, y0 - 0.17, z + h_front - 0.02), "led_cyan", bevel=0)
    return h_front


def solar_table(name, x0, x1, y, z=0.16, tilt=0.42, depth=3.6):
    """Ground-mounted PV table (two modules high) on driven posts, rows of modules with gaps, a string box."""
    n = int((x1 - x0) / 1.1)
    hz = 0.9 + depth / 2 * math.sin(tilt)
    for i in range(n):
        x = x0 + 0.55 + i * 1.1
        for j in range(2):
            v = (j - 0.5) * (depth / 2)
            box(f"{name}_m{i}_{j}", (1.04, depth / 2 - 0.06, 0.05), (x, y + v * math.cos(tilt), z + hz + v * math.sin(tilt)), "solar", bevel=0, rot=(tilt, 0, 0))
    posts = []
    for k in range(int((x1 - x0) / 3.3) + 1):
        x = x0 + 0.2 + k * 3.3
        posts.append((Vector((x, y + depth * 0.35, z)), Vector((x, y + depth * 0.35, z + hz + depth * 0.35 * math.tan(tilt) * 0.9)), 0.05))
        posts.append((Vector((x, y - depth * 0.35, z)), Vector((x, y - depth * 0.35, z + hz - depth * 0.35 * math.tan(tilt) * 0.9)), 0.05))
    C.tubes(f"{name}_posts", posts, "steel", verts=6)
    box(f"{name}_sbox", (0.5, 0.25, 0.6), (x0 - 0.5, y - 1.2, z), "robot_white", bevel=0.03)


def inverter_station(name, loc, rot_z=0.0):
    """Solar farm central inverter + MV station: a white box house with louvres, a transformer, a fence."""
    at = _at(loc, rot_z)
    r = (0, 0, rot_z)
    box(f"{name}_pad", (6.4, 3.2, 0.25), at(0, 0, 0), "concrete", bevel=0.03, rot=r)
    box(f"{name}_house", (4.0, 2.6, 2.6), at(-1.0, 0, 0.25), "robot_white", bevel=0.05, rot=r)
    for k in range(3):
        box(f"{name}_lv{k}", (0.9, 0.04, 0.9), at(-2.3 + k * 1.3, -1.31, 1.1), "darkgray", bevel=0.01, rot=r)
    box(f"{name}_led", (3.0, 0.03, 0.05), at(-1.0, -1.32, 2.5), "led_cyan", bevel=0, rot=r)
    box(f"{name}_tx", (1.6, 1.6, 1.8), at(2.1, 0, 0.25), "grid_green", bevel=0.05, rot=r)
    for k in range(4):
        box(f"{name}_txfin{k}", (0.05, 0.3, 1.2), at(1.5 + k * 0.4, -0.95, 0.5), "grid_green", bevel=0, rot=r)
