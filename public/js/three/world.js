// One city as a three.js scene: sky, ground, road, gates, riders and stars.
// Roadside props, ambient motion and landmarks are added by their own modules.
import * as THREE from 'three';
import { buildPath, sample, RW } from '../path.js';
import { layoutCity } from '../layout.js';
import { mat, box, cyl, sphere, at, group, bake, disposeTree, WATER, WATER_Y } from './kit.js';
import { buildRider, buildStar } from './riders.js';
import { PROPS } from './props.js';
import { AMBIENT } from './ambient.js';

const SHORE = RW + 6;
const FONT = '"Jua", "Malgun Gothic", sans-serif';
const _p = {};

export class World {
  /** city: cities.js entry. track: from game.js buildTrack (carries units, seed, lengthM). */
  constructor(city, track) {
    this.city = city; this.track = track;
    this.path = buildPath(track.segs);
    this.layout = layoutCity(city, track, track.units, track.seed);
    this.scene = new THREE.Scene();
    this.time = { value: 0 };       // shared shader clock
    this.wind = 0.3;                // 0..1, set by ambient wind
    this.textures = []; this.ownMats = [];
    this.riders = new Map(); this.stars = []; this.labels = [];
    this.parts = [];                // { update(camS, t, dt), dispose() }
    this.cam = { x: 0, z: 0, yaw: 0 };

    this.#sky();
    this.#ground();
    this.#gates();
    this.#props();
    for (const a of city.ambient) this.parts.push(AMBIENT[a.type](this, a));
  }

  /** Put an object on the ground at distance s along the road, `lateral` to the right; local +z = travel direction. */
  place(obj, s, lateral = 0, turn = 0) {
    sample(this.path, s, lateral, _p);
    obj.position.set(_p.x, obj.position.y, _p.z);
    obj.rotation.y = _p.yaw + turn;
    return obj;
  }

  #sky() {
    const { city, scene } = this;
    const c = document.createElement('canvas'); c.width = 4; c.height = 256;
    const g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 256);
    gr.addColorStop(0, city.sky[0]); gr.addColorStop(0.42, city.sky[1]); gr.addColorStop(1, city.sky[1]);
    g.fillStyle = gr; g.fillRect(0, 0, 4, 256);
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
    this.textures.push(tex);
    scene.background = tex;
    scene.fog = new THREE.Fog(city.fog, 140, 900);
    scene.add(new THREE.HemisphereLight(0xffffff, new THREE.Color(city.ground[0]).lerp(new THREE.Color(0xffffff), 0.65), 1.9));
    const sun = new THREE.DirectionalLight(0xfff4e0, 1.7);
    sun.position.set(-0.6, 1, -0.35);
    scene.add(sun);
  }

  #ground() {
    const { city, path, track, layout, scene } = this;
    const anyWater = city.sides.left === 'water' || city.sides.right === 'water';
    // endless base far below: sea for coastal cities, land colour otherwise
    const base = new THREE.Mesh(new THREE.PlaneGeometry(6000, 6000).rotateX(-Math.PI / 2), mat(anyWater ? WATER : city.ground[0]));
    base.position.y = anyWater ? WATER_Y : WATER_Y - 1;
    scene.add(base); this.base = base;

    const bridges = layout.landmarks.filter((m) => m.def.bridge);
    const onBridge = (i) => bridges.some((m) => Math.abs(i + 0.5 - m.s) < m.span / 2);
    const pos = [], col = [], cc = new Map();
    const C = (hex) => { let c = cc.get(hex); if (!c) cc.set(hex, c = new THREE.Color(hex)); return c; };
    const P = (i, lat, y) => { const a = path.yaw[i]; pos.push(path.x[i] - Math.cos(a) * lat, y, path.z[i] + Math.sin(a) * lat); };
    const quad = (i, j, a, b, hex, ya = 0, yb = 0) => {
      if (a > b) { [a, b] = [b, a]; [ya, yb] = [yb, ya]; }   // keep one winding so both sides are lit alike
      P(i, a, ya); P(i, b, yb); P(j, b, yb); P(i, a, ya); P(j, b, yb); P(j, a, ya);
      const c = C(hex);
      for (let k = 0; k < 6; k++) col.push(c.r, c.g, c.b);
    };
    const n = path.n, ec = city.edge, FAR = 8;
    for (let i = 0; i < n; i++) {
      const alt = Math.floor(i / 3) & 1, bridge = onBridge(i), seg = track.segs[i];
      quad(i, i + 1, -RW, RW, city.road[alt]);
      for (const side of [-1, 1]) {
        const water = city.sides[side < 0 ? 'left' : 'right'] === 'water';
        quad(i, i + 1, side * RW, side * (RW + 0.4), ec[Math.floor(i / 2) % ec.length]);
        if (bridge) continue;
        quad(i, i + 1, side * (RW + 0.4), side * (water ? SHORE : 60), city.ground[alt]);
        if (water) quad(i, i + 1, side * SHORE, side * (SHORE + 1.5), '#e9d7a0', 0, WATER_Y - 0.5);
        else if (i % FAR === 0) {
          let j = Math.min(n, i + FAR);
          for (let k = i; k < j; k++) if (onBridge(k)) { j = k; break; }
          if (j > i) quad(i, j, side * 60, side * 900, city.ground[0]);
        } else if (onBridge(i - (i % FAR))) quad(i, i + 1, side * 60, side * 900, city.ground[0]);
      }
      if (city.lanes && alt === 0) {
        for (let k = 1; k <= city.lanes; k++) { const lx = -RW + (2 * RW * k) / (city.lanes + 1); quad(i, i + 1, lx - 0.07, lx + 0.07, '#ffffff', 0.015, 0.015); }
      }
      if (seg.line === 1) quad(i, i + 1, -RW, RW, '#ffffff', 0.02, 0.02);
      else if (seg.line >= 2) {
        const cw = (2 * RW) / 12;
        for (let k = 0; k < 12; k++) quad(i, i + 1, -RW + k * cw, -RW + (k + 1) * cw, (k + seg.line) % 2 ? '#ffffff' : '#222222', 0.02, 0.02);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    const nrm = new Float32Array(pos.length); for (let i = 1; i < nrm.length; i += 3) nrm[i] = 1;
    g.setAttribute('normal', new THREE.BufferAttribute(nrm, 3));
    const m = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide });
    this.ownMats.push(m);
    const ribbon = new THREE.Mesh(g, m); ribbon.frustumCulled = false;
    scene.add(ribbon);
  }

  /** Flat panel with text (gate banners, distance signs). */
  textPanel(text, w, h, bg, fg) {
    const c = document.createElement('canvas'); c.width = 256; c.height = Math.round((256 * h) / w);
    const g = c.getContext('2d');
    g.fillStyle = bg; g.fillRect(0, 0, c.width, c.height);
    g.fillStyle = fg; g.font = `${c.height * 0.7}px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(text, c.width / 2, c.height * 0.55);
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
    const m = new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide });
    this.textures.push(tex); this.ownMats.push(m);
    return new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
  }

  #gates() {
    const { layout, scene } = this;
    const gate = (text, colA, colB, checker) => {
      const W = RW + 0.9, parts = [];
      for (const s of [-1, 1]) {
        parts.push(at(cyl(0.28, 0.28, 5.4, colA, 10), s * W, 0, 0));
        for (let k = 0; k < 3; k++) parts.push(at(cyl(0.3, 0.3, 0.5, colB, 10), s * W, 1 + k * 1.6, 0));
        parts.push(at(sphere(0.55, ['#ff5a7a', '#59c3ff'][(s + 1) / 2]), s * W, 6.0, 0), at(sphere(0.45, '#ffd23f'), s * (W - 0.6), 5.7, 0));
      }
      parts.push(at(box(2 * W + 0.6, 1.3, 0.4, colA), 0, 4.3, 0));
      if (checker) for (let i = 0; i < 16; i++) for (let j = 0; j < 2; j++) if ((i + j) % 2) parts.push(at(box((2 * W) / 16, 0.3, 0.44, '#222222'), -W + ((i + 0.5) * 2 * W) / 16, 4.3 + j * 0.3 - 0.0, 0));
      const g = bake(group(parts));
      const label = this.textPanel(text, 4.2, 0.95, checker ? '#ffffff' : colA, checker ? '#222222' : '#ffffff');
      label.position.set(0, checker ? 5.05 : 4.95, -0.22); label.rotation.y = Math.PI;   // faces the oncoming rider
      g.add(label);
      return g;
    };
    scene.add(this.place(gate('출발', '#35b46b', '#ffd23f', false), layout.gates.start));
    scene.add(this.place(gate('도착', '#ff5a7a', '#ffffff', true), layout.gates.finish));
    for (const sg of layout.signs) {
      const post = bake(group(at(cyl(0.07, 0.07, 1.5, '#a8703f', 6), 0, 0, 0), at(box(1.7, 1.0, 0.1, '#ff8a3d'), 0, 1.3, 0)));
      const label = this.textPanel(sg.label, 1.5, 0.82, '#ffffff', '#3b3054');
      label.position.set(0, 1.8, -0.07); label.rotation.y = Math.PI;
      post.add(label);
      scene.add(this.place(post, sg.s, -(RW + 1.5)));
    }
  }

  /** Material whose instances bend in the wind: displacement grows with height squared. */
  swayMaterial(sway) {
    const m = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true });
    if (sway > 0) {
      const world = this;
      m.onBeforeCompile = (sh) => {
        sh.uniforms.uTime = this.time;
        sh.uniforms.uWind = { get value() { return world.wind; } };
        sh.uniforms.uSway = { value: sway };
        sh.vertexShader = 'uniform float uTime; uniform float uWind; uniform float uSway;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
          #ifdef USE_INSTANCING
            float swH = max(0.0, transformed.y);
            float swP = uTime * 1.7 + instanceMatrix[3].x * 0.35 + instanceMatrix[3].z * 0.27;
            float swA = uSway * (0.25 + uWind) * swH * swH * 0.012;
            transformed.x += (sin(swP) + 0.5 * sin(swP * 2.3 + 1.0)) * swA;
            transformed.z += cos(swP * 0.8) * swA * 0.6;
          #endif`);
      };
      m.customProgramCacheKey = () => 'sway';
    }
    this.ownMats.push(m);
    return m;
  }

  #props() {
    const { layout, scene } = this;
    const CHUNK = 120, buckets = new Map();
    for (const p of layout.props) {
      if (!PROPS[p.n]) continue;
      const key = p.n + '|' + Math.floor(p.s / CHUNK);
      let b = buckets.get(key); if (!b) buckets.set(key, b = []);
      b.push(p);
    }
    const protos = new Map(), dummy = new THREE.Object3D(), tint = new THREE.Color();
    for (const [key, list] of buckets) {
      const n = key.split('|')[0], def = PROPS[n];
      let pr = protos.get(n);
      if (!pr) {
        const baked = bake(def.build());
        pr = { geo: baked.children[0].geometry, mat: this.swayMaterial(def.sway || 0), tints: (def.tints || []).map((c) => new THREE.Color(c)) };
        protos.set(n, pr);
      }
      const im = new THREE.InstancedMesh(pr.geo, pr.mat, list.length);
      list.forEach((p, i) => {
        sample(this.path, p.s, p.lateral, _p);
        dummy.position.set(_p.x, 0, _p.z);
        dummy.rotation.y = def.face ? _p.yaw + (p.lateral > 0 ? 1 : -1) * (Math.PI / 2 + 0.25) : p.rot;
        dummy.scale.setScalar(def.face ? 0.92 + (p.scale - 0.85) * 0.45 : p.scale);
        dummy.updateMatrix();
        im.setMatrixAt(i, dummy.matrix);
        const k = Math.floor(p.rot * 1000);
        if (pr.tints.length) tint.copy(pr.tints[k % pr.tints.length]); else tint.setScalar(0.9 + ((k % 7) / 7) * 0.16);
        im.setColorAt(i, tint);
      });
      im.instanceMatrix.needsUpdate = true;
      im.computeBoundingSphere();
      scene.add(im);
    }
  }

  /** items: from Race.scene(): riders { kind:'rider', id, z, x, ch, phase, lean, speed, name, me } and stars { kind:'star', z, x }. */
  setItems(items, t) {
    const seen = new Set();
    let si = 0;
    this.labels.length = 0;
    for (const it of items) {
      if (it.kind === 'star') {
        let st = this.stars[si];
        if (!st) { st = this.stars[si] = buildStar(); this.scene.add(st); }
        si++;
        st.visible = true;
        sample(this.path, it.z, it.x, _p);
        st.position.set(_p.x, 1.25 + Math.sin(t * 4 + it.z) * 0.12, _p.z);
        st.rotation.y = t * 2.5 + it.z;
        continue;
      }
      let r = this.riders.get(it.id);
      if (!r) { r = buildRider(it.ch); this.riders.set(it.id, r); this.scene.add(r.group); }
      seen.add(it.id);
      sample(this.path, it.z, it.x, _p);
      r.group.position.set(_p.x, 0, _p.z);
      r.group.rotation.y = _p.yaw;
      r.update(it.phase, it.lean, it.speed ?? 1);
      this.labels.push({ x: _p.x, y: 2.15, z: _p.z, name: it.name, me: it.me });
    }
    for (; si < this.stars.length; si++) this.stars[si].visible = false;
    for (const [id, r] of this.riders) if (!seen.has(id)) { this.scene.remove(r.group); disposeTree(r.group); this.riders.delete(id); }
  }

  /** camS: distance along the road the camera follows. */
  update(camS, t, dt) {
    this.time.value = t;
    sample(this.path, camS, 0, this.cam);
    this.base.position.x = this.cam.x; this.base.position.z = this.cam.z;
    for (const p of this.parts) p.update(camS, t, dt);
  }

  dispose() {
    for (const p of this.parts) p.dispose?.();
    disposeTree(this.scene);
    for (const t of this.textures) t.dispose();
    for (const m of this.ownMats) m.dispose();
    this.scene.clear();
  }
}
