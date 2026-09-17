/** Production-only graph safety configuration. */
export function assertLegacyInterviewGraphDisabled(env: Record<string, string | undefined> = process.env): void {
  // The legacy fixed-question path stores raw answers and has no graph fence.
  // An explicit `0` must therefore fail startup rather than silently reduce
  // the privacy/concurrency boundary during an incident.
  if (env.ADAPTIVE_INTERVIEW === '0') throw new Error('legacy_interview_graph_disabled');
}

/** NODE_ENV=production (trim/case-insensitive). Used by F1 deploy-surface fail-closed. */
export function isProductionNodeEnv(env: Record<string, string | undefined> = process.env): boolean {
  return env.NODE_ENV?.trim().toLowerCase() === 'production';
}

/**
 * F1 production-surface (PS1 deploy shape): when NODE_ENV=production, the interview
 * consumer must use trackLocal → retrieveViaDispatchTrackLocal (wrong_track recheck).
 * Falling back to scoped localRetrieve (partial P-WIRE) under production would admit
 * a non-ADV-covered deploy shape. Fail-closed with track_local_required instead.
 * ≠ R4 closed · releaseEvidence=false · Not HA.
 */
export function productionRequiresTrackLocal(
  hasTrackLocal: boolean,
  env: Record<string, string | undefined> = process.env,
): boolean {
  return isProductionNodeEnv(env) && !hasTrackLocal;
}
