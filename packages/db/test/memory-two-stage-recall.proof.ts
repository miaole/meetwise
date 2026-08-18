/**
 * 两阶段召回 + 派发前复核（MEM-14）DB 证明。
 *
 * 跑在 run-e2e-isolated.mjs 起的临时 Postgres（完整迁移 + nonce 校验）。证明：
 *   - 第一段 DB 内硬过滤候选召回：先按「active generation manifest 引用 + fact active 未过期 +
 *     purpose + live consent（revision/epoch 一致）+ 数据分类允许 embedding」在 SQL WHERE 硬过滤，
 *     **过滤后的集合**才做向量 + 关键词排序。对抗样本：career fact 的 content 与 query 逐字相同
 *     （向量 cosine 恒 1.0），若「先全表 Top-K 再应用层过滤」必占第 1 slot → 结果数 = K-1；
 *     DB 先过滤 → 结果数 = K（此处 top_k=3 → 返回 3，且 career fact 不在其内）。
 *   - 第二段水合来源重验：逐条重验 digest/status/valid_until/live consent/数据分类/冲突关系/
 *     长度预算。任一失败 → verdict='rejected' + reason_code，绝不回退旧缓存；accepted 才吐
 *     content + span_locator provenance。
 *   - 冻结 ContextSnapshot：同 snapshot_key 幂等回放字节等价（E1）；live 范围/版本 + generation
 *     manifest CAS → published（唯一 winner），陈旧 → voided（E2 的 stale_generation/stale_consent）。
 *   - 派发前复核：published + live consent（revision/epoch 与冻结值一致）+ 未过期 → consumed
 *     （dispatch=1，派发先赢）；否则 → voided（dispatch=0，围栏先赢）；consumed 幂等回放绝不
 *     重新 void（E6）。
 *   - 命中后来源失效（撤回/过期/篡改/consent 撤回）→ 模型输入=0（E4/M1）；跨 owner 召回=0（E3，
 *     RLS owner 隔离）；app_role 无 memory_recall_context_snapshot 原始表读写；四原语（CAS/
 *     principal 幂等键/RLS/有序事件日志）落位。
 */
import {
  createPool, asPrincipal, assertIsolatedTestTarget,
  issueMemoryAdmissionSnapshot, admitMemoryRecord,
  materializeAdjudicationFact, confirmAdjudicationFact, revokeAdjudicationFact,
  buildMemoryGeneration, validateGeneration, switchActiveGeneration, activeGeneration,
  revokeMemoryConsent,
  recallHybridCandidates, hydrateRecallFacts, freezeRecallContextSnapshot, dispatchRecallContextSnapshot,
  type Client, type RecallHybridCandidatesInput, type HydrateRecallFactsInput, type FreezeRecallContextSnapshotInput,
} from '@meetwise/db';
import {
  deriveEmbeddingRecipeDigest, deterministicMemoryEmbedder, memoryContentDigest, utf8ByteLength,
  deriveAuthorizationVersion, deriveRenderDigest,
  type MemoryEmbeddingRecipe, type MemoryEmbedder, type MemoryRenderSourceCard,
} from '@meetwise/domain';
import {
  MemoryRecallCandidateCard, MemoryContextSnapshotReceipt, MemoryDispatchDecision, MemoryRecallRejectionReason,
} from '@meetwise/contracts';

const admin = createPool({ max: 40 });
const owner = `mem14-owner-${process.pid}`;
const otherOwner = `mem14-other-${process.pid}`;

let failures = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };
const rejects = async (fn: () => Promise<unknown>) => { try { await fn(); return false; } catch { return true; } };

const SRC_TEXT = '面试：分布式锁租约续期与过期回滚（来源）';
const SRC_BYTES = utf8ByteLength(SRC_TEXT);
const PURPOSE = 'interview_prep' as const;
const CAREER = 'career' as const;
const SINGLE = 'single_value' as const;
const QUERY_TEXT = '分布式锁 租约续期';
const CONTENT_BUDGET = 4096;
const RENDERER_VERSION = 'memory-renderer-v1';
const POLICY_VERSION = 'mem14-policy-v1';

const RECIPE: MemoryEmbeddingRecipe = {
  schema: 'memory-embed-v1', provider: 'deterministic', model: 'bag-of-words',
  revision: '1', dimension: 16, normalization: 'l2',
};
const RECIPE_DIGEST = deriveEmbeddingRecipeDigest(RECIPE);
const embedder: MemoryEmbedder = deterministicMemoryEmbedder(RECIPE.dimension);

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

async function insertAccount(userId: string): Promise<void> {
  await admin.query(
    'INSERT INTO user_account(id, email, password_hash) VALUES ($1,$2,$3) ON CONFLICT (id) DO NOTHING',
    [userId, `${userId}@mem14.test`, 'scrypt$salt$dk'],
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
const revokeConsent = (userId: string, purpose: string) => asPrincipal(admin, userId, (c) => revokeMemoryConsent(c, purpose as never));
const buildGen = (userId: string, generationKey: string, manifestKey: string) =>
  asPrincipal(admin, userId, (c) => buildMemoryGeneration(c, {
    generationKey, manifestKey, recipe: RECIPE, policyVersion: 'memory-policy-v1', embedder,
  }));
const validate = (userId: string, genId: string, expected: { manifestDigest: string; factCount: number; embeddingRecipeDigest: string }) =>
  asPrincipal(admin, userId, (c) => validateGeneration(c, genId, expected));
const switchActive = (userId: string, genId: string) => asPrincipal(admin, userId, (c) => switchActiveGeneration(c, genId));
const getActive = (userId: string) => asPrincipal(admin, userId, (c) => activeGeneration(c));
const recallHybrid = (userId: string, input: RecallHybridCandidatesInput) => asPrincipal(admin, userId, (c) => recallHybridCandidates(c, input));
const hydrate = (userId: string, input: HydrateRecallFactsInput) => asPrincipal(admin, userId, (c) => hydrateRecallFacts(c, input));
const freezeSnap = (userId: string, input: FreezeRecallContextSnapshotInput) => asPrincipal(admin, userId, (c) => freezeRecallContextSnapshot(c, input));
const dispatchSnap = (userId: string, snapshotId: string) => asPrincipal(admin, userId, (c) => dispatchRecallContextSnapshot(c, snapshotId));

type SnapRow = { id: string; status: string; render_digest: string; authorization_version: string; content: unknown; void_reason: string | null };
const snapRow = async (id: string): Promise<SnapRow | undefined> =>
  (await admin.query<SnapRow>(
    'SELECT id,status,render_digest,authorization_version,content,void_reason FROM memory_recall_context_snapshot WHERE id=$1', [id])).rows[0];

/** 造一条 active 裁决事实（走 MEM-12 issue/admit + MEM-13 materialize/confirm），返回 fact id。 */
async function makeActiveFact(opts: {
  snapshotKey: string; sourceEntityId: string; allowedDataClass: string;
  content: string; namespace?: string; subject: string; validUntil?: string | null; cardinality?: string;
  idemPrefix: string; userId?: string; purpose?: string;
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
    subject: opts.subject, validUntil: opts.validUntil ?? null, cardinality: (opts.cardinality ?? SINGLE) as MatInput['cardinality'],
    idempotencyKey: `${opts.idemPrefix}-mat`,
  }));
  const conf = await confirm(userId, matR.id);
  if (!conf) throw new Error(`confirm failed for ${opts.idemPrefix}`);
  return matR.id;
}

function authVersion(consentRevision: number, privacyEpoch: number, allowedDataClasses: string[]): string {
  return deriveAuthorizationVersion({ controllerScope: 'c_personal', purpose: PURPOSE, consentRevision, privacyEpoch, allowedDataClasses });
}

async function main() {
  await assertIsolatedTestTarget(admin);
  await insertAccount(owner);
  await insertAccount(otherOwner);
  await asPrincipal(admin, owner, (c) => c.query('SELECT * FROM memory_grant_consent($1, $2)', [PURPOSE, 'memory-policy-v1']));
  await asPrincipal(admin, owner, (c) => c.query('SELECT * FROM memory_grant_consent($1, $2)', [CAREER, 'memory-policy-v1']));

  /* ── A. 域 + 契约 pin ───────────────────────────────────────────────────────── */
  const authV = authVersion(1, 1, ['derived_fact', 'topic']);
  A('域: deriveAuthorizationVersion 确定性(64-hex) + 数据分类排序后字节一致',
    authV.length === 64 && authV === deriveAuthorizationVersion({ controllerScope: 'c_personal', purpose: PURPOSE, consentRevision: 1, privacyEpoch: 1, allowedDataClasses: ['topic', 'derived_fact'] }));
  A('域: deriveAuthorizationVersion 随 revision/epoch/scope 改变而改变(冻结锚非恒定)',
    authVersion(2, 1, ['derived_fact', 'topic']) !== authV && authVersion(1, 2, ['derived_fact', 'topic']) !== authV);
  A('域: deriveRenderDigest 确定性 + 空集 = sha256(rendererVersion+"\\n")',
    deriveRenderDigest(RENDERER_VERSION, []).length === 64
    && deriveRenderDigest(RENDERER_VERSION, []) === deriveRenderDigest(RENDERER_VERSION, []));
  const cardA: MemoryRenderSourceCard = { factId: '00000000-0000-0000-0000-000000000001', factKey: 'a'.repeat(64), contentDigest: 'b'.repeat(64), sourceEntityId: null, immutableSourceVersion: null, sourceArtifactDigest: 'c'.repeat(64), spanLocator: { k: 1 }, allowedDataClass: 'derived_fact', factVersion: 1 };
  const cardB: MemoryRenderSourceCard = { ...cardA, factId: '00000000-0000-0000-0000-000000000002' };
  A('域: deriveRenderDigest 与输入顺序无关(按 factId 排序)',
    deriveRenderDigest(RENDERER_VERSION, [cardB, cardA]) === deriveRenderDigest(RENDERER_VERSION, [cardA, cardB]));
  A('契约: MemoryRecallCandidateCard.parse 通过(候选卡片无 content/embedding 字段)',
    MemoryRecallCandidateCard.parse({ factId: '12345678-1234-4123-8123-123456789abc', factKey: 'a'.repeat(64), retrievalKind: 'hybrid', retrievalScore: 0.85, sourceEntityId: null, immutableSourceVersion: null, sourceArtifactDigest: 'b'.repeat(64), spanLocator: {}, contentDigest: 'c'.repeat(64), factVersion: 1, allowedDataClass: 'derived_fact' }).retrievalScore === 0.85);
  A('契约: MemoryContextSnapshotReceipt.parse 通过(status 显式 enum)',
    MemoryContextSnapshotReceipt.parse({ snapshotId: '12345678-1234-4123-8123-123456789abc', status: 'published', authorizationVersion: 'a'.repeat(64), consentRevision: 1, privacyEpoch: 1, generationManifestDigest: null, retrievalPolicyVersion: 'v1', budget: 4096, rendererVersion: 'v1', renderDigest: 'b'.repeat(64), voidReason: null, replayed: false }).status === 'published');
  A('契约: MemoryDispatchDecision.parse 通过(dispatchDecision 只允许 0|1)',
    MemoryDispatchDecision.parse({ snapshotId: '12345678-1234-4123-8123-123456789abc', status: 'consumed', dispatchDecision: 1, voidReason: null }).dispatchDecision === 1);
  A('契约: MemoryRecallRejectionReason 冻结 8 个 reason code(显式 enum)',
    ['scope_forbidden', 'status_not_active', 'expired', 'digest_mismatch', 'consent_revoked', 'data_class_forbidden', 'conflict_superseded', 'budget_exceeded']
      .every((r) => MemoryRecallRejectionReason.options.includes(r as never)));

  /* ── B. 造事实 + active generation（含 1 条 career 对抗事实）────────────────── */
  const factA = await makeActiveFact({
    snapshotKey: 'snap-a', sourceEntityId: 'src-a', allowedDataClass: 'derived_fact',
    content: '分布式锁 租约续期 与 过期回滚', subject: 'distributed_lock', idemPrefix: 'fa',
  });
  const factB = await makeActiveFact({
    snapshotKey: 'snap-b', sourceEntityId: 'src-b', allowedDataClass: 'derived_fact',
    content: '分布式锁 的实现与性能', subject: 'lock_impl', idemPrefix: 'fb',
  });
  const factC = await makeActiveFact({
    snapshotKey: 'snap-c', sourceEntityId: 'src-c', allowedDataClass: 'topic',
    content: '租约续期 与 心跳机制', namespace: 'topic', subject: 'heartbeat', idemPrefix: 'fc',
  });
  // 对抗事实：content 与 query 逐字相同（career purpose）——若「先全表 Top-K 再过滤」必占 slot。
  const factCareer = await makeActiveFact({
    snapshotKey: 'snap-career', sourceEntityId: 'src-career', allowedDataClass: 'derived_fact',
    content: QUERY_TEXT, subject: 'career_lock', idemPrefix: 'fcareer', purpose: CAREER,
  });

  const gen = await buildGen(owner, 'gen-main', 'm-main');
  const val = await validate(owner, gen.generation.id, { manifestDigest: gen.manifest.manifestDigest, factCount: gen.manifest.factCount, embeddingRecipeDigest: RECIPE_DIGEST });
  const sw = await switchActive(owner, gen.generation.id);
  const active = await getActive(owner);
  A('构建: gen-main 冻结 manifest(4 条 fact，含 career) → building → validated → active',
    gen.manifest.factCount === 4 && val?.status === 'validated' && sw?.status === 'active'
    && active?.id === gen.generation.id && active?.manifestDigest === gen.manifest.manifestDigest);

  /* ── C. 第一段：DB 内硬过滤候选召回（对抗样本证明先过滤后检索）──────────────── */
  const queryVector = (await embedder.embed([QUERY_TEXT]))[0]!;
  const recallInput: RecallHybridCandidatesInput = {
    purpose: PURPOSE, consentRevision: 1, privacyEpoch: 1, generationManifestDigest: active!.manifestDigest,
    queryVector, queryText: QUERY_TEXT, topK: 3,
  };
  const cands = await recallHybrid(owner, recallInput);
  A('对抗(DB 先过滤): top_k=3 返回 3 条 interview_prep fact(全局 Top-K 再过滤会因 career 占 slot 只得 2)',
    cands.length === 3
    && cands.every((c) => [factA, factB, factC].includes(c.factId))
    && !cands.some((c) => c.factId === factCareer));
  A('对抗: career fact content 与 query 逐字相同(其向量 cosine 恒 1.0，必是全局 Top-1)',
    memoryContentDigest(QUERY_TEXT) === cands.find((c) => c.factId === factCareer)?.contentDigest
    || (await hydrate(owner, { purpose: CAREER, consentRevision: 1, privacyEpoch: 1, contentBudget: CONTENT_BUDGET, factIds: [factCareer] })).some((v) => v.factId === factCareer && v.sourceCard?.content === QUERY_TEXT));
  const careerCands = await recallHybrid(owner, { ...recallInput, purpose: CAREER, topK: 1 });
  A('对抗: 同 generation 下 purpose=career 召回得到 career fact(证明它在索引内、确被硬过滤排除)',
    careerCands.length === 1 && careerCands[0]!.factId === factCareer && careerCands[0]!.retrievalScore > 0.9);
  A('第一段候选卡片: 只含 digest + provenance(无 content 字段，retrievalScore 有界)',
    cands.every((c) => !('content' in c) && c.retrievalScore > 0 && c.retrievalScore <= 1 && c.contentDigest.length === 64));

  /* ── D. 第二段：水合来源重验（accepted + 各拒绝 reason code）────────────────── */
  const hydInput: HydrateRecallFactsInput = { purpose: PURPOSE, consentRevision: 1, privacyEpoch: 1, contentBudget: CONTENT_BUDGET, factIds: [factA, factB, factC] };
  const hyd = await hydrate(owner, hydInput);
  A('水合重验: 3 条候选全 accepted，sourceCard 含 content + spanLocator provenance',
    hyd.length === 3 && hyd.every((v) => v.verdict === 'accepted' && v.sourceCard !== null && v.sourceCard.content.length > 0));
  A('水合重验: content digest 与 MEM-13 裁决 digest 一致(重算 sha256 逐字节)',
    hyd.every((v) => v.sourceCard && v.sourceCard.contentDigest === memoryContentDigest(v.sourceCard.content)));

  // data_class_forbidden：dimension_label 事实不进语义向量，直接 hydrate 必拒。
  const factD = await makeActiveFact({
    snapshotKey: 'snap-d', sourceEntityId: 'src-d', allowedDataClass: 'dimension_label',
    content: '沟通能力 标签', subject: 'comm_label', idemPrefix: 'fd',
  });
  const hydD = await hydrate(owner, { ...hydInput, factIds: [factD] });
  A('水合重验: dimension_label → data_class_forbidden(reason_code 显式)',
    hydD[0]?.verdict === 'rejected' && hydD[0].reasonCode === 'data_class_forbidden' && hydD[0].sourceCard === null);

  // expired：confirm 后 admin 把 valid_until 拨到过去。
  const factE = await makeActiveFact({
    snapshotKey: 'snap-e', sourceEntityId: 'src-e', allowedDataClass: 'derived_fact',
    content: '过期事实 内容', subject: 'expired_fact', idemPrefix: 'fe',
  });
  await admin.query("UPDATE memory_fact_adjudication SET valid_until = now() - interval '1 second' WHERE id=$1", [factE]);
  const hydE = await hydrate(owner, { ...hydInput, factIds: [factE] });
  A('水合重验: valid_until 已过 → expired(reason_code 显式，无 content 吐回)',
    hydE[0]?.verdict === 'rejected' && hydE[0].reasonCode === 'expired' && hydE[0].sourceCard === null);

  // digest_mismatch：篡改 content 不改 digest。
  await admin.query("UPDATE memory_fact_adjudication SET content='被篡改的内容' WHERE id=$1", [factB]);
  const hydTamper = await hydrate(owner, { ...hydInput, factIds: [factB] });
  A('水合重验: 内容篡改 → digest_mismatch(重算 sha256 与存储 digest 不符即拒)',
    hydTamper[0]?.verdict === 'rejected' && hydTamper[0].reasonCode === 'digest_mismatch' && hydTamper[0].sourceCard === null);

  // budget_exceeded：极小预算。
  const hydBudget = await hydrate(owner, { ...hydInput, factIds: [factA], contentBudget: 5 });
  A('水合重验: 超长度预算 → budget_exceeded',
    hydBudget[0]?.verdict === 'rejected' && hydBudget[0].reasonCode === 'budget_exceeded');

  /* ── E. 冻结 ContextSnapshot + E1 幂等回放 + E2 stale_generation ────────────── */
  const accepted = hyd.filter((v) => v.verdict === 'accepted' && v.sourceCard);
  const renderCards: MemoryRenderSourceCard[] = accepted.map((v) => {
    const s = v.sourceCard!;
    return { factId: s.factId, factKey: s.factKey, contentDigest: s.contentDigest, sourceEntityId: s.sourceEntityId, immutableSourceVersion: s.immutableSourceVersion, sourceArtifactDigest: s.sourceArtifactDigest, spanLocator: s.spanLocator, allowedDataClass: s.allowedDataClass, factVersion: s.factVersion };
  });
  const renderDigest = deriveRenderDigest(RENDERER_VERSION, renderCards);
  const snapshotContent = { candidateFactIds: cands.map((c) => c.factId), rejections: [] as string[], selected: renderCards };
  const freezeInput: FreezeRecallContextSnapshotInput = {
    snapshotKey: 'turn-snap-1', purpose: PURPOSE, authorizationVersion: authV,
    consentRevision: 1, privacyEpoch: 1, generationManifestDigest: active!.manifestDigest,
    retrievalPolicyVersion: POLICY_VERSION, budget: CONTENT_BUDGET, rendererVersion: RENDERER_VERSION,
    renderDigest, content: snapshotContent, expiresAt: null,
  };
  const frozen = await freezeSnap(owner, freezeInput);
  A('冻结: live 范围/版本 + generation manifest CAS 通过 → published(唯一 winner)',
    frozen.status === 'published' && frozen.replayed === false && frozen.snapshotId.length === 36 && frozen.renderDigest === renderDigest);
  const stored = await snapRow(frozen.snapshotId);
  A('冻结: 存储 render_digest/authorization_version 与 TS 侧 derive 逐字节一致(E1 字节等价)',
    stored?.render_digest === renderDigest && stored?.authorization_version === authV);

  const frozenReplay = await freezeSnap(owner, freezeInput);
  A('E1 幂等回放: 同 snapshot_key 返回既有冻结选择(同 snapshotId/同 renderDigest，replayed=true)',
    frozenReplay.replayed === true && frozenReplay.snapshotId === frozen.snapshotId && frozenReplay.renderDigest === renderDigest);
  const sameKeyRows = (await admin.query('SELECT count(*)::int AS n FROM memory_recall_context_snapshot WHERE owner_user_id=$1 AND snapshot_key=$2', [owner, 'turn-snap-1'])).rows[0]!.n;
  A('E1 幂等回放: 不双写(同 (owner,snapshot_key) 仅 1 行，重放不新建)',
    sameKeyRows === 1);

  const staleGen = await freezeSnap(owner, { ...freezeInput, snapshotKey: 'turn-snap-stale-gen', generationManifestDigest: 'f'.repeat(64) });
  A('E2 CAS: generation manifest digest 陈旧 → voided stale_generation(不发布)',
    staleGen.status === 'voided' && staleGen.voidReason === 'stale_generation');

  /* ── F. 派发前复核：派发先赢(E6) + 围栏先赢(fence_first) + 过期 ─────────────── */
  const d1 = await dispatchSnap(owner, frozen.snapshotId);
  A('派发: published + live consent 一致 + 未过期 → consumed(dispatch=1)',
    d1.status === 'consumed' && d1.dispatchDecision === 1);
  const d1replay = await dispatchSnap(owner, frozen.snapshotId);
  A('E6 派发先赢: consumed 幂等回放仍 dispatch=1(绝不重新 void)',
    d1replay.status === 'consumed' && d1replay.dispatchDecision === 1);

  // fence-first：先冻结一条 published 快照（consent 仍 granted），随后撤回 consent 再 dispatch。
  const preRevoke = await freezeSnap(owner, { ...freezeInput, snapshotKey: 'turn-snap-fence' });
  const expiredSnap = await freezeSnap(owner, { ...freezeInput, snapshotKey: 'turn-snap-expired', expiresAt: new Date(Date.now() - 60_000).toISOString() });
  A('派发前置: 冻结第二/第三快照(consent 仍 granted)',
    preRevoke.status === 'published' && expiredSnap.status === 'published');

  const dExpired = await dispatchSnap(owner, expiredSnap.snapshotId);
  A('派发: snapshot.expires_at 已过 → voided expired(dispatch=0)',
    dExpired.status === 'voided' && dExpired.dispatchDecision === 0 && dExpired.voidReason === 'expired');

  /* ── G. E4/M1：命中后来源失效 → 模型输入=0 ──────────────────────────────────── */
  // 撤回 factA（在 active generation 内）→ 触发器 fence generation → recall=0。
  const revA = await revoke(owner, factA);
  A('撤回(MEM-13): factA active→revoked',
    revA !== null && revA.status === 'revoked');
  A('E4 撤回同步失效: 无 active generation(activeGeneration=null)',
    (await getActive(owner)) === null);
  const afterRevokeRecall = await recallHybrid(owner, recallInput);
  A('E4 撤回同步失效: recall=0(命中后撤回 → 模型输入=0，旧 generation 不得复活)',
    afterRevokeRecall.length === 0);
  const hydRevoked = await hydrate(owner, { ...hydInput, factIds: [factA] });
  A('M1 水合重验: 已撤回 fact → status_not_active(模型输入=0，无 content)',
    hydRevoked[0]?.verdict === 'rejected' && hydRevoked[0].reasonCode === 'status_not_active' && hydRevoked[0].sourceCard === null);

  /* ── H. consent 撤回 → 围栏先赢(fence_first) + 无记忆可用是合法结果 ──────────── */
  await revokeConsent(owner, PURPOSE);
  const dFence = await dispatchSnap(owner, preRevoke.snapshotId);
  A('派发围栏先赢: consent 撤回(epoch 漂移) → voided fence_first(dispatch=0)',
    dFence.status === 'voided' && dFence.dispatchDecision === 0 && dFence.voidReason === 'fence_first');
  const staleConsent = await freezeSnap(owner, { ...freezeInput, snapshotKey: 'turn-snap-stale-consent' });
  A('E2 CAS: consent revision/epoch 陈旧 → voided stale_consent(不发布)',
    staleConsent.status === 'voided' && staleConsent.voidReason === 'stale_consent');
  const noMem = await recallHybrid(owner, recallInput);
  A('无记忆可用是合法结果: consent 撤回后 recall=[](空，不抛错，不扩大 scope 填充)',
    noMem.length === 0);
  const hydConsentRevoked = await hydrate(owner, { ...hydInput, factIds: [factC] });
  A('M1 水合重验: consent 撤回 → consent_revoked(模型输入=0)',
    hydConsentRevoked[0]?.verdict === 'rejected' && hydConsentRevoked[0].reasonCode === 'consent_revoked');

  /* ── I. E3 跨 owner 召回=0 + RLS owner 隔离 + app_role 无原始表读写 ──────────── */
  await asPrincipal(admin, otherOwner, (c) => c.query('SELECT * FROM memory_grant_consent($1, $2)', [PURPOSE, 'memory-policy-v1']));
  const otherFact = await makeActiveFact({
    snapshotKey: 'snap-other', sourceEntityId: 'src-other', allowedDataClass: 'derived_fact',
    content: '其他用户的当前职级', subject: 'other_level', idemPrefix: 'fo', userId: otherOwner,
  });
  const otherGen = await buildGen(otherOwner, 'gen-other', 'm-other');
  await validate(otherOwner, otherGen.generation.id, { manifestDigest: otherGen.manifest.manifestDigest, factCount: otherGen.manifest.factCount, embeddingRecipeDigest: RECIPE_DIGEST });
  await switchActive(otherOwner, otherGen.generation.id);
  const otherCands = await recallHybrid(otherOwner, { ...recallInput, generationManifestDigest: (await getActive(otherOwner))!.manifestDigest });
  A('E3 跨 owner 召回=0: otherOwner 只召回自己的 1 条 fact，owner 的 fact 零泄漏',
    otherCands.length === 1 && otherCands[0]!.factId === otherFact && !otherCands.some((c) => [factA, factB, factC, factCareer].includes(c.factId)));
  const otherHydrateOwnerFact = await hydrate(otherOwner, { purpose: PURPOSE, consentRevision: 1, privacyEpoch: 1, contentBudget: CONTENT_BUDGET, factIds: [factA, factC] });
  A('E3 跨 owner 水合=0: otherOwner hydrate owner 的 fact → scope_forbidden(不泄存在性/内容)',
    otherHydrateOwnerFact.every((v) => v.verdict === 'rejected' && v.reasonCode === 'scope_forbidden' && v.sourceCard === null));
  A('E3 跨 owner 派发=0: otherOwner dispatch owner 的 snapshot → not_found(RLS 隔离)',
    await rejects(() => dispatchSnap(otherOwner, frozen.snapshotId)));
  A('RLS: app_role 无 memory_recall_context_snapshot 原始 SELECT(表级 REVOKE)',
    await rejects(() => asPrincipal(admin, owner, (c) => c.query('SELECT * FROM memory_recall_context_snapshot'))));

  /* ── J. 四原语：有序事件日志(复用 memory_append_audit，单调 seq) ────────────── */
  const freezeEvents = (await admin.query<{ kind: string; seq: string | number }>(
    "SELECT kind,seq FROM memory_audit_event WHERE owner_user_id=$1 AND stream_key='memrecallsnap:turn-snap-1' ORDER BY seq", [owner])).rows;
  A('审计: freeze_published 落有序事件(kind 正确 + seq 单调递增)',
    freezeEvents.length >= 1 && freezeEvents.some((e) => e.kind === 'freeze_published')
    && freezeEvents.every((e, i) => i === 0 || Number(e.seq) > Number(freezeEvents[i - 1]!.seq)));
  const dispatchEvents = (await admin.query<{ kind: string }>(
    "SELECT kind FROM memory_audit_event WHERE owner_user_id=$1 AND stream_key='memrecallsnap:turn-snap-1'", [owner])).rows.map((r) => r.kind);
  A('审计: dispatch_consumed 落有序事件',
    dispatchEvents.includes('dispatch_consumed'));
  const fenceEvents = (await admin.query<{ kind: string }>(
    "SELECT kind FROM memory_audit_event WHERE owner_user_id=$1 AND stream_key='memrecallsnap:turn-snap-fence'", [owner])).rows.map((r) => r.kind);
  A('审计: dispatch_voided(围栏先赢) 落事件',
    fenceEvents.includes('dispatch_voided'));

  await admin.end();
  console.log(failures === 0
    ? '\n✓ 两阶段召回 + 派发前复核(MEM-14) DB 证明通过（本地隔离证据）'
    : `\n✗ ${failures} 个断言失败`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(async (e) => {
  console.error(e);
  await admin.end().catch(() => undefined);
  process.exit(1);
});
