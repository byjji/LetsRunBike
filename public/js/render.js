// 2.5D pseudo-3D road renderer, rear quarter view (camera behind and above the rider).
import { getSprite, drawRider } from './sprites.js';

export const RW = 3.6;      // road half width (world units)
const D = 1.45;             // projection depth (≈ 70° fov)
const CAM_H = 2.9;          // camera height
const CAM_BACK = 3.9;       // camera distance behind the player
const N = 150;              // draw distance in segments
const NEAR = 0.6;
const HORIZON = 0.3;        // horizon line (fraction of screen height) → looks down on the road
const BLANK = { curve: 0, sprites: [], line: 0 };
const FONT = '"Jua", "Malgun Gothic", sans-serif';

export class Renderer {
  constructor(canvas) {
    this.cv = canvas;
    this.g = canvas.getContext('2d');
    this.off = new Float32Array(N + 2);
    this.buckets = Array.from({ length: N + 1 }, () => []);
    this.resize();
  }

  resize() {
    const w = this.cv.clientWidth || 1280, h = this.cv.clientHeight || 720;
    const k = Math.min(window.devicePixelRatio || 1, 2, 1920 / w); // cap for TV-sized screens
    this.W = this.cv.width = Math.round(w * k);
    this.H = this.cv.height = Math.round(h * k);
  }

  /** scene: { course, track, camPos, items[], t, skyOff, speed01 } */
  render(scene) {
    const { course, track, camPos, items, t, skyOff, speed01 } = scene;
    const g = this.g, W = this.W, H = this.H, hz = H * HORIZON, half = H / 2, off = this.off;
    const segs = track.segs;
    const seg = (i) => (i >= 0 && i < segs.length ? segs[i] : BLANK);

    course.backdrop(g, W, H, hz, t, skyOff);

    const camZ = camPos - CAM_BACK;
    const base = Math.floor(camZ), frac = camZ - base;

    // accumulated curve offset at each segment boundary
    let x = 0, dx = -frac * seg(base).curve;
    for (let i = 0; i <= N; i++) { off[i] = x; x += dx; dx += seg(base + i).curve; }
    const pp = CAM_BACK + frac, pi = Math.floor(pp);
    const camX = off[pi] + (off[pi + 1] - off[pi]) * (pp - pi) + (scene.camX || 0); // follow the player's lane

    const X = (xw, o, s) => W / 2 + (xw + o - camX) * s * half;
    const Y = (s) => hz + CAM_H * s * half;
    const quad = (o1, s1, y1, o2, s2, y2, xa, xb, col) => {
      g.beginPath();
      g.moveTo(X(xa, o1, s1), y1); g.lineTo(X(xb, o1, s1), y1);
      g.lineTo(X(xb, o2, s2), y2); g.lineTo(X(xa, o2, s2), y2);
      g.fillStyle = col; g.fill();
    };

    // bucket dynamic items (riders, stars) by segment
    const buckets = this.buckets;
    for (const b of buckets) b.length = 0;
    for (const it of items) {
      const zr = it.z - camZ;
      if (zr < 1 || zr > N - 1) continue;
      const p = zr + frac, i = Math.floor(p);
      it._o = off[i] + (off[i + 1] - off[i]) * (p - i);
      it._s = D / zr;
      buckets[i].push(it);
    }

    const lanes = course.lanes, ec = course.edge;
    for (let i = N - 1; i >= 0; i--) {
      const z1 = i - frac, z2 = i + 1 - frac;
      if (z2 <= NEAR) continue;
      const sn = D / Math.max(z1, NEAR), sf = D / z2;
      const yn = Y(sn) + 1, yf = Y(sf);
      const on = off[i], of = off[i + 1];
      const idx = base + i, s = seg(idx), alt = Math.floor(idx / 3) & 1;

      g.fillStyle = course.ground[alt]; g.fillRect(0, yf, W, yn - yf);
      if (course.bands) for (const b of course.bands) quad(of, sf, yf, on, sn, yn, b.a, b.b, b.c[alt]);
      quad(of, sf, yf, on, sn, yn, -RW - 0.4, RW + 0.4, ec[((Math.floor(idx / 2) % ec.length) + ec.length) % ec.length]);
      quad(of, sf, yf, on, sn, yn, -RW, RW, course.road[alt]);
      if (lanes && alt === 0) {
        for (let k = 1; k <= lanes; k++) {
          const lx = -RW + (2 * RW * k) / (lanes + 1);
          quad(of, sf, yf, on, sn, yn, lx - 0.06, lx + 0.06, 'rgba(255,255,255,.75)');
        }
      }
      if (s.line === 1) quad(of, sf, yf, on, sn, yn, -RW, RW, '#fff');
      else if (s.line >= 2) {
        const cw = (2 * RW) / 12;
        for (let k = 0; k < 12; k++) quad(of, sf, yf, on, sn, yn, -RW + k * cw, -RW + (k + 1) * cw, (k + s.line) % 2 ? '#fff' : '#222');
      }

      // roadside scenery
      if (s.sprites.length) {
        const zm = idx + 0.5 - camZ;
        if (zm > NEAR + 0.4) {
          const sm = D / zm, om = (on + of) / 2, ppu = sm * half, y = Y(sm);
          for (const sp of s.sprites) {
            const im = getSprite(sp.n);
            const h = im.h * ppu;
            if (h < 3) continue;
            const w = im.w * ppu, sx = X(sp.x, om, sm);
            if (sx + w / 2 < 0 || sx - w / 2 > W) continue;
            g.drawImage(im.c, sx - w / 2, y - h, w, h);
          }
        }
      }

      // riders and stars
      for (const it of buckets[i]) {
        const ppu = it._s * half, sx = X(it.x, it._o, it._s), sy = Y(it._s);
        if (it.kind === 'star') {
          const im = getSprite('star'), w = im.w * ppu, h = im.h * ppu;
          g.drawImage(im.c, sx - w / 2, sy - h - (0.25 + Math.sin(t * 4 + it.z) * 0.12) * ppu, w, h);
          continue;
        }
        drawRider(g, sx, sy, ppu, it.ch, it.phase, it.lean);
        if (ppu > 14) this.tag(sx, sy - 1.62 * ppu, ppu, it, t);
      }
    }

    // distance haze at the horizon
    const fg = g.createLinearGradient(0, hz - H * 0.03, 0, hz + H * 0.09);
    fg.addColorStop(0, `rgba(${course.fog},0)`); fg.addColorStop(0.25, `rgba(${course.fog},.5)`); fg.addColorStop(1, `rgba(${course.fog},0)`);
    g.fillStyle = fg; g.fillRect(0, hz - H * 0.03, W, H * 0.12);

    // speed lines → sense of speed
    if (speed01 > 0.45) {
      g.strokeStyle = `rgba(255,255,255,${Math.min(0.5, (speed01 - 0.45) * 0.9)})`;
      g.lineWidth = H * 0.004; g.lineCap = 'round';
      for (let k = 0; k < 10; k++) {
        // only in the left/right thirds so they never cross the road ahead
        const a = (k % 2 ? Math.PI : 0) + (((k * 0.37) % 1) - 0.5) * 0.9, u = (t * (1.5 + (k % 3) * 0.4) + k * 0.37) % 1;
        const r1 = (0.45 + u * 0.5) * W, r2 = r1 + W * 0.07;
        g.beginPath();
        g.moveTo(W / 2 + Math.cos(a) * r1, hz + Math.sin(a) * r1 * 0.7);
        g.lineTo(W / 2 + Math.cos(a) * r2, hz + Math.sin(a) * r2 * 0.7);
        g.stroke();
      }
    }
  }

  tag(x, y, ppu, it, t) {
    const g = this.g, fs = Math.max(13, Math.min(this.H * 0.04, ppu * 0.3));
    g.font = `${fs}px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle';
    const w = g.measureText(it.name).width + fs * 0.9, h = fs * 1.45;
    if (it.me) y -= Math.abs(Math.sin(t * 4)) * fs * 0.3;
    g.beginPath(); g.roundRect(x - w / 2, y - h / 2, w, h, h / 2);
    g.fillStyle = it.me ? '#ffd23f' : 'rgba(255,255,255,.88)'; g.fill();
    if (it.me) {
      g.beginPath(); g.moveTo(x - fs * 0.35, y + h / 2 - 1); g.lineTo(x + fs * 0.35, y + h / 2 - 1); g.lineTo(x, y + h / 2 + fs * 0.4); g.fill();
    }
    g.fillStyle = '#3b3054'; g.fillText(it.name, x, y + fs * 0.06);
  }
}
