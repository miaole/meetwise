/**
 * Preview-only streaming ASR / server turn-taking UI gate. Mirror the
 * runtime contract (`packages/ai-runtime/src/voice-stream-preview.ts`):
 * exact `VOICE_STREAM_ASR_ENABLED=1` AND `VOICE_STREAM_ASR_PREVIEW=1`.
 *
 * Production (`NODE_ENV=production`), `MODEL_COST_ENFORCEMENT=enforce`, and
 * the read-only public site (`MEETWISE_PUBLIC_PREVIEW=1`) stay refuse-closed
 * even if both flags are set. Flags do not verify stream ASR or invent a
 * transcript. Product UI stays on batch `/transcribe` + `/speak`.
 * `releaseEvidence=false`.
 */
export function isProductionVoiceStreamLocked(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.NODE_ENV?.trim().toLowerCase() === 'production'
    || env.MODEL_COST_ENFORCEMENT?.trim().toLowerCase() === 'enforce'
    || env.MEETWISE_PUBLIC_PREVIEW === '1';
}

export function isVoiceStreamAsrPreviewRequested(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.VOICE_STREAM_ASR_ENABLED === '1' && env.VOICE_STREAM_ASR_PREVIEW === '1';
}

/** True only when this process may *request* unverified stream-ASR preview. */
export function isVoiceStreamAsrPreviewEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return isVoiceStreamAsrPreviewRequested(env) && !isProductionVoiceStreamLocked(env);
}
