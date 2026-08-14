import { openAICompatibleClient, type ModelClient } from '@meetwise/ai-runtime';

/**
 * The API used to construct an unrestricted vision client directly.  OCR has
 * not yet completed MODEL-OP-01 (typed binding, media budget, cost policy and
 * deletion contract), so every environment keeps it disabled. This is
 * deliberately a composition-root guard: a later service edit cannot silently
 * turn an existing provider key into an unmetered OCR capability.
 */
export function isOcrFeatureEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.OCR_ENABLED === '1';
}

export function createOcrVisionClient(env: NodeJS.ProcessEnv = process.env): ModelClient {
  if (isOcrFeatureEnabled(env)) {
    throw new Error('ocr_model_operation_unconfigured');
  }
  return openAICompatibleClient({
    baseUrl: env.MODEL_BASE_URL,
    apiKey: env.MODEL_API_KEY,
    model: env.VISION_MODEL_NAME ?? 'qwen-vl-max',
    // A disabled composition remains incapable of dispatching even under a
    // test/development process environment. MODEL-OP-01 replaces this factory
    // with a typed vision binding before OCR may be enabled.
    requireBoundOperation: true,
  });
}
