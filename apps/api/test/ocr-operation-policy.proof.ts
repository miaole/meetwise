/** Production composition must not revive OCR before MODEL-OP-01 binds it. */
import { createOcrVisionClient, isOcrFeatureEnabled } from '../src/modules/resume/ocr-model-client.ts';

let failures = 0;
const assert = (name: string, condition: boolean) => {
  console.log(`${condition ? 'PASS' : 'FAIL'}  ${name}`);
  if (!condition) failures++;
};

const enforced = {
  NODE_ENV: 'production',
  MODEL_COST_ENFORCEMENT: 'enforce',
  MODEL_BASE_URL: 'https://model.invalid',
  MODEL_API_KEY: 'test-only',
  VISION_MODEL_NAME: 'vision-proof',
} as NodeJS.ProcessEnv;

let rejected = false;
try {
  createOcrVisionClient({ ...enforced, OCR_ENABLED: '1' });
} catch (error) {
  rejected = error instanceof Error && error.message === 'ocr_model_operation_unconfigured';
}
assert('OCR enabled without MODEL-OP-01 binding fails API composition', rejected);

let nonProductionRejected = false;
try {
  createOcrVisionClient({
    NODE_ENV: 'test',
    MODEL_COST_ENFORCEMENT: 'observe',
    MODEL_BASE_URL: 'https://model.invalid',
    MODEL_API_KEY: 'test-only',
    OCR_ENABLED: '1',
  });
} catch (error) {
  nonProductionRejected = error instanceof Error && error.message === 'ocr_model_operation_unconfigured';
}
assert('non-production OCR enabled without a typed binding also fails before transport', nonProductionRejected);
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
