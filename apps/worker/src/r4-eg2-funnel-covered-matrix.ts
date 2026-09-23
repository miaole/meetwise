/**
 * G-R4-5 EG2 — RAG-FUNNEL-01…08 **honest covered matrix** emitter.
 *
 * Honest path (Ban invent covered):
 *   - Inventories FUNNEL-01…08 (plus 01A / 02A / 02B as checklist peers) from real
 *     artifacts only.
 *   - Marks `covered` **only** when real covered elevation exists.
 *   - Batch1 (G-R4-5 / FUNNEL coveredCount Batch1 under authorize): FUNNEL-03 /
 *     FUNNEL-04 may elevate to `covered` when live Batch1 assessors affirm
 *     production-path pins (Ban invent).
 *   - Batch2 / Batch2b (G-R4-5 / FUNNEL coveredCount Batch2 + Batch2b 02B wire):
 *     FUNNEL-02A / FUNNEL-02B may elevate to `covered` when live Batch2 assessors
 *     affirm production-path pins (Batch2b wires productionConsumerWired · Ban invent · Ban elevating 05–08).
 *   - FUNNEL-01 may report `product_surfaces_true` via MS1+MS2+MS3 · still
 *     **≠ invent covered** · dual-claim evidence ≠ covered elevation.
 *   - 01A may report `source_sealed` (checklist [x] / seal) · ≠ invent 01…08 covered.
 *
 * HARD:
 *   - Matrix emit ≠ EG2 closed · ≠ invent FUNNEL covered · ≠ R4/题域 closed.
 *   - Ban idle re-run of the same 5×meta prove as fake close — those five never
 *     emitted this matrix.
 *   - releaseEvidence=false · ≠HA.
 *   - 本刀不翻 r4ProductClosed / funnelProductClosed / gR45Closed (Batch1/Batch2).
 */
import {
  classifyPMetaRemaining,
  isRagFunnel01Closed,
} from './r4-p-meta-p-r1-remaining.ts';
import {
  classifyPMetaServingProductRemaining,
  isProductFunnel01Closed,
} from './r4-p-meta-serving-product-remaining.ts';
import {
  isFunnel03Covered,
  isFunnel04Covered,
} from './r4-funnel-covered-count-batch1.ts';
import {
  isFunnel02ACovered,
  isFunnel02BCovered,
} from './r4-funnel-covered-count-batch2.ts';

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
  /** Count of rows with status === 'covered' (honest; Batch1 03/04 + Batch2 02A/02B). */
  readonly coveredCount: number;
  readonly inventCovered: false;
  readonly releaseEvidence: false;
  readonly note: 'EG2 FUNNEL-01…08 covered matrix — Ban invent covered · Batch1 may elevate 03/04 · Batch2/Batch2b may elevate 02A/02B when assessors affirm · ≠ R4/题域 closed · await post-prove dual';
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

/** IDs that Batch1/Batch2 may honestly elevate to covered (Ban invent other IDs). */
const ALLOW_COVERED_IDS = new Set([
  'RAG-FUNNEL-02A',
  'RAG-FUNNEL-02B',
  'RAG-FUNNEL-03',
  'RAG-FUNNEL-04',
]);

/**
 * Emit honest FUNNEL covered matrix from live classifiers + Batch1/Batch2 assessors.
 * Never invents `covered` for IDs outside Batch1/Batch2-affirmed set (Ban invent).
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

  const funnel02ACovered = isFunnel02ACovered();
  const funnel02BCovered = isFunnel02BCovered();
  const funnel03Covered = isFunnel03Covered();
  const funnel04Covered = isFunnel04Covered();

  const row02A: FunnelCoveredMatrixRow = funnel02ACovered
    ? {
        id: 'RAG-FUNNEL-02A',
        status: 'covered',
        basis:
          'Batch2 true-cover: immutable generation/projection + canonical embedding recipe evidenced (qbankEmbeddingRecipe fields + ensureActiveQbankGeneration + db projection + main immutable path + track-local projection consume + recipe query identity) · Ban invent',
        inventCoveredForbidden: true,
      }
    : notCovered(
        'RAG-FUNNEL-02A',
        'immutable generation/projection + canonical embedding recipe not evidenced · Ban invent covered',
      );

  const row02B: FunnelCoveredMatrixRow = funnel02BCovered
    ? {
        id: 'RAG-FUNNEL-02B',
        status: 'covered',
        basis:
          'Batch2/Batch2b true-cover: durable embedding compute cache evidenced (HMAC cache identity + resolve/claim/validate + db export + production consumer wiring) · Ban invent',
        inventCoveredForbidden: true,
      }
    : notCovered(
        'RAG-FUNNEL-02B',
        'durable embedding compute cache not evidenced on production consumer path · Ban invent covered',
      );

  const row03: FunnelCoveredMatrixRow = funnel03Covered
    ? {
        id: 'RAG-FUNNEL-03',
        status: 'covered',
        basis:
          'Batch1 true-cover: JobRouteDecision production path evidenced (contracts+domain+db+route-classify consumer+main · R2 structural CLOSED cited ≠ invent) · Ban invent',
        inventCoveredForbidden: true,
      }
    : notCovered(
        'RAG-FUNNEL-03',
        'JobRouteDecision classifier production path not evidenced · Ban invent covered',
      );

  const row04: FunnelCoveredMatrixRow = funnel04Covered
    ? {
        id: 'RAG-FUNNEL-04',
        status: 'covered',
        basis:
          'Batch1 true-cover: track-local scoped retrieval production evidenced (helper+db+domain+REAL-WIRE main inject+consumer+fail-closed scope · cite EG3 ≠ wash) · Ban invent',
        inventCoveredForbidden: true,
      }
    : notCovered(
        'RAG-FUNNEL-04',
        'track-local scoped retrieval production close not evidenced · Ban invent covered',
      );

  const rows: FunnelCoveredMatrixRow[] = [
    row01A,
    row01,
    row02A,
    row02B,
    row03,
    row04,
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
    note: 'EG2 FUNNEL-01…08 covered matrix — Ban invent covered · Batch1 may elevate 03/04 · Batch2/Batch2b may elevate 02A/02B when assessors affirm · ≠ R4/题域 closed · await post-prove dual',
  };
}

/**
 * True iff matrix is honest:
 *   - inventCovered=false
 *   - covered only allowed for 02A/02B/03/04 when Batch1/Batch2 assessors affirm
 *   - 05–08 still not_covered
 *   - 01 still product_surfaces_true path (≠ invent covered)
 *   - Ban invent other IDs
 */
export function isHonestFunnelCoveredMatrix(
  matrix: RagFunnel0108CoveredMatrix = emitRagFunnel0108CoveredMatrix(),
): boolean {
  if (matrix.inventCovered !== false) return false;
  if (matrix.releaseEvidence !== false) return false;

  const coveredRows = matrix.rows.filter((r) => r.status === 'covered');
  if (matrix.coveredCount !== coveredRows.length) return false;

  for (const row of coveredRows) {
    if (!ALLOW_COVERED_IDS.has(row.id)) return false;
    if (row.id === 'RAG-FUNNEL-02A' && !isFunnel02ACovered()) return false;
    if (row.id === 'RAG-FUNNEL-02B' && !isFunnel02BCovered()) return false;
    if (row.id === 'RAG-FUNNEL-03' && !isFunnel03Covered()) return false;
    if (row.id === 'RAG-FUNNEL-04' && !isFunnel04Covered()) return false;
    if (row.inventCoveredForbidden !== true) return false;
  }

  for (const id of FUNNEL_IDS_01_08) {
    const row = matrix.rows.find((r) => r.id === id);
    if (!row) return false;
    if (row.inventCoveredForbidden !== true) return false;
  }

  // 05–08 must remain not_covered (Ban invent).
  for (const id of [
    'RAG-FUNNEL-05',
    'RAG-FUNNEL-06',
    'RAG-FUNNEL-07',
    'RAG-FUNNEL-08',
  ] as const) {
    const row = matrix.rows.find((r) => r.id === id);
    if (!row || row.status !== 'not_covered') return false;
  }

  // 02A/02B/03/04: covered only when assessor affirms; else not_covered.
  const row02A = matrix.rows.find((r) => r.id === 'RAG-FUNNEL-02A');
  const row02B = matrix.rows.find((r) => r.id === 'RAG-FUNNEL-02B');
  const row03 = matrix.rows.find((r) => r.id === 'RAG-FUNNEL-03');
  const row04 = matrix.rows.find((r) => r.id === 'RAG-FUNNEL-04');
  if (!row02A || !row02B || !row03 || !row04) return false;
  if (isFunnel02ACovered()) {
    if (row02A.status !== 'covered') return false;
  } else if (row02A.status === 'covered') {
    return false;
  }
  if (isFunnel02BCovered()) {
    if (row02B.status !== 'covered') return false;
  } else if (row02B.status === 'covered') {
    return false;
  }
  if (isFunnel03Covered()) {
    if (row03.status !== 'covered') return false;
  } else if (row03.status === 'covered') {
    return false;
  }
  if (isFunnel04Covered()) {
    if (row04.status !== 'covered') return false;
  } else if (row04.status === 'covered') {
    return false;
  }

  const row01 = matrix.rows.find((r) => r.id === 'RAG-FUNNEL-01');
  if (!row01) return false;
  // When product surfaces are true, status must be product_surfaces_true (≠ invent covered).
  if (isRagFunnel01Closed() && isProductFunnel01Closed()) {
    if (row01.status !== 'product_surfaces_true') return false;
  }
  if (row01.status === 'covered') return false; // Ban invent 01 covered

  return true;
}

/** Marker: this module is the EG2 covered-matrix emitter (≠ 5×meta prove). */
export const EG2_FUNNEL_COVERED_MATRIX_EMITTER_WIRED = true as const;
