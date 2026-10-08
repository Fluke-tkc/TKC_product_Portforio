// Surface normal maps for the baked models (maps: public/Blender/scripts/make_normal_maps.py).
// The baked materials are unlit, so the map is lit here: the bake's sun plus sky shade the bumped normal and the
// flat one, and their ratio scales the baked colour (a flat patch stays exactly as baked). Projected triplanar in
// world metres, since UV0 holds the lightmap atlas.
import * as THREE from "three";

// material name -> [map, metres per tile, strength]; first match wins
const RULES = [
  [/^(asphalt|gravel|sand|soil|clay)$/, "grain", 2.5, 0.9],
  [/^paving/, "pavers", 2.4, 1],
  [/^(concrete_floor|floor_dark|cyber_floor)$/, "slab", 6, 1],
  [/^(tile_blue|tile_line)$/, "tiles", 2.4, 0.8],
  [/^stone$/, "stone", 3, 1],
  [/^(lawn|field|crop|vegbed)/, "lawn", 1.2, 0.8],
  [/^(wood|timber|pallet_wood)/, "wood", 2.4, 0.7],
  [/^(carpet|rug_|fabric|blanket|mattress)/, "fabric", 0.8, 0.5],
  [/^container_/, "ribs", 2.4, 1],
  [/^roof_slate$/, "slate", 2, 1],
  [/^solar$/, "cells", 1.6, 0.8],
  [/^(concrete|facade_|house_cream|hosp_white|paint_|panel_grey|offwhite|planter)/, "plaster", 4, 0.6],
];

export const normalRule = (name) => RULES.find(([re]) => re.test(name))?.slice(1);
export const normalUrl = (map) => `/models/normal/${map}.webp`;

// [elevation in degrees, x, y] as in the Blender script's lighting(); Blender z-up -> three y-up
export function sunDirection([el, x, y], out) {
  const a = THREE.MathUtils.degToRad(el);
  const h = Math.hypot(x, y);
  return out.set((x / h) * Math.cos(a), Math.sin(a), (-y / h) * Math.cos(a));
}

export function addNormalMap(material, texture, tile, strength, sun) {
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, { uNMap: { value: texture }, uNTile: { value: 1 / tile }, uNStrength: { value: strength }, uSun: sun });
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vNP;\nvarying vec3 vNN;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvNP = (modelMatrix * vec4(transformed, 1.0)).xyz;\nvNN = normalize(mat3(modelMatrix) * normal);");
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
varying vec3 vNP;
varying vec3 vNN;
uniform sampler2D uNMap;
uniform float uNTile;
uniform float uNStrength;
uniform vec3 uSun;
float nLight(vec3 n) { return 0.65 * max(dot(n, uSun), 0.0) + 0.35 * (0.5 + 0.5 * n.y); }`
      )
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
{
  vec3 gn = normalize(vNN);
  vec3 bw = pow(abs(gn), vec3(4.0));
  bw /= bw.x + bw.y + bw.z;
  vec3 tx = texture2D(uNMap, vNP.zy * uNTile).xyz * 2.0 - 1.0;
  vec3 ty = texture2D(uNMap, vNP.xz * uNTile).xyz * 2.0 - 1.0;
  vec3 tz = texture2D(uNMap, vNP.xy * uNTile).xyz * 2.0 - 1.0;
  tx = vec3(tx.xy * uNStrength + gn.zy, abs(tx.z) * gn.x); // whiteout blend onto the surface normal
  ty = vec3(ty.xy * uNStrength + gn.xz, abs(ty.z) * gn.y);
  tz = vec3(tz.xy * uNStrength + gn.xy, abs(tz.z) * gn.z);
  vec3 bn = normalize(tx.zyx * bw.x + ty.xzy * bw.y + tz.xyz * bw.z);
  diffuseColor.rgb *= clamp(nLight(bn) / max(nLight(gn), 0.05), 0.6, 1.4);
}`
      );
  };
}
