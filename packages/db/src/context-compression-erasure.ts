/**
 * @meetwise/db · 撤回、过期和删除（CTX-06）存储侧：压缩轨道删除 sink 闭合。
 *
 * 这是 CTX-04（0115 压缩快照）/ CTX-05（0117 压缩派发）两处删除孤儿的纯数据访问层：为
 * `context_compression_snapshot` + `context_compression_dispatch` 补齐账户删除等价 sweep
 * （begin fence → 受约束 claim → 物理 purge → 删后 read=0 + 逐 sink receipt）。
 *
 * **绝不重实现**删除根（冻结 PrivacyAuthorizationIssuer 在 privacy-authorization.ts；签/验/账本
 * 由 0047/0091 冻结迁移提供）：本层只包压缩自己的 begin/claim/purge 解析器，镜像 0111 的 CTX
 * 事件源包壳。
 *
 * 两条 sink 语义（如实登记，不伪删）：
 *   - `context_compression_snapshot`：有 fenced/purged 状态 → 完整 fence→purge→物理 DELETE。
 *   - `context_compression_dispatch`：无 fenced/purged 状态 → 不 fence、purge=纯物理 DELETE。
 */
import type { Client } from './principal.ts';

function fail(code: string): never { throw Object.assign(new Error(code), { code }); }

export interface CompressionErasureTarget { sink: string; resourceHmac: string }
export interface BegunCompressionErasure {
  requestId: string;
  requestStatus: string;
  privacyEpoch: number;
  targetSetDigest: string;
  targets: CompressionErasureTarget[];
  replayed: boolean;
}

/**
 * 发起账户级压缩删除（等价 sweep，与 memory_begin_account_erasure / conversation_event_begin_
 * erasure 并列，各自分账本）：同步 fence snapshot draft/active/superseded→fenced（cas_version+1）
 * → 建 account_data request → 枚举 2 个压缩 sink target → 就地算 target_set_digest → request→
 * fenced。**不 fence dispatch**（无 fenced 状态）。幂等：同 owner 同 idempotency_key_hash 重放
 * 返回既有 2 行。返回的 targetSetDigest 必须与调用方 `canonicalTargetSetDigest(targets)` 相等，
 * 供签发快照。
 */
export async function beginCompressionErasure(
  c: Client, idempotencyKeyHash: string,
): Promise<BegunCompressionErasure> {
  const r = await c.query<{
    request_id: string; request_status: string; privacy_epoch: string | number;
    target_set_digest: string; sink: string; resource_hmac: string; replayed: boolean;
  }>('SELECT * FROM context_compression_begin_erasure($1)', [idempotencyKeyHash]);
  if (r.rowCount === 0) fail('compression_begin_erasure_failed');
  const first = r.rows[0]!;
  const privacyEpoch = Number(first.privacy_epoch);
  if (!Number.isSafeInteger(privacyEpoch) || privacyEpoch < 1) fail('compression_begin_erasure_failed');
  return {
    requestId: first.request_id,
    requestStatus: first.request_status,
    privacyEpoch,
    targetSetDigest: first.target_set_digest,
    targets: r.rows.map((row) => ({ sink: row.sink, resourceHmac: row.resource_hmac })),
    replayed: first.replayed === true,
  };
}

export interface ClaimedCompressionTarget { targetId: string; leaseToken: string; attempt: number }

/**
 * 在已消费快照下受约束地租用压缩删除目标（scope=account_data +
 * purpose=account_data_erasure + sink∈{context_compression_snapshot,context_compression_dispatch}
 * + 活 digest 重验）。安全违规抛错；业务不可租/已 erased 返回 null。
 */
export async function claimCompressionTarget(
  c: Client, jti: string, targetId: string, worker: string, leaseSeconds = 60,
): Promise<ClaimedCompressionTarget | null> {
  const r = await c.query<{ target_id: string; lease_token: string | null; status: string; attempt: number }>(
    'SELECT * FROM privacy_authorization_claim_compression_target($1,$2,$3,$4)', [jti, targetId, worker, leaseSeconds],
  );
  const row = r.rows[0];
  if (!row || row.status === 'erased') return null;
  if (!row.lease_token || !Number.isSafeInteger(Number(row.attempt)))
    fail('compression_target_claim_invalid');
  return { targetId: row.target_id, leaseToken: row.lease_token, attempt: Number(row.attempt) };
}

export interface PurgedCompressionTarget { targetId: string; status: string; deletedCount: number; requestStatus: string }

/**
 * 删除侧物理清除：snapshot 先正向跃迁 fenced→purged 再物理 DELETE；dispatch 纯物理 DELETE。
 * 残留=0 校验（未知 locator/残留≠0 一律 fail-closed 抛错）。
 */
export async function purgeCompressionTarget(c: Client, targetId: string, token: string): Promise<PurgedCompressionTarget> {
  const r = await c.query<{ target_id: string; status: string; deleted_count: string | number; request_status: string }>(
    'SELECT * FROM privacy_purge_compression_target($1,$2)', [targetId, token],
  );
  const row = r.rows[0];
  if (!row?.target_id) fail('compression_target_purge_failed');
  return { targetId: row.target_id, status: row.status, deletedCount: Number(row.deleted_count), requestStatus: row.request_status };
}
