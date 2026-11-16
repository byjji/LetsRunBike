// US landmarks. Conventions as in kr.js:
//   beside-the-road landmark: front faces +z, scaled to def.h · through landmark: road along z, takes (span)
// No real signs, logos or lettering anywhere: screens and billboards are plain colour panels.
import { box, cyl, cone, sphere, dome, beam, prism, lathe, at, group, mat } from '../kit.js';
import { gableRoof, bridgeBase, suspension } from '../parts.js';

const blob = (r, color, x, y, z, s) => at(sphere(r, color, 7), x, y, z, 0, s);
const treeAt = (x, y, z, h = 5) => [at(cyl(0.2, 0.3, h * 0.5, '#8a5a3a', 5), x, y, z), blob(h * 0.32, '#4fb35a', x, y + h * 0.66, z), blob(h * 0.24, '#63c56b', x + h * 0.18, y + h * 0.54, z + 0.2)];
/** Flat star (points × 2 vertices) lying on the ground, h thick. */
const starSlab = (points, rOut, rIn, h, color) => {
  const p = Array.from({ length: points * 2 }, (_, i) => { const r = i % 2 ? rIn : rOut, a = (i * Math.PI) / points; return [Math.cos(a) * r, Math.sin(a) * r]; });
  const m = prism(p, h, color); m.rotation.x = -Math.PI / 2; m.position.y = h / 2;
  return group(m);
};

// ------------------------------------------------------------------ 뉴욕

// 청록색 여신 · 별 모양 기단 위 돌 받침대 · 뿔 7개 왕관 · 치켜든 금색 횃불과 왼팔의 판
function newyork_liberty() {
  const G = '#6fb8a0', GD = '#5aa58d', ST = '#cdbfa6';
  const g = group(at(box(70, 0.1, 70, '#3aa7ea'), 0, 0.03, 0), at(cyl(20, 21, 1.2, '#9bcf7c', 16), 0, 0, 0), at(starSlab(11, 15, 10.5, 2.6, '#bfb199'), 0, 1.2, 0));
  g.add(at(box(11, 2, 11, ST), 0, 3.8, 0), at(box(8.6, 3, 8.6, ST), 0, 5.8, 0), at(box(7, 9, 7, '#d9cdb6'), 0, 8.8, 0), at(box(8, 1, 8, ST), 0, 17.8, 0), at(box(6.4, 1.2, 6.4, ST), 0, 18.8, 0));
  for (const s of [-1, 1]) g.add(at(box(1.1, 5, 0.3, '#b3a488'), s * 1.6, 10.4, 3.52), at(box(0.3, 5, 1.1, '#b3a488'), s * 3.52, 10.4, 1.6));
  const Y = 20;
  g.add(
    at(lathe([[2.5, 0], [2.3, 3], [1.9, 7], [1.6, 10], [1.3, 12]], G, 10), 0, Y, 0),               // robe
    at(box(3.4, 1.0, 0.5, GD), 0.2, Y + 6.5, 1.3).rotateZ(0.5), at(box(3.2, 0.9, 0.5, GD), 0.1, Y + 4.2, 1.5).rotateZ(0.45),   // folds
    at(sphere(1.5, G, 8), 0, Y + 12, 0, 0, [1.25, 0.8, 0.9]),                                        // shoulders
    at(cyl(0.5, 0.6, 1, G, 8), 0, Y + 12.8, 0), at(sphere(1.0, G, 10), 0, Y + 14.5, 0, 0, [0.9, 1.1, 0.95]),
    at(cyl(1.15, 1.15, 0.35, GD, 10), 0, Y + 15.1, 0),
    beam([-1.4, Y + 12.3, 0], [-2.2, Y + 15.6, 0.3], 0.5, G, 6), beam([-2.2, Y + 15.6, 0.3], [-2.4, Y + 19.4, 0.3], 0.42, G, 6),   // raised arm
    at(cyl(0.7, 0.3, 0.8, GD, 8), -2.4, Y + 19.4, 0.3), at(cyl(0.9, 0.9, 0.2, GD, 8), -2.4, Y + 20.2, 0.3),
    at(cone(0.6, 1.8, '#f2c230', 6), -2.4, Y + 20.4, 0.3), at(sphere(0.5, '#f7d55a', 6), -2.4, Y + 20.8, 0.3),
    beam([1.5, Y + 12.2, 0], [2.0, Y + 9.4, 1.0], 0.48, G, 6), at(box(1.4, 2.3, 0.35, GD), 2.1, Y + 8.4, 1.5).rotateZ(-0.2),            // tablet
  );
  for (let i = 0; i < 7; i++) { const a = -0.2 + (i / 6) * (Math.PI + 0.4), c = at(cone(0.16, 1.7, G, 4), Math.cos(a) * 1.1, Y + 15.3, Math.sin(a) * 0.5 + 0.2); c.rotation.z = -(Math.PI / 2 - a) * 0.9; g.add(c); }
  return g;
}

// 돌 주탑 2개 · 주탑마다 뾰족 아치 2개 · 부채꼴로 퍼진 케이블 · 아래 강물
function newyork_brooklynbridge(span = 80) {
  const S = span, ST = '#b59f84', H = Math.min(24, 12 + S * 0.16), tz = [-S * 0.23, S * 0.23], C = '#8a8f99';
  const g = bridgeBase(S, { deckW: 13, deck: '#8f8478', rail: '#6f6a64', pier: ST });
  if (S >= 20) {
    const top = H - 2, ay = Math.max(8.4, top - 5), sy = ay - 3.2;
    const outline = [[-9, 0], [-5.9, 0], [-5.9, sy], [-3.45, ay], [-1.0, sy], [-1.0, 5.3], [1.0, 5.3], [1.0, sy], [3.45, ay], [5.9, sy], [5.9, 0], [9, 0], [9, H], [-9, H]];
    for (const z of tz) g.add(at(prism(outline, 3.4, ST), 0, 0, z), at(box(19, 1, 4.2, '#a38d72'), 0, H, z), at(box(18.6, 0.6, 3.8, '#a38d72'), 0, top - 0.3, z), at(box(4, 8, 5, ST), -7.4, -8, z), at(box(4, 8, 5, ST), 7.4, -8, z));
    for (const sx of [-1, 1]) {
      g.add(...suspension(S, sx * 6.4, tz, H - 0.6, C, { deckY: 1, step: Math.max(2.4, S / 30), r: 0.14 }));
      for (const z of tz) for (let k = 1; k <= 5; k++) for (const d of [-1, 1]) g.add(beam([sx * 6.4, H - 1, z], [sx * 6.4, 1, z + d * k * S * 0.036], 0.05, C, 3));   // fan stays
    }
  }
  return g;
}

// 단계적으로 좁아지는 석조 탑 · 세로 줄 창 · 꼭대기 둥근 첨탑과 안테나
function newyork_empirestate() {
  const L = '#d9cfbb', W = '#8fa3b8';
  const g = group();
  let y = 0;
  [[17, 13, 7], [13, 11, 5], [10.6, 9.4, 44], [8.6, 7.6, 6], [6.6, 6, 5], [4.6, 4.4, 4]].forEach(([w, d, h], i) => {
    g.add(at(box(w, h, d, L), 0, y, 0));
    if (h > 5) for (let x = -w / 2 + 0.9; x < w / 2; x += 1.25) g.add(at(box(0.5, h - 1.2, d + 0.12, W), x, y + 0.6, 0));
    if (h > 5) for (let z = -d / 2 + 0.9; z < d / 2; z += 1.25) g.add(at(box(w + 0.12, h - 1.2, 0.5, W), 0, y + 0.6, z));
    if (i === 2) for (const s of [-1, 1]) g.add(at(box(2.4, 34, d * 0.7, L), s * (w / 2 + 1.2), y, 0));
    y += h;
  });
  g.add(at(cyl(1.7, 2.1, 4, '#c9cfd8', 10), 0, y, 0), at(cyl(1.1, 1.6, 3, '#dfe4ea', 10), 0, y + 4, 0), at(dome(1.1, '#dfe4ea', 8), 0, y + 7, 0), at(cyl(0.12, 0.35, 13, '#aab2c0', 6), 0, y + 7.6, 0));
  return g;
}

// 색 전광판이 붙은 건물들(글자·로고 없음) · 모서리가 뾰족한 삼각 건물 · 붉은 계단 · 앞쪽 가로수
function newyork_timessquare() {
  const g = group(at(cyl(4.4, 4.8, 26, '#cfd6df', 3), 0, 0, -2, Math.PI), at(cyl(4.9, 4.9, 0.6, '#aab2c0', 3), 0, 26, -2, Math.PI));
  let n = 0;
  // screens: plain colour panels whose hue drifts slowly (see World: userData.screen)
  const screen = (w, h, x, y, z, ry, hue) => {
    const m = at(box(w, h, 0.4, '#ffffff', { emissive: '#ffffff', emissiveIntensity: 0.25, name: 'screen' + n++ }), x, y, z, ry);
    m.userData.screen = hue;
    return m;
  };
  g.add(screen(3.6, 5, -2.2, 17, 0.4, -0.52, 0.0), screen(3.6, 5, 2.2, 17, 0.4, 0.52, 0.55), screen(3.6, 4, -2.2, 10.6, 0.4, -0.52, 0.3), screen(3.6, 4, 2.2, 10.6, 0.4, 0.52, 0.8), screen(2.6, 3, 0, 5.4, 2.5, 0, 0.12));
  [[-13, 30, 9], [13, 34, 9], [-23, 22, 8], [23, 26, 8]].forEach(([x, h, w], i) => {
    g.add(at(box(w, h, 9, i % 2 ? '#b9c3d0' : '#c9bfb0'), x, 0, -6));
    for (let y = 3; y < h - 2; y += 3) g.add(at(box(w + 0.1, 1.2, 8, '#6f8fae'), x, y, -6));
    g.add(screen(w * 0.84, h * 0.3, x, h * 0.5, -1.3, 0, 0.15 + i * 0.22), screen(w * 0.84, 3.4, x, 4.2, -1.3, 0, 0.6 + i * 0.17));
  });
  for (let i = 0; i < 9; i++) g.add(at(box(9, 0.5, 0.9, '#e23a2e'), 0, i * 0.5, 9.4 - i * 0.8));          // red steps
  g.add(at(box(9, 4.5, 0.5, '#f2c9c4'), 0, 0, 2.0), ...treeAt(-9, 0, 9, 5), ...treeAt(9, 0, 9, 5), ...treeAt(-17, 0, 7, 5.5), ...treeAt(17, 0, 7, 5.5));
  return g;
}

// ------------------------------------------------------------------ 샌프란시스코

// 나란한 빅토리아풍 집 6채 · 집마다 다른 파스텔 색 · 뾰족 박공지붕과 돌출창 · 앞 계단
function sanfrancisco_paintedladies() {
  const cols = ['#f3d48a', '#9fc7e8', '#e9a7a0', '#b9d9a8', '#cdb7e6', '#f1e6c8'], T = '#fbf7ee', RF = '#6b6f7a';
  const g = group(at(prism([[-21, 0], [21, 0], [21, 3.4], [-21, 0.6]], 16, '#8fd067'), 0, 0, 0), at(box(42, 0.2, 5, '#9a9da6'), 0, 0.3, 7.4));
  for (let i = 0; i < 6; i++) {
    const x = -15.5 + i * 6.2, y = 0.8 + i * 0.5, c = cols[i];
    g.add(at(box(5, 8.4, 9, c), x, y, -1), at(gableRoof(5, 9, 3, RF, 0.25), x, y + 8.4, -1), at(prism([[-2.6, 0], [0, 3.1], [2.6, 0]], 0.3, c), x, y + 8.4, 3.55), at(box(5.3, 0.3, 0.4, T), x, y + 8.3, 3.6),
      at(box(2.5, 6.2, 1.5, c), x - 1.1, y + 1.2, 4.2), at(cone(1.9, 1.3, RF, 4), x - 1.1, y + 7.4, 4.2, Math.PI / 4), at(box(1.6, 1.7, 0.15, '#cfe6f5'), x - 1.1, y + 2.2, 4.98), at(box(1.6, 1.7, 0.15, '#cfe6f5'), x - 1.1, y + 4.8, 4.98),
      at(box(2.7, 0.25, 1.7, T), x - 1.1, y + 4.1, 4.2), at(box(1.2, 2.3, 0.15, '#7a4a3a'), x + 1.5, y + 1.2, 3.55), at(box(1.3, 1.5, 0.15, '#cfe6f5'), x + 1.5, y + 5, 3.55), at(box(0.9, 0.9, 0.15, '#cfe6f5'), x, y + 9.3, 3.72));
    for (let k = 0; k < 4; k++) g.add(at(box(1.6, 0.3, 0.6, T), x + 1.5, y + 0.9 - k * 0.3, 4 + k * 0.6));
  }
  [[-16, 22, 7], [-7, 34, 6], [2, 27, 8], [11, 40, 6], [19, 24, 7]].forEach(([x, h, w], i) => g.add(at(box(w, h, w, i % 2 ? '#c3cedc' : '#d5dde8'), x, 0, -22)));
  g.add(at(cone(3.6, 26, '#eef1f4', 4), 11, 14, -22, Math.PI / 4));
  return g;
}

// 언덕을 내려오는 지그재그 길 · 붉은 벽돌 포장 · 굽이마다 꽃밭 · 양옆 집
function sanfrancisco_lombard() {
  const BR = '#b5523a', fl = ['#ff7fa8', '#d08bff', '#ffffff', '#ff9fbd', '#8fb8ff'];
  const inner = group(at(prism([[-20, 0], [18, 0], [18, 1], [-20, 17]], 22, '#6fbf5e'), 0, 0, 0));
  const yAt = (u) => 1 + ((18 - u) / 38) * 16;
  for (let k = 0; k < 8; k++) {
    const u = 14 - k * 4.4, dir = k % 2 ? 1 : -1;
    const seg = at(box(4.6, 0.3, 13, BR), u, yAt(u) + 0.1, 0); seg.rotation.y = dir * 0.2; seg.rotation.z = -0.38; inner.add(seg);
    inner.add(at(cyl(1.5, 1.5, 0.3, BR, 8), u - 2.2, yAt(u - 2.2) + 0.2, dir * 6.2));
    for (let j = 0; j < 5; j++) inner.add(blob(0.9, fl[(k + j) % 5], u - 2.2, yAt(u - 2.2) + 0.7, -dir * (6 - j * 2.4), [1.2, 0.8, 1.2]), blob(0.8, '#4fa84f', u - 2.4, yAt(u - 2.4) + 0.4, -dir * (5 - j * 2.4)));
  }
  for (const s of [-1, 1]) for (let k = 0; k < 4; k++) { const u = 12 - k * 9, c = ['#f3d48a', '#9fc7e8', '#e9a7a0', '#f1e6c8'][(k + (s > 0 ? 1 : 0)) % 4]; inner.add(at(box(7, 6, 6, c), u, yAt(u) - 1, s * 15), at(box(7.3, 0.4, 6.3, '#fbf7ee'), u, yAt(u) + 5, s * 15), at(box(0.15, 1.6, 1.4, '#cfe6f5'), u + 3.55, yAt(u) + 2, s * 15)); }
  inner.rotation.y = -Math.PI / 2;
  return group(inner);
}

// 흰색의 뾰족한 피라미드 빌딩 · 위쪽 양옆 날개 · 줄지은 창 · 꼭대기 뾰족탑
function sanfrancisco_transamerica() {
  const W = '#f1efe8', H = 56, R = 7.4;
  const g = group(at(cone(R, H, W, 4), 0, 3, 0, Math.PI / 4), at(box(13, 3, 13, '#dcd8cc'), 0, 0, 0));
  for (let y = 5; y < H * 0.8; y += 2.2) { const r = R * (1 - (y - 3) / H) + 0.03; g.add(at(cyl(r, r, 0.5, '#93a6b8', 4), 0, y, 0, Math.PI / 4)); }
  for (const s of [-1, 1]) g.add(at(box(1.5, 15, 2.2, W), s * (R * 0.707 * (1 - 31 / H) + 0.2), 30, 0), at(box(1.5, 1.2, 2.2, '#dcd8cc'), s * (R * 0.707 * (1 - 31 / H) + 0.2), 45, 0));
  g.add(at(cone(R * 0.2, H * 0.2, '#dfe4ea', 4), 0, 3 + H * 0.8, 0, Math.PI / 4));
  for (let i = 0; i < 4; i++) g.add(at(box(8 + i * 2, 12 + ((i * 7) % 3) * 6, 8, i % 2 ? '#c3cedc' : '#d5dde8'), -18 + i * 12.5 + (i > 1 ? 2 : 0), 0, -9));
  return g;
}

// 인터내셔널 오렌지색 · 주탑 2개에 가로대 4단 · 늘어진 주 케이블과 세로 줄 · 아래 바다
function sanfrancisco_goldengate(span = 80) {
  const S = span, O = '#e2502c', OD = '#c9431f', H = Math.min(32, 13 + S * 0.24), tz = [-S * 0.24, S * 0.24], x = 6.6;
  const g = bridgeBase(S, { deckW: 12.4, deck: '#8f8f96', rail: O, pier: '#b9a99a', water: null, bankX: [-4, 350] });
  g.add(at(box(0.5, 1.4, S, OD), -6.3, -1.5, 0), at(box(0.5, 1.4, S, OD), 6.3, -1.5, 0));
  if (S >= 20) {
    for (const z of tz) {
      for (const sx of [-1, 1]) g.add(at(box(2.2, H * 0.42 + 6, 2.8, O), sx * x, -6, z), at(box(1.8, H * 0.32, 2.4, O), sx * x, H * 0.42, z), at(box(1.4, H * 0.26, 2, O), sx * x, H * 0.74, z), at(box(4.2, 5, 4.6, '#b9a99a'), sx * x, -8, z));
      for (const [y, h] of [[6.2, 2.2], [H * 0.46, 1.8], [H * 0.72, 1.6], [H - 1.6, 1.6]]) g.add(at(box(x * 2, h, 1.8, O), 0, y, z), at(box(x * 2 - 3, h * 0.45, 1.9, OD), 0, y + h * 0.28, z));
    }
    for (const sx of [-1, 1]) g.add(...suspension(S, sx * x, tz, H, O, { deckY: 1, step: Math.max(2, S / 36), r: 0.2 }));
  }
  return g;
}

// ------------------------------------------------------------------ 먼 배경
function bg_manhattan() {
  const g = group(), cols = ['#c3cedc', '#d5dde8', '#b9c6d6', '#cfc6b8', '#dbe3ec'];
  for (let i = 0; i < 20; i++) { const h = 40 + ((i * 41) % 10) * 12, w = 18 + ((i * 13) % 4) * 5; g.add(at(box(w, h, w, cols[i % 5]), -250 + i * 26, 0, ((i * 7) % 3) * 12)); }
  g.add(at(box(22, 150, 22, '#d9cfbb'), -40, 0, 0), at(box(14, 24, 14, '#d9cfbb'), -40, 150, 0), at(cone(4, 40, '#c9cfd8', 6), -40, 174, 0),                 // stepped tower with spire
    at(lathe([[13, 0], [12, 110], [8, 135], [3, 160], [0.4, 196]], '#c9d3de', 8), 60, 0, 0), at(cyl(10, 15, 190, '#a9c4dc', 4), 150, 0, 0, Math.PI / 4), at(cyl(0.6, 1.2, 40, '#dfe4ea', 5), 150, 190, 0));
  return g;
}
function bg_alcatraz() {
  const g = group(at(dome(60, '#c2a878', 10), 0, -3, 0, 0, [1.5, 0.3, 0.6]), at(dome(40, '#8fb86a', 8), -30, 2, 0, 0, [1.3, 0.3, 0.5]));
  g.add(at(box(70, 12, 16, '#e9e3d6'), 6, 15, 0), at(box(72, 2, 17, '#b9b3a4'), 6, 27, 0), at(cyl(2.4, 3, 30, '#f4f6f8', 8), -44, 13, 0), at(cyl(3.2, 3.2, 4, '#3d5a80', 8), -44, 43, 0), at(cone(3.6, 4, '#5a6b7a', 8), -44, 47, 0),
    at(cyl(5, 5, 8, '#b9a58a', 8), 56, 30, 0), at(box(1, 16, 1, '#8a7a66'), 53, 14, 0), at(box(1, 16, 1, '#8a7a66'), 59, 14, 0));
  return g;
}

export const US = {
  newyork_liberty, newyork_brooklynbridge, newyork_empirestate, newyork_timessquare,
  sanfrancisco_paintedladies, sanfrancisco_lombard, sanfrancisco_transamerica, sanfrancisco_goldengate,
  bg_manhattan, bg_alcatraz,
};
