import type { Client } from './principal.ts';
import type { MemoryFactWrite, MemoryFactCard, MemoryConsent } from '@meetwise/contracts';

/**
 * 记忆治理（MEM-00）数据库操作层。
 *
 * 承重边界（与 packages/db/migrations/0093_memory_governance.sql 一一对应）：
 *  - 事实准入走显式状态机（candidate→active / fenced；purge 为物理 DELETE、非状态枚举），单值 active 由 DB 部分唯一
 *    索引 memory_fact_single_active_ux 承重，confirm 的 CAS 败者返回空（不抛）。
 *  - 召回是**两阶段**：第一阶段 `recallMemoryCandidates` 只返回 DB 硬过滤后的 ID 集（active +
 *    consent granted + revision/epoch 匹配 + 未过期），绝无“全局 Top-K 再应用层过滤”；第二
 *    阶段 `hydrateMemoryFacts` 对每个 ID 重验 digest/status/expiry/consent 后才吐内容。
 *  - content 一律不可信输入：调用方（API service / proof）先 zod schema 校验（contracts）再
 *    `assertMemoryFactContentSafe`（domain，PII 护栏）双校验，并算出 `memoryContentDigest` 与
 *    content 一并传入；SQL 侧再 `digest(content)=content_digest` 重验（data fence 第三道）。
 *  - 账户级删除**复用冻结的 PrivacyAuthorizationIssuer**（sign/verify/consume 全部走
 *    packages/domain + privacy-authorization.ts），本层只包 MEM 自己的 claim/purge 解析器。
 *
 * 这里刻意不做 schema 校验与 PII 护栏（那是 contracts/domain 的职责，本层只信“已验证输入”），
 * 只负责把字段送进承重 SQL 函数并映射返回值——与 privacy-authorization.ts 保持同一分层。
 */

export interface RecordedMemoryFact { id: string; status: string; created: boolean }
export interface ConfirmMemoryFactResult { id: string; status: string }
export interface HydratedMemoryFact extends MemoryFactCard {}

export type MemoryFactKind = MemoryFactWrite['kind'];
export type MemoryPurpose = MemoryFactWrite['purpose'];
export type MemoryAllowedDataClass = MemoryFactWrite['allowedDataClass'];
export type MemorySourceType = MemoryFactWrite['sourceType'];

/**
 * 事实准入（candidate）。调用方必须已通过双校验并算出 contentDigest（= domain
 * memoryContentDigest(content)）；SQL 侧会再 `digest(content)=content_digest` 重验，防“改内容
 * 不改摘要”。幂等键重放返回既有行（created=false）。
 */
export async function recordMemoryFact(
  c: Client, input: MemoryFactWrite, contentDigest: string,
): Promise<RecordedMemoryFact> {
  const r = await c.query<{ id: string; status: string; created: boolean }>(
    'SELECT * FROM memory_record_fact($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)',
    [
      input.factKey, input.content, contentDigest, input.kind, input.purpose, input.allowedDataClass,
      input.sourceType, input.sourceEntityId ?? null, input.immutableSourceVersion ?? null,
      input.sourceSpan ? JSON.stringify(input.sourceSpan) : null, input.sourceArtifactDigest ?? null,
      input.normalizationRecipeVersion ?? null, input.producerClass ?? null, input.extractionRecipeVersion ?? null,
      input.verificationRecipeVersion ?? null, input.policyVersion, input.expiresAt ?? null,
      input.multiValue, input.idempotencyKey ?? null,
    ],
  );
  const row = r.rows[0];
  if (!row?.id) throw Object.assign(new Error('memory_record_fact_failed'), { code: 'memory_record_fact_failed' });
  return { id: row.id, status: row.status, created: row.created };
}

/** 同意授予 / 重新授予（幂等）。返回既有或新建的 consent。 */
export async function grantMemoryConsent(
  c: Client, purpose: MemoryPurpose, policyVersion: string,
): Promise<MemoryConsent> {
  const r = await c.query<{
    id: string; purpose: MemoryPurpose; status: 'granted' | 'revoked';
    consent_revision: string | number; privacy_epoch: string | number;
  }>('SELECT * FROM memory_grant_consent($1,$2)', [purpose, policyVersion]);
  const row = r.rows[0];
  const consentRevision = Number(row?.consent_revision);
  const privacyEpoch = Number(row?.privacy_epoch);
  if (!row || !Number.isSafeInteger(consentRevision) || !Number.isSafeInteger(privacyEpoch))
    throw Object.assign(new Error('memory_grant_consent_failed'), { code: 'memory_grant_consent_failed' });
  return { purpose: row.purpose, policyVersion, status: row.status, consentRevision, privacyEpoch };
}

/** 撤回同意（fence：status→revoked + privacy_epoch+1，同 purpose active fact 全部 fenced）。 */
export async function revokeMemoryConsent(c: Client, purpose: MemoryPurpose): Promise<number> {
  const r = await c.query<{ privacy_epoch: string | number }>('SELECT * FROM memory_revoke_consent($1)', [purpose]);
  const epoch = Number(r.rows[0]?.privacy_epoch);
  if (!Number.isSafeInteger(epoch) || epoch < 1)
    throw Object.assign(new Error('memory_revoke_consent_failed'), { code: 'memory_revoke_consent_failed' });
  return epoch;
}

/** 确认事实（candidate/awaiting_confirmation → active）。单值 active CAS 败者返回 null。 */
export async function confirmMemoryFact(c: Client, id: string): Promise<ConfirmMemoryFactResult | null> {
  const r = await c.query<{ id: string; status: string }>('SELECT * FROM memory_confirm_fact($1)', [id]);
  const row = r.rows[0];
  if (!row) return null;
  return { id: row.id, status: row.status };
}

/** 单条事实撤回（active/superseded/disputed → fenced）。非可撤回态返回 null。 */
export async function revokeMemoryFact(c: Client, id: string): Promise<ConfirmMemoryFactResult | null> {
  const r = await c.query<{ id: string; status: string }>('SELECT * FROM memory_revoke_fact($1)', [id]);
  const row = r.rows[0];
  if (!row) return null;
  return { id: row.id, status: row.status };
}

/** 两阶段召回第一阶段：DB 硬过滤只返回 ID 集（不吐内容）。 */
export async function recallMemoryCandidates(c: Client, purpose?: MemoryPurpose): Promise<string[]> {
  const r = await c.query<{ memory_recall_candidates: string }>(
    'SELECT * FROM memory_recall_candidates($1)', [purpose ?? null],
  );
  return r.rows.map((row) => row.memory_recall_candidates);
}

/** 两阶段召回第二阶段：水合重验 digest/status/expiry/consent 后才吐内容。 */
export async function hydrateMemoryFacts(c: Client, ids: string[]): Promise<HydratedMemoryFact[]> {
  const r = await c.query<{
    id: string; fact_key: string; content: string; kind: string; purpose: MemoryPurpose;
    allowed_data_class: MemoryAllowedDataClass; source_span: unknown; source_artifact_digest: string | null;
    policy_version: string;
  }>('SELECT * FROM memory_hydrate_facts($1)', [ids]);
  return r.rows.map((row) => ({
    id: row.id, factKey: row.fact_key, content: row.content, kind: row.kind, purpose: row.purpose,
    allowedDataClass: row.allowed_data_class,
    sourceSpan: (row.source_span as MemoryFactCard['sourceSpan']) ?? null,
    sourceArtifactDigest: row.source_artifact_digest, policyVersion: row.policy_version,
  }));
}

export interface GenerationResult { id: string; status: string }

/** generation 状态机：start（幂等 upsert，回填 built_fact_digest）→ activate（单 active CAS）→ retire。 */
export async function startMemoryGeneration(c: Client, generationKey: string, builtFactDigest?: string): Promise<GenerationResult> {
  const r = await c.query<{ id: string; status: string }>('SELECT * FROM memory_start_generation($1,$2)', [generationKey, builtFactDigest ?? null]);
  const row = r.rows[0];
  if (!row?.id) throw Object.assign(new Error('memory_start_generation_failed'), { code: 'memory_start_generation_failed' });
  return { id: row.id, status: row.status };
}

export async function activateMemoryGeneration(c: Client, id: string): Promise<GenerationResult | null> {
  const r = await c.query<{ id: string; status: string }>('SELECT * FROM memory_activate_generation($1)', [id]);
  const row = r.rows[0];
  return row ? { id: row.id, status: row.status } : null;
}

export async function retireMemoryGeneration(c: Client, id: string): Promise<GenerationResult | null> {
  const r = await c.query<{ id: string; status: string }>('SELECT * FROM memory_retire_generation($1)', [id]);
  const row = r.rows[0];
  return row ? { id: row.id, status: row.status } : null;
}

export interface SnapshotResult { id: string; status: string }

/** 冻结上下文快照状态机（issued → consumed/voided/expired）。 */
export async function issueMemoryContextSnapshot(
  c: Client, purpose: MemoryPurpose, snapshotDigest: string, content: unknown,
  sourceId?: string, expiresAt?: string,
): Promise<SnapshotResult> {
  const r = await c.query<{ id: string; status: string }>(
    'SELECT * FROM memory_issue_context_snapshot($1,$2,$3,$4,$5)',
    [purpose, snapshotDigest, JSON.stringify(content), sourceId ?? null, expiresAt ?? null],
  );
  const row = r.rows[0];
  if (!row?.id) throw Object.assign(new Error('memory_issue_snapshot_failed'), { code: 'memory_issue_snapshot_failed' });
  return { id: row.id, status: row.status };
}

export async function consumeMemoryContextSnapshot(c: Client, id: string): Promise<SnapshotResult | null> {
  const r = await c.query<{ id: string; status: string }>('SELECT * FROM memory_consume_context_snapshot($1)', [id]);
  const row = r.rows[0];
  return row ? { id: row.id, status: row.status } : null;
}

export async function voidMemoryContextSnapshot(c: Client, id: string): Promise<SnapshotResult | null> {
  const r = await c.query<{ id: string; status: string }>('SELECT * FROM memory_void_context_snapshot($1)', [id]);
  const row = r.rows[0];
  return row ? { id: row.id, status: row.status } : null;
}

export interface MemoryErasureTarget { sink: string; resourceHmac: string }
export interface BegunMemoryErasure {
  requestId: string;
  requestStatus: string;
  privacyEpoch: number;
  targetSetDigest: string;
  targets: MemoryErasureTarget[];
  replayed: boolean;
}

/**
 * 发起账户级记忆删除：同步 fence（撤回全部 granted consent + fence 全部 active fact）→ 建
 * request → 枚举 3 个可解析 MEM sink 的 target → 就地算 target_set_digest（与 claim 的活重验
 * 同公式）→ request→fenced。幂等：同 owner 同 idempotency_key_hash 重放返回既有 3 行。
 * 返回的 targetSetDigest 必须与调用方 `canonicalTargetSetDigest(targets)` 相等，供签发快照。
 */
export async function beginMemoryAccountErasure(
  c: Client, idempotencyKeyHash: string,
): Promise<BegunMemoryErasure> {
  const r = await c.query<{
    request_id: string; request_status: string; privacy_epoch: string | number;
    target_set_digest: string; sink: string; resource_hmac: string; replayed: boolean;
  }>('SELECT * FROM memory_begin_account_erasure($1)', [idempotencyKeyHash]);
  if (r.rowCount === 0) throw Object.assign(new Error('memory_begin_erasure_failed'), { code: 'memory_begin_erasure_failed' });
  const first = r.rows[0]!;
  const privacyEpoch = Number(first.privacy_epoch);
  if (!Number.isSafeInteger(privacyEpoch) || privacyEpoch < 1)
    throw Object.assign(new Error('memory_begin_erasure_failed'), { code: 'memory_begin_erasure_failed' });
  return {
    requestId: first.request_id,
    requestStatus: first.request_status,
    privacyEpoch,
    targetSetDigest: first.target_set_digest,
    targets: r.rows.map((row) => ({ sink: row.sink, resourceHmac: row.resource_hmac })),
    replayed: first.replayed,
  };
}

export interface ClaimedMemoryTarget { targetId: string; leaseToken: string; attempt: number }

/**
 * 在已消费快照下受约束地租用 MEM 删除目标（scope=account_data + purpose=account_data_erasure
 * + sink∈3 可解析 MEM sink + 活 digest 重验）。安全违规抛错；业务不可租/已 erased 返回 null。
 */
export async function claimMemoryTarget(
  c: Client, jti: string, targetId: string, worker: string, leaseSeconds = 60,
): Promise<ClaimedMemoryTarget | null> {
  const r = await c.query<{ target_id: string; lease_token: string | null; status: string; attempt: number }>(
    'SELECT * FROM privacy_authorization_claim_memory_target($1,$2,$3,$4)', [jti, targetId, worker, leaseSeconds],
  );
  const row = r.rows[0];
  if (!row || row.status === 'erased') return null;
  if (!row.lease_token || !Number.isSafeInteger(Number(row.attempt)))
    throw Object.assign(new Error('memory_target_claim_invalid'), { code: 'memory_target_claim_invalid' });
  return { targetId: row.target_id, leaseToken: row.lease_token, attempt: Number(row.attempt) };
}

export interface PurgedMemoryTarget { targetId: string; status: string; deletedCount: number; requestStatus: string }

/** 删除侧物理清除（逐 sink 明确删除动作 + 残留=0 校验；未知 locator 一律 fail-closed）。 */
export async function purgeMemoryTarget(c: Client, targetId: string, token: string): Promise<PurgedMemoryTarget> {
  const r = await c.query<{ target_id: string; status: string; deleted_count: string | number; request_status: string }>(
    'SELECT * FROM privacy_purge_memory_target($1,$2)', [targetId, token],
  );
  const row = r.rows[0];
  if (!row?.target_id) throw Object.assign(new Error('memory_target_purge_failed'), { code: 'memory_target_purge_failed' });
  return { targetId: row.target_id, status: row.status, deletedCount: Number(row.deleted_count), requestStatus: row.request_status };
}
