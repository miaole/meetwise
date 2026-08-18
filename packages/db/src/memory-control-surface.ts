import type { Client } from './principal.ts';
import type { MemoryFactWrite } from '@meetwise/contracts';
import type {
  MemoryDeletionScope, MemoryCorrectionDisposition,
} from '@meetwise/domain';

// MemoryPurpose 在 contracts 里是 zod VALUE（const），按 memory-two-stage-recall.ts 同款做法
// 从冻结形状 MemoryFactWrite 派生类型，避免「value 当 type 用」。
type MemoryPurpose = MemoryFactWrite['purpose'];

/**
 * 记忆管理控制面命令层（MEM-10）数据库操作层。与迁移 0107_memory_control_surface.sql 一一对应。
 *
 * 命令面两组（本层只做 DB 服务函数包装，不做 schema 校验 / PII 护栏——那是 contracts/domain）：
 *  A. 用户命令（owner 作用域，app_role EXECUTE）：
 *     listSourceCards / deletionProgress / correctFact / withdrawFact / beginDeletion /
 *     pauseCollection / resumeCollection / exportReceipt / recordPolicyPublish / recordReindex。
 *  B. 运营命令（受控角色）：
 *     reviewSourceCard（EXECUTE 仅 memory_reviewer，跨 owner 最小 provenance，无正文）、
 *     switchGeneration（EXECUTE 仅 memory_policy_releaser，跨 owner digest-only CAS 切换）、
 *     claimDeletionTarget / completeDeletionTarget / failDeletionTarget（EXECUTE 仅
 *     privacy_worker_executor，逐 sink lease→完成/失败）。
 *
 * 调用方必须用 principal.ts 的 asPrincipal（owner 命令）或对应受控角色 helper（reviewer/releaser/
 * worker）切换身份后调用；本层不自行设置 role/principal（身份由外层证明，防经 DB 层绕过 RLS）。
 */

/** ① 来源卡片（最小卡片：无 content、无他人主体）。 */
export interface MemoryControlSourceCard {
  factId: string;
  factKey: string;
  status: string;                       // fact 状态（candidate/active/superseded/…）
  purpose: MemoryPurpose;
  allowedDataClass: string | null;
  sourceType: string | null;
  sourceEntityId: string | null;
  immutableSourceVersion: string | null;
  createdAt: string;
  updatedAt: string;
}

/** ① 删除进度行（request + 逐 sink target）。 */
export interface MemoryControlDeletionProgressRow {
  requestId: string;
  requestStatus: string;
  scope: MemoryDeletionScope;
  subjectId: string | null;
  sink: string;
  targetStatus: string;
  failureReason: string | null;
  receipt: string | null;
}

/** ③⑤ 删除命令结果行（request 状态 + 逐 sink target 状态）。 */
export interface MemoryControlDeletionRow {
  requestId: string;
  requestStatus: string;
  sink: string;
  targetStatus: string;
  replayed: boolean;
}

/** ② 纠正命令结果。 */
export interface MemoryControlCorrectResult {
  commandId: string;
  factId: string;
  status: string;
  contradictedFactId: string | null;
  disposition: MemoryCorrectionDisposition;
  replayed: boolean;
}

/** ④ 采集暂停/恢复结果。 */
export interface MemoryControlPauseResult {
  id: string;
  purpose: MemoryPurpose;
  status: string;
  replayed: boolean;
}

/** ⑥ 导出回执。 */
export interface MemoryControlExportResult {
  receiptId: string;
  exportDigest: string;
  status: string;
  replayed: boolean;
}

/** ⑦ policy 发布命令状态。 */
export interface MemoryControlPolicyPublishResult {
  commandId: string;
  status: string;
  replayed: boolean;
}

/** ⑨ reindex 任务状态。 */
export interface MemoryControlReindexResult {
  taskId: string;
  status: string;
  replayed: boolean;
}

/** ⑧ 受控来源溯源卡片（reviewer 专用，无正文/content_digest）。 */
export interface MemoryControlReviewCard {
  factId: string;
  factKey: string;
  status: string;
  allowedDataClass: string | null;
  sourceType: string | null;
  sourceEntityId: string | null;
  immutableSourceVersion: string | null;
  sourceArtifactDigest: string | null;
  spanLocator: unknown;
  createdAt: string;
}

/** ⑦ releaser CAS 切换结果。 */
export interface MemoryControlSwitchResult {
  generationId: string;
  status: string;
}

/** worker 领取结果。 */
export interface MemoryControlClaimResult {
  targetId: string;
  leaseToken: string;
  status: string;
}

/** worker 完成/失败结果。 */
export interface MemoryControlTargetResult {
  targetId: string;
  status: string;
  requestStatus: string;
}

/** ① 查看来源卡片（owner 作用域）。 */
export async function listSourceCards(
  c: Client, purpose: MemoryPurpose | null = null,
): Promise<MemoryControlSourceCard[]> {
  const r = await c.query<{
    fact_id: string; fact_key: string; status: string; purpose: MemoryPurpose;
    allowed_data_class: string | null; source_type: string | null; source_entity_id: string | null;
    immutable_source_version: string | null; created_at: string; updated_at: string;
  }>('SELECT * FROM memory_control_list_source_cards($1)', [purpose]);
  return r.rows.map((row) => ({
    factId: row.fact_id, factKey: row.fact_key, status: row.status, purpose: row.purpose,
    allowedDataClass: row.allowed_data_class, sourceType: row.source_type,
    sourceEntityId: row.source_entity_id, immutableSourceVersion: row.immutable_source_version,
    createdAt: row.created_at, updatedAt: row.updated_at,
  }));
}

/** ① 删除进度（owner 作用域）。 */
export async function deletionProgress(
  c: Client, requestId: string,
): Promise<MemoryControlDeletionProgressRow[]> {
  const r = await c.query<{
    request_id: string; request_status: string; scope: MemoryDeletionScope; subject_id: string | null;
    sink: string; target_status: string; failure_reason: string | null; receipt: string | null;
  }>('SELECT * FROM memory_control_deletion_progress($1)', [requestId]);
  return r.rows.map((row) => ({
    requestId: row.request_id, requestStatus: row.request_status, scope: row.scope,
    subjectId: row.subject_id, sink: row.sink, targetStatus: row.target_status,
    failureReason: row.failure_reason, receipt: row.receipt,
  }));
}

/** ② 纠正 candidate → 新版本 + CAS 旧 active → contradicted（复用冻结 0099）。 */
export async function correctFact(
  c: Client, input: { factId: string; content: string; disposition: MemoryCorrectionDisposition; idempotencyKey?: string | null },
): Promise<MemoryControlCorrectResult | null> {
  const r = await c.query<{
    command_id: string; fact_id: string; status: string; contradicted_fact_id: string | null;
    disposition: MemoryCorrectionDisposition; replayed: boolean;
  }>('SELECT * FROM memory_control_correct_fact($1,$2,$3,$4)', [
    input.factId, input.content, input.disposition, input.idempotencyKey ?? null,
  ]);
  const row = r.rows[0];
  if (!row?.command_id) return null;
  return {
    commandId: row.command_id, factId: row.fact_id, status: row.status,
    contradictedFactId: row.contradicted_fact_id, disposition: row.disposition, replayed: row.replayed,
  };
}

/** ③ 单条撤回：先 fence（revoke + fence generations）再建删除 request/target。 */
export async function withdrawFact(
  c: Client, input: { factId: string; idempotencyKey?: string | null },
): Promise<MemoryControlDeletionRow[]> {
  const r = await c.query<{
    request_id: string; request_status: string; sink: string; target_status: string; replayed: boolean;
  }>('SELECT * FROM memory_control_withdraw_fact($1,$2)', [input.factId, input.idempotencyKey ?? null]);
  return r.rows.map((row) => ({
    requestId: row.request_id, requestStatus: row.request_status, sink: row.sink,
    targetStatus: row.target_status, replayed: row.replayed,
  }));
}

/** ⑤ 会话删除 / 删除全部（scope=session/account；single_fact 走 withdraw）。 */
export async function beginDeletion(
  c: Client, input: { scope: MemoryDeletionScope; subjectId: string | null; idempotencyKey: string },
): Promise<MemoryControlDeletionRow[]> {
  const r = await c.query<{
    request_id: string; request_status: string; sink: string; target_status: string; replayed: boolean;
  }>('SELECT * FROM memory_control_begin_deletion($1,$2,$3)', [
    input.scope, input.subjectId, input.idempotencyKey,
  ]);
  return r.rows.map((row) => ({
    requestId: row.request_id, requestStatus: row.request_status, sink: row.sink,
    targetStatus: row.target_status, replayed: row.replayed,
  }));
}

/** ④ 暂停采集（active→paused）。 */
export async function pauseCollection(
  c: Client, input: { purpose: MemoryPurpose; idempotencyKey?: string | null },
): Promise<MemoryControlPauseResult> {
  const r = await c.query<{
    id: string; purpose: MemoryPurpose; status: string; replayed: boolean;
  }>('SELECT * FROM memory_control_pause_collection($1,$2)', [input.purpose, input.idempotencyKey ?? null]);
  const row = r.rows[0];
  if (!row?.id) throw Object.assign(new Error('memory_control_pause_collection_failed'), { code: 'memory_control_pause_collection_failed' });
  return { id: row.id, purpose: row.purpose, status: row.status, replayed: row.replayed };
}

/** ④ 恢复采集（paused→active）。 */
export async function resumeCollection(
  c: Client, input: { purpose: MemoryPurpose; idempotencyKey?: string | null },
): Promise<MemoryControlPauseResult> {
  const r = await c.query<{
    id: string; purpose: MemoryPurpose; status: string; replayed: boolean;
  }>('SELECT * FROM memory_control_resume_collection($1,$2)', [input.purpose, input.idempotencyKey ?? null]);
  const row = r.rows[0];
  if (!row?.id) throw Object.assign(new Error('memory_control_resume_collection_failed'), { code: 'memory_control_resume_collection_failed' });
  return { id: row.id, purpose: row.purpose, status: row.status, replayed: row.replayed };
}

/** ⑥ 导出回执（本层只记录回执，导出正文归 HTTP 接口待定）。 */
export async function exportReceipt(
  c: Client, idempotencyKey: string,
): Promise<MemoryControlExportResult> {
  const r = await c.query<{
    receipt_id: string; export_digest: string; status: string; replayed: boolean;
  }>('SELECT * FROM memory_control_export($1)', [idempotencyKey]);
  const row = r.rows[0];
  if (!row?.receipt_id) throw Object.assign(new Error('memory_control_export_failed'), { code: 'memory_control_export_failed' });
  return { receiptId: row.receipt_id, exportDigest: row.export_digest, status: row.status, replayed: row.replayed };
}

/** ⑦ policy 发布命令记录（build→validated→activated 幂等）。 */
export async function recordPolicyPublish(
  c: Client, input: { generationKey: string; generationId: string; policyVersion: string; idempotencyKey: string },
): Promise<MemoryControlPolicyPublishResult> {
  const r = await c.query<{
    command_id: string; status: string; replayed: boolean;
  }>('SELECT * FROM memory_control_record_policy_publish($1,$2,$3,$4)', [
    input.generationKey, input.generationId, input.policyVersion, input.idempotencyKey,
  ]);
  const row = r.rows[0];
  if (!row?.command_id) throw Object.assign(new Error('memory_control_record_policy_publish_failed'), { code: 'memory_control_record_policy_publish_failed' });
  return { commandId: row.command_id, status: row.status, replayed: row.replayed };
}

/** ⑨ reindex 任务记录（幂等）。 */
export async function recordReindex(
  c: Client, input: { generationId: string; idempotencyKey: string },
): Promise<MemoryControlReindexResult> {
  const r = await c.query<{
    task_id: string; status: string; replayed: boolean;
  }>('SELECT * FROM memory_control_record_reindex($1,$2)', [input.generationId, input.idempotencyKey]);
  const row = r.rows[0];
  if (!row?.task_id) throw Object.assign(new Error('memory_control_record_reindex_failed'), { code: 'memory_control_record_reindex_failed' });
  return { taskId: row.task_id, status: row.status, replayed: row.replayed };
}

/** ⑧ 受控来源溯源访问（EXECUTE 仅 memory_reviewer，跨 owner 最小 provenance，无正文）。 */
export async function reviewSourceCard(
  c: Client, input: { ownerUserId: string; factId: string },
): Promise<MemoryControlReviewCard | null> {
  const r = await c.query<{
    fact_id: string; fact_key: string; status: string; allowed_data_class: string | null;
    source_type: string | null; source_entity_id: string | null; immutable_source_version: string | null;
    source_artifact_digest: string | null; span_locator: unknown; created_at: string;
  }>('SELECT * FROM memory_control_review_source_card($1,$2)', [input.ownerUserId, input.factId]);
  const row = r.rows[0];
  if (!row?.fact_id) return null;
  return {
    factId: row.fact_id, factKey: row.fact_key, status: row.status, allowedDataClass: row.allowed_data_class,
    sourceType: row.source_type, sourceEntityId: row.source_entity_id,
    immutableSourceVersion: row.immutable_source_version, sourceArtifactDigest: row.source_artifact_digest,
    spanLocator: row.span_locator, createdAt: row.created_at,
  };
}

/** ⑦ releaser：验证后 CAS 切换（EXECUTE 仅 memory_policy_releaser，跨 owner digest-only）。 */
export async function switchGeneration(
  c: Client, input: { ownerUserId: string; generationId: string },
): Promise<MemoryControlSwitchResult | null> {
  const r = await c.query<{
    generation_id: string; status: string;
  }>('SELECT * FROM memory_control_switch_generation($1,$2)', [input.ownerUserId, input.generationId]);
  const row = r.rows[0];
  if (!row?.generation_id) return null;
  return { generationId: row.generation_id, status: row.status };
}

/** worker：领取删除 target（lease CAS）。 */
export async function claimDeletionTarget(
  c: Client, input: { requestId: string; sink: string; worker: string; leaseSeconds?: number },
): Promise<MemoryControlClaimResult | null> {
  const r = await c.query<{
    target_id: string; lease_token: string; status: string;
  }>('SELECT * FROM memory_control_claim_deletion_target($1,$2,$3,$4)', [
    input.requestId, input.sink, input.worker, input.leaseSeconds ?? 60,
  ]);
  const row = r.rows[0];
  if (!row?.target_id) return null;
  return { targetId: row.target_id, leaseToken: row.lease_token, status: row.status };
}

/** worker：完成 target（物理删除 + receipt）。 */
export async function completeDeletionTarget(
  c: Client, input: { targetId: string; token: string; receipt: string },
): Promise<MemoryControlTargetResult | null> {
  const r = await c.query<{
    target_id: string; status: string; request_status: string;
  }>('SELECT * FROM memory_control_complete_deletion_target($1,$2,$3)', [
    input.targetId, input.token, input.receipt,
  ]);
  const row = r.rows[0];
  if (!row?.target_id) return null;
  return { targetId: row.target_id, status: row.status, requestStatus: row.request_status };
}

/** worker：失败 target（写目标级 reason + receipt）。 */
export async function failDeletionTarget(
  c: Client, input: { targetId: string; token: string; reason: string },
): Promise<MemoryControlTargetResult | null> {
  const r = await c.query<{
    target_id: string; status: string; request_status: string;
  }>('SELECT * FROM memory_control_fail_deletion_target($1,$2,$3)', [
    input.targetId, input.token, input.reason,
  ]);
  const row = r.rows[0];
  if (!row?.target_id) return null;
  return { targetId: row.target_id, status: row.status, requestStatus: row.request_status };
}
