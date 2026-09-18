/**
 * Knife F8 — MS3 **standard deploy / combo-root product handoff** (G-R4-5 / MS3).
 *
 * After F7 served MS2 facets on the product path but left
 * `standardDeployProductHandoff=false`, this module lands a **real** product
 * handoff path: MS2 facets admission + checklist evidence → fail-closed
 * validation → StandardDeployProductHandoffAdmission.
 *
 * Checklist (must match F5 PRODUCT_DEPLOY_HANDOFF_CHECKLIST):
 *   local_01A_handoff_prove · combo_root_receipt · standard_or_cloud_deploy_receipt
 *
 * HARD honesty:
 *   - Real handoff path ≠ forge deploy / ≠ invent releaseEvidence / ≠ HA.
 *   - Caller supplies checklist evidence · no invented cloud deploy facts.
 *   - MS1/MS2 pins stay true.
 *   - MS3 product handoff alone ≠ R4 closed ≠ 题域已隔离 ≠ HA ≠ suite green.
 *   - Product FUNNEL classifier may become true (MS1+MS2+MS3) · still Ban claiming
 *     FUNNEL-01/G-R4-5 dual-closed without post-prove dual · other gates may remain.
 *   - Ban claiming R4/R1 closed · Ban flip without authorize · sole 恰 5 · releaseEvidence=false.
 */
import {
  MS1_METADATA_REVIEW_RECEIPT_PRODUCT_SERVING_CONSUMER_WIRED,
} from './r4-p-meta-ms1-product-wire.ts';
import {
  MS2_PRODUCT_FACETS_SERVED_ON_PRODUCT_PATH_WIRED,
  type ProductFacetsServingAdmission,
} from './r4-p-meta-ms2-facets-product.ts';

/** Canonical local 01A handoff prove path (旁证 · ≠ alone standard/cloud deploy). */
export const MS3_LOCAL_01A_HANDOFF_PROVE_PATH =
  'packages/db/test/qbank-handoff-closure.proof.ts' as const;

/**
 * Product deploy handoff checklist ids (must match F5 PRODUCT_DEPLOY_HANDOFF_CHECKLIST).
 */
export const MS3_PRODUCT_DEPLOY_HANDOFF_CHECKLIST = [
  'local_01A_handoff_prove',
  'combo_root_receipt',
  'standard_or_cloud_deploy_receipt',
] as const;

export type Ms3ChecklistItem = (typeof MS3_PRODUCT_DEPLOY_HANDOFF_CHECKLIST)[number];

/** local_01A_handoff_prove evidence — points at real local prove anchor. */
export type Local01AHandoffProveEvidence = {
  readonly item: 'local_01A_handoff_prove';
  readonly provePath: string;
  readonly note: string;
};

/** combo_root_receipt evidence — typed product combo-root handoff receipt. */
export type ComboRootReceiptEvidence = {
  readonly item: 'combo_root_receipt';
  readonly receiptId: string;
  readonly comboRootId: string;
  readonly attestedAt: string;
  readonly note: string;
};

/** standard_or_cloud_deploy_receipt evidence — typed product deploy receipt. */
export type StandardOrCloudDeployReceiptEvidence = {
  readonly item: 'standard_or_cloud_deploy_receipt';
  readonly receiptId: string;
  readonly deployKind: 'standard' | 'cloud' | 'combo_root_local';
  readonly attestedAt: string;
  readonly note: string;
};

/** Full checklist evidence required to emit MS3 product handoff. */
export type ProductDeployHandoffChecklistEvidence = {
  readonly local_01A_handoff_prove: Local01AHandoffProveEvidence;
  readonly combo_root_receipt: ComboRootReceiptEvidence;
  readonly standard_or_cloud_deploy_receipt: StandardOrCloudDeployReceiptEvidence;
};

/**
 * Product standard-deploy handoff admission — MS3.
 * releaseEvidence always false on this knife (≠ HA · ≠ R4 closed).
 */
export type StandardDeployProductHandoffAdmission = {
  readonly kind: 'StandardDeployProductHandoffAdmission';
  readonly handedOff: true;
  readonly receiptId: string;
  readonly refId: string;
  readonly servingScopeId: string;
  readonly taxonomyVersion: string;
  readonly checklistCompleted: readonly Ms3ChecklistItem[];
  readonly checklistEvidence: ProductDeployHandoffChecklistEvidence;
  /** Honesty: this knife never flips releaseEvidence. */
  readonly releaseEvidence: false;
  readonly note: 'MS3 standard deploy product handoff — ≠ R4/FUNNEL dual-claim closed · Ban forge · releaseEvidence=false';
};

export type StandardDeployProductHandoffRejection = {
  readonly kind: 'StandardDeployProductHandoffRejection';
  readonly handedOff: false;
  readonly reason:
    | 'ms1_not_wired'
    | 'ms2_not_wired'
    | 'facets_not_served'
    | 'checklist_invalid'
    | 'checklist_plan_mismatch'
    | 'local_01a_prove_path_invalid';
};

export type StandardDeployProductHandoffResult =
  | StandardDeployProductHandoffAdmission
  | StandardDeployProductHandoffRejection;

const RECEIPT_ID = /^[A-Za-z0-9:_-]{1,160}$/;
const ISO_LIKE = /^\d{4}-\d{2}-\d{2}T/;

function isNonEmptyNote(x: unknown): x is string {
  return typeof x === 'string' && x.length >= 1 && x.length <= 512;
}

function isValidLocal01A(x: unknown): x is Local01AHandoffProveEvidence {
  if (!x || typeof x !== 'object') return false;
  const e = x as Record<string, unknown>;
  if (e.item !== 'local_01A_handoff_prove') return false;
  if (typeof e.provePath !== 'string' || e.provePath.length < 1) return false;
  if (!e.provePath.includes('qbank-handoff-closure.proof.ts')) return false;
  if (!isNonEmptyNote(e.note)) return false;
  return true;
}

function isValidComboRoot(x: unknown): x is ComboRootReceiptEvidence {
  if (!x || typeof x !== 'object') return false;
  const e = x as Record<string, unknown>;
  if (e.item !== 'combo_root_receipt') return false;
  if (typeof e.receiptId !== 'string' || !RECEIPT_ID.test(e.receiptId)) return false;
  if (typeof e.comboRootId !== 'string' || !RECEIPT_ID.test(e.comboRootId)) return false;
  if (typeof e.attestedAt !== 'string' || !ISO_LIKE.test(e.attestedAt)) return false;
  if (!isNonEmptyNote(e.note)) return false;
  return true;
}

function isValidStandardOrCloud(x: unknown): x is StandardOrCloudDeployReceiptEvidence {
  if (!x || typeof x !== 'object') return false;
  const e = x as Record<string, unknown>;
  if (e.item !== 'standard_or_cloud_deploy_receipt') return false;
  if (typeof e.receiptId !== 'string' || !RECEIPT_ID.test(e.receiptId)) return false;
  if (e.deployKind !== 'standard' && e.deployKind !== 'cloud' && e.deployKind !== 'combo_root_local') {
    return false;
  }
  if (typeof e.attestedAt !== 'string' || !ISO_LIKE.test(e.attestedAt)) return false;
  if (!isNonEmptyNote(e.note)) return false;
  return true;
}

/**
 * Fail-closed shape check for full product deploy handoff checklist evidence.
 * Does not talk to cloud / Postgres — Ban forge deploy facts in this knife.
 */
export function isValidProductDeployHandoffChecklistEvidence(
  x: unknown,
): x is ProductDeployHandoffChecklistEvidence {
  if (!x || typeof x !== 'object') return false;
  const c = x as Record<string, unknown>;
  if (!isValidLocal01A(c.local_01A_handoff_prove)) return false;
  if (!isValidComboRoot(c.combo_root_receipt)) return false;
  if (!isValidStandardOrCloud(c.standard_or_cloud_deploy_receipt)) return false;
  return true;
}

/**
 * **Real MS3 standard deploy product handoff** — emit a product handoff admission
 * from an already-served MS2 facets admission + full checklist evidence.
 *
 * - Requires MS1+MS2 wired + MS2 facets served admission (fail-closed).
 * - Requires all three checklist evidence items (fail-closed · ≠ partial forge).
 * - Does NOT flip releaseEvidence · does NOT invent cloud deploy / HA green.
 * - Handoff alone ≠ R4 / 题域已隔离 closed · Ban claiming FUNNEL/G-R4-5 dual-closed without dual.
 */
export function emitStandardDeployProductHandoff(
  facetsAdmission: ProductFacetsServingAdmission | { served: false } | unknown,
  checklist: unknown,
): StandardDeployProductHandoffResult {
  if (MS1_METADATA_REVIEW_RECEIPT_PRODUCT_SERVING_CONSUMER_WIRED !== true) {
    return { kind: 'StandardDeployProductHandoffRejection', handedOff: false, reason: 'ms1_not_wired' };
  }
  if (MS2_PRODUCT_FACETS_SERVED_ON_PRODUCT_PATH_WIRED !== true) {
    return { kind: 'StandardDeployProductHandoffRejection', handedOff: false, reason: 'ms2_not_wired' };
  }
  if (
    !facetsAdmission
    || typeof facetsAdmission !== 'object'
    || (facetsAdmission as { served?: unknown }).served !== true
    || (facetsAdmission as { kind?: unknown }).kind !== 'ProductFacetsServingAdmission'
  ) {
    return {
      kind: 'StandardDeployProductHandoffRejection',
      handedOff: false,
      reason: 'facets_not_served',
    };
  }
  if (!isValidProductDeployHandoffChecklistEvidence(checklist)) {
    return {
      kind: 'StandardDeployProductHandoffRejection',
      handedOff: false,
      reason: 'checklist_invalid',
    };
  }
  const keys = Object.keys(checklist).sort();
  const plan = [...MS3_PRODUCT_DEPLOY_HANDOFF_CHECKLIST].sort();
  if (keys.length !== plan.length || !plan.every((k, i) => keys[i] === k)) {
    return {
      kind: 'StandardDeployProductHandoffRejection',
      handedOff: false,
      reason: 'checklist_plan_mismatch',
    };
  }
  if (
    !checklist.local_01A_handoff_prove.provePath.includes('qbank-handoff-closure.proof.ts')
  ) {
    return {
      kind: 'StandardDeployProductHandoffRejection',
      handedOff: false,
      reason: 'local_01a_prove_path_invalid',
    };
  }

  const adm = facetsAdmission as ProductFacetsServingAdmission;
  return {
    kind: 'StandardDeployProductHandoffAdmission',
    handedOff: true,
    receiptId: adm.receiptId,
    refId: adm.refId,
    servingScopeId: adm.servingScopeId,
    taxonomyVersion: adm.taxonomyVersion,
    checklistCompleted: MS3_PRODUCT_DEPLOY_HANDOFF_CHECKLIST,
    checklistEvidence: {
      local_01A_handoff_prove: {
        item: 'local_01A_handoff_prove',
        provePath: checklist.local_01A_handoff_prove.provePath,
        note: checklist.local_01A_handoff_prove.note,
      },
      combo_root_receipt: {
        item: 'combo_root_receipt',
        receiptId: checklist.combo_root_receipt.receiptId,
        comboRootId: checklist.combo_root_receipt.comboRootId,
        attestedAt: checklist.combo_root_receipt.attestedAt,
        note: checklist.combo_root_receipt.note,
      },
      standard_or_cloud_deploy_receipt: {
        item: 'standard_or_cloud_deploy_receipt',
        receiptId: checklist.standard_or_cloud_deploy_receipt.receiptId,
        deployKind: checklist.standard_or_cloud_deploy_receipt.deployKind,
        attestedAt: checklist.standard_or_cloud_deploy_receipt.attestedAt,
        note: checklist.standard_or_cloud_deploy_receipt.note,
      },
    },
    releaseEvidence: false,
    note: 'MS3 standard deploy product handoff — ≠ R4/FUNNEL dual-claim closed · Ban forge · releaseEvidence=false',
  };
}

/**
 * Marker: this module **is** the wired MS3 standard deploy product handoff.
 * Classifiers (F2/F3/F5) read this so MS3 flags stay honest after the real wire.
 */
export const MS3_STANDARD_DEPLOY_PRODUCT_HANDOFF_WIRED = true as const;

/** Product handoff id for inventory / prove anchors. */
export const MS3_STANDARD_DEPLOY_PRODUCT_HANDOFF_ID =
  'r4-p-meta-ms3-deploy-product:emitStandardDeployProductHandoff' as const;
