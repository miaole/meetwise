/** Production-only graph safety configuration. */
export function assertLegacyInterviewGraphDisabled(env: Record<string, string | undefined> = process.env): void {
  // The legacy fixed-question path stores raw answers and has no graph fence.
  // An explicit `0` must therefore fail startup rather than silently reduce
  // the privacy/concurrency boundary during an incident.
  if (env.ADAPTIVE_INTERVIEW === '0') throw new Error('legacy_interview_graph_disabled');
}
