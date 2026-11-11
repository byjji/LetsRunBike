// LetsRunBike server: static files + WebSocket room relay for "친구 참가".
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { WebSocketServer } = require('ws');

const PORT = process.env.PORT || 3000;
const ROOT = path.join(__dirname, 'public');
const MAX_PLAYERS = 6;
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  let p;
  try {
    p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  } catch {
    res.writeHead(400).end();
    return;
  }
  if (p === '/') p = '/index.html';
  const file = path.normalize(path.join(ROOT, p));
  if (!file.startsWith(ROOT + path.sep)) {
    res.writeHead(403).end();
    return;
  }
  fs.readFile(file, (err, buf) => {
    if (err) {
      res.writeHead(404).end('Not found');
      return;
    }
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(file)] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
    });
    res.end(buf);
  });
});

// ---------- rooms ----------
const rooms = new Map(); // code -> { code, players: Map<id, player>, hostId, state, config }
let nextId = 1;

const cleanName = (s) => String(s ?? '').replace(/[<>&"'\s]/g, '').slice(0, 8) || '친구';
const cleanChar = (s) => (/^[a-z]{1,10}$/.test(s) ? s : 'bunny');
const int = (v, lo, hi, d) => (Number.isFinite(+v) ? Math.min(hi, Math.max(lo, Math.round(+v))) : d);
const num = (v) => (Number.isFinite(+v) ? +v : 0);

function cleanConfig(c = {}) {
  return {
    course: /^[a-z]{1,12}$/.test(c.course) ? c.course : 'forest',
    npc: int(c.npc, 0, 5, 2),
    diff: int(c.diff, 0, 2, 1),
    len: int(c.len, 50, 3000, 400),
  };
}

const roster = (room) => [...room.players.values()].map(({ id, name, char }) => ({ id, name, char }));
const send = (ws, msg) => ws.readyState === 1 && ws.send(JSON.stringify(msg));
function broadcast(room, msg, exceptId) {
  const data = JSON.stringify(msg);
  for (const p of room.players.values()) {
    if (p.id !== exceptId && p.ws.readyState === 1) p.ws.send(data);
  }
}
const roomInfo = (room) => ({ t: 'room', players: roster(room), hostId: room.hostId, config: room.config });

function newCode() {
  for (;;) {
    const code = String(1000 + Math.floor(Math.random() * 9000));
    if (!rooms.has(code)) return code;
  }
}

function leave(ws) {
  const room = ws.room;
  if (!room) return;
  ws.room = null;
  room.players.delete(ws.pid);
  if (room.players.size === 0) {
    rooms.delete(room.code);
    return;
  }
  if (room.hostId === ws.pid) room.hostId = room.players.keys().next().value;
  broadcast(room, roomInfo(room));
}

const wss = new WebSocketServer({ server, path: '/ws', maxPayload: 4096 });

wss.on('connection', (ws) => {
  ws.pid = 'p' + nextId++;
  ws.alive = true;
  ws.on('pong', () => (ws.alive = true));
  ws.on('close', () => leave(ws));
  ws.on('error', () => {});
  ws.on('message', (raw) => {
    let m;
    try {
      m = JSON.parse(raw);
    } catch {
      return;
    }
    if (!m || typeof m !== 'object') return;
    const room = ws.room;
    const isHost = room && room.hostId === ws.pid;

    switch (m.t) {
      case 'create':
      case 'join': {
        if (room) leave(ws);
        let target;
        if (m.t === 'create') {
          target = { code: newCode(), players: new Map(), hostId: ws.pid, state: 'lobby', config: cleanConfig(m.config) };
          rooms.set(target.code, target);
        } else {
          target = rooms.get(String(m.room));
          if (!target) return send(ws, { t: 'error', msg: '그런 방이 없어요. 방 번호를 확인해 주세요.' });
          if (target.state !== 'lobby') return send(ws, { t: 'error', msg: '지금 달리는 중이에요. 조금만 기다려요!' });
          if (target.players.size >= MAX_PLAYERS) return send(ws, { t: 'error', msg: '방이 꽉 찼어요.' });
        }
        ws.room = target;
        target.players.set(ws.pid, { id: ws.pid, ws, name: cleanName(m.name), char: cleanChar(m.char) });
        send(ws, { t: 'joined', room: target.code, id: ws.pid });
        broadcast(target, roomInfo(target));
        break;
      }
      case 'leave':
        leave(ws);
        break;
      case 'config':
        if (!isHost || room.state !== 'lobby') return;
        room.config = cleanConfig(m.config);
        broadcast(room, roomInfo(room));
        break;
      case 'start':
        if (!isHost || room.state !== 'lobby') return;
        room.state = 'racing';
        broadcast(room, {
          t: 'start',
          config: room.config,
          seed: Math.floor(Math.random() * 1e9),
          players: roster(room),
          hostId: room.hostId,
        });
        break;
      case 'lobby':
        if (!isHost) return;
        room.state = 'lobby';
        broadcast(room, { t: 'lobby' });
        broadcast(room, roomInfo(room));
        break;
      case 's': {
        if (!room || room.state !== 'racing') return;
        const out = { t: 's', id: ws.pid, d: num(m.d), v: num(m.v), f: num(m.f) };
        if (isHost && Array.isArray(m.n)) {
          out.n = m.n.slice(0, 5).map((a) => (Array.isArray(a) ? [num(a[0]), num(a[1]), num(a[2])] : [0, 0, 0]));
        }
        broadcast(room, out, ws.pid);
        break;
      }
    }
  });
});

// drop dead connections
setInterval(() => {
  for (const ws of wss.clients) {
    if (!ws.alive) {
      ws.terminate();
      continue;
    }
    ws.alive = false;
    ws.ping();
  }
}, 30000);

server.listen(PORT, () => {
  console.log(`\n  LetsRunBike 실행 중!\n  이 컴퓨터:   http://localhost:${PORT}`);
  for (const list of Object.values(os.networkInterfaces())) {
    for (const ni of list || []) {
      if (ni.family === 'IPv4' && !ni.internal) console.log(`  같은 와이파이: http://${ni.address}:${PORT}`);
    }
  }
  console.log('');
});
