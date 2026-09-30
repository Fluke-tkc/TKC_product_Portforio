"""Re-export a baked diorama with the current tkc_lib palette, without re-baking.

blender -b public/Blender/<scene>_baked.blend --python public/Blender/scripts/recolor_export.py -- --out <dir>

The lightmaps and vertex light hold lighting only (no albedo), so material colours can change freely;
only the faint colour bleed of bounced light keeps the old tint until the next full bake.
"""
import os
import sys

import bpy

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from tkc_lib import GLTF_EXPORT, PALETTE  # noqa: E402

argv = sys.argv[sys.argv.index("--") + 1 :]
out = argv[argv.index("--out") + 1]
changed = 0
for m in bpy.data.materials:
    if m.name in PALETTE and m.node_tree:
        col, rough = PALETTE[m.name]
        bsdf = m.node_tree.nodes.get("Principled BSDF")
        bsdf.inputs["Base Color"].default_value = (*col, 1)
        bsdf.inputs["Roughness"].default_value = rough
        changed += 1
for ob in bpy.context.scene.objects:
    ob.select_set(ob.type in ("MESH", "EMPTY"))
name = os.path.basename(bpy.data.filepath).replace("_baked.blend", ".glb")
glb = os.path.join(out, name)
bpy.ops.export_scene.gltf(filepath=glb, **GLTF_EXPORT)
bpy.ops.wm.save_mainfile()
print("recolor:", changed, "materials ->", glb, os.path.getsize(glb) // 1024, "KB")
