(function (root) {
  'use strict';

  class KodoAudio {
    constructor() {
      this.ctx = null;
      this.timer = null;
      this.next = 0;
      this.beat = 0;
      this.musicGain = null;
      this.fxGain = null;
      this.settings = { music: true, sfx: true, volume: 0.32, haptics: true };
    }

    configure(s) {
      this.settings = { ...this.settings, ...s };
      this.updateGain();
    }

    init() {
      try {
        if (!this.ctx) {
          const AC = window.AudioContext || window.webkitAudioContext;
          if (!AC) return;
          this.ctx = new AC();
          this.musicGain = this.ctx.createGain();
          this.fxGain = this.ctx.createGain();

          const comp = this.ctx.createDynamicsCompressor();
          comp.threshold.value = -16;
          comp.ratio.value = 3;

          const delay = this.ctx.createDelay(1.0);
          delay.delayTime.value = 0.36;
          const fb = this.ctx.createGain();
          fb.gain.value = 0.25;
          const wet = this.ctx.createGain();
          wet.gain.value = 0.22;

          this.musicGain.connect(comp);
          this.musicGain.connect(delay);
          delay.connect(fb);
          fb.connect(delay);
          delay.connect(wet);
          wet.connect(comp);

          this.fxGain.connect(comp);
          comp.connect(this.ctx.destination);

          this.next = this.ctx.currentTime + 0.08;
          this.timer = setInterval(() => this.schedule(), 120);
        }
        if (this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => {});
        }
        this.updateGain();
      } catch (e) {
        // Audio unavailable
      }
    }

    suspend() {
      if (this.ctx && this.ctx.state === 'running') {
        this.ctx.suspend().catch(() => {});
      }
    }

    resume() {
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    }

    updateGain() {
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      this.musicGain.gain.setTargetAtTime(this.settings.music ? this.settings.volume * 0.45 : 0, t, 0.25);
      this.fxGain.gain.setTargetAtTime(this.settings.sfx ? 0.26 : 0, t, 0.05);
    }

    tone(freq, time, dur, vol, type, dest, slideTo) {
      if (!this.ctx || !dest) return;
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = type || 'sine';
      o.frequency.setValueAtTime(freq, time);
      if (slideTo) {
        o.frequency.exponentialRampToValueAtTime(slideTo, time + dur);
      }
      g.gain.setValueAtTime(0.0001, time);
      g.gain.linearRampToValueAtTime(vol, time + Math.min(0.05, dur * 0.18));
      g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
      o.connect(g);
      g.connect(dest);
      o.start(time);
      o.stop(time + dur + 0.04);
    }

    schedule() {
      if (!this.ctx || this.ctx.state !== 'running') return;
      const t = this.ctx.currentTime;
      if (this.next < t - 0.5) this.next = t + 0.05;
      // Gentle bright cosmic pentatonic chord progression
      const chords = [
        [50, 57, 62, 66], // Dmaj7
        [47, 54, 59, 62], // Bm7
        [43, 50, 55, 59], // Gmaj7
        [45, 52, 57, 61], // A6/9
      ];
      const hz = (n) => 440 * Math.pow(2, (n - 69) / 12);

      while (this.next < t + 0.45) {
        const b = this.beat % 64;
        const bar = Math.floor(b / 16);
        const pos = b % 16;
        const ch = chords[bar];
        if (this.settings.music) {
          if (pos === 0) {
            ch.forEach((n, i) => this.tone(hz(n), this.next + i * 0.05, 4.2, 0.08, 'sine', this.musicGain));
            this.tone(hz(ch[0] - 12), this.next, 3.6, 0.1, 'triangle', this.musicGain);
          }
          if (pos % 2 === 0) {
            const idx = [0, 2, 1, 3, 2, 3, 1, 2][Math.floor(pos / 2)];
            this.tone(hz(ch[idx] + 12), this.next, 1.3, 0.075, 'sine', this.musicGain);
          }
          if (pos === 3 || pos === 11) {
            const sparkle = ch[pos === 3 ? 3 : 2] + 24;
            this.tone(hz(sparkle), this.next, 0.9, 0.045, 'sine', this.musicGain);
          }
        }
        this.next += 60 / 82 / 2;
        this.beat++;
      }
    }

    vibrate(pattern) {
      if (!this.settings.haptics) return;
      try {
        if (navigator.vibrate) navigator.vibrate(pattern);
      } catch (e) {}
    }

    fx(kind) {
      if (kind === 'click') this.vibrate(10);
      else if (kind === 'error') this.vibrate([30, 40, 30]);
      else if (kind === 'win') this.vibrate([25, 35, 25, 35, 60]);
      else if (kind === 'activate' || kind === 'collect' || kind === 'fix') this.vibrate(18);

      if (!this.settings.sfx) return;
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      switch (kind) {
        case 'click':
          this.tone(680, t, 0.08, 0.18, 'sine', this.fxGain, 840);
          break;
        case 'step':
          this.tone(240, t, 0.12, 0.2, 'triangle', this.fxGain, 320);
          break;
        case 'turn':
          this.tone(420, t, 0.1, 0.16, 'sine', this.fxGain, 520);
          break;
        case 'jump':
          this.tone(320, t, 0.24, 0.24, 'sine', this.fxGain, 760);
          this.tone(480, t + 0.08, 0.18, 0.14, 'triangle', this.fxGain, 880);
          break;
        case 'collect':
          [587.3, 740.0, 1174.6].forEach((f, i) =>
            this.tone(f, t + i * 0.065, 0.24, 0.22, 'sine', this.fxGain)
          );
          break;
        case 'fix':
          [440, 554.4, 659.3, 880].forEach((f, i) =>
            this.tone(f, t + i * 0.06, 0.25, 0.2, 'triangle', this.fxGain)
          );
          break;
        case 'activate':
          this.tone(300, t, 0.35, 0.24, 'sawtooth', this.fxGain, 900);
          this.tone(600, t + 0.1, 0.3, 0.2, 'sine', this.fxGain, 1200);
          break;
        case 'scan':
          this.tone(880, t, 0.07, 0.15, 'sine', this.fxGain, 1120);
          break;
        case 'error':
          this.tone(240, t, 0.16, 0.24, 'triangle', this.fxGain, 175);
          this.tone(180, t + 0.13, 0.24, 0.24, 'triangle', this.fxGain, 130);
          break;
        case 'win':
          [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) =>
            this.tone(f, t + i * 0.09, 0.55, 0.24, 'sine', this.fxGain)
          );
          break;
        default:
          this.tone(520, t, 0.12, 0.16, 'sine', this.fxGain);
      }
    }
  }

  root.KodoAudio = new KodoAudio();
})(window);
