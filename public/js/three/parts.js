// Reusable architectural pieces shared by roadside props and landmarks.
import { box, cyl, prism, at, group } from './kit.js';

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
