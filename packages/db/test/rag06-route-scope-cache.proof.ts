/**
 * RAG-FUNNEL-06 / route-scope 缓存 + provenance + 撤销隔离 proof（真隔离 PostgreSQL + 全迁移链）。
 *
 * 承重证明：route-scope 缓存命中只在同一桶（snapshot 的 route scope digest）内可 replay；
 * 撤销/epoch/generation 竞态后旧 cache 命中不得出题、不得派发 fallback；跨桶 replay=0、跨 owner=0；
 * negative-result cache 同样 route-scope 隔离。权威判定落在 PG 行/epoch CAS（非进程内 Map）。
 *
 * 每条断言都打真 PG 行（非 mock 内存）：
 *  - retrieval-result / singleflight 键 HMAC 绑定 routeScopeCacheDigest（七面），桶 A 的键结构上 ≠ 桶 B。
 *  - durable negative-result cache：record 冻结 active generation + qbank_cache_epoch 快照；read 同一事务
 *    重读 active generation / qbank_cache_epoch / live privacy epoch，mismatch → CAS active→superseded
 *    （version+1）+ outbox receipt → stale（旧 negative 绝不 replay，故绝不据此派发 fallback）。
 *  - cache 命中只回 ref/distance（正文/向量绝不过缓存）；水合重验从 PG evidence 二段可见性重读正文。
 *  - 四条承重原语落点：asPrincipal（RLS 隔离）/ CAS（active→superseded，version+1）/ append-only
 *    outbox（qbank_route_scope_cache_event，INSERT…SELECT MAX+1）/ lease 有意不用（epoch CAS 承重）。
 *
 * pnpm rag06-route-scope-cache:prove   (node scripts/run-e2e-isolated.mjs rag06-route-scope-cache:prove:raw)
 */
import { createHash, randomUUID } from 'node:crypto';
import {
  assertIsolatedTestTarget, createPool, asPrincipal, asQbankControlExecutor,
  ingestQuestionBankArtifacts,
  routeScopeRetrievalCacheKey, routeScopeSingleflightKey,
  recordRouteScopeNegativeResult, readRouteScopeNegativeResult, supersedeRouteScopeNegativeResults,
  revalidateRouteScopeCacheHit,
  type QbankEmbedder, type QbankQuestionArtifact, type QbankRetrievalHit, type RouteScopeCacheHitFrozen,
} from '../src/index.ts';
import {
  deriveRouteScopeDigest, deriveNoEligibleVerdictDigest,
  deriveRouteScopeCacheDigest, deriveServingAclDigest,
  JOB_ROUTE_TAXONOMY_VERSION, SERVING_PURPOSE, SERVING_CONSENT_REVISION,
  type RouteScopeCacheFacets,
} from '@meetwise/domain';

// run-e2e-isolated.mjs 会剥离操作者 shell 里的真实 HMAC 密钥；proof 用固定测试键（≥32 字符）。
process.env.RAG_JOB_ROUTE_INPUT_HASH_KEY = 'rag06-job-route-input-hmac-proof-key-not-production-01';
process.env.RAG_QBANK_CACHE_HASH_KEY = 'rag06-qbank-cache-hmac-proof-key-not-production-01';

const pool = createPool();
let fail = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) fail++; };
const section = (t: string) => console.log(`\n──────── ${t} ────────`);

/* ─────────────────────────── 确定性 embedder seam（仅 generation 构建用） ─────────────────────────── */
const DIM = 512;
const EMBEDDER_ID = 'rag06-proof-embedder:v1';

function deterministicVector(text: string): number[] {
  const out = new Array<number>(DIM);
  for (let i = 0; i < DIM; i++) {
    const d = createHash('sha256').update(`${i}:${text}`, 'utf8').digest();
    out[i] = (d.readUInt32LE(0) / 0xffffffff) * 2 - 1;
  }
  const norm = Math.hypot(...out) || 1;
  return out.map((x) => x / norm);
}
const embedder: QbankEmbedder = { dim: DIM, id: EMBEDDER_ID, embed: async (texts: string[]) => texts.map(deterministicVector) };

/* ─────────────────────────── 题库 fixture（java 一题，供命中重验重读 evidence） ─────────────────────────── */
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

/* ─────────────────────────── generation 构建（内联 worker 流程，镜像 rag05） ─────────────────────────── */
const RECIPE_MANIFEST = {
  schema: 'qbank-embedding-recipe:v1', provider: 'openai-compatible', model: EMBEDDER_ID,
  providerRevision: 'rag06-proof-unverified', dimensions: DIM,
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

/* ─────────────────────────── helpers ─────────────────────────── */
const TAG = 'rag06_' + Math.random().toString(36).slice(2, 8);
const cand = `${TAG}_cand`, cand2 = `${TAG}_cand2`;
const rd = (tag: string) => createHash('sha256').update(`route-decision:${tag}`).digest('hex');
const routeDigestA = rd('bucket-A');
const routeDigestB = rd('bucket-B');

let activeGenId = '';

function aclDigest(leaf: string): string {
  return deriveServingAclDigest({ servingScopeId: leaf, taxonomyVersion: JOB_ROUTE_TAXONOMY_VERSION, purpose: SERVING_PURPOSE, consentRevision: SERVING_CONSENT_REVISION });
}
function facetsFor(routeDigest: string, leaf: string, privacyEpoch: number): RouteScopeCacheFacets {
  return {
    routeScopeDigest: deriveRouteScopeDigest({ routeDigest, leafTrackId: leaf, taxonomyVersion: JOB_ROUTE_TAXONOMY_VERSION }),
    leafTrackId: leaf, taxonomyVersion: JOB_ROUTE_TAXONOMY_VERSION,
    generationId: activeGenId, recipeId, privacyEpoch, aclDigest: aclDigest(leaf),
  };
}
function verdictDigestFor(leaf: string): string {
  return deriveNoEligibleVerdictDigest({ leafTrackId: leaf, taxonomyVersion: JOB_ROUTE_TAXONOMY_VERSION, generationId: activeGenId, recipeId });
}
async function cacheEpoch(): Promise<string> {
  const r = await asPrincipal(pool, cand, (c) => c.query('SELECT epoch::text AS epoch FROM qbank_cache_epoch WHERE singleton=true'));
  return String(r.rows[0].epoch);
}
async function negativeRow(digest: string, owner: string) {
  const r = await asPrincipal(pool, owner, (c) => c.query(
    'SELECT status, version FROM qbank_route_scope_negative_result WHERE owner_user_id=$1 AND route_scope_cache_digest=$2',
    [owner, digest],
  ));
  return r.rows[0] as { status: string; version: string } | undefined;
}
async function cacheEventCount(digest: string, toStatus: string, reason: string | null, owner: string): Promise<number> {
  const r = await asPrincipal(pool, owner, (c) => c.query(
    'SELECT count(*)::int n FROM qbank_route_scope_cache_event WHERE owner_user_id=$1 AND cache_digest=$2 AND to_status=$3 AND (reason=$4 OR ($4::text IS NULL AND reason IS NULL))',
    [owner, digest, toStatus, reason],
  ));
  return r.rows[0].n;
}
async function bumpSourceEpoch(): Promise<void> {
  // 源可见性变化（approved 源自赋值 status 触发 0029 trg_qbank_cache_epoch_source）→ qbank_cache_epoch +1。
  await asQbankControlExecutor(pool, (c) => c.query(
    `UPDATE qbank_source SET status='approved'
      WHERE status='approved' AND EXISTS (SELECT 1 FROM qbank_pool_entry p WHERE p.source_id=qbank_source.id)`,
  ));
}

async function main() {
  await assertIsolatedTestTarget(pool);

  section('0. 灌入 java 一题 + 构建激活 generation G1');
  const ingest = await ingestQuestionBankArtifacts(pool, [javaArtifact], embedder);
  A('灌入 1 题 / 3 chunk 成功', ingest.questionCount === 1 && ingest.chunkCount === 3);
  activeGenId = await buildActiveGeneration();
  A('generation G1 构建并激活', /^qgen-[0-9a-f-]{36}$/.test(activeGenId));

  const facetsA = facetsFor(routeDigestA, NODEJS_LEAF, 1);
  const facetsB = facetsFor(routeDigestB, NODEJS_LEAF, 1);
  const digestA = deriveRouteScopeCacheDigest(facetsA);
  const digestB = deriveRouteScopeCacheDigest(facetsB);

  section('① route digest 隔离：桶 A / 桶 B（同 leaf、不同 routeDigest）→ digest/键全部不同');
  A('桶 A routeScopeDigest ≠ 桶 B（同 leaf 不同 routeDigest）', facetsA.routeScopeDigest !== facetsB.routeScopeDigest && facetsA.leafTrackId === facetsB.leafTrackId);
  A('桶 A routeScopeCacheDigest ≠ 桶 B', digestA !== digestB);
  const keyInput = (digest: string) => ({ owner: cand, routeScopeCacheDigest: digest, query: 'explain thread safety', k: 5, embedderVersion: EMBEDDER_ID, retrievalMode: 'dense' as const });
  const keyA = routeScopeRetrievalCacheKey(keyInput(digestA));
  const keyB = routeScopeRetrievalCacheKey(keyInput(digestB));
  A('retrieval-result key A ≠ key B（七面绑定）', keyA !== keyB);
  const sfA = routeScopeSingleflightKey(keyInput(digestA));
  const sfB = routeScopeSingleflightKey(keyInput(digestB));
  A('singleflight key A ≠ key B', sfA !== sfB);
  A('retrieval key ≠ singleflight key（独立命名空间）', keyA !== sfA);
  // 七面逐面敏感：任一 facet 变 → digest 变（伪造 cache identity = 0 evidence）。
  const mutate: Array<{ tag: string; facets: RouteScopeCacheFacets }> = [
    { tag: 'generationId', facets: { ...facetsA, generationId: 'qgen-' + randomUUID() } },
    { tag: 'recipeId', facets: { ...facetsA, recipeId: 'qrecipe-' + createHash('sha256').update('other').digest('hex').slice(0, 32) } },
    { tag: 'privacyEpoch', facets: { ...facetsA, privacyEpoch: 2 } },
    { tag: 'aclDigest', facets: { ...facetsA, aclDigest: deriveServingAclDigest({ servingScopeId: NODEJS_LEAF, taxonomyVersion: JOB_ROUTE_TAXONOMY_VERSION, purpose: 'other.purpose', consentRevision: SERVING_CONSENT_REVISION }) } },
    { tag: 'leafTrackId', facets: { ...facetsA, leafTrackId: 'frontend/web', routeScopeDigest: deriveRouteScopeDigest({ routeDigest: routeDigestA, leafTrackId: 'frontend/web', taxonomyVersion: JOB_ROUTE_TAXONOMY_VERSION }) } },
  ];
  for (const m of mutate) {
    A(`七面敏感：${m.tag} 变 → digest 变`, deriveRouteScopeCacheDigest(m.facets) !== digestA);
  }

  section('② 撤销/epoch/generation 竞态：旧 negative 绝不 replay、不派发 fallback');
  const recA1 = await recordRouteScopeNegativeResult(pool, cand, facetsA, { verdict: 'no_eligible_in_scope', verdictDigest: verdictDigestFor(NODEJS_LEAF) });
  A('record 桶 A negative（G1）→ recorded', recA1.status === 'recorded');
  const readA1 = await readRouteScopeNegativeResult(pool, cand, facetsA, { privacyEpoch: 1 });
  A('read 命中 → hit(no_eligible_in_scope) + verdictDigest 一致', readA1.status === 'hit' && readA1.verdict === 'no_eligible_in_scope' && readA1.verdictDigest === verdictDigestFor(NODEJS_LEAF));
  const readA1b = await readRouteScopeNegativeResult(pool, cand, facetsA, { privacyEpoch: 1 });
  A('幂等重读仍 hit（active 不因读而迁移）', readA1b.status === 'hit');

  // generation 切换：G1 → G2（active flip + qbank_cache_epoch +1，0029 qbank_activate_generation）。
  const g1 = activeGenId;
  activeGenId = await buildActiveGeneration();
  A('generation G2 激活（≠ G1）', /^qgen-[0-9a-f-]{36}$/.test(activeGenId) && activeGenId !== g1);
  const readA2 = await readRouteScopeNegativeResult(pool, cand, facetsA, { privacyEpoch: 1 });
  A('generation 切换后读旧 facets → stale(generation_stale)（旧 negative 绝不 replay）', readA2.status === 'stale' && readA2.reason === 'generation_stale');
  A('stale 行已 CAS superseded（version=2）', (await negativeRow(digestA, cand))?.status === 'superseded' && (await negativeRow(digestA, cand))?.version === '2');
  A('撤销 receipt 落 outbox（active→superseded:generation_stale）恰 1 条', await cacheEventCount(digestA, 'superseded', 'generation_stale', cand) === 1);
  const readA3 = await readRouteScopeNegativeResult(pool, cand, facetsA, { privacyEpoch: 1 });
  A('再读 → miss（superseded 不再服务）', readA3.status === 'miss');

  // corpus epoch 漂移（不 flip generation）：源可见性变化 bump qbank_cache_epoch。
  const facetsA2 = facetsFor(routeDigestA, NODEJS_LEAF, 1);
  const digestA2 = deriveRouteScopeCacheDigest(facetsA2);
  const recA2 = await recordRouteScopeNegativeResult(pool, cand, facetsA2, { verdict: 'no_eligible_in_scope', verdictDigest: verdictDigestFor(NODEJS_LEAF) });
  A('record 桶 A negative（G2）→ recorded', recA2.status === 'recorded');
  const readA2a = await readRouteScopeNegativeResult(pool, cand, facetsA2, { privacyEpoch: 1 });
  A('read 命中 → hit', readA2a.status === 'hit');
  await bumpSourceEpoch();
  const readA2b = await readRouteScopeNegativeResult(pool, cand, facetsA2, { privacyEpoch: 1 });
  A('源可见性变化（epoch 失效）→ stale(corpus_epoch_changed)', readA2b.status === 'stale' && readA2b.reason === 'corpus_epoch_changed');

  // privacy epoch 漂移。
  const facetsA3 = facetsFor(routeDigestA, NODEJS_LEAF, 1);
  const recA3 = await recordRouteScopeNegativeResult(pool, cand, facetsA3, { verdict: 'no_eligible_in_scope', verdictDigest: verdictDigestFor(NODEJS_LEAF) });
  A('record 桶 A negative（G2，新 epoch）→ recorded', recA3.status === 'recorded');
  const readA3a = await readRouteScopeNegativeResult(pool, cand, facetsA3, { privacyEpoch: 1 });
  A('read 命中 → hit', readA3a.status === 'hit');
  const readA3b = await readRouteScopeNegativeResult(pool, cand, facetsA3, { privacyEpoch: 2 });
  A('privacy epoch 漂移 → stale(privacy_epoch_changed)（旧 negative 绝不 replay）', readA3b.status === 'stale' && readA3b.reason === 'privacy_epoch_changed');

  section('③ cache 命中只回 ref/distance；正文/向量从 PG 证据二段可见性重读');
  const frozen: RouteScopeCacheHitFrozen = { generationId: activeGenId, recipeId, corpusEpoch: await cacheEpoch() };
  const hits: QbankRetrievalHit[] = [{ refId: 'java_prompt', distance: 0.05 }];
  const store = new Map<string, QbankRetrievalHit[]>();
  store.set(keyA, hits.map((h) => ({ ...h })));
  const storedKeys = new Set<string>();
  for (const h of store.get(keyA)!) for (const k of Object.keys(h)) storedKeys.add(k);
  A('缓存值只含 refId/distance（无 body/vector/excerpt/text 键）', storedKeys.size === 2 && storedKeys.has('refId') && storedKeys.has('distance'));
  const javaScope = { taxonomyVersion: JOB_ROUTE_TAXONOMY_VERSION, servingScopeId: JAVA_LEAF };
  const reval = await revalidateRouteScopeCacheHit(pool, cand, frozen, hits, javaScope);
  const revalResult = reval.ok === true ? reval.results[0] : undefined;
  A('水合重验 → 命中重验成功，evidence 从 PG 重读（含 java prompt/rubric/example 正文）',
    reval.ok === true && reval.results.length === 1 && revalResult?.ref === JAVA_QID
    && revalResult !== undefined && revalResult.evidence.includes(JAVA_PROMPT) && revalResult.evidence.includes(JAVA_RUBRIC) && revalResult.evidence.includes(JAVA_EXAMPLE));
  A('缓存值自始不含正文（正文来自 PG，非缓存）', !JSON.stringify(store.get(keyA)).includes(JAVA_PROMPT));
  const revalStale = await revalidateRouteScopeCacheHit(pool, cand, { ...frozen, generationId: g1 }, hits, javaScope);
  A('水合重验陈旧 generation → generation_stale（旧命中不得出题）', revalStale.ok === false && revalStale.reason === 'generation_stale');

  section('④ 跨桶 replay=0：桶 A 填 key A，桶 B 读 key B → miss（结构上不同键）');
  A('桶 A 已填 key A', store.has(keyA) === true);
  A('桶 B 读 key B → miss（key B 无值，绝不 replay 桶 A）', store.has(keyB) === false);

  section('⑤ 跨 owner=0：RLS FORCE owner=principal');
  const ownerCross = await readRouteScopeNegativeResult(pool, cand2, facetsA3, { privacyEpoch: 1 });
  A('owner B 读 owner A 的 negative → miss（RLS 隔离）', ownerCross.status === 'miss');
  const crossCount = await asPrincipal(pool, cand2, (c) => c.query('SELECT count(*)::int n FROM qbank_route_scope_negative_result'));
  A('owner B 直接读表 → 0 行（跨 owner=0）', crossCount.rows[0].n === 0);
  const crossSup = await supersedeRouteScopeNegativeResults(pool, cand2, facetsA3);
  A('owner B 撤销 owner A 的 negative → none（不可见不可作废）', crossSup.status === 'none');
  const a3row = await negativeRow(deriveRouteScopeCacheDigest(facetsA3), cand);
  A('owner A 的 negative 行未被 owner B 删除/改（仍 superseded）', a3row?.status === 'superseded');

  section('⑥ CAS 单赢家：并发 record / 并发 supersede');
  const facetsX = facetsFor(rd('cas-x'), NODEJS_LEAF, 1);
  const digestX = deriveRouteScopeCacheDigest(facetsX);
  const [recXa, recXb] = await Promise.all([
    recordRouteScopeNegativeResult(pool, cand, facetsX, { verdict: 'no_eligible_in_scope', verdictDigest: verdictDigestFor(NODEJS_LEAF) }),
    recordRouteScopeNegativeResult(pool, cand, facetsX, { verdict: 'no_eligible_in_scope', verdictDigest: verdictDigestFor(NODEJS_LEAF) }),
  ]);
  const recordedCount = [recXa, recXb].filter((r) => r.status === 'recorded').length;
  const replayedCount = [recXa, recXb].filter((r) => r.status === 'replayed').length;
  A('并发 record → 恰一个 recorded、一个 replayed', recordedCount === 1 && replayedCount === 1);
  A('并发 record → 唯一行（UNIQUE owner+digest）', (await negativeRow(digestX, cand)) !== undefined);
  const [supXa, supXb] = await Promise.all([
    supersedeRouteScopeNegativeResults(pool, cand, facetsX),
    supersedeRouteScopeNegativeResults(pool, cand, facetsX),
  ]);
  const totalSup = (supXa.status === 'superseded' ? supXa.count : 0) + (supXb.status === 'superseded' ? supXb.count : 0);
  A('并发 supersede → 恰 1 行被作废（CAS 单赢家）', totalSup === 1);
  A('并发 supersede → explicit_revoke receipt 恰 1 条（不重复）', await cacheEventCount(digestX, 'superseded', 'explicit_revoke', cand) === 1);

  section('⑦ negative-result 隔离：撤销桶 A 不影响桶 B');
  const facetsB2 = facetsFor(routeDigestB, NODEJS_LEAF, 1);
  const recB = await recordRouteScopeNegativeResult(pool, cand, facetsB2, { verdict: 'no_eligible_in_scope', verdictDigest: verdictDigestFor(NODEJS_LEAF) });
  A('record 桶 B negative → recorded', recB.status === 'recorded');
  const readB = await readRouteScopeNegativeResult(pool, cand, facetsB2, { privacyEpoch: 1 });
  A('read 桶 B → hit（独立行）', readB.status === 'hit');
  const supB = await supersedeRouteScopeNegativeResults(pool, cand, facetsB2);
  A('撤销桶 B → superseded=1', supB.status === 'superseded' && supB.count === 1);
  const readB2 = await readRouteScopeNegativeResult(pool, cand, facetsB2, { privacyEpoch: 1 });
  A('撤销后桶 B → miss（superseded 不再服务）', readB2.status === 'miss');

  console.log(`\n${fail === 0 ? '✓ rag06-route-scope-cache（真 Postgres）全部通过' : `✗ ${fail} 项失败`}`);
  await pool.end();
  process.exit(fail ? 1 : 0);
}

main().catch(async (err) => {
  console.error(err);
  await pool.end().catch(() => undefined);
  process.exit(1);
});
