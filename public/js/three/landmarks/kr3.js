// Korean landmarks, part 3: 화성 봉담 and 화성 동탄 (the family's home town). Conventions as in kr.js:
//   beside-the-road landmark: front faces +z, scaled to def.h; through landmark: road along z through x = 0.
import * as THREE from 'three';
import { mat, box, cyl, cone, sphere, dome, beam, prism, lathe, slab, at, group } from '../kit.js';
import { tileRoof, hall, bridgeBase } from '../parts.js';

const STONE = '#e6e0d0', STONE_D = '#cbc4b2', ROOF = '#4a4e57', RED = '#b5372e', HONG = '#c4372c', DAN = '#2f8f6f';
const GRASS = '#7cc85e', MOUND = '#9bdc6a', TRUNK = '#8a5a3a';
const blob = (r, color, x, y, z, s) => at(sphere(r, color, 7), x, y, z, 0, s);
const pine = (x, y, z, h = 5) => [at(cyl(0.16, 0.24, h * 0.55, TRUNK, 5), x, y, z), blob(h * 0.32, '#2f8f55', x, y + h * 0.6, z, [1.25, 0.65, 1.25]), blob(h * 0.23, '#3a9d62', x + 0.3, y + h * 0.85, z, [1.15, 0.6, 1.15])];
const roundTree = (x, z, h = 4, c = '#4fb35a') => [at(cyl(0.18, 0.26, h * 0.5, TRUNK, 6), x, 0, z), blob(h * 0.36, c, x, h * 0.66, z, [1, 0.9, 1])];
const ring = (r, n, f) => Array.from({ length: n }, (_, i) => f(Math.cos((i / n) * Math.PI * 2) * r, Math.sin((i / n) * Math.PI * 2) * r, (i / n) * Math.PI * 2, i));

/** Red arrow gate (홍살문): two round posts, two cross beams, a row of red spikes and the taegeuk mark on top. */
function hongsalmun(half, h, r = 0.3) {
  const g = group(at(cyl(r, r * 1.15, h, HONG, 8), -half, 0, 0), at(cyl(r, r * 1.15, h, HONG, 8), half, 0, 0),
    at(box(half * 2 + 1.2, r * 1.1, r * 1.1, HONG), 0, h * 0.78, 0), at(box(half * 2 + 0.8, r, r, HONG), 0, h * 0.92, 0),
    at(cyl(r * 1.6, r * 1.6, 0.3, STONE_D, 8), -half, 0, 0), at(cyl(r * 1.6, r * 1.6, 0.3, STONE_D, 8), half, 0, 0));
  const top = h * 1.12, step = Math.max(0.36, half / 12);
  for (let x = -half + step; x < half - step * 0.5; x += step) g.add(at(box(0.09, top - h * 0.78, 0.09, HONG), x, h * 0.78, 0), at(cone(0.09, 0.32, HONG, 4), x, top, 0));
  // taegeuk: red over blue, framed, with a small three-pronged spike above
  const R = Math.max(0.6, half * 0.17), y = h * 1.12 + R * 0.4;
  const half0 = (s) => Array.from({ length: 9 }, (_, i) => { const a = (i / 8) * Math.PI; return [Math.cos(a) * R, s * Math.sin(a) * R]; });
  g.add(at(prism(half0(1), 0.2, '#d63a2f'), 0, y + R, 0), at(prism(half0(-1), 0.2, '#2f5fb3'), 0, y + R, 0));
  g.add(at(cone(0.08, 0.6, '#3b3b3b', 4), 0, y + R * 2.1, 0), at(cone(0.06, 0.4, '#3b3b3b', 4), -0.3, y + R * 2.1, 0), at(cone(0.06, 0.4, '#3b3b3b', 4), 0.3, y + R * 2.1, 0));
  return g;
}

/** Stone figures that guard a royal tomb. kind: 'civil' | 'military' | 'horse' | 'sheep' | 'tiger'. */
function stoneFigure(kind) {
  const S = '#d8d2c2', D = '#b9b2a0';
  if (kind === 'civil' || kind === 'military') {
    const g = group(at(box(0.9, 0.25, 0.8, D), 0, 0, 0), at(box(0.8, 1.5, 0.6, S), 0, 0.25, 0), at(box(0.95, 0.18, 0.7, D), 0, 1.15, 0),
      blob(0.36, S, 0, 2.05, 0), at(cyl(0.22, 0.3, 0.42, kind === 'civil' ? D : '#a49d8b', 6), 0, 2.32, 0), at(box(0.36, 0.5, 0.14, D), 0, 1.15, 0.34));
    if (kind === 'military') g.add(at(box(0.12, 1.3, 0.12, '#a49d8b'), 0.35, 0.3, 0.36), at(box(0.3, 0.1, 0.16, '#a49d8b'), 0.35, 1.5, 0.36));
    return g;
  }
  const len = kind === 'horse' ? 1.5 : 1.1, ht = kind === 'horse' ? 0.75 : 0.5;
  const g = group(at(box(0.7, 0.2, len + 0.3, D), 0, 0, 0), at(box(0.55, ht, len, S), 0, 0.2 + ht * 0.5, 0), blob(0.3, S, 0, 0.3 + ht * 1.4, len * 0.5));
  for (const [x, z] of [[-0.2, -0.4], [0.2, -0.4], [-0.2, 0.4], [0.2, 0.4]]) g.add(at(box(0.16, ht * 0.5 + 0.2, 0.16, S), x, 0.2, z * len));
  if (kind === 'tiger') for (const z of [-0.3, 0, 0.3]) g.add(at(box(0.58, 0.08, 0.1, '#9a927f'), 0, 0.2 + ht * 0.9, z * len));
  if (kind === 'sheep') g.add(blob(0.16, S, -0.22, 0.4 + ht * 1.4, len * 0.5), blob(0.16, S, 0.22, 0.4 + ht * 1.4, len * 0.5));
  return g;
}

/** T-shaped shrine hall in front of a royal tomb (정자각). Front faces +z. */
const jeongjagak = () => group(
  at(box(10, 0.8, 6, STONE_D), 0, 0, 0), at(box(4.6, 0.6, 5, STONE_D), 0, 0, 4.8),
  at(hall(8, 4, 2.3, 2, { base: 0.25, wall: '#e8d9c0', col: RED, roof: ROOF, band: DAN, cols: 5, baseCol: STONE }), 0, 0.8, 0),
  at(hall(4.4, 2.8, 2.1, 1.7, { base: 0.25, wall: '#e8d9c0', col: RED, roof: ROOF, band: DAN, cols: 3, baseCol: STONE }), 0, 0.6, 4.6, Math.PI / 2),
);

/**
 * Royal tomb on its hill, everything packed toward the back so the front stays near the road:
 * 홍살문 → stone path → 정자각 → hill with the grave mound, railing, figures and the curved back wall.
 * screen = stone panels around the mound (융릉 has them, 건릉 does not).
 */
function royalTomb({ screen }) {
  // the hill is tall and close behind the shrine so the mound shows above it from the road
  const cz = -15, top = 3, K = 1.35;   // low hill, big mound: the mound must show above the shrine from the road
  const g = group(
    at(lathe([[18.5, 0], [16, 1.5], [13.8, 2.6], [12.8, top], [0, top]], '#6cb851', 18), 0, 0, cz),
    at(slab(2, 13, '#ddd6c4'), 0, 0.04, 4.5), at(slab(1.2, 4, '#e8e2d2'), 0, 0.05, -0.5),
    at(hongsalmun(2.2, 4.6, 0.2), 0, 0, 9),
    at(jeongjagak(), 0, 0, 0.5, 0, 0.75),
    at(box(1.6, 0.6, 1.6, STONE_D), 3.6, 0, 6),   // 판위: the square stone where the king stood
  );
  const t = group(), mz = 0, by = 0;   // mound, railing, wall and figures, built at the origin then lifted onto the hill
  if (screen) {
    t.add(at(cyl(4.4, 4.4, 1.1, STONE, 16), 0, by, mz));
    t.add(...ring(4.42, 14, (x, z, a) => at(box(0.5, 0.9, 0.12, '#bdb5a1'), x, by + 0.1, mz + z, -a - Math.PI / 2)));
    t.add(at(dome(4.35, MOUND, 14), 0, by + 1.05, mz, 0, [1, 0.72, 1]));
  } else {
    t.add(at(dome(4.5, MOUND, 14), 0, by, mz, 0, [1, 0.78, 1]));
  }
  // 난간석: posts and rails around the mound
  const R = 5.7, N = 16;
  t.add(...ring(R, N, (x, z) => at(cyl(0.12, 0.14, 0.95, '#d8d2c2', 6), x, by, mz + z)));
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2, b = ((i + 1) / N) * Math.PI * 2;
    t.add(beam([Math.cos(a) * R, by + 0.72, mz + Math.sin(a) * R], [Math.cos(b) * R, by + 0.72, mz + Math.sin(b) * R], 0.07, '#d8d2c2', 4));
  }
  // 곡장: low tiled wall hugging the back of the mound
  for (let i = 0; i <= 10; i++) {
    const a = Math.PI + 0.15 + (i / 10) * (Math.PI - 0.3), x = Math.cos(a) * 8.6, z = mz + Math.sin(a) * 8.6;
    t.add(at(group(at(box(2.7, 1.5, 0.5, '#e3d9c2'), 0, 0, 0), at(tileRoof(1.1, 2.8, 0.45, ROOF, { axis: 'x' }), 0, 1.5, 0)), x, by, z, -a - Math.PI / 2));
  }
  // figures and the stone table in front of the mound
  t.add(at(box(2.2, 0.55, 1.2, STONE), 0, by, mz + 6.6), at(box(1.8, 0.25, 0.9, STONE_D), 0, by, mz + 6.6));
  t.add(at(box(0.6, 0.3, 0.6, STONE_D), 0, by, mz + 7), at(cyl(0.18, 0.22, 0.9, STONE, 6), 0, by + 0.3, mz + 7), at(box(0.7, 0.6, 0.7, STONE), 0, by + 1.2, mz + 7), at(cone(0.6, 0.45, STONE_D, 4), 0, by + 1.8, mz + 7, Math.PI / 4));
  for (const s of [-1, 1]) {
    t.add(at(stoneFigure('civil'), s * 2.1, by, mz + 7.6, 0, 0.7), at(stoneFigure('military'), s * 2.1, by, mz + 8.8, 0, 0.7),
      at(stoneFigure('horse'), s * 3.4, by, mz + 7.6, 0, 0.7), at(stoneFigure('horse'), s * 3.4, by, mz + 8.8, 0, 0.7));
    t.add(at(stoneFigure('sheep'), s * 6.6, by, mz - 1.5, s * 0.6, 0.7), at(stoneFigure('tiger'), s * 6.8, by, mz + 1.6, s * 1.2, 0.7));
  }
  g.add(at(t, 0, top, cz - 2, 0, K));
  // pines around the hill
  for (let i = 0; i < 12; i++) { const a = Math.PI * (1.05 + (i / 11) * 0.9), r = 20 + (i % 3) * 2.2; g.add(...pine(Math.cos(a) * r * 1.05, 0, cz + Math.sin(a) * r, 7 + (i % 3) * 1.2)); }
  for (const s of [-1, 1]) g.add(...pine(s * 15, 0, -3, 5), ...pine(s * 19, 0, -8, 6));
  return g;
}

// ------------------------------------------------------------------ 화성 봉담

// 25층 아파트 여러 동 · 단지 정문과 놀이터 · 정문 앞 버스정류장 · 단지 앞 가로수길
// (중흥S클래스 에듀파크, 봉담2지구 상리 — the family's home; exact colours not known, kept to a white tower look)
function bongdam_edupark() {
  const g = group(at(slab(48, 36, '#a5d97e'), 0, 0.02, -9));
  // tall slim towers, two rows, with dark grey corner bands and a warm crown
  [[-17, -13, 29], [-6, -19, 30], [5, -13, 28], [16, -19, 30], [-12, -26, 27], [11, -27, 28]].forEach(([x, z, h]) => {
    g.add(at(box(8, h, 6.2, '#fbfaf6'), x, 0, z));
    for (let y = 2; y < h - 2.5; y += 2.4) g.add(at(box(7.4, 0.9, 6.4, '#a7d0ea'), x, y, z));
    g.add(at(box(1.2, h, 6.4, '#5a5f6b'), x - 3.5, 0, z), at(box(8.2, 2.2, 6.4, '#5a5f6b'), x, h - 2.2, z), at(box(8.4, 0.5, 6.6, '#c9a46a'), x, h - 2.6, z), at(box(3, 1.4, 3, '#d9d3c6'), x, h, z));
  });
  // 정문: two posts with a beam and a name board
  g.add(at(box(1.2, 4.4, 1.2, '#5a5f6b'), -4, 0, 2), at(box(1.2, 4.4, 1.2, '#5a5f6b'), 4, 0, 2), at(box(9.6, 1.3, 1.4, '#5a5f6b'), 0, 4.4, 2), at(box(6, 0.7, 0.1, '#c9a46a'), 0, 4.7, 2.75));
  g.add(at(slab(7, 9, '#d9d3c6'), 0, 0.04, -2.5));
  // 놀이터 beside the gate
  const px = -12, pz = -3;
  g.add(at(cyl(4.2, 4.2, 0.08, '#ffb48a', 14), px, 0.02, pz),
    at(box(1.2, 2.2, 1.2, '#ffd23f'), px - 1.6, 0, pz), at(prism([[0, 2.2], [0, 1.8], [3, 0], [3, 0.4]], 0.9, '#59c3ff'), px - 1, 0, pz),
    beam([px + 1.2, 0, pz - 1.6], [px + 1.6, 2.4, pz - 1.6], 0.07, '#ff5a7a'), beam([px + 2.8, 0, pz - 1.6], [px + 2.4, 2.4, pz - 1.6], 0.07, '#ff5a7a'), beam([px + 1.6, 2.4, pz - 1.6], [px + 2.4, 2.4, pz - 1.6], 0.07, '#ff5a7a'),
    at(box(0.6, 0.08, 0.3, '#ffd23f'), px + 2, 0.7, pz - 1.6));
  // 버스정류장 in front of the gate: shelter, bench and a green Gyeonggi bus sign
  g.add(at(box(5, 0.15, 1.8, '#4a5568'), 9, 2.6, 4.6), at(box(0.15, 2.6, 0.15, '#4a5568'), 6.7, 0, 5.3), at(box(0.15, 2.6, 0.15, '#4a5568'), 11.3, 0, 5.3),
    at(box(4.6, 1.8, 0.08, '#bfe3f7'), 9, 0.6, 3.8), at(box(3, 0.4, 0.6, '#a8754c'), 9, 0.45, 4.2), at(box(0.12, 3, 0.12, '#5a6170'), 12.4, 0, 5.4), at(box(1, 0.8, 0.12, '#2fa860'), 12.4, 2.6, 5.4));
  for (let i = 0; i < 6; i++) g.add(...roundTree(-15 + i * 6, 6.6, 3.6, i % 2 ? '#4fb35a' : '#63c56b'));
  return g;
}

// 붉은 나무 기둥 2개와 가로대 · 위쪽에 촘촘한 붉은 살 · 가운데 태극 문양 · 양옆 소나무 숲
function bongdam_yunggeonneung(span = 10) {
  const S = span, g = group(hongsalmun(5.2, 9.2, 0.38));
  g.add(at(box(1.8, 0.4, 1.8, STONE_D), 6.6, 0, -2), at(box(1.4, 0.8, 0.2, '#6b4a34'), -7.4, 0, 1.5), at(box(1.6, 0.9, 0.12, '#f4ecd6'), -7.4, 0.8, 1.5));
  // 소나무 숲 on both sides, along the whole span and a little beyond
  for (let i = 0; i < 18; i++) {
    const side = i % 2 ? 1 : -1, z = -S / 2 - 4 + ((i * 7.3) % (S + 8)), x = side * (8.5 + ((i * 3.7) % 9));
    g.add(...pine(x, 0, z, 6 + (i % 4) * 1.3));
  }
  return g;
}

// 언덕 위 둥근 봉분 · 봉분 둘레 병풍석과 난간석 · 문인석·무인석과 석마 · 아래 정자각과 홍살문
function bongdam_yungneung() { return royalTomb({ screen: true }); }

// 언덕 위 둥근 봉분(병풍석 없음) · 봉분 둘레 난간석 · 석양·석호와 문인석·무인석 · 뒤를 감싸는 곡장 담 · 아래 정자각
function bongdam_geonneung() { return royalTomb({ screen: false }); }

// 2층 누각 천보루 · 대웅보전 기와 전각 · 앞마당 5층 석탑 · 돌담과 솔숲
function bongdam_yongjusa() {
  const g = group(at(slab(30, 30, '#d9cfb4'), 0, 0.02, -8));
  // 천보루: open ground floor on posts, hall above
  g.add(at(box(14, 0.4, 5.6, STONE_D), 0, 0, 2.6));
  for (const x of [-6, -3, 0, 3, 6]) for (const z of [0.6, 4.6]) g.add(at(cyl(0.22, 0.26, 3, '#8a3a2a', 6), x, 0.4, z));
  g.add(at(box(13.4, 0.4, 5, '#7a4a2a'), 0, 3.4, 2.6), at(hall(12.6, 4.4, 1.9, 2.4, { base: 0.1, wall: '#e8d9c0', col: RED, roof: ROOF, band: DAN, cols: 6 }), 0, 3.8, 2.6));
  // 5층 석탑 in the courtyard
  let y = 0;
  g.add(at(box(2.8, 0.6, 2.8, STONE_D), 0, 0, -6)); y = 0.6;
  for (let k = 0; k < 5; k++) {
    const w = 1.5 - k * 0.18, rh = 0.32;
    g.add(at(box(w, k ? 0.6 : 1.1, w, STONE), 0, y, -6)); y += k ? 0.6 : 1.1;
    g.add(at(box(w + 0.9, rh, w + 0.9, STONE_D), 0, y, -6)); y += rh;
  }
  g.add(at(cyl(0.08, 0.18, 1.2, '#9a927f', 6), 0, y, -6));
  // 대웅보전 on a stone terrace
  g.add(at(box(18, 1.2, 9, STONE_D), 0, 0, -15), at(box(5, 0.6, 2, STONE), 0, 0, -10),
    at(hall(15, 6.6, 3.2, 3.2, { base: 0.3, wall: '#d9b99a', col: RED, roof: ROOF, band: DAN, cols: 6, baseCol: STONE }), 0, 1.2, -15.5));
  // 돌담 running back from the gate pavilion, and pines behind
  for (const s of [-1, 1]) {
    g.add(at(box(6, 1.7, 0.6, '#e3d9c2'), s * 10, 0, 2.6), at(tileRoof(1.2, 6.2, 0.5, ROOF, { axis: 'x' }), s * 10, 1.7, 2.6));
    g.add(at(box(0.6, 1.7, 22, '#e3d9c2'), s * 13, 0, -8.4), at(tileRoof(1.2, 22, 0.5, ROOF), s * 13, 1.7, -8.4));
  }
  for (let i = 0; i < 9; i++) g.add(...pine(-16 + i * 4, 0, -24 - (i % 2) * 3, 7 + (i % 3)));
  for (const s of [-1, 1]) g.add(...pine(s * 16, 0, -6, 7), ...pine(s * 17, 0, -14, 8));
  return g;
}

// ------------------------------------------------------------------ 화성 동탄

// 넓은 잔디밭 · 둥근 광장과 바닥분수 · 나무 그늘 산책길 · 뒤로 낮은 반석산
function dongtan_centralpark() {
  const g = group(at(slab(30, 22, '#8fd067'), 0, 0.02, -1), at(slab(2.2, 22, '#e6dfcf'), -9, 0.04, -1), at(slab(30, 2, '#e6dfcf'), 0, 0.04, -9));
  g.add(at(cyl(5.4, 5.4, 0.16, '#ece7dc', 18), 4, 0, 2), at(cyl(4.4, 4.4, 0.04, '#b9e6fb', 18), 4, 0.16, 2));
  g.add(...ring(3.2, 8, (x, z) => at(cyl(0.05, 0.14, 1.6, '#e8f7ff', 6), 4 + x, 0.16, 2 + z)), at(cyl(0.08, 0.2, 2.6, '#e8f7ff', 6), 4, 0.16, 2), blob(0.3, '#e8f7ff', 4, 2.8, 2));
  for (const [x, z] of [[-4, 6], [10, 6], [12, -3], [-13, 4], [-13, -4], [8, -7]]) g.add(at(box(1.6, 0.45, 0.5, '#a8754c'), x, 0, z + 1.2), at(box(1.6, 0.5, 0.1, '#a8754c'), x, 0.45, z + 1.45));
  for (let i = 0; i < 9; i++) g.add(...roundTree(-13 + i * 3.3, -11 - (i % 2) * 1.5, 4.4 + (i % 3) * 0.6, i % 2 ? '#4fb35a' : '#63c56b'));
  for (const z of [-6, -2, 2, 6]) g.add(...roundTree(-11, z, 4, '#56b85a'));
  // 반석산 behind, with pines and a small pavilion on top
  g.add(at(dome(16, '#6fbf73', 14), 0, 0, -30, 0, [1.5, 0.8, 0.75]));
  for (let i = 0; i < 12; i++) { const a = (i / 11) * Math.PI, x = Math.cos(a) * 18, h = Math.sin(a) * 10; g.add(...pine(x, Math.max(0, h - 1), -24 - Math.sin(a) * 3, 3.5)); }
  g.add(at(hall(3, 3, 1.2, 1.2, { base: 0.2, wall: '#e8d9c0', col: RED, roof: ROOF, cols: 2 }), 0, 12.3, -30));
  return g;
}

// 유리 초고층 4동 · 꼭대기 비스듬한 왕관 지붕 · 아래 낮은 쇼핑몰 · 파란·은색 유리
function dongtan_metapolis() {
  const g = group(at(box(34, 4.6, 18, '#e4e9ef'), 0, 0, -2), at(box(34.2, 2, 16, '#7fbde8'), 0, 1.2, -2), at(box(10, 3.2, 0.3, '#3b8beb'), 0, 1.2, 7.05));
  [[-9, -6, 46], [2, -10, 48], [11, -4, 42], [-1, 0, 40]].forEach(([x, z, h], i) => {
    const t = group(at(cyl(4.2, 4.6, h - 4, i % 2 ? '#78b8e6' : '#8cc6ee', 14), 0, 0, 0, 0, [1, 1, 0.75]));
    for (let y = 3; y < h - 5; y += 3.2) t.add(at(cyl(4.4, 4.75, 0.3, '#f2f6fa', 14), 0, y, 0, 0, [1, 1, 0.76]));
    for (const a of [0.5, 2.1, 3.7, 5.3]) t.add(at(box(0.3, h - 4, 0.3, '#f2f6fa'), Math.cos(a) * 4.3, 0, Math.sin(a) * 3.2));
    // slanted crown
    t.add(at(prism([[-4.4, 0], [4.4, 0], [4.4, 2.2], [-4.4, 5.2]], 6.6, '#dfeaf4'), 0, h - 4, 0, i * 0.8));
    t.add(at(cyl(0.08, 0.12, 3, '#c9d2dc', 5), 1, h + 0.9, 0));
    g.add(at(t, x, 4.6, z));
  });
  return g;
}

// 길고 낮은 유리 지붕 역 입구 · 역 이름 간판 · 앞 광장과 버스 · 뒤 고층 빌딩
function dongtan_station() {
  const arch = Array.from({ length: 11 }, (_, i) => { const a = (i / 10) * Math.PI; return [Math.cos(a) * 6, Math.sin(a) * 4.2]; });
  const g = group(at(slab(36, 26, '#e3ded4'), 0, 0.02, -4));
  g.add(at(box(26, 1.2, 10, '#d6dbe2'), 0, 0, -3), at(prism(arch, 26, '#9fd3f0'), 0, 1.2, -3, Math.PI / 2));
  for (let x = -12; x <= 12; x += 3) g.add(at(prism(arch.map(([a, b]) => [a * 1.03, b * 1.03]), 0.3, '#f4f8fb'), x, 1.2, -3, Math.PI / 2));
  // entrance going down, and the sign board
  g.add(at(box(6, 2.2, 3, '#4a5568'), 0, 0, 3.2), at(box(6.6, 0.3, 3.6, '#f4f8fb'), 0, 2.2, 3.2));
  g.add(at(box(0.25, 3, 0.25, '#5a6170'), -3.5, 0, 6), at(box(0.25, 3, 0.25, '#5a6170'), 3.5, 0, 6), at(box(8, 1.6, 0.3, '#1e5aa8'), 0, 3, 6));
  for (let i = 0; i < 3; i++) g.add(at(box(1.4, 0.7, 0.1, '#ffffff'), -2.2 + i * 2.2, 3.45, 6.17));
  // bus at the stop
  g.add(at(box(2.5, 2.6, 9, '#2fa860'), -12, 0.4, 6, Math.PI / 2), at(box(2.56, 0.9, 8.4, '#cfe9f7'), -12, 1.6, 6, Math.PI / 2), ...[-15, -9].flatMap((x) => [at(cyl(0.45, 0.45, 2.6, '#2b2b33', 8).rotateX(Math.PI / 2), x, 0.45, 6)]));
  // tall glass building behind
  g.add(at(box(12, 16, 9, '#cfdbe6'), 8, 0, -14));
  for (let y = 1.5; y < 15; y += 2.2) g.add(at(box(12.2, 1.2, 9.2, '#6fb7e8'), 8, y, -14));
  g.add(at(box(9, 11, 8, '#e4e8ee'), -10, 0, -14));
  for (let y = 1.5; y < 10; y += 2.2) g.add(at(box(9.2, 1.1, 8.2, '#8cc6ee'), -10, y, -14));
  return g;
}

/** Big standing ring (the 루나 sculpture), facing x. */
function luna(r) {
  const t = new THREE.Mesh(new THREE.TorusGeometry(r, r * 0.12, 8, 28), mat('#fff1b8'));
  t.rotation.y = Math.PI / 2;
  const disc = cyl(r * 0.9, r * 0.9, 0.2, '#ffe27a', 24).rotateZ(Math.PI / 2);
  return group(at(t, 0, r + 1.5, 0), at(disc, 0, r + 1.5, 0), at(cyl(1.2, 1.8, 1.6, '#d6d0c4', 10), 0, 0, 0));
}

// 호수를 가로지르는 데크 다리 · 물 위로 솟는 음악분수 · 둥근 루나 조형물 · 호숫가 산책길과 오리배
function dongtan_lakepark(span = 70) {
  const S = span, LAKE = 110, Y = -3;
  const g = bridgeBase(S, { deckW: 11, deck: '#b98a5a', rail: '#ffffff', water: '#4fb3e8', bankX: [-LAKE, LAKE], bank: '#cfc6b0' });
  g.children.find((c) => c.geometry?.parameters?.width === 700)?.scale.set(LAKE * 2 / 700, 1, 1);
  // land beyond the lake shores, flush with the ground
  for (const s of [-1, 1]) g.add(at(box(300, 4, S + 3.2, '#92d36b'), s * (LAKE + 150), Y - 1, 0), at(box(6, 0.6, S + 3.2, '#e6dfcf'), s * (LAKE + 4), -0.55, 0));
  // deck boards and lamps
  for (let z = -S / 2 + 1; z < S / 2; z += 2) g.add(at(box(10.4, 0.06, 0.12, '#9a6e45'), 0, -0.07, z));
  for (let z = -S / 2 + 6; z < S / 2 - 3; z += 12) for (const s of [-1, 1]) g.add(at(cyl(0.07, 0.09, 3.2, '#5a6170', 6), s * 5.3, 0, z), at(sphere(0.3, '#fff3c4', 8), s * 5.3, 3.3, z));
  // 루나 on the water, and the ring of fountain nozzles
  if (S >= 20) g.add(at(luna(Math.min(8, S * 0.12)), -34, Y, Math.min(8, S * 0.15), -0.5));
  g.add(...ring(9, 12, (x, z) => at(cyl(0.3, 0.4, 0.5, '#d6d0c4', 6), 30 + x, Y, z * Math.min(1, S / 22))));
  return g;
}

// ------------------------------------------------------------------ 먼 배경
function bg_aptline() {
  const g = group(at(dome(140, '#7cc87d', 12), -60, 0, 30, 0, [1.7, 0.4, 0.5]), at(dome(100, '#6fbf73', 10), 170, 0, 30, 0, [1.5, 0.45, 0.5]));
  for (let i = 0; i < 16; i++) {
    const x = -230 + i * 30 + (i % 3) * 4, h = 46 + ((i * 37) % 30), w = 20 + (i % 2) * 6;
    g.add(at(box(w, h, 10, i % 2 ? '#f6f2ea' : '#fbfaf6'), x, 0, 0));
    for (let y = 6; y < h - 6; y += 6) g.add(at(box(w + 0.2, 2, 9, '#a7d0ea'), x, y, 0));
    g.add(at(box(w + 0.4, 4, 10.4, ['#3b8beb', '#ff8a3d', '#3fae5e', '#e2574c'][i % 4]), x, h - 5, 0));
  }
  return g;
}

// 도시 카드용 그림: 홍살문 너머 정자각과 봉분
function thumb_yunggeon() {
  return group(at(slab(80, 70, GRASS), 0, 0.01, -10), royalTomb({ screen: true }));
}
// 도시 카드용 그림: 호수 위 루나와 분수, 뒤로 메타폴리스
function thumb_dongtan() {
  const g = group(at(box(90, 0.1, 40, '#4fb3e8'), 0, 0.02, 0), at(box(90, 0.5, 6, '#92d36b'), 0, 0, 22), at(box(90, 0.5, 30, '#92d36b'), 0, 0, -35));
  g.add(at(luna(7), -14, 0, -6, 0.6));
  for (let i = 0; i < 9; i++) { const x = 4 + (i - 4) * 3, h = 4 + (4 - Math.abs(i - 4)) * 2.6; g.add(at(cyl(0.25, 0.5, h, '#e8f7ff', 6), x, 0, -4), blob(0.6, '#e8f7ff', x, h, -4)); }
  g.add(at(dongtan_metapolis(), 6, 0, -40, 0, 0.6));
  return g;
}

export const KR3 = {
  bongdam_edupark, bongdam_yunggeonneung, bongdam_yungneung, bongdam_geonneung, bongdam_yongjusa, thumb_yunggeon,
  dongtan_centralpark, dongtan_metapolis, dongtan_station, dongtan_lakepark, thumb_dongtan,
  bg_aptline,
};
