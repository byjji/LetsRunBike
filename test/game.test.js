import test from 'node:test';
import assert from 'node:assert/strict';
import { buildTrack, Race } from '../public/js/game.js';
import { buildPath } from '../public/js/path.js';
import { CITIES, cityById, spanOf } from '../public/js/cities.js';

test('같은 seed면 같은 트랙', () => {
  const a = buildTrack(cityById('seoul'), 400, 2.3, 7), b = buildTrack(cityById('seoul'), 400, 2.3, 7);
  assert.deepEqual(a.segs.map((s) => s.curve), b.segs.map((s) => s.curve));
});
for (const c of CITIES) for (const len of [50, 400, 3000]) test(`방향 제한·직선 구간: ${c.id} ${len}m`, () => {
  const upm = 2.3, t = buildTrack(c, len, upm, 123), p = buildPath(t.segs);
  for (let i = 0; i <= p.n; i++) assert.ok(Math.abs(p.yaw[i]) <= 0.75);
  for (const l of c.landmarks.filter((l) => l.through)) {
    const units = Math.round(len * upm), mid = t.start + Math.round(l.at * units), span = spanOf(l, units);
    for (let i = Math.floor(mid - span / 2 - 4); i <= mid + span / 2 + 4; i++) {
      if (i >= 0 && i < t.segs.length) assert.equal(t.segs[i].curve, 0);
    }
  }
});
test('굽은 길이 실제로 있다', () => {
  const t = buildTrack(cityById('seoul'), 400, 2.3, 7);
  assert.ok(t.segs.some((s) => s.curve !== 0));
});
test('명소 통과 이벤트 4번, 순서대로', () => {
  const city = cityById('seoul'), got = [];
  const race = new Race({ city, lengthM: 200, npc: 0, diff: 1, seed: 1, vis: 2, players: [{ id: 'me', name: 'a', char: 'bunny' }], myId: 'me', sim: true });
  race.on = (ev, v) => { if (ev === 'landmark') got.push(v); };
  for (let i = 0; i < 4000; i++) race.update(0.05, 3);
  assert.deepEqual(got, city.landmarks.map((l) => l.name));
});
