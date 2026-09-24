#!/usr/bin/env node
/**
 * BUG-FAKE-R5 mark-red prove — static eval-honesty only.
 * Pins: harness + e2e-case-inventory family (not single-point) + warning strings
 * + vectorstore:prove still present (marked-red ≠ deleted)
 * + E2E_PG_IMAGE documented as NOT sole-stack truth
 * + dual-track E2E_ISOLATION_STACK (pgvector-legacy default; mysql-qdrant-redis sole target)
 * + r5-retirement-sole-stack-status Proven vs GAP; local green ≠ HA
 * + need multi-instance + fault-inject for releaseEvidence
 * + this prove must NOT pretend to be full E2E / must NOT expand production.
 * HARD: do not cut production vector paths; do not claim RAG migrated / HA / cutover.
 * releaseEvidence=false · Not HA · 本绿≠已迁 · pass≠cutover · local green ≠ HA
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const harnessPath = join(root, 'ai-docs/delivery/harness/r5-pgvector-fixture-mark-red.md');
const inventoryPath = join(root, 'ai-docs/delivery/e2e-case-inventory.md');
const scriptPath = join(root, 'scripts/conn-stack/mysql-stack.r5-mark-red.proof.mjs');
const planPath = join(root, 'ai-docs/delivery/m5-pgvector-fixture-retirement-plan.md');
const statusPath = join(root, 'ai-docs/delivery/harness/r5-retirement-sole-stack-status.md');
const backlogPath = join(root, 'ai-docs/delivery/gap-bug-backlog.md');
const vectorstoreProofPath = join(root, 'packages/db/test/vectorstore.proof.ts');
const e2eIsolatedPath = join(root, 'scripts/run-e2e-isolated.mjs');
const soleWiringPath = join(root, 'scripts/conn-stack/mysql-stack.sole-wiring.proof.mjs');
const perfSuitePath = join(root, 'scripts/run-e2e-performance-suite.mjs');
const packageJsonPath = join(root, 'package.json');
const retrievalPath = join(root, 'packages/db/src/retrieval-store.ts');
const adversarialPgEvalPath = join(root, 'apps/worker/smoke/rag-adversarial-pg-eval.ts');
const qbankRetrievalEvalPgPath = join(root, 'apps/worker/test/qbank-retrieval-eval-pg.proof.ts');

let exitCode = 0;
const lines = [];
function fail(msg) { lines.push(`FAIL  ${msg}`); exitCode = 1; }
function pass(msg) { lines.push(`PASS  ${msg}`); }

for (const [label, path] of [
  ['R5 mark-red harness', harnessPath],
  ['e2e-case-inventory', inventoryPath],
  ['proof script', scriptPath],
  ['M5 fixture retirement plan', planPath],
  ['R5 retirement sole-stack status', statusPath],
  ['gap-bug-backlog', backlogPath],
  ['vectorstore.proof.ts', vectorstoreProofPath],
  ['run-e2e-isolated.mjs', e2eIsolatedPath],
  ['mysql-stack.sole-wiring.proof.mjs', soleWiringPath],
  ['run-e2e-performance-suite.mjs', perfSuitePath],
  ['package.json', packageJsonPath],
  ['retrieval-store.ts', retrievalPath],
  ['rag-adversarial-pg-eval.ts', adversarialPgEvalPath],
  ['qbank-retrieval-eval-pg.proof.ts', qbankRetrievalEvalPgPath],
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
    [/Not HA|非 HA/i, 'Not HA', 'must pin Not HA'],
    [/本绿\s*≠\s*已迁/, '本绿≠已迁', 'must pin 本绿≠已迁'],
    [/marked-red\s*≠\s*deleted|不删/, 'marked-red ≠ deleted', 'must pin marked-red ≠ deleted'],
    [/mysql-stack:r5-mark-red:prove/, 'lists prove CMD', 'must list mysql-stack:r5-mark-red:prove'],
    [/不得冒充/, 'pins 不得冒充', 'must pin 不得冒充（eval honesty）'],
    [/整套 E2E 家族|E2E 家族/, 'pins 整套 E2E 家族（非单点）', 'must pin 整套 E2E 家族 not single-point'],
    [/vectorstore:prove/, 'inventories vectorstore:prove', 'must inventory vectorstore:prove'],
    [/rag03|rag07|rag:adversarial:pg-eval/, 'inventories rag* family', 'must inventory rag* family'],
    [/memory:prove/, 'inventories memory family', 'must inventory memory family'],
    [/e2e:isolated/, 'inventories e2e:isolated', 'must inventory e2e:isolated'],
    [/禁止冒充|不得.*冒充.*完整 E2E|不得冒充完整 E2E/, 'forbids pretending full E2E', 'must forbid skeleton/static prove冒充完整 E2E'],
    [/不扩生产|不切生产向量|不切.*向量/, 'no production expansion / no vector cut', 'must forbid production expansion / vector cut'],
    [/不宣称 RAG 已迁/, 'forbids claiming RAG migrated', 'must forbid claiming RAG migrated'],
    [/非 isolated 叶子|rag:adversarial:pg-eval/, 'lists non-isolated / pg-eval leaf', 'must list non-isolated rag:adversarial:pg-eval leaf'],
    [/rag-adversarial-pg-eval\.ts/, 'lists rag-adversarial-pg-eval.ts path', 'must list rag-adversarial-pg-eval.ts'],
    [/qbank-retrieval-eval-pg\.proof\.ts/, 'lists qbank-retrieval-eval-pg.proof.ts', 'must list qbank-retrieval-eval-pg.proof.ts'],
    [/memory:prove/i, 'lists perf memory:prove marked leaf', 'must list memory:prove among marked perf leaves'],
    [/rag-generation:prove/, 'lists perf rag-generation marked leaf', 'must list rag-generation among marked perf leaves'],
    [/rag-cache:prove/, 'lists perf rag-cache marked leaf', 'must list rag-cache among marked perf leaves'],
    [/多行.*LEGACY\/R5-MARKED-RED|不止 vectorstore/, 'pins multi-step perf R5 marks', 'must pin multi-step (not only vectorstore) perf R5 marks'],
  ]);
  // Fix the broken check above for E2E_PG_IMAGE - redo explicitly
}

// Re-check E2E_PG_IMAGE cleanly (previous tuple had a bug with .source)
if (existsSync(harnessPath)) {
  const h = readFileSync(harnessPath, 'utf8');
  if (/E2E_PG_IMAGE/.test(h) && /NOT sole-stack|≠ sole-stack|非 sole-stack/i.test(h)) {
    pass('harness: E2E_PG_IMAGE NOT sole-stack (explicit)');
  } else {
    fail('harness: must document E2E_PG_IMAGE as NOT sole-stack (explicit)');
  }
}

if (existsSync(harnessPath)) {
  const h = readFileSync(harnessPath, 'utf8');
  assertDocPins('harness-dual-track', h, [
    [/E2E_ISOLATION_STACK/, 'pins E2E_ISOLATION_STACK dual-track', 'must pin E2E_ISOLATION_STACK dual-track'],
    [/pgvector-legacy/, 'pins pgvector-legacy track', 'must pin pgvector-legacy track'],
    [/mysql-qdrant-redis/, 'pins mysql-qdrant-redis sole track', 'must pin mysql-qdrant-redis sole track'],
    [/禁默认可假绿|不得.*默认可假绿|forbid.*silent/i, 'forbids silent fake-green', 'must forbid silent pgvector fake-green'],
    [/local green\s*≠\s*HA|本绿\s*≠\s*HA/i, 'local green ≠ HA', 'must pin local green ≠ HA'],
    [/multi-instance.*fault-inject|fault-inject.*releaseEvidence/i, 'need multi-instance + fault-inject for releaseEvidence', 'must pin multi-instance + fault-inject for releaseEvidence'],
    [/r5-retirement-sole-stack-status/, 'links sole-stack status', 'must link r5-retirement-sole-stack-status'],
    [/Proven vs GAP|Proven.*GAP/, 'has Proven vs GAP summary', 'must summarize Proven vs GAP'],
  ]);
}

if (existsSync(statusPath)) {
  const st = readFileSync(statusPath, 'utf8');
  assertDocPins('status', st, [
    [/releaseEvidence\s*=\s*false/i, 'releaseEvidence=false', 'must pin releaseEvidence=false'],
    [/Not HA/i, 'Not HA', 'must pin Not HA'],
    [/MySQL\s*\+\s*Qdrant\s*\+\s*Redis/, 'sole stack MySQL+Qdrant+Redis', 'must pin sole stack MySQL+Qdrant+Redis'],
    [/## 1\. Proven|Proven（/, 'has Proven section', 'must have Proven section'],
    [/## 2\. GAP|GAP（/, 'has GAP section', 'must have GAP section'],
    [/isolated.*pgvector-legacy|默认仍.*pgvector-legacy|仍 `pgvector-legacy`/i, 'GAP: isolated default still pgvector-legacy', 'must GAP-pin isolated default still legacy'],
    [/Qdrant-backed/, 'GAP: Qdrant-backed proves', 'must GAP-pin Qdrant-backed'],
    [/local green\s*≠\s*HA/i, 'local green ≠ HA', 'must pin local green ≠ HA'],
    [/multi-instance/, 'pins multi-instance', 'must pin multi-instance'],
    [/fault-inject/, 'pins fault-inject', 'must pin fault-inject'],
    [/E2E_ISOLATION_STACK/, 'dual-track env', 'must document E2E_ISOLATION_STACK'],
    [/pgvector-legacy/, 'legacy track name', 'must name pgvector-legacy'],
    [/mysql-qdrant-redis/, 'sole track name', 'must name mysql-qdrant-redis'],
    [/north-star-ha/, 'north-star parallel link', 'must link north-star-ha'],
    [/不得.*HA|禁止.*HA|≠ HA/, 'forbids HA claim', 'must forbid HA claim'],
    [/≠ cutover|≠ migrated|≠ covered/i, 'forbids cutover/migrated/covered', 'must forbid cutover/migrated/covered claims'],
    [/P8|allowlist|sole-stack:wiring:prove|sole-stack:vectorstore-qdrant:prove/, 'Proven P8 sole allowlist (wiring+expand+P12)', 'must Proven-pin sole allowlist wiring/expand (P8)'],
    [/P13|rag:qdrant:prove|memory:qdrant:prove/, 'Proven P13 rag/memory:qdrant opt-in slices', 'must Proven-pin P13 rag/memory:qdrant'],
    [/P15|g5-erasure:prove|subject-scoped Qdrant erase/, 'Proven P15 G5 subject erase slice', 'must Proven-pin P15 g5-erasure'],
    [/P16|g5-ledger-map:prove|schema\/mapping|ledger-map/, 'Proven P16 G5 ledger-map / PREREQ slice', 'must Proven-pin P16 g5-ledger-map'],
    [/G5.*0091|recall=0\+receipt ≠ 0091|erasure ledger/, 'GAP G5 erasure ledger (≠ 0091)', 'must GAP-pin G5 erasure ledger'],
    [/EXIT=3|PREREQ/, 'CMD pins non-allowlist EXIT=3 / PREREQ', 'must CMD-pin non-allowlist sole EXIT=3'],
  ]);
}

if (existsSync(inventoryPath)) {
  const inv = readFileSync(inventoryPath, 'utf8');
  assertDocPins('e2e-case-inventory', inv, [
    [/BUG-FAKE-R5/, 'references BUG-FAKE-R5', 'must reference BUG-FAKE-R5'],
    [/R5 假绿家族|假绿家族/, 'names R5 假绿家族', 'must name R5 假绿家族'],
    [/不得冒充的需求满足|不得冒充/, 'pins 不得冒充的需求满足', 'must pin 不得冒充的需求满足'],
    [/run-e2e-isolated|E2E_PG_IMAGE/, 'pins isolation root', 'must pin run-e2e-isolated / E2E_PG_IMAGE'],
    [/vectorstore:prove/, 'lists vectorstore:prove', 'must list vectorstore:prove'],
    [/rag03|rag07|rag:adversarial/, 'lists rag family', 'must list rag family'],
    [/memory:prove/, 'lists memory family', 'must list memory family'],
    [/e2e:isolated/, 'lists e2e:isolated', 'must list e2e:isolated'],
    [/performance|R5-MARKED-RED/, 'lists performance marked-red row', 'must list performance R5-MARKED-RED'],
    [/禁止.*skeleton\/ping|不是.*E2E|冒充.*完整 E2E/, 'forbids skeleton/ping as E2E', 'must forbid skeleton/ping冒充完整 E2E'],
    [/整套|家族/, 'family scope not single-point', 'must scope to family not single-point'],
    [/releaseEvidence\s*=\s*false/i, 'releaseEvidence=false', 'must pin releaseEvidence=false'],
  ]);
}

if (existsSync(vectorstoreProofPath)) {
  const vs = readFileSync(vectorstoreProofPath, 'utf8');
  if (/BUG-FAKE-R5|marked-red|假绿/.test(vs) && /pgvector/.test(vs)) {
    pass('vectorstore.proof.ts: BUG-FAKE-R5 / marked-red / fake-green warning');
  } else fail('vectorstore.proof.ts: must carry BUG-FAKE-R5 marked-red warning');
  if (/本绿≠已迁|≠ RAG migrated|green ≠ RAG/.test(vs)) {
    pass('vectorstore.proof.ts: green ≠ RAG migrated');
  } else fail('vectorstore.proof.ts: must pin green ≠ RAG migrated');
  if (/E2E_PG_IMAGE/.test(vs) && /sole-stack/.test(vs)) {
    pass('vectorstore.proof.ts: E2E_PG_IMAGE ≠ sole-stack');
  } else fail('vectorstore.proof.ts: must document E2E_PG_IMAGE ≠ sole-stack');
  if (/annSearchLegacy|pgvector HNSW/.test(vs)) {
    pass('vectorstore.proof.ts still present (marked-red ≠ deleted)');
  } else fail('vectorstore.proof.ts must remain (not deleted)');
}

if (existsSync(e2eIsolatedPath)) {
  const e2e = readFileSync(e2eIsolatedPath, 'utf8');
  if (/R5-MARKED-RED/.test(e2e) && /NOT sole-stack truth/.test(e2e)) {
    pass('run-e2e-isolated.mjs: R5-MARKED-RED / NOT sole-stack truth banner');
  } else fail('run-e2e-isolated.mjs: must emit R5-MARKED-RED banner');
  if (/E2E_PG_IMAGE/.test(e2e) && /pgvector\/pgvector:pg16/.test(e2e)) {
    pass('run-e2e-isolated.mjs: still defaults E2E_PG_IMAGE to pgvector (not cut)');
  } else fail('run-e2e-isolated.mjs: must still default E2E_PG_IMAGE to pgvector');
  if (/本绿≠已迁|≠ RAG migrated/.test(e2e)) {
    pass('run-e2e-isolated.mjs: 本绿≠已迁');
  } else fail('run-e2e-isolated.mjs: must pin 本绿≠已迁');
  if (/E2E_ISOLATION_STACK/.test(e2e) && /pgvector-legacy/.test(e2e) && /mysql-qdrant-redis/.test(e2e)) {
    pass('run-e2e-isolated.mjs: dual-track E2E_ISOLATION_STACK (legacy + sole names)');
  } else fail('run-e2e-isolated.mjs: must dual-track E2E_ISOLATION_STACK=pgvector-legacy|mysql-qdrant-redis');
  if (/local green ≠ HA|need multi-instance \+ fault-inject for releaseEvidence/.test(e2e)) {
    pass('run-e2e-isolated.mjs: local green ≠ HA / multi-instance+fault-inject');
  } else fail('run-e2e-isolated.mjs: must pin local green ≠ HA and multi-instance+fault-inject');
  if (/SOLE_WIRING_ALLOWLIST/.test(e2e)
    && /sole-stack:wiring:prove/.test(e2e)
    && /sole-stack:ping:prove/.test(e2e)
    && /sole-stack:qdrant-backed:prove/.test(e2e)
    && /sole-stack:vectorstore-adapter:prove/.test(e2e)
    && /sole-stack:vectorstore-qdrant:prove/.test(e2e)
    && !/sole-stack:rag-qdrant:prove/.test(e2e)
    && !/sole-stack:memory-qdrant:prove/.test(e2e)) {
    pass('run-e2e-isolated.mjs: sole allowlist wiring+ping+qdrant-backed+adapter+vectorstore-qdrant (P13 rag/memory NOT on allowlist)');
  } else fail('run-e2e-isolated.mjs: must allowlist wiring/ping/qdrant-backed/vectorstore-adapter/vectorstore-qdrant and NOT rag/memory-qdrant');
  // Honesty: dual-approved sole allowlist is exactly 5; P13 rag/memory-qdrant OFF allowlist
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
    else if (items.length !== 5 || expected.some((e) => !items.includes(e))
      || items.some((i) => /rag-qdrant|memory-qdrant/.test(i))) {
      fail(`run-e2e-isolated.mjs: sole allowlist must be exactly dual-approved 5 (got ${items.length}: ${items.join(',')})`);
    } else if (/rag0|memory:prove|vectorstore:prove|e2e:prove|migrate:prove/.test(block)) {
      fail('run-e2e-isolated.mjs: sole allowlist must NOT include rag/memory/vectorstore/e2e/migrate defaults');
    } else {
      pass('run-e2e-isolated.mjs: sole allowlist exactly 5 dual-approved (P13 rag/memory OFF allowlist)');
    }
  }
  if (/SOLE_WIRING_PREREQS/.test(e2e) && /process\.exit\(3\)/.test(e2e) && /PREREQ/.test(e2e)) {
    pass('run-e2e-isolated.mjs: non-allowlist sole fails closed EXIT=3 with PREREQ (no fake-green)');
  } else fail('run-e2e-isolated.mjs: non-allowlist sole must EXIT=3 with PREREQ checklist');
  if (/R5-SOLE-WIRING/.test(e2e) && /compose\.mysql-local/.test(e2e)) {
    pass('run-e2e-isolated.mjs: sole allowlist uses compose.mysql-local (shared ≠ disposable)');
  } else fail('run-e2e-isolated.mjs: sole allowlist path must cite compose.mysql-local');
}

if (existsSync(perfSuitePath)) {
  const perf = readFileSync(perfSuitePath, 'utf8');
  if (/R5-MARKED-RED|LEGACY\/R5-MARKED-RED/.test(perf) && /vectorstore:prove/.test(perf)) {
    pass('performance suite: pgvector/vectorstore row R5-MARKED-RED');
  } else fail('performance suite: must mark vectorstore row R5-MARKED-RED');
  if (/≠ RAG migrated|≠ sole-stack/.test(perf)) {
    pass('performance suite: ≠ RAG migrated / ≠ sole-stack');
  } else fail('performance suite: must pin ≠ RAG migrated / ≠ sole-stack');
  // More than vectorstore: require additional pgvector-bound steps marked
  const markedStepRe = /\['LEGACY\/R5-MARKED-RED[^']*',\s*\[[^\]]+\]\]/g;
  const markedSteps = perf.match(markedStepRe) || [];
  if (markedSteps.length >= 4) {
    pass(`performance suite: ${markedSteps.length} LEGACY/R5-MARKED-RED steps (not only vectorstore)`);
  } else {
    fail(`performance suite: need ≥4 LEGACY/R5-MARKED-RED steps where pgvector-bound (found ${markedSteps.length})`);
  }
  for (const leaf of ['memory:prove', 'rag-generation:prove', 'rag-corpus-version:prove', 'qbank-control-role:prove', 'rag-cache:prove']) {
    if (perf.includes(leaf) && markedSteps.some((s) => s.includes(leaf))) {
      pass(`performance suite: ${leaf} carries LEGACY/R5-MARKED-RED`);
    } else {
      fail(`performance suite: ${leaf} must carry LEGACY/R5-MARKED-RED`);
    }
  }
}

if (existsSync(adversarialPgEvalPath)) {
  const adv = readFileSync(adversarialPgEvalPath, 'utf8');
  if (/R5-MARKED-RED/.test(adv) && (/fake-green|假绿/.test(adv))) {
    pass('rag-adversarial-pg-eval.ts: R5-MARKED-RED / fake-green NOTE');
  } else fail('rag-adversarial-pg-eval.ts: must carry R5-MARKED-RED / fake-green NOTE (non-isolated leaf)');
  if (/BUG-FAKE-R5/.test(adv) && (/本绿≠已迁|≠ RAG migrated/.test(adv))) {
    pass('rag-adversarial-pg-eval.ts: BUG-FAKE-R5 / 本绿≠已迁');
  } else fail('rag-adversarial-pg-eval.ts: must pin BUG-FAKE-R5 / 本绿≠已迁');
  if (/non-isolated|不经.*isolated|not via.*run-e2e-isolated/i.test(adv)) {
    pass('rag-adversarial-pg-eval.ts: documents non-isolated leaf');
  } else fail('rag-adversarial-pg-eval.ts: must document non-isolated leaf');
}

if (existsSync(qbankRetrievalEvalPgPath)) {
  const qe = readFileSync(qbankRetrievalEvalPgPath, 'utf8');
  if (/R5-MARKED-RED/.test(qe) && (/fake-green|假绿/.test(qe))) {
    pass('qbank-retrieval-eval-pg.proof.ts: R5-MARKED-RED / fake-green NOTE');
  } else fail('qbank-retrieval-eval-pg.proof.ts: must carry R5-MARKED-RED / fake-green NOTE');
  if (/BUG-FAKE-R5/.test(qe) && (/本绿≠已迁|≠ RAG migrated/.test(qe))) {
    pass('qbank-retrieval-eval-pg.proof.ts: BUG-FAKE-R5 / 本绿≠已迁');
  } else fail('qbank-retrieval-eval-pg.proof.ts: must pin BUG-FAKE-R5 / 本绿≠已迁');
}

if (existsSync(packageJsonPath)) {
  const pkg = readFileSync(packageJsonPath, 'utf8');
  if (/mysql-stack:r5-mark-red:prove/.test(pkg) && /mysql-stack\.r5-mark-red\.proof\.mjs/.test(pkg)) {
    pass('package.json: mysql-stack:r5-mark-red:prove wired');
  } else fail('package.json: must pin mysql-stack:r5-mark-red:prove');
  if (/"vectorstore:prove"/.test(pkg) && /run-e2e-isolated\.mjs vectorstore:prove:raw/.test(pkg)) {
    pass('package.json: vectorstore:prove kept (≠ deleted)');
  } else fail('package.json: must keep vectorstore:prove');
  if (/"vectorstore:prove:legacy"/.test(pkg)) {
    pass('package.json: vectorstore:prove:legacy alias');
  } else fail('package.json: must expose vectorstore:prove:legacy');
  if (/"rag:adversarial:pg-eval"/.test(pkg)) {
    pass('package.json: rag:adversarial:pg-eval kept');
  } else fail('package.json: must keep rag:adversarial:pg-eval');
  if (/mysql-stack:sole-wiring:prove/.test(pkg) && /e2e-isolation:sole-wiring:prove/.test(pkg)) {
    pass('package.json: sole-wiring prove scripts wired');
  } else fail('package.json: must wire mysql-stack:sole-wiring:prove + e2e-isolation:sole-wiring:prove');
  if (/e2e-isolation:sole-vectorstore-qdrant:prove/.test(pkg)
    && /sole-stack:vectorstore-qdrant:prove/.test(pkg)) {
    pass('package.json: e2e-isolation:sole-vectorstore-qdrant:prove wired (P12 allowlist)');
  } else fail('package.json: must wire e2e-isolation:sole-vectorstore-qdrant:prove');
  if (/rag:qdrant:prove/.test(pkg) && /memory:qdrant:prove/.test(pkg)
    && !/e2e-isolation:sole-rag-qdrant:prove/.test(pkg)
    && !/e2e-isolation:sole-memory-qdrant:prove/.test(pkg)) {
    pass('package.json: rag/memory:qdrant:prove standalone opt-in only (NOT sole allowlist)');
  } else fail('package.json: P13 must be standalone rag/memory:qdrant:prove without sole allowlist scripts');
}

if (existsSync(retrievalPath)) {
  const retrieval = readFileSync(retrievalPath, 'utf8');
  if (/export async function annSearch/.test(retrieval) && /pgvector|annSearchLegacy/.test(retrieval)) {
    pass('retrieval-store.ts: annSearch/pgvector serving kept (no production cut)');
  } else fail('retrieval-store.ts: HARD do not cut production vector paths');
}

if (existsSync(backlogPath)) {
  const bl = readFileSync(backlogPath, 'utf8');
  if (/BUG-FAKE-R5/.test(bl) && /INFLIGHT.*mark-red|mark-red|标红/.test(bl)) {
    pass('gap-bug-backlog: BUG-FAKE-R5 INFLIGHT/mark-red note');
  } else fail('gap-bug-backlog: BUG-FAKE-R5 must note INFLIGHT mark-red');
  if (/e2e-case-inventory/.test(bl) || /r5-pgvector-fixture-mark-red/.test(bl)
    || /mysql-stack:r5-mark-red:prove/.test(bl)) {
    pass('gap-bug-backlog: BUG-FAKE-R5 points at harness/inventory/prove');
  } else {
    // soft: still require update — fail so we update backlog
    fail('gap-bug-backlog: BUG-FAKE-R5 harness path should cite r5-mark-red / e2e-case-inventory');
  }
}


if (existsSync(soleWiringPath)) {
  const sw = readFileSync(soleWiringPath, 'utf8');
  if (/releaseEvidence\s*=\s*false/i.test(sw) && /Not HA/i.test(sw)) {
    pass('sole-wiring.proof: releaseEvidence=false / Not HA');
  } else fail('sole-wiring.proof: must pin releaseEvidence=false / Not HA');
  if (/≠ fixtures retired|fixtures_retired/.test(sw) && /≠ disposable|disposable/.test(sw)) {
    pass('sole-wiring.proof: forbids fixtures retired / disposable overclaim');
  } else fail('sole-wiring.proof: must forbid fixtures retired / disposable overclaim');
  if (/33069/.test(sw) && /63809/.test(sw) && /6333/.test(sw)) {
    pass('sole-wiring.proof: pins compose ports 33069/63809/6333');
  } else fail('sole-wiring.proof: must pin compose ports 33069/63809/6333');
  if (/sole-stack-receipts/.test(sw)) {
    pass('sole-wiring.proof: writes .tmp/sole-stack-receipts receipt');
  } else fail('sole-wiring.proof: must write sole-stack-receipts');
}

lines.push('NOTE  EXIT=0 ⇒ mark-red eval-honesty pins only; 本绿≠已迁; ≠ RAG migrated; ≠ full E2E; ≠ fixtures retired; releaseEvidence=false; Not HA');
lines.push('NOTE  dual-track: default E2E_ISOLATION_STACK=pgvector-legacy; sole allowlist wiring/ping/qdrant-backed/adapter/vectorstore-qdrant may EXIT=0; P13 rag/memory:qdrant = standalone package scripts (NOT allowlist); default rag/memory/vectorstore:prove still EXIT=3; G2 still OPEN');
lines.push('NOTE  local green ≠ HA; need multi-instance + fault-inject for releaseEvidence; ≠ covered/cutover');
lines.push('NOTE  mysql-stack:r5-mark-red:prove must NOT冒充完整 E2E — mw-e2e-ha + mw-rag-route review via inventory + r5-retirement-sole-stack-status');

for (const line of lines) console.log(line);
console.log(`CMD=node ${scriptPath} EXIT=${exitCode}`);
process.exit(exitCode);
