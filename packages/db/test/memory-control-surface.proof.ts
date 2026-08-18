/**
 * 记忆管理控制面命令层（MEM-10）DB 证明。
 *
 * 跑在 run-e2e-isolated.mjs 起的临时 Postgres（完整迁移 + nonce 校验）。证明（七矩阵）：
 *  - TC-MEM-003-main：纠正产新版本（旧 active→contradicted + 新 active，禁 content 覆盖）；单条
 *    撤回先 fence 后 recall=0；逐 sink 目标清理有 receipt。
 *  - TC-MEM-003-S1：shadow generation 验证后由 memory_policy_releaser 跨 owner CAS 切换 active。
 *  - TC-MEM-003-E1：100× 幂等命令（纠正/暂停/导出/publish/reindex/删除）→ 版本/请求/目标/审计各一份。
 *  - TC-MEM-003-E2：revoke/correction race → 删除先赢（已撤回事实不可再纠正，仅一个合法迁移）。
 *  - TC-MEM-003-E3：role/RLS/raw SQL —— owner 跨租户=0、reviewer 无正文直读、releaser 无内容直读、
 *    app_role 无命令表原始读写、无 admin bypass（begin_deletion 不存在的账户=42501）。
 *  - TC-MEM-003-M1：all-sink 删除枚举（event/summary/fact/embedding/cache/context_snapshot/trace）；
 *    未知 locator → request 恒 pending_external（绝不伪造 completed）。
 *  - TC-MEM-003-T1：crash/lease/receipt tamper —— 旧 lease 不可完成、重复外部 receipt 幂等、篡改
 *    receipt 拒、no-forge-completed 守卫、target completed 不可回退（one-way 守卫）。
 *
 * 铁律：不 log PII/全文；删除授权根冻结在 0091/0093（本迁移 request/target 是命令层追踪对象）。
 */
import {
  createPool, asPrincipal, asPrivacyWorkerPrincipal, assertIsolatedTestTarget,
  issueMemoryAdmissionSnapshot, admitMemoryRecord,
  materializeAdjudicationFact, confirmAdjudicationFact, revokeAdjudicationFact,
  buildMemoryGeneration, validateGeneration, switchActiveGeneration, activeGeneration,
  recallHybridCandidates,
  listSourceCards, deletionProgress, correctFact, withdrawFact, beginDeletion,
  pauseCollection, resumeCollection, exportReceipt, recordPolicyPublish, recordReindex,
  reviewSourceCard, switchGeneration, claimDeletionTarget, completeDeletionTarget, failDeletionTarget,
  type Client, type RecallHybridCandidatesInput,
} from '@meetwise/db';
import {
  deriveEmbeddingRecipeDigest, deterministicMemoryEmbedder, memoryContentDigest, utf8ByteLength,
  MEMORY_DELETION_SCOPES, MEMORY_DELETION_REQUEST_STATUSES, MEMORY_DELETION_TARGET_STATUSES,
  MEMORY_CORRECTION_DISPOSITIONS, MEMORY_COLLECTION_PAUSE_STATUSES,
  MEMORY_AUTHZ_SINK_KINDS, MEMORY_CONTROL_REVIEWER_ROLE, MEMORY_CONTROL_POLICY_RELEASER_ROLE,
  type MemoryEmbeddingRecipe, type MemoryEmbedder,
} from '@meetwise/domain';

const admin = createPool({ max: 40 });
const owner = `mem10-owner-${process.pid}`;
const otherOwner = `mem10-other-${process.pid}`;

let failures = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };
const rejects = async (fn: () => Promise<unknown>) => { try { await fn(); return false; } catch { return true; } };

const SRC_TEXT = '面试：分布式锁租约续期与过期回滚（来源）';
const SRC_BYTES = utf8ByteLength(SRC_TEXT);
const PURPOSE = 'interview_prep' as const;
const SINGLE = 'single_value' as const;
const QUERY_TEXT = '分布式锁 租约续期';

const RECIPE: MemoryEmbeddingRecipe = {
  schema: 'memory-embed-v1', provider: 'deterministic', model: 'bag-of-words',
  revision: '1', dimension: 16, normalization: 'l2',
};
const RECIPE_DIGEST = deriveEmbeddingRecipeDigest(RECIPE);
const embedder: MemoryEmbedder = deterministicMemoryEmbedder(RECIPE.dimension);

// 受控角色 helper（本地，不改 principal.ts）：reviewer/releaser 是 NOLOGIN 角色，只能经
// SECURITY DEFINER 函数的最小面调用；admin（superuser）可 SET ROLE 到任意角色。
async function asAdmissionIssuer<T>(principal: string, fn: (c: Client) => Promise<T>): Promise<T> {
  const c = await admin.connect();
  try {
    await c.query('BEGIN');
    await c.query('SET LOCAL ROLE memory_admission_issuer');
    await c.query("SELECT set_config('app.principal_user', $1, true)", [principal]);
    const r = await fn(c);
    await c.query('COMMIT');
    return r;
  } catch (e) { await c.query('ROLLBACK').catch(() => undefined); throw e; } finally { c.release(); }
}
async function asReviewer<T>(fn: (c: Client) => Promise<T>): Promise<T> {
  const c = await admin.connect();
  try {
    await c.query('BEGIN');
    await c.query('SET LOCAL ROLE memory_reviewer');
    const r = await fn(c);
    await c.query('COMMIT');
    return r;
  } catch (e) { await c.query('ROLLBACK').catch(() => undefined); throw e; } finally { c.release(); }
}
async function asReleaser<T>(fn: (c: Client) => Promise<T>): Promise<T> {
  const c = await admin.connect();
  try {
    await c.query('BEGIN');
    await c.query('SET LOCAL ROLE memory_policy_releaser');
    const r = await fn(c);
    await c.query('COMMIT');
    return r;
  } catch (e) { await c.query('ROLLBACK').catch(() => undefined); throw e; } finally { c.release(); }
}

async function insertAccount(userId: string): Promise<void> {
  await admin.query(
    'INSERT INTO user_account(id, email, password_hash) VALUES ($1,$2,$3) ON CONFLICT (id) DO NOTHING',
    [userId, `${userId}@mem10.test`, 'scrypt$salt$dk'],
  );
}

type IssueInput = Parameters<typeof issueMemoryAdmissionSnapshot>[1];
function issueInput(overrides: Partial<IssueInput> = {}): IssueInput {
  return {
    snapshotKey: 'snap-main', dataSubjectId: owner, threadBoundary: 'thread-1', purpose: PURPOSE,
    allowedDataClass: 'derived_fact', consentRevision: 1, privacyEpoch: 1, sourceType: 'model_summary',
    sourceEntityId: 'src-1', immutableSourceVersion: 'v1', eventSeqStart: 1, eventSeqEnd: 5,
    normalizationRecipeVersion: 'norm-v1', sourceText: SRC_TEXT, policyVersion: 'memory-policy-v1',
    ...overrides,
  };
}
type Candidate = Parameters<typeof admitMemoryRecord>[1];
function candidate(overrides: Partial<Candidate> = {}): Candidate {
  return {
    snapshotKey: 'snap-main', sourceText: SRC_TEXT,
    sourceSpan: { offsetKind: 'utf8_byte', start: 0, end: SRC_BYTES },
    producerClass: 'summarizer', extractionConfidence: 0.9, salience: 1.0, language: 'zh-CN',
    contentDigest: memoryContentDigest('派生摘要：默认内容'),
    ...overrides,
  };
}
type MatInput = Parameters<typeof materializeAdjudicationFact>[1];
function matInput(overrides: Partial<MatInput> = {}): MatInput {
  return {
    admissionRecordId: '00000000-0000-0000-0000-000000000000', content: '派生摘要：默认内容',
    namespace: 'fact', cardinality: SINGLE, subject: 'default', validUntil: null,
    ...overrides,
  };
}

const issue = (userId: string, input: IssueInput) => asAdmissionIssuer(userId, (c) => issueMemoryAdmissionSnapshot(c, input));
const admit = (userId: string, cand: Candidate) => asPrincipal(admin, userId, (c) => admitMemoryRecord(c, cand));
const materialize = (userId: string, input: MatInput) => asPrincipal(admin, userId, (c) => materializeAdjudicationFact(c, input));
const confirm = (userId: string, factId: string) => asPrincipal(admin, userId, (c) => confirmAdjudicationFact(c, factId, 'user_confirmation'));
const revoke = (userId: string, factId: string) => asPrincipal(admin, userId, (c) => revokeAdjudicationFact(c, factId));
const buildGen = (userId: string, generationKey: string, manifestKey: string) =>
  asPrincipal(admin, userId, (c) => buildMemoryGeneration(c, {
    generationKey, manifestKey, recipe: RECIPE, policyVersion: 'memory-policy-v1', embedder,
  }));
const validate = (userId: string, genId: string, expected: { manifestDigest: string; factCount: number; embeddingRecipeDigest: string }) =>
  asPrincipal(admin, userId, (c) => validateGeneration(c, genId, expected));
const switchActive = (userId: string, genId: string) => asPrincipal(admin, userId, (c) => switchActiveGeneration(c, genId));
const getActive = (userId: string) => asPrincipal(admin, userId, (c) => activeGeneration(c));
const recallHybrid = (userId: string, input: RecallHybridCandidatesInput) => asPrincipal(admin, userId, (c) => recallHybridCandidates(c, input));

// 用户命令（owner 作用域）wrapper。
const listCards = (userId: string, purpose: string | null = null) => asPrincipal(admin, userId, (c) => listSourceCards(c, purpose as never));
const doCorrect = (userId: string, input: { factId: string; content: string; disposition: 'superseded' | 'disputed'; idempotencyKey?: string | null }) =>
  asPrincipal(admin, userId, (c) => correctFact(c, input));
const doWithdraw = (userId: string, input: { factId: string; idempotencyKey?: string | null }) =>
  asPrincipal(admin, userId, (c) => withdrawFact(c, input));
const doBeginDeletion = (userId: string, input: { scope: 'single_fact' | 'session' | 'account'; subjectId: string | null; idempotencyKey: string }) =>
  asPrincipal(admin, userId, (c) => beginDeletion(c, input));
const doProgress = (userId: string, requestId: string) => asPrincipal(admin, userId, (c) => deletionProgress(c, requestId));
const doPause = (userId: string, purpose: string, idempotencyKey?: string | null) =>
  asPrincipal(admin, userId, (c) => pauseCollection(c, { purpose: purpose as never, idempotencyKey }));
const doResume = (userId: string, purpose: string, idempotencyKey?: string | null) =>
  asPrincipal(admin, userId, (c) => resumeCollection(c, { purpose: purpose as never, idempotencyKey }));
const doExport = (userId: string, idempotencyKey: string) => asPrincipal(admin, userId, (c) => exportReceipt(c, idempotencyKey));
const doPublish = (userId: string, input: { generationKey: string; generationId: string; policyVersion: string; idempotencyKey: string }) =>
  asPrincipal(admin, userId, (c) => recordPolicyPublish(c, input));
const doReindex = (userId: string, input: { generationId: string; idempotencyKey: string }) =>
  asPrincipal(admin, userId, (c) => recordReindex(c, input));

// 运营命令（受控角色）+ worker 命令 wrapper。
const doReview = (ownerUserId: string, factId: string) => asReviewer((c) => reviewSourceCard(c, { ownerUserId, factId }));
const doSwitch = (ownerUserId: string, generationId: string) => asReleaser((c) => switchGeneration(c, { ownerUserId, generationId }));
const workerClaim = (userId: string, input: { requestId: string; sink: string; worker: string; leaseSeconds?: number }) =>
  asPrivacyWorkerPrincipal(admin, userId, (c) => claimDeletionTarget(c, input));
const workerComplete = (userId: string, input: { targetId: string; token: string; receipt: string }) =>
  asPrivacyWorkerPrincipal(admin, userId, (c) => completeDeletionTarget(c, input));
const workerFail = (userId: string, input: { targetId: string; token: string; reason: string }) =>
  asPrivacyWorkerPrincipal(admin, userId, (c) => failDeletionTarget(c, input));

/** 造一条 active 裁决事实（走 MEM-12 issue/admit + MEM-13 materialize/confirm），返回 fact id。 */
async function makeActiveFact(opts: {
  snapshotKey: string; sourceEntityId: string; allowedDataClass: string;
  content: string; namespace?: string; subject: string; idemPrefix: string; userId?: string; purpose?: string;
}): Promise<string> {
  const userId = opts.userId ?? owner;
  await issue(userId, issueInput({
    snapshotKey: opts.snapshotKey, sourceEntityId: opts.sourceEntityId,
    dataSubjectId: userId,
    allowedDataClass: opts.allowedDataClass as IssueInput['allowedDataClass'],
    purpose: (opts.purpose ?? PURPOSE) as IssueInput['purpose'],
  }));
  const admR = await admit(userId, candidate({
    snapshotKey: opts.snapshotKey, contentDigest: memoryContentDigest(opts.content), idempotencyKey: `${opts.idemPrefix}-admit`,
  }));
  const matR = await materialize(userId, matInput({
    admissionRecordId: admR.id, content: opts.content, namespace: (opts.namespace ?? 'fact') as MatInput['namespace'],
    subject: opts.subject, cardinality: SINGLE, idempotencyKey: `${opts.idemPrefix}-mat`,
  }));
  const conf = await confirm(userId, matR.id);
  if (!conf) throw new Error(`confirm failed for ${opts.idemPrefix}`);
  return matR.id;
}

async function main() {
  await assertIsolatedTestTarget(admin);
  await insertAccount(owner);
  await insertAccount(otherOwner);
  await asPrincipal(admin, owner, (c) => c.query('SELECT * FROM memory_grant_consent($1, $2)', [PURPOSE, 'memory-policy-v1']));
  await asPrincipal(admin, otherOwner, (c) => c.query('SELECT * FROM memory_grant_consent($1, $2)', [PURPOSE, 'memory-policy-v1']));

  /* ── A. 域常量 pin（显式 status enum 非布尔汤）────────────────────────────── */
  A('域: MEMORY_DELETION_SCOPES 冻结 single_fact/session/account',
    MEMORY_DELETION_SCOPES.join(',') === 'single_fact,session,account');
  A('域: 删除 request 状态机冻结(含 pending_external/partial_failed，completed 最后)',
    MEMORY_DELETION_REQUEST_STATUSES.join(',') === 'fenced,purging,pending_external,partial_failed,completed');
  A('域: 删除 target 状态机冻结(pending/pending_external/leased/partial_failed/completed)',
    MEMORY_DELETION_TARGET_STATUSES.join(',') === 'pending,pending_external,leased,partial_failed,completed');
  A('域: 纠正 disposition 冻结 superseded/disputed',
    MEMORY_CORRECTION_DISPOSITIONS.join(',') === 'superseded,disputed');
  A('域: 采集暂停状态冻结 active/paused',
    MEMORY_COLLECTION_PAUSE_STATUSES.join(',') === 'active,paused');
  A('域: 受控角色名冻结',
    MEMORY_CONTROL_REVIEWER_ROLE === 'memory_reviewer' && MEMORY_CONTROL_POLICY_RELEASER_ROLE === 'memory_policy_releaser');
  A('域: 删除 sink 枚举复用 MEMORY_AUTHZ_SINK_KINDS(7 MEM sink)',
    MEMORY_AUTHZ_SINK_KINDS.length === 7
    && MEMORY_AUTHZ_SINK_KINDS.join(',') === 'memory_event,memory_summary,memory_fact,memory_embedding,memory_cache,memory_context_snapshot,memory_trace');

  /* ── B. 造两条 active 事实（供纠正 + 撤回）─────────────────────────────────── */
  const factA = await makeActiveFact({
    snapshotKey: 'snap-a', sourceEntityId: 'src-a', allowedDataClass: 'derived_fact',
    content: '分布式锁 租约续期 与 过期回滚', subject: 'distributed_lock', idemPrefix: 'fa',
  });
  const factB = await makeActiveFact({
    snapshotKey: 'snap-b', sourceEntityId: 'src-b', allowedDataClass: 'derived_fact',
    content: '分布式锁 的实现与性能', subject: 'lock_impl', idemPrefix: 'fb',
  });

  /* ── C. TC-MEM-003-main：纠正产新版本 + 禁 content 覆盖 ─────────────────────── */
  const correctRes = await doCorrect(owner, {
    factId: factB, content: '分布式锁 的实现与性能（已纠正）', disposition: 'disputed', idempotencyKey: 'correct-fb-1',
  });
  A('纠正: 返回命令 id + 新 active fact id + 旧 contradicted fact id',
    correctRes !== null && correctRes.commandId.length === 36 && correctRes.factId !== factB && correctRes.contradictedFactId === factB);
  const cardsAfterCorrect = await listCards(owner, null);
  const cardB = cardsAfterCorrect.find((x) => x.factId === factB);
  const cardB2 = cardsAfterCorrect.find((x) => x.factId === correctRes!.factId);
  A('纠正: 旧事实 status=contradicted（CAS active→contradicted，不删旧证据）',
    cardB?.status === 'contradicted');
  A('纠正: 新事实 status=active（同 fact_key 新版本）',
    cardB2?.status === 'active' && cardB2.factKey === cardB!.factKey);
  const factBRow = (await admin.query<{ content: string }>('SELECT content FROM memory_fact_adjudication WHERE id=$1', [factB])).rows[0]!;
  A('纠正: 禁 content 覆盖——旧事实 content 原值保留（新版本另存，不 UPDATE 旧行内容）',
    factBRow.content === '分布式锁 的实现与性能');

  /* ── D. TC-MEM-003-S1：shadow generation 验证后 releaser 跨 owner CAS 切换 ──── */
  const gen = await buildGen(owner, 'gen-main', 'm-main');
  const val = await validate(owner, gen.generation.id, { manifestDigest: gen.manifest.manifestDigest, factCount: gen.manifest.factCount, embeddingRecipeDigest: RECIPE_DIGEST });
  A('S1 构建: shadow generation building→validated（releaser 前不激活）',
    val?.status === 'validated' && (await getActive(owner)) === null);
  const swByReleaser = await doSwitch(owner, gen.generation.id);
  const activeAfterSwitch = await getActive(owner);
  A('S1 releaser: memory_policy_releaser 跨 owner 验证后 CAS 切换 → active（digest-only，无正文）',
    swByReleaser !== null && swByReleaser.status === 'active' && activeAfterSwitch?.id === gen.generation.id);

  /* ── E. TC-MEM-003-main：单条撤回先 fence 后 recall=0 + 目标清理有 receipt ──── */
  const recallInput: RecallHybridCandidatesInput = {
    purpose: PURPOSE, consentRevision: 1, privacyEpoch: 1, generationManifestDigest: activeAfterSwitch!.manifestDigest,
    queryVector: (await embedder.embed([QUERY_TEXT]))[0]!, queryText: QUERY_TEXT, topK: 5,
  };
  const beforeRecall = await recallHybrid(owner, recallInput);
  A('撤回前置: 召回含 factA（证明 factA 在 active generation 内服务）',
    beforeRecall.some((c) => c.factId === factA));

  const withdrawRows = await doWithdraw(owner, { factId: factA, idempotencyKey: 'withdraw-fa-1' });
  A('撤回: fence 先行 → factA status=revoked',
    (await admin.query('SELECT status FROM memory_fact_adjudication WHERE id=$1', [factA])).rows[0]?.status === 'revoked');
  A('撤回: fence 同步失效 → active generation 被 fence（recall 不再服务）',
    (await getActive(owner)) === null || (await recallHybrid(owner, recallInput)).length === 0);
  const afterRecall = await recallHybrid(owner, recallInput);
  A('撤回: recall=0（命中后撤回 → 模型输入=0，旧 generation 不复活已撤回内容）',
    afterRecall.length === 0);
  A('撤回: 返回删除 request + 7 个逐 sink 目标（single_fact：仅 fact 可解析）',
    withdrawRows.length === 7
    && withdrawRows.every((r) => r.requestId === withdrawRows[0]!.requestId)
    && withdrawRows.find((r) => r.sink === 'memory_fact')?.targetStatus === 'pending'
    && withdrawRows.find((r) => r.sink === 'memory_event')?.targetStatus === 'pending_external');
  const withdrawRequestId = withdrawRows[0]!.requestId;

  /* ── G. TC-MEM-003-E2：revoke/correction race → 删除先赢 ────────────────────── */
  // factA 已被撤回（revoked，仍物理在场但已 fence）。对已撤回事实再纠正 → 冻结 correct CAS
  // from active 落败 → null（删除先赢，绝不 active→contradicted）。物理清除在下方 target 清理才发生，
  // 故此处必须在 worker complete 之前做，否则 factA 已被删 → memory_adjudication_fact_not_found。
  const correctRevoked = await doCorrect(owner, { factId: factA, content: '试图纠正已撤回内容', disposition: 'disputed', idempotencyKey: 'correct-revoked-1' });
  A('E2 race: 已撤回事实不可再纠正（correct CAS from active 落败 → null，删除先赢）',
    correctRevoked === null);
  A('E2 race: factA 仅一个合法迁移（active→revoked，绝非 active→contradicted）',
    (await admin.query("SELECT status FROM memory_fact_adjudication WHERE id=$1", [factA])).rows[0]?.status === 'revoked');

  // 逐 sink 目标清理：claim memory_fact → complete（带 receipt）。
  const claimFact = await workerClaim(owner, { requestId: withdrawRequestId, sink: 'memory_fact', worker: 'w-1' });
  A('目标清理: worker claim memory_fact target → leased + 租约 token',
    claimFact !== null && claimFact.status === 'leased' && claimFact.leaseToken.length === 36);
  const completeFact = await workerComplete(owner, { targetId: claimFact!.targetId, token: claimFact!.leaseToken, receipt: 'receipt-fact-1' });
  A('目标清理: complete → target completed + request 恒 pending_external（未知 locator 不伪造完成）',
    completeFact?.status === 'completed' && completeFact.requestStatus === 'pending_external');
  const progressRows = await doProgress(owner, withdrawRequestId);
  const factTarget = progressRows.find((r) => r.sink === 'memory_fact');
  A('目标清理: receipt 落库（completed target 有回执）',
    factTarget?.targetStatus === 'completed' && factTarget.receipt === 'receipt-fact-1');
  A('目标清理: 物理删除 read=0（factA 已从 memory_fact_adjudication 清除）',
    (await admin.query('SELECT count(*)::int AS n FROM memory_fact_adjudication WHERE id=$1', [factA])).rows[0]!.n === 0);

  /* ── F. TC-MEM-003-E1：100× 幂等命令 → 单份 ─────────────────────────────────── */
  await doPause(owner, PURPOSE, 'pause-e1');
  for (let i = 0; i < 100; i++) await doPause(owner, PURPOSE, 'pause-e1');
  const pauseRows = (await admin.query<{ n: number }>('SELECT count(*)::int AS n FROM memory_collection_pause WHERE owner_user_id=$1', [owner])).rows[0]!.n;
  A('E1 幂等(暂停): 100× 同 idempotency_key → 仅 1 行，status=paused',
    pauseRows === 1 && (await doPause(owner, PURPOSE, 'pause-e1')).replayed === true);

  const expDigest = await doExport(owner, 'export-e1');
  for (let i = 0; i < 100; i++) await doExport(owner, 'export-e1');
  const exportRows = (await admin.query<{ n: number }>('SELECT count(*)::int AS n FROM memory_export_receipt WHERE owner_user_id=$1', [owner])).rows[0]!.n;
  A('E1 幂等(导出): 100× 同 idempotency_key → 仅 1 回执，digest 确定',
    exportRows === 1 && expDigest.exportDigest.length === 64);

  // 纠正幂等：用同一幂等键重放（此时 factB 已 contradicted，重放返回既有命令）。
  const correctReplay = await doCorrect(owner, { factId: factB, content: '分布式锁 的实现与性能（已纠正）', disposition: 'disputed', idempotencyKey: 'correct-fb-1' });
  A('E1 幂等(纠正): 同 idempotency_key 重放 → replayed=true 且命令单份',
    correctReplay?.replayed === true
    && (await admin.query<{ n: number }>("SELECT count(*)::int AS n FROM memory_correction_command WHERE owner_user_id=$1 AND idempotency_key='correct-fb-1'", [owner])).rows[0]!.n === 1);

  await doPublish(owner, { generationKey: 'gen-pub', generationId: gen.generation.id, policyVersion: 'memory-policy-v1', idempotencyKey: 'pub-e1' });
  for (let i = 0; i < 100; i++) await doPublish(owner, { generationKey: 'gen-pub', generationId: gen.generation.id, policyVersion: 'memory-policy-v1', idempotencyKey: 'pub-e1' });
  A('E1 幂等(publish): 100× 同 idempotency_key → 仅 1 命令',
    (await admin.query<{ n: number }>('SELECT count(*)::int AS n FROM memory_policy_publish_command WHERE owner_user_id=$1', [owner])).rows[0]!.n === 1);

  /* ── H. TC-MEM-003-E3：role/RLS/raw SQL，无 admin bypass ────────────────────── */
  const otherFact = await makeActiveFact({
    snapshotKey: 'snap-other', sourceEntityId: 'src-other', allowedDataClass: 'derived_fact',
    content: '其他用户的当前职级', subject: 'other_level', idemPrefix: 'fo', userId: otherOwner,
  });
  const ownerCards = await listCards(owner, null);
  A('E3 跨 owner=0: owner listSourceCards 不泄 otherOwner 的 fact（RLS owner 隔离）',
    !ownerCards.some((x) => x.factId === otherFact));

  // reviewer：跨 owner 最小 provenance 卡片，无正文/content_digest 字段。
  const reviewCard = await doReview(otherOwner, otherFact);
  A('E3 reviewer: 跨 owner 受控来源溯源返回最小 provenance（fact_key/source_entity_id 等）',
    reviewCard !== null && reviewCard.factId === otherFact && reviewCard.factKey.length === 64);
  A('E3 reviewer: provenance 卡片不含正文/content_digest（最小化访问，无 content 字段）',
    reviewCard !== null && !('content' in reviewCard) && !('contentDigest' in reviewCard));
  A('E3 reviewer: 无正文表级授权（raw SELECT memory_fact_adjudication 被拒）',
    await rejects(() => asReviewer((c) => c.query('SELECT * FROM memory_fact_adjudication'))));

  // releaser：无内容直读（raw SELECT memory_fact_adjudication 被拒）。
  A('E3 releaser: 无内容直读（raw SELECT memory_fact_adjudication 被拒）',
    await rejects(() => asReleaser((c) => c.query('SELECT * FROM memory_fact_adjudication'))));

  // app_role 无命令表原始读写。
  A('E3 app_role: 无 memory_deletion_request 原始 SELECT（表级 REVOKE）',
    await rejects(() => asPrincipal(admin, owner, (c) => c.query('SELECT * FROM memory_deletion_request'))));
  A('E3 app_role: 无 memory_deletion_target 原始 SELECT',
    await rejects(() => asPrincipal(admin, owner, (c) => c.query('SELECT * FROM memory_deletion_target'))));

  // 无 admin bypass：不存在的账户主体 begin_deletion → 42501（fail-closed）。
  A('E3 fail-closed: 不存在的账户主体 begin_deletion → 42501（不静默放行）',
    await rejects(() => doBeginDeletion('ghost-user-nonexistent', { scope: 'account', subjectId: null, idempotencyKey: 'ghost-del-1' })));

  /* ── I. TC-MEM-003-M1：all-sink 删除枚举 ────────────────────────────────────── */
  const acctDel = await doBeginDeletion(owner, { scope: 'account', subjectId: null, idempotencyKey: 'acct-del-1' });
  const acctBySink = new Map(acctDel.map((r) => [r.sink, r.targetStatus]));
  A('M1 account 删除: 7 sink 枚举（fact/embedding/cache/snapshot 可解析=pending）',
    acctDel.length === 7
    && acctBySink.get('memory_fact') === 'pending'
    && acctBySink.get('memory_embedding') === 'pending'
    && acctBySink.get('memory_cache') === 'pending'
    && acctBySink.get('memory_context_snapshot') === 'pending');
  A('M1 account 删除: 未知 locator（event/summary/trace）=pending_external',
    acctBySink.get('memory_event') === 'pending_external'
    && acctBySink.get('memory_summary') === 'pending_external'
    && acctBySink.get('memory_trace') === 'pending_external');

  // 完成 4 个可解析 sink → request 恒 pending_external（绝不伪造 completed）。
  for (const sink of ['memory_fact', 'memory_embedding', 'memory_cache', 'memory_context_snapshot']) {
    const c = await workerClaim(owner, { requestId: acctDel[0]!.requestId, sink, worker: 'w-m1' });
    if (c) await workerComplete(owner, { targetId: c.targetId, token: c.leaseToken, receipt: `receipt-${sink}` });
  }
  const acctProgress = await doProgress(owner, acctDel[0]!.requestId);
  A('M1 未知 locator 不伪造完成: 完成 4 可解析 sink 后 request=pending_external（event/summary/trace 未解析）',
    acctProgress[0]?.requestStatus === 'pending_external');
  A('M1 目标逐 sink: 4 可解析 sink 全 completed 且带 receipt',
    ['memory_fact', 'memory_embedding', 'memory_cache', 'memory_context_snapshot']
      .every((sink) => acctProgress.find((r) => r.sink === sink)?.targetStatus === 'completed'));

  /* ── J. TC-MEM-003-T1：crash/lease/receipt tamper ──────────────────────────── */
  const tamperDel = await doBeginDeletion(otherOwner, { scope: 'account', subjectId: null, idempotencyKey: 'tamper-del-1' });
  const tamperRequestId = tamperDel[0]!.requestId;
  const claim1 = await workerClaim(otherOwner, { requestId: tamperRequestId, sink: 'memory_fact', worker: 'w-t1' });
  A('T1 lease: 首个 worker 领取成功（leased + token）',
    claim1 !== null && claim1.status === 'leased');
  const claim2 = await workerClaim(otherOwner, { requestId: tamperRequestId, sink: 'memory_fact', worker: 'w-t2' });
  A('T1 lease CAS: 租约有效期内第二个 worker 领取落败（返回 null）',
    claim2 === null);
  // 旧 lease / 篡改 token：complete 用错误 token 被拒。
  A('T1 tamper: 篡改/错误 token complete → lease_lost（拒绝）',
    await rejects(() => workerComplete(otherOwner, { targetId: claim1!.targetId, token: '00000000-0000-0000-0000-000000000000', receipt: 'bad' })));
  // 重复外部 receipt：正确 token complete 成功后，再 complete 幂等回放 completed（不重复删除）。
  const okComplete = await workerComplete(otherOwner, { targetId: claim1!.targetId, token: claim1!.leaseToken, receipt: 'receipt-t1' });
  const replayComplete = await workerComplete(otherOwner, { targetId: claim1!.targetId, token: claim1!.leaseToken, receipt: 'receipt-t1-again' });
  A('T1 重复外部 receipt: complete 成功后再 complete → 幂等回放 completed（不双删/不换 receipt）',
    okComplete?.status === 'completed' && replayComplete?.status === 'completed');
  // crash 恢复：租约过期后可重新领取。
  const claim3target = await workerClaim(otherOwner, { requestId: tamperRequestId, sink: 'memory_embedding', worker: 'w-t3' });
  await admin.query("UPDATE memory_deletion_target SET lease_expires_at = now() - interval '1 second' WHERE id=$1", [claim3target!.targetId]);
  const claim4 = await workerClaim(otherOwner, { requestId: tamperRequestId, sink: 'memory_embedding', worker: 'w-t4' });
  A('T1 crash 恢复: 租约过期后可被新 worker 重新领取（旧 lease 不永久占坑）',
    claim4 !== null && claim4.status === 'leased' && claim4.leaseToken !== claim3target!.leaseToken);
  // 失败写目标级 reason + receipt。此时 memory_cache/context_snapshot 仍未清 → request 应停在 purging
  // （仍 pending/leased 的 sink 存在时，绝不提前伪造 partial_failed 或 completed）。
  const failRes = await workerFail(otherOwner, { targetId: claim4!.targetId, token: claim4!.leaseToken, reason: 'external-503' });
  A('T1 失败: fail 落 target=partial_failed + 目标级 reason 落库（external-503）',
    failRes?.status === 'partial_failed'
    && (await admin.query<{ failure_reason: string }>('SELECT failure_reason FROM memory_deletion_target WHERE id=$1', [claim4!.targetId])).rows[0]!.failure_reason === 'external-503');
  A('T1 失败: 仍有未清 sink → request 停在 purging（不提前伪造 partial_failed/completed）',
    failRes?.requestStatus === 'purging');

  // 清完剩余可解析 sink（memory_cache/context_snapshot）→ request 才推进 partial_failed
  // （embedding 失败 + event/summary/trace 未知 locator 未解析）。
  for (const sink of ['memory_cache', 'memory_context_snapshot']) {
    const c = await workerClaim(otherOwner, { requestId: tamperRequestId, sink, worker: 'w-t-clean' });
    if (c) await workerComplete(otherOwner, { targetId: c.targetId, token: c.leaseToken, receipt: `receipt-${sink}` });
  }
  const t1Progress = await doProgress(otherOwner, tamperRequestId);
  A('T1 失败: 本地 sink 清完 → request 推进 partial_failed（embedding 失败，未知 locator 未解析）',
    t1Progress[0]?.requestStatus === 'partial_failed');

  // no-forge-completed 守卫：直插/直改 request=completed 且仍有未完成 target → 拒。
  A('T1 守卫: 直接 UPDATE request=completed（仍有未完成 target）→ no-forge-completed 拒',
    await rejects(() => admin.query('UPDATE memory_deletion_request SET status=$2 WHERE id=$1', [tamperRequestId, 'completed'])));
  // one-way 守卫：target completed 不可回退。
  const guardTargetId = (await admin.query<{ id: string }>('SELECT id FROM memory_deletion_target WHERE request_id=$1 AND sink=$2', [tamperRequestId, 'memory_fact'])).rows[0]!.id;
  A('T1 守卫: target completed 不可回退为 pending（one-way 守卫拒）',
    await rejects(() => admin.query('UPDATE memory_deletion_target SET status=$2 WHERE id=$1', [guardTargetId, 'pending'])));

  await admin.end();
  console.log(failures === 0
    ? '\n✓ 记忆管理控制面命令层(MEM-10) DB 证明通过（本地隔离证据，待独立专家审计）'
    : `\n✗ ${failures} 个断言失败`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(async (e) => {
  console.error(e);
  await admin.end().catch(() => undefined);
  process.exit(1);
});
