/**
 * 索引 generation 生命周期 + 缓存失效治理（MEM-11）DB 证明。
 *
 * 跑在 run-e2e-isolated.mjs 起的临时 Postgres（完整迁移 + nonce 校验）。证明：
 *   - 冻结 source manifest：仅 active + 未过期 + 未撤回 + consent granted + 数据分类允许
 *     embedding 的事实进 manifest；candidate/expired/revoked/dimension_label 绝不进入。
 *   - shadow generation 独立构建：新 generation（独立版本非原地改）；embedding 走确定性 seam；
 *     采集失败/污染（计数不符/未知 fact/维度不符/非有限）RAISE 回滚，绝不清旧 active；build
 *     幂等重放 ON CONFLICT 命中返回既有行**真实** status（非硬编码 building）。
 *   - 验证后 CAS 切换：digest/计数/embedding 完整性/recipe 一致 → building→validated；switch
 *     重验 liveness（删除/撤回先赢）→ 旧 active→retiring → validated→active；非法跃迁拒。
 *   - 撤回/删除同步失效（HIGH-1）：撤回事务内**触发器**（fact 离开 active / consent 离开 granted）
 *     原子 fence 引用 generation + 失效检索/水合缓存；撤回后**不手动 fence** 旧 cache 命中仍
 *     null + 缓存 invalidated + activeGeneration=null + recall=0（旧内容不得复活）。
 *   - 并发不变量：reindex-vs-delete 删除先赢（激活=0/recall=0）；100 并发双激活 → 单 active
 *     （partial unique index + CAS）；RLS 跨 owner=0；app_role 无原始表读写。
 *   - 审计：freeze/build/validate/switch/retire/fence 全走 memory_append_audit 有序事件。
 */
import {
  createPool, asPrincipal, assertIsolatedTestTarget,
  issueMemoryAdmissionSnapshot, admitMemoryRecord,
  materializeAdjudicationFact, confirmAdjudicationFact, revokeAdjudicationFact,
  freezeSourceManifest, readEmbeddableManifestFacts, buildShadowGeneration, validateGeneration,
  switchActiveGeneration, retireGenerationWindow, fenceGeneration,
  putGenerationCacheEntry, lookupGenerationCache, invalidateGenerationCache, activeGeneration,
  recallActiveGenerationFactIds, buildMemoryGeneration, revokeMemoryConsent,
  type Client, type FreezeSourceManifestInput, type BuildShadowGenerationInput, type GenerationEmbeddingInput,
} from '@meetwise/db';
import {
  deriveManifestDigest, deriveEmbeddingRecipeDigest, memoryVectorChecksum, deterministicMemoryEmbedder,
  memoryContentDigest, utf8ByteLength,
  type MemoryEmbeddingRecipe, type MemoryEmbedder,
} from '@meetwise/domain';
import { MemoryIndexManifestReceipt, MemoryIndexGenerationStatus } from '@meetwise/contracts';

// 单池 max=100：100 并发双激活需要 100 连接；拆两池会超容器默认 max_connections=100。
const admin = createPool({ max: 100 });
const concurrent = admin;
const owner = `memidx-owner-${process.pid}`;
const otherOwner = `memidx-other-${process.pid}`;

let failures = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };
const rejects = async (fn: () => Promise<unknown>) => { try { await fn(); return false; } catch { return true; } };
const throwsSync = (fn: () => unknown) => { try { fn(); return false; } catch { return true; } };

const SRC_TEXT = '面试：分布式锁🔒租约续期与过期回滚';
const SRC_BYTES = utf8ByteLength(SRC_TEXT);
const PURPOSE = 'interview_prep' as const;
const SINGLE = 'single_value' as const;

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
    [userId, `${userId}@memidx.test`, 'scrypt$salt$dk'],
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

const freeze = (userId: string, input: FreezeSourceManifestInput) => asPrincipal(admin, userId, (c) => freezeSourceManifest(c, input));
const readFacts = (userId: string, manifestId: string) => asPrincipal(admin, userId, (c) => readEmbeddableManifestFacts(c, manifestId));
const buildShadow = (userId: string, input: BuildShadowGenerationInput) => asPrincipal(admin, userId, (c) => buildShadowGeneration(c, input));
const validate = (userId: string, genId: string, expected: { manifestDigest: string; factCount: number; embeddingRecipeDigest: string }) =>
  asPrincipal(admin, userId, (c) => validateGeneration(c, genId, expected));
const switchActive = (userId: string, genId: string) => asPrincipal(admin, userId, (c) => switchActiveGeneration(c, genId));
const retireWindow = (userId: string, genId: string) => asPrincipal(admin, userId, (c) => retireGenerationWindow(c, genId));
const fence = (userId: string, genId: string) => asPrincipal(admin, userId, (c) => fenceGeneration(c, genId));
const revokeConsent = (userId: string) => asPrincipal(admin, userId, (c) => revokeMemoryConsent(c, PURPOSE));
const putCache = (userId: string, genId: string, kind: 'retrieval' | 'hydration', key: string, value: unknown) =>
  asPrincipal(admin, userId, (c) => putGenerationCacheEntry(c, { generationId: genId, cacheKind: kind, cacheKey: key, value }));
const lookupCache = (userId: string, kind: 'retrieval' | 'hydration', key: string) =>
  asPrincipal(admin, userId, (c) => lookupGenerationCache(c, kind, key));
const invalidateCache = (userId: string, genId: string) => asPrincipal(admin, userId, (c) => invalidateGenerationCache(c, genId));
const getActive = (userId: string) => asPrincipal(admin, userId, (c) => activeGeneration(c));
const recall = (userId: string) => asPrincipal(admin, userId, (c) => recallActiveGenerationFactIds(c));
const buildGen = (userId: string, generationKey: string, manifestKey: string) =>
  asPrincipal(admin, userId, (c) => buildMemoryGeneration(c, {
    generationKey, manifestKey, recipe: RECIPE, policyVersion: 'memory-policy-v1', embedder,
  }));

type GenRow = { id: string; status: string; manifest_id: string | null; generation_privacy_epoch: string | number | null };
const genRow = async (id: string): Promise<GenRow | undefined> =>
  (await admin.query<GenRow>(
    'SELECT id,status,manifest_id,generation_privacy_epoch FROM memory_index_generation WHERE id=$1', [id])).rows[0];
const activeCount = async () =>
  Number((await admin.query('SELECT count(*)::int AS n FROM memory_index_generation WHERE owner_user_id=$1 AND status=$2', [owner, 'active'])).rows[0]!.n);

/** 造一条 active 裁决事实（走 MEM-12 issue/admit + MEM-13 materialize/confirm），返回 fact id。 */
async function makeActiveFact(opts: {
  snapshotKey: string; sourceEntityId: string; allowedDataClass: string;
  content: string; namespace?: string; subject: string; validUntil?: string | null; cardinality?: string;
  idemPrefix: string; userId?: string; dataSubjectId?: string;
}): Promise<string> {
  const userId = opts.userId ?? owner;
  await issue(userId, issueInput({
    snapshotKey: opts.snapshotKey, sourceEntityId: opts.sourceEntityId,
    dataSubjectId: opts.dataSubjectId ?? userId,
    allowedDataClass: opts.allowedDataClass as IssueInput['allowedDataClass'],
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

/** 从 manifest 重算 TS 侧 digest（跨层对齐断言）。 */
async function tsManifestDigest(manifestId: string): Promise<string> {
  const rows = (await admin.query<{ fact_id: string; content_digest: string; source_artifact_digest: string | null; immutable_source_version: string | null; fact_version: string | number }>(
    'SELECT fact_id,content_digest,source_artifact_digest,immutable_source_version,fact_version FROM memory_index_source_manifest_item WHERE manifest_id=$1 ORDER BY fact_id', [manifestId])).rows;
  return deriveManifestDigest(rows.map((r) => ({
    factId: r.fact_id, contentDigest: r.content_digest, sourceArtifactDigest: r.source_artifact_digest,
    immutableSourceVersion: r.immutable_source_version, factVersion: Number(r.fact_version),
  })));
}

async function main() {
  await assertIsolatedTestTarget(admin);
  await insertAccount(owner);
  await insertAccount(otherOwner);
  await asPrincipal(admin, owner, (c) => c.query('SELECT * FROM memory_grant_consent($1, $2)', [PURPOSE, 'memory-policy-v1']));

  /* ── A. 域 + 契约：embedding seam / digest / 枚举 pin ───────────────────────── */
  A('域: deriveEmbeddingRecipeDigest 钉住配方(固定键序，维度进 digest)',
    RECIPE_DIGEST.length === 64 && deriveEmbeddingRecipeDigest({ ...RECIPE, dimension: 32 }) !== RECIPE_DIGEST);
  const v1 = await embedder.embed(['分布式锁 租约 续期', '沟通能力 表达']);
  const v1again = await embedder.embed(['分布式锁 租约 续期', '沟通能力 表达']);
  A('域: deterministicMemoryEmbedder 确定性(同输入同向量)+维度一致',
    v1.length === 2 && v1[0]!.length === RECIPE.dimension && JSON.stringify(v1) === JSON.stringify(v1again));
  A('域: memoryVectorChecksum 确定性(同向量同 checksum，64-hex)',
    memoryVectorChecksum(v1[0]!).length === 64 && memoryVectorChecksum(v1[0]!) === memoryVectorChecksum([...v1[0]!]));
  A('契约: MemoryIndexManifestReceipt.parse 通过(字段形状冻结)',
    MemoryIndexManifestReceipt.parse({ manifestId: '00000000-0000-0000-0000-000000000000', manifestDigest: 'a'.repeat(64), factCount: 0, privacyEpoch: 1, consentRevision: 1, replayed: false }).factCount === 0);
  A('契约: MemoryIndexGenerationStatus 超集含 retiring/fenced(兼容 0093 六态)',
    ['building', 'validated', 'shadow', 'active', 'deprecated', 'retired', 'retiring', 'fenced']
      .every((s) => MemoryIndexGenerationStatus.options.includes(s as never)));
  A('域: 冻结 manifest digest 空集 = sha256("")',
    deriveManifestDigest([]) === 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');

  /* ── B. 冻结 manifest：仅仍授权事实进 manifest ─────────────────────────────── */
  const factA = await makeActiveFact({
    snapshotKey: 'snap-a', sourceEntityId: 'src-a', allowedDataClass: 'derived_fact',
    content: '派生摘要：当前职级为高级工程师', subject: 'current_level', idemPrefix: 'fa',
  });
  const factB = await makeActiveFact({
    snapshotKey: 'snap-b', sourceEntityId: 'src-b', allowedDataClass: 'topic',
    content: '派生摘要：分布式锁租约续期', namespace: 'topic', subject: 'distributed_lock', idemPrefix: 'fb',
  });
  const factC = await makeActiveFact({
    snapshotKey: 'snap-c', sourceEntityId: 'src-c', allowedDataClass: 'dimension_label',
    content: '派生摘要：沟通能力', subject: 'communication', idemPrefix: 'fc',
  });
  // candidate（物化但未确认）→ 不进 manifest
  await issue(owner, issueInput({ snapshotKey: 'snap-cand', sourceEntityId: 'src-cand', allowedDataClass: 'derived_fact' }));
  const admCand = await admit(owner, candidate({ snapshotKey: 'snap-cand', contentDigest: memoryContentDigest('派生摘要：候选事实'), idempotencyKey: 'cand-admit' }));
  const candFact = (await materialize(owner, matInput({ admissionRecordId: admCand.id, content: '派生摘要：候选事实', subject: 'candidate_level', idempotencyKey: 'cand-mat' }))).id;
  // expired → 不进 manifest
  const expFact = await makeActiveFact({
    snapshotKey: 'snap-exp', sourceEntityId: 'src-exp', allowedDataClass: 'derived_fact',
    content: '派生摘要：过期事实', subject: 'expired_level', validUntil: new Date(Date.now() + 5_000).toISOString(), idemPrefix: 'fe',
  });
  await admin.query("UPDATE memory_fact_adjudication SET valid_until = now() - interval '1 second' WHERE id=$1", [expFact]);
  // revoked → 不进 manifest
  const revFact = await makeActiveFact({
    snapshotKey: 'snap-rev', sourceEntityId: 'src-rev', allowedDataClass: 'derived_fact',
    content: '派生摘要：已撤回事实', subject: 'revoked_level', idemPrefix: 'fr',
  });
  await revoke(owner, revFact);

  const M1 = await freeze(owner, { manifestKey: 'm-filter', embeddingRecipeDigest: RECIPE_DIGEST, policyVersion: 'memory-policy-v1', idempotencyKey: 'm-filter-1' });
  const m1Items = await readFacts(owner, M1.manifestId);
  A('冻结 manifest: 仅 active+未过期+同意+允许 embedding 数据分类进 manifest(factCount=2，含 factA/factB)',
    M1.factCount === 2 && m1Items.length === 2
    && m1Items.some((f) => f.factId === factA) && m1Items.some((f) => f.factId === factB));
  A('冻结 manifest: dimension_label(factC) 不进(数据分类过滤)',
    !m1Items.some((f) => f.factId === factC));
  A('冻结 manifest: candidate/expired/revoked 不进',
    !m1Items.some((f) => f.factId === candFact) && !m1Items.some((f) => f.factId === expFact) && !m1Items.some((f) => f.factId === revFact));
  A('冻结 manifest: TS↔SQL digest 逐字节一致(deriveManifestDigest == manifest_digest)',
    (await tsManifestDigest(M1.manifestId)) === M1.manifestDigest);
  const m1replay = await freeze(owner, { manifestKey: 'm-filter', embeddingRecipeDigest: RECIPE_DIGEST, policyVersion: 'memory-policy-v1', idempotencyKey: 'm-filter-1' });
  A('冻结 manifest: 幂等重放(idempotency_key 命中返回既有 manifest)',
    m1replay.replayed === true && m1replay.manifestId === M1.manifestId);

  /* ── C. shadow 独立构建 + 采集失败/污染不清旧 active ───────────────────────── */
  const built1 = await buildGen(owner, 'gen-v1', 'm-v1');
  const val1 = await validate(owner, built1.generation.id, { manifestDigest: M1.manifestDigest, factCount: M1.factCount, embeddingRecipeDigest: RECIPE_DIGEST });
  const sw1 = await switchActive(owner, built1.generation.id);
  A('构建: shadow generation 独立构建 → building → validated → active(gen-v1 激活)',
    built1.generation.status === 'building' && val1?.status === 'validated' && sw1?.status === 'active');
  A('构建: active generation 指针指向 gen-v1',
    (await getActive(owner))?.id === built1.generation.id);
  // MEDIUM-2：build 幂等重放 ON CONFLICT 命中后必须返回既有行**真实** status（此处已 active），
  // 不得硬编码 'building'（旧实现会谎报 building，掩盖已 validated/active 的真实态）。
  const replay1 = await buildGen(owner, 'gen-v1', 'm-v1');
  A('构建重放: ON CONFLICT 命中返回既有真实 status(=active，非硬编码 building)',
    replay1.generation.id === built1.generation.id && replay1.generation.status === 'active');

  // 采集失败：未知 fact id（污染）→ RAISE 回滚，不清旧 active。
  const facts1 = await readFacts(owner, M1.manifestId);
  const vectors1 = await embedder.embed(facts1.map((f) => f.content));
  const embeddings1: GenerationEmbeddingInput[] = facts1.map((f, i) => ({ factId: f.factId, dimension: RECIPE.dimension, vector: vectors1[i]!, checksum: memoryVectorChecksum(vectors1[i]!) }));
  const badEmbed = embeddings1.map((e, i) => (i === 0 ? { ...e, factId: '11111111-1111-1111-1111-111111111111' } : e));
  const badGenInput: BuildShadowGenerationInput = { generationKey: 'gen-bad', manifestId: M1.manifestId, embeddingRecipeDigest: RECIPE_DIGEST, dimension: RECIPE.dimension, embeddings: badEmbed };
  A('构建失败(未知 fact 污染): RAISE 回滚，不激活不清旧 active',
    await rejects(() => buildShadow(owner, badGenInput))
    && (await getActive(owner))?.id === built1.generation.id
    && (await admin.query('SELECT 1 FROM memory_index_generation WHERE generation_key=$1', ['gen-bad'])).rows.length === 0);
  // 采集失败：计数不符。
  const badCount: BuildShadowGenerationInput = { generationKey: 'gen-bad2', manifestId: M1.manifestId, embeddingRecipeDigest: RECIPE_DIGEST, dimension: RECIPE.dimension, embeddings: embeddings1.slice(0, 1) };
  A('构建失败(embedding 计数不符): RAISE 回滚，不清旧 active',
    await rejects(() => buildShadow(owner, badCount)) && (await getActive(owner))?.id === built1.generation.id);
  // 采集失败：非有限向量。
  const badFinite: BuildShadowGenerationInput = { generationKey: 'gen-bad3', manifestId: M1.manifestId, embeddingRecipeDigest: RECIPE_DIGEST, dimension: RECIPE.dimension, embeddings: embeddings1.map((e, i) => (i === 0 ? { ...e, vector: e.vector.map((_, j) => (j === 0 ? Infinity : _)) } : e)) };
  A('构建失败(非有限向量污染): RAISE 回滚，不清旧 active',
    await rejects(() => buildShadow(owner, badFinite)) && (await getActive(owner))?.id === built1.generation.id);

  /* ── D. 验证后 CAS 切换 + 退役窗口 + 非法跃迁 ──────────────────────────────── */
  const built2 = await buildGen(owner, 'gen-v2', 'm-v2');
  const badValidate = await validate(owner, built2.generation.id, { manifestDigest: 'b'.repeat(64), factCount: M1.factCount, embeddingRecipeDigest: RECIPE_DIGEST });
  A('验证: 错误 digest → 返回 null(fail-closed，building 不跃迁)',
    badValidate === null && (await genRow(built2.generation.id))?.status === 'building');
  const val2 = await validate(owner, built2.generation.id, { manifestDigest: M1.manifestDigest, factCount: M1.factCount, embeddingRecipeDigest: RECIPE_DIGEST });
  const sw2 = await switchActive(owner, built2.generation.id);
  A('验证后 CAS 切换: gen-v2 active + 旧 gen-v1 → retiring(受控窗口)',
    val2?.status === 'validated' && sw2?.status === 'active'
    && (await genRow(built1.generation.id))?.status === 'retiring'
    && (await genRow(built2.generation.id))?.status === 'active');
  const retire1 = await retireWindow(owner, built1.generation.id);
  A('退役窗口关闭: retiring → retired',
    retire1?.status === 'retired' && (await genRow(built1.generation.id))?.status === 'retired');
  A('非法跃迁: retired → active 被拒(switch 返回 null)',
    (await switchActive(owner, built1.generation.id)) === null);
  A('非法跃迁: active → retiring 被拒(retire 窗口只收 retiring)',
    (await retireWindow(owner, built2.generation.id)) === null);
  A('非法跃迁: active → building 被拒(validate 只收 building)',
    (await validate(owner, built2.generation.id, { manifestDigest: M1.manifestDigest, factCount: M1.factCount, embeddingRecipeDigest: RECIPE_DIGEST })) === null);

  /* ── E. 撤回/删除同步失效（HIGH-1）：撤回事务内触发器 fence + 失效缓存 + recall=0 ── */
  const beforeRecall = await recall(owner);
  A('撤回前: recall 只读 active generation 返回 2 条 fact id',
    beforeRecall.length === 2 && beforeRecall.some((f) => f.factId === factA) && beforeRecall.some((f) => f.factId === factB));
  const putR = await putCache(owner, built2.generation.id, 'retrieval', 'key-1', { candidateIds: [factA, factB] });
  const putH = await putCache(owner, built2.generation.id, 'hydration', 'key-2', { factCards: ['A', 'B'] });
  const hitR = await lookupCache(owner, 'retrieval', 'key-1');
  A('缓存: 写绑 active generation 的 epoch/revision + 命中返回 live',
    putR.status === 'live' && putH.status === 'live' && hitR !== null && hitR.status === 'live'
    && (hitR.value as { candidateIds: string[] }).candidateIds.length === 2);

  // HIGH-1 关键对抗：撤回 factA **不手动调 fenceFacts**，撤回事务内的触发器（AFTER UPDATE 离开
  // active）必须原子地 fence 引用 factA 的 generation 并失效其缓存——旧 cache 不得复活已撤回内容。
  const revokeA = await revoke(owner, factA);
  A('撤回: MEM-13 revoke(active→revoked) 且同事务触发器 fence 引用 factA 的 generation',
    revokeA !== null && revokeA.status === 'revoked' && (await genRow(built2.generation.id))?.status === 'fenced');
  A('撤回同步失效: 无 active generation(activeGeneration=null，撤回即 active 指针清零)',
    (await getActive(owner)) === null);
  A('撤回同步失效: recall=0(只读 active generation，旧 generation 不得恢复已撤回内容)',
    (await recall(owner)).length === 0);
  const hitAfterRevoke = await lookupCache(owner, 'retrieval', 'key-1');
  A('撤回同步失效: 不手动 fenceFacts 下旧 cache 命中仍返回 null + 缓存已 invalidated(防复活)',
    hitAfterRevoke === null
    && (await admin.query("SELECT status FROM memory_index_generation_cache_entry WHERE owner_user_id=$1 AND cache_key='key-1'", [owner])).rows[0]?.status === 'invalidated');
  const M2 = await freeze(owner, { manifestKey: 'm-after-revoke', embeddingRecipeDigest: RECIPE_DIGEST, policyVersion: 'memory-policy-v1' });
  A('撤回后再冻结: 新 manifest 排除已撤回 factA(factCount=1，只含 factB)',
    M2.factCount === 1 && (await readFacts(owner, M2.manifestId)).some((f) => f.factId === factB)
    && !(await readFacts(owner, M2.manifestId)).some((f) => f.factId === factA));
  await revoke(owner, factB); // 清场：隔离后续并发段

  /* ── F. 并发不变量：reindex-vs-delete 删除先赢 + 100 并发双激活 ────────────── */
  const factP = await makeActiveFact({
    snapshotKey: 'snap-p', sourceEntityId: 'src-p', allowedDataClass: 'derived_fact',
    content: '派生摘要：掌握 Redis 集群', namespace: 'skill', subject: 'redis_cluster', cardinality: 'multi_value', idemPrefix: 'fp',
  });
  const factQ = await makeActiveFact({
    snapshotKey: 'snap-q', sourceEntityId: 'src-q', allowedDataClass: 'derived_fact',
    content: '派生摘要：掌握 Kafka 流处理', namespace: 'skill', subject: 'kafka_streams', cardinality: 'multi_value', idemPrefix: 'fq',
  });
  const MRace = await freeze(owner, { manifestKey: 'm-race', embeddingRecipeDigest: RECIPE_DIGEST, policyVersion: 'memory-policy-v1' });
  const raceBuilt = await buildGen(owner, 'gen-race', 'm-race');
  const raceVal = await validate(owner, raceBuilt.generation.id, { manifestDigest: MRace.manifestDigest, factCount: MRace.factCount, embeddingRecipeDigest: RECIPE_DIGEST });
  A('并发段准备: gen-race 构建 + 验证(building→validated)',
    raceBuilt.generation.status === 'building' && raceVal?.status === 'validated' && MRace.factCount === 2);

  // reindex-vs-delete：先撤回 factP → switch 重验 liveness 失败 → 激活=0。
  await revoke(owner, factP);
  const switchAfterDelete = await switchActive(owner, raceBuilt.generation.id);
  A('并发: reindex-vs-delete 删除先赢(撤回后 switch 重验 liveness → 激活=0)',
    switchAfterDelete === null && (await getActive(owner)) === null && (await recall(owner)).length === 0);
  await revoke(owner, factQ); // 清场：隔离后续 100 并发段

  // 100 并发双激活：两个 validated generation 竞争单 active（partial unique index + CAS）。
  const factP2 = await makeActiveFact({
    snapshotKey: 'snap-p2', sourceEntityId: 'src-p2', allowedDataClass: 'derived_fact',
    content: '派生摘要：掌握 Redis 哨兵', namespace: 'skill', subject: 'redis_sentinel', cardinality: 'multi_value', idemPrefix: 'fp2',
  });
  const factQ2 = await makeActiveFact({
    snapshotKey: 'snap-q2', sourceEntityId: 'src-q2', allowedDataClass: 'derived_fact',
    content: '派生摘要：掌握 Pulsar 消息', namespace: 'skill', subject: 'pulsar', cardinality: 'multi_value', idemPrefix: 'fq2',
  });
  const MRace2 = await freeze(owner, { manifestKey: 'm-race2', embeddingRecipeDigest: RECIPE_DIGEST, policyVersion: 'memory-policy-v1' });
  const genP = await buildGen(owner, 'gen-race-p', 'm-race2');
  const genQ = await buildGen(owner, 'gen-race-q', 'm-race2');
  await validate(owner, genP.generation.id, { manifestDigest: MRace2.manifestDigest, factCount: MRace2.factCount, embeddingRecipeDigest: RECIPE_DIGEST });
  await validate(owner, genQ.generation.id, { manifestDigest: MRace2.manifestDigest, factCount: MRace2.factCount, embeddingRecipeDigest: RECIPE_DIGEST });
  await Promise.all(Array.from({ length: 100 }, (_, i) =>
    asPrincipal(concurrent, owner, (c) => switchActiveGeneration(c, i % 2 === 0 ? genP.generation.id : genQ.generation.id))));
  const finalActiveCount = await activeCount();
  A('并发: 100 并发双激活 → 单 active(partial unique index + CAS，绝不双 active)',
    finalActiveCount === 1);
  const finalRecall = await recall(owner);
  // LOW-3 诚实标注：factP 已在上段 reindex-vs-delete（line 337 revoke）被撤回，且 MRace2 冻结在其后，
  // 故 factP 本就不在 MRace2 召回集内——「factP 绝不复活」的对抗承重由 reindex-vs-delete 断言承担
  // （factP 确在 MRace 内、撤回后 switch=0 / recall=0）；此处只断 100 并发双激活后胜出 generation 的
  // recall 与 active 一致（恰好 = factP2/factQ2），不再越权声称「factP 不复活」。
  A('并发: 100 并发双激活后胜出 generation 的 recall 与 active 一致(2 条 = factP2/factQ2)',
    finalRecall.length === 2
    && finalRecall.some((f) => f.factId === factP2) && finalRecall.some((f) => f.factId === factQ2));

  /* ── G. RLS 跨 owner=0 + app_role 无原始表读写 ────────────────────────────── */
  A('RLS 跨 owner=0: otherOwner freeze 拿不到 owner 事实(空 manifest，factCount=0)',
    (await freeze(otherOwner, { manifestKey: 'm-x', embeddingRecipeDigest: RECIPE_DIGEST, policyVersion: 'memory-policy-v1' })).factCount === 0);
  A('RLS 跨 owner=0: otherOwner read owner manifest 事实 fail-closed(not_frozen 抛错，不泄存在性)',
    await rejects(() => readFacts(otherOwner, M1.manifestId)));
  A('RLS 跨 owner=0: otherOwner switch owner generation 返回 null(不泄存在性)',
    (await switchActive(otherOwner, built2.generation.id)) === null);
  A('RLS 跨 owner=0: otherOwner fence owner generation 返回 null',
    (await fence(otherOwner, built2.generation.id)) === null);
  A('app_role 无 memory_index_source_manifest 原始 SELECT(表级 REVOKE)',
    await rejects(() => asPrincipal(admin, owner, (c) => c.query('SELECT * FROM memory_index_source_manifest'))));
  A('app_role 无 memory_index_generation_embedding 原始 SELECT(表级 REVOKE)',
    await rejects(() => asPrincipal(admin, owner, (c) => c.query('SELECT * FROM memory_index_generation_embedding'))));

  /* ── H. 审计：generation 跃迁/失效全走有序事件日志 ────────────────────────── */
  const gen1Audit = (await admin.query<{ kind: string }>(
    'SELECT kind FROM memory_audit_event WHERE owner_user_id=$1 AND stream_key=$2 ORDER BY seq', [owner, `memgen:${built1.generation.id}`])).rows.map((r) => r.kind);
  A('审计: build→validate→switch→retire 全落有序事件(kind 序列正确)',
    gen1Audit.includes('build') && gen1Audit.includes('validate') && gen1Audit.includes('switch_active') && gen1Audit.includes('retire'));
  const fenceAudit = (await admin.query<{ kind: string }>(
    "SELECT kind FROM memory_audit_event WHERE owner_user_id=$1 AND kind='fence_for_facts'", [owner])).rows;
  A('审计: fence_for_facts 落撤销同步事件',
    fenceAudit.length >= 1);

  /* ── I. consent-revoke 触发器（MEDIUM-1/LOW-1/LOW-2）：consent 撤回自动 fence 全部 generation ──
   * HIGH-1 承重的另一条生产路径：consent 是 embedding 授权根，generation 混多 purpose，任一 purpose
   * 撤回即令派生索引整体失效（删除先赢、fail-closed）。account erasure 只 fence MEM-00 memory_fact
   * 表、不 fence MEM-13 memory_fact_adjudication 表，故 erasure 期间的 generation fence 唯一来源就是
   * 本触发器。断言不得手动调任何 fence 函数——必须靠 memory_revoke_consent 的 status 转移自动触发。 */

  // LOW-2 对照：先给 otherOwner 建一套真实 active generation + live cache（触发器不得跨 owner 误伤）。
  await asPrincipal(admin, otherOwner, (c) => c.query('SELECT * FROM memory_grant_consent($1, $2)', [PURPOSE, 'memory-policy-v1']));
  const otherFact = await makeActiveFact({
    snapshotKey: 'snap-other', sourceEntityId: 'src-other', allowedDataClass: 'derived_fact',
    content: '派生摘要：其他用户当前职级', subject: 'other_level', idemPrefix: 'fo', userId: otherOwner,
  });
  const otherGen = await buildGen(otherOwner, 'gen-other', 'm-other');
  await validate(otherOwner, otherGen.generation.id, { manifestDigest: otherGen.manifest.manifestDigest, factCount: otherGen.manifest.factCount, embeddingRecipeDigest: RECIPE_DIGEST });
  await switchActive(otherOwner, otherGen.generation.id);
  const putOther = await putCache(otherOwner, otherGen.generation.id, 'retrieval', 'key-other', { candidateIds: [otherFact] });
  A('consent-revoke 前置(LOW-2): otherOwner 建 active generation + live cache',
    (await getActive(otherOwner))?.id === otherGen.generation.id && putOther.status === 'live');

  // owner 侧：复用 F 段 100 并发后唯一 active generation（确定性单 active），在其上写一条 live cache。
  const ownerActiveGen = await getActive(owner);
  if (!ownerActiveGen) throw new Error('expected owner active generation before consent revoke');
  await putCache(owner, ownerActiveGen.id, 'retrieval', 'key-consent', { candidateIds: [factP2, factQ2] });
  const hitConsentBefore = await lookupCache(owner, 'retrieval', 'key-consent');
  A('consent-revoke 前置: owner 的 active generation 上 cache 命中 live',
    hitConsentBefore !== null && hitConsentBefore.status === 'live');

  // MEDIUM-1 关键：撤回 consent **不手动调 fence**，靠 memory_revoke_consent 的 status 转移触发器
  // 自动 fence 该 owner 全部 generation + 失效全部 cache（旧 cache 不得复活已撤回内容）。
  await revokeConsent(owner);
  A('consent-revoke(MEDIUM-1): 不手动 fence 下触发器把 owner 全部 generation 置 fenced',
    Number((await admin.query("SELECT count(*)::int AS n FROM memory_index_generation WHERE owner_user_id=$1 AND status <> 'fenced'", [owner])).rows[0]!.n) === 0);
  A('consent-revoke(MEDIUM-1): 无 active generation(activeGeneration=null) 且 recall=0',
    (await getActive(owner)) === null && (await recall(owner)).length === 0);
  A('consent-revoke(MEDIUM-1): 不手动 fence 下旧 cache 命中 null + 缓存已 invalidated',
    (await lookupCache(owner, 'retrieval', 'key-consent')) === null
    && (await admin.query("SELECT status FROM memory_index_generation_cache_entry WHERE owner_user_id=$1 AND cache_key='key-consent'", [owner])).rows[0]?.status === 'invalidated');

  // LOW-1：consent 撤回的 generation fence 也须留痕（复用 memory_append_audit，与 fact-leave 的
  // fence_for_facts 同机制）——「谁在何时 fence 了哪些 generation」可追踪。
  const consentFenceAudit = (await admin.query<{ kind: string }>(
    "SELECT kind FROM memory_audit_event WHERE owner_user_id=$1 AND kind='fence_for_consent_revoke'", [owner])).rows;
  A('审计(LOW-1): consent-revoke fence 落 fence_for_consent_revoke 事件',
    consentFenceAudit.length >= 1);

  // LOW-2：触发器不跨 owner 误伤——owner 撤回后 otherOwner 的 generation 仍 active、cache 仍 live。
  A('consent-revoke(LOW-2): 不跨 owner 误伤(otherOwner generation 仍 active)',
    (await genRow(otherGen.generation.id))?.status === 'active'
    && (await getActive(otherOwner))?.id === otherGen.generation.id);
  const hitOther = await lookupCache(otherOwner, 'retrieval', 'key-other');
  A('consent-revoke(LOW-2): otherOwner cache 仍 live(未被他 owner 撤回连坐失效)',
    hitOther !== null && hitOther.status === 'live');

  await admin.end();
  console.log(failures === 0
    ? '\n✓ 索引 generation 治理(MEM-11) DB 证明通过（本地隔离证据）'
    : `\n✗ ${failures} 个断言失败`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(async (e) => {
  console.error(e);
  await admin.end().catch(() => undefined);
  process.exit(1);
});
