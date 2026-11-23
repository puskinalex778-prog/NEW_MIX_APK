// WebAudio engine: looping music with crossfades + pooled SFX. Unlocked by the first user gesture.
const MUSIC_GAIN = { menu: 0.9, farm: 0.9, city: 1.1, market: 1.25, depot: 0.95, forest: 1.2, coast: 0.88, snow: 0.9, sakura: 0.88, halloween: 1.3, festival: 1.0 };

export class Audio {
  constructor(settings, urlFor) {
    this.s = settings;
    this.urlFor = urlFor;
    this.ctx = null;
    this.buffers = {};
    this.loading = {};
    this.music = null;
    this.musicName = null;
    this.wantMusic = null;
    this.lastPlay = {};
  }
  unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createDynamicsCompressor();
      this.master.threshold.value = -14;
      this.master.ratio.value = 3;
      this.master.connect(this.ctx.destination);
      this.musicBus = this.ctx.createGain();
      this.sfxBus = this.ctx.createGain();
      this.musicBus.connect(this.master);
      this.sfxBus.connect(this.master);
      this.applyVolumes();
      for (const k of ['coin', 'jump', 'land', 'slide', 'swipe', 'hit', 'power', 'click', 'item', 'heart', 'shieldbreak', 'star', 'bleat', 'victory', 'fail', 'beep', 'go', 'horn', 'trainhorn', 'step', 'magnet'])
        this.load('sfx_' + k);
    }
    if (this.ctx.state !== 'running') this.ctx.resume().catch(() => {});
    if (this.wantMusic && this.musicName !== this.wantMusic) this.playMusic(this.wantMusic);
  }
  applyVolumes() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.musicBus.gain.setTargetAtTime(this.s.muted ? 0 : this.s.music * 0.75, t, 0.05);
    this.sfxBus.gain.setTargetAtTime(this.s.muted ? 0 : this.s.sfx, t, 0.05);
  }
  load(name) {
    if (this.buffers[name]) return Promise.resolve(this.buffers[name]);
    if (this.loading[name]) return this.loading[name];
    this.loading[name] = fetch(this.urlFor('audio/' + name + '.ogg'))
      .then(r => r.arrayBuffer())
      .then(a => new Promise((res, rej) => this.ctx.decodeAudioData(a, res, rej)))
      .then(b => (this.buffers[name] = b))
      .catch(e => { console.warn('audio', name, e); return null; });
    return this.loading[name];
  }
  play(name, { vol = 1, rate = 1, pan = 0, throttle = 0.03 } = {}) {
    if (!this.ctx || this.s.muted) return;
    const b = this.buffers['sfx_' + name];
    if (!b) { this.load('sfx_' + name); return; }
    const now = this.ctx.currentTime;
    if (now - (this.lastPlay[name] || -1) < throttle) return;
    this.lastPlay[name] = now;
    const src = this.ctx.createBufferSource();
    src.buffer = b;
    src.playbackRate.value = rate;
    const g = this.ctx.createGain();
    g.gain.value = vol;
    src.connect(g);
    if (this.ctx.createStereoPanner && pan) {
      const p = this.ctx.createStereoPanner();
      p.pan.value = Math.max(-1, Math.min(1, pan));
      g.connect(p); p.connect(this.sfxBus);
    } else g.connect(this.sfxBus);
    src.start();
  }
  async playMusic(name) {
    this.wantMusic = name;
    if (!this.ctx) return;
    if (this.musicName === name && this.music) return;
    this.musicName = name;
    const b = await this.load('music_' + name);
    if (!b || this.wantMusic !== name) return;
    const t = this.ctx.currentTime;
    if (this.music) {
      const old = this.music;
      old.g.gain.setTargetAtTime(0, t, 0.35);
      setTimeout(() => { try { old.src.stop(); } catch (e) {} }, 1800);
    }
    const src = this.ctx.createBufferSource();
    src.buffer = b;
    src.loop = true;
    const g = this.ctx.createGain();
    g.gain.value = 0;
    g.gain.setTargetAtTime(MUSIC_GAIN[name] || 1, t, 0.4);
    src.connect(g); g.connect(this.musicBus);
    src.start();
    this.music = { src, g };
  }
  duck(on) {
    if (!this.music || !this.ctx) return;
    this.music.g.gain.setTargetAtTime(on ? 0.25 * (MUSIC_GAIN[this.musicName] || 1) : (MUSIC_GAIN[this.musicName] || 1), this.ctx.currentTime, 0.2);
  }
  suspend() { if (this.ctx && this.ctx.state === 'running') this.ctx.suspend(); }
  resume() { if (this.ctx && this.ctx.state !== 'running') this.ctx.resume().catch(() => {}); }
}
