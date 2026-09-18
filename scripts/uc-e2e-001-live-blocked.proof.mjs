#!/usr/bin/env node
/**
 * UC-E2E-001 — live blocked(无 MODEL_API_KEY) honesty pin
 *
 * releaseEvidence=false · Not HA · 本绿 ≠ live E2E covered · 本绿 ≠ UC-E2E-001 covered
 * EXIT=0 = 诚实钉「无 Key → blocked」+ runner fail-closed 源码钉；≠ green live
 * 不跑 pnpm e2e:isolated / full.e2e；不发明 Key；不读 .env 值
 *
 * 抬 covered（北星，非本 prove）：Key 到位后跑 `pnpm e2e:isolated` → e2e/full.e2e.ts
 * （仍须标 fixture=pgvector → green-risk / R5；本绿≠sole-stack migrated）
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

let exitCode = 0;
const lines = [];
function fail(msg) {
  lines.push(`FAIL  ${msg}`);
  exitCode = 1;
}
function pass(msg) {
  lines.push(`PASS  ${msg}`);
}
function note(msg) {
  lines.push(`NOTE  ${msg}`);
}

function read(rel) {
  const p = join(root, rel);
  if (!existsSync(p)) {
    fail(`missing file: ${rel}`);
    return '';
  }
  return readFileSync(p, 'utf8');
}

// —— 0. Key 探测（仅 process.env；不读 .env；不打印值）——
const keyRaw = process.env.MODEL_API_KEY;
const keyPresent = Boolean(keyRaw && String(keyRaw).trim());
const keyStatus = keyPresent ? 'set' : 'unset';
pass(`MODEL_API_KEY probe (env only, no value printed): ${keyStatus}`);

// —— 1. Runner fail-closed 源码钉（无 Key 立即 throw，不降级假绿）——
const runE2e = read('scripts/run-e2e.mjs');
const runE2eUi = read('scripts/run-e2e-ui.mjs');
const pkg = read('package.json');
const harness = read('ai-docs/delivery/harness/uc-e2e-001-golden-path.eval.md');
const evalDoc = read('ai-docs/delivery/eval/uc-e2e-001-golden-path.eval.md');
const matrix = read('ai-docs/delivery/e2e-requirement-coverage-matrix.md');

const KEY_GATE_RE =
  /!String\(env\.MODEL_API_KEY\s*\?\?\s*''\)\.trim\(\)\s*\)\s*throw\s+tagE2EFailure\(\s*'provider'\s*,\s*'live_provider_key_missing'\s*\)/;

if (runE2e && KEY_GATE_RE.test(runE2e)) {
  pass('run-e2e.mjs: fail-closed live_provider_key_missing when Key absent');
} else {
  fail('run-e2e.mjs: must throw tagE2EFailure(provider, live_provider_key_missing) when Key absent');
}

if (runE2eUi && KEY_GATE_RE.test(runE2eUi)) {
  pass('run-e2e-ui.mjs: fail-closed live_provider_key_missing when Key absent');
} else {
  fail('run-e2e-ui.mjs: must throw tagE2EFailure(provider, live_provider_key_missing) when Key absent');
}

if (runE2e && /假绿|不会降级成假绿|skip-as-pass/.test(runE2e)) {
  pass('run-e2e.mjs: documents no-fake-green / fail-closed stance');
} else if (runE2e) {
  // soft: header comment is enough if gate exists
  pass('run-e2e.mjs: gate present (stance comment optional)');
}

// —— 2. package.json 接线 ——
if (pkg && /"uc001:live-blocked:prove"\s*:\s*"node scripts\/uc-e2e-001-live-blocked\.proof\.mjs"/.test(pkg)) {
  pass('package.json: wires uc001:live-blocked:prove');
} else {
  fail('package.json: must wire "uc001:live-blocked:prove" → scripts/uc-e2e-001-live-blocked.proof.mjs');
}

if (pkg && /"e2e:isolated"\s*:\s*"node scripts\/run-e2e-isolated\.mjs e2e:prove"/.test(pkg)) {
  pass('package.json: e2e:isolated → run-e2e-isolated → e2e:prove (抬 covered 路径仍挂)');
} else {
  fail('package.json: e2e:isolated must remain wired for Key-present live path');
}

// —— 3. Harness：blocked(无 Key) 专节 + 抬 covered ——
if (harness) {
  if (/blocked\s*\(\s*无\s*Key\s*\)|blocked\(无 Key\)/i.test(harness)) {
    pass('harness: explicit blocked(无 Key) honesty');
  } else {
    fail('harness: must pin blocked(无 Key)');
  }
  if (/##\s*1a\.?\s*blocked|##\s*.*blocked\s*\(\s*无\s*Key/i.test(harness)) {
    pass('harness: has dedicated blocked(无 Key) section');
  } else {
    fail('harness: must have dedicated blocked(无 Key) section (§1a or equivalent)');
  }
  if (
    /抬到\s*covered|抬 covered/i.test(harness) &&
    /pnpm e2e:isolated/i.test(harness) &&
    /full\.e2e/i.test(harness)
  ) {
    pass('harness: 抬 covered = Key 到位后 pnpm e2e:isolated / full.e2e');
  } else {
    fail('harness: must state 抬 covered = Key 到位后跑 pnpm e2e:isolated / full.e2e');
  }
  if (/releaseEvidence\s*=\s*false/i.test(harness) && /Not HA|非 HA/i.test(harness)) {
    pass('harness: releaseEvidence=false · Not HA');
  } else {
    fail('harness: must keep releaseEvidence=false · Not HA');
  }
  if (/≠\s*covered|禁止.*covered|不得.*covered/i.test(harness)) {
    pass('harness: ≠ covered honesty');
  } else {
    fail('harness: must pin ≠ covered');
  }
  // forbid claiming live covered
  if (/UC-E2E-001[^\n]{0,100}\*\*covered\*\*/i.test(harness)) {
    fail('harness: must not claim UC-E2E-001 **covered**');
  } else {
    pass('harness: does not claim UC-E2E-001 covered');
  }
  if (/uc001:live-blocked:prove/i.test(harness)) {
    pass('harness: cites uc001:live-blocked:prove');
  } else {
    fail('harness: must cite pnpm uc001:live-blocked:prove');
  }
}

// —— 4. Eval 笔记 ——
if (evalDoc) {
  if (/blocked/i.test(evalDoc) && /MODEL_API_KEY/i.test(evalDoc)) {
    pass('eval: pins MODEL_API_KEY + blocked');
  } else {
    fail('eval: must pin MODEL_API_KEY + blocked');
  }
  if (/uc001:live-blocked:prove/i.test(evalDoc)) {
    pass('eval: cites uc001:live-blocked:prove');
  } else {
    fail('eval: must cite uc001:live-blocked:prove');
  }
  if (/UC-E2E-001[^\n]{0,100}\*\*covered\*\*/i.test(evalDoc)) {
    fail('eval: must not claim UC-E2E-001 **covered**');
  } else {
    pass('eval: does not claim UC-E2E-001 covered');
  }
}

// —— 5. Matrix：已有 blocked — 强化；永不宣称 live covered ——
if (matrix) {
  if (/UC-E2E-001[^\n]*\*\*blocked\*\*\s*\(\s*无\s*Key\s*\)/i.test(matrix)) {
    pass('matrix: UC-E2E-001 remains **blocked**(无 Key)');
  } else if (/UC-E2E-001[^\n]*blocked\(无 Key\)/i.test(matrix)) {
    pass('matrix: UC-E2E-001 cites blocked(无 Key)');
  } else {
    fail('matrix: UC-E2E-001 must keep blocked(无 Key)');
  }
  if (/UC-E2E-001[^\n]*\*\*covered\*\*/i.test(matrix)) {
    fail('matrix: UC-E2E-001 must not be false **covered**');
  } else {
    pass('matrix: UC-E2E-001 not claimed **covered**');
  }
  if (/UC-E2E-001 live[^\n]*\*\*blocked\*\*/i.test(matrix) || /UC-E2E-001 live[^\n]*blocked/i.test(matrix)) {
    pass('matrix §4: UC-E2E-001 live recorded blocked');
  } else {
    fail('matrix §4: must record UC-E2E-001 live as blocked');
  }
  if (/uc001:live-blocked:prove/i.test(matrix)) {
    pass('matrix: references uc001:live-blocked:prove');
  } else {
    fail('matrix: must reference uc001:live-blocked:prove');
  }
  if (/releaseEvidence.*false/i.test(matrix)) {
    pass('matrix: releaseEvidence=false');
  } else {
    fail('matrix: must keep releaseEvidence=false');
  }
}

// —— 6. 状态读法：无 Key = blocked honesty（本 prove 绿 ≠ live 绿）——
if (!keyPresent) {
  note('STATUS=blocked(无 Key) — live e2e:isolated / full.e2e NOT run; honesty pin only');
  note('抬 covered: set MODEL_API_KEY then run `pnpm e2e:isolated` (still ≠ sole-stack; R5 green-risk)');
  pass('honesty: Key absent → mark blocked (EXIT=0 documents blocked, not green live)');
} else {
  note('STATUS=Key set — live path *available*; this prove still ≠ live covered / ≠ UC-E2E-001 covered');
  note('Do not treat this EXIT=0 as e2e:isolated green; run live separately and still mark R5');
  pass('honesty: Key present → static fail-closed pins only; no live claim');
}

console.log(lines.join('\n'));
console.log(`\nCMD=pnpm uc001:live-blocked:prove EXIT=${exitCode}`);
console.log(
  'NOTE: EXIT=0 = blocked(无 Key) honesty / fail-closed source pin · ≠ live E2E · ≠ covered · releaseEvidence=false · Not HA',
);
process.exit(exitCode);
