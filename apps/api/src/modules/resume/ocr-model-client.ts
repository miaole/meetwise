import { assertVisionEndpointKeyFingerprint, openAICompatibleClient, resolveVisionEndpointConfig, type ModelClient } from '@meetwise/ai-runtime';

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
  // BAILIAN-03/04:切断对 MODEL_BASE_URL/MODEL_API_KEY 的复用。即便禁用态也解析**专用 vision
  // profile**（Key 只读 DASHSCOPE_VISION_API_KEY，endpoint 来自冻结注册表），证明组合根不再读
  // 文本主 Key/自由 URL；同时让旧自由 URL 注入面在禁用态就被拒绝，而非等到未来某次 enable 才暴露。
  // H1 fix: 启动点（本组合根）显式跑一次视觉 Key 指纹/撤销校验，不依赖 resolve 内部才顺带做。
  // 这样即便禁用态，挂载的视觉 Key 若命中撤销清单或与期望指纹不符，也在 DI 装配期就拒绝启动。
  assertVisionEndpointKeyFingerprint(env);
  resolveVisionEndpointConfig(env);
  return openAICompatibleClient({
    vision: true,
    // A disabled composition remains incapable of dispatching even under a
    // test/development process environment. MODEL-OP-01 replaces this factory
    // with a typed vision binding before OCR may be enabled.
    requireBoundOperation: true,
  });
}
