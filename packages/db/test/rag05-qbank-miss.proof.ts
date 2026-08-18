/**
 * RAG-FUNNEL-05 / LLM 同桶生成题 proof（真隔离 PostgreSQL + 全迁移链）。
 *
 * 承重证明：eligibility reader（RAG-04）对某已冻结 leaf 终态为 `no_eligible_in_scope`
 * （干净无合格题）时，`dispatchQbankMissGeneration` 在**同一 leaf** 由受控 seam 生成
 * **恰好一题**，绝不伪装成 QBank 证据、绝不写回 QBank/vector、绝不被评分/B 端聚合。
 *
 * 每条断言都打真 PG 行（非 mock 内存）：
 *  - 两阶段 durable 派发（planned →(CAS) dispatched →(CAS) result_persisted →(CAS)
 *    question_ready）唯一赢家才调模型（E1 派发≤1）；dispatched 是模型外发前的持久 claim。
 *  - result outbox（question_plan_event.result）承载 durable 生成结果：投影事务失败时恢复
 *    重投影而不重新生成（E4 exact-once）。
 *  - 四条承重原语落点：asPrincipal（RLS 隔离）/ CAS 状态机 / appendEvent（question_ready
 *    事件）/（lease 有意不用——派发≤1 由 CAS+epoch fence 承重）。
 *  - 真实模型外发是受控 seam（fake transport）；真实 embedding 用确定性替身（proof 内联
 *    512 维 sha256 向量，仅供 generation 构建，检索本身不在本 proof 范围）。
 *
 * pnpm rag05-qbank-miss:prove   (node scripts/run-e2e-isolated.mjs rag05-qbank-miss:prove:raw)
 */
import { createHash, randomUUID } from 'node:crypto';
import {
  assertIsolatedTestTarget, createPool, asPrincipal, asQbankControlExecutor,
  createJob, applyToJob, startApplicationInterview, classifyJobRoute, getInterviewRouteSnapshot,
  ingestQuestionBankArtifacts, publishQuestionRubric, dispatchQbankMissGeneration, cancelOpenInterviewQuestion,
  type QbankEmbedder, type QbankQuestionArtifact,
  type QbankMissModelInput, type QbankMissModelGenerate,
  type InterviewRouteSnapshotView,
} from '../src/index.ts';
import {
  deriveRouteScopeDigest, deriveNoEligibleVerdictDigest, deriveGeneratedQuestionDigest, deriveQuestionPlanKey,
  JOB_ROUTE_TAXONOMY_VERSION, QBANK_MISS_POLICY_VERSION,
  QBANK_MISS_SCORE_POLICY_VERSION, QBANK_MISS_PROMPT_POLICY_VERSION,
  QBANK_MISS_SCHEMA_POLICY_VERSION, QBANK_MISS_MODEL_POLICY_VERSION,
  type QuestionPlan, type QbankMissModelOutput,
} from '@meetwise/domain';

// run-e2e-isolated.mjs 会剥离操作者 shell 里的真实 HMAC 密钥；proof 用固定测试键（≥32 字符）。
process.env.RAG_JOB_ROUTE_INPUT_HASH_KEY = 'rag05-job-route-input-hmac-proof-key-not-production-01';
process.env.RAG_QBANK_CACHE_HASH_KEY = 'rag05-qbank-cache-hmac-proof-key-not-production-01';

const pool = createPool();
let fail = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) fail++; };
const section = (t: string) => console.log(`\n──────── ${t} ────────`);

/* ─────────────────────────── 确定性 embedder seam（仅 generation 构建用） ─────────────────────────── */
const DIM = 512;
const EMBEDDER_ID = 'rag05-proof-embedder:v1';

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
  dim: DIM, id: EMBEDDER_ID,
  embed: async (texts: string[]) => texts.map(deterministicVector),
};

/* ─────────────────────────── 题库 fixture（仅一个 leaf 一题，供 generation 有数据） ─────────────────────────── */
const NODEJS_LEAF = 'backend/nodejs';
const JAVA_LEAF = 'backend/java';
const JAVA_QID = 'java_q1';
const JAVA_PROMPT = 'Explain Java thread safety and the Java Memory Model for shared mutable state.';
const JAVA_RUBRIC = 'Candidate mentions happens-before, volatile, synchronized, and locks.';
const JAVA_EXAMPLE = 'A thread-safe counter implementation using synchronized blocks.';

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
  schema: 'qbank-embedding-recipe:v1', provider: 'openai-compatible', model: EMBEDDER_ID,
  providerRevision: 'rag05-proof-unverified', dimensions: DIM,
  chunkerVersion: 'whole-qbank-item:v1', normalizationVersion: 'utf8-nfc-trim:v1',
  documentPrefixVersion: 'none:v1', queryPrefixVersion: 'none:v1',
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

async function snapshotFacts(): Promise<{ epoch: string; facts: QbankFact[] }> {
  return asQbankControlExecutor(pool, async (c) => {
    const epoch = await c.query('SELECT epoch::text AS epoch FROM qbank_corpus_epoch WHERE singleton=true');
    if (epoch.rowCount !== 1) throw new Error('qbank_generation_epoch_missing');
    const rows = await c.query(
      `SELECT ch.ref_id, ch.content_hash, ch.content, cs.taxonomy_version, cs.serving_scope_id
         FROM qbank_chunk ch
         JOIN qbank_pool_entry pool
           ON pool.ref_id=ch.ref_id AND pool.source_id=ch.source_id AND pool.content_hash=ch.content_hash
         JOIN qbank_source source ON source.id=pool.source_id AND source.content_hash=pool.content_hash
         LEFT JOIN qbank_chunk_serving_scope cs ON cs.ref_id=ch.ref_id
        WHERE source.status='approved'
          AND (pool.content_hash=left(encode(digest(convert_to(ch.content, 'UTF8'), 'sha256'), 'hex'), 32)
            OR pool.content_hash=encode(digest(convert_to(ch.content, 'UTF8'), 'sha256'), 'hex'))
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

/* ─────────────────────────── 受控 fake 模型 seam ─────────────────────────── */
const defaultQuestionText = (competencyId: string) =>
  `Explain how a ${competencyId} interview should handle async error propagation in production.`;
const FOCUS = 'async error propagation';

const modelCalls: QbankMissModelInput[] = [];
let modelOutputOverride: QbankMissModelOutput | null = null;
const fakeModel: QbankMissModelGenerate = async (input) => {
  modelCalls.push(input);
  return modelOutputOverride ?? { question: defaultQuestionText(input.competencyId), focus: FOCUS, refs: [] };
};
const throwingModel = (code: string): QbankMissModelGenerate => async () => {
  throw Object.assign(new Error(code), { code });
};

/* ─────────────────────────── helpers ─────────────────────────── */
const TAG = 'rag05_' + Math.random().toString(36).slice(2, 8);
const rec = `${TAG}_rec`, cand = `${TAG}_cand`, cand2 = `${TAG}_cand2`;
const resumeCand = randomUUID(), resumeCand2 = randomUUID();
let rubricId = '';

async function maxRev(jobId: string): Promise<number> {
  const r = await pool.query('SELECT COALESCE(MAX(revision),0)::int AS n FROM job_semantic_revision WHERE job_id=$1', [jobId]);
  return r.rows[0]?.n ?? 0;
}

function mkPlan(snapshot: InterviewRouteSnapshotView, generationId: string, leafTrackId: string, privacyEpoch: number, overrides: Partial<QuestionPlan> = {}): QuestionPlan {
  return {
    snapshotId: snapshot.interviewId,
    routeScopeDigest: deriveRouteScopeDigest({ routeDigest: snapshot.routeDigest, leafTrackId, taxonomyVersion: JOB_ROUTE_TAXONOMY_VERSION }),
    leafTrackId,
    taxonomyVersion: JOB_ROUTE_TAXONOMY_VERSION,
    competencyId: 'concurrency',
    difficulty: 4,
    generationId,
    recipeId,
    noEligibleVerdictDigest: deriveNoEligibleVerdictDigest({ leafTrackId, taxonomyVersion: JOB_ROUTE_TAXONOMY_VERSION, generationId, recipeId }),
    blueprint: { focus: 'event loop and async error propagation' },
    rubricId,
    scorePolicyVersion: QBANK_MISS_SCORE_POLICY_VERSION,
    promptPolicyVersion: QBANK_MISS_PROMPT_POLICY_VERSION,
    schemaPolicyVersion: QBANK_MISS_SCHEMA_POLICY_VERSION,
    modelPolicyVersion: QBANK_MISS_MODEL_POLICY_VERSION,
    privacyEpoch,
    policyVersion: QBANK_MISS_POLICY_VERSION,
    language: 'en',
    ...overrides,
  };
}

async function planStatus(planId: string): Promise<string | undefined> {
  const r = await asPrincipal(pool, cand, (c) => c.query('SELECT status FROM question_plan WHERE id=$1', [planId]));
  return r.rows[0]?.status as string | undefined;
}
async function planCountByKey(planKey: string): Promise<number> {
  const r = await asPrincipal(pool, cand, (c) => c.query('SELECT count(*)::int n FROM question_plan WHERE plan_key=$1', [planKey]));
  return r.rows[0].n;
}
async function interviewQuestionCount(interviewId: string): Promise<number> {
  const r = await asPrincipal(pool, cand, (c) => c.query('SELECT count(*)::int n FROM interview_question WHERE interview_id=$1', [interviewId]));
  return r.rows[0].n;
}
async function questionReadyCount(interviewId: string, questionId: string): Promise<number> {
  const r = await asPrincipal(pool, cand, (c) => c.query(
    "SELECT count(*)::int n FROM interview_event WHERE stream_key=$1 AND kind='question_ready' AND event_key=$2",
    [interviewId, `question_ready:${questionId}`],
  ));
  return r.rows[0].n;
}
async function provenanceCountByPlan(planId: string): Promise<number> {
  const r = await asPrincipal(pool, cand, (c) => c.query('SELECT count(*)::int n FROM question_issue_provenance WHERE plan_id=$1', [planId]));
  return r.rows[0].n;
}

async function main() {
  await assertIsolatedTestTarget(pool);

  for (const [id, owner] of [[resumeCand, cand], [resumeCand2, cand2]] as const) {
    await pool.query("INSERT INTO resume(id, owner_user_id, status, content_sha) VALUES ($1,$2,'ingested',$3)", [id, owner, `${TAG}:${owner}`]);
  }

  section('0. 灌入一个 leaf（java）一题 + 构建激活 generation + 发布 rubric');
  const ingest = await ingestQuestionBankArtifacts(pool, [javaArtifact], embedder);
  A('灌入 1 题 / 3 chunk 成功', ingest.questionCount === 1 && ingest.chunkCount === 3);
  const generationId = await buildActiveGeneration();
  A('generation 构建并激活', /^qgen-[0-9a-f-]{36}$/.test(generationId));

  rubricId = (await asPrincipal(pool, cand, (c) => publishQuestionRubric(c, {
    questionId: 'gqm-template-concurrency', questionVersion: 1, rubricVersion: 1,
    competency: 'concurrency', difficulty: 4, languageScope: ['en'],
    questionContentHash: createHash('sha256').update('concurrency template').digest('hex'),
    criteria: [{ criterionId: 'c1', weight: 1, required: true }],
  }))).rubricId;
  A('rubric 发布成功（uuid）', /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(rubricId));

  // 招聘方 nodejs 岗位 → rule 分类 → 候选人申请 → 启动面试 → 不可变 snapshot。
  // nodejs leaf 未灌题 → 对 RAG-04 而言是 clean no_eligible_in_scope（零合格题）。
  const job = await asPrincipal(pool, rec, (c) => createJob(c, rec, { title: 'Node.js 服务端工程师', description: '使用 NestJS 构建服务', competencies: ['nestjs', 'express', 'koa'] }));
  const classify = await classifyJobRoute(pool, rec, job.id, await maxRev(job.id), { modelClassify: async () => { throw new Error('rule path must never call model'); } });
  A('岗位 rule 路径 route_decided（0 次模型外发）', classify.status === 'route_decided' && classify.attemptOutcome === 'rule_decided');
  const app = await asPrincipal(pool, cand, (c) => applyToJob(c, cand, job.id));
  const started = await asPrincipal(pool, cand, (c) => startApplicationInterview(c, cand, app!.applicationId, resumeCand));
  const interviewId = started.status === 'started' || started.status === 'reused' ? started.interviewId : undefined;
  const snapshot = await asPrincipal(pool, cand, (c) => getInterviewRouteSnapshot(c, cand, interviewId!));
  A('面试启动落不可变 snapshot（单叶 backend/nodejs）',
    !!snapshot && snapshot.allocations.length === 1 && snapshot.allocations[0]!.leafTrackId === NODEJS_LEAF);

  const epochRow = await asPrincipal(pool, cand, (c) => c.query('SELECT COALESCE(resume_privacy_epoch,0)::bigint AS e FROM interview WHERE id=$1', [interviewId!]));
  const privacyEpoch = Number(epochRow.rows[0].e);
  A('interview resume_privacy_epoch 已冻结（=1）', privacyEpoch === 1);

  const happyPlan = mkPlan(snapshot!, generationId, NODEJS_LEAF, privacyEpoch, { competencyId: 'concurrency' });
  const happyQuestion = defaultQuestionText('concurrency');
  const happyQuestionId = 'gqm-' + deriveGeneratedQuestionDigest(happyQuestion).slice(0, 32);

  section('① happy path：干净无题 → 模型=1 且同 leaf、scope/rubric/provenance 完整、同事务投影');
  modelOutputOverride = null;
  const before1 = modelCalls.length;
  const r1 = await dispatchQbankMissGeneration(pool, cand, happyPlan, { eligibility: 'no_eligible_in_scope', model: fakeModel, avoidDigests: [] });
  A('返回 question_ready + reviewStatus=review_required',
    r1.status === 'question_ready' && r1.reviewStatus === 'review_required');
  A('模型派发恰好 1 次', modelCalls.length - before1 === 1);
  const call1 = modelCalls.at(-1)!;
  A('模型 binding 只含冻结 leaf/competency/difficulty/blueprint/rubric/language/avoid（无 raw job/resume/answer/检索正文/自由 URL）',
    call1.leafTrackId === NODEJS_LEAF && call1.competencyId === 'concurrency' && call1.difficulty === 4
    && call1.blueprint.focus === 'event loop and async error propagation'
    && call1.rubricId === rubricId && call1.language === 'en'
    && Array.isArray(call1.avoidDigests) && call1.avoidDigests.length === 0
    && !('job' in call1) && !('resume' in call1) && !('answer' in call1) && !('evidence' in call1) && !('url' in call1));
  const iq1 = await asPrincipal(pool, cand, (c) => c.query(
    'SELECT question_id,state_version,turn,qkind,review_status,competency FROM interview_question WHERE interview_id=$1 AND question_id=$2',
    [interviewId, happyQuestionId]));
  A('interview_question 写入（qkind=llm_qbank_miss, review_status=review_required, state_version=1, turn=1）',
    iq1.rowCount === 1 && iq1.rows[0].qkind === 'llm_qbank_miss' && iq1.rows[0].review_status === 'review_required'
    && Number(iq1.rows[0].state_version) === 1 && Number(iq1.rows[0].turn) === 1);
  A('question_ready 业务事件已写（event_key 幂等）', await questionReadyCount(interviewId!, happyQuestionId) === 1);
  const prov1 = await asPrincipal(pool, cand, (c) => c.query(
    'SELECT origin,leaf_track_id,no_eligible_verdict_digest,question_digest,rubric_id,model_attempt FROM question_issue_provenance WHERE plan_id=$1',
    [r1.status === 'question_ready' ? r1.planId : '']));
  A('provenance(origin=llm_qbank_miss) 完整（仅脱敏 digest，rubric 绑定既有，model_attempt=1）',
    prov1.rowCount === 1 && prov1.rows[0].origin === 'llm_qbank_miss' && prov1.rows[0].leaf_track_id === NODEJS_LEAF
    && prov1.rows[0].no_eligible_verdict_digest === happyPlan.noEligibleVerdictDigest
    && prov1.rows[0].question_digest === deriveGeneratedQuestionDigest(happyQuestion)
    && prov1.rows[0].rubric_id === rubricId && Number(prov1.rows[0].model_attempt) === 1);
  A('plan 终态 = question_ready', await planStatus(r1.status === 'question_ready' ? r1.planId : '') === 'question_ready');
  const ev1 = await asPrincipal(pool, cand, (c) => c.query(
    'SELECT from_status,to_status FROM question_plan_event WHERE plan_id=$1 ORDER BY event_seq',
    [r1.status === 'question_ready' ? r1.planId : '']));
  A('outbox 状态序列 = planned→dispatched→result_persisted→question_ready（result outbox 承载 durable 结果）',
    ev1.rows.length === 3
    && ev1.rows[0].from_status === 'planned' && ev1.rows[0].to_status === 'dispatched'
    && ev1.rows[1].from_status === 'dispatched' && ev1.rows[1].to_status === 'result_persisted'
    && ev1.rows[2].from_status === 'result_persisted' && ev1.rows[2].to_status === 'question_ready');

  section('② 模型输出双重校验：schema/refs 非空/超短/引导/语言/去重 → 拒（产物=0 入业务）');
  const before2 = await interviewQuestionCount(interviewId!);
  const badCases: Array<{ tag: string; competencyId: string; output: QbankMissModelOutput; avoid?: string[]; reason: string }> = [
    { tag: 'schema 错（question 非字符串）', competencyId: 'concurrency-schema', output: { question: 123 as unknown as string, focus: 'f', refs: [] }, reason: 'invalid_schema' },
    { tag: 'refs 非空（模型不得引用 QBank/跨桶材料）', competencyId: 'concurrency-refs', output: { question: defaultQuestionText('concurrency-refs'), focus: FOCUS, refs: [{ refId: 'x' }] }, reason: 'refs_not_empty' },
    { tag: '超短（<10 字符）', competencyId: 'concurrency-short', output: { question: 'short', focus: 'f', refs: [] }, reason: 'question_length_out_of_range' },
    { tag: '引导性（内嵌答案标记）', competencyId: 'concurrency-leading', output: { question: 'What is the correct answer for async error handling? Explain.', focus: FOCUS, refs: [] }, reason: 'leading_question' },
    { tag: '语言不符（en 题面含 CJK）', competencyId: 'concurrency-lang', output: { question: '请描述异步事件循环中的错误传播方式。', focus: FOCUS, refs: [] }, reason: 'language_mismatch' },
  ];
  for (const bc of badCases) {
    modelOutputOverride = bc.output;
    const plan = mkPlan(snapshot!, generationId, NODEJS_LEAF, privacyEpoch, { competencyId: bc.competencyId });
    const r = await dispatchQbankMissGeneration(pool, cand, plan, { eligibility: 'no_eligible_in_scope', model: fakeModel, avoidDigests: bc.avoid ?? [] });
    A(`${bc.tag} → generation_unavailable(${bc.reason})`,
      r.status === 'generation_unavailable' && r.reason === bc.reason
      && await planStatus(r.planId) === 'generation_unavailable'
      && await provenanceCountByPlan(r.planId) === 0);
  }
  modelOutputOverride = null;
  const dupPlan = mkPlan(snapshot!, generationId, NODEJS_LEAF, privacyEpoch, { competencyId: 'concurrency-dedup' });
  const dupQuestion = defaultQuestionText('concurrency-dedup');
  const rDup = await dispatchQbankMissGeneration(pool, cand, dupPlan, { eligibility: 'no_eligible_in_scope', model: fakeModel, avoidDigests: [deriveGeneratedQuestionDigest(dupQuestion)] });
  A('去重冲突（avoidDigests 命中）→ generation_unavailable(duplicate_question)',
    rDup.status === 'generation_unavailable' && rDup.reason === 'duplicate_question');
  A('全部校验失败后 interview_question 仍只有 happy path 1 题', await interviewQuestionCount(interviewId!) === before2);

  section('③ E1 幂等：同 plan 重放 20 次 → 模型派发≤1、同 question_ready');
  const before3 = modelCalls.length;
  let allReplayed = true;
  for (let i = 0; i < 20; i++) {
    const r = await dispatchQbankMissGeneration(pool, cand, happyPlan, { eligibility: 'no_eligible_in_scope', model: fakeModel, avoidDigests: [] });
    if (r.status !== 'replayed' || r.planStatus !== 'question_ready') allReplayed = false;
  }
  A('20 次恢复读同一 outcome（replayed/question_ready）', allReplayed);
  A('模型派发≤1（重放不二次外发）', modelCalls.length - before3 === 0);
  A('question_ready 事件仍只有 1 条（eventKey 幂等）', await questionReadyCount(interviewId!, happyQuestionId) === 1);
  A('interview_question 仍只有 1 题（不重复插题）', await interviewQuestionCount(interviewId!) === before2);

  section('④ E2 并发 + epoch：generation 陈旧 / privacy epoch 变 / 双 worker 同 plan → 一 plan/issue，模型=0');
  const bogusGen = 'qgen-' + randomUUID();
  const stalePlan = mkPlan(snapshot!, bogusGen, NODEJS_LEAF, privacyEpoch, { competencyId: 'concurrency-stalegen' });
  const before4 = modelCalls.length;
  const rStale = await dispatchQbankMissGeneration(pool, cand, stalePlan, { eligibility: 'no_eligible_in_scope', model: fakeModel, avoidDigests: [] });
  A('generation 陈旧（plan.generationId ≠ active）→ voided(generation_stale)，模型=0',
    rStale.status === 'voided' && rStale.reason === 'generation_stale' && modelCalls.length - before4 === 0);

  const epochPlan = mkPlan(snapshot!, generationId, NODEJS_LEAF, privacyEpoch + 1, { competencyId: 'concurrency-epoch' });
  const rEpoch = await dispatchQbankMissGeneration(pool, cand, epochPlan, { eligibility: 'no_eligible_in_scope', model: fakeModel, avoidDigests: [] });
  A('privacy epoch 漂移（plan.privacyEpoch ≠ interview 冻结值）→ voided(privacy_epoch_changed)，模型=0',
    rEpoch.status === 'voided' && rEpoch.reason === 'privacy_epoch_changed' && modelCalls.length - before4 === 0);

  const dualPlan = mkPlan(snapshot!, generationId, NODEJS_LEAF, privacyEpoch, { competencyId: 'concurrency-dual' });
  // 生产不变量：同一 interview 同一时刻最多一题 open（uq_interview_question_open）。并发派发新题前
  // 关闭上一题（happy path 题），对齐自适应面试的「answer→answered 后发下一题」生命周期。
  await asPrincipal(pool, cand, (c) => cancelOpenInterviewQuestion(c, cand, interviewId!));
  modelOutputOverride = null;
  const [dualA, dualB] = await Promise.all([
    dispatchQbankMissGeneration(pool, cand, dualPlan, { eligibility: 'no_eligible_in_scope', model: fakeModel, avoidDigests: [] }),
    dispatchQbankMissGeneration(pool, cand, dualPlan, { eligibility: 'no_eligible_in_scope', model: fakeModel, avoidDigests: [] }),
  ]);
  A('双 worker 同 plan 并发 → 模型派发≤1（CAS 唯一赢家）', modelCalls.length - before4 === 1);
  const dualKey = deriveQuestionPlanKey(dualPlan);
  A('双 worker 并发 → 唯一 plan 行（UNIQUE plan_key）', await planCountByKey(dualKey) === 1);
  const dualQuestionId = 'gqm-' + deriveGeneratedQuestionDigest(defaultQuestionText('concurrency-dual')).slice(0, 32);
  A('双 worker 并发 → 唯一 question_ready 事件', await questionReadyCount(interviewId!, dualQuestionId) === 1);
  const dualProv = await asPrincipal(pool, cand, (c) => c.query('SELECT count(*)::int n FROM question_issue_provenance WHERE leaf_track_id=$1 AND competency_id=$2', [NODEJS_LEAF, 'concurrency-dual']));
  A('双 worker 并发 → 唯一 provenance（一题一 provenance）', dualProv.rows[0].n === 1);
  const dualPlanRow = await asPrincipal(pool, cand, (c) => c.query('SELECT status FROM question_plan WHERE plan_key=$1', [dualKey]));
  A('双 worker 并发 → 终态 question_ready', dualPlanRow.rows[0]?.status === 'question_ready');
  A('双 worker 返回值均为安全终态（question_ready/replayed/generation_unavailable，无二次派发）',
    ['question_ready', 'replayed', 'generation_unavailable'].includes(dualA.status)
    && ['question_ready', 'replayed', 'generation_unavailable'].includes(dualB.status));

  section('⑤ E3 越权：伪造 leaf/routeScopeDigest/rubric(不存在)/generation 形状/raw verdict digest → 拒（QBank/模型/题=0）');
  const before5 = modelCalls.length;
  const forgedCases: Array<{ tag: string; overrides: Partial<QuestionPlan>; reasonPrefix: string }> = [
    { tag: 'leaf 不在 snapshot', overrides: { leafTrackId: 'frontend/web' }, reasonPrefix: 'planner_leaf_not_in_snapshot' },
    { tag: 'routeScopeDigest 伪造', overrides: { routeScopeDigest: 'f'.repeat(64) }, reasonPrefix: 'route_scope_digest_mismatch' },
    { tag: 'generationId 形状非法', overrides: { generationId: 'not-a-qgen' }, reasonPrefix: 'generation_id_invalid' },
    { tag: 'raw noEligibleVerdictDigest 伪造', overrides: { noEligibleVerdictDigest: 'f'.repeat(64) }, reasonPrefix: 'no_eligible_verdict_digest_mismatch' },
  ];
  for (const fc of forgedCases) {
    const plan = mkPlan(snapshot!, generationId, NODEJS_LEAF, privacyEpoch, { competencyId: 'concurrency-forge', ...fc.overrides });
    const key = deriveQuestionPlanKey(plan);
    const r = await dispatchQbankMissGeneration(pool, cand, plan, { eligibility: 'no_eligible_in_scope', model: fakeModel, avoidDigests: [] });
    A(`${fc.tag} → rejected(${fc.reasonPrefix})`, r.status === 'rejected' && r.reason.startsWith(fc.reasonPrefix));
    A(`${fc.tag} → 零 plan 行（未冻结）`, await planCountByKey(key) === 0);
  }
  // rubric 伪造（uuid 形状但无行）：question_plan.rubric_id → question_rubric(id) 的 FK 在 INSERT
  // 时结构上拒绝（app_role 无 question_rubric SELECT，故不单独预查存在性）。应抛 FK 违例且
  // 零 plan 行、零模型外发。
  const forgedRubricPlan = mkPlan(snapshot!, generationId, NODEJS_LEAF, privacyEpoch, { competencyId: 'concurrency-forge-rubric', rubricId: randomUUID() });
  const forgedRubricKey = deriveQuestionPlanKey(forgedRubricPlan);
  let forgedRubricCode = '';
  try {
    await dispatchQbankMissGeneration(pool, cand, forgedRubricPlan, { eligibility: 'no_eligible_in_scope', model: fakeModel, avoidDigests: [] });
  } catch (e) { forgedRubricCode = (e as { code?: string }).code ?? ''; }
  A('rubric 不存在（uuid 形状但无行）→ 抛 FK 违例(23503)，非 clean rejected', forgedRubricCode === '23503');
  A('rubric 伪造 → 零 plan 行（未冻结）', await planCountByKey(forgedRubricKey) === 0);
  A('E3 全部越权后模型=0', modelCalls.length - before5 === 0);

  section('⑥ E4 失败回滚：模型成功但投影事务失败 → 无 question_ready；恢复读 durable 结果、不重新生成');
  const e4Question = defaultQuestionText('concurrency-e4');
  const e4QuestionId = 'gqm-' + deriveGeneratedQuestionDigest(e4Question).slice(0, 32);
  const e4Plan = mkPlan(snapshot!, generationId, NODEJS_LEAF, privacyEpoch, { competencyId: 'concurrency-e4' });
  modelOutputOverride = { question: e4Question, focus: FOCUS, refs: [] };
  // 上一题（dual）仍 open(issued)。E4 投影事务因 uq_interview_question_open（同一 interview 最多一题
  // open）原子失败：interview_question + question_ready + provenance + CAS 全部回滚，plan 停在
  // result_persisted，durable 结果已落 result outbox。注意 interview_question 是 append-only 账本
  // （app_role 无 DELETE），故「投影失败」用真实 open 冲突而非伪造行+删除来模拟。
  const before6 = modelCalls.length;
  let firstThrowCode = '';
  try {
    await dispatchQbankMissGeneration(pool, cand, e4Plan, { eligibility: 'no_eligible_in_scope', model: fakeModel, avoidDigests: [] });
  } catch (e) { firstThrowCode = (e as { code?: string }).code ?? ''; }
  A('第一次派发投影失败 → 抛 uq_interview_question_open(23505)，非静默', firstThrowCode === '23505');
  A('投影失败后无 question_ready（plan 停在 result_persisted）', await questionReadyCount(interviewId!, e4QuestionId) === 0 && await planStatus('qp-' + deriveQuestionPlanKey(e4Plan)) === 'result_persisted');
  A('模型成功且只派发 1 次（result 已 durable）', modelCalls.length - before6 === 1);
  // 恢复：关闭 open 题（dual）→ 重放读 durable 结果 → 重投影，不重新生成。
  await asPrincipal(pool, cand, (c) => cancelOpenInterviewQuestion(c, cand, interviewId!));
  modelOutputOverride = { question: 'SHOULD NEVER BE CALLED', focus: FOCUS, refs: [] };
  const rRecover = await dispatchQbankMissGeneration(pool, cand, e4Plan, { eligibility: 'no_eligible_in_scope', model: fakeModel, avoidDigests: [] });
  A('恢复重投影 → question_ready（读 durable 结果，不重新生成）',
    rRecover.status === 'question_ready' && await questionReadyCount(interviewId!, e4QuestionId) === 1);
  A('恢复后模型派发仍 =1（result outbox + exact-once，绝不重新生成不同题）', modelCalls.length - before6 === 1);
  modelOutputOverride = null;

  section('⑦ E5 降级：qbank_degraded/policy_denied/dispatched_unknown/timeout/budget_reject → 模型/Web=0，dispatched-unknown 不重发');
  const before7 = modelCalls.length;
  const degradedPlan = mkPlan(snapshot!, generationId, NODEJS_LEAF, privacyEpoch, { competencyId: 'concurrency-degraded' });
  const rDegraded = await dispatchQbankMissGeneration(pool, cand, degradedPlan, { eligibility: 'qbank_degraded', model: fakeModel, avoidDigests: [] });
  A('eligibility=qbank_degraded → no_model_fallback（模型=0，零 plan 行）',
    rDegraded.status === 'no_model_fallback' && rDegraded.reason === 'qbank_degraded'
    && modelCalls.length - before7 === 0 && await planCountByKey(deriveQuestionPlanKey(degradedPlan)) === 0);
  const deniedPlan = mkPlan(snapshot!, generationId, NODEJS_LEAF, privacyEpoch, { competencyId: 'concurrency-denied' });
  const rDenied = await dispatchQbankMissGeneration(pool, cand, deniedPlan, { eligibility: 'policy_denied', model: fakeModel, avoidDigests: [] });
  A('eligibility=policy_denied → no_model_fallback', rDenied.status === 'no_model_fallback' && rDenied.reason === 'policy_denied');

  let unknownThrows = 0;
  const unknownPlan = mkPlan(snapshot!, generationId, NODEJS_LEAF, privacyEpoch, { competencyId: 'concurrency-unknown' });
  const rUnknown = await dispatchQbankMissGeneration(pool, cand, unknownPlan, { eligibility: 'no_eligible_in_scope', model: async () => { unknownThrows++; throw Object.assign(new Error('dispatched_unknown'), { code: 'dispatched_unknown' }); }, avoidDigests: [] });
  A('dispatched_unknown → generation_unavailable(dispatched_unknown)（不重发）',
    rUnknown.status === 'generation_unavailable' && rUnknown.reason === 'dispatched_unknown');
  const rUnknownReplay = await dispatchQbankMissGeneration(pool, cand, unknownPlan, { eligibility: 'no_eligible_in_scope', model: async () => { unknownThrows++; throw Object.assign(new Error('dispatched_unknown'), { code: 'dispatched_unknown' }); }, avoidDigests: [] });
  A('dispatched_unknown 重放 → replayed(generation_unavailable)，模型外发仍=1（不重发）',
    rUnknownReplay.status === 'replayed' && rUnknownReplay.planStatus === 'generation_unavailable' && unknownThrows === 1);

  const timeoutPlan = mkPlan(snapshot!, generationId, NODEJS_LEAF, privacyEpoch, { competencyId: 'concurrency-timeout' });
  const rTimeout = await dispatchQbankMissGeneration(pool, cand, timeoutPlan, { eligibility: 'no_eligible_in_scope', model: throwingModel('timeout'), avoidDigests: [] });
  A('timeout → generation_unavailable(timeout)', rTimeout.status === 'generation_unavailable' && rTimeout.reason === 'timeout');

  const budgetPlan = mkPlan(snapshot!, generationId, NODEJS_LEAF, privacyEpoch, { competencyId: 'concurrency-budget' });
  const rBudget = await dispatchQbankMissGeneration(pool, cand, budgetPlan, { eligibility: 'no_eligible_in_scope', model: throwingModel('budget_rejected'), avoidDigests: [] });
  A('budget_rejected → generation_unavailable(budget_rejected)', rBudget.status === 'generation_unavailable' && rBudget.reason === 'budget_rejected');
  A('E5 全降级路径模型外发=0（除 dispatched_unknown 恰 1 次）', modelCalls.length - before7 === 0);

  section('⑧ E6 污染+评分：生成题不写回 QBank/vector；无 contract/score_request/score_card；review_status=review_required');
  const qbankPollution = await pool.query('SELECT count(*)::int n FROM qbank_question WHERE id=$1', [happyQuestionId]);
  const qbankChunkPollution = await pool.query('SELECT count(*)::int n FROM qbank_question_chunk WHERE question_id=$1', [happyQuestionId]);
  A('生成题不写回 QBank（qbank_question/qbank_question_chunk 零行）',
    qbankPollution.rows[0].n === 0 && qbankChunkPollution.rows[0].n === 0);
  const vectorPollution = await pool.query('SELECT count(*)::int n FROM qbank_generation_chunk WHERE ref_id=$1', [happyQuestionId]);
  A('生成题不写回 vector（qbank_generation_chunk 零行）', vectorPollution.rows[0].n === 0);
  const contractCount = await pool.query('SELECT count(*)::int n FROM issued_question_contract WHERE question_id=$1', [happyQuestionId]);
  const scoreReqCount = await pool.query('SELECT count(*)::int n FROM score_request');
  const scoreCardCount = await pool.query('SELECT count(*)::int n FROM score_card');
  A('生成题无 issued_question_contract（不被评分事实根绑定）', contractCount.rows[0].n === 0);
  A('全程零 score_request / score_card（RAG-05 不触碰 SCOR-01 写路径）',
    scoreReqCount.rows[0].n === 0 && scoreCardCount.rows[0].n === 0);
  const reviewStatus = await asPrincipal(pool, cand, (c) => c.query(
    'SELECT review_status FROM interview_question WHERE interview_id=$1 AND question_id=$2', [interviewId, happyQuestionId]));
  A('生成题 review_status=review_required（⇒ score_excluded，不进 B 端 overall/rank/offer/completion 门）',
    reviewStatus.rows[0]?.review_status === 'review_required');
  const qbankTotal = await pool.query('SELECT count(*)::int n FROM qbank_question');
  A('QBank 题数仍 =1（仅 java fixture，生成题从未入库）', qbankTotal.rows[0].n === 1);

  console.log(`\n${fail === 0 ? '✓ rag05-qbank-miss（真 Postgres）全部通过' : `✗ ${fail} 项失败`}`);
  await pool.end();
  process.exit(fail ? 1 : 0);
}

main().catch(async (err) => {
  console.error(err);
  await pool.end().catch(() => undefined);
  process.exit(1);
});
