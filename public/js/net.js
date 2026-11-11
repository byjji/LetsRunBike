// WebSocket client for friend rooms.
export class Net {
  constructor() {
    this.ws = null;
    this.onmessage = () => {};
    this.onclose = () => {};
  }

  get open() { return !!this.ws && this.ws.readyState === 1; }

  connect() {
    if (this.open) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(`${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws`);
      const timer = setTimeout(() => { ws.close(); reject(new Error('timeout')); }, 5000);
      ws.onopen = () => { clearTimeout(timer); this.ws = ws; resolve(); };
      ws.onerror = () => { clearTimeout(timer); reject(new Error('connect failed')); };
      ws.onmessage = (e) => {
        let m;
        try { m = JSON.parse(e.data); } catch { return; }
        this.onmessage(m);
      };
      ws.onclose = () => {
        if (this.ws === ws) { this.ws = null; this.onclose(); }
      };
    });
  }

  send(m) { if (this.open) this.ws.send(JSON.stringify(m)); }

  close() {
    const ws = this.ws;
    this.ws = null; // intentional close → no onclose callback
    if (ws) ws.close();
  }
}
