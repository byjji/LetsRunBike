// Reusable architectural pieces shared by roadside props and landmarks.
import { box, cyl, prism, beam, at, group } from './kit.js';

/**
 * East-Asian tiled roof with flared, upturned eaves. Ridge runs along z by default (axis 'z'),
 * w = full width across the slope direction, d = length along the ridge, h = height.
 */
export function tileRoof(w, d, h, color, { lift = 0.2, axis = 'z', ridge = '#3c3f47' } = {}) {
  const W = w / 2, pts = [];
  const N = 6;
  for (let i = 0; i <= 2 * N; i++) {
    const f = Math.abs(i - N) / N, x = ((i - N) / N) * W;
    pts.push([x, h * ((1 - f) ** 1.6) + lift * h * f ** 4 + 0.06 * h]);
  }
  pts.push([W * 0.94, 0], [-W * 0.94, 0]);
  const g = group(prism(pts, d, color), at(box(Math.max(0.25, w * 0.05), h * 0.12, d * 1.02, ridge), 0, h * 1.02, 0));
  if (axis !== 'x') return g;
  g.rotation.y = Math.PI / 2;
  return group(g);
}

/** Plain gable roof (ridge along z). */
export function gableRoof(w, d, h, color, over = 0.3) {
  return prism([[-w / 2 - over, 0], [0, h], [w / 2 + over, 0]], d + over * 2, color);
}

/** Horizontal window bands on all four sides of a box-shaped building centred on the origin. */
export function windowBands(w, d, y0, floorH, floors, color, inset = 0.12) {
  const out = [];
  for (let f = 0; f < floors; f++) {
    const y = y0 + f * floorH;
    out.push(at(box(w * 0.86, floorH * 0.45, d + inset, color), 0, y, 0), at(box(w + inset, floorH * 0.45, d * 0.86, color), 0, y, 0));
  }
  return out;
}

/** Row of round columns along x. */
export function columns(n, span, r, h, color, z = 0, y = 0) {
  const out = [];
  for (let i = 0; i < n; i++) out.push(at(cyl(r, r, h, color, 8), n === 1 ? 0 : -span / 2 + (span * i) / (n - 1), y, z));
  return out;
}

/** Korean / Japanese hall: stone base, columns, wall, tiled roof with ridge along x. Front faces +z. */
export function hall(w, d, wallH, roofH, { base = 0.5, wall = '#f3ead8', col = '#b5372e', roof = '#4a4e57', baseCol = '#cfc9bd', band = null, cols = 5 } = {}) {
  const g = group(
    at(box(w + 1.2, base, d + 1.2, baseCol), 0, 0, 0),
    at(box(w * 0.94, wallH, d * 0.9, wall), 0, base, 0),
    ...columns(cols, w, 0.16 + w * 0.008, wallH, col, d / 2, base), ...columns(cols, w, 0.16 + w * 0.008, wallH, col, -d / 2, base),
    at(tileRoof(d + 2.4, w + 2.6, roofH, roof, { axis: 'x' }), 0, base + wallH + (band ? 0.4 : 0), 0),
  );
  if (band) g.add(at(box(w + 0.3, 0.4, d + 0.3, band), 0, base + wallH, 0));
  return g;
}

/**
 * Wall (in the x-y plane, `depth` thick) with arched gateways cut into it.
 * openings: [{ x, w, h }] — centre, width and total height (rectangular up to h - w/2, round above).
 */
export function archWall(w, h, depth, color, openings) {
  const pts = [[-w / 2, 0]];
  for (const o of [...openings].sort((a, b) => a.x - b.x)) {
    const r = o.w / 2, sy = Math.max(0, o.h - r);
    pts.push([o.x - r, 0], [o.x - r, sy]);
    for (let i = 1; i < 8; i++) { const a = Math.PI - (i * Math.PI) / 8; pts.push([o.x + Math.cos(a) * r, sy + Math.sin(a) * (o.h - sy)]); }
    pts.push([o.x + r, sy], [o.x + r, 0]);
  }
  pts.push([w / 2, 0], [w / 2, h], [-w / 2, h]);
  return prism(pts, depth, color);
}

/** Crenellated parapet (여장) along x. */
export function parapet(w, color, y, z, h = 0.9, step = 1.6) {
  const out = [at(box(w, h * 0.45, 0.5, color), 0, y, z)];
  for (let x = -w / 2 + step / 2; x < w / 2; x += step) out.push(at(box(step * 0.6, h * 0.55, 0.5, color), x, y + h * 0.45, z));
  return out;
}

/**
 * Bridge the road runs over (road along z, centred on x = 0): deck, railings, piers, river and its banks.
 * The deck top sits just under y = 0 because the road ribbon is drawn on top of it.
 */
export function bridgeBase(S, { deckW = 11, deck = '#a7adb8', rail = '#e3e6ec', pier = '#b5bac4', piers = null, water = '#3aa7ea', bank = '#9a8a66', bankX = [-350, 350], waterY = -3 } = {}) {
  const g = group(
    at(box(deckW, 1, S + 0.6, deck), 0, -1.06, 0),
    at(box(0.3, 1.0, S, rail), -(deckW / 2 - 0.3), 0, 0), at(box(0.3, 1.0, S, rail), deckW / 2 - 0.3, 0, 0),
  );
  const n = piers ?? Math.max(1, Math.round(S / 26) - 1);
  for (let i = 1; i <= n; i++) g.add(at(box(deckW * 0.8, 3.2, 2.2, pier), 0, waterY - 1, -S / 2 + (S * i) / (n + 1)));
  if (water) g.add(at(box(700, 0.2, S, water), 0, waterY - 0.2, 0));
  if (bankX) {
    const bw = bankX[1] - bankX[0], bx = (bankX[0] + bankX[1]) / 2;
    g.add(at(box(bw, 4.2, 1.6, bank), bx, waterY - 1.2, -S / 2 - 0.8), at(box(bw, 4.2, 1.6, bank), bx, waterY - 1.2, S / 2 + 0.8));
  }
  return g;
}

/**
 * Suspension cables for one side of a bridge running along z: a main cable draped over the towers,
 * with vertical hangers down to the deck. towersZ: z of each tower top.
 */
export function suspension(S, x, towersZ, towerH, color, { deckY = 1, sag = 0.82, r = 0.16, step = 3 } = {}) {
  const out = [], tz = [...towersZ].sort((a, b) => a - b);
  const yAt = (z) => {
    if (z <= tz[0]) return deckY + (towerH - deckY) * ((z + S / 2) / (tz[0] + S / 2)) ** 1.5;
    if (z >= tz[tz.length - 1]) return deckY + (towerH - deckY) * ((S / 2 - z) / (S / 2 - tz[tz.length - 1])) ** 1.5;
    for (let i = 0; i < tz.length - 1; i++) if (z <= tz[i + 1]) { const u = ((z - tz[i]) / (tz[i + 1] - tz[i])) * 2 - 1; return towerH - (towerH - deckY) * sag * (1 - u * u); }
    return towerH;
  };
  const zs = new Set(tz);
  for (let z = -S / 2; z <= S / 2 + 1e-6; z += step) zs.add(Math.min(S / 2, z));
  const list = [...zs].sort((a, b) => a - b);
  for (let i = 0; i < list.length - 1; i++) {
    out.push(beam([x, yAt(list[i]), list[i]], [x, yAt(list[i + 1]), list[i + 1]], r, color, 5));
    if (yAt(list[i]) - deckY > 0.8 && !tz.includes(list[i])) out.push(beam([x, deckY, list[i]], [x, yAt(list[i]), list[i]], r * 0.4, color, 4));
  }
  return out;
}

/** Bridge tower: two legs joined by cross bars. halfW = leg centre from the middle, bars = heights of the cross bars. */
export function towerFrame(H, halfW, legW, legD, color, bars, { y0 = -6, barH = 1.2, taper = 0 } = {}) {
  const g = group();
  for (const s of [-1, 1]) {
    const leg = at(box(legW, H - y0, legD, color), s * halfW, y0, 0);
    if (taper) leg.rotation.z = s * taper;
    g.add(leg);
  }
  for (const y of bars) g.add(at(box(halfW * 2 + legW * 0.6, barH, legD * 0.8, color), 0, y, 0));
  return g;
}

/**
 * Whole suspension bridge seen from the side (for landmarks standing beside the road).
 * Runs along x, centred on the origin; deck top at deckY; towers at x = +-towerX.
 */
export function suspensionSpan(L, { towerX, towerH, deckY = 8, deckW = 7, color = '#f4f6f8', deck = '#aab1bd', bars = null, doubleDeck = false, y0 = -6 } = {}) {
  const inner = group(at(box(deckW, 1, L, deck), 0, deckY - 1, 0));
  if (doubleDeck) {
    inner.add(at(box(deckW, 0.8, L, deck), 0, deckY - 4.6, 0));
    for (const sx of [-1, 1]) for (let z = -L / 2; z < L / 2 - 1; z += 6) inner.add(beam([sx * deckW / 2, deckY - 3.8, z], [sx * deckW / 2, deckY - 1, z + 3], 0.14, color, 4), beam([sx * deckW / 2, deckY - 1, z + 3], [sx * deckW / 2, deckY - 3.8, z + 6], 0.14, color, 4));
  }
  for (const z of [-towerX, towerX]) inner.add(at(towerFrame(towerH, deckW / 2 + 0.7, 1.3, 1.8, color, bars || [deckY + (towerH - deckY) * 0.45, towerH - 1.2], { y0 }), 0, 0, z));
  for (const sx of [-1, 1]) inner.add(...suspension(L, sx * (deckW / 2 + 0.7), [-towerX, towerX], towerH, color, { deckY, step: L / 30 }));
  inner.rotation.y = Math.PI / 2;
  return group(inner);
}
