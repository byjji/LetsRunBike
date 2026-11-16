// Casual-3D renderer, rear quarter view: the camera rides behind and above the player.
// Keeps the old Renderer shape: render(scene) with the object from Race.scene().
import * as THREE from 'three';
import { sample } from './path.js';
import { cityById } from './cities.js';
import { World } from './three/world.js';

const CAM_BACK = 6.5;       // camera distance behind the player
const CAM_H = 3.6;          // camera height
const LOOK_AHEAD = 12;
const FOV = 60;
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
    const fov = FOV + Math.max(0, (speed01 - 0.45) / 0.55) * 8;   // faster → wider view
    this.fov += (fov - this.fov) * Math.min(1, dt * 3);
    if (Math.abs(cam.fov - this.fov) > 0.01) { cam.fov = this.fov; cam.updateProjectionMatrix(); }

    this.gl.render(world.scene, cam);

    // overlay: name tags above riders
    const g = this.g;
    g.clearRect(0, 0, this.W, this.H);
    for (const l of world.labels) {
      _v.set(l.x, l.y, l.z).project(cam);
      if (_v.z > 1 || _v.z < -1) continue;
      const d = Math.hypot(l.x - cam.position.x, l.z - cam.position.z);
      const ppu = this.H / (2 * Math.tan((cam.fov * Math.PI) / 360) * Math.max(1, d));
      if (ppu > 14) this.tag((_v.x * 0.5 + 0.5) * this.W, (-_v.y * 0.5 + 0.5) * this.H, ppu, l, t);
    }
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
    const c = document.createElement('canvas'); c.width = c.height = size;
    const g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, size);
    gr.addColorStop(0, city.sky[0]); gr.addColorStop(1, city.sky[1]);
    g.fillStyle = gr; g.fillRect(0, 0, size, size);
    const url = c.toDataURL();
    this.thumbs.set(cityId, url);
    return url;
  }

  dispose() {
    this.world?.dispose(); this.world = null;
    this.gl.dispose();
  }
}
