// Japanese landmarks. Conventions as in kr.js:
//   beside-the-road landmark: front faces +z, scaled to def.h · through landmark: road along z, takes (span)
import { box, cyl, cone, sphere, dome, beam, prism, lathe, at, group, live } from '../kit.js';
import { tileRoof, gableRoof, hall, suspensionSpan } from '../parts.js';

const blob = (r, color, x, y, z, s) => at(sphere(r, color, 7), x, y, z, 0, s);
const TILE = '#5a606b', WOOD = '#5a3e2e', WHITE = '#f6f3ea', VERM = '#e8502e', GOLD = '#e6b422';
const pineAt = (x, y, z, h = 4) => [at(cyl(0.15, 0.22, h * 0.5, '#8a5a3a', 5), x, y, z), blob(h * 0.34, '#2f8f55', x, y + h * 0.62, z, [1.2, 0.7, 1.2]), blob(h * 0.24, '#3a9d62', x + 0.4, y + h * 0.86, z, [1.1, 0.6, 1.1])];
const mapleAt = (x, y, z, h = 4, c = '#e8502e') => [at(cyl(0.15, 0.22, h * 0.45, '#7a4a3a', 5), x, y, z), blob(h * 0.36, c, x, y + h * 0.65, z), blob(h * 0.26, '#ff8a3d', x + h * 0.2, y + h * 0.55, z + 0.2)];
/** Pyramid roof with wide eaves (pagodas, castle tiers): square, side w. */
const eave = (w, h, color) => group(at(cone(w * 0.72, h, color, 4), 0, 0.15, 0, Math.PI / 4), at(box(w * 1.02, 0.18, w * 1.02, color), 0, 0, 0));

/** Four-legged lattice tower. levels: [[y, halfWidth]…] bottom to top; color(i) per level. */
function lattice(levels, color, r = 0.22) {
  const g = group();
  for (let i = 0; i < levels.length - 1; i++) {
    const [y0, w0] = levels[i], [y1, w1] = levels[i + 1], c = color(i);
    for (const [sx, sz] of [[1, 1], [1, -1], [-1, -1], [-1, 1]]) {
      g.add(beam([sx * w0, y0, sz * w0], [sx * w1, y1, sz * w1], r, c, 4));
      const [nx, nz] = [-sz, sx];                                     // next corner, going round
      g.add(beam([sx * w1, y1, sz * w1], [nx * w1, y1, nz * w1], r * 0.7, c, 4), beam([sx * w0, y0, sz * w0], [nx * w1, y1, nz * w1], r * 0.55, c, 4), beam([nx * w0, y0, nz * w0], [sx * w1, y1, sz * w1], r * 0.55, c, 4));
    }
  }
  return g;
}

// ------------------------------------------------------------------ 도쿄

// 붉은 기둥의 문 · 가운데 매달린 큰 붉은 등 · 회색 기와지붕 · 양옆 칸막이 방
function tokyo_kaminarimon() {
  const g = group();
  for (const x of [-10, -4.9, 4.9, 10]) g.add(at(cyl(0.6, 0.6, 7.6, '#c8321f', 10), x, 0, 0), at(cyl(0.7, 0.7, 0.5, '#3a3a3a', 10), x, 0, 0));
  for (const s of [-1, 1]) g.add(at(box(4.4, 5.6, 3.6, '#a3271a'), s * 7.45, 0.4, 0), at(box(3.4, 3.6, 3.7, '#5d7a5a'), s * 7.45, 1.4, 0), at(box(4.6, 0.4, 3.8, '#3a3a3a'), s * 7.45, 0, 0));
  g.add(at(box(22, 0.9, 1.2, '#c8321f'), 0, 6.3, 1.3), at(box(22, 0.9, 1.2, '#c8321f'), 0, 6.3, -1.3), at(box(22.6, 0.6, 5, '#b02a1c'), 0, 7.2, 0));
  g.add(at(tileRoof(8.6, 26, 3.4, '#5b6a66', { axis: 'x', lift: 0.25 }), 0, 7.8, 0));
  // the great lantern, hung high enough to ride under
  g.add(at(lathe([[1.5, 0], [2.1, 0.5], [2.3, 1.5], [2.1, 2.5], [1.5, 3]], '#d7281c', 12), 0, 4.4, 0), at(cyl(1.55, 1.55, 0.3, '#2b2b2b', 12), 0, 4.3, 0), at(cyl(1.55, 1.55, 0.3, '#2b2b2b', 12), 0, 7.3, 0), at(cyl(1.3, 1.5, 0.12, GOLD, 12), 0, 4.25, 0));
  return g;
}

// 붉은색·흰색 띠 · 아래로 벌어진 4다리 격자 · 2단 전망대 · 꼭대기 안테나
function tokyo_tower() {
  const H = 66, lv = [];
  for (let i = 0; i <= 11; i++) { const u = i / 11; lv.push([u * H * 0.78, 13 * (1 - u) ** 2.3 + 1.1]); }
  const g = lattice(lv, (i) => ([2, 3, 6, 7, 10].includes(i) ? '#ffffff' : '#f0522a'), 0.3);
  g.add(at(box(9, 3, 9, '#f4f6f8'), 0, 0, 0), at(box(9.4, 0.5, 9.4, '#b9c0cc'), 0, 3, 0));
  const w1 = 13 * (1 - 0.36) ** 2.3 + 1.1, y1 = H * 0.78 * 0.36;
  g.add(at(box(w1 * 2 + 1.6, 2.6, w1 * 2 + 1.6, '#ffffff'), 0, y1, 0), at(box(w1 * 2 + 1.8, 0.9, w1 * 2 + 1.8, '#3d5a80'), 0, y1 + 0.9, 0));
  g.add(at(box(4.6, 2, 4.6, '#ffffff'), 0, H * 0.78 * 0.82, 0), at(box(4.8, 0.7, 4.8, '#3d5a80'), 0, H * 0.78 * 0.82 + 0.7, 0));
  for (let i = 0; i < 6; i++) g.add(at(cyl(0.7 - i * 0.1, 0.8 - i * 0.1, 2.4, i % 2 ? '#ffffff' : '#f0522a', 6), 0, H * 0.78 + i * 2.4, 0));
  return g;
}

// 흰 주탑 2개 · 2층 상판 현수교 · 늘어진 케이블 · 아래 바다
function tokyo_rainbowbridge() {
  return group(at(box(170, 0.1, 44, '#3aa7ea'), 0, 0.03, 0), suspensionSpan(140, { towerX: 40, towerH: 34, deckY: 12, doubleDeck: true, color: '#f6f8fa', y0: 0 }),
    at(box(12, 12, 10, '#d5dbe3'), -72, 0, 0), at(box(12, 12, 10, '#d5dbe3'), 72, 0, 0), at(box(40, 0.6, 40, '#b9d9a0'), -92, 0, 0), at(box(40, 0.6, 40, '#b9d9a0'), 92, 0, 0));
}

// 가늘고 긴 은백색 격자 탑 · 위쪽 전망대 2단 · 밑은 삼각, 위는 원 · 꼭대기 안테나
function tokyo_skytree() {
  const C = '#e3ebf2', B = '#bfd3e6';
  const g = group(at(cyl(3.6, 7.2, 34, C, 3), 0, 0, 0), at(cyl(2.9, 3.6, 28, C, 12), 0, 34, 0));
  for (let i = 0; i < 9; i++) g.add(at(cyl(7.3 - i * 0.44, 7.3 - i * 0.44, 0.25, B, 3), 0, i * 3.8, 0));
  for (let i = 0; i < 7; i++) g.add(at(cyl(3.65 - i * 0.1, 3.65 - i * 0.1, 0.25, B, 12), 0, 34 + i * 4, 0));
  g.add(at(cyl(5.4, 3.0, 2.4, C, 14), 0, 62, 0), at(cyl(5.5, 5.5, 2.2, '#3d5a80', 14), 0, 64.4, 0), at(cyl(5.0, 5.6, 0.8, C, 14), 0, 66.6, 0),
    at(cyl(2.4, 2.8, 4.6, C, 12), 0, 67.4, 0), at(cyl(4.2, 2.6, 1.6, C, 14), 0, 72, 0), at(cyl(4.3, 4.3, 1.6, '#3d5a80', 14), 0, 73.6, 0), at(cyl(3.6, 4.3, 0.7, C, 14), 0, 75.2, 0),
    at(cyl(1.6, 2.2, 8, C, 10), 0, 75.9, 0), at(cyl(0.9, 1.1, 14, '#f4f8fb', 8), 0, 83.9, 0), at(cyl(0.2, 0.5, 4, '#f4f8fb', 6), 0, 97.9, 0));
  return g;
}

// ------------------------------------------------------------------ 교토

// 촘촘히 이어진 주홍 도리이 · 검은 밑동 · 위쪽 검은 가로대 · 터널처럼 길을 덮음
function kyoto_fushimiinari(span = 40) {
  const g = group(), n = Math.max(3, Math.floor(span / 1.7));
  for (let i = 0; i < n; i++) {
    const z = -span / 2 + ((i + 0.5) * span) / n, big = i === 0 || i === n - 1, x = big ? 4.9 : 4.4, h = big ? 6.8 : 5.7 + (i % 3) * 0.12, r = big ? 0.42 : 0.27;
    for (const s of [-1, 1]) g.add(at(cyl(r, r, h, VERM, 6), s * x, 0, z), at(cyl(r * 1.25, r * 1.25, 0.6, '#2b2b2b', 6), s * x, 0, z));
    g.add(at(box(x * 2 + 1.0, 0.4, 0.42, VERM), 0, h - 1.0, z), at(box(x * 2 + 2.2, 0.4, 0.6, VERM), 0, h, z), at(box(x * 2 + 2.6, 0.26, 0.66, '#2b2b2b'), 0, h + 0.4, z));
  }
  for (const s of [-1, 1]) g.add(at(box(1.2, 1, 1.6, '#b9b5aa'), s * 6.6, 0, -span / 2 - 1.5), at(box(0.7, 1.3, 1.2, '#a9a59a'), s * 6.6, 1, -span / 2 - 1.5), at(cone(0.3, 0.6, '#a9a59a', 4), s * 6.6, 2.3, -span / 2 - 1.2));
  return g;
}

// 5층 목탑 · 층마다 넓은 처마 · 어두운 나무색 · 꼭대기 금속 상륜
function kyoto_yasaka() {
  const g = group(at(box(9, 0.8, 9, '#b9b5aa'), 0, 0, 0));
  let y = 0.8;
  for (let i = 0; i < 5; i++) {
    const w = 6 - i * 0.62;
    g.add(at(box(w, 2.5, w, WOOD), 0, y, 0), at(box(w * 0.5, 1.5, w + 0.08, '#e9e1cf'), 0, y + 0.5, 0), at(box(w + 0.08, 1.5, w * 0.5, '#e9e1cf'), 0, y + 0.5, 0), at(box(w + 0.5, 0.2, w + 0.5, '#7a5a40'), 0, y + 2.1, 0));
    g.add(at(eave(w * 1.75, 1.3, '#4f5560'), 0, y + 2.5, 0));
    y += 3.9;
  }
  g.add(at(cyl(0.12, 0.3, 6.4, '#8a7a4a', 6), 0, y - 0.2, 0));
  for (let k = 0; k < 7; k++) g.add(at(cyl(0.62 - k * 0.05, 0.62 - k * 0.05, 0.16, '#8a7a4a', 8), 0, y + 1 + k * 0.62, 0));
  return g;
}

// 절벽 위 나무 기둥 격자 무대 · 크고 완만한 히와다 지붕 · 붉은 3층탑이 옆에 · 아래 단풍 숲
function kyoto_kiyomizu() {
  const g = group(at(prism([[1, 0], [26, 0], [26, 11], [6, 11]], 44, '#7fb86a'), 0, 0, 7, Math.PI / 2));
  const Y = 11;
  for (let ix = 0; ix < 7; ix++) for (let iz = 0; iz < 3; iz++) g.add(at(cyl(0.35, 0.35, Y, '#6b4a34', 6), -12 + ix * 4, 0, 1 + iz * 3.4));
  for (const y of [3, 6, 9]) { for (let iz = 0; iz < 3; iz++) g.add(at(box(25, 0.35, 0.35, '#5a3e2e'), 0, y, 1 + iz * 3.4)); for (let ix = 0; ix < 7; ix++) g.add(at(box(0.35, 0.35, 7.2, '#5a3e2e'), -12 + ix * 4, y - 0.4, 4.4)); }
  g.add(at(box(27, 0.7, 10, '#7a5a40'), 0, Y, 3.4), at(box(27, 0.9, 0.2, '#5a3e2e'), 0, Y + 0.7, 8.3));
  g.add(at(box(20, 3.6, 9, '#6b4a34'), 0, Y + 0.7, -3), at(box(20.2, 1.6, 0.2, '#e9e1cf'), 0, Y + 2, 1.55), at(tileRoof(15, 24, 5.4, '#5d4636', { axis: 'x', lift: 0.14, ridge: '#3f3027' }), 0, Y + 4.3, -3));
  g.add(at(tileRoof(8, 10, 2.6, '#5d4636', { lift: 0.14, ridge: '#3f3027' }), 0, Y + 4.3, 3.2));
  // 붉은 삼층탑
  let y = Y;
  g.add(at(box(6, Y, 6, '#8fbf70'), 20, 0, -6));
  for (let i = 0; i < 3; i++) { const w = 3.6 - i * 0.5; g.add(at(box(w, 2, w, '#d2452e'), 20, y, -6), at(eave(w * 1.8, 1, '#4f5560'), 20, y + 2, -6)); y += 3; }
  g.add(at(cyl(0.08, 0.2, 3.4, '#8a7a4a', 6), 20, y - 0.1, -6));
  for (let i = 0; i < 9; i++) g.add(...mapleAt(-14 + i * 3.6, 0, 12 + (i % 3) * 2.2, 4 + (i % 2), i % 3 ? '#e8502e' : '#f2a03d'));
  return g;
}

// 연못 위 3층 누각 · 위 2층이 금색 · 지붕 꼭대기 금 봉황 · 1층은 흰 벽과 나무
function kyoto_kinkakuji() {
  const SH = '#4a4038';
  const g = group(at(box(54, 0.1, 30, '#4f9fb8'), 0, 0.03, 4), at(box(13, 0.9, 10, '#b9b5aa'), 0, 0, -2));
  g.add(at(box(11, 3, 8, WHITE), 0, 0.9, -2), ...[-5.5, -2.75, 0, 2.75, 5.5].map((x) => at(box(0.3, 3, 0.3, WOOD), x, 0.9, 2.05)), at(box(12.6, 0.3, 9.6, WOOD), 0, 3.9, -2),
    at(box(10.4, 2.8, 7.4, GOLD), 0, 4.2, -2), at(box(11.6, 0.5, 8.6, GOLD), 0, 4.2, -2), at(box(11.8, 0.12, 8.8, '#b98a14'), 0, 4.75, -2),
    at(eave(13.4, 1.1, SH), 0, 7, -2).translateX(0), at(box(5.6, 2.6, 5.6, GOLD), 0, 8, -2), at(box(2, 1.5, 5.7, '#b98a14'), 0, 8.4, -2), at(eave(8.6, 2.3, SH), 0, 10.6, -2),
    at(cyl(0.08, 0.08, 0.7, GOLD, 5), 0, 12.9, -2), at(sphere(0.3, GOLD, 6), 0, 13.7, -2, 0, [0.7, 0.9, 1.5]), at(box(1.3, 0.06, 0.5, GOLD), 0, 13.8, -2), at(cone(0.12, 0.5, GOLD, 4), 0, 13.7, -1.3).rotateX(Math.PI / 2));
  g.add(at(dome(3, '#7fb86a', 8), -15, 0, 6, 0, [1.4, 0.35, 1]), ...pineAt(-15, 0.9, 6, 4), at(dome(2, '#9c9a92', 6), 12, 0, 10, 0, [1.3, 0.4, 1]), ...pineAt(12, 0.6, 10, 3),
    ...pineAt(-10, 0, -9, 7), ...pineAt(-4, 0, -11, 8), ...pineAt(6, 0, -11, 7.5), ...pineAt(13, 0, -8, 6.5), ...pineAt(-20, 0, -6, 6));
  return g;
}

// ------------------------------------------------------------------ 오사카

// 높은 돌 축대 · 흰 벽과 청록 지붕의 5층 천수 · 금색 장식 · 층마다 삼각 박공
function osaka_castle() {
  const RF = '#3f8f86';
  const g = group(at(cyl(11.5, 15.5, 9, '#a9a294', 4), 0, 0, 0, Math.PI / 4), at(cyl(13, 17.5, 3, '#9a9386', 4), 0, 0, 0, Math.PI / 4));
  let y = 9;
  [15.4, 13, 10.6, 8.4].forEach((w, i) => {
    g.add(at(box(w, 3, w, WHITE), 0, y, 0), at(box(w + 0.1, 0.5, w + 0.1, '#d9d4c6'), 0, y + 1.3, 0), at(eave(w * 1.32, 1.5, RF), 0, y + 3, 0));
    for (const [ax, az] of i % 2 ? [[1, 0], [-1, 0]] : [[0, 1], [0, -1]]) g.add(at(prism([[-2.2, 0], [0, 2], [2.2, 0]], 0.5, RF), ax * (w / 2 + 0.6), y + 3.1, az * (w / 2 + 0.6), ax ? Math.PI / 2 : 0), at(box(0.4, 0.4, 0.4, GOLD), ax * (w / 2 + 0.9), y + 4.3, az * (w / 2 + 0.9)));
    y += 4.2;
  });
  g.add(at(box(6.6, 3, 6.6, '#2f2f33'), 0, y, 0), at(box(6.7, 1.1, 6.7, GOLD), 0, y + 1.2, 0), at(box(7.6, 0.25, 7.6, '#d9d4c6'), 0, y, 0),
    at(tileRoof(8.6, 9, 2.8, RF, { axis: 'x', lift: 0.3, ridge: GOLD }), 0, y + 3, 0), at(cone(0.4, 1.2, GOLD, 4), -4, y + 5.6, 0), at(cone(0.4, 1.2, GOLD, 4), 4, y + 5.6, 0));
  for (let i = 0; i < 6; i++) g.add(...pineAt(-18 + i * 7.2, 0, 14 + (i % 2) * 2, 4.5));
  return g;
}

// 철골 탑 · 위쪽 네모난 전망대 2단 · 다리 사이로 길이 지나는 밑동 · 색 판 장식(글자 없음)
function osaka_tsutenkaku() {
  const S = '#cfd4dc';
  const g = lattice([[0, 6.2], [6, 4.4], [12, 3.2], [20, 2.9], [28, 2.7], [36, 2.6]], () => S, 0.26);
  g.add(at(box(9.6, 1.6, 9.6, '#eef1f4'), 0, 11.4, 0), at(box(9.8, 0.5, 9.8, '#ff8a3d'), 0, 12, 0));
  g.add(at(box(8.6, 3.6, 8.6, '#f4f6f8'), 0, 36, 0), at(box(8.8, 1.3, 8.8, '#3d5a80'), 0, 37.2, 0), at(box(9.4, 0.4, 9.4, '#ffd23f'), 0, 39.6, 0),
    at(box(6.6, 3, 6.6, '#f4f6f8'), 0, 40, 0), at(box(6.8, 1.1, 6.8, '#3d5a80'), 0, 41, 0), at(cyl(2.8, 2.8, 1.6, '#59c3ff', 12), 0, 43, 0), at(cyl(1.4, 2.2, 1.4, '#ff7fa8', 12), 0, 44.6, 0),
    at(cyl(0.15, 0.4, 7, S, 6), 0, 46, 0));
  ['#59c3ff', '#ffd23f', '#ff7fa8', '#5fd36a', '#ffffff', '#ff8a3d'].forEach((c, i) => g.add(at(box(1.9, 3.2, 0.3, c), 0, 14.5 + i * 3.5, 3.1)));
  return g;
}

// 운하 양옆 건물 벽 · 알록달록 큰 색 간판(글자·로고 없음) · 운하를 건너는 다리 · 운하 위 배
function osaka_dotonbori() {
  const g = group(at(box(64, 0.1, 9, '#3f97c9'), 0, 0.03, 2), at(box(64, 0.7, 2.4, '#cfc8b8'), 0, 0, -3.8), at(box(64, 0.7, 2.4, '#cfc8b8'), 0, 0, 7.8));
  const sign = ['#ff5a7a', '#ffd23f', '#59c3ff', '#5fd36a', '#ff8a3d', '#b08bff', '#ffffff'];
  for (let i = 0, x = -31; i < 9; i++) {
    const w = 5.4 + (i % 3) * 1.2, h = 11 + ((i * 5) % 4) * 2.6, c = ['#e9e3d6', '#d9dde4', '#efe6d2', '#cfd6df'][i % 4];
    g.add(at(box(w, h, 7, c), x + w / 2, 0, -9), at(box(w * 0.86, h * 0.34, 0.4, sign[i % 7]), x + w / 2, h * 0.52, -5.4), at(box(w * 0.7, 1.6, 0.4, sign[(i + 3) % 7]), x + w / 2, 2.4, -5.4));
    if (i % 3 === 0) g.add(at(cyl(2.2, 2.2, 0.4, sign[(i + 2) % 7], 14).rotateX(Math.PI / 2), x + w / 2, h + 1.6, -5.6));
    if (i % 3 === 1) g.add(at(box(1.2, 5.4, 0.9, sign[(i + 5) % 7]), x + w - 0.4, h * 0.45, -5));
    x += w + 0.5;
  }
  g.add(at(box(7, 0.6, 14, '#bfc5cf'), 0, 1.6, 2), at(box(0.3, 0.9, 14, '#8f96a3'), -3.4, 2.2, 2), at(box(0.3, 0.9, 14, '#8f96a3'), 3.4, 2.2, 2), at(box(7, 1.6, 1.2, '#aeb4bf'), 0, 0, -3.4), at(box(7, 1.6, 1.2, '#aeb4bf'), 0, 0, 7.4));
  for (const x of [-18, 16]) g.add(at(box(6, 0.8, 2.2, '#ffffff'), x, 0.1, 2), at(box(3.4, 0.9, 1.8, '#ffd23f'), x - 0.4, 0.9, 2), at(box(3.8, 0.12, 2, '#e23a2e'), x - 0.4, 1.9, 2));
  return g;
}

// 아주 큰 원형 바퀴 · 색색 곤돌라 · 흰 바큇살 · 삼각 받침 다리
function osaka_ferriswheel() {
  const R = 17, Y = 20, cols = ['#ff5a7a', '#ffd23f', '#5fd36a', '#59c3ff', '#b08bff', '#ff8a3d'];
  const wheel = live(group(), 'wheel');
  for (let i = 0; i < 36; i++) { const a0 = (i / 36) * Math.PI * 2, a1 = ((i + 1) / 36) * Math.PI * 2; for (const r of [R, R - 1.6]) wheel.add(beam([Math.cos(a0) * r, Math.sin(a0) * r, 0], [Math.cos(a1) * r, Math.sin(a1) * r, 0], 0.22, '#ffffff', 4)); }
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    wheel.add(beam([0, 0, 0], [Math.cos(a) * R, Math.sin(a) * R, 0], 0.12, '#ffffff', 4), at(sphere(1.25, cols[i % 6], 8), Math.cos(a) * (R + 1.1), Math.sin(a) * (R + 1.1), 0));
  }
  wheel.add(at(cyl(1.4, 1.4, 2.4, '#ffd23f', 10).rotateX(Math.PI / 2), 0, 0, -1.2));
  wheel.position.set(0, Y, 0);
  wheel.userData.spin = 0.12;
  const g = group(wheel, at(box(26, 3, 12, '#eef1f4'), 0, 0, 0), at(box(26.4, 0.6, 12.4, '#59c3ff'), 0, 3, 0));
  for (const sz of [-2.4, 2.4]) for (const sx of [-1, 1]) g.add(beam([sx * 10, 0, sz], [0, Y, sz * 0.6], 0.5, '#f4f6f8', 6));
  return g;
}

// ------------------------------------------------------------------ 삿포로

// 흰 판자벽 목조 건물 · 붉은 지붕 · 네모난 시계탑과 큰 시계 · 꼭대기 붉은 별
function sapporo_clocktower() {
  const RD = '#b8382c', GR = '#5f8a6a';
  const g = group(at(box(16, 6, 10, '#f4f1e8'), 0, 0, 0), at(gableRoof(10, 16, 3.4, RD, 0.5), 0, 6, 0, Math.PI / 2));
  for (let y = 0.6; y < 6; y += 0.6) g.add(at(box(16.06, 0.05, 10.06, '#dcd8cc'), 0, y, 0));
  for (const x of [-6, -3.6, 3.6, 6]) g.add(at(box(1.3, 2.6, 0.15, GR), x, 2, 5.03), at(box(0.9, 2.2, 0.2, '#cfe6f5'), x, 2.2, 5.03));
  g.add(at(box(5.4, 12.5, 5.4, '#f4f1e8'), 0, 0, 3.4), at(box(1.8, 3, 0.2, GR), 0, 0, 6.12), at(box(5.8, 0.4, 5.8, '#dcd8cc'), 0, 8.3, 3.4), at(box(5.8, 0.4, 5.8, '#dcd8cc'), 0, 12.5, 3.4));
  for (const [x, z, ry] of [[0, 6.15, 0], [2.75, 3.4, Math.PI / 2], [-2.75, 3.4, -Math.PI / 2]]) {
    g.add(at(group(at(cyl(1.7, 1.7, 0.16, '#ffffff', 16).rotateX(Math.PI / 2), 0, 0, 0), at(box(0.14, 1.3, 0.1, '#2b2b2b'), 0, 0, 0.12), at(box(0.9, 0.14, 0.1, '#2b2b2b'), 0.4, 0, 0.12)), x, 10.4, z, ry));
  }
  g.add(at(cone(4.4, 3.2, RD, 4), 0, 12.9, 3.4, Math.PI / 4), at(cyl(0.08, 0.08, 1.6, '#8a8a8a', 5), 0, 16, 3.4), at(prism(Array.from({ length: 10 }, (_, i) => { const r = i % 2 ? 0.3 : 0.7, a = (i * Math.PI) / 5 + Math.PI / 2; return [Math.cos(a) * r, Math.sin(a) * r]; }), 0.15, '#e23a2e'), 0, 4.6, 6.2));
  return g;
}

// 붉은 철골 탑 · 중간의 큰 전광 시계 자리 · 녹색 전망대 · 아래 공원과 분수
function sapporo_tvtower() {
  const RD = '#d83a2e';
  const lv = []; for (let i = 0; i <= 9; i++) { const u = i / 9; lv.push([u * 46, 8.4 * (1 - u) ** 1.7 + 1.3]); }
  const g = lattice(lv, () => RD, 0.28);
  g.add(at(box(7.6, 4, 7.6, '#3d9b4f'), 0, 28, 0), at(box(7.8, 1.4, 7.8, '#cfe6f5'), 0, 29.4, 0), at(box(8.4, 0.4, 8.4, '#2f7d40'), 0, 32, 0));
  g.add(at(box(9.4, 3.6, 0.6, '#22262e'), 0, 19.6, 5.2), ...[-3.3, -1.5, 1.5, 3.3].map((x) => at(box(1.3, 2.3, 0.2, '#ff9f2e'), x, 20.2, 5.5)), at(box(0.3, 0.3, 0.2, '#ff9f2e'), 0, 21.7, 5.5), at(box(0.3, 0.3, 0.2, '#ff9f2e'), 0, 20.7, 5.5));
  for (let i = 0; i < 5; i++) g.add(at(cyl(0.5 - i * 0.07, 0.56 - i * 0.07, 2.6, i % 2 ? '#ffffff' : RD, 6), 0, 46 + i * 2.6, 0));
  g.add(at(cyl(4, 4.4, 0.6, '#b9c0cc', 14), 0, 0, 14), at(cyl(3.6, 3.6, 0.5, '#59c3ff', 14), 0, 0.3, 14), at(cone(0.5, 3, '#dff3ff', 6), 0, 0.8, 14), ...[-12, 12].flatMap((x) => [at(cyl(0.2, 0.3, 2, '#8a5a3a', 5), x, 0, 12), blob(2, '#ffffff', x, 3.2, 12), blob(1.4, '#eaf3fb', x + 0.8, 4.2, 12)]));
  return g;
}

// 붉은 벽돌 좌우대칭 건물 · 가운데 녹색 팔각 돔 · 흰 창틀이 줄지음 · 슬레이트 지붕
function sapporo_redbrick() {
  const BR = '#a8472e', SL = '#5a5f6b', DG = '#5f9a7a';
  const g = group(at(box(34, 9, 11, BR), 0, 0, 0), at(box(34.4, 1, 11.4, '#b9b3a4'), 0, 0, 0), at(prism([[-17.6, 0], [17.6, 0], [15, 3], [-15, 3]], 12, SL), 0, 9, 0));
  for (const x of [-13.5, 13.5]) g.add(at(box(7, 10, 12.6, BR), x, 0, 0), at(eave(8, 3, SL), x, 10, 0));
  g.add(at(box(8, 11, 13.4, BR), 0, 0, 0), at(prism([[-4.4, 0], [0, 2.6], [4.4, 0]], 0.6, '#b9b3a4'), 0, 11, 6.5));
  for (let f = 0; f < 2; f++) for (let x = -15.5; x <= 15.5; x += 2.2) g.add(at(box(1.2, 2.4, 0.2, '#f4f1e8'), x, 1.6 + f * 3.8, Math.abs(x) > 10 ? 6.32 : Math.abs(x) < 4 ? 6.72 : 5.52), at(box(0.8, 2, 0.24, '#5f7f99'), x, 1.8 + f * 3.8, Math.abs(x) > 10 ? 6.32 : Math.abs(x) < 4 ? 6.72 : 5.52));
  g.add(at(box(2.2, 3.4, 0.3, '#f4f1e8'), 0, 1, 6.75), at(cyl(3.6, 3.6, 3.4, BR, 8), 0, 11.6, 0, Math.PI / 8), ...Array.from({ length: 8 }, (_, i) => at(box(0.9, 2, 0.2, '#f4f1e8'), Math.sin((i * Math.PI) / 4) * 3.4, 12.2, Math.cos((i * Math.PI) / 4) * 3.4, (i * Math.PI) / 4)),
    at(cyl(4, 4, 0.4, '#f4f1e8', 8), 0, 15, 0, Math.PI / 8), at(dome(3.8, DG, 8), 0, 15.4, 0, Math.PI / 8, [1, 1.15, 1]), at(cyl(0.9, 0.9, 1.6, DG, 8), 0, 19.4, 0), at(cone(1.1, 1.4, DG, 8), 0, 21, 0), at(cyl(0.06, 0.06, 1.8, '#8a8a8a', 5), 0, 22.4, 0),
    at(box(1, 3, 1, BR), -8, 11, 0), at(box(1, 3, 1, BR), 8, 11, 0));
  return g;
}

// 산비탈의 길고 흰 점프대 · 아래 넓은 착지 경사 · 꼭대기 출발 탑 · 양옆 침엽수
function sapporo_skijump() {
  const inner = group(
    at(prism([[-34, 0], [-34, 38], [-26, 38], [-8, 15], [2, 9], [20, 1.5], [34, 0]], 44, '#f1f6fa'), 0, 0, 0),
    at(prism([[-33, 38.6], [-26, 38.6], [-8, 15.6], [-4, 14.8], [-4, 14.2], [-8, 14.9], [-26, 37.6], [-33, 37.6]], 3.2, '#ffffff'), 0, 0.3, 0),
    at(prism([[-2, 12], [20, 2.2], [32, 0.8], [32, 0.4], [20, 1.7], [-2, 11.4]], 9, '#dfeaf3'), 0, 0.3, 0),
    at(box(6, 7, 6, '#e23a2e'), -30, 38, 0), at(box(6.4, 0.5, 6.4, '#f4f6f8'), -30, 45, 0),
  );
  for (let i = 0; i < 16; i++) { const u = -28 + (i % 8) * 6.6, y = u < -8 ? 15 + ((-8 - u) / 18) * 23 : Math.max(0, 9 - (u - 2) * 0.42), s = i < 8 ? -1 : 1; inner.add(at(cone(2.2, 6, '#3a8a66', 6), u, y, s * (10 + (i % 3) * 3.4)), at(cone(1.5, 3.6, '#ffffff', 6), u, y + 2.8, s * (10 + (i % 3) * 3.4))); }
  inner.rotation.y = -Math.PI / 2;
  return group(inner);
}

// ------------------------------------------------------------------ 시즈오카

// 둥근 이랑이 줄지은 차밭 · 완만한 언덕 · 짙은 녹색 줄무늬 · 바람개비 달린 기둥
function shizuoka_teafield() {
  const g = group(at(prism([[-26, 0], [26, 0], [26, 2], [-26, 13]], 64, '#74b955'), 0, 0, -4, -Math.PI / 2));
  for (let k = 0; k < 12; k++) { const z = 20 - k * 4, y = 2.3 + k * 0.85; g.add(blob(1, k % 2 ? '#2f8f45' : '#3a9d50', 0, y + 0.3, z, [30 - k * 0.6, 1.0, 1.25])); }
  for (const [x, k] of [[-18, 3], [6, 6], [20, 9]]) { const z = 22 - k * 4, y = 2.0 + k * 0.85; g.add(at(cyl(0.1, 0.12, 6, '#d5dbe3', 5), x, y, z), at(box(2.4, 0.12, 0.4, '#f4f6f8'), x, y + 6, z + 0.2), at(box(0.4, 0.12, 2.4, '#f4f6f8'), x, y + 6, z + 0.2)); }
  g.add(at(box(6, 3, 5, '#efe6d2'), -14, 12, -24), at(gableRoof(6, 5, 2, '#5a606b'), -14, 15, -24));
  return g;
}

// 검은 모래 해변 · 구불구불 굽은 소나무 숲 · 바다 물결
function shizuoka_miho() {
  const g = group(at(box(64, 7, 26, '#55555f'), 0, -7, 0), at(box(64, 0.3, 8, '#6a6a74'), 0, 0, -6), at(box(64, 0.12, 2.2, '#ffffff'), 0, -0.06, -13.6));
  for (let i = 0; i < 15; i++) {
    const x = -28 + i * 4 + (i % 2) * 1.3, z = 2 + ((i * 7) % 5) * 2 - 2, lean = ((i % 3) - 1) * 1.5, h = 6 + (i % 4);
    g.add(beam([x, 0, z], [x + lean, h * 0.5, z + 0.4], 0.3, '#7a4f38', 5), beam([x + lean, h * 0.5, z + 0.4], [x + lean * 0.3, h, z], 0.22, '#7a4f38', 5),
      blob(2.4, '#2a7f4f', x + lean * 0.3, h + 0.4, z, [1.4, 0.45, 1.2]), blob(1.7, '#34915a', x + lean * 1.2, h * 0.72, z + 0.6, [1.3, 0.4, 1.1]), blob(1.5, '#2a7f4f', x - 1.2, h * 0.86, z - 0.5, [1.2, 0.4, 1]));
  }
  return g;
}

// 해자와 돌 축대 · 흰 벽의 2층 망루 · 회색 기와 · 나무 다리와 문
function shizuoka_sunpu() {
  const ST = '#a9a294';
  const g = group(at(box(60, 0.1, 9, '#4f9fd0'), 0, 0.03, 9), at(prism([[-28, 0], [28, 0], [27, 4.6], [-27, 4.6]], 8, ST), 0, 0, 0), at(box(40, 2.4, 1, WHITE), 6, 4.6, 2.6), at(tileRoof(1.8, 40, 0.6, TILE, { axis: 'x' }), 6, 7, 2.6));
  g.add(at(box(11, 3.4, 8, WHITE), -19, 4.6, 0), at(box(11.1, 0.9, 8.1, '#3f434b'), -19, 4.6, 0), at(eave(15, 1.5, TILE), -19, 8, 0), at(box(7.6, 2.8, 5.6, WHITE), -19, 8.6, 0), at(tileRoof(7.4, 10, 2.4, TILE, { axis: 'x', lift: 0.25 }), -19, 11.4, 0));
  g.add(at(box(7, 5.4, 4, '#5a3e2e'), 14, 0, 4.4), at(box(3.6, 3.6, 4.1, '#3a2a20'), 14, 0, 4.4), at(tileRoof(5.4, 9, 1.8, TILE, { axis: 'x' }), 14, 5.4, 4.4), at(box(4, 0.4, 11, '#8a6a4a'), 14, 0.3, 10.5), at(box(0.2, 1, 11, '#6b4a34'), 12.1, 0.7, 10.5), at(box(0.2, 1, 11, '#6b4a34'), 15.9, 0.7, 10.5));
  g.add(...pineAt(0, 4.6, -1, 5), ...pineAt(-8, 4.6, -1.5, 5.5), ...pineAt(24, 4.6, -1, 4.5));
  return g;
}

// 길 위를 가로지르는 콘크리트 고가 · 굵은 교각 · 위로 지나가는 흰·파란 신칸센
function shizuoka_shinkansen() {
  const C = '#cfd3da';
  const g = group(at(box(260, 1.3, 5.4, C), 0, 6.2, 0), at(box(260, 1, 0.3, '#b9bec8'), 0, 7.5, 2.55), at(box(260, 1, 0.3, '#b9bec8'), 0, 7.5, -2.55));
  for (const x of [-6.6, 6.6, -24, 24, -44, 44, -66, 66, -90, 90, -116, 116]) g.add(at(box(2.4, 6.2, 3.8, '#bfc4cd'), x, 0, 0));
  const train = live(group(), 'train');
  for (let i = 0; i < 6; i++) {
    train.add(at(box(8.6, 2.6, 2.7, '#ffffff'), -i * 9, 0, 0), at(box(8.7, 0.3, 2.74, '#2f6fd0'), -i * 9, 0.7, 0), at(box(7.6, 0.7, 2.76, '#35405a'), -i * 9, 1.4, 0));
  }
  train.add(at(prism([[0, 0], [0, 2.6], [1.8, 2.3], [5, 0.5], [5.2, 0]], 2.7, '#ffffff'), 4.3, 0, 0), at(prism([[0, 0], [0, 2.6], [-1.8, 2.3], [-5, 0.5], [-5.2, 0]], 2.7, '#ffffff'), -49.3, 0, 0));
  train.position.set(0, 7.5, 0);
  train.userData.shuttle = { speed: 38, range: 420 };
  g.add(train);
  return g;
}

// ------------------------------------------------------------------ 먼 배경
function bg_skyline() {
  const g = group(), cols = ['#d5dde8', '#c3cedc', '#e2e7ef', '#b9c6d6', '#dce4d9'];
  for (let i = 0; i < 18; i++) { const h = 34 + ((i * 37) % 9) * 11, w = 20 + ((i * 13) % 4) * 5; g.add(at(box(w, h, w, cols[i % 5]), -230 + i * 27, 0, ((i * 7) % 3) * 12)); if (i % 4 === 0) g.add(at(cone(3, 16, '#aeb9c8', 4), -230 + i * 27, h, ((i * 7) % 3) * 12)); }
  return g;
}
function bg_maplehills() {
  const g = group();
  [[-180, 70, 120, '#e07a3a'], [-50, 96, 140, '#d9542e'], [100, 78, 125, '#e8a23d'], [230, 56, 100, '#7fb86a'], [-290, 50, 90, '#c9c24a']].forEach(([x, h, r, c]) => g.add(at(dome(r, c, 10), x, 0, 0, 0, [1.3, h / r, 0.5])));
  return g;
}
function bg_snowmountain() {
  const g = group();
  [[-150, 120, 130], [10, 160, 150], [170, 110, 120]].forEach(([x, h, r]) => g.add(at(cone(r, h, '#9fb4cc', 7), x, 0, 0, 0, [1, 1, 0.5]), at(cone(r * 0.56, h * 0.56, '#ffffff', 7), x, h * 0.445, 0, 0, [1, 1, 0.5])));
  return g;
}
function bg_fuji() {
  const g = group(at(lathe([[300, 0], [215, 30], [140, 78], [86, 128], [50, 170], [34, 192], [30, 198], [0, 196]], '#7691c4', 20), 0, 0, 0, 0, [1, 1, 0.6]), at(lathe([[310, 0], [250, 14], [200, 32]], '#86b88a', 20), 0, 0, 0, 0, [1.02, 1, 0.62]));
  g.add(at(lathe([[72, 142], [51, 170], [35, 192], [31, 198.6], [0, 197]], '#ffffff', 20), 0, 0.4, 0, 0, [1.02, 1, 0.62]));
  for (let i = 0; i < 20; i++) { const a = (i / 20) * Math.PI * 2, r = 74 + (i % 3) * 7; g.add(at(cone(9 + (i % 2) * 3, 26 + (i % 4) * 7, '#ffffff', 4).rotateX(Math.PI), Math.cos(a) * r * 1.0, 144 - (i % 3) * 8, Math.sin(a) * r * 0.6)); }
  return g;
}

export const JP = {
  tokyo_kaminarimon, tokyo_tower, tokyo_rainbowbridge, tokyo_skytree,
  kyoto_fushimiinari, kyoto_yasaka, kyoto_kiyomizu, kyoto_kinkakuji,
  osaka_castle, osaka_tsutenkaku, osaka_dotonbori, osaka_ferriswheel,
  sapporo_clocktower, sapporo_tvtower, sapporo_redbrick, sapporo_skijump,
  shizuoka_teafield, shizuoka_miho, shizuoka_sunpu, shizuoka_shinkansen,
  bg_skyline, bg_maplehills, bg_snowmountain, bg_fuji,
};
