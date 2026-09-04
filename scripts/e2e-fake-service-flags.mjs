/**
 * Shared forbidden fake-service flags for live E2E runners.
 *
 * Graph/unit proves may inject fake models through dedicated seams. Live HTTP,
 * browser, and performance E2E must fail closed instead of silently substituting
 * voice, OCR, embedding, or text transports.
 */
export const FORBIDDEN_FAKE_SERVICE_FLAGS = Object.freeze([
  'VOICE_FAKE',
  'OCR_FAKE',
  'E2E_FAKE_MODEL',
  'ASR_FAKE',
  'TTS_FAKE',
  'EMBED_FAKE',
  'RERANK_FAKE',
  'MODEL_TEST_TRANSPORT_OVERRIDES',
  'DASHSCOPE_TEST_TRANSPORT_OVERRIDES',
]);

export function enabledFakeServiceFlags(env = process.env) {
  return FORBIDDEN_FAKE_SERVICE_FLAGS.filter((name) => {
    const value = String(env[name] ?? '').trim().toLowerCase();
    return value !== '' && value !== '0' && value !== 'false';
  });
}

export function assertNoFakeServiceFlags(env = process.env) {
  const enabled = enabledFakeServiceFlags(env);
  if (enabled.length) throw new Error(`fake_service_mode_forbidden:${enabled.join(',')}`);
}
