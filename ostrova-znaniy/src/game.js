/* ===== Движок игры ===== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const app = $('#app');
const KEY = 'ostrova_save_v2';
const S = Object.assign({ name: 'Саша', grade: 3, best: {}, mistakes: [], story: 0, storyDone: 0, sound: true, solved: 0 },
  (() => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } })());
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
const totalStars = () => Object.values(S.best).reduce((a, b) => a + b, 0) + S.storyDone * 3;
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const isSvg = s => /^<svg/.test(String(s));
const label = s => isSvg(s) ? s : esc(s).replace(/&lt;br&gt;/g, '<br>').replace(/&lt;(\/?)small&gt;/g, '<$1small>');
const plural = (n, a, b, c) => { const m = n % 10, h = n % 100; return m === 1 && h !== 11 ? a : m >= 2 && m <= 4 && (h < 10 || h >= 20) ? b : c; };
const fill = t => t.replace(/\{name\}/g, S.name);

/* ---------- Карта островов ---------- */
function showMap() {
  $('#scene').classList.remove('dusk');
  const isl = ISLANDS.map((is, i) => {
    const max = is.lessons.length * 3;
    const got = is.lessons.reduce((a, _, k) => a + (S.best[is.id + ':' + k] || 0), 0);
    return `<div class="island" data-i="${i}">${Art.island(i, is.c1, is.c2, got > 0)}
      <div class="label" style="background:linear-gradient(180deg,${is.c1},${is.c2})"><span class="ic">${is.ic}</span>${is.name}</div>
      <div class="prog">⭐ ${got}/${max}</div></div>`;
  }).join('');
  const nSteps = STORY.steps.length;
  app.innerHTML = `<div class="screen">
    <div class="topbar">
      <button class="chip" id="prof">👤 ${esc(S.name)} · ${S.grade} кл.</button><div class="sp"></div>
      <button class="chip">⭐ ${totalStars()}</button>
      <button class="chip icon" id="ach">🏆</button>
      <button class="chip icon" id="set">⚙️</button>
      <button class="chip icon" id="inf">i</button>
    </div>
    <div class="map">${isl}</div>
    <div class="map-chars">${Art.lumik(S.storyDone < 1)}${Art.hero()}</div>
    <div class="bottombar">
      <button class="btn orange" id="story"><span class="t">📖 Сюжет: Небесные мосты<small>${S.storyDone ? 'Глава 1 пройдена ✔' : `шаг ${Math.min(S.story + 1, nSteps)} из ${nSteps}`}</small></span></button>
      <button class="btn" style="background:linear-gradient(180deg,#c37bff,#a24df0);box-shadow:0 6px 0 #7f2fcf" id="mul"><span class="t">✖️ Мастерская умножения</span></button>
      <button class="btn blue" id="err"><span class="t">🛠️ Работа над ошибками<small>${S.mistakes.length ? S.mistakes.length + ' ' + plural(S.mistakes.length, 'задание', 'задания', 'заданий') : 'ошибок нет'}</small></span></button>
    </div></div>`;
  $$('.island').forEach(el => el.onclick = () => { Sfx.tap(); islandMenu(+el.dataset.i); });
  $('#story').onclick = () => { Sfx.tap(); startStory(); };
  $('#mul').onclick = () => { Sfx.tap(); mulMenu(); };
  $('#err').onclick = () => {
    Sfx.tap();
    if (!S.mistakes.length) return modal(`<h2>🛠️ Работа над ошибками</h2><p>Ошибок пока нет — так держать! Когда ошибёшься в задании, оно появится здесь, и его можно будет решить ещё раз.</p><div class="row"><button class="btn" data-close>Хорошо</button></div>`);
    startLesson({ title: 'Работа над ошибками', tasks: S.mistakes.slice(0, 10).map(m => JSON.parse(JSON.stringify(m))), review: true });
  };
  $('#prof').onclick = profile; $('#set').onclick = settings; $('#inf').onclick = info; $('#ach').onclick = achievements;
}

function modal(html, onReady) {
  const bg = document.createElement('div');
  bg.className = 'modal-bg';
  bg.innerHTML = `<div class="modal">${html}</div>`;
  bg.onclick = e => { if (e.target === bg || e.target.closest('[data-close]')) bg.remove(); };
  document.body.appendChild(bg);
  onReady && onReady(bg);
  return bg;
}

function islandMenu(i) {
  const is = ISLANDS[i];
  const items = is.lessons.map((l, k) => {
    const b = S.best[is.id + ':' + k] || 0;
    return `<button class="lesson-item" data-k="${k}"><span class="num" style="background:linear-gradient(180deg,${is.c1},${is.c2})">${k + 1}</span><span class="nm">${l.name}</span><span class="st">${'⭐'.repeat(b)}${'☆'.repeat(3 - b)}</span></button>`;
  }).join('');
  modal(`<h2>${is.ic} ${is.name}</h2><div class="lesson-list">${items}</div><div class="row"><button class="btn gray" data-close>Закрыть</button></div>`, bg => {
    $$('.lesson-item', bg).forEach(b => b.onclick = () => {
      bg.remove(); Sfx.tap();
      const k = +b.dataset.k;
      startLesson({ title: is.lessons[k].name, tasks: is.lessons[k].gen(), key: is.id + ':' + k, back: () => { showMap(); islandMenu(i); } });
    });
  });
}

function mulMenu() {
  let t = '';
  for (let k = 2; k <= 9; k++) t += `<button data-k="${k}">× ${k}<small>${'⭐'.repeat(S.best['mul:' + k] || 0) || '—'}</small></button>`;
  modal(`<h2>✖️ Мастерская умножения</h2><p>Выбери таблицу умножения для тренировки.</p><div class="tables">${t}<button class="all" data-k="0">🎲 Всё вперемешку</button></div><div class="row"><button class="btn gray" data-close>Закрыть</button></div>`, bg => {
    $$('.tables button', bg).forEach(b => b.onclick = () => {
      bg.remove(); Sfx.tap(); const k = +b.dataset.k;
      startLesson({ title: k ? `Таблица умножения на ${k}` : 'Умножение вперемешку', tasks: mulLesson(k), key: 'mul:' + k, back: () => { showMap(); mulMenu(); } });
    });
  });
}

function profile() {
  modal(`<h2>👤 Профиль</h2>
    <label class="field">Имя<input id="nm" maxlength="16" value="${esc(S.name)}"></label>
    <label class="field">Класс<select id="gr">${[1, 2, 3, 4].map(g => `<option ${g === S.grade ? 'selected' : ''}>${g}</option>`).join('')}</select></label>
    <div class="row"><button class="btn gray" data-close>Отмена</button><button class="btn" id="ok">Сохранить</button></div>`, bg => {
    $('#ok', bg).onclick = () => { S.name = $('#nm', bg).value.trim() || 'Игрок'; S.grade = +$('#gr', bg).value; save(); bg.remove(); showMap(); };
  });
}
function settings() {
  modal(`<h2>⚙️ Настройки</h2>
    <div class="lesson-list"><button class="lesson-item" id="snd"><span class="num" style="background:var(--blue)">${S.sound ? '🔊' : '🔇'}</span><span class="nm">Звук: ${S.sound ? 'включён' : 'выключен'}</span></button>
    <button class="lesson-item" id="rst"><span class="num" style="background:var(--red)">↺</span><span class="nm">Начать игру заново</span></button></div>
    <div class="row"><button class="btn" data-close>Готово</button></div>`, bg => {
    $('#snd', bg).onclick = () => { S.sound = !S.sound; save(); bg.remove(); settings(); };
    $('#rst', bg).onclick = () => {
      bg.remove();
      modal(`<h2>Начать заново?</h2><p>Все звёзды, ошибки и сюжет будут сброшены.</p><div class="row"><button class="btn gray" data-close>Нет</button><button class="btn orange" id="yes">Да, сбросить</button></div>`, b2 => {
        $('#yes', b2).onclick = () => { Object.assign(S, { best: {}, mistakes: [], story: 0, storyDone: 0, solved: 0 }); save(); b2.remove(); showMap(); };
      });
    };
  });
}
function info() {
  modal(`<h2>ℹ️ Для родителей</h2><p>Игра для учеников 1–4 классов: математика, русский язык, чтение, окружающий мир и английский.</p>
  <p>В заданиях карточки можно <b>перетаскивать пальцем</b> в нужную группу или окошко. Можно и просто нажать на карточку, а потом на группу.</p>
  <p>Ошибки собираются в «Работе над ошибками». Прогресс хранится только на этом устройстве.</p><div class="row"><button class="btn" data-close>Понятно</button></div>`);
}
function achievements() {
  const list = [
    ['🌟', 'Первая звезда', totalStars() >= 1], ['🏝️', 'Пройти урок на каждом острове', ISLANDS.every(is => is.lessons.some((_, k) => S.best[is.id + ':' + k]))],
    ['🌉', 'Починить первый Небесный мост', S.storyDone >= 1], ['✖️', 'Освоить 3 таблицы умножения на 3 звезды', [2, 3, 4, 5, 6, 7, 8, 9].filter(k => S.best['mul:' + k] === 3).length >= 3],
    ['🧠', 'Решить 50 заданий', S.solved >= 50], ['💯', 'Собрать 30 звёзд', totalStars() >= 30]
  ];
  modal(`<h2>🏆 Достижения</h2>${list.map(a => `<div class="ach ${a[2] ? '' : 'off'}"><span class="i">${a[0]}</span>${a[1]}</div>`).join('')}<p>Решено заданий: <b>${S.solved}</b></p><div class="row"><button class="btn" data-close>Закрыть</button></div>`);
}

/* ---------- Урок ---------- */
let L = null;
function startLesson(opts) {
  L = Object.assign({ i: 0, errors: 0, back: showMap }, opts);
  app.innerHTML = `<div class="screen">
    <div class="lhead"><button class="back" id="bk">←</button><h1>${esc(L.title)}</h1>
      <div class="pbar"><span id="cnt"></span><div class="track"><div class="fill" id="pf"></div></div></div>
      <button class="chip icon" id="snd" style="background:linear-gradient(180deg,#36b6c4,#16909e)">${S.sound ? '🔊' : '🔇'}</button></div>
    <div class="lbody">
      <div class="helper"><div class="bubble" id="bub"></div><div id="rb">${Art.robot()}</div><button class="btn yellow" id="hint">💡 Подсказка</button></div>
      <div class="card-panel" id="panel"></div>
    </div></div>`;
  $('#bk').onclick = () => { Sfx.tap(); L.back(); };
  $('#snd').onclick = e => { S.sound = !S.sound; save(); e.currentTarget.textContent = S.sound ? '🔊' : '🔇'; };
  $('#hint').onclick = () => { Sfx.tap(); say(L.tasks[L.i].hint || 'Подумай ещё немного — у тебя получится!'); };
  renderTask();
}
function say(t, ms = 6000) {
  const b = $('#bub'); if (!b) return;
  b.innerHTML = '💡 ' + esc(t); b.classList.add('show');
  clearTimeout(say.t); say.t = setTimeout(() => b.classList.remove('show'), ms);
}
function robotMood(c) { const r = $('#rb svg'); if (!r) return; r.classList.remove('happy', 'sad', 'hover'); void r.offsetWidth; r.classList.add(c); setTimeout(() => { r.classList.remove(c); r.classList.add('hover'); }, 1300); }

function renderTask() {
  const t = L.tasks[L.i]; L.tried = false;
  $('#cnt').textContent = `${L.i + 1} / ${L.tasks.length}`;
  $('#pf').style.width = (L.i / L.tasks.length * 100) + '%';
  $('#bub').classList.remove('show');
  const p = $('#panel');
  p.innerHTML = `<h2>${esc(t.title)}</h2><div class="sub">${esc(t.sub)}</div><div class="task" id="task"></div><div class="actions" id="act"></div><div class="toast" id="toast"></div>`;
  ({ choice: renderChoice, sort: renderSort, order: renderSlots, match: renderSlots })[t.type](t, $('#task'));
}
function toast(ok, txt) {
  const el = $('#toast'); el.className = 'toast show ' + (ok ? 'good' : 'bad'); el.textContent = txt;
  setTimeout(() => el.classList.remove('show'), 1400);
}
function praise() { return ['Отлично! 🎉', 'Молодец! ⭐', 'Супер! 🚀', 'Верно! 👏', 'Здорово! 🌈'][R(0, 4)]; }

function taskDone(ok) {
  const t = L.tasks[L.i];
  if (ok) {
    S.solved++;
    if (!L.tried) { if (L.review) S.mistakes = S.mistakes.filter(m => JSON.stringify(m) !== JSON.stringify(t.orig || t)); }
    save(); Sfx.good(); robotMood('happy'); toast(true, praise());
    const r = $('#panel').getBoundingClientRect(); Confetti.burst(r.left + r.width / 2, r.top + r.height / 2, 40, .8);
    $('#act').innerHTML = `<button class="btn" id="nx">Дальше →</button>`;
    $('#nx').onclick = () => { Sfx.tap(); next(); };
  } else {
    if (!L.tried) {
      L.errors++; L.tried = true;
      const copy = t.orig || t; if (!S.mistakes.some(m => JSON.stringify(m) === JSON.stringify(copy))) S.mistakes.unshift(copy);
      S.mistakes = S.mistakes.slice(0, 40); save();
    }
    Sfx.bad(); robotMood('sad'); toast(false, 'Попробуй ещё раз!');
    say(t.hint || 'Подумай ещё немного!');
  }
}
function next() {
  L.i++;
  if (L.onTaskEnd) return L.onTaskEnd();
  if (L.i < L.tasks.length) return renderTask();
  $('#pf').style.width = '100%';
  const stars = L.errors === 0 ? 3 : L.errors <= 2 ? 2 : 1;
  if (L.key && stars > (S.best[L.key] || 0)) S.best[L.key] = stars;
  save(); showResult(stars);
}
function showResult(stars) {
  app.innerHTML = `<div class="screen result"><div class="modal">
    <h2 style="justify-content:center">${stars === 3 ? 'Превосходно!' : stars === 2 ? 'Хорошая работа!' : 'Урок пройден!'}</h2>
    <div class="bigstars"><span>⭐</span><span>⭐</span><span>⭐</span></div>
    <p>${L.review ? 'Ошибок осталось: ' + S.mistakes.length : L.errors ? 'Ошибок: ' + L.errors + '. Они сохранены в «Работе над ошибками».' : 'Ни одной ошибки!'}</p>
    <div class="row" style="justify-content:center"><button class="btn gray" id="mp">🏝️ На карту</button><button class="btn blue" id="again">↻ Ещё раз</button></div></div></div>`;
  $$('.bigstars span').forEach((s, k) => k < stars && setTimeout(() => { s.classList.add('on'); Sfx.star(); const r = s.getBoundingClientRect(); Confetti.burst(r.left + r.width / 2, r.top + r.height / 2, 30); }, 350 + k * 450));
  $('#mp').onclick = () => { Sfx.tap(); showMap(); };
  const o = L;
  $('#again').onclick = () => {
    Sfx.tap();
    if (o.review) return S.mistakes.length ? startLesson({ title: o.title, tasks: S.mistakes.slice(0, 10).map(m => JSON.parse(JSON.stringify(m))), review: true }) : showMap();
    if (o.key && o.key.startsWith('mul:')) return startLesson(Object.assign({}, o, { i: 0, errors: 0, tasks: mulLesson(+o.key.slice(4)) }));
    const [id, k] = (o.key || '').split(':'); const is = ISLANDS.find(x => x.id === id);
    if (is) return startLesson(Object.assign({}, o, { i: 0, errors: 0, tasks: is.lessons[+k].gen() }));
    showMap();
  };
}

/* ---------- Выбор ответа ---------- */
function renderChoice(t, box) {
  box.innerHTML = `<div class="prompt ${String(t.prompt).length > 16 ? 'txt' : ''}">${esc(t.prompt)}</div><div class="opts">${t.options.map(o => `<button class="opt">${esc(o)}</button>`).join('')}</div>`;
  let done = false;
  $$('.opt', box).forEach(b => b.onclick = () => {
    if (done || b.classList.contains('bad')) return;
    if (b.textContent === t.answer) { done = true; b.classList.add('good'); taskDone(true); }
    else { b.classList.add('bad'); taskDone(false); }
  });
}

/* ---------- Перетаскивание пальцем (drag & drop) ---------- */
function cardHTML(v, key) { return `<div class="card" data-v="${esc(isSvg(v) ? '' : v)}" data-key="${esc(key)}">${label(v)}</div>`; }

function enableDrag(box, onChange) {
  let d = null, sel = null;
  const zoneAt = (x, y) => { const el = document.elementFromPoint(x, y); return el && el.closest('.zone,.slot,.pool'); };
  const clearOver = () => $$('.over', box).forEach(z => z.classList.remove('over'));

  function place(card, zone, fromRect) {
    if (!zone || !box.contains(zone)) return false;
    const body = zone.classList.contains('zone') ? $('.zb', zone) : zone;
    if (body.contains(card)) return false;
    if (zone.classList.contains('slot')) {
      const old = $('.card', zone);
      if (old) { const src = card.parentElement; (src.classList.contains('slot') ? src : $('.pool', box)).appendChild(old); fixSlots(); }
    }
    const first = fromRect || card.getBoundingClientRect();
    body.appendChild(card); fixSlots();
    const last = card.getBoundingClientRect();
    card.animate([{ transform: `translate(${first.left - last.left}px,${first.top - last.top}px) scale(1.08)` }, { transform: 'none' }], { duration: 280, easing: 'cubic-bezier(.3,1.4,.5,1)' });
    Sfx.drop(); onChange(); return true;
  }
  function fixSlots() {
    $$('.slot', box).forEach(s => s.classList.toggle('filled', !!$('.card', s)));
    const pool = $('.pool', box); if (pool) pool.classList.toggle('empty', !$('.card', pool));
  }
  box._place = place; box._fix = fixSlots;

  box.addEventListener('pointerdown', e => {
    const card = e.target.closest('.card');
    if (!card || card.classList.contains('locked') || !box.contains(card)) return;
    e.preventDefault();
    d = { card, x0: e.clientX, y0: e.clientY, moved: false, id: e.pointerId };
  });
  window.addEventListener('pointermove', move, { passive: false });
  window.addEventListener('pointerup', up);
  window.addEventListener('pointercancel', up);

  function move(e) {
    if (!d || e.pointerId !== d.id) return;
    const dx = e.clientX - d.x0, dy = e.clientY - d.y0;
    if (!d.moved && Math.hypot(dx, dy) < 7) return;
    e.preventDefault();
    if (!d.moved) {
      d.moved = true; Sfx.pick();
      if (sel) { sel.classList.remove('sel'); sel = null; }
      const r = d.card.getBoundingClientRect(); d.r = r;
      const g = d.card.cloneNode(true); g.classList.add('ghost'); g.classList.remove('sel');
      g.style.width = r.width + 'px'; g.style.height = r.height + 'px';
      document.body.appendChild(g); d.g = g; d.card.classList.add('dragging');
    }
    d.g.style.transform = `translate(${d.r.left + dx}px,${d.r.top + dy}px) rotate(${Math.max(-8, Math.min(8, dx / 25))}deg) scale(1.1)`;
    clearOver(); const z = zoneAt(e.clientX, e.clientY); if (z && box.contains(z)) z.classList.add('over');
  }
  function up(e) {
    if (!d || e.pointerId !== d.id) return;
    const cur = d; d = null; clearOver();
    if (!cur.moved) { // нажатие без перетаскивания: выбрать карточку
      if (sel === cur.card) { sel.classList.remove('sel'); sel = null; return; }
      if (sel) sel.classList.remove('sel');
      sel = cur.card; sel.classList.add('sel'); Sfx.tap(); return;
    }
    const gr = cur.g.getBoundingClientRect();
    cur.g.remove(); cur.card.classList.remove('dragging');
    const z = zoneAt(e.clientX, e.clientY);
    if (!place(cur.card, z, gr)) {
      const last = cur.card.getBoundingClientRect();
      cur.card.animate([{ transform: `translate(${gr.left - last.left}px,${gr.top - last.top}px)` }, { transform: 'none' }], { duration: 300, easing: 'cubic-bezier(.3,1.3,.5,1)' });
    }
  }
  box.addEventListener('click', e => { // режим «нажми карточку, потом место»
    if (!sel) return;
    const z = e.target.closest('.zone,.slot,.pool');
    if (z && !e.target.closest('.card')) { const c = sel; c.classList.remove('sel'); sel = null; place(c, z); }
  });
  box._cleanup = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up); };
  const obs = new MutationObserver(() => { if (!document.body.contains(box)) { box._cleanup(); obs.disconnect(); } });
  obs.observe(app, { childList: true, subtree: true });
}

function checkButton(box, t, verify) {
  const act = $('#act');
  act.innerHTML = `<button class="btn" id="chk" disabled>Проверить ✔</button>`;
  const btn = $('#chk');
  const upd = () => { btn.disabled = !!$('.pool .card', box); };
  enableDrag(box, upd);
  btn.onclick = () => {
    const cards = $$('.card', box).filter(c => !c.classList.contains('locked'));
    let wrong = 0;
    cards.forEach(c => { const ok = verify(c); c.classList.remove('good', 'bad'); c.classList.add(ok ? 'good' : 'bad'); if (ok) c.classList.add('locked'); else wrong++; });
    if (!wrong) { taskDone(true); return; }
    taskDone(false); btn.disabled = true;
    setTimeout(() => {
      const pool = $('.pool', box);
      $$('.card.bad', box).forEach(c => { c.classList.remove('bad'); box._place(c, pool); });
      upd();
    }, 900);
  };
}

function renderSort(t, box) {
  box.innerHTML = `<div class="pool">${t.items.map(it => cardHTML(it[0], it[1])).join('')}</div>
    <div class="groups">${t.groups.map((g, k) => `<div class="zone c${k}" data-key="${esc(g[0])}"><div class="zh">${g[2] || ''} ${label(g[1])}</div><div class="zb"></div></div>`).join('')}</div>`;
  checkButton(box, t, c => c.closest('.zone') && c.closest('.zone').dataset.key === c.dataset.key);
}

function renderSlots(t, box) {
  if (t.type === 'order') {
    const items = t.items.map(String);
    let mixed = shuffle(items); if (mixed.join() === items.join() && items.length > 1) mixed = items.slice().reverse();
    box.innerHTML = `<div class="slots">${items.map((v, k) => `${k ? '<span class="arrow">›</span>' : ''}<div class="slot" data-key="${esc(v)}"><span class="n">${k + 1}</span></div>`).join('')}</div>
      <div class="pool">${mixed.map(v => cardHTML(v, v)).join('')}</div>`;
  } else {
    const right = shuffle(t.pairs.map(p => String(p[1])));
    box.innerHTML = `<div class="pairs">${t.pairs.map(p => {
      const l = String(p[0]); const sw = /^#[0-9a-f]{6}$/i.test(l);
      const em = /^\p{Extended_Pictographic}/u.test(l) && l.length <= 8;
      return `<div class="pair"><div class="left ${sw ? 'sw' : ''}" ${sw ? `style="background:${l}"` : ''}>${sw ? '' : em ? `<span class="em">${esc(l)}</span>` : esc(l)}</div><span class="arrow">→</span><div class="slot" data-key="${esc(p[1])}"></div></div>`;
    }).join('')}</div><div class="pool">${right.map(v => cardHTML(v, v)).join('')}</div>`;
  }
  checkButton(box, t, c => { const s = c.closest('.slot'); return s && s.dataset.key === c.dataset.key; });
}

/* ---------- Сюжет ---------- */
function startStory() {
  if (S.storyDone && S.story >= STORY.steps.length) S.story = 0;
  $('#scene').classList.add('dusk');
  const steps = STORY.steps, tasksTotal = steps.filter(s => s.task).length;
  const doneTasks = () => steps.slice(0, S.story).filter(s => s.task).length;
  app.innerHTML = `<div class="screen">
    <div class="lhead"><button class="back" id="bk">←</button><h1>📖 ${STORY.title} · шаг <span id="stp"></span></h1></div>
    <div class="stage" id="stage">${Art.hero()}${Art.lumik(true)}${Art.cloudFace()}
      <div class="bridge">${Array.from({ length: tasksTotal }, () => '<div class="plank"></div>').join('')}</div>
      <div class="dialog"><div class="who" id="who"></div><div class="txt" id="txt"></div>
        <div class="row"><button class="btn gray" id="skip">Пропустить ⏭</button><button class="btn blue" id="nxt">Дальше →</button></div></div>
    </div></div>`;
  $('#bk').onclick = () => { Sfx.tap(); save(); showMap(); };
  let typing = null;
  const names = { lumik: 'Лумик', hero: () => S.name, cloud: 'Облако', robot: 'Робик' };
  function refresh() {
    const n = doneTasks();
    $$('.plank').forEach((p, k) => p.classList.toggle('on', k < n));
    const lum = $('#stage .lumik'); lum.classList.toggle('dim', n < tasksTotal); lum.style.filter = `brightness(${.75 + n / tasksTotal * .45})`;
    if (S.story >= 9) $('#stage .cloudy').classList.add('show');
    $('#stp').textContent = `${Math.min(S.story + 1, steps.length)}/${steps.length}`;
  }
  function show() {
    refresh();
    if (S.story >= steps.length) { S.storyDone = Math.max(S.storyDone, 1); save(); return finish(); }
    const st = steps[S.story];
    if (st.task) return runTask(st.task());
    const nm = names[st.who]; $('#who').textContent = typeof nm === 'function' ? nm() : nm;
    if (st.who === 'cloud') { const c = $('#stage .cloudy'); c.classList.remove('sneeze'); void c.getBoundingClientRect(); c.classList.add('sneeze'); }
    const full = fill(st.t); let k = 0; const el = $('#txt');
    clearInterval(typing); el.textContent = '';
    typing = setInterval(() => { el.textContent = full.slice(0, ++k); if (k >= full.length) { clearInterval(typing); typing = null; } }, 24);
    $('#nxt').onclick = () => { Sfx.tap(); if (typing) { clearInterval(typing); typing = null; el.textContent = full; return; } S.story++; save(); show(); };
    $('#skip').onclick = () => { Sfx.tap(); clearInterval(typing); while (S.story < steps.length && !steps[S.story].task) S.story++; save(); show(); };
  }
  function runTask(task) {
    startLesson({ title: STORY.title, tasks: [task], back: () => { save(); showMap(); } });
    $('#cnt').textContent = `дощечка ${doneTasks() + 1} из ${tasksTotal}`;
    L.onTaskEnd = () => { S.story++; save(); startStory(); };
  }
  function finish() {
    Sfx.star(); Confetti.burst(innerWidth / 2, innerHeight / 3, 120, 1.2);
    $('#who').textContent = 'Глава 1 пройдена!';
    $('#txt').textContent = `Ура, ${S.name}! Мост починен, и ты получаешь 3 звезды ⭐⭐⭐`;
    $('#skip').style.display = 'none';
    $('#nxt').textContent = 'На карту 🏝️';
    $('#nxt').onclick = () => { Sfx.tap(); showMap(); };
  }
  show();
}

/* ---------- Запуск ---------- */
buildScene();
showMap();
document.addEventListener('contextmenu', e => e.preventDefault());
