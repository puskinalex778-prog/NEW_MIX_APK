import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

// Размер пола клетки: x ∈ [-17, 17], z ∈ [-11, 11]
export const HALF_W = 17, HALF_D = 11;

const rnd = (a, b) => a + Math.random() * (b - a);

function canvasTex(w, h, draw, repeat) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  if (repeat) t.repeat.set(repeat[0], repeat[1]);
  t.anisotropy = 4;
  return t;
}

function woodTex(base, line, repeat) {
  return canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 60; i++) {
      g.strokeStyle = line; g.globalAlpha = rnd(0.08, 0.25); g.lineWidth = rnd(1, 3);
      g.beginPath(); const y = rnd(0, h); g.moveTo(0, y);
      for (let x = 0; x <= w; x += 16) g.lineTo(x, y + Math.sin(x * 0.03 + i) * rnd(1, 4));
      g.stroke();
    }
    g.globalAlpha = 1;
  }, repeat);
}

function std(color, o = {}) { return new THREE.MeshStandardMaterial({ color, roughness: 0.8, ...o }); }

export function buildWorld(scene) {
  const W = { obstacles: [] };
  const shadowy = (m) => { m.castShadow = true; m.receiveShadow = true; return m; };

  // ---------- комната ----------
  const tableMat = std(0xffffff, { map: woodTex('#a8714a', '#5b361d', [6, 4]), roughness: 0.7 });
  const table = new THREE.Mesh(new THREE.BoxGeometry(160, 2, 110), tableMat);
  table.position.y = -1.6; table.receiveShadow = true; scene.add(table);

  const wallTex = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#ffe9d1'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#ffd3b0';
    for (let y = 0; y < h; y += 64) for (let x = 0; x < w; x += 64) {
      g.beginPath(); g.arc(x + ((y / 64) % 2) * 32 + 16, y + 16, 7, 0, Math.PI * 2); g.fill();
    }
  }, [10, 6]);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(260, 120), std(0xffffff, { map: wallTex, roughness: 1 }));
  wall.position.set(0, 40, -55); scene.add(wall);

  // окно
  W.skyMat = new THREE.MeshBasicMaterial({ color: 0x9fd8ff });
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(30, 20), W.skyMat);
  sky.position.set(-28, 30, -54.8); scene.add(sky);
  const frameMat = std(0xffffff);
  [[0, 10.5, 32, 1.2], [0, -10.5, 32, 1.2], [-15.5, 0, 1.2, 22], [15.5, 0, 1.2, 22], [0, 0, 0.8, 20], [0, 0, 30, 0.8]]
    .forEach(([x, y, w, h]) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, 1), frameMat); b.position.set(-28 + x, 30 + y, -54.4); scene.add(b); });
  // звёзды за окном (ночью)
  const starGeo = new THREE.BufferGeometry();
  const sp = []; for (let i = 0; i < 40; i++) sp.push(-28 + rnd(-14, 14), 30 + rnd(-9, 9), -54.7);
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
  W.stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.5, transparent: true, opacity: 0 }));
  scene.add(W.stars);
  // луна / солнце
  W.sunDisc = new THREE.Mesh(new THREE.CircleGeometry(2.4, 32), new THREE.MeshBasicMaterial({ color: 0xfff3b0 }));
  W.sunDisc.position.set(-20, 34, -54.6); scene.add(W.sunDisc);

  // ---------- клетка: поддон ----------
  const trayMat = std(0x6cc6c0, { roughness: 0.45 });
  const base = new THREE.Mesh(new RoundedBoxGeometry(HALF_W * 2 + 1.6, 0.8, HALF_D * 2 + 1.6, 3, 0.3), trayMat);
  base.position.y = -0.4; base.receiveShadow = true; scene.add(base);
  const wallH = 3.2;
  const tw = (w, d, x, z, mat) => { const m = new THREE.Mesh(new RoundedBoxGeometry(w, wallH, d, 3, 0.18), mat); m.position.set(x, wallH / 2 - 0.4, z); shadowy(m); scene.add(m); return m; };
  tw(HALF_W * 2 + 1.6, 0.5, 0, -HALF_D - 0.55, trayMat);
  tw(0.5, HALF_D * 2 + 1.6, -HALF_W - 0.55, 0, trayMat);
  tw(0.5, HALF_D * 2 + 1.6, HALF_W + 0.55, 0, trayMat);
  const front = tw(HALF_W * 2 + 1.6, 0.5, 0, HALF_D + 0.55, new THREE.MeshStandardMaterial({ color: 0x9fe3de, transparent: true, opacity: 0.45, roughness: 0.2 }));
  front.castShadow = false;

  // опилки
  const beddingTex = canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = '#e8cc96'; g.fillRect(0, 0, w, h);
    const cols = ['#f4dfb3', '#d9b57a', '#f9ebc9', '#cfa565', '#efd4a0'];
    for (let i = 0; i < 2600; i++) {
      g.save(); g.translate(rnd(0, w), rnd(0, h)); g.rotate(rnd(0, Math.PI));
      g.fillStyle = cols[i % cols.length]; g.globalAlpha = rnd(0.5, 1);
      g.beginPath(); g.ellipse(0, 0, rnd(4, 12), rnd(1.5, 4), 0, 0, Math.PI * 2); g.fill(); g.restore();
    }
  }, [3, 2]);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(HALF_W * 2 + 0.6, HALF_D * 2 + 0.6), std(0xffffff, { map: beddingTex, roughness: 1 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = 0.01; floor.receiveShadow = true; scene.add(floor);
  W.floor = floor;

  // объёмные стружки
  const N = 1500;
  const shav = new THREE.InstancedMesh(new THREE.BoxGeometry(0.42, 0.05, 0.14), std(0xffffff, { roughness: 1 }), N);
  const dummy = new THREE.Object3D(); const col = new THREE.Color();
  const shCols = ['#f4dfb3', '#dcb77c', '#f9ebc9', '#cfa565'];
  for (let i = 0; i < N; i++) {
    dummy.position.set(rnd(-HALF_W, HALF_W), rnd(0.03, 0.12), rnd(-HALF_D, HALF_D));
    dummy.rotation.set(rnd(-.4, .4), rnd(0, Math.PI), rnd(-.4, .4));
    const s = rnd(0.7, 1.5); dummy.scale.set(s, 1, s);
    dummy.updateMatrix(); shav.setMatrixAt(i, dummy.matrix);
    shav.setColorAt(i, col.set(shCols[i % 4]));
  }
  shav.receiveShadow = true; scene.add(shav);

  // прутья
  const barH = 10, barY0 = wallH - 0.4;
  const barMat = std(0xeeeeee, { metalness: 0.6, roughness: 0.35 });
  const barPos = [];
  for (let x = -HALF_W - 0.55; x <= HALF_W + 0.56; x += 1.15) barPos.push([x, -HALF_D - 0.55]); // спереди прутьев нет — так лучше видно хомячков
  for (let z = -HALF_D - 0.55 + 1.15; z < HALF_D + 0.55; z += 1.15) { barPos.push([-HALF_W - 0.55, z]); barPos.push([HALF_W + 0.55, z]); }
  const bars = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.06, 0.06, barH, 6), barMat, barPos.length);
  barPos.forEach(([x, z], i) => { dummy.position.set(x, barY0 + barH / 2, z); dummy.rotation.set(0, 0, 0); dummy.scale.set(1, 1, 1); dummy.updateMatrix(); bars.setMatrixAt(i, dummy.matrix); });
  bars.castShadow = true; scene.add(bars);
  // верхняя рамка
  const railMat = std(0xffffff, { metalness: 0.5, roughness: 0.3 });
  [[0, -HALF_D - 0.55, HALF_W * 2 + 1.2, 0.2], [-HALF_W - 0.55, 0, 0.2, HALF_D * 2 + 1.2], [HALF_W + 0.55, 0, 0.2, HALF_D * 2 + 1.2]].map(([x, z, w, d]) => d > 1 ? [x, z - 0.0, w, d] : [x, z, w, d])
    .forEach(([x, z, w, d]) => { const r = new THREE.Mesh(new THREE.BoxGeometry(w, 0.25, d), railMat); r.position.set(x, barY0 + barH, z); scene.add(r); });

  // ---------- домик ----------
  const house = new THREE.Group(); house.position.set(-11, 0, -6.5);
  const hw = 7, hh = 4.2, hd = 5;
  const houseMat = std(0xffffff, { map: woodTex('#e3ac6c', '#8c5a2b', [1, 1]) });
  const body = shadowy(new THREE.Mesh(new RoundedBoxGeometry(hw, hh, hd, 3, 0.25), houseMat));
  body.position.y = hh / 2; house.add(body);
  // фронтон
  const tri = new THREE.Shape(); tri.moveTo(-hw / 2, 0); tri.lineTo(hw / 2, 0); tri.lineTo(0, 1.9); tri.lineTo(-hw / 2, 0);
  const gable = shadowy(new THREE.Mesh(new THREE.ExtrudeGeometry(tri, { depth: hd - 0.4, bevelEnabled: false }), houseMat));
  gable.position.set(0, hh, -(hd - 0.4) / 2); house.add(gable);
  const roofMat = std(0xe8604f, { roughness: 0.6 });
  const th = Math.atan2(1.9, hw / 2), L = Math.hypot(hw / 2, 1.9) + 0.7;
  // скат крыши вдоль x (гребень параллелен оси z)
  for (const s of [-1, 1]) {
    const r = shadowy(new THREE.Mesh(new RoundedBoxGeometry(L, 0.35, hd + 0.9, 2, 0.12), roofMat));
    r.position.set(s * (Math.cos(th) * L / 2 - 0.35), hh + 1.9 - Math.sin(th) * L / 2 + 0.2, 0);
    r.rotation.z = -s * th;
    house.add(r);
  }
  const doorMat = new THREE.MeshBasicMaterial({ color: 0x2b1a0e });
  const door = new THREE.Mesh(new THREE.CircleGeometry(1.35, 32), doorMat);
  door.position.set(0, 1.35, hd / 2 + 0.01); house.add(door);
  const doorRim = new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.16, 8, 32), std(0xb9773a));
  doorRim.position.copy(door.position); house.add(doorRim);
  const win = new THREE.Mesh(new THREE.CircleGeometry(0.55, 24), new THREE.MeshBasicMaterial({ color: 0x3a2414 }));
  win.position.set(-2.2, 2.7, hd / 2 + 0.01); house.add(win);
  const win2 = win.clone(); win2.position.x = 2.2; house.add(win2);
  // табличка-сердечко
  scene.add(house);
  W.house = {
    group: house, door: { x: -11, z: -6.5 + hd / 2 + 1.3 }, inside: { x: -11, z: -6.8 },
    label: null,
  };
  const hl = document.createElement('div'); hl.className = 'houselabel';
  W.house.label = new CSS2DObject(hl); W.house.label.position.set(0, 7.6, 0); house.add(W.house.label);
  W.obstacles.push({ id: 'house', minX: -11 - hw / 2 - 0.2, maxX: -11 + hw / 2 + 0.2, minZ: -6.5 - hd / 2 - 0.2, maxZ: -6.5 + hd / 2 + 0.1 });

  // ---------- колесо ----------
  const wheel = new THREE.Group(); wheel.position.set(11, 0, -6.5);
  const wheelMat = std(0xb48cf0, { roughness: 0.4 });
  const standMat = std(0x8a62d6, { roughness: 0.4 });
  const plate = shadowy(new THREE.Mesh(new RoundedBoxGeometry(4.5, 0.35, 1.6, 2, 0.12), standMat));
  plate.position.set(0, 0.18, -1.9); wheel.add(plate);
  const post = shadowy(new THREE.Mesh(new RoundedBoxGeometry(1, 5.4, 0.7, 2, 0.2), standMat));
  post.position.set(0, 2.8, -1.9); wheel.add(post);
  const spin = new THREE.Group(); spin.position.set(0, 5.2, 0); wheel.add(spin);
  const R = 4.6;
  const disc = shadowy(new THREE.Mesh(new THREE.CylinderGeometry(R + 0.1, R + 0.1, 0.18, 48), wheelMat));
  disc.rotation.x = Math.PI / 2; disc.position.z = -1.35; spin.add(disc);
  for (const z of [-1.3, 1.3]) {
    const ring = shadowy(new THREE.Mesh(new THREE.TorusGeometry(R, 0.2, 10, 64), wheelMat));
    ring.position.z = z; spin.add(ring);
  }
  // узор на диске
  for (let i = 0; i < 6; i++) {
    const dot = new THREE.Mesh(new THREE.CircleGeometry(0.6, 20), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 }));
    const a = i / 6 * Math.PI * 2; dot.position.set(Math.cos(a) * 2.6, Math.sin(a) * 2.6, -1.25); spin.add(dot);
  }
  const rungN = 40;
  const rungs = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.08, 0.08, 2.6, 6), std(0xf2f2f2, { metalness: .4, roughness: .4 }), rungN);
  for (let i = 0; i < rungN; i++) {
    const a = i / rungN * Math.PI * 2;
    dummy.position.set(Math.cos(a) * (R - 0.05), Math.sin(a) * (R - 0.05), 0); dummy.rotation.set(Math.PI / 2, 0, 0); dummy.scale.set(1, 1, 1);
    dummy.updateMatrix(); rungs.setMatrixAt(i, dummy.matrix);
  }
  rungs.castShadow = true; spin.add(rungs);
  scene.add(wheel);
  W.wheel = { group: wheel, spin, occ: null, speed: 0, entry: { x: 11, z: -2.6 }, run: { x: 11, y: 5.2 - R + 0.12, z: -6.5 } };
  W.obstacles.push({ id: 'wheel', minX: 11 - R - 0.3, maxX: 11 + R + 0.3, minZ: -6.5 - 2.4, maxZ: -6.5 + 1.6 });

  // ---------- мисочка ----------
  const bowlC = { x: 3, z: 4.5 };
  const prof = [[0, 0], [2.0, 0], [2.35, 0.3], [2.55, 1.1], [2.4, 1.22], [2.15, 0.6], [1.9, 0.4], [0, 0.4]].map(([x, y]) => new THREE.Vector2(x, y));
  const bowl = shadowy(new THREE.Mesh(new THREE.LatheGeometry(prof, 40), std(0xff8fab, { roughness: 0.35 })));
  bowl.position.set(bowlC.x, 0, bowlC.z); scene.add(bowl);
  const SEEDS = 90;
  const seedGeo = new THREE.SphereGeometry(0.2, 8, 6); seedGeo.scale(0.65, 0.45, 1.1);
  const seeds = new THREE.InstancedMesh(seedGeo, std(0xffffff, { roughness: 0.7 }), SEEDS);
  const seedCols = ['#3c3935', '#c99b5a', '#9bbf5a', '#f2c94c', '#e7dcc6', '#3c3935', '#d4884a'];
  const seedList = [];
  for (let i = 0; i < SEEDS; i++) {
    const r = Math.sqrt(Math.random()) * 1.85, a = rnd(0, Math.PI * 2);
    const y = 0.45 + (1 - (r / 1.95) ** 2) * rnd(0.05, 0.7);
    seedList.push({ x: Math.cos(a) * r, y, z: Math.sin(a) * r, c: seedCols[i % seedCols.length] });
  }
  seedList.sort((a, b) => a.y - b.y);
  seedList.forEach((s, i) => {
    dummy.position.set(bowlC.x + s.x, s.y, bowlC.z + s.z); dummy.rotation.set(rnd(-1, 1), rnd(0, 6), rnd(-1, 1)); dummy.scale.set(1, 1, 1);
    dummy.updateMatrix(); seeds.setMatrixAt(i, dummy.matrix); seeds.setColorAt(i, col.set(s.c));
  });
  seeds.castShadow = true; scene.add(seeds);
  W.bowl = {
    mesh: bowl, seeds, c: bowlC,
    slots: [0, 1, 2, 3, 4].map(i => { const a = i / 5 * Math.PI * 2 + 0.3; return { x: bowlC.x + Math.sin(a) * 3.8, z: bowlC.z + Math.cos(a) * 3.8, occ: null }; }),
  };
  W.obstacles.push({ id: 'bowl', minX: bowlC.x - 2.6, maxX: bowlC.x + 2.6, minZ: bowlC.z - 2.6, maxZ: bowlC.z + 2.6 });
  W.setFood = (lvl) => { seeds.count = Math.round(Math.max(0, Math.min(100, lvl)) / 100 * SEEDS); };

  // ---------- поилка ----------
  const bx = -1, bz = -HALF_D - 1.3;
  const bottle = new THREE.Group(); bottle.position.set(bx, 0, bz);
  const glass = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 6, 28, 1, true), new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.28, roughness: 0.05, side: THREE.DoubleSide }));
  glass.position.y = 9.5; bottle.add(glass);
  const topCap = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.3, roughness: 0.05 }));
  topCap.position.y = 12.5; bottle.add(topCap);
  const waterMat = new THREE.MeshStandardMaterial({ color: 0x4fb3ff, transparent: true, opacity: 0.75, roughness: 0.1 });
  const waterMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 1, 24), waterMat);
  bottle.add(waterMesh);
  const cap = shadowy(new THREE.Mesh(new THREE.CylinderGeometry(0.85, 1.0, 0.8, 24), std(0x5ccf7b, { roughness: 0.4 })));
  cap.position.y = 6.2; bottle.add(cap);
  const spout = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 4.2, 10), std(0xdddddd, { metalness: .8, roughness: .25 }));
  spout.position.set(0, 4.5, 1.25); spout.rotation.x = 0.62; bottle.add(spout);
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.17, 12, 8), std(0xcccccc, { metalness: .9, roughness: .2 }));
  ball.position.set(0, 2.75, 2.45); bottle.add(ball);
  const holder = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.3, 1.2), std(0x5ccf7b));
  holder.position.set(0, 8.5, 0.6); bottle.add(holder);
  scene.add(bottle);
  W.bottle = { group: bottle, occ: null, point: { x: bx, z: -HALF_D + 1.7 }, tip: new THREE.Vector3(bx, 2.75, bz + 2.45) };
  W.setWater = (lvl) => {
    const k = Math.max(0.001, Math.min(100, lvl) / 100);
    waterMesh.scale.y = 5.8 * k; waterMesh.position.y = 6.6 + 5.8 * k / 2; waterMesh.visible = lvl > 0.5;
  };

  // ---------- тоннель ----------
  const tunnelMat = new THREE.MeshStandardMaterial({ color: 0x7fd88f, transparent: true, opacity: 0.5, roughness: 0.3, side: THREE.DoubleSide, depthWrite: false });
  const tunnel = new THREE.Mesh(new THREE.CylinderGeometry(1.75, 1.75, 8, 28, 1, true), tunnelMat);
  tunnel.rotation.z = Math.PI / 2; tunnel.position.set(-9, 1.15, 6.5); scene.add(tunnel);
  for (const x of [-13, -5]) {
    const rim = new THREE.Mesh(new THREE.TorusGeometry(1.75, 0.18, 8, 28), std(0x45b75e, { roughness: 0.4 }));
    rim.rotation.y = Math.PI / 2; rim.position.set(x, 1.15, 6.5); rim.castShadow = true; scene.add(rim);
  }
  W.tunnel = { a: { x: -14.6, z: 6.5 }, b: { x: -3.4, z: 6.5 } };
  W.obstacles.push({ id: 'tunnel', minX: -13.2, maxX: -4.8, minZ: 4.6, maxZ: 8.4 });

  // ---------- бревнышко-грызлка ----------
  const log = shadowy(new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 5, 16), std(0x8b5a2b, { map: woodTex('#9a6534', '#4a2b12', [1, 2]) })));
  log.rotation.z = Math.PI / 2; log.position.set(11.5, 0.75, 6.2); scene.add(log);
  for (const x of [9, 14]) {
    const end = new THREE.Mesh(new THREE.CircleGeometry(0.85, 16), std(0xd8b07a));
    end.rotation.y = x < 11 ? -Math.PI / 2 : Math.PI / 2; end.position.set(x + (x < 11 ? -0.01 : 0.01), 0.75, 6.2); scene.add(end);
  }
  W.obstacles.push({ id: 'log', minX: 8.8, maxX: 14.2, minZ: 5.3, maxZ: 7.1 });

  // кучка сена в углу
  const hay = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.03, 0.03, 1.6, 4), std(0xd9c56a, { roughness: 1 }), 160);
  for (let i = 0; i < 160; i++) {
    const r = Math.sqrt(Math.random()) * 1.8, a = rnd(0, 6.28);
    dummy.position.set(15 + Math.cos(a) * r - 0.5, rnd(0.1, 0.5), 9.2 + Math.sin(a) * r - 0.5);
    dummy.rotation.set(rnd(0, 3), rnd(0, 3), Math.PI / 2 + rnd(-0.5, 0.5)); dummy.scale.set(1, 1, 1);
    dummy.updateMatrix(); hay.setMatrixAt(i, dummy.matrix);
  }
  hay.castShadow = true; scene.add(hay);

  // ---------- свет ----------
  W.hemi = new THREE.HemisphereLight(0xfff4e6, 0x8a6a4a, 1.0); scene.add(W.hemi);
  W.sun = new THREE.DirectionalLight(0xfff1d6, 2.6);
  W.sun.position.set(18, 40, 20); W.sun.castShadow = true;
  W.sun.shadow.mapSize.set(1536, 1536);
  Object.assign(W.sun.shadow.camera, { left: -26, right: 26, top: 22, bottom: -22, near: 5, far: 90 });
  W.sun.shadow.bias = -0.0008; W.sun.shadow.normalBias = 0.03;
  scene.add(W.sun);
  W.lamp = new THREE.PointLight(0xffc27a, 0, 0, 2); W.lamp.position.set(0, 20, 6); scene.add(W.lamp);

  const cDay = new THREE.Color('#f3dfc6'), cNight = new THREE.Color('#252b4a');
  const skyDay = new THREE.Color('#9fd8ff'), skyNight = new THREE.Color('#141b3d');
  const sunDay = new THREE.Color('#fff1d6'), sunNight = new THREE.Color('#8fa6ff');
  const hemiDay = new THREE.Color('#fff4e6'), hemiNight = new THREE.Color('#7d88c9');
  W.updateLighting = (day /* 0..1 */) => {
    scene.background.copy(cNight).lerp(cDay, day);
    scene.fog.color.copy(scene.background);
    W.skyMat.color.copy(skyNight).lerp(skyDay, day);
    W.sun.intensity = 0.5 + 2.1 * day;
    W.sun.color.copy(sunNight).lerp(sunDay, day);
    W.hemi.intensity = 0.45 + 0.55 * day;
    W.hemi.color.copy(hemiNight).lerp(hemiDay, day);
    W.lamp.intensity = 420 * (1 - day);
    W.stars.material.opacity = 1 - day;
    W.sunDisc.material.color.set(day > 0.5 ? 0xfff3b0 : 0xf3f6ff);
    W.sunDisc.position.y = 30 + 6 * Math.abs(day - 0.5);
  };

  // точки на полу, где нет препятствий
  W.isFree = (x, z, m = 1.2) => {
    if (Math.abs(x) > HALF_W - m || Math.abs(z) > HALF_D - m) return false;
    for (const o of W.obstacles) if (x > o.minX - m && x < o.maxX + m && z > o.minZ - m && z < o.maxZ + m) return false;
    return true;
  };
  W.randomFree = (near, radius = 6) => {
    for (let i = 0; i < 40; i++) {
      const x = near ? near.x + rnd(-radius, radius) : rnd(-HALF_W + 1.5, HALF_W - 1.5);
      const z = near ? near.z + rnd(-radius, radius) : rnd(-HALF_D + 1.5, HALF_D - 1.5);
      if (W.isFree(x, z)) return { x, z };
    }
    return { x: rnd(-3, 3), z: rnd(-1, 2) };
  };
  return W;
}
