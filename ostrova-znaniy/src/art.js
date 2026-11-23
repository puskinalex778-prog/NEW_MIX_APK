/* ===== Графика: все персонажи и острова нарисованы векторно (SVG) и анимированы CSS ===== */
let _uid = 0;
const uid = p => p + (++_uid);

const Art = {
  hero() {
    const g = uid('h');
    return `<svg class="hero" viewBox="0 0 120 200" xmlns="http://www.w3.org/2000/svg">
<defs>
 <linearGradient id="${g}a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3fd6c8"/><stop offset="1" stop-color="#169c92"/></linearGradient>
 <radialGradient id="${g}s" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#ffe3cc"/><stop offset="1" stop-color="#f6bf98"/></radialGradient>
 <linearGradient id="${g}j" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a5bc4"/><stop offset="1" stop-color="#2f3c8f"/></linearGradient>
</defs>
<ellipse cx="60" cy="192" rx="36" ry="7" fill="rgba(20,30,90,.22)"/>
<g class="breathe">
 <rect x="43" y="140" width="15" height="44" rx="7" fill="url(#${g}j)"/>
 <rect x="62" y="140" width="15" height="44" rx="7" fill="url(#${g}j)"/>
 <path d="M38 186 q12 -12 24 0z" fill="#ff6b4a"/><path d="M58 186 q12 -12 24 0z" fill="#ff6b4a"/>
 <rect x="37" y="182" width="25" height="6" rx="3" fill="#fff"/><rect x="58" y="182" width="25" height="6" rx="3" fill="#fff"/>
 <rect x="24" y="90" width="20" height="38" rx="10" fill="#ffb347" transform="rotate(-8 34 90)"/>
 <rect x="29" y="86" width="62" height="64" rx="24" fill="url(#${g}a)"/>
 <path d="M44 92 q16 14 32 0" stroke="#fff" stroke-width="3" fill="none" opacity=".7" stroke-linecap="round"/>
 <rect x="44" y="120" width="32" height="15" rx="7" fill="rgba(0,0,0,.12)"/>
 <rect x="16" y="94" width="16" height="42" rx="8" fill="url(#${g}a)" transform="rotate(10 24 94)"/>
 <rect x="88" y="94" width="16" height="42" rx="8" fill="url(#${g}a)" transform="rotate(-10 96 94)"/>
 <circle cx="21" cy="138" r="8.5" fill="url(#${g}s)"/><circle cx="99" cy="138" r="8.5" fill="url(#${g}s)"/>
 <circle cx="26" cy="60" r="8" fill="#f2b48c"/><circle cx="94" cy="60" r="8" fill="#f2b48c"/>
 <circle cx="60" cy="56" r="35" fill="url(#${g}s)"/>
 <path d="M24 52 C20 20 48 12 64 15 C88 17 101 34 96 54 C90 40 80 34 70 32 C66 40 52 44 40 40 C34 44 28 47 24 52Z" fill="#7a4524"/>
 <path d="M58 16 q8 -12 18 -6 q-8 2 -10 10z" fill="#7a4524"/>
 <g class="blink"><ellipse cx="47" cy="60" rx="5.5" ry="7" fill="#23264a"/><ellipse cx="73" cy="60" rx="5.5" ry="7" fill="#23264a"/>
  <circle cx="49" cy="57" r="2" fill="#fff"/><circle cx="75" cy="57" r="2" fill="#fff"/></g>
 <ellipse cx="38" cy="73" rx="6.5" ry="4" fill="#ff8f86" opacity=".55"/><ellipse cx="82" cy="73" rx="6.5" ry="4" fill="#ff8f86" opacity=".55"/>
 <path d="M51 76 Q60 86 69 76" stroke="#23264a" stroke-width="3.2" fill="#ff7a7a" stroke-linecap="round" stroke-linejoin="round"/>
</g></svg>`;
  },

  lumik(dim) {
    const g = uid('l');
    return `<svg class="lumik ${dim ? 'dim' : ''}" viewBox="0 0 120 130" xmlns="http://www.w3.org/2000/svg">
<defs>
 <radialGradient id="${g}h"><stop offset="0" stop-color="#fff59a" stop-opacity=".95"/><stop offset="1" stop-color="#ffd23f" stop-opacity="0"/></radialGradient>
 <radialGradient id="${g}b" cx=".45" cy=".4" r=".7"><stop offset="0" stop-color="#fffbe0"/><stop offset=".45" stop-color="#ffe14d"/><stop offset="1" stop-color="#ff9f1c"/></radialGradient>
 <radialGradient id="${g}d" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#5a6098"/><stop offset="1" stop-color="#2b2f5c"/></radialGradient>
</defs>
<circle class="halo lightpulse" cx="60" cy="88" r="44" fill="url(#${g}h)"/>
<ellipse class="wing l" cx="36" cy="58" rx="22" ry="13" fill="rgba(210,235,255,.75)" stroke="#fff" stroke-width="2" transform="rotate(-25 36 58)"/>
<ellipse class="wing r" cx="84" cy="58" rx="22" ry="13" fill="rgba(210,235,255,.75)" stroke="#fff" stroke-width="2" transform="rotate(25 84 58)"/>
<ellipse class="lightpulse" cx="60" cy="90" rx="22" ry="25" fill="url(#${g}b)"/>
<path d="M42 82 q18 8 36 0" stroke="#e08a00" stroke-width="2.5" fill="none" opacity=".5"/>
<ellipse cx="60" cy="64" rx="19" ry="14" fill="#ff7a3d"/>
<circle cx="60" cy="40" r="20" fill="url(#${g}d)"/>
<path d="M53 24 Q46 8 38 10" stroke="#2b2f5c" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="38" cy="10" r="5" fill="#ffd23f"/>
<path d="M67 24 Q74 8 82 10" stroke="#2b2f5c" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="82" cy="10" r="5" fill="#ffd23f"/>
<g class="blink"><ellipse cx="52" cy="40" rx="6.5" ry="7.5" fill="#fff"/><ellipse cx="68" cy="40" rx="6.5" ry="7.5" fill="#fff"/>
 <circle cx="53" cy="41" r="3.6" fill="#1b1f3b"/><circle cx="69" cy="41" r="3.6" fill="#1b1f3b"/><circle cx="54.5" cy="39.5" r="1.3" fill="#fff"/><circle cx="70.5" cy="39.5" r="1.3" fill="#fff"/></g>
<path d="M54 50 Q60 55 66 50" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round"/>
</svg>`;
  },

  robot() {
    const g = uid('r');
    return `<svg class="robot hover" viewBox="0 0 100 150" xmlns="http://www.w3.org/2000/svg">
<defs>
 <linearGradient id="${g}h" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fb2ff"/><stop offset="1" stop-color="#5b6cff"/></linearGradient>
 <linearGradient id="${g}b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#dfe4ff"/></linearGradient>
</defs>
<ellipse cx="50" cy="145" rx="26" ry="5" fill="rgba(20,30,90,.2)"/>
<line x1="50" y1="20" x2="50" y2="6" stroke="#5b6cff" stroke-width="3"/><circle class="antenna" cx="50" cy="6" r="5" fill="#ffd23f"/>
<rect x="16" y="20" width="68" height="52" rx="18" fill="url(#${g}h)"/>
<rect x="24" y="28" width="52" height="36" rx="12" fill="#1b1f3b"/>
<g class="blink"><rect x="33" y="38" width="9" height="12" rx="4.5" fill="#5dffa8"/><rect x="58" y="38" width="9" height="12" rx="4.5" fill="#5dffa8"/></g>
<path d="M42 55 Q50 60 58 55" stroke="#5dffa8" stroke-width="2.5" fill="none" stroke-linecap="round"/>
<rect x="38" y="72" width="24" height="6" fill="#8b9be8"/>
<rect x="22" y="78" width="56" height="44" rx="16" fill="url(#${g}b)"/>
<rect x="34" y="88" width="32" height="18" rx="7" fill="#eef1ff" stroke="#c9d1ff"/>
<circle cx="42" cy="97" r="3.5" fill="#ff7a3d"/><circle cx="50" cy="97" r="3.5" fill="#ffd23f"/><circle cx="58" cy="97" r="3.5" fill="#2fc26b"/>
<rect x="8" y="82" width="12" height="30" rx="6" fill="#8b9be8"/><rect x="80" y="82" width="12" height="30" rx="6" fill="#8b9be8"/>
<circle cx="14" cy="114" r="6" fill="#5b6cff"/><circle cx="86" cy="114" r="6" fill="#5b6cff"/>
<rect x="32" y="122" width="12" height="16" rx="5" fill="#8b9be8"/><rect x="56" y="122" width="12" height="16" rx="5" fill="#8b9be8"/>
</svg>`;
  },

  cloudFace() {
    const g = uid('c');
    return `<svg class="cloudy" viewBox="0 0 260 170" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#dfe8ff"/></linearGradient></defs>
<g filter="drop-shadow(0 12px 14px rgba(60,80,180,.25))">
<path d="M50 140 C14 140 10 96 44 90 C40 52 92 40 108 66 C120 26 186 26 192 72 C232 66 250 106 226 130 C222 140 210 142 200 142Z" fill="url(#${g})"/></g>
<g class="blink"><ellipse cx="108" cy="100" rx="7" ry="9" fill="#2b2f5c"/><ellipse cx="152" cy="100" rx="7" ry="9" fill="#2b2f5c"/>
<circle cx="110" cy="97" r="2.4" fill="#fff"/><circle cx="154" cy="97" r="2.4" fill="#fff"/></g>
<ellipse cx="94" cy="116" rx="9" ry="5" fill="#ffb3c1"/><ellipse cx="166" cy="116" rx="9" ry="5" fill="#ffb3c1"/>
<ellipse cx="130" cy="120" rx="8" ry="6" fill="#ff9fb3"/>
<path d="M120 130 Q130 136 140 130" stroke="#2b2f5c" stroke-width="3" fill="none" stroke-linecap="round"/>
</svg>`;
  },

  island(i, c1, c2, lit) {
    const g = uid('i');
    const bulb = lit ? '#ffe066' : '#8a90ad';
    return `<svg viewBox="0 0 240 175" xmlns="http://www.w3.org/2000/svg">
<defs>
 <linearGradient id="${g}t" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>
 <linearGradient id="${g}r" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a8774c"/><stop offset=".5" stop-color="#7d5233"/><stop offset="1" stop-color="#4f3220"/></linearGradient>
 <radialGradient id="${g}g"><stop offset="0" stop-color="#fff3a0" stop-opacity=".95"/><stop offset="1" stop-color="#ffd23f" stop-opacity="0"/></radialGradient>
 <linearGradient id="${g}c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6fe39a"/><stop offset="1" stop-color="#22a35a"/></linearGradient>
</defs>
<path d="M18 92 Q120 80 222 92 L196 122 L170 140 L150 168 L128 152 L104 170 L86 146 L54 128 Z" fill="url(#${g}r)"/>
<path d="M40 112 L76 118 M150 120 L190 112 M100 136 L130 140" stroke="rgba(0,0,0,.18)" stroke-width="3" stroke-linecap="round"/>
<ellipse cx="120" cy="90" rx="104" ry="24" fill="${c2}"/>
<ellipse cx="120" cy="84" rx="104" ry="22" fill="url(#${g}t)"/>
<ellipse cx="96" cy="78" rx="60" ry="9" fill="rgba(255,255,255,.22)"/>
<rect x="60" y="38" width="7" height="38" rx="3" fill="#8b5a2b"/>
<circle cx="63" cy="32" r="18" fill="url(#${g}c)"/><circle cx="51" cy="42" r="13" fill="url(#${g}c)"/><circle cx="76" cy="42" r="13" fill="url(#${g}c)"/>
<circle cx="57" cy="27" r="5" fill="rgba(255,255,255,.35)"/>
<rect x="100" y="50" width="44" height="32" rx="4" fill="#fff4e0"/>
<path d="M94 54 L122 28 L150 54 Z" fill="${c2}" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>
<rect x="114" y="62" width="14" height="20" rx="4" fill="#b06b3a"/>
<rect x="131" y="58" width="9" height="9" rx="2" fill="${lit ? '#ffe066' : '#9fb6d9'}"/>
<line x1="180" y1="78" x2="180" y2="34" stroke="#5a5f7a" stroke-width="4" stroke-linecap="round"/>
${lit ? `<circle class="lamp-glow" cx="180" cy="28" r="20" fill="url(#${g}g)"/>` : ''}
<circle cx="180" cy="28" r="7.5" fill="${bulb}" stroke="#5a5f7a" stroke-width="2"/>
<circle cx="88" cy="88" r="3" fill="#fff"/><circle cx="160" cy="90" r="3" fill="#ffe066"/><circle cx="200" cy="86" r="2.6" fill="#ff8fab"/><circle cx="40" cy="86" r="2.6" fill="#ffe066"/>
</svg>`;
  },

  shape(n) { // фигура с n углами (0 = круг)
    const c = ['#5b6cff', '#ff7a3d', '#2fc26b', '#a24df0', '#ffb800'][n % 5];
    if (!n) return `<svg viewBox="0 0 60 60"><circle cx="30" cy="30" r="24" fill="${c}"/></svg>`;
    const pts = [];
    for (let k = 0; k < n; k++) {
      const a = -Math.PI / 2 + k * 2 * Math.PI / n + (n === 4 ? Math.PI / 4 : 0);
      pts.push((30 + 25 * Math.cos(a)).toFixed(1) + ',' + (32 + 25 * Math.sin(a)).toFixed(1));
    }
    return `<svg viewBox="0 0 60 60"><polygon points="${pts.join(' ')}" fill="${c}" stroke-linejoin="round" stroke="${c}" stroke-width="4"/></svg>`;
  }
};

/* ---------- живой фон ---------- */
function buildScene() {
  const sc = document.getElementById('scene');
  const cloud = (w, top, dur, delay, op) => `<svg class="cloud" style="top:${top}%;width:${w}px;animation-duration:${dur}s;animation-delay:${delay}s;opacity:${op}" viewBox="0 0 200 100"><path d="M40 90 C8 90 6 56 34 52 C34 24 76 14 92 38 C104 10 158 12 160 50 C192 46 200 82 178 90Z" fill="#fff"/></svg>`;
  const wave = (h, col, cls, amp) => {
    let d = `M0 ${h}`;
    for (let x = 0; x <= 2400; x += 200) d += ` Q${x + 50} ${h - amp} ${x + 100} ${h} T${x + 200} ${h}`;
    d += ' V200 H0Z';
    return `<svg class="${cls}" viewBox="0 0 2400 200" preserveAspectRatio="none"><path d="${d}" fill="${col}"/></svg>`;
  };
  let sp = '';
  for (let k = 0; k < 14; k++) sp += `<i class="sparkle" style="left:${Math.random() * 100}%;top:${Math.random() * 55}%;animation-delay:${-Math.random() * 3}s;animation-duration:${2 + Math.random() * 3}s"></i>`;
  sc.innerHTML = `<div class="sun"><div class="rays"></div><div class="core"></div></div>
  ${cloud(220, 8, 70, -10, .95)}${cloud(150, 22, 95, -60, .8)}${cloud(260, 40, 120, -30, .7)}${cloud(120, 14, 80, -45, .85)}${cloud(180, 55, 140, -100, .6)}
  ${sp}
  <div class="sea">${wave(60, '#7ec8ff', 'w1', 26)}${wave(90, '#46a8f5', 'w2', 22)}${wave(120, '#2b8de6', 'w3', 18)}</div>`;
}

/* ---------- конфетти ---------- */
const Confetti = (() => {
  let cv, ctx, parts = [], raf = 0;
  function init() {
    cv = document.createElement('canvas');
    cv.style.cssText = 'position:fixed;inset:0;z-index:60;pointer-events:none';
    document.body.appendChild(cv); ctx = cv.getContext('2d'); resize();
    addEventListener('resize', resize);
  }
  function resize() { cv.width = innerWidth * devicePixelRatio; cv.height = innerHeight * devicePixelRatio; }
  function burst(x, y, n = 60, spread = 1) {
    if (!cv) init();
    const cols = ['#ff5a6e', '#ffc83d', '#2fc26b', '#5b6cff', '#a24df0', '#3fd6c8', '#ff7a3d'];
    for (let k = 0; k < n; k++) {
      const a = Math.random() * Math.PI * 2, v = (4 + Math.random() * 9) * spread;
      parts.push({ x: x * devicePixelRatio, y: y * devicePixelRatio, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 7, r: Math.random() * 6,
        w: 6 + Math.random() * 8, h: 4 + Math.random() * 6, c: cols[k % cols.length], s: Math.random() < .3, life: 90 + Math.random() * 50 });
    }
    if (!raf) loop();
  }
  function loop() {
    ctx.clearRect(0, 0, cv.width, cv.height);
    parts = parts.filter(p => p.life-- > 0);
    for (const p of parts) {
      p.vy += .35; p.vx *= .985; p.x += p.vx; p.y += p.vy; p.r += .15;
      ctx.save(); ctx.globalAlpha = Math.min(1, p.life / 30); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c;
      if (p.s) { ctx.beginPath(); for (let i = 0; i < 5; i++) { const a = i * 1.2566 - 1.57; ctx.lineTo(Math.cos(a) * 9, Math.sin(a) * 9); ctx.lineTo(Math.cos(a + .628) * 4, Math.sin(a + .628) * 4); } ctx.fill(); }
      else ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    raf = parts.length ? requestAnimationFrame(loop) : 0;
    if (!raf) ctx.clearRect(0, 0, cv.width, cv.height);
  }
  return { burst };
})();

/* ---------- звуки (синтез, без файлов) ---------- */
const Sfx = (() => {
  let ac;
  function tone(f, t, d, type = 'sine', vol = .18) {
    if (!S.sound) return;
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = type; o.frequency.value = f; o.connect(g); g.connect(ac.destination);
      const now = ac.currentTime + t;
      g.gain.setValueAtTime(0, now); g.gain.linearRampToValueAtTime(vol, now + .015); g.gain.exponentialRampToValueAtTime(.001, now + d);
      o.start(now); o.stop(now + d + .05);
    } catch (e) {}
  }
  return {
    tap: () => tone(660, 0, .08, 'triangle', .12),
    pick: () => tone(520, 0, .09, 'triangle', .14),
    drop: () => { tone(380, 0, .1, 'triangle', .16); tone(570, .05, .1, 'triangle', .1); },
    good: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * .08, .25, 'triangle', .16)),
    bad: () => { tone(220, 0, .25, 'sawtooth', .07); tone(180, .12, .3, 'sawtooth', .06); },
    star: () => [784, 988, 1319].forEach((f, i) => tone(f, i * .1, .35, 'sine', .15))
  };
})();
