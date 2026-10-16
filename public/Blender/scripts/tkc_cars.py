"""Detailed road vehicles (Blender 5.x, Z up, metres, facing +x, origin on the ground under the middle):
sedan, hatch, suv, van, ambulance, the cab and running gear of a box truck (its old cargo box stays), and the
driverless robotaxi pod, shuttle and campus cart of the autonomous scene.

The dioramas were baked with the blocky tkc_lib car() / van(); the browser swaps every one of them for one of these
at load time (src/three/model/cars.js), so no scene needs a re-bake.
  blender -b --factory-startup --python tkc_cars.py                       -> public/models/vehicles.glb
  blender -b --factory-startup --python tkc_cars.py -- preview out.png [variant ...]   look-dev renders (car_preview.py)

Each variant is an empty with child meshes. Material names are what cars.js maps: paint (tinted per car), glass,
trim, black, gap, chrome, rim, disc, caliper, tyre, interior, people, plate, lens, drl, tail, tail_led, screen,
livery_*, beacon_*. Children named *_wheel_* spin in moving cars; *_driver only shows in moving cars.
Vertex colours carry baked AO (times the base colour of the cabin, people and plates).

The body is a loft of cross-sections (half_ring) along x, closed with rounded ends; window, lamp, grille and
seam outlines are cut into it with planes (Region) so every edge is crisp, then recessed a few mm.
"""
import math
import os
import sys

import bmesh
import bpy
from mathutils import Matrix, Vector
from mathutils.bvhtree import BVHTree

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.normpath(os.path.join(HERE, "..", "..", "models", "vehicles.glb"))

# name: (base rgb, roughness, metallic, emission) - only for previews; the browser uses its own materials
MATS = {
    "paint": ((0.8, 0.8, 0.8), 0.28, 0.2, 0),
    "glass": ((0.02, 0.03, 0.04), 0.04, 0.0, 0),
    "trim": ((0.03, 0.032, 0.035), 0.55, 0.0, 0),
    "black": ((0.012, 0.012, 0.014), 0.12, 0.0, 0),
    "gap": ((0.004, 0.004, 0.004), 0.8, 0.0, 0),
    "chrome": ((0.92, 0.93, 0.95), 0.08, 1.0, 0),
    "rim": ((0.66, 0.68, 0.71), 0.25, 1.0, 0),
    "disc": ((0.34, 0.34, 0.35), 0.45, 1.0, 0),
    "caliper": ((0.55, 0.05, 0.03), 0.35, 0.0, 0),
    "tyre": ((0.035, 0.035, 0.038), 0.85, 0.0, 0),
    "interior": ((1, 1, 1), 0.8, 0.0, 0),
    "people": ((1, 1, 1), 0.7, 0.0, 0),
    "plate": ((1, 1, 1), 0.4, 0.0, 0),
    "lens": ((0.78, 0.8, 0.83), 0.05, 0.6, 0),
    "drl": ((1, 0.98, 0.95), 0.2, 0.0, 6),
    "tail": ((0.3, 0.012, 0.014), 0.08, 0.0, 0),
    "tail_led": ((1, 0.06, 0.04), 0.2, 0.0, 6),
    "screen": ((0.02, 0.05, 0.1), 0.15, 0.0, 0.6),
    "livery_orange": ((0.92, 0.36, 0.05), 0.3, 0.0, 0),
    "livery_red": ((0.72, 0.04, 0.04), 0.3, 0.0, 0),
    "livery_blue": ((0.05, 0.25, 0.75), 0.3, 0.0, 0),
    "beacon_red": ((1, 0.1, 0.08), 0.2, 0.0, 4),
    "beacon_blue": ((0.1, 0.3, 1), 0.2, 0.0, 4),
    "led_cyan": ((0.25, 0.85, 1.0), 0.2, 0.0, 5),  # sensor and status lights of the driverless vehicles
    "lod": ((1, 1, 1), 0.4, 0.1, 0),  # far-away stand-in: colours in the vertex colours, alpha 1 = car paint
}
SLOT = {n: i for i, n in enumerate(MATS)}
WHITE = (1.0, 1.0, 1.0, 1.0)
COL = None


def material(name):
    m = bpy.data.materials.get(name)
    if m:
        return m
    rgb, rough, metal, emit = MATS[name]
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    p = m.node_tree.nodes["Principled BSDF"]
    p.inputs["Base Color"].default_value = (*rgb, 1)
    p.inputs["Roughness"].default_value = rough
    p.inputs["Metallic"].default_value = metal
    if emit:
        p.inputs["Emission Color"].default_value = (*rgb, 1)
        p.inputs["Emission Strength"].default_value = emit
    if name in ("interior", "people", "plate", "lod"):  # base colour lives in the vertex colours
        a = m.node_tree.nodes.new("ShaderNodeAttribute")
        a.attribute_name = "base"
        m.node_tree.links.new(a.outputs["Color"], p.inputs["Base Color"])
    if name == "glass":
        m.surface_render_method = "BLENDED"
        p.inputs["Alpha"].default_value = 0.35
        p.inputs["Coat Weight"].default_value = 1.0
    if name == "paint":
        p.inputs["Coat Weight"].default_value = 1.0
        p.inputs["Coat Roughness"].default_value = 0.04
    return m


# ------------------------------------------------------------------ small helpers

def curve(pts):
    """Monotone cubic (PCHIP) through [(x, y), ...]; flat outside the points."""
    pts = sorted(pts)
    xs, ys = [p[0] for p in pts], [p[1] for p in pts]
    n = len(xs)
    hs = [xs[i + 1] - xs[i] for i in range(n - 1)]
    ds = [(ys[i + 1] - ys[i]) / hs[i] for i in range(n - 1)]
    ms = [ds[0]] + [0.0] * (n - 2) + [ds[-1]]
    for i in range(1, n - 1):
        if ds[i - 1] * ds[i] > 0:
            w1, w2 = 2 * hs[i] + hs[i - 1], hs[i] + 2 * hs[i - 1]
            ms[i] = (w1 + w2) / (w1 / ds[i - 1] + w2 / ds[i])

    def f(x):
        if x <= xs[0]:
            return ys[0]
        if x >= xs[-1]:
            return ys[-1]
        i = max(k for k in range(n - 1) if xs[k] <= x)
        h = hs[i]
        t = (x - xs[i]) / h
        return (2 * t**3 - 3 * t**2 + 1) * ys[i] + (t**3 - 2 * t**2 + t) * h * ms[i] + (-2 * t**3 + 3 * t**2) * ys[i + 1] + (t**3 - t**2) * h * ms[i + 1]

    return f


def new_bm():
    bm = bmesh.new()
    bm.loops.layers.float_color.new("base")
    return bm


def _setup(faces, mat, col, bm, smooth=True):
    lay = bm.loops.layers.float_color["base"]
    for f in faces:
        f.material_index = SLOT[mat]
        f.smooth = smooth
        for lp in f.loops:
            lp[lay] = col
    return list(faces)


def _faces_of(verts):
    out = set()
    for v in verts:
        out.update(v.link_faces)
    return out


def rot_to(direction):
    """Rotation matrix turning local +y onto `direction`."""
    return Vector((0, 1, 0)).rotation_difference(Vector(direction).normalized()).to_matrix().to_4x4()


def box(bm, size, loc, mat, bevel=0.0, seg=2, rot=Matrix.Identity(4), col=WHITE):
    m = Matrix.Translation(loc) @ rot @ Matrix.Diagonal((*size, 1))
    vs = bmesh.ops.create_cube(bm, size=1.0, matrix=m)["verts"]
    if bevel > 0:
        edges = set()
        for v in vs:
            edges.update(v.link_edges)
        vs = bmesh.ops.bevel(bm, geom=list(vs) + list(edges), offset=bevel, segments=seg, affect="EDGES", profile=0.5, clamp_overlap=True)["verts"]
    return _setup(_faces_of(vs), mat, col, bm)


def cylinder(bm, r, depth, loc, mat, rot=Matrix.Identity(4), segs=24, r2=None, col=WHITE):
    """Cylinder along local z (rot turns it), centred on loc."""
    m = Matrix.Translation(loc) @ rot
    vs = bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=segs, radius1=r, radius2=r if r2 is None else r2, depth=depth, matrix=m)["verts"]
    return _setup(_faces_of(vs), mat, col, bm)


def sphere(bm, r, loc, mat, scale=(1, 1, 1), u=20, v=12, col=WHITE):
    m = Matrix.Translation(loc) @ Matrix.Diagonal((*scale, 1))
    vs = bmesh.ops.create_uvsphere(bm, u_segments=u, v_segments=v, radius=r, matrix=m)["verts"]
    return _setup(_faces_of(vs), mat, col, bm)


def lathe(bm, prof, segs, mat, m=Matrix.Identity(4), col=WHITE):
    """Revolve a closed profile [(r, y), ...] about local y (a ring solid)."""
    rows = []
    for k in range(segs):
        a = math.tau * k / segs
        rows.append([bm.verts.new(m @ Vector((r * math.cos(a), y, r * math.sin(a)))) for r, y in prof])
    fs = []
    n = len(prof)
    for k in range(segs):
        A, B = rows[k], rows[(k + 1) % segs]
        for j in range(n):
            jj = (j + 1) % n
            fs.append(bm.faces.new((A[j], A[jj], B[jj], B[j])))
    bmesh.ops.recalc_face_normals(bm, faces=fs)
    return _setup(fs, mat, col, bm)


def hexa(bm, corners, mat, bevel=0.0, col=WHITE):
    """Solid from 8 corners: bottom quad then top quad (same winding)."""
    vs = [bm.verts.new(c) for c in corners]
    b, t = vs[:4], vs[4:]
    fs = [bm.faces.new(b), bm.faces.new(t)] + [bm.faces.new((b[i], b[(i + 1) % 4], t[(i + 1) % 4], t[i])) for i in range(4)]
    bmesh.ops.recalc_face_normals(bm, faces=fs)
    if bevel > 0:
        edges = set()
        for f in fs:
            edges.update(f.edges)
        vs = bmesh.ops.bevel(bm, geom=vs + list(edges), offset=bevel, segments=2, affect="EDGES", profile=0.5, clamp_overlap=True)["verts"]
    return _setup(_faces_of(vs), mat, col, bm)


def bar(bm, a, b, thick, mat, col=WHITE, bevel=0.0):
    """Box from point a to point b (thick = (w, h) across)."""
    a, b = Vector(a), Vector(b)
    d = b - a
    m = rot_to(d)
    return box(bm, (thick[0], d.length, thick[1]), (a + b) / 2, mat, bevel=bevel, rot=m, col=col)


def to_object(name, bm, parent, sharp=38):
    me = bpy.data.meshes.new(name)
    bm.normal_update()
    bm.to_mesh(me)
    bm.free()
    for n in MATS:
        me.materials.append(material(n))
    if sharp:
        me.set_sharp_from_angle(angle=math.radians(sharp))
    ob = bpy.data.objects.new(name, me)
    COL.objects.link(ob)
    ob.parent = parent
    return ob


# ------------------------------------------------------------------ body loft

UY = (0.0, 0.06, 0.5, 0.93, 1.0)  # greenhouse stations: share of the way in from wg to wr
UZ = (0.0, 0.07, 0.5, 0.925, 0.975)  # ... and of the cabin height
RV = (0.1, 0.5, 1.0)  # roof stations: share of the way from the roof edge to the centre
LOWER = 9  # stations from the bottom centre up to the shoulder
NH = LOWER + len(UY) + len(RV)  # stations in a half ring
# bands: faces between station j and j+1 of the half ring
BELT_TOP = LOWER - 1  # shoulder to the base of the greenhouse
BELT_SEAL = LOWER
SIDE = (LOWER + 1, LOWER + 2)  # side glass
TOP_SEAL = LOWER + 3
ROOF_EDGE = LOWER + 4
ROOF = (LOWER + 5, LOWER + 6)  # roof / windscreen / rear window
GH = (BELT_SEAL, *SIDE, TOP_SEAL)


class Spec:
    def __init__(self, **kw):
        self.__dict__.update(dict(inset=0.09, roof=0.70, crown=0.04, step=0.15, ends=(0.2, 0.4, 0.58, 0.72, 0.84, 0.93, 0.98), pf=2.4, pr=3.0, belt="trim", roof_mat="paint", rear_glass="roof"))
        self.__dict__.update(kw)
        self.W, self.ZB, self.ZS, self.H = curve(kw["w"]), curve(kw["zb"]), curve(kw["zs"]), curve(kw["h"])

    def top(self, x):
        return self.ZS(x) + 0.012 + max(0.0, self.H(x)) + self.crown


def half_ring(S, x):
    w, zb, zs, h = S.W(x), S.ZB(x), S.ZS(x), max(0.0, S.H(x))
    wg, wr = w - S.inset, w * S.roof
    rb, sd = 0.07, zs - zb

    def cr(y):
        return S.crown * (1 - (y / w) ** 2)

    pts = [(0.0, zb), (w - rb, zb), (w - rb * 0.29, zb + rb * 0.29), (w - 0.012, zb + rb),
           (w - 0.004, zb + 0.32 * sd), (w, zb + 0.62 * sd), (w - 0.012, zs - 0.07), (w - 0.032, zs - 0.02), (w - 0.06, zs + 0.004)]
    for uy, uz in zip(UY, UZ):
        y = wg - (wg - wr) * uy
        pts.append((y, zs + 0.012 + h * uz + cr(y)))
    for v in RV:
        y = wr * (1 - v)
        pts.append((y, zs + 0.012 + h + cr(y)))
    return pts


def ring(S, x, s=1.0):
    half = half_ring(S, x)
    full = half + [(-y, z) for y, z in reversed(half[1:-1])]
    if s < 1:
        zc = (half[0][1] + half[-1][1]) / 2
        full = [(y * s, zc + (z - zc) * s) for y, z in full]
    return full


def band_of(j):
    return j if j < NH - 1 else 2 * NH - 3 - j


def sections(S):
    """(x, scale) from the rear to the front; the end zones shrink the ring towards its middle (superellipse)."""
    x0, x1 = S.xr + S.er, S.xf - S.ef
    n = max(8, round((x1 - x0) / S.step))
    xs = [x0 + (x1 - x0) * i / n for i in range(n + 1)]
    # extra sections where the profile turns sharply: cowl, roof ends, base of the rear window, the arches
    keys = [S.ws[0], S.ws[1], S.rw[0], S.rw[1]] + [x for xw in S.wheels for x in (xw - S.arch, xw, xw + S.arch)]
    for k in keys:
        if x0 < k < x1 and min(abs(k - x) for x in xs) > 0.03:
            xs.append(k)
    T = S.ends
    rear = [(x0 - S.er * t, (1 - t**S.pr) ** (1 / S.pr)) for t in reversed(T)]
    front = [(x1 + S.ef * t, (1 - t**S.pf) ** (1 / S.pf)) for t in T]
    return rear + [(x, 1.0) for x in sorted(xs)] + front


def loft(bm, S, secs, offset=0.0, poles=True):
    band = bm.faces.layers.int.get("band") or bm.faces.layers.int.new("band")
    R = 2 * NH - 2
    rows = []
    for x, s in secs:
        pts = ring(S, x, s)
        if offset:  # inwards along the ring's 2D normals (the ring runs counter-clockwise in y-z)
            out = []
            for j, (y, z) in enumerate(pts):
                (y0, z0), (y1, z1) = pts[j - 1], pts[(j + 1) % R]
                ny, nz = -(z1 - z0), (y1 - y0)
                ln = math.hypot(ny, nz) or 1
                out.append((y + ny / ln * offset, z + nz / ln * offset))
            pts = out
        rows.append([bm.verts.new((x, y, z)) for y, z in pts])
    for a, b in zip(rows, rows[1:]):
        for j in range(R):
            k = (j + 1) % R
            bm.faces.new((a[j], a[k], b[k], b[j]))[band] = band_of(j)
    if poles:
        for row, x in ((rows[0], S.xr), (rows[-1], S.xf)):
            zc = sum(v.co.z for v in row) / R
            pole = bm.verts.new((x, 0.0, zc))
            for j in range(R):
                bm.faces.new((row[j], row[(j + 1) % R], pole))[band] = band_of(j)
    return rows


# ------------------------------------------------------------------ regions: plane-cut outlines with a material

class Region:
    """Faces whose centre is inside every half-space (co, no) and passes test(c, n, band) get `mat`.
    sym: the half-spaces are tested on |y| and their planes are cut on both sides."""

    def __init__(self, mat, cons=(), test=None, depth=0.0, wall="trim", sym=True, hole=False):
        self.mat, self.cons, self.test, self.depth, self.wall, self.sym = mat, [(Vector(c), Vector(n).normalized()) for c, n in cons], test, depth, wall, sym
        self.hole = hole  # glass: the cabin lining leaves a hole behind it

    def planes(self):
        out = []
        for c, n in self.cons:
            out.append((c, n))
            if self.sym and (abs(n.y) > 1e-6 or abs(c.y) > 1e-6):
                out.append((Vector((c.x, -c.y, c.z)), Vector((n.x, -n.y, n.z))))
        return out

    def match(self, c, n, band):
        p = Vector((c.x, abs(c.y), c.z)) if self.sym else c
        nn = Vector((n.x, abs(n.y), n.z)) if self.sym else n
        if any((p - co).dot(no) < 0 for co, no in self.cons):
            return False
        return self.test is None or self.test(p, nn, band)


def gx(v):
    return ((v, 0, 0), (1, 0, 0))


def lx(v):
    return ((v, 0, 0), (-1, 0, 0))


def gy(v):
    return ((0, v, 0), (0, 1, 0))


def ly(v):
    return ((0, v, 0), (0, -1, 0))


def gz(v):
    return ((0, 0, v), (0, 0, 1))


def lz(v):
    return ((0, 0, v), (0, 0, -1))


def left_xz(p0, p1):
    """Left of the line p0 -> p1 in the side view (x, z)."""
    dx, dz = p1[0] - p0[0], p1[1] - p0[1]
    return ((p0[0], 0, p0[1]), (-dz, 0, dx))


def left_yz(p0, p1):
    """Left of the line p0 -> p1 in the front view (y, z), looking from +x... i.e. (y, z) axes."""
    dy, dz = p1[0] - p0[0], p1[1] - p0[1]
    return ((0, p0[0], p0[1]), (0, -dz, dy))


def strip_xz(p0, p1, w):
    """Narrow strip of width w around the side-view line p0 -> p1."""
    dx, dz = p1[0] - p0[0], p1[1] - p0[1]
    ln = math.hypot(dx, dz)
    ox, oz = -dz / ln * w / 2, dx / ln * w / 2
    a = left_xz((p0[0] - ox, p0[1] - oz), (p1[0] - ox, p1[1] - oz))
    b = left_xz((p1[0] + ox, p1[1] + oz), (p0[0] + ox, p0[1] + oz))
    return [a, b]


def clip_below(pts, zmax):
    """Clip a closed polygon [(y, z), ...] to z <= zmax."""
    out = []
    for i, (y1, z1) in enumerate(pts):
        y0, z0 = pts[i - 1]
        if (z0 <= zmax) != (z1 <= zmax):
            t = (zmax - z0) / (z1 - z0)
            out.append((y0 + (y1 - y0) * t, zmax))
        if z1 <= zmax:
            out.append((y1, z1))
    return out


def is_side(n):
    return abs(n.y) > 0.45


def recess(bm, faces, depth, wall):
    bm.normal_update()
    key = lambda co: (round(co.x, 5), round(co.y, 5), round(co.z, 5))
    nmap = {}
    for f in faces:
        for v in f.verts:
            nmap[key(v.co)] = v.normal.copy()
    geom = bmesh.ops.extrude_face_region(bm, geom=list(faces))["geom"]
    moved = [e for e in geom if isinstance(e, bmesh.types.BMVert)]
    for v in moved:
        v.co -= nmap.get(key(v.co), Vector()) * depth
    ms = set(moved)
    for v in moved:
        for f in v.link_faces:
            if any(u not in ms for u in f.verts):
                f.material_index = SLOT[wall]


def paint_regions(bm, regions, extrude=True, cut=True):
    for r in regions if cut else ():
        for co, no in r.planes():
            # cut only near the region (every other half-space holds within 3 cm): keeps the triangle count down
            others = [(c2, n2) for c2, n2 in r.cons if (c2 - co).length > 1e-9 or abs(abs(n2.dot(no)) - 1) > 1e-6]
            near = []
            for f in bm.faces:
                c = f.calc_center_median()
                p = Vector((c.x, abs(c.y), c.z)) if r.sym else c
                if all((p - c2).dot(n2) > -0.03 for c2, n2 in others):
                    near.append(f)
            if not near:
                continue
            edges = {e for f in near for e in f.edges}
            verts = {v for f in near for v in f.verts}
            bmesh.ops.bisect_plane(bm, geom=list(verts) + list(edges) + near, dist=1e-6, plane_co=co, plane_no=no)
    bm.normal_update()
    band = bm.faces.layers.int["band"]
    hit = {}
    for f in bm.faces:
        c, n, b = f.calc_center_median(), f.normal, f[band]
        win = None
        for r in regions:
            if r.match(c, n, b):
                win = r
        f.material_index = SLOT[win.mat if win else "paint"]
        f.smooth = True
        if win:
            hit[f] = win
    if extrude:
        groups = {}
        for f, r in hit.items():
            if r.depth > 0:
                groups.setdefault((r.depth, r.wall), []).append(f)
        for (d, wall), fs in sorted(groups.items()):
            recess(bm, fs, d, wall)
    return hit


def window_regions(S):
    """Glass and its seals / frit / pillars (shared by the body and the cabin lining)."""
    R = []
    cline = left_xz(S.cline[1], S.cline[0])  # in front of the C line (it runs from the roof down to the belt)
    sideglass = [lx(S.sail), cline]
    R.append(Region("trim", [gx(S.sail), lx(S.ws[0] + 0.02)], lambda c, n, b: b in GH and is_side(n)))  # mirror sail
    R.append(Region(S.belt, sideglass, lambda c, n, b: b == BELT_SEAL))
    R.append(Region("trim", sideglass, lambda c, n, b: b == TOP_SEAL))
    R.append(Region("glass", sideglass, lambda c, n, b: b in SIDE, depth=0.008, hole=True))
    for p0, p1 in S.pillars:
        R.append(Region("black", [gx(p0), lx(p1)], lambda c, n, b: b in GH))
    if getattr(S, "cpillar", None):  # behind the C line, up to the rear window
        R.append(Region(S.cpillar, [left_xz(S.cline[0], S.cline[1])], lambda c, n, b: b in GH and is_side(n)))
    if getattr(S, "front_glass", None):  # a cab-over truck's upright windscreen, cut into the front face
        z0, z1, yw = S.front_glass
        nose = lambda c, n, b: n.x > 0.3 and c.x > S.xf - 0.6
        R.append(Region("glass", [gz(z0), lz(z1), ly(yw)], nose, depth=0.008, hole=True))
        for cons in ([gz(z0), lz(z0 + 0.04), ly(yw)], [gz(z1 - 0.03), lz(z1), ly(yw)], [gz(z0), lz(z1), gy(yw - 0.035), ly(yw)]):
            R.append(Region("black", cons, nose, depth=0.008, hole=True))
    # windscreen with a black frit border, all on one glass plane
    w0, w1 = S.ws
    yf = 0.9 * S.W(0.5 * (w0 + w1)) * S.roof - 0.03
    R.append(Region("glass", [gx(w1), lx(w0)], lambda c, n, b: b in ROOF, depth=0.008, hole=True))
    for cons in ([gx(w0 - 0.04), lx(w0)], [gx(w1), lx(w1 + 0.03)], [gx(w1), lx(w0), gy(yf)]):
        R.append(Region("black", cons, lambda c, n, b: b in ROOF, depth=0.008, hole=True))
    if S.rear_glass == "roof":
        r0, r1 = S.rw
        R.append(Region("glass", [gx(r1), lx(r0)], lambda c, n, b: b in ROOF, depth=0.008, hole=True))
        R.append(Region("black", [gx(r1), lx(r1 + 0.04)], lambda c, n, b: b in ROOF, depth=0.008, hole=True))
        R.append(Region("black", [gx(r0 - 0.03), lx(r0)], lambda c, n, b: b in ROOF, depth=0.008, hole=True))
    elif S.rear_glass == "face":  # an upright tailgate / rear door window, cut into the rear face
        z0, z1, yw = S.rwz
        back = lambda c, n, b: n.x < -0.3 and c.x < S.xr + 0.7
        R.append(Region("glass", [gz(z0), lz(z1), ly(yw)], back, depth=0.008, hole=True))
        for cons in ([gz(z0), lz(z0 + 0.035), ly(yw)], [gz(z1 - 0.03), lz(z1), ly(yw)], [gz(z0), lz(z1), gy(yw - 0.035), ly(yw)]):
            R.append(Region("black", cons, back, depth=0.008, hole=True))
    return R


def body_regions(S):
    R = [Region("trim", [], lambda c, n, b: n.z < -0.55)]  # underbody
    R.append(Region("trim", [lz(S.lip_f), gx(S.xf - 0.45)]))
    R.append(Region("trim", [lz(S.lip_r), lx(S.xr + 0.45)]))
    if getattr(S, "clad", 0):
        R.append(Region("trim", [lz(S.clad)], lambda c, n, b: n.z > -0.55))
    if S.roof_mat != "paint":
        R.append(Region(S.roof_mat, [gx(getattr(S, "roof_x0", S.rw[0])), lx(S.ws[1])], lambda c, n, b: b in (ROOF_EDGE, *ROOF) and n.x > -0.45))  # not where the roof bands fold onto the tail
    for fn in getattr(S, "extra_regions", ()):
        R += fn(S)
    R += window_regions(S)
    # door shut lines on the sides (below the belt)
    for p0, p1, *side in S.seams:
        R.append(Region("gap", strip_xz(p0, p1, 0.012), lambda c, n, b, side=side: is_side(n) and b <= BELT_TOP and (not side or c.y * side[0] > 0), depth=0.004, wall="gap", sym=not side))
    for y, xa, xb in S.lid_seams:  # hood / boot lid lines on top
        R.append(Region("gap", [gy(y - 0.006), ly(y + 0.006), gx(xa), lx(xb)], lambda c, n, b: n.z > 0.45, depth=0.004, wall="gap"))
    # head lamps: lens wrapping round the corner with a DRL strip along the top
    y0, y1, z0, za, zb_, xb = S.lamp_f
    top = left_yz((y1, zb_), (y0, za))
    front = lambda c, n, b: n.x > -0.25 and n.z < 0.8 and c.x > xb
    R.append(Region("lens", [gy(y0), ly(y1), gz(z0), top, gx(xb)], front, depth=0.007, wall="black"))
    drl = left_yz((y0, za - 0.026), (y1, zb_ - 0.026))
    R.append(Region("drl", [gy(y0 + 0.02), ly(y1), drl, left_yz((y1, zb_ - 0.01), (y0, za - 0.01)), gx(xb)], front, depth=0.007, wall="black"))
    # grille with chrome slats, lower intake
    gy_, gz0, gz1 = S.grille
    nose = lambda c, n, b: n.x > 0.35 and c.x > S.xf - 0.4
    fx = gx(S.xf - 0.4)
    R.append(Region("trim", [ly(gy_), gz(gz0), lz(gz1), fx], nose, depth=0.022, wall="trim"))
    for k in range(S.slats):
        z = gz0 + (gz1 - gz0) * (k + 1) / (S.slats + 1)
        R.append(Region("chrome", [ly(gy_ - 0.02), gz(z - 0.006), lz(z + 0.006), fx], nose))
    iy, iz0, iz1 = S.intake
    R.append(Region("trim", [ly(iy), gz(iz0), lz(iz1), fx], lambda c, n, b: n.x > 0.25, depth=0.015, wall="trim"))
    # tail lamps (lens with an LED line) and the light bar between them
    ty0, ty1, tz0, tz1, tx = S.lamp_r
    rear = lambda c, n, b: n.x < 0.25 and n.z < 0.8 and c.x < tx
    R.append(Region("tail", [gy(ty0), ly(ty1), gz(tz0), lz(tz1), lx(tx)], rear, depth=0.006, wall="black"))
    led = (tz0 + tz1) / 2
    R.append(Region("tail_led", [gy(ty0 + 0.02), ly(ty1), gz(led - 0.008), lz(led + 0.008), lx(tx)], rear, depth=0.006, wall="black"))
    if S.light_bar:
        R.append(Region("tail_led", [ly(ty0), gz(led - 0.006), lz(led + 0.006), lx(tx)], lambda c, n, b: n.x < -0.4, depth=0.006, wall="black"))
    return R


def arch_cutter(S, parent, mat="trim", col=WHITE, segs=48):
    bm = new_bm()
    for xw in S.wheels:
        for s in (1, -1):
            w = S.W(xw)
            inner, outer = w - 0.33, w + 0.3
            cylinder(bm, S.arch, outer - inner, (xw, s * (inner + outer) / 2, S.r), mat, rot=Matrix.Rotation(math.pi / 2, 4, "X"), segs=segs, col=col)
    ob = to_object(f"{S.name}_cutter", bm, parent, sharp=0)
    return ob


def boolean(ob, cutter):
    mod = ob.modifiers.new("arch", "BOOLEAN")
    mod.operation = "DIFFERENCE"
    mod.object = cutter
    mod.solver = "EXACT"
    mod.material_mode = "TRANSFER"
    dg = bpy.context.evaluated_depsgraph_get()
    me = bpy.data.meshes.new_from_object(ob.evaluated_get(dg))
    ob.modifiers.remove(mod)
    old = ob.data
    ob.data = me
    bpy.data.meshes.remove(old)
    bpy.data.objects.remove(cutter)


def split_glass(ob):
    """Move the glass faces of `ob` into their own object (left out of the AO bake, see-through in the browser)."""
    bm = bmesh.new()
    bm.from_mesh(ob.data)
    gi = [i for i, m in enumerate(ob.data.materials) if m and m.name == "glass"]
    keep = [f for f in bm.faces if f.material_index not in gi]
    bmesh.ops.delete(bm, geom=keep, context="FACES")
    me = bpy.data.meshes.new(ob.name.replace("_body", "_glass"))
    bm.to_mesh(me)
    for m in ob.data.materials:
        me.materials.append(m)
    bm.free()
    g = bpy.data.objects.new(me.name, me)
    COL.objects.link(g)
    g.parent = ob.parent
    bm = bmesh.new()
    bm.from_mesh(ob.data)
    bmesh.ops.delete(bm, geom=[f for f in bm.faces if f.material_index in gi], context="FACES")
    bm.to_mesh(ob.data)
    bm.free()
    return g


# ------------------------------------------------------------------ wheels and fittings

TYRE = [(0.21, -0.098), (0.275, -0.107), (0.312, -0.095), (0.325, -0.06), (0.325, 0.06), (0.312, 0.095), (0.275, 0.107), (0.21, 0.098)]


def wheel(S, xw, side, parent):
    """Tyre with tread grooves, alloy rim with five double spokes, hub and nuts; origin on the axle."""
    bm = new_bm()
    k, kw = S.r / 0.325, S.tyre_w / 0.215
    sc = lambda prof: [(r * k, y * kw * side) for r, y in prof]
    lathe(bm, sc(TYRE), 26, "tyre")
    lathe(bm, sc([(0.198, -0.09), (0.206, -0.09), (0.207, 0.074), (0.214, 0.086), (0.212, 0.098), (0.2, 0.1), (0.186, 0.088), (0.198, 0.07)]), 24, "rim")
    for i in range(5):
        for off in (-0.14, 0.14):
            a = math.tau * i / 5 + off
            ca, sa = math.cos(a), math.sin(a)
            tx, tz = -sa, ca

            def p(r, t, y):
                return (k * (r * ca + t * tx), y * kw * side, k * (r * sa + t * tz))

            r0, r1 = 0.06, 0.196
            c = [p(r0, -0.011, 0.07), p(r1, -0.014, 0.068), p(r1, 0.014, 0.068), p(r0, 0.011, 0.07),
                 p(r0, -0.011, 0.094), p(r1, -0.014, 0.084), p(r1, 0.014, 0.084), p(r0, 0.011, 0.094)]
            hexa(bm, c, "rim")
    rot = Matrix.Rotation(math.pi / 2, 4, "X")
    cylinder(bm, 0.07 * k, 0.04 * kw, (0, 0.078 * kw * side, 0), "rim", rot=rot, segs=12)
    cylinder(bm, 0.038 * k, 0.012 * kw, (0, 0.1 * kw * side, 0), "chrome", rot=rot, segs=12)
    ob = to_object(f"{S.name}_wheel_{S.wheels.index(xw)}{'l' if side > 0 else 'r'}", bm, parent, sharp=50)
    ob.location = (xw, side * S.track, S.r)
    ob["wheel"] = S.r
    return ob


def brakes(bm, S):
    k = S.r / 0.325
    rot = Matrix.Rotation(math.pi / 2, 4, "X")
    for xw in S.wheels:
        for s in (1, -1):
            y = s * (S.track + 0.015)
            cylinder(bm, 0.168 * k, 0.022, (xw, y, S.r), "disc", rot=rot, segs=16)
            a = math.radians(125 if xw > 0 else 55)  # caliper behind the front axle, ahead of the rear one
            c = Vector((xw + math.cos(a) * 0.15 * k, y + s * 0.025, S.r + math.sin(a) * 0.15 * k))
            box(bm, (0.12 * k, 0.045, 0.06 * k), c, "caliper", bevel=0.012, rot=Matrix.Rotation(-(a - math.pi / 2), 4, "Y"))


def surface(tree, origin, direction):
    hit = tree.ray_cast(Vector(origin), Vector(direction).normalized(), 10.0)
    return hit[0], hit[1]


def plate(bm, at, normal_x):
    """Thai-style number plate (white, two rows of black characters) facing +x or -x."""
    s = 1 if normal_x > 0 else -1
    box(bm, (0.014, 0.36, 0.15), at, "plate", bevel=0.006, col=(0.95, 0.95, 0.94, 1))
    box(bm, (0.004, 0.24, 0.05), at + Vector((s * 0.008, 0, 0.025)), "plate", col=(0.03, 0.03, 0.035, 1))
    box(bm, (0.004, 0.16, 0.028), at + Vector((s * 0.008, 0, -0.035)), "plate", col=(0.03, 0.03, 0.035, 1))


def fittings(S, tree, parent):
    bm = new_bm()
    brakes(bm, S)
    # door mirrors on the sail: black arm, body-colour cap, mirror glass facing back
    mk = getattr(S, "mirror_k", 1.0)  # trucks: big mirrors on long arms
    for s in (1, -1) if S.mirror_x is not None else ():  # driverless vehicles have none
        z = S.ZS(S.mirror_x) + 0.07
        hit, _ = surface(tree, (S.mirror_x, s * 3, z), (0, -s, 0))
        yb = abs(hit.y) if hit else S.W(S.mirror_x) - 0.08
        head = Vector((S.mirror_x - 0.06 * mk, s * (yb + 0.16 * mk), z + 0.03 * mk))
        bar(bm, (S.mirror_x - 0.02, s * (yb - 0.02), z - 0.02), head - Vector((0, s * 0.08 * mk, 0.01)), (0.07, 0.035), "trim", bevel=0.01)
        if mk > 1:  # truck: tall black housing, mirror glass facing back
            box(bm, (0.08, 0.24, 0.42), head, "trim", bevel=0.025)
            box(bm, (0.01, 0.2, 0.36), head - Vector((0.042, 0, 0)), "chrome")
        else:
            fs = sphere(bm, 1.0, head, "paint", scale=(0.062, 0.13, 0.068), u=12, v=8)
            for f in fs:
                if f.calc_center_median().x < head.x - 0.035:
                    f.material_index = SLOT["chrome"]
        box(bm, (0.012, 0.16 * mk, 0.05), head + Vector((0.02 * mk, 0, -0.045 * mk)), "drl", bevel=0.004)  # indicator strip
    # door handles
    for x in S.handles:
        z = S.ZS(x) - 0.085
        for s in (1, -1):
            hit, _ = surface(tree, (x, s * 2, z), (0, -s, 0))
            if hit:
                box(bm, (0.17, 0.03, 0.032), (x, hit.y + s * 0.008, z), "chrome", bevel=0.012)
    # number plates
    zf, zr = S.plates
    hit, _ = surface(tree, (S.xf + 1, 0, zf), (-1, 0, 0))
    if hit:
        plate(bm, hit + Vector((0.012, 0, 0)), 1)
    hit, _ = surface(tree, (S.xr - 1, 0, zr), (1, 0, 0))
    if hit:
        plate(bm, hit + Vector((-0.012, 0, 0)), -1)
    # wipers at the bottom of the windscreen
    x = S.ws[0] - 0.07
    for y0, y1 in ((-0.62, 0.04), (0.02, 0.58)):
        pa, _ = surface(tree, (x, y0, 5), (0, 0, -1))
        pb, _ = surface(tree, (x - 0.06, y1, 5), (0, 0, -1))
        if pa and pb:
            bar(bm, pa + Vector((0, 0, 0.012)), pb + Vector((0, 0, 0.012)), (0.018, 0.012), "black")
    # shark-fin aerial, exhaust tips
    fz = S.top(S.fin_x or 0) - 0.004
    S.fin_x is not None and hexa(bm, [(S.fin_x + 0.08, -0.03, fz), (S.fin_x - 0.1, -0.03, fz), (S.fin_x - 0.1, 0.03, fz), (S.fin_x + 0.08, 0.03, fz),
              (S.fin_x - 0.04, -0.012, fz + 0.06), (S.fin_x - 0.09, -0.012, fz + 0.065), (S.fin_x - 0.09, 0.012, fz + 0.065), (S.fin_x - 0.04, 0.012, fz + 0.06)], "black", bevel=0.008)
    for y in S.exhaust:
        cylinder(bm, 0.038, 0.14, (S.xr + 0.13, y, 0.3), "chrome", rot=Matrix.Rotation(math.pi / 2, 4, "Y"), segs=14)
        cylinder(bm, 0.03, 0.142, (S.xr + 0.13, y, 0.3), "gap", rot=Matrix.Rotation(math.pi / 2, 4, "Y"), segs=14)
    if getattr(S, "rails", False):
        for s in (1, -1):
            y = s * (S.W(-0.4) * S.roof - 0.07)
            za, zb_ = S.top(0.1) - 0.01, S.top(-1.5) - 0.01
            bar(bm, (0.15, y, za + 0.05), (-1.55, y, zb_ + 0.05), (0.035, 0.03), "chrome", bevel=0.008)
            for x in (0.1, -0.65, -1.5):
                box(bm, (0.08, 0.035, 0.05), (x, y, S.top(x) + 0.015), "black", bevel=0.01)
    if getattr(S, "flares", False):  # black wheel-arch mouldings
        for xw in S.wheels:
            for s in (1, -1):
                hit, _ = surface(tree, (xw, s * 2, S.r + S.arch * 0.75), (0, -s, 0))
                y = (abs(hit.y) if hit else S.W(xw)) + 0.005
                prof = [(S.arch, -0.01), (S.arch + 0.07, -0.004), (S.arch + 0.072, 0.012), (S.arch, 0.02)]
                fs = lathe(bm, [(r, yy * s) for r, yy in prof], 40, "trim", Matrix.Translation((xw, s * y, S.r)))
                kill = [f for f in fs if f.calc_center_median().z < S.r - 0.02]
                bmesh.ops.delete(bm, geom=kill, context="FACES")
    for fn in getattr(S, "extra_parts", ()):
        fn(S, bm, tree)
    return to_object(f"{S.name}_parts", bm, parent)


SEAT = (0.11, 0.115, 0.125, 1)
DASH = (0.06, 0.062, 0.068, 1)
LINING = (0.08, 0.082, 0.088, 1)
HEADLINER = (0.62, 0.6, 0.57, 1)


def cabin(S, parent):
    """Lining (door cards, headliner, floor) with holes behind the glass, seats, dash, wheel and screen."""
    bm = new_bm()
    x0, x1 = S.lining
    n = max(4, round((x1 - x0) / 0.17))
    loft(bm, S, [(x0 + (x1 - x0) * i / n, 1.0) for i in range(n + 1)], offset=0.045, poles=False)
    hit = paint_regions(bm, window_regions(S), extrude=False)
    bmesh.ops.delete(bm, geom=[f for f, r in hit.items() if r.hole], context="FACES")
    band = bm.faces.layers.int["band"]
    lay = bm.loops.layers.float_color["base"]
    for f in bm.faces:
        f.material_index = SLOT["interior"]
        c = f.calc_center_median()
        axis = Vector((c.x, 0, (S.ZB(c.x) + S.top(c.x)) / 2))
        if (axis - c).dot(f.normal) < 0:
            f.normal_flip()
        for lp in f.loops:
            lp[lay] = HEADLINER if f[band] >= TOP_SEAL else LINING
    # end walls (dash bulkhead, parcel shelf / boot wall)
    for x in (x0, x1):
        ring_pts = ring(S, x)
        zc = (ring_pts[0][1] + ring_pts[NH - 1][1]) / 2
        ring_pts = [(y * 0.95, zc + (z - zc) * 0.95) for y, z in ring_pts]
        if x == x0 and S.rear_glass == "face":  # stop under the tailgate window so it stays see-through
            ring_pts = clip_below(ring_pts, S.rwz[0])
        if x == x1 and getattr(S, "front_glass", None):  # ... and under an upright windscreen
            ring_pts = clip_below(ring_pts, S.front_glass[0])
        wall = [bm.verts.new((x, y, z)) for y, z in ring_pts]
        f = bm.faces.new(wall if x == x1 else list(reversed(wall)))
        _setup([f], "interior", LINING, bm)
        if (Vector((-1 if x == x1 else 1, 0, 0))).dot(f.normal) < 0:
            f.normal_flip()
    # dashboard, centre console, steering wheel (right-hand drive: the driver sits on -y) and screen
    if S.dash:
        zs = S.ZS(S.dash[1])
        dx0, dx1 = S.dash
        half = S.W(dx0) - S.inset - 0.05
        hexa(bm, [(dx0, -half, zs - 0.16), (dx1, -half, zs - 0.16), (dx1, half, zs - 0.16), (dx0, half, zs - 0.16),
                  (dx0, -half, zs + 0.02), (dx1, -half, zs + 0.05), (dx1, half, zs + 0.05), (dx0, half, zs + 0.02)], "interior", bevel=0.03, col=DASH)
        sx, sz = S.steer
        sy = -S.drv_y
        nrm = Vector((-math.cos(math.radians(28)), 0, math.sin(math.radians(28))))
        m = Matrix.Translation((sx, sy, sz)) @ rot_to(nrm)
        lathe(bm, [(0.17 + 0.018 * math.cos(a), 0.018 * math.sin(a)) for a in [math.tau * i / 6 for i in range(6)]], 24, "interior", m, col=DASH)
        cylinder(bm, 0.05, 0.05, (sx, sy, sz), "interior", rot=rot_to(nrm) @ Matrix.Rotation(math.pi / 2, 4, "X"), segs=16, col=DASH)
        for a in (0, 2.1, 4.2):
            d = (m.to_3x3() @ Vector((math.cos(a), 0, math.sin(a)))) * 0.16
            bar(bm, Vector((sx, sy, sz)), Vector((sx, sy, sz)) + d, (0.03, 0.012), "interior", col=DASH)
        bar(bm, Vector((sx, sy, sz)) - nrm * 0.02, Vector((dx0 + 0.05, sy, zs - 0.05)), (0.06, 0.06), "interior", col=DASH)
        box(bm, (0.012, 0.26, 0.16), (dx0 + 0.02, 0.06, zs + 0.11), "screen", bevel=0.004, rot=Matrix.Rotation(math.radians(-14), 4, "Y"))
    # seats: cushion, backrest leaning back, headrest
    for seat in S.seats:
        x, y, wd, z = seat[:4]
        f = seat[4] if len(seat) > 4 else 1  # -1: faces backwards (pods and shuttles seat people face to face)
        box(bm, (0.5, wd, 0.13), (x, y, z), "interior", bevel=0.045, seg=2, col=SEAT)
        back = Matrix.Rotation(math.radians(-14 * f), 4, "Y")
        box(bm, (0.13, wd, 0.6), (x - 0.27 * f, y, z + 0.33), "interior", bevel=0.05, seg=2, rot=back, col=SEAT)
        for hy in ([y] if wd < 0.7 else [y - wd * 0.3, y + wd * 0.3]):
            box(bm, (0.1, 0.26, 0.17), (x - 0.36 * f, hy, z + 0.72), "interior", bevel=0.04, seg=2, rot=back, col=SEAT)
    if S.console:
        cx0, cx1 = S.console
        box(bm, (cx0 - cx1, 0.2, 0.22), ((cx0 + cx1) / 2, 0, S.seats[0][3] - 0.02), "interior", bevel=0.03, col=DASH)
    return to_object(f"{S.name}_cabin", bm, parent)


SHIRT = (0.11, 0.2, 0.42, 1)
PANTS = (0.07, 0.08, 0.1, 1)
SKIN = (0.72, 0.5, 0.36, 1)
HAIR = (0.04, 0.03, 0.025, 1)


def driver(S, parent):
    """Seated driver, hands on the wheel (moving cars only)."""
    bm = new_bm()
    x, y, wd, z = S.seats[0]
    sx, sz = S.steer
    lean = Matrix.Rotation(math.radians(-12), 4, "Y")
    box(bm, (0.24, 0.38, 0.52), (x - 0.12, y, z + 0.33), "people", bevel=0.07, rot=lean, col=SHIRT)
    sphere(bm, 0.105, (x - 0.16, y, z + 0.78), "people", scale=(0.95, 0.88, 1.08), u=12, v=8, col=SKIN)
    sphere(bm, 0.11, (x - 0.18, y, z + 0.82), "people", scale=(1.0, 0.92, 0.82), u=12, v=8, col=HAIR)
    for s in (-1, 1):
        sh = Vector((x - 0.08, y + s * 0.2, z + 0.52))
        hand = Vector((sx - 0.06, y + s * 0.15, sz + 0.03))
        bar(bm, sh, hand, (0.09, 0.09), "people", col=SHIRT, bevel=0.025)
        sphere(bm, 0.04, hand, "people", u=8, v=6, col=SKIN)
        hip = Vector((x - 0.05, y + s * 0.1, z + 0.12))
        knee = Vector((x + 0.32, y + s * 0.11, z + 0.18))
        bar(bm, hip, knee, (0.14, 0.14), "people", col=PANTS, bevel=0.05)
        bar(bm, knee, Vector((x + 0.45, y + s * 0.11, z - 0.25)), (0.11, 0.11), "people", col=PANTS, bevel=0.04)
    ob = to_object(f"{S.name}_driver", bm, parent)
    return ob


# ------------------------------------------------------------------ variants

def build(S, origin):
    """One vehicle: body (with glass split off), cabin, fittings, wheels and driver under an empty."""
    root = bpy.data.objects.new(S.name, None)
    COL.objects.link(root)
    root.location = origin
    bm = new_bm()
    loft(bm, S, sections(S))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    paint_regions(bm, body_regions(S))
    tree = BVHTree.FromBMesh(bm)
    body = to_object(f"{S.name}_body", bm, root)
    boolean(body, arch_cutter(S, root))
    body.data.set_sharp_from_angle(angle=math.radians(38))
    glass = split_glass(body)
    parts = [body, glass, cabin(S, root), fittings(S, tree, root)] + ([] if getattr(S, "driverless", False) else [driver(S, root)])
    for xw in S.wheels:
        for s in (1, -1):
            parts.append(wheel(S, xw, s, root))
    for fn in getattr(S, "extra_objects", ()):
        parts += fn(S, root, tree)
    parts.append(build_lod(S, root))
    return root, parts


# far-away stand-in: flat colours (alpha 1 marks the car paint, tinted per car in the browser)
LOD_COL = {"paint": (1, 1, 1, 1), "glass": (0.05, 0.07, 0.09, 0), "trim": (0.035, 0.037, 0.04, 0), "black": (0.02, 0.02, 0.024, 0), "gap": (0.02, 0.02, 0.02, 0),
           "chrome": (0.62, 0.64, 0.67, 0), "lens": (0.72, 0.74, 0.77, 0), "drl": (0.92, 0.92, 0.92, 0), "tail": (0.36, 0.03, 0.03, 0), "tail_led": (0.62, 0.05, 0.04, 0),
           "livery_orange": (0.92, 0.36, 0.05, 0), "livery_red": (0.72, 0.04, 0.04, 0), "livery_blue": (0.05, 0.25, 0.75, 0)}


def build_lod(S, root):
    """About 2k triangles: a coarse loft painted by the same regions (no cuts), arches, plain wheels."""
    import copy

    C = copy.copy(S)
    C.step, C.ends = 0.34, (0.4, 0.75, 0.94)
    bm = new_bm()
    loft(bm, C, sections(C))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    paint_regions(bm, body_regions(C), extrude=False, cut=False)
    lay = bm.loops.layers.float_color["base"]
    for f in bm.faces:
        col = LOD_COL.get(list(MATS)[f.material_index], (1, 1, 1, 1))
        f.material_index = SLOT["lod"]
        for lp in f.loops:
            lp[lay] = col
    ob = to_object(f"{S.name}_lod", bm, root)
    boolean(ob, arch_cutter(S, root, "lod", LOD_COL["trim"], segs=16))
    ob.data.set_sharp_from_angle(angle=math.radians(38))
    bm = new_bm()
    rot = Matrix.Rotation(math.pi / 2, 4, "X")
    for xw in S.wheels:
        for s in (1, -1):
            cylinder(bm, S.r, S.tyre_w, (xw, s * S.track, S.r), "lod", rot=rot, segs=14, col=(0.03, 0.03, 0.032, 0))
            cylinder(bm, S.r * 0.62, 0.01, (xw, s * (S.track + S.tyre_w / 2), S.r), "lod", rot=rot, segs=10, col=(0.55, 0.57, 0.6, 0))
    me = bpy.data.meshes.new("w")
    bm.to_mesh(me)
    bm.free()
    bm = bmesh.new()
    bm.from_mesh(ob.data)
    bm.from_mesh(me)
    bm.to_mesh(ob.data)
    bm.free()
    bpy.data.meshes.remove(me)
    return ob


SEDAN = Spec(
    name="sedan", xf=2.21, xr=-2.19, ef=0.26, er=0.22,
    w=[(2.21, 0.8), (2.0, 0.865), (1.6, 0.898), (0.8, 0.905), (-0.8, 0.905), (-1.6, 0.898), (-2.0, 0.875), (-2.19, 0.82)],
    zb=[(2.21, 0.36), (2.0, 0.27), (1.7, 0.225), (-1.7, 0.225), (-2.0, 0.28), (-2.19, 0.42)],
    zs=[(2.21, 0.62), (1.95, 0.73), (1.5, 0.8), (0.9, 0.855), (0.0, 0.89), (-1.0, 0.93), (-1.7, 0.975), (-2.0, 0.99), (-2.19, 0.96)],
    h=[(1.0, 0.0), (0.88, 0.045), (0.5, 0.29), (0.1, 0.48), (-0.35, 0.525), (-0.85, 0.49), (-1.2, 0.39), (-1.6, 0.13), (-1.78, 0.0)],
    wheels=(1.36, -1.36), r=0.325, track=0.775, tyre_w=0.215, arch=0.372,
    ws=(0.95, 0.15), rw=(-0.97, -1.7), sail=0.8, cline=((-1.24, 0.94), (-0.93, 1.42)), pillars=[(-0.2, -0.07)], belt="chrome",
    seams=[((0.93, 0.33), (0.91, 0.86)), ((-0.12, 0.3), (-0.14, 0.9)), ((-1.02, 0.45), (-1.24, 0.94))],
    lid_seams=[(0.6, 1.0, 2.04), (0.6, -2.02, -1.72)],
    lamp_f=(0.4, 0.86, 0.575, 0.63, 0.69, 1.8), grille=(0.36, 0.4, 0.555), slats=3, intake=(0.62, 0.275, 0.345),
    lamp_r=(0.4, 0.88, 0.8, 0.9, -1.92), light_bar=True, lip_f=0.27, lip_r=0.4,
    mirror_x=0.83, handles=(0.02, -0.98), plates=(0.35, 0.6), fin_x=-0.95, exhaust=(-0.5, 0.5),
    lining=(-1.72, 0.92), dash=(0.52, 0.9), steer=(0.38, 0.92), drv_y=0.37, console=(0.45, -0.6),
    seats=[(-0.3, -0.37, 0.5, 0.43), (-0.3, 0.37, 0.5, 0.43), (-1.1, 0.0, 1.32, 0.45)],
)


HATCH = Spec(
    name="hatch", xf=2.03, xr=-2.02, ef=0.24, er=0.16, pr=3.4, roof_mat="black", roof_x0=-2.1, cpillar="black", rear_glass="face",
    w=[(2.03, 0.78), (1.85, 0.845), (1.5, 0.875), (-1.5, 0.88), (-1.85, 0.865), (-2.02, 0.82)],
    zb=[(2.03, 0.36), (1.85, 0.27), (1.55, 0.23), (-1.55, 0.23), (-1.85, 0.27), (-2.02, 0.38)],
    zs=[(2.03, 0.62), (1.8, 0.73), (1.4, 0.8), (0.8, 0.86), (-0.5, 0.92), (-1.6, 0.97), (-2.02, 0.99)],
    h=[(0.88, 0.0), (0.75, 0.05), (0.38, 0.31), (0.02, 0.49), (-0.6, 0.53), (-1.45, 0.52), (-1.72, 0.47), (-1.9, 0.34), (-2.02, 0.2)],
    wheels=(1.3, -1.27), r=0.315, track=0.76, tyre_w=0.205, arch=0.36,
    ws=(0.86, 0.08), rw=(-1.68, -2.02), rwz=(1.13, 1.43, 0.6), sail=0.73, cline=((-1.4, 0.965), (-1.16, 1.48)), pillars=[(-0.26, -0.13)],
    seams=[((0.86, 0.33), (0.84, 0.85)), ((-0.18, 0.3), (-0.2, 0.92)), ((-1.0, 0.45), (-1.4, 0.965))],
    lid_seams=[(0.58, 0.92, 1.86)],
    lamp_f=(0.42, 0.84, 0.58, 0.64, 0.7, 1.66), grille=(0.34, 0.39, 0.55), slats=2, intake=(0.6, 0.27, 0.34),
    lamp_r=(0.5, 0.87, 0.9, 1.05, -1.84), light_bar=False, lip_f=0.27, lip_r=0.38,
    mirror_x=0.76, handles=(-0.08, -1.05), plates=(0.34, 0.66), fin_x=-1.5, exhaust=(-0.5,),
    lining=(-1.85, 0.84), dash=(0.44, 0.82), steer=(0.3, 0.92), drv_y=0.36, console=(0.38, -0.65),
    seats=[(-0.36, -0.36, 0.48, 0.44), (-0.36, 0.36, 0.48, 0.44), (-1.22, 0.0, 1.28, 0.46)],
)

SUV = Spec(
    name="suv", xf=2.25, xr=-2.25, ef=0.26, er=0.2, pf=2.6, pr=3.4, rear_glass="face", clad=0.5, flares=True, rails=True,
    w=[(2.25, 0.82), (2.05, 0.89), (1.7, 0.918), (-1.7, 0.922), (-2.05, 0.905), (-2.25, 0.85)],
    zb=[(2.25, 0.46), (2.05, 0.35), (1.75, 0.32), (-1.75, 0.32), (-2.05, 0.36), (-2.25, 0.48)],
    zs=[(2.25, 0.8), (2.0, 0.9), (1.6, 0.96), (0.9, 1.0), (-0.5, 1.04), (-1.7, 1.08), (-2.25, 1.1)],
    h=[(1.02, 0.0), (0.9, 0.05), (0.5, 0.36), (0.12, 0.56), (-0.5, 0.6), (-1.6, 0.58), (-1.92, 0.5), (-2.1, 0.32), (-2.25, 0.16)],
    wheels=(1.38, -1.38), r=0.36, track=0.8, tyre_w=0.235, arch=0.41,
    ws=(0.98, 0.17), rw=(-1.88, -2.25), rwz=(1.23, 1.58, 0.64), sail=0.86, cline=((-1.72, 1.09), (-1.5, 1.66)), pillars=[(-0.26, -0.12), (-1.16, -1.06)],
    seams=[((0.98, 0.52), (0.96, 1.0)), ((-0.18, 0.5), (-0.2, 1.03)), ((-1.0, 0.52), (-1.06, 1.06))],
    lid_seams=[(0.62, 1.04, 2.08)],
    lamp_f=(0.44, 0.88, 0.75, 0.8, 0.86, 1.86), grille=(0.42, 0.5, 0.74), slats=4, intake=(0.66, 0.36, 0.46),
    lamp_r=(0.45, 0.9, 1.0, 1.12, -2.08), light_bar=True, lip_f=0.36, lip_r=0.46,
    mirror_x=0.88, handles=(-0.02, -1.0), plates=(0.47, 0.75), fin_x=-1.7, exhaust=(-0.55,),
    lining=(-2.02, 0.95), dash=(0.56, 0.95), steer=(0.42, 1.06), drv_y=0.38, console=(0.48, -0.62),
    seats=[(-0.3, -0.38, 0.52, 0.58), (-0.3, 0.38, 0.52, 0.58), (-1.2, 0.0, 1.36, 0.6)],
)


def van_spec(name, **kw):
    s = Spec(
        name=name, xf=2.62, xr=-2.62, ef=0.22, er=0.12, pf=2.2, pr=4.0, roof=0.86, inset=0.07, crown=0.03, rear_glass="face",
        w=[(2.62, 0.86), (2.45, 0.93), (2.1, 0.955), (-2.4, 0.955), (-2.62, 0.93)],
        zb=[(2.62, 0.42), (2.4, 0.33), (2.1, 0.31), (-2.3, 0.31), (-2.62, 0.4)],
        zs=[(2.62, 0.8), (2.4, 0.92), (2.1, 1.0), (1.6, 1.05), (0.5, 1.07), (-2.62, 1.1)],
        h=[(2.12, 0.0), (2.0, 0.1), (1.62, 0.78), (1.35, 1.0), (1.0, 1.06), (-2.62, 1.06)],
        wheels=(1.78, -1.55), r=0.34, track=0.82, tyre_w=0.215, arch=0.385,
        ws=(2.09, 1.37), rw=(-2.5, -2.62), rwz=(1.3, 1.98, 0.74), sail=1.96, cline=((-2.44, 1.1), (-2.44, 2.2)),
        pillars=[(0.88, 0.98), (-0.56, -0.48), (-1.7, -1.62)],
        seams=[((1.38, 0.4), (1.36, 1.05)), ((0.93, 0.38), (0.93, 1.06)), ((-0.52, 0.38), (-0.52, 1.08), 1)],
        lid_seams=[],
        lamp_f=(0.46, 0.93, 0.7, 0.8, 0.87, 2.38), grille=(0.42, 0.52, 0.76), slats=4, intake=(0.7, 0.36, 0.46),
        lamp_r=(0.78, 0.96, 0.72, 1.3, -2.52), light_bar=False, lip_f=0.48, lip_r=0.5,
        mirror_x=1.98, handles=(1.0, -0.4), plates=(0.42, 0.62), fin_x=-2.3, exhaust=(-0.55,),
        lining=(-2.5, 2.05), dash=(1.72, 2.06), steer=(1.6, 1.22), drv_y=0.42, console=None,
        seats=[(1.15, -0.42, 0.5, 0.86), (1.15, 0.42, 0.5, 0.86)] + [(x, 0.0, 1.6, 0.82) for x in (0.35, -0.6, -1.55)],
        extra_regions=[lambda S: [Region("gap", [ly(0.006)], lambda c, n, b: n.x < -0.5 and c.x < S.xr + 0.3 and c.z > 0.5, depth=0.004, wall="gap")]],
    )
    s.__dict__.update(kw)
    return s


VAN = van_spec("van")


def ambulance_livery(S):
    side = lambda c, n, b: abs(n.z) < 0.6
    R = [Region("livery_orange", [gz(0.86), lz(1.0)], side), Region("livery_red", [gz(1.025), lz(1.06)], side)]
    for xc in (-1.25,):
        R.append(Region("livery_blue", [gx(xc - 0.09), lx(xc + 0.09), gz(1.3), lz(1.84)], lambda c, n, b: is_side(n)))
        R.append(Region("livery_blue", [gx(xc - 0.27), lx(xc + 0.27), gz(1.48), lz(1.66)], lambda c, n, b: is_side(n)))
    return R


def ambulance_parts(S, bm, tree):
    z = S.top(1.1)
    box(bm, (0.34, 1.3, 0.06), (1.1, 0, z + 0.02), "black", bevel=0.015)
    for s, mat in ((1, "beacon_red"), (-1, "beacon_blue")):
        box(bm, (0.28, 0.6, 0.12), (1.1, s * 0.33, z + 0.11), mat, bevel=0.03)


def ambulance_text(S, root, tree):
    out = []
    for s in (1, -1):
        cu = bpy.data.curves.new("amb_txt", "FONT")
        cu.body = "AMBULANCE"
        cu.size = 0.2
        cu.extrude = 0.003
        cu.align_x = "CENTER"
        cu.align_y = "CENTER"
        tmp = bpy.data.objects.new("amb_txt_tmp", cu)
        COL.objects.link(tmp)
        dg = bpy.context.evaluated_depsgraph_get()
        me = bpy.data.meshes.new_from_object(tmp.evaluated_get(dg))
        bpy.data.objects.remove(tmp)
        bpy.data.curves.remove(cu)
        hit, nrm = surface(tree, (0.05, s * 2, 1.35), (0, -s, 0))
        if not hit:
            continue
        # text lies in its local xy: turn it upright on the side, reading front-to-back on each side
        m = Matrix.Translation(hit + nrm * 0.004) @ Matrix.Rotation(math.pi / 2, 4, "X") @ Matrix.Rotation(0 if s < 0 else math.pi, 4, "Y")
        me.transform(m)
        me.materials.clear()
        for n in MATS:
            me.materials.append(material(n))
        for p in me.polygons:
            p.material_index = SLOT["livery_red"]
        ob = bpy.data.objects.new(f"{S.name}_text{'l' if s > 0 else 'r'}", me)
        COL.objects.link(ob)
        ob.parent = root
        ob.matrix_parent_inverse = Matrix.Identity(4)
        out.append(ob)
    return out


AMBULANCE = van_spec(
    "ambulance", pillars=[(0.86, 0.98)], cline=((0.9, 1.1), (0.9, 2.2)),  # no windows behind the cab
    extra_regions=[VAN.extra_regions[0], ambulance_livery], extra_parts=[ambulance_parts], extra_objects=[ambulance_text],
    seats=[(1.15, -0.42, 0.5, 0.86), (1.15, 0.42, 0.5, 0.86)],
)

def truck_parts(S, bm, tree):
    """Roof deflector up to the cargo box, sun visor, chassis rails, fuel tank, battery box, side and rear guards,
    mud flaps and the rear number plate on the old box."""
    zt = S.top(3.0) - 0.01
    hexa(bm, [(3.75, -1.0, zt), (1.92, -1.12, zt), (1.92, 1.12, zt), (3.75, 1.0, zt),
              (2.45, -1.02, 3.5), (1.92, -1.13, 3.56), (1.92, 1.13, 3.56), (2.45, 1.02, 3.5)], "paint", bevel=0.05)
    box(bm, (0.32, 2.08, 0.035), (S.xf + 0.08, 0, S.front_glass[1] + 0.1), "trim", bevel=0.01, rot=Matrix.Rotation(math.radians(-12), 4, "Y"))
    for s in (1, -1):
        box(bm, (8.3, 0.12, 0.26), (-0.25, s * 0.45, 0.56), "trim", bevel=0.01)
        bar(bm, (-1.45, s * 1.2, 0.52), (2.55, s * 1.2, 0.52), (0.07, 0.05), "disc", bevel=0.01)
        bar(bm, (-1.45, s * 1.2, 0.74), (2.55, s * 1.2, 0.74), (0.07, 0.05), "disc", bevel=0.01)
        for x in (-1.3, 0.5, 2.4):
            box(bm, (0.05, 0.62, 0.05), (x, s * 0.9, 0.74), "trim")
        box(bm, (0.02, 0.4, 0.5), (-3.82, s * 1.04, 0.42), "trim")
    cylinder(bm, 0.25, 1.1, (0.75, -0.98, 0.78), "rim", rot=Matrix.Rotation(math.pi / 2, 4, "Y"), segs=18)
    box(bm, (0.7, 0.36, 0.42), (0.75, 0.98, 0.78), "trim", bevel=0.02)
    box(bm, (0.14, 2.24, 0.14), (-4.42, 0, 0.5), "trim", bevel=0.01)
    plate(bm, Vector((-4.47, 0, 0.66)), -1)


TRUCK = Spec(
    name="truck", xf=4.27, xr=1.86, ef=0.2, er=0.04, pf=6.0, pr=8.0, roof=0.9, inset=0.05, crown=0.03,
    rear_glass="none", front_glass=(1.62, 2.55, 0.98),
    w=[(4.27, 1.1), (4.1, 1.16), (1.86, 1.17)],
    zb=[(4.27, 0.66), (4.0, 0.62), (1.86, 0.62)],
    zs=[(4.27, 1.5), (1.86, 1.52)],
    h=[(1.86, 1.2), (4.27, 1.2)],
    wheels=(3.3, -2.1, -3.2), r=0.5, track=1.04, tyre_w=0.32, arch=0.56,
    ws=(4.7, 4.6), rw=(1.0, 0.9), sail=4.06, cline=((3.05, 1.5), (3.05, 2.9)), pillars=[],
    seams=[((4.0, 0.72), (4.0, 1.48)), ((3.0, 1.0), (3.0, 1.48))],
    lid_seams=[],
    lamp_f=(0.6, 1.1, 0.74, 0.9, 0.94, 3.95), grille=(0.55, 0.98, 1.42), slats=5, intake=(0.98, 0.7, 0.8),
    lamp_r=(5.0, 6.0, 0.0, 0.1, -9.0), light_bar=False, lip_f=0.7, lip_r=0.0,
    mirror_x=4.02, mirror_k=2.2, handles=(3.12,), plates=(0.86, -99.0), fin_x=None, exhaust=(),
    lining=(1.9, 4.12), dash=(3.8, 4.12), steer=(3.68, 1.95), drv_y=0.55, console=None,
    seats=[(3.15, -0.55, 0.55, 1.05), (3.15, 0.55, 0.55, 1.05)],
    extra_parts=[truck_parts],
)

def roof_lidar(bm, x, z, r=0.17):
    """Spinning-lidar puck: black base, dark glass dome, cyan status ring."""
    cylinder(bm, r * 1.15, 0.06, (x, 0, z + 0.03), "trim", segs=24)
    cylinder(bm, r, 0.12, (x, 0, z + 0.12), "black", segs=24)
    cylinder(bm, r * 1.02, 0.018, (x, 0, z + 0.1), "led_cyan", segs=24)
    sphere(bm, r * 0.95, (x, 0, z + 0.18), "black", scale=(1, 1, 0.55), u=20, v=8)


def corner_pods(bm, S, xs, inset=0.05):
    """Sensor pods (camera / radar) at the top corners, each with a cyan lens."""
    for x in xs:
        sx = 1 if x > 0 else -1
        for sy in (1, -1):
            z = S.top(x) - S.crown - 0.06
            y = sy * (S.W(x) * S.roof - inset)
            box(bm, (0.2, 0.13, 0.12), (x, y, z), "black", bevel=0.045)
            box(bm, (0.012, 0.07, 0.05), (x + sx * 0.1, y, z + 0.035), "led_cyan")


def pod_parts(S, bm, tree):
    roof_lidar(bm, 0.0, S.top(0) - 0.02)
    corner_pods(bm, S, (S.xf - 0.5, S.xr + 0.5))
    for s in (1, -1):  # flush side cameras and a status strip over the doors
        box(bm, (0.012, 0.6, 0.03), (0.0, s * (S.W(0) - 0.035), S.ZS(0) - 0.05), "led_cyan", rot=Matrix.Rotation(math.pi / 2, 4, "Z"))


POD = Spec(
    name="pod", xf=1.97, xr=-1.97, ef=0.34, er=0.34, pf=2.4, pr=2.4, roof=0.8, inset=0.06, crown=0.05, driverless=True,
    rear_glass="face", rwz=(0.98, 1.68, 0.7), front_glass=(0.98, 1.68, 0.7),  # down past the nose pole, whose fan shades unevenly
    w=[(1.97, 0.82), (1.7, 0.88), (1.3, 0.9), (-1.3, 0.9), (-1.7, 0.88), (-1.97, 0.82)],
    zb=[(1.97, 0.4), (1.6, 0.3), (1.3, 0.27), (-1.3, 0.27), (-1.6, 0.3), (-1.97, 0.4)],
    zs=[(1.97, 0.86), (1.5, 0.92), (0.0, 0.94), (-1.5, 0.92), (-1.97, 0.86)],
    h=[(1.97, 0.72), (1.5, 0.84), (0.0, 0.86), (-1.5, 0.84), (-1.97, 0.72)],
    wheels=(1.3, -1.3), r=0.34, track=0.78, tyre_w=0.22, arch=0.39,
    ws=(5.0, 4.9), rw=(-4.9, -5.0), sail=1.42, cline=((-1.42, 0.9), (-1.42, 2.0)), pillars=[(-0.05, 0.05)],
    seams=[((1.22, 0.36), (1.22, 0.92)), ((0.0, 0.32), (0.0, 0.94)), ((-1.22, 0.36), (-1.22, 0.92))],
    lid_seams=[],
    lamp_f=(0.05, 0.86, 0.72, 0.8, 0.8, 1.55), grille=(0.0, 0.0, 0.0), slats=0, intake=(0.62, 0.42, 0.52),
    lamp_r=(0.05, 0.86, 0.72, 0.8, -1.55), light_bar=True, lip_f=0.38, lip_r=0.38,
    mirror_x=None, handles=(), plates=(0.6, 0.6), fin_x=None, exhaust=(),
    lining=(-1.72, 1.72), dash=None, drv_y=0.0, console=None,
    seats=[(0.72, 0.0, 1.4, 0.5, -1), (-0.72, 0.0, 1.4, 0.5, 1)],
    extra_parts=[pod_parts],
)


def shuttle_parts(S, bm, tree):
    zt = S.top(0) - S.crown
    box(bm, (1.9, 1.5, 0.16), (-0.3, 0, zt + 0.02), "paint", bevel=0.06)  # battery / air-con housing
    for x in (S.xf - 0.55, S.xr + 0.55):
        roof_lidar(bm, x, S.top(x) - 0.03)
    corner_pods(bm, S, (S.xf - 0.45, S.xr + 0.45))
    for x in (-1.0, 1.0):  # grab poles from the floor to the roof
        for y in (-0.5, 0.5):
            cylinder(bm, 0.022, 2.25, (x, y, S.ZB(x) + 1.2), "chrome", segs=10)
    for s in (1, -1):
        box(bm, (5.2, 0.012, 0.04), (0, s * (S.W(0) - 0.004), S.ZS(0) - 0.07), "led_cyan")


def shuttle_regions(S):
    lower = lambda c, n, b: n.z > -0.55 and b <= BELT_TOP
    R = [Region("livery_blue", [lz(0.66)], lower)]  # the blue skirt of the old shuttle
    door = lambda c, n, b: is_side(n) and c.y > 0 and b <= BELT_TOP  # glass-look door leaves, kerb side
    R.append(Region("black", [gx(-0.78), lx(0.78), gz(0.4)], door, sym=False))
    return R


SHUTTLE = Spec(
    name="shuttle", xf=3.3, xr=-3.3, ef=0.4, er=0.4, pf=2.6, pr=2.6, roof=0.86, inset=0.06, crown=0.05, driverless=True,
    rear_glass="face", rwz=(1.28, 2.56, 0.92), front_glass=(1.28, 2.56, 0.92),
    w=[(3.3, 1.0), (3.0, 1.1), (2.6, 1.13), (-2.6, 1.13), (-3.0, 1.1), (-3.3, 1.0)],
    zb=[(3.3, 0.46), (2.9, 0.34), (2.4, 0.32), (-2.4, 0.32), (-2.9, 0.34), (-3.3, 0.46)],
    zs=[(3.3, 1.1), (2.8, 1.18), (0.0, 1.2), (-2.8, 1.18), (-3.3, 1.1)],
    h=[(3.3, 1.45), (2.8, 1.58), (0.0, 1.6), (-2.8, 1.58), (-3.3, 1.45)],
    wheels=(2.1, -2.1), r=0.42, track=0.95, tyre_w=0.26, arch=0.48,
    ws=(6.0, 5.9), rw=(-5.9, -6.0), sail=2.72, cline=((-2.72, 1.15), (-2.72, 3.0)), pillars=[(1.38, 1.48), (-1.48, -1.38)],
    seams=[((0.78, 0.38), (0.78, 1.18), 1), ((0.0, 0.38), (0.0, 1.18), 1), ((-0.78, 0.38), (-0.78, 1.18), 1)],
    lid_seams=[],
    lamp_f=(0.1, 1.04, 0.86, 0.95, 0.95, 2.9), grille=(0.0, 0.0, 0.0), slats=0, intake=(0.8, 0.5, 0.62),
    lamp_r=(0.1, 1.04, 0.86, 0.95, -2.9), light_bar=True, lip_f=0.44, lip_r=0.44,
    mirror_x=None, handles=(), plates=(0.72, 0.72), fin_x=None, exhaust=(),
    lining=(-2.9, 2.9), dash=None, drv_y=0.0, console=None,
    seats=[(2.25, 0.0, 1.9, 0.64, -1), (-2.25, 0.0, 1.9, 0.64, 1)],
    extra_regions=[shuttle_regions], extra_parts=[shuttle_parts],
)

CART_FABRIC = (0.16, 0.2, 0.26, 1)


def build_cart(S, origin):
    """Open driverless campus cart: rounded tub and nose, two benches, a canopy on four posts with a sensor bar,
    a clear windscreen, light strips and alloy wheels."""
    root = bpy.data.objects.new(S.name, None)
    COL.objects.link(root)
    root.location = origin
    bm = new_bm()
    box(bm, (2.5, 1.22, 0.32), (-0.05, 0, 0.38), "paint", bevel=0.1, seg=3)  # tub
    hexa(bm, [(0.8, -0.6, 0.5), (1.36, -0.58, 0.5), (1.36, 0.58, 0.5), (0.8, 0.6, 0.5),
              (0.8, -0.58, 1.0), (1.3, -0.55, 0.78), (1.3, 0.55, 0.78), (0.8, 0.58, 1.0)], "paint", bevel=0.07)  # nose
    box(bm, (0.012, 0.9, 0.035), (1.36, 0, 0.66), "drl")
    box(bm, (0.012, 0.9, 0.035), (-1.31, 0, 0.5), "tail_led")
    box(bm, (2.0, 1.1, 0.02), (-0.25, 0, 0.545), "trim")  # floor mat
    for x in (0.25, -0.75):
        box(bm, (0.5, 1.1, 0.13), (x, 0, 0.66), "interior", bevel=0.045, col=CART_FABRIC)
        box(bm, (0.1, 1.1, 0.5), (x - 0.28, 0, 0.98), "interior", bevel=0.04, rot=Matrix.Rotation(math.radians(-12), 4, "Y"), col=CART_FABRIC)
    for x in (-1.15, 0.85):
        for y in (-0.57, 0.57):
            cylinder(bm, 0.03, 1.42, (x, y, 1.25), "trim", segs=12)
    box(bm, (2.36, 1.38, 0.07), (-0.15, 0, 1.98), "paint", bevel=0.03)  # canopy
    box(bm, (2.38, 1.4, 0.02), (-0.15, 0, 1.94), "trim")
    box(bm, (0.2, 0.92, 0.08), (0.85, 0, 2.06), "black", bevel=0.025)  # sensor bar
    box(bm, (0.012, 0.8, 0.025), (0.95, 0, 2.06), "led_cyan")
    roof_lidar(bm, -0.15, 2.015, r=0.12)
    plate(bm, Vector((-1.32, 0, 0.42)), -1)
    for xw in S.wheels:
        for s in (1, -1):
            box(bm, (0.72, 0.1, 0.06), (xw, s * 0.62, 0.62), "trim", bevel=0.02)  # mudguard
    brakes(bm, S)
    body = to_object(f"{S.name}_body", bm, root)
    gm = new_bm()
    box(gm, (0.012, 1.14, 0.92), (0.86, 0, 1.0), "glass", rot=Matrix.Rotation(math.radians(-6), 4, "Y"))
    glass = to_object(f"{S.name}_glass", gm, root)
    parts = [body, glass]
    for xw in S.wheels:
        for s in (1, -1):
            parts.append(wheel(S, xw, s, root))
    return root, parts


CART = Spec(name="cart", builder=build_cart, w=[(0, 0.61), (1, 0.61)], zb=[(0, 0.2), (1, 0.2)], zs=[(0, 0.6), (1, 0.6)], h=[(0, 0.0), (1, 0.0)],
            wheels=(0.85, -0.85), r=0.27, track=0.6, tyre_w=0.18)

VARIANTS = [SEDAN, HATCH, SUV, VAN, AMBULANCE, TRUCK, POD, SHUTTLE, CART]


# ------------------------------------------------------------------ AO bake into vertex colours

def bake_ao(objs):
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    sc.cycles.device = "CPU"
    sc.cycles.samples = 48
    sc.render.bake.target = "VERTEX_COLORS"
    if not sc.world:
        sc.world = bpy.data.worlds.new("World")
    sc.world.light_settings.distance = 0.6
    for ob in objs:
        me = ob.data
        if not me.color_attributes.get("base"):
            me.color_attributes.new("base", "FLOAT_COLOR", "CORNER").data.foreach_set("color", [1.0] * 4 * len(me.loops))
        ao = me.color_attributes.new("ao", "FLOAT_COLOR", "CORNER")
        me.color_attributes.active_color = ao
    bpy.ops.object.select_all(action="DESELECT")
    for ob in objs:
        ob.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.bake(type="AO")
    for ob in objs:
        me = ob.data
        n = len(me.loops)
        base, ao = [0.0] * 4 * n, [0.0] * 4 * n
        me.color_attributes["base"].data.foreach_get("color", base)
        me.color_attributes["ao"].data.foreach_get("color", ao)
        col = []
        for i in range(n):
            a = 0.25 + 0.75 * ao[4 * i]  # keep some light in the deepest corners: the browser adds sky light too
            col += [base[4 * i] * a, base[4 * i + 1] * a, base[4 * i + 2] * a, base[4 * i + 3]]
        for nm in ("base", "ao"):
            me.color_attributes.remove(me.color_attributes[nm])
        c = me.color_attributes.new("Col", "BYTE_COLOR", "CORNER")
        c.data.foreach_set("color", col)
        me.color_attributes.active_color = c
        me.color_attributes.render_color_index = me.color_attributes.find("Col")


def build_all():
    global COL
    bpy.ops.wm.read_factory_settings(use_empty=True)
    COL = bpy.data.collections.new("Vehicles")
    bpy.context.scene.collection.children.link(COL)
    roots, solid, glass = [], [], []
    for i, S in enumerate(VARIANTS):
        root, parts = getattr(S, "builder", build)(S, (0, i * 8.0, 0))  # apart, so they don't shade each other in the AO bake
        roots.append(root)
        for p in parts:
            (glass if p.name.endswith("_glass") else solid).append(p)
    lods = [p for p in solid if p.name.endswith("_lod")]
    for o in lods:  # the stand-in overlaps the car: bake it out of the way
        o.location.z += 30
    bpy.context.view_layer.update()
    for g in glass:
        g.hide_render = True
    bake_ao(solid)
    for o in lods:
        o.location.z -= 30
    for g in glass:
        g.hide_render = False
        while g.data.color_attributes:
            g.data.color_attributes.remove(g.data.color_attributes[0])
    return roots


def export(roots):
    sys.path.insert(0, HERE)
    import tkc_lib as L

    bpy.ops.object.select_all(action="DESELECT")
    for r in roots:
        r.select_set(True)
        for c in r.children_recursive:
            c.select_set(True)
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    bpy.ops.export_scene.gltf(filepath=OUT, **L.GLTF_EXPORT)
    print("exported", OUT, os.path.getsize(OUT) // 1024, "KB")


if __name__ == "__main__":
    args = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    roots = build_all()
    for S in VARIANTS:
        per = {c.name.split("_", 1)[1]: sum(len(p.vertices) - 2 for p in c.data.polygons) for c in bpy.data.objects[S.name].children}
        print(S.name, "triangles", sum(per.values()), per)
    if args and args[0] == "preview":
        sys.path.insert(0, HERE)
        import car_preview

        car_preview.render(roots, args[1])
    else:
        export(roots)
