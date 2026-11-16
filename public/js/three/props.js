// Roadside props. Each entry: build() → THREE.Group standing on y = 0.
//   sway: how much the top bends in the wind (0 = rigid)
//   face: true → front (+z) is turned toward the road instead of a random direction
//   tints: optional colours; one is picked per instance and multiplied over the model
import { box, cyl, cone, sphere, dome, ico, beam, prism, at, group } from './kit.js';
import { tileRoof, gableRoof, windowBands, hall } from './parts.js';

const TRUNK = '#9a6b45';
const blob = (r, color, x, y, z, s) => at(sphere(r, color, 7), x, y, z, 0, s);
// chunky 20-face lump for small things that are scattered by the hundred
const chip = (r, color, x, y, z, s) => at(ico(r, color), x, y, z, r * 7 + x, s);

function roundTree(leaf, leaf2, h = 5) {
  return group(
    at(cyl(0.22, 0.32, h * 0.5, TRUNK, 6), 0, 0, 0),
    blob(h * 0.3, leaf, 0, h * 0.62, 0), blob(h * 0.24, leaf2, h * 0.2, h * 0.5, 0.2), blob(h * 0.22, leaf, -h * 0.2, h * 0.52, -0.15), blob(h * 0.2, leaf2, 0, h * 0.82, 0.1),
  );
}
function pine(leaf, snow) {
  const g = group(at(cyl(0.2, 0.3, 1.6, TRUNK, 6), 0, 0, 0));
  [[2.0, 2.6, 1.2], [1.6, 2.3, 2.7], [1.15, 2.0, 4.1]].forEach(([r, h, y]) => {
    g.add(at(cone(r, h, leaf, 7), 0, y, 0));
    if (snow) g.add(at(cone(r * 0.72, h * 0.62, '#ffffff', 7), 0, y + h * 0.4, 0));
  });
  return g;
}
function tower(w, d, h, wall, glass, floors) {
  return group(at(box(w, h, d, wall), 0, 0, 0), ...windowBands(w, d, h / floors * 0.35, h / floors, floors, glass), at(box(w * 0.5, 1, d * 0.5, '#8d93a0'), 0, h, 0));
}

/** Cheap clump of trees for the far land: crowns only, few faces. */
function woods(a, b, cones) {
  const g = group();
  [[0, 0, 1], [2.6, 0.8, 0.8], [-2.4, 1.2, 0.9], [0.8, -2.4, 0.75], [-1.6, -2, 0.85], [3.2, -1.8, 0.65]].forEach(([x, z, k], i) => {
    const c = i % 2 ? b : a;
    g.add(cones ? at(cone(1.9 * k, 6.5 * k, c, 6), x, 0, z) : at(ico(2.5 * k, c), x, 2.5 * 1.25 * 0.85 * k, z, i * 1.3, [1, 1.25, 1]));
  });
  return g;
}

export const PROPS = {
  // ---------- far scenery (seen from a distance: few faces, big shapes)
  woods: { sway: 0.15, build: () => woods('#4fb35a', '#3f9e4d') },
  woods_pine: { sway: 0.1, build: () => woods('#2f8f55', '#277a48', true) },
  woods_snow: { sway: 0.1, build: () => woods('#ffffff', '#3a8a66', true) },
  woods_maple: { sway: 0.15, build: () => woods('#e8502e', '#ff8a3d') },
  woods_cherry: { sway: 0.15, build: () => woods('#ffb7d0', '#ffd0e0') },
  woods_ginkgo: { sway: 0.15, build: () => woods('#ffd23f', '#ffc21a', true) },
  hill: { build: () => group(at(dome(13, '#7fc95e', 10), 0, 0, 0, 0, [1.25, 0.5, 1]), at(dome(8, '#74bf55', 9), 9, 0, 3, 0, [1.2, 0.55, 1])), tints: ['#ffffff', '#e9f7d8', '#d6efc4', '#f4ffd9'] },
  snowhill: { build: () => group(at(dome(13, '#ffffff', 10), 0, 0, 0, 0, [1.25, 0.5, 1]), at(dome(8, '#eef5fb', 9), 9, 0, 3, 0, [1.2, 0.55, 1])) },
  block: { face: true, build: () => group(at(box(9, 22, 9, '#dfe6ee'), 0, 0, 0), at(box(9.2, 3, 7.4, '#6fb7e8'), 0, 4, 0), at(box(9.2, 3, 7.4, '#6fb7e8'), 0, 10, 0), at(box(9.2, 3, 7.4, '#6fb7e8'), 0, 16, 0), at(box(7.4, 3, 9.2, '#6fb7e8'), 0, 4, 0), at(box(7.4, 3, 9.2, '#6fb7e8'), 0, 10, 0), at(box(7.4, 3, 9.2, '#6fb7e8'), 0, 16, 0), at(box(4, 1.2, 4, '#8d93a0'), 0, 22, 0)),
    tints: ['#ffffff', '#e8f1ff', '#fff3e0', '#e6ffe9', '#ffe6ea', '#d9e2ee'] },
  tree: { sway: 1, build: () => roundTree('#4fb35a', '#63c56b') },
  ginkgo: { sway: 1, build: () => group(at(cyl(0.2, 0.3, 3, TRUNK, 6), 0, 0, 0), at(cone(1.9, 4.6, '#ffd23f', 7), 0, 1.8, 0), blob(1.3, '#ffc21a', 0, 3.2, 0, [1, 1.2, 1])) },
  cherry: { sway: 1, build: () => roundTree('#ffb7d0', '#ffd0e0', 4.6) },
  maple: { sway: 1, build: () => roundTree('#e8502e', '#ff8a3d', 4.8) },
  pine: { sway: 0.5, build: () => pine('#2f8f55', false) },
  pine_snow: { sway: 0.4, build: () => pine('#3a8a66', true) },
  cypress: { sway: 0.6, build: () => group(at(cyl(0.18, 0.25, 1.2, TRUNK, 6), 0, 0, 0), blob(1, '#2e7d4f', 0, 3.6, 0, [0.9, 2.9, 0.9])) },
  birch: { sway: 0.8, build: () => group(at(cyl(0.12, 0.2, 5.5, '#f1efe8', 6), 0, 0, 0), at(box(0.3, 0.12, 0.3, '#4a4a4a'), 0, 1.4, 0), at(box(0.28, 0.1, 0.28, '#4a4a4a'), 0, 3.1, 0),
    beam([0, 3.4, 0], [1.1, 4.8, 0.2], 0.06, '#e6e2d8'), beam([0, 4.0, 0], [-0.9, 5.4, -0.3], 0.06, '#e6e2d8'), blob(0.5, '#ffffff', 1.1, 4.9, 0.2), blob(0.55, '#ffffff', -0.9, 5.5, -0.3), blob(0.6, '#ffffff', 0, 5.8, 0)) },
  palm: { sway: 0.9, build: () => {
    const g = group(beam([0, 0, 0], [0.3, 2.4, 0], 0.22, '#b08a5a'), beam([0.3, 2.4, 0], [0.2, 5, 0], 0.18, '#b08a5a'));
    for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2; g.add(beam([0.2, 5, 0], [0.2 + Math.cos(a) * 2.1, 4.5, Math.sin(a) * 2.1], 0.16, i % 2 ? '#3fae5e' : '#55c26f', 4)); }
    return g;
  } },
  bamboo: { sway: 1.6, build: () => {
    const g = group();
    [[0, 0, 8.5], [0.7, 0.4, 7.4], [-0.6, 0.5, 9], [0.3, -0.7, 7.8], [-0.5, -0.5, 8.2]].forEach(([x, z, h], i) => {
      g.add(at(cyl(0.09, 0.12, h, i % 2 ? '#7cc45a' : '#69b54c', 5), x, 0, z));
      for (let k = 1; k < 4; k++) g.add(at(box(0.26, 0.05, 0.26, '#4f9a3c'), x, (h * k) / 4, z));
      g.add(chip(0.7, '#5fb84a', x, h, z, [1.2, 0.7, 1.2]), chip(0.5, '#73c85c', x + 0.3, h - 1.2, z, [1.2, 0.6, 1.2]));
    });
    return g;
  } },
  bush: { sway: 0.5, build: () => group(chip(0.8, '#4fb35a', 0, 0.55, 0), chip(0.6, '#63c56b', 0.6, 0.45, 0.2), chip(0.5, '#4fb35a', -0.55, 0.4, -0.1)) },
  grass: { sway: 2, build: () => group(...[0, 1, 2, 3, 4].map((i) => at(cone(0.12, 0.7 + (i % 3) * 0.2, i % 2 ? '#5fbe52' : '#49a843', 4), Math.cos(i * 2.2) * 0.35, 0, Math.sin(i * 2.2) * 0.35))) },
  flowers: { sway: 1.5, build: () => group(chip(0.5, '#4fae4f', 0, 0.2, 0, [1.3, 0.6, 1.3]), ...['#ff7fa8', '#ffd23f', '#ffffff', '#ff8a3d', '#b08bff'].map((c, i) => chip(0.16, c, Math.cos(i * 1.3) * 0.45, 0.5 + (i % 2) * 0.12, Math.sin(i * 1.3) * 0.45))) },
  canola: { sway: 1.5, build: () => group(chip(1.3, '#6fbf4a', 0, 0.3, 0, [1.4, 0.4, 1.4]), ...Array.from({ length: 9 }, (_, i) => chip(0.26, i % 3 ? '#ffe033' : '#ffd000', Math.cos(i * 0.7) * (0.5 + (i % 3) * 0.45), 0.62 + (i % 2) * 0.1, Math.sin(i * 0.7) * (0.5 + (i % 3) * 0.45)))) },
  pebbles: { build: () => group(chip(0.28, '#b9b5aa', 0, 0.12, 0, [1.2, 0.6, 1]), chip(0.2, '#a39f94', 0.45, 0.09, 0.2, [1, 0.6, 1.2]), chip(0.16, '#c9c5ba', -0.3, 0.07, 0.35), chip(0.14, '#a39f94', 0.1, 0.06, -0.4)) },
  snowpile: { build: () => group(chip(1.1, '#ffffff', 0, 0.4, 0, [1.3, 0.5, 1]), chip(0.7, '#eef5fb', 0.9, 0.25, 0.3, [1.2, 0.5, 1])) },
  shell: { build: () => group(at(cone(0.22, 0.2, '#ffd9c9', 7), 0, 0, 0), at(cone(0.16, 0.14, '#fff3e6', 7), 0.4, 0, 0.25), chip(0.13, '#ff9f8a', -0.3, 0.07, 0.3, [1.4, 0.5, 1.4])) },
  rock: { build: () => group(chip(0.9, '#a8a59c', 0, 0.45, 0, [1.2, 0.75, 1]), chip(0.5, '#96938b', 0.8, 0.28, 0.3, [1, 0.8, 1])) },
  mound: { build: () => at(dome(9, '#7fc95e', 14), 0, 0, 0, 0, [1, 0.62, 1]) },
  lamp: { build: () => group(at(cyl(0.07, 0.1, 4, '#5a6170', 6), 0, 0, 0), beam([0, 4, 0], [0.8, 4.3, 0], 0.05, '#5a6170'), at(box(0.5, 0.14, 0.3, '#fff3c4'), 0.8, 4.18, 0)), face: true },
  hydrant: { build: () => group(at(cyl(0.2, 0.24, 0.75, '#e23a2e', 8), 0, 0, 0), at(dome(0.2, '#e23a2e', 8), 0, 0.75, 0), at(box(0.62, 0.16, 0.16, '#c22d23'), 0, 0.45, 0)) },
  banner: { sway: 1.2, build: () => group(at(cyl(0.05, 0.06, 4.6, '#7a5a3a', 6), 0, 0, 0), at(box(0.06, 2.2, 1.0, '#ffffff'), 0, 2.2, 0.55), at(box(0.07, 2.0, 0.8, '#e23a2e'), 0, 2.3, 0.55)),
    tints: ['#ffffff', '#ffe27a', '#9fd0ff', '#b6f0b0', '#ffb3b3'] },
  parasol: { sway: 0.4, build: () => group(at(cyl(0.05, 0.05, 2.3, '#f4f1ea', 6), 0, 0, 0), at(cone(1.5, 0.6, '#ffffff', 8), 0, 2.0, 0), at(cone(1.05, 0.45, '#ff6b6b', 8), 0, 2.16, 0), at(box(1.6, 0.12, 0.6, '#59c3ff'), 0.2, 0.25, 0.5)),
    tints: ['#ffffff', '#ffe58a', '#a8e0ff', '#ffc0d8'] },
  stonelantern: { build: () => group(at(box(0.7, 0.2, 0.7, '#a9a69b'), 0, 0, 0), at(cyl(0.16, 0.2, 1.0, '#b5b2a6', 6), 0, 0.2, 0), at(box(0.6, 0.12, 0.6, '#a9a69b'), 0, 1.2, 0), at(box(0.44, 0.4, 0.44, '#ffe9a8'), 0, 1.32, 0), at(cone(0.55, 0.4, '#8f8c82', 4), 0, 1.72, 0, Math.PI / 4)) },
  snowman: { build: () => group(blob(0.6, '#ffffff', 0, 0.55, 0), blob(0.42, '#ffffff', 0, 1.35, 0), at(cone(0.07, 0.3, '#ff8a3d', 5), 0, 1.36, 0.36).rotateX(Math.PI / 2), at(cyl(0.3, 0.3, 0.3, '#e23a2e', 8), 0, 1.68, 0),
    blob(0.05, '#222222', -0.14, 1.48, 0.38), blob(0.05, '#222222', 0.14, 1.48, 0.38), beam([0.4, 0.8, 0], [1.0, 1.3, 0], 0.03, TRUNK, 4), beam([-0.4, 0.8, 0], [-1.0, 1.3, 0], 0.03, TRUNK, 4)), face: true },
  tearow: { build: () => group(...[0, 1.6, 3.2].map((z) => blob(1, z === 1.6 ? '#2f8f45' : '#3a9d50', 0, 0.7, z, [4.6, 0.75, 0.8]))), face: true },

  // ---------- buildings (front faces the road)
  hanok: { face: true, build: () => hall(7, 4.5, 2.6, 2.2, { wall: '#f6efe0', col: '#7a4a2a', roof: '#4a4e57' }) },
  wall_kr: { face: true, build: () => group(at(box(9, 1.5, 0.5, '#e8dfc8'), 0, 0, 0), at(box(9, 0.3, 0.55, '#bdb39b'), 0, 0, 0), at(tileRoof(1.3, 9.2, 0.5, '#4a4e57', { axis: 'x' }), 0, 1.5, 0)) },
  office: { face: true, build: () => tower(9, 9, 24, '#dfe6ee', '#6fb7e8', 9), tints: ['#ffffff', '#e8f1ff', '#fff3e0', '#e6ffe9'] },
  apt: { face: true, build: () => group(at(box(13, 20, 5.5, '#f5f1e8'), 0, 0, 0), ...Array.from({ length: 7 }, (_, f) => at(box(12, 1.1, 5.7, '#9cc7e6'), 0, 1.6 + f * 2.6, 0)), at(box(3, 1.4, 3, '#d8d2c4'), 0, 20, 0), at(box(13.1, 2, 0.3, '#f08a5d'), 0, 18, 2.75)) },
  skyscraper: { face: true, build: () => group(tower(11, 11, 14, '#cfd6e0', '#5fa8dc', 5), at(tower(8, 8, 10, '#d7dde6', '#5fa8dc', 4), 0, 14, 0), at(tower(5, 5, 7, '#dfe4ec', '#5fa8dc', 3), 0, 24, 0), at(cone(1.2, 3.5, '#aab2c0', 4), 0, 31.5, 0)) },
  house_color: { face: true, build: () => group(at(box(4.2, 3, 4, '#ffffff'), 0, 0, 0), at(box(4.5, 0.3, 4.3, '#e9e4d8'), 0, 3, 0), at(box(0.9, 1.7, 0.1, '#7a5a3a'), -0.9, 0, 2.02), at(box(1.1, 0.9, 0.1, '#8fd0f0'), 1, 1.4, 2.02),
      at(box(3.4, 2.6, 3.4, '#ffffff'), 3.4, 1.2, -1.6), at(box(3.7, 0.3, 3.7, '#e9e4d8'), 3.4, 3.8, -1.6), at(box(1, 0.8, 0.1, '#8fd0f0'), 3.4, 2.4, 0.12)),
    tints: ['#ffb3c8', '#ffe27a', '#9fd8ff', '#b4f0b8', '#ffc59a', '#d0b8ff'] },
  shop_jp: { face: true, build: () => group(at(box(6, 5.6, 5, '#f3ece0'), 0, 0, 0), at(box(6.3, 0.35, 5.3, '#5a5f6b'), 0, 5.6, 0), at(box(5.2, 2.1, 0.12, '#5a4636'), 0, 0.1, 2.52), at(box(6.4, 0.2, 1.5, '#e8503a'), 0, 2.6, 3.0).rotateX(0.25),
      at(box(4.6, 1.0, 0.14, '#ffd23f'), 0, 3.6, 2.56), at(box(1.3, 1.1, 0.12, '#8fd0f0'), -1.6, 3.5, 2.6), at(box(1.3, 1.1, 0.12, '#8fd0f0'), 1.6, 3.5, 2.6)),
    tints: ['#ffffff', '#ffe9c9', '#e3f1ff', '#ffe0ea'] },
  machiya: { face: true, build: () => group(at(box(6.5, 3.6, 5, '#6b4a34'), 0, 0, 0), at(box(6.6, 1.2, 0.14, '#f1e8d6'), 0, 2.2, 2.5), ...Array.from({ length: 9 }, (_, i) => at(box(0.12, 1.9, 0.12, '#4a3122'), -2.8 + i * 0.7, 0.1, 2.56)),
      at(tileRoof(6.4, 7.2, 1.7, '#555a64', { axis: 'x', lift: 0.08 }), 0, 3.6, 0)) },
  house_snow: { face: true, build: () => group(at(box(5.5, 3.2, 4.6, '#d9a066'), 0, 0, 0), at(gableRoof(4.6, 5.5, 2.6, '#8a4b3a'), 0, 3.2, 0, Math.PI / 2), at(gableRoof(4.4, 5.8, 2.6, '#ffffff', 0.2), 0, 3.55, 0, Math.PI / 2),
      at(box(1, 1.8, 0.1, '#6a3d2a'), -1.2, 0, 2.33), at(box(1.2, 1, 0.1, '#ffe9a8'), 1.1, 1.3, 2.33), at(box(0.6, 1.6, 0.6, '#9b5a44'), 1.6, 4.2, -0.6), at(box(0.75, 0.25, 0.75, '#ffffff'), 1.6, 5.8, -0.6)),
    tints: ['#ffffff', '#ffe1c2', '#d6e8ff', '#ffd6d6'] },
  brownstone: { face: true, build: () => group(at(box(6, 11, 7, '#8a5a44'), 0, 0, 0), at(box(6.3, 0.5, 7.3, '#6e4636'), 0, 11, 0), ...[0, 1, 2].flatMap((f) => [-1.7, 0, 1.7].map((x) => at(box(1.1, 1.7, 0.12, '#cfe6f5'), x, 3.4 + f * 2.6, 3.52))),
      at(box(1.3, 2.2, 0.12, '#3d2a22'), -1.7, 1.2, 3.52), at(box(2, 0.4, 2.2, '#b9a99a'), -1.7, 0.8, 4.4), at(box(2, 0.4, 1.4, '#b9a99a'), -1.7, 0.4, 5.2), at(box(2, 0.4, 0.7, '#b9a99a'), -1.7, 0, 5.9)),
    tints: ['#ffffff', '#f2d9c4', '#e9c9b3', '#d9b9a8'] },
  victorian: { face: true, build: () => group(at(box(5, 7, 7, '#ffffff'), 0, 0, 0), at(gableRoof(5, 7, 2.6, '#6b6f7a'), 0, 7, 0), at(box(2.2, 5.4, 1.2, '#ffffff'), -1.1, 0.8, 3.9), at(cone(1.7, 1.4, '#6b6f7a', 4), -1.1, 6.2, 3.9, Math.PI / 4),
      at(box(1.4, 1.5, 0.12, '#bfe2f5'), -1.1, 1.8, 4.52), at(box(1.4, 1.5, 0.12, '#bfe2f5'), -1.1, 4.0, 4.52), at(box(1.1, 2.1, 0.12, '#7a4a3a'), 1.3, 1.0, 3.52), at(box(2, 1, 2, '#e9e4d8'), 1.3, 0, 4.4), at(box(1.2, 1.3, 0.12, '#bfe2f5'), 1.3, 4.6, 3.52),
      at(box(5.2, 0.3, 0.3, '#f6f0e0'), 0, 6.9, 3.5)),
    tints: ['#ffd9a0', '#bfe3ff', '#ffc4d0', '#c9f0c0', '#e3d0ff', '#fff3a8'] },
};
