/**
 * Line AR · GAP-PRIV-EXTERNAL-SINK async purge real path (local isolated stub).
 *
 * N1 evidence classes (pinned · Ban invent · Ban OSS-only shrink):
 *   oss      → oss_delete_list_empty_local_stub
 *   redis    → redis_del_exists_empty_local_stub
 *   langfuse → langfuse_retention_delete_replica_local_stub
 * environment_class = local_isolated_stub ONLY · stub ≠ cloud vendor deleted
 * (:64 stays OPEN · Ban buy cloud · Ban secrets · NB-3).
 *
 * N3 wiring: confirmer writes external_pending AFTER vendor evidence, THEN resolve.
 * N2: resolve is gated in 0140 SQL (vendor evidence required for externals).
 *
 * Ban count-as-erased · Ban forge receipt · Ban open DELETE · UC-052 partial.
 */
import { createHash } from 'node:crypto';
import type { Client } from './principal.ts';
import { recordDeletionReceipt, resolveDeletionReceipt } from './privacy-authorization.ts';

export const EXTERNAL_ASYNC_PURGE_SINKS = ['oss', 'redis', 'langfuse'] as const;
export type ExternalAsyncPurgeSink = (typeof EXTERNAL_ASYNC_PURGE_SINKS)[number];

/** N1 pinned evidence classes — must match 0140 CHECK. */
export const EVIDENCE_CLASS_BY_SINK: Record<ExternalAsyncPurgeSink, string> = {
  oss: 'oss_delete_list_empty_local_stub',
  redis: 'redis_del_exists_empty_local_stub',
  langfuse: 'langfuse_retention_delete_replica_local_stub',
};

export const ENVIRONMENT_CLASS = 'local_isolated_stub' as const;

export type StubVendorMode = 'ok' | 'refuse' | 'timeout' | 'partial_skip';

export interface LocalStubVendorSurface {
  seedInterview(interviewId: string): void;
  purge(sink: ExternalAsyncPurgeSink, interviewId: string): {
    ok: boolean;
    reason?: string;
    vendorOperation: string;
    verifiedAbsent: boolean;
    residualCount: number;
  };
  residual(sink: ExternalAsyncPurgeSink, interviewId: string): number;
}

/** In-process stub · Ban live OSS/Redis/Langfuse · Ban secrets. */
export function createLocalStubVendorSurface(mode: StubVendorMode = 'ok'): LocalStubVendorSurface {
  const oss = new Map<string, string>();
  const redis = new Map<string, string>();
  const langfuse = new Map<string, string>();
  const refused = new Set<ExternalAsyncPurgeSink>();

  const keyFor = (interviewId: string, sink: ExternalAsyncPurgeSink) => `${sink}:${interviewId}`;

  return {
    seedInterview(interviewId: string) {
      oss.set(keyFor(interviewId, 'oss'), `object:${interviewId}`);
      redis.set(keyFor(interviewId, 'redis'), `cache:${interviewId}`);
      langfuse.set(keyFor(interviewId, 'langfuse'), `trace:${interviewId}`);
      if (mode === 'partial_skip') refused.add('langfuse');
      if (mode === 'refuse') {
        refused.add('oss');
        refused.add('redis');
        refused.add('langfuse');
      }
    },
    residual(sink, interviewId) {
      const k = keyFor(interviewId, sink);
      if (sink === 'oss') return oss.has(k) ? 1 : 0;
      if (sink === 'redis') return redis.has(k) ? 1 : 0;
      return langfuse.has(k) ? 1 : 0;
    },
    purge(sink, interviewId) {
      if (mode === 'timeout') {
        return {
          ok: false,
          reason: 'vendor_timeout',
          vendorOperation: `${sink}:timeout`,
          verifiedAbsent: false,
          residualCount: this.residual(sink, interviewId),
        };
      }
      if (refused.has(sink)) {
        return {
          ok: false,
          reason: 'vendor_refuse',
          vendorOperation: `${sink}:refuse`,
          verifiedAbsent: false,
          residualCount: this.residual(sink, interviewId),
        };
      }
      const k = keyFor(interviewId, sink);
      if (sink === 'oss') {
        oss.delete(k);
        const residualCount = [...oss.keys()].filter((x) => x.endsWith(`:${interviewId}`)).length;
        return {
          ok: residualCount === 0,
          vendorOperation: 'deleteObject+listEmpty',
          verifiedAbsent: residualCount === 0,
          residualCount,
          reason: residualCount === 0 ? undefined : 'oss_list_not_empty',
        };
      }
      if (sink === 'redis') {
        redis.delete(k);
        const residualCount = [...redis.keys()].filter((x) => x.endsWith(`:${interviewId}`)).length;
        return {
          ok: residualCount === 0,
          vendorOperation: 'DEL+EXISTS_empty',
          verifiedAbsent: residualCount === 0,
          residualCount,
          reason: residualCount === 0 ? undefined : 'redis_exists_nonzero',
        };
      }
      langfuse.delete(k);
      const residualCount = [...langfuse.keys()].filter((x) => x.endsWith(`:${interviewId}`)).length;
      return {
        ok: residualCount === 0,
        vendorOperation: 'retentionDelete+replicaProof',
        verifiedAbsent: residualCount === 0,
        residualCount,
        reason: residualCount === 0 ? undefined : 'langfuse_replica_present',
      };
    },
  };
}

export interface ExternalTargetRef {
  sink: ExternalAsyncPurgeSink;
  targetId: string;
}

export interface AsyncPurgeSinkResult {
  sink: ExternalAsyncPurgeSink;
  targetId: string;
  ok: boolean;
  stage: 'vendor_purge' | 'evidence' | 'external_pending' | 'resolve' | 'erased' | 'failed_cleanup' | 'skipped';
  evidenceClass?: string;
  evidenceId?: string;
  requestStatus?: string;
  reason?: string;
}

export interface AsyncPurgeConfirmResult {
  requestId: string;
  requestStatus: string;
  environmentClass: typeof ENVIRONMENT_CLASS;
  cloudVendorDeleted: false;
  gap64Open: true;
  sinks: AsyncPurgeSinkResult[];
  allExternalErased: boolean;
}

function evidenceHash(parts: string[]): string {
  return createHash('sha256').update(parts.join('|')).digest('hex');
}

export async function recordVendorPurgeEvidence(
  c: Client,
  targetId: string,
  evidenceClass: string,
  evidenceHashValue: string,
  vendorOperation: string,
  recordedBy: string,
): Promise<string> {
  const r = await c.query<{ privacy_record_vendor_purge_evidence: string }>(
    'SELECT privacy_record_vendor_purge_evidence($1::uuid,$2,$3,$4,true,$5) AS privacy_record_vendor_purge_evidence',
    [targetId, evidenceClass, evidenceHashValue, vendorOperation, recordedBy],
  );
  const id = r.rows[0]?.privacy_record_vendor_purge_evidence;
  if (!id) throw Object.assign(new Error('privacy_vendor_evidence_write_failed'), { code: 'privacy_vendor_evidence_write_failed' });
  return id;
}

export async function applyExternalSinkErasedWithVendorEvidence(
  c: Client,
  targetId: string,
  recordedBy: string,
): Promise<string> {
  const r = await c.query<{ privacy_apply_external_sink_erased_with_vendor_evidence: string }>(
    'SELECT privacy_apply_external_sink_erased_with_vendor_evidence($1::uuid,$2) AS privacy_apply_external_sink_erased_with_vendor_evidence',
    [targetId, recordedBy],
  );
  const status = r.rows[0]?.privacy_apply_external_sink_erased_with_vendor_evidence;
  if (!status) throw Object.assign(new Error('privacy_external_erase_failed'), { code: 'privacy_external_erase_failed' });
  return status;
}

/**
 * N3 confirmer path for one request's external sinks (all three · Ban OSS-only shrink).
 * Order: vendor purge → evidence → external_pending → resolve (N2-gated) → erased.
 * Partial/timeout/refuse → failed_cleanup on that sink · request must NOT completed.
 */
export async function runExternalSinkAsyncPurgeConfirm(input: {
  asWorker: <T>(fn: (c: Client) => Promise<T>) => Promise<T>;
  requestId: string;
  interviewId: string;
  externals: ExternalTargetRef[];
  workerId: string;
  vendor: LocalStubVendorSurface;
  /** When set, only process these sinks (prove partial). Default = all three. */
  onlySinks?: ExternalAsyncPurgeSink[];
}): Promise<AsyncPurgeConfirmResult> {
  const { asWorker, requestId, interviewId, externals, workerId, vendor } = input;
  const allow = new Set(input.onlySinks ?? [...EXTERNAL_ASYNC_PURGE_SINKS]);
  const sinks: AsyncPurgeSinkResult[] = [];

  // Ban OSS-only shrink on the product path: require all three present unless prove opts into onlySinks.
  if (!input.onlySinks) {
    for (const s of EXTERNAL_ASYNC_PURGE_SINKS) {
      if (!externals.some((e) => e.sink === s)) {
        throw Object.assign(new Error(`async_purge_missing_external_sink:${s}`), { code: 'async_purge_missing_external_sink' });
      }
    }
  }

  for (const sinkName of EXTERNAL_ASYNC_PURGE_SINKS) {
    const ref = externals.find((e) => e.sink === sinkName);
    if (!ref || !allow.has(sinkName)) {
      if (ref) sinks.push({ sink: sinkName, targetId: ref.targetId, ok: false, stage: 'skipped', reason: 'not_in_onlySinks' });
      continue;
    }

    const purge = vendor.purge(sinkName, interviewId);
    if (!purge.ok || !purge.verifiedAbsent) {
      await asWorker(async (c) => {
        await recordDeletionReceipt(
          c, ref.targetId, 'failed_cleanup',
          evidenceHash([requestId, ref.targetId, 'failed_cleanup', purge.reason ?? 'vendor_fail']),
          workerId,
        );
      });
      sinks.push({
        sink: sinkName, targetId: ref.targetId, ok: false, stage: 'failed_cleanup',
        reason: purge.reason ?? 'vendor_purge_failed',
      });
      continue;
    }

    const evidenceClass = EVIDENCE_CLASS_BY_SINK[sinkName];
    const hash = evidenceHash([
      requestId, ref.targetId, evidenceClass, purge.vendorOperation, ENVIRONMENT_CLASS, 'verified_absent',
    ]);

    const one = await asWorker(async (c) => {
      const evidenceId = await recordVendorPurgeEvidence(
        c, ref.targetId, evidenceClass, hash, purge.vendorOperation, workerId,
      );
      // N3: confirmer writes external_pending AFTER evidence, before resolve.
      await recordDeletionReceipt(
        c, ref.targetId, 'external_pending',
        evidenceHash([requestId, ref.targetId, 'external_pending', evidenceId]),
        workerId,
      );
      // Erase before resolve so last sink's resolve can promote completed under 0091+0140 guards.
      const erasedStatus = await applyExternalSinkErasedWithVendorEvidence(c, ref.targetId, workerId);
      const resolved = await resolveDeletionReceipt(c, ref.targetId, workerId);
      return {
        evidenceId,
        requestStatus: resolved.requestStatus,
        erasedStatus,
      };
    });

    sinks.push({
      sink: sinkName,
      targetId: ref.targetId,
      ok: one.erasedStatus === 'erased',
      stage: 'erased',
      evidenceClass,
      evidenceId: one.evidenceId,
      requestStatus: one.requestStatus,
    });
  }

  const statusRow = await asWorker(async (c) => {
    // Reassess after last erase (resolve may have run before erase on earlier sinks).
    await c.query(
      `UPDATE privacy_erasure_request r
          SET status = CASE
            WHEN EXISTS (SELECT 1 FROM privacy_deletion_target t WHERE t.request_id=r.id AND t.status='failed') THEN 'partial_failed'
            WHEN EXISTS (SELECT 1 FROM privacy_deletion_receipt rc WHERE rc.request_id=r.id AND rc.receipt_kind='failed_cleanup') THEN 'pending_external'
            WHEN EXISTS (SELECT 1 FROM privacy_deletion_target t WHERE t.request_id=r.id AND t.status='retention_pending') THEN 'pending_external'
            WHEN EXISTS (SELECT 1 FROM privacy_deletion_target t WHERE t.request_id=r.id AND t.status <> 'erased') THEN 'purging'
            WHEN EXISTS (SELECT 1 FROM privacy_deletion_receipt rc WHERE rc.request_id=r.id AND rc.receipt_kind IN ('external_pending','failed_cleanup')) THEN 'pending_external'
            ELSE 'completed'
          END,
          version = version + 1,
          updated_at = now()
        WHERE r.id = $1::uuid
          AND r.status IN ('fenced','purging','pending_external')`,
      [requestId],
    );
    const s = await c.query<{ status: string }>(
      `SELECT status FROM privacy_erasure_request WHERE id=$1::uuid`, [requestId],
    );
    return s.rows[0]?.status ?? 'missing';
  });

  const allExternalErased = EXTERNAL_ASYNC_PURGE_SINKS.every((s) => {
    const row = sinks.find((x) => x.sink === s);
    return row?.ok === true && row.stage === 'erased';
  });

  return {
    requestId,
    requestStatus: statusRow,
    environmentClass: ENVIRONMENT_CLASS,
    cloudVendorDeleted: false,
    gap64Open: true,
    sinks,
    allExternalErased,
  };
}
