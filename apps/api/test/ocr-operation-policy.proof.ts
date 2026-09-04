/** Production composition must not revive OCR just because a typed binding exists. */
import { createOcrVisionClient, isOcrFeatureEnabled } from '../src/modules/resume/ocr-model-client.ts';

let failures = 0;
const assert = (name: string, condition: boolean) => {
  console.log(`${condition ? 'PASS' : 'FAIL'}  ${name}`);
  if (!condition) failures++;
};

const enforced = {
  NODE_ENV: 'production',
  MODEL_COST_ENFORCEMENT: 'enforce',
  // BAILIAN-03/04: OCR 只读专用 DASHSCOPE_VISION_API_KEY，不再复用文本主 Key/自由 URL。
  // F3 fix: 模型名统一读 DASHSCOPE_VISION_MODEL（与 compose/env/policy 一致），非 VISION_MODEL_NAME。
  DASHSCOPE_VISION_API_KEY: 'vision-test-only',
  DASHSCOPE_VISION_MODEL: 'vision-proof',
} as NodeJS.ProcessEnv;

let rejected = false;
try {
  createOcrVisionClient({ ...enforced, OCR_ENABLED: '1' });
} catch (error) {
  rejected = error instanceof Error && error.message === 'ocr_model_operation_unconfigured';
}
assert('OCR_ENABLED=1 still fails API composition after the typed OCR binding exists', rejected);

let nonProductionRejected = false;
try {
  createOcrVisionClient({
    NODE_ENV: 'test',
    MODEL_COST_ENFORCEMENT: 'observe',
    DASHSCOPE_VISION_API_KEY: 'vision-test-only',
    OCR_ENABLED: '1',
  });
} catch (error) {
  nonProductionRejected = error instanceof Error && error.message === 'ocr_model_operation_unconfigured';
}
assert('non-production OCR_ENABLED=1 also fails before transport even with a typed binding', nonProductionRejected);
assert('only the exact OCR_ENABLED=1 value can request the feature',
  isOcrFeatureEnabled({ OCR_ENABLED: '1' }) && !isOcrFeatureEnabled({ OCR_ENABLED: 'true' }) && !isOcrFeatureEnabled({}));

let disabledBoots = false;
let disabledClient: ReturnType<typeof createOcrVisionClient> | undefined;
try {
  disabledClient = createOcrVisionClient({ ...enforced, OCR_ENABLED: '0' });
  disabledBoots = true;
} catch {
  disabledBoots = false;
}
assert('production/enforce can boot with OCR explicitly disabled', disabledBoots);

let legacyUrlRejected = false;
try {
  createOcrVisionClient({ ...enforced, OCR_ENABLED: '0', MODEL_BASE_URL: 'https://model.invalid' });
} catch (error) {
  legacyUrlRejected = error instanceof Error && error.message === 'vision_endpoint_env_forbidden';
}
assert('OCR 禁用态仍拒绝旧文本自由 URL 复用（切断 MODEL_BASE_URL/MODEL_API_KEY 复用）', legacyUrlRejected);

// H1 fix: 视觉 Key 指纹校验必须接线到 OCR 组合根（resolve + 显式 assert），而非死代码。
// 即便 OCR 禁用态，挂载的视觉 Key 与期望指纹不符也应在装配期拒绝启动。
let visionFingerprintMismatchRejected = false;
try {
  createOcrVisionClient({ ...enforced, OCR_ENABLED: '0', DASHSCOPE_VISION_API_KEY_FINGERPRINT: 'deadbeefdeadbeef' });
} catch (error) {
  visionFingerprintMismatchRejected = error instanceof Error && error.message === 'dashscope_vision_api_key_fingerprint_mismatch';
}
assert('OCR 组合根（含禁用态）接线视觉 Key 指纹校验：期望指纹不符即拒绝装配', visionFingerprintMismatchRejected);

const originalFetch = globalThis.fetch;
let fetches = 0;
try {
  globalThis.fetch = (async () => {
    fetches++;
    throw new Error('unbound OCR must not reach transport');
  }) as typeof fetch;
  const result = await disabledClient?.complete({
    service: 'resume.vision', system: 'trusted', userData: 'non-sensitive fixture', images: ['https://image.invalid/fixture.png'],
  }, 1);
  assert('injected production environment keeps disabled OCR client zero-dispatch even when process env is development',
    result?.ok === false && result.externalOutcome === 'known_not_executed' && fetches === 0);
} finally {
  globalThis.fetch = originalFetch;
}

console.log(failures === 0 ? '✓ OCR operation-policy composition contract passed' : `✗ ${failures} assertion(s) failed`);
process.exit(failures === 0 ? 0 : 1);
