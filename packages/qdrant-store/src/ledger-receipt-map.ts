/**
 * G5 P16 — schema/mapping bridge: P15 QdrantErasureReceipt → 0091 privacy_deletion_receipt.
 *
 * HARD:
 *   - Mapping / candidate hash ONLY. Does NOT write product ledger.
 *   - Product ledger NOT writable for Qdrant yet → fail-closed PREREQ list.
 *   - Prototype receipt ≠ 0091 privacy_deletion_receipt / PrivacyDeletionReceipt contract.
 *   - ≠ public DELETE 200/202 (product path still 503).
 *   - releaseEvidence=false · Not HA · ≠ G5 closed · ≠ privacy covered · ≠ cutover.
 *
 * @see ai-docs/delivery/harness/qdrant-g5-ledger-map.md
 * @see packages/db/migrations/0091_privacy_authorization_issuer.sql
 */
import { createHash } from 'node:crypto';
import type { QdrantErasureReceipt } from './types.ts';

/** Columns on privacy_deletion_receipt (0091). */
export const LEDGER_0091_RECEIPT_COLUMNS = [
  'id',
  'request_id',
  'target_id',
  'receipt_kind',
  'receipt_hash',
  'recorded_by',
  'created_at',
  'resolved_at',
  'resolved_by',
] as const;

/** Core fields on P15 prototype QdrantErasureReceipt. */
export const P15_PROTOTYPE_RECEIPT_FIELDS = [
  'id',
  'collection',
  'deleted_count',
  'at',
  'batch_digest',
  'subject_id',
] as const;

/** Contract PrivacyDeletionReceipt (packages/contracts) — subset shape. */
export const CONTRACT_PRIVACY_DELETION_RECEIPT_FIELDS = [
  'targetId',
  'receiptKind',
  'receiptHash',
] as const;

export type LedgerMapStatus = 'mapped' | 'partial' | 'unmapped' | 'blocked';

export interface LedgerFieldMapEntry {
  /** P15 prototype field(s), or null when ledger-only. */
  prototypeField: string | null;
  /** 0091 column or contract field. */
  ledgerField: string;
  status: LedgerMapStatus;
  note: string;
}

/**
 * Honest field map. Status meanings:
 *   mapped   — prototype value can surface 1:1 (still NOT written to ledger)
 *   partial  — material exists to *derive* a candidate (hash); not a ledger row
 *   unmapped — no prototype analogue
 *   blocked  — requires product ledger primitives that Qdrant path lacks
 */
export const RECEIPT_FIELD_MAP: readonly LedgerFieldMapEntry[] = Object.freeze([
  {
    prototypeField: null,
    ledgerField: 'id',
    status: 'unmapped',
    note: '0091 receipt id is uuid DEFAULT gen_random_uuid(); prototype id is subject:/batch: key — not interchangeable',
  },
  {
    prototypeField: null,
    ledgerField: 'request_id',
    status: 'blocked',
    note: 'FK privacy_erasure_request — no Qdrant path mints request; public DELETE still 503',
  },
  {
    prototypeField: null,
    ledgerField: 'target_id',
    status: 'blocked',
    note: 'FK privacy_deletion_target — no qdrant sink in CHECK; no target row for Qdrant erase',
  },
  {
    prototypeField: null,
    ledgerField: 'receipt_kind',
    status: 'unmapped',
    note: '0091 enum local_erased|retention_pending|external_pending|external_confirmed|failed_cleanup; prototype has no kind',
  },
  {
    prototypeField: 'batch_digest|deleted_count|collection|at|subject_id|id',
    ledgerField: 'receipt_hash',
    status: 'partial',
    note: 'candidate hash MAY be derived from prototype (see deriveCandidateReceiptHash); ≠ written receipt_hash',
  },
  {
    prototypeField: null,
    ledgerField: 'recorded_by',
    status: 'unmapped',
    note: 'worker/principal identity — prototype has no recorded_by',
  },
  {
    prototypeField: 'at',
    ledgerField: 'created_at',
    status: 'partial',
    note: 'prototype.at is ISO timestamp of sink delete; ≠ DB created_at until ledger write exists',
  },
  {
    prototypeField: null,
    ledgerField: 'resolved_at',
    status: 'unmapped',
    note: 'external_pending→external_confirmed resolution only; no Qdrant async confirm path',
  },
  {
    prototypeField: null,
    ledgerField: 'resolved_by',
    status: 'unmapped',
    note: 'resolution actor — none for Qdrant prototype',
  },
  {
    prototypeField: null,
    ledgerField: 'targetId',
    status: 'blocked',
    note: 'contracts PrivacyDeletionReceipt.targetId — blocked same as target_id',
  },
  {
    prototypeField: null,
    ledgerField: 'receiptKind',
    status: 'unmapped',
    note: 'contracts PrivacyDeletionReceipt.receiptKind — prototype has no kind',
  },
  {
    prototypeField: 'batch_digest|deleted_count|collection|at|subject_id|id',
    ledgerField: 'receiptHash',
    status: 'partial',
    note: 'contracts PrivacyDeletionReceipt.receiptHash — candidate only; ≠ ledger write',
  },
  {
    prototypeField: 'collection',
    ledgerField: '(no 0091 column)',
    status: 'unmapped',
    note: 'Qdrant collection is sink-local metadata; not a privacy_deletion_receipt column',
  },
  {
    prototypeField: 'deleted_count',
    ledgerField: '(no 0091 column)',
    status: 'unmapped',
    note: 'countable P15 surface; 0091 stores integrity via receipt_hash, not deleted_count column',
  },
  {
    prototypeField: 'subject_id',
    ledgerField: '(no 0091 column)',
    status: 'unmapped',
    note: 'subject is owner on erasure request / target resource_hmac path — not a receipt column',
  },
  {
    prototypeField: 'batch_digest',
    ledgerField: '(no 0091 column)',
    status: 'partial',
    note: 'feeds candidate receipt_hash material only',
  },
]);

export interface LedgerWritePrereq {
  id: string;
  detail: string;
}

/**
 * Fail-closed PREREQs that block product-ledger writes for Qdrant erasure.
 * Non-empty ⇒ ledger NOT writable from this package.
 */
export const LEDGER_WRITE_PREREQS: readonly LedgerWritePrereq[] = Object.freeze([
  {
    id: 'SINK_CHECK_NO_QDRANT',
    detail:
      'privacy_deletion_target.sink CHECK (0125 latest) has no qdrant / qdrant_memory_vector value; only memory_vector_chunk (pgvector) among vector sinks',
  },
  {
    id: 'PUBLIC_DELETE_STILL_503',
    detail:
      'Public DELETE /privacy/* still returns 503 (interview_erasure_authorization_not_available / resume_erasure_migration_in_progress) — never invent 200/202',
  },
  {
    id: 'NO_REQUEST_OR_TARGET',
    detail:
      'No Qdrant path creates privacy_erasure_request / privacy_deletion_target rows required by privacy_deletion_receipt FKs',
  },
  {
    id: 'AUTHZ_ROOT_UNWIRED',
    detail:
      '0091 PrivacyAuthorizationIssuer / consume / claim / lease not wired to Qdrant subject erase (≠ authz root)',
  },
  {
    id: 'WORKER_NO_QDRANT_SINK',
    detail:
      'privacy worker purge/claim functions cover relational sinks; no executor records Qdrant erase into privacy_record_deletion_receipt',
  },
  {
    id: 'RECEIPT_SHAPE_MISMATCH',
    detail:
      'QdrantErasureReceipt {id,collection,deleted_count,at,…} ≠ PrivacyDeletionReceipt {targetId,receiptKind,receiptHash} / 0091 columns',
  },
  {
    id: 'EXTERNAL_CONFIRM_MISSING',
    detail:
      'Even as external sink, no async confirm path to advance external_pending→external_confirmed for Qdrant',
  },
]);

export interface LedgerWriteReadiness {
  writable: false;
  reason: 'product_ledger_not_writable_for_qdrant';
  prereqs: readonly LedgerWritePrereq[];
  releaseEvidence: false;
  alignedWith0091: false;
  publicDeleteOpen: false;
}

/** Always fail-closed today: product ledger is not writable for Qdrant. */
export function assertQdrantLedgerNotWritable(): LedgerWriteReadiness {
  if (LEDGER_WRITE_PREREQS.length === 0) {
    throw new Error('qdrant_ledger_prereq_list_empty_illegal');
  }
  return {
    writable: false,
    reason: 'product_ledger_not_writable_for_qdrant',
    prereqs: LEDGER_WRITE_PREREQS,
    releaseEvidence: false,
    alignedWith0091: false,
    publicDeleteOpen: false,
  };
}

/**
 * Derive a *candidate* receipt_hash material from a P15 prototype receipt.
 * Proves partial mapping for receipt_hash ONLY — must NOT be passed to
 * privacy_record_deletion_receipt (no request/target; not product write).
 */
export function deriveCandidateReceiptHash(receipt: QdrantErasureReceipt): string {
  const canonical = [
    'meetwise-qdrant-erasure-proto-v1',
    receipt.id,
    receipt.collection,
    String(receipt.deleted_count),
    receipt.at,
    receipt.batch_digest ?? '',
    receipt.subject_id ?? '',
  ].join('\n');
  return createHash('sha256').update(canonical, 'utf8').digest('hex');
}

export interface PrototypeToLedgerMapResult {
  /** Always true: mapping exists as documentation/candidate only. */
  mapped: true;
  /** Always true until PREREQs clear: must not write. */
  writeBlocked: true;
  candidateReceiptHash: string;
  /** Fields that remain blocked / unmapped for a real 0091 row. */
  missingLedgerFields: string[];
  prereqs: readonly LedgerWritePrereq[];
  /** Explicit non-claims. */
  claims: {
    isPrivacyDeletionReceipt: false;
    is0091LedgerAligned: false;
    publicDeleteStatus: 503;
    releaseEvidence: false;
  };
}

/**
 * Map a P15 prototype receipt toward 0091 shape — fail-closed for write.
 * Never invents request_id / target_id / receipt_kind.
 */
export function mapPrototypeReceiptToward0091(
  receipt: QdrantErasureReceipt,
): PrototypeToLedgerMapResult {
  const readiness = assertQdrantLedgerNotWritable();
  const missingLedgerFields = RECEIPT_FIELD_MAP
    .filter((e) => e.status === 'blocked' || e.status === 'unmapped')
    .filter((e) => !e.ledgerField.startsWith('('))
    .map((e) => e.ledgerField);
  return {
    mapped: true,
    writeBlocked: true,
    candidateReceiptHash: deriveCandidateReceiptHash(receipt),
    missingLedgerFields: [...new Set(missingLedgerFields)],
    prereqs: readiness.prereqs,
    claims: {
      isPrivacyDeletionReceipt: false,
      is0091LedgerAligned: false,
      publicDeleteStatus: 503,
      releaseEvidence: false,
    },
  };
}

/** Summarize map coverage for proves / harness. */
export function summarizeReceiptFieldMap(): {
  total: number;
  mapped: number;
  partial: number;
  unmapped: number;
  blocked: number;
} {
  const counts = { total: RECEIPT_FIELD_MAP.length, mapped: 0, partial: 0, unmapped: 0, blocked: 0 };
  for (const e of RECEIPT_FIELD_MAP) {
    counts[e.status] += 1;
  }
  return counts;
}
