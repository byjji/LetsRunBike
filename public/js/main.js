// App glue: screens, settings, race loop, HUD, friend rooms.
import { COURSES, courseById } from './courses.js';
import { CHARS, charById, faceURL, spriteURL, clearSprites } from './sprites.js';
import { Renderer } from './render.js';
import { Race, buildTrack } from './game.js';
import { SpeedInput, BikeSensor } from './input.js';
import { Sound } from './audio.js';
import { Net } from './net.js';

const $ = (s) => document.querySelector(s);
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const fmtTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

// ---------- persistent settings ----------
const S = {
  name: '', char: 'bunny', course: 'forest', npc: 3, diff: 1, len: 400,
  inputMode: 'auto', autoKmh: 6, maxKmh: 12, wheel: 960, vis: 2, music: true, sfx: true,
};
try { Object.assign(S, JSON.parse(localStorage.getItem('lrb') || '{}')); } catch { /* first run */ }
const save = () => { try { localStorage.setItem('lrb', JSON.stringify(S)); } catch { /* private mode */ } };

// ---------- core objects ----------
const sensor = new BikeSensor();
const input = new SpeedInput(sensor);
const sound = new Sound();
const net = new Net();
let renderer;

let mode = 'solo';            // 'solo' | 'host' | 'guest'
let room = null;              // { code, myId, hostId, players }
let config = null;            // { course, npc, diff, len } in use on the setup screen
let race = null;
let paused = false;
let resultTimer = 0;
let confetti = [];
let demo = { course: null, track: null, z: 0 };
let pins = new Map();
let screen = 'home';

function applySettings() {
  input.mode = S.inputMode; input.autoKmh = S.autoKmh; input.maxKmh = S.maxKmh;
  sensor.circ = S.wheel / 1000;
  sound.musicOn = S.music; sound.sfxOn = S.sfx;
}

// ---------- screens ----------
function show(id) {
  screen = id;
  document.querySelectorAll('.screen').forEach((s) => s.classList.toggle('on', s.id === 's-' + id));
}
let toastTimer = 0;
function toast(msg, ms = 2600) {
  const t = $('#toast');
  t.textContent = msg; t.classList.add('on');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('on'), ms);
}
function big(text, small) {
  const b = $('#big');
  b.textContent = text; b.classList.toggle('small', !!small);
  b.classList.remove('show'); void b.offsetWidth; b.classList.add('show');
}
function chips(box, options, current, onPick) {
  box = typeof box === 'string' ? $(box) : box;
  box.replaceChildren(...options.map(([v, label]) => {
    const b = el('button', 'chip' + (v === current ? ' sel' : ''), label);
    b.onclick = () => { sound.unlock(); sound.sfx('click'); onPick(v); };
    return b;
  }));
}

// ---------- home / avatar ----------
function renderHome() {
  $('#me-face').src = faceURL(charById(S.char), 256);
  $('#me-name').textContent = S.name || charById(S.char).name;
}
function renderAvatar() {
  $('#chars').replaceChildren(...CHARS.map((c) => {
    const b = el('button', 'card' + (c.id === S.char ? ' sel' : ''));
    const img = el('img'); img.src = faceURL(c, 256); img.alt = c.name;
    b.append(img, el('span', '', c.name));
    b.onclick = () => { S.char = c.id; save(); sound.unlock(); sound.sfx('click'); renderAvatar(); };
    return b;
  }));
  $('#name-input').value = S.name;
}
const myProfile = () => ({ name: S.name || charById(S.char).name, char: S.char });

// ---------- setup (course / NPC / distance) ----------
function setConfig(patch) {
  Object.assign(config, patch);
  if (mode !== 'guest') { Object.assign(S, config); save(); }
  if (mode === 'host') net.send({ t: 'config', config });
  renderSetup();
}
function renderSetup() {
  const locked = mode === 'guest';
  $('#setup-title').textContent = mode === 'solo' ? '어디로 달릴까?' : '친구랑 같이 달려요!';
  $('#setup-body').classList.toggle('locked', locked);
  $('#btn-start').hidden = locked;
  $('#wait-msg').hidden = !locked;
  $('#roombox').hidden = mode === 'solo';

  $('#courses').replaceChildren(...COURSES.map((c) => {
    const b = el('button', 'card' + (c.id === config.course ? ' sel' : ''));
    const img = el('img'); img.src = spriteURL(c.icon); img.alt = '';
    b.append(img, el('span', '', c.name));
    b.onclick = () => { sound.unlock(); sound.sfx('click'); setConfig({ course: c.id }); };
    return b;
  }));
  chips('#npcs', [0, 1, 2, 3, 4, 5].map((n) => [n, n ? String(n) : '없음']), config.npc, (v) => setConfig({ npc: v }));
  chips('#diffs', [[0, '느긋하게'], [1, '비슷하게'], [2, '빠르게']], config.diff, (v) => setConfig({ diff: v }));
  chips('#lens', [[200, '200m'], [400, '400m'], [800, '800m']], config.len, (v) => setConfig({ len: v }));

  if (room) {
    $('#room-code').textContent = room.code;
    $('#room-url').textContent = `${location.origin}/?room=${room.code}`;
    $('#room-players').replaceChildren(...room.players.map((p) => {
      const d = el('div', 'player' + (p.id === room.hostId ? ' host' : ''));
      const img = el('img'); img.src = faceURL(charById(p.char)); img.alt = '';
      d.append(img, el('span', '', p.name));
      return d;
    }));
  }
}
function openSetup(m) {
  mode = m;
  if (m !== 'guest' || !config) config = { course: S.course, npc: S.npc, diff: S.diff, len: S.len };
  renderSetup();
  show('setup');
}

// ---------- settings ----------
const MODE_HELP = {
  auto: '센서가 없을 때: 정한 속도로 화면이 계속 달려요. 달리는 중 ↑↓ 키로 속도 조절, 스페이스바로 멈춤/출발.',
  push: '화면이나 스페이스바를 꾹 누르고 있는 동안 달려요. 부모님이 아이 발 구르기에 맞춰 눌러 주세요.',
  sensor: '뒷바퀴에 단 블루투스 속도 센서(CSC)의 실제 속도로 달려요. 크롬/엣지 브라우저에서 "센서 연결"을 눌러 주세요.',
};
function renderSettings() {
  const set = (k, v) => { S[k] = v; save(); applySettings(); renderSettings(); };
  chips('#set-mode', [['auto', '자동 속도'], ['push', '눌러서 달리기'], ['sensor', '바퀴 센서']], S.inputMode, (v) => set('inputMode', v));
  $('#mode-help').textContent = MODE_HELP[S.inputMode];
  $('#v-autoKmh').textContent = `${S.autoKmh} km/h`;
  $('#v-maxKmh').textContent = `${S.maxKmh} km/h`;
  chips('#set-vis', [[1, '1배'], [1.5, '1.5배'], [2, '2배'], [3, '3배']], S.vis, (v) => set('vis', v));
  chips('#set-wheel', [[800, '10인치'], [960, '12인치'], [1120, '14인치']], S.wheel, (v) => set('wheel', v));
  chips('#set-music', [[true, '음악 켜기'], [false, '음악 끄기']], S.music, (v) => set('music', v));
  chips('#set-sfx', [[true, '효과음 켜기'], [false, '효과음 끄기']], S.sfx, (v) => set('sfx', v));
  renderSensor();
}
function renderSensor() {
  const txt = !sensor.supported ? '이 브라우저는 블루투스를 지원하지 않아요 (크롬/엣지 권장)'
    : sensor.connected ? `연결됨 · 지금 ${(sensor.current * 3.6).toFixed(1)} km/h` : '연결 안 됨';
  $('#sensor-status').textContent = txt;
  $('#btn-sensor').disabled = !sensor.supported;
  $('#btn-sensor2').textContent = sensor.connected ? '센서 연결됨' : '센서 연결';
}
async function connectSensor() {
  if (!sensor.supported) return toast('이 브라우저는 블루투스를 지원하지 않아요. 크롬이나 엣지를 써 주세요.');
  try { await sensor.connect(); toast('센서가 연결됐어요!'); }
  catch (e) { if (e.name !== 'NotFoundError') toast('센서 연결에 실패했어요.'); }
}
sensor.onchange = renderSensor;
window.setBikeSpeed = (kmh) => sensor.external(kmh); // hook for custom sensors

// ---------- race ----------
function startRace({ cfg, seed, players, myId, sim }) {
  const course = courseById(cfg.course);
  race = new Race({ course, lengthM: cfg.len, npc: cfg.npc, diff: cfg.diff, seed, vis: S.vis, players, myId, sim });
  race.on = onRaceEvent;
  paused = false; confetti = []; clearTimeout(resultTimer);
  input.reset();
  show('none');
  $('#hud').hidden = false;
  $('#ctrl-auto').hidden = S.inputMode !== 'auto';
  $('#ctrl-push').hidden = S.inputMode !== 'push';
  $('#ctrl-sensor').hidden = S.inputMode !== 'sensor';
  $('#btn-go').textContent = '멈춤';
  $('#star-n').textContent = '0';
  buildPins();
  sound.unlock(); sound.startMusic(course.tune);
  navigator.wakeLock?.request('screen').catch(() => {});
  document.activeElement?.blur();
}
function buildPins() {
  const bar = $('#progress');
  for (const img of pins.values()) img.remove();
  pins = new Map();
  for (const r of race.riders) {
    const img = el('img', r === race.me ? 'me' : ''); img.src = faceURL(r.ch); img.alt = '';
    bar.append(img); pins.set(r.id, img);
  }
}
function endRace() {
  race = null; paused = false; confetti = [];
  clearTimeout(resultTimer);
  $('#hud').hidden = true;
  sound.stopMusic();
}
function onRaceEvent(type, v) {
  if (type === 'count') { big(String(v)); sound.sfx('count'); }
  else if (type === 'go') { big('출발!'); sound.sfx('go'); }
  else if (type === 'star') {
    $('#star-n').textContent = v; sound.sfx('star');
    const s = $('#stars'); s.classList.remove('pop'); void s.offsetWidth; s.classList.add('pop');
  } else if (type === 'milestone') {
    big(`${v}m! ${['잘한다!', '멋져요!', '씽씽!', '최고야!'][(v / 100) % 4]}`, true); sound.sfx('cheer');
  } else if (type === 'finish') {
    big('도착!'); sound.sfx('finish');
    const cols = ['#ff5a7a', '#ffd23f', '#5fd36a', '#59c3ff', '#b08bff', '#ff8a3d'];
    confetti = Array.from({ length: 160 }, (_, i) => ({
      x: Math.random(), y: -Math.random() * 0.6, vx: (Math.random() - 0.5) * 0.15, vy: 0.2 + Math.random() * 0.35,
      c: cols[i % 6], s: 0.008 + Math.random() * 0.01, a: Math.random() * 6,
    }));
    resultTimer = setTimeout(showResult, 3200);
  }
}
function updateHud() {
  const me = race.me, kmh = me.speed * 3.6;
  $('#kmh').textContent = kmh.toFixed(1);
  $('#gauge').style.strokeDashoffset = 100 - clamp(kmh / S.maxKmh, 0, 1) * 100;
  $('#rank-n').textContent = race.rank().indexOf(me) + 1;
  $('#distinfo').textContent = `${Math.min(race.lengthM, Math.floor(me.dist))}m / ${race.lengthM}m · ${fmtTime(Math.max(0, me.fin || race.clock))}`;
  $('#progress-fill').style.width = `${clamp(me.dist / race.lengthM, 0, 1) * 100}%`;
  for (const r of race.riders) {
    const img = pins.get(r.id);
    if (img) img.style.left = `${clamp(r.dist / race.lengthM, 0, 1) * 100}%`;
  }
  for (const [id, img] of pins) if (!race.riders.some((r) => r.id === id)) { img.remove(); pins.delete(id); }
}
function renderResult() {
  if (!race) return;
  const order = race.rank(), medals = ['🥇', '🥈', '🥉'];
  $('#result-list').replaceChildren(...order.map((r, i) => {
    const row = el('div', 'result-row' + (r === race.me ? ' me' : ''));
    const img = el('img'); img.src = faceURL(r.ch); img.alt = '';
    row.append(el('span', 'medal', r.fin ? medals[i] || `${i + 1}` : '🚲'), img, el('span', 'nm', r.name),
      el('span', 'tm', r.fin ? fmtTime(r.fin) : '달리는 중…'));
    return row;
  }));
}
function showResult() {
  if (!race) return;
  const me = race.me, t = me.fin || race.clock;
  $('#result-title').textContent = `${me.name}, 도착! 참 잘했어요!`;
  const stat = (label, value) => { const d = el('div', '', label); d.prepend(el('b', '', value)); return d; };
  $('#result-stats').replaceChildren(
    stat('달린 거리', `${race.lengthM}m`), stat('걸린 시간', fmtTime(t)),
    stat('평균 속도', `${((race.lengthM / t) * 3.6).toFixed(1)} km/h`),
    stat('최고 속도', `${(race.maxSpeed * 3.6).toFixed(1)} km/h`), stat('모은 별', `⭐ ${race.starCount}`),
  );
  $('#btn-again').hidden = mode === 'guest';
  $('#result-wait').hidden = mode !== 'guest';
  renderResult();
  $('#hud').hidden = true;
  show('result');
}
function soloStart() {
  startRace({ cfg: config, seed: Math.floor(Math.random() * 1e9), players: [{ id: 'me', ...myProfile() }], myId: 'me', sim: true });
}
function goHome() {
  endRace();
  if (room) { net.close(); room = null; }
  mode = 'solo';
  renderHome();
  show('home');
}

// ---------- friends (network) ----------
async function netConnect() {
  try { await net.connect(); return true; }
  catch { toast('서버에 연결할 수 없어요. "npm start"로 실행했는지 확인해 주세요.', 4000); return false; }
}
net.onmessage = (m) => {
  switch (m.t) {
    case 'joined':
      room = { code: m.room, myId: m.id, hostId: null, players: [] };
      break;
    case 'room': {
      if (!room) return;
      room.players = m.players; room.hostId = m.hostId;
      const iAmHost = room.hostId === room.myId;
      if (race) { race.syncPlayers(m.players.map((p) => p.id), iAmHost); mode = iAmHost ? 'host' : 'guest'; if (screen === 'result') showResult(); return; }
      if (!iAmHost) config = m.config;
      openSetup(iAmHost ? 'host' : 'guest');
      break;
    }
    case 'start':
      config = m.config;
      startRace({ cfg: m.config, seed: m.seed, players: m.players, myId: room.myId, sim: m.hostId === room.myId });
      break;
    case 's':
      race?.applyNet(m);
      break;
    case 'lobby':
      endRace();
      break;
    case 'error':
      toast(m.msg, 3500);
      break;
  }
};
net.onclose = () => {
  if (!room) return;
  room = null;
  toast('친구 방과 연결이 끊어졌어요.');
  if (race) { race.syncPlayers([], true); mode = 'solo'; } else goHome();
};

// ---------- buttons ----------
const tap = (sel, fn) => $(sel).addEventListener('click', () => { sound.unlock(); sound.sfx('click'); fn(); });
tap('#me-card', () => { renderAvatar(); show('avatar'); });
tap('#btn-avatar-ok', () => { S.name = $('#name-input').value.trim().slice(0, 6); save(); renderHome(); show('home'); });
tap('#btn-solo', () => openSetup('solo'));
tap('#btn-friends', () => show('join'));
tap('#btn-settings', () => { renderSettings(); show('settings'); });
tap('#btn-full', () => (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.()));
tap('#btn-create', async () => { if (await netConnect()) net.send({ t: 'create', ...myProfile(), config: { course: S.course, npc: S.npc, diff: S.diff, len: S.len } }); });
tap('#btn-join', async () => {
  const code = $('#code-input').value.trim();
  if (!/^\d{4}$/.test(code)) return toast('방 번호 숫자 4개를 넣어 주세요.');
  if (await netConnect()) net.send({ t: 'join', room: code, ...myProfile() });
});
tap('#btn-start', () => (mode === 'host' ? net.send({ t: 'start' }) : soloStart()));
tap('#btn-sensor', connectSensor);
tap('#btn-sensor2', connectSensor);
tap('#btn-pause', () => { paused = true; if (mode === 'solo') sound.stopMusic(); show('pause'); });
tap('#btn-resume', () => { paused = false; show('none'); if (mode === 'solo' && race) sound.startMusic(race.course.tune); });
tap('#btn-quit', goHome);
tap('#btn-home', goHome);
tap('#btn-again', () => {
  if (mode === 'host') return net.send({ t: 'lobby' });
  endRace(); soloStart();
});
document.querySelectorAll('[data-back]').forEach((b) => b.addEventListener('click', goHome));
document.querySelectorAll('[data-step]').forEach((b) => b.addEventListener('click', () => {
  const k = b.dataset.step;
  S[k] = clamp(S[k] + +b.dataset.d, k === 'autoKmh' ? 1 : 6, k === 'autoKmh' ? S.maxKmh : 25);
  S.autoKmh = Math.min(S.autoKmh, S.maxKmh);
  save(); applySettings(); renderSettings();
}));

function nudgeAuto(d) {
  S.autoKmh = clamp(S.autoKmh + d, 1, S.maxKmh); save(); applySettings();
  toast(`자동 속도 ${S.autoKmh} km/h`, 900);
}
function toggleGo() {
  input.going = !input.going;
  $('#btn-go').textContent = input.going ? '멈춤' : '출발';
}
tap('#btn-slower', () => nudgeAuto(-1));
tap('#btn-faster', () => nudgeAuto(1));
tap('#btn-go', toggleGo);

addEventListener('keydown', (e) => {
  if (!race || screen !== 'none') return;
  if (e.code === 'Space' || e.code === 'Enter') {
    e.preventDefault();
    if (S.inputMode === 'push') input.held = true;
    else if (S.inputMode === 'auto' && !e.repeat) toggleGo();
  } else if (e.code === 'ArrowUp' && S.inputMode === 'auto') nudgeAuto(1);
  else if (e.code === 'ArrowDown' && S.inputMode === 'auto') nudgeAuto(-1);
  else if (e.code === 'Escape') $('#btn-pause').click();
});
addEventListener('keyup', (e) => { if (e.code === 'Space' || e.code === 'Enter') input.held = false; });
const cv = $('#game');
cv.addEventListener('pointerdown', () => { if (race && S.inputMode === 'push') input.held = true; });
addEventListener('pointerup', () => { input.held = false; });
addEventListener('pointercancel', () => { input.held = false; });
addEventListener('resize', () => renderer?.resize());
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && race) navigator.wakeLock?.request('screen').catch(() => {});
});

// ---------- main loop ----------
let last = 0, netAcc = 0, uiAcc = 0;
function frame(now) {
  requestAnimationFrame(frame);
  const t = now / 1000, dt = Math.min(0.1, t - last || 0);
  last = t;

  if (race) {
    if (!(paused && mode === 'solo')) race.update(dt, input.update(dt));
    renderer.render(race.scene(t, S.maxKmh / 3.6));
    if (!$('#hud').hidden) updateHud();
    if (room && (netAcc += dt) > 0.1) { netAcc = 0; net.send(race.netState()); }
    if ((uiAcc += dt) > 0.5) { uiAcc = 0; if (screen === 'result') renderResult(); }
    drawConfetti(dt);
  } else {
    // attract mode: slow fly-through of the selected course behind the menus
    const course = courseById(config?.course || S.course);
    if (demo.course !== course) demo = { course, track: buildTrack(course, 500, 1.2, 7), z: 0 };
    demo.z += dt * 5;
    if (demo.z > demo.track.finish - 40) demo.z = 0;
    renderer.render({ course, track: demo.track, camPos: 38 + demo.z, items: [], t, skyOff: 0, speed01: 0 });
    if ((uiAcc += dt) > 0.5) { uiAcc = 0; if (screen === 'settings') renderSensor(); }
  }
}
function drawConfetti(dt) {
  if (!confetti.length) return;
  const g = renderer.g, W = renderer.W, H = renderer.H;
  for (const p of confetti) {
    p.x += p.vx * dt; p.y += p.vy * dt; p.a += dt * 5;
    if (p.y > 1.05) { p.y = -0.05; p.x = Math.random(); }
    g.save(); g.translate(p.x * W, p.y * H); g.rotate(p.a);
    g.fillStyle = p.c; g.fillRect(-p.s * H, -p.s * H * 0.5, p.s * H * 2, p.s * H);
    g.restore();
  }
}

// ---------- boot ----------
async function boot() {
  applySettings();
  // wait briefly for the web font so cached sprites/labels use it
  try { await Promise.race([document.fonts.load('20px Jua'), new Promise((r) => setTimeout(r, 1500))]); } catch { /* offline */ }
  clearSprites();
  renderer = new Renderer(cv);
  renderHome();
  const code = new URLSearchParams(location.search).get('room');
  if (code && /^\d{4}$/.test(code)) { $('#code-input').value = code; show('join'); }
  else show('home');
  requestAnimationFrame(frame);
}
boot();
