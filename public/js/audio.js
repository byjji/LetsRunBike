// Tiny WebAudio synth: cheerful looping tune per course + sound effects. No audio files.
const TUNES = [ // [transpose, bpm, wave]
  [0, 116, 'triangle'], [2, 104, 'sine'], [-3, 96, 'triangle'], [4, 132, 'triangle'], [5, 100, 'sine'],
];
const _ = null;
const MELODY = [
  0, 4, 7, 4, 0, 4, 7, _, 9, 12, 16, 12, 9, 12, 16, _,
  5, 9, 12, 9, 5, 9, 12, _, 7, 11, 14, 11, 7, 5, 4, 2,
  12, _, 7, 4, 12, _, 7, 4, 9, _, 4, 0, 9, _, 12, _,
  5, 5, 9, 12, 17, _, 12, _, 14, 11, 7, 11, 12, _, _, _,
];
const BASS = [0, -3, -7, -5, 0, -3, -7, -5];
const hz = (semi) => 261.63 * Math.pow(2, semi / 12);

export class Sound {
  constructor() {
    this.musicOn = true;
    this.sfxOn = true;
    this.ac = null;
    this.timer = null;
  }

  /** Must be called from a user gesture (browser autoplay rules). */
  unlock() {
    if (!this.ac) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ac = new AC();
      this.master = this.ac.createGain();
      this.master.gain.value = 0.5;
      this.master.connect(this.ac.destination);
    }
    if (this.ac.state === 'suspended') this.ac.resume();
  }

  tone(f, t0, dur, type = 'triangle', vol = 0.2) {
    const ac = this.ac;
    if (!ac) return;
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(this.master);
    o.start(t0); o.stop(t0 + dur + 0.05);
  }

  sfx(name) {
    if (!this.sfxOn || !this.ac) return;
    const t = this.ac.currentTime;
    const seq = (notes, step, dur, type, vol) => notes.forEach((n, i) => this.tone(hz(n), t + i * step, dur, type, vol));
    if (name === 'count') this.tone(hz(7), t, 0.25, 'square', 0.12);
    else if (name === 'go') seq([12, 19], 0.12, 0.45, 'square', 0.14);
    else if (name === 'star') seq([19, 24], 0.07, 0.18, 'sine', 0.22);
    else if (name === 'cheer') seq([12, 16, 19], 0.09, 0.2, 'triangle', 0.2);
    else if (name === 'click') this.tone(hz(12), t, 0.08, 'sine', 0.15);
    else if (name === 'finish') seq([12, 12, 12, 16, 19, 16, 19, 24], 0.14, 0.4, 'triangle', 0.24);
  }

  startMusic(idx = 0) {
    this.stopMusic();
    if (!this.musicOn || !this.ac) return;
    const [tr, bpm, wave] = TUNES[idx % TUNES.length];
    const step = 60 / bpm / 2;
    let i = 0, next = this.ac.currentTime + 0.1;
    this.timer = setInterval(() => {
      while (next < this.ac.currentTime + 0.3) {
        const n = MELODY[i % MELODY.length];
        if (n !== null) this.tone(hz(n + tr), next, step * 1.6, wave, 0.09);
        if (i % 4 === 0) this.tone(hz(BASS[Math.floor(i / 8) % BASS.length] + tr - 12), next, step * 3, 'sine', 0.12);
        next += step; i++;
      }
    }, 80);
  }

  stopMusic() {
    clearInterval(this.timer);
    this.timer = null;
  }
}
