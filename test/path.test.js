import test from 'node:test';
import assert from 'node:assert/strict';
import { RW, buildPath, sample } from '../public/js/path.js';

const straight = Array.from({ length: 100 }, () => ({ curve: 0 }));
test('RW', () => assert.equal(RW, 3.6));
test('직선: z만 증가', () => {
  const p = buildPath(straight);
  assert.equal(p.n, 100);
  assert.ok(Math.abs(p.z[100] - 100) < 1e-4 && Math.abs(p.x[100]) < 1e-4);
});
test('보간과 좌우', () => {
  const p = buildPath(straight);
  const a = sample(p, 10.5, 2);
  assert.ok(Math.abs(a.z - 10.5) < 1e-4);
  assert.ok(Math.abs(Math.abs(a.x) - 2) < 1e-4);
  assert.equal(Math.sign(sample(p, 10, 2).x), -Math.sign(sample(p, 10, -2).x));
});
test('굽은 길: yaw 누적 = curve 합 × 1.5', () => {
  const segs = Array.from({ length: 50 }, () => ({ curve: 0.004 }));
  assert.ok(Math.abs(buildPath(segs).yaw[50] - 0.3) < 1e-5);
});
test('범위 밖 s는 오류 없이 끝값', () => {
  const p = buildPath(straight);
  assert.ok(Number.isFinite(sample(p, -5).z) && Number.isFinite(sample(p, 999).z));
});
