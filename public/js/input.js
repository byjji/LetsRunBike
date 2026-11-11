// Speed sources. The game only ever asks "how fast is the bike going (m/s)?".
//   auto   : parent sets a cruising speed (no sensor yet)
//   push   : hold Space / touch to go
//   sensor : real wheel speed — Bluetooth CSC sensor on the rear wheel, or window.setBikeSpeed(kmh)

/** Bluetooth "Cycling Speed and Cadence" wheel sensor (standard profile 0x1816). */
export class BikeSensor {
  constructor() {
    this.circ = 0.96;        // wheel circumference in metres (12" balance bike)
    this.speed = 0;          // m/s
    this.lastMove = 0;
    this.connected = false;
    this.onchange = () => {};
    this.lastRevs = null;
    this.lastTime = 0;
  }

  get supported() { return !!navigator.bluetooth; }

  async connect() {
    const dev = await navigator.bluetooth.requestDevice({ filters: [{ services: ['cycling_speed_and_cadence'] }] });
    this.dev = dev;
    dev.addEventListener('gattserverdisconnected', () => {
      this.connected = false; this.lastRevs = null; this.onchange();
      this.open().catch(() => {}); // try once to reconnect
    });
    await this.open();
  }

  async open() {
    const server = await this.dev.gatt.connect();
    const svc = await server.getPrimaryService('cycling_speed_and_cadence');
    const ch = await svc.getCharacteristic('csc_measurement');
    ch.addEventListener('characteristicvaluechanged', (e) => this.onData(e.target.value));
    await ch.startNotifications();
    this.connected = true;
    this.onchange();
  }

  onData(dv) {
    if (!(dv.getUint8(0) & 1)) return; // no wheel revolution data in this packet
    const revs = dv.getUint32(1, true), time = dv.getUint16(5, true); // time unit: 1/1024 s
    if (this.lastRevs !== null) {
      const dr = (revs - this.lastRevs) >>> 0, dt = (time - this.lastTime) & 0xffff;
      if (dr > 0 && dr < 100 && dt > 0) {
        this.speed = (dr * this.circ) / (dt / 1024);
        this.lastMove = performance.now();
      }
    }
    this.lastRevs = revs; this.lastTime = time;
  }

  /** Feed speed from any other source (e.g. a DIY hall sensor bridge). */
  external(kmh) {
    this.speed = Math.max(0, +kmh || 0) / 3.6;
    this.lastMove = performance.now();
  }

  get current() { return performance.now() - this.lastMove > 2500 ? 0 : this.speed; }
}

export class SpeedInput {
  constructor(sensor) {
    this.sensor = sensor;
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
    if (this.mode === 'sensor') { target = Math.min(this.sensor.current, 40 / 3.6); k = 4; }
    else if (this.mode === 'push') { target = this.held ? this.maxKmh / 3.6 : 0; k = this.held ? 0.9 : 0.7; }
    else { target = this.going ? this.autoKmh / 3.6 : 0; k = 1.2; }
    this.v += (target - this.v) * Math.min(1, dt * k);
    if (this.v < 0.02 && target === 0) this.v = 0;
    return this.v;
  }
}
