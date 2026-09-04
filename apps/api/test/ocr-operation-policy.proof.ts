/** Preview OCR composition: dual-flag, production still refuse-closed, failures invent nothing. */
import { createOcrVisionClient, isOcrFeatureEnabled, isOcrPreviewRequested, isProductionOcrLocked } from '../src/modules/resume/ocr-model-client.ts';

let failures = 0;
const assert = (name: string, condition: boolean) => {
  console.log(`${condition ? 'PASS' : 'FAIL'}  ${name}`);
  if (!condition) failures++;
};

const visionKeys = {
  DASHSCOPE_VISION_API_KEY: 'vision-test-only',
  DASHSCOPE_VISION_MODEL: 'vision-proof',
} as const;

const enforced = {
  NODE_ENV: 'production',
  MODEL_COST_ENFORCEMENT: 'enforce',
  ...visionKeys,
} as NodeJS.ProcessEnv;

const preview = {
  NODE_ENV: 'test',
  MODEL_COST_ENFORCEMENT: 'observe',
  OCR_ENABLED: '1',
  OCR_PREVIEW: '1',
  ...visionKeys,
} as NodeJS.ProcessEnv;

function throwsUnconfigured(env: NodeJS.ProcessEnv): boolean {
  try {
    createOcrVisionClient(env);
    return false;
  } catch (error) {
    return error instanceof Error && error.message === 'ocr_model_operation_unconfigured';
  }
}

assert('production + OCR_ENABLED=1 still refuses composition',
  throwsUnconfigured({ ...enforced, OCR_ENABLED: '1' }));
assert('production + both flags still refuses (preview flag cannot unlock enforce)',
  throwsUnconfigured({ ...enforced, OCR_ENABLED: '1', OCR_PREVIEW: '1' }));
assert('non-production OCR_ENABLED=1 without OCR_PREVIEW still refuses',
  throwsUnconfigured({
    NODE_ENV: 'test',
    MODEL_COST_ENFORCEMENT: 'observe',
    DASHSCOPE_VISION_API_KEY: 'vision-test-only',
    OCR_ENABLED: '1',
  }));
assert('public-preview write-gate + both flags still refuses paid OCR',
  throwsUnconfigured({ ...preview, MEETWISE_PUBLIC_PREVIEW: '1' }));
assert('enforce + both flags refuses even when NODE_ENV=test',
  throwsUnconfigured({ ...preview, MODEL_COST_ENFORCEMENT: 'enforce' }));

assert('only exact OCR_ENABLED=1 AND OCR_PREVIEW=1 request preview',
  isOcrPreviewRequested({ OCR_ENABLED: '1', OCR_PREVIEW: '1' })
  && !isOcrPreviewRequested({ OCR_ENABLED: '1' })
  && !isOcrPreviewRequested({ OCR_ENABLED: 'true', OCR_PREVIEW: '1' })
  && !isOcrPreviewRequested({ OCR_ENABLED: '1', OCR_PREVIEW: 'true' })
  && !isOcrPreviewRequested({}));
assert('feature enabled only for preview observe, not production',
  isOcrFeatureEnabled(preview)
  && !isOcrFeatureEnabled({ ...preview, NODE_ENV: 'production' })
  && !isOcrFeatureEnabled({ OCR_ENABLED: '1' })
  && isProductionOcrLocked(enforced));

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
  assert('disabled OCR client remains zero-dispatch even when process env is development',
    result?.ok === false && result.externalOutcome === 'known_not_executed' && fetches === 0);
} finally {
  globalThis.fetch = originalFetch;
}

let previewClient: ReturnType<typeof createOcrVisionClient> | undefined;
try {
  previewClient = createOcrVisionClient(preview);
} catch {
  previewClient = undefined;
}
assert('preview dual-flag boots a dispatch-capable client', previewClient !== undefined);

fetches = 0;
let previewFailureInvented = false;
try {
  globalThis.fetch = (async () => {
    fetches++;
    throw new Error('preview provider down');
  }) as typeof fetch;
  const failed = await previewClient?.complete({
    service: 'resume.vision', system: 'trusted', userData: 'non-sensitive fixture', images: ['data:image/png;base64,AAAA'],
  }, 1);
  previewFailureInvented = failed?.ok === true && 'raw' in failed && Boolean((failed as { raw?: { text?: string } }).raw?.text);
  assert('preview provider failure is fail-closed (no invented transcript)',
    failed?.ok === false && failed.externalOutcome === 'unknown' && fetches === 1 && !previewFailureInvented);
} finally {
  globalThis.fetch = originalFetch;
}

fetches = 0;
try {
  globalThis.fetch = (async () => {
    fetches++;
    return new Response(JSON.stringify({
      choices: [{ message: { content: '{"text":"技能\\nGo、Redis"}' } }],
    }), { status: 200, headers: { 'content-type': 'application/json' } });
  }) as typeof fetch;
  const ok = await previewClient?.complete({
    service: 'resume.vision', system: 'trusted', userData: 'non-sensitive fixture', images: ['data:image/png;base64,AAAA'],
  }, 1);
  assert('preview bind/vision path can invoke and return typed transcript (not a quality SLO)',
    ok?.ok === true && fetches === 1 && (ok as { raw?: { text?: string } }).raw?.text === '技能\nGo、Redis');
} finally {
  globalThis.fetch = originalFetch;
}

fetches = 0;
try {
  globalThis.fetch = (async () => {
    fetches++;
    return new Response(JSON.stringify({
      choices: [{ message: { content: '{"text":""}' } }],
    }), { status: 200, headers: { 'content-type': 'application/json' } });
  }) as typeof fetch;
  const empty = await previewClient?.complete({
    service: 'resume.vision', system: 'trusted', userData: 'non-sensitive fixture', images: ['data:image/png;base64,AAAA'],
  }, 1);
  assert('empty model JSON is returned as-is for invoke/businessValidate to reject (client does not invent facts)',
    empty?.ok === true && (empty as { raw?: { text?: string } }).raw?.text === '' && fetches === 1);
} finally {
  globalThis.fetch = originalFetch;
}

console.log(failures === 0 ? '✓ OCR operation-policy composition contract passed' : `✗ ${failures} assertion(s) failed`);
process.exit(failures === 0 ? 0 : 1);
