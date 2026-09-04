import { assertVisionEndpointKeyFingerprint, openAICompatibleClient, resolveVisionEndpointConfig, type ModelClient } from '@meetwise/ai-runtime';

/**
 * Preview OCR capability (预览版, not a production SLO).
 *
 * Exact flags: `OCR_ENABLED=1` AND `OCR_PREVIEW=1`.
 * Production (`NODE_ENV=production`), `MODEL_COST_ENFORCEMENT=enforce`, and
 * the read-only public site (`MEETWISE_PUBLIC_PREVIEW=1`) stay refuse-closed
 * even if both flags are set. Binding existence does not lift that lock.
 *
 * Preview composition may dispatch through the frozen Beijing vision profile.
 * Missing Key / transport / schema / empty transcript stay fail-closed —
 * callers must not invent OCR text. Token ledger, media budget, deletion,
 * and live VL quality remain out of this slice. `releaseEvidence=false`.
 */
export function isProductionOcrLocked(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.NODE_ENV?.trim().toLowerCase() === 'production'
    || env.MODEL_COST_ENFORCEMENT?.trim().toLowerCase() === 'enforce'
    || env.MEETWISE_PUBLIC_PREVIEW === '1';
}

export function isOcrPreviewRequested(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.OCR_ENABLED === '1' && env.OCR_PREVIEW === '1';
}

/** True only when preview OCR may run the image path (reserve / visionOcr / admit). */
export function isOcrFeatureEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return isOcrPreviewRequested(env) && !isProductionOcrLocked(env);
}

export function createOcrVisionClient(env: NodeJS.ProcessEnv = process.env): ModelClient {
  if (env.OCR_ENABLED === '1' && !isOcrFeatureEnabled(env)) {
    throw new Error('ocr_model_operation_unconfigured');
  }
  // BAILIAN-03/04:切断对 MODEL_BASE_URL/MODEL_API_KEY 的复用。预览启用与禁用态都解析
  // **专用 vision profile**（Key 只读 DASHSCOPE_VISION_API_KEY）。
  assertVisionEndpointKeyFingerprint(env);
  resolveVisionEndpointConfig(env);
  if (isOcrFeatureEnabled(env)) {
    // Preview observe: do not invent a production price-book revision.
    // Image-unit entitlement (reserve/confirm/release) still wraps visionOcr.
    // requireBoundOperation stays off so a configured Key can dispatch;
    // missing Key / non-https / HTTP errors remain known_not_executed.
    // The same snapshot must drive the bound-operation fence: ambient
    // process.env MODEL_COST_ENFORCEMENT=enforce (e.g. regression dotenv)
    // must not refuse a client that already passed the preview composition lock.
    return openAICompatibleClient({ vision: true, env });
  }
  return openAICompatibleClient({
    vision: true,
    env,
    requireBoundOperation: true,
  });
}
