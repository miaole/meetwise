/**
 * Dedicated PostgreSQL privacy-erasure executor (checkpoint + 0096 interview
 * projection purge + 0232 fenced interview_job residue).  It receives only target
 * IDs and owners from a reviewed dispatch function; locators and checkpoint
 * content never leave the database procedure boundary or enter logs.
 */
import { createHash } from 'node:crypto';
import {
  asPrivacyWorkerExecutor, asPrivacyWorkerPrincipal, claimAuthorizationTarget, claimCheckpointErasureTarget,
  listClaimableCheckpointErasureTargets, listClaimableInterviewProjectionTargets, purgeCheckpointErasureTarget,
  purgeFencedInterviewJobResidue, purgeInterviewProjectionTarget, recordDeletionReceipt,
  resolveInterviewProjectionTargetConsumedJti, runVectorPlaneErasureTick, type Client, type DbPool,
} from '@meetwise/db';
import { runDrainLoop } from './drain-loop.ts';

export async function checkpointPrivacyErasureTick(pool: DbPool, workerId: string): Promise<{ claimed: number; erased: number }> {
  const targets = await asPrivacyWorkerExecutor(pool, (c) => listClaimableCheckpointErasureTargets(c));
  let claimed = 0;
  let erased = 0;
  for (const target of targets) {
    try {
      const claim = await asPrivacyWorkerPrincipal(pool, target.ownerUserId, (c) =>
        claimCheckpointErasureTarget(c, target.targetId, workerId));
      if (!claim) continue;
      claimed++;
      await asPrivacyWorkerPrincipal(pool, target.ownerUserId, (c) =>
        purgeCheckpointErasureTarget(c, claim.targetId, claim.leaseToken));
      erased++;
    } catch (error: unknown) {
      // Target identifiers, owner values, source records and error detail can
      // all become privacy metadata.  Emit only a stable class for operations.
      const code = typeof error === 'object' && error && 'code' in error && typeof error.code === 'string'
        ? error.code : 'privacy_erasure_target_failed';
      console.error(`checkpoint privacy erasure target failed: ${code}`);
    }
  }
  return { claimed, erased };
}

function stableErrorCode(error: unknown, fallback: string): string {
  return typeof error === 'object' && error && 'code' in error && typeof error.code === 'string' ? error.code : fallback;
}

/**
 * 0232 B · 投影物理 purge 步（event/ai_graph_run/report · 0096 函数原样复用）：0096 feed →
 * 0232 已消费授权 jti feed（缺失即跳过：无授权不删）→ 0091 冻结 claim（十项复核，唯一授权
 * 裁定者）→ 0096 purge（残留≠0 raise）→ 0091 local_erased 收据。单 target 失败只记稳定错误类，
 * 不中断其余 target（target id/owner/错误细节都可能成为隐私元数据，不入日志）。
 */
export async function interviewProjectionPrivacyErasureTick(
  pool: DbPool, workerId: string, maxItems = 32,
): Promise<{ claimed: number; erased: number; receipted: number; skippedUnauthorized: number }> {
  const targets = await asPrivacyWorkerExecutor(pool, (c) => listClaimableInterviewProjectionTargets(c, maxItems));
  let claimed = 0;
  let erased = 0;
  let receipted = 0;
  let skippedUnauthorized = 0;
  for (const target of targets) {
    try {
      const jti = await asPrivacyWorkerExecutor(pool, (c) => resolveInterviewProjectionTargetConsumedJti(c, target.targetId));
      if (!jti) { skippedUnauthorized++; continue; }
      const claim = await asPrivacyWorkerPrincipal(pool, target.ownerUserId, (c) =>
        claimAuthorizationTarget(c, jti, target.targetId, workerId));
      if (!claim) continue;
      claimed++;
      const purged = await asPrivacyWorkerPrincipal(pool, target.ownerUserId, (c) =>
        purgeInterviewProjectionTarget(c, claim.targetId, claim.leaseToken));
      erased++;
      await asPrivacyWorkerPrincipal(pool, target.ownerUserId, (c) =>
        recordDeletionReceipt(
          c, claim.targetId, 'local_erased',
          createHash('sha256').update(`${claim.targetId}:interview_projection:local_erased:${purged.deletedCount}`).digest('hex'),
          workerId,
        ));
      receipted++;
    } catch (error: unknown) {
      console.error(`interview projection privacy erasure target failed: ${stableErrorCode(error, 'interview_projection_erasure_target_failed')}`);
    }
  }
  return { claimed, erased, receipted, skippedUnauthorized };
}

/** 0232 A2 · 已围栏面试 interview_job 残留明文物理删除步（只回计数）。 */
export async function fencedInterviewJobResidueTick(pool: DbPool, maxItems = 64): Promise<{ deleted: number }> {
  const deleted = await asPrivacyWorkerExecutor(pool, (c) => purgeFencedInterviewJobResidue(c, maxItems));
  return { deleted };
}

/**
 * 生产 privacy 擦除循环一拍：checkpoint 擦除 → 投影物理 purge → interview_job 残留清除。
 * 三步互相隔离：任一步整步失败不阻断其余步，但本拍最终仍抛出（drain-loop ready() 照常翻红）。
 */
export async function privacyErasureSweepTick(pool: DbPool, workerId: string): Promise<{
  checkpoint: { claimed: number; erased: number };
  projection: { claimed: number; erased: number; receipted: number; skippedUnauthorized: number };
  jobResidue: { deleted: number };
}> {
  const [checkpoint, projection, jobResidue] = await Promise.allSettled([
    checkpointPrivacyErasureTick(pool, workerId),
    interviewProjectionPrivacyErasureTick(pool, workerId),
    fencedInterviewJobResidueTick(pool),
  ]);
  const failed = [checkpoint, projection, jobResidue].find((r): r is PromiseRejectedResult => r.status === 'rejected');
  if (failed) {
    console.error(`privacy erasure sweep step failed: ${stableErrorCode(failed.reason, 'privacy_erasure_step_failed')}`);
    throw failed.reason;
  }
  return {
    checkpoint: (checkpoint as PromiseFulfilledResult<{ claimed: number; erased: number }>).value,
    projection: (projection as PromiseFulfilledResult<{ claimed: number; erased: number; receipted: number; skippedUnauthorized: number }>).value,
    jobResidue: (jobResidue as PromiseFulfilledResult<{ deleted: number }>).value,
  };
}

export function runCheckpointPrivacyEraser(pool: DbPool, workerId: string, intervalMs = 5_000) {
  return runDrainLoop(() => privacyErasureSweepTick(pool, workerId).then(() => undefined), intervalMs);
}

/**
 * 0141 · GAP-PRIV-04 向量面 sweep 步（0125 memory_vector_chunk 同形收尾）：0141 feed →
 * consumed-jti feed → 0125 claim（十项 fail-closed 原样，唯一授权裁定者）→ 物理 purge
 * （残留≠0 raise）→ 0091 既有 privacy_record_deletion_receipt 落 local_erased。
 * target 集先钉：仅 sink='memory_vector_chunk'；INT sink='vector' 诚实 no-target；
 * qbank 永不删；本地行级证据 ≠ 云端彻底删除；公开删除面：interview 保持 503 关闭 · resume/account DELETE=202 软删受理(purge_pending)。
 */
export async function vectorPlanePrivacyErasureTick(
  pool: DbPool, workerId: string,
): Promise<{ claimed: number; erased: number; receipted: number; skippedUnauthorized: number }> {
  return runVectorPlaneErasureTick({
    asExecutor: <T>(fn: (c: Client) => Promise<T>) => asPrivacyWorkerExecutor(pool, fn),
    asWorkerPrincipal: <T>(owner: string, fn: (c: Client) => Promise<T>) => asPrivacyWorkerPrincipal(pool, owner, fn),
    workerId,
  });
}

export function runVectorPlanePrivacyEraser(pool: DbPool, workerId: string, intervalMs = 5_000) {
  return runDrainLoop(() => vectorPlanePrivacyErasureTick(pool, workerId).then(() => undefined), intervalMs);
}
