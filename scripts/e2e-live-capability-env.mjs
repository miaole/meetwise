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
    env.MODEL_NAME = String(env.G7_FREE_PRIMARY_MODEL ?? 'qwen3.8-flash').trim() || 'qwen3.8-flash';
    env.MODEL_FAST_NAME = String(env.G7_FREE_FAST_MODEL ?? 'qwen3.8-flash').trim() || 'qwen3.8-flash';
    if (String(env.MODEL_NAME) === 'deepseek-v4-pro' && String(env.ALLOW_DEEPSEEK_V4_PRO_TEST ?? '').trim() !== '1') {
      throw new Error('g7_model_banned_without_approval:deepseek-v4-pro');
    }
    // Hard-guard for Step2 free-only runs: refuse any paid model when fallback disabled.
    if (String(env.G7_PAID_FALLBACK_ENABLED ?? '0').trim() !== '1') {
      const paid = new Set(['qwen-plus', 'deepseek-v4-flash', 'deepseek-v4-pro', 'qwen-turbo', 'qwen-max']);
      if (paid.has(String(env.MODEL_NAME ?? '').trim())) {
        throw new Error(`g7_paid_model_forbidden_while_fallback_disabled:${env.MODEL_NAME}`);
      }
    }
  }
  return env;
}
