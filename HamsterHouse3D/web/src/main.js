import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
import { G, GAME_MIN_PER_SEC, ADULT_DAYS, MAX_HAMSTERS, LIFE_DAYS } from './state.js';
import { COLORS, COLOR_KEYS, NAMES_M, NAMES_F, randomName } from './data.js';
import { buildWorld, HALF_W, HALF_D } from './world.js';
import { Hamster, makeData, escapeHtml } from './hamster.js';
import { sfx } from './audio.js';
import { fx } from './fx.js';

const $ = (id) => document.getElementById(id);
const rand = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const SAVE_KEY = 'hamster_house_v1';

// ================= сцена =================
const container = $('scene');
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
container.appendChild(renderer.domElement);

const labelRenderer = new CSS2DRenderer({ element: $('labels') });
labelRenderer.setSize(innerWidth, innerHeight);

const scene = new THREE.Scene();
scene.background = new THREE.Color('#f3dfc6');
scene.fog = new THREE.Fog('#f3dfc6', 90, 190);
const camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, 0.5, 400);
G.scene = scene; G.camera = camera;
fx.init(scene);
const W = buildWorld(scene);
G.world = W;

function camDistance() { const a = innerWidth / innerHeight; return a < 0.8 ? 66 : a < 1.2 ? 52 : 40; }
camera.position.set(0, camDistance() * 0.72, camDistance() * 0.78);

// --- выбор хомячка / поглаживание (обработчик ставим ДО OrbitControls) ---
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
function setNdc(e) { ndc.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); ray.setFromCamera(ndc, camera); }
function hitHamster() {
  const hits = ray.intersectObjects(G.hamsters.filter(h => h.root.visible && h.state !== 'dying').map(h => h.m.hit), false);
  return hits.length ? hits[0].object.userData.hamster : null;
}
let down = null;
renderer.domElement.addEventListener('pointerdown', (e) => {
  sfx.init();
  setNdc(e);
  const h = hitHamster();
  down = { x: e.clientX, y: e.clientY, t: performance.now(), h, lx: e.clientX, ly: e.clientY, dist: 0, petAcc: 0, id: e.pointerId };
  if (h) controls.enabled = false;
});
renderer.domElement.addEventListener('pointermove', (e) => {
  if (!down || e.pointerId !== down.id) return;
  const dd = Math.hypot(e.clientX - down.lx, e.clientY - down.ly);
  down.dist += dd; down.lx = e.clientX; down.ly = e.clientY;
  if (down.h) {
    down.petAcc += dd;
    if (down.petAcc > 45) { down.petAcc = 0; down.h.pet(); if (G.selected !== down.h) select(down.h); }
  }
});
const endPointer = (e) => {
  if (!down || e.pointerId !== down.id) return;
  const tap = down.dist < 12 && performance.now() - down.t < 450;
  if (tap) onTap(e, down.h);
  if (down.h) controls.enabled = true;
  down = null;
};
renderer.domElement.addEventListener('pointerup', endPointer);
renderer.domElement.addEventListener('pointercancel', (e) => { if (down && down.h) controls.enabled = true; down = null; });

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 2, 0);
controls.enableDamping = true; controls.dampingFactor = 0.08;
controls.minDistance = 12; controls.maxDistance = 110;
controls.minPolarAngle = 0.15; controls.maxPolarAngle = 1.38;
controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN };
controls.screenSpacePanning = false;
controls.addEventListener('start', () => { if (follow) { /* при ручном повороте продолжаем следить */ } });
controls.update();

let treatMode = false, follow = false;

function onTap(e, h) {
  setNdc(e);
  if (h) { select(h); h.pet(); return; }
  // какашки
  const dh = ray.intersectObjects(G.droppings.map(d => d.mesh), true);
  if (dh.length) { const o = dh[0].object; const d = G.droppings.find(x => x.mesh === o || x.mesh === o.parent); removeDropping(d, true); return; }
  // мисочка, поилка, домик
  if (ray.intersectObject(W.bowl.mesh, false).length) { fillFood(); return; }
  if (ray.intersectObject(W.bottle.group, true).length) { fillWater(); return; }
  if (ray.intersectObject(W.house.group, true).length) {
    const inside = G.hamsters.filter(x => x.inHouse);
    toast(inside.length ? `В домике спят: ${inside.map(x => x.d.name).join(', ')} 💤` : 'Домик пустой — все гуляют!');
    if (inside.length === 1) select(inside[0]);
    return;
  }
  const fh = ray.intersectObject(W.floor, false);
  if (fh.length && treatMode) {
    const p = fh[0].point;
    if (W.isFree(p.x, p.z, 0.3)) { addTreat(p.x, p.z); setTreatMode(false); }
    else toast('Сюда не получится — выбери свободное место на опилках');
    return;
  }
  if (!treatMode) closePanel();
}

// ================= предметы: вкусняшки и какашки =================
const treatKinds = [
  () => { const g = new THREE.Group(); const c = new THREE.Mesh(new THREE.ConeGeometry(0.3, 1.5, 10), new THREE.MeshStandardMaterial({ color: '#ff8a2a', roughness: .6 })); c.rotation.z = Math.PI / 2; g.add(c); for (let i = 0; i < 3; i++) { const l = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.6, 5), new THREE.MeshStandardMaterial({ color: '#4fb34a' })); l.rotation.z = -Math.PI / 2 + (i - 1) * 0.4; l.position.set(-1.0, (i - 1) * 0.08, 0); g.add(l); } g.position.y = 0.3; return g; },
  () => { const g = new THREE.Group(); const a = new THREE.Mesh(new THREE.SphereGeometry(0.55, 16, 10, 0, Math.PI), new THREE.MeshStandardMaterial({ color: '#e8333f', roughness: .4 })); a.rotation.x = -Math.PI / 2; g.add(a); const f = new THREE.Mesh(new THREE.CircleGeometry(0.52, 16), new THREE.MeshStandardMaterial({ color: '#fff3d6' })); f.rotation.x = -Math.PI / 2; f.position.y = 0.01; g.add(f); g.rotation.x = Math.PI / 2; g.position.y = 0.55; return g; },
  () => { const g = new THREE.Group(); const m = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 8), new THREE.MeshStandardMaterial({ color: '#2f2b28', roughness: .5 })); m.scale.set(0.7, 0.45, 1.3); g.add(m); g.position.y = 0.2; return g; },
  () => { const g = new THREE.Group(); const m = new THREE.Mesh(new THREE.SphereGeometry(0.45, 12, 10), new THREE.MeshStandardMaterial({ color: '#7cc65a', roughness: .8 })); m.scale.set(1, 0.6, 1); const st = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.6, 8), new THREE.MeshStandardMaterial({ color: '#b6df8f' })); st.rotation.z = Math.PI / 2; st.position.x = -0.45; g.add(m, st); g.position.y = 0.3; return g; },
];
function addTreat(x, z) {
  const mesh = treatKinds[Math.floor(Math.random() * treatKinds.length)]();
  mesh.position.x = x; mesh.position.z = z; mesh.rotation.y = rand(0, 6);
  mesh.traverse(o => { if (o.isMesh) o.castShadow = true; });
  scene.add(mesh);
  const t = { mesh, x, z, claim: null };
  G.treats.push(t);
  fx.burst('✨', new THREE.Vector3(x, 1, z), 4, { size: 0.7 });
  sfx.pop();
  // ближайший бодрствующий хомячок бежит к угощению
  const free = G.hamsters.filter(h => !h.inHouse && !h.anchored && h.state !== 'dying' && h.state !== 'tunnel');
  free.sort((a, b) => Math.hypot(a.pos.x - x, a.pos.z - z) - Math.hypot(b.pos.x - x, b.pos.z - z));
  if (free[0]) { free[0].release(); free[0].goTreat(t); }
  return t;
}
G.removeTreat = (t) => { scene.remove(t.mesh); const i = G.treats.indexOf(t); if (i >= 0) G.treats.splice(i, 1); };

const dropGeo = new THREE.CapsuleGeometry(0.12, 0.22, 3, 8); dropGeo.rotateZ(Math.PI / 2);
const dropMat = new THREE.MeshStandardMaterial({ color: '#4a3020', roughness: 0.7 });
G.addDropping = (x, z) => {
  x = clamp(x, -HALF_W + 0.4, HALF_W - 0.4); z = clamp(z, -HALF_D + 0.4, HALF_D - 0.4);
  const mesh = new THREE.Mesh(dropGeo, dropMat); mesh.position.set(x, 0.14, z); mesh.rotation.y = rand(0, 6); mesh.castShadow = true;
  // увеличенная зона для нажатия
  const hit = new THREE.Mesh(new THREE.SphereGeometry(0.9, 6, 4), new THREE.MeshBasicMaterial({ visible: false })); mesh.add(hit);
  scene.add(mesh);
  G.droppings.push({ mesh, x, z, hit });
};
function removeDropping(d, byTap) {
  if (!d) return;
  scene.remove(d.mesh); G.droppings.splice(G.droppings.indexOf(d), 1);
  if (byTap) { sfx.pop(); fx.burst('✨', new THREE.Vector3(d.x, 0.8, d.z), 3, { size: 0.6, life: 0.9 }); G.hamsters.forEach(h => h.d.happy = clamp(h.d.happy + 1, 0, 100)); }
}

// ================= действия игрока =================
function fillFood() {
  if (G.food > 97) { toast('Мисочка и так полная 🌻'); return; }
  G.food = 100; sfx.pour(); fx.burst('🌻', new THREE.Vector3(W.bowl.c.x, 2, W.bowl.c.z), 5, { size: 0.8 });
  toast('Насыпали свежий корм 🌻');
}
function fillWater() {
  if (G.water > 97) { toast('В поилке полно воды 💧'); return; }
  G.water = 100; sfx.water(); fx.burst('💧', new THREE.Vector3(W.bottle.tip.x, 9, W.bottle.tip.z - 2), 5, { size: 0.8 });
  toast('Налили свежей воды 💧');
}
function cleanCage() {
  const n = G.droppings.length;
  [...G.droppings].forEach(d => removeDropping(d, false));
  G.hamsters.forEach(h => h.d.happy = clamp(h.d.happy + (n ? 10 : 3), 0, 100));
  sfx.sparkle();
  for (let i = 0; i < 12; i++) fx.spawn('✨', new THREE.Vector3(rand(-HALF_W, HALF_W), 1, rand(-HALF_D, HALF_D)), { size: 0.9 });
  toast(n ? `Чистота! Убрали ${n} ${plural(n, 'какашку', 'какашки', 'какашек')} 🧹` : 'Опилки обновили — хомячкам приятно ✨');
}
function setTreatMode(on) {
  treatMode = on; $('actTreat').classList.toggle('on', on);
  $('hint').style.display = on ? 'block' : 'none';
}

// ================= жизнь: появление, дружба, малыши, уход =================
function spawnHamster(data) {
  const h = new Hamster(data);
  G.hamsters.push(h);
  return h;
}
G.toast = (t) => toast(t);
G.onMate = (f, m) => {
  if (!G.settings.breeding || f.d.pregnant) return;
  f.d.pregnant = { p: 0, father: m.d.name, fatherColor: m.d.color };
  m.state = 'idle'; m.t = 1; m.partnerOf = null;
  const mid = new THREE.Vector3((f.pos.x + m.pos.x) / 2, 2.5, (f.pos.z + m.pos.z) / 2);
  fx.burst('💕', mid, 6, { size: 1.2 }); sfx.heart();
  toast(`💕 ${f.d.name} и ${m.d.name} подружились! ${f.d.name} ждёт малышей`);
};
G.onBirth = (mom) => {
  const room = MAX_HAMSTERS - G.hamsters.length;
  if (room <= 0) { toast(`${mom.d.name} очень устала, но малыши не поместились бы в домик 🏠`); return; }
  const n = Math.min(room, 1 + Math.floor(Math.random() * 4));
  const base = mom.inHouse ? { x: W.house.door.x, z: W.house.door.z + 0.5 } : { x: mom.pos.x, z: mom.pos.z };
  const taken = G.hamsters.map(h => h.d.name);
  const names = [];
  for (let i = 0; i < n; i++) {
    const gender = Math.random() < 0.5 ? 'm' : 'f';
    const r = Math.random();
    const color = r < 0.45 ? mom.d.color : r < 0.9 ? (mom.d.pregnant?.fatherColor || mom.d.color) : COLOR_KEYS[Math.floor(Math.random() * COLOR_KEYS.length)];
    const name = randomName(gender, taken.concat(names)); names.push(name);
    const p = W.randomFree(base, 2);
    const d = makeData({ name, gender, color, age: 0, motherId: mom.d.id, gen: (mom.d.gen || 1) + 1, x: p.x, z: p.z });
    d.hunger = 90; d.thirst = 90; d.energy = 90; d.happy = 90;
    const h = spawnHamster(d); h.setState('idle', rand(1, 3));
    fx.burst('✨', new THREE.Vector3(p.x, 1, p.z), 3, { size: 0.7 });
  }
  sfx.chime();
  toast(`🍼 ${mom.d.name} стала мамой! ${plural(n, 'Родился', 'Родились', 'Родились')} ${n} ${plural(n, 'малыш', 'малыша', 'малышей')}: ${names.join(', ')}`);
  fx.burst('🍼', new THREE.Vector3(base.x, 3, base.z), 3, { size: 1.2 });
  saveGame();
};
G.onHamsterGone = (h) => {
  const i = G.hamsters.indexOf(h); if (i < 0) return;
  G.hamsters.splice(i, 1);
  h.release(); h.dispose();
  G.memorial.unshift({ name: h.d.name, gender: h.d.gender, color: h.d.color, days: Math.floor(h.d.age), day: Math.floor(G.time / 1440) + 1 });
  G.memorial = G.memorial.slice(0, 50);
  if (G.selected === h) closePanel();
  toast(h.cause === 'sick'
    ? `🌈 ${h.d.name} заболел${h.d.gender === 'f' ? 'а' : ''} и ушл${h.d.gender === 'f' ? 'а' : 'ёл'} на Радужный мост. Не забывай кормить и поить хомячков.`
    : `🌈 ${h.d.name} прожил${h.d.gender === 'f' ? 'а' : ''} долгую счастливую жизнь (${Math.floor(h.d.age)} дн.) и ушл${h.d.gender === 'f' ? 'а' : 'ёл'} на Радужный мост.`);
  saveGame();
};
let mateClock = 0;
function breedingCheck() {
  if (!G.settings.breeding || G.hamsters.length > MAX_HAMSTERS - 2) return;
  const ok = (h) => h.adult && !h.old && !h.inHouse && h.state !== 'dying' && !h.anchored && h.d.health > 50;
  const females = G.hamsters.filter(h => h.d.gender === 'f' && ok(h) && !h.d.pregnant && h.d.cooldown <= 0 && h.d.happy > 40 && h.state !== 'meet');
  const males = G.hamsters.filter(h => h.d.gender === 'm' && ok(h) && h.state !== 'wait');
  if (!females.length || !males.length) return;
  for (const f of females) {
    if (Math.random() > 0.06) continue;
    const m = males[Math.floor(Math.random() * males.length)];
    f.release(); m.release();
    f.partner = m; m.partnerOf = f;
    m.setState('wait', 14); f.setState('meet', 10);
    fx.spawn('💗', new THREE.Vector3(f.pos.x, 2.5, f.pos.z), { size: 1 });
    break;
  }
}

// ================= сохранение =================
function saveGame() {
  try {
    const data = {
      v: 1, time: G.time, food: G.food, water: G.water, settings: G.settings, memorial: G.memorial, nextId: G.nextId,
      seenWelcome: G.seenWelcome, savedAt: Date.now(),
      hamsters: G.hamsters.map(h => ({ ...h.d, x: h.inHouse ? W.house.door.x : h.pos.x, z: h.inHouse ? W.house.door.z : h.pos.z, heading: h.heading })),
      droppings: G.droppings.map(d => [d.x, d.z]),
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch (e) { /* хранилище недоступно */ }
}
window.saveGame = saveGame;

function loadGame() {
  let s = null;
  try { s = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); } catch (e) { s = null; }
  if (!s || !s.hamsters) return false;
  Object.assign(G.settings, s.settings || {});
  G.time = s.time ?? G.time; G.food = s.food ?? 80; G.water = s.water ?? 80;
  G.memorial = s.memorial || []; G.nextId = s.nextId || 1; G.seenWelcome = !!s.seenWelcome;
  s.hamsters.forEach(d => { if (!W.isFree(d.x, d.z, 0.5)) { const p = W.randomFree(); d.x = p.x; d.z = p.z; } spawnHamster(d); });
  (s.droppings || []).forEach(([x, z]) => G.addDropping(x, z));
  // пока игра была закрыта: хомячки немного поели и попили (но никто не постарел)
  const away = (Date.now() - (s.savedAt || Date.now())) / 60000;
  if (away > 3 && G.hamsters.length) {
    const n = G.hamsters.length;
    const ateFood = Math.min(G.food, away * 0.6 * n), drank = Math.min(G.water, away * 0.6 * n);
    G.food -= ateFood; G.water -= drank;
    G.hamsters.forEach(h => {
      const d = h.d;
      d.hunger = Math.max(G.food > 0 ? 60 : 30, d.hunger - away * 2);
      d.thirst = Math.max(G.water > 0 ? 60 : 30, d.thirst - away * 2);
      d.happy = Math.max(40, d.happy - away);
      d.energy = Math.min(100, d.energy + away * 3);
    });
    setTimeout(() => toast(`Хомячки скучали! Пока тебя не было, они ${ateFood > 1 ? 'поели корма' : 'ждали тебя'}${G.food < 25 ? ' — подсыпь ещё 🌻' : ''}`), 1200);
  }
  return true;
}

function newGame() {
  G.hamsters.slice().forEach(h => h.dispose());
  G.hamsters.length = 0;
  G.treats.slice().forEach(t => G.removeTreat(t));
  [...G.droppings].forEach(d => removeDropping(d, false));
  G.time = 17 * 60; G.food = 80; G.water = 80; G.memorial = []; G.nextId = 1;
  spawnHamster(makeData({ name: 'Пушок', gender: 'm', color: 'golden', x: -3, z: 0 }));
  spawnHamster(makeData({ name: 'Ромашка', gender: 'f', color: 'white', x: 4, z: -2 }));
  spawnHamster(makeData({ name: 'Тучка', gender: 'f', color: 'grey', x: 8, z: 2 }));
  saveGame();
}

// ================= интерфейс =================
const recentToasts = {};
function toast(text) {
  const now = performance.now();
  if (recentToasts[text] && now - recentToasts[text] < 6000) return;
  recentToasts[text] = now;
  const el = document.createElement('div'); el.className = 'toast'; el.textContent = text;
  const box = $('toasts'); box.appendChild(el);
  while (box.children.length > 3) box.firstChild.remove();
  setTimeout(() => { el.style.transition = 'opacity .4s'; el.style.opacity = '0'; setTimeout(() => el.remove(), 400); }, 3800);
}
function plural(n, one, few, many) { const a = n % 10, b = n % 100; return a === 1 && b !== 11 ? one : a >= 2 && a <= 4 && (b < 10 || b >= 20) ? few : many; }

function openModal(id) { $(id).classList.add('open'); }
function closeModal(id) { $(id).classList.remove('open'); }
document.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => { sfx.click(); b.closest('.modal').classList.remove('open'); }));
document.querySelectorAll('.modal').forEach(m => m.addEventListener('pointerdown', (e) => { if (e.target === m) m.classList.remove('open'); }));

function avatarCss(color) { const c = COLORS[color] || COLORS.golden; return `radial-gradient(circle at 50% 70%, ${c.belly} 0 35%, ${c.fur} 36%)`; }

// --- панель хомячка ---
function select(h) {
  if (G.selected !== h) sfx.click();
  G.selected = h;
  $('panel').classList.add('open');
  G.hamsters.forEach(x => x.refreshLabel());
  updatePanel(true);
}
function closePanel() {
  G.selected = null; follow = false; $('pFollow').textContent = '🎥 Следить';
  $('panel').classList.remove('open');
  G.hamsters.forEach(x => x.refreshLabel());
}
function statusText(h) {
  const d = h.d;
  const map = {
    eat: 'Хрумкает корм 🌻', drink: 'Пьёт водичку 💧', eatTreat: 'Ест вкусняшку и набивает щёчки 😋',
    wheel: 'Бегает в колесе 🎡', wheelIn: 'Запрыгивает в колесо', wheelOut: 'Выпрыгивает из колеса',
    tunnel: 'Лазает по тоннелю 🟢', groom: 'Умывается лапками 🧼', sniff: 'Что-то нюхает 👃', stand: 'Встал столбиком и смотрит 👀',
    idle: 'Отдыхает', petted: 'Радуется, что его гладят 💗', meet: 'Идёт знакомиться 💕', wait: 'Ждёт подружку 💕',
    birth: 'Сейчас появятся малыши! 🍼', dying: 'Засыпает навсегда… 🌈',
  };
  let s = h.inHouse ? 'Сладко спит в домике 💤' : h.state === 'sleep' ? 'Сладко спит 💤' : map[h.state] || 'Гуляет 🐾';
  if (h.state === 'walk' && h.move) {
    const W2 = G.world;
    if (W2.bowl.slots.some(x => x.occ === h)) s = 'Идёт к мисочке 🌻';
    else if (W2.bottle.occ === h) s = 'Идёт к поилке 💧';
    else if (W2.wheel.occ === h) s = 'Бежит к колесу 🎡';
    else if (G.treats.some(t => t.claim === h)) s = 'Бежит за вкусняшкой 🥕';
  }
  if (h.state === 'sleep' && G.hamsters.length) s += ' — его можно погладить, он не проснётся';
  if (d.hunger < 25 && G.food <= 0.5) s = '⚠️ Хочет есть, а мисочка пустая!';
  else if (d.thirst < 25 && G.water <= 0.5) s = '⚠️ Хочет пить, а в поилке нет воды!';
  else if (d.health < 40) s = '🤒 Плохо себя чувствует — покорми и напои';
  return s;
}
function setBar(key, v) { $('b' + key).style.width = Math.round(v) + '%'; $('v' + key).textContent = Math.round(v); }
function updatePanel(force) {
  const h = G.selected; if (!h) return;
  const d = h.d;
  $('pName').textContent = d.name;
  $('pAvatar').style.background = avatarCss(d.color);
  let sub = `${d.gender === 'f' ? 'девочка' : 'мальчик'} · ${Math.floor(d.age)} ${plural(Math.floor(d.age), 'день', 'дня', 'дней')} · ${h.stage()}`;
  if (d.pregnant) sub += ` · ждёт малышей 💗 ${Math.min(99, Math.round(d.pregnant.p * 100))}%`;
  $('pSub').textContent = sub;
  $('pStatus').textContent = statusText(h);
  setBar('Hunger', d.hunger); setBar('Thirst', d.thirst); setBar('Energy', d.energy); setBar('Happy', d.happy); setBar('Health', d.health);
}
$('pClose').onclick = () => { sfx.click(); closePanel(); };
$('pPet').onclick = () => { const h = G.selected; if (!h) return; sfx.init(); for (let i = 0; i < 3; i++) setTimeout(() => h.state !== 'dying' && h.pet(), i * 220); };
$('pFeed').onclick = () => {
  const h = G.selected; if (!h) return;
  if (h.inHouse) { toast(`${h.d.name} спит в домике. Положу вкусняшку у входа 🥕`); addTreat(W.house.door.x + rand(-1, 1), W.house.door.z + 1.2); return; }
  if (h.state.startsWith('wheel')) { toast(`${h.d.name} бегает в колесе — подожди немножко 🎡`); return; }
  if (h.state === 'dying') return;
  let x = h.pos.x + Math.sin(h.heading) * 2.2 * h.scale, z = h.pos.z + Math.cos(h.heading) * 2.2 * h.scale;
  if (!W.isFree(x, z, 0.3)) { const p = W.randomFree(h.pos, 3); x = p.x; z = p.z; }
  G.treats.forEach(t => { if (t.claim === h) t.claim = null; });
  const t = addTreat(x, z);
  if (t.claim !== h) { if (t.claim) t.claim.release(); h.release(); h.goTreat(t); }
};
$('pFollow').onclick = () => { follow = !follow; $('pFollow').textContent = follow ? '🎥 Стоп' : '🎥 Следить'; sfx.click(); };

// --- переименование ---
$('pRename').onclick = () => {
  const h = G.selected; if (!h) return;
  sfx.click();
  $('renameInput').value = h.d.name;
  const pool = (h.d.gender === 'f' ? NAMES_F : NAMES_M).slice().sort(() => Math.random() - 0.5).slice(0, 6);
  $('renameIdeas').innerHTML = pool.map(n => `<button>${n}</button>`).join('');
  $('renameIdeas').querySelectorAll('button').forEach(b => b.onclick = () => { $('renameInput').value = b.textContent; sfx.click(); });
  openModal('mRename');
};
$('renameOk').onclick = () => {
  const h = G.selected; const v = $('renameInput').value.trim().slice(0, 16);
  if (!h || !v) return;
  const old = h.d.name; h.d.name = v; h.refreshLabel(); updatePanel(); closeModal('mRename');
  if (old !== v) { toast(`Теперь ${old === v ? '' : 'хомячка зовут'} ${v}! 🎉`); sfx.chime(); }
  saveGame();
};
$('renameInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') $('renameOk').click(); });

// --- новый хомячок ---
let addG = 'm', addC = 'golden';
function renderAdd() {
  $('addGender').querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.g === addG));
  $('addColors').innerHTML = COLOR_KEYS.map(k => `<button class="sw ${k === addC ? 'on' : ''}" data-c="${k}" style="background:${avatarCss(k)}"></button>`).join('');
  $('addColors').querySelectorAll('.sw').forEach(b => b.onclick = () => { addC = b.dataset.c; sfx.click(); renderAdd(); });
  $('addColorName').textContent = COLORS[addC].name;
}
$('addGender').querySelectorAll('button').forEach(b => b.onclick = () => {
  const was = addG; addG = b.dataset.g; sfx.click();
  const cur = $('addName').value;
  if (!cur || (was === 'm' ? NAMES_M : NAMES_F).includes(cur)) $('addName').value = randomName(addG, G.hamsters.map(h => h.d.name));
  renderAdd();
});
$('actAdd').onclick = () => {
  sfx.init(); sfx.click();
  if (G.hamsters.length >= MAX_HAMSTERS) { toast(`В домике уже ${MAX_HAMSTERS} хомячков — больше не поместится 🏠`); return; }
  addG = Math.random() < 0.5 ? 'm' : 'f'; addC = COLOR_KEYS[Math.floor(Math.random() * COLOR_KEYS.length)];
  $('addName').value = randomName(addG, G.hamsters.map(h => h.d.name));
  renderAdd(); openModal('mAdd');
};
$('addOk').onclick = () => {
  const name = $('addName').value.trim().slice(0, 16) || randomName(addG);
  const p = W.randomFree({ x: 0, z: 6 }, 5);
  const h = spawnHamster(makeData({ name, gender: addG, color: addC, x: p.x, z: p.z }));
  h.setState('stand', 2);
  fx.burst('✨', new THREE.Vector3(p.x, 1.5, p.z), 8); sfx.chime();
  closeModal('mAdd'); select(h);
  toast(`Встречайте: ${name}! 🎉`);
  saveGame();
};

// --- список ---
function renderList() {
  const list = $('hList');
  if (!G.hamsters.length) { list.innerHTML = '<p>Пока никого нет. Нажми ➕, чтобы завести хомячка!</p>'; return; }
  list.innerHTML = G.hamsters.map((h, i) => `<div class="row" data-i="${i}"><div class="dot" style="background:${avatarCss(h.d.color)}"></div>
    <div class="txt"><b>${escapeHtml(h.d.name)} ${h.d.gender === 'f' ? '♀' : '♂'}${h.d.pregnant ? ' 💗' : ''}</b><small>${h.stage()} · ${Math.floor(h.d.age)} дн. · ${statusText(h)}</small></div><div>›</div></div>`).join('');
  list.querySelectorAll('.row').forEach(r => r.onclick = () => {
    const h = G.hamsters[+r.dataset.i]; closeModal('mList'); select(h);
    if (!h.inHouse) { follow = true; $('pFollow').textContent = '🎥 Стоп'; }
  });
}
$('btnList').onclick = () => { sfx.init(); sfx.click(); renderList(); openModal('mList'); };

// --- настройки ---
function renderSettings() {
  document.querySelectorAll('[data-set]').forEach(b => b.classList.toggle('on', !!G.settings[b.dataset.set]));
  $('segLife').querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.v === G.settings.life));
  $('segSpeed').querySelectorAll('button').forEach(b => b.classList.toggle('on', +b.dataset.v === G.settings.speed));
  $('segLife').style.opacity = G.settings.lifecycle ? 1 : 0.45;
  $('memList').innerHTML = G.memorial.length
    ? G.memorial.map(m => `<div style="display:flex;align-items:center;gap:8px;margin:4px 0"><span class="dot" style="width:22px;height:22px;background:${avatarCss(m.color)}"></span>${escapeHtml(m.name)} ${m.gender === 'f' ? '♀' : '♂'} — ${m.days} дн. 🌈</div>`).join('')
    : 'Пока никого — все хомячки рядом с тобой 💛';
  $('speedBadge').textContent = `▶ ×${G.settings.speed}`;
}
document.querySelectorAll('[data-set]').forEach(b => b.onclick = () => {
  const k = b.dataset.set; G.settings[k] = !G.settings[k]; sfx.enabled = G.settings.sound; sfx.click();
  if (k === 'breeding') toast(G.settings.breeding ? '💕 Теперь у хомячков могут появиться малыши' : 'Малыши больше не появятся');
  if (k === 'lifecycle') toast(G.settings.lifecycle ? '🌈 Хомячки будут стареть' : '♾️ Хомячки живут вечно');
  renderSettings(); saveGame();
});
$('segLife').querySelectorAll('button').forEach(b => b.onclick = () => { G.settings.life = b.dataset.v; sfx.click(); renderSettings(); saveGame(); });
$('segSpeed').querySelectorAll('button').forEach(b => b.onclick = () => { G.settings.speed = +b.dataset.v; sfx.click(); renderSettings(); saveGame(); });
$('btnSettings').onclick = () => { sfx.init(); sfx.click(); renderSettings(); openModal('mSettings'); };
$('btnSpeed').onclick = () => {
  sfx.init(); const opts = [1, 2, 5, 10]; G.settings.speed = opts[(opts.indexOf(G.settings.speed) + 1) % opts.length];
  sfx.click(); renderSettings(); toast(`Скорость времени ×${G.settings.speed}`); saveGame();
};
$('btnReset').onclick = () => {
  $('cTitle').textContent = '🔄 Начать заново?';
  $('cText').textContent = 'Все хомячки и настройки сбросятся, и появятся три новых хомячка.';
  $('cYes').onclick = () => { closeModal('mConfirm'); closeModal('mSettings'); closePanel(); newGame(); toast('Новая игра! 🐹'); };
  openModal('mConfirm');
};

// --- нижние кнопки ---
$('actFood').onclick = () => { sfx.init(); fillFood(); };
$('actWater').onclick = () => { sfx.init(); fillWater(); };
$('actTreat').onclick = () => { sfx.init(); sfx.click(); setTreatMode(!treatMode); };
$('actClean').onclick = () => { sfx.init(); cleanCage(); };

// --- кнопка «Назад» на Android ---
window.onAndroidBack = () => {
  const open = document.querySelector('.modal.open');
  if (open) { open.classList.remove('open'); return true; }
  if (treatMode) { setTreatMode(false); return true; }
  if (G.selected) { closePanel(); return true; }
  saveGame();
  return false;
};
document.addEventListener('visibilitychange', () => { if (document.hidden) saveGame(); });
window.addEventListener('pagehide', saveGame);

function onResize() {
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight); labelRenderer.setSize(innerWidth, innerHeight);
}
window.addEventListener('resize', onResize);

// ================= часы =================
function dayFactor() {
  if (!G.settings.daynight) return 1;
  const h = (G.time / 60) % 24;
  const s = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  return s(5.5, 8, h) * (1 - s(19, 21.5, h));
}
function updateHUD() {
  const day = Math.floor(G.time / 1440) + 1, mins = Math.floor(G.time % 1440);
  const hh = String(Math.floor(mins / 60)).padStart(2, '0'), mm = String(Math.floor(mins % 60 / 10) * 10).padStart(2, '0');
  const df = dayFactor();
  $('clock').textContent = `${G.settings.daynight ? (df > 0.5 ? '☀️' : '🌙') : '☀️'} День ${day} · ${hh}:${mm}`;
  $('count').textContent = G.hamsters.length;
  document.querySelector('#actFood .lvl').style.height = G.food + '%';
  document.querySelector('#actWater .lvl').style.height = G.water + '%';
  $('actFood').classList.toggle('warn', G.food < 15);
  $('actWater').classList.toggle('warn', G.water < 15);
  $('actClean').classList.toggle('warn', G.droppings.length >= 12);
  const sleepers = G.hamsters.filter(h => h.inHouse).length;
  W.house.label.visible = sleepers > 0;
  W.house.label.element.textContent = `💤 ${sleepers}`;
}

// ================= главный цикл =================
const timer = new THREE.Timer();
const ring = new THREE.Mesh(new THREE.RingGeometry(1.5, 1.85, 40), new THREE.MeshBasicMaterial({ color: 0xff9f43, transparent: true, opacity: 0.85, depthWrite: false }));
ring.rotation.x = -Math.PI / 2; ring.position.y = 0.15; scene.add(ring);
let uiTimer = 0, saveTimer = 0, labelTimer = 0;
let lastTarget = new THREE.Vector3();

function separate() {
  const hs = G.hamsters;
  for (let i = 0; i < hs.length; i++) for (let j = i + 1; j < hs.length; j++) {
    const a = hs[i], b = hs[j];
    if (a.inHouse || b.inHouse || a.state.startsWith('wheel') || b.state.startsWith('wheel') || a.state === 'tunnel' || b.state === 'tunnel') continue;
    const dx = b.pos.x - a.pos.x, dz = b.pos.z - a.pos.z, dist = Math.hypot(dx, dz), min = (a.radius + b.radius) * 0.85;
    if (dist > 0.001 && dist < min) {
      const push = (min - dist), nx = dx / dist, nz = dz / dist;
      const am = a.anchored ? 0 : 1, bm = b.anchored ? 0 : 1, tot = am + bm; if (!tot) continue;
      a.pos.x -= nx * push * am / tot; a.pos.z -= nz * push * am / tot;
      b.pos.x += nx * push * bm / tot; b.pos.z += nz * push * bm / tot;
    }
  }
}

function tick() {
  requestAnimationFrame(tick);
  timer.update(); const dt = Math.min(timer.getDelta(), 0.1);
  const simDt = dt * G.settings.speed;
  const steps = Math.max(1, Math.ceil(simDt / 0.05)), sdt = simDt / steps;
  for (let s = 0; s < steps; s++) {
    const gm = sdt * GAME_MIN_PER_SEC;
    G.time += gm;
    for (const h of G.hamsters.slice()) h.update(sdt, gm);
    separate();
    mateClock += gm;
    if (mateClock > 60) { mateClock = 0; breedingCheck(); }
  }
  for (const h of G.hamsters) h.animate(dt);
  // колесо крутится
  W.wheel.spin.rotation.z -= W.wheel.speed * simDt / 4.5;
  if (!W.wheel.occ || W.wheel.occ.state !== 'wheel') W.wheel.speed *= Math.pow(0.35, dt);
  W.setFood(G.food); W.setWater(G.water);
  W.updateLighting(dayFactor());
  fx.update(dt);
  // вкусняшки чуть покачиваются
  G.treats.forEach(t => t.mesh.rotation.y += dt * 0.5);

  // кольцо выбора и слежение камерой
  const sel = G.selected;
  if (sel && sel.root.visible) {
    ring.visible = true; ring.position.x = sel.pos.x; ring.position.z = sel.pos.z; ring.position.y = sel.pos.y + 0.15;
    ring.scale.setScalar(sel.scale * (1 + Math.sin(performance.now() / 250) * 0.06));
    if (follow) {
      lastTarget.copy(controls.target);
      controls.target.lerp(new THREE.Vector3(sel.pos.x, 1.5, sel.pos.z), Math.min(1, dt * 3));
      camera.position.add(lastTarget.sub(controls.target).negate());
    }
  } else ring.visible = false;
  // не даём камере уехать далеко
  controls.target.x = clamp(controls.target.x, -HALF_W, HALF_W); controls.target.z = clamp(controls.target.z, -HALF_D, HALF_D); controls.target.y = clamp(controls.target.y, 0, 8);
  controls.update();

  uiTimer += dt; labelTimer += dt; saveTimer += dt;
  if (uiTimer > 0.25) { uiTimer = 0; updateHUD(); updatePanel(); }
  if (labelTimer > 0.5) { labelTimer = 0; G.hamsters.forEach(h => h.refreshLabel()); }
  if (saveTimer > 15) { saveTimer = 0; saveGame(); }

  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
}

// ================= старт =================
if (!loadGame()) newGame();
sfx.enabled = G.settings.sound;
renderSettings(); updateHUD();
tick();
setTimeout(() => { const l = $('loading'); l.style.opacity = '0'; setTimeout(() => l.remove(), 600); }, 300);
if (!G.seenWelcome) { G.seenWelcome = true; setTimeout(() => openModal('mWelcome'), 500); saveGame(); }
window.__G = G; // для отладки
