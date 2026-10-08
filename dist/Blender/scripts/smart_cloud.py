"""Smart Cloud Services v2 - "TKC Cloud Nexus", a hub-and-spoke cloud campus after the Cloud Services AI artwork.

The composition follows a network topology. On the central axis stands the AI Nexus: a glass drum (GPU racks, AI
lab) from which a slender tower rises to a glass sphere holding the artwork's glowing AI brain, ringed by orbiting
service icons. Round it, a reflecting pool ring and, 7.8 m up, the Sky Ring: a lit circular walkway on V-columns whose
skybridges (the spokes) run to the data centre (left), the Big Data building with its giant charts on the roof
terrace (right) and the crescent contact centre that wraps the back. Behind stand the ERP tower and the data silo;
in front, the gate arch on the axis, twin reflecting pools, and the security & compliance and blockchain pavilions
flanking it. Lit lines in the plaza run from the hub out to every building.

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
HUB = (0.0, 4.0)  # AI Nexus centre
POD_R, POD_H = 8.0, 5.0  # glass drum at the foot of the tower
CORE_R, CORE_TOP = 3.2, 26.0
SPHERE_R = 6.5
SPHERE_Z = CORE_TOP + SPHERE_R
POOL = (9.6, 12.8)  # reflecting pool ring (radii)
RING = (14.6, 17.6)  # sky ring (radii)
DECK = G0 + 2 * 3.8  # sky ring / bridge / third-floor level (7.76)
PLAZA_R = 20.0
CC = (22.0, 27.5, math.radians(52), math.radians(128))  # crescent contact centre: radii and angles
CC_FL = 3.8
DC = (-43.0, -6.0, -22.0, 17.0)  # data centre hall
DC_H = 7.0
YARD = (-43.0, 20.0, -22.0, 31.0)
BD = (21.0, -2.0, 33.0, 10.0)  # Big Data building (roof terrace at DECK)
LAKE = (21.0, -9.6, 41.0, -4.0)
SILO = (38.0, 8.0)
ERP = (31.0, 25.0)
SEC = (-40.0, -17.2, -28.0, -10.8)  # security & compliance pavilion
CHAIN = (28.0, -17.2, 40.0, -10.8)  # blockchain lab (its mirror)
VGATE = (-21.0, -15.0)  # vehicle gate to the data centre


def rect(x0, y0, x1, y1):
    return [(x0, y0), (x1, y0), (x1, y1), (x0, y1)]


def racetrack(x0, y0, x1, y1, r):
    return A.fillet_poly(rect(x0, y0, x1, y1), r, 6)


def polar(r, a, cz=0.0):
    return (HUB[0] + r * math.cos(a), HUB[1] + r * math.sin(a), cz)


def pad(name, x0, y0, x1, y1, mat, top=G0 + 0.02):
    box(name, (x1 - x0, y1 - y0, top - G0), ((x0 + x1) / 2, (y0 + y1) / 2, G0), mat, bevel=0)


def mullion_line(name, a, b, z0, h, spacing=2.2, mat="white"):
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
    """Pavilion: slab, glass walls with storey mullions (solid on the sides named in `solid`), a roof slab with a lit edge."""
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    box(f"{name}_slab", (x1 - x0 + 0.4, y1 - y0 + 0.4, 0.3), (cx, cy, z0 - 0.16), "hosp_white", bevel=0.03)
    sides = {"front": ((x0, y0), (x1, y0)), "back": ((x0, y1), (x1, y1)), "left": ((x0, y0), (x0, y1)), "right": ((x1, y0), (x1, y1))}
    for side, (a, b) in sides.items():
        ln = math.hypot(b[0] - a[0], b[1] - a[1])
        along_x = abs(b[1] - a[1]) < 1e-6
        c = ((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, z0 + 0.14)
        if side in solid:
            box(f"{name}_{side}", (ln, 0.3, h) if along_x else (0.3, ln, h), c, "offwhite", bevel=0.02)
        else:
            box(f"{name}_{side}_glass", (ln, 0.04, h) if along_x else (0.04, ln, h), c, "glass", bevel=0)
            mullion_line(f"{name}_{side}_m", a, b, z0 + 0.14, h, mat=frame)
    box(f"{name}_roof", (x1 - x0 + 0.8, y1 - y0 + 0.8, 0.45), (cx, cy, z0 + 0.14 + h), roof, bevel=0.04)
    box(f"{name}_roof_led", (x1 - x0 + 0.82, 0.04, 0.06), (cx, y0 - 0.42, z0 + 0.14 + h + 0.2), led, bevel=0)
    A.downlights(f"{name}_dl", rect(x0 + 0.8, y0 + 0.8, x1 - 0.8, y1 - 0.8), z0 + 0.12 + h, spacing=2.6, mat="led_white")


# ---------------------------------------------------------------- site and the composition

def site():
    L.set_group("static_site")
    A.solid("plinth", A.outline(A.rect_poly(0, 0, 2 * BASE[0], 2 * BASE[1]), 2.0), -2.0, 2.0, "hosp_white", bevel=0.15)
    box("road", (2 * BASE[0], 8, 0.02), (0, ROAD_Y, 0), "asphalt", bevel=0)
    for i in range(13):
        box(f"dash{i}", (2.4, 0.15, 0.005), (-37 + i * 6.2, ROAD_Y, 0.02), "paint_white", bevel=0)
    for i in range(7):
        box(f"zebra{i}", (0.55, 5.0, 0.005), (-3.3 + i * 1.1, ROAD_Y, 0.021), "paint_white", bevel=0)
    box("sidewalk_far", (2 * BASE[0], 2.0, 0.16), (0, -32.0, 0), "paving", bevel=0.03)
    box("sidewalk", (2 * BASE[0], 4.0, 0.16), (0, -21.0, 0), "paving", bevel=0.03)
    box("grounds", (2 * BASE[0] - 0.6, 52.0, 0.16), (0, 7.0, 0), "lawn", bevel=0.03)
    # the round plaza, the forecourt on the axis, the drive to the data centre (no overlapping pads)
    A.solid("plaza", M.circle(PLAZA_R, 96, HUB[0], HUB[1]), G0, 0.02, "terrazzo")
    pad("forecourt", -16.0, FENCE_Y, 16.0, HUB[1] - PLAZA_R, "terrazzo")
    pad("gate_apron", -4.0, -23.0, 4.0, -19.0, "terrazzo", top=G0 + 0.03)
    pad("axis_walk", -3.0, -19.0, 3.0, FENCE_Y, "terrazzo")
    pad("vgate_apron", VGATE[0], -23.0, VGATE[1], -19.0, "asphalt", top=G0 + 0.03)
    pad("drive", VGATE[0], -19.0, VGATE[1], -10.2, "asphalt", top=G0 + 0.025)  # it crosses the forecourt's corner
    pad("dc_forecourt", -30.0, -10.2, -17.5, DC[1], "asphalt")
    pad("erp_bay", 37.5, 14.0, 43.4, 30.0, "asphalt")
    # lit lines in the plaza from the pool ring out to every building (the spokes of the network)
    for k, deg in enumerate((0, 45, 90, 135, 180, -45, -135)):
        a = math.radians(deg)
        r0, r1 = POOL[1] + 0.4, PLAZA_R - 0.3
        c = polar((r0 + r1) / 2, a)
        box(f"spoke{k}", (r1 - r0, 0.14, 0.012), (c[0], c[1], G0 + 0.02), "led_cyan", bevel=0, rot=(0, 0, a))
    for k, r in enumerate((PLAZA_R - 0.6, POOL[1] + 1.6)):  # two lit circles in the paving
        A.ring(f"plaza_circle{k}", M.circle(r + 0.07, 96, *HUB), M.circle(r - 0.07, 96, *HUB), G0 + 0.02, 0.012, "led_blue")
    for k in range(9):  # axis inlays leading to the hub
        box(f"axis_led{k}", (0.12, 1.6, 0.012), (0.0, FENCE_Y + 1.6 + k * 2.2, G0 + 0.02), "led_cyan", bevel=0)
    # perimeter fence: the gate arch on the axis, the vehicle gate for the data centre
    T.fence("fence_l", [(-BASE[0] + 0.6, FENCE_Y), (SEC[0] - 0.1, FENCE_Y)], h=2.2)
    T.fence("fence_ml", [(SEC[2] + 0.1, FENCE_Y), (VGATE[0], FENCE_Y)], h=2.2)
    T.fence("fence_mm", [(VGATE[1], FENCE_Y), (-4.6, FENCE_Y)], h=2.2)
    T.fence("fence_mr", [(4.6, FENCE_Y), (CHAIN[0] - 0.1, FENCE_Y)], h=2.2)
    T.fence("fence_r", [(CHAIN[2] + 0.1, FENCE_Y), (BASE[0] - 0.6, FENCE_Y), (BASE[0] - 0.6, BASE[1] - 1.0)], h=2.2)
    T.fence("fence_w", [(-BASE[0] + 0.6, FENCE_Y), (-BASE[0] + 0.6, BASE[1] - 1.0)], h=2.2)
    K.guard_booth("guardhouse", (VGATE[1] + 1.8, FENCE_Y + 2.6, G0), rot_z=0.0)
    K.barrier("gate_bar", (VGATE[1] - 0.3, FENCE_Y + 0.5, G0), rot_z=math.pi, length=5.6)
    rnd = random.Random(1200)
    for k, x in enumerate((-36, -28, -12, 12, 20, 36)):
        A.tree(f"stree{k}", (x, -20.0, G0), h=6.0 + rnd.random(), spread=0.9, seed=1210 + k)
    for k, x in enumerate((-32, -8, 8, 32)):
        L.street_light(f"lamp{k}", (x, -22.6, G0), rot_z=-math.pi / 2, h=6.0)
    for k, x in enumerate((-24, 0, 24)):
        L.street_light(f"lampf{k}", (x, -31.6, G0), rot_z=math.pi / 2, h=6.0)
    for k, (x, y) in enumerate(((-17.0, -14.0), (17.0, -14.0), (-19.5, 21.0), (19.5, 20.5), (-14.0, 31.0), (14.0, 31.0), (43.0, -1.0))):
        A.tree(f"ctree{k}", (x, y, G0), h=6.0 + rnd.random() * 1.5, spread=0.85, seed=1230 + k)


def gate_and_pools():
    """The axis: a gate arch with speed gates, twin reflecting pools with fountains of light, light pillars."""
    L.set_group("static_campus")
    for s in (-1, 1):
        box(f"arch_pillar{s}", (0.9, 0.9, 6.2), (s * 4.0, FENCE_Y, G0), "robot_white", bevel=0.06)
        box(f"arch_pillar_led{s}", (0.06, 0.92, 5.4), (s * 4.0 - s * 0.46, FENCE_Y, G0 + 0.4), "led_cyan", bevel=0)
    box("arch_beam", (9.4, 1.0, 1.0), (0.0, FENCE_Y, G0 + 6.2), "robot_white", bevel=0.08)
    box("arch_led", (9.42, 0.04, 0.08), (0.0, FENCE_Y - 0.51, G0 + 6.25), "led_cyan", bevel=0)
    L.text_mesh("arch_name", "TKC CLOUD NEXUS", (0.0, FENCE_Y - 0.53, G0 + 6.45), 0.5, 0.04, "accent_blue", resolution=3)
    for k in range(5):
        K.turnstile(f"gate{k}", (-2.6 + k * 1.3, FENCE_Y, G0), rot_z=math.pi / 2)
    for s in (-1, 1):  # twin pools either side of the axis, LED rims, three light jets each
        x0, x1 = (5.0, 12.5) if s > 0 else (-12.5, -5.0)
        y0, y1 = -15.6, -10.8
        A.ring(f"apool_rim{s}", A.outline(rect(x0 - 0.25, y0 - 0.25, x1 + 0.25, y1 + 0.25), 0.0), A.outline(rect(x0, y0, x1, y1), 0.0), G0, 0.42, "robot_white")
        box(f"apool_water{s}", (x1 - x0, y1 - y0, 0.3), ((x0 + x1) / 2, (y0 + y1) / 2, G0), "tile_blue", bevel=0)
        box(f"apool_led{s}", (x1 - x0 + 0.5, 0.04, 0.05), ((x0 + x1) / 2, y0 - 0.27, G0 + 0.36), "led_cyan", bevel=0)
        for j in range(3):
            cyl(f"apool_jet{s}{j}", 0.08, 1.6 + j * 0.5, (x0 + 1.6 + j * 2.1, (y0 + y1) / 2, G0 + 0.3), "led_cyan", verts=10)
    for s in (-1, 1):  # light pillars along the axis
        for k in range(3):
            y = -9.0 - k * 2.6
            cyl(f"axis_pillar{s}{k}", 0.16, 1.2, (s * 3.6, y, G0 + 0.02), "robot_white", verts=16)
            cyl(f"axis_pillar_led{s}{k}", 0.17, 0.12, (s * 3.6, y, G0 + 1.0), "led_cyan", verts=16)  # a band under the cap


# ---------------------------------------------------------------- the AI Nexus, its pool and the sky ring

def nexus():
    cx, cy = HUB
    fl = G0 + 0.14
    L.set_group("static_building")
    # reflecting pool ring with an opening on the axis for the entrance
    a0, a1 = math.radians(-78), math.radians(258)
    A.solid("pool_water", Q.arc_band(cx, cy, POOL[0], POOL[1], a0, a1, 60), G0, 0.28, "tile_blue")
    for k, (r0, r1) in enumerate(((POOL[0] - 0.3, POOL[0]), (POOL[1], POOL[1] + 0.3))):
        A.solid(f"pool_coping{k}", Q.arc_band(cx, cy, r0, r1, a0 - 0.02, a1 + 0.02, 60), G0, 0.36, "robot_white")
        r = (r0 + r1) / 2 + (-0.18 if k else 0.18)  # on the water side of each coping
        pts = [Vector(polar(r, a0 + (a1 - a0) * i / 60, G0 + 0.33)) for i in range(61)]
        C.tubes(f"pool_led{k}", [(p, q, 0.035) for p, q in zip(pts, pts[1:])], "led_cyan", verts=6)
    for k in range(12):  # lit stepping stones of light in the water
        a = a0 + (a1 - a0) * (k + 0.5) / 12
        p = polar((POOL[0] + POOL[1]) / 2, a)
        cyl(f"pool_light{k}", 0.35, 0.02, (p[0], p[1], G0 + 0.28), "led_blue", verts=16)
    with group("hot:ai-services"):
        # the glass drum: AI lab with a ring of GPU racks, the robot host, demo stations
        A.solid("pod_slab", M.circle(POD_R + 0.5, 64, cx, cy), G0 - 0.16, 0.28, "hosp_white")  # 2 cm under the floor finish
        A.solid("pod_floor", M.circle(POD_R - 0.05, 64, cx, cy), fl - 0.02, 0.02, "cyber_floor")
        K.glass_skin("pod_skin", M.circle(POD_R, 64, cx, cy), fl, POD_H - 0.3)
        A.solid("pod_roof", M.circle(POD_R + 0.7, 64, cx, cy), fl + POD_H - 0.3, 0.45, "white", bevel=0.05)
        A.ring("pod_roof_led", M.circle(POD_R + 0.72, 64, cx, cy), M.circle(POD_R + 0.64, 64, cx, cy), fl + POD_H - 0.15, 0.06, "led_cyan")
        for k in range(16):
            a = math.radians(-40 + k * 260 / 15)  # leaves the entrance (front, -90 deg) clear
            Q.rack(f"gpu{k}", polar(POD_R - 1.6, a, fl), a + math.pi / 2)
        M.humanoid_robot("pod_robot", (cx - 1.4, cy - POD_R + 2.0, fl), rot_z=-math.pi / 2)
        M.kiosk("pod_kiosk", (cx + 1.6, cy - POD_R + 2.2, fl), face=-math.pi / 2, screen="screen_ai")
        for k, s in enumerate((-1, 1)):
            box(f"pod_door{k}", (1.4, 0.05, 2.7), (cx + s * 0.75, cy - POD_R + 0.05, fl), "glass", bevel=0)
        box("pod_canopy", (5.0, 2.6, 0.3), (cx, cy - POD_R - 0.9, fl + 3.3), "white", bevel=0.04)
        L.text_mesh("pod_name", "AI NEXUS", (cx, cy - POD_R - 2.22, fl + 3.42), 0.42, 0.03, "accent_blue", resolution=3)
        box("pod_canopy_led", (5.02, 0.04, 0.06), (cx, cy - POD_R - 2.2, fl + 3.36), "led_cyan", bevel=0)
        # the tower: dark glass core, white fins in storey pieces, slab rings, a lit spiral
        cyl("core", CORE_R, CORE_TOP - fl, (cx, cy, fl), "cyber_glass", verts=40)
        for k in range(1, int((CORE_TOP - fl) / 4.0) + 1):
            cyl(f"core_ring{k}", CORE_R + 0.25, 0.3, (cx, cy, fl + k * 4.0 - 0.15), "white", verts=40, bevel=0.03)
        fins = []
        for k in range(8):
            a = k * math.tau / 8
            for z0 in range(int(fl + POD_H), int(CORE_TOP), 3):
                fins.append((Vector(polar(CORE_R + 0.18, a, z0)), Vector(polar(CORE_R + 0.18, a, min(CORE_TOP, z0 + 3))), 0.12))
        C.tubes("core_fins", fins, "white", verts=6)
        helix = [Vector(polar(CORE_R + 0.32, t * 0.9, fl + POD_H + t * 0.75)) for t in [i * 0.25 for i in range(int((CORE_TOP - fl - POD_H) / 0.75 / 0.25))]]
        C.tubes("core_helix", [(p, q, 0.06) for p, q in zip(helix, helix[1:])], "led_cyan", verts=6)
        # the crown: a cradle and the glass sphere with the brain inside
        cyl("crown_cradle", CORE_R + 0.4, 2.0, (cx, cy, CORE_TOP), "white", verts=48, r2=4.95)  # a cup the sphere sits in
        M.disc_ring("crown_ring", 5.2, 4.95, (cx, cy, CORE_TOP + 1.95), 0.1, "led_cyan", n=64)
        Q.glass_sphere("crown", (cx, cy, SPHERE_Z), SPHERE_R)
        cyl("crown_spire", 0.12, 3.5, (cx, cy, SPHERE_Z + SPHERE_R), "white", verts=10)
        cyl("crown_beacon", 0.22, 0.4, (cx, cy, SPHERE_Z + SPHERE_R + 3.5), "led_cyan", verts=16)
        empty("pin_ai-services", (cx, cy, SPHERE_Z + SPHERE_R + 5.0))
    Q.brain_hologram("nexus_brain", (cx, cy, SPHERE_Z - 1.2), size=8.5)
    Q.icon_orbit("nexus_icons", (cx, cy, CORE_TOP - 6.0), 9.5, ("cloud", "server", "chart", "brain", "headset", "erp", "chain", "shield", "lock", "wifi"))


def sky_ring():
    cx, cy = HUB
    L.set_group("static_building")
    r0, r1 = RING
    out, inn = M.circle(r1, 96, cx, cy), M.circle(r0, 96, cx, cy)
    A.ring("ring_deck", out, inn, DECK - 0.45, 0.45, "white", round_outer=0.12)
    A.ring("ring_fibre", M.circle((r0 + r1) / 2 + 0.06, 96, cx, cy), M.circle((r0 + r1) / 2 - 0.06, 96, cx, cy), DECK, 0.02, "led_blue")
    for k, r in enumerate((r1 - 0.06, r0 + 0.06)):
        A.wall(f"ring_glass{k}", M.circle(r, 96, cx, cy), DECK, 1.1, "glass")
        pts = [Vector(polar(r, i * math.tau / 96, DECK + 1.1)) for i in range(97)]
        C.tubes(f"ring_rail{k}", [(p, q, 0.04) for p, q in zip(pts, pts[1:])], "white", verts=6)
        pts = [Vector(polar(r + (0.05 if k == 0 else -0.05), i * math.tau / 96, DECK - 0.42)) for i in range(97)]
        C.tubes(f"ring_led{k}", [(p, q, 0.05) for p, q in zip(pts, pts[1:])], "led_cyan", verts=6)
    for k in range(8):  # V-columns between the spokes
        a = math.radians(22.5 + k * 45)
        K.v_column(f"ring_col{k}", polar((r0 + r1) / 2, a, G0), DECK - 0.45, spread=1.8, axis=a + math.pi / 2, r=0.26)
    for k, deg in enumerate((-112.0, -68.0)):  # glass lifts up from the plaza, with landings
        a = math.radians(deg)
        K.glass_lift(f"ring_lift{k}", polar(r1 + 1.75, a, G0), DECK + 2.4, r=1.1, car_z=G0 + 0.1 if k else DECK)
        A.solid(f"ring_landing{k}", Q.arc_band(cx, cy, r1 - 0.2, r1 + 0.7, a - 0.06, a + 0.06, 6), DECK - 0.44, 0.45, "white")  # 1 cm over the ring deck
    # the spokes: skybridges to the data centre, Big Data and the contact centre
    Q.skybridge("bridge_dc", polar(r1 - 0.2, math.pi), (DC[2] + 0.2, HUB[1]), DECK)
    Q.skybridge("bridge_bd", polar(r1 - 0.2, 0.0), (BD[0] + 0.2, HUB[1]), DECK)
    Q.skybridge("bridge_cc", polar(r1 - 0.2, math.pi / 2), polar(CC[0] + 0.2, math.pi / 2), DECK)


# ---------------------------------------------------------------- the spokes' buildings

def data_centre():
    x0, y0, x1, y1 = DC
    L.set_group("static_building")
    fl = G0 + 0.14
    h = DC_H
    box("dc_slab", (x1 - x0 + 0.4, y1 - y0 + 0.4, 0.28), ((x0 + x1) / 2, (y0 + y1) / 2, G0 - 0.16), "hosp_white", bevel=0.03)
    box("dc_floor", (x1 - x0, y1 - y0, 0.02), ((x0 + x1) / 2, (y0 + y1) / 2, fl - 0.02), "tile_line", bevel=0)
    box("dc_back", (x1 - x0 + 0.5, 0.5, h), ((x0 + x1) / 2, y1 + 0.25, fl), "offwhite", bevel=0.02)
    box("dc_left", (0.5, y1 - y0, h), (x0 - 0.25, (y0 + y1) / 2, fl), "offwhite", bevel=0.02)
    box("dc_right", (0.5, y1 - y0, h), (x1 + 0.25, (y0 + y1) / 2, fl), "offwhite", bevel=0.02)
    for k in range(9):  # lit vertical fins on the plaza side
        box(f"dc_fin{k}", (0.12, 0.3, h - 0.6), (x1 + 0.56, y0 + 1.2 + k * 2.6, fl + 0.3), "led_cyan" if k % 3 == 1 else "white", bevel=0)
    box("dc_front_glass", (x1 - x0, 0.04, h), ((x0 + x1) / 2, y0, fl), "glass", bevel=0)
    mullion_line("dc_mull", (x0, y0 - 0.06), (x1, y0 - 0.06), fl, h)
    box("dc_transom", (x1 - x0, 0.16, 0.14), ((x0 + x1) / 2, y0 - 0.06, fl + 3.5), "white", bevel=0)
    for k, s in enumerate((-1, 1)):
        box(f"dc_door{k}", (1.3, 0.05, 2.6), (-26.0 + s * 0.7, y0 - 0.12, fl), "glass", bevel=0)
    box("dc_roof_glass", (x1 - x0, y1 - y0, 0.06), ((x0 + x1) / 2, (y0 + y1) / 2, fl + h), "glass", bevel=0)
    beams = []
    nx_, ny_ = int((x1 - x0) / 3.0), int((y1 - y0) / 4.6)
    for k in range(nx_ + 1):
        x = x0 + k * (x1 - x0) / nx_
        beams += C.split([(x, y0, fl + h - 0.2), (x, y1, fl + h - 0.2)], 2.5)
    for k in range(ny_ + 1):
        y = y0 + k * (y1 - y0) / ny_
        beams += C.split([(x0, y, fl + h - 0.25), (x1, y, fl + h - 0.25)], 2.5)
    C.tubes("dc_beams", [(a, b, 0.14) for a, b in beams], "white", verts=8)
    A.ring("dc_parapet", A.outline(rect(x0 - 0.5, y0 - 0.5, x1 + 0.5, y1 + 0.5), 0.0), A.outline(rect(x0, y0, x1, y1), 0.0), fl + h, 0.45, "white")  # flush with the deck
    box("dc_fascia_led", (x1 - x0 + 1.02, 0.04, 0.06), ((x0 + x1) / 2, y0 - 0.52, fl + h + 0.12), "led_cyan", bevel=0)
    L.text_mesh("dc_name", "TKC CLOUD DATA CENTER", ((x0 + x1) / 2 - 2.0, y0 - 0.53, fl + h + 0.2), 0.34, 0.03, "accent_blue", resolution=3)
    # viewing deck on the roof where the skybridge lands: look down through the glass onto the aisles
    box("dc_deck", (6.0, 8.0, 0.32), (x1 - 3.0, HUB[1], DECK - 0.32), "white", bevel=0.03)
    for s in (-1, 1):
        box(f"dc_deck_glass{s}", (6.0, 0.04, 1.1), (x1 - 3.0, HUB[1] + s * 3.98, DECK), "glass", bevel=0)
    box("dc_deck_glass_l", (0.04, 8.0, 1.1), (x1 - 5.98, HUB[1], DECK), "glass", bevel=0)
    with group("hot:data-center"):
        for a, y in enumerate((0.2, 5.4, 10.6)):
            Q.rack_aisle(f"aisle{a}", x0 + 2.0, y, 22, fl)
        for k, y in enumerate((-1.0, 3.6, 8.2, 12.8)):
            box(f"crah{k}", (0.9, 1.8, 2.2), (x1 - 0.6, y, fl), "panel_grey", bevel=0.03)
            box(f"crah{k}_grille", (0.02, 1.5, 0.9), (x1 - 1.06, y, fl + 1.0), "frame_dark", bevel=0)
            box(f"crah{k}_led", (0.02, 0.3, 0.06), (x1 - 1.06, y, fl + 2.0), "led_green", bevel=0)
        K.video_wall("noc_wall", x0 + 1.0, x0 + 9.0, y0 + 2.6, fl + 1.2, 1.8, ("screen_noc", "screen_noc", "screen_noc"), face=-math.pi / 2)
        for k in range(3):
            M.workstation(f"noc_ws{k}", (x0 + 2.4 + k * 2.6, y0 + 1.0, fl), rot_z=0.0, screens=("screen_noc", "screen_monitor"), seed=1400 + k, outfit=(None, "teacher", None)[k])
        L.human("dc_tech", (x1 - 3.0, 2.8, fl), rot_z=math.pi, seed=1410, outfit="worker")
        box("dc_cart", (0.8, 0.5, 0.9), (x1 - 3.0, 2.0, fl), "silver", bevel=0.03)
        empty("pin_data-center", ((x0 + x1) / 2, (y0 + y1) / 2, fl + h + 4.0))


def dc_yard():
    x0, y0, x1, y1 = YARD
    L.set_group("static_site")
    pad("yard", x0, y0, x1, y1, "concrete")
    T.fence("yard_fence", [(x1, y0 + 4.0), (x1, y0), (x0 + 0.3, y0), (x0 + 0.3, y1), (x1, y1), (x1, y0 + 7.0)], h=2.4)
    # front row: two generators and the fuel tank; back row: four chillers and two transformers (nothing touches)
    for k in range(2):
        K.generator(f"genset{k}", (x0 + 3.7 + k * 6.8, y0 + 2.0, G0 + 0.02), rot_z=0.0)
    cyl("fuel_tank", 1.1, 5.6, (x0 + 14.4, y0 + 2.0, G0 + 1.3), "robot_white", verts=24, rot=(0, math.pi / 2, 0), bevel=0.06)
    for s in (0.8, 4.8):
        box(f"fuel_saddle{s}", (0.5, 2.0, 0.9), (x0 + 14.4 + s, y0 + 2.0, G0 + 0.02), "concrete", bevel=0.02)
    for k in range(4):
        K.chiller(f"chiller{k}", (x0 + 3.0 + (k % 2) * 4.7, y0 + 6.4 + (k // 2) * 2.9, G0 + 0.02), rot_z=0.0, fans=3)
    for k in range(2):
        G.power_transformer(f"dctx{k}", (x0 + 12.9 + k * 4.9, y0 + 8.0, G0 + 0.02), rot_z=0.0, s=0.6)


def big_data():
    x0, y0, x1, y1 = BD
    L.set_group("static_campus")
    fl = G0 + 0.14
    with group("hot:big-data"):
        # two glazed floors: analysts below, the data-lake storage above, a sky terrace of giant charts on the roof
        box("bd_slab", (x1 - x0 + 0.4, y1 - y0 + 0.4, 0.3), ((x0 + x1) / 2, (y0 + y1) / 2, G0 - 0.16), "hosp_white", bevel=0.03)
        K.glass_skin("bd_skin", A.outline(rect(x0, y0, x1, y1), 0.0), fl, DECK - fl - 0.4)
        box("bd_mid", (x1 - x0 + 0.5, y1 - y0 + 0.5, 0.3), ((x0 + x1) / 2, (y0 + y1) / 2, G0 + CC_FL - 0.3), "white", bevel=0.03)
        box("bd_mid_led", (x1 - x0 + 0.52, 0.04, 0.06), ((x0 + x1) / 2, y0 - 0.26, G0 + CC_FL - 0.2), "led_cyan", bevel=0)
        box("bd_roof", (x1 - x0 + 0.8, y1 - y0 + 0.8, 0.45), ((x0 + x1) / 2, (y0 + y1) / 2, DECK - 0.45), "white", bevel=0.04)
        box("bd_roof_led", (x1 - x0 + 0.82, 0.04, 0.06), ((x0 + x1) / 2, y0 - 0.41, DECK - 0.3), "led_cyan", bevel=0)
        for s in (-1, 1):
            box(f"bd_terrace_glass{s}", (x1 - x0 + 0.6, 0.04, 1.1), ((x0 + x1) / 2, (y0 + y1) / 2 + s * ((y1 - y0) / 2 + 0.36), DECK), "glass", bevel=0)
        box("bd_terrace_glass_r", (0.04, y1 - y0 + 0.6, 1.1), (x1 + 0.36, (y0 + y1) / 2, DECK), "glass", bevel=0)
        K.video_wall("bd_wall", x0 + 1.0, x1 - 1.0, y1 - 0.4, fl + 1.0, 2.0, ("screen_bigdata", "screen_bigdata2", "screen_bigdata"), face=-math.pi / 2)
        for k in range(3):
            M.workstation(f"bd_ws{k}", (x0 + 2.6 + k * 3.4, y0 + 2.6, fl), rot_z=0.0, screens=("screen_bigdata2", "screen_monitor"), seed=1600 + k, outfit=("teacher", None, "doctor2")[k])
        for k in range(12):
            Q.rack(f"bd_store{k}", (x0 + 2.0 + k * 0.68, y1 - 1.4, G0 + CC_FL), 0.0)
        Q.bar_sculpture("bars", (x0 + 6.0, (y0 + y1) / 2 + 1.0, DECK), rot_z=0.0)
        Q.donut_sculpture("donut", (x1 - 2.6, y0 + 2.4, DECK), r=2.0)
        L.text_mesh("bd_name", "BIG DATA ANALYTICS", ((x0 + x1) / 2, y0 - 0.43, DECK - 0.28), 0.3, 0.03, "accent_blue", resolution=3)
        # the data lake in front and the storage silo behind
        lx0, ly0, lx1, ly1 = LAKE
        A.ring("lake_rim", A.outline(rect(lx0 - 0.3, ly0 - 0.3, lx1 + 0.3, ly1 + 0.3), 0.0), A.outline(rect(lx0, ly0, lx1, ly1), 0.0), G0, 0.4, "robot_white")
        box("lake_water", (lx1 - lx0, ly1 - ly0, 0.26), ((lx0 + lx1) / 2, (ly0 + ly1) / 2, G0), "tile_blue", bevel=0)
        for s, y in ((-1, ly0 - 0.32), (1, ly1 + 0.32)):
            box(f"lake_led{s}", (lx1 - lx0 + 0.6, 0.04, 0.05), ((lx0 + lx1) / 2, y, G0 + 0.36), "led_cyan", bevel=0)
        for k in range(4):
            box(f"lake_stream{k}", (lx1 - lx0 - 1.0, 0.08, 0.02), ((lx0 + lx1) / 2, ly0 + 0.9 + k * 1.2, G0 + 0.27), "led_blue" if k % 2 else "led_cyan", bevel=0)
        Q.data_silo("silo", (SILO[0], SILO[1], G0), r=3.2, h=24.0, rings=9)
        empty("pin_big-data", ((x0 + x1) / 2, (y0 + y1) / 2, DECK + 14.0))


def contact_centre():
    r0, r1, a0, a1 = CC
    cx, cy = HUB
    L.set_group("static_tower")
    band = Q.arc_band(cx, cy, r0, r1, a0, a1, 24)
    n = 3
    top = G0 + n * CC_FL
    for f in range(n + 1):
        z = G0 + f * CC_FL
        # the ground slab stands 2 cm proud of the lawn (flush, the two tops z-fight)
        A.solid(f"cc_slab{f}", Q.arc_band(cx, cy, r0 - 0.3, r1 + 0.3, a0 - 0.01, a1 + 0.01, 24), z - (0.28 if f == 0 else 0.3), 0.3, "white")
        if f < n:
            pts = [Vector(polar(r0 - 0.32, a0 + (a1 - a0) * i / 24, z - 0.2)) for i in range(25)]
            C.tubes(f"cc_led{f}", [(p, q, 0.04) for p, q in zip(pts, pts[1:])], "led_cyan", verts=6)
    K.glass_skin("cc_skin", band, G0, n * CC_FL - 0.3)
    A.solid("cc_parapet", Q.arc_band(cx, cy, r0 - 0.3, r1 + 0.3, a0 - 0.01, a1 + 0.01, 24), top, 0.6, "white")
    with group("hot:call-center"):
        for f in range(n):
            z = G0 + f * CC_FL
            if f == 0:
                M.curved_desk("cc_reception", (cx, cy), r0 + 1.4, r0 + 2.0, math.radians(80), math.radians(100), z)
                M.kiosk("cc_kiosk", polar(r0 + 1.0, math.radians(70), z), face=math.radians(70) + math.pi, screen="screen_crm")
                continue
            for row, rr in enumerate((r0 + 1.6, r0 + 3.4)):
                for k in range(8):
                    a = math.radians(62 + k * 8)
                    M.workstation(f"cc_ws{f}{row}{k}", polar(rr, a, z), rot_z=a + math.pi / 2, screens=("screen_crm", "screen_monitor"),
                                  seed=1700 + f * 20 + row * 8 + k, outfit=(None, "teacher", "doctor2", None, "student", None, "teacher", None)[k])
            for k, deg in enumerate((72, 90, 108)):
                a = math.radians(deg)
                M.screen_at(f"cc_board{f}{k}", (3.4, 1.4), polar(r1 - 0.25, a, z + 1.7), a + math.pi, "screen_crm", bezel=0.05)
        Q.headset("cc_headset", polar((r0 + r1) / 2, math.pi / 2, top + 3.2), s=3.0)
        for s in (-1, 1):
            p = polar((r0 + r1) / 2, math.pi / 2)
            box(f"cc_headset_post{s}", (0.34, 0.34, 2.4), (p[0] + s * 3.05, p[1], top + 0.6), "robot_white", bevel=0.03)
        p = polar(r0 - 0.42, math.pi / 2)
        L.text_mesh("cc_name", "CLOUD CONTACT CENTER", (p[0], p[1], top + 0.1), 0.42, 0.03, "accent_blue", resolution=3)
        empty("pin_call-center", (p[0], p[1] + 3.0, top + 8.0))


def erp():
    L.set_group("static_tower")
    x, y = ERP
    with group("hot:erp"):
        A.office_tower("erp_tower", x, y, 11.0, 8.0, 30.0, glass="tower_glass", frame="tower_frame", seed=17, mast=False, style=1)
        M.screen_at("erp_board", (5.0, 2.6), (x, y - 5.6, G0 + 2.6), -math.pi / 2, "screen_erp", bezel=0.08, depth=0.2)
        for s in (-1, 1):
            box(f"erp_board_leg{s}", (0.2, 0.2, 1.4), (x + s * 2.2, y - 5.55, G0), "robot_white", bevel=0.02)
        L.text_mesh("erp_name", "ERP ON CLOUD", (x, y - 5.75, G0 + 4.2), 0.36, 0.03, "accent_blue", resolution=3)
        L.van("erp_van", (39.0, 16.5, G0 + 0.02), rot_z=math.pi / 2, paint="white")
        O.box_truck("erp_truck", (41.4, 23.0, G0 + 0.02), rot_z=math.pi / 2, paint="truck_teal", text="TKC CLOUD")
        empty("pin_erp", (x, y, 34.0))


def pavilions():
    L.set_group("static_building")
    x0, y0, x1, y1 = SEC
    with group("hot:security-compliance"):
        glass_box("sec", x0, y0, x1, y1, G0, 4.2, solid=("left", "back"))
        for k in range(3):
            K.turnstile(f"sec_gate{k}", (x1 - 3.0, y0 + 1.6 + k * 1.2, G0 + 0.14), rot_z=math.pi / 2)
        M.curved_desk("sec_desk", (x0 + 3.0, y0 + 2.2), 0.9, 1.4, math.radians(-160), math.radians(-20), G0 + 0.14)
        L.human("sec_guard", (x0 + 3.0, y0 + 2.9, G0 + 0.14), rot_z=-math.pi / 2, seed=1301, outfit="worker")
        M.screen_at("sec_board", (4.0, 1.8), (x0 + 4.4, y1 - 0.2, G0 + 1.6), -math.pi / 2, "screen_compliance", bezel=0.06)
        box("sec_table", (2.6, 1.2, 0.06), (x0 + 4.4, y1 - 2.4, G0 + 0.86), "woodlight", bevel=0.04)
        box("sec_table_leg", (0.3, 0.8, 0.72), (x0 + 4.4, y1 - 2.4, G0 + 0.14), "silver", bevel=0.01)
        for k, dx in enumerate((-0.9, 0.9)):
            L.human(f"sec_auditor{k}", (x0 + 4.4 + dx, y1 - 3.3, G0 + 0.14), rot_z=math.pi / 2, seed=1305 + k, outfit="teacher" if k else None)
        L.text_mesh("sec_name", "SECURITY & COMPLIANCE", ((x0 + x1) / 2, y0 - 0.44, G0 + 4.44), 0.3, 0.03, "accent_blue", resolution=3)
        K.holo_lock("sec_lock", ((x0 + x1) / 2, (y0 + y1) / 2, G0 + 6.6), s=1.6)
        M.disc_ring("sec_ring", 2.6, 2.45, ((x0 + x1) / 2, (y0 + y1) / 2, G0 + 4.8), 0.04, "led_cyan", n=48)
        empty("pin_security-compliance", ((x0 + x1) / 2, (y0 + y1) / 2, G0 + 9.6))
    L.set_group("static_campus")
    x0, y0, x1, y1 = CHAIN
    with group("hot:blockchain"):
        glass_box("chain", x0, y0, x1, y1, G0, 4.2, solid=("right", "back"), led="led_pink")
        for k in range(6):
            Q.rack(f"node{k}", (x0 + 4.0 + k * 0.68, y1 - 1.0, G0 + 0.14), 0.0, screen="screen_chain")
        M.kiosk("chain_kiosk", (x0 + 2.0, y0 + 1.8, G0 + 0.14), face=-math.pi / 2, screen="screen_chain")
        M.screen_at("chain_wall", (3.2, 1.6), (x1 - 2.4, y1 - 0.2, G0 + 1.8), -math.pi / 2, "screen_chain", bezel=0.05)
        for k, (dx, dy, rz) in enumerate(((2.6, 2.4, 0.4), (9.0, 2.2, 2.6))):
            L.human(f"chain_p{k}", (x0 + dx, y0 + dy, G0 + 0.14), rot_z=rz, seed=1800 + k, outfit=(None, "teacher")[k])
        L.text_mesh("chain_name", "BLOCKCHAIN LAB", ((x0 + x1) / 2, y0 - 0.44, G0 + 4.56), 0.3, 0.03, "accent_blue", resolution=3)
        for k in range(4):
            cyl(f"chain_post{k}", 0.06, 3.0, ((x0 + x1) / 2 + (k - 1.5) * 1.2, (y0 + y1) / 2, G0 + 4.6), "silver", verts=8)
        empty("pin_blockchain", ((x0 + x1) / 2, (y0 + y1) / 2, 13.0))
    Q.chain_cubes("chain_holo", ((CHAIN[0] + CHAIN[2]) / 2, (CHAIN[1] + CHAIN[3]) / 2, G0 + 8.4), r=2.6)


# ---------------------------------------------------------------- life, icons, light

def life():
    ring_path = [(HUB[0] + 16.1 * math.cos(a), HUB[1] + 16.1 * math.sin(a)) for a in [i * math.tau / 48 for i in range(48)]]
    plaza_path = [(HUB[0] + 14.0 * math.cos(a), HUB[1] + 14.0 * math.sin(a)) for a in [i * math.tau / 48 for i in range(48)]]
    loops = [
        (racetrack(-40.0, -32.6, 40.0, -31.4, 0.5), 3, 1.25, (None, None, None), G0, True),
        (racetrack(-40.0, -21.8, 40.0, -20.6, 0.5), 4, 1.3, (None, "teacher", None, None), G0, True),
        (ring_path, 4, 1.0, ("teacher", None, "doctor2", None), DECK, True),  # visitors on the sky ring
        (plaza_path, 3, 1.1, (None, "teacher", None), G0 + 0.02, True),
        (racetrack(-1.2, -16.4, 1.2, -8.6, 0.6), 2, 1.0, (None, "doctor2"), G0 + 0.02, True),  # along the axis
    ]
    n = 0
    for path, count, speed, outfits, z, closed in loops:
        length = L.path_length(path, closed)
        for j in range(count):
            L.walker(f"walker{n}", path, speed, (j + 0.3) * length / count, seed=1900 + n, z=z, outfit=outfits[j])
            n += 1
    v, half = 7.0, BASE[0] + 8.0
    for i, (lane_y, sign) in enumerate(((ROAD_Y + 1.8, 1), (ROAD_Y - 1.8, -1))):
        lane = [(-sign * half, lane_y), (sign * half, lane_y)]
        for j in range(2):
            L.driver(f"car{i}{j}", lane, v, j * half + i * 13.0, closed=False, paint=(("white", "navy"), ("sky_blue", "silver"))[i][j], kind=("car", "van")[j])


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
    p = polar((CC[0] + CC[1]) / 2, math.pi / 2)
    panels = (
        (SEC[0], SEC[1], SEC[2], SEC[3], G0 + 4.2),
        (CHAIN[0], CHAIN[1], CHAIN[2], CHAIN[3], G0 + 4.2),
        (BD[0], BD[1], BD[2], BD[3], G0 + CC_FL - 0.4),
        (BD[0], BD[1], BD[2], BD[3], DECK - 0.6),
        (cx - 6, cy - 6, cx + 6, cy + 6, G0 + POD_H - 0.4),
        (p[0] - 12, p[1] - 3, p[0] + 12, p[1] + 3, G0 + CC_FL - 0.3),
        (p[0] - 12, p[1] - 3, p[0] + 12, p[1] + 3, G0 + 2 * CC_FL - 0.3),
        (p[0] - 12, p[1] - 3, p[0] + 12, p[1] + 3, G0 + 3 * CC_FL - 0.3),
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
    gate_and_pools()
    nexus()
    sky_ring()
    data_centre()
    dc_yard()
    big_data()
    contact_centre()
    erp()
    pavilions()
    life()
    lighting()
    for name, groups in ATLASES.items():
        bpy.context.scene[f"atlas_{name}"] = ",".join(groups)
    bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(BLEND))
    print("objects:", len(bpy.context.scene.objects), "tris:", sum(len(o.data.polygons) for o in bpy.context.scene.objects if o.type == "MESH"))


if __name__ == "__main__":
    build()
