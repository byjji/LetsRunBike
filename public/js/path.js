// Road centreline in real 3D. Pure math (no three.js) so it runs in node tests.
// World: y up, travel starts toward +z, 1 unit = 1 track segment.
export const RW = 3.6;      // road half width
export const TURN = 1.5;    // yaw (rad) gained per unit of segment curve

/** segs: [{curve}] → centreline points; point i is the start of segment i. */
export function buildPath(segs) {
  const n = segs.length;
  const x = new Float32Array(n + 1), z = new Float32Array(n + 1), yaw = new Float32Array(n + 1);
  let px = 0, pz = 0, a = 0;
  for (let i = 0; i < n; i++) {
    px += Math.sin(a); pz += Math.cos(a); a += segs[i].curve * TURN;
    x[i + 1] = px; z[i + 1] = pz; yaw[i + 1] = a;
  }
  return { n, x, z, yaw };
}

/** Position at distance s along the path, shifted `lateral` to the right of travel. */
export function sample(path, s, lateral = 0, out = {}) {
  const c = Math.min(path.n, Math.max(0, s));
  const i = Math.min(path.n - 1, Math.floor(c)), f = c - i;
  const yaw = path.yaw[i] + (path.yaw[i + 1] - path.yaw[i]) * f;
  // looking along +z with y up, screen-right is -x
  out.x = path.x[i] + (path.x[i + 1] - path.x[i]) * f - Math.cos(yaw) * lateral;
  out.z = path.z[i] + (path.z[i + 1] - path.z[i]) * f + Math.sin(yaw) * lateral;
  out.yaw = yaw;
  return out;
}
