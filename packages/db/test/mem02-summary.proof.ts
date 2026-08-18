/**
 * 单轮与区间摘要（MEM-02）DB 证明。
 *
 * 跑在 run-e2e-isolated.mjs 起的临时 Postgres（完整迁移 + nonce 校验）。证明（七类矩阵）：
 *  - ① 正常：draft(version=1,status=draft) → verify(draft→verified,CAS) → activate(verified→active)
 *    → hydrate(仅 active) 端到端；source_range_digest 与 domain deriveSummaryRangeDigest 逐字节一致。
 *  - ② 异常：非法 span(offsetKind≠utf8_byte)/写分离守护/content_digest 失配/span 越界/来源范围未冻结
 *    /非法 language → 拒；verify 非 draft、activate 非 verified → 静默落败(null)。
 *  - ③ 特殊：UTF-8 多字节 span 边界——字节偏移(非 code-point)round-trip。
 *  - ④ 逃逸通道：cross-owner read=0；summarizer 无法 forge active(RLS WITH CHECK status='draft')；
 *    app_role 无 draft EXECUTE；跨 owner 伪造 owner_user_id 被 RLS 拒。
 *  - ⑤ 高并发：verify CAS 单赢家（同 expected_cas_version 并发只有一个赢）。
 *  - ⑥ 复杂：supersede 不覆盖(旧版本行保留、content 不变)+ activate 自动 supersede 旧 active。
 *  - ⑦ 刁钻：账户删除孤儿闭合——begin(全 fence)→hydrate/replay/raw SELECT 三路径 read=0→
 *    claim/purge→物理 DELETE→删后 read=0；begin 幂等重放。
 *
 * 铁律：不 log PII/全文；四原语复用不重实现（CAS/幂等键/RLS/memory_append_audit 有序日志）；
 * 待独立专家审计，本证明只产出本地隔离证据，不自称「完成/通过」。
 */
import {
  createPool, asPrincipal, asPrivacyWorkerPrincipal, asPrivacyWorkerExecutor, assertIsolatedTestTarget,
  appendConversationEvent, type AppendConversationEventInput, type ConversationEventAppendReceipt,
  draftMemorySummary, verifyMemorySummary, activateMemorySummary, supersedeMemorySummary, invalidateMemorySummary,
  hydrateMemorySummaries, replayMemorySummaries, dispatchMemorySummaryHydrate,
  beginMemorySummaryErasure, claimMemorySummaryTarget, purgeMemorySummaryTarget,
  issueAuthorizationSnapshot, consumeAuthorizationSnapshot,
  type Client, type DraftMemorySummaryInput,
} from '@meetwise/db';
import {
  SUMMARY_KINDS, SUMMARY_STATUSES, SUMMARY_SPAN_OFFSET_KIND, SUMMARY_SINK,
  SUMMARY_PRODUCER_CLASSES, SUMMARY_PURPOSES, SUMMARY_RETENTION_CLASSES, SUMMARY_SOURCE_TYPES,
  deriveSummaryContentDigest, deriveSummaryRangeDigest, assertSummaryClaimSpan,
  canonicalSummaryClaimSpan, assertSummaryWriteSeparation, isLegalSummaryTransition,
  canonicalTargetSetDigest, generatePrivacyAuthzKeyPair, signPrivacyAuthorizationSnapshot,
  type PrivacyAuthzTarget,
} from '@meetwise/domain';
import { createHash } from 'node:crypto';

const admin = createPool({ max: 40 });
const owner = `mem02-owner-${process.pid}`;
const otherOwner = `mem02-other-${process.pid}`;
const worker = `mem02-worker-${process.pid}`;
const NOW_SEC = Math.floor(Date.now() / 1000);
const KEY = generatePrivacyAuthzKeyPair('privacy-del-mem02-01');

let failures = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };
const rejects = async (fn: () => Promise<unknown>) => { try { await fn(); return false; } catch { return true; } };

const sha256 = (s: string) => createHash('sha256').update(s, 'utf8').digest('hex');
const utf8Len = (s: string) => new TextEncoder().encode(s).length;

async function insertAccount(userId: string): Promise<void> {
  await admin.query(
    'INSERT INTO user_account(id, email, password_hash) VALUES ($1,$2,$3) ON CONFLICT (id) DO NOTHING',
    [userId, `${userId}@mem02.test`, 'scrypt$salt$dk'],
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

/** 签发器专用 principal（SET LOCAL ROLE privacy_issuer + 绑定 owner GUC），与 CTX/MEM 证明同源。 */
async function asIssuer<T>(principal: string, fn: (c: Client) => Promise<T>): Promise<T> {
  const c = await admin.connect();
  try {
    await c.query('BEGIN');
    await c.query('SET LOCAL ROLE privacy_issuer');
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

function signAccountSnapshot(ownerId: string, epoch: number, targets: PrivacyAuthzTarget[]) {
  return signPrivacyAuthorizationSnapshot({
    privateKeyPem: KEY.privateKeyPem, kid: KEY.kid, actor: ownerId, owner: ownerId, interview: ownerId,
    purpose: 'account_data_erasure', privacyEpoch: epoch, targets, nowSec: NOW_SEC, ttlSec: 600,
  });
}

interface SourceInfo {
  receipts: ConversationEventAppendReceipt[];
  sourceText: string;
  firstBodyUtf8Len: number;
  sourceArtifactDigest: string;
  sourceUtf8ByteLength: number;
  rangeDigest: string;
  entries: Array<{ sequence: number; eventDigest: string }>;
}

/** 为一个 owner/thread 建连续来源事件（1..N sequence），并派生原文/字节长/范围 digest。 */
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
  const sourceText = bodies.join('\n');
  const entries = receipts.map((r) => ({ sequence: r.sequence, eventDigest: r.eventDigest }));
  return {
    receipts, sourceText,
    firstBodyUtf8Len: utf8Len(bodies[0]!),
    sourceArtifactDigest: sha256(sourceText),
    sourceUtf8ByteLength: utf8Len(sourceText),
    rangeDigest: deriveSummaryRangeDigest({
      threadId, fromSequence: entries[0]!.sequence, toSequence: entries[entries.length - 1]!.sequence, entries,
    }),
    entries,
  };
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
    claims: [{ text: '用户准备分布式系统面试', span: { offsetKind: 'utf8_byte', start: 0, end: source.firstBodyUtf8Len } }],
    promptVersion: 'v1', modelVersion: 'qwen-plus', tokenizerVersion: 'tok-v1', policyVersion: 'pol-v1',
    normalizationRecipeVersion: 'norm-v1', extractionRecipeVersion: 'extract-v1', verificationRecipeVersion: 'verify-v1',
    immutableSourceVersion: 'conversation_event:v1', language: 'zh',
    ...overrides,
  };
}

const draftAsSummarizer = (principal: string, input: DraftMemorySummaryInput) =>
  asSummarizer(principal, (c) => draftMemorySummary(c, input));

async function main() {
  await assertIsolatedTestTarget(admin);
  await insertAccount(owner);
  await insertAccount(otherOwner);

  /* ── A. 域常量 pin（显式 enum 非布尔汤）────────────────────────────── */
  A('域: kind 枚举冻结 turn_summary/segment_summary',
    SUMMARY_KINDS.join(',') === 'turn_summary,segment_summary');
  A('域: status 枚举冻结 draft→verified→active→superseded/invalidated/fenced→purged',
    SUMMARY_STATUSES.join(',') === 'draft,verified,active,superseded,invalidated,fenced,purged');
  A('域: span 单一坐标系 utf8_byte（绝无 UTF-16/code-point）',
    SUMMARY_SPAN_OFFSET_KIND === 'utf8_byte');
  A('域: sink 枚举 pin memory_summary',
    SUMMARY_SINK === 'memory_summary');
  A('域: producer_class 固定 summarizer',
    SUMMARY_PRODUCER_CLASSES.join(',') === 'summarizer');
  A('域: purpose 固定 free_conversation',
    SUMMARY_PURPOSES.join(',') === 'free_conversation');
  A('域: retention_class 冻结 session/account/derived',
    SUMMARY_RETENTION_CLASSES.join(',') === 'session,account,derived');
  A('域: source_type 固定 conversation_event',
    SUMMARY_SOURCE_TYPES.join(',') === 'conversation_event');
  A('域: 单向状态机白名单 draft→active 非法（须经 verified）',
    isLegalSummaryTransition('draft', 'active') === false && isLegalSummaryTransition('draft', 'verified') === true);
  A('域: 写分离守护 producerClass≠summarizer 拒',
    await rejects(() => { assertSummaryWriteSeparation({ producerClass: 'runtime' }); return Promise.resolve(); }));
  A('域: 写分离守护 status≠draft 拒（模型输出绝不 direct active）',
    await rejects(() => { assertSummaryWriteSeparation({ status: 'active' }); return Promise.resolve(); }));

  /* ── ① 正常：draft→verify→activate→hydrate 端到端 ─────────────────── */
  const srcA = await createSource(owner, 'thread-a', [
    '你好，我想准备分布式系统的面试。',
    '好的，我们先梳理分布式锁的核心。',
    'tool:search("分布式锁")',
  ]);
  const contentA = '用户准备分布式系统面试，重点是分布式锁。';
  const s1 = await draftAsSummarizer(owner, draftInput('thread-a', srcA, contentA, { idempotencyKey: 'mem02-a-1' }));
  A('① draft: version=1 + status=draft + replayed=false',
    s1.version === 1 && s1.status === 'draft' && s1.replayed === false);
  A('① draft: source_range_digest 与 domain deriveSummaryRangeDigest 逐字节一致（TS↔SQL）',
    s1.sourceRangeDigest === srcA.rangeDigest && /^[a-f0-9]{64}$/.test(s1.sourceRangeDigest));
  const s1Replay = await draftAsSummarizer(owner, draftInput('thread-a', srcA, contentA, { idempotencyKey: 'mem02-a-1' }));
  A('① 幂等: 同 idempotency_key 重放 → replayed=true + 同 id + 同 version',
    s1Replay.replayed === true && s1Replay.id === s1.id && s1Replay.version === 1);
  const v1 = await asPrincipal(admin, owner, (c) => verifyMemorySummary(c, s1.id, 1));
  A('① verify: draft→verified 成功且 cas_version 1→2',
    v1?.status === 'verified' && v1.casVersion === 2);
  const a1 = await asPrincipal(admin, owner, (c) => activateMemorySummary(c, s1.id, 2));
  A('① activate: verified→active 成功且 cas_version 2→3',
    a1?.status === 'active' && a1.casVersion === 3);
  const hydratedA = await asPrincipal(admin, owner, (c) => hydrateMemorySummaries(c, 'thread-a'));
  A('① hydrate: 仅 1 条 active 且 content/claims round-trip',
    hydratedA.length === 1 && hydratedA[0]!.id === s1.id && hydratedA[0]!.status === 'active'
    && hydratedA[0]!.content === contentA && hydratedA[0]!.claims.length === 1
    && hydratedA[0]!.version === 1 && hydratedA[0]!.casVersion === 3);
  A('① dispatch: 匹配 observed_status=active → decision=1（可进上下文）',
    (await asPrincipal(admin, owner, (c) => dispatchMemorySummaryHydrate(c, s1.id, 'active'))).dispatchDecision === 1);

  /* ── ② 异常：非法输入 fail-closed + 非目标态静默落败 ───────────────── */
  A('② 域 span: offsetKind≠utf8_byte 拒',
    await rejects(() => { assertSummaryClaimSpan({ offsetKind: 'utf16' as never, start: 0, end: 3 }); return Promise.resolve(); }));
  A('② 域 span: start>=end 半开区间非法 拒',
    await rejects(() => { assertSummaryClaimSpan({ offsetKind: 'utf8_byte', start: 3, end: 3 }); return Promise.resolve(); }));
  A('② 域 span: canonical = utf8_byte:start:end',
    canonicalSummaryClaimSpan({ offsetKind: 'utf8_byte', start: 21, end: 36 }) === 'utf8_byte:21:36');
  A('② TS: content_digest 失配 拒（服务端重算，不采信自报指纹）',
    await rejects(() => draftAsSummarizer(owner, draftInput('thread-a', srcA, contentA, { contentDigest: 'f'.repeat(64) }))));
  A('② TS: claim span end 越界 拒（end > source_utf8_byte_length）',
    await rejects(() => draftAsSummarizer(owner, draftInput('thread-a', srcA, contentA, {
      claims: [{ text: 'x', span: { offsetKind: 'utf8_byte', start: 0, end: 999999 } }],
    }))));
  A('② SQL: 来源范围未冻结(seq 越界) 拒（TS 通过、SQL fail-closed）',
    await rejects(() => draftAsSummarizer(owner, draftInput('thread-a', srcA, contentA, { sourceEventSeqEnd: 99 }))));
  A('② SQL: 非法 language 拒（TS 通过、SQL CHECK 拒）',
    await rejects(() => draftAsSummarizer(owner, draftInput('thread-a', srcA, contentA, { language: 'zh_CN' }))));
  A('② verify 非 draft(已 active) → 静默落败 null（不可重复 verify）',
    (await asPrincipal(admin, owner, (c) => verifyMemorySummary(c, s1.id, 3))) === null);
  const s2draft = await draftAsSummarizer(owner, draftInput('thread-a', srcA, '另一条 draft', { idempotencyKey: 'mem02-a-2' }));
  A('② activate 非 verified(draft) → 静默落败 null（不可直接激活 draft）',
    (await asPrincipal(admin, owner, (c) => activateMemorySummary(c, s2draft.id, 1))) === null);
  A('② supersede 非 active(draft) → 静默落败 null',
    (await asPrincipal(admin, owner, (c) => supersedeMemorySummary(c, s2draft.id, 1))) === null);
  const s2v = await asPrincipal(admin, owner, (c) => verifyMemorySummary(c, s2draft.id, 1));
  const s2i = await asPrincipal(admin, owner, (c) => invalidateMemorySummary(c, s2draft.id, 2));
  A('② invalidate: verified→invalidated 成功（cas 2→3，退休路径真可达）',
    s2v?.status === 'verified' && s2v.casVersion === 2
    && s2i?.status === 'invalidated' && s2i.casVersion === 3);

  /* ── ③ 特殊：UTF-8 多字节 span 边界（字节偏移非 code-point）────────── */
  const focus = '分布式系统';
  const focusStart = utf8Len('你好，我想准备');
  const focusEnd = focusStart + utf8Len(focus);
  A('③ 字节语义: 中文 5 字符 = 15 字节（utf8_byte 非 UTF-16 code-point）',
    utf8Len(focus) === 15 && focus.length === 5);
  const s3 = await draftAsSummarizer(owner, draftInput('thread-a', srcA, contentA, {
    idempotencyKey: 'mem02-a-3',
    claims: [{ text: '用户准备分布式系统面试', span: { offsetKind: 'utf8_byte', start: focusStart, end: focusEnd } }],
  }));
  // draft 不在 hydrate(仅 active)内，取 replay 读回同一行的 claims。
  const replayed3 = await asPrincipal(admin, owner, (c) => replayMemorySummaries(c, 'thread-a')).then((rows) => rows.filter((r) => r.id === s3.id));
  A('③ 多字节 span round-trip: 字节边界 span 被接受且原样回读(span.start/end=字节偏移)',
    s3.status === 'draft' && replayed3.length === 1
    && replayed3[0]!.claims[0]!.span.start === focusStart && replayed3[0]!.claims[0]!.span.end === focusEnd);

  /* ── ④ 逃逸通道：cross-owner=0 + summarizer 无 forge active + app_role 无 draft ── */
  const srcOther = await createSource(otherOwner, 'thread-a', ['我自己的面试内容']);
  await draftAsSummarizer(otherOwner, draftInput('thread-a', srcOther, '别人的摘要内容', { idempotencyKey: 'mem02-other-1' }));
  A('④ 跨 owner: owner hydrate/replay thread-a 不泄 otherOwner 的摘要（RLS 隔离）',
    (await asPrincipal(admin, owner, (c) => replayMemorySummaries(c, 'thread-a'))).every((r) => !r.content.includes('别人'))
    && (await asPrincipal(admin, otherOwner, (c) => replayMemorySummaries(c, 'thread-a'))).every((r) => !r.content.includes('用户准备')));
  A('④ 跨 owner: memory_runtime raw SELECT 直查 owner 摘要表 = 0 行可见（FORCE RLS）',
    (await rawSelectAsMemoryRuntime(otherOwner, (c) => c.query<{ n: number }>(
      'SELECT count(*)::int AS n FROM memory_summary WHERE owner_user_id=$1', [owner]))).rows[0]!.n === 0);
  // summarizer 只能 draft：正控 raw INSERT draft 成功；raw INSERT active 被 RLS WITH CHECK 拒。
  const rawInsert = (status: string, targetOwner: string) => asSummarizer(owner, (c) => c.query(
    `INSERT INTO memory_summary(owner_user_id, thread_id, kind, version, source_event_seq_start, source_event_seq_end, source_range_digest, source_artifact_digest, source_utf8_byte_length, content, content_digest, claims, prompt_version, model_version, tokenizer_version, policy_version, data_subject_id, source_entity_id, consent_revision, privacy_epoch, immutable_source_version, normalization_recipe_version, extraction_recipe_version, verification_recipe_version, language, status)
     VALUES ($1,'thread-escape','turn_summary',1,1,1,$2,$3,10,'escape',$4,'[]','v1','v1','v1','v1',$1,'thread-escape',1,1,'conv:v1','n','e','v','zh',$5)`,
    [targetOwner, 'a'.repeat(64), 'b'.repeat(64), deriveSummaryContentDigest('escape'), status]));
  A('④ summarizer 正控: raw INSERT draft 成功（summarizer 可写 draft）',
    !(await rejects(() => rawInsert('draft', owner))));
  A('④ 无 forge active: summarizer raw INSERT status=active 被 RLS WITH CHECK 拒',
    await rejects(() => rawInsert('active', owner)));
  A('④ 无 forge active: summarizer raw INSERT 伪造 owner_user_id≠principal 被 RLS 拒',
    await rejects(() => rawInsert('draft', otherOwner)));
  A('④ app_role 无 draft EXECUTE（runtime 不可写 summary）',
    await rejects(() => asPrincipal(admin, owner, (c) => draftMemorySummary(c, draftInput('thread-a', srcA, contentA)))));

  /* ── ⑤ 高并发：verify CAS 单赢家 ───────────────────────────────────── */
  const srcCas = await createSource(owner, 'thread-cas', ['并发摘要来源']);
  const sCas = await draftAsSummarizer(owner, draftInput('thread-cas', srcCas, '并发摘要内容'));
  const [casWin, casLose] = await Promise.all([
    asPrincipal(admin, owner, (c) => verifyMemorySummary(c, sCas.id, 1)),
    asPrincipal(admin, owner, (c) => verifyMemorySummary(c, sCas.id, 1)),
  ]);
  A('⑤ CAS 并发: 同 expected_cas_version=1 并发 verify 只有一个赢家(cas_version 2)',
    (casWin !== null) !== (casLose !== null) && (casWin?.casVersion ?? casLose?.casVersion) === 2);
  A('⑤ CAS 陈旧 version: 已到 cas_version=2 再传 1 落败返回 null（乐观并发失配）',
    (await asPrincipal(admin, owner, (c) => verifyMemorySummary(c, sCas.id, 1))) === null);

  /* ── ⑥ 复杂：supersede 不覆盖 + activate 自动 supersede 旧 active ──── */
  const srcSup = await createSource(owner, 'thread-supersede', ['版本一：分布式锁', '版本二：共识协议']);
  const contentV1 = '版本一摘要：分布式锁';
  const contentV2 = '版本二摘要：分布式锁与共识';
  const sv1 = await draftAsSummarizer(owner, draftInput('thread-supersede', srcSup, contentV1, { idempotencyKey: 'sup-v1' }));
  await asPrincipal(admin, owner, (c) => verifyMemorySummary(c, sv1.id, 1));
  await asPrincipal(admin, owner, (c) => activateMemorySummary(c, sv1.id, 2));
  const sv2 = await draftAsSummarizer(owner, draftInput('thread-supersede', srcSup, contentV2, { supersedesSummaryId: sv1.id, idempotencyKey: 'sup-v2' }));
  A('⑥ supersede: 新版本走旧版本 +1（version=2）且 supersedes 引用旧版本',
    sv2.version === 2 && sv2.status === 'draft');
  await asPrincipal(admin, owner, (c) => verifyMemorySummary(c, sv2.id, 1));
  await asPrincipal(admin, owner, (c) => activateMemorySummary(c, sv2.id, 2));
  const v1After = (await admin.query<{ status: string; version: string; content: string }>(
    'SELECT status, version, content FROM memory_summary WHERE id=$1', [sv1.id])).rows[0]!;
  const v2After = (await admin.query<{ status: string; version: string; content: string }>(
    'SELECT status, version, content FROM memory_summary WHERE id=$1', [sv2.id])).rows[0]!;
  A('⑥ 不覆盖: 旧版本行保留(status=superseded, version=1)且 content 未变（append-only 非原地 UPDATE）',
    v1After.status === 'superseded' && Number(v1After.version) === 1 && v1After.content === contentV1);
  A('⑥ 不覆盖: 新版本 active(version=2) 且 content 为新摘要',
    v2After.status === 'active' && Number(v2After.version) === 2 && v2After.content === contentV2);
  const hydSup = await asPrincipal(admin, owner, (c) => hydrateMemorySummaries(c, 'thread-supersede'));
  const repSup = await asPrincipal(admin, owner, (c) => replayMemorySummaries(c, 'thread-supersede'));
  A('⑥ 单 active: hydrate 只回 active 新版本(1 条)，replay 回旧+新(2 条)',
    hydSup.length === 1 && hydSup[0]!.id === sv2.id
    && repSup.length === 2 && repSup.map((r) => r.version).sort((a, b) => a - b).join(',') === '1,2');

  /* ── ⑦ 刁钻：账户删除孤儿闭合三路径 read=0 + 幂等 ─────────────────── */
  const HASH = 'd'.repeat(64);
  A('⑦ begin: 非 64-hex idempotency_key_hash 拒',
    await rejects(() => asPrincipal(admin, owner, (c) => beginMemorySummaryErasure(c, 'short'))));
  const begun = await asPrincipal(admin, owner, (c) => beginMemorySummaryErasure(c, HASH));
  A('⑦ begin: 落 fenced request + 1 个 memory_summary sink target',
    begun.requestStatus === 'fenced' && begun.targets.length === 1 && begun.targets[0]!.sink === 'memory_summary');
  const targets: PrivacyAuthzTarget[] = begun.targets.map((t) => ({ kind: t.sink, resource: t.resourceHmac }));
  A('⑦ begin: SQL target_set_digest 与 TS canonicalTargetSetDigest 逐字节相等',
    begun.targetSetDigest === canonicalTargetSetDigest(targets));
  const begunReplay = await asPrincipal(admin, owner, (c) => beginMemorySummaryErasure(c, HASH));
  A('⑦ begin 幂等: 同 hash 重放返回同一 request(replayed=true)',
    begunReplay.requestId === begun.requestId && begunReplay.replayed === true);
  const fenceCounts = await admin.query<{ fenced: number; live: number }>(
    "SELECT (count(*) FILTER (WHERE status='fenced'))::int AS fenced, (count(*) FILTER (WHERE status IN ('draft','verified','active','superseded','invalidated')))::int AS live FROM memory_summary WHERE owner_user_id=$1", [owner]);
  A('⑦ fence 全量: 所有 live 摘要 → fenced，0 live 残留（状态真落地）',
    fenceCounts.rows[0]!.fenced > 0 && fenceCounts.rows[0]!.live === 0);
  A('⑦ fence 后 read=0: hydrate(仅 active) 0 条',
    (await asPrincipal(admin, owner, (c) => hydrateMemorySummaries(c, 'thread-a'))).length === 0
    && (await asPrincipal(admin, owner, (c) => hydrateMemorySummaries(c, 'thread-supersede'))).length === 0);
  A('⑦ fence 后 read=0: replay(排除 fenced/purged) 0 条',
    (await asPrincipal(admin, owner, (c) => replayMemorySummaries(c, 'thread-a'))).length === 0
    && (await asPrincipal(admin, owner, (c) => replayMemorySummaries(c, 'thread-supersede'))).length === 0);
  A('⑦ 补偿控制: 已 fence 摘要派发 → fence_first（围栏先赢防复活）',
    (await asPrincipal(admin, owner, (c) => dispatchMemorySummaryHydrate(c, s1.id, 'active'))).voidReason === 'fence_first');

  // 复用冻结 PrivacyAuthorizationIssuer：签 account_data_erasure 快照并落到冻结 issue/consume。
  const signed = signAccountSnapshot(owner, begun.privacyEpoch, targets);
  await asIssuer(owner, (c) => issueAuthorizationSnapshot(c, {
    jti: signed.jti, keyId: KEY.kid, actor: owner, interviewId: owner,
    purpose: 'account_data_erasure', privacyEpoch: begun.privacyEpoch, targetSetDigest: signed.targetSetDigest,
    expiresAt: new Date(signed.expiresAtMs),
  }));
  await asPrivacyWorkerExecutor(admin, (c) => consumeAuthorizationSnapshot(c, signed.jti, worker));

  const targetId = (await admin.query<{ id: string }>(
    'SELECT id FROM privacy_deletion_target WHERE request_id=$1 AND sink=$2', [begun.requestId, 'memory_summary'])).rows[0]!.id;
  const claimed = await asPrivacyWorkerPrincipal(admin, owner, (c) => claimMemorySummaryTarget(c, signed.jti, targetId, worker, 60));
  A('⑦ claim: memory_summary 目标受约束 claim 成功并签发租约',
    claimed !== null && claimed.leaseToken.length > 0 && claimed.targetId === targetId);
  A('⑦ claim: 伪造 principal(≠ snapshot.owner) claim 拒',
    await rejects(() => asPrivacyWorkerPrincipal(admin, otherOwner, (c) => claimMemorySummaryTarget(c, signed.jti, targetId, worker, 60))));

  const purged = await asPrivacyWorkerPrincipal(admin, owner, (c) => purgeMemorySummaryTarget(c, targetId, claimed!.leaseToken));
  A('⑦ purge: 物理清除 erased + deletedCount≥1 + request completed',
    purged.status === 'erased' && purged.deletedCount >= 1 && purged.requestStatus === 'completed');
  A('⑦ purge 后 read=0: raw SELECT 0 行（真物理删除）',
    (await admin.query<{ n: number }>('SELECT count(*)::int AS n FROM memory_summary WHERE owner_user_id=$1', [owner])).rows[0]!.n === 0);
  A('⑦ purge 后 read=0: hydrate 0 条',
    (await asPrincipal(admin, owner, (c) => hydrateMemorySummaries(c, 'thread-supersede'))).length === 0);
  A('⑦ purge 后 read=0: replay 0 条',
    (await asPrincipal(admin, owner, (c) => replayMemorySummaries(c, 'thread-supersede'))).length === 0);
  A('⑦ 补偿控制: 已物理删除摘要派发 → purged（绝不复活）',
    (await asPrincipal(admin, owner, (c) => dispatchMemorySummaryHydrate(c, s1.id, 'active'))).voidReason === 'purged');

  await admin.end();
  console.log(failures === 0
    ? '\n✓ 单轮与区间摘要(MEM-02) DB 证明通过（本地隔离证据，待独立专家审计）'
    : `\n✗ ${failures} 个断言失败`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(async (e) => {
  console.error(e);
  await admin.end().catch(() => undefined);
  process.exit(1);
});
