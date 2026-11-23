(function () {
  'use strict';

  const E = window.KodoEngine;
  const L = window.KodoLevels;
  const Audio = window.KodoAudio;
  const S3D = window.KodoScene3D;
  const $ = (id) => document.getElementById(id);

  const SVG_ICONS = {
    F: 'M12 19V5m-6 6 6-6 6 6',
    L: 'M18 19v-7a5 5 0 0 0-5-5H5m5-4L5 7l5 5',
    R: 'M6 19v-7a5 5 0 0 1 5-5h8m-5-4 5 5-5 5',
    P: 'M12 3v3m0 12v3M4.9 4.9l2.1 2.1m10 10 2.1 2.1M3 12h3m12 0h3M4.9 19.1 7 17m10-10 2.1-2.1M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z',
    C: 'M12 2 5 9l7 13 7-13-7-7Zm0 0v20M5 9h14',
    J: 'm5 11 7-7 7 7M5 19l7-7 7 7',
    U: 'M13 2 5 13h6l-1 9 9-13h-6Z',
    F1: 'M7 19V7a3 3 0 0 1 3-3h3M5 11h6m4 8v-9l-2 2',
    F2: 'M6 19V7a3 3 0 0 1 3-3h3M4 11h6m3 1a2.5 2.5 0 0 1 5 0c0 2-5 4-5 7h5',
    loop: 'M4 9h12a4 4 0 0 1 0 8H6m2 4-4-4 4-4m8-8 4 4-4 4',
    if: 'm12 3 9 9-9 9-9-9 9-9Zm0 5v4m0 4h.01',
  };

  function cmdSvg(code, size) {
    const s = size || 20;
    const d = SVG_ICONS[code] || SVG_ICONS.F;
    return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;
  }

  function esc(str) {
    return String(str).replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  }

  // ==================== 2D STARFIELD + CONFETTI VFX ====================
  const starCanvas = $('starfieldCanvas');
  const starCtx = starCanvas.getContext('2d');
  const stars2d = Array.from({ length: 95 }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: 0.6 + Math.random() * 1.7,
    phase: Math.random() * Math.PI * 2,
    speed: 0.001 + Math.random() * 0.0025,
  }));
  let comet = null;

  function renderStarfield(time) {
    if ($('landing').classList.contains('hidden')) return;
    const w = starCanvas.clientWidth;
    const h = starCanvas.clientHeight;
    if (!w || !h) return;
    if (starCanvas.width !== w || starCanvas.height !== h) {
      starCanvas.width = w;
      starCanvas.height = h;
    }
    starCtx.clearRect(0, 0, w, h);
    for (const s of stars2d) {
      const a = 0.25 + 0.7 * ((Math.sin(time * s.speed + s.phase) + 1) / 2);
      starCtx.fillStyle = `rgba(226, 232, 240, ${a.toFixed(2)})`;
      starCtx.beginPath();
      starCtx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
      starCtx.fill();
    }
    // Occasional shooting star!
    if (!comet && Math.random() < 0.008) {
      comet = { x: Math.random() * w * 0.8 + w * 0.1, y: Math.random() * h * 0.35, vx: 7 + Math.random() * 4, vy: 3 + Math.random() * 2, life: 1 };
    }
    if (comet) {
      starCtx.strokeStyle = `rgba(186, 230, 253, ${comet.life.toFixed(2)})`;
      starCtx.lineWidth = 2;
      starCtx.beginPath();
      starCtx.moveTo(comet.x, comet.y);
      starCtx.lineTo(comet.x - comet.vx * 8, comet.y - comet.vy * 8);
      starCtx.stroke();
      comet.x += comet.vx;
      comet.y += comet.vy;
      comet.life -= 0.025;
      if (comet.life <= 0) comet = null;
    }
  }

  const confCanvas = $('confettiCanvas');
  const confCtx = confCanvas.getContext('2d');
  let confetti = [];

  function launchConfetti(count) {
    if (!save.settings.motion) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    confCanvas.width = w;
    confCanvas.height = h;
    const colors = ['#f97316', '#38bdf8', '#34d399', '#fbbf24', '#ec4899', '#a78bfa'];
    for (let i = 0; i < (count || 85); i++) {
      confetti.push({
        x: w * 0.5 + (Math.random() - 0.5) * w * 0.45,
        y: h * 0.32 + (Math.random() - 0.5) * 60,
        vx: (Math.random() - 0.5) * 11,
        vy: -5 - Math.random() * 8,
        size: 5 + Math.random() * 6,
        rot: Math.random() * 6.28,
        vr: (Math.random() - 0.5) * 0.25,
        col: colors[i % colors.length],
        life: 1,
      });
    }
  }

  function renderConfetti() {
    if (!confetti.length) return;
    const w = confCanvas.width;
    const h = confCanvas.height;
    confCtx.clearRect(0, 0, w, h);
    for (let i = confetti.length - 1; i >= 0; i--) {
      const c = confetti[i];
      c.x += c.vx;
      c.y += c.vy;
      c.vy += 0.28;
      c.rot += c.vr;
      c.life -= 0.011;
      if (c.life <= 0 || c.y > h + 30) {
        confetti.splice(i, 1);
        continue;
      }
      confCtx.save();
      confCtx.globalAlpha = Math.min(1, c.life * 1.6);
      confCtx.translate(c.x, c.y);
      confCtx.rotate(c.rot);
      confCtx.fillStyle = c.col;
      confCtx.fillRect(-c.size / 2, -c.size / 4, c.size, c.size / 2);
      confCtx.restore();
    }
    if (!confetti.length) confCtx.clearRect(0, 0, w, h);
  }

  // ==================== PERSISTENT SAVE STATE ====================
  const SAVE_KEY = 'kodobots-3d-v2';
  let save = {
    stars: Array(L.LEVELS.length).fill(0),
    badges: {},
    quizBest: 0,
    lastLevel: 0,
    heroSkin: 'pixel',
    custom: null,
    settings: {
      music: true,
      sfx: true,
      haptics: true,
      volume: 0.34,
      speed: 1,
      motion: true,
      unlockAll: false,
    },
  };

  function loadSave() {
    try {
      const raw = JSON.parse(localStorage.getItem(SAVE_KEY) || localStorage.getItem('kodobots-3d-v1') || '{}');
      if (Array.isArray(raw.stars)) {
        save.stars = Array.from({ length: L.LEVELS.length }, (_, i) => Math.min(3, Math.max(0, Number(raw.stars[i]) || 0)));
      }
      if (raw.badges && typeof raw.badges === 'object') save.badges = raw.badges;
      if (typeof raw.quizBest === 'number') save.quizBest = raw.quizBest;
      if (typeof raw.lastLevel === 'number') save.lastLevel = Math.min(L.LEVELS.length - 1, Math.max(0, raw.lastLevel));
      if (raw.heroSkin && L.CHARACTERS.some((c) => c.id === raw.heroSkin)) save.heroSkin = raw.heroSkin;
      if (raw.custom) save.custom = raw.custom;
      if (raw.settings) save.settings = { ...save.settings, ...raw.settings };
    } catch (e) {}
    Audio.configure(save.settings);
  }

  function persist() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) {}
  }

  function highestUnlocked() {
    if (save.settings.unlockAll) return L.LEVELS.length - 1;
    let i = 0;
    while (i < L.LEVELS.length - 1 && save.stars[i] > 0) i++;
    return i;
  }

  // ==================== RUNTIME STATE ====================
  let levelIndex = 0;
  let level = null;
  let world = null;
  let builder = false;
  let testing = false;
  let brush = '.';
  let workshopMenuOpen = false;
  let mapVariant = 0;

  // Support up to 3 robots!
  let activeRobot = 0;
  let programs = [[], [], []];
  let fn1s = [[], [], []];
  let fn2s = [[], [], []];
  let robots = [{ x: 0, z: 0, d: 0 }];
  let progress = [0, 1, 2].map(() => ({ pointer: 0, flat: [], done: false, failed: false, actions: 0 }));

  let editorScope = 'main'; // 'main' | 'fn1' | 'fn2' | 'code'
  let running = false;
  let stepping = false;
  let completed = false;
  let failed = false;
  let activeScope = null;
  let activeRow = -1;
  let activeTrace = '';
  let errorScope = null;
  let errorRow = -1;
  let runToken = 0;
  let anim = null;
  let hintStage = 0;
  let coachDismissed = false;
  let toastTimer = null;

  let totalCrystals = 0;
  let totalModules = 0;
  let collectedCrystals = 0;
  let fixedModules = 0;

  let game3D = null;
  let hero3D = null;
  let webglFailed = false;

  function robotCnt() {
    return (builder || !level) ? 1 : E.robotCount(level);
  }

  function isTeam() {
    return robotCnt() > 1;
  }

  function activeHeroName() {
    if (isTeam()) return E.ROBOT_NAMES[activeRobot];
    const ch = L.CHARACTERS.find((c) => c.id === save.heroSkin);
    return ch ? ch.name : 'Пиксель';
  }

  function currentList() {
    if (editorScope === 'fn1') return fn1s[activeRobot];
    if (editorScope === 'fn2') return fn2s[activeRobot];
    return programs[activeRobot];
  }

  function allowedCommands() {
    if (builder) return ['F', 'L', 'R', 'P', 'C', 'J', 'U', 'F1', 'F2', 'loop', 'if'];
    return level.allowed || ['F'];
  }

  function totalBlocksUsed() {
    const cnt = robotCnt();
    let sum = 0;
    for (let i = 0; i < cnt; i++) {
      sum += E.countBlocks(programs[i]) + E.countBlocks(fn1s[i]) + E.countBlocks(fn2s[i]);
    }
    return sum;
  }

  function toast(msg) {
    const el = $('toast');
    el.textContent = msg;
    el.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.add('hidden'), 3300);
  }

  function unlockBadge(id) {
    if (save.badges[id]) return;
    save.badges[id] = true;
    persist();
    Audio.fx('badge');
    const b = L.BADGES.find((x) => x.id === id);
    if (b) toast(`🏆 Достижение: ${b.icon} ${b.name}!`);
    updateLandingUI();
  }

  function checkProgressBadges() {
    const s = save.stars;
    const totalStars = s.reduce((a, b) => a + b, 0);
    if (s.some((n) => n > 0)) unlockBadge('first');
    L.CHAPTERS.forEach((ch, idx) => {
      if (s.slice(ch.from, ch.to + 1).every((n) => n > 0)) unlockBadge(`ch${idx + 1}`);
    });
    if (totalStars >= 50) unlockBadge('stars50');
    if (totalStars >= 120) unlockBadge('stars120');
  }

  // ==================== LEVEL LIFECYCLE ====================
  function stopExec() {
    running = false;
    stepping = false;
    runToken++;
    anim = null;
    syncControls();
  }

  function loadLevel(idx) {
    stopExec();
    closeStagePopovers();
    builder = false;
    testing = false;
    workshopMenuOpen = false;
    levelIndex = idx;
    save.lastLevel = idx;
    persist();

    level = E.clone(L.LEVELS[idx]);
    mapVariant = 0;
    activeRobot = 0;
    editorScope = 'main';
    programs = [level.starter ? E.clone(level.starter) : [], [], []];
    fn1s = [level.starterFn1 ? E.clone(level.starterFn1) : [], [], []];
    fn2s = [[], [], []];
    hintStage = 0;
    coachDismissed = false;

    const biome = L.BIOMES[level.biome] || L.BIOMES[0];
    Audio.setMood(biome.musicMood);

    $('workshopBar').classList.add('hidden');
    resetWorld();
    renderAll();
    if (level.starter || level.starterFn1) {
      setStatus('pause', '🐞 В заготовке спрятан баг! Запусти программу по шагам (▷) и исправь ошибку.');
    }
  }

  function resetWorld() {
    world = builder ? E.clone(level.grid) : E.gridForVariant(level, mapVariant);
    robots = [E.clone(level.start)];
    if (!builder && level.start2) robots.push(E.clone(level.start2));
    if (!builder && level.start3) robots.push(E.clone(level.start3));

    progress = [0, 1, 2].map((i) => ({
      pointer: 0,
      flat: E.expand(programs[i], fn1s[i], fn2s[i]),
      done: false,
      failed: false,
      actions: 0,
    }));

    totalCrystals = world.flat().filter((t) => t === 'C').length;
    totalModules = world.flat().filter((t) => t === 'S').length;
    collectedCrystals = 0;
    fixedModules = 0;
    completed = false;
    failed = false;
    activeScope = null;
    activeRow = -1;
    activeTrace = '';
    errorScope = null;
    errorRow = -1;
    if (game3D) game3D.clearMoods();
    renderObjectives();
    syncControls();
  }

  function applyStageTheme() {
    const biome = L.BIOMES[level.biome] || L.BIOMES[0];
    const ph = game3D ? S3D.LIGHT_PHASES[game3D.phaseIndex] : S3D.LIGHT_PHASES[0];
    const panel = $('stagePanel');
    const isDark = ph.night > 0.5;
    panel.classList.toggle('is-dark', isDark);
    if (isDark) {
      panel.style.background = `radial-gradient(circle at 25% 12%, ${biome.nightSky[1]}, ${biome.nightSky[0]} 75%)`;
    } else if (ph.night > 0.3) {
      panel.style.background = 'radial-gradient(circle at 25% 10%, #fed7aa, #a78bfa 58%, #312e81)';
    } else {
      panel.style.background = `radial-gradient(circle at 22% 10%, ${biome.sky[0]}, ${biome.sky[1]} 55%, ${biome.sky[2]})`;
    }
  }

  function renderAll() {
    const ch = L.chapterFor(levelIndex);
    const biome = L.BIOMES[level.biome] || L.BIOMES[0];

    $('chapterLabel').textContent = builder ? 'МАСТЕРСКАЯ 3D' : ch.title;
    $('levelTag').textContent = builder
      ? (testing ? 'Тест станции' : 'Редактор карты')
      : `Станция ${String(levelIndex + 1).padStart(2, '0')} / ${L.LEVELS.length}`;
    $('biomeTag').textContent = `${biome.icon} ${biome.short}`;
    $('levelName').textContent = level.name;
    $('levelDesc').textContent = builder
      ? (testing ? 'Проверь свою станцию программой!' : 'Выбирай кисть и нажимай на клетки 3D-станции.')
      : level.desc;

    applyStageTheme();
    renderSpecialBars();
    renderScopeTabs();
    renderReqStrip();
    renderWorkspace();
    renderPalette();
    renderObjectives();
    renderCoach();
    setStatus('ready');
    syncControls();
  }

  function renderSpecialBars() {
    const rTabs = $('robotTabs');
    const cnt = robotCnt();
    rTabs.classList.toggle('hidden', cnt <= 1);
    if (cnt > 1) {
      rTabs.replaceChildren();
      for (let idx = 0; idx < cnt; idx++) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = `robot-tab r${idx}` + (activeRobot === idx ? ' active' : '');
        b.disabled = running || !!anim;
        b.textContent = `${idx + 1} · ${E.ROBOT_NAMES[idx]}${progress[idx].done ? ' ✓' : ''}`;
        b.onclick = () => switchRobot(idx);
        rTabs.append(b);
      }
    }

    const vBtn = $('variantBtn');
    const showVar = !builder && !!level.adaptiveCells;
    vBtn.classList.toggle('hidden', !showVar);
    if (showVar) {
      vBtn.textContent = `🔀 Карта ${mapVariant + 1} / 2 · переключить датчики`;
    }
  }

  function renderScopeTabs() {
    const allow = allowedCommands();
    const hasF1 = allow.includes('F1');
    const hasF2 = allow.includes('F2');
    $('tabFn1').classList.toggle('hidden', !hasF1);
    $('tabFn2').classList.toggle('hidden', !hasF2);
    if (!hasF1 && editorScope === 'fn1') editorScope = 'main';
    if (!hasF2 && editorScope === 'fn2') editorScope = 'main';

    document.querySelectorAll('#scopeTabs .scope-tab').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.scope === editorScope);
    });
    const c1 = E.countBlocks(fn1s[activeRobot]);
    const c2 = E.countBlocks(fn2s[activeRobot]);
    $('tabFn1').textContent = c1 ? `ƒ F1 (${c1})` : 'ƒ F1';
    $('tabFn2').textContent = c2 ? `ƒ F2 (${c2})` : 'ƒ F2';

    $('workspace').classList.toggle('hidden', editorScope === 'code');
    $('codeView').classList.toggle('hidden', editorScope !== 'code');
  }

  function renderReqStrip() {
    const strip = $('reqStrip');
    if (builder) { strip.classList.add('hidden'); return; }
    const items = [];
    const cnt = robotCnt();
    const activeProgs = programs.slice(0, cnt);
    const activeF1 = fn1s.slice(0, cnt);
    const activeF2 = fn2s.slice(0, cnt);

    if (level.requireLoop) {
      const met = activeProgs.every((p, i) => E.hasBlockType(p, 'loop') || E.hasBlockType(activeF1[i], 'loop') || E.hasBlockType(activeF2[i], 'loop'));
      items.push({ text: '⟳ Повтор', met });
    }
    if (level.requireFn) {
      const met = activeProgs.some((p, i) => (E.hasBlockType(p, 'F1') || E.hasBlockType(activeF2[i], 'F1')) && activeF1[i].length > 0);
      items.push({ text: 'ƒ Функция F1', met });
    }
    if (level.requireFn2) {
      const met = activeProgs.some((p, i) => (E.hasBlockType(p, 'F2') || E.hasBlockType(activeF1[i], 'F2')) && activeF2[i].length > 0);
      items.push({ text: 'ƒ Функция F2', met });
    }
    if (level.requireIf) {
      const met = activeProgs.every((p, i) => E.hasBlockType(p, 'if') || E.hasBlockType(activeF1[i], 'if') || E.hasBlockType(activeF2[i], 'if'));
      items.push({ text: '◇ «Если…»', met });
    }
    if (level.adaptiveCells) {
      items.push({ text: '🔀 2 карты', met: false });
    }

    strip.classList.toggle('hidden', !items.length);
    strip.replaceChildren();
    items.forEach((it) => {
      const sp = document.createElement('span');
      sp.className = 'req-badge' + (it.met ? ' met' : '');
      sp.textContent = (it.met ? '✓ ' : '') + it.text;
      strip.append(sp);
    });
  }

  function renderObjectives() {
    const el = $('objectives');
    el.replaceChildren();
    const pills = [];
    if (totalCrystals > 0) pills.push({ icon: '◆', label: 'Кристаллы', cur: collectedCrystals, max: totalCrystals });
    if (totalModules > 0) pills.push({ icon: '☀', label: 'Модули', cur: fixedModules, max: totalModules });
    const cnt = robotCnt();
    if (cnt > 1) {
      const doneCnt = progress.slice(0, cnt).filter((p) => p.done).length;
      pills.push({ icon: '◎', label: 'Порталы', cur: doneCnt, max: cnt });
    } else {
      pills.push({ icon: '◎', label: 'Портал', cur: completed ? 1 : 0, max: 1 });
    }
    pills.forEach((p) => {
      const d = document.createElement('div');
      d.className = 'obj-pill' + (p.cur >= p.max ? ' done' : '');
      d.innerHTML = `<span>${p.icon}</span><span>${p.label}</span><b>${p.cur}/${p.max}</b>`;
      el.append(d);
    });
  }

  function renderCoach() {
    const card = $('coachCard');
    if (builder || coachDismissed || running || completed || !level.coach) {
      card.classList.add('hidden');
      return;
    }
    if (save.stars[levelIndex] > 0 && levelIndex !== 0) {
      card.classList.add('hidden');
      return;
    }
    const [tag, title, text] = level.coach;
    card.classList.remove('hidden');
    card.innerHTML = `
      <button class="coach-close" type="button" aria-label="Скрыть">×</button>
      <div class="coach-avatar" aria-hidden="true">🤖</div>
      <div>
        <div class="coach-tag">${esc(tag)}</div>
        <strong>${esc(title)}</strong>
        <p>${esc(text)}</p>
      </div>
    `;
    card.querySelector('.coach-close').onclick = () => {
      coachDismissed = true;
      card.classList.add('hidden');
    };
  }

  function highlightPython(text) {
    if (/^\s*#/.test(text)) {
      return `<span class="py-cm">${esc(text)}</span>`;
    }
    const tokens = [];
    const safe = esc(text).replace(/(&quot;.*?&quot;)/g, (m) => {
      tokens.push(`<span class="py-str">${m}</span>`);
      return `\x00${tokens.length - 1}\x00`;
    });
    const colored = safe
      .replace(/\b(def|for|in|range|if|else|pass)\b/g, '<span class="py-kw">$1</span>')
      .replace(/(вперёд|налево|направо|починить|собрать|прыжок|сигнал|датчик|f1|f2)(?=\()/g, '<span class="py-fn">$1</span>');
    return colored.replace(/\x00(\d+)\x00/g, (_, i) => tokens[Number(i)]);
  }

  function renderWorkspace() {
    const used = totalBlocksUsed();
    const maxB = builder ? 64 : (level.maxBlocks || 64);
    const counter = $('blockCounter');
    counter.textContent = `${used} / ${maxB}`;
    counter.classList.toggle('over', used > maxB);

    renderScopeTabs();
    renderReqStrip();

    if (editorScope === 'code') {
      const cv = $('codeView');
      const lines = E.toPseudocode(programs[activeRobot], fn1s[activeRobot], fn2s[activeRobot], activeHeroName());
      cv.replaceChildren();
      lines.forEach((ln) => {
        const div = document.createElement('div');
        const isAct = activeRow >= 0 && ln.scope === activeScope && ln.row === activeRow;
        div.className = 'py-line' + (isAct ? ' active' : '');
        div.innerHTML = ln.text ? highlightPython(ln.text) : '&nbsp;';
        cv.append(div);
      });
      return;
    }

    const ws = $('workspace');
    const list = currentList();
    ws.replaceChildren();

    if (!list.length) {
      const empty = document.createElement('div');
      empty.className = 'empty-ws';
      empty.innerHTML = editorScope === 'fn1' || editorScope === 'fn2'
        ? `<b>Функция ${editorScope.toUpperCase()} пока пуста</b><span>Собери здесь повторяющуюся связку команд и вызывай её одним блоком!</span>`
        : `<b>Алгоритм: ${esc(activeHeroName())}</b><span>Выбирай команды внизу. Нажми на блок в списке, чтобы его изменить.</span>`;
      ws.append(empty);
      return;
    }

    list.forEach((node, idx) => {
      const isAct = activeScope === editorScope && activeRow === idx;
      const isErr = errorScope === editorScope && errorRow === idx;
      const code = typeof node === 'string' ? node : node.type;
      const meta = E.CMD[code] || E.CMD.F;

      const row = document.createElement('div');
      row.className = 'block-row' + (isAct ? ' active' : '') + (isErr ? ' error' : '');
      row.style.setProperty('--block-col', meta.color);
      row.dataset.row = idx;

      const num = document.createElement('span');
      num.className = 'block-idx';
      num.textContent = String(idx + 1).padStart(2, '0');

      const mainBtn = document.createElement('button');
      mainBtn.type = 'button';
      mainBtn.className = 'block-main';
      mainBtn.disabled = running;
      mainBtn.onclick = () => openBlockEditor(idx);

      const title = document.createElement('div');
      title.className = 'block-title';
      title.innerHTML = `<span style="color:${meta.color};display:inline-flex">${cmdSvg(code, 17)}</span>`
        + `<span>${esc(typeof node === 'string' ? meta.name : node.type === 'loop' ? `Повторить ${node.n} раз` : `Если ${E.SENSOR_LABELS[node.test]}…`)}</span>`
        + (isAct && activeTrace ? `<span class="trace-tag">${esc(activeTrace)}</span>` : '');
      mainBtn.append(title);

      if (typeof node !== 'string') {
        const sub = document.createElement('div');
        sub.className = 'block-sub';
        sub.textContent = node.type === 'loop'
          ? node.body.map(E.formatBlock).join(' → ')
          : `✓ ${node.yes.map(E.formatBlock).join(' → ') || 'ничего'}  |  ✗ ${node.no.map(E.formatBlock).join(' → ') || 'ничего'}`;
        mainBtn.append(sub);
      }

      const acts = document.createElement('div');
      acts.className = 'block-actions';

      const up = document.createElement('button');
      up.type = 'button';
      up.className = 'row-btn';
      up.textContent = '↑';
      up.disabled = running || idx === 0;
      up.onclick = (ev) => {
        ev.stopPropagation();
        prepareEdit();
        [list[idx - 1], list[idx]] = [list[idx], list[idx - 1]];
        afterEdit();
      };

      const del = document.createElement('button');
      del.type = 'button';
      del.className = 'row-btn del';
      del.textContent = '×';
      del.disabled = running;
      del.onclick = (ev) => {
        ev.stopPropagation();
        prepareEdit();
        list.splice(idx, 1);
        afterEdit();
      };

      acts.append(up, del);
      row.append(num, mainBtn, acts);
      ws.append(row);
    });

    if (activeScope === editorScope && activeRow >= 0) {
      const el = ws.querySelector(`[data-row="${activeRow}"]`);
      if (el) el.scrollIntoView({ block: 'nearest', behavior: 'auto' });
    }
  }

  function isFnSelfCall(code) {
    return (editorScope === 'fn1' && code === 'F1') || (editorScope === 'fn2' && code === 'F2');
  }

  function renderPalette() {
    const pal = $('palette');
    pal.replaceChildren();
    allowedCommands().forEach((code) => {
      const meta = E.CMD[code];
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'cmd-btn';
      b.dataset.code = code;
      b.style.setProperty('--btn-col', meta.color);
      b.title = `${meta.detail} (${meta.key})`;
      b.disabled = running || isFnSelfCall(code);
      b.innerHTML = `<span class="cmd-ico">${cmdSvg(code, 20)}</span><span>${meta.short}</span>`;
      b.onclick = () => {
        if (editorScope === 'code') {
          editorScope = 'main';
          renderScopeTabs();
        }
        if (code === 'loop') openLoopModal(null);
        else if (code === 'if') openIfModal(null);
        else addBlock(code);
      };
      pal.append(b);
    });

    if (!builder && levelIndex === 0 && !programs[0].length) {
      pal.querySelector('[data-code="F"]')?.classList.add('pulse');
    }
  }

  function setStatus(kind, msg) {
    const el = $('statusBar');
    el.className = 'status-bar' + (kind && kind !== 'ready' ? ' ' + kind : '');
    const icons = { ready: '🚀', running: '⚡', pause: '⏸', error: '⚠️', success: '🎉' };
    let text = msg;
    if (!text) {
      if (builder && !testing) text = 'Рисуй 3D-станцию кистями, меняй биом, затем жми «▶ Запустить»!';
      else if (programs[activeRobot].length) text = 'Проверь алгоритм запуском «▶» или по одному шагу «▷»!';
      else if (levelIndex === 0) text = 'Нажми «Вперёд» два раза, затем «▶ Запустить»!';
      else text = 'Добавляй блоки команд внизу, чтобы составить программу.';
    }
    el.innerHTML = `<span>${icons[kind] || '🚀'}</span><span>${esc(text)}</span>`;
  }

  function syncControls() {
    const runBtn = $('runBtn');
    const stepBtn = $('stepBtn');
    const list = currentList();

    runBtn.classList.toggle('is-running', running);
    if (running) {
      runBtn.textContent = 'Ⅱ Пауза';
    } else if (isTeam()) {
      runBtn.textContent = stepping ? `▶ Продолжить (${E.ROBOT_NAMES[activeRobot]})` : `▶ Запустить: ${E.ROBOT_NAMES[activeRobot]}`;
    } else {
      runBtn.textContent = stepping ? '▶ Продолжить' : '▶ Запустить';
    }

    stepBtn.disabled = running || completed || (isTeam() && progress[activeRobot].done);
    $('undoBtn').disabled = running || !list.length || editorScope === 'code';
    $('clearBtn').disabled = running || !list.length || editorScope === 'code';

    document.querySelectorAll('#palette button').forEach((b) => {
      b.disabled = running || isFnSelfCall(b.dataset.code);
    });
    document.querySelectorAll('#robotTabs button').forEach((b) => {
      b.disabled = running || !!anim;
    });
  }

  // ==================== EDITING COMMANDS ====================
  function prepareEdit() {
    if (running) return false;
    const cnt = robotCnt();
    const anyMoved = progress.slice(0, cnt).some((p) => p.pointer > 0 || p.done || p.failed);
    if (anyMoved || completed || failed || stepping) {
      stopExec();
      resetWorld();
    }
    return true;
  }

  function addBlock(node) {
    if (running) return;
    if (totalBlocksUsed() >= 64) { toast('Максимум 64 блока в алгоритме.'); return; }
    prepareEdit();
    currentList().push(node);
    Audio.fx('click');
    afterEdit();
  }

  function afterEdit() {
    progress[activeRobot].flat = E.expand(programs[activeRobot], fn1s[activeRobot], fn2s[activeRobot]);
    renderWorkspace();
    renderPalette();
    setStatus('ready');
    syncControls();
    const ws = $('workspace');
    ws.scrollTop = ws.scrollHeight;
  }

  function switchRobot(idx) {
    if (idx === activeRobot || running || anim) return;
    activeRobot = idx;
    activeScope = null;
    activeRow = -1;
    errorScope = null;
    errorRow = -1;
    stepping = progress[idx].pointer > 0 && !progress[idx].done && !progress[idx].failed;
    Audio.fx('chirp');
    renderSpecialBars();
    renderWorkspace();
    renderPalette();
    syncControls();
    setStatus(
      progress[idx].done ? 'success' : 'ready',
      progress[idx].done
        ? `${E.ROBOT_NAMES[idx]} уже в портале! Выбери другого робота.`
        : `Сейчас программируешь: ${E.ROBOT_NAMES[idx]}.`
    );
  }

  // ==================== EXECUTION ENGINE ====================
  async function executeOneStep(token) {
    if (token !== runToken) return false;
    const p = progress[activeRobot];
    const bot = robots[activeRobot];
    const others = robots.filter((_, i) => i !== activeRobot);
    const state = { world, robot: bot, others };

    const condRes = E.resolveHeadConditions(p.flat, p.pointer, fn1s[activeRobot], fn2s[activeRobot], state);
    if (condRes.error) { failExecution(condRes.error, null, -1); return false; }
    if (condRes.lastBranch) Audio.fx('scan');

    if (p.pointer >= p.flat.length) {
      failExecution('Ветка условия не выполнила действий. Проверь «Если / Иначе»!', editorScope, -1);
      return false;
    }

    const item = p.flat[p.pointer];
    const before = E.clone(bot);

    activeScope = item.scope;
    activeRow = item.row;
    activeTrace = item.iterLabel || '';
    if (editorScope !== 'code' && item.scope !== editorScope) editorScope = item.scope;
    renderWorkspace();

    const cmdName = E.CMD[item.code] ? E.CMD[item.code].name : item.code;
    setStatus('running', `${activeHeroName()} · шаг ${p.pointer + 1}: ${cmdName}${item.iterLabel ? ' (' + item.iterLabel + ')' : ''}`);

    const res = E.transition(item.code, state);
    if (!res.ok) {
      if (game3D) {
        game3D.flashErrorTile(res.x, res.z);
        game3D.setMood(activeRobot, 'sad');
      }
      failExecution(`Блок ${item.row + 1}: ${res.message}`, item.scope, item.row);
      return false;
    }

    p.actions++;
    const dur = (save.settings.motion ? 460 : 110) / save.settings.speed;

    if (res.type === 'collect') {
      collectedCrystals++;
      Audio.fx('collect');
      if (game3D && save.settings.motion) {
        game3D.beam(before.x, before.z, res.x, res.z, 0xf472b6);
        game3D.burst(res.x, res.z, 0xf472b6, 24);
      }
    } else if (res.type === 'fix') {
      fixedModules++;
      Audio.fx('fix');
      if (game3D && save.settings.motion) {
        game3D.beam(before.x, before.z, res.x, res.z, 0x34d399);
        game3D.burst(res.x, res.z, 0x34d399, 24);
      }
    } else if (res.type === 'activate') {
      Audio.fx('activate');
      if (game3D && save.settings.motion) {
        game3D.burst(res.x, res.z, 0xfacc15, 26);
        (res.opened || []).forEach(([gx, gz]) => {
          game3D.beam(res.x, res.z, gx, gz, 0xfacc15);
          game3D.burst(gx, gz, 0x38bdf8, 22);
        });
      }
    } else if (res.type === 'teleport') {
      // Animate stepping onto entry teleport, then warp flash to destination!
      Audio.fx(res.jump ? 'jump' : 'step');
      const half = dur * 0.65;
      anim = { from: before, to: { x: res.entryX, z: res.entryZ, d: bot.d }, start: performance.now(), duration: half, jump: !!res.jump };
      await new Promise((r) => setTimeout(r, half));
      if (token !== runToken) return false;
      anim = null;
      Audio.fx('teleport');
      if (game3D && save.settings.motion) {
        game3D.warpFlash(res.entryX, res.entryZ);
        game3D.warpFlash(res.x, res.z);
        game3D.beam(res.entryX, res.entryZ, res.x, res.z, 0xe879f9);
      }
      await new Promise((r) => setTimeout(r, dur * 0.45));
      if (token !== runToken) return false;
    } else {
      Audio.fx(res.type === 'turn' ? 'turn' : res.type === 'jump' ? 'jump' : 'step');
    }

    if (res.type !== 'teleport') {
      anim = { from: before, to: E.clone(bot), start: performance.now(), duration: dur, jump: res.type === 'jump' };
      await new Promise((r) => setTimeout(r, dur));
      if (token !== runToken) return false;
      anim = null;
    }

    p.pointer++;
    renderObjectives();

    const nextCond = E.resolveHeadConditions(p.flat, p.pointer, fn1s[activeRobot], fn2s[activeRobot], state);
    if (nextCond.error) { failExecution(nextCond.error, null, -1); return false; }

    if (p.pointer >= p.flat.length) {
      running = false;
      stepping = false;
      activeScope = null;
      activeRow = -1;
      activeTrace = '';

      const goalTile = E.GOAL_TILES[activeRobot];
      const atGoal = world[bot.z]?.[bot.x] === goalTile;
      const cnt = robotCnt();

      if (cnt > 1) {
        p.done = atGoal;
        renderSpecialBars();
        renderObjectives();
        renderWorkspace();

        const allDone = progress.slice(0, cnt).every((pr) => pr.done);
        if (allDone && collectedCrystals === totalCrystals && fixedModules === totalModules) {
          handleVictory();
          return false;
        }
        if (atGoal) {
          if (game3D) {
            game3D.setMood(activeRobot, 'happy');
            game3D.burst(bot.x, bot.z, 0xfbbf24, 24);
          }
          Audio.fx('collect');
          const nextBotIdx = progress.slice(0, cnt).findIndex((pr) => !pr.done);
          setStatus('success', `${E.ROBOT_NAMES[activeRobot]} в портале! Переключись на ${E.ROBOT_NAMES[nextBotIdx]} и запусти его.`);
        } else {
          if (game3D) game3D.setMood(activeRobot, 'sad');
          p.failed = true;
          failed = true;
          Audio.fx('error');
          setStatus('error', `${E.ROBOT_NAMES[activeRobot]} не дошёл до своего портала! Исправь алгоритм.`);
        }
        syncControls();
        return false;
      } else {
        if (atGoal && collectedCrystals === totalCrystals && fixedModules === totalModules) {
          handleVictory();
          return false;
        }
        const leftC = totalCrystals - collectedCrystals;
        const leftM = totalModules - fixedModules;
        const msg = leftC || leftM
          ? `Команды закончились, но остались задачи: кристаллов — ${leftC}, модулей — ${leftM}.`
          : 'Команды закончились, а портал ещё впереди! Добавь шаги и попробуй снова.';
        if (game3D) game3D.setMood(0, 'sad');
        failExecution(msg, null, -1);
        return false;
      }
    }
    return true;
  }

  function failExecution(msg, scope, row) {
    running = false;
    stepping = false;
    failed = true;
    progress[activeRobot].failed = true;
    activeScope = null;
    activeRow = -1;
    activeTrace = '';
    errorScope = scope;
    errorRow = row;
    Audio.fx('error');
    setStatus('error', msg);
    renderWorkspace();
    syncControls();
  }

  async function runProgram() {
    Audio.init();
    if (running) {
      running = false;
      stepping = true;
      setStatus('pause', 'Пауза. Продолжи запуск или нажми «▷» для пошаговой отладки.');
      syncControls();
      return;
    }
    if (anim || completed) return;
    if (!programs[activeRobot].length) {
      toast(`Добавь хотя бы одну команду для ${activeHeroName()}.`);
      return;
    }
    if (isTeam() && progress[activeRobot].done) {
      toast(`${E.ROBOT_NAMES[activeRobot]} уже у портала! Выбери другого робота.`);
      return;
    }

    if (builder && !testing) {
      testing = true;
      $('workshopBar').classList.add('hidden');
      $('levelTag').textContent = 'Тест станции';
      $('levelDesc').textContent = 'Проверяем твою 3D-станцию!';
      resetWorld();
    } else if (failed || progress[activeRobot].pointer >= progress[activeRobot].flat.length) {
      if (!isTeam() || failed) resetWorld();
    }

    if (!stepping) {
      progress[activeRobot].flat = E.expand(programs[activeRobot], fn1s[activeRobot], fn2s[activeRobot]);
      progress[activeRobot].pointer = 0;
    }

    coachDismissed = true;
    $('coachCard').classList.add('hidden');
    running = true;
    stepping = false;
    errorScope = null;
    errorRow = -1;
    syncControls();

    const token = runToken;
    while (running && token === runToken) {
      if (!(await executeOneStep(token))) break;
    }
    syncControls();
  }

  async function stepProgram() {
    Audio.init();
    if (running || anim || completed) return;
    if (!programs[activeRobot].length) { toast('Сначала добавь команды.'); return; }
    if (isTeam() && progress[activeRobot].done) return;

    if (builder && !testing) {
      testing = true;
      $('workshopBar').classList.add('hidden');
      $('levelTag').textContent = 'Тест станции';
      resetWorld();
    } else if (failed || progress[activeRobot].pointer >= progress[activeRobot].flat.length) {
      if (!isTeam() || failed) resetWorld();
    }

    if (!stepping) {
      progress[activeRobot].flat = E.expand(programs[activeRobot], fn1s[activeRobot], fn2s[activeRobot]);
      progress[activeRobot].pointer = 0;
    }
    stepping = true;
    coachDismissed = true;
    $('coachCard').classList.add('hidden');
    syncControls();

    const token = runToken;
    const more = await executeOneStep(token);
    if (more && token === runToken) {
      setStatus('pause', `Шаг выполнен (${progress[activeRobot].pointer} / ${progress[activeRobot].flat.length}). Жми ▷ дальше!`);
    }
    syncControls();
  }

  function resetRobot() {
    stopExec();
    if (builder && testing) {
      testing = false;
      $('workshopBar').classList.remove('hidden');
      $('levelTag').textContent = 'Редактор карты';
      $('levelDesc').textContent = 'Выбирай кисть и нажимай на клетки 3D-станции.';
    }
    resetWorld();
    renderSpecialBars();
    renderWorkspace();
    setStatus('ready', 'Герои снова на старте — твой алгоритм сохранён!');
    Audio.fx('click');
  }

  function handleVictory() {
    if (!builder) {
      const err = E.validateCurriculum(programs, fn1s, fn2s, level);
      if (err) {
        if (game3D) game3D.setMood(activeRobot, 'sad');
        failExecution(err, null, -1);
        return;
      }
    }

    completed = true;
    running = false;
    stepping = false;
    activeScope = null;
    activeRow = -1;
    renderObjectives();
    renderWorkspace();
    syncControls();

    Audio.fx('win');
    launchConfetti(95);
    if (game3D) {
      game3D.setMood(-1, 'happy');
      if (save.settings.motion) {
        robots.forEach((r) => game3D.fireworks(r.x, r.z));
      }
    }
    setStatus('success', '🎉 Портал сияет! Станция полностью активирована!');

    const usedBlocks = totalBlocksUsed();
    const modelBlocks = E.countBlocks(level.model)
      + E.countBlocks(level.model2)
      + E.countBlocks(level.model3)
      + E.countBlocks(level.modelFn1)
      + E.countBlocks(level.modelFn2);
    const stars = builder
      ? 3
      : usedBlocks <= modelBlocks + 1
        ? 3
        : usedBlocks <= modelBlocks + 4
          ? 2
          : 1;

    if (builder) {
      unlockBadge('maker');
    } else {
      save.stars[levelIndex] = Math.max(save.stars[levelIndex], stars);
      persist();
      checkProgressBadges();
      updateLandingUI();
    }

    const totalActs = progress.slice(0, robotCnt()).reduce((s, pr) => s + pr.actions, 0);
    const tok = runToken;
    setTimeout(() => {
      if (tok !== runToken || !completed) return;
      showWinModal(stars, totalActs, usedBlocks);
    }, 1150);
  }

  // ==================== MODALS ====================
  function showModal(html, wide) {
    $('modal').innerHTML = '<button class="modal-close" type="button" id="modalCloseBtn" aria-label="Закрыть">×</button>' + html;
    $('modal').classList.toggle('wide', !!wide);
    $('modalBackdrop').classList.remove('hidden');
    $('modalCloseBtn').onclick = closeModal;
    $('modal').focus();
  }

  function closeModal() {
    $('modalBackdrop').classList.add('hidden');
  }

  function showWinModal(stars, actions, blocks) {
    const isLast = !builder && levelIndex === L.LEVELS.length - 1;
    showModal(`
      <div class="m-eyebrow" style="text-align:center">${builder ? 'АВТОРСКАЯ СТАНЦИЯ' : isLast ? 'ВСЕ 50 СТАНЦИЙ ПРОЙДЕНЫ!' : 'МИССИЯ ВЫПОЛНЕНА'}</div>
      <div class="win-stars">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</div>
      <h2 id="modalTitle" style="text-align:center;margin-right:0">${isLast ? 'Легенда Звёздной Академии!' : 'Станция активирована!'}</h2>
      <p style="text-align:center">${
        builder
          ? 'Твой код прошёл созданную тобой станцию! Поделись кодом карты с друзьями.'
          : isLast
            ? 'Невероятно! Все 50 космических станций в 8 мирах оживлены! Ты освоил циклы, отладку, функции F1/F2, телепорты, командную работу и датчики!'
            : level.adaptiveCells
              ? 'Отлично! Твой умный алгоритм прошёл сразу оба варианта карты!'
              : `${activeHeroName()} в восторге! Вперёд к следующей станции?`
      }</p>
      <div class="stat-grid">
        <div class="stat-box"><b>${blocks}</b><small>блоков в коде</small></div>
        <div class="stat-box"><b>${actions}</b><small>действий выполнено</small></div>
      </div>
      <div class="modal-actions">
        <button id="winAgain" type="button">Ещё раз</button>
        ${builder ? '<button id="winShare" class="btn-primary" type="button">Поделиться кодом</button>' : ''}
        <button id="winNext" class="btn-primary" type="button">${builder ? 'В мастерскую' : isLast ? 'Карта станций' : 'Дальше →'}</button>
      </div>
    `);
    $('winAgain').onclick = () => { closeModal(); resetRobot(); };
    if ($('winShare')) $('winShare').onclick = () => openWorkshopShare();
    $('winNext').onclick = () => {
      closeModal();
      if (builder) resetRobot();
      else if (isLast) openMapModal();
      else loadLevel(levelIndex + 1);
    };
  }

  // Hangar of 4 Heroes Modal!
  function openHangarModal() {
    showModal(`
      <div class="m-eyebrow">АНГАР РОБОТОВ · 4 ГЕРОЯ</div>
      <h2 id="modalTitle">Выбери своего героя</h2>
      <p>Выбранный робот будет вести твои одиночные миссии и встречать тебя в главном меню!</p>
      <div class="hero-grid" id="heroGrid">
        ${L.CHARACTERS.map((c) => `
          <button type="button" class="hero-card ${save.heroSkin === c.id ? 'selected' : ''}" data-hero="${c.id}" style="--hero-col:${c.color}">
            <div style="display:flex;align-items:center;gap:10px">
              <div class="hero-dot">${c.emoji}</div>
              <div>
                <b style="font-size:15px;display:block">${esc(c.name)}</b>
                <small style="color:#475569;font-size:11px">${esc(c.role)}</small>
              </div>
            </div>
            <p style="margin:6px 0 0;font-size:12px">${esc(c.bio)}</p>
            <div style="margin-top:auto;padding-top:6px;font-size:11.5px;font-weight:800;color:${c.color}">
              ${save.heroSkin === c.id ? '✓ Выбран сейчас' : 'Выбрать героя →'}
            </div>
          </button>
        `).join('')}
      </div>
    `, true);

    document.querySelectorAll('[data-hero]').forEach((btn) => {
      btn.onclick = () => {
        save.heroSkin = btn.dataset.hero;
        persist();
        Audio.fx('chirp');
        unlockBadge('hero');
        updateLandingUI();
        if (!builder && !isTeam()) renderWorkspace();
        openHangarModal();
        const ch = L.CHARACTERS.find((x) => x.id === save.heroSkin);
        if (ch) toast(`🛸 Выбран герой: ${ch.name}!`);
      };
    });
  }

  function openBlockEditor(idx) {
    if (running) return;
    const list = currentList();
    const node = list[idx];
    if (typeof node !== 'string') {
      if (node.type === 'loop') openLoopModal(idx);
      else openIfModal(idx);
      return;
    }

    showModal(`
      <div class="m-eyebrow">РЕДАКТИРОВАНИЕ · БЛОК ${idx + 1}</div>
      <h2 id="modalTitle">Заменить команду</h2>
      <p>Выбери новую команду вместо «${esc(E.CMD[node].name)}»:</p>
      <div class="ed-palette" id="repGrid"></div>
      <div class="modal-actions">
        <button id="repUp" type="button" ${idx === 0 ? 'disabled' : ''}>↑ Выше</button>
        <button id="repDown" type="button" ${idx === list.length - 1 ? 'disabled' : ''}>↓ Ниже</button>
        <button id="repDel" class="btn-danger" type="button">Удалить</button>
      </div>
    `);

    allowedCommands()
      .filter((c) => c !== 'loop' && c !== 'if' && !isFnSelfCall(c))
      .forEach((c) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = E.CMD[c].name;
        b.onclick = () => {
          prepareEdit();
          list[idx] = c;
          Audio.fx('click');
          afterEdit();
          closeModal();
        };
        $('repGrid').append(b);
      });

    $('repUp').onclick = () => { prepareEdit(); [list[idx - 1], list[idx]] = [list[idx], list[idx - 1]]; afterEdit(); closeModal(); };
    $('repDown').onclick = () => { prepareEdit(); [list[idx + 1], list[idx]] = [list[idx], list[idx + 1]]; afterEdit(); closeModal(); };
    $('repDel').onclick = () => { prepareEdit(); list.splice(idx, 1); afterEdit(); closeModal(); };
  }

  function openLoopModal(editIdx, onDoneOverride) {
    const list = currentList();
    const draft = editIdx !== null && editIdx !== undefined
      ? E.clone(list[editIdx])
      : { type: 'loop', n: 3, body: [] };

    function draw() {
      showModal(`
        <div class="m-eyebrow">ЦИКЛ · FOR IN RANGE</div>
        <h2 id="modalTitle">${editIdx !== null && editIdx !== undefined ? 'Изменить повтор' : 'Собери повтор'}</h2>
        <label for="loopN"><b>Сколько раз повторить?</b></label>
        <select id="loopN" class="ed-select">
          ${[2, 3, 4, 5, 6, 7, 8].map((n) => `<option value="${n}" ${draft.n === n ? 'selected' : ''}>${n} ${n <= 4 ? 'раза' : 'раз'}</option>`).join('')}
        </select>
        <div class="ed-body" id="loopBody"></div>
        <div class="ed-palette" id="loopPal"></div>
        <div class="modal-actions">
          <button id="loopUndo" type="button">⌫ Убрать</button>
          <button id="loopSave" class="btn-primary" type="button">Сохранить цикл</button>
        </div>
      `);

      $('loopN').onchange = (e) => { draft.n = Number(e.target.value); };
      const bodyEl = $('loopBody');
      if (!draft.body.length) {
        bodyEl.innerHTML = '<p style="text-align:center;margin:14px 0">Добавь команды внутрь цикла кнопками ниже</p>';
      } else {
        draft.body.forEach((it, i) => {
          const r = document.createElement('div');
          r.className = 'ed-row';
          r.innerHTML = `<span>${i + 1}. ${esc(E.formatBlock(it))}</span>`;
          if (typeof it !== 'string' && it.type === 'if') {
            const ed = document.createElement('button');
            ed.type = 'button';
            ed.className = 'row-btn';
            ed.textContent = '✎';
            ed.onclick = () => openIfModal(null, it, (updated) => { draft.body[i] = updated; draw(); });
            r.append(ed);
          }
          const up = document.createElement('button');
          up.type = 'button';
          up.className = 'row-btn';
          up.textContent = '↑';
          up.disabled = i === 0;
          up.onclick = () => { [draft.body[i - 1], draft.body[i]] = [draft.body[i], draft.body[i - 1]]; draw(); };

          const del = document.createElement('button');
          del.type = 'button';
          del.className = 'row-btn del';
          del.textContent = '×';
          del.onclick = () => { draft.body.splice(i, 1); draw(); };

          r.append(up, del);
          bodyEl.append(r);
        });
      }

      allowedCommands()
        .filter((c) => c !== 'loop' && !isFnSelfCall(c))
        .forEach((c) => {
          const b = document.createElement('button');
          b.type = 'button';
          b.textContent = E.CMD[c].short;
          b.onclick = () => {
            if (draft.body.length >= 10) { toast('До 10 команд внутри цикла.'); return; }
            Audio.fx('click');
            if (c === 'if') openIfModal(null, null, (node) => { draft.body.push(node); draw(); });
            else { draft.body.push(c); draw(); }
          };
          $('loopPal').append(b);
        });

      $('loopUndo').onclick = () => { draft.body.pop(); draw(); };
      $('loopSave').onclick = () => {
        if (!draft.body.length) { toast('Добавь хотя бы одну команду в цикл!'); return; }
        if (onDoneOverride) { onDoneOverride(draft); return; }
        prepareEdit();
        if (editIdx !== null && editIdx !== undefined) list[editIdx] = draft;
        else list.push(draft);
        Audio.fx('click');
        afterEdit();
        closeModal();
      };
    }
    draw();
  }

  function openIfModal(editIdx, initialNode, onDoneOverride) {
    const list = currentList();
    const draft = initialNode
      ? E.clone(initialNode)
      : (editIdx !== null && editIdx !== undefined
        ? E.clone(list[editIdx])
        : { type: 'if', test: 'C', yes: ['C'], no: ['P'] });

    let side = 'yes';
    function draw() {
      showModal(`
        <div class="m-eyebrow">УСЛОВИЕ · ДАТЧИК ВПЕРЕДИ</div>
        <h2 id="modalTitle">Если… иначе…</h2>
        <label for="ifTest"><b>Что проверяет датчик перед роботом?</b></label>
        <select id="ifTest" class="ed-select">
          <option value="C" ${draft.test === 'C' ? 'selected' : ''}>◆ Впереди энергокристалл</option>
          <option value="S" ${draft.test === 'S' ? 'selected' : ''}>☀ Впереди повреждённый модуль</option>
          <option value="free" ${draft.test === 'free' ? 'selected' : ''}>→ Путь впереди свободен</option>
          <option value="T" ${draft.test === 'T' ? 'selected' : ''}>🌀 Впереди телепорт</option>
        </select>
        <div class="branch-tabs">
          <button id="bYes" type="button" class="${side === 'yes' ? 'active' : ''}">✓ Если верно (${draft.yes.length})</button>
          <button id="bNo" type="button" class="${side === 'no' ? 'active' : ''}">✗ Иначе (${draft.no.length})</button>
        </div>
        <div class="ed-body" id="ifBody"></div>
        <div class="ed-palette" id="ifPal"></div>
        <div class="modal-actions">
          <button id="ifUndo" type="button">⌫ Убрать</button>
          <button id="ifSave" class="btn-primary" type="button">Сохранить условие</button>
        </div>
      `);

      $('ifTest').onchange = (e) => { draft.test = e.target.value; };
      $('bYes').onclick = () => { side = 'yes'; draw(); };
      $('bNo').onclick = () => { side = 'no'; draw(); };

      const arr = draft[side];
      const bodyEl = $('ifBody');
      if (!arr.length) {
        bodyEl.innerHTML = `<p style="text-align:center;margin:12px 0">Ветка «${side === 'yes' ? 'Если верно' : 'Иначе'}»: ничего не делать</p>`;
      } else {
        arr.forEach((c, i) => {
          const r = document.createElement('div');
          r.className = 'ed-row';
          r.innerHTML = `<span>${i + 1}. ${esc(E.formatBlock(c))}</span>`;
          const del = document.createElement('button');
          del.type = 'button';
          del.className = 'row-btn del';
          del.textContent = '×';
          del.onclick = () => { arr.splice(i, 1); draw(); };
          r.append(del);
          bodyEl.append(r);
        });
      }

      allowedCommands()
        .filter((c) => c !== 'loop' && c !== 'if' && !isFnSelfCall(c))
        .forEach((c) => {
          const b = document.createElement('button');
          b.type = 'button';
          b.textContent = E.CMD[c].short;
          b.onclick = () => { if (arr.length >= 6) return; Audio.fx('click'); arr.push(c); draw(); };
          $('ifPal').append(b);
        });

      $('ifUndo').onclick = () => { arr.pop(); draw(); };
      $('ifSave').onclick = () => {
        if (onDoneOverride) { onDoneOverride(draft); return; }
        prepareEdit();
        if (editIdx !== null && editIdx !== undefined) list[editIdx] = draft;
        else list.push(draft);
        Audio.fx('click');
        afterEdit();
        closeModal();
      };
    }
    draw();
  }

  function openMapModal() {
    if (running) { running = false; stepping = true; syncControls(); }
    const done = save.stars.filter((n) => n > 0).length;
    const totalStars = save.stars.reduce((a, b) => a + b, 0);
    const maxUnlock = highestUnlocked();

    let html = `
      <div class="m-eyebrow">ЗВЁЗДНАЯ КАРТА ГАЛАКТИКИ</div>
      <h2 id="modalTitle">8 миров · 50 станций</h2>
      <p>Пройдено: <b>${done} / ${L.LEVELS.length}</b> · Собрано звёзд: <b>${totalStars} / ${L.LEVELS.length * 3} ★</b></p>
    `;

    L.CHAPTERS.forEach((ch, ci) => {
      const bm = L.BIOMES[ch.biome] || L.BIOMES[0];
      html += `<div class="chapter-block"><div class="chapter-head"><span>${bm.icon} ГЛАВА ${ci + 1} · ${ch.title}</span><span class="req-badge">${ch.skill}</span></div><div class="map-grid">`;
      for (let i = ch.from; i <= ch.to; i++) {
        const lv = L.LEVELS[i];
        const locked = i > maxUnlock;
        const st = save.stars[i];
        html += `
          <button class="lvl-card ${!builder && i === levelIndex ? 'current' : ''} ${st > 0 ? 'done' : ''}" data-lvl="${i}" ${locked ? 'disabled' : ''}>
            <span class="lvl-num">${String(i + 1).padStart(2, '0')}</span>
            <span class="lvl-name">${esc(lv.name)}</span>
            <span class="lvl-stars">${st ? '★'.repeat(st) + '☆'.repeat(3 - st) : locked ? '🔒 Закрыта' : 'Начать →'}</span>
          </button>
        `;
      }
      html += '</div></div>';
    });

    showModal(html, true);
    document.querySelectorAll('[data-lvl]').forEach((btn) => {
      btn.onclick = () => {
        Audio.init();
        closeModal();
        $('landing').classList.add('hidden');
        loadLevel(Number(btn.dataset.lvl));
      };
    });
  }

  function openHintModal() {
    if (builder) { openGuideModal(); return; }
    if (running) { running = false; stepping = true; syncControls(); }
    hintStage = Math.min(3, hintStage + 1);

    let text = '';
    if (hintStage === 1) {
      text = level.desc;
    } else if (hintStage === 2) {
      const parts = [];
      if (level.starter || level.starterFn1) parts.push('Нажми «▷» (один шаг) и посмотри, где робот ошибается.');
      if (level.requireFn) parts.push('Вынеси повторяющуюся связку на вкладку «ƒ F1» и вызывай блок «F1()».');
      if (level.requireFn2) parts.push('Используй вторую функцию «ƒ F2» для отдельной связки движений!');
      if (level.grid.flat().includes('T')) parts.push('После телепорта робот сохраняет своё направление — проверь стрелку!');
      if (level.requireIf) parts.push('Помести блок «Если…» внутрь повтора, чтобы датчик проверял клетку на каждом шаге.');
      if (isTeam()) parts.push('Если есть пульт ⚡, сначала запусти Пикселя — он отключит лазерные ворота!');
      if (!parts.length) parts.push('Разбей путь на короткие одинаковые участки и смотри на стрелку направления.');
      text = parts.join('\n\n');
    } else {
      const lines = [];
      if (level.modelFn1) lines.push('ƒ F1: ' + level.modelFn1.map(E.formatBlock).join(' → '));
      if (level.modelFn2) lines.push('ƒ F2: ' + level.modelFn2.map(E.formatBlock).join(' → '));
      lines.push((isTeam() ? '1 · Пиксель: ' : 'Алгоритм: ') + level.model.map(E.formatBlock).join(' → '));
      if (level.model2) lines.push('2 · Битик: ' + level.model2.map(E.formatBlock).join(' → '));
      if (level.model3) lines.push('3 · Вольт: ' + level.model3.map(E.formatBlock).join(' → '));
      text = lines.join('\n\n');
    }

    showModal(`
      <div class="m-eyebrow">ПОДСКАЗКА · ШАГ ${hintStage} / 3</div>
      <h2 id="modalTitle">${hintStage === 3 ? 'Пример верного алгоритма' : 'Давай разберёмся вместе'}</h2>
      <p style="white-space:pre-wrap;color:#0f172a;font-size:13.5px;background:#f8fafc;padding:12px;border-radius:12px;border:1px solid #e2e8f0">${esc(text)}</p>
      <p>Подсказки бесплатны и не отнимают звёзды!</p>
      <div class="modal-actions">
        <button id="hClose" type="button">Попробую сам</button>
        ${hintStage < 3 ? '<button id="hMore" class="btn-primary" type="button">Ещё подсказка →</button>' : ''}
      </div>
    `);
    $('hClose').onclick = closeModal;
    if ($('hMore')) $('hMore').onclick = openHintModal;
  }

  function openGuideModal(startTab) {
    let tab = startTab || 'guide';
    let qIdx = 0;
    let qScore = 0;
    let qAnswered = false;

    function draw() {
      let body = '';
      if (tab === 'guide') {
        body = '<div class="guide-grid">' + L.GUIDE_CARDS.map((c) => `
          <div class="guide-card">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;margin-bottom:4px">
              <b>${c.icon} ${esc(c.title)}</b>
              <span class="req-badge">${esc(c.tag)}</span>
            </div>
            <p style="margin:0;font-size:12.5px">${esc(c.text)}</p>
            <pre>${esc(c.code)}</pre>
          </div>
        `).join('') + '</div>';
      } else if (qIdx < L.QUIZ.length) {
        const item = L.QUIZ[qIdx];
        body = `
          <div class="quiz-card">
            <div class="m-eyebrow">ВОПРОС ${qIdx + 1} / ${L.QUIZ.length} · ${esc(item.topic)} · Счёт: ${qScore}</div>
            <h3 style="margin:6px 0 10px;font-size:16px">${esc(item.q)}</h3>
            <div id="quizOpts"></div>
            <p id="quizExp" style="margin-top:10px;font-weight:600"></p>
            <div class="modal-actions" id="quizNav"></div>
          </div>
        `;
      } else {
        if (qScore > save.quizBest) { save.quizBest = qScore; persist(); updateLandingUI(); }
        if (qScore >= 15) { unlockBadge('quiz'); launchConfetti(70); }
        body = `
          <div class="quiz-card" style="text-align:center">
            <div style="font-size:48px">${qScore >= 15 ? '🎓' : '🚀'}</div>
            <h3>Результат: ${qScore} из ${L.QUIZ.length}!</h3>
            <p>${qScore >= 15 ? 'Потрясающе! Ты настоящий знаток алгоритмов!' : 'Отличная тренировка! Набери 15+ правильных ответов для значка «Знаток алгоритмов».'}</p>
            <div class="modal-actions">
              <button id="quizRetry" class="btn-primary" type="button">Пройти ещё раз</button>
            </div>
          </div>
        `;
      }

      showModal(`
        <div class="m-eyebrow">АКАДЕМИЯ ПРОГРАММИСТА</div>
        <h2 id="modalTitle">Учебник и тренажёр логики</h2>
        <div class="tabs-row">
          <button id="gTabGuide" type="button" class="${tab === 'guide' ? 'active' : ''}">📘 Справочник (8 тем)</button>
          <button id="gTabQuiz" type="button" class="${tab === 'quiz' ? 'active' : ''}">🧠 Викторина (${save.quizBest}/${L.QUIZ.length})</button>
        </div>
        ${body}
      `, true);

      $('gTabGuide').onclick = () => { tab = 'guide'; draw(); };
      $('gTabQuiz').onclick = () => { tab = 'quiz'; qIdx = 0; qScore = 0; qAnswered = false; draw(); };

      if (tab === 'quiz' && qIdx < L.QUIZ.length) {
        const item = L.QUIZ[qIdx];
        item.options.forEach((opt, oi) => {
          const b = document.createElement('button');
          b.type = 'button';
          b.className = 'quiz-opt';
          b.textContent = opt;
          b.onclick = () => {
            if (qAnswered) return;
            qAnswered = true;
            const ok = oi === item.answer;
            if (ok) { qScore++; Audio.fx('collect'); }
            else Audio.fx('error');
            document.querySelectorAll('.quiz-opt').forEach((btn, bi) => {
              if (bi === item.answer) btn.classList.add('right');
              else if (bi === oi) btn.classList.add('wrong');
            });
            $('quizExp').textContent = (ok ? '✓ Верно! ' : '✗ Не совсем. ') + item.explain;
            const nextBtn = document.createElement('button');
            nextBtn.type = 'button';
            nextBtn.className = 'btn-primary';
            nextBtn.textContent = qIdx === L.QUIZ.length - 1 ? 'Показать результат →' : 'Следующий вопрос →';
            nextBtn.onclick = () => { qIdx++; qAnswered = false; draw(); };
            $('quizNav').append(nextBtn);
          };
          $('quizOpts').append(b);
        });
      }
      if ($('quizRetry')) $('quizRetry').onclick = () => { qIdx = 0; qScore = 0; qAnswered = false; draw(); };
    }
    draw();
  }

  function openBadgesModal() {
    const unlockedCount = Object.keys(save.badges).length;
    showModal(`
      <div class="m-eyebrow">ЗАЛ СЛАВЫ</div>
      <h2 id="modalTitle">Достижения (${unlockedCount} / ${L.BADGES.length})</h2>
      <div class="badges-grid">
        ${L.BADGES.map((b) => `
          <div class="badge-card ${save.badges[b.id] ? 'unlocked' : ''}">
            <div class="badge-ico">${b.icon}</div>
            <b style="font-size:12.5px;display:block">${esc(b.name)}</b>
            <small style="font-size:11px;color:#475569">${esc(b.desc)}</small>
          </div>
        `).join('')}
      </div>
    `, true);
  }

  function openSettingsModal() {
    const s = save.settings;
    showModal(`
      <div class="m-eyebrow">НАСТРОЙКИ</div>
      <h2 id="modalTitle">Твой темп игры</h2>
      <div class="setting-row">
        <div><strong>Космическая музыка</strong><small>У каждого мира своё звучание</small></div>
        <button id="sMusic" class="toggle-btn ${s.music ? 'on' : ''}" type="button">${s.music ? 'Вкл' : 'Выкл'}</button>
      </div>
      <div class="setting-row">
        <div><strong>Громкость музыки</strong><small>${Math.round(s.volume * 100)}%</small></div>
        <input id="sVol" type="range" min="0" max="100" value="${Math.round(s.volume * 100)}" style="width:120px" />
      </div>
      <div class="setting-row">
        <div><strong>Звуки и голоса роботов</strong><small>Шаги, кристаллы, телепорты, лазеры</small></div>
        <button id="sSfx" class="toggle-btn ${s.sfx ? 'on' : ''}" type="button">${s.sfx ? 'Вкл' : 'Выкл'}</button>
      </div>
      <div class="setting-row">
        <div><strong>Виброотклик (APK)</strong><small>Тактильная отдача при нажатиях</small></div>
        <button id="sHap" class="toggle-btn ${s.haptics ? 'on' : ''}" type="button">${s.haptics ? 'Вкл' : 'Выкл'}</button>
      </div>
      <div class="setting-row">
        <div><strong>Скорость выполнения</strong><small>Удобно для пошагового изучения</small></div>
        <select id="sSpeed" class="ed-select" style="width:auto;margin:0;min-height:38px">
          <option value="0.7" ${s.speed === 0.7 ? 'selected' : ''}>Спокойно (0.7×)</option>
          <option value="1" ${s.speed === 1 ? 'selected' : ''}>Обычно (1×)</option>
          <option value="1.8" ${s.speed === 1.8 ? 'selected' : ''}>Быстро (1.8×)</option>
        </select>
      </div>
      <div class="setting-row">
        <div><strong>Режим учителя (открыть все 50)</strong><small>Доступ к любой станции сразу</small></div>
        <button id="sUnlock" class="toggle-btn ${s.unlockAll ? 'on' : ''}" type="button">${s.unlockAll ? 'Вкл' : 'Выкл'}</button>
      </div>
      <div class="modal-actions">
        <button id="sReset" class="btn-danger" type="button">Сбросить прогресс</button>
        <button id="sDone" class="btn-primary" type="button">Готово</button>
      </div>
    `);

    const bindToggle = (id, key) => {
      $(id).onclick = () => {
        s[key] = !s[key];
        Audio.configure(s);
        Audio.init();
        persist();
        syncMusicBtns();
        updateLandingUI();
        openSettingsModal();
      };
    };
    bindToggle('sMusic', 'music');
    bindToggle('sSfx', 'sfx');
    bindToggle('sHap', 'haptics');
    bindToggle('sUnlock', 'unlockAll');
    $('sVol').oninput = (e) => { s.volume = Number(e.target.value) / 100; Audio.configure(s); persist(); };
    $('sSpeed').onchange = (e) => { s.speed = Number(e.target.value); persist(); };
    $('sDone').onclick = closeModal;
    $('sReset').onclick = () => {
      showModal(`
        <h2 id="modalTitle">Сбросить прогресс?</h2>
        <p>Все звёзды и достижения будут обнулены. Станция в Мастерской останется.</p>
        <div class="modal-actions">
          <button id="rCancel" type="button">Отмена</button>
          <button id="rOk" class="btn-danger" type="button">Да, сбросить</button>
        </div>
      `);
      $('rCancel').onclick = openSettingsModal;
      $('rOk').onclick = () => {
        save.stars = Array(L.LEVELS.length).fill(0);
        save.badges = {};
        save.quizBest = 0;
        save.lastLevel = 0;
        persist();
        updateLandingUI();
        closeModal();
        loadLevel(0);
        toast('Прогресс сброшен!');
      };
    };
  }

  // ==================== 3D STATION WORKSHOP ====================
  function newWorkshopLevel(size, biomeIdx) {
    const n = size || 8;
    return {
      name: 'Моя космическая станция',
      desc: 'Авторский 3D-уровень',
      biome: biomeIdx || 0,
      allowed: ['F', 'L', 'R', 'P', 'C', 'J', 'U', 'F1', 'F2', 'loop', 'if'],
      start: { x: 1, z: n - 2, d: 0 },
      grid: Array.from({ length: n }, (_, z) =>
        Array.from({ length: n }, (_, x) =>
          x === 0 || z === 0 || x === n - 1 || z === n - 1 ? 'W' : x === n - 2 && z === 1 ? 'B' : '.'
        )
      ),
      model: [],
      maxBlocks: 64,
    };
  }

  function closeStagePopovers() {
    let closed = false;
    const sc = $('stageControls');
    if (sc && sc.classList.contains('cam-open')) {
      sc.classList.remove('cam-open');
      $('camMenuBtn')?.setAttribute('aria-expanded', 'false');
      closed = true;
    }
    const hud = $('missionHud');
    if (hud && hud.classList.contains('desc-open')) {
      hud.classList.remove('desc-open');
      $('descToggleBtn')?.classList.remove('open');
      closed = true;
    }
    if (workshopMenuOpen) {
      workshopMenuOpen = false;
      if (builder && !testing) renderWorkshopTools();
      closed = true;
    }
    return closed;
  }

  function placeCoachCard() {
    const card = $('coachCard');
    if (!card) return;
    const isCompact = window.matchMedia('(max-width: 1024px)').matches;
    if (isCompact) {
      const targetParent = document.querySelector('.code-panel');
      const header = targetParent?.querySelector('.editor-header');
      if (targetParent && header && card.parentElement !== targetParent) {
        targetParent.insertBefore(card, header);
      }
    } else {
      const stage = $('stagePanel');
      if (stage && card.parentElement !== stage) {
        stage.append(card);
      }
    }
  }

  function enterWorkshop() {
    Audio.init();
    stopExec();
    closeStagePopovers();
    builder = true;
    testing = false;
    workshopMenuOpen = false;
    activeRobot = 0;
    editorScope = 'main';
    level = save.custom ? E.clone(save.custom) : newWorkshopLevel(8, 0);
    programs = [[], [], []];
    fn1s = [[], [], []];
    fn2s = [[], [], []];
    $('landing').classList.add('hidden');
    resetWorld();
    renderAll();
    renderWorkshopTools();
    toast('Нажми «Кисть ▾» внизу справа, чтобы выбрать элемент, затем тапай по клеткам!');
  }

  function renderWorkshopTools() {
    const bar = $('workshopBar');
    bar.classList.remove('hidden');
    bar.replaceChildren();
    const brushes = [
      ['.', '⬜ Палуба'],
      ['W', '🌌 Космос'],
      ['C', '◆ Кристалл'],
      ['S', '☀ Модуль'],
      ['R', '🪨 Скала'],
      ['T', '🌀 Телепорт'],
      ['K', '⚡ Пульт'],
      ['X', '🚧 Лазер'],
      ['B', '◎ Портал'],
      ['start', '🤖 Старт'],
    ];
    const currentBrushLabel = (brushes.find(([v]) => v === brush) || brushes[0])[1];
    const bm = L.BIOMES[level.biome] || L.BIOMES[0];

    // Popover catalog (only visible when expanded — never covers 3D station while painting!)
    if (workshopMenuOpen) {
      const pop = document.createElement('div');
      pop.className = 'ws-popover';

      const head = document.createElement('div');
      head.className = 'ws-pop-head';
      head.innerHTML = '<span>🎨 Элементы станции</span>';
      const closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'ws-pop-close';
      closeBtn.textContent = '×';
      closeBtn.setAttribute('aria-label', 'Скрыть панель конструктора');
      closeBtn.onclick = () => { workshopMenuOpen = false; renderWorkshopTools(); };
      head.append(closeBtn);
      pop.append(head);

      const grid = document.createElement('div');
      grid.className = 'ws-brush-grid';
      brushes.forEach(([v, lbl]) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = lbl;
        b.className = brush === v ? 'selected' : '';
        b.onclick = () => {
          brush = v;
          workshopMenuOpen = false;
          Audio.fx('click');
          renderWorkshopTools();
        };
        grid.append(b);
      });
      pop.append(grid);

      const tools = document.createElement('div');
      tools.className = 'ws-tools-grid';

      const rot = document.createElement('button');
      rot.type = 'button';
      rot.textContent = '↻ Поворот старта';
      rot.onclick = () => {
        level.start.d = (level.start.d + 1) % 4;
        save.custom = E.clone(level);
        persist();
        resetWorld();
        Audio.fx('click');
      };

      const bioBtn = document.createElement('button');
      bioBtn.type = 'button';
      bioBtn.textContent = `${bm.icon} Мир: ${bm.short}`;
      bioBtn.onclick = () => {
        level.biome = ((level.biome || 0) + 1) % L.BIOMES.length;
        save.custom = E.clone(level);
        persist();
        Audio.setMood(L.BIOMES[level.biome].musicMood);
        renderAll();
        renderWorkshopTools();
        toast(`Мир: ${L.BIOMES[level.biome].name}`);
      };

      const sz = document.createElement('button');
      sz.type = 'button';
      sz.textContent = `📐 Поле ${level.grid.length}×${level.grid.length}`;
      sz.onclick = () => {
        const next = level.grid.length === 8 ? 10 : level.grid.length === 10 ? 12 : 8;
        level = newWorkshopLevel(next, level.biome);
        save.custom = E.clone(level);
        persist();
        programs = [[], [], []];
        fn1s = [[], [], []];
        fn2s = [[], [], []];
        resetWorld();
        renderAll();
        renderWorkshopTools();
      };

      const share = document.createElement('button');
      share.type = 'button';
      share.textContent = '📤 Код карты';
      share.onclick = () => { workshopMenuOpen = false; renderWorkshopTools(); openWorkshopShare(); };

      tools.append(rot, bioBtn, sz, share);
      pop.append(tools);
      bar.append(pop);
    }

    // Compact floating trigger bar (takes minimal corner space!)
    const row = document.createElement('div');
    row.className = 'ws-trigger-row';

    const quickRot = document.createElement('button');
    quickRot.type = 'button';
    quickRot.className = 'ws-mini-btn';
    quickRot.title = 'Повернуть старт робота';
    quickRot.setAttribute('aria-label', 'Повернуть старт робота');
    quickRot.textContent = '↻';
    quickRot.onclick = () => {
      level.start.d = (level.start.d + 1) % 4;
      save.custom = E.clone(level);
      persist();
      resetWorld();
      Audio.fx('click');
    };

    const togglePill = document.createElement('button');
    togglePill.type = 'button';
    togglePill.id = 'wsToggleBtn';
    togglePill.className = 'ws-pill-btn' + (workshopMenuOpen ? ' open' : '');
    togglePill.setAttribute('aria-expanded', String(workshopMenuOpen));
    togglePill.textContent = `🎨 ${currentBrushLabel} ${workshopMenuOpen ? '▴' : '▾'}`;
    togglePill.onclick = () => {
      const opening = !workshopMenuOpen;
      closeStagePopovers();
      workshopMenuOpen = opening;
      Audio.fx('click');
      renderWorkshopTools();
    };

    row.append(quickRot, togglePill);
    bar.append(row);
  }

  function paintTile(gx, gz) {
    if (!builder || testing) return;
    if (brush === 'start') {
      if (level.grid[gz][gx] !== '.') { toast('Старт можно ставить только на свободную палубу.'); return; }
      level.start = { x: gx, z: gz, d: level.start.d };
    } else {
      if (level.start.x === gx && level.start.z === gz) { toast('Сначала перенеси старт на другую клетку.'); return; }
      if (level.grid[gz][gx] === 'B' && brush !== 'B') { toast('На станции должен оставаться один портал!'); return; }
      if (brush === 'B') level.grid = level.grid.map((row) => row.map((t) => (t === 'B' ? '.' : t)));
      if (brush === 'T') {
        const tCount = level.grid.flat().filter((t) => t === 'T').length;
        if (tCount >= 2 && level.grid[gz][gx] !== 'T') {
          toast('Телепортов может быть только пара (2 штуки). Убери лишний сначала!');
          return;
        }
      }
      level.grid[gz][gx] = brush;
    }
    save.custom = E.clone(level);
    persist();
    resetWorld();
    Audio.fx('click');
  }

  function openWorkshopShare() {
    const code = btoa(unescape(encodeURIComponent(JSON.stringify({ v: 2, biome: level.biome || 0, start: level.start, grid: level.grid }))));
    showModal(`
      <div class="m-eyebrow">МАСТЕРСКАЯ · ОБМЕН СТАНЦИЯМИ</div>
      <h2 id="modalTitle">Код твоей станции</h2>
      <p>Скопируй код другу или вставь чужой код ниже:</p>
      <textarea id="wsCode" class="code-textarea">${code}</textarea>
      <div class="modal-actions">
        <button id="wsCopy" type="button">Копировать</button>
        <button id="wsLoad" class="btn-primary" type="button">Загрузить станцию</button>
      </div>
    `);
    $('wsCopy').onclick = async () => {
      try { await navigator.clipboard.writeText($('wsCode').value); toast('Код станции скопирован!'); }
      catch (e) { $('wsCode').select(); toast('Код выделен — скопируй его.'); }
    };
    $('wsLoad').onclick = () => {
      try {
        const raw = JSON.parse(decodeURIComponent(escape(atob($('wsCode').value.trim()))));
        if (!Array.isArray(raw.grid) || raw.grid.length < 5 || raw.grid.length > 14 || !raw.start) throw new Error();
        level = { ...newWorkshopLevel(raw.grid.length, raw.biome || 0), start: raw.start, grid: raw.grid };
        save.custom = E.clone(level);
        persist();
        programs = [[], [], []];
        fn1s = [[], [], []];
        fn2s = [[], [], []];
        testing = false;
        resetWorld();
        renderAll();
        renderWorkshopTools();
        closeModal();
        toast('Станция загружена!');
      } catch (e) {
        toast('Не удалось прочитать код станции.');
      }
    };
  }

  // ==================== LANDING & 3D LOOP ====================
  function updateLandingUI() {
    const done = save.stars.filter((n) => n > 0).length;
    const totalStars = save.stars.reduce((a, b) => a + b, 0);
    const nextIdx = highestUnlocked();
    const nextLv = L.LEVELS[nextIdx];
    const nextBm = L.BIOMES[nextLv.biome] || L.BIOMES[0];
    const heroObj = L.CHARACTERS.find((c) => c.id === save.heroSkin) || L.CHARACTERS[0];

    $('menuStarsCount').textContent = String(totalStars);
    $('startBtnLabel').textContent = done > 0 ? 'Продолжить приключение' : 'Начать приключение';
    $('startBtnSub').textContent = `Станция ${nextIdx + 1} · ${nextBm.icon} ${nextLv.name}`;
    $('landingMapSub').textContent = `${done} / ${L.LEVELS.length} пройдено`;
    $('landingHeroSub').textContent = `Герой: ${heroObj.name}`;
    $('landingQuizSub').textContent = `${L.QUIZ.length} задач · рекорд ${save.quizBest}/${L.QUIZ.length}`;
    $('lpText').textContent = done > 0 ? `Станций активировано: ${done} из ${L.LEVELS.length}` : 'Твой путь программиста начинается здесь';
    $('lpStars').textContent = `${totalStars} / ${L.LEVELS.length * 3} ★`;
    $('lpFill').style.width = `${(done / L.LEVELS.length) * 100}%`;

    // Render 8-worlds progress ribbon!
    const ribbon = $('worldsRibbon');
    ribbon.replaceChildren();
    L.CHAPTERS.forEach((ch) => {
      const bm = L.BIOMES[ch.biome];
      const allDone = save.stars.slice(ch.from, ch.to + 1).every((n) => n > 0);
      const isOpen = nextIdx >= ch.from;
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'world-chip' + (allDone ? ' done' : isOpen ? ' open' : '');
      chip.textContent = `${bm.icon} ${bm.short}${allDone ? ' ✓' : ''}`;
      chip.disabled = !isOpen;
      chip.onclick = () => {
        Audio.init();
        $('landing').classList.add('hidden');
        loadLevel(ch.from);
      };
      ribbon.append(chip);
    });
  }

  function syncMusicBtns() {
    const ch = save.settings.music ? '♫' : '♩';
    $('musicBtn').textContent = ch;
    $('menuMusicBtn').textContent = ch;
  }

  function init3D() {
    if (webglFailed) return;
    try {
      if (!game3D) {
        game3D = new S3D.Station3D($('sceneCanvas'), false);
        game3D.onTileTap = paintTile;
      }
      if (!hero3D) {
        hero3D = new S3D.Station3D($('heroCanvas'), true);
      }
    } catch (e) {
      webglFailed = true;
      console.error('WebGL error:', e);
      toast('Для 3D-графики требуется поддержка WebGL.');
    }
  }

  let lastFrame = 0;
  function tick(time) {
    requestAnimationFrame(tick);
    if (document.hidden || time - lastFrame < (window.innerWidth < 760 ? 30 : 16)) return;
    lastFrame = time;

    renderConfetti();
    renderStarfield(time);

    if (!game3D || !hero3D) init3D();
    if (webglFailed) return;

    const landingOpen = !$('landing').classList.contains('hidden');
    if (landingOpen) {
      hero3D.render({
        level: L.HERO_LEVEL,
        grid: L.HERO_LEVEL.grid,
        biome: L.BIOMES[7],
        robots: [L.HERO_LEVEL.start, L.HERO_LEVEL.start2, L.HERO_LEVEL.start3],
        activeRobot: 0,
        anim: null,
        completed: true,
        running: false,
        motion: save.settings.motion,
        levelId: 'hero',
        heroSkin: save.heroSkin,
      }, time);
    } else if (level && world) {
      game3D.render({
        level,
        grid: world,
        biome: L.BIOMES[level.biome] || L.BIOMES[0],
        robots,
        activeRobot,
        anim,
        completed,
        running,
        motion: save.settings.motion,
        levelId: builder ? `workshop-${level.biome}` : `lvl-${levelIndex}`,
        heroSkin: save.heroSkin,
      }, time);
    }
  }

  // ==================== EVENTS & ANDROID HOOKS ====================
  function bindEvents() {
    $('homeBtn').onclick = () => {
      if (running) { running = false; stepping = true; syncControls(); }
      updateLandingUI();
      $('landing').classList.remove('hidden');
    };
    $('startBtn').onclick = () => {
      Audio.init();
      Audio.fx('chirp');
      $('landing').classList.add('hidden');
      loadLevel(highestUnlocked());
    };
    $('landingMapBtn').onclick = openMapModal;
    $('mapBtn').onclick = openMapModal;
    $('landingHangarBtn').onclick = openHangarModal;
    $('hangarBtn').onclick = openHangarModal;
    $('landingWorkshopBtn').onclick = enterWorkshop;
    $('landingGuideBtn').onclick = () => openGuideModal('guide');
    $('guideBtn').onclick = () => openGuideModal('guide');
    $('menuStarsPill').onclick = openBadgesModal;
    $('badgesBtn').onclick = openBadgesModal;
    $('settingsBtn').onclick = openSettingsModal;
    $('menuSettingsBtn').onclick = openSettingsModal;

    const toggleMusic = () => {
      save.settings.music = !save.settings.music;
      Audio.configure(save.settings);
      Audio.init();
      persist();
      syncMusicBtns();
      toast(save.settings.music ? '♫ Космическая музыка включена' : '♩ Музыка выключена');
    };
    $('musicBtn').onclick = toggleMusic;
    $('menuMusicBtn').onclick = toggleMusic;

    $('zoomInBtn').onclick = () => game3D && game3D.zoom(0.84);
    $('zoomOutBtn').onclick = () => game3D && game3D.zoom(1.18);
    $('resetCamBtn').onclick = () => { game3D && game3D.resetCamera(); Audio.fx('click'); };
    $('hintBtn').onclick = () => { closeStagePopovers(); openHintModal(); };
    $('lightBtn').onclick = () => {
      if (!game3D) return;
      const ph = game3D.setPhase(game3D.phaseIndex + 1);
      $('lightBtn').textContent = ['☀', '🌇', '☽', '✨'][game3D.phaseIndex];
      applyStageTheme();
      toast(`Освещение: ${ph.name}`);
      Audio.fx('click');
    };

    $('camMenuBtn').onclick = () => {
      const sc = $('stageControls');
      const willOpen = !sc.classList.contains('cam-open');
      closeStagePopovers();
      if (willOpen) {
        sc.classList.add('cam-open');
        $('camMenuBtn').setAttribute('aria-expanded', 'true');
      }
      Audio.fx('click');
    };

    $('descToggleBtn').onclick = () => {
      const hud = $('missionHud');
      const willOpen = !hud.classList.contains('desc-open');
      closeStagePopovers();
      if (willOpen) {
        hud.classList.add('desc-open');
        $('descToggleBtn').classList.add('open');
      }
      Audio.fx('click');
    };

    $('sceneCanvas').addEventListener('pointerdown', () => {
      closeStagePopovers();
    });

    window.addEventListener('resize', placeCoachCard);
    placeCoachCard();

    $('variantBtn').onclick = () => {
      if (running || anim) return;
      mapVariant = 1 - mapVariant;
      stopExec();
      resetWorld();
      renderSpecialBars();
      renderWorkspace();
      setStatus('ready', `Карта ${mapVariant + 1}: кристаллы и модули поменялись!`);
      Audio.fx('click');
    };

    document.querySelectorAll('#scopeTabs .scope-tab').forEach((btn) => {
      btn.onclick = () => {
        editorScope = btn.dataset.scope;
        if (editorScope === 'code') unlockBadge('python');
        renderWorkspace();
        renderPalette();
        syncControls();
      };
    });

    $('undoBtn').onclick = () => {
      if (running || editorScope === 'code') return;
      const list = currentList();
      if (!list.length) return;
      prepareEdit();
      list.pop();
      afterEdit();
      Audio.fx('click');
    };

    $('clearBtn').onclick = () => {
      if (running || editorScope === 'code') return;
      const list = currentList();
      if (!list.length) return;
      prepareEdit();
      list.length = 0;
      afterEdit();
      Audio.fx('click');
    };

    $('runBtn').onclick = runProgram;
    $('stepBtn').onclick = stepProgram;
    $('resetBtn').onclick = resetRobot;
    $('modalBackdrop').onclick = (e) => { if (e.target === $('modalBackdrop')) closeModal(); };

    document.addEventListener('keydown', (e) => {
      if (!$('modalBackdrop').classList.contains('hidden')) {
        if (e.key === 'Escape') closeModal();
        return;
      }
      if (!$('landing').classList.contains('hidden')) return;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      const k = e.key.toLowerCase();
      if (e.key === 'Enter') { e.preventDefault(); runProgram(); return; }
      if (e.key === 'Backspace') { e.preventDefault(); $('undoBtn').click(); return; }
      if (isTeam() && ['1', '2', '3'].includes(k)) {
        const idx = Number(k) - 1;
        if (idx < robotCnt()) switchRobot(idx);
        return;
      }

      const map = { arrowup: 'F', w: 'F', arrowleft: 'L', a: 'L', arrowright: 'R', d: 'R', p: 'P', c: 'C', j: 'J', e: 'U', x: 'loop', i: 'if' };
      const code = map[k];
      if (code && allowedCommands().includes(code)) {
        e.preventDefault();
        if (code === 'loop') openLoopModal(null);
        else if (code === 'if') openIfModal(null);
        else if (!isFnSelfCall(code)) addBlock(code);
      }
    });

    window.onAndroidBack = function () {
      if (!$('modalBackdrop').classList.contains('hidden')) { closeModal(); return true; }
      if (closeStagePopovers()) return true;
      if ($('landing').classList.contains('hidden')) { $('homeBtn').click(); return true; }
      return false;
    };

    window.onAndroidPause = function () {
      persist();
      if (running) { running = false; stepping = true; syncControls(); }
      Audio.suspend();
    };

    window.onAndroidResume = function () {
      Audio.resume();
    };

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) window.onAndroidPause();
      else window.onAndroidResume();
    });
  }

  // ==================== BOOT ====================
  loadSave();
  bindEvents();
  syncMusicBtns();
  loadLevel(save.lastLevel || 0);
  updateLandingUI();
  requestAnimationFrame(tick);
})();
