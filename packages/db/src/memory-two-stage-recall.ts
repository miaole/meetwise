import type { Client } from './principal.ts';
import type {
  MemoryFactWrite, MemoryRecallCandidateCard, MemoryRecallHydrationVerdict,
  MemoryContextSnapshotReceipt, MemoryDispatchDecision,
} from '@meetwise/contracts';

// MemoryPurpose / MemoryAllowedDataClass 在 contracts 里是 zod VALUE（const），不是 type alias；
// 按 memory-governance.ts 同款做法从冻结形状 MemoryFactWrite 派生类型，避免「value 当 type 用」。
type MemoryPurpose = MemoryFactWrite['purpose'];
type MemoryAllowedDataClass = MemoryFactWrite['allowedDataClass'];

/**
 * 两阶段召回 + 派发前复核（MEM-14）数据库操作层。
 *
 * 承重边界（与 packages/db/migrations/0105_memory_two_stage_recall.sql 一一对应）：
 *  - 第一段 DB 内硬过滤候选召回（memory_recall_hybrid_candidates）：先按全部元标签（owner/scope/
 *    purpose/consent revision+epoch/fact status 未过期/数据分类/active generation manifest）在
 *    SQL WHERE 硬过滤，**过滤后的集合**才做向量 + 关键词候选排序。返回来源卡片（无 content、
 *    无裸 embedding）。
 *  - 第二段水合来源重验（memory_hydrate_recall_facts）：逐条重验 digest/status/valid_until/live
 *    consent/数据分类/冲突关系/长度预算。任一失败 → verdict='rejected' + reason_code，**绝不**用
 *    旧 cache/旧 summary/旧 index generation 回退补足。
 *  - 冻结 ContextSnapshot（memory_freeze_recall_snapshot）：同 snapshot_key 幂等回放同选择（E1）；
 *    live 范围/版本 + generation manifest CAS 通过 → published（唯一 winner），否则 → voided（E2）。
 *  - 派发前复核（memory_dispatch_recall_snapshot）：live consent（revision/epoch 与冻结值一致）+
 *    未过期 → consumed（派发=1，派发先赢）；否则 → voided（派发=0，围栏先赢）；consumed 幂等回放
 *    绝不重新 void（E6，仅按模型删除账本处理）。
 *
 * 分层纪律：本层不做 schema 校验与 PII 护栏（那是 contracts/domain 的职责），只把字段送进承重
 * SQL 函数并映射返回值——与 memory-governance.ts / memory-index-generation.ts 保持一致。query 向量
 * 由调用方（embedding seam / deterministicMemoryEmbedder）计算后以 number[] 传入，本层只序列化。
 */

/** 第一段候选召回输入（application service seam，不是客户端 DTO）。 */
export interface RecallHybridCandidatesInput {
  purpose: MemoryPurpose;
  consentRevision: number;
  privacyEpoch: number;
  generationManifestDigest: string | null;
  queryVector: number[] | null;
  queryText: string | null;
  topK: number;
}

/** 第一段：DB 内硬过滤候选召回。返回来源卡片（无 content / 裸 embedding）。 */
export async function recallHybridCandidates(
  c: Client, input: RecallHybridCandidatesInput,
): Promise<MemoryRecallCandidateCard[]> {
  const r = await c.query<{
    fact_id: string; fact_key: string; retrieval_kind: string; retrieval_score: string | number;
    source_entity_id: string | null; immutable_source_version: string | null;
    source_artifact_digest: string; span_locator: unknown; content_digest: string;
    fact_version: string | number; allowed_data_class: MemoryAllowedDataClass;
  }>(
    'SELECT * FROM memory_recall_hybrid_candidates($1,$2,$3,$4,$5,$6,$7)',
    [
      input.purpose, input.consentRevision, input.privacyEpoch, input.generationManifestDigest,
      input.queryVector ? JSON.stringify(input.queryVector) : null,
      input.queryText, input.topK,
    ],
  );
  return r.rows.map((row) => ({
    factId: row.fact_id,
    factKey: row.fact_key,
    retrievalKind: row.retrieval_kind as MemoryRecallCandidateCard['retrievalKind'],
    retrievalScore: Number(row.retrieval_score),
    sourceEntityId: row.source_entity_id,
    immutableSourceVersion: row.immutable_source_version,
    sourceArtifactDigest: row.source_artifact_digest,
    spanLocator: row.span_locator,
    contentDigest: row.content_digest,
    factVersion: Number(row.fact_version),
    allowedDataClass: row.allowed_data_class,
  }));
}

/** 第二段水合重验输入。 */
export interface HydrateRecallFactsInput {
  purpose: MemoryPurpose;
  consentRevision: number;
  privacyEpoch: number;
  contentBudget: number;
  factIds: string[];
}

/** 第二段：水合来源重验。逐条 verdict；rejected 带 reasonCode 且无 content。 */
export async function hydrateRecallFacts(
  c: Client, input: HydrateRecallFactsInput,
): Promise<MemoryRecallHydrationVerdict[]> {
  const r = await c.query<{
    fact_id: string; verdict: string; reason_code: string | null; fact_key: string | null;
    content: string | null; content_digest: string | null; source_entity_id: string | null;
    immutable_source_version: string | null; source_artifact_digest: string | null;
    span_locator: unknown; allowed_data_class: MemoryAllowedDataClass | null;
    fact_version: string | number | null;
  }>(
    'SELECT * FROM memory_hydrate_recall_facts($1,$2,$3,$4,$5::uuid[])',
    [input.purpose, input.consentRevision, input.privacyEpoch, input.contentBudget, input.factIds],
  );
  return r.rows.map((row) => {
    const accepted = row.verdict === 'accepted';
    return {
      factId: row.fact_id,
      verdict: accepted ? 'accepted' : 'rejected',
      reasonCode: accepted ? null : row.reason_code as MemoryRecallHydrationVerdict['reasonCode'],
      sourceCard: accepted ? {
        factId: row.fact_id,
        factKey: row.fact_key!,
        content: row.content!,
        contentDigest: row.content_digest!,
        sourceEntityId: row.source_entity_id,
        immutableSourceVersion: row.immutable_source_version,
        sourceArtifactDigest: row.source_artifact_digest!,
        spanLocator: row.span_locator,
        allowedDataClass: row.allowed_data_class!,
        factVersion: Number(row.fact_version),
      } : null,
    };
  });
}

/** 冻结 ContextSnapshot 输入。 */
export interface FreezeRecallContextSnapshotInput {
  snapshotKey: string;
  purpose: MemoryPurpose;
  authorizationVersion: string;
  consentRevision: number;
  privacyEpoch: number;
  generationManifestDigest: string | null;
  retrievalPolicyVersion: string;
  budget: number;
  rendererVersion: string;
  renderDigest: string;
  content: unknown;
  expiresAt?: string | null;
}

/** 冻结 ContextSnapshot：幂等回放（E1）+ 范围/版本 + generation manifest CAS（E2）。 */
export async function freezeRecallContextSnapshot(
  c: Client, input: FreezeRecallContextSnapshotInput,
): Promise<MemoryContextSnapshotReceipt> {
  const r = await c.query<{
    snapshot_id: string; status: MemoryContextSnapshotReceipt['status']; void_reason: string | null;
    replayed: boolean;
  }>(
    'SELECT * FROM memory_freeze_recall_snapshot($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)',
    [
      input.snapshotKey, input.purpose, input.authorizationVersion, input.consentRevision,
      input.privacyEpoch, input.generationManifestDigest, input.retrievalPolicyVersion, input.budget,
      input.rendererVersion, input.renderDigest, JSON.stringify(input.content), input.expiresAt ?? null,
    ],
  );
  const row = r.rows[0];
  if (!row?.snapshot_id)
    throw Object.assign(new Error('memory_freeze_recall_snapshot_failed'), { code: 'memory_freeze_recall_snapshot_failed' });
  return {
    snapshotId: row.snapshot_id,
    status: row.status,
    authorizationVersion: input.authorizationVersion,
    consentRevision: input.consentRevision,
    privacyEpoch: input.privacyEpoch,
    generationManifestDigest: input.generationManifestDigest,
    retrievalPolicyVersion: input.retrievalPolicyVersion,
    budget: input.budget,
    rendererVersion: input.rendererVersion,
    renderDigest: input.renderDigest,
    voidReason: row.void_reason,
    replayed: row.replayed,
  };
}

/** 派发前复核：围栏先赢（voided, 0）/ 派发先赢（consumed, 1）。 */
export async function dispatchRecallContextSnapshot(
  c: Client, snapshotId: string,
): Promise<MemoryDispatchDecision> {
  const r = await c.query<{
    snapshot_id: string; status: MemoryDispatchDecision['status']; dispatch_decision: number;
    void_reason: string | null;
  }>(
    'SELECT * FROM memory_dispatch_recall_snapshot($1)', [snapshotId],
  );
  const row = r.rows[0];
  if (!row?.snapshot_id)
    throw Object.assign(new Error('memory_dispatch_recall_snapshot_failed'), { code: 'memory_dispatch_recall_snapshot_failed' });
  return {
    snapshotId: row.snapshot_id,
    status: row.status,
    dispatchDecision: row.dispatch_decision === 1 ? 1 : 0,
    voidReason: row.void_reason,
  };
}
