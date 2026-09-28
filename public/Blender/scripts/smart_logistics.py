"""Smart Logistics - modelled after the Smart Logistics AI artwork.

A cut-away dock-high distribution centre: pallet racking with a forklift, a conveyor loop with boxes riding
through a smart scan tunnel, packing stations, AMR robots, a cargo dimensioning gantry, a mezzanine route
optimisation control room, four loading docks with box trucks; a click-and-collect POS shop in front; a
truck yard with gatehouse, EV vans and containers; factory chimneys and city behind.

blender -b --factory-startup --python public/Blender/scripts/smart_logistics.py
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
import tkc_edu as E  # noqa: E402
import tkc_lib as L  # noqa: E402
import tkc_logi as G  # noqa: E402
import tkc_med as M  # noqa: E402
from tkc_lib import box, cyl, empty, group, sphere  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
BLEND = os.path.join(HERE, "..", "smart_logistics.blend")
A.FOLIAGE_MATS = ("leafv", "leafv_dark", "leafv_light")

WX0, WX1, WY0, WY1 = -32.0, 8.0, -6.0, 20.0  # warehouse interior
FLOOR = 1.2  # dock-high floor
TOP = 10.0  # wall tops
TRUSS = 9.2  # underside of the roof trusses
DOCKS = (0.0, 5.0, 10.0, 15.0)  # dock doors in the right wall
SX0, SX1, SY0, SY1 = -30.0, -14.0, -16.5, -8.5  # POS pickup shop
BASE = (44.0, 33.0)
ROAD_Y = -27.0
BACK = -math.pi / 2


def rect(x0, y0, x1, y1):
    return [(x0, y0), (x1, y0), (x1, y1), (x0, y1)]


def racetrack(x0, y0, x1, y1, r):
    return A.fillet_poly(rect(x0, y0, x1, y1), r, 6)


# ---------------------------------------------------------------- warehouse shell

def shell():
    L.set_group("static_building")
    box("podium", (WX1 - WX0 + 0.6, WY1 - WY0 + 0.6, FLOOR - 0.02), ((WX0 + WX1) / 2, (WY0 + WY1) / 2, 0), "panel_grey", bevel=0.03)
    box("floor", (WX1 - WX0, WY1 - WY0, 0.02), ((WX0 + WX1) / 2, (WY0 + WY1) / 2, FLOOR - 0.02), "concrete_floor", bevel=0)
    box("edge_stripe", (WX1 - WX0 + 0.6, 0.15, 0.012), ((WX0 + WX1) / 2, WY0 - 0.2, FLOOR), "safety_yellow", bevel=0)
    box("wall_back", (WX1 - WX0 + 0.8, 0.4, TOP - FLOOR), ((WX0 + WX1) / 2, WY1 + 0.2, FLOOR), "panel_grey", bevel=0.02)
    box("wall_left", (0.4, WY1 - WY0 + 0.8, TOP - FLOOR), (WX0 - 0.2, (WY0 + WY1) / 2, FLOOR), "panel_grey", bevel=0.02)
    for name, (x0, y0, x1, y1) in (("band_back", (WX0, WY1 - 0.01, WX1, WY1)), ("band_left", (WX0, WY0, WX0 + 0.01, WY1))):
        box(name, (max(x1 - x0, 0.012), max(y1 - y0, 0.012), 0.5), ((x0 + x1) / 2, (y0 + y1) / 2, 7.4), "rack_blue", bevel=0)
    box("cap_back", (WX1 - WX0 + 0.84, 0.44, 0.1), ((WX0 + WX1) / 2, WY1 + 0.2, TOP), "rack_blue", bevel=0.01)
    box("cap_left", (0.44, WY1 - WY0 + 0.84, 0.1), (WX0 - 0.2, (WY0 + WY1) / 2, TOP), "rack_blue", bevel=0.01)
    # right wall: cut low (6.5 m) so the docks read from outside and the floor shows over it
    rx = WX1 + 0.2
    edges = [WY0 - 0.4] + [e for d in DOCKS for e in (d - 1.6, d + 1.6)] + [WY1 + 0.4]
    for k in range(0, len(edges), 2):
        y0, y1 = edges[k], edges[k + 1]
        box(f"wall_right{k}", (0.4, y1 - y0, 6.5), (rx, (y0 + y1) / 2, 0), "panel_grey", bevel=0.02)
    for d in DOCKS:
        box(f"lintel{d}", (0.4, 3.2, 6.5 - FLOOR - 3.8), (rx, d, FLOOR + 3.8), "panel_grey", bevel=0.02)
        box(f"dockface{d}", (0.4, 3.2, FLOOR), (rx, d, 0), "panel_grey", bevel=0.02)
    box("cap_right", (0.44, WY1 - WY0 + 0.84, 0.12), (rx, (WY0 + WY1) / 2, 6.5), "rack_blue", bevel=0.01)
    # front columns and roof trusses (the cut shows the structure)
    for x in (-28.0, -20.0, -12.0, -4.0, 4.0):
        cyl(f"col{x}", 0.28, TRUSS - FLOOR, (x, WY0, FLOOR), "panel_grey", verts=20)
        cyl(f"col{x}_ring", 0.3, 0.1, (x, WY0, FLOOR + 1.0), "safety_yellow", verts=20)
        for z in (TRUSS, TOP - 0.15):
            box(f"truss{x}_{z}", (0.16, WY1 - WY0 + 0.4, 0.15), (x, (WY0 + WY1) / 2, z), "frame_dark", bevel=0)
        for k in range(13):
            y = WY0 + k * 2.0
            box(f"truss{x}_web{k}", (0.08, 0.08, 1.2), (x, y + 1.0, TRUSS + 0.08), "frame_dark", bevel=0, rot=(0.9 if k % 2 else -0.9, 0, 0))
        for y in (-1.0, 4.0, 9.0, 14.0):  # high-bay lights under the trusses
            cyl(f"hb{x}{y}", 0.35, 0.18, (x, y, TRUSS - 0.3), "darkgray", verts=16)
            cyl(f"hb{x}{y}_led", 0.3, 0.02, (x, y, TRUSS - 0.32), "led_white", verts=16)
    box("front_beam", (WX1 - WX0 + 0.8, 0.3, 0.4), ((WX0 + WX1) / 2, WY0, TRUSS - 0.2), "panel_grey", bevel=0.02)
    # floor markings: forklift cross aisle, pedestrian walkway round the conveyor zone
    M.floor_strip("mark_aisle", [(WX0 + 0.5, -4.6), (-14.2, -4.6)], 0.12, FLOOR + 0.003, "safety_yellow")
    M.floor_strip("mark_walk", [(-14.2, -4.2), (4.2, -4.2), (4.2, 14.2), (-14.2, 14.2), (-14.2, -4.2)], 0.1, FLOOR + 0.003, "leafv_light")


def racking():
    L.set_group("static_building")
    for i, x in enumerate((-31.35, -26.55, -25.45, -21.15, -20.05, -15.75)):
        G.pallet_rack(f"rack{i}", x, -4.0, 16.0, depth=1.1, levels=4, seed=10 + i, z0=FLOOR)
    for k, (x, y, h) in enumerate(((-28.9, 3.0, 0.0), (-28.9, 11.0, math.pi))):
        L.human(f"picker{k}", (x, y, FLOOR), rot_z=h, seed=20 + k, outfit="worker")
        G.handheld(f"picker{k}_gun", (x + math.cos(h) * 0.35, y + math.sin(h) * 0.35, FLOOR + 1.05), h)
    box("pjack", (0.6, 1.2, 0.12), (-28.9, 7.0, FLOOR), "safety_yellow", bevel=0.02)
    G.carton_stack("pjack_load", (-28.9, 7.0, FLOOR + 0.12), seed=25)


def conveyor_zone():
    """Smart scan: the conveyor loop, scan tunnel, packing stations and handheld scanning."""
    loop = racetrack(-11.0, -1.0, 1.0, 11.0, 0.8)
    with group("hot:smart-scan"):
        G.conveyor("conv", loop, FLOOR + 0.9)
        G.scan_tunnel("tunnel", (-5.0, -1.0, FLOOR + 0.1), 0.0)
        for k, x in enumerate((-8.0, -5.0, -2.0)):
            G.packing_station(f"pack_a{k}", (x, 4.0, FLOOR), 0.0, seed=30 + k)
            G.packing_station(f"pack_b{k}", (x, 8.0, FLOOR), math.pi, seed=40 + k)
        L.human("scanner_man", (-12.3, 5.0, FLOOR), rot_z=0.0, seed=50, outfit="worker")
        G.handheld("scanner_gun", (-11.95, 5.0, FLOOR + 1.05), 0.0)
        empty("pin_smart-scan", (-5.0, -1.0, FLOOR + 3.6))
    rnd = random.Random(60)
    length = L.path_length(loop, True)
    for k in range(12):  # boxes riding the belt through the tunnel
        with group("move"):
            s = (rnd.uniform(0.35, 0.6), rnd.uniform(0.3, 0.45), rnd.uniform(0.2, 0.4))
            b = box(f"parcel{k}_b", s, (0, 0, 0), rnd.choice(("carton", "carton2", "carton")), bevel=0.01)
            t = box(f"parcel{k}_tape", (s[0] + 0.004, 0.06, s[2] + 0.004), (0, 0, -0.002), "tote_yellow" if k % 3 == 0 else "wrap", bevel=0)
        body = L.rigid([b, t], f"parcel{k}")
        body["blob"] = [0.01, 0.01]
        L._on_path(body, "drive", 0.7, loop, True, k * length / 12, FLOOR + 0.9)


def staging():
    """Intelligent cargo volume analysis: dimensioning gantry and fill sensors over the dock doors."""
    with group("hot:cargo-volume"):
        G.dimensioner("dim", (6.2, 7.5, FLOOR), 0.0)
        G.carton_stack("dim_load", (6.2, 7.5, FLOOR + 0.1), seed=70, layers=4)
        L.human("dim_op", (4.9, 6.1, FLOOR), rot_z=0.3, seed=71, outfit="worker")
        box("dim_tablet", (0.24, 0.16, 0.02), (5.12, 6.2, FLOOR + 1.12), "bezel", bevel=0, rot=(0.8, 0, 0.3))
        for d in DOCKS:  # 3D load sensors over each door
            box(f"loadsense{d}", (0.2, 0.9, 0.14), (WX1 - 0.25, d, FLOOR + 3.9), "robot_white", bevel=0.02)
            box(f"loadsense{d}_led", (0.02, 0.7, 0.04), (WX1 - 0.36, d, FLOOR + 3.92), "led_cyan", bevel=0)
        empty("pin_cargo-volume", (6.2, 7.5, FLOOR + 4.4))
    L.set_group("static_building")
    for k, y in enumerate((0.0, 11.4, 15.0)):
        G.carton_stack(f"stage{k}", (6.4, y, FLOOR), seed=80 + k, layers=4)
    L.human("dock_worker", (5.2, 13.2, FLOOR), rot_z=0.0, seed=85, outfit="worker")
    box("dock_jack", (1.2, 0.6, 0.12), (6.0, 13.2, FLOOR), "safety_yellow", bevel=0.02)


def control_room():
    """Route optimisation: mezzanine control room with the route wall, dispatch desks and a holo map."""
    y0, y1, x0, x1, zf = 15.2, WY1, -8.0, 6.0, 5.7
    with group("hot:route-optimization"):
        box("cr_slab", (x1 - x0, y1 - y0, 0.3), ((x0 + x1) / 2, (y0 + y1) / 2, zf - 0.3), "panel_grey", bevel=0.02)
        box("cr_floor", (x1 - x0, y1 - y0, 0.02), ((x0 + x1) / 2, (y0 + y1) / 2, zf), "carpet", bevel=0)
        for x in (x0, (x0 + x1) / 2, x1):
            cyl(f"cr_col{x}", 0.2, zf - 0.3 - FLOOR, (x, y0 + 0.1, FLOOR), "panel_grey", verts=16)
        box("cr_glass", (x1 - x0, 0.04, 2.6), ((x0 + x1) / 2, y0, zf), "glass", bevel=0)
        box("cr_rail", (x1 - x0, 0.08, 0.08), ((x0 + x1) / 2, y0, zf + 2.6), "frame_dark", bevel=0)
        for x in (x0, x0 + 3.5, x0 + 7.0, x0 + 10.5, x1):
            box(f"cr_post{x}", (0.08, 0.08, 2.6), (x, y0, zf), "frame_dark", bevel=0)
        box("cr_led", (x1 - x0, 0.03, 0.05), ((x0 + x1) / 2, y0 - 0.02, zf - 0.2), "led_cyan", bevel=0)
        M.screen_at("scr_route", (11.0, 2.8), ((x0 + x1) / 2, WY1 - 0.07, 7.8), BACK, "screen_route", bezel=0.1)
        for k, x in enumerate((-5.0, -1.0, 3.0)):
            M.workstation(f"dispatch{k}", (x, 17.9, zf), rot_z=0.0, screens=("screen_fleet", "screen_route_small"), seed=90 + k)
        L.human("cr_manager", (-6.4, 16.2, zf), rot_z=0.4, seed=95, outfit="teacher")
        cyl("holo_table", 0.8, 0.8, (1.0, 16.2, zf), "robot_white", verts=24)
        empty("pin_route-optimization", (-1.0, 17.6, 10.6))
    with group("move"):
        mp = cyl("holo_map", 0.75, 0.02, (1.0, 16.2, zf + 0.95), "holo", verts=32)
        mp["spin"], mp["spin_speed"] = "z", 0.3
        for k in range(4):
            a = k * math.tau / 4 + 0.4
            p = cyl(f"holo_pin{k}", 0.05, 0.35, (1.0 + math.cos(a) * 0.45, 16.2 + math.sin(a) * 0.45, zf + 0.97), "holo", verts=8)
            p["bob"] = k * 0.8
    L.set_group("static_building")  # stair down from the control room
    run, rise, n = 5.2, zf - FLOOR, 15
    prof = [(0.0, 0.0)]
    for k in range(n):
        prof += [(run * k / n, rise * (k + 1) / n), (run * (k + 1) / n, rise * (k + 1) / n)]
    prof += [(run, rise - 0.3), (0.4, 0.0)]
    L.prism("stair", prof, 1.2, (x0 - run, 17.6, FLOOR), "panel_grey", bevel=0)
    for side in (-0.62, 0.62):
        rail = [(0.0, 1.0), (run, rise + 1.0), (run, rise + 1.06), (0.0, 1.06)]
        L.prism(f"stair_rail{side}", rail, 0.05, (x0 - run, 17.6 + side, FLOOR), "safety_yellow", bevel=0)


def docks():
    """Transfer & delivery: loading docks, docked trucks, dock status screens, gatehouse."""
    with group("hot:transfer-delivery"):
        for k, d in enumerate(DOCKS):
            occupied = d != 5.0
            G.dock_door(f"dock{k}", WX1 + 0.4, d, FLOOR, open_=occupied)
            M.screen_at(f"dock{k}_scr", (0.9, 0.5), (WX1 + 0.42, d + 2.3, FLOOR + 4.2), 0.0, "screen_dock", bezel=0.03)
            for side in (-1, 1):
                box(f"bay{k}{side}", (11.0, 0.12, 0.005), (WX1 + 6.0, d + side * 1.9, 0.021), "paint_white", bevel=0)
            if occupied:
                G.box_truck(f"docked{k}", (WX1 + 0.5 + 4.45, d, 0.02), 0.0, text="TKC LOGISTICS")
        L.human("yard_boss", (18.5, -2.4, 0.02), rot_z=math.pi * 0.8, seed=100, outfit="worker")
        box("gate_booth", (2.0, 2.0, 2.6), (29.0, -15.5, 0.02), "robot_white", bevel=0.05)
        box("gate_booth_win", (2.02, 1.4, 0.9), (29.0, -15.5, 1.3), "carglass", bevel=0)
        box("gate_booth_roof", (2.6, 2.6, 0.15), (29.0, -15.5, 2.62), "rack_blue", bevel=0.03)
        for tag, px, heading, arm in (("in", 32.2, math.pi, 3.4), ("out", 25.8, 0.0, 3.4)):
            box(f"gate_post_{tag}", (0.42, 0.42, 1.1), (px, -15.5, 0.02), "frame_dark", bevel=0.03)
            with group("move"):
                parts = [box(f"barrier_{tag}", (arm, 0.1, 0.1), (-arm / 2, 0, -0.05), "white", bevel=0)]
                parts += [box(f"barrier_{tag}_s{k}", (0.42, 0.105, 0.105), (-0.6 - k * 0.9, 0, -0.052), "red", bevel=0) for k in range(3)]
            L.place(L.rigid(parts, f"barrier_{tag}"), (px, -15.5, 1.12), heading, lift=1, sense=8.0, sense_for="drive", hot="transfer-delivery")
        empty("pin_transfer-delivery", (13.0, 7.5, 6.2))


def shop():
    """POS: click-and-collect shop with counters, the holo POS showcase, parcel lockers and self-checkout."""
    cx, cy = (SX0 + SX1) / 2, (SY0 + SY1) / 2
    with group("hot:pos"):
        box("shop_floor", (SX1 - SX0, SY1 - SY0, 0.02), (cx, cy, 0.16), "terrazzo", bevel=0)
        box("shop_wall_l", (0.3, SY1 - SY0, 4.2), (SX0, cy, 0.16), "robot_white", bevel=0.02)
        box("shop_wall_b", (SX1 - SX0, 0.3, 4.2), (cx, SY1, 0.16), "robot_white", bevel=0.02)
        box("shop_glass_r", (0.04, SY1 - SY0, 3.8), (SX1, cy, 0.16), "glass", bevel=0)
        for name, x0, x1 in (("shop_glass_fa", SX0, -23.4), ("shop_glass_fb", -20.6, SX1)):
            box(name, (x1 - x0, 0.04, 3.8), ((x0 + x1) / 2, SY0, 0.16), "glass", bevel=0)
        for x in (SX0, -26.7, -23.4, -20.6, -17.3, SX1):
            box(f"shop_mull{x}", (0.1, 0.1, 3.8), (x, SY0, 0.16), "frame_dark", bevel=0)
        box("shop_fascia", (SX1 - SX0 + 0.3, 0.4, 0.5), (cx, SY0, 3.96), "rack_blue", bevel=0.03)
        L.text_mesh("shop_txt", "PICK UP  ·  POS", (cx, SY0 - 0.22, 4.02), 0.34, 0.04, "robot_white")
        box("counter", (6.0, 0.8, 1.05), (-24.0, -9.6, 0.16), "wood_desk", bevel=0.03)
        box("counter_top", (6.1, 0.9, 0.05), (-24.0, -9.6, 1.21), "robot_white", bevel=0.01)
        for k, x in enumerate((-25.6, -22.4)):
            E.tilted_screen(f"till{k}", (0.36, 0.26), (x, -9.9, 1.4), BACK, 0.5, "screen_pos")
            L.human(f"cashier{k}", (x, -9.0, 0.16), rot_z=BACK, seed=110 + k, outfit="teacher")
            L.human(f"buyer{k}", (x + 0.3, -10.7, 0.16), rot_z=math.pi / 2, seed=115 + k)
        cyl("pos_base", 1.3, 0.12, (-17.8, -12.4, 0.16), "robot_white", verts=40)
        cyl("pos_base_led", 1.32, 0.03, (-17.8, -12.4, 0.2), "led_cyan", verts=40)
        cyl("pos_stand", 0.12, 1.1, (-17.8, -12.4, 0.28), "silver", verts=16)
        E.tilted_screen("pos_big", (1.2, 0.84), (-17.8, -12.55, 1.7), BACK, 0.55, "screen_pos")
        for row in range(3):
            for col in range(5):
                box(f"locker{row}{col}", (0.5, 0.8, 0.6), (SX0 + 0.45, -15.6 + col * 0.85, 0.3 + row * 0.62), ("panel_grey", "rack_blue", "panel_grey")[row], bevel=0.02)
        M.screen_at("locker_scr", (0.5, 0.7), (SX0 + 0.72, -11.3, 1.4), 0.0, "screen_locker", bezel=0.03)
        L.human("locker_user", (SX0 + 1.3, -12.9, 0.16), rot_z=math.pi, seed=118)
        for k, y in enumerate((-15.0, -13.9)):
            M.kiosk(f"selfpay{k}", (SX1 - 0.6, y, 0.16), face=math.pi, screen="screen_pos")
        L.human("selfpay_user", (SX1 - 1.4, -15.0, 0.16), rot_z=0.0, seed=119)
        E.bookshelf("shop_shelf", (-20.0, SY1 - 0.35, 0.16), rot_z=0.0, w=3.2, h=2.2, seed=120, frame="robot_white")
        empty("pin_pos", (cx, cy, 5.0))
    for side in (-1, 1):  # automatic shop doors
        with group("move"):
            parts = [box(f"sdoor{side}_pane", (1.36, 0.03, 2.6), (0, 0, 0.02), "glass", bevel=0)]
            parts.append(box(f"sdoor{side}_frame", (1.4, 0.06, 0.06), (0, 0, 2.6), "frame_dark", bevel=0))
        L.place(L.rigid(parts, f"sdoor{side}"), (-22.0 + side * 0.7, SY0, 0.16), 0.0, slide=side, slide_dist=1.3, sense=3.0)


# ---------------------------------------------------------------- site

def site():
    L.set_group("static_site")
    rnd = random.Random(200)
    A.solid("plinth", A.outline(A.rect_poly(0, 0, 2 * BASE[0], 2 * BASE[1]), 2.0), -2.0, 2.0, "hosp_white", bevel=0.15)
    A.ring("base_band", A.outline(A.rect_poly(0, 0, 2 * BASE[0] + 0.08, 2 * BASE[1] + 0.08), 2.04), A.outline(A.rect_poly(0, 0, 2 * BASE[0] - 0.1, 2 * BASE[1] - 0.1), 1.95), -0.42, 0.3, "rack_blue")
    box("road", (2 * BASE[0], 8, 0.02), (0, ROAD_Y, 0), "asphalt", bevel=0)
    for i in range(14):
        box(f"dash{i}", (2.4, 0.15, 0.005), (-41 + i * 6.2, ROAD_Y, 0.02), "paint_white", bevel=0)
    for i in range(9):
        box(f"zebra{i}", (0.55, 5.0, 0.005), (-4.0 + i * 1.1, ROAD_Y, 0.021), "paint_white", bevel=0)
    for name, x0, x1 in (("sidewalk_w", -BASE[0], 22.0), ("sidewalk_e", 36.0, BASE[0])):
        box(name, (x1 - x0, 5.0, 0.16), ((x0 + x1) / 2, -20.5, 0), "paving", bevel=0.03)
    box("yard", (35.0, 50.0, 0.02), (26.5, 7.0, 0), "asphalt", bevel=0)
    box("yard_mouth", (14.0, 5.0, 0.02), (29.0, -20.5, 0), "asphalt", bevel=0)
    box("front", (WX1 + 1.0 + BASE[0] - 0.15, 11.4, 0.16), ((-BASE[0] + 0.15 + WX1 + 1.0) / 2, -12.3, 0), "paving", bevel=0.03)  # stops at the yard
    box("lawn_w", (11.0, 38.5, 0.16), (-38.5, 12.75, 0), "lawn", bevel=0.03)
    box("lawn_back", (43.0, 11.0, 0.16), (-12.5, 26.5, 0), "lawn", bevel=0.03)
    # front: sign, POS van, parked cars, benches, trees
    box("sign_base", (6.0, 0.8, 1.2), (1.5, -16.2, 0.16), "robot_white", bevel=0.05)
    L.text_mesh("sign_txt", "TKC LOGISTICS HUB", (1.5, -16.62, 0.5), 0.5, 0.05, "rack_blue")
    G.pos_van("posvan", (-7.0, -12.4, 0.16), math.pi)
    L.car("park0", (-2.0, -9.4, 0.16), rot_z=math.pi / 2, paint="silver")
    L.car("park1", (1.0, -9.4, 0.16), rot_z=math.pi / 2, paint="navy")
    for i, x in enumerate((-36.0, -10.0, 6.0)):
        L.bench(f"bench{i}", (x, -17.4, 0.16))
    for k, x in enumerate(range(-40, 22, 8)):
        A.tree(f"stree{k}", (x, -18.6, 0.16), h=6.0 + rnd.random(), spread=0.9, seed=210 + k)
        L.street_light(f"lamp{k}", (x + 4, -22.6, 0.16), rot_z=-math.pi / 2, h=6.0)
    for k, (x, y) in enumerate(((-38, 4), (-38, 18), (-36, 28), (-22, 27), (-8, 27), (40, 10), (40, -4), (41, 22))):
        A.tree(f"gtree{k}", (x, y, 0.16), h=6.5 + rnd.random() * 2, spread=1.0, seed=230 + k)
    # yard: EV vans, containers, factory behind
    for k, y in enumerate((-4.8, -7.6, -10.4, -13.2)):
        cyl(f"evc{k}", 0.14, 1.5, (11.2, y, 0.02), "robot_white", verts=12)
        box(f"evc{k}_led", (0.02, 0.18, 0.3), (11.35, y, 1.0), "led_green", bevel=0)
        if k != 2:
            L.van(f"evvan{k}", (14.6, y, 0.02), rot_z=math.pi, paint="truck_teal" if k % 2 else "robot_white")
    for r, y in enumerate((22.5, 25.2, 27.9)):
        for level in range(2 if r < 2 else 1):
            G.container(f"cont{r}{level}", (16.0, y, 0.02 + level * 2.6), 0.0, ("container_blue", "container_red", "container_green", "container_blue")[(r + level) % 4])
    box("factory", (12.0, 5.0, 8.0), (34.0, 29.5, 0.16), "panel_grey", bevel=0.04)
    box("factory_band", (12.04, 5.04, 0.5), (34.0, 29.5, 6.5), "container_red", bevel=0)
    G.chimney("chimney_a", 31.5, 30.2)
    G.chimney("chimney_b", 36.5, 30.2, h=19.0)
    for i, (x, y, w, d, h, mat) in enumerate(((-36, 29.5, 8, 5, 34, "tower_blue"), (-24, 30.0, 10, 5, 46, "tower_teal"), (-10, 29.5, 9, 5, 30, "tower_blue"))):
        pts = A.outline(A.rect_poly(x, y, w, d), 1.0)
        A.solid(f"tower{i}", pts, 0.16, h, mat)
        A.mullions(f"tower{i}_mull", A.outline(A.rect_poly(x, y, w + 0.1, d + 0.1), 1.05), 0.16, h, spacing=1.6, size=(0.08, 0.12), mat="tower_frame")
        for zz in range(4, int(h), 4):
            A.ring(f"tower{i}_band{zz}", A.outline(A.rect_poly(x, y, w + 0.2, d + 0.2), 1.1), pts, zz, 0.25, "tower_frame")


# ---------------------------------------------------------------- life

def life():
    # forklift round rack row C, AMRs round the conveyor zone
    for name, build, path, speed, count, z in (
        ("fork", G.forklift, racetrack(-23.3, -5.0, -17.9, 17.5, 1.6), 1.4, 1, FLOOR),
        ("amr", G.amr, racetrack(-13.6, -3.4, 3.4, 13.4, 1.2), 0.9, 3, FLOOR),
    ):
        length = L.path_length(path, True)
        for k in range(count):
            nm = f"{name}{k}"
            with group("move"):
                build(nm, (0, 0, 0), 0.0, seed=300 + k)
            body = L.rigid(L._parts(nm), nm)
            body["blob"] = [3.0, 1.4] if name == "fork" else [1.1, 0.9]
            L._on_path(body, "drive", speed, path, True, k * length / count, z)
    loops = [
        (racetrack(-22.6, -18.4, -21.4, -12.4, 0.59), 2, 1.1, (None, None)),  # customers in and out of the shop
        (racetrack(-40.0, -21.8, 18.0, -21.0, 0.39), 4, 1.25, (None, "worker", None, None)),  # sidewalk
    ]
    n = 0
    for path, count, speed, outfits in loops:
        length = L.path_length(path, True)
        for j in range(count):
            L.walker(f"walker{n}", path, speed, (j + 0.3) * length / count, seed=400 + n, z=0.16, outfit=outfits[j])
            n += 1
    traffic()


def traffic():
    """Trucks circulate through the yard gate; all at one speed, through cars phased clear of them."""
    v = 7.0
    lane_e, lane_w = ROAD_Y + 1.8, ROAD_Y - 1.8
    ex = BASE[0] + 7
    loop = A.fillet_poly([(-ex, lane_e), (34.0, lane_e), (34.0, 20.0), (24.0, 20.0), (24.0, lane_w), (-ex, lane_w)], 4.0, 6)
    total = L.path_length(loop, True)
    n = max(1, int(total // (2 * (BASE[0] + 3))))
    a = total / (2 * n)
    loopers = [i * total / n for i in range(n)]
    for i, at in enumerate(loopers):
        nm = f"haul{i}"
        with group("move"):
            G.box_truck(nm, (0, 0, 0), 0.0, paint=("truck_teal", "robot_white")[i % 2])
        body = L.rigid(L._parts(nm), nm)
        body["blob"] = [9.0, 2.8]
        L._on_path(body, "drive", v, loop, True, at, 0.02)
    lanes = {"east": [(-a, lane_e), (a, lane_e)], "west": [(a, lane_w), (-a, lane_w)]}
    for i, (key, lane) in enumerate(lanes.items()):
        phase, gap = L.best_phase(lane, loop, loopers, BASE[0])
        print(f"traffic {key}: phase {phase} clearance {gap:.1f} m")
        L.driver(f"car_{key}", lane, v, phase, closed=False, paint=("sky_blue", "robot_white")[i], kind=("car", "van")[i])


def icons():
    with group("move"):
        for i, (x, y, z, kind) in enumerate(((-5.0, -1.0, FLOOR + 5.0, "scan"), (6.2, 7.5, FLOOR + 5.6, "box"), (-1.0, 16.0, 11.8, "route"), (14.0, 2.5, 7.4, "truck"), ((SX0 + SX1) / 2, -12.5, 6.2, "cart"))):
            L.plane(f"icon_{kind}{i}", (1.1, 1.1), (x, y, z), f"screen_icon_{kind}", rot=(math.pi / 2, 0, -math.pi / 4 + math.pi / 2))
            bpy.data.objects[f"icon_{kind}{i}"]["bob"] = i * 0.9


def lighting(sun_elev=38, sun_dir=(0.62, -0.78)):
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
    for i, (x0, y0, x1, y1) in enumerate(((WX0, WY0, -12.0, WY1), (-12.0, WY0, WX1, WY1))):
        a = bpy.data.lights.new(f"Bay{i}", "AREA")
        a.shape = "RECTANGLE"
        a.size, a.size_y = (x1 - x0) * 0.8, (y1 - y0) * 0.8
        a.energy = 2.2 * (x1 - x0) * (y1 - y0)
        a.color = (1.0, 0.97, 0.92)
        ob = bpy.data.objects.new(f"Bay{i}", a)
        L.COL.objects.link(ob)
        ob.location = ((x0 + x1) / 2, (y0 + y1) / 2, TRUSS - 0.4)


ATLASES = {
    "building": ["static_building", "hot:smart-scan", "hot:cargo-volume", "hot:route-optimization", "hot:pos"],
    "site": ["static_site", "hot:transfer-delivery"],
}


def build():
    L.reset_scene()
    site()
    shell()
    racking()
    conveyor_zone()
    staging()
    control_room()
    docks()
    shop()
    life()
    icons()
    lighting()
    for name, groups in ATLASES.items():
        bpy.context.scene[f"atlas_{name}"] = ",".join(groups)
    bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(BLEND))
    print("objects:", len(bpy.context.scene.objects), "tris:", sum(len(o.data.polygons) for o in bpy.context.scene.objects if o.type == "MESH"))


if __name__ == "__main__":
    build()
