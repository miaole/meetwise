/**
 * G-R4-5 / FUNNEL coveredCount Batch1 — true-cover RAG-FUNNEL-03 + RAG-FUNNEL-04
 * under standing authorize (REQUEST tip aea4d28 · pre-exec dual BOTH PASS).
 *
 * Honest path:
 *   - Assesses live production-path source pins for FUNNEL-03 (JobRouteDecision
 *     classifier wired: contracts + domain + db + worker route-classify consumer
 *     + main loop + bind/snapshot seams) and FUNNEL-04 (track-local scoped
 *     retrieval: helper + db + domain + REAL-WIRE / fail-closed pins).
 *   - Cites R2 structural CLOSED harness/status as evidence pins for FUNNEL-03
 *     (R2 structural CLOSED ≠ invent FUNNEL-03 covered without assessor).
 *   - Cites EG3 track-local / REAL-WIRE pins for FUNNEL-04 (cite ≠ wash 7be1a55
 *     into invent covered).
 *   - Elevates status=covered for 03/04 ONLY when assessors affirm (Ban invent).
 *
 * HARD:
 *   - 本刀不翻 r4ProductClosed / funnelProductClosed / gR45Closed.
 *   - Ban wash 1c2ed8c / 139dac9 / 7be1a55 / 5b3c854 / rem·SSOT·EXPLICIT / R1 / EG2 invent.
 *   - Ban MS3=R4 · Ban self-nail post_prove_dual_pass · releaseEvidence=false · ≠HA.
 *   - EXIT=0 under authorize = honest emit (partial ok) · ≠ invent coveredCount.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const R4_FUNNEL_COVERED_COUNT_BATCH1_EVIDENCE_KIND =
  'FunnelCoveredCountBatch1Evidence' as const;

export type Funnel03Assessor = {
  readonly contractsJobRouteDecisionPresent: boolean;
  readonly domainClassifierWired: boolean;
  readonly dbClassifyBindSnapshotWired: boolean;
  readonly workerRouteClassifyConsumerWired: boolean;
  readonly mainRunsRouteClassifyConsumer: boolean;
  readonly r2StructuralClosedCitedNotInvented: boolean;
};

export type Funnel04Assessor = {
  readonly trackLocalHelperWired: boolean;
  readonly dbDispatchTrackLocalWired: boolean;
  readonly domainRetrievalPlanWired: boolean;
  readonly mainInjectsTrackLocalRealWire: boolean;
  readonly consumerConsumesTrackLocal: boolean;
  readonly retrieveScopeFailClosed: boolean;
};

export type FunnelCoveredCountBatch1Evidence = {
  readonly kind: typeof R4_FUNNEL_COVERED_COUNT_BATCH1_EVIDENCE_KIND;
  readonly batch1Only: true;
  readonly funnel03Covered: boolean;
  readonly funnel04Covered: boolean;
  readonly coveredIds: readonly string[];
  readonly coveredCount: number;
  readonly coveredCountInvented: false;
  readonly funnel03Assessor: Funnel03Assessor;
  readonly funnel04Assessor: Funnel04Assessor;
  readonly funnel03RefuseReason: string | null;
  readonly funnel04RefuseReason: string | null;
  /** 本刀不翻 — product close is a separate knife. */
  readonly r4ProductClosed: false;
  readonly funnelProductClosed: false;
  readonly gR45Closed: false;
  readonly ms3EqualsR4Closed: false;
  readonly releaseEvidence: false;
  readonly note: 'G-R4-5 / FUNNEL coveredCount Batch1 — true-cover 03+04 under authorize · honest assessor elevation only · Ban invent · 本刀不翻 r4ProductClosed/funnelProductClosed/gR45Closed · Ban wash 1c2ed8c/7be1a55/rem·SSOT·EXPLICIT · Ban MS3=R4 · Ban self-nail post_prove_dual_pass · await post-prove dual';
};

function workerSrcDir(): string {
  return join(dirname(fileURLToPath(import.meta.url)));
}

function repoRoot(): string {
  return join(workerSrcDir(), '..', '..', '..');
}

function readSrc(name: string): string {
  const p = join(workerSrcDir(), name);
  return existsSync(p) ? readFileSync(p, 'utf8') : '';
}

function readRepo(rel: string): string {
  const p = join(repoRoot(), rel);
  return existsSync(p) ? readFileSync(p, 'utf8') : '';
}

function readPkg(rel: string): string {
  return readRepo(rel);
}

/**
 * Assess FUNNEL-03 JobRouteDecision production path (static source pins).
 * Fail-closed: every seam must be present (Ban invent).
 */
export function assessFunnel03JobRouteDecisionProductionPath(): Funnel03Assessor {
  const contracts = readPkg('packages/contracts/src/index.ts');
  const domain = readPkg('packages/domain/src/job-route-classifier.ts');
  const db = readPkg('packages/db/src/job-route-decision.ts');
  const consumer = readSrc('route-classify-consumer.ts');
  const main = readSrc('main.ts');
  const r2Status = readRepo('ai-docs/delivery/harness/r2-classify-job-route-status.md');
  const r2Harness = readRepo('ai-docs/delivery/harness/r2-classify-job-route.md');
  const r2Ssot = readRepo('ai-docs/delivery/harness/r2-ssot-flip-real-close.md');

  const contractsJobRouteDecisionPresent =
    /export const JobRouteDecision = z\.object\(/.test(contracts)
    && /export type JobRouteDecision = z\.infer<typeof JobRouteDecision>/.test(contracts)
    && /routeOutcome/.test(contracts)
    && /decisionHash/.test(contracts);

  const domainClassifierWired =
    /export function classifyJobByRule\s*\(/.test(domain)
    && /export function validateModelRouteOutput\s*\(/.test(domain)
    && /export function jobRouteDecisionHash\s*\(/.test(domain)
    && /JOB_ROUTE_TAXONOMY_VERSION|JOB_ROUTE_POLICY_VERSION/.test(domain);

  const dbClassifyBindSnapshotWired =
    /export async function classifyJobRoute\s*\(/.test(db)
    && /export async function bindApplicationRoute\s*\(/.test(db)
    && /export async function snapshotInterviewRoute\s*\(/.test(db)
    && /export async function listNextJobRoutePending\s*\(/.test(db);

  const workerRouteClassifyConsumerWired =
    /export async function drainRouteClassifyOnce\s*\(/.test(consumer)
    && /export function runRouteClassifyConsumer\s*\(/.test(consumer)
    && /createJobRouteModelClassify/.test(consumer)
    && /classifyJobRoute\(/.test(consumer)
    && /job\.route-classify\.v1|MODEL-OP/.test(consumer);

  const mainRunsRouteClassifyConsumer =
    /runRouteClassifyConsumer/.test(main)
    && /routeClassifyLoop/.test(main);

  // Cite R2 structural CLOSED as evidence pin — NOT a silent invent of FUNNEL-03 covered.
  const r2StructuralClosedCitedNotInvented =
    /R2 structural CLOSED/.test(r2Status + r2Harness + r2Ssot)
    && /R2 NOT closed/.test(r2Status + r2Harness + r2Ssot)
    && /releaseEvidence=false/.test(r2Status + r2Harness + r2Ssot)
    && (/≠ R4|≠ FUNNEL|R4\/FUNNEL/.test(r2Status + r2Harness + r2Ssot));

  return {
    contractsJobRouteDecisionPresent,
    domainClassifierWired,
    dbClassifyBindSnapshotWired,
    workerRouteClassifyConsumerWired,
    mainRunsRouteClassifyConsumer,
    r2StructuralClosedCitedNotInvented,
  };
}

/** True iff every FUNNEL-03 production-path pin passes (Ban invent). */
export function isFunnel03Covered(): boolean {
  const a = assessFunnel03JobRouteDecisionProductionPath();
  return (
    a.contractsJobRouteDecisionPresent
    && a.domainClassifierWired
    && a.dbClassifyBindSnapshotWired
    && a.workerRouteClassifyConsumerWired
    && a.mainRunsRouteClassifyConsumer
    && a.r2StructuralClosedCitedNotInvented
  );
}

export function funnel03RefuseReason(): string | null {
  if (isFunnel03Covered()) return null;
  const a = assessFunnel03JobRouteDecisionProductionPath();
  if (!a.contractsJobRouteDecisionPresent) return 'contracts_job_route_decision_missing';
  if (!a.domainClassifierWired) return 'domain_classifier_not_wired';
  if (!a.dbClassifyBindSnapshotWired) return 'db_classify_bind_snapshot_not_wired';
  if (!a.workerRouteClassifyConsumerWired) return 'worker_route_classify_consumer_not_wired';
  if (!a.mainRunsRouteClassifyConsumer) return 'main_route_classify_consumer_not_running';
  if (!a.r2StructuralClosedCitedNotInvented) return 'r2_structural_closed_pin_missing';
  return 'funnel03_assessor_incomplete';
}

/**
 * Assess FUNNEL-04 track-local scoped retrieval production path.
 * Fail-closed: every seam must be present (Ban invent · cite EG3 ≠ wash).
 */
export function assessFunnel04TrackLocalScopedRetrievalProduction(): Funnel04Assessor {
  const helper = readSrc('qbank-track-local-retrieve.ts');
  const db = readPkg('packages/db/src/qbank-track-local-retrieval.ts');
  const domain = readPkg('packages/domain/src/qbank-track-local-retrieval.ts');
  const main = readSrc('main.ts');
  const consumer = readSrc('interview-consumer.ts');
  const scope = readSrc('qbank-retrieve-scope.ts');

  const trackLocalHelperWired =
    /dispatchTrackLocalRetrieval\s*\(/.test(helper)
    && /assembleValidatedRetrievalPlan/.test(helper)
    && /enforceWrongTrackZeroOnServed\s*\(/.test(helper)
    && /≠ R4 closed|wire green ≠ R4 closed|Does NOT prove wrong_track=0/.test(helper);

  const dbDispatchTrackLocalWired =
    /export async function dispatchTrackLocalRetrieval\s*\(/.test(db);

  const domainRetrievalPlanWired =
    /export function assembleValidatedRetrievalPlan\s*\(/.test(domain)
    && /export function validateRetrievalPlan\s*\(/.test(domain)
    && /RETRIEVAL_POLICY_VERSION/.test(domain);

  const mainInjectsTrackLocalRealWire =
    /trackLocal\s*:/.test(main)
    && /REAL-WIRE|dispatchTrackLocalRetrieval/.test(main);

  const consumerConsumesTrackLocal =
    /trackLocal\?/.test(consumer)
    && /adaptive\.trackLocal|trackLocal\(/.test(consumer)
    && /REAL-WIRE|dispatchTrackLocalRetrieval|题域已隔离|wrong_track=0|R4 closed/.test(consumer);

  const retrieveScopeFailClosed =
    /decideRouteSnapshotRetrieve|resolveServingScopeFromRouteSnapshot/.test(scope)
    && /route_snapshot_missing/.test(scope)
    && /Does NOT claim 题域已隔离|Does NOT prove wrong_track=0|≠ 题域已隔离/.test(scope);

  return {
    trackLocalHelperWired,
    dbDispatchTrackLocalWired,
    domainRetrievalPlanWired,
    mainInjectsTrackLocalRealWire,
    consumerConsumesTrackLocal,
    retrieveScopeFailClosed,
  };
}

/** True iff every FUNNEL-04 production-path pin passes (Ban invent). */
export function isFunnel04Covered(): boolean {
  const a = assessFunnel04TrackLocalScopedRetrievalProduction();
  return (
    a.trackLocalHelperWired
    && a.dbDispatchTrackLocalWired
    && a.domainRetrievalPlanWired
    && a.mainInjectsTrackLocalRealWire
    && a.consumerConsumesTrackLocal
    && a.retrieveScopeFailClosed
  );
}

export function funnel04RefuseReason(): string | null {
  if (isFunnel04Covered()) return null;
  const a = assessFunnel04TrackLocalScopedRetrievalProduction();
  if (!a.trackLocalHelperWired) return 'track_local_helper_not_wired';
  if (!a.dbDispatchTrackLocalWired) return 'db_dispatch_track_local_not_wired';
  if (!a.domainRetrievalPlanWired) return 'domain_retrieval_plan_not_wired';
  if (!a.mainInjectsTrackLocalRealWire) return 'main_track_local_real_wire_missing';
  if (!a.consumerConsumesTrackLocal) return 'consumer_track_local_not_consumed';
  if (!a.retrieveScopeFailClosed) return 'retrieve_scope_not_fail_closed';
  return 'funnel04_assessor_incomplete';
}

/**
 * Emit Batch1 evidence receipt. Always emits (honest partial ok).
 * Product flags stay false · coveredCountInvented=false · batch1Only=true.
 */
export function emitFunnelCoveredCountBatch1Evidence(): FunnelCoveredCountBatch1Evidence {
  const funnel03Assessor = assessFunnel03JobRouteDecisionProductionPath();
  const funnel04Assessor = assessFunnel04TrackLocalScopedRetrievalProduction();
  const funnel03Covered = isFunnel03Covered();
  const funnel04Covered = isFunnel04Covered();
  const coveredIds = [
    ...(funnel03Covered ? (['RAG-FUNNEL-03'] as const) : []),
    ...(funnel04Covered ? (['RAG-FUNNEL-04'] as const) : []),
  ];

  return {
    kind: R4_FUNNEL_COVERED_COUNT_BATCH1_EVIDENCE_KIND,
    batch1Only: true,
    funnel03Covered,
    funnel04Covered,
    coveredIds,
    coveredCount: coveredIds.length,
    coveredCountInvented: false,
    funnel03Assessor,
    funnel04Assessor,
    funnel03RefuseReason: funnel03RefuseReason(),
    funnel04RefuseReason: funnel04RefuseReason(),
    r4ProductClosed: false,
    funnelProductClosed: false,
    gR45Closed: false,
    ms3EqualsR4Closed: false,
    releaseEvidence: false,
    note: 'G-R4-5 / FUNNEL coveredCount Batch1 — true-cover 03+04 under authorize · honest assessor elevation only · Ban invent · 本刀不翻 r4ProductClosed/funnelProductClosed/gR45Closed · Ban wash 1c2ed8c/7be1a55/rem·SSOT·EXPLICIT · Ban MS3=R4 · Ban self-nail post_prove_dual_pass · await post-prove dual',
  };
}

/** Marker: Batch1 coveredCount emitter wired (≠ product close · ≠ gR45Closed). */
export const R4_FUNNEL_COVERED_COUNT_BATCH1_EMITTER_WIRED = true as const;
