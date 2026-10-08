"""Smart Cyber Security - a high-tech cyber defence centre after the Cyber Security AI artwork.

The command deck is the hero: a hexagonal glass deck lifted 10 m on a podium and cantilevered over the plaza on
V-columns, with a lit slab edge and a diagrid glass roof. On it the security operations centre (video wall, curved
tiered analyst rows, the network-shield hologram), the threat-intelligence wing (world threat map, fusion globe),
the cyber range and the consulting room. The glass podium below holds the secure lobby, an atrium with panoramic
lifts up to the deck and the cloud data hall. Behind, the Cyber Tower (diagrid, LED lines, shield emblem, SIGINT
dishes, spire) is linked to the deck by a sky bridge. Around: ground-station dishes, chillers, generators, a secure
fence with gatehouse, staff car park under a solar carport, a street with traffic and people.

blender -b --factory-startup --python public/Blender/scripts/smart_cybersecurity.py
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
import tkc_cyber as K  # noqa: E402
import tkc_edu as E  # noqa: E402
import tkc_lib as L  # noqa: E402
import tkc_med as M  # noqa: E402
from tkc_lib import box, cyl, empty, group, sphere  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
BLEND = os.path.join(HERE, "..", "smart_cybersecurity.blend")

# ---------------------------------------------------------------- layout
GROUND = 0.3
PX0, PX1, PY0, PY1 = -26.0, 18.0, -6.0, 14.0  # glass podium (ground floor)
POD_ROOF = GROUND + 6.0  # underside of the podium roof slab
LOBBY_X, HALL_X = -14.0, 2.0  # ground: lobby | atrium | data hall
DOOR_Y = (-4.6, -1.4)  # lobby door in the podium's left wall
DECK = 10.0  # command deck floor
DECK_T = 1.2  # deck slab (underside at 8.8)
DECK_H = 7.0  # deck glass height: roof at 17
DECK_RAW = [(-30.0, -2.0), (-22.0, -16.0), (14.0, -16.0), (22.0, -2.0), (14.0, 12.0), (-22.0, 12.0)]
DECK_R = 2.5
XL, XR = -14.0, 6.0  # deck: range / consulting | SOC | threat intelligence
HOLO = (-4.0, -7.5)  # network hologram over its projection table
FOCUS = (-4.0, 17.0)  # the analyst rows curve round this point behind the video wall
TOWER = (-4.0, 23.5, 16.0, 9.0, 62.0)  # x, y, w, d, h
BASE = (40.0, 31.0)
ROAD_Y = -25.0
FENCE_Y = -16.4
GATE = (-38.0, -31.0)  # drive opening in the fence


def rect(x0, y0, x1, y1):
    return [(x0, y0), (x1, y0), (x1, y1), (x0, y1)]


def racetrack(x0, y0, x1, y1, r):
    return A.fillet_poly(rect(x0, y0, x1, y1), r, 6)


def deck_outline(inset=0.0):
    return A.outline(DECK_RAW, DECK_R, inset)


def glass_wall(name, a, b, z0, h=3.0, post=1.8, frame="hosp_white"):
    """Glass partition from a to b (xy) with posts and a head rail."""
    (x0, y0), (x1, y1) = a, b
    ln = math.hypot(x1 - x0, y1 - y0)
    ang = math.atan2(y1 - y0, x1 - x0)
    c = ((x0 + x1) / 2, (y0 + y1) / 2)
    box(f"{name}_glass", (ln, 0.04, h), (c[0], c[1], z0), "glass", bevel=0, rot=(0, 0, ang))
    box(f"{name}_head", (ln, 0.1, 0.1), (c[0], c[1], z0 + h), frame, bevel=0, rot=(0, 0, ang))
    n = max(1, round(ln / post))
    for k in range(n + 1):
        box(f"{name}_post{k}", (0.08, 0.08, h), (x0 + (x1 - x0) * k / n, y0 + (y1 - y0) * k / n, z0), frame, bevel=0)


def edge_point(a, b, t, inset):
    """Point at fraction t along the deck edge a->b, `inset` metres inside, and the angle looking inwards."""
    (x0, y0), (x1, y1) = a, b
    ex, ey = x1 - x0, y1 - y0
    ln = math.hypot(ex, ey)
    nx, ny = -ey / ln, ex / ln  # left normal = inside for a CCW outline
    return (x0 + ex * t + nx * inset, y0 + ey * t + ny * inset), math.atan2(ny, nx)


# ---------------------------------------------------------------- podium (ground floor)

def podium():
    L.set_group("static_building")
    box("pod_slab", (PX1 - PX0 + 1.0, PY1 - PY0 + 1.0, GROUND - 0.02), ((PX0 + PX1) / 2, (PY0 + PY1) / 2, 0), "hosp_white", bevel=0.03)
    for name, x0, x1, mat in (("floor_lobby", PX0, LOBBY_X, "terrazzo"), ("floor_atrium", LOBBY_X, HALL_X, "terrazzo"), ("floor_hall", HALL_X, PX1, "tile_line")):
        box(name, (x1 - x0, PY1 - PY0, 0.02), ((x0 + x1) / 2, (PY0 + PY1) / 2, GROUND - 0.02), mat, bevel=0)
    for k in range(1, 27):
        x = HALL_X + k * 0.6
        if x < PX1:
            box(f"hall_grid_x{k}", (0.02, PY1 - PY0, 0.004), (x, (PY0 + PY1) / 2, GROUND), "lightgray", bevel=0)
    for k in range(1, 34):
        y = PY0 + k * 0.6
        if y < PY1:
            box(f"hall_grid_y{k}", (PX1 - HALL_X, 0.02, 0.004), ((HALL_X + PX1) / 2, y, GROUND), "lightgray", bevel=0)
    # walls: back and right solid, left with the lobby door, the street front all glass
    h = POD_ROOF - GROUND
    box("pod_back", (PX1 - PX0 + 1.0, 0.5, h), ((PX0 + PX1) / 2, PY1 + 0.25, GROUND), "hosp_white", bevel=0.02)
    box("pod_right", (0.5, PY1 - PY0 + 0.5, h), (PX1 + 0.25, (PY0 + PY1) / 2, GROUND), "hosp_white", bevel=0.02)
    lx = PX0 - 0.25
    box("pod_left_a", (0.5, DOOR_Y[0] - PY0 + 0.25, h), (lx, (PY0 - 0.25 + DOOR_Y[0]) / 2, GROUND), "hosp_white", bevel=0.02)
    box("pod_left_b", (0.5, PY1 + 0.5 - DOOR_Y[1], h), (lx, (DOOR_Y[1] + PY1 + 0.5) / 2, GROUND), "hosp_white", bevel=0.02)
    box("pod_left_lintel", (0.5, DOOR_Y[1] - DOOR_Y[0], POD_ROOF - 3.2), (lx, sum(DOOR_Y) / 2, 3.2), "hosp_white", bevel=0.02)
    for k, y in enumerate((DOOR_Y[0] + 0.7, DOOR_Y[1] - 0.7)):  # sliding glass leaves, parted
        box(f"door_leaf{k}", (0.04, 1.3, 2.8), (PX0 - 0.35, y, GROUND), "glass", bevel=0)
    box("pod_front_glass", (PX1 - PX0, 0.04, h - 0.6), ((PX0 + PX1) / 2, PY0 - 0.1, GROUND + 0.3), "glass", bevel=0)
    for k in range(int((PX1 - PX0) / 2.2) + 1):
        x = PX0 + k * (PX1 - PX0) / int((PX1 - PX0) / 2.2)
        for j in range(2):
            box(f"pod_mull{k}_{j}", (0.1, 0.14, h / 2), (x, PY0 - 0.1, GROUND + j * h / 2), "white", bevel=0)
    box("pod_sill", (PX1 - PX0, 0.3, 0.3), ((PX0 + PX1) / 2, PY0 - 0.1, GROUND), "white", bevel=0.02)
    box("pod_transom", (PX1 - PX0, 0.16, 0.14), ((PX0 + PX1) / 2, PY0 - 0.1, GROUND + 3.3), "white", bevel=0)
    box("pod_roof", (PX1 - PX0 + 1.0, PY1 - PY0 + 1.0, 0.5), ((PX0 + PX1) / 2, (PY0 + PY1) / 2, POD_ROOF), "hosp_white", bevel=0.05)
    box("pod_roof_led", (PX1 - PX0 + 1.04, 0.04, 0.06), ((PX0 + PX1) / 2, PY0 - 0.53, POD_ROOF + 0.2), "led_cyan", bevel=0)
    # inner glass: atrium | data hall
    glass_wall("gw_hall_a", (HALL_X, PY0), (HALL_X, 3.0), GROUND, h=h)
    glass_wall("gw_hall_b", (HALL_X, 4.6), (HALL_X, PY1), GROUND, h=h)
    A.downlights("pod_dl", rect(PX0 + 1, PY0 + 1, PX1 - 1, PY1 - 1), POD_ROOF - 0.03, spacing=3.0, mat="led_white")


def lobby_and_atrium():
    L.set_group("static_building")
    # secure lobby: guard desk, walk-through detector and baggage x-ray, speed gates into the atrium, sofa, kiosk
    M.curved_desk("guard_desk", (-22.0, -6.4), 1.0, 1.5, math.radians(20), math.radians(160), GROUND)
    L.human("desk_guard", (-22.0, -5.85, GROUND), rot_z=-math.pi / 2, seed=560, outfit="worker")
    M.screen_at("guard_scr", (0.5, 0.3), (-22.0, -5.15, GROUND + 1.3), -math.pi / 2, "screen_sec", bezel=0.02)
    box("wtmd_l", (0.3, 0.12, 2.2), (-19.0, 0.6, GROUND), "silver", bevel=0.02)
    box("wtmd_r", (0.3, 0.12, 2.2), (-19.0, 1.6, GROUND), "silver", bevel=0.02)
    box("wtmd_top", (0.3, 1.12, 0.2), (-19.0, 1.1, GROUND + 2.2), "silver", bevel=0.02)
    box("wtmd_led", (0.02, 0.6, 0.05), (-19.16, 1.1, GROUND + 2.3), "led_green", bevel=0)
    box("xray_body", (1.6, 1.0, 1.3), (-19.0, 4.6, GROUND), "robot_white", bevel=0.04)
    box("xray_belt", (3.2, 0.7, 0.08), (-19.0, 4.6, GROUND + 0.75), "belt", bevel=0)
    box("xray_tunnel", (1.62, 0.8, 0.5), (-19.0, 4.6, GROUND + 0.83), "frame_dark", bevel=0)
    glass_wall("gw_lobby_a", (LOBBY_X, PY0), (LOBBY_X, -3.2), GROUND, h=POD_ROOF - GROUND)  # secure line: lobby | atrium
    glass_wall("gw_lobby_b", (LOBBY_X, 0.4), (LOBBY_X, PY1), GROUND, h=POD_ROOF - GROUND)
    for k in range(3):  # the only way through: speed gates in the gap
        K.turnstile(f"gate{k}", (LOBBY_X, -2.55 + k * 1.3, GROUND), rot_z=0.0)
    L.sofa("lobby_sofa", (-24.8, 10.0, GROUND), w=2.2, rot_z=0.0, fabric="fabriclight")
    M.kiosk("visitor_kiosk", (-25.3, 1.0, GROUND), face=0.0, screen="screen_kiosk")
    L.potted_plant("lobby_plant0", (-25.0, 13.0, GROUND), h=1.4, seed=570, pot="accent_blue")
    # atrium: reception, a big threat-map wall, LED medallion, panoramic lifts up to the deck
    M.curved_desk("reception", (-6.0, 7.0), 2.0, 2.6, math.radians(200), math.radians(340), GROUND)
    for k, a in enumerate((240, 300)):
        ang = math.radians(a)
        L.human(f"receptionist{k}", (-6.0 + math.cos(ang) * 1.6, 7.0 + math.sin(ang) * 1.6, GROUND), rot_z=ang + math.pi, seed=575 + k, outfit="teacher")
    M.screen_at("atrium_wall", (10.0, 3.6), (-6.0, PY1 - 0.08, GROUND + 2.5), -math.pi / 2, "screen_soc_map", bezel=0.1)
    M.disc_ring("medallion", 3.0, 2.85, (-6.0, -1.0, GROUND + 0.01), 0.02, "led_cyan", n=64)
    M.disc_ring("medallion2", 1.6, 1.5, (-6.0, -1.0, GROUND + 0.01), 0.02, "led_cyan", n=48)
    L.text_mesh("medallion_txt", "TKC", (-6.0, -1.6, GROUND + 0.005), 0.9, 0.01, "accent_blue", rot=(0, 0, 0), resolution=3)
    for k, y in enumerate((-1.5, 2.0)):
        K.glass_lift(f"lift{k}", (-12.4, y, GROUND), DECK + 2.6, car_z=GROUND + 0.1 if k == 0 else DECK)
    for k, (x, y) in enumerate(((0.8, -4.8), (-13.0, 12.6), (0.8, 12.6))):
        L.potted_plant(f"atrium_plant{k}", (x, y, GROUND), h=1.8, seed=578 + k, pot="accent_blue")
    for k, (x, y, rz, o) in enumerate(((-8.5, -3.4, 0.6, None), (-7.6, -4.1, 2.2, "doctor2"), (-2.8, 2.6, -1.2, "teacher"))):
        L.human(f"atrium_p{k}", (x, y, GROUND), rot_z=rz, seed=580 + k, outfit=o)


def data_hall():
    with group("hot:app-cloud-security"):
        for a, (ya, yb) in enumerate(((0.5, 3.3), (7.0, 9.8))):  # two contained cold aisles
            for side, (yy, rz) in enumerate(((ya, math.pi), (yb, 0.0))):
                for i in range(18):
                    M.server_rack(f"rack{a}{side}_{i}", (3.6 + i * 0.7, yy, GROUND), rot_z=rz, seed=660 + a * 40 + side * 20 + i)
            cy, xm, ln = (ya + yb) / 2, 3.25 + 18 * 0.35, 18 * 0.7
            box(f"aisle{a}_roof", (ln, yb - ya - 1.0, 0.04), (xm, cy, GROUND + 2.2), "glass", bevel=0)
            for s in (-1, 1):
                box(f"aisle{a}_rail{s}", (ln, 0.06, 0.08), (xm, cy + s * (yb - ya - 1.0) / 2, GROUND + 2.2), "frame_dark", bevel=0)
            box(f"aisle{a}_door", (0.04, yb - ya - 1.0, 2.2), (3.2, cy, GROUND), "glass", bevel=0)
            box(f"aisle{a}_led", (ln, 0.03, 0.03), (xm, cy, GROUND + 2.16), "led_blue", bevel=0)
            box(f"aisle{a}_tray", (ln, 0.5, 0.08), (xm, cy, GROUND + 3.0), "rack_orange", bevel=0)
            for k in range(4):
                cyl(f"aisle{a}_hanger{k}", 0.02, POD_ROOF - GROUND - 3.1, (4.0 + k * 3.8, cy, GROUND + 3.08), "steel", verts=6)
        for k, y in enumerate((0.0, 4.4, 8.8, 12.6)):
            box(f"crac{k}", (0.9, 1.8, 2.1), (PX1 - 0.55, y, GROUND), "panel_grey", bevel=0.03)
            box(f"crac{k}_grille", (0.02, 1.5, 0.9), (PX1 - 1.01, y, GROUND + 1.0), "frame_dark", bevel=0)
            box(f"crac{k}_led", (0.02, 0.3, 0.06), (PX1 - 1.01, y, GROUND + 1.9), "led_green", bevel=0)
        L.human("dc_tech", (8.0, -3.2, GROUND), rot_z=math.pi / 2 + 0.2, seed=700, outfit="worker")
        box("dc_cart", (0.8, 0.5, 0.9), (9.0, -3.2, GROUND), "silver", bevel=0.03)
        L.text_mesh("dc_title", "CLOUD DATA HALL", ((HALL_X + PX1) / 2, PY1 - 0.06, GROUND + 3.8), 0.42, 0.04, "accent_blue", resolution=3)
        empty("pin_app-cloud-security", (10.0, PY0 - 1.2, GROUND + 4.8))
    K.holo_lock("cloud_lock", (10.0, 5.2, GROUND + 4.3), s=1.2)


# ---------------------------------------------------------------- command deck

def deck():
    L.set_group("static_building")
    out = deck_outline()
    A.solid("deck_slab", out, DECK - DECK_T, DECK_T, "white", bevel=0.15)
    A.ring("deck_edge_led", deck_outline(-0.03), deck_outline(0.02), DECK - 0.62, 0.1, "led_cyan")
    A.downlights("deck_dl", deck_outline(1.6), DECK - DECK_T - 0.02, spacing=3.2, mat="led_white")
    # floor finishes by zone
    inner = deck_outline(0.3)
    zones = (("deck_floor_range", -40, XL, -40, 0.0, "carpet"), ("deck_floor_consult", -40, XL, 0.0, 40, "woodlight"),
             ("deck_floor_soc", XL, XR, -40, 40, "cyber_floor"), ("deck_floor_ti", XR, 40, -40, 40, "carpet"))
    for name, x0, x1, y0, y1, mat in zones:
        poly = K.clip_y(K.clip_x(inner, x0, x1), y0, y1)
        if len(poly) >= 3:
            A.solid(name, poly, DECK, 0.02, mat)
    # glass skin, roof glass and its diagrid, a lit roof ring
    K.glass_skin("deck_skin", deck_outline(0.25), DECK, DECK_H)
    A.solid("deck_roof_glass", deck_outline(0.25), DECK + DECK_H, 0.06, "glass")
    K.diagrid_roof("deck_roof", deck_outline(0.6), DECK + DECK_H - 0.32)
    A.ring("deck_roof_ring", deck_outline(-0.1), deck_outline(0.7), DECK + DECK_H - 0.4, 0.8, "white")
    A.ring("deck_roof_led", deck_outline(-0.13), deck_outline(-0.08), DECK + DECK_H - 0.1, 0.08, "led_cyan")
    L.text_mesh("deck_name", "TKC CYBER DEFENSE CENTER", (-4.0, -16.17, DECK + DECK_H - 0.32), 0.52, 0.05, "accent_blue", resolution=3)
    # inner partitions: glass with door gaps, a solid scoreboard wall between the range and the consulting room
    glass_wall("gw_left_a", (XL, -15.8), (XL, -2.2), DECK)
    glass_wall("gw_left_b", (XL, -0.6), (XL, 11.8), DECK)
    glass_wall("gw_right_a", (XR, -15.8), (XR, -2.2), DECK)
    glass_wall("gw_right_b", (XR, -0.6), (XR, 11.8), DECK)
    x_left = -30.0 + 8.0 * (2.0 / 14.0) + 0.4  # where y = 0 meets the deck's left edges
    box("wall_range", (XL - 2.0 - x_left, 0.3, 4.6), ((x_left + XL - 2.0) / 2, 0.0, DECK), "hosp_white", bevel=0.02)
    box("wall_range_cap", (XL - 2.0 - x_left, 0.34, 0.08), ((x_left + XL - 2.0) / 2, 0.0, DECK + 4.6), "accent_blue", bevel=0.01)
    # structure: short columns over the podium roof, V-columns under the cantilever and the points
    inside_pod = A.rect_poly((PX0 + PX1) / 2, (PY0 + PY1) / 2, PX1 - PX0 - 1.0, PY1 - PY0 - 1.0)
    for i, (x, y) in enumerate(A.grid_in_poly(deck_outline(2.0), 8.0, 0.0, 3)):
        if A.point_in_poly((x, y), inside_pod):
            cyl(f"deck_col{i}", 0.5, DECK - DECK_T - POD_ROOF - 0.5, (x, y, POD_ROOF + 0.5), "white", verts=24)
    for k, (x, y, ax) in enumerate(((-18.0, -12.6, 0.0), (-4.0, -13.4, 0.0), (10.0, -12.6, 0.0), (19.5, -3.0, math.pi / 2))):  # left point: 4 m cantilever
        K.v_column(f"vcol{k}", (x, y, 0.16), DECK - DECK_T, spread=2.4, axis=ax)
    # stair core behind the deck (fire escape from deck to ground) and the sky bridge to the tower
    box("stair_core", (4.0, 4.0, DECK + DECK_H + 1.2), (-18.0, 14.2, 0.16), "panel_grey", bevel=0.05)
    box("stair_core_glass", (1.0, 0.06, DECK + DECK_H - 1.0), (-18.0, 12.17, 1.0), "cyber_glass", bevel=0)
    tx, ty, tw, td, th = TOWER
    by0, by1 = 11.6, ty - td / 2
    box("bridge_floor", (3.2, by1 - by0, 0.4), (tx, (by0 + by1) / 2, DECK - 0.4), "white", bevel=0.03)
    box("bridge_glass", (3.0, by1 - by0, 3.0), (tx, (by0 + by1) / 2, DECK), "glass", bevel=0)
    box("bridge_roof", (3.4, by1 - by0, 0.3), (tx, (by0 + by1) / 2, DECK + 3.0), "white", bevel=0.03)
    for s in (-1, 1):
        box(f"bridge_led{s}", (0.04, by1 - by0, 0.06), (tx + s * 1.62, (by0 + by1) / 2, DECK - 0.25), "led_cyan", bevel=0)


def soc():
    hx, hy = HOLO
    with group("hot:network-security"):
        K.video_wall("vwall", -12.4, 4.4, 10.9, DECK + 1.4, 3.4, ("screen_soc_alerts", "screen_soc_net", "screen_soc_map", "screen_soc_kpi"))
        box("vwall_stand", (16.8, 0.5, 1.28), (-4.0, 11.05, DECK), "cyber_navy", bevel=0.02)
        box("vwall_header", (16.8, 0.5, 0.9), (-4.0, 11.05, DECK + 4.98), "cyber_navy", bevel=0.02)
        L.text_mesh("soc_title", "SECURITY OPERATIONS CENTER", (-4.0, 10.78, DECK + 5.1), 0.5, 0.04, "white", resolution=3)
        K.holo_table("holo_table", (hx, hy, DECK), r=1.5)
        L.human("soc_lead", (hx + 2.3, hy - 1.9, DECK), rot_z=math.pi * 0.75, seed=501, outfit="teacher")
        L.human("soc_guest0", (hx - 2.2, hy - 2.2, DECK), rot_z=math.pi * 0.25, seed=502)
        L.human("soc_guest1", (hx - 2.9, hy - 1.2, DECK), rot_z=0.1, seed=503, outfit="doctor2")
        for k, x in enumerate((-13.2, 5.2)):
            M.server_rack(f"core_rack{k}", (x, 10.2, DECK), rot_z=math.pi / 2 if k == 0 else -math.pi / 2, seed=600 + k)
        empty("pin_network-security", (hx, hy, DECK + 8.4))
    K.network_hologram("net_holo", (hx, hy, DECK + 4.0), size=2.4)
    # the cyber shield over the whole deck: two flat hexagon rings turning above the roof
    for k, (r, dz, sp) in enumerate(((9.0, 3.2, 0.12), (6.2, 4.6, -0.18))):
        with group("move"):
            ring = M.disc_ring(f"shield_ring{k}", r, r - 0.14, (-4.0, -2.0, DECK + DECK_H + dz), 0.05, "holo", n=6)
        ring["spin"], ring["spin_speed"] = "z", sp
    for k in range(4):  # floating panels round the shield
        a = math.pi / 4 + k * math.pi / 2
        c = (hx + math.cos(a) * 3.2, hy + math.sin(a) * 3.2, DECK + 3.4)
        with group("move"):
            L.plane(f"holo_panel{k}", (1.8, 1.1), c, ("screen_soc_net", "screen_soc_alerts", "screen_soc_kpi", "screen_soc_map")[k], rot=(math.pi / 2, 0, a + math.pi / 2))
        bpy.data.objects[f"holo_panel{k}"]["bob"] = k * 1.3
    with group("hot:endpoint-security"):
        K.soc_rows("analyst", FOCUS, (8.5, 11.5, 14.5), (math.radians(-125), math.radians(-55)), DECK,
                   ("screen_edr", "screen_soc_alerts", "screen_monitor"), seed=520, outfits=(None, "teacher", None, "doctor2"))
        K.endpoint_bar("endpoints", (-10.0, -13.2, DECK), rot_z=0.0)
        L.human("ep_visitor", (-9.6, -14.2, DECK), rot_z=math.pi / 2, seed=540)
        empty("pin_endpoint-security", (-6.0, 6.0, DECK + 8.4))
    # floor: circuit traces out of the projection ring, the artwork's floor lettering
    L.set_group("static_building")
    rnd = random.Random(760)
    for k in range(8):
        a = k * math.pi / 4 + math.pi / 8
        p0 = Vector((hx + math.cos(a) * 3.9, hy + math.sin(a) * 3.9))
        p1 = p0 + Vector((math.cos(a), math.sin(a))) * rnd.uniform(0.8, 1.8)
        p2 = Vector((p1.x + (2.0 if math.cos(a) > 0 else -2.0), p1.y))
        if not (XL + 0.6 < p2.x < XR - 0.6 and -15.0 < p2.y < 1.5):
            continue
        for j, (a_, b_) in enumerate(((p0, p1), (p1, p2))):
            c = (a_ + b_) / 2
            box(f"trace{k}_{j}", ((b_ - a_).length, 0.05, 0.01), (c.x, c.y, DECK), "led_cyan", bevel=0, rot=(0, 0, math.atan2(b_.y - a_.y, b_.x - a_.x)))
        box(f"trace_pad{k}", (0.3, 0.3, 0.012), (p2.x, p2.y, DECK), "led_cyan", bevel=0)
    L.text_mesh("floor_txt", "CYBER SECURITY", (hx, -14.9, DECK + 0.004), 0.8, 0.01, "sky_blue", rot=(0, 0, 0), resolution=3)


def threat_intel():
    a, b = DECK_RAW[3], DECK_RAW[4]  # the deck's back-right edge: the threat wall stands along it
    with group("hot:threat-intelligence"):
        for k, (t, scr) in enumerate(((0.3, "screen_threat_map"), (0.7, "screen_threat_feed"))):
            (x, y), face = edge_point(a, b, t, 0.9)
            M.screen_at(f"ti_scr{k}", (6.2, 2.8), (x, y, DECK + 2.8), face, scr, bezel=0.12, depth=0.2)
            box(f"ti_stand{k}", (5.6, 0.4, 1.3), (x - math.cos(face) * 0.25, y - math.sin(face) * 0.25, DECK), "cyber_navy", bevel=0.02, rot=(0, 0, face + math.pi / 2))
        (x, y), face = edge_point(a, b, 0.5, 0.9)
        L.text_mesh("ti_title", "THREAT INTELLIGENCE", (x, y, DECK + 4.5), 0.4, 0.04, "accent_blue", rot=(math.pi / 2, 0, face + math.pi / 2), resolution=3)
        for i, t in enumerate((0.22, 0.5, 0.78)):
            (x, y), face = edge_point(a, b, t, 4.4)
            M.workstation(f"ti_ws{i}", (x, y, DECK), rot_z=face + math.pi / 2, screens=("screen_threat_feed", "screen_monitor"), seed=630 + i, outfit=(None, "doctor2", "teacher")[i])
        K.holo_table("ti_table", (12.5, -9.5, DECK), r=0.9)
        L.human("ti_analyst", (13.9, -10.2, DECK), rot_z=math.pi * 0.8, seed=640, outfit="teacher")
        M.workstation("ti_darkweb", (9.0, -13.2, DECK), rot_z=0.0, screens=("screen_threat_feed", "screen_code"), seed=650, outfit="student")
        M.server_rack("ti_sigint", (7.0, 9.6, DECK), rot_z=-math.pi / 2, seed=651)
        empty("pin_threat-intelligence", (14.0, -3.0, DECK + 8.4))
    K.holo_globe("ti_globe", (12.5, -9.5, DECK + 2.1), r=0.65)


def consulting():
    """Cyber range (front) and consulting room (back) on the deck's left wing - the consulting services hotspot."""
    with group("hot:consulting"):
        M.screen_at("range_board", (7.0, 2.6), (-22.0, -0.18, DECK + 2.7), -math.pi / 2, "screen_cyber_range", bezel=0.08)
        L.text_mesh("range_title", "CYBER RANGE", (-22.0, -0.18, DECK + 4.08), 0.36, 0.04, "accent_blue", resolution=3)
        for row, (y, xs) in enumerate(((-5.4, (-25.0, -21.0, -17.0)), (-9.4, (-23.0, -19.4, -15.8)))):
            for i, x in enumerate(xs):
                M.workstation(f"trainee{row}{i}", (x, y, DECK), rot_z=0.0, screens=("screen_code", "screen_cyber_range"), seed=580 + row * 3 + i,
                              outfit=(None, "student", "student2")[(row + i) % 3])
        L.human("instructor", (-15.2, -1.6, DECK), rot_z=math.pi, seed=590, outfit="teacher")
        # consulting room: table, clients and consultants, the readiness screen on the back-left glass edge
        tx, ty = -19.4, 6.4
        box("meet_table", (6.0, 2.2, 0.06), (tx, ty, DECK + 0.72), "woodlight", bevel=0.08)
        for dx in (-2.0, 2.0):
            box(f"meet_leg{dx}", (0.3, 1.2, 0.72), (tx + dx, ty, DECK), "silver", bevel=0.01)
        k = 0
        for side, ang in ((-1, math.pi / 2), (1, -math.pi / 2)):
            for dx in (-2.1, -0.7, 0.7, 2.1):
                p = (tx + dx, ty + side * 1.55, DECK)
                L.office_chair(f"meet_chair{k}", p, rot_z=ang, fabric="accent_blue" if side < 0 else "teal")
                if k != 5:
                    L.human(f"meet_p{k}", p, rot_z=ang, seed=600 + k, pose="sit", outfit=("teacher", None, "doctor2", None)[k % 4])
                    box(f"meet_laptop{k}", (0.32, 0.22, 0.02), (tx + dx, ty + side * 0.7, DECK + 0.79), "silver", bevel=0.005)
                k += 1
        (x, y), face = edge_point(DECK_RAW[5], DECK_RAW[0], 0.42, 0.7)
        M.screen_at("consult_scr", (5.0, 2.0), (x, y, DECK + 2.4), face, "screen_consult", bezel=0.08)
        box("consult_stand", (4.6, 0.4, 1.3), (x - math.cos(face) * 0.25, y - math.sin(face) * 0.25, DECK), "cyber_navy", bevel=0.02, rot=(0, 0, face + math.pi / 2))
        L.human("consultant", (-23.6, 3.2, DECK), rot_z=0.65, seed=610, outfit="teacher")  # presenting, turned to the table
        E.bookshelf("consult_books", (-16.0, 11.2, DECK), rot_z=0.0, w=2.4, seed=772)
        L.potted_plant("consult_plant", (-14.8, 9.6, DECK), h=1.4, seed=615, pot="accent_blue")
        empty("pin_consulting", (-21.0, 1.0, DECK + 8.4))


# ---------------------------------------------------------------- tower, site, yard

def tower():
    L.set_group("static_tower")
    x, y, w, d, h = TOWER
    K.cyber_tower("ctower", x, y, w, d, h)


def site():
    L.set_group("static_site")
    A.solid("plinth", A.outline(A.rect_poly(0, 0, 2 * BASE[0], 2 * BASE[1]), 2.0), -2.0, 2.0, "hosp_white", bevel=0.15)
    box("road", (2 * BASE[0], 8, 0.02), (0, ROAD_Y, 0), "asphalt", bevel=0)
    for i in range(13):
        box(f"dash{i}", (2.4, 0.15, 0.005), (-37 + i * 6.2, ROAD_Y, 0.02), "paint_white", bevel=0)
    for i in range(9):
        box(f"zebra{i}", (0.55, 5.0, 0.005), (-4.0 + i * 1.1, ROAD_Y, 0.021), "paint_white", bevel=0)
    box("sidewalk", (2 * BASE[0], 5.0, 0.16), (0, -18.5, 0), "paving", bevel=0.03)
    box("sidewalk_far", (2 * BASE[0], 2.0, 0.16), (0, -30.0, 0), "paving", bevel=0.03)
    box("plaza", (2 * BASE[0], 10.0, 0.16), (0, -11.0, 0), "terrazzo", bevel=0.03)
    box("grounds", (2 * BASE[0] - 0.6, 37.0, 0.16), (0, 12.5, 0), "lawn", bevel=0.03)
    box("drive", (GATE[1] - GATE[0], 36.5, 0.02), (sum(GATE) / 2, 2.25, 0.16), "asphalt", bevel=0)  # ends at the car park
    box("gate_drive", (GATE[1] - GATE[0], 4.6, 0.02), (sum(GATE) / 2, -18.7, 0.162), "asphalt", bevel=0)
    box("ent_path", (PX0 - 0.25 - GATE[1], DOOR_Y[1] - DOOR_Y[0] + 1.0, 0.02), ((GATE[1] + PX0 - 0.25) / 2, sum(DOOR_Y) / 2, 0.16), "terrazzo", bevel=0)
    box("yard", (17.0, 26.0, 0.02), (30.5, 7.0, 0.16), "concrete", bevel=0)
    box("car_park", (16.0, 6.0, 0.02), (-30.0, 23.5, 0.165), "asphalt", bevel=0)
    for i in range(20):
        box(f"plaza_joint{i}", (0.03, 9.6, 0.003), (-38 + i * 4, -11.0, 0.16), "paving_dark", bevel=0)
    # reflecting pool under the cantilever, its LED rim
    A.ring("pool_rim", rect(-17.2, -12.7, -4.8, -8.3), rect(-17.0, -12.5, -5.0, -8.5), 0.16, 0.4, "robot_white")
    box("pool_water", (12.0, 4.0, 0.3), (-11.0, -10.5, 0.16), "tile_blue", bevel=0)  # surface 0.1 below the rim
    box("pool_led", (12.44, 0.04, 0.05), (-11.0, -12.72, 0.4), "led_cyan", bevel=0)
    rnd = random.Random(800)
    for k, x in enumerate(range(-36, 40, 8)):
        A.tree(f"stree{k}", (x, -18.2, 0.16), h=6.2 + rnd.random(), spread=0.9, seed=810 + k)
        L.street_light(f"lamp{k}", (x + 4, -20.6, 0.16), rot_z=-math.pi / 2, h=6.0)
    for k, (x, y) in enumerate(((-37, 29), (-18, 29), (10, 29), (22, 28.5), (30, 28.5), (-37, 16))):
        A.tree(f"gtree{k}", (x, y, 0.16), h=6.5 + rnd.random() * 2, spread=1.0, seed=830 + k)
    for i, x in enumerate((-2.0, 6.0)):
        L.bench(f"bench{i}", (x, -8.6, 0.16))
    # monument and flags on the plaza's right
    box("monument", (6.0, 0.8, 1.6), (25.0, -14.4, 0.16), "hosp_white", bevel=0.08)
    box("monument_band", (6.02, 0.82, 0.2), (25.0, -14.4, 0.3), "accent_blue", bevel=0)
    L.text_mesh("monument_txt", "CYBER DEFENSE", (25.0, -14.82, 0.72), 0.5, 0.05, "accent_blue", resolution=3)
    for k, (x, mat) in enumerate(((29.5, "accent_blue"), (30.8, "robot_white"), (32.1, "sky_blue"))):
        cyl(f"flagpole{k}", 0.05, 7.0, (x, -13.6, 0.16), "silver", verts=10)
        box(f"flag{k}", (1.2, 0.02, 0.75), (x + 0.62, -13.6, 6.3), mat, bevel=0)
    # staff car park under a solar carport, EV chargers at its ends
    for k in range(6):
        box(f"bay{k}", (0.1, 5.0, 0.005), (-35.0 + k * 2.6, 23.5, 0.186), "paint_white", bevel=0)
        if k < 5 and k != 2:
            L.car(f"pcar{k}", (-33.7 + k * 2.6, 23.6, 0.186), rot_z=math.pi / 2 if k % 2 else -math.pi / 2, paint=rnd.choice(("white", "silver", "navy", "red", "black", "brand")))
    for k in range(4):
        for dy in (-2.4, 2.4):
            cyl(f"carport_col{k}{dy}", 0.1, 2.9, (-35.8 + k * 4.4, 23.5 + dy, 0.18), "robot_white", verts=10)
    box("carport_roof", (14.0, 5.6, 0.12), (-29.2, 23.5, 3.08), "robot_white", bevel=0.02)
    for k in range(10):
        box(f"carport_pv{k}", (1.3, 5.2, 0.05), (-35.5 + k * 1.4, 23.5, 3.22), "solar", bevel=0.01, rot=(0.0, 0.08, 0))
    for k, x in enumerate((-36.3, -22.4)):
        T.ev_charger(f"ev{k}", (x, 21.2, 0.18), math.pi / 2)


def perimeter():
    L.set_group("static_site")
    T.fence("fence", [(-BASE[0] + 0.6, FENCE_Y), (BASE[0] - 0.6, FENCE_Y), (BASE[0] - 0.6, BASE[1] - 1.0)], h=2.2, gap=(GATE[0] + BASE[0] - 0.6, GATE[1] + BASE[0] - 0.6))
    T.fence("fence_w", [(-BASE[0] + 0.6, FENCE_Y), (-BASE[0] + 0.6, BASE[1] - 1.0)], h=2.2)
    K.guard_booth("gatehouse", (GATE[1] + 2.0, FENCE_Y + 2.6, 0.16), rot_z=0.0)
    K.barrier("gate_bar", (GATE[1] + 0.3, FENCE_Y + 0.5, 0.16), rot_z=math.pi, length=5.5)
    L.car("gate_car", (-34.5, -19.0, 0.18), rot_z=math.pi / 2, paint="silver")
    for k, x in enumerate((-BASE[0] + 1.6, BASE[0] - 1.6, 30.0)):
        T.camera_pillar(f"campole{k}", (x, FENCE_Y - 0.6, 0.16), h=4.6)


def yard():
    L.set_group("static_site")
    with group("hot:threat-intelligence"):
        K.dish("dish0", (28.5, -1.0, 0.18), r=2.4, az=math.radians(200), el=0.75)
        K.dish("dish1", (35.0, 8.0, 0.18), r=3.0, az=math.radians(215), el=0.9, h=3.2)
        K.dish("dish2", (30.0, 15.5, 0.18), r=1.8, az=math.radians(170), el=0.6)
    T.lattice_mast("mast", (36.5, 24.0, 0.16), h=22.0)
    for k, y in enumerate((1.5, 5.5, 9.5)):
        K.chiller(f"chiller{k}", (23.4, y, 0.18), rot_z=math.pi / 2, fans=2)
    for k, x in enumerate((9.0, 15.5)):
        K.generator(f"genset{k}", (x, PY1 + 3.4, 0.18), rot_z=0.0)
    box("transformer", (2.2, 1.6, 2.0), (21.0, PY1 + 3.4, 0.18), "panel_grey", bevel=0.04)


# ---------------------------------------------------------------- life

def life():
    hx, hy = HOLO
    loops = [
        (racetrack(hx - 4.5, hy - 4.6, hx + 4.5, hy + 4.3, 2.0), 2, 1.0, ("teacher", None), DECK),  # round the hologram on the deck
        (racetrack(3.6, 11.0, 16.4, 11.7, 0.3), 1, 0.8, ("worker",), GROUND),  # data hall back aisle
        (racetrack(-36.0, -29.8, 36.0, -29.2, 0.29), 3, 1.25, (None, None, None), 0.16),  # far sidewalk
        (racetrack(-36.0, -19.6, 36.0, -19.0, 0.29), 4, 1.3, (None, "teacher", None, None), 0.16),  # front sidewalk
        (racetrack(-24.0, -15.6, 20.0, -14.9, 0.3), 2, 1.0, ("worker", None), 0.16),  # patrol / staff across the plaza
        (racetrack(PX0 - 4.5, -3.6, -17.5, -2.4, 0.5), 2, 1.1, (None, "doctor2"), GROUND),  # visitors in through the lobby
        (racetrack(-10.0, -4.6, 0.0, -3.4, 0.5), 2, 1.0, (None, "teacher"), GROUND),  # atrium
    ]
    n = 0
    for path, count, speed, outfits, z in loops:
        length = L.path_length(path, True)
        for j in range(count):
            L.walker(f"walker{n}", path, speed, (j + 0.3) * length / count, seed=900 + n, z=z, outfit=outfits[j])
            n += 1
    ring = M.circle(20.0, 40, 8.0, -4.0)  # security drone, clear of the tower
    with group("move"):
        rotors = M.drone("drone", (0, 0, 0), 0.0)
    body = L.rigid([o for o in L._parts("drone") if o not in rotors], "drone")
    for i, r in enumerate(rotors):
        c = L._top_centre([r])
        rr = L.rigid([r], f"drone_rotor{i}", (c[0], c[1], c[2] - 0.006))
        rr["spin"], rr["spin_speed"] = "z", 30.0
        rr.parent = body
    L._on_path(body, "drive", 5.0, ring, True, 0.0, 22.0)
    v, half = 7.0, BASE[0] + 8.0
    for i, (lane_y, sign) in enumerate(((ROAD_Y + 1.8, 1), (ROAD_Y - 1.8, -1))):
        lane = [(-sign * half, lane_y), (sign * half, lane_y)]
        for j in range(2):
            L.driver(f"car{i}{j}", lane, v, j * half + i * 13.0, closed=False, paint=(("white", "navy"), ("red", "silver"))[i][j], kind=("car", "van")[j])


def icons():
    with group("move"):
        for i, (x, y, z, kind) in enumerate(((HOLO[0] + 3.2, HOLO[1] + 1.5, DECK + 6.2, "shield"), (-1.0, 6.0, DECK + 5.6, "wifi"), (14.0, 5.0, GROUND + 3.8, "cloud"),
                                             (15.5, -6.0, DECK + 5.4, "brain"), (-24.0, 4.5, DECK + 5.0, "award"), (-10.0, -12.6, DECK + 2.8, "lock"))):
            L.plane(f"icon_{kind}{i}", (1.1, 1.1), (x, y, z), f"screen_icon_{kind}", rot=(math.pi / 2, 0, math.pi))
            bpy.data.objects[f"icon_{kind}{i}"]["bob"] = i * 0.9


def lighting(sun_elev=40, sun_dir=(0.55, -0.83)):
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
    # the podium under the deck and the plaza under the cantilever get ceiling light
    for i, (x0, y0, x1, y1, z) in enumerate(((PX0, PY0, LOBBY_X, PY1, POD_ROOF - 0.1), (LOBBY_X, PY0, HALL_X, PY1, POD_ROOF - 0.1), (HALL_X, PY0, PX1, PY1, POD_ROOF - 0.1), (-22.0, -16.0, 14.0, -6.5, DECK - DECK_T - 0.1))):
        a = bpy.data.lights.new(f"Panel{i}", "AREA")
        a.shape = "RECTANGLE"
        a.size, a.size_y = (x1 - x0) * 0.85, (y1 - y0) * 0.85
        a.energy = 4.0 * (x1 - x0) * (y1 - y0)
        a.color = (1.0, 0.97, 0.92)
        ob = bpy.data.objects.new(f"Panel{i}", a)
        L.COL.objects.link(ob)
        ob.location = ((x0 + x1) / 2, (y0 + y1) / 2, z)


ATLASES = {
    "building": ["static_building", "hot:network-security", "hot:endpoint-security", "hot:app-cloud-security", "hot:threat-intelligence", "hot:consulting"],
    "site": ["static_site"],
    "tower": ["static_tower"],
}


def build():
    L.reset_scene()
    site()
    perimeter()
    yard()
    podium()
    lobby_and_atrium()
    data_hall()
    deck()
    soc()
    threat_intel()
    consulting()
    tower()
    life()
    icons()
    lighting()
    for name, groups in ATLASES.items():
        bpy.context.scene[f"atlas_{name}"] = ",".join(groups)
    bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(BLEND))
    print("objects:", len(bpy.context.scene.objects), "tris:", sum(len(o.data.polygons) for o in bpy.context.scene.objects if o.type == "MESH"))


if __name__ == "__main__":
    build()
