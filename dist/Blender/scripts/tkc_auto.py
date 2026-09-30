"""Autonomous-systems props for the dioramas (built on tkc_lib / tkc_arch / tkc_med / tkc_cable).

Conventions as in tkc_lib: loc = bottom centre, rot_z = heading (vehicles and robots face local +x), `face` =
compass angle a screen looks towards. Builders that animate (robot arms, turbine rotors) create "move" nodes
carrying the extras baked.jsx reads (swing / spin).
"""
import math
import random

from mathutils import Vector

import tkc_arch as A
import tkc_cable as C
import tkc_lib as L
import tkc_med as M
from tkc_lib import box, cyl, group, sphere

tubes = C.tubes


def _at(loc, rot_z):
    x, y, z = loc
    c, s = math.cos(rot_z), math.sin(rot_z)
    return lambda dx, dy, dz: (x + c * dx - s * dy, y + s * dx + c * dy, z + dz)


def diamond(name, loc, r=0.35, mat="holo"):
    """Floating hologram marker: two square pyramids tip to tip."""
    x, y, z = loc
    cyl(f"{name}_top", r, r * 1.1, (x, y, z), mat, verts=4, r2=0.0)
    cyl(f"{name}_bot", r, r * 1.1, (x, y, z), mat, verts=4, r2=0.0, rot=(math.pi, 0, 0))


# ------------------------------------------------------------------ vehicles

def shuttle(name, loc, rot_z=0.0):
    """Driverless shuttle bus (about 6.4 m) with a glass band, lidar crown, sensor ring and V2X marker."""
    at = _at(loc, rot_z)
    r = (0, 0, rot_z)
    body = L._arched(-3.2, 3.2, 0.32, (-2.1, 2.1), 0.46) + [(3.2, 0.9), (3.35, 1.5), (3.2, 2.7), (2.8, 2.95), (-2.8, 2.95), (-3.2, 2.7), (-3.35, 1.5), (-3.2, 0.9)]
    L.prism(f"{name}_body", body, 2.2, at(0, 0, 0), "robot_white", rot_z=rot_z, bevel=0.12)
    L.prism(f"{name}_skirt", L._arched(-3.25, 3.25, 0.3, (-2.1, 2.1), 0.48) + [(3.3, 0.95), (-3.3, 0.95)], 2.24, at(0, 0, 0), "auto_blue", rot_z=rot_z, bevel=0.05)
    L.prism(f"{name}_glass", [(-3.0, 1.25), (3.05, 1.25), (3.25, 1.55), (3.05, 2.55), (-3.05, 2.55), (-3.28, 1.55)], 2.26, at(0, 0, 0), "carglass", rot_z=rot_z, bevel=0.04)
    for side in (-1, 1):
        box(f"{name}_led{side}", (6.0, 0.02, 0.05), at(0, side * 1.13, 1.15), "led_cyan", bevel=0, rot=r)
        for dx in (-2.1, 2.1):
            cyl(f"{name}_w{dx}{side}", 0.42, 0.28, at(dx, side * 0.98 + 0.14, 0.42), "tyre", verts=20, rot=(math.pi / 2, 0, rot_z), bevel=0.04)
    for dx, mat in ((3.34, "led_white"), (-3.34, "led_red")):
        box(f"{name}_lamp{dx}", (0.03, 1.6, 0.08), at(dx, 0, 0.95), mat, bevel=0, rot=r)
    cyl(f"{name}_lidar", 0.22, 0.2, at(0.6, 0, 2.95), "darkgray", verts=16)
    cyl(f"{name}_lidar_led", 0.23, 0.04, at(0.6, 0, 3.05), "led_cyan", verts=16)
    box(f"{name}_pod", (1.6, 1.2, 0.18), at(-1.0, 0, 2.95), "robot_white", bevel=0.06, rot=r)
    M.disc_ring(f"{name}_ring", 3.6, 3.45, at(0, 0, 0.05), 0.02, "holo", n=40)
    diamond(f"{name}_v2x", at(0, 0, 4.1), 0.4)


def robotaxi(name, loc, rot_z=0.0, paint="robot_white", marker=True):
    """Driverless pod car (about 3.9 m, the artwork's white pod): rounded shell, black glass band, lidar dome."""
    at = _at(loc, rot_z)
    r = (0, 0, rot_z)
    body = L._arched(-1.95, 1.95, 0.25, (-1.25, 1.25), 0.4) + [(1.95, 0.55), (2.0, 0.85), (1.6, 1.25), (0.9, 1.72), (-1.5, 1.74), (-1.95, 1.2), (-2.0, 0.6)]
    L.prism(f"{name}_body", body, 1.72, at(0, 0, 0), paint, rot_z=rot_z, bevel=0.12, segments=3)
    L.prism(f"{name}_glass", [(-1.85, 1.08), (1.55, 1.1), (0.88, 1.6), (-1.45, 1.62)], 1.76, at(0, 0, 0), "carglass", rot_z=rot_z, bevel=0.05)
    for side in (-1, 1):
        for dx in (-1.25, 1.25):
            cyl(f"{name}_w{dx}{side}", 0.33, 0.24, at(dx, side * 0.8 + 0.12, 0.33), "tyre", verts=20, rot=(math.pi / 2, 0, rot_z), bevel=0.04)
            cyl(f"{name}_hub{dx}{side}", 0.18, 0.02, at(dx, side * 0.921 + (0.02 if side > 0 else 0), 0.33), "silver", verts=14, rot=(math.pi / 2, 0, rot_z))
        box(f"{name}_eye{side}", (0.03, 0.34, 0.07), at(1.98, side * 0.48, 0.72), "led_blue", bevel=0, rot=r)
    box(f"{name}_tail", (0.03, 1.3, 0.06), at(-1.99, 0, 0.9), "led_red", bevel=0, rot=r)
    cyl(f"{name}_dome", 0.2, 0.16, at(-0.2, 0, 1.73), "darkgray", verts=16)
    sphere(f"{name}_dome_top", 0.16, at(-0.2, 0, 1.9), "led_cyan", scale=(1, 1, 0.5), subdiv=1)
    if marker:
        M.disc_ring(f"{name}_ring", 2.5, 2.38, at(0, 0, 0.05), 0.02, "holo", n=36)


def auto_cart(name, loc, rot_z=0.0):
    """Driverless campus cart: two benches under a canopy on four posts, sensor bar and glowing hubs."""
    at = _at(loc, rot_z)
    r = (0, 0, rot_z)
    box(f"{name}_chassis", (2.6, 1.25, 0.35), at(0, 0, 0.25), "robot_white", bevel=0.08, rot=r)
    box(f"{name}_nose", (0.5, 1.2, 0.45), at(1.1, 0, 0.55), "robot_white", bevel=0.12, rot=r)
    for k, dx in enumerate((0.25, -0.75)):
        box(f"{name}_seat{k}", (0.5, 1.1, 0.14), at(dx, 0, 0.62), "fabric", bevel=0.04, rot=r)
        box(f"{name}_back{k}", (0.1, 1.1, 0.5), at(dx - 0.28, 0, 0.72), "fabric", bevel=0.04, rot=r)
    for dx in (-1.15, 0.85):
        for side in (-1, 1):
            cyl(f"{name}_post{dx}{side}", 0.03, 1.35, at(dx, side * 0.55, 0.6), "frame_dark", verts=8)
    box(f"{name}_roof", (2.3, 1.35, 0.08), at(-0.15, 0, 1.95), "robot_white", bevel=0.03, rot=r)
    box(f"{name}_lidar", (0.2, 0.9, 0.08), at(0.85, 0, 2.03), "darkgray", bevel=0.02, rot=r)
    for side in (-1, 1):
        for dx in (-0.85, 0.85):
            cyl(f"{name}_w{dx}{side}", 0.26, 0.2, at(dx, side * 0.6 + 0.1, 0.26), "tyre", verts=18, rot=(math.pi / 2, 0, rot_z))
            cyl(f"{name}_glow{dx}{side}", 0.2, 0.02, at(dx, side * 0.701 + (0.02 if side > 0 else 0), 0.26), "led_pink", verts=18, rot=(math.pi / 2, 0, rot_z))
    M.disc_ring(f"{name}_ring", 1.9, 1.8, at(0, 0, 0.05), 0.02, "holo", n=32)


# ------------------------------------------------------------------ robots

def robot_arm(name, loc, rot_z=0.0, phase=0.0, colour="arm_orange", reach=1.8):
    """Six-axis style industrial arm on a hazard plate: the turret swings to and fro (swing z) and the arm
    pitches at the shoulder (swing y) in the browser. Static pedestal, two nested 'move' nodes."""
    x, y, z = loc
    box(f"{name}_plate", (1.6, 1.6, 0.03), (x, y, z), "safety_yellow", bevel=0)
    box(f"{name}_plate_in", (1.2, 1.2, 0.035), (x, y, z), "hazard_black", bevel=0)
    cyl(f"{name}_ped", 0.46, 0.5, (x, y, z + 0.035), "darkgray", verts=24, bevel=0.03)
    t, u = f"{name}t", f"{name}u"
    with group("move"):
        cyl(f"{t}_turret", 0.42, 0.3, (0, 0, 0.54), colour, verts=24)
        box(f"{t}_housing", (0.66, 0.58, 0.5), (0, 0, 0.82), colour, bevel=0.1)
        cyl(f"{t}_motor", 0.2, 0.72, (0, 0.36, 1.14), "darkgray", verts=16, rot=(math.pi / 2, 0, 0))
    turret = L.rigid(L._parts(t), t, (0, 0, 0.54))
    elbow = (reach * 0.25, 0, 2.35)
    tip = (reach, 0, 2.05)
    with group("move"):
        tubes(f"{u}_upper", [((0, 0, 1.14), elbow, 0.18)], colour, verts=16)
        sphere(f"{u}_elbow", 0.22, elbow, "darkgray", subdiv=2)
        tubes(f"{u}_fore", [(elbow, tip, 0.13)], colour, verts=16)
        tubes(f"{u}_wrist", [(tip, (tip[0] + 0.12, 0, tip[2] - 0.18), 0.09)], "darkgray", verts=12)
        tubes(f"{u}_led", [((tip[0] + 0.03, 0, tip[2] - 0.04), (tip[0] + 0.06, 0, tip[2] - 0.08), 0.1)], "led_cyan", verts=12)
        box(f"{u}_palm", (0.16, 0.22, 0.08), (tip[0] + 0.16, 0, tip[2] - 0.3), "darkgray", bevel=0.01)
        for s in (-1, 1):
            box(f"{u}_finger{s}", (0.05, 0.04, 0.24), (tip[0] + 0.16, s * 0.08, tip[2] - 0.54), "darkgray", bevel=0)
    upper = L.rigid(L._parts(u), u, (0, 0, 1.14))
    upper.parent = turret
    upper.location = (0, 0, 1.14 - 0.54)  # parent sits at its pivot: keep the child in the turret's frame
    for k, v in (("swing", phase + 1.1), ("swing_axis", "y"), ("swing_amp", 0.16), ("swing_speed", 1.3)):
        upper[k] = v
    return L.place(turret, (x, y, z + 0.54), rot_z, swing=phase, swing_amp=0.85, swing_speed=0.6)


def service_robot(name, loc, rot_z=0.0, screen="screen_chest"):
    """Humanoid service robot of the artwork: round base, white body, black face with blue eyes, chest screen."""
    at = _at(loc, rot_z)
    r = (0, 0, rot_z)
    cyl(f"{name}_base", 0.34, 0.25, at(0, 0, 0), "robot_white", verts=24, bevel=0.04)
    cyl(f"{name}_base_led", 0.345, 0.03, at(0, 0, 0.18), "led_cyan", verts=24)
    cyl(f"{name}_waist", 0.22, 0.3, at(0, 0, 0.25), "darkgray", verts=20, r2=0.26)
    box(f"{name}_torso", (0.42, 0.56, 0.62), at(0, 0, 0.55), "robot_white", bevel=0.14, rot=r)
    M.screen_at(f"{name}_chest", (0.3, 0.24), at(0.215, 0, 0.92), rot_z, screen, bezel=0.02, depth=0.02)
    for side in (-1, 1):
        sphere(f"{name}_shoulder{side}", 0.1, at(0, side * 0.33, 1.08), "robot_white", subdiv=2)
        tubes(f"{name}_arm{side}", [(at(0, side * 0.35, 1.02), at(0.12, side * 0.38, 0.72), 0.065), (at(0.12, side * 0.38, 0.72), at(0.28, side * 0.34, 0.6), 0.055)], "robot_white", verts=10)
        sphere(f"{name}_hand{side}", 0.06, at(0.3, side * 0.34, 0.58), "darkgray", subdiv=1)
    cyl(f"{name}_neck", 0.06, 0.1, at(0, 0, 1.17), "darkgray", verts=10)
    sphere(f"{name}_head", 0.22, at(0, 0, 1.43), "robot_white", scale=(1.0, 1.05, 0.95), subdiv=2)
    sphere(f"{name}_face", 0.17, at(0.09, 0, 1.43), "black", scale=(0.7, 1.0, 0.85), subdiv=2)
    for side in (-1, 1):
        sphere(f"{name}_eye{side}", 0.035, at(0.2, side * 0.065, 1.46), "led_blue", subdiv=1)
    cyl(f"{name}_antenna", 0.012, 0.16, at(0, 0, 1.62), "silver", verts=6)
    sphere(f"{name}_antenna_tip", 0.025, at(0, 0, 1.79), "led_cyan", subdiv=1)


def patrol_robot(name, loc, rot_z=0.0):
    """Security patrol robot: egg-shaped white body, 360-degree camera band and blue light ring."""
    at = _at(loc, rot_z)
    cyl(f"{name}_base", 0.42, 0.18, at(0, 0, 0.04), "darkgray", verts=24, bevel=0.03)
    for k in range(4):
        a = rot_z + math.pi / 4 + k * math.pi / 2
        sphere(f"{name}_w{k}", 0.08, (loc[0] + math.cos(a) * 0.3, loc[1] + math.sin(a) * 0.3, loc[2] + 0.08), "black", subdiv=1)
    sphere(f"{name}_body", 0.44, at(0, 0, 0.62), "robot_white", scale=(1.0, 1.0, 1.25), subdiv=3)
    cyl(f"{name}_band", 0.405, 0.12, at(0, 0, 0.92), "bezel", verts=28)
    cyl(f"{name}_ring", 0.45, 0.04, at(0, 0, 0.5), "led_blue", verts=28)
    sphere(f"{name}_cam", 0.07, at(0.4, 0, 0.98), "led_cyan", subdiv=1)
    cyl(f"{name}_beacon", 0.07, 0.1, at(0, 0, 1.15), "led_blue", verts=12)


def agv(name, loc, rot_z=0.0, kind="cart", seed=0):
    """Automated guided vehicle facing +x: 'cart' (tote cart on top), 'fork' (pallet forks), 'tow' (tug + trailer)."""
    rnd = random.Random(seed)
    at = _at(loc, rot_z)
    r = (0, 0, rot_z)
    if kind == "fork":
        box(f"{name}_body", (1.3, 0.95, 1.1), at(-0.35, 0, 0.1), "robot_white", bevel=0.08, rot=r)
        box(f"{name}_band", (1.32, 0.97, 0.12), at(-0.35, 0, 0.35), "arm_orange", bevel=0.02, rot=r)
        for side in (-1, 1):
            box(f"{name}_mast{side}", (0.1, 0.08, 2.0), at(0.35, side * 0.3, 0.1), "darkgray", bevel=0, rot=r)
            box(f"{name}_fork{side}", (1.1, 0.12, 0.05), at(0.95, side * 0.28, 0.12), "darkgray", bevel=0, rot=r)
        box(f"{name}_pallet", (1.1, 1.0, 0.14), at(0.95, 0, 0.17), "pallet_wood", bevel=0, rot=r)
        box(f"{name}_load", (1.0, 0.9, 0.7), at(0.95, 0, 0.31), "carton", bevel=0.02, rot=r)
        cyl(f"{name}_lidar", 0.1, 0.12, at(-0.35, 0, 1.2), "darkgray", verts=12)
        box(f"{name}_led", (0.02, 0.6, 0.05), at(0.31, 0, 0.8), "led_cyan", bevel=0, rot=r)
        return
    box(f"{name}_base", (1.3, 0.85, 0.3), at(0, 0, 0.05), "arm_orange" if kind == "cart" else "robot_white", bevel=0.06, rot=r)
    box(f"{name}_bumper", (0.04, 0.7, 0.08), at(0.66, 0, 0.15), "led_cyan", bevel=0, rot=r)
    cyl(f"{name}_lidar", 0.08, 0.1, at(0.5, 0, 0.35), "darkgray", verts=12)
    if kind == "cart":
        for sx in (-1, 1):
            for sy in (-1, 1):
                box(f"{name}_leg{sx}{sy}", (0.04, 0.04, 0.9), at(sx * 0.55, sy * 0.36, 0.35), "silver", bevel=0, rot=r)
        for k in range(2):
            box(f"{name}_shelf{k}", (1.2, 0.8, 0.03), at(0, 0, 0.55 + k * 0.5), "silver", bevel=0, rot=r)
            for j in range(2):
                box(f"{name}_tote{k}{j}", (0.5, 0.65, 0.28), at(-0.28 + j * 0.56, 0, 0.58 + k * 0.5), rnd.choice(("tote_blue", "tote_yellow")), bevel=0.01, rot=r)
        return
    # tow: tug with a hitched trailer of parts crates behind
    box(f"{name}_mast", (0.3, 0.6, 0.5), at(-0.3, 0, 0.35), "robot_white", bevel=0.05, rot=r)
    box(f"{name}_hitch", (0.8, 0.08, 0.06), at(-1.05, 0, 0.18), "darkgray", bevel=0, rot=r)
    box(f"{name}_trailer", (1.6, 0.95, 0.12), at(-2.3, 0, 0.3), "silver", bevel=0.02, rot=r)
    for dx in (-2.9, -1.7):
        for side in (-1, 1):
            cyl(f"{name}_tw{dx}{side}", 0.15, 0.1, at(dx, side * 0.45 + 0.05, 0.15), "tyre", verts=12, rot=(math.pi / 2, 0, rot_z))
    for j in range(2):
        box(f"{name}_crate{j}", (0.7, 0.85, 0.55), at(-2.7 + j * 0.8, 0, 0.42), ("tote_blue", "carton")[j], bevel=0.02, rot=r)


def humanoid_carrier(name, loc, rot_z=0.0):
    """The artwork's humanoid robot holding a parts box in front of it."""
    M.humanoid_robot(name, loc, rot_z)
    at = _at(loc, rot_z)
    box(f"{name}_box", (0.4, 0.5, 0.34), at(0.36, 0, 0.9), "carton", bevel=0.02, rot=(0, 0, rot_z))


# ------------------------------------------------------------------ infrastructure

def camera_pillar(name, loc, h=5.0, rings=True):
    """Security pillar: dark column, glass lantern with a glowing core, PTZ domes; returns hologram rings (movers)."""
    x, y, z = loc
    cyl(f"{name}_foot", 0.5, 0.3, (x, y, z), "robot_white", verts=24, bevel=0.04)
    cyl(f"{name}_col", 0.28, h - 1.6, (x, y, z + 0.3), "darkgray", verts=20)
    cyl(f"{name}_core", 0.16, 1.1, (x, y, z + h - 1.3), "led_cyan", verts=16)
    cyl(f"{name}_lantern", 0.34, 1.2, (x, y, z + h - 1.35), "glass", verts=20)
    cyl(f"{name}_cap", 0.4, 0.18, (x, y, z + h - 0.15), "robot_white", verts=24, bevel=0.03)
    for k in range(3):
        a = k * math.tau / 3
        sphere(f"{name}_dome{k}", 0.1, (x + math.cos(a) * 0.36, y + math.sin(a) * 0.36, z + h - 0.25), "bezel", subdiv=1)
    out = []
    if rings:
        with group("move"):
            for k, (zz, rr) in enumerate(((1.6, 0.9), (2.6, 1.2))):
                ring = M.disc_ring(f"{name}_ring{k}", rr, rr - 0.06, (x, y, z + zz), 0.04, "holo", n=36)
                ring["spin"], ring["spin_speed"] = "z", 0.6 + k * 0.3
                ring["bob"], ring["bob_amp"] = k * 1.7 + x * 0.1, 0.2
                out.append(ring)
    return out


def rsu(name, loc, face, h=6.0):
    """Road side unit (V2I): pole with radio unit, antenna fins, camera and a pulsing signal ring."""
    x, y, z = loc
    at = _at(loc, face)
    cyl(f"{name}_pole", 0.1, h, (x, y, z), "frame_dark", verts=12)
    box(f"{name}_arm", (1.4, 0.1, 0.1), at(0.7, 0, h - 0.4), "frame_dark", bevel=0, rot=(0, 0, face))
    box(f"{name}_unit", (0.3, 0.45, 0.6), at(0.15, 0, h - 1.4), "robot_white", bevel=0.03, rot=(0, 0, face))
    box(f"{name}_unit_led", (0.02, 0.3, 0.04), at(0.31, 0, h - 0.95), "led_cyan", bevel=0, rot=(0, 0, face))
    for k in range(3):
        box(f"{name}_fin{k}", (0.05, 0.12, 0.5), at(0.05, -0.2 + k * 0.2, h), "robot_white", bevel=0.01, rot=(0, 0, face))
    box(f"{name}_cam", (0.35, 0.16, 0.16), at(1.3, 0, h - 0.62), "darkgray", bevel=0.03, rot=(0, 0, face))
    with group("move"):
        ring = M.disc_ring(f"{name}_sig", 0.8, 0.72, (x, y, z + h + 0.7), 0.03, "holo", n=32)
        ring["spin"], ring["spin_speed"] = "z", 1.0
        ring["bob"], ring["bob_amp"], ring["bob_speed"] = x * 0.3, 0.15, 2.0


def traffic_light(name, loc, face, h=4.2):
    x, y, z = loc
    at = _at(loc, face)
    cyl(f"{name}_pole", 0.08, h, (x, y, z), "frame_dark", verts=10)
    box(f"{name}_head", (0.28, 0.36, 1.05), at(0.1, 0, h - 1.1), "black", bevel=0.04, rot=(0, 0, face))
    for k, mat in enumerate(("led_red", "cable_yellow", "led_green")):
        cyl(f"{name}_l{k}", 0.11, 0.03, at(0.25, 0, h - 0.25 - k * 0.32), mat if k != 1 else "darkgray", verts=14, rot=(math.pi / 2, 0, face - math.pi / 2))


def gantry(name, x, y0, y1, h=6.0, text="V2I"):
    """Portal over a road running along x: two posts, a truss beam, message panels facing -x and +x, cameras."""
    for y in (y0, y1):
        cyl(f"{name}_post{y}", 0.2, h + 0.6, (x, y, 0.0), "frame_dark", verts=14)
    for k, z in enumerate((h, h + 0.6)):
        tubes(f"{name}_chord{k}", [((x, y0, z), (x, y1, z), 0.1)], "steel", verts=10)
    tubes(f"{name}_web", [((x, y0 + i * (y1 - y0) / 8, h + (0.6 if i % 2 else 0)), (x, y0 + (i + 1) * (y1 - y0) / 8, h + (0 if i % 2 else 0.6)), 0.05) for i in range(8)], "steel", verts=8)
    for s, face in ((-1, math.pi), (1, 0.0)):
        M.screen_at(f"{name}_panel{s}", (3.2, 1.1), (x + s * 0.18, (y0 + y1) / 2, h - 0.6), face, "screen_v2x", bezel=0.06)
        box(f"{name}_cam{s}", (0.3, 0.15, 0.15), (x + s * 0.2, y0 + 1.2, h - 0.3), "darkgray", bevel=0.02)
    L.text_mesh(f"{name}_txt", text, (x + 0.25, (y0 + y1) / 2, h + 0.75), 0.5, 0.05, "auto_blue", rot=(math.pi / 2, 0, math.pi / 2))


def lattice_mast(name, loc, h=20.0):
    """5G / C-V2X lattice tower: three tapered legs, zig-zag bracing, antenna panels and dishes, beacon."""
    x, y, z = loc
    legs = []
    for k in range(3):
        a = k * math.tau / 3 + 0.3
        legs.append((a, 1.3, 0.35))
    segs, brace = [], []
    n = 8
    for i in range(n):
        z0, z1 = z + h * i / n, z + h * (i + 1) / n
        for a, rb, rt in legs:
            r0 = rb + (rt - rb) * i / n
            r1 = rb + (rt - rb) * (i + 1) / n
            segs.append(((x + math.cos(a) * r0, y + math.sin(a) * r0, z0), (x + math.cos(a) * r1, y + math.sin(a) * r1, z1), 0.06))
        for k in range(3):
            a0, a1 = legs[k][0], legs[(k + 1) % 3][0]
            r0 = rb + (rt - rb) * i / n
            r1 = rb + (rt - rb) * (i + 1) / n
            brace.append(((x + math.cos(a0) * r0, y + math.sin(a0) * r0, z0), (x + math.cos(a1) * r1, y + math.sin(a1) * r1, z1), 0.025))
    tubes(f"{name}_legs", segs, "steel", verts=8)
    tubes(f"{name}_brace", brace, "steel", verts=6)
    for k in range(3):
        a = k * math.tau / 3 + math.pi / 3
        for j, zz in enumerate((h - 1.6, h - 4.2)):
            box(f"{name}_ant{k}{j}", (0.12, 0.35, 1.4), (x + math.cos(a) * 0.55, y + math.sin(a) * 0.55, z + zz), "robot_white", bevel=0.03, rot=(0, 0, a))
    cyl(f"{name}_dish", 0.45, 0.15, (x + 0.6, y - 0.4, z + h - 7.0), "robot_white", verts=20, rot=(math.pi / 2, 0, 0.8))
    cyl(f"{name}_top", 0.05, 1.4, (x, y, z + h), "steel", verts=6)
    sphere(f"{name}_beacon", 0.12, (x, y, z + h + 1.4), "led_red", subdiv=1)


def fence(name, pts, h=2.4, gap=None):
    """Security fence along a polyline: posts, see-through panels, top rail with a glowing sensor line.
    gap = (a, b): skip that stretch of the first segment's parameter (a gate)."""
    posts, rails = [], []
    for i, (a, b) in enumerate(zip(pts, pts[1:])):
        a, b = Vector((*a, 0.16)), Vector((*b, 0.16))
        ln = (b - a).length
        n = max(1, round(ln / 2.5))
        for k in range(n + (1 if i == len(pts) - 2 else 0)):
            p = a.lerp(b, k / n)
            if gap and i == 0 and gap[0] < k / n * ln < gap[1]:
                continue
            posts.append((p, p + Vector((0, 0, h + 0.1)), 0.05))
        spans = [(0.0, ln)] if not (gap and i == 0) else [(0.0, gap[0]), (gap[1], ln)]
        for s0, s1 in spans:
            p0, p1 = a.lerp(b, s0 / ln), a.lerp(b, s1 / ln)
            ang = math.atan2(b.y - a.y, b.x - a.x)
            c = (p0 + p1) / 2
            box(f"{name}_panel{i}_{s0:.0f}", ((p1 - p0).length, 0.03, h - 0.3), (c.x, c.y, 0.3), "glass", bevel=0, rot=(0, 0, ang))
            box(f"{name}_sensor{i}_{s0:.0f}", ((p1 - p0).length, 0.04, 0.04), (c.x, c.y, h + 0.12), "led_cyan", bevel=0, rot=(0, 0, ang))
            rails.append((p0 + Vector((0, 0, h)), p1 + Vector((0, 0, h)), 0.035))
            rails.append((p0 + Vector((0, 0, 0.3)), p1 + Vector((0, 0, 0.3)), 0.03))
    tubes(f"{name}_posts", posts, "frame_dark", verts=10)
    tubes(f"{name}_rails", [(a, b, r) for a, b, r in rails], "frame_dark", verts=8)


def ev_charger(name, loc, face):
    at = _at(loc, face)
    box(f"{name}_body", (0.3, 0.55, 1.5), at(0, 0, 0), "robot_white", bevel=0.05, rot=(0, 0, face))
    box(f"{name}_strip", (0.02, 0.4, 0.05), at(0.16, 0, 1.38), "led_green", bevel=0, rot=(0, 0, face))
    M.screen_at(f"{name}_scr", (0.34, 0.24), at(0.16, 0, 1.1), face, "screen_charge", bezel=0.02, depth=0.02)
    lead = C.bezier(at(0.16, 0.2, 0.8), at(0.6, 0.3, 0.3), at(0.9, 0.3, 0.25), at(1.2, 0.3, 0.55), 8)
    tubes(f"{name}_lead", [(a, b, 0.025) for a, b in zip(lead, lead[1:])], "cable_black", verts=6)


def wind_turbine(name, loc, h=22.0, blade=8.0):
    """Tower and nacelle facing -y; the rotor (a mover spinning about Blender y) is returned."""
    x, y, z = loc
    cyl(f"{name}_tower", 0.9, h, (x, y, z), "robot_white", verts=24, r2=0.45)
    box(f"{name}_nacelle", (1.2, 3.2, 1.3), (x, y + 0.4, z + h - 0.3), "robot_white", bevel=0.25)
    box(f"{name}_band", (1.22, 0.8, 1.32), (x, y + 1.5, z + h - 0.31), "auto_blue", bevel=0.1)
    rn = f"{name}r"
    with group("move"):
        sphere(f"{rn}_hub", 0.6, (0, 0, 0), "robot_white", scale=(1, 1.4, 1), subdiv=2)
        for k in range(3):
            a = k * math.tau / 3
            L.prism(f"{rn}_blade{k}", [(-0.35, 0.3), (0.45, 0.3), (0.12, blade), (-0.1, blade)], 0.16, (0, 0, 0), "robot_white", bevel=0.03, segments=1)
            ob = L.COL.objects[f"{rn}_blade{k}"]
            ob.rotation_euler = (0, a, 0)
    rotor = L.rigid(L._parts(rn), rn, (0, 0, 0))
    return L.place(rotor, (x, y - 1.35, z + h + 0.35), 0.0, spin="y", spin_speed=1.1)


def tractor(name, loc, rot_z=0.0):
    """Driverless tractor facing +x: bonnet, sensor mast instead of a cab, big rear wheels, spray boom."""
    at = _at(loc, rot_z)
    r = (0, 0, rot_z)
    box(f"{name}_frame", (3.2, 0.9, 0.5), at(0.1, 0, 0.55), "darkgray", bevel=0.05, rot=r)
    box(f"{name}_bonnet", (1.8, 1.0, 0.8), at(0.7, 0, 0.9), "auto_blue", bevel=0.12, rot=r)
    box(f"{name}_grille", (0.04, 0.8, 0.5), at(1.61, 0, 0.95), "darkgray", bevel=0, rot=r)
    box(f"{name}_pod", (1.2, 1.2, 0.9), at(-0.8, 0, 1.05), "auto_blue", bevel=0.14, rot=r)
    box(f"{name}_pod_glass", (1.0, 1.22, 0.4), at(-0.8, 0, 1.4), "carglass", bevel=0.05, rot=r)
    cyl(f"{name}_mast", 0.05, 0.6, at(-0.8, 0, 1.95), "darkgray", verts=8)
    cyl(f"{name}_lidar", 0.16, 0.14, at(-0.8, 0, 2.55), "darkgray", verts=14)
    cyl(f"{name}_lidar_led", 0.165, 0.03, at(-0.8, 0, 2.62), "led_cyan", verts=14)
    for side in (-1, 1):
        cyl(f"{name}_rw{side}", 0.85, 0.5, at(-0.9, side * 0.9 + 0.25, 0.85), "tyre", verts=24, rot=(math.pi / 2, 0, rot_z), bevel=0.06)
        cyl(f"{name}_rh{side}", 0.45, 0.02, at(-0.9, side * 1.151 + (0.02 if side > 0 else 0), 0.85), "safety_yellow", verts=16, rot=(math.pi / 2, 0, rot_z))
        cyl(f"{name}_fw{side}", 0.5, 0.35, at(1.0, side * 0.8 + 0.175, 0.5), "tyre", verts=20, rot=(math.pi / 2, 0, rot_z), bevel=0.05)
    box(f"{name}_boom", (0.12, 3.6, 0.1), at(-2.0, 0, 0.9), "silver", bevel=0, rot=r)
    for k in range(7):
        box(f"{name}_nozzle{k}", (0.05, 0.05, 0.3), at(-2.0, -1.65 + k * 0.55, 0.6), "darkgray", bevel=0, rot=r)
    box(f"{name}_tank", (0.7, 1.2, 0.8), at(-1.9, 0, 0.95), "robot_white", bevel=0.1, rot=r)


def solar_row(name, x0, x1, y, z=0.16, tilt=0.45):
    items = []
    n = int((x1 - x0) / 2.1)
    for k in range(n):
        x = x0 + 1.05 + k * 2.1
        box(f"{name}_p{k}", (2.0, 1.9, 0.06), (x, y, z + 1.0), "solar", bevel=0.01, rot=(tilt, 0, 0))
        for dy in (-0.55, 0.55):
            cyl(f"{name}_leg{k}{dy}", 0.04, 1.0 + dy * 0.8, (x, y + dy * 0.8, z), "silver", verts=6)
    return items


def robot_dog(name, loc, rot_z=0.0):
    """Quadruped inspection robot facing +x: body, sensor head, four jointed legs."""
    at = _at(loc, rot_z)
    r = (0, 0, rot_z)
    box(f"{name}_body", (0.9, 0.36, 0.24), at(0, 0, 0.5), "arm_orange", bevel=0.06, rot=r)
    box(f"{name}_top", (0.6, 0.3, 0.06), at(-0.05, 0, 0.74), "darkgray", bevel=0.02, rot=r)
    box(f"{name}_head", (0.22, 0.28, 0.16), at(0.52, 0, 0.56), "darkgray", bevel=0.04, rot=r)
    box(f"{name}_eyes", (0.02, 0.2, 0.04), at(0.635, 0, 0.62), "led_cyan", bevel=0, rot=r)
    cyl(f"{name}_lidar", 0.07, 0.08, at(-0.1, 0, 0.8), "darkgray", verts=12)
    for dx in (-0.34, 0.34):
        for side in (-1, 1):
            hip, knee, foot = at(dx, side * 0.2, 0.55), at(dx + 0.12, side * 0.22, 0.3), at(dx, side * 0.22, 0.03)
            tubes(f"{name}_leg{dx}{side}", [(hip, knee, 0.045), (knee, foot, 0.035)], "darkgray", verts=8)
            sphere(f"{name}_foot{dx}{side}", 0.045, foot, "black", subdiv=1)


def robot_pad(name, loc, r=0.65):
    x, y, z = loc
    cyl(f"{name}", r, 0.08, (x, y, z), "robot_white", verts=32, bevel=0.02)
    cyl(f"{name}_led", r + 0.01, 0.03, (x, y, z + 0.04), "led_cyan", verts=32)


def drone_pad(name, loc, s=3.0):
    x, y, z = loc
    box(f"{name}", (s, s, 0.06), (x, y, z), "darkgray", bevel=0.02)
    for k, (dx, sx, sy) in enumerate(((-0.5, 0.18, 1.4), (0.5, 0.18, 1.4), (0.0, 1.0, 0.18))):
        box(f"{name}_h{k}", (sx, sy, 0.005), (x + dx, y, z + 0.06), "paint_white", bevel=0)
    for k in range(4):
        box(f"{name}_led{k}", (0.12, 0.12, 0.04), (x + (k % 2 - 0.5) * (s - 0.3), y + (k // 2 - 0.5) * (s - 0.3), z + 0.06), "led_green", bevel=0)


def info_pole(name, loc, face):
    """Smart pole: slim column with an info screen, IoT head with a light ring."""
    x, y, z = loc
    cyl(f"{name}_pole", 0.1, 3.4, (x, y, z), "robot_white", verts=14)
    M.screen_at(f"{name}_scr", (0.5, 0.9), (x + math.cos(face) * 0.11, y + math.sin(face) * 0.11, z + 1.7), face, "screen_chest", bezel=0.03, depth=0.05)
    cyl(f"{name}_head", 0.16, 0.2, (x, y, z + 3.4), "robot_white", verts=16)
    cyl(f"{name}_led", 0.165, 0.03, (x, y, z + 3.5), "led_cyan", verts=16)


def crops(name, x0, x1, y0, y1, z, pitch=1.0, step=0.9, seed=0):
    """Rows of crops along y (foliage clumps on low ridges)."""
    rnd = random.Random(seed)
    clumps = []
    x = x0 + pitch / 2
    k = 0
    while x < x1:
        box(f"{name}_ridge{k}", (0.45, y1 - y0, 0.08), (x, (y0 + y1) / 2, z), "soil", bevel=0)
        y = y0 + step / 2
        while y < y1:
            clumps.append(((x + rnd.uniform(-0.05, 0.05), y, z + 0.3), rnd.uniform(0.3, 0.38), rnd.randint(0, 99999)))
            y += step
        x += pitch
        k += 1
    A.foliage(f"{name}_plants", clumps, mats=("crop", "crop_dark"), subdiv=1)
