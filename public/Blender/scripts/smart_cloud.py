"""Smart Cloud Services - a cloud campus after the Cloud Services AI artwork.

The hero is the AI Cloud Hub: a round glass drum with GPU racks on its upper floor and, under a ribbed glass dome on
its roof, the artwork's glowing AI brain. Left of it the cloud data centre: a hall with a glass roof over contained
aisles of colourful racks, its generator / chiller / transformer yard behind. Right of it Big Data: a data-lake pool,
a storage silo, giant bar and donut charts and an analytics pavilion. Behind: the contact centre (agents on glass
floors, a giant headset on the roof) and an ERP headquarters with its warehouse, van and truck. In front: the security
& compliance centre at the campus gate and the blockchain pavilion with its ring of chained cubes. A street with
traffic and people runs along the front.

blender -b --factory-startup --python public/Blender/scripts/smart_cloud.py
Coordinates: Z up, metres. The viewer looks in from the front (-Y), a little from the right.
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
import tkc_cloud as Q  # noqa: E402
import tkc_cyber as K  # noqa: E402
import tkc_grid as G  # noqa: E402
import tkc_lib as L  # noqa: E402
import tkc_logi as O  # noqa: E402
import tkc_med as M  # noqa: E402
from tkc_lib import box, cyl, empty, group  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
BLEND = os.path.join(HERE, "..", "smart_cloud.blend")

# ---------------------------------------------------------------- layout
BASE = (44.0, 33.0)
G0 = 0.16
ROAD_Y = -27.0  # front road; sidewalk y -23 .. -19
FENCE_Y = -17.6
GATE = (-27.0, -21.0)  # vehicle gate in the fence
SEC = (-40.0, -17.2, -30.0, -10.8)  # security & compliance centre
DC = (-42.0, -6.0, -16.0, 14.0)  # data centre hall
DC_H = 7.0
YARD = (-42.0, 17.0, -18.0, 30.0)  # generators, chillers, transformers
HUB = (0.0, 2.0)  # AI cloud hub centre
HUB_R = 9.0
HUB_FL = 4.2  # upper floor
HUB_TOP = 8.2  # roof slab top
LAKE = (18.0, -6.0, 34.0, 0.0)  # data-lake pool
SILO = (38.5, 6.0)
PAV = (17.5, 9.0, 30.5, 14.0)  # analytics pavilion
CC = (-10.0, 17.0, 10.0, 29.0)  # contact centre
CC_FL = 3.8
ERP = (22.0, 23.5)  # ERP tower centre
WH = (32.0, 18.0, 43.0, 30.0)  # ERP warehouse
CHAIN = (26.0, -17.0, 38.0, -11.0)  # blockchain pavilion


def rect(x0, y0, x1, y1):
    return [(x0, y0), (x1, y0), (x1, y1), (x0, y1)]


def racetrack(x0, y0, x1, y1, r):
    return A.fillet_poly(rect(x0, y0, x1, y1), r, 6)


def pad(name, x0, y0, x1, y1, mat, top=G0 + 0.02):
    box(name, (x1 - x0, y1 - y0, top - G0), ((x0 + x1) / 2, (y0 + y1) / 2, G0), mat, bevel=0)


def mullion_line(name, a, b, z0, h, spacing=2.2, mat="white"):
    """Mullions along a glass line, cut into storey-high pieces so they bake vertex-lit."""
    (x0, y0), (x1, y1) = a, b
    ln = math.hypot(x1 - x0, y1 - y0)
    ang = math.atan2(y1 - y0, x1 - x0)
    n = max(1, round(ln / spacing))
    pieces = max(1, round(h / 3.2))
    for k in range(n + 1):
        x, y = x0 + (x1 - x0) * k / n, y0 + (y1 - y0) * k / n
        for j in range(pieces):
            box(f"{name}{k}_{j}", (0.1, 0.16, h / pieces), (x, y, z0 + j * h / pieces), mat, bevel=0, rot=(0, 0, ang))


def glass_box(name, x0, y0, x1, y1, z0, h, solid=("back",), frame="white", roof="hosp_white", led="led_cyan"):
    """Pavilion: slab, glass walls with storey mullions (solid walls on the sides named in `solid`), a roof slab
    with a lit edge."""
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    box(f"{name}_slab", (x1 - x0 + 0.4, y1 - y0 + 0.4, 0.3), (cx, cy, z0 - 0.3 + 0.14), "hosp_white", bevel=0.03)
    sides = {"front": ((x0, y0), (x1, y0)), "back": ((x0, y1), (x1, y1)), "left": ((x0, y0), (x0, y1)), "right": ((x1, y0), (x1, y1))}
    for side, (a, b) in sides.items():
        ln = math.hypot(b[0] - a[0], b[1] - a[1])
        along_x = abs(b[1] - a[1]) < 1e-6
        size = (ln, 0.3, h) if along_x else (0.3, ln, h)
        c = ((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, z0 + 0.14)
        if side in solid:
            box(f"{name}_{side}", size, c, "offwhite", bevel=0.02)
        else:
            gs = (ln, 0.04, h) if along_x else (0.04, ln, h)
            box(f"{name}_{side}_glass", gs, c, "glass", bevel=0)
            mullion_line(f"{name}_{side}_m", a, b, z0 + 0.14, h, mat=frame)
    box(f"{name}_roof", (x1 - x0 + 0.8, y1 - y0 + 0.8, 0.45), (cx, cy, z0 + 0.14 + h), roof, bevel=0.04)
    box(f"{name}_roof_led", (x1 - x0 + 0.82, 0.04, 0.06), (cx, y0 - 0.42, z0 + 0.14 + h + 0.2), led, bevel=0)
    A.downlights(f"{name}_dl", rect(x0 + 0.8, y0 + 0.8, x1 - 0.8, y1 - 0.8), z0 + 0.12 + h, spacing=2.6, mat="led_white")


# ---------------------------------------------------------------- site

def site():
    L.set_group("static_site")
    A.solid("plinth", A.outline(A.rect_poly(0, 0, 2 * BASE[0], 2 * BASE[1]), 2.0), -2.0, 2.0, "hosp_white", bevel=0.15)
    box("road", (2 * BASE[0], 8, 0.02), (0, ROAD_Y, 0), "asphalt", bevel=0)
    for i in range(13):
        box(f"dash{i}", (2.4, 0.15, 0.005), (-37 + i * 6.2, ROAD_Y, 0.02), "paint_white", bevel=0)
    for i in range(8):
        box(f"zebra{i}", (0.55, 5.0, 0.005), (2.0 + i * 1.1, ROAD_Y, 0.021), "paint_white", bevel=0)
    box("sidewalk_far", (2 * BASE[0], 2.0, 0.16), (0, -32.0, 0), "paving", bevel=0.03)
    box("sidewalk", (2 * BASE[0], 4.0, 0.16), (0, -21.0, 0), "paving", bevel=0.03)
    box("grounds", (2 * BASE[0] - 0.6, 52.0, 0.16), (0, 7.0, 0), "lawn", bevel=0.03)
    # campus surfaces (none overlap)
    pad("gate_apron", GATE[0], -23.0, GATE[1], -19.0, "asphalt", top=G0 + 0.03)
    pad("drive", GATE[0], -19.0, GATE[1], DC[1] - 4.0, "asphalt")
    pad("forecourt", -30.0, DC[1] - 4.0, -14.0, DC[1], "asphalt")
    pad("plaza", -14.0, -19.0, 24.0, -9.0, "terrazzo")
    pad("hub_walk", -4.0, -9.0, 4.0, HUB[1] - HUB_R, "terrazzo")
    pad("plaza_right", 24.0, -19.0, 42.6, -10.2, "terrazzo")
    pad("sec_walk", -42.6, -19.0, GATE[0], FENCE_Y - 0.1, "paving", top=G0 + 0.03)
    for i in range(16):
        box(f"plaza_joint{i}", (0.03, 9.6, 0.003), (-12 + i * 2.4, -14.0, G0 + 0.02), "paving_dark", bevel=0)
    # perimeter fence with the vehicle gate; pedestrians come in through the security centre's mantrap
    T.fence("fence_l", [(-BASE[0] + 0.6, FENCE_Y), (SEC[0] - 0.1, FENCE_Y)], h=2.2)
    T.fence("fence_m", [(SEC[2] + 0.1, FENCE_Y), (GATE[0], FENCE_Y)], h=2.2)
    T.fence("fence_r", [(GATE[1], FENCE_Y), (BASE[0] - 0.6, FENCE_Y), (BASE[0] - 0.6, BASE[1] - 1.0)], h=2.2)
    T.fence("fence_w", [(-BASE[0] + 0.6, FENCE_Y), (-BASE[0] + 0.6, BASE[1] - 1.0)], h=2.2)
    rnd = random.Random(1200)
    for k, x in enumerate((-36, -16, -8, 0, 8, 16, 24, 32, 40)):
        A.tree(f"stree{k}", (x, -20.0, G0), h=6.0 + rnd.random(), spread=0.9, seed=1210 + k)
    for k, x in enumerate((-32, -12, 4, 20, 36)):
        L.street_light(f"lamp{k}", (x, -22.6, G0), rot_z=-math.pi / 2, h=6.0)
    for k, x in enumerate((-24, 0, 24)):
        L.street_light(f"lampf{k}", (x, -31.6, G0), rot_z=math.pi / 2, h=6.0)
    for k, (x, y) in enumerate(((-10, -12), (12, -12), (-12, 12), (12, 13), (-14, 30), (14, 31), (-40, -2), (43, -4))):
        A.tree(f"ctree{k}", (x, y, G0), h=6.0 + rnd.random() * 1.5, spread=0.95, seed=1230 + k)
    for k, x in enumerate((-8.0, 8.0)):
        L.bench(f"bench{k}", (x, -15.5, G0), rot_z=0.0)
    for k, x in enumerate((-12.0, -6.0, 6.0, 12.0)):
        L.potted_plant(f"plaza_pot{k}", (x, -9.6, G0 + 0.02), h=1.6, seed=1250 + k, pot="robot_white")


# ---------------------------------------------------------------- security & compliance

def security():
    x0, y0, x1, y1 = SEC
    L.set_group("static_building")
    with group("hot:security-compliance"):
        glass_box("sec", x0, y0, x1, y1, G0, 4.2, solid=("left", "back"))
        # mantrap: two glass doors either side of a short corridor, speed gates, a guard desk
        for k in range(3):
            K.turnstile(f"sec_gate{k}", (x1 - 3.2, y0 + 1.6 + k * 1.2, G0 + 0.14), rot_z=math.pi / 2)
        M.curved_desk("sec_desk", (x0 + 3.0, y0 + 2.2), 0.9, 1.4, math.radians(-160), math.radians(-20), G0 + 0.14)
        L.human("sec_guard", (x0 + 3.0, y0 + 2.9, G0 + 0.14), rot_z=-math.pi / 2, seed=1301, outfit="worker")
        # compliance room: auditors at a table, the ISO / PDPA board on the back wall
        M.screen_at("sec_board", (4.0, 1.8), (x0 + 3.8, y1 - 0.2, G0 + 1.6), -math.pi / 2, "screen_compliance", bezel=0.06)
        box("sec_table", (2.6, 1.2, 0.06), (x0 + 3.8, y1 - 2.4, G0 + 0.86), "woodlight", bevel=0.04)
        box("sec_table_leg", (0.3, 0.8, 0.72), (x0 + 3.8, y1 - 2.4, G0 + 0.14), "silver", bevel=0.01)
        for k, (dx, rz) in enumerate(((-0.9, math.pi / 2), (0.9, math.pi / 2))):
            L.human(f"sec_auditor{k}", (x0 + 3.8 + dx, y1 - 3.3, G0 + 0.14), rot_z=rz, seed=1305 + k, outfit="teacher" if k else None)
        L.text_mesh("sec_name", "SECURITY & COMPLIANCE", ((x0 + x1) / 2, y0 - 0.44, G0 + 4.44), 0.3, 0.03, "accent_blue", resolution=3)
        K.holo_lock("sec_lock", ((x0 + x1) / 2, (y0 + y1) / 2, G0 + 6.4), s=1.5)
        M.disc_ring("sec_ring", 2.6, 2.45, ((x0 + x1) / 2, (y0 + y1) / 2, G0 + 4.8), 0.04, "led_cyan", n=48)
        empty("pin_security-compliance", ((x0 + x1) / 2, (y0 + y1) / 2, G0 + 9.0))
    K.guard_booth("guardhouse", (GATE[1] + 1.8, FENCE_Y + 2.6, G0), rot_z=0.0)
    K.barrier("gate_bar", (GATE[1] - 0.3, FENCE_Y + 0.5, G0), rot_z=math.pi, length=5.6)
    for k, x in enumerate((-BASE[0] + 1.4, GATE[0] - 0.6, 10.0, BASE[0] - 1.4)):
        cyl(f"cam{k}", 0.08, 4.4, (x, FENCE_Y + 0.5, G0), "darkgray", verts=10)
        box(f"cam{k}_head", (0.25, 0.5, 0.25), (x, FENCE_Y + 0.3, G0 + 4.2), "robot_white", bevel=0.04)


# ---------------------------------------------------------------- data centre

def data_centre():
    x0, y0, x1, y1 = DC
    L.set_group("static_building")
    fl = G0 + 0.14
    box("dc_slab", (x1 - x0 + 0.4, y1 - y0 + 0.4, 0.3), ((x0 + x1) / 2, (y0 + y1) / 2, G0 - 0.16), "hosp_white", bevel=0.03)
    box("dc_floor", (x1 - x0, y1 - y0, 0.02), ((x0 + x1) / 2, (y0 + y1) / 2, fl - 0.02), "tile_line", bevel=0)
    for k in range(1, int((x1 - x0) / 0.6)):
        box(f"dc_grid_x{k}", (0.02, y1 - y0, 0.004), (x0 + k * 0.6, (y0 + y1) / 2, fl), "lightgray", bevel=0)
    # walls: solid with louvres on three sides, the front glazed
    h = DC_H
    box("dc_back", (x1 - x0 + 0.5, 0.5, h), ((x0 + x1) / 2, y1 + 0.25, fl), "offwhite", bevel=0.02)
    box("dc_left", (0.5, y1 - y0, h), (x0 - 0.25, (y0 + y1) / 2, fl), "offwhite", bevel=0.02)
    box("dc_right", (0.5, y1 - y0, h), (x1 + 0.25, (y0 + y1) / 2, fl), "offwhite", bevel=0.02)
    for k in range(6):
        box(f"dc_louvre{k}", (0.06, 2.4, 1.4), (x1 + 0.52, y0 + 2.5 + k * 3.0, fl + 4.2), "panel_grey", bevel=0.01)
    box("dc_front_glass", (x1 - x0, 0.04, h), ((x0 + x1) / 2, y0, fl), "glass", bevel=0)
    mullion_line("dc_mull", (x0, y0 - 0.06), (x1, y0 - 0.06), fl, h)
    box("dc_transom", (x1 - x0, 0.16, 0.14), ((x0 + x1) / 2, y0 - 0.06, fl + 3.5), "white", bevel=0)
    for k, s in enumerate((-1, 1)):
        box(f"dc_door{k}", (1.3, 0.05, 2.6), (-23.0 + s * 0.7, y0 - 0.12, fl), "glass", bevel=0)
    # glass roof on a grid of beams (in pieces) and a fascia with the centre's name
    box("dc_roof_glass", (x1 - x0, y1 - y0, 0.06), ((x0 + x1) / 2, (y0 + y1) / 2, fl + h), "glass", bevel=0)
    beams = []
    for k in range(int((x1 - x0) / 3.25) + 1):
        x = x0 + k * (x1 - x0) / int((x1 - x0) / 3.25)
        beams += C.split([(x, y0, fl + h - 0.2), (x, y1, fl + h - 0.2)], 2.5)
    for k in range(int((y1 - y0) / 5) + 1):
        y = y0 + k * (y1 - y0) / int((y1 - y0) / 5)
        beams += C.split([(x0, y, fl + h - 0.25), (x1, y, fl + h - 0.25)], 2.5)
    C.tubes("dc_beams", [(a, b, 0.14) for a, b in beams], "white", verts=8)
    A.ring("dc_parapet", A.outline(rect(x0 - 0.5, y0 - 0.5, x1 + 0.5, y1 + 0.5), 0.0), A.outline(rect(x0, y0, x1, y1), 0.0), fl + h, 0.6, "white")
    box("dc_fascia_led", (x1 - x0 + 1.02, 0.04, 0.06), ((x0 + x1) / 2, y0 - 0.52, fl + h + 0.12), "led_cyan", bevel=0)
    L.text_mesh("dc_name", "TKC CLOUD DATA CENTER", ((x0 + x1) / 2, y0 - 0.53, fl + h + 0.2), 0.34, 0.03, "accent_blue", resolution=3)
    with group("hot:data-center"):
        for a, y in enumerate((-0.6, 4.6, 9.8)):
            Q.rack_aisle(f"aisle{a}", x0 + 2.0, y, 22, fl)
        for k, y in enumerate((-1.0, 3.6, 8.2, 12.6)):
            box(f"crah{k}", (0.9, 1.8, 2.2), (x1 - 0.6, y, fl), "panel_grey", bevel=0.03)
            box(f"crah{k}_grille", (0.02, 1.5, 0.9), (x1 - 1.06, y, fl + 1.0), "frame_dark", bevel=0)
            box(f"crah{k}_led", (0.02, 0.3, 0.06), (x1 - 1.06, y, fl + 2.0), "led_green", bevel=0)
        # NOC by the front glass: three operators facing a wall of status screens
        K.video_wall("noc_wall", x0 + 1.0, x0 + 9.0, y0 + 2.6, fl + 1.2, 1.8, ("screen_noc", "screen_noc", "screen_noc"), face=-math.pi / 2)
        for k in range(3):
            M.workstation(f"noc_ws{k}", (x0 + 2.4 + k * 2.6, y0 + 1.0, fl), rot_z=0.0, screens=("screen_noc", "screen_monitor"), seed=1400 + k, outfit=(None, "teacher", None)[k])
        L.human("dc_tech", (x1 - 3.0, 2.0, fl), rot_z=math.pi, seed=1410, outfit="worker")
        box("dc_cart", (0.8, 0.5, 0.9), (x1 - 3.0, 1.2, fl), "silver", bevel=0.03)
        empty("pin_data-center", ((x0 + x1) / 2, (y0 + y1) / 2, fl + h + 3.4))


def dc_yard():
    x0, y0, x1, y1 = YARD
    L.set_group("static_site")
    pad("yard", x0, y0, x1, y1, "concrete")
    T.fence("yard_fence", [(x1, y0 + 4.0), (x1, y0), (x0 + 0.3, y0), (x0 + 0.3, y1), (x1, y1), (x1, y0 + 7.0)], h=2.4)
    for k in range(3):
        K.generator(f"genset{k}", (x0 + 4.0 + k * 6.0, y0 + 3.4, G0 + 0.02), rot_z=0.0)
    for k in range(2):
        cyl(f"fuel{k}", 1.2, 7.0, (x0 + 3.0 + k * 3.0, y1 - 3.0, G0 + 1.4), "robot_white", verts=24, rot=(math.pi / 2, 0, 0), bevel=0.06)
        for s in (-2.4, 2.4):
            box(f"fuel{k}_saddle{s}", (1.6, 0.4, 1.2), (x0 + 3.0 + k * 3.0, y1 - 6.5 + s + 3.5, G0 + 0.02), "concrete", bevel=0.02)
    for k in range(4):
        K.chiller(f"chiller{k}", (x0 + 11.5 + (k % 2) * 4.6, y1 - 7.0 + (k // 2) * 4.2, G0 + 0.02), rot_z=math.pi / 2, fans=3)
    for k in range(2):
        G.power_transformer(f"dctx{k}", (x1 - 3.2, y0 + 3.6 + k * 6.0, G0 + 0.02), rot_z=math.pi / 2, s=0.6)


# ---------------------------------------------------------------- AI cloud hub

def ai_hub():
    cx, cy = HUB
    r = HUB_R
    L.set_group("static_building")
    fl = G0 + 0.14
    ring = M.circle(r, 48, cx, cy)
    A.solid("hub_slab", M.circle(r + 0.6, 48, cx, cy), G0 - 0.16, 0.3, "hosp_white")
    A.solid("hub_floor", M.circle(r - 0.05, 48, cx, cy), fl - 0.02, 0.02, "cyber_floor")
    K.glass_skin("hub_skin", ring, fl, HUB_TOP - fl - 0.4)
    A.ring("hub_mid", M.circle(r + 0.35, 48, cx, cy), M.circle(r - 2.6, 48, cx, cy), HUB_FL - 0.3, 0.3, "white")
    A.ring("hub_mid_led", M.circle(r + 0.37, 48, cx, cy), M.circle(r + 0.3, 48, cx, cy), HUB_FL - 0.18, 0.06, "led_cyan")
    A.solid("hub_roof", M.circle(r + 0.6, 48, cx, cy), HUB_TOP - 0.5, 0.5, "white", bevel=0.05)
    A.ring("hub_roof_led", M.circle(r + 0.62, 48, cx, cy), M.circle(r + 0.55, 48, cx, cy), HUB_TOP - 0.3, 0.06, "led_cyan")
    for k in range(8):  # slender columns inside the glass
        a = k * math.tau / 8 + math.pi / 8
        cyl(f"hub_col{k}", 0.25, HUB_TOP - fl - 0.5, (cx + math.cos(a) * (r - 1.2), cy + math.sin(a) * (r - 1.2), fl), "white", verts=16)
    # entrance canopy facing the plaza, the hub's name
    box("hub_canopy", (6.0, 3.0, 0.3), (cx, cy - r - 1.0, fl + 3.4), "white", bevel=0.04)
    box("hub_canopy_led", (6.02, 0.04, 0.06), (cx, cy - r - 2.52, fl + 3.5), "led_cyan", bevel=0)
    L.text_mesh("hub_name", "TKC AI CLOUD HUB", (cx, cy - r - 2.55, fl + 3.75), 0.42, 0.03, "accent_blue", resolution=3)
    for k, s in enumerate((-1, 1)):
        box(f"hub_door{k}", (1.4, 0.05, 2.7), (cx + s * 0.75, cy - r + 0.05, fl), "glass", bevel=0)
    with group("hot:ai-services"):
        # ground floor: AI experience - a robot host, AI demo stations, a curved screen of models at the back
        M.humanoid_robot("hub_robot", (cx - 1.2, cy - r + 3.0, fl), rot_z=-math.pi / 2)  # greets visitors at the door
        for k in range(4):
            a = math.radians(-150 + k * 40)
            M.workstation(f"hub_ws{k}", (cx + math.cos(a) * 5.6, cy + math.sin(a) * 5.6, fl), rot_z=a - math.pi / 2,
                          screens=("screen_ai", "screen_monitor"), seed=1500 + k, outfit=(None, "teacher", "doctor2", None)[k])
        for k in range(3):
            a = math.radians(60 + k * 30)
            M.screen_at(f"hub_wall{k}", (3.6, 2.2), (cx + math.cos(a) * (r - 0.6), cy + math.sin(a) * (r - 0.6), fl + 1.6), a + math.pi, "screen_ai", bezel=0.05)
        # upper floor: a ring of GPU racks for model training
        for k in range(14):
            a = k * math.tau / 14
            Q.rack(f"gpu{k}", (cx + math.cos(a) * (r - 1.8), cy + math.sin(a) * (r - 1.8), HUB_FL), a + math.pi / 2, screen="screen_rackfront")
        A.solid("hub_upper", M.circle(r - 2.6, 48, cx, cy), HUB_FL - 0.3, 0.02, "cyber_floor")
        # roof: the dome and its brain
        Q.dome("hub_dome", (cx, cy, HUB_TOP), 7.2)
        empty("pin_ai-services", (cx, cy, HUB_TOP + 9.8))
    Q.brain_hologram("hub_brain", (cx, cy, HUB_TOP + 3.4), size=7.0)


# ---------------------------------------------------------------- big data

def big_data():
    L.set_group("static_campus")
    x0, y0, x1, y1 = LAKE
    with group("hot:big-data"):
        A.ring("lake_rim", A.outline(rect(x0 - 0.3, y0 - 0.3, x1 + 0.3, y1 + 0.3), 0.0), A.outline(rect(x0, y0, x1, y1), 0.0), G0, 0.4, "robot_white")
        box("lake_water", (x1 - x0, y1 - y0, 0.26), ((x0 + x1) / 2, (y0 + y1) / 2, G0), "tile_blue", bevel=0)
        for s, y in ((-1, y0 - 0.32), (1, y1 + 0.32)):
            box(f"lake_led{s}", (x1 - x0 + 0.6, 0.04, 0.05), ((x0 + x1) / 2, y, G0 + 0.36), "led_cyan", bevel=0)
        for k in range(5):  # data streams: lit lines running along the lake bed into the silo
            box(f"lake_stream{k}", (x1 - x0 - 1.0, 0.08, 0.02), ((x0 + x1) / 2, y0 + 0.8 + k * 1.1, G0 + 0.27), "led_blue" if k % 2 else "led_cyan", bevel=0)
        Q.data_silo("silo", (SILO[0], SILO[1], G0), r=3.0, h=18.0)
        Q.bar_sculpture("bars", (22.6, 4.8, G0), rot_z=0.0)
        Q.donut_sculpture("donut", (31.4, 3.6, G0), r=2.4)
        px0, py0, px1, py1 = PAV
        glass_box("pav", px0, py0, px1, py1, G0, 4.0, solid=("back", "right"))
        K.video_wall("pav_wall", px0 + 1.0, px1 - 1.5, py1 - 0.4, G0 + 1.2, 2.2, ("screen_bigdata", "screen_bigdata2", "screen_bigdata"), face=-math.pi / 2)
        for k in range(3):
            M.workstation(f"pav_ws{k}", (px0 + 2.6 + k * 3.4, py0 + 2.2, G0 + 0.14), rot_z=0.0, screens=("screen_bigdata2", "screen_monitor"), seed=1600 + k, outfit=("teacher", None, "doctor2")[k])
        L.text_mesh("pav_name", "BIG DATA ANALYTICS", ((px0 + px1) / 2, py0 - 0.44, G0 + 4.36), 0.3, 0.03, "accent_blue", resolution=3)
        empty("pin_big-data", (26.0, 3.0, 14.5))


# ---------------------------------------------------------------- contact centre and ERP

def contact_centre():
    x0, y0, x1, y1 = CC
    L.set_group("static_tower")
    n = 3
    top = G0 + n * CC_FL
    box("cc_core", (x1 - x0 - 0.4, 2.4, top - G0), ((x0 + x1) / 2, y1 - 1.4, G0), "offwhite", bevel=0.03)
    for side, xx in (("l", x0), ("r", x1)):
        box(f"cc_side{side}", (0.4, y1 - y0, top - G0), (xx, (y0 + y1) / 2, G0), "offwhite", bevel=0.02)
    for f in range(n + 1):
        z = G0 + f * CC_FL
        box(f"cc_slab{f}", (x1 - x0 + 0.6, y1 - y0 + 0.4, 0.32), ((x0 + x1) / 2, (y0 + y1) / 2, z - 0.16), "white", bevel=0.03)
        if f < n:
            box(f"cc_glass{f}", (x1 - x0 - 0.4, 0.04, CC_FL - 0.32), ((x0 + x1) / 2, y0 - 0.1, z + 0.16), "glass", bevel=0)
            mullion_line(f"cc_mull{f}_", (x0 + 0.2, y0 - 0.16), (x1 - 0.2, y0 - 0.16), z + 0.16, CC_FL - 0.32, spacing=2.5)
            box(f"cc_led{f}", (x1 - x0 + 0.62, 0.04, 0.05), ((x0 + x1) / 2, y0 - 0.22, z + 0.06), "led_cyan", bevel=0)
            A.downlights(f"cc_dl{f}", rect(x0 + 1, y0 + 1, x1 - 1, y1 - 3), z + CC_FL - 0.18, spacing=3.0, mat="led_white")
    with group("hot:call-center"):
        for f in range(n):
            z = G0 + f * CC_FL + 0.16
            if f == 0:  # lobby: reception, a chatbot kiosk
                M.curved_desk("cc_reception", ((x0 + x1) / 2, y0 + 3.2), 1.6, 2.2, math.radians(200), math.radians(340), z)
                M.kiosk("cc_kiosk", (x0 + 3.0, y0 + 2.0, z), face=-math.pi / 2, screen="screen_crm")
                continue
            for row in range(2):
                for k in range(6):
                    M.workstation(f"cc_ws{f}{row}{k}", (x0 + 2.4 + k * 3.0, y0 + 2.4 + row * 2.6, z), rot_z=0.0,
                                  screens=("screen_crm", "screen_monitor"), seed=1700 + f * 20 + row * 8 + k, outfit=(None, "teacher", "doctor2", None, "student", None)[k])
            M.screen_at(f"cc_board{f}", (5.0, 1.6), ((x0 + x1) / 2, y1 - 2.65, z + 1.6), -math.pi / 2, "screen_crm", bezel=0.05)
        Q.headset("cc_headset", ((x0 + x1) / 2, (y0 + y1) / 2 - 1.0, top + 2.4), s=2.6)
        for s in (-1, 1):
            box(f"cc_headset_post{s}", (0.3, 0.3, 1.6), ((x0 + x1) / 2 + s * 2.65, (y0 + y1) / 2 - 1.0, top + 0.16), "robot_white", bevel=0.03)
        L.text_mesh("cc_name", "CLOUD CONTACT CENTER", ((x0 + x1) / 2, y0 - 0.36, top + 0.2), 0.42, 0.03, "accent_blue", resolution=3)
        empty("pin_call-center", ((x0 + x1) / 2, (y0 + y1) / 2, top + 7.0))
    box("cc_parapet", (x1 - x0 + 0.6, y1 - y0 + 0.4, 0.6), ((x0 + x1) / 2, (y0 + y1) / 2, top + 0.16), "white", bevel=0.03)


def erp():
    L.set_group("static_tower")
    x, y = ERP
    with group("hot:erp"):
        A.office_tower("erp_tower", x, y, 12.0, 9.0, 28.0, glass="tower_glass", frame="tower_frame", seed=17, mast=False, style=1)
        M.screen_at("erp_board", (5.0, 2.6), (x, y - 6.6, G0 + 2.6), -math.pi / 2, "screen_erp", bezel=0.08, depth=0.2)
        for s in (-1, 1):
            box(f"erp_board_leg{s}", (0.2, 0.2, 1.4), (x + s * 2.2, y - 6.55, G0), "robot_white", bevel=0.02)
        L.text_mesh("erp_name", "ERP ON CLOUD", (x, y - 6.75, G0 + 4.2), 0.36, 0.03, "accent_blue", resolution=3)
        # the warehouse the ERP runs: dock doors, the artwork's white van, a truck at the dock
        wx0, wy0, wx1, wy1 = WH
        box("wh_body", (wx1 - wx0, wy1 - wy0, 7.0), ((wx0 + wx1) / 2, (wy0 + wy1) / 2, G0), "panel_grey", bevel=0.03)
        box("wh_roof", (wx1 - wx0 + 0.4, wy1 - wy0 + 0.4, 0.3), ((wx0 + wx1) / 2, (wy0 + wy1) / 2, G0 + 7.0), "white", bevel=0.03)
        box("wh_band", (wx1 - wx0 + 0.02, 0.04, 0.7), ((wx0 + wx1) / 2, wy0 - 0.02, G0 + 5.6), "accent_blue", bevel=0)
        for k in range(2):
            box(f"wh_door{k}", (3.0, 0.06, 3.6), (wx0 + 3.0 + k * 4.6, wy0 - 0.03, G0), "darkgray", bevel=0.01)
            box(f"wh_bump{k}", (3.4, 0.4, 1.1), (wx0 + 3.0 + k * 4.6, wy0 - 0.2, G0), "hazard_black", bevel=0.02)
        L.text_mesh("wh_name", "SMART WAREHOUSE", ((wx0 + wx1) / 2, wy0 - 0.06, G0 + 5.75), 0.38, 0.03, "white", resolution=3)
        L.van("wh_van", (wx0 + 3.0, wy0 - 3.8, G0 + 0.02), rot_z=math.pi / 2, paint="white")
        O.box_truck("wh_truck", (wx0 + 7.6, wy0 - 5.0, G0 + 0.02), rot_z=math.pi / 2, paint="truck_teal", text="TKC CLOUD")
        empty("pin_erp", (x, y, 32.0))
    L.set_group("static_site")
    pad("wh_apron", WH[0], 9.0, WH[2] - 0.3, WH[1], "asphalt")


# ---------------------------------------------------------------- blockchain

def blockchain():
    x0, y0, x1, y1 = CHAIN
    L.set_group("static_campus")
    with group("hot:blockchain"):
        glass_box("chain", x0, y0, x1, y1, G0, 4.2, solid=("back",), led="led_pink")
        for k in range(6):  # ledger nodes: a short row of racks
            Q.rack(f"node{k}", (x0 + 4.0 + k * 0.68, y1 - 1.0, G0 + 0.14), 0.0, screen="screen_chain")
        M.kiosk("chain_kiosk", (x0 + 2.0, y0 + 1.8, G0 + 0.14), face=-math.pi / 2, screen="screen_chain")
        M.screen_at("chain_wall", (3.2, 1.6), (x1 - 2.4, y1 - 0.2, G0 + 1.8), -math.pi / 2, "screen_chain", bezel=0.05)
        for k, (dx, dy, rz) in enumerate(((2.6, 2.4, 0.4), (9.0, 2.2, 2.6))):
            L.human(f"chain_p{k}", (x0 + dx, y0 + dy, G0 + 0.14), rot_z=rz, seed=1800 + k, outfit=(None, "teacher")[k])
        L.text_mesh("chain_name", "BLOCKCHAIN LAB", ((x0 + x1) / 2, y0 - 0.44, G0 + 4.56), 0.3, 0.03, "accent_blue", resolution=3)
        for k in range(4):
            cyl(f"chain_post{k}", 0.06, 3.0, ((x0 + x1) / 2 + (k - 1.5) * 1.2, (y0 + y1) / 2, G0 + 4.6), "silver", verts=8)
        empty("pin_blockchain", ((x0 + x1) / 2, (y0 + y1) / 2, 12.5))
    Q.chain_cubes("chain_holo", ((x0 + x1) / 2, (y0 + y1) / 2, G0 + 8.4), r=2.6)


# ---------------------------------------------------------------- life

def life():
    loops = [
        (racetrack(-40.0, -32.6, 40.0, -31.4, 0.5), 3, 1.25, (None, None, None), G0),
        (racetrack(-40.0, -21.8, 40.0, -20.6, 0.5), 4, 1.3, (None, "teacher", None, None), G0),
        (racetrack(-12.0, -16.4, 22.0, -14.0, 0.8), 3, 1.0, ("teacher", None, "doctor2"), G0 + 0.02),
        (racetrack(-29.0, -9.6, -15.0, -8.4, 0.4), 1, 0.9, ("worker",), G0 + 0.02),
        (racetrack(26.0, -10.0, 41.0, -9.0, 0.4), 1, 1.0, (None,), G0 + 0.02),
    ]
    n = 0
    for path, count, speed, outfits, z in loops:
        length = L.path_length(path, True)
        for j in range(count):
            L.walker(f"walker{n}", path, speed, (j + 0.3) * length / count, seed=1900 + n, z=z, outfit=outfits[j])
            n += 1
    v, half = 7.0, BASE[0] + 8.0
    for i, (lane_y, sign) in enumerate(((ROAD_Y + 1.8, 1), (ROAD_Y - 1.8, -1))):
        lane = [(-sign * half, lane_y), (sign * half, lane_y)]
        for j in range(2):
            L.driver(f"car{i}{j}", lane, v, j * half + i * 13.0, closed=False, paint=(("white", "navy"), ("sky_blue", "silver"))[i][j], kind=("car", "van")[j])


def icons():
    cx, cy = HUB
    with group("move"):
        spots = ((cx - 9, cy - 3, 15.0, "cloud"), (cx + 9, cy - 2, 14.0, "brain"), (-29.0, 4.0, 11.5, "server"), (26.0, 4.8, 16.0, "chart"),
                 (0.0, 23.0, 18.5, "headset"), (22.0, 16.5, 31.0, "erp"), (32.0, -14.0, 14.0, "chain"), (-35.0, -14.0, 10.5, "shield"))
        for i, (x, y, z, kind) in enumerate(spots):
            L.plane(f"icon_{kind}{i}", (1.3, 1.3), (x, y, z), f"screen_icon_{kind}", rot=(math.pi / 2, 0, math.pi))
            bpy.data.objects[f"icon_{kind}{i}"]["bob"] = i * 0.9


def lighting(sun_elev=42, sun_dir=(0.55, -0.83)):
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
    sun_data.color = (1.0, 0.92, 0.78)
    sun = bpy.data.objects.new("Sun", sun_data)
    L.COL.objects.link(sun)
    el = math.radians(sun_elev)
    h = Vector((sun_dir[0], sun_dir[1], 0)).normalized()
    to_sun = Vector((h.x * math.cos(el), h.y * math.cos(el), math.sin(el)))
    sun.rotation_euler = (-to_sun).to_track_quat("-Z", "Y").to_euler()
    cx, cy = HUB
    panels = (
        (SEC[0], SEC[1], SEC[2], SEC[3], G0 + 4.2),
        (CHAIN[0], CHAIN[1], CHAIN[2], CHAIN[3], G0 + 4.2),
        (PAV[0], PAV[1], PAV[2], PAV[3], G0 + 4.0),
        (cx - 6, cy - 6, cx + 6, cy + 6, HUB_FL - 0.4),
        (cx - 6, cy - 6, cx + 6, cy + 6, HUB_TOP - 0.6),
        (CC[0], CC[1], CC[2], CC[3] - 3, G0 + CC_FL - 0.3),
        (CC[0], CC[1], CC[2], CC[3] - 3, G0 + 2 * CC_FL - 0.3),
        (CC[0], CC[1], CC[2], CC[3] - 3, G0 + 3 * CC_FL - 0.3),
    )
    for i, (x0, y0, x1, y1, z) in enumerate(panels):
        a = bpy.data.lights.new(f"Panel{i}", "AREA")
        a.shape = "RECTANGLE"
        a.size, a.size_y = (x1 - x0) * 0.85, (y1 - y0) * 0.85
        a.energy = 3.0 * (x1 - x0) * (y1 - y0)
        a.color = (1.0, 0.97, 0.92)
        ob = bpy.data.objects.new(f"Panel{i}", a)
        L.COL.objects.link(ob)
        ob.location = ((x0 + x1) / 2, (y0 + y1) / 2, z)


ATLASES = {
    "building": ["static_building", "hot:data-center", "hot:ai-services", "hot:security-compliance"],
    "campus": ["static_campus", "hot:big-data", "hot:blockchain"],
    "tower": ["static_tower", "hot:erp", "hot:call-center"],
    "site": ["static_site"],
}


def build():
    L.reset_scene()
    site()
    security()
    data_centre()
    dc_yard()
    ai_hub()
    big_data()
    contact_centre()
    erp()
    blockchain()
    life()
    icons()
    lighting()
    for name, groups in ATLASES.items():
        bpy.context.scene[f"atlas_{name}"] = ",".join(groups)
    bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(BLEND))
    print("objects:", len(bpy.context.scene.objects), "tris:", sum(len(o.data.polygons) for o in bpy.context.scene.objects if o.type == "MESH"))


if __name__ == "__main__":
    build()
