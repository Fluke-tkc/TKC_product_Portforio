"""Outline-based architecture helpers: filleted footprints, frames, curved glass, mullions,
slatted soffits, downlights and planters. All outlines are CCW lists of (x, y) in metres.
Meshes are built with bmesh and registered through tkc_lib._finish so they carry grp/kind.
"""
import math
import random

import bmesh
from mathutils import Matrix, Vector, noise

import tkc_lib as L

# ------------------------------------------------------------------ 2D polygon utilities


def rect_poly(cx, cy, w, d, rot=0.0):
    c, s = math.cos(rot), math.sin(rot)
    pts = [(-w / 2, -d / 2), (w / 2, -d / 2), (w / 2, d / 2), (-w / 2, d / 2)]
    return [(cx + c * x - s * y, cy + s * x + c * y) for x, y in pts]


def _norm(v):
    l = math.hypot(*v) or 1.0
    return (v[0] / l, v[1] / l)


def offset_poly(pts, d):
    """Move every edge of a CCW polygon inward by d (negative = outward)."""
    n = len(pts)
    lines = []
    for i in range(n):
        a, b = pts[i], pts[(i + 1) % n]
        ex, ey = _norm((b[0] - a[0], b[1] - a[1]))
        nx, ny = -ey, ex  # left normal = interior for CCW
        lines.append(((a[0] + nx * d, a[1] + ny * d), (ex, ey)))
    out = []
    for i in range(n):
        (p1, d1), (p2, d2) = lines[i - 1], lines[i]
        den = d1[0] * d2[1] - d1[1] * d2[0]
        if abs(den) < 1e-9:
            out.append(p2)
            continue
        t = ((p2[0] - p1[0]) * d2[1] - (p2[1] - p1[1]) * d2[0]) / den
        out.append((p1[0] + d1[0] * t, p1[1] + d1[1] * t))
    return out


def fillet_poly(pts, r, segs=8):
    n = len(pts)
    out = []
    for i in range(n):
        p0, p1, p2 = pts[i - 1], pts[i], pts[(i + 1) % n]
        u = _norm((p0[0] - p1[0], p0[1] - p1[1]))
        v = _norm((p2[0] - p1[0], p2[1] - p1[1]))
        cosang = max(-1.0, min(1.0, u[0] * v[0] + u[1] * v[1]))
        phi = math.acos(cosang) / 2
        if phi < 1e-3 or abs(phi - math.pi / 2) < 1e-3:
            out.extend([p1] * (segs + 1))
            continue
        lu = math.hypot(p0[0] - p1[0], p0[1] - p1[1])
        lv = math.hypot(p2[0] - p1[0], p2[1] - p1[1])
        t = min(r / math.tan(phi), 0.48 * min(lu, lv))
        rr = t * math.tan(phi)
        a = (p1[0] + u[0] * t, p1[1] + u[1] * t)
        b = (p1[0] + v[0] * t, p1[1] + v[1] * t)
        bis = _norm((u[0] + v[0], u[1] + v[1]))
        dist = rr / math.sin(phi)
        c = (p1[0] + bis[0] * dist, p1[1] + bis[1] * dist)
        a0 = math.atan2(a[1] - c[1], a[0] - c[0])
        a1 = math.atan2(b[1] - c[1], b[0] - c[0])
        da = (a1 - a0 + math.pi) % (2 * math.pi) - math.pi
        for k in range(segs + 1):
            ang = a0 + da * k / segs
            out.append((c[0] + math.cos(ang) * rr, c[1] + math.sin(ang) * rr))
    return out


def outline(raw, r, inset=0.0, segs=8):
    return fillet_poly(offset_poly(raw, inset) if inset else raw, max(r - inset, 0.25), segs)


def perimeter_len(pts):
    return sum(math.hypot(pts[(i + 1) % len(pts)][0] - p[0], pts[(i + 1) % len(pts)][1] - p[1]) for i, p in enumerate(pts))


def stations(pts, spacing, phase=0.0):
    """Points every `spacing` metres along the closed outline with the tangent angle."""
    n = len(pts)
    total = perimeter_len(pts)
    count = max(1, int(total / spacing))
    step = total / count
    out = []
    target = phase * step
    acc = 0.0
    i = 0
    while len(out) < count and i < n * 2:
        a, b = pts[i % n], pts[(i + 1) % n]
        seg = math.hypot(b[0] - a[0], b[1] - a[1])
        while seg > 1e-9 and acc + seg >= target and len(out) < count:
            t = (target - acc) / seg
            out.append(((a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t), math.atan2(b[1] - a[1], b[0] - a[0])))
            target += step
        acc += seg
        i += 1
    return out


def point_in_poly(p, pts):
    x, y = p
    inside = False
    n = len(pts)
    for i in range(n):
        x1, y1 = pts[i]
        x2, y2 = pts[(i + 1) % n]
        if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / (y2 - y1 + 1e-12) + x1:
            inside = not inside
    return inside


def grid_in_poly(pts, spacing, jitter=0.0, seed=1):
    rnd = random.Random(seed)
    xs = [p[0] for p in pts]
    ys = [p[1] for p in pts]
    out = []
    y = min(ys) + spacing / 2
    while y < max(ys):
        x = min(xs) + spacing / 2
        while x < max(xs):
            q = (x + (rnd.random() - 0.5) * jitter, y + (rnd.random() - 0.5) * jitter)
            if point_in_poly(q, pts):
                out.append(q)
            x += spacing
        y += spacing
    return out


def scanline(pts, y):
    xs = []
    n = len(pts)
    for i in range(n):
        x1, y1 = pts[i]
        x2, y2 = pts[(i + 1) % n]
        if (y1 > y) != (y2 > y):
            xs.append(x1 + (y - y1) * (x2 - x1) / (y2 - y1))
    xs.sort()
    return list(zip(xs[::2], xs[1::2]))


# ------------------------------------------------------------------ bmesh builders


def _bm_box(bm, center, size, rot_z=0.0, rot_x=0.0):
    geom = bmesh.ops.create_cube(bm, size=1.0)
    verts = geom["verts"]
    m = Matrix.Translation(center) @ Matrix.Rotation(rot_z, 4, "Z") @ Matrix.Rotation(rot_x, 4, "X") @ Matrix.Diagonal((*size, 1))
    bmesh.ops.transform(bm, matrix=m, verts=verts)
    return verts


def _bm_cyl(bm, center, r, h, segs=12):
    geom = bmesh.ops.create_cone(bm, cap_ends=True, segments=segs, radius1=r, radius2=r, depth=h)
    bmesh.ops.translate(bm, vec=Vector(center) + Vector((0, 0, h / 2)), verts=geom["verts"])


def solid(name, pts, z0, h, mat, bevel=0.0, segments=2):
    bm = bmesh.new()
    vb = [bm.verts.new((x, y, z0)) for x, y in pts]
    f = bm.faces.new(vb)
    ret = bmesh.ops.extrude_face_region(bm, geom=[f])
    top = [e for e in ret["geom"] if isinstance(e, bmesh.types.BMVert)]
    bmesh.ops.translate(bm, vec=Vector((0, 0, h)), verts=top)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    if bevel:
        sharp = [e for e in bm.edges if len(e.link_faces) == 2 and e.calc_face_angle(0) > 0.6]
        bmesh.ops.bevel(bm, geom=sharp, offset=bevel, segments=segments, affect="EDGES", profile=0.5, clamp_overlap=True)
    return L._finish(bm, name, mat, smooth=False)


def ring(name, outer, inner, z0, h, mat, round_outer=0.0):
    """Closed band between two outlines with equal vertex counts (a frame / slab edge)."""
    bm = bmesh.new()
    n = len(outer)
    ob = [bm.verts.new((x, y, z0)) for x, y in outer]
    ot = [bm.verts.new((x, y, z0 + h)) for x, y in outer]
    ib = [bm.verts.new((x, y, z0)) for x, y in inner]
    it = [bm.verts.new((x, y, z0 + h)) for x, y in inner]
    for i in range(n):
        j = (i + 1) % n
        bm.faces.new((ob[i], ob[j], ot[j], ot[i]))  # outer side
        bm.faces.new((ib[j], ib[i], it[i], it[j]))  # inner side
        bm.faces.new((ot[i], ot[j], it[j], it[i]))  # top
        bm.faces.new((ob[j], ob[i], ib[i], ib[j]))  # bottom
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    if round_outer:
        edges = [e for e in bm.edges if all(v in set(ob) | set(ot) for v in e.verts) and len({v.co.z for v in e.verts}) == 1]
        bmesh.ops.bevel(bm, geom=edges, offset=round_outer, segments=4, affect="EDGES", profile=0.5, clamp_overlap=True)
    ob_ = L._finish(bm, name, mat, smooth=True)
    return ob_


def wall(name, pts, z0, h, mat):
    """Open vertical surface following an outline (curtain glass)."""
    bm = bmesh.new()
    n = len(pts)
    b = [bm.verts.new((x, y, z0)) for x, y in pts]
    t = [bm.verts.new((x, y, z0 + h)) for x, y in pts]
    for i in range(n):
        j = (i + 1) % n
        if (b[i].co - b[j].co).length > 1e-5:
            bm.faces.new((b[i], b[j], t[j], t[i]))
    return L._finish(bm, name, mat, smooth=True)


def mullions(name, pts, z0, h, spacing=1.25, size=(0.07, 0.16), mat="aluminium"):
    bm = bmesh.new()
    for (x, y), ang in stations(pts, spacing):
        _bm_box(bm, (x, y, z0 + h / 2), (size[0], size[1], h), ang)
    return L._finish(bm, name, mat)


def slats(name, pts, z, spacing=0.32, width=0.12, depth=0.1, angle=0.0, mat="wood"):
    """Timber slat ceiling filling an outline (drawn at underside height z)."""
    c, s = math.cos(-angle), math.sin(-angle)
    local = [(c * x - s * y, s * x + c * y) for x, y in pts]
    ys = [p[1] for p in local]
    bm = bmesh.new()
    y = min(ys) + spacing / 2
    ci, si = math.cos(angle), math.sin(angle)
    while y < max(ys):
        for x0, x1 in scanline(local, y):
            x0 += 0.05
            x1 -= 0.05
            if x1 - x0 < 0.2:
                continue
            mx = (x0 + x1) / 2
            wx, wy = ci * mx - si * y, si * mx + ci * y
            _bm_box(bm, (wx, wy, z - depth / 2), (x1 - x0, width, depth), angle)
        y += spacing
    return L._finish(bm, name, mat)


def downlights(name, pts, z, spacing=2.4, mat="led_warm", seed=3):
    bm = bmesh.new()
    for x, y in grid_in_poly(pts, spacing, 0.0, seed):
        _bm_cyl(bm, (x, y, z - 0.03), 0.09, 0.03, 10)
    return L._finish(bm, name, mat)


# ------------------------------------------------------------------ nature


def _clump(bm, center, radius, seed, squash=0.85, subdiv=2, amp=0.34, freq=2.2):
    geom = bmesh.ops.create_icosphere(bm, subdivisions=subdiv, radius=radius)
    off = Vector((seed * 3.17, seed * 1.31, seed * 2.07))
    for v in geom["verts"]:
        d = v.co.normalized()
        n = noise.noise(d * freq * 1.7 + off) * 0.6 + noise.noise(d * freq * 4.3 + off) * 0.4
        v.co = d * radius * (1 + n * amp)
        v.co.z *= squash
        v.co += Vector(center)
    return geom["verts"]


FOLIAGE_MATS = ("leaf", "leafdark", "leaflight")  # a scene may swap in a more vivid set


def foliage(name, clumps, mats=None, subdiv=2):
    """clumps: [(center, radius, seed)] -> one object, shade picked per clump."""
    mats = mats or FOLIAGE_MATS
    bm = bmesh.new()
    groups = []
    for i, (c, r, sd) in enumerate(clumps):
        verts = set(_clump(bm, c, r, sd, subdiv=subdiv))
        groups.append((verts, i % len(mats)))
    bm.faces.ensure_lookup_table()
    for f in bm.faces:
        for verts, mi in groups:
            if f.verts[0] in verts:
                f.material_index = mi
                break
    return L._finish_multi(bm, name, list(mats), smooth=True)


def tree(name, loc, h=7.0, spread=1.0, seed=1, canopy="round", detail=2):
    """Street tree: tapered trunk, four limbs and a canopy of many small leaf clusters."""
    rnd = random.Random(seed)
    x, y, z = loc
    L.cyl(f"{name}_trunk", 0.17 * spread, h * 0.45, (x, y, z), "bark", verts=12, r2=0.1 * spread)
    bm_b = bmesh.new()
    tips = []
    for k in range(5):
        a = k * math.tau / 5 + rnd.random() * 0.7
        tilt = 0.5 + rnd.random() * 0.35
        base = Vector((x, y, z + h * (0.36 + rnd.random() * 0.1)))
        length = h * (0.28 + rnd.random() * 0.12)
        dirv = Vector((math.cos(a) * math.sin(tilt), math.sin(a) * math.sin(tilt), math.cos(tilt)))
        geom = bmesh.ops.create_cone(bm_b, cap_ends=True, segments=7, radius1=0.08 * spread, radius2=0.03 * spread, depth=length)
        rotq = Vector((0, 0, 1)).rotation_difference(dirv)
        bmesh.ops.rotate(bm_b, cent=(0, 0, 0), matrix=rotq.to_matrix(), verts=geom["verts"])
        bmesh.ops.translate(bm_b, vec=base + dirv * length / 2, verts=geom["verts"])
        tips.append(base + dirv * length)
    L._finish(bm_b, f"{name}_branches", "bark")
    clumps = []
    cz = z + h * 0.72
    rx = 2.1 * spread
    n = 16 if canopy == "round" else 12
    for k in range(n):
        # points in an oblate ellipsoid, denser towards the outside so the silhouette is full
        u = rnd.random() * math.tau
        v = math.acos(2 * rnd.random() - 1)
        rr = (0.55 + 0.45 * rnd.random()) * rx
        c = (x + math.cos(u) * math.sin(v) * rr, y + math.sin(u) * math.sin(v) * rr, cz + math.cos(v) * rr * 0.62)
        clumps.append((c, (0.7 + rnd.random() * 0.4) * spread, seed * 131 + k))
    for t in tips:
        clumps.append(((t.x, t.y, t.z + 0.15), 0.55 * spread, seed * 7 + int(t.x * 10)))
    foliage(f"{name}_crown", clumps, subdiv=detail)


def _free(p, avoid):
    return not any(point_in_poly(p, a) for a in (avoid or ()))


def bushes_along(name, pts, spacing=0.9, z=0.0, r=0.42, seed=5, jitter=0.25, avoid=None):
    rnd = random.Random(seed)
    clumps = []
    for (x, y), ang in stations(pts, spacing):
        if not _free((x, y), avoid):
            continue
        rr = r * (0.8 + rnd.random() * 0.5)
        clumps.append(((x + (rnd.random() - 0.5) * jitter, y + (rnd.random() - 0.5) * jitter, z + rr * 0.6), rr, rnd.randint(0, 9999)))
    if not clumps:
        return None
    return foliage(name, clumps, subdiv=1)


def vines(name, pts, spacing=1.6, z=0.0, length=2.2, seed=9, avoid=None):
    """Hanging greenery spilling over an edge."""
    rnd = random.Random(seed)
    clumps = []
    for (x, y), ang in stations(pts, spacing, phase=0.3):
        if rnd.random() < 0.35 or not _free((x, y), avoid):
            continue
        L_ = length * (0.5 + rnd.random() * 0.7)
        steps = int(L_ / 0.28)
        for k in range(steps):
            f = k / max(1, steps - 1)
            clumps.append(((x + math.sin(k * 0.7) * 0.06, y + math.cos(k * 0.9) * 0.06, z - k * 0.28), 0.2 * (1 - f * 0.5), rnd.randint(0, 9999)))
    if not clumps:
        return None
    return foliage(name, clumps, mats=("leaf", "leaflight", "leafdark"), subdiv=1)


def carve(ob, xmin, xmax, ymin, ymax, zmax):
    """Cut an opening into a world-space mesh: split it on the box planes and drop the faces inside."""
    bm = bmesh.new()
    bm.from_mesh(ob.data)
    for co, no in (((xmin, 0, 0), (1, 0, 0)), ((xmax, 0, 0), (1, 0, 0)), ((0, 0, zmax), (0, 0, 1))):
        bmesh.ops.bisect_plane(bm, geom=bm.verts[:] + bm.edges[:] + bm.faces[:], plane_co=co, plane_no=no)
    inside = []
    for f in bm.faces:
        c = f.calc_center_median()
        if xmin < c.x < xmax and ymin < c.y < ymax and c.z < zmax:
            inside.append(f)
    bmesh.ops.delete(bm, geom=inside, context="FACES")
    bm.to_mesh(ob.data)
    bm.free()


def facade_y(pts, x):
    """Front-most (lowest y) crossing of a closed outline with the vertical line at x."""
    ys = []
    for i, (x1, y1) in enumerate(pts):
        x2, y2 = pts[(i + 1) % len(pts)]
        if x1 != x2 and (x1 - x) * (x2 - x) <= 0:
            ys.append(y1 + (y2 - y1) * (x - x1) / (x2 - x1))
    return min(ys)
