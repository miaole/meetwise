#!/usr/bin/env node
/**
 * G6 e2e:isolated / LIVE family — Key-unset blocked honesty pin (BUG-E2E-ISO).
 *
 * Same discipline as UC-001 live-blocked:
 *   EXIT=0 = honesty pin「无 Key → LIVE HTTP/UI blocked」+ runner fail-closed source pins
 *   ≠ green e2e:isolated / ≠ family covered / ≠ G6 closed / ≠ BUG-E2E-ISO closed
 *
 * HARD: do NOT hard-run pnpm e2e:isolated without Key; do NOT invent Key; do NOT read .env*.
 * releaseEvidence=false · Not HA · G6 still OPEN
 */
import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
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

function assertDocPins(label, text, checks) {
  for (const [re, ok, bad] of checks) {
    if (re.test(text)) pass(`${label}: ${ok}`);
    else fail(`${label}: ${bad}`);
  }
}

// —— 0. Key probe (env only; never print value; never read .env*) ——
const keyRaw = process.env.MODEL_API_KEY;
const keyPresent = Boolean(keyRaw && String(keyRaw).trim());
const keyStatus = keyPresent ? 'set' : 'unset';
pass(`MODEL_API_KEY probe (env only, no value printed): ${keyStatus}`);
if (existsSync(join(root, '.env')) || existsSync(join(root, '.env.local'))) {
  note('NOTE: .env* file(s) exist on disk — this prove does NOT read them (Key status = process.env only)');
}

const harness = read('ai-docs/delivery/harness/g6-e2e-iso-blocked.md');
const status = read('ai-docs/delivery/harness/r5-retirement-sole-stack-status.md');
const whitelist = read('ai-docs/delivery/e2e-live-targets-whitelist.md');
const inventory = read('ai-docs/delivery/harness/e2e-full-suite.inventory.md');
const matrix = read('ai-docs/delivery/e2e-requirement-coverage-matrix.md');
const gap = read('ai-docs/delivery/gap-bug-backlog.md');
const pkg = read('package.json');
const runE2e = read('scripts/run-e2e.mjs');
const runE2eUi = read('scripts/run-e2e-ui.mjs');
const runPerf = read('scripts/run-performance-e2e.mjs');
const targetsLive = read('scripts/isolated/targets-live-e2e.mjs');
const runIsolated = read('scripts/run-e2e-isolated.mjs');
const uc001Proof = read('scripts/uc-e2e-001-live-blocked.proof.mjs');
const selfPath = join(root, 'scripts/g6-e2e-iso-blocked.proof.mjs');

for (const [label, path] of [
  ['G6 harness', 'ai-docs/delivery/harness/g6-e2e-iso-blocked.md'],
  ['R5 status', 'ai-docs/delivery/harness/r5-retirement-sole-stack-status.md'],
  ['LIVE whitelist', 'ai-docs/delivery/e2e-live-targets-whitelist.md'],
  ['full-suite inventory', 'ai-docs/delivery/harness/e2e-full-suite.inventory.md'],
  ['this proof', 'scripts/g6-e2e-iso-blocked.proof.mjs'],
]) {
  if (existsSync(join(root, path))) pass(`${label} present`);
  else fail(`${label} missing: ${path}`);
}

const KEY_GATE_RE =
  /!String\(env\.MODEL_API_KEY\s*\?\?\s*''\)\.trim\(\)\s*\)\s*throw\s+tagE2EFailure\(\s*'provider'\s*,\s*'live_provider_key_missing'\s*\)/;

// —— 1. Runner fail-closed (HTTP + UI) ——
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
if (runE2e && /不会降级成假绿|假绿|skip-as-pass/.test(runE2e)) {
  pass('run-e2e.mjs: documents no-fake-green / fail-closed stance');
} else if (runE2e) {
  pass('run-e2e.mjs: gate present (stance comment optional)');
}

// —— 2. Inventory: performance does NOT require Key; still ≠ G6 close ——
if (runPerf && !KEY_GATE_RE.test(runPerf) && /不把模型时延计入|无外部模型/.test(runPerf)) {
  pass('run-performance-e2e.mjs: no MODEL_API_KEY gate (API burst; model latency excluded)');
} else if (runPerf && !/live_provider_key_missing/.test(runPerf)) {
  pass('run-performance-e2e.mjs: no live_provider_key_missing gate (Key not required)');
} else {
  fail('run-performance-e2e.mjs: unexpected Key gate or missing no-model stance');
}

// —— 3. LIVE Set inventory (must stay three; do not shrink) ——
if (
  targetsLive &&
  /LIVE_E2E_TARGET_LIST/.test(targetsLive) &&
  /'e2e:prove'/.test(targetsLive) &&
  /'e2e:ui'/.test(targetsLive) &&
  /'performance:e2e'/.test(targetsLive)
) {
  pass('targets-live-e2e.mjs: LIVE Set inventories e2e:prove / e2e:ui / performance:e2e');
} else {
  fail('targets-live-e2e.mjs: must inventory three LIVE targets');
}
if (runIsolated && /status G6/.test(runIsolated) && /BUG-E2E-ISO|e2e:isolated \/ LIVE \/ performance/.test(runIsolated)) {
  pass('run-e2e-isolated.mjs: SOLE PREREQ lists G6 family re-run');
} else {
  fail('run-e2e-isolated.mjs: must list G6 full e2e:isolated/LIVE/performance family re-run PREREQ');
}

// —— 4. package.json wiring ——
if (pkg && /"g6-e2e-iso-blocked:prove"\s*:\s*"node scripts\/g6-e2e-iso-blocked\.proof\.mjs"/.test(pkg)) {
  pass('package.json: wires g6-e2e-iso-blocked:prove');
} else {
  fail('package.json: must wire "g6-e2e-iso-blocked:prove" → scripts/g6-e2e-iso-blocked.proof.mjs');
}
if (pkg && /"e2e:isolated"\s*:\s*"node scripts\/run-e2e-isolated\.mjs e2e:prove"/.test(pkg)) {
  pass('package.json: e2e:isolated → e2e:prove (Key-present hard-run path still hung)');
} else {
  fail('package.json: e2e:isolated must remain wired');
}
if (pkg && /"e2e:ui:isolated"\s*:\s*"node scripts\/run-e2e-isolated\.mjs e2e:ui"/.test(pkg)) {
  pass('package.json: e2e:ui:isolated wired');
} else {
  fail('package.json: e2e:ui:isolated must remain wired');
}
if (pkg && /"performance:e2e:isolated"\s*:\s*"node scripts\/run-e2e-isolated\.mjs performance:e2e"/.test(pkg)) {
  pass('package.json: performance:e2e:isolated wired');
} else {
  fail('package.json: performance:e2e:isolated must remain wired');
}
if (pkg && /"uc001:live-blocked:prove"\s*:\s*"node scripts\/uc-e2e-001-live-blocked\.proof\.mjs"/.test(pkg)) {
  pass('package.json: uc001:live-blocked:prove still wired (same discipline)');
} else {
  fail('package.json: uc001:live-blocked:prove must remain for same-discipline cross-pin');
}

// —— 5. Harness pins ——
if (harness) {
  assertDocPins('harness', harness, [
    [/releaseEvidence\s*=\s*false/i, 'releaseEvidence=false', 'must pin releaseEvidence=false'],
    [/Not HA/i, 'Not HA', 'must pin Not HA'],
    [/G6\s*仍\s*OPEN|G6 still OPEN|BUG-E2E-ISO\s*未关/i, 'G6 still OPEN / BUG-E2E-ISO open', 'must pin G6 still OPEN'],
    [/Inventory|库存/, 'has inventory', 'must inventory LIVE / Key needs'],
    [/e2e:prove/, 'inventories e2e:prove', 'must inventory e2e:prove'],
    [/e2e:ui/, 'inventories e2e:ui', 'must inventory e2e:ui'],
    [/performance:e2e/, 'inventories performance:e2e', 'must inventory performance:e2e'],
    [/MODEL_API_KEY/, 'pins MODEL_API_KEY', 'must pin MODEL_API_KEY'],
    [/blocked\s*\(\s*无\s*Key\s*\)|blocked\(无 Key\)/i, 'pins blocked(无 Key)', 'must pin blocked(无 Key)'],
    [/live_provider_key_missing/, 'names live_provider_key_missing', 'must name live_provider_key_missing'],
    [/Path when Key|有 Key 时|抬向/i, 'documents Path when Key present', 'must document Path when Key present'],
    [/pnpm e2e:isolated/i, 'cites pnpm e2e:isolated', 'must cite hard-run path pnpm e2e:isolated'],
    [/g6-e2e-iso-blocked:prove/, 'lists prove CMD', 'must list g6-e2e-iso-blocked:prove'],
    [/FORBIDDEN claims|禁止宣称/, 'has FORBIDDEN claims', 'must have FORBIDDEN claims'],
    [/mw-e2e-ha/, 'lists mw-e2e-ha', 'must list mw-e2e-ha'],
    [/mw-rag-route/, 'lists mw-rag-route', 'must list mw-rag-route'],
    [/Dual-review|双域送审/, 'dual-review packet', 'must include dual-review packet'],
    [/不读[\s\S]{0,40}\.env|do NOT read \.env|不读 \.env/i, 'forbids reading .env*', 'must forbid reading .env*'],
    [/performance[^\n]{0,80}≠|performance[^\n]{0,80}不得|无 Key[^\n]{0,40}≠.*G6/i, 'performance ≠ G6 close', 'must pin performance-only ≠ G6 close'],
  ]);
}

// —— 6. Status G6: honesty landed · still OPEN ——
if (status) {
  assertDocPins('status-G6', status, [
    [/G6/, 'mentions G6', 'must mention G6'],
    [/g6-e2e-iso-blocked/, 'links G6 harness/prove', 'must link g6-e2e-iso-blocked'],
    [/BUG-E2E-ISO/, 'pins BUG-E2E-ISO', 'must pin BUG-E2E-ISO'],
    [/blocked|Key-unset|无 Key|MODEL_API_KEY/i, 'pins Key-unset / blocked honesty', 'must pin Key-unset blocked honesty on G6'],
    [/仍 OPEN|仍未关闭|未关/i, 'G6 still OPEN', 'must keep G6 OPEN / not closed'],
    [/releaseEvidence\s*=\s*false/i, 'releaseEvidence=false', 'must pin releaseEvidence=false'],
    [/g6-e2e-iso-blocked:prove/, 'lists g6 prove CMD', 'must list g6-e2e-iso-blocked:prove'],
  ]);
  if (/G6[^\n]{0,60}已关闭/.test(status) || /\bG6 (is )?closed\b/i.test(status) || /G6[^\n]{0,40}\*\*covered\*\*/.test(status)) {
    fail('status: must NOT claim G6 closed / covered');
  } else {
    pass('status: does not claim G6 closed/covered');
  }
}

// —— 7. Whitelist / inventory / matrix / gap cross-pins ——
if (whitelist) {
  assertDocPins('whitelist', whitelist, [
    [/e2e:isolated/, 'lists e2e:isolated', 'must list e2e:isolated'],
    [/performance:e2e:isolated|performance:e2e/, 'lists performance live', 'must list performance live'],
    [/MODEL_API_KEY|live|LIVE/, 'LIVE narrative present', 'must keep LIVE narrative'],
  ]);
}
if (inventory) {
  assertDocPins('full-suite-inventory', inventory, [
    [/e2e:isolated/, 'lists e2e:isolated', 'must list e2e:isolated'],
    [/BUG-E2E-ISO/, 'pins BUG-E2E-ISO', 'must pin BUG-E2E-ISO'],
    [/g6-e2e-iso-blocked|G6.*blocked|无 Key.*blocked|MODEL_API_KEY.*blocked/i, 'pins G6/Key blocked honesty', 'must pin G6 Key-unset blocked'],
  ]);
}
if (matrix) {
  assertDocPins('matrix', matrix, [
    [/BUG-E2E-ISO/, 'pins BUG-E2E-ISO', 'must pin BUG-E2E-ISO'],
    [/g6-e2e-iso-blocked:prove|G6.*blocked|e2e:isolated 全量[^\n]*blocked/i, 'records G6/family blocked honesty', 'must record G6/family blocked honesty'],
    [/releaseEvidence.*false/i, 'releaseEvidence=false', 'must keep releaseEvidence=false'],
  ]);
  if (/G6[^\n]*\*\*covered\*\*|BUG-E2E-ISO[^\n]*\*\*closed\*\*/i.test(matrix)) {
    fail('matrix: must not claim G6 covered or BUG-E2E-ISO closed');
  } else {
    pass('matrix: does not claim G6 covered / BUG-E2E-ISO closed');
  }
}
if (gap) {
  if (/BUG-E2E-ISO/.test(gap)) pass('gap-bug-backlog: BUG-E2E-ISO present');
  else fail('gap-bug-backlog: must keep BUG-E2E-ISO');
  if (/g6-e2e-iso-blocked/.test(gap)) pass('gap-bug-backlog: cites g6-e2e-iso-blocked');
  else fail('gap-bug-backlog: must cite g6-e2e-iso-blocked honesty pin');
}

// —— 8. Same-discipline cross-pin with UC-001 ——
if (uc001Proof && /live blocked|MODEL_API_KEY|live_provider_key_missing/.test(uc001Proof)) {
  pass('uc001 live-blocked proof: same-discipline peer present');
} else {
  fail('uc001 live-blocked proof: must remain as peer discipline');
}

// —— 9. Lightweight behavior: direct runner fail-closed (no isolated docker) ——
{
  const env = { ...process.env, E2E_ISOLATED: '1' };
  delete env.MODEL_API_KEY;
  const r = spawnSync(process.execPath, [join(root, 'scripts/run-e2e.mjs')], {
    env,
    encoding: 'utf8',
    timeout: 20_000,
  });
  const out = `${r.stdout ?? ''}\n${r.stderr ?? ''}`;
  if (r.status !== 0 && /live_provider_key_missing/.test(out)) {
    pass('behavior: run-e2e.mjs Key unset → non-zero + live_provider_key_missing (no fake green)');
  } else {
    fail(`behavior: run-e2e.mjs Key unset expected non-zero live_provider_key_missing; status=${r.status} out=${out.slice(0, 400)}`);
  }
  const rUi = spawnSync(process.execPath, [join(root, 'scripts/run-e2e-ui.mjs')], {
    env,
    encoding: 'utf8',
    timeout: 20_000,
  });
  const outUi = `${rUi.stdout ?? ''}\n${rUi.stderr ?? ''}`;
  if (rUi.status !== 0 && /live_provider_key_missing/.test(outUi)) {
    pass('behavior: run-e2e-ui.mjs Key unset → non-zero + live_provider_key_missing');
  } else {
    fail(`behavior: run-e2e-ui.mjs Key unset expected non-zero live_provider_key_missing; status=${rUi.status} out=${outUi.slice(0, 400)}`);
  }
}

// —— 10. Status read: Key absent → family blocked honesty ——
if (!keyPresent) {
  note('STATUS=blocked(无 Key) — LIVE HTTP/UI e2e:isolated family NOT hard-run; honesty pin only');
  note('Path when Key present: pnpm e2e:isolated / e2e:ui:isolated / performance:e2e:isolated (still ≠ G6 close; R5 green-risk)');
  note('G6 / BUG-E2E-ISO still OPEN — sole full family re-run + inventory review not done');
  pass('honesty: Key absent → mark family blocked (EXIT=0 documents blocked, not green live)');
} else {
  note('STATUS=Key set — hard-run path *available*; this prove still ≠ family green / ≠ G6 closed');
  note('Do not treat this EXIT=0 as e2e:isolated green; hard-run separately; still mark R5; G6 needs sole re-run');
  pass('honesty: Key present → static fail-closed pins only; no family-green claim');
}

{
  const self = readFileSync(selfPath, 'utf8');
  if (/HARD: do NOT hard-run|do NOT invent Key|do NOT read \.env/i.test(self)) {
    pass('proof script: documents HARD no hard-run / no invent Key / no .env read');
  } else {
    fail('proof script: must document HARD constraints');
  }
}

note('STILL-GAP: G6 BUG-E2E-ISO open · G1 flip NOT open · G3 default image OPEN · G7 HA/releaseEvidence');
note('releaseEvidence=false · Not HA · Key-unset blocked honesty · ≠ family green · ≠ flip default');
note('CMD=pnpm g6-e2e-iso-blocked:prove');

console.log(lines.join('\n'));
console.log(`\nCMD=pnpm g6-e2e-iso-blocked:prove EXIT=${exitCode}`);
console.log(
  'NOTE: EXIT=0 = G6 family blocked(无 Key) honesty / fail-closed source pin · ≠ live E2E · ≠ G6 closed · releaseEvidence=false · Not HA',
);
process.exit(exitCode);
