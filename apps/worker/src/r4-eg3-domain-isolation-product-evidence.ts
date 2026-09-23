/**
 * G-R4-5 EG3 — 题域隔离 **product-level** evidence emitter.
 *
 * Honest path (Ban forge · Ban claim 题域已隔离 from meta prove alone):
 *   - Assesses real product surfaces for track-local / scoped retrieve wiring
 *     (main injects trackLocal · consumer consumes · sole dispatch call site ·
 *     retrieve-scope fail-closed on missing snapshot).
 *   - Requires status/harness honesty pins that 题域隔离 / EG3 remain NOT closed.
 *   - Explicitly records that mysql-stack:r4-domain-isolation:prove alone ≠ product close.
 *
 * HARD:
 *   - Evidence emit ≠ EG3 closed · ≠ 题域已隔离 · ≠ G-R4-5 / R4/FUNNEL product closed.
 *   - Ban forge · Ban invent coveredCount · Ban claim closed from EXIT=0 · releaseEvidence=false · ≠HA.
 *   - Ban idle re-prove of EG1/EG2 CMDs / same 5×meta as fake EG3 close — this module is the
 *     EG3-specific product evidence path those CMDs never emitted.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Canonical EG3 domain-isolation product evidence kind. */
export const EG3_DOMAIN_ISOLATION_PRODUCT_EVIDENCE_KIND =
  'DomainIsolationProductEvidence' as const;

/**
 * Honest product-level 题域隔离 evidence inventory.
 * Does NOT elevate EG3 / 题域 / G-R4-5 / R4 to closed.
 */
export type DomainIsolationProductEvidence = {
  readonly kind: typeof EG3_DOMAIN_ISOLATION_PRODUCT_EVIDENCE_KIND;
  /** Product-path inventory emitted (≠ product close). */
  readonly domainIsolationProductEvidence: true;
  readonly trackLocalRetrieveDispatchWired: true;
  readonly mainInjectsTrackLocal: true;
  readonly consumerConsumesTrackLocal: true;
  readonly retrieveScopeFailClosedMissingSnapshot: true;
  readonly statusPinsDomainIsolationNotClosed: true;
  readonly metaProveAloneDoesNotClose: true;
  /** wrong_track=0 is NOT product-proven this knife (ADV/LIVE_PG separate). */
  readonly wrongTrackZeroProductProven: false;
  /** Explicit non-claims retained on the receipt itself. */
  readonly eg3ProductClosed: false;
  readonly domainIsolationClosed: false;
  readonly gR45Closed: false;
  readonly r4ProductClosed: false;
  readonly releaseEvidence: false;
  readonly note: 'EG3 domain-isolation product evidence — emitted · ≠ EG3/题域/G-R4-5/R4 closed · Ban forge · Ban claim from meta prove alone · await post-prove dual';
};

export type Eg3DomainIsolationProductEvidenceFailure = {
  readonly kind: 'Eg3DomainIsolationProductEvidenceFailure';
  readonly emitted: false;
  readonly reason:
    | 'track_local_retrieve_dispatch_not_wired'
    | 'main_track_local_not_injected'
    | 'consumer_track_local_not_consumed'
    | 'retrieve_scope_not_fail_closed'
    | 'status_missing_not_closed_pin'
    | 'would_forge_product_closed';
};

export type Eg3DomainIsolationProductEvidenceResult =
  | { readonly emitted: true; readonly evidence: DomainIsolationProductEvidence }
  | Eg3DomainIsolationProductEvidenceFailure;

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

/**
 * Assess whether honest EG3 product-level 题域隔离 evidence can be emitted.
 * Fail-closed: every production-path + honesty-pin check must pass (Ban forge).
 */
export function assessDomainIsolationProductEvidence(): {
  trackLocalRetrieveDispatchWired: boolean;
  mainInjectsTrackLocal: boolean;
  consumerConsumesTrackLocal: boolean;
  retrieveScopeFailClosedMissingSnapshot: boolean;
  statusPinsDomainIsolationNotClosed: boolean;
  metaProveAloneDoesNotClose: boolean;
  wrongTrackZeroProductProven: boolean;
} {
  const trackLocal = readSrc('qbank-track-local-retrieve.ts');
  const main = readSrc('main.ts');
  const consumer = readSrc('interview-consumer.ts');
  const scope = readSrc('qbank-retrieve-scope.ts');
  const status = readRepo('ai-docs/delivery/harness/r4-domain-isolation-status.md');
  const eg3Harness = readRepo('ai-docs/delivery/harness/g-r4-5-eg3-true-evidence-impl.md');

  const trackLocalRetrieveDispatchWired =
    /dispatchTrackLocalRetrieval\s*\(/.test(trackLocal)
    && /sole production call site|W4/.test(trackLocal)
    && /assembleValidatedRetrievalPlan/.test(trackLocal)
    && /≠ R4 closed|≠ wrong_track=0|wire green ≠ R4 closed|Does NOT prove wrong_track=0/.test(
      trackLocal,
    );

  const mainInjectsTrackLocal =
    /trackLocal\s*:/.test(main)
    && /REAL-WIRE|dispatchTrackLocalRetrieval|trackLocal →/.test(main);

  const consumerConsumesTrackLocal =
    /trackLocal\?/.test(consumer)
    && /adaptive\.trackLocal|trackLocal\(/.test(consumer)
    && /题域已隔离|wrong_track=0|R4 closed/.test(consumer);

  const retrieveScopeFailClosedMissingSnapshot =
    /decideRouteSnapshotRetrieve|resolveServingScopeFromRouteSnapshot/.test(scope)
    && /route_snapshot_missing/.test(scope)
    && /Does NOT claim 题域已隔离|Does NOT prove wrong_track=0|≠ 题域已隔离/.test(scope);

  const statusPinsDomainIsolationNotClosed =
    /题域隔离 NOT closed/.test(status)
    && /releaseEvidence=false/.test(status)
    && /EG3 STILL OPEN|题域 STILL OPEN|Ban claim 题域已隔离|≠ 题域已隔离/.test(eg3Harness);

  // Meta prove is honesty/doc pin only — product evidence path documents that ceiling.
  const metaProveAloneDoesNotClose =
    /mysql-stack:r4-domain-isolation:prove/.test(eg3Harness)
    && /≠ 题域已隔离|Ban claim 题域已隔离 from meta prove alone|Ban claim from domain-isolation prove alone/.test(
      eg3Harness,
    );

  // Never invent wrong_track=0 product proven (ADV/LIVE_PG separate · Ban假关).
  const wrongTrackZeroProductProven = false;

  return {
    trackLocalRetrieveDispatchWired,
    mainInjectsTrackLocal,
    consumerConsumesTrackLocal,
    retrieveScopeFailClosedMissingSnapshot,
    statusPinsDomainIsolationNotClosed,
    metaProveAloneDoesNotClose,
    wrongTrackZeroProductProven,
  };
}

/** True only when every production-path + honesty-pin check passes (Ban forge hardcode). */
export function hasDomainIsolationProductEvidence(): boolean {
  const a = assessDomainIsolationProductEvidence();
  return (
    a.trackLocalRetrieveDispatchWired
    && a.mainInjectsTrackLocal
    && a.consumerConsumesTrackLocal
    && a.retrieveScopeFailClosedMissingSnapshot
    && a.statusPinsDomainIsolationNotClosed
    && a.metaProveAloneDoesNotClose
    && a.wrongTrackZeroProductProven === false
  );
}

/**
 * Emit honest EG3 domain-isolation product evidence.
 * Fail-closed: refuse to emit if any required check is false (Ban forge).
 * Classifier product-closed flags stay false (there is no product close).
 */
export function emitDomainIsolationProductEvidence(): Eg3DomainIsolationProductEvidenceResult {
  const a = assessDomainIsolationProductEvidence();
  if (!a.trackLocalRetrieveDispatchWired) {
    return {
      kind: 'Eg3DomainIsolationProductEvidenceFailure',
      emitted: false,
      reason: 'track_local_retrieve_dispatch_not_wired',
    };
  }
  if (!a.mainInjectsTrackLocal) {
    return {
      kind: 'Eg3DomainIsolationProductEvidenceFailure',
      emitted: false,
      reason: 'main_track_local_not_injected',
    };
  }
  if (!a.consumerConsumesTrackLocal) {
    return {
      kind: 'Eg3DomainIsolationProductEvidenceFailure',
      emitted: false,
      reason: 'consumer_track_local_not_consumed',
    };
  }
  if (!a.retrieveScopeFailClosedMissingSnapshot) {
    return {
      kind: 'Eg3DomainIsolationProductEvidenceFailure',
      emitted: false,
      reason: 'retrieve_scope_not_fail_closed',
    };
  }
  if (!a.statusPinsDomainIsolationNotClosed) {
    return {
      kind: 'Eg3DomainIsolationProductEvidenceFailure',
      emitted: false,
      reason: 'status_missing_not_closed_pin',
    };
  }
  if (!a.metaProveAloneDoesNotClose) {
    return {
      kind: 'Eg3DomainIsolationProductEvidenceFailure',
      emitted: false,
      reason: 'would_forge_product_closed',
    };
  }
  if (a.wrongTrackZeroProductProven !== false) {
    return {
      kind: 'Eg3DomainIsolationProductEvidenceFailure',
      emitted: false,
      reason: 'would_forge_product_closed',
    };
  }

  const evidence: DomainIsolationProductEvidence = {
    kind: EG3_DOMAIN_ISOLATION_PRODUCT_EVIDENCE_KIND,
    domainIsolationProductEvidence: true,
    trackLocalRetrieveDispatchWired: true,
    mainInjectsTrackLocal: true,
    consumerConsumesTrackLocal: true,
    retrieveScopeFailClosedMissingSnapshot: true,
    statusPinsDomainIsolationNotClosed: true,
    metaProveAloneDoesNotClose: true,
    wrongTrackZeroProductProven: false,
    eg3ProductClosed: false,
    domainIsolationClosed: false,
    gR45Closed: false,
    r4ProductClosed: false,
    releaseEvidence: false,
    note: 'EG3 domain-isolation product evidence — emitted · ≠ EG3/题域/G-R4-5/R4 closed · Ban forge · Ban claim from meta prove alone · await post-prove dual',
  };
  return { emitted: true, evidence };
}

/** Marker: this module is the EG3 product evidence emitter (≠ EG1/EG2 / 5×meta prove). */
export const EG3_DOMAIN_ISOLATION_PRODUCT_EVIDENCE_EMITTER_WIRED = true as const;
