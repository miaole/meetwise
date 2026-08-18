import type { Client } from './principal.ts';
import type { VerifiedPrivacyAuthorization } from '@meetwise/domain';

/**
 * PrivacyAuthorizationIssuer 的数据库操作层（INT-TRANSCRIPT-00 原语）。
 *
 * 这里只承载“已验签快照的账本 + 单次消费 + 受约束 claim + 逐 sink receipt”四条
 * 承重路径；真正的 ECDSA P-256 签/验在 packages/domain（私钥永不进 SQL）。调用方
 * （deleter）必须先把快照验签通过，再持 jti 走 consume/claim；所有 owner/scope/
 * epoch/digest 都从账本与快照比对，绝不接受调用方自报（防伪造）。
 */

export interface IssueAuthorizationSnapshotInput {
  jti: string;
  keyId: string;
  actor: string;
  interviewId: string;
  purpose: 'interview_data_erasure' | 'resume_data_erasure' | 'account_data_erasure';
  privacyEpoch: number;
  targetSetDigest: string;
  /** 与签名快照的 exp 对齐（timestamptz）。 */
  expiresAt: Date;
}

export interface IssuedAuthorizationSnapshot {
  snapshotId: string;
  ownerUserId: string;
  issuedAt: Date;
}

/** 记录已验签快照（owner 恒等于已认证 principal，调用方无法自报）。EXECUTE 仅授 privacy_issuer。 */
export async function issueAuthorizationSnapshot(
  c: Client, input: IssueAuthorizationSnapshotInput,
): Promise<IssuedAuthorizationSnapshot> {
  const result = await c.query<{ snapshot_id: string; owner_user_id: string; issued_at: Date }>(
    'SELECT * FROM privacy_issue_authorization_snapshot($1,$2,$3,$4,$5,$6,$7,$8)',
    [input.jti, input.keyId, input.actor, input.interviewId, input.purpose,
      input.privacyEpoch, input.targetSetDigest, input.expiresAt.toISOString()],
  );
  const row = result.rows[0];
  if (!row?.snapshot_id) throw Object.assign(new Error('privacy_authorization_issue_failed'), { code: 'privacy_authorization_issue_failed' });
  return { snapshotId: row.snapshot_id, ownerUserId: row.owner_user_id, issuedAt: new Date(row.issued_at) };
}

export interface ConsumedAuthorizationSnapshot {
  snapshotId: string;
  ownerUserId: string;
  interviewId: string;
  purpose: 'interview_data_erasure' | 'resume_data_erasure' | 'account_data_erasure';
  privacyEpoch: number;
  targetSetDigest: string;
  issuedAt: Date;
  expiresAt: Date;
}

/**
 * 单次消费 jti（DB 原子 CAS：issued→consumed）。重放/未知/过期一律抛错。
 * M4：consume 刻意跨 owner（不按 tenant principal 绑定）——jti 是 bearer 能力，其唯一
 * 安全属性是单次 CAS 消费；租户(owner)绑定推迟到 claim（claim 强制 principal=owner）。
 * L12 失败模式：consume 在 exp 前即刻“烧掉”单次 jti。若 worker 在 consume 后、claim 前
 * 崩溃，重放 consume 会被拒，但 claim 仍可基于已消费行继续推进（claim 只要求 status=
 * consumed + live-digest 再验），直到 exp 为止——即“单次”指 consume 单次，不是 claim
 * 单次。因此这是慢烧而非死锁：不丢可推进性，但 consume 必须幂等失败（重放 0 行），
 * 调用方需用 claim 的活漂移校验兜底，不能靠“再 consume 一次”重试。
 */
export async function consumeAuthorizationSnapshot(
  c: Client, jti: string, worker: string,
): Promise<ConsumedAuthorizationSnapshot> {
  const result = await c.query<{
    snapshot_id: string; owner_user_id: string; interview_id: string; purpose: ConsumedAuthorizationSnapshot['purpose'];
    privacy_epoch: string | number; target_set_digest: string; issued_at: Date; expires_at: Date;
  }>('SELECT * FROM privacy_consume_authorization_snapshot($1,$2)', [jti, worker]);
  const row = result.rows[0];
  const epoch = Number(row?.privacy_epoch);
  if (!row?.snapshot_id || !Number.isSafeInteger(epoch) || epoch < 1)
    throw Object.assign(new Error('privacy_authorization_consume_invalid'), { code: 'privacy_authorization_consume_invalid' });
  return {
    snapshotId: row.snapshot_id, ownerUserId: row.owner_user_id, interviewId: row.interview_id,
    purpose: row.purpose, privacyEpoch: epoch, targetSetDigest: row.target_set_digest,
    issuedAt: new Date(row.issued_at), expiresAt: new Date(row.expires_at),
  };
}

/**
 * 验签后的跨层消费（worker 侧强制，H2）：把 domain 验签结果与 DB 账本消费结果逐项绑定，
 * 任一不一致即抛 `privacy_authorization_consume_mismatch`（fail-closed）。
 *
 * 注意：这里不是“逐字段加密绑定”——密码学完整性只由 ECDSA 签名对 JWS 载荷整体负责；本
 * 函数做的是验签载荷 ↔ 账本行的明文逐字段比对（防 jti 与快照错配 / 账本被独立篡改后仍
 * 被当有效快照继续 claim）。实际绑定的字段：
 *   - ownerUserId↔owner、interviewId↔interview、purpose↔purpose：owner 另有 claim 阶段的
 *     principal=owner 兜底（claim 会再次拒绝 owner 错配），但 interview/purpose 无任何下游
 *     兜底——claim 只比对 request.subject_id=snapshot.interview_id，而 snapshot.interview_id
 *     正是本函数返回值，故 interview/purpose 必须在此绑死，否则错配账本会漏过。
 *   - privacyEpoch/targetSetDigest/expiresAt：JWS 载荷与账本行之间错配的第二道防线。
 */
export async function consumeAuthorizationSnapshotBound(
  c: Client, verified: VerifiedPrivacyAuthorization, worker: string,
): Promise<ConsumedAuthorizationSnapshot> {
  const consumed = await consumeAuthorizationSnapshot(c, verified.jti, worker);
  if (consumed.ownerUserId !== verified.owner
    || consumed.interviewId !== verified.interview
    || consumed.purpose !== verified.purpose
    || consumed.privacyEpoch !== verified.privacyEpoch
    || consumed.targetSetDigest !== verified.targetSetDigest
    || consumed.expiresAt.getTime() !== verified.expiresAtMs) {
    throw Object.assign(new Error('privacy_authorization_consume_mismatch'), { code: 'privacy_authorization_consume_mismatch' });
  }
  return consumed;
}

export interface ClaimedAuthorizationTarget {
  targetId: string;
  leaseToken: string;
  attempt: number;
}

/**
 * 在已消费快照下受约束地租用目标：先重验 owner/scope/subject/epoch/digest + 活
 * target 集 digest，再 CAS 租约（同 checkpoint claim）。
 * M12 返回语义：安全违规（未消费/过期/owner/scope/subject/epoch/digest/活漂移）→ 抛错
 * fail-closed；业务不可租（父请求非推进态 / 已被他人租用 / 已 erased）→ 返回 null。
 */
export async function claimAuthorizationTarget(
  c: Client, jti: string, targetId: string, worker: string, leaseSeconds = 60,
): Promise<ClaimedAuthorizationTarget | null> {
  const result = await c.query<{ target_id: string; lease_token: string | null; status: string; attempt: number }>(
    'SELECT * FROM privacy_authorization_claim_target($1,$2,$3,$4)', [jti, targetId, worker, leaseSeconds],
  );
  const row = result.rows[0];
  if (!row || row.status === 'erased') return null;
  if (!row.lease_token || !Number.isSafeInteger(Number(row.attempt)))
    throw Object.assign(new Error('privacy_authorization_claim_invalid'), { code: 'privacy_authorization_claim_invalid' });
  return { targetId: row.target_id, leaseToken: row.lease_token, attempt: Number(row.attempt) };
}

/** 逐 sink receipt（owner-scoped，target+kind 幂等覆盖）。 */
export async function recordDeletionReceipt(
  c: Client, targetId: string, receiptKind: 'local_erased' | 'retention_pending' | 'external_pending' | 'external_confirmed' | 'failed_cleanup',
  receiptHash: string, recordedBy: string,
): Promise<string> {
  const result = await c.query<{ receipt_id: string }>(
    'SELECT * FROM privacy_record_deletion_receipt($1,$2,$3,$4)', [targetId, receiptKind, receiptHash, recordedBy],
  );
  const row = result.rows[0];
  if (!row?.receipt_id) throw Object.assign(new Error('privacy_receipt_write_failed'), { code: 'privacy_receipt_write_failed' });
  return row.receipt_id;
}

export interface ResolvedDeletionReceipt {
  receiptId: string;
  receiptKind: 'external_confirmed';
  requestStatus: string;
}

/**
 * 解析 external_pending 收据 → external_confirmed（F1 解死锁出口，可审计）。
 * 当全部 target 已 erased 且无 external_pending/failed_cleanup 残留时，会顺带把请求从
 * pending_external 推进到 completed（该 UPDATE 会再经 no-forge-completed guard 校验）。
 * 仅 external_pending 可解析，其余 kind 一律抛错。
 */
export async function resolveDeletionReceipt(
  c: Client, targetId: string, recordedBy: string,
): Promise<ResolvedDeletionReceipt> {
  const result = await c.query<{ receipt_id: string; receipt_kind: string; request_status: string }>(
    'SELECT * FROM privacy_resolve_deletion_receipt($1,$2)', [targetId, recordedBy],
  );
  const row = result.rows[0];
  if (!row?.receipt_id)
    throw Object.assign(new Error('privacy_authorization_receipt_resolve_failed'), { code: 'privacy_authorization_receipt_resolve_failed' });
  return { receiptId: row.receipt_id, receiptKind: 'external_confirmed', requestStatus: row.request_status };
}
