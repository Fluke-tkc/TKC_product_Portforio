"""Turn raw Cycles lightmap bakes (.hdr, linear irradiance) into web lightmaps (.webp).

python process_lightmaps.py <in_dir> <out_dir> [--exposure 1.0] [--half]

Each texel stores y / 2 in sRGB, where y = shoulder(irradiance * SCALE) (y <= 1.6). SCALE and
SHOULDER match bake_export.py, which applies the same curve to the vertex-lit parts. The web app multiplies material colours by the map with intensity 2.
Needs numpy + opencv-python.
"""
import glob
import os
import sys

import cv2
import numpy as np

SCALE, SHOULDER = 0.85, 1.6


def srgb(x):
    x = np.clip(x, 0, 1)
    return np.where(x <= 0.0031308, x * 12.92, 1.055 * np.power(x, 1 / 2.4) - 0.055)


def process(path, out_dir, exposure, half):
    img = cv2.imread(path, cv2.IMREAD_UNCHANGED).astype(np.float32)[..., :3]
    y = img * SCALE * exposure
    y = SHOULDER * np.tanh(y / SHOULDER)
    enc = (srgb(y / 2.0) * 255 + 0.5).astype(np.uint8)
    enc = cv2.fastNlMeansDenoisingColored(enc, None, 5, 5, 7, 21)
    name = os.path.splitext(os.path.basename(path))[0]
    out = os.path.join(out_dir, f"{name}.webp")
    cv2.imwrite(out, enc, [cv2.IMWRITE_WEBP_QUALITY, 90])
    print(name, img.shape[1], "px ->", out, os.path.getsize(out) // 1024, "KB")
    if half:
        small = cv2.resize(enc, (enc.shape[1] // 2, enc.shape[0] // 2), interpolation=cv2.INTER_AREA)
        cv2.imwrite(os.path.join(out_dir, f"{name}_half.webp"), small, [cv2.IMWRITE_WEBP_QUALITY, 88])


if __name__ == "__main__":
    src, dst = sys.argv[1], sys.argv[2]
    exposure = float(sys.argv[sys.argv.index("--exposure") + 1]) if "--exposure" in sys.argv else 1.0
    os.makedirs(dst, exist_ok=True)
    for f in sorted(glob.glob(os.path.join(src, "*.hdr"))):
        process(f, dst, exposure, "--half" in sys.argv)
