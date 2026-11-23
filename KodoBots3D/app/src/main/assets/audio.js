(function (root) {
  'use strict';

  const MOODS = [
    // 0: Lunar / Glacier — crystalline celesta & soft pad
    {
      bpm: 80,
      chords: [[50, 57, 62, 66], [47, 54, 59, 62], [43, 50, 55, 59], [45, 52, 57, 61]],
      melody: [[74, 78, 81, 78], [71, 74, 78, 74], [74, 71, 67, 71], [73, 76, 81, 76]],
      arpWave: 'sine',
    },
    // 1: Reef / Jungle — playful warm marimba & breeze
    {
      bpm: 88,
      chords: [[48, 55, 60, 64], [45, 52, 57, 60], [41, 48, 53, 57], [43, 50, 55, 59]],
      melody: [[72, 76, 79, 84], [76, 72, 69, 72], [77, 76, 72, 69], [74, 79, 76, 74]],
      arpWave: 'triangle',
    },
    // 2: Mars / Magma — adventurous glowing synth
    {
      bpm: 86,
      chords: [[45, 52, 57, 60], [41, 48, 53, 57], [48, 55, 60, 64], [43, 50, 55, 59]],
      melody: [[69, 72, 76, 79], [77, 76, 72, 69], [72, 76, 79, 81], [74, 71, 67, 71]],
      arpWave: 'triangle',
    },
    // 3: Neon / Star Core — dreamy starlight synthwave
    {
      bpm: 92,
      chords: [[52, 59, 64, 68], [49, 56, 61, 64], [45, 52, 57, 61], [47, 54, 59, 63]],
      melody: [[76, 80, 83, 88], [80, 76, 73, 76], [81, 80, 76, 73], [78, 83, 80, 78]],
      arpWave: 'sine',
    },
  ];

  class KodoAudio {
    constructor() {
      this.ctx = null;
      this.timer = null;
      this.next = 0;
      this.beat = 0;
      this.moodIndex = 0;
      this.musicGain = null;
      this.fxGain = null;
      this.settings = { music: true, sfx: true, volume: 0.34, haptics: true };
    }

    configure(s) {
      this.settings = { ...this.settings, ...s };
      this.updateGain();
    }

    setMood(idx) {
      this.moodIndex = ((idx || 0) % MOODS.length + MOODS.length) % MOODS.length;
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
          comp.threshold.value = -15;
          comp.ratio.value = 3.2;

          // Lush space echo delay
          const delay = this.ctx.createDelay(1.0);
          delay.delayTime.value = 0.34;
          const fb = this.ctx.createGain();
          fb.gain.value = 0.28;
          const wet = this.ctx.createGain();
          wet.gain.value = 0.26;
          const lp = this.ctx.createBiquadFilter();
          lp.type = 'lowpass';
          lp.frequency.value = 2600;

          this.musicGain.connect(comp);
          this.musicGain.connect(delay);
          delay.connect(lp);
          lp.connect(fb);
          fb.connect(delay);
          lp.connect(wet);
          wet.connect(comp);

          this.fxGain.connect(comp);
          comp.connect(this.ctx.destination);

          this.next = this.ctx.currentTime + 0.08;
          this.timer = setInterval(() => this.schedule(), 110);
        }
        if (this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => {});
        }
        this.updateGain();
      } catch (e) {}
    }

    suspend() {
      if (this.ctx && this.ctx.state === 'running') this.ctx.suspend().catch(() => {});
    }

    resume() {
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
    }

    updateGain() {
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      this.musicGain.gain.setTargetAtTime(this.settings.music ? this.settings.volume * 0.48 : 0, t, 0.28);
      this.fxGain.gain.setTargetAtTime(this.settings.sfx ? 0.28 : 0, t, 0.05);
    }

    tone(freq, time, dur, vol, type, dest, slideTo) {
      if (!this.ctx || !dest) return;
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = type || 'sine';
      o.frequency.setValueAtTime(Math.max(30, freq), time);
      if (slideTo) {
        o.frequency.exponentialRampToValueAtTime(Math.max(30, slideTo), time + dur);
      }
      g.gain.setValueAtTime(0.0001, time);
      g.gain.linearRampToValueAtTime(vol, time + Math.min(0.045, dur * 0.16));
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

      const mood = MOODS[this.moodIndex] || MOODS[0];
      const hz = (n) => 440 * Math.pow(2, (n - 69) / 12);
      const stepDur = 60 / mood.bpm / 2;

      while (this.next < t + 0.45) {
        const b = this.beat % 64;
        const bar = Math.floor(b / 16);
        const pos = b % 16;
        const ch = mood.chords[bar];
        const mel = mood.melody[bar];

        if (this.settings.music) {
          // Warm ambient pad on downbeat
          if (pos === 0) {
            ch.forEach((n, i) => this.tone(hz(n), this.next + i * 0.05, 4.0, 0.075, 'sine', this.musicGain));
            this.tone(hz(ch[0] - 12), this.next, 3.5, 0.11, 'triangle', this.musicGain);
          }
          // Gentle bass pulse on half-bar
          if (pos === 8) {
            this.tone(hz(ch[0] - 12), this.next, 1.8, 0.08, 'sine', this.musicGain);
          }
          // Shimmering arpeggio
          if (pos % 2 === 0) {
            const idx = [0, 2, 1, 3, 2, 3, 1, 2][Math.floor(pos / 2)];
            this.tone(hz(ch[idx] + 12), this.next, 1.15, 0.068, mood.arpWave, this.musicGain);
          }
          // Delicate star melody accents
          const mPos = [2, 6, 10, 14].indexOf(pos);
          if (mPos !== -1) {
            this.tone(hz(mel[mPos]), this.next, 1.4, 0.06, 'sine', this.musicGain);
          }
        }
        this.next += stepDur;
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
      if (kind === 'click') this.vibrate(9);
      else if (kind === 'error') this.vibrate([28, 35, 28]);
      else if (kind === 'win' || kind === 'badge') this.vibrate([22, 30, 22, 30, 55]);
      else if (kind === 'teleport') this.vibrate([16, 20, 24]);
      else if (kind === 'activate' || kind === 'collect' || kind === 'fix') this.vibrate(16);

      if (!this.settings.sfx) return;
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      switch (kind) {
        case 'click':
          this.tone(660, t, 0.075, 0.17, 'sine', this.fxGain, 880);
          break;
        case 'step':
          this.tone(210, t, 0.11, 0.18, 'triangle', this.fxGain, 310);
          this.tone(420, t + 0.02, 0.07, 0.08, 'sine', this.fxGain, 500);
          break;
        case 'turn':
          this.tone(390, t, 0.09, 0.15, 'sine', this.fxGain, 540);
          break;
        case 'jump':
          this.tone(290, t, 0.25, 0.23, 'sine', this.fxGain, 820);
          this.tone(440, t + 0.06, 0.2, 0.14, 'triangle', this.fxGain, 980);
          break;
        case 'collect':
          [587.3, 740.0, 880.0, 1174.6].forEach((f, i) => {
            this.tone(f, t + i * 0.055, 0.28, 0.2, 'sine', this.fxGain);
            this.tone(f * 2, t + i * 0.055, 0.16, 0.07, 'triangle', this.fxGain);
          });
          break;
        case 'fix':
          [392.0, 493.9, 587.3, 784.0].forEach((f, i) =>
            this.tone(f, t + i * 0.055, 0.26, 0.2, 'triangle', this.fxGain)
          );
          this.tone(1174.6, t + 0.22, 0.35, 0.12, 'sine', this.fxGain);
          break;
        case 'activate':
          this.tone(260, t, 0.36, 0.22, 'sawtooth', this.fxGain, 920);
          this.tone(520, t + 0.08, 0.32, 0.18, 'sine', this.fxGain, 1320);
          this.tone(880, t + 0.24, 0.28, 0.16, 'sine', this.fxGain, 440);
          break;
        case 'teleport':
          this.tone(340, t, 0.24, 0.2, 'sine', this.fxGain, 1280);
          this.tone(680, t + 0.05, 0.28, 0.16, 'triangle', this.fxGain, 1760);
          this.tone(1320, t + 0.18, 0.26, 0.15, 'sine', this.fxGain, 660);
          break;
        case 'scan':
          this.tone(880, t, 0.06, 0.14, 'sine', this.fxGain, 1180);
          this.tone(1180, t + 0.06, 0.06, 0.1, 'sine', this.fxGain, 980);
          break;
        case 'chirp':
          // Cute friendly robot voice greeting!
          this.tone(520, t, 0.09, 0.18, 'sine', this.fxGain, 760);
          this.tone(780, t + 0.09, 0.11, 0.18, 'sine', this.fxGain, 1040);
          this.tone(920, t + 0.19, 0.09, 0.14, 'triangle', this.fxGain, 840);
          break;
        case 'badge':
          [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
            this.tone(f, t + i * 0.075, 0.38, 0.22, 'sine', this.fxGain)
          );
          break;
        case 'error':
          this.tone(280, t, 0.14, 0.22, 'triangle', this.fxGain, 200);
          this.tone(210, t + 0.13, 0.24, 0.22, 'triangle', this.fxGain, 135);
          break;
        case 'win':
          [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98].forEach((f, i) => {
            this.tone(f, t + i * 0.08, 0.62, 0.22, 'sine', this.fxGain);
            this.tone(f * 0.5, t + i * 0.08, 0.45, 0.1, 'triangle', this.fxGain);
          });
          break;
        default:
          this.tone(520, t, 0.1, 0.15, 'sine', this.fxGain);
      }
    }
  }

  root.KodoAudio = new KodoAudio();
})(window);
