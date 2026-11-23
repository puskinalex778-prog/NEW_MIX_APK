import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { HEROES, ITEMS, THEMES, ACTS, CHAPTERS, ENDLESS_THEMES, UPGRADES, UPGRADE_COST, BOOSTS, DIFFICULTY } from './data.js';
import { Audio } from './audio.js';
import * as TX from './textures.js';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { ScreenOrientation } from '@capacitor/screen-orientation';
const NATIVE = Capacitor.isNativePlatform();

const $ = id => document.getElementById(id);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const rand = (a = 0, b = 1) => a + Math.random() * (b - a);
const pick = arr => arr[(Math.random() * arr.length) | 0];
const wpick = list => { let tot = 0; for (const x of list) tot += x[1]; let r = Math.random() * tot; for (const [n, w] of list) if ((r -= w) <= 0) return n; return list[0][0]; };
const damp = (a, b, k, dt) => lerp(a, b, 1 - Math.exp(-k * dt));

/* ============================== SAVE ============================== */
const SAVE_KEY = 'oblachko_runner_v1';
function defaults() {
  return {
    v: 1, device: null, coins: 0, stars: CHAPTERS.map(() => 0), done: CHAPTERS.map(() => false), unlocked: 1, best: 0,
    hero: 'oblachko', owned: { oblachko: true }, up: { magnet: 0, shield: 0, x2: 0, boots: 0 },
    boosts: { startShield: 0, startMagnet: 0, extraLife: 0 },
    set: { music: 0.7, sfx: 0.85, muted: false, buttons: false, vibro: true, diff: 'normal', quality: 'auto', orient: null },
    totalCoins: 0, runs: 0, tutorial: false,
  };
}
let save = (() => {
  try {
    const s = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (s && s.v === 1) {
      const d = defaults();
      return {
        ...d, ...s, set: { ...d.set, ...s.set }, up: { ...d.up, ...s.up }, boosts: { ...d.boosts, ...s.boosts }, owned: { ...d.owned, ...s.owned },
        stars: d.stars.map((_, i) => (s.stars && s.stars[i]) || 0), done: d.done.map((_, i) => !!(s.done && s.done[i])),
      };
    }
  } catch (e) { }
  return defaults();
})();
function persist() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) { } }

const urlFor = p => (window.__EMBED && window.__EMBED[p]) || ('assets/' + p);
const audio = new Audio(save.set, urlFor);

/* ============================== RENDERER ============================== */
const canvas = $('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene();
scene.fog = new THREE.Fog('#d7ebe6', 40, 170);
const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 700);
scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.45;
const hemi = new THREE.HemisphereLight('#dff1ff', '#7c9a5c', 1.1);
scene.add(hemi);
const sun = new THREE.DirectionalLight('#fff1d6', 2.6);
sun.castShadow = true;
Object.assign(sun.shadow.camera, { left: -16, right: 16, top: 22, bottom: -14, near: 1, far: 90 });
sun.shadow.bias = -0.0006;
sun.shadow.normalBias = 0.03;
scene.add(sun, sun.target);
const world = new THREE.Group();
scene.add(world);
const env = new THREE.Group();
scene.add(env);

function quality() {
  const q = save.set.quality, dev = save.device || 'phone';
  if (q === 'low') return { pr: 1, shadow: 0, decor: 0.6, ahead: 140 };
  if (q === 'high') return { pr: 2, shadow: 2048, decor: 1.15, ahead: 190 };
  return dev === 'tablet' ? { pr: 1.75, shadow: 2048, decor: 1, ahead: 180 } : { pr: 1.4, shadow: 1024, decor: 0.85, ahead: 160 };
}
let Q = quality();
function applyQuality() {
  Q = quality();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, Q.pr));
  const on = Q.shadow > 0;
  if (renderer.shadowMap.enabled !== on) {
    renderer.shadowMap.enabled = on;
    scene.traverse(o => { if (o.material) [].concat(o.material).forEach(m => (m.needsUpdate = true)); });
  }
  sun.castShadow = on;
  if (on && sun.shadow.mapSize.x !== Q.shadow) {
    sun.shadow.mapSize.set(Q.shadow, Q.shadow);
    if (sun.shadow.map) { sun.shadow.map.dispose(); sun.shadow.map = null; }
  }
  resize();
}
function resize() {
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  const portrait = h > w;
  camera.fov = portrait ? 66 : 54;
  camera.updateProjectionMatrix();
  document.body.classList.toggle('landscape', !portrait);
}
window.addEventListener('resize', resize);

/* ============================== ASSETS ============================== */
const PROTO = {}, HEROP = {}, BOX = {};
const NO_SHADOW = new Set(['tree_a', 'tree_b', 'tree_c', 'tree_autumn', 'pine_a', 'pine_b', 'pine_snow', 'bush_a', 'bush_b', 'flowers', 'sunflowers', 'fern', 'sakura_a', 'sakura_b', 'cloud_a', 'cloud_b', 'shelf', 'ceiling_light', 'barn', 'farmhouse', 'windmill', 'station', 'bld_a', 'bld_b', 'bld_c', 'bld_d', 'market_front', 'house_snow', 'spooky_house', 'lighthouse', 'cliff_a', 'cliff_b', 'gate', 'xmas_tree', 'dead_tree', 'garland_post', 'lamp', 'fence', 'umbrella', 'beach_hut', 'boat', 'pier_post']);
const MATS = {};
async function loadAssets(onProgress) {
  const loader = new GLTFLoader();
  const prog = { heroes: 0, props: 0 };
  const load = (file, key) => new Promise((res, rej) => loader.load(urlFor(file), res, e => { if (e.total) { prog[key] = e.loaded / e.total; onProgress((prog.heroes + prog.props) / 2); } }, rej));
  const [h, p] = await Promise.all([load('heroes.glb', 'heroes'), load('props.glb', 'props')]);
  for (const c of [...h.scene.children]) HEROP[c.name.replace('hero_', '')] = c;
  for (const c of [...p.scene.children]) {
    const n = c.name.replace(/^p_/, '');
    PROTO[n] = c;
    c.traverse(o => {
      if (o.isMesh) {
        o.castShadow = !NO_SHADOW.has(n);
        o.receiveShadow = true;
        if (o.material && o.material.name) MATS[o.material.name] = o.material;
      }
    });
    BOX[n] = new THREE.Box3().setFromObject(c);
  }
  for (const k in HEROP) HEROP[k].traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  if (MATS.cloud) { MATS.cloud.fog = false; }
  if (MATS.gold) { MATS.gold.color.set('#ffd24a'); MATS.gold.emissive.set('#b77a00'); MATS.gold.emissiveIntensity = 0.55; MATS.gold.metalness = 0.55; MATS.gold.roughness = 0.25; }
  if (MATS.gold_dark) { MATS.gold_dark.color.set('#f0b02a'); MATS.gold_dark.emissive = new THREE.Color('#8a5200'); MATS.gold_dark.emissiveIntensity = 0.4; }
}

/* ============================== POOLS ============================== */
const pools = {};
function spawn(name, parent = world) {
  const pool = pools[name] || (pools[name] = []);
  let o = pool.pop();
  if (!o) { o = PROTO[name].clone(true); o.userData.pname = name; }
  o.visible = true;
  o.position.set(0, 0, 0); o.rotation.set(0, 0, 0); o.scale.set(1, 1, 1);
  parent.add(o);
  return o;
}
function free(o) { if (!o) return; o.parent && o.parent.remove(o); (pools[o.userData.pname] || (pools[o.userData.pname] = [])).push(o); }

/* ============================== HEROES ============================== */
function makeHero(id) {
  const model = HEROP[id].clone(true);
  // root -> inner (bob / lean, pivot at the feet) -> pivot (roll, pivot at the belly) -> model
  const PIV = 0.72;
  model.position.set(0, -PIV, 0);
  const root = new THREE.Group(), inner = new THREE.Group(), pivot = new THREE.Group();
  pivot.position.y = PIV;
  pivot.add(model); inner.add(pivot); root.add(inner);
  const find = re => { let r = null; model.traverse(o => { if (!r && re.test(o.name)) r = o; }); return r; };
  const parts = {
    head: find(/^head/), body: find(/_body|^body/), tail: find(/^tail/), scarf: find(/^scarf_tail/),
    legL: find(/^leg_l/), legR: find(/^leg_r/), armL: find(/^arm_l/), armR: find(/^arm_r/),
  };
  const base = {};
  for (const k in parts) if (parts[k]) base[k] = { r: parts[k].rotation.clone(), p: parts[k].position.clone() };
  // shield bubble
  const bubble = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), new THREE.MeshStandardMaterial({ color: '#8fdcff', emissive: '#4fb6ff', emissiveIntensity: 0.5, transparent: true, opacity: 0.22, depthWrite: false, roughness: 0.1 }));
  bubble.scale.set(0.9, 1.0, 0.9); bubble.position.y = 0.85; bubble.visible = false;
  root.add(bubble);
  return { id, root, inner, pivot, model, parts, base, phase: 0, bubble, blink: 0, roll: 0 };
}
// Two-legged lamb animation: hind legs run, front legs swing like arms.
function poseHero(h, dt, mode, speed = 15) {
  const P = h.parts, B = h.base;
  const set = (k, x = 0, y = 0, z = 0) => { if (P[k]) P[k].rotation.set(B[k].r.x + x, B[k].r.y + y, B[k].r.z + z); };
  const k = 1 - Math.exp(-dt * 18);
  // smooth version of set for poses that change abruptly (jump/slide)
  const ease = (n, x = 0, y = 0, z = 0) => { const o = P[n]; if (!o) return; const b = B[n].r; o.rotation.x += (b.x + x - o.rotation.x) * k; o.rotation.y += (b.y + y - o.rotation.y) * k; o.rotation.z += (b.z + z - o.rotation.z) * k; };
  h.phase += dt * (mode === 'run' ? speed * 0.5 : mode === 'idle' ? 2.2 : 6);
  const s = Math.sin(h.phase), c = Math.cos(h.phase), s2 = Math.sin(h.phase * 2);
  let iy = 0, irx = 0, roll = false, sq = 1;
  if (mode === 'run') {
    const a = clamp(0.55 + speed * 0.025, 0.6, 1.05);
    ease('legL', s * a); ease('legR', -s * a);
    ease('armL', -s * a * 0.85, 0, 0.18); ease('armR', s * a * 0.85, 0, -0.18);
    iy = Math.abs(c) * 0.11; irx = -0.13 - Math.abs(c) * 0.03;
    set('head', 0.08 - s2 * 0.05, s * 0.06); set('tail', 0, s2 * 0.5);
    set('scarf', -0.7 + Math.sin(h.phase * 2.4) * 0.3, 0, Math.sin(h.phase * 1.3) * 0.15);
  } else if (mode === 'jump') {
    ease('legL', 1.05); ease('legR', -0.35);
    ease('armL', 2.5, 0, 0.45); ease('armR', 2.3, 0, -0.45);
    ease('head', -0.15); set('tail', 0.4); set('scarf', -1.2);
    irx = -0.05;
  } else if (mode === 'fall') {
    ease('legL', 0.45); ease('legR', 0.15);
    ease('armL', 0.4, 0, 1.15 + s * 0.25); ease('armR', 0.4, 0, -1.15 - s * 0.25);
    ease('head', 0.1); set('scarf', -0.4); irx = 0.04;
  } else if (mode === 'slide') {
    // curl into a woolly ball and roll under the obstacle
    roll = true; sq = 0.86; iy = -0.3;
    ease('legL', 1.7); ease('legR', 1.7); ease('armL', 1.9, 0, -0.2); ease('armR', 1.9, 0, 0.2);
    ease('head', 0.55); set('scarf', -0.3); set('tail', 0.6);
  } else if (mode === 'idle') {
    set('legL'); set('legR');
    set('armL', Math.sin(h.phase * 0.5) * 0.06, 0, 0.08); set('armR', -Math.sin(h.phase * 0.5) * 0.06, 0, -0.08);
    set('head', Math.sin(h.phase * 0.5) * 0.05, Math.sin(h.phase * 0.31) * 0.25, Math.sin(h.phase * 0.4) * 0.06);
    set('tail', 0, Math.sin(h.phase * 1.7) * 0.4); set('scarf', -0.1 + Math.sin(h.phase) * 0.05);
    iy = Math.sin(h.phase) * 0.012;
  } else if (mode === 'cheer') {
    const hop = Math.abs(Math.sin(h.phase * 0.9));
    iy = hop * 0.42;
    set('legL', hop * 0.5); set('legR', -hop * 0.3);
    set('armL', 2.6 + Math.sin(h.phase * 2) * 0.35, 0, 0.35); set('armR', 2.6 - Math.sin(h.phase * 2) * 0.35, 0, -0.35);
    set('head', -0.2 * hop); set('tail', 0, Math.sin(h.phase * 3) * 0.6); set('scarf', -0.4 - hop * 0.5);
  }
  h.inner.position.y = damp(h.inner.position.y, iy, 22, dt);
  h.inner.rotation.x = damp(h.inner.rotation.x, irx, 14, dt);
  if (roll) h.roll -= dt * Math.max(speed, 9) * 1.25;
  else { h.roll = Math.atan2(Math.sin(h.roll), Math.cos(h.roll)); h.roll = damp(h.roll, 0, 16, dt); }
  h.pivot.rotation.x = h.roll;
  h.pivot.scale.setScalar(damp(h.pivot.scale.x, sq, 20, dt));
  if (h.blink > 0) { h.blink -= dt; h.model.visible = Math.floor(h.blink * 12) % 2 === 0; } else h.model.visible = true;
}

/* ============================== COINS (instanced) ============================== */
const COIN_CAP = 420;
const coins = { meshes: [], list: [], free: [] };
const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _v = new THREE.Vector3(), _s = new THREE.Vector3();
function initCoins() {
  PROTO.coin.updateMatrixWorld(true);
  PROTO.coin.traverse(o => {
    if (o.isMesh) {
      const g = o.geometry.clone();
      g.applyMatrix4(o.matrixWorld);
      const im = new THREE.InstancedMesh(g, o.material, COIN_CAP);
      im.castShadow = true; im.frustumCulled = false; im.count = COIN_CAP;
      for (let i = 0; i < COIN_CAP; i++) { _m.makeScale(0, 0, 0); im.setMatrixAt(i, _m); }
      scene.add(im); coins.meshes.push(im);
    }
  });
  for (let i = 0; i < COIN_CAP; i++) { coins.list.push({ alive: false, i }); coins.free.push(i); }
}
function addCoin(x, y, z) {
  const i = coins.free.pop();
  if (i === undefined) return;
  const c = coins.list[i];
  Object.assign(c, { alive: true, x, y, z, pull: false, t: Math.random() * 6 });
}
function killCoin(c) { c.alive = false; coins.free.push(c.i); _m.makeScale(0, 0, 0); for (const im of coins.meshes) im.setMatrixAt(c.i, _m); }
function clearCoins() { for (const c of coins.list) if (c.alive) killCoin(c); for (const im of coins.meshes) im.instanceMatrix.needsUpdate = true; }
function updateCoins(dt, t) {
  const rot = t * 3.2;
  for (const c of coins.list) {
    if (!c.alive) continue;
    if (c.z > G.pz + 12) { killCoin(c); continue; }
    if (G.state === 'run') {
      const dz = c.z - G.pz, dx = c.x - G.px, dy = c.y - (G.py + 0.7);
      if (G.pw.magnet > 0 && Math.abs(dz) < 13 && Math.abs(dx) < 9) c.pull = true;
      if (c.pull) {
        const k = 1 - Math.exp(-dt * 14);
        c.x += (G.px - c.x) * k; c.y += (G.py + 0.8 - c.y) * k; c.z += (G.pz - 0.3 - c.z) * k;
      }
      if (Math.abs(dz) < 0.9 && Math.abs(dx) < 0.85 && Math.abs(dy) < 1.05) { collectCoin(c); continue; }
    }
    _e.set(0, rot + c.x * 0.3, 0); _q.setFromEuler(_e);
    _v.set(c.x, c.y + Math.sin(t * 3 + c.z * 0.4) * 0.06, c.z); _s.set(1, 1, 1);
    _m.compose(_v, _q, _s);
    for (const im of coins.meshes) im.setMatrixAt(c.i, _m);
  }
  for (const im of coins.meshes) im.instanceMatrix.needsUpdate = true;
}
function collectCoin(c) {
  const v = G.pw.x2 > 0 ? 2 : 1;
  G.coins += v;
  sparkle(c.x, c.y, c.z, '#ffd75e', 5);
  audio.play('coin', { vol: 0.55, rate: 1 + (G.coinStreak % 6) * 0.03, pan: (c.x - G.px) * 0.1 });
  G.coinStreak++;
  killCoin(c);
  hudCoins();
}

/* ============================== PARTICLES ============================== */
const PCAP = 500;
const parts = { pos: new Float32Array(PCAP * 3), col: new Float32Array(PCAP * 3), vel: [], life: new Float32Array(PCAP), n: 0, idx: 0 };
const pGeo = new THREE.BufferGeometry();
pGeo.setAttribute('position', new THREE.BufferAttribute(parts.pos, 3));
pGeo.setAttribute('color', new THREE.BufferAttribute(parts.col, 3));
const pMat = new THREE.PointsMaterial({ size: 0.28, vertexColors: true, transparent: true, depthWrite: false, map: TX.softDot(), blending: THREE.AdditiveBlending });
const pPoints = new THREE.Points(pGeo, pMat);
pPoints.frustumCulled = false;
scene.add(pPoints);
for (let i = 0; i < PCAP; i++) { parts.vel.push(new THREE.Vector3()); parts.pos[i * 3 + 1] = -999; }
const _c = new THREE.Color();
function emit(x, y, z, color, n, speed = 3, up = 2, life = 0.7, grav = 6) {
  _c.set(color);
  for (let k = 0; k < n; k++) {
    const i = parts.idx; parts.idx = (parts.idx + 1) % PCAP;
    parts.pos[i * 3] = x; parts.pos[i * 3 + 1] = y; parts.pos[i * 3 + 2] = z;
    parts.col[i * 3] = _c.r; parts.col[i * 3 + 1] = _c.g; parts.col[i * 3 + 2] = _c.b;
    parts.vel[i].set(rand(-1, 1) * speed, rand(0.3, 1) * up, rand(-1, 1) * speed);
    parts.vel[i].g = grav;
    parts.life[i] = life * rand(0.6, 1.2);
  }
}
const sparkle = (x, y, z, col, n = 6) => emit(x, y, z, col, n, 1.6, 2.5, 0.45, 2);
function updateParticles(dt) {
  for (let i = 0; i < PCAP; i++) {
    if (parts.life[i] <= 0) continue;
    parts.life[i] -= dt;
    const v = parts.vel[i];
    v.y -= (v.g || 6) * dt;
    parts.pos[i * 3] += v.x * dt; parts.pos[i * 3 + 1] += v.y * dt; parts.pos[i * 3 + 2] += v.z * dt;
    if (parts.life[i] <= 0) parts.pos[i * 3 + 1] = -999;
    else if (parts.life[i] < 0.25) { const f = 1 - dt * 5; parts.col[i * 3] *= f; parts.col[i * 3 + 1] *= f; parts.col[i * 3 + 2] *= f; }
  }
  pGeo.attributes.position.needsUpdate = true;
  pGeo.attributes.color.needsUpdate = true;
}

/* ============================== ENVIRONMENT ============================== */
const LANE = 2.4;
const ENV = { theme: null };
const sky = new THREE.Mesh(new THREE.SphereGeometry(420, 24, 12), TX.skyMaterial('#9fd3e6', '#e9f4e8'));
sky.renderOrder = -1;
scene.add(sky);
let groundMesh, pathMesh, railsGroup, seaMesh, wallsGroup, starPoints, weather, sunDisc;
const cloudObjs = [];
function buildEnv(key) {
  const th = THEMES[key];
  ENV.theme = key; ENV.th = th;
  while (env.children.length) env.remove(env.children[0]);
  sky.material.uniforms.top.value.set(th.sky[0]);
  sky.material.uniforms.bottom.value.set(th.sky[1]);
  scene.fog.color.set(th.fog); scene.fog.near = th.fogNear; scene.fog.far = th.fogFar;
  hemi.color.set(th.hemi[0]); hemi.groundColor.set(th.hemi[1]); hemi.intensity = th.hemiI * 0.85; scene.environmentIntensity = th.night ? 0.25 : 0.45;
  sun.color.set(th.sun); sun.intensity = th.sunI;
  renderer.toneMappingExposure = th.night ? 1.25 : 1.08;
  // ground
  const gt = TX.groundTexture(th.ground, renderer);
  gt.repeat.set(260 / 9, 420 / 9);
  groundMesh = new THREE.Mesh(new THREE.PlaneGeometry(260, 420), new THREE.MeshStandardMaterial({ map: gt, roughness: 0.95 }));
  groundMesh.rotation.x = -Math.PI / 2; groundMesh.position.y = -0.03; groundMesh.receiveShadow = true;
  groundMesh.userData.snap = 9;
  env.add(groundMesh);
  const pt = TX.pathTexture(th.path, renderer);
  const pw = th.rails ? 8.4 : 8.0;
  pt.repeat.set(1, 420 / pw);
  pathMesh = new THREE.Mesh(new THREE.PlaneGeometry(pw, 420), new THREE.MeshStandardMaterial({ map: pt, roughness: th.path === 'tiles' ? 0.45 : 0.92 }));
  pathMesh.rotation.x = -Math.PI / 2; pathMesh.position.y = 0.0; pathMesh.receiveShadow = true;
  pathMesh.userData.snap = pw;
  env.add(pathMesh);
  // curbs
  const curbMat = new THREE.MeshStandardMaterial({ color: th.night ? '#5d5866' : (th.path === 'planks' ? '#8a6444' : '#d9d2bd'), roughness: 0.8 });
  for (const s of [-1, 1]) {
    const curb = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.14, 420), curbMat);
    curb.position.set(s * (pw / 2 + 0.12), 0.05, 0); curb.receiveShadow = true; curb.userData.snap = pw;
    env.add(curb);
  }
  // rails
  railsGroup = null;
  if (th.rails) {
    railsGroup = new THREE.Group(); railsGroup.userData.snap = 1.2;
    const sleeperGeo = new THREE.BoxGeometry(1.9, 0.1, 0.32);
    const sl = new THREE.InstancedMesh(sleeperGeo, new THREE.MeshStandardMaterial({ color: th.night ? '#4a3f3a' : '#7a5c44', roughness: 0.9 }), 3 * 300);
    let k = 0;
    for (let l = -1; l <= 1; l++) for (let i = 0; i < 300; i++) { _m.makeTranslation(l * LANE, 0.04, 180 - i * 1.2); sl.setMatrixAt(k++, _m); }
    sl.receiveShadow = true; railsGroup.add(sl);
    const railMat = new THREE.MeshStandardMaterial({ color: '#b9c0c4', metalness: 0.8, roughness: 0.35 });
    for (let l = -1; l <= 1; l++) for (const o of [-0.62, 0.62]) {
      const r = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.14, 420), railMat);
      r.position.set(l * LANE + o, 0.14, 0); r.receiveShadow = true; railsGroup.add(r);
    }
    env.add(railsGroup);
  }
  // sea
  seaMesh = null;
  if (th.sea) {
    const st = TX.seaTexture(); st.repeat.set(30, 60);
    seaMesh = new THREE.Mesh(new THREE.PlaneGeometry(200, 420), new THREE.MeshStandardMaterial({ map: st, roughness: 0.25, metalness: 0.1, color: '#d8f2f6' }));
    seaMesh.rotation.x = -Math.PI / 2; seaMesh.position.set(-106, 0.02, 0); seaMesh.userData.snap = 7;
    env.add(seaMesh);
  }
  // market interior
  if (th.indoor) {
    const wm = new THREE.MeshStandardMaterial({ color: '#e7ecdc', roughness: 0.9 });
    for (const s of [-1, 1]) {
      const w = new THREE.Mesh(new THREE.BoxGeometry(0.4, 9, 420), wm);
      w.position.set(s * 8.2, 4.4, 0); w.userData.snap = 10; env.add(w);
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.6, 420), new THREE.MeshStandardMaterial({ color: '#7da38f' }));
      stripe.position.set(s * 8.2, 5.5, 0); stripe.userData.snap = 10; env.add(stripe);
    }
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(17, 420), new THREE.MeshBasicMaterial({ color: '#dfe6d6' }));
    ceil.rotation.x = Math.PI / 2; ceil.position.y = 8.6; ceil.userData.snap = 10; env.add(ceil);
  }
  // stars
  if (th.stars) {
    const n = 500, a = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { const u = Math.random(), t = Math.random() * Math.PI * 2, y = 0.15 + u * 0.85, r = Math.sqrt(1 - y * y); a[i * 3] = Math.cos(t) * r * 380; a[i * 3 + 1] = y * 380; a[i * 3 + 2] = Math.sin(t) * r * 380; }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(a, 3));
    starPoints = new THREE.Points(g, new THREE.PointsMaterial({ color: '#fff8e0', size: 2.2, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.85 }));
    starPoints.userData.cam = true; env.add(starPoints);
    const moon = new THREE.Mesh(new THREE.CircleGeometry(14, 32), new THREE.MeshBasicMaterial({ color: '#fff4d2', fog: false }));
    moon.position.set(-90, 150, -300); moon.lookAt(0, 0, 0); moon.userData.cam = true; env.add(moon);
  }
  // weather particles
  weather = null;
  const wkind = th.snowfall ? 'snow' : th.petals ? 'petals' : th.fireflies ? 'fireflies' : null;
  if (wkind) {
    const n = wkind === 'fireflies' ? 90 : 420, a = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { a[i * 3] = rand(-30, 30); a[i * 3 + 1] = rand(0, 18); a[i * 3 + 2] = rand(-70, 10); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(a, 3));
    const mat = new THREE.PointsMaterial({
      size: wkind === 'snow' ? 0.22 : wkind === 'petals' ? 0.32 : 0.3, transparent: true, depthWrite: false,
      map: wkind === 'petals' ? TX.petalTexture() : TX.softDot(), color: wkind === 'fireflies' ? '#ffe88a' : '#ffffff',
      blending: wkind === 'fireflies' ? THREE.AdditiveBlending : THREE.NormalBlending,
    });
    weather = new THREE.Points(g, mat); weather.frustumCulled = false; weather.userData.kind = wkind;
    env.add(weather);
  }
  // sun / moon light direction
  sun.userData.off = th.night ? new THREE.Vector3(-12, 24, 6) : new THREE.Vector3(10, 26, 12);
  // night windows
  if (MATS.window) { MATS.window.emissive.set(th.night ? '#ffcb78' : '#000000'); MATS.window.emissiveIntensity = th.night ? 0.9 : 0; }
  if (MATS.lamp_glow) MATS.lamp_glow.emissiveIntensity = th.night ? 4 : 1.2;
  // clouds
  for (const c of cloudObjs) free(c);
  cloudObjs.length = 0;
  if (th.clouds) for (let i = 0; i < 9; i++) {
    const c = spawn(i % 2 ? 'cloud_a' : 'cloud_b', env);
    c.scale.setScalar(rand(1.8, 3.4));
    c.position.set(rand(-1, 1) > 0 ? rand(25, 110) : -rand(25, 110), rand(26, 48), G.pz - rand(40, 360));
    c.userData.cam = false; c.userData.cloud = true;
    cloudObjs.push(c);
  }
}
function updateEnv(dt, t) {
  sky.position.copy(camera.position);
  for (const o of env.children) {
    if (o.userData.snap) o.position.z = Math.round(G.pz / o.userData.snap) * o.userData.snap - 120;
    if (o.userData.cam) o.position.set(camera.position.x + (o.userData.ox || 0), o.userData.oy ?? o.position.y, camera.position.z);
  }
  if (starPoints) starPoints.position.copy(camera.position);
  for (const c of cloudObjs) { c.position.x += dt * 0.6; if (c.position.z > G.pz + 60) c.position.z -= 420; }
  if (seaMesh) seaMesh.material.map.offset.x = (t * 0.02) % 1;
  if (weather) {
    const a = weather.geometry.attributes.position.array, k = weather.userData.kind;
    for (let i = 0; i < a.length; i += 3) {
      if (k === 'snow') { a[i + 1] -= dt * 1.6; a[i] += Math.sin(t + i) * dt * 0.4; }
      else if (k === 'petals') { a[i + 1] -= dt * 0.9; a[i] += dt * 1.2; a[i + 2] += Math.sin(t * 0.7 + i) * dt * 0.5; }
      else { a[i + 1] += Math.sin(t * 1.5 + i) * dt * 0.4; a[i] += Math.cos(t + i * 0.7) * dt * 0.5; }
      if (a[i + 1] < 0) a[i + 1] += 18;
      if (a[i + 1] > 18) a[i + 1] -= 18;
      if (a[i] > 30) a[i] -= 60;
      if (a[i] < -30) a[i] += 60;
    }
    weather.geometry.attributes.position.needsUpdate = true;
    weather.position.set(G.px * 0.5, 0, G.pz);
    if (k === 'fireflies') weather.material.opacity = 0.6 + Math.sin(t * 3) * 0.3;
  }
  const off = sun.userData.off || new THREE.Vector3(10, 26, 12);
  sun.position.set(G.px + off.x, off.y, G.pz + off.z - 6);
  sun.target.position.set(G.px, 0, G.pz - 6);
}

/* ============================== GAME STATE ============================== */
const G = {
  state: 'boot', mode: 'story', ch: 0, chapter: null, len: 0, startZ: 0,
  pz: 0, px: 0, py: 0, vy: 0, lane: 0, grounded: true, slideT: 0, jumpBuf: 0, slideBuf: 0, coyote: 0,
  speed: 0, baseSpeed: 15, coins: 0, items: 0, hits: 0, lives: 3, maxLives: 3, inv: 0, revived: false,
  pw: { magnet: 0, shield: 0, x2: 0, boots: 0 }, pwMax: {}, coinStreak: 0, time: 0, themeIdx: -1, lineShown: 0,
  hero: null, npc: null, friends: [], finishObj: null, shake: 0, endlessOrder: [],
};
const ents = [];
const decor = [];
const gen = { rowZ: 0, decL: 0, decR: 0, landL: 0, landR: 0, bldL: 0, bldR: 0, itemNext: 0, itemPlan: [], powerZ: 0, shelfZ: 0, lightZ: 0, done: false, path: 0, pathZ: -6 };

function dist() { return G.startZ - G.pz; }
function themeAtDist(d) {
  if (G.mode === 'endless') { const i = Math.max(0, Math.floor(d / 800)); return G.endlessOrder[i % G.endlessOrder.length]; }
  const th = G.chapter.themes;
  return th.length > 1 && d > G.len / 2 ? th[1] : th[0];
}
const diff = () => DIFFICULTY[save.set.diff] || DIFFICULTY.normal;

/* ---------------- entity helpers ---------------- */
const KIND = {
  barrier: 'jump', hay: 'jump', crate: 'jump', cones: 'jump', log: 'jump', stump: 'jump', barrels: 'jump', bench: 'jump', pumpkins: 'jump', snowdrift: 'jump',
  arch: 'slide', arch_flags: 'slide', arch_web: 'slide', arch_ice: 'slide', arch_lantern: 'slide', arch_branch: 'slide',
  crate_stack: 'block', rock: 'block', snowman: 'block', gift_pile: 'block', cart: 'block', car: 'block', car2: 'block', car3: 'block', van: 'block', bus: 'block', tractor: 'block', ghost: 'block',
  wagon: 'platform', wagon2: 'platform', wagon3: 'platform', ramp: 'ramp',
};
const MOVE_SPEED = { car: 7, car2: 8, car3: 7.5, van: 6, bus: 5, tractor: 3.5, cart: 2.5, ghost: 2.5, wagon3: 9 };
function addOb(name, lane, z, opts = {}) {
  const o = spawn(name);
  const x = lane * LANE;
  o.position.set(x, 0, z);
  if (name === 'ghost') o.position.y = 0.2;
  const b = BOX[name];
  const e = {
    t: 'ob', name, obj: o, lane, x, z, kind: KIND[name] || 'block', hx: Math.min((b.max.x - b.min.x) / 2, 1.15), z0: b.min.z, z1: b.max.z,
    top: b.max.y, low: name === 'arch_branch' ? 1.25 : 1.1, move: opts.move || 0, hit: false, knock: null,
  };
  if (e.kind === 'slide') e.hx = 1.15;
  ents.push(e);
  return e;
}
function removeEnt(e) { free(e.obj); e.dead = true; }

function laneBusy(lane, z, r = 6) {
  for (const e of ents) if (!e.dead && e.t === 'ob' && e.lane === lane && z < e.z + e.z1 + r && z > e.z + e.z0 - r) return e;
  return null;
}

/* ---------------- reachability helpers ----------------
   Jump: vy 9.6, g 28 -> apex 1.65 m, airtime 0.69 s. Coins follow that parabola,
   stretched to the speed the player will have when reaching that point. */
const JUMP_VY = 9.6, GRAV = 28, JUMP_H = JUMP_VY * JUMP_VY / (2 * GRAV), AIR_T = 2 * JUMP_VY / GRAV;
function speedAt(d) {
  const D = diff();
  if (G.mode === 'endless') return Math.min(G.baseSpeed + d / 140, 27 * D.speed);
  return G.baseSpeed * (1 + clamp(d / G.len, 0, 1) * 0.12);
}
// is a coin at (x,y,z) collectable, i.e. not buried inside an obstacle?
function coinFree(x, y, z, ignoreMove) {
  for (const e of ents) {
    if (e.dead || e.t !== 'ob') continue;
    if (Math.abs(x - e.x) > e.hx + 0.35) continue;
    if (e.move && !ignoreMove && z > e.z + e.z0 - 0.7) return false;
    const z0 = e.z + e.z0 - 0.7, z1 = e.z + e.z1 + 0.7;
    if (z < z0 || z > z1) continue;
    if (e.move) return false;
    if (e.kind === 'block') return false;
    if (e.kind === 'jump' && y < e.top + 0.45) return false;
    if (e.kind === 'slide' && y > e.low - 0.4 && y < e.top + 0.3) return false;
    if (e.kind === 'platform' && y < e.top + 0.35) return false;
    if (e.kind === 'ramp') { const h = e.top * clamp((e.z + e.z1 - z) / (e.z1 - e.z0), 0, 1); if (y < h + 0.35) return false; }
  }
  return true;
}
function coinAt(x, y, z) {
  if (!coinFree(x, y, z)) return false;
  for (const c of coins.list) if (c.alive && Math.abs(c.z - z) < 1.1 && Math.abs(c.x - x) < 0.6 && Math.abs(c.y - y) < 0.6) return false;
  addCoin(x, y, z);
  return true;
}
function coinLine(lane, z, n, y = 0.9, step = 2.6) { for (let i = 0; i < n; i++) coinAt(lane * LANE, y, z - i * step); }
// straight run of coins from zFrom to zTo (zFrom > zTo) in a lane
function coinRun(lane, zFrom, zTo, y = 0.9, step = 2.6) { for (let z = zFrom; z > zTo; z -= step) coinAt(lane * LANE, y, z); }
// arc matching the real jump over an obstacle centred at z
function coinArc(lane, z, top = 1.0) {
  const L = speedAt(G.startZ - z) * AIR_T * 0.92;
  const n = clamp(Math.round(L / 1.7) + 1, 5, 11);
  for (let i = 0; i < n; i++) { const t = i / (n - 1); coinAt(lane * LANE, 0.75 + JUMP_H * 4 * t * (1 - t), z + L / 2 - t * L); }
}

/* ---------------- row generator ----------------
   Every row is built from lanes. After placing obstacles we pick a "path" lane that is
   guaranteed passable and reachable from the previous path, then lay a guiding trail of
   coins along it: straight, a diagonal lane change in the gap, then an arc over a jump,
   a low line under an arch, or a line over a train roof. Coins are never placed inside
   obstacles (coinFree), and moving traffic clears its own lane. */
function laneInfo(rowEnts, lane) {
  const list = rowEnts.filter(e => e.lane === lane && !e.dead);
  if (!list.length) return { pass: true, free: true, list };
  const hasRamp = list.some(e => e.kind === 'ramp');
  for (const e of list) {
    if (e.move || e.kind === 'block') return { pass: false, list };
    if (e.kind === 'platform' && !hasRamp) return { pass: false, list };
  }
  return { pass: true, free: false, list };
}
function trailOver(lane, info, zEnd) {
  // coins that follow the action needed to pass the lane's obstacles
  const list = info.list.slice().sort((a, b) => b.z - a.z);
  for (const e of list) {
    if (e.kind === 'jump') coinArc(lane, e.z, e.top);
    else if (e.kind === 'slide') coinRun(lane, e.z + 2.6, e.z - 2.8, 0.45, 1.6);
    else if (e.kind === 'ramp') { for (let z = e.z + e.z1 - 0.5; z > e.z + e.z0; z -= 1.6) { const h = e.top * clamp((e.z + e.z1 - z) / (e.z1 - e.z0), 0, 1); coinAt(lane * LANE, h + 0.9, z); } }
    else if (e.kind === 'platform') coinRun(lane, e.z + e.z1 - 0.8, e.z + e.z0 + 0.8, e.top + 0.9, 2.4);
  }
}
function genRow(z) {
  const d = G.startZ - z;
  const th = THEMES[themeAtDist(d)];
  const D = diff();
  const prog = G.mode === 'endless' ? clamp(d / 2500, 0, 1) : clamp(d / G.len, 0, 1);
  const lanes = [-1, 0, 1];
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0;[a[i], a[j]] = [a[j], a[i]]; } return a; };
  const blocks = th.block.filter(n => KIND[n] === 'block');
  const jumpN = () => pick(th.jump), slideN = () => pick(th.slide), blockN = () => pick(blocks.length ? blocks : th.jump);
  const actN = () => (Math.random() < 0.55 ? jumpN() : slideN());
  const dens = D.density;
  const pats = [
    ['single', 3 - prog * 1.6], ['double', 1.6 + prog * 2 * dens], ['wall', 0.6 + prog * 1.4 * dens], ['gate', 0.5 + prog * 1.6 * dens],
    ['zigzag', 0.4 + prog * 1.4 * dens], ['hurdles', 0.8 + prog * 0.8], ['tunnel', 0.5 + prog * 0.6], ['coins', 1.0 - prog * 0.4],
  ];
  if (th.platform) pats.push(['train', 2.0]);
  if (th.moving && th.moving.length) pats.push(['moving', 1.2 + prog * 1.2]);
  // first stretch: just coins so the player gets the feel; then a gentle warm-up
  let pat = d < 70 ? 'coins' : d < 160 ? wpick([['single', 3], ['coins', 1], ['hurdles', 1]]) : wpick(pats);
  const row = [];
  const ob = (n, l, zz, o) => { const e = addOb(n, l, zz, o); row.push(e); return e; };
  const [a, b, c] = shuffle(lanes.slice());
  if (pat === 'single') ob(Math.random() < 0.3 ? blockN() : actN(), a, z);
  else if (pat === 'double') { ob(blockN(), a, z); ob(Math.random() < 0.5 ? actN() : blockN(), b, z); }
  else if (pat === 'wall') { ob(jumpN(), a, z); ob(actN(), b, z); ob(actN(), c, z); }
  else if (pat === 'gate') { // the open lane is at most one lane away from the current path
    const open = clamp(gen.path + pick([-1, 0, 1]), -1, 1);
    for (const l of lanes) ob(l === open ? actN() : blockN(), l, z);
  }
  else if (pat === 'zigzag') { const g = Math.max(9, speedAt(d) * 0.65); ob(blockN(), a, z); ob(blockN(), b, z - g); if (Math.random() < 0.5) ob(actN(), c, z - g * 2); }
  else if (pat === 'hurdles') { const n = 2 + (Math.random() < prog ? 1 : 0); const gap = Math.max(12, speedAt(d) * 1.2); for (let i = 0; i < n; i++) ob(i % 2 && Math.random() < 0.4 ? slideN() : jumpN(), a, z - i * gap); if (Math.random() < 0.5) ob(blockN(), b, z - gap / 2); }
  else if (pat === 'tunnel') { for (let i = 0; i < 3; i++) ob(slideN(), a, z - i * 3.4); if (Math.random() < 0.6) ob(blockN(), b, z - 3.4); }
  else if (pat === 'train') {
    const wag = () => pick(th.block.filter(n => KIND[n] === 'platform'));
    ob('ramp', a, z + 2.5); ob(wag(), a, z - 7.5);
    if (Math.random() < 0.7) ob(wag(), b, z - 7.5 + rand(-3, 3));
    if (Math.random() < 0.35) ob(jumpN(), c, z - 4);
  } else if (pat === 'moving') {
    const n = pick(th.moving);
    const ms = (MOVE_SPEED[n] || 6) * (0.9 + D.speed * 0.1);
    const e = ob(n, a, z, { move: ms });
    if (n === 'wagon3') e.kind = 'block';
    // clear the lane in front so the vehicle doesn't drive through other obstacles
    const v = Math.max(G.speed, speedAt(d));
    const travel = ms * (G.pz - z) / (v + ms) + 14;
    for (const o of ents) if (o !== e && !o.dead && o.t === 'ob' && o.lane === a && o.z > z && o.z < z + travel) removeEnt(o);
    for (const cc of coins.list) if (cc.alive && Math.abs(cc.x - a * LANE) < 0.5 && cc.z > z && cc.z < z + travel) killCoin(cc);
    // pickups in the vehicle's way hop to a safe neighbouring lane
    for (const o of ents) if (!o.dead && (o.t === 'pw' || o.t === 'item') && o.lane === a && o.z > z) {
      const nl = [-1, 0, 1].find(l => l !== a && coinFree(l * LANE, 1.05, o.z));
      if (nl !== undefined) { o.lane = nl; o.x = nl * LANE; o.obj.position.x = o.x; }
    }
    if (Math.random() < 0.4 * prog) ob(actN(), b, z - 2);
  }
  // coins laid earlier must not end up inside the new obstacles
  if (row.length) { const zs = Math.max(...row.map(e => e.z + e.z1)) + 1.5, ze = Math.min(...row.map(e => e.z + e.z0)) - 1.5; for (const cc of coins.list) if (cc.alive && cc.z < zs && cc.z > ze && !coinFree(cc.x, cc.y, cc.z, true)) killCoin(cc); }
  // ---- pick the guaranteed path ----
  const info = {};
  for (const l of lanes) info[l] = laneInfo(row, l);
  let cand = lanes.filter(l => info[l].pass);
  if (!cand.length) { // safety net: should never happen, but never build an impassable row
    const l = pick(lanes); for (const e of row) if (e.lane === l) removeEnt(e); info[l] = { pass: true, free: true, list: [] }; cand = [l];
  }
  const prev = gen.path;
  const score = l => -Math.abs(l - prev) * 0.9 + (info[l].free ? 0.6 : 0) + (info[l].list.some(e => e.kind === 'ramp') ? 1.2 : 0) + Math.random() * 1.1;
  const path = cand.sort((x, y) => score(y) - score(x))[0];
  const rowStart = row.length ? Math.max(...row.map(e => e.z + e.z1)) : z;
  const rowEnd = row.length ? Math.min(...row.map(e => e.z + e.z0)) : z;
  // ---- coins ----
  if (pat === 'coins') {
    const l = prev, kind = Math.random();
    if (kind < 0.4) coinRun(l, gen.pathZ, z - 14);
    else if (kind < 0.75) { // slalom through the lanes
      for (let i = 0, zz = gen.pathZ; zz > z - 16; i++, zz -= 2.2) coinAt(clamp(l + Math.sin(i * 0.55) * (l === 0 ? 1 : -l), -1, 1) * LANE, 0.9, zz);
    } else { coinRun(l, gen.pathZ, z + 4); coinArc(l, z - 2); }
    gen.pathZ = z - 16; // gen.path unchanged
    return 0;
  }
  const trail = d < 160 || Math.random() < 0.75;
  const gapTop = gen.pathZ, gapBot = rowStart + 2.5;
  if (trail) {
    if (path === prev) coinRun(path, gapTop, gapBot);
    else {
      // straight -> diagonal lane change in the middle of the gap -> straight
      const mid = (gapTop + gapBot) / 2, half = Math.min(4.5, (gapTop - gapBot) / 2 - 1);
      if (half > 1.5) {
      coinRun(prev, gapTop, mid + half);
      const steps = 4;
      for (let i = 0; i <= steps; i++) { const t = i / steps, s = t * t * (3 - 2 * t); coinAt(lerp(prev, path, s) * LANE, 0.9, mid + half - t * half * 2); }
      coinRun(path, mid - half - 2.6, gapBot);
      }
    }
    trailOver(path, info[path]);
  }
  // risk/reward: coins over a harder lane
  const others = lanes.filter(l => l !== path && info[l].pass && !info[l].free);
  if (others.length && Math.random() < 0.45) trailOver(others[0], info[others[0]]);
  gen.path = path;
  gen.pathZ = rowEnd - 2.5;
  return Math.max(0, z - rowEnd - 1);
}

function placePickup(type, z) {
  if (type === 'item') G.itemsPlacedZ = gen.pathZ;
  // prefer the guaranteed path lane, at a spot with no obstacle around it
  const lanes = [gen.path, ...[-1, 0, 1].filter(l => l !== gen.path).sort(() => Math.random() - 0.5)];
  let lane = lanes.find(l => !laneBusy(l, z, 4) && coinFree(l * LANE, 1.05, z));
  if (lane === undefined) { z = gen.pathZ - 2; lane = gen.path; }
  const name = type === 'item' ? G.chapter.item : type;
  const o = spawn(name);
  o.position.set(lane * LANE, 1.05, z);
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: TX.glowTexture(type === 'item' ? '#fff0a0' : '#bff0ff'), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.85 }));
  glow.scale.setScalar(type === 'item' ? 2.4 : 1.8);
  o.add(glow);
  const s = type === 'item' ? (name === 'backpack' ? 1.4 : 1.25) : 1.1;
  o.scale.setScalar(s);
  ents.push({ t: type === 'item' ? 'item' : 'pw', name, obj: o, lane, x: lane * LANE, z, glow, base: 1.05 });
  for (const c of coins.list) if (c.alive && Math.abs(c.x - lane * LANE) < 0.5 && Math.abs(c.z - z) < 1.5) killCoin(c);
}

function addDecor(name, x, z, ry = 0, s = 1, y = 0) {
  if (!PROTO[name]) return null;
  const o = spawn(name);
  o.position.set(x, y, z); o.rotation.y = ry; o.scale.setScalar(s);
  decor.push(o);
  return o;
}
function genDecor(horizon) {
  for (const side of [-1, 1]) {
    const key = side < 0 ? 'decL' : 'decR';
    while (gen[key] > horizon) {
      const d = G.startZ - gen[key];
      const tk = themeAtDist(d), th = THEMES[tk];
      const z = gen[key];
      if (th.indoor) {
        gen[key] -= 8.4;
        const sh = addDecor('shelf', side * 5.9, z, side < 0 ? Math.PI : 0);
        if (Math.random() < 0.12) addDecor('checkout', side * 4.3, z - 4, side < 0 ? Math.PI : 0);
        continue;
      }
      gen[key] -= rand(4.5, 10) / Q.decor;
      if (th.sea && side < 0) { if (Math.random() < 0.6) addDecor('pier_post', -5.2, z, 0, rand(0.9, 1.1)); continue; }
      const n = wpick(th.scenery);
      const near = ['lamp', 'fence', 'pier_post', 'garland_post', 'bus_stop', 'stone_lantern', 'umbrella'].includes(n);
      let x = side * (near ? rand(5.6, 6.4) : rand(6.2, 15));
      const ry = n === 'fence' ? Math.PI / 2 : n === 'lamp' || n === 'garland_post' ? (side > 0 ? 0 : Math.PI) + Math.PI / 2 * -side * 0 : rand(0, 6.28);
      let rot = ry;
      if (n === 'lamp' || n === 'garland_post') rot = side > 0 ? -Math.PI / 2 : Math.PI / 2;
      if (n === 'bus_stop') rot = side > 0 ? -Math.PI / 2 : Math.PI / 2;
      addDecor(n, x, z, rot, n === 'lamp' || n === 'fence' ? 1 : rand(0.85, 1.2));
      if (Math.random() < 0.5 * Q.decor && !near && !th.buildings) addDecor(wpick(th.scenery.filter(s => !['lamp', 'fence', 'bus_stop', 'garland_post', 'pier_post'].includes(s[0]))), side * rand(16, 34), z - rand(0, 5), rand(0, 6.28), rand(0.9, 1.5));
    }
    const lk = side < 0 ? 'landL' : 'landR';
    while (gen[lk] > horizon) {
      const d = G.startZ - gen[lk];
      const th = THEMES[themeAtDist(d)];
      const z = gen[lk];
      if (th.buildings) {
        const n = wpick(th.landmarks);
        const w = n === 'bld_d' ? 7 : 6;
        addDecor(n, side * 12, z, side > 0 ? -Math.PI / 2 : Math.PI / 2, 1);
        gen[lk] -= w + rand(0.4, 2.5);
        continue;
      }
      gen[lk] -= rand(40, 75);
      if (!th.landmarks.length) continue;
      const n = wpick(th.landmarks);
      if (th.sea && side < 0) { addDecor(n === 'lighthouse' ? 'lighthouse' : 'boat', -rand(16, 34), z, rand(0, 6.28) * (n === 'boat' ? 1 : 0)); continue; }
      if (n === 'gate') { addDecor('gate', 0, z, 0, 1); continue; }
      addDecor(n, side * rand(15, 24), z, side > 0 ? -Math.PI / 2 + rand(-0.4, 0.4) : Math.PI / 2 + rand(-0.4, 0.4));
    }
  }
  // market ceiling lights
  if (THEMES[themeAtDist(G.startZ - gen.lightZ)].indoor) {
    while (gen.lightZ > horizon) { for (const x of [-3, 3]) addDecor('ceiling_light', x, gen.lightZ, 0, 1, 8.4); gen.lightZ -= 12; }
  } else gen.lightZ = horizon;
}

function generate() {
  const horizon = G.pz - Q.ahead;
  const D = diff();
  while (gen.rowZ > horizon && !gen.done) {
    const d = G.startZ - gen.rowZ;
    if (G.mode === 'story' && d > G.len - 45) { gen.done = true; break; }
    const extra = genRow(gen.rowZ);
    // items & powers
    while (gen.itemPlan.length && gen.itemPlan[0] >= gen.rowZ - 20) { G.itemsPlaced = (G.itemsPlaced || 0) + 1; gen.itemPlan.shift(); placePickup('item', gen.pathZ - 3); }
    if (gen.rowZ < gen.powerZ) {
      const opts = [['magnet', 3], ['shield', 2.5], ['x2', 2.5], ['boots', 2]];
      if (G.lives < G.maxLives) opts.push(['heart', 2.5]);
      placePickup(wpick(opts), gen.pathZ - (G.itemsPlacedZ === gen.pathZ ? 7 : 3));
      gen.powerZ -= rand(170, 280);
    }
    const sp = Math.max(17, speedAt(d) * 1.25) * rand(0.95, 1.3) / D.density;
    gen.rowZ -= sp + extra;
  }
  genDecor(horizon);
}

/* ============================== RUN LIFECYCLE ============================== */
function clearWorld() {
  for (const e of ents) if (!e.dead) free(e.obj);
  ents.length = 0;
  for (const o of decor) free(o);
  decor.length = 0;
  clearCoins();
  if (G.finishObj) { free(G.finishObj); G.finishObj = null; }
  for (const f of G.friends) world.remove(f.root);
  G.friends = [];
  if (G.npc) { world.remove(G.npc.root); G.npc = null; }
}
function setHero(id) {
  if (G.hero) world.remove(G.hero.root);
  G.hero = makeHero(id);
  world.add(G.hero.root);
}
function resetGen(theme0) {
  G.pz = 0; G.startZ = 0; G.px = 0; G.py = 0; G.vy = 0; G.lane = 0;
  Object.assign(gen, { rowZ: -40, decL: 25, decR: 25, landL: rand(-5, 20), landR: rand(-20, 10), lightZ: 20, powerZ: -rand(120, 200), done: false, itemPlan: [], path: 0, pathZ: -6 });
}

function startRun(mode, ch = 0) {
  audio.unlock();
  clearWorld();
  G.mode = mode;
  G.ch = ch;
  G.chapter = mode === 'story' ? CHAPTERS[ch] : null;
  G.len = mode === 'story' ? G.chapter.len : 1e9;
  const D = diff();
  if (mode === 'endless') {
    G.endlessOrder = ENDLESS_THEMES.slice().sort(() => Math.random() - 0.5);
    G.endlessOrder.unshift('farm');
  }
  resetGen();
  const t0 = themeAtDist(0);
  G.themeIdx = t0;
  buildEnv(t0);
  // hero
  let hid = save.hero;
  if (G.chapter && G.chapter.hero) hid = G.chapter.hero;
  if (!save.owned[hid] && !(G.chapter && G.chapter.hero)) hid = 'oblachko';
  setHero(hid);
  G.hero.root.position.set(0, 0, 0); G.hero.root.rotation.y = 0;
  if (G.chapter && G.chapter.chase) { G.npc = makeHero(G.chapter.chase); G.npc.root.position.set(0, 0, -16); G.npc.lane = 0; G.npc.x = 0; world.add(G.npc.root); }
  // items
  if (G.chapter) {
    const n = G.chapter.items;
    for (let i = 0; i < n; i++) {
      const dd = n === 1 ? G.len - 70 : 130 + (G.len - 230) * i / (n - 1);
      gen.itemPlan.push(-dd);
    }
  }
  generate();
  // finish arch
  if (mode === 'story') {
    const f = spawn('finish_arch');
    f.position.set(0, 0, -G.len);
    const tex = TX.bannerTexture(G.chapter.finale ? 'ПРАЗДНИК!' : 'ФИНИШ', G.chapter.title, '#2f8f8a');
    f.traverse(o => { if (o.isMesh && o.material.name === 'banner') { if (!o.userData.own) { o.material = o.material.clone(); o.userData.own = true; } if (o.material.map) o.material.map.dispose(); o.material.map = tex; o.material.color.set('#ffffff'); o.material.needsUpdate = true; } });
    G.finishObj = f;
    const others = HEROES.map(h => h.id).filter(id => id !== hid);
    others.forEach((id, i) => { const fr = makeHero(id); fr.root.position.set(i ? 4.0 : -4.0, 0, -G.len - 2); fr.root.rotation.y = Math.PI + (i ? 0.4 : -0.4); world.add(fr.root); G.friends.push(fr); });
  }
  // stats
  G.speed = 0;
  G.baseSpeed = mode === 'story' ? G.chapter.speed * D.speed : 15 * D.speed;
  G.coins = 0; G.items = 0; G.itemsPlaced = 0; G.hits = 0; G.coinStreak = 0; G.time = 0; G.lineShown = 0; G.revived = false;
  G.maxLives = D.lives; G.lives = D.lives;
  if (save.boosts.extraLife > 0) { save.boosts.extraLife--; G.lives++; G.maxLives++; toast('Запасное сердечко: +1 жизнь'); }
  G.inv = 0; G.slideT = 0; G.jumpBuf = 0; G.slideBuf = 0; G.grounded = true;
  for (const k in G.pw) G.pw[k] = 0;
  if (save.boosts.startShield > 0) { save.boosts.startShield--; givePower('shield', true); }
  if (save.boosts.startMagnet > 0) { save.boosts.startMagnet--; givePower('magnet', true); }
  persist();
  save.runs++;
  showScreen(null);
  $('hud').classList.remove('hidden');
  $('topbar').classList.add('hidden');
  $('touchBtns').classList.toggle('hidden', !save.set.buttons);
  $('hudProgress').classList.toggle('hidden', mode !== 'story');
  $('hudScore').classList.toggle('hidden', mode === 'story');
  $('hudItemsChip').classList.toggle('hidden', mode !== 'story');
  if (G.chapter) { $('hudItemIco').textContent = ITEMS[G.chapter.item].icon; $('hudTitle').textContent = (G.ch + 1) + '. ' + G.chapter.title; }
  $('hudChase').style.display = G.npc ? 'block' : 'none';
  $('hudBest').textContent = save.best;
  hudLives(); hudCoins(); hudItems(); hudPowers();
  audio.playMusic(THEMES[t0].music);
  G.state = 'count';
  G.countT = 2.4;
  camSnap = true;
}

function givePower(k, silent) {
  const u = UPGRADES.find(u => u.id === k);
  const dur = u.base + u.step * (save.up[k] || 0);
  G.pw[k] = dur; G.pwMax[k] = dur;
  if (k === 'shield') G.hero.bubble.visible = true;
  if (!silent) audio.play('power', { vol: 0.8 });
  hudPowers();
}

function hit(e) {
  if (G.inv > 0) return;
  if (G.pw.shield > 0) {
    G.pw.shield = 0; G.hero.bubble.visible = false; G.inv = 1.0;
    audio.play('shieldbreak', { vol: 0.9 });
    emit(G.px, G.py + 0.9, G.pz, '#8fdcff', 24, 4, 3, 0.6);
    if (e) knock(e);
    hudPowers();
    return;
  }
  G.lives--; G.hits++;
  if (G.hitLog) G.hitLog.push((e ? e.name + ':' + e.kind + (e.move ? ':mov' : '') + '@' + Math.round(G.startZ - G.pz) : 'none') + ' lane' + G.lane + ' [' + ents.filter(o => !o.dead && o.t === 'ob' && Math.abs(o.z - G.pz) < 22).map(o => o.lane + ':' + o.kind[0] + ':' + Math.round(o.z - G.pz)).join(',') + ']');
  G.inv = 1.6; G.hero.blink = 1.6; G.shake = 0.5;
  audio.play('hit', { vol: 1 });
  audio.play('bleat', { vol: 0.5, rate: rand(0.95, 1.08) });
  $('flash').style.opacity = 1; setTimeout(() => ($('flash').style.opacity = 0), 220);
  vibrate(60);
  G.speed *= 0.55;
  if (e) knock(e);
  emit(G.px, G.py + 0.8, G.pz - 0.5, '#ffffff', 14, 3, 3, 0.5);
  hudLives();
  if (G.lives <= 0) fail();
}
function knock(e) {
  if (e.kind === 'platform') { e.hit = true; return; }
  e.hit = true;
  e.knock = { vx: (e.x - G.px >= 0 ? 1 : -1) * rand(4, 7) + (e.x === G.px ? pick([-5, 5]) : 0), vy: rand(5, 7), vz: -rand(2, 5), vr: rand(-6, 6), t: 0 };
}
function vibrate(ms) {
  if (!save.set.vibro) return;
  try {
    if (NATIVE) Haptics.impact({ style: ImpactStyle.Medium }).catch(() => { }); else if (navigator.vibrate) navigator.vibrate(ms);
  } catch (e) { }
}

/* ---------------- input ---------------- */
function act(a) {
  if (G.state !== 'run') return;
  if (a === 'left' || a === 'right') {
    const nl = clamp(G.lane + (a === 'left' ? -1 : 1), -1, 1);
    if (nl !== G.lane) { G.lane = nl; audio.play('swipe', { vol: 0.35, pan: G.lane * 0.4 }); }
    else { G.shake = 0.12; }
  } else if (a === 'jump') { G.jumpBuf = 0.18; }
  else if (a === 'slide') { G.slideBuf = 0.22; if (!G.grounded) G.vy = Math.min(G.vy, -16); }
}
let ptr = null;
canvas.addEventListener('pointerdown', e => { audio.unlock(); ptr = { x: e.clientX, y: e.clientY, used: false, id: e.pointerId }; });
window.addEventListener('pointermove', e => {
  if (!ptr || ptr.used || e.pointerId !== ptr.id) return;
  const dx = e.clientX - ptr.x, dy = e.clientY - ptr.y, th = Math.max(22, Math.min(window.innerWidth, window.innerHeight) * 0.045);
  if (Math.abs(dx) > th || Math.abs(dy) > th) {
    ptr.used = true;
    if (Math.abs(dx) > Math.abs(dy)) act(dx > 0 ? 'right' : 'left'); else act(dy < 0 ? 'jump' : 'slide');
  }
});
window.addEventListener('pointerup', () => (ptr = null));
window.addEventListener('pointercancel', () => (ptr = null));
window.addEventListener('keydown', e => {
  const k = e.code;
  if (['ArrowLeft', 'KeyA'].includes(k)) act('left');
  else if (['ArrowRight', 'KeyD'].includes(k)) act('right');
  else if (['ArrowUp', 'KeyW', 'Space'].includes(k)) act('jump');
  else if (['ArrowDown', 'KeyS'].includes(k)) act('slide');
  else if (k === 'Escape' || k === 'KeyP') { if (G.state === 'run') pause(); else back(); }
  if (k === 'Space' || k.startsWith('Arrow')) e.preventDefault();
});
document.querySelectorAll('#touchBtns button').forEach(b => b.addEventListener('pointerdown', e => { e.stopPropagation(); act(b.dataset.act); }));

/* ---------------- simulation ---------------- */
function groundAt(x, z) {
  let g = 0;
  for (const e of ents) {
    if (e.dead || (e.kind !== 'platform' && e.kind !== 'ramp')) continue;
    if (Math.abs(x - e.x) > e.hx + 0.1) continue;
    const z0 = e.z + e.z0, z1 = e.z + e.z1;
    if (z < z0 - 0.2 || z > z1 + 0.2) continue;
    if (e.kind === 'platform') g = Math.max(g, e.top);
    else g = Math.max(g, e.top * clamp((z1 - z) / (z1 - z0), 0, 1));
  }
  return g;
}

function step(dt) {
  G.time += dt;
  const d = dist();
  // speed
  const target = G.mode === 'endless' ? Math.min(G.baseSpeed + d / 140, 27 * diff().speed) : G.baseSpeed * (1 + clamp(d / G.len, 0, 1) * 0.12);
  G.speed = damp(G.speed, target, G.speed < target * 0.8 ? 1.6 : 0.8, dt);
  G.pz -= G.speed * dt;
  // lane
  G.px = damp(G.px, G.lane * LANE, 13, dt);
  // vertical
  const gnd = groundAt(G.px, G.pz);
  if (G.jumpBuf > 0) G.jumpBuf -= dt;
  if (G.slideBuf > 0) G.slideBuf -= dt;
  if (G.grounded) G.coyote = 0.12; else G.coyote -= dt;
  if (G.jumpBuf > 0 && G.coyote > 0) {
    G.vy = G.pw.boots > 0 ? 12.6 : 9.6; G.grounded = false; G.coyote = 0; G.jumpBuf = 0; G.slideT = 0;
    audio.play('jump', { vol: 0.55, rate: G.pw.boots > 0 ? 0.9 : 1 });
  }
  if (G.grounded) {
    if (gnd < G.py - 0.08) { G.grounded = false; G.vy = 0; }
    else G.py = gnd;
  }
  if (!G.grounded) {
    G.vy -= 28 * dt;
    G.py += G.vy * dt;
    if (G.py <= gnd && G.vy <= 0) {
      G.py = gnd; G.vy = 0; G.grounded = true;
      audio.play('land', { vol: 0.35 });
      emit(G.px, G.py + 0.05, G.pz, ENV.th.night ? '#8d86a8' : '#e8dcc0', 6, 1.5, 0.8, 0.35, 3);
    }
  }
  if (G.slideBuf > 0 && G.grounded) { G.slideT = 0.62; G.slideBuf = 0; audio.play('slide', { vol: 0.5 }); }
  if (G.slideT > 0) G.slideT -= dt;
  // timers
  if (G.inv > 0) G.inv -= dt;
  for (const k in G.pw) if (G.pw[k] > 0) { G.pw[k] -= dt; if (G.pw[k] <= 0) { G.pw[k] = 0; if (k === 'shield') G.hero.bubble.visible = false; hudPowers(); } }
  // hero visuals
  const h = G.hero;
  h.root.position.set(G.px, G.py, G.pz);
  h.root.rotation.y = damp(h.root.rotation.y, -(G.lane * LANE - G.px) * 0.12, 10, dt);
  h.root.rotation.z = damp(h.root.rotation.z, (G.lane * LANE - G.px) * 0.05, 10, dt);
  const mode = !G.grounded ? (G.vy > 0 ? 'jump' : 'fall') : G.slideT > 0 ? 'slide' : 'run';
  poseHero(h, dt, mode, G.speed);
  if (G.pw.shield > 0 && G.pw.shield < 2) h.bubble.visible = Math.floor(G.pw.shield * 8) % 2 === 0;
  // footsteps
  if (G.grounded && G.slideT <= 0) { G.stepT = (G.stepT || 0) - dt; if (G.stepT <= 0) { G.stepT = 0.3; audio.play('step', { vol: 0.12, rate: rand(0.9, 1.1) }); } }
  // collisions
  const sliding = G.slideT > 0 && G.grounded;
  const pTop = G.py + (sliding ? 0.78 : 1.3), pBot = G.py;
  for (const e of ents) {
    if (e.dead) continue;
    if (e.t === 'ob') {
      if (e.move) { e.z += e.move * dt; e.obj.position.z = e.z; for (const c of coins.list) if (c.alive && Math.abs(c.x - e.x) < 1 && c.z > e.z + e.z0 - 0.5 && c.z < e.z + e.z1 + 0.5) killCoin(c); if (e.name === 'ghost') e.obj.position.y = 0.25 + Math.sin(G.time * 3 + e.x) * 0.15; }
      if (e.knock) {
        const k = e.knock; k.t += dt; k.vy -= 20 * dt;
        e.obj.position.x += k.vx * dt; e.obj.position.y = Math.max(-2, e.obj.position.y + k.vy * dt); e.obj.position.z += k.vz * dt;
        e.obj.rotation.z += k.vr * dt; e.obj.rotation.x += k.vr * 0.5 * dt;
        if (k.t > 1.4) { removeEnt(e); continue; }
      }
      if (e.z + e.z0 > G.pz + 25) { removeEnt(e); continue; }
      if (e.hit) continue;
      if (Math.abs(e.x - G.px) > e.hx + 0.32) continue;
      const z0 = e.z + e.z0, z1 = e.z + e.z1;
      if (G.pz - 0.45 > z1 || G.pz + 0.45 < z0) continue;
      if (e.kind === 'jump' || e.kind === 'block') { if (pBot < e.top - 0.08) hit(e); }
      else if (e.kind === 'slide') { if (pTop > e.low && pBot < e.top - 0.1) hit(e); }
      else if (e.kind === 'platform') {
        if (pBot < e.top - 0.45) { hit(e); if (G.lives > 0) { G.py = e.top; G.vy = 0; G.grounded = true; } }
      }
    } else {
      // pickups
      e.obj.rotation.y += dt * 2.4;
      e.obj.position.y = e.base + Math.sin(G.time * 3 + e.z) * 0.12;
      if (G.pw.magnet > 0 && e.t === 'item' && Math.abs(e.z - G.pz) < 10) { e.x = damp(e.x, G.px, 6, dt); e.obj.position.x = e.x; }
      if (e.z > G.pz + 15) { removeEnt(e); continue; }
      if (Math.abs(e.z - G.pz) < 1.0 && Math.abs(e.x - G.px) < 1.0 && Math.abs(e.obj.position.y - (G.py + 0.7)) < 1.4) {
        collectPickup(e);
      }
    }
  }
  // npc (chase)
  if (G.npc) {
    const n = G.npc, prog = clamp(d / G.len, 0, 1);
    const gap = lerp(22, 2.5, Math.pow(prog, 1.3));
    const nz = G.pz - gap;
    // choose a free lane ahead
    const busy = l => laneBusy(l, nz - 4, 5);
    if (busy(n.lane)) { const opts = [-1, 0, 1].filter(l => !busy(l)); if (opts.length) n.lane = opts.sort((a, b) => Math.abs(a - n.lane) - Math.abs(b - n.lane))[0]; }
    n.x = damp(n.x, n.lane * LANE, 8, dt);
    const hop = Math.abs(Math.sin(G.time * 5.5)) * 0.25;
    n.root.position.set(n.x, groundAt(n.x, nz) + hop, nz);
    poseHero(n, dt, 'run', G.speed);
    $('hudChase').style.left = clamp((d + gap) / G.len * 100, 0, 100) + '%';
    if (Math.random() < dt * 0.5) emit(n.x, 1.2, nz, '#ffd75e', 3, 1, 1.5, 0.6, 1);
  }
  // friends cheer
  for (const f of G.friends) poseHero(f, dt, 'cheer');
  // decor cleanup
  for (let i = decor.length - 1; i >= 0; i--) {
    const o = decor[i];
    if (o.position.z > G.pz + 30) { free(o); decor.splice(i, 1); }
    else if (o.userData.pname === 'windmill') { const b = o.children.find(c => /blades/.test(c.name)); if (b) b.rotation.z += dt * 0.8; }
    else if (o.userData.pname === 'ghost') o.position.y = 0.3 + Math.sin(G.time * 2 + o.position.z) * 0.3;
  }
  // theme switching
  const tk = themeAtDist(d);
  if (tk !== G.themeIdx) switchTheme(tk);
  // story lines
  if (G.mode === 'story') {
    if (G.lineShown < 2 && d > G.len * (G.lineShown ? 0.68 : 0.34)) { toast(G.chapter.lines[G.lineShown]); G.lineShown++; }
    if (d >= G.len) finish();
  } else if (d > 100 && Math.floor(d / 500) > Math.floor((d - G.speed * dt) / 500)) { toast(Math.floor(d / 500) * 500 + ' м! Так держать!'); }
  generate();
  hudRun(d);
}

function switchTheme(tk) {
  G.themeIdx = tk;
  $('fade').style.opacity = 0.85;
  setTimeout(() => { buildEnv(tk); $('fade').style.opacity = 0; showBanner(THEMES[tk].name, G.mode === 'story' ? 'НОВОЕ МЕСТО' : 'СЛЕДУЮЩИЙ УЧАСТОК'); audio.playMusic(THEMES[tk].music); }, 330);
}

function collectPickup(e) {
  removeEnt(e);
  if (e.t === 'item') {
    G.items++;
    audio.play('item', { vol: 0.9 });
    emit(e.x, 1.2, e.z, '#fff0a0', 26, 3, 4, 0.9, 3);
    hudItems();
    const n = G.chapter.items;
    toast(n === 1 ? 'Нашёлся ' + (G.chapter.itemName || ITEMS[e.name].name) + '!' : ITEMS[e.name].icon + ' ' + G.items + ' из ' + n);
  } else if (e.name === 'heart') {
    if (G.lives < G.maxLives) G.lives++;
    audio.play('heart', { vol: 0.9 });
    emit(e.x, 1.2, e.z, '#ff8a8a', 16, 2, 3, 0.7, 2);
    hudLives();
  } else {
    givePower(e.name);
    emit(e.x, 1.2, e.z, '#bff0ff', 20, 2.5, 3, 0.7, 2);
    toast({ magnet: '🧲 Магнит!', shield: '🛡️ Щит!', x2: '×2 Двойные монеты!', boots: '👟 Прыгучие копытца!' }[e.name]);
  }
}

/* ---------------- end states ---------------- */
function finish() {
  G.state = 'finish';
  G.finT = 0;
  audio.duck(true);
  audio.play('victory', { vol: 0.9 });
  setTimeout(() => audio.play('bleat', { vol: 0.6, rate: 1.1 }), 600);
  for (let i = 0; i < 6; i++) setTimeout(() => { for (const c of ['#ff6b6b', '#ffd36b', '#6bc8ff', '#7cc46a', '#ff9be0']) emit(G.px + rand(-4, 4), rand(4, 6), G.pz - rand(2, 8), c, 8, 3, 2, 1.6, 4); }, i * 180);
}
function finishStep(dt) {
  G.finT += dt;
  G.speed = damp(G.speed, 0, 2.5, dt);
  G.pz -= G.speed * dt;
  G.px = damp(G.px, 0, 3, dt);
  G.py = damp(G.py, 0, 6, dt);
  G.hero.root.position.set(G.px, G.py, G.pz);
  G.hero.root.rotation.y = damp(G.hero.root.rotation.y, G.finT > 1 ? Math.PI : 0, 3, dt);
  poseHero(G.hero, dt, G.speed > 3 ? 'run' : 'cheer', G.speed);
  for (const f of G.friends) poseHero(f, dt, 'cheer');
  if (G.npc) { G.npc.root.position.z = damp(G.npc.root.position.z, G.pz - 2, 3, dt); poseHero(G.npc, dt, 'cheer'); }
  if (G.finT > 2.2 && !G.resultShown) { G.resultShown = true; showResults(); }
}
function completeRunBank() {
  save.coins += G.coins;
  save.totalCoins += G.coins;
}
function showResults() {
  const c = G.chapter, i = G.ch;
  completeRunBank();
  const st = [true];
  for (const q of c.q) {
    if (q.t === 'coins') st.push(G.coins >= q.n);
    else if (q.t === 'items') st.push(G.items >= c.items);
    else if (q.t === 'nohit') st.push(G.hits === 0);
  }
  const stars = st.filter(Boolean).length;
  const first = !save.done[i];
  let reward = first ? c.reward : 0;
  const prevStars = save.stars[i];
  if (stars === 3 && prevStars < 3) reward += 50;
  save.coins += reward;
  save.done[i] = true;
  save.stars[i] = Math.max(prevStars, stars);
  save.unlocked = Math.max(save.unlocked, Math.min(CHAPTERS.length, i + 2));
  persist();
  const last = i === CHAPTERS.length - 1;
  openModal({
    kicker: 'ГЛАВА ' + (i + 1) + ' ПРОЙДЕНА', title: c.finale ? 'Маленький герой — большое сердце!' : 'Получилось!', text: c.ending, stars,
    summary: [['Монеты', '+' + G.coins], ['Награда', reward ? '+' + reward : '—'], [ITEMS[c.item].icon + ' Найдено', G.items + '/' + c.items], ['Удары', G.hits]],
    quests: questLines(c, st),
    buttons: [
      !last ? ['Следующая глава ↗', 'primary', () => openStory(i + 1)] : ['Все главы', 'primary', () => openChapters()],
      ['Ещё раз', '', () => openStory(i)],
      ['В меню', 'ghost', () => toMenu()],
    ],
  });
  audio.duck(false);
  setTimeout(() => stars >= 1 && audio.play('star', { vol: 0.6 }), 300);
  setTimeout(() => stars >= 2 && audio.play('star', { vol: 0.6, rate: 1.12 }), 550);
  setTimeout(() => stars >= 3 && audio.play('star', { vol: 0.6, rate: 1.25 }), 800);
}
function questLines(c, st) {
  const lines = [['Добежать до финиша', st ? st[0] : false]];
  c.q.forEach((q, k) => {
    const done = st ? st[k + 1] : false;
    if (q.t === 'coins') lines.push(['Собрать ' + q.n + ' монет', done]);
    else if (q.t === 'items') lines.push([c.items === 1 ? 'Найти ' + (c.itemName || ITEMS[c.item].name) : 'Собрать все ' + (c.itemName || ITEMS[c.item].name) + ' (' + c.items + ')', done]);
    else lines.push(['Пройти без единого удара', done]);
  });
  return lines;
}
function fail() {
  G.state = 'fail';
  audio.duck(true);
  setTimeout(() => {
    audio.play('fail', { vol: 0.8 });
    const canRevive = !G.revived && save.coins + G.coins >= 100;
    const btns = [];
    if (canRevive) btns.push(['Продолжить за 100 монет', 'primary', () => revive()]);
    if (G.mode === 'story') btns.push(['Начать главу заново', canRevive ? '' : 'primary', () => { bankFail(); openStory(G.ch); }]);
    else btns.push(['Ещё забег', canRevive ? '' : 'primary', () => { bankFail(); startRun('endless'); }]);
    btns.push(['В меню', 'ghost', () => { bankFail(); toMenu(); }]);
    const d = Math.floor(dist());
    let text = G.mode === 'story' ? (HEROES.find(h => h.id === G.hero.id) || HEROES[0]).name + ' немного устал' + (G.hero.id === 'bella' ? 'а' : '') + ', но не сдаётся. Монеты, собранные в забеге, останутся у тебя.' : 'Забег окончен. Отличная пробежка!';
    if (G.mode === 'endless' && d > save.best) text = 'Новый рекорд: ' + d + ' м! 🎉';
    openModal({ kicker: G.mode === 'story' ? 'ПЕРЕДЫШКА' : 'СВОБОДНЫЙ ЗАБЕГ', title: 'Ой! Кончились сердечки', text, summary: [['Дистанция', d + ' м'], ['Монеты', '+' + G.coins], ['Рекорд', Math.max(save.best, d) + ' м']], buttons: btns });
  }, 650);
}
function bankFail() {
  if (G.banked) return;
  G.banked = true;
  completeRunBank();
  if (G.mode === 'endless') save.best = Math.max(save.best, Math.floor(dist()));
  persist();
}
function revive() {
  const fromRun = Math.min(G.coins, 100);
  G.coins -= fromRun; save.coins -= 100 - fromRun; persist();
  G.revived = true; G.lives = 1; G.inv = 2.5; G.hero.blink = 2.5; G.hero.inner.rotation.z = 0;
  for (const e of ents) if (!e.dead && e.t === 'ob' && e.z > G.pz - 30) removeEnt(e);
  showScreen(null); $('hud').classList.remove('hidden');
  audio.duck(false);
  hudLives(); hudCoins();
  G.state = 'count'; G.countT = 1.6;
}
function pause() {
  if (G.state !== 'run') return;
  G.state = 'pause';
  audio.duck(true);
  const btns = [['Продолжить', 'primary', () => resume()]];
  if (G.mode === 'story') btns.push(['Начать заново', '', () => { bankFail(); openStory(G.ch); }]);
  btns.push(['В меню', 'ghost', () => { bankFail(); toMenu(); }]);
  openModal({ kicker: 'ПАУЗА', title: 'Передышка', text: G.mode === 'story' ? G.chapter.goal : 'Забег ждёт тебя.', quests: G.mode === 'story' ? questLines(G.chapter, null).map((l, k) => [l[0], k === 0 ? false : (G.chapter.q[k - 1].t === 'coins' ? G.coins >= G.chapter.q[k - 1].n : G.chapter.q[k - 1].t === 'items' ? G.items >= G.chapter.items : G.hits === 0)]) : null, buttons: btns });
}
function resume() {
  showScreen(null); $('hud').classList.remove('hidden');
  audio.duck(false);
  G.state = 'count'; G.countT = 1.2;
}

/* ============================== MENU SCENE ============================== */
let menuHero = null;
function menuScene(heroId) {
  clearWorld();
  if (G.hero) { world.remove(G.hero.root); G.hero = null; }
  G.mode = 'menu';
  G.chapter = CHAPTERS[0];
  G.len = 1e9;
  resetGen();
  G.endlessOrder = ['festival'];
  G.mode = 'endless';
  buildEnv('festival');
  gen.rowZ = -1e9; gen.done = true;
  genDecor(-150);
  G.mode = 'menu';
  for (let i = decor.length - 1; i >= 0; i--) { const o = decor[i]; if (Math.abs(o.position.x) < 7 && o.position.z > -12) { free(o); decor.splice(i, 1); } }
  // small meadow details near hero
  for (const [n, x, z, r] of [['flowers', -2.5, -3, 0.4], ['bush_a', 3.4, -6, 1], ['hay', -4.5, -9, 0.3], ['fence', 5.5, -2, Math.PI / 2], ['tree_b', -6.5, -12, 0]]) addDecor(n, x, z, r);
  showMenuHero(heroId || save.hero);
  audio.playMusic('menu');
  camSnap = true;
}
function showMenuHero(id) {
  if (menuHero) world.remove(menuHero.root);
  menuHero = makeHero(id);
  menuHero.root.rotation.y = Math.PI * 0.82;
  world.add(menuHero.root);
}

/* ============================== CAMERA ============================== */
let camSnap = true;
const camPos = new THREE.Vector3(), camLook = new THREE.Vector3();
function updateCamera(dt) {
  const portrait = window.innerHeight > window.innerWidth;
  let p, l;
  if (G.state === 'menu' || G.mode === 'menu') {
    const t = performance.now() / 1000;
    const land = !portrait;
    const hx = 0;
    p = new THREE.Vector3(land ? -1.4 : 0.7, land ? 1.55 : 1.75, land ? 4.3 : 4.6);
    l = new THREE.Vector3(land ? -1.65 : 0.15, land ? 0.85 : -0.95, 0);
    p.x += Math.sin(t * 0.25) * 0.25;
    if (menuHero) { menuHero.root.rotation.y = Math.PI * 0.82 + Math.sin(t * 0.4) * 0.25; poseHero(menuHero, dt, 'idle'); }
  } else {
    const back = portrait ? 7.2 : 5.3, up = portrait ? 4.4 : 3.0, look = portrait ? 9 : 10;
    const fx = G.state === 'finish' ? Math.min(1, G.finT / 2) : 0;
    p = new THREE.Vector3(G.px * 0.6, up + G.py * 0.6 - fx * 1.5, G.pz + back - fx * 1.5);
    l = new THREE.Vector3(G.px * 0.8, 1.1 + G.py * 0.65, G.pz - look * (1 - fx * 0.85));
    if (G.shake > 0) { G.shake -= dt; p.x += rand(-1, 1) * G.shake * 0.4; p.y += rand(-1, 1) * G.shake * 0.3; }
  }
  if (camSnap) { camPos.copy(p); camLook.copy(l); camSnap = false; }
  else { camPos.x = damp(camPos.x, p.x, 6, dt); camPos.y = damp(camPos.y, p.y, 6, dt); camPos.z = damp(camPos.z, p.z, 14, dt); camLook.x = damp(camLook.x, l.x, 6, dt); camLook.y = damp(camLook.y, l.y, 6, dt); camLook.z = damp(camLook.z, l.z, 14, dt); }
  camera.position.copy(camPos);
  camera.lookAt(camLook);
}

/* ============================== HUD ============================== */
function hudLives() { $('lives').innerHTML = Array.from({ length: G.maxLives }, (_, i) => '<span class="' + (i < G.lives ? '' : 'off') + '">♥</span>').join(''); }
function hudCoins() { $('hudCoins').textContent = G.coins; }
function hudItems() { if (G.chapter) $('hudItems').textContent = G.items + '/' + G.chapter.items; }
function hudPowers() {
  const names = { magnet: '🧲', shield: '🛡️', x2: '<b>×2</b>', boots: '👟' };
  $('powers').innerHTML = Object.keys(G.pw).filter(k => G.pw[k] > 0).map(k => '<div class="power" data-k="' + k + '"><span>' + names[k] + '</span><i style="--p:100%"></i></div>').join('');
}
let hudT = 0;
function hudRun(d) {
  hudT -= 1;
  if (hudT > 0) return;
  hudT = 4;
  if (G.mode === 'story') {
    $('hudLeft').textContent = Math.max(0, Math.ceil(G.len - d)) + ' м';
    $('hudBar').style.width = clamp(d / G.len * 100, 0, 100) + '%';
  } else $('hudDist').textContent = Math.floor(d);
  document.querySelectorAll('#powers .power').forEach(p => { const k = p.dataset.k; p.querySelector('i').style.setProperty('--p', clamp(G.pw[k] / (G.pwMax[k] || 1) * 100, 0, 100) + '%'); });
}
let toastT = null;
function toast(msg) { const t = $('toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2400); }
function showBanner(text, sub) { $('bannerText').textContent = text; $('bannerSub').textContent = sub || ''; $('banner').classList.add('show'); setTimeout(() => $('banner').classList.remove('show'), 1900); }

/* ============================== SCREENS ============================== */
const SCREENS = ['loading', 'device', 'orient', 'menu', 'chapters', 'story', 'modal', 'shop', 'heroes', 'settings'];
let current = null, prevScreen = null;
function showScreen(id) {
  for (const s of SCREENS) $(s).classList.toggle('show', s === id);
  if (id !== 'settings') prevScreen = current;
  current = id;
  const top = ['menu', 'chapters', 'shop', 'heroes'].includes(id);
  $('topbar').classList.toggle('hidden', !top);
  if (top) $('coinTotal').textContent = save.coins;
  if (id && id !== 'modal' && id !== 'settings') $('hud').classList.add('hidden');
}
function toMenu() {
  G.state = 'menu';
  $('hud').classList.add('hidden');
  audio.duck(false);
  menuScene();
  updateMenu();
  showScreen('menu');
}
function nextChapterIndex() { const i = save.done.findIndex(d => !d); return i === -1 ? CHAPTERS.length - 1 : Math.min(i, save.unlocked - 1); }
function updateMenu() {
  const i = nextChapterIndex(), c = CHAPTERS[i];
  const doneCount = save.done.filter(Boolean).length;
  $('contAct').textContent = 'История ' + (c.act + 1) + ' · ' + ACTS[c.act].title;
  $('contTitle').textContent = c.title;
  $('contDetail').textContent = 'Глава ' + (i + 1) + ' из ' + CHAPTERS.length + (save.done[i] ? ' · пройдена' : '');
  $('btnContinue').textContent = doneCount === 0 ? 'Начать историю ↗' : doneCount === CHAPTERS.length ? 'Переиграть главу ↗' : 'Продолжить ↗';
  $('sagaCount').textContent = doneCount + ' / ' + CHAPTERS.length;
  $('sagaBar').style.width = doneCount / CHAPTERS.length * 100 + '%';
  $('starCount').textContent = save.stars.reduce((a, b) => a + b, 0) + '★';
  $('heroTagName').textContent = HEROES.find(h => h.id === save.hero).name;
  $('coinTotal').textContent = save.coins;
}
const ACT_COLORS = ['#d87945', '#458497', '#7c6fc2', '#c2604a'];
function openChapters() {
  if (G.state !== 'menu') toMenu();
  let html = '';
  ACTS.forEach((a, ai) => {
    html += '<div class="actTitle">История ' + (ai + 1) + ' · ' + a.title + '</div><p class="actCopy">' + a.copy + '</p><div class="chapterGrid">';
    CHAPTERS.forEach((c, i) => {
      if (c.act !== ai) return;
      const locked = i >= save.unlocked, s = save.stars[i];
      const next = i === nextChapterIndex() && !save.done[i];
      html += '<button class="chapterCard ' + (locked ? 'locked ' : '') + (next ? 'next' : '') + '" data-ch="' + i + '" style="--c:' + ACT_COLORS[ai] + '" ' + (locked ? 'disabled' : '') + '><span class="num">' + (locked ? '🔒' : i + 1) + '</span><span><b>' + c.title + '</b><small>' + THEMES[c.themes[0]].name + (c.themes[1] ? ' → ' + THEMES[c.themes[1]].name : '') + ' · ' + c.len + ' м</small><br><span class="st">' + '★'.repeat(s) + '<span style="color:#ddd6c3">' + '★'.repeat(3 - s) + '</span></span></span></button>';
    });
    html += '</div>';
  });
  $('chapterList').innerHTML = html;
  showScreen('chapters');
  const nx = $('chapterList').querySelector('.next');
  if (nx) nx.scrollIntoView({ block: 'center' });
}
$('chapterList').addEventListener('click', e => { const b = e.target.closest('[data-ch]'); if (b && !b.disabled) { audio.play('click'); openStory(+b.dataset.ch); } });

function openStory(i) {
  if (G.state !== 'menu') { bankFail(); toMenu(); }
  G.banked = false; G.resultShown = false;
  const c = CHAPTERS[i];
  G.pendingCh = i;
  $('storyKicker').textContent = 'ГЛАВА ' + (i + 1) + ' / ' + CHAPTERS.length + ' · ' + THEMES[c.themes[0]].name.toUpperCase();
  $('storyTitle').textContent = c.title;
  $('storyText').textContent = c.intro;
  $('storyGoal').textContent = c.goal;
  const ql = questLines(c, null);
  const prev = save.stars[i];
  $('storyQuests').innerHTML = ql.map((l, k) => '<div><i class="' + (k < prev ? 'on' : '') + '">★</i>' + l[0] + '</div>').join('') + (c.hero ? '<div class="muted small">Герой главы: ' + HEROES.find(h => h.id === c.hero).name + '</div>' : '');
  if (c.hero) showMenuHero(c.hero); else showMenuHero(save.hero);
  showScreen('story');
}
$('storyGo').onclick = () => { audio.play('click'); G.banked = false; G.resultShown = false; startRun('story', G.pendingCh); };
$('storyBack').onclick = () => { audio.play('click'); showMenuHero(save.hero); openChapters(); };

function openModal({ kicker, title, text, stars, summary, buttons, quests }) {
  $('toast').classList.remove('show');
  $('modalKicker').textContent = kicker || '';
  $('modalTitle').textContent = title || '';
  $('modalText').textContent = text || '';
  const st = $('modalStars');
  if (stars !== undefined) { st.classList.remove('hidden'); [...st.children].forEach((s, k) => { s.classList.remove('on'); if (k < stars) setTimeout(() => s.classList.add('on'), 50); }); }
  else st.classList.add('hidden');
  let sum = summary ? summary.map(s => '<div><small>' + s[0] + '</small><b>' + s[1] + '</b></div>').join('') : '';
  $('modalSummary').innerHTML = sum;
  if (quests) $('modalSummary').insertAdjacentHTML('afterend', '');
  const qhtml = quests ? '<div class="quests">' + quests.map(q => '<div><i class="' + (q[1] ? 'on' : '') + '">★</i>' + q[0] + '</div>').join('') + '</div>' : '';
  $('modalText').innerHTML = (text || '') + qhtml;
  const bc = $('modalBtns');
  bc.innerHTML = '';
  for (const [label, cls, fn] of buttons) {
    const b = document.createElement('button');
    b.className = 'btn ' + cls; b.textContent = label;
    b.onclick = () => { audio.play('click'); fn(); };
    bc.appendChild(b);
  }
  showScreen('modal');
}

/* ---------- shop ---------- */
let shopTab = 'upgrades';
function renderShop() {
  $('coinTotal').textContent = save.coins;
  document.querySelectorAll('#shop .tabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === shopTab));
  let html = '';
  if (shopTab === 'upgrades') {
    for (const u of UPGRADES) {
      const lvl = save.up[u.id] || 0, max = lvl >= UPGRADE_COST.length, cost = UPGRADE_COST[lvl];
      html += '<div class="card"><span class="ico">' + u.icon + '</span><b>' + u.name + '</b><small>' + u.desc + ' · ' + (u.base + u.step * lvl).toFixed(1).replace('.0', '') + ' с</small><div class="lvl">' + UPGRADE_COST.map((_, k) => '<i class="' + (k < lvl ? 'on' : '') + '"></i>').join('') + '</div>' +
        '<button class="btn ' + (max ? '' : 'primary') + '" data-up="' + u.id + '" ' + (max || save.coins < cost ? 'disabled' : '') + '>' + (max ? 'Максимум' : '<span class="coinIco s"></span> ' + cost) + '</button></div>';
    }
  } else {
    for (const b of BOOSTS) {
      html += '<div class="card"><span class="ico">' + b.icon + '</span><b>' + b.name + '</b><small>' + b.desc + '</small><small>В запасе: <b>' + (save.boosts[b.id] || 0) + '</b></small><button class="btn primary" data-boost="' + b.id + '" ' + (save.coins < b.price ? 'disabled' : '') + '><span class="coinIco s"></span> ' + b.price + '</button></div>';
    }
  }
  $('shopList').innerHTML = html;
}
$('shopList').addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b || b.disabled) return;
  if (b.dataset.up) { const k = b.dataset.up, lvl = save.up[k] || 0, cost = UPGRADE_COST[lvl]; if (save.coins >= cost) { save.coins -= cost; save.up[k] = lvl + 1; audio.play('power'); } }
  if (b.dataset.boost) { const bo = BOOSTS.find(x => x.id === b.dataset.boost); if (save.coins >= bo.price) { save.coins -= bo.price; save.boosts[bo.id] = (save.boosts[bo.id] || 0) + 1; audio.play('coin'); } }
  persist(); renderShop();
});
document.querySelectorAll('#shop .tabs button').forEach(b => (b.onclick = () => { shopTab = b.dataset.tab; audio.play('click'); renderShop(); }));

/* ---------- heroes ---------- */
let heroPreview = null;
function renderHeroes() {
  $('coinTotal').textContent = save.coins;
  $('heroList').innerHTML = HEROES.map(h => {
    const own = save.owned[h.id], sel = save.hero === h.id, prev = heroPreview === h.id;
    const tag = sel ? 'Выбран' : own ? 'Выбрать' : '<span class="coinIco s"></span> ' + h.price;
    return '<button class="heroCard ' + (prev ? 'sel' : '') + '" data-hero="' + h.id + '" style="--c:' + h.color + '"><span class="dot"></span><span><b>' + h.name + '</b><small>' + h.desc + '</small></span><span class="tag ' + (!own ? 'buy' : '') + '">' + tag + '</span></button>';
  }).join('');
}
$('heroList').addEventListener('click', e => {
  const b = e.target.closest('[data-hero]');
  if (!b) return;
  const id = b.dataset.hero, h = HEROES.find(x => x.id === id);
  if (heroPreview !== id) { heroPreview = id; showMenuHero(id); audio.play('bleat', { vol: 0.5, rate: id === 'pugovka' ? 1.25 : id === 'bella' ? 1.12 : 1 }); renderHeroes(); return; }
  if (save.owned[id]) { save.hero = id; audio.play('click'); }
  else if (save.coins >= h.price) { save.coins -= h.price; save.owned[id] = true; save.hero = id; audio.play('power'); toast(h.name + ' теперь в команде!'); }
  else toast('Нужно ещё ' + (h.price - save.coins) + ' монет');
  persist(); renderHeroes(); updateMenu();
});

/* ---------- settings ---------- */
function renderSettings() {
  $('setMusic').value = save.set.music; $('setSfx').value = save.set.sfx;
  $('setMuted').checked = save.set.muted; $('setButtons').checked = save.set.buttons; $('setVibro').checked = save.set.vibro;
  for (const [id, v] of [['setDiff', save.set.diff], ['setQuality', save.set.quality], ['setDevice', save.device], ['setOrient', save.set.orient || 'auto']]) $(id).querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.v === v));
  $('diffNote').textContent = DIFFICULTY[save.set.diff].desc + '. Действует со следующего забега.';
}
$('setMusic').oninput = () => { save.set.music = +$('setMusic').value; audio.applyVolumes(); };
$('setSfx').oninput = () => { save.set.sfx = +$('setSfx').value; audio.applyVolumes(); };
$('setSfx').onchange = () => { persist(); audio.play('coin'); };
$('setMusic').onchange = persist;
$('setMuted').onchange = () => { save.set.muted = $('setMuted').checked; audio.applyVolumes(); persist(); };
$('setButtons').onchange = () => { save.set.buttons = $('setButtons').checked; persist(); };
$('setVibro').onchange = () => { save.set.vibro = $('setVibro').checked; persist(); if (save.set.vibro) vibrate(40); };
$('setDiff').onclick = e => { const b = e.target.closest('button'); if (b) { save.set.diff = b.dataset.v; persist(); renderSettings(); } };
$('setQuality').onclick = e => { const b = e.target.closest('button'); if (b) { save.set.quality = b.dataset.v; persist(); applyQuality(); renderSettings(); } };
$('setDevice').onclick = e => { const b = e.target.closest('button'); if (b) { setDevice(b.dataset.v); renderSettings(); } };
$('btnReset').onclick = () => {
  if (!confirm('Сбросить весь прогресс, монеты и покупки?')) return;
  const dev = save.device;
  save = defaults(); save.device = dev; audio.s = save.set; persist(); updateMenu(); renderSettings(); toast('Прогресс сброшен');
};
function setDevice(dev) {
  save.device = dev; persist();
  document.body.classList.toggle('dev-tablet', dev === 'tablet');
  document.body.classList.toggle('dev-phone', dev !== 'tablet');
  applyQuality();
}

/* ---------- navigation ---------- */
function back() {
  if (current === 'settings') { showScreen(prevScreen || 'menu'); if (prevScreen === 'modal' || prevScreen === null) { if (G.state === 'pause') pause(); } return; }
  if (['chapters', 'shop', 'heroes', 'story'].includes(current)) { if (current === 'heroes' || current === 'story') showMenuHero(save.hero); showScreen('menu'); updateMenu(); return; }
  if (G.state === 'run') { pause(); return; }
  if (G.state === 'pause') { resume(); return; }
  if (current === 'menu' && NATIVE) App.exitApp();
}
document.querySelectorAll('[data-close]').forEach(b => (b.onclick = () => { audio.play('click'); back(); }));
$('btnContinue').onclick = () => { audio.unlock(); audio.play('click'); openStory(nextChapterIndex()); };
$('btnChapters').onclick = () => { audio.play('click'); openChapters(); };
$('btnEndless').onclick = () => { audio.play('click'); G.banked = false; startRun('endless'); };
$('btnShop').onclick = () => { audio.play('click'); renderShop(); showScreen('shop'); };
$('btnHeroes').onclick = () => { audio.play('click'); heroPreview = save.hero; renderHeroes(); showScreen('heroes'); };
$('btnSettings').onclick = () => { audio.play('click'); renderSettings(); showScreen('settings'); };
$('btnPause').addEventListener('pointerdown', e => { e.stopPropagation(); pause(); });
document.querySelectorAll('.deviceBtn').forEach(b => (b.onclick = () => {
  audio.unlock();
  setDevice(b.dataset.device);
  audio.play('bleat', { vol: 0.6 });
  if (!save.tutorial) { save.tutorial = true; persist(); }
  if (!save.set.orient) showScreen('orient'); else toMenu();
}));

/* ---------- screen orientation ---------- */
// Native (APK): @capacitor/screen-orientation. Browser: Screen Orientation API (needs fullscreen).
async function applyOrientation(o = save.set.orient) {
  if (!o) return false;
  if (NATIVE) {
    try { if (o === 'auto') await ScreenOrientation.unlock(); else await ScreenOrientation.lock({ orientation: o }); return true; } catch (e) { return false; }
  }
  try {
    const so = screen.orientation;
    if (!so || !so.lock || !matchMedia('(pointer: coarse)').matches) return false;
    if (o === 'auto') { so.unlock(); return true; }
    if (!document.fullscreenElement && document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
    await so.lock(o);
    return true;
  } catch (e) { return false; }
}
function chooseOrientation(o) {
  audio.unlock();
  audio.play('click');
  save.set.orient = o; persist();
  applyOrientation(o).then(ok => {
    const portrait = window.innerHeight > window.innerWidth;
    if (o === 'landscape' && !ok && portrait) setTimeout(() => toast('Поверните телефон горизонтально ↻'), 400);
  });
  toMenu();
}
$('orientLand').onclick = () => chooseOrientation('landscape');
$('orientPort').onclick = () => chooseOrientation('portrait');
$('setOrient').onclick = e => { const b = e.target.closest('button'); if (b) { save.set.orient = b.dataset.v; persist(); applyOrientation(); renderSettings(); } };

document.addEventListener('visibilitychange', () => {
  if (document.hidden) { if (G.state === 'run' || G.state === 'count') { G.state = 'run'; pause(); } audio.suspend(); }
  else audio.resume();
});
(function nativeHooks() {
  if (!NATIVE) return;
  App.addListener('backButton', () => back());
  App.addListener('pause', () => { if (G.state === 'run') pause(); audio.suspend(); });
  App.addListener('resume', () => { audio.resume(); applyOrientation(); });
})();

/* ============================== LOOP ============================== */
let last = performance.now();
function loop(now) {
  requestAnimationFrame(loop);
  let dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  const t = now / 1000;
  if (G.state === 'run') step(dt);
  else if (G.state === 'count') {
    G.countT -= dt;
    const n = Math.ceil(G.countT / 0.6);
    const label = G.countT > 0.6 ? String(n - 1) : 'Вперёд!';
    const cd = $('countdown');
    if (cd.textContent !== label) { cd.textContent = label; if (G.countT > 0.6) audio.play('beep', { vol: 0.5 }); else audio.play('go', { vol: 0.6 }); }
    if (G.hero) { G.hero.root.position.set(G.px, G.py, G.pz); poseHero(G.hero, dt, 'idle'); }
    if (G.npc) poseHero(G.npc, dt, 'idle');
    if (G.countT <= 0) { cd.textContent = ''; G.state = 'run'; if (save.runs <= 2) toast('Свайп ← → — полосы, ↑ — прыжок, ↓ — подкат'); else if (G.mode === 'story') toast(G.chapter.goal); }
  } else if (G.state === 'finish') finishStep(dt);
  else if (G.state === 'fail' && G.hero) { G.hero.inner.rotation.z = damp(G.hero.inner.rotation.z, 1.4, 4, dt); G.hero.inner.position.y = damp(G.hero.inner.position.y, 0.1, 4, dt); }
  updateCoins(dt, t);
  updateParticles(dt);
  updateCamera(dt);
  updateEnv(dt, t);
  renderer.render(scene, camera);
}

/* ============================== BOOT ============================== */
(async function boot() {
  resize();
  applyQuality();
  try {
    await loadAssets(p => { $('loadBar').style.width = Math.round(p * 92) + '%'; });
  } catch (e) {
    $('loadText').textContent = 'Не удалось загрузить модели: ' + e.message;
    console.error(e);
    return;
  }
  $('loadBar').style.width = '100%';
  initCoins();
  G.state = 'menu';
  menuScene();
  if (save.device) setDevice(save.device);
  requestAnimationFrame(loop);
  setTimeout(() => {
    if (!save.device) showScreen('device');
    else if (!save.set.orient) showScreen('orient');
    else { applyOrientation(); updateMenu(); showScreen('menu'); }
  }, 150);
  // pre-warm materials
  renderer.compile(scene, camera);
  window.__game = { sim: (sec) => { for (let i = 0; i < sec * 60; i++) { if (G.state === 'count') { G.countT -= 1 / 60; if (G.countT <= 0) G.state = 'run'; } else if (G.state === 'run') step(1 / 60); else if (G.state === 'finish') finishStep(1 / 60); updateCoins(1 / 60, i / 60); } }, G, save, startRun, toMenu, openStory, act, ents, PROTO, BOX, coins, KIND, gen, coinFree, step, updateCoins };
})();
