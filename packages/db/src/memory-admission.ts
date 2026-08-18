import type { Client } from './principal.ts';
import type {
  MemoryAdmissionCandidate, MemoryAdmissionReceipt, MemoryAdmissionAuthorization, MemoryFactWrite,
} from '@meetwise/contracts';

// 这些枚举在 contracts 里是 zod VALUE（const），不是 type alias；按 memory-governance.ts 同款
// 做法从冻结形状派生类型，避免「value 当 type 用」。
type MemoryPurpose = MemoryFactWrite['purpose'];
type MemoryAllowedDataClass = MemoryFactWrite['allowedDataClass'];
type MemorySourceType = MemoryFactWrite['sourceType'];
type MemoryAdmissionControllerScope = MemoryAdmissionReceipt['controllerScope'];

/**
 * 记忆准入元标签门（MEM-12）数据库操作层。
 *
 * 承重边界（与 packages/db/migrations/0095_memory_admission_metadata_gate.sql 一一对应）：
 *  - 三身份（accessPrincipalContext / controllerScope / dataSubject / thread boundary）由
 *    服务端授权快照派生，客户端 DTO 里绝无 owner/purpose/project/factKey/scope/sourceId。
 *  - 完整元标签集（§1.1）+ spanLocator 单一坐标系（utf8_byte）+ 六分量分离，全部由承重 SQL
 *    函数 fail-closed 校验（缺字段/伪造/越界 = RAISE，零写入）。
 *  - retrieval_score 准入期恒 NULL（召回时瞬态排序值，绝不回填落列——每 query 相关，落列即错；
 *    SQL 侧 CHECK(retrieval_score IS NULL) 结构封死）；status 恒 candidate
 *    （激活候选属 MEM-13 确认状态机）。
 *
 * 本层刻意不做 schema 校验（那是 contracts/domain 的职责，本层只信「已验证输入」），只负责把
 * 字段送进承重 SQL 函数并映射返回值——与 memory-governance.ts / privacy-authorization.ts 保持
 * 同一分层。source_text 仅瞬时透传用于 SQL 侧重算 digest+字节长度，**不落库、不缓存、不打印**。
 */

/** 服务端签发授权快照的输入（application service seam，不是客户端 DTO）。 */
export interface MemoryAdmissionIssueInput {
  snapshotKey: string;
  dataSubjectId: string;
  threadBoundary: string;
  purpose: MemoryPurpose;
  allowedDataClass: MemoryAllowedDataClass;
  consentRevision: number;
  privacyEpoch: number;
  sourceType: MemorySourceType;
  sourceEntityId: string;
  immutableSourceVersion: string;
  eventSeqStart?: number;
  eventSeqEnd?: number;
  normalizationRecipeVersion: string;
  sourceText: string;
  policyVersion: string;
  expiresAt?: string;
}

export interface IssuedMemoryAdmissionSnapshot extends MemoryAdmissionAuthorization {}

export interface AdmittedMemoryRecord extends MemoryAdmissionReceipt {}

/** 服务端签发授权快照（仅 issuer role 可 EXECUTE；见 proof 的 asAdmissionIssuer）。 */
export async function issueMemoryAdmissionSnapshot(
  c: Client, input: MemoryAdmissionIssueInput,
): Promise<IssuedMemoryAdmissionSnapshot> {
  const r = await c.query<{
    snapshot_id: string; snapshot_key: string; controller_scope: MemoryAdmissionControllerScope;
    data_subject_id: string; access_principal_user_id: string; thread_boundary: string;
    purpose: MemoryPurpose; source_artifact_digest: string; source_utf8_byte_length: string | number;
    source_trust: 'trusted' | 'untrusted'; expires_at: string | null;
  }>(
    'SELECT * FROM memory_issue_admission_snapshot($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)',
    [
      input.snapshotKey, input.dataSubjectId, input.threadBoundary, input.purpose, input.allowedDataClass,
      input.consentRevision, input.privacyEpoch, input.sourceType, input.sourceEntityId,
      input.immutableSourceVersion, input.eventSeqStart ?? null, input.eventSeqEnd ?? null,
      input.normalizationRecipeVersion, input.sourceText, input.policyVersion, input.expiresAt ?? null,
    ],
  );
  const row = r.rows[0];
  const byteLen = Number(row?.source_utf8_byte_length);
  if (!row?.snapshot_id || !Number.isSafeInteger(byteLen) || byteLen < 0)
    throw Object.assign(new Error('memory_admission_issue_failed'), { code: 'memory_admission_issue_failed' });
  return {
    snapshotId: row.snapshot_id,
    snapshotKey: row.snapshot_key,
    controllerScope: row.controller_scope,
    dataSubjectId: row.data_subject_id,
    accessPrincipalUserId: row.access_principal_user_id,
    threadBoundary: row.thread_boundary,
    purpose: row.purpose,
    sourceArtifactDigest: row.source_artifact_digest,
    sourceUtf8ByteLength: byteLen,
    sourceTrust: row.source_trust,
    expiresAt: row.expires_at,
  };
}

/** 准入一条 candidate 元数据记录（app_role EXECUTE；三身份/范围/用途由快照派生）。 */
export async function admitMemoryRecord(
  c: Client, input: MemoryAdmissionCandidate,
): Promise<AdmittedMemoryRecord> {
  const r = await c.query<{
    id: string; status: string; fact_key: string; controller_scope: MemoryAdmissionControllerScope;
    data_subject_id: string; access_principal_user_id: string; thread_boundary: string;
    source_trust: 'trusted' | 'untrusted'; verification_state: 'unverified' | 'user_confirmed' | 'business_verified';
    retrieval_score: number | null; created: boolean;
  }>(
    'SELECT * FROM memory_admit_record($1,$2,$3,$4,$5,$6,$7,$8,$9)',
    [
      input.snapshotKey, input.sourceText, JSON.stringify(input.sourceSpan), input.producerClass,
      input.extractionConfidence, input.salience, input.language, input.contentDigest,
      input.idempotencyKey ?? null,
    ],
  );
  const row = r.rows[0];
  if (!row?.id) throw Object.assign(new Error('memory_admission_failed'), { code: 'memory_admission_failed' });
  return {
    id: row.id,
    status: row.status as AdmittedMemoryRecord['status'],
    factKey: row.fact_key,
    controllerScope: row.controller_scope,
    dataSubjectId: row.data_subject_id,
    accessPrincipalUserId: row.access_principal_user_id,
    threadBoundary: row.thread_boundary,
    sourceTrust: row.source_trust,
    verificationState: row.verification_state,
    retrievalScore: row.retrieval_score,
    created: row.created,
  };
}
