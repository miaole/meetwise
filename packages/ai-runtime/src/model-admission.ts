/**
 * model-admission.ts — MODEL-OP-02 共享准入/账本/断路器/并发 的**单一权威**（关口编排层）。
 *
 * 这是"不再让各适配器各自限流"的落点：所有 operation-scoped 派发必须经这里的
 * `admitSharedModelOperation` / `recordSharedModelOperation`，键由 MODEL-OP-01 的
 * `modelOperationAdmissionKey`（providerAccount|region|modelOrRecipe|operationId）派生，
 * 服务器派生、绝不 caller 供。持久化真相在迁移 0120 的 SECURITY DEFINER 过程 +
 * packages/db 的 model-operation-admission.ts；本文件只做：
 *   1. 从 `spec.operation` 派生分区（纯函数）；
 *   2. acquire（决策 → 显式错误码）与 record（断路器结果 + 钱账本）的编排；
 *   3. 把决策显式 enum 翻译成调用方可观测、可优雅降级的错误码。
 *
 * 显式边界（非静默旁路）：只有 `spec.operation` 路径走此权威；legacy cost-policy-only
 * 调用仍走 MODEL-OP-00 的 ai_cost_reservation 账本（未折入共享分区），这是
 * MODEL-OP-03/04 之前保留的兼容 seam，已在 .tmp pregen-gate 诚实声明。
 */
import { randomUUID } from 'node:crypto';
import {
  acquireModelAdmission, recordModelAdmission,
  type ModelAdmissionPartition, type ModelAdmissionDecision, type ModelBreakerOutcome,
  type ModelFeeStatus, type Client, type DbPool,
} from '@meetwise/db';
import { asPrincipal } from '@meetwise/db';
import { resolveModelOperation } from './model-operation-registry.ts';

/** acquire 决策 → 调用方可观测错误码（fail-closed，绝不静默吞）。 */
const ADMISSION_ERROR_CODES: Record<ModelAdmissionDecision, string> = {
  operation_unknown: 'model_admission_operation_unknown',
  operation_blocked: 'model_admission_operation_blocked',
  project_missing: 'model_admission_project_missing',
  project_disabled: 'model_admission_project_disabled',
  breaker_open: 'model_circuit_open',
  breaker_half_open_busy: 'model_circuit_half_open',
  concurrency_exhausted: 'model_concurrency_exhausted',
  admitted: 'model_admitted',
};

/**
 * 从 `spec.operation` 派生准入分区（四字段，绝不 caller 供）。
 * 非 operation-scoped（legacy）返回 undefined——那是 MODEL-OP-00 账本路径，不走共享权威。
 */
export function resolveModelAdmissionPartition(
  spec: { operation?: { id: string; businessRevision: string } },
): ModelAdmissionPartition | undefined {
  if (!spec.operation) return undefined;
  const resolved = resolveModelOperation(spec.operation.id, spec.operation.businessRevision);
  if (!resolved.ok) return undefined;
  const { providerAccount, region, modelOrRecipe } = resolved.definition.admission;
  return { providerAccount, region, modelOrRecipe, operationId: resolved.definition.operationId };
}

/** 一次成功 acquire 的跨副本租约（槽位 + 探针 + 断路器阈值），record 时按此身份释放。 */
export interface SharedModelAdmissionLease {
  partition: ModelAdmissionPartition;
  idempotencyKey: string;
  slotIndex: number;
  probeToken: string;
  breakerThreshold: number;
}

export interface AdmitSharedModelOperationInput {
  partition: ModelAdmissionPartition;
  scopeId?: string;
  idempotencyKey: string;
  leaseSeconds?: number;
}

export type AdmitSharedModelOperationResult =
  | { ok: true; lease: SharedModelAdmissionLease }
  | { ok: false; error: string };

/**
 * 准入 + 断路器入场 + 并发槽认领（单一 SECURITY DEFINER 事务，跨副本）。
 * 决策非 admitted → 确定性拒绝（fail-closed），不产生任何 provider 外呼。
 */
export async function admitSharedModelOperation(
  pool: DbPool, owner: string, input: AdmitSharedModelOperationInput,
): Promise<AdmitSharedModelOperationResult> {
  const probeToken = randomUUID();
  const leaseSeconds = input.leaseSeconds ?? 60;
  const result = await asPrincipal(pool, owner, (c) => acquireModelAdmission(c, {
    owner, partition: input.partition, scopeId: input.scopeId,
    idempotencyKey: input.idempotencyKey, leaseSeconds, probeToken,
  }));
  if (result.decision === 'admitted') {
    return {
      ok: true,
      lease: {
        partition: input.partition, idempotencyKey: input.idempotencyKey,
        slotIndex: result.slotIndex, probeToken, breakerThreshold: result.breakerThreshold,
      },
    };
  }
  return { ok: false, error: ADMISSION_ERROR_CODES[result.decision] ?? 'model_admission_failed' };
}

export interface SharedModelFeeRecord {
  scopeId: string;
  priceRevision: string;
  inputTokens: number | null;
  outputTokens: number | null;
  settledMicroCny: number | null;
  feeStatus: ModelFeeStatus;
  reasonCode?: string;
}

/**
 * 断路器结果 + 钱账本 + 槽/探针释放（原子，执行后的同一短事务内调用）。
 * `outcome='no_signal'` 且 `fee` 缺省 = 派发前失败/确定性拒绝的"只还槽/探针、不改相位"释放。
 */
export async function recordSharedModelOperation(
  c: Client, owner: string, lease: SharedModelAdmissionLease,
  outcome: ModelBreakerOutcome, fee?: SharedModelFeeRecord,
): Promise<void> {
  await recordModelAdmission(c, {
    owner, partition: lease.partition, idempotencyKey: lease.idempotencyKey,
    slotIndex: lease.slotIndex, probeToken: lease.probeToken, outcome,
    breakerThreshold: lease.breakerThreshold,
    fee,
  });
}
