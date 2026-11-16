// Korean landmarks, part 2: Busan, Suwon, Ulsan, Gyeongju. Conventions as in kr.js.
import { box, cyl, cone, sphere, dome, beam, prism, lathe, at, group } from '../kit.js';
import { tileRoof, hall, archWall, parapet, bridgeBase, suspension, towerFrame, suspensionSpan } from '../parts.js';

const STONE = '#e9e4d6', STONE_D = '#cfc9b8', ROOF = '#4a4e57', RED = '#b5372e', DAN = '#2f8f6f';
const GREEN = '#5cb85c', GREEN_D = '#46a04f', SAND = '#f3dfa6', SEA = '#3aa7ea';
const blob = (r, color, x, y, z, s) => at(sphere(r, color, 7), x, y, z, 0, s);
const pineAt = (x, y, z, h = 4) => [at(cyl(0.15, 0.22, h * 0.5, '#8a5a3a', 5), x, y, z), blob(h * 0.34, '#2f8f55', x, y + h * 0.62, z, [1.2, 0.7, 1.2]), blob(h * 0.24, '#3a9d62', x + 0.4, y + h * 0.86, z, [1.1, 0.6, 1.1])];
const munru = (w, d, y, two = true) => {
  const g = group(at(hall(w, d, 2.4, 2.0, { base: 0.3, wall: '#e8d9c0', col: RED, roof: ROOF, band: DAN, cols: 6 }), 0, y, 0));
  if (two) g.add(at(hall(w * 0.78, d * 0.7, 1.7, 2.3, { base: 0.2, wall: '#e8d9c0', col: RED, roof: ROOF, band: DAN, cols: 5 }), 0, y + 4.6, 0));
  return g;
};

// ------------------------------------------------------------------ 부산

// 모래사장 뒤 유리 고층 건물 무리 · 가장 높은 3동은 곡면 · 파란 유리와 흰 테두리
function busan_haeundae() {
  const g = group(at(box(64, 0.3, 22, SAND), 0, 0, 2), at(box(64, 0.12, 5, '#bfe6f7'), 0, 0.02, 15));
  const curved = (x, z, h, r) => {
    const t = group(at(lathe([[r, 0], [r * 1.08, h * 0.3], [r, h * 0.66], [r * 0.72, h * 0.9], [r * 0.2, h]], '#69b4e6', 12), 0, 0, 0));
    for (let y = 3; y < h * 0.86; y += 3.4) t.add(at(cyl(r * 1.1, r * 1.1, 0.35, '#f4f8fb', 12), 0, y, 0));
    return at(t, x, 0.3, z);
  };
  g.add(curved(-6, -3, 40, 4.6), curved(4, -4.5, 34, 4.2), curved(13, -2, 29, 4));
  [[-24, 20, 7], [-15, 25, 6], [22, 22, 7], [29, 16, 6], [-30, 13, 6]].forEach(([x, h, w], i) => {
    g.add(at(box(w, h, w, '#e9eef3'), x, 0.3, -3 - (i % 2) * 2));
    for (let y = 2.4; y < h - 1; y += 2.6) g.add(at(box(w + 0.15, 1.1, w * 0.86, '#69b4e6'), x, y, -3 - (i % 2) * 2));
  });
  for (let i = 0; i < 6; i++) g.add(at(cyl(0.05, 0.05, 2, '#ffffff', 5), -20 + i * 8, 0.3, 9), at(cone(1.4, 0.6, ['#ff6b6b', '#ffd23f', '#59c3ff'][i % 3], 8), -20 + i * 8, 2.1, 9));
  return g;
}

// 언덕에 계단식으로 붙은 상자 집 · 알록달록 파스텔 벽 · 납작한 지붕 · 좁은 계단길
function busan_gamcheon() {
  const cols = ['#ffb3c8', '#ffe27a', '#9fd8ff', '#b4f0b8', '#ffc59a', '#d0b8ff', '#ffffff', '#7fd6c8', '#ff9a8a'];
  const g = group();
  for (let k = 0; k < 6; k++) {
    const y = k * 2.7, z = -k * 3.4, w = 46 - k * 4;
    g.add(at(box(w + 4, y + 0.4, 3.6, '#8fb86a'), 0, 0, z - 1.6));
    for (let x = -w / 2, i = 0; x < w / 2 - 2; i++) {
      const bw = 2.6 + ((i * 7 + k * 3) % 4) * 0.55, bh = 2.3 + ((i + k) % 3) * 0.5, c = cols[(i * 5 + k * 2) % cols.length];
      g.add(at(box(bw, bh, 3, c), x + bw / 2, y + 0.4, z), at(box(bw + 0.2, 0.2, 3.2, '#dfe6ea'), x + bw / 2, y + 0.4 + bh, z), at(box(0.8, 0.8, 0.1, '#5f8fb0'), x + bw / 2, y + 1.4, z + 1.52));
      x += bw + 0.35;
    }
  }
  for (let k = 0; k < 6; k++) g.add(at(box(1.4, 0.3, 3.6, '#eeeeee'), -3 + (k % 2) * 6, k * 2.7 + 0.2, -k * 3.4 + 2.2));
  return g;
}

// 흰 원기둥 · 위쪽 팔각 정자 모양 전망대 · 꼭대기 뾰족한 침 · 아래 공원 언덕
function busan_tower() {
  const g = group(at(dome(18, GREEN, 12), 0, 0, 0, 0, [1.2, 0.36, 1]));
  for (let i = 0; i < 14; i++) { const a = i * 2.3, r = 8 + (i % 4) * 3; g.add(blob(2, i % 2 ? GREEN_D : '#6cc56a', Math.cos(a) * r, Math.max(2.6, 6.4 - r * 0.28), Math.sin(a) * r)); }
  const y = 6.2;
  g.add(
    at(cyl(3.6, 4.2, 1.6, '#e6eaee', 12), 0, y, 0), at(cyl(1.7, 2.3, 26, '#f6f8fa', 12), 0, y + 1.6, 0),
    at(cyl(4.2, 2.0, 1.6, '#eef1f4', 8), 0, y + 27.6, 0), at(cyl(4.3, 4.3, 2.2, '#3d5a80', 8), 0, y + 29.2, 0), at(cyl(4.6, 4.6, 0.4, '#f6f8fa', 8), 0, y + 31.4, 0),
    at(cone(5.6, 2.4, '#5a6b7a', 8), 0, y + 31.8, 0),
    at(cyl(2.6, 2.6, 1.6, '#3d5a80', 8), 0, y + 33.6, 0), at(cone(3.6, 2.2, '#5a6b7a', 8), 0, y + 35.2, 0),
    at(cyl(0.08, 0.3, 6, '#dfe4ea', 6), 0, y + 37.2, 0),
  );
  return g;
}

// 2층 트러스 상판 · 주탑 2개 · 늘어진 현수 케이블 · 아래 바다
function busan_gwanganbridge(span = 80) {
  const S = span, W = '#eef1f5', x = 5.9, H = Math.min(24, 10 + S * 0.18), tz = [-S * 0.24, S * 0.24];
  const g = bridgeBase(S, { deckW: 12.4, deck: '#b9c0cc', rail: W, water: null, bankX: [-350, 4] });
  g.add(at(box(12.4, 0.8, S, '#b9c0cc'), 0, 5.2, 0));
  for (const sx of [-1, 1]) for (let z = -S / 2; z < S / 2 - 0.5; z += 5) {
    const z1 = Math.min(S / 2, z + 2.5), z2 = Math.min(S / 2, z + 5);
    g.add(beam([sx * x, 1, z], [sx * x, 5.2, z1], 0.16, W, 4), beam([sx * x, 5.2, z1], [sx * x, 1, z2], 0.16, W, 4));
  }
  if (S >= 20) {
    for (const z of tz) g.add(at(towerFrame(H, x + 0.9, 1.4, 2, W, [9, H * 0.62, H - 1.4], { y0: -5 }), 0, 0, z));
    for (const sx of [-1, 1]) g.add(...suspension(S, sx * (x + 0.9), tz, H, W, { deckY: 6, step: Math.max(2.5, S / 28) }));
  }
  return g;
}

// 도시 카드용 그림: 광안리 바닷가 — 모래사장과 파라솔, 바다 건너 광안대교
function thumb_gwangalli() {
  const g = group(at(box(120, 0.1, 80, SEA), 0, 0.03, -34), at(box(120, 0.4, 26, SAND), 0, 0, 12), at(box(120, 0.14, 2.4, '#ffffff'), 0, 0.06, -1.4));
  const br = suspensionSpan(110, { towerX: 30, towerH: 26, deckY: 8, doubleDeck: true, color: '#f6f8fa', y0: 0 });
  g.add(at(br, 0, 0, -30));
  for (let i = 0; i < 5; i++) { const x = -22 + i * 11, z = 8 + (i % 2) * 5; g.add(at(cyl(0.12, 0.12, 4, '#ffffff', 5), x, 0.4, z), at(cone(3.2, 1.3, ['#ff6b6b', '#ffd23f', '#59c3ff', '#ff9fbd', '#5fd36a'][i], 8), x, 4.2, z), at(box(4.6, 0.3, 1.8, '#59c3ff'), x + 1, 0.5, z + 2.6)); }
  for (const [x, h] of [[-48, 18], [-40, 24], [42, 20], [50, 14]]) g.add(at(box(7, h, 7, '#e9eef3'), x, 0, -6), at(box(7.2, h * 0.5, 6, '#69b4e6'), x, h * 0.3, -6));
  return g;
}

// ------------------------------------------------------------------ 수원

// 돌 육축에 무지개문 1개 · 2층 기와 문루 · 앞쪽 반원 옹성 · 성벽 위 여장
function suwon_janganmun() {
  const g = group(
    archWall(30, 8, 7, '#d9d2c2', [{ x: 0, w: 9.2, h: 7 }]),
    ...parapet(30, '#c4bca9', 8, 3.25), ...parapet(30, '#c4bca9', 8, -3.25),
    munru(21, 5, 8),
    at(box(26, 5, 3, '#d9d2c2'), -28, 0, 0), at(box(26, 5, 3, '#d9d2c2'), 28, 0, 0), ...parapet(26, '#c4bca9', 5, 1.25).map((m) => { m.position.x -= 28; return m; }), ...parapet(26, '#c4bca9', 5, 1.25).map((m) => { m.position.x += 28; return m; }),
  );
  // 옹성: half-round outer wall in front of the gate, open in the middle for the road
  const R = 9.5;
  for (let i = 0; i <= 12; i++) {
    const a = (i / 12) * Math.PI, x = Math.cos(a) * R, z = -3.5 - Math.sin(a) * R * 0.75;
    if (Math.abs(x) < 5.4) continue;
    g.add(at(box(2.7, 5.4, 1.6, '#8f8a80'), x, 0, z, Math.atan2(Math.cos(a) * 0.75, -Math.sin(a))), at(box(1.4, 0.8, 1.7, '#7d766c'), x, 5.4, z));
  }
  return g;
}

// 성곽 위 3층 벽돌 망루 · 벽에 뚫린 총안 구멍 · 기와지붕 · 양옆으로 이어지는 성곽과 여장
function suwon_gongsimdon() {
  const g = group(at(box(52, 5, 3.4, '#d9d2c2'), 0, 0, 0), ...parapet(52, '#c4bca9', 5, 1.4), at(box(8.4, 7, 8.4, '#cfc8b6'), 0, 0, 0.6));
  g.add(at(prism([[-3.7, 0], [3.7, 0], [3.1, 9], [-3.1, 9]], 6.6, '#8f867a'), 0, 7, 0.6));
  for (let f = 0; f < 3; f++) for (const x of [-1.8, 0, 1.8]) g.add(at(box(0.5, 0.7, 6.8, '#3a3632'), x * (1 - f * 0.05), 8.2 + f * 2.7, 0.6), at(box(6.9, 0.7, 0.5, '#3a3632'), 0, 8.2 + f * 2.7, 0.6 + x));
  g.add(at(box(7, 0.4, 7, '#6e665c'), 0, 16, 0.6), at(hall(5.4, 5.4, 1.8, 2.2, { base: 0.2, wall: '#e8d9c0', col: RED, roof: ROOF, band: DAN, cols: 3 }), 0, 16.4, 0.6));
  return g;
}

// 무지개 수문 7개 · 그 위 기와 누각 · 아래로 흐르는 개울
function suwon_hwahongmun() {
  const ops = Array.from({ length: 7 }, (_, i) => ({ x: (i - 3) * 4.2, w: 3.1, h: 3.6 }));
  return group(
    at(box(34, 0.1, 40, SEA), 0, 0.02, 4), at(box(34, 0.5, 2, '#bfe6f7'), 0, 0.02, 4.4),
    archWall(32, 5, 6, '#d9d2c2', ops), ...parapet(32, '#c4bca9', 5, 2.75), ...parapet(32, '#c4bca9', 5, -2.75),
    at(hall(13, 4.6, 2.6, 2.4, { base: 0.3, wall: '#e8d9c0', col: RED, roof: ROOF, band: DAN, cols: 5 }), 0, 5, 0),
    at(box(10, 0.9, 30, '#8fd067'), -22, 0, 4), at(box(10, 0.9, 30, '#8fd067'), 22, 0, 4),
    ...pineAt(-21, 0.9, -6, 5), ...pineAt(22, 0.9, -8, 5),
  );
}

// 낮고 넓은 기와 전각 · 붉은 정문(신풍루) 2층 누각 · 돌담 · 앞마당 느티나무
function suwon_haenggung() {
  const lowHall = (x, z, w) => at(hall(w, 5, 2.6, 2.2, { wall: '#efe6d2', col: '#8a3a2a', roof: ROOF }), x, 0, z);
  return group(
    at(box(18, 3.6, 0.9, '#e6dcc6'), -17, 0, 6), at(box(18, 3.6, 0.9, '#e6dcc6'), 17, 0, 6),
    at(tileRoof(1.8, 18, 0.6, ROOF, { axis: 'x' }), -17, 3.6, 6), at(tileRoof(1.8, 18, 0.6, ROOF, { axis: 'x' }), 17, 3.6, 6),
    archWall(13, 4, 4.6, '#e9e2d0', [{ x: 0, w: 2.8, h: 3.2 }, { x: -4.2, w: 2.2, h: 2.8 }, { x: 4.2, w: 2.2, h: 2.8 }]).translateZ(6),
    ...[-4.2, 0, 4.2].map((x) => at(box(1.9, 2.4, 0.2, RED), x, 0, 8.2)),
    at(hall(12.6, 4.4, 2.3, 2.6, { base: 0.25, wall: '#e8d9c0', col: RED, roof: ROOF, band: DAN, cols: 5 }), 0, 4, 6),
    lowHall(0, -8, 22), lowHall(-15, -1, 9), lowHall(15, -1, 9),
    at(cyl(0.6, 0.9, 4, '#8a5a3a', 6), -9, 0, 12), blob(4, GREEN, -9, 6.5, 12, [1.2, 0.8, 1.2]), blob(3, GREEN_D, -7, 8, 11),
    at(cyl(0.5, 0.8, 3.6, '#8a5a3a', 6), 10, 0, 12.5), blob(3.6, GREEN_D, 10, 6, 12.5, [1.2, 0.8, 1.2]),
  );
}

// ------------------------------------------------------------------ 울산

// 빽빽한 대나무 숲 · 마디 있는 녹색 줄기 · 숲 사이 흙길 · 낮은 대나무 울타리
function ulsan_bamboo() {
  const g = group(at(box(46, 0.08, 4, '#d9c79a'), 0, 0.02, 6), at(box(46, 0.9, 0.15, '#b9a56a'), 0, 0, 3.6), at(box(46, 0.9, 0.15, '#b9a56a'), 0, 0, 8.4));
  for (let i = 0; i < 70; i++) {
    const hx = Math.sin(i * 12.9898) * 43758.5453, hz = Math.sin(i * 78.233) * 12543.123;
    const x = (hx - Math.floor(hx) - 0.5) * 44, zr = hz - Math.floor(hz), z = zr < 0.7 ? -zr * 16 + 2.6 : 9.4 + (zr - 0.7) * 12, h = 11 + (i % 5) * 1.4;
    g.add(at(cyl(0.13, 0.18, h, i % 3 ? '#74bd55' : '#5fa945', 5), x, 0, z));
    for (let k = 1; k < 5; k++) g.add(at(box(0.36, 0.07, 0.36, '#447f34'), x, (h * k) / 5, z));
    g.add(blob(1.3, i % 2 ? '#62b84c' : '#7acb60', x, h, z, [1.3, 0.7, 1.3]));
  }
  return g;
}

// 흰 주탑 2개 · 주탑 사이를 한 번에 건너는 현수교 · 가는 케이블 · 아래 바다
function ulsan_bridge() {
  return group(suspensionSpan(120, { towerX: 42, towerH: 36, deckY: 9, color: '#f6f8fa' }), at(box(10, 12, 9, '#b5bac4'), -59, -6, 0), at(box(10, 12, 9, '#b5bac4'), 59, -6, 0));
}

// 누런 바위섬 무리 · 바위를 잇는 출렁다리 · 바위 위 소나무
function ulsan_daewangam() {
  const rock = (x, z, r, h) => group(at(sphere(r, '#d0ab6c', 6), x, h * 0.2, z, 0, [1.2, h / r, 1]), at(sphere(r * 0.7, '#bf9858', 6), x + r * 0.6, h * 0.05, z + r * 0.3, 0, [1, h / r * 0.8, 1]));
  const g = group(rock(-16, 0, 7, 8), rock(-2, -2, 9, 11), rock(13, 1, 6, 7), rock(22, -3, 4, 5), at(box(60, 6, 18, '#c9a468'), 0, -8, 0));
  g.add(...pineAt(-3, 9.5, -2, 4), ...pineAt(1, 8.6, 0, 3.4), ...pineAt(-16, 6.6, 0, 3.4), ...pineAt(13, 5.6, 1, 3));
  // 출렁다리
  g.add(at(box(22, 0.25, 1.6, '#f4f6f8'), -27, 5.2, 4), at(cyl(0.3, 0.3, 4, '#e23a2e', 6), -38, 4, 4), at(cyl(0.3, 0.3, 4, '#e23a2e', 6), -16, 4, 4));
  for (const dz of [-0.8, 0.8]) for (let i = 0; i < 8; i++) { const u0 = i / 8, u1 = (i + 1) / 8, y = (u) => 8 - 9 * u * (1 - u); g.add(beam([-38 + 22 * u0, y(u0), 4 + dz], [-38 + 22 * u1, y(u1), 4 + dz], 0.07, '#e23a2e', 4)); }
  g.add(at(box(14, 6, 10, '#9bd66f'), -45, -1, 4));
  return g;
}

// 흰 등대 · 기와지붕 모양 전망부 · 옆에 큰 소망 우체통 · 바닷가 언덕
function ulsan_ganjeolgot() {
  const g = group(at(cyl(17, 20, 8, '#9bd66f', 12), 0, -8, 0), at(cyl(20, 22, 4, '#b9b3a4', 12), 0, -9, 0));
  g.add(
    at(cyl(3, 3.4, 1.4, '#e9edf1', 8), 0, 0, 0), at(cyl(1.7, 2.2, 13, '#ffffff', 10), 0, 1.4, 0),
    at(cyl(2.9, 2.9, 0.4, '#e9edf1', 8), 0, 14.4, 0), at(cyl(2.0, 2.0, 2.0, '#9fd8ff', 8), 0, 14.8, 0),
    at(cone(3.3, 1.9, ROOF, 8), 0, 16.8, 0), at(cyl(0.2, 0.2, 1.2, '#d8b24a', 6), 0, 18.7, 0),
    // 소망 우체통
    at(box(3, 4.6, 2.4, '#5f7a4a'), 9, 0.6, 3), at(cyl(1.5, 1.5, 2.4, '#5f7a4a', 10).rotateX(Math.PI / 2), 9, 5.2, 4.2), at(box(1.8, 0.3, 0.2, '#22301c'), 9, 4.1, 4.25), at(box(3.6, 0.6, 3, '#4a5f3a'), 9, 0, 3),
    ...pineAt(-8, 0, 4, 4.5), ...pineAt(-11, 0, -3, 5), ...pineAt(7, 0, -7, 4.5),
  );
  return g;
}

// ------------------------------------------------------------------ 경주

// 둥글고 큰 잔디 고분 여러 개 · 두 봉우리가 붙은 쌍분 · 고분 사이 소나무
function gyeongju_daereungwon() {
  const mound = (x, z, r, c = '#7fc95e') => at(dome(r, c, 14), x, 0, z, 0, [1, 0.66, 1]);
  return group(
    mound(-20, -4, 11), mound(-2, -8, 9, '#8ad468'), mound(9, -8, 9, '#8ad468'), mound(24, -2, 8), mound(-6, 8, 5.5, '#8ad468'), mound(14, 8, 6),
    ...pineAt(-10, 0, 3, 6), ...pineAt(4, 0, 6, 5.5), ...pineAt(18, 0, -12, 6), ...pineAt(-30, 0, 6, 5), ...pineAt(30, 0, 8, 5.5),
    at(box(70, 0.9, 0.6, STONE_D), 0, 0, 15),
  );
}

// 병 모양으로 휘어진 돌탑 · 가운데 네모 창 · 꼭대기 井자 돌 · 네모난 기단
function gyeongju_cheomseongdae() {
  const C = '#cdbfa3', D = '#b3a488';
  const g = group(at(box(6.6, 0.5, 6.6, D), 0, 0, 0), at(box(5.8, 0.5, 5.8, C), 0, 0.5, 0));
  const prof = [[2.55, 0], [2.6, 0.8], [2.5, 2.4], [2.2, 4.4], [1.75, 6.2], [1.55, 7.4], [1.5, 8.6], [1.5, 9.3]];
  g.add(at(lathe(prof, C, 18), 0, 1, 0));
  const rAt = (y) => { for (let i = 0; i < prof.length - 1; i++) if (y <= prof[i + 1][1]) { const u = (y - prof[i][1]) / (prof[i + 1][1] - prof[i][1]); return prof[i][0] + (prof[i + 1][0] - prof[i][0]) * u; } return 1.5; };
  for (let y = 0.75; y < 9.2; y += 0.75) g.add(at(cyl(rAt(y) + 0.03, rAt(y) + 0.03, 0.07, D, 18), 0, 1 + y, 0));
  g.add(at(box(1.0, 1.0, 0.5, '#3a3530'), 0, 5.0, rAt(4.4) - 0.15));
  for (const [y, rot] of [[10.3, 0], [10.7, Math.PI / 2]]) for (const s of [-1, 1]) g.add(at(group(at(box(3.6, 0.4, 0.45, C), 0, 0, s * 1.1)), 0, y, 0, rot));
  return g;
}

// 연못가 기와 누각 3채 · 돌 축대 · 잔잔한 연못 · 연못 속 작은 섬
function gyeongju_wolji() {
  const pav = (x, z, w, ry) => at(group(at(box(w + 2, 1.6, 6.5, STONE), 0, 0, 0), at(hall(w, 5, 2.6, 2.4, { base: 0.3, wall: '#e8d9c0', col: RED, roof: ROOF, band: DAN, cols: 4 }), 0, 1.6, 0)), x, 0, z, ry);
  const g = group(at(box(60, 0.1, 30, '#58b6e6'), 0, 0.03, 4), at(box(62, 1.2, 1.2, STONE_D), 0, 0, -11.5), at(box(1.2, 1.2, 30, STONE_D), -30.5, 0, 4));
  g.add(pav(-18, -11, 9, 0), pav(2, -11, 7, 0), pav(-30, 2, 7, Math.PI / 2));
  g.add(at(dome(5, '#7fc95e', 10), 14, 0, 6, 0, [1.3, 0.4, 1]), ...pineAt(14, 1.6, 6, 4.5), ...pineAt(11, 1.2, 7, 3.5), ...pineAt(22, 0, -13, 5), ...pineAt(-8, 0, -14, 5));
  return g;
}

// 높은 돌 축대 · 청운교·백운교 돌계단 · 모양이 다른 두 탑(다보탑·석가탑) · 기와 문루
function gyeongju_bulguksa() {
  const g = group(at(box(46, 3.2, 10, '#bdb5a2'), 0, 0, -3), at(box(46, 3, 9.4, STONE), 0, 3.2, -3.3), at(box(46.4, 0.4, 10.2, STONE_D), 0, 3.0, -3));
  for (let x = -21; x <= 21; x += 3) g.add(at(box(0.5, 3, 0.4, STONE_D), x, 3.2, 1.5));
  // 청운교 · 백운교
  for (let i = 0; i < 12; i++) g.add(at(box(5, 0.52, 0.8, '#d9d2c2'), -6, i * 0.52, 8.6 - i * 0.62));
  g.add(at(box(0.4, 1, 8, STONE_D), -8.7, 3.4, 5).rotateX(0.7), at(box(0.4, 1, 8, STONE_D), -3.3, 3.4, 5).rotateX(0.7));
  g.add(at(hall(9, 4.6, 2.6, 2.4, { base: 0.3, wall: '#e8d9c0', col: RED, roof: ROOF, band: DAN, cols: 4 }), -6, 6.2, -1.5));
  g.add(at(hall(8, 4, 2.4, 2.2, { base: 0.3, wall: '#e8d9c0', col: RED, roof: ROOF, band: DAN, cols: 4 }), 14, 6.2, -1.5));
  const y = 6.2, S = '#d6cfbf';
  // 석가탑: plain three storeys
  const sx = -16, sz = -4;
  g.add(at(box(4.4, 0.8, 4.4, S), sx, y, sz), at(box(3.6, 0.9, 3.6, S), sx, y + 0.8, sz));
  [[2.4, 1.8, 3.9], [2.0, 1.2, 3.3], [1.6, 1.0, 2.7]].reduce((yy, [w, h, rw]) => { g.add(at(box(w, h, w, S), sx, yy, sz), at(prism([[-rw / 2, 0], [rw / 2, 0], [w / 2, 0.55], [-w / 2, 0.55]], rw, STONE_D), sx, yy + h, sz)); return yy + h + 0.55; }, y + 1.7);
  g.add(at(cyl(0.12, 0.3, 2.2, '#8f8a7c', 6), sx, y + 7.4, sz), at(sphere(0.35, '#8f8a7c', 6), sx, y + 8.3, sz));
  // 다보탑: stairs, four pillars, railings, octagonal upper part
  const dx = 4, dz = -4;
  g.add(at(box(5, 1.4, 5, S), dx, y, dz));
  for (const [ax, az] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) g.add(at(box(ax ? 1.6 : 1.3, 0.7, az ? 1.6 : 1.3, STONE_D), dx + ax * 3, y, dz + az * 3));
  for (const [px, pz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) g.add(at(box(0.6, 2.2, 0.6, S), dx + px * 1.7, y + 1.4, dz + pz * 1.7));
  g.add(at(box(0.9, 2.2, 0.9, S), dx, y + 1.4, dz), at(box(5.4, 0.45, 5.4, STONE_D), dx, y + 3.6, dz), at(box(4.2, 0.6, 4.2, S), dx, y + 4.05, dz),
    at(cyl(1.5, 1.5, 1.3, S, 8), dx, y + 4.65, dz), at(cyl(2.3, 2.0, 0.4, STONE_D, 8), dx, y + 5.95, dz), at(cyl(1.1, 1.1, 1.1, S, 8), dx, y + 6.35, dz),
    at(cone(2.3, 0.9, STONE_D, 8), dx, y + 7.45, dz), at(cyl(0.12, 0.3, 1.8, '#8f8a7c', 6), dx, y + 8.3, dz), at(sphere(0.32, '#8f8a7c', 6), dx, y + 9.2, dz));
  return g;
}

// ------------------------------------------------------------------ 먼 배경
function bg_seahorizon() {
  const g = group();
  [[-150, 34, 70], [-40, 22, 46], [90, 40, 80], [190, 18, 40]].forEach(([x, h, r], i) => g.add(at(dome(r, i % 2 ? '#8fc7b6' : '#7fbba8', 10), x, -3, 0, 0, [1.4, h / r, 0.5])));
  g.add(at(box(40, 5, 8, '#f4f6f8'), 30, -3, -40), at(box(12, 9, 6, '#f4f6f8'), 40, 2, -40), at(box(26, 4, 7, '#e2574c'), -100, -3, -60), at(box(6, 6, 5, '#f4f6f8'), -108, 1, -60));
  return g;
}
function bg_hills() {
  const g = group();
  [[-170, 62, 110, '#7cc87d'], [-40, 84, 130, '#6fbf73'], [110, 70, 120, '#84cf84'], [230, 48, 90, '#6fbf73']].forEach(([x, h, r, c]) => g.add(at(dome(r, c, 10), x, 0, 0, 0, [1.3, h / r, 0.5])));
  return g;
}
function bg_paldalsan() {
  const g = group(at(dome(130, '#6fbf73', 12), 0, 0, 0, 0, [1.6, 0.42, 0.5]), at(dome(90, '#7cc87d', 10), -190, 0, 10, 0, [1.4, 0.36, 0.5]));
  for (let i = -6; i <= 6; i++) g.add(at(box(17, 5, 4, '#e3dccb'), i * 17, 54 - Math.abs(i) * Math.abs(i) * 1.15, 0));
  g.add(at(hall(22, 12, 6, 6, { wall: '#e8d9c0', col: RED, roof: ROOF, band: DAN }), 0, 58, 0));
  return g;
}
function bg_shipyard() {
  const g = group();
  [[-110, 96], [0, 110], [120, 90]].forEach(([x, h], i) => {
    const c = i % 2 ? '#ff8a3d' : '#f26b3a';
    g.add(at(box(7, h, 9, c), x - 34, 0, 0), at(box(7, h, 9, c), x + 34, 0, 0), at(box(84, 12, 11, c), x, h, 0), at(box(8, 14, 8, '#ffd23f'), x + 10, h - 14, 0));
  });
  g.add(at(box(190, 26, 30, '#3d5a80'), 10, 0, 30), at(box(190, 6, 30, '#c0392b'), 10, 0, 30.5), at(box(30, 22, 20, '#f4f6f8'), 80, 26, 30));
  return g;
}

export const KR2 = {
  busan_haeundae, busan_gamcheon, busan_tower, busan_gwanganbridge, thumb_gwangalli,
  suwon_janganmun, suwon_gongsimdon, suwon_hwahongmun, suwon_haenggung,
  ulsan_bamboo, ulsan_bridge, ulsan_daewangam, ulsan_ganjeolgot,
  gyeongju_daereungwon, gyeongju_cheomseongdae, gyeongju_wolji, gyeongju_bulguksa,
  bg_seahorizon, bg_hills, bg_paldalsan, bg_shipyard,
};
