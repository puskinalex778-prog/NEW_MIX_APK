import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const Engine = require('../app/src/main/assets/engine.js');
const { LEVELS } = require('../app/src/main/assets/levels.js');

let failed = 0;

function usedCommands(prog) {
  const set = new Set();
  function walk(list) {
    for (const node of list || []) {
      if (typeof node === 'string') set.add(node);
      else if (node.type === 'loop') {
        set.add('loop');
        walk(node.body);
      } else if (node.type === 'if') {
        set.add('if');
        walk(node.yes);
        walk(node.no);
      }
    }
  }
  walk(prog);
  return set;
}

console.log(`Verifying ${LEVELS.length} levels...\n`);

LEVELS.forEach((lvl, idx) => {
  const num = String(idx + 1).padStart(2, '0');
  const errors = [];

  const cols = lvl.grid[0]?.length || 0;
  if (!cols || lvl.grid.some((r) => r.length !== cols)) {
    errors.push('Grid is not rectangular');
  }

  const allowed = new Set(lvl.allowed || []);
  for (const p of [lvl.model, lvl.model2, lvl.model3, lvl.modelFn1, lvl.modelFn2, lvl.model2Fn1, lvl.model3Fn1]) {
    for (const c of usedCommands(p)) {
      if (!allowed.has(c)) errors.push(`Model uses disallowed command "${c}"`);
    }
  }

  const cnt = Engine.robotCount(lvl);
  const programs = [lvl.model, lvl.model2 || [], lvl.model3 || []].slice(0, cnt);
  const fn1s = [lvl.modelFn1 || [], lvl.model2Fn1 || [], lvl.model3Fn1 || []].slice(0, cnt);
  const fn2s = [lvl.modelFn2 || [], lvl.model2Fn2 || [], lvl.model3Fn2 || []].slice(0, cnt);

  const sim0 = Engine.simulateMission(programs, fn1s, fn2s, lvl, 0);
  if (!sim0.ok) errors.push(`Model fails variant 0: ${sim0.message}`);

  if (lvl.adaptiveCells) {
    const sim1 = Engine.simulateMission(programs, fn1s, fn2s, lvl, 1);
    if (!sim1.ok) errors.push(`Model fails variant 1: ${sim1.message}`);
  }

  const currErr = Engine.validateCurriculum(programs, fn1s, fn2s, lvl);
  if (currErr) errors.push(`Model fails curriculum: ${currErr}`);

  if (lvl.starter || lvl.starterFn1) {
    const sProgs = [lvl.starter || [], lvl.model2 || [], lvl.model3 || []].slice(0, cnt);
    const sFn1 = [lvl.starterFn1 || [], [], []].slice(0, cnt);
    const simStarter = Engine.simulateMission(sProgs, sFn1, [[], [], []], lvl, 0);
    if (simStarter.ok) errors.push('Starter buggy code unexpectedly PASSES!');
  }

  const blocks = programs.reduce((s, p) => s + Engine.countBlocks(p), 0)
    + fn1s.reduce((s, f) => s + Engine.countBlocks(f), 0)
    + fn2s.reduce((s, f) => s + Engine.countBlocks(f), 0);

  if (errors.length) {
    failed++;
    console.error(`❌ [${num}] ${lvl.name}`);
    errors.forEach((e) => console.error(`    - ${e}`));
  } else {
    const tags = [
      cnt > 1 ? `${cnt} bots` : null,
      lvl.grid.flat().includes('T') ? 'teleport' : null,
      lvl.adaptiveCells ? '2 variants' : null,
      lvl.starter ? 'bug OK' : null,
    ].filter(Boolean).join(', ');
    console.log(`✅ [${num}] ${lvl.name} (${blocks}/${lvl.maxBlocks} blocks, ${sim0.actions} acts${tags ? ' · ' + tags : ''})`);
  }
});

console.log(`\nSummary: ${LEVELS.length - failed}/${LEVELS.length} passed.`);
if (failed > 0) process.exit(1);
