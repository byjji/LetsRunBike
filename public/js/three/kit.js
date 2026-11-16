// Small building kit for the casual-3D look: flat-shaded primitives with their base on the ground,
// and baking of a whole model into one vertex-coloured mesh (one draw call).
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export const WATER = '#3aa7ea';
export const WATER_Y = -3;      // water surface; land is y = 0

const mats = new Map();
/** Cached material per colour. Passing opts (transparent, emissive, side) makes a "special" material kept out of baking. */
export function mat(color, opts) {
  const key = opts ? color + JSON.stringify(opts) : color;
  let m = mats.get(key);
  if (!m) {
    m = new THREE.MeshLambertMaterial({ color, flatShading: true, ...opts });
    m.userData.special = !!opts;
    mats.set(key, m);
  }
  return m;
}
export const VCOL = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true });

const mesh = (g, color, opts) => new THREE.Mesh(g, mat(color, opts));
/** Box standing on y = 0. */
export function box(w, h, d, color, opts) { const g = new THREE.BoxGeometry(w, h, d); g.translate(0, h / 2, 0); return mesh(g, color, opts); }
/** Cylinder / tapered cylinder standing on y = 0. */
export function cyl(rTop, rBottom, h, color, seg = 12, opts) { const g = new THREE.CylinderGeometry(rTop, rBottom, h, seg); g.translate(0, h / 2, 0); return mesh(g, color, opts); }
export function cone(r, h, color, seg = 12, opts) { const g = new THREE.ConeGeometry(r, h, seg); g.translate(0, h / 2, 0); return mesh(g, color, opts); }
/** Sphere centred on the origin. */
export function sphere(r, color, seg = 10, opts) { return mesh(new THREE.SphereGeometry(r, seg, Math.max(6, Math.round(seg * 0.7))), color, opts); }
/** Upper half of a sphere, flat side on y = 0. */
export function dome(r, color, seg = 12, opts) { return mesh(new THREE.SphereGeometry(r, seg, Math.max(4, seg >> 1), 0, Math.PI * 2, 0, Math.PI / 2), color, opts); }
/** Flat horizontal rectangle (w along x, d along z) facing up. */
export function slab(w, d, color, opts) { const g = new THREE.PlaneGeometry(w, d); g.rotateX(-Math.PI / 2); return mesh(g, color, opts); }
/** Solid from a 2D outline [[x,y], ...] in the x-y plane, extruded `depth` along z and centred on z. */
export function prism(points, depth, color, opts) {
  const sh = new THREE.Shape(points.map(([x, y]) => new THREE.Vector2(x, y)));
  const g = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: false });
  g.translate(0, 0, -depth / 2);
  return mesh(g, color, opts);
}
/** Solid of revolution from a profile [[radius, y], ...] (bottom to top). */
export function lathe(profile, color, seg = 14, opts) {
  return mesh(new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), seg), color, opts);
}
/** Straight bar between two points. */
export function beam(a, b, r, color, seg = 6) {
  const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b), len = va.distanceTo(vb);
  const m = mesh(new THREE.CylinderGeometry(r, r, len, seg), color);
  m.position.copy(va).add(vb).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), vb.sub(va).normalize());
  return m;
}
/** Position (and optionally turn / scale) an object; returns it for chaining. */
export function at(o, x = 0, y = 0, z = 0, ry = 0, s) {
  o.position.set(x, y, z); o.rotation.y = ry;
  if (s != null) { if (Array.isArray(s)) o.scale.set(...s); else o.scale.setScalar(s); }
  return o;
}
export function group(...children) { const g = new THREE.Group(); for (const c of children.flat()) if (c) g.add(c); return g; }
/** Mark a sub-group as moving on its own: baking keeps it as a separate object. */
export function live(g, name) { g.userData.live = true; if (name) g.name = name; return g; }

const _c = new THREE.Color(), _m = new THREE.Matrix4();
function bakeNode(node) {
  node.updateMatrixWorld(true);
  const inv = new THREE.Matrix4().copy(node.matrixWorld).invert();
  const geos = [], kept = [], lives = [];
  const walk = (o) => {
    if (o !== node && o.userData.live) { lives.push(o); return; }
    if (o.isMesh) {
      if (o.material.userData.special || o.userData.keep) kept.push(o);
      else {
        const g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
        g.applyMatrix4(_m.multiplyMatrices(inv, o.matrixWorld));
        for (const k of Object.keys(g.attributes)) if (k !== 'position' && k !== 'normal') g.deleteAttribute(k);
        const n = g.attributes.position.count, col = new Float32Array(n * 3);
        _c.copy(o.material.color);
        for (let i = 0; i < n; i++) { col[i * 3] = _c.r; col[i * 3 + 1] = _c.g; col[i * 3 + 2] = _c.b; }
        g.setAttribute('color', new THREE.BufferAttribute(col, 3));
        geos.push(g);
        o.geometry.dispose();
      }
    }
    for (const c of o.children) walk(c);
  };
  walk(node);
  const out = new THREE.Group();
  out.name = node.name; Object.assign(out.userData, node.userData);
  if (geos.length) {
    const g = mergeGeometries(geos, false);
    for (const x of geos) x.dispose();
    out.add(new THREE.Mesh(g, VCOL));
  }
  for (const k of kept) {
    _m.multiplyMatrices(inv, k.matrixWorld);
    const m = new THREE.Mesh(k.geometry, k.material);
    _m.decompose(m.position, m.quaternion, m.scale);
    m.name = k.name; Object.assign(m.userData, k.userData);
    out.add(m);
  }
  for (const l of lives) {
    const rel = new THREE.Matrix4().multiplyMatrices(inv, l.matrixWorld);
    const b = bakeNode(l);
    rel.decompose(b.position, b.quaternion, b.scale);
    out.add(b);
  }
  return out;
}
/** Bake a model into one vertex-coloured mesh (plus special-material meshes and `live` sub-groups). */
export function bake(root) {
  const p = root.position.clone(), q = root.quaternion.clone(), s = root.scale.clone();
  root.position.set(0, 0, 0); root.quaternion.identity(); root.scale.set(1, 1, 1);
  const out = bakeNode(root);
  out.position.copy(p); out.quaternion.copy(q); out.scale.copy(s);
  return out;
}

/** Soft round shadow lying on the ground. */
const SHADOW = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.18, depthWrite: false });
export function blobShadow(r) {
  const g = new THREE.CircleGeometry(r, 16); g.rotateX(-Math.PI / 2);
  const m = new THREE.Mesh(g, SHADOW); m.position.y = 0.03; m.renderOrder = 1;
  return m;
}

/** Free the geometries under an object (materials are shared and cached, so they stay). */
export function disposeTree(o) {
  o.traverse((x) => { if (x.isInstancedMesh) x.dispose(); if (x.geometry) x.geometry.dispose(); });
}
