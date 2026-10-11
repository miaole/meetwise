/**
 * H2 QBANK-CORPUS proof(真隔离 PostgreSQL + 全迁移链)·§5.2/§5.3/§5.4/§5.5/§5.6 db 面。
 *
 * 覆盖(REQUEST h2-qbank-corpus §5 验收单):
 *  - §5.2 导入 prove:导入件全链路(build→validate→逐题 rubric 互异→治理入库→published)·非法输入拒面
 *    (qbank-ingest 校验逐条触发)·seed_v1_reviewed 既有通道语义不回归·逐题撰写断言(#76:同 competency
 *    N 题 rubric/follow_up/anti_pattern chunk 内容互异)。
 *  - §5.3 难度谱 prove:1-5 全谱入库存真(DB CHECK 既有)+ 池级过滤谓词(候选池过滤后零非目标难度命中,
 *    前置证据=同 scope ANN 候选含两难度题)·空池(filteredEmpty)→ 显式 degraded 语义位,非发明。
 *  - §5.4 近重复门 prove:规范化+shingle 阈值命中(含 seed:limit-3/seed:design-2 对如实命中)+
 *    复核队列不静默(命中列表非弃置,CLI plan/commit 双门消费)+ 零 embedding 依赖(纯文本扫描,
 *    向量 seam 仅接口缝,注入才出现 vector_seam 通道)。
 *  - §5.5 已问排除 prove:同 interview 二轮不重现 refId(0162 served-ref 同事务登记 + Phase 4.5 过滤)。
 *  - §5.6 #202 切面 db 面:B 端岗位面回归(旧表优先轨)零翻 + 候选人路由读(candidate snapshot→命中形)。
 *    (route_snapshot_missing 逐字/永不 unscoped/crag.ts 零 diff 由 worker prove + 静态门承载。)
 *
 * 真实 embedding 用确定性替身 seam(proof 内联 512 维 sha256 向量,零模型外呼·est live=0);
 * Redis 热缓存用进程内契约替身。 pnpm qbank-corpus:prove (node scripts/run-e2e-isolated.mjs qbank-corpus:prove)
 */
import { createHash, randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import {
  assertIsolatedTestTarget, createPool, asPrincipal, asQbankControlExecutor,
  loadMigrations, runMigrations,
  createJob, classifyJobRoute, applyToJob, startApplicationInterview, getInterviewRouteSnapshot,
  getInterviewRouteSnapshotForAdaptiveRole,
  ingestQbank, ingestQuestionBankArtifacts, dispatchTrackLocalRetrieval, hybridQbankSearch,
  listServedQbankQuestionRefs, readRouteScopeNegativeResult,
  normalizeCorpusText, normalizedCorpusHash, charShingles, shingleJaccard, scanNearDuplicates,
  assertPerQuestionCoachingDistinct, buildQuestionArtifact, validateQuestionArtifacts,
  NEAR_DUP_JACCARD_THRESHOLD, NEAR_DUP_SHINGLE_N,
  type QbankEmbedder, type QbankQuestionArtifact, type QbankRetrievalCacheBackend,
  type QbankRetrievalCacheAddress, type QbankRetrievalCacheLock, type QbankRetrievalHit,
  type InterviewRouteSnapshotView,
} from '../src/index.ts';
import {
  deriveRouteScopeDigest, RETRIEVAL_POLICY_VERSION, JOB_ROUTE_TAXONOMY_VERSION, CANDIDATE_ROUTE_REVISION,
  type RetrievalPlan,
} from '@meetwise/domain';

// run-e2e-isolated.mjs 会剥离操作者 shell 里的真实 HMAC 密钥；proof 用固定测试键（≥32 字符）。
process.env.RAG_QBANK_CACHE_HASH_KEY = 'h2q-qbank-corpus-cache-hmac-proof-key-not-production-1';
process.env.RAG_JOB_ROUTE_INPUT_HASH_KEY = 'h2q-qbank-corpus-job-route-input-hmac-proof-key-not-production';

const pool = createPool();
let fail = 0;
const A = (name: string, ok: boolean, detail = '') => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  [${detail}]` : ''}`); if (!ok) fail++; };
const section = (t: string) => console.log(`\n──────── ${t} ────────`);

/* ─────────────────────────── 确定性 embedder seam（零模型外呼） ─────────────────────────── */
const DIM = 512;
const EMBEDDER_ID = 'h2q-corpus-proof-embedder:v1';

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
const embedSeam = async (texts: string[]) => texts.map(deterministicVector);

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
}

/* ─────────────────────────── 语料 fixture ─────────────────────────── */
// 检索面语料:backend/nodejs 叶两题,难度 2/3(池级过滤谓词 + 已问排除的承重样本)。
const NODEJS_LEAF = 'backend/nodejs';
const QA_ID = 'corpus_q_a';
const QB_ID = 'corpus_q_b';
const QA_DIFF = 2;
const QB_DIFF = 3;

const qaArtifact: QbankQuestionArtifact = {
  id: QA_ID, competency: 'concurrency', difficulty: QA_DIFF,
  taxonomyVersion: JOB_ROUTE_TAXONOMY_VERSION, servingScopeId: NODEJS_LEAF, annotationSource: 'seed_v1_reviewed',
  chunks: [
    { refId: 'corpus_qa_prompt', text: 'Design an event loop backpressure strategy for a Node.js stream pipeline.', role: 'prompt', ordinal: 0, required: true },
    { refId: 'corpus_qa_rubric', text: 'Candidate quantifies highWaterMark tradeoffs and backpressure propagation.', role: 'rubric', ordinal: 1, required: true },
    { refId: 'corpus_qa_example', text: 'A readable piped into a slow transform with explicit drain handling.', role: 'example', ordinal: 2, required: false },
  ],
};
const qbArtifact: QbankQuestionArtifact = {
  id: QB_ID, competency: 'concurrency', difficulty: QB_DIFF,
  taxonomyVersion: JOB_ROUTE_TAXONOMY_VERSION, servingScopeId: NODEJS_LEAF, annotationSource: 'seed_v1_reviewed',
  chunks: [
    { refId: 'corpus_qb_prompt', text: 'Reason about worker thread pool starvation in a compute heavy Node.js service.', role: 'prompt', ordinal: 0, required: true },
    { refId: 'corpus_qb_rubric', text: 'Candidate separates event loop blocking from pool saturation and gives a mitigation.', role: 'rubric', ordinal: 1, required: true },
    { refId: 'corpus_qb_example', text: 'Moving pbkdf2 hashing off the main loop with a bounded worker queue.', role: 'example', ordinal: 2, required: false },
  ],
};
// 已问排除按题粒度样本:QC(d2)与 QD(d3)在第一轮不 served(用独立 competency 派发避免命中),
// 用于证明排除只作用于已 served 题、不误伤同池未 served 题。
const QC_ID = 'corpus_q_c';
const QD_ID = 'corpus_q_d';
const qcArtifact: QbankQuestionArtifact = {
  id: QC_ID, competency: 'concurrency', difficulty: QA_DIFF,
  taxonomyVersion: JOB_ROUTE_TAXONOMY_VERSION, servingScopeId: NODEJS_LEAF, annotationSource: 'seed_v1_reviewed',
  chunks: [
    { refId: 'corpus_qc_prompt', text: 'Explain how Node.js stream backpressure differs from HTTP-level flow control.', role: 'prompt', ordinal: 0, required: true },
    { refId: 'corpus_qc_rubric', text: 'Candidate distinguishes transport windows from application-level pauses and drains.', role: 'rubric', ordinal: 1, required: true },
    { refId: 'corpus_qc_example', text: 'A proxy that propagates slow clients back into socket reads.', role: 'example', ordinal: 2, required: false },
  ],
};
const qdArtifact: QbankQuestionArtifact = {
  id: QD_ID, competency: 'concurrency', difficulty: QB_DIFF,
  taxonomyVersion: JOB_ROUTE_TAXONOMY_VERSION, servingScopeId: NODEJS_LEAF, annotationSource: 'seed_v1_reviewed',
  chunks: [
    { refId: 'corpus_qd_prompt', text: 'Diagnose a Node.js service where cluster workers serve uneven request latencies.', role: 'prompt', ordinal: 0, required: true },
    { refId: 'corpus_qd_rubric', text: 'Candidate rules out skew from sticky sessions, GC pauses and shared pool contention.', role: 'rubric', ordinal: 1, required: true },
    { refId: 'corpus_qd_example', text: 'An instrumented rollout revealing one worker pinned by a noisy neighbor.', role: 'example', ordinal: 2, required: false },
  ],
};
// QE(d4)整场不派发(served 集永不含它)——按题粒度反证:排除不误伤未 served 题。
const QE_ID = 'corpus_q_e';
const qeArtifact: QbankQuestionArtifact = {
  id: QE_ID, competency: 'concurrency', difficulty: 4,
  taxonomyVersion: JOB_ROUTE_TAXONOMY_VERSION, servingScopeId: NODEJS_LEAF, annotationSource: 'seed_v1_reviewed',
  chunks: [
    { refId: 'corpus_qe_prompt', text: 'Design a graceful degradation path for a Node.js gateway under upstream overload.', role: 'prompt', ordinal: 0, required: true },
    { refId: 'corpus_qe_rubric', text: 'Candidate ranks degraded modes by blast radius and states recovery verification.', role: 'rubric', ordinal: 1, required: true },
    { refId: 'corpus_qe_example', text: 'A shed-load switch toggled by queue depth with canary verification.', role: 'example', ordinal: 2, required: false },
  ],
};

// §5.3 谱扩容语料:backend/general 叶五题 difficulty 1..5(1-5 全谱入库存真,DB CHECK 既有)。
const spectrumImportItems = [1, 2, 3, 4, 5].map((d, i) => ({
  refId: `spectrum:d${d}`,
  text: `谱样题${d}:第${i + 1}道自撰通用能力题,难度档位${d},措辞独立成题。`,
  competency: '工程谱样',
  difficulty: d,
  servingScopeId: 'backend/general',
  annotationSource: 'curator_reviewed' as const,
  rubric: `谱样${d}评分锚点:逐题撰写,互不复制(难度${d})。`,
  followUp: `谱样${d}追问:逐题撰写(${d})。`,
  antiPattern: `谱样${d}失分点:逐题撰写(${d})。`,
}));

/* ─────────────────────────── generation 构建(内联 worker 流程·rag04 同形) ─────────────────────────── */
const RECIPE_MANIFEST = {
  schema: 'qbank-embedding-recipe:v1',
  provider: 'openai-compatible',
  model: EMBEDDER_ID,
  providerRevision: 'h2q-corpus-proof-unverified',
  dimensions: DIM,
  chunkerVersion: 'whole-qbank-item:v1',
  normalizationVersion: 'utf8-nfc-trim:v1',
  documentPrefixVersion: 'none:v1',
  queryPrefixVersion: 'none:v1',
} as const;
const recipeHash = createHash('sha256').update(JSON.stringify(RECIPE_MANIFEST)).digest('hex');
const recipeId = 'qrecipe-' + recipeHash.slice(0, 32);

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

async function snapshotFacts(): Promise<{ epoch: string; facts: { refId: string; contentHash: string; content: string; taxonomyVersion: string; servingScopeId: string }[] }> {
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
    const facts = rows.rows.map((r: any) => ({
      refId: String(r.ref_id), contentHash: String(r.content_hash), content: String(r.content),
      taxonomyVersion: String(r.taxonomy_version), servingScopeId: String(r.serving_scope_id),
    }));
    const unrouted = facts.find((f) => !f.taxonomyVersion || !f.servingScopeId);
    if (unrouted) throw new Error(`qbank_generation_unrouted_chunk_without_serving_scope:${unrouted.refId}`);
    return { epoch: String(epoch.rows[0].epoch), facts };
  });
}

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

/* ─────────────────────────── B 端岗位链 fixture（旧 recruiter snapshot·rag04 同形） ─────────────────────────── */
const TAG = 'h2qcorpus_' + Math.random().toString(36).slice(2, 8);
const rec = `${TAG}_rec`, cand = `${TAG}_cand`;
const resumeCand = randomUUID();

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

function qids(results: readonly { ref: string }[]): string[] { return results.map((x) => x.ref); }

/** 校验错误名断言:捕获并比对错误消息前缀(冒号前),避免「任何错都算门生效」假绿。 */
async function errPrefix(fn: () => unknown | Promise<unknown>): Promise<string> {
  try {
    await fn();
    return '(no-throw)';
  } catch (e) {
    return String((e as Error).message).split(':')[0] ?? '(no-message)';
  }
}

async function main() {
  await runMigrations(pool, loadMigrations(fileURLToPath(new URL('../migrations', import.meta.url))));
  await assertIsolatedTestTarget(pool);
  await pool.query("INSERT INTO resume(id, owner_user_id, status, content_sha) VALUES ($1,$2,'ingested',$3)", [resumeCand, cand, `${TAG}:${cand}`]);

  /* ── §5.2 导入 prove:结构校验面(qbank-ingest 校验逐条触发) ── */
  section('§5.2a 导入件结构校验拒面(非法输入逐条·qbank-ingest :300-322 全接)');
  const good = buildQuestionArtifact(spectrumImportItems[0]!);
  A('buildQuestionArtifact:四 chunk·prompt/rubric required·逐题三件套入 chunk', good.chunks.length === 4
    && good.chunks.some((c) => c.role === 'prompt' && c.required === true)
    && good.chunks.some((c) => c.role === 'rubric' && c.required === true)
    && good.chunks.some((c) => c.role === 'follow_up' && c.text.includes(spectrumImportItems[0]!.followUp.slice(0, 8)))
    && good.chunks.some((c) => c.role === 'anti_pattern'));
  A('validateQuestionArtifacts:合法谱样件 PASS', (validateQuestionArtifacts([good]), true));
  const withChunks = (id: string, mutate: (a: QbankQuestionArtifact) => void): QbankQuestionArtifact => {
    const base = buildQuestionArtifact(spectrumImportItems[1]!);
    const clone: QbankQuestionArtifact = JSON.parse(JSON.stringify(base));
    clone.id = id;
    mutate(clone);
    return clone;
  };
  const cases: [string, QbankQuestionArtifact, string][] = [
    ['非法 id', withChunks('bad id!', () => undefined), 'qbank_question_invalid_id'],
    ['重复 id', withChunks('spectrum:dup', () => undefined), 'qbank_question_invalid_id'],
    ['空 competency', withChunks('spectrum:c1', (a) => { a.competency = ' '; }), 'qbank_question_invalid_competency'],
    ['difficulty 0', withChunks('spectrum:d0', (a) => { a.difficulty = 0; }), 'qbank_question_invalid_difficulty'],
    ['difficulty 6', withChunks('spectrum:d6', (a) => { a.difficulty = 6; }), 'qbank_question_invalid_difficulty'],
    ['非法 scope', withChunks('spectrum:s1', (a) => { a.servingScopeId = 'Bad/Scope'; }), 'qbank_invalid_serving_metadata'],
    ['chunk 数 <3', withChunks('spectrum:c2', (a) => { a.chunks = a.chunks.slice(0, 2); }), 'qbank_question_invalid_chunk_count'],
    ['重复 chunk ref', withChunks('spectrum:c3', (a) => { a.chunks[1]!.refId = a.chunks[0]!.refId; }), 'qbank_question_duplicate_or_invalid_ref'],
    ['空 chunk 文本', withChunks('spectrum:c4', (a) => { a.chunks[1]!.text = ' '; }), 'qbank_question_invalid_chunk_text'],
    ['非法 chunk role', withChunks('spectrum:c5', (a) => { (a.chunks[1] as { role: string }).role = 'nope'; }), 'qbank_question_invalid_chunk_role'],
    ['非法 ordinal', withChunks('spectrum:c6', (a) => { a.chunks[1]!.ordinal = -1; }), 'qbank_question_invalid_chunk_ordinal'],
    ['缺 rubric', withChunks('spectrum:c7', (a) => { a.chunks = a.chunks.filter((c) => c.role !== 'rubric'); }), 'qbank_question_requires_exact_prompt_and_rubric'],
    ['required 缺失', withChunks('spectrum:c8', (a) => { a.chunks[1]!.required = false; }), 'qbank_question_prompt_and_rubric_must_be_required'],
  ];
  const seen = new Set<string>();
  for (const [name, artifact, expected] of cases) {
    const actual = await errPrefix(() => validateQuestionArtifacts(artifact.id === 'spectrum:dup' ? [artifact, JSON.parse(JSON.stringify(artifact)) as QbankQuestionArtifact] : [artifact]));
    seen.add(actual);
    A(`拒面: ${name} → ${expected}`, actual === expected, actual);
  }
  // 11 个互异错误名:重复 id 与非法 id 共用 qbank_question_invalid_id 一码、difficulty 0/6 共用
  // qbank_question_invalid_difficulty 一码(设计内共用),余各一码。
  A('校验面逐条触发(11 个互异错误名)', seen.size === cases.length - 2, `${seen.size}/${cases.length - 2}`);

  section('§5.2b 逐题 rubric 互异(#76·同 competency N 题 chunk 内容互异)');
  A('谱样五题同 competency 逐题互异 PASS', (assertPerQuestionCoachingDistinct(spectrumImportItems.map(buildQuestionArtifact)), true));
  const shared = spectrumImportItems.map(buildQuestionArtifact);
  shared[1]!.chunks[1]!.text = shared[0]!.chunks[1]!.text;   // 复制 rubric → 必须拒
  const sharedErr = await errPrefix(() => assertPerQuestionCoachingDistinct(shared));
  A('共享 rubric → qbank_question_shared_coaching 拒绝(禁前缀共享复制)', sharedErr === 'qbank_question_shared_coaching', sharedErr);

  /* ── §5.4 近重复门 prove(纯文本·零 embedding 依赖) ── */
  section('§5.4a 规范化+shingle 近重复门(纯函数)');
  A('规范化:NFKC+小写+空白标点折叠', normalizeCorpusText('Ｈｅｌｌｏ,  World! 测试 ') === 'helloworld测试');
  const seedPair = scanNearDuplicates({ items: [
    { refId: 'seed:limit-3', text: '秒杀系统如何扛住瞬时高并发并严格防超卖,谈谈你的整体方案与权衡' },
    { refId: 'seed:design-2', text: '设计一个秒杀系统,如何扛住瞬时高并发并防超卖' },
  ] });
  const pairHit = seedPair.find((h) => h.method === 'shingle_jaccard');
  A(`seed:limit-3 ↔ seed:design-2 近重复对如实命中(shingle·n=${NEAR_DUP_SHINGLE_N})`, !!pairHit && pairHit.score >= NEAR_DUP_JACCARD_THRESHOLD,
    pairHit ? `score=${pairHit.score.toFixed(3)} threshold=${NEAR_DUP_JACCARD_THRESHOLD}` : 'MISS');
  const nonDup = scanNearDuplicates({ items: [
    { refId: 'seed:design-1', text: '设计一个短链系统,谈谈发号、存储与高可用' },
    { refId: 'seed:design-3', text: '设计一个支持千万级用户的 feed 流,推模式拉模式怎么选' },
  ] });
  A('同域非重复对不误报(design-1 vs design-3)', nonDup.length === 0, `jaccard=${shingleJaccard('设计一个短链系统,谈谈发号、存储与高可用', '设计一个支持千万级用户的 feed 流,推模式拉模式怎么选').toFixed(3)}`);
  const normDup = scanNearDuplicates({ items: [
    { refId: 'norm:x1', text: '分布式锁, 如何防误删?' },
    { refId: 'norm:x2', text: '分布式锁如何防误删？' },
  ] });
  A('规范化精确命中(标点/全半角变体)→ exact_normalized score=1', normDup.some((h) => h.method === 'exact_normalized' && h.score === 1));
  A('shingle 集与 Jaccard 形状(0..1)', shingleJaccard('abcde', 'abcde') === 1 && shingleJaccard('abcde', 'vwxyz') === 0
    && charShingles('ab').size === 1 && normalizedCorpusHash('A, B') === normalizedCorpusHash('a b'));
  const seamHits = scanNearDuplicates({ items: [
    { refId: 'seam:p', text: '纯文本甲' }, { refId: 'seam:q', text: '纯文本乙' },
  ], vectorSeam: { nearDuplicate: (t) => (t === '纯文本甲' ? [{ score: 0.91, hitRefId: 'seam:q' }] : []) } });
  A('向量 seam 仅接口缝:注入才出现 vector_seam 通道(本刀零 embedding 实现)', seamHits.some((h) => h.method === 'vector_seam' && h.score === 0.91));
  const noSeam = scanNearDuplicates({ items: [{ refId: 's:1', text: '题面一' }, { refId: 's:2', text: '题面二' }] });
  A('零 embedding 依赖:缺省 seam 纯文本扫描可独立运行', Array.isArray(noSeam) && noSeam.length === 0);

  /* ── §5.2c 导入件全链路(治理路径入库)+ seed 通道不回归 ── */
  section('§5.2c 导入件全链路(propose→approve→promote→published)·seed_v1_reviewed 通道不回归');
  const importArtifacts = spectrumImportItems.map(buildQuestionArtifact);
  const ingestOut = await ingestQuestionBankArtifacts(pool, importArtifacts, embedder);
  A('谱样五题(d1-d5)治理入库:questions=5 chunks=20', ingestOut.questionCount === 5 && ingestOut.chunkCount === 20,
    `${ingestOut.questionCount}/${ingestOut.chunkCount}`);
  const spectrumRows = await asQbankControlExecutor(pool, async (c) => {
    const r = await c.query(
      `SELECT difficulty, count(*)::int AS n FROM qbank_question WHERE id LIKE 'question:spectrum:%' GROUP BY difficulty ORDER BY difficulty`);
    return r.rows as { difficulty: number; n: number }[];
  });
  A('1-5 全谱入库存真(DB CHECK 既有·五档各 1)',
    spectrumRows.length === 5 && spectrumRows.every((r, i) => r.difficulty === i + 1 && r.n === 1),
    JSON.stringify(spectrumRows));
  const publishedStates = await asQbankControlExecutor(pool, async (c) =>
    (await c.query("SELECT state, count(*)::int AS n FROM qbank_question WHERE id LIKE 'question:spectrum:%' GROUP BY state")).rows);
  A('导入件全部 published(治理路径完整)', publishedStates.length === 1 && publishedStates[0]!.state === 'published' && publishedStates[0]!.n === 5);
  const seeded = await ingestQbank(pool, [{
    refId: 'h2q:legacy-channel-probe', text: '自撰通道探针题:seed_v1_reviewed 既有通道语义保持验证(非题库内容,仅通道断言)。',
    taxonomyVersion: JOB_ROUTE_TAXONOMY_VERSION, servingScopeId: NODEJS_LEAF, annotationSource: 'seed_v1_reviewed',
  }], embedder);
  A('seed_v1_reviewed 既有通道语义不回归(ingestQbank 通道写入)', seeded === 1, `wrote=${seeded}`);
  const channelState = await asQbankControlExecutor(pool, async (c) =>
    String((await c.query("SELECT status FROM qbank_source WHERE uri='seed://h2q:legacy-channel-probe'")).rows[0]?.status));
  A('seed 通道源状态=approved(既有自动审批语义保持)', channelState === 'approved', channelState);

  /* ── §5.2d 导入 CLI 全链(子进程实跑:plan→复核位拦截→带位 commit) ── */
  section('§5.2d 导入 CLI(plan/commit 双模式·复核位拦截与放行)');
  {
    const { writeFileSync, rmSync } = await import('node:fs');
    const { execFileSync } = await import('node:child_process');
    const os = await import('node:os');
    const path = await import('node:path');
    const cliCorpus = {
      // 独立叶(backend/go·已释放):与 nodejs 检索夹具隔离,难度过滤断言不被 CLI 语料污染。
      servingScopeId: 'backend/go',
      annotationSource: 'curator_reviewed',
      items: [
        { refId: 'cli:dup-a', text: '秒杀系统如何扛住瞬时高并发并严格防超卖,谈谈你的整体方案与权衡', competency: '系统设计', difficulty: 3, rubric: 'A 评分锚', followUp: 'A 追问', antiPattern: 'A 失分' },
        { refId: 'cli:dup-b', text: '设计一个秒杀系统,如何扛住瞬时高并发并防超卖', competency: '系统设计', difficulty: 3, rubric: 'B 评分锚', followUp: 'B 追问', antiPattern: 'B 失分' },
        { refId: 'cli:clean', text: '自撰导入冒烟题:CLI commit 通道全链验证(措辞独立,非抄录)', competency: '系统设计', difficulty: 2, rubric: 'C 评分锚', followUp: 'C 追问', antiPattern: 'C 失分' },
      ],
    };
    const corpusPath = path.join(os.tmpdir(), `h2q-cli-corpus-${randomUUID().slice(0, 8)}.json`);
    writeFileSync(corpusPath, JSON.stringify(cliCorpus, null, 2), 'utf8');
    const runCli = (args: string[]): number => {
      try {
        execFileSync(process.execPath, ['--import', 'tsx', 'scripts/qbank-import.cli.ts', ...args],
          { cwd: fileURLToPath(new URL('../../..', import.meta.url)), env: process.env, stdio: 'pipe' });
        return 0;
      } catch (e) {
        return Number((e as { status?: number }).status ?? 1);
      }
    };
    A('CLI plan(零写库)EXIT=0+近重复命中列入待审', runCli(['plan', '--file', corpusPath]) === 0);
    const commitGate = runCli(['commit', '--file', corpusPath, '--embedder', 'mock']);
    A('CLI commit 近重复命中未确认 → 复核位拦截 EXIT=2(#78 不静默拒不静默灌)', commitGate === 2, `exit=${commitGate}`);
    const commitOk = runCli(['commit', '--file', corpusPath, '--embedder', 'mock', '--accept-near-duplicate']);
    A('CLI commit 人工复核确认后放行 EXIT=0(治理路径入库)', commitOk === 0, `exit=${commitOk}`);
    const cliRows = await asQbankControlExecutor(pool, async (c) =>
      (await c.query("SELECT count(*)::int AS n FROM qbank_question WHERE id IN ('question:cli:dup-a','question:cli:dup-b','question:cli:clean')")).rows[0]?.n);
    A('CLI 导入三题落库 published', cliRows === 3, `rows=${cliRows}`);
    rmSync(corpusPath, { force: true });
  }

  /* ── 检索面语料 + generation ── */
  section('0. 检索面语料(nodejs 叶 d2×2 + d3×2 + d4×1 五题)+ generation 构建 + B 端岗位链');
  const ingest2 = await ingestQuestionBankArtifacts(pool, [qaArtifact, qbArtifact, qcArtifact, qdArtifact, qeArtifact], embedder);
  A('nodejs 叶五题入库 5/15', ingest2.questionCount === 5 && ingest2.chunkCount === 15, `${ingest2.questionCount}/${ingest2.chunkCount}`);
  const generationId = await buildActiveGeneration();
  A('generation 构建并激活', /^qgen-[0-9a-f-]{36}$/.test(generationId));

  const job = await asPrincipal(pool, rec, (c) => createJob(c, rec, { title: 'Node.js 服务端工程师', description: '使用 NestJS 构建服务', competencies: ['nestjs', 'express', 'koa'] }));
  const classify = await classifyJobRoute(pool, rec, job.id, await maxRev(job.id), { modelClassify: async () => { throw new Error('rule path must never call model'); } });
  A('岗位 rule 路径 route_decided(0 次模型外发)', classify.status === 'route_decided');
  const app = await asPrincipal(pool, cand, (c) => applyToJob(c, cand, job.id));
  const started = await asPrincipal(pool, cand, (c) => startApplicationInterview(c, cand, app!.applicationId, resumeCand));
  const interviewId = started.status === 'started' || started.status === 'reused' ? started.interviewId : undefined;
  const snapshot = interviewId ? await asPrincipal(pool, cand, (c) => getInterviewRouteSnapshot(c, cand, interviewId)) : null;
  A('B 端面试落旧表 snapshot(单叶 backend/nodejs)', !!snapshot && snapshot!.allocations.length === 1 && snapshot!.allocations[0]!.leafTrackId === NODEJS_LEAF);

  /* ── §5.3 池级难度过滤谓词 ── */
  section('§5.3 池级难度过滤(候选池过滤后零非目标难度命中·非查询文本拼接)');
  const scopedSearch = await asPrincipal(pool, cand, (c) => hybridQbankSearch(c, {
    query: qaArtifact.chunks[0]!.text, embedding: deterministicVector(qaArtifact.chunks[0]!.text), k: 10,
    expectedRecipeId: recipeId, retrievalMode: 'dense',
    scope: { taxonomyVersion: JOB_ROUTE_TAXONOMY_VERSION, servingScopeId: NODEJS_LEAF },
  }));
  const scopedRefs = scopedSearch.map((h) => h.refId);
  A('前置证据:同 scope ANN 候选同时含 d2 与 d3 题 chunk(过滤前)', scopedRefs.some((r) => r.startsWith('corpus_qa')) && scopedRefs.some((r) => r.startsWith('corpus_qb')),
    `${scopedRefs.length} hits`);
  const planD2 = mkPlan(snapshot!, generationId, NODEJS_LEAF, { difficulty: QA_DIFF, competencyId: 'concurrency-d2' });
  const rD2 = await dispatchTrackLocalRetrieval(pool, cand, planD2, { query: 'concurrency-d2 难度2', embedderVersion: EMBEDDER_ID, k: 20, embed: embedSeam, cache: new MemoryQbankCache() });
  A('difficulty=2 派发 → 仅 d2 题(零非目标难度命中)', rD2.status === 'served'
    && qids(rD2.status === 'served' ? rD2.results : []).length >= 1
    && qids(rD2.status === 'served' ? rD2.results : []).every((q) => q === QA_ID || q === QC_ID),
    qids(rD2.status === 'served' ? rD2.results : []).join(','));
  const planD3 = mkPlan(snapshot!, generationId, NODEJS_LEAF, { difficulty: QB_DIFF, competencyId: 'concurrency-d3' });
  const rD3 = await dispatchTrackLocalRetrieval(pool, cand, planD3, { query: 'concurrency-d3 难度3', embedderVersion: EMBEDDER_ID, k: 20, embed: embedSeam, cache: new MemoryQbankCache() });
  A('difficulty=3 派发 → 仅 d3 题', rD3.status === 'served'
    && qids(rD3.status === 'served' ? rD3.results : []).length >= 1
    && qids(rD3.status === 'served' ? rD3.results : []).every((q) => q === QB_ID || q === QD_ID),
    qids(rD3.status === 'served' ? rD3.results : []).join(','));
  const planD5 = mkPlan(snapshot!, generationId, NODEJS_LEAF, { difficulty: 5, competencyId: 'concurrency-d5' });
  const rD5 = await dispatchTrackLocalRetrieval(pool, cand, planD5, { query: 'concurrency-d5 难度5', embedderVersion: EMBEDDER_ID, k: 10, embed: embedSeam, cache: new MemoryQbankCache() });
  A('空池(难度5 无题)→ served 空 + filteredEmpty=true(degraded 语义位·非发明)',
    rD5.status === 'served' && rD5.results.length === 0 && rD5.filteredEmpty === true);
  const negAfterD5 = await readRouteScopeNegativeResult(pool, cand, {
    routeScopeDigest: planD5.routeScopeDigest, leafTrackId: NODEJS_LEAF, taxonomyVersion: JOB_ROUTE_TAXONOMY_VERSION,
    generationId, recipeId, privacyEpoch: 0,
    aclDigest: 'a'.repeat(64),
  }, { privacyEpoch: 0 });
  A('空池不记 leaf 级负面 verdict(防毒化其他难度·rag06 facet 零触)', negAfterD5.status !== 'hit', String(negAfterD5.status));

  /* ── §5.5 已问排除(0162 同 interview 二轮不重现·按题粒度) ── */
  section('§5.5 已问排除(同 interview 二轮不重现 refId·refId 集合过滤最小形)');
  const servedAfterRound1 = interviewId ? await listServedQbankQuestionRefs(pool, cand, interviewId) : [];
  A('第一轮(d2/d3 served)登记 served-ref(与 serve 同事务)', servedAfterRound1.includes(QB_ID) && servedAfterRound1.includes(QD_ID)
    && servedAfterRound1.includes(QA_ID) && servedAfterRound1.includes(QC_ID),
    JSON.stringify(servedAfterRound1.sort()));
  const planD3R2 = mkPlan(snapshot!, generationId, NODEJS_LEAF, { difficulty: QB_DIFF, competencyId: 'concurrency-d3-round2' });
  const rD3R2 = await dispatchTrackLocalRetrieval(pool, cand, planD3R2, { query: 'concurrency-d3-round2 难度3', embedderVersion: EMBEDDER_ID, k: 20, embed: embedSeam, cache: new MemoryQbankCache() });
  A('同 interview 二轮(d3·新 plan 键)→ 已 served 题被排除,候选滤空', rD3R2.status === 'served' && rD3R2.results.length === 0 && rD3R2.filteredEmpty === true);
  const planD2R2 = mkPlan(snapshot!, generationId, NODEJS_LEAF, { difficulty: QA_DIFF, competencyId: 'concurrency-d2-round2' });
  const rD2R2 = await dispatchTrackLocalRetrieval(pool, cand, planD2R2, { query: 'concurrency-d2-round2 难度2', embedderVersion: EMBEDDER_ID, k: 20, embed: embedSeam, cache: new MemoryQbankCache() });
  A('d2 全部已 served → 二轮滤空(排除不因难度放宽而失效)', rD2R2.status === 'served' && rD2R2.results.length === 0 && rD2R2.filteredEmpty === true);
  const planD4R2 = mkPlan(snapshot!, generationId, NODEJS_LEAF, { difficulty: 4, competencyId: 'concurrency-d4-round2' });
  const rD4R2 = await dispatchTrackLocalRetrieval(pool, cand, planD4R2, { query: 'concurrency-d4-round2 难度4', embedderVersion: EMBEDDER_ID, k: 20, embed: embedSeam, cache: new MemoryQbankCache() });
  A('排除按题粒度:未 served 的 d4 题不被误伤(排除集仅含已 served 题)', rD4R2.status === 'served'
    && qids(rD4R2.status === 'served' ? rD4R2.results : []).length === 1 && qids(rD4R2.results)[0] === QE_ID,
    qids(rD4R2.status === 'served' ? rD4R2.results : []).join(','));

  /* ── §5.6 #202 切面 db 面:B 端旧表优先轨零回归 + 候选人路由读 ── */
  section('§5.6 #202 切面 db 面(B 端旧表优先轨零回归·candidate fallback 读形)');
  const snapOld = interviewId ? await asPrincipal(pool, cand, (c) => getInterviewRouteSnapshot(c, cand, interviewId!)) : null;
  const snapDual = interviewId ? await asPrincipal(pool, cand, (c) => getInterviewRouteSnapshotForAdaptiveRole(c, cand, interviewId!)) : null;
  A('B 端(旧表行在)双轨读=旧表直读(旧表优先轨零回归)',
    !!snapOld && !!snapDual && snapOld!.jobId === snapDual!.jobId && snapOld!.revision === snapDual!.revision
    && snapOld!.routeDigest === snapDual!.routeDigest && snapOld!.decisionId === snapDual!.decisionId
    && JSON.stringify(snapOld!.allocations) === JSON.stringify(snapDual!.allocations));
  const cResume = randomUUID();
  const cInterview = `h2q-cand-${randomUUID().slice(0, 8)}`;
  await pool.query("INSERT INTO resume(id, owner_user_id, status, content_sha) VALUES ($1,$2,'ingested',$3)", [cResume, cand, `${TAG}:${cResume}`]);
  const candEpoch = Number((await pool.query('SELECT privacy_epoch FROM resume WHERE id=$1', [cResume])).rows[0]?.privacy_epoch ?? 0);
  await pool.query(
    "INSERT INTO interview(id,owner_user_id,status,resume_id,resume_privacy_epoch) VALUES ($1,$2,'created',$3,$4)",
    [cInterview, cand, cResume, candEpoch],
  );
  // C 侧 fixture 直插 0142 两行(本 proof 断言的是**读侧适配**,非 supply 写侧——写侧归 domain candidate-route prove):
  // decision(id/UNIQUE interview_id/sha hex/leaf 语法/bps=10000) + snapshot(PK interview_id/status 单值)。
  const cLeaf = 'backend/java';
  const cDecisionId = `cprd-${randomUUID()}`;
  await asPrincipal(pool, cand, async (c) => {
    await c.query(
      `INSERT INTO candidate_profile_route_decision(
         id,interview_id,owner_user_id,resume_id,resume_content_sha,input_digest,
         taxonomy_version,policy_version,route_outcome,attempt_outcome,leaf_track_id,allocation_bps,decision_hash)
       VALUES ($1,$2,$3,$4,$5,$6,'v1','candidate-profile-rule:v1','route_decided','rule_decided',$7,10000,$8)`,
      [cDecisionId, cInterview, cand, cResume, 'b'.repeat(64), 'c'.repeat(64), cLeaf, 'd'.repeat(64)],
    );
    await c.query(
      `INSERT INTO candidate_profile_route_snapshot(
         interview_id,candidate_user_id,decision_id,resume_content_sha,input_digest,
         taxonomy_version,leaf_track_id,allocation_bps,status)
       VALUES ($1,$2,$3,$4,$5,'v1',$6,10000,'interview_snapshotted')`,
      [cInterview, cand, cDecisionId, 'b'.repeat(64), 'c'.repeat(64), cLeaf],
    );
  });
  const snapCand = await asPrincipal(pool, cand, (c) => getInterviewRouteSnapshotForAdaptiveRole(c, cand, cInterview));
  A('candidate fallback 读命中·形如实登记:jobId="" · revision=常量 · routeDigest=input_digest·单 leaf',
    !!snapCand && snapCand!.jobId === '' && snapCand!.revision === CANDIDATE_ROUTE_REVISION
    && snapCand!.routeDigest === 'c'.repeat(64) && snapCand!.allocations.length === 1
    && snapCand!.allocations[0]!.leafTrackId === cLeaf);
  const snapCandOld = await asPrincipal(pool, cand, (c) => getInterviewRouteSnapshot(c, cand, cInterview));
  A('C 端旧表无行(直读=null——切面前该面必 route_snapshot_missing)', snapCandOld === null);
  const dispatchCand = await dispatchTrackLocalRetrieval(pool, cand, mkPlan(snapCand!, generationId, cLeaf, {
    difficulty: 1, competencyId: 'concurrency-candidate',
    routeScopeDigest: deriveRouteScopeDigest({ routeDigest: snapCand!.routeDigest, leafTrackId: cLeaf, taxonomyVersion: JOB_ROUTE_TAXONOMY_VERSION }),
  }), { query: 'concurrency-candidate 难度1', embedderVersion: EMBEDDER_ID, k: 10, embed: embedSeam, cache: new MemoryQbankCache() });
  A('candidate 路由 leaf 无题 → 真零候选空 serve(filteredEmpty 缺省=false·与滤空态区分)',
    dispatchCand.status === 'served' && dispatchCand.results.length === 0 && dispatchCand.filteredEmpty !== true,
    String(dispatchCand.status));

  console.log(`\n${fail === 0 ? 'H2 QBANK-CORPUS db 面 prove 全部通过' : `${fail} 个断言失败`}`);
  process.exit(fail === 0 ? 0 : 1);
}

void main();
