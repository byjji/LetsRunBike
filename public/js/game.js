// Race simulation: track building, riders (me / remote friends / NPC), stars, ranking.
import { RW } from './render.js';
import { CHARS, charById } from './sprites.js';

const PAD = 30;               // segments before the start line
const BASE_UPM = 1.15;        // world units per real metre at 1x speed feel
const DIFF = [[0.78, 0.98], [0.9, 1.1], [1.0, 1.18]]; // NPC speed relative to the child

export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function buildTrack(course, lengthM, upm, seed) {
  const r = rng(seed);
  const units = Math.round(lengthM * upm);
  const total = PAD + units + 260;
  const segs = Array.from({ length: total }, () => ({ curve: 0, sprites: [], line: 0 }));

  // gentle S-curves
  for (let i = PAD + 12; i < total - 20;) {
    i += 15 + Math.floor(r() * 35);
    const len = 40 + Math.floor(r() * 60), mag = (r() < 0.5 ? -1 : 1) * (0.0015 + r() * 0.005);
    for (let k = 0; k < len && i + k < total; k++) segs[i + k].curve = mag * Math.sin((Math.PI * k) / len);
    i += len;
  }
  // roadside scenery
  for (let i = 0; i < total; i++) {
    for (const rule of course.scenery) {
      if (r() >= rule.p) continue;
      const side = rule.side || (r() < 0.5 ? -1 : 1);
      const n = rule.n[Math.floor(r() * rule.n.length)];
      segs[i].sprites.push({ n, x: side * (RW + rule.min + r() * (rule.max - rule.min)) });
    }
    segs[i].sprites.sort((a, b) => Math.abs(b.x) - Math.abs(a.x));
  }
  const finish = PAD + units;
  segs[PAD].sprites.push({ n: 'gateStart', x: 0 }); segs[PAD].line = 1;
  segs[finish].sprites.push({ n: 'gateFinish', x: 0 }); segs[finish].line = 2; segs[finish + 1].line = 3;
  for (let m = 100; m < lengthM; m += 100) segs[PAD + Math.round(m * upm)].sprites.push({ n: `sign:${m}m`, x: -(RW + 1.4) });
  return { segs, start: PAD, finish };
}

export class Race {
  /** o: { course, lengthM, npc, diff, seed, vis, players:[{id,name,char}], myId, sim } */
  constructor(o) {
    this.course = o.course;
    this.lengthM = o.lengthM;
    this.upm = BASE_UPM * o.vis;
    this.track = buildTrack(o.course, o.lengthM, this.upm, o.seed);
    this.sim = o.sim; // true → this client simulates the NPCs (solo, or room host)
    this.on = () => {};
    this.clock = -4;
    this.lastCount = 0;
    this.started = false;
    this.ref = 0;
    this.sky = 0;
    this.starCount = 0;
    this.maxSpeed = 0;
    this.hundreds = 0;

    const r = rng(o.seed ^ 0x9e3779b9);
    this.riders = o.players.map((p) => ({
      id: p.id, kind: p.id === o.myId ? 'me' : 'remote', name: p.name, ch: charById(p.char),
      dist: 0, speed: 0, phase: r() * 6, fin: 0, nd: 0, nv: 0,
    }));
    const used = new Set(o.players.map((p) => p.char));
    const free = CHARS.filter((c) => !used.has(c.id));
    for (let i = free.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [free[i], free[j]] = [free[j], free[i]]; }
    const pool = free.length ? free : CHARS;
    const [lo, hi] = DIFF[o.diff] || DIFF[1];
    for (let k = 0; k < o.npc; k++) {
      const ch = pool[k % pool.length];
      this.riders.push({
        id: 'npc' + k, kind: 'npc', name: ch.name, ch, dist: 0, speed: 0, phase: r() * 6, fin: 0, nd: 0, nv: 0,
        f: lo + r() * (hi - lo), w: r() * 6, wf: 0.2 + r() * 0.3,
      });
    }
    this.me = this.riders.find((x) => x.kind === 'me');
    this.npcs = this.riders.filter((x) => x.kind === 'npc');
    this.layoutLanes();

    this.stars = [];
    for (let m = 12; m < o.lengthM - 3; m += 12) this.stars.push({ m, got: false });
    this.nextStar = 0;
  }

  layoutLanes() {
    const n = this.riders.length, gap = Math.min(1.3, (RW * 2 - 1.2) / Math.max(1, n - 1 || 1));
    this.riders.forEach((r, i) => { r.x = (i - (n - 1) / 2) * gap; });
  }

  update(dt, inputSpeed) {
    this.clock += dt;
    const me = this.me;

    if (this.clock < 0) {
      const n = Math.ceil(-this.clock);
      if (n !== this.lastCount && n <= 3) { this.lastCount = n; this.on('count', n); }
      inputSpeed = 0;
    } else if (!this.started) {
      this.started = true;
      this.on('go');
    }

    // me
    if (me.fin) me.speed *= Math.max(0, 1 - dt * 0.7);
    else me.speed = inputSpeed;
    me.dist += me.speed * dt;
    this.maxSpeed = Math.max(this.maxSpeed, me.speed);
    if (!me.fin) this.ref += (me.speed - this.ref) * Math.min(1, dt * 0.8);
    else this.ref = Math.max(this.ref, 1.3);

    for (const r of this.riders) {
      if (r.kind === 'npc' && this.sim) {
        let v = 0;
        if (this.started) {
          v = Math.max(0, this.ref * r.f + Math.sin(this.clock * r.wf + r.w) * 0.18 * Math.min(1, this.ref));
          if (!me.fin) { // rubber band: friends wait ahead and catch up from behind
            const gap = r.dist - me.dist;
            if (gap > 8) v *= Math.max(0, 1 - (gap - 8) / 8);
            else if (gap < -4) v = Math.max(v, this.ref + 0.6 * Math.min(1, (-gap - 4) / 4));
          }
          if (r.fin) v = r.speed * Math.max(0, 1 - dt * 0.7);
        }
        r.speed += (v - r.speed) * Math.min(1, dt * 1.5);
        r.dist += r.speed * dt;
      } else if (r.kind !== 'me') {
        r.nd += r.nv * dt;
        r.speed = r.nv;
        r.dist += r.nv * dt;
        r.dist += (r.nd - r.dist) * Math.min(1, dt * 4);
      }
      r.phase += r.speed * dt * 4.5;
      if (!r.fin && r.dist >= this.lengthM && (r.kind === 'me' || (r.kind === 'npc' && this.sim))) {
        r.fin = Math.max(0.01, this.clock);
        if (r === me) this.on('finish', this.rank().indexOf(me) + 1);
      }
    }

    // stars in my lane
    while (this.nextStar < this.stars.length && me.dist >= this.stars[this.nextStar].m) {
      this.stars[this.nextStar++].got = true;
      this.starCount++;
      this.on('star', this.starCount);
    }
    const h = Math.floor(me.dist / 100);
    if (h > this.hundreds && me.dist < this.lengthM) { this.hundreds = h; this.on('milestone', h * 100); }

    const seg = this.track.segs[Math.floor(this.track.start + me.dist * this.upm)];
    if (seg) this.sky += seg.curve * me.speed * this.upm * dt * 6;
  }

  rank() {
    return [...this.riders].sort((a, b) => (a.fin || 1e9) - (b.fin || 1e9) || b.dist - a.dist);
  }

  scene(t, maxSpeed) {
    const { track, upm, me } = this;
    const items = [];
    const camPos = track.start + me.dist * upm;
    for (const s of this.stars) {
      if (s.got) continue;
      const z = track.start + s.m * upm;
      if (z - camPos > 150) break;
      items.push({ kind: 'star', z, x: me.x });
    }
    for (const r of this.riders) {
      const z = track.start + r.dist * upm;
      const seg = track.segs[Math.floor(z)];
      items.push({ kind: 'rider', z, x: r.x, ch: r.ch, phase: r.phase, lean: seg ? seg.curve * 22 * Math.min(1, r.speed) : 0, name: r.name, me: r === me });
    }
    return { course: this.course, track, camPos, camX: me.x * 0.85, items, t, skyOff: this.sky, speed01: Math.min(1, me.speed / maxSpeed) };
  }

  // ---------- network ----------
  netState() {
    const r2 = (v) => Math.round(v * 100) / 100;
    const m = { t: 's', d: r2(this.me.dist), v: r2(this.me.speed), f: r2(this.me.fin) };
    if (this.sim && this.npcs.length) m.n = this.npcs.map((n) => [r2(n.dist), r2(n.speed), r2(n.fin)]);
    return m;
  }

  applyNet(m) {
    const r = this.riders.find((x) => x.id === m.id);
    if (!r || r.kind !== 'remote') return;
    r.nd = m.d; r.nv = m.v;
    if (m.f) r.fin = m.f;
    if (m.n && !this.sim) {
      this.npcs.forEach((n, i) => {
        const a = m.n[i];
        if (a) { n.nd = a[0]; n.nv = a[1]; if (a[2]) n.fin = a[2]; }
      });
    }
  }

  /** Roster changed mid-race: drop riders who left; take over NPCs if we became host. */
  syncPlayers(ids, iAmHost) {
    this.riders = this.riders.filter((r) => r.kind !== 'remote' || ids.includes(r.id));
    if (iAmHost) this.sim = true;
  }
}
