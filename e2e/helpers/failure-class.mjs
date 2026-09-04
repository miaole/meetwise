/**
 * Closed E2E failure classification ledger.
 *
 * Common harness pattern (Playwright / Cypress / isolated runners): attribute
 * a failed run to one stack layer so operators do not get an opaque
 * "e2e failed". Codes are allowlisted identifiers. This module never accepts
 * or persists secrets, tokens, prompts, answers, or connection strings.
 *
 * Isolated prove receipts keep their own proofSummary.failureClass vocabulary;
 * do not mix that set with this ledger.
 */

export const E2E_FAILURE_CLASSES = Object.freeze([
  'api',
  'worker',
  'db',
  'provider',
  'capability',
  'data_or_permission',
  'frontend',
]);

const OPAQUE_CODES = Object.freeze([
  'e2e',
  'e2e_failed',
  'failed',
  'unknown',
  'error',
  'none',
]);

const CODE_RE = /^[a-z][a-z0-9_]{0,79}$/;

/** JSON-Schema-shaped check for the two-field record. Not a product contract. */
export const E2E_FAILURE_RECORD_SCHEMA = Object.freeze({
  type: 'object',
  additionalProperties: false,
  required: ['class', 'code'],
  properties: {
    class: { type: 'string', enum: [...E2E_FAILURE_CLASSES] },
    code: { type: 'string', pattern: CODE_RE.source, not: { enum: [...OPAQUE_CODES] } },
  },
});

export const E2E_FAILURE_LINE_RE = new RegExp(
  `^E2E_FAILURE class=(${E2E_FAILURE_CLASSES.join('|')}) code=([a-z][a-z0-9_]{0,79})$`,
);

export const E2E_REVIEW_LINE_RE = new RegExp(
  `^E2E_REVIEW class=(${E2E_FAILURE_CLASSES.join('|')}) code=([a-z][a-z0-9_]{0,79})$`,
);

export const E2E_REVIEW_SUMMARY_RE = /^E2E_REVIEW_SUMMARY count=([1-9][0-9]?)$/;

const REVIEW_LEDGER_LIMIT = 32;

/**
 * Closed map of AI/system SSE terminals → ledger class.
 * Ready terminals are recorded too: a green run that never classified them
 * is an opaque pass. Unmapped terminals are not guessed.
 */
export const AI_SYSTEM_TERMINAL_REVIEWS = Object.freeze({
  report_ready: { class: 'worker', code: 'report_ready' },
  report_unavailable: { class: 'worker', code: 'report_unavailable' },
  assessment_unavailable: { class: 'worker', code: 'assessment_unavailable' },
  interview_unavailable: { class: 'worker', code: 'interview_unavailable' },
  quiz_ready: { class: 'worker', code: 'quiz_ready' },
  quiz_unavailable: { class: 'worker', code: 'quiz_unavailable' },
  diagnosis_ready: { class: 'worker', code: 'diagnosis_ready' },
  diagnosis_unavailable: { class: 'worker', code: 'diagnosis_unavailable' },
  error: { class: 'worker', code: 'terminal_error' },
});

/**
 * Known runner / helper prefixes → ledger class.
 * Product-specific secret names are intentionally absent.
 */
const KNOWN_CODE_CLASS = Object.freeze({
  live_provider_key_missing: 'provider',
  fake_service_mode_forbidden: 'provider',
  e2e_live_voice_gateway_exhausted: 'provider',
  voice_gateway_exhausted: 'provider',
  voice_gateway_network: 'provider',
  isolated_postgres_database_not_ready: 'db',
  isolated_postgres_port_unparseable: 'db',
  isolated_e2e_migrate_failed: 'db',
  e2e_api_db_not_ready: 'db',
  e2e_ui_api_db_not_ready: 'db',
  performance_e2e_database_not_ready: 'db',
  e2e_api_not_ready: 'api',
  e2e_api_exited_before_test: 'api',
  e2e_port_invalid: 'api',
  e2e_port_collision: 'api',
  e2e_ui_port_invalid: 'api',
  e2e_ui_port_collision: 'api',
  e2e_client_exited: 'api',
  client_exited: 'api',
  client_uncaught: 'api',
  assertion: 'api',
  performance_e2e_api_exited_before_test: 'api',
  performance_e2e_port_invalid: 'api',
  performance_e2e_port_collision: 'api',
  e2e_worker_exited_before_test: 'worker',
  e2e_worker_not_ready_before_test: 'worker',
  e2e_ui_worker_not_ready_before_test: 'worker',
  interview_terminal_timeout: 'worker',
  performance_e2e_worker_exited_before_test: 'worker',
  performance_e2e_worker_not_ready_before_test: 'worker',
  e2e_auth_failed: 'data_or_permission',
  e2e_token_uid_missing: 'data_or_permission',
  e2e_question_identity_missing: 'data_or_permission',
  auth_failed: 'data_or_permission',
  token_uid_missing: 'data_or_permission',
  question_identity_missing: 'data_or_permission',
  e2e_isolation_required: 'capability',
  e2e_ui_isolation_required: 'capability',
  performance_e2e_isolation_required: 'capability',
  success_without_assertion_summary: 'capability',
  success_with_failure_class: 'capability',
  opaque_pass: 'capability',
  review_summary_mismatch: 'capability',
  review_ledger_overflow: 'capability',
  unclassified_ai_system_terminal: 'worker',
  report_unavailable: 'worker',
  assessment_unavailable: 'worker',
  interview_unavailable: 'worker',
  quiz_unavailable: 'worker',
  diagnosis_unavailable: 'worker',
  terminal_error: 'worker',
  voice_transient: 'provider',
  e2e_ui_web_not_ready: 'frontend',
  e2e_ui_client_exited: 'frontend',
  web_not_ready: 'frontend',
});

export function isE2EFailureClass(value) {
  return E2E_FAILURE_CLASSES.includes(value);
}

export function isOpaqueFailureCode(code) {
  return OPAQUE_CODES.includes(code);
}

export function parseE2EFailureRecord(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('e2e_failure_record_invalid');
  }
  const keys = Object.keys(value);
  if (keys.length !== 2 || !keys.includes('class') || !keys.includes('code')) {
    throw new Error('e2e_failure_record_invalid');
  }
  if (!isE2EFailureClass(value.class)) throw new Error('e2e_failure_class_invalid');
  if (typeof value.code !== 'string' || !CODE_RE.test(value.code)) {
    throw new Error('e2e_failure_code_invalid');
  }
  if (isOpaqueFailureCode(value.code)) throw new Error('e2e_failure_code_opaque');
  return { class: value.class, code: value.code };
}

export function formatE2EFailure(record) {
  const safe = parseE2EFailureRecord(record);
  return `E2E_FAILURE class=${safe.class} code=${safe.code}`;
}

export function parseE2EFailureLine(text) {
  const source = String(text ?? '');
  const match = source.match(E2E_FAILURE_LINE_RE) ?? source.match(new RegExp(E2E_FAILURE_LINE_RE.source, 'm'));
  if (!match) return null;
  try {
    return parseE2EFailureRecord({ class: match[1], code: match[2] });
  } catch {
    return null;
  }
}

export function parseE2EFailure(error) {
  if (error && typeof error === 'object' && error.e2eFailure) {
    try {
      return parseE2EFailureRecord(error.e2eFailure);
    } catch {
      return null;
    }
  }
  const text = error instanceof Error ? error.message : String(error ?? '');
  return parseE2EFailureLine(text);
}

function prefixCode(message) {
  const raw = String(message ?? '').split(':')[0];
  return CODE_RE.test(raw) ? raw : null;
}

function toLedgerCode(prefix) {
  const stripped = prefix.replace(/^(e2e_|e2e_ui_|performance_e2e_)/, '');
  return CODE_RE.test(stripped) && !isOpaqueFailureCode(stripped) ? stripped : prefix;
}

/**
 * Read a tagged error or map a known runner/helper code.
 * Returns null for opaque blobs such as "E2E 失败" — callers must not invent a class.
 */
export function classifyE2EFailure(error) {
  const tagged = parseE2EFailure(error);
  if (tagged) return tagged;
  const text = error instanceof Error ? error.message : String(error ?? '');
  if (/E2E 失败|e2e failed/i.test(text) && !E2E_FAILURE_LINE_RE.test(text)) return null;
  if (/worker_exit/.test(text)) return parseE2EFailureRecord({ class: 'worker', code: 'worker_exited_during_test' });
  if (/api_exit/.test(text)) return parseE2EFailureRecord({ class: 'api', code: 'api_exited_during_test' });
  const prefix = prefixCode(text);
  if (prefix && KNOWN_CODE_CLASS[prefix]) {
    return parseE2EFailureRecord({ class: KNOWN_CODE_CLASS[prefix], code: toLedgerCode(prefix) });
  }
  if (/DB 未就绪|database_not_ready|isolated_postgres|migrate_failed/i.test(text)) {
    return parseE2EFailureRecord({ class: 'db', code: 'database_not_ready' });
  }
  if (/api 未就绪/i.test(text)) return parseE2EFailureRecord({ class: 'api', code: 'api_not_ready' });
  if (/worker/i.test(text) && /not_ready|未就绪/i.test(text)) {
    return parseE2EFailureRecord({ class: 'worker', code: 'worker_not_ready' });
  }
  if (/web 未就绪/i.test(text)) return parseE2EFailureRecord({ class: 'frontend', code: 'web_not_ready' });
  return null;
}

export function tagE2EFailure(failureClass, code, cause) {
  const record = parseE2EFailureRecord({ class: failureClass, code });
  const error = new Error(formatE2EFailure(record));
  error.name = 'E2EFailure';
  error.e2eFailure = record;
  if (cause !== undefined) error.cause = cause;
  return error;
}

export function emitE2EFailure(record) {
  const line = formatE2EFailure(record);
  // stdout: isolated receipt parser (stderr is withheld there).
  // stderr: interactive runner / operator.
  console.log(line);
  console.error(line);
  return line;
}

export function emitClassifiedE2EFailure(error, fallback) {
  const record = classifyE2EFailure(error) ?? parseE2EFailureRecord(fallback);
  return emitE2EFailure(record);
}

export function reviewAiSystemTerminal(terminal) {
  const mapped = AI_SYSTEM_TERMINAL_REVIEWS[terminal];
  if (!mapped) return null;
  return parseE2EFailureRecord(mapped);
}

export function formatE2EReview(record) {
  const safe = parseE2EFailureRecord(record);
  return `E2E_REVIEW class=${safe.class} code=${safe.code}`;
}

export function parseE2EReviewLine(text) {
  const source = String(text ?? '');
  const match = source.match(E2E_REVIEW_LINE_RE) ?? source.match(new RegExp(E2E_REVIEW_LINE_RE.source, 'm'));
  if (!match) return null;
  try {
    return parseE2EFailureRecord({ class: match[1], code: match[2] });
  } catch {
    return null;
  }
}

export function parseE2EReviewSummaryCount(text) {
  const source = String(text ?? '');
  const match = source.match(E2E_REVIEW_SUMMARY_RE) ?? source.match(new RegExp(E2E_REVIEW_SUMMARY_RE.source, 'm'));
  if (!match) return null;
  const count = Number(match[1]);
  return Number.isInteger(count) && count >= 1 && count <= REVIEW_LEDGER_LIMIT ? count : null;
}

export function lastE2EFailureClass(output) {
  let found = null;
  for (const line of String(output ?? '').split(/\r?\n/)) {
    const parsed = parseE2EFailureLine(line);
    if (parsed) found = parsed.class;
  }
  return found;
}

export function parseE2EAssertionCount(output) {
  const match = String(output ?? '').match(/^✓ E2E 全栈跑通\((\d+) 断言,[^\n]*$/m);
  if (!match) return null;
  const count = Number(match[1]);
  return Number.isInteger(count) && count >= 0 ? count : null;
}

export function formatE2EReviewCodes(reviews) {
  const codes = reviews.map((item) => parseE2EFailureRecord(item).code);
  if (codes.length < 1 || codes.length > 32) throw new Error('e2e_review_codes_invalid');
  return `E2E_REVIEW_CODES codes=${codes.join(',')}`;
}

/**
 * Isolated HTTP E2E pass gate. Exit 0 without a reviewable AI/system ledger
 * is opaque_pass — never accept that as green.
 */
export function evaluateIsolatedHttpE2E({ exitCode, stdout }) {
  const assertionCount = parseE2EAssertionCount(stdout);
  const failureClass = lastE2EFailureClass(stdout);
  let reviewLedger = [];
  try {
    reviewLedger = collectE2EReviews(stdout);
  } catch (error) {
    return {
      accept: false,
      reject: parseE2EFailure(error) ?? { class: 'capability', code: 'review_ledger_overflow' },
      assertionCount,
      failureClass,
      reviewLedger: [],
    };
  }
  const reviewCount = parseE2EReviewSummaryCount(stdout);
  if (exitCode === 0 && !Number.isInteger(assertionCount)) {
    return { accept: false, reject: { class: 'capability', code: 'success_without_assertion_summary' }, assertionCount, failureClass, reviewLedger };
  }
  if (exitCode === 0 && failureClass) {
    return { accept: false, reject: { class: 'capability', code: 'success_with_failure_class' }, assertionCount, failureClass, reviewLedger };
  }
  if (exitCode === 0 && (reviewCount === null || reviewLedger.length < 1)) {
    return { accept: false, reject: { class: 'capability', code: 'opaque_pass' }, assertionCount, failureClass, reviewLedger };
  }
  if (exitCode === 0 && reviewCount !== reviewLedger.length) {
    return { accept: false, reject: { class: 'capability', code: 'review_summary_mismatch' }, assertionCount, failureClass, reviewLedger };
  }
  return {
    accept: exitCode === 0,
    reject: null,
    assertionCount,
    failureClass,
    reviewLedger,
  };
}

export function collectE2EReviews(output) {
  const reviews = [];
  for (const line of String(output ?? '').split(/\r?\n/)) {
    const parsed = parseE2EReviewLine(line);
    if (parsed) {
      if (reviews.length >= REVIEW_LEDGER_LIMIT) throw tagE2EFailure('capability', 'review_ledger_overflow');
      reviews.push(parsed);
    }
  }
  return reviews;
}

export function formatE2EReviewSummary(count) {
  if (!Number.isInteger(count) || count < 1 || count > REVIEW_LEDGER_LIMIT) {
    throw new Error('e2e_review_summary_count_invalid');
  }
  return `E2E_REVIEW_SUMMARY count=${count}`;
}

let activeReviewLedger = null;

export function emitE2EReview(record) {
  if (activeReviewLedger) return activeReviewLedger.record(record);
  const line = formatE2EReview(record);
  console.log(line);
  console.error(line);
  return line;
}

export function createE2EReviewLedger(limit = REVIEW_LEDGER_LIMIT) {
  const entries = [];
  const ledger = {
    record(record) {
      const safe = parseE2EFailureRecord(record);
      if (entries.length >= limit) throw tagE2EFailure('capability', 'review_ledger_overflow');
      entries.push(safe);
      const line = formatE2EReview(safe);
      console.log(line);
      console.error(line);
      return safe;
    },
    recordTerminal(terminal) {
      const mapped = reviewAiSystemTerminal(terminal);
      if (!mapped) throw tagE2EFailure('worker', 'unclassified_ai_system_terminal');
      return ledger.record(mapped);
    },
    snapshot() {
      return entries.map((entry) => ({ class: entry.class, code: entry.code }));
    },
    emitSummary() {
      if (entries.length < 1) throw tagE2EFailure('capability', 'opaque_pass');
      const line = formatE2EReviewSummary(entries.length);
      console.log(line);
      console.error(line);
      return line;
    },
  };
  activeReviewLedger = ledger;
  return ledger;
}
