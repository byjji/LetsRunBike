// Things that move on their own: wind and clouds, birds, butterflies, cheering crowds,
// vehicles, falling petals / snow / leaves and a few one-off animals.
// Each factory: (world, opts) → { update(camS, t, dt) }. Everything is driven by time only.
import * as THREE from 'three';
import { sample, RW } from '../path.js';
import { mat, box, cyl, cone, sphere, dome, beam, prism, at, group, live, bake, WATER_Y } from './kit.js';

const _p = {}, _q = {}, _d = new THREE.Object3D(), _c = new THREE.Color();
const frac = (v) => v - Math.floor(v);
const hash = (i) => frac(Math.sin(i * 127.1 + 3.7) * 43758.5453);
const SHORE = RW + 6;

function instanced(world, model, count, material) {
  const geo = bake(model).children[0].geometry;
  const im = new THREE.InstancedMesh(geo, material || world.swayMaterial(0), count);
  im.frustumCulled = false;
  world.scene.add(im);
  return im;
}

// ------------------------------------------------------------------ wind & clouds
function wind(world) {
  const N = 22, s = 10;
  const puff = group(at(sphere(s, '#ffffff', 8), 0, 0, 0), at(sphere(s * 0.8, '#ffffff', 8), s * 1.1, -s * 0.15, 0), at(sphere(s * 0.7, '#ffffff', 8), -s * 1.1, -s * 0.2, 0), at(sphere(s * 0.75, '#ffffff', 8), s * 0.3, s * 0.5, 0), at(sphere(s * 0.5, '#ffffff', 8), s * 1.9, -s * 0.3, 0));
  const cm = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true, fog: false });
  world.ownMats.push(cm);
  const im = instanced(world, puff, N, cm);
  return {
    update(camS, t) {
      world.wind = Math.min(1, Math.max(0.1, 0.45 + 0.3 * Math.sin(t * 0.23) + 0.2 * Math.sin(t * 0.61 + 1)));
      for (let i = 0; i < N; i++) {
        const a = (i / N) * Math.PI * 2 + hash(i + 5) * 0.2 + t * 0.004, r = 240 + hash(i + 20) * 420, k = 0.7 + hash(i) * 1.5;
        _d.position.set(world.cam.x + Math.sin(a) * r, 80 + hash(i + 40) * 120, world.cam.z + Math.cos(a) * r);
        _d.rotation.set(0, a + Math.PI, 0); _d.scale.set(k, k * 0.55, k); _d.updateMatrix();
        im.setMatrixAt(i, _d.matrix);
      }
      im.instanceMatrix.needsUpdate = true;
    },
  };
}

// ------------------------------------------------------------------ birds
export const BIRD_KINDS = {
  pigeon: { body: '#9aa3b2', wing: '#7d8696', size: 0.5, n: 6, y: 9, flap: 13 },
  gull: { body: '#ffffff', wing: '#d5dbe3', size: 0.75, n: 5, y: 13, flap: 7 },
  magpie: { body: '#2b2f3a', wing: '#f4f4f4', size: 0.55, n: 4, y: 8, flap: 11 },
  kite: { body: '#8a5a3a', wing: '#a8754c', size: 1.3, n: 2, y: 30, flap: 2, circle: true },
};
function bird(k) {
  const wings = [-1, 1].map((s) => { const w = live(group(at(box(1.5, 0.06, 0.6, k.wing), s * 0.75, 0, 0))); w.userData.side = s; return w; });
  const g = bake(group(at(sphere(0.3, k.body, 6), 0, 0, 0, 0, [0.8, 0.8, 1.7]), at(cone(0.08, 0.25, '#ffb33d', 4), 0, -0.02, 0.5).rotateX(Math.PI / 2), ...wings));
  g.scale.setScalar(k.size);
  return { g, wings: g.children.filter((c) => c.userData.side) };
}
function birds(world, opts) {
  const k = BIRD_KINDS[opts.kind] || BIRD_KINDS.pigeon;
  const flock = Array.from({ length: k.n }, () => bird(k));
  for (const b of flock) world.scene.add(b.g);
  const PERIOD = 11;
  return {
    update(camS, t) {
      const cyc = Math.floor(t / PERIOD), u = frac(t / PERIOD), dir = cyc % 2 ? 1 : -1;
      flock.forEach((b, i) => {
        let s, lat, y, yawAdd;
        if (k.circle) {
          const a = t * 0.25 + i * 2.6;
          s = camS + 70 + Math.sin(a) * 35; lat = Math.cos(a) * 40; y = k.y + i * 4; yawAdd = Math.atan2(-Math.sin(a), Math.cos(a));
        } else {
          s = camS + 38 + u * 30 + (i % 3) * 2.2; lat = dir * (-55 + u * 110) + ((i * 1.7) % 4) - 2; y = k.y + Math.sin(t * 1.3 + i) * 0.8 + (i % 2) * 1.2; yawAdd = -dir * 1.25;
        }
        sample(world.path, s, lat, _p);
        b.g.position.set(_p.x, y, _p.z);
        b.g.rotation.y = _p.yaw + yawAdd;
        const f = Math.sin(t * k.flap + i * 1.9) * (k.circle ? 0.18 : 0.75);
        for (const w of b.wings) w.rotation.z = -w.userData.side * f;
      });
    },
  };
}

// ------------------------------------------------------------------ butterflies
function butterflies(world) {
  const cols = ['#ffd23f', '#ffffff', '#ff9fbd', '#8fd0ff', '#ffb26b'];
  const list = Array.from({ length: 10 }, (_, i) => {
    const wings = [-1, 1].map((s) => { const w = live(group(at(box(0.28, 0.02, 0.34, cols[i % 5]), s * 0.14, 0, 0))); w.userData.side = s; return w; });
    const g = bake(group(at(box(0.05, 0.05, 0.3, '#3b3054'), 0, 0, 0), ...wings));
    world.scene.add(g);
    return { g, wings: g.children.filter((c) => c.userData.side), off: hash(i) * 60, lat: (i % 2 ? 1 : -1) * (RW + 0.8 + hash(i + 9) * 5) };
  });
  return {
    update(camS, t) {
      list.forEach((b, i) => {
        const s = camS + ((((b.off - camS) % 60) + 60) % 60) - 4;
        sample(world.path, s + Math.sin(t * 0.7 + i) * 1.5, b.lat + Math.sin(t * 0.9 + i * 2) * 1.2, _p);
        b.g.position.set(_p.x, 1.1 + Math.sin(t * 2.1 + i) * 0.5 + (i % 3) * 0.4, _p.z);
        b.g.rotation.y = _p.yaw + Math.sin(t * 0.8 + i) * 1.2;
        const f = Math.abs(Math.sin(t * 14 + i)) * 1.1;
        for (const w of b.wings) w.rotation.z = w.userData.side * f;
      });
    },
  };
}

// ------------------------------------------------------------------ cheering crowd
const personShirt = () => group(
  at(cyl(0.24, 0.28, 0.65, '#ffffff', 8), 0, 0.58, 0),
  beam([-0.24, 1.15, 0], [-0.52, 1.75, 0.05], 0.065, '#ffffff'), beam([0.24, 1.15, 0], [0.52, 1.75, 0.05], 0.065, '#ffffff'),
);
const personRest = () => group(
  at(cyl(0.11, 0.11, 0.6, '#4a5a78', 6), -0.13, 0, 0), at(cyl(0.11, 0.11, 0.6, '#4a5a78', 6), 0.13, 0, 0),
  at(sphere(0.22, '#ffd9b8', 8), 0, 1.45, 0), at(dome(0.23, '#5a3d2b', 8), 0, 1.48, 0),
  at(sphere(0.08, '#ffd9b8', 6), -0.54, 1.8, 0.05), at(sphere(0.08, '#ffd9b8', 6), 0.54, 1.8, 0.05),
);
function crowd(world) {
  const people = [];
  for (const c of world.layout.crowds) {
    for (let i = 0; i < c.count; i++) {
      const k = people.length;
      people.push({ s: c.s + (i - c.count / 2) * 0.85 + hash(k) * 0.3, lat: c.side * (RW + 1.3 + (i % 2) * 0.95 + hash(k + 5) * 0.3), side: c.side, ph: hash(k + 11) * 6, sc: 0.75 + hash(k + 17) * 0.45 });
    }
  }
  if (!people.length) return { update() {} };
  const im = instanced(world, personShirt(), people.length), im2 = instanced(world, personRest(), people.length);
  const shirts = ['#ff5a7a', '#ffd23f', '#5fd36a', '#59c3ff', '#b08bff', '#ff8a3d', '#ffffff'];
  people.forEach((p, i) => { im.setColorAt(i, _c.set(shirts[i % shirts.length])); im2.setColorAt(i, _c.set('#ffffff')); });
  return {
    update(camS, t) {
      const me = camS;
      people.forEach((p, i) => {
        sample(world.path, p.s, p.lat, _p);
        const near = Math.max(0, 1 - Math.abs(p.s - me - 6) / 22);
        const hop = Math.abs(Math.sin(t * (2.6 + near * 1.4) + p.ph)) * (0.08 + near * 0.32);   // gentle hops, a little more when the rider is near
        _d.position.set(_p.x, hop, _p.z);
        _d.rotation.set(0, _p.yaw + p.side * (Math.PI / 2 + 0.5), Math.sin(t * 3 + p.ph) * 0.08);
        _d.scale.setScalar(p.sc);
        _d.updateMatrix();
        im.setMatrixAt(i, _d.matrix); im2.setMatrixAt(i, _d.matrix);
      });
      im.instanceMatrix.needsUpdate = im2.instanceMatrix.needsUpdate = true;
    },
  };
}

// ------------------------------------------------------------------ vehicles
const wheelsOf = (len, w, r = 0.35) => [-1, 1].flatMap((s) => [-len * 0.32, len * 0.32].map((z) => at(cyl(r, r, 0.25, '#2b2b33', 8).rotateZ(Math.PI / 2), s * w * 0.5 + 0.12, r, z)));
function trainCar(len, body, stripe, nose) {
  const g = group(at(box(2.6, 2.5, len, body), 0, 0.5, 0), at(box(2.66, 0.75, len * 0.9, '#35405a'), 0, 1.7, 0), at(box(2.68, 0.3, len, stripe), 0, 1.05, 0), at(box(2.2, 0.25, len * 0.96, '#c9ced8'), 0, 3.0, 0));
  if (nose) g.add(at(prism([[0, 0], [0, 2.5], [1.6, 2.2], [4.2, 0.5], [4.4, 0]], 2.6, body), 0, 0.5, len / 2, -Math.PI / 2), at(box(2.0, 0.7, 0.1, '#35405a'), 0, 1.9, len / 2 + 1.3).rotateX(-0.9));
  return g;
}
export const MOVER_KINDS = {
  subway: { cars: 5, len: 8, line: 'viaduct', build: (i, n) => trainCar(7.6, '#f1f3f6', ['#3fae5e', '#3b8beb', '#ff8a3d'][n % 3], false) },
  shinkansen: { cars: 6, len: 9, line: 'viaduct', build: (i, n, last) => { const c = trainCar(8.6, '#ffffff', '#2f6fd0', i === 0); if (last) c.add(at(box(2.5, 2.2, 1.2, '#ffffff'), 0, 0.5, -4.6)); return c; } },
  tram: { cars: 2, len: 6.5, line: 'rails', build: () => group(at(box(2.3, 2.4, 6, '#3d9b4f'), 0, 0.4, 0), at(box(2.36, 0.9, 5.4, '#fff3c4'), 0, 1.5, 0), at(box(2.1, 0.2, 5.6, '#e9e4d8'), 0, 2.8, 0), beam([0, 3, 0], [0, 4.2, -0.8], 0.05, '#555')) },
  cablecar: { cars: 1, len: 6, line: 'rails', build: () => group(at(box(2.2, 0.5, 6, '#7a2e22'), 0, 0.4, 0), at(box(2.1, 1.9, 2.6, '#a8322a'), 0, 0.9, 0), at(box(2.16, 0.7, 2.2, '#fff3c4'), 0, 1.7, 0), at(box(2.3, 0.22, 6.2, '#f4ecd6'), 0, 3.0, 0),
    ...[-1, 1].flatMap((s) => [-2.6, -1.5, 1.5, 2.6].map((z) => at(cyl(0.05, 0.05, 2.1, '#d8b24a', 5), s * 1.05, 0.9, z)))) },
  taxi: { cars: 1, len: 4.2, line: 'road', build: () => group(at(box(1.8, 0.75, 4, '#ffd21f'), 0, 0.35, 0), at(box(1.6, 0.65, 2.1, '#ffd21f'), 0, 1.1, -0.2), at(box(1.64, 0.45, 1.9, '#35405a'), 0, 1.18, -0.2), at(box(0.6, 0.2, 0.3, '#ffffff'), 0, 1.75, -0.2), ...wheelsOf(4, 1.8)) },
  boat: { cars: 1, len: 6, line: 'water', build: () => group(at(prism([[-1.1, 1], [1.1, 1], [0.7, 0], [-0.7, 0]], 5, '#ffffff'), 0, -0.2, 0), at(box(1.3, 1, 1.8, '#ff8a3d'), 0, 0.8, -0.6), beam([0, 0.8, 0.9], [0, 3.6, 0.9], 0.05, '#7a5a3a'), at(prism([[0, 0], [0, 2.4], [1.8, 0]], 0.05, '#fff7e0'), 0, 1.1, 0.95, Math.PI / 2)) },
  ferry: { cars: 1, len: 18, line: 'water', build: () => group(at(prism([[-3, 2], [3, 2], [2.3, 0], [-2.3, 0]], 18, '#ffffff'), 0, -0.3, 0), at(box(4.6, 1.8, 11, '#f4f1ea'), 0, 1.7, -0.5), at(box(4.7, 0.6, 10.4, '#3b8beb'), 0, 2.3, -0.5), at(box(3, 1.4, 5, '#ffffff'), 0, 3.5, 0), at(cyl(0.6, 0.7, 2, '#ff5a4d', 8), 0, 4.9, -1)) },
  cruise: { cars: 1, len: 14, line: 'water', build: () => group(at(prism([[-2.4, 1.4], [2.4, 1.4], [1.9, 0], [-1.9, 0]], 14, '#ffffff'), 0, -0.2, 0), at(box(3.8, 1.5, 9, '#bfe2f5'), 0, 1.2, 0), at(box(4, 0.25, 9.6, '#3b8beb'), 0, 2.7, 0), at(box(0.1, 1, 0.1, '#888'), 0, 2.9, 4)) },
  srt: { cars: 6, len: 9, line: 'viaduct', build: (i, n, last) => { const c = trainCar(8.6, '#f4f4f6', '#7a2a5c', i === 0); c.add(at(box(2.68, 0.18, 8.6, '#c9a46a'), 0, 1.4, 0)); if (last) c.add(at(box(2.5, 2.2, 1.2, '#f4f4f6'), 0, 0.5, -4.6)); return c; } },
  duckboat: { cars: 1, len: 4, line: 'water', build: () => group(at(box(2.4, 0.9, 3.6, '#ffffff'), 0, 0, 0), at(box(2.5, 0.2, 3.7, '#ffd23f'), 0, 0.9, 0), at(cyl(1.1, 1.1, 0.12, '#59c3ff', 10), 0, 2.3, -0.3),
    beam([-1, 0.9, -1.2], [-1, 2.3, -0.3], 0.06, '#dddddd'), beam([1, 0.9, -1.2], [1, 2.3, -0.3], 0.06, '#dddddd'), at(cyl(0.35, 0.45, 1.4, '#ffd23f', 8), 0, 0.9, 1.6), at(sphere(0.6, '#ffd23f', 8), 0, 2.5, 1.8), at(cone(0.22, 0.6, '#ff8a3d', 6), 0, 2.4, 2.4).rotateX(Math.PI / 2)) },
  gondola: { cars: 4, len: 14, line: 'cable', build: () => group(at(box(1.5, 1.5, 1.7, '#ff5a7a'), 0, -2.3, 0), at(box(1.54, 0.6, 1.5, '#dff3ff'), 0, -1.6, 0), beam([0, -0.8, 0], [0, 0, 0], 0.05, '#555')) },
};
const LINES = {
  viaduct: { step: 12, y: 6, build: () => group(at(box(4.2, 0.7, 12.2, '#cfd3da'), 0, 5.3, 0), at(box(0.25, 0.8, 12.2, '#b9bec8'), -2, 6, 0), at(box(0.25, 0.8, 12.2, '#b9bec8'), 2, 6, 0), at(cyl(0.7, 0.9, 5.3, '#bfc4cd', 8), 0, 0, 0)) },
  rails: { step: 6, y: 0, build: () => group(at(box(3, 0.04, 6.1, '#8f949e'), 0, 0.02, 0), at(box(0.1, 0.1, 6.1, '#5a5f6b'), -0.7, 0.03, 0), at(box(0.1, 0.1, 6.1, '#5a5f6b'), 0.7, 0.03, 0)) },
  road: { step: 6, y: 0, build: () => group(at(box(3.2, 0.04, 6.1, '#8a8e98'), 0, 0.02, 0), at(box(0.12, 0.05, 2.4, '#ffffff'), -1.45, 0.03, 0)) },
  cable: { step: 30, y: 0, build: (y) => group(at(box(0.08, 0.08, 30.2, '#555a66'), 0, y, 0), beam([-1.2, 0, 0], [0, y + 0.6, 0], 0.18, '#aeb4bf'), beam([1.2, 0, 0], [0, y + 0.6, 0], 0.18, '#aeb4bf')) },
  water: null,
};
function mover(world, opts) {
  const k = MOVER_KINDS[opts.kind];
  const n = world.path.n, cross = opts.onlyThrough ? world.layout.landmarks.find((m) => m.def.id === opts.onlyThrough) : null;
  if (opts.onlyThrough && !cross) return { update() {} };
  const line = LINES[k.line];
  // ground lanes stop where the road goes through a gate or over a bridge
  const blocked = (s) => baseY === 0 && world.layout.landmarks.some((m) => m.def.through && Math.abs(s - m.s) < m.span / 2 + 8);
  const baseY = k.line === 'water' ? WATER_Y : k.line === 'cable' ? (opts.y || 14) : line.y;
  if (line && !cross) {
    const count = Math.floor(n / line.step);
    const im = instanced(world, line.build(baseY), count);
    for (let i = 0; i < count; i++) {
      sample(world.path, (i + 0.5) * line.step, opts.lateral, _p);
      _d.position.set(_p.x, 0, _p.z); _d.rotation.set(0, _p.yaw, 0); _d.scale.setScalar(blocked((i + 0.5) * line.step) ? 0.0001 : 1); _d.updateMatrix();
      im.setMatrixAt(i, _d.matrix); im.setColorAt(i, _c.set('#ffffff'));
    }
    im.frustumCulled = false;
  }
  const cars = Array.from({ length: k.cars }, (_, i) => { const c = bake(k.build(i, Math.floor(hash(opts.lateral) * 3), i === k.cars - 1)); world.scene.add(c); return c; });
  return {
    update(camS, t) {
      const cyc = Math.floor(t / opts.period + hash(opts.lateral)), u = frac(t / opts.period + hash(opts.lateral));
      if (cross) {
        const dir = cyc % 2 ? 1 : -1, lat = dir * (-170 + u * 340);
        sample(world.path, cross.s + Math.sin(cyc * 2.1) * (cross.span / 2 - 10), lat, _p);
        cars[0].position.set(_p.x, baseY + Math.sin(t * 1.5) * 0.08, _p.z);
        cars[0].rotation.y = _p.yaw - dir * Math.PI / 2;
        return;
      }
      // overtakes from behind on even cycles, comes toward the rider on odd ones
      const oncoming = k.line !== 'cable' && cyc % 2 === 1;
      const reach = Math.max(260, opts.speed * opts.period * 0.5);
      const head = camS + (oncoming ? reach - u * (reach + 60) : -50 + u * (reach + 50));
      cars.forEach((c, i) => {
        const s = head - (oncoming ? -1 : 1) * i * k.len;
        if (s < 1 || s > n - 1 || blocked(s)) { c.visible = false; return; }
        c.visible = true;
        sample(world.path, s, opts.lateral, _p);
        c.position.set(_p.x, baseY + (k.line === 'water' ? Math.sin(t * 1.5 + i) * 0.08 : 0), _p.z);
        c.rotation.y = _p.yaw + (oncoming ? Math.PI : 0);
      });
    },
  };
}

// ------------------------------------------------------------------ falling petals / snow / leaves
export const PARTICLE_KINDS = {
  petal: { color: '#ffc1d8', n: 160, fall: 1.3, size: 0.22, drift: 1.6 },
  snow: { color: '#ffffff', n: 320, fall: 2.2, size: 0.2, drift: 0.8 },
  leaf: { color: '#ffa53d', n: 110, fall: 1.6, size: 0.26, drift: 2.2 },
};
function particles(world, opts) {
  const k = PARTICLE_KINDS[opts.kind], R = 34, H = 20;
  const geo = new THREE.BufferGeometry(), pos = new Float32Array(k.n * 3);
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const m = new THREE.PointsMaterial({ color: k.color, size: k.size, sizeAttenuation: true });
  world.ownMats.push(m);
  const pts = new THREE.Points(geo, m); pts.frustumCulled = false;
  world.scene.add(pts);
  const wrap = (v, c) => ((((v - c) % (2 * R)) + 3 * R) % (2 * R)) - R + c;
  return {
    update(camS, t) {
      const cx = world.cam.x, cz = world.cam.z;
      for (let i = 0; i < k.n; i++) {
        const sway = Math.sin(t * 1.3 + i) * 0.8;
        pos[i * 3] = wrap(hash(i) * 2 * R + t * k.drift * (0.4 + world.wind) + sway, cx);
        pos[i * 3 + 1] = H - frac(hash(i + 100) + (t * k.fall * (0.7 + hash(i + 200) * 0.6)) / H) * H;
        pos[i * 3 + 2] = wrap(hash(i + 300) * 2 * R + Math.cos(t * 1.1 + i) * 0.6, cz);
        // never right in front of the lens, where a flake would fill the screen
        if (Math.abs(pos[i * 3] - cx) < 7 && Math.abs(pos[i * 3 + 2] - cz) < 7) pos[i * 3 + 1] = -50;
      }
      geo.attributes.position.needsUpdate = true;
    },
  };
}

// ------------------------------------------------------------------ one-off things
const waterSide = (world) => (world.city.sides.left === 'water' ? -1 : world.city.sides.right === 'water' ? 1 : 0);
const spots = (world, fr) => fr.map((f) => world.track.start + world.track.units * f);
export const FLOATER_KINDS = {
  /** white foam lines sliding toward the shore */
  waves(world) {
    const side = waterSide(world); if (!side) return { update() {} };
    const N = 26, im = instanced(world, group(at(box(0.5, 0.06, 7, '#ffffff'), 0, 0, 0)), N);
    for (let i = 0; i < N; i++) im.setColorAt(i, _c.set('#ffffff'));
    return {
      update(camS, t) {
        for (let i = 0; i < N; i++) {
          const u = frac(hash(i) + t * 0.05), s = camS - 20 + ((((hash(i + 50) * 200 - camS) % 200) + 200) % 200);
          sample(world.path, s, side * (SHORE + 3 + (1 - u) * (20 + hash(i + 7) * 90)), _p);
          _d.position.set(_p.x, WATER_Y + 0.02, _p.z); _d.rotation.set(0, _p.yaw, 0); _d.scale.set(1, 1, 0.6 + Math.sin(u * Math.PI) * 0.9); _d.updateMatrix();
          im.setMatrixAt(i, _d.matrix);
        }
        im.instanceMatrix.needsUpdate = true;
      },
    };
  },
  /** tethered sightseeing balloon */
  balloon(world, o) {
    const g = bake(group(at(sphere(7, '#ffffff', 12), 0, 0, 0, 0, [1, 1.1, 1]), at(cyl(7.02, 7.02, 2.4, '#ff5a7a', 12), 0, -1.2, 0), at(cyl(5.6, 5.6, 1.2, '#ffd23f', 12), 0, 3.6, 0), at(cyl(1.6, 1.3, 1.6, '#a8703f', 8), 0, -11, 0), beam([0, -9.5, 0], [0, -7, 0], 0.4, '#e8e2d2'), beam([0, -11, 0], [0, -11 - (o.y || 40), 0], 0.06, '#666')));
    world.scene.add(g);
    sample(world.path, world.track.start + world.track.units * 0.5, o.lateral || 40, _q);
    const x = _q.x, z = _q.z;
    return { update(camS, t) { g.position.set(x + Math.sin(t * 0.3) * 2, (o.y || 40) + Math.sin(t * 0.5) * 1.5, z); g.rotation.y = t * 0.05; } };
  },
  /** whale surfacing and spouting out at sea */
  whale(world, o) {
    const spout = live(group(at(cone(0.5, 3, '#ffffff', 6), 0, 0, 0).rotateX(Math.PI), at(sphere(0.8, '#ffffff', 6), 0, 3.2, 0)));
    spout.position.set(0, 1.9, 2);
    const g = bake(group(at(sphere(2.2, '#3f5f8f', 10), 0, 0, 0, 0, [1, 0.85, 2.6]), at(sphere(1.6, '#e9eef5', 8), 0, -0.7, 0.8, 0, [0.9, 0.5, 2.2]), at(prism([[-1.8, 0], [0, 0.4], [1.8, 0], [0, 1.2]], 0.3, '#3f5f8f').rotateX(-Math.PI / 2), 0, 0.2, -5.8), spout));
    const sp = g.children.find((c) => c.userData.live);
    world.scene.add(g);
    const PERIOD = 9;
    return {
      update(camS, t) {
        const cyc = Math.floor(t / PERIOD), u = frac(t / PERIOD);
        sample(world.path, camS + 55 + (cyc % 3) * 18 + u * 6, o.lateral + (cyc % 2) * 14, _p);
        const up = Math.sin(Math.min(1, u * 1.6) * Math.PI);
        g.position.set(_p.x, WATER_Y - 2.6 + up * 2.8, _p.z);
        g.rotation.set(-0.5 + up * 0.5 + u * 0.4, _p.yaw, 0);
        sp.scale.setScalar(u > 0.25 && u < 0.6 ? Math.sin(((u - 0.25) / 0.35) * Math.PI) : 0.001);
      },
    };
  },
  /** kites flying over the fields */
  kiteflyer(world, o) {
    const list = spots(world, [0.15, 0.45, 0.72]).map((s, i) => {
      const g = bake(group(at(prism([[0, 1.3], [0.9, 0], [0, -1.6], [-0.9, 0]], 0.05, ['#ff5a7a', '#59c3ff', '#ffd23f'][i]), 0, 0, 0), beam([0, -1.6, 0], [0.3, -3.4, 0], 0.04, '#ffffff', 4), beam([0.3, -3.4, 0], [-0.2, -5, 0], 0.04, '#ffffff', 4)));
      world.scene.add(g);
      sample(world.path, s, (o.lateral || -14) * (i % 2 ? -1 : 1), _q);
      return { g, x: _q.x, z: _q.z, yaw: _q.yaw };
    });
    return { update(camS, t) { list.forEach((k, i) => { k.g.position.set(k.x + Math.sin(t * 0.7 + i * 2) * 2.5, 15 + Math.sin(t * 1.1 + i) * 1.5 + i * 2, k.z); k.g.rotation.set(0.5, k.yaw + Math.PI, Math.sin(t * 1.4 + i) * 0.3); }); } };
  },
  /** sea lions sunning on rocks at the shore */
  sealion(world, o) {
    const list = spots(world, [0.12, 0.3, 0.5, 0.7]).map((s) => {
      const head = live(group(at(sphere(0.34, '#8a6a4a', 8), 0, 0.7, 0.2), at(sphere(0.12, '#6e5238', 6), 0, 0.66, 0.5), beam([0, 0, 0], [0, 0.6, 0.15], 0.24, '#8a6a4a')));
      head.position.set(0, 0.95, 0.7);
      const g = bake(group(at(sphere(1.6, '#9c9a92', 7), 0, 0.2, 0, 0, [1.4, 0.55, 1.2]), at(sphere(0.55, '#8a6a4a', 8), 0, 0.95, 0, 0, [0.9, 0.75, 1.9]), at(box(0.7, 0.1, 0.5, '#6e5238'), 0, 0.72, -1.1), head));
      world.place(g, s, o.lateral || 9, -1.2);
      world.scene.add(g);
      return g.children.find((c) => c.userData.live);
    });
    return { update(camS, t) { list.forEach((h, i) => { h.rotation.x = -0.25 + Math.sin(t * 1.6 + i * 2) * 0.3; h.rotation.y = Math.sin(t * 0.9 + i) * 0.5; }); } };
  },
  /** ski jumper taking off from the big hill */
  skijumper(world) {
    const lm = world.layout.landmarks.find((m) => m.def.id === 'sapporo_skijump'); if (!lm) return { update() {} };
    const g = bake(group(at(box(0.25, 0.08, 3.2, '#ffd23f'), -0.25, 0, 0.4), at(box(0.25, 0.08, 3.2, '#ffd23f'), 0.25, 0, 0.4), at(sphere(0.5, '#ff5a7a', 7), 0, 0.7, 0.3, 0, [0.8, 0.7, 1.9]), at(sphere(0.3, '#3b8beb', 7), 0, 0.95, 1.5)));
    world.scene.add(g);
    sample(world.path, lm.s, lm.lateral, _q); const fx = _q.x, fz = _q.z;
    sample(world.path, lm.s, lm.lateral * 0.42, _q); const tx = _q.x, tz = _q.z;
    const PERIOD = 7;
    return {
      update(camS, t) {
        const u = frac(t / PERIOD);
        if (u > 0.5) { g.visible = false; return; }
        g.visible = true;
        const v = u / 0.5, top = lm.def.h * 0.55;
        g.position.set(fx + (tx - fx) * v, 2 + top * (1 - v) * (1 - v) + Math.sin(v * Math.PI) * 4, fz + (tz - fz) * v);
        g.lookAt(tx, 2, tz); g.rotateX(0.2);
      },
    };
  },
  /** music fountain on the lake the road crosses: jets rise and fall in waves */
  fountain(world) {
    const lm = world.layout.landmarks.find((m) => m.def.id === 'dongtan_lakepark'); if (!lm) return { update() {} };
    const jets = [];
    for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; jets.push({ s: lm.s + Math.sin(a) * 9 * Math.min(1, lm.span / 22), lat: -(30 + Math.cos(a) * 9), k: i }); }
    jets.push({ s: lm.s, lat: -30, k: 12, big: true });
    for (let i = 0; i < 6; i++) jets.push({ s: lm.s + (i - 2.5) * Math.min(5, lm.span / 8), lat: 20 + (i % 2) * 4, k: 13 + i });
    const im = instanced(world, group(at(cyl(0.18, 0.55, 1, '#e8f7ff', 7), 0, 0, 0), at(sphere(0.6, '#ffffff', 7), 0, 1, 0, 0, [1, 0.3, 1])), jets.length);
    jets.forEach((j, i) => im.setColorAt(i, _c.set('#ffffff')));
    return {
      update(camS, t) {
        const beat = Math.floor(t / 4) % 3;
        jets.forEach((j, i) => {
          const wave = beat === 0 ? Math.sin(t * 2.2 + j.k * 0.52) : beat === 1 ? Math.sin(t * 3) * (j.k % 2 ? 1 : -1) : Math.sin(t * 1.4);
          const h = (j.big ? 9 : 3) + (j.big ? 9 : 5) * (0.5 + 0.5 * wave);
          sample(world.path, j.s, j.lat, _p);
          _d.position.set(_p.x, WATER_Y, _p.z); _d.rotation.set(0, 0, 0); _d.scale.set(1, h, 1); _d.updateMatrix();
          im.setMatrixAt(i, _d.matrix);
        });
        im.instanceMatrix.needsUpdate = true;
      },
    };
  },
  /** koi ponds beside the road */
  koi(world, o) {
    const fish = [];
    for (const s of spots(world, [0.1, 0.32, 0.5, 0.74])) {
      const pond = bake(group(at(cyl(3, 3, 0.06, '#4fb3e8', 14), 0, 0.02, 0), ...[0, 1, 2, 3, 4, 5].map((i) => at(sphere(0.4, '#a9a69b', 6), Math.cos(i * 1.05) * 3.1, 0.1, Math.sin(i * 1.05) * 3.1, 0, [1, 0.6, 1]))));
      world.place(pond, s, o.lateral || -9);
      world.scene.add(pond);
      for (let i = 0; i < 4; i++) {
        const f = bake(group(at(sphere(0.2, ['#ff7a2e', '#ffffff', '#ffb26b', '#ff5a3d'][i], 6), 0, 0, 0, 0, [0.7, 0.4, 2]), at(prism([[0, 0], [0.25, -0.25], [-0.25, -0.25]], 0.04, '#ff7a2e').rotateX(Math.PI / 2), 0, 0, -0.45)));
        pond.add(f); fish.push({ f, r: 1 + i * 0.5, ph: i * 1.7 });
      }
    }
    return { update(camS, t) { for (const k of fish) { const a = t * (0.5 + k.r * 0.1) * (k.ph % 2 > 1 ? 1 : -1) + k.ph; k.f.position.set(Math.cos(a) * k.r, 0.1, Math.sin(a) * k.r); k.f.rotation.y = -a + (k.ph % 2 > 1 ? 0 : Math.PI); } } };
  },
};
const floater = (world, opts) => FLOATER_KINDS[opts.kind](world, opts);

export const AMBIENT = { wind, birds, butterflies, crowd, mover, particles, floater };
