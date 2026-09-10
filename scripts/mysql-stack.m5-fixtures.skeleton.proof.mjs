#!/usr/bin/env node
/**
 * M5 pgvector fixture retirement plan prove — static only.
 * Checks m5-pgvector-fixture-retirement-plan.md exists and pins:
 *   不切向量真相 / 本绿≠已迁 / pass≠cutover / MySQL+Qdrant+Redis sole stack /
 *   R5 fake-green / R4 isolation NOT closed (M4/M5 gate) /
 *   Qdrant erasure sink recall=0 + per-sink receipt before cutover /
 *   inventory of vectorstore:prove / rag* / memory* / run-e2e-isolated E2E_PG_IMAGE /
 *   Qdrant-backed or marked-red retirement target /
 *   releaseEvidence=false / Not HA / 禁止自批 cutover
 * Not HA. Does not start containers, cut vector truth / pgvector serving / retrieval,
 * swap fixtures, touch .env*, or self-approve cutover.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const docPath = join(root, 'ai-docs/delivery/m5-pgvector-fixture-retirement-plan.md');
const scriptPath = join(root, 'scripts/mysql-stack.m5-fixtures.skeleton.proof.mjs');
const adrPath = join(root, 'ai-docs/delivery/adr-mysql-qdrant-local.md');
const m4Path = join(root, 'ai-docs/delivery/m4-rag-hard-gates.md');
const retrievalPath = join(root, 'packages/db/src/retrieval-store.ts');
const vectorstoreProofPath = join(root, 'packages/db/test/vectorstore.proof.ts');
const e2eIsolatedPath = join(root, 'scripts/run-e2e-isolated.mjs');
const packageJsonPath = join(root, 'package.json');

let exitCode = 0;
const lines = [];

function fail(msg) {
  lines.push(`FAIL  ${msg}`);
  exitCode = 1;
}

function pass(msg) {
  lines.push(`PASS  ${msg}`);
}

for (const [label, path] of [
  ['M5 fixture retirement plan', docPath],
  ['proof script', scriptPath],
  ['ADR mysql-qdrant-local', adrPath],
  ['M4 hard-gates doc', m4Path],
  ['retrieval-store.ts', retrievalPath],
  ['vectorstore.proof.ts', vectorstoreProofPath],
  ['run-e2e-isolated.mjs', e2eIsolatedPath],
  ['package.json', packageJsonPath],
]) {
  if (existsSync(path)) pass(`${label} present: ${path}`);
  else fail(`${label} missing: ${path}`);
}

// Production retrieval / vector truth must remain (do not cut this slice)
if (existsSync(retrievalPath)) {
  const retrieval = readFileSync(retrievalPath, 'utf8');
  if (/export async function annSearch/.test(retrieval) && /pgvector|annSearchLegacy/.test(retrieval)) {
    pass('retrieval-store.ts still exports annSearch / pgvector serving path (vector truth not cut)');
  } else {
    fail('retrieval-store.ts must keep annSearch / pgvector serving path this slice (do not cut vector truth)');
  }
}

if (existsSync(vectorstoreProofPath)) {
  const vs = readFileSync(vectorstoreProofPath, 'utf8');
  if (/pgvector/.test(vs)) {
    pass('vectorstore.proof.ts still bound to pgvector fixtures (R5 fake-green risk live)');
  } else {
    fail('vectorstore.proof.ts must still evidence pgvector fixture binding until Qdrant fixtures / marked-red');
  }
}

if (existsSync(e2eIsolatedPath)) {
  const e2e = readFileSync(e2eIsolatedPath, 'utf8');
  if (/pgvector\/pgvector|E2E_PG_IMAGE/.test(e2e)) {
    pass('run-e2e-isolated.mjs still pins pgvector image / E2E_PG_IMAGE (R5)');
  } else {
    fail('run-e2e-isolated.mjs must still show pgvector fixture binding (R5)');
  }
}

if (existsSync(packageJsonPath)) {
  const pkg = readFileSync(packageJsonPath, 'utf8');
  if (/mysql-stack:m5-fixtures:prove/.test(pkg)
    && /mysql-stack\.m5-fixtures\.skeleton\.proof\.mjs/.test(pkg)) {
    pass('package.json pins mysql-stack:m5-fixtures:prove → skeleton proof');
  } else {
    fail('package.json must pin mysql-stack:m5-fixtures:prove to mysql-stack.m5-fixtures.skeleton.proof.mjs');
  }
  if (/"vectorstore:prove"/.test(pkg) && /run-e2e-isolated\.mjs vectorstore:prove:raw/.test(pkg)) {
    pass('package.json still wires vectorstore:prove via run-e2e-isolated (inventory live)');
  } else {
    fail('package.json must still wire vectorstore:prove through run-e2e-isolated this slice');
  }
}

if (existsSync(docPath)) {
  const doc = readFileSync(docPath, 'utf8');

  // Scope
  if (/仅计划文档/.test(doc)) pass('doc scope: 仅计划文档');
  else fail('doc must pin 仅计划文档');

  // Sole stack
  if (/MySQL\s*\+\s*Qdrant\s*\+\s*Redis|MySQL\+Qdrant\+Redis/.test(doc)
    && /sole stack|唯一真相|sole-stack/.test(doc)) {
    pass('doc pins MySQL+Qdrant+Redis sole stack');
  } else {
    fail('doc must pin MySQL+Qdrant+Redis sole stack');
  }

  // Inventory: real scripts
  if (/vectorstore:prove/.test(doc) && /run-e2e-isolated/.test(doc)
    && /E2E_PG_IMAGE/.test(doc) && /pgvector\/pgvector/.test(doc)) {
    pass('doc inventories vectorstore:prove + run-e2e-isolated E2E_PG_IMAGE/pgvector');
  } else {
    fail('doc must inventory vectorstore:prove / run-e2e-isolated / E2E_PG_IMAGE / pgvector image');
  }
  if (/rag03-route:prove|rag0[3-7]/.test(doc) && /memory:prove|memory-/.test(doc)) {
    pass('doc inventories rag* + memory* proves bound to isolation/pgvector');
  } else {
    fail('doc must inventory rag* and memory* proves still bound to pgvector/isolation');
  }

  // Target: Qdrant-backed or marked-red
  if (/Qdrant-backed/.test(doc) && /marked-red|标红/.test(doc)) {
    pass('doc targets Qdrant-backed or marked-red retirement');
  } else {
    fail('doc must target Qdrant-backed or marked-red retirement of pgvector fixtures');
  }

  // R5 fake-green
  if (/pgvector/.test(doc) && /(假绿|fake-green|假绿风险)/.test(doc)
    && /(vectorstore:prove|run-e2e-isolated)/.test(doc)) {
    pass('doc R5 pins pgvector fixtures + fake-green risk');
  } else {
    fail('doc must pin R5 pgvector fixtures → fake-green until Qdrant fixtures / marked-red');
  }

  // R4 still M4/M5 gate
  if (/题域隔离 NOT closed|不宣称题域隔离已关/.test(doc)
    && /M4\/M5/.test(doc)) {
    pass('doc R4 pins 题域隔离 NOT closed → M4/M5 gate');
  } else {
    fail('doc must pin 题域隔离 NOT closed as explicit M4/M5 gate (R4)');
  }
  if (/(已关|已关闭)[^\n]{0,20}题域隔离|题域隔离[^\n]{0,20}(已关|已关闭)/.test(doc)
    && !/(不宣称|NOT closed|未关|不得|禁止)[^\n]{0,40}题域隔离/.test(doc)) {
    fail('doc appears to claim topic-domain isolation closed');
  } else {
    pass('doc does not claim topic-domain isolation closed');
  }

  // Erasure sink before cutover
  if (/Qdrant as erasure sink|Qdrant.*擦除 sink/.test(doc)
    && /recall\s*=\s*0/.test(doc)
    && /(逐 sink receipt|per-sink receipt)/.test(doc)
    && /(before cutover|切流前)/.test(doc)) {
    pass('doc pins Qdrant erasure sink (recall=0 + per-sink receipt) before cutover');
  } else {
    fail('doc must pin Qdrant as erasure sink with recall=0 + per-sink receipt before cutover');
  }
  if (/metadata stays relational|元数据留关系库/.test(doc)) {
    pass('doc pins metadata stays relational');
  } else {
    fail('doc must pin metadata stays relational');
  }

  // Explicit do-not-cut / honesty pins
  if (/不切向量真相/.test(doc)) pass('doc pins 不切向量真相');
  else fail('doc must pin 不切向量真相');
  if (/不改 production retrieval|不切.*production retrieval|不改.*检索/.test(doc)
    || /不切 qbank 生产路径/.test(doc)) {
    pass('doc pins no production retrieval / qbank path cut');
  } else {
    fail('doc must pin no production retrieval cut this slice');
  }

  if (/pass\s*≠\s*cutover|pass≠cutover/i.test(doc)) pass('doc pins pass ≠ cutover');
  else fail('doc must pin pass ≠ cutover');

  if (/本绿\s*≠\s*已迁|本绿 ≠ 已迁/i.test(doc)) pass('doc pins 本绿 ≠ 已迁');
  else fail('doc must pin 本绿 ≠ 已迁');

  if (/cutover blocked until proves|禁止自批 cutover|未绿禁止切流/.test(doc)) {
    pass('doc pins cutover blocked until proves / no self-approve');
  } else {
    fail('doc must pin cutover blocked until proves');
  }

  if (/releaseEvidence\s*=\s*false/i.test(doc)) {
    if (/(不宣称|不得|禁止)[^\n]{0,80}releaseEvidence\s*=\s*true|releaseEvidence\s*=\s*true[^\n]{0,80}(不宣称|不得|禁止)/.test(doc)
      || !/releaseEvidence\s*=\s*true/i.test(doc)) {
      pass('doc releaseEvidence=false (no true claim)');
    } else {
      fail('doc claims releaseEvidence=true without forbid language');
    }
  } else {
    fail('doc must pin releaseEvidence=false');
  }

  if (/Not HA|非 HA|不宣称.*HA/i.test(doc)) {
    pass('doc forbids / does not claim HA');
  } else {
    fail('doc must forbid HA claims');
  }

  if (/(不自批|禁止自批|Do not self-approve|不自批切流)/i.test(doc)) {
    pass('doc forbids self-approve cutover');
  } else {
    fail('doc must forbid self-approve cutover');
  }

  if (/(不宣称|不得|禁止)[^\n]{0,80}controlPlaneClosed|controlPlaneClosed[^\n]{0,80}(不宣称|不得|禁止)/.test(doc)
    || !/controlPlaneClosed\s*=\s*true/.test(doc)) {
    pass('doc does not claim controlPlaneClosed=true');
  } else {
    fail('doc must not claim controlPlaneClosed=true');
  }

  // Reject achievement claims
  if (/(夹具|fixture)[^\n]{0,30}(已退役|已换新|已迁)|RAG[^\n]{0,20}(已切流|已迁)/.test(doc)
    && !/(不宣称|不得|禁止|≠|仅计划|未)[^\n]{0,40}(已退役|已换|已切流|已迁)/.test(doc)) {
    fail('doc appears to claim fixture retirement or RAG cutover complete');
  } else {
    pass('doc does not claim fixture retirement / RAG cutover complete');
  }
}

if (existsSync(adrPath)) {
  const adr = readFileSync(adrPath, 'utf8');
  if (/\*\*M5\*\*/.test(adr) && (/m5-pgvector-fixture-retirement-plan|fixture retirement|夹具退役/.test(adr)
    || /prove 去 pgvector|R5.*夹具/.test(adr))) {
    pass('ADR M5 row references fixture retirement / R5 plan');
  } else {
    fail('ADR M5 row must one-liner-link fixture retirement plan or R5 fixture work');
  }
}

for (const line of lines) console.log(line);

const finalCmd = `node ${scriptPath}`;
console.log(`CMD=${finalCmd} EXIT=${exitCode}`);
process.exit(exitCode);
