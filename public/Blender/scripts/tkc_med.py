"""Medical and smart-hospital props for the dioramas (built on tkc_lib / tkc_arch).

Conventions as in tkc_lib: loc = bottom centre, rot_z = heading, props face local +x unless noted,
screens use materials named screen_* (content drawn in the browser, see src/three/model/screens.js).
"""
import math
import random

import bmesh
from mathutils import Vector

import tkc_arch as A
import tkc_lib as L
from tkc_lib import box, cyl, sphere


def _at(loc, rot_z):
    x, y, z = loc
    c, s = math.cos(rot_z), math.sin(rot_z)
    return lambda dx, dy, dz: (x + c * dx - s * dy, y + s * dx + c * dy, z + dz)


def circle(r, n=32, cx=0.0, cy=0.0):
    return [(cx + r * math.cos(a * math.tau / n), cy + r * math.sin(a * math.tau / n)) for a in range(n)]


def screen_at(name, size, center, face, mat, bezel=0.05, depth=0.05):
    """Screen quad centred at `center` whose front faces the compass angle `face` (radians), with a bezel box behind."""
    L.plane(name, size, center, mat, rot=(math.pi / 2, 0, face + math.pi / 2))
    if bezel:
        n = Vector((math.cos(face), math.sin(face), 0))
        c = Vector(center) - n * (depth / 2 + 0.006)
        box(f"{name}_bezel", (size[0] + 2 * bezel, depth, size[1] + 2 * bezel), (c.x, c.y, c.z - size[1] / 2 - bezel), "bezel", bevel=0.01, rot=(0, 0, face + math.pi / 2))


def disc_ring(name, r_out, r_in, loc, h, mat, rot=(0, 0, 0), n=40):
    """Flat annulus (ring) centred at loc; rot turns it (e.g. upright)."""
    ob = A.ring(name, circle(r_out, n), circle(r_in, n), -h / 2, h, mat)
    ob.rotation_euler = rot
    ob.location = loc
    return ob


# ------------------------------------------------------------------ wards

@L.lowpoly
def hospital_bed(name, loc, rot_z=0.0, patient=True, seed=0, blanket="blanket"):
    """Smart bed, head at local -x: frame, mattress, pillow, rails, patient under a blanket."""
    rnd = random.Random(seed)
    at = _at(loc, rot_z)
    r = (0, 0, rot_z)
    box(f"{name}_frame", (2.1, 0.96, 0.12), at(0, 0, 0.4), "robot_white", bevel=0.03, rot=r)
    for dx in (-0.9, 0.9):
        for dy in (-0.38, 0.38):
            cyl(f"{name}_leg{dx}{dy}", 0.03, 0.34, at(dx, dy, 0.06), "silver", verts=8)
            sphere(f"{name}_castor{dx}{dy}", 0.06, at(dx, dy, 0.06), "black", subdiv=1)
    box(f"{name}_mattress", (2.0, 0.9, 0.16), at(0, 0, 0.52), "mattress", bevel=0.05, rot=r)
    box(f"{name}_head", (0.07, 0.98, 0.62), at(-1.08, 0, 0.4), "teal", bevel=0.03, rot=r)
    box(f"{name}_foot", (0.06, 0.98, 0.38), at(1.08, 0, 0.4), "robot_white", bevel=0.03, rot=r)
    box(f"{name}_panel", (0.02, 0.3, 0.12), at(1.12, 0, 0.6), "led_cyan", bevel=0, rot=r)
    for dy in (-0.49, 0.49):
        box(f"{name}_rail{dy}", (0.8, 0.03, 0.2), at(-0.35, dy, 0.64), "silver", bevel=0.01, rot=r)
    box(f"{name}_pillow", (0.36, 0.62, 0.12), at(-0.78, 0, 0.68), "cloth_white", bevel=0.05, rot=r)
    if patient:
        skin = rnd.choice(L.SKINS)
        sphere(f"{name}_phead", 0.11, at(-0.74, 0, 0.86), skin, scale=(1, 0.9, 1), subdiv=2)
        sphere(f"{name}_phair", 0.115, at(-0.79, 0, 0.88), "hair2" if rnd.random() < 0.4 else "hair", scale=(0.9, 0.95, 0.9), subdiv=2)
        box(f"{name}_blanket", (1.36, 0.88, 0.2), at(0.22, 0, 0.66), blanket, bevel=0.08, rot=r)
        box(f"{name}_gown", (0.3, 0.5, 0.14), at(-0.5, 0, 0.7), "gown", bevel=0.05, rot=r)
    else:
        box(f"{name}_blanket", (1.2, 0.9, 0.05), at(0.3, 0, 0.68), blanket, bevel=0.02, rot=r)


@L.lowpoly
def vitals_monitor(name, loc, face):
    """Patient monitor on a wheeled stand; screen faces compass angle `face`."""
    x, y, z = loc
    for k in range(5):
        a = k * math.tau / 5
        box(f"{name}_foot{k}", (0.3, 0.04, 0.03), (x + math.cos(a) * 0.14, y + math.sin(a) * 0.14, z + 0.04), "silver", bevel=0, rot=(0, 0, a))
    cyl(f"{name}_pole", 0.02, 1.25, (x, y, z), "silver", verts=8)
    n = (math.cos(face), math.sin(face))
    box(f"{name}_body", (0.42, 0.1, 0.34), (x, y, z + 1.15), "robot_white", bevel=0.02, rot=(0, 0, face + math.pi / 2))
    screen_at(f"{name}_scr", (0.34, 0.26), (x + n[0] * 0.052, y + n[1] * 0.052, z + 1.32), face, "screen_vitals", bezel=0)


@L.lowpoly
def iv_pole(name, loc):
    x, y, z = loc
    for k in range(4):
        box(f"{name}_foot{k}", (0.34, 0.03, 0.03), (x, y, z + 0.05), "silver", bevel=0, rot=(0, 0, k * math.pi / 2))
    cyl(f"{name}_pole", 0.015, 1.9, (x, y, z), "silver", verts=8)
    box(f"{name}_hook", (0.3, 0.02, 0.02), (x, y, z + 1.88), "silver", bevel=0)
    sphere(f"{name}_bag", 0.09, (x + 0.12, y, z + 1.68), "glass", scale=(0.7, 0.35, 1.3), subdiv=1)
    cyl(f"{name}_pump", 0.07, 0.18, (x, y + 0.03, z + 1.2), "robot_white", verts=10)


@L.lowpoly
def wheelchair(name, loc, rot_z=0.0, seed=0, occupant=True):
    """Wheelchair facing +x of rot_z, optionally with a seated patient."""
    at = _at(loc, rot_z)
    r = (0, 0, rot_z)
    box(f"{name}_seat", (0.46, 0.46, 0.06), at(0.02, 0, 0.46), "teal_dark", bevel=0.02, rot=r)
    box(f"{name}_back", (0.05, 0.46, 0.46), at(-0.22, 0, 0.5), "teal_dark", bevel=0.02, rot=(0, -0.12, rot_z))
    for side in (-1, 1):
        cyl(f"{name}_wheel{side}", 0.3, 0.035, at(-0.08, side * 0.27, 0.3), "tyre", verts=24, rot=(math.pi / 2, 0, rot_z))
        disc_ring(f"{name}_rim{side}", 0.27, 0.24, at(-0.08, side * 0.3, 0.3), 0.012, "silver", rot=(math.pi / 2, 0, rot_z), n=24)
        sphere(f"{name}_castor{side}", 0.06, at(0.3, side * 0.2, 0.06), "black", subdiv=1)
        box(f"{name}_handle{side}", (0.03, 0.03, 0.55), at(-0.27, side * 0.21, 0.5), "silver", bevel=0, rot=(0, -0.2, rot_z))
        box(f"{name}_arm{side}", (0.36, 0.04, 0.03), at(0.02, side * 0.25, 0.7), "black", bevel=0, rot=r)
    box(f"{name}_foot", (0.18, 0.36, 0.02), at(0.36, 0, 0.12), "silver", bevel=0, rot=r)
    if occupant:
        L.human(f"{name}_p", at(-0.02, 0, 0.02), rot_z=rot_z, seed=seed, pose="sit", outfit="patient")


@L.lowpoly
def stretcher(name, loc, rot_z=0.0, patient=True, seed=0):
    at = _at(loc, rot_z)
    r = (0, 0, rot_z)
    box(f"{name}_frame", (2.0, 0.6, 0.06), at(0, 0, 0.8), "silver", bevel=0.01, rot=r)
    for dx in (-0.8, 0.8):
        box(f"{name}_x{dx}", (0.04, 0.5, 0.74), at(dx, 0, 0.06), "silver", bevel=0, rot=r)
        for dy in (-0.24, 0.24):
            sphere(f"{name}_w{dx}{dy}", 0.06, at(dx, dy, 0.06), "black", subdiv=1)
    box(f"{name}_pad", (1.9, 0.56, 0.1), at(0, 0, 0.86), "sky_blue", bevel=0.03, rot=r)
    if patient:
        sphere(f"{name}_head", 0.11, at(-0.72, 0, 1.03), random.Random(seed).choice(L.SKINS), subdiv=2)
        box(f"{name}_sheet", (1.3, 0.52, 0.16), at(0.18, 0, 0.94), "cloth_white", bevel=0.05, rot=r)


# ------------------------------------------------------------------ diagnostics & data

def ct_scanner(name, loc, rot_z=0.0):
    """CT scanner: upright gantry ring with LED halo, couch running through the bore along local +x."""
    at = _at(loc, rot_z)
    r = (0, 0, rot_z)
    box(f"{name}_base", (0.9, 1.7, 0.55), at(0, 0, 0), "robot_white", bevel=0.08, rot=r)
    disc_ring(f"{name}_gantry", 1.35, 0.45, at(0, 0, 1.4), 1.0, "robot_white", rot=(0, math.pi / 2, rot_z), n=48)
    disc_ring(f"{name}_trim", 1.36, 1.2, at(-0.51, 0, 1.4), 0.03, "accent_blue", rot=(0, math.pi / 2, rot_z), n=48)
    disc_ring(f"{name}_halo", 0.62, 0.5, at(-0.51, 0, 1.4), 0.02, "led_cyan", rot=(0, math.pi / 2, rot_z), n=40)
    box(f"{name}_pedestal", (1.3, 0.45, 0.78), at(1.35, 0, 0), "robot_white", bevel=0.05, rot=r)
    box(f"{name}_couch", (2.8, 0.52, 0.1), at(0.9, 0, 0.8), "accent_blue", bevel=0.03, rot=r)
    box(f"{name}_pad", (2.0, 0.46, 0.06), at(1.3, 0, 0.9), "mattress", bevel=0.02, rot=r)
    sphere(f"{name}_phead", 0.11, at(0.45, 0, 1.06), "skin1", subdiv=2)
    box(f"{name}_pbody", (1.35, 0.44, 0.16), at(1.3, 0, 0.94), "gown", bevel=0.05, rot=r)


@L.lowpoly
def server_rack(name, loc, rot_z=0.0, seed=0):
    """Rack cabinet with its door facing local -y and rows of status LEDs."""
    rnd = random.Random(seed)
    at = _at(loc, rot_z)
    r = (0, 0, rot_z)
    box(f"{name}_body", (0.66, 1.05, 2.15), at(0, 0, 0), "darkgray", bevel=0.02, rot=r)
    box(f"{name}_door", (0.6, 0.02, 2.0), at(0, -0.53, 0.07), "carglass", bevel=0, rot=r)
    leds = ("led_blue", "led_cyan", "led_green")
    for k in range(9):
        box(f"{name}_led{k}", (0.44 * (0.5 + rnd.random() * 0.5), 0.015, 0.035), at(-0.05, -0.545, 0.25 + k * 0.2), leds[rnd.randrange(3)], bevel=0, rot=r)


@L.lowpoly
def workstation(name, loc, rot_z=0.0, screens=("screen_monitor",), seed=0, person=True, outfit=None):
    """Desk with one or more monitors facing a chair on local -y; optional seated person."""
    at = _at(loc, rot_z)
    r = (0, 0, rot_z)
    w = 0.7 * len(screens) + 0.5
    box(f"{name}_top", (w, 0.75, 0.04), at(0, 0, 0.72), "robot_white", bevel=0.012, rot=r)
    box(f"{name}_front", (w, 0.03, 0.4), at(0, 0.36, 0.32), "accent_blue", bevel=0.005, rot=r)
    for sx in (-1, 1):
        box(f"{name}_leg{sx}", (0.04, 0.7, 0.72), at(sx * (w / 2 - 0.05), 0, 0), "robot_white", bevel=0.01, rot=r)
    face = rot_z - math.pi / 2
    for k, scr in enumerate(screens):
        off = (k - (len(screens) - 1) / 2) * 0.68
        box(f"{name}_neck{k}", (0.04, 0.03, 0.2), at(off, 0.2, 0.76), "midgray", bevel=0, rot=r)
        angle = face + (off * -0.35)
        c = at(off, 0.2, 1.1)
        screen_at(f"{name}_scr{k}", (0.6, 0.36), c, angle, scr, bezel=0.025, depth=0.03)
    box(f"{name}_kb", (0.42, 0.14, 0.02), at(0, -0.12, 0.76), "offwhite", bevel=0.005, rot=r)
    L.office_chair(f"{name}_chair", at(0, -0.72, 0), rot_z=rot_z + math.pi / 2, fabric="teal")
    if person:
        L.human(f"{name}_p", at(0, -0.74, 0), rot_z=rot_z + math.pi / 2, seed=seed, pose="sit", outfit=outfit)


@L.lowpoly
def kiosk(name, loc, face, screen="screen_kiosk"):
    """Self-service kiosk; screen faces compass angle `face`."""
    x, y, z = loc
    rz = face + math.pi / 2
    box(f"{name}_base", (0.7, 0.5, 0.08), (x, y, z), "robot_white", bevel=0.02, rot=(0, 0, rz))
    box(f"{name}_body", (0.56, 0.3, 1.55), (x, y, z + 0.08), "robot_white", bevel=0.06, rot=(0, 0, rz))
    box(f"{name}_stripe", (0.58, 0.31, 0.08), (x, y, z + 0.45), "accent_blue", bevel=0.01, rot=(0, 0, rz))
    n = (math.cos(face), math.sin(face))
    screen_at(f"{name}_scr", (0.44, 0.62), (x + n[0] * 0.16, y + n[1] * 0.16, z + 1.25), face, screen, bezel=0)
    box(f"{name}_led", (0.46, 0.02, 0.03), (x + n[0] * 0.155, y + n[1] * 0.155, z + 1.62), "led_cyan", bevel=0, rot=(0, 0, rz))


# ------------------------------------------------------------------ robots & vehicles

def humanoid_robot(name, loc, rot_z=0.0):
    """White service robot with a dark visor and glowing chest panel, facing +x of rot_z."""
    at = _at(loc, rot_z)
    r = (0, 0, rot_z)
    for side in (-1, 1):
        cyl(f"{name}_leg{side}", 0.075, 0.78, at(0, side * 0.12, 0.05), "robot_white", verts=14)
        box(f"{name}_foot{side}", (0.26, 0.13, 0.07), at(0.05, side * 0.12, 0), "darkgray", bevel=0.02, rot=r)
        sphere(f"{name}_knee{side}", 0.07, at(0.01, side * 0.12, 0.45), "darkgray", subdiv=1)
        sphere(f"{name}_shoulder{side}", 0.08, at(0, side * 0.26, 1.36), "darkgray", subdiv=1)
        box(f"{name}_arm{side}", (0.11, 0.11, 0.56), at(0.02, side * 0.29, 0.82), "robot_white", bevel=0.04, rot=(0, -0.15, rot_z))
    box(f"{name}_hips", (0.24, 0.34, 0.16), at(0, 0, 0.8), "darkgray", bevel=0.04, rot=r)
    box(f"{name}_torso", (0.3, 0.46, 0.5), at(0, 0, 0.94), "robot_white", bevel=0.1, rot=r)
    box(f"{name}_chest", (0.02, 0.2, 0.12), at(0.16, 0, 1.2), "led_cyan", bevel=0, rot=r)
    cyl(f"{name}_neck", 0.05, 0.1, at(0, 0, 1.44), "darkgray", verts=10)
    sphere(f"{name}_head", 0.16, at(0, 0, 1.64), "robot_white", scale=(1.0, 0.95, 1.05), subdiv=2)
    box(f"{name}_visor", (0.08, 0.24, 0.1), at(0.1, 0, 1.6), "black", bevel=0.03, rot=r)
    box(f"{name}_eyes", (0.01, 0.16, 0.025), at(0.145, 0, 1.64), "led_cyan", bevel=0, rot=r)


def telepresence_robot(name, loc, rot_z=0.0):
    """Wheeled telemedicine robot with a tall screen (the doctor on call), facing +x."""
    at = _at(loc, rot_z)
    cyl(f"{name}_base", 0.34, 0.22, at(0, 0, 0.04), "robot_white", verts=28, bevel=0.03)
    cyl(f"{name}_ring", 0.35, 0.03, at(0, 0, 0.18), "led_cyan", verts=28)
    for k in range(3):
        a = rot_z + k * math.tau / 3
        sphere(f"{name}_w{k}", 0.05, (at(0, 0, 0)[0] + math.cos(a) * 0.22, at(0, 0, 0)[1] + math.sin(a) * 0.22, loc[2] + 0.05), "black", subdiv=1)
    cyl(f"{name}_mast", 0.045, 1.05, at(0, 0, 0.26), "silver", verts=10)
    box(f"{name}_head", (0.08, 0.52, 0.4), at(0.02, 0, 1.28), "robot_white", bevel=0.03, rot=(0, 0, rot_z))
    screen_at(f"{name}_scr", (0.46, 0.34), at(0.065, 0, 1.48), rot_z, "screen_tele", bezel=0)
    sphere(f"{name}_cam", 0.03, at(0.07, 0, 1.7), "black", subdiv=1)


def drone(name, loc, rot_z=0.0):
    """Delivery drone: body, four arms and rotor discs (returned so they can spin), parcel below."""
    at = _at(loc, rot_z)
    r = (0, 0, rot_z)
    box(f"{name}_body", (0.7, 0.45, 0.2), at(0, 0, 0), "robot_white", bevel=0.08, rot=r)
    box(f"{name}_stripe", (0.72, 0.46, 0.05), at(0, 0, 0.08), "orange", bevel=0.02, rot=r)
    box(f"{name}_parcel", (0.34, 0.3, 0.26), at(0, 0, -0.34), "orange", bevel=0.02, rot=r)
    box(f"{name}_cross", (0.02, 0.2, 0.06), at(0.175, 0, -0.24), "robot_white", bevel=0, rot=r)
    box(f"{name}_cross2", (0.02, 0.06, 0.2), at(0.175, 0, -0.31), "robot_white", bevel=0, rot=r)
    rotors = []
    for k in range(4):
        a = rot_z + math.pi / 4 + k * math.pi / 2
        px, py = loc[0] + math.cos(a) * 0.62, loc[1] + math.sin(a) * 0.62
        box(f"{name}_arm{k}", (0.62, 0.06, 0.05), ((loc[0] + px) / 2, (loc[1] + py) / 2, loc[2] + 0.1), "darkgray", bevel=0, rot=(0, 0, a))
        cyl(f"{name}_motor{k}", 0.06, 0.1, (px, py, loc[2] + 0.1), "darkgray", verts=12)
        rotors.append(cyl(f"{name}_rotor{k}", 0.3, 0.012, (px, py, loc[2] + 0.21), "holo", verts=20))
    sphere(f"{name}_led", 0.04, at(0.3, 0, -0.02), "led_red", subdiv=1)
    return rotors


def ambulance(name, loc, rot_z=0.0):
    """Van-based ambulance: stripes, blue crosses, lettering and a red / blue light bar (parts named *_lb_*)."""
    L.van(name, loc, rot_z, paint="robot_white")
    at = _at(loc, rot_z)
    r = (0, 0, rot_z)
    for side in (-1, 1):
        box(f"{name}_stripe{side}", (5.1, 0.02, 0.22), at(0, side * 0.96, 0.95), "orange", bevel=0, rot=r)
        box(f"{name}_stripe2{side}", (5.1, 0.02, 0.07), at(0, side * 0.96, 1.2), "cross_red", bevel=0, rot=r)
        box(f"{name}_crossv{side}", (0.2, 0.02, 0.62), at(-1.0, side * 0.965, 1.3), "accent_blue", bevel=0, rot=r)
        box(f"{name}_crossh{side}", (0.62, 0.02, 0.2), at(-1.0, side * 0.965, 1.51), "accent_blue", bevel=0, rot=r)
        L.text_mesh(f"{name}_txt{side}", "AMBULANCE", at(0.9, side * 0.97, 1.36), 0.26, 0.02, "cross_red", rot=(math.pi / 2, 0, rot_z + (0 if side < 0 else math.pi)))
    box(f"{name}_crossb", (0.02, 0.2, 0.6), at(-2.61, 0, 1.15), "accent_blue", bevel=0, rot=r)
    box(f"{name}_crossb2", (0.02, 0.6, 0.2), at(-2.61, 0, 1.35), "accent_blue", bevel=0, rot=r)
    box(f"{name}_barbase", (0.3, 1.3, 0.06), at(1.4, 0, 2.2), "darkgray", bevel=0.02, rot=r)
    box(f"{name}_lb_red", (0.26, 0.6, 0.14), at(1.4, -0.33, 2.26), "led_red", bevel=0.02, rot=r)
    box(f"{name}_lb_blue", (0.26, 0.6, 0.14), at(1.4, 0.33, 2.26), "led_blue", bevel=0.02, rot=r)


# ------------------------------------------------------------------ fittings

def curved_desk(name, center, r_in, r_out, a0, a1, z, h=1.05, n=20):
    """Reception counter following an arc (angles in radians), with a wood top and LED base line."""
    cx, cy = center

    def arc(rr, lo, hi, steps):
        return [(cx + rr * math.cos(lo + (hi - lo) * k / steps), cy + rr * math.sin(lo + (hi - lo) * k / steps)) for k in range(steps + 1)]

    body = arc(r_out, a0, a1, n) + list(reversed(arc(r_in, a0, a1, n)))
    A.solid(f"{name}_body", body, z, h, "robot_white")
    top = arc(r_out + 0.06, a0 - 0.01, a1 + 0.01, n) + list(reversed(arc(r_in - 0.08, a0 - 0.01, a1 + 0.01, n)))
    A.solid(f"{name}_top", top, z + h, 0.05, "woodlight")
    band = arc(r_out + 0.015, a0, a1, n) + list(reversed(arc(r_out - 0.01, a0, a1, n)))
    A.solid(f"{name}_ledband", band, z + 0.12, 0.05, "led_cyan")
    A.solid(f"{name}_accent", band, z + 0.5, 0.16, "accent_blue")


@L.lowpoly
def chair_row(name, loc, n=4, rot_z=0.0, color="teal"):
    """Row of linked waiting seats facing +x of rot_z."""
    at = _at(loc, rot_z)
    r = (0, 0, rot_z)
    w = n * 0.58
    box(f"{name}_beam", (0.1, w, 0.06), at(0, 0, 0.3), "silver", bevel=0, rot=r)
    for sy in (-w / 2 + 0.1, w / 2 - 0.1):
        box(f"{name}_leg{sy:.1f}", (0.5, 0.05, 0.3), at(0, sy, 0), "silver", bevel=0, rot=r)
    for k in range(n):
        dy = -w / 2 + 0.29 + k * 0.58
        box(f"{name}_seat{k}", (0.48, 0.5, 0.07), at(0.02, dy, 0.4), color, bevel=0.03, rot=r)
        box(f"{name}_back{k}", (0.06, 0.5, 0.48), at(-0.23, dy, 0.44), color, bevel=0.03, rot=(0, -0.12, rot_z))


@L.lowpoly
def topiary(name, loc, h=2.4, seed=0, planter="robot_white"):
    """Clipped ball tree in a square white planter (the rows along the artwork's windows)."""
    rnd = random.Random(seed)
    x, y, z = loc
    box(f"{name}_planter", (0.8, 0.8, 0.7), (x, y, z), planter, bevel=0.05)
    box(f"{name}_soil", (0.7, 0.7, 0.02), (x, y, z + 0.69), "soil", bevel=0)
    cyl(f"{name}_trunk", 0.05, h * 0.55, (x, y, z + 0.7), "bark", verts=8)
    clumps = [((x + rnd.uniform(-0.15, 0.15), y + rnd.uniform(-0.15, 0.15), z + 0.7 + h * (0.6 + 0.12 * k)), 0.42 - 0.07 * k, seed * 17 + k) for k in range(3)]
    A.foliage(f"{name}_crown", clumps, subdiv=1)


def flower_bed(name, x0, y0, x1, y1, z, seed=0, colours=("flower_pink", "flower_yellow", "flower_purple", "flower_red")):
    """Raised planter with a leafy mound and dense dots of colour."""
    rnd = random.Random(seed)
    box(f"{name}_planter", (x1 - x0, y1 - y0, 0.45), ((x0 + x1) / 2, (y0 + y1) / 2, z), "robot_white", bevel=0.05)
    clumps = []
    for k in range(int((x1 - x0) * (y1 - y0) * 1.4) + 2):
        clumps.append(((rnd.uniform(x0 + 0.25, x1 - 0.25), rnd.uniform(y0 + 0.25, y1 - 0.25), z + 0.5), rnd.uniform(0.22, 0.34), seed * 31 + k))
    A.foliage(f"{name}_leaves", clumps, mats=("leafv", "leafv_dark"), subdiv=1)
    for ci, col in enumerate(colours):
        bm = bmesh.new()
        for k in range(int((x1 - x0) * (y1 - y0) * 3) + 3):
            g = bmesh.ops.create_icosphere(bm, subdivisions=1, radius=rnd.uniform(0.06, 0.1))
            bmesh.ops.translate(bm, vec=Vector((rnd.uniform(x0 + 0.2, x1 - 0.2), rnd.uniform(y0 + 0.2, y1 - 0.2), z + 0.62 + rnd.uniform(0, 0.16))), verts=g["verts"])
        L._finish(bm, f"{name}_flowers{ci}", col)


def escalator(name, x, y0, y1, z0, z1, width=1.1):
    """Escalator rising along +y from (y0, z0) to (y1, z1): stepped deck, glass balustrades, black handrails."""
    run = y1 - y0
    flat = 1.2
    rise = z1 - z0
    n = max(8, int(rise / 0.2))
    slope = run - 2 * flat
    prof = [(0.0, 0.0), (flat, 0.0)]
    for k in range(n):
        prof += [(flat + slope * k / n, rise * (k + 1) / n), (flat + slope * (k + 1) / n, rise * (k + 1) / n)]
    prof += [(run, rise), (run, rise - 0.6), (flat + slope, rise - 0.6), (flat, -0.6), (0.0, -0.6)]
    L.prism(f"{name}_steps", prof, width, (x, y0, z0), "darkgray", rot_z=math.pi / 2, bevel=0)
    for side in (-1, 1):
        sx = x + side * (width / 2 + 0.06)
        bal = [(0.0, 0.1), (flat + 0.2, 0.1), (flat + slope + 0.2, rise + 0.1), (run, rise + 0.1), (run, rise + 1.05), (flat + slope, rise + 1.05), (flat, 1.05), (0.0, 1.05)]
        L.prism(f"{name}_glass{side}", bal, 0.03, (sx, y0, z0), "glass", rot_z=math.pi / 2, bevel=0)
        skirt = [(0.0, -0.6), (flat, -0.6), (flat + slope, rise - 0.6), (run, rise - 0.6), (run, rise + 0.12), (flat + slope, rise + 0.12), (flat, 0.12), (0.0, 0.12)]
        L.prism(f"{name}_skirt{side}", skirt, 0.12, (sx, y0, z0), "silver", rot_z=math.pi / 2, bevel=0)
        rail = [(0.0, 1.05), (flat, 1.05), (flat + slope, rise + 1.05), (run, rise + 1.05), (run, rise + 1.13), (flat + slope, rise + 1.13), (flat, 1.13), (0.0, 1.13)]
        L.prism(f"{name}_rail{side}", rail, 0.08, (sx, y0, z0), "black", rot_z=math.pi / 2, bevel=0)


def mri(name, loc, rot_z=0.0):
    """MRI: squared-off housing with a round bore along local x, couch sliding out on +x."""
    at = _at(loc, rot_z)
    outer = A.outline(A.rect_poly(0, 0, 2.6, 2.4), 0.7, 0.0, 11)
    bore = [(0.36 * math.cos(math.atan2(y, x)), 0.36 * math.sin(math.atan2(y, x))) for x, y in outer]  # same angles: clean band
    housing = A.ring(f"{name}_housing", outer, bore, -0.9, 1.8, "robot_white")
    housing.rotation_euler = (0, math.pi / 2, rot_z)
    housing.location = at(0, 0, 1.3)
    disc_ring(f"{name}_trim", 1.0, 0.9, at(-0.91, 0, 1.3), 0.02, "teal", rot=(0, math.pi / 2, rot_z), n=40)
    disc_ring(f"{name}_halo", 0.46, 0.38, at(-0.91, 0, 1.3), 0.02, "led_cyan", rot=(0, math.pi / 2, rot_z), n=40)
    box(f"{name}_couch", (2.4, 0.5, 0.1), at(1.6, 0, 0.8), "teal", bevel=0.03, rot=(0, 0, rot_z))
    box(f"{name}_pedestal", (1.6, 0.42, 0.78), at(1.9, 0, 0), "robot_white", bevel=0.05, rot=(0, 0, rot_z))


@L.lowpoly
def bicycle(name, loc, rot_z=0.0, colour="flower_pink"):
    at = _at(loc, rot_z)
    for dx in (-0.52, 0.52):
        disc_ring(f"{name}_wheel{dx}", 0.33, 0.29, at(dx, 0, 0.34), 0.04, "black", rot=(math.pi / 2, 0, rot_z), n=20)
    box(f"{name}_down", (0.75, 0.04, 0.04), at(0.05, 0, 0.5), colour, bevel=0, rot=(0, -0.5, rot_z))
    box(f"{name}_top", (0.6, 0.04, 0.04), at(0.05, 0, 0.78), colour, bevel=0, rot=(0, 0.05, rot_z))
    box(f"{name}_seatpost", (0.04, 0.04, 0.5), at(-0.26, 0, 0.36), colour, bevel=0, rot=(0, -0.3, rot_z))
    box(f"{name}_seat", (0.22, 0.1, 0.05), at(-0.3, 0, 0.86), "black", bevel=0.01, rot=(0, 0, rot_z))
    box(f"{name}_fork", (0.04, 0.04, 0.55), at(0.46, 0, 0.36), "silver", bevel=0, rot=(0, 0.25, rot_z))
    box(f"{name}_bar", (0.05, 0.5, 0.04), at(0.4, 0, 0.92), "black", bevel=0, rot=(0, 0, rot_z))


def cleaning_robot(name, loc, rot_z=0.0):
    at = _at(loc, rot_z)
    cyl(f"{name}_body", 0.28, 0.14, at(0, 0, 0.02), "robot_white", verts=24, bevel=0.03)
    cyl(f"{name}_ring", 0.285, 0.03, at(0, 0, 0.08), "accent_blue", verts=24)
    cyl(f"{name}_eye", 0.08, 0.02, at(0.1, 0, 0.16), "led_cyan", verts=12)


def delivery_robot(name, loc, rot_z=0.0):
    at = _at(loc, rot_z)
    r = (0, 0, rot_z)
    box(f"{name}_chassis", (0.7, 0.5, 0.18), at(0, 0, 0.06), "darkgray", bevel=0.04, rot=r)
    for dx in (-0.24, 0.24):
        for dy in (-0.26, 0.26):
            sphere(f"{name}_w{dx}{dy}", 0.08, at(dx, dy, 0.08), "black", subdiv=1)
    box(f"{name}_box", (0.66, 0.46, 0.6), at(0, 0, 0.24), "robot_white", bevel=0.06, rot=r)
    box(f"{name}_lid", (0.62, 0.42, 0.04), at(0, 0, 0.84), "accent_blue", bevel=0.01, rot=r)
    box(f"{name}_face", (0.02, 0.3, 0.12), at(0.34, 0, 0.55), "led_cyan", bevel=0, rot=r)
    cyl(f"{name}_flag", 0.01, 0.6, at(-0.25, 0.15, 0.88), "silver", verts=6)
    box(f"{name}_pennant", (0.02, 0.16, 0.1), at(-0.25, 0.23, 1.38), "orange", bevel=0, rot=r)


def floor_strip(name, pts, width, z, mat):
    """Painted line along a polyline (wayfinding stripes on the floor)."""
    for i, (a, b) in enumerate(zip(pts, pts[1:])):
        ln = math.hypot(b[0] - a[0], b[1] - a[1])
        box(f"{name}{i}", (ln + width, width, 0.004), ((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, z), mat, bevel=0, rot=(0, 0, math.atan2(b[1] - a[1], b[0] - a[0])))
