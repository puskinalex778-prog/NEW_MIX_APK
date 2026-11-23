(function (root) {
  'use strict';

  function noise(x, z) {
    const n = Math.sin(x * 127.1 + z * 311.7) * 43758.5453;
    return n - Math.floor(n);
  }

  function roundedRectShape(w, h, r) {
    const s = new THREE.Shape();
    const x = -w / 2;
    const y = -h / 2;
    s.moveTo(x + r, y);
    s.lineTo(x + w - r, y);
    s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r);
    s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h);
    s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r);
    s.quadraticCurveTo(x, y, x + r, y);
    return s;
  }

  function softBox(w, h, d, r) {
    const rad = r || 0.08;
    const geo = new THREE.ExtrudeGeometry(roundedRectShape(w, h, rad), {
      depth: Math.max(0.02, d - rad * 2),
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: rad * 0.55,
      bevelThickness: rad,
      curveSegments: 5,
    });
    geo.translate(0, 0, -d / 2 + rad);
    return geo;
  }

  function badgeSprite(text, bg) {
    const c = document.createElement('canvas');
    c.width = 128;
    c.height = 128;
    const ctx = c.getContext('2d');
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.arc(64, 64, 46, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.stroke();
    ctx.font = 'bold 62px system-ui, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, 64, 67);
    const tex = new THREE.CanvasTexture(c);
    const mat = new THREE.SpriteMaterial({ map: tex, depthTest: false });
    const sp = new THREE.Sprite(mat);
    sp.scale.set(0.75, 0.75, 0.75);
    return sp;
  }

  function createGlowTexture() {
    const c = document.createElement('canvas');
    c.width = 64;
    c.height = 64;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(0.24, '#bae6fd');
    g.addColorStop(0.55, 'rgba(56,189,248,0.42)');
    g.addColorStop(1, 'rgba(56,189,248,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  }

  const LIGHT_PHASES = [
    { name: 'Орбитальный день', sun: 1.1,  hemi: 0.74, color: 0xfff5e0, night: 0.06 },
    { name: 'Закат туманности', sun: 0.8,  hemi: 0.58, color: 0xffb38a, night: 0.42 },
    { name: 'Звёздная ночь',    sun: 0.48, hemi: 0.56, color: 0x9ec5ff, night: 0.96 },
    { name: 'Полярное сияние',  sun: 0.74, hemi: 0.66, color: 0xa7f3d0, night: 0.58 },
  ];

  class Station3D {
    constructor(canvas, isHero) {
      this.canvas = canvas;
      this.hero = !!isHero;
      this.tileSize = 1.65;
      this.quality = window.innerWidth < 760 ? 1.15 : 1.5;
      this.width = 0;
      this.height = 0;
      this.cols = 0;
      this.rows = 0;
      this.key = '';
      this.levelKey = '';
      this.lost = false;

      this.mats = [];
      this.geos = [];
      this.tiles = [];
      this.crystals = [];
      this.modules = [];
      this.solars = [];
      this.portals = [];
      this.lasers = [];
      this.switches = [];
      this.teleports = [];
      this.orbiters = [];
      this.fx = [];
      this.beams = [];
      this.rings = [];
      this.reactorRing = null;
      this.astrolabeRing = null;
      this.errorRing = null;
      this.errorUntil = 0;
      this.lastTrailTime = 0;

      this.phaseIndex = isHero ? 2 : 0;
      this.moods = [null, null, null];

      this.scene = new THREE.Scene();
      this.scene.fog = new THREE.FogExp2(0xdbeafe, 0.0042);

      this.camera = new THREE.PerspectiveCamera(38, 1, 0.1, 240);
      this.renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.quality));
      this.renderer.setClearColor(0x000000, 0);
      this.renderer.outputEncoding = THREE.sRGBEncoding;
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.04;
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this.renderer.shadowMap.autoUpdate = false;

      this.controls = new THREE.OrbitControls(this.camera, canvas);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.08;
      this.controls.enablePan = false;
      this.controls.minPolarAngle = Math.PI / 6;
      this.controls.maxPolarAngle = Math.PI * 0.45;
      this.controls.rotateSpeed = 0.6;
      this.controls.zoomSpeed = 0.75;
      this.controls.touches.ONE = THREE.TOUCH.ROTATE;
      this.controls.touches.TWO = THREE.TOUCH.DOLLY_PAN;
      this.controls.autoRotate = this.hero;
      this.controls.autoRotateSpeed = 0.35;

      this.hemi = new THREE.HemisphereLight(0xf8fafc, 0x64748b, 0.74);
      this.scene.add(this.hemi);

      this.sun = new THREE.DirectionalLight(0xfff5e0, 1.1);
      this.sun.position.set(-9, 19, 10);
      this.sun.castShadow = true;
      const sm = this.hero || window.innerWidth < 760 ? 1024 : 2048;
      this.sun.shadow.mapSize.set(sm, sm);
      this.sun.shadow.camera.left = -24;
      this.sun.shadow.camera.right = 24;
      this.sun.shadow.camera.top = 24;
      this.sun.shadow.camera.bottom = -24;
      this.sun.shadow.camera.far = 80;
      this.sun.shadow.normalBias = 0.035;
      this.sun.shadow.bias = -0.0002;
      this.scene.add(this.sun);

      const rim = new THREE.DirectionalLight(0x93c5fd, 0.48);
      rim.position.set(11, 7, -12);
      this.scene.add(rim);

      this.terrain = new THREE.Group();
      this.worldRoot = new THREE.Group();
      this.scene.add(this.terrain);
      this.scene.add(this.worldRoot);

      // Build all 4 unique 3D robot character rigs!
      this.rigs = {
        pixel: this.createPixelBot(),
        bitik: this.createBitikBot(),
        volt: this.createVoltBot(),
        luna: this.createLunaBot(),
      };
      Object.values(this.rigs).forEach((rig) => {
        rig.root.visible = false;
        this.scene.add(rig.root);
      });

      // Ambient cosmic motes / snow / embers / spores
      this.glowTex = createGlowTexture();
      this.motes = [];
      const moteCount = window.innerWidth < 760 ? 26 : 44;
      for (let i = 0; i < moteCount; i++) {
        const m = new THREE.SpriteMaterial({
          map: this.glowTex,
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          opacity: 0.4,
          color: i % 3 === 0 ? 0xfde68a : i % 2 === 0 ? 0x7dd3fc : 0xc4b5fd,
        });
        const sp = new THREE.Sprite(m);
        sp.scale.setScalar(0.24 + (i % 3) * 0.09);
        this.scene.add(sp);
        this.motes.push(sp);
      }

      // Error pulse ring
      const errMat = new THREE.MeshBasicMaterial({
        color: 0xf43f5e,
        transparent: true,
        opacity: 0.88,
        side: THREE.DoubleSide,
      });
      this.errorRing = new THREE.Mesh(new THREE.RingGeometry(0.45, 0.7, 28), errMat);
      this.errorRing.rotation.x = -Math.PI / 2;
      this.errorRing.visible = false;
      this.scene.add(this.errorRing);

      this.ray = new THREE.Raycaster();
      this.pointer = new THREE.Vector2();
      this.activePointers = new Set();
      this.multitouch = false;
      this.downInfo = null;
      this.onTileTap = null;

      canvas.addEventListener('pointerdown', (e) => {
        this.activePointers.add(e.pointerId);
        if (this.activePointers.size > 1) this.multitouch = true;
        this.downInfo = { x: e.clientX, y: e.clientY, id: e.pointerId };
      });
      canvas.addEventListener('pointerup', (e) => {
        if (
          !this.hero &&
          !this.multitouch &&
          this.downInfo &&
          e.pointerId === this.downInfo.id &&
          Math.hypot(e.clientX - this.downInfo.x, e.clientY - this.downInfo.y) < 8
        ) {
          const hit = this.pick(e.clientX, e.clientY);
          if (hit && this.onTileTap) this.onTileTap(hit.x, hit.z);
        }
        this.downInfo = null;
        this.activePointers.delete(e.pointerId);
        if (!this.activePointers.size) this.multitouch = false;
      });
      canvas.addEventListener('pointercancel', (e) => {
        this.activePointers.delete(e.pointerId);
        this.downInfo = null;
        if (!this.activePointers.size) this.multitouch = false;
      });
      canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); this.lost = true; });
      canvas.addEventListener('webglcontextrestored', () => { this.lost = false; this.key = ''; this.levelKey = ''; });
    }

    mat(color, opts) {
      const m = new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0.14, ...(opts || {}) });
      m.color.convertSRGBToLinear();
      this.mats.push(m);
      return m;
    }

    geo(g) {
      this.geos.push(g);
      return g;
    }

    mesh(g, m, parent, x, y, z) {
      const o = new THREE.Mesh(g, m);
      o.position.set(x || 0, y || 0, z || 0);
      o.castShadow = true;
      o.receiveShadow = true;
      parent.add(o);
      return o;
    }

    group(parent, x, y, z) {
      const g = new THREE.Group();
      g.position.set(x || 0, y || 0, z || 0);
      parent.add(g);
      return g;
    }

    pos(gx, gz) {
      return {
        x: (gx - (this.cols - 1) / 2) * this.tileSize,
        z: (gz - (this.rows - 1) / 2) * this.tileSize,
      };
    }

    makeArrowMesh(colorHex) {
      const shape = new THREE.Shape();
      shape.moveTo(0, -0.32);
      shape.lineTo(0.22, 0.06);
      shape.lineTo(0.08, 0.06);
      shape.lineTo(0.08, 0.28);
      shape.lineTo(-0.08, 0.28);
      shape.lineTo(-0.08, 0.06);
      shape.lineTo(-0.22, 0.06);
      shape.closePath();
      const m = new THREE.Mesh(
        new THREE.ShapeGeometry(shape),
        new THREE.MeshBasicMaterial({ color: colorHex, side: THREE.DoubleSide })
      );
      m.rotation.x = -Math.PI / 2;
      m.position.set(0, 0.13, -0.78);
      return m;
    }

    // ROBOT 1: Пиксель — Orange/Pearl Space Explorer Rover-Bot
    createPixelBot() {
      const root = new THREE.Group();
      const shell = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.26, metalness: 0.16 });
      const orange = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.32, metalness: 0.22 });
      const slate = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4, metalness: 0.35 });
      const visor = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1, metalness: 0.42 });
      const eyeMat = new THREE.MeshStandardMaterial({ color: 0x67e8f9, emissive: 0x22d3ee, emissiveIntensity: 0.9 });
      const gold = new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xeab308, emissiveIntensity: 0.4 });

      const hoverRing = this.mesh(new THREE.TorusGeometry(0.32, 0.055, 10, 24), slate, root, 0, 0.24, 0);
      hoverRing.rotation.x = Math.PI / 2;
      const thruster = this.mesh(new THREE.CylinderGeometry(0.22, 0.12, 0.12, 16), eyeMat, root, 0, 0.19, 0);
      thruster.castShadow = false;

      this.mesh(softBox(0.64, 0.52, 0.5, 0.14), shell, root, 0, 0.62, 0);
      this.mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.06, 16), eyeMat, root, 0, 0.62, -0.24).rotation.x = Math.PI / 2;
      this.mesh(softBox(0.46, 0.32, 0.16, 0.06), orange, root, 0, 0.64, 0.24);

      const head = this.group(root, 0, 1.2, 0);
      this.mesh(softBox(0.86, 0.56, 0.64, 0.16), shell, head, 0, 0, 0);
      this.mesh(softBox(0.7, 0.34, 0.08, 0.08), visor, head, 0, 0.01, -0.32);

      for (const sx of [-0.46, 0.46]) {
        const ear = this.mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.1, 14), orange, head, sx, 0, 0);
        ear.rotation.z = Math.PI / 2;
      }

      const eyes = [];
      for (const ex of [-0.17, 0.17]) {
        eyes.push(this.mesh(new THREE.SphereGeometry(0.085, 12, 10), eyeMat, head, ex, 0.03, -0.355));
      }

      const antenna = this.group(head, 0, 0.3, 0);
      this.mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.22, 10), orange, antenna, 0, 0.1, 0);
      this.mesh(new THREE.SphereGeometry(0.095, 14, 12), gold, antenna, 0, 0.24, 0);

      const arms = [];
      for (const ax of [-0.46, 0.46]) {
        const arm = this.group(root, ax, 0.72, 0);
        this.mesh(new THREE.CylinderGeometry(0.075, 0.065, 0.34, 10), orange, arm, 0, -0.14, 0);
        this.mesh(new THREE.SphereGeometry(0.09, 10, 8), slate, arm, 0, -0.3, 0);
        arms.push(arm);
      }

      root.add(this.makeArrowMesh(0xf97316));
      const badge = badgeSprite('1', '#ea580c');
      badge.position.set(0, 2.38, 0);
      badge.visible = false;
      root.add(badge);

      return { root, head, arms, eyes, thruster, antenna, badge, baseY: 0.06, trailColor: 0x38bdf8 };
    }

    // ROBOT 2: Битик — Cyan/Indigo Sleek Hover-Drone
    createBitikBot() {
      const root = new THREE.Group();
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0xe0f2fe, roughness: 0.24, metalness: 0.22 });
      const cyan = new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.28, metalness: 0.28 });
      const violet = new THREE.MeshStandardMaterial({ color: 0x6366f1, roughness: 0.32, metalness: 0.25 });
      const visor = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1, metalness: 0.42 });
      const eyeMat = new THREE.MeshStandardMaterial({ color: 0xf472b6, emissive: 0xec4899, emissiveIntensity: 0.9 });
      const glowRing = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0ea5e9, emissiveIntensity: 0.75 });

      const thruster = this.mesh(new THREE.TorusGeometry(0.3, 0.045, 10, 24), glowRing, root, 0, 0.28, 0);
      thruster.rotation.x = Math.PI / 2;

      const torso = this.mesh(new THREE.CylinderGeometry(0.36, 0.2, 0.52, 8), bodyMat, root, 0, 0.65, 0);
      torso.rotation.y = Math.PI / 8;

      const head = this.group(root, 0, 1.18, 0);
      this.mesh(softBox(0.8, 0.48, 0.58, 0.16), bodyMat, head, 0, 0, 0);
      this.mesh(softBox(0.66, 0.3, 0.08, 0.08), visor, head, 0, 0, -0.29);

      const antenna = this.group(head, 0, 0.26, 0);
      for (const sx of [-0.22, 0.22]) {
        const fin = this.mesh(new THREE.ConeGeometry(0.055, 0.28, 6), violet, antenna, sx, 0.1, 0);
        fin.rotation.z = sx < 0 ? 0.25 : -0.25;
      }

      const eyes = [];
      for (const ex of [-0.16, 0.16]) {
        eyes.push(this.mesh(softBox(0.11, 0.11, 0.04, 0.03), eyeMat, head, ex, 0.01, -0.335));
      }

      const arms = [];
      for (const sx of [-0.48, 0.48]) {
        const arm = this.group(root, sx, 0.72, 0);
        const wing = this.mesh(softBox(0.14, 0.38, 0.28, 0.04), cyan, arm, 0, -0.05, 0.04);
        wing.rotation.z = sx < 0 ? 0.18 : -0.18;
        arms.push(arm);
      }

      root.add(this.makeArrowMesh(0x06b6d4));
      const badge = badgeSprite('2', '#0284c7');
      badge.position.set(0, 2.38, 0);
      badge.visible = false;
      root.add(badge);

      return { root, head, arms, eyes, thruster, antenna, badge, baseY: 0.1, trailColor: 0xf472b6 };
    }

    // ROBOT 3 (NEW!): Вольт — Emerald/Gold Heavy Engineer Bot
    createVoltBot() {
      const root = new THREE.Group();
      const green = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.32, metalness: 0.26 });
      const dark = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.38, metalness: 0.42 });
      const gold = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.28, metalness: 0.35 });
      const visor = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.12, metalness: 0.4 });
      const limeGlow = new THREE.MeshStandardMaterial({ color: 0xbef264, emissive: 0x84cc16, emissiveIntensity: 0.9 });

      // Sturdy hover-tread base
      const thruster = this.mesh(new THREE.TorusGeometry(0.36, 0.06, 10, 8), limeGlow, root, 0, 0.22, 0);
      thruster.rotation.x = Math.PI / 2;
      this.mesh(softBox(0.76, 0.22, 0.62, 0.08), dark, root, 0, 0.3, 0);

      // Broad armored torso with cyclotron ring
      this.mesh(softBox(0.74, 0.56, 0.56, 0.12), green, root, 0, 0.68, 0);
      const core = this.mesh(new THREE.TorusGeometry(0.14, 0.04, 8, 18), limeGlow, root, 0, 0.68, -0.29);
      core.castShadow = false;

      // Hard-hat engineer head with golden safety crest
      const head = this.group(root, 0, 1.24, 0);
      this.mesh(softBox(0.84, 0.52, 0.62, 0.14), green, head, 0, 0, 0);
      this.mesh(softBox(0.74, 0.16, 0.66, 0.06), gold, head, 0, 0.24, -0.02); // helmet brim
      this.mesh(softBox(0.66, 0.28, 0.08, 0.06), visor, head, 0, -0.02, -0.31);

      const eyes = [];
      for (const ex of [-0.16, 0.16]) {
        eyes.push(this.mesh(softBox(0.14, 0.09, 0.04, 0.02), limeGlow, head, ex, -0.01, -0.35));
      }

      // Rotating beacon light on helmet
      const antenna = this.group(head, 0, 0.34, 0);
      this.mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.14, 12), limeGlow, antenna, 0, 0.06, 0);

      // Engineer wrench-claw arms
      const arms = [];
      for (const sx of [-0.52, 0.52]) {
        const arm = this.group(root, sx, 0.76, 0);
        this.mesh(softBox(0.16, 0.34, 0.16, 0.05), dark, arm, 0, -0.14, 0);
        this.mesh(new THREE.TorusGeometry(0.1, 0.035, 8, 12, Math.PI * 1.4), gold, arm, 0, -0.34, 0).rotation.z = Math.PI * 0.8;
        arms.push(arm);
      }

      root.add(this.makeArrowMesh(0x10b981));
      const badge = badgeSprite('3', '#059669');
      badge.position.set(0, 2.42, 0);
      badge.visible = false;
      root.add(badge);

      return { root, head, arms, eyes, thruster, antenna, badge, baseY: 0.05, trailColor: 0xa3e635 };
    }

    // ROBOT 4 (NEW!): Луна — Rose-Gold/Lavender Astro-Scout Bot
    createLunaBot() {
      const root = new THREE.Group();
      const pearl = new THREE.MeshStandardMaterial({ color: 0xfdf2f8, roughness: 0.22, metalness: 0.18 });
      const rose = new THREE.MeshStandardMaterial({ color: 0xec4899, roughness: 0.28, metalness: 0.28 });
      const gold = new THREE.MeshStandardMaterial({ color: 0xfde047, emissive: 0xeab308, emissiveIntensity: 0.55 });
      const visor = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.1, metalness: 0.42 });
      const starEye = new THREE.MeshStandardMaterial({ color: 0xf0abfc, emissive: 0xe879f9, emissiveIntensity: 0.95 });

      const thruster = this.mesh(new THREE.TorusGeometry(0.28, 0.04, 10, 24), starEye, root, 0, 0.26, 0);
      thruster.rotation.x = Math.PI / 2;

      // Graceful pearl sphere-tapered dress chassis
      this.mesh(new THREE.ConeGeometry(0.38, 0.62, 16), pearl, root, 0, 0.62, 0);
      const sash = this.mesh(new THREE.TorusGeometry(0.28, 0.045, 8, 20), rose, root, 0, 0.52, 0);
      sash.rotation.x = Math.PI / 2;

      const head = this.group(root, 0, 1.18, 0);
      this.mesh(new THREE.SphereGeometry(0.36, 18, 16), pearl, head, 0, 0, 0);
      this.mesh(softBox(0.56, 0.26, 0.12, 0.08), visor, head, 0, -0.02, -0.3);

      // Cute cat-ear astro-sensor fins
      for (const sx of [-0.24, 0.24]) {
        const ear = this.mesh(new THREE.ConeGeometry(0.09, 0.24, 6), rose, head, sx, 0.32, 0);
        ear.rotation.z = sx < 0 ? 0.3 : -0.3;
      }

      // Floating golden halo above head!
      const antenna = this.group(head, 0, 0.44, 0);
      const halo = this.mesh(new THREE.TorusGeometry(0.26, 0.03, 8, 24), gold, antenna, 0, 0, 0);
      halo.rotation.x = Math.PI / 2 + 0.15;
      halo.castShadow = false;

      const eyes = [];
      for (const ex of [-0.14, 0.14]) {
        eyes.push(this.mesh(new THREE.SphereGeometry(0.075, 12, 10), starEye, head, ex, -0.01, -0.35));
      }

      // Delicate ribbon wings
      const arms = [];
      for (const sx of [-0.42, 0.42]) {
        const arm = this.group(root, sx, 0.72, 0);
        const rib = this.mesh(softBox(0.1, 0.34, 0.22, 0.04), rose, arm, 0, -0.08, 0.05);
        rib.rotation.z = sx < 0 ? 0.28 : -0.28;
        arms.push(arm);
      }

      root.add(this.makeArrowMesh(0xec4899));
      const badge = badgeSprite('1', '#db2777');
      badge.position.set(0, 2.38, 0);
      badge.visible = false;
      root.add(badge);

      return { root, head, arms, eyes, thruster, antenna, badge, baseY: 0.1, trailColor: 0xf0abfc };
    }

    clearGroup(grp) {
      while (grp.children.length) {
        const c = grp.children[0];
        grp.remove(c);
        c.traverse((o) => {
          if (o.isSprite) {
            if (o.material.map) o.material.map.dispose();
            o.material.dispose();
          }
        });
      }
    }

    rebuild(level, grid, biome, robotCnt) {
      this.clearGroup(this.terrain);
      this.clearGroup(this.worldRoot);
      this.geos.forEach((g) => g.dispose());
      this.mats.forEach((m) => m.dispose());
      this.geos = [];
      this.mats = [];

      this.tiles = [];
      this.crystals = [];
      this.modules = [];
      this.solars = [];
      this.portals = [];
      this.lasers = [];
      this.switches = [];
      this.teleports = [];
      this.orbiters = [];
      this.astrolabeRing = null;

      this.cols = grid[0].length;
      this.rows = grid.length;
      const ts = this.tileSize;
      const b = biome || window.KodoLevels.BIOMES[0];

      const deck1 = this.mat(b.deck, { roughness: b.id === 'glacier' ? 0.22 : 0.5, metalness: b.id === 'glacier' ? 0.22 : 0.14 });
      const deck2 = this.mat(b.deck2, { roughness: b.id === 'glacier' ? 0.25 : 0.54, metalness: 0.14 });
      const trim = this.mat(b.trim, { roughness: 0.42, metalness: 0.34 });
      const baseMat = this.mat(b.base, { roughness: 0.58, metalness: 0.26 });
      const rockMat = this.mat(b.rock, { roughness: 0.84, metalness: 0.1, flatShading: true });

      const plasmaMat = new THREE.MeshPhysicalMaterial({
        color: b.plasma,
        emissive: b.id === 'magma' ? 0xea580c : b.glow,
        emissiveIntensity: b.id === 'magma' ? 0.65 : 0.2,
        roughness: 0.18,
        metalness: 0.12,
        transparent: true,
        opacity: b.id === 'magma' ? 0.92 : 0.74,
      });
      plasmaMat.color.convertSRGBToLinear();
      this.mats.push(plasmaMat);

      const glowMat = this.mat(b.glow, { emissive: b.glow, emissiveIntensity: 0.72, roughness: 0.2 });

      // Floating Orbital Station Hull & Anti-Gravity Reactor
      const bw = this.cols * ts - 0.15;
      const bd = this.rows * ts - 0.15;
      const hull = this.mesh(this.geo(softBox(bw, bd, 0.68, 0.3)), baseMat, this.terrain, 0, -0.78, 0);
      hull.rotation.x = -Math.PI / 2;

      const underGeo = new THREE.CylinderGeometry(Math.min(bw, bd) * 0.36, Math.min(bw, bd) * 0.13, 1.8, 8);
      this.mesh(this.geo(underGeo), trim, this.terrain, 0, -1.92, 0);

      this.reactorRing = this.mesh(
        this.geo(new THREE.TorusGeometry(Math.min(bw, bd) * 0.33, 0.095, 10, 32)),
        glowMat,
        this.terrain,
        0,
        -2.25,
        0
      );
      this.reactorRing.rotation.x = Math.PI / 2;
      this.reactorRing.castShadow = false;

      // Star Core celestial astrolabe ring!
      if (b.id === 'core' || b.id === 'neon') {
        const astro = this.mesh(
          this.geo(new THREE.TorusGeometry(Math.max(bw, bd) * 0.62 + 1.8, 0.06, 8, 48)),
          glowMat,
          this.terrain,
          0,
          0.2,
          0
        );
        astro.rotation.x = Math.PI / 2.4;
        astro.castShadow = false;
        this.astrolabeRing = astro;
      }

      const tileGeo = this.geo(softBox(ts - 0.1, ts - 0.1, 0.22, 0.09));
      const underTileGeo = this.geo(new THREE.BoxGeometry(ts - 0.12, 0.45, ts - 0.12));
      const plasmaGeo = this.geo(new THREE.BoxGeometry(ts - 0.03, 0.06, ts - 0.03));

      const crystalMat1 = this.mat(0xf472b6, { emissive: 0xdb2777, emissiveIntensity: 0.5, roughness: 0.16, metalness: 0.22 });
      const crystalMat2 = this.mat(0x38bdf8, { emissive: 0x0284c7, emissiveIntensity: 0.45, roughness: 0.16, metalness: 0.22 });
      const copperMat = this.mat(0x92400e, { roughness: 0.42, metalness: 0.48 });
      const amberMat = this.mat(0xf59e0b, { emissive: 0xd97706, emissiveIntensity: 0.6, roughness: 0.28 });
      const greenGlow = this.mat(0x34d399, { emissive: 0x10b981, emissiveIntensity: 0.72, roughness: 0.2 });
      const solarBlue = this.mat(0x1d4ed8, { roughness: 0.18, metalness: 0.65 });
      const darkSteel = this.mat(0x1e293b, { roughness: 0.36, metalness: 0.62 });
      const warpViolet = this.mat(0xc084fc, { emissive: 0xa855f7, emissiveIntensity: 0.85, roughness: 0.15 });
      const warpCyan = this.mat(0x67e8f9, { emissive: 0x22d3ee, emissiveIntensity: 0.75, roughness: 0.15 });
      const laserMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e, transparent: true, opacity: 0.86 });
      this.mats.push(laserMat);

      for (let z = 0; z < this.rows; z++) {
        for (let x = 0; x < this.cols; x++) {
          const type = grid[z][x];
          const p = this.pos(x, z);
          const n = noise(x, z);
          const g = this.group(this.worldRoot, p.x, 0, p.z);

          if (type === 'W') {
            const wTile = this.mesh(plasmaGeo, plasmaMat, g, 0, -0.28, 0);
            wTile.castShadow = false;
            wTile.receiveShadow = true;
            wTile.userData = { gx: x, gz: z };
            this.tiles.push(wTile);
            continue;
          }

          this.mesh(underTileGeo, trim, g, 0, -0.35, 0);
          const top = this.mesh(tileGeo, (x + z) % 2 === 0 ? deck1 : deck2, g, 0, -0.05, 0);
          top.rotation.x = -Math.PI / 2;
          top.userData = { gx: x, gz: z };
          this.tiles.push(top);

          if (type === '.' && n > 0.64) {
            const dot = this.mesh(this.geo(new THREE.CylinderGeometry(0.055, 0.055, 0.03, 6)), glowMat, g, 0.46, 0.07, -0.46);
            dot.castShadow = false;
          }

          // Biome-styled Obstacle (R)
          if (type === 'R') {
            const rg = this.group(g, 0, 0.08, 0);
            if (b.id === 'jungle') {
              // Glowing alien bio-mushroom pillar!
              this.mesh(this.geo(new THREE.CylinderGeometry(0.14, 0.22, 0.75, 8)), this.mat(0x4d7c0f), rg, 0, 0.36, 0);
              const cap = this.mesh(this.geo(new THREE.SphereGeometry(0.44, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.55)), glowMat, rg, 0, 0.68, 0);
              cap.scale.y = 0.7;
            } else if (b.id === 'glacier') {
              // Translucent frost crystal spire!
              const ice = this.mat(0x7dd3fc, { emissive: 0x0284c7, emissiveIntensity: 0.35, roughness: 0.12 });
              this.mesh(this.geo(new THREE.ConeGeometry(0.36, 1.15, 6)), ice, rg, 0, 0.55, 0);
              const sub = this.mesh(this.geo(new THREE.ConeGeometry(0.22, 0.75, 5)), ice, rg, 0.25, 0.35, 0.16);
              sub.rotation.z = -0.25;
            } else {
              // Asteroid / Magma rock with glowing ore
              const main = this.mesh(this.geo(new THREE.DodecahedronGeometry(0.48, 0)), rockMat, rg, 0, 0.38, 0);
              main.scale.set(1.05, 0.9 + n * 0.35, 0.95);
              main.rotation.set(n * 3, n * 5, 0);
              this.mesh(this.geo(new THREE.DodecahedronGeometry(0.28, 0)), rockMat, rg, 0.32, 0.22, 0.24);
              const ore = this.mesh(this.geo(new THREE.OctahedronGeometry(0.17, 0)), glowMat, rg, -0.22, 0.62, -0.15);
              ore.scale.set(0.7, 1.5, 0.7);
              ore.rotation.z = 0.4;
            }
          }

          // Energy Crystal (C)
          if (type === 'C') {
            const cg = this.group(g, 0, 0.08, 0);
            this.mesh(this.geo(new THREE.CylinderGeometry(0.42, 0.48, 0.08, 6)), darkSteel, cg, 0, 0.04, 0).castShadow = false;
            const cluster = this.group(cg, 0, 0.14, 0);
            const c1 = this.mesh(this.geo(new THREE.OctahedronGeometry(0.27, 0)), crystalMat1, cluster, 0, 0.38, 0);
            c1.scale.set(0.78, 1.7, 0.78);
            const c2 = this.mesh(this.geo(new THREE.OctahedronGeometry(0.18, 0)), crystalMat2, cluster, 0.22, 0.22, 0.12);
            c2.scale.set(0.7, 1.4, 0.7);
            c2.rotation.z = -0.35;
            const c3 = this.mesh(this.geo(new THREE.OctahedronGeometry(0.16, 0)), crystalMat1, cluster, -0.2, 0.2, -0.14);
            c3.scale.set(0.7, 1.3, 0.7);
            c3.rotation.z = 0.38;
            this.crystals.push({ g: cluster, phase: n * 6.28 });
          }

          // Damaged Solar Module (S)
          if (type === 'S') {
            const sg = this.group(g, 0, 0.08, 0);
            this.mesh(this.geo(new THREE.CylinderGeometry(0.46, 0.52, 0.1, 6)), copperMat, sg, 0, 0.05, 0);
            const warnRing = this.mesh(this.geo(new THREE.TorusGeometry(0.35, 0.048, 8, 24)), amberMat, sg, 0, 0.12, 0);
            warnRing.rotation.x = Math.PI / 2;
            this.mesh(this.geo(new THREE.CylinderGeometry(0.16, 0.2, 0.12, 8)), darkSteel, sg, 0, 0.13, 0);
            this.modules.push({ ring: warnRing, phase: n * 6.28 });
          }

          // Repaired Active Solar Beacon (V)
          if (type === 'V') {
            const vg = this.group(g, 0, 0.08, 0);
            this.mesh(this.geo(new THREE.CylinderGeometry(0.44, 0.48, 0.06, 6)), darkSteel, vg, 0, 0.03, 0);
            const ring = this.mesh(this.geo(new THREE.TorusGeometry(0.36, 0.036, 8, 24)), greenGlow, vg, 0, 0.07, 0);
            ring.rotation.x = Math.PI / 2;
            for (let k = 0; k < 4; k++) {
              const ang = (k * Math.PI) / 2 + Math.PI / 4;
              const panel = this.mesh(this.geo(new THREE.BoxGeometry(0.22, 0.03, 0.14)), solarBlue, vg, Math.cos(ang) * 0.44, 0.12, Math.sin(ang) * 0.44);
              panel.rotation.y = -ang;
              panel.rotation.x = 0.3;
            }
            const gem = this.mesh(this.geo(new THREE.OctahedronGeometry(0.13, 0)), greenGlow, vg, 0, 0.24, 0);
            this.solars.push({ gem, phase: n * 6.28 });
          }

          // Quantum Teleporter Pad (T) — NEW!
          if (type === 'T') {
            const tg = this.group(g, 0, 0.08, 0);
            this.mesh(this.geo(new THREE.CylinderGeometry(0.5, 0.56, 0.1, 8)), darkSteel, tg, 0, 0.05, 0);
            const rOut = this.mesh(this.geo(new THREE.TorusGeometry(0.42, 0.045, 8, 24)), warpViolet, tg, 0, 0.13, 0);
            rOut.rotation.x = Math.PI / 2;
            const rIn = this.mesh(this.geo(new THREE.TorusGeometry(0.25, 0.032, 8, 20)), warpCyan, tg, 0, 0.24, 0);
            rIn.rotation.x = Math.PI / 2;
            const cylMat = new THREE.MeshBasicMaterial({
              color: 0xc084fc,
              transparent: true,
              opacity: 0.18,
              side: THREE.DoubleSide,
              depthWrite: false,
            });
            this.mats.push(cylMat);
            const vortex = this.mesh(this.geo(new THREE.CylinderGeometry(0.36, 0.36, 0.85, 16, 1, true)), cylMat, tg, 0, 0.48, 0);
            vortex.castShadow = false;
            this.teleports.push({ rOut, rIn, vortex, phase: n * 6.28 });
          }

          // Power Console Switch (K)
          if (type === 'K') {
            const kg = this.group(g, 0, 0.08, 0);
            this.mesh(this.geo(new THREE.CylinderGeometry(0.48, 0.54, 0.12, 6)), darkSteel, kg, 0, 0.06, 0);
            this.mesh(this.geo(new THREE.CylinderGeometry(0.34, 0.34, 0.05, 6)), amberMat, kg, 0, 0.13, 0);
            const sp = badgeSprite('⚡', '#d97706');
            sp.position.set(0, 1.15, 0);
            sp.scale.set(0.65, 0.65, 0.65);
            kg.add(sp);
            this.switches.push({ sp, phase: n * 6.28 });
          }

          // Laser Gate (X)
          if (type === 'X') {
            const xg = this.group(g, 0, 0.08, 0);
            for (const dx of [-0.56, 0.56]) {
              this.mesh(this.geo(new THREE.CylinderGeometry(0.09, 0.12, 1.15, 8)), darkSteel, xg, dx, 0.58, 0);
              this.mesh(this.geo(new THREE.SphereGeometry(0.11, 10, 8)), laserMat, xg, dx, 1.18, 0);
            }
            const beams = [];
            for (const y of [0.35, 0.68, 1.0]) {
              const beam = this.mesh(this.geo(new THREE.CylinderGeometry(0.038, 0.038, 1.12, 8)), laserMat, xg, 0, y, 0);
              beam.rotation.z = Math.PI / 2;
              beam.castShadow = false;
              beams.push(beam);
            }
            this.lasers.push({ beams, phase: n * 6.28 });
          }

          // Portals: B (Gold, 1), E (Cyan, 2), M (Emerald, 3)
          if (type === 'B' || type === 'E' || type === 'M') {
            const cfg = type === 'B'
              ? { col: 0xfbbf24, em: 0xd97706, num: '1', bg: '#ea580c' }
              : type === 'E'
                ? { col: 0x38bdf8, em: 0x0284c7, num: '2', bg: '#0284c7' }
                : { col: 0x34d399, em: 0x059669, num: '3', bg: '#059669' };
            const pg = this.group(g, 0, 0.08, 0);
            const pMat = this.mat(cfg.col, { emissive: cfg.em, emissiveIntensity: 0.6, roughness: 0.22, metalness: 0.42 });
            this.mesh(this.geo(new THREE.CylinderGeometry(0.48, 0.54, 0.14, 16)), darkSteel, pg, 0, 0.07, 0);
            const ring1 = this.mesh(this.geo(new THREE.TorusGeometry(0.46, 0.05, 10, 28)), pMat, pg, 0, 0.62, 0);
            const ring2 = this.mesh(this.geo(new THREE.TorusGeometry(0.32, 0.032, 8, 24)), pMat, pg, 0, 0.62, 0);
            const core = this.mesh(this.geo(new THREE.OctahedronGeometry(0.18, 0)), pMat, pg, 0, 0.62, 0);
            const beamMat = new THREE.MeshBasicMaterial({
              color: cfg.col,
              transparent: true,
              opacity: 0.11,
              side: THREE.DoubleSide,
              depthWrite: false,
            });
            this.mats.push(beamMat);
            const beam = this.mesh(this.geo(new THREE.CylinderGeometry(0.42, 0.18, 2.8, 24, 1, true)), beamMat, pg, 0, 1.65, 0);
            beam.castShadow = false;
            beam.receiveShadow = false;

            if (robotCnt > 1 && !this.hero) {
              const sp = badgeSprite(cfg.num, cfg.bg);
              sp.position.set(0, 1.98, 0);
              pg.add(sp);
            }
            this.portals.push({ ring1, ring2, core, beam, pMat });
          }
        }
      }

      // Rich Biome-Specific Orbiting Props & Background Ringed Planet!
      const orbitR = Math.max(bw, bd) * 0.68 + 4.0;
      for (let i = 0; i < 7; i++) {
        const ang = (i / 7) * Math.PI * 2 + 0.3;
        const dist = orbitR + (i % 2) * 1.6;
        const og = this.group(this.terrain, Math.cos(ang) * dist, -0.5 + (i % 3 - 1) * 1.25, Math.sin(ang) * dist);
        if (i === 0) {
          // Distant cute ringed mini-planet!
          const pl = this.mesh(this.geo(new THREE.SphereGeometry(0.9, 16, 14)), glowMat, og);
          pl.castShadow = false;
          const pr = this.mesh(this.geo(new THREE.TorusGeometry(1.45, 0.1, 6, 28)), amberMat, og);
          pr.rotation.x = Math.PI / 2.6;
          pr.castShadow = false;
        } else if (b.id === 'jungle' && i % 2 === 1) {
          // Floating glowing jellyfish-spore orb!
          const orb = this.mesh(this.geo(new THREE.SphereGeometry(0.35, 12, 10)), greenGlow, og);
          orb.castShadow = false;
        } else if (b.id === 'glacier' && i % 2 === 1) {
          // Floating ice diamond
          const ice = this.mesh(this.geo(new THREE.OctahedronGeometry(0.45, 0)), warpCyan, og);
          ice.scale.y = 1.6;
          ice.castShadow = false;
        } else if (i % 2 === 0) {
          const ast = this.mesh(this.geo(new THREE.DodecahedronGeometry(0.55 + (i % 3) * 0.16, 0)), rockMat, og);
          ast.castShadow = false;
          const cr = this.mesh(this.geo(new THREE.OctahedronGeometry(0.22, 0)), glowMat, og, 0.3, 0.4, 0);
          cr.castShadow = false;
        } else {
          // Orbiting solar satellite
          this.mesh(this.geo(new THREE.BoxGeometry(0.32, 0.32, 0.32)), glowMat, og).castShadow = false;
          for (const sx of [-0.5, 0.5]) {
            this.mesh(this.geo(new THREE.BoxGeometry(0.52, 0.04, 0.24)), solarBlue, og, sx, 0, 0).castShadow = false;
          }
        }
        this.orbiters.push({ g: og, ang, dist, baseY: og.position.y, speed: 0.055 + (i % 3) * 0.025 });
      }

      // Recolor ambient motes per biome (snow white in glacier, orange embers in magma, lime spores in jungle)
      const moteColor = b.id === 'magma' ? 0xfb923c : b.id === 'jungle' ? 0xbef264 : b.id === 'glacier' ? 0xe0f2fe : null;
      this.motes.forEach((m, i) => {
        m.material.color.setHex(moteColor || (i % 3 === 0 ? 0xfde68a : i % 2 === 0 ? 0x7dd3fc : 0xc4b5fd));
      });

      this.terrain.updateMatrixWorld(true);
      this.worldRoot.updateMatrixWorld(true);
      this.renderer.shadowMap.needsUpdate = true;
    }

    // Visual VFX helpers
    setMood(robotIdx, type) {
      const entry = { type, start: performance.now() };
      if (robotIdx === -1) {
        this.moods = [{ ...entry }, { ...entry }, { ...entry }];
      } else {
        this.moods[robotIdx] = entry;
      }
    }

    clearMoods() {
      this.moods = [null, null, null];
    }

    flashErrorTile(gx, gz) {
      if (gx === undefined || gz === undefined || !this.cols) return;
      const p = this.pos(gx, gz);
      this.errorRing.position.set(p.x, 0.14, p.z);
      this.errorRing.visible = true;
      this.errorUntil = performance.now() + 2600;
    }

    burst(gx, gz, colorHex, count, yBase) {
      if (!this.cols) return;
      const p = this.pos(gx, gz);
      const mat = new THREE.MeshBasicMaterial({ color: colorHex || 0x38bdf8 });
      const geo = new THREE.OctahedronGeometry(0.085, 0);
      const n = count || 18;
      const now = performance.now();
      for (let i = 0; i < n; i++) {
        const o = new THREE.Mesh(geo, mat);
        o.position.set(p.x, yBase || 0.55, p.z);
        this.scene.add(o);
        this.fx.push({
          o, geo, mat,
          start: now,
          origin: o.position.clone(),
          v: new THREE.Vector3((Math.random() - 0.5) * 3.0, Math.random() * 2.6 + 1.1, (Math.random() - 0.5) * 3.0),
        });
      }
    }

    fireworks(gx, gz) {
      const palette = [0xfbbf24, 0x38bdf8, 0xf472b6, 0x34d399, 0xc084fc];
      palette.forEach((col, i) => {
        setTimeout(() => {
          this.burst(gx + (Math.random() - 0.5) * 1.4, gz + (Math.random() - 0.5) * 1.4, col, 22, 1.4 + i * 0.25);
        }, i * 160);
      });
    }

    // 3D Energy Beam from one tile to another (crystal collect / repair / switch -> laser!)
    beam(x1, z1, x2, z2, colorHex) {
      if (!this.cols) return;
      const p1 = this.pos(x1, z1);
      const p2 = this.pos(x2, z2);
      const a = new THREE.Vector3(p1.x, 0.85, p1.z);
      const b = new THREE.Vector3(p2.x, 0.55, p2.z);
      const dist = a.distanceTo(b);
      if (dist < 0.05) return;
      const geo = new THREE.CylinderGeometry(0.055, 0.055, dist, 8);
      const mat = new THREE.MeshBasicMaterial({ color: colorHex || 0x38bdf8, transparent: true, opacity: 0.92 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(a).add(b).multiplyScalar(0.5);
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
      this.scene.add(mesh);
      this.beams.push({ mesh, geo, mat, start: performance.now(), duration: 420 });
    }

    // Expanding Neon Warp Ring for Teleporters!
    warpFlash(gx, gz) {
      if (!this.cols) return;
      const p = this.pos(gx, gz);
      const geo = new THREE.TorusGeometry(0.35, 0.06, 8, 24);
      const mat = new THREE.MeshBasicMaterial({ color: 0xe879f9, transparent: true, opacity: 0.95 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.rotation.x = Math.PI / 2;
      mesh.position.set(p.x, 0.35, p.z);
      this.scene.add(mesh);
      this.rings.push({ mesh, geo, mat, start: performance.now(), duration: 550 });
      this.burst(gx, gz, 0xc084fc, 16, 0.45);
    }

    setPhase(idx) {
      this.phaseIndex = ((idx % LIGHT_PHASES.length) + LIGHT_PHASES.length) % LIGHT_PHASES.length;
      return LIGHT_PHASES[this.phaseIndex];
    }

    resize() {
      const r = this.canvas.getBoundingClientRect();
      if (!r.width || !r.height) return false;
      if (Math.abs(r.width - this.width) < 1 && Math.abs(r.height - this.height) < 1) return true;
      this.width = r.width;
      this.height = r.height;
      this.renderer.setSize(r.width, r.height, false);
      this.camera.aspect = r.width / r.height;
      this.camera.updateProjectionMatrix();
      if (this.cols) this.resetCamera();
      return true;
    }

    resetCamera() {
      if (!this.cols) return;
      const target = new THREE.Vector3(0, -0.3, 0);
      const dir = new THREE.Vector3(this.hero ? 7.5 : -7.5, 11.5, this.hero ? 11.5 : 11.5).normalize();
      this.camera.position.copy(target).add(dir);
      this.camera.lookAt(target);
      this.camera.updateMatrixWorld();

      const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion);
      const up = new THREE.Vector3(0, 1, 0).applyQuaternion(this.camera.quaternion);
      const tan = Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2));
      const padH = this.hero ? 0.78 : window.innerWidth <= 760 ? 0.76 : 0.72;
      const padW = 0.84;

      let dist = 7;
      for (const sx of [-1, 1]) {
        for (const sz of [-1, 1]) {
          for (const yy of [-2.4, 2.5]) {
            const corner = new THREE.Vector3(
              (sx * this.cols * this.tileSize) / 2,
              yy - target.y,
              (sz * this.rows * this.tileSize) / 2
            );
            dist = Math.max(
              dist,
              corner.dot(dir) + Math.abs(corner.dot(right)) / (tan * this.camera.aspect * padW),
              corner.dot(dir) + Math.abs(corner.dot(up)) / (tan * padH)
            );
          }
        }
      }

      this.controls.target.copy(target);
      this.camera.position.copy(target).addScaledVector(dir, dist);
      this.controls.minDistance = Math.max(5.5, dist * 0.46);
      this.controls.maxDistance = dist * 1.65;
      this.controls.update();
    }

    zoom(factor) {
      const v = this.camera.position.clone().sub(this.controls.target);
      const len = Math.max(this.controls.minDistance, Math.min(this.controls.maxDistance, v.length() * factor));
      v.setLength(len);
      this.camera.position.copy(this.controls.target).add(v);
      this.controls.update();
    }

    pick(clientX, clientY) {
      const r = this.canvas.getBoundingClientRect();
      this.pointer.set(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
      this.ray.setFromCamera(this.pointer, this.camera);
      const hit = this.ray.intersectObjects(this.tiles, false)[0];
      return hit ? { x: hit.object.userData.gx, z: hit.object.userData.gz } : null;
    }

    animateBotRig(rig, statePos, animState, isRunning, motion, time, slotIdx) {
      if (!this.cols) return;
      let rx = statePos.x;
      let rz = statePos.z;
      let angle = -statePos.d * (Math.PI / 2);
      let jumpY = 0;
      let progress = 0;

      if (animState) {
        progress = Math.min(1, (time - animState.start) / animState.duration);
        const e = progress * progress * (3 - 2 * progress);
        rx = animState.from.x + (animState.to.x - animState.from.x) * e;
        rz = animState.from.z + (animState.to.z - animState.from.z) * e;
        const a = animState.from.d * (Math.PI / 2);
        const b = animState.to.d * (Math.PI / 2);
        const diff = Math.atan2(Math.sin(b - a), Math.cos(b - a));
        angle = -(a + diff * e);
        if (animState.jump) jumpY = Math.sin(Math.PI * progress) * 1.4;

        // Subtle thruster trail while moving/jumping
        if (motion && time - this.lastTrailTime > 90 && (Math.abs(animState.to.x - animState.from.x) + Math.abs(animState.to.z - animState.from.z) > 0)) {
          this.lastTrailTime = time;
          this.burst(rx, rz, rig.trailColor, 2, 0.25 + jumpY * 0.6);
        }
      }

      const p = this.pos(rx, rz);
      const bob = motion ? Math.sin(time / 360 + slotIdx * 2.1) * 0.05 : 0;
      rig.root.position.set(p.x, rig.baseY + jumpY + bob, p.z);
      rig.root.rotation.set(0, this.hero ? Math.PI + slotIdx * 0.55 : angle, 0);

      const tScale = animState && animState.jump ? 1.4 : 1 + (motion ? Math.sin(time / 130) * 0.09 : 0);
      rig.thruster.scale.set(tScale, 1, tScale);

      const moving = !!animState && motion;
      rig.arms.forEach((arm, idx) => {
        arm.rotation.z = 0;
        if (this.hero && motion && idx === 1 && slotIdx === 0) {
          // Friendly waving in the main menu!
          arm.rotation.z = 2.1 + Math.sin(time / 220) * 0.35;
          arm.rotation.x = 0.2;
        } else {
          arm.rotation.x = moving
            ? Math.sin(progress * Math.PI * 3 + idx * Math.PI) * 0.42
            : motion
              ? Math.sin(time / 820 + idx + slotIdx) * 0.07
              : 0;
        }
      });

      const blink = motion && Math.floor(time / 160 + slotIdx * 11) % 34 === 0;
      rig.eyes.forEach((eye) => { eye.scale.y = blink ? 0.12 : 1; });
      rig.antenna.rotation.y = motion ? time * 0.0012 : 0;
      rig.antenna.rotation.z = motion ? Math.sin(time / 480 + slotIdx) * 0.08 : 0;

      const mood = this.moods[slotIdx];
      if (!this.hero && mood && !isRunning) {
        const age = (time - mood.start) / 1000;
        if (age >= 0 && age < 3.6) {
          const fade = Math.min(1, age * 5) * Math.min(1, (3.6 - age) * 2);
          if (mood.type === 'happy') {
            if (motion) {
              rig.root.position.y += Math.abs(Math.sin(age * Math.PI * 2.5)) * 0.68 * fade;
              rig.root.rotation.z = Math.sin(age * 9) * 0.14 * fade;
            }
            rig.arms.forEach((arm, i) => {
              arm.rotation.z = (i === 0 ? -1 : 1) * (1.8 + Math.sin(age * 10) * 0.28) * fade;
            });
            rig.eyes.forEach((e) => { e.scale.y = 0.52; });
          } else if (mood.type === 'sad') {
            rig.root.rotation.x = 0.22 * fade;
            rig.root.rotation.z = Math.sin(age * 14) * 0.09 * Math.exp(-age) * fade;
            rig.arms.forEach((arm, i) => {
              arm.rotation.z = (i === 0 ? -0.35 : 0.35) * fade;
              arm.rotation.x = -0.45 * fade;
            });
            rig.eyes.forEach((e) => { e.scale.y = 0.45; });
          }
        }
      }
    }

    render(state, time) {
      if (this.lost || !this.resize()) return;
      const { level, grid, biome, robots, activeRobot, anim, completed, running, motion, levelId, heroSkin } = state;
      const rCnt = robots.length;
      const lKey = `${this.hero ? 'hero' : levelId}-${biome.id}-${grid[0].length}x${grid.length}-${rCnt}`;
      const gKey = JSON.stringify(grid);

      if (gKey !== this.key || lKey !== this.levelKey) {
        const camDirty = lKey !== this.levelKey;
        this.rebuild(level, grid, biome, rCnt);
        this.key = gKey;
        this.levelKey = lKey;
        if (camDirty) this.resetCamera();
      }

      const ph = LIGHT_PHASES[this.phaseIndex];
      this.sun.intensity = ph.sun;
      this.sun.color.setHex(ph.color);
      this.hemi.intensity = ph.hemi;

      // Hide all rigs first, then show active ones!
      Object.values(this.rigs).forEach((r) => { r.root.visible = false; r.badge.visible = false; });

      // Choose which rig represents each slot
      const skin0 = rCnt === 1 ? (heroSkin || 'pixel') : 'pixel';
      const slotKeys = rCnt === 1 ? [skin0] : rCnt === 2 ? ['pixel', 'bitik'] : ['pixel', 'bitik', 'volt'];

      if (this.hero) {
        // Show 3 heroes hanging out on the menu diorama (including the selected heroSkin!)
        const heroSlots = [heroSkin || 'pixel', heroSkin === 'bitik' ? 'luna' : 'bitik', heroSkin === 'volt' ? 'luna' : 'volt'];
        robots.forEach((rPos, i) => {
          const rig = this.rigs[heroSlots[i]];
          if (!rig) return;
          rig.root.visible = true;
          this.animateBotRig(rig, rPos, null, false, motion, time, i);
        });
      } else {
        robots.forEach((rPos, i) => {
          const rig = this.rigs[slotKeys[i]];
          if (!rig) return;
          rig.root.visible = true;
          rig.badge.visible = rCnt > 1;
          this.animateBotRig(
            rig,
            rPos,
            anim && activeRobot === i ? anim : null,
            running,
            motion,
            time,
            i
          );
        });
      }

      // World animations
      if (motion) {
        const t = time * 0.001;
        if (this.reactorRing) this.reactorRing.rotation.z = t * 0.75;
        if (this.astrolabeRing) this.astrolabeRing.rotation.z = t * 0.25;
        this.crystals.forEach(({ g, phase }) => {
          g.rotation.y = t * 0.95 + phase;
          g.position.y = 0.16 + Math.sin(t * 2.2 + phase) * 0.065;
        });
        this.modules.forEach(({ ring, phase }) => {
          const s = 0.94 + Math.sin(t * 3.2 + phase) * 0.08;
          ring.scale.set(s, s, 1);
        });
        this.solars.forEach(({ gem, phase }) => {
          gem.rotation.y = t * 1.5 + phase;
          gem.position.y = 0.25 + Math.sin(t * 2.6 + phase) * 0.04;
        });
        this.teleports.forEach(({ rOut, rIn, vortex, phase }) => {
          rOut.rotation.z = t * 1.6 + phase;
          rIn.rotation.z = -t * 2.4 + phase;
          rIn.position.y = 0.24 + Math.sin(t * 3.0 + phase) * 0.07;
          vortex.material.opacity = 0.14 + Math.sin(t * 3.5 + phase) * 0.07;
        });
        this.lasers.forEach(({ beams, phase }) => {
          const op = 0.65 + Math.sin(t * 9 + phase) * 0.25;
          beams.forEach((b) => { b.material.opacity = op; });
        });
        this.switches.forEach(({ sp, phase }) => {
          sp.position.y = 1.15 + Math.sin(t * 2.5 + phase) * 0.09;
        });
        this.portals.forEach(({ ring1, ring2, core, beam, pMat }) => {
          ring1.rotation.y = t * 0.95;
          ring2.rotation.x = t * 1.25;
          core.rotation.y = -t * 1.7;
          core.position.y = 0.62 + Math.sin(t * 2.4) * 0.07;
          const lit = !this.hero && completed;
          pMat.emissiveIntensity = lit ? 1.65 : 0.6;
          beam.material.opacity = lit ? 0.26 : 0.11;
        });
        this.orbiters.forEach((o) => {
          const a = o.ang + t * o.speed;
          o.g.position.set(Math.cos(a) * o.dist, o.baseY + Math.sin(t * 0.8 + o.ang) * 0.28, Math.sin(a) * o.dist);
          o.g.rotation.y = t * 0.4;
        });
        this.motes.forEach((m, i) => {
          const seed = i * 2.399;
          const rise = biome.id === 'magma' ? ((t * 0.9 + i) % 4) : (0.8 + (i % 5) * 0.7 + Math.sin(t * 0.7 + seed) * 0.4);
          m.position.set(
            (noise(i, 19) - 0.5) * Math.max(8, this.cols * 1.85) + Math.sin(t * 0.4 + seed) * 1.2,
            rise,
            (noise(i, 71) - 0.5) * Math.max(8, this.rows * 1.85) + Math.cos(t * 0.35 + seed) * 1.2
          );
          m.material.opacity = (0.22 + ph.night * 0.65) * (0.45 + 0.55 * Math.sin(t * 2.2 + seed));
        });
      }

      if (this.errorRing.visible) {
        if (time > this.errorUntil) this.errorRing.visible = false;
        else {
          const s = 1 + Math.sin(time * 0.015) * 0.15;
          this.errorRing.scale.set(s, s, 1);
        }
      }

      // Energy Beams update
      for (let i = this.beams.length - 1; i >= 0; i--) {
        const bm = this.beams[i];
        const age = (time - bm.start) / bm.duration;
        if (age >= 1) {
          this.scene.remove(bm.mesh);
          bm.geo.dispose();
          bm.mat.dispose();
          this.beams.splice(i, 1);
        } else {
          bm.mat.opacity = 1 - age;
          bm.mesh.scale.set(1 + age * 0.8, 1, 1 + age * 0.8);
        }
      }

      // Warp Rings update
      for (let i = this.rings.length - 1; i >= 0; i--) {
        const rn = this.rings[i];
        const age = (time - rn.start) / rn.duration;
        if (age >= 1) {
          this.scene.remove(rn.mesh);
          rn.geo.dispose();
          rn.mat.dispose();
          this.rings.splice(i, 1);
        } else {
          rn.mat.opacity = 1 - age;
          rn.mesh.scale.setScalar(1 + age * 2.4);
          rn.mesh.position.y = 0.35 + age * 1.1;
        }
      }

      // Sparkle & Firework Particles
      for (let i = this.fx.length - 1; i >= 0; i--) {
        const f = this.fx[i];
        const age = (time - f.start) / 1000;
        if (age > 1.2) {
          this.scene.remove(f.o);
          this.fx.splice(i, 1);
          if (!this.fx.some((q) => q.geo === f.geo)) {
            f.geo.dispose();
            f.mat.dispose();
          }
          continue;
        }
        f.o.position.copy(f.origin).addScaledVector(f.v, age);
        f.o.position.y -= age * age * 1.65;
        f.o.rotation.x += 0.16;
        f.o.rotation.y += 0.14;
        f.o.scale.setScalar(Math.max(0.05, 1 - age / 1.2));
      }

      this.controls.autoRotate = this.hero && motion;
      this.controls.update();
      if (!this.hero && (anim || this.moods.some(Boolean))) {
        this.renderer.shadowMap.needsUpdate = true;
      }
      this.renderer.render(this.scene, this.camera);
    }
  }

  root.KodoScene3D = { Station3D, LIGHT_PHASES };
})(window);
