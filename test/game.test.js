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
  const lim = c.route ? 2.5 : 0.75;   // a city drawn from a real map may turn a real corner
  for (let i = 0; i <= p.n; i++) assert.ok(Math.abs(p.yaw[i]) <= lim);
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
for (const [diff, lo, hi] of [[0, 5, 10], [1, 10, 15], [2, 14, 18]]) test(`동물 친구 빠르기 ${diff}: ${lo}~${hi} km/h`, () => {
  const race = new Race({ city: cityById('seoul'), lengthM: 5000, npc: 5, diff, seed: 3, vis: 2, players: [{ id: 'me', name: 'a', char: 'bunny' }], myId: 'me', sim: true });
  race.on = () => {};
  for (let i = 0; i < 2400; i++) {
    race.update(0.05, i % 400 < 200 ? 0 : 5.5);   // child stops and goes: friends keep their own pace
    if (race.clock > 8) for (const n of race.npcs) {
      const kmh = n.speed * 3.6;
      assert.ok(kmh >= lo - 0.01 && kmh <= hi + 0.01, `${kmh.toFixed(2)} km/h`);
    }
  }
});
test('실제 지도 코스: 봉담은 에듀파크에서 수영로, 효행로로 오른쪽으로 꺾인다', () => {
  const c = cityById('bongdam'), t = buildTrack(c, 400, 2.3, 7), p = buildPath(t.segs);
  const yawAt = (f) => p.yaw[t.start + Math.round(f * t.units)];
  assert.ok(yawAt(0.2) < -0.6, '수영로로 오른쪽');
  assert.ok(yawAt(0.45) < -1.6, '효행로로 또 오른쪽');
  assert.ok(Math.abs(yawAt(1) - c.route.reduce((a, r) => a + r[1], 0)) < 0.05, '꺾은 만큼 방향이 바뀜');
});
test('봉담 출발점 옆에 에듀파크', () => {
  const c = cityById('bongdam');
  assert.equal(c.landmarks[0].id, 'bongdam_edupark');
  assert.ok(c.landmarks[0].at <= 0.06);
});
