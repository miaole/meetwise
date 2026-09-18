#!/usr/bin/env node
/**
 * G1 default isolation switch PREP prove — static honesty only.
 *
 * Pins:
 *   - harness g1-default-switch-prep.md exists (prereq / checklist / rollback / gates / FORBIDDEN)
 *   - run-e2e-isolated.mjs default still pgvector-legacy (LEGACY_STACK; unset → legacy write)
 *   - SOLE_WIRING_ALLOWLIST exactly 5 (P8 dual-approved)
 *   - status G1: prep landed · flip NOT open · default still legacy
 *   - package script g1-default-switch:prep:prove wired
 *
 * HARD: this prove NEVER flips E2E_ISOLATION_STACK / NEVER mutates runner default.
 * releaseEvidence=false · Not HA · prep != flip · G1 still OPEN · G2 still OPEN
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const harnessPath = join(root, 'ai-docs/delivery/harness/g1-default-switch-prep.md');
const statusPath = join(root, 'ai-docs/delivery/harness/r5-retirement-sole-stack-status.md');
const e2eIsolatedPath = join(root, 'scripts/run-e2e-isolated.mjs');
const packageJsonPath = join(root, 'package.json');
const selfPath = join(root, 'scripts/g1-default-switch-prep.proof.mjs');

let exitCode = 0;
const lines = [];
function fail(msg) { lines.push(`FAIL  ${msg}`); exitCode = 1; }
function pass(msg) { lines.push(`PASS  ${msg}`); }
function note(msg) { lines.push(`NOTE  ${msg}`); }

const envBefore = process.env.E2E_ISOLATION_STACK;
if (String(envBefore ?? '').trim() === 'mysql-qdrant-redis') {
  note('E2E_ISOLATION_STACK already mysql-qdrant-redis in parent shell — prove will NOT rewrite it; default-pin is source-only');
}

for (const [label, path] of [
  ['G1 prep harness', harnessPath],
  ['R5 retirement sole-stack status', statusPath],
  ['run-e2e-isolated.mjs', e2eIsolatedPath],
  ['package.json', packageJsonPath],
  ['this proof script', selfPath],
]) {
  if (existsSync(path)) pass(`${label} present: ${path}`);
  else fail(`${label} missing: ${path}`);
}

function assertDocPins(label, text, checks) {
  for (const [re, ok, bad] of checks) {
    if (re.test(text)) pass(`${label}: ${ok}`);
    else fail(`${label}: ${bad}`);
  }
}

if (existsSync(harnessPath)) {
  const h = readFileSync(harnessPath, 'utf8');
  assertDocPins('harness', h, [
    [/releaseEvidence\s*=\s*false/i, 'releaseEvidence=false', 'must pin releaseEvidence=false'],
    [/Not HA/i, 'Not HA', 'must pin Not HA'],
    [/本绿\s*≠\s*已迁|本绿≠已迁/, '本绿≠已迁', 'must pin 本绿≠已迁'],
    [/PREP only|本切片 = PREP only|prep only/i, 'PREP only scope', 'must pin PREP only'],
    [/FORBIDDEN.*翻默认|禁止本轮翻默认|FORBIDDEN 本轮翻默认/i, 'FORBIDDEN flip default this slice', 'must FORBIDDEN flip default this slice'],
    [/pgvector-legacy/, 'pins pgvector-legacy', 'must pin pgvector-legacy'],
    [/mysql-qdrant-redis/, 'pins mysql-qdrant-redis sole target', 'must pin mysql-qdrant-redis'],
    [/P14|retrieval-backend-qdrant|retrieval-store:qdrant:prove/, 'prereq P14 selector', 'must list P14 selector prereq'],
    [/allowlist|恰 5|exactly 5/i, 'prereq sole allowlist', 'must list sole allowlist prereq'],
    [/G2.*OPEN|G2 仍|G2 remaining|仍 GAP/i, 'G2 still remaining/OPEN', 'must pin G2 remaining'],
    [/Flip checklist|flip checklist/i, 'has flip checklist', 'must have flip checklist'],
    [/Rollback|回滚/i, 'has rollback steps', 'must have rollback steps'],
    [/Prove gates|prove gates/i, 'has prove gates', 'must have prove gates'],
    [/FORBIDDEN claims|禁止宣称/i, 'has FORBIDDEN claims', 'must have FORBIDDEN claims'],
    [/flip NOT open|flip not open|flip 未开/i, 'flip NOT open', 'must pin flip NOT open'],
    [/g1-default-switch:prep:prove/, 'lists prove CMD', 'must list g1-default-switch:prep:prove'],
    [/不得.*process\.env\.E2E_ISOLATION_STACK=mysql-qdrant-redis|不得.*翻 env|NEVER flips/i, 'prove never flips env', 'must pin prove never flips env'],
    [/mw-e2e-ha/, 'lists mw-e2e-ha review', 'must list mw-e2e-ha'],
    [/mw-rag-route/, 'lists mw-rag-route review', 'must list mw-rag-route'],
  ]);
}

if (existsSync(statusPath)) {
  const st = readFileSync(statusPath, 'utf8');
  assertDocPins('status-G1', st, [
    [/G1/, 'mentions G1', 'must mention G1'],
    [/pgvector-legacy/, 'default track pgvector-legacy', 'must pin pgvector-legacy'],
    [/prep landed|PREP landed|prep 已落|清单.*回滚/i, 'G1 prep landed', 'must pin G1 prep landed'],
    [/flip NOT open|flip not open|flip 未开|禁止本轮翻默认/i, 'flip NOT open', 'must pin flip NOT open'],
    [/默认仍.*pgvector-legacy|仍 `pgvector-legacy`|isolated.*pgvector-legacy/i, 'GAP: default still legacy', 'must GAP-pin default still legacy'],
    [/G2/, 'G2 still referenced', 'must still reference G2'],
    [/releaseEvidence\s*=\s*false/i, 'releaseEvidence=false', 'must pin releaseEvidence=false'],
    [/g1-default-switch-prep/, 'links G1 prep harness', 'must link g1-default-switch-prep'],
  ]);
}

if (existsSync(e2eIsolatedPath)) {
  const e2e = readFileSync(e2eIsolatedPath, 'utf8');
  if (/const LEGACY_STACK\s*=\s*'pgvector-legacy'/.test(e2e)) {
    pass('run-e2e-isolated.mjs: LEGACY_STACK = pgvector-legacy');
  } else {
    fail("run-e2e-isolated.mjs: must keep LEGACY_STACK = 'pgvector-legacy' (G1 flip FORBIDDEN this slice)");
  }
  if (/const SOLE_STACK\s*=\s*'mysql-qdrant-redis'/.test(e2e)) {
    pass('run-e2e-isolated.mjs: SOLE_STACK = mysql-qdrant-redis (target name only)');
  } else {
    fail("run-e2e-isolated.mjs: must name SOLE_STACK = mysql-qdrant-redis");
  }
  if (/isolationStack\s*=\s*rawIsolationStack\s*\|\|\s*LEGACY_STACK/.test(e2e)
    || /rawIsolationStack\s*\|\|\s*LEGACY_STACK/.test(e2e)) {
    pass('run-e2e-isolated.mjs: unset E2E_ISOLATION_STACK → LEGACY_STACK (default still legacy)');
  } else {
    fail('run-e2e-isolated.mjs: must default unset stack to LEGACY_STACK (not SOLE_STACK)');
  }
  if (/rawIsolationStack\s*\|\|\s*SOLE_STACK/.test(e2e)
    || /isolationStack\s*=\s*rawIsolationStack\s*\|\|\s*SOLE_STACK/.test(e2e)) {
    fail('run-e2e-isolated.mjs: FORBIDDEN default-to-SOLE_STACK detected (G1 flip not open)');
  } else {
    pass('run-e2e-isolated.mjs: no default-to-SOLE_STACK (flip not open)');
  }
  if (/!rawIsolationStack[\s\S]{0,80}E2E_ISOLATION_STACK\s*=\s*LEGACY_STACK/.test(e2e)) {
    pass('run-e2e-isolated.mjs: writes E2E_ISOLATION_STACK=LEGACY_STACK when unset');
  } else {
    fail('run-e2e-isolated.mjs: must write E2E_ISOLATION_STACK=LEGACY_STACK when unset');
  }
  {
    const m = e2e.match(/SOLE_WIRING_ALLOWLIST\s*=\s*new Set\(([\s\S]*?)\)/);
    const block = m ? m[1] : '';
    const items = [...block.matchAll(/'([^']+)'/g)].map((x) => x[1]);
    const expected = [
      'sole-stack:wiring:prove',
      'sole-stack:ping:prove',
      'sole-stack:qdrant-backed:prove',
      'sole-stack:vectorstore-adapter:prove',
      'sole-stack:vectorstore-qdrant:prove',
    ];
    if (!m) fail('run-e2e-isolated.mjs: SOLE_WIRING_ALLOWLIST Set not parseable');
    else if (items.length !== 5 || expected.some((e) => !items.includes(e))) {
      fail(`run-e2e-isolated.mjs: sole allowlist must be exactly 5 dual-approved; got [${items.join(',')}]`);
    } else if (items.some((i) => /rag-qdrant|memory-qdrant/.test(i))) {
      fail('run-e2e-isolated.mjs: P13 rag/memory must stay OFF allowlist');
    } else {
      pass('run-e2e-isolated.mjs: sole allowlist exactly 5 (P8; P13 OFF)');
    }
  }
  if (/G1 still open|NOT default switch \(G1 still open\)/i.test(e2e)) {
    pass('run-e2e-isolated.mjs: comments G1 still open / NOT default switch');
  } else {
    fail('run-e2e-isolated.mjs: must comment NOT default switch (G1 still open)');
  }
}

if (existsSync(packageJsonPath)) {
  const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
  const scripts = pkg.scripts ?? {};
  const name = 'g1-default-switch:prep:prove';
  if (scripts[name] && /g1-default-switch-prep\.proof\.mjs/.test(scripts[name])) {
    pass(`package.json: ${name} → g1-default-switch-prep.proof.mjs`);
  } else {
    fail(`package.json: must wire ${name} to scripts/g1-default-switch-prep.proof.mjs`);
  }
  if (/E2E_ISOLATION_STACK=mysql-qdrant-redis/.test(scripts[name] ?? '')) {
    fail('package.json: g1-default-switch:prep:prove must NOT set E2E_ISOLATION_STACK=mysql-qdrant-redis');
  } else {
    pass('package.json: prep:prove does not flip E2E_ISOLATION_STACK');
  }
}

{
  const self = readFileSync(selfPath, 'utf8');
  if (/process\.env\.E2E_ISOLATION_STACK\s*=\s*['"]mysql-qdrant-redis['"]/.test(self)) {
    fail('proof script: FORBIDDEN — must never assign E2E_ISOLATION_STACK=mysql-qdrant-redis');
  } else {
    pass('proof script: never assigns E2E_ISOLATION_STACK=mysql-qdrant-redis');
  }
  if (/NEVER flips|never flips|不翻 env/i.test(self)) {
    pass('proof script: documents never-flips invariant');
  } else {
    fail('proof script: must document never-flips invariant');
  }
}

note('STILL-GAP: G1 default isolation flip NOT open · G2 vector/rag/memory defaults · G3 E2E_PG_IMAGE · G7 HA/releaseEvidence');
note('releaseEvidence=false · Not HA · prep landed != flip · default unchanged=pgvector-legacy');

for (const line of lines) console.log(line);
process.exit(exitCode);
