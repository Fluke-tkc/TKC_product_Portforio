"""Smart Hospital - modelled after the Smart Hospital AI artwork.

A cut-away two-storey hospital hall (front wall and roof removed) in a vivid palette: sky-blue tiled
atrium with a holographic management hub, curved reception, telemedicine workstations and a waiting
lounge; an L-shaped upper floor with the data analytics centre, CT diagnostics, a patient ward and a
lab; automatic entrances, an ER ambulance bay, a delivery drone and a street with traffic.

blender -b --factory-startup --python public/Blender/scripts/smart_hospital.py
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
import tkc_lib as L  # noqa: E402
import tkc_med as M  # noqa: E402
from tkc_lib import box, cyl, empty, group, sphere  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
BLEND = os.path.join(HERE, "..", "smart_hospital.blend")
A.FOLIAGE_MATS = ("leafv", "leafv_dark", "leafv_light")

# ---------------------------------------------------------------- layout
HX0, HX1, HY0, HY1 = -28.0, 18.0, -10.0, 20.0  # hall interior
FLOOR = 0.3  # finished ground floor
MEZ_Z, MEZ_T = 5.5, 0.4  # underside and thickness of the upper floor slab
UP = MEZ_Z + MEZ_T  # finished upper floor
TOP = 11.6  # wall tops
MEZ = [(HX0, HY0), (-19.0, HY0), (-19.0, 12.0), (HX1, 12.0), (HX1, HY1), (HX0, HY1)]  # L-shaped upper floor
HUB = (-3.0, 1.0)  # holographic management hub
DOOR_Y = (-3.0, 3.0)  # main entrance in the left wall
ER_Y = (-5.0, -1.4)  # emergency doors in the right glass wall
ESC_X = (14.2, 15.6)  # escalators (up / down) landing on the ward
BASE = (40.0, 31.0)  # half size of the plinth
ROAD_Y = -25.0
AMB_IN, AMB_OUT = HX1 + 7.0, HX1 + 11.5  # ambulance lanes up / down the ER drive


def rect(x0, y0, x1, y1):
    return [(x0, y0), (x1, y0), (x1, y1), (x0, y1)]


def racetrack(x0, y0, x1, y1, r):
    return A.fillet_poly(rect(x0, y0, x1, y1), r, 6)


# ---------------------------------------------------------------- shell

def shell():
    L.set_group("static_building")
    # floor slab with a thin sky-blue tile layer and white grout lines
    box("slab", (HX1 - HX0 + 1.0, HY1 - HY0 + 1.0, FLOOR - 0.02), ((HX0 + HX1) / 2, (HY0 + HY1) / 2 + 0.25, 0), "hosp_white", bevel=0.03)
    box("tiles", (HX1 - HX0, HY1 - HY0, 0.02), ((HX0 + HX1) / 2, (HY0 + HY1) / 2, FLOOR - 0.02), "tile_blue", bevel=0)
    x = HX0 + 1.5
    while x < HX1:
        box(f"grout_x{x:.1f}", (0.035, HY1 - HY0, 0.003), (x, (HY0 + HY1) / 2, FLOOR), "tile_line", bevel=0)
        x += 1.5
    y = HY0 + 1.5
    while y < HY1:
        box(f"grout_y{y:.1f}", (HX1 - HX0, 0.035, 0.003), ((HX0 + HX1) / 2, y, FLOOR), "tile_line", bevel=0)
        y += 1.5
    # back wall and left wall (with the entrance opening); blue caps show the cut
    box("wall_back", (HX1 - HX0 + 1.0, 0.5, TOP - FLOOR), ((HX0 + HX1) / 2, HY1 + 0.25, FLOOR), "hosp_white", bevel=0.02)
    lx = HX0 - 0.25
    box("wall_left_a", (0.5, DOOR_Y[0] - HY0 + 0.5, UP - FLOOR), (lx, (HY0 - 0.5 + DOOR_Y[0]) / 2, FLOOR), "hosp_white", bevel=0.02)
    box("wall_left_b", (0.5, HY1 + 0.5 - DOOR_Y[1], UP - FLOOR), (lx, (DOOR_Y[1] + HY1 + 0.5) / 2, FLOOR), "hosp_white", bevel=0.02)
    box("wall_left_lintel", (0.5, DOOR_Y[1] - DOOR_Y[0], UP - 3.9), (lx, sum(DOOR_Y) / 2, 3.9), "hosp_white", bevel=0.02)
    box("wall_left_up", (0.5, HY1 - HY0 + 1.0, TOP - UP), (lx, (HY0 + HY1) / 2, UP), "hosp_white", bevel=0.02)
    box("cap_back", (HX1 - HX0 + 1.04, 0.54, 0.08), ((HX0 + HX1) / 2, HY1 + 0.25, TOP), "accent_blue", bevel=0.01)
    box("cap_left", (0.54, HY1 - HY0 + 1.04, 0.08), (lx, (HY0 + HY1) / 2, TOP), "accent_blue", bevel=0.01)
    box("cap_left_front", (0.54, 0.05, TOP - FLOOR), (lx, HY0 - 0.52, FLOOR), "accent_blue", bevel=0)
    # skirting and a wood-slat feature wall behind reception
    box("skirt_back", (HX1 - HX0, 0.03, 0.12), ((HX0 + HX1) / 2, HY1 - 0.02, FLOOR), "accent_blue", bevel=0)
    for i in range(60):
        box(f"feature_slat{i}", (0.1, 0.1, 4.6), (-11.0 + i * 0.235, HY1 - 0.08, FLOOR + 0.3), "woodlight", bevel=0.01)
    # right side: glass curtain wall on the ground floor (ER doors cut in) and along the ward upstairs
    gx = HX1 + 0.05
    for name, y0, y1, z0, z1 in (("gl_a", HY0, ER_Y[0], FLOOR, MEZ_Z), ("gl_b", ER_Y[1], HY1, FLOOR, MEZ_Z), ("gl_er_top", ER_Y[0], ER_Y[1], 3.3, MEZ_Z), ("gl_up", 12.0, HY1, UP, TOP - 0.3)):
        box(name, (0.04, y1 - y0, z1 - z0), (gx, (y0 + y1) / 2, z0), "glass", bevel=0)
        n = max(1, int((y1 - y0) / 1.8))
        for k in range(n + 1):
            box(f"{name}_mull{k}", (0.1, 0.08, z1 - z0), (gx, y0 + (y1 - y0) * k / n, z0), "hosp_white", bevel=0)
        box(f"{name}_transom", (0.1, y1 - y0, 0.1), (gx, (y0 + y1) / 2, z1 - 0.1), "hosp_white", bevel=0)
    box("er_header", (0.3, ER_Y[1] - ER_Y[0] + 0.6, 0.35), (gx, sum(ER_Y) / 2, 3.0), "hosp_white", bevel=0.03)
    L.text_mesh("er_sign", "EMERGENCY", (gx + 0.18, sum(ER_Y) / 2, 3.42), 0.42, 0.06, "cross_red", rot=(math.pi / 2, 0, math.pi / 2))
    box("gl_up_roof", (0.35, HY1 - 12.0, 0.3), (gx, (12.0 + HY1) / 2, TOP - 0.3), "hosp_white", bevel=0.02)


def mezzanine():
    L.set_group("static_building")
    A.solid("mez_slab", MEZ, MEZ_Z, MEZ_T, "hosp_white")
    # inner edges: LED line on the fascia and a glass balustrade with a steel handrail
    edges = [((-19.0, HY0), (-19.0, 12.0)), ((-19.0, 12.0), (ESC_X[0] - 0.8, 12.0)), ((HX0, HY0), (-19.0, HY0)), ((ESC_X[1] + 0.8, 12.0), (HX1, 12.0))]
    for i, ((x0, y0), (x1, y1)) in enumerate(edges):
        cx, cy, ln = (x0 + x1) / 2, (y0 + y1) / 2, math.hypot(x1 - x0, y1 - y0)
        ang = math.atan2(y1 - y0, x1 - x0)
        box(f"mez_led{i}", (ln, 0.03, 0.06), (cx, cy, MEZ_Z + 0.16), "led_cyan", bevel=0, rot=(0, 0, ang))
        box(f"mez_glass{i}", (ln, 0.03, 1.05), (cx, cy, UP), "glass", bevel=0, rot=(0, 0, ang))
        box(f"mez_rail{i}", (ln, 0.07, 0.05), (cx, cy, UP + 1.05), "silver", bevel=0.01, rot=(0, 0, ang))
        for k in range(int(ln / 1.6) + 1):
            t = k / max(1, int(ln / 1.6))
            box(f"mez_post{i}_{k}", (0.05, 0.05, 1.05), (x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, UP), "silver", bevel=0)
    # fascia branding over reception
    L.text_mesh("brand_txt", "SMART HOSPITAL", (-3.4, 11.94, MEZ_Z + 0.02), 0.62, 0.06, "accent_blue")
    box("brand_cross_v", (0.22, 0.06, 0.62), (-8.9, 11.94, MEZ_Z + 0.02), "cross_red", bevel=0.01)
    box("brand_cross_h", (0.62, 0.06, 0.22), (-8.9, 11.94, MEZ_Z + 0.22), "cross_red", bevel=0.01)
    # columns carrying the slab edge
    for i, (x, y) in enumerate(((-19.0, 12.0), (-11.0, 12.0), (-3.0, 12.0), (5.0, 12.0), (11.0, 12.0), (HX1 - 0.4, 12.0), (-19.0, 4.0), (-19.0, -4.0), (-19.0, HY0 + 0.4))):
        cyl(f"column{i}", 0.34, MEZ_Z - FLOOR, (x, y, FLOOR), "hosp_white", verts=28)
        cyl(f"column{i}_ring", 0.36, 0.06, (x, y, FLOOR + 3.0), "accent_blue", verts=28)
    # ceiling lights under the slab
    A.downlights("mez_dl_back", rect(HX0 + 1, 12.8, HX1 - 1, HY1 - 0.8), MEZ_Z - 0.03, spacing=2.4, mat="led_white")
    A.downlights("mez_dl_left", rect(HX0 + 1, HY0 + 1, -19.8, 11.5), MEZ_Z - 0.03, spacing=2.4, mat="led_white")
    # escalators up to the ward, lift and glass partitions between the upstairs rooms
    for k, ex in enumerate(ESC_X):
        M.escalator(f"escalator{k}", ex, 1.0, 12.0, FLOOR, UP, width=1.1)
    for x, name in ((-12.0, "part_a"), (2.0, "part_b")):
        box(f"{name}_glass", (0.04, HY1 - 12.4, 2.8), (x, (12.4 + HY1) / 2, UP), "glass", bevel=0)
        for y in (12.4, 14.9, 17.4, HY1 - 0.1):
            box(f"{name}_post{y}", (0.08, 0.08, 2.8), (x, y, UP), "hosp_white", bevel=0)
        box(f"{name}_head", (0.1, HY1 - 12.4, 0.1), (x, (12.4 + HY1) / 2, UP + 2.8), "hosp_white", bevel=0)
    box("part_lab_glass", (9.0, 0.04, 2.8), (-23.5, 12.2, UP), "glass", bevel=0)
    for kx in range(2):
        box(f"lift_door{kx}", (1.3, 0.06, 2.4), (6.0 + kx * 2.4, HY1 - 0.05, FLOOR), "silver", bevel=0.01)
        box(f"lift_frame{kx}", (1.6, 0.08, 2.7), (6.0 + kx * 2.4, HY1 - 0.02, FLOOR), "accent_blue", bevel=0.01)
        box(f"lift_led{kx}", (0.3, 0.02, 0.1), (6.0 + kx * 2.4, HY1 - 0.1, FLOOR + 2.85), "led_cyan", bevel=0)


# ---------------------------------------------------------------- upstairs rooms

def data_room():
    """Data analytics & knowledge management: racks, analyst desks, the big insight wall and a holo chart."""
    with group("hot:data-analytics"):
        box("data_floor", (16.0, 7.6, 0.02), (-20.0, 16.0, UP), "navy", bevel=0)
        for i in range(5):
            M.server_rack(f"rack_a{i}", (HX0 + 0.6, 13.4 + i * 1.12, UP), rot_z=math.pi / 2, seed=i)
        for i in range(4):
            M.server_rack(f"rack_b{i}", (-25.0, 13.4 + i * 1.12, UP), rot_z=-math.pi / 2, seed=10 + i)
        for i, x in enumerate((-21.8, -17.6, -13.8)):
            M.workstation(f"analyst{i}", (x, 16.3, UP), rot_z=0.0, screens=("screen_hsp_chart", "screen_monitor", "screen_hsp_chart"), seed=40 + i, outfit="doctor2" if i == 1 else None)
        M.screen_at("scr_data", (11.0, 3.3), (-20.0, HY1 - 0.07, UP + 2.55), -math.pi / 2, "screen_hsp_data", bezel=0.1)
        box("holo_table", (1.6, 1.0, 0.9), (-16.0, 13.6, UP), "robot_white", bevel=0.05)
        box("holo_table_led", (1.5, 0.9, 0.03), (-16.0, 13.6, UP + 0.9), "led_cyan", bevel=0)
        L.human("data_presenter", (-17.2, 13.3, UP), rot_z=0.3, seed=51, outfit="doctor")
        box("meet_table", (2.4, 1.0, 0.05), (-15.5, 18.7, UP + 0.72), "robot_white", bevel=0.02)
        box("meet_leg", (0.2, 0.6, 0.72), (-15.5, 18.7, UP), "silver", bevel=0)
        for k, (dx, dy, a) in enumerate(((-0.7, -0.8, math.pi / 2), (0.7, -0.8, math.pi / 2), (-0.7, 0.8, -math.pi / 2))):
            L.office_chair(f"meet_chair{k}", (-15.5 + dx, 18.7 + dy, UP), rot_z=a, fabric="accent_blue")
            L.human(f"meet_p{k}", (-15.5 + dx, 18.7 + dy, UP), rot_z=a, seed=55 + k, pose="sit", outfit=("doctor", None, "doctor2")[k])
        box("cable_tray", (0.4, 5.8, 0.1), (-26.2, 15.6, UP + 2.35), "orange", bevel=0)
        empty("pin_data-analytics", (-20.0, HY1 - 1.2, UP + 5.1))
    with group("move"):  # floating holographic bar chart
        for k, h in enumerate((0.5, 0.9, 0.7, 1.2, 1.0)):
            b = box(f"holo_bar{k}", (0.18, 0.18, h), (-16.6 + k * 0.3, 13.6, UP + 1.05), "holo", bevel=0)
            b["bob"] = k * 0.7


def diagnostics_room():
    """Smart diagnostics & treatment: CT scanner, control desk, ultrasound cart, imaging walls."""
    with group("hot:smart-diagnostics"):
        box("diag_floor", (13.8, 7.6, 0.02), (-5.0, 16.0, UP), "tile_line", bevel=0)
        M.ct_scanner("ct", (-8.5, 16.6, UP), rot_z=0.0)
        M.workstation("ct_ctrl", (-1.8, 14.2, UP), rot_z=math.pi, screens=("screen_hsp_scan", "screen_hsp_scan"), seed=61, outfit="doctor")
        L.human("radiographer", (-6.6, 14.6, UP), rot_z=math.pi / 2 + 0.3, seed=62, outfit="surgeon")
        L.human("diag_doctor", (-4.5, 15.2, UP), rot_z=0.4, seed=63, outfit="doctor")
        M.screen_at("scr_diag", (8.6, 3.2), (-5.0, HY1 - 0.07, UP + 2.55), -math.pi / 2, "screen_hsp_diag", bezel=0.1)
        for k in range(3):
            M.screen_at(f"xray{k}", (0.9, 1.1), (-11.9, 14.0 + k * 1.2, UP + 1.6), 0.0, "screen_xray", bezel=0.04)
        box("us_cart", (0.6, 0.5, 0.9), (-10.9, 19.1, UP), "robot_white", bevel=0.05)
        M.screen_at("us_scr", (0.5, 0.36), (-10.9, 18.82, UP + 1.25), -math.pi / 2, "screen_hsp_scan", bezel=0.03)
        M.mri("mri", (-1.0, 17.8, UP), rot_z=-math.pi / 2)
        empty("pin_smart-diagnostics", (-5.0, HY1 - 1.2, UP + 5.1))


def ward():
    """Integrated patient care: smart beds with monitors and IV pumps, nurse station, curtains, window."""
    with group("hot:patient-care"):
        box("ward_floor", (15.8, 7.6, 0.02), (10.0, 16.0, UP), "woodlight", bevel=0)
        for i, x in enumerate((3.8, 6.9, 10.0)):
            M.hospital_bed(f"bed{i}", (x, HY1 - 1.25, UP), rot_z=-math.pi / 2, seed=70 + i, blanket=("blanket", "teal", "sky_blue")[i])
            M.vitals_monitor(f"vitals{i}", (x + 0.95, HY1 - 0.7, UP), face=-math.pi / 2 - 0.5)
            M.iv_pole(f"iv{i}", (x - 0.85, HY1 - 0.9, UP))
            box(f"cabinet{i}", (0.45, 0.45, 0.75), (x - 0.9, HY1 - 2.1, UP), "robot_white", bevel=0.04)
            if i < 2:
                box(f"curtain{i}", (0.03, 2.8, 2.1), (x + 1.55, HY1 - 1.6, UP + 0.2), ("sky_blue", "teal")[i], bevel=0)
                box(f"curtain_rail{i}", (0.05, 2.9, 0.05), (x + 1.55, HY1 - 1.6, UP + 2.35), "silver", bevel=0)
        # nurse station and a patient in a wheelchair
        M.curved_desk("nurse_desk", (6.5, 12.6), 1.2, 1.7, math.radians(20), math.radians(160), UP, h=1.0)
        L.human("ward_nurse", (6.5, 12.95, UP), rot_z=math.pi / 2, seed=75, outfit="nurse")
        M.screen_at("nurse_scr", (0.5, 0.3), (6.5, 13.95, UP + 1.3), -math.pi / 2, "screen_vitals", bezel=0.02)
        M.wheelchair("ward_wc", (12.6, 17.2, UP), rot_z=math.pi * 0.8, seed=76)
        for i, y in enumerate((18.4, 15.8)):
            M.hospital_bed(f"bedw{i}", (16.6, y, UP), rot_z=math.pi, seed=80 + i, blanket=("mint", "blanket")[i])
            M.vitals_monitor(f"vitalsw{i}", (17.4, y - 0.8, UP), face=math.pi + 0.5)
            M.iv_pole(f"ivw{i}", (17.5, y + 0.75, UP))
        box("curtain_w", (2.7, 0.03, 2.1), (16.55, 17.1, UP + 0.2), "sky_blue", bevel=0)
        M.screen_at("scr_care", (8.0, 3.0), (7.0, HY1 - 0.07, UP + 3.1), -math.pi / 2, "screen_hsp_care", bezel=0.1)
        empty("pin_patient-care", (8.0, HY1 - 1.2, UP + 5.1))


def lab():
    """Laboratory and robotic pharmacy on the left wing upstairs (detail, not a hotspot)."""
    L.set_group("static_building")
    box("lab_floor", (8.6, 21.6, 0.02), (-23.5, 1.0, UP), "robot_white", bevel=0)
    rnd = random.Random(90)
    for i, y in enumerate((-7.0, -3.2, 0.6)):
        box(f"labbench{i}", (5.0, 1.0, 0.92), (-23.6, y, UP), "robot_white", bevel=0.03)
        box(f"labbench{i}_top", (5.1, 1.08, 0.05), (-23.6, y, UP + 0.92), "sky_blue", bevel=0.01)
        for k in range(4):
            cx = -25.6 + k * 1.3
            if k % 2 == 0:  # microscope
                box(f"micro{i}{k}_base", (0.3, 0.22, 0.05), (cx, y, UP + 0.97), "robot_white", bevel=0.01)
                box(f"micro{i}{k}_arm", (0.06, 0.08, 0.36), (cx - 0.1, y, UP + 1.0), "darkgray", bevel=0.01)
                cyl(f"micro{i}{k}_eye", 0.035, 0.22, (cx, y, UP + 1.2), "darkgray", verts=10, rot=(0, 0.6, 0))
            else:  # rack of coloured sample tubes
                box(f"tubes{i}{k}", (0.4, 0.14, 0.04), (cx, y, UP + 0.97), "robot_white", bevel=0)
                for t in range(6):
                    cyl(f"tube{i}{k}{t}", 0.018, 0.14, (cx - 0.15 + t * 0.06, y, UP + 1.0), rnd.choice(("flower_pink", "flower_yellow", "sky_blue", "lime")), verts=6)
        L.human(f"labtech{i}", (-23.0, y - 0.8, UP), rot_z=math.pi / 2, seed=91 + i, outfit="doctor2")
    # robotic pharmacy: glass-front shelving full of colourful boxes along the wall
    for j in range(3):
        y0 = 3.2 + j * 2.8
        box(f"pharm{j}", (0.7, 2.6, 2.5), (HX0 + 0.4, y0 + 1.3, UP), "robot_white", bevel=0.03)
        for row in range(5):
            for col in range(6):
                box(f"med{j}_{row}_{col}", (0.3, 0.32, 0.26), (HX0 + 0.55, y0 + 0.25 + col * 0.4, UP + 0.2 + row * 0.46), rnd.choice(("goods1", "goods2", "goods3", "goods4", "flower_pink", "sky_blue", "orange")), bevel=0)
    box("pharm_robot_rail", (0.1, 8.2, 0.1), (HX0 + 1.3, 7.3, UP + 2.6), "silver", bevel=0)
    box("pharm_robot", (0.3, 0.4, 0.5), (HX0 + 1.3, 6.4, UP + 2.1), "orange", bevel=0.05)
    cyl("pharm_robot_arm", 0.05, 0.9, (HX0 + 1.1, 6.4, UP + 1.2), "robot_white", verts=10)


# ---------------------------------------------------------------- ground floor

def reception():
    L.set_group("static_building")
    M.curved_desk("reception", (-4.0, 15.8), 2.6, 3.3, math.radians(205), math.radians(335), FLOOR)
    for i, a in enumerate((230, 270, 310)):
        ang = math.radians(a)
        x, y = -4.0 + math.cos(ang) * 2.2, 15.8 + math.sin(ang) * 2.2
        L.office_chair(f"rec_chair{i}", (x, y, FLOOR), rot_z=ang + math.pi, fabric="teal")
        L.human(f"receptionist{i}", (x, y, FLOOR), rot_z=ang + math.pi, seed=100 + i, pose="sit", outfit="nurse" if i != 1 else "nurse2")
        M.screen_at(f"rec_scr{i}", (0.5, 0.3), (-4.0 + math.cos(ang) * 2.75, 15.8 + math.sin(ang) * 2.75, FLOOR + 1.35), ang + math.pi, "screen_monitor", bezel=0.02)
    M.screen_at("scr_brand", (6.4, 2.4), (-4.0, HY1 - 0.18, FLOOR + 2.6), -math.pi / 2, "screen_hsp_brand", bezel=0.08)
    # visitors at the counter
    for i, (x, y, h) in enumerate(((-5.6, 11.2, math.pi / 2), (-2.6, 11.0, math.pi / 2 + 0.2), (-3.6, 10.4, math.pi / 2))):
        L.human(f"rec_visitor{i}", (x, y, FLOOR), rot_z=h, seed=110 + i, outfit="patient" if i == 1 else None)
    # clinic doors, benches and vending under the back of the upper floor
    for i, x in enumerate((-26.0, -22.0, -18.0, -14.0)):
        box(f"clinic_door{i}", (1.3, 0.06, 2.4), (x, HY1 - 0.05, FLOOR), "accent_blue", bevel=0.01)
        M.screen_at(f"clinic_no{i}", (0.7, 0.3), (x, HY1 - 0.1, FLOOR + 2.8), -math.pi / 2, "screen_queue", bezel=0.02)
        M.chair_row(f"clinic_bench{i}", (x + 2.0 if i < 3 else x + 1.6, 15.2, FLOOR), n=3, rot_z=math.pi / 2, color="sky_blue")
    for i, (x, y, h, o) in enumerate(((-24.0, 15.2, math.pi / 2, None), (-20.0, 15.2, math.pi / 2, "patient"), (-16.0, 15.2, math.pi / 2, None))):
        L.human(f"clinic_wait{i}", (x, y, FLOOR), rot_z=h, seed=120 + i, pose="sit", outfit=o)
    for i, x in enumerate((0.6, 1.8)):
        box(f"vending{i}", (1.1, 0.8, 1.95), (x + 0.5, HY1 - 0.62, FLOOR), ("cross_red", "accent_blue")[i], bevel=0.04)
        box(f"vending{i}_glass", (0.8, 0.02, 1.2), (x + 0.4, HY1 - 1.04, FLOOR + 0.6), "carglass", bevel=0)
    box("water", (0.4, 0.4, 1.1), (3.4, HY1 - 0.4, FLOOR), "robot_white", bevel=0.05)
    sphere("water_tank", 0.2, (3.4, HY1 - 0.4, FLOOR + 1.3), "sky_blue", scale=(1, 1, 1.2), subdiv=2)


def hub():
    """Smart hospital management: holographic operations hub, consultation table, self-service kiosks."""
    hx, hy = HUB
    with group("hot:hospital-management"):
        box("hub_trim", (8.4, 8.4, 0.12), (hx, hy, FLOOR), "robot_white", bevel=0.04)
        box("hub_carpet", (7.8, 7.8, 0.02), (hx, hy, FLOOR + 0.12), "carpet_blue", bevel=0)
        for i, (dx, dy, w, d) in enumerate(((0, -4.2, 8.4, 0.05), (0, 4.2, 8.4, 0.05), (-4.2, 0, 0.05, 8.4), (4.2, 0, 0.05, 8.4))):
            box(f"hub_led{i}", (w, d, 0.04), (hx + dx, hy + dy, FLOOR + 0.06), "led_cyan", bevel=0)
        cyl("hub_table", 1.5, 0.06, (hx, hy, FLOOR + 0.86), "robot_white", verts=40)
        cyl("hub_table_edge", 1.52, 0.03, (hx, hy, FLOOR + 0.84), "accent_blue", verts=40)
        cyl("hub_stem", 0.3, 0.72, (hx, hy, FLOOR + 0.14), "robot_white", verts=20)
        cyl("hub_emitter", 0.5, 0.05, (hx, hy, FLOOR + 0.92), "led_cyan", verts=28)
        for i in range(5):
            a = math.pi / 2 + i * math.tau / 5
            cx, cy = hx + math.cos(a) * 2.1, hy + math.sin(a) * 2.1
            L.office_chair(f"hub_chair{i}", (cx, cy, FLOOR + 0.14), rot_z=a + math.pi, fabric="teal")
            if i != 2:
                L.human(f"hub_member{i}", (cx, cy, FLOOR + 0.14), rot_z=a + math.pi, seed=130 + i, pose="sit", outfit=("doctor", "nurse", "doctor2", "surgeon", "doctor")[i])
            box(f"hub_tablet{i}", (0.26, 0.18, 0.015), (hx + math.cos(a) * 1.1, hy + math.sin(a) * 1.1, FLOOR + 0.92), "bezel", bevel=0, rot=(0, 0, a))
        L.human("hub_lead", (hx + 1.0, hy - 2.6, FLOOR + 0.14), rot_z=math.pi / 2 + 0.3, seed=136, outfit="doctor")
        # self-service kiosks and a queue board on the hub's front edge
        for i, dx in enumerate((-2.8, -1.4, 1.4)):
            M.kiosk(f"kiosk{i}", (hx + dx, hy - 3.5, FLOOR + 0.14), face=-math.pi / 2, screen="screen_kiosk")
        L.human("kiosk_user0", (hx - 2.8, hy - 4.1, FLOOR + 0.14), rot_z=math.pi / 2, seed=140)
        L.human("kiosk_user1", (hx + 1.4, hy - 4.1, FLOOR + 0.14), rot_z=math.pi / 2, seed=141, outfit="patient")
        cyl("queue_pole", 0.06, 2.4, (hx + 3.6, hy - 3.6, FLOOR + 0.14), "silver", verts=10)
        M.screen_at("queue_board", (1.6, 0.9), (hx + 3.6, hy - 3.7, FLOOR + 2.85), 0.2, "screen_queue", bezel=0.05)
        empty("pin_hospital-management", (hx, hy, FLOOR + 7.6))
    # the hologram itself: translucent column, turning rings, floating dashboards (animated in the browser)
    with group("move"):
        cyl("holo_column", 0.42, 4.3, (hx, hy, FLOOR + 0.95), "holo", verts=28)
        for k, (z, r, sp) in enumerate(((2.3, 1.7, 0.5), (3.4, 2.2, -0.35), (4.5, 1.3, 0.8))):
            ring = M.disc_ring(f"holo_ring{k}", r, r - 0.08, (hx, hy, FLOOR + z), 0.05, "holo", n=48)
            ring["spin"] = "z"
            ring["spin_speed"] = sp
        globe = sphere("holo_globe", 0.75, (hx, hy, FLOOR + 3.3), "holo", subdiv=1)
        globe["spin"] = "z"
        globe["spin_speed"] = 0.4
        for k in range(4):
            a = math.pi / 4 + k * math.pi / 2
            c = (hx + math.cos(a) * 3.0, hy + math.sin(a) * 3.0, FLOOR + 3.9)
            L.plane(f"holo_panel{k}", (2.0, 1.2), c, "screen_hsp_mgmt", rot=(math.pi / 2, 0, a + math.pi / 2))
            bpy.data.objects[f"holo_panel{k}"]["bob"] = k * 1.3


def workstations():
    """Telemedicine and operations workstations (front left in the artwork)."""
    L.set_group("static_building")
    for row, y in enumerate((-7.8, -4.4)):
        for i, x in enumerate((-17.0, -13.4)):
            M.workstation(f"ws{row}{i}", (x, y, FLOOR), rot_z=0.0, screens=("screen_tele", "screen_monitor"), seed=150 + row * 2 + i, outfit=("nurse2", "doctor2", None, "nurse")[row * 2 + i])
    L.human("ws_doctor", (-15.2, -2.6, FLOOR), rot_z=-math.pi / 2 - 0.4, seed=158, outfit="doctor")
    box("ws_tablet", (0.2, 0.28, 0.02), (-15.0, -2.8, FLOOR + 1.15), "bezel", bevel=0, rot=(0.9, 0, -0.4))
    cyl("tele_stand", 0.07, 1.4, (-11.8, -9.4, FLOOR), "silver", verts=10)
    box("tele_foot", (0.8, 0.5, 0.05), (-11.8, -9.4, FLOOR), "silver", bevel=0.01)
    M.screen_at("tele_big", (1.8, 1.05), (-11.8, -9.48, FLOOR + 1.95), -math.pi / 2 + 0.6, "screen_tele", bezel=0.05)


def lounge():
    """Waiting lounge with teal seating, flowers and topiary along the windows."""
    L.set_group("static_building")
    rnd = random.Random(170)
    for r, x in enumerate((5.2, 7.8, 10.4)):
        for g, y in enumerate((0.8, 4.6)):
            M.chair_row(f"wait{r}{g}", (x, y, FLOOR), n=5, rot_z=math.pi, color=("teal", "sky_blue")[(r + g) % 2])
            for k in range(5):
                if rnd.random() < 0.55:
                    dy = -1.16 + k * 0.58
                    L.human(f"waiting{r}{g}{k}", (x - 0.02, y + dy, FLOOR), rot_z=math.pi, seed=175 + r * 10 + g * 5 + k, pose="sit", outfit="patient" if rnd.random() < 0.3 else None)
    for i, (x, y) in enumerate(((12.0, 2.7), (12.0, 6.5))):
        box(f"side_table{i}", (0.5, 0.5, 0.5), (x, y, FLOOR), "woodlight", bevel=0.03)
        L.potted_plant(f"side_plant{i}", (x, y, FLOOR + 0.5), h=0.7, seed=180 + i, pot="accent_blue")
    M.wheelchair("lounge_wc", (4.2, 7.4, FLOOR), rot_z=math.pi, seed=185)
    for i, y in enumerate((-9.0, -6.6)):
        M.topiary(f"topiary{i}", (HX1 - 1.1, y, FLOOR), h=2.5, seed=190 + i)
    for i, y in enumerate((7.2, 9.6)):
        M.topiary(f"topiary_b{i}", (HX1 - 0.9, y, FLOOR), h=2.4, seed=195 + i)
    for i, (x0, y0) in enumerate(((-9.6, 10.3), (-13.0, -9.8), (13.2, -9.7), (-1.0, 9.6))):
        M.flower_bed(f"bed_in{i}", x0, y0, x0 + 2.2, y0 + 0.9, FLOOR, seed=200 + i)


def entrance():
    """Smart safety & convenience: automatic doors, face / temperature screening, concierge robot, CCTV."""
    x0 = HX0
    with group("hot:safety-convenience"):
        box("ent_mat", (2.0, DOOR_Y[1] - DOOR_Y[0] - 0.6, 0.012), (x0 + 1.2, sum(DOOR_Y) / 2, FLOOR), "darkgray", bevel=0)
        for side in (-1, 1):
            y = sum(DOOR_Y) / 2 + side * 2.2
            M.kiosk(f"screen_gate{side}", (x0 + 3.2, y, FLOOR), face=math.pi, screen="screen_face")
            box(f"sanitiser{side}", (0.3, 0.3, 1.2), (x0 + 0.5, y + side * 1.1, FLOOR), "robot_white", bevel=0.03)
            box(f"sanitiser{side}_led", (0.02, 0.2, 0.06), (x0 + 0.66, y + side * 1.1, FLOOR + 1.0), "led_green", bevel=0)
        box("exit_sign", (0.05, 0.9, 0.3), (x0 + 0.05, sum(DOOR_Y) / 2, 4.2), "led_green", bevel=0)
        box("fire_cab", (0.2, 0.7, 1.0), (x0 + 0.1, 8.5, FLOOR + 0.9), "cross_red", bevel=0.02)
        for k, (x, y) in enumerate(((x0 + 3.0, -6.0), (x0 + 3.0, 6.0), (-21.0, 11.0))):
            cyl(f"cctv{k}_base", 0.2, 0.05, (x, y, MEZ_Z - 0.05), "robot_white", verts=16)
            sphere(f"cctv{k}", 0.15, (x, y, MEZ_Z - 0.06), "black", scale=(1, 1, 0.7), subdiv=1)
        for k in range(3):
            M.wheelchair(f"wc_park{k}", (x0 + 1.0, -7.4 + k * 0.75, FLOOR), rot_z=0.0, occupant=False)
        M.humanoid_robot("concierge", (x0 + 5.0, -3.4, FLOOR), rot_z=math.pi / 2)
        empty("pin_safety-convenience", (-18.4, -1.0, 4.8))  # just outside the wing so the slab never hides it
    # outside: entrance canopy and approach from the plaza
    L.set_group("static_site")
    box("ent_canopy", (5.5, 8.0, 0.3), (x0 - 3.2, sum(DOOR_Y) / 2, 3.9), "hosp_white", bevel=0.05)
    box("ent_canopy_led", (5.4, 0.04, 0.06), (x0 - 3.2, sum(DOOR_Y) / 2 - 4.0, 3.95), "led_cyan", bevel=0)
    for dy in (-3.6, 3.6):
        cyl(f"ent_canopy_col{dy}", 0.14, 3.9 - 0.16, (x0 - 5.6, sum(DOOR_Y) / 2 + dy, 0.16), "silver", verts=14)
    # sliding door leaves (open for the visitors walking through)
    for side in (-1, 1):
        with group("move"):
            parts = [box(f"door{side}_pane", (0.03, 2.9, 3.4), (0, 0, 0.02), "glass", bevel=0)]
            for k, (fy, fz, sy, sz) in enumerate(((0, 0, 3.0, 0.06), (0, 3.38, 3.0, 0.06), (-1.47, 0, 0.06, 3.46), (1.47, 0, 0.06, 3.46))):
                parts.append(box(f"door{side}_f{k}", (0.06, sy, sz), (0, fy, fz), "hosp_white", bevel=0))
        leaf = L.rigid(parts, f"door{side}")
        L.place(leaf, (x0 - 0.1, sum(DOOR_Y) / 2 + side * 1.5, FLOOR), 0.0, slide=side, slide_axis="y", slide_dist=2.9, sense=3.4, hot="safety-convenience")


def er_bay():
    """Emergency department: sliding doors, canopy and a parked ambulance with flashing lights."""
    for side in (-1, 1):
        with group("move"):
            parts = [box(f"erdoor{side}_pane", (0.03, 1.76, 2.9), (0, 0, 0.02), "glass", bevel=0)]
            parts.append(box(f"erdoor{side}_frame", (0.06, 1.8, 0.06), (0, 0, 2.9), "hosp_white", bevel=0))
        leaf = L.rigid(parts, f"erdoor{side}")
        L.place(leaf, (HX1 + 0.05, sum(ER_Y) / 2 + side * 0.9, FLOOR), 0.0, slide=side, slide_axis="y", slide_dist=1.7, sense=3.0)
    L.set_group("static_site")
    cx0, cx1, cy0, cy1 = HX1 + 0.1, HX1 + 9.0, -8.6, 0.6  # glass canopy over the ER doors and the inbound lane
    box("er_canopy_glass", (cx1 - cx0, cy1 - cy0, 0.04), ((cx0 + cx1) / 2, (cy0 + cy1) / 2, 4.42), "glass", bevel=0)
    A.ring("er_canopy_frame", rect(cx0, cy0, cx1, cy1), rect(cx0 + 0.25, cy0 + 0.25, cx1 - 0.25, cy1 - 0.25), 4.3, 0.2, "hosp_white")
    for k in range(1, 4):
        box(f"er_canopy_beam{k}", (cx1 - cx0, 0.12, 0.12), ((cx0 + cx1) / 2, cy0 + (cy1 - cy0) * k / 4, 4.36), "hosp_white", bevel=0)
    box("er_canopy_red", (cx1 - cx0 + 0.02, 0.05, 0.2), ((cx0 + cx1) / 2, cy0 - 0.02, 4.3), "cross_red", bevel=0)
    L.text_mesh("er_canopy_txt", "EMERGENCY", ((cx0 + cx1) / 2, cy0 - 0.06, 4.66), 0.4, 0.05, "cross_red")
    for y in (cy0 + 0.3, cy1 - 0.3):
        cyl(f"er_col{y}", 0.16, 4.3 - 0.02, (cx1 - 0.3, y, 0.02), "hosp_white", verts=20)
        cyl(f"er_col{y}_ring", 0.18, 0.06, (cx1 - 0.3, y, 2.4), "cross_red", verts=20)
    M.ambulance("amb_parked", (HX1 + 3.2, -7.2, 0.02), rot_z=math.pi / 2)
    for o in [o for o in L.COL.objects if o.name.startswith("amb_parked_lb_")]:
        o["grp"], o["kind"] = "move", "move"
        o["blink"] = 0.5 if "blue" in o.name else 0.0
    L.human("paramedic_wait", (HX1 + 1.3, -8.0, 0.16), rot_z=math.pi / 2, seed=210, outfit="paramedic")


# ---------------------------------------------------------------- site

def site():
    L.set_group("static_site")
    A.solid("plinth", A.outline(A.rect_poly(0, 0, 2 * BASE[0], 2 * BASE[1]), 2.0), -2.0, 2.0, "hosp_white", bevel=0.15)
    box("road", (2 * BASE[0], 8, 0.02), (0, ROAD_Y, 0), "asphalt", bevel=0)
    for i in range(13):
        box(f"dash{i}", (2.4, 0.15, 0.005), (-37 + i * 6.2, ROAD_Y, 0.02), "paint_white", bevel=0)
    for i in range(9):
        box(f"zebra{i}", (0.55, 5.0, 0.005), (-16.0 + i * 1.1, ROAD_Y, 0.021), "paint_white", bevel=0)
    box("sidewalk", (2 * BASE[0], 5.0, 0.16), (0, -18.5, 0), "paving", bevel=0.03)
    box("sidewalk_far", (2 * BASE[0], 2.0, 0.16), (0, -30.0, 0), "paving", bevel=0.03)
    box("plaza", (2 * BASE[0], 5.8, 0.16), (0, -13.1, 0), "terrazzo", bevel=0.03)
    box("grounds", (2 * BASE[0] - 0.6, 30.0, 0.16), (0, 5.5, 0), "lawn", bevel=0.03)
    box("er_drive", (13.0, 42.0, 0.02), (HX1 + 7.5, 0.0, 0.16), "asphalt", bevel=0)
    box("ent_path", (12.0, 7.0, 0.02), (HX0 - 6.0, 0.0, 0.16), "terrazzo", bevel=0)
    box("back_path", (2 * BASE[0] - 0.6, 3.0, 0.02), (0, HY1 + 3.0, 0.16), "terrazzo", bevel=0)
    for i in range(20):
        box(f"plaza_joint{i}", (0.03, 5.5, 0.003), (-38 + i * 4, -13.25, 0.16), "paving_dark", bevel=0)
    rnd = random.Random(300)
    for k, x in enumerate(range(-36, 40, 8)):
        if not HX1 < x < HX1 + 15:  # keep the ER driveway clear
            A.tree(f"stree{k}", (x, -18.2, 0.16), h=6.2 + rnd.random(), spread=0.9, seed=310 + k)
        if not HX1 < x + 4 < HX1 + 15:
            L.street_light(f"lamp{k}", (x + 4, -20.6, 0.16), rot_z=-math.pi / 2, h=6.0)
    for k, (x, y) in enumerate(((-36, -6), (-36, 8), (-36, 22), (-22, 23.5), (-4, 25.5), (16.5, 23.5), (36, 22), (37, 12))):
        A.tree(f"gtree{k}", (x, y, 0.16), h=6.5 + rnd.random() * 2, spread=1.0, seed=330 + k)
    for i, (x0, y0) in enumerate(((-34.0, -15.6), (-24.0, -15.6), (-6.0, -15.6), (10.0, -15.6), (-38.8, -6.0), (-38.8, 5.0))):
        M.flower_bed(f"bed_out{i}", x0, y0, x0 + (4.0 if i < 4 else 1.4), y0 + (1.4 if i < 4 else 4.0), 0.16, seed=340 + i)
    for i, x in enumerate((-18.0, 2.0, 16.0)):
        L.bench(f"bench{i}", (x, -12.6, 0.16))
    # monument sign at the front corner
    box("monument", (6.0, 0.8, 1.6), (-30.0, -11.6, 0.16), "hosp_white", bevel=0.08)
    L.text_mesh("monument_txt", "SMART HOSPITAL", (-29.4, -12.02, 0.62), 0.5, 0.05, "accent_blue")
    box("monument_cross_v", (0.3, 0.06, 0.9), (-32.4, -12.02, 0.5), "cross_red", bevel=0.01)
    box("monument_cross_h", (0.9, 0.06, 0.3), (-32.4, -12.02, 0.8), "cross_red", bevel=0.01)
    # city behind
    for i, (x, y, w, d, h, mat) in enumerate(((-30, 27.5, 10, 6, 40, "tower_blue"), (-13, 28.0, 12, 5, 54, "tower_teal"), (6, 27.5, 10, 6, 36, "tower_blue"), (27, 27.0, 12, 7, 48, "tower_teal"))):
        pts = A.outline(A.rect_poly(x, y, w, d), 1.0)
        A.solid(f"tower{i}", pts, 0.16, h, mat)
        A.mullions(f"tower{i}_mull", A.outline(A.rect_poly(x, y, w + 0.1, d + 0.1), 1.05), 0.16, h, spacing=1.6, size=(0.08, 0.12), mat="tower_frame")
        for zz in range(4, int(h), 4):
            A.ring(f"tower{i}_band{zz}", A.outline(A.rect_poly(x, y, w + 0.2, d + 0.2), 1.1), pts, zz, 0.25, "tower_frame")
        A.solid(f"tower{i}_cap", A.outline(A.rect_poly(x, y, w - 1, d - 1), 0.6), 0.16 + h, 1.2, "tower_frame")


# ---------------------------------------------------------------- life: people, robots, vehicles, drone

def life():
    hx, hy = HUB
    # doctors and nurses circling the hub, both directions (same speed per loop: nobody walks through anybody)
    loop = racetrack(hx - 5.5, hy - 5.5, hx + 5.5, hy + 5.5, 2.0)
    loops = [
        (A.offset_poly(loop, 0.4), 3, 1.2, ("doctor", "nurse", "surgeon"), FLOOR),
        (list(reversed(A.offset_poly(loop, -0.4))), 2, 1.1, ("nurse2", "doctor2"), FLOOR),
        (racetrack(HX0 - 8.0, -0.7, -21.0, 0.7, 0.69), 2, 1.15, (None, "patient"), FLOOR),  # visitors in / out of the main doors
        (racetrack(3.2, 15.2, 11.0, 16.0, 0.39), 1, 1.0, ("nurse",), UP),  # nurse on the ward
        (racetrack(-11.0, 12.7, -3.0, 13.3, 0.29), 1, 1.0, ("doctor",), UP),  # doctor between CT and control
        (racetrack(-36.0, -29.8, 36.0, -29.2, 0.29), 3, 1.25, (None, None, None), 0.16),  # far sidewalk
        (racetrack(-36.0, -17.2, HX1 - 1.0, -16.4, 0.39), 4, 1.3, (None, "doctor", None, "nurse"), 0.16),  # front sidewalk, short of the ER drive
    ]
    n = 0
    for path, count, speed, outfits, z in loops:
        length = L.path_length(path, True)
        for j in range(count):
            L.walker(f"walker{n}", path, speed, (j + 0.3) * length / count, seed=400 + n, z=z, outfit=outfits[j])
            n += 1
    # nurse pushing a patient in a wheelchair, paramedic wheeling a stretcher in through the ER doors
    L.walker("wc_nurse", racetrack(-7.5, -8.9, 10.0, -7.5, 0.69), 0.9, 5.0, seed=450, z=FLOOR, outfit="nurse",
             carry=lambda p: M.wheelchair(p, (0.95, 0, 0), rot_z=0.0, seed=451))
    L.walker("paramedic", racetrack(8.0, -3.8, HX1 + 3.5, -2.6, 0.59), 1.0, 8.0, seed=452, z=FLOOR, outfit="paramedic",
             carry=lambda p: M.stretcher(p, (1.35, 0, 0), rot_z=0.0, seed=453))
    for j, o in enumerate(("doctor", "nurse2")):  # staff crossing under the right wing
        path = racetrack(0.5, 12.8, 12.0, 13.6, 0.39)
        L.walker(f"wing{j}", path, 1.1, j * L.path_length(path, True) / 2, seed=470 + j, z=FLOOR, outfit=o)
    # robots: telepresence cart around the hub, concierge patrol, parcel robot along the clinics, cleaner in the lab
    for name, build, path, speed, at, z in (
        ("telebot", M.telepresence_robot, racetrack(hx - 7.0, hy - 7.0, hx + 7.0, hy + 7.0, 3.0), 0.8, 0.0, FLOOR),
        ("patrolbot", M.humanoid_robot, racetrack(HX0 + 1.8, 5.0, HX0 + 6.0, 9.4, 1.0), 0.5, 2.0, FLOOR),
        ("parcelbot", M.delivery_robot, racetrack(-26.0, 12.9, -14.0, 13.5, 0.29), 0.8, 0.0, FLOOR),
        ("cleanbot", M.cleaning_robot, racetrack(-26.5, 1.7, -20.0, 2.5, 0.39), 0.4, 0.0, UP),
    ):
        with group("move"):
            build(name, (0, 0, 0), 0.0)
        L._on_path(L.rigid(L._parts(name), name), "drive", speed, path, True, at, z)
    # delivery drone circling above the hall, rotors spinning
    ring = M.circle(17.0, 36, hx - 2.0, hy + 3.0)
    with group("move"):
        rotors = M.drone("drone", (0, 0, 0), 0.0)
    body = L.rigid([o for o in L._parts("drone") if o not in rotors], "drone")
    for i, r in enumerate(rotors):
        c = L._top_centre([r])
        rr = L.rigid([r], f"drone_rotor{i}", (c[0], c[1], c[2] - 0.006))
        rr["spin"] = "z"
        rr["spin_speed"] = 30.0
        rr.parent = body
    L._on_path(body, "drive", 5.0, ring, True, 0.0, 15.5)
    traffic()


def moving_ambulance(name, path, speed, at):
    with group("move"):
        M.ambulance(name, (0, 0, 0), 0.0)
    parts = L._parts(name)
    bar = [o for o in parts if "_lb_" in o.name]
    body = L.rigid([o for o in parts if o not in bar], name)
    for o in bar:
        b = L.rigid([o], o.name)
        b["blink"] = 0.5 if "blue" in o.name else 0.0
        b.parent = body
    return L._on_path(body, "drive", speed, path, True, at, 0.02)


def traffic():
    """One speed for every vehicle. Ambulances loop through the ER bay; the road lanes are exactly a third
    of that loop and run off the base, so through-traffic phases are chosen once to stay clear."""
    v = 7.0
    lane_e, lane_w = ROAD_Y + 1.8, ROAD_Y - 1.8
    loop = A.fillet_poly([(-BASE[0] - 7, lane_e), (AMB_IN, lane_e), (AMB_IN, 12.0), (AMB_OUT, 12.0), (AMB_OUT, lane_w), (-BASE[0] - 7, lane_w)], 2.2, 6)
    total = L.path_length(loop, True)
    a = total / 6
    loopers = [0.0, total / 3, 2 * total / 3]

    def clearance(lane, phase):
        worst = 1e9
        for k in range(480):
            d = k * total / 480
            p, _ = L.path_point(lane, False, phase + d)
            if abs(p[0]) > BASE[0] + 2:
                continue
            for at in loopers:
                q, _ = L.path_point(loop, True, at + d)
                if abs(q[0]) < BASE[0] + 2 and abs(p[1] - q[1]) < 2.8:
                    worst = min(worst, math.hypot(p[0] - q[0], p[1] - q[1]))
        return worst

    moving_ambulance("amb0", loop, v, loopers[0])
    L.driver("taxi_loop", loop, v, loopers[1], closed=True, paint="flower_yellow")
    L.driver("car_loop", loop, v, loopers[2], closed=True, paint="accent_blue")
    lanes = {"east": [(-a, lane_e), (a, lane_e)], "west": [(a, lane_w), (-a, lane_w)]}
    for i, (key, lane) in enumerate(lanes.items()):
        phase = max(range(0, int(2 * a)), key=lambda ph: clearance(lane, ph))
        print(f"traffic {key}: phase {phase} clearance {clearance(lane, phase):.1f} m")
        L.driver(f"car_{key}", lane, v, phase, closed=False, paint=("cross_red", "robot_white")[i], kind=("car", "van")[i])


# ---------------------------------------------------------------- colour, branding and busy atrium

def colour_and_brand():
    L.set_group("static_building")
    # a colour for every upstairs room (behind its big screen) and for the lab wing
    for name, x0, x1, mat in (("paint_data", HX0, -12.06, "accent_blue"), ("paint_diag", -11.94, 1.94, "teal"), ("paint_care", 2.06, HX1, "mint")):
        box(name, (x1 - x0, 0.012, TOP - UP - 0.1), ((x0 + x1) / 2, HY1 - 0.006, UP), mat, bevel=0)
    box("paint_lab", (0.012, 22.0, TOP - UP - 0.1), (HX0 + 0.006, 1.0, UP), "orange", bevel=0)
    # clinic wall panels and the lift lobby downstairs
    for i, x in enumerate((-26.0, -22.0, -18.0, -14.0)):
        box(f"clinic_panel{i}", (3.6, 0.012, MEZ_Z - FLOOR - 0.2), (x, HY1 - 0.006, FLOOR + 0.12), ("sky_blue", "teal")[i % 2], bevel=0)
    box("lift_panel", (6.0, 0.012, MEZ_Z - FLOOR - 0.2), (7.2, HY1 - 0.006, FLOOR + 0.12), "mint", bevel=0)
    for side, (y0, y1) in (("a", (HY0, DOOR_Y[0])), ("b", (DOOR_Y[1], HY1))):
        box(f"mural_{side}", (0.012, y1 - y0 - 0.4, 3.2), (HX0 + 0.006, (y0 + y1) / 2, FLOOR + 1.2), "sky_blue", bevel=0)
        box(f"mural_{side}_stripe", (0.016, y1 - y0 - 0.4, 0.25), (HX0 + 0.008, (y0 + y1) / 2, FLOOR + 3.6), "accent_blue", bevel=0)
    # blue fascia band on the upper-floor edges
    for i, ((x0, y0), (x1, y1), (nx, ny)) in enumerate((((-19.0, HY0), (-19.0, 12.0), (1, 0)), ((-19.0, 12.0), (HX1, 12.0), (0, -1)), ((HX0, HY0), (-19.0, HY0), (0, -1)))):
        ln = math.hypot(x1 - x0, y1 - y0)
        box(f"fascia{i}", (ln, 0.05, 0.2), ((x0 + x1) / 2 + nx * 0.03, (y0 + y1) / 2 + ny * 0.03, MEZ_Z + 0.2), "accent_blue", bevel=0, rot=(0, 0, math.atan2(y1 - y0, x1 - x0)))
    # rooftop lettering and the base band
    L.text_mesh("roof_txt", "SMART HOSPITAL", (-3.0, HY1 + 0.25, TOP + 0.08), 1.8, 0.35, "accent_blue")
    box("roof_cross_v", (0.55, 0.35, 1.7), (-15.6, HY1 + 0.25, TOP + 0.08), "cross_red", bevel=0.04)
    box("roof_cross_h", (1.7, 0.35, 0.55), (-15.6, HY1 + 0.25, TOP + 0.66), "cross_red", bevel=0.04)
    L.set_group("static_site")
    outer = A.outline(A.rect_poly(0, 0, 2 * BASE[0] + 0.08, 2 * BASE[1] + 0.08), 2.04)
    inner = A.outline(A.rect_poly(0, 0, 2 * BASE[0] - 0.1, 2 * BASE[1] - 0.1), 1.95)
    A.ring("base_band", outer, inner, -0.42, 0.3, "accent_blue")


def atrium_extras():
    """More life downstairs: café, indoor garden, wayfinding, plants at columns, people everywhere."""
    L.set_group("static_building")
    z = FLOOR + 0.002
    # coloured floor zones and wayfinding stripes from the main doors
    cyl("zone_cafe", 3.2, 0.004, (-14.8, -1.3, z), "orange", verts=48)
    box("zone_lounge", (7.0, 7.6, 0.004), (7.8, 2.9, z), "teal", bevel=0)
    M.floor_strip("way_lime", [(-21.5, 0.9), (-10.6, 0.9), (-10.6, 10.0), (-7.8, 11.4)], 0.2, z + 0.002, "lime")
    M.floor_strip("way_orange", [(-21.5, 1.25), (-10.2, 1.25), (-10.2, -5.6), (-11.4, -6.3)], 0.2, z + 0.002, "orange")
    M.floor_strip("way_pink", [(-21.5, 1.6), (-9.6, 1.6)], 0.2, z + 0.002, "flower_pink")
    # café
    box("cafe_counter", (0.7, 3.0, 1.05), (-17.6, -1.2, FLOOR), "orange", bevel=0.04)
    box("cafe_top", (0.8, 3.1, 0.05), (-17.6, -1.2, FLOOR + 1.05), "woodlight", bevel=0.01)
    box("cafe_machine", (0.4, 0.5, 0.45), (-17.7, -2.1, FLOOR + 1.1), "silver", bevel=0.03)
    box("cafe_display", (0.45, 1.0, 0.4), (-17.6, -0.4, FLOOR + 1.1), "glass", bevel=0)
    for k in range(6):
        sphere(f"cafe_pastry{k}", 0.06, (-17.6, -0.8 + k * 0.15, FLOOR + 1.16), ("flower_yellow", "coral", "woodlight")[k % 3], scale=(1, 1, 0.6), subdiv=1)
    cyl("cafe_menu_pole", 0.04, 1.8, (-18.3, -2.9, FLOOR), "silver", verts=8)
    M.screen_at("cafe_menu", (0.9, 1.2), (-18.3, -2.95, FLOOR + 2.3), 0.3, "screen_cafe", bezel=0.04)
    for k, y in enumerate((-2.0, -0.4)):
        L.human(f"barista{k}", (-18.3, y, FLOOR), rot_z=0.0, seed=500 + k)
    for k, (x, y) in enumerate(((-14.6, -2.0), (-12.7, -0.2), (-15.2, 0.1))):
        L.cafe_set(f"atrium_cafe{k}", (x, y, FLOOR), seed=510 + k, chairs=3)
    # indoor garden island with benches along its front
    gx0, gx1, gy0, gy1 = -18.0, -11.2, 2.4, 8.8
    box("garden_edge", (gx1 - gx0, gy1 - gy0, 0.45), ((gx0 + gx1) / 2, (gy0 + gy1) / 2, FLOOR), "robot_white", bevel=0.06)
    box("garden_lawn", (gx1 - gx0 - 0.3, gy1 - gy0 - 0.3, 0.02), ((gx0 + gx1) / 2, (gy0 + gy1) / 2, FLOOR + 0.45), "lawn", bevel=0)
    for k, (x, y) in enumerate(((-16.2, 6.8), (-13.2, 5.2))):
        A.tree(f"garden_tree{k}", (x, y, FLOOR + 0.46), h=4.6, spread=0.72, seed=520 + k, detail=1)
    M.flower_bed("garden_flowers", gx0 + 0.4, gy0 + 0.3, gx1 - 0.4, gy0 + 1.3, FLOOR + 0.02, seed=525)
    for k, x in enumerate((-16.4, -13.4)):
        L.bench(f"garden_bench{k}", (x, gy0 - 0.45, FLOOR))
        L.human(f"garden_sit{k}", (x + 0.3, gy0 - 0.5, FLOOR), rot_z=-math.pi / 2, seed=530 + k, pose="sit", outfit=("patient", None)[k])
    # plants flanking the columns
    for i, (x, y, dx, dy) in enumerate(((-11.0, 12.0, 0.75, 0), (-3.0, 12.0, 0.75, 0), (5.0, 12.0, 0.75, 0), (11.0, 12.0, 0.75, 0), (-19.0, 4.0, 0, 0.75), (-19.0, -4.0, 0, 0.75))):
        for sgn in (-1, 1):
            L.potted_plant(f"col_plant{i}{sgn}", (x + sgn * dx, y + sgn * dy - (0.5 if dy == 0 else 0), FLOOR), h=1.5, seed=540 + i * 2 + sgn, pot="accent_blue")
    # people: doctors talking, a family, an IV patient, visitors at the vending machines and the lifts
    crowd = [
        (4.0, 10.6, 0.3, "doctor"), (5.0, 10.2, 2.6, "doctor2"), (4.3, 9.6, 1.4, "nurse"),
        (-12.4, 10.0, -1.2, None), (-11.9, 10.3, -1.6, None),
        (12.8, 8.6, 3.0, "patient"), (1.1, 18.2, math.pi / 2, None), (2.2, 18.1, math.pi / 2 + 0.2, None),
        (6.0, 18.4, math.pi / 2, None), (8.2, 18.3, math.pi / 2 - 0.3, "patient"), (7.2, 18.8, math.pi / 2, None),
        (-17.5, 18.4, math.pi, "nurse2"), (16.4, -4.6, math.pi, "doctor"), (-25.6, 10.8, -0.4, None),
    ]
    for i, (x, y, h, o) in enumerate(crowd):
        L.human(f"crowd{i}", (x, y, FLOOR), rot_z=h, seed=560 + i, outfit=o)
    L.human("child", (-12.0, 9.6, FLOOR), rot_z=-1.4, seed=580, h=1.15)
    M.iv_pole("iv_walk", (13.15, 8.7, FLOOR))
    # plaza: fountain, people on the benches, bike rack
    L.set_group("static_site")
    A.ring("fountain", M.circle(2.0, 40, -11.0, -13.1), M.circle(1.8, 40, -11.0, -13.1), 0.16, 0.45, "robot_white")
    cyl("fountain_water", 1.82, 0.02, (-11.0, -13.1, 0.5), "sky_blue", verts=40)
    cyl("fountain_bowl", 0.5, 0.5, (-11.0, -13.1, 0.5), "robot_white", verts=24, r2=0.7)
    for k in range(6):
        a = k * math.tau / 6
        cyl(f"fountain_jet{k}", 0.05, 1.2, (-11.0 + math.cos(a) * 1.2, -13.1 + math.sin(a) * 1.2, 0.5), "holo", verts=8, r2=0.02)
    cyl("fountain_jet_c", 0.08, 1.8, (-11.0, -13.1, 1.0), "holo", verts=10, r2=0.03)
    for k, x in enumerate((-18.0, 2.0, 16.0)):
        L.human(f"plaza_sit{k}", (x - 0.4, -12.6, 0.16), rot_z=-math.pi / 2, seed=590 + k, pose="sit")
    box("bike_rack", (3.8, 0.06, 0.06), (-12.0, -19.4, 0.7), "silver", bevel=0)
    for k in range(5):
        M.bicycle(f"bike{k}", (-13.6 + k * 0.8, -20.1, 0.16), rot_z=math.pi / 2, colour=("flower_pink", "lime", "sky_blue", "orange", "flower_purple")[k])


# ---------------------------------------------------------------- floating icons, light, output

def icons():
    """Floating badges over each system, bobbing gently (like the icons in the artwork)."""
    with group("move"):
        for i, (x, y, z, kind) in enumerate(((HUB[0] + 2.4, HUB[1] - 1.0, 6.6, "cross"), (HUB[0] - 2.6, HUB[1] + 1.4, 7.0, "calendar"), (-15.5, 13.0, UP + 3.6, "chart"),
                                             (-8.0, 13.2, UP + 3.8, "pulse"), (12.5, 13.2, UP + 3.8, "heart"), (HX0 + 4.5, 2.6, 4.6, "shield"), (HX1 + 4.0, -3.0, 6.0, "cross"))):
            L.plane(f"icon_{kind}{i}", (1.1, 1.1), (x, y, z), f"screen_icon_{kind}", rot=(math.pi / 2, 0, -math.pi / 4 + math.pi / 2))
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
    sun_data.energy = 5.2
    sun_data.angle = math.radians(1.5)
    sun_data.color = (1.0, 0.9, 0.74)
    sun = bpy.data.objects.new("Sun", sun_data)
    L.COL.objects.link(sun)
    el = math.radians(sun_elev)
    h = Vector((sun_dir[0], sun_dir[1], 0)).normalized()
    to_sun = Vector((h.x * math.cos(el), h.y * math.cos(el), math.sin(el)))
    sun.rotation_euler = (-to_sun).to_track_quat("-Z", "Y").to_euler()
    # panels under the upper floor light the ground-floor bays it covers
    for i, (x0, y0, x1, y1) in enumerate(((HX0, 12.0, -5.0, HY1), (-5.0, 12.0, HX1, HY1), (HX0, HY0, -19.0, 1.0), (HX0, 1.0, -19.0, 12.0))):
        a = bpy.data.lights.new(f"Panel{i}", "AREA")
        a.shape = "RECTANGLE"
        a.size, a.size_y = (x1 - x0) * 0.85, (y1 - y0) * 0.85
        a.energy = 4.5 * (x1 - x0) * (y1 - y0)
        a.color = (1.0, 0.96, 0.9)
        ob = bpy.data.objects.new(f"Panel{i}", a)
        L.COL.objects.link(ob)
        ob.location = ((x0 + x1) / 2, (y0 + y1) / 2, MEZ_Z - 0.1)


ATLASES = {
    "building": ["static_building", "hot:data-analytics", "hot:smart-diagnostics", "hot:patient-care", "hot:hospital-management", "hot:safety-convenience"],
    "site": ["static_site"],
}


def build():
    L.reset_scene()
    site()
    shell()
    mezzanine()
    data_room()
    diagnostics_room()
    ward()
    lab()
    reception()
    hub()
    workstations()
    lounge()
    entrance()
    er_bay()
    life()
    colour_and_brand()
    atrium_extras()
    icons()
    lighting()
    for name, groups in ATLASES.items():
        bpy.context.scene[f"atlas_{name}"] = ",".join(groups)
    bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(BLEND))
    print("objects:", len(bpy.context.scene.objects), "tris:", sum(len(o.data.polygons) for o in bpy.context.scene.objects if o.type == "MESH"))


if __name__ == "__main__":
    build()
