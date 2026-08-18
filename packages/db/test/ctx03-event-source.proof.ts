/**
 * 不可变会话事件源（CTX-03）DB 证明。
 *
 * 跑在 run-e2e-isolated.mjs 起的临时 Postgres（完整迁移 + nonce 校验）。证明（六矩阵）：
 *  - TC-CTX-03-①：append 有序/唯一/并发 CAS——同 (owner,thread) 序列单调无洞；并发追加序列唯一。
 *  - TC-CTX-03-②：零明文——关系行无正文字段；app_role 无 ciphertext/事件表原始 SELECT；只留指纹。
 *  - TC-CTX-03-③：checkpoint 引用仅 range/version/digest（range_ref 无正文；digest 确定且覆盖范围）。
 *  - TC-CTX-03-④：cross-owner = 0（owner B replay/range_ref/raw SELECT 对 owner A 的事件 = 0）。
 *  - TC-CTX-03-⑤：确定性恢复——全新连接（无内存态）replay 出有序事件 + digest 一致（不依赖进程内
 *    session map）。
 *  - TC-CTX-03-⑥：retention/consent/purpose/privacy_epoch + 单向状态机 fail-closed（非法 enum/epoch
 *    拒绝、fenced→active 回放拒绝、幂等键重放单份）。
 *
 * 铁律：不 log PII/全文；四原语复用不重实现（CAS/幂等键/RLS/memory_append_audit 有序日志）；
 * 待独立专家审计，本证明只产出本地隔离证据，不自称「完成/通过」。
 */
import {
  createPool, asPrincipal, asPrivacyWorkerPrincipal, asPrivacyWorkerExecutor, assertIsolatedTestTarget,
  appendConversationEvent, replayConversationEvents, conversationEventRangeRef,
  conversationEventBodyHmac, CONVERSATION_EVENT_KEY_VERSION,
  beginConversationEventErasure, claimConversationEventTarget, purgeConversationEventTarget,
  dispatchConversationEventReplay, transitionConversationEventStatus,
  issueAuthorizationSnapshot, consumeAuthorizationSnapshot,
  type Client, type AppendConversationEventInput,
} from '@meetwise/db';
import {
  CONVERSATION_EVENT_CATEGORIES, CONVERSATION_EVENT_SOURCES, CONVERSATION_EVENT_STATUSES,
  CONVERSATION_RETENTION_CLASSES, CONVERSATION_CONSENT_PURPOSES, CONVERSATION_EVENT_REF_VERSION,
  CONVERSATION_EVENT_SINKS, deriveEventDigest, deriveRangeDigest,
  canonicalTargetSetDigest, generatePrivacyAuthzKeyPair, signPrivacyAuthorizationSnapshot,
  type PrivacyAuthzTarget,
} from '@meetwise/domain';

const admin = createPool({ max: 40 });
const owner = `ctx03-owner-${process.pid}`;
const otherOwner = `ctx03-other-${process.pid}`;
const worker = `ctx03-worker-${process.pid}`;
const NOW_SEC = Math.floor(Date.now() / 1000);
const KEY = generatePrivacyAuthzKeyPair('privacy-del-ctx03-01');

let failures = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };
const rejects = async (fn: () => Promise<unknown>) => { try { await fn(); return false; } catch { return true; } };

async function insertAccount(userId: string): Promise<void> {
  await admin.query(
    'INSERT INTO user_account(id, email, password_hash) VALUES ($1,$2,$3) ON CONFLICT (id) DO NOTHING',
    [userId, `${userId}@ctx03.test`, 'scrypt$salt$dk'],
  );
}

/** 签发器专用 principal（SET LOCAL ROLE privacy_issuer + 绑定 owner GUC），与 MEM/INT 证明同源。 */
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

function signAccountSnapshot(ownerId: string, epoch: number, targets: PrivacyAuthzTarget[]) {
  return signPrivacyAuthorizationSnapshot({
    privateKeyPem: KEY.privateKeyPem, kid: KEY.kid, actor: ownerId, owner: ownerId, interview: ownerId,
    purpose: 'account_data_erasure', privacyEpoch: epoch, targets, nowSec: NOW_SEC, ttlSec: 600,
  });
}

/** 标准输入工厂（owner 作用域 append）。 */
function input(overrides: Partial<AppendConversationEventInput> = {}): AppendConversationEventInput {
  return {
    threadId: 'thread-main', category: 'user_message', source: 'user', eventKey: null,
    body: '你好，我想准备分布式系统的面试', retentionClass: 'session',
    consentPurpose: 'free_conversation', consentRevision: 1, privacyEpoch: 1,
    ...overrides,
  };
}

const append = (userId: string, i: AppendConversationEventInput) => asPrincipal(admin, userId, (c) => appendConversationEvent(c, i));
const replay = (userId: string, threadId: string, after = 0) => asPrincipal(admin, userId, (c) => replayConversationEvents(c, threadId, after));
const rangeRef = (userId: string, threadId: string, from: number, to: number) => asPrincipal(admin, userId, (c) => conversationEventRangeRef(c, threadId, from, to));

/** memory_runtime 原始 SQL（有表级 SELECT，但 NOBYPASSRLS + FORCE RLS，只看得见 owner=principal）。 */
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

async function main() {
  await assertIsolatedTestTarget(admin);
  await insertAccount(owner);
  await insertAccount(otherOwner);

  /* ── A. 域常量 pin（显式 enum 非布尔汤）────────────────────────────── */
  A('域: category 枚举冻结（6 值最小集）',
    CONVERSATION_EVENT_CATEGORIES.join(',') === 'turn_start,user_message,assistant_message,tool_call,tool_result,system_note');
  A('域: source 枚举冻结 user/model/tool/system',
    CONVERSATION_EVENT_SOURCES.join(',') === 'user,model,tool,system');
  A('域: status 枚举冻结 active/privacy_fenced/purged（单向）',
    CONVERSATION_EVENT_STATUSES.join(',') === 'active,privacy_fenced,purged');
  A('域: retention_class 冻结 session/account/derived',
    CONVERSATION_RETENTION_CLASSES.join(',') === 'session,account,derived');
  A('域: consent_purpose 冻结 free_conversation',
    CONVERSATION_CONSENT_PURPOSES.join(',') === 'free_conversation');
  A('域: checkpoint 引用版本 ref_version=1',
    CONVERSATION_EVENT_REF_VERSION === 1);

  /* ── B. TC-CTX-03-① append 有序 + digest 服务端重算 + 幂等重放 ──────── */
  const e1 = await append(owner, input({ eventKey: 'evt-1' }));
  const e2 = await append(owner, input({ category: 'assistant_message', source: 'model', eventKey: 'evt-2', body: '好的，我们先梳理分布式锁的核心。' }));
  const e3 = await append(owner, input({ category: 'tool_call', source: 'model', eventKey: 'evt-3', body: 'tool:search("分布式锁")' }));
  A('① 有序: 三事件序列单调 1→2→3（无洞）',
    e1.sequence === 1 && e2.sequence === 2 && e3.sequence === 3);
  A('① 有序: 唯一 event_id 各不相同',
    new Set([e1.eventId, e2.eventId, e3.eventId]).size === 3);
  // digest 由 SQL 侧确定性重算（不信任调用方自报指纹）；与 domain deriveEventDigest 逐字节一致。
  const hmac1 = conversationEventBodyHmac(input().body);
  const expectedDigest1 = deriveEventDigest({
    category: 'user_message', source: 'user', bodyHmac: hmac1, retentionClass: 'session',
    consentPurpose: 'free_conversation', consentRevision: 1, privacyEpoch: 1,
    encKeyVersion: CONVERSATION_EVENT_KEY_VERSION,
  });
  A('① digest: SQL 侧 event_digest 与 domain deriveEventDigest 逐字节一致',
    e1.eventDigest === expectedDigest1 && e1.bodyHmac === hmac1 && /^[a-f0-9]{64}$/.test(e1.eventDigest));

  // 幂等键（principal 作用域）：同 event_key 重放返回既有事件，不双写。
  const e1Replay = await append(owner, input({ eventKey: 'evt-1' }));
  A('② 幂等: 同 event_key 重放 → replayed=true + 同 event_id + 同 sequence',
    e1Replay.replayed === true && e1Replay.eventId === e1.eventId && e1Replay.sequence === e1.sequence);
  const evtCount = (await admin.query<{ n: number }>('SELECT count(*)::int AS n FROM conversation_event WHERE owner_user_id=$1', [owner])).rows[0]!.n;
  A('② 幂等: 重放后事件仍 3 行（不双写）', evtCount === 3);

  /* ── C. TC-CTX-03-② 零明文 ────────────────────────────────────────── */
  const plaintextCols = (await admin.query<{ n: number }>(
    `SELECT count(*)::int AS n FROM information_schema.columns
      WHERE table_name='conversation_event'
        AND column_name IN ('body','content','message','payload','text','raw')`,
  )).rows[0]!.n;
  A('② 零明文: 关系行无正文列（body/content/message/payload/text/raw 均不存在）',
    plaintextCols === 0);
  A('② 零明文: ciphertext 列只存在于 artifact 表（事件表无 bytea 正文）',
    (await admin.query<{ n: number }>(
      `SELECT count(*)::int AS n FROM information_schema.columns
        WHERE table_name='conversation_event' AND data_type='bytea'`)).rows[0]!.n === 0
    && (await admin.query<{ n: number }>(
      `SELECT count(*)::int AS n FROM information_schema.columns
        WHERE table_name='conversation_event_artifact' AND column_name='ciphertext' AND data_type='bytea'`)).rows[0]!.n === 1);
  A('② 零明文: app_role 无 conversation_event 原始 SELECT（表级 REVOKE）',
    await rejects(() => asPrincipal(admin, owner, (c) => c.query('SELECT * FROM conversation_event'))));
  A('② 零明文: app_role 无 conversation_event_artifact 原始 SELECT（ciphertext 永不可读）',
    await rejects(() => asPrincipal(admin, owner, (c) => c.query('SELECT * FROM conversation_event_artifact'))));

  /* ── D. TC-CTX-03-③ checkpoint 引用仅 range/version/digest ────────── */
  const ref = await rangeRef(owner, 'thread-main', 1, 3);
  const refEntries = (await replay(owner, 'thread-main')).map((x) => ({ sequence: x.sequence, eventDigest: x.eventDigest }));
  const expectedRangeDigest = deriveRangeDigest({ threadId: 'thread-main', fromSequence: 1, toSequence: 3, entries: refEntries });
  A('③ 引用: range_ref 返回 thread + range + version + digest（无正文字段）',
    ref.threadId === 'thread-main' && ref.fromSequence === 1 && ref.toSequence === 3
    && ref.refVersion === 1 && ref.eventCount === 3 && /^[a-f0-9]{64}$/.test(ref.rangeDigest)
    && !('body' in ref) && !('ciphertext' in ref));
  A('③ 引用: range_digest 与 domain deriveRangeDigest（replay 重算）逐字节一致',
    ref.rangeDigest === expectedRangeDigest);
  const refEmpty = await rangeRef(owner, 'thread-main', 1, 1);
  const refPartial = await rangeRef(owner, 'thread-main', 2, 2);
  A('③ 引用: 子范围 digest 与全范围不同（范围边界参与 digest，防错范围误当完整引用）',
    refPartial.rangeDigest !== ref.rangeDigest && refEmpty.eventCount === 1);

  /* ── E. TC-CTX-03-④ cross-owner = 0 ───────────────────────────────── */
  const otherThread = await append(otherOwner, input({ threadId: 'thread-main', eventKey: 'other-1', body: '我自己的回答内容' }));
  const ownerReplay = await replay(owner, 'thread-main');
  A('④ 跨 owner: owner 的 replay 不泄 otherOwner 的事件（RLS owner 隔离）',
    ownerReplay.length === 3 && !ownerReplay.some((x) => x.eventId === otherThread.eventId));
  const otherReplayOnOwnerThread = await replay(otherOwner, 'thread-main');
  A('④ 跨 owner: otherOwner replay 同 thread 只看到自己的 1 条（不越界）',
    otherReplayOnOwnerThread.length === 1 && otherReplayOnOwnerThread[0]!.eventId === otherThread.eventId);
  const crossRef = await rangeRef(otherOwner, 'thread-main', 1, 3);
  A('④ 跨 owner: otherOwner range_ref(1..3) eventCount=1（看不到 owner 的 3 条）',
    crossRef.eventCount === 1);
  A('④ 跨 owner: memory_runtime raw SELECT 直查 owner 事件表 = 0 行可见（FORCE RLS owner 隔离）',
    (await rawSelectAsMemoryRuntime(otherOwner, (c) => c.query<{ n: number }>(
      'SELECT count(*)::int AS n FROM conversation_event WHERE owner_user_id=$1', [owner]))).rows[0]!.n === 0);

  /* ── F. TC-CTX-03-⑤ 确定性恢复（无进程内 session map）──────────────── */
  // 用一个全新连接（无任何内存态）replay 整段会话——证明恢复只依赖持久化事件源。
  const freshReplay = await admin.connect().then(async (fresh) => {
    try {
      await fresh.query('BEGIN');
      await fresh.query('SET LOCAL ROLE app_role');
      await fresh.query("SELECT set_config('app.principal_user', $1, true)", [owner]);
      const r = await fresh.query<{ sequence: string | number; event_digest: string; category: string; source: string; body_hmac: string }>(
        'SELECT * FROM conversation_event_replay($1, $2)', ['thread-main', 0]);
      await fresh.query('COMMIT');
      return r.rows;
    } catch (e) { await fresh.query('ROLLBACK').catch(() => undefined); throw e; } finally { fresh.release(); }
  });
  A('⑤ 恢复: 全新连接（无内存态）replay 出 3 条有序事件（sequence 1..3）',
    freshReplay.length === 3
    && freshReplay.map((x) => Number(x.sequence)).join(',') === '1,2,3');
  A('⑤ 恢复: replay 的 digest 与 append 时 SQL 侧 digest 一致（持久化事件源是唯一真相）',
    freshReplay[0]!.event_digest === e1.eventDigest
    && freshReplay[1]!.event_digest === e2.eventDigest
    && freshReplay[2]!.event_digest === e3.eventDigest);

  /* ── G. TC-CTX-03-① 并发追加：序列唯一无洞 ─────────────────────────── */
  const N = 12;
  const concurrent = await Promise.all(
    Array.from({ length: N }, (_, i) => append(owner, input({ threadId: 'thread-concurrent', eventKey: `conc-${i}`, body: `并发事件 ${i}` }))),
  );
  const seqs = concurrent.map((r) => r.sequence).sort((a, b) => a - b);
  A('① 并发: N 次并发追加序列唯一且为 1..N（advisory 锁下 MAX+1 原子分配，无洞无重排）',
    seqs.length === N && seqs.every((s, idx) => s === idx + 1)
    && new Set(seqs).size === N);

  /* ── H. TC-CTX-03-⑥ retention/consent/purpose/privacy_epoch + 单向状态机 fail-closed ── */
  A('⑥ fail-closed: 非法 category → 拒绝（22023）',
    await rejects(() => append(owner, input({ threadId: 'thread-invalid', category: 'unknown_category' as never }))));
  A('⑥ fail-closed: 非法 source → 拒绝',
    await rejects(() => append(owner, input({ threadId: 'thread-invalid', source: 'unknown_source' as never }))));
  A('⑥ fail-closed: 非法 retention_class → 拒绝',
    await rejects(() => append(owner, input({ threadId: 'thread-invalid', retentionClass: 'forever' as never }))));
  A('⑥ fail-closed: 非法 consent_purpose → 拒绝',
    await rejects(() => append(owner, input({ threadId: 'thread-invalid', consentPurpose: 'marketing' as never }))));
  A('⑥ fail-closed: privacy_epoch=0 → 拒绝（epoch 必须 ≥1）',
    await rejects(() => append(owner, input({ threadId: 'thread-invalid', privacyEpoch: 0 }))));
  A('⑥ fail-closed: consent_revision=0 → 拒绝',
    await rejects(() => append(owner, input({ threadId: 'thread-invalid', consentRevision: 0 }))));
  A('⑥ fail-closed: 空正文 → 拒绝',
    await rejects(() => append(owner, input({ threadId: 'thread-invalid', body: '' }))));

  // 单向状态机 guard：fenced→active、purged→active 回放被 DB 触发器拒绝。
  A('⑥ 单向: 事件 status fenced→active 回放被拒（one-way guard）',
    await rejects(() => admin.query('UPDATE conversation_event SET status=$2 WHERE id=$1', [e1.eventId, 'privacy_fenced'])
      .then(() => admin.query('UPDATE conversation_event SET status=$2 WHERE id=$1', [e1.eventId, 'active']))));
  // 直接一步 active→purged→active 也拒绝。
  A('⑥ 单向: 事件 status purged→active 回放被拒',
    await rejects(() => admin.query('UPDATE conversation_event SET status=$2 WHERE id=$1', [e2.eventId, 'purged'])
      .then(() => admin.query('UPDATE conversation_event SET status=$2 WHERE id=$1', [e2.eventId, 'active']))));
  // 工件表同一单向 guard。
  const art1 = (await admin.query<{ id: string }>('SELECT artifact_id AS id FROM conversation_event WHERE id=$1', [e3.eventId])).rows[0]!.id;
  A('⑥ 单向: 工件 status fenced→active 回放被拒（同一 guard 触发器）',
    await rejects(() => admin.query('UPDATE conversation_event_artifact SET status=$2 WHERE id=$1', [art1, 'privacy_fenced'])
      .then(() => admin.query('UPDATE conversation_event_artifact SET status=$2 WHERE id=$1', [art1, 'active']))));

  /* ── I. 账户删除 sink 闭合 + version CAS + 补偿控制（0111）────────────────── */
  A('域: sink 枚举 pin conversation_event + conversation_event_artifact',
    CONVERSATION_EVENT_SINKS.join(',') === 'conversation_event,conversation_event_artifact');

  // I-b. version CAS 原语（MEDIUM-2：version+1 + WHERE version=expected）。
  const eCas = await append(owner, input({ threadId: 'thread-cas', eventKey: 'cas-1', body: 'CAS 跃迁测试事件' }));
  A('② CAS: active→privacy_fenced 用 version=1 成功且 version+1=2（正向跃迁真可达）',
    (await asPrincipal(admin, owner, (c) => transitionConversationEventStatus(c, eCas.eventId, 'active', 'privacy_fenced', 1)))?.version === 2);
  A('② CAS: privacy_fenced→purged 用 version=2 成功且 version+1=3（purged 真可达，非死状态）',
    (await asPrincipal(admin, owner, (c) => transitionConversationEventStatus(c, eCas.eventId, 'privacy_fenced', 'purged', 2)))?.version === 3);
  A('② CAS: purged→active 回退被拒（one-way guard，非静默空）',
    await rejects(() => asPrincipal(admin, owner, (c) => transitionConversationEventStatus(c, eCas.eventId, 'purged', 'active', 3))));

  const eCas2 = await append(owner, input({ threadId: 'thread-cas', eventKey: 'cas-2', body: '并发 CAS 竞争事件' }));
  const [casWin, casLose] = await Promise.all([
    asPrincipal(admin, owner, (c) => transitionConversationEventStatus(c, eCas2.eventId, 'active', 'privacy_fenced', 1)),
    asPrincipal(admin, owner, (c) => transitionConversationEventStatus(c, eCas2.eventId, 'active', 'privacy_fenced', 1)),
  ]);
  A('④ CAS 并发: 同 expected_version=1 并发跃迁只有一个赢家（version+1 单赢家）',
    (casWin !== null) !== (casLose !== null) && (casWin?.version ?? casLose?.version) === 2);
  A('④ CAS 陈旧 version: 已到 version=2 再传 1 落败返回 null（乐观并发失配）',
    (await asPrincipal(admin, owner, (c) => transitionConversationEventStatus(c, eCas2.eventId, 'privacy_fenced', 'purged', 1))) === null);

  // I-c. 补偿控制（派发/回放前复核 consent/epoch，围栏先赢 → voided，防复活）。
  const eDisp = await append(owner, input({ threadId: 'thread-disp', eventKey: 'disp-1', body: '派发补偿控制测试', privacyEpoch: 1, consentRevision: 1 }));
  A('③ 补偿控制: 匹配 watermark 派发 decision=1（可回放）',
    (await asPrincipal(admin, owner, (c) => dispatchConversationEventReplay(c, eDisp.eventId, 1, 1))).dispatchDecision === 1);
  A('③ 补偿控制: consent_revision 漂移 → watermark_mismatch（voided）',
    (await asPrincipal(admin, owner, (c) => dispatchConversationEventReplay(c, eDisp.eventId, 1, 2))).voidReason === 'watermark_mismatch');
  A('③ 补偿控制: privacy_epoch 漂移 → watermark_mismatch（voided）',
    (await asPrincipal(admin, owner, (c) => dispatchConversationEventReplay(c, eDisp.eventId, 2, 1))).voidReason === 'watermark_mismatch');

  // I-d. 账户删除全链：begin（fence）→ 删后 read=0 → claim/purge → 物理 read=0。
  const HASH = 'c'.repeat(64);
  A('begin erasure: 非 64-hex idempotency_key_hash 拒绝',
    await rejects(() => asPrincipal(admin, owner, (c) => beginConversationEventErasure(c, 'short'))));
  const begun = await asPrincipal(admin, owner, (c) => beginConversationEventErasure(c, HASH));
  A('begin erasure: 落 fenced request + 2 个 CTX sink target（event + artifact）',
    begun.requestStatus === 'fenced' && begun.targets.length === 2
    && begun.targets.map((t) => t.sink).sort().join(',') === 'conversation_event,conversation_event_artifact');
  const targets: PrivacyAuthzTarget[] = begun.targets.map((t) => ({ kind: t.sink, resource: t.resourceHmac }));
  A('begin erasure: SQL target_set_digest 与 TS canonicalTargetSetDigest 逐字节相等',
    begun.targetSetDigest === canonicalTargetSetDigest(targets));
  const begunReplay = await asPrincipal(admin, owner, (c) => beginConversationEventErasure(c, HASH));
  A('begin erasure 幂等: 同 hash 重放返回同一 request(replayed=true)',
    begunReplay.requestId === begun.requestId && begunReplay.replayed === true);

  const fenceState = await admin.query<{ active: number; fenced: number }>(
    "SELECT (count(*) FILTER (WHERE status='active'))::int AS active, (count(*) FILTER (WHERE status='privacy_fenced'))::int AS fenced FROM conversation_event WHERE owner_user_id=$1", [owner]);
  A('② 正向跃迁: fence 后 conversation_event 0 active 且存在 privacy_fenced（状态真落地）',
    fenceState.rows[0]!.active === 0 && fenceState.rows[0]!.fenced > 0);
  const artFenceState = await admin.query<{ active: number; fenced: number }>(
    "SELECT (count(*) FILTER (WHERE status='active'))::int AS active, (count(*) FILTER (WHERE status='privacy_fenced'))::int AS fenced FROM conversation_event_artifact WHERE owner_user_id=$1", [owner]);
  A('② 正向跃迁: fence 后 artifact 同步 0 active 且存在 privacy_fenced',
    artFenceState.rows[0]!.active === 0 && artFenceState.rows[0]!.fenced > 0);
  const e3Version = await admin.query<{ version: string }>('SELECT version FROM conversation_event WHERE id=$1', [e3.eventId]);
  A('② 正向跃迁: fence 使 event version+1（version=1→2，CAS 语义）',
    Number(e3Version.rows[0]?.version) === 2);
  A('① fence 后 read=0: replay thread-main 不再回放（active 过滤下 privacy_fenced 不吐）',
    (await replay(owner, 'thread-main')).length === 0);
  A('① fence 后 read=0: range_ref eventCount=0',
    (await rangeRef(owner, 'thread-main', 1, 3)).eventCount === 0);
  A('③ 补偿控制: 已 fence 事件派发 → fence_first（voided，围栏先赢防复活）',
    (await asPrincipal(admin, owner, (c) => dispatchConversationEventReplay(c, eDisp.eventId, 1, 1))).voidReason === 'fence_first');

  // 复用冻结 PrivacyAuthorizationIssuer：签 account_data_erasure 快照并落到冻结 issue/consume。
  const signed = signAccountSnapshot(owner, begun.privacyEpoch, targets);
  await asIssuer(owner, (c) => issueAuthorizationSnapshot(c, {
    jti: signed.jti, keyId: KEY.kid, actor: owner, interviewId: owner,
    purpose: 'account_data_erasure', privacyEpoch: begun.privacyEpoch, targetSetDigest: signed.targetSetDigest,
    expiresAt: new Date(signed.expiresAtMs),
  }));
  await asPrivacyWorkerExecutor(admin, (c) => consumeAuthorizationSnapshot(c, signed.jti, worker));

  const targetRows = await admin.query<{ id: string; sink: string }>(
    'SELECT id, sink FROM privacy_deletion_target WHERE request_id=$1 ORDER BY sink', [begun.requestId]);
  const tid = (sink: string) => targetRows.rows.find((r) => r.sink === sink)!.id;
  const claimedEvt = await asPrivacyWorkerPrincipal(admin, owner, (c) => claimConversationEventTarget(c, signed.jti, tid('conversation_event'), worker, 60));
  A('claim: conversation_event 目标受约束 claim 成功并签发租约',
    claimedEvt !== null && claimedEvt.leaseToken.length > 0 && claimedEvt.targetId === tid('conversation_event'));
  A('claim: 伪造 principal(≠ snapshot.owner) claim 拒绝',
    await rejects(() => asPrivacyWorkerPrincipal(admin, otherOwner, (c) => claimConversationEventTarget(c, signed.jti, tid('conversation_event_artifact'), worker, 60))));

  const purgeEvt = await asPrivacyWorkerPrincipal(admin, owner, (c) => purgeConversationEventTarget(c, tid('conversation_event'), claimedEvt!.leaseToken));
  A('purge conversation_event: 物理清除 erased + deletedCount≥1',
    purgeEvt.status === 'erased' && purgeEvt.deletedCount >= 1);
  A('① purge 后 read=0: conversation_event raw SELECT 0 行（真物理删除）',
    (await admin.query<{ n: number }>('SELECT count(*)::int AS n FROM conversation_event WHERE owner_user_id=$1', [owner])).rows[0]!.n === 0);
  A('① purge 后 read=0: replay thread-main 0 条',
    (await replay(owner, 'thread-main')).length === 0);
  A('① purge 后 read=0: range_ref eventCount=0',
    (await rangeRef(owner, 'thread-main', 1, 3)).eventCount === 0);

  const claimedArt = await asPrivacyWorkerPrincipal(admin, owner, (c) => claimConversationEventTarget(c, signed.jti, tid('conversation_event_artifact'), worker, 60));
  const purgeArt = claimedArt ? await asPrivacyWorkerPrincipal(admin, owner, (c) => purgeConversationEventTarget(c, tid('conversation_event_artifact'), claimedArt.leaseToken)) : null;
  A('purge conversation_event_artifact: erased 且 request 推进 completed',
    purgeArt !== null && purgeArt.status === 'erased' && purgeArt.requestStatus === 'completed');
  A('① purge 后 read=0: conversation_event_artifact raw SELECT 0 行',
    (await admin.query<{ n: number }>('SELECT count(*)::int AS n FROM conversation_event_artifact WHERE owner_user_id=$1', [owner])).rows[0]!.n === 0);
  A('③ 补偿控制: 已物理删除事件派发 → purged（voided，绝不复活）',
    (await asPrincipal(admin, owner, (c) => dispatchConversationEventReplay(c, eDisp.eventId, 1, 1))).voidReason === 'purged');

  await admin.end();
  console.log(failures === 0
    ? '\n✓ 不可变会话事件源(CTX-03) DB 证明通过（本地隔离证据，待独立专家审计）'
    : `\n✗ ${failures} 个断言失败`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(async (e) => {
  console.error(e);
  await admin.end().catch(() => undefined);
  process.exit(1);
});
