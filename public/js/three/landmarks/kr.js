// Korean landmarks. Each builder returns a THREE.Group with its base on y = 0.
//   beside-the-road landmark: front faces +z (the world turns it toward the road); it is scaled to def.h
//   through landmark: road runs along z through x = 0; riders need |x| <= 3.8, y <= 4.2 clear; takes (span)
// The comment above each builder lists the features from cities.js that must be recognisable.
import { box, cyl, cone, sphere, dome, beam, prism, lathe, at, group } from '../kit.js';
import { tileRoof, hall, archWall, parapet, bridgeBase, columns } from '../parts.js';

const STONE = '#e9e4d6', STONE_D = '#cfc9b8', ROOF = '#4a4e57', RED = '#b5372e', DAN = '#2f8f6f', WOOD = '#7a4a2a';
const GREEN = '#5cb85c', GREEN_D = '#46a04f';
const blob = (r, color, x, y, z, s) => at(sphere(r, color, 7), x, y, z, 0, s);

/** Two-storey wooden gate pavilion (문루) sitting on a wall top at height y. */
function munru(w, d, y, { tiers = 2 } = {}) {
  const g = group(at(hall(w, d, 2.4, 2.0, { base: 0.3, wall: '#e8d9c0', col: RED, roof: ROOF, band: DAN, cols: 6 }), 0, y, 0));
  if (tiers > 1) g.add(at(hall(w * 0.78, d * 0.7, 1.7, 2.3, { base: 0.2, wall: '#e8d9c0', col: RED, roof: ROOF, band: DAN, cols: 5 }), 0, y + 4.6, 0));
  return g;
}

// ------------------------------------------------------------------ 서울

// 흰 화강암 육축에 무지개문 3개(가운데가 큼) · 그 위 2층 기와 문루 · 붉은 기둥과 녹색 단청 · 양옆 낮은 돌담
function seoul_gwanghwamun() {
  return group(
    archWall(36, 8, 6, STONE, [{ x: 0, w: 9.2, h: 7 }, { x: -11.5, w: 4.6, h: 5.2 }, { x: 11.5, w: 4.6, h: 5.2 }]),
    ...parapet(36, STONE_D, 8, 2.75), ...parapet(36, STONE_D, 8, -2.75),
    munru(24, 4.6, 8),
    at(box(12, 3.4, 1.4, STONE), -24, 0, 0), at(box(12, 3.4, 1.4, STONE), 24, 0, 0),
    at(tileRoof(2.2, 12, 0.7, ROOF, { axis: 'x' }), -24, 3.4, 0), at(tileRoof(2.2, 12, 0.7, ROOF, { axis: 'x' }), 24, 3.4, 0),
  );
}

// 2단 돌 월대와 난간 · 2층 팔작 기와지붕, 처마 끝이 올라감 · 붉은 기둥 · 녹색 단청 띠
function seoul_geunjeongjeon() {
  const rail = (w, d, y) => [-1, 1].flatMap((s) => [at(box(w, 0.5, 0.2, '#f4f1e8'), 0, y, s * d / 2), at(box(0.2, 0.5, d, '#f4f1e8'), s * w / 2, y, 0)]);
  return group(
    at(box(34, 1.3, 26, STONE), 0, 0, 0), at(box(28, 1.3, 20, STONE), 0, 1.3, 0),
    ...rail(34, 26, 1.3), ...rail(28, 20, 2.6),
    at(box(7, 0.65, 4, STONE_D), 0, 0, 14.5), at(box(7, 1.3, 2.5, STONE_D), 0, 0, 13.6), at(box(6, 1.95, 3, STONE_D), 0, 0, 11), at(box(6, 2.6, 1.6, STONE_D), 0, 0, 10.2),
    at(hall(20, 12, 4.4, 3.4, { base: 0.4, wall: '#d9b99a', col: RED, roof: ROOF, band: DAN, cols: 6 }), 0, 2.6, 0),
    at(hall(15.5, 8.6, 2.4, 4.0, { base: 0.2, wall: '#d9b99a', col: RED, roof: ROOF, band: DAN, cols: 6 }), 0, 2.6 + 7.4, 0),
  );
}

// 녹색 산 위 · 흰 콘크리트 기둥 · 위쪽 여러 단 원통 전망대 · 붉은·흰 줄무늬 안테나
function seoul_ntower() {
  const g = group(at(dome(26, GREEN, 14), 0, 0, 0, 0, [1.25, 0.5, 1]));
  for (let i = 0; i < 26; i++) { const a = i * 2.4, r = 6 + (i % 5) * 4.6; g.add(blob(2.2 + (i % 3) * 0.7, i % 2 ? GREEN_D : '#6cc56a', Math.cos(a) * r * 1.25, Math.max(3.4, 12.6 - r * 0.42), Math.sin(a) * r)); }
  const y = 12.6;
  g.add(
    at(cyl(4.6, 5.2, 2.2, '#e8ecf0', 14), 0, y, 0), at(cyl(4.9, 4.9, 0.5, '#7f8a99', 14), 0, y + 1.1, 0),
    at(cyl(1.5, 2.0, 20, '#f4f6f8', 12), 0, y + 2.2, 0),
    at(cyl(3.9, 2.2, 1.6, '#eef1f4', 14), 0, y + 22.2, 0),
    at(cyl(4.5, 4.5, 1.5, '#3d5a80', 14), 0, y + 23.8, 0), at(cyl(4.7, 4.7, 0.4, '#f4f6f8', 14), 0, y + 25.3, 0),
    at(cyl(4.1, 4.1, 1.3, '#3d5a80', 14), 0, y + 25.7, 0), at(cyl(4.3, 4.3, 0.4, '#f4f6f8', 14), 0, y + 27, 0),
    at(cyl(2.4, 3.6, 1.6, '#eef1f4', 14), 0, y + 27.4, 0), at(cyl(1.1, 1.6, 2.2, '#dfe4ea', 10), 0, y + 29, 0),
  );
  for (let i = 0; i < 8; i++) g.add(at(cyl(0.75 - i * 0.07, 0.82 - i * 0.07, 2, i % 2 ? '#ffffff' : '#e23a2e', 8), 0, y + 31.2 + i * 2, 0));
  g.add(at(cyl(0.05, 0.12, 3, '#e23a2e', 5), 0, y + 47.2, 0));
  return g;
}

// 길 양옆으로 이어지는 아치 트러스 · 회색 교각 · 아래 파란 강물
function seoul_hangangbridge(span = 80) {
  const S = span, n = Math.max(1, Math.round(S / 26)), L = S / n, col = '#8fb4c9', x = 4.9;
  const g = bridgeBase(S, { piers: n - 1 });
  for (const sx of [-1, 1]) for (let k = 0; k < n; k++) {
    const z0 = -S / 2 + k * L, N = 8, H = Math.min(8.5, L * 0.36), top = (u) => 0.9 + H * 4 * u * (1 - u);
    for (let i = 0; i < N; i++) {
      const u0 = i / N, u1 = (i + 1) / N;
      g.add(beam([sx * x, top(u0), z0 + u0 * L], [sx * x, top(u1), z0 + u1 * L], 0.28, col, 5));
      if (i) g.add(beam([sx * x, 0.9, z0 + u0 * L], [sx * x, top(u0), z0 + u0 * L], 0.12, col, 4));
    }
    g.add(at(box(0.5, 0.5, L, col), sx * x, 0.6, z0 + L / 2));
  }
  for (let k = 0; k < n; k++) for (const u of [0.35, 0.5, 0.65]) { const H = Math.min(8.5, L * 0.36), z = -S / 2 + (k + u) * L, y = 0.9 + H * 4 * u * (1 - u); if (y > 5) g.add(beam([-x, y, z], [x, y, z], 0.16, col, 4)); }
  return g;
}

// ------------------------------------------------------------------ 먼 배경
function bg_namsan() {
  const g = group(at(dome(120, '#6fbf73', 12), 0, 0, 0, 0, [1.5, 0.48, 0.6]), at(dome(80, '#7cc87d', 10), -150, 0, 10, 0, [1.4, 0.4, 0.6]), at(dome(70, '#66b56c', 10), 150, 0, 10, 0, [1.5, 0.42, 0.6]));
  g.add(at(cyl(2, 3, 34, '#f4f6f8', 8), 0, 56, 0), at(cyl(6, 6, 6, '#3d5a80', 10), 0, 86, 0), at(cyl(1, 1.6, 24, '#e23a2e', 6), 0, 92, 0));
  return g;
}
function bg_lottetower() {
  const g = group(at(lathe([[13, 0], [11.5, 60], [8, 130], [3.5, 175], [0.4, 185]], '#bfd9ec', 8), 0, 0, 0), at(box(1.2, 30, 9, '#8fb4c9'), 0, 150, 0));
  [[-70, 46, 24], [-40, 62, 20], [36, 50, 22], [66, 70, 18], [100, 40, 26], [-105, 54, 22]].forEach(([x, h, w], i) => g.add(at(box(w, h, w, i % 2 ? '#d5dde8' : '#c3cedc'), x, 0, 0)));
  return g;
}

export const KR = {
  seoul_gwanghwamun, seoul_geunjeongjeon, seoul_ntower, seoul_hangangbridge,
  bg_namsan, bg_lottetower,
};
