#!/usr/bin/env node
/**
 * G3 E2E_PG_IMAGE prove — retirement path marked + sole fail-closed honesty.
 *
 * Pins:
 *   - harness g3-e2e-pg-image.md (inventory / retirement path / FORBIDDEN / dual-review)
 *   - run-e2e-isolated.mjs: LEGACY_PG_IMAGE_DEFAULT still pgvector/pgvector:pg16
 *   - E2E_ISOLATION_STACK default still pgvector-legacy (≠ flip)
 *   - sole fail-closed: explicit E2E_PG_IMAGE on sole → EXIT=3 [G3-E2E-PG-IMAGE]
 *   - SOLE_APPROVED_FIXTURE_CONFIG = compose.mysql-local (no PG image)
 *   - status G3: path marked · sole fail-closed · default image value still OPEN
 *   - package script g3-e2e-pg-image:prove wired
 *
 * HARD: NEVER flips E2E_ISOLATION_STACK default · NEVER retires legacy E2E_PG_IMAGE default value.
 * releaseEvidence=false · Not HA · path marked ≠ default retired · G3 default-value still OPEN
 */
import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const harnessPath = join(root, 'ai-docs/delivery/harness/g3-e2e-pg-image.md');
const statusPath = join(root, 'ai-docs/delivery/harness/r5-retirement-sole-stack-status.md');
const e2eIsolatedPath = join(root, 'scripts/run-e2e-isolated.mjs');
const isolatedForwarderPath = join(root, 'scripts/isolated/run-isolated.mjs');
const packageJsonPath = join(root, 'package.json');
const selfPath = join(root, 'scripts/g3-e2e-pg-image.proof.mjs');
const composeDevPath = join(root, 'docker/compose.dev.yml');
const composeDemoPath = join(root, 'docker/compose.demo.yml');
const m5PlanPath = join(root, 'ai-docs/delivery/m5-pgvector-fixture-retirement-plan.md');

let exitCode = 0;
const lines = [];
function fail(msg) { lines.push(`FAIL  ${msg}`); exitCode = 1; }
function pass(msg) { lines.push(`PASS  ${msg}`); }
function note(msg) { lines.push(`NOTE  ${msg}`); }

for (const [label, path] of [
  ['G3 E2E_PG_IMAGE harness', harnessPath],
  ['R5 retirement sole-stack status', statusPath],
  ['run-e2e-isolated.mjs', e2eIsolatedPath],
  ['isolated forwarder', isolatedForwarderPath],
  ['package.json', packageJsonPath],
  ['this proof script', selfPath],
  ['compose.dev.yml', composeDevPath],
  ['compose.demo.yml', composeDemoPath],
  ['M5 fixture retirement plan', m5PlanPath],
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
    [/本绿\s*≠\s*默认镜像已退役|本绿 ≠ 默认镜像已退役/, '本绿≠默认镜像已退役', 'must pin 本绿≠默认镜像已退役'],
    [/Inventory|库存/, 'has inventory', 'must inventory E2E_PG_IMAGE defaults'],
    [/LEGACY_PG_IMAGE_DEFAULT|pgvector\/pgvector:pg16/, 'pins legacy default image', 'must pin legacy default image'],
    [/SOLE_APPROVED_FIXTURE_CONFIG|compose\.mysql-local/, 'pins sole approved fixture', 'must pin compose.mysql-local approved fixture'],
    [/fail-closed|EXIT=3/, 'pins sole fail-closed', 'must pin sole fail-closed / EXIT=3'],
    [/G3-E2E-PG-IMAGE/, 'names G3-E2E-PG-IMAGE marker', 'must name G3-E2E-PG-IMAGE'],
    [/FORBIDDEN.*翻|禁止本轮翻|≠ flip/i, 'FORBIDDEN flip isolation default', 'must FORBIDDEN flip E2E_ISOLATION_STACK'],
    [/FORBIDDEN.*删\/改|FORBIDDEN 本轮删|默认镜像值/, 'FORBIDDEN retire default image value this slice', 'must FORBIDDEN retire default image this slice'],
    [/Retirement path|retirement path|R-path/, 'has retirement path', 'must mark retirement path'],
    [/仍 GAP|默认镜像值仍 OPEN|default image value still OPEN|未退役/i, 'default image value still OPEN/GAP', 'must pin default image value still OPEN'],
    [/g3-e2e-pg-image:prove/, 'lists prove CMD', 'must list g3-e2e-pg-image:prove'],
    [/FORBIDDEN claims|禁止宣称/, 'has FORBIDDEN claims', 'must have FORBIDDEN claims'],
    [/mw-e2e-ha/, 'lists mw-e2e-ha review', 'must list mw-e2e-ha'],
    [/mw-rag-route/, 'lists mw-rag-route review', 'must list mw-rag-route'],
    [/Dual-review|双域送审/, 'dual-review packet', 'must include dual-review packet'],
  ]);
}

if (existsSync(statusPath)) {
  const st = readFileSync(statusPath, 'utf8');
  assertDocPins('status-G3', st, [
    [/G3/, 'mentions G3', 'must mention G3'],
    [/g3-e2e-pg-image/, 'links G3 harness', 'must link g3-e2e-pg-image'],
    [/path marked|retirement path marked|fail-closed/i, 'G3 path marked / fail-closed', 'must pin G3 path marked / sole fail-closed'],
    [/默认.*仍|仍.*pgvector|default.*still|未退役|仍 OPEN/i, 'default image still OPEN/legacy', 'must pin default image still OPEN'],
    [/pgvector-legacy/, 'pins pgvector-legacy', 'must pin pgvector-legacy'],
    [/releaseEvidence\s*=\s*false/i, 'releaseEvidence=false', 'must pin releaseEvidence=false'],
    [/g3-e2e-pg-image:prove/, 'lists g3 prove CMD', 'must list g3-e2e-pg-image:prove'],
  ]);
}

if (existsSync(e2eIsolatedPath)) {
  const e2e = readFileSync(e2eIsolatedPath, 'utf8');
  if (/const LEGACY_PG_IMAGE_DEFAULT\s*=\s*'pgvector\/pgvector:pg16'/.test(e2e)) {
    pass('run-e2e-isolated.mjs: LEGACY_PG_IMAGE_DEFAULT = pgvector/pgvector:pg16 (unchanged)');
  } else {
    fail("run-e2e-isolated.mjs: must keep LEGACY_PG_IMAGE_DEFAULT = 'pgvector/pgvector:pg16'");
  }
  if (/process\.env\.E2E_PG_IMAGE\s*\?\?\s*LEGACY_PG_IMAGE_DEFAULT/.test(e2e)) {
    pass('run-e2e-isolated.mjs: image defaults via E2E_PG_IMAGE ?? LEGACY_PG_IMAGE_DEFAULT');
  } else {
    fail('run-e2e-isolated.mjs: must default image via E2E_PG_IMAGE ?? LEGACY_PG_IMAGE_DEFAULT');
  }
  if (/const LEGACY_STACK\s*=\s*'pgvector-legacy'/.test(e2e)
    && /rawIsolationStack\s*\|\|\s*LEGACY_STACK/.test(e2e)) {
    pass('run-e2e-isolated.mjs: E2E_ISOLATION_STACK default still pgvector-legacy (≠ flip)');
  } else {
    fail('run-e2e-isolated.mjs: must keep isolation default pgvector-legacy');
  }
  if (/rawIsolationStack\s*\|\|\s*SOLE_STACK/.test(e2e)) {
    fail('run-e2e-isolated.mjs: FORBIDDEN default-to-SOLE_STACK');
  } else {
    pass('run-e2e-isolated.mjs: no default-to-SOLE_STACK');
  }
  if (/const SOLE_APPROVED_FIXTURE_CONFIG\s*=\s*'compose\.mysql-local'/.test(e2e)) {
    pass('run-e2e-isolated.mjs: SOLE_APPROVED_FIXTURE_CONFIG = compose.mysql-local');
  } else {
    fail("run-e2e-isolated.mjs: must set SOLE_APPROVED_FIXTURE_CONFIG = 'compose.mysql-local'");
  }
  if (/\[G3-E2E-PG-IMAGE\].*forbids E2E_PG_IMAGE|forbids E2E_PG_IMAGE/.test(e2e)
    && /explicitPgImage/.test(e2e)
    && /process\.exit\(3\)/.test(e2e)) {
    pass('run-e2e-isolated.mjs: sole + explicit E2E_PG_IMAGE → EXIT=3 fail-closed');
  } else {
    fail('run-e2e-isolated.mjs: must fail-closed sole + explicit E2E_PG_IMAGE');
  }
  if (/approvedFixture\s*!==\s*SOLE_APPROVED_FIXTURE_CONFIG/.test(e2e)) {
    pass('run-e2e-isolated.mjs: sole without approved fixture config → fail-closed');
  } else {
    fail('run-e2e-isolated.mjs: must fail-closed when approved fixture ≠ compose.mysql-local');
  }
  if (/refuse docker-run of image=/.test(e2e) && /isolationStack === SOLE_STACK/.test(e2e)) {
    pass('run-e2e-isolated.mjs: defense-in-depth refuses sole docker-run of PG image');
  } else {
    fail('run-e2e-isolated.mjs: must refuse docker-run of E2E_PG_IMAGE on sole');
  }
  if (/delete soleEnv\.E2E_PG_IMAGE/.test(e2e)) {
    pass('run-e2e-isolated.mjs: soleEnv strips E2E_PG_IMAGE');
  } else {
    fail('run-e2e-isolated.mjs: must delete soleEnv.E2E_PG_IMAGE');
  }
}

if (existsSync(isolatedForwarderPath)) {
  const fwd = readFileSync(isolatedForwarderPath, 'utf8');
  if (/G3/.test(fwd) && /E2E_PG_IMAGE/.test(fwd)) {
    pass('isolated forwarder: documents G3 / E2E_PG_IMAGE');
  } else {
    fail('isolated forwarder: must document G3 E2E_PG_IMAGE');
  }
}

if (existsSync(composeDevPath) && existsSync(composeDemoPath)) {
  const dev = readFileSync(composeDevPath, 'utf8');
  const demo = readFileSync(composeDemoPath, 'utf8');
  if (/pgvector\/pgvector:pg16/.test(dev) && /pgvector\/pgvector:pg16/.test(demo)) {
    pass('inventory: compose.dev/demo still pin pgvector/pgvector:pg16 (legacy surface)');
  } else {
    fail('inventory: compose.dev/demo must still show pgvector image (honesty inventory)');
  }
}

if (existsSync(packageJsonPath)) {
  const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
  const scripts = pkg.scripts ?? {};
  const name = 'g3-e2e-pg-image:prove';
  if (scripts[name] && /g3-e2e-pg-image\.proof\.mjs/.test(scripts[name])) {
    pass(`package.json: ${name} → g3-e2e-pg-image.proof.mjs`);
  } else {
    fail(`package.json: must wire ${name} to scripts/g3-e2e-pg-image.proof.mjs`);
  }
  if (/E2E_ISOLATION_STACK=mysql-qdrant-redis/.test(scripts[name] ?? '')) {
    fail('package.json: g3-e2e-pg-image:prove must NOT set E2E_ISOLATION_STACK=mysql-qdrant-redis as default flip');
  } else {
    pass('package.json: g3 prove does not flip E2E_ISOLATION_STACK');
  }
}

{
  const self = readFileSync(selfPath, 'utf8');
  if (/process\.env\.E2E_ISOLATION_STACK\s*=\s*['"]mysql-qdrant-redis['"]/.test(self)
    && !/spawnSync|NEVER flips/.test(self)) {
    fail('proof script: must not assign default flip; spawn-only ok for fail-closed checks');
  } else {
    pass('proof script: never-flips invariant documented / no default assign');
  }
  if (/NEVER flips|never flips|NEVER retires/i.test(self)) {
    pass('proof script: documents NEVER flips / NEVER retires default');
  } else {
    fail('proof script: must document NEVER flips / NEVER retires');
  }
}

// Lightweight behavioral fail-closed checks (no docker pull required — exits before container).
{
  const runner = e2eIsolatedPath;
  const r1 = spawnSync(process.execPath, [runner, 'isolated-env:prove'], {
    env: {
      ...process.env,
      E2E_ISOLATION_STACK: 'mysql-qdrant-redis',
      E2E_PG_IMAGE: 'pgvector/pgvector:pg16',
    },
    encoding: 'utf8',
    timeout: 30_000,
  });
  const out1 = `${r1.stdout ?? ''}\n${r1.stderr ?? ''}`;
  if (r1.status === 3 && /G3-E2E-PG-IMAGE/.test(out1)) {
    pass('behavior: sole + E2E_PG_IMAGE → EXIT=3 [G3-E2E-PG-IMAGE]');
  } else {
    fail(`behavior: sole + E2E_PG_IMAGE expected EXIT=3 G3 marker; got status=${r1.status} out=${out1.slice(0, 400)}`);
  }

  const env2 = { ...process.env, E2E_ISOLATION_STACK: 'mysql-qdrant-redis', E2E_SOLE_APPROVED_FIXTURE: 'bogus-not-approved' };
  delete env2.E2E_PG_IMAGE;
  const r2 = spawnSync(process.execPath, [runner, 'sole-stack:wiring:prove'], {
    env: env2,
    encoding: 'utf8',
    timeout: 30_000,
  });
  const out2 = `${r2.stdout ?? ''}\n${r2.stderr ?? ''}`;
  if (r2.status === 3 && /G3-E2E-PG-IMAGE/.test(out2) && /approved image\/fixture config|without approved/i.test(out2)) {
    pass('behavior: sole + unapproved fixture → EXIT=3 [G3-E2E-PG-IMAGE]');
  } else {
    fail(`behavior: sole + bogus approved fixture expected EXIT=3 G3; got status=${r2.status} out=${out2.slice(0, 400)}`);
  }
}

note('STILL-GAP: G3 default E2E_PG_IMAGE *value* not retired · G1 flip NOT open · G2 vector/rag/memory defaults · G7 HA/releaseEvidence');
note('releaseEvidence=false · Not HA · path marked + sole fail-closed · default unchanged=pgvector/pgvector:pg16 · isolation default=pgvector-legacy');
note('CMD=pnpm g3-e2e-pg-image:prove');

for (const line of lines) console.log(line);
console.log(`EXIT=${exitCode}`);
process.exit(exitCode);
