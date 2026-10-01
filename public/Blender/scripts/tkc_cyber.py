"""Cyber-security props for the dioramas (built on tkc_lib / tkc_arch / tkc_med / tkc_cable / tkc_edu).

Conventions as in tkc_lib: loc = bottom centre, rot_z = heading, `face` = compass angle a screen looks towards.
Holograms are built in the "move" group and joined into one rigid node carrying spin / bob extras for baked.jsx.
"""
import math
import random

import bmesh
from mathutils import Vector

import tkc_arch as A
import tkc_cable as C
import tkc_edu as E
import tkc_lib as L
import tkc_med as M
from tkc_lib import box, cyl, group, sphere


def _at(loc, rot_z):
    x, y, z = loc
    c, s = math.cos(rot_z), math.sin(rot_z)
    return lambda dx, dy, dz: (x + c * dx - s * dy, y + s * dx + c * dy, z + dz)


# ------------------------------------------------------------------ holograms

def holo_table(name, loc, r=1.5):
    """Round projection table: pedestal, white top with a blue edge, glowing emitter and a lit ring on the floor."""
    x, y, z = loc
    cyl(f"{name}_foot", r * 0.45, 0.12, (x, y, z), "robot_white", verts=32, bevel=0.03)
    cyl(f"{name}_stem", r * 0.22, 0.7, (x, y, z + 0.12), "robot_white", verts=24)
    cyl(f"{name}_top", r, 0.08, (x, y, z + 0.82), "robot_white", verts=48, bevel=0.02)
    cyl(f"{name}_edge", r + 0.02, 0.04, (x, y, z + 0.84), "accent_blue", verts=48)
    cyl(f"{name}_emitter", r * 0.45, 0.03, (x, y, z + 0.9), "led_cyan", verts=32)
    M.disc_ring(f"{name}_floor_ring", r + 1.3, r + 1.15, (x, y, z + 0.01), 0.02, "led_cyan", n=64)
    M.disc_ring(f"{name}_floor_ring2", r + 2.2, r + 2.12, (x, y, z + 0.01), 0.02, "led_cyan", n=64)


def network_hologram(name, center, size=2.2):
    """The artwork's network shield: an upright hexagon with an inner hexagon, a hub node linked to six nodes on
    the frame and a web between them, turning slowly about its vertical axis. Returns the rigid node."""
    cx, cy, cz = center
    up = (math.pi / 2, 0, 0)
    parts = []
    with group("move"):
        parts.append(M.disc_ring(f"{name}_frame", size, size - 0.12, (0, 0, 0), 0.06, "holo", rot=up, n=6))
        parts.append(M.disc_ring(f"{name}_inner", size * 0.5, size * 0.5 - 0.06, (0, 0, 0), 0.04, "holo", rot=up, n=6))
        # nodes on the corners of both hexagons (disc_ring puts its n=6 corners at k * 60 deg, upright in xz)
        nodes = [Vector((math.cos(k * math.pi / 3) * (size - 0.06), 0, math.sin(k * math.pi / 3) * (size - 0.06))) for k in range(6)]
        mids = [Vector((math.cos(k * math.pi / 3) * (size * 0.5 - 0.03), 0, math.sin(k * math.pi / 3) * (size * 0.5 - 0.03))) for k in range(6)]
        segs = [(Vector((0, 0, 0)), m, 0.025) for m in mids] + [(m, nodes[k], 0.018) for k, m in enumerate(mids)] + [(m, nodes[(k + 1) % 6], 0.018) for k, m in enumerate(mids)]
        parts.append(C.tubes(f"{name}_links", segs, "holo", verts=6))
        parts.append(sphere(f"{name}_hub", 0.26, (0, 0, 0), "holo", subdiv=2))
        for k, n in enumerate(nodes + mids):
            parts.append(sphere(f"{name}_node{k}", 0.13 if k < 6 else 0.09, tuple(n), "holo", subdiv=1))
    body = L.rigid(parts, name)
    body.location = center
    body["spin"], body["spin_speed"] = "z", 0.35
    # two orbit rings around it, turning the other way
    rings = []
    for k, (dz, r, sp) in enumerate(((-size * 0.55, size * 1.05, -0.5), (size * 0.62, size * 0.8, 0.7))):
        with group("move"):
            ring = M.disc_ring(f"{name}_orbit{k}", r, r - 0.05, (cx, cy, cz + dz), 0.03, "holo", n=64)
        ring["spin"], ring["spin_speed"] = "z", sp
        rings.append(ring)
    return body, rings


def holo_lock(name, center, s=1.0):
    """Floating padlock hologram (application & cloud security), bobbing and turning slowly."""
    parts = []
    with group("move"):
        parts.append(box(f"{name}_body", (1.0 * s, 0.22 * s, 0.8 * s), (0, 0, -0.4 * s), "holo", bevel=0.06 * s))
        parts.append(M.disc_ring(f"{name}_shackle", 0.36 * s, 0.26 * s, (0, 0, 0.12 * s), 0.12 * s, "holo", rot=(math.pi / 2, 0, 0), n=32))
        for dx in (-0.31, 0.31):
            parts.append(box(f"{name}_leg{dx}", (0.1 * s, 0.12 * s, 0.2 * s), (dx * s, 0, -0.06 * s), "holo", bevel=0))
        parts.append(cyl(f"{name}_hole", 0.08 * s, 0.26 * s, (0, 0.13 * s, -0.12 * s), "led_cyan", verts=16, rot=(math.pi / 2, 0, 0)))
    body = L.rigid(parts, name)
    body.location = center
    body["spin"], body["spin_speed"] = "z", 0.4
    body["bob"] = 0.3
    return body


def holo_globe(name, center, r=0.7):
    """Spinning wireframe-like globe (threat intelligence fusion): sphere, equator and meridian rings."""
    parts = []
    with group("move"):
        parts.append(sphere(f"{name}_ball", r, (0, 0, 0), "holo", subdiv=2))
        parts.append(M.disc_ring(f"{name}_eq", r + 0.12, r + 0.07, (0, 0, 0), 0.03, "holo", n=48))
        for k in range(2):
            parts.append(M.disc_ring(f"{name}_mer{k}", r + 0.1, r + 0.06, (0, 0, 0), 0.03, "holo", rot=(math.pi / 2, 0, k * math.pi / 2), n=48))
    body = L.rigid(parts, name)
    body.location = center
    body["spin"], body["spin_speed"] = "z", 0.5
    return body


# ------------------------------------------------------------------ SOC furniture

def video_wall(name, x0, x1, y, z0, h, screens, face=-math.pi / 2, gap=0.12):
    """A wall of screens on a dark frame along x at y (screens look towards `face`), LED lines above and below."""
    n = len(screens)
    w = (x1 - x0 - gap * (n + 1)) / n
    dy = -0.04 if face < 0 else 0.04
    box(f"{name}_frame", (x1 - x0, 0.12, h + 2 * gap), ((x0 + x1) / 2, y - dy * 1.5, z0 - gap), "cyber_navy", bevel=0.02)
    for k, scr in enumerate(screens):
        cx = x0 + gap + w / 2 + k * (w + gap)
        M.screen_at(f"{name}_scr{k}", (w, h), (cx, y + dy * 3, z0 + h / 2), face, scr, bezel=0)
    for k, zz in enumerate((z0 - gap - 0.08, z0 + h + gap + 0.02)):
        box(f"{name}_led{k}", (x1 - x0, 0.03, 0.05), ((x0 + x1) / 2, y + dy * 3, zz), "led_cyan", bevel=0)


def soc_rows(prefix, focus, radii, span, z, screens, seed=0, step=0.3, outfits=None):
    """Curved, tiered rows of analyst desks facing `focus` (x, y): one arc per radius, desks spread over
    `span` = (angle_lo, angle_hi) seen from the focus, each row a step higher than the one in front."""
    fx, fy = focus
    rnd = random.Random(seed)
    n = 0
    for row, r in enumerate(radii):
        lift = row * step
        a0, a1 = span
        if lift:
            ring_in, ring_out = r - 1.5, r + 1.2

            def arc(rr, k=24):
                return [(fx + rr * math.cos(a0 - 0.06 + (a1 - a0 + 0.12) * i / k), fy + rr * math.sin(a0 - 0.06 + (a1 - a0 + 0.12) * i / k)) for i in range(k + 1)]

            A.solid(f"{prefix}_tier{row}", arc(ring_out) + list(reversed(arc(ring_in))), z, lift, "cyber_floor")
            A.solid(f"{prefix}_tier{row}_led", arc(ring_in + 0.03) + list(reversed(arc(ring_in))), z + lift - 0.06, 0.04, "led_cyan")
        count = max(2, int(r * (a1 - a0) / 2.7))
        for k in range(count):
            a = a0 + (a1 - a0) * (k + 0.5) / count
            px, py = fx + r * math.cos(a), fy + r * math.sin(a)
            M.workstation(f"{prefix}{row}_{k}", (px, py, z + lift), rot_z=a + math.pi / 2, screens=screens, seed=seed + n,
                          outfit=(outfits[n % len(outfits)] if outfits else None), person=rnd.random() < 0.9)
            n += 1
    return n


def endpoint_bar(name, loc, rot_z=0.0):
    """Endpoint showcase counter: laptop, desktop, tablet and phone, each with an agent status screen."""
    at = _at(loc, rot_z)
    r = (0, 0, rot_z)
    box(f"{name}_counter", (3.2, 0.8, 1.0), at(0, 0, 0), "robot_white", bevel=0.04, rot=r)
    box(f"{name}_top", (3.3, 0.9, 0.05), at(0, 0, 1.0), "cyber_navy", bevel=0.01, rot=r)
    box(f"{name}_led", (3.2, 0.02, 0.04), at(0, -0.41, 0.2), "led_cyan", bevel=0, rot=r)
    face = rot_z - math.pi / 2
    E.laptop(f"{name}_laptop", at(-1.1, 0.05, 1.05), face, screen="screen_edr")
    E.imac(f"{name}_pc", at(-0.1, 0.15, 1.05), face, screen="screen_edr")
    E.tablet_on_desk(f"{name}_tab", at(0.8, 0.0, 1.05), face, screen="screen_edr")
    box(f"{name}_phone", (0.08, 0.16, 0.01), at(1.3, -0.05, 1.06), "bezel", bevel=0, rot=r)
    L.plane(f"{name}_phone_scr", (0.07, 0.14), at(1.3, -0.05, 1.072), "screen_edr", rot=(0, 0, rot_z))


def turnstile(name, loc, rot_z=0.0):
    """Speed gate: two stainless cabinets with glass flaps and a green LED on top."""
    at = _at(loc, rot_z)
    r = (0, 0, rot_z)
    for side in (-1, 1):
        box(f"{name}_cab{side}", (1.2, 0.22, 1.0), at(0, side * 0.45, 0), "silver", bevel=0.03, rot=r)
        box(f"{name}_led{side}", (1.0, 0.04, 0.03), at(0, side * 0.45, 1.0), "led_green", bevel=0, rot=r)
        box(f"{name}_flap{side}", (0.5, 0.02, 0.6), at(0, side * 0.24, 0.35), "glass", bevel=0, rot=r)


# ------------------------------------------------------------------ yard: intelligence dishes, plant

def dish(name, loc, r=2.2, az=0.0, el=0.8, h=2.6):
    """Satellite ground-station dish: pedestal, yoke, dish tilted to elevation `el` towards compass `az`,
    feed struts and the LNB at the focus."""
    x, y, z = loc
    cyl(f"{name}_base", 0.9, 0.4, (x, y, z), "concrete", verts=24)
    cyl(f"{name}_ped", 0.35, h, (x, y, z + 0.4), "robot_white", verts=20)
    box(f"{name}_yoke", (1.0, 0.5, 0.5), (x, y, z + 0.4 + h - 0.2), "robot_white", bevel=0.04, rot=(0, 0, az))
    c = Vector((x, y, z + 0.4 + h + 0.4))
    n = Vector((math.cos(az) * math.cos(el), math.sin(az) * math.cos(el), math.sin(el)))
    rot = n.to_track_quat("Z", "Y").to_euler()
    sphere(f"{name}_dish", r, tuple(c), "robot_white", scale=(1, 1, 0.22), subdiv=3, rot=rot)
    rim = M.disc_ring(f"{name}_rim", r + 0.02, r - 0.1, tuple(c + n * 0.02), 0.08, "silver", n=48)
    rim.rotation_euler = rot
    focus = c + n * (r * 0.75)
    segs = []
    for k in range(3):
        a = k * math.tau / 3
        side = Vector((math.cos(a), math.sin(a), 0))
        side = (side - n * side.dot(n)).normalized()
        segs.append((c + side * (r * 0.85) + n * 0.1, focus, 0.03))
    C.tubes(f"{name}_struts", segs, "silver", verts=6)
    sphere(f"{name}_lnb", 0.16, tuple(focus), "robot_white", subdiv=1)
    sphere(f"{name}_led", 0.06, (x, y, z + 0.4 + h + 0.05), "led_red", subdiv=1)


def chiller(name, loc, rot_z=0.0, fans=3):
    """Air-cooled chiller for the data hall: grey casing, V-coils, fans on top, pipe stubs."""
    at = _at(loc, rot_z)
    r = (0, 0, rot_z)
    ln = fans * 1.3 + 0.4
    box(f"{name}_body", (ln, 2.0, 1.9), at(0, 0, 0), "panel_grey", bevel=0.04, rot=r)
    for side in (-1, 1):
        box(f"{name}_coil{side}", (ln - 0.3, 0.04, 1.2), at(0, side * 1.01, 0.5), "frame_dark", bevel=0, rot=r)
    for k in range(fans):
        dx = -ln / 2 + 0.85 + k * 1.3
        cyl(f"{name}_fan{k}", 0.52, 0.12, at(dx, 0, 1.9), "frame_dark", verts=20)
        cyl(f"{name}_hub{k}", 0.12, 0.16, at(dx, 0, 1.9), "steel", verts=10)
    for k, dy in enumerate((-0.4, 0.4)):
        cyl(f"{name}_pipe{k}", 0.12, 0.8, at(-ln / 2 - 0.5, dy, 0.5), "duct_blue", verts=12, rot=(0, math.pi / 2, rot_z))


def generator(name, loc, rot_z=0.0):
    """Standby diesel generator in an acoustic enclosure with louvres, exhaust stack and a fuel tank base."""
    at = _at(loc, rot_z)
    r = (0, 0, rot_z)
    box(f"{name}_tank", (6.2, 2.5, 0.5), at(0, 0, 0), "darkgray", bevel=0.03, rot=r)
    box(f"{name}_body", (6.0, 2.4, 2.4), at(0, 0, 0.5), "robot_white", bevel=0.04, rot=r)
    for k in range(6):
        box(f"{name}_louvre{k}", (0.9, 0.04, 1.2), at(-2.3 + k * 0.9, -1.22, 1.0), "panel_grey", bevel=0, rot=r)
    box(f"{name}_stripe", (6.02, 2.42, 0.18), at(0, 0, 2.5), "accent_blue", bevel=0, rot=r)
    cyl(f"{name}_stack", 0.18, 1.6, at(2.2, 0.6, 2.9), "steel", verts=12)
    box(f"{name}_panel", (0.6, 0.04, 0.8), at(-2.6, -1.23, 1.3), "frame_dark", bevel=0, rot=r)
    box(f"{name}_panel_led", (0.3, 0.02, 0.06), at(-2.6, -1.26, 1.9), "led_green", bevel=0, rot=r)


def guard_booth(name, loc, rot_z=0.0):
    """Gatehouse: white cabin with wrap-around windows, flat roof, a guard inside and a barrier arm."""
    at = _at(loc, rot_z)
    r = (0, 0, rot_z)
    box(f"{name}_base", (2.4, 2.0, 1.0), at(0, 0, 0), "robot_white", bevel=0.03, rot=r)
    box(f"{name}_glass", (2.3, 1.9, 1.3), at(0, 0, 1.0), "glass", bevel=0, rot=r)
    box(f"{name}_roof", (2.9, 2.5, 0.25), at(0, 0, 2.3), "robot_white", bevel=0.04, rot=r)
    box(f"{name}_band", (2.92, 2.52, 0.08), at(0, 0, 2.4), "accent_blue", bevel=0, rot=r)
    for sx in (-1, 1):
        for sy in (-1, 1):
            box(f"{name}_post{sx + 1}{sy + 1}", (0.08, 0.08, 1.3), at(sx * 1.13, sy * 0.93, 1.0), "robot_white", bevel=0, rot=r)
    L.human(f"{name}_guard", at(0, 0.2, 0), rot_z=rot_z - math.pi / 2, seed=77, outfit="worker")


def barrier(name, loc, rot_z=0.0, length=4.0):
    """Boom barrier: cabinet with a red / white arm across the lane (arm along local +x)."""
    at = _at(loc, rot_z)
    r = (0, 0, rot_z)
    box(f"{name}_cab", (0.4, 0.4, 1.0), at(0, 0, 0), "robot_white", bevel=0.03, rot=r)
    box(f"{name}_led", (0.3, 0.02, 0.08), at(0, -0.21, 0.8), "led_red", bevel=0, rot=r)
    for k in range(int(length / 0.5)):
        box(f"{name}_arm{k}", (0.5, 0.08, 0.1), at(0.35 + k * 0.5, 0, 0.9), "cross_red" if k % 2 == 0 else "robot_white", bevel=0, rot=r)


# ------------------------------------------------------------------ architecture: command deck and cyber tower

def clip_x(pts, x0, x1):
    """Part of a closed polygon between the vertical lines x0 and x1 (Sutherland-Hodgman, two half-planes)."""
    def cut(poly, keep, edge):
        out = []
        for i, p in enumerate(poly):
            q = poly[i - 1]
            pin, qin = keep(p), keep(q)
            if pin != qin:
                t = (edge - q[0]) / (p[0] - q[0])
                out.append((edge, q[1] + (p[1] - q[1]) * t))
            if pin:
                out.append(p)
        return out
    return cut(cut(pts, lambda p: p[0] >= x0, x0), lambda p: p[0] <= x1, x1)


def clip_y(pts, y0, y1):
    swap = [(y, x) for x, y in pts]
    return [(x, y) for y, x in clip_x(swap, y0, y1)]


def glass_skin(name, outline, z0, h, spacing=2.2, frame="white"):
    """Curtain of glass along a closed outline with mullions (in pieces, so they bake vertex-lit) and transoms."""
    A.wall(f"{name}_glass", outline, z0, h, "glass")
    bm = bmesh.new()
    pieces = max(1, round(h / 3.2))
    for (x, y), ang in A.stations(outline, spacing):
        for k in range(pieces):
            A._bm_box(bm, (x, y, z0 + (k + 0.5) * h / pieces), (0.08, 0.16, h / pieces), ang)
    L._finish(bm, f"{name}_mull", frame)
    outer = A.offset_poly(outline, -0.06)
    inner = A.offset_poly(outline, 0.06)
    for k, zz in enumerate((z0 + h / 2, z0 + h - 0.12)):
        A.ring(f"{name}_transom{k}", outer, inner, zz, 0.12, frame)


def diagrid_roof(name, outline, z, pitch=4.0, depth=0.32, mat="white"):
    """Triangular grid of beams over a closed outline (three directions 60 deg apart), cut into short pieces."""
    bm = bmesh.new()
    for a in (0.0, math.pi / 3, 2 * math.pi / 3):
        c, s = math.cos(-a), math.sin(-a)
        local = [(c * x - s * y, s * x + c * y) for x, y in outline]
        ys = [p[1] for p in local]
        y = min(ys) + pitch / 2
        ca, sa = math.cos(a), math.sin(a)
        while y < max(ys):
            for x0, x1 in A.scanline(local, y):
                x0, x1 = x0 + 0.3, x1 - 0.3
                n = max(1, round((x1 - x0) / 4.0))
                for k in range(n):
                    mx = x0 + (k + 0.5) * (x1 - x0) / n
                    _x, _y = ca * mx - sa * y, sa * mx + ca * y
                    A._bm_box(bm, (_x, _y, z + depth / 2), ((x1 - x0) / n + 0.02, 0.2, depth), a)
            y += pitch
    L._finish(bm, f"{name}_beams", mat)


def v_column(name, base, top_z, spread=2.6, axis=0.0, r=0.34, mat="white"):
    """Two struts leaning apart from one foot (a V), spread along compass angle `axis`, with a plinth."""
    x, y, z = base
    dx, dy = math.cos(axis) * spread, math.sin(axis) * spread
    foot = Vector((x, y, z + 0.5))
    C.tubes(f"{name}_struts", [(foot, Vector((x + s * dx, y + s * dy, top_z)), r) for s in (-1, 1)], mat, verts=16)
    cyl(f"{name}_plinth", r * 2.2, 0.5, (x, y, z), "robot_white", verts=24, bevel=0.04)
    cyl(f"{name}_led", r * 2.25, 0.04, (x, y, z + 0.46), "led_cyan", verts=24)


def glass_lift(name, loc, z_top, r=1.1, car_z=None):
    """Round panoramic lift: glass shaft with frame rings, the car part way up, a cap on top."""
    x, y, z = loc
    h = z_top - z
    cyl(f"{name}_shaft", r, h, (x, y, z), "glass", verts=32)
    for k in range(int(h / 3.0) + 1):
        M.disc_ring(f"{name}_ring{k}", r + 0.06, r - 0.02, (x, y, z + k * 3.0 + 0.05), 0.12, "white", n=32)
    for k in range(4):
        a = k * math.pi / 2 + math.pi / 4
        box(f"{name}_post{k}", (0.12, 0.12, h), (x + math.cos(a) * r, y + math.sin(a) * r, z), "white", bevel=0)
    cyl(f"{name}_cap", r + 0.15, 0.5, (x, y, z_top), "white", verts=32, bevel=0.04)
    cz = car_z if car_z is not None else z + h * 0.45
    cyl(f"{name}_car", r - 0.2, 2.5, (x, y, cz), "robot_white", verts=24)
    cyl(f"{name}_car_led", r - 0.18, 0.06, (x, y, cz + 2.3), "led_cyan", verts=24)


def cyber_tower(name, x, y, w, d, h, z0=0.16, glass="cyber_glass"):
    """Signature tower: rounded glass shaft with slab lines, a diamond diagrid on front and back, LED corner lines,
    a crown of blades with a glowing shield emblem and lettering, a roof of SIGINT dishes and a lit spire."""
    r = 1.2
    body = A.outline(A.rect_poly(x, y, w, d), r)
    A.solid(f"{name}_body", body, z0, h, glass)
    band_o, band_i = A.outline(A.rect_poly(x, y, w + 0.12, d + 0.12), r + 0.06), A.outline(A.rect_poly(x, y, w - 0.06, d - 0.06), r - 0.03)
    for k in range(1, int(h / 4.0)):
        A.ring(f"{name}_slab{k}", band_o, band_i, z0 + k * 4.0, 0.16, "white")
    segs = []
    crown_z = z0 + h - 12.0  # the diagrid stops under a clean crown band that carries the emblem
    cols, rows = max(2, round(w / 4.0)), max(2, round((crown_z - z0) / 7.0))
    for s in (-1, 1):  # front and back faces
        fy = y + s * (d / 2 + 0.35)
        xs = [x - w / 2 + 0.6 + i * (w - 1.2) / cols for i in range(cols + 1)]
        zs = [z0 + 2.0 + j * (crown_z - z0 - 2.0) / rows for j in range(rows + 1)]
        for i in range(cols):
            for j in range(rows):
                segs.append((Vector((xs[i], fy, zs[j])), Vector((xs[i + 1], fy, zs[j + 1])), 0.14))
                segs.append((Vector((xs[i + 1], fy, zs[j])), Vector((xs[i], fy, zs[j + 1])), 0.14))
        for xx in (xs[0], xs[-1]):
            segs.append((Vector((xx, fy, zs[0])), Vector((xx, fy, zs[-1])), 0.16))
    C.tubes(f"{name}_diagrid", segs, "white", verts=8)
    A.ring(f"{name}_crown_band", A.outline(A.rect_poly(x, y, w + 0.5, d + 0.5), r + 0.25), A.outline(A.rect_poly(x, y, w - 0.04, d - 0.04), r - 0.02), crown_z, 0.6, "white")
    A.ring(f"{name}_crown_band_led", A.outline(A.rect_poly(x, y, w + 0.54, d + 0.54), r + 0.27), A.outline(A.rect_poly(x, y, w + 0.46, d + 0.46), r + 0.23), crown_z + 0.62, 0.08, "led_cyan")
    for sx in (-1, 1):  # LED lines down the corners of the front
        box(f"{name}_led{sx + 1}", (0.1, 0.1, h - 2.0), (x + sx * (w / 2 - 0.2), y - d / 2 - 0.05, z0 + 1.0), "led_cyan", bevel=0)
    # crown: blades past the roof, a lit ring, the shield emblem and the name
    top = z0 + h
    for sx in (-1, 1):
        for sy in (-1, 1):
            box(f"{name}_blade{sx + 1}{sy + 1}", (0.4, 0.4, 7.0), (x + sx * (w / 2 - 0.6), y + sy * (d / 2 - 0.6), top), "white", bevel=0.05, rot=(sy * -0.12, sx * 0.12, 0))
    A.ring(f"{name}_crown", A.outline(A.rect_poly(x, y, w + 0.3, d + 0.3), r + 0.15), A.outline(A.rect_poly(x, y, w - 0.5, d - 0.5), r - 0.25), top, 1.0, "white")
    A.ring(f"{name}_crown_led", A.outline(A.rect_poly(x, y, w + 0.34, d + 0.34), r + 0.17), A.outline(A.rect_poly(x, y, w + 0.28, d + 0.28), r + 0.14), top + 0.4, 0.12, "led_cyan")
    L.plane(f"{name}_emblem", (6.0, 6.0), (x, y - d / 2 - 0.5, top - 5.0), "screen_icon_shield", rot=(math.pi / 2, 0, math.pi))
    L.text_mesh(f"{name}_name", "TKC CYBER DEFENSE", (x, y - d / 2 - 0.42, top - 9.8), 0.95, 0.08, "white", resolution=3)
    # roof: ground-station dishes and a lit spire
    for k, (dx, dy, az) in enumerate(((-w / 4, 0.5, 3.6), (w / 4, 0.5, 4.2))):
        dish(f"{name}_dish{k}", (x + dx, y + dy, top + 0.0), r=1.3, az=az, el=0.8, h=1.4)
    cyl(f"{name}_spire", 0.45, 14.0, (x, y + 1.0, top), "white", verts=16, r2=0.08)
    sphere(f"{name}_beacon", 0.22, (x, y + 1.0, top + 14.1), "led_red", subdiv=1)
    for k in range(3):
        a = k * math.tau / 3
        box(f"{name}_ant{k}", (0.16, 0.4, 1.6), (x + math.cos(a) * 0.6, y + 1.0 + math.sin(a) * 0.6, top + 6.0), "white", bevel=0.04, rot=(0, 0, a))
