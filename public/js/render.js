// Casual-3D renderer, rear quarter view: the camera rides behind and above the player.
// Keeps the old Renderer shape: render(scene) with the object from Race.scene().
import * as THREE from 'three';
import { sample } from './path.js';
import { cityById } from './cities.js';
import { World } from './three/world.js';
import { LANDMARKS, buildLandmark } from './three/landmarks/index.js';
import { disposeTree } from './three/kit.js';

const CAM_BACK = 6.5;       // camera distance behind the player
const CAM_H = 3.6;          // camera height
const LOOK_AHEAD = 12;
const FOV = 60;
const SPEEDY_KMH = 12;      // the speed effect starts here
const FONT = '"Jua", "Malgun Gothic", sans-serif';
const _a = {}, _b = {}, _v = new THREE.Vector3();

export class Renderer {
  /** canvas: WebGL canvas. fx: 2D canvas laid over it (name tags, confetti). */
  constructor(canvas, fx) {
    this.cv = canvas; this.fx = fx;
    this.g = fx.getContext('2d');
    try {
      this.gl = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    } catch {
      throw new Error('webgl');
    }
    this.camera = new THREE.PerspectiveCamera(FOV, 16 / 9, 0.3, 1800);
    this.world = null;
    this.fov = FOV;
    this.thumbs = new Map();
    this.resize();
  }

  get info() { return this.gl.info; }

  resize() {
    const w = this.cv.clientWidth || 1280, h = this.cv.clientHeight || 720;
    const k = Math.min(window.devicePixelRatio || 1, 2, 1920 / w); // cap for TV-sized screens
    this.W = this.fx.width = Math.round(w * k);
    this.H = this.fx.height = Math.round(h * k);
    this.gl.setPixelRatio(1);
    this.gl.setSize(this.W, this.H, false);
    this.camera.aspect = this.W / this.H;
    this.camera.updateProjectionMatrix();
  }

  /** scene: { city, track, camPos, camX, items[], t, speed01 } */
  render(scene) {
    const { city, track, camPos, items, t, speed01 } = scene;
    if (!this.world || this.world.city !== city || this.world.track !== track) {
      this.world?.dispose();
      this.world = new World(city, track);
      this.last = t;
    }
    const world = this.world, cam = this.camera, camX = scene.camX || 0;
    const dt = Math.min(0.1, Math.max(0, t - this.last)); this.last = t;

    world.setItems(items, t);
    world.update(camPos, t, dt);

    sample(world.path, camPos - CAM_BACK, camX, _a);
    sample(world.path, camPos + LOOK_AHEAD, camX * 0.5, _b);
    cam.position.set(_a.x, CAM_H, _a.z);
    cam.lookAt(_b.x, 1.1, _b.z);
    // speed feel from 12 km/h up to 20: slightly wider view and soft streaks at the screen edges.
    // Kept mild on purpose (a toddler watches): no shake, no flashing, eased in and out.
    const boost = Math.min(1, Math.max(0, ((scene.kmh ?? speed01 * 12) - SPEEDY_KMH) / 8));
    this.boost = (this.boost || 0) + (boost - (this.boost || 0)) * Math.min(1, dt * 1.5);
    const fov = FOV + this.boost * 6;
    this.fov += (fov - this.fov) * Math.min(1, dt * 3);
    if (Math.abs(cam.fov - this.fov) > 0.01) { cam.fov = this.fov; cam.updateProjectionMatrix(); }

    this.gl.render(world.scene, cam);

    const g = this.g;
    g.clearRect(0, 0, this.W, this.H);
    if (this.boost > 0.02) this.streaks(t, this.boost);

    // overlay: name tags above riders
    for (const l of world.labels) {
      _v.set(l.x, l.y, l.z).project(cam);
      if (_v.z > 1 || _v.z < -1) continue;
      const d = Math.hypot(l.x - cam.position.x, l.z - cam.position.z);
      const ppu = this.H / (2 * Math.tan((cam.fov * Math.PI) / 360) * Math.max(1, d));
      if (ppu > 14) this.tag((_v.x * 0.5 + 0.5) * this.W, (-_v.y * 0.5 + 0.5) * this.H, ppu, l, t);
    }
  }

  /** Soft white wind streaks rushing past the edges of the screen; k = 0..1 strength. Centre stays clear. */
  streaks(t, k) {
    const g = this.g, W = this.W, H = this.H, cx = W / 2, cy = H * 0.42, R = Math.hypot(W, H) / 2;
    const frac = (v) => v - Math.floor(v), hash = (i) => frac(Math.sin(i * 91.7 + 1.3) * 43758.5453);
    g.save();
    g.lineCap = 'round';
    const n = Math.round(10 + k * 14);
    for (let i = 0; i < n; i++) {
      const a = hash(i) * Math.PI * 2, u = frac(t * (0.9 + hash(i + 7) * 0.5) + hash(i + 3));
      const r0 = R * (0.5 + u * 0.55), len = R * (0.08 + k * 0.1);
      const fade = Math.sin(u * Math.PI);                       // appear and vanish smoothly
      g.strokeStyle = `rgba(255,255,255,${(0.12 + 0.26 * k) * fade})`;
      g.lineWidth = Math.max(2, H * 0.005);
      g.beginPath();
      g.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0 * 0.75);
      g.lineTo(cx + Math.cos(a) * (r0 + len), cy + Math.sin(a) * (r0 + len) * 0.75);
      g.stroke();
    }
    g.restore();
  }

  tag(x, y, ppu, it, t) {
    const g = this.g, fs = Math.max(13, Math.min(this.H * 0.04, ppu * 0.3));
    g.font = `${fs}px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle';
    const w = g.measureText(it.name).width + fs * 0.9, h = fs * 1.45;
    y -= h * 0.6;
    if (it.me) y -= Math.abs(Math.sin(t * 4)) * fs * 0.3;
    g.beginPath(); g.roundRect(x - w / 2, y - h / 2, w, h, h / 2);
    g.fillStyle = it.me ? '#ffd23f' : 'rgba(255,255,255,.88)'; g.fill();
    if (it.me) {
      g.beginPath(); g.moveTo(x - fs * 0.35, y + h / 2 - 1); g.lineTo(x + fs * 0.35, y + h / 2 - 1); g.lineTo(x, y + h / 2 + fs * 0.4); g.fill();
    }
    g.fillStyle = '#3b3054'; g.fillText(it.name, x, y + fs * 0.06);
  }

  /** Small picture for a city card. */
  async thumb(cityId, size = 256) {
    if (this.thumbs.has(cityId)) return this.thumbs.get(cityId);
    const city = cityById(cityId);
    // a city may name a picture-only model (thumb); otherwise its hero landmark is shown
    const def = city.thumb ? { id: city.thumb, h: 30, through: false, span: 0 } : city.landmarks.find((l) => l.id === city.hero);
    if (!LANDMARKS[def.id]) return '';
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(city.sky[1]);
    scene.add(new THREE.HemisphereLight(0xffffff, 0xdddddd, 1.9));
    const sun = new THREE.DirectionalLight(0xfff4e0, 1.7); sun.position.set(-0.6, 1, 0.8); scene.add(sun);
    const sea = def.through || def.wet;      // bridges and sea rocks sit in water
    const ground = new THREE.Mesh(new THREE.CircleGeometry(900, 24).rotateX(-Math.PI / 2), new THREE.MeshLambertMaterial({ color: sea ? '#3aa7ea' : city.ground[0] }));
    ground.position.y = def.through ? -3.2 : def.wet ? -1.6 : -0.02;
    const lm = buildLandmark(def, Math.min(def.span, 44));
    scene.add(ground, lm);
    const cam = new THREE.PerspectiveCamera(35, 1, 1, 2000);
    let cx = 0, cy = def.h * 0.5, r = def.h * 0.75, dir = [0.55, 0.3, 1];
    if (def.through) { const box = new THREE.Box3().setFromObject(lm); cy = Math.max(5, box.max.y * 0.45); r = Math.max(14, box.max.y * 0.8, def.span > 6 ? 24 : 0); dir = def.span > 6 ? [1, 0.35, 0.75] : [0.5, 0.25, 1]; }
    else { const box = new THREE.Box3().setFromObject(lm); cx = (box.min.x + box.max.x) / 2; r = Math.max(def.h * 0.56, Math.min((box.max.x - box.min.x) * 0.4, def.h * 1.5)); cy = Math.min(cy, r * 0.75); }
    const dl = Math.hypot(...dir), dist = (r / Math.tan((35 * Math.PI) / 360)) * 1.05;
    cam.position.set(cx + (dir[0] / dl) * dist, cy + (dir[1] / dl) * dist, (dir[2] / dl) * dist);
    cam.lookAt(cx, cy, 0);
    cam.aspect = this.W / this.H; cam.updateProjectionMatrix();
    // draw into the main canvas, then copy its centre square out in the same tick
    cam.fov = 2 * Math.atan(Math.tan((35 * Math.PI) / 360)) * (180 / Math.PI); cam.updateProjectionMatrix();
    this.gl.render(scene, cam);
    const c = document.createElement('canvas'); c.width = c.height = size;
    const side = Math.min(this.W, this.H);
    c.getContext('2d').drawImage(this.cv, (this.W - side) / 2, (this.H - side) / 2, side, side, 0, 0, size, size);
    disposeTree(scene); ground.material.dispose();
    const url = c.toDataURL('image/jpeg', 0.85);
    this.thumbs.set(cityId, url);
    return url;
  }

  dispose() {
    this.world?.dispose(); this.world = null;
    this.gl.dispose();
  }
}
