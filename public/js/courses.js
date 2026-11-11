// Course themes: palette, roadside scenery rules and a painted backdrop.
const RW = 3.6; // keep in sync with render.js

const hash = (i) => { const x = Math.sin(i * 127.1) * 43758.5453; return x - Math.floor(x); };
const wrap = (u, m) => ((u % m) + m) % m;
const circ = (g, x, y, r, f) => { g.beginPath(); g.arc(x, y, r, 0, 7); g.fillStyle = f; g.fill(); };

function sky(g, W, hz, c) {
  const gr = g.createLinearGradient(0, 0, 0, hz);
  gr.addColorStop(0, c[0]); gr.addColorStop(1, c[1]);
  g.fillStyle = gr; g.fillRect(0, 0, W, hz + 2);
}
function hills(g, W, H, hz, col, amp, wl, off) {
  g.beginPath(); g.moveTo(0, hz + 2);
  for (let x = 0; x <= W + 24; x += 24) {
    const u = x / H;
    g.lineTo(x, hz - amp * H * (0.55 + 0.3 * Math.sin(u * wl + off) + 0.15 * Math.sin(u * wl * 2.3 + off * 1.7)));
  }
  g.lineTo(W + 24, hz + 2); g.closePath(); g.fillStyle = col; g.fill();
}
function clouds(g, W, H, hz, t, off, col = '#fff') {
  for (let i = 0; i < 5; i++) {
    const x = (wrap(i * 0.23 + t * 0.006 + off * 0.05, 1.3) - 0.15) * W;
    const y = hz * (0.15 + 0.5 * hash(i + 3)), s = H * (0.035 + 0.012 * (i % 3));
    circ(g, x, y, s, col); circ(g, x + s * 1.1, y + s * 0.2, s * 0.8, col);
    circ(g, x - s * 1.1, y + s * 0.25, s * 0.7, col); circ(g, x + s * 0.3, y - s * 0.5, s * 0.75, col);
  }
}
function sun(g, x, y, r, t, col = '#ffd94a') {
  g.save(); g.translate(x, y);
  g.strokeStyle = col; g.lineWidth = r * 0.16; g.lineCap = 'round';
  for (let i = 0; i < 10; i++) {
    const a = t * 0.3 + (i * Math.PI) / 5;
    g.beginPath(); g.moveTo(Math.cos(a) * r * 1.25, Math.sin(a) * r * 1.25); g.lineTo(Math.cos(a) * r * 1.55, Math.sin(a) * r * 1.55); g.stroke();
  }
  circ(g, 0, 0, r, col);
  circ(g, -r * 0.35, -r * 0.1, r * 0.09, '#7a4a00'); circ(g, r * 0.35, -r * 0.1, r * 0.09, '#7a4a00');
  circ(g, -r * 0.55, r * 0.2, r * 0.13, 'rgba(255,120,120,.5)'); circ(g, r * 0.55, r * 0.2, r * 0.13, 'rgba(255,120,120,.5)');
  g.beginPath(); g.arc(0, r * 0.1, r * 0.35, 0.2, Math.PI - 0.2); g.strokeStyle = '#7a4a00'; g.lineWidth = r * 0.08; g.stroke();
  g.restore();
}
function volcano(g, x, hz, w, h, t) {
  g.beginPath(); g.moveTo(x - w, hz + 2); g.lineTo(x - w * 0.22, hz - h); g.lineTo(x + w * 0.22, hz - h); g.lineTo(x + w, hz + 2);
  g.closePath(); g.fillStyle = '#a0603c'; g.fill();
  g.beginPath(); g.moveTo(x - w * 0.22, hz - h); g.lineTo(x + w * 0.22, hz - h); g.lineTo(x + w * 0.3, hz - h * 0.75);
  g.lineTo(x + w * 0.1, hz - h * 0.85); g.lineTo(x - w * 0.05, hz - h * 0.68); g.lineTo(x - w * 0.3, hz - h * 0.78);
  g.closePath(); g.fillStyle = '#ff5a2a'; g.fill();
  for (let i = 0; i < 3; i++) {
    const u = wrap(t * 0.15 + i / 3, 1);
    circ(g, x + Math.sin(u * 5 + i) * w * 0.08, hz - h - u * h * 0.6, w * (0.08 + u * 0.1), `rgba(255,255,255,${0.6 * (1 - u)})`);
  }
}

export const COURSES = [
  {
    id: 'forest', name: '숲속길', icon: 'tree', tint: '#7ed46a',
    ground: ['#8ed462', '#84cc58'], road: ['#ecd0a0', '#e5c692'], edge: ['#fff8e4', '#c99a5e'],
    lanes: 0, fog: '217,244,255', tune: 0,
    scenery: [
      { n: ['tree', 'tree', 'pine'], p: 0.3, min: 2.2, max: 22 },
      { n: ['bush'], p: 0.1, min: 1.5, max: 12 },
      { n: ['flowers'], p: 0.16, min: 1.0, max: 8 },
      { n: ['mushroom'], p: 0.07, min: 1.0, max: 6 },
    ],
    backdrop(g, W, H, hz, t, off) {
      sky(g, W, hz, ['#6ccbff', '#d9f4ff']);
      sun(g, W * 0.82, hz * 0.3, H * 0.055, t);
      clouds(g, W, H, hz, t, off);
      hills(g, W, H, hz, '#a5dfa0', 0.13, 2.2, off * 0.3 + 1);
      hills(g, W, H, hz, '#79cc74', 0.07, 3.4, off * 0.6 + 4);
    },
  },
  {
    id: 'sea', name: '바닷길', icon: 'palm', tint: '#4fb7ff',
    ground: ['#ffe6a8', '#fbdd98'], road: ['#e6bd86', '#dcb078'], edge: ['#ffffff', '#59c3ff'],
    lanes: 0, fog: '227,248,255', tune: 1,
    bands: [
      { a: -600, b: -(RW + 8), c: ['#3eb5f1', '#35abea'] },
      { a: -(RW + 8), b: -(RW + 6.6), c: ['#f2fcff', '#d6f3ff'] },
    ],
    scenery: [
      { n: ['palm'], p: 0.16, min: 2.4, max: 18, side: 1 },
      { n: ['palm'], p: 0.05, min: 2.2, max: 5, side: -1 },
      { n: ['parasol', 'sandcastle'], p: 0.06, min: 1.8, max: 6 },
      { n: ['crab', 'starfish'], p: 0.1, min: 0.9, max: 5 },
      { n: ['boat'], p: 0.035, min: 12, max: 45, side: -1 },
    ],
    backdrop(g, W, H, hz, t, off) {
      sky(g, W, hz, ['#4dbdff', '#e3f8ff']);
      sun(g, W * 0.2, hz * 0.32, H * 0.06, t);
      clouds(g, W, H, hz, t, off);
      hills(g, W, H, hz, '#8fd9c0', 0.05, 1.3, off * 0.3 + 2);
      g.fillStyle = '#2f9be0'; g.fillRect(0, hz - H * 0.022, W, H * 0.025 + 2);
    },
  },
  {
    id: 'dino', name: '공룡길', icon: 'trex', tint: '#ff8a5c',
    ground: ['#e3bc76', '#dab168'], road: ['#bd8f63', '#b38458'], edge: ['#f7e6bf', '#8a5a34'],
    lanes: 0, fog: '255,231,184', tune: 2,
    scenery: [
      { n: ['fern'], p: 0.22, min: 1.2, max: 16 },
      { n: ['rock', 'egg', 'egg'], p: 0.1, min: 1.0, max: 9 },
      { n: ['bronto'], p: 0.035, min: 4.5, max: 16 },
      { n: ['trex'], p: 0.04, min: 2.6, max: 10 },
      { n: ['tricera'], p: 0.04, min: 2.6, max: 10 },
      { n: ['palm'], p: 0.06, min: 3, max: 24 },
    ],
    backdrop(g, W, H, hz, t, off) {
      sky(g, W, hz, ['#ff9d5c', '#ffe7b8']);
      sun(g, W * 0.5, hz * 0.42, H * 0.07, t, '#fff0a0');
      clouds(g, W, H, hz, t, off, 'rgba(255,255,255,.75)');
      volcano(g, (wrap(0.25 - off * 0.02, 1.4) - 0.2) * W, hz, H * 0.2, H * 0.2, t);
      volcano(g, (wrap(0.85 - off * 0.02, 1.4) - 0.2) * W, hz, H * 0.14, H * 0.13, t + 2);
      hills(g, W, H, hz, '#d6975a', 0.05, 2.8, off * 0.5 + 3);
      // friendly pterosaur
      const px = (wrap(t * 0.04, 1.4) - 0.2) * W, py = hz * (0.25 + 0.05 * Math.sin(t)), s = H * 0.03, f = Math.sin(t * 6) * s * 0.7;
      g.strokeStyle = '#7a4a3a'; g.lineWidth = s * 0.25; g.lineCap = 'round'; g.lineJoin = 'round';
      g.beginPath(); g.moveTo(px - s, py - f); g.lineTo(px, py); g.lineTo(px + s, py - f); g.stroke();
    },
  },
  {
    id: 'race', name: '대회코스', icon: 'flagR', tint: '#ff5a7a',
    ground: ['#6fcf6a', '#66c761'], road: ['#e56f62', '#de6558'], edge: ['#ffffff', '#ff4d4d'],
    lanes: 3, fog: '225,245,255', tune: 3,
    scenery: [
      { n: ['flagR', 'flagY', 'flagB'], p: 0.2, min: 1.1, max: 1.6 },
      { n: ['cone'], p: 0.08, min: 0.8, max: 1.0 },
      { n: ['balloons'], p: 0.08, min: 2, max: 9 },
      { n: ['tires'], p: 0.05, min: 2, max: 5 },
      { n: ['stand'], p: 0.07, min: 5.5, max: 7 },
      { n: ['tree'], p: 0.08, min: 12, max: 26 },
    ],
    backdrop(g, W, H, hz, t, off) {
      sky(g, W, hz, ['#5cc4ff', '#e1f5ff']);
      clouds(g, W, H, hz, t, off);
      const cols = ['#ffc9d6', '#c9e4ff', '#ffe9b0', '#d6ccff', '#c6f0d0'];
      for (let i = 0; i < 26; i++) {
        const x = (wrap(i / 26 - off * 0.01, 1) * 1.1 - 0.05) * W, h = H * (0.04 + 0.1 * hash(i));
        g.fillStyle = cols[i % 5]; g.fillRect(x, hz - h, W / 24, h + 2);
      }
      for (let i = 0; i < 3; i++) { // hot-air balloons
        const x = (wrap(0.15 + i * 0.37 + t * 0.003 - off * 0.02, 1.2) - 0.1) * W, y = hz * (0.3 + 0.12 * i) + Math.sin(t * 0.8 + i) * H * 0.008, r = H * 0.035;
        circ(g, x, y, r, ['#ff7fa8', '#ffd23f', '#8e6bf0'][i]);
        g.fillStyle = 'rgba(255,255,255,.55)'; g.fillRect(x - r * 0.2, y - r, r * 0.4, r * 2);
        g.fillStyle = '#a8703f'; g.fillRect(x - r * 0.25, y + r * 1.3, r * 0.5, r * 0.4);
      }
    },
  },
  {
    id: 'space', name: '우주길', icon: 'rocket', tint: '#8e6bf0',
    ground: ['#6b5bb8', '#6252ad'], road: ['#2d2460', '#352b6e'],
    edge: ['#ff5a7a', '#ffa24d', '#ffd23f', '#5fd36a', '#59c3ff', '#b08bff'],
    lanes: 1, fog: '75,42,138', tune: 4,
    scenery: [
      { n: ['crater'], p: 0.14, min: 1.6, max: 14 },
      { n: ['rocket'], p: 0.05, min: 2, max: 10 },
      { n: ['alien'], p: 0.07, min: 1.2, max: 6 },
      { n: ['ufo'], p: 0.045, min: 2.4, max: 12 },
      { n: ['planet'], p: 0.04, min: 5, max: 22 },
    ],
    backdrop(g, W, H, hz, t, off) {
      sky(g, W, hz, ['#150f3d', '#4b2a8a']);
      for (let i = 0; i < 80; i++) {
        g.globalAlpha = 0.45 + 0.55 * Math.abs(Math.sin(t * 1.5 + i));
        circ(g, wrap(hash(i) - off * 0.004, 1) * W, hash(i + 100) * hz * 0.95, H * (0.002 + 0.003 * hash(i + 7)), '#fff');
      }
      g.globalAlpha = 1;
      const px = W * 0.78, py = hz * 0.4, r = H * 0.075;
      circ(g, px, py, r, '#ff9fbd'); circ(g, px - r * 0.3, py - r * 0.25, r * 0.22, '#ffbfd4');
      g.beginPath(); g.ellipse(px, py, r * 1.7, r * 0.35, -0.3, 0, 7); g.strokeStyle = '#ffe680'; g.lineWidth = r * 0.14; g.stroke();
      circ(g, W * 0.18, hz * 0.3, H * 0.04, '#fff6c9'); circ(g, W * 0.18 + H * 0.018, hz * 0.3 - H * 0.008, H * 0.035, '#241a5c');
      const st = wrap(t, 7);
      if (st < 1) {
        g.strokeStyle = `rgba(255,255,255,${1 - st})`; g.lineWidth = H * 0.004;
        g.beginPath(); g.moveTo(W * (0.3 + st * 0.3), hz * (0.1 + st * 0.3)); g.lineTo(W * (0.26 + st * 0.3), hz * (0.06 + st * 0.3)); g.stroke();
      }
      hills(g, W, H, hz, '#5a4aa8', 0.045, 3.2, off * 0.5 + 2);
    },
  },
];

export const courseById = (id) => COURSES.find((c) => c.id === id) || COURSES[0];
