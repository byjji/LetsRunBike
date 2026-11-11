// Procedural kid-friendly sprites. Everything is drawn in "world units"
// with the origin at the bottom-centre (ground contact) and y going up as negative.

const PX = 110; // cache resolution: pixels per world unit
const cache = new Map();
const FONT = '"Jua", "Malgun Gothic", sans-serif';

const circ = (g, x, y, r, f) => { g.beginPath(); g.arc(x, y, r, 0, 7); g.fillStyle = f; g.fill(); };
const ell = (g, x, y, rx, ry, f, rot = 0) => { g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, 7); g.fillStyle = f; g.fill(); };
const rr = (g, x, y, w, h, r, f) => { g.beginPath(); g.roundRect(x, y, w, h, r); g.fillStyle = f; g.fill(); };
const poly = (g, pts, f) => {
  g.beginPath();
  pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])));
  g.closePath(); g.fillStyle = f; g.fill();
};
const line = (g, pts, c, w) => {
  g.beginPath();
  pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])));
  g.strokeStyle = c; g.lineWidth = w; g.stroke();
};
const star5 = (g, x, y, R, r, f) => {
  g.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5, q = i % 2 ? r : R;
    g.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q);
  }
  g.closePath(); g.fillStyle = f; g.fill();
};
// text at unit scale (avoids sub-pixel font sizes)
const txt = (g, s, x, y, size, c) => {
  g.save(); g.translate(x, y); g.scale(0.01, 0.01);
  g.font = `${size * 100}px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillStyle = c; g.fillText(s, 0, 0); g.restore();
};

const flag = (c) => [1.4, 3.5, (g) => {
  rr(g, -0.05, -3.2, 0.1, 3.2, 0.05, '#e6e6ee');
  poly(g, [[0.05, -3.15], [1.1, -2.8], [0.05, -2.45]], c);
  circ(g, 0, -3.25, 0.1, '#ffd23f');
}];

const gate = (label, c1, c2, checker) => [9.8, 5.6, (g) => {
  for (const s of [-1, 1]) {
    rr(g, s * 4.2 - 0.2, -4.3, 0.4, 4.3, 0.15, c1);
    for (let k = 0; k < 4; k++) rr(g, s * 4.2 - 0.2, -4.1 + k * 1.05, 0.4, 0.4, 0.05, 'rgba(255,255,255,.75)');
    ell(g, s * 4.2 - 0.3, -5.0, 0.3, 0.38, '#ff7fa8');
    ell(g, s * 4.2 + 0.3, -5.05, 0.3, 0.38, '#59c3ff');
    ell(g, s * 4.2, -5.2, 0.3, 0.38, '#ffd23f');
  }
  rr(g, -4.5, -4.75, 9, 1.35, 0.3, c2);
  if (checker) {
    for (let i = 0; i < 18; i++) for (let j = 0; j < 2; j++) {
      if ((i + j) % 2 === 0) g.fillStyle = '#222', g.fillRect(-4.2 + i * 0.47, -4.6 + j * 0.2, 0.47, 0.2);
      if ((i + j) % 2 === 0) g.fillRect(-4.2 + i * 0.47, -3.95 + j * 0.2, 0.47, 0.2);
    }
    rr(g, -1.6, -4.62, 3.2, 1.08, 0.2, '#fff');
  }
  txt(g, label, 0, -4.05, 0.9, checker ? '#e8433a' : '#fff');
}];

const DEFS = {
  // ---------- forest ----------
  tree: [3.2, 4.4, (g) => {
    rr(g, -0.22, -1.5, 0.44, 1.5, 0.1, '#a8703f');
    circ(g, -0.75, -2.1, 0.85, '#3fae55'); circ(g, 0.75, -2.1, 0.85, '#3fae55');
    circ(g, 0, -2.9, 1.2, '#4fc463'); circ(g, -0.4, -3.3, 0.45, '#86e08a');
    [[-0.6, -2.3], [0.5, -2.7], [0.2, -1.9], [0.9, -2.0]].forEach((p) => circ(g, p[0], p[1], 0.13, '#ff5b5b'));
  }],
  pine: [2.6, 4.6, (g) => {
    rr(g, -0.18, -1, 0.36, 1, 0.08, '#8a5a34');
    [[1.2, -0.8, -2.4], [1.0, -1.8, -3.4], [0.75, -2.8, -4.4]].forEach(([w, b, t], i) =>
      poly(g, [[-w, b], [w, b], [0, t]], i % 2 ? '#35a862' : '#268a50'));
  }],
  mushroom: [1.4, 1.3, (g) => {
    rr(g, -0.2, -0.6, 0.4, 0.6, 0.15, '#fff3e0');
    g.beginPath(); g.ellipse(0, -0.55, 0.62, 0.6, 0, Math.PI, 0); g.closePath(); g.fillStyle = '#ff5a5a'; g.fill();
    circ(g, -0.3, -0.8, 0.1, '#fff'); circ(g, 0.15, -0.95, 0.12, '#fff'); circ(g, 0.38, -0.7, 0.07, '#fff');
  }],
  flowers: [1.6, 1.1, (g) => {
    [[-0.5, '#ff7fb0'], [0, '#ffd23f'], [0.5, '#b08bff']].forEach(([x, c], i) => {
      const h = 0.55 + (i % 2) * 0.2;
      line(g, [[x, 0], [x, -h]], '#3fae55', 0.06);
      for (let k = 0; k < 5; k++) circ(g, x + Math.cos(k * 1.2566) * 0.13, -h + Math.sin(k * 1.2566) * 0.13, 0.1, c);
      circ(g, x, -h, 0.08, '#fff');
    });
  }],
  bush: [2, 1.2, (g) => {
    circ(g, -0.5, -0.4, 0.45, '#3fae55'); circ(g, 0.5, -0.4, 0.45, '#3fae55'); circ(g, 0, -0.6, 0.55, '#4fc463');
    [[-0.4, -0.5], [0.2, -0.8], [0.55, -0.4]].forEach((p) => circ(g, p[0], p[1], 0.08, '#ff7fb0'));
  }],
  // ---------- sea ----------
  palm: [3.8, 4.9, (g) => {
    g.beginPath(); g.moveTo(-0.3, 0); g.quadraticCurveTo(-0.5, -2, 0.2, -3.5);
    g.strokeStyle = '#b07a45'; g.lineWidth = 0.32; g.stroke();
    [-2.8, -2.2, -1.57, -0.95, -0.35, 0.25, 2.9].forEach((a, i) =>
      ell(g, 0.2 + Math.cos(a) * 0.8, -3.5 + Math.sin(a) * 0.8, 0.9, 0.25, i % 2 ? '#3fae55' : '#55c56a', a));
    circ(g, 0.05, -3.4, 0.15, '#8a5a34'); circ(g, 0.35, -3.35, 0.15, '#8a5a34');
  }],
  parasol: [2.8, 2.8, (g) => {
    rr(g, 0.3, -0.12, 1, 0.12, 0.04, '#4fd1c2');
    line(g, [[0, 0], [0, -1.8]], '#ddd', 0.08);
    for (let i = 0; i < 6; i++) {
      g.beginPath(); g.moveTo(0, -1.5);
      g.arc(0, -1.5, 1.3, Math.PI + (i * Math.PI) / 6, Math.PI + ((i + 1) * Math.PI) / 6);
      g.closePath(); g.fillStyle = i % 2 ? '#fff' : '#ff6b6b'; g.fill();
    }
  }],
  sandcastle: [1.8, 1.6, (g) => {
    rr(g, -0.7, -0.6, 1.4, 0.6, 0.05, '#f2c879'); rr(g, -0.8, -1, 0.4, 1, 0.05, '#e9bb66');
    rr(g, 0.4, -1, 0.4, 1, 0.05, '#e9bb66'); rr(g, -0.2, -1.2, 0.4, 0.7, 0.05, '#f2c879');
    line(g, [[0, -1.2], [0, -1.5]], '#888', 0.04); poly(g, [[0, -1.5], [0.28, -1.42], [0, -1.33]], '#ff5a5a');
    rr(g, -0.12, -0.3, 0.24, 0.3, 0.1, '#c99a4a');
  }],
  crab: [1.2, 0.8, (g) => {
    for (const s of [-1, 1]) {
      line(g, [[s * 0.3, -0.2], [s * 0.5, -0.05]], '#e2503f', 0.06);
      line(g, [[s * 0.35, -0.35], [s * 0.5, -0.45]], '#e2503f', 0.07);
      circ(g, s * 0.5, -0.5, 0.13, '#ff6b5a');
      circ(g, s * 0.15, -0.55, 0.08, '#fff'); circ(g, s * 0.15, -0.56, 0.04, '#222');
    }
    ell(g, 0, -0.27, 0.4, 0.25, '#ff6b5a');
  }],
  starfish: [0.9, 0.7, (g) => {
    star5(g, 0, -0.32, 0.4, 0.18, '#ffa24d');
    circ(g, -0.08, -0.34, 0.04, '#222'); circ(g, 0.08, -0.34, 0.04, '#222');
  }],
  boat: [3, 3, (g) => {
    poly(g, [[-1.2, -0.5], [1.2, -0.5], [0.8, 0], [-0.8, 0]], '#e8554d');
    line(g, [[0, -0.5], [0, -2.7]], '#8a5a34', 0.08);
    poly(g, [[0.06, -2.6], [1, -0.7], [0.06, -0.7]], '#fff');
    poly(g, [[-0.06, -2.2], [-0.8, -0.7], [-0.06, -0.7]], '#ffd23f');
  }],
  // ---------- dino ----------
  bronto: [5.4, 4.9, (g) => {
    g.lineCap = 'round';
    g.beginPath(); g.moveTo(-1.2, -1.3); g.quadraticCurveTo(-2.2, -1.2, -2.4, -0.3);
    g.strokeStyle = '#6cc56a'; g.lineWidth = 0.45; g.stroke();
    rr(g, -1, -0.9, 0.45, 0.9, 0.15, '#57b058'); rr(g, 0.3, -0.9, 0.45, 0.9, 0.15, '#57b058');
    ell(g, -0.2, -1.5, 1.4, 0.9, '#6cc56a');
    g.beginPath(); g.moveTo(0.7, -1.9); g.quadraticCurveTo(1.3, -3.2, 1.5, -4.0);
    g.strokeStyle = '#6cc56a'; g.lineWidth = 0.55; g.stroke();
    ell(g, 1.75, -4.1, 0.55, 0.38, '#6cc56a');
    circ(g, 1.9, -4.2, 0.07, '#222'); circ(g, 2.05, -4.0, 0.08, '#ff9fb0');
    g.beginPath(); g.arc(1.95, -4.05, 0.2, 0.3, 1.6); g.strokeStyle = '#2d7a36'; g.lineWidth = 0.04; g.stroke();
    [[-0.8, -1.8, 0.18], [-0.2, -2.0, 0.14], [0.3, -1.6, 0.16], [-0.5, -1.3, 0.12]].forEach((p) => circ(g, p[0], p[1], p[2], '#9be08f'));
  }],
  trex: [3.4, 3.7, (g) => {
    const c = '#ff8a5c', d = '#e56d42';
    poly(g, [[-0.4, -1.3], [-1.5, -0.5], [-0.3, -0.6]], c);
    rr(g, -0.5, -0.7, 0.4, 0.7, 0.12, d); rr(g, 0.1, -0.7, 0.4, 0.7, 0.12, d);
    [[-0.55, -2.2], [-0.7, -1.8], [-0.75, -1.4]].forEach((p) => poly(g, [[p[0], p[1] - 0.18], [p[0] - 0.3, p[1]], [p[0], p[1] + 0.18]], d));
    ell(g, 0, -1.4, 0.75, 0.95, c); ell(g, 0.15, -1.3, 0.45, 0.7, '#ffd9b0');
    rr(g, -0.2, -3.2, 1.4, 1, 0.4, c);
    circ(g, 0.6, -2.85, 0.13, '#fff'); circ(g, 0.64, -2.85, 0.06, '#222');
    line(g, [[0.3, -2.45], [1.15, -2.5]], '#7a2e16', 0.05);
    for (let i = 0; i < 4; i++) poly(g, [[0.4 + i * 0.2, -2.46], [0.5 + i * 0.2, -2.33], [0.6 + i * 0.2, -2.47]], '#fff');
    line(g, [[0.55, -1.7], [0.9, -1.55]], d, 0.14);
  }],
  tricera: [3.6, 2.3, (g) => {
    rr(g, -1.1, -0.6, 0.4, 0.6, 0.12, '#7d6ce0'); rr(g, 0.1, -0.6, 0.4, 0.6, 0.12, '#7d6ce0');
    poly(g, [[-1.3, -1], [-1.75, -0.6], [-1.2, -0.6]], '#9b8cf0');
    ell(g, -0.3, -0.95, 1.2, 0.7, '#9b8cf0');
    circ(g, 0.9, -1.3, 0.75, '#7d6ce0'); circ(g, 0.9, -1.3, 0.55, '#b9adf7');
    ell(g, 1.1, -1.0, 0.6, 0.5, '#9b8cf0');
    poly(g, [[1.0, -1.4], [1.15, -2.0], [1.3, -1.4]], '#fff'); poly(g, [[1.55, -1.0], [1.95, -1.3], [1.6, -0.8]], '#fff');
    circ(g, 1.25, -1.1, 0.07, '#222');
  }],
  fern: [1.8, 1.5, (g) => {
    [-2.6, -2.1, -1.57, -1.05, -0.55].forEach((a, i) =>
      ell(g, Math.cos(a) * 0.6, Math.sin(a) * 0.6, 0.65, 0.17, i % 2 ? '#3d9e4c' : '#56b862', a));
  }],
  egg: [0.9, 1.1, (g) => {
    ell(g, 0, -0.5, 0.38, 0.5, '#fff6e0');
    circ(g, -0.12, -0.6, 0.09, '#8fd0ff'); circ(g, 0.15, -0.4, 0.07, '#ff9fb0'); circ(g, 0.08, -0.78, 0.06, '#8fe08a');
  }],
  rock: [1.6, 1, (g) => {
    poly(g, [[-0.7, 0], [-0.5, -0.6], [0, -0.85], [0.5, -0.55], [0.7, 0]], '#9aa0ad');
    poly(g, [[-0.5, -0.6], [0, -0.85], [0.1, -0.4], [-0.3, -0.25]], '#b6bcc8');
  }],
  // ---------- race ----------
  flagR: flag('#ff5a5a'), flagY: flag('#ffd23f'), flagB: flag('#4fb7ff'),
  balloons: [1.8, 3.7, (g) => {
    [[-0.45, -2.7, '#ff7fa8'], [0.45, -2.8, '#59c3ff'], [0, -3.1, '#ffd23f']].forEach(([x, y, c]) => {
      line(g, [[0, 0], [x, y + 0.45]], '#aaa', 0.03);
      ell(g, x, y, 0.38, 0.46, c); ell(g, x - 0.12, y - 0.15, 0.08, 0.13, 'rgba(255,255,255,.6)');
    });
  }],
  cone: [0.9, 1, (g) => {
    poly(g, [[-0.3, 0], [0.3, 0], [0.08, -0.85], [-0.08, -0.85]], '#ff8a3d');
    poly(g, [[-0.2, -0.38], [0.2, -0.38], [0.15, -0.55], [-0.15, -0.55]], '#fff');
    rr(g, -0.4, -0.1, 0.8, 0.1, 0.04, '#e56d2a');
  }],
  stand: [5.6, 3.3, (g) => {
    rr(g, -2.6, -2.4, 5.2, 2.4, 0.15, '#5a6b8c');
    const cols = ['#ffd9b0', '#ff9fbd', '#8fd0ff', '#ffe14d', '#9be08f', '#c9a0ff'];
    for (let r = 0; r < 3; r++) for (let i = 0; i < 9; i++) {
      const x = -2.2 + i * 0.55 + (r % 2) * 0.2, y = -0.5 - r * 0.7;
      rr(g, x - 0.18, y, 0.36, 0.4, 0.1, cols[(i + r * 2) % 6]);
      circ(g, x, y - 0.12, 0.17, (i + r) % 3 ? '#ffd9b0' : '#f3c59a');
    }
    rr(g, -2.7, -3.15, 5.4, 0.7, 0.14, '#ff5a7a');
    txt(g, '화이팅! 화이팅!', 0, -2.78, 0.46, '#fff');
  }],
  tires: [1.3, 1.2, (g) => {
    [['#ff5a5a', 0], ['#fff', -0.34], ['#ffd23f', -0.68]].forEach(([c, y]) => {
      ell(g, 0, y - 0.2, 0.55, 0.2, '#333'); ell(g, 0, y - 0.24, 0.55, 0.17, c); ell(g, 0, y - 0.24, 0.25, 0.07, '#333');
    });
  }],
  // ---------- space ----------
  rocket: [1.9, 3.7, (g) => {
    poly(g, [[-0.3, -0.75], [0.3, -0.75], [0, 0]], '#ffb33d'); poly(g, [[-0.16, -0.75], [0.16, -0.75], [0, -0.3]], '#fff3a0');
    poly(g, [[-0.4, -1.4], [-0.85, -0.6], [-0.35, -0.85]], '#ff5a5a'); poly(g, [[0.4, -1.4], [0.85, -0.6], [0.35, -0.85]], '#ff5a5a');
    ell(g, 0, -2, 0.5, 1.3, '#f4f4ff');
    g.save(); g.beginPath(); g.ellipse(0, -2, 0.5, 1.3, 0, 0, 7); g.clip(); g.fillStyle = '#ff5a5a'; g.fillRect(-1, -3.4, 2, 0.75); g.restore();
    circ(g, 0, -2.15, 0.26, '#3b8beb'); circ(g, 0, -2.15, 0.19, '#9be7ff');
  }],
  alien: [1.4, 1.8, (g) => {
    line(g, [[0, -1.4], [0, -1.68]], '#4db85a', 0.05); circ(g, 0, -1.7, 0.08, '#ff7fa8');
    ell(g, 0, -0.45, 0.33, 0.45, '#7be07a'); circ(g, 0, -1.1, 0.42, '#7be07a');
    ell(g, -0.16, -1.13, 0.1, 0.15, '#222', 0.3); ell(g, 0.16, -1.13, 0.1, 0.15, '#222', -0.3);
    circ(g, -0.14, -1.18, 0.035, '#fff'); circ(g, 0.18, -1.18, 0.035, '#fff');
    g.beginPath(); g.arc(0, -0.98, 0.14, 0.3, 2.84); g.strokeStyle = '#2d7a36'; g.lineWidth = 0.04; g.stroke();
    line(g, [[-0.3, -0.6], [-0.55, -0.9]], '#7be07a', 0.1);
  }],
  crater: [2.2, 0.5, (g) => { ell(g, 0, -0.2, 1, 0.22, '#8d7fc9'); ell(g, 0, -0.17, 0.75, 0.14, '#5b4da3'); }],
  ufo: [2.7, 3.9, (g) => {
    poly(g, [[-0.4, -2.6], [0.4, -2.6], [0.9, 0], [-0.9, 0]], 'rgba(255,240,130,.3)');
    circ(g, 0, -3.0, 0.5, '#9be7ff'); ell(g, 0, -2.8, 1.25, 0.35, '#c9c9e8');
    [-0.8, -0.27, 0.27, 0.8].forEach((x, i) => circ(g, x, -2.78, 0.09, ['#ff5a7a', '#ffd23f', '#5fd36a', '#59c3ff'][i]));
  }],
  planet: [3, 4.8, (g) => {
    circ(g, 0, -3.5, 0.9, '#ffb36b');
    g.save(); g.beginPath(); g.arc(0, -3.5, 0.9, 0, 7); g.clip();
    g.fillStyle = '#ff9248'; g.fillRect(-1, -3.8, 2, 0.2); g.fillRect(-1, -3.3, 2, 0.28); g.restore();
    g.beginPath(); g.ellipse(0, -3.5, 1.4, 0.3, -0.25, 0, 7); g.strokeStyle = '#fff3a0'; g.lineWidth = 0.1; g.stroke();
  }],
  // ---------- common ----------
  star: [1.2, 1.5, (g) => {
    circ(g, 0, -0.8, 0.55, 'rgba(255,240,140,.4)');
    star5(g, 0, -0.8, 0.45, 0.22, '#ffd23f'); star5(g, 0, -0.8, 0.3, 0.15, '#ffe680');
    circ(g, -0.1, -0.84, 0.04, '#7a4a00'); circ(g, 0.1, -0.84, 0.04, '#7a4a00');
    g.beginPath(); g.arc(0, -0.78, 0.08, 0.2, 2.94); g.strokeStyle = '#7a4a00'; g.lineWidth = 0.03; g.stroke();
  }],
  gateStart: gate('출발', '#4fb7ff', '#ff8a3d', false),
  gateFinish: gate('도착', '#ff5a7a', '#222', true),
};

function sign(label) {
  return [1.7, 2.3, (g) => {
    rr(g, -0.06, -1.3, 0.12, 1.3, 0.04, '#a8703f');
    rr(g, -0.8, -2.2, 1.6, 0.95, 0.18, '#ff8a3d'); rr(g, -0.72, -2.12, 1.44, 0.79, 0.14, '#fff');
    txt(g, label, 0, -1.7, 0.5, '#3b3054');
  }];
}

export function getSprite(name) {
  let s = cache.get(name);
  if (s) return s;
  const def = name.startsWith('sign:') ? sign(name.slice(5)) : DEFS[name];
  if (!def) return null;
  const [w, h, draw] = def;
  const c = document.createElement('canvas');
  c.width = Math.ceil(w * PX); c.height = Math.ceil(h * PX);
  const g = c.getContext('2d');
  g.translate(c.width / 2, c.height); g.scale(PX, PX);
  g.lineJoin = g.lineCap = 'round';
  draw(g);
  s = { c, w, h };
  cache.set(name, s);
  return s;
}
export const clearSprites = () => { cache.clear(); faces.clear(); };
export const spriteURL = (name) => getSprite(name).c.toDataURL();

// ---------- characters ----------
export const CHARS = [
  { id: 'bunny', name: '토끼', fur: '#fff5f8', helmet: '#ff7fa8', shirt: '#ff9fbd', ear: 'long' },
  { id: 'bear', name: '곰돌이', fur: '#c98a55', helmet: '#3b8beb', shirt: '#5aa5f5', ear: 'round' },
  { id: 'cat', name: '고양이', fur: '#ffc66b', helmet: '#8e6bf0', shirt: '#a98bf7', ear: 'pointy' },
  { id: 'dog', name: '강아지', fur: '#f2e2c4', helmet: '#f25c4d', shirt: '#f7806f', ear: 'floppy' },
  { id: 'dino', name: '공룡', fur: '#7ed46a', helmet: '#ff9f1c', shirt: '#ffb84d', ear: 'spikes' },
  { id: 'chick', name: '병아리', fur: '#ffe14d', helmet: '#22b8a7', shirt: '#4fd1c2', ear: 'tuft' },
  { id: 'penguin', name: '펭귄', fur: '#3d4a66', helmet: '#ffd23f', shirt: '#ffe07a', ear: 'none' },
  { id: 'fox', name: '여우', fur: '#ff8a3d', helmet: '#2f9e5b', shirt: '#52c07c', ear: 'pointy' },
];
export const charById = (id) => CHARS.find((c) => c.id === id) || CHARS[0];

function drawEars(g, ch, x, y, r) {
  for (const s of [-1, 1]) {
    switch (ch.ear) {
      case 'long':
        ell(g, x + s * 0.42 * r, y - 1.3 * r, 0.22 * r, 0.6 * r, ch.fur, s * 0.12);
        ell(g, x + s * 0.42 * r, y - 1.3 * r, 0.1 * r, 0.42 * r, '#ffb3cb', s * 0.12);
        break;
      case 'round':
        circ(g, x + s * 0.78 * r, y - 0.78 * r, 0.36 * r, ch.fur); circ(g, x + s * 0.78 * r, y - 0.78 * r, 0.18 * r, '#f3c59a');
        break;
      case 'pointy':
        poly(g, [[x + s * 0.3 * r, y - 0.85 * r], [x + s * 0.85 * r, y - 1.45 * r], [x + s * 0.98 * r, y - 0.45 * r]], ch.fur);
        break;
      case 'floppy':
        ell(g, x + s * 1.0 * r, y - 0.05 * r, 0.3 * r, 0.55 * r, '#b07a4a', s * -0.2);
        break;
    }
  }
  if (ch.ear === 'spikes') for (let i = -1; i <= 1; i++) poly(g, [[x + i * 0.4 * r - 0.2 * r, y - 0.95 * r], [x + i * 0.4 * r, y - 1.5 * r + Math.abs(i) * 0.15 * r], [x + i * 0.4 * r + 0.2 * r, y - 0.95 * r]], '#3d9e4c');
  if (ch.ear === 'tuft') for (let i = -1; i <= 1; i++) ell(g, x + i * 0.16 * r, y - 1.15 * r, 0.09 * r, 0.26 * r, '#ffb33d', i * 0.4);
}

/** Front-facing face icon (menus, HUD, results). */
export function drawFace(g, ch, x, y, r) {
  drawEars(g, ch, x, y, r);
  circ(g, x, y, r, ch.fur);
  if (ch.id === 'penguin') ell(g, x, y + 0.2 * r, 0.72 * r, 0.7 * r, '#fff');
  // helmet
  g.beginPath(); g.arc(x, y - 0.08 * r, r * 1.06, Math.PI * 1.02, Math.PI * 1.98); g.closePath(); g.fillStyle = ch.helmet; g.fill();
  rr(g, x - 0.1 * r, y - 1.12 * r, 0.2 * r, 0.75 * r, 0.08 * r, 'rgba(255,255,255,.65)');
  // face
  circ(g, x - 0.36 * r, y + 0.2 * r, 0.11 * r, '#2b2238'); circ(g, x + 0.36 * r, y + 0.2 * r, 0.11 * r, '#2b2238');
  circ(g, x - 0.33 * r, y + 0.16 * r, 0.04 * r, '#fff'); circ(g, x + 0.39 * r, y + 0.16 * r, 0.04 * r, '#fff');
  circ(g, x - 0.6 * r, y + 0.45 * r, 0.14 * r, 'rgba(255,120,150,.45)'); circ(g, x + 0.6 * r, y + 0.45 * r, 0.14 * r, 'rgba(255,120,150,.45)');
  if (ch.id === 'chick' || ch.id === 'penguin') {
    poly(g, [[x - 0.16 * r, y + 0.38 * r], [x + 0.16 * r, y + 0.38 * r], [x, y + 0.62 * r]], '#ff9f1c');
  } else {
    ell(g, x, y + 0.42 * r, 0.09 * r, 0.06 * r, '#2b2238');
    g.beginPath(); g.arc(x, y + 0.48 * r, 0.2 * r, 0.25, Math.PI - 0.25);
    g.strokeStyle = '#2b2238'; g.lineWidth = 0.06 * r; g.lineCap = 'round'; g.stroke();
  }
}

const faces = new Map();
export function faceURL(ch, size = 128) {
  const k = ch.id + size;
  if (!faces.has(k)) {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    drawFace(c.getContext('2d'), ch, size / 2, size * 0.6, size * 0.3);
    faces.set(k, c.toDataURL());
  }
  return faces.get(k);
}

/** Rider on a balance bike seen from behind. (sx, sy) = ground point, ppu = pixels per unit. */
export function drawRider(g, sx, sy, ppu, ch, phase, lean) {
  g.save();
  g.translate(sx, sy); g.scale(ppu, ppu);
  g.lineCap = 'round';
  ell(g, 0, 0, 0.45, 0.1, 'rgba(0,0,0,.2)');
  g.rotate(lean);
  const bob = Math.sin(phase * 2) * 0.015;
  // rear wheel
  rr(g, -0.075, -0.44, 0.15, 0.44, 0.07, '#2e2e38'); rr(g, -0.03, -0.4, 0.06, 0.36, 0.03, '#5a5a66');
  // legs kick the ground alternately
  for (const s of [-1, 1]) {
    const lift = Math.max(0, Math.sin(phase + (s > 0 ? Math.PI : 0))) * 0.13;
    line(g, [[s * 0.12, -0.5 + bob], [s * 0.21, -0.07 - lift]], '#4a5a7a', 0.12);
    ell(g, s * 0.22, -0.045 - lift, 0.09, 0.055, '#fff');
  }
  rr(g, -0.11, -0.52, 0.22, 0.1, 0.04, ch.helmet); // seat
  // handlebar + arms
  line(g, [[-0.38, -0.7 + bob], [0.38, -0.7 + bob]], '#555', 0.05);
  for (const s of [-1, 1]) {
    circ(g, s * 0.38, -0.7 + bob, 0.05, '#222');
    line(g, [[s * 0.17, -0.8 + bob], [s * 0.34, -0.7 + bob]], ch.shirt, 0.1);
    circ(g, s * 0.34, -0.7 + bob, 0.055, ch.fur);
  }
  rr(g, -0.21, -0.88 + bob, 0.42, 0.44, 0.16, ch.shirt); // torso
  circ(g, 0, -0.5 + bob, 0.075, ch.fur); // tail
  // head + helmet
  const hy = -1.04 + bob, r = 0.23;
  drawEars(g, ch, 0, hy, r);
  circ(g, 0, hy, r, ch.fur);
  ell(g, 0, hy - 0.04, r * 1.1, r * 0.95, ch.helmet);
  rr(g, -0.03, hy - 0.26, 0.06, 0.3, 0.03, 'rgba(255,255,255,.7)');
  g.restore();
}
