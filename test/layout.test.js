import test from 'node:test';
import assert from 'node:assert/strict';
import { layoutCity } from '../public/js/layout.js';
import { buildTrack } from '../public/js/game.js';
import { RW } from '../public/js/path.js';
import { CITIES } from '../public/js/cities.js';

for (const c of CITIES) for (const len of [50, 200, 400, 800, 3000]) for (const vis of [1, 2, 3]) {
  test(`배치: ${c.id} ${len}m x${vis}`, () => {
    const upm = 1.15 * vis, units = Math.round(len * upm);
    const t = buildTrack(c, len, upm, 99), L = layoutCity(c, t, units, 99);
    if (len >= 200) assert.equal(L.landmarks.length, 4);
    const zones = L.landmarks.map((m) => [m.s - Math.max(m.span / 2, 10), m.s + Math.max(m.span / 2, 10)]);
    zones.forEach((z, i) => { if (i) assert.ok(z[0] >= zones[i - 1][1], '명소 겹침'); });
    for (const m of L.landmarks.filter((m) => m.def.through)) {
      assert.ok(m.s - m.span / 2 > t.start + 6 && m.s + m.span / 2 < t.finish - 6, '문과 겹침');
    }
    for (const p of L.props) {
      assert.ok(Math.abs(p.lateral) >= RW + 1, '길 위 소품');
      for (const m of L.landmarks.filter((m) => m.def.through)) assert.ok(Math.abs(p.s - m.s) > m.span / 2, '통과 구간 소품');
    }
    assert.equal(L.signs.length, Math.max(0, Math.ceil(len / 100) - 1));
    assert.ok(L.crowds.length >= 2);
  });
}
test('결정적', () => {
  const c = CITIES[0], t = buildTrack(c, 400, 2.3, 5);
  assert.deepEqual(layoutCity(c, t, 920, 5), layoutCity(c, t, 920, 5));
});
test('물 쪽에는 땅 소품이 없다', () => {
  const c = CITIES.find((x) => x.id === 'busan'), t = buildTrack(c, 400, 2.3, 5), L = layoutCity(c, t, 920, 5);
  assert.ok(L.props.length > 20);
  for (const p of L.props) if (p.lateral < 0) assert.ok(-p.lateral <= RW + 6, '바다 위 소품');
});
for (const id of ['seoul', 'newyork', 'kyoto']) test(`소품끼리 겹치지 않는다: ${id}`, () => {
  const c = CITIES.find((x) => x.id === id), t = buildTrack(c, 400, 2.3, 5), L = layoutCity(c, t, 920, 5);
  assert.ok(L.props.length > 100);
  for (let i = 0; i < L.props.length; i++) for (let j = i + 1; j < L.props.length; j++) {
    const a = L.props[i], b = L.props[j];
    if (b.s - a.s > 30) break;
    assert.ok(Math.hypot(a.s - b.s, a.lateral - b.lateral) >= a.r + b.r - 1e-6, `${a.n} / ${b.n}`);
  }
});
