import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

/**
 * Live isolated E2E capability env (runner-only).
 *
 * Text live path uses MODEL_API_KEY. Repo default MODEL_ENDPOINT_PROFILE is
 * deepseek-cn-public; the authorized meetwise-secrets live key is Bailian /
 * DashScope-compatible, so isolated E2E pins dashscope-cn-beijing when unset.
 * Operators may still override MODEL_ENDPOINT_PROFILE explicitly.
 *
 * OCR / native ASR / TTS require dedicated DashScope capability keys and must
 * NOT inherit MODEL_API_KEY. This helper only enables OCR preview flags when
 * DASHSCOPE_VISION_API_KEY is already present. Never invents credentials.
 * releaseEvidence stays false at the suite layer.
 */
export function applyLiveE2ECapabilityEnv(env) {
  if (String(env.MODEL_API_KEY ?? '').trim()) {
    if (!String(env.MODEL_ENDPOINT_PROFILE ?? '').trim()) {
      env.MODEL_ENDPOINT_PROFILE = 'dashscope-cn-beijing';
    }
  }
  const vision = String(env.DASHSCOPE_VISION_API_KEY ?? '').trim();
  if (vision) {
    if (!String(env.OCR_ENABLED ?? '').trim()) env.OCR_ENABLED = '1';
    if (!String(env.OCR_PREVIEW ?? '').trim()) env.OCR_PREVIEW = '1';
  }

  // Line C G7 FreeTierOnly re-prove: free-first pins (no silent paid). When
  // G7_FREETIER_REPROVE=1, force dashscope-cn-beijing + qwen3.8-flash free profile.
  // Paid fallback stays OFF unless G7_PAID_FALLBACK_ENABLED=1 (still allowlist-only).
  if (String(env.G7_FREETIER_REPROVE ?? '').trim() === '1') {
    env.MODEL_ENDPOINT_PROFILE = 'dashscope-cn-beijing';
    if (!String(env.G7_RUN_COST_LEDGER_PATH ?? '').trim()) {
      throw new Error('g7_cost_ledger_path_missing');
    }
    // G7 e2e-only: R1 MEETWISE_TECH_ROLE_FAIL_CLOSED defaults ON and e2e fixtures
    // do not write InterviewRouteSnapshot, so start dies with adaptive_role_route_missing
    // before any model call. Opt out ONLY when G7 is on and the operator has not
    // already set the flag — production default remains fail-closed. This is NOT
    // R1/R2 close evidence and is disclosed on the Step3 receipt.
    if (!String(env.MEETWISE_TECH_ROLE_FAIL_CLOSED ?? '').trim()) {
      env.MEETWISE_TECH_ROLE_FAIL_CLOSED = '0';
    }
    // Always pin free-first when G7 is on (no silent keep of paid MODEL_NAME).
    // Reject names outside the declared free list before assignment so a bad
    // G7_FREE_* value never lands on MODEL_NAME / MODEL_FAST_NAME.
    const freeModels = new Set([
      'qwen3.8-flash',
      'qwen3.8-max',
      'qwen3.8-27b',
      'qwen3.8-omni-flash',
      'qwen3.7-flash',
    ]);
    const primaryModel = String(env.G7_FREE_PRIMARY_MODEL ?? 'qwen3.8-flash').trim() || 'qwen3.8-flash';
    const fastModel = String(env.G7_FREE_FAST_MODEL ?? 'qwen3.8-flash').trim() || 'qwen3.8-flash';
    if (!freeModels.has(primaryModel)) {
      throw new Error(`g7_free_primary_model_undeclared:${primaryModel}`);
    }
    if (!freeModels.has(fastModel)) {
      throw new Error(`g7_free_fast_model_undeclared:${fastModel}`);
    }
    env.MODEL_NAME = primaryModel;
    env.MODEL_FAST_NAME = fastModel;
    if (String(env.MODEL_NAME) === 'deepseek-v4-pro' && String(env.ALLOW_DEEPSEEK_V4_PRO_TEST ?? '').trim() !== '1') {
      throw new Error('g7_model_banned_without_approval:deepseek-v4-pro');
    }
    // Hard-guard for Step2 free-only runs: refuse any paid model when fallback disabled.
    if (String(env.G7_PAID_FALLBACK_ENABLED ?? '0').trim() !== '1') {
      const paid = new Set(['qwen-plus', 'deepseek-v4-flash', 'deepseek-v4-pro', 'qwen-turbo', 'qwen-max']);
      if (paid.has(String(env.MODEL_NAME ?? '').trim())) {
        throw new Error(`g7_paid_model_forbidden_while_fallback_disabled:${env.MODEL_NAME}`);
      }
      if (paid.has(String(env.MODEL_FAST_NAME ?? '').trim())) {
        throw new Error(`g7_paid_model_forbidden_while_fallback_disabled:${env.MODEL_FAST_NAME}`);
      }
    }
  }
  return env;
}

function proveG7FreeModelNames() {
  const env = { MODEL_NAME: 'qwen-plus' };
  applyLiveE2ECapabilityEnv(env);
  if (env.MODEL_NAME !== 'qwen-plus') {
    console.error('flag_off_model_name_changed');
    process.exit(1);
  }

  env.G7_FREETIER_REPROVE = '1';
  env.G7_RUN_COST_LEDGER_PATH = 'g7-cost-ledger.json';
  applyLiveE2ECapabilityEnv(env);
  if (env.MODEL_NAME !== 'qwen3.8-flash' || env.MODEL_FAST_NAME !== 'qwen3.8-flash') {
    console.error('default_free_models_missing');
    process.exit(1);
  }

  env.G7_FREE_PRIMARY_MODEL = 'qwen3.8-max';
  env.G7_FREE_FAST_MODEL = 'qwen3.8-max';
  applyLiveE2ECapabilityEnv(env);
  if (env.MODEL_NAME !== 'qwen3.8-max' || env.MODEL_FAST_NAME !== 'qwen3.8-max') {
    console.error('qwen38_max_rejected');
    process.exit(1);
  }

  const badPrimary = ['qwen-plus', 'qwen-vl-max', 'not-a-model'];
  for (const name of badPrimary) {
    env.G7_FREE_PRIMARY_MODEL = name;
    const beforeName = env.MODEL_NAME;
    const beforeFast = env.MODEL_FAST_NAME;
    let caught = null;
    try {
      applyLiveE2ECapabilityEnv(env);
    } catch (error) {
      caught = error;
    }
    const message = caught && caught.message;
    if (message !== `g7_free_primary_model_undeclared:${name}` || env.MODEL_NAME !== beforeName || env.MODEL_FAST_NAME !== beforeFast) {
      console.error(`primary_undeclared_failed:${name}:${message}:name=${env.MODEL_NAME}`);
      process.exit(1);
    }
  }

  env.G7_FREE_PRIMARY_MODEL = 'qwen3.8-flash';
  env.G7_FREE_FAST_MODEL = 'qwen-plus';
  const beforeFastCheckName = env.MODEL_NAME;
  const beforeFastCheckFast = env.MODEL_FAST_NAME;
  let fastCaught = null;
  try {
    applyLiveE2ECapabilityEnv(env);
  } catch (error) {
    fastCaught = error;
  }
  const fastMessage = fastCaught && fastCaught.message;
  if (fastMessage !== 'g7_free_fast_model_undeclared:qwen-plus' || env.MODEL_NAME !== beforeFastCheckName || env.MODEL_FAST_NAME !== beforeFastCheckFast) {
    console.error(`fast_undeclared_failed:${fastMessage}:name=${env.MODEL_NAME}:fast=${env.MODEL_FAST_NAME}`);
    process.exit(1);
  }

  delete env.G7_RUN_COST_LEDGER_PATH;
  let ledgerCaught = null;
  try {
    applyLiveE2ECapabilityEnv(env);
  } catch (error) {
    ledgerCaught = error;
  }
  if (!ledgerCaught || ledgerCaught.message !== 'g7_cost_ledger_path_missing') {
    console.error(`ledger_missing_failed:${ledgerCaught && ledgerCaught.message}`);
    process.exit(1);
  }

  console.log('g7_free_model_guard_ok');
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    proveG7FreeModelNames();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
