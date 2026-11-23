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
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
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
    g.addColorStop(0.22, '#a5f3fc');
    g.addColorStop(0.5, 'rgba(56,189,248,0.45)');
    g.addColorStop(1, 'rgba(56,189,248,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  }

  const LIGHT_PHASES = [
    { name: 'Орбитальный день', sun: 1.08, hemi: 0.72, color: 0xfff5e0, night: 0.05 },
    { name: 'Закат туманности', sun: 0.78, hemi: 0.56, color: 0xffb38a, night: 0.42 },
    { name: 'Звёздная ночь',    sun: 0.45, hemi: 0.55, color: 0x9ec5ff, night: 0.95 },
    { name: 'Полярное сияние',  sun: 0.72, hemi: 0.65, color: 0xa7f3d0, night: 0.60 },
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
      this.orbiters = [];
      this.fx = [];
      this.reactorRing = null;
      this.errorRing = null;
      this.errorUntil = 0;

      this.phaseIndex = 0;
      this.moods = [null, null];

      this.scene = new THREE.Scene();
      this.scene.fog = new THREE.FogExp2(0xdbeafe, 0.0045);

      this.camera = new THREE.PerspectiveCamera(38, 1, 0.1, 220);
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
      this.renderer.toneMappingExposure = 1.0;
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
      this.controls.autoRotateSpeed = 0.3;

      this.hemi = new THREE.HemisphereLight(0xf8fafc, 0x64748b, 0.72);
      this.scene.add(this.hemi);

      this.sun = new THREE.DirectionalLight(0xfff5e0, 1.08);
      this.sun.position.set(-9, 18, 10);
      this.sun.castShadow = true;
      const sm = this.hero || window.innerWidth < 760 ? 1024 : 2048;
      this.sun.shadow.mapSize.set(sm, sm);
      this.sun.shadow.camera.left = -22;
      this.sun.shadow.camera.right = 22;
      this.sun.shadow.camera.top = 22;
      this.sun.shadow.camera.bottom = -22;
      this.sun.shadow.camera.far = 75;
      this.sun.shadow.normalBias = 0.035;
      this.sun.shadow.bias = -0.0002;
      this.scene.add(this.sun);

      const rim = new THREE.DirectionalLight(0x93c5fd, 0.42);
      rim.position.set(10, 6, -12);
      this.scene.add(rim);

      this.terrain = new THREE.Group();
      this.worldRoot = new THREE.Group();
      this.scene.add(this.terrain);
      this.scene.add(this.worldRoot);

      this.pixelRig = this.createPixelBot();
      this.scene.add(this.pixelRig.root);

      this.bitikRig = this.createBitikBot();
      this.bitikRig.root.visible = false;
      this.scene.add(this.bitikRig.root);

      // Star motes / cosmic fireflies
      this.glowTex = createGlowTexture();
      this.motes = [];
      const moteCount = window.innerWidth < 760 ? 22 : 38;
      for (let i = 0; i < moteCount; i++) {
        const m = new THREE.SpriteMaterial({
          map: this.glowTex,
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          opacity: 0.35,
          color: i % 3 === 0 ? 0xfde68a : i % 2 === 0 ? 0x7dd3fc : 0xc4b5fd,
        });
        const sp = new THREE.Sprite(m);
        sp.scale.setScalar(0.24 + (i % 3) * 0.08);
        this.scene.add(sp);
        this.motes.push(sp);
      }

      // Error indicator ring
      const errMat = new THREE.MeshBasicMaterial({
        color: 0xf43f5e,
        transparent: true,
        opacity: 0.85,
        side: THREE.DoubleSide,
      });
      this.errorRing = new THREE.Mesh(new THREE.RingGeometry(0.45, 0.68, 28), errMat);
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

      canvas.addEventListener('webglcontextlost', (e) => {
        e.preventDefault();
        this.lost = true;
      });
      canvas.addEventListener('webglcontextrestored', () => {
        this.lost = false;
        this.key = '';
        this.levelKey = '';
      });
    }

    mat(color, opts) {
      const m = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.62,
        metalness: 0.14,
        ...(opts || {}),
      });
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

    // BRAND NEW MODEL 1: Пиксель — Orange/Pearl Rounded Space Explorer Rover-Bot
    createPixelBot() {
      const root = new THREE.Group();
      const shell = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.28, metalness: 0.15 });
      const orange = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.34, metalness: 0.22 });
      const slate = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4, metalness: 0.35 });
      const visor = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.12, metalness: 0.4 });
      const eyeMat = new THREE.MeshStandardMaterial({ color: 0x67e8f9, emissive: 0x22d3ee, emissiveIntensity: 0.85 });
      const gold = new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xeab308, emissiveIntensity: 0.35 });

      // Hover base ring & glowing thruster
      const hoverRing = this.mesh(new THREE.TorusGeometry(0.32, 0.055, 10, 24), slate, root, 0, 0.24, 0);
      hoverRing.rotation.x = Math.PI / 2;
      const thruster = this.mesh(new THREE.CylinderGeometry(0.22, 0.12, 0.12, 16), eyeMat, root, 0, 0.19, 0);
      thruster.castShadow = false;

      // Rounded torso + chest core
      this.mesh(softBox(0.64, 0.52, 0.5, 0.14), shell, root, 0, 0.62, 0);
      this.mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.06, 16), eyeMat, root, 0, 0.62, -0.24).rotation.x = Math.PI / 2;
      this.mesh(softBox(0.46, 0.32, 0.16, 0.06), orange, root, 0, 0.64, 0.24); // backpack jetpack

      // Head dome with curved visor
      const head = this.group(root, 0, 1.2, 0);
      this.mesh(softBox(0.86, 0.56, 0.64, 0.16), shell, head, 0, 0, 0);
      this.mesh(softBox(0.7, 0.34, 0.08, 0.08), visor, head, 0, 0.01, -0.32);

      // Ear pods
      for (const sx of [-0.46, 0.46]) {
        const ear = this.mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.1, 14), orange, head, sx, 0, 0);
        ear.rotation.z = Math.PI / 2;
      }

      // Expressive LED eyes
      const eyes = [];
      for (const ex of [-0.17, 0.17]) {
        eyes.push(this.mesh(new THREE.SphereGeometry(0.085, 12, 10), eyeMat, head, ex, 0.03, -0.355));
      }

      // Radar antenna
      const antenna = this.group(head, 0, 0.3, 0);
      this.mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.22, 10), orange, antenna, 0, 0.1, 0);
      this.mesh(new THREE.SphereGeometry(0.095, 14, 12), gold, antenna, 0, 0.24, 0);

      // Articulated manipulator arms
      const arms = [];
      for (const ax of [-0.46, 0.46]) {
        const arm = this.group(root, ax, 0.72, 0);
        this.mesh(new THREE.CylinderGeometry(0.075, 0.065, 0.34, 10), orange, arm, 0, -0.14, 0);
        this.mesh(new THREE.SphereGeometry(0.09, 10, 8), slate, arm, 0, -0.3, 0);
        arms.push(arm);
      }

      const arrow = this.makeArrowMesh(0xf97316);
      root.add(arrow);

      const badge = badgeSprite('1', '#ea580c');
      badge.position.set(0, 2.35, 0);
      badge.visible = false;
      root.add(badge);

      return { root, head, arms, eyes, thruster, antenna, badge, baseY: 0.06 };
    }

    // BRAND NEW MODEL 2: Битик — Cyan/Violet Sleek Hover-Drone Companion
    createBitikBot() {
      const root = new THREE.Group();
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0xe0f2fe, roughness: 0.25, metalness: 0.22 });
      const cyan = new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.3, metalness: 0.28 });
      const violet = new THREE.MeshStandardMaterial({ color: 0x6366f1, roughness: 0.32, metalness: 0.25 });
      const visor = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1, metalness: 0.4 });
      const eyeMat = new THREE.MeshStandardMaterial({ color: 0xf472b6, emissive: 0xec4899, emissiveIntensity: 0.85 });
      const glowRing = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0ea5e9, emissiveIntensity: 0.7 });

      // Floating double hover rings
      const thruster = this.mesh(new THREE.TorusGeometry(0.3, 0.045, 10, 24), glowRing, root, 0, 0.28, 0);
      thruster.rotation.x = Math.PI / 2;

      // Sleek tapered hover chassis
      const torso = this.mesh(new THREE.CylinderGeometry(0.36, 0.2, 0.52, 8), bodyMat, root, 0, 0.65, 0);
      torso.rotation.y = Math.PI / 8;

      // Head capsule
      const head = this.group(root, 0, 1.18, 0);
      this.mesh(softBox(0.8, 0.48, 0.58, 0.16), bodyMat, head, 0, 0, 0);
      this.mesh(softBox(0.66, 0.3, 0.08, 0.08), visor, head, 0, 0, -0.29);

      // Twin antenna fins
      const antenna = this.group(head, 0, 0.26, 0);
      for (const sx of [-0.22, 0.22]) {
        const fin = this.mesh(new THREE.ConeGeometry(0.055, 0.28, 6), violet, antenna, sx, 0.1, 0);
        fin.rotation.z = sx < 0 ? 0.25 : -0.25;
      }

      const eyes = [];
      for (const ex of [-0.16, 0.16]) {
        eyes.push(this.mesh(softBox(0.11, 0.11, 0.04, 0.03), eyeMat, head, ex, 0.01, -0.335));
      }

      // Twin aero wing-arms
      const arms = [];
      for (const sx of [-0.48, 0.48]) {
        const arm = this.group(root, sx, 0.72, 0);
        const wing = this.mesh(softBox(0.14, 0.38, 0.28, 0.04), cyan, arm, 0, -0.05, 0.04);
        wing.rotation.z = sx < 0 ? 0.18 : -0.18;
        arms.push(arm);
      }

      const arrow = this.makeArrowMesh(0x06b6d4);
      root.add(arrow);

      const badge = badgeSprite('2', '#0284c7');
      badge.position.set(0, 2.35, 0);
      badge.visible = false;
      root.add(badge);

      return { root, head, arms, eyes, thruster, antenna, badge, baseY: 0.1 };
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

    rebuild(level, grid, biome, isTeam) {
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
      this.orbiters = [];

      this.cols = grid[0].length;
      this.rows = grid.length;
      const ts = this.tileSize;
      const b = biome || window.KodoLevels.BIOMES[0];

      const deck1 = this.mat(b.deck, { roughness: 0.52, metalness: 0.12 });
      const deck2 = this.mat(b.deck2, { roughness: 0.55, metalness: 0.12 });
      const trim = this.mat(b.trim, { roughness: 0.45, metalness: 0.32 });
      const baseMat = this.mat(b.base, { roughness: 0.6, metalness: 0.25 });
      const rockMat = this.mat(b.rock, { roughness: 0.85, metalness: 0.08, flatShading: true });
      const plasmaMat = new THREE.MeshPhysicalMaterial({
        color: b.plasma,
        emissive: b.glow,
        emissiveIntensity: 0.16,
        roughness: 0.2,
        metalness: 0.15,
        transparent: true,
        opacity: 0.72,
      });
      plasmaMat.color.convertSRGBToLinear();
      this.mats.push(plasmaMat);

      const glowMat = this.mat(b.glow, { emissive: b.glow, emissiveIntensity: 0.65, roughness: 0.2 });

      // Floating Orbital Station Hull & Reactor Core underneath
      const bw = this.cols * ts - 0.15;
      const bd = this.rows * ts - 0.15;
      const hull = this.mesh(this.geo(softBox(bw, bd, 0.65, 0.28)), baseMat, this.terrain, 0, -0.78, 0);
      hull.rotation.x = -Math.PI / 2;

      const underGeo = new THREE.CylinderGeometry(
        Math.min(bw, bd) * 0.36,
        Math.min(bw, bd) * 0.14,
        1.7,
        8
      );
      this.mesh(this.geo(underGeo), trim, this.terrain, 0, -1.9, 0);

      // Glowing spinning anti-gravity ring under the station
      this.reactorRing = this.mesh(
        this.geo(new THREE.TorusGeometry(Math.min(bw, bd) * 0.32, 0.09, 10, 32)),
        glowMat,
        this.terrain,
        0,
        -2.25,
        0
      );
      this.reactorRing.rotation.x = Math.PI / 2;
      this.reactorRing.castShadow = false;

      const tileGeo = this.geo(softBox(ts - 0.1, ts - 0.1, 0.22, 0.09));
      const underTileGeo = this.geo(new THREE.BoxGeometry(ts - 0.12, 0.45, ts - 0.12));
      const plasmaGeo = this.geo(new THREE.BoxGeometry(ts - 0.03, 0.06, ts - 0.03));

      const crystalMat1 = this.mat(0xf472b6, { emissive: 0xdb2777, emissiveIntensity: 0.45, roughness: 0.18, metalness: 0.2 });
      const crystalMat2 = this.mat(0x38bdf8, { emissive: 0x0284c7, emissiveIntensity: 0.4, roughness: 0.18, metalness: 0.2 });
      const copperMat = this.mat(0x92400e, { roughness: 0.45, metalness: 0.45 });
      const amberMat = this.mat(0xf59e0b, { emissive: 0xd97706, emissiveIntensity: 0.55, roughness: 0.3 });
      const greenGlow = this.mat(0x34d399, { emissive: 0x10b981, emissiveIntensity: 0.65, roughness: 0.2 });
      const solarBlue = this.mat(0x1d4ed8, { roughness: 0.2, metalness: 0.6 });
      const darkSteel = this.mat(0x1e293b, { roughness: 0.38, metalness: 0.6 });
      const laserMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e, transparent: true, opacity: 0.85 });
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

          // Small tech corner bolts on plain deck
          if (type === '.' && n > 0.65) {
            const dot = this.mesh(this.geo(new THREE.CylinderGeometry(0.06, 0.06, 0.03, 6)), glowMat, g, 0.45, 0.07, -0.45);
            dot.castShadow = false;
          }

          // Asteroid / Meteorite Rock Obstacle (R)
          if (type === 'R') {
            const rg = this.group(g, 0, 0.08, 0);
            const main = this.mesh(this.geo(new THREE.DodecahedronGeometry(0.48, 0)), rockMat, rg, 0, 0.38, 0);
            main.scale.set(1.05, 0.9 + n * 0.35, 0.95);
            main.rotation.set(n * 3, n * 5, 0);
            const sub = this.mesh(this.geo(new THREE.DodecahedronGeometry(0.28, 0)), rockMat, rg, 0.32, 0.22, 0.24);
            sub.rotation.set(n * 2, 1.2, 0);
            // Embedded glowing ore shard
            const ore = this.mesh(this.geo(new THREE.OctahedronGeometry(0.16, 0)), glowMat, rg, -0.22, 0.62, -0.15);
            ore.scale.set(0.7, 1.5, 0.7);
            ore.rotation.z = 0.4;
          }

          // Energy Crystal Cluster (C)
          if (type === 'C') {
            const cg = this.group(g, 0, 0.08, 0);
            const pad = this.mesh(this.geo(new THREE.CylinderGeometry(0.42, 0.48, 0.08, 6)), darkSteel, cg, 0, 0.04, 0);
            pad.castShadow = false;
            const cluster = this.group(cg, 0, 0.14, 0);
            const c1 = this.mesh(this.geo(new THREE.OctahedronGeometry(0.26, 0)), crystalMat1, cluster, 0, 0.36, 0);
            c1.scale.set(0.78, 1.65, 0.78);
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
            const warnRing = this.mesh(this.geo(new THREE.TorusGeometry(0.35, 0.045, 8, 24)), amberMat, sg, 0, 0.12, 0);
            warnRing.rotation.x = Math.PI / 2;
            const core = this.mesh(this.geo(new THREE.CylinderGeometry(0.16, 0.2, 0.12, 8)), darkSteel, sg, 0, 0.13, 0);
            this.modules.push({ ring: warnRing, core, phase: n * 6.28 });
          }

          // Repaired Active Solar Beacon (V) — walkable!
          if (type === 'V') {
            const vg = this.group(g, 0, 0.08, 0);
            this.mesh(this.geo(new THREE.CylinderGeometry(0.44, 0.48, 0.06, 6)), darkSteel, vg, 0, 0.03, 0);
            const ring = this.mesh(this.geo(new THREE.TorusGeometry(0.36, 0.035, 8, 24)), greenGlow, vg, 0, 0.07, 0);
            ring.rotation.x = Math.PI / 2;
            // Mini tilted solar petals around rim so center stays clean
            for (let k = 0; k < 4; k++) {
              const ang = (k * Math.PI) / 2 + Math.PI / 4;
              const panel = this.mesh(this.geo(new THREE.BoxGeometry(0.22, 0.03, 0.14)), solarBlue, vg, Math.cos(ang) * 0.44, 0.12, Math.sin(ang) * 0.44);
              panel.rotation.y = -ang;
              panel.rotation.x = 0.3;
            }
            const gem = this.mesh(this.geo(new THREE.OctahedronGeometry(0.12, 0)), greenGlow, vg, 0, 0.22, 0);
            this.solars.push({ gem, phase: n * 6.28 });
          }

          // Power Console Switch (K)
          if (type === 'K') {
            const kg = this.group(g, 0, 0.08, 0);
            this.mesh(this.geo(new THREE.CylinderGeometry(0.48, 0.54, 0.12, 6)), darkSteel, kg, 0, 0.06, 0);
            const pad = this.mesh(this.geo(new THREE.CylinderGeometry(0.34, 0.34, 0.05, 6)), amberMat, kg, 0, 0.13, 0);
            const sp = badgeSprite('⚡', '#d97706');
            sp.position.set(0, 1.15, 0);
            sp.scale.set(0.65, 0.65, 0.65);
            kg.add(sp);
            this.switches.push({ pad, sp, phase: n * 6.28 });
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

          // Portals (B = Pixel Gold, E = Bitik Cyan)
          if (type === 'B' || type === 'E') {
            const isGold = type === 'B';
            const col = isGold ? 0xfbbf24 : 0x38bdf8;
            const em = isGold ? 0xd97706 : 0x0284c7;
            const pg = this.group(g, 0, 0.08, 0);
            const pMat = this.mat(col, { emissive: em, emissiveIntensity: 0.55, roughness: 0.25, metalness: 0.4 });
            this.mesh(this.geo(new THREE.CylinderGeometry(0.48, 0.54, 0.14, 16)), darkSteel, pg, 0, 0.07, 0);
            const ring1 = this.mesh(this.geo(new THREE.TorusGeometry(0.46, 0.05, 10, 28)), pMat, pg, 0, 0.62, 0);
            const ring2 = this.mesh(this.geo(new THREE.TorusGeometry(0.32, 0.032, 8, 24)), pMat, pg, 0, 0.62, 0);
            const core = this.mesh(this.geo(new THREE.OctahedronGeometry(0.18, 0)), pMat, pg, 0, 0.62, 0);
            const beamMat = new THREE.MeshBasicMaterial({
              color: col,
              transparent: true,
              opacity: 0.1,
              side: THREE.DoubleSide,
              depthWrite: false,
            });
            this.mats.push(beamMat);
            const beam = this.mesh(this.geo(new THREE.CylinderGeometry(0.42, 0.18, 2.7, 24, 1, true)), beamMat, pg, 0, 1.6, 0);
            beam.castShadow = false;
            beam.receiveShadow = false;

            if (isTeam && !this.hero) {
              const sp = badgeSprite(isGold ? '1' : '2', isGold ? '#ea580c' : '#0284c7');
              sp.position.set(0, 1.95, 0);
              pg.add(sp);
            }
            this.portals.push({ ring1, ring2, core, beam, pMat, isGold });
          }
        }
      }

      // Floating cosmic asteroids & tiny orbital satellites around the station
      const orbitR = Math.max(bw, bd) * 0.68 + 3.8;
      for (let i = 0; i < 6; i++) {
        const ang = (i / 6) * Math.PI * 2 + 0.35;
        const dist = orbitR + (i % 2) * 1.4;
        const og = this.group(this.terrain, Math.cos(ang) * dist, -0.6 + (i % 3 - 1) * 1.1, Math.sin(ang) * dist);
        if (i % 2 === 0) {
          // Mini asteroid with crystal
          const ast = this.mesh(this.geo(new THREE.DodecahedronGeometry(0.55 + (i % 3) * 0.18, 0)), rockMat, og);
          ast.castShadow = false;
          const cr = this.mesh(this.geo(new THREE.OctahedronGeometry(0.2, 0)), glowMat, og, 0.3, 0.4, 0);
          cr.castShadow = false;
        } else {
          // Tiny orbiting satellite with solar wings
          const sat = this.mesh(this.geo(new THREE.BoxGeometry(0.32, 0.32, 0.32)), glowMat, og);
          sat.castShadow = false;
          for (const sx of [-0.48, 0.48]) {
            const w = this.mesh(this.geo(new THREE.BoxGeometry(0.5, 0.04, 0.24)), solarBlue, og, sx, 0, 0);
            w.castShadow = false;
          }
        }
        this.orbiters.push({ g: og, ang, dist, baseY: og.position.y, speed: 0.06 + (i % 3) * 0.025 });
      }

      this.terrain.updateMatrixWorld(true);
      this.worldRoot.updateMatrixWorld(true);
      this.renderer.shadowMap.needsUpdate = true;
    }

    setMood(robotIdx, type) {
      const entry = { type, start: performance.now() };
      if (robotIdx === -1) {
        this.moods[0] = { ...entry };
        this.moods[1] = { ...entry };
      } else {
        this.moods[robotIdx] = entry;
      }
    }

    clearMoods() {
      this.moods[0] = null;
      this.moods[1] = null;
    }

    flashErrorTile(gx, gz) {
      if (gx === undefined || gz === undefined || !this.cols) return;
      const p = this.pos(gx, gz);
      this.errorRing.position.set(p.x, 0.14, p.z);
      this.errorRing.visible = true;
      this.errorUntil = performance.now() + 2600;
    }

    burst(gx, gz, colorHex, count) {
      if (!this.cols) return;
      const p = this.pos(gx, gz);
      const mat = new THREE.MeshBasicMaterial({ color: colorHex || 0x38bdf8 });
      const geo = new THREE.OctahedronGeometry(0.08, 0);
      const n = count || 18;
      const now = performance.now();
      for (let i = 0; i < n; i++) {
        const o = new THREE.Mesh(geo, mat);
        o.position.set(p.x, 0.55, p.z);
        this.scene.add(o);
        this.fx.push({
          o,
          geo,
          mat,
          start: now,
          origin: o.position.clone(),
          v: new THREE.Vector3(
            (Math.random() - 0.5) * 2.6,
            Math.random() * 2.4 + 1.1,
            (Math.random() - 0.5) * 2.6
          ),
        });
      }
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
      const dir = new THREE.Vector3(this.hero ? 7 : -7.5, 11.5, this.hero ? 11 : 11.5).normalize();
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
      this.controls.minDistance = Math.max(5.5, dist * 0.48);
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

    animateBotRig(rig, statePos, animState, isRunning, motion, time, moodIdx) {
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
        if (animState.jump) jumpY = Math.sin(Math.PI * progress) * 1.35;
      }

      const p = this.pos(rx, rz);
      const bob = motion ? Math.sin(time / 380 + moodIdx * 2) * 0.045 : 0;
      rig.root.position.set(p.x, rig.baseY + jumpY + bob, p.z);
      rig.root.rotation.set(0, this.hero ? Math.PI : angle, 0);

      // Thruster glow pulse
      const tScale = animState && animState.jump ? 1.35 : 1 + (motion ? Math.sin(time / 140) * 0.08 : 0);
      rig.thruster.scale.set(tScale, 1, tScale);

      // Arms & eyes animation
      const moving = !!animState && motion;
      rig.arms.forEach((arm, idx) => {
        arm.rotation.z = 0;
        arm.rotation.x = moving
          ? Math.sin(progress * Math.PI * 3 + idx * Math.PI) * 0.4
          : motion
            ? Math.sin(time / 850 + idx) * 0.06
            : 0;
      });
      const blink = motion && Math.floor(time / 160) % 34 === 0;
      rig.eyes.forEach((eye) => {
        eye.scale.y = blink ? 0.12 : 1;
      });
      rig.antenna.rotation.z = motion ? Math.sin(time / 500 + moodIdx) * 0.08 : 0;

      // Expressive mood overlay (happy hop / sad droop)
      const mood = this.moods[moodIdx];
      if (!this.hero && mood && !isRunning) {
        const age = (time - mood.start) / 1000;
        if (age >= 0 && age < 3.6) {
          const fade = Math.min(1, age * 5) * Math.min(1, (3.6 - age) * 2);
          if (mood.type === 'happy') {
            if (motion) {
              rig.root.position.y += Math.abs(Math.sin(age * Math.PI * 2.4)) * 0.65 * fade;
              rig.root.rotation.z = Math.sin(age * 9) * 0.12 * fade;
            }
            rig.arms.forEach((arm, i) => {
              arm.rotation.z = (i === 0 ? -1 : 1) * (1.7 + Math.sin(age * 10) * 0.25) * fade;
            });
            rig.eyes.forEach((e) => { e.scale.y = 0.55; });
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
      const { level, grid, biome, robots, activeRobot, anim, completed, running, motion, levelId } = state;
      const isTeam = robots.length > 1;
      const lKey = `${this.hero ? 'hero' : levelId}-${biome.id}-${grid[0].length}x${grid.length}-${isTeam ? 2 : 1}`;
      const gKey = JSON.stringify(grid);

      if (gKey !== this.key || lKey !== this.levelKey) {
        const camDirty = lKey !== this.levelKey;
        this.rebuild(level, grid, biome, isTeam);
        this.key = gKey;
        this.levelKey = lKey;
        if (camDirty) this.resetCamera();
      }

      // Lighting phase
      const ph = LIGHT_PHASES[this.phaseIndex];
      this.sun.intensity = ph.sun;
      this.sun.color.setHex(ph.color);
      this.hemi.intensity = ph.hemi;

      // Robots
      this.pixelRig.badge.visible = isTeam && !this.hero;
      this.bitikRig.root.visible = isTeam && !this.hero;
      this.bitikRig.badge.visible = isTeam && !this.hero;

      this.animateBotRig(
        this.pixelRig,
        robots[0],
        !this.hero && anim && activeRobot === 0 ? anim : null,
        running,
        motion,
        time,
        0
      );

      if (isTeam && robots[1]) {
        this.animateBotRig(
          this.bitikRig,
          robots[1],
          !this.hero && anim && activeRobot === 1 ? anim : null,
          running,
          motion,
          time,
          1
        );
      }

      // World ambient animations
      if (motion) {
        const t = time * 0.001;
        if (this.reactorRing) this.reactorRing.rotation.z = t * 0.7;
        this.crystals.forEach(({ g, phase }) => {
          g.rotation.y = t * 0.9 + phase;
          g.position.y = 0.16 + Math.sin(t * 2.2 + phase) * 0.06;
        });
        this.modules.forEach(({ ring, phase }) => {
          const s = 0.94 + Math.sin(t * 3.2 + phase) * 0.08;
          ring.scale.set(s, s, 1);
        });
        this.solars.forEach(({ gem, phase }) => {
          gem.rotation.y = t * 1.4 + phase;
          gem.position.y = 0.24 + Math.sin(t * 2.6 + phase) * 0.04;
        });
        this.lasers.forEach(({ beams, phase }) => {
          const op = 0.65 + Math.sin(t * 9 + phase) * 0.25;
          beams.forEach((b) => { b.material.opacity = op; });
        });
        this.switches.forEach(({ sp, phase }) => {
          sp.position.y = 1.15 + Math.sin(t * 2.5 + phase) * 0.09;
        });
        this.portals.forEach(({ ring1, ring2, core, beam, pMat }) => {
          ring1.rotation.y = t * 0.9;
          ring2.rotation.x = t * 1.2;
          core.rotation.y = -t * 1.6;
          core.position.y = 0.62 + Math.sin(t * 2.4) * 0.07;
          const lit = !this.hero && completed;
          pMat.emissiveIntensity = lit ? 1.5 : 0.55;
          beam.material.opacity = lit ? 0.24 : 0.1;
        });
        this.orbiters.forEach((o) => {
          const a = o.ang + t * o.speed;
          o.g.position.set(Math.cos(a) * o.dist, o.baseY + Math.sin(t * 0.8 + o.ang) * 0.25, Math.sin(a) * o.dist);
          o.g.rotation.y = t * 0.35;
        });
        this.motes.forEach((m, i) => {
          const seed = i * 2.399;
          m.position.set(
            (noise(i, 19) - 0.5) * Math.max(8, this.cols * 1.8) + Math.sin(t * 0.4 + seed) * 1.2,
            0.8 + (i % 5) * 0.7 + Math.sin(t * 0.7 + seed) * 0.4,
            (noise(i, 71) - 0.5) * Math.max(8, this.rows * 1.8) + Math.cos(t * 0.35 + seed) * 1.2
          );
          m.material.opacity = (0.18 + ph.night * 0.65) * (0.45 + 0.55 * Math.sin(t * 2.1 + seed));
        });
      }

      // Error ring pulse
      if (this.errorRing.visible) {
        if (time > this.errorUntil) {
          this.errorRing.visible = false;
        } else {
          const s = 1 + Math.sin(time * 0.014) * 0.14;
          this.errorRing.scale.set(s, s, 1);
        }
      }

      // Sparkle particle bursts
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
        f.o.position.y -= age * age * 1.6;
        f.o.rotation.x += 0.15;
        f.o.rotation.y += 0.12;
        f.o.scale.setScalar(Math.max(0.05, 1 - age / 1.2));
      }

      this.controls.autoRotate = this.hero && motion;
      this.controls.update();
      if (!this.hero && (anim || this.moods[0] || this.moods[1])) {
        this.renderer.shadowMap.needsUpdate = true;
      }
      this.renderer.render(this.scene, this.camera);
    }
  }

  root.KodoScene3D = { Station3D, LIGHT_PHASES };
})(window);
