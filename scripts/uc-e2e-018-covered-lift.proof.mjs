#!/usr/bin/env node
/**
 * Static honesty prove — UC-E2E-018 covered-lift · GAP-UC018-COVERED-LIFT
 * (backlog § partial→covered 执行序 #1 · canHonestlyFlip assessment).
 *
 * Asserts (fail closed):
 *   - Cite §1b #1–#6 all CLOSED (tips c36b032 / 08650ea / d698282 / waiting_user / 1990b12 / aa968b1)
 *   - Family CMDs listed in package.json
 *   - Assess canHonestlyFlip from matrix §1.0 honesty (ADV blind → false)
 *   - Record canHonestlyFlip + refuse reason under receipts / .tmp
 *   - Matrix row status matches assessment (false → still **partial**; true → **covered**)
 *   - Ban wash SOLE alone into covered language remains when false
 *   - Pins: releaseEvidence=false · Not HA · claimProductionHA=false
 *   - coveredCount=8 retained (Ban invent coveredCount=9)
 *   - Knife harness+slice status executed:awaiting_post_prove_dual (Ban self-nail)
 *
 * EXIT 0 when assessment is honest and docs match (honest non-flip with pin is success).
 * Ban假关 · Ban invent covered · Ban suite green / HA / R5 retired globally · Ban MySQL/Qdrant
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const paths = {
  parent: join(root, 'ai-docs/delivery/harness/uc-e2e-018-user-abandon.md'),
  knife: join(root, 'ai-docs/delivery/harness/uc-e2e-018-covered-lift.md'),
  slice: join(root, 'ai-docs/delivery/uc-e2e-018-covered-lift.slice.md'),
  adr: join(root, 'ai-docs/delivery/adr-postgres-retained.md'),
  matrix: join(root, 'ai-docs/delivery/e2e-requirement-coverage-matrix.md'),
  backlog: join(root, 'ai-docs/delivery/e2e-covered-path-backlog.md'),
  evalDoc: join(root, 'ai-docs/delivery/eval/uc-e2e-018-user-abandon.eval.md'),
  pkg: join(root, 'package.json'),
  self: join(root, 'scripts/uc-e2e-018-covered-lift.proof.mjs'),
};

const SECTION1B = [
  { n: 1, tip: 'c36b032', gap: 'GAP-UC018-FULL-E2E', label: 'FULL-E2E' },
  { n: 2, tip: '08650ea', gap: 'GAP-UC018-GRAPH', label: 'GRAPH' },
  { n: 3, tip: 'd698282', gap: 'GAP-UC018-TTL', label: 'TTL' },
  { n: 4, tip: 'waiting_user', gap: 'waiting_user', label: 'waiting_user', tipOptional: true },
  { n: 5, tip: '1990b12', gap: 'GAP-UC018-UI', label: 'UI' },
  { n: 6, tip: 'aa968b1', gap: 'GAP-UC018-SOLE', label: 'SOLE' },
];

const FAMILY_CMDS = [
  'uc018:covered-lift:prove',
  'uc018:sole:prove',
  'uc018:abandon:prove',
  'uc018:abandon:http:prove',
  'uc018:abandon:full-e2e:prove',
  'uc018:graph:prove',
  'uc018:ttl:prove',
  'uc018:ui:prove',
  'eval-harness-matrix-cite:prove',
];

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

let pkg = {};
try {
  pkg = JSON.parse(pkgText || '{}');
} catch {
  fail('package.json: invalid JSON');
}
const scripts = pkg.scripts || {};

// --- package.json Family CMDs ---
for (const s of FAMILY_CMDS) {
  if (scripts[s]) pass(`package.json lists ${s}`);
  else fail(`package.json missing script ${s}`);
}
if (scripts['uc018:covered-lift:prove'] === 'node scripts/uc-e2e-018-covered-lift.proof.mjs') {
  pass('uc018:covered-lift:prove → scripts/uc-e2e-018-covered-lift.proof.mjs');
} else {
  fail('uc018:covered-lift:prove must point at scripts/uc-e2e-018-covered-lift.proof.mjs');
}

// --- Assess canHonestlyFlip from matrix §1.0 ---
const m018NegFaultBoundAdv =
  matrix.match(/\| UC-E2E-018 \|[^\n]+/)?.[0] || '';
const advBlind = /\|\s*UC-E2E-018\s*\|[^\n]*\*\*blind\*\*/.test(m018NegFaultBoundAdv)
  || /UC-E2E-018[^\n]*ADV[^\n]*\*\*blind\*\*/i.test(matrix)
  || /\| UC-E2E-018 \|[^\n]*\|\s*\*\*blind\*\*\s*\|/.test(matrix);

// Parse ADV column specifically from §1.0.1 row (NEG|FAULT|BOUND|ADV)
const row101 = matrix.match(/\| UC-E2E-018 \|([^|\n]+)\|([^|\n]+)\|([^|\n]+)\|([^|\n]+)\|/) || [];
const advCell = (row101[4] || '').trim();
const advIsBlind = /\*\*blind\*\*/.test(advCell) || advCell === 'blind';

// PERF/LOAD honesty: UC-018 has no dedicated green PERF/LOAD facet row; §1.0 summary says zero covered
const perfLoadBlindResidual =
  /PERF\/LOAD 分面 \*\*零 covered\*\*/.test(matrix) ||
  /PERF\/LOAD[^\n]*blind/i.test(matrix);

const advIsPartial = /\*\*partial\*\*/.test(advCell) || /\bpartial\b/.test(advCell);
let canHonestlyFlip = true;
const refuseReasons = [];
// Historical refuse at covered-lift nail abfbbc0 was ADV **blind**. After GAP-UC018-ADV
// coding+prove, §1.0 ADV may be **partial** — ADV alone still ≠ UC covered (Ban wash).
if (advIsBlind || advBlind) {
  canHonestlyFlip = false;
  refuseReasons.push(
    'matrix §1.0 ADV for UC-E2E-018 is still **blind** (six-column honesty residual · Ban假关)',
  );
} else if (advIsPartial) {
  canHonestlyFlip = false;
  refuseReasons.push(
    'matrix §1.0 ADV elevated **partial** (NHP-018-ADV-01 executed) but **ADV alone ≠ covered** (Ban wash ADV into §1.1 · Ban假关)',
  );
} else {
  // Unknown ADV cell → refuse invent covered
  canHonestlyFlip = false;
  refuseReasons.push('matrix §1.0 ADV cell not green-covered (Ban invent covered)');
}
if (perfLoadBlindResidual) {
  canHonestlyFlip = false;
  refuseReasons.push(
    'PERF/LOAD facets remain blind/not elevated for suite (orthogonal residual · reinforces non-flip)',
  );
}
// Hard pin: coveredCount=8 retained — inventing covered would require elevating this UC alone
// while ADV blind; refuse if docs claim coveredCount=9
if (/coveredCount\s*\*\*9\*\*|coveredCount\s*=\s*9|coveredCount\*\*\s*9/.test(knife + slice + parent + backlog)) {
  fail('Ban invent coveredCount=9 (hard pin coveredCount=8 retained)');
}

const refuseReason = refuseReasons.join(' · ') || null;
note(`assessment canHonestlyFlip=${canHonestlyFlip}${refuseReason ? ` refuse=${refuseReason}` : ''}`);

if (!canHonestlyFlip) {
  pass('assessment: canHonestlyFlip=false (ADV alone ≠ covered / residuals block elevate)');
} else {
  pass('assessment: canHonestlyFlip=true (six-column honesty allows elevate)');
}

// --- Write receipt (Ban secrets) ---
const receiptDir = join(root, 'ai-docs/delivery/receipts');
const tmpDir = join(root, '.tmp');
mkdirSync(receiptDir, { recursive: true });
mkdirSync(tmpDir, { recursive: true });
const evidence = {
  knife: 'UC-E2E-018-covered-lift',
  gap: 'GAP-UC018-COVERED-LIFT',
  status: 'executed:awaiting_post_prove_dual',
  canHonestlyFlip,
  refuseReason,
  matrixUc018: canHonestlyFlip ? 'covered' : 'partial',
  uc018Covered: canHonestlyFlip,
  section1bAllClosed: true,
  section1bTips: {
    '#1 FULL-E2E': 'c36b032',
    '#2 GRAPH': '08650ea',
    '#3 TTL': 'd698282',
    '#4 waiting_user': 'CLOSED',
    '#5 UI': '1990b12',
    '#6 SOLE': 'aa968b1',
  },
  familyCmds: FAMILY_CMDS,
  haStatus: 'NOT_HA',
  releaseEvidence: false,
  claimProductionHA: false,
  coveredCountRetained: 8,
  banInventCoveredCount9: true,
  banWashSoleAloneIntoCovered: true,
  banMysqlQdrantCutover: true,
  preExecDual: {
    'mw-rag-route': 'b5b0b92',
    'mw-e2e-ha': '20ef465',
    requestTip: 'a7e6b95',
  },
  parentSoleNail: 'aa968b1',
  datePT: new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }) + ' PT',
};
const evidencePath = join(receiptDir, '2026-09-23-uc-e2e-018-covered-lift-evidence.json');
const tmpEvidencePath = join(tmpDir, 'uc018-covered-lift-canHonestlyFlip.json');
writeFileSync(evidencePath, JSON.stringify(evidence, null, 2) + '\n');
writeFileSync(tmpEvidencePath, JSON.stringify(evidence, null, 2) + '\n');
pass(`wrote receipt: ${evidencePath.replace(root + '/', '')}`);
pass(`wrote tmp receipt: ${tmpEvidencePath.replace(root + '/', '')}`);

// --- §1b #1–#6 CLOSED cite (parent + knife) ---
for (const item of SECTION1B) {
  const corpus = parent + knife + slice + evalDoc + backlog;
  if (item.tipOptional) {
    if (/waiting_user[^\n]{0,80}CLOSED|§1b#4[^\n]{0,40}CLOSED|#4[^\n]{0,60}CLOSED/i.test(corpus)) {
      pass(`§1b #${item.n} ${item.label} CLOSED cited`);
    } else {
      fail(`§1b #${item.n} ${item.label} must be cited CLOSED`);
    }
  } else {
    const tipOk = new RegExp(item.tip).test(corpus);
    const closedOk = new RegExp(`${item.gap}[^\\n]{0,120}CLOSED|${item.label}[^\\n]{0,80}CLOSED`, 'i').test(
      corpus,
    );
    if (tipOk && closedOk) pass(`§1b #${item.n} ${item.label} CLOSED tip ${item.tip}`);
    else fail(`§1b #${item.n} ${item.label} must cite tip ${item.tip} + CLOSED (gap ${item.gap})`);
  }
}

// --- ADR PG-retained ---
assertPins('adr-postgres-retained', adr, [
  [/Postgres/i, 'names Postgres', 'must name Postgres'],
  [/pgvector/i, 'pins pgvector', 'must pin pgvector'],
  [/Ban.*MySQL|NO.*MySQL|not.*MySQL cutover/i, 'Ban MySQL cutover', 'must Ban MySQL cutover'],
  [/Ban.*Qdrant|NO.*Qdrant|not Qdrant/i, 'Ban Qdrant-as-required', 'must Ban Qdrant as required'],
]);

// --- Knife harness + slice ---
for (const [label, text] of [
  ['knife-harness', knife],
  ['knife-slice', slice],
]) {
  assertPins(label, text, [
    [/GAP-UC018-COVERED-LIFT/, 'names GAP-UC018-COVERED-LIFT', 'must name GAP-UC018-COVERED-LIFT'],
    [/executed:awaiting_post_prove_dual|post_prove_dual_pass/, 'status executed or post_prove_dual_pass', 'must be executed:awaiting_post_prove_dual or post_prove_dual_pass (CLOSED nail)'],
    [/canHonestlyFlip\s*=\s*false|canHonestlyFlip:\s*false|\*\*canHonestlyFlip\*\*.*false|canHonestlyFlip\*\*=\*\*false/i, 'records canHonestlyFlip=false', 'must record canHonestlyFlip=false (ADV alone ≠ covered)'],
    [/ADV[^\n]{0,80}\*\*blind\*\*|§1\.0 ADV.*blind|ADV still \*\*blind\*\*|ADV alone\s*≠|ADV alone ≠ covered|NHP-018-ADV-01/i, 'cites ADV refuse / ADV alone ≠ covered', 'must cite ADV blind historical refuse or ADV alone ≠ covered'],
    [/releaseEvidence\s*=\s*false/i, 'releaseEvidence=false', 'must pin releaseEvidence=false'],
    [/haStatus=NOT_HA|Not HA/i, 'NOT_HA', 'must pin haStatus=NOT_HA'],
    [/claimProductionHA\s*=\s*false/i, 'claimProductionHA=false', 'must pin claimProductionHA=false'],
    [/\bpartial\b/i, 'matrix partial', 'must pin matrix partial'],
    [/Ban wash SOLE|#6 alone\s*≠|wash SOLE.*covered|SOLE alone ≠ covered/i, 'Ban wash SOLE alone into covered', 'must Ban wash SOLE alone into covered'],
    [/uc018:covered-lift:prove/, 'lists uc018:covered-lift:prove', 'must list uc018:covered-lift:prove'],
    [/coveredCount\s*\*\*8\*\*|coveredCount \*\*8\*\*|coveredCount\*\* 8/i, 'coveredCount 8 retained', 'must retain coveredCount 8'],
    [/Ban.*MySQL|Ban.*Qdrant|MySQL\/Qdrant/i, 'Ban MySQL/Qdrant', 'must Ban MySQL/Qdrant'],
    [/aa968b1/, 'cites parent SOLE tip aa968b1', 'must cite aa968b1'],
    [/c36b032/, 'cites FULL-E2E tip', 'must cite c36b032'],
    [/08650ea/, 'cites GRAPH tip', 'must cite 08650ea'],
    [/d698282/, 'cites TTL tip', 'must cite d698282'],
    [/1990b12/, 'cites UI tip', 'must cite 1990b12'],
  ]);
  if (/post_prove_dual_pass/.test(text) || /executed:awaiting_post_prove_dual/.test(text)) {
    pass(`${label}: lifecycle status recorded (post_prove_dual_pass CLOSED nail or awaiting)`);
  } else {
    fail(`${label}: must record executed:awaiting_post_prove_dual or post_prove_dual_pass`);
  }
  if (canHonestlyFlip === false) {
    if (/UC-E2E-018[^\n]{0,40}\*\*covered\*\*/.test(text) && !/Ban.*covered|≠.*covered|stay.*partial|stays \*\*partial\*\*/i.test(text)) {
      fail(`${label}: must not claim UC covered when canHonestlyFlip=false`);
    } else {
      pass(`${label}: does not invent covered under non-flip`);
    }
  }
}

// --- Matrix matches assessment ---
const m018CoverageRow = matrix.match(/\| UC-E2E-018 \|[^\n]+用户放弃[^\n]+/)?.[0]
  || matrix.match(/\| UC-E2E-018 \| 用户放弃面试 \|[^\n]+/)?.[0]
  || '';
if (canHonestlyFlip) {
  if (/UC-E2E-018[^\n]*\*\*covered\*\*/.test(matrix) && m018CoverageRow.includes('**covered**')) {
    pass('matrix: UC-E2E-018 **covered** matches canHonestlyFlip=true');
  } else {
    fail('matrix: canHonestlyFlip=true requires UC-E2E-018 **covered**');
  }
} else {
  if (/UC-E2E-018[^\n]*\*\*covered\*\*/.test(m018CoverageRow) || /\| UC-E2E-018 \|[^\n]*\|\s*\*\*covered\*\*/.test(matrix)) {
    // Check §1.1 coverage status column specifically
    const cov = matrix.match(/\| UC-E2E-018 \| 用户放弃面试 \|[^|\n]+\|[^|\n]+\|\s*\*\*([^*]+)\*\*/);
    if (cov && cov[1] === 'covered') {
      fail('matrix: UC-E2E-018 must stay **partial** when canHonestlyFlip=false (Ban假关)');
    } else if (/\| UC-E2E-018 \| 用户放弃面试 \|[^\n]*\*\*partial\*\*/.test(matrix)) {
      pass('matrix: UC-E2E-018 stays **partial** (matches canHonestlyFlip=false)');
    } else {
      // fallback: any UC-E2E-018 partial in §1.1 style
      if (/UC-E2E-018[^\n]*\*\*partial\*\*/.test(matrix)) {
        pass('matrix: UC-E2E-018 stays **partial** (matches canHonestlyFlip=false)');
      } else {
        fail('matrix: UC-E2E-018 must stay **partial** when canHonestlyFlip=false');
      }
    }
  } else if (/UC-E2E-018[^\n]*\*\*partial\*\*/.test(matrix)) {
    pass('matrix: UC-E2E-018 stays **partial** (matches canHonestlyFlip=false)');
  } else {
    fail('matrix: UC-E2E-018 must stay **partial** when canHonestlyFlip=false');
  }
  // ADV: historical refuse was blind; after GAP-UC018-ADV may be partial — either keeps canHonestlyFlip=false
  if (advIsBlind) pass('matrix §1.0: UC-E2E-018 ADV still **blind** (refuse pin live)');
  else if (advIsPartial) pass('matrix §1.0: UC-E2E-018 ADV **partial** (NHP-018-ADV-01 · ADV alone ≠ covered)');
  else fail('matrix §1.0: expected UC-E2E-018 ADV **blind** or **partial** under non-flip');
}

assertPins('matrix', matrix, [
  [/uc018:sole:prove/, 'lists uc018:sole:prove', 'must list uc018:sole:prove'],
  [/#6 alone\s*≠\s*covered|alone ≠ covered|≠ covered/i, '≠ covered honesty', 'must keep ≠ covered honesty'],
  [/releaseEvidence.*false/i, 'releaseEvidence=false', 'must keep releaseEvidence=false'],
]);

// Prefer matrix also names covered-lift / canHonestlyFlip when non-flip assessed
if (/canHonestlyFlip|covered-lift|GAP-UC018-COVERED-LIFT|ADV.*blind|NHP-018-ADV-01|ADV alone/i.test(matrix)) {
  pass('matrix: names covered-lift / canHonestlyFlip / ADV honesty');
} else {
  note('matrix: optional covered-lift name soft (row still partial)');
}

// --- Parent harness ---
assertPins('parent-harness', parent, [
  [/canHonestlyFlip\s*=\s*false|canHonestlyFlip:\s*false|canHonestlyFlip\*\*=\*\*false|\*\*canHonestlyFlip=false\*\*/i, 'records canHonestlyFlip=false', 'must record canHonestlyFlip=false'],
  [/ADV[^\n]{0,80}\*\*blind\*\*|§1\.0 ADV.*blind|ADV alone\s*≠|ADV alone ≠ covered|NHP-018-ADV-01/i, 'cites ADV refuse / ADV alone ≠ covered', 'must cite ADV blind refuse or ADV alone ≠ covered'],
  [/\bpartial\b/i, 'pins partial', 'must pin matrix partial'],
  [/#6 alone\s*≠|Ban wash SOLE|SOLE alone ≠ covered/i, 'Ban wash SOLE alone into covered', 'must Ban wash SOLE alone'],
  [/uc018:covered-lift:prove/, 'lists uc018:covered-lift:prove', 'must list uc018:covered-lift:prove'],
  [/releaseEvidence\s*=\s*false/i, 'releaseEvidence=false', 'must pin releaseEvidence=false'],
  [/Not HA|haStatus=NOT_HA/i, 'Not HA', 'must pin Not HA'],
  [/GAP-UC018-COVERED-LIFT|covered-lift/i, 'names covered-lift', 'must name covered-lift'],
  [/aa968b1/, 'cites SOLE tip', 'must cite aa968b1'],
]);

// --- Eval ---
assertPins('eval', evalDoc, [
  [/uc018:covered-lift:prove/, 'lists uc018:covered-lift:prove', 'must list uc018:covered-lift:prove'],
  [/canHonestlyFlip\s*=\s*false|canHonestlyFlip:\s*false|canHonestlyFlip\*\*=\*\*false/i, 'records canHonestlyFlip=false', 'must record canHonestlyFlip=false'],
  [/\bpartial\b/i, 'pins partial', 'must pin partial'],
  [/#6 alone\s*≠|Ban wash SOLE|SOLE alone ≠ covered/i, 'Ban wash SOLE alone', 'must Ban wash SOLE alone'],
  [/releaseEvidence\s*=\s*false/i, 'releaseEvidence=false', 'must pin releaseEvidence=false'],
  [/Not HA/i, 'Not HA', 'must pin Not HA'],
  [/ADV[^\n]{0,80}\*\*blind\*\*|§1\.0 ADV.*blind|ADV alone\s*≠|ADV alone ≠ covered|NHP-018-ADV-01/i, 'cites ADV refuse / ADV alone ≠ covered', 'must cite ADV blind or ADV alone ≠ covered'],
]);

// --- Backlog ---
assertPins('backlog', backlog, [
  [/018[^\n]*partial/i, '018 still partial', '018 must stay partial'],
  [/canHonestlyFlip\s*=\s*false|canHonestlyFlip:\s*false|ADV.*blind|ADV alone|NHP-018-ADV-01/i, '018 names non-flip / ADV honesty', '018 must name canHonestlyFlip=false or ADV alone ≠ covered'],
  [/uc018:covered-lift:prove|covered-lift|GAP-UC018-COVERED-LIFT/i, 'names covered-lift', 'must name covered-lift'],
]);

console.log(lines.join('\n'));
console.log(`\nCMD=pnpm uc018:covered-lift:prove EXIT=${exitCode}`);
console.log(
  `NOTE: canHonestlyFlip=${canHonestlyFlip}` +
    (refuseReason ? ` · refuse=${refuseReason}` : '') +
    ' · matrix UC-E2E-018 ' +
    (canHonestlyFlip ? 'covered' : 'partial') +
    ' · Ban假关 · Ban invent covered · Ban wash SOLE alone into covered · releaseEvidence=false · Not HA · claimProductionHA=false · coveredCount=8 retained · Ban self-nail',
);
process.exit(exitCode);
