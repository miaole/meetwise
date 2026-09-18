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
  return env;
}
