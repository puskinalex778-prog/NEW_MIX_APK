import * as THREE from 'three';

function rnd(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

function canvas(w, h = w) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return [c, c.getContext('2d')];
}

function speckle(ctx, w, h, cols, n, r, R, alpha = 1) {
  ctx.globalAlpha = alpha;
  for (let i = 0; i < n; i++) {
    ctx.fillStyle = cols[(R() * cols.length) | 0];
    const x = R() * w, y = R() * h, s = r[0] + R() * (r[1] - r[0]);
    ctx.beginPath();
    ctx.ellipse(x, y, s, s * (0.6 + R() * 0.6), R() * 3, 0, 7);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function blades(ctx, w, h, cols, n, R) {
  for (let i = 0; i < n; i++) {
    ctx.strokeStyle = cols[(R() * cols.length) | 0];
    ctx.lineWidth = 1 + R() * 1.5;
    const x = R() * w, y = R() * h, l = 4 + R() * 8;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (R() - 0.5) * 4, y - l); ctx.stroke();
  }
}

const GROUND = {
  grass: (ctx, w, R) => { ctx.fillStyle = '#7fae5a'; ctx.fillRect(0, 0, w, w); speckle(ctx, w, w, ['#8dbb63', '#73a052', '#97c46b', '#6b9a4c'], 900, [6, 22], R, 0.5); blades(ctx, w, w, ['#a5cf78', '#5f8e44', '#8fbf60'], 2600, R); speckle(ctx, w, w, ['#f5f0c8', '#f2b8c8', '#fff'], 40, [1.5, 3], R); },
  grass_light: (ctx, w, R) => { ctx.fillStyle = '#9cba7e'; ctx.fillRect(0, 0, w, w); speckle(ctx, w, w, ['#a9c68a', '#8fae70', '#b3cf95'], 900, [6, 20], R, 0.5); blades(ctx, w, w, ['#b8d49a', '#86a568'], 2200, R); speckle(ctx, w, w, ['#f6c3d4', '#fbe1ea'], 120, [2, 4], R); },
  grass_dark: (ctx, w, R) => { ctx.fillStyle = '#3e5442'; ctx.fillRect(0, 0, w, w); speckle(ctx, w, w, ['#465d49', '#36493a', '#4f6a50'], 900, [6, 20], R, 0.6); blades(ctx, w, w, ['#557256', '#2f4031'], 2200, R); },
  forest: (ctx, w, R) => { ctx.fillStyle = '#6d8a55'; ctx.fillRect(0, 0, w, w); speckle(ctx, w, w, ['#7a965f', '#5f7a4a', '#8a7a55', '#9a8460'], 1200, [5, 18], R, 0.55); blades(ctx, w, w, ['#87a46a', '#55703f'], 1800, R); speckle(ctx, w, w, ['#a5764a', '#c28f5a'], 120, [2, 5], R); },
  pavement: (ctx, w, R) => { ctx.fillStyle = '#c9c6bc'; ctx.fillRect(0, 0, w, w); ctx.strokeStyle = '#ada99e'; ctx.lineWidth = 3; for (let i = 0; i <= w; i += w / 4) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, w); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(w, i); ctx.stroke(); } speckle(ctx, w, w, ['#d6d3ca', '#bbb7ac'], 1500, [1, 4], R, 0.5); },
  sand: (ctx, w, R) => { ctx.fillStyle = '#e8d3a2'; ctx.fillRect(0, 0, w, w); speckle(ctx, w, w, ['#f0dfb4', '#dcc48f', '#efe2c0', '#d4b985'], 4000, [1, 4], R, 0.6); speckle(ctx, w, w, ['#ffffff', '#f6c7b8'], 30, [2, 4], R); },
  snow: (ctx, w, R) => { ctx.fillStyle = '#eef4f8'; ctx.fillRect(0, 0, w, w); speckle(ctx, w, w, ['#ffffff', '#dfe9f0', '#e7eff5'], 1400, [6, 26], R, 0.5); speckle(ctx, w, w, ['#cfe0ec'], 300, [1, 2], R); },
  tiles: (ctx, w, R) => { ctx.fillStyle = '#e8e6dc'; ctx.fillRect(0, 0, w, w); const n = 4, s = w / n; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { ctx.fillStyle = (i + j) % 2 ? '#e6e3d6' : '#dcdccd'; ctx.fillRect(i * s + 2, j * s + 2, s - 4, s - 4); } speckle(ctx, w, w, ['#fff'], 200, [2, 8], R, 0.15); },
};

const PATH = {
  gravel: (ctx, w, h, R) => { ctx.fillStyle = '#b8ab92'; ctx.fillRect(0, 0, w, h); speckle(ctx, w, h, ['#c9bda5', '#a3967e', '#d6ccb6', '#968a73', '#e0d8c6'], 7000, [1.5, 4], R, 0.85); },
  gravel_dark: (ctx, w, h, R) => { ctx.fillStyle = '#5e5a62'; ctx.fillRect(0, 0, w, h); speckle(ctx, w, h, ['#6d6870', '#514d55', '#7a7480', '#47434a'], 7000, [1.5, 4], R, 0.85); },
  dirt: (ctx, w, h, R) => { ctx.fillStyle = '#c4a67a'; ctx.fillRect(0, 0, w, h); speckle(ctx, w, h, ['#cfb38a', '#b5966b', '#d9c19c', '#a88a60'], 2500, [2, 9], R, 0.6); speckle(ctx, w, h, ['#8e7556'], 400, [1, 3], R); },
  dirt_dark: (ctx, w, h, R) => { ctx.fillStyle = '#6b5a5e'; ctx.fillRect(0, 0, w, h); speckle(ctx, w, h, ['#776569', '#5d4d51', '#857176'], 2500, [2, 9], R, 0.6); },
  asphalt: (ctx, w, h, R) => {
    ctx.fillStyle = '#6a7074'; ctx.fillRect(0, 0, w, h); speckle(ctx, w, h, ['#757b7f', '#5f6569', '#80868a'], 6000, [1, 3], R, 0.6);
    ctx.fillStyle = '#f2ead2';
    for (const fx of [1 / 3, 2 / 3]) for (let y = 0; y < h; y += h / 2) ctx.fillRect(fx * w - 4, y + h * 0.1, 8, h * 0.28);
    ctx.fillStyle = '#e9e2cb'; ctx.fillRect(6, 0, 7, h); ctx.fillRect(w - 13, 0, 7, h);
  },
  planks: (ctx, w, h, R) => {
    const n = 8, s = h / n;
    for (let i = 0; i < n; i++) { ctx.fillStyle = ['#b98d5e', '#a87d50', '#c49a6a', '#b08455'][i % 4]; ctx.fillRect(0, i * s, w, s); ctx.fillStyle = '#7a5a3d'; ctx.fillRect(0, i * s, w, 3); for (let k = 0; k < 6; k++) { ctx.globalAlpha = 0.15; ctx.fillRect(0, i * s + 6 + R() * (s - 10), w, 1); ctx.globalAlpha = 1; } ctx.fillStyle = '#6b4c33'; ctx.beginPath(); ctx.arc(R() * w, i * s + s / 2, 2.5, 0, 7); ctx.fill(); }
  },
  snowpath: (ctx, w, h, R) => { ctx.fillStyle = '#d8e4ec'; ctx.fillRect(0, 0, w, h); speckle(ctx, w, h, ['#e6eef3', '#c9d7e1', '#f3f7fa'], 2500, [2, 10], R, 0.6); ctx.globalAlpha = 0.2; ctx.fillStyle = '#b9c9d6'; for (const fx of [0.17, 0.5, 0.83]) for (let y = 0; y < h; y += 24) ctx.fillRect(fx * w - 10 + (y % 48 ? 6 : -6), y, 8, 12); ctx.globalAlpha = 1; },
  stones: (ctx, w, h, R) => { ctx.fillStyle = '#a49c90'; ctx.fillRect(0, 0, w, h); for (let i = 0; i < 260; i++) { ctx.fillStyle = ['#d8d0c3', '#cbc2b4', '#e2dbcf', '#bfb6a8'][i % 4]; const x = R() * w, y = R() * h, r = 12 + R() * 16; ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.8, R() * 3, 0, 7); ctx.fill(); } speckle(ctx, w, h, ['#f6c3d4'], 60, [2, 4], R); },
  tiles: (ctx, w, h, R) => { ctx.fillStyle = '#efeee6'; ctx.fillRect(0, 0, w, h); const s = w / 6; for (let i = 0; i < 6; i++) for (let j = 0; j < h / s; j++) { ctx.fillStyle = (i + j) % 2 ? '#f2f1ea' : '#e5e3d8'; ctx.fillRect(i * s + 1, j * s + 1, s - 2, s - 2); } ctx.fillStyle = '#7da38f'; ctx.fillRect(0, 0, 10, h); ctx.fillRect(w - 10, 0, 10, h); },
};

const cache = {};
export function groundTexture(kind, renderer) {
  const key = 'g_' + kind;
  if (cache[key]) return cache[key];
  const [c, ctx] = canvas(512);
  (GROUND[kind] || GROUND.grass)(ctx, 512, rnd(kind.length * 997));
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return (cache[key] = t);
}

export function pathTexture(kind, renderer) {
  const key = 'p_' + kind;
  if (cache[key]) return cache[key];
  const [c, ctx] = canvas(512, 512);
  (PATH[kind] || PATH.gravel)(ctx, 512, 512, rnd(kind.length * 331));
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return (cache[key] = t);
}

export function seaTexture() {
  if (cache.sea) return cache.sea;
  const [c, ctx] = canvas(256);
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, '#4fa9c8'); g.addColorStop(1, '#3f95b8');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 256);
  const R = rnd(5);
  ctx.strokeStyle = '#bfe9f2';
  for (let i = 0; i < 60; i++) { ctx.globalAlpha = 0.25 + R() * 0.35; ctx.lineWidth = 1.5; const x = R() * 256, y = R() * 256; ctx.beginPath(); ctx.arc(x, y, 8 + R() * 10, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke(); }
  ctx.globalAlpha = 1;
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace;
  return (cache.sea = t);
}

export function glowTexture(color = '#fff3b0') {
  const key = 'glow' + color;
  if (cache[key]) return cache[key];
  const [c, ctx] = canvas(128);
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, color); g.addColorStop(0.25, color + 'cc'); g.addColorStop(1, color + '00');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return (cache[key] = t);
}

export function softDot() {
  if (cache.dot) return cache.dot;
  const [c, ctx] = canvas(64);
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.5, 'rgba(255,255,255,.7)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  return (cache.dot = t);
}

export function petalTexture() {
  if (cache.petal) return cache.petal;
  const [c, ctx] = canvas(64);
  ctx.fillStyle = '#f7b6cc'; ctx.beginPath(); ctx.ellipse(32, 32, 26, 14, 0.5, 0, 7); ctx.fill();
  ctx.fillStyle = '#fbd3e1'; ctx.beginPath(); ctx.ellipse(28, 29, 14, 6, 0.5, 0, 7); ctx.fill();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return (cache.petal = t);
}

export function bannerTexture(text, sub = '', bg = '#2f8f8a', fg = '#fffaf0') {
  const [c, ctx] = canvas(1024, 160);
  ctx.fillStyle = bg; ctx.fillRect(0, 0, 1024, 160);
  for (let i = 0; i < 1024; i += 40) { ctx.fillStyle = (i / 40) % 2 ? '#ffffff22' : '#00000012'; ctx.fillRect(i, 0, 20, 14); ctx.fillRect(i + 20, 146, 20, 14); }
  ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = '800 72px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
  ctx.fillText(text, 512, sub ? 66 : 82);
  if (sub) { ctx.font = '600 30px system-ui, sans-serif'; ctx.globalAlpha = 0.85; ctx.fillText(sub, 512, 122); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}

export function skyMaterial(top, bottom) {
  return new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new THREE.Color(top) }, bottom: { value: new THREE.Color(bottom) } },
    vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: 'uniform vec3 top; uniform vec3 bottom; varying vec3 vP; void main(){ float h = clamp(vP.y*1.4+0.15,0.0,1.0); gl_FragColor = vec4(mix(bottom, top, pow(h,0.8)),1.0);\n#include <colorspace_fragment>\n}',
  });
}
