import test from 'node:test';
import assert from 'node:assert/strict';
import { COUNTRIES, CITIES, cityById, citiesOf } from '../public/js/cities.js';

test('나라 3, 도시 14', () => {
  assert.deepEqual(COUNTRIES.map((c) => c.id), ['kr', 'jp', 'us']);
  assert.deepEqual(citiesOf('kr').map((c) => c.id), ['seoul', 'busan', 'suwon', 'ulsan', 'gyeongju', 'bongdam', 'dongtan']);
  assert.deepEqual(citiesOf('jp').map((c) => c.id), ['tokyo', 'kyoto', 'osaka', 'sapporo', 'shizuoka']);
  assert.deepEqual(citiesOf('us').map((c) => c.id), ['newyork', 'sanfrancisco']);
});
test('옛 id·모르는 id는 서울', () => {
  for (const id of ['forest', 'space', '', undefined, 'x'.repeat(40)]) assert.equal(cityById(id).id, 'seoul');
});
for (const c of CITIES) test(`도시 데이터: ${c.id}`, () => {
  assert.match(c.id, /^[a-z]{1,12}$/);
  assert.ok(c.landmarks.length >= 4 && c.landmarks.length <= 5);
  c.landmarks.forEach((l, i) => assert.ok(l.at >= 0.04 && l.at <= 0.92 && (!i || l.at - c.landmarks[i - 1].at >= 0.1), `명소 위치 ${l.id}`));
  for (const l of c.landmarks) {
    assert.match(l.id, new RegExp(`^${c.id}_[a-z_]+$`));
    assert.ok(l.features.length >= 3 && l.features.length <= 5);
    assert.equal(l.through, l.side === 0);
    assert.ok(l.through ? l.span >= 6 : l.offset >= 8);
  }
  assert.ok(c.landmarks.some((l) => l.id === c.hero));
  assert.ok(c.backdrop.length >= 1 && c.backdrop.every((b) => b.id.startsWith('bg_')));
  const types = c.ambient.map((a) => a.type);
  assert.ok(types.includes('wind') && types.includes('crowd'));
  assert.ok(types.includes('birds') || types.includes('butterflies'));
  assert.ok(types.length >= 4);
  assert.ok(c.tune >= 0 && c.tune <= 4);
});
