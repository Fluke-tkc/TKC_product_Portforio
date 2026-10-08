"""Smart Learning - modelled after the Smart Learning AI artwork.

A cut-away learning hall at golden hour (front wall and roof removed, exposed roof joists kept for the smart
ceiling): the adaptive-learning media wall with teacher, AI tutor robot and hologram; tablet desks; an iMac
row; a library corner with beanbags; cloud-LMS group tables under a cloud hologram; proctored exam pods with
VR headsets; a smart IoT ceiling (ring light, projector, sensors, blinds). Outside: campus plaza, bus bay with
a school bus, basketball court with bleachers, playground and school garden; behind the hall the rest of the
school: classroom block with open corridors and rooftop solar, sports hall, data centre and network mast,
battery container, covered walkway.

blender -b --factory-startup --python public/Blender/scripts/smart_learning.py
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
import tkc_cyber as K  # noqa: E402
import tkc_edu as E  # noqa: E402
import tkc_lib as L  # noqa: E402
import tkc_med as M  # noqa: E402
from tkc_lib import box, cyl, empty, group, sphere  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
BLEND = os.path.join(HERE, "..", "smart_learning.blend")
A.FOLIAGE_MATS = ("leafv", "leafv_dark", "leafv_light")

HX0, HX1, HY0, HY1 = -20.0, 16.0, -8.0, 16.0  # hall interior
FLOOR = 0.3
CEIL = 7.4  # underside of the roof joists
TOP = 8.0  # wall tops
DOOR_Y = (-6.0, -2.0)  # entrance in the left wall
BASE = (42.0, 32.0)
ROAD_Y = -25.0
BACK = -math.pi / 2  # screens on the back wall face -y
JOISTS = (-14.0, -8.0, -2.0, 4.0, 10.0)  # roof joists, one over each front column
# The hall is built at ground level (all its numbers above are hall-local) and then lifted by Z onto a glass
# podium, the Learning Commons, which is set back 3 m all round so the pavilion floats over it.
Z = 7.2
PODIUM = (-17.0, 13.0, -5.0, 13.0)  # x0, x1, y0, y1
TOWER = (27.0, 17.0, 8.0, 6.5)  # innovation tower: x, y, w, d
# Bus bay cut into the sidewalk: 24 m at full depth with tapers in (10 m) and out (8 m), so the 9 m bus pulls in and
# out on smooth S-curves without its body crossing the kerb (the swept body was checked against the kerb with both
# axles on the path). It stops BUS_WAIT s to let students off and on.
BAY = (-22.0, -12.0, 12.0, 20.0)  # x: taper start, full depth from, full depth to, taper end
KERB_Y, BAY_Y, BUS_Y = -21.0, -17.6, -19.25  # road edge, back of the bay, centre line of the stopped bus
BUS_V, BUS_EASE, BUS_WAIT = 7.0, 12.0, 9.0  # m/s, braking / pulling-away distance, seconds at the stop


def rect(x0, y0, x1, y1):
    return [(x0, y0), (x1, y0), (x1, y1), (x0, y1)]


def racetrack(x0, y0, x1, y1, r):
    return A.fillet_poly(rect(x0, y0, x1, y1), r, 6)


# ---------------------------------------------------------------- shell

def shell():
    L.set_group("static_building")
    box("slab", (HX1 - HX0 + 1.0, HY1 - HY0 + 1.0, FLOOR - 0.02), ((HX0 + HX1) / 2, (HY0 + HY1) / 2, 0), "hosp_white", bevel=0.03)
    box("floor", (HX1 - HX0, HY1 - HY0, 0.02), ((HX0 + HX1) / 2, (HY0 + HY1) / 2, FLOOR - 0.02), "floor_dark", bevel=0)
    box("wall_back", (HX1 - HX0 + 1.0, 0.5, TOP - FLOOR), ((HX0 + HX1) / 2, HY1 + 0.25, FLOOR), "hosp_white", bevel=0.02)
    lx = HX0 - 0.25
    box("wall_left_a", (0.5, DOOR_Y[0] - HY0 + 0.5, TOP - FLOOR), (lx, (HY0 - 0.5 + DOOR_Y[0]) / 2, FLOOR), "hosp_white", bevel=0.02)
    box("wall_left_b", (0.5, HY1 + 0.5 - DOOR_Y[1], TOP - FLOOR), (lx, (DOOR_Y[1] + HY1 + 0.5) / 2, FLOOR), "hosp_white", bevel=0.02)
    box("wall_left_lintel", (0.5, DOOR_Y[1] - DOOR_Y[0], TOP - 3.6), (lx, sum(DOOR_Y) / 2, 3.6), "hosp_white", bevel=0.02)
    box("cap_back", (HX1 - HX0 + 1.04, 0.54, 0.1), ((HX0 + HX1) / 2, HY1 + 0.25, TOP), "purple", bevel=0.01)
    box("cap_left", (0.54, HY1 - HY0 + 1.04, 0.1), (lx, (HY0 + HY1) / 2, TOP), "purple", bevel=0.01)
    box("cap_left_front", (0.54, 0.05, TOP - FLOOR), (lx, HY0 - 0.52, FLOOR), "purple", bevel=0)
    box("skirt_back", (HX1 - HX0, 0.03, 0.12), ((HX0 + HX1) / 2, HY1 - 0.02, FLOOR), "purple", bevel=0)
    # right side: floor-to-ceiling windows onto the courts and the sunset
    gx = HX1 + 0.05
    box("windows", (0.04, HY1 - HY0, CEIL - FLOOR), (gx, (HY0 + HY1) / 2, FLOOR), "glass", bevel=0)
    for k in range(13):
        box(f"win_mull{k}", (0.1, 0.1, CEIL - FLOOR), (gx, HY0 + k * 2.0, FLOOR), "robot_white", bevel=0)
    for z in (FLOOR, 2.7, 5.1):
        box(f"win_transom{z}", (0.12, HY1 - HY0, 0.1), (gx, (HY0 + HY1) / 2, z), "robot_white", bevel=0)
    box("win_head", (0.4, HY1 - HY0 + 0.4, TOP - CEIL), (gx, (HY0 + HY1) / 2, CEIL), "hosp_white", bevel=0.02)
    # front: columns and a beam carrying the joists (the cut shows the structure)
    for x in (-14.0, -8.0, -2.0, 4.0, 10.0, HX1):
        cyl(f"front_col{x}", 0.26, CEIL - FLOOR, (x, HY0, FLOOR), "hosp_white", verts=24)
        cyl(f"front_col{x}_ring", 0.28, 0.08, (x, HY0, FLOOR + 2.4), "orange", verts=24)
    box("front_beam", (HX1 - HX0 + 0.5, 0.4, TOP - CEIL), ((HX0 + HX1) / 2, HY0, CEIL), "hosp_white", bevel=0.02)
    box("front_beam_band", (HX1 - HX0 + 0.5, 0.02, 0.12), ((HX0 + HX1) / 2, HY0 - 0.21, CEIL + 0.2), "orange", bevel=0)
    for x in JOISTS:
        box(f"joist{x}", (0.2, HY1 - HY0 + 0.4, 0.4), (x, (HY0 + HY1) / 2, CEIL), "frame_dark", bevel=0.01)
    E.duct("duct_a", HX0 + 0.4, HX1 - 0.4, 13.2, 6.7, 0.32)
    # linear pendants over the iMac row and the exam rows
    for i, (x0, x1, y, z) in enumerate(((3.2, 15.2, 14.9, 6.1), (3.5, 12.9, -5.4, 6.2), (3.5, 12.9, -2.6, 6.2), (3.5, 12.9, 0.2, 6.2))):
        box(f"pendant{i}", (x1 - x0, 0.14, 0.07), ((x0 + x1) / 2, y, z), "led_white", bevel=0)
        box(f"pendant{i}_body", (x1 - x0 + 0.1, 0.2, 0.08), ((x0 + x1) / 2, y, z + 0.07), "darkgray", bevel=0)
        for x in [j for j in JOISTS if x0 < j < x1]:  # hung from the joists above
            cyl(f"pendant{i}_cable{x:.1f}", 0.01, CEIL - z - 0.15, (x, y, z + 0.15), "black", verts=6)


# ---------------------------------------------------------------- zones

def ai_wall():
    """AI-driven personalised learning: the adaptive media wall, teacher, robot tutor, tablet desks."""
    rnd = random.Random(10)
    with group("hot:ai-learning"):
        box("rug_ai", (16.0, 7.4, 0.01), (-6.0, 12.0, FLOOR), "rug_purple", bevel=0)
        y = HY1 - 0.07
        for k, (z, kind) in enumerate(((1.9, "cloud"), (3.1, "brain"), (4.3, "award"), (5.5, "wifi"))):
            L.plane(f"wall_icon{k}", (0.95, 0.95), (-12.9, y, z), f"screen_icon_{kind}", rot=(math.pi / 2, 0, 0))
        M.screen_at("scr_adaptive", (7.0, 3.6), (-7.6, y, 4.1), BACK, "screen_lrn_adaptive", bezel=0.1)
        M.screen_at("scr_wheel", (3.4, 3.4), (-2.0, y, 4.2), BACK, "screen_lrn_wheel", bezel=0.1)
        M.screen_at("scr_ar", (2.2, 1.9), (1.4, y, 3.3), BACK, "screen_lrn_ar", bezel=0.08)
        L.human("teacher", (-6.0, 14.5, FLOOR), rot_z=BACK + 0.35, seed=10, outfit="teacher")
        E.podium("podium", (-4.4, 14.3, FLOOR), BACK)
        M.humanoid_robot("tutor", (-11.2, 14.4, FLOOR), rot_z=BACK + 0.4)
        for row, dy in enumerate((9.8, 11.9)):
            for i, x in enumerate((-11.4, -8.0, -4.6, -1.2)):
                E.student_desk(f"ai_desk{row}{i}", (x, dy, FLOOR))
                for s, sx in enumerate((-0.33, 0.33)):
                    E.seated_student(f"ai_s{row}{i}{s}", (x + sx, dy - 0.55, FLOOR), math.pi / 2, 20 + row * 10 + i * 2 + s, gear="vr" if rnd.random() < 0.2 else ("phones" if rnd.random() < 0.3 else None))
                    E.tablet_on_desk(f"ai_tab{row}{i}{s}", (x + sx, dy + 0.02, FLOOR + 0.74), BACK)
                cyl(f"ai_cup{row}{i}", 0.04, 0.1, (x + 0.55, dy + 0.18, FLOOR + 0.74), rnd.choice(("orange", "sky_blue", "lime")), verts=10)
        empty("pin_ai-learning", (-7.6, 15.2, 6.9))
    with group("move"):  # hologram brain over the class
        brain = sphere("holo_brain", 0.55, (-7.6, 12.4, 6.2), "holo", scale=(1.2, 0.9, 0.8), subdiv=2)
        brain["spin"], brain["spin_speed"], brain["bob"] = "z", 0.3, 0.0
        ring = M.disc_ring("holo_brain_ring", 1.05, 0.98, (-7.6, 12.4, 6.2), 0.03, "holo", n=48)
        ring["spin"], ring["spin_speed"] = "z", -0.6


def library():
    L.set_group("static_building")
    box("rug_lib", (4.8, 11.0, 0.01), (-17.2, 9.8, FLOOR), "rug_yellow", bevel=0)
    for i, y in enumerate((5.0, 7.1, 9.2, 11.3, 13.4)):
        E.bookshelf(f"shelf_l{i}", (HX0 + 0.18, y, FLOOR), rot_z=math.pi / 2, w=2.0, h=3.2, seed=100 + i)
    for i, x in enumerate((-18.9, -16.8)):
        E.bookshelf(f"shelf_b{i}", (x, HY1 - 0.18, FLOOR), rot_z=0.0, w=2.0, h=3.2, seed=110 + i)
    for k, dz in enumerate((0.0, 1.0, 2.0)):  # library ladder leaning on the shelves
        box(f"ladder_rung{k}", (0.04, 0.5, 0.04), (HX0 + 0.75 - dz * 0.1, 9.2, FLOOR + 0.5 + dz), "wood_desk", bevel=0)
    for side in (-0.25, 0.25):
        box(f"ladder_rail{side}", (0.05, 0.05, 3.1), (HX0 + 0.8, 9.2 + side, FLOOR), "wood_desk", bevel=0, rot=(0, -0.1, 0))
    for i, (x, y, col) in enumerate(((-17.6, 13.2, "orange"), (-16.2, 12.0, "purple"), (-17.8, 10.6, "lime"), (-15.9, 9.7, "sky_blue"), (-17.4, 8.2, "flower_pink"))):
        E.beanbag(f"beanbag{i}", (x, y, FLOOR), col)
        if i != 4:
            L.human(f"reader{i}", (x, y, FLOOR + 0.05), rot_z=-0.6 + i * 0.7, seed=130 + i, pose="sit", h=1.5, outfit=("student", "student2", None, "student")[i])
    L.sofa("lib_sofa", (-17.0, 5.6, FLOOR), w=2.2, rot_z=-math.pi / 2, fabric="teal")
    for k, dy in enumerate((-0.5, 0.5)):
        L.human(f"sofa_reader{k}", (-16.95, 5.6 + dy, FLOOR + 0.02), rot_z=0.0, seed=140 + k, pose="sit", h=1.52, outfit=None)
    cyl("lib_table", 0.45, 0.42, (-15.6, 5.6, FLOOR), "wood_desk", verts=24)
    for k in range(3):
        box(f"lib_book{k}", (0.24, 0.18, 0.04), (-15.6 + (k - 1) * 0.12, 5.6, FLOOR + 0.42 + k * 0.04), E.BOOK_COLOURS[k * 3], bevel=0, rot=(0, 0, k * 0.4))


def lms_zone():
    """Cloud-based LMS: group tables with tablets and laptops, charging cart, LMS wall, cloud hologram."""
    rnd = random.Random(200)
    tables = [(-16.0, 0.6), (-12.2, 0.6), (-8.4, 0.6)]
    with group("hot:cloud-lms"):
        box("rug_lms", (12.6, 5.6, 0.01), (-12.6, 0.5, FLOOR), "rug_teal", bevel=0)
        for t, (cx, cy) in enumerate(tables):
            E.student_desk(f"lms_table{t}", (cx, cy, FLOOR), w=2.4, d=1.2, top="robot_white")
            for s, (sx, sy, h) in enumerate(((-0.6, -0.95, math.pi / 2), (0.6, -0.95, math.pi / 2), (-0.6, 0.95, -math.pi / 2), (0.6, 0.95, -math.pi / 2))):
                E.seated_student(f"lms_s{t}{s}", (cx + sx, cy + sy, FLOOR), h, 210 + t * 4 + s, gear="phones" if rnd.random() < 0.25 else None)
                dev = (cx + sx, cy + sy * 0.42, FLOOR + 0.74)
                if (t + s) % 2:
                    E.laptop(f"lms_pc{t}{s}", dev, h + math.pi, "screen_lrn_lms")
                else:
                    E.tablet_on_desk(f"lms_tab{t}{s}", dev, h + math.pi, "screen_tablet")
        E.charging_cart("cart", (HX0 + 1.1, -1.4, FLOOR), rot_z=math.pi / 2)
        M.screen_at("scr_lms", (3.2, 1.8), (HX0 + 0.07, 1.0, 3.2), 0.0, "screen_lrn_lms", bezel=0.08)
        M.kiosk("attendance", (-17.4, -6.5, FLOOR), face=math.pi, screen="screen_face")
        empty("pin_cloud-lms", (-12.2, 0.6, 6.6))
    with group("move"):  # the cloud hologram with data beams down to each table
        for k, (dx, dy, dz, r) in enumerate(((0, 0, 0.3, 0.8), (-0.9, 0.2, 0, 0.6), (0.9, -0.1, 0.05, 0.65), (0.4, 0.5, 0.45, 0.5), (-0.4, -0.4, 0.4, 0.5))):
            c = sphere(f"holo_cloud{k}", r, (-12.2 + dx, 0.6 + dy, 5.0 + dz), "holo", scale=(1, 1, 0.75), subdiv=2)
            c["bob"] = 0.0
        for t, (cx, cy) in enumerate(tables):
            cyl(f"holo_beam{t}", 0.03, 3.5, (cx, cy, FLOOR + 0.85), "holo", verts=8)


def computer_row():
    L.set_group("static_building")
    box("mac_desk", (12.4, 0.75, 0.04), (9.2, HY1 - 0.55, FLOOR + 0.72), "wood_desk", bevel=0.01)
    box("mac_panel", (12.4, 0.03, 0.6), (9.2, HY1 - 0.2, FLOOR + 0.12), "darkgray", bevel=0)
    for x in (3.1, 9.2, 15.3):
        box(f"mac_leg{x}", (0.05, 0.7, 0.72), (x, HY1 - 0.55, FLOOR), "darkgray", bevel=0)
    for i in range(8):
        x = 3.6 + i * 1.6
        E.imac(f"imac{i}", (x, HY1 - 0.45, FLOOR + 0.76), BACK)
        if i not in (2, 6):
            E.seated_student(f"mac_s{i}", (x, HY1 - 1.3, FLOOR), math.pi / 2, 300 + i, gear="phones" if i % 3 == 0 else None)
    L.text_mesh("slogan", "LEARN  CREATE  SHARE", (9.2, HY1 - 0.04, 4.3), 0.62, 0.06, "orange")
    for i, (x, col) in enumerate(((4.2, "sky_blue"), (14.2, "lime"))):
        M.screen_at(f"mac_poster{i}", (1.4, 0.9), (x, HY1 - 0.05, 3.0), BACK, ("screen_lrn_ar", "screen_lrn_wheel")[i], bezel=0.04)


def assessment_zone():
    """Professional assessment & certificate: proctored exam pods, VR practicals, check-in and certificate wall."""
    with group("hot:assessment"):
        box("rug_exam", (13.2, 9.6, 0.01), (8.4, -2.6, FLOOR), "rug_orange", bevel=0)
        k = 0
        for r, y in enumerate((-5.4, -2.6, 0.2)):
            for c, x in enumerate((4.4, 8.2, 12.0)):
                E.exam_pod(f"pod{r}{c}", (x, y, FLOOR), 400 + k, gear=("vr", "phones", None)[(r + c) % 3], panel=("coral", "mint", "sky_blue")[c])
                k += 1
        cyl("cert_pole", 0.06, 1.4, (1.4, -2.0, FLOOR), "silver", verts=10)
        box("cert_foot", (0.6, 0.8, 0.05), (1.4, -2.0, FLOOR), "silver", bevel=0.01)
        M.screen_at("scr_cert", (2.4, 1.4), (1.52, -2.0, 2.3), 0.0, "screen_lrn_cert", bezel=0.06)
        M.kiosk("checkin", (1.6, -6.7, FLOOR), face=0.0, screen="screen_face")
        cyl("proctor_cam_pole", 0.06, 3.2, (15.2, 1.8, FLOOR), "darkgray", verts=10)
        box("proctor_cam", (0.3, 0.2, 0.2), (15.05, 1.8, FLOOR + 3.1), "robot_white", bevel=0.04, rot=(0, 0, math.pi))
        sphere("proctor_cam_led", 0.04, (14.88, 1.8, FLOOR + 3.22), "led_red", subdiv=1)
        empty("pin_assessment", (8.2, -2.6, 3.4))


def spine():
    """Planted island down the middle of the hall, under the smart ring light."""
    L.set_group("static_building")
    box("island", (22.0, 1.4, 0.5), (0.0, 5.3, FLOOR), "robot_white", bevel=0.06)
    box("island_band", (22.02, 1.42, 0.08), (0.0, 5.3, FLOOR + 0.3), "orange", bevel=0)
    M.flower_bed("island_flowers", -10.6, 4.75, 10.6, 5.85, FLOOR + 0.06, seed=500)
    for i, x in enumerate((-8.0, 0.0, 8.0)):
        A.tree(f"island_tree{i}", (x, 5.3, FLOOR + 0.5), h=4.2, spread=0.65, seed=510 + i, detail=1)
    for i, y in enumerate((7.8, 10.2, 12.6)):
        M.topiary(f"win_plant{i}", (HX1 - 0.8, y, FLOOR), h=2.4, seed=520 + i, planter="purple")


def iot_ceiling():
    """IoT-enabled smart classroom: ring light, projector, sensors, speakers, cameras, smart blinds, panel, purifier."""
    with group("hot:iot-classrooms"):
        E.ring_light("ring", (-2.0, 5.3, 6.3), 2.6, CEIL, cable_angles=(math.pi / 2, -math.pi / 2))  # both cables under joist x=-2
        cyl("proj_rod", 0.03, 0.55, (-8.0, 9.0, 6.85), "silver", verts=8)
        box("projector", (0.5, 0.42, 0.18), (-8.0, 9.0, 6.7), "robot_white", bevel=0.03)
        cyl("proj_lens", 0.07, 0.06, (-8.0, 9.24, 6.79), "black", verts=12, rot=(math.pi / 2, 0, math.pi))
        for i, (x, y) in enumerate(((-14, 0), (-8, 0), (4, 0), (10, 0), (-14, 10), (4, 10), (10, 10))):
            box(f"sensor{i}", (0.18, 0.18, 0.08), (x, y, CEIL - 0.08), "robot_white", bevel=0.02)
            sphere(f"sensor{i}_led", 0.025, (x, y - 0.09, CEIL - 0.04), "led_green", subdiv=1)
        for i, (x, y) in enumerate(((-14.0, 6.0), (4.0, 6.0), (10.0, -3.0), (-14.0, -5.0))):
            cyl(f"speaker{i}_rod", 0.012, 0.6, (x, y, CEIL - 0.6), "black", verts=6)
            cyl(f"speaker{i}", 0.18, 0.28, (x, y, CEIL - 0.9), "darkgray", verts=16)
        for i, (x, y) in enumerate(((-11.0, HY0 + 0.3), (7.0, HY0 + 0.3), (HX1 - 0.5, HY1 - 0.5))):
            cyl(f"cam{i}_base", 0.12, 0.04, (x, y, CEIL - 0.04), "robot_white", verts=16)
            sphere(f"cam{i}", 0.08, (x, y, CEIL - 0.05), "black", scale=(1, 1, 0.7), subdiv=1)
        for i in range(6):  # smart blinds, half of them lowered for the evening sun
            y = 4.0 + i * 2.0 + 1.0
            box(f"blind_box{i}", (0.14, 1.9, 0.14), (HX1 - 0.1, y, CEIL - 0.14), "robot_white", bevel=0.02)
            box(f"blind_led{i}", (0.02, 0.3, 0.03), (HX1 - 0.18, y, CEIL - 0.1), "led_cyan", bevel=0)
            if i % 2 == 0:
                box(f"blind{i}", (0.03, 1.86, 2.5), (HX1 - 0.12, y, CEIL - 2.64), "fabriclight", bevel=0)
        M.screen_at("scr_iot", (0.6, 0.4), (-14.2, HY1 - 0.07, 1.55), BACK, "screen_lrn_iot", bezel=0.03)
        box("purifier", (0.5, 0.5, 1.2), (HX1 - 0.8, 3.5, FLOOR), "robot_white", bevel=0.08)
        M.disc_ring("purifier_led", 0.2, 0.15, (HX1 - 0.8, 3.24, FLOOR + 1.0), 0.02, "led_cyan", rot=(math.pi / 2, 0, 0), n=24)
        empty("pin_iot-classrooms", (-2.0, 5.3, 7.9))


def entrance():
    for side in (-1, 1):
        with group("move"):
            parts = [box(f"door{side}_pane", (0.03, 1.96, 3.2), (0, 0, 0.02), "glass", bevel=0)]
            for k, (fy, fz, sy, sz) in enumerate(((0, 0, 2.0, 0.06), (0, 3.18, 2.0, 0.06), (-0.97, 0, 0.06, 3.26), (0.97, 0, 0.06, 3.26))):
                parts.append(box(f"door{side}_f{k}", (0.06, sy, sz), (0, fy, fz), "robot_white", bevel=0))
        L.place(L.rigid(parts, f"door{side}"), (HX0 - 0.25, sum(DOOR_Y) / 2 + side * 1.0, FLOOR), 0.0, slide=side, slide_axis="y", slide_dist=1.9, sense=3.2)
    L.text_mesh("ent_sign", "LEARNING CENTRE", (HX0 - 0.5 - 0.04, sum(DOOR_Y) / 2 + 3.4, 4.6), 0.4, 0.05, "purple", rot=(math.pi / 2, 0, -math.pi / 2))


# ---------------------------------------------------------------- the lifted pavilion: podium, envelope, access

def hall_envelope():
    """Built after the lift (absolute heights): a deep slab under the floating hall with a lit edge and downlights,
    a glass front between the columns, a glass roof over the joists with a diagrid and a lit brim."""
    L.set_group("static_building")
    zf = Z + FLOOR
    out = A.outline(rect(HX0 - 0.5, HY0 - 0.5, HX1 + 0.5, HY1 + 0.5), 0.8)
    A.solid("pav_underslab", out, Z - 0.9, 0.9, "hosp_white", bevel=0.12)
    A.ring("pav_edge_led", A.outline(rect(HX0 - 0.53, HY0 - 0.53, HX1 + 0.53, HY1 + 0.53), 0.83), A.outline(rect(HX0 - 0.48, HY0 - 0.48, HX1 + 0.48, HY1 + 0.48), 0.78), Z - 0.55, 0.1, "led_cyan")
    A.downlights("pav_dl", rect(HX0 + 0.5, HY0 + 0.5, HX1 - 0.5, HY1 - 0.5), Z - 0.92, spacing=3.0, mat="led_white")
    box("pav_front_glass", (HX1 - HX0, 0.04, CEIL - FLOOR), ((HX0 + HX1) / 2, HY0 - 0.3, zf), "glass", bevel=0)
    for k in range(19):
        x = HX0 + k * (HX1 - HX0) / 18
        for j in range(2):
            box(f"pav_mull{k}_{j}", (0.07, 0.12, (CEIL - FLOOR) / 2), (x, HY0 - 0.3, zf + j * (CEIL - FLOOR) / 2), "robot_white", bevel=0)
    box("pav_transom", (HX1 - HX0, 0.14, 0.1), ((HX0 + HX1) / 2, HY0 - 0.3, zf + 3.0), "robot_white", bevel=0)
    roof = rect(HX0 - 0.25, HY0 - 0.25, HX1 + 0.25, HY1 + 0.25)
    A.solid("pav_roof_glass", roof, Z + TOP + 0.02, 0.06, "glass")
    K.diagrid_roof("pav_roof", A.outline(roof, 0.3, 0.4), Z + TOP + 0.08, pitch=4.5, depth=0.28)
    brim_o = A.outline(rect(HX0 - 1.6, HY0 - 1.6, HX1 + 1.6, HY1 + 1.6), 1.6)
    brim_i = A.outline(rect(HX0 - 0.2, HY0 - 0.2, HX1 + 0.2, HY1 + 0.2), 0.2)
    A.ring("pav_brim", brim_o, brim_i, Z + TOP + 0.08, 0.45, "hosp_white")
    A.ring("pav_brim_band", A.outline(rect(HX0 - 1.62, HY0 - 1.62, HX1 + 1.62, HY1 + 1.62), 1.62), A.outline(rect(HX0 - 1.56, HY0 - 1.56, HX1 + 1.56, HY1 + 1.56), 1.58), Z + TOP + 0.2, 0.14, "purple")
    L.text_mesh("pav_name", "SMART LEARNING HUB", (-2.0, HY0 - 1.64, Z + TOP + 0.1), 0.34, 0.03, "purple", resolution=3)


def podium_commons():
    """The ground floor under the pavilion: a glass Learning Commons with a maker lab, a cafe and a robot host."""
    L.set_group("static_building")
    x0, x1, y0, y1 = PODIUM
    h = Z - 0.9 - 0.16
    box("com_floor", (x1 - x0, y1 - y0, 0.14), ((x0 + x1) / 2, (y0 + y1) / 2, 0.16), "terrazzo", bevel=0)
    box("com_back", (x1 - x0, 0.3, h), ((x0 + x1) / 2, y1 - 0.15, 0.16), "hosp_white", bevel=0.02)
    for name, gx, gy, w, d in (("com_glass_fl", (x0 - 0.9) / 2, y0, -0.9 - x0, 0.04), ("com_glass_fr", (x1 + 0.9) / 2, y0, x1 - 0.9, 0.04), ("com_glass_l", x0, (y0 + y1) / 2, 0.04, y1 - y0), ("com_glass_r", x1, (y0 + y1) / 2, 0.04, y1 - y0)):
        box(name, (w, d, h - 0.2), (gx, gy, 0.3), "glass", bevel=0)
    for k in range(16):
        x = x0 + k * (x1 - x0) / 15
        for j in range(2):
            box(f"com_mull{k}_{j}", (0.08, 0.12, (h - 0.2) / 2), (x, y0, 0.3 + j * (h - 0.2) / 2), "robot_white", bevel=0)
    for s, x in ((-1, x0), (1, x1)):
        for k in range(10):
            box(f"com_mull_side{s}_{k}", (0.12, 0.08, h - 0.2), (x, y0 + k * (y1 - y0) / 9, 0.3), "robot_white", bevel=0)
    box("com_sill", (x1 - x0, 0.3, 0.14), ((x0 + x1) / 2, y0, 0.16), "purple", bevel=0)
    L.text_mesh("com_sign", "LEARNING COMMONS", (-9.0, y0 - 0.06, 4.6), 0.5, 0.04, "purple", resolution=3)
    for k, x in enumerate((-1.0, 1.0)):  # main doors, parted
        box(f"com_door{k}", (1.4, 0.05, 2.8), (x * 1.6, y0 - 0.2, 0.3), "glass", bevel=0)
    box("com_path", (2.6, y0 - 0.15 + 8.0, 0.18), (0, (y0 - 0.15 - 8.0) / 2, 0), "terrazzo", bevel=0)  # plaza -> doors
    # reception with the robot host
    M.curved_desk("com_desk", (0.0, 3.0), 1.4, 1.9, math.radians(200), math.radians(340), 0.3)
    M.humanoid_robot("com_robot", (0.0, 3.4, 0.3), rot_z=-math.pi / 2)
    # maker lab: benches with 3D printers, robot kits and a laser cutter
    rnd = random.Random(870)
    for i, (bx, by) in enumerate(((-13.5, 0.5), (-13.5, 4.5), (-8.5, 0.5), (-8.5, 4.5))):
        box(f"mk_bench{i}", (3.4, 1.3, 0.9), (bx, by, 0.3), "wood_desk", bevel=0.03)
        for k in range(2):
            px = bx - 0.8 + k * 1.6
            box(f"mk_print{i}{k}", (0.6, 0.6, 0.65), (px, by, 1.2), "robot_white", bevel=0.03)
            box(f"mk_print{i}{k}_win", (0.44, 0.02, 0.4), (px, by - 0.31, 1.32), "led_cyan", bevel=0)
            box(f"mk_kit{i}{k}", (0.3, 0.22, 0.14), (px + 0.45, by + 0.35, 1.2), rnd.choice(("orange", "lime", "sky_blue")), bevel=0.02)
        for s in range(2):
            L.human(f"maker{i}{s}", (bx - 0.8 + s * 1.6, by - 1.1, 0.3), rot_z=math.pi / 2, seed=880 + i * 2 + s, outfit=("student", "student2")[s], h=1.55)
    box("mk_laser", (1.8, 1.0, 1.0), (-15.6, 10.6, 0.3), "panel_grey", bevel=0.04)
    box("mk_laser_lid", (1.7, 0.9, 0.06), (-15.6, 10.6, 1.3), "orange", bevel=0.01)
    E.bookshelf("mk_shelf", (-11.0, y1 - 0.5, 0.3), rot_z=0.0, w=3.0, h=2.4, seed=885)
    # cafe on the right
    box("cafe_counter", (5.0, 0.8, 1.05), (8.0, y1 - 1.2, 0.3), "wood_desk", bevel=0.04)
    box("cafe_counter_top", (5.1, 0.9, 0.05), (8.0, y1 - 1.2, 1.35), "purple", bevel=0.01)
    M.screen_at("cafe_menu", (2.4, 1.0), (8.0, y1 - 0.32, 3.0), -math.pi / 2, "screen_cafe", bezel=0.05)
    L.human("barista", (8.0, y1 - 0.6, 0.3), rot_z=-math.pi / 2, seed=890, outfit="teacher")
    for i, (cx, cy) in enumerate(((4.5, 0.5), (8.5, 0.5), (11.0, 3.6), (4.5, 5.6), (8.5, 6.4))):
        L.cafe_set(f"com_cafe{i}", (cx, cy, 0.3), seed=891 + i, chairs=3)
    for k, (x, y) in enumerate(((-16.2, -4.2), (12.2, -4.2), (-3.2, 12.2))):
        L.potted_plant(f"com_plant{k}", (x, y, 0.3), h=1.8, seed=897 + k, pot="purple")


def sky_access():
    """Entrance to the lifted hall: a landing outside its doors, a glass lift and a stair tower down to the plaza."""
    L.set_group("static_site")
    zf = Z + FLOOR
    lx0, lx1, ly0, ly1 = HX0 - 4.4, HX0 - 0.25, -7.2, -0.9
    box("landing", (lx1 - lx0, ly1 - ly0, 0.5), ((lx0 + lx1) / 2, (ly0 + ly1) / 2, zf - 0.5), "hosp_white", bevel=0.04)
    box("landing_led", (lx1 - lx0, 0.04, 0.06), ((lx0 + lx1) / 2, ly0 - 0.02, zf - 0.3), "led_cyan", bevel=0)
    for name, a, b in (("rail_f", (lx0, ly0), (lx1, ly0)), ("rail_l", (lx0, ly0), (lx0, ly1))):
        (ax, ay), (bx, by) = a, b
        ln, ang = math.hypot(bx - ax, by - ay), math.atan2(by - ay, bx - ax)
        box(f"landing_{name}", (ln, 0.04, 1.1), ((ax + bx) / 2, (ay + by) / 2, zf), "glass", bevel=0, rot=(0, 0, ang))
        box(f"landing_{name}_cap", (ln, 0.08, 0.06), ((ax + bx) / 2, (ay + by) / 2, zf + 1.1), "silver", bevel=0, rot=(0, 0, ang))
    cyl("landing_col", 0.22, zf - 0.5 - 0.16, (lx0 + 0.4, ly0 + 0.4, 0.16), "hosp_white", verts=20)
    K.glass_lift("hall_lift", (lx0 + 2.0, ly1 + 1.2, 0.16), zf + 3.0, car_z=zf)
    sx, sy = lx0 + 2.0, ly1 + 5.0
    box("stair_tower", (3.6, 4.4, zf + 3.6), (sx, sy, 0.16), "hosp_white", bevel=0.05)
    box("stair_tower_glass", (0.06, 3.4, zf + 2.0), (sx - 1.83, sy, 0.8), "tower_glass", bevel=0)
    box("stair_tower_cap", (3.8, 4.6, 0.3), (sx, sy, zf + 3.76), "purple", bevel=0.03)
    box("stair_door", (1.2, 0.05, 2.3), (sx, sy - 2.23, 0.16), "purple", bevel=0.01)


def raise_hall(before):
    """Lift everything built since `before` (the hall and its contents) by Z; children ride with their parents."""
    for o in bpy.data.objects:
        if o not in before and o.parent is None:
            o.location.z += Z


def innovation_tower():
    """A stack of glass boxes, each turned and offset from the last, lit slab edges, an observatory dome on top."""
    L.set_group("static_tower")
    x, y, w, d = TOWER
    z = 0.18
    fh, n = 5.0, 8
    for i in range(n):
        dx, dy, rot = (0.9 if i % 2 else -0.9), (0.5 if i % 2 else -0.5), (0.07 if i % 2 else -0.05)
        body = A.outline(A.rect_poly(x + dx, y + dy, w, d, rot), 0.6)
        A.solid(f"itow_box{i}", body, z + 0.4, fh - 0.4, ("tower_glass", "tower_glass2")[i % 2])
        slab = A.outline(A.rect_poly(x + dx, y + dy, w + 0.5, d + 0.5, rot), 0.85)
        A.solid(f"itow_slab{i}", slab, z, 0.4, "hosp_white", bevel=0.05)
        A.ring(f"itow_led{i}", A.outline(A.rect_poly(x + dx, y + dy, w + 0.54, d + 0.54, rot), 0.87), A.outline(A.rect_poly(x + dx, y + dy, w + 0.46, d + 0.46, rot), 0.83), z + 0.14, 0.08, "led_cyan" if i % 2 else "led_pink")
        bmo = A.outline(A.rect_poly(x + dx, y + dy, w + 0.08, d + 0.08, rot), 0.64)
        bm_parts = A.stations(bmo, 1.6)
        for k, ((mx, my), ang) in enumerate(bm_parts):
            box(f"itow_mull{i}_{k}", (0.06, 0.1, fh - 0.4), (mx, my, z + 0.4), "hosp_white", bevel=0, rot=(0, 0, ang))
        z += fh
    A.solid("itow_roof", A.outline(A.rect_poly(x - 0.9, y - 0.5, w + 0.5, d + 0.5, -0.05), 0.85), z, 0.4, "hosp_white", bevel=0.05)
    cyl("itow_drum", 2.5, 1.4, (x - 0.9, y - 0.5, z + 0.4), "hosp_white", verts=40)
    sphere("itow_dome", 2.5, (x - 0.9, y - 0.5, z + 1.8), "white", subdiv=3)
    box("itow_slit", (0.7, 0.16, 2.3), (x - 0.9, y - 2.98, z + 1.9), "darkgray", bevel=0.02)
    L.text_mesh("itow_name", "INNOVATION TOWER", (x - 0.9, y - 0.5 - d / 2 - 0.3, 1.6), 0.5, 0.05, "purple", resolution=3)
    box("itow_canopy", (4.0, 1.6, 0.18), (x - 0.9, y - 0.5 - d / 2 - 0.9, 3.2), "purple", bevel=0.03)
    for s in (-1, 1):
        cyl(f"itow_canopy_col{s + 1}", 0.07, 3.0, (x - 0.9 + s * 1.8, y - 0.5 - d / 2 - 1.5, 0.18), "silver", verts=10)


# ---------------------------------------------------------------- campus

def campus():
    L.set_group("static_site")
    rnd = random.Random(600)
    A.solid("plinth", A.outline(A.rect_poly(0, 0, 2 * BASE[0], 2 * BASE[1]), 2.0), -2.0, 2.0, "hosp_white", bevel=0.15)
    A.ring("base_band", A.outline(A.rect_poly(0, 0, 2 * BASE[0] + 0.08, 2 * BASE[1] + 0.08), 2.04), A.outline(A.rect_poly(0, 0, 2 * BASE[0] - 0.1, 2 * BASE[1] - 0.1), 1.95), -0.42, 0.3, "purple")
    box("road", (2 * BASE[0], 8, 0.02), (0, ROAD_Y, 0), "asphalt", bevel=0)
    for i in range(14):
        box(f"dash{i}", (2.4, 0.15, 0.005), (-39 + i * 6.2, ROAD_Y, 0.02), "paint_white", bevel=0)
    for i in range(9):
        box(f"zebra{i}", (0.55, 5.0, 0.005), (18.0 + i * 1.1, ROAD_Y, 0.021), "paint_white", bevel=0)
    # sidewalk with a bus bay cut into it, plaza, lawn
    t0, f0, f1, t1 = BAY
    A.solid("sidewalk", [(-BASE[0], KERB_Y), (t0, KERB_Y), (f0, BAY_Y), (f1, BAY_Y), (t1, KERB_Y), (BASE[0], KERB_Y), (BASE[0], -16.0), (-BASE[0], -16.0)], 0, 0.16, "paving", bevel=0.03)
    A.solid("bus_bay", [(t0, KERB_Y), (t1, KERB_Y), (f1, BAY_Y), (f0, BAY_Y)], 0, 0.02, "asphalt")
    box("bus_bay_paint", (f1 - f0 - 1.0, 0.12, 0.005), (0, BAY_Y - 0.1, 0.02), "flower_yellow", bevel=0)
    L.text_mesh("bus_bay_txt", "BUS", (-8.0, -19.3, 0.021), 1.2, 0.004, "flower_yellow", rot=(0, 0, 0))
    cyl("busstop_pole", 0.04, 2.7, (6.6, -16.35, 0.16), "silver", verts=10)
    box("busstop_plate", (0.6, 0.03, 0.45), (6.6, -16.39, 2.4), "accent_blue", bevel=0.01)
    L.text_mesh("busstop_txt", "BUS STOP", (6.6, -16.41, 2.56), 0.12, 0.01, "white", resolution=3)
    box("plaza", (2 * BASE[0], 8.0, 0.16), (0, -12.0, 0), "terrazzo", bevel=0.03)
    for i in range(22):
        box(f"plaza_stripe{i}", (0.25, 7.8, 0.004), (-40 + i * 3.8, -12.0, 0.16), ("sky_blue", "flower_yellow", "flower_pink", "lime")[i % 4], bevel=0)
    box("lawn", (2 * BASE[0] - 0.6, 39.4, 0.16), (0, 12.1, 0), "lawn", bevel=0.03)
    # plaza: sign, flagpoles, benches, bikes, flowers, trees
    box("sign_base", (10.4, 0.8, 0.2), (-6.0, -12.6, 0.16), "hosp_white", bevel=0.04)
    L.text_mesh("sign_txt", "SMART LEARNING", (-6.0, -12.6, 0.36), 1.1, 0.35, "purple", rot=(math.pi / 2, 0, 0))
    for i, (x, col) in enumerate(((-16.0, "cross_red"), (-14.8, "accent_blue"), (-13.6, "flower_yellow"))):
        cyl(f"flagpole{i}", 0.05, 7.0, (x, -11.0, 0.16), "silver", verts=10)
        box(f"flag{i}", (1.2, 0.02, 0.8), (x + 0.62, -11.0, 6.3), col, bevel=0)
    for i, x in enumerate((-30.0, 4.0, 22.0)):
        L.bench(f"bench{i}", (x, -10.0, 0.16))
        L.human(f"bench_p{i}", (x - 0.4, -10.0, 0.16), rot_z=BACK, seed=610 + i, pose="sit", h=1.55, outfit="student")
    box("bike_rack", (4.6, 0.06, 0.06), (8.0, -11.8, 0.7), "silver", bevel=0)
    for k in range(6):
        M.bicycle(f"bike{k}", (6.0 + k * 0.8, -12.5, 0.16), rot_z=math.pi / 2, colour=("flower_pink", "lime", "sky_blue", "orange", "flower_purple", "flower_yellow")[k])
    for i, (x0, y0) in enumerate(((-38.0, -13.9), (-26.0, -13.9), (14.0, -13.9), (28.0, -13.9))):
        M.flower_bed(f"bed_out{i}", x0, y0, x0 + 5.0, y0 + 1.4, 0.16, seed=620 + i)
    for k, x in enumerate(range(-38, 42, 8)):
        if not -20 < x < 16:  # clear of the bus bay
            A.tree(f"stree{k}", (x, -17.5, 0.16), h=6.0 + rnd.random(), spread=0.9, seed=630 + k)
        if not BAY[0] - 1 < x + 4 < BAY[3] + 1:
            L.street_light(f"lamp{k}", (x + 4, -20.6, 0.16), rot_z=-math.pi / 2, h=6.0)
    for k, x in enumerate((-16.0, -6.0, 12.0)):  # along the bay the lamps stand at the back of the sidewalk
        L.street_light(f"bay_lamp{k}", (x, -16.45, 0.16), rot_z=-math.pi / 2, h=6.0)
    for k, (x, y) in enumerate(((-38, 18), (38, 16), (39.5, 20.5), (-39, 8), (-37.5, 26.5))):
        A.tree(f"gtree{k}", (x, y, 0.16), h=6.5 + rnd.random() * 2, spread=1.0, seed=650 + k)
    # basketball court with bleachers and a game on
    E.basketball_court("court", 21.0, -4.0, 37.0, 10.0)
    E.bleachers("bleach", 22.0, 36.0, -5.2, rows=4, face_y=1)
    for k in range(8):
        row = k % 4
        E.seated_student(f"fan{k}", (23.0 + k * 1.6, -5.2 - row * 0.7 + 0.1, 0.16 + 0.4 * (row + 1) + 0.05 - 0.47), math.pi / 2, 700 + k)
    for k, (x, y, h) in enumerate(((25.0, 1.0, 0.3), (27.5, 4.0, 2.8), (29.0, 2.0, -2.6), (31.5, 5.5, 3.3), (33.0, 1.5, 0.2), (30.2, 7.6, -1.4))):
        L.human(f"player{k}", (x, y, 0.19), rot_z=h, seed=720 + k, pose="walk", h=1.7, outfit=("student", "student2")[k % 2])
    # playground and school garden on the left
    box("play_mat", (10.0, 10.0, 0.02), (-34.0, 9.0, 0.16), "rug_teal", bevel=0)
    for k in range(3):
        box(f"slide_step{k}", (0.8, 0.5, 0.5 * (k + 1)), (-37.5, 5.4 + k * 0.5, 0.18), "flower_yellow", bevel=0.03)
    box("slide_top", (1.4, 1.4, 0.12), (-37.5, 7.2, 1.7), "cross_red", bevel=0.04)
    box("slide_chute", (0.7, 3.2, 0.08), (-37.5, 9.2, 0.9), "accent_blue", bevel=0.02, rot=(0.5, 0, 0))
    for x in (-33.0, -29.4):
        box(f"swing_a{x}", (0.1, 0.1, 2.6), (x, 6.0, 0.18), "orange", bevel=0, rot=(0, 0, 0))
        box(f"swing_b{x}", (0.1, 0.1, 2.6), (x, 7.6, 0.18), "orange", bevel=0)
    box("swing_top", (3.8, 0.12, 0.12), (-31.2, 6.8, 2.7), "orange", bevel=0)
    for k, x in enumerate((-32.2, -30.2)):
        box(f"swing_seat{k}", (0.5, 0.2, 0.05), (x, 6.8, 0.65), "flower_purple", bevel=0.01)
        for side in (-0.22, 0.22):
            cyl(f"swing_rope{k}{side}", 0.01, 2.0, (x + side, 6.8, 0.7), "black", verts=6)
    for k, (x, y, h) in enumerate(((-31.9, 6.8, 0.5), (-36.2, 11.0, -1.0), (-34.0, 12.4, 2.2))):
        L.human(f"kid{k}", (x, y, 0.18), rot_z=h, seed=740 + k, pose="sit" if k == 0 else "stand", h=1.2, outfit=None)
    box("ent_path", (11.0, 2.4, 0.02), (-25.5, -4.0, 0.16), "terrazzo", bevel=0)
    for i in range(4):
        box(f"vegbed{i}", (5.0, 1.1, 0.45), (-35.5, -6.2 + i * 1.8, 0.16), "wood_desk", bevel=0.03)
        box(f"vegsoil{i}", (4.8, 0.9, 0.02), (-35.5, -6.2 + i * 1.8, 0.6), "vegbed", bevel=0)
        for k in range(8):
            sphere(f"veg{i}_{k}", 0.2, (-37.6 + k * 0.6, -6.2 + i * 1.8, 0.72), ("lime", "leafv", "flower_red", "orange")[i], scale=(1, 1, 0.7), subdiv=1)


# ---------------------------------------------------------------- the rest of the school (behind the hall)
# In place of the anonymous city towers: a three-storey classroom block with open corridors (as Thai schools
# are built) and solar on its roof, a vaulted sports hall, the campus data centre with its network mast, a
# battery container, and a covered walkway from the hall's back door to the classrooms.
SCHOOL = (-34.0, -6.0, 22.5, 30.5)  # classroom block: x0, x1, y0, y1 (a 2 m open corridor along the front)
S_FH, S_N = 3.6, 3
S_TOP = 0.18 + S_N * S_FH
GYM = (0.0, 18.0, 22.0, 31.0)
DC = (22.5, 30.0, 23.0, 28.5)
MAST = (37.4, 24.2)
CLASS_COLOURS = ("orange", "lime", "sky_blue", "flower_pink", "flower_yellow", "purple", "mint")


def classroom_block():
    L.set_group("static_tower")
    x0, x1, y0, y1 = SCHOOL
    cx, w = (x0 + x1) / 2, x1 - x0
    front = y0 + 2.0  # classroom fronts, behind the corridor
    box("sch_rooms", (w, y1 - front, S_TOP - 0.18), (cx, (front + y1) / 2, 0.18), "hosp_white", bevel=0.03)
    rooms = 7
    rw = w / rooms
    for k in range(S_N):
        z = 0.18 + k * S_FH
        if k > 0:  # corridor slab, coloured edge band, low wall and handrail
            box(f"sch_corr{k}", (w, 2.0, 0.25), (cx, y0 + 1.0, z - 0.25), "hosp_white", bevel=0.02)
            box(f"sch_band{k}", (w + 0.1, 0.1, 0.32), (cx, y0 - 0.02, z - 0.3), "purple", bevel=0)
            box(f"sch_wall{k}", (w, 0.12, 0.55), (cx, y0 + 0.08, z), "hosp_white", bevel=0.01)
            box(f"sch_rail{k}", (w, 0.06, 0.06), (cx, y0 + 0.08, z + 1.0), "steel", bevel=0)
            for p in range(int(w / 2) + 1):
                box(f"sch_post{k}_{p}", (0.05, 0.05, 0.45), (x0 + p * w / int(w / 2), y0 + 0.08, z + 0.55), "steel", bevel=0)
        for r in range(rooms):
            rx = x0 + (r + 0.5) * rw
            box(f"sch_door{k}{r}", (0.95, 0.06, 2.1), (rx - rw * 0.3, front - 0.03, z + 0.02), CLASS_COLOURS[(r + k) % 7], bevel=0.01)
            box(f"sch_win{k}{r}", (rw * 0.48, 0.06, 1.3), (rx + rw * 0.14, front - 0.03, z + 1.0), "tower_glass", bevel=0)
            box(f"sch_sill{k}{r}", (rw * 0.5, 0.12, 0.06), (rx + rw * 0.14, front - 0.06, z + 0.96), "hosp_white", bevel=0)
        box(f"sch_win_e{k}", (0.06, y1 - front - 1.2, 1.4), (x1 + 0.03, (front + y1) / 2, z + 1.0), "tower_glass", bevel=0)
    for r in range(rooms + 1):  # columns carrying the corridors and the roof
        box(f"sch_col{r}", (0.32, 0.32, S_TOP - 0.18), (x0 + r * rw, y0 + 0.16, 0.18), "hosp_white", bevel=0.02)
    box("sch_roof", (w + 0.6, y1 - y0 + 0.6, 0.3), (cx, (y0 + y1) / 2, S_TOP), "hosp_white", bevel=0.03)
    box("sch_roof_band", (w + 0.64, y1 - y0 + 0.64, 0.12), (cx, (y0 + y1) / 2, S_TOP + 0.06), "purple", bevel=0)
    # sign board on the front edge of the roof, and the solar array behind it
    box("sch_signboard", (13.0, 0.25, 1.9), (cx - 5.0, y0 + 0.4, S_TOP + 0.3), "hosp_white", bevel=0.05)
    L.text_mesh("sch_sign", "SMART SCHOOL", (cx - 5.0, y0 + 0.22, S_TOP + 0.75), 1.25, 0.1, "purple")
    base = S_TOP + 0.3
    for rr in range(3):
        y = y0 + 2.4 + rr * 1.95
        box(f"sch_pvrail{rr}", (w - 2.2, 0.08, 0.5), (cx, y + 0.5, base), "aluminium", bevel=0.01)
        for cc in range(17):
            x = x0 + 1.5 + cc * 1.55
            box(f"sch_pv{rr}_{cc}", (1.45, 1.5, 0.05), (x, y, base + 0.55), "solar", bevel=0.015, rot=(0.42, 0, 0))
            box(f"sch_pvf{rr}_{cc}", (1.49, 1.54, 0.03), (x, y, base + 0.54), "aluminium", bevel=0.01, rot=(0.42, 0, 0))
    # glazed stair tower at the east end
    sx0 = x1
    box("sch_stair", (3.0, 5.2, S_TOP + 1.6 - 0.18), (sx0 + 1.5, y0 + 2.6, 0.18), "tower_glass", bevel=0.02)
    for k in range(S_N + 1):
        box(f"sch_stair_band{k}", (3.06, 5.26, 0.18), (sx0 + 1.5, y0 + 2.6, 0.18 + k * S_FH), "hosp_white", bevel=0)
    box("sch_stair_cap", (3.2, 5.4, 0.3), (sx0 + 1.5, y0 + 2.6, S_TOP + 1.42), "purple", bevel=0.02)
    # students walking the corridors
    for k, z in ((0, 0.18 + S_FH), (1, 0.18 + 2 * S_FH)):
        path = racetrack(x0 + 1.0, y0 + 0.6, x1 - 1.0, y0 + 1.5, 0.44)
        for j in range(2):
            L.walker(f"cor{k}{j}", path, 1.0, j * L.path_length(path, True) / 2 + k * 7.0, seed=900 + k * 2 + j, z=z, outfit=("student", "student2")[j], h=1.5)


def sports_hall():
    L.set_group("static_tower")
    x0, x1, y0, y1 = GYM
    cx, cy, w, d = (x0 + x1) / 2, (y0 + y1) / 2, x1 - x0, y1 - y0
    wall = 7.0
    box("gym_body", (w, d, wall), (cx, cy, 0.18), "hosp_white", bevel=0.04)
    box("gym_band", (w + 0.06, d + 0.06, 0.45), (cx, cy, 0.18 + wall - 0.45), "orange", bevel=0)
    # the vault's lower half stays inside the walls, so only the arch shows (its end caps are the gables)
    cyl("gym_roof", d / 2, w - 0.04, (x0 + 0.02, cy, 0.18 + wall), "court_blue", verts=40, rot=(0, math.pi / 2, 0))
    for k in range(1, 4):
        cyl(f"gym_rib{k}", d / 2 + 0.06, 0.18, (x0 - 0.09 + k * w / 4, cy, 0.18 + wall), "hosp_white", verts=40, rot=(0, math.pi / 2, 0))
    box("gym_clerestory", (w - 2.0, 0.06, 1.1), (cx, y0 - 0.03, 4.3), "tower_glass", bevel=0)
    box("gym_clerestory_e", (0.06, d - 2.0, 1.1), (x1 + 0.03, cy, 4.3), "tower_glass", bevel=0)
    box("gym_entry", (6.0, 0.06, 3.0), (cx - 3.0, y0 - 0.03, 0.18), "glass", bevel=0)
    for i in range(4):
        box(f"gym_entry_mull{i}", (0.1, 0.1, 3.0), (cx - 6.0 + i * 2.0, y0 - 0.05, 0.18), "hosp_white", bevel=0)
    box("gym_canopy", (7.0, 2.0, 0.22), (cx - 3.0, y0 - 1.0, 3.3), "orange", bevel=0.03)
    L.text_mesh("gym_sign", "SPORTS HALL", (cx + 4.2, y0 - 0.08, 3.8), 0.75, 0.06, "purple")


def data_centre():
    L.set_group("static_tower")
    x0, x1, y0, y1 = DC
    cx, cy, w, d = (x0 + x1) / 2, (y0 + y1) / 2, x1 - x0, y1 - y0
    box("dc_body", (w, d, 3.6), (cx, cy, 0.18), "robot_white", bevel=0.04)
    box("dc_band", (w + 0.04, d + 0.04, 0.3), (cx, cy, 3.5), "accent_blue", bevel=0)
    box("dc_door", (1.1, 0.05, 2.2), (x0 + 1.2, y0 - 0.02, 0.18), "accent_blue", bevel=0)
    box("dc_led", (w - 3.0, 0.03, 0.06), (cx + 0.8, y0 - 0.02, 2.9), "led_cyan", bevel=0)
    L.text_mesh("dc_txt", "DATA CENTER", (cx + 0.9, y0 - 0.04, 1.9), 0.48, 0.04, "accent_blue")
    for k in range(3):  # condensers on the roof
        x = x0 + 1.4 + k * 2.3
        box(f"dc_cond{k}", (1.8, 1.2, 0.9), (x, cy, 3.8), "aluminium", bevel=0.04)
        cyl(f"dc_cond{k}_fan", 0.42, 0.05, (x, cy, 4.7), "frame_dark", verts=20)
    # the campus network mast: fibre in from the street, 5G / Wi-Fi backhaul out
    mx, my = MAST
    box("mast_base", (1.8, 1.8, 0.4), (mx, my, 0.18), "concrete", bevel=0.04)
    cyl("mast", 0.34, 17.0, (mx, my, 0.58), "steel", verts=12, r2=0.16)
    cyl("mast_deck", 1.0, 0.12, (mx, my, 13.6), "frame", verts=16)
    for k in range(3):
        a = k * math.tau / 3
        box(f"mast_ant{k}", (0.26, 0.5, 1.7), (mx + math.cos(a) * 0.55, my + math.sin(a) * 0.55, 14.2), "white", bevel=0.04, rot=(0, 0, a))
    sphere("mast_dish", 0.6, (mx - 0.4, my - 0.4, 11.5), "white", scale=(1, 0.35, 1), rot=(0.3, 0, 0.8))
    sphere("mast_beacon", 0.12, (mx, my, 17.65), "led_red")
    box("mast_cabinet", (1.2, 0.7, 1.6), (mx - 1.8, my, 0.18), "panel_grey", bevel=0.03)
    # battery container with its inverter
    box("bess", (5.0, 2.4, 2.6), (32.6, 29.3, 0.18), "robot_white", bevel=0.04)
    box("bess_stripe", (5.02, 2.42, 0.3), (32.6, 29.3, 1.9), "purple", bevel=0)
    L.text_mesh("bess_txt", "BESS", (31.4, 28.06, 1.1), 0.45, 0.03, "purple")
    box("bess_led", (0.6, 0.02, 0.08), (33.9, 28.08, 1.5), "led_green", bevel=0)
    box("inverter", (1.0, 0.6, 1.4), (36.2, 29.3, 0.18), "robot_white", bevel=0.03)


def walkway():
    """Covered walkway from the hall's back door to the classroom block."""
    L.set_group("static_site")
    x, y0, y1 = -16.0, PODIUM[3], SCHOOL[2]  # from the Learning Commons' back door, under the pavilion
    box("campus_paving", (72.0, 9.4, 0.02), (1.0, 26.3, 0.16), "paving", bevel=0)
    box("walk_path", (2.4, 21.6 - y0, 0.02), (x, (y0 + 21.6) / 2, 0.16), "terrazzo", bevel=0)  # meets the campus paving
    box("walk_roof", (2.8, y1 - y0 + 0.4, 0.14), (x, (y0 + y1) / 2, 3.0), "purple", bevel=0.02)
    for dy in (0.6, (y1 - y0) / 2, y1 - y0 - 0.6):
        for dx in (-1.2, 1.2):
            cyl(f"walk_col{dx}{dy:.1f}", 0.07, 2.84, (x + dx, y0 + dy, 0.16), "silver", verts=10)
    box("back_door", (1.8, 0.05, 2.4), (x, y0 + 0.02, FLOOR), "purple", bevel=0.01)
    box("back_door_frame", (2.0, 0.04, 2.55), (x, y0 + 0.01, FLOOR), "robot_white", bevel=0)


# ---------------------------------------------------------------- life

def life():
    loop = racetrack(-13.0, 3.6, 13.0, 7.0, 1.0)  # around the planted island
    loops = [
        (A.offset_poly(loop, 0.4), 3, 1.1, ("student", "teacher", "student2"), FLOOR + Z, 1.5),
        (list(reversed(A.offset_poly(loop, -0.4))), 3, 1.0, ("student2", "student", None), FLOOR + Z, 1.55),
        (racetrack(2.5, -7.1, 14.2, 1.5, 0.8), 1, 0.8, ("teacher",), FLOOR + Z, 1.72),  # proctor round the exam pods
        (racetrack(HX0 - 3.6, -4.6, -9.5, -3.4, 0.59), 2, 1.15, ("student", None), FLOOR + Z, 1.55),  # landing <-> hall doors
        (racetrack(-5.5, -3.8, 3.0, -2.6, 0.5), 2, 1.0, ("student2", "teacher"), 0.3, 1.6),  # through the Learning Commons
        (racetrack(-38.0, -15.4, 38.0, -14.8, 0.29), 4, 1.25, ("student", None, "student2", "teacher"), 0.16, 1.6),  # plaza
        (racetrack(-38.0, -29.8, 38.0, -29.2, 0.29), 3, 1.25, (None, None, None), 0.16, 1.7),  # far sidewalk
    ]
    n = 0
    for path, count, speed, outfits, z, h in loops:
        length = L.path_length(path, True)
        for j in range(count):
            L.walker(f"walker{n}", path, speed, (j + 0.3) * length / count, seed=800 + n, z=z, outfit=outfits[j], h=h)
            n += 1
    with group("move"):  # the basketball bouncing on the court
        ball = sphere("ball", 0.12, (28.4, 3.0, 0.31), "court_orange", subdiv=2)
        ball["bob"], ball["bob_amp"], ball["bob_speed"], ball["bounce"] = 0.0, 0.9, 5.0, 1
    riders(*traffic())


def s_curve(x0, x1, y0, y1, step=1.0):
    """Lane change with flat ends (quintic smootherstep), a point every ~step m."""
    n = max(2, round(abs(x1 - x0) / step))
    return [(x0 + (x1 - x0) * k / n, y0 + (y1 - y0) * (k / n) ** 3 * ((k / n) * (6 * (k / n) - 15) + 10)) for k in range(n + 1)]


def timeline(path, speed, stops, ease):
    """Mirror of timeline() in src/three/model/baked.jsx: a mover brakes to each stop (d, wait) over `ease` m,
    waits and pulls away again. Returns the parts (t0, dur, d0, D, e0, e1; D = 0 for a wait) and the cycle time."""
    total = L.path_length(path, False)
    at = {(total if total - d < 1e-3 else d): w for d, w in stops}
    marks = sorted({0.0, total, *at})
    parts, t = [], 0.0
    for i, d0 in enumerate(marks):
        if d0 in at:
            parts.append((t, at[d0], d0, 0.0, 0.0, 0.0))
            t += at[d0]
        if i + 1 < len(marks):
            D = marks[i + 1] - d0
            e0 = min(ease, D / 2) if d0 in at else 0.0
            e1 = min(ease, D / 2) if marks[i + 1] in at else 0.0
            parts.append((t, (D + e0 + e1) / speed, d0, D, e0, e1))
            t += (D + e0 + e1) / speed
    return parts, t


def distance_at(parts, cycle, speed, time):
    tt = time % cycle
    for t0, dur, d0, D, e0, e1 in parts:
        if tt < t0 + dur:
            break
    if not D:
        return d0
    lt = tt - t0
    if lt < 2 * e0 / speed:
        return d0 + speed * speed * lt * lt / (4 * e0)
    if lt > dur - 2 * e1 / speed:
        return d0 + D - speed * speed * (dur - lt) ** 2 / (4 * e1)
    return d0 + e0 + speed * (lt - 2 * e0 / speed)


def axle_pose(path, d, front=2.6, rear=2.7):
    """Both axles on the path (as baked.jsx places a mover with `axles`): centre and heading."""
    total = L.path_length(path, False)
    (fx, fy), _ = L.path_point(path, False, min(d + front, total - 1e-6))
    (rx, ry), _ = L.path_point(path, False, max(d - rear, 0.0))
    h = math.atan2(fy - ry, fx - rx)
    return rx + math.cos(h) * rear, ry + math.sin(h) * rear, h


def outline(x, y, h, hl, hw, n=4):
    c, s = math.cos(h), math.sin(h)
    pts = [(-hl + 2 * hl * i / n, -hw) for i in range(n + 1)] + [(-hl + 2 * hl * i / n, hw) for i in range(n + 1)]
    return [(x + c * px - s * py, y + s * px + c * py) for px, py in pts]


def bus_gap(lane, bus_path, parts, period, speed):
    """Phase (m) for a through-car on `lane` (as long as the bus's round) that keeps it furthest from the bus."""
    def clearance(phase):
        worst = 99.0
        for k in range(int(period / 0.1)):
            t = k * 0.1
            bx, by, bh = axle_pose(bus_path, distance_at(parts, period, speed, t))
            (cx, cy), _ = L.path_point(lane, False, phase + speed * t)
            if abs(bx) > BASE[0] + 6 or abs(cx) > BASE[0] + 4 or abs(bx - cx) > 9 or abs(by - cy) > 4:
                continue
            for px, py in outline(bx, by, bh, 4.62, 1.22):
                worst = min(worst, max(abs(px - cx) - 2.2, abs(py - cy) - 0.88))
        return worst

    phase = max(range(0, int(L.path_length(lane, False))), key=clearance)
    return phase, clearance(phase)


def traffic():
    """The school bus pulls into the bay on S-curves, stops to let students off and on, and pulls out again. Through
    cars run open lanes as long as the bus's round, so they share its period and keep the gap they start in."""
    lane_e, lane_w = ROAD_Y + 1.8, ROAD_Y - 1.8
    ex = BASE[0] + 7
    pts = [(-ex, lane_e)] + s_curve(-26.7, -2.7, lane_e, BUS_Y) + s_curve(2.6, 24.6, BUS_Y, lane_e) + [(ex, lane_e)]
    path = [(round(x, 3), round(y, 3)) for x, y in pts]
    stop = round(L.path_length(path[: path.index((-2.7, BUS_Y)) + 1], False) + 2.7, 3)  # bus centre at x = 0
    parts, period = timeline(path, BUS_V, [(stop, BUS_WAIT)], BUS_EASE)
    t_arr = next(p[0] for p in parts if p[2] == stop and not p[3])
    with group("move"):  # unique prefix: _parts() gathers by name, and "bus_" would also catch the bus bay
        E.school_bus("schoolbus", (0, 0, 0), 0.0)
    bits = L._parts("schoolbus")
    leaves = []
    for k, (hinge, fold) in enumerate(((3.32, -1), (4.18, 1))):  # door leaves fold into the stairwell
        leaf = [o for o in bits if o.name.startswith(f"schoolbus_door{k}_")]
        bits = [o for o in bits if o not in leaf]
        leaf = L.rigid(leaf, f"schoolbus_door{k}", (hinge, 1.2, 0.0))
        leaf["fold"] = fold
        leaves.append(leaf)
    bus = L.rigid(bits, "schoolbus")
    for leaf in leaves:
        leaf.parent = bus
    bus["blob"] = [9.6, 2.9]
    L._on_path(bus, "drive", BUS_V, path, False, 0.0, 0.02)
    L.place(bus, (0.0, BUS_Y, 0.02), 0.0, stops=[stop, BUS_WAIT], ease=BUS_EASE, axles=[2.6, 2.7], t_at=0.0)  # vertex light baked in the bay
    span = round(BUS_V * period, 3)
    east = [(-ex, lane_e), (-ex + span, lane_e)]
    phase, gap = bus_gap(east, path, parts, period, BUS_V)
    print(f"bus: round {period:.2f} s, at the stop {t_arr:.2f} s; car_east phase {phase} m, clearance {gap:.2f} m")
    L.driver("car_east", east, BUS_V, phase, closed=False, paint="sky_blue")
    west = [(ex, lane_w), (ex - span, lane_w)]
    for i, (paint, kind) in enumerate((("robot_white", "van"), ("flower_purple", "car"))):
        L.driver(f"car_west{i}", west, BUS_V, i * span / 2, closed=False, paint=paint, kind=kind)
    return t_arr, period


def riders(t_arr, period):
    """Students riding the bus. Each gets off, walks into the Learning Commons (the robot host, then the cafe),
    comes back out to the stop and gets on again four buses later; at every stop two get off and two get on. While riding they are
    hidden (the bus has its own seated students) - they appear and vanish inside the stairwell behind the closed door."""
    spots = ((3.75, BUS_Y + 0.9, 0.56), (3.75, BUS_Y + 0.45, 0.76))  # in the stairwell: lower step, upper step
    door = (3.75, BUS_Y + 1.27, 0.5)
    speed, ease, rounds = 1.15, 0.4, 4  # the walk takes a little over three bus rounds
    for j, o in enumerate((-0.2, 0.2)):
        wx = (5.3, 4.7)[j]  # j = 1 waits nearer the door: it boards first, to the upper step
        route = [spots[j], door, (3.75, -17.3, 0.16), (3.1 + o, -16.2, 0.16), (1.6 + o, -14.0, 0.16), (1.0 + o, -9.0, 0.16),
                 (0.4 + o * 0.6, -6.6, 0.18), (0.2 + o * 0.6, -5.0, 0.3), (0.1 + o, -3.2, 0.3), (o * 1.2, 0.45, 0.3),  # robot host
                 (-2.6 + o, 1.0, 0.3), (-2.6 + o, 5.0, 0.3), (1.0, 8.6 + o, 0.3), (6.8 + o, 9.9, 0.3), (6.8 + o, 10.85, 0.3),  # cafe
                 (6.3 + o, 9.4, 0.3), (2.75 + o * 0.5, 7.0, 0.3), (2.75 + o * 0.5, 0.2, 0.3), (1.2 + o * 0.6, -1.6, 0.3),
                 (0.55 + o * 0.6, -5.0, 0.3), (0.9 + o * 0.6, -6.6, 0.18), (2.0 + o, -9.0, 0.16), (3.0 + o, -14.0, 0.16),
                 (wx, -16.0, 0.16), (wx, -16.9, 0.16), (3.75, -17.45, 0.16), door, spots[j]]  # waits at the kerb, gets on
        path = [(round(x, 3), round(y, 3)) for x, y, _ in route]
        cum = [0.0]
        for a, b in zip(path, path[1:]):
            cum.append(cum[-1] + math.hypot(b[0] - a[0], b[1] - a[1]))
        d_host, d_cafe, d_kerb, total = (round(cum[i], 3) for i in (9, 14, 24, len(path) - 1))
        # end wait: from getting on (door closes at BUS_WAIT - 0.6) to getting off one round later
        w_end = period - BUS_WAIT + 2.5 + 2.4 * j
        _, walk = timeline(path, speed, [(d_host, 3.0), (d_cafe, 0.0001), (d_kerb, 9.0), (total, w_end)], ease)
        w_cafe = rounds * period - walk  # the cafe wait takes up the rest of the rounds
        print(f"rider {j}: walking {walk - 12.0 - w_end:.1f} s, at the cafe {w_cafe:.1f} s")
        assert w_cafe > 2.0, "route too long for the bus rounds"
        stops = [d_host, 3.0, d_cafe, round(w_cafe, 3), d_kerb, 9.0, total, round(w_end, 3)]
        cycle = rounds * period
        hide = [cycle - w_end + 0.5 + 1.2 * j, cycle - (1.2 + 1.2 * j)]  # behind the closed door
        for k in range(rounds):  # one pair gets off at every stop, each pair every `rounds` stops
            name = f"rider{j}{k}"
            ob = L.walker(name, path, speed, 0.0, closed=False, seed=990 + rounds * j + k, z=0.16, outfit=("student", "student2")[(j + k) % 2], h=1.55 + 0.04 * k)
            t_at = -(t_arr + 1.5 + 1.2 * j + k * period) % cycle
            L.place(ob, (18.0 + 1.0 * (rounds * j + k), -14.4, 0.16), 0.0, stops=stops, ease=ease, t_at=round(t_at, 3),
                    hide=[round(h, 3) for h in hide], path_z=[z for _, _, z in route])  # placed in the open for the light bake


# ---------------------------------------------------------------- light, output

def lighting(sun_elev=30, sun_dir=(0.72, 0.62)):
    scene = bpy.context.scene
    world = bpy.data.worlds.new("Sky")
    scene.world = world
    nt = world.node_tree
    bg = nt.nodes["Background"]
    sky = nt.nodes.new("ShaderNodeTexSky")
    sky.sky_type = "MULTIPLE_SCATTERING"
    sky.sun_elevation = math.radians(sun_elev)
    sky.sun_rotation = math.radians(40)
    try:
        sky.sun_disc = False
    except AttributeError:
        pass
    nt.links.new(sky.outputs["Color"], bg.inputs["Color"])
    bg.inputs["Strength"].default_value = 0.3
    sun_data = bpy.data.lights.new("Sun", "SUN")
    sun_data.energy = 5.0
    sun_data.angle = math.radians(1.5)
    sun_data.color = (1.0, 0.82, 0.6)  # golden hour, as in the artwork
    sun = bpy.data.objects.new("Sun", sun_data)
    L.COL.objects.link(sun)
    el = math.radians(sun_elev)
    h = Vector((sun_dir[0], sun_dir[1], 0)).normalized()
    to_sun = Vector((h.x * math.cos(el), h.y * math.cos(el), math.sin(el)))
    sun.rotation_euler = (-to_sun).to_track_quat("-Z", "Y").to_euler()
    for i, (x0, y0, x1, y1) in enumerate(((HX0, HY0, -2.0, HY1), (-2.0, HY0, HX1, HY1))):
        a = bpy.data.lights.new(f"Hall{i}", "AREA")
        a.shape = "RECTANGLE"
        a.size, a.size_y = (x1 - x0) * 0.8, (y1 - y0) * 0.8
        a.energy = 2.2 * (x1 - x0) * (y1 - y0)
        a.color = (1.0, 0.9, 0.78)
        ob = bpy.data.objects.new(f"Hall{i}", a)
        L.COL.objects.link(ob)
        ob.location = ((x0 + x1) / 2, (y0 + y1) / 2, Z + CEIL - 0.2)
    x0, x1, y0, y1 = PODIUM
    a = bpy.data.lights.new("Commons", "AREA")
    a.shape = "RECTANGLE"
    a.size, a.size_y = (x1 - x0) * 0.85, (y1 - y0) * 0.85
    a.energy = 3.0 * (x1 - x0) * (y1 - y0)
    a.color = (1.0, 0.93, 0.85)
    ob = bpy.data.objects.new("Commons", a)
    L.COL.objects.link(ob)
    ob.location = ((x0 + x1) / 2, (y0 + y1) / 2, Z - 1.1)


ATLASES = {
    "building": ["static_building", "hot:ai-learning", "hot:cloud-lms", "hot:assessment", "hot:iot-classrooms"],
    "site": ["static_site"],
    "tower": ["static_tower"],
}


def build():
    L.reset_scene()
    campus()
    classroom_block()
    sports_hall()
    data_centre()
    walkway()
    before = set(bpy.data.objects)
    shell()
    ai_wall()
    library()
    lms_zone()
    computer_row()
    assessment_zone()
    spine()
    iot_ceiling()
    entrance()
    raise_hall(before)
    hall_envelope()
    podium_commons()
    sky_access()
    innovation_tower()
    life()
    lighting()
    for name, groups in ATLASES.items():
        bpy.context.scene[f"atlas_{name}"] = ",".join(groups)
    bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(BLEND))
    print("objects:", len(bpy.context.scene.objects), "tris:", sum(len(o.data.polygons) for o in bpy.context.scene.objects if o.type == "MESH"))


if __name__ == "__main__":
    build()
