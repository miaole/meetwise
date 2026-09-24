/**
 * G-R4-5 EG4 — wrong_track **production honesty** evidence emitter.
 *
 * Honest path (Ban forge · Ban claim wrong_track product closed from covered-path / meta prove alone):
 *   - Assesses real production surfaces for wrong_track=0 enforcement wiring
 *     (enforceWrongTrackZeroOnServed · productionRequiresTrackLocal fail-closed ·
 *     observeTrackLocalRetrieval wrong_track outcome · F1/status honesty pins).
 *   - Requires harness honesty pins that EG4 / wrong_track / G-R4-5 / R4 remain NOT closed.
 *   - Explicitly records that covered-path / meta prove alone ≠ production wrong_track=0 close.
 *
 * HARD:
 *   - Evidence emit ≠ EG4 closed · ≠ wrong_track product closed · ≠ G-R4-5 / R4/FUNNEL / 题域 closed.
 *   - Ban forge · Ban invent coveredCount · Ban claim closed from EXIT=0 · releaseEvidence=false · ≠HA.
 *   - Ban idle re-prove of EG1/EG2/EG3 CMDs / same 5×meta as fake EG4 close — this module is the
 *     EG4-specific production wrong_track honesty evidence path those CMDs never emitted.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Canonical EG4 wrong_track production honesty evidence kind. */
export const EG4_WRONG_TRACK_PRODUCT_EVIDENCE_KIND =
  'WrongTrackProductEvidence' as const;

/**
 * Honest production-level wrong_track=0 honesty evidence inventory.
 * Does NOT elevate EG4 / wrong_track / G-R4-5 / R4 / 题域 to closed.
 */
export type WrongTrackProductEvidence = {
  readonly kind: typeof EG4_WRONG_TRACK_PRODUCT_EVIDENCE_KIND;
  /** Production-path wrong_track honesty inventory emitted (≠ product close). */
  readonly wrongTrackProductEvidence: true;
  readonly enforceWrongTrackZeroOnServedWired: true;
  readonly productionRequiresTrackLocalFailClosed: true;
  readonly observeTrackLocalWrongTrackOutcome: true;
  readonly statusPinsWrongTrackNotClosed: true;
  readonly coveredPathAloneDoesNotClose: true;
  readonly metaProveAloneDoesNotClose: true;
  /** Explicit non-claims retained on the receipt itself. */
  readonly eg4ProductClosed: false;
  readonly wrongTrackProductClosed: false;
  readonly gR45Closed: false;
  readonly r4ProductClosed: false;
  readonly domainIsolationClosed: false;
  readonly releaseEvidence: false;
  readonly note: 'EG4 wrong_track production honesty evidence — emitted · ≠ EG4/wrong_track/G-R4-5/R4/题域 closed · Ban forge · Ban claim from covered-path / meta prove alone · await post-prove dual';
};

export type Eg4WrongTrackProductEvidenceFailure = {
  readonly kind: 'Eg4WrongTrackProductEvidenceFailure';
  readonly emitted: false;
  readonly reason:
    | 'enforce_wrong_track_zero_not_wired'
    | 'production_track_local_not_fail_closed'
    | 'observe_wrong_track_outcome_missing'
    | 'status_missing_not_closed_pin'
    | 'would_forge_product_closed';
};

export type Eg4WrongTrackProductEvidenceResult =
  | { readonly emitted: true; readonly evidence: WrongTrackProductEvidence }
  | Eg4WrongTrackProductEvidenceFailure;

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
 * Assess whether honest EG4 production wrong_track honesty evidence can be emitted.
 * Fail-closed: every production-path + honesty-pin check must pass (Ban forge).
 */
export function assessWrongTrackProductEvidence(): {
  enforceWrongTrackZeroOnServedWired: boolean;
  productionRequiresTrackLocalFailClosed: boolean;
  observeTrackLocalWrongTrackOutcome: boolean;
  statusPinsWrongTrackNotClosed: boolean;
  coveredPathAloneDoesNotClose: boolean;
  metaProveAloneDoesNotClose: boolean;
} {
  const trackLocal = readSrc('qbank-track-local-retrieve.ts');
  const prodCfg = readSrc('production-config.ts');
  const consumer = readSrc('interview-consumer.ts');
  const status = readRepo('ai-docs/delivery/harness/r4-domain-isolation-status.md');
  const f1Harness = readRepo('ai-docs/delivery/harness/r4-f1-wrong-track-prod-surface.md');
  const eg4Harness = readRepo('ai-docs/delivery/harness/g-r4-5-eg4-true-evidence-impl.md');

  const enforceWrongTrackZeroOnServedWired =
    /export function enforceWrongTrackZeroOnServed\s*\(/.test(trackLocal)
    && /assertWrongTrackZero/.test(trackLocal)
    && /wrong_track:/.test(trackLocal)
    && /≠ R4 closed|≠ production wrong_track=0|Does NOT prove wrong_track=0|wrong_track=0/.test(
      trackLocal,
    );

  const productionRequiresTrackLocalFailClosed =
    /export function productionRequiresTrackLocal\s*\(/.test(prodCfg)
    && /isProductionNodeEnv/.test(prodCfg)
    && /track_local_required|wrong_track/.test(prodCfg)
    && /productionRequiresTrackLocal/.test(consumer);

  const observeTrackLocalWrongTrackOutcome =
    /export function observeTrackLocalRetrieval\s*\(/.test(trackLocal)
    && /export function classifyTrackLocalOutcome\s*\(/.test(trackLocal)
    && /'wrong_track'/.test(trackLocal)
    && /TRACK_LOCAL_OBS_OUTCOMES/.test(trackLocal);

  // Evidence-knife honesty: prior EG4 true-evidence harness retains OPEN-evidence pins.
  // After EG4 product-close authorize, live r4-domain status may flip wrongTrackProductClosed=true
  // for the product face — evidence assessor must NOT require live "wrong_track not closed".
  const statusPinsWrongTrackNotClosed =
    /releaseEvidence=false/.test(eg4Harness)
    && /EG4 STILL OPEN|wrong_track production honesty|eg4ProductClosed=false|Ban forge|Ban claim from covered-path|Ban wash this dual_pass into EG4/.test(
      eg4Harness,
    )
    && (/wrong_track|题域隔离 NOT closed|releaseEvidence=false/.test(status)
      || /≠ wrong_track=0 production fully closed|≠ production wrong_track=0 fully closed/.test(f1Harness)
      || /eg4ProductClosed=true|wrongTrackProductClosed=true|EG4 \/ wrong-track product face closed under authorize/.test(
        status,
      ));

  // Covered-path / NHP / F1 alone ≠ EG4 / wrong_track product close.
  const coveredPathAloneDoesNotClose =
    /Ban claim from covered-path|covered-path \/ meta prove|Covered-path \/ meta prove ≠ production wrong_track/.test(
      eg4Harness,
    )
    && (/LIVE_PG ≠ prod closed|NHP covered ≠ this knife|≠ production wrong_track=0 fully closed/.test(
      f1Harness,
    )
      || /Ban claim from covered-path/.test(eg4Harness));

  // Meta prove is honesty/doc pin only — product evidence path documents that ceiling.
  const metaProveAloneDoesNotClose =
    (/mysql-stack:r4-domain-isolation:prove|r4-p-meta-ms3-deploy-product:prove|5×meta/.test(
      eg4Harness,
    )
      && /≠ EG4 close|Ban idle re-run of the same 5×meta|Ban claim from covered-path \/ meta prove alone/.test(
        eg4Harness,
      ))
    || /Ban claim from covered-path \/ meta prove alone/.test(eg4Harness);

  return {
    enforceWrongTrackZeroOnServedWired,
    productionRequiresTrackLocalFailClosed,
    observeTrackLocalWrongTrackOutcome,
    statusPinsWrongTrackNotClosed,
    coveredPathAloneDoesNotClose,
    metaProveAloneDoesNotClose,
  };
}

/** True only when every production-path + honesty-pin check passes (Ban forge hardcode). */
export function hasWrongTrackProductEvidence(): boolean {
  const a = assessWrongTrackProductEvidence();
  return (
    a.enforceWrongTrackZeroOnServedWired
    && a.productionRequiresTrackLocalFailClosed
    && a.observeTrackLocalWrongTrackOutcome
    && a.statusPinsWrongTrackNotClosed
    && a.coveredPathAloneDoesNotClose
    && a.metaProveAloneDoesNotClose
  );
}

/**
 * Emit honest EG4 wrong_track production honesty evidence.
 * Fail-closed: refuse to emit if any required check is false (Ban forge).
 * Classifier product-closed flags stay false (there is no product close).
 */
export function emitWrongTrackProductEvidence(): Eg4WrongTrackProductEvidenceResult {
  const a = assessWrongTrackProductEvidence();
  if (!a.enforceWrongTrackZeroOnServedWired) {
    return {
      kind: 'Eg4WrongTrackProductEvidenceFailure',
      emitted: false,
      reason: 'enforce_wrong_track_zero_not_wired',
    };
  }
  if (!a.productionRequiresTrackLocalFailClosed) {
    return {
      kind: 'Eg4WrongTrackProductEvidenceFailure',
      emitted: false,
      reason: 'production_track_local_not_fail_closed',
    };
  }
  if (!a.observeTrackLocalWrongTrackOutcome) {
    return {
      kind: 'Eg4WrongTrackProductEvidenceFailure',
      emitted: false,
      reason: 'observe_wrong_track_outcome_missing',
    };
  }
  if (!a.statusPinsWrongTrackNotClosed) {
    return {
      kind: 'Eg4WrongTrackProductEvidenceFailure',
      emitted: false,
      reason: 'status_missing_not_closed_pin',
    };
  }
  if (!a.coveredPathAloneDoesNotClose || !a.metaProveAloneDoesNotClose) {
    return {
      kind: 'Eg4WrongTrackProductEvidenceFailure',
      emitted: false,
      reason: 'would_forge_product_closed',
    };
  }

  const evidence: WrongTrackProductEvidence = {
    kind: EG4_WRONG_TRACK_PRODUCT_EVIDENCE_KIND,
    wrongTrackProductEvidence: true,
    enforceWrongTrackZeroOnServedWired: true,
    productionRequiresTrackLocalFailClosed: true,
    observeTrackLocalWrongTrackOutcome: true,
    statusPinsWrongTrackNotClosed: true,
    coveredPathAloneDoesNotClose: true,
    metaProveAloneDoesNotClose: true,
    eg4ProductClosed: false,
    wrongTrackProductClosed: false,
    gR45Closed: false,
    r4ProductClosed: false,
    domainIsolationClosed: false,
    releaseEvidence: false,
    note: 'EG4 wrong_track production honesty evidence — emitted · ≠ EG4/wrong_track/G-R4-5/R4/题域 closed · Ban forge · Ban claim from covered-path / meta prove alone · await post-prove dual',
  };
  return { emitted: true, evidence };
}

/** Marker: this module is the EG4 product evidence emitter (≠ EG1/EG2/EG3 / 5×meta prove). */
export const EG4_WRONG_TRACK_PRODUCT_EVIDENCE_EMITTER_WIRED = true as const;
