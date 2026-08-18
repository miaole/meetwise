/**
 * RAG-FUNNEL-04 / track-local retrieval proof（真隔离 PostgreSQL + 全迁移链）。
 *
 * 把「Worker 固定技术岗 + 全局检索」升级为「按 InterviewRouteSnapshot 的
 * track-local 检索」的承重证明：planner 冻结 `RetrievalPlan`（服务端校验属于
 * snapshot）→ DB 层 `qbank_chunk_serving_scope`/`qbank_generation_chunk` 的
 * serving_scope 硬过滤（在 ORDER BY/LIMIT **之前**，非全局 Top-K 后应用层剔除）
 * → 命中在成为模型材料前经权威投影 `readGenerationQuestionChunkProjection`
 * 逐条重验（snapshot leaf == plan leaf == 投影 leaf == 题面 metadata leaf +
 * metadata hash 一致）→ 四条承重原语（CAS / principal 作用域幂等 / RLS /
 * 事务 outbox + 单调 eventSeq）全部打真 PG 行。
 *
 * 真实 embedding 用确定性替身 seam（proof 内联 512 维 sha256 向量）；generation
 * 构建内联 worker 的持久化流程（recipe 持久化 → 冻结 facts → embed → 写投影行 →
 * prepare/validate/activate），因为 packages/db 不依赖 apps/worker 或
 * ai-runtime。Redis 热缓存用进程内契约替身（不承载业务状态，承重断言全在 PG）。
 *
 * pnpm rag04-track-local:prove   (node scripts/run-e2e-isolated.mjs rag04-track-local:prove:raw)
 */
import { createHash, randomUUID } from 'node:crypto';
import {
  assertIsolatedTestTarget, createPool, asPrincipal, asQbankControlExecutor,
  createJob, updateJob, applyToJob, startApplicationInterview, classifyJobRoute, getInterviewRouteSnapshot,
  ingestQbank, ingestQuestionBankArtifacts,
  hybridQbankSearch, qbankRetrievalCacheKey, dispatchTrackLocalRetrieval,
  type QbankEmbedder, type QbankQuestionArtifact, type QbankRetrievalCacheBackend,
  type QbankRetrievalCacheAddress, type QbankRetrievalCacheLock, type QbankRetrievalHit,
  type InterviewRouteSnapshotView,
} from '../src/index.ts';
import {
  deriveRouteScopeDigest, validateRetrievalPlan, RETRIEVAL_POLICY_VERSION,
  JOB_ROUTE_TAXONOMY_VERSION, nextWeightedDeficitLeaf,
  type RetrievalPlan, type JobRouteAllocation,
} from '@meetwise/domain';

// run-e2e-isolated.mjs 会剥离操作者 shell 里的真实 HMAC 密钥；proof 用固定测试键（≥32 字符）。
process.env.RAG_QBANK_CACHE_HASH_KEY = 'rag04-qbank-cache-hmac-proof-key-not-production-01';
process.env.RAG_JOB_ROUTE_INPUT_HASH_KEY = 'rag04-job-route-input-hmac-proof-key-not-production-01';

const pool = createPool();
let fail = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) fail++; };
const section = (t: string) => console.log(`\n──────── ${t} ────────`);

/* ─────────────────────────── 确定性 embedder seam ─────────────────────────── */
const DIM = 512;
const EMBEDDER_ID = 'rag04-proof-embedder:v1';

/** 每维由 sha256(text+index) 派生，归一化为单位向量；同文本 = 同向量（query==doc 时余弦距离 0）。 */
function deterministicVector(text: string): number[] {
  const out = new Array<number>(DIM);
  for (let i = 0; i < DIM; i++) {
    const d = createHash('sha256').update(`${i}:${text}`, 'utf8').digest();
    out[i] = (d.readUInt32LE(0) / 0xffffffff) * 2 - 1;
  }
  const norm = Math.hypot(...out) || 1;
  return out.map((x) => x / norm);
}

const embedder: QbankEmbedder = {
  dim: DIM,
  id: EMBEDDER_ID,
  embed: async (texts: string[]) => texts.map(deterministicVector),
};
// dispatch seam 的 embed 只接 (texts[, context])，结构上满足即可。
const embedSeam = async (texts: string[]) => texts.map(deterministicVector);

/* ─────────────────────────── 题库 fixture（两个 leaf 各一题） ─────────────────────────── */
const NODEJS_LEAF = 'backend/nodejs';
const JAVA_LEAF = 'backend/java';
const NODEJS_QID = 'nodejs_q1';
const JAVA_QID = 'java_q1';
const NODEJS_PROMPT = 'Explain how to avoid callback hell in Node.js event loops and async flows.';
const NODEJS_RUBRIC = 'Candidate mentions async/await, Promise chaining, and error propagation.';
const NODEJS_EXAMPLE = 'A refactor example converting nested callbacks into async/await.';
const JAVA_PROMPT = 'Explain Java thread safety and the Java Memory Model for shared mutable state.';
const JAVA_RUBRIC = 'Candidate mentions happens-before, volatile, synchronized, and locks.';
const JAVA_EXAMPLE = 'A thread-safe counter implementation using synchronized blocks.';

const nodejsArtifact: QbankQuestionArtifact = {
  id: NODEJS_QID, competency: 'concurrency', difficulty: 4,
  taxonomyVersion: JOB_ROUTE_TAXONOMY_VERSION, servingScopeId: NODEJS_LEAF, annotationSource: 'seed_v1_reviewed',
  chunks: [
    { refId: 'nodejs_prompt', text: NODEJS_PROMPT, role: 'prompt', ordinal: 0, required: true },
    { refId: 'nodejs_rubric', text: NODEJS_RUBRIC, role: 'rubric', ordinal: 1, required: true },
    { refId: 'nodejs_example', text: NODEJS_EXAMPLE, role: 'example', ordinal: 2, required: false },
  ],
};
const javaArtifact: QbankQuestionArtifact = {
  id: JAVA_QID, competency: 'concurrency', difficulty: 4,
  taxonomyVersion: JOB_ROUTE_TAXONOMY_VERSION, servingScopeId: JAVA_LEAF, annotationSource: 'seed_v1_reviewed',
  chunks: [
    { refId: 'java_prompt', text: JAVA_PROMPT, role: 'prompt', ordinal: 0, required: true },
    { refId: 'java_rubric', text: JAVA_RUBRIC, role: 'rubric', ordinal: 1, required: true },
    { refId: 'java_example', text: JAVA_EXAMPLE, role: 'example', ordinal: 2, required: false },
  ],
};

/* ─────────────────────────── generation 构建（内联 worker 流程） ─────────────────────────── */
const RECIPE_MANIFEST = {
  schema: 'qbank-embedding-recipe:v1',
  provider: 'openai-compatible',
  model: EMBEDDER_ID,
  providerRevision: 'rag04-proof-unverified',
  dimensions: DIM,
  chunkerVersion: 'whole-qbank-item:v1',
  normalizationVersion: 'utf8-nfc-trim:v1',
  documentPrefixVersion: 'none:v1',
  queryPrefixVersion: 'none:v1',
} as const;
const recipeHash = createHash('sha256').update(JSON.stringify(RECIPE_MANIFEST)).digest('hex');
const recipeId = 'qrecipe-' + recipeHash.slice(0, 32);

interface QbankFact { refId: string; contentHash: string; content: string; taxonomyVersion: string; servingScopeId: string }

async function persistRecipe(): Promise<void> {
  await asQbankControlExecutor(pool, (c) => c.query(
    `INSERT INTO qbank_embedding_recipe(
       id,recipe_hash,provider,model,provider_revision,dimensions,chunker_version,normalization_version,
       document_prefix_version,query_prefix_version,manifest
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::jsonb)
     ON CONFLICT (recipe_hash) DO NOTHING`,
    [recipeId, recipeHash, RECIPE_MANIFEST.provider, RECIPE_MANIFEST.model, RECIPE_MANIFEST.providerRevision, DIM,
      RECIPE_MANIFEST.chunkerVersion, RECIPE_MANIFEST.normalizationVersion, RECIPE_MANIFEST.documentPrefixVersion,
      RECIPE_MANIFEST.queryPrefixVersion, JSON.stringify(RECIPE_MANIFEST)],
  ));
}

/** 冻结当前 approved 事实（每个 reviewed leaf 一行）。unrouted（无 serving scope）→ 抛错。 */
async function snapshotFacts(): Promise<{ epoch: string; facts: QbankFact[] }> {
  return asQbankControlExecutor(pool, async (c) => {
    const epoch = await c.query('SELECT epoch::text AS epoch FROM qbank_corpus_epoch WHERE singleton=true');
    if (epoch.rowCount !== 1) throw new Error('qbank_generation_epoch_missing');
    const rows = await c.query(
      `SELECT ch.ref_id, ch.content_hash, ch.content, cs.taxonomy_version, cs.serving_scope_id
         FROM qbank_chunk ch
         JOIN qbank_pool_entry pool
           ON pool.ref_id=ch.ref_id AND pool.source_id=ch.source_id AND pool.content_hash=ch.content_hash
         JOIN qbank_source source
           ON source.id=pool.source_id AND source.content_hash=pool.content_hash
         LEFT JOIN qbank_chunk_serving_scope cs ON cs.ref_id=ch.ref_id
        WHERE source.status='approved'
          AND (
            pool.content_hash=left(encode(digest(convert_to(ch.content, 'UTF8'), 'sha256'), 'hex'), 32)
            OR pool.content_hash=encode(digest(convert_to(ch.content, 'UTF8'), 'sha256'), 'hex')
          )
        ORDER BY ch.ref_id, cs.taxonomy_version, cs.serving_scope_id`,
    );
    const facts = rows.rows.map((r) => ({
      refId: String(r.ref_id), contentHash: String(r.content_hash), content: String(r.content),
      taxonomyVersion: String(r.taxonomy_version), servingScopeId: String(r.serving_scope_id),
    }));
    const unrouted = facts.find((f) => !f.taxonomyVersion || !f.servingScopeId);
    if (unrouted) throw new Error(`qbank_generation_unrouted_chunk_without_serving_scope:${unrouted.refId}`);
    return { epoch: String(epoch.rows[0].epoch), facts };
  });
}

/** 构建并激活一个 immutable generation（recipe 相同 → 每次新 generationId）。 */
async function buildActiveGeneration(): Promise<string> {
  await persistRecipe();
  const { epoch, facts } = await snapshotFacts();
  const generationId = 'qgen-' + randomUUID();
  await asQbankControlExecutor(pool, async (c) => {
    await c.query(
      `INSERT INTO qbank_vector_generation(id,recipe_id,source_epoch,expected_chunk_count,state)
       VALUES ($1,$2,$3::bigint,$4,'building')`, [generationId, recipeId, epoch, facts.length],
    );
    await c.query('SELECT qbank_prepare_generation_partition($1)', [generationId]);
  });
  const vectors = await embedder.embed(facts.map((f) => f.content));
  await asQbankControlExecutor(pool, async (c) => {
    const params: unknown[] = [];
    const values = facts.map((fact, i) => {
      const v = vectors[i];
      if (!v || v.length !== DIM || !v.every(Number.isFinite)) throw new Error(`qbank_generation_invalid_document_embedding:${fact.refId}`);
      const p = i * 6;
      params.push(generationId, fact.refId, fact.taxonomyVersion, fact.servingScopeId, fact.contentHash, `[${v.join(',')}]`);
      return `($${p + 1},$${p + 2},$${p + 3},$${p + 4},$${p + 5},$${p + 6}::vector)`;
    }).join(',');
    await c.query(
      `INSERT INTO qbank_generation_chunk(generation_id,ref_id,taxonomy_version,serving_scope_id,content_hash,embedding)
       VALUES ${values}
       ON CONFLICT (generation_id,ref_id,taxonomy_version,serving_scope_id) DO NOTHING`,
      params,
    );
  });
  await asQbankControlExecutor(pool, (c) => c.query('SELECT qbank_validate_generation($1)', [generationId]));
  await asQbankControlExecutor(pool, (c) => c.query('SELECT qbank_activate_generation($1)', [generationId]));
  return generationId;
}

/* ─────────────────────────── 进程内 Redis 缓存契约替身 ─────────────────────────── */
class MemoryQbankCache implements QbankRetrievalCacheBackend {
  private readonly values = new Map<string, QbankRetrievalHit[]>();
  private readonly locks = new Map<string, { token: string; expiresAt: number }>();
  private keyOf(a: QbankRetrievalCacheAddress): string { return `${a.cacheKey}:${a.corpusEpoch}`; }
  async read(a: QbankRetrievalCacheAddress, k: number): Promise<QbankRetrievalHit[] | undefined> {
    const v = this.values.get(this.keyOf(a));
    return v ? v.slice(0, k).map((h) => ({ ...h })) : undefined;
  }
  async acquire(a: QbankRetrievalCacheAddress, leaseMs: number): Promise<QbankRetrievalCacheLock | undefined> {
    const key = this.keyOf(a);
    const existing = this.locks.get(key);
    if (existing && existing.expiresAt > Date.now()) return undefined;
    const token = randomUUID();
    this.locks.set(key, { token, expiresAt: Date.now() + leaseMs });
    return { token };
  }
  async renew(a: QbankRetrievalCacheAddress, lock: QbankRetrievalCacheLock, leaseMs: number): Promise<boolean> {
    const existing = this.locks.get(this.keyOf(a));
    if (existing?.token !== lock.token) return false;
    existing.expiresAt = Date.now() + leaseMs;
    return true;
  }
  async publish(a: QbankRetrievalCacheAddress, lock: QbankRetrievalCacheLock, hits: QbankRetrievalHit[], _ttlMs: number): Promise<boolean> {
    const key = this.keyOf(a);
    if (this.locks.get(key)?.token !== lock.token) return false;
    this.values.set(key, hits.map((h) => ({ ...h })));
    this.locks.delete(key);
    return true;
  }
  async release(a: QbankRetrievalCacheAddress, lock: QbankRetrievalCacheLock): Promise<void> {
    const key = this.keyOf(a);
    if (this.locks.get(key)?.token === lock.token) this.locks.delete(key);
  }
  /** 只用于 proof 预置（模拟不可信/被污染的热缓存回放）。 */
  prime(a: QbankRetrievalCacheAddress, hits: QbankRetrievalHit[]): void {
    this.values.set(this.keyOf(a), hits.map((h) => ({ ...h })));
  }
}

/* ─────────────────────────── helpers ─────────────────────────── */
const TAG = 'rag04_' + Math.random().toString(36).slice(2, 8);
const rec = `${TAG}_rec`, cand = `${TAG}_cand`, cand2 = `${TAG}_cand2`;
const resumeCand = randomUUID(), resumeCand2 = randomUUID();

async function maxRev(jobId: string): Promise<number> {
  const r = await pool.query('SELECT COALESCE(MAX(revision),0)::int AS n FROM job_semantic_revision WHERE job_id=$1', [jobId]);
  return r.rows[0]?.n ?? 0;
}

function mkPlan(snapshot: InterviewRouteSnapshotView, generationId: string, leafTrackId: string, overrides: Partial<RetrievalPlan> = {}): RetrievalPlan {
  return {
    snapshotId: snapshot.interviewId,
    routeScopeDigest: deriveRouteScopeDigest({ routeDigest: snapshot.routeDigest, leafTrackId, taxonomyVersion: JOB_ROUTE_TAXONOMY_VERSION }),
    leafTrackId,
    taxonomyVersion: JOB_ROUTE_TAXONOMY_VERSION,
    competencyId: 'concurrency',
    difficulty: 4,
    generationId,
    recipeId,
    policyVersion: RETRIEVAL_POLICY_VERSION,
    ...overrides,
  };
}

async function cacheEpoch(): Promise<string> {
  const r = await asPrincipal(pool, cand, (c) => c.query('SELECT epoch::text AS epoch FROM qbank_cache_epoch WHERE singleton=true'));
  return r.rows[0]?.epoch as string;
}

function cacheAddressFor(plan: RetrievalPlan, query: string, k: number, epoch: string): QbankRetrievalCacheAddress {
  const cacheKey = qbankRetrievalCacheKey({
    owner: cand, query, k, embedderVersion: EMBEDDER_ID, qbankRecipeId: plan.recipeId, retrievalMode: 'dense',
    scope: { taxonomyVersion: plan.taxonomyVersion, servingScopeId: plan.leafTrackId },
  });
  return { cacheKey, corpusEpoch: epoch };
}

async function planStatus(planId: string): Promise<string | undefined> {
  const r = await asPrincipal(pool, cand, (c) => c.query('SELECT status FROM qbank_retrieval_plan WHERE id=$1', [planId]));
  return r.rows[0]?.status as string | undefined;
}

function qids(r: { ref: string }[]): string[] { return r.map((x) => x.ref); }

async function main() {
  await assertIsolatedTestTarget(pool);

  for (const [id, owner] of [[resumeCand, cand], [resumeCand2, cand2]] as const) {
    await pool.query("INSERT INTO resume(id, owner_user_id, status, content_sha) VALUES ($1,$2,'ingested',$3)", [id, owner, `${TAG}:${owner}`]);
  }

  section('0. 灌入两个 leaf 各一题（nodejs + java），构建并激活 generation');
  const ingest = await ingestQuestionBankArtifacts(pool, [nodejsArtifact, javaArtifact], embedder);
  A('灌入 2 题 / 6 chunk 全部成功', ingest.questionCount === 2 && ingest.chunkCount === 6);
  const generationId = await buildActiveGeneration();
  A('generation 构建并激活（active generation 存在）', /^qgen-[0-9a-f-]{36}$/.test(generationId));

  // 招聘方 nodejs 岗位 → rule 分类 → 候选人申请 → 启动面试 → 不可变 snapshot。
  const job = await asPrincipal(pool, rec, (c) => createJob(c, rec, { title: 'Node.js 服务端工程师', description: '使用 NestJS 构建服务', competencies: ['nestjs', 'express', 'koa'] }));
  const classify = await classifyJobRoute(pool, rec, job.id, await maxRev(job.id), { modelClassify: async () => { throw new Error('rule path must never call model'); } });
  A('岗位 rule 路径 route_decided（0 次模型外发）', classify.status === 'route_decided' && classify.attemptOutcome === 'rule_decided');
  const app = await asPrincipal(pool, cand, (c) => applyToJob(c, cand, job.id));
  const started = await asPrincipal(pool, cand, (c) => startApplicationInterview(c, cand, app!.applicationId, resumeCand));
  const interviewId = started.status === 'started' || started.status === 'reused' ? started.interviewId : undefined;
  const snapshot = await asPrincipal(pool, cand, (c) => getInterviewRouteSnapshot(c, cand, interviewId!));
  A('面试启动落不可变 snapshot（单叶 backend/nodejs）',
    !!snapshot && snapshot.allocations.length === 1 && snapshot.allocations[0]!.leafTrackId === NODEJS_LEAF);

  const activeEpoch = await cacheEpoch();

  section('① happy path：track-local 检索 wrong_track=0 + 四原语');
  const plan1 = mkPlan(snapshot!, generationId, NODEJS_LEAF, { competencyId: 'concurrency' });
  const cache1 = new MemoryQbankCache();
  const r1 = await dispatchTrackLocalRetrieval(pool, cand, plan1, { query: NODEJS_PROMPT, embedderVersion: EMBEDDER_ID, k: 5, embed: embedSeam, cache: cache1 });
  A('nodejs leaf 检索 → served，只返回 nodejs_q1（wrong_track=0）',
    r1.status === 'served' && r1.results.length >= 1 && qids(r1.results).every((q) => q === NODEJS_QID) && !qids(r1.results).includes(JAVA_QID));
  A('served 后 plan 终态 = served', r1.status === 'served' && await planStatus(r1.planId) === 'served');
  const ev1 = await asPrincipal(pool, cand, (c) => c.query('SELECT event_seq, from_status, to_status FROM qbank_retrieval_plan_event WHERE plan_id=$1 ORDER BY event_seq', [r1.status === 'served' ? r1.planId : '']));
  A('outbox 事件 = prepared→dispatched→served（单调 event_seq）',
    ev1.rows.length === 2 && ev1.rows[0]?.from_status === 'prepared' && ev1.rows[0]?.to_status === 'dispatched'
    && ev1.rows[1]?.from_status === 'dispatched' && ev1.rows[1]?.to_status === 'served'
    && Number(ev1.rows[1]?.event_seq) === Number(ev1.rows[0]?.event_seq) + 1);

  section('② forbid-global-Top-K：全局 Top-1 是 java，但 DB scope 过滤在 ORDER BY/LIMIT 之前');
  const javaGlobal = await asPrincipal(pool, cand, (c) => hybridQbankSearch(c, { query: JAVA_PROMPT, embedding: deterministicVector(JAVA_PROMPT), k: 5, expectedRecipeId: recipeId, retrievalMode: 'dense' }));
  A('全局（无 scope）检索 Top-1 = java chunk（java 全局最相似）',
    javaGlobal.length >= 1 && String(javaGlobal[0]!.refId).startsWith('java_'));
  const plan2 = mkPlan(snapshot!, generationId, NODEJS_LEAF, { competencyId: 'concurrency-adversarial' });
  const r2 = await dispatchTrackLocalRetrieval(pool, cand, plan2, { query: JAVA_PROMPT, embedderVersion: EMBEDDER_ID, k: 5, embed: embedSeam, cache: new MemoryQbankCache() });
  A('同一 java query 走 nodejs scope → 零 java（全局 Top-1 被 DB 层排除，非应用层剔除）',
    r2.status === 'served' && qids(r2.results).every((q) => q === NODEJS_QID) && !qids(r2.results).includes(JAVA_QID));

  section('②b fail-closed：单设一个 GUC → 0 行（半 scope 绝不降级成全库）');
  // 直接调 SECURITY DEFINER 检索函数，绕开 setServingScope（它必设两个 GUC），
  // 故意只设一个 GUC 证明 DB 谓词「任一单独设 → 0 行」承重成立。
  const nodejsVec = `[${deterministicVector(NODEJS_PROMPT).join(',')}]`;
  const bothSetRows = await asPrincipal(pool, cand, async (c) => {
    await c.query("SELECT set_config('app.qbank_serving_scope', $1, true)", [NODEJS_LEAF]);
    await c.query("SELECT set_config('app.qbank_taxonomy_version', $1, true)", [JOB_ROUTE_TAXONOMY_VERSION]);
    return c.query('SELECT ref_id, distance FROM qbank_generation_ann_search($1,$2::vector,5)', [generationId, nodejsVec]);
  });
  A('对照组：两个 GUC 都设 → 检索命中 nodejs 行（排除“查询本身失效”造成的假 0 行）',
    (bothSetRows.rowCount ?? 0) > 0 && bothSetRows.rows.every((r) => String(r.ref_id).startsWith('nodejs_')));
  const onlyScopeRows = await asPrincipal(pool, cand, async (c) => {
    await c.query("SELECT set_config('app.qbank_serving_scope', $1, true)", [NODEJS_LEAF]);
    return c.query('SELECT ref_id, distance FROM qbank_generation_ann_search($1,$2::vector,5)', [generationId, nodejsVec]);
  });
  A('仅设 app.qbank_serving_scope（不设 taxonomy）→ 0 行', onlyScopeRows.rowCount === 0);
  const onlyTaxonomyRows = await asPrincipal(pool, cand, async (c) => {
    await c.query("SELECT set_config('app.qbank_taxonomy_version', $1, true)", [JOB_ROUTE_TAXONOMY_VERSION]);
    return c.query('SELECT ref_id, distance FROM qbank_generation_ann_search($1,$2::vector,5)', [generationId, nodejsVec]);
  });
  A('仅设 app.qbank_taxonomy_version（不设 scope）→ 0 行', onlyTaxonomyRows.rowCount === 0);

  section('③ 分类未知 / 越界 leaf → 拒绝（planner 校验复用 RAG-03）');
  const planBadLeaf = mkPlan(snapshot!, generationId, 'frontend/web', { competencyId: 'concurrency' });
  const rBadLeaf = await dispatchTrackLocalRetrieval(pool, cand, planBadLeaf, { query: NODEJS_PROMPT, embedderVersion: EMBEDDER_ID, k: 5, embed: embedSeam, cache: new MemoryQbankCache() });
  A('leaf 不在 snapshot（frontend/web）→ rejected', rBadLeaf.status === 'rejected' && rBadLeaf.reason.startsWith('planner_leaf_not_in_snapshot'));

  section('④ 旧 checkpoint（陈旧 routeScopeDigest）→ 拒绝');
  const planStale = mkPlan(snapshot!, generationId, NODEJS_LEAF, { competencyId: 'concurrency-stale', routeScopeDigest: 'f'.repeat(64) });
  const rStale = await dispatchTrackLocalRetrieval(pool, cand, planStale, { query: NODEJS_PROMPT, embedderVersion: EMBEDDER_ID, k: 5, embed: embedSeam, cache: new MemoryQbankCache() });
  A('routeScopeDigest 与 snapshot 重派生不一致 → rejected(route_scope_digest_mismatch)',
    rStale.status === 'rejected' && rStale.reason === 'route_scope_digest_mismatch');

  section('⑤ generation 竞态（陈旧 generationId）→ recheck_failed，绝不放出');
  const bogusGen = 'qgen-' + randomUUID();
  const planRace = mkPlan(snapshot!, bogusGen, NODEJS_LEAF, { competencyId: 'concurrency-race' });
  const rRace = await dispatchTrackLocalRetrieval(pool, cand, planRace, { query: NODEJS_PROMPT, embedderVersion: EMBEDDER_ID, k: 5, embed: embedSeam, cache: new MemoryQbankCache() });
  A('plan.generationId ≠ active generation → recheck_failed(generation_race)',
    rRace.status === 'recheck_failed' && rRace.reason === 'generation_race');
  A('generation 竞态后无 question_ready（plan 非 served）',
    rRace.status === 'recheck_failed' && await planStatus(rRace.planId) === 'recheck_failed');

  section('⑥ 检索缓存回放（被污染的跨 track 命中）→ recheck 拦截，零跨域');
  const poisonQuery = 'poison-cross-track-query';
  const planP = mkPlan(snapshot!, generationId, NODEJS_LEAF, { competencyId: 'concurrency-poison' });
  const cacheP = new MemoryQbankCache();
  cacheP.prime(cacheAddressFor(planP, poisonQuery, 5, activeEpoch), [{ refId: 'java_prompt', distance: 0.001 }]);
  const rP = await dispatchTrackLocalRetrieval(pool, cand, planP, { query: poisonQuery, embedderVersion: EMBEDDER_ID, k: 5, embed: embedSeam, cache: cacheP });
  A('cache 回放命中 java ref（跨 track）→ recheck_failed(cross_track_or_revoked)，不放 java 题',
    rP.status === 'recheck_failed' && rP.reason === 'cross_track_or_revoked');
  const planG = mkPlan(snapshot!, generationId, NODEJS_LEAF, { competencyId: 'concurrency-poison-ghost' });
  const cacheG = new MemoryQbankCache();
  cacheG.prime(cacheAddressFor(planG, 'poison-ghost-query', 5, activeEpoch), [{ refId: 'ghost_nonexistent_ref', distance: 0.001 }]);
  const rG = await dispatchTrackLocalRetrieval(pool, cand, planG, { query: 'poison-ghost-query', embedderVersion: EMBEDDER_ID, k: 5, embed: embedSeam, cache: cacheG });
  A('cache 回放命中不存在的 ref → recheck_failed(cross_track_or_revoked)',
    rG.status === 'recheck_failed' && rG.reason === 'cross_track_or_revoked');

  section('⑥b metadata_hash 伪造（leaf 正确但 cs.metadata_hash 被改）→ recheck_failed(metadata_hash_mismatch)');
  // qbank_chunk_serving_scope_guard 是 ONLY-INSERT（UPDATE 一律拒），所以正常 DB 面到不了这个分支；
  // 这里用 superuser 临时关掉该 trigger 模拟「DB 层完整性被破坏」，制造 leaf/scope 正确但
  // metadata_hash 不一致的独立 reason。改完立即恢复，只做测试夹具、不改任何生产 SQL 谓词语义。
  const tamperRef = 'nodejs_rubric';
  const beforeHash = (await pool.query('SELECT metadata_hash FROM qbank_chunk_serving_scope WHERE ref_id=$1', [tamperRef])).rows[0]?.metadata_hash as string | undefined;
  if (typeof beforeHash !== 'string' || !/^[0-9a-f]{64}$/.test(beforeHash)) throw new Error('metadata_tamper_target_missing');
  const setMetadataHash = async (h: string) => {
    await pool.query('ALTER TABLE qbank_chunk_serving_scope DISABLE TRIGGER trg_qbank_chunk_serving_scope_guard');
    try {
      await pool.query('UPDATE qbank_chunk_serving_scope SET metadata_hash=$1 WHERE ref_id=$2', [h, tamperRef]);
    } finally {
      await pool.query('ALTER TABLE qbank_chunk_serving_scope ENABLE TRIGGER trg_qbank_chunk_serving_scope_guard');
    }
  };
  await setMetadataHash('f'.repeat(64));
  try {
    const planM = mkPlan(snapshot!, generationId, NODEJS_LEAF, { competencyId: 'concurrency-metahash' });
    const cacheM = new MemoryQbankCache();
    cacheM.prime(cacheAddressFor(planM, 'metadata-tamper-query', 5, activeEpoch), [{ refId: tamperRef, distance: 0.001 }]);
    const rM = await dispatchTrackLocalRetrieval(pool, cand, planM, { query: 'metadata-tamper-query', embedderVersion: EMBEDDER_ID, k: 5, embed: embedSeam, cache: cacheM });
    A('leaf 正确但 cs.metadata_hash 被篡改 → recheck_failed(metadata_hash_mismatch)',
      rM.status === 'recheck_failed' && rM.reason === 'metadata_hash_mismatch');
  } finally {
    await setMetadataHash(beforeHash);
  }

  section('⑦ cache hit 仍被权威投影重验（正路径：命中但 leaf 一致 → served）');
  // cache key 不含 competencyId；两个不同 plan 轮（不同 plan_key）共享同一热缓存条目，
  // 以证明「命中缓存」与「命中后重验」是两条独立防线：plan_key 幂等管重放，recheck 管跨叶。
  const hitQuery = 'nodejs-hit-recheck-query';
  const cacheHit = new MemoryQbankCache();
  const planHitFill = mkPlan(snapshot!, generationId, NODEJS_LEAF, { competencyId: 'concurrency-hit-fill' });
  await dispatchTrackLocalRetrieval(pool, cand, planHitFill, { query: hitQuery, embedderVersion: EMBEDDER_ID, k: 5, embed: embedSeam, cache: cacheHit }); // miss → fill → served
  const planHitRecheck = mkPlan(snapshot!, generationId, NODEJS_LEAF, { competencyId: 'concurrency-hit-recheck' });
  const rHit = await dispatchTrackLocalRetrieval(pool, cand, planHitRecheck, { query: hitQuery, embedderVersion: EMBEDDER_ID, k: 5, embed: embedSeam, cache: cacheHit });
  A('二次同 query 命中热缓存（不同 plan 轮）→ served 且仍只 nodejs（重验通过）',
    rHit.status === 'served' && rHit.cacheStatus === 'hit' && qids(rHit.results).every((q) => q === NODEJS_QID));

  section('⑧ principal 作用域幂等：同 plan 重放 = replayed，绝不二次外发');
  const rReplay = await dispatchTrackLocalRetrieval(pool, cand, plan1, { query: NODEJS_PROMPT, embedderVersion: EMBEDDER_ID, k: 5, embed: embedSeam, cache: new MemoryQbankCache() });
  A('同 plan（同 plan_key）二次派发 → replayed（sticky served，不重检索）',
    rReplay.status === 'replayed' && rReplay.planStatus === 'served');

  section('⑨ 撤权竞态：chunk visible=false → 该题不再被组装（零陈旧放出）');
  await asQbankControlExecutor(pool, (c) => c.query(
    "UPDATE qbank_generation_chunk SET visible=false WHERE ref_id='nodejs_prompt' AND generation_id=$1", [generationId]));
  const planRev = mkPlan(snapshot!, generationId, NODEJS_LEAF, { competencyId: 'concurrency-revoked' });
  const rRev = await dispatchTrackLocalRetrieval(pool, cand, planRev, { query: NODEJS_PROMPT, embedderVersion: EMBEDDER_ID, k: 5, embed: embedSeam, cache: new MemoryQbankCache() });
  A('prompt chunk 被撤 → served 但 results 空（缺 prompt 的题不组装，零陈旧题）',
    rRev.status === 'served' && rRev.results.length === 0);

  section('⑩ RLS owner/tenant 隔离（C 端 plan 只属于本人）');
  const ownPlans = await asPrincipal(pool, cand, (c) => c.query('SELECT count(*)::int n FROM qbank_retrieval_plan'));
  const crossPlans = await asPrincipal(pool, cand2, (c) => c.query('SELECT count(*)::int n FROM qbank_retrieval_plan'));
  const crossEvents = await asPrincipal(pool, cand2, (c) => c.query('SELECT count(*)::int n FROM qbank_retrieval_plan_event'));
  A('本人 plan >0，他人读 plan/event = 0 行', ownPlans.rows[0].n > 0 && crossPlans.rows[0].n === 0 && crossEvents.rows[0].n === 0);
  let candInsertPlanDenied = false;
  try {
    await asPrincipal(pool, cand2, (c) => c.query(
      `INSERT INTO qbank_retrieval_plan(id,owner_user_id,snapshot_id,route_scope_digest,leaf_track_id,taxonomy_version,competency_id,difficulty,generation_id,recipe_id,policy_version,plan_key,status)
       VALUES ('qrp-inject','${cand}','${snapshot!.interviewId}','${'a'.repeat(64)}','backend/nodejs','v1','c',4,'${generationId}','${recipeId}','p','${'b'.repeat(64)}','prepared')`));
  } catch { candInsertPlanDenied = true; }
  A('他人不能为 owner 写 plan（RLS WITH CHECK 拒绝）', candInsertPlanDenied);

  section('⑪ 事务 outbox + 单调 eventSeq（单 owner 无空洞）');
  const seq = await asPrincipal(pool, cand, (c) => c.query('SELECT count(*)::int n, max(event_seq)::int mx FROM qbank_retrieval_plan_event'));
  A('event_seq 从 1 连续单调（count == max）', seq.rows[0].n === seq.rows[0].mx && seq.rows[0].n > 0);

  section('⑫ 伪造/缺失 metadata 与 legacy_unrouted 在摄取门即拒（零入库 → 零跨域）');
  let legacyRejected = false;
  try {
    await ingestQbank(pool, [{ refId: 'legacy_evil', text: 'unrouted legacy chunk', taxonomyVersion: 'v1', servingScopeId: NODEJS_LEAF, annotationSource: 'legacy_unrouted' as never }], embedder);
  } catch (e) { legacyRejected = (e as Error).message.startsWith('qbank_invalid_serving_metadata'); }
  A('annotation_source=legacy_unrouted → ingest 拒（legacy_unrouted 永不进入 serving scope）', legacyRejected);
  let missingMetaRejected = false;
  try {
    await ingestQbank(pool, [{ refId: 'missing_meta', text: 'chunk without a reviewed leaf', taxonomyVersion: 'v1', servingScopeId: '', annotationSource: 'seed_v1_reviewed' }], embedder);
  } catch (e) { missingMetaRejected = (e as Error).message.startsWith('qbank_invalid_serving_metadata'); }
  A('缺失 serving_scope（空 leaf）→ ingest 拒（fail-closed，不落库）', missingMetaRejected);
  const unroutedCount = (await asQbankControlExecutor(pool, (c) => c.query(
    "SELECT count(*)::int n FROM qbank_chunk_serving_scope WHERE annotation_source NOT IN ('curator_reviewed','seed_v1_reviewed')"))).rows[0].n;
  A('serving scope 表内零非 reviewed 注释（legacy_unrouted 从未入库）', unroutedCount === 0);

  section('⑬ 多桶岗位按轮配额 = 单 leaf/轮（不混桶）');
  const allocs: JobRouteAllocation[] = [{ leafTrackId: NODEJS_LEAF, allocationBps: 7000 }, { leafTrackId: 'frontend/web', allocationBps: 3000 }];
  const step = nextWeightedDeficitLeaf(allocs, [0, 0]);
  A('nextWeightedDeficitLeaf 每轮只选单个 leafIndex（不返回多叶）',
    Number.isInteger(step.leafIndex) && step.leafIndex >= 0 && step.leafIndex < allocs.length && step.deficit.length === allocs.length);

  section('⑭ 岗位并发修改：snapshot 不可变，plan 仍钉旧 leaf（零跨域）');
  // 并发编辑同一岗位：语义字段变化 → 新 revision(route_pending) → 重分类到 backend/java。
  // 消费链的不可变性由 interview_route_snapshot 的副本保证，检索只读 snapshot、不读活岗位。
  await asPrincipal(pool, rec, (c) => updateJob(c, rec, job.id, { title: 'Java Engineer', description: 'Building services with Spring Boot', competencies: ['java', 'spring', 'jvm'] }));
  const classifyEdit = await classifyJobRoute(pool, rec, job.id, await maxRev(job.id), { modelClassify: async () => { throw new Error('rule path must never call model'); } });
  A('编辑后重分类 → route_decided（新 decision，0 次模型外发）', classifyEdit.status === 'route_decided' && classifyEdit.modelCalls === 0);
  const newAlloc = classifyEdit.status === 'route_decided'
    ? (await asPrincipal(pool, rec, (c) => c.query('SELECT allocations FROM job_route_decision WHERE id=$1', [classifyEdit.decisionId])))
    : null;
  A('新 decision 路由到 backend/java（岗位路线确已改变）',
    newAlloc !== null && (newAlloc.rows[0]?.allocations ?? []).some((a: { leafTrackId?: string }) => a.leafTrackId === JAVA_LEAF));
  const snapshotAfter = await asPrincipal(pool, cand, (c) => getInterviewRouteSnapshot(c, cand, interviewId!));
  A('旧 snapshot 不受并发编辑影响（routeDigest/allocations 仍 nodejs，不可变）',
    !!snapshotAfter && snapshotAfter.routeDigest === snapshot!.routeDigest
    && snapshotAfter.allocations.length === 1 && snapshotAfter.allocations[0]!.leafTrackId === NODEJS_LEAF);
  const planEdited = mkPlan(snapshot!, generationId, JAVA_LEAF, { competencyId: 'concurrency-edit' });
  const rEdited = await dispatchTrackLocalRetrieval(pool, cand, planEdited, { query: JAVA_PROMPT, embedderVersion: EMBEDDER_ID, k: 5, embed: embedSeam, cache: new MemoryQbankCache() });
  A('编辑后 java leaf plan 打旧 nodejs snapshot → rejected（零跨域出题）',
    rEdited.status === 'rejected' && rEdited.reason.startsWith('planner_leaf_not_in_snapshot'));

  console.log(`\n${fail === 0 ? '✓ rag04-track-local（真 Postgres）全部通过' : `✗ ${fail} 项失败`}`);
  await pool.end();
  process.exit(fail ? 1 : 0);
}

main().catch(async (err) => {
  console.error(err);
  await pool.end().catch(() => undefined);
  process.exit(1);
});
