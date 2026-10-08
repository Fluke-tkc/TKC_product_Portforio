"""Smart Utility - an intelligent-grid district after the Smart Utility AI artwork.

Along the back a double-circuit transmission line on three lattice towers; it drops into a 115/22 kV substation
on the left. In front of the substation the battery energy storage yard (BESS containers, power conversion skids).
In the middle the Energy Operations Center: a glass control hall (video wall, operator rows, a grid hologram)
under a PV roof with a green office block behind, and a solar car park with DC and V2G chargers. On the right a
prosumer neighbourhood (rooftop PV, home batteries, smart meters, a community battery, a 22 kV line with an AMI
data concentrator), and behind it a solar farm and two wind turbines. A street with traffic and people in front.

blender -b --factory-startup --python public/Blender/scripts/smart_utility.py
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
import tkc_cyber as K  # noqa: E402
import tkc_grid as G  # noqa: E402
import tkc_lib as L  # noqa: E402
import tkc_med as M  # noqa: E402
from tkc_lib import box, cyl, empty, group  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
BLEND = os.path.join(HERE, "..", "smart_utility.blend")

# ---------------------------------------------------------------- layout
BASE = (44.0, 33.0)
G0 = 0.16  # top of the grounds
ROAD_Y = -27.0  # front road (8 m), sidewalk y -23 .. -19
SUB = (-43.4, 9.0, -21.0, 25.0)  # substation fence x0, y0, x1, y1
BESS = (-43.4, -18.0, -21.0, 3.0)  # battery yard fence
PORT = (-18.0, -12.5, 8.0, -7.0)  # solar carport: bays face +y, chargers on the back line
HALL = (-18.0, -4.0, 8.0, 9.0)  # control hall
FL = 0.3  # hall floor
HALL_H = 6.4
ROOF = FL + HALL_H  # underside of the hall roof slab
OFFICE = (-15.0, 9.0, 5.0, 16.0)
OFF_H = 3.6
OFF_N = 4
STREET = (10.0, 14.0)  # north-south street to the homes (x)
LANE = (-5.0, -1.5)  # east-west lane between the two rows of homes (y)
ROW1, ROW2 = -12.0, 4.6  # house centres (y); fronts face -y
HOUSES = (18.5, 27.5, 36.5)
HW, HD = 7.2, 6.4
FARM = (13.0, 11.5, 43.6, 25.5)  # solar farm fence (also round the turbines)
TURBINES = ((15.0, 23.0), (36.0, 23.0))
PYLONS = (-30.0, -2.0, 26.0)
PYLON_Y = 28.5
HOLO = (-14.0, -0.2)  # grid hologram over its projection table, in the hall


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


def pv_row(name, x0, x1, y, z, depth=2.4, tilt=0.3, w=2.0):
    """A row of tilted PV modules on a roof (front edge at y), each on a front and a back leg - nothing floats."""
    n = int((x1 - x0) / (w + 0.15))
    legs = []
    zc = z + 0.15 + depth / 2 * math.sin(tilt)
    for i in range(n):
        x = x0 + (w + 0.15) * (i + 0.5)
        box(f"{name}_{i}", (w, depth, 0.06), (x, y + depth / 2 * math.cos(tilt), zc - 0.03), "solar", bevel=0, rot=(tilt, 0, 0))
        for f in (0.1, 0.9):
            yy = y + depth * f * math.cos(tilt)
            top = z + 0.15 + depth * f * math.sin(tilt)
            for dx in (-w * 0.35, w * 0.35):
                legs.append((Vector((x + dx, yy, z)), Vector((x + dx, yy, top - 0.04)), 0.035))
    C.tubes(f"{name}_legs", legs, "steel", verts=6)


# ---------------------------------------------------------------- site

def site():
    L.set_group("static_site")
    A.solid("plinth", A.outline(A.rect_poly(0, 0, 2 * BASE[0], 2 * BASE[1]), 2.0), -2.0, 2.0, "hosp_white", bevel=0.15)
    box("road", (2 * BASE[0], 8, 0.02), (0, ROAD_Y, 0), "asphalt", bevel=0)
    for i in range(13):
        box(f"dash{i}", (2.4, 0.15, 0.005), (-37 + i * 6.2, ROAD_Y, 0.02), "paint_white", bevel=0)
    for i in range(8):  # crossing in front of the operations centre
        box(f"zebra{i}", (0.55, 5.0, 0.005), (-1.0 + i * 1.1, ROAD_Y, 0.021), "paint_white", bevel=0)
    box("sidewalk_far", (2 * BASE[0], 2.0, 0.16), (0, -32.0, 0), "paving", bevel=0.03)
    box("sidewalk", (2 * BASE[0], 4.0, 0.16), (0, -21.0, 0), "paving", bevel=0.03)
    box("grounds", (2 * BASE[0] - 0.6, 52.0, 0.16), (0, 7.0, 0), "lawn", bevel=0.03)
    # hard surfaces on the grounds (none overlap: equal tops would z-fight)
    x0, y0, x1, y1 = PORT
    pad("port_asphalt", x0, -19.0, x1, y1, "asphalt")
    pad("port_apron", -17.6, -23.0, -13.6, -19.0, "asphalt", top=G0 + 0.03)
    pad("plaza", HALL[0], y1, HALL[2], HALL[1], "terrazzo")
    pad("plaza_side", HALL[2], -19.0, STREET[0], HALL[3], "terrazzo")
    pad("street", STREET[0], -19.0, STREET[1], 11.5, "asphalt")
    pad("street_apron", STREET[0], -23.0, STREET[1], -19.0, "asphalt", top=G0 + 0.03)
    pad("lane", STREET[1], LANE[0], BASE[0] - 0.3, LANE[1], "asphalt")
    pad("sub_gravel", SUB[0], SUB[1], SUB[2], SUB[3], "gravel")
    pad("bess_slab", BESS[0], BESS[1], BESS[2], BESS[3], "concrete")
    pad("bess_drive", -26.0, -19.0, -22.0, BESS[1], "concrete", top=G0 + 0.03)
    # cable trench covers: substation -> battery yard and -> operations centre (the feeders run underground)
    for k, (a, b) in enumerate((((-42.4, -14.0), (-42.4, SUB[1])), ((SUB[2], 10.0), (-15.4, 10.0)), ((-20.0, 9.6), (-20.0, -12.5)))):
        (ax, ay), (bx, by) = a, b
        box(f"trench{k}", (abs(bx - ax) + 0.6, abs(by - ay) + 0.6, 0.06), ((ax + bx) / 2, (ay + by) / 2, G0 + 0.03 if k == 0 else G0), "panel_grey", bevel=0.01)
    # street trees and lights along the front sidewalk, leaving the drive-ins clear
    rnd = random.Random(900)
    for k, x in enumerate((-40, -32, -10, -2, 6, 22.5, 31.5, 41.0)):
        A.tree(f"stree{k}", (x, -20.0, G0), h=6.0 + rnd.random(), spread=0.9, seed=910 + k)
    for k, x in enumerate((-36, -20, -6, 16, 32)):
        L.street_light(f"lamp{k}", (x, -22.6, G0), rot_z=-math.pi / 2, h=6.0)
    for k, x in enumerate((-28, 0, 24)):
        L.street_light(f"lampf{k}", (x, -31.6, G0), rot_z=math.pi / 2, h=6.0)
    # park between the operations centre, the substation and the pylons
    for k, (x, y) in enumerate(((-12, 20), (-2, 22), (6, 18), (-16, 27), (9, 26), (-40, 30.5))):
        A.tree(f"ptree{k}", (x, y, G0), h=6.5 + rnd.random() * 2, spread=1.0, seed=930 + k)
    for k, (x, y) in enumerate(((-6.0, 19.0), (2.0, 19.5))):
        L.bench(f"pbench{k}", (x, y, G0), rot_z=0.0)


# ---------------------------------------------------------------- transmission and substation

def transmission():
    L.set_group("static_grid")
    towers = []
    for k, x in enumerate(PYLONS):
        clamps, peaks = G.pylon(f"pylon{k}", (x, PYLON_Y, G0), h=26.0, rot_z=math.pi / 2, arms=(4.2, 5.0, 3.8))
        towers.append((clamps, peaks))
    # conductors tower to tower, and off both ends of the base (the line carries on beyond the diorama)
    for k in range(len(towers) - 1):
        (ca, pa), (cb, pb) = towers[k], towers[k + 1]
        for i, (a, b) in enumerate(zip(ca, cb)):
            G.span(f"line{k}_{i}", a, b, sag=1.6)
        for i, (a, b) in enumerate(zip(pa, pb)):
            G.span(f"earth{k}_{i}", a, b, sag=1.0, r=0.025, mat="steel")
    for tag, (cs, ps), edge in (("w", towers[0], -BASE[0] + 0.3), ("e", towers[-1], BASE[0] - 0.3)):
        for i, a in enumerate(cs):
            G.span(f"line{tag}_{i}", a, (edge, a.y, a.z + 0.9), sag=0.9)
        for i, a in enumerate(ps):
            G.span(f"earth{tag}_{i}", a, (edge, a.y, a.z + 0.5), sag=0.5, r=0.025, mat="steel")
    return towers[0][0][:3]  # the front circuit of the first tower feeds the substation


def substation(feed):
    L.set_group("static_grid")
    x0, y0, x1, y1 = SUB
    T.fence("sub_fence", [(x1, y0 + 6.0), (x1, y0), (x0 + 0.3, y0), (x0 + 0.3, y1), (x1, y1), (x1, y0 + 9.0)], h=2.4)
    clamps = G.gantry("sub_gantry", (-30.0, 22.5, G0), w=9.0, h=11.0)
    for i, (a, b) in enumerate(zip(feed, clamps)):
        G.span(f"sub_drop{i}", a, b, sag=0.8)
    # three busbars on post insulators, two bays (breaker + transformer) hanging off them
    bus_y = (18.6, 19.3, 20.0)
    tops = {}
    for k, y in enumerate(bus_y):
        for x in (-41.5, -34.0, -26.5):
            tops[(k, x)] = G.post_insulator(f"bus_post{k}_{x:.0f}", (x, y, G0), h=3.6)
        z = tops[(k, -41.5)].z
        G.span(f"busbar{k}", (-42.0, y, z), (-26.0, y, z), sag=0.0, r=0.07, mat="aluminium", n=8)
    for i, (c, k) in enumerate(zip(clamps, range(3))):  # gantry clamps -> busbars
        G.span(f"bus_drop{i}", c, (c.x, bus_y[k], tops[(k, -41.5)].z + 0.05), sag=0.2, r=0.04)
    for b, bx in enumerate((-30.0, -39.5)):
        G.breaker(f"cb{b}", (bx, 16.2, G0))
        hv = G.power_transformer(f"tx{b}", (bx, 12.0, G0), rot_z=math.pi, s=0.9, label=f"TR-{b + 1}  115/22 kV")
        for k in range(3):
            x = bx - 1.0 + k
            G.span(f"cb{b}_up{k}", (x, 16.2 + 0.45, G0 + 3.1), (x, bus_y[k], tops[(k, -41.5)].z + 0.05), sag=0.1, r=0.035)
            G.span(f"cb{b}_dn{k}", (x, 16.2 - 0.45, G0 + 3.1), hv[2 - k], sag=0.25, r=0.035)
    G.control_house("sub_house", (-38.5, 22.6, G0), w=6.0, d=4.0)
    for k, (x, y) in enumerate(((-42.6, 24.2), (-21.8, 9.8))):
        cyl(f"sub_cam{k}", 0.08, 4.5, (x, y, G0), "darkgray", verts=10)
        box(f"sub_cam{k}_head", (0.5, 0.25, 0.25), (x, y - 0.2, G0 + 4.3), "robot_white", bevel=0.04)


# ---------------------------------------------------------------- battery energy storage

def bess():
    x0, y0, x1, y1 = BESS
    L.set_group("static_site")
    T.fence("bess_fence", [(-26.0, y0), (x0 + 0.3, y0), (x0 + 0.3, y1), (x1, y1), (x1, y0), (-22.0, y0)], h=2.4)
    with group("hot:energy-storage"):
        for k, x in enumerate((-40.4, -36.4, -32.4, -28.4)):
            G.bess_container(f"bess{k}", (x, -4.8, G0 + 0.02), rot_z=math.pi / 2, label=f"BESS {k + 1}")
        for k, x in enumerate((-38.4, -30.4)):
            G.pcs_skid(f"pcs{k}", (x, -14.6, G0 + 0.02))
        G.control_house("bess_ctl", (-23.6, -6.0, G0 + 0.02), w=4.4, d=3.4, h=3.0, rot_z=math.pi / 2, label="BESS 10 MWh")
        empty("pin_energy-storage", (-34.4, -4.8, 8.6))
    for k, (x, y) in enumerate(((-42.6, -17.2), (-21.8, 2.2))):
        cyl(f"bess_cam{k}", 0.08, 4.5, (x, y, G0), "darkgray", verts=10)
        box(f"bess_cam{k}_head", (0.5, 0.25, 0.25), (x + 0.2, y, G0 + 4.3), "robot_white", bevel=0.04)


# ---------------------------------------------------------------- energy operations centre

def grid_hologram(name, center, r=1.5):
    """The district's load map over the projection table: rings, one glowing bar per zone, a bolt in the middle."""
    parts = []
    rnd = random.Random(17)
    with group("move"):
        parts.append(M.disc_ring(f"{name}_ring", r, r - 0.06, (0, 0, 0), 0.02, "holo", n=48))
        parts.append(M.disc_ring(f"{name}_ring2", r * 0.55, r * 0.55 - 0.05, (0, 0, 0.02), 0.02, "holo", n=40))
        for k in range(7):
            a = k * math.tau / 7
            parts.append(cyl(f"{name}_bar{k}", 0.13, 0.35 + rnd.random() * 0.9, (math.cos(a) * r * 0.78, math.sin(a) * r * 0.78, 0.02), "holo", verts=6))
        parts.append(L.plane(f"{name}_bolt", (0.8, 0.8), (0, 0, 0.75), "screen_icon_bolt", rot=(math.pi / 2, 0, 0)))
    body = L.rigid(parts, name)
    body.location = center
    body["spin"], body["spin_speed"] = "z", 0.3
    return body


def control_hall():
    x0, y0, x1, y1 = HALL
    L.set_group("static_building")
    box("hall_slab", (x1 - x0 + 0.6, y1 - y0 + 0.6, FL - 0.02), ((x0 + x1) / 2, (y0 + y1) / 2, 0.0), "hosp_white", bevel=0.04)
    box("hall_floor", (x1 - x0, y1 - y0, 0.02), ((x0 + x1) / 2, (y0 + y1) / 2, FL - 0.02), "cyber_floor", bevel=0)
    # front and right side all glass (the camera looks in), left side a living wall, back = the office block
    box("hall_front_glass", (x1 - x0, 0.04, HALL_H), ((x0 + x1) / 2, y0, FL), "glass", bevel=0)
    mullion_line("hall_mull_f", (x0, y0 - 0.06), (x1, y0 - 0.06), FL, HALL_H)
    box("hall_transom", (x1 - x0, 0.16, 0.14), ((x0 + x1) / 2, y0 - 0.06, FL + 3.2), "white", bevel=0)
    box("hall_right_glass", (0.04, y1 - y0, HALL_H), (x1, (y0 + y1) / 2, FL), "glass", bevel=0)
    mullion_line("hall_mull_r", (x1 + 0.06, y0), (x1 + 0.06, y1), FL, HALL_H)
    box("hall_left", (0.5, y1 - y0, HALL_H), (x0 - 0.25, (y0 + y1) / 2, FL), "offwhite", bevel=0.02)
    box("hall_left_green", (0.08, y1 - y0 - 2.0, HALL_H - 1.4), (x0 - 0.54, (y0 + y1) / 2, FL + 0.6), "leafv_dark", bevel=0)
    rnd = random.Random(44)
    clumps = []
    for i in range(16):
        for j in range(7):
            if rnd.random() < 0.85:
                clumps.append(((x0 - 0.62, y0 + 1.3 + i * (y1 - y0 - 2.6) / 15, FL + 0.9 + j * (HALL_H - 2.0) / 6), 0.36 + rnd.random() * 0.14, rnd.randint(0, 9999)))
    A.foliage("hall_living_wall", clumps, subdiv=1)
    # entrance: sliding doors with a canopy, a TKC mat
    dx = -5.0
    for k, s in enumerate((-1, 1)):
        box(f"hall_door{k}", (1.2, 0.05, 2.6), (dx + s * 0.9, y0 - 0.14, FL), "glass", bevel=0)
    box("hall_door_frame", (3.2, 0.2, 0.25), (dx, y0 - 0.1, FL + 2.6), "white", bevel=0.02)
    # roof: slab with a deep front overhang, lit fascia, the centre's name, PV rows, roof garden edge, downlights
    box("hall_roof", (x1 - x0 + 1.2, y1 - y0 + 2.6, 0.55), ((x0 + x1) / 2, (y0 + y1) / 2 - 1.0, ROOF), "white", bevel=0.06)
    box("hall_roof_led", (x1 - x0 + 1.22, 0.04, 0.06), ((x0 + x1) / 2, y0 - 2.32, ROOF + 0.05), "led_cyan", bevel=0)
    L.text_mesh("hall_name", "ENERGY OPERATIONS CENTER", (dx, y0 - 2.33, ROOF + 0.17), 0.36, 0.03, "accent_blue", resolution=3)
    A.downlights("hall_dl", rect(x0 + 1, y0 + 1, x1 - 1, y1 - 1), ROOF - 0.03, spacing=3.0, mat="led_white")
    for r in range(3):
        pv_row(f"hall_pv{r}", x0 + 2.0, x1 - 2.0, y0 + 0.6 + r * 3.3, ROOF + 0.55, depth=2.4)
    for k in range(10):
        L.potted_plant(f"roof_plant{k}", (x0 + 1.0 + k * 2.7, y1 - 0.6, ROOF + 0.55), h=1.0, seed=960 + k, pot="planter")


def ems_interior():
    x0, y0, x1, y1 = HALL
    with group("hot:dr-ems"):
        K.video_wall("ems_wall", -15.0, 5.0, y1 - 0.35, FL + 1.6, 3.6, ("screen_ems_grid", "screen_ems_load", "screen_ems_dr", "screen_ems_kpi"))
        box("ems_wall_stand", (20.4, 0.5, 1.48), (-5.0, y1 - 0.2, FL), "cyber_navy", bevel=0.02)
        box("ems_wall_header", (20.4, 0.5, 0.8), (-5.0, y1 - 0.2, FL + 5.45), "cyber_navy", bevel=0.02)
        L.text_mesh("ems_title", "ENERGY MANAGEMENT SYSTEM · DEMAND RESPONSE", (-5.0, y1 - 0.47, FL + 5.6), 0.34, 0.03, "white", resolution=3)
        K.soc_rows("ops", (-5.0, 26.0), (20.0, 23.0), (math.radians(-104), math.radians(-76)), FL,
                   ("screen_ems_load", "screen_ems_kpi", "screen_monitor"), seed=700, outfits=(None, "teacher", None, "doctor2"))
        K.holo_table("ems_table", HOLO + (FL,), r=1.2)
        for k, (dx, dy, rz, o) in enumerate(((1.9, -1.4, 2.4, "teacher"), (-1.7, -1.6, 0.8, None), (-1.9, 1.3, -0.6, "doctor2"))):
            L.human(f"ems_p{k}", (HOLO[0] + dx, HOLO[1] + dy, FL), rot_z=rz, seed=720 + k, outfit=o)
        for k in range(3):
            M.server_rack(f"ems_rack{k}", (x1 - 0.6, 3.0 + k * 0.7, FL), rot_z=math.pi, seed=730 + k)
        # demand-response desk by the door: a console with the dispatch screen and an operator
        M.workstation("dr_desk", (1.5, -1.5, FL), rot_z=0.0, screens=("screen_ems_dr", "screen_ems_load"), seed=740, outfit="teacher")
        M.kiosk("ems_kiosk", (-8.0, -3.2, FL), face=-math.pi / 2, screen="screen_ems_kpi")
        empty("pin_dr-ems", (-5.0, 2.0, ROOF + 3.6))
    grid_hologram("ems_holo", HOLO + (FL + 1.15,), r=1.2)


def office_block():
    x0, y0, x1, y1 = OFFICE
    L.set_group("static_building")
    top = FL + OFF_N * OFF_H
    box("off_core", (x1 - x0 - 0.4, y1 - y0 - 0.4, top - G0), ((x0 + x1) / 2, (y0 + y1) / 2, G0), "offwhite", bevel=0.03)
    for f in range(1, OFF_N + 1):  # slab edges
        z = FL + f * OFF_H
        box(f"off_slab{f}", (x1 - x0, y1 - y0, 0.3), ((x0 + x1) / 2, (y0 + y1) / 2, z - 0.3), "white", bevel=0.03)
    # window ribbons on the sides and back, the front (over the hall roof) a living wall with glass slots
    for f in range(OFF_N):
        z = FL + f * OFF_H + 0.9
        box(f"off_win_b{f}", (x1 - x0 - 1.0, 0.06, 2.0), ((x0 + x1) / 2, y1 - 0.17, z), "tower_glass", bevel=0)
        for s, xx in ((-1, x0 + 0.17), (1, x1 - 0.17)):
            box(f"off_win_s{f}{s}", (0.06, y1 - y0 - 1.0, 2.0), (xx, (y0 + y1) / 2, z), "tower_glass", bevel=0)
    rnd = random.Random(55)
    clumps = []
    for f in range(2, OFF_N):
        z = FL + f * OFF_H
        for k in range(5):
            cx = x0 + 2.0 + k * (x1 - x0 - 4.0) / 4
            if k % 2 == 0:
                box(f"off_slot{f}{k}", (3.2, 0.06, 2.2), (cx, y0 + 0.17, z + 0.8), "tower_glass", bevel=0)
            else:
                box(f"off_green{f}{k}", (3.0, 0.06, OFF_H - 0.5), (cx, y0 + 0.16, z + 0.15), "leafv_dark", bevel=0)
                for i in range(6):
                    for j in range(5):
                        if rnd.random() < 0.9:
                            clumps.append(((cx - 1.25 + i * 0.5, y0 + 0.02, z + 0.45 + j * 0.62), 0.3 + rnd.random() * 0.1, rnd.randint(0, 9999)))
    A.foliage("off_living_wall", clumps, subdiv=1)
    # roof: parapet, PV, two small vertical-axis turbines, the company sign
    box("off_parapet", (x1 - x0 + 0.2, y1 - y0 + 0.2, 0.9), ((x0 + x1) / 2, (y0 + y1) / 2, top), "white", bevel=0.03)
    box("off_roof_in", (x1 - x0 - 0.4, y1 - y0 - 0.4, 0.1), ((x0 + x1) / 2, (y0 + y1) / 2, top + 0.02), "panel_grey", bevel=0)
    pv_row("off_pv", x0 + 1.0, x1 - 1.0, y0 + 1.2, top + 0.12, depth=3.0)
    for k, x in enumerate((x0 + 1.4, x1 - 1.4)):
        cyl(f"off_vawt{k}_mast", 0.08, 3.0, (x, y1 - 1.2, top + 0.1), "steel", verts=8)
        with group("move"):
            parts = []
            for b in range(3):
                a = b * math.tau / 3
                pts = [Vector((math.cos(a + t * 1.2) * 0.7, math.sin(a + t * 1.2) * 0.7, 1.2 + t * 2.0)) for t in [i / 6 for i in range(7)]]
                parts.append(C.tubes(f"off_vawt{k}_blade{b}", [(p, q, 0.06) for p, q in zip(pts, pts[1:])], "robot_white", verts=6))
        rot = L.rigid(parts, f"off_vawt{k}", (0, 0, 0))
        L.place(rot, (x, y1 - 1.2, top + 0.1), 0.0, spin="z", spin_speed=2.0)
    L.text_mesh("off_sign", "TKC SMART GRID", ((x0 + x1) / 2, y0 - 0.12, top + 0.22), 0.55, 0.05, "accent_blue", resolution=3)


def carport():
    x0, y0, x1, y1 = PORT
    n = 9
    bw = (x1 - x0) / n
    L.set_group("static_site")
    for k in range(n + 1):
        box(f"bay_line{k}", (0.1, 5.0, 0.005), (x0 + k * bw, (y0 + y1) / 2 - 0.2, G0 + 0.02), "paint_white", bevel=0)
    for k in (1, 4, 7):  # V2G bays painted green
        box(f"bay_v2g{k}", (bw - 0.2, 4.8, 0.004), (x0 + (k + 0.5) * bw, (y0 + y1) / 2 - 0.2, G0 + 0.02), "paint_green", bevel=0)
    for k in range(3):
        box(f"aisle_arrow{k}", (1.6, 0.25, 0.005), (x0 + 5 + k * 8.0, -16.0, G0 + 0.02), "paint_white", bevel=0)
    with group("hot:ev-integration"):
        G.solar_carport("port", x0, x1, y0, y1, z=G0 + 0.02, bays=n)
        for k in (1, 3, 5, 7):
            G.dc_charger(f"dcfc{k}", (x0 + k * bw, y1 - 0.25, G0 + 0.02), -math.pi / 2,
                         screen="screen_v2g" if k in (1, 7) else "screen_charge")
        paints = ("white", "navy", "silver", "brand", "red", "white", "black")
        j = 0
        for k in range(n):
            if k in (2, 6):
                continue
            L.car(f"evcar{k}", (x0 + (k + 0.5) * bw, (y0 + y1) / 2 - 0.4, G0 + 0.02), rot_z=math.pi / 2, paint=paints[j % len(paints)])
            j += 1
        empty("pin_ev-integration", (-5.0, (y0 + y1) / 2, 7.4))


# ---------------------------------------------------------------- homes

def homes():
    rnd = random.Random(300)
    walls = ("house_cream", "offwhite", "facade_beige")
    for row, (yc, hot) in enumerate(((ROW1, "hot:microgrid"), (ROW2, "hot:ami"))):
        with group(hot):
            for i, x in enumerate(HOUSES):
                name = f"house{row}{i}"
                h = G.house(name, (x, yc, G0), w=HW, d=HD, seed=310 + row * 3 + i, wall=walls[(i + row) % 3],
                            timber=(i + row) % 2 == 0, pv=(5, 2), door_x=-1.4 if i % 2 else 1.4)
                front = yc - HD / 2
                dx = -1.4 if i % 2 else 1.4
                G.smart_meter(f"{name}_meter", (x + dx + (1.1 if dx < 0 else -1.1), front - 0.02, G0 + 0.45 + 1.0), -math.pi / 2)
                G.home_battery(f"{name}_hb", (x + HW / 2 + 0.02, yc + 1.6, G0 + 0.45), 0.0)
                if row == 0:  # prosumer EVs in the back gardens on the lane
                    L.car(f"{name}_ev", (x - 0.6, LANE[0] - 1.9, G0 + 0.02), rot_z=0.0 if i % 2 else math.pi, paint=("white", "sky_blue", "silver")[i])
                    G.wall_charger(f"{name}_wc", (x - 0.2, yc + HD / 2 + 0.02, G0 + 1.4), math.pi / 2)
            if row == 0:
                # the community microgrid: a shared battery, the controller with the P2P trading screen, a sign
                cx, cy = 41.8, -13.4
                box("cb_plinth", (2.0, 3.6, 0.2), (cx, cy, G0), "concrete", bevel=0.02)
                box("cb_body", (1.6, 3.0, 2.3), (cx, cy, G0 + 0.2), "robot_white", bevel=0.05)
                box("cb_band", (1.62, 3.02, 0.16), (cx, cy, G0 + 2.26), "accent_blue", bevel=0)
                box("cb_led", (1.2, 0.02, 0.05), (cx, cy - 1.51, G0 + 2.05), "led_green", bevel=0)
                M.screen_at("cb_scr", (0.9, 0.5), (cx, cy - 1.52, G0 + 1.45), -math.pi / 2, "screen_p2p", bezel=0.03)
                L.text_mesh("cb_txt", "MICROGRID", (cx, cy - 1.53, G0 + 0.75), 0.2, 0.02, "accent_blue", resolution=3)
                C.smart_cabinet("mg_ctl", (cx, -17.4, G0), -math.pi / 2, screen="screen_p2p", w=1.0, d=0.5, h=1.5)
                empty("pin_microgrid", (28.0, ROW1, 12.6))
            else:
                empty("pin_ami", (28.0, ROW2, 12.6))
    # gardens: front hedges with a gap at each path, paths to the doors, a few garden trees
    L.set_group("static_homes")
    for row, yc in enumerate((ROW1, ROW2)):
        front = yc - HD / 2
        edge = -19.0 if row == 0 else LANE[1]
        for i, x in enumerate(HOUSES):
            dx = -1.4 if i % 2 else 1.4
            pad(f"path{row}{i}", x + dx - 0.6, edge, x + dx + 0.6, front - 0.8, "paving")
            A.bushes_along(f"hedge{row}{i}a", [(x - HW / 2 - 0.6, edge + 0.4), (x + dx - 0.9, edge + 0.4)], spacing=0.75, z=G0, r=0.38, seed=330 + row * 7 + i)
            A.bushes_along(f"hedge{row}{i}b", [(x + dx + 0.9, edge + 0.4), (x + HW / 2 + 0.6, edge + 0.4)], spacing=0.75, z=G0, r=0.38, seed=340 + row * 7 + i)
        for i, x in enumerate(HOUSES[:-1]):
            G.picket(f"picket{row}{i}", [((x + HOUSES[i + 1]) / 2, edge + 0.6), ((x + HOUSES[i + 1]) / 2, yc + HD / 2 + 2.0)])
    for k, (x, y) in enumerate(((16.0, 9.8), (25.5, 9.6), (34.5, 9.6), (41.8, 9.5))):
        A.tree(f"gtree{k}", (x, y, G0), h=5.5 + rnd.random() * 1.5, spread=0.85, seed=360 + k)
    # 22 kV line along the lane on concrete poles: riser from the underground feeder, a pole transformer,
    # the AMI data concentrator that collects every smart meter
    poles = []
    for k, x in enumerate((15.2, 24.0, 32.8, 41.6)):
        g = group("hot:ami") if k == 1 else group("static_homes")
        with g:
            poles.append(G.dist_pole(f"pole{k}", (x, LANE[0] - 0.5, G0), rot_z=math.pi / 2, transformer=k == 2, concentrator=k == 1,
                                     lamp=math.pi / 2, riser=k == 0))
    L.set_group("static_homes")
    for k in range(len(poles) - 1):
        for i, (a, b) in enumerate(zip(poles[k], poles[k + 1])):
            G.span(f"mv{k}_{i}", a, b, sag=0.35, r=0.025)
    for i, a in enumerate(poles[-1]):
        G.span(f"mve_{i}", a, (BASE[0] - 0.3, a.y, a.z + 0.15), sag=0.1, r=0.025)


# ---------------------------------------------------------------- renewables

def renewables():
    x0, y0, x1, y1 = FARM
    L.set_group("static_site")
    T.fence("farm_fence", [(17.0, y0), (x1, y0), (x1, y1), (x0, y1), (x0, y0), (13.6, y0)], h=2.2)
    with group("hot:renewable-energy"):
        for r, y in enumerate((13.8, 18.4)):
            G.solar_table(f"pvt{r}a", 14.2, 27.6, y)
            G.solar_table(f"pvt{r}b", 29.0, 42.6, y)
        G.inverter_station("pv_inv", (25.6, 22.6, G0), rot_z=0.0)
        for k, (x, y) in enumerate(TURBINES):
            box(f"wt{k}_base", (3.0, 3.0, 0.4), (x, y, G0), "concrete", bevel=0.05)
            T.wind_turbine(f"wt{k}", (x, y, G0 + 0.4), h=20.0, blade=7.2)
        empty("pin_renewable-energy", (28.0, 16.0, 9.0))


# ---------------------------------------------------------------- life

def life():
    loops = [
        (racetrack(-40.0, -32.6, 40.0, -31.4, 0.5), 3, 1.25, (None, None, None), G0),  # far sidewalk
        (racetrack(-40.0, -21.8, 40.0, -20.6, 0.5), 4, 1.3, (None, "teacher", None, None), G0),  # front sidewalk
        (racetrack(-12.0, -6.4, 4.0, -5.0, 0.6), 2, 1.0, ("teacher", None), G0 + 0.02),  # the plaza in front of the hall
        (racetrack(-10.0, -2.5, -0.5, -1.9, 0.3), 2, 0.7, ("doctor2", None), FL),  # visitors in the hall's lobby strip
        (racetrack(16.0, -3.9, 40.0, -2.6, 0.5), 2, 1.1, (None, "teacher"), G0 + 0.02),  # residents on the lane
        (racetrack(-30.0, -17.4, -22.8, -16.4, 0.4), 1, 0.9, ("worker",), G0 + 0.02),  # technician in the battery yard
    ]
    n = 0
    for path, count, speed, outfits, z in loops:
        length = L.path_length(path, True)
        for j in range(count):
            L.walker(f"walker{n}", path, speed, (j + 0.3) * length / count, seed=1000 + n, z=z, outfit=outfits[j])
            n += 1
    # inspection drone over the solar farm
    ring = M.circle(8.0, 40, 28.0, 16.0)
    with group("move"):
        rotors = M.drone("drone", (0, 0, 0), 0.0)
    body = L.rigid([o for o in L._parts("drone") if o not in rotors], "drone")
    for i, r in enumerate(rotors):
        c = L._top_centre([r])
        rr = L.rigid([r], f"drone_rotor{i}", (c[0], c[1], c[2] - 0.006))
        rr["spin"], rr["spin_speed"] = "z", 30.0
        rr.parent = body
    L._on_path(body, "drive", 4.0, ring, True, 0.0, 9.0)
    v, half = 7.0, BASE[0] + 8.0
    for i, (lane_y, sign) in enumerate(((ROAD_Y + 1.8, 1), (ROAD_Y - 1.8, -1))):
        lane = [(-sign * half, lane_y), (sign * half, lane_y)]
        for j in range(2):
            L.driver(f"car{i}{j}", lane, v, j * half + i * 13.0, closed=False, paint=(("white", "navy"), ("sky_blue", "silver"))[i][j], kind=("car", "van")[j])


def icons():
    with group("move"):
        for i, (x, y, z, kind) in enumerate(((-34.4, -4.8, 6.4, "battery"), (-5.0, -9.8, 5.6, "ev"), (-14.0, -0.2, ROOF - 1.2, "chart"),
                                             (28.0, -12.0, 11.0, "home"), (28.0, 4.6, 11.0, "meter"), (20.0, 16.0, 6.0, "sun"), (36.0, 21.0, 31.0, "wind"))):
            L.plane(f"icon_{kind}{i}", (1.1, 1.1), (x, y, z), f"screen_icon_{kind}", rot=(math.pi / 2, 0, math.pi))
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
    x0, y0, x1, y1 = HALL
    for i, (ax0, ay0, ax1, ay1, z) in enumerate(((x0, y0, x1, y1, ROOF - 0.1), (PORT[0], PORT[1], PORT[2], PORT[3], 2.7))):
        a = bpy.data.lights.new(f"Panel{i}", "AREA")
        a.shape = "RECTANGLE"
        a.size, a.size_y = (ax1 - ax0) * 0.85, (ay1 - ay0) * 0.85
        a.energy = (4.0 if i == 0 else 2.0) * (ax1 - ax0) * (ay1 - ay0)
        a.color = (1.0, 0.97, 0.92)
        ob = bpy.data.objects.new(f"Panel{i}", a)
        L.COL.objects.link(ob)
        ob.location = ((ax0 + ax1) / 2, (ay0 + ay1) / 2, z)


ATLASES = {
    "building": ["static_building", "hot:dr-ems", "hot:ev-integration", "hot:energy-storage"],
    "homes": ["static_homes", "hot:ami", "hot:microgrid"],
    "site": ["static_site"],
    "grid": ["static_grid", "hot:renewable-energy"],
}


def build():
    L.reset_scene()
    site()
    feed = transmission()
    substation(feed)
    bess()
    control_hall()
    ems_interior()
    office_block()
    carport()
    homes()
    renewables()
    life()
    icons()
    lighting()
    for name, groups in ATLASES.items():
        bpy.context.scene[f"atlas_{name}"] = ",".join(groups)
    bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(BLEND))
    print("objects:", len(bpy.context.scene.objects), "tris:", sum(len(o.data.polygons) for o in bpy.context.scene.objects if o.type == "MESH"))


if __name__ == "__main__":
    build()
