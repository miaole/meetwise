/**
 * 多层会话摘要树（MEM-03）DB 证明。
 *
 * 跑在 run-e2e-isolated.mjs 起的临时 Postgres（完整迁移 + nonce 校验）。证明（七类矩阵）：
 *  - ① 正常：turn(T1/T2/T3) → segment(S1=[T1,T2], S2=[T3]) → episode(E=[S1,S2]) 端到端
 *    compose→verify→activate→hydrate；父节点「子派生」范围/原文 digest 与 domain
 *    deriveSummaryTreeRangeDigest / deriveSummaryTreeArtifactDigest 逐字节一致（TS↔SQL）。
 *  - ② 异常：父引 draft 子 / kind 不匹配（episode 直接引 turn）/ 跨 owner 子 / 单 live 父重复父 /
 *    单子父(cardinality<2) / 伪造子 status(superseded) → 拒。
 *  - ③ 特殊：追加新版本不覆盖（旧版本 content/content_digest 不变，新行 version+1）。
 *  - ④ 逃逸通道：跨 owner traceback/compose read=0 + summarizer 无法 forge active 父。
 *  - ⑤ 高并发：verify CAS 单赢家 + 双 supersede 同父 → 响亮 retired（根治 MEM-02 ④ 23505）；
 *    两个 draft 同 supersede 同一 active 父 → version=MAX+1（2 与 3，不撞键）；并发 compose 同 slot
 *    （advisory 锁串行）→ 两个 draft 各 version 1/2。
 *  - ⑥ 复杂：invalidate 级联精确（T1 失效→S1/E 失效、T2/T3/S2 不受影响）+ traceback 逐字节
 *    （父链回溯到 turn 事件范围 digest、无断链）。
 *  - ⑦ 刁钻：fence 级联 → 被 fence 父不可 hydrate（read=0）+ 状态机单向拒。
 *
 * 铁律：不 log PII/全文；四原语复用不重实现（CAS/幂等键/RLS/memory_append_audit 有序日志）；
 * 待独立专家审计，本证明只产出本地隔离证据，不自称「完成/通过」。
 */
import {
  createPool, asPrincipal, assertIsolatedTestTarget,
  appendConversationEvent, type ConversationEventAppendReceipt,
  draftMemorySummary, verifyMemorySummary, activateMemorySummary,
  hydrateMemorySummaries, replayMemorySummaries,
  composeMemorySummary, tracebackMemorySummary, invalidateMemorySummaryCascade, fenceMemorySummaryCascade,
  type Client, type DraftMemorySummaryInput, type ComposeMemorySummaryInput, type MemorySummaryTraceNode,
} from '@meetwise/db';
import {
  SUMMARY_KINDS, SUMMARY_TREE_KINDS,
  assertSummaryTreeChildKind, deriveSummaryTreeRangeDigest, deriveSummaryTreeArtifactDigest,
  deriveSummaryContentDigest, deriveSummaryRangeDigest,
  assertSummaryWriteSeparation, isLegalSummaryTransition,
} from '@meetwise/domain';
import { createHash } from 'node:crypto';

const admin = createPool({ max: 40 });
const owner = `mem03-owner-${process.pid}`;
const otherOwner = `mem03-other-${process.pid}`;

let failures = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };
const rejects = async (fn: () => Promise<unknown>) => { try { await fn(); return false; } catch { return true; } };
const errCode = async (fn: () => Promise<unknown>): Promise<string> => {
  try { await fn(); return ''; } catch (e) { return (e as { code?: string }).code ?? ''; }
};
const errMessage = async (fn: () => Promise<unknown>): Promise<string> => {
  try { await fn(); return ''; } catch (e) { return (e as { message?: string }).message ?? ''; }
};

const sha256 = (s: string) => createHash('sha256').update(s, 'utf8').digest('hex');
const utf8Len = (s: string) => new TextEncoder().encode(s).length;

async function insertAccount(userId: string): Promise<void> {
  await admin.query(
    'INSERT INTO user_account(id, email, password_hash) VALUES ($1,$2,$3) ON CONFLICT (id) DO NOTHING',
    [userId, `${userId}@mem03.test`, 'scrypt$salt$dk'],
  );
}

/** summarizer seam 专用 principal（SET LOCAL ROLE memory_summarizer + 绑定 owner GUC）。 */
async function asSummarizer<T>(principal: string, fn: (c: Client) => Promise<T>): Promise<T> {
  const c = await admin.connect();
  try {
    await c.query('BEGIN');
    await c.query('SET LOCAL ROLE memory_summarizer');
    await c.query("SELECT set_config('app.principal_user', $1, true)", [principal]);
    const r = await fn(c);
    await c.query('COMMIT');
    return r;
  } catch (e) { await c.query('ROLLBACK').catch(() => undefined); throw e; } finally { c.release(); }
}

/** memory_runtime 原始 SQL（表级 SELECT，但 NOBYPASSRLS + FORCE RLS，只看得见 owner=principal）。 */
async function rawSelectAsMemoryRuntime<T>(principal: string, fn: (c: Client) => Promise<T>): Promise<T> {
  const c = await admin.connect();
  try {
    await c.query('BEGIN');
    await c.query('SET LOCAL ROLE memory_runtime');
    await c.query("SELECT set_config('app.principal_user', $1, true)", [principal]);
    const r = await fn(c);
    await c.query('COMMIT');
    return r;
  } catch (e) { await c.query('ROLLBACK').catch(() => undefined); throw e; } finally { c.release(); }
}

interface SourceInfo {
  receipts: ConversationEventAppendReceipt[];
  sourceText: string;
  sourceArtifactDigest: string;
  sourceUtf8ByteLength: number;
  entries: Array<{ sequence: number; eventDigest: string }>;
}

async function createSource(ownerId: string, threadId: string, bodies: string[]): Promise<SourceInfo> {
  const receipts: ConversationEventAppendReceipt[] = [];
  for (let i = 0; i < bodies.length; i++) {
    const r = await asPrincipal(admin, ownerId, (c) => appendConversationEvent(c, {
      threadId,
      category: i === 0 ? 'user_message' : (i % 2 === 1 ? 'assistant_message' : 'tool_call'),
      source: i === 0 ? 'user' : 'model',
      eventKey: `${threadId}-evt-${i}`,
      body: bodies[i]!,
      retentionClass: 'session',
      consentPurpose: 'free_conversation',
      consentRevision: 1,
      privacyEpoch: 1,
    }));
    receipts.push(r);
  }
  return sliceSource(threadId, receipts, bodies, 0, bodies.length);
}

/** 从完整来源里按索引切 [from,to) 子范围，并派生该子范围的原文/字节长。 */
function sliceSource(threadId: string, receipts: ConversationEventAppendReceipt[], bodies: string[], from: number, to: number): SourceInfo {
  const subReceipts = receipts.slice(from, to);
  const subBodies = bodies.slice(from, to);
  const entries = subReceipts.map((r) => ({ sequence: r.sequence, eventDigest: r.eventDigest }));
  const sourceText = subBodies.join('\n');
  return {
    receipts: subReceipts, sourceText,
    sourceArtifactDigest: sha256(sourceText),
    sourceUtf8ByteLength: utf8Len(sourceText),
    entries,
  };
}

function rangeDigestOf(threadId: string, source: SourceInfo): string {
  return deriveSummaryRangeDigest({
    threadId, fromSequence: source.entries[0]!.sequence, toSequence: source.entries[source.entries.length - 1]!.sequence, entries: source.entries,
  });
}

function draftInput(threadId: string, source: SourceInfo, content: string, overrides: Partial<DraftMemorySummaryInput> = {}): DraftMemorySummaryInput {
  return {
    threadId,
    kind: 'turn_summary',
    sourceEventSeqStart: source.entries[0]!.sequence,
    sourceEventSeqEnd: source.entries[source.entries.length - 1]!.sequence,
    sourceArtifactDigest: source.sourceArtifactDigest,
    sourceUtf8ByteLength: source.sourceUtf8ByteLength,
    content,
    contentDigest: deriveSummaryContentDigest(content),
    claims: [],
    promptVersion: 'v1', modelVersion: 'qwen-plus', tokenizerVersion: 'tok-v1', policyVersion: 'pol-v1',
    normalizationRecipeVersion: 'norm-v1', extractionRecipeVersion: 'extract-v1', verificationRecipeVersion: 'verify-v1',
    immutableSourceVersion: 'conversation_event:v1', language: 'zh',
    ...overrides,
  };
}

interface TurnRec {
  id: string;
  casVersion: number;
  content: string;
  contentDigest: string;
  sourceRangeDigest: string;
  sourceEventSeqStart: number;
  sourceEventSeqEnd: number;
}

/** 建一个 active turn 摘要（复用 MEM-02 draft→verify→activate），返回其稳定记录。 */
async function makeActiveTurn(ownerId: string, threadId: string, source: SourceInfo, content: string, idemKey: string): Promise<TurnRec> {
  const d = await asSummarizer(ownerId, (c) => draftMemorySummary(c, draftInput(threadId, source, content, { idempotencyKey: idemKey })));
  await asPrincipal(admin, ownerId, (c) => verifyMemorySummary(c, d.id, 1));
  const a = await asPrincipal(admin, ownerId, (c) => activateMemorySummary(c, d.id, 2));
  return {
    id: d.id, casVersion: a!.casVersion, content, contentDigest: deriveSummaryContentDigest(content),
    sourceRangeDigest: d.sourceRangeDigest,
    sourceEventSeqStart: source.entries[0]!.sequence, sourceEventSeqEnd: source.entries[source.entries.length - 1]!.sequence,
  };
}

function composeInput(threadId: string, kind: 'segment_summary' | 'session_episode', childSummaryIds: string[], content: string, overrides: Partial<ComposeMemorySummaryInput> = {}): ComposeMemorySummaryInput {
  return {
    threadId, kind, childSummaryIds, content,
    contentDigest: deriveSummaryContentDigest(content),
    claims: [],
    promptVersion: 'v1', modelVersion: 'qwen-plus', tokenizerVersion: 'tok-v1', policyVersion: 'pol-v1',
    normalizationRecipeVersion: 'norm-v1', extractionRecipeVersion: 'extract-v1', verificationRecipeVersion: 'verify-v1',
    immutableSourceVersion: 'conversation_event:v1', language: 'zh',
    ...overrides,
  };
}

interface ComposedRec {
  id: string;
  content: string;
  contentDigest: string;
  sourceRangeDigest: string;
  sourceArtifactDigest: string;
}

/** compose（draft）→ verify → activate（复用 MEM-02），返回 active 父节点稳定记录。 */
async function makeActiveComposed(ownerId: string, input: ComposeMemorySummaryInput): Promise<ComposedRec> {
  const d = await asSummarizer(ownerId, (c) => composeMemorySummary(c, input));
  await asPrincipal(admin, ownerId, (c) => verifyMemorySummary(c, d.id, 1));
  await asPrincipal(admin, ownerId, (c) => activateMemorySummary(c, d.id, 2));
  return {
    id: d.id, content: input.content, contentDigest: input.contentDigest,
    sourceRangeDigest: d.sourceRangeDigest, sourceArtifactDigest: d.sourceArtifactDigest,
  };
}

/** traceback 逐字节复核：无断链 + 父链回溯 + 父节点「子派生」digest 与子节点存储 digest 一致。 */
function assertTracebackIntact(nodes: MemorySummaryTraceNode[], threadId: string): boolean {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  if (nodes.length === 0) return false;
  const root = nodes.find((n) => n.depth === 0)!;
  if (root.path.length !== 1 || root.path[0] !== root.id) return false;
  for (const n of nodes) {
    for (const childId of n.childSummaryIds) {
      const child = byId.get(childId);
      if (!child) return false; // 无断链：每个子 id 必须在回溯集合内。
      if (child.depth !== n.depth + 1) return false;
    }
    if (n.childSummaryIds.length > 0) {
      const kids = n.childSummaryIds.map((id) => byId.get(id)!);
      const minSeq = Math.min(...kids.map((k) => k.sourceEventSeqStart));
      const maxSeq = Math.max(...kids.map((k) => k.sourceEventSeqEnd));
      if (n.sourceEventSeqStart !== minSeq || n.sourceEventSeqEnd !== maxSeq) return false;
      if (n.sourceRangeDigest !== deriveSummaryTreeRangeDigest({
        threadId, fromSequence: minSeq, toSequence: maxSeq,
        children: kids.map((k) => ({ id: k.id, sourceRangeDigest: k.sourceRangeDigest })),
      })) return false;
      if (n.sourceArtifactDigest !== deriveSummaryTreeArtifactDigest({
        children: kids.map((k) => ({ id: k.id, contentDigest: k.contentDigest })),
      })) return false;
    } else if (!/^[a-f0-9]{64}$/.test(n.sourceRangeDigest)) {
      return false; // 叶（turn）必须持有 64-hex 事件范围 digest。
    }
  }
  return true;
}

async function main() {
  await assertIsolatedTestTarget(admin);
  await insertAccount(owner);
  await insertAccount(otherOwner);

  /* ── A. 域常量 pin（三层 kind 显式 enum；MEM-02 SUMMARY_KINDS 不被本项改动）── */
  A('域: SUMMARY_TREE_KINDS 冻结 turn_summary/segment_summary/session_episode',
    SUMMARY_TREE_KINDS.join(',') === 'turn_summary,segment_summary,session_episode');
  A('域: MEM-02 SUMMARY_KINDS 保持不变（turn_summary/segment_summary，不被树扩改）',
    SUMMARY_KINDS.join(',') === 'turn_summary,segment_summary');
  A('域: segment 只引 turn / episode 只引 segment（兼容表）',
    (() => { assertSummaryTreeChildKind('segment_summary', 'turn_summary'); assertSummaryTreeChildKind('session_episode', 'segment_summary'); return true; })());
  A('域: turn_summary 是叶不能做父 拒',
    await rejects(() => { assertSummaryTreeChildKind('turn_summary', 'turn_summary'); return Promise.resolve(); }));
  A('域: episode 直接引 turn（跨层）拒',
    await rejects(() => { assertSummaryTreeChildKind('session_episode', 'turn_summary'); return Promise.resolve(); }));
  A('域: segment 引 episode（回退）拒',
    await rejects(() => { assertSummaryTreeChildKind('segment_summary', 'session_episode'); return Promise.resolve(); }));
  A('域: 树 digest 确定性（同输入同输出）',
    deriveSummaryTreeRangeDigest({ threadId: 't', fromSequence: 1, toSequence: 2, children: [{ id: 'a', sourceRangeDigest: 'c'.repeat(64) }] })
    === deriveSummaryTreeRangeDigest({ threadId: 't', fromSequence: 1, toSequence: 2, children: [{ id: 'a', sourceRangeDigest: 'c'.repeat(64) }] }));
  A('域: 单向状态机白名单 superseded→active 非法（append-only 不回退）',
    isLegalSummaryTransition('superseded', 'active') === false && isLegalSummaryTransition('active', 'superseded') === true);
  A('域: 写分离守护 status≠draft 拒（父节点也不 direct active）',
    await rejects(() => { assertSummaryWriteSeparation({ status: 'active' }); return Promise.resolve(); }));

  /* ── ① 正常：turn→segment→episode 端到端 + 子派生 digest 逐字节一致 ──── */
  const bodies = ['你好，我想准备分布式系统的面试。', '好的，先梳理分布式锁的核心。', 'tool:search("分布式锁")', '接下来是共识协议。', '我们看 Raft 的选举。', '再讲性能优化。', '再看缓存一致性。', '最后是故障恢复。'];
  const full = await createSource(owner, 'tree-a', bodies);
  const t1 = await makeActiveTurn(owner, 'tree-a', sliceSource('tree-a', full.receipts, bodies, 0, 2), 'T1: 分布式锁', 'tree-a-t1');
  const t2 = await makeActiveTurn(owner, 'tree-a', sliceSource('tree-a', full.receipts, bodies, 2, 4), 'T2: 共识协议', 'tree-a-t2');
  const t3 = await makeActiveTurn(owner, 'tree-a', sliceSource('tree-a', full.receipts, bodies, 4, 6), 'T3: 性能优化', 'tree-a-t3');
  const t4 = await makeActiveTurn(owner, 'tree-a', sliceSource('tree-a', full.receipts, bodies, 6, 8), 'T4: 故障恢复', 'tree-a-t4');
  A('① 前置: 四个 turn 均 active 且 event range digest 逐字节一致',
    t1.sourceRangeDigest === rangeDigestOf('tree-a', sliceSource('tree-a', full.receipts, bodies, 0, 2))
    && t2.sourceRangeDigest === rangeDigestOf('tree-a', sliceSource('tree-a', full.receipts, bodies, 2, 4)));

  const s1 = await makeActiveComposed(owner, composeInput('tree-a', 'segment_summary', [t1.id, t2.id], 'S1: 分布式锁与共识'));
  const s1ExpectedRange = deriveSummaryTreeRangeDigest({
    threadId: 'tree-a', fromSequence: Math.min(t1.sourceEventSeqStart, t2.sourceEventSeqStart),
    toSequence: Math.max(t1.sourceEventSeqEnd, t2.sourceEventSeqEnd),
    children: [{ id: t1.id, sourceRangeDigest: t1.sourceRangeDigest }, { id: t2.id, sourceRangeDigest: t2.sourceRangeDigest }],
  });
  const s1ExpectedArtifact = deriveSummaryTreeArtifactDigest({
    children: [{ id: t1.id, contentDigest: t1.contentDigest }, { id: t2.id, contentDigest: t2.contentDigest }],
  });
  A('① segment S1: 子派生 range digest 与 domain 逐字节一致（TS↔SQL）',
    s1.sourceRangeDigest === s1ExpectedRange && /^[a-f0-9]{64}$/.test(s1.sourceRangeDigest));
  A('① segment S1: 子派生 artifact digest 与 domain 逐字节一致',
    s1.sourceArtifactDigest === s1ExpectedArtifact && /^[a-f0-9]{64}$/.test(s1.sourceArtifactDigest));

  const s2 = await makeActiveComposed(owner, composeInput('tree-a', 'segment_summary', [t3.id, t4.id], 'S2: 性能与恢复'));
  const e = await makeActiveComposed(owner, composeInput('tree-a', 'session_episode', [s1.id, s2.id], 'E: 会话全集'));
  const hyd = await asPrincipal(admin, owner, (c) => hydrateMemorySummaries(c, 'tree-a'));
  A('① hydrate: 仅 active（4 turn + 2 segment + 1 episode = 7 条）',
    hyd.length === 7 && hyd.filter((r) => r.kind === 'turn_summary').length === 4
    && hyd.filter((r) => r.kind === 'segment_summary').length === 2
    && hyd.filter((r) => (r.kind as string) === 'session_episode').length === 1
    && hyd.every((r) => r.status === 'active'));

  /* ── ② 异常：父引 draft 子/kind 不匹配/跨 owner 子/单 live 父重复父/单子父 → 拒 ── */
  const tDraft = await asSummarizer(owner, (c) => draftMemorySummary(c, draftInput('tree-a', sliceSource('tree-a', full.receipts, bodies, 0, 1), '草稿 turn', { idempotencyKey: 'tree-a-draft' })));
  const tDraft2 = await asSummarizer(owner, (c) => draftMemorySummary(c, draftInput('tree-a', sliceSource('tree-a', full.receipts, bodies, 1, 2), '草稿 turn 2', { idempotencyKey: 'tree-a-draft2' })));
  A('② 父引 draft 子 → 拒（父只引用 verified/active 子）',
    await rejects(() => asSummarizer(owner, (c) => composeMemorySummary(c, composeInput('tree-a', 'segment_summary', [tDraft.id, tDraft2.id], 'draft 子不可聚合')))));
  A('② 单子父（cardinality=1）→ 拒（memory_summary_tree_children_cardinality，防子被同 slot auto-supersede 静默损坏）',
    (await errMessage(() => asSummarizer(owner, (c) => c.query(
      'SELECT * FROM memory_summary_compose_draft($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)',
      ['tree-a', 'segment_summary', [t1.id], '单子段', deriveSummaryContentDigest('单子段'), '[]',
       'v1','v1','v1','v1','n','e','v','conv:v1','zh', null, null])))) === 'memory_summary_tree_children_cardinality');
  A('② episode 直接引 turn（跨层）→ 拒',
    await rejects(() => asSummarizer(owner, (c) => composeMemorySummary(c, composeInput('tree-a', 'session_episode', [t1.id, t2.id], '跨层')))));
  A('② segment 引 segment（跨层回退）→ 拒',
    await rejects(() => asSummarizer(owner, (c) => composeMemorySummary(c, composeInput('tree-a', 'segment_summary', [s1.id, s2.id], 'segment 引 segment')))));
  const otherBodies = ['别人的面试内容一', '别人的面试内容二'];
  const otherSrc = await createSource(otherOwner, 'tree-a', otherBodies);
  const otherTurn = await makeActiveTurn(otherOwner, 'tree-a', sliceSource('tree-a', otherSrc.receipts, otherBodies, 0, 1), '别的 owner turn 1', 'tree-a-other1');
  const otherTurn2 = await makeActiveTurn(otherOwner, 'tree-a', sliceSource('tree-a', otherSrc.receipts, otherBodies, 1, 2), '别的 owner turn 2', 'tree-a-other2');
  A('② 跨 owner 子（otherOwner 的 turn 传入 owner 的 compose）→ 拒（child_missing）',
    await rejects(() => asSummarizer(owner, (c) => composeMemorySummary(c, composeInput('tree-a', 'segment_summary', [otherTurn.id, otherTurn2.id], '跨 owner')))));
  A('② 单 live 父：T1/T2 已被 S1 引用，再建 S3=[T1,T2] → 拒（child_already_parented）',
    (await errCode(() => asSummarizer(owner, (c) => composeMemorySummary(c, composeInput('tree-a', 'segment_summary', [t1.id, t2.id], '重复父'))))) === '23505');

  /* ── ③ 特殊：追加新版本不覆盖（旧版本 content/content_digest 不变，新行 version+1）── */
  const abodies = ['追加版本来源一', '追加版本来源二'];
  const asrc = await createSource(owner, 'tree-append', abodies);
  const at1 = await makeActiveTurn(owner, 'tree-append', sliceSource('tree-append', asrc.receipts, abodies, 0, 1), 'A-T1', 'tree-append-t1');
  const at2 = await makeActiveTurn(owner, 'tree-append', sliceSource('tree-append', asrc.receipts, abodies, 1, 2), 'A-T2', 'tree-append-t2');
  const as1 = await makeActiveComposed(owner, composeInput('tree-append', 'segment_summary', [at1.id, at2.id], 'AS1: 追加版 v1'));
  const as1v2 = await makeActiveComposed(owner, composeInput('tree-append', 'segment_summary', [at1.id, at2.id], 'AS1-v2: 修正版', { supersedesSummaryId: as1.id }));
  const v1Row = (await admin.query<{ status: string; version: string; content: string; content_digest: string }>(
    'SELECT status, version, content, content_digest FROM memory_summary WHERE id=$1', [as1.id])).rows[0]!;
  const v2Row = (await admin.query<{ status: string; version: string; content: string; content_digest: string }>(
    'SELECT status, version, content, content_digest FROM memory_summary WHERE id=$1', [as1v2.id])).rows[0]!;
  A('③ 不覆盖: 旧版本行保留(status=superseded, version=1)且 content/content_digest 未变',
    v1Row.status === 'superseded' && Number(v1Row.version) === 1
    && v1Row.content === 'AS1: 追加版 v1' && v1Row.content_digest === deriveSummaryContentDigest('AS1: 追加版 v1'));
  A('③ 追加: 新版本 active(version=2)且 content 为新摘要',
    v2Row.status === 'active' && Number(v2Row.version) === 2 && v2Row.content === 'AS1-v2: 修正版');
  // 伪造子 status：as1 已被 as1v2 supersede（status=superseded）→ 作为 episode 子传入 → 拒。
  // SQL 谓词 `status NOT IN ('verified','active')` 封闭（draft/superseded/invalidated/fenced 全拒）；
  // 审计指出 proof 此前只测了 draft 子，此处补退休子（superseded）。
  A('② 伪造子 status: superseded 子(as1) 传入 episode compose → 拒（child_not_verified_active）',
    await rejects(() => asSummarizer(owner, (c) => composeMemorySummary(c, composeInput('tree-append', 'session_episode', [as1.id, as1v2.id], '引 superseded 子')))));

  /* ── ④ 逃逸通道：跨 owner traceback/compose read=0 + summarizer 无 forge active 父 ── */
  A('④ 跨 owner: otherOwner traceback(owner 的 segment) = 0 行（RLS 隔离）',
    (await asPrincipal(admin, otherOwner, (c) => tracebackMemorySummary(c, s1.id))).length === 0);
  A('④ 跨 owner: memory_runtime raw SELECT 直查 owner 摘要表 = 0 行可见（FORCE RLS）',
    (await rawSelectAsMemoryRuntime(otherOwner, (c) => c.query<{ n: number }>(
      'SELECT count(*)::int AS n FROM memory_summary WHERE owner_user_id=$1', [owner]))).rows[0]!.n === 0);
  const rawInsertParent = (status: string, targetOwner: string) => asSummarizer(owner, (c) => c.query(
    `INSERT INTO memory_summary(owner_user_id, thread_id, kind, version, source_event_seq_start, source_event_seq_end, source_range_digest, source_artifact_digest, source_utf8_byte_length, content, content_digest, claims, prompt_version, model_version, tokenizer_version, policy_version, data_subject_id, source_entity_id, consent_revision, privacy_epoch, immutable_source_version, normalization_recipe_version, extraction_recipe_version, verification_recipe_version, language, status)
     VALUES ($1,'tree-escape','session_episode',1,1,1,$2,$3,10,'escape',$4,'[]','v1','v1','v1','v1',$1,'tree-escape',1,1,'conv:v1','n','e','v','zh',$5)`,
    [targetOwner, 'a'.repeat(64), 'b'.repeat(64), deriveSummaryContentDigest('escape'), status]));
  A('④ 无 forge active: summarizer raw INSERT 父 status=active 被 RLS WITH CHECK 拒',
    await rejects(() => rawInsertParent('active', owner)));
  A('④ 无 forge active: summarizer raw INSERT 伪造 owner_user_id≠principal 被 RLS 拒',
    await rejects(() => rawInsertParent('draft', otherOwner)));

  // turn 叶 CHECK 真对抗（defense-in-depth）：compose 已在输入契约层拒 turn 父，但表级约束
  // memory_summary_turn_leaf_child_check（kind<>'turn_summary' OR child_summary_ids IS NULL OR
  // cardinality=0）防 summarizer raw INSERT 带子的 turn。此处 raw INSERT（summarizer seam 绕过
  // compose）一条 turn_summary 带非空 child → 必须被该 CHECK 拒（23514 check_violation），空 child
  // 的 turn_summary 能过（正对照防恒真/查询失效）。删约束则负例 INSERT 成功 → 断言红。
  const rawInsertTurnLeaf = async (threadId: string, childSummaryIds: string[]): Promise<string> => {
    const childSql = childSummaryIds.length === 0
      ? "'{}'::uuid[]"
      : `ARRAY[${childSummaryIds.map((id) => `'${id}'::uuid`).join(',')}]::uuid[]`;
    const r = await asSummarizer(owner, (c) => c.query<{ id: string }>(
      `INSERT INTO memory_summary(owner_user_id, thread_id, kind, version, source_event_seq_start, source_event_seq_end, source_range_digest, source_artifact_digest, source_utf8_byte_length, content, content_digest, claims, prompt_version, model_version, tokenizer_version, policy_version, data_subject_id, source_entity_id, consent_revision, privacy_epoch, immutable_source_version, normalization_recipe_version, extraction_recipe_version, verification_recipe_version, language, status, child_summary_ids)
       VALUES ($1,$2,'turn_summary',1,1,1,$3,$4,10,'leaf',$5,'[]','v1','v1','v1','v1',$1,$2,1,1,'conv:v1','n','e','v','zh','draft',${childSql})
       RETURNING id`,
      [owner, threadId, 'a'.repeat(64), 'b'.repeat(64), deriveSummaryContentDigest('leaf')]));
    return r.rows[0]!.id;
  };
  const turnLeafNeg = await (async () => {
    try { await rawInsertTurnLeaf('tree-leaf-neg', ['00000000-0000-0000-0000-000000000001']); return { code: '', msg: '' }; }
    catch (e) { return { code: (e as { code?: string }).code ?? '', msg: (e as { message?: string }).message ?? '' }; }
  })();
  A('④ turn 叶 CHECK: raw INSERT turn_summary+非空 child 被 CHECK 拒（23514 check_violation / memory_summary_turn_leaf_child_check）',
    turnLeafNeg.code === '23514' && turnLeafNeg.msg.includes('memory_summary_turn_leaf_child_check'));
  const turnLeafPos = await rawInsertTurnLeaf('tree-leaf-ok', []);
  A('④ turn 叶 CHECK: raw INSERT turn_summary+空 child 能过（正对照，防恒真/查询失效）',
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(turnLeafPos));

  /* ── ⑤ 高并发：CAS 单赢家 + 双 supersede 同父响亮 retired（根治④ 23505）── */
  const vbodies = ['版本来源一', '版本来源二'];
  const vp = await createSource(owner, 'tree-version', vbodies);
  const tv1 = await makeActiveTurn(owner, 'tree-version', sliceSource('tree-version', vp.receipts, vbodies, 0, 1), '版本 turn 1', 'tree-version-t1');
  const tv2 = await makeActiveTurn(owner, 'tree-version', sliceSource('tree-version', vp.receipts, vbodies, 1, 2), '版本 turn 2', 'tree-version-t2');
  const sv1 = await makeActiveComposed(owner, composeInput('tree-version', 'segment_summary', [tv1.id, tv2.id], '版本段 v1'));
  const casBodies = ['并发来源一', '并发来源二'];
  const casSrc = await createSource(owner, 'tree-cas', casBodies);
  const casTurn = await makeActiveTurn(owner, 'tree-cas', sliceSource('tree-cas', casSrc.receipts, casBodies, 0, 1), '并发 turn 1', 'tree-cas-t1');
  const casTurn2 = await makeActiveTurn(owner, 'tree-cas', sliceSource('tree-cas', casSrc.receipts, casBodies, 1, 2), '并发 turn 2', 'tree-cas-t2');
  const casDraft = await asSummarizer(owner, (c) => composeMemorySummary(c, composeInput('tree-cas', 'segment_summary', [casTurn.id, casTurn2.id], '并发段')));
  const [casWin, casLose] = await Promise.all([
    asPrincipal(admin, owner, (c) => verifyMemorySummary(c, casDraft.id, 1)),
    asPrincipal(admin, owner, (c) => verifyMemorySummary(c, casDraft.id, 1)),
  ]);
  A('⑤ CAS 并发: 同 expected_cas_version=1 并发 verify 只有一个赢家(cas_version 2)',
    (casWin !== null) !== (casLose !== null) && (casWin?.casVersion ?? casLose?.casVersion) === 2);
  // 根治④：两个 draft 同 supersede 同一 active 父 → version = MAX+1（2 与 3，绝不撞 23505）。
  const dv2 = await asSummarizer(owner, (c) => composeMemorySummary(c, composeInput('tree-version', 'segment_summary', [tv1.id, tv2.id], '版本段 v2', { supersedesSummaryId: sv1.id, idempotencyKey: 'ver-v2' })));
  const dv3 = await asSummarizer(owner, (c) => composeMemorySummary(c, composeInput('tree-version', 'segment_summary', [tv1.id, tv2.id], '版本段 v3', { supersedesSummaryId: sv1.id, idempotencyKey: 'ver-v3' })));
  A('⑤ 根治④: 两个 draft 同 supersede 同一 active 父 → version=2 与 3（MAX+1，不撞键）',
    dv2.version === 2 && dv3.version === 3);
  // 激活 v2 → sv1 变 superseded；再 supersede sv1（已退休）→ 响亮 retired（非 23505 撞键）。
  await asPrincipal(admin, owner, (c) => verifyMemorySummary(c, dv2.id, 1));
  await asPrincipal(admin, owner, (c) => activateMemorySummary(c, dv2.id, 2));
  A('⑤ 双 supersede 同父 → 响亮 retired（23514，非静默、非 23505 撞键）',
    (await errCode(() => asSummarizer(owner, (c) => composeMemorySummary(c, composeInput('tree-version', 'segment_summary', [tv1.id, tv2.id], '版本段 v4', { supersedesSummaryId: sv1.id }))))) === '23514');
  // 并发 compose 同 slot：advisory 锁（pg_advisory_xact_lock）串行化 version=MAX+1 计算，
  // 两个独立连接（Promise.all + pool max=40）并发写同 slot draft → 各得 version 1/2（绝不 23505 撞键）。
  const concBodies = ['并发 compose 来源一', '并发 compose 来源二'];
  const concSrc = await createSource(owner, 'tree-conc', concBodies);
  const concTurn1 = await makeActiveTurn(owner, 'tree-conc', sliceSource('tree-conc', concSrc.receipts, concBodies, 0, 1), '并发 compose turn 1', 'tree-conc-t1');
  const concTurn2 = await makeActiveTurn(owner, 'tree-conc', sliceSource('tree-conc', concSrc.receipts, concBodies, 1, 2), '并发 compose turn 2', 'tree-conc-t2');
  const [concA, concB] = await Promise.all([
    asSummarizer(owner, (c) => composeMemorySummary(c, composeInput('tree-conc', 'segment_summary', [concTurn1.id, concTurn2.id], '并发 compose A'))),
    asSummarizer(owner, (c) => composeMemorySummary(c, composeInput('tree-conc', 'segment_summary', [concTurn1.id, concTurn2.id], '并发 compose B'))),
  ]);
  A('⑤ 并发 compose 同 slot: advisory 锁串行 → 两个 draft 各 version 1/2（MAX+1，不撞键）',
    concA.version !== concB.version && concA.version + concB.version === 3);

  /* ── ⑥ 复杂：invalidate 级联精确 + traceback 逐字节（父链回溯、无断链）── */
  const eTrace = await asPrincipal(admin, owner, (c) => tracebackMemorySummary(c, e.id));
  A('⑥ traceback: episode 根回溯出 7 节点（1 episode + 2 segment + 4 turn，无断链逐字节）',
    eTrace.length === 7 && eTrace[0]!.id === e.id && eTrace[0]!.depth === 0
    && assertTracebackIntact(eTrace, 'tree-a'));
  const s1Trace = await asPrincipal(admin, owner, (c) => tracebackMemorySummary(c, s1.id));
  A('⑥ traceback: segment S1 回溯出 3 节点（S1 + T1 + T2，逐字节无断链）',
    s1Trace.length === 3 && s1Trace[0]!.id === s1.id && assertTracebackIntact(s1Trace, 'tree-a'));
  const inv = await asPrincipal(admin, owner, (c) => invalidateMemorySummaryCascade(c, t1.id, t1.casVersion));
  const invIds = new Set(inv.map((r) => r.id));
  A('⑥ 级联精确: T1 失效 → T1/S1/E 失效（祖先链）',
    invIds.has(t1.id) && invIds.has(s1.id) && invIds.has(e.id) && inv.length === 3 && inv.every((r) => r.status === 'invalidated'));
  const t2Status = (await admin.query<{ status: string }>('SELECT status FROM memory_summary WHERE id=$1', [t2.id])).rows[0]!.status;
  const t3Status = (await admin.query<{ status: string }>('SELECT status FROM memory_summary WHERE id=$1', [t3.id])).rows[0]!.status;
  const t4Status = (await admin.query<{ status: string }>('SELECT status FROM memory_summary WHERE id=$1', [t4.id])).rows[0]!.status;
  const s2Status = (await admin.query<{ status: string }>('SELECT status FROM memory_summary WHERE id=$1', [s2.id])).rows[0]!.status;
  A('⑥ 级联精确: 兄弟分支不受影响（T2/T3/T4/S2 仍 active）',
    t2Status === 'active' && t3Status === 'active' && t4Status === 'active' && s2Status === 'active');
  A('⑥ 级联 CAS: 对已 invalidated 的 T1 再级联（陈旧 cas）→ 0 行（单赢家，不重复级联）',
    (await asPrincipal(admin, owner, (c) => invalidateMemorySummaryCascade(c, t1.id, t1.casVersion))).length === 0);

  /* ── ⑦ 刁钻：fence 级联 → 被 fence 父不可 hydrate（read=0）+ 状态机单向拒 ── */
  const fbodies = ['围栏来源一', '围栏来源二', '围栏来源三', '围栏来源四'];
  const fsrc = await createSource(owner, 'tree-fence', fbodies);
  const ft1 = await makeActiveTurn(owner, 'tree-fence', sliceSource('tree-fence', fsrc.receipts, fbodies, 0, 1), 'F-T1', 'tree-fence-t1');
  const ft2 = await makeActiveTurn(owner, 'tree-fence', sliceSource('tree-fence', fsrc.receipts, fbodies, 1, 2), 'F-T2', 'tree-fence-t2');
  const ft3 = await makeActiveTurn(owner, 'tree-fence', sliceSource('tree-fence', fsrc.receipts, fbodies, 2, 3), 'F-T3', 'tree-fence-t3');
  const ft4 = await makeActiveTurn(owner, 'tree-fence', sliceSource('tree-fence', fsrc.receipts, fbodies, 3, 4), 'F-T4', 'tree-fence-t4');
  const fs1 = await makeActiveComposed(owner, composeInput('tree-fence', 'segment_summary', [ft1.id, ft2.id], 'F-S1'));
  const fs2 = await makeActiveComposed(owner, composeInput('tree-fence', 'segment_summary', [ft3.id, ft4.id], 'F-S2'));
  const fe = await makeActiveComposed(owner, composeInput('tree-fence', 'session_episode', [fs1.id, fs2.id], 'F-E'));
  const fenced = await asPrincipal(admin, owner, (c) => fenceMemorySummaryCascade(c, ft1.id, ft1.casVersion));
  const fencedIds = new Set(fenced.map((r) => r.id));
  A('⑦ fence 级联: FT1 围栏 → FT1/FS1/FE 围栏（3 行，祖先链精确）',
    fenced.length === 3 && fencedIds.has(ft1.id) && fencedIds.has(fs1.id) && fencedIds.has(fe.id)
    && fenced.every((r) => r.status === 'fenced'));
  const hydFence = await asPrincipal(admin, owner, (c) => hydrateMemorySummaries(c, 'tree-fence'));
  A('⑦ fence 后 read=0: 被 fence 父(FS1/FE/FT1)不可 hydrate，兄弟分支仍 active（4 条）',
    hydFence.length === 4 && !hydFence.some((r) => r.id === ft1.id || r.id === fs1.id || r.id === fe.id)
    && hydFence.every((r) => r.status === 'active'));
  A('⑦ fence 后 read=0: replay 排除 fenced（同 4 条，fenced 不外泄）',
    (await asPrincipal(admin, owner, (c) => replayMemorySummaries(c, 'tree-fence'))).length === 4);
  const ft2Status = (await admin.query<{ status: string }>('SELECT status FROM memory_summary WHERE id=$1', [ft2.id])).rows[0]!.status;
  const fs2Status = (await admin.query<{ status: string }>('SELECT status FROM memory_summary WHERE id=$1', [fs2.id])).rows[0]!.status;
  A('⑦ fence 级联精确: 兄弟 FT2/FS2 不受影响（仍 active）',
    ft2Status === 'active' && fs2Status === 'active');
  // 状态机单向拒：superseded → active 非法（DB 触发器拒回退，append-only）。
  A('⑦ 状态机单向: superseded→active 被触发器拒（23514，append-only 不回退）',
    (await errCode(() => admin.query("UPDATE memory_summary SET status='active' WHERE id=$1 AND status='superseded'", [as1.id]))) === '23514');

  await admin.end();
  console.log(failures === 0
    ? '\n✓ 多层会话摘要树(MEM-03) DB 证明通过（本地隔离证据，待独立专家审计）'
    : `\n✗ ${failures} 个断言失败`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(async (e) => {
  console.error(e);
  await admin.end().catch(() => undefined);
  process.exit(1);
});
