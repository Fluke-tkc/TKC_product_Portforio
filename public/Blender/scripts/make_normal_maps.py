"""Tileable surface normal maps for the baked models (src/three/model/normalMaps.js).

Run with Blender's Python (it ships numpy), then convert the PNGs to WebP:
  "C:/Program Files/Blender Foundation/Blender 5.2/5.2/python/bin/python.exe" make_normal_maps.py
  python -c "import glob,PIL.Image as I;[I.open(p).save(p[:-3]+'webp',quality=90) for p in glob.glob('../../models/normal/*.png')]"
Every map is a height field (rows = image top to bottom) turned into an OpenGL-style normal map.
"""
import os
import struct
import zlib

import numpy as np

N = 512
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "models", "normal")
rng = np.random.default_rng(7)
u = (np.arange(N) + 0.5) / N
U, V = np.meshgrid(u, u)  # U across, V down, both 0..1


def noise(cx, cy=None, octaves=4, gain=0.5):
    """Periodic value noise, cx x cy cells on the first octave."""
    cy = cy or cx
    out = np.zeros((N, N))
    amp, tot = 1.0, 0.0
    for o in range(octaves):
        nx, ny = cx * 2**o, cy * 2**o
        g = rng.random((ny, nx))
        fx, fy = U * nx, V * ny
        ix, iy = np.floor(fx).astype(int), np.floor(fy).astype(int)
        tx, ty = fx - ix, fy - iy
        tx, ty = tx * tx * (3 - 2 * tx), ty * ty * (3 - 2 * ty)
        x0, x1, y0, y1 = ix % nx, (ix + 1) % nx, iy % ny, (iy + 1) % ny
        top = g[y0, x0] * (1 - tx) + g[y0, x1] * tx
        bot = g[y1, x0] * (1 - tx) + g[y1, x1] * tx
        out += amp * (top * (1 - ty) + bot * ty)
        tot += amp
        amp *= gain
    return out / tot


def groove(d, w):
    """0 in a joint of half width w (d = distance to it in tile units), easing up to 1 on a bevel."""
    return np.clip(d / w, 0, 1) ** 0.5


def bricks(cols, rows, w, shift=0.5):
    """Running bond: distance to the nearest joint, and a random value per brick."""
    fy = V * rows
    row = np.floor(fy).astype(int)
    fx = U * cols + (row % 2) * shift
    col = np.floor(fx).astype(int) % cols
    d = np.minimum(np.minimum(fx % 1, 1 - fx % 1) / cols, np.minimum(fy % 1, 1 - fy % 1) / rows)
    ids = rng.random((rows, cols))[row % rows, col]
    return groove(d, w), ids


def voronoi(points):
    """Periodic Voronoi: F2 - F1 (zero on the cell borders)."""
    p = rng.random((points, 2))
    d1 = np.full((N, N), 9.0)
    d2 = np.full((N, N), 9.0)
    for px, py in p:
        for ox in (-1, 0, 1):
            for oy in (-1, 0, 1):
                d = np.hypot(U - px - ox, V - py - oy)
                d2 = np.where(d < d1, d1, np.minimum(d2, d))
                d1 = np.minimum(d1, d)
    return d2 - d1


def maps():
    yield "grain", (noise(24, octaves=3) + 0.7 * noise(96, octaves=2)), 6
    yield "plaster", noise(5, octaves=6, gain=0.55), 5
    j, ids = bricks(4, 8, 0.006)
    yield "pavers", j * (0.9 + 0.1 * ids) + 0.04 * noise(48, octaves=2), 4
    j, _ = bricks(2, 2, 0.004, shift=0)
    yield "slab", j + 0.03 * noise(16, octaves=4), 4
    j, _ = bricks(8, 8, 0.003, shift=0)
    yield "tiles", j, 4
    e = voronoi(14)
    yield "stone", groove(e, 0.02) + 0.08 * noise(32, octaves=3), 4
    yield "lawn", noise(64, 16, octaves=2) + 0.6 * noise(128, octaves=1), 8
    j, ids = bricks(1, 4, 0.004, shift=0)  # four planks running across, grain along them
    yield "wood", j + 0.25 * noise(3, 96, octaves=3) * (0.7 + 0.3 * ids), 4
    weave = np.sin(U * np.pi * 2 * 64) * np.where((np.floor(V * 64) % 2) == 0, 1, -1)
    yield "fabric", 0.5 + 0.25 * weave * np.abs(np.sin(V * np.pi * 64)) + 0.2 * noise(32, octaves=2), 3
    yield "ribs", 0.5 + 0.5 * np.cos(U * np.pi * 2 * 10), 3
    row = np.floor(V * 6).astype(int)  # overlapping courses: each slate thickens towards its lower edge
    fx = U * 8 + (row % 2) * 0.5
    side = np.minimum(fx % 1, 1 - fx % 1) / 8
    yield "slate", (V * 6 % 1) * groove(side, 0.004) + 0.05 * noise(32, octaves=2), 3
    j, _ = bricks(6, 10, 0.003, shift=0)
    yield "cells", j, 3


def normal_png(name, h, slope):
    # slope: strength of the generated relief (pixels of height per height unit)
    h = (h - h.min()) / (np.ptp(h) or 1) * slope
    dx = (np.roll(h, -1, 1) - np.roll(h, 1, 1)) / 2
    dr = (np.roll(h, -1, 0) - np.roll(h, 1, 0)) / 2
    n = np.dstack([-dx, dr, np.ones_like(h)])  # up the image is -rows
    n /= np.linalg.norm(n, axis=2, keepdims=True)
    px = np.round((n * 0.5 + 0.5) * 255).astype(np.uint8)
    raw = b"".join(b"\x00" + px[r].tobytes() for r in range(N))
    chunk = lambda t, d: struct.pack(">I", len(d)) + t + d + struct.pack(">I", zlib.crc32(t + d))
    data = b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", N, N, 8, 2, 0, 0, 0)) + chunk(b"IDAT", zlib.compress(raw, 9)) + chunk(b"IEND", b"")
    with open(os.path.join(OUT, name + ".png"), "wb") as f:
        f.write(data)


os.makedirs(OUT, exist_ok=True)
for name, h, slope in maps():
    normal_png(name, h, slope)
    print(name)
