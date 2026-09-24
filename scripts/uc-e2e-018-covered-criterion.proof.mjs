#!/usr/bin/env node
/**
 * UC-E2E-018 COVERED-CRITERION prove · GAP-UC018-COVERED-CRITERION
 *
 * - Adversarial fixtures (both directions) against pure evaluate()
 * - Source guards: constant-FALSE (b29c191), constant-TRUE, anti-tautology,
 *   gatherer-literal (C-GATHERER-REAL-INPUT)
 * - Real-matrix gatherer reads TRACKED receipts + git (fail closed)
 * - Real-input negative tests on temp receipt copies
 * - Ban flip UC-018 / §1.1 · Ban write covered · pins restated
 */
import { execSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  evaluate,
  REFUSE_REASONS,
  REFUSE_REASON_LIST,
  UC018_BOUND_PIN_ID,
  COLUMN_NAMES,
  LOCAL_ENV_CLASSES,
  assertFlipReasonsInvariant,
} from './lib/uc-covered-evaluator.mjs';
import {
  gatherRealUc018,
  toEvaluateInput,
  gapClosedInText,
  assertCleanPorcelain,
  parseReviewFileVerdict,
  roleFromReviewPath,
  dualFromReviewFiles,
} from './lib/uc-covered-real-gatherer.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const fixtureDir = join(root, 'scripts/fixtures/uc-covered-evaluator');
const evaluatorPath = join(root, 'scripts/lib/uc-covered-evaluator.mjs');
const gathererPath = join(root, 'scripts/lib/uc-covered-real-gatherer.mjs');
const reassessPath = join(root, 'scripts/uc-e2e-018-covered-lift-reassess.proof.mjs');
const selfPath = join(root, 'scripts/uc-e2e-018-covered-criterion.proof.mjs');

let exitCode = 0;
const lines = [];
const fixtureResults = [];
function fail(msg) { lines.push(`FAIL  ${msg}`); exitCode = 1; }
function pass(msg) { lines.push(`PASS  ${msg}`); }
function note(msg) { lines.push(`NOTE  ${msg}`); }
function read(p) {
  if (!existsSync(p)) { fail(`missing: ${p}`); return ''; }
  return readFileSync(p, 'utf8');
}

export function guardConstantFalse(source, label) {
  const findings = [];
  const code = source.replace(/(['"`])(?:\\.|(?!\1).)*\1/gs, '""');
  const initFalse = /\b(?:let|const)\s+canHonestlyFlip\s*=\s*false\b/.test(code);
  const assignsTrue =
    /\bcanHonestlyFlip\s*=\s*true\b/.test(code) ||
    /\bcanHonestlyFlip\s*=\s*!!/.test(code) ||
    /\bcanHonestlyFlip\s*=\s*[a-zA-Z_][\w.]*\(/.test(code) ||
    /\bcanHonestlyFlip\s*=\s*allColsMet/.test(code) ||
    /\bcanHonestlyFlip\s*=\s*result\./.test(code) ||
    /\bcanHonestlyFlip\s*=\s*verdict\./.test(code) ||
    /\bcanHonestlyFlip\s*=\s*evaluation\./.test(code) ||
    /const\s+\{\s*canHonestlyFlip/.test(code) ||
    /\bcanHonestlyFlip\s*=\s*evaluate\b/.test(code);
  const fromEvaluate =
    /\bevaluate\s*\(/.test(code) &&
    (/\bcanHonestlyFlip\b/.test(code) || /const\s+verdict\s*=/.test(code) || /const\s+result\s*=/.test(code));
  if (initFalse && !assignsTrue && !fromEvaluate) {
    findings.push('canHonestlyFlip initialised false with no true/computed assignment (b29c191 ~196)');
  }
  if (/refuseReasons\.push\(\s*['"]reassess-knife-refuses/.test(source)) {
    findings.push("unconditional refuseReasons.push('reassess-knife-refuses-…')");
  }
  return { trips: findings.length > 0, findings, label };
}

export function guardConstantTrue(source, label) {
  const findings = [];
  if (/^\s*(?:export\s+)?function\s+evaluate[\s\S]*?return\s*\{\s*canHonestlyFlip\s*:\s*true/m.test(source)) {
    findings.push('evaluate returns literal canHonestlyFlip: true');
  }
  if (label.includes('evaluator')) {
    if (!/allColsMet/.test(source) || !/businessPathMet/.test(source)) {
      findings.push('evaluator missing allColsMet/businessPathMet true-branch computation');
    }
  }
  return { trips: findings.length > 0, findings, label };
}

export function guardAntiTautology(evaluatorSource) {
  const findings = [];
  if (/expected\.json|\.expected\b|fixtures\/.*expected/.test(evaluatorSource)) {
    findings.push('evaluator source references expected fixtures');
  }
  if (/readFileSync\s*\([^)]*expected/.test(evaluatorSource)) {
    findings.push('evaluator reads expected files');
  }
  if (/import\s+.*expected/.test(evaluatorSource)) {
    findings.push('evaluator imports expected');
  }
  return { trips: findings.length > 0, findings, label: 'anti-tautology' };
}

function guardGathererLiterals(gathererSource) {
  const findings = [];
  const stripped = gathererSource
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/[^\n]*/g, '');
  const m = stripped.match(/^export function gatherRealUc018\b[\s\S]*$/m);
  const body = m ? m[0] : '';
  if (!body) findings.push('gatherer.mjs: missing export function gatherRealUc018');
  if (/capacityRepresentative\s*[:=]\s*false/.test(body)) {
    findings.push('hardcoded capacityRepresentative=false in real-input branch');
  }
  if (/committed\s*:\s*true/.test(body)) {
    findings.push('hardcoded committed:true in real-input branch');
  }
  if (/present\s*:\s*true/.test(body)) {
    findings.push('hardcoded present:true in real-input branch');
  }
  return { trips: findings.length > 0, findings };
}

const evaluatorSrc = read(evaluatorPath);
const reassessSrc = read(reassessPath);
const gathererSrc = read(gathererPath);

const gAnti = guardAntiTautology(evaluatorSrc);
if (gAnti.trips) fail(`anti-tautology: ${gAnti.findings.join('; ')}`);
else pass('anti-tautology: evaluator does not read/import expected fixtures');

const gTrueEval = guardConstantTrue(evaluatorSrc, 'evaluator');
if (gTrueEval.trips) fail(`constant-TRUE(evaluator): ${gTrueEval.findings.join('; ')}`);
else pass('constant-TRUE guard: evaluator computes canHonestlyFlip from allColsMet');

const gFalseReassess = guardConstantFalse(reassessSrc, 'reassess-rewired');
if (gFalseReassess.trips) fail(`constant-FALSE(reassess): ${gFalseReassess.findings.join('; ')}`);
else pass('constant-FALSE guard: reassess proof is not b29c191 constant-false');

const gFalseEval = guardConstantFalse(evaluatorSrc, 'evaluator');
if (gFalseEval.trips) fail(`constant-FALSE(evaluator): ${gFalseEval.findings.join('; ')}`);
else pass('constant-FALSE guard: evaluator is not constant-false');

let b29Src = '';
try {
  b29Src = execSync('git show b29c191:scripts/uc-e2e-018-covered-lift-reassess.proof.mjs', {
    cwd: root, encoding: 'utf8', maxBuffer: 2 * 1024 * 1024,
  });
} catch (e) {
  fail(`git show b29c191 reassess proof failed: ${e.message}`);
}
const gB29 = guardConstantFalse(b29Src, 'b29c191');
if (!gB29.trips) fail('constant-FALSE guard must TRIP on b29c191 reassess proof (regression pin)');
else pass(`constant-FALSE guard TRIPS on b29c191: ${gB29.findings.join('; ')}`);

pass(`refuse enum (${REFUSE_REASON_LIST.length}): ${REFUSE_REASON_LIST.join(', ')}`);
pass(`BOUND pin id: ${UC018_BOUND_PIN_ID} (NHP matrix has no NHP-018-BOUND-* · CAS waiting_user)`);
pass(`LOCAL_ENV_CLASSES: ${LOCAL_ENV_CLASSES.join(', ')}`);

const gLit = guardGathererLiterals(gathererSrc);
if (gLit.trips) fail(`gatherer-literal guard: ${gLit.findings.join('; ')}`);
else pass('gatherer-literal guard: no capacityRepresentative=false / committed:true / present:true in real-input branch');

// Fixtures
const fixtureIds = readdirSync(fixtureDir)
  .filter((f) => f.endsWith('.input.json'))
  .map((f) => f.replace(/\.input\.json$/, ''))
  .sort();
if (fixtureIds.length < 24) fail(`expected ≥24 fixtures, got ${fixtureIds.length}`);

for (const id of fixtureIds) {
  const input = JSON.parse(read(join(fixtureDir, `${id}.input.json`)));
  const expected = JSON.parse(read(join(fixtureDir, `${id}.expected.json`)));
  const { expected: _drop, ...cleanInput } = input;
  let got;
  try { got = evaluate(cleanInput); }
  catch (e) {
    fail(`${id}: evaluate threw ${e.message}`);
    fixtureResults.push({ id, ok: false, error: e.message });
    continue;
  }
  let ok = true;
  try {
    assertFlipReasonsInvariant(got);
  } catch (e) {
    fail(`${id}: flip↔reasons invariant: ${e.message}`);
    ok = false;
  }
  if (expected.canHonestlyFlip === true) {
    if (got.canHonestlyFlip !== true) {
      fail(`${id}: expected canHonestlyFlip=true got false reasons=${got.reasons.join(',')}`);
      ok = false;
    } else if (got.reasons.length !== 0) {
      fail(`${id}: true flip must have empty reasons got ${got.reasons.join(',')}`);
      ok = false;
    } else pass(`${id}: canHonestlyFlip=true`);
  } else {
    if (got.canHonestlyFlip !== false) {
      fail(`${id}: expected canHonestlyFlip=false got true`);
      ok = false;
    }
    const must = expected.mustIncludeReasons || expected.reasons || [];
    for (const r of must) {
      const inTop = got.reasons.includes(r);
      const inCol = expected.failColumn && got.columns[expected.failColumn]?.reasons?.includes(r);
      if (!inTop && !inCol) {
        fail(`${id}: missing reason ${r} (got top=${got.reasons.join(',')} col=${JSON.stringify(got.columns[expected.failColumn]?.reasons || [])})`);
        ok = false;
      }
    }
    if (ok) pass(`${id}: canHonestlyFlip=false reasons ok (${must.join(',') || got.reasons.join(',')})`);
  }
  fixtureResults.push({ id, ok, expectedFlip: expected.canHonestlyFlip === true, gotFlip: got.canHonestlyFlip, reasons: got.reasons });
}

const allMet = fixtureResults.find((f) => f.id === 'FX-ALL-MET');
if (allMet?.gotFlip === true) pass('true branch reachable (FX-ALL-MET)');
else fail('true branch NOT reachable — FX-ALL-MET must flip true');

try {
  evaluate({ expected: { canHonestlyFlip: true }, columns: {}, section11: {} });
  fail('anti-tautology runtime: evaluate should reject input.expected');
} catch {
  pass('anti-tautology runtime: evaluate rejects input.expected');
}

// gapClosedInText: positive CLOSED / 已关 vs negation/prohibition windows (不得/禁止/Ban/不可/未/not)
{
  const pos = [
    ['GAP-UC018-FULL-E2E … CLOSED (done)', 'GAP-UC018-FULL-E2E', true],
    ['CLOSED before id: CLOSED · GAP-UC018-GRAPH', 'GAP-UC018-GRAPH', true],
    ['已关 · GAP-UC018-TTL retained', 'GAP-UC018-TTL', true],
    ['GAP-UC018-UI 已关', 'GAP-UC018-UI', true],
    ['**CLOSED**（GAP-UC018-SOLE）', 'GAP-UC018-SOLE', true],
  ];
  const neg = [
    ['不得写已关 · GAP-UC018-COVERED-CRITERION', 'GAP-UC018-COVERED-CRITERION', false],
    ['禁止 CLOSED GAP-UC018-FULL-E2E 宣称', 'GAP-UC018-FULL-E2E', false],
    ['Ban CLOSED GAP-UC018-GRAPH wash', 'GAP-UC018-GRAPH', false],
    ['不可已关 GAP-UC018-TTL', 'GAP-UC018-TTL', false],
    ['未 CLOSED · GAP-UC018-UI', 'GAP-UC018-UI', false],
    ['not closed GAP-UC018-SOLE', 'GAP-UC018-SOLE', false],
  ];
  let gapOk = true;
  for (const [text, id, want] of [...pos, ...neg]) {
    const got = gapClosedInText(text, id);
    if (got !== want) {
      fail(`gapClosedInText(${JSON.stringify(text)}, ${id}) got ${got} want ${want}`);
      gapOk = false;
    }
  }
  if (gapOk) pass('gapClosedInText: positive CLOSED/已关 + negation Ban/不得/禁止/不可/未/not');
}

// Permanent leaf-mutation test (committed): every leaf × {delete, undefined, null} ⇒ flip false
// Explicit allowlist ONLY for leaves evaluate() does not consult (printed + disclosed).
const MUTATION_ALLOWLIST = [
  {
    path: 'ucId',
    justification: 'metadata string unused by evaluate(); not a coverage gate',
  },
  {
    path: /^columns\.(NEG|FAULT|BOUND|ADV)\.receipts\.capacityRepresentative$/,
    justification: 'capacityRepresentative consulted only for PERF/LOAD columns (isCapacityRepresentative)',
  },
  {
    path: /^columns\.(NEG|FAULT|BOUND|ADV)\.receipts\.targetEnv$/,
    justification: 'targetEnv consulted only via isCapacityRepresentative for PERF/LOAD',
  },
  {
    path: /^columns\.[A-Z]+\.receipts\.implementerOnly$/,
    justification: 'fail-closed only on === true; absence means not-implementer (positive-proof asymmetry for the bad flag)',
  },
];
function mutationAllowlisted(path) {
  return MUTATION_ALLOWLIST.some((a) =>
    typeof a.path === 'string' ? a.path === path : a.path.test(path),
  );
}
function collectLeaves(node, prefix, out) {
  if (node === null || typeof node !== 'object') {
    out.push({ path: prefix, value: node });
    return;
  }
  if (Array.isArray(node)) {
    for (let i = 0; i < node.length; i++) {
      const p = `${prefix}[${i}]`;
      if (node[i] !== null && typeof node[i] === 'object') collectLeaves(node[i], p, out);
      else out.push({ path: p, value: node[i] });
    }
    return;
  }
  for (const k of Object.keys(node)) {
    const p = prefix ? `${prefix}.${k}` : k;
    const v = node[k];
    if (v !== null && typeof v === 'object') collectLeaves(v, p, out);
    else out.push({ path: p, value: v });
  }
}
function setPath(root, path, mode) {
  // mode: 'delete' | 'undefined' | 'null'
  const segs = [];
  path.replace(/([^[.\]]+)|\[(\d+)\]/g, (_, key, idx) => {
    segs.push(idx !== undefined ? Number(idx) : key);
    return '';
  });
  let cur = root;
  for (let i = 0; i < segs.length - 1; i++) {
    cur = cur[segs[i]];
    if (cur == null || typeof cur !== 'object') return false;
  }
  const last = segs[segs.length - 1];
  if (mode === 'delete') {
    if (Array.isArray(cur) && typeof last === 'number') cur.splice(last, 1);
    else delete cur[last];
  } else if (mode === 'undefined') {
    cur[last] = undefined;
  } else {
    cur[last] = null;
  }
  return true;
}
{
  const allMetInput = JSON.parse(read(join(fixtureDir, 'FX-ALL-MET.input.json')));
  const baseline = evaluate(JSON.parse(JSON.stringify(allMetInput)));
  if (baseline.canHonestlyFlip !== true) {
    fail(`FX-ALL-MET baseline must be true before mutation test (got false reasons=${baseline.reasons.join(',')})`);
  } else pass('FX-ALL-MET baseline canHonestlyFlip=true (anti-tautology)');

  const leaves = [];
  collectLeaves(allMetInput, '', leaves);
  let total = 0;
  let falseCount = 0;
  const survivors = [];
  const allowlistHits = [];
  for (const { path: leafPath } of leaves) {
    if (!leafPath) continue;
    for (const mode of ['delete', 'undefined', 'null']) {
      total++;
      const clone = JSON.parse(JSON.stringify(allMetInput));
      setPath(clone, leafPath, mode);
      // JSON.stringify drops undefined — re-apply undefined after parse clone for undefined mode
      if (mode === 'undefined') {
        const clone2 = JSON.parse(JSON.stringify(allMetInput));
        setPath(clone2, leafPath, 'undefined');
        const v = evaluate(clone2);
        try { assertFlipReasonsInvariant(v); } catch (e) { survivors.push({ path: leafPath, mode, inv: e.message }); continue; }
        const ok = v.canHonestlyFlip === false;
        if (ok) falseCount++;
        else if (mutationAllowlisted(leafPath)) {
          falseCount++; // counted as expected allowlisted survivor
          allowlistHits.push({ path: leafPath, mode, flip: true });
        } else {
          survivors.push({ path: leafPath, mode, reasons: v.reasons, columns: Object.fromEntries(Object.entries(v.columns).map(([k, c]) => [k, c.meetsCovered])) });
        }
        continue;
      }
      const v = evaluate(clone);
      try { assertFlipReasonsInvariant(v); } catch (e) { survivors.push({ path: leafPath, mode, inv: e.message }); continue; }
      const ok = v.canHonestlyFlip === false;
      if (ok) falseCount++;
      else if (mutationAllowlisted(leafPath)) {
        falseCount++;
        allowlistHits.push({ path: leafPath, mode, flip: true });
      } else {
        survivors.push({ path: leafPath, mode, reasons: v.reasons });
      }
    }
  }
  note(`leaf-mutation: ${falseCount}/${total} mutations false (allowlist hits=${allowlistHits.length})`);
  if (survivors.length > 0) {
    for (const s of survivors.slice(0, 40)) {
      fail(`leaf-mutation SURVIVOR flip=true path=${s.path} mode=${s.mode} reasons=${(s.reasons || []).join(',')}`);
    }
  } else {
    pass(`leaf-mutation: ${falseCount}/${total} mutations false (0 unallowlisted survivors)`);
  }
  note(`mutation allowlist (${MUTATION_ALLOWLIST.length}): ${MUTATION_ALLOWLIST.map((a) => typeof a.path === 'string' ? a.path : a.path.toString()).join(' | ')}`);
  // stash for evidence
  globalThis.__uc018MutationSummary = { total, falseCount, survivors, allowlist: MUTATION_ALLOWLIST.map((a) => ({ path: String(a.path), justification: a.justification })), allowlistHits: allowlistHits.length };
}


// Dual parser: strict Verdict line + path-only role (B-DUAL-PASS-PRIORITY / B-DUAL-CROSS-ROLE)
{
  const dualFix = join(root, 'scripts/fixtures/uc-covered-dual');
  const retracted = read(join(dualFix, 'FX-DUAL-RETRACTED.md'));
  const singlePeer = read(join(dualFix, 'FX-DUAL-SINGLE-FILE-NAMES-PEER-mw-rag-route.md'));
  const vRet = parseReviewFileVerdict(retracted);
  if (vRet !== 'FAIL') fail(`FX-DUAL-RETRACTED parser got ${vRet} want FAIL (latest Verdict wins)`);
  else pass('FX-DUAL-RETRACTED: PASS then FAIL ⇒ FAIL');

  const rolePeer = roleFromReviewPath(join(dualFix, 'FX-DUAL-SINGLE-FILE-NAMES-PEER-mw-rag-route.md'));
  if (rolePeer !== 'ragRoute') fail(`single-file role got ${rolePeer} want ragRoute`);
  const dualPeer = dualFromReviewFiles([join(dualFix, 'FX-DUAL-SINGLE-FILE-NAMES-PEER-mw-rag-route.md')]);
  if (dualPeer.e2eHa != null) fail(`cross-role: e2eHa should be null got ${dualPeer.e2eHa}`);
  if (dualPeer.ragRoute !== 'PASS') fail(`rag slot want PASS got ${dualPeer.ragRoute}`);
  else pass('FX-DUAL-SINGLE-FILE-NAMES-PEER: body names mw-e2e-ha but path-only ⇒ e2eHa=null (MISSING-DUAL if used alone)');

  const realE2e = join(root, 'ai-docs/delivery/reviews/REQUEST-2026-09-23-uc-e2e-018-covered-criterion-post-prove-mw-e2e-ha.md');
  const realV = parseReviewFileVerdict(read(realE2e));
  if (realV === 'PASS') fail('real e2e-ha retracted covered-criterion receipt must NOT parse as PASS');
  else pass(`real e2e-ha retracted receipt verdict=${realV} (not PASS)`);

  // Mutate dual-parser inputs: delete/null verdict markers ⇒ not PASS / not dual-met
  const baseDualText = '**Verdict**: **PASS**  \n';
  const mutatedTexts = [
    ['delete-marker', ''],
    ['null-like-empty', '\n\n'],
    ['trail-junk-PASS', '**Verdict**: **PASS**（ok）\n'],
    ['prose-FAIL-only', '## 改判 FAIL\n**FAIL**\n'],
  ];
  let dualMutOk = true;
  for (const [label, text] of mutatedTexts) {
    const v = parseReviewFileVerdict(text);
    if (v === 'PASS') {
      fail(`dual-parser mutation ${label} still PASS`);
      dualMutOk = false;
    }
  }
  // delete role binding: path without suffix ⇒ null role ⇒ dual slots stay null
  const noRole = dualFromReviewFiles([]); // empty
  if (noRole.e2eHa != null || noRole.ragRoute != null) {
    fail('empty dualFromReviewFiles should be null/null');
    dualMutOk = false;
  }
  const weirdPath = dualFromReviewFiles([join(dualFix, 'FX-DUAL-RETRACTED.md')]); // no -mw-* suffix
  if (weirdPath.e2eHa != null || weirdPath.ragRoute != null) {
    fail('path without role suffix must not fill dual slots');
    dualMutOk = false;
  } else pass('dual-parser: path without -mw-e2e-ha/-mw-rag-route suffix ⇒ no slots filled');
  if (dualMutOk) pass('dual-parser mutations: deleted/junk/prose markers ⇒ not PASS');
}

// Porcelain guard: clean OK; dirty refuses
{
  try {
    assertCleanPorcelain(root);
    pass('porcelain: clean tree accepted');
  } catch (e) {
    fail(`porcelain: expected clean at prove time, got ${e.message.split('\\n')[0]}`);
  }
  const dirtyPath = join(root, '.tmp-porcelain-dirty-probe-uc018.txt');
  try {
    writeFileSync(dirtyPath, 'dirty-probe\\n');
    let threw = false;
    try {
      assertCleanPorcelain(root);
    } catch (e) {
      threw = e.code === 'DIRTY_TREE' || /DIRTY_TREE/.test(e.message);
    }
    if (threw) pass('porcelain: dirty tree refuses (DIRTY_TREE)');
    else fail('porcelain: dirty tree should refuse');
  } finally {
    try { rmSync(dirtyPath, { force: true }); } catch { /* */ }
  }
}

// Real gatherer
const gathered = gatherRealUc018({ root });
const realInput = toEvaluateInput(gathered);
const realVerdict = evaluate(realInput);

if (gathered._meta?.hasBoundNhp) note('NHP matrix unexpectedly lists NHP-018-BOUND-*');
else pass('NHP matrix: no NHP-018-BOUND-* (BOUND pin = waiting_user-CAS)');

note('═══ REAL UC-018 COMPUTED VERDICT ═══');
note(`canHonestlyFlip=${realVerdict.canHonestlyFlip}`);
note(`reasons=${JSON.stringify(realVerdict.reasons)}`);
for (const c of COLUMN_NAMES) {
  const col = realVerdict.columns[c];
  const raw = gathered.columns[c];
  note(`  ${c}: status=${col.status} meetsCovered=${col.meetsCovered} reasons=${JSON.stringify(col.reasons)}`);
  note(`    prove.exit=${raw.prove.exit} gitSha=${raw.prove.gitSha} committed=${raw.prove.committed} uncommitted=${raw.prove.uncommitted}`);
  note(`    targetEnv=${raw.receipts.targetEnv} capacityRepresentative=${raw.receipts.capacityRepresentative} implementerOnly=${raw.receipts.implementerOnly} eor=${raw.receipts.evidenceOfRecord} present=${raw.receipts.present}`);
  note(`    dual=${JSON.stringify(raw.dual)} stack=${JSON.stringify(raw.stack)}`);
  note(`    sources=${JSON.stringify(raw._sources)}`);
}
note(`meta=${JSON.stringify(gathered._meta)}`);

try { assertFlipReasonsInvariant(realVerdict); pass('real UC-018 flip↔reasons invariant OK'); }
catch (e) { fail(`real UC-018 invariant: ${e.message}`); }
if (realVerdict.canHonestlyFlip !== false) fail('real UC-018 must evaluate canHonestlyFlip=false (Ban invent covered)');
else pass('real UC-018 canHonestlyFlip=false (computed)');
if (!realVerdict.reasons.includes(REFUSE_REASONS.PERF_LOCAL_ONLY)) {
  fail(`real UC-018 reasons must include PERF-LOCAL-ONLY (got ${realVerdict.reasons.join(',')})`);
} else pass('real UC-018 reasons include PERF-LOCAL-ONLY');

{
  const parentHarness = read(join(root, 'ai-docs/delivery/harness/uc-e2e-018-user-abandon.md'));
  const oldStyle = /GAP-UC018-FULL-E2E[^\n]{0,40}CLOSED/i.test(parentHarness);
  const newStyle = gapClosedInText(parentHarness, 'GAP-UC018-FULL-E2E');
  note(`businessPathMet fix: old-regex-FULL-E2E=${oldStyle} new-gapClosedInText-FULL-E2E=${newStyle} computed=${gathered.section11.businessPathMet}`);
  if (!gathered.section11.businessPathMet) {
    fail('businessPathMet should be true after CLOSED-before-id / 已关 fix on parent harness');
  } else pass('businessPathMet=true (CLOSED-before-id / 已关 wording recognized)');
}

// Real-input negative tests
const negResults = [];
function runNeg(label, mutate, expectReason) {
  const tmp = mkdtempSync(join(tmpdir(), 'uc018-gatherer-neg-'));
  try {
    const srcReceipts = join(root, 'ai-docs/delivery/receipts');
    const dstReceipts = join(tmp, 'receipts');
    mkdirSync(dstReceipts, { recursive: true });
    for (const f of [
      '2026-09-23-uc-e2e-018-sole-stack-pg-retained-evidence.json',
      '2026-09-23-uc-e2e-018-adv-evidence.json',
    ]) {
      cpSync(join(srcReceipts, f), join(dstReceipts, f));
    }
    mkdirSync(join(dstReceipts, 'uc018-perf-load'), { recursive: true });
    cpSync(join(srcReceipts, 'uc018-perf-load/summary.json'), join(dstReceipts, 'uc018-perf-load/summary.json'));
    if (existsSync(join(srcReceipts, 'uc018-perf-load/README.md'))) {
      cpSync(join(srcReceipts, 'uc018-perf-load/README.md'), join(dstReceipts, 'uc018-perf-load/README.md'));
    }
    mutate(dstReceipts);
    const g = gatherRealUc018({ root, receiptRoot: dstReceipts, skipPorcelainCheck: true });
    const v = evaluate(toEvaluateInput(g));
    const ok =
      v.canHonestlyFlip === false &&
      (v.reasons.includes(expectReason) ||
        Object.values(v.columns).some((c) => c.reasons.includes(expectReason)));
    if (ok) pass(`real-input neg ${label}: false + ${expectReason}`);
    else {
      fail(`real-input neg ${label}: expected ${expectReason} · got flip=${v.canHonestlyFlip} reasons=${v.reasons.join(',')} ADV=${JSON.stringify(v.columns.ADV?.reasons)}`);
    }
    negResults.push({ label, ok, expectReason, gotReasons: v.reasons, canHonestlyFlip: v.canHonestlyFlip });
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

runNeg('drop-ADV-exit', (dst) => {
  const p = join(dst, '2026-09-23-uc-e2e-018-adv-evidence.json');
  const j = JSON.parse(readFileSync(p, 'utf8'));
  delete j.exit;
  delete j.exitCode;
  delete j.exits;
  delete j.cmds;
  delete j.allPass;
  writeFileSync(p, JSON.stringify(j, null, 2) + '\n');
}, REFUSE_REASONS.MISSING_RECEIPT); // null/absent exit ⇒ MISSING-RECEIPT (not PROVE-FAIL)

runNeg('nonzero-ADV-exit', (dst) => {
  const p = join(dst, '2026-09-23-uc-e2e-018-adv-evidence.json');
  const j = JSON.parse(readFileSync(p, 'utf8'));
  j.exit = 7;
  writeFileSync(p, JSON.stringify(j, null, 2) + '\n');
}, REFUSE_REASONS.PROVE_FAIL); // recorded nonzero ⇒ PROVE-FAIL

runNeg('wipe-ADV-stack', (dst) => {
  const p = join(dst, '2026-09-23-uc-e2e-018-adv-evidence.json');
  const j = JSON.parse(readFileSync(p, 'utf8'));
  delete j.stack;
  delete j.soleStack;
  writeFileSync(p, JSON.stringify(j, null, 2) + '\n');
}, REFUSE_REASONS.STUB_STACK);

runNeg('nonexistent-ADV-sha', (dst) => {
  const p = join(dst, '2026-09-23-uc-e2e-018-adv-evidence.json');
  const j = JSON.parse(readFileSync(p, 'utf8'));
  j.gitSha = 'deadbeefdeadbeefdeadbeefdeadbeefdeadbee';
  writeFileSync(p, JSON.stringify(j, null, 2) + '\n');
}, REFUSE_REASONS.UNCOMMITTED_RUNNER);

const pins = {
  noUc018Flip: true, noSection11Flip: true, noCoveredWritten: true,
  coveredCount: 8, haStatus: 'NOT_HA', releaseEvidence: false,
  claimProductionHA: false, gR45Closed: true, ms3EqualsR4Closed: false, stack: 'PG-retained',
};
note(`PINS: no UC-018/§1.1 flip · no covered written · coveredCount=${pins.coveredCount} · haStatus=${pins.haStatus} · releaseEvidence=${pins.releaseEvidence} · claimProductionHA=${pins.claimProductionHA} · gR45Closed=${pins.gR45Closed} · ms3EqualsR4Closed=${pins.ms3EqualsR4Closed} · ${pins.stack}`);
pass('pins restated (no flip · coveredCount=8 · NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · ms3EqualsR4Closed=false · PG-retained)');
pass('Ban: this prove does not write covered into docs/matrix');

const receiptDir = join(root, 'ai-docs/delivery/receipts/uc018-covered-criterion');
const tmpDir = join(root, '.tmp/uc018-covered-criterion');
mkdirSync(receiptDir, { recursive: true });
mkdirSync(tmpDir, { recursive: true });
let headSha = 'UNKNOWN';
try { headSha = execSync('git rev-parse HEAD', { cwd: root, encoding: 'utf8' }).trim(); } catch { /* */ }

const evidence = {
  knife: 'UC-E2E-018-covered-criterion',
  gap: 'GAP-UC018-COVERED-CRITERION',
  command: 'pnpm uc018:covered-criterion:prove',
  exit: exitCode,
  runnerCommitSha: headSha,
  boundPinId: UC018_BOUND_PIN_ID,
  refuseEnum: REFUSE_REASON_LIST,
  fixtureResults,
  realVerdict: { canHonestlyFlip: realVerdict.canHonestlyFlip, reasons: realVerdict.reasons, columns: realVerdict.columns },
  realMeta: gathered._meta,
  pins,
  guards: {
    b29c191Trips: gB29.trips,
    b29c191Findings: gB29.findings,
    constantTruePass: !gTrueEval.trips,
    antiTautologyPass: !gAnti.trips,
    reassessNotConstantFalse: !gFalseReassess.trips,
    gathererLiteralPass: !gLit.trips,
  },
  realInputNegativeTests: negResults,
  businessPathMet: gathered.section11.businessPathMet,
  datePT: new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }) + ' PT',
  haStatus: 'NOT_HA',
  releaseEvidence: false,
  claimProductionHA: false,
  coveredCount: 8,
  gR45Closed: true,
  ms3EqualsR4Closed: false,
  banInventCovered: true,
  banFlipSection11: true,
  failClosedAudit: [
    { field: 'prove.exit', before: 'null/absent treated as PROVE-FAIL (or soft 0)', after: 'null/absent → MISSING-RECEIPT; nonzero → PROVE-FAIL', file: 'uc-covered-evaluator.mjs:~147-151' },
    { field: 'stack.postgres|postgresSaver', before: 'undefined passed badStack===false (fail-open MET)', after: '!== true → STUB-STACK', file: 'uc-covered-evaluator.mjs:~166-172' },
    { field: 'stack.memorySaver|mysql|qdrant', before: 'undefined coerced/ignored', after: '!== false → STUB-STACK', file: 'uc-covered-evaluator.mjs:~166-172' },
    { field: 'receipts.evidenceOfRecord', before: 'gatherer soft-defaulted true when receipt present', after: 'absent → false → MISSING-RECEIPT', file: 'uc-covered-real-gatherer.mjs:pickEvidenceFlags + evaluator:~175-179' },
    { field: 'parseSoleStack postgresSaver', before: 'inferred from postgres+pgvector', after: 'explicit PostgresSaver token only', file: 'uc-covered-real-gatherer.mjs:parseSoleStack' },
    { field: 'pickStack absent', before: 'empty/undefined fields treated as MET', after: 'all undefined → STUB-STACK', file: 'uc-covered-real-gatherer.mjs:pickStack' },
    { field: 'NEG/BOUND dual', before: 'hardcoded dual null', after: 'wired sole-stack+waiting-user review Verdict', file: 'gatherRealUc018' },
    { field: 'FAULT dual+receipt', before: 'receipt null + dual null', after: 'GRAPH evidence if tip committed+cmds parseable else MISSING-RECEIPT; dual from graph post-prove', file: 'gatherRealUc018' },
    { field: 'gapClosedInText', before: '已关/CLOSED matched under 不得写已关 / Ban / 禁止', after: 'banNear window skips negation/prohibition', file: 'gapClosedInText' },
    { field: 'porcelain', before: 'no check', after: 'non-empty porcelain → DIRTY_TREE refuse', file: 'assertCleanPorcelain' },
  ],
  fixRound: 'fix-round-4-flip-reasons-invariant-s11-opengaps-cmd',
  mutationSummary: globalThis.__uc018MutationSummary || null,
  dualParse: {
    marker: '/^(?:\\*\\*)?Verdict(?:\\*\\*)?:\\s*(?:\\*\\*)?(PASS|FAIL)(?:\\*\\*)?\\s*$/m',
    roleFrom: 'path suffix -mw-e2e-ha.md / -mw-rag-route.md only',
    realE2eHaCoveredCriterionPostProve: 'must not be PASS (trailing commentary / no strict EOL marker after retract)',
  },
  rangeDisclosure: {
    note: '4a8a085..4706c4b on origin may include other lines product commits; Line A evidence = individual commits only',
    lineACommitsExample: ['4a8a085', '4224e73', '4706c4b'],
  },
  pendingNailGaps: ['GAP-UC018-RECEIPT-BACKFILL'],
  receiptBackfillNote: 'GAP-UC018-RECEIPT-BACKFILL deferred to nail-time (Ban hand-writing JSON from prose)',
};
// C-DIRTY-SELF-WRITE fix: write ONLY to gitignored .tmp during prove (tracked copy = receipts commit step)
const evidencePath = join(tmpDir, 'covered-criterion-evidence.json');
writeFileSync(evidencePath, JSON.stringify(evidence, null, 2) + '\n');
// prove.md SHA from SAME variable as JSON runnerCommitSha (Ban hand-edit drift)
const proveMd = `# UC-E2E-018 COVERED-CRITERION · prove receipt (fix-round 3)

**Status**: \`executed:awaiting_post_prove_dual\`
**Date**: ${evidence.datePT}
**Runner commit**: \`${headSha.slice(0, 7)}\` / full \`${headSha}\`
**Command**: \`pnpm uc018:covered-criterion:prove\` EXIT=${exitCode}
**Porcelain at prove**: clean (evidence written only under gitignored \`.tmp/\`)

## CMD|EXIT

| CMD | EXIT |
|-----|------|
| \`pnpm uc018:covered-criterion:prove\` | **${exitCode}** |

## Dual parse (strict)

- Marker: last line matching \`^(:**)?Verdict(:**)?:\\s*(:**)?(PASS|FAIL)(:**)?\\s*$\` (optional bold; **no trailing junk**)
- Role: path suffix \`-mw-e2e-ha.md\` / \`-mw-rag-route.md\` only
- Real e2e-ha covered-criterion post-prove retracted receipt: **not PASS**

## Pins

coveredCount=8 · haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · ms3EqualsR4Closed=false · PG-retained · Ban invent covered · Ban flip §1.1

*Tracked copy of this receipt is committed in the separate receipts commit (not written to tracked paths during prove).*
`;
writeFileSync(join(tmpDir, 'covered-criterion-prove.md'), proveMd);
pass('wrote gitignored .tmp evidence+prove.md (runnerCommitSha=' + headSha.slice(0, 7) + ')');

// Re-run porcelain: after tmp-only write, tree must stay clean; second assert must not DIRTY_TREE
try {
  assertCleanPorcelain(root);
  pass('porcelain after tmp-only evidence write: still clean (no DIRTY_TREE self-trip)');
} catch (e) {
  fail(`porcelain after tmp write: ${e.message.split('\n')[0]}`);
}

console.log(lines.join('\n'));
console.log(`\nCMD=pnpm uc018:covered-criterion:prove EXIT=${exitCode}`);
console.log(`REAL_VERDICT canHonestlyFlip=${realVerdict.canHonestlyFlip} reasons=${realVerdict.reasons.join(',')}`);
console.log('PINS coveredCount=8 haStatus=NOT_HA releaseEvidence=false claimProductionHA=false gR45Closed=true ms3EqualsR4Closed=false PG-retained · no UC-018/§1.1 flip · no covered written');
process.exit(exitCode);
