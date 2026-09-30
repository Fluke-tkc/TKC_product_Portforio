"""Autonomous - modelled after the Autonomous Systems AI artwork.

An autonomous district: a V2X road loop with a driverless shuttle, robotaxi pods and campus carts sharing the
main road with through traffic, roadside units, a V2I gantry, smart road studs, a charging hub and a 5G mast
around a network-globe hologram (vehicles); a fenced security compound with glowing camera pillars, a patrol
robot, a patrol drone and an operations building with its video wall (security systems); a cut-away factory
with swinging robot arms round a conveyor, a QC scan arch and AGVs (industrial robots); a service-robot plaza
in front of a glass robotics centre with greeting robots, delivery and cleaning robots (service robots); a farm
with a driverless tractor and crop drone, solar rows, wind turbines and towers behind.

blender -b --factory-startup --python public/Blender/scripts/smart_autonomous.py
Coordinates: Z up, metres. The viewer looks in from the front-right (+X, -Y).
"""
import math
import os
import random
import sys

import bpy
from mathutils import Vector

sys.path.append(os.path.dirname(__file__))
import tkc_arch as A  # noqa: E402
import tkc_auto as T  # noqa: E402
import tkc_cable as C  # noqa: E402
import tkc_lib as L  # noqa: E402
import tkc_logi as G  # noqa: E402
import tkc_med as M  # noqa: E402
from tkc_lib import box, cyl, empty, group, sphere  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
BLEND = os.path.join(HERE, "..", "smart_autonomous.blend")
A.FOLIAGE_MATS = ("leafv", "leafv_dark", "leafv_light")

BASE = (44.0, 33.0)
X, Y = BASE
LANE_E, LANE_W = -8.2, -11.8  # main road lanes (eastbound keeps left = north side)
LOOP = A.fillet_poly([(-10.0, LANE_E), (20.0, LANE_E), (20.0, 15.0), (-10.0, 15.0)], 4.0, 6)  # shuttle loop, CCW
FX0, FX1, FY0, FY1 = -41.0, -14.5, -2.0, 28.0  # factory hall interior
FL = 0.3  # factory floor
FTOP, TRUSS = 9.5, 8.7
SEC = (-42.0, -31.5, -6.0, -18.2)  # security compound fence
V = 6.0  # one speed for every road vehicle (loop and through lanes never drift apart)


def rect(x0, y0, x1, y1):
    return [(x0, y0), (x1, y0), (x1, y1), (x0, y1)]


def racetrack(x0, y0, x1, y1, r):
    return A.fillet_poly(rect(x0, y0, x1, y1), r, 6)


def pad(name, r, mat, h=0.16):
    x0, y0, x1, y1 = r
    return box(name, (x1 - x0, y1 - y0, h), ((x0 + x1) / 2, (y0 + y1) / 2, 0), mat, bevel=0)


def tower(name, x, y, w, d, h, mat):
    pts = A.outline(A.rect_poly(x, y, w, d), 1.0)
    A.solid(name, pts, 0.16, h, mat)
    A.mullions(f"{name}_mull", A.outline(A.rect_poly(x, y, w + 0.1, d + 0.1), 1.05), 0.16, h, spacing=1.6, size=(0.08, 0.12), mat="tower_frame")
    for zz in range(4, int(h), 4):
        A.ring(f"{name}_band{zz}", A.outline(A.rect_poly(x, y, w + 0.2, d + 0.2), 1.1), pts, zz, 0.25, "tower_frame")


# ---------------------------------------------------------------- site

def site():
    L.set_group("static_site")
    rnd = random.Random(10)
    A.solid("plinth", A.outline(A.rect_poly(0, 0, 2 * X, 2 * Y), 2.0), -2.0, 2.0, "hosp_white", bevel=0.15)
    A.ring("base_band", A.outline(A.rect_poly(0, 0, 2 * X + 0.08, 2 * Y + 0.08), 2.04), A.outline(A.rect_poly(0, 0, 2 * X - 0.1, 2 * Y - 0.1), 1.95), -0.42, 0.3, "auto_blue")
    for k, r in enumerate(((-X, -13.6, X, -6.4), (-12, -6.4, -8, 17), (18, -6.4, 22, 17), (-8, 13, 18, 17), (-8, 1, -3, 11), (-8, 11, -6, 13), (16, 11, 18, 13), (-8, -6.4, -6, -4.4), (16, -6.4, 18, -4.4))):
        pad(f"road{k}", r, "asphalt", 0.02)
    for k, (r, mat) in enumerate((
        ((-X, -16.6, X, -13.6), "paving"),
        ((-X, -Y, -4, -16.6), "concrete"),
        ((-4, -Y, X, -16.6), "terrazzo"),
        ((-X, -6.4, -12, -4.4), "paving"), ((-6, -6.4, 16, -4.4), "paving"), ((22, -6.4, X, -4.4), "paving"),
        ((-3, -4.4, 16, 13), "lawn"), ((16, -4.4, 18, 11), "lawn"), ((-8, -4.4, -3, 1), "lawn"), ((-6, 11, -3, 13), "lawn"),
        ((-X, -4.4, -12, Y), "concrete"),
        ((-12, 17, 22, Y), "stone"),
        ((22, -4.4, X, Y), "lawn"),
    )):
        pad(f"ground{k}", r, mat)
    # road markings, zebra, smart studs
    for i in range(15):
        x = -41 + i * 6.0
        if 1.0 < x < 7.0:
            continue
        box(f"dash{i}", (2.6, 0.15, 0.005), (x + 1.3, -10.0, 0.02), "paint_white", bevel=0)
    for i in range(8):
        box(f"zebra{i}", (0.55, 6.8, 0.005), (2.2 + i * 0.68, -10.0, 0.021), "paint_white", bevel=0)
    for k, (x0, y0, x1, y1) in enumerate(((-8, 3.5, -3, 3.5), (-8, 6, -3, 6), (-8, 8.5, -3, 8.5), (-8, 1.05, -3, 1.05), (-8, 10.95, -3, 10.95))):
        box(f"bayline{k}", (x1 - x0, 0.12, 0.005), ((x0 + x1) / 2, y0, 0.021), "paint_white", bevel=0)
    # trees, lamps
    for k, x in enumerate(range(-40, 44, 8)):
        A.tree(f"stree{k}", (x, -16.0, 0.16), h=6.0 + rnd.random(), spread=0.9, seed=20 + k)
        L.street_light(f"lamp{k}", (x + 4, -13.95, 0.16), rot_z=math.pi / 2, h=6.0)
    for k, x in enumerate((-40, -32, -24, -16, 26, 34, 42)):
        L.street_light(f"nlamp{k}", (x, -5.8, 0.16), rot_z=-math.pi / 2, h=6.0)
    for k, (x, y) in enumerate(((-1, -2.5), (14.5, -2.5), (14.5, 11.5), (-1.5, 11.8), (-13.2, 30.5), (20.5, 20.0), (-3.0, 19.0), (-43.0, -2.5))):
        A.tree(f"ptree{k}", (x, y, 0.16), h=6.5 + rnd.random() * 1.5, spread=1.0, seed=40 + k)
    for k, (x, y, rz) in enumerate(((3.0, 9.8, 0.0), (13.0, 0.2, math.pi), (3.0, 0.2, math.pi))):
        L.bench(f"bench{k}", (x, y, 0.16), rot_z=rz)
    # back: towers, chimneys, turbines, barn
    tower("towerA", -6.0, 26.0, 9.0, 7.0, 32.0, "tower_blue")
    tower("towerB", 2.25, 27.5, 6.5, 6.0, 24.0, "tower_teal")
    G.chimney("chim_a", -39.0, 31.0, h=20.0)
    G.chimney("chim_b", -34.0, 31.2, h=16.0)
    cyl("silo", 1.6, 10.0, (-28.5, 31.0, 0.16), "panel_grey", verts=28)
    cyl("silo_cap", 1.65, 0.8, (-28.5, 31.0, 10.16), "auto_blue", verts=28, r2=0.4)
    box("barn", (5.0, 2.4, 3.2), (25.0, 31.6, 0.16), "container_red", bevel=0.04)
    L.prism("barn_roof", [(-1.3, 0.0), (1.3, 0.0), (0.0, 1.2)], 5.3, (25.0, 31.6, 3.36), "robot_white", rot_z=math.pi / 2, bevel=0.03)


def park():
    """Inside the loop: charging hub, 5G mast, network-globe hologram, bus stop, paths."""
    L.set_group("static_site")
    M.disc_ring("globe_path", 4.6, 3.3, (8.0, 5.0, 0.17), 0.02, "terrazzo", n=48)
    box("park_path", (1.6, 5.0, 0.02), (8.0, -2.0, 0.16), "terrazzo", bevel=0)
    C.bus_shelter("shuttle_stop", (16.8, 4.0, 0.16), 0.0)
    L.human("stop_wait0", (16.6, 3.0, 0.16), rot_z=0.0, seed=60)
    with group("hot:vehicles"):
        for k, y in enumerate((2.25, 4.75, 7.25, 9.75)):
            T.ev_charger(f"charger{k}", (-3.35, y, 0.16), math.pi)
        for k, y in enumerate((2.25, 7.25)):
            T.robotaxi(f"parked{k}", (-5.6, y, 0.02), 0.0, paint=("robot_white", "taxi_yellow")[k], marker=False)
        T.lattice_mast("mast5g", (0.5, 8.5, 0.16), h=20.0)
        cyl("globe_base", 1.3, 0.55, (8.0, 5.0, 0.16), "robot_white", verts=36, bevel=0.05)
        cyl("globe_base_led", 1.32, 0.04, (8.0, 5.0, 0.6), "led_cyan", verts=36)
        for k in range(2):
            cyl(f"board_post{k}", 0.08, 2.4, (10.6 + k * 3.4, -1.6, 0.16), "frame_dark", verts=10)
        M.screen_at("v2x_board", (3.6, 1.8), (12.3, -1.66, 2.7), -math.pi / 2, "screen_v2x", bezel=0.08)
        # smart road studs along the centre line, roadside units, V2I gantry, crossing lights
        for k in range(28):
            x = -41.5 + k * 3.1
            if not 1.5 < x < 7.0:
                box(f"stud{k}", (0.22, 0.12, 0.03), (x, -10.0, 0.02), "led_cyan", bevel=0)
        for k, (x, y, face) in enumerate(((-5.0, -5.4, -math.pi / 2), (24.0, -5.4, -math.pi / 2), (10.0, -16.1, math.pi / 2), (-28.0, -16.1, math.pi / 2), (5.0, 17.8, -math.pi / 2))):
            T.rsu(f"rsu{k}", (x, y, 0.16), face)
        T.gantry("gantry", 30.0, -16.2, -5.2, h=6.2)
        T.traffic_light("tl_e", (1.2, -5.8, 0.16), math.pi)
        T.traffic_light("tl_w", (7.4, -14.2, 0.16), 0.0)
        empty("pin_vehicles", (8.0, -10.0, 7.5))
    with group("move"):
        g = sphere("holo_globe", 1.7, (8.0, 5.0, 3.4), "holo", subdiv=2)
        g["spin"], g["spin_speed"] = "z", 0.35
        for k, (z, r, sp) in enumerate(((2.2, 2.4, 0.5), (4.6, 2.0, -0.4))):
            ring = M.disc_ring(f"globe_ring{k}", r, r - 0.07, (8.0, 5.0, z), 0.04, "holo", n=48)
            ring["spin"], ring["spin_speed"] = "z", sp


# ---------------------------------------------------------------- security compound

def security():
    x0, y0, x1, y1 = SEC
    with group("hot:security-systems"):
        T.fence("sfence", [(x0, y1), (x1, y1), (x1, y0), (x0, y0), (x0, y1)], gap=(16.0, 20.0))
        box("gate_booth", (1.6, 1.6, 2.5), (-20.4, -19.6, 0.16), "robot_white", bevel=0.05)
        box("gate_booth_win", (1.62, 1.1, 0.8), (-20.4, -19.6, 1.3), "carglass", bevel=0)
        box("gate_booth_roof", (2.1, 2.1, 0.15), (-20.4, -19.6, 2.66), "auto_blue", bevel=0.03)
        box("gate_post", (0.4, 0.4, 1.1), (-21.7, -18.6, 0.16), "frame_dark", bevel=0.03)
        box("gate_arm", (3.6, 0.1, 0.1), (-23.6, -18.6, 1.0), "white", bevel=0)
        for k in range(3):
            box(f"gate_arm_s{k}", (0.45, 0.105, 0.105), (-22.6 - k * 0.95, -18.6, 1.0), "red", bevel=0)
        # operations building with video wall and roof sign
        bx0, by0, bx1, by1 = -41.0, -30.5, -31.0, -22.5
        box("ops_body", (bx1 - bx0, by1 - by0, 7.2), ((bx0 + bx1) / 2, (by0 + by1) / 2, 0.16), "robot_white", bevel=0.05)
        for k, z in enumerate((1.0, 4.4)):
            box(f"ops_glass{k}", (bx1 - bx0 + 0.04, by1 - by0 + 0.04, 2.2), ((bx0 + bx1) / 2, (by0 + by1) / 2, z), "tower_glass2", bevel=0)
        box("ops_roof", (bx1 - bx0 + 0.6, by1 - by0 + 0.6, 0.3), ((bx0 + bx1) / 2, (by0 + by1) / 2, 7.36), "auto_blue", bevel=0.04)
        L.text_mesh("ops_sign", "SECURITY SYSTEM", (bx1 + 0.35, (by0 + by1) / 2, 7.7), 0.62, 0.08, "robot_white", rot=(math.pi / 2, 0, math.pi / 2))
        M.screen_at("ops_wall", (5.6, 2.2), (bx1 + 0.06, (by0 + by1) / 2 - 0.2, 4.3), 0.0, "screen_sec", bezel=0.08)
        box("ops_canopy", (1.8, 3.0, 0.15), (bx1 + 0.9, by0 + 2.0, 2.8), "robot_white", bevel=0.03)
        box("ops_door", (0.05, 1.8, 2.4), (bx1 + 0.03, by0 + 2.0, 0.16), "glass", bevel=0)
        # parked patrol cars in marked bays
        for k, x in enumerate((-38.0, -33.4)):
            box(f"sbay{k}", (4.8, 0.1, 0.005), (x, -21.9, 0.161), "paint_white", bevel=0)
            L.car(f"secar{k}", (x, -20.5, 0.16), rot_z=0.0, paint=("navy", "robot_white")[k])
        # radar head (spins) and sensor bollards along the fence
        cyl("radar_mast", 0.12, 5.5, (-14.0, -30.4, 0.16), "frame_dark", verts=12)
        box("radar_box", (0.5, 0.5, 0.5), (-14.0, -30.4, 5.66), "robot_white", bevel=0.05)
        for k, x in enumerate(range(-40, -6, 4)):
            cyl(f"bollard{k}", 0.1, 0.9, (x + 1.0, -30.8, 0.16), "robot_white", verts=12)
            cyl(f"bollard{k}_led", 0.105, 0.06, (x + 1.0, -30.8, 0.9), "led_blue", verts=12)
        empty("pin_security-systems", (-24.0, -25.0, 9.0))
    for k, (x, y) in enumerate(((-24.8, -19.4), (-9.0, -20.6), (-9.0, -29.6), (-20.0, -25.4), (-29.5, -30.3))):
        with group("hot:security-systems"):
            T.camera_pillar(f"pillar{k}", (x, y, 0.16), h=5.2)
    with group("move"):
        r = box("radar_head", (1.4, 0.12, 0.4), (-14.0, -30.4, 6.2), "robot_white", bevel=0.03)
        r["spin"], r["spin_speed"] = "z", 1.4


# ---------------------------------------------------------------- factory

def factory():
    L.set_group("static_building")
    cx, cy = (FX0 + FX1) / 2, (FY0 + FY1) / 2
    box("f_slab", (FX1 - FX0 + 0.8, FY1 - FY0 + 0.8, FL - 0.02), (cx, cy, 0.0), "panel_grey", bevel=0.03)
    box("f_floor", (FX1 - FX0, FY1 - FY0, 0.02), (cx, cy, FL - 0.02), "concrete_floor", bevel=0)
    box("f_wall_back", (FX1 - FX0 + 0.8, 0.4, FTOP - FL), (cx, FY1 + 0.2, FL), "panel_grey", bevel=0.02)
    box("f_wall_left", (0.4, FY1 - FY0 + 0.8, FTOP - FL), (FX0 - 0.2, cy, FL), "panel_grey", bevel=0.02)
    box("f_band_back", (FX1 - FX0, 0.02, 0.6), (cx, FY1 - 0.01, 7.2), "arm_orange", bevel=0)
    box("f_band_left", (0.02, FY1 - FY0, 0.6), (FX0 + 0.01, cy, 7.2), "arm_orange", bevel=0)
    box("f_cap_back", (FX1 - FX0 + 0.84, 0.44, 0.1), (cx, FY1 + 0.2, FTOP), "auto_blue", bevel=0.01)
    box("f_cap_left", (0.44, FY1 - FY0 + 0.84, 0.1), (FX0 - 0.2, cy, FTOP), "auto_blue", bevel=0.01)
    # cut-away: low front and right walls, columns and trusses carry the (removed) roof
    box("f_wall_front", (FX1 - FX0 + 0.8, 0.3, 1.2), (cx, FY0 - 0.15, FL), "panel_grey", bevel=0.02)
    box("f_wall_right", (0.3, FY1 - FY0 + 0.8, 1.2), (FX1 + 0.15, cy, FL), "panel_grey", bevel=0.02)
    for k, x in enumerate((-35.0, -29.0, -23.0, -17.0)):
        cyl(f"f_col{k}", 0.26, TRUSS - FL, (x, FY0, FL), "panel_grey", verts=18)
        for z in (TRUSS, FTOP - 0.15):
            box(f"f_truss{k}_{z}", (0.16, FY1 - FY0 + 0.4, 0.15), (x, cy, z), "frame_dark", bevel=0)
        for j in range(15):
            y = FY0 + j * 2.0
            box(f"f_web{k}_{j}", (0.08, 0.08, 1.2), (x, y + 1.0, TRUSS + 0.08), "frame_dark", bevel=0, rot=(0.9 if j % 2 else -0.9, 0, 0))
        for y in (3.0, 10.0, 17.0, 24.0):
            cyl(f"f_hb{k}{y}", 0.35, 0.18, (x, y, TRUSS - 0.3), "darkgray", verts=16)
            cyl(f"f_hb{k}{y}_led", 0.3, 0.02, (x, y, TRUSS - 0.32), "led_white", verts=16)
    for k, y in enumerate((4.0, 11.0, 18.0, 25.0)):
        cyl(f"f_rcol{k}", 0.26, TRUSS - FL, (FX1, y, FL), "panel_grey", verts=18)
    box("f_beam_front", (FX1 - FX0 + 0.8, 0.3, 0.4), (cx, FY0, TRUSS - 0.2), "panel_grey", bevel=0.02)
    box("f_beam_right", (0.3, FY1 - FY0 + 0.8, 0.4), (FX1, cy, TRUSS - 0.2), "panel_grey", bevel=0.02)
    G.pallet_rack("f_rack", -40.2, 3.0, 25.0, depth=1.1, levels=3, seed=5, z0=FL)
    M.screen_at("f_dash", (8.0, 2.6), (-28.0, FY1 - 0.06, 5.2), -math.pi / 2, "screen_factory", bezel=0.1)
    M.floor_strip("f_aisle", racetrack(-38.6, 2.5, -17.2, 25.5, 1.8) + [racetrack(-38.6, 2.5, -17.2, 25.5, 1.8)[0]], 0.1, FL + 0.003, "safety_yellow")
    for k, x in enumerate((-19.0, -23.5)):
        M.workstation(f"f_desk{k}", (x, -0.6, FL), rot_z=math.pi / 2, screens=("screen_factory", "screen_monitor"), seed=70 + k, outfit="worker")
    for k, y in enumerate((9.0, 19.0)):  # crew watching the cell from outside the AGV aisle
        C.crew(f"f_crew{k}", (-15.6, y, FL), rot_z=math.pi, seed=75 + k)
    with group("hot:industrial-robot"):
        loop = racetrack(-35.0, 7.0, -21.0, 21.0, 0.8)
        G.conveyor("f_conv", loop, FL + 0.9)
        M.floor_strip("f_cell", racetrack(-36.2, 5.8, -19.8, 22.2, 1.2) + [racetrack(-36.2, 5.8, -19.8, 22.2, 1.2)[0]], 0.14, FL + 0.004, "safety_yellow")
        box("f_table", (3.0, 4.0, 0.9), (-28.0, 14.0, FL), "robot_white", bevel=0.03)
        for k in range(3):
            box(f"f_part{k}", (0.8, 0.6, 0.35), (-28.0, 12.8 + k * 1.2, FL + 0.9), "auto_blue", bevel=0.05)
        G.scan_tunnel("f_qc", (-28.0, 21.0, FL + 0.1), 0.0)
        T.humanoid_carrier("f_humanoid", (-25.0, 23.8, FL), -math.pi / 2)
        for k in range(4):  # light-curtain posts at the cell corners
            px, py = (-36.2, -19.8)[k % 2], (5.8, 22.2)[k // 2]
            box(f"f_curtain{k}", (0.12, 0.12, 1.8), (px, py, FL), "safety_yellow", bevel=0.02)
            box(f"f_curtain{k}_led", (0.13, 0.13, 0.05), (px, py, FL + 1.7), "led_green", bevel=0)
        empty("pin_industrial-robot", (-28.0, 14.0, 10.5))
    for k, (x, y, h) in enumerate(((-32.9, 10.5, math.pi), (-32.9, 17.5, math.pi), (-23.1, 10.5, 0.0), (-23.1, 17.5, 0.0))):
        with group("hot:industrial-robot"):
            T.robot_arm(f"arm{k}", (x, y, FL), h, phase=k * 1.7)
    # parts riding the conveyor, AGVs on the aisle loop
    length = L.path_length(loop, True)
    rnd = random.Random(80)
    for k in range(10):
        with group("move"):
            b = box(f"part{k}_b", (0.55, 0.42, 0.3), (0, 0, 0), rnd.choice(("auto_blue", "robot_white", "carton")), bevel=0.03)
        body = L.rigid([b], f"part{k}")
        body["blob"] = [0.01, 0.01]
        L._on_path(body, "drive", 0.7, loop, True, k * length / 10, FL + 0.9)
    aisle = racetrack(-38.6, 2.5, -17.2, 25.5, 1.8)
    length = L.path_length(aisle, True)
    for k, kind in enumerate(("cart", "tow", "fork")):
        nm = f"agv{k}"
        with group("move"):
            T.agv(nm, (0, 0, 0), 0.0, kind=kind, seed=90 + k)
        body = L.rigid(L._parts(nm), nm)
        body["blob"] = [1.6, 1.1] if kind != "tow" else [3.6, 1.1]
        L._on_path(body, "drive", 1.1, aisle, True, k * length / 3, FL)


# ---------------------------------------------------------------- service robots

def service():
    L.set_group("static_site")
    rnd = random.Random(120)
    for k, (x, y) in enumerate(((-2.8, -19.8), (8.0, -32.3), (26.0, -32.3), (-3.0, -31.5), (27.0, -18.6))):
        A.tree(f"sv_tree{k}", (x, y, 0.16), h=5.8 + rnd.random(), spread=0.85, seed=130 + k)
    for k, (x0, y0) in enumerate(((0.0, -22.6), (-2.5, -27.2))):
        M.flower_bed(f"sv_bed{k}", x0, y0, x0 + 3.0, y0 + 1.4, 0.16, seed=140 + k)
    for k, (x, y, rz) in enumerate(((27.0, -31.2, 0.0), (-2.5, -24.2, math.pi / 2))):
        L.bench(f"sv_bench{k}", (x, y, 0.16), rot_z=rz)
    # robotics centre: single-storey glass pavilion under a slatted roof you can look into
    L.set_group("static_building")
    bx0, by0, bx1, by1, hh = 30.0, -30.5, 41.5, -21.5, 4.6
    box("rc_floor", (bx1 - bx0, by1 - by0, 0.1), ((bx0 + bx1) / 2, (by0 + by1) / 2, 0.16), "terrazzo", bevel=0.02)
    box("rc_east", (0.3, by1 - by0, hh), (bx1 - 0.15, (by0 + by1) / 2, 0.26), "robot_white", bevel=0.02)
    box("rc_north", (bx1 - bx0, 0.3, hh), ((bx0 + bx1) / 2, by1 - 0.15, 0.26), "robot_white", bevel=0.02)
    for k, (ya, yb) in enumerate(((by0, -27.4), (-24.6, by1))):  # west glass with the doorway at y -27.4..-24.6
        box(f"rc_glass_w{k}", (0.04, yb - ya, hh - 0.4), (bx0, (ya + yb) / 2, 0.26), "glass", bevel=0)
    box("rc_glass_s", (bx1 - bx0, 0.04, hh - 0.4), ((bx0 + bx1) / 2, by0, 0.26), "glass", bevel=0)
    for k, (x, y) in enumerate(((bx0, by0), (bx0, -27.4), (bx0, -24.6), (bx0, by1), (34.0, by0), (38.0, by0), (bx1, by0))):
        cyl(f"rc_col{k}", 0.13, hh, (x, y, 0.26), "robot_white", verts=14)
    cx, cy = (bx0 + bx1) / 2, (by0 + by1) / 2
    A.ring("rc_fascia", A.rect_poly(cx, cy, bx1 - bx0 + 1.2, by1 - by0 + 1.2), A.rect_poly(cx, cy, bx1 - bx0 - 0.4, by1 - by0 - 0.4), 0.26 + hh - 0.1, 0.55, "robot_white")
    A.slats("rc_slats", A.rect_poly(cx, cy, bx1 - bx0 - 0.4, by1 - by0 - 0.4), 0.26 + hh + 0.4, spacing=0.9, width=0.16, depth=0.3, mat="robot_white")
    box("rc_fascia_band", (bx1 - bx0 + 1.24, 0.02, 0.14), (cx, by0 - 0.62, 0.26 + hh + 0.05), "auto_blue", bevel=0)
    L.text_mesh("rc_sign", "TKC ROBOTICS", (cx, by0 - 0.64, 0.26 + hh + 0.18), 0.34, 0.04, "auto_blue")
    box("rc_desk", (0.8, 3.2, 1.05), (39.2, -26.0, 0.26), "robot_white", bevel=0.05)
    box("rc_desk_top", (0.9, 3.3, 0.05), (39.2, -26.0, 1.31), "wood_desk", bevel=0.01)
    M.screen_at("rc_screen", (4.2, 2.0), (bx1 - 0.32, -26.0, 2.2), math.pi, "screen_chest", bezel=0.06)
    with group("hot:service-robot"):
        for k, (x, y, rz) in enumerate(((38.0, -24.6, math.pi), (38.0, -27.4, math.pi), (6.0, -24.2, math.pi))):
            T.service_robot(f"srv{k}", (x, y, 0.26 if x > 29 else 0.16), rz)
        for k, x in enumerate((10.0, 13.0, 16.0, 19.0)):  # showcase row on glowing pads
            T.robot_pad(f"showpad{k}", (x, -21.8, 0.16))
            if k == 2:
                M.humanoid_robot(f"show{k}", (x, -21.8, 0.24), rot_z=-math.pi / 2)
            else:
                T.service_robot(f"show{k}", (x, -21.8, 0.24), -math.pi / 2)
        L.human("srv_guest0", (4.9, -24.2, 0.16), rot_z=0.0, seed=150)
        L.human("srv_guest1", (13.0, -23.4, 0.16), rot_z=math.pi / 2, seed=151)
        L.human("srv_guest2", (16.6, -23.6, 0.16), rot_z=math.pi / 2, seed=154)
        L.human("srv_guest3", (36.9, -24.6, 0.26), rot_z=0.0, seed=152)
        M.kiosk("srv_kiosk", (8.8, -27.5, 0.16), face=-math.pi / 2, screen="screen_chest")
        M.wheelchair("srv_chair", (25.2, -28.0, 0.16), rot_z=0.0, seed=153)
        M.humanoid_robot("srv_carer", (24.3, -28.0, 0.16), rot_z=0.0)
        M.telepresence_robot("srv_tele", (40.3, -29.5, 0.26), rot_z=math.pi)
        T.drone_pad("dpad", (23.5, -23.2, 0.16))
        M.drone("dpad_drone", (23.5, -23.2, 0.62), 0.4)
        for row in range(3):
            for col in range(4):
                box(f"locker{row}{col}", (0.6, 0.8, 0.62), (27.9, -24.8 + col * 0.85, 0.16 + row * 0.64), ("panel_grey", "auto_blue", "panel_grey")[row], bevel=0.02)
        M.screen_at("locker_scr", (0.5, 0.7), (27.58, -21.7, 1.3), math.pi, "screen_locker", bezel=0.03)
        L.cafe_set("sv_cafe", (17.2, -27.4, 0.16), seed=155, chairs=3, umbrella=True)
        M.kiosk("sv_coffee", (19.3, -27.4, 0.16), face=math.pi, screen="screen_chest")
        T.service_robot("sv_barista", (19.9, -27.4, 0.16), math.pi)
        for k, x in enumerate((0.5, 21.0)):
            T.info_pole(f"infopole{k}", (x, -17.3, 0.16), -math.pi / 2)
        empty("pin_service-robot", (16.0, -24.5, 6.0))
    with group("hot:service-robot"):
        T.robot_arm("demoarm", (33.5, -28.8, 0.26), math.pi, phase=0.7)
    for side in (-1, 1):  # automatic doors of the robotics centre (open for passers-by)
        with group("move"):
            parts = [box(f"rcdoor{side}_pane", (0.03, 1.36, 2.6), (0, 0, 0.02), "glass", bevel=0)]
            parts.append(box(f"rcdoor{side}_frame", (0.06, 1.4, 0.06), (0, 0, 2.6), "frame_dark", bevel=0))
        L.place(L.rigid(parts, f"rcdoor{side}"), (bx0, -26.0 + side * 0.7, 0.26), 0.0, slide=side, slide_axis="y", slide_dist=1.3, sense=3.2)


# ---------------------------------------------------------------- farm

TRACTOR_PATH = A.fillet_poly([(27, 5.5), (27, 26.5), (30, 26.5), (30, 5.5), (33, 5.5), (33, 26.5), (36, 26.5), (36, 5.5), (39, 5.5), (39, 28.2), (25.2, 28.2), (25.2, 3.8), (27, 3.8)], 1.2, 6)


def farm():
    L.set_group("static_site")
    box("field", (17.5, 22.7, 0.06), (33.75, 15.85, 0.16), "field", bevel=0)
    T.crops("crop", 25.0, 42.5, 4.5, 27.2, 0.22, pitch=1.0, step=0.55, seed=160)
    for k, y in enumerate((-2.6, 0.6)):
        T.solar_row(f"solar{k}", 24.0, 43.0, y)
    box("farm_track", (1.2, 26.0, 0.02), (43.0, 16.0, 0.16), "gravel", bevel=0)


def turbines():
    for k, (x, y) in enumerate(((-22.0, 31.6), (15.0, 31.6), (35.0, 31.6))):
        with group("static_site"):
            T.wind_turbine(f"turbine{k}", (x, y, 0.16))


# ---------------------------------------------------------------- life

def through_car(name, lane, phase, paint, kind):
    with group("move"):
        if kind == "pod":
            T.robotaxi(name, (0, 0, 0), 0.0, paint=paint, marker=False)
        else:
            L.car(name, (0, 0, 0), rot_z=0.0, paint=paint)
    body = L.rigid(L._parts(name), name)
    body["blob"] = [4.8, 2.3]
    return L._on_path(body, "drive", V, lane, False, phase, 0.02)


def life():
    total = L.path_length(LOOP, True)
    n = max(1, int(total // (2 * (X + 3))))
    a = total / (2 * n)
    loopers = []
    for i, build in enumerate((T.shuttle, T.robotaxi, T.auto_cart)):
        nm = ("shuttle", "podtaxi", "cart")[i]
        at = i * total / 3
        with group("move"):
            build(nm, (0, 0, 0), 0.0)
        body = L.rigid(L._parts(nm), nm)
        body["blob"] = [7.0, 2.6] if i == 0 else [4.4, 2.2]
        L._on_path(body, "drive", V, LOOP, True, at, 0.02)
        loopers.append(at)
    east = [(-a, LANE_E), (a, LANE_E)]
    west = [(a, LANE_W), (-a, LANE_W)]
    phase, gap = L.best_phase(east, LOOP, loopers, X)
    print(f"traffic east: phase {phase} clearance {gap:.1f} m")
    through_car("thru_e", east, phase, "taxi_yellow", "pod")
    for j, (paint, kind) in enumerate((("car_pink", "car"), ("sky_blue", "pod"))):
        through_car(f"thru_w{j}", west, j * a + 7.0, paint, kind)
    # people
    n = 0
    for path, count, speed, z in (
        (racetrack(-42.0, -15.4, 42.0, -14.6, 0.39), 4, 1.2, 0.16),
        (M.circle(3.95, 32, 8.0, 5.0), 3, 1.0, 0.18),
        (racetrack(20.0, -26.4, 36.0, -25.6, 0.39), 2, 1.0, 0.26),  # in and out of the robotics centre
        (racetrack(1.0, -19.9, 26.0, -18.5, 0.69), 3, 1.1, 0.16),
    ):
        length = L.path_length(path, True)
        for j in range(count):
            L.walker(f"ped{n}", path, speed, (j + 0.3) * length / count, seed=300 + n, z=z)
            n += 1
    # robots: patrol, delivery, cleaning; drones; tractor
    for nm, build, path, speed, at, z, blob in (
        ("patrol", T.patrol_robot, racetrack(-28.0, -29.3, -11.5, -21.6, 1.5), 0.9, 0.0, 0.16, [1.0, 1.0]),
        ("deliv0", M.delivery_robot, racetrack(0.5, -31.2, 24.0, -29.4, 0.89), 0.8, 0.0, 0.16, [0.9, 0.7]),
        ("deliv1", M.delivery_robot, racetrack(0.5, -31.2, 24.0, -29.4, 0.89), 0.8, 25.0, 0.16, [0.9, 0.7]),
        ("cleaner", M.cleaning_robot, M.circle(1.2, 24, 13.5, -27.2), 0.4, 0.0, 0.16, [0.7, 0.7]),
        ("dog", T.robot_dog, racetrack(2.0, -28.4, 7.0, -23.2, 1.2), 0.7, 0.0, 0.16, [1.1, 0.7]),
        ("tractor", T.tractor, TRACTOR_PATH, 1.8, 0.0, 0.22, [4.6, 2.8]),
    ):
        with group("move"):
            build(nm, (0, 0, 0), 0.0)
        body = L.rigid(L._parts(nm), nm)
        body["blob"] = blob
        L._on_path(body, "drive", speed, path, True, at, z)
    for nm, centre, r, z, speed in (("secdrone", (-24.0, -25.0), 6.5, 11.0, 3.5), ("agridrone", (33.5, 16.0), 7.0, 7.0, 3.0)):
        with group("move"):
            rotors = M.drone(nm, (0, 0, 0), 0.0)
        body = L.rigid([o for o in L._parts(nm) if o not in rotors], nm)
        body["blob"] = [0.01, 0.01]
        for i, rt in enumerate(rotors):
            c = L._top_centre([rt])
            rr = L.rigid([rt], f"{nm}_rotor{i}", (c[0], c[1], c[2] - 0.006))
            rr["spin"], rr["spin_speed"] = "z", 30.0
            rr.parent = body
        L._on_path(body, "drive", speed, M.circle(r, 36, *centre), True, 0.0, z)


def icons():
    with group("move"):
        for i, (x, y, z, kind) in enumerate(((-24.0, -25.0, 11.2, "shield"), (8.0, -10.0, 9.7, "car"), (-28.0, 14.0, 12.7, "arm"), (18.0, -24.5, 8.2, "robot"))):
            L.plane(f"icon_{kind}{i}", (1.6, 1.6), (x, y, z), f"screen_icon_{kind}", rot=(math.pi / 2, 0, -math.pi / 4 + math.pi / 2))
            bpy.data.objects[f"icon_{kind}{i}"]["bob"] = i * 0.9


def lighting(sun_elev=36, sun_dir=(0.62, -0.78)):
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
    for i, (x0, y0, x1, y1) in enumerate(((FX0, FY0, -27.0, FY1), (-27.0, FY0, FX1, FY1))):
        a = bpy.data.lights.new(f"Bay{i}", "AREA")
        a.shape = "RECTANGLE"
        a.size, a.size_y = (x1 - x0) * 0.8, (y1 - y0) * 0.8
        a.energy = 2.0 * (x1 - x0) * (y1 - y0)
        a.color = (1.0, 0.97, 0.92)
        ob = bpy.data.objects.new(f"Bay{i}", a)
        L.COL.objects.link(ob)
        ob.location = ((x0 + x1) / 2, (y0 + y1) / 2, TRUSS - 0.4)


ATLASES = {
    "building": ["static_building", "hot:industrial-robot", "hot:security-systems"],
    "site": ["static_site", "hot:vehicles", "hot:service-robot"],
}


def build():
    L.reset_scene()
    site()
    park()
    security()
    factory()
    service()
    farm()
    turbines()
    life()
    icons()
    lighting()
    for name, groups in ATLASES.items():
        bpy.context.scene[f"atlas_{name}"] = ",".join(groups)
    bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(BLEND))
    print("objects:", len(bpy.context.scene.objects), "tris:", sum(len(o.data.polygons) for o in bpy.context.scene.objects if o.type == "MESH"))


if __name__ == "__main__":
    build()
