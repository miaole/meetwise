#!/usr/bin/env node
/**
 * G4 / R4 domain-isolation honesty prove — static only (GAP-RAG-04).
 * Pins: EG3 domainIsolationClosed=true under authorize · R4/FUNNEL/G-R4-5 all STILL OPEN
 * · PREREQ (R1/R2/MetadataReviewReceipt/partial P-WIRE)
 * · production scoped call path (cachedQbankSearch scope:) may be present — still ≠ R4/FUNNEL all closed
 * · inventory rag04 ≠ production · fail-closed against invent coveredCount / wash into R4 all closed
 * · releaseEvidence=false · Not HA · ≠ sole cutover · ≠ flip default
 * Does NOT claim R4/FUNNEL/G-R4-5 all closed. Does NOT cut qbank / vector / Worker defaults.
 * Conn-only forever (BUG-FAKE-CONN). NEVER LIVE · NEVER prove-shell · NEVER covered.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const harnessPath = join(root, 'ai-docs/delivery/harness/r4-domain-isolation.md');
const statusPath = join(root, 'ai-docs/delivery/harness/r4-domain-isolation-status.md');
const evalPath = join(root, 'ai-docs/delivery/eval/r4-domain-isolation.eval.md');
const scriptPath = join(root, 'scripts/conn-stack/mysql-stack.r4-domain-isolation.proof.mjs');
const forwarderPath = join(root, 'scripts/mysql-stack.r4-domain-isolation.proof.mjs');
const m4Path = join(root, 'ai-docs/delivery/m4-rag-hard-gates.md');
const backlogPath = join(root, 'ai-docs/delivery/gap-bug-backlog.md');
const packageJsonPath = join(root, 'package.json');
const mainPath = join(root, 'apps/worker/src/main.ts');
const trackLocalPath = join(root, 'packages/db/src/qbank-track-local-retrieval.ts');
const rag04ProofPath = join(root, 'packages/db/test/rag04-track-local-retrieval.proof.ts');
const requestRagPath = join(root, 'ai-docs/delivery/reviews/REQUEST-r4-domain-isolation-mw-rag-route.md');
const requestE2ePath = join(root, 'ai-docs/delivery/reviews/REQUEST-r4-domain-isolation-mw-e2e-ha.md');

let exitCode = 0;
const lines = [];
function fail(msg) { lines.push(`FAIL  ${msg}`); exitCode = 1; }
function pass(msg) { lines.push(`PASS  ${msg}`); }

function read(p) {
  return existsSync(p) ? readFileSync(p, 'utf8') : '';
}

function assertPins(label, text, checks) {
  for (const [re, ok, bad] of checks) {
    if (re.test(text)) pass(`${label}: ${ok}`);
    else fail(`${label}: ${bad}`);
  }
}

// E1 — artifacts present
for (const [label, path] of [
  ['R4 harness', harnessPath],
  ['R4 status', statusPath],
  ['R4 eval', evalPath],
  ['proof script', scriptPath],
  ['S4 forwarder', forwarderPath],
  ['m4-rag-hard-gates', m4Path],
  ['gap-bug-backlog', backlogPath],
  ['package.json', packageJsonPath],
  ['worker main.ts', mainPath],
  ['qbank-track-local-retrieval.ts', trackLocalPath],
  ['rag04 proof', rag04ProofPath],
  ['REQUEST mw-rag-route', requestRagPath],
  ['REQUEST mw-e2e-ha', requestE2ePath],
]) {
  if (existsSync(path)) pass(`${label} present: ${path}`);
  else fail(`${label} missing: ${path}`);
}

const harness = read(harnessPath);
const status = read(statusPath);
const evalDoc = read(evalPath);
const m4 = read(m4Path);
const backlog = read(backlogPath);
const pkg = read(packageJsonPath);
const main = read(mainPath);

// E2 — NOT closed pins
assertPins('harness', harness, [
  [/domainIsolationClosed=true|题域 isolation product face closed under authorize|EG3 domainIsolationClosed=true under authorize/, 'pins EG3 domainIsolationClosed under authorize', 'must pin EG3 domainIsolationClosed under authorize'],
  [/R4\/FUNNEL\/G-R4-5 all STILL OPEN|gR45Closed=false|R4\/FUNNEL product STILL OPEN|pass ≠ R4/, 'pins R4/FUNNEL/G-R4-5 all STILL OPEN', 'must pin R4/FUNNEL/G-R4-5 all STILL OPEN'],
  [/releaseEvidence\s*=\s*false/i, 'releaseEvidence=false', 'must pin releaseEvidence=false'],
  [/Not HA|非 HA/i, 'Not HA', 'must pin Not HA'],
  [/本绿\s*≠\s*已迁|≠ invent coveredCount|≠ wrong_track=0 invent/, '本绿≠已迁 / Ban invent', 'must pin 本绿 ≠ 已迁 or Ban invent'],
]);

assertPins('status', status, [
  [/domainIsolationClosed=true|题域 isolation product face closed under authorize|EG3 domainIsolationClosed=true under authorize/, 'pins EG3 domainIsolationClosed under authorize', 'must pin EG3 domainIsolationClosed under authorize'],
  [/R4\/FUNNEL product STILL OPEN|gR45Closed=false|R4\/FUNNEL\/G-R4-5 all STILL OPEN|pass ≠ R4/, 'pins R4/FUNNEL STILL OPEN', 'must pin R4/FUNNEL STILL OPEN'],
  [/releaseEvidence\s*=\s*false/i, 'releaseEvidence=false', 'must pin releaseEvidence=false'],
  [/Not HA/i, 'Not HA', 'must pin Not HA'],
  [/≠ sole cutover|sole cutover/, 'pins ≠ sole cutover', 'must pin ≠ sole cutover'],
]);

assertPins('eval', evalDoc, [
  [/pass ≠ R4 已关|pass ≠ R4|R4\/FUNNEL/, 'pins pass ≠ R4 / R4 honesty', 'must pin pass ≠ R4 honesty'],
  [/本绿 ≠ 题域已隔离|≠ invent coveredCount|题域|R4/, 'pins 本绿 ≠ 题域已隔离 / Ban invent', 'must pin non-close / Ban invent language'],
  [/mysql-stack:r4-domain-isolation:prove/, 'lists prove CMD', 'must list mysql-stack:r4-domain-isolation:prove'],
]);

// E3 — PREREQ pins
assertPins('harness PREREQ', harness, [
  [/P-R1|R1.*PREREQ|PREREQ[\s\S]{0,200}R1/, 'PREREQ R1', 'must list R1 as PREREQ'],
  [/P-R2|R2.*PREREQ|classifyJobRoute/, 'PREREQ R2 / classifyJobRoute', 'must list R2 / classifyJobRoute as PREREQ'],
  [/MetadataReviewReceipt|RAG-FUNNEL-01|P-META/, 'PREREQ MetadataReviewReceipt / RAG-FUNNEL-01', 'must list MetadataReviewReceipt / RAG-FUNNEL-01 PREREQ'],
  [/P-WIRE|dispatchTrackLocalRetrieval|partial|scoped/, 'PREREQ P-WIRE / dispatchTrackLocalRetrieval / partial scoped', 'must pin P-WIRE / dispatchTrackLocalRetrieval / partial scoped gap'],
]);

// E4 — already partly in E2; reinforce flip default / sole
assertPins('harness evidence', harness, [
  [/≠ flip default|flip default/, 'pins ≠ flip default', 'must pin ≠ flip default'],
  [/≠ sole cutover|sole cutover/, 'pins ≠ sole cutover', 'must pin ≠ sole cutover'],
]);

// E5 — rag04 inventory honesty
assertPins('harness inventory', harness, [
  [/rag04-track-local:prove/, 'inventories rag04-track-local:prove', 'must inventory rag04-track-local:prove'],
  [/≠ 生产|非生产|prove-shell/, 'marks rag04 ≠ production / prove-shell', 'must mark rag04 as ≠ production / prove-shell'],
  [/R5|假绿/, 'ties rag04 to R5 fake-green family', 'must note R5/fake-green fixture risk for rag04'],
]);

// E6 — production Worker scoped-call partial wire (G4 production GAP partial)
// Partial P-WIRE: localRetrieve forwards optional scope into cachedQbankSearch.
// Still NOT full R4: no dispatchTrackLocalRetrieval; wrong_track=0 unproven.
// Missing/invalid snapshot is now an explicit retrieve denial (G-R2-5), never an unscoped query.
if (/cachedQbankSearch\s*\(/.test(main)) {
  pass('main.ts calls cachedQbankSearch (production retrieve path)');
} else {
  fail('main.ts must still call cachedQbankSearch (production retrieve path for R4 GAP pin)');
}
if (/dispatchTrackLocalRetrieval\s*\(/.test(main)) {
  fail('main.ts must NOT call dispatchTrackLocalRetrieval until full R4 plan+recheck wire (unexpected — re-audit; do not fake-green R4)');
} else {
  pass('main.ts does not call dispatchTrackLocalRetrieval( (full track-local plan path still open)');
}
const retrieveOpts = main.match(/cachedQbankSearch\([\s\S]{0,2500}?leaseSeconds:[^\n]+/);
if (retrieveOpts) {
  if (/^\s*scope\s*,/m.test(retrieveOpts[0]) || /^\s*scope\s*:/m.test(retrieveOpts[0])) {
    pass('main.ts localRetrieve cachedQbankSearch forwards scope (partial P-WIRE present)');
  } else {
    fail('main.ts localRetrieve cachedQbankSearch must forward scope (partial production scoped retrieve)');
  }
} else {
  fail('could not locate cachedQbankSearch options block in main.ts localRetrieve');
}
const consumerPath = join(root, 'apps/worker/src/interview-consumer.ts');
const scopeHelperPath = join(root, 'apps/worker/src/qbank-retrieve-scope.ts');
const consumer = read(consumerPath);
const scopeHelper = read(scopeHelperPath);
if (existsSync(scopeHelperPath) && /export function resolveServingScopeFromRouteSnapshot/.test(scopeHelper)) {
  pass('qbank-retrieve-scope.ts exports resolveServingScopeFromRouteSnapshot');
} else {
  fail('qbank-retrieve-scope.ts must export resolveServingScopeFromRouteSnapshot');
}
if (/(?:resolveServingScopeFromRouteSnapshot|decideRouteSnapshotRetrieve)/.test(consumer)
  && /getInterviewRouteSnapshot/.test(consumer)
  && /degradedRetrieval/.test(consumer)) {
  pass('interview-consumer resolves route snapshot and denies missing scope (partial wire)');
} else {
  fail('interview-consumer must resolve route snapshot + getInterviewRouteSnapshot + degraded denial');
}
if (/dispatchTrackLocalRetrieval\s*\(/.test(consumer)) {
  fail('interview-consumer must NOT call dispatchTrackLocalRetrieval until full R4 wire (re-audit)');
} else {
  pass('interview-consumer does not call dispatchTrackLocalRetrieval( (plan+recheck still open)');
}

// E7 — R2 PREREQ still open (闭环): API zero classify; Worker sole + wakeup allowed; ≠ R2 closed
function walkTsFiles(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === 'node_modules' || ent.name === 'dist' || ent.name === '.tmp') continue;
    const p = join(dir, ent.name);
    if (ent.isDirectory()) walkTsFiles(p, acc);
    else if (/\.(ts|tsx|js|mjs)$/.test(ent.name) && !ent.name.includes('.proof.') && !ent.name.includes('.test.')) {
      acc.push(p);
    }
  }
  return acc;
}
const apiFiles = walkTsFiles(join(root, 'apps/api/src'));
const workerFiles = walkTsFiles(join(root, 'apps/worker/src'));
let apiClassifyHits = [];
let workerClassifyHits = [];
for (const f of apiFiles) {
  if (/classifyJobRoute\s*\(/.test(read(f))) apiClassifyHits.push(f);
}
for (const f of workerFiles) {
  if (/classifyJobRoute\s*\(/.test(read(f))) workerClassifyHits.push(f);
}
if (apiClassifyHits.length === 0) {
  pass(`apps/api src zero classifyJobRoute( (Worker sole; R2 PREREQ still open via 闭环); workerCalls=${workerClassifyHits.length}`);
} else {
  fail(`classifyJobRoute( found in apps/api (inline classify forbidden; wakeup-only): ${apiClassifyHits.join(', ')}`);
}
const r2Status = read(join(root, 'ai-docs/delivery/harness/r2-classify-job-route-status.md'));
if (/R2 NOT closed/.test(r2Status) && /≠ 路由已生效|不得宣称路由生效/.test(r2Status + read(join(root, 'ai-docs/delivery/harness/r2-classify-job-route.md')))) {
  pass('R2 status still pins NOT closed / ≠ 路由已生效 (Worker sole ≠ R2 closed)');
} else {
  fail('R2 status must still pin R2 NOT closed and ≠ 路由已生效');
}

// E8 — track-local seam present
if (existsSync(trackLocalPath)) {
  const tl = read(trackLocalPath);
  if (/export async function dispatchTrackLocalRetrieval/.test(tl)) {
    pass('qbank-track-local-retrieval.ts exports dispatchTrackLocalRetrieval (contract seam intact)');
  } else {
    fail('qbank-track-local-retrieval.ts must export dispatchTrackLocalRetrieval');
  }
}

// E9 — backlog + m4 pointers
assertPins('backlog GAP-RAG-04', backlog, [
  [/GAP-RAG-04/, 'has GAP-RAG-04', 'must keep GAP-RAG-04'],
  [/domainIsolationClosed=true|eg3ProductClosed=true|题域 isolation product face closed under authorize|R4/, 'pins GAP-RAG-04 product-face closed under authorize', 'must pin EG3 product-face closed under authorize in GAP-RAG-04'],
  [/r4-domain-isolation/, 'points to r4-domain-isolation harness', 'GAP-RAG-04 must point to r4-domain-isolation harness'],
]);
assertPins('m4 §R4', m4, [
  [/domainIsolationClosed=true|eg3ProductClosed=true|题域 isolation product face closed under authorize|gR45Closed=false/, 'm4 pins EG3 product-face closed under authorize', 'm4 must pin EG3 product-face closed under authorize'],
  [/r4-domain-isolation|GAP-RAG-04/, 'm4 cites r4 harness or GAP-RAG-04', 'm4 §R4 should cite r4-domain-isolation harness or GAP-RAG-04'],
]);

// package.json scripts
if (/"mysql-stack:r4-domain-isolation:prove"/.test(pkg)
  && /"conn-stack:r4-domain-isolation:prove"/.test(pkg)) {
  pass('package.json lists mysql-stack + conn-stack r4-domain-isolation:prove');
} else {
  fail('package.json must list mysql-stack:r4-domain-isolation:prove and conn-stack:r4-domain-isolation:prove');
}

// E10 — forbid fake-green closed claims in harness/status without negation
for (const [label, text] of [['harness', harness], ['status', status], ['eval', evalDoc]]) {
  const claimsClose = /(题域已隔离|R4\s*已关|R4\s*closed)/i.test(text);
  const hasNegation = /(不宣称|NOT closed|未关|≠|不得|禁止|pass ≠|STILL OPEN|gR45Closed=false|invent coveredCount)[^\n]{0,80}(题域|R4|FUNNEL|G-R4-5)|domainIsolationClosed=true under authorize|R4\/FUNNEL\/G-R4-5 all STILL OPEN/i.test(text);
  if (claimsClose && !hasNegation) {
    fail(`${label} appears to claim 题域已隔离 / R4 closed without negation`);
  } else {
    pass(`${label} does not claim R4/题域 closed without negation`);
  }
}

// REQUEST stubs dual-review ready
for (const [label, path] of [
  ['REQUEST mw-rag-route', requestRagPath],
  ['REQUEST mw-e2e-ha', requestE2ePath],
]) {
  const t = read(path);
  if (/REQUEST|待审|pending/i.test(t) && /releaseEvidence\s*=\s*false/i.test(t)
    && !/\*\*结论\*\*[^\n]*\*\*pass\*\*/i.test(t)) {
    pass(`${label} is REQUEST (not self-pass)`);
  } else if (!existsSync(path)) {
    // already failed in E1
  } else {
    fail(`${label} must stay REQUEST/pending without self-pass conclusion`);
  }
}

console.log(lines.join('\n'));
console.log(exitCode === 0
  ? '\nOK  r4-domain-isolation prove (honesty pins; EG3 domainIsolationClosed under authorize; R4/FUNNEL/G-R4-5 all STILL OPEN; ≠ invent coveredCount; ≠ wrong_track=0 invent; releaseEvidence=false; Not HA)'
  : '\nFAIL  r4-domain-isolation prove');
process.exit(exitCode);
