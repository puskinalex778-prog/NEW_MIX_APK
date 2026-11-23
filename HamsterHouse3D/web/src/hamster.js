import * as THREE from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { G, ADULT_DAYS, GESTATION_DAYS, BIRTH_COOLDOWN, LIFE_DAYS } from './state.js';
import { COLORS } from './data.js';
import { sfx } from './audio.js';
import { fx } from './fx.js';
import { HALF_W, HALF_D } from './world.js';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const rand = (a, b) => a + Math.random() * (b - a);
const ss = (e0, e1, x) => { const t = clamp((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); };
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
function angDiff(a, b) { let d = b - a; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; return d; }
const V = new THREE.Vector3();

// ---------- общие ресурсы модели ----------
const pinkMat = new THREE.MeshStandardMaterial({ color: '#f2b0a5', roughness: 0.6 });
const noseMat = new THREE.MeshStandardMaterial({ color: '#e9808f', roughness: 0.4 });
const eyeMat = new THREE.MeshStandardMaterial({ color: '#120d0b', roughness: 0.08, metalness: 0.1 });
const glintMat = new THREE.MeshBasicMaterial({ color: '#ffffff' });
const whiskMat = new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.75 });
const hitMat = new THREE.MeshBasicMaterial({ visible: false });
const geo = {
  s: new THREE.SphereGeometry(1, 20, 14),
  eye: new THREE.SphereGeometry(0.15, 14, 10),
  glint: new THREE.SphereGeometry(0.05, 8, 6),
  hit: new THREE.SphereGeometry(1.9, 8, 6),
};
const whiskGeo = (() => {
  const p = [];
  for (const s of [-1, 1]) for (let k = -1; k <= 1; k++) p.push(s * 0.25, -0.2, 0.78, s * 1.15, -0.12 + k * 0.17, 0.55 + k * 0.08);
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); return g;
})();

function colorize(g, fn) {
  const pos = g.attributes.position, n = pos.count, cols = new Float32Array(n * 3), v = new THREE.Vector3(), c = new THREE.Color();
  for (let i = 0; i < n; i++) { v.fromBufferAttribute(pos, i).normalize(); fn(v, c); c.toArray(cols, i * 3); }
  g.setAttribute('color', new THREE.BufferAttribute(cols, 3));
}

function furMaterial(opts) {
  return new THREE.MeshPhysicalMaterial({ roughness: 0.85, sheen: 1, sheenRoughness: 0.45, sheenColor: new THREE.Color(0.55, 0.5, 0.45), ...opts });
}

export function buildModel(d) {
  const C = COLORS[d.color] || COLORS.golden;
  const fur = new THREE.Color(C.fur), belly = new THREE.Color(C.belly), stripe = new THREE.Color(C.stripe || C.fur);
  const spots = d.spots || [];
  const spotted = C.pattern === 'spots';
  const baseCol = spotted ? belly : fur;

  const bodyGeo = new THREE.SphereGeometry(1, 36, 26);
  colorize(bodyGeo, (v, c) => {
    c.copy(baseCol);
    if (spotted) for (const s of spots) if (v.x * s[0] + v.y * s[1] + v.z * s[2] > 0.8) c.copy(fur);
    let b = ss(-0.05, -0.5, v.y);
    b = Math.max(b, ss(0.55, 0.9, v.z) * ss(0.35, -0.05, v.y));
    if (C.pattern === 'plain') b *= 0.4;
    c.lerp(belly, b);
    if (C.pattern === 'stripe') c.lerp(stripe, ss(0.16, 0.07, Math.abs(v.x)) * ss(0.25, 0.55, v.y));
  });
  const headGeo = new THREE.SphereGeometry(1, 32, 24);
  colorize(headGeo, (v, c) => {
    c.copy(baseCol);
    if (spotted && v.x > 0.05 && v.y > -0.25) c.copy(fur);
    let b = ss(-0.15, -0.55, v.y);
    b = Math.max(b, ss(0.45, 0.8, v.z) * ss(0.15, -0.2, v.y));
    if (C.pattern === 'plain') b *= 0.5;
    c.lerp(belly, b);
    if (C.pattern === 'stripe') c.lerp(stripe, ss(0.14, 0.06, Math.abs(v.x)) * ss(0.35, 0.7, v.y) * ss(0.75, 0.3, v.z));
  });

  const furMat = furMaterial({ vertexColors: true });
  const bellyMat = furMaterial({ color: belly });
  const earMat = furMaterial({ color: spotted ? fur : fur });

  const root = new THREE.Group();
  const body = new THREE.Group(); root.add(body);
  const bodyMesh = new THREE.Mesh(bodyGeo, furMat);
  bodyMesh.scale.set(1.0, 0.84, 1.3); bodyMesh.position.set(0, 1.0, 0); bodyMesh.castShadow = true;
  body.add(bodyMesh);
  const tail = new THREE.Mesh(geo.s, pinkMat); tail.scale.setScalar(0.15); tail.position.set(0, 0.8, -1.28); body.add(tail);

  const head = new THREE.Group(); head.position.set(0, 1.35, 1.02); body.add(head);
  const headMesh = new THREE.Mesh(headGeo, furMat); headMesh.scale.set(0.84, 0.76, 0.8); headMesh.castShadow = true; head.add(headMesh);
  const muzzle = new THREE.Mesh(geo.s, bellyMat); muzzle.scale.set(0.4, 0.33, 0.36); muzzle.position.set(0, -0.2, 0.55); head.add(muzzle);
  const cheeks = [-1, 1].map(s => { const m = new THREE.Mesh(geo.s, bellyMat); m.scale.setScalar(0.36); m.position.set(s * 0.45, -0.26, 0.32); head.add(m); return m; });
  const nose = new THREE.Mesh(geo.s, noseMat); nose.scale.set(0.11, 0.08, 0.08); nose.position.set(0, -0.08, 0.9); head.add(nose);
  const eyes = [-1, 1].map(s => {
    const e = new THREE.Group(); e.position.set(s * 0.36, 0.1, 0.6); e.rotation.y = s * 0.35;
    e.add(new THREE.Mesh(geo.eye, eyeMat));
    const gl = new THREE.Mesh(geo.glint, glintMat); gl.position.set(s * -0.03, 0.06, 0.12); e.add(gl);
    head.add(e); return e;
  });
  const ears = [-1, 1].map(s => {
    const e = new THREE.Group(); e.position.set(s * 0.48, 0.55, -0.08); e.rotation.set(-0.2, s * -0.3, s * -0.45);
    const o = new THREE.Mesh(geo.s, earMat); o.scale.set(0.3, 0.3, 0.1); e.add(o);
    const i = new THREE.Mesh(geo.s, pinkMat); i.scale.set(0.2, 0.2, 0.08); i.position.z = 0.05; e.add(i);
    head.add(e); return e;
  });
  const whisk = new THREE.LineSegments(whiskGeo, whiskMat); head.add(whisk);

  const paws = [-1, 1].map(s => { const p = new THREE.Mesh(geo.s, pinkMat); p.scale.set(0.14, 0.1, 0.2); p.position.set(s * 0.38, 0.17, 1.22); body.add(p); return p; });
  const feet = [-1, 1].map(s => { const f = new THREE.Mesh(geo.s, pinkMat); f.scale.set(0.2, 0.11, 0.34); f.position.set(s * 0.58, 0.1, -0.7); root.add(f); return f; });

  const hit = new THREE.Mesh(geo.hit, hitMat); hit.position.y = 1.1; root.add(hit);

  return { root, body, bodyMesh, head, cheeks, nose, eyes, ears, paws, feet, tail, hit, mats: [furMat, bellyMat, earMat], geos: [bodyGeo, headGeo] };
}

// ---------- данные нового хомячка ----------
export function makeData(o) {
  const spots = [];
  for (let i = 0; i < 4; i++) { const v = new THREE.Vector3(rand(-1, 1), rand(0.1, 1), rand(-1, 1)).normalize(); spots.push([v.x, v.y, v.z]); }
  return {
    id: G.nextId++, name: o.name, gender: o.gender, color: o.color,
    age: o.age ?? ADULT_DAYS + rand(0.5, 2),
    hunger: 85, thirst: 85, energy: 80, happy: 80, health: 100,
    lifeMul: rand(0.85, 1.15), pregnant: null, cooldown: 0,
    size: rand(0.94, 1.06), motherId: o.motherId ?? null, gen: o.gen ?? 1,
    spots, x: o.x, z: o.z, heading: rand(0, 6.28),
  };
}

const ANCHORED = new Set(['eat', 'drink', 'sleep', 'wheel', 'wheelIn', 'wheelOut', 'dying', 'birth', 'eatTreat', 'wait']);

export class Hamster {
  constructor(d) {
    this.d = d;
    this.m = buildModel(d);
    this.root = this.m.root;
    this.m.hit.userData.hamster = this;
    if (d.x === undefined) { const p = G.world.randomFree(); d.x = p.x; d.z = p.z; }
    this.pos = this.root.position; this.pos.set(d.x, 0, d.z);
    this.heading = d.heading || 0;
    this.state = 'idle'; this.t = rand(0.5, 2); this.move = null; this.detour = null;
    this.inHouse = false; this.claim = null;
    this.walkPhase = rand(0, 6); this.walkAmt = 0; this.time = rand(0, 100);
    this.blinkT = rand(1, 4); this.blink = 0;
    this.pose = { stand: 0, curl: 0, puff: 0, eyes: 1, happy: 0, look: 0, pitch: 0 };
    this.puffTimer = 0; this.petCount = 0; this.dropTimer = rand(100, 400);
    this.lookTarget = 0; this.groomPhase = 0; this.dieT = 0;
    // подпись с именем
    const el = document.createElement('div'); el.className = 'hlabel';
    this.labelEl = el; this.label = new CSS2DObject(el); this.label.position.set(0, 3.1, 0);
    this.root.add(this.label);
    G.scene.add(this.root);
    this.refreshLabel();
  }

  // ----- свойства -----
  get adult() { return this.d.age >= ADULT_DAYS; }
  get lifespan() { return LIFE_DAYS[G.settings.life] * this.d.lifeMul; }
  get old() { return G.settings.lifecycle && this.d.age > this.lifespan * 0.8; }
  get grow() { return clamp(this.d.age / ADULT_DAYS, 0, 1); }
  get scale() { return (0.45 + 0.55 * this.grow) * this.d.size * 1.3; }
  get radius() { return 1.0 * this.scale; }
  get anchored() { return ANCHORED.has(this.state) || this.inHouse; }
  stage() {
    if (this.d.age < 1.5) return 'малыш';
    if (!this.adult) return 'подросток';
    if (this.old) return 'старичок';
    return 'взрослый';
  }
  speed() { return (this.adult ? 3.3 : 2.6 + this.grow) * (this.old ? 0.7 : 1) * (this.d.pregnant ? 0.85 : 1); }

  refreshLabel() {
    const d = this.d;
    let icons = '';
    if (this.state === 'dying') icons = ' 🌈';
    else {
      if (d.age < 1.5) icons += ' 🍼';
      if (d.pregnant) icons += ' 💗';
      if (this.state === 'sleep') icons += ' 💤';
      if (d.hunger < 25) icons += ' 🍽️';
      if (d.thirst < 25) icons += ' 💧';
      if (d.health < 40) icons += ' 🤒';
    }
    const html = `${escapeHtml(d.name)} <span class="g-${d.gender}">${d.gender === 'f' ? '♀' : '♂'}</span>${icons}`;
    if (html !== this._lbl) { this.labelEl.innerHTML = html; this._lbl = html; }
    this.labelEl.classList.toggle('sel', G.selected === this);
  }

  // ----- движение -----
  goTo(x, z, cb, o = {}) {
    this.move = { x, z, cb, ignore: o.ignore, tol: o.tol ?? 0.35, mul: o.mul ?? 1, best: Infinity, timer: 0, stuck: 0, fail: o.fail };
    this.detour = null;
    this.state = o.state || 'walk';
  }
  steer(dt) {
    const m = this.move, p = this.pos;
    const tx = this.detour ? this.detour.x : m.x, tz = this.detour ? this.detour.z : m.z;
    const dx = tx - p.x, dz = tz - p.z, dist = Math.hypot(dx, dz);
    if (dist < (this.detour ? 0.7 : m.tol)) {
      if (this.detour) { this.detour = null; return false; }
      return true;
    }
    const want = Math.atan2(dx, dz), da = angDiff(this.heading, want);
    this.heading += clamp(da, -7 * dt, 7 * dt);
    const fwd = Math.max(0.12, Math.cos(da));
    const step = Math.min(this.speed() * m.mul * fwd * dt, dist);
    p.x += Math.sin(this.heading) * step; p.z += Math.cos(this.heading) * step;
    this.walkAmt = Math.min(1, this.walkAmt + dt * 6);
    this.walkPhase += step * 4.2 / this.scale;
    this.collide(m.ignore);
    // защита от застревания
    if (!this.detour) {
      m.timer += dt;
      if (dist < m.best - 0.25) { m.best = dist; m.timer = 0; }
      else if (m.timer > 1.4) {
        m.timer = 0; m.best = dist; m.stuck++;
        if (m.stuck > 5) return 'fail';
        const side = Math.random() < 0.5 ? -1 : 1, a = want + side * Math.PI / 2;
        this.detour = { x: clamp(p.x + Math.sin(a) * 4, -HALF_W + 1, HALF_W - 1), z: clamp(p.z + Math.cos(a) * 4, -HALF_D + 1, HALF_D - 1) };
      }
    }
    return false;
  }
  collide(ignore) {
    const p = this.pos, r = this.radius * 0.9;
    for (const o of G.world.obstacles) {
      if (o.id === ignore) continue;
      if (p.x > o.minX - r && p.x < o.maxX + r && p.z > o.minZ - r && p.z < o.maxZ + r) {
        const pl = p.x - (o.minX - r), pr = (o.maxX + r) - p.x, pb = p.z - (o.minZ - r), pf = (o.maxZ + r) - p.z;
        const mn = Math.min(pl, pr, pb, pf);
        if (mn === pl) p.x -= pl; else if (mn === pr) p.x += pr; else if (mn === pb) p.z -= pb; else p.z += pf;
      }
    }
    p.x = clamp(p.x, -HALF_W + r, HALF_W - r); p.z = clamp(p.z, -HALF_D + r, HALF_D - r);
  }

  release() {
    const W = G.world;
    W.bowl.slots.forEach(s => { if (s.occ === this) s.occ = null; });
    if (W.bottle.occ === this) W.bottle.occ = null;
    if (W.wheel.occ === this) W.wheel.occ = null;
    G.treats.forEach(t => { if (t.claim === this) t.claim = null; });
  }
  setState(s, dur) { this.state = s; this.t = dur; this.move = null; this.detour = null; }

  // ----- выбор занятия -----
  think() {
    const d = this.d, W = G.world;
    this.release();
    if (this.inHouse) return this.leaveHouse();
    const hour = (G.time / 60) % 24;
    const daytime = G.settings.daynight && hour > 8 && hour < 19;

    if (d.energy < 18 || (daytime && d.energy < 45 && Math.random() < 0.5) || (this.old && d.energy < 35)) return this.goSleep();
    if (d.thirst < 50 && G.water > 0.5) { if (this.tryDrink()) return; }
    if (d.hunger < 55 && G.food > 0.5) { if (this.tryEat()) return; }
    const treat = this.findTreat();
    if (treat && d.hunger < 95) return this.goTreat(treat);
    // малыши ходят за мамой
    if (d.age < 1.2 && Math.random() < 0.6) {
      const mom = G.hamsters.find(h => h.d.id === d.motherId && !h.inHouse && h.state !== 'dying');
      if (mom) { const p = G.world.randomFree(mom.pos, 2.5); return this.goTo(p.x, p.z, () => this.setState('idle', rand(1, 3)), { mul: 1.2 }); }
    }
    const acts = [
      ['wander', 30], ['sniff', 14], ['groom', 12], ['stand', 9], ['idle', 8],
      ['wheel', this.adult && d.energy > 35 && !W.wheel.occ ? (daytime ? 8 : 22) : 0],
      ['tunnel', 9], ['snack', d.hunger < 80 && G.food > 0.5 ? 6 : 0], ['drinkMore', d.thirst < 80 && G.water > 0.5 ? 5 : 0],
    ];
    let sum = acts.reduce((s, a) => s + a[1], 0), r = Math.random() * sum, act = 'wander';
    for (const [n, w] of acts) { if ((r -= w) < 0) { act = n; break; } }
    switch (act) {
      case 'wander': { const p = W.randomFree(Math.random() < 0.6 ? this.pos : null, 8); this.goTo(p.x, p.z, () => this.setState(Math.random() < 0.5 ? 'sniff' : 'idle', rand(1, 3))); break; }
      case 'sniff': this.setState('sniff', rand(2, 4)); break;
      case 'groom': this.setState('groom', rand(3, 5)); break;
      case 'stand': this.setState('stand', rand(2, 3.5)); if (Math.random() < 0.5) sfx.squeak(this.pitch()); break;
      case 'idle': this.setState('idle', rand(1.5, 4)); break;
      case 'wheel': this.goWheel(); break;
      case 'tunnel': this.goTunnel(); break;
      case 'snack': if (!this.tryEat()) this.setState('idle', 2); break;
      case 'drinkMore': if (!this.tryDrink()) this.setState('idle', 2); break;
    }
  }
  pitch() { return (this.adult ? 1 : 1.35) * rand(0.9, 1.1); }

  tryEat() {
    const W = G.world;
    const free = W.bowl.slots.filter(s => !s.occ);
    if (!free.length) return false;
    free.sort((a, b) => Math.hypot(a.x - this.pos.x, a.z - this.pos.z) - Math.hypot(b.x - this.pos.x, b.z - this.pos.z));
    const s = free[0]; s.occ = this;
    this.goTo(s.x, s.z, () => {
      this.faceTo(W.bowl.c.x, W.bowl.c.z);
      this.setState('eat', rand(5, 8)); s.occ = this;
    }, { fail: () => { s.occ = null; } });
    return true;
  }
  tryDrink() {
    const B = G.world.bottle;
    if (B.occ && B.occ !== this) return false;
    B.occ = this;
    this.goTo(B.point.x, B.point.z, () => { this.faceAngle = Math.PI; this.setState('drink', rand(3.5, 5.5)); B.occ = this; }, { fail: () => { B.occ = null; } });
    return true;
  }
  findTreat() {
    let best = null, bd = 1e9;
    for (const t of G.treats) {
      if (t.claim && t.claim !== this) continue;
      const dd = Math.hypot(t.x - this.pos.x, t.z - this.pos.z);
      if (dd < bd) { bd = dd; best = t; }
    }
    return best;
  }
  goTreat(t) {
    t.claim = this;
    this.goTo(t.x, t.z, () => {
      if (!G.treats.includes(t)) return this.setState('idle', 1);
      this.faceTo(t.x, t.z); this.setState('eatTreat', 2.5); this.treat = t;
    }, { tol: 1.1 * this.scale + 0.3, mul: 1.35, fail: () => { t.claim = null; } });
  }
  goSleep() {
    const W = G.world;
    if (Math.random() < 0.8) {
      this.goTo(W.house.door.x, W.house.door.z, () => {
        this.goTo(W.house.inside.x, W.house.inside.z, () => {
          this.inHouse = true; this.root.visible = false;
          this.setState('sleep', 999);
        }, { ignore: 'house', tol: 0.6 });
      });
    } else {
      const p = W.randomFree();
      this.goTo(p.x, p.z, () => this.setState('sleep', 999));
    }
  }
  leaveHouse() {
    const W = G.world;
    this.inHouse = false; this.root.visible = true;
    this.pos.set(W.house.inside.x, 0, W.house.inside.z); this.heading = 0;
    this.goTo(W.house.door.x, W.house.door.z + 1, () => this.setState('stand', 1.5), { ignore: 'house' });
  }
  goWheel() {
    const W = G.world.wheel;
    if (W.occ) return this.setState('idle', 1);
    W.occ = this;
    this.goTo(W.entry.x, W.entry.z, () => {
      this.from = { x: this.pos.x, z: this.pos.z };
      this.setState('wheelIn', 0.7); W.occ = this;
    }, { fail: () => { W.occ = null; } });
  }
  goTunnel() {
    const T = G.world.tunnel;
    const a = Math.hypot(T.a.x - this.pos.x, T.a.z - this.pos.z) < Math.hypot(T.b.x - this.pos.x, T.b.z - this.pos.z) ? T.a : T.b;
    const b = a === T.a ? T.b : T.a;
    this.goTo(a.x, a.z, () => {
      this.goTo(b.x, b.z, () => this.setState('sniff', 2), { ignore: 'tunnel', state: 'tunnel', mul: 1.2 });
    });
  }
  faceTo(x, z) { this.faceAngle = Math.atan2(x - this.pos.x, z - this.pos.z); }

  // ----- взаимодействие -----
  pet() {
    const d = this.d;
    d.happy = clamp(d.happy + 6, 0, 100);
    this.petCount++;
    V.set(this.pos.x, 2.6 * this.scale + (this.inHouse ? 4 : 0), this.pos.z);
    if (this.inHouse) { V.set(G.world.house.door.x, 6, G.world.house.door.z - 2); }
    fx.spawn('❤️', V, { size: 1.1, life: 1.3 });
    if (Math.random() < 0.35) sfx.squeak(this.pitch());
    if (this.state === 'sleep' || this.inHouse || this.state.startsWith('wheel') || this.state === 'dying' || this.state === 'birth') {
      this.pose.happy = 1; return;
    }
    if (this.state !== 'petted') { this.release(); this.setState('petted', 1.8); }
    else this.t = Math.max(this.t, 1.2);
  }
  feedTreatHere() { /* обрабатывается в main */ }

  // ----- главный тик симуляции -----
  update(dt, gm) {
    const d = this.d, S = G.settings;
    if (this.state === 'dying') return this.updateDying(dt);
    this.time += dt;

    // возраст и потребности
    d.age += gm / 1440;
    const hour = (G.time / 60) % 24, daytime = S.daynight && hour > 8 && hour < 19;
    const babyK = this.adult ? 1 : 0.7, pregK = d.pregnant ? 1.3 : 1;
    d.hunger -= 0.13 * gm * babyK * pregK;
    d.thirst -= 0.16 * gm * babyK;
    if (this.state === 'sleep') d.energy += 0.45 * gm;
    else d.energy -= 0.08 * gm * (daytime ? 1.4 : 1) * (this.old ? 1.3 : 1) * (this.state === 'wheel' ? 3 : 1);
    d.happy -= (0.025 + 0.004 * G.droppings.length + (d.hunger < 30 ? 0.05 : 0) + (d.thirst < 30 ? 0.05 : 0)) * gm;
    if (this.state === 'wheel') d.happy += 0.35 * gm;
    if (d.hunger < 10 || d.thirst < 10) d.health -= 0.12 * gm;
    else if (d.hunger > 40 && d.thirst > 40) d.health += 0.08 * gm;
    d.hunger = clamp(d.hunger, 0, 100); d.thirst = clamp(d.thirst, 0, 100); d.energy = clamp(d.energy, 0, 100);
    d.happy = clamp(d.happy, 0, 100); d.health = clamp(d.health, S.lifecycle ? 0 : 15, 100);
    if (d.cooldown > 0) d.cooldown -= gm / 1440;

    // беременность
    if (d.pregnant) {
      d.pregnant.p += gm / 1440;
      if (d.pregnant.p >= GESTATION_DAYS && this.state !== 'birth' && !this.state.startsWith('wheel')) {
        this.release(); this.setState('birth', 2.5);
        if (!this.inHouse) fx.burst('✨', V.set(this.pos.x, 1.5, this.pos.z), 6);
      }
    }
    // уход из жизни
    if (S.lifecycle && (d.age >= this.lifespan || d.health <= 0) && !this.state.startsWith('wheel')) {
      this.cause = d.health <= 0 ? 'sick' : 'old';
      return this.startDying();
    }

    // какашки :)
    if (!this.inHouse && !this.anchored && this.state !== 'tunnel') {
      this.dropTimer -= gm;
      if (this.dropTimer < 0) {
        this.dropTimer = rand(250, 600);
        if (G.droppings.length < 30) G.addDropping(this.pos.x - Math.sin(this.heading) * 1.3 * this.scale, this.pos.z - Math.cos(this.heading) * 1.3 * this.scale);
      }
    }

    // логика поведения
    if (this.move) {
      const r = this.steer(dt);
      if (r === true) { const cb = this.move.cb; this.move = null; this.walkAmt = 0; cb ? cb() : this.setState('idle', 1); }
      else if (r === 'fail') { const f = this.move.fail; this.move = null; f && f(); this.setState('idle', 1); }
      return;
    }
    this.walkAmt = Math.max(0, this.walkAmt - dt * 5);
    if (this.faceAngle !== undefined) {
      const da = angDiff(this.heading, this.faceAngle);
      this.heading += clamp(da, -6 * dt, 6 * dt);
      if (Math.abs(da) < 0.02) this.faceAngle = undefined;
    }
    this.t -= dt;
    const W = G.world;
    switch (this.state) {
      case 'eat':
        if (G.food <= 0) { G.toast(`${d.name}: мисочка пустая! 🌻`); this.t = 0; break; }
        d.hunger = clamp(d.hunger + 7 * dt, 0, 100); G.food = Math.max(0, G.food - (this.adult ? 0.75 : 0.4) * dt);
        this.crunchT = (this.crunchT || 0) - dt; if (this.crunchT < 0) { this.crunchT = rand(0.8, 1.6); sfx.crunch(); }
        if (d.hunger >= 99) this.t = Math.min(this.t, 0.5);
        break;
      case 'drink':
        if (G.water <= 0) { G.toast(`${d.name}: в поилке нет воды! 💧`); this.t = 0; break; }
        d.thirst = clamp(d.thirst + 11 * dt, 0, 100); G.water = Math.max(0, G.water - 0.9 * dt);
        this.sipT = (this.sipT || 0) - dt; if (this.sipT < 0) { this.sipT = rand(0.5, 0.9); sfx.sip(); fx.spawn('💧', W.bottle.tip, { size: 0.5, life: 0.7, vel: new THREE.Vector3(0, -1.5, 0) }); }
        if (d.thirst >= 99) this.t = Math.min(this.t, 0.4);
        break;
      case 'eatTreat':
        if (this.t <= 0 && this.treat) {
          G.removeTreat(this.treat); this.treat = null;
          d.hunger = clamp(d.hunger + 15, 0, 100); d.happy = clamp(d.happy + 12, 0, 100);
          this.puffTimer = 25; sfx.crunch(); fx.burst('✨', V.set(this.pos.x, 2.2 * this.scale, this.pos.z), 3, { size: 0.7 });
        }
        break;
      case 'sleep':
        this.zT = (this.zT || 0) - dt;
        if (this.zT < 0) {
          this.zT = rand(1.6, 2.6);
          if (this.inHouse) fx.spawn('💤', V.set(W.house.door.x + rand(-1, 1), 6.3, W.house.door.z - 2.5), { size: 1.1, life: 2.2, vel: new THREE.Vector3(0.3, 1.1, 0) });
          else fx.spawn('💤', V.set(this.pos.x, 2.2 * this.scale, this.pos.z), { size: 0.9, life: 2, vel: new THREE.Vector3(0.3, 1, 0) });
        }
        if (d.energy >= 99 || (d.hunger < 20 && G.food > 0) || (d.thirst < 20 && G.water > 0) || (d.pregnant && d.pregnant.p >= GESTATION_DAYS)) this.t = 0;
        break;
      case 'wheelIn': {
        const k = 1 - this.t / 0.7;
        this.pos.x = lerp(this.from.x, W.wheel.run.x, k); this.pos.z = lerp(this.from.z, W.wheel.run.z, k);
        this.pos.y = Math.sin(k * Math.PI) * 1.2 + W.wheel.run.y * k;
        this.heading += angDiff(this.heading, Math.PI / 2) * Math.min(1, dt * 8);
        if (this.t <= 0) { this.setState('wheel', rand(10, 24)); this.heading = Math.PI / 2; }
        return;
      }
      case 'wheel':
        this.pos.set(W.wheel.run.x, W.wheel.run.y, W.wheel.run.z); this.heading = Math.PI / 2;
        W.wheel.speed = 7.5; this.walkPhase += dt * 7.5 * 4.2; this.walkAmt = 1;
        if (d.energy < 15 || d.hunger < 20 || d.thirst < 20) this.t = Math.min(this.t, 0.2);
        if (this.t <= 0) { this.from = { x: W.wheel.entry.x, z: W.wheel.entry.z }; this.setState('wheelOut', 0.7); }
        return;
      case 'wheelOut': {
        const k = 1 - this.t / 0.7;
        this.pos.x = lerp(W.wheel.run.x, this.from.x, k); this.pos.z = lerp(W.wheel.run.z, this.from.z, k);
        this.pos.y = Math.sin(k * Math.PI) * 1.2 + W.wheel.run.y * (1 - k);
        if (this.t <= 0) { this.pos.y = 0; this.heading = 0; W.wheel.occ = null; this.setState('stand', 1.2); }
        return;
      }
      case 'birth':
        if (this.t <= 0) { G.onBirth(this); d.pregnant = null; d.cooldown = BIRTH_COOLDOWN; this.setState('idle', 2); }
        return;
      case 'petted':
        this.pose.happy = 1;
        break;
      case 'meet': {
        const p = this.partner;
        if (!p || p.state === 'dying' || p.inHouse) { this.state = 'idle'; this.t = 1; this.partner = null; break; }
        const dd = Math.hypot(p.pos.x - this.pos.x, p.pos.z - this.pos.z);
        if (dd < 2.6) {
          G.onMate(this, p); this.partner = null; this.setState('idle', 2);
        } else this.goTo(p.pos.x, p.pos.z, () => { this.state = 'meet'; this.t = 3; }, { tol: 2.4, state: 'walk', mul: 1.2, fail: () => { this.partner = null; } });
        return;
      }
      case 'wait':
        if (!this.partnerOf || this.partnerOf.partner !== this) this.t = Math.min(this.t, 0.5);
        break;
    }
    if (this.t <= 0) this.think();
  }

  startDying() {
    this.release();
    if (this.inHouse) { this.inHouse = false; this.root.visible = true; this.pos.set(G.world.house.door.x, 0, G.world.house.door.z); }
    if (this.state.startsWith('wheel')) { this.pos.y = 0; }
    this.state = 'dying'; this.move = null; this.dieT = 0;
    this.refreshLabel();
  }
  updateDying(dt) {
    this.dieT += dt;
    if (this.dieT > 3 && !this._sparkled) { this._sparkled = true; sfx.soft(); fx.burst('✨', V.set(this.pos.x, 1.5, this.pos.z), 10, { life: 2.2 }); fx.spawn('🌈', V.set(this.pos.x, 3, this.pos.z), { size: 3, life: 3, vel: new THREE.Vector3(0, 1.2, 0) }); }
    if (this.dieT > 6) G.onHamsterGone(this);
  }

  // ----- анимация (раз в кадр) -----
  animate(dt) {
    if (!this.root.visible) return;
    const m = this.m, P = this.pose, d = this.d, st = this.state;
    const sleeping = st === 'sleep' || st === 'dying';
    const tStand = (st === 'drink' || st === 'stand') ? 1 : st === 'groom' ? 0.75 : st === 'eat' || st === 'eatTreat' ? 0.35 : 0;
    const k = Math.min(1, dt * 6);
    P.stand = lerp(P.stand, tStand, k);
    P.curl = lerp(P.curl, sleeping ? 1 : 0, Math.min(1, dt * 3));
    const puffT = st === 'eat' ? 0.45 + 0.25 * Math.sin(this.time * 2) : (this.puffTimer > 0 ? 1 : 0);
    this.puffTimer -= dt;
    P.puff = lerp(P.puff, puffT, k);
    P.happy = Math.max(0, P.happy - dt * (st === 'petted' ? 0 : 0.8));

    // моргание
    this.blinkT -= dt;
    if (this.blinkT < 0) { this.blink = 0.14; this.blinkT = rand(2, 5); }
    this.blink -= dt;
    let eyesOpen = this.blink > 0 ? 0.1 : 1;
    if (sleeping) eyesOpen = 0.08; else if (P.happy > 0.3) eyesOpen = 0.3;
    P.eyes = lerp(P.eyes, eyesOpen, Math.min(1, dt * 20));

    // взгляд
    if (st === 'sniff' || st === 'stand') {
      if (Math.random() < dt * 0.9) this.lookTarget = rand(-0.7, 0.7);
    } else this.lookTarget = 0;
    P.look = lerp(P.look, this.lookTarget, Math.min(1, dt * 4));
    let tPitch = 0;
    if (st === 'eat' || st === 'eatTreat') tPitch = 0.35 + Math.sin(this.time * 9) * 0.08;
    else if (st === 'drink') tPitch = -0.45 + Math.sin(this.time * 6) * 0.05;
    else if (st === 'sniff') tPitch = 0.3 + Math.sin(this.time * 3) * 0.1;
    else if (st === 'stand') tPitch = -0.2;
    P.pitch = lerp(P.pitch, tPitch, Math.min(1, dt * 6));

    // поза
    const s = this.scale;
    const pregK = d.pregnant ? Math.min(1, d.pregnant.p / GESTATION_DAYS) : 0;
    this.root.scale.setScalar(s);
    this.root.rotation.y = this.heading;
    const breathe = Math.sin(this.time * (sleeping ? 2.2 : 5)) * (sleeping ? 0.035 : 0.02);
    const bob = Math.abs(Math.sin(this.walkPhase)) * 0.09 * this.walkAmt;
    m.body.position.set(0, bob + P.stand * 0.62 - P.curl * 0.1, -P.stand * 0.2);
    m.body.rotation.set(-P.stand * 0.95, 0, (P.happy > 0.3 ? Math.sin(this.time * 14) * 0.06 : 0) + this.walkAmt * Math.sin(this.walkPhase) * 0.03);
    m.bodyMesh.scale.set((1 + P.curl * 0.08) * (1 + pregK * 0.22), (0.84 - P.curl * 0.12) * (1 + breathe) * (1 + pregK * 0.06), 1.3 - P.curl * 0.12);
    m.head.position.set(0, 1.35 - P.curl * 0.32, 1.02 - P.curl * 0.1);
    m.head.rotation.set(P.pitch + P.curl * 0.35, P.look, st === 'groom' ? Math.sin(this.time * 5) * 0.15 : 0);
    // нос шевелится
    const nk = sleeping ? 0 : 1;
    m.nose.scale.set(0.11, 0.08 * (1 + Math.sin(this.time * 24) * 0.25 * nk), 0.08);
    m.cheeks.forEach(c => c.scale.setScalar(0.36 * (1 + P.puff * 0.65)));
    const eyeBig = 1 + (1 - this.grow) * 0.35;
    m.eyes.forEach(e => e.scale.set(eyeBig, eyeBig * P.eyes, eyeBig));
    m.ears.forEach((e, i) => { e.rotation.x = -0.2 + (P.happy > 0.3 ? Math.sin(this.time * 12 + i) * 0.15 : 0) + P.curl * 0.3; });
    // лапки
    const ph = this.walkPhase, wa = this.walkAmt;
    m.feet[0].position.z = -0.7 + Math.sin(ph) * 0.22 * wa; m.feet[1].position.z = -0.7 + Math.sin(ph + Math.PI) * 0.22 * wa;
    m.feet[0].position.y = 0.1 + Math.max(0, Math.cos(ph)) * 0.1 * wa; m.feet[1].position.y = 0.1 + Math.max(0, -Math.cos(ph)) * 0.1 * wa;
    let pz = 1.22, py = 0.17;
    if (st === 'groom') { this.groomPhase += dt * 9; pz = 1.45; py = 1.0 + Math.sin(this.groomPhase) * 0.18; }
    else if (st === 'eat' || st === 'eatTreat') { pz = 1.35; py = 0.5 + Math.sin(this.time * 9) * 0.06; }
    m.paws[0].position.set(-0.36, py + Math.sin(ph + Math.PI) * 0.06 * wa, pz + Math.sin(ph + Math.PI) * 0.16 * wa);
    m.paws[1].position.set(0.36, py + Math.sin(ph) * 0.06 * wa, pz + Math.sin(ph) * 0.16 * wa);
    m.tail.rotation.y = Math.sin(this.time * 3) * 0.3;

    if (st === 'dying') {
      const k2 = clamp((this.dieT - 3) / 3, 0, 1);
      this.root.scale.setScalar(s * (1 - k2 * 0.9));
      this.pos.y = k2 * 3;
    } else if (!st.startsWith('wheel')) this.pos.y = 0;

    this.label.visible = G.settings.labels && this.root.visible;
  }

  dispose() {
    G.scene.remove(this.root);
    this.label.element.remove();
    this.m.mats.forEach(m => m.dispose()); this.m.geos.forEach(g => g.dispose());
  }
}

export function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
export { pick };
