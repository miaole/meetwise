/**
 * @meetwise/db · GAP-PRIV-04 向量面擦除 sweep（0141 · 0125 memory_vector_chunk 同形收尾）。
 *
 * target 集先钉（PRE dual C-P4-2 / C-EH-3 裁定）：
 *   - 物理删除 target 仅 sink='memory_vector_chunk'（0125 begin/claim/purge 全链复用，
 *     owner+kind='memory' 双谓词，残留≠0 fail-closed 55000）；
 *   - INT sink='vector' 无 interview 作用域键 → 诚实不建 target（本模块不提供、也不假造
 *     面试作用域键；claim 层对 sink≠'memory_vector_chunk' 一律 42501）；
 *   - kind='qbank'/共享语料永不删（0141 fence 只拦 kind='memory'）。
 *
 * 候选 C 收尾：purge 成功后经 0091 既有 privacy_record_deletion_receipt 落 local_erased
 *   收据（receipt_kind/函数/completed guard 全复用 · 0091 零语义改动）。
 *
 * 授权链：0125 claim 函数是唯一授权裁定者（issuer/consumed/expiry/owner/purpose+scope/
 *   sink/subject/epoch+digest/drift 十项 fail-closed 原样继承）。0141 的 consumed-jti
 *   feed 只做只读解析；解析缺失 → sweep 跳过（无授权不删），解析错 → claim 42501。
 *
 * 诚实披露（沿 AR 口径）：本地隔离 PG 行级证据 ≠ 生产云端彻底删除；HNSW 索引内部页 /
 *   WAL / 备份 / 副本不在行级证据面；Ban「数据已彻底删除/磁盘字节清零」叙事；
 *   releaseEvidence=false；公开删除面：interview 保持 503 关闭 · resume/account DELETE=202 软删受理(purge_pending)；本 sweep completed ≠ 账户删除完成。
 */
import { createHash } from 'node:crypto';
import type { Client } from './principal.ts';
import {
  claimMemoryVectorChunkTarget,
  purgeMemoryVectorChunkTarget,
} from './memory-vector-chunk-erasure.ts';
import { recordDeletionReceipt } from './privacy-authorization.ts';

function fail(code: string): never { throw Object.assign(new Error(code), { code }); }

export interface VectorChunkErasureFeedItem { targetId: string; ownerUserId: string }

/** 0141 dispatch feed（0048 checkpoint 同形：只出 target id + owner，不含 locator/内容）。 */
export async function listClaimableVectorChunkTargets(
  c: Client, maxItems = 32,
): Promise<VectorChunkErasureFeedItem[]> {
  const r = await c.query<{ target_id: string; owner_user_id: string }>(
    'SELECT * FROM privacy_list_claimable_vector_chunk_targets($1)', [maxItems],
  );
  return r.rows
    .filter((row) => typeof row.target_id === 'string' && typeof row.owner_user_id === 'string')
    .map((row) => ({ targetId: row.target_id, ownerUserId: row.owner_user_id }));
}

/**
 * 0141 只读 jti feed：按 request 的 (owner, epoch, digest) 找已消费 snapshot 的 jti，
 * 交 0125 claim 十项链复核。无已消费授权 → null（调用方必须跳过，无授权不删）。
 */
export async function resolveVectorChunkTargetConsumedJti(c: Client, targetId: string): Promise<string | null> {
  const r = await c.query<{ privacy_vector_chunk_target_consumed_jti: string | null }>(
    'SELECT privacy_vector_chunk_target_consumed_jti($1::uuid) AS privacy_vector_chunk_target_consumed_jti',
    [targetId],
  );
  const jti = r.rows[0]?.privacy_vector_chunk_target_consumed_jti;
  return typeof jti === 'string' && jti.length > 0 ? jti : null;
}

/**
 * 候选 C：向量面 local_erased 收据（0091 既有 privacy_record_deletion_receipt 原样复用；
 * receipt_hash = targetId:vector_plane:local_erased:deletedCount 的 SHA-256，可复算审计）。
 */
export async function recordVectorPlaneLocalErasedReceipt(
  c: Client, targetId: string, deletedCount: number, recordedBy: string,
): Promise<string> {
  if (!Number.isSafeInteger(deletedCount) || deletedCount < 0) fail('vector_plane_receipt_invalid');
  return recordDeletionReceipt(
    c, targetId, 'local_erased',
    createHash('sha256').update(`${targetId}:vector_plane:local_erased:${deletedCount}`).digest('hex'),
    recordedBy,
  );
}

export interface VectorPlaneErasureTickDeps {
  /** executor 身份：0141 两个 feed 函数只对 privacy_worker_executor 开放。 */
  asExecutor: <T>(fn: (c: Client) => Promise<T>) => Promise<T>;
  /** owner-scoped worker 主身份：claim/purge/receipt 都经 principal GUC 绑 owner。 */
  asWorkerPrincipal: <T>(owner: string, fn: (c: Client) => Promise<T>) => Promise<T>;
  workerId: string;
  maxItems?: number;
}

export interface VectorPlaneErasureTickResult {
  claimed: number;
  erased: number;
  receipted: number;
  /** 无已消费授权而诚实跳过的 target 数（fail-closed：无授权不删）。 */
  skippedUnauthorized: number;
}

/**
 * 产品 sweep 步（0125 同形收尾）：feed → jti feed → owner-scoped claim（十项 fail-closed
 * 链原样，唯一授权裁定者）→ 物理 purge（残留≠0 raise）→ 0091 local_erased receipt。
 * 单 target 失败只记稳定错误类（target id/owner/错误细节都可能成为隐私元数据，不入
 * 日志），不中断其余目标。
 */
export async function runVectorPlaneErasureTick(deps: VectorPlaneErasureTickDeps): Promise<VectorPlaneErasureTickResult> {
  const { asExecutor, asWorkerPrincipal, workerId } = deps;
  const maxItems = deps.maxItems ?? 32;
  const feed = await asExecutor((c) => listClaimableVectorChunkTargets(c, maxItems));
  let claimed = 0;
  let erased = 0;
  let receipted = 0;
  let skippedUnauthorized = 0;
  for (const item of feed) {
    try {
      const jti = await asExecutor((c) => resolveVectorChunkTargetConsumedJti(c, item.targetId));
      if (!jti) { skippedUnauthorized++; continue; }
      const claim = await asWorkerPrincipal(item.ownerUserId, (c) =>
        claimMemoryVectorChunkTarget(c, jti, item.targetId, workerId));
      if (!claim) continue;
      claimed++;
      const purged = await asWorkerPrincipal(item.ownerUserId, (c) =>
        purgeMemoryVectorChunkTarget(c, claim.targetId, claim.leaseToken));
      erased++;
      await asWorkerPrincipal(item.ownerUserId, (c) =>
        recordVectorPlaneLocalErasedReceipt(c, claim.targetId, purged.deletedCount, workerId));
      receipted++;
    } catch (error: unknown) {
      const code = typeof error === 'object' && error && 'code' in error && typeof error.code === 'string'
        ? error.code : 'vector_plane_erasure_target_failed';
      console.error(`vector plane erasure target failed: ${code}`);
    }
  }
  return { claimed, erased, receipted, skippedUnauthorized };
}
