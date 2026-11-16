// Where things stand along the road. Pure and deterministic: same city + track + seed → same layout
// on every screen, so friends in a room see the same world.
import { RW, buildPath, sample } from './path.js';
import { spanOf } from './cities.js';

function rng(seed) {
  let a = (seed ^ 0x51ed270b) >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SHORE = RW + 6;          // on a 'water' side the sea starts here
const GATE_CLEAR = 6;

/** Radius around a beside-the-road landmark that stays free of roadside props. */
export const keepOut = (def) => Math.max(10, Math.min(def.offset - 2.5, def.h * 0.6));

export function layoutCity(city, track, lengthUnits, seed) {
  const r = rng(seed);
  const total = track.segs.length;

  // landmarks: fixed positions (the track is straightened there); drop the ones that do not fit
  const landmarks = [];
  let prevEnd = -Infinity;
  for (const def of city.landmarks) {
    const s = track.start + Math.round(def.at * lengthUnits), span = spanOf(def, lengthUnits);
    const half = Math.max(span / 2, 10);
    if (s - half < prevEnd) continue;
    if (def.through && (s - span / 2 <= track.start + GATE_CLEAR || s + span / 2 >= track.finish - GATE_CLEAR)) continue;
    landmarks.push({ def, s, lateral: def.side * (RW + def.offset), span });
    prevEnd = s + half;
  }
  const throughs = landmarks.filter((m) => m.def.through);
  const besides = landmarks.filter((m) => !m.def.through);
  const inThrough = (s, pad) => throughs.some((m) => Math.abs(s - m.s) <= m.span / 2 + pad);
  const isWater = (side) => city.sides[side < 0 ? 'left' : 'right'] === 'water';

  // roadside props (kept off the lanes that trains, trams and boats travel along)
  const lanes = city.ambient.filter((a) => a.type === 'mover' && !a.onlyThrough).map((a) => a.lateral);
  const props = [];
  const path = buildPath(track.segs), far = [], o = {};   // far props are checked in world space: on bends the land folds over itself
  for (let i = 0; i < total; i++) {
    for (const rule of city.roadside) {
      if (r() >= rule.p) continue;
      const side = rule.side || (r() < 0.5 ? -1 : 1);
      const n = rule.n[Math.floor(r() * rule.n.length)];
      const dist = RW + rule.min + r() * (rule.max - rule.min);
      const s = i + r(), rot = r() * Math.PI * 2, scale = 0.85 + r() * 0.35;
      if (dist < RW + 1) continue;
      if (isWater(side) && dist > SHORE) continue;
      if (inThrough(s, 2)) continue;
      if (Math.abs(s - track.start) < 2.5 || Math.abs(s - track.finish) < 2.5) { if (dist < RW + 3) continue; }
      const lateral = side * dist;
      if (besides.some((m) => Math.hypot(s - m.s, lateral - m.lateral) < keepOut(m.def))) continue;
      // footprint: far-off rules are buildings, near ones are trees and small things
      const rad = rule.r ?? (rule.min >= 20 ? 9 : rule.min >= 8 ? 5.5 : rule.min >= 2 ? 1.6 : 0.6);
      if (lanes.some((l) => Math.abs(lateral - l) < 2.6 + rad)) continue;
      let clash = false;
      for (let k = props.length - 1; k >= 0 && s - props[k].s < 20; k--) {
        const q = props[k];
        if (Math.hypot(s - q.s, lateral - q.lateral) < rad + q.r) { clash = true; break; }
      }
      if (clash) continue;
      const k = rule.scale || 1;
      if (dist >= 24) {
        sample(path, s, lateral, o);
        const x = o.x, z = o.z, lo = Math.max(0, Math.floor(s - dist * 2.2)), hi = Math.min(path.n, Math.ceil(s + dist * 2.2));
        let bad = false;
        for (let j = lo; j <= hi && !bad; j++) bad = Math.hypot(x - path.x[j], z - path.z[j]) < Math.min(dist - 1, RW + 9 + rad);
        for (let j = far.length - 1; j >= 0 && !bad; j--) bad = Math.hypot(x - far[j].x, z - far[j].z) < rad + far[j].r;
        if (bad) continue;
        far.push({ x, z, r: rad });
      }
      props.push(k === 1 ? { n, s, lateral, rot, scale, r: rad } : { n, s, lateral, rot, scale, r: rad, k });
    }
  }

  // cheering crowds: at the gates, in front of each landmark, and every ~60 units
  const crowds = [];
  const crowd = (s, side) => {
    if (s < 2 || s > total - 2 || inThrough(s, 3)) return;
    crowds.push({ s, side, count: 3 + Math.floor(r() * 6) });
  };
  for (const side of [-1, 1]) { crowd(track.start + 5, side); crowd(track.finish - 4, side); crowd(track.finish + 7, side); }
  for (const m of landmarks) {
    if (m.def.through) { crowd(m.s - m.span / 2 - 7, -1); crowd(m.s - m.span / 2 - 7, 1); } else crowd(m.s - 9, -m.def.side);
  }
  for (let s = track.start + 35, k = 0; s < track.finish - 20; s += 50 + r() * 20, k++) crowd(s, k % 2 ? 1 : -1);

  // 100 m signs
  const signs = [];
  const upm = lengthUnits / track.lengthM;
  for (let m = 100; m < track.lengthM; m += 100) signs.push({ s: track.start + Math.round(m * upm), label: `${m}m` });

  return { landmarks, props, crowds, signs, gates: { start: track.start, finish: track.finish } };
}
