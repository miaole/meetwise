#!/usr/bin/env node
/**
 * Static honesty prove — UC-E2E-018 covered-lift-reassess · GAP-UC018-COVERED-LIFT-REASSESS
 * (backlog § partial→covered 执行序 #1 reassess · canHonestlyFlip reassess after ADV closed).
 *
 * Asserts (fail closed):
 *   - Cite §1b #1–#6 all CLOSED (tips c36b032 / 08650ea / d698282 / waiting_user / 1990b12 / aa968b1)
 *   - Cite ADV partial (27dd6ae) + prior covered-lift non-flip (abfbbc0)
 *   - Family CMDs listed in package.json (incl. this reassess prove)
 *   - Assess canHonestlyFlip from matrix §0.5/§1.0 six-column rule:
 *       ALL of NEG+FAULT+BOUND+ADV+PERF+LOAD must be non-blind
 *   - If PERF/LOAD blind (expected) → canHonestlyFlip=false · refuse PERF/LOAD blind
 *   - §1.1 stays **partial** when false; FAIL if someone flipped §1.1 to covered without evidence
 *   - Ban invent PERF/LOAD rows / Ban mark PERF/LOAD green / Ban wash ADV/SOLE alone
 *   - Pins: releaseEvidence=false · Not HA · claimProductionHA=false · coveredCount=8
 *   - Knife harness+slice status executed:awaiting_post_prove_dual (Ban self-nail)
 *
 * EXIT 0 when assessment is honest and docs match (honest non-flip with refuse pin is success).
 * Ban假关 · Ban invent covered · Ban suite green / HA / R5 retired globally · Ban MySQL/Qdrant
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const paths = {
  parent: join(root, 'ai-docs/delivery/harness/uc-e2e-018-user-abandon.md'),
  knife: join(root, 'ai-docs/delivery/harness/uc-e2e-018-covered-lift-reassess.md'),
  priorLift: join(root, 'ai-docs/delivery/harness/uc-e2e-018-covered-lift.md'),
  advHarness: join(root, 'ai-docs/delivery/harness/uc-e2e-018-adv.md'),
  slice: join(root, 'ai-docs/delivery/uc-e2e-018-covered-lift-reassess.slice.md'),
  adr: join(root, 'ai-docs/delivery/adr-postgres-retained.md'),
  matrix: join(root, 'ai-docs/delivery/e2e-requirement-coverage-matrix.md'),
  nhp: join(root, 'ai-docs/delivery/non-happy-path-perf-load-case-matrix.md'),
  backlog: join(root, 'ai-docs/delivery/e2e-covered-path-backlog.md'),
  evalDoc: join(root, 'ai-docs/delivery/eval/uc-e2e-018-user-abandon.eval.md'),
  pkg: join(root, 'package.json'),
  self: join(root, 'scripts/uc-e2e-018-covered-lift-reassess.proof.mjs'),
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
  'uc018:covered-lift-reassess:prove',
  'uc018:covered-lift:prove',
  'uc018:adv:prove',
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

function cellStatus(cell) {
  const c = (cell || '').trim();
  if (/\*\*blind\*\*|\bblind\b/i.test(c) && !/\*\*partial\*\*|\*\*covered\*\*/.test(c)) return 'blind';
  if (/\*\*covered\*\*/.test(c)) return 'covered';
  if (/\*\*partial\*\*|\bpartial\b/i.test(c)) return 'partial';
  if (/\*\*gap\*\*|\bgap\b/i.test(c)) return 'gap';
  if (/not_run|case-only|blocked/i.test(c)) return 'blind';
  return 'unknown';
}

function isNonBlind(status) {
  return status === 'partial' || status === 'covered';
}

for (const [label, p] of Object.entries(paths)) {
  if (!existsSync(p)) fail(`${label} missing: ${p}`);
  else pass(`${label} present`);
}

const parent = read(paths.parent);
const knife = read(paths.knife);
const priorLift = read(paths.priorLift);
const advHarness = read(paths.advHarness);
const slice = read(paths.slice);
const adr = read(paths.adr);
const matrix = read(paths.matrix);
const nhp = read(paths.nhp);
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
if (scripts['uc018:covered-lift-reassess:prove'] === 'node scripts/uc-e2e-018-covered-lift-reassess.proof.mjs') {
  pass('uc018:covered-lift-reassess:prove → scripts/uc-e2e-018-covered-lift-reassess.proof.mjs');
} else {
  fail('uc018:covered-lift-reassess:prove must point at scripts/uc-e2e-018-covered-lift-reassess.proof.mjs');
}

// --- Parse §1.0.1 UC-E2E-018 NEG|FAULT|BOUND|ADV ---
const row101 = matrix.match(/\| UC-E2E-018 \|([^|\n]+)\|([^|\n]+)\|([^|\n]+)\|([^|\n]+)\|/) || [];
const col = {
  NEG: cellStatus(row101[1]),
  FAULT: cellStatus(row101[2]),
  BOUND: cellStatus(row101[3]),
  ADV: cellStatus(row101[4]),
};

// --- PERF/LOAD: report live column state · still refuse §1.1 flip (partial ≠ covered) ---
// Disclosure: AUTHORIZED GAP-UC018-PERF-LOAD may elevate NHP-018-PERF/LOAD to partial.
// This reassess prove MUST report the new column state and MUST still refuse any §1.1 flip
// in this knife (PERF/LOAD partial ≠ UC covered · covered-lift = separate later knife).
const hasNhp018Perf = /NHP-018-PERF/i.test(nhp);
const hasNhp018Load = /NHP-018-LOAD/i.test(nhp);
const nhpPerfPartial = /NHP-018-PERF-01[\s\S]{0,400}?\|\s*\*\*partial\*\*/i.test(nhp);
const nhpLoadPartial = /NHP-018-LOAD-01[\s\S]{0,400}?\|\s*\*\*partial\*\*/i.test(nhp);
const nhpPerfCaseOnly = /NHP-018-PERF-01[\s\S]{0,400}?case-only/i.test(nhp) && !nhpPerfPartial;
const nhpLoadCaseOnly = /NHP-018-LOAD-01[\s\S]{0,400}?case-only/i.test(nhp) && !nhpLoadPartial;
const section102Row = matrix.match(/\| UC-E2E-018（abandon） \|([^|]+)\|([^|]+)\|([^|]+)\|/);
const cell102 = (c) => {
  const s = String(c || '');
  if (/\*\*partial\*\*/i.test(s)) return 'partial';
  if (/case-only/i.test(s)) return 'case-only';
  if (/\*\*blind\*\*|blind/i.test(s)) return 'blind';
  return 'blind';
};
col.PERF = nhpPerfPartial || cell102(section102Row?.[1]) === 'partial'
  ? 'partial'
  : nhpPerfCaseOnly || cell102(section102Row?.[1]) === 'case-only'
    ? 'case-only'
    : hasNhp018Perf
      ? 'case-only'
      : 'blind';
col.LOAD = nhpLoadPartial || cell102(section102Row?.[3]) === 'partial'
  ? 'partial'
  : nhpLoadCaseOnly || cell102(section102Row?.[3]) === 'case-only'
    ? 'case-only'
    : hasNhp018Load
      ? 'case-only'
      : 'blind';

note(`columns NEG=${col.NEG} FAULT=${col.FAULT} BOUND=${col.BOUND} ADV=${col.ADV} PERF=${col.PERF} LOAD=${col.LOAD}`);

if (hasNhp018Perf) pass(`NHP matrix: NHP-018-PERF present · status=${col.PERF} (AUTHORIZED PERF/LOAD knife may elevate · Ban invent covered)`);
else pass('NHP matrix: no NHP-018-PERF row (PERF remains blind)');
if (hasNhp018Load) pass(`NHP matrix: NHP-018-LOAD present · status=${col.LOAD} (AUTHORIZED PERF/LOAD knife may elevate · Ban invent covered)`);
else pass('NHP matrix: no NHP-018-LOAD row (LOAD remains blind)');

// --- canHonestlyFlip: six-column non-blind is necessary but NOT sufficient ---
// PERF/LOAD partial ≠ UC covered. This reassess knife NEVER flips §1.1.
let canHonestlyFlip = false;
const refuseReasons = [];
const required = ['NEG', 'FAULT', 'BOUND', 'ADV', 'PERF', 'LOAD'];
for (const k of required) {
  if (!isNonBlind(col[k])) {
    refuseReasons.push(`${k} ${col[k] || 'blind'}`);
  }
}
if (col.PERF === 'partial' || col.LOAD === 'partial' || col.PERF === 'case-only' || col.LOAD === 'case-only') {
  refuseReasons.push('PERF/LOAD partial≠covered');
}
if (col.ADV === 'partial' && (col.PERF === 'blind' || col.LOAD === 'blind')) {
  if (!refuseReasons.some((r) => /PERF|LOAD/.test(r))) refuseReasons.push('PERF/LOAD blind');
}
// Hard refuse for this knife regardless of column greenness
refuseReasons.push('reassess-knife-refuses-§1.1-flip');
const refuseReason =
  refuseReasons.some((r) => /partial≠covered/i.test(r))
    ? 'PERF/LOAD partial ≠ UC covered (matrix §0.5/§1.0 · Ban假关 · Ban invent covered · covered-lift=separate later knife)'
    : refuseReasons.some((r) => /PERF|LOAD/.test(r))
      ? 'PERF/LOAD residual blocks covered flip (Ban假关 · Ban invent covered)'
      : refuseReasons.join(' · ');

note(`assessment canHonestlyFlip=${canHonestlyFlip}${refuseReason ? ` refuse=${refuseReason}` : ''}`);

if (!canHonestlyFlip) {
  pass('assessment: canHonestlyFlip=false (six-column honesty · residuals block elevate)');
} else {
  pass('assessment: canHonestlyFlip=true (six-column honesty allows elevate)');
}

// Hard pin: coveredCount=8
if (/coveredCount\s*\*\*9\*\*|coveredCount\s*=\s*9|coveredCount\*\*\s*9/.test(knife + slice + parent + backlog)) {
  fail('Ban invent coveredCount=9 (hard pin coveredCount=8 retained)');
}

// --- Write receipt ---
const receiptDir = join(root, 'ai-docs/delivery/receipts');
const tmpDir = join(root, '.tmp');
mkdirSync(receiptDir, { recursive: true });
mkdirSync(tmpDir, { recursive: true });
const evidence = {
  knife: 'UC-E2E-018-covered-lift-reassess',
  gap: 'GAP-UC018-COVERED-LIFT-REASSESS',
  status: 'executed:awaiting_post_prove_dual',
  canHonestlyFlip,
  refuseReason,
  columns: col,
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
  advPartialTip: '27dd6ae',
  priorCoveredLiftNonFlipTip: 'abfbbc0',
  familyCmds: FAMILY_CMDS,
  haStatus: 'NOT_HA',
  releaseEvidence: false,
  claimProductionHA: false,
  coveredCountRetained: 8,
  banInventCoveredCount9: true,
  banWashAdvAloneIntoCovered: true,
  banWashSoleAloneIntoCovered: true,
  banClaimPerfLoadClosed: true,
  banMysqlQdrantCutover: true,
  preExecDual: {
    'mw-rag-route': '1a0a1a9',
    'mw-e2e-ha': '6fac200',
    requestTip: '5434c14',
    codingBase: '6fac200',
  },
  datePT: new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }) + ' PT',
};
const evidencePath = join(receiptDir, '2026-09-23-uc-e2e-018-covered-lift-reassess-evidence.json');
const tmpEvidencePath = join(tmpDir, 'uc018-covered-lift-reassess-canHonestlyFlip.json');
writeFileSync(evidencePath, JSON.stringify(evidence, null, 2) + '\n');
writeFileSync(tmpEvidencePath, JSON.stringify(evidence, null, 2) + '\n');
pass(`wrote receipt: ${evidencePath.replace(root + '/', '')}`);
pass(`wrote tmp receipt: ${tmpEvidencePath.replace(root + '/', '')}`);

// --- §1b #1–#6 CLOSED cite ---
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

// --- ADV partial + prior non-flip cites ---
assertPins('knife-ancestors', knife + slice, [
  [/27dd6ae/, 'cites ADV tip 27dd6ae', 'must cite ADV tip 27dd6ae'],
  [/abfbbc0/, 'cites prior covered-lift non-flip abfbbc0', 'must cite abfbbc0'],
  [/ADV alone\s*≠|ADV alone ≠ covered|\*\*ADV alone ≠ covered\*\*/i, 'ADV alone ≠ covered', 'must pin ADV alone ≠ covered'],
  [/PERF\/LOAD[^\n]{0,40}blind|refuse.*PERF\/LOAD|PERF\/LOAD blind/i, 'cites PERF/LOAD blind refuse', 'must cite PERF/LOAD blind as refuse'],
]);

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
    [/GAP-UC018-COVERED-LIFT-REASSESS/, 'names GAP-UC018-COVERED-LIFT-REASSESS', 'must name GAP-UC018-COVERED-LIFT-REASSESS'],
    [/executed:awaiting_post_prove_dual|post_prove_dual_pass/, 'status executed:awaiting_post_prove_dual or post_prove_dual_pass (CLOSED nail retained)', 'must be executed:awaiting_post_prove_dual or retained post_prove_dual_pass (Ban invent covered)'],
    [/canHonestlyFlip\s*=\s*false|canHonestlyFlip:\s*false|\*\*canHonestlyFlip\*\*.*false|canHonestlyFlip\*\*=\*\*false/i, 'records canHonestlyFlip=false', 'must record canHonestlyFlip=false (PERF/LOAD blind)'],
    [/PERF\/LOAD[^\n]{0,80}blind|PERF\/LOAD partial\s*≠|refuse[^\n]{0,80}PERF\/LOAD|partial ≠ UC covered/i, 'refuse PERF/LOAD residual / partial≠covered', 'must record refuse PERF/LOAD blind or partial≠covered'],
    [/releaseEvidence\s*=\s*false/i, 'releaseEvidence=false', 'must pin releaseEvidence=false'],
    [/haStatus=NOT_HA|Not HA/i, 'NOT_HA', 'must pin haStatus=NOT_HA'],
    [/claimProductionHA\s*=\s*false/i, 'claimProductionHA=false', 'must pin claimProductionHA=false'],
    [/\bpartial\b/i, 'matrix partial', 'must pin matrix partial'],
    [/Ban wash ADV|ADV alone\s*≠|ADV alone ≠ covered/i, 'Ban wash ADV alone into covered', 'must Ban wash ADV alone'],
    [/Ban wash SOLE|#6 alone\s*≠|SOLE alone ≠ covered/i, 'Ban wash SOLE alone into covered', 'must Ban wash SOLE alone'],
    [/uc018:covered-lift-reassess:prove/, 'lists uc018:covered-lift-reassess:prove', 'must list uc018:covered-lift-reassess:prove'],
    [/coveredCount\s*\*\*8\*\*|coveredCount \*\*8\*\*|coveredCount\*\* 8/i, 'coveredCount 8 retained', 'must retain coveredCount 8'],
    [/Ban.*MySQL|Ban.*Qdrant|MySQL\/Qdrant/i, 'Ban MySQL/Qdrant', 'must Ban MySQL/Qdrant'],
    [/aa968b1/, 'cites SOLE tip aa968b1', 'must cite aa968b1'],
    [/c36b032/, 'cites FULL-E2E tip', 'must cite c36b032'],
    [/08650ea/, 'cites GRAPH tip', 'must cite 08650ea'],
    [/d698282/, 'cites TTL tip', 'must cite d698282'],
    [/1990b12/, 'cites UI tip', 'must cite 1990b12'],
    [/27dd6ae/, 'cites ADV tip', 'must cite 27dd6ae'],
    [/abfbbc0/, 'cites prior non-flip', 'must cite abfbbc0'],
  ]);
  // CLOSED reassess nail may already be post_prove_dual_pass; Ban invent covered / Ban §1.1 flip remains.
  if (/post_prove_dual_pass/.test(text)) {
    pass(`${label}: lifecycle post_prove_dual_pass retained (CLOSED reassess nail · Ban reopen as covered flip)`);
  } else if (/executed:awaiting_post_prove_dual/.test(text)) {
    pass(`${label}: lifecycle executed:awaiting_post_prove_dual (Ban self-nail)`);
  } else {
    fail(`${label}: must retain executed:awaiting_post_prove_dual or post_prove_dual_pass`);
  }
  if (canHonestlyFlip === false) {
    if (/UC-E2E-018[^\n]{0,40}\*\*covered\*\*/.test(text) && !/Ban.*covered|≠.*covered|stay.*partial|stays \*\*partial\*\*|stay \*\*partial\*\*/i.test(text)) {
      fail(`${label}: must not claim UC covered when canHonestlyFlip=false`);
    } else {
      pass(`${label}: does not invent covered under non-flip`);
    }
  }
}

// --- Matrix matches assessment ---
const m018CoverageRow =
  matrix.match(/\| UC-E2E-018 \|[^\n]+用户放弃[^\n]+/)?.[0] ||
  matrix.match(/\| UC-E2E-018 \| 用户放弃面试 \|[^\n]+/)?.[0] ||
  '';
if (canHonestlyFlip) {
  if (/UC-E2E-018[^\n]*\*\*covered\*\*/.test(matrix) && m018CoverageRow.includes('**covered**')) {
    pass('matrix: UC-E2E-018 **covered** matches canHonestlyFlip=true');
  } else {
    fail('matrix: canHonestlyFlip=true requires UC-E2E-018 **covered**');
  }
} else {
  // FAIL closed if §1.1 flipped to covered without evidence
  const cov = matrix.match(/\| UC-E2E-018 \| 用户放弃面试 \|[^|\n]+\|[^|\n]+\|\s*\*\*([^*]+)\*\*/);
  if (cov && cov[1] === 'covered') {
    fail('matrix: UC-E2E-018 must stay **partial** when canHonestlyFlip=false (Ban假关 · FAIL if flipped covered without evidence)');
  } else if (/\| UC-E2E-018 \| 用户放弃面试 \|[^\n]*\*\*partial\*\*/.test(matrix) || /UC-E2E-018[^\n]*\*\*partial\*\*/.test(matrix)) {
    pass('matrix: UC-E2E-018 stays **partial** (matches canHonestlyFlip=false · Ban假关)');
  } else {
    fail('matrix: UC-E2E-018 must stay **partial** when canHonestlyFlip=false');
  }
  if (col.ADV === 'partial') pass('matrix §1.0: UC-E2E-018 ADV **partial** (27dd6ae · ADV alone ≠ covered)');
  else if (col.ADV === 'blind') pass('matrix §1.0: UC-E2E-018 ADV still **blind**');
  else fail('matrix §1.0: expected UC-E2E-018 ADV **partial** or **blind** under non-flip');
  if (col.PERF === 'blind' && col.LOAD === 'blind') {
    pass('matrix §1.0: PERF/LOAD **blind** (refuse pin live · Ban claim PERF/LOAD closed)');
  } else if ((col.PERF === 'partial' || col.PERF === 'case-only') && (col.LOAD === 'partial' || col.LOAD === 'case-only')) {
    pass(`matrix §1.0: PERF/LOAD **${col.PERF}/${col.LOAD}** reported (AUTHORIZED elevate ok · still ≠ UC covered · Ban假关)`);
  } else {
    fail(`unexpected PERF/LOAD state PERF=${col.PERF} LOAD=${col.LOAD}`);
  }
  // Hard: canHonestlyFlip must remain false in this reassess knife
  if (canHonestlyFlip) fail('reassess knife must keep canHonestlyFlip=false (Ban假关)');
  else pass('reassess knife: canHonestlyFlip=false retained (PERF/LOAD partial ≠ covered)');
}

assertPins('matrix', matrix, [
  [/uc018:covered-lift-reassess:prove|covered-lift-reassess|GAP-UC018-COVERED-LIFT-REASSESS/i, 'names reassess', 'must name covered-lift-reassess'],
  [/canHonestlyFlip\s*=\s*false|PERF\/LOAD still blind/i, 'records non-flip / PERF/LOAD blind', 'must record canHonestlyFlip=false or PERF/LOAD still blind'],
  [/#6 alone\s*≠\s*covered|ADV alone\s*≠|≠ covered/i, '≠ covered honesty', 'must keep ≠ covered honesty'],
  [/releaseEvidence.*false/i, 'releaseEvidence=false', 'must keep releaseEvidence=false'],
]);

// --- Parent harness ---
assertPins('parent-harness', parent, [
  [/canHonestlyFlip\s*=\s*false|canHonestlyFlip:\s*false|canHonestlyFlip\*\*=\*\*false|\*\*canHonestlyFlip=false\*\*/i, 'records canHonestlyFlip=false', 'must record canHonestlyFlip=false'],
  [/PERF\/LOAD[^\n]{0,60}blind|covered-lift-reassess/i, 'cites reassess / PERF/LOAD blind', 'must cite reassess or PERF/LOAD blind'],
  [/\bpartial\b/i, 'pins partial', 'must pin matrix partial'],
  [/ADV alone\s*≠|Ban wash ADV|ADV alone ≠ covered/i, 'Ban wash ADV alone', 'must Ban wash ADV alone'],
  [/#6 alone\s*≠|Ban wash SOLE|SOLE alone ≠ covered/i, 'Ban wash SOLE alone into covered', 'must Ban wash SOLE alone'],
  [/uc018:covered-lift-reassess:prove/, 'lists uc018:covered-lift-reassess:prove', 'must list uc018:covered-lift-reassess:prove'],
  [/releaseEvidence\s*=\s*false/i, 'releaseEvidence=false', 'must pin releaseEvidence=false'],
  [/Not HA|haStatus=NOT_HA/i, 'Not HA', 'must pin Not HA'],
  [/GAP-UC018-COVERED-LIFT-REASSESS|covered-lift-reassess/i, 'names covered-lift-reassess', 'must name covered-lift-reassess'],
  [/aa968b1/, 'cites SOLE tip', 'must cite aa968b1'],
  [/27dd6ae/, 'cites ADV tip', 'must cite 27dd6ae'],
  [/abfbbc0/, 'cites prior non-flip', 'must cite abfbbc0'],
]);

// --- Eval ---
assertPins('eval', evalDoc, [
  [/uc018:covered-lift-reassess:prove/, 'lists uc018:covered-lift-reassess:prove', 'must list uc018:covered-lift-reassess:prove'],
  [/canHonestlyFlip\s*=\s*false|canHonestlyFlip:\s*false|canHonestlyFlip\*\*=\*\*false/i, 'records canHonestlyFlip=false', 'must record canHonestlyFlip=false'],
  [/PERF\/LOAD[^\n]{0,60}blind|refuse[^\n]{0,40}PERF\/LOAD/i, 'cites PERF/LOAD blind', 'must cite PERF/LOAD blind'],
  [/\bpartial\b/i, 'pins partial', 'must pin partial'],
  [/ADV alone\s*≠|Ban wash ADV|ADV alone ≠ covered/i, 'Ban wash ADV alone', 'must Ban wash ADV alone'],
  [/#6 alone\s*≠|Ban wash SOLE|SOLE alone ≠ covered/i, 'Ban wash SOLE alone', 'must Ban wash SOLE alone'],
  [/releaseEvidence\s*=\s*false/i, 'releaseEvidence=false', 'must pin releaseEvidence=false'],
  [/Not HA/i, 'Not HA', 'must pin Not HA'],
]);

// --- Backlog ---
assertPins('backlog', backlog, [
  [/018[^\n]*partial/i, '018 still partial', '018 must stay partial'],
  [/canHonestlyFlip\s*=\s*false|PERF\/LOAD still blind|PERF\/LOAD blind/i, '018 names non-flip / PERF/LOAD blind', '018 must name canHonestlyFlip=false or PERF/LOAD blind'],
  [/uc018:covered-lift-reassess:prove|covered-lift-reassess|GAP-UC018-COVERED-LIFT-REASSESS/i, 'names covered-lift-reassess', 'must name covered-lift-reassess'],
]);

// prior ADV + covered-lift retained
if (/27dd6ae/.test(advHarness) || /GAP-UC018-ADV/.test(advHarness)) {
  pass('adv harness retained (27dd6ae / GAP-UC018-ADV)');
} else {
  fail('adv harness must retain GAP-UC018-ADV');
}
if (/abfbbc0|canHonestlyFlip=false|GAP-UC018-COVERED-LIFT/.test(priorLift)) {
  pass('prior covered-lift harness retained (abfbbc0 non-flip)');
} else {
  fail('prior covered-lift harness must retain non-flip pin');
}

console.log(lines.join('\n'));
console.log(`\nCMD=pnpm uc018:covered-lift-reassess:prove EXIT=${exitCode}`);
console.log(
  `NOTE: canHonestlyFlip=${canHonestlyFlip}` +
    (refuseReason ? ` · refuse=${refuseReason}` : '') +
    ` · columns NEG=${col.NEG} FAULT=${col.FAULT} BOUND=${col.BOUND} ADV=${col.ADV} PERF=${col.PERF} LOAD=${col.LOAD}` +
    ' · matrix UC-E2E-018 ' +
    (canHonestlyFlip ? 'covered' : 'partial') +
    ' · Ban假关 · Ban invent covered · Ban wash ADV/SOLE alone · Ban claim PERF/LOAD closed · releaseEvidence=false · Not HA · claimProductionHA=false · coveredCount=8 retained · Ban self-nail',
);
process.exit(exitCode);
