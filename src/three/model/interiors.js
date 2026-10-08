// Rooms behind the opaque facade glass of the baked models (interior mapping): the view ray is traced into a grid
// of fake rooms (side walls, floor, a ceiling light, a desk row and a screen on the back wall), lit or dark at random,
// seen through the pane's tint, with the sky reflected at grazing angles. The panes sit on solid blocks, so this is
// what gives the towers an inside without geometry.
export const isFacadeGlass = (name) => /^(tower_glass2?|cyber_glass)$/.test(name);

// scale: the material's colour factor (vertex-lit materials carry the bake intensity in their colour)
export function addInterior(material, scale) {
  const base = material.userData.base.clone();
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, { uBase: { value: base }, uScale: { value: scale } });
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vIP;\nvarying vec3 vIN;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvIP = (modelMatrix * vec4(transformed, 1.0)).xyz;\nvIN = normalize(mat3(modelMatrix) * normal);");
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
varying vec3 vIP;
varying vec3 vIN;
uniform vec3 uBase;
uniform float uScale;
float roomHash(vec3 p) { return fract(sin(dot(p, vec3(12.9898, 78.233, 37.719))) * 43758.5453); }`
      )
      .replace(
        "#include <color_fragment>",
        `{
  vec3 n = normalize(vIN);
  vec3 rd = normalize(vIP - cameraPosition);
  vec3 room = vec3(4.0, 3.6, 4.5); // width, storey, depth (m)
  vec3 U = normalize(vec3(-n.z, 0.0, n.x));
  vec3 d = vec3(dot(rd, U), rd.y, -dot(rd, n)) / room;
  vec2 p = vec2(dot(vIP, U), vIP.y - 0.2) / room.xy;
  // rooms per pixel, taken outside any branch (derivatives need every pixel): a room only a few pixels wide would
  // shimmer as the view moves, so its detail fades to the room's plain light
  float px = max(fwidth(p.x), fwidth(p.y));
  if (abs(n.y) < 0.5 && d.z > 1e-4) {
    vec2 id = floor(p);
    vec3 f = vec3(fract(p), 0.0);
    vec3 tw = vec3((step(0.0, d.xy) - f.xy) / d.xy, 1.0 / d.z);
    float t = min(min(tw.x, tw.y), tw.z);
    vec3 hit = f + d * t;
    float r = roomHash(vec3(id, dot(floor(n * 1.5 + 0.5), vec3(1.0, 3.0, 9.0)))); // per facade direction: stable on the whole face
    float lit = step(0.25, r);
    vec3 wall = mix(vec3(0.08, 0.09, 0.12), mix(vec3(0.5, 0.46, 0.41), vec3(0.41, 0.46, 0.52), step(0.6, r)), lit);
    vec3 c;
    // a desk standing in the room: a real box, so it shifts with the view
    vec3 bc = vec3(0.3 + 0.4 * fract(r * 17.0), 0.105, 0.5);
    vec3 bh = vec3(0.17, 0.105, 0.09); // half size, room units: 1.4 x 0.75 x 0.8 m
    vec3 t0 = (bc - bh - f) / d;
    vec3 t1 = (bc + bh - f) / d;
    vec3 tn = min(t0, t1);
    float tin = max(max(tn.x, tn.y), tn.z);
    float tout = min(min(max(t0.x, t1.x), max(t0.y, t1.y)), max(t0.z, t1.z));
    if (tin > 0.0 && tin < tout && tin < t) {
      t = tin;
      hit = f + d * t;
      c = tin == tn.y ? vec3(0.4, 0.3, 0.22) * (0.5 + 0.5 * lit) : vec3(0.17, 0.14, 0.12);
      float mon = step(abs(hit.x - bc.x), 0.06) * step(abs(hit.z - bc.z + 0.03), 0.02); // a laptop glowing on top
      c = mix(c, lit > 0.5 ? vec3(0.4, 0.7, 1.2) : c, mon * float(tin == tn.y));
    } else if (t == tw.z) { // back wall: a desk row with monitors, a person, sometimes a screen or a picture
      c = wall;
      float pic = step(0.5, hit.y) * step(hit.y, 0.75) * step(0.32, hit.x) * step(hit.x, 0.68) * lit * step(0.4, fract(r * 3.0));
      c = mix(c, mix(vec3(0.25, 0.55, 1.1), vec3(0.6, 0.38, 0.3), step(0.6, fract(r * 7.0))), pic);
      float px = 0.2 + 0.6 * fract(r * 13.0);
      float who = lit * step(0.35, fract(r * 11.0)) * max(step(length((hit.xy - vec2(px, 0.43)) * vec2(1.0, 0.9)), 0.04), step(abs(hit.x - px), 0.05) * step(hit.y, 0.38));
      c = mix(c, vec3(0.16, 0.18, 0.24), who);
      float desk = step(hit.y, 0.22) * step(0.1, hit.x) * step(hit.x, 0.9);
      c = mix(c, vec3(0.2, 0.15, 0.12), desk);
      float mon = step(0.22, hit.y) * step(hit.y, 0.31) * step(0.12, hit.x) * step(hit.x, 0.88) * step(abs(fract(hit.x * 4.0) - 0.5), 0.17);
      c = mix(c, lit > 0.5 ? vec3(0.35, 0.65, 1.2) : vec3(0.05), mon);
    } else if (t == tw.x) {
      c = wall * 0.75;
    } else if (d.y < 0.0) {
      c = mix(vec3(0.3, 0.25, 0.21), vec3(0.2, 0.2, 0.22), step(0.5, fract(r * 5.0))) * (0.4 + 0.6 * lit);
    } else { // ceiling with its light panel
      c = mix(wall * 1.1, vec3(1.5, 1.45, 1.35), lit * step(abs(hit.x - 0.5), 0.3) * step(abs(hit.z - 0.5), 0.12));
    }
    c *= mix(1.0, 0.6, hit.z); // darker towards the back
    vec3 avg = mix(vec3(0.09, 0.1, 0.12), vec3(0.4, 0.38, 0.35), lit);
    c = mix(c, avg, max(smoothstep(0.03, 0.1, px), 1.0 - smoothstep(0.06, 0.18, d.z * room.z))); // small on screen or seen edge-on
    c = mix(c, vec3(0.32, 0.31, 0.3), smoothstep(0.2, 0.5, px)); // under a few pixels: the average of all rooms
    vec3 tint = mix(vec3(1.0), uBase / max(max(uBase.r, uBase.g), max(uBase.b, 1e-3)), 0.65);
    vec3 rv = reflect(rd, n);
    vec3 sky = mix(vec3(0.82, 0.88, 0.94), vec3(0.42, 0.6, 0.88), clamp(rv.y, 0.0, 1.0));
    float fres = 0.12 + 0.55 * pow(1.0 - clamp(-dot(rd, n), 0.0, 1.0), 4.0);
    // capped well under the bloom threshold (ModelStage): tiny bright lights would flash as the view moves
    vec3 glass = min(mix(c * tint, sky, fres), vec3(0.72));
    diffuseColor.rgb = glass * uScale * diffuseColor.rgb / max(uBase, vec3(1e-3)); // keeps a demo's tint
  }
}
#include <color_fragment>`
      );
  };
}
