/**
 * model-operation-admission.ts — MODEL-OP-02 共享准入/账本/断路器/并发 的数据访问层。
 *
 * 纯数据访问、零模型/域依赖（DAG 最底层）。数据库 SECURITY DEFINER 过程
 * （迁移 0120）才是准入与并发/断路器状态的真相；此文件不缓存决策、不做金额运算，
 * 只把 typed 参数翻译成函数调用并把结果投影回显式 enum——与 ai-cost-governance.ts
 * 同范式（"数据库过程才是真相，应用侧绝不本地持有并发/断路器状态"）。
 *
 * 四原语落地（见迁移 0120 注释）：
 *  - 幂等：fee ledger PK(owner,idempotency) ON CONFLICT DO NOTHING；
 *  - CAS：并发槽 UPDATE 原子认领；断路器 FOR UPDATE 单写者；
 *  - RLS：4 张表对 app_role REVOKE ALL，只经 SECURITY DEFINER；每函数 PERFORM
 *    ai_cost_require_request_owner 绑定租户；
 *  - 持久有序日志：fee ledger 逐调用落库。
 */
import type { Client } from './principal.ts';

/** 准入分区四字段（与 registry 的 modelOperationAdmissionKey 同源，绝不 caller 供）。 */
export interface ModelAdmissionPartition {
  providerAccount: string;
  region: string;
  modelOrRecipe: string;
  operationId: string;
}

/** acquire 决策（显式 enum，fail-closed）。 */
export type ModelAdmissionDecision =
  | 'admitted'
  | 'operation_unknown'
  | 'operation_blocked'
  | 'project_missing'
  | 'project_disabled'
  | 'breaker_open'
  | 'breaker_half_open_busy'
  | 'concurrency_exhausted';

export interface ModelAdmissionAcquireInput {
  owner: string;
  partition: ModelAdmissionPartition;
  scopeId?: string;
  idempotencyKey: string;
  leaseSeconds: number;
  probeToken: string;
}

export interface ModelAdmissionAcquireResult {
  decision: ModelAdmissionDecision;
  slotIndex: number;
  probeAcquired: boolean;
  breakerThreshold: number;
}

export async function acquireModelAdmission(c: Client, input: ModelAdmissionAcquireInput): Promise<ModelAdmissionAcquireResult> {
  const r = await c.query(
    `SELECT decision, slot_index, probe_acquired, breaker_threshold
       FROM ai_model_admission_acquire_scoped($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
    [
      input.owner, input.partition.providerAccount, input.partition.region, input.partition.modelOrRecipe, input.partition.operationId,
      input.scopeId ?? null, input.idempotencyKey, input.leaseSeconds, input.probeToken,
    ],
  );
  const row = r.rows[0];
  if (!row) throw new Error('ai_model_admission_acquire_no_decision');
  return {
    decision: String(row.decision) as ModelAdmissionDecision,
    slotIndex: Number(row.slot_index),
    probeAcquired: row.probe_acquired === true,
    breakerThreshold: Number(row.breaker_threshold),
  };
}

/** 断路器记录结果：success/failure 转移相位；no_signal 只还探针不改相位（无 provider 信号）。 */
export type ModelBreakerOutcome = 'success' | 'failure' | 'no_signal';
export type ModelFeeStatus = 'settled' | 'rejected' | 'unknown';

export interface ModelAdmissionRecordInput {
  owner: string;
  partition: ModelAdmissionPartition;
  idempotencyKey: string;
  slotIndex: number;
  probeToken: string;
  outcome: ModelBreakerOutcome;
  breakerThreshold: number;
  /** 计费调用才传；unbilled 不写钱账本。unknown 结果 tokens/金额未知，故可空。 */
  fee?: {
    scopeId: string;
    priceRevision: string;
    inputTokens: number | null;
    outputTokens: number | null;
    settledMicroCny: number | null;
    feeStatus: ModelFeeStatus;
    reasonCode?: string;
  };
}

export async function recordModelAdmission(c: Client, input: ModelAdmissionRecordInput): Promise<void> {
  await c.query(
    `SELECT ai_model_admission_record_scoped($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`,
    [
      input.owner, input.partition.providerAccount, input.partition.region, input.partition.modelOrRecipe, input.partition.operationId,
      input.idempotencyKey, input.slotIndex, input.probeToken, input.outcome, input.breakerThreshold,
      input.fee?.scopeId ?? null, input.fee?.priceRevision ?? null,
      input.fee?.inputTokens ?? null, input.fee?.outputTokens ?? null,
      input.fee?.settledMicroCny ?? null, input.fee?.feeStatus ?? null,
      input.fee?.reasonCode ?? null,
    ],
  );
}
