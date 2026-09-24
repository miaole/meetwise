/**
 * Pure deterministic six-column covered evaluator (UC-E2E-018 COVERED-CRITERION).
 * evaluate(input) → { canHonestlyFlip, columns, reasons }
 *
 * Ban: constant-false / constant-true / reading fixture expected outputs.
 * True branch reachable when all columns meetCovered + §1.1 business path + no open GAP.
 *
 * BOUND pin (UC-018): NHP matrix has NO NHP-018-BOUND-*; BOUND evidence =
 * CAS waiting_user (§1b#4 / GAP-UC018-WAITING-USER CLOSED · matrix §1.0.1 cell
 * "partial（CAS waiting_user）"). Frozen pin id: UC018_BOUND_PIN_ID.
 *
 * capacityRepresentative: true ONLY with declared NON-LOCAL target env AND dual
 * evidence of record. Local / docker-isolated NEVER qualify, even if caps equal
 * W2 2c4g/4c8g numbers. Cite:
 *   ai-docs/delivery/harness/w2-resource-sizing-receipts.md (~line 32)
 *   ai-docs/delivery/harness/pg-retained-checkpoint-postgres-saver.md §2
 */
export const REFUSE_REASONS = Object.freeze({
  PERF_LOCAL_ONLY: 'PERF-LOCAL-ONLY',
  CASE_ONLY: 'CASE-ONLY',
  OPEN_GAP: 'OPEN-GAP',
  IMPL_ONLY: 'IMPL-ONLY',
  UNCOMMITTED_RUNNER: 'UNCOMMITTED-RUNNER',
  MISSING_DUAL: 'MISSING-DUAL',
  DUAL_ONE: 'DUAL-ONE',
  STALE_SHA: 'STALE-SHA',
  MISSING_RECEIPT: 'MISSING-RECEIPT',
  S11_NOT_MET: 'S11-NOT-MET',
  HAPPY_ONLY: 'HAPPY-ONLY',
  /** status is not literally `covered` (partial/blind/gap/…) */
  STATUS_NOT_COVERED: 'STATUS-NOT-COVERED',
  /** missing required named NHP / BOUND pin for the column */
  MISSING_NHP: 'MISSING-NHP',
  /** stack not real PG + PostgresSaver (MemorySaver/MySQL/Qdrant) */
  STUB_STACK: 'STUB-STACK',
  /** prove EXIT ≠ 0 */
  PROVE_FAIL: 'PROVE-FAIL',
});

Object.freeze(REFUSE_REASONS);
export const REFUSE_REASON_LIST = Object.freeze(Object.values(REFUSE_REASONS));

/** Frozen UC-018 BOUND pin — no NHP-018-BOUND-* in NHP matrix; CAS waiting_user. */
export const UC018_BOUND_PIN_ID = 'waiting_user-CAS';

/** Default required NHP / pin ids per column for UC-E2E-018. */
export const UC018_REQUIRED_NHP = Object.freeze({
  NEG: Object.freeze(['NHP-018-NEG-01']),
  FAULT: Object.freeze(['NHP-018-FAULT-01']),
  BOUND: Object.freeze([UC018_BOUND_PIN_ID]),
  ADV: Object.freeze(['NHP-018-ADV-01']),
  PERF: Object.freeze(['NHP-018-PERF-01']),
  LOAD: Object.freeze(['NHP-018-LOAD-01']),
});

const COLUMNS = Object.freeze(['NEG', 'FAULT', 'BOUND', 'ADV', 'PERF', 'LOAD']);

/** Target env classes that NEVER count as capacity-representative. */
export const LOCAL_ENV_CLASSES = Object.freeze([
  'local',
  'laptop',
  'docker-isolated',
  'localhost',
  'dev',
  'compose-local',
  'ci-isolated',
  'box-local',
]);

function isLocalEnv(targetEnv) {
  if (targetEnv == null || targetEnv === '') return true;
  const t = String(targetEnv).trim().toLowerCase();
  return LOCAL_ENV_CLASSES.some((c) => t === c || t.startsWith(c + '-') || t.includes('docker-isolated'));
}

function pushUnique(arr, code) {
  if (!REFUSE_REASON_LIST.includes(code)) {
    throw new Error(`refuse reason not in frozen enum: ${code}`);
  }
  if (!arr.includes(code)) arr.push(code);
}

function dualVerdict(dual) {
  const a = dual?.e2eHa;
  const b = dual?.ragRoute;
  const pass = (v) => v === 'PASS' || v === true || v === 'pass';
  const present = (v) => v != null && v !== '' && v !== 'PENDING' && v !== 'pending';
  if (!present(a) && !present(b)) return 'missing';
  if (!present(a) || !present(b)) return 'one';
  if (pass(a) && pass(b)) return 'both';
  if (pass(a) || pass(b)) return 'one';
  return 'missing';
}

/**
 * capacityRepresentative is true ONLY with declared non-local target env AND dual EOR.
 * Caps matching W2 2c4g/4c8g alone NEVER suffice for local/docker-isolated.
 */
export function isCapacityRepresentative(receipts, dual) {
  if (!receipts || receipts.capacityRepresentative !== true) return false;
  if (isLocalEnv(receipts.targetEnv)) return false;
  if (dualVerdict(dual) !== 'both') return false;
  if (receipts.evidenceOfRecord === false) return false;
  return true;
}

function evaluateColumn(colName, col, requiredNhps) {
  const reasons = [];
  const status = String(col?.status || 'blind').toLowerCase();
  const nhpIds = Array.isArray(col?.nhpIds) ? col.nhpIds.map(String) : [];
  const prove = col?.prove || {};
  const dual = col?.dual || {};
  const stack = col?.stack || {};
  const receipts = col?.receipts || {};

  // 1. status must be covered
  if (status === 'case-only') {
    pushUnique(reasons, REFUSE_REASONS.CASE_ONLY);
  } else if (status === 'blind' || status === 'not_run' || status === 'unknown') {
    if (nhpIds.length === 0) pushUnique(reasons, REFUSE_REASONS.HAPPY_ONLY);
    else pushUnique(reasons, REFUSE_REASONS.STATUS_NOT_COVERED);
  } else if (status !== 'covered') {
    // partial / gap / blocked / honesty-pin / …
    pushUnique(reasons, REFUSE_REASONS.STATUS_NOT_COVERED);
  }

  // 2. required NHP / BOUND pin
  const missingNhp = (requiredNhps || []).filter((id) => !nhpIds.includes(id));
  if (missingNhp.length > 0 || nhpIds.length === 0) {
    if (nhpIds.length === 0 && (status === 'blind' || status === 'not_run')) {
      pushUnique(reasons, REFUSE_REASONS.HAPPY_ONLY);
    } else {
      pushUnique(reasons, REFUSE_REASONS.MISSING_NHP);
    }
  }

  // 3. prove at committed SHA EXIT=0
  if (prove.staleSha === true) {
    pushUnique(reasons, REFUSE_REASONS.STALE_SHA);
  } else if (
    prove.committed === false ||
    prove.uncommitted === true ||
    prove.shaMatchesCommitted === false
  ) {
    pushUnique(reasons, REFUSE_REASONS.UNCOMMITTED_RUNNER);
  }
  // EXIT tri-state: null/absent → MISSING-RECEIPT; nonzero → PROVE-FAIL; 0 → ok
  if (prove.exit == null) {
    pushUnique(reasons, REFUSE_REASONS.MISSING_RECEIPT);
  } else if (Number(prove.exit) !== 0) {
    pushUnique(reasons, REFUSE_REASONS.PROVE_FAIL);
  }
  if (!prove.cmd && !prove.gitSha && status === 'covered') {
    pushUnique(reasons, REFUSE_REASONS.MISSING_RECEIPT);
  }

  // 4. dual EOR
  const dv = dualVerdict(dual);
  if (dv === 'missing') pushUnique(reasons, REFUSE_REASONS.MISSING_DUAL);
  else if (dv === 'one') pushUnique(reasons, REFUSE_REASONS.DUAL_ONE);

  // 5. stack — tri-state fail-closed (B-STACK-FAIL-OPEN):
  // postgres/postgresSaver must be === true; memorySaver/mysql/qdrant must be === false.
  // undefined/null/absent ⇒ STUB-STACK (never default-to-met).
  const stackObj = stack && typeof stack === 'object' ? stack : {};
  const badStack =
    stackObj.postgres !== true ||
    stackObj.postgresSaver !== true ||
    stackObj.memorySaver !== false ||
    stackObj.mysql !== false ||
    stackObj.qdrant !== false;
  if (badStack) pushUnique(reasons, REFUSE_REASONS.STUB_STACK);

  // 6. receipts / EOR — tri-state fail-closed (B-EOR-FAIL-OPEN):
  // evidenceOfRecord must be === true; absent/false ⇒ MISSING-RECEIPT (or IMPL-ONLY if labeled).
  if (receipts.implementerOnly === true) {
    pushUnique(reasons, REFUSE_REASONS.IMPL_ONLY);
  } else if (receipts.evidenceOfRecord !== true) {
    pushUnique(reasons, REFUSE_REASONS.MISSING_RECEIPT);
  }
  if (receipts.missing === true || receipts.present === false) {
    pushUnique(reasons, REFUSE_REASONS.MISSING_RECEIPT);
  }

  // 7. PERF/LOAD local-only hard cap
  if (colName === 'PERF' || colName === 'LOAD') {
    const capOk = isCapacityRepresentative(receipts, dual);
    if (!capOk) {
      pushUnique(reasons, REFUSE_REASONS.PERF_LOCAL_ONLY);
    }
  }

  const meetsCovered = reasons.length === 0 && status === 'covered';
  return {
    status: col?.status || status,
    meetsCovered,
    reasons,
  };
}

/**
 * @param {object} input — must NOT include `expected` (anti-tautology).
 * @returns {{ canHonestlyFlip: boolean, columns: object, reasons: string[] }}
 */
export function evaluate(input) {
  if (input == null || typeof input !== 'object') {
    throw new Error('evaluate(input): input must be an object');
  }
  // Anti-tautology: caller must not pass fixture expected outputs into evaluate.
  if (Object.prototype.hasOwnProperty.call(input, 'expected')) {
    throw new Error('evaluate(input): input must not contain `expected` (anti-tautology)');
  }

  const columnsIn = input.columns || {};
  const requiredMap = input.requiredNhp || UC018_REQUIRED_NHP;
  const columns = {};
  const reasons = [];

  for (const colName of COLUMNS) {
    const result = evaluateColumn(colName, columnsIn[colName], requiredMap[colName]);
    columns[colName] = result;
    if (!result.meetsCovered) {
      for (const r of result.reasons) pushUnique(reasons, r);
    }
  }

  const s11 = input.section11 || {};
  const openGaps = Array.isArray(s11.openGaps) ? s11.openGaps.filter(Boolean) : [];
  if (openGaps.length > 0) {
    pushUnique(reasons, REFUSE_REASONS.OPEN_GAP);
  }
  if (s11.businessPathMet !== true) {
    pushUnique(reasons, REFUSE_REASONS.S11_NOT_MET);
  }
  if (s11.status && String(s11.status).toLowerCase() === 'case-only') {
    pushUnique(reasons, REFUSE_REASONS.CASE_ONLY);
  }

  const allColsMet = COLUMNS.every((c) => columns[c].meetsCovered === true);
  // True branch: reachable when all six meetCovered AND §1.1 business path AND no open GAP.
  const canHonestlyFlip = allColsMet && s11.businessPathMet === true && openGaps.length === 0;

  if (!canHonestlyFlip) {
    // Ensure at least one UC-level reason when false
    if (reasons.length === 0) {
      if (!allColsMet) pushUnique(reasons, REFUSE_REASONS.STATUS_NOT_COVERED);
      else if (openGaps.length > 0) pushUnique(reasons, REFUSE_REASONS.OPEN_GAP);
      else pushUnique(reasons, REFUSE_REASONS.S11_NOT_MET);
    }
  }

  return {
    canHonestlyFlip,
    columns,
    reasons,
  };
}

export const COLUMN_NAMES = COLUMNS;
