/**
 * Generation/retrieval-policy/RLS integration proof on an isolated pgvector cluster.
 * It deliberately uses a deterministic embedder: this proves state, visibility, atomic publication and cache
 * invalidation invariants, not semantic recall quality (the latter is measured by rag-adversarial evaluators).
 */
import { createHash, randomUUID } from 'node:crypto';
import { assertIsolatedTestTarget, createPool, asPrincipal, asQbankControlExecutor, cachedQbankSearch, hybridQbankSearch, upsertVectorChunk, qbankEvidenceForRefs, qbankQuestionEvidenceForRefs, type QbankRetrievalCacheAddress, type QbankRetrievalCacheBackend, type QbankRetrievalCacheLock, type QbankRetrievalHit } from '@meetwise/db';
import { fakeEmbedder } from '@meetwise/ai-runtime';
import { ingestQbank, ingestQuestionBankArtifacts, QBANK_OWNER, qbankMetadataHash, type QbankItem, type QbankQuestionArtifact } from '@meetwise/db';
import { ensureActiveQbankGeneration } from '../src/qbank-generation.ts';
import { reviewSource } from '@meetwise/db';
import { readGenerationQuestionChunkProjection, buildQbankProviderInputRecipe, validateQbankProviderInputRecipe, qbankProviderInputDigest, QBANK_PROVIDER_INPUT_SCHEMA, QBANK_PROVIDER_INPUT_MAX_EXCERPT, type GenerationQuestionChunkProjection, type QbankProviderInputRecipe } from '@meetwise/db';

// Synthetic, non-production HMAC material.  The isolated runner strips every
// inherited cache secret, so this proof never sees or relies on a cloud key.
process.env.RAG_QBANK_CACHE_HASH_KEY = 'qbank-generation-proof-hmac-key-0000000000';
const pool = createPool();
const OWNER = 'qgen-reader';
const embedder = fakeEmbedder(512);
const METADATA = { taxonomyVersion: 'v1', servingScopeId: 'backend/general', annotationSource: 'curator_reviewed' as const };
const items: QbankItem[] = [
  { refId: 'qgen:rate', text: '令牌桶限流需要原子扣减、过载降级和可观测指标', ...METADATA },
  { refId: 'qgen:cache', text: '缓存击穿用 singleflight 和互斥重建保护数据库', ...METADATA },
  { refId: 'qgen:java', text: 'JVM GC 频繁时先检查堆、晋升失败和暂停时间', ...METADATA },
];
const artifact: QbankQuestionArtifact = {
  id: 'question:qgen-rate', competency: '限流与过载保护', difficulty: 4,
  ...METADATA,
  chunks: [
    { refId: 'qartifact:rate:prompt', role: 'prompt', ordinal: 0, required: true, text: '【训练问题】设计令牌桶限流，并说明原子扣减与降级。' },
    { refId: 'qartifact:rate:rubric', role: 'rubric', ordinal: 0, required: true, text: '【评分锚点】容量、补充速率、原子扣减、Redis 分片、指标和故障降级。' },
    { refId: 'qartifact:rate:follow', role: 'follow_up', ordinal: 0, text: '【追问】Redis 主从切换时如何限制超发上界？' },
    { refId: 'qartifact:rate:anti', role: 'anti_pattern', ordinal: 0, text: '【常见失分】只说 Lua，未定义容量和失败语义。' },
  ],
};
const deltaArtifact: QbankQuestionArtifact = {
  id: 'question:qgen-delta', competency: '限流与过载保护', difficulty: 2,
  ...METADATA,
  chunks: [
    { refId: 'qartifact:delta:prompt', role: 'prompt', ordinal: 0, required: true, text: '【训练问题】限流 难度2：解释令牌桶的容量和补充速率。' },
    { refId: 'qartifact:delta:rubric', role: 'rubric', ordinal: 0, required: true, text: '【评分锚点】必须量化容量、补充速率和原子扣减。' },
    { refId: 'qartifact:delta:anti', role: 'anti_pattern', ordinal: 0, text: '【常见失分】只说加 Redis，不说明超额语义。' },
  ],
};
let fail = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) fail++; };
const hash = (s: string) => createHash('sha256').update(s).digest('hex').slice(0, 32);
const epoch = async () => Number((await pool.query('SELECT epoch FROM qbank_cache_epoch WHERE singleton')).rows[0].epoch);

/** Contract double only; the Redis/Tair integration suite is the production acceptance source. */
class TestCache implements QbankRetrievalCacheBackend {
  private readonly values = new Map<string, QbankRetrievalHit[]>();
  private readonly locks = new Map<string, string>();
  private key(address: QbankRetrievalCacheAddress) { return `${address.cacheKey}:${address.corpusEpoch}`; }
  async read(address: QbankRetrievalCacheAddress): Promise<QbankRetrievalHit[] | undefined> { return this.values.get(this.key(address)); }
  async acquire(address: QbankRetrievalCacheAddress): Promise<QbankRetrievalCacheLock | undefined> { const key = this.key(address); if (this.locks.has(key)) return undefined; const token = randomUUID(); this.locks.set(key, token); return { token }; }
  async renew(address: QbankRetrievalCacheAddress, lock: QbankRetrievalCacheLock): Promise<boolean> { return this.locks.get(this.key(address)) === lock.token; }
  async publish(address: QbankRetrievalCacheAddress, lock: QbankRetrievalCacheLock, hits: QbankRetrievalHit[]): Promise<boolean> { const key = this.key(address); if (this.locks.get(key) !== lock.token) return false; this.values.set(key, hits); this.locks.delete(key); return true; }
  async release(address: QbankRetrievalCacheAddress, lock: QbankRetrievalCacheLock): Promise<void> { const key = this.key(address); if (this.locks.get(key) === lock.token) this.locks.delete(key); }
}
const cache = new TestCache();

async function search(q: string, recipeId: string) {
  const [v] = await embedder.embed([q]);
  if (!v) throw new Error('test_embedder_returned_no_query_vector');
  return asPrincipal(pool, OWNER, (c) => hybridQbankSearch(c, { query: q, embedding: v, k: 5, expectedRecipeId: recipeId }));
}

async function main() {
  // The runner applies the complete migration prefix before this proof starts.
  // Do not reset schema_migrations here: a direct invocation must fail before
  // any destructive SQL, never rebuild a developer or cloud database.
  await assertIsolatedTestTarget(pool);

  const artifactResult = await ingestQuestionBankArtifacts(pool, [artifact], embedder);
  const persistedArtifactMetadata = await asQbankControlExecutor(pool, (c) => c.query<{
    metadata_state: string; taxonomy_version: string; serving_scope_id: string; annotation_source: string; metadata_hash: string; matching_chunks: string; chunk_scopes: string;
  }>(
    `SELECT q.metadata_state,q.taxonomy_version,q.serving_scope_id,q.annotation_source,q.metadata_hash,
            (SELECT count(*)::text FROM qbank_question_chunk qc
              WHERE qc.question_id=q.id
                AND (qc.taxonomy_version,qc.serving_scope_id,qc.annotation_source,qc.metadata_hash)
                    = (q.taxonomy_version,q.serving_scope_id,q.annotation_source,q.metadata_hash)) AS matching_chunks,
            (SELECT count(*)::text FROM qbank_chunk_serving_scope cs
              JOIN qbank_question_chunk qc ON qc.ref_id=cs.ref_id
              WHERE qc.question_id=q.id
                AND cs.taxonomy_version=q.taxonomy_version
                AND cs.serving_scope_id=q.serving_scope_id
                AND cs.annotation_source=q.annotation_source) AS chunk_scopes
       FROM qbank_question q WHERE q.id=$1`,
    [artifact.id],
  ));
  A('one interview question persists as a business entity with four role-labelled RAG chunks',
    artifactResult.questionCount === 1 && artifactResult.chunkCount === artifact.chunks.length
    && Number((await pool.query('SELECT count(*) n FROM qbank_question_chunk WHERE question_id=$1', [artifact.id])).rows[0].n) === 4);
  const artifactMetadata = persistedArtifactMetadata.rows[0];
  A('new artifact assigns its reviewed leaf metadata to every cut and freezes the same tuple into its immutable receipt',
    artifactMetadata?.metadata_state === 'reviewed'
    && artifactMetadata.taxonomy_version === METADATA.taxonomyVersion
    && artifactMetadata.serving_scope_id === METADATA.servingScopeId
    && artifactMetadata.annotation_source === METADATA.annotationSource
    && artifactMetadata.metadata_hash === qbankMetadataHash('qbank-artifact-metadata:v1', METADATA)
    && Number(artifactMetadata.matching_chunks) === artifact.chunks.length
    && Number(artifactMetadata.chunk_scopes) === artifact.chunks.length);
  const taxonomyRelease = await asQbankControlExecutor(pool, (c) => c.query<{
    state: string; release_hash: string; manifest_hash: string; leaves: string[];
  }>(
    `SELECT r.state,r.release_hash,qbank_taxonomy_manifest_hash(r.version) AS manifest_hash,
            array_agg(s.scope_id ORDER BY s.scope_id) FILTER (WHERE s.is_leaf) AS leaves
       FROM qbank_taxonomy_release r
       JOIN qbank_taxonomy_scope s ON s.taxonomy_version=r.version
      WHERE r.version='v1'
      GROUP BY r.version,r.state,r.release_hash`,
  ));
  let releasedScopeMutationRejected = false;
  try {
    await asQbankControlExecutor(pool, (c) => c.query(
      `INSERT INTO qbank_taxonomy_scope(taxonomy_version,scope_id,parent_scope_id,is_leaf,display_name)
       VALUES ('v1','backend/rust','backend',true,'Rust 后端')`,
    ));
  } catch (error) { releasedScopeMutationRejected = (error as { code?: string }).code === '23514'; }
  const v1 = taxonomyRelease.rows[0];
  A('released taxonomy v1 seals its complete canonical tree and refuses a post-release leaf insertion',
    v1?.state === 'released'
    && v1.release_hash === v1.manifest_hash
    && JSON.stringify(v1.leaves) === JSON.stringify([
      'ai_ml/applied', 'backend/general', 'backend/go', 'backend/java', 'backend/nodejs', 'backend/python',
      'frontend/web', 'qa/quality_engineering',
    ])
    && releasedScopeMutationRejected);
  const chunkCountBeforeInvalidMetadata = Number((await pool.query(
    "SELECT count(*) n FROM qbank_chunk WHERE ref_id IN ('qgen:invalid-parent','qgen:invalid-version')",
  )).rows[0]?.n);
  let parentScopeRejected = false;
  let unknownVersionRejected = false;
  try {
    await ingestQbank(pool, [{
      refId: 'qgen:invalid-parent', text: '父节点不是一个可服务的语言/岗位切块。',
      taxonomyVersion: 'v1', servingScopeId: 'backend', annotationSource: 'curator_reviewed',
    }], embedder);
  } catch (error) { parentScopeRejected = String(error).includes('qbank_serving_scope_not_released_leaf'); }
  try {
    await ingestQbank(pool, [{
      refId: 'qgen:invalid-version', text: '未知 taxonomy version 不得写入任何原始题库事实。',
      taxonomyVersion: 'v9', servingScopeId: 'backend/go', annotationSource: 'curator_reviewed',
    }], embedder);
  } catch (error) { unknownVersionRejected = String(error).includes('qbank_serving_scope_not_released_leaf'); }
  const chunkCountAfterInvalidMetadata = Number((await pool.query(
    "SELECT count(*) n FROM qbank_chunk WHERE ref_id IN ('qgen:invalid-parent','qgen:invalid-version')",
  )).rows[0]?.n);
  A('unknown taxonomy and non-leaf parent are rejected before any source/pool/chunk write',
    parentScopeRejected && unknownVersionRejected && chunkCountBeforeInvalidMetadata === 0 && chunkCountAfterInvalidMetadata === 0);
  let publishedMutationRejected = false;
  let publishedMappingMutationRejected = false;
  try {
    await asQbankControlExecutor(pool, (c) => c.query(
      'UPDATE qbank_question SET difficulty=5 WHERE id=$1', [artifact.id]));
  } catch (error) { publishedMutationRejected = (error as { code?: string }).code === '23514'; }
  try {
    await asQbankControlExecutor(pool, (c) => c.query(
      "UPDATE qbank_question_chunk SET role='example' WHERE question_id=$1 AND role='follow_up'", [artifact.id]));
  } catch (error) { publishedMappingMutationRejected = (error as { code?: string }).code === '23514'; }
  A('published question receipt and role mapping reject raw-SQL in-place mutation',
    publishedMutationRejected && publishedMappingMutationRejected);
  let publishedScopeMutationRejected = false;
  let publishedChunkScopeMutationRejected = false;
  let forgedChunkScopeHashRejected = false;
  try {
    await asQbankControlExecutor(pool, (c) => c.query(
      "UPDATE qbank_question SET serving_scope_id='backend/java' WHERE id=$1", [artifact.id],
    ));
  } catch (error) { publishedScopeMutationRejected = (error as { code?: string }).code === '23514'; }
  try {
    await asQbankControlExecutor(pool, (c) => c.query(
      "UPDATE qbank_question_chunk SET serving_scope_id='backend/java' WHERE question_id=$1 AND ref_id=$2",
      [artifact.id, artifact.chunks[0]!.refId],
    ));
  } catch (error) { publishedChunkScopeMutationRejected = (error as { code?: string }).code === '23514'; }
  try {
    await asQbankControlExecutor(pool, (c) => c.query(
      `INSERT INTO qbank_chunk_serving_scope(ref_id,taxonomy_version,serving_scope_id,annotation_source,metadata_hash)
       VALUES ($1,'v1','backend/java','curator_reviewed',repeat('0',64))`, [artifact.chunks[0]!.refId],
    ));
  } catch (error) { forgedChunkScopeHashRejected = (error as { code?: string }).code === '23514'; }
  A('published metadata cannot move to a sibling leaf and a forged raw chunk-scope receipt is rejected',
    publishedScopeMutationRejected && publishedChunkScopeMutationRejected && forgedChunkScopeHashRejected);
  let runtimeTaxonomyReadDenied = false;
  let runtimeTaxonomyWriteDenied = false;
  try { await asPrincipal(pool, OWNER, (c) => c.query('SELECT version FROM qbank_taxonomy_release')); }
  catch (error) { runtimeTaxonomyReadDenied = (error as { code?: string }).code === '42501'; }
  try {
    await asPrincipal(pool, OWNER, (c) => c.query(
      `INSERT INTO qbank_taxonomy_release(version,release_hash,state)
       VALUES ('v9',repeat('f',64),'released')`,
    ));
  } catch (error) { runtimeTaxonomyWriteDenied = (error as { code?: string }).code === '42501'; }
  A('runtime app_role plus a forged principal GUC has neither raw taxonomy read nor write authority',
    runtimeTaxonomyReadDenied && runtimeTaxonomyWriteDenied);
  let malformed = false;
  try {
    await ingestQuestionBankArtifacts(pool, [{ ...artifact, id: 'question:qgen-invalid', chunks: artifact.chunks.filter((chunk) => chunk.role !== 'rubric') }], embedder);
  } catch (error) { malformed = String(error).includes('qbank_question'); }
  A('title-only / no-rubric question artifact is rejected before any RAG write', malformed);

  const n = await ingestQbank(pool, items, embedder);
  A('generation mode persists approved reconstructible facts, not legacy qbank vectors', n === items.length
    && Number((await pool.query("SELECT count(*) n FROM qbank_chunk")).rows[0].n) === items.length + artifact.chunks.length
    && Number((await pool.query("SELECT count(*) n FROM vector_chunk WHERE kind='qbank'")).rows[0].n) === 0);
  const sharedCutText = '共享切块只能经各自 reviewed projection 进入不同 artifact，不能由输入顺序选择最后一个 scope。';
  const sharedRefBeforeConflict = Number((await pool.query(
    "SELECT count(*)::int AS n FROM qbank_chunk WHERE ref_id='qshared:conflict'",
  )).rows[0]?.n);
  let divergentSharedRefRejected = false;
  try {
    await ingestQuestionBankArtifacts(pool, [
      {
        id: 'question:qgen-shared-conflict-a', competency: '共享内容一致性', difficulty: 3,
        taxonomyVersion: 'v1', servingScopeId: 'backend/general', annotationSource: 'curator_reviewed',
        chunks: [
          { refId: 'qshared:conflict', role: 'prompt', ordinal: 0, required: true, text: '同一 ref 的第一段正文。' },
          { refId: 'qshared:conflict:a:rubric', role: 'rubric', ordinal: 0, required: true, text: '第一份评分锚点。' },
          { refId: 'qshared:conflict:a:anti', role: 'anti_pattern', ordinal: 0, text: '第一份反例。' },
        ],
      },
      {
        id: 'question:qgen-shared-conflict-b', competency: '共享内容一致性', difficulty: 3,
        taxonomyVersion: 'v1', servingScopeId: 'backend/general', annotationSource: 'curator_reviewed',
        chunks: [
          { refId: 'qshared:conflict', role: 'prompt', ordinal: 0, required: true, text: '同一 ref 的第二段不同正文。' },
          { refId: 'qshared:conflict:b:rubric', role: 'rubric', ordinal: 0, required: true, text: '第二份评分锚点。' },
          { refId: 'qshared:conflict:b:anti', role: 'anti_pattern', ordinal: 0, text: '第二份反例。' },
        ],
      },
    ], embedder);
  } catch (error) { divergentSharedRefRejected = String(error).includes('qbank_question_shared_ref_content_mismatch'); }
  const sharedRefAfterConflict = Number((await pool.query(
    "SELECT count(*)::int AS n FROM qbank_chunk WHERE ref_id='qshared:conflict'",
  )).rows[0]?.n);
  A('two artifacts cannot publish a divergent body under the same ref/scope; conflict writes zero facts',
    divergentSharedRefRejected && sharedRefBeforeConflict === 0 && sharedRefAfterConflict === 0);
  const sharedArtifacts: QbankQuestionArtifact[] = [
    {
      id: 'question:qgen-shared-general', competency: '通用服务设计', difficulty: 3,
      taxonomyVersion: 'v1', servingScopeId: 'backend/general', annotationSource: 'curator_reviewed',
      chunks: [
        { refId: 'qshared:prompt', role: 'prompt', ordinal: 0, required: true, text: sharedCutText },
        { refId: 'qshared:general:rubric', role: 'rubric', ordinal: 0, required: true, text: '通用系统设计评分锚点。' },
        { refId: 'qshared:general:anti', role: 'anti_pattern', ordinal: 0, text: '不能把通用题默认扩散到所有语言。' },
      ],
    },
    {
      id: 'question:qgen-shared-go', competency: 'Go 服务端', difficulty: 3,
      taxonomyVersion: 'v1', servingScopeId: 'backend/go', annotationSource: 'curator_reviewed',
      chunks: [
        { refId: 'qshared:prompt', role: 'prompt', ordinal: 0, required: true, text: sharedCutText },
        { refId: 'qshared:go:rubric', role: 'rubric', ordinal: 0, required: true, text: 'Go 并发与服务端评分锚点。' },
        { refId: 'qshared:go:anti', role: 'anti_pattern', ordinal: 0, text: '不能把 Go 标签覆盖共享 raw cut 的通用审核。' },
      ],
    },
  ];
  const sharedResult = await ingestQuestionBankArtifacts(pool, sharedArtifacts, embedder);
  // After 0097 the shared `qshared:prompt` cut expands to one projection row per
  // reviewed leaf (backend/general + backend/go), so the projection count is one
  // greater than the distinct-ref count.
  const sharedProjectionCount = 6;
  const sharedScopes = await asQbankControlExecutor(pool, (c) => c.query<{ scope: string; count: string }>(
    `SELECT serving_scope_id AS scope,count(*)::text AS count
       FROM qbank_chunk_serving_scope
      WHERE ref_id='qshared:prompt'
      GROUP BY serving_scope_id ORDER BY serving_scope_id`,
  ));
  A('a shared immutable raw cut keeps two independently reviewed artifact projections; no scope is last-wins',
    sharedResult.questionCount === 2
    && sharedResult.chunkCount === 6
    && JSON.stringify(sharedScopes.rows) === JSON.stringify([
      { scope: 'backend/general', count: '1' }, { scope: 'backend/go', count: '1' },
    ]));
  const concurrentItem: QbankItem = {
    refId: 'qgen:concurrent', text: '并发导入同一题库正文时必须只形成一条来源、池和正文事实链。', ...METADATA,
  };
  const beforeConcurrentEpoch = await epoch();
  const beforeConcurrentCorpusEpoch = Number((await pool.query('SELECT epoch FROM qbank_corpus_epoch WHERE singleton')).rows[0]?.epoch);
  const concurrentResults = await Promise.allSettled(Array.from({ length: 20 }, () => ingestQbank(pool, [concurrentItem], embedder)));
  const concurrentFacts = await pool.query<{ source_count: string; pool_count: string; chunk_count: string }>(
    `SELECT
       (SELECT count(*) FROM qbank_source WHERE content_hash=$1)::text AS source_count,
       (SELECT count(*) FROM qbank_pool_entry WHERE ref_id=$2)::text AS pool_count,
       (SELECT count(*) FROM qbank_chunk WHERE ref_id=$2)::text AS chunk_count`,
    [hash(concurrentItem.text), concurrentItem.refId],
  );
  A('20 concurrent identical imports converge to exactly one source/pool/chunk chain and one visible epoch bump',
    concurrentResults.every((result) => result.status === 'fulfilled')
    && concurrentFacts.rows[0]?.source_count === '1'
    && concurrentFacts.rows[0]?.pool_count === '1'
    && concurrentFacts.rows[0]?.chunk_count === '1'
    && await epoch() === beforeConcurrentEpoch + 1
    && Number((await pool.query('SELECT epoch FROM qbank_corpus_epoch WHERE singleton')).rows[0]?.epoch) === beforeConcurrentCorpusEpoch + 1);
  let poolHashMismatchRejected = false;
  try {
    await asQbankControlExecutor(pool, (c) => c.query(
      `INSERT INTO qbank_pool_entry(id,source_id,ref_id,content_hash)
       VALUES ('qpool-hash-mismatch',$1,'qbank:hash-mismatch',$2)`,
      ['qs-' + hash(items[0]!.text), 'f'.repeat(32)]));
  } catch (error) { poolHashMismatchRejected = (error as { code?: string }).code === '23514'; }
  A('raw-SQL pool entry with source/body hash mismatch is rejected before it can enter a generation', poolHashMismatchRejected);
  const bodyMismatchBefore = await pool.query<{ pool_count: string; generation_count: string; cache_epoch: string; corpus_epoch: string }>(
    `SELECT
       (SELECT count(*) FROM qbank_pool_entry WHERE ref_id='qbank:body-mismatch')::text AS pool_count,
       (SELECT count(*) FROM qbank_vector_generation)::text AS generation_count,
       (SELECT epoch::text FROM qbank_cache_epoch WHERE singleton) AS cache_epoch,
       (SELECT epoch::text FROM qbank_corpus_epoch WHERE singleton) AS corpus_epoch`,
  );
  let bodyHashMismatchRejected = false;
  try {
    await asQbankControlExecutor(pool, async (c) => {
      await c.query(
        `INSERT INTO qbank_pool_entry(id,source_id,ref_id,content_hash)
         VALUES ('qpool-body-mismatch',$1,'qbank:body-mismatch',$2)`,
        ['qs-' + hash(items[0]!.text), hash(items[0]!.text)],
      );
      await c.query(
        `INSERT INTO qbank_chunk(ref_id,source_id,content_hash,content)
         VALUES ('qbank:body-mismatch',$1,$2,$3)`,
        ['qs-' + hash(items[0]!.text), hash(items[0]!.text), '与已声明摘要不相同的正文'],
      );
    });
  } catch (error) { bodyHashMismatchRejected = (error as { code?: string }).code === '23514'; }
  const bodyMismatchAfter = await pool.query<{ pool_count: string; chunk_count: string; generation_count: string; cache_epoch: string; corpus_epoch: string }>(
    `SELECT
       (SELECT count(*) FROM qbank_pool_entry WHERE ref_id='qbank:body-mismatch')::text AS pool_count,
       (SELECT count(*) FROM qbank_chunk WHERE ref_id='qbank:body-mismatch')::text AS chunk_count,
       (SELECT count(*) FROM qbank_vector_generation)::text AS generation_count,
       (SELECT epoch::text FROM qbank_cache_epoch WHERE singleton) AS cache_epoch,
       (SELECT epoch::text FROM qbank_corpus_epoch WHERE singleton) AS corpus_epoch`,
  );
  A('数据库重算 UTF-8 正文摘要；控制面原始 SQL 不能把任意正文挂到已批准 source/pool',
    bodyHashMismatchRejected
    && bodyMismatchAfter.rows[0]?.pool_count === bodyMismatchBefore.rows[0]?.pool_count
    && bodyMismatchAfter.rows[0]?.chunk_count === '0'
    && bodyMismatchAfter.rows[0]?.generation_count === bodyMismatchBefore.rows[0]?.generation_count
    && bodyMismatchAfter.rows[0]?.cache_epoch === bodyMismatchBefore.rows[0]?.cache_epoch
    && bodyMismatchAfter.rows[0]?.corpus_epoch === bodyMismatchBefore.rows[0]?.corpus_epoch);

  const g1 = await ensureActiveQbankGeneration(pool, embedder);
  A('first immutable full generation validates then activates', g1?.status === 'activated'
    && g1.chunkCount === items.length + artifact.chunks.length + sharedProjectionCount + 1 && !!g1.generationId);
  const g1Id = g1!.generationId!;

  // Layer-by-layer projection assertions (RAG-FUNNEL-02A): a frozen generation
  // chunk is now per-(ref, reviewed leaf); a shared cut must expand once per
  // leaf and a single-scope cut must not, and the canonical projection must
  // never leak a chunk or its question across a track-local scope boundary.
  const genRowFacts = await asQbankControlExecutor(pool, (c) => c.query<{
    ref_id: string; taxonomy_version: string; serving_scope_id: string; count: string;
  }>(
    `SELECT ref_id,taxonomy_version,serving_scope_id,count(*)::text AS count
       FROM qbank_generation_chunk WHERE generation_id=$1
      GROUP BY ref_id,taxonomy_version,serving_scope_id
      ORDER BY ref_id,serving_scope_id`,
    [g1Id],
  ));
  const rateRows = genRowFacts.rows.filter((r) => r.ref_id === 'qgen:rate');
  const promptRows = genRowFacts.rows.filter((r) => r.ref_id === 'qshared:prompt');
  const expectedChunkCount = Number((await pool.query(
    'SELECT expected_chunk_count FROM qbank_vector_generation WHERE id=$1', [g1Id],
  )).rows[0].expected_chunk_count);
  A('frozen generation projects one row per (ref, reviewed leaf); shared cut expands but single-scope cut does not',
    rateRows.length === 1 && rateRows[0]?.taxonomy_version === 'v1' && rateRows[0]?.serving_scope_id === 'backend/general'
    && promptRows.length === 2
    && JSON.stringify(promptRows.map((r) => r.serving_scope_id).sort()) === JSON.stringify(['backend/general', 'backend/go'])
    && expectedChunkCount === g1!.chunkCount && g1!.chunkCount === genRowFacts.rowCount);

  const projectionAll = await readGenerationQuestionChunkProjection(pool, { generationId: g1Id });
  const byRefScope = new Map(projectionAll.map((p) => [`${p.refId} ${p.taxonomyVersion} ${p.servingScopeId}`, p]));
  A('canonical projection carries reviewed metadata for every row and its immutable receipt is byte-stable',
    projectionAll.length === g1!.chunkCount
    && projectionAll.every((p) => p.taxonomyVersion === 'v1' && p.servingScopeId !== '' && p.annotationSource === 'curator_reviewed')
    && byRefScope.get('qgen:rate v1 backend/general')?.metadataHash === qbankMetadataHash('qbank-chunk-scope:v1', METADATA)
    && byRefScope.get('qgen:rate v1 backend/general')?.contentHash === hash(items[0]!.text));

  const goOnly = await readGenerationQuestionChunkProjection(pool, { generationId: g1Id, servingScopeId: 'backend/go' });
  const generalOnly = await readGenerationQuestionChunkProjection(pool, { generationId: g1Id, servingScopeId: 'backend/general' });
  const goPrompt = goOnly.find((p) => p.refId === 'qshared:prompt');
  const generalPrompt = generalOnly.find((p) => p.refId === 'qshared:prompt');
  A('track-local projection filter never leaks another leaf chunk or its question attachment',
    goOnly.every((p) => p.servingScopeId === 'backend/go')
    && goOnly.some((p) => p.refId === 'qshared:prompt') && !goOnly.some((p) => p.refId === 'qgen:rate')
    && (goPrompt?.questions ?? []).some((q) => q.questionId === 'question:qgen-shared-go' && q.role === 'prompt' && q.questionState === 'published')
    && !(goPrompt?.questions ?? []).some((q) => q.questionId === 'question:qgen-shared-general')
    && generalOnly.every((p) => p.servingScopeId === 'backend/general')
    && (generalPrompt?.questions ?? []).some((q) => q.questionId === 'question:qgen-shared-general' && q.role === 'prompt' && q.questionState === 'published')
    && !(generalPrompt?.questions ?? []).some((q) => q.questionId === 'question:qgen-shared-go'));

  // Provider-input recipe (RAG-FUNNEL-02A): typed, scope-homogeneous, byte-stable
  // and fail-closed — strictly separate from the MODEL-OP model catalog.
  const recipeInput = {
    generationId: g1Id,
    taxonomyVersion: 'v1',
    servingScopeId: 'backend/go',
    parts: [
      { refId: 'qshared:prompt', role: 'prompt' as const, ordinal: 0, required: true, excerpt: sharedCutText.slice(0, 200) },
      { refId: 'qshared:go:rubric', role: 'rubric' as const, ordinal: 0, required: true, excerpt: 'Go 并发与服务端评分锚点。' },
    ],
  };
  const recipe1 = buildQbankProviderInputRecipe(recipeInput);
  const recipe2 = buildQbankProviderInputRecipe(recipeInput);
  let emptyRecipeOk = false; let badScopeRejected = false; let badRefRejected = false; let badRoleRejected = false;
  let blankExcerptRejected = false; let oversizedExcerptRejected = false; let schemaMismatchRejected = false; let duplicateRejected = false;
  try { validateQbankProviderInputRecipe({ ...recipe1, parts: [] }); emptyRecipeOk = true; } catch { /* a no-context recipe is structurally valid; 05 decides business emptiness */ }
  try { validateQbankProviderInputRecipe({ ...recipe1, servingScopeId: 'Backend/Go' }); } catch { badScopeRejected = true; }
  try { validateQbankProviderInputRecipe({ ...recipe1, parts: [{ ...recipe1.parts[0]!, refId: 'bad ref!' }] }); } catch { badRefRejected = true; }
  try { validateQbankProviderInputRecipe({ ...recipe1, parts: [{ ...recipe1.parts[0]!, role: 'bogus' as never }] }); } catch { badRoleRejected = true; }
  try { validateQbankProviderInputRecipe({ ...recipe1, parts: [{ ...recipe1.parts[0]!, excerpt: '   ' }] }); } catch { blankExcerptRejected = true; }
  try { validateQbankProviderInputRecipe({ ...recipe1, parts: [{ ...recipe1.parts[0]!, excerpt: 'x'.repeat(QBANK_PROVIDER_INPUT_MAX_EXCERPT + 1) }] }); } catch { oversizedExcerptRejected = true; }
  try { validateQbankProviderInputRecipe({ ...recipe1, schema: 'qbank-provider-input:v0' as never }); } catch { schemaMismatchRejected = true; }
  try { validateQbankProviderInputRecipe({ ...recipe1, parts: [...recipe1.parts, { ...recipe1.parts[0]! }] }); } catch { duplicateRejected = true; }
  A('provider-input recipe is scope-homogeneous, byte-stable and fail-closed on every malformed field; empty parts is a valid no-context state',
    recipe1.schema === QBANK_PROVIDER_INPUT_SCHEMA
    && recipe1.servingScopeId === 'backend/go'
    && recipe1.parts.every((p) => p.role !== 'reference' && p.excerpt.length <= QBANK_PROVIDER_INPUT_MAX_EXCERPT)
    && qbankProviderInputDigest(recipe1) === qbankProviderInputDigest(recipe2)
    && emptyRecipeOk && badScopeRejected && badRefRejected && badRoleRejected
    && blankExcerptRejected && oversizedExcerptRejected && schemaMismatchRejected && duplicateRejected);
  const hits1 = await search('令牌桶 限流', g1!.recipe.id);
  A('default qbank retrieval policy is dense and returns an active approved hit', hits1.some((x) => x.refId === 'qgen:rate')
    && hits1.every((x) => x.channels.length === 1 && x.channels[0] === 'dense'));
  const evidence1 = await asPrincipal(pool, OWNER, (c) => qbankEvidenceForRefs(c, g1!.recipe.id, hits1.map((x) => x.refId), 600));
  A('prompt evidence is bounded source text rechecked against active approved generation, not ref_id-only grounding',
    evidence1.some((x) => x.refId === 'qgen:rate' && x.excerpt.includes('令牌桶')) && evidence1.every((x) => x.excerpt.length <= 600));
  const originalFact = (await pool.query(
    'SELECT source_id, content_hash, content FROM qbank_chunk WHERE ref_id=$1', [items[0]!.refId],
  )).rows[0] as { source_id: string; content_hash: string; content: string } | undefined;
  const epochBeforeFactMutation = await epoch();
  let executorPoolMutationDenied = false;
  let executorChunkMutationDenied = false;
  let executorPoolDeleteDenied = false;
  let executorChunkDeleteDenied = false;
  try {
    await asQbankControlExecutor(pool, (c) => c.query(
      'UPDATE qbank_pool_entry SET source_id=$2 WHERE ref_id=$1', [items[0]!.refId, 'nonexistent-source'],
    ));
  } catch (error) { executorPoolMutationDenied = (error as { code?: string }).code === '42501'; }
  try {
    await asQbankControlExecutor(pool, (c) => c.query(
      "UPDATE qbank_chunk SET content='被原地替换的正文' WHERE ref_id=$1", [items[0]!.refId],
    ));
  } catch (error) { executorChunkMutationDenied = (error as { code?: string }).code === '42501'; }
  try {
    await asQbankControlExecutor(pool, (c) => c.query(
      'DELETE FROM qbank_pool_entry WHERE ref_id=$1', [items[0]!.refId],
    ));
  } catch (error) { executorPoolDeleteDenied = (error as { code?: string }).code === '42501'; }
  try {
    await asQbankControlExecutor(pool, (c) => c.query(
      'DELETE FROM qbank_chunk WHERE ref_id=$1', [items[0]!.refId],
    ));
  } catch (error) { executorChunkDeleteDenied = (error as { code?: string }).code === '42501'; }
  let ownerPoolMutationRejected = false;
  let ownerChunkMutationRejected = false;
  let ownerPoolDeleteRejected = false;
  let ownerChunkDeleteRejected = false;
  try {
    await pool.query('UPDATE qbank_pool_entry SET content_hash=$2 WHERE ref_id=$1', [items[0]!.refId, 'f'.repeat(32)]);
  } catch (error) { ownerPoolMutationRejected = (error as { code?: string }).code === '23514'; }
  try {
    await pool.query("UPDATE qbank_chunk SET content='被表所有者原地替换的正文' WHERE ref_id=$1", [items[0]!.refId]);
  } catch (error) { ownerChunkMutationRejected = (error as { code?: string }).code === '23514'; }
  try {
    await pool.query('DELETE FROM qbank_pool_entry WHERE ref_id=$1', [items[0]!.refId]);
  } catch (error) { ownerPoolDeleteRejected = (error as { code?: string }).code === '23514'; }
  try {
    await pool.query('DELETE FROM qbank_chunk WHERE ref_id=$1', [items[0]!.refId]);
  } catch (error) { ownerChunkDeleteRejected = (error as { code?: string }).code === '23514'; }
  const factAfterMutation = (await pool.query(
    'SELECT source_id, content_hash, content FROM qbank_chunk WHERE ref_id=$1', [items[0]!.refId],
  )).rows[0] as { source_id: string; content_hash: string; content: string } | undefined;
  const evidenceAfterMutation = await asPrincipal(pool, OWNER, (c) => qbankEvidenceForRefs(c, g1!.recipe.id, [items[0]!.refId], 600));
  const activeAfterMutation = (await pool.query('SELECT generation_id FROM qbank_active_generation WHERE singleton')).rows[0]?.generation_id;
  A('控制执行器无 pool/chunk 原地写权；即使表所有者形状绕过角色授权也会被不可变触发器拒绝',
    executorPoolMutationDenied && executorChunkMutationDenied
    && executorPoolDeleteDenied && executorChunkDeleteDenied
    && ownerPoolMutationRejected && ownerChunkMutationRejected
    && ownerPoolDeleteRejected && ownerChunkDeleteRejected);
  A('活动 generation 的正文、证据与可见 epoch 在所有原地替换攻击后字节级保持不变',
    JSON.stringify(factAfterMutation) === JSON.stringify(originalFact)
    && evidenceAfterMutation.length === 1 && evidenceAfterMutation[0]?.excerpt === evidence1.find((x) => x.refId === items[0]!.refId)?.excerpt
    && activeAfterMutation === g1!.generationId && await epoch() === epochBeforeFactMutation);
  const questionEvidence = await asPrincipal(pool, OWNER, (c) => qbankQuestionEvidenceForRefs(c, g1!.recipe.id, ['qartifact:rate:rubric'], 600));
  A('a hit on one rubric expands to the complete prompt/rubric/follow-up/anti-pattern question package',
    questionEvidence.length === 1 && questionEvidence[0]?.questionId === artifact.id
    && questionEvidence[0]?.evidence.length === 4
    && (questionEvidence[0]?.evidence.some((part) => part.role === 'prompt') ?? false)
    && (questionEvidence[0]?.evidence.some((part) => part.role === 'rubric') ?? false));
  let mismatch = false;
  try { await search('令牌桶 限流', 'qrecipe-00000000000000000000000000000000'); } catch (e) { mismatch = String(e).includes('qbank_generation_recipe_mismatch'); }
  A('recipe mismatch fail-closed; old vector space is never searched', mismatch);

  const cached = async (recipeId = g1!.recipe.id) => cachedQbankSearch(pool, OWNER, {
    query: '令牌桶 限流', k: 5, embedderVersion: `proof:${recipeId}:retrieval=dense:v1`, qbankRecipeId: recipeId, retrievalMode: 'dense',
    cache, embed: (texts) => embedder.embed(texts), ttlSeconds: 60, leaseSeconds: 5, waitMs: 1000,
  });
  const c1 = await cached(); const c2 = await cached();
  A('generation-aware cache has normal miss then hit', c1.cacheStatus === 'miss' && c2.cacheStatus === 'hit');

  // Same recipe is not sufficient for reuse: a newly approved artifact bumps
  // the source epoch and cannot be served until a complete new generation is
  // built and atomically activated.
  await ingestQuestionBankArtifacts(pool, [deltaArtifact], embedder);
  const beforeRebuild = await search('限流 难度2', g1!.recipe.id);
  A('new approved question is absent from the old immutable generation before rebuild',
    !beforeRebuild.some((x) => x.refId === 'qartifact:delta:prompt'));
  const gContent = await ensureActiveQbankGeneration(pool, embedder);
  A('same recipe plus changed approved-source epoch creates and activates a fresh generation',
    gContent?.status === 'activated' && gContent.generationId !== g1!.generationId
    && gContent.chunkCount === items.length + artifact.chunks.length + sharedProjectionCount + deltaArtifact.chunks.length + 1);
  A('new approved artifact becomes retrievable only after its fresh generation is active',
    (await search('限流 难度2', gContent!.recipe.id)).some((x) => x.refId === 'qartifact:delta:prompt'));

  // Same text + a different immutable provider revision forces a separate partition. No document vector is updated
  // in place; active pointer flips only after the candidate has a full frozen snapshot.
  process.env.EMBED_MODEL_REVISION = 'proof-r2';
  const g2 = await ensureActiveQbankGeneration(pool, embedder);
  A('different recipe creates G2 and atomically retires the current generation', g2?.status === 'activated' && g2.generationId !== gContent?.generationId
    && Number((await pool.query("SELECT count(*) n FROM qbank_vector_generation WHERE state='active'")).rows[0].n) === 1
    && (await pool.query('SELECT state FROM qbank_vector_generation WHERE id=$1', [gContent!.generationId])).rows[0].state === 'retired');
  const [directVector] = await embedder.embed(['令牌桶 限流']);
  const directSqlBoundary = await asPrincipal(pool, OWNER, async (c) => {
    const retiredAnn = await c.query(
      'SELECT ref_id FROM qbank_generation_ann_search($1,$2::vector,$3)',
      [gContent!.generationId, `[${directVector!.join(',')}]`, 999_999],
    );
    const retiredEvidence = await c.query(
      'SELECT ref_id FROM qbank_generation_evidence($1,$2::text[],$3)',
      [gContent!.generationId, ['qartifact:rate:prompt'], 800],
    );
    const retiredQuestion = await c.query(
      'SELECT question_id FROM qbank_generation_question_evidence($1,$2::text[],$3)',
      [gContent!.generationId, ['qartifact:rate:prompt'], 800],
    );
    const boundedActive = await c.query(
      'SELECT ref_id FROM qbank_generation_ann_search($1,$2::vector,$3)',
      [g2!.generationId, `[${directVector!.join(',')}]`, 999_999],
    );
    const boundedEvidence = await c.query(
      'SELECT ref_id FROM qbank_generation_evidence($1,$2::text[],$3)',
      [g2!.generationId, Array.from({ length: 1000 }, () => 'qartifact:rate:prompt'), 800],
    );
    return {
      retired: retiredAnn.rowCount === 0 && retiredEvidence.rowCount === 0 && retiredQuestion.rowCount === 0,
      bounded: (boundedActive.rowCount ?? 0) <= 50 && (boundedEvidence.rowCount ?? 0) <= 50,
    };
  });
  A('直接 SQL 不能复活 retired generation，超大 k/refs 在数据库内封顶',
    directSqlBoundary.retired && directSqlBoundary.bounded);
  const c3 = await cached(g2!.recipe.id);
  A('active generation flip invalidates cache epoch; new recipe cannot reuse G1 cache', c3.cacheStatus === 'miss');
  let oldRecipeBlocked = false;
  try { await cached(); } catch (e) { oldRecipeBlocked = String(e).includes('qbank_generation_recipe_mismatch'); }
  A('cache request carrying retired recipe fails closed after G2 activation', oldRecipeBlocked);

  const beforeRollback = await epoch();
  await asQbankControlExecutor(pool, (c) => c.query('SELECT qbank_activate_generation($1)', [gContent!.generationId]));
  A('rollback is a pointer flip (no re-embed), only when source epoch is unchanged',
    (await pool.query('SELECT generation_id FROM qbank_active_generation WHERE singleton')).rows[0].generation_id === gContent!.generationId
    && await epoch() === beforeRollback + 1);

  const optionalPartRevoked = await asQbankControlExecutor(pool, (c) =>
    reviewSource(c, 'qs-' + hash(deltaArtifact.chunks[2]!.text), 'approved', 'rejected', 'optional-part takedown'));
  const optionalPartPartial = await asPrincipal(pool, OWNER, (c) =>
    qbankQuestionEvidenceForRefs(c, gContent!.recipe.id, ['qartifact:delta:prompt'], 600));
  A('revoking any mapped optional part suppresses the entire artifact, not only required scoring parts',
    optionalPartRevoked && optionalPartPartial.length === 0);

  const artifactRubricRevoked = await asQbankControlExecutor(pool, (c) =>
    reviewSource(c, 'qs-' + hash(artifact.chunks[1]!.text), 'approved', 'rejected', 'required-rubric takedown'));
  const partialQuestion = await asPrincipal(pool, OWNER, (c) =>
    qbankQuestionEvidenceForRefs(c, g1!.recipe.id, ['qartifact:rate:prompt'], 600));
  A('revoking one required rubric suppresses the complete question artifact rather than returning a partial scoring prompt',
    artifactRubricRevoked && partialQuestion.length === 0);

  const beforePending = await epoch();
  for (let i = 0; i < 8; i++) {
    await asQbankControlExecutor(pool, (c) => c.query(
      `INSERT INTO qbank_source(id,kind,content_hash,status,added_by) VALUES ($1,'manual',$2,'pending',$3)`,
      [`pending-${i}`, hash(`pending content ${i}`), `pending-user-${i}`],
    ));
  }
  A('pending-source flood causes zero visible-corpus cache epoch bumps', await epoch() === beforePending);

  const beforeRevoke = await epoch();
  const revoked = await asQbankControlExecutor(pool, (c) => reviewSource(c, 'qs-' + hash(items[0]!.text), 'approved', 'rejected', 'proof takedown'));
  const active = (await pool.query('SELECT generation_id FROM qbank_active_generation WHERE singleton')).rows[0]?.generation_id as string;
  const hidden = Number((await pool.query('SELECT count(*) n FROM qbank_generation_chunk WHERE generation_id=$1 AND ref_id=$2 AND visible=false', [active, items[0]!.refId])).rows[0]?.n);
  const postRevoke = await search('令牌桶 限流', g1!.recipe.id);
  const evidenceAfterRevoke = await asPrincipal(pool, OWNER, (c) => qbankEvidenceForRefs(c, g1!.recipe.id, [items[0]!.refId], 600));
  A('revoke hides all retained-generation rows, bumps exactly once, and cannot return from hybrid', revoked && hidden === 1
    && await epoch() === beforeRevoke + 1 && !postRevoke.some((x) => x.refId === items[0]!.refId) && evidenceAfterRevoke.length === 0);

  const [legacyVector] = await embedder.embed(['unknown historical content whose original source was lost']);
  await asQbankControlExecutor(pool, (c) => upsertVectorChunk(c, QBANK_OWNER, {
    id: 'legacy-unrebuildable-proof', kind: 'qbank', refId: 'legacy:unrebuildable', contentHash: 'f'.repeat(32), embedding: legacyVector!,
  }));
  process.env.EMBED_MODEL_REVISION = 'proof-r3';
  const blocked = await ensureActiveQbankGeneration(pool, embedder);
  A('legacy qbank vector without reconstructible approved text blocks a new generation instead of guessing a re-embed',
    blocked?.status === 'blocked_unrebuildable_legacy' && blocked.unrebuildableLegacyRefs?.includes('legacy:unrebuildable') === true);

  console.log(`\n${fail === 0 ? '✓ qbank generation: immutable recipe / atomic activation / rollback / retrieval policy / revoke / cache-DoS proof passed' : `✗ ${fail} qbank generation assertions failed`}`);
  await pool.end(); process.exit(fail ? 1 : 0);
}
main().catch(async (e) => { console.error('✗', e?.stack ?? e); await pool.end().catch(() => undefined); process.exit(1); });
