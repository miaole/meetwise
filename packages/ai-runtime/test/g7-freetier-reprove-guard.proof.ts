/**
 * Offline NHP proofs for G7 FreeTierOnly re-prove guards.
 * No network / no real secrets / no paid calls.
 */
import {
  G7_ASR_GAP_ID,
  G7_BANNED_TEST_MODELS,
  G7_CONSOLE_PRICE_BOOK,
  G7_PAID_FALLBACK_ALLOWLIST,
  G7_RUN_COST_CAP_CNY,
  applyG7FreetierReproveEnv,
  assertCalibrationModelMatch,
  assertModelAllowedForTest,
  assertModelApiKeyPresent,
  assertPriceBookHasModel,
  asrPathStatus,
  bounded429BackoffMs,
  classifyProviderError,
  createG7RunCostState,
  estimateCallCostCny,
  keyFingerprintPrefix,
  recordCallAndAccumulateCost,
  resolveG7TestProfile,
  selectPaidFallback,
} from '../src/g7-freetier-reprove-guard.ts';

let failures = 0;
const A = (name: string, ok: boolean) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
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

function main() {
  const profile = resolveG7TestProfile({});
  A('free-first primary is qwen3.8-flash', profile.primaryModel === 'qwen3.8-flash');
  A('paid fallback disabled by default', profile.paidFallbackEnabled === false);

  const env = applyG7FreetierReproveEnv({});
  A('apply pins MODEL_NAME to free model', env.MODEL_NAME === 'qwen3.8-flash');
  A('billing model aligned with MODEL_NAME', env.MODEL_PRIMARY_BILLING_MODEL === env.MODEL_NAME);

  A(
    'deepseek-v4-pro refused without approval flag',
    throws(() => assertModelAllowedForTest('deepseek-v4-pro', {}), 'g7_model_banned_without_approval'),
  );
  A(
    'deepseek-v4-pro allowed with approval flag',
    !throws(() => assertModelAllowedForTest('deepseek-v4-pro', { ALLOW_DEEPSEEK_V4_PRO_TEST: '1' }), 'banned'),
  );
  A(
    'undeclared model refused',
    throws(() => assertModelAllowedForTest('gpt-4o-mini', {}), 'g7_model_undeclared'),
  );

  A(
    'missing price book entry fail-closed',
    throws(() => assertPriceBookHasModel('not-a-real-model'), 'g7_price_book_missing'),
  );
  A('qwen-plus has console price', assertPriceBookHasModel('qwen-plus').kind === 'token');
  A('price book has free-quota row', G7_CONSOLE_PRICE_BOOK['qwen3.8-flash']?.kind === 'token');

  A(
    'paid fallback disabled throws with reason',
    throws(
      () => selectPaidFallback({
        fromModel: 'qwen3.8-flash',
        triggerErrorClass: 'FreeTierOnly',
        paidFallbackEnabled: false,
      }),
      'g7_paid_fallback_disabled',
    ),
  );
  const fb = selectPaidFallback({
    fromModel: 'qwen3.8-flash',
    triggerErrorClass: 'FreeTierOnly',
    paidFallbackEnabled: true,
  });
  A(
    'fallback records from→to + trigger',
    fb.fromModel === 'qwen3.8-flash' && fb.toModel === 'qwen-plus' && fb.triggerErrorClass === 'FreeTierOnly',
  );
  A('fallback allowlist is qwen-plus|deepseek-v4-flash', G7_PAID_FALLBACK_ALLOWLIST.join(',') === 'qwen-plus,deepseek-v4-flash');
  A('banned list includes deepseek-v4-pro', (G7_BANNED_TEST_MODELS as readonly string[]).includes('deepseek-v4-pro'));

  A('run cost cap is ¥5', G7_RUN_COST_CAP_CNY === 5);
  let state = createG7RunCostState(0.01);
  A(
    'cost cap hit fails closed with COST_CAP',
    throws(() => {
      recordCallAndAccumulateCost(state, {
        callId: 'c1',
        actualModel: 'qwen-plus',
        inputTokens: 1_000_000,
        outputTokens: 1_000_000,
        startedAt: '2026-09-23T00:00:00.000Z',
        finishedAt: '2026-09-23T00:00:01.000Z',
        evidenceClass: 'paid_fallback',
      });
    }, 'COST_CAP'),
  );
  const freeCost = estimateCallCostCny({ model: 'qwen3.8-flash', inputTokens: 1000, outputTokens: 100 });
  A('free-quota model estimates 0 within free quota', freeCost === 0);
  state = createG7RunCostState();
  state = recordCallAndAccumulateCost(state, {
    callId: 'c0',
    actualModel: 'qwen3.8-flash',
    inputTokens: 1000,
    outputTokens: 100,
    startedAt: '2026-09-23T00:00:00.000Z',
    finishedAt: '2026-09-23T00:00:01.000Z',
    evidenceClass: 'free_quota_wiring_only',
  });
  A('free call recorded with actualModel', state.calls[0]?.actualModel === 'qwen3.8-flash');

  A(
    'missing MODEL_API_KEY fail-closed',
    throws(() => assertModelApiKeyPresent({}), 'g7_model_api_key_missing'),
  );
  const fp = assertModelApiKeyPresent({ MODEL_API_KEY: 'test-not-a-real-secret' });
  A('key fingerprint is 8 hex chars', /^[0-9a-f]{8}$/.test(fp));
  A('fingerprint helper stable', keyFingerprintPrefix('test-not-a-real-secret') === fp);

  A('429 attempt0 returns base backoff', bounded429BackoffMs(0) === 200);
  A('429 attempt1 doubles', bounded429BackoffMs(1) === 400);
  A(
    '429 exhausted fails closed',
    throws(() => bounded429BackoffMs(3), 'g7_429_backoff_exhausted'),
  );

  A('classifies FreeTierOnly', classifyProviderError('403 AllocationQuota.FreeTierOnly') === 'FreeTierOnly');
  A('classifies quota exhausted', classifyProviderError('quota exhausted for model') === 'quota_exhausted');
  A('classifies capability unsupported', classifyProviderError('model_not_found') === 'capability_unsupported');

  A(
    'calibration cross-model forbidden',
    throws(() => assertCalibrationModelMatch('qwen3.8-flash', 'qwen-plus'), 'g7_calibration_cross_model_forbidden'),
  );
  A('calibration same-model ok', (() => { assertCalibrationModelMatch('qwen-plus', 'qwen-plus'); return true; })());

  const asr = asrPathStatus();
  A('ASR is skip_prereq while gap open', asr.status === 'skip_prereq' && asr.countedAsPass === false);
  A('ASR gap id pinned', asr.gapId === G7_ASR_GAP_ID);

  if (failures > 0) {
    console.error(`FAILED ${failures}`);
    process.exit(1);
  }
  console.log('OK g7-freetier-reprove-guard offline NHP');
}

main();
