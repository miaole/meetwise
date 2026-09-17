#!/usr/bin/env node
/**
 * Qdrant-backed prove deepen — inventory + connect pin (honesty).
 *
 * Pins:
 *   - package.json classify: qdrant-native vs pgvector-isolated vs static/conn
 *   - harness qdrant-backed-prove-deepen + status G2 still GAP
 *   - additive qdrant-store skeleton/erase-honesty wired
 *   - retrieval-store annSearch / vectorstore:prove / E2E_PG_IMAGE intact (no cut)
 *   - sole non-allowlist E2E_ISOLATION_STACK=mysql-qdrant-redis fails closed (EXIT=3 + PREREQ);
 *     allowlist wiring/ping/qdrant-backed/adapter may EXIT=0 (≠ L1 / ≠ G2 close)
 *   - live Qdrant /readyz OR EXIT=3 PREREQ (never fake-green)
 *
 * HARD: do NOT claim RAG/memory/vectorstore covered on Qdrant.
 * releaseEvidence=false · Not HA · 本绿≠已迁 · pass≠cutover · local green ≠ HA
 *
 * EXIT=0  → inventory honesty + readyz OK (G2 still explicitly GAP)
 * EXIT=1  → honesty pin failure
 * EXIT=3  → Qdrant PREREQ missing (fail-closed)
 */
import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const scriptPath = join(root, 'scripts/conn-stack/mysql-stack.qdrant-backed.prove.mjs');
const harnessPath = join(root, 'ai-docs/delivery/harness/qdrant-backed-prove-deepen.md');
const statusPath = join(root, 'ai-docs/delivery/harness/r5-retirement-sole-stack-status.md');
const prototypeHarness = join(root, 'ai-docs/delivery/harness/qdrant-store.prototype.md');
const eraseHarness = join(root, 'ai-docs/delivery/harness/qdrant-erase-count-honesty.md');
const packageJsonPath = join(root, 'package.json');
const retrievalPath = join(root, 'packages/db/src/retrieval-store.ts');
const vectorstoreProofPath = join(root, 'packages/db/test/vectorstore.proof.ts');
const e2eIsolatedPath = join(root, 'scripts/run-e2e-isolated.mjs');
const qdrantPkg = join(root, 'packages/qdrant-store/package.json');
const composePath = join(root, 'docker/compose.mysql-local.yml');
const QDRANT_BASE = (process.env.QDRANT_URL || 'http://127.0.0.1:6333').replace(/\/$/, '');
const QDRANT_READYZ = `${QDRANT_BASE}/readyz`;

let exitCode = 0;
const lines = [];
function fail(msg) {
  lines.push(`FAIL  ${msg}`);
  if (exitCode === 0) exitCode = 1;
}
function pass(msg) {
  lines.push(`PASS  ${msg}`);
}
function note(msg) {
  lines.push(`NOTE  ${msg}`);
}
function prereqFail(msg) {
  lines.push(`PREREQ ${msg}`);
  if (exitCode === 0 || exitCode === 1) exitCode = 3;
}

function which(bin) {
  const r = spawnSync('sh', ['-c', `command -v ${bin}`], { encoding: 'utf8' });
  return r.status === 0 ? r.stdout.trim() : '';
}

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, {
    encoding: 'utf8',
    env: process.env,
    cwd: root,
    timeout: opts.timeoutMs ?? 30_000,
  });
  const status = r.error ? 1 : (r.status ?? 1);
  lines.push(`CMD=${[cmd, ...args].join(' ')} EXIT=${status}`);
  if (r.error) lines.push(`NOTE  spawn error: ${r.error.message}`);
  return { status, stdout: r.stdout ?? '', stderr: r.stderr ?? '' };
}

function assertDocPins(label, text, checks) {
  for (const [re, ok, bad] of checks) {
    if (re.test(text)) pass(`${label}: ${ok}`);
    else fail(`${label}: ${bad}`);
  }
}

// --- presence ---
for (const [label, path] of [
  ['qdrant-backed deepen harness', harnessPath],
  ['R5 retirement sole-stack status', statusPath],
  ['qdrant-store.prototype harness', prototypeHarness],
  ['qdrant-erase-count-honesty harness', eraseHarness],
  ['proof script', scriptPath],
  ['package.json', packageJsonPath],
  ['retrieval-store.ts', retrievalPath],
  ['vectorstore.proof.ts', vectorstoreProofPath],
  ['run-e2e-isolated.mjs', e2eIsolatedPath],
  ['@meetwise/qdrant-store package.json', qdrantPkg],
  ['compose.mysql-local.yml', composePath],
]) {
  if (existsSync(path)) pass(`${label} present: ${path}`);
  else fail(`${label} missing: ${path}`);
}

// --- harness pins ---
if (existsSync(harnessPath)) {
  const h = readFileSync(harnessPath, 'utf8');
  assertDocPins('harness', h, [
    [/releaseEvidence\s*=\s*false/i, 'releaseEvidence=false', 'must pin releaseEvidence=false'],
    [/Not HA/i, 'Not HA', 'must pin Not HA'],
    [/mysql-stack:qdrant-backed:prove/, 'lists mysql-stack:qdrant-backed:prove', 'must list mysql-stack:qdrant-backed:prove'],
    [/EXIT\s*=\s*3|EXIT=3/, 'pins EXIT=3 PREREQ', 'must pin EXIT=3 when Qdrant PREREQ missing'],
    [/qdrant-store:skeleton:prove/, 'inventories skeleton', 'must inventory qdrant-store:skeleton:prove'],
    [/qdrant-store:erase-honesty:prove/, 'inventories erase-honesty', 'must inventory erase-honesty'],
    [/qdrant-store:g5-erasure:prove|g5-erasure/, 'inventories g5-erasure', 'must inventory g5-erasure'],
    [/qdrant-store:g5-ledger-map:prove|g5-ledger-map|P16/, 'inventories g5-ledger-map P16', 'must inventory g5-ledger-map'],
    [/qdrant-store:vectorstore-adapter:prove|vectorstore-adapter/, 'inventories vectorstore-adapter', 'must inventory vectorstore-adapter'],
    [/vectorstore:qdrant:prove/, 'inventories vectorstore:qdrant:prove opt-in', 'must inventory vectorstore:qdrant:prove'],
    [/rag:qdrant:prove/, 'inventories rag:qdrant:prove opt-in', 'must inventory rag:qdrant:prove'],
    [/memory:qdrant:prove/, 'inventories memory:qdrant:prove opt-in', 'must inventory memory:qdrant:prove'],
    [/vectorstore:prove/, 'inventories vectorstore:prove as GAP', 'must inventory vectorstore:prove'],
    [/memory:prove/, 'inventories memory:prove as GAP', 'must inventory memory:prove'],
    [/rag03|rag-generation|rag\*/, 'inventories rag* as GAP', 'must inventory rag* family'],
    [/pgvector-isolated|pgvector/, 'names pgvector-isolated backing', 'must name pgvector backing for G2 scripts'],
    [/不得.*Qdrant-backed|禁止.*Qdrant-backed|≠ RAG\/memory on Qdrant/i, 'forbids claiming RAG/memory on Qdrant', 'must forbid RAG/memory on Qdrant claim'],
    [/G2/, 'references status G2', 'must reference G2'],
    [/PREREQ/, 'documents PREREQ', 'must document PREREQ for live Qdrant'],
  ]);
}

// --- status Proven vs GAP (G2 still open; new deepen Proven allowed) ---
if (existsSync(statusPath)) {
  const st = readFileSync(statusPath, 'utf8');
  assertDocPins('status', st, [
    [/releaseEvidence\s*=\s*false/i, 'releaseEvidence=false', 'must pin releaseEvidence=false'],
    [/Not HA/i, 'Not HA', 'must pin Not HA'],
    [/Qdrant-backed/, 'mentions Qdrant-backed', 'must mention Qdrant-backed'],
    [/G2/, 'has G2 row', 'must keep G2'],
    [/vector\/RAG\/memory|向量\/RAG\/memory|RAG\/memory/, 'G2 scopes vector/RAG/memory', 'must scope G2 to vector/RAG/memory'],
    [/mysql-stack:qdrant-backed:prove|qdrant-backed:prove/, 'lists qdrant-backed prove CMD', 'must list qdrant-backed:prove in status CMD/Proven'],
    [/qdrant-backed-prove-deepen|qdrant-backed prove 深挖/, 'links deepen harness', 'must link qdrant-backed-prove-deepen harness'],
  ]);
  // G2 must remain explicitly open (not closed / not claimed covered)
  if (/G2[\s\S]{0,200}(仍|GAP|未|not default|未成默认)/i.test(st)
    || /\| G2 \|[\s\S]*?未/.test(st)) {
    pass('status: G2 still open (Qdrant-backed vector/RAG/memory not default)');
  } else {
    fail('status: G2 must remain explicitly open / not default');
  }
}

// --- package.json inventory classify ---
const REQUIRED_QDRANT_NATIVE = [
  'qdrant-store:skeleton:prove',
  'qdrant-store:erase-honesty:prove',
  'qdrant-store:g5-erasure:prove',
  'qdrant-store:g5-ledger-map:prove',
  'qdrant-store:vectorstore-adapter:prove',
  'vectorstore:qdrant:prove',
  'rag:qdrant:prove',
  'memory:qdrant:prove',
];
const REQUIRED_PGVECTOR_ISOLATED = [
  'vectorstore:prove',
  'memory:prove',
  'rag03-route:prove',
  'rag-generation:prove',
  'rag-corpus-version:prove',
];
const REQUIRED_STATIC = [
  'mysql-stack:qdrant-backed:prove',
  'conn-stack:qdrant-backed:prove',
  'mysql-stack:ping:prove',
  'mysql-stack:r5-mark-red:prove',
  'mysql-stack:m4-rag:prove',
];

if (existsSync(packageJsonPath)) {
  const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
  const scripts = pkg.scripts || {};

  const qdrantNative = [];
  const pgvectorIsolated = [];
  const pgvectorLeaf = [];
  const staticOrConn = [];
  const soleAllowlist = [];

  for (const [k, v] of Object.entries(scripts)) {
    const isRel =
      /qdrant/i.test(k)
      || /qdrant/i.test(v)
      || /^vectorstore/.test(k)
      || /^rag/.test(k)
      || /^memory/.test(k)
      || /m4-rag|r5-mark|mysql-stack:ping|conn-stack:ping|qdrant-backed|e2e-isolation:sole-/.test(k);
    if (!isRel) continue;
    if (/E2E_ISOLATION_STACK=mysql-qdrant-redis/.test(v) || /sole-stack:/.test(v) || /^e2e-isolation:sole-/.test(k)) {
      soleAllowlist.push(k);
    } else if (/^qdrant-store:/.test(k) || /packages\/qdrant-store/.test(v)) qdrantNative.push(k);
    else if (/run-e2e-isolated/.test(v)) pgvectorIsolated.push(k);
    else if (/pg-eval|prove:vectorstore|adversarial:pg-eval/.test(k + v)) pgvectorLeaf.push(k);
    else if (/mysql-stack|conn-stack|m4-rag|r5-mark|qdrant-backed|ping/.test(k)) staticOrConn.push(k);
  }

  note(`inventory qdrant-native (${qdrantNative.length}): ${qdrantNative.sort().join(', ') || '(none)'}`);
  note(`inventory sole-allowlist (${soleAllowlist.length}): ${soleAllowlist.sort().join(', ') || '(none)'}`);
  note(`inventory pgvector-isolated (${pgvectorIsolated.length}): ${pgvectorIsolated.sort().join(', ') || '(none)'}`);
  note(`inventory pgvector-leaf (${pgvectorLeaf.length}): ${pgvectorLeaf.sort().join(', ') || '(none)'}`);
  note(`inventory static/conn (${staticOrConn.length}): ${staticOrConn.sort().join(', ') || '(none)'}`);
  const REQUIRED_SOLE_ALLOWLIST = [
    'e2e-isolation:sole-wiring:prove',
    'e2e-isolation:sole-ping:prove',
    'e2e-isolation:sole-qdrant-backed:prove',
    'e2e-isolation:sole-vectorstore-adapter:prove',
    'e2e-isolation:sole-vectorstore-qdrant:prove',
  ];
  for (const name of REQUIRED_SOLE_ALLOWLIST) {
    if (scripts[name] && /E2E_ISOLATION_STACK=mysql-qdrant-redis/.test(scripts[name])) {
      pass(`package.json: ${name} is sole-allowlist (mysql-qdrant-redis)`);
    } else fail(`package.json: missing sole-allowlist script ${name}`);
  }

  for (const name of REQUIRED_QDRANT_NATIVE) {
    if (scripts[name] && (/qdrant-store/.test(scripts[name]) || /packages\/qdrant-store/.test(scripts[name]))) {
      pass(`package.json: ${name} is qdrant-native`);
    } else fail(`package.json: ${name} must be wired to packages/qdrant-store`);
  }
  for (const name of REQUIRED_PGVECTOR_ISOLATED) {
    if (scripts[name] && /run-e2e-isolated/.test(scripts[name])) {
      pass(`package.json: ${name} still pgvector-isolated (G2 GAP — not Qdrant default)`);
    } else fail(`package.json: ${name} must remain run-e2e-isolated (honest G2 GAP pin)`);
  }
  for (const name of REQUIRED_STATIC) {
    if (scripts[name]) pass(`package.json: ${name} wired`);
    else fail(`package.json: missing ${name}`);
  }
  if (scripts['rag:adversarial:pg-eval']) {
    pass('package.json: rag:adversarial:pg-eval kept as pgvector leaf (≠ Qdrant-backed)');
  } else fail('package.json: must keep rag:adversarial:pg-eval');

  // Hard: default vectorstore/rag/memory must NOT route to qdrant-store;
  // allow only explicit opt-in *(vectorstore|rag|memory):qdrant* (P12/P13; ≠ G2 closed)
  for (const [k, v] of Object.entries(scripts)) {
    if (!/^(vectorstore|memory|rag)/.test(k)) continue;
    if (!/qdrant-store|packages\/qdrant-store/.test(v)) continue;
    if (/^(vectorstore|rag|memory):qdrant(:|$)/.test(k)) {
      pass(`package.json: ${k} allowed as explicit opt-in Qdrant prove (P12/P13)`);
      continue;
    }
    fail(`package.json: ${k} must NOT route to qdrant-store yet (would fake G2 close)`);
  }
  pass('package.json: only *(vectorstore|rag|memory):qdrant* may route to qdrant-store among vector/rag/memory (G2 not silently closed)');
  if (scripts['e2e-isolation:sole-rag-qdrant:prove'] || scripts['e2e-isolation:sole-memory-qdrant:prove']) {
    fail('package.json: P13 must NOT add e2e-isolation:sole-rag/memory-qdrant (standalone opt-in only)');
  } else {
    pass('package.json: no sole-rag/memory-qdrant allowlist scripts (P13 standalone only)');
  }
}

// --- live path integrity (no production cut) ---
if (existsSync(retrievalPath)) {
  const retrieval = readFileSync(retrievalPath, 'utf8');
  if (/export async function annSearch/.test(retrieval)) {
    pass('retrieval-store.ts: annSearch intact (不切向量真相)');
  } else fail('retrieval-store.ts: must keep export async function annSearch');
}
if (existsSync(vectorstoreProofPath)) {
  const vs = readFileSync(vectorstoreProofPath, 'utf8');
  if (/pgvector/.test(vs) && /E2E_PG_IMAGE|run-e2e-isolated|假绿|BUG-FAKE-R5/.test(vs)) {
    pass('vectorstore.proof.ts still pgvector-bound + marked-red honesty');
  } else fail('vectorstore.proof.ts must stay pgvector-bound with honesty marker');
}
if (existsSync(e2eIsolatedPath)) {
  const e2e = readFileSync(e2eIsolatedPath, 'utf8');
  if (/E2E_ISOLATION_STACK/.test(e2e) && /pgvector-legacy/.test(e2e) && /mysql-qdrant-redis/.test(e2e)) {
    pass('run-e2e-isolated.mjs dual-track names present');
  } else fail('run-e2e-isolated.mjs must dual-track pgvector-legacy|mysql-qdrant-redis');
  if (/SOLE_STACK/.test(e2e) && /process\.exit\(3\)/.test(e2e) && /PREREQ|GAP/.test(e2e)
    && /SOLE_WIRING_ALLOWLIST/.test(e2e)
    && /sole-stack:wiring:prove/.test(e2e)
    && /sole-stack:vectorstore-adapter:prove/.test(e2e)
    && !/sole-stack:rag-qdrant:prove/.test(e2e)
    && !/sole-stack:memory-qdrant:prove/.test(e2e)) {
    pass('run-e2e-isolated.mjs sole non-allowlist fail-closed EXIT=3 + allowlist present (P13 rag/memory NOT allowlisted)');
  } else fail('run-e2e-isolated.mjs sole must fail-closed EXIT=3 and must NOT allowlist rag/memory-qdrant');
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
      fail(`run-e2e-isolated.mjs: sole allowlist must be exactly dual-approved 5 (got ${items.length}: ${items.join(',')})`);
    } else {
      pass('run-e2e-isolated.mjs: sole allowlist exactly 5 dual-approved (P12 sole; P13 OFF allowlist)');
    }
  }
  if (/E2E_PG_IMAGE/.test(e2e) && /pgvector\/pgvector/.test(e2e)) {
    pass('run-e2e-isolated.mjs E2E_PG_IMAGE / pgvector intact');
  } else fail('run-e2e-isolated.mjs must keep E2E_PG_IMAGE / pgvector');
}

if (existsSync(qdrantPkg)) {
  const qp = JSON.parse(readFileSync(qdrantPkg, 'utf8'));
  const qs = qp.scripts || {};
  if (qs['prove:skeleton'] && qs['prove:erase-honesty'] && qs['prove:g5-erasure'] && qs['prove:g5-ledger-map'] && qs['prove:vectorstore-adapter']
    && qs['prove:vectorstore-qdrant'] && qs['prove:rag-qdrant'] && qs['prove:memory-qdrant']) {
    pass('@meetwise/qdrant-store exposes prove:skeleton + erase-honesty + g5-erasure + g5-ledger-map + vectorstore-adapter + vectorstore/rag/memory-qdrant');
  } else fail('@meetwise/qdrant-store must expose prove:skeleton + erase-honesty + g5-erasure + g5-ledger-map + vectorstore-adapter + vectorstore/rag/memory-qdrant');
}

if (existsSync(composePath)) {
  const c = readFileSync(composePath, 'utf8');
  if (/qdrant:/i.test(c) && /6333/.test(c)) pass('compose.mysql-local.yml defines qdrant :6333');
  else fail('compose.mysql-local.yml must define qdrant service on 6333');
}

// --- live Qdrant readyz (fail-closed PREREQ) ---
let qdrantOk = false;
if (which('curl')) {
  const q = run('curl', ['-sf', QDRANT_READYZ]);
  qdrantOk = q.status === 0;
} else {
  prereqFail('curl unavailable for qdrant readyz');
}
if (qdrantOk) {
  pass(`qdrant readyz OK @ ${QDRANT_READYZ}`);
} else if (which('curl')) {
  prereqFail(`qdrant readyz failed @ ${QDRANT_READYZ}`);
  prereqFail('docker compose -f docker/compose.mysql-local.yml up -d qdrant');
  prereqFail('wait until curl -sf http://127.0.0.1:6333/readyz succeeds');
  note('refuse silent fake-green: Qdrant connect not covered without /readyz');
}

note('COVERED (this prove): inventory classify + Qdrant /readyz connect pin when EXIT=0');
note('STILL-GAP G2: vectorstore/rag*/memory* default proves remain pgvector-isolated — NOT claimed Qdrant-backed');
note('STILL-GAP: G1 default isolation · G4 R4 · G5 erasure ledger · G7 HA/releaseEvidence');
note('releaseEvidence=false; Not HA; 本绿≠已迁; ≠ cutover; ≠ fixtures retired; ≠ RAG/memory on Qdrant');
note('related: pnpm qdrant-store:skeleton|erase-honesty|vectorstore-adapter:prove + vectorstore:qdrant:prove are additive / G2 sub-slices only (≠ RAG cutover; ≠ G2 closed)');

for (const line of lines) console.log(line);
console.log(`CMD=node ${scriptPath} EXIT=${exitCode}`);
process.exit(exitCode);
