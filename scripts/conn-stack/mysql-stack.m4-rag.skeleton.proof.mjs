#!/usr/bin/env node
/**
 * M4 RAG hard-gates prove — static only.
 * Checks m4-rag-hard-gates.md exists and pins R1–R5 + hard constraints:
 *   仅硬门文档覆盖 R1–R5 / 不切向量真相 / 不切 pgvector serving / 不切 qbank 生产路径 /
 *   不宣称题域隔离已关 / 不宣称 RAG 已切流 / pass≠cutover / MySQL+Qdrant+Redis sole stack /
 *   禁止 FULLTEXT 冒充 / Qdrant erasure sink / metadata stays relational /
 *   releaseEvidence=false / Not HA / 本绿≠已迁
 * Not HA. Does not start containers, cut vector truth / pgvector serving / qbank paths,
 * touch .env*, or self-approve cutover.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const docPath = join(root, 'ai-docs/delivery/m4-rag-hard-gates.md');
const scriptPath = join(root, 'scripts/conn-stack/mysql-stack.m4-rag.skeleton.proof.mjs');
const mainPath = join(root, 'apps/worker/src/main.ts');
const consumerPath = join(root, 'apps/worker/src/interview-consumer.ts');
const routePath = join(root, 'packages/db/src/job-route-decision.ts');
const hybridPath = join(root, 'packages/db/src/qbank-generation-retrieval.ts');
const trackLocalPath = join(root, 'packages/db/src/qbank-track-local-retrieval.ts');
const retrievalPath = join(root, 'packages/db/src/retrieval-store.ts');
const vectorstoreProofPath = join(root, 'packages/db/test/vectorstore.proof.ts');
const e2eIsolatedPath = join(root, 'scripts/run-e2e-isolated.mjs');

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
  ['M4 hard-gates doc', docPath],
  ['proof script', scriptPath],
  ['worker main.ts', mainPath],
  ['interview-consumer.ts', consumerPath],
  ['job-route-decision.ts', routePath],
  ['qbank-generation-retrieval.ts', hybridPath],
  ['qbank-track-local-retrieval.ts', trackLocalPath],
  ['retrieval-store.ts', retrievalPath],
  ['vectorstore.proof.ts', vectorstoreProofPath],
  ['run-e2e-isolated.mjs', e2eIsolatedPath],
]) {
  if (existsSync(path)) pass(`${label} present: ${path}`);
  else fail(`${label} missing: ${path}`);
}

// R1 gate (GAP-RAG-01): silent hardcode removed from production injection; legacy default
// lives only in adaptive-role-resolve behind MEETWISE_TECH_ROLE_FAIL_CLOSED (default off).
// Does not claim R2 wiring or R4 topic isolation. releaseEvidence=false.
const resolvePath = join(root, 'apps/worker/src/adaptive-role-resolve.ts');
if (existsSync(resolvePath)) {
  const resolveSrc = readFileSync(resolvePath, 'utf8');
  if (/MEETWISE_TECH_ROLE_FAIL_CLOSED/.test(resolveSrc)
    && /adaptive_role_route_missing/.test(resolveSrc)
    && /LEGACY_TECH_ROLE_DEFAULT/.test(resolveSrc)) {
    pass('adaptive-role-resolve.ts pins fail-closed flag + missing code + legacy default (R1 gate)');
  } else {
    fail('adaptive-role-resolve.ts must pin MEETWISE_TECH_ROLE_FAIL_CLOSED + adaptive_role_route_missing + legacy default');
  }
} else {
  fail('adaptive-role-resolve.ts missing (R1 gate)');
}

if (existsSync(mainPath)) {
  const main = readFileSync(mainPath, 'utf8');
  if (/role:\s*['"]技术岗['"]/.test(main)) {
    fail('main.ts must not inject role: 技术岗 after R1 gate (use resolveAdaptiveInterviewRole)');
  } else {
    pass('main.ts no longer injects role: 技术岗 (R1 hardcode path addressed)');
  }
}

if (existsSync(consumerPath)) {
  const consumer = readFileSync(consumerPath, 'utf8');
  if (/\?\?\s*['"]技术岗['"]/.test(consumer)) {
    fail('interview-consumer.ts must not use ?? 技术岗 silent default after R1 gate');
  } else if (/resolveAdaptiveInterviewRole/.test(consumer)) {
    pass('interview-consumer.ts uses resolveAdaptiveInterviewRole (R1 gate)');
  } else {
    fail('interview-consumer.ts must call resolveAdaptiveInterviewRole');
  }
}

if (existsSync(routePath)) {
  const route = readFileSync(routePath, 'utf8');
  if (/export async function classifyJobRoute/.test(route)
    && /export async function getInterviewRouteSnapshot/.test(route)) {
    pass('job-route-decision.ts still exports classifyJobRoute + getInterviewRouteSnapshot (R2 contract intact)');
  } else {
    fail('job-route-decision.ts must keep classifyJobRoute + getInterviewRouteSnapshot');
  }
}

if (existsSync(hybridPath)) {
  const hybrid = readFileSync(hybridPath, 'utf8');
  if (/app\.qbank_serving_scope/.test(hybrid) && /export async function hybridQbankSearch/.test(hybrid)) {
    pass('qbank-generation-retrieval.ts still pins qbank_serving_scope + hybridQbankSearch (R3 / qbank path not cut)');
  } else {
    fail('qbank-generation-retrieval.ts must keep qbank_serving_scope + hybridQbankSearch (do not cut qbank production path)');
  }
}

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
    fail('vectorstore.proof.ts must still evidence pgvector fixture binding until M5 Qdrant fixtures');
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

if (existsSync(docPath)) {
  const doc = readFileSync(docPath, 'utf8');

  if (/仅硬门文档覆盖\s*R1\s*[–-]\s*R5|仅硬门文档覆盖 R1–R5/.test(doc)) {
    pass('doc scope: 仅硬门文档覆盖 R1–R5');
  } else {
    fail('doc must pin 仅硬门文档覆盖 R1–R5');
  }

  for (const r of ['R1', 'R2', 'R3', 'R4', 'R5']) {
    if (new RegExp(`\\b${r}\\b`).test(doc)) pass(`doc covers ${r}`);
    else fail(`doc missing ${r}`);
  }

  // R1 pointers
  if (/技术岗/.test(doc) && /main\.ts/.test(doc) && /interview-consumer\.ts/.test(doc)) {
    pass('doc R1 cites 技术岗 + main.ts + interview-consumer.ts');
  } else {
    fail('doc must cite Worker 技术岗 hardcode paths (R1)');
  }

  // R2 pointers
  if (/classifyJobRoute/.test(doc) && /job-route-decision\.ts/.test(doc)
    && /(生产接线|无生产接线)/.test(doc)) {
    pass('doc R2 cites classifyJobRoute / job-route-decision + 生产接线 gap');
  } else {
    fail('doc must cite classifyJobRoute production wiring gap (R2)');
  }

  // R3
  if (/qbank_serving_scope/.test(doc) && /to_tsvector/.test(doc)
    && /禁止用 MySQL FULLTEXT 冒充/.test(doc)) {
    pass('doc R3 pins qbank_serving_scope + to_tsvector + 禁止 FULLTEXT 冒充');
  } else {
    fail('doc must pin R3: qbank_serving_scope + to_tsvector + forbid MySQL FULLTEXT fake equivalent');
  }
  if (/hybridQbankSearch|qbank-generation-retrieval\.ts/.test(doc)) {
    pass('doc R3 cites hybridQbankSearch / qbank-generation-retrieval.ts');
  } else {
    fail('doc must cite hybrid filter landing code (R3)');
  }

  // R4 — NOT closed
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

  // R5
  if (/pgvector/.test(doc) && /(假绿|fake-green|假绿风险)/.test(doc)
    && /(vectorstore:prove|run-e2e-isolated)/.test(doc)) {
    pass('doc R5 pins pgvector fixtures + fake-green risk');
  } else {
    fail('doc must pin R5 pgvector fixtures → fake-green until Qdrant fixtures');
  }

  // Erasure sink
  if (/Qdrant as erasure sink|Qdrant.*擦除 sink/.test(doc)
    && /recall\s*=\s*0/.test(doc)
    && /(逐 sink receipt|per-sink receipt)/.test(doc)) {
    pass('doc pins Qdrant as erasure sink (recall=0 + per-sink receipt)');
  } else {
    fail('doc must pin Qdrant as erasure sink with recall=0 + per-sink receipt');
  }
  if (/metadata stays relational|元数据留关系库/.test(doc)) {
    pass('doc pins metadata stays relational');
  } else {
    fail('doc must pin metadata stays relational');
  }

  // Do-not-cut pins
  if (/不切向量真相/.test(doc)) pass('doc pins 不切向量真相');
  else fail('doc must pin 不切向量真相');
  if (/不切 pgvector serving/.test(doc)) pass('doc pins 不切 pgvector serving');
  else fail('doc must pin 不切 pgvector serving');
  if (/不切 qbank 生产路径/.test(doc)) pass('doc pins 不切 qbank 生产路径');
  else fail('doc must pin 不切 qbank 生产路径');

  if (/不宣称 RAG 已切流/.test(doc)) pass('doc pins 不宣称 RAG 已切流');
  else fail('doc must pin 不宣称 RAG 已切流');

  if (/pass\s*≠\s*cutover|pass≠cutover/i.test(doc)) pass('doc pins pass ≠ cutover');
  else fail('doc must pin pass ≠ cutover');

  if (/本绿\s*≠\s*已迁|本绿 ≠ 已迁/i.test(doc)) pass('doc pins 本绿 ≠ 已迁');
  else fail('doc must pin 本绿 ≠ 已迁');

  if (/MySQL\s*\+\s*Qdrant\s*\+\s*Redis|MySQL\+Qdrant\+Redis/.test(doc)
    && /sole stack|唯一真相|sole-stack/.test(doc)) {
    pass('doc pins MySQL+Qdrant+Redis sole stack');
  } else {
    fail('doc must pin MySQL+Qdrant+Redis sole stack');
  }
  if (/cutover blocked until proves|禁止自批 cutover|未绿禁止切流/.test(doc)) {
    pass('doc pins cutover blocked until proves / no self-approve');
  } else {
    fail('doc must pin cutover blocked until proves');
  }

  // Reject dual-run / memoir framing as primary
  if (/dual-run|双跑/.test(doc) && /compose\.dev/.test(doc) && !/legacy|待删|不以/.test(doc)) {
    fail('doc presents compose.dev dual-run without legacy framing');
  } else {
    pass('doc does not present dual-run as primary path');
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

  // Reject cutover achievement claims for RAG/vector
  if (/(RAG|向量)[^\n]{0,30}(已切流|已迁|已 cutover)|已切流[^\n]{0,20}RAG/.test(doc)
    && !/(不宣称|不得|禁止|≠)[^\n]{0,40}(已切流|已迁)/.test(doc)) {
    fail('doc appears to claim RAG/vector already cut over');
  } else {
    pass('doc does not claim RAG/vector cutover complete');
  }
}

for (const line of lines) console.log(line);

const finalCmd = `node ${scriptPath}`;
console.log(`CMD=${finalCmd} EXIT=${exitCode}`);
process.exit(exitCode);
