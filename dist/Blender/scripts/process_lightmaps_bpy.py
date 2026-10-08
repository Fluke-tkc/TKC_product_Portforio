"""Turn raw Cycles lightmap bakes (.hdr, linear irradiance) into web lightmaps (.webp), inside Blender.

blender -b --factory-startup --python process_lightmaps_bpy.py -- <in_dir> <out_dir> [--exposure 1.0]

Same encoding as process_lightmaps.py (each texel stores y / 2 in sRGB, y = shoulder(irradiance * SCALE)), but it
needs nothing beyond Blender's own Python: numpy for the curve and an edge-aware (bilateral) smoothing in place of
OpenCV's non-local-means denoise. The range weight keeps the black UV gutters from bleeding into lit texels.
"""
import glob
import os
import sys

import bpy
import numpy as np

SCALE, SHOULDER = 0.85, 1.6


def srgb(x):
    x = np.clip(x, 0, 1)
    return np.where(x <= 0.0031308, x * 12.92, 1.055 * np.power(x, 1 / 2.4) - 0.055)


def bilateral(img, radius=3, sigma_s=2.0, sigma_r=0.045):
    """Edge-aware smoothing of an (h, w, 3) image in 0..1 (numpy only, shifted copies of the image)."""
    pad = np.pad(img, ((radius, radius), (radius, radius), (0, 0)), mode="edge")
    h, w, _ = img.shape
    acc = np.zeros_like(img)
    wsum = np.zeros(img.shape[:2], dtype=np.float32)
    for dy in range(-radius, radius + 1):
        for dx in range(-radius, radius + 1):
            ws = np.exp(-(dx * dx + dy * dy) / (2 * sigma_s * sigma_s))
            nb = pad[radius + dy: radius + dy + h, radius + dx: radius + dx + w]
            d2 = np.sum((nb - img) ** 2, axis=2) / 3.0
            wgt = (ws * np.exp(-d2 / (2 * sigma_r * sigma_r))).astype(np.float32)
            acc += nb * wgt[..., None]
            wsum += wgt
    return acc / wsum[..., None]


def process(path, out_dir, exposure):
    src = bpy.data.images.load(path)
    w, h = src.size
    px = np.empty(w * h * 4, dtype=np.float32)
    src.pixels.foreach_get(px)
    img = px.reshape(h, w, 4)[..., :3]
    y = img * SCALE * exposure
    y = SHOULDER * np.tanh(y / SHOULDER)
    enc = srgb(y / 2.0).astype(np.float32)
    enc = bilateral(enc)
    enc = np.round(enc * 255) / 255
    name = os.path.splitext(os.path.basename(path))[0]
    out = os.path.join(out_dir, f"{name}.webp")
    dst = bpy.data.images.new(name, w, h, alpha=False, float_buffer=False)
    dst.colorspace_settings.name = "sRGB"
    rgba = np.concatenate([enc, np.ones((h, w, 1), dtype=np.float32)], axis=2)
    dst.pixels.foreach_set(rgba.ravel())
    dst.file_format = "WEBP"
    dst.filepath_raw = out
    dst.save(filepath=out, quality=90)
    print(name, w, "px ->", out, os.path.getsize(out) // 1024, "KB", flush=True)


if __name__ == "__main__":
    a = sys.argv[sys.argv.index("--") + 1:]
    src_dir, dst_dir = a[0], a[1]
    exposure = float(a[a.index("--exposure") + 1]) if "--exposure" in a else 1.0
    os.makedirs(dst_dir, exist_ok=True)
    for f in sorted(glob.glob(os.path.join(src_dir, "*.hdr"))):
        process(f, dst_dir, exposure)
