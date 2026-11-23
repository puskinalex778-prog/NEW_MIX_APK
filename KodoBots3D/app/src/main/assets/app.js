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

  // ==================== PERSISTENT SAVE STATE ====================
  const SAVE_KEY = 'kodobots-3d-v1';
  let save = {
    stars: Array(L.LEVELS.length).fill(0),
    badges: {},
    quizBest: 0,
    lastLevel: 0,
    custom: null,
    settings: {
      music: true,
      sfx: true,
      haptics: true,
      volume: 0.32,
      speed: 1,
      motion: true,
      unlockAll: false,
    },
  };

  function loadSave() {
    try {
      const raw = JSON.parse(localStorage.getItem(SAVE_KEY) || '{}');
      if (Array.isArray(raw.stars)) {
        save.stars = Array.from({ length: L.LEVELS.length }, (_, i) => Math.min(3, Math.max(0, Number(raw.stars[i]) || 0)));
      }
      if (raw.badges && typeof raw.badges === 'object') save.badges = raw.badges;
      if (typeof raw.quizBest === 'number') save.quizBest = raw.quizBest;
      if (typeof raw.lastLevel === 'number') save.lastLevel = Math.min(L.LEVELS.length - 1, Math.max(0, raw.lastLevel));
      if (raw.custom) save.custom = raw.custom;
      if (raw.settings) save.settings = { ...save.settings, ...raw.settings };
    } catch (e) {}
    Audio.configure(save.settings);
  }

  function persist() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(save));
    } catch (e) {}
  }

  function highestUnlocked() {
    if (save.settings.unlockAll) return L.LEVELS.length - 1;
    let i = 0;
    while (i < L.LEVELS.length - 1 && save.stars[i] > 0) i++;
    return i;
  }

  // ==================== GAME RUNTIME STATE ====================
  let levelIndex = 0;
  let level = null;
  let world = null;
  let builder = false;
  let testing = false;
  let brush = '.';
  let mapVariant = 0;

  // Dual-robot state (single robot uses index 0)
  let activeRobot = 0;
  let programs = [[], []];
  let fn1s = [[], []];
  let robots = [{ x: 0, z: 0, d: 0 }];
  let progress = [
    { pointer: 0, flat: [], done: false, failed: false, actions: 0 },
    { pointer: 0, flat: [], done: false, failed: false, actions: 0 },
  ];

  // Editor state
  let editorScope = 'main'; // 'main' | 'fn1' | 'code'
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

  function isTeam() {
    return !!(level && level.start2 && !builder);
  }

  function currentList() {
    return editorScope === 'fn1' ? fn1s[activeRobot] : programs[activeRobot];
  }

  function allowedCommands() {
    if (builder) return ['F', 'L', 'R', 'P', 'C', 'J', 'U', 'F1', 'loop', 'if'];
    return level.allowed || ['F'];
  }

  function totalBlocksUsed() {
    const count = isTeam() ? 2 : 1;
    let sum = 0;
    for (let i = 0; i < count; i++) {
      sum += E.countBlocks(programs[i]) + E.countBlocks(fn1s[i]);
    }
    return sum;
  }

  function toast(msg) {
    const el = $('toast');
    el.textContent = msg;
    el.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.add('hidden'), 3200);
  }

  function unlockBadge(id) {
    if (save.badges[id]) return;
    save.badges[id] = true;
    persist();
    const b = L.BADGES.find((x) => x.id === id);
    if (b) toast(`🏆 Новое достижение: ${b.icon} ${b.name}!`);
    updateLandingUI();
  }

  function checkProgressBadges() {
    const s = save.stars;
    if (s.some((n) => n > 0)) unlockBadge('first');
    const doneRange = (a, b) => s.slice(a, b + 1).every((n) => n > 0);
    if (doneRange(0, 4)) unlockBadge('ch1');
    if (doneRange(5, 9)) unlockBadge('loops');
    if (doneRange(10, 13)) unlockBadge('debug');
    if (doneRange(14, 18)) unlockBadge('fn');
    if (doneRange(19, 23)) unlockBadge('team');
    if (doneRange(24, 29)) unlockBadge('sensors');
  }

  // ==================== LEVEL & WORLD LIFECYCLE ====================
  function stopExec() {
    running = false;
    stepping = false;
    runToken++;
    anim = null;
    syncControls();
  }

  function loadLevel(idx) {
    stopExec();
    builder = false;
    testing = false;
    levelIndex = idx;
    save.lastLevel = idx;
    persist();

    level = E.clone(L.LEVELS[idx]);
    mapVariant = 0;
    activeRobot = 0;
    editorScope = 'main';
    programs = [level.starter ? E.clone(level.starter) : [], []];
    fn1s = [level.starterFn1 ? E.clone(level.starterFn1) : [], []];
    hintStage = 0;
    coachDismissed = false;

    $('workshopBar').classList.add('hidden');
    resetWorld();
    renderAll();
    if (level.starter || level.starterFn1) {
      setStatus('pause', '🐞 В заготовке спрятан баг! Запусти программу (или по шагам ▷) и исправь ошибку.');
    }
  }

  function resetWorld() {
    world = builder ? E.clone(level.grid) : E.gridForVariant(level, mapVariant);
    robots = [E.clone(level.start)];
    if (isTeam()) robots.push(E.clone(level.start2));
    progress = [
      { pointer: 0, flat: E.expand(programs[0], fn1s[0]), done: false, failed: false, actions: 0 },
      { pointer: 0, flat: E.expand(programs[1], fn1s[1]), done: false, failed: false, actions: 0 },
    ];
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
    const biome = builder ? L.BIOMES[0] : (L.BIOMES[level.biome] || L.BIOMES[0]);
    const ph = game3D ? S3D.LIGHT_PHASES[game3D.phaseIndex] : S3D.LIGHT_PHASES[0];
    const panel = $('stagePanel');
    const isDark = ph.night > 0.5;
    panel.classList.toggle('is-dark', isDark);
    if (isDark) {
      panel.style.background = `radial-gradient(circle at 25% 12%, ${biome.nightSky[1]}, ${biome.nightSky[0]} 75%)`;
    } else if (ph.night > 0.3) {
      panel.style.background = `radial-gradient(circle at 25% 10%, #fed7aa, #a78bfa 58%, #312e81)`;
    } else {
      panel.style.background = `radial-gradient(circle at 22% 10%, ${biome.sky[0]}, ${biome.sky[1]} 55%, ${biome.sky[2]})`;
    }
  }

  function renderAll() {
    const ch = L.chapterFor(levelIndex);
    const biome = builder ? L.BIOMES[0] : (L.BIOMES[level.biome] || L.BIOMES[0]);

    $('chapterLabel').textContent = builder ? 'МАСТЕРСКАЯ 3D' : ch.title;
    $('levelTag').textContent = builder
      ? (testing ? 'Тест станции' : 'Редактор карты')
      : `Станция ${String(levelIndex + 1).padStart(2, '0')} / ${L.LEVELS.length}`;
    $('biomeTag').textContent = biome.short;
    $('levelName').textContent = level.name;
    $('levelDesc').textContent = builder
      ? (testing ? 'Проверь свою станцию программой!' : 'Выбери кисть внизу и нажимай на клетки 3D станции.')
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
    rTabs.classList.toggle('hidden', !isTeam());
    if (isTeam()) {
      rTabs.replaceChildren();
      E.ROBOT_NAMES.forEach((name, idx) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = `robot-tab r${idx}` + (activeRobot === idx ? ' active' : '');
        b.disabled = running || !!anim;
        b.textContent = `${idx + 1} · ${name}${progress[idx].done ? ' ✓' : ''}`;
        b.onclick = () => switchRobot(idx);
        rTabs.append(b);
      });
    }

    const vBtn = $('variantBtn');
    const showVar = !builder && !!level.adaptiveCells;
    vBtn.classList.toggle('hidden', !showVar);
    if (showVar) {
      vBtn.textContent = `🔀 Карта ${mapVariant + 1} / 2 · переключить датчики`;
    }
  }

  function renderScopeTabs() {
    const hasFn = allowedCommands().includes('F1');
    $('tabFn1').classList.toggle('hidden', !hasFn);
    if (!hasFn && editorScope === 'fn1') editorScope = 'main';

    document.querySelectorAll('#scopeTabs .scope-tab').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.scope === editorScope);
    });
    const fnCount = E.countBlocks(fn1s[activeRobot]);
    $('tabFn1').textContent = fnCount ? `ƒ F1 (${fnCount})` : 'ƒ F1';

    $('workspace').classList.toggle('hidden', editorScope === 'code');
    $('codeView').classList.toggle('hidden', editorScope !== 'code');
  }

  function renderReqStrip() {
    const strip = $('reqStrip');
    if (builder) {
      strip.classList.add('hidden');
      return;
    }
    const items = [];
    const activeProgs = isTeam() ? [programs[0], programs[1]] : [programs[0]];
    const activeFns = isTeam() ? [fn1s[0], fn1s[1]] : [fn1s[0]];

    if (level.requireLoop) {
      const met = activeProgs.every((p, i) => E.hasBlockType(p, 'loop') || E.hasBlockType(activeFns[i], 'loop'));
      items.push({ text: '⟳ Нужен Повтор', met });
    }
    if (level.requireFn) {
      const met = activeProgs.some((p, i) => E.hasBlockType(p, 'F1') && activeFns[i].length > 0);
      items.push({ text: 'ƒ Нужна Функция F1', met });
    }
    if (level.requireIf) {
      const met = activeProgs.every((p, i) => E.hasBlockType(p, 'if') || E.hasBlockType(activeFns[i], 'if'));
      items.push({ text: '◇ Нужно «Если…»', met });
    }
    if (level.adaptiveCells) {
      items.push({ text: '🔀 2 варианта карты', met: false });
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
    if (totalCrystals > 0) {
      pills.push({ icon: '◆', label: 'Кристаллы', cur: collectedCrystals, max: totalCrystals });
    }
    if (totalModules > 0) {
      pills.push({ icon: '☀', label: 'Модули', cur: fixedModules, max: totalModules });
    }
    if (isTeam()) {
      const doneCnt = (progress[0].done ? 1 : 0) + (progress[1].done ? 1 : 0);
      pills.push({ icon: '◎', label: 'Порталы', cur: doneCnt, max: 2 });
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
      .replace(/(вперёд|налево|направо|починить|собрать|прыжок|сигнал|датчик|f1)(?=\()/g, '<span class="py-fn">$1</span>');
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
      const lines = E.toPseudocode(programs[activeRobot], fn1s[activeRobot], E.ROBOT_NAMES[activeRobot]);
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
      empty.innerHTML = editorScope === 'fn1'
        ? '<b>Функция F1 пока пуста</b><span>Добавь команды снизу — потом вызывай их одним блоком «F1()»!</span>'
        : `<b>${isTeam() ? 'Алгоритм: ' + E.ROBOT_NAMES[activeRobot] : 'Собери свой алгоритм'}</b><span>Нажимай на команды внизу. Нажми на любой блок, чтобы изменить его.</span>`;
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
      up.title = 'Выше';
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
      del.title = 'Удалить';
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

  function renderPalette() {
    const pal = $('palette');
    pal.replaceChildren();
    const list = allowedCommands();
    list.forEach((code) => {
      // Prevent F1 inside F1 (avoid recursion confusion for kids)
      const disabledInFn = editorScope === 'fn1' && code === 'F1';
      const meta = E.CMD[code];
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'cmd-btn';
      b.dataset.code = code;
      b.style.setProperty('--btn-col', meta.color);
      b.title = `${meta.detail} (${meta.key})`;
      b.disabled = running || disabledInFn;
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

    // Subtle pulse on level 1 first command
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
      if (builder && !testing) text = 'Построй станцию кистями на 3D поле, затем нажми «Запустить» для проверки!';
      else if (programs[activeRobot].length) text = 'Алгоритм собран! Нажми «▶ Запустить» или проверь по одному шагу «▷».';
      else if (levelIndex === 0) text = 'Нажми «Вперёд» два раза, затем «▶ Запустить»!';
      else text = 'Выбирай команды внизу, чтобы составить программу.';
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
      const code = b.dataset.code;
      b.disabled = running || (editorScope === 'fn1' && code === 'F1');
    });
    document.querySelectorAll('#robotTabs button').forEach((b) => {
      b.disabled = running || !!anim;
    });
  }

  // ==================== EDITING COMMANDS ====================
  function prepareEdit() {
    if (running) return false;
    const p = progress[activeRobot];
    if (p.pointer > 0 || completed || failed || stepping || (isTeam() && (progress[0].done || progress[1].done))) {
      stopExec();
      resetWorld();
    }
    return true;
  }

  function addBlock(node) {
    if (running) return;
    if (totalBlocksUsed() >= 64) {
      toast('Максимум 64 блока в алгоритме.');
      return;
    }
    prepareEdit();
    currentList().push(node);
    Audio.fx('click');
    afterEdit();
  }

  function afterEdit() {
    progress[activeRobot].flat = E.expand(programs[activeRobot], fn1s[activeRobot]);
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
    renderSpecialBars();
    renderWorkspace();
    renderPalette();
    syncControls();
    setStatus(
      progress[idx].done ? 'success' : 'ready',
      progress[idx].done
        ? `${E.ROBOT_NAMES[idx]} уже в своём портале! Переключись на напарника.`
        : `Программируем: ${E.ROBOT_NAMES[idx]}.`
    );
  }

  // ==================== EXECUTION & STEP DEBUGGER ====================
  async function executeOneStep(token) {
    if (token !== runToken) return false;
    const p = progress[activeRobot];
    const bot = robots[activeRobot];
    const others = robots.filter((_, i) => i !== activeRobot);
    const state = { world, robot: bot, others };

    const condRes = E.resolveHeadConditions(p.flat, p.pointer, fn1s[activeRobot], state);
    if (condRes.error) {
      failExecution(condRes.error, null, -1);
      return false;
    }
    if (condRes.lastBranch) {
      Audio.fx('scan');
    }

    if (p.pointer >= p.flat.length) {
      failExecution('Ветка условия не выполнила действий. Проверь ветки «Если / Иначе»!', editorScope, -1);
      return false;
    }

    const item = p.flat[p.pointer];
    const before = E.clone(bot);

    activeScope = item.scope;
    activeRow = item.row;
    activeTrace = item.iterLabel || '';
    if (editorScope !== 'code' && item.scope !== editorScope) {
      editorScope = item.scope;
    }
    renderWorkspace();

    const cmdName = E.CMD[item.code] ? E.CMD[item.code].name : item.code;
    setStatus('running', `${E.ROBOT_NAMES[activeRobot]} · шаг ${p.pointer + 1}: ${cmdName}${item.iterLabel ? ' (' + item.iterLabel + ')' : ''}`);

    const res = E.transition(item.code, state);
    if (!res.ok) {
      if (game3D) {
        game3D.flashErrorTile(res.x, res.z);
        game3D.setMood(activeRobot, 'sad');
      }
      failExecution(`Блок ${item.row + 1}: ${res.message}`, item.scope, item.row);
      return false;
    }

    // Visual & Audio effects
    p.actions++;
    if (res.type === 'collect') {
      collectedCrystals++;
      Audio.fx('collect');
      if (game3D && save.settings.motion) game3D.burst(res.x, res.z, 0xf472b6, 22);
    } else if (res.type === 'fix') {
      fixedModules++;
      Audio.fx('fix');
      if (game3D && save.settings.motion) game3D.burst(res.x, res.z, 0x34d399, 22);
    } else if (res.type === 'activate') {
      Audio.fx('activate');
      if (game3D && save.settings.motion) {
        game3D.burst(res.x, res.z, 0xfacc15, 24);
        (res.opened || []).forEach(([gx, gz]) => game3D.burst(gx, gz, 0x38bdf8, 20));
      }
    } else {
      Audio.fx(res.type === 'turn' ? 'turn' : res.type === 'jump' ? 'jump' : 'step');
    }

    const dur = (save.settings.motion ? 470 : 120) / save.settings.speed;
    anim = { from: before, to: E.clone(bot), start: performance.now(), duration: dur, jump: res.type === 'jump' };
    await new Promise((r) => setTimeout(r, dur));
    if (token !== runToken) return false;
    anim = null;
    p.pointer++;
    renderObjectives();

    // Check end of current robot's program
    const nextCond = E.resolveHeadConditions(p.flat, p.pointer, fn1s[activeRobot], state);
    if (nextCond.error) {
      failExecution(nextCond.error, null, -1);
      return false;
    }

    if (p.pointer >= p.flat.length) {
      running = false;
      stepping = false;
      activeScope = null;
      activeRow = -1;
      activeTrace = '';

      const goalTile = activeRobot === 0 ? 'B' : 'E';
      const atGoal = world[bot.z]?.[bot.x] === goalTile;

      if (isTeam()) {
        p.done = atGoal;
        renderSpecialBars();
        renderObjectives();
        renderWorkspace();

        if (progress[0].done && progress[1].done && collectedCrystals === totalCrystals && fixedModules === totalModules) {
          handleVictory();
          return false;
        }
        if (atGoal) {
          if (game3D) game3D.setMood(activeRobot, 'happy');
          Audio.fx('collect');
          setStatus('success', `${E.ROBOT_NAMES[activeRobot]} в портале! Теперь переключись на ${E.ROBOT_NAMES[1 - activeRobot]} и запусти его.`);
        } else {
          if (game3D) game3D.setMood(activeRobot, 'sad');
          p.failed = true;
          failed = true;
          Audio.fx('error');
          setStatus('error', `${E.ROBOT_NAMES[activeRobot]} остановился, не дойдя до своего портала. Исправь маршрут!`);
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
          ? `Алгоритм завершён, но остались задачи: кристаллов — ${leftC}, модулей — ${leftM}. Дополни код!`
          : 'Команды закончились, а золотой портал ещё впереди! Добавь шаги и запусти снова.';
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
      setStatus('pause', 'Пауза. Нажми «Продолжить» или «▷» для пошаговой отладки.');
      syncControls();
      return;
    }
    if (anim || completed) return;
    if (!programs[activeRobot].length) {
      toast(`Добавь хотя бы одну команду для ${E.ROBOT_NAMES[activeRobot]}.`);
      return;
    }
    if (isTeam() && progress[activeRobot].done) {
      toast(`${E.ROBOT_NAMES[activeRobot]} уже у портала! Переключись на напарника.`);
      return;
    }

    if (builder && !testing) {
      testing = true;
      $('workshopBar').classList.add('hidden');
      $('levelTag').textContent = 'Тест станции';
      $('levelDesc').textContent = 'Проверяем твою станцию программой!';
      resetWorld();
    } else if (failed || progress[activeRobot].pointer >= progress[activeRobot].flat.length) {
      if (!isTeam() || failed) resetWorld();
    }

    if (!stepping) {
      progress[activeRobot].flat = E.expand(programs[activeRobot], fn1s[activeRobot]);
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
      const more = await executeOneStep(token);
      if (!more) break;
    }
    syncControls();
  }

  async function stepProgram() {
    Audio.init();
    if (running || anim || completed) return;
    if (!programs[activeRobot].length) {
      toast('Сначала добавь команды в алгоритм.');
      return;
    }
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
      progress[activeRobot].flat = E.expand(programs[activeRobot], fn1s[activeRobot]);
      progress[activeRobot].pointer = 0;
    }
    stepping = true;
    coachDismissed = true;
    $('coachCard').classList.add('hidden');
    syncControls();

    const token = runToken;
    const more = await executeOneStep(token);
    if (more && token === runToken) {
      setStatus('pause', `Шаг выполнен (${progress[activeRobot].pointer} / ${progress[activeRobot].flat.length}). Нажми ▷ для следующего!`);
    }
    syncControls();
  }

  function resetRobot() {
    stopExec();
    if (builder && testing) {
      testing = false;
      $('workshopBar').classList.remove('hidden');
      $('levelTag').textContent = 'Редактор карты';
      $('levelDesc').textContent = 'Выбери кисть внизу и нажимай на клетки 3D станции.';
    }
    resetWorld();
    renderSpecialBars();
    renderWorkspace();
    setStatus('ready', 'Роботы вернулись на старт — твой код сохранён!');
    Audio.fx('click');
  }

  function handleVictory() {
    if (!builder) {
      const err = E.validateCurriculum(programs, fn1s, level);
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
    if (game3D) {
      game3D.setMood(-1, 'happy');
      robots.forEach((r) => {
        if (save.settings.motion) game3D.burst(r.x, r.z, 0xfbbf24, 34);
      });
    }
    setStatus('success', '🎉 Портал активирован! Станция сияет энергией!');

    const usedBlocks = totalBlocksUsed();
    const modelBlocks = E.countBlocks(level.model)
      + E.countBlocks(level.model2)
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

    const totalActs = progress[0].actions + (isTeam() ? progress[1].actions : 0);
    const tok = runToken;
    setTimeout(() => {
      if (tok !== runToken || !completed) return;
      showWinModal(stars, totalActs, usedBlocks);
    }, 1050);
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
      <div class="m-eyebrow" style="text-align:center">${builder ? 'АВТОРСКАЯ СТАНЦИЯ' : isLast ? 'АКАДЕМИЯ ПРОЙДЕНА!' : 'МИССИЯ ВЫПОЛНЕНА'}</div>
      <div class="win-stars">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</div>
      <h2 id="modalTitle" style="text-align:center;margin-right:0">${isLast ? 'Ты — Звёздный Программист!' : 'Станция активирована!'}</h2>
      <p style="text-align:center">${
        builder
          ? 'Твой алгоритм успешно прошёл твою же станцию! Можешь поделиться кодом карты с друзьями.'
          : isLast
            ? 'Все 30 космических станций спасены! Ты освоил циклы, отладку, функции F1, работу в команде и датчики.'
            : level.adaptiveCells
              ? 'Отлично! Алгоритм автоматически проверен на обоих вариантах карты — всё работает!'
              : 'Пиксель гордится тобой! Готов к следующей миссии?'
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

  // Block editor modal (replace primitive OR open loop/if editor)
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
      <p>Выбери новую команду на место «${esc(E.CMD[node].name)}»:</p>
      <div class="ed-palette" id="repGrid"></div>
      <div class="modal-actions">
        <button id="repUp" type="button" ${idx === 0 ? 'disabled' : ''}>↑ Выше</button>
        <button id="repDown" type="button" ${idx === list.length - 1 ? 'disabled' : ''}>↓ Ниже</button>
        <button id="repDel" class="btn-danger" type="button">Удалить</button>
      </div>
    `);

    allowedCommands()
      .filter((c) => c !== 'loop' && c !== 'if' && !(editorScope === 'fn1' && c === 'F1'))
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

    $('repUp').onclick = () => {
      prepareEdit();
      [list[idx - 1], list[idx]] = [list[idx], list[idx - 1]];
      afterEdit();
      closeModal();
    };
    $('repDown').onclick = () => {
      prepareEdit();
      [list[idx + 1], list[idx]] = [list[idx], list[idx + 1]];
      afterEdit();
      closeModal();
    };
    $('repDel').onclick = () => {
      prepareEdit();
      list.splice(idx, 1);
      afterEdit();
      closeModal();
    };
  }

  // Loop modal (create or edit)
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
        .filter((c) => c !== 'loop' && !(editorScope === 'fn1' && c === 'F1'))
        .forEach((c) => {
          const b = document.createElement('button');
          b.type = 'button';
          b.textContent = E.CMD[c].short;
          b.onclick = () => {
            if (draft.body.length >= 10) { toast('До 10 команд внутри цикла.'); return; }
            Audio.fx('click');
            if (c === 'if') {
              openIfModal(null, null, (node) => { draft.body.push(node); draw(); });
            } else {
              draft.body.push(c);
              draw();
            }
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

  // Conditional IF modal
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
        .filter((c) => c !== 'loop' && c !== 'if' && !(editorScope === 'fn1' && c === 'F1'))
        .forEach((c) => {
          const b = document.createElement('button');
          b.type = 'button';
          b.textContent = E.CMD[c].short;
          b.onclick = () => {
            if (arr.length >= 6) return;
            Audio.fx('click');
            arr.push(c);
            draw();
          };
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

  // Station Map Modal
  function openMapModal() {
    if (running) { running = false; stepping = true; syncControls(); }
    const done = save.stars.filter((n) => n > 0).length;
    const totalStars = save.stars.reduce((a, b) => a + b, 0);
    const maxUnlock = highestUnlocked();

    let html = `
      <div class="m-eyebrow">ЗВЁЗДНАЯ КАРТА</div>
      <h2 id="modalTitle">30 космических станций</h2>
      <p>Пройдено: <b>${done} / ${L.LEVELS.length}</b> · Собрано звёзд: <b>${totalStars} / ${L.LEVELS.length * 3} ★</b></p>
    `;

    L.CHAPTERS.forEach((ch, ci) => {
      html += `<div class="chapter-block"><div class="chapter-head"><span>ГЛАВА ${ci + 1} · ${ch.title}</span><span>${ch.skill}</span></div><div class="map-grid">`;
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

  // Progressive 3-Stage Hint Modal
  function openHintModal() {
    if (builder) {
      openGuideModal();
      return;
    }
    if (running) { running = false; stepping = true; syncControls(); }
    hintStage = Math.min(3, hintStage + 1);

    let text = '';
    if (hintStage === 1) {
      text = level.desc;
    } else if (hintStage === 2) {
      const parts = [];
      if (level.starter || level.starterFn1) parts.push('Нажми кнопку пошаговой отладки «▷» и посмотри, на каком блоке Пиксель ошибается.');
      if (level.requireFn) parts.push('Переключись на вкладку «ƒ F1», собери там повторяющуюся часть, а в основном коде вызывай блок «F1()».');
      if (level.requireIf) parts.push('Помести блок «Если…» внутрь повтора (или в F1), чтобы датчик проверял каждую клетку перед шагом.');
      if (isTeam()) parts.push('Если на станции есть пульт ⚡, сначала запусти Пикселя, чтобы отключить лазерные ворота для Битика!');
      if (!parts.length) parts.push('Посмотри на стрелку у ног Пикселя и разбей маршрут на маленькие одинаковые участки.');
      text = parts.join('\n\n');
    } else {
      const lines = [];
      if (level.modelFn1) lines.push('ƒ F1 (Пиксель): ' + level.modelFn1.map(E.formatBlock).join(' → '));
      lines.push('Пиксель: ' + level.model.map(E.formatBlock).join(' → '));
      if (level.modelFn2) lines.push('ƒ F1 (Битик): ' + level.modelFn2.map(E.formatBlock).join(' → '));
      if (level.model2) lines.push('Битик: ' + level.model2.map(E.formatBlock).join(' → '));
      text = lines.join('\n\n');
    }

    showModal(`
      <div class="m-eyebrow">ПОДСКАЗКА · ШАГ ${hintStage} / 3</div>
      <h2 id="modalTitle">${hintStage === 3 ? 'Пример верного алгоритма' : 'Давай разберёмся вместе'}</h2>
      <p style="white-space:pre-wrap;color:#0f172a;font-size:14px;background:#f8fafc;padding:12px;border-radius:12px;border:1px solid #e2e8f0">${esc(text)}</p>
      <p>Подсказки не отнимают звёзды — они помогают учиться программировать!</p>
      <div class="modal-actions">
        <button id="hClose" type="button">Попробую сам</button>
        ${hintStage < 3 ? '<button id="hMore" class="btn-primary" type="button">Ещё подсказка →</button>' : ''}
      </div>
    `);
    $('hClose').onclick = closeModal;
    if ($('hMore')) $('hMore').onclick = openHintModal;
  }

  // Guide + Interactive Quiz Modal
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
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
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
            <div class="m-eyebrow">ВОПРОС ${qIdx + 1} / ${L.QUIZ.length} · ${esc(item.topic)}</div>
            <h3 style="margin:6px 0 10px;font-size:16px">${esc(item.q)}</h3>
            <div id="quizOpts"></div>
            <p id="quizExp" style="margin-top:10px;font-weight:600"></p>
            <div class="modal-actions" id="quizNav"></div>
          </div>
        `;
      } else {
        if (qScore > save.quizBest) {
          save.quizBest = qScore;
          persist();
        }
        if (qScore >= 8) unlockBadge('quiz');
        body = `
          <div class="quiz-card" style="text-align:center">
            <div style="font-size:44px">${qScore >= 8 ? '🎓' : '🚀'}</div>
            <h3>Результат: ${qScore} из ${L.QUIZ.length}!</h3>
            <p>${qScore >= 8 ? 'Блестяще! Ты отлично понимаешь алгоритмы и получил значок «Знаток алгоритмов»!' : 'Отличная тренировка! Попробуй ещё раз и набери 8+ для получения значка.'}</p>
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
          <button id="gTabGuide" type="button" class="${tab === 'guide' ? 'active' : ''}">📘 Справочник</button>
          <button id="gTabQuiz" type="button" class="${tab === 'quiz' ? 'active' : ''}">🧠 Викторина (лучший: ${save.quizBest}/10)</button>
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
      if ($('quizRetry')) {
        $('quizRetry').onclick = () => { qIdx = 0; qScore = 0; qAnswered = false; draw(); };
      }
    }
    draw();
  }

  // Badges Modal
  function openBadgesModal() {
    const unlockedCount = Object.keys(save.badges).length;
    showModal(`
      <div class="m-eyebrow">ТВОИ НАГРАДЫ</div>
      <h2 id="modalTitle">Достижения (${unlockedCount} / ${L.BADGES.length})</h2>
      <div class="badges-grid">
        ${L.BADGES.map((b) => `
          <div class="badge-card ${save.badges[b.id] ? 'unlocked' : ''}">
            <div class="badge-ico">${b.icon}</div>
            <b style="font-size:13px;display:block">${esc(b.name)}</b>
            <small style="font-size:11px;color:#475569">${esc(b.desc)}</small>
          </div>
        `).join('')}
      </div>
    `, true);
  }

  // Settings Modal
  function openSettingsModal() {
    const s = save.settings;
    showModal(`
      <div class="m-eyebrow">НАСТРОЙКИ</div>
      <h2 id="modalTitle">Твой темп игры</h2>
      <div class="setting-row">
        <div><strong>Космическая музыка</strong><small>Спокойный синтезаторный фон</small></div>
        <button id="sMusic" class="toggle-btn ${s.music ? 'on' : ''}" type="button">${s.music ? 'Вкл' : 'Выкл'}</button>
      </div>
      <div class="setting-row">
        <div><strong>Громкость музыки</strong><small>${Math.round(s.volume * 100)}%</small></div>
        <input id="sVol" type="range" min="0" max="100" value="${Math.round(s.volume * 100)}" style="width:120px" />
      </div>
      <div class="setting-row">
        <div><strong>Звуки роботов</strong><small>Шаги, кристаллы, лазеры и победы</small></div>
        <button id="sSfx" class="toggle-btn ${s.sfx ? 'on' : ''}" type="button">${s.sfx ? 'Вкл' : 'Выкл'}</button>
      </div>
      <div class="setting-row">
        <div><strong>Виброотклик (APK)</strong><small>Лёгкая вибрация при нажатиях</small></div>
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
        <div><strong>Режим учителя (открыть все 30)</strong><small>Доступ к любой станции сразу</small></div>
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
        openSettingsModal();
      };
    };
    bindToggle('sMusic', 'music');
    bindToggle('sSfx', 'sfx');
    bindToggle('sHap', 'haptics');
    bindToggle('sUnlock', 'unlockAll');
    $('sVol').oninput = (e) => {
      s.volume = Number(e.target.value) / 100;
      Audio.configure(s);
      persist();
    };
    $('sSpeed').onchange = (e) => {
      s.speed = Number(e.target.value);
      persist();
    };
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
        toast('Прогресс сброшен. Можно начинать заново!');
      };
    };
  }

  // ==================== 3D STATION WORKSHOP ====================
  function newWorkshopLevel(size) {
    const n = size || 8;
    return {
      name: 'Моя космическая станция',
      desc: 'Авторская 3D станция',
      biome: 0,
      allowed: ['F', 'L', 'R', 'P', 'C', 'J', 'U', 'F1', 'loop', 'if'],
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

  function enterWorkshop() {
    Audio.init();
    stopExec();
    builder = true;
    testing = false;
    activeRobot = 0;
    editorScope = 'main';
    level = save.custom ? E.clone(save.custom) : newWorkshopLevel(8);
    programs = [[], []];
    fn1s = [[], []];
    $('landing').classList.add('hidden');
    resetWorld();
    renderAll();
    renderWorkshopTools();
    toast('Нажимай на клетки 3D станции, чтобы рисовать свой уровень!');
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
      ['K', '⚡ Пульт'],
      ['X', '🚧 Лазер'],
      ['B', '◎ Портал'],
      ['start', '🤖 Старт'],
    ];
    brushes.forEach(([v, lbl]) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = lbl;
      b.className = brush === v ? 'selected' : '';
      b.onclick = () => { brush = v; renderWorkshopTools(); };
      bar.append(b);
    });

    const rot = document.createElement('button');
    rot.type = 'button';
    rot.textContent = '↻ Поворот';
    rot.onclick = () => {
      level.start.d = (level.start.d + 1) % 4;
      save.custom = E.clone(level);
      persist();
      resetWorld();
    };

    const sz = document.createElement('button');
    sz.type = 'button';
    sz.textContent = `📐 ${level.grid.length}×${level.grid.length}`;
    sz.onclick = () => {
      const next = level.grid.length === 8 ? 10 : level.grid.length === 10 ? 12 : 8;
      level = newWorkshopLevel(next);
      save.custom = E.clone(level);
      persist();
      programs = [[], []];
      fn1s = [[], []];
      resetWorld();
      renderAll();
      renderWorkshopTools();
    };

    const share = document.createElement('button');
    share.type = 'button';
    share.textContent = '📤 Код';
    share.onclick = openWorkshopShare;

    bar.append(rot, sz, share);
  }

  function paintTile(gx, gz) {
    if (!builder || testing) return;
    if (brush === 'start') {
      if (level.grid[gz][gx] !== '.') { toast('Старт можно ставить только на свободную палубу.'); return; }
      level.start = { x: gx, z: gz, d: level.start.d };
    } else {
      if (level.start.x === gx && level.start.z === gz) { toast('Сначала перенеси старт на другую клетку.'); return; }
      if (level.grid[gz][gx] === 'B' && brush !== 'B') { toast('На станции всегда должен быть один портал!'); return; }
      if (brush === 'B') {
        level.grid = level.grid.map((row) => row.map((t) => (t === 'B' ? '.' : t)));
      }
      level.grid[gz][gx] = brush;
    }
    save.custom = E.clone(level);
    persist();
    resetWorld();
    Audio.fx('click');
  }

  function openWorkshopShare() {
    const code = btoa(unescape(encodeURIComponent(JSON.stringify({ v: 1, start: level.start, grid: level.grid }))));
    showModal(`
      <div class="m-eyebrow">МАСТЕРСКАЯ · ОБМЕН СТАНЦИЯМИ</div>
      <h2 id="modalTitle">Код твоей станции</h2>
      <p>Скопируй код, чтобы отправить другу, или вставь чужой код и нажми «Загрузить»:</p>
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
        level = { ...newWorkshopLevel(raw.grid.length), start: raw.start, grid: raw.grid };
        save.custom = E.clone(level);
        persist();
        programs = [[], []];
        fn1s = [[], []];
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
    const badgeCount = Object.keys(save.badges).length;
    const nextIdx = highestUnlocked();

    $('startBtnLabel').textContent = done > 0
      ? `Продолжить · Станция ${nextIdx + 1}`
      : 'Начать приключение';
    $('landingMapSub').textContent = `${done} / ${L.LEVELS.length} пройдено`;
    $('landingBadgesSub').textContent = `${badgeCount} / ${L.BADGES.length} значков`;
    $('lpText').textContent = done > 0 ? `Станций активировано: ${done} из ${L.LEVELS.length}` : 'Твой путь программиста начинается здесь';
    $('lpStars').textContent = `${totalStars} / ${L.LEVELS.length * 3} ★`;
    $('lpFill').style.width = `${(done / L.LEVELS.length) * 100}%`;
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

    if (!game3D || !hero3D) init3D();
    if (webglFailed) return;

    const landingOpen = !$('landing').classList.contains('hidden');
    if (landingOpen) {
      hero3D.render({
        level: L.HERO_LEVEL,
        grid: L.HERO_LEVEL.grid,
        biome: L.BIOMES[0],
        robots: [L.HERO_LEVEL.start],
        activeRobot: 0,
        anim: null,
        completed: true,
        running: false,
        motion: save.settings.motion,
        levelId: 'hero',
      }, time);
    } else if (level && world) {
      game3D.render({
        level,
        grid: world,
        biome: builder ? L.BIOMES[0] : (L.BIOMES[level.biome] || L.BIOMES[0]),
        robots,
        activeRobot,
        anim,
        completed,
        running,
        motion: save.settings.motion,
        levelId: builder ? 'workshop' : `lvl-${levelIndex}`,
      }, time);
    }
  }

  // ==================== EVENTS & ANDROID LIFECYCLE ====================
  function bindEvents() {
    $('homeBtn').onclick = () => {
      if (running) { running = false; stepping = true; syncControls(); }
      updateLandingUI();
      $('landing').classList.remove('hidden');
    };
    $('startBtn').onclick = () => {
      Audio.init();
      $('landing').classList.add('hidden');
      loadLevel(highestUnlocked());
    };
    $('landingMapBtn').onclick = openMapModal;
    $('mapBtn').onclick = openMapModal;
    $('landingWorkshopBtn').onclick = enterWorkshop;
    $('landingGuideBtn').onclick = () => openGuideModal('guide');
    $('guideBtn').onclick = () => openGuideModal('guide');
    $('landingBadgesBtn').onclick = openBadgesModal;
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
    $('hintBtn').onclick = openHintModal;
    $('lightBtn').onclick = () => {
      if (!game3D) return;
      const ph = game3D.setPhase(game3D.phaseIndex + 1);
      $('lightBtn').textContent = ['☀', '🌇', '☽', '✨'][game3D.phaseIndex];
      applyStageTheme();
      toast(`Освещение: ${ph.name}`);
      Audio.fx('click');
    };

    $('variantBtn').onclick = () => {
      if (running || anim) return;
      mapVariant = 1 - mapVariant;
      stopExec();
      resetWorld();
      renderSpecialBars();
      renderWorkspace();
      setStatus('ready', `Карта ${mapVariant + 1}: предметы поменялись, программы сохранены!`);
      Audio.fx('click');
    };

    document.querySelectorAll('#scopeTabs .scope-tab').forEach((btn) => {
      btn.onclick = () => {
        editorScope = btn.dataset.scope;
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

    $('modalBackdrop').onclick = (e) => {
      if (e.target === $('modalBackdrop')) closeModal();
    };

    // Keyboard support for tablets/desktops
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
      if (isTeam() && (k === '1' || k === '2')) { switchRobot(Number(k) - 1); return; }

      const map = { arrowup: 'F', w: 'F', arrowleft: 'L', a: 'L', arrowright: 'R', d: 'R', p: 'P', c: 'C', j: 'J', e: 'U', f: 'F1', x: 'loop', i: 'if' };
      const code = map[k];
      if (code && allowedCommands().includes(code)) {
        e.preventDefault();
        if (code === 'loop') openLoopModal(null);
        else if (code === 'if') openIfModal(null);
        else if (!(editorScope === 'fn1' && code === 'F1')) addBlock(code);
      }
    });

    // Android lifecycle hooks
    window.onAndroidBack = function () {
      if (!$('modalBackdrop').classList.contains('hidden')) {
        closeModal();
        return true;
      }
      if ($('landing').classList.contains('hidden')) {
        $('homeBtn').click();
        return true;
      }
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
