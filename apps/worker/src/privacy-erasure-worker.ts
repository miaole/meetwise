/**
 * Dedicated PostgreSQL checkpoint-erasure executor.  It receives only target
 * IDs and owners from a reviewed dispatch function; locators and checkpoint
 * content never leave the database procedure boundary or enter logs.
 */
import {
  asPrivacyWorkerExecutor, asPrivacyWorkerPrincipal, claimCheckpointErasureTarget,
  listClaimableCheckpointErasureTargets, purgeCheckpointErasureTarget,
  runVectorPlaneErasureTick, type Client, type DbPool,
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

export function runCheckpointPrivacyEraser(pool: DbPool, workerId: string, intervalMs = 5_000) {
  return runDrainLoop(() => checkpointPrivacyErasureTick(pool, workerId).then(() => undefined), intervalMs);
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
