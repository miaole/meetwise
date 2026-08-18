/**
 * @meetwise/db · 可验证压缩快照（CTX-04）存储侧。
 *
 * 这是「可重放压缩边界」纯数据访问层：context_compression_snapshot 固化事件范围、原始 checksum、
 * 版本、摘要 hash + claim→span、first_kept_event_id 与显式状态 enum。**绝不重实现**删除根
 * （begin/claim/purge 归 CTX-06）、**绝不重实现** MEM-02 summary 本体 / MEM-03 树 / MEM-14
 * memory_context_snapshot、**绝不重实现**真实 tokenizer / 真实模型（MODEL-OP）。
 *
 * 铁律（对齐 CLAUDE.md / memory-context-design.md §5）：
 *   - snapshot 是压缩边界对象，不是记忆召回快照；原事件 append-only（本层无 conversation_event
 *     的 UPDATE/DELETE 生产路径）。
 *   - 摘要 hash（summary_content_digest）与 source_range_digest 均由 SQL 侧重算，绝不采信自报指纹。
 *   - first_kept_event_id 由 DB 确定性派生（= source_event_seq_end+1 的 active 事件），同 range
 *     同 digest → 同 firstKeptEventId（重放一致性）。
 *   - claim 无法回溯 → draft 拒（不落半写）/ activate 丢（返回 null），零模型补全。
 */
import type { Client } from './principal.ts';
import type { CompressionSnapshotStatus, SummaryClaim } from '@meetwise/domain';

function fail(code: string): never { throw Object.assign(new Error(code), { code }); }

export interface DraftCompressionSnapshotInput {
  threadId: string;
  sourceEventSeqStart: number;
  sourceEventSeqEnd: number;
  sourceArtifactDigest: string;
  sourceUtf8ByteLength: number;
  summaryContent: string;
  summaryContentDigest: string;
  summaryClaims: SummaryClaim[];
  policyVersion: string;
  promptVersion: string;
  modelVersion: string;
  tokenizerVersion: string;
  idempotencyKey?: string | null;
}

export interface CompressionSnapshotDraftReceipt {
  id: string;
  status: CompressionSnapshotStatus;
  sourceRangeDigest: string;
  summaryContentDigest: string;
  firstKeptEventId: string;
  casVersion: number;
  replayed: boolean;
}

export interface CompressionSnapshotTransitionReceipt {
  id: string;
  status: CompressionSnapshotStatus;
  casVersion: number;
}

export interface CompressionSnapshotRow {
  id: string;
  sourceEventSeqStart: number;
  sourceEventSeqEnd: number;
  sourceRangeDigest: string;
  sourceArtifactDigest: string;
  sourceUtf8ByteLength: number;
  policyVersion: string;
  promptVersion: string;
  modelVersion: string;
  tokenizerVersion: string;
  summaryContentDigest: string;
  summaryClaims: SummaryClaim[];
  firstKeptEventId: string;
  status: CompressionSnapshotStatus;
  casVersion: number;
  createdAt: string;
}

const HASH64_RE = /^[a-f0-9]{64}$/;

/**
 * 写入 draft（压缩边界冻结）。status 由 SQL 侧硬编码 'draft'；first_kept_event_id 由 SQL 侧
 * 确定性派生；摘要 hash 与 range digest 服务端重算。模型输出绝不 direct active。
 */
export async function draftCompressionSnapshot(c: Client, input: DraftCompressionSnapshotInput): Promise<CompressionSnapshotDraftReceipt> {
  if (!input.threadId || input.threadId.length === 0) fail('ctx04_thread_invalid');
  if (!Number.isSafeInteger(input.sourceEventSeqStart) || input.sourceEventSeqStart < 1) fail('ctx04_seq_invalid');
  if (!Number.isSafeInteger(input.sourceEventSeqEnd) || input.sourceEventSeqEnd < input.sourceEventSeqStart) fail('ctx04_seq_invalid');
  if (!HASH64_RE.test(input.sourceArtifactDigest)) fail('ctx04_source_artifact_digest_invalid');
  if (!Number.isSafeInteger(input.sourceUtf8ByteLength) || input.sourceUtf8ByteLength < 0) fail('ctx04_byte_len_invalid');
  if (typeof input.summaryContent !== 'string' || input.summaryContent.length === 0) fail('ctx04_summary_content_empty');
  if (!HASH64_RE.test(input.summaryContentDigest)) fail('ctx04_summary_content_digest_invalid');

  const r = await c.query<{
    id: string; status: CompressionSnapshotStatus; source_range_digest: string;
    summary_content_digest: string; first_kept_event_id: string;
    cas_version: string | number; replayed: boolean;
  }>(
    `SELECT * FROM context_compression_snapshot_draft($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
    [
      input.threadId, input.sourceEventSeqStart, input.sourceEventSeqEnd,
      input.sourceArtifactDigest, input.sourceUtf8ByteLength,
      input.summaryContent, input.summaryContentDigest, JSON.stringify(input.summaryClaims ?? []),
      input.policyVersion, input.promptVersion, input.modelVersion, input.tokenizerVersion,
      input.idempotencyKey ?? null,
    ],
  );
  const row = r.rows[0];
  const casVersion = Number(row?.cas_version);
  if (!row?.id || !Number.isSafeInteger(casVersion) || casVersion < 1 || !row.first_kept_event_id) fail('ctx04_draft_failed');
  return {
    id: row.id, status: row.status, sourceRangeDigest: row.source_range_digest,
    summaryContentDigest: row.summary_content_digest, firstKeptEventId: row.first_kept_event_id,
    casVersion, replayed: row.replayed === true,
  };
}

function mapTransition(row?: { id: string; status: CompressionSnapshotStatus; cas_version: string | number } | null): CompressionSnapshotTransitionReceipt | null {
  if (!row) return null;
  const casVersion = Number(row.cas_version);
  if (!Number.isSafeInteger(casVersion) || casVersion < 1) fail('ctx04_transition_invalid');
  return { id: row.id, status: row.status, casVersion };
}

/** 受控 activate：draft→active（重验 claim 回溯 + 来源仍冻结 + CAS 单赢家）。失败/漂移返回 null。 */
export async function activateCompressionSnapshot(c: Client, id: string, expectedCasVersion: number): Promise<CompressionSnapshotTransitionReceipt | null> {
  const r = await c.query<{ id: string; status: CompressionSnapshotStatus; cas_version: string | number }>(
    'SELECT * FROM context_compression_snapshot_activate($1,$2)', [id, expectedCasVersion]);
  return mapTransition(r.rows[0]);
}

/** 显式退休：active→superseded（CAS 单赢家）。 */
export async function supersedeCompressionSnapshot(c: Client, id: string, expectedCasVersion: number): Promise<CompressionSnapshotTransitionReceipt | null> {
  const r = await c.query<{ id: string; status: CompressionSnapshotStatus; cas_version: string | number }>(
    'SELECT * FROM context_compression_snapshot_supersede($1,$2)', [id, expectedCasVersion]);
  return mapTransition(r.rows[0]);
}

type SnapshotRowRow = {
  id: string; source_event_seq_start: string | number; source_event_seq_end: string | number;
  source_range_digest: string; source_artifact_digest: string; source_utf8_byte_length: string | number;
  policy_version: string; prompt_version: string; model_version: string; tokenizer_version: string;
  summary_content_digest: string; summary_claims: SummaryClaim[]; first_kept_event_id: string;
  status: CompressionSnapshotStatus; cas_version: string | number; created_at: string;
};

function mapRow(row: SnapshotRowRow): CompressionSnapshotRow {
  const sourceEventSeqStart = Number(row.source_event_seq_start);
  const sourceEventSeqEnd = Number(row.source_event_seq_end);
  const sourceUtf8ByteLength = Number(row.source_utf8_byte_length);
  const casVersion = Number(row.cas_version);
  if (!Number.isSafeInteger(sourceEventSeqStart) || sourceEventSeqStart < 1
    || !Number.isSafeInteger(sourceEventSeqEnd) || sourceEventSeqEnd < sourceEventSeqStart
    || !Number.isSafeInteger(sourceUtf8ByteLength) || sourceUtf8ByteLength < 0
    || !Number.isSafeInteger(casVersion) || casVersion < 1) fail('ctx04_row_invalid');
  return {
    id: row.id, sourceEventSeqStart, sourceEventSeqEnd, sourceRangeDigest: row.source_range_digest,
    sourceArtifactDigest: row.source_artifact_digest, sourceUtf8ByteLength,
    policyVersion: row.policy_version, promptVersion: row.prompt_version,
    modelVersion: row.model_version, tokenizerVersion: row.tokenizer_version,
    summaryContentDigest: row.summary_content_digest, summaryClaims: row.summary_claims,
    firstKeptEventId: row.first_kept_event_id, status: row.status, casVersion, createdAt: row.created_at,
  };
}

/** 进上下文读取面：仅 active（摘要校验不通过不得成为上下文）。 */
export async function hydrateCompressionSnapshots(c: Client, threadId: string): Promise<CompressionSnapshotRow[]> {
  const r = await c.query<SnapshotRowRow>('SELECT * FROM context_compression_snapshot_hydrate($1)', [threadId]);
  return r.rows.map(mapRow);
}

/** 恢复读取面：draft/active/superseded（排除 fenced/purged）。 */
export async function replayCompressionSnapshots(c: Client, threadId: string): Promise<CompressionSnapshotRow[]> {
  const r = await c.query<SnapshotRowRow>('SELECT * FROM context_compression_snapshot_replay($1)', [threadId]);
  return r.rows.map(mapRow);
}
