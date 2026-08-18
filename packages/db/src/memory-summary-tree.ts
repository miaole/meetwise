/**
 * @meetwise/db · 多层会话摘要树（MEM-03）存储侧。
 *
 * 这是「摘要树而非滚动覆盖」的纯数据访问层：turn_summary（叶）→ segment_summary（父）→
 * session_episode（根），父只引用 verified/active 子，仅追加不覆盖，supersede/invalidate/fence
 * 精确传播，traceback 沿父链回溯到 turn 叶事件范围 + digest 逐字节复核。
 *
 * **绝不重实现** MEM-02 的 draft/verify/activate/supersede/invalidate/hydrate（0112 冻结面：
 * 父节点激活复用 `verifyMemorySummary`/`activateMemorySummary`）、删除根（issuer 冻结在
 * privacy-authorization.ts）、MEM-04/05/06 / CTX-04 / MEM-14 / 真实模型摘要。
 *
 * 铁律（对齐 CLAUDE.md + 0116）：
 *   - `composeMemorySummary` 必须在 memory_summarizer 角色下调用（只写 draft，status 硬编码
 *     'draft'）；父节点激活走 app_role 的 verify/activate（复用 MEM-02）。
 *   - 父节点只引用 verified/active 子（draft→拒）；子派生 digest 由 SQL 侧重算，TS↔SQL 逐字节一致。
 *   - version = MAX(version)+1（根治 MEM-02 审计④），supersedes 目标已 retired → 响亮失败。
 */
import type { Client } from './principal.ts';
import type { SummaryClaim, SummaryKind, SummaryStatus, SummaryTreeKind } from '@meetwise/domain';

function fail(code: string): never { throw Object.assign(new Error(code), { code }); }

const HASH64_RE = /^[a-f0-9]{64}$/;

/** 父节点可写 kind（segment_summary / session_episode；turn_summary 是叶不能做父）。 */
export type SummaryTreeParentKind = 'segment_summary' | 'session_episode';

export interface ComposeMemorySummaryInput {
  threadId: string;
  kind: SummaryTreeParentKind;
  /** 已 verified/active 的直接子节点 id（segment→turn、episode→segment，单层推进）。必 ≥2：单子父
   *  的 slot [start,end] 与子相同会触发 0112 activate「同 slot 自动 supersede」把子顶成 superseded
   *  （父引用已退休子，静默树损坏），故 TS 侧 fail-closed 拒（与 SQL `cardinality < 2` 一致）。 */
  childSummaryIds: string[];
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
  supersedesSummaryId?: string | null;
  idempotencyKey?: string | null;
}

export interface MemorySummaryComposeReceipt {
  id: string;
  version: number;
  status: SummaryStatus;
  sourceRangeDigest: string;
  sourceArtifactDigest: string;
  replayed: boolean;
}

/**
 * 从已验证子节点聚合出父节点 draft（summarizer 专用：调用方 client 必须已
 * `SET LOCAL ROLE memory_summarizer` 并绑定 app.principal_user）。status 由 SQL 侧硬编码
 * 'draft'；父节点激活复用 MEM-02 verify/activate。
 */
export async function composeMemorySummary(c: Client, input: ComposeMemorySummaryInput): Promise<MemorySummaryComposeReceipt> {
  if (!input.threadId || input.threadId.length === 0) fail('memory_summary_thread_invalid');
  if (input.kind !== 'segment_summary' && input.kind !== 'session_episode') fail('memory_summary_compose_kind_invalid');
  if (!Array.isArray(input.childSummaryIds) || input.childSummaryIds.length < 2) fail('memory_summary_compose_children_insufficient');
  if (input.childSummaryIds.some((id) => !id || typeof id !== 'string')) fail('memory_summary_compose_child_id_invalid');
  if (!HASH64_RE.test(input.contentDigest)) fail('memory_summary_content_digest_invalid');

  const r = await c.query<{
    id: string; version: string | number; status: SummaryStatus;
    source_range_digest: string; source_artifact_digest: string; replayed: boolean;
  }>(
    `SELECT * FROM memory_summary_compose_draft($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`,
    [
      input.threadId, input.kind, input.childSummaryIds,
      input.content, input.contentDigest, JSON.stringify(input.claims ?? []),
      input.promptVersion, input.modelVersion, input.tokenizerVersion, input.policyVersion,
      input.normalizationRecipeVersion, input.extractionRecipeVersion, input.verificationRecipeVersion,
      input.immutableSourceVersion, input.language,
      input.supersedesSummaryId ?? null, input.idempotencyKey ?? null,
    ],
  );
  const row = r.rows[0];
  const version = Number(row?.version);
  if (!row?.id || !Number.isSafeInteger(version) || version < 1) fail('memory_summary_compose_failed');
  return {
    id: row.id, version, status: row.status,
    sourceRangeDigest: row.source_range_digest, sourceArtifactDigest: row.source_artifact_digest,
    replayed: row.replayed === true,
  };
}

export interface MemorySummaryTraceNode {
  id: string;
  threadId: string;
  kind: SummaryTreeKind;
  version: number;
  casVersion: number;
  status: SummaryStatus;
  depth: number;
  path: string[];
  sourceEventSeqStart: number;
  sourceEventSeqEnd: number;
  sourceRangeDigest: string;
  sourceArtifactDigest: string;
  sourceUtf8ByteLength: number;
  contentDigest: string;
  childSummaryIds: string[];
}

type TraceRow = {
  id: string; thread_id: string; kind: SummaryTreeKind; version: string | number; cas_version: string | number;
  status: SummaryStatus; depth: number; path: string[];
  source_event_seq_start: string | number; source_event_seq_end: string | number;
  source_range_digest: string; source_artifact_digest: string; source_utf8_byte_length: string | number;
  content_digest: string; child_summary_ids: string[];
};

/**
 * 递归回溯给定节点（含自身）的全部后代：kind/status/depth/path/子树范围/各层 digest/子 id 边。
 * 供调用方逐字节复核「任一摘要可沿父链回溯到 turn 叶事件范围，无断链」。跨 owner RLS=0 行。
 */
export async function tracebackMemorySummary(c: Client, id: string): Promise<MemorySummaryTraceNode[]> {
  if (!id || typeof id !== 'string') fail('memory_summary_traceback_id_invalid');
  const r = await c.query<TraceRow>('SELECT * FROM memory_summary_traceback($1)', [id]);
  return r.rows.map((row) => {
    const version = Number(row.version);
    const casVersion = Number(row.cas_version);
    const start = Number(row.source_event_seq_start);
    const end = Number(row.source_event_seq_end);
    const byteLen = Number(row.source_utf8_byte_length);
    if (!Number.isSafeInteger(version) || version < 1
      || !Number.isSafeInteger(casVersion) || casVersion < 1
      || !Number.isSafeInteger(start) || start < 1
      || !Number.isSafeInteger(end) || end < start
      || !Number.isSafeInteger(byteLen) || byteLen < 0
      || !Number.isSafeInteger(row.depth) || row.depth < 0) fail('memory_summary_trace_node_invalid');
    return {
      id: row.id, threadId: row.thread_id, kind: row.kind, version, casVersion, status: row.status,
      depth: row.depth, path: row.path,
      sourceEventSeqStart: start, sourceEventSeqEnd: end,
      sourceRangeDigest: row.source_range_digest, sourceArtifactDigest: row.source_artifact_digest,
      sourceUtf8ByteLength: byteLen, contentDigest: row.content_digest,
      childSummaryIds: row.child_summary_ids ?? [],
    };
  });
}

export interface MemorySummaryCascadeReceipt {
  id: string;
  status: SummaryStatus;
  casVersion: number;
}

function mapCascadeRows(rows: Array<{ id: string; status: SummaryStatus; cas_version: string | number } | null>): MemorySummaryCascadeReceipt[] {
  return rows.filter((row): row is NonNullable<typeof row> => row != null).map((row) => {
    const casVersion = Number(row.cas_version);
    if (!Number.isSafeInteger(casVersion) || casVersion < 1) fail('memory_summary_cascade_invalid');
    return { id: row.id, status: row.status, casVersion };
  });
}

/** 子失效 → 父精确级联（CAS 单赢家：节点自身 cas 未命中则 0 行、不级联）。 */
export async function invalidateMemorySummaryCascade(
  c: Client, id: string, expectedCasVersion: number,
): Promise<MemorySummaryCascadeReceipt[]> {
  const r = await c.query<{ id: string; status: SummaryStatus; cas_version: string | number }>(
    'SELECT * FROM memory_summary_cascade_invalidate($1,$2)', [id, expectedCasVersion]);
  return mapCascadeRows(r.rows);
}

/** 子围栏 → 父精确级联（围栏先赢：引用被 fence 子节点的父节点不可 hydrate，read=0）。 */
export async function fenceMemorySummaryCascade(
  c: Client, id: string, expectedCasVersion: number,
): Promise<MemorySummaryCascadeReceipt[]> {
  const r = await c.query<{ id: string; status: SummaryStatus; cas_version: string | number }>(
    'SELECT * FROM memory_summary_fence_cascade($1,$2)', [id, expectedCasVersion]);
  return mapCascadeRows(r.rows);
}

/** 复用 MEM-02 的 kind/status 类型（避免本模块与 memory-summary.ts 类型漂移）。 */
export type { SummaryKind, SummaryStatus };
