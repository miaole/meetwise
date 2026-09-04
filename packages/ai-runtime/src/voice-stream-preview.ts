/**
 * Preview gate for streaming ASR + server turn-taking (PRD-TEST-006).
 *
 * Exact flags: `VOICE_STREAM_ASR_ENABLED=1` AND `VOICE_STREAM_ASR_PREVIEW=1`.
 * Production (`NODE_ENV=production`), `MODEL_COST_ENFORCEMENT=enforce`, and
 * the read-only public site (`MEETWISE_PUBLIC_PREVIEW=1`) stay refuse-closed
 * even if both flags are set. A capability Key alone does not open a stream.
 *
 * Flags being set is not verification. `voice.asr-stream.v1` stays unwired;
 * product composition (`createInterviewVoiceSeams`) never constructs a live
 * stream ASR or turn-taking seam. Failures must not invent a transcript or
 * score. Not a production SLO. `releaseEvidence=false`.
 */
export const VOICE_STREAM_ASR_UNCONFIGURED = 'voice_stream_asr_unconfigured';
export const VOICE_TURN_TAKING_NOT_CONFIGURED = 'voice_turn_taking_not_configured';
export const VOICE_TURN_TAKING_UNCONFIGURED = 'voice_turn_taking_unconfigured';
export const STREAMING_ASR_NOT_CONFIGURED = 'streaming_asr_not_configured';
export const STREAMING_TTS_NOT_CONFIGURED = 'streaming_tts_not_configured';

export function isProductionVoiceStreamLocked(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.NODE_ENV?.trim().toLowerCase() === 'production'
    || env.MODEL_COST_ENFORCEMENT?.trim().toLowerCase() === 'enforce'
    || env.MEETWISE_PUBLIC_PREVIEW === '1';
}

export function isVoiceStreamAsrPreviewRequested(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.VOICE_STREAM_ASR_ENABLED === '1' && env.VOICE_STREAM_ASR_PREVIEW === '1';
}

/** True only when preview stream ASR / server turn-taking may be *requested*. */
export function isVoiceStreamAsrPreviewEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return isVoiceStreamAsrPreviewRequested(env) && !isProductionVoiceStreamLocked(env);
}

/**
 * OCR-style misconfiguration: `ENABLED=1` without a complete preview unlock
 * must not silently look available.
 */
export function assertVoiceStreamAsrPreviewComposition(env: NodeJS.ProcessEnv = process.env): void {
  if (env.VOICE_STREAM_ASR_ENABLED === '1' && !isVoiceStreamAsrPreviewEnabled(env)) {
    throw new Error(VOICE_STREAM_ASR_UNCONFIGURED);
  }
}

/**
 * Live stream adapters refuse before any WebSocket. Key-only is not enough.
 * `ENABLED=1` while locked / missing PREVIEW is an explicit misconfiguration.
 */
export function refuseVoiceStreamAsrUnlessPreview(
  env: NodeJS.ProcessEnv = process.env,
  notConfiguredCode: string = STREAMING_ASR_NOT_CONFIGURED,
): void {
  assertVoiceStreamAsrPreviewComposition(env);
  if (!isVoiceStreamAsrPreviewEnabled(env)) {
    throw new Error(notConfiguredCode);
  }
}

export function assertVoiceTurnTakingPreviewAllowed(env: NodeJS.ProcessEnv = process.env): void {
  if (isProductionVoiceStreamLocked(env)) {
    throw new Error(VOICE_TURN_TAKING_UNCONFIGURED);
  }
  if (env.VOICE_STREAM_ASR_ENABLED === '1' && !isVoiceStreamAsrPreviewEnabled(env)) {
    throw new Error(VOICE_TURN_TAKING_UNCONFIGURED);
  }
  if (!isVoiceStreamAsrPreviewEnabled(env)) {
    throw new Error(VOICE_TURN_TAKING_NOT_CONFIGURED);
  }
}
