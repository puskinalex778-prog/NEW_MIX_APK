import * as THREE from 'three';

// Простая система частиц на спрайтах-эмодзи: сердечки, Zzz, искорки, капли
const cache = {};
function emojiTex(e) {
  if (cache[e]) return cache[e];
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d');
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = '100px "Noto Color Emoji","Apple Color Emoji","Segoe UI Emoji",sans-serif';
  g.fillText(e, 64, 70);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return (cache[e] = t);
}

export const fx = {
  scene: null, list: [],
  init(scene) { this.scene = scene; },
  spawn(emoji, pos, o = {}) {
    const m = new THREE.SpriteMaterial({ map: emojiTex(emoji), transparent: true, depthWrite: false });
    const s = new THREE.Sprite(m);
    const size = o.size ?? 1.2;
    s.scale.setScalar(size);
    s.position.copy(pos);
    s.renderOrder = 10;
    this.scene.add(s);
    this.list.push({
      s, life: o.life ?? 1.6, t: 0, size,
      v: o.vel ? o.vel.clone() : new THREE.Vector3((Math.random() - .5) * 1.2, 2 + Math.random(), (Math.random() - .5) * 1.2),
      grav: o.grav ?? 0, grow: o.grow ?? 0.3, wobble: Math.random() * 6,
    });
  },
  burst(emoji, pos, n = 6, o = {}) { for (let i = 0; i < n; i++) this.spawn(emoji, pos, o); },
  update(dt) {
    for (let i = this.list.length - 1; i >= 0; i--) {
      const p = this.list[i];
      p.t += dt;
      const k = p.t / p.life;
      if (k >= 1) { this.scene.remove(p.s); p.s.material.dispose(); this.list.splice(i, 1); continue; }
      p.v.y -= p.grav * dt;
      p.s.position.addScaledVector(p.v, dt);
      p.s.position.x += Math.sin(p.t * 4 + p.wobble) * dt * 0.4;
      p.s.material.opacity = k < 0.15 ? k / 0.15 : 1 - Math.max(0, (k - 0.6) / 0.4);
      p.s.scale.setScalar(p.size * (1 + p.grow * k));
    }
  },
};
