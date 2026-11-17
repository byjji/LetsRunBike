// One city as a three.js scene: sky, ground, road, gates, riders and stars.
// Roadside props, ambient motion and landmarks are added by their own modules.
import * as THREE from 'three';
import { buildPath, sample, RW } from '../path.js';
import { layoutCity } from '../layout.js';
import { mat, box, cyl, sphere, at, group, bake, disposeTree, WATER, WATER_Y } from './kit.js';
import { buildRider, buildStar } from './riders.js';
import { PROPS } from './props.js';
import { AMBIENT } from './ambient.js';
import { LANDMARKS, buildLandmark, loadLandmark } from './landmarks/index.js';

const SHORE = RW + 6;
const FONT = '"Jua", "Malgun Gothic", sans-serif';
const _p = {};
const c2w = new THREE.Color(0xffffff);

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
    this.#landmarks();
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
    scene.add(new THREE.HemisphereLight(0xeaf6ff, new THREE.Color(city.ground[0]).lerp(new THREE.Color(0xffffff), 0.55), 1.75));
    const sun = new THREE.DirectionalLight(0xfff1d6, 2.1);
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
    const n = path.n, FAR = 8;
    const lighter = (hex) => '#' + new THREE.Color(hex).lerp(new THREE.Color(0xffffff), 0.55).getHexString();
    // parts of the course may have their own surface (e.g. a dirt path through a forest): city.paths
    const plain = { road: city.road, edge: city.edge, curb: lighter(city.road[0]), lanes: city.lanes };
    const looks = (city.paths || []).map((p) => ({ ...p, curb: p.curb || lighter(p.road[0]), lanes: p.lanes ?? 0 }));
    const lookAt = (i) => { const u = (i - track.start) / track.units; return looks.find((p) => u >= p.from && u < p.to) || plain; };
    for (let i = 0; i < n; i++) {
      const alt = Math.floor(i / 3) & 1, bridge = onBridge(i), seg = track.segs[i];
      const look = lookAt(i), ec = look.edge, curb = look.curb;
      quad(i, i + 1, -RW, RW, look.road[alt]);
      for (const side of [-1, 1]) {
        const water = city.sides[side < 0 ? 'left' : 'right'] === 'water';
        quad(i, i + 1, side * RW, side * (RW + 0.4), ec[Math.floor(i / 2) % ec.length]);
        if (bridge) continue;
        quad(i, i + 1, side * (RW + 0.4), side * (RW + 1.0), curb);
        quad(i, i + 1, side * (RW + 1.0), side * (water ? SHORE : 60), city.ground[alt]);
        if (water) quad(i, i + 1, side * SHORE, side * (SHORE + 1.5), '#e9d7a0', 0, WATER_Y - 0.5);
        else if (i % FAR === 0) {
          let j = Math.min(n, i + FAR);
          for (let k = i; k < j; k++) if (onBridge(k)) { j = k; break; }
          if (j > i) quad(i, j, side * 60, side * 900, city.ground[0]);
        } else if (onBridge(i - (i % FAR))) quad(i, i + 1, side * 60, side * 900, city.ground[0]);
      }
      if (look.lanes && alt === 0) {
        for (let k = 1; k <= look.lanes; k++) { const lx = -RW + (2 * RW * k) / (look.lanes + 1); quad(i, i + 1, lx - 0.07, lx + 0.07, '#ffffff', 0.015, 0.015); }
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

    // irregular lighter / darker patches so the ground is not one flat colour
    const pv = [0, 0, 0];
    for (let k = 0; k < 9; k++) { const a = (k / 9) * Math.PI * 2, r = 0.75 + 0.25 * Math.sin(k * 2.7); pv.push(Math.cos(a) * r, 0, Math.sin(a) * r); }
    const pi = []; for (let k = 1; k <= 9; k++) pi.push(0, k === 9 ? 1 : k + 1, k);
    const pg = new THREE.BufferGeometry();
    pg.setAttribute('position', new THREE.Float32BufferAttribute(pv, 3));
    pg.setAttribute('normal', new THREE.Float32BufferAttribute(pv.map((_, k) => (k % 3 === 1 ? 1 : 0)), 3));
    pg.setIndex(pi);
    const spots = [];
    const hash = (v) => { const x = Math.sin(v * 91.7 + track.seed * 0.013) * 43758.5453; return x - Math.floor(x); };
    for (let i = 2; i < n - 2; i += 2) for (const side of [-1, 1]) {
      if (hash(i * 2 + side) > 0.55 || onBridge(i)) continue;
      const water = city.sides[side < 0 ? 'left' : 'right'] === 'water';
      const reach = hash(i * 5.3 + side), size = (2.5 + hash(i * 3.1 + side) * 6) * (water ? 1 : 1 + reach * 2.2), lat = RW + 1.6 + size + reach * (water ? 0 : 150);
      if (water && lat + size > SHORE) continue;
      spots.push({ s: i + hash(i * 7.7), lat: side * lat, size, tone: hash(i * 11.3 + side) });
    }
    if (spots.length) {
      const pm = new THREE.MeshLambertMaterial({ color: 0xffffff }); this.ownMats.push(pm);
      const im = new THREE.InstancedMesh(pg, pm, spots.length), d = new THREE.Object3D(), base = new THREE.Color(city.ground[0]), c = new THREE.Color();
      spots.forEach((sp, k) => {
        sample(path, sp.s, sp.lat, _p);
        d.position.set(_p.x, 0.012, _p.z); d.rotation.y = sp.tone * 6.28; d.scale.set(sp.size * (0.8 + sp.tone * 0.6), 1, sp.size); d.updateMatrix();
        im.setMatrixAt(k, d.matrix);
        im.setColorAt(k, sp.tone > 0.5 ? c.copy(base).lerp(c2w, 0.16 + sp.tone * 0.1) : c.copy(base).multiplyScalar(0.86 + sp.tone * 0.12));
      });
      im.frustumCulled = false;
      scene.add(im);
    }
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

  #landmarks() {
    const { city, layout, scene } = this;
    // distant scenery: stays at a fixed bearing around the camera
    this.far = new THREE.Group(); scene.add(this.far);
    this.spinners = []; this.shuttles = []; this.screens = [];
    // sun with a soft glow
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xfff3b8, fog: false }), glowMat = new THREE.MeshBasicMaterial({ color: 0xfff6d0, fog: false, transparent: true, opacity: 0.28, depthWrite: false });
    this.ownMats.push(sunMat, glowMat);
    for (const [r, m, d] of [[95, glowMat, 1210], [46, sunMat, 1200]]) {
      const disc = new THREE.Mesh(new THREE.CircleGeometry(r, 28), m);
      disc.position.set(d * 0.52, 430, d * 0.72); disc.lookAt(0, 0, 0);
      this.far.add(disc);
    }
    // low hills all round the horizon (not out at sea), tinted toward the sky for depth
    const hillCol = '#' + new THREE.Color(city.ground[0]).lerp(new THREE.Color(city.fog), 0.5).getHexString(), hills = new THREE.Group();
    const hh = (v) => { const x = Math.sin(v * 37.3 + 1.7) * 43758.5453; return x - Math.floor(x); };
    const hillNear = '#' + new THREE.Color(city.ground[0]).lerp(new THREE.Color(city.fog), 0.28).getHexString();
    for (let i = 0; i < 44; i++) {
      const near = i >= 20, a = (i / (near ? 24 : 20)) * Math.PI * 2 + (near ? 0.4 : 0.13), side = Math.sin(a) > 0 ? 'right' : 'left';
      if (city.sides[side] === 'water' && Math.abs(Math.sin(a)) > 0.25) continue;
      const d = (near ? 640 : 800) + hh(i) * (near ? 70 : 140), r = (near ? 70 : 110) + hh(i + 30) * (near ? 60 : 90), h = (near ? 14 : 28) + hh(i + 60) * (near ? 26 : 58);
      const m = sphere(r, near ? hillNear : hillCol, 9); m.scale.set(1.5, h / r, 0.5);
      m.position.set(-Math.sin(a) * d, 0, Math.cos(a) * d); m.rotation.y = Math.atan2(Math.sin(a), -Math.cos(a));
      hills.add(m);
    }
    if (hills.children.length) {
      const hb = bake(hills, { shade: false }), hm = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true, fog: false });
      this.ownMats.push(hm); hb.children[0].material = hm;
      this.far.add(hb);
    }
    for (const b of city.backdrop) {
      if (!LANDMARKS[b.id]) continue;
      const g = bake(LANDMARKS[b.id]()), a = (b.bearing * Math.PI) / 180;
      g.position.set(-Math.sin(a) * b.dist, 0, Math.cos(a) * b.dist);
      g.rotation.y = Math.atan2(Math.sin(a), -Math.cos(a));
      this.far.add(g);
    }
    for (const m of layout.landmarks) {
      if (!LANDMARKS[m.def.id]) continue;
      const turn = m.def.through ? 0 : Math.sign(m.lateral) * (Math.PI / 2 + 0.3);   // front toward the road and the oncoming rider
      let g = buildLandmark(m.def, m.span);
      if (!m.def.through && !m.def.wet) {
        const bb = new THREE.Box3().setFromObject(g), pad = new THREE.Mesh(this.shadowGeo(), this.shadowMat());
        pad.scale.set((bb.max.x - bb.min.x) * 0.56, 1, (bb.max.z - bb.min.z) * 0.56);
        pad.position.set((bb.max.x + bb.min.x) / 2, 0.025, (bb.max.z + bb.min.z) / 2); pad.renderOrder = 1;
        const holder = new THREE.Group(); holder.add(pad);
        scene.add(this.place(holder, m.s, m.lateral, turn));
      }
      g = this.place(g, m.s, m.lateral, turn);
      scene.add(g);
      // moving parts of a landmark: wheels that turn, trains that run back and forth
      g.traverse((o) => { if (o.userData.spin) this.spinners.push(o); if (o.userData.shuttle) this.shuttles.push(o); if (o.userData.screen != null) this.screens.push(o); });
      if (m.def.model) {
        loadLandmark(m.def, { span: m.span }).then((obj) => {
          if (this.disposed) { disposeTree(obj); return; }
          scene.remove(g); disposeTree(g);
          g = this.place(obj, m.s, m.lateral, turn); scene.add(g);
        });
      }
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
      const key = p.n + '|' + (p.r >= 6 ? 'f' + Math.floor(p.s / (CHUNK * 2.5)) : Math.floor(p.s / CHUNK));   // far scenery: bigger batches, fewer draw calls
      let b = buckets.get(key); if (!b) buckets.set(key, b = []);
      b.push(p);
    }
    const protos = new Map(), dummy = new THREE.Object3D(), tint = new THREE.Color();
    const shadows = new Map();       // chunk → [{ x, z, rot, sx, sz }]
    for (const [key, list] of buckets) {
      const n = key.split('|')[0], def = PROPS[n];
      let pr = protos.get(n);
      if (!pr) {
        const baked = bake(def.build());
        pr = { geo: baked.children[0].geometry, mat: this.swayMaterial(def.sway || 0), tints: (def.tints || []).map((c) => new THREE.Color(c)) };
        pr.geo.computeBoundingBox();
        const bb = pr.geo.boundingBox; pr.hx = Math.max(bb.max.x, -bb.min.x); pr.hz = Math.max(bb.max.z, -bb.min.z);
        if (!def.face) pr.hx = pr.hz = Math.min(Math.max(pr.hx, pr.hz), 2.0);   // trees: shadow of the crown, kept modest
        protos.set(n, pr);
      }
      const im = new THREE.InstancedMesh(pr.geo, pr.mat, list.length);
      list.forEach((p, i) => {
        sample(this.path, p.s, p.lateral, _p);
        dummy.position.set(_p.x, 0, _p.z);
        dummy.rotation.y = def.face ? _p.yaw + (p.lateral > 0 ? 1 : -1) * (Math.PI / 2 + 0.25) : p.rot;
        dummy.scale.setScalar((def.face ? 0.92 + (p.scale - 0.85) * 0.45 : p.scale) * (p.k || 1));
        if (p.k && def.face) dummy.scale.y *= 0.7 + ((p.rot * 7) % 1) * 0.9;      // far buildings: mixed heights make a skyline
        dummy.updateMatrix();
        im.setMatrixAt(i, dummy.matrix);
        if (!p.k) {                      // the deep band is too far away for a shadow to show
          const ck = key.split('|')[1]; let sh = shadows.get(ck); if (!sh) shadows.set(ck, sh = []);
          const room = Math.max(0.3, (Math.abs(p.lateral) - RW - 0.6) / 1.6);    // never spill onto the road
          sh.push({ x: _p.x, z: _p.z, rot: dummy.rotation.y, sx: Math.min(room, pr.hx * dummy.scale.x), sz: Math.min(room, pr.hz * dummy.scale.x) });
        }
        const k = Math.floor(p.rot * 1000);
        if (pr.tints.length) tint.copy(pr.tints[k % pr.tints.length]); else tint.setScalar(0.9 + ((k % 7) / 7) * 0.16);
        im.setColorAt(i, tint);
      });
      im.instanceMatrix.needsUpdate = true;
      im.computeBoundingSphere();
      scene.add(im);
    }
    // soft dark pads under everything, so things sit on the ground instead of floating
    for (const list of shadows.values()) {
      const im = new THREE.InstancedMesh(this.shadowGeo(), this.shadowMat(), list.length);
      list.forEach((s, i) => {
        dummy.position.set(s.x - 0.35 * s.sx, 0.03, s.z + 0.3 * s.sz); dummy.rotation.y = s.rot; dummy.scale.set(s.sx * 1.2, 1, s.sz * 1.2); dummy.updateMatrix();
        im.setMatrixAt(i, dummy.matrix);
      });
      im.computeBoundingSphere(); im.renderOrder = 1;
      scene.add(im);
    }
  }

  shadowGeo() { return this._sg || (this._sg = new THREE.CircleGeometry(1, 18).rotateX(-Math.PI / 2)); }
  shadowMat() {
    if (!this._sm) { this._sm = new THREE.MeshBasicMaterial({ color: 0x1a2a3a, transparent: true, opacity: 0.16, depthWrite: false }); this.ownMats.push(this._sm); }
    return this._sm;
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
    this.far.position.set(this.cam.x, 0, this.cam.z);
    for (const o of this.spinners) o.rotation.z = t * o.userData.spin;
    // colour screens drift slowly through hues (a full turn takes over half a minute: no flashing)
    for (const o of this.screens) { o.material.color.setHSL((o.userData.screen + t * 0.03) % 1, 0.75, 0.62); o.material.emissive.copy(o.material.color); }
    for (const o of this.shuttles) { const k = o.userData.shuttle; o.position.x = ((t * k.speed) % k.range) - k.range / 2; }
    for (const p of this.parts) p.update(camS, t, dt);
  }

  dispose() {
    this.disposed = true;
    for (const p of this.parts) p.dispose?.();
    disposeTree(this.scene);
    for (const t of this.textures) t.dispose();
    for (const m of this.ownMats) m.dispose();
    this.scene.clear();
  }
}
