// Animal riders on balance bikes, and the stars they collect.
import * as THREE from 'three';
import { mat, box, cone, sphere, dome, beam, at, group, live, bake, blobShadow } from './kit.js';

const TYRE = '#3a3442', RIM = '#f4f1ea', DARK = '#2b2238';

function wheel() {
  const g = group();
  const tyre = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.07, 6, 14), mat(TYRE)); tyre.rotation.y = Math.PI / 2; g.add(tyre);
  for (let i = 0; i < 3; i++) { const s = box(0.04, 0.48, 0.05, RIM); s.position.y = -0.24; const h = group(s); h.rotation.x = (i * Math.PI) / 3; g.add(h); }
  return g;
}

function ears(ch) {
  const out = [], y = 1.52;
  for (const s of [-1, 1]) {
    if (ch.ear === 'long') { const e = at(sphere(0.1, ch.fur), s * 0.14, y + 0.52, -0.02, 0, [0.8, 2.6, 0.6]); e.rotation.z = -s * 0.15; out.push(e); }
    else if (ch.ear === 'round') out.push(at(sphere(0.12, ch.fur), s * 0.26, y + 0.22, -0.02));
    else if (ch.ear === 'pointy') { const e = at(cone(0.11, 0.26, ch.fur, 4), s * 0.2, y + 0.2, -0.02); e.rotation.z = -s * 0.25; out.push(e); }
    else if (ch.ear === 'floppy') out.push(at(sphere(0.11, '#b07a4a'), s * 0.33, y - 0.12, -0.02, 0, [0.6, 1.6, 0.9]));
  }
  if (ch.ear === 'spikes') for (let i = 0; i < 4; i++) out.push(at(cone(0.07, 0.2, '#3d9e4c', 4), 0, y + 0.26 - i * 0.14, -0.1 - i * 0.1));
  if (ch.ear === 'tuft') for (let i = -1; i <= 1; i++) { const e = at(cone(0.04, 0.2, '#ffb33d', 4), i * 0.06, y + 0.3, 0); e.rotation.z = -i * 0.4; out.push(e); }
  return out;
}

/** ch: character from sprites.js (fur / helmet / shirt / ear). Origin on the ground between the wheels, front = +z. */
export function buildRider(ch) {
  const body = group(
    // bike
    beam([0, 0.32, -0.42], [0, 0.6, 0.1], 0.05, ch.helmet), beam([0, 0.6, 0.1], [0, 0.32, 0.5], 0.05, ch.helmet),
    beam([0, 0.32, 0.5], [0, 1.0, 0.42], 0.04, '#d8d8e0'), beam([-0.3, 1.0, 0.42], [0.3, 1.0, 0.42], 0.04, TYRE),
    at(box(0.2, 0.07, 0.34, TYRE), 0, 0.62, -0.16),
    // rider
    at(sphere(0.3, ch.shirt), 0, 0.98, -0.12, 0, [0.95, 1.2, 0.85]),
    at(sphere(0.31, ch.fur, 12), 0, 1.5, -0.02),
    at(dome(0.34, ch.helmet), 0, 1.5, -0.02),
    at(box(0.07, 0.03, 0.5, '#ffffff'), 0, 1.83, -0.02),
    beam([-0.24, 1.12, -0.04], [-0.28, 1.0, 0.4], 0.055, ch.fur), beam([0.24, 1.12, -0.04], [0.28, 1.0, 0.4], 0.055, ch.fur),
    at(sphere(0.045, DARK, 6), -0.12, 1.5, 0.27), at(sphere(0.045, DARK, 6), 0.12, 1.5, 0.27),
    ...ears(ch),
  );
  if (ch.id === 'chick' || ch.id === 'penguin') { const b = at(cone(0.06, 0.14, '#ff9f1c', 4), 0, 1.4, 0.3); b.rotation.x = Math.PI / 2; body.add(b); }
  if (ch.id === 'penguin') body.add(at(sphere(0.22, '#ffffff'), 0, 0.98, 0.04, 0, [0.9, 1.1, 0.6]));
  if (['bunny', 'bear'].includes(ch.id)) body.add(at(sphere(0.09, '#ffffff'), 0, 0.8, -0.4));
  if (['cat', 'dog', 'fox', 'dino'].includes(ch.id)) body.add(beam([0, 0.8, -0.34], [0, 1.05, -0.62], ch.id === 'dino' ? 0.07 : 0.045, ch.fur));

  const legs = [-1, 1].map((s) => {
    const l = live(group(beam([0, 0, 0], [0, -0.5, 0.06], 0.065, ch.fur), at(box(0.12, 0.08, 0.22, RIM), 0, -0.58, 0.1)));
    l.position.set(s * 0.19, 0.74, -0.14);
    return l;
  });
  const wheels = [-0.42, 0.5].map((z) => { const w = live(wheel()); w.position.set(0, 0.32, z); return w; });

  const baked = bake(group(body, ...legs, ...wheels));
  const [legL, legR, wheelR, wheelF] = baked.children.slice(-4);
  const lean = group(baked);
  const g = group(lean, blobShadow(0.55));
  g.scale.setScalar(0.9);
  return {
    group: g,
    /** phase grows with distance; leanRad positive = into a left turn; speed in m/s */
    update(phase, leanRad, speed) {
      const k = Math.min(1, speed / 0.6);
      legL.rotation.x = Math.sin(phase) * 0.7 * k;
      legR.rotation.x = Math.sin(phase + Math.PI) * 0.7 * k;
      wheelR.rotation.x = wheelF.rotation.x = phase * 1.4;
      lean.rotation.z = -leanRad;
      lean.position.y = Math.abs(Math.sin(phase)) * 0.03 * k;
    },
  };
}

/** Collectable star, about 0.9 across, centred on the origin. */
export function buildStar() {
  const pts = [];
  for (let i = 0; i < 10; i++) { const r = i % 2 ? 0.2 : 0.46, a = (i * Math.PI) / 5 + Math.PI / 2; pts.push(new THREE.Vector2(Math.cos(a) * r, Math.sin(a) * r)); }
  const g = new THREE.ExtrudeGeometry(new THREE.Shape(pts), { depth: 0.14, bevelEnabled: false });
  g.translate(0, 0, -0.07);
  return new THREE.Mesh(g, mat('#ffd23f', { emissive: '#b37a00' }));
}
