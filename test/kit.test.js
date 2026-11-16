import test from 'node:test';
import assert from 'node:assert/strict';
import { bake, box, group } from '../public/js/three/kit.js';

test('구운 모델은 아래쪽이 더 어둡다 (입체감)', () => {
  const m = bake(group(box(2, 4, 2, '#ffffff'))).children[0];
  const pos = m.geometry.attributes.position, col = m.geometry.attributes.color;
  let low = 0, high = 0, nl = 0, nh = 0;
  for (let i = 0; i < pos.count; i++) { if (pos.getY(i) < 0.01) { low += col.getX(i); nl++; } else if (pos.getY(i) > 3.99) { high += col.getX(i); nh++; } }
  assert.ok(nl > 0 && nh > 0);
  assert.ok(high / nh > 0.97, '위쪽은 원래 색');
  assert.ok(low / nl < 0.85 && low / nl > 0.6, '아래쪽은 살짝 어둡게');
});
test('shade: false 는 색을 그대로 둔다', () => {
  const m = bake(group(box(2, 4, 2, '#ffffff')), { shade: false }).children[0];
  const col = m.geometry.attributes.color;
  for (let i = 0; i < col.count; i++) assert.ok(col.getX(i) > 0.99);
});
