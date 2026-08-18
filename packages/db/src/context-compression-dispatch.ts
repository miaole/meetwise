/**
 * @meetwise/db · 并发与故障恢复（CTX-05）存储侧：压缩派发/提交状态机。
 *
 * 这是「压缩」的持久派发/提交层：`context_compression_dispatch` 以 (owner, thread, source-range,
 * version) 单行单赢家，承载三条承重铁律（register L77 / memory-context-design L124/L135/L136）：
 *   - 边界保护：claim 前 SQL 服务端重验「稳定边界」（半个 turn / 未完成工具 / 来源仍会变化 /
 *     删除围栏已生效 / 系统快照 → 拒，零模型）。域侧镜像 `classifyCompressibleRange` 供 proof 交叉 pin。
 *   - lease/CAS 提交：claim 抢租约（过期可抢占 = 崩溃恢复，不误杀 in-flight）；commit 是 CAS
 *     （`WHERE version=expected` + version+1），CAS 失败 0 行 → 返回 null（调用方丢弃计算结果，
 *     不覆盖赢家已提交的 snapshot_id）。
 *   - unknown 不自动重发：dispatching 后 mark_unknown → 终态 sticky；再次 claim 同范围返回既有
 *     unknown 行（绝不重发、绝不同键重试、绝不替换模型——model/prompt/policy 版本 claim 时冻结）。
 *
 * **绝不重实现**：删除根（begin/claim/purge 归 CTX-06）、真实模型压缩调用（MODEL-OP，本层零模型
 *   seam-before-wiring）、四原语本体（复用 0115/0108 的 CAS 模式 + acquireLease 的过期可抢占模式，
 *   绑定本表而非 ai_graph_run）。
 */
import type { Client } from './principal.ts';
import type { CompressionDispatchStatus } from '@meetwise/domain';

function fail(code: string): never { throw Object.assign(new Error(code), { code }); }

const HASH64_RE = /^[a-f0-9]{64}$/;

export interface ClaimCompressionDispatchInput {
  threadId: string;
  sourceEventSeqStart: number;
  sourceEventSeqEnd: number;
  policyVersion: string;
  promptVersion: string;
  modelVersion: string;
  /** 租约持有者（worker 身份）；claim 后只有持有者可 mark_dispatched。 */
  leaseOwner: string;
  leaseSeconds: number;
  idempotencyKey?: string | null;
}

export interface CompressionDispatchClaimReceipt {
  id: string;
  status: CompressionDispatchStatus;
  version: number;
  sourceRangeDigest: string;
  leaseOwner: string | null;
  leaseExpiresAt: string | null;
  snapshotId: string | null;
  replayed: boolean;
}

export interface CompressionDispatchTransitionReceipt {
  id: string;
  status: CompressionDispatchStatus;
  version: number;
  snapshotId?: string | null;
}

export interface CompressionDispatchRow {
  id: string;
  sourceEventSeqStart: number;
  sourceEventSeqEnd: number;
  sourceRangeDigest: string;
  version: number;
  status: CompressionDispatchStatus;
  leaseOwner: string | null;
  leaseExpiresAt: string | null;
  snapshotId: string | null;
  policyVersion: string;
  promptVersion: string;
  modelVersion: string;
  createdAt: string;
  updatedAt: string;
}

function mapTimestamp(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  const d = v instanceof Date ? v : new Date(String(v));
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function mapClaim(row: {
  id: string; status: CompressionDispatchStatus; version: string | number; source_range_digest: string;
  lease_owner: string | null; lease_expires_at: unknown; snapshot_id: string | null; replayed: boolean;
} | undefined): CompressionDispatchClaimReceipt {
  if (!row?.id) fail('ctx05_claim_failed');
  const version = Number(row.version);
  if (!Number.isSafeInteger(version) || version < 1 || !HASH64_RE.test(row.source_range_digest)) fail('ctx05_claim_invalid_row');
  return {
    id: row.id, status: row.status, version, sourceRangeDigest: row.source_range_digest,
    leaseOwner: row.lease_owner ?? null, leaseExpiresAt: mapTimestamp(row.lease_expires_at),
    snapshotId: row.snapshot_id ?? null, replayed: row.replayed === true,
  };
}

function mapTransition(row: {
  id: string; status: CompressionDispatchStatus; version: string | number; snapshot_id?: string | null;
} | undefined): CompressionDispatchTransitionReceipt | null {
  if (!row) return null;
  const version = Number(row.version);
  if (!Number.isSafeInteger(version) || version < 1) fail('ctx05_transition_invalid_row');
  return { id: row.id, status: row.status, version, snapshotId: row.snapshot_id ?? null };
}

/**
 * 抢租约（崩溃后可过期抢占）+ 边界重验 + 幂等。返回该范围的 dispatch 行；claim 前 SQL 已重验
 * 稳定边界（非稳定范围在此被拒，不半写、不派发）。已有 dispatching/committed/unknown/discarded
 * → 返回既有（不重发）；claimed 未过期 → wait（不误杀 in-flight）；claimed 已过期 → 抢占。
 */
export async function claimCompressionDispatch(c: Client, input: ClaimCompressionDispatchInput): Promise<CompressionDispatchClaimReceipt> {
  if (!input.threadId || input.threadId.length === 0) fail('ctx05_thread_invalid');
  if (!Number.isSafeInteger(input.sourceEventSeqStart) || input.sourceEventSeqStart < 1) fail('ctx05_seq_invalid');
  if (!Number.isSafeInteger(input.sourceEventSeqEnd) || input.sourceEventSeqEnd < input.sourceEventSeqStart) fail('ctx05_seq_invalid');
  if (!input.policyVersion || !input.promptVersion || !input.modelVersion) fail('ctx05_version_invalid');
  if (!input.leaseOwner || input.leaseOwner.length === 0) fail('ctx05_lease_owner_invalid');
  if (!Number.isSafeInteger(input.leaseSeconds) || input.leaseSeconds < 1 || input.leaseSeconds > 3600) fail('ctx05_lease_seconds_invalid');

  const r = await c.query<{
    id: string; status: CompressionDispatchStatus; version: string | number; source_range_digest: string;
    lease_owner: string | null; lease_expires_at: unknown; snapshot_id: string | null; replayed: boolean;
  }>(
    `SELECT * FROM context_compression_dispatch_claim($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
    [
      input.threadId, input.sourceEventSeqStart, input.sourceEventSeqEnd,
      input.policyVersion, input.promptVersion, input.modelVersion,
      input.leaseOwner, input.leaseSeconds, input.idempotencyKey ?? null,
    ],
  );
  return mapClaim(r.rows[0]);
}

/** 派发后边界：claimed→dispatching（仅租约持有者 + CAS）。失败/漂移返回 null。 */
export async function markCompressionDispatchDispatched(c: Client, id: string, leaseOwner: string, expectedVersion: number): Promise<CompressionDispatchTransitionReceipt | null> {
  const r = await c.query<{ id: string; status: CompressionDispatchStatus; version: string | number }>(
    'SELECT * FROM context_compression_dispatch_mark_dispatched($1,$2,$3)', [id, leaseOwner, expectedVersion]);
  return mapTransition(r.rows[0]);
}

/** CAS 提交：dispatching→committed（单赢家）。CAS 失败返回 null → 调用方丢弃计算结果。 */
export async function commitCompressionDispatch(c: Client, id: string, expectedVersion: number, snapshotId: string): Promise<CompressionDispatchTransitionReceipt | null> {
  const r = await c.query<{ id: string; status: CompressionDispatchStatus; version: string | number; snapshot_id: string | null }>(
    'SELECT * FROM context_compression_dispatch_commit($1,$2,$3)', [id, expectedVersion, snapshotId]);
  return mapTransition(r.rows[0]);
}

/** 派发后结果 unknown → 终态 sticky（绝不自动重发）。 */
export async function markCompressionDispatchUnknown(c: Client, id: string, expectedVersion: number): Promise<CompressionDispatchTransitionReceipt | null> {
  const r = await c.query<{ id: string; status: CompressionDispatchStatus; version: string | number }>(
    'SELECT * FROM context_compression_dispatch_mark_unknown($1,$2)', [id, expectedVersion]);
  return mapTransition(r.rows[0]);
}

/** 显式中止：claimed/dispatching→discarded（CAS 终态）。 */
export async function discardCompressionDispatch(c: Client, id: string, expectedVersion: number): Promise<CompressionDispatchTransitionReceipt | null> {
  const r = await c.query<{ id: string; status: CompressionDispatchStatus; version: string | number }>(
    'SELECT * FROM context_compression_dispatch_discard($1,$2)', [id, expectedVersion]);
  return mapTransition(r.rows[0]);
}

/** 崩溃恢复：租约过期抢占（不误杀 in-flight，真死才可被接管）。 */
export async function recoverCompressionDispatch(c: Client, id: string, leaseOwner: string, leaseSeconds: number): Promise<CompressionDispatchTransitionReceipt | null> {
  const r = await c.query<{ id: string; status: CompressionDispatchStatus; version: string | number }>(
    'SELECT * FROM context_compression_dispatch_recover($1,$2,$3)', [id, leaseOwner, leaseSeconds]);
  return mapTransition(r.rows[0]);
}

type DispatchRowRow = {
  id: string; source_event_seq_start: string | number; source_event_seq_end: string | number;
  source_range_digest: string; version: string | number; status: CompressionDispatchStatus;
  lease_owner: string | null; lease_expires_at: unknown; snapshot_id: string | null;
  policy_version: string; prompt_version: string; model_version: string;
  created_at: string; updated_at: string;
};

function mapRow(row: DispatchRowRow): CompressionDispatchRow {
  const sourceEventSeqStart = Number(row.source_event_seq_start);
  const sourceEventSeqEnd = Number(row.source_event_seq_end);
  const version = Number(row.version);
  if (!Number.isSafeInteger(sourceEventSeqStart) || sourceEventSeqStart < 1
    || !Number.isSafeInteger(sourceEventSeqEnd) || sourceEventSeqEnd < sourceEventSeqStart
    || !Number.isSafeInteger(version) || version < 1
    || !HASH64_RE.test(row.source_range_digest)) fail('ctx05_replay_invalid_row');
  return {
    id: row.id, sourceEventSeqStart, sourceEventSeqEnd, sourceRangeDigest: row.source_range_digest,
    version, status: row.status, leaseOwner: row.lease_owner ?? null,
    leaseExpiresAt: mapTimestamp(row.lease_expires_at), snapshotId: row.snapshot_id ?? null,
    policyVersion: row.policy_version, promptVersion: row.prompt_version, modelVersion: row.model_version,
    createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

/** 恢复读面（只 SELECT 存储行，不重算 digest）。 */
export async function replayCompressionDispatches(c: Client, threadId: string): Promise<CompressionDispatchRow[]> {
  const r = await c.query<DispatchRowRow>('SELECT * FROM context_compression_dispatch_replay($1)', [threadId]);
  return r.rows.map(mapRow);
}
