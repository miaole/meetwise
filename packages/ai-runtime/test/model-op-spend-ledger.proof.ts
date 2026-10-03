/**
 * MODEL-OP spend-ledger offline proves (Line I · docs REQUEST dfd8443 · pre-exec dual PASS).
 *
 * Harness plan checks (ai-docs/delivery/harness/model-op-spend-ledger-offline.md :41 + NHP 1-4):
 * - 1 NEG   missing ledger path fails closed (g7_cost_ledger_path_missing)
 * - 2 FAULT fixture ledger over cap refuses another estimated call; ledger bytes unchanged; zero transport
 * - 3 BOUND actualSpendCny stays null unless a cited console figure is supplied out of band;
 *           estimator / ledger rows / receipt can never carry an actual figure
 * - 4 ADV   rewritten NDJSON without a signature moves cap reads -> gap GN-SPEND-LEDGER-FILE
 *           demonstrated; harness-side policy rejects forged actuals without console citation
 *
 * Separation (mw-model-op pre-exec §5): G7 run-cap NDJSON ledger ≠ usage/calibration reconciler
 * (static, read-only text check); G7 estimatedCostCny is never rewritten into actualSpendCny.
 *
 * NEW offline fixture script. Imports guard exports read-only; edits ZERO files under
 * packages/ai-runtime/src/ and no outbound main-chain file. No network / no keys / no live calls.
 * EXIT 0 ≠ MODEL-OP closed ≠ cutover ≠ SLO.
 */
import { mkdtempSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  G7_PRICE_BOOK_CITATION,
  G7_RUN_COST_CAP_CNY,
  buildG7ReceiptFields,
  createG7RunCostState,
  readG7SharedLedger,
  recordCallAndAccumulateCost,
  recordG7CallToSharedLedger,
  reserveG7CallOnSharedLedger,
  resolveG7LedgerPath,
  resolveG7TestProfile,
} from '../src/g7-freetier-reprove-guard.ts';
import type { G7RunCostState } from '../src/g7-freetier-reprove-guard.ts';

let failures = 0;
const A = (name: string, ok: boolean, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` :: ${detail}` : ''}`);
  if (!ok) failures += 1;
};
const throws = (fn: () => unknown, needle: string): boolean => {
  try {
    fn();
    return false;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return msg.includes(needle);
  }
};

/** Harness-side policy (THIS FILE ONLY — not wired into src/): an actual spend figure is
 *  evidence only with a console invoice/snapshot/statement citation. A price-book citation
 *  (constant text) is NOT a console invoice for an actual. */
const CONSOLE_CITATION_RE = /^console[- ]?(invoice|snapshot|statement)\b/i;
const assertCitedActualSpend = (value: unknown, citation: unknown): number => {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    throw new Error('g7_actual_spend_invalid_figure');
  }
  if (typeof citation !== 'string' || !CONSOLE_CITATION_RE.test(citation.trim())) {
    throw new Error('g7_actual_spend_console_citation_missing');
  }
  return value;
};

const fixtureCallRow = (callId: string, estimatedCostCny: number): string =>
  `${JSON.stringify({
    callId,
    actualModel: 'deepseek-v4-flash',
    inputTokens: 500_000,
    outputTokens: 250_000,
    estimatedCostCny,
    startedAt: '2026-10-02T00:00:00.000Z',
    finishedAt: '2026-10-02T00:00:01.000Z',
    evidenceClass: 'paid_fallback',
  })}\n`;

const srcText = (rel: string): string =>
  readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8');

function main() {
  const dir = mkdtempSync(join(tmpdir(), `g7-spend-ledger-${process.pid}-`));
  const ledgerPath = join(dir, 'run.ndjson');
  const env = { G7_RUN_COST_LEDGER_PATH: ledgerPath } as NodeJS.ProcessEnv;

  // Transport spy (harness-side): any network attempt throws — the refusal paths under test
  // must be pure fs/policy code with zero transport (no live retry possible).
  let fetchAttempts = 0;
  const realFetch = globalThis.fetch;
  globalThis.fetch = (() => {
    fetchAttempts += 1;
    throw new Error('g7_proof_network_attempt_blocked');
  }) as typeof fetch;

  try {
    // ---------------------------------------------------------------- 1 NEG
    A('NEG: missing ledger path refused by resolveG7LedgerPath',
      throws(() => resolveG7LedgerPath({}), 'g7_cost_ledger_path_missing'));
    A('NEG: missing ledger path refused by readG7SharedLedger',
      throws(() => readG7SharedLedger({}), 'g7_cost_ledger_path_missing'));
    A('NEG: missing ledger path refused by recordG7CallToSharedLedger (fail closed)',
      throws(
        () => recordG7CallToSharedLedger(
          { callId: 'c0', actualModel: 'qwen3.8-flash', inputTokens: 1, outputTokens: 1, startedAt: 'x', finishedAt: 'y', evidenceClass: 'free_quota_wiring_only' },
          {},
        ),
        'g7_cost_ledger_path_missing',
      ));
    A('NEG: whitespace-only path refused (trim, not falsy luck)',
      throws(() => resolveG7LedgerPath({ G7_RUN_COST_LEDGER_PATH: '   ' }), 'g7_cost_ledger_path_missing'));
    A('NEG: path set but file absent reads as running 0 (empty ≠ missing path)',
      (() => {
        const snap = readG7SharedLedger(env);
        return snap.runningCostCny === 0 && snap.calls.length === 0 && snap.capCny === G7_RUN_COST_CAP_CNY;
      })());

    // -------------------------------------------------------------- 2 FAULT
    // Fixture ledger already at cap (¥5.00 settled): another estimated call must be refused.
    writeFileSync(ledgerPath, fixtureCallRow('fixture-at-cap', 5), 'utf8');
    const bytesBefore = readFileSync(ledgerPath, 'utf8');
    const refuse = () =>
      recordG7CallToSharedLedger(
        { callId: 'c1', actualModel: 'deepseek-v4-flash', inputTokens: 1_000_000, outputTokens: 1_000_000, startedAt: 'x', finishedAt: 'y', evidenceClass: 'paid_fallback' },
        env,
      );
    A('FAULT: at-cap fixture refuses another estimated call (g7_cost_cap_exceeded)',
      throws(refuse, 'g7_cost_cap_exceeded'));
    A('FAULT: refusal leaves ledger bytes unchanged (no silent write)',
      readFileSync(ledgerPath, 'utf8') === bytesBefore);
    A('FAULT: refusal attempted zero transport (no live retry)',
      fetchAttempts === 0, `fetchAttempts=${fetchAttempts}`);
    const overCap = () =>
      recordG7CallToSharedLedger(
        { callId: 'c2', actualModel: 'deepseek-v4-flash', inputTokens: 4_000_000, outputTokens: 1_000_000, startedAt: 'x', finishedAt: 'y', evidenceClass: 'paid_fallback' },
        env,
      );
    A('FAULT: over-cap estimate (5 + est 6 > 5) refused with COST_CAP class',
      throws(overCap, 'g7_cost_cap_exceeded:COST_CAP'));
    A('FAULT: still zero bytes written after over-cap refusal',
      readFileSync(ledgerPath, 'utf8') === bytesBefore);
    // Reservation path (pre-dispatch): paid reservation pushes settled 5 over cap → refused.
    const resRefuse = () =>
      reserveG7CallOnSharedLedger({ model: 'deepseek-v4-flash', estimatedInputTokens: 100_000, maxOutputTokens: 50_000 }, env);
    A('FAULT: paid reservation on at-cap fixture refused before dispatch',
      throws(resRefuse, 'g7_cost_cap_exceeded'));
    A('FAULT: ledger still unchanged after refused reservation',
      readFileSync(ledgerPath, 'utf8') === bytesBefore);
    // Token cap bound (env-set) on the reserve path.
    const tokEnv = { ...env, G7_RUN_TOKEN_CAP: '100' } as NodeJS.ProcessEnv;
    writeFileSync(ledgerPath, '', 'utf8');
    A('FAULT: reservation over token cap refused (g7_token_cap_exceeded)',
      throws(
        () => reserveG7CallOnSharedLedger({ model: 'qwen3.8-flash', estimatedInputTokens: 60, maxOutputTokens: 50 }, tokEnv),
        'g7_token_cap_exceeded',
      ));

    // --------------------------------------------------------------- 3 BOUND
    let state: G7RunCostState = createG7RunCostState();
    state = recordCallAndAccumulateCost(
      state,
      { callId: 'c3', actualModel: 'deepseek-v4-flash', inputTokens: 2_000_000, outputTokens: 1_000_000, startedAt: 'x', finishedAt: 'y', evidenceClass: 'paid_fallback' },
      {},
    );
    A('BOUND: estimator produces estimatedCostCny (number), never an actual field',
      typeof state.calls[0]?.estimatedCostCny === 'number' && !('actualSpendCny' in (state.calls[0] as object)));
    A('BOUND: ledger rows carry no actualSpendCny key (JSON-level)',
      !JSON.stringify(state.calls).includes('actualSpendCny'));
    const profile = resolveG7TestProfile({});
    const receipt = buildG7ReceiptFields({
      runnerCommitSha: '0'.repeat(40),
      porcelainClean: true,
      keyFingerprint8: 'deadbeef',
      costState: state,
      startedAt: '2026-10-02T00:00:00.000Z',
      finishedAt: '2026-10-02T00:00:02.000Z',
      profile,
    });
    A('BOUND: receipt actualSpendCny is null while estimatedCostCny is a number',
      receipt.actualSpendCny === null && typeof receipt.estimatedCostCny === 'number');
    // Forged env attempt: an env "actual" figure cannot leak into the receipt.
    process.env.G7_ACTUAL_SPEND_CNY = '999';
    const receiptForgedEnv = buildG7ReceiptFields({
      runnerCommitSha: '0'.repeat(40),
      porcelainClean: true,
      keyFingerprint8: 'deadbeef',
      costState: state,
      startedAt: 's',
      finishedAt: 'f',
      profile,
    });
    delete process.env.G7_ACTUAL_SPEND_CNY;
    A('BOUND: receipt actualSpendCny stays null even with a forged env figure present',
      receiptForgedEnv.actualSpendCny === null);
    A('BOUND: receipt carries releaseEvidence=false (pin retained in code)',
      receipt.releaseEvidence === false);
    A('BOUND: receipt priceBookCitation is the constant price citation, not a console invoice',
      receipt.priceBookCitation === G7_PRICE_BOOK_CITATION);

    // ----------------------------------------------------------------- 4 ADV
    // Gap demonstration: a rewritten (forged) NDJSON without any signature moves cap reads.
    writeFileSync(ledgerPath, fixtureCallRow('honest', 1), 'utf8');
    const honestReading = readG7SharedLedger(env).runningCostCny;
    writeFileSync(ledgerPath, fixtureCallRow('forged', 4.9), 'utf8');
    const forgedReading = readG7SharedLedger(env).runningCostCny;
    A('ADV: GN-SPEND-LEDGER-FILE demonstrated — rewritten unsigned NDJSON moves cap reads',
      honestReading === 1 && forgedReading === 4.9, `honest=${honestReading} forged=${forgedReading}`);
    A('ADV: ledger file carries no signature/HMAC field (gap, not endorsement)',
      !readFileSync(ledgerPath, 'utf8').includes('signature') && !readFileSync(ledgerPath, 'utf8').includes('hmac'));
    // Harness-side policy: forged actuals without console citation are rejected.
    A('ADV: forged actual without citation rejected (no citation)',
      throws(() => assertCitedActualSpend(0.42, ''), 'g7_actual_spend_console_citation_missing'));
    A('ADV: forged actual without citation rejected (casual remark ≠ console citation)',
      throws(() => assertCitedActualSpend(0.42, 'i think it was about 0.42'), 'g7_actual_spend_console_citation_missing'));
    A('ADV: price-book citation CANNOT authenticate an actual figure (constant ≠ console invoice)',
      throws(() => assertCitedActualSpend(0.42, G7_PRICE_BOOK_CITATION), 'g7_actual_spend_console_citation_missing'));
    A('ADV: non-finite figure rejected even with citation shape',
      throws(() => assertCitedActualSpend(Number.NaN, 'console-invoice 2026-09-30'), 'g7_actual_spend_invalid_figure'));
    A('ADV: negative figure rejected',
      throws(() => assertCitedActualSpend(-1, 'console-invoice 2026-09-30'), 'g7_actual_spend_invalid_figure'));
    A('ADV: cited console actual accepted by harness policy (out-of-band only)',
      assertCitedActualSpend(0.42, 'console-invoice 2026-09-30 dashscope console') === 0.42);
    A('ADV: even a cited actual never enters the code receipt (stays null)',
      buildG7ReceiptFields({
        runnerCommitSha: '0'.repeat(40),
        porcelainClean: true,
        keyFingerprint8: 'deadbeef',
        costState: state,
        startedAt: 's',
        finishedAt: 'f',
        profile,
      }).actualSpendCny === null);

    // ------------------------------------------------- separation (model-op §5)
    // G7 run-cap NDJSON ledger ≠ usage/calibration reconciler: static read-only text check,
    // no cross-wiring in either direction; receipt makes no closed/cutover claim.
    const guardText = srcText('../src/g7-freetier-reprove-guard.ts');
    const reconcilerText = srcText('../src/usage-calibration-reconciler.ts');
    A('SEP: usage-calibration reconciler never references the G7 NDJSON ledger path',
      !reconcilerText.includes('G7_RUN_COST_LEDGER_PATH') && !reconcilerText.includes('readG7SharedLedger'));
    A('SEP: G7 guard never references the PG calibration tables/reconciler',
      !guardText.includes('ai_usage_calibration') && !guardText.includes('runUsageCalibrationReconciler'));
    const receiptJson = JSON.stringify(receipt);
    A('SEP: receipt makes no modelOpClosed / cutover claim',
      !receiptJson.includes('modelOpClosed') && !receiptJson.includes('cutover'));
    A('SEP: receipt evidenceLabel keeps the free-tier non-evidence wording',
      receipt.evidenceLabel === 'free-tier model; not production-model evidence; not perf SLO evidence');
    A('SEP: price book citation stays the 2026-09-23 console-reported source (unverified, non-committal)',
      G7_PRICE_BOOK_CITATION === 'console-reported by user via coordinator 2026-09-23');

    A('transport spy: whole offline run made zero fetch attempts', fetchAttempts === 0, `fetchAttempts=${fetchAttempts}`);
  } finally {
    globalThis.fetch = realFetch;
    rmSync(dir, { recursive: true, force: true });
  }

  if (failures > 0) {
    console.error(`\nmodel-op-spend-ledger.proof: ${failures} FAILURE(S)`);
    process.exit(1);
  }
  console.log('\nmodel-op-spend-ledger.proof: ALL PASS (offline; EXIT 0 ≠ MODEL-OP closed ≠ cutover ≠ SLO)');
}

main();
