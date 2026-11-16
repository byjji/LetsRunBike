// Characters and their 2D face icons (menus, HUD, results). The riders themselves are 3D: three/riders.js.
const circ = (g, x, y, r, f) => { g.beginPath(); g.arc(x, y, r, 0, 7); g.fillStyle = f; g.fill(); };
const ell = (g, x, y, rx, ry, f, rot = 0) => { g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, 7); g.fillStyle = f; g.fill(); };
const poly = (g, pts, f) => { g.beginPath(); pts.forEach(([x, y], k) => (k ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fillStyle = f; g.fill(); };
const rr = (g, x, y, w, h, r, f) => { g.beginPath(); g.roundRect(x, y, w, h, r); g.fillStyle = f; g.fill(); };

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
export const clearSprites = () => faces.clear();
