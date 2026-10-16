#!/usr/bin/env node
/**
 * Static honesty prove — UC-E2E-018 sole-stack PG-retained · GAP-UC018-SOLE (§1b #6).
 *
 * Asserts (fail closed):
 *   - Parent harness §1b #6 names PG-retained sole / GAP-UC018-SOLE CLOSED
 *   - Ban MySQL+Qdrant as #6 close-condition
 *   - Knife harness + slice cite adr-postgres-retained.md + Postgres+pgvector+PostgresSaver
 *   - package.json lists uc018:sole:prove; does NOT treat mysql-qdrant sole-wiring as UC018 #6 evidence
 *   - Abandon family retained (uc018:abandon:prove, http, full-e2e, graph, ttl, ui) AND sole prove
 *   - Matrix UC-E2E-018 stays **partial** · Ban claim covered · #6 alone ≠ covered
 *   - Pins: releaseEvidence=false · Not HA · claimProductionHA=false
 *   - Ban wash: MySQL/Qdrant sole-wiring ≠ this gap; UI/TTL/GRAPH/FULL-E2E alone ≠ #6
 *   - Cite STOPPED R5 harnesses superseded
 *
 * releaseEvidence=false · Not HA · claimProductionHA=false
 * GAP-UC018-SOLE CLOSED only · matrix partial · #6 alone ≠ UC covered · Ban claim UC018 covered
 * Ban wash e2e-isolation:sole-*:prove / mysql-stack:* EXIT as this gap
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const paths = {
  parent: join(root, 'ai-docs/delivery/harness/uc-e2e-018-user-abandon.md'),
  knife: join(root, 'ai-docs/delivery/harness/uc-e2e-018-sole-stack-pg-retained.md'),
  slice: join(root, 'ai-docs/delivery/uc-e2e-018-sole-stack-pg-retained.slice.md'),
  adr: join(root, 'ai-docs/delivery/adr-postgres-retained.md'),
  matrix: join(root, 'ai-docs/delivery/e2e-requirement-coverage-matrix.md'),
  backlog: join(root, 'ai-docs/delivery/e2e-covered-path-backlog.md'),
  evalDoc: join(root, 'ai-docs/delivery/eval/uc-e2e-018-user-abandon.eval.md'),
  pkg: join(root, 'package.json'),
  r5Status: join(root, 'ai-docs/delivery/harness/r5-retirement-sole-stack-status.md'),
  r5MarkRed: join(root, 'ai-docs/delivery/harness/r5-pgvector-fixture-mark-red.md'),
  self: join(root, 'scripts/uc-e2e-018-sole-stack-pg-retained.proof.mjs'),
};

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

function read(p) {
  if (!existsSync(p)) {
    fail(`missing file: ${p}`);
    return '';
  }
  pass(`present: ${p.replace(root + '/', '')}`);
  return readFileSync(p, 'utf8');
}

function assertPins(label, text, checks) {
  if (!text) return;
  for (const [re, ok, bad] of checks) {
    if (re.test(text)) pass(`${label}: ${ok}`);
    else fail(`${label}: ${bad}`);
  }
}

for (const [label, p] of Object.entries(paths)) {
  if (!existsSync(p)) fail(`${label} missing: ${p}`);
  else pass(`${label} present`);
}

const parent = read(paths.parent);
const knife = read(paths.knife);
const slice = read(paths.slice);
const adr = read(paths.adr);
const matrix = read(paths.matrix);
const backlog = read(paths.backlog);
const evalDoc = read(paths.evalDoc);
const pkgText = read(paths.pkg);
const r5Status = read(paths.r5Status);
const r5MarkRed = read(paths.r5MarkRed);

let pkg = {};
try {
  pkg = JSON.parse(pkgText || '{}');
} catch {
  fail('package.json: invalid JSON');
}
const scripts = pkg.scripts || {};

// --- package.json: uc018:sole:prove wired; abandon family retained ---
const requiredScripts = [
  'uc018:sole:prove',
  'uc018:abandon:prove',
  'uc018:abandon:http:prove',
  'uc018:abandon:full-e2e:prove',
  'uc018:graph:prove',
  'uc018:ttl:prove',
  'uc018:ui:prove',
  'uc018:adv:prove',
];
for (const s of requiredScripts) {
  if (scripts[s]) pass(`package.json lists ${s}`);
  else fail(`package.json missing script ${s}`);
}
if (scripts['uc018:sole:prove'] === 'node scripts/uc-e2e-018-sole-stack-pg-retained.proof.mjs') {
  pass('uc018:sole:prove → scripts/uc-e2e-018-sole-stack-pg-retained.proof.mjs');
} else {
  fail('uc018:sole:prove must point at scripts/uc-e2e-018-sole-stack-pg-retained.proof.mjs');
}

// Ban treating mysql-qdrant sole-wiring scripts as UC018 #6 evidence in package naming
const soleWiringKeys = Object.keys(scripts).filter(
  (k) =>
    /e2e-isolation:sole-|mysql-stack:sole|conn-stack:sole/.test(k) ||
    (k.includes('sole') && /mysql|qdrant/i.test(scripts[k] || '')),
);
note(
  `historical sole-wiring scripts present (${soleWiringKeys.length}) — Ban wash as GAP-UC018-SOLE evidence`,
);
if (scripts['uc018:sole:prove'] && /mysql-qdrant|E2E_ISOLATION_STACK=mysql/i.test(scripts['uc018:sole:prove'])) {
  fail('uc018:sole:prove must NOT invoke mysql-qdrant sole-wiring');
} else {
  pass('uc018:sole:prove is static PG-retained honesty (not mysql-qdrant sole-wiring)');
}

// --- ADR ---
assertPins('adr-postgres-retained', adr, [
  [/Postgres\s*\(\+pgvector\s*\+\s*PostgresSaver\)|Postgres retained \(\+pgvector \+ PostgresSaver\)/i, 'names Postgres (+pgvector + PostgresSaver)', 'must name Postgres (+pgvector + PostgresSaver)'],
  [/pgvector/i, 'pins pgvector', 'must pin pgvector'],
  [/PostgresSaver/i, 'pins PostgresSaver', 'must pin PostgresSaver'],
  [/NO.*Qdrant|Ban.*Qdrant|not Qdrant|≠.*Qdrant/i, 'Ban Qdrant-as-required-vector', 'must Ban Qdrant as required vector'],
  [/NO.*MySQL|Ban.*MySQL|not.*MySQL cutover|No business DB migration to MySQL/i, 'Ban MySQL business cutover', 'must Ban MySQL business cutover'],
]);

// --- Parent harness §1b #6 CLOSED under PG-retained ---
assertPins('parent-harness', parent, [
  [/GAP-UC018-SOLE[^\n]*CLOSED|GAP-UC018-SOLE\*\*`?\s*CLOSED|`GAP-UC018-SOLE`\s*\*\*CLOSED\*\*/i, 'GAP-UC018-SOLE CLOSED', 'must name GAP-UC018-SOLE CLOSED'],
  [/PG-retained|Postgres\+pgvector|adr-postgres-retained/i, 'cites PG-retained / Postgres+pgvector', 'must cite PG-retained sole'],
  [/#6 alone\s*≠\s*(UC\s*)?covered|§1b\s*#6 alone\s*≠|\#6 alone ≠ covered/i, '#6 alone ≠ covered', 'must pin #6 alone ≠ covered'],
  [/\bpartial\b/i, 'pins partial', 'must pin matrix partial'],
  [/本绿\s*≠\s*全链路 E2E covered/, '本绿≠全链路 E2E covered', 'must pin 本绿≠全链路 E2E covered'],
  [/releaseEvidence\s*=\s*false/i, 'releaseEvidence=false', 'must pin releaseEvidence=false'],
  [/Not HA|非 HA|haStatus=NOT_HA/i, 'Not HA', 'must pin Not HA'],
  [/uc018:sole:prove/, 'lists uc018:sole:prove', 'must list uc018:sole:prove'],
  [/uc018:abandon:prove/, 'lists uc018:abandon:prove', 'must list abandon:prove'],
  [/uc018:abandon:http:prove/, 'lists uc018:abandon:http:prove', 'must list abandon:http:prove'],
  [/uc018:abandon:full-e2e:prove/, 'lists full-e2e prove', 'must list full-e2e prove'],
  [/uc018:graph:prove/, 'lists graph prove', 'must list graph prove'],
  [/uc018:ttl:prove/, 'lists ttl prove', 'must list ttl prove'],
  [/uc018:ui:prove/, 'lists ui prove', 'must list ui prove'],
  [/Ban.*MySQL.*Qdrant|MySQL\/Qdrant sole-wiring|≠.*MySQL.*Qdrant|不得.*mysql-qdrant/i, 'Ban MySQL/Qdrant as close-condition / wash', 'must Ban MySQL/Qdrant sole-wiring as #6 close'],
  [/UI\/TTL\/GRAPH\/FULL-E2E|UI\/TTL\/GRAPH\/FULL|UI.*TTL.*GRAPH.*FULL-E2E.*alone|alone as #6 closed/i, 'Ban wash UI/TTL/GRAPH/FULL-E2E alone as #6', 'must Ban wash UI/TTL/GRAPH/FULL-E2E alone as #6'],
  [/r5-retirement-sole-stack-status|r5-pgvector-fixture-mark-red/i, 'cites STOPPED R5 harnesses', 'must cite STOPPED R5 harnesses'],
  [/≠\s*UC-E2E-018 covered|不得.*UC-E2E-018 covered|Ban claim UC/i, 'Ban claim UC-E2E-018 covered', 'must Ban claim UC covered'],
]);

// Parent must NOT leave GAP-UC018-SOLE as OPEN without CLOSED
if (/GAP-UC018-SOLE[^\n]{0,80}\*\*OPEN\*\*/.test(parent) && !/GAP-UC018-SOLE[^\n]{0,120}\*\*CLOSED\*\*/.test(parent)) {
  fail('parent-harness: GAP-UC018-SOLE must be CLOSED (not left OPEN-only)');
} else if (/GAP-UC018-SOLE[^\n]{0,120}\*\*CLOSED\*\*/.test(parent)) {
  pass('parent-harness: GAP-UC018-SOLE CLOSED present');
}

// --- Knife harness + slice ---
for (const [label, text] of [
  ['knife-harness', knife],
  ['knife-slice', slice],
]) {
  assertPins(label, text, [
    [/adr-postgres-retained\.md/, 'cites adr-postgres-retained.md', 'must cite adr-postgres-retained.md'],
    [/Postgres\s*\(\+pgvector\s*\+\s*PostgresSaver\)|Postgres\+pgvector\+PostgresSaver|pgvector.*PostgresSaver/i, 'Postgres+pgvector+PostgresSaver', 'must name Postgres+pgvector+PostgresSaver'],
    [/GAP-UC018-SOLE/, 'names GAP-UC018-SOLE', 'must name GAP-UC018-SOLE'],
    [/executed:awaiting_post_prove_dual|post_prove_dual_pass/, 'status executed:awaiting_post_prove_dual or post_prove_dual_pass', 'must be executed:awaiting_post_prove_dual or post_prove_dual_pass'],
    [/releaseEvidence\s*=\s*false/i, 'releaseEvidence=false', 'must pin releaseEvidence=false'],
    [/haStatus=NOT_HA|Not HA/i, 'NOT_HA', 'must pin haStatus=NOT_HA'],
    [/claimProductionHA\s*=\s*false/i, 'claimProductionHA=false', 'must pin claimProductionHA=false'],
    [/\bpartial\b/i, 'matrix partial', 'must pin matrix partial'],
    [/#6 alone\s*≠|alone ≠ (UC )?covered/i, '#6 alone ≠ covered', 'must pin #6 alone ≠ covered'],
    [/Ban claim UC|≠\s*UC-E2E-018 covered|不得.*UC-E2E-018 covered/i, 'Ban claim UC covered', 'must Ban claim UC covered'],
    [/uc018:sole:prove/, 'lists uc018:sole:prove', 'must list uc018:sole:prove'],
    [/r5-retirement-sole-stack-status|r5-pgvector-fixture-mark-red/i, 'cites STOPPED R5', 'must cite STOPPED R5 harnesses'],
    [/Ban.*MySQL|Ban.*Qdrant|≠.*MySQL.*Qdrant|MySQL\/Qdrant/i, 'Ban MySQL/Qdrant cutover/wash', 'must Ban MySQL/Qdrant'],
  ]);
  if (/executed:awaiting_post_prove_dual/.test(text) || /\*\*`?post_prove_dual_pass`?\*\*/.test(text)) {
    // After AUTHORIZED nail, status may be post_prove_dual_pass (GAP CLOSED retained).
    // During prove tip, status is executed:awaiting_post_prove_dual.
    pass(`${label}: lifecycle status present (awaiting_post_prove_dual or post_prove_dual_pass)`);
  } else {
    fail(`${label}: must have executed:awaiting_post_prove_dual or post_prove_dual_pass`);
  }
}

// --- Matrix ---
assertPins('matrix', matrix, [
  [/UC-E2E-018[^\n]*\*\*partial\*\*/i, 'UC-E2E-018 stays **partial**', 'UC-E2E-018 must stay **partial**'],
  [/uc018:sole:prove/, 'lists uc018:sole:prove', 'must list uc018:sole:prove on 018 row or P0-8'],
  [/GAP-UC018-SOLE[^\n]{0,80}CLOSED|SOLE\(PG-retained\).*CLOSED|sole PG-retained.*CLOSED|GAP-UC018-SOLE.*CLOSED/i, 'notes GAP-UC018-SOLE CLOSED', 'must note sole PG-retained / GAP-UC018-SOLE CLOSED'],
  [/#6 alone\s*≠\s*covered|alone ≠ covered|≠ covered/i, '≠ covered / #6 alone ≠ covered', 'must keep ≠ covered honesty'],
  [/releaseEvidence.*false/i, 'releaseEvidence=false', 'must keep releaseEvidence=false'],
]);
if (/UC-E2E-018[^\n]*\*\*covered\*\*/.test(matrix)) {
  fail('matrix: UC-E2E-018 must NOT be **covered**');
} else {
  pass('matrix: UC-E2E-018 not falsely covered');
}
// Ban wash: MySQL/Qdrant sole-wiring must not be treated as UC018 #6 evidence in matrix row
const m018 = matrix.match(/\| UC-E2E-018 \|[^\n]+/)?.[0] || '';
const p08 = matrix.match(/\| P0-8 \|[^\n]+/)?.[0] || '';
if (/e2e-isolation:sole-|mysql-stack:sole/.test(m018 + p08) && !/Ban.*mysql|≠.*mysql|≠.*sole-wiring/i.test(m018 + p08)) {
  fail('matrix: must not treat mysql-qdrant sole-wiring as UC018 #6 evidence without Ban');
} else {
  pass('matrix: mysql-qdrant sole-wiring not treated as UC018 #6 evidence');
}

// --- Backlog ---
assertPins('backlog', backlog, [
  [/018[^\n]*(sole|SOLE|PG-retained)/i, '018 mentions sole/PG-retained', '018 row must mention sole PG-retained'],
  [/018[^\n]*partial\s*≠\s*covered|018[^\n]*partial≠covered/i, '018 still partial≠covered', '018 must stay partial≠covered'],
]);
if (/018[^\n]*仍缺 UI/.test(backlog)) {
  fail('backlog: 018 must not still say 仍缺 UI (UI already CLOSED)');
} else {
  pass('backlog: 018 does not claim 仍缺 UI');
}
if (/018[^\n]*仍缺[^\n]*sole-stack/.test(backlog) && !/CLOSED|已关|PG-retained CLOSED/i.test(backlog.match(/\| 018 \|[^\n]+/)?.[0] || '')) {
  fail('backlog: 018 must not still say 仍缺 sole-stack without CLOSED under PG-retained');
} else {
  pass('backlog: 018 sole honesty updated (not stale 仍缺 sole-stack only)');
}

// --- Eval ---
assertPins('eval', evalDoc, [
  [/uc018:sole:prove/, 'lists uc018:sole:prove', 'must list uc018:sole:prove'],
  [/GAP-UC018-SOLE[^\n]{0,80}CLOSED|SOLE.*CLOSED|#6.*CLOSED|PG-retained.*CLOSED/i, 'GAP-UC018-SOLE / #6 CLOSED', 'must name GAP-UC018-SOLE / #6 CLOSED'],
  [/\bpartial\b/i, 'pins partial', 'must pin partial'],
  [/#6 alone\s*≠|alone ≠ covered|≠\s*UC-E2E-018 covered/i, '#6 alone ≠ covered / ≠ UC covered', 'must Ban #6 alone = covered'],
  [/releaseEvidence\s*=\s*false/i, 'releaseEvidence=false', 'must pin releaseEvidence=false'],
  [/Not HA/i, 'Not HA', 'must pin Not HA'],
  [/PG-retained|adr-postgres-retained|Postgres\+pgvector/i, 'cites PG-retained', 'must cite PG-retained'],
]);

// --- STOPPED R5 ---
assertPins('r5-status', r5Status, [
  [/STOPPED|superseded/i, 'STOPPED/superseded', 'must be STOPPED/superseded'],
  [/PG-retained|postgres-retained|pgvector/i, 'PG-retained direction', 'must cite PG-retained supersession'],
]);
assertPins('r5-mark-red', r5MarkRed, [
  [/STOPPED|superseded/i, 'STOPPED/superseded', 'must be STOPPED/superseded'],
]);

console.log(lines.join('\n'));
console.log(`\nCMD=pnpm uc018:sole:prove EXIT=${exitCode}`);
console.log(
  'NOTE: GAP-UC018-SOLE CLOSED only · matrix UC-E2E-018 partial · #6 alone ≠ covered · Ban claim UC018 covered · Ban wash mysql-qdrant sole-wiring / UI/TTL/GRAPH/FULL-E2E alone as #6 · releaseEvidence=false · Not HA · claimProductionHA=false · Ban self-nail',
);
process.exit(exitCode);
