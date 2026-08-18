/**
 * @meetwise/db · 单轮与区间摘要（MEM-02）存储侧。
 *
 * 这是「可废弃的摘要派生物」纯数据访问层：不可变 summary（turn_summary/segment_summary）
 * append-only + 状态机 draft→verified→active→superseded/invalidated/fenced→purged。
 * **绝不重实现**删除根（issuer 冻结在 privacy-authorization.ts，erasure 归 0091/0112）、
 * **绝不重实现** MEM-03 树逻辑 / CTX-04 snapshot / 真实模型摘要（归 MODEL-OP）。
 *
 * 铁律（对齐 CLAUDE.md）：
 *   - 摘要正文是派生内容（未受信输入 data fence）：只以绑定参数进 SECURITY DEFINER 函数，
 *     content_digest 由 SQL 侧重算 sha256，绝不采信调用方自报指纹。
 *   - `draftMemorySummary` 必须在 memory_summarizer 角色下调用（该角色只能从冻结范围写 draft，
 *     status 硬编码 'draft'）；runtime(app_role) 无 draft EXECUTE。
 *   - claims 每 claim 带 spanLocator，固定 UTF-8 字节偏移（offsetKind='utf8_byte'）。
 *   - 删除侧三 resolver（begin/claim/purge）复用冻结 PrivacyAuthorizationIssuer，不重实现。
 */
import type { Client } from './principal.ts';
import type {
  SummaryKind, SummaryStatus, SummaryClaim,
} from '@meetwise/domain';
import { deriveSummaryContentDigest, assertSummaryClaimSpan } from '@meetwise/domain';

function fail(code: string): never { throw Object.assign(new Error(code), { code }); }

export interface DraftMemorySummaryInput {
  threadId: string;
  kind: SummaryKind;
  sourceEventSeqStart: number;
  sourceEventSeqEnd: number;
  sourceArtifactDigest: string;
  sourceUtf8ByteLength: number;
  content: string;
  contentDigest: string;
  claims: SummaryClaim[];
  promptVersion: string;
  modelVersion: string;
  tokenizerVersion: string;
  policyVersion: string;
  normalizationRecipeVersion: string;
  extractionRecipeVersion: string;
  verificationRecipeVersion: string;
  immutableSourceVersion: string;
  language: string;
  parentSummaryId?: string | null;
  supersedesSummaryId?: string | null;
  idempotencyKey?: string | null;
}

export interface MemorySummaryDraftReceipt {
  id: string;
  version: number;
  status: SummaryStatus;
  sourceRangeDigest: string;
  replayed: boolean;
}

/** 幂等键哈希（privacy_erasure_request 要求 64-hex；本处仅供 begin erasure 复用同一约束）。 */
const HASH64_RE = /^[a-f0-9]{64}$/;

/**
 * 写入 draft（summarizer 专用：调用方 client 必须已 `SET LOCAL ROLE memory_summarizer` 并
 * 绑定 app.principal_user）。status 由 SQL 侧硬编码 'draft'，模型输出绝不 direct active。
 */
export async function draftMemorySummary(c: Client, input: DraftMemorySummaryInput): Promise<MemorySummaryDraftReceipt> {
  if (!input.threadId || input.threadId.length === 0) fail('memory_summary_thread_invalid');
  if (input.kind !== 'turn_summary' && input.kind !== 'segment_summary') fail('memory_summary_kind_invalid');
  if (!Number.isSafeInteger(input.sourceEventSeqStart) || input.sourceEventSeqStart < 1) fail('memory_summary_seq_invalid');
  if (!Number.isSafeInteger(input.sourceEventSeqEnd) || input.sourceEventSeqEnd < input.sourceEventSeqStart) fail('memory_summary_seq_invalid');
  if (!HASH64_RE.test(input.sourceArtifactDigest)) fail('memory_summary_source_artifact_digest_invalid');
  if (!Number.isSafeInteger(input.sourceUtf8ByteLength) || input.sourceUtf8ByteLength < 0) fail('memory_summary_byte_len_invalid');
  // 内容 digest + claim span 先 fail-closed 校验一遍（与 SQL 侧双保险）。
  if (deriveSummaryContentDigest(input.content) !== input.contentDigest) fail('memory_summary_content_digest_mismatch');
  for (const claim of input.claims ?? []) {
    assertSummaryClaimSpan(claim.span);
    if (claim.span.end > input.sourceUtf8ByteLength) fail('memory_summary_span_out_of_bounds');
  }

  const r = await c.query<{ id: string; version: string | number; status: SummaryStatus; source_range_digest: string; replayed: boolean }>(
    `SELECT * FROM memory_summary_draft($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)`,
    [
      input.threadId, input.kind, input.sourceEventSeqStart, input.sourceEventSeqEnd,
      input.sourceArtifactDigest, input.sourceUtf8ByteLength,
      input.content, input.contentDigest, JSON.stringify(input.claims ?? []),
      input.promptVersion, input.modelVersion, input.tokenizerVersion, input.policyVersion,
      input.normalizationRecipeVersion, input.extractionRecipeVersion, input.verificationRecipeVersion,
      input.immutableSourceVersion, input.language,
      input.parentSummaryId ?? null, input.supersedesSummaryId ?? null, input.idempotencyKey ?? null,
    ],
  );
  const row = r.rows[0];
  const version = Number(row?.version);
  if (!row?.id || !Number.isSafeInteger(version) || version < 1) fail('memory_summary_draft_failed');
  return { id: row.id, version, status: row.status, sourceRangeDigest: row.source_range_digest, replayed: row.replayed === true };
}

export interface MemorySummaryTransitionReceipt { id: string; status: SummaryStatus; casVersion: number }

function mapTransition(row?: { id: string; status: SummaryStatus; cas_version: string | number } | null): MemorySummaryTransitionReceipt | null {
  if (!row) return null;
  const casVersion = Number(row.cas_version);
  if (!Number.isSafeInteger(casVersion) || casVersion < 1) fail('memory_summary_transition_invalid');
  return { id: row.id, status: row.status, casVersion };
}

/** 受控 verify：draft→verified（内容 digest + claims span + 来源仍冻结复核，全过才 CAS）。 */
export async function verifyMemorySummary(c: Client, id: string, expectedCasVersion: number): Promise<MemorySummaryTransitionReceipt | null> {
  const r = await c.query<{ id: string; status: SummaryStatus; cas_version: string | number }>(
    'SELECT * FROM memory_summary_verify($1,$2)', [id, expectedCasVersion]);
  return mapTransition(r.rows[0]);
}

/** activate：verified→active + 自动 supersede 同 slot 旧 active。 */
export async function activateMemorySummary(c: Client, id: string, expectedCasVersion: number): Promise<MemorySummaryTransitionReceipt | null> {
  const r = await c.query<{ id: string; status: SummaryStatus; cas_version: string | number }>(
    'SELECT * FROM memory_summary_activate($1,$2)', [id, expectedCasVersion]);
  return mapTransition(r.rows[0]);
}

/** 显式 supersede：active→superseded。 */
export async function supersedeMemorySummary(c: Client, id: string, expectedCasVersion: number): Promise<MemorySummaryTransitionReceipt | null> {
  const r = await c.query<{ id: string; status: SummaryStatus; cas_version: string | number }>(
    'SELECT * FROM memory_summary_supersede($1,$2)', [id, expectedCasVersion]);
  return mapTransition(r.rows[0]);
}

/** invalidate：verified/active→invalidated（校验失败退休）。 */
export async function invalidateMemorySummary(c: Client, id: string, expectedCasVersion: number): Promise<MemorySummaryTransitionReceipt | null> {
  const r = await c.query<{ id: string; status: SummaryStatus; cas_version: string | number }>(
    'SELECT * FROM memory_summary_invalidate($1,$2)', [id, expectedCasVersion]);
  return mapTransition(r.rows[0]);
}

export interface MemorySummaryRow {
  id: string;
  kind: SummaryKind;
  version: number;
  casVersion: number;
  sourceEventSeqStart: number;
  sourceEventSeqEnd: number;
  sourceRangeDigest: string;
  sourceArtifactDigest: string;
  sourceUtf8ByteLength: number;
  content: string;
  contentDigest: string;
  claims: SummaryClaim[];
  promptVersion: string;
  modelVersion: string;
  tokenizerVersion: string;
  policyVersion: string;
  parentSummaryId: string | null;
  supersedesSummaryId: string | null;
  status: SummaryStatus;
  createdAt: string;
}

type SummaryRowRow = {
  id: string; kind: SummaryKind; version: string | number; cas_version: string | number;
  source_event_seq_start: string | number; source_event_seq_end: string | number;
  source_range_digest: string; source_artifact_digest: string; source_utf8_byte_length: string | number;
  content: string; content_digest: string; claims: SummaryClaim[];
  prompt_version: string; model_version: string; tokenizer_version: string; policy_version: string;
  parent_summary_id: string | null; supersedes_summary_id: string | null;
  status: SummaryStatus; created_at: string;
};

function mapSummary(row: SummaryRowRow): MemorySummaryRow {
  const version = Number(row.version);
  const casVersion = Number(row.cas_version);
  const sourceEventSeqStart = Number(row.source_event_seq_start);
  const sourceEventSeqEnd = Number(row.source_event_seq_end);
  const sourceUtf8ByteLength = Number(row.source_utf8_byte_length);
  if (!Number.isSafeInteger(version) || version < 1
    || !Number.isSafeInteger(casVersion) || casVersion < 1
    || !Number.isSafeInteger(sourceEventSeqStart) || sourceEventSeqStart < 1
    || !Number.isSafeInteger(sourceEventSeqEnd) || sourceEventSeqEnd < sourceEventSeqStart
    || !Number.isSafeInteger(sourceUtf8ByteLength) || sourceUtf8ByteLength < 0) fail('memory_summary_row_invalid');
  return {
    id: row.id, kind: row.kind, version, casVersion,
    sourceEventSeqStart, sourceEventSeqEnd, sourceRangeDigest: row.source_range_digest,
    sourceArtifactDigest: row.source_artifact_digest, sourceUtf8ByteLength,
    content: row.content, contentDigest: row.content_digest, claims: row.claims,
    promptVersion: row.prompt_version, modelVersion: row.model_version,
    tokenizerVersion: row.tokenizer_version, policyVersion: row.policy_version,
    parentSummaryId: row.parent_summary_id, supersedesSummaryId: row.supersedes_summary_id,
    status: row.status, createdAt: row.created_at,
  };
}

/** 进上下文读取面：仅 active（摘要校验不通过不得成为上下文）。 */
export async function hydrateMemorySummaries(c: Client, threadId: string): Promise<MemorySummaryRow[]> {
  const r = await c.query<SummaryRowRow>('SELECT * FROM memory_summary_hydrate($1)', [threadId]);
  return r.rows.map(mapSummary);
}

/** 恢复读取面：draft/verified/active/superseded/invalidated（排除 fenced/purged）。 */
export async function replayMemorySummaries(c: Client, threadId: string): Promise<MemorySummaryRow[]> {
  const r = await c.query<SummaryRowRow>('SELECT * FROM memory_summary_replay($1)', [threadId]);
  return r.rows.map(mapSummary);
}

export interface MemorySummaryDispatchDecision {
  id: string;
  status: SummaryStatus;
  dispatchDecision: number;
  voidReason: string | null;
}

/** 补偿控制：进上下文前复核 live 状态，围栏先赢 → voided（防复活）。 */
export async function dispatchMemorySummaryHydrate(c: Client, id: string, observedStatus: SummaryStatus): Promise<MemorySummaryDispatchDecision> {
  const r = await c.query<{ id: string; status: SummaryStatus; dispatch_decision: number; void_reason: string | null }>(
    'SELECT * FROM memory_summary_dispatch_hydrate($1,$2)', [id, observedStatus]);
  const row = r.rows[0];
  if (!row?.id) fail('memory_summary_dispatch_failed');
  return { id: row.id, status: row.status, dispatchDecision: row.dispatch_decision, voidReason: row.void_reason };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 账户删除 sink 闭合（0112）——复用冻结 PrivacyAuthorizationIssuer（0091），只包 MEM-02 自己的
// begin/claim/purge（镜像 0111 的 CTX 包壳，不重实现删除根）。
// ═══════════════════════════════════════════════════════════════════════════════

export interface MemorySummaryErasureTarget { sink: string; resourceHmac: string }
export interface BegunMemorySummaryErasure {
  requestId: string;
  requestStatus: string;
  privacyEpoch: number;
  targetSetDigest: string;
  targets: MemorySummaryErasureTarget[];
  replayed: boolean;
}

export async function beginMemorySummaryErasure(c: Client, idempotencyKeyHash: string): Promise<BegunMemorySummaryErasure> {
  const r = await c.query<{
    request_id: string; request_status: string; privacy_epoch: string | number;
    target_set_digest: string; sink: string; resource_hmac: string; replayed: boolean;
  }>('SELECT * FROM memory_summary_begin_erasure($1)', [idempotencyKeyHash]);
  if (r.rowCount === 0) fail('memory_summary_begin_erasure_failed');
  const first = r.rows[0]!;
  const privacyEpoch = Number(first.privacy_epoch);
  if (!Number.isSafeInteger(privacyEpoch) || privacyEpoch < 1) fail('memory_summary_begin_erasure_failed');
  return {
    requestId: first.request_id,
    requestStatus: first.request_status,
    privacyEpoch,
    targetSetDigest: first.target_set_digest,
    targets: r.rows.map((row) => ({ sink: row.sink, resourceHmac: row.resource_hmac })),
    replayed: first.replayed,
  };
}

export interface ClaimedMemorySummaryTarget { targetId: string; leaseToken: string; attempt: number }

export async function claimMemorySummaryTarget(
  c: Client, jti: string, targetId: string, worker: string, leaseSeconds = 60,
): Promise<ClaimedMemorySummaryTarget | null> {
  const r = await c.query<{ target_id: string; lease_token: string | null; status: string; attempt: number }>(
    'SELECT * FROM privacy_authorization_claim_memory_summary_target($1,$2,$3,$4)', [jti, targetId, worker, leaseSeconds],
  );
  const row = r.rows[0];
  if (!row || row.status === 'erased') return null;
  if (!row.lease_token || !Number.isSafeInteger(Number(row.attempt)))
    fail('memory_summary_target_claim_invalid');
  return { targetId: row.target_id, leaseToken: row.lease_token, attempt: Number(row.attempt) };
}

export interface PurgedMemorySummaryTarget { targetId: string; status: string; deletedCount: number; requestStatus: string }

export async function purgeMemorySummaryTarget(c: Client, targetId: string, token: string): Promise<PurgedMemorySummaryTarget> {
  const r = await c.query<{ target_id: string; status: string; deleted_count: string | number; request_status: string }>(
    'SELECT * FROM privacy_purge_memory_summary_target($1,$2)', [targetId, token],
  );
  const row = r.rows[0];
  if (!row?.target_id) fail('memory_summary_target_purge_failed');
  return { targetId: row.target_id, status: row.status, deletedCount: Number(row.deleted_count), requestStatus: row.request_status };
}
