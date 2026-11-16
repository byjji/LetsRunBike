// Landmark registry and loader. A landmark is normally assembled in code (kr.js / jp.js / us.js);
// if its city-data entry names a model file (def.model → /models/<def.model>), that file is used
// instead and the coded version is the fallback.
import * as THREE from 'three';
import { RW } from '../../path.js';
import { bake } from '../kit.js';
import { KR } from './kr.js';
import { KR2 } from './kr2.js';
import { JP } from './jp.js';
import { US } from './us.js';

export const LANDMARKS = { ...KR, ...KR2, ...JP, ...US };

/** Coded landmark, baked. Beside-the-road landmarks are scaled so their top is at def.h. */
export function buildLandmark(def, span = def.span) {
  const g = bake(LANDMARKS[def.id](span));
  return def.through ? g : fit(g, def);
}

export const LEAN = 0.3;      // beside-the-road landmarks are turned this much toward the oncoming rider
/** How far a placed landmark reaches from its centre toward the road (parts under water do not count). */
export function reach(g, side) {
  const c = Math.cos(LEAN), s = Math.sin(LEAN) * (side < 0 ? -1 : 1), v = new THREE.Vector3();
  let far = 0;
  g.updateMatrixWorld(true);
  g.traverse((o) => {
    if (!o.isMesh) return;
    const p = o.geometry.attributes.position;
    for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i).applyMatrix4(o.matrixWorld); if (v.y > -0.5) far = Math.max(far, v.z * c + v.x * s); }
  });
  return far;
}

/** Scale to the wanted height, then smaller if the base would spread onto the road. */
function fit(g, def) {
  const box = new THREE.Box3().setFromObject(g);
  if (def.h > 0 && box.max.y > 0) g.scale.multiplyScalar(def.h / box.max.y);
  const r = reach(g, def.side), room = def.offset - 2.5;
  if (r > room && room > 0) g.scale.multiplyScalar(room / r);
  return g;
}

async function defaultLoadModel(url) {
  const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
  const gltf = await new GLTFLoader().loadAsync(url);
  return gltf.scene;
}

/**
 * def: landmark entry from cities.js. Uses the model file when def.model is set and loads within 5 s,
 * otherwise the coded landmark. span: length along the road for through-landmarks.
 */
export async function loadLandmark(def, { loadModel = defaultLoadModel, span = def.span } = {}) {
  if (def.model) {
    try {
      const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 5000));
      const obj = await Promise.race([loadModel('/models/' + def.model), timeout]);
      if (!def.through) {
        const box = new THREE.Box3().setFromObject(obj);
        obj.position.y -= box.min.y;                     // stand it on the ground
        const holder = new THREE.Group(); holder.add(obj);
        return fit(holder, def);
      }
      return obj;
    } catch { /* fall back to the coded landmark */ }
  }
  return buildLandmark(def, span);
}

// Separating-axis test: triangle (projected on x-y) against the rectangle [x0,x1] x [y0,y1].
function triHitsRect(a, b, c, x0, x1, y0, y1) {
  if (Math.max(a.x, b.x, c.x) <= x0 || Math.min(a.x, b.x, c.x) >= x1 || Math.max(a.y, b.y, c.y) <= y0 || Math.min(a.y, b.y, c.y) >= y1) return false;
  const tri = [a, b, c], cx = [x0, x1, x1, x0], cy = [y0, y0, y1, y1];
  for (let i = 0; i < 3; i++) {
    const p = tri[i], q = tri[(i + 1) % 3], nx = q.y - p.y, ny = p.x - q.x;
    if (Math.abs(nx) + Math.abs(ny) < 1e-9) continue;
    let t0 = Infinity, t1 = -Infinity, r0 = Infinity, r1 = -Infinity;
    for (const v of tri) { const d = v.x * nx + v.y * ny; t0 = Math.min(t0, d); t1 = Math.max(t1, d); }
    for (let k = 0; k < 4; k++) { const d = cx[k] * nx + cy[k] * ny; r0 = Math.min(r0, d); r1 = Math.max(r1, d); }
    if (t1 <= r0 + 1e-6 || r1 <= t0 + 1e-6) return false;
  }
  return true;
}

/** True when nothing blocks the space riders pass through (road along z, centred on x = 0). */
export function clearance(root) {
  const X = RW + 0.2, Y0 = 0.3, Y1 = 4.2;
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
  let ok = true;
  root.updateMatrixWorld(true);
  root.traverse((o) => {
    if (!ok || !o.isMesh) return;
    const pos = o.geometry.attributes.position, idx = o.geometry.index;
    const n = idx ? idx.count : pos.count;
    for (let i = 0; i < n && ok; i += 3) {
      const [ia, ib, ic] = idx ? [idx.getX(i), idx.getX(i + 1), idx.getX(i + 2)] : [i, i + 1, i + 2];
      a.fromBufferAttribute(pos, ia).applyMatrix4(o.matrixWorld);
      b.fromBufferAttribute(pos, ib).applyMatrix4(o.matrixWorld);
      c.fromBufferAttribute(pos, ic).applyMatrix4(o.matrixWorld);
      if (triHitsRect(a, b, c, -X, X, Y0, Y1)) ok = false;
    }
  });
  return ok;
}
