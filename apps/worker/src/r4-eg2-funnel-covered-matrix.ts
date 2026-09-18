/**
 * G-R4-5 EG2 — RAG-FUNNEL-01…08 **honest covered matrix** emitter.
 *
 * Honest path (Ban invent covered):
 *   - Inventories FUNNEL-01…08 (plus 01A / 02A / 02B as checklist peers) from real
 *     artifacts only.
 *   - Marks `covered` **only** when real covered elevation exists (none of 01…08
 *     are inventable as covered today).
 *   - FUNNEL-01 may report `product_surfaces_true` via MS1+MS2+MS3 · still
 *     **≠ invent covered** · dual-claim evidence ≠ covered elevation.
 *   - 01A may report `source_sealed` (checklist [x] / seal) · ≠ invent 01…08 covered.
 *
 * HARD:
 *   - Matrix emit ≠ EG2 closed · ≠ invent FUNNEL-01…08 covered · ≠ R4/题域 closed.
 *   - Ban idle re-run of the same 5×meta prove as fake close — those five never
 *     emitted this matrix.
 *   - releaseEvidence=false · ≠HA.
 */
import {
  classifyPMetaRemaining,
  isRagFunnel01Closed,
} from './r4-p-meta-p-r1-remaining.ts';
import {
  classifyPMetaServingProductRemaining,
  isProductFunnel01Closed,
} from './r4-p-meta-serving-product-remaining.ts';

/** Covered-status vocabulary (Ban invent covered). */
export type FunnelCoveredStatus =
  | 'covered'
  | 'source_sealed'
  | 'product_surfaces_true'
  | 'not_covered'
  | 'missing';

export type FunnelCoveredMatrixRow = {
  readonly id: string;
  readonly status: FunnelCoveredStatus;
  readonly basis: string;
  /** True only when status === 'covered' (Ban invent). */
  readonly inventCoveredForbidden: true;
};

export type RagFunnel0108CoveredMatrix = {
  readonly kind: 'RagFunnel0108CoveredMatrix';
  readonly rows: readonly FunnelCoveredMatrixRow[];
  /** Count of rows with status === 'covered' (honest; expect 0 today). */
  readonly coveredCount: number;
  readonly inventCovered: false;
  readonly releaseEvidence: false;
  readonly note: 'EG2 FUNNEL-01…08 covered matrix — Ban invent covered · ≠ R4/题域 closed · await post-prove dual';
};

const FUNNEL_IDS_01_08 = [
  'RAG-FUNNEL-01',
  'RAG-FUNNEL-02A',
  'RAG-FUNNEL-02B',
  'RAG-FUNNEL-03',
  'RAG-FUNNEL-04',
  'RAG-FUNNEL-05',
  'RAG-FUNNEL-06',
  'RAG-FUNNEL-07',
  'RAG-FUNNEL-08',
] as const;

/**
 * Emit honest FUNNEL covered matrix from live classifiers + known inventory.
 * Never invents `covered` for 01…08 (Ban invent covered).
 */
export function emitRagFunnel0108CoveredMatrix(): RagFunnel0108CoveredMatrix {
  const f2 = classifyPMetaRemaining();
  const product = classifyPMetaServingProductRemaining();
  const funnel01Product =
    isRagFunnel01Closed(f2) && isProductFunnel01Closed(product);

  const row01A: FunnelCoveredMatrixRow = {
    id: 'RAG-FUNNEL-01A',
    status: f2.sourceSealed01A ? 'source_sealed' : 'missing',
    basis: f2.sourceSealed01A
      ? '01A source seal + qbank-handoff-closure prove inventory (checklist [x] · releaseEvidence=false)'
      : '01A seal missing',
    inventCoveredForbidden: true,
  };

  const row01: FunnelCoveredMatrixRow = {
    id: 'RAG-FUNNEL-01',
    status: funnel01Product ? 'product_surfaces_true' : 'not_covered',
    basis: funnel01Product
      ? 'MS1+MS2+MS3 product surfaces true (F6/F7/F8) · dual-claim evidence path ≠ invent covered · checklist 01 still [ ] until authorized SSOT'
      : 'MS1/MS2/MS3 product surfaces incomplete · Ban invent covered',
    inventCoveredForbidden: true,
  };

  const notCovered = (id: string, basis: string): FunnelCoveredMatrixRow => ({
    id,
    status: 'not_covered',
    basis,
    inventCoveredForbidden: true,
  });

  const rows: FunnelCoveredMatrixRow[] = [
    row01A,
    row01,
    notCovered(
      'RAG-FUNNEL-02A',
      'immutable generation/projection + canonical embedding recipe not evidenced · Ban invent covered',
    ),
    notCovered(
      'RAG-FUNNEL-02B',
      'durable embedding compute cache not evidenced · Ban invent covered',
    ),
    notCovered(
      'RAG-FUNNEL-03',
      'JobRouteDecision classifier production path not evidenced · Ban invent covered',
    ),
    notCovered(
      'RAG-FUNNEL-04',
      'track-local scoped retrieval production close not evidenced · Ban invent covered',
    ),
    notCovered(
      'RAG-FUNNEL-05',
      'same-leaf LLM generation on clean miss not evidenced · Ban invent covered',
    ),
    notCovered(
      'RAG-FUNNEL-06',
      'route-scope cache/provenance/revoke not evidenced · Ban invent covered',
    ),
    notCovered(
      'RAG-FUNNEL-07',
      'free-text allowlisted scope funnel not evidenced · Ban invent covered',
    ),
    notCovered(
      'RAG-FUNNEL-08',
      'production-equivalent eval matrix not evidenced · Ban invent covered',
    ),
  ];

  const coveredCount = rows.filter((r) => r.status === 'covered').length;

  return {
    kind: 'RagFunnel0108CoveredMatrix',
    rows,
    coveredCount,
    inventCovered: false,
    releaseEvidence: false,
    note: 'EG2 FUNNEL-01…08 covered matrix — Ban invent covered · ≠ R4/题域 closed · await post-prove dual',
  };
}

/** True iff matrix is honest: no invented covered on 01…08; 01…08 rows present. */
export function isHonestFunnelCoveredMatrix(
  matrix: RagFunnel0108CoveredMatrix = emitRagFunnel0108CoveredMatrix(),
): boolean {
  if (matrix.inventCovered !== false) return false;
  if (matrix.coveredCount !== 0) return false; // Ban invent covered today
  for (const id of FUNNEL_IDS_01_08) {
    const row = matrix.rows.find((r) => r.id === id);
    if (!row) return false;
    if (row.status === 'covered') return false;
    if (row.inventCoveredForbidden !== true) return false;
  }
  const row01 = matrix.rows.find((r) => r.id === 'RAG-FUNNEL-01');
  if (!row01) return false;
  // When product surfaces are true, status must be product_surfaces_true (≠ invent covered).
  if (isRagFunnel01Closed() && isProductFunnel01Closed()) {
    if (row01.status !== 'product_surfaces_true') return false;
  }
  return true;
}

/** Marker: this module is the EG2 covered-matrix emitter (≠ 5×meta prove). */
export const EG2_FUNNEL_COVERED_MATRIX_EMITTER_WIRED = true as const;
