import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { LANDMARKS, loadLandmark, clearance } from '../public/js/three/landmarks/index.js';
import { CITIES } from '../public/js/cities.js';

const DONE = ['seoul', 'busan', 'suwon', 'ulsan', 'gyeongju', 'tokyo', 'kyoto', 'osaka', 'sapporo', 'shizuoka']; // later tasks add cities here
for (const c of CITIES.filter((c) => DONE.includes(c.id))) {
  for (const l of c.landmarks) test(`명소: ${l.id}`, async () => {
    assert.equal(typeof LANDMARKS[l.id], 'function');
    const g = await loadLandmark(l), box = new THREE.Box3().setFromObject(g);
    assert.ok(Math.abs(box.min.y) < 0.6 || l.through || l.wet, '바닥');
    if (l.through) for (const span of [6, 32, l.span]) assert.ok(clearance(await loadLandmark(l, { span })), `통과 공간 막힘 span=${span}`);
    else assert.ok(Math.abs(box.max.y - l.h) < 0.5, '목표 높이');
    let tris = 0; g.traverse((o) => { if (o.isMesh) tris += (o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count) / 3; });
    assert.ok(tris > 40 && tris < 20000, `삼각형 ${tris}`);
  });
  for (const b of c.backdrop) test(`먼 배경: ${c.id} ${b.id}`, () => assert.equal(typeof LANDMARKS[b.id], 'function'));
}
test('통과 공간 검사는 막힌 문을 잡아낸다', () => {
  const g = new THREE.Group(); g.add(new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2)));
  g.children[0].position.y = 2;
  assert.equal(clearance(g), false);
});
test('모델 파일 실패 시 코드 조립으로 대체', async () => {
  const def = { ...CITIES[0].landmarks[1], model: 'seoul/none.glb' };
  const g = await loadLandmark(def, { loadModel: () => Promise.reject(new Error('404')) });
  assert.ok(new THREE.Box3().setFromObject(g).max.y > 1);
});
test('모델 파일이 있으면 그것을 쓴다', async () => {
  const def = { ...CITIES[0].landmarks[1], model: 'x.glb' };
  const fake = new THREE.Group(); fake.add(new THREE.Mesh(new THREE.BoxGeometry(1, 2, 1))); fake.name = 'fake';
  assert.equal((await loadLandmark(def, { loadModel: () => Promise.resolve(fake) })).getObjectByName('fake'), fake);
});
