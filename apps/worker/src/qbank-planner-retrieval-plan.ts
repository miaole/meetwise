/**
 * P-PLANNER — planner → RetrievalPlan seam (consumed by REAL-WIRE retrieve helper).
 *
 * Domain re-exports for Worker: `planInterviewTurn` / `assembleValidatedRetrievalPlan`.
 * Production retrieve main path is `retrieveViaDispatchTrackLocal` in
 * `qbank-track-local-retrieve.ts` (planner → validate → assemble → dispatch → recheck).
 *
 * HARD honesty:
 * - P-FAKEPLAN banned (no max-bps hard-stuff without real planner + generationId + recipeId).
 * - G-R2-5: missing/illegal snapshot → route_snapshot_missing (no unscoped).
 * - Wire green ≠ R4 closed ≠ wrong_track=0 ≠ ADV.
 * - releaseEvidence=false · Not HA.
 */
export {
  planInterviewTurn,
  validatePlannerOutput,
  buildRetrievalPlanFromPlannerOutput,
  assembleValidatedRetrievalPlan,
  validateRetrievalPlan,
  deriveRouteScopeDigest,
  RETRIEVAL_POLICY_VERSION,
  JOB_ROUTE_TAXONOMY_VERSION,
} from '@meetwise/domain';

export type {
  InterviewPlannerOutput,
  JobRouteAllocation,
  PlanInterviewTurnResult,
  RetrievalPlan,
  RetrievalPlanSnapshot,
  AssembleValidatedRetrievalPlanResult,
  ValidateRetrievalPlanResult,
} from '@meetwise/domain';
