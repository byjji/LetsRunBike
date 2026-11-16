import test from 'node:test';
import assert from 'node:assert/strict';
import { fitMap, PIN_R } from '../public/js/maps.js';
import { COUNTRIES, CITIES, citiesOf } from '../public/js/cities.js';

const inside = (poly, [x, y]) => {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
};
for (const k of COUNTRIES) test(`지도: ${k.id}`, () => {
  const m = fitMap(k.id);
  assert.ok(m.w > 50 && m.h > 50 && m.polys.length >= 1);
  const pins = citiesOf(k.id).map((c) => ({ c, dot: m.pos(c.geo[0], c.geo[1]), pin: m.pin(c) }));
  for (const p of pins) {
    assert.ok(m.polys.some((poly) => inside(poly, p.dot)), `${p.c.id} 가 땅 위에 있어야 함`);
    assert.ok(p.pin[0] >= PIN_R && p.pin[0] <= m.w - PIN_R && p.pin[1] >= PIN_R && p.pin[1] <= m.h - PIN_R, `${p.c.id} 표시가 지도 밖`);
  }
  for (let i = 0; i < pins.length; i++) for (let j = i + 1; j < pins.length; j++) {
    assert.ok(Math.hypot(pins[i].pin[0] - pins[j].pin[0], pins[i].pin[1] - pins[j].pin[1]) >= PIN_R * 2, `${pins[i].c.id} / ${pins[j].c.id} 겹침`);
  }
});
test('실제 위치 관계', () => {
  const kr = fitMap('kr'), at = (id) => { const c = CITIES.find((x) => x.id === id); return kr.pos(c.geo[0], c.geo[1]); };
  assert.ok(at('seoul')[1] < at('busan')[1], '서울이 부산보다 위(북)');
  assert.ok(at('seoul')[0] < at('busan')[0], '서울이 부산보다 왼쪽(서)');
  const us = fitMap('us'), a = (id) => { const c = CITIES.find((x) => x.id === id); return us.pos(c.geo[0], c.geo[1]); };
  assert.ok(a('sanfrancisco')[0] < a('newyork')[0]);
});
