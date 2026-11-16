import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { PROPS } from '../public/js/three/props.js';
import { CITIES } from '../public/js/cities.js';

const names = [...new Set(CITIES.flatMap((c) => c.roadside.flatMap((r) => r.n)))];
for (const n of names) test(`소품: ${n}`, () => {
  assert.ok(PROPS[n], '등록부에 없음');
  const box = new THREE.Box3().setFromObject(PROPS[n].build());
  assert.ok(box.max.y > 0.2 && box.max.y < 40);
  assert.ok(Math.abs(box.min.y) < 0.3, '바닥에 붙어야 함');
});
