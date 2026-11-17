// Speed sources. The game only ever asks "how fast is the bike going (m/s)?".
//   auto   : parent sets a cruising speed
//   push   : hold Space / touch to go

export class SpeedInput {
  constructor() {
    this.mode = 'auto';
    this.autoKmh = 6;
    this.maxKmh = 12;
    this.going = true;
    this.held = false;
    this.v = 0;
  }

  reset() { this.v = 0; this.going = true; this.held = false; }

  update(dt) {
    let target, k;
    if (this.mode === 'push') { target = this.held ? this.maxKmh / 3.6 : 0; k = this.held ? 0.9 : 0.7; }
    else { target = this.going ? this.autoKmh / 3.6 : 0; k = 1.2; }
    this.v += (target - this.v) * Math.min(1, dt * k);
    if (this.v < 0.02 && target === 0) this.v = 0;
    return this.v;
  }
}
