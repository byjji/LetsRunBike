import test from 'node:test';
import assert from 'node:assert/strict';
import { AMBIENT, MOVER_KINDS, FLOATER_KINDS, BIRD_KINDS, PARTICLE_KINDS } from '../public/js/three/ambient.js';
import { CITIES } from '../public/js/cities.js';

const KINDS = { mover: MOVER_KINDS, floater: FLOATER_KINDS, birds: BIRD_KINDS, particles: PARTICLE_KINDS };
for (const c of CITIES) test(`움직임 등록: ${c.id}`, () => {
  for (const a of c.ambient) {
    assert.equal(typeof AMBIENT[a.type], 'function', a.type);
    if (KINDS[a.type]) assert.ok(KINDS[a.type][a.kind], `${a.type}:${a.kind}`);
  }
});
