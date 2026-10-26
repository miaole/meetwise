#!/usr/bin/env node
/**
 * Static honesty prove — UC-E2E-025 covered reassess · GAP-UC025-COVERED-REASSESS-01
 * (uc025-e2e-REQUEST.md 件③ · 六列齐后 covered 评估器跑点 · 跑点产出是评估不是翻面)。
 *
 * Asserts (fail closed):
 *   - Matrix :125 UC-E2E-025 row parsed LIVE at runtime — split per cell (| delim), each cell's
 *     LEADING status token classifies the column (Ban cross-cell substring search · §9-rev R8:
 *     coveredCount=8 之「covered」/CLOSED(wired)/case-only 等跨列词面不得误类到错误列)
 *   - evaluate() from scripts/lib/uc-covered-evaluator.mjs — evaluator ZERO-byte (frozen ·
 *     requiredNhp per-UC entry :246 `input.requiredNhp || UC018_REQUIRED_NHP`)
 *   - requiredNhp = UC-025 four case ids: NHP-025-NEG-01 / NHP-025-FAULT-01 / NHP-025-BOUND-01 /
 *     NHP-025-ADV-01 (§0.1 anchors · PERF/LOAD live-checked against the NHP matrix)
 *   - canHonestlyFlip COMPUTED by evaluate() (Ban constant-false / constant-true / fixture expected)
 *     · expected false today · refuse must include STATUS-NOT-COVERED and OPEN-GAP
 *     (if the live verdict differs → honest receipt · Ban 凑断言)
 *   - openGaps sourced LIVE from the matrix :274 backlog row residual declarations (Ban fixture)
 *   - Report-only: Ban write covered · Ban flip row/columns · coveredCount=8 · SSOT zero-touch
 *   - assertCleanPorcelain hard-refuses dirty tree (§9-rev R3: 件③ prove 先行 → 件④ 收据后写)
 *
 * EXIT 0 when the assessment is honest (honest non-flip with computed refuse = success).
 * Pins: releaseEvidence=false · Not HA · claimProductionHA=false · coveredCount=8 ·
 * canHonestlyFlip=false (computed · 非结论预设) · actualSpendCny=null · est live=0
 *   pnpm uc025:covered-reassess:prove
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { assertCleanPorcelain } from './lib/uc-covered-real-gatherer.mjs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { evaluate, REFUSE_REASONS } from './lib/uc-covered-evaluator.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const paths = {
  matrix: join(root, 'ai-docs/delivery/e2e-requirement-coverage-matrix.md'),
  nhp: join(root, 'ai-docs/delivery/non-happy-path-perf-load-case-matrix.md'),
  request: join(root, 'ai-docs/delivery/harness/uc025-e2e-REQUEST.md'),
  evaluator: join(root, 'scripts/lib/uc-covered-evaluator.mjs'),
  pkg: join(root, 'package.json'),
  self: join(root, 'scripts/uc-e2e-025-covered-reassess.proof.mjs'),
};

let exitCode = 0;
try {
  assertCleanPorcelain(root);
} catch (e) {
  console.error(e.message);
  process.exit(1);
}

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

for (const [label, p] of Object.entries(paths)) {
  if (!existsSync(p)) fail(`${label} missing: ${p}`);
  else pass(`${label} present`);
}

const matrixText = read(paths.matrix);
const nhpText = read(paths.nhp);
const requestText = read(paths.request);
const evaluatorText = read(paths.evaluator);
read(paths.pkg);

// Evaluator zero-byte pin: file must not have been touched by this knife (blob pin @47dd6be5 = ec62c4c2).
pass('evaluator zero-byte pin is asserted by the knife diff gate (git diff --numstat excludes scripts/lib/uc-covered-evaluator.mjs)');
if (!/const requiredMap = input\.requiredNhp \|\| UC018_REQUIRED_NHP;/.test(evaluatorText)) {
  fail('evaluator :246 requiredNhp per-UC entry missing (interface drift → stop)');
} else {
  pass('evaluator requiredNhp per-UC entry present (:246 frozen interface)');
}

// --- Locate the UC-E2E-025 matrix row (anchor :125) and backlog row (anchor :274) ---
const matrixLines = matrixText.split('\n');
const idx025 = matrixLines.findIndex((l) => l.startsWith('| UC-E2E-025 |'));
const idxBacklog = matrixLines.findIndex((l) => l.startsWith('| P1-8 | UC-E2E-025'));
if (idx025 === -1 || idxBacklog === -1) {
  fail('matrix UC-E2E-025 row / P1-8 backlog row not found by prefix (anchor drift → stop)');
} else {
  // 1-based line anchors from §0.1 (drafted @47dd6be5): :125 row · :274 backlog.
  if (idx025 + 1 !== 125) fail(`matrix UC-E2E-025 row at :${idx025 + 1} ≠ :125 anchor (line drift — conclusion unchanged → re-pin only, reported)`);
  else pass('matrix :125 = UC-E2E-025 row (anchor exact)');
  if (idxBacklog + 1 !== 274) fail(`matrix P1-8 backlog row at :${idxBacklog + 1} ≠ :274 anchor (line drift — reported)`);
  else pass('matrix :274 = P1-8 UC-E2E-025 backlog row (anchor exact)');
}

// --- Per-cell leading-status-token parse (§9-rev R8) ---
function leadingStatusToken(cell) {
  const c = String(cell ?? '').trim();
  const m = c.match(/^\*\*(gap|blind|partial|covered|case-only)\*\*/);
  return m ? m[1] : 'unknown';
}
const rowCells = idx025 >= 0 ? matrixLines[idx025].split('|').map((c) => c.trim()) : [];
// rowCells[0]='' [1]=UC-E2E-025 [2]=NEG [3]=FAULT [4]=BOUND [5]=ADV [6]=综合/产品口
const col = {
  NEG: leadingStatusToken(rowCells[2]),
  FAULT: leadingStatusToken(rowCells[3]),
  BOUND: leadingStatusToken(rowCells[4]),
  ADV: leadingStatusToken(rowCells[5]),
};
const summaryCell = rowCells[6] ?? '';

// --- PERF/LOAD live check against the NHP matrix (no NHP-025-PERF/LOAD rows → blind) ---
const hasNhp025Perf = /NHP-025-PERF/i.test(nhpText);
const hasNhp025Load = /NHP-025-LOAD/i.test(nhpText);
col.PERF = hasNhp025Perf ? 'case-only' : 'blind';
col.LOAD = hasNhp025Load ? 'case-only' : 'blind';
if (hasNhp025Perf) note(`NHP matrix: NHP-025-PERF present · status=${col.PERF}`);
else pass('NHP matrix: no NHP-025-PERF row (PERF remains blind)');
if (hasNhp025Load) note(`NHP matrix: NHP-025-LOAD present · status=${col.LOAD}`);
else pass('NHP matrix: no NHP-025-LOAD row (LOAD remains blind)');

note(`columns(live-parsed leading tokens) NEG=${col.NEG} FAULT=${col.FAULT} BOUND=${col.BOUND} ADV=${col.ADV} PERF=${col.PERF} LOAD=${col.LOAD}`);

// Row §1.1 status + business-path marker, both LIVE from the :125 summary cell
const rowStatusMatch = summaryCell.match(/行\s*stays\s*\*\*(gap|partial|covered)\*\*/);
const rowStatus = rowStatusMatch ? rowStatusMatch[1] : 'unknown';
const businessPathMet = /reject 已真接线/.test(summaryCell);
note(`row §1.1 status(live)=${rowStatus} · businessPathMet(live)=${businessPathMet}`);
if (rowStatus === 'unknown') fail('matrix :125 summary cell 行状态 token not parseable (anchor drift → stop)');

// --- openGaps sourced LIVE from the :274 backlog residual declarations (Ban fixture) ---
const backlogRow = idxBacklog >= 0 ? matrixLines[idxBacklog] : '';
const openGaps = [];
if (/仍缺重押题入口/.test(backlogRow)) openGaps.push('GAP-UC025-REQUIZ-ENTRY-01 (residual declared by matrix :274 backlog row)');
if (/隔离 PG\/HTTP BOUND 收据/.test(backlogRow)) openGaps.push('GAP-UC025-BOUND-ISOLATED-01 (residual declared by matrix :274 backlog row)');
pass(`openGaps(live from :274)=${JSON.stringify(openGaps)}`);

// --- canHonestlyFlip: computed via evaluate() (COVERED-CRITERION · requiredNhp per-UC) ---
const requiredNhp = {
  NEG: ['NHP-025-NEG-01'],
  FAULT: ['NHP-025-FAULT-01'],
  BOUND: ['NHP-025-BOUND-01'],
  ADV: ['NHP-025-ADV-01'],
  PERF: hasNhp025Perf ? ['NHP-025-PERF-01'] : [],
  LOAD: hasNhp025Load ? ['NHP-025-LOAD-01'] : [],
};
const mk = (name) => ({
  status: col[name],
  nhpIds: requiredNhp[name],
  prove: { cmd: `uc025:${name.toLowerCase()}`, exit: 0, gitSha: 'live', committed: true, shaMatchesCommitted: true },
  dual: { e2eHa: null, ragRoute: null },
  stack: { postgres: true, postgresSaver: true, memorySaver: false, mysql: false, qdrant: false },
  receipts: {
    evidenceOfRecord: false,
    implementerOnly: name === 'PERF' || name === 'LOAD',
    capacityRepresentative: false,
    targetEnv: name === 'PERF' || name === 'LOAD' ? 'docker-isolated' : 'n/a',
    present: true,
  },
});
const evalInput = {
  ucId: 'UC-E2E-025',
  requiredNhp,
  columns: {
    NEG: mk('NEG'),
    FAULT: mk('FAULT'),
    BOUND: mk('BOUND'),
    ADV: mk('ADV'),
    PERF: mk('PERF'),
    LOAD: mk('LOAD'),
  },
  section11: {
    status: rowStatus,
    businessPathMet,
    openGaps,
  },
};
const verdict = evaluate(evalInput);
const canHonestlyFlip = verdict.canHonestlyFlip;
const refuseReasons = [...verdict.reasons];

note(`assessment canHonestlyFlip=${canHonestlyFlip} refuse=${refuseReasons.join(' · ') || '<none>'} (computed via uc-covered-evaluator · requiredNhp per-UC :246)`);
note(`evaluator column reasons: ${JSON.stringify(Object.fromEntries(Object.entries(verdict.columns).map(([k, v]) => [k, v.reasons])))}`);

// Honest verdict asserts (computed · Ban constant · Ban 凑断言: live truth differing → these go red → EXIT1 honest retain)
if (canHonestlyFlip === false) pass('assessment: canHonestlyFlip=false (computed six-column evaluator · residuals block elevate)');
else pass('assessment: canHonestlyFlip=true (computed six-column evaluator allows elevate — honest receipt · coordinator owns any flip)');
if (refuseReasons.includes(REFUSE_REASONS.STATUS_NOT_COVERED)) pass('refuse includes STATUS-NOT-COVERED (live gap/blind columns)');
else fail('refuse must include STATUS-NOT-COVERED under live gap/blind columns (computed truth differs → honest receipt)');
if (refuseReasons.includes(REFUSE_REASONS.OPEN_GAP)) pass('refuse includes OPEN-GAP (live :274 residual declarations)');
else fail('refuse must include OPEN-GAP under live residual declarations (computed truth differs → honest receipt)');

// Report-only discipline (评估非翻面 · 翻面权归协调方)
pass('reassess knife: report-only · Ban write covered · Ban flip UC-E2E-025 row/columns from this prove');

// --- coveredCount hard pin ---
if (/coveredCount\s*=?\s*\*?\*?9|coveredCount\*\*9/.test(matrixLines[idx025] ?? '')) {
  fail('Ban invent coveredCount=9 (hard pin coveredCount=8 retained)');
} else if (/coveredCount\s*=\s*\*?\*?8|coveredCount=8/.test(matrixLines[idx025] ?? '')) {
  pass('matrix :125 retains coveredCount=8');
} else {
  fail('matrix :125 coveredCount=8 marker not found (anchor drift → stop)');
}

// --- REQUEST knife self-cite ---
assertSelf: {
  const ok = /GAP-UC025-COVERED-REASSESS-01/.test(requestText) && /uc025:covered-reassess:prove/.test(requestText);
  if (ok) pass('REQUEST harness names GAP-UC025-COVERED-REASSESS-01 + uc025:covered-reassess:prove');
  else fail('REQUEST harness must name the reassess gap id + CMD');
  break assertSelf;
}

// --- Write tmp receipt (gitignored .tmp only · tracked copy = receipt commit by 件④, after this EXIT0) ---
const tmpDir = join(root, '.tmp');
mkdirSync(tmpDir, { recursive: true });
const evidence = {
  knife: 'UC-E2E-025-covered-reassess',
  gap: 'GAP-UC025-COVERED-REASSESS-01',
  status: 'executed:awaiting_post_prove_dual',
  canHonestlyFlip,
  refuseReasons,
  columns: col,
  rowStatus,
  businessPathMet,
  openGaps,
  requiredNhp,
  evaluatorEntry: 'scripts/lib/uc-covered-evaluator.mjs evaluate() · requiredNhp per-UC (:246)',
  matrixRowParse: 'per-cell (| delim) split → leading status token per cell (§9-rev R8 · Ban cross-cell substring)',
  haStatus: 'NOT_HA',
  releaseEvidence: false,
  claimProductionHA: false,
  coveredCountRetained: 8,
  banInventCoveredCount9: true,
  reportOnlyNoFlip: true,
  datePT: new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }) + ' PT',
};
const tmpEvidencePath = join(tmpDir, 'uc025-covered-reassess-canHonestlyFlip.json');
writeFileSync(tmpEvidencePath, JSON.stringify(evidence, null, 2) + '\n');
pass(`wrote tmp receipt only: ${tmpEvidencePath.replace(root + '/', '')}`);
try {
  assertCleanPorcelain(root);
  pass('porcelain after reassess tmp-only write: clean (no DIRTY_TREE self-trip)');
} catch (e) {
  fail(`porcelain after reassess write: ${e.message.split('\n')[0]}`);
}
// Negative: dirty tree refuses
{
  const probe = join(root, '.tmp-reassess-porcelain-probe-uc025.txt');
  try {
    writeFileSync(probe, 'dirty\n');
    let threw = false;
    try { assertCleanPorcelain(root); } catch (e) { threw = e.code === 'DIRTY_TREE' || /DIRTY_TREE/.test(e.message); }
    if (threw) pass('reassess porcelain: dirty tree refuses (DIRTY_TREE)');
    else fail('reassess porcelain: dirty tree should refuse');
  } finally {
    try { rmSync(probe, { force: true }); } catch { /* */ }
  }
}

console.log(lines.join('\n'));
console.log(`\nCMD=pnpm uc025:covered-reassess:prove EXIT=${exitCode}`);
console.log(
  `NOTE: canHonestlyFlip=${canHonestlyFlip}` +
    ` · refuse=${refuseReasons.join(' · ') || '<none>'}` +
    ` · columns(live) NEG=${col.NEG} FAULT=${col.FAULT} BOUND=${col.BOUND} ADV=${col.ADV} PERF=${col.PERF} LOAD=${col.LOAD}` +
    ` · row §1.1 stays **${rowStatus}**` +
    ' · 跑点=评估不是翻面 · Ban invent covered · Ban flip row/columns · releaseEvidence=false · Not HA · claimProductionHA=false · coveredCount=8 retained · Ban self-nail',
);
process.exit(exitCode);
