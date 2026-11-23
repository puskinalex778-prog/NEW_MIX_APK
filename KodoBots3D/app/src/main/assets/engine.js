(function (root) {
  'use strict';

  const DIR = [
    [0, -1], // 0: North (-z)
    [1, 0],  // 1: East (+x)
    [0, 1],  // 2: South (+z)
    [-1, 0], // 3: West (-x)
  ];

  const ROBOT_NAMES = ['Пиксель', 'Битик'];

  const CMD = {
    F:    { code: 'F',    name: 'Вперёд',    short: 'Вперёд',   py: 'вперёд()',    color: '#38bdf8', detail: 'Шаг на 1 клетку вперёд по стрелке', key: '↑ / W' },
    L:    { code: 'L',    name: 'Налево',    short: 'Налево',   py: 'налево()',    color: '#818cf8', detail: 'Поворот на 90° налево на месте', key: '← / A' },
    R:    { code: 'R',    name: 'Направо',   short: 'Направо',  py: 'направо()',   color: '#818cf8', detail: 'Поворот на 90° направо на месте', key: '→ / D' },
    P:    { code: 'P',    name: 'Починить',  short: 'Починить', py: 'починить()',  color: '#34d399', detail: 'Активировать солнечный модуль перед роботом', key: 'P' },
    C:    { code: 'C',    name: 'Собрать',   short: 'Собрать',  py: 'собрать()',   color: '#f472b6', detail: 'Собрать энергокристалл перед роботом', key: 'C' },
    J:    { code: 'J',    name: 'Прыжок',    short: 'Прыжок',   py: 'прыжок()',    color: '#fbbf24', detail: 'Перепрыгнуть через 1 клетку на следующую', key: 'J' },
    U:    { code: 'U',    name: 'Сигнал',    short: 'Сигнал',   py: 'сигнал()',    color: '#fb923c', detail: 'Стоя на пульте ⚡, отключить лазерные ворота', key: 'E' },
    F1:   { code: 'F1',   name: 'Функция F1',short: 'F1()',     color: '#2dd4bf', detail: 'Выполнить сохранённую подпрограмму F1', key: 'F' },
    loop: { code: 'loop', name: 'Повтор',    short: 'Повтор',   py: 'for',         color: '#a78bfa', detail: 'Повторить группу команд несколько раз', key: 'X' },
    if:   { code: 'if',   name: 'Если…',     short: 'Если…',    py: 'if',          color: '#f59e0b', detail: 'Проверить датчиком клетку впереди и выбрать ветку', key: 'I' },
  };

  const SENSOR_LABELS = {
    C: 'кристалл',
    S: 'модуль',
    free: 'путь свободен',
  };

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function isWalkable(tile) {
    return tile === '.' || tile === 'V' || tile === 'B' || tile === 'E' || tile === 'K';
  }

  function countBlocks(list) {
    if (!Array.isArray(list)) return 0;
    return list.reduce((sum, node) => {
      if (typeof node === 'string') return sum + 1;
      if (node.type === 'loop') return sum + 1 + countBlocks(node.body);
      if (node.type === 'if') return sum + 1 + countBlocks(node.yes) + countBlocks(node.no);
      return sum;
    }, 0);
  }

  function hasBlockType(list, type) {
    if (!Array.isArray(list)) return false;
    return list.some((node) => {
      if (typeof node === 'string') return node === type;
      if (node.type === type) return true;
      if (node.type === 'loop') return hasBlockType(node.body, type);
      if (node.type === 'if') return hasBlockType(node.yes, type) || hasBlockType(node.no, type);
      return false;
    });
  }

  function formatBlock(node) {
    if (typeof node === 'string') return CMD[node] ? CMD[node].name : node;
    if (node.type === 'loop') {
      return `Повтор ×${node.n} [${node.body.map(formatBlock).join(' → ')}]`;
    }
    if (node.type === 'if') {
      const cond = SENSOR_LABELS[node.test] || node.test;
      const y = node.yes.map(formatBlock).join(' → ') || 'ничего';
      const n = node.no.map(formatBlock).join(' → ') || 'ничего';
      return `Если ${cond}: ${y}; иначе: ${n}`;
    }
    return '';
  }

  function toPseudocode(mainProg, fn1Prog, robotName) {
    const lines = [];
    function emit(list, indent, scope, rootRow) {
      list.forEach((node, idx) => {
        const row = rootRow !== null ? rootRow : idx;
        const pad = '  '.repeat(indent);
        if (typeof node === 'string') {
          const text = node === 'F1' ? 'f1()' : (CMD[node]?.py || node);
          lines.push({ text: `${pad}${text}`, scope, row });
        } else if (node.type === 'loop') {
          lines.push({ text: `${pad}for i in range(${node.n}):`, scope, row });
          if (!node.body.length) {
            lines.push({ text: `${pad}  pass`, scope, row });
          } else {
            emit(node.body, indent + 1, scope, row);
          }
        } else if (node.type === 'if') {
          const cond = SENSOR_LABELS[node.test] || node.test;
          lines.push({ text: `${pad}if датчик("${cond}"):`, scope, row });
          if (!node.yes.length) {
            lines.push({ text: `${pad}  pass`, scope, row });
          } else {
            emit(node.yes, indent + 1, scope, row);
          }
          if (node.no && node.no.length) {
            lines.push({ text: `${pad}else:`, scope, row });
            emit(node.no, indent + 1, scope, row);
          }
        }
      });
    }

    if (fn1Prog && fn1Prog.length) {
      lines.push({ text: 'def f1():', scope: 'fn1', row: -1 });
      emit(fn1Prog, 1, 'fn1', null);
      lines.push({ text: '', scope: 'sep', row: -1 });
    }
    lines.push({ text: `# Алгоритм: ${robotName || ROBOT_NAMES[0]}`, scope: 'main', row: -1 });
    if (!mainProg || !mainProg.length) {
      lines.push({ text: '# Добавь блоки команд ниже', scope: 'main', row: -1 });
    } else {
      emit(mainProg, 0, 'main', null);
    }
    return lines;
  }

  function expand(list, fn1, opts) {
    const o = opts || {};
    const scope = o.scope || 'main';
    const rootRow = o.rowOverride !== undefined ? o.rowOverride : null;
    const fnDepth = o.fnDepth || 0;
    const iterLabel = o.iterLabel || '';
    const out = [];

    (list || []).forEach((node, idx) => {
      const row = rootRow !== null ? rootRow : idx;
      if (typeof node === 'string') {
        if (node === 'F1') {
          if (fnDepth >= 2) return; // guard against recursion
          const body = fn1 || [];
          if (!body.length) {
            out.push({ code: 'EMPTY_F1', scope, row, iterLabel });
          } else {
            out.push(...expand(body, [], {
              scope: 'fn1',
              rowOverride: undefined,
              fnDepth: fnDepth + 1,
              iterLabel: iterLabel ? `${iterLabel} → F1` : 'F1',
              callerRow: row,
            }));
          }
        } else {
          out.push({
            code: node,
            scope,
            row,
            callerRow: o.callerRow !== undefined ? o.callerRow : null,
            iterLabel,
          });
        }
      } else if (node.type === 'loop') {
        for (let k = 0; k < node.n; k++) {
          const lbl = `Повтор ${k + 1}/${node.n}`;
          out.push(...expand(node.body, fn1, {
            scope,
            rowOverride: row,
            fnDepth,
            iterLabel: iterLabel ? `${iterLabel} · ${lbl}` : lbl,
            callerRow: o.callerRow,
          }));
        }
      } else if (node.type === 'if') {
        out.push({
          code: 'if',
          node,
          scope,
          row,
          fnDepth,
          callerRow: o.callerRow !== undefined ? o.callerRow : null,
          iterLabel,
        });
      }
    });
    return out;
  }

  function gridForVariant(level, variant) {
    const g = clone(level.grid);
    if (variant && level.adaptiveCells) {
      for (const [x, z] of level.adaptiveCells) {
        if (g[z] && g[z][x] === 'C') g[z][x] = 'S';
        else if (g[z] && g[z][x] === 'S') g[z][x] = 'C';
      }
    }
    return g;
  }

  function checkSensor(test, state) {
    const r = state.robot;
    const [dx, dz] = DIR[r.d];
    const nx = r.x + dx;
    const nz = r.z + dz;
    const tile = state.world[nz]?.[nx] || 'W';
    if (test === 'free') {
      const blockedByOther = (state.others || []).some((o) => o.x === nx && o.z === nz);
      return isWalkable(tile) && !blockedByOther;
    }
    return tile === test;
  }

  function transition(code, state) {
    if (code === 'EMPTY_F1') {
      return {
        ok: false,
        message: 'Функция F1 пуста! Переключись на вкладку «F1» и добавь в неё команды.',
      };
    }

    const { x, z, d } = state.robot;
    const [dx, dz] = DIR[d];
    const at = (xx, zz) => state.world[zz]?.[xx] || 'W';

    if (code === 'L' || code === 'R') {
      state.robot.d = (d + (code === 'R' ? 1 : 3)) % 4;
      return { ok: true, type: 'turn', x, z };
    }

    if (code === 'U') {
      if (at(x, z) !== 'K') {
        return {
          ok: false,
          x,
          z,
          message: 'Для команды «Сигнал» сначала встань на клетку с пультом ⚡.',
        };
      }
      const opened = [];
      for (let zz = 0; zz < state.world.length; zz++) {
        for (let xx = 0; xx < state.world[zz].length; xx++) {
          if (state.world[zz][xx] === 'X') {
            state.world[zz][xx] = '.';
            opened.push([xx, zz]);
          }
        }
      }
      return { ok: true, type: 'activate', x, z, opened };
    }

    const nx = x + dx;
    const nz = z + dz;

    if (code === 'P' || code === 'C') {
      const wanted = code === 'P' ? 'S' : 'C';
      if (at(nx, nz) !== wanted) {
        return {
          ok: false,
          x: nx,
          z: nz,
          message: code === 'P'
            ? 'Перед роботом нет повреждённого модуля. Подойди и повернись к нему лицом.'
            : 'Перед роботом нет энергокристалла. Команда «Собрать» работает с клеткой прямо впереди.',
        };
      }
      state.world[nz][nx] = code === 'P' ? 'V' : '.';
      return { ok: true, type: code === 'P' ? 'fix' : 'collect', x: nx, z: nz };
    }

    const tx = code === 'J' ? x + dx * 2 : nx;
    const tz = code === 'J' ? z + dz * 2 : nz;
    const target = at(tx, tz);

    if ((state.others || []).some((o) => o.x === tx && o.z === tz)) {
      return {
        ok: false,
        x: tx,
        z: tz,
        message: 'Эта клетка занята напарником! Измени маршрут или порядок запуска роботов.',
      };
    }

    if (!isWalkable(target)) {
      let message;
      if (target === 'W') {
        message = code === 'J'
          ? 'После прыжка робот улетит в космос! Нужна платформа через 2 клетки.'
          : 'Впереди открытый космос! Поверни или используй «Прыжок» через провал.';
      } else if (target === 'R') {
        message = 'Впереди метеоритная скала — её нужно обойти или перепрыгнуть.';
      } else if (target === 'S') {
        message = 'Впереди неактивный модуль. Сначала выполни «Починить», затем шагай вперёд.';
      } else if (target === 'C') {
        message = 'Впереди энергокристалл. Сначала забери его командой «Собрать».';
      } else if (target === 'X') {
        message = 'Лазерные ворота закрыты! Сначала Пиксель должен встать на пульт ⚡ и послать «Сигнал».';
      } else {
        message = 'Путь впереди заблокирован.';
      }
      return { ok: false, x: tx, z: tz, message };
    }

    state.robot.x = tx;
    state.robot.z = tz;
    return { ok: true, type: code === 'J' ? 'jump' : 'step', x: tx, z: tz };
  }

  function resolveHeadConditions(flat, pointer, fn1, state) {
    let checks = 0;
    let lastBranch = null;
    while (flat[pointer] && flat[pointer].node) {
      if (++checks > 200) {
        return { error: 'Слишком много вложенных проверок условия.' };
      }
      const item = flat[pointer];
      const ok = checkSensor(item.node.test, state);
      const branch = ok ? item.node.yes : item.node.no;
      lastBranch = { test: item.node.test, matched: ok };
      const expanded = expand(branch, fn1, {
        scope: item.scope,
        rowOverride: item.row,
        fnDepth: item.fnDepth,
        callerRow: item.callerRow,
        iterLabel: `${item.iterLabel ? item.iterLabel + ' · ' : ''}${ok ? '✓ Верно' : '✗ Иначе'}`,
      });
      flat.splice(pointer, 1, ...expanded);
    }
    return { ok: true, lastBranch };
  }

  function simulateMission(programs, fns, level, variant) {
    const world = gridForVariant(level, variant || 0);
    const robots = [clone(level.start)];
    if (level.start2) robots.push(clone(level.start2));
    const goals = ['B', 'E'];

    let totalActions = 0;
    for (let ri = 0; ri < robots.length; ri++) {
      const state = {
        world,
        robot: robots[ri],
        others: robots.filter((_, idx) => idx !== ri),
      };
      const fn1 = (fns && fns[ri]) || [];
      const ops = expand(programs[ri] || [], fn1);
      let ptr = 0;
      while (ptr < ops.length) {
        const resCond = resolveHeadConditions(ops, ptr, fn1, state);
        if (resCond.error) return { ok: false, message: resCond.error };
        if (ptr >= ops.length) break;
        if (++totalActions > 1200) {
          return { ok: false, message: 'Программа слишком длинная (более 1200 действий).' };
        }
        const item = ops[ptr];
        const res = transition(item.code, state);
        if (!res.ok) {
          return { ok: false, robot: ri, row: item.row, message: `${ROBOT_NAMES[ri]}: ${res.message}` };
        }
        ptr++;
      }
      const finalTile = world[robots[ri].z]?.[robots[ri].x];
      if (finalTile !== goals[ri]) {
        return {
          ok: false,
          robot: ri,
          message: `${ROBOT_NAMES[ri]} не добрался до своего портала.`,
        };
      }
    }

    const leftModules = world.flat().filter((t) => t === 'S').length;
    const leftCrystals = world.flat().filter((t) => t === 'C').length;
    if (leftModules > 0 || leftCrystals > 0) {
      return {
        ok: false,
        message: `Остались невыполненные задачи: модулей — ${leftModules}, кристаллов — ${leftCrystals}.`,
      };
    }

    return { ok: true, actions: totalActions };
  }

  function validateCurriculum(programs, fns, level) {
    const isTeam = !!level.start2;
    const activeProgs = isTeam ? [programs[0] || [], programs[1] || []] : [programs[0] || []];
    const activeFns = isTeam ? [fns[0] || [], fns[1] || []] : [fns[0] || []];

    const totalBlocks = activeProgs.reduce((s, p) => s + countBlocks(p), 0)
      + activeFns.reduce((s, f) => s + countBlocks(f), 0);

    if (level.maxBlocks && totalBlocks > level.maxBlocks) {
      return `Лимит миссии: ${level.maxBlocks} блоков (сейчас ${totalBlocks}). Используй повторы или функцию F1, чтобы сократить код.`;
    }

    if (level.requireLoop) {
      const ok = activeProgs.every((p, idx) => hasBlockType(p, 'loop') || hasBlockType(activeFns[idx], 'loop'));
      if (!ok) {
        return 'В этой миссии обязательно нужен блок «Повтор» — найди повторяющийся участок маршрута!';
      }
    }

    if (level.requireFn) {
      const hasFn = activeProgs.some((p, idx) => hasBlockType(p, 'F1') && activeFns[idx].length > 0);
      if (!hasFn) {
        return 'В этой миссии нужно создать подпрограмму на вкладке «F1» и вызвать блок «Функция F1» в алгоритме!';
      }
    }

    if (level.requireIf) {
      const ok = activeProgs.every((p, idx) => hasBlockType(p, 'if') || hasBlockType(activeFns[idx], 'if'));
      if (!ok) {
        return 'В этой миссии нужен блок «Если…» — датчики помогают программе работать на любом варианте карты!';
      }
    }

    if (level.adaptiveCells) {
      for (let v = 0; v < 2; v++) {
        const sim = simulateMission(activeProgs, activeFns, level, v);
        if (!sim.ok) {
          return `Вариант станции ${v + 1} не прошёл проверку: ${sim.message} Сделай алгоритм универсальным с помощью «Если…»!`;
        }
      }
    }

    return null;
  }

  const api = {
    DIR,
    ROBOT_NAMES,
    CMD,
    SENSOR_LABELS,
    clone,
    isWalkable,
    countBlocks,
    hasBlockType,
    formatBlock,
    toPseudocode,
    expand,
    gridForVariant,
    checkSensor,
    transition,
    resolveHeadConditions,
    simulateMission,
    validateCurriculum,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.KodoEngine = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
