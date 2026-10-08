"""Cloud-campus props for the dioramas (built on tkc_lib / tkc_arch / tkc_med / tkc_cable / tkc_cyber).

Conventions as in tkc_lib: loc = bottom centre, rot_z = heading, `face` = compass angle a front looks towards.
Holograms are built in the "move" group and joined into one rigid node carrying spin / bob extras for baked.jsx.
"""
import math
import random

import bmesh
from mathutils import Vector

import tkc_cable as C
import tkc_lib as L
import tkc_med as M
from tkc_lib import box, cyl, group, sphere


def _at(loc, rot_z):
    x, y, z = loc
    c, s = math.cos(rot_z), math.sin(rot_z)
    return lambda dx, dy, dz: Vector((x + c * dx - s * dy, y + s * dx + c * dy, z + dz))


# ------------------------------------------------------------------ holograms

def brain_hologram(name, center, size=7.0, seed=11):
    """The artwork's glowing AI brain: two lobed hemispheres of nodes linked to their neighbours, a bright core.
    Turns slowly about its vertical axis. Returns the rigid node."""
    rnd = random.Random(seed)
    nodes = []
    while len(nodes) < 120:
        # points in a brain-ish volume: two half ellipsoids either side of a fissure, flattened underneath
        u, v = rnd.uniform(-1, 1), rnd.uniform(-1, 1)
        w = rnd.uniform(-0.2, 1)
        if u * u + v * v + w * w > 1 or abs(u) < 0.06:
            continue
        lobe = 1 + 0.12 * math.sin(v * 7) * math.sin(w * 6)  # gyri: a lumpy surface
        r = (u * u + v * v + w * w) ** 0.5
        if r < 0.55:  # keep the nodes near the surface so the shape reads
            continue
        nodes.append(Vector((u * size * 0.42 * lobe, v * size * 0.5 * lobe, w * size * 0.36 * lobe)))
    links = []
    for i, a in enumerate(nodes):
        near = sorted(range(len(nodes)), key=lambda j: (nodes[j] - a).length)[1:4]
        for j in near:
            if i < j and (nodes[j].x > 0) == (a.x > 0):  # no links across the fissure
                links.append((a, nodes[j], 0.035))
    parts = []
    with group("move"):
        bm = bmesh.new()
        for k, p in enumerate(nodes):
            g = bmesh.ops.create_icosphere(bm, subdivisions=1, radius=0.12 + 0.08 * (k % 3 == 0))
            bmesh.ops.translate(bm, vec=p, verts=g["verts"])
        parts.append(L._finish(bm, f"{name}_nodes", "holo"))
        parts.append(C.tubes(f"{name}_links", links, "holo", verts=5))
        parts.append(sphere(f"{name}_core", size * 0.09, (0, 0, size * 0.05), "led_cyan", subdiv=2))
        parts.append(M.disc_ring(f"{name}_halo", size * 0.62, size * 0.6, (0, 0, -size * 0.12), 0.02, "holo", n=64))
    body = L.rigid(parts, name)
    body.location = center
    body["spin"], body["spin_speed"] = "z", 0.25
    return body


def dome(name, center, r, mat="glass", rib="white", ribs=12, rings=4):
    """Glass hemisphere with meridian ribs and ring beams (ribs in short pieces so they bake vertex-lit)."""
    cx, cy, cz = center
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=40, v_segments=20, radius=r)
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z < -1e-4], context="VERTS")
    bmesh.ops.translate(bm, vec=Vector(center), verts=bm.verts)
    L._finish(bm, f"{name}_glass", mat, smooth=True)
    segs = []
    for k in range(ribs):
        a = k * math.tau / ribs
        pts = [Vector((cx + math.cos(a) * r * math.cos(t), cy + math.sin(a) * r * math.cos(t), cz + r * math.sin(t))) for t in [i * (math.pi / 2) / 8 for i in range(9)]]
        segs += [(p, q, 0.07) for p, q in zip(pts, pts[1:])]
    for j in range(1, rings + 1):
        t = j * (math.pi / 2) / (rings + 1)
        rr, zz = r * math.cos(t), cz + r * math.sin(t)
        pts = [Vector((cx + math.cos(a) * rr, cy + math.sin(a) * rr, zz)) for a in [i * math.tau / 32 for i in range(33)]]
        segs += [(p, q, 0.06) for p, q in zip(pts, pts[1:])]
    C.tubes(f"{name}_ribs", segs, rib, verts=6)
    M.disc_ring(f"{name}_base", r + 0.3, r - 0.2, (cx, cy, cz - 0.05), 0.3, rib, n=64)
    M.disc_ring(f"{name}_led", r + 0.32, r + 0.26, (cx, cy, cz + 0.1), 0.06, "led_cyan", n=64)


def chain_cubes(name, center, r=2.4, n=6, s=0.9):
    """Blockchain hologram: a ring of glowing cubes, each linked to the next, with hash rings; turns slowly."""
    parts = []
    with group("move"):
        pts = []
        for k in range(n):
            a = k * math.tau / n
            p = Vector((math.cos(a) * r, math.sin(a) * r, 0.35 * math.sin(a * 2)))
            pts.append(p)
            parts.append(box(f"{name}_cube{k}", (s, s, s), (p.x, p.y, p.z - s / 2), "holo", bevel=0.06, rot=(0, 0, a)))
            parts.append(box(f"{name}_core{k}", (s * 0.4, s * 0.4, s * 0.4), (p.x, p.y, p.z - s * 0.2), "led_cyan" if k % 2 else "led_pink", bevel=0.02, rot=(0, 0, a)))
        links = [(pts[k], pts[(k + 1) % n], 0.06) for k in range(n)]
        parts.append(C.tubes(f"{name}_links", links, "holo", verts=6))
    body = L.rigid(parts, name)
    body.location = center
    body["spin"], body["spin_speed"] = "z", 0.35
    return body


def headset(name, center, s=2.0, mat="robot_white", accent="accent_blue"):
    """Big call-centre headset sculpture: headband arc, two ear cups with LED rims and a mic boom."""
    cx, cy, cz = center
    band = [Vector((cx + math.cos(t) * s, cy, cz + math.sin(t) * s)) for t in [i * math.pi / 14 for i in range(15)]]
    C.tubes(f"{name}_band", [(p, q, 0.16 * s / 2) for p, q in zip(band, band[1:])], mat, verts=10)
    for sx in (-1, 1):
        cyl(f"{name}_cup{sx}", 0.55 * s / 2 * 1.4, 0.42 * s / 2, (cx + sx * (s + 0.05), cy, cz - 0.1), accent, verts=24, rot=(0, math.pi / 2 * sx, 0), bevel=0.04)
        cyl(f"{name}_pad{sx}", 0.5 * s / 2 * 1.4, 0.06, (cx + sx * (s - 0.02), cy, cz - 0.1), "led_cyan", verts=24, rot=(0, math.pi / 2 * sx, 0))
    boom = C.bezier((cx - s, cy - 0.1, cz - 0.3), (cx - s, cy - 0.5 * s, cz - 0.7 * s), (cx - 0.5 * s, cy - 0.7 * s, cz - 0.8 * s), (cx - 0.2 * s, cy - 0.7 * s, cz - 0.75 * s), 10)
    C.tubes(f"{name}_boom", [(a, b, 0.05 * s) for a, b in zip(boom, boom[1:])], mat, verts=8)
    sphere(f"{name}_mic", 0.12 * s, (cx - 0.15 * s, cy - 0.7 * s, cz - 0.75 * s), "led_cyan", subdiv=1)


def glass_sphere(name, center, r, rib="white", meridians=10, rings=5):
    """Glass globe on a cradle ring: meridian ribs and latitude rings in short pieces (vertex-lit)."""
    cx, cy, cz = center
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=40, v_segments=24, radius=r)
    bmesh.ops.translate(bm, vec=Vector(center), verts=bm.verts)
    L._finish(bm, f"{name}_glass", "glass", smooth=True)
    segs = []
    for k in range(meridians):
        a = k * math.pi / meridians  # each meridian is a full great circle through the poles
        pts = [Vector((cx + math.cos(a) * r * math.cos(t), cy + math.sin(a) * r * math.cos(t), cz + r * math.sin(t))) for t in [i * math.tau / 32 for i in range(33)]]
        segs += [(p, q, 0.07) for p, q in zip(pts, pts[1:])]
    for j in range(1, rings + 1):
        t = -math.pi / 2 + j * math.pi / (rings + 1)
        rr, zz = r * math.cos(t), cz + r * math.sin(t)
        pts = [Vector((cx + math.cos(a) * rr, cy + math.sin(a) * rr, zz)) for a in [i * math.tau / 32 for i in range(33)]]
        segs += [(p, q, 0.06) for p, q in zip(pts, pts[1:])]
    C.tubes(f"{name}_ribs", segs, rib, verts=6)
    M.disc_ring(f"{name}_equator", r + 0.12, r - 0.05, (cx, cy, cz - 0.12), 0.24, "led_cyan", n=64)


def icon_orbit(name, center, r, icons, size=1.6):
    """A ring of floating service icons (screen_icon_*) facing outwards, turning slowly about the hub."""
    parts = []
    with group("move"):
        n = len(icons)
        for k, kind in enumerate(icons):
            a = k * math.tau / n
            parts.append(L.plane(f"{name}_{kind}{k}", (size, size), (math.cos(a) * r, math.sin(a) * r, 0.4 * math.sin(a * 3)), f"screen_icon_{kind}",
                                 rot=(math.pi / 2, 0, a + math.pi / 2)))
        parts.append(M.disc_ring(f"{name}_track", r + 0.05, r - 0.05, (0, 0, -size / 2 - 0.2), 0.04, "holo", n=96))
    body = L.rigid(parts, name)
    body.location = center
    body["spin"], body["spin_speed"] = "z", 0.12
    return body


def skybridge(name, a, b, z, w=3.0, glass="glass", frame="white"):
    """Elevated glass walkway from a to b (xy) at deck level z: deck slab, glass balustrades with a rail, LED
    lines under both edges and a fibre 'data line' along the floor."""
    a, b = Vector((a[0], a[1], 0)), Vector((b[0], b[1], 0))
    d = b - a
    ln = d.length
    ang = math.atan2(d.y, d.x)
    c = (a + b) / 2
    r = (0, 0, ang)
    box(f"{name}_deck", (ln, w, 0.45), (c.x, c.y, z - 0.44), frame, bevel=0.04, rot=r)  # 1 cm proud of the decks it lands on
    nx, ny = -math.sin(ang), math.cos(ang)
    for s in (-1, 1):
        ox, oy = c.x + nx * s * (w / 2 - 0.05), c.y + ny * s * (w / 2 - 0.05)
        box(f"{name}_glass{s}", (ln, 0.04, 1.1), (ox, oy, z), glass, bevel=0, rot=r)
        box(f"{name}_led{s}", (ln, 0.05, 0.06), (c.x + nx * s * w / 2, c.y + ny * s * w / 2, z - 0.4), "led_cyan", bevel=0, rot=r)
        p0 = Vector((a.x + nx * s * (w / 2 - 0.05), a.y + ny * s * (w / 2 - 0.05), z + 1.1))
        p1 = Vector((b.x + nx * s * (w / 2 - 0.05), b.y + ny * s * (w / 2 - 0.05), z + 1.1))
        C.tubes(f"{name}_rail{s}", [(p, q, 0.04) for p, q in C.split([p0, p1], 2.5)], frame, verts=6)
    box(f"{name}_fibre", (ln, 0.12, 0.02), (c.x, c.y, z), "led_blue", bevel=0, rot=r)


def arc_band(cx, cy, r_in, r_out, a0, a1, n=24):
    """Closed outline of a ring segment (outer arc a0 -> a1, inner arc back)."""
    outer = [(cx + r_out * math.cos(a0 + (a1 - a0) * i / n), cy + r_out * math.sin(a0 + (a1 - a0) * i / n)) for i in range(n + 1)]
    inner = [(cx + r_in * math.cos(a0 + (a1 - a0) * i / n), cy + r_in * math.sin(a0 + (a1 - a0) * i / n)) for i in range(n, -1, -1)]
    return outer + inner


# ------------------------------------------------------------------ data hall

def rack(name, loc, rot_z=0.0, screen="screen_rackfront"):
    """Server rack (door to local -y) whose front is one lit panel of colourful blinking LEDs (the artwork's racks)."""
    at = _at(loc, rot_z)
    r = (0, 0, rot_z)
    box(f"{name}_body", (0.62, 1.1, 2.2), at(0, 0, 0), "darkgray", bevel=0.02, rot=r)
    box(f"{name}_top", (0.64, 1.12, 0.06), at(0, 0, 2.2), "midgray", bevel=0.01, rot=r)
    M.screen_at(f"{name}_front", (0.5, 1.95), at(0, -0.56, 1.1), rot_z - math.pi / 2, screen, bezel=0.03, depth=0.02)


def rack_aisle(name, x0, y, n, z, gap=1.2, pitch=0.66, roof="glass"):
    """Contained cold aisle: two facing rows of n racks along x (fronts into the aisle), glass roof and doors."""
    for i in range(n):
        x = x0 + pitch * (i + 0.5)
        rack(f"{name}_a{i}", (x, y - gap / 2 - 0.55, z), math.pi)
        rack(f"{name}_b{i}", (x, y + gap / 2 + 0.55, z), 0.0)
    ln = pitch * n
    box(f"{name}_roof", (ln, gap + 0.1, 0.04), (x0 + ln / 2, y, z + 2.2), roof, bevel=0)
    for s in (-1, 1):
        box(f"{name}_rail{s}", (ln, 0.06, 0.08), (x0 + ln / 2, y + s * (gap / 2 + 0.03), z + 2.2), "frame_dark", bevel=0)
        box(f"{name}_door{s}", (0.04, gap, 2.2), (x0 + (ln if s > 0 else 0), y, z), "glass", bevel=0)
    box(f"{name}_led", (ln, 0.03, 0.03), (x0 + ln / 2, y, z + 2.16), "led_blue", bevel=0)
    box(f"{name}_tray", (ln, 0.45, 0.08), (x0 + ln / 2, y - gap / 2 - 0.55, z + 2.7), "rack_orange", bevel=0)
    box(f"{name}_tray2", (ln, 0.45, 0.08), (x0 + ln / 2, y + gap / 2 + 0.55, z + 2.7), "duct_blue", bevel=0)


# ------------------------------------------------------------------ big data

def bar_sculpture(name, loc, heights=(2.2, 3.6, 5.0, 6.6, 8.6, 10.6), w=1.5, gap=0.25, rot_z=0.0,
                  mats=("coral", "orange", "flower_yellow", "lime", "sky_blue", "flower_purple")):
    """Giant bar chart of the artwork: rising colourful bars on a plinth with an LED trend line on top."""
    at = _at(loc, rot_z)
    n = len(heights)
    span = n * w + (n - 1) * gap
    box(f"{name}_plinth", (span + 1.0, w + 1.0, 0.4), at(0, 0, 0), "robot_white", bevel=0.05, rot=(0, 0, rot_z))
    tops = []
    for k, (h, m) in enumerate(zip(heights, mats)):
        x = -span / 2 + w / 2 + k * (w + gap)
        box(f"{name}_bar{k}", (w, w, h), at(x, 0, 0.4), m, bevel=0.06, rot=(0, 0, rot_z))
        tops.append(at(x, -w / 2 - 0.05, 0.4 + h + 0.4))
    C.tubes(f"{name}_trend", [(a, b, 0.07) for a, b in zip(tops, tops[1:])], "led_cyan", verts=8)
    for k, p in enumerate(tops):
        sphere(f"{name}_dot{k}", 0.18, (p.x, p.y, p.z - 0.18), "led_cyan", subdiv=1)


def arc_ring(name, center, r_out, r_in, a0, a1, depth, mat, face=0.0, n=24):
    """A coloured slice of a donut chart standing upright (in the plane facing compass angle `face`)."""
    bm = bmesh.new()
    cx, cy, cz = center
    c, s = math.cos(face + math.pi / 2), math.sin(face + math.pi / 2)  # in-plane horizontal axis

    def p(rr, a, d):
        u, v = rr * math.cos(a), rr * math.sin(a)
        nx, ny = math.cos(face), math.sin(face)
        return (cx + c * u + nx * d, cy + s * u + ny * d, cz + v)

    rows = []
    for d in (-depth / 2, depth / 2):
        rows.append([bm.verts.new(p(rr, a0 + (a1 - a0) * i / n, d)) for rr in (r_out, r_in) for i in range(n + 1)])
    for f in rows:
        outer, inner = f[: n + 1], f[n + 1:]
        for i in range(n):
            bm.faces.new((outer[i], outer[i + 1], inner[i + 1], inner[i]))
    (fo, fi), (bo, bi) = [(r[: n + 1], r[n + 1:]) for r in rows]
    for i in range(n):
        bm.faces.new((fo[i], bo[i], bo[i + 1], fo[i + 1]))
        bm.faces.new((fi[i + 1], bi[i + 1], bi[i], fi[i]))
    for ring in ((fo, fi, bo, bi),):
        a, b, cc, d = ring
        bm.faces.new((a[0], b[0], d[0], cc[0]))
        bm.faces.new((a[n], cc[n], d[n], b[n]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return L._finish(bm, name, mat)


def donut_sculpture(name, loc, r=3.0, face=-math.pi / 2,
                    parts=((0.34, "sky_blue"), (0.22, "flower_yellow"), (0.18, "coral"), (0.26, "lime"))):
    """Upright donut chart on a stand, its slices in the artwork's bright colours."""
    x, y, z = loc
    box(f"{name}_stand", (0.5, 0.5, 1.6), (x, y, z), "robot_white", bevel=0.04)
    box(f"{name}_foot", (2.4, 1.0, 0.25), (x, y, z), "robot_white", bevel=0.04)
    c = (x, y, z + 1.6 + r)
    a = math.pi / 2
    for k, (f, m) in enumerate(parts):
        b = a - f * math.tau
        arc_ring(f"{name}_s{k}", c, r, r * 0.55, b + 0.02, a - 0.02, 0.5, m, face=face)
        a = b
    sphere(f"{name}_hub", r * 0.3, c, "led_cyan", subdiv=2)


def data_silo(name, loc, r=3.0, h=18.0, rings=7):
    """Data-lake storage tower: a glazed drum with white floor rings and LED bands, a crown with a light beacon."""
    x, y, z = loc
    cyl(f"{name}_core", r - 0.35, h, (x, y, z), "cyber_glass", verts=40)
    for k in range(rings + 1):
        zz = z + k * h / rings
        cyl(f"{name}_ring{k}", r, 0.35, (x, y, zz - 0.17), "white", verts=40, bevel=0.03)
        if 0 < k < rings:
            cyl(f"{name}_led{k}", r + 0.02, 0.06, (x, y, zz + 0.25), "led_cyan" if k % 2 else "led_blue", verts=40)
    cyl(f"{name}_crown", r * 0.7, 1.6, (x, y, z + h + 0.18), "robot_white", verts=32, r2=r * 0.4, bevel=0.05)
    cyl(f"{name}_beacon", 0.25, 0.5, (x, y, z + h + 1.78), "led_cyan", verts=16)
