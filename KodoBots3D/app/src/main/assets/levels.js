(function (root) {
  'use strict';

  function parseGrid(rows) {
    return rows.map((r) => r.split(''));
  }

  const BIOMES = [
    {
      id: 'lunar',
      name: 'ЛУННАЯ БАЗА',
      short: 'ЛУНА',
      sky: ['#dbeafe', '#bfdbfe', '#93c5fd'],
      nightSky: ['#0b132b', '#1c2541'],
      sun: 0xfff5dc,
      fog: 0xdbeafe,
      deck: 0xdbe7f3,
      deck2: 0xc8d9ea,
      trim: 0x64748b,
      base: 0x475569,
      rock: 0x64748b,
      plasma: 0x1e3a8a,
      glow: 0x38bdf8,
    },
    {
      id: 'reef',
      name: 'КРИСТАЛЬНЫЙ РИФ',
      short: 'РИФ',
      sky: ['#ccfbf1', '#99f6e4', '#67e8f9'],
      nightSky: ['#062433', '#0e3b4e'],
      sun: 0xe6fffa,
      fog: 0xbff7f0,
      deck: 0x99e2d8,
      deck2: 0x7fd4c9,
      trim: 0x0f766e,
      base: 0x115e59,
      rock: 0x33658a,
      plasma: 0x0c4a6e,
      glow: 0x2dd4bf,
    },
    {
      id: 'mars',
      name: 'МАРСИАНСКАЯ ТЕПЛИЦА',
      short: 'МАРС',
      sky: ['#ffedd5', '#fed7aa', '#fdba74'],
      nightSky: ['#2b1418', '#451d25'],
      sun: 0xffd7a8,
      fog: 0xfde2c4,
      deck: 0xe8b490,
      deck2: 0xdca078,
      trim: 0x9a3412,
      base: 0x7c2d12,
      rock: 0x9a5b44,
      plasma: 0x431407,
      glow: 0xfb923c,
    },
    {
      id: 'neon',
      name: 'НЕОНОВАЯ ОРБИТА',
      short: 'ОРБИТА',
      sky: ['#e0e7ff', '#c7d2fe', '#a5b4fc'],
      nightSky: ['#0f1035', '#1d1b54'],
      sun: 0xeef2ff,
      fog: 0xd4dcff,
      deck: 0xa5b4e8,
      deck2: 0x91a2df,
      trim: 0x3730a3,
      base: 0x312e81,
      rock: 0x4c4a8a,
      plasma: 0x1e1b4b,
      glow: 0x818cf8,
    },
    {
      id: 'core',
      name: 'ЗВЁЗДНОЕ ЯДРО',
      short: 'ЯДРО',
      sky: ['#fef3c7', '#fde68a', '#ddd6fe'],
      nightSky: ['#140d2e', '#28154c'],
      sun: 0xfff0b8,
      fog: 0xf3e8ff,
      deck: 0xd8c8f5,
      deck2: 0xc7b3ee,
      trim: 0x5b21b6,
      base: 0x4c1d95,
      rock: 0x6d4c9a,
      plasma: 0x2e1065,
      glow: 0xfbbf24,
    },
  ];

  const CHAPTERS = [
    { from: 0,  to: 4,  title: 'ОСНОВЫ КОДА',       skill: 'Последовательность' },
    { from: 5,  to: 9,  title: 'ПРЫЖКИ И ЦИКЛЫ',    skill: 'Циклы' },
    { from: 10, to: 13, title: 'ОХОТА НА БАГИ',     skill: 'Отладка' },
    { from: 14, to: 18, title: 'ФУНКЦИИ F1',        skill: 'Функции' },
    { from: 19, to: 23, title: 'КОМАНДА РОБОТОВ',   skill: 'Два робота' },
    { from: 24, to: 29, title: 'ДАТЧИКИ И УСЛОВИЯ', skill: 'Условия' },
  ];

  const LEVELS = [
    // ================= ГЛАВА 1: ОСНОВЫ КОДА (0..4) =================
    {
      name: 'Первый импульс',
      desc: 'Напиши свою первую программу! Сделай два шага вперёд до золотого портала.',
      biome: 0,
      allowed: ['F'],
      start: { x: 1, z: 3, d: 0 },
      grid: parseGrid([
        'WWW',
        'WBW',
        'W.W',
        'W.W',
        'WWW',
      ]),
      model: ['F', 'F'],
      maxBlocks: 10,
      coach: ['УРОК 1 · ПОСЛЕДОВАТЕЛЬНОСТЬ', 'Привет! Я Пиксель.', 'Команды выполняются сверху вниз. Добавь два блока «Вперёд» и нажми «Запустить»!'],
    },
    {
      name: 'Солнечный модуль',
      desc: 'Впереди повреждённый модуль. Почини его командой «Починить», затем пройди через него к порталу.',
      biome: 0,
      allowed: ['F', 'P'],
      start: { x: 1, z: 3, d: 0 },
      grid: parseGrid([
        'WRW',
        'WBW',
        'WSW',
        'W.W',
        'WWW',
      ]),
      model: ['P', 'F', 'F'],
      maxBlocks: 10,
      coach: ['НОВАЯ КОМАНДА · ПОЧИНИТЬ', 'Действие на клетку впереди', '«Починить» активирует модуль прямо перед роботом, не сдвигая его с места. После починки по нему можно идти!'],
    },
    {
      name: 'Энергокристалл',
      desc: 'Собери кристалл впереди, пройди дальше, почини модуль и доберись до портала.',
      biome: 0,
      allowed: ['F', 'P', 'C'],
      start: { x: 1, z: 4, d: 0 },
      grid: parseGrid([
        'WWW',
        'WBW',
        'WSW',
        'WCW',
        'W.W',
        'WWW',
      ]),
      model: ['C', 'F', 'P', 'F', 'F'],
      maxBlocks: 12,
      coach: ['НОВАЯ КОМАНДА · СОБРАТЬ', 'Чистим путь и копим энергию', '«Собрать» забирает кристалл с клетки перед роботом и освобождает проход.'],
    },
    {
      name: 'Курс направо',
      desc: 'Поверни направо у угла платформы, собери кристалл и зайди в портал.',
      biome: 0,
      allowed: ['F', 'P', 'C', 'R'],
      start: { x: 1, z: 3, d: 0 },
      grid: parseGrid([
        'WWWWW',
        'W.CBW',
        'W.WWW',
        'W.WWW',
        'WWWWW',
      ]),
      model: ['F', 'F', 'R', 'C', 'F', 'F'],
      maxBlocks: 12,
      coach: ['НОВАЯ КОМАНДА · НАПРАВО', 'Смотри на стрелку у ног', 'Поворот вращает Пикселя на месте. Стрелка на полу всегда показывает, куда он пойдёт по команде «Вперёд».'],
    },
    {
      name: 'Зигзаг на орбите',
      desc: 'Используй оба поворота, чтобы обойти метеорит, починить модуль и собрать кристалл.',
      biome: 0,
      allowed: ['F', 'L', 'R', 'P', 'C'],
      start: { x: 3, z: 4, d: 0 },
      grid: parseGrid([
        'WWWWW',
        'WBS.W',
        'WRR.W',
        'W.C.W',
        'WWW.W',
        'WWWWW',
      ]),
      model: ['F', 'L', 'C', 'R', 'F', 'F', 'L', 'P', 'F', 'F'],
      maxBlocks: 18,
      coach: ['НОВАЯ КОМАНДА · НАЛЕВО', 'Обходим метеориты', 'Каменные скалы не пройти насквозь. Продумай маршрут — или проверяй его кнопкой «Шаг» (▷)!'],
    },

    // ================= ГЛАВА 2: ПРЫЖКИ И ЦИКЛЫ (5..9) =================
    {
      name: 'Космический прыжок',
      desc: 'Прыжок переносит робота через одну клетку вперёд. Перепрыгни разлом к порталу!',
      biome: 1,
      allowed: ['F', 'L', 'R', 'P', 'C', 'J'],
      start: { x: 1, z: 5, d: 0 },
      grid: parseGrid([
        'WWW',
        'WBW',
        'W.W',
        'WWW',
        'W.W',
        'W.W',
        'WWW',
      ]),
      model: ['F', 'J', 'F'],
      maxBlocks: 10,
      coach: ['НОВАЯ КОМАНДА · ПРЫЖОК', 'Через провал на 2 клетки', '«Прыжок» переносит робота сразу на вторую клетку вперёд — главное, чтобы там была твёрдая платформа!'],
    },
    {
      name: 'Два берега рифа',
      desc: 'Собери кристалл, перепрыгни канал и почини модуль на другом берегу.',
      biome: 1,
      allowed: ['F', 'L', 'R', 'P', 'C', 'J'],
      start: { x: 1, z: 3, d: 0 },
      grid: parseGrid([
        'WWWWWWW',
        'W.W.SBW',
        'WCWWWWW',
        'W.WWWWW',
        'WWWWWWW',
      ]),
      model: ['C', 'F', 'F', 'R', 'J', 'P', 'F', 'F'],
      maxBlocks: 14,
    },
    {
      name: 'Лестница циклов',
      desc: 'Видишь три одинаковые ступеньки? Собери одну связку и повтори её 3 раза!',
      biome: 1,
      allowed: ['F', 'L', 'R', 'P', 'C', 'J', 'loop'],
      start: { x: 1, z: 7, d: 0 },
      grid: parseGrid([
        'WWWWWWWWW',
        'WWWWW..BW',
        'WWWWW.WWW',
        'WWW...WWW',
        'WWW.WWWWW',
        'W...WWWWW',
        'W.WWWWWWW',
        'W.WWWWWWW',
        'WWWWWWWWW',
      ]),
      model: [{ type: 'loop', n: 3, body: ['F', 'F', 'R', 'F', 'F', 'L'] }],
      maxBlocks: 9,
      requireLoop: true,
      coach: ['НОВАЯ КОМАНДА · ПОВТОР', 'Сила циклов!', 'Зачем писать 18 команд, если можно 3 раза повторить 6? Нажми «Повтор» и сложи внутрь одну ступеньку.'],
    },
    {
      name: 'Ритм инженера',
      desc: 'На каждом из трёх этапов ждёт кристалл и модуль. Уложись в один цикл и не больше 11 блоков!',
      biome: 1,
      allowed: ['F', 'L', 'R', 'P', 'C', 'J', 'loop'],
      start: { x: 1, z: 7, d: 0 },
      grid: parseGrid([
        'WWWWWWWWW',
        'WWWWWS.BW',
        'WWWWWCWWW',
        'WWWS..WWW',
        'WWWCWWWWW',
        'WS..WWWWW',
        'WCWWWWWWW',
        'W.WWWWWWW',
        'WWWWWWWWW',
      ]),
      model: [{ type: 'loop', n: 3, body: ['C', 'F', 'P', 'F', 'R', 'F', 'F', 'L'] }],
      maxBlocks: 11,
      requireLoop: true,
    },
    {
      name: 'Прыжки по ритму',
      desc: 'Два одинаковых прыжковых участка, а в конце — короткий выход к порталу. Отдели цикл от финиша!',
      biome: 1,
      allowed: ['F', 'L', 'R', 'P', 'C', 'J', 'loop'],
      start: { x: 1, z: 9, d: 0 },
      grid: parseGrid([
        'WWWWWWW',
        'WWWWWBW',
        'WWWWW.W',
        'WWW.S.W',
        'WWWWWWW',
        'WRWCWWW',
        'W.S.WWW',
        'WWWWWWW',
        'WCWWWWW',
        'W.WWWWW',
        'WWWWWWW',
      ]),
      model: [{ type: 'loop', n: 2, body: ['C', 'F', 'J', 'R', 'P', 'F', 'F', 'L'] }, 'F', 'F'],
      maxBlocks: 13,
      requireLoop: true,
    },

    // ================= ГЛАВА 3: ОХОТА НА БАГИ (10..13) =================
    {
      name: 'Баг в счётчике',
      desc: 'Кто-то оставил ошибку в числе повторений! Нажми на блок «Повтор» и исправь его.',
      biome: 2,
      allowed: ['F', 'L', 'R', 'P', 'C', 'J', 'loop'],
      start: { x: 1, z: 7, d: 0 },
      grid: parseGrid([
        'WWWWWWWWW',
        'WWWWWS.BW',
        'WWWWWCWWW',
        'WWWS..WWW',
        'WWWCWWWWW',
        'WS..WWWWW',
        'WCWWWWWWW',
        'W.WWWWWWW',
        'WWWWWWWWW',
      ]),
      starter: [{ type: 'loop', n: 2, body: ['C', 'F', 'P', 'F', 'R', 'F', 'F', 'L'] }],
      model: [{ type: 'loop', n: 3, body: ['C', 'F', 'P', 'F', 'R', 'F', 'F', 'L'] }],
      maxBlocks: 11,
      requireLoop: true,
      coach: ['ГЛАВА 3 · ОТЛАДКА', 'Ищем баг в чужом коде!', 'Запусти заготовку и посмотри, где остановится Пиксель. Нажми на блок «Повтор» в программе, чтобы его исправить!'],
    },
    {
      name: 'Поворот не туда',
      desc: 'Внутри цикла перепутан поворот. Отредактируй тело повтора, не удаляя всю программу!',
      biome: 2,
      allowed: ['F', 'L', 'R', 'P', 'C', 'J', 'loop'],
      start: { x: 1, z: 8, d: 0 },
      grid: parseGrid([
        'WWWWWWWWW',
        'WWWWWWWBW',
        'WWWWW...W',
        'WWWWW.WWW',
        'WWW...WWW',
        'WWW.WWWWW',
        'W...WWWWW',
        'W.WWWWWWW',
        'W.WWWWWWW',
        'WWWWWWWWW',
      ]),
      starter: [{ type: 'loop', n: 3, body: ['F', 'F', 'L', 'F', 'F', 'L'] }, 'F'],
      model: [{ type: 'loop', n: 3, body: ['F', 'F', 'R', 'F', 'F', 'L'] }, 'F'],
      maxBlocks: 10,
      requireLoop: true,
    },
    {
      name: 'Перепутанные шаги',
      desc: 'Робот пытается наступить на кристалл, не собрав его. Поменяй порядок команд в цикле!',
      biome: 2,
      allowed: ['F', 'L', 'R', 'P', 'C', 'J', 'loop'],
      start: { x: 1, z: 1, d: 1 },
      grid: parseGrid([
        'WWWWWWWWWW',
        'W.CSCSCSBW',
        'WWWWWWWWWW',
      ]),
      starter: [{ type: 'loop', n: 3, body: ['F', 'C', 'P', 'F'] }, 'F'],
      model: [{ type: 'loop', n: 3, body: ['C', 'F', 'P', 'F'] }, 'F'],
      maxBlocks: 8,
      requireLoop: true,
    },
    {
      name: 'Два разных ритма',
      desc: 'Сначала короткая лестница (2 раза), затем уборка с модулями (2 раза). Используй два цикла!',
      biome: 2,
      allowed: ['F', 'L', 'R', 'P', 'C', 'J', 'loop'],
      start: { x: 1, z: 7, d: 0 },
      grid: parseGrid([
        'WWWWWWWWW',
        'WWWWWS.BW',
        'WWWWWCWWW',
        'WWWS..WWW',
        'WWWCWWWWW',
        'WW..WWWWW',
        'W..WWWWWW',
        'W.WWWWWWW',
        'WWWWWWWWW',
      ]),
      model: [
        { type: 'loop', n: 2, body: ['F', 'R', 'F', 'L'] },
        { type: 'loop', n: 2, body: ['C', 'F', 'P', 'F', 'R', 'F', 'F', 'L'] },
      ],
      maxBlocks: 16,
      requireLoop: true,
    },

    // ================= ГЛАВА 4: ФУНКЦИИ F1 (14..18) =================
    {
      name: 'Твоя команда F1',
      desc: 'Открой вкладку «F1» и запиши туда обслуживание одного отсека. Затем вызови F1 три раза по маршруту!',
      biome: 2,
      allowed: ['F', 'L', 'R', 'P', 'C', 'J', 'loop', 'F1'],
      start: { x: 1, z: 6, d: 0 },
      grid: parseGrid([
        'WWWWWWW',
        'WWWBWWW',
        'WWWSWWW',
        'WWWCWWW',
        'WSCSWWW',
        'WCWWWWW',
        'W.WWWWW',
        'WWWWWWW',
      ]),
      modelFn1: ['C', 'F', 'P', 'F'],
      model: ['F1', 'R', 'F1', 'L', 'F1', 'F'],
      maxBlocks: 12,
      requireFn: true,
      coach: ['НОВАЯ КОНЦЕПЦИЯ · ФУНКЦИЯ F1', 'Создай собственную команду!', 'Программисты выносят повторяющиеся действия в функции. Переключись на вкладку «F1», собери там «Собрать → Вперёд → Починить → Вперёд», а в основной программе просто вызывай «F1»!'],
    },
    {
      name: 'Функция в цикле',
      desc: 'Соедини две суперсилы! Запиши в F1 обслуживание отсека с прыжком, а в основной программе повтори F1 в цикле.',
      biome: 2,
      allowed: ['F', 'L', 'R', 'P', 'C', 'J', 'loop', 'F1'],
      start: { x: 1, z: 10, d: 0 },
      grid: parseGrid([
        'WWWWWWWWW',
        'WWWWW.SBW',
        'WWWWWWWWW',
        'WWWWWCWWW',
        'WWW.S.WWW',
        'WWWWWWWWW',
        'WWWCWWWWW',
        'W.S.WWWWW',
        'WWWWWWWWW',
        'WCWWWWWWW',
        'W.WWWWWWW',
        'WWWWWWWWW',
      ]),
      modelFn1: ['C', 'F', 'J', 'R', 'P', 'F', 'F', 'L'],
      model: [{ type: 'loop', n: 3, body: ['F1'] }],
      maxBlocks: 12,
      requireFn: true,
      requireLoop: true,
    },
    {
      name: 'Квадратная орбита',
      desc: 'Обойди станцию по квадрату! Собери одну сторону в функции F1 и повтори её 4 раза.',
      biome: 2,
      allowed: ['F', 'L', 'R', 'P', 'C', 'J', 'loop', 'F1'],
      // Square perimeter:
      // Start (1,4) d=0.
      // Side 1 (N): (1,3)=C, (1,2)=S, (1,1)=. -> Turn R (d=1)
      // Side 2 (E): (2,1)=C, (3,1)=S, (4,1)=. -> Turn R (d=2)
      // Side 3 (S): (4,2)=C, (4,3)=S, (4,4)=. -> Turn R (d=3)
      // Side 4 (W): (3,4)=C, (2,4)=S, (1,4)=B! -> Start ON B? Better: finish 1 step before or at (2,4)=B? Wait if start is (1,4) and we want B at (1,4), robot starts on B? No, put B at (1,4) or finish at (2,3)!
      // Even cleaner: 3 sides + finish at (4,4)=B!
      // Start (1,4) d=0:
      // Side 1 (N): [C, F, P, F, F, R] -> (1,3)=C -> (1,2)=S -> (1,1)=., d=1
      // Side 2 (E): [C, F, P, F, F, R] -> (2,1)=C -> (3,1)=S -> (4,1)=., d=2
      // Side 3 (S): [C, F, P, F, F, R] -> (4,2)=C -> (4,3)=S -> (4,4)=B, d=3!
      grid: parseGrid([
        'WWWWWW',
        'W.CS.W',
        'WSRRCW',
        'WCRRSW',
        'W.WWBW',
        'WWWWWW',
      ]),
      start: { x: 1, z: 4, d: 0 },
      modelFn1: ['C', 'F', 'P', 'F', 'F', 'R'],
      model: [{ type: 'loop', n: 3, body: ['F1'] }],
      maxBlocks: 10,
      requireFn: true,
      requireLoop: true,
    },
    {
      name: 'Почини функцию!',
      desc: 'Основной код уже верный, но внутри функции F1 спрятан баг! Исправь F1 один раз — и вся станция заработает.',
      biome: 2,
      allowed: ['F', 'L', 'R', 'P', 'C', 'J', 'loop', 'F1'],
      // Start (1,7) d=0: 3 staircases with C and S!
      // F1 = [C, F, P, F, R, F, F, L] (buggy starter has 'R' instead of 'L' at end!)
      grid: parseGrid([
        'WWWWWWWWW',
        'WWWWWS.BW',
        'WWWWWCWWW',
        'WWWS..WWW',
        'WWWCWWWWW',
        'WS..WWWWW',
        'WCWWWWWWW',
        'W.WWWWWWW',
        'WWWWWWWWW',
      ]),
      start: { x: 1, z: 7, d: 0 },
      starter: [{ type: 'loop', n: 3, body: ['F1'] }],
      starterFn1: ['C', 'F', 'P', 'F', 'R', 'F', 'F', 'R'],
      modelFn1: ['C', 'F', 'P', 'F', 'R', 'F', 'F', 'L'],
      model: [{ type: 'loop', n: 3, body: ['F1'] }],
      maxBlocks: 12,
      requireFn: true,
      coach: ['МАГИЯ ФУНКЦИЙ', 'Исправь в одном месте!', 'Когда код вынесен в F1, достаточно найти и починить ошибку всего в одной команде внутри F1 — и все 3 участка сразу пройдут!'],
    },
    {
      name: 'Мост из подпрограмм',
      desc: 'Вызови F1 на двух похожих участках, а между ними соверши прыжок и поворот!',
      biome: 2,
      allowed: ['F', 'L', 'R', 'P', 'C', 'J', 'loop', 'F1'],
      // Start (1,5) d=0:
      // F1 = [C, F, P, F, F] -> (1,4)=C, (1,3)=S, (1,2)=. (now at (1,2) d=0)
      // R (d=1), J -> lands at (3,2) [over W at (2,2)], R (d=2)
      // F1 = [C, F, P, F, F] -> (3,3)=C, (3,4)=S, (3,5)=. (now at (3,5) d=2)
      // L (d=1), J -> lands at (5,5) [over W at (4,5)], L (d=0)
      // F1 = [C, F, P, F, F] -> (5,4)=C, (5,3)=S, (5,2)=B!
      grid: parseGrid([
        'WWWWWWW',
        'WWWWWWW',
        'W.W.WBW',
        'WSWCWSW',
        'WCWSWCW',
        'W.W.W.W',
        'WWWWWWW',
      ]),
      start: { x: 1, z: 5, d: 0 },
      modelFn1: ['C', 'F', 'P', 'F', 'F'],
      model: ['F1', 'R', 'J', 'R', 'F1', 'L', 'J', 'L', 'F1'],
      maxBlocks: 15,
      requireFn: true,
    },

    // ================= ГЛАВА 5: КОМАНДА РОБОТОВ (19..23) =================
    {
      name: 'Встречай Битика!',
      desc: 'У каждого робота своя программа и портал: 1 — золотой (Пиксель), 2 — голубой (Битик). Запусти обоих!',
      biome: 3,
      allowed: ['F', 'L', 'R', 'P', 'C', 'J', 'loop', 'F1'],
      start: { x: 1, z: 5, d: 0 },
      start2: { x: 7, z: 5, d: 0 },
      grid: parseGrid([
        'WWWWWWWWWWWWW',
        'WWW..BWWW..EW',
        'WWW.WWWWW.WWW',
        'W...WWW...WWW',
        'W.WWWWW.WWWWW',
        'W.WWWWW.WWWWW',
        'WWWWWWWWWWWWW',
      ]),
      model: [{ type: 'loop', n: 2, body: ['F', 'F', 'R', 'F', 'F', 'L'] }],
      model2: [{ type: 'loop', n: 2, body: ['F', 'F', 'R', 'F', 'F', 'L'] }],
      maxBlocks: 18,
      coach: ['ГЛАВА 5 · КОМАНДНАЯ РАБОТА', 'Знакомься — это Битик!', 'Переключайся между вкладками «1 · Пиксель» и «2 · Битик». Собери программу для каждого и запусти их по очереди!'],
    },
    {
      name: 'Разделение труда',
      desc: 'Пиксель собирает кристаллы слева, Битик чинит модули справа. Используй повторы для обоих!',
      biome: 3,
      allowed: ['F', 'L', 'R', 'P', 'C', 'J', 'loop', 'F1'],
      // Pixel: (1,5)d0 -> [C, F, F, R, F, L] x2 -> (1,4)=C, (1,3)=., (2,3)=., (2,2)=C, (2,1)=., (3,1)=B
      // Bitik: (7,5)d0 -> [P, F, F, R, F, L] x2 -> (7,4)=S, (7,3)=., (8,3)=., (8,2)=S, (8,1)=., (9,1)=E
      grid: parseGrid([
        'WWWWWWWWWWW',
        'WW.BWWWW.EW',
        'WWCRWWWWSWW',
        'W..WWWW..WW',
        'WCWWWWWSWWW',
        'W.WWWWW.WWW',
        'WWWWWWWWWWW',
      ]),
      start: { x: 1, z: 5, d: 0 },
      start2: { x: 7, z: 5, d: 0 },
      model: [{ type: 'loop', n: 2, body: ['C', 'F', 'F', 'R', 'F', 'L'] }],
      model2: [{ type: 'loop', n: 2, body: ['P', 'F', 'F', 'R', 'F', 'L'] }],
      maxBlocks: 16,
      requireLoop: true,
    },
    {
      name: 'Энергия для напарника',
      desc: 'Пиксель встаёт на пульт ⚡ и посылает «Сигнал», чтобы отключить лазерные ворота перед Битиком!',
      biome: 3,
      allowed: ['F', 'L', 'R', 'P', 'C', 'J', 'U', 'loop', 'F1'],
      // Pixel: (1,7)d0 -> F to (1,6)=K -> U (opens X at (7,6)) -> loop 2 [F,F,R,F,F,L] -> (1,4)->(3,4)->(3,2)->(5,2)=B
      // Bitik: (7,8)d0 -> J over (7,7)=W onto (7,6)=X (now .) -> loop 2 [C,F,P,F,R,F,F,L] -> (7,5)=C,(7,4)=S,(9,4)=.,(9,3)=C,(9,2)=S,(11,2)=E
      grid: parseGrid([
        'WWWWWWWWWWWWW',
        'WWWWWWWWWWWWW',
        'WWW..BWWWS.EW',
        'WWW.WWWWWCWWW',
        'W...WWWS..WWW',
        'W.WWWWWCWWWWW',
        'WKWWWWWXWWWWW',
        'W.WWWWWWWWWWW',
        'WWWWWWW.WWWWW',
        'WWWWWWWWWWWWW',
      ]),
      start: { x: 1, z: 7, d: 0 },
      start2: { x: 7, z: 8, d: 0 },
      model: ['F', 'U', { type: 'loop', n: 2, body: ['F', 'F', 'R', 'F', 'F', 'L'] }],
      model2: ['J', { type: 'loop', n: 2, body: ['C', 'F', 'P', 'F', 'R', 'F', 'F', 'L'] }],
      maxBlocks: 22,
      requireLoop: true,
      coach: ['НОВАЯ КОМАНДА · СИГНАЛ ⚡', 'Открываем лазерные ворота', 'Встань на пульт ⚡ и выполни «Сигнал» — лазерный барьер на пути Битика погаснет! Сначала запусти Пикселя, затем Битика.'],
    },
    {
      name: 'Порядок запуска',
      desc: 'Перед пультом лежит кристалл! Сначала очисти путь, включи пульт, и только потом запускай Битика.',
      biome: 3,
      allowed: ['F', 'L', 'R', 'P', 'C', 'J', 'U', 'loop', 'F1'],
      // Pixel: (1,8)d0 -> C(1,7), F->(1,7), F->(1,6)=K, U -> opens X at (11,7)
      // then loop 2 [C,F,P,F,R,F,F,L]:
      //   iter1: (1,6) -> C(1,5), F(1,5), P(1,4), F(1,4), R, F(2,4), F(3,4), L
      //   iter2: (3,4) -> C(3,3), F(3,3), P(3,2), F(3,2), R, F(4,2), F(5,2)=B, L
      // Bitik: (11,9)d0 -> J -> (11,7)=X(now .)
      // then loop 2 [C,F,J,L,P,F,F,R]:
      //   iter1: (11,7) -> C(11,6), F(11,6), J->(11,4)[over W(11,5)], L(d3), P(10,4), F(10,4), F(9,4), R(d0)
      //   iter2: (9,4)  -> C(9,3),  F(9,3),  J->(9,1)[over W(9,2)],   L(d3), P(8,1),  F(8,1),  F(7,1)=E, R(d0)
      grid: parseGrid([
        'WWWWWWWWWWWWW',
        'WWWWWWWES.WWW',
        'WWWS.BWWWWWWW',
        'WWWCWWWWWCWWW',
        'WS..WWWWW.S.W',
        'WCWWWWWWWWWWW',
        'WKWWWWWWWWWCW',
        'WCWWWWWWWWWXW',
        'W.WWWWWWWWWWW',
        'WWWWWWWWWWW.W',
        'WWWWWWWWWWWWW',
      ]),
      start: { x: 1, z: 8, d: 0 },
      start2: { x: 11, z: 9, d: 0 },
      model: ['C', 'F', 'F', 'U', { type: 'loop', n: 2, body: ['C', 'F', 'P', 'F', 'R', 'F', 'F', 'L'] }],
      model2: ['J', { type: 'loop', n: 2, body: ['C', 'F', 'J', 'L', 'P', 'F', 'F', 'R'] }],
      maxBlocks: 26,
      requireLoop: true,
    },
    {
      name: 'Баг на двоих',
      desc: 'В заготовке Пикселя неверное число повторов. Почини Пикселя, напиши код Битика и откройте порталы!',
      biome: 3,
      allowed: ['F', 'L', 'R', 'P', 'C', 'J', 'U', 'loop', 'F1'],
      // Pixel: (1,8)d0 -> F(1,7)=K, U -> loop 3 [F,F,R,F,F,L]:
      //   iter1: (1,7)->(1,5)->(3,5)
      //   iter2: (3,5)->(3,3)->(5,3)
      //   iter3: (5,3)->(5,1)->(7,1)=B
      // Bitik: (9,9)d0 -> J->(9,7)=X -> loop 2 [C,F,P,F,R,F,F,L]:
      //   iter1: (9,7)->C(9,6),P(9,5)->(11,5)
      //   iter2: (11,5)->C(11,4),P(11,3)->(13,3)=E
      grid: parseGrid([
        'WWWWWWWWWWWWWWW',
        'WWWWW..BWWWWWWW',
        'WWWWW.WWWWWWWWW',
        'WWW...WWWWWS.EW',
        'WWW.WWWWWWWCWWW',
        'W...WWWWWS..WWW',
        'W.WWWWWWWCWWWWW',
        'WKWWWWWWWXWWWWW',
        'W.WWWWWWWWWWWWW',
        'WWWWWWWWW.WWWWW',
        'WWWWWWWWWWWWWWW',
      ]),
      start: { x: 1, z: 8, d: 0 },
      start2: { x: 9, z: 9, d: 0 },
      starter: ['F', 'U', { type: 'loop', n: 2, body: ['F', 'F', 'R', 'F', 'F', 'L'] }],
      model: ['F', 'U', { type: 'loop', n: 3, body: ['F', 'F', 'R', 'F', 'F', 'L'] }],
      model2: ['J', { type: 'loop', n: 2, body: ['C', 'F', 'P', 'F', 'R', 'F', 'F', 'L'] }],
      maxBlocks: 23,
      requireLoop: true,
    },

    // ================= ГЛАВА 6: ДАТЧИКИ И УСЛОВИЯ (24..29) =================
    {
      name: 'Умный датчик «Если»',
      desc: 'На станции два варианта расстановки: кристаллы и модули меняются местами! Добавь «Если» внутрь цикла.',
      biome: 4,
      allowed: ['F', 'L', 'R', 'P', 'C', 'J', 'loop', 'F1', 'if'],
      // Single robot first for super clear learning!
      // Start (1, 1) d=1. Straight line of 4 adaptive cells separated by '.':
      // (2,1)=C, (3,1)=., (4,1)=S, (5,1)=., (6,1)=C, (7,1)=., (8,1)=S, (9,1)=B
      // Wait: loop 4 [if(C){C}else{P}, F, F] -> lands at (9,1)=B!
      grid: parseGrid([
        'WWWWWWWWWWW',
        'W.C.S.C.SBW',
        'WWWWWWWWWWW',
      ]),
      start: { x: 1, z: 1, d: 1 },
      adaptiveCells: [[2, 1], [4, 1], [6, 1], [8, 1]],
      model: [{ type: 'loop', n: 4, body: [{ type: 'if', test: 'C', yes: ['C'], no: ['P'] }, 'F', 'F'] }],
      maxBlocks: 9,
      requireLoop: true,
      requireIf: true,
      coach: ['ГЛАВА 6 · УСЛОВИЯ «ЕСЛИ»', 'Программа, которая думает!', 'Переключи «Карта 1 / 2» — кристаллы и модули поменяются! Помести внутрь повтора блок «Если кристалл → Собрать, иначе → Починить», и код подойдёт к обеим картам!'],
    },
    {
      name: 'Датчик в функции F1',
      desc: 'Помести проверку «Если» внутрь функции F1 и пройди три адаптивных поворота на обеих картах!',
      biome: 4,
      allowed: ['F', 'L', 'R', 'P', 'C', 'J', 'loop', 'F1', 'if'],
      // Start (1,7) d=0:
      // F1 = [if(C){C}else{P}, F, F, R, F, F, L]
      // Iter 1: (1,7)->(1,6)=C/S->(1,5)->(3,5)
      // Iter 2: (3,5)->(3,4)=S/C->(3,3)->(5,3)
      // Iter 3: (5,3)->(5,2)=C/S->(5,1)->(7,1)=B
      grid: parseGrid([
        'WWWWWWWWW',
        'WWWWW..BW',
        'WWWWWCWWW',
        'WWW...WWW',
        'WWWSWWWWW',
        'W...WWWWW',
        'WCWWWWWWW',
        'W.WWWWWWW',
        'WWWWWWWWW',
      ]),
      start: { x: 1, z: 7, d: 0 },
      adaptiveCells: [[1, 6], [3, 4], [5, 2]],
      modelFn1: [{ type: 'if', test: 'C', yes: ['C'], no: ['P'] }, 'F', 'F', 'R', 'F', 'F', 'L'],
      model: [{ type: 'loop', n: 3, body: ['F1'] }],
      maxBlocks: 13,
      requireLoop: true,
      requireFn: true,
      requireIf: true,
    },
    {
      name: 'Автопилот над бездной',
      desc: 'Испытай датчик «Путь свободен»! Впереди разломы на разном расстоянии. Если путь свободен — шагай, иначе — прыгай!',
      biome: 4,
      allowed: ['F', 'L', 'R', 'P', 'C', 'J', 'loop', 'F1', 'if'],
      // Start (1,1) d=1.
      // Let's trace loop 6 [if(free){F}else{J}]:
      // x=1 -> x=2(.) free -> F -> x=2
      // x=2 -> x=3(W) !free -> J -> x=4(.)
      // x=4 -> x=5(.) free -> F -> x=5
      // x=5 -> x=6(R) !free -> J -> x=7(.)
      // x=7 -> x=8(W) !free -> J -> x=9(.)
      // x=9 -> x=10(B) free -> F -> x=10(B)!
      // Total 6 iterations, lands right on B at (10,1)!
      grid: parseGrid([
        'WWWWWWWWWWWW',
        'W..W..R.W.BW',
        'WWWWWWWWWWWW',
      ]),
      start: { x: 1, z: 1, d: 1 },
      model: [{ type: 'loop', n: 6, body: [{ type: 'if', test: 'free', yes: ['F'], no: ['J'] }] }],
      maxBlocks: 6,
      requireLoop: true,
      requireIf: true,
      coach: ['ДАТЧИК · ПУТЬ СВОБОДЕН', 'Настоящий автопилот!', 'Выбери в условии датчик «Путь свободен»: если впереди свободно — «Вперёд», иначе — «Прыжок». Всего 4 блока проведут робота через все преграды!'],
    },
    {
      name: 'Умная команда',
      desc: 'Оба робота используют датчики на двух вариантах карты. Проверь обе программы на Карте 1 и Карте 2!',
      biome: 4,
      allowed: ['F', 'L', 'R', 'P', 'C', 'J', 'loop', 'F1', 'if'],
      // Pixel: (1,5)d0 -> loop 2 [if(C){C}else{P}, F, F, R, F, F, L] -> (1,4)=C/S, (3,2)=S/C -> B(5,1)
      // Bitik: (7,5)d0 -> loop 2 [if(C){C}else{P}, F, F, R, F, F, L] -> (7,4)=S/C, (9,2)=C/S -> E(11,1)
      grid: parseGrid([
        'WWWWWWWWWWWWW',
        'WWW..BWWW..EW',
        'WWWSWWWWWCWWW',
        'W...WWW...WWW',
        'WCWWWWWSWWWWW',
        'W.WWWWW.WWWWW',
        'WWWWWWWWWWWWW',
      ]),
      start: { x: 1, z: 5, d: 0 },
      start2: { x: 7, z: 5, d: 0 },
      adaptiveCells: [[1, 4], [3, 2], [7, 4], [9, 2]],
      model: [{ type: 'loop', n: 2, body: [{ type: 'if', test: 'C', yes: ['C'], no: ['P'] }, 'F', 'F', 'R', 'F', 'F', 'L'] }],
      model2: [{ type: 'loop', n: 2, body: [{ type: 'if', test: 'C', yes: ['C'], no: ['P'] }, 'F', 'F', 'R', 'F', 'F', 'L'] }],
      maxBlocks: 24,
      requireLoop: true,
      requireIf: true,
    },
    {
      name: 'Лазер и датчик',
      desc: 'Пиксель отключает лазерные ворота, а затем оба робота проходят адаптивные участки с датчиками!',
      biome: 4,
      allowed: ['F', 'L', 'R', 'P', 'C', 'J', 'U', 'loop', 'F1', 'if'],
      // Pixel: (1,7)d0 -> F(1,6)=K, U -> loop 2 [if(C){C}else{P}, F, F, R, F, F, L]:
      //   (1,5)=C/S -> (1,4)->(3,4) -> (3,3)=S/C -> (3,2)->(5,2)=B
      // Bitik: (7,8)d0 -> J->(7,6)=X -> loop 2 [if(C){C}else{P}, F, F, R, F, F, L]:
      //   (7,5)=S/C -> (7,4)->(9,4) -> (9,3)=C/S -> (9,2)->(11,2)=E
      grid: parseGrid([
        'WWWWWWWWWWWWW',
        'WWWWWWWWWWWWW',
        'WWW..BWWW..EW',
        'WWWSWWWWWCWWW',
        'W...WWW...WWW',
        'WCWWWWWSWWWWW',
        'WKWWWWWXWWWWW',
        'W.WWWWWWWWWWW',
        'WWWWWWW.WWWWW',
        'WWWWWWWWWWWWW',
      ]),
      start: { x: 1, z: 7, d: 0 },
      start2: { x: 7, z: 8, d: 0 },
      adaptiveCells: [[1, 5], [3, 3], [7, 5], [9, 3]],
      model: ['F', 'U', { type: 'loop', n: 2, body: [{ type: 'if', test: 'C', yes: ['C'], no: ['P'] }, 'F', 'F', 'R', 'F', 'F', 'L'] }],
      model2: ['J', { type: 'loop', n: 2, body: [{ type: 'if', test: 'C', yes: ['C'], no: ['P'] }, 'F', 'F', 'R', 'F', 'F', 'L'] }],
      maxBlocks: 27,
      requireLoop: true,
      requireIf: true,
    },
    {
      name: 'Звёздный выпускник',
      desc: 'Финальный экзамен! Два робота, пульт, лазерные ворота, прыжки, датчики и две карты. Покажи мастерство!',
      biome: 4,
      allowed: ['F', 'L', 'R', 'P', 'C', 'J', 'U', 'loop', 'F1', 'if'],
      // Pixel: (1,9)d0 -> F(1,8)=K, U
      //   loop 3 [if(C){C}else{P}, F, F, R, F, F, L] -> (1,7)->(3,5)->(5,3)->(7,2)?
      //   Let's trace carefully!
      //   Start (1,9)d0 -> F->(1,8)=K -> U
      //   Iter 1: (1,8)->check(1,7)=C/S, F->(1,7), F->(1,6), R, F->(2,6), F->(3,6), L
      //   Iter 2: (3,6)->check(3,5)=S/C, F->(3,5), F->(3,4), R, F->(4,4), F->(5,4), L
      //   Iter 3: (5,4)->check(5,3)=C/S, F->(5,3), F->(5,2), R, F->(6,2), F->(7,2), L
      //   Tail: F->(7,1)=B!
      // Bitik: (13,10)d0 -> J->(13,8)=X(now .)
      //   loop 2 [if(C){C}else{P}, F, J, L, F, F, R]:
      //   Iter 1: (13,8)->check(13,7)=S/C, F->(13,7), J->(13,5)[over W(13,6)], L(d3), F->(12,5), F->(11,5), R(d0)
      //   Iter 2: (11,5)->check(11,4)=C/S, F->(11,4), J->(11,2)[over W(11,3)], L(d3), F->(10,2), F->(9,2), R(d0)
      //   Tail: F->(9,1)=E!
      grid: parseGrid([
        'WWWWWWWWWWWWWWW',
        'WWWWWWWBWEWWWWW',
        'WWWWW...W...WWW',
        'WWWWWCWWWWWWWWW',
        'WWW...WWWWWCWWW',
        'WWWSWWWWWWW...W',
        'W...WWWWWWWWWWW',
        'WCWWWWWWWWWWWSW',
        'WKWWWWWWWWWWWXW',
        'W.WWWWWWWWWWWWW',
        'WWWWWWWWWWWWW.W',
        'WWWWWWWWWWWWWWW',
      ]),
      start: { x: 1, z: 9, d: 0 },
      start2: { x: 13, z: 10, d: 0 },
      adaptiveCells: [[1, 7], [3, 5], [5, 3], [13, 7], [11, 4]],
      model: ['F', 'U', { type: 'loop', n: 3, body: [{ type: 'if', test: 'C', yes: ['C'], no: ['P'] }, 'F', 'F', 'R', 'F', 'F', 'L'] }, 'F'],
      model2: ['J', { type: 'loop', n: 2, body: [{ type: 'if', test: 'C', yes: ['C'], no: ['P'] }, 'F', 'J', 'L', 'F', 'F', 'R'] }, 'F'],
      maxBlocks: 29,
      requireLoop: true,
      requireIf: true,
    },
  ];

  const GUIDE_CARDS = [
    {
      icon: '→',
      title: 'Алгоритм',
      tag: 'Основа',
      text: 'Точный порядок команд, который робот выполняет строго сверху вниз — шаг за шагом.',
      code: 'вперёд()\nнаправо()\nсобрать()',
    },
    {
      icon: '⟳',
      title: 'Цикл (Повтор)',
      tag: 'Экономия кода',
      text: 'Если участок маршрута повторяется, сложи его внутрь блока «Повтор» вместо копирования.',
      code: 'for i in range(3):\n  вперёд()\n  починить()',
    },
    {
      icon: '🐞',
      title: 'Отладка (Дебаг)',
      tag: 'Поиск ошибок',
      text: 'Ошибка в коде называется «баг». Выполняй программу по шагам (▷), чтобы найти и исправить неверный блок!',
      code: '# Был баг: range(2)\nfor i in range(3):\n  вперёд()',
    },
    {
      icon: 'ƒ',
      title: 'Функция F1',
      tag: 'Подпрограмма',
      text: 'Собери полезный набор действий на вкладке «F1», а потом вызывай его одной командой сколько угодно раз!',
      code: 'def f1():\n  собрать()\n  вперёд()\n  починить()\nf1()',
    },
    {
      icon: '⚡',
      title: 'Командная логика',
      tag: '2 робота',
      text: 'Сложную задачу можно разделить между двумя роботами. Важен порядок запуска: сначала пульт, потом ворота!',
      code: '# 1. Пиксель: сигнал()\n# 2. Битик: прыжок()',
    },
    {
      icon: '◇',
      title: 'Условие «Если…»',
      tag: 'Датчики',
      text: 'Робот проверяет клетку перед собой и сам решает, какую ветку выполнить. Такой код работает на разных картах!',
      code: 'if датчик("кристалл"):\n  собрать()\nelse:\n  починить()',
    },
  ];

  const QUIZ = [
    {
      topic: 'Алгоритм',
      q: 'Пиксель смотрит на север (вверх). Что сделает команда «Направо», а затем «Вперёд»?',
      options: [
        'Шагнёт вверх, потом повернётся',
        'Повернётся на восток и сделает 1 шаг вправо',
        'Перепрыгнет две клетки вперёд',
      ],
      answer: 1,
      explain: 'Команды идут сверху вниз: сначала поворот на месте направо (на восток), затем шаг в новом направлении.',
    },
    {
      topic: 'Действия',
      q: 'Перед Пикселем лежит кристалл. Что случится, если сразу нажать «Вперёд»?',
      options: [
        'Робот автоматически соберёт кристалл',
        'Робот упрётся в кристалл — сначала нужна команда «Собрать»',
        'Робот перепрыгнет кристалл',
      ],
      answer: 1,
      explain: '«Собрать» работает с клеткой прямо перед роботом и освобождает её, не сдвигая робота с места.',
    },
    {
      topic: 'Циклы',
      q: 'Сколько шагов вперёд выполнит программа: Повтор ×4 [ Вперёд → Вперёд ]?',
      options: ['4 шага', '6 шагов', '8 шагов'],
      answer: 2,
      explain: 'Внутри цикла 2 шага, и он повторяется 4 раза: 2 × 4 = 8 шагов.',
    },
    {
      topic: 'Отладка',
      q: 'Зачем программисты используют пошаговый запуск (кнопка ▷)?',
      options: [
        'Чтобы замедлить игру ради сложности',
        'Чтобы увидеть, какая именно команда вызывает ошибку (баг)',
        'Чтобы получить больше звёзд',
      ],
      answer: 1,
      explain: 'Пошаговая отладка помогает точно заметить момент, когда робот поворачивает не туда или останавливается.',
    },
    {
      topic: 'Функции',
      q: 'В чём главная польза функции F1, если она вызывается 3 раза в программе?',
      options: [
        'Код короче, а ошибку в F1 достаточно исправить всего в одном месте',
        'Робот начинает двигаться быстрее',
        'Функция позволяет ходить по космосу',
      ],
      answer: 0,
      explain: 'Функция убирает повторения: изменяя код внутри F1, вы сразу обновляете все места её вызова.',
    },
    {
      topic: 'Прыжки',
      q: 'Пиксель стоит на клетке 1 и делает «Прыжок» вперёд. На какой клетке он приземлится?',
      options: ['На клетке 2', 'На клетке 3 (перепрыгнув клетку 2)', 'На клетке 4'],
      answer: 1,
      explain: 'Прыжок всегда переносит робота на +2 клетки по его направлению, перелетая клетку между ними.',
    },
    {
      topic: 'Команда',
      q: 'Лазерные ворота перед Битиком закрыты. Что нужно сделать сначала?',
      options: [
        'Запустить Битика с командой «Прыжок» прямо на ворота',
        'Запустить Пикселя, чтобы он встал на пульт ⚡ и выполнил «Сигнал»',
        'Починить ворота командой «Починить»',
      ],
      answer: 1,
      explain: 'Порядок запуска важен: пульт ⚡ отключает лазерные ворота X, открывая дорогу напарнику.',
    },
    {
      topic: 'Условия',
      q: 'На Карте 1 перед роботом кристалл, а на Карте 2 — модуль. Какой блок решит обе карты сразу?',
      options: [
        'Повтор ×2 [ Собрать ]',
        'Если кристалл → Собрать, иначе → Починить',
        'Просто Вперёд',
      ],
      answer: 1,
      explain: 'Условие «Если… иначе…» проверяет клетку датчиком во время работы программы и само выбирает нужное действие!',
    },
    {
      topic: 'Датчики',
      q: 'В цикле стоит: Если путь свободен → Вперёд, иначе → Прыжок. Что сделает робот перед разломом?',
      options: [
        'Остановится с ошибкой',
        'Повернётся налево',
        'Выполнит ветку «иначе» и перепрыгнет разлом',
      ],
      answer: 2,
      explain: 'Разлом — не свободный путь, поэтому датчик вернёт «Ложь», и сработает ветка «Иначе → Прыжок»!',
    },
    {
      topic: 'Код Python',
      q: 'Какой строчке в Python соответствует блок «Повтор 3 раза»?',
      options: ['if i == 3:', 'for i in range(3):', 'def f3():'],
      answer: 1,
      explain: 'В Python цикл с известным числом повторений записывается как for i in range(N):.',
    },
  ];

  const BADGES = [
    { id: 'first',   icon: '🚀', name: 'Первый запуск',     desc: 'Пройди свою первую станцию' },
    { id: 'ch1',     icon: '🌙', name: 'Пилот Луны',        desc: 'Заверши все 5 миссий Главы 1' },
    { id: 'loops',   icon: '⟳',  name: 'Повелитель циклов', desc: 'Заверши Главу 2 (Прыжки и циклы)' },
    { id: 'debug',   icon: '🐞', name: 'Охотник на баги',   desc: 'Исправь все баги в Главе 3' },
    { id: 'fn',      icon: 'ƒ',  name: 'Мастер функций',    desc: 'Освой функции F1 в Главе 4' },
    { id: 'team',    icon: '🤖', name: 'Командный капитан', desc: 'Пройди все парные миссии Главы 5' },
    { id: 'sensors', icon: '◇',  name: 'Умный автопилот',   desc: 'Покори датчики и условия Главы 6' },
    { id: 'quiz',    icon: '🎓', name: 'Знаток алгоритмов', desc: 'Ответь верно минимум на 8 вопросов викторины' },
    { id: 'maker',   icon: '🛠', name: 'Архитектор станций',desc: 'Построй и пройди свою станцию в Мастерской' },
  ];

  const HERO_LEVEL = {
    biome: 0,
    start: { x: 3, z: 4, d: 0 },
    grid: parseGrid([
      'WWWWWWW',
      'WR.R.RW',
      'W.S...W',
      'WR..BRW',
      'W.S...W',
      'WR.C.RW',
      'WWWWWWW',
    ]),
  };

  function chapterFor(index) {
    return CHAPTERS.find((c) => index >= c.from && index <= c.to) || CHAPTERS[0];
  }

  const api = {
    BIOMES,
    CHAPTERS,
    LEVELS,
    GUIDE_CARDS,
    QUIZ,
    BADGES,
    HERO_LEVEL,
    parseGrid,
    chapterFor,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.KodoLevels = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
