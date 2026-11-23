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

  // 1. Check rectangular grid
  const cols = lvl.grid[0]?.length || 0;
  if (!cols || lvl.grid.some((r) => r.length !== cols)) {
    errors.push('Grid is not rectangular');
  }

  // 2. Check allowed commands cover model
  const allowed = new Set(lvl.allowed || []);
  for (const p of [lvl.model, lvl.model2, lvl.modelFn1, lvl.modelFn2]) {
    for (const c of usedCommands(p)) {
      if (!allowed.has(c)) errors.push(`Model uses disallowed command "${c}"`);
    }
  }

  // 3. Verify model solution on variant 0 (and variant 1 if adaptive)
  const programs = lvl.start2 ? [lvl.model, lvl.model2 || []] : [lvl.model];
  const fns = lvl.start2 ? [lvl.modelFn1 || [], lvl.modelFn2 || []] : [lvl.modelFn1 || []];

  const sim0 = Engine.simulateMission(programs, fns, lvl, 0);
  if (!sim0.ok) errors.push(`Model fails variant 0: ${sim0.message}`);

  if (lvl.adaptiveCells) {
    const sim1 = Engine.simulateMission(programs, fns, lvl, 1);
    if (!sim1.ok) errors.push(`Model fails variant 1: ${sim1.message}`);
  }

  // 4. Verify curriculum rules on model
  const currErr = Engine.validateCurriculum(programs, fns, lvl);
  if (currErr) errors.push(`Model fails curriculum: ${currErr}`);

  // 5. Verify starter buggy code ACTUALLY fails (if present)
  if (lvl.starter || lvl.starterFn1) {
    const sProgs = lvl.start2 ? [lvl.starter || [], lvl.model2 || []] : [lvl.starter || []];
    const sFns = lvl.start2 ? [lvl.starterFn1 || [], lvl.modelFn2 || []] : [lvl.starterFn1 || []];
    const simStarter = Engine.simulateMission(sProgs, sFns, lvl, 0);
    if (simStarter.ok) errors.push('Starter buggy code unexpectedly PASSES!');
  }

  const blocks = programs.reduce((s, p) => s + Engine.countBlocks(p), 0)
    + fns.reduce((s, f) => s + Engine.countBlocks(f), 0);

  if (errors.length) {
    failed++;
    console.error(`❌ [${num}] ${lvl.name}`);
    errors.forEach((e) => console.error(`    - ${e}`));
  } else {
    console.log(`✅ [${num}] ${lvl.name} (${blocks}/${lvl.maxBlocks} blocks, ${sim0.actions} actions${lvl.adaptiveCells ? ', 2 variants OK' : ''}${lvl.starter ? ', bug verified' : ''})`);
  }
});

console.log(`\nSummary: ${LEVELS.length - failed}/${LEVELS.length} passed.`);
if (failed > 0) process.exit(1);
