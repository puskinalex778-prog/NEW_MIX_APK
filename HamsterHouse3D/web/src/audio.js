// Все звуки синтезируются на лету через WebAudio — никаких файлов не нужно.
let ctx = null, master = null, noiseBuf = null;

function tone(f0, f1, dur, type = 'sine', vol = 0.15, delay = 0) {
  if (!ctx) return;
  const t = ctx.currentTime + delay;
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f0, t);
  o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + Math.min(0.02, dur / 3));
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(master);
  o.start(t); o.stop(t + dur + 0.05);
}
function noise(dur, freq, vol = 0.2, delay = 0, q = 1.5) {
  if (!ctx) return;
  const t = ctx.currentTime + delay;
  const s = ctx.createBufferSource(); s.buffer = noiseBuf;
  const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q;
  const g = ctx.createGain();
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f); f.connect(g); g.connect(master);
  s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.02);
}

export const sfx = {
  enabled: true,
  init() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain(); master.gain.value = 0.55; master.connect(ctx.destination);
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    } catch (e) { ctx = null; }
  },
  ok() { return this.enabled && ctx && ctx.state === 'running'; },
  squeak(p = 1) {
    if (!this.ok()) return;
    tone(2500 * p, 3500 * p, 0.07, 'sine', 0.09);
    tone(3300 * p, 2400 * p, 0.10, 'sine', 0.08, 0.075);
  },
  crunch() { if (!this.ok()) return; for (let i = 0; i < 4; i++) noise(0.05, 2200 + Math.random() * 1500, 0.18, i * 0.11); },
  pour() { if (!this.ok()) return; for (let i = 0; i < 14; i++) noise(0.04, 3000 + Math.random() * 2000, 0.12, i * 0.04 + Math.random() * 0.02, 3); },
  water() { if (!this.ok()) return; for (let i = 0; i < 6; i++) tone(350 + Math.random() * 200, 900 + Math.random() * 300, 0.09, 'sine', 0.12, i * 0.09); },
  sip() { if (!this.ok()) return; tone(700, 1100, 0.06, 'sine', 0.06); },
  pop() { if (!this.ok()) return; tone(700, 180, 0.12, 'sine', 0.2); },
  heart() { if (!this.ok()) return; tone(880, 1320, 0.12, 'triangle', 0.09); tone(1320, 1760, 0.14, 'triangle', 0.07, 0.1); },
  chime() { if (!this.ok()) return; [523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, f, 0.5, 'triangle', 0.11, i * 0.12)); },
  soft() { if (!this.ok()) return; [784, 659, 523, 392].forEach((f, i) => tone(f, f * 0.99, 0.8, 'sine', 0.09, i * 0.25)); },
  click() { if (!this.ok()) return; tone(1200, 900, 0.04, 'square', 0.04); },
  sparkle() { if (!this.ok()) return; for (let i = 0; i < 5; i++) tone(1800 + i * 300, 2400 + i * 300, 0.12, 'sine', 0.05, i * 0.06); },
};
