import type { Client } from './principal.ts';
import type {
  MemoryFactNamespace, MemoryFactCardinality, MemoryAdjudicationStatus, MemoryUserConfirmation,
  MemoryConfirmationKind, MemoryFactWrite,
} from '@meetwise/contracts';

/**
 * 记忆事实裁决（MEM-13）数据库操作层。
 *
 * 承重边界（与 packages/db/migrations/0099_memory_fact_adjudication.sql 一一对应）：
 *  - 物化（materialize）消费 MEM-12 准入 candidate（memory_admission_record），**只读、绝不 UPDATE**
 *    —— MEM-13 是消费 candidate，不是重写准入。产出的裁决事实恒 status='candidate'（模型只能写
 *    candidate），user_confirmation 恒 'unconfirmed'，retrieval_score 恒 NULL。
 *  - 稳定 fact_key 服务端派生（owner+scope+purpose+namespace+归一化 subject），客户端 DTO 无
 *    fact_key/owner/purpose/scope 字段可传（对齐 MEM-12 铁律）。
 *  - 显式状态机 + audited transition：confirm(candidate→active，仅用户确认或受信业务事实)、
 *    correct(active→contradicted + 插入新 active)、revoke(active→revoked)、expire(active→expired)。
 *    confirm/correct/revoke 全部 CAS from→to，陈旧落败/非法跃迁返回 null（不抛）；硬校验失败
 *    （激活规则违反/过期候选/跨 owner）由 SQL RAISE 抛错（fail-closed）。
 *  - 六分量分离：source_trust / extraction_confidence / user_confirmation / valid_until(freshness)
 *    / salience / retrieval_score 是独立列，绝不合并成单一总分；retrieval_score 裁决期恒 NULL。
 *  - 并发不变量：partial unique index（单值至多一个 active）+ advisory 锁（按 owner+fact_key 串行
 *    化）+ CAS from→to。
 *
 * 这里刻意不做 schema 校验与 PII 护栏（那是 contracts/domain 的职责，本层只信「已验证输入」），
 * 只负责把字段送进承重 SQL 函数并映射返回值——与 memory-governance.ts / memory-admission.ts 保持
 * 同一分层。content 仅瞬时透传用于 SQL 侧重算 digest（与准入 content_digest 逐字节一致），不缓存、
 * 不打印。
 */

type MemoryPurpose = MemoryFactWrite['purpose'];
type SourceTrust = 'trusted' | 'untrusted';

export interface MaterializeAdjudicationFactInput {
  admissionRecordId: string;
  content: string;
  namespace: MemoryFactNamespace;
  cardinality: MemoryFactCardinality;
  subject: string;
  validUntil?: string | null;
  idempotencyKey?: string;
}

export interface MaterializedAdjudicationFact {
  id: string;
  status: MemoryAdjudicationStatus;
  factKey: string;
  namespace: MemoryFactNamespace;
  cardinality: MemoryFactCardinality;
  sourceTrust: SourceTrust;
  userConfirmation: MemoryUserConfirmation;
  retrievalScore: number | null;
  created: boolean;
}

export interface ConfirmedAdjudicationFact {
  id: string;
  status: MemoryAdjudicationStatus;
  userConfirmation: MemoryUserConfirmation;
  supersededFactId: string | null;
}

export interface CorrectedAdjudicationFact {
  id: string;
  status: MemoryAdjudicationStatus;
  contradictedFactId: string | null;
  factKey: string;
}

export interface RevokedAdjudicationFact { id: string; status: string }

/**
 * 物化：消费准入 candidate → 恒产 candidate 事实。content 必须与准入 content_digest 逐字节一致
 * （SQL 侧重验 data fence）；fact_key 由服务端派生。幂等键重放 / 同 candidate 已物化返回既有行
 * （created=false）。硬校验失败（跨 owner/非 candidate/digest 不符）抛错。
 */
export async function materializeAdjudicationFact(
  c: Client, input: MaterializeAdjudicationFactInput,
): Promise<MaterializedAdjudicationFact> {
  const r = await c.query<{
    id: string; status: MemoryAdjudicationStatus; fact_key: string; cardinality: MemoryFactCardinality;
    source_trust: SourceTrust; user_confirmation: MemoryUserConfirmation; retrieval_score: number | null; created: boolean;
  }>(
    'SELECT * FROM memory_adjudicate_materialize($1,$2,$3,$4,$5,$6,$7)',
    [input.admissionRecordId, input.content, input.namespace, input.cardinality, input.subject,
      input.validUntil ?? null, input.idempotencyKey ?? null],
  );
  const row = r.rows[0];
  if (!row?.id)
    throw Object.assign(new Error('memory_adjudication_materialize_failed'), { code: 'memory_adjudication_materialize_failed' });
  return {
    id: row.id, status: row.status, factKey: row.fact_key, namespace: input.namespace,
    cardinality: row.cardinality, sourceTrust: row.source_trust, userConfirmation: row.user_confirmation,
    retrievalScore: row.retrieval_score, created: row.created,
  };
}

/**
 * 确认：candidate → active（仅用户确认或受信业务事实）。单值事实若同 fact_key 已有 active，
 * 旧事实 → superseded + 关系边（新 supersedes 旧）。非法跃迁 / 陈旧落败返回 null；激活规则违反
 * （模型候选走 business_fact 路径）/ 过期候选 / 跨 owner 由 SQL RAISE 抛错。
 */
export async function confirmAdjudicationFact(
  c: Client, factId: string, confirmation: MemoryConfirmationKind,
): Promise<ConfirmedAdjudicationFact | null> {
  const r = await c.query<{
    id: string; status: MemoryAdjudicationStatus; user_confirmation: MemoryUserConfirmation; superseded_fact_id: string | null;
  }>('SELECT * FROM memory_adjudicate_confirm($1,$2)', [factId, confirmation]);
  const row = r.rows[0];
  if (!row) return null;
  return { id: row.id, status: row.status, userConfirmation: row.user_confirmation, supersededFactId: row.superseded_fact_id };
}

/**
 * 纠正：active → contradicted + 插入新 active（用户纠正错误事实）。CAS from active（陈旧落败
 * 返回 null）；关系边 new--contradicts-->old。旧事实不删，保留审计链。
 */
export async function correctAdjudicationFact(
  c: Client, factId: string, content: string, validUntil?: string | null, idempotencyKey?: string,
): Promise<CorrectedAdjudicationFact | null> {
  const r = await c.query<{
    id: string; status: MemoryAdjudicationStatus; contradicted_fact_id: string | null; fact_key: string;
  }>('SELECT * FROM memory_adjudicate_correct($1,$2,$3,$4)', [factId, content, validUntil ?? null, idempotencyKey ?? null]);
  const row = r.rows[0];
  if (!row) return null;
  return { id: row.id, status: row.status, contradictedFactId: row.contradicted_fact_id, factKey: row.fact_key };
}

/** 撤回：active → revoked。CAS from active（非 active / 陈旧落败返回 null）。 */
export async function revokeAdjudicationFact(c: Client, factId: string): Promise<RevokedAdjudicationFact | null> {
  const r = await c.query<{ id: string; status: string }>('SELECT * FROM memory_adjudicate_revoke($1)', [factId]);
  const row = r.rows[0];
  if (!row) return null;
  return { id: row.id, status: row.status };
}

/** 过期 sweep：active → expired（valid_until 已过，freshness 自动非 active）。返回转移条数。 */
export async function expireAdjudicationFacts(c: Client, purpose?: MemoryPurpose): Promise<number> {
  const r = await c.query<{ expired_count: string | number }>(
    'SELECT * FROM memory_adjudicate_expire($1)', [purpose ?? null],
  );
  const n = Number(r.rows[0]?.expired_count);
  if (!Number.isSafeInteger(n) || n < 0)
    throw Object.assign(new Error('memory_adjudication_expire_failed'), { code: 'memory_adjudication_expire_failed' });
  return n;
}
