/**
 * GAP-RAG-03 · R3-HNSW-COMPLETENESS proof（Line AQ · AUTHORIZE coding+prove @c124fa53）.
 *
 * Harness: ai-docs/delivery/harness/aq-gap-rag-03-r3-hnsw-completeness.md CC-H1..CC-H8.
 * Parent filter-locus nail `1024bfc` left P-HNSW = HNSW_NOT_EXERCISED. This knife:
 *   - mig 0139 pins hnsw.iterative_scan=strict_order on qbank_generation_ann_search
 *   - P-HNSW GUCs: enable_seqscan=off + enable_sort=off → Index Scan qgc_hnsw_visible_*
 *   - live plan via auto_explain nested statements (CC-H2 AUTHORIZE-named method)
 *   - retains R3-HNSW-SAFETY · records hnswReturned · Ban close :71 · Ban wash GAP-RAG-02
 *
 * Fixture/build path copied from rag03-filter-locus.proof.ts (F-STARVE corpus).
 * Ban FULLTEXT · Ban Qdrant · Ban covered flip · Ban invent prove · Ban Meridian ·
 * Ban secrets · Ban buy cloud · HOLD AN-CIMG-EA · NOT_HA · releaseEvidence=false ·
 * coveredCount=8 · PG-retained · DELETE=503.
 *
 * pnpm rag03-hnsw-completeness:prove
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import type { PoolClient } from 'pg';
import {
  assertIsolatedTestTarget, createPool, asPrincipal, asQbankControlExecutor,
  ingestQbank, hybridQbankSearch, upsertVectorChunk,
  type QbankEmbedder, type QbankItem, type QbankHybridHit,
} from '../src/index.ts';

const pool = createPool();
let fail = 0;
const red: string[] = [];
const green: string[] = [];
const A = (name: string, ok: boolean, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' ' + detail : ''}`);
  if (ok) green.push(name); else { fail++; red.push(name); }
};
const section = (t: string) => console.log(`\n──────── ${t} ────────`);

/* ─────────────────────────── 常量 ─────────────────────────── */
const DIM = 512;
const K = 5;
const T1 = 'v1';                      // harness scope (S1, T1)
const S1 = 'backend/nodejs';
const S_OTHER = 'backend/java';       // 越界 leaf（同 taxonomy）
const T_OTHER = 'v2';                 // 越界 taxonomy（同 leaf · MUT-2 承重）
const PRINCIPAL = 'rag03hnsw_' + Math.random().toString(36).slice(2, 8);
const SCOPE = { taxonomyVersion: T1, servingScopeId: S1 };
const NO_LEXICAL_QUERY = 'qwvzkx';    // 不出现在任何 chunk 文本中 → lexical 0 行
const REPO_ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const STATIC_TARGET = 'packages/db/src/qbank/qbank-generation-retrieval.ts';

/* ─────────────────────────── 精确距离向量构造 ─────────────────────────── */
// q = e_axis；doc = s·e_axis + sqrt(1-s²)·e_j（j 独占正交轴）→ cos distance = 1 - s（精确可控）。
function axis(i: number): number[] { const v = new Array<number>(DIM).fill(0); v[i] = 1; return v; }
function atDistance(queryAxis: number, ownAxis: number, d: number): number[] {
  const s = 1 - d;
  const v = new Array<number>(DIM).fill(0);
  v[queryAxis] = s; v[ownAxis] = Math.sqrt(Math.max(0, 1 - s * s));
  return v;
}
const vecLit = (e: number[]) => `[${e.join(',')}]`;
const round = (x: number) => Math.round(x * 1e6) / 1e6;

interface FixtureRef { refId: string; taxonomyVersion: string; servingScopeId: string; dist: number; vector: number[]; group: string }
const vectorByRef = new Map<string, number[]>();

function mkRefs(prefix: string, group: string, n: number, queryAxis: number, axisStart: number,
  distOf: (i: number) => number, taxonomyVersion: string, servingScopeId: string): FixtureRef[] {
  return Array.from({ length: n }, (_, i) => {
    const refId = `${prefix}_${String(i).padStart(2, '0')}`;
    const dist = round(distOf(i));
    const vector = atDistance(queryAxis, axisStart + i, dist);
    vectorByRef.set(refId, vector);
    return { refId, taxonomyVersion, servingScopeId, dist, vector, group };
  });
}

/** generation 模式 ingest 不调用 embedder；向量由 vectorByRef 在 generation 构建时写入。 */
const unusedEmbedder: QbankEmbedder = {
  dim: DIM, id: 'rag03hnsw-proof-embedder:v1',
  embed: async () => { throw new Error('rag03hnsw_embedder_must_not_be_called_in_generation_mode'); },
};

async function ingest(refs: FixtureRef[]): Promise<void> {
  const items: QbankItem[] = refs.map((r) => ({
    refId: r.refId,
    text: `rag03 hnsw completeness fixture ${r.group} ${r.refId} alpha bravo charlie`,
    taxonomyVersion: r.taxonomyVersion, servingScopeId: r.servingScopeId, annotationSource: 'seed_v1_reviewed',
  }));
  const n = await ingestQbank(pool, items, unusedEmbedder);
  if (n !== items.length) throw new Error(`rag03hnsw_ingest_short:${n}/${items.length}`);
}

/* ─────────────────────────── generation 构建（内联 worker 流程 · 同 rag04 proof） ─────────────────────────── */
const RECIPE_MANIFEST = {
  schema: 'qbank-embedding-recipe:v1', provider: 'openai-compatible', model: 'rag03hnsw-proof-embedder:v1',
  providerRevision: 'rag03hnsw-proof-unverified', dimensions: DIM, chunkerVersion: 'whole-qbank-item:v1',
  normalizationVersion: 'utf8-nfc-trim:v1', documentPrefixVersion: 'none:v1', queryPrefixVersion: 'none:v1',
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

/**
 * 构建并激活 generation。`includeUnapprovedRefIds`：F-STARVE 用 —— 这些 ref 的源已先经正常撤销路径变为
 * rejected，builder 的事实集仍把它们写成 visible 行（经既有 control-executor INSERT · 不绕任何 trigger ·
 * FK/only-building/validate 计数与 epoch 校验全部照常生效）。理由：撤销→可见性同步 trigger
 * （0029 `qbank_source_visible_epoch_sync` · 0069 重定义）会把**已存在**的 generation 行置 visible=false，
 * 故「visible=true 但不在 qbank_retrieval_candidate」只能来自 builder 侧事实集与当前批准状态不一致 ——
 * 这正是 ANN 函数内 candidate JOIN 作为纵深防线要兜住的状态（披露见收据 fixtureConstruction）。
 */
async function buildActiveGeneration(includeUnapprovedRefIds: string[] = []): Promise<string> {
  await persistRecipe();
  const { epoch, facts } = await asQbankControlExecutor(pool, async (c) => {
    const e = await c.query('SELECT epoch::text AS epoch FROM qbank_corpus_epoch WHERE singleton=true');
    const rows = await c.query(
      `SELECT ch.ref_id, ch.content_hash, cs.taxonomy_version, cs.serving_scope_id
         FROM qbank_chunk ch
         JOIN qbank_pool_entry pool
           ON pool.ref_id=ch.ref_id AND pool.source_id=ch.source_id AND pool.content_hash=ch.content_hash
         JOIN qbank_source source ON source.id=pool.source_id AND source.content_hash=pool.content_hash
         JOIN qbank_chunk_serving_scope cs ON cs.ref_id=ch.ref_id
        WHERE (source.status='approved' OR ch.ref_id = ANY($1::text[]))
          AND (pool.content_hash=left(encode(digest(convert_to(ch.content, 'UTF8'), 'sha256'), 'hex'), 32)
               OR pool.content_hash=encode(digest(convert_to(ch.content, 'UTF8'), 'sha256'), 'hex'))
        ORDER BY ch.ref_id, cs.taxonomy_version, cs.serving_scope_id`, [includeUnapprovedRefIds]);
    return {
      epoch: String(e.rows[0].epoch),
      facts: rows.rows.map((r) => ({ refId: String(r.ref_id), contentHash: String(r.content_hash), taxonomyVersion: String(r.taxonomy_version), servingScopeId: String(r.serving_scope_id) })),
    };
  });
  const generationId = 'qgen-' + randomUUID();
  await asQbankControlExecutor(pool, async (c) => {
    await c.query(`INSERT INTO qbank_vector_generation(id,recipe_id,source_epoch,expected_chunk_count,state)
                   VALUES ($1,$2,$3::bigint,$4,'building')`, [generationId, recipeId, epoch, facts.length]);
    await c.query('SELECT qbank_prepare_generation_partition($1)', [generationId]);
  });
  await asQbankControlExecutor(pool, async (c) => {
    const params: unknown[] = [];
    const values = facts.map((f, i) => {
      const v = vectorByRef.get(f.refId);
      if (!v) throw new Error(`rag03hnsw_missing_vector:${f.refId}`);
      const p = i * 6;
      params.push(generationId, f.refId, f.taxonomyVersion, f.servingScopeId, f.contentHash, vecLit(v));
      return `($${p + 1},$${p + 2},$${p + 3},$${p + 4},$${p + 5},$${p + 6}::vector)`;
    }).join(',');
    await c.query(`INSERT INTO qbank_generation_chunk(generation_id,ref_id,taxonomy_version,serving_scope_id,content_hash,embedding)
                   VALUES ${values}`, params);
  });
  await asQbankControlExecutor(pool, (c) => c.query('SELECT qbank_validate_generation($1)', [generationId]));
  await asQbankControlExecutor(pool, (c) => c.query('SELECT qbank_activate_generation($1)', [generationId]));
  return generationId;
}

/** approved → rejected（与 qbank-handoff-closure.proof 同一 control-executor 撤销路径；不绕 trigger）。 */
async function revoke(refIds: string[]): Promise<number> {
  return asQbankControlExecutor(pool, async (c) => {
    const r = await c.query(
      `UPDATE qbank_source s
          SET status='rejected', reviewed_by='rag03hnsw-proof', review_note='R3 HNSW-completeness fixture: unapproved',
              reviewed_at=now(), version=version+1
        WHERE s.status='approved' AND s.id IN (SELECT ch.source_id FROM qbank_chunk ch WHERE ch.ref_id = ANY($1::text[]))`,
      [refIds]);
    return r.rowCount ?? 0;
  });
}

async function generationVisibleCount(generationId: string, refIds: string[]): Promise<number> {
  const r = await pool.query('SELECT count(*)::int n FROM qbank_generation_chunk WHERE generation_id=$1 AND visible AND ref_id = ANY($2::text[])', [generationId, refIds]);
  return r.rows[0].n as number;
}

async function candidateCount(refIds: string[]): Promise<number> {
  const r = await pool.query('SELECT count(*)::int n FROM qbank_retrieval_candidate WHERE ref_id = ANY($1::text[])', [refIds]);
  return r.rows[0].n as number;
}

/* ─────────────────────────── 计划 · EXPLAIN（substituted body） ─────────────────────────── */
type PlanName = 'P-EXACT' | 'P-DEFAULT' | 'P-HNSW';
const PLAN_GUCS: Record<PlanName, string[]> = {
  'P-EXACT': ['SET LOCAL enable_indexscan = off', 'SET LOCAL enable_bitmapscan = off'],
  'P-DEFAULT': [],
  // enable_sort=off forces ordered HNSW index scan (CC-H1); iterative_scan pinned by 0139 on function.
  'P-HNSW': ['SET LOCAL enable_seqscan = off', 'SET LOCAL enable_sort = off'],
};

let annFunctionBody: string | undefined;
async function catalogAnnBody(): Promise<string> {
  if (annFunctionBody) return annFunctionBody;
  const r = await pool.query("SELECT pg_get_functiondef('qbank_generation_ann_search(text,vector,integer)'::regprocedure) AS def");
  const def = String(r.rows[0].def);
  const m = def.match(/AS \$function\$([\s\S]*)\$function\$/);
  if (!m?.[1]) throw new Error('rag03hnsw_ann_body_unparseable');
  annFunctionBody = m[1];
  return annFunctionBody;
}

function substitute(body: string, generationId: string, embedding: number[], k: number): string {
  return body
    .replace(/\bp_generation\b/g, `'${generationId}'::text`)
    .replace(/\bp_embedding\b/g, `'${vecLit(embedding)}'::vector`)
    .replace(/\bp_k\b/g, `${k}::integer`);
}

function planContains(json: unknown, needle: string): boolean { return JSON.stringify(json).includes(needle); }
function hnswIndexScan(json: unknown): boolean {
  const walk = (n: any): boolean => !!n && typeof n === 'object' && (
    ((n['Node Type'] === 'Index Scan' || n['Node Type'] === 'Index Only Scan') && String(n['Index Name'] ?? '').startsWith('qgc_hnsw_visible_'))
    || (Array.isArray(n) ? n.some(walk) : Object.values(n).some(walk)));
  return walk(json);
}

function extractHnswIndexName(json: unknown): string | null {
  let found: string | null = null;
  const walk = (n: any): void => {
    if (!n || typeof n !== 'object') return;
    if ((n['Node Type'] === 'Index Scan' || n['Node Type'] === 'Index Only Scan')
      && String(n['Index Name'] ?? '').startsWith('qgc_hnsw_visible_')) found = String(n['Index Name']);
    if (Array.isArray(n)) n.forEach(walk); else Object.values(n).forEach(walk);
  };
  walk(json);
  return found;
}

async function enableAutoExplain(c: PoolClient): Promise<void> {
  await c.query("LOAD 'auto_explain'");
  await c.query('SET auto_explain.log_min_duration = 0');
  await c.query('SET auto_explain.log_analyze = true');
  await c.query('SET auto_explain.log_nested_statements = true');
  await c.query("SET auto_explain.log_format = json");
  await c.query('SET client_min_messages = log');
}

function parseLivePlanFromNotices(notices: string[]): unknown | null {
  const blobs: unknown[] = [];
  for (const msg of notices) {
    const idx = msg.indexOf('{');
    if (idx < 0) continue;
    try { blobs.push(JSON.parse(msg.slice(idx))); } catch { /* partial */ }
  }
  for (const b of blobs) if (planContains(b, 'qgc_hnsw_visible_')) return b;
  for (const b of blobs) {
    if (b && typeof b === 'object' && ('Plan' in (b as object) || 'QUERY PLAN' in (b as object))) return b;
  }
  return blobs[0] ?? null;
}

interface PlanRun {
  plan: PlanName; explain: unknown; liveExplain: unknown | null;
  planSource: string; livePlan: string; hnswUsed: boolean; hnswIndexName: string | null;
  rows: { refId: string; distance: number }[]; noticeCount: number;
}
/** 同一事务：替换体 EXPLAIN + 真函数调用；auto_explain 捕获 live 内层计划（CC-H2）。 */
async function runUnderPlan(plan: PlanName, generationId: string, embedding: number[], k: number): Promise<PlanRun> {
  const body = substitute(await catalogAnnBody(), generationId, embedding, k);
  const c: PoolClient = await pool.connect();
  const notices: string[] = [];
  const onNotice = (n: { message?: string }) => { if (n?.message) notices.push(n.message); };
  c.on('notice', onNotice);
  try {
    await c.query('BEGIN');
    await c.query("SELECT set_config('app.qbank_serving_scope', $1, true)", [S1]);
    await c.query("SELECT set_config('app.qbank_taxonomy_version', $1, true)", [T1]);
    for (const g of PLAN_GUCS[plan]) await c.query(g);
    // Mirror 0139 function SET on substituted body so EXPLAIN matches live iterative_scan.
    if (plan === 'P-HNSW') await c.query("SET LOCAL hnsw.iterative_scan = 'strict_order'");
    const ex = await c.query(`EXPLAIN (ANALYZE, FORMAT JSON) ${body}`);
    const explain = ex.rows[0]['QUERY PLAN'];
    await enableAutoExplain(c);
    notices.length = 0;
    const live = await c.query('SELECT ref_id, distance FROM qbank_generation_ann_search($1,$2::vector,$3)', [generationId, vecLit(embedding), k]);
    const liveExplain = parseLivePlanFromNotices(notices);
    await c.query('ROLLBACK');
    const subHnsw = hnswIndexScan(explain);
    const liveHnsw = liveExplain ? hnswIndexScan(liveExplain) : false;
    const hnswUsed = subHnsw || liveHnsw;
    const hnswIndexName = extractHnswIndexName(liveExplain) ?? extractHnswIndexName(explain);
    const planSource = liveExplain
      ? (liveHnsw ? 'auto_explain_nested+substituted_body' : 'auto_explain_nested+substituted_body')
      : 'substituted_body_only';
    const livePlan = liveExplain ? 'LIVE_PLAN_CAPTURED_AUTO_EXPLAIN' : 'LIVE_PLAN_NOT_CAPTURED';
    return {
      plan, explain, liveExplain, planSource, livePlan, hnswUsed, hnswIndexName, noticeCount: notices.length,
      rows: live.rows.map((r) => ({ refId: String(r.ref_id), distance: Number(r.distance) })),
    };
  } catch (e) { await c.query('ROLLBACK').catch(() => undefined); throw e; }
  finally { c.off('notice', onNotice); c.release(); }
}

/** serving 路径（hybridQbankSearch · app_role）在 P-EXACT 会话 GUC 下调用。 */
async function servingSearch(embedding: number[], mode: 'dense' | 'rrf', exact = true): Promise<QbankHybridHit[]> {
  return asPrincipal(pool, PRINCIPAL, async (c) => {
    if (exact) for (const g of PLAN_GUCS['P-EXACT']) await c.query(g);
    return hybridQbankSearch(c, { query: NO_LEXICAL_QUERY, embedding, k: K, expectedRecipeId: recipeId, retrievalMode: mode, scope: SCOPE });
  });
}

const fmtHits = (hits: { refId: string; distance: number }[]) => hits.map((h) => ({ refId: h.refId, distance: round(h.distance) }));
const sameList = (a: string[], b: string[]) => a.length === b.length && a.every((x, i) => x === b[i]);
const ascending = (hits: { distance: number }[]) => hits.every((h, i) => i === 0 || hits[i - 1]!.distance <= h.distance);

/* ─────────────────────────── main ─────────────────────────── */
async function main() {
  await assertIsolatedTestTarget(pool);
  const receipt: Record<string, unknown> = {
    knife: 'AQ-GAP-RAG-03-R3-HNSW-COMPLETENESS', requestSha: 'c124fa53', principal: PRINCIPAL,
    stack: 'PG-retained (Postgres/pgvector) · Ban MySQL/Qdrant/FULLTEXT', gapRag03: 'OPEN',
    pins: { haStatus: 'NOT_HA', releaseEvidence: false, claimProductionHA: false, coveredCount: 8, deletePublic: 503 },
    e2eTestContainer: process.env.E2E_TEST_CONTAINER ?? null,
  };
  const ext = await pool.query("SELECT extversion FROM pg_extension WHERE extname='vector'");
  const pgv = await pool.query('SELECT version() AS v');
  receipt.pgvectorExtversion = ext.rows[0]?.extversion ?? null;
  receipt.serverVersion = pgv.rows[0]?.v ?? null;
  console.log(`AQ_HNSW_RECEIPT pgvector_extversion=${String(receipt.pgvectorExtversion)} container=${String(receipt.e2eTestContainer)}`);
  const cfg = await pool.query(`SELECT proconfig FROM pg_proc WHERE oid='qbank_generation_ann_search(text,vector,integer)'::regprocedure`);
  const proconfig = (cfg.rows[0]?.proconfig as string[] | null) ?? [];
  receipt.annSearchProconfig = proconfig;
  A('AQ-HNSW-ITERATIVE-PIN',
    proconfig.some((x) => x === 'hnsw.iterative_scan=strict_order') && proconfig.some((x) => x.startsWith('search_path=')),
    `proconfig=${JSON.stringify(proconfig)}`);

  /* ── S-LEGACY-STATIC（§4.4 · 整文件原始文本字面计数 · 不剥注释 · 不做形态匹配） ── */
  section('S-LEGACY-STATIC：qbank-generation-retrieval.ts 整文件字面计数');
  const src = readFileSync(join(REPO_ROOT, STATIC_TARGET), 'utf8');
  const countOf = (needle: string) => src.split(needle).length - 1;
  const nLegacyFn = countOf('annSearchLegacy');
  const nLegacyMod = countOf('retrieval-legacy');
  receipt.staticCounts = { file: STATIC_TARGET, annSearchLegacy: nLegacyFn, 'retrieval-legacy': nLegacyMod };
  A('R3-LEGACY-STATIC-UNREACHABLE', nLegacyFn === 0 && nLegacyMod === 0, `annSearchLegacy=${nLegacyFn} retrieval-legacy=${nLegacyMod}`);

  /* ── F-LEGACY / F-LEGACY-NOSCOPE（激活任何 generation 之前） ── */
  section('F-LEGACY / F-LEGACY-NOSCOPE：无 active generation + 有 vector_chunk(kind=qbank)');
  const activeBefore = (await pool.query('SELECT count(*)::int n FROM qbank_active_generation_metadata()')).rows[0].n as number;
  const legacyVec = axis(500);
  await asQbankControlExecutor(pool, (c) => upsertVectorChunk(c, '__system_qbank__', {
    id: 'qb-rag03hnsw-legacy', kind: 'qbank', refId: 'rag03hnsw_legacy_ref', contentHash: 'rag03hnsw-legacy-' + PRINCIPAL, embedding: legacyVec,
  }));
  const legacyRows = (await pool.query("SELECT count(*)::int n FROM vector_chunk WHERE kind='qbank'")).rows[0].n as number;
  const reachable = activeBefore === 0 && legacyRows >= 1;
  if (!reachable) console.log(`FIXTURE_UNREACHABLE F-LEGACY activeBefore=${activeBefore} legacyVectorRows=${legacyRows}`);
  const legacyCase = async (label: string, scoped: boolean) => {
    try {
      const rows = await asPrincipal(pool, PRINCIPAL, (c) => hybridQbankSearch(c, {
        query: 'legacy', embedding: legacyVec, k: K, expectedRecipeId: recipeId, retrievalMode: 'dense', ...(scoped ? { scope: SCOPE } : {}),
      }));
      return { label, outcome: 'resolved', legacyReturned: rows.length, message: null as string | null };
    } catch (e) {
      return { label, outcome: 'rejected', legacyReturned: 0, message: (e as Error).message };
    }
  };
  const scopedRes = await legacyCase('F-LEGACY', true);
  const unscopedRes = await legacyCase('F-LEGACY-NOSCOPE', false);
  receipt.legacy = { activeBefore, legacyVectorRows: legacyRows, scoped: scopedRes, unscoped: unscopedRes };
  console.log(`AQ_HNSW_RECEIPT legacyReturned scoped=${scopedRes.legacyReturned} unscoped=${unscopedRes.legacyReturned} (record only · Cond-5)`);
  A('R3-LEGACY-SCOPED-FAIL-CLOSED', reachable && scopedRes.outcome === 'rejected' && scopedRes.message === 'qbank_active_generation_missing',
    `outcome=${scopedRes.outcome} message=${scopedRes.message} legacyReturned=${scopedRes.legacyReturned}`);
  A('R3-LEGACY-UNSCOPED-FAIL-CLOSED', reachable && unscopedRes.outcome === 'rejected' && unscopedRes.message === 'qbank_active_generation_missing',
    `outcome=${unscopedRes.outcome} message=${unscopedRes.message} legacyReturned=${unscopedRes.legacyReturned}`);

  /* ── 越界 taxonomy v2（经既有 draft→scope→released 写入路径 · 不绕 trigger） ── */
  await asQbankControlExecutor(pool, async (c) => {
    await c.query("INSERT INTO qbank_taxonomy_release(version, release_hash, state) VALUES ($1, encode(digest(convert_to('rag03hnsw-draft:' || $1, 'UTF8'), 'sha256'), 'hex'), 'draft')", [T_OTHER]);
    await c.query(`INSERT INTO qbank_taxonomy_scope(taxonomy_version, scope_id, parent_scope_id, is_leaf, display_name)
                   VALUES ($1,'backend',NULL,false,'后端 v2'), ($1,$2,'backend',true,'Node.js 后端 v2')`, [T_OTHER, S1]);
    await c.query('SET CONSTRAINTS ALL IMMEDIATE');
    await c.query("UPDATE qbank_taxonomy_release SET state='released', release_hash=qbank_taxonomy_manifest_hash(version) WHERE version=$1 AND state='draft'", [T_OTHER]);
  });

  /* ── F-SCOPE：3 in-scope 已批准 + 20 out-of-scope 已批准（更近；10 跨 leaf + 10 跨 taxonomy） ── */
  section('F-SCOPE：K=5 → 恰 3 · 0 越界（含跨 taxonomy 行）');
  const QA_SCOPE = 0;
  const scopeIn = mkRefs('r3s_in', 'scope_in', 3, QA_SCOPE, 10, (i) => 0.30 + i * 0.01, T1, S1);
  const scopeOutLeaf = mkRefs('r3s_outleaf', 'scope_out_leaf', 10, QA_SCOPE, 20, (i) => 0.01 + i * 0.01, T1, S_OTHER);
  const scopeOutTax = mkRefs('r3s_outtax', 'scope_out_taxonomy', 10, QA_SCOPE, 30, (i) => 0.11 + i * 0.01, T_OTHER, S1);
  await ingest([...scopeIn, ...scopeOutLeaf, ...scopeOutTax]);
  const g1 = await buildActiveGeneration();
  const scopeHits = await servingSearch(axis(QA_SCOPE), 'dense');
  const inSet = new Set(scopeIn.map((r) => r.refId));
  const outLeafSet = new Set(scopeOutLeaf.map((r) => r.refId));
  const outTaxSet = new Set(scopeOutTax.map((r) => r.refId));
  receipt.fScope = { generationId: g1, expected: scopeIn.map((r) => ({ refId: r.refId, dist: r.dist })), returned: fmtHits(scopeHits) };
  A('R3-SCOPE-EXACT', scopeHits.length === 3 && sameList(scopeHits.map((h) => h.refId), scopeIn.map((r) => r.refId))
    && !scopeHits.some((h) => outLeafSet.has(h.refId) || outTaxSet.has(h.refId)),
  `returned=${scopeHits.length} refs=${scopeHits.map((h) => h.refId).join(',')}`);
  A('R3-SCOPE-NO-CROSS-TAXONOMY', !scopeHits.some((h) => outTaxSet.has(h.refId)),
    `crossTaxonomy=${scopeHits.filter((h) => outTaxSet.has(h.refId)).length}`);
  await revoke([...scopeIn, ...scopeOutLeaf, ...scopeOutTax].map((r) => r.refId));   // 隔离后续 generation 语料

  /* ── F-STARVE：45 近 in-scope 未批准 · 5 远 in-scope 已批准 · 10 最近 out-of-scope 已批准 ── */
  section('F-STARVE：K=5 dense · 「最近 40+ 未批准」');
  const QA_STARVE = 1;
  const starveUnapproved = mkRefs('r3f_unappr', 'starve_unapproved', 45, QA_STARVE, 40, (i) => 0.10 + i * 0.01, T1, S1);
  const starveApproved = mkRefs('r3f_appr', 'starve_approved', 5, QA_STARVE, 90, (i) => 0.60 + i * 0.01, T1, S1);
  const starveOut = mkRefs('r3f_out', 'starve_out_of_scope', 10, QA_STARVE, 100, (i) => 0.01 + i * (0.04 / 9), T1, S_OTHER);
  await ingest([...starveUnapproved, ...starveApproved, ...starveOut]);
  const unapprovedIds = starveUnapproved.map((r) => r.refId);
  const revoked = await revoke(unapprovedIds);
  const g2 = await buildActiveGeneration(unapprovedIds);
  const visibleUnapproved = await generationVisibleCount(g2, unapprovedIds);
  const candUnapproved = await candidateCount(unapprovedIds);
  const starveReachable = revoked === 45 && visibleUnapproved === 45 && candUnapproved === 0
    && await candidateCount(starveApproved.map((r) => r.refId)) === 5;
  if (!starveReachable) console.log(`FIXTURE_UNREACHABLE F-STARVE revoked=${revoked} visibleUnapproved=${visibleUnapproved} candidateUnapproved=${candUnapproved}`);
  const apprIds = starveApproved.map((r) => r.refId);
  const apprSet = new Set(apprIds);
  const unapprSet = new Set(unapprovedIds);
  const outSet = new Set(starveOut.map((r) => r.refId));
  const exactFive = (hits: { refId: string; distance: number }[]) => starveReachable && hits.length === K && sameList(hits.map((h) => h.refId), apprIds) && ascending(hits);
  const safe = (hits: { refId: string }[]) => hits.length <= K && hits.every((h) => apprSet.has(h.refId)) && !hits.some((h) => unapprSet.has(h.refId) || outSet.has(h.refId));

  const servingDense = await servingSearch(axis(QA_STARVE), 'dense');
  const pExact = await runUnderPlan('P-EXACT', g2, axis(QA_STARVE), K);
  const pDefault = await runUnderPlan('P-DEFAULT', g2, axis(QA_STARVE), K);
  const pHnsw = await runUnderPlan('P-HNSW', g2, axis(QA_STARVE), K);
  const hnswExercised = pHnsw.hnswUsed && !!pHnsw.hnswIndexName;
  const efSearch = (await pool.query("SELECT current_setting('hnsw.ef_search', true) AS v")).rows[0]?.v as string | null;
  receipt.hnswEfSearch = efSearch && efSearch !== '' ? efSearch : 'default(40)';
  console.log(`AQ_HNSW_RECEIPT hnsw.ef_search=${String(receipt.hnswEfSearch)}`);
  receipt.fStarve = {
    generationId: g2, fixtureReachable: starveReachable, revoked,
    fixtureConstruction: 'unapproved = qbank_source.status=rejected via control-executor revoke BEFORE build; builder fact set includes those refs (visible=true) via existing INSERT; no trigger disabled; post-activation revoke would set visible=false via qbank_source_visible_epoch_sync', visibleUnapproved, candidateUnapproved: candUnapproved,
    expected: starveApproved.map((r) => ({ refId: r.refId, dist: r.dist })),
    unapprovedDistRange: [starveUnapproved[0]!.dist, starveUnapproved[44]!.dist],
    outOfScopeDistRange: [starveOut[0]!.dist, starveOut[9]!.dist],
    servingDense: fmtHits(servingDense),
    plans: [pExact, pDefault, pHnsw].map((p) => ({
      plan: p.plan, planSource: p.planSource, livePlan: p.livePlan, gucs: PLAN_GUCS[p.plan],
      HNSW_USED: p.hnswUsed, hnswIndexName: p.hnswIndexName, liveReturned: fmtHits(p.rows),
      explainJson: p.explain, liveExplainJson: p.liveExplain, noticeCount: p.noticeCount,
    })),
  };
  A('R3-STARVE-EXACT-K', exactFive(servingDense), `plan=P-EXACT path=hybridQbankSearch returned=${servingDense.length} refs=${servingDense.map((h) => h.refId).join(',')}`);
  A('R3-STARVE-EXACT-K', exactFive(pExact.rows), `plan=P-EXACT path=direct_call returned=${pExact.rows.length}`);
  A('R3-PEXACT-PLAN-NO-HNSW', !pExact.hnswUsed, `planSource=substituted_body HNSW_USED=${pExact.hnswUsed}`);
  console.log(`AQ_HNSW_RECEIPT P-DEFAULT HNSW_USED=${pDefault.hnswUsed} planSource=substituted_body LIVE_PLAN_NOT_CAPTURED`);
  if (!pDefault.hnswUsed) A('R3-STARVE-EXACT-K', exactFive(pDefault.rows), `plan=P-DEFAULT path=direct_call returned=${pDefault.rows.length}`);
  else A('R3-HNSW-SAFETY', safe(pDefault.rows), `plan=P-DEFAULT(HNSW_USED) returned=${pDefault.rows.length}`);
  receipt.hnswReturned = pHnsw.rows.length;
  receipt.hnswExercised = hnswExercised ? 'HNSW_USED' : 'HNSW_NOT_EXERCISED';
  receipt.hnswIndexName = pHnsw.hnswIndexName;
  receipt.planSource = pHnsw.planSource;
  receipt.livePlan = pHnsw.livePlan;
  console.log(`AQ_HNSW_RECEIPT P-HNSW ${hnswExercised ? 'HNSW_USED' : 'HNSW_NOT_EXERCISED'} hnswReturned=${pHnsw.rows.length} index=${pHnsw.hnswIndexName} planSource=${pHnsw.planSource} livePlan=${pHnsw.livePlan}`);
  // CC-H1 hard: leave HNSW_NOT_EXERCISED
  A('AQ-HNSW-PATH-EXERCISED', hnswExercised && !!pHnsw.hnswIndexName,
    `HNSW_USED=${pHnsw.hnswUsed} index=${pHnsw.hnswIndexName}`);
  // CC-H2 live plan
  A('AQ-HNSW-LIVE-PLAN', pHnsw.livePlan === 'LIVE_PLAN_CAPTURED_AUTO_EXPLAIN' && !!pHnsw.liveExplain,
    `livePlan=${pHnsw.livePlan} notices=${pHnsw.noticeCount}`);
  // CC-H3 safety
  A('AQ-HNSW-SAFETY', safe(pHnsw.rows), `plan=P-HNSW returned=${pHnsw.rows.length} unapproved=${pHnsw.rows.filter((h) => unapprSet.has(h.refId)).length} outOfScope=${pHnsw.rows.filter((h) => outSet.has(h.refId)).length}`);
  // CC-H4 completeness fields (Ban production SLO · Ban close :71)
  const completenessGateMet = hnswExercised && safe(pHnsw.rows) && pHnsw.livePlan === 'LIVE_PLAN_CAPTURED_AUTO_EXPLAIN';
  receipt.completenessGateMet = completenessGateMet;
  receipt.completenessNote = 'exercised+safety+live_plan under AUTHORIZE AQ; Ban production HNSW SLO; GAP-RAG-03 :71 stays OPEN; coveredCount=8';
  receipt.hnswExactFillObserved = exactFive(pHnsw.rows);
  receipt.gapRag03StillOpen = true;
  receipt.rag03RouteExit1 = 'GAP-RAG-02 :70 disclosed · NOT green · Ban wash (not re-run)';
  A('AQ-HNSW-COMPLETENESS-FIELDS', completenessGateMet && typeof receipt.hnswReturned === 'number',
    `hnswReturned=${receipt.hnswReturned} gate=${completenessGateMet} exactFillObserved=${receipt.hnswExactFillObserved}`);

  /* ── F-STARVE-RRF（对照组） ── */
  section('F-STARVE-RRF：同 F-STARVE · rrf · lexical 0 行');
  const rrf = await servingSearch(axis(QA_STARVE), 'rrf');
  const lexical = await asPrincipal(pool, PRINCIPAL, async (c) => {
    await c.query("SELECT set_config('app.qbank_serving_scope', $1, true)", [S1]);
    await c.query("SELECT set_config('app.qbank_taxonomy_version', $1, true)", [T1]);
    return (await c.query('SELECT count(*)::int n FROM qbank_generation_lexical_search($1,$2,40)', [g2, NO_LEXICAL_QUERY])).rows[0].n as number;
  });
  receipt.fStarveRrf = { returned: fmtHits(rrf), lexicalRows: lexical };
  A('R3-STARVE-RRF-CONTROL', starveReachable && lexical === 0 && rrf.length === K && rrf.every((h) => apprSet.has(h.refId))
    && new Set(rrf.map((h) => h.refId)).size === K, `returned=${rrf.length} lexical=${lexical}`);
  await revoke([...starveApproved, ...starveOut].map((r) => r.refId));   // 隔离 F-STARVE-HASH 语料

  /* ── F-STARVE-HASH（协调方 NB-1 增补 · content_hash 漂移 → 不在 candidate） ── */
  section('F-STARVE-HASH：45 近 in-scope content_hash 漂移 · 5 远已批准 · 10 越界');
  // qbank_chunk 内容不可变 trigger 使漂移在正常写入面不可构造；同 rag04 ⑥b，以超级用户临时关闭 qbank_chunk 的
  // USER trigger 模拟「DB 完整性被破坏」（= qbank-integrity-upgrade 中 0068 前历史漂移），改完立即恢复。
  // 不改任何生产 SQL 谓词语义；该 seam 仅本 NB-1 变体使用（§4.2 钉死 fixture 不经此 seam）。
  const QA_HASH = 2;
  const hashDrift = mkRefs('r3h_drift', 'hash_drift', 45, QA_HASH, 200, (i) => 0.10 + i * 0.01, T1, S1);
  const hashApproved = mkRefs('r3h_appr', 'hash_approved', 5, QA_HASH, 250, (i) => 0.60 + i * 0.01, T1, S1);
  const hashOut = mkRefs('r3h_out', 'hash_out_of_scope', 10, QA_HASH, 260, (i) => 0.01 + i * (0.04 / 9), T1, S_OTHER);
  await ingest([...hashDrift, ...hashApproved, ...hashOut]);
  const g3 = await buildActiveGeneration();
  const driftIds = hashDrift.map((r) => r.refId);
  await pool.query('ALTER TABLE qbank_chunk DISABLE TRIGGER USER');
  try {
    await pool.query("UPDATE qbank_chunk SET content = content || ' drifted' WHERE ref_id = ANY($1::text[])", [driftIds]);
  } finally {
    await pool.query('ALTER TABLE qbank_chunk ENABLE TRIGGER USER');
  }
  const driftVisible = await generationVisibleCount(g3, driftIds);
  const driftCand = await candidateCount(driftIds);
  const hashApprIds = hashApproved.map((r) => r.refId);
  const hashReachable = driftVisible === 45 && driftCand === 0 && await candidateCount(hashApprIds) === 5;
  if (!hashReachable) console.log(`FIXTURE_UNREACHABLE F-STARVE-HASH visibleDrift=${driftVisible} candidateDrift=${driftCand}`);
  const hashHits = await servingSearch(axis(QA_HASH), 'dense');
  receipt.fStarveHash = { generationId: g3, fixtureReachable: hashReachable, visibleDrift: driftVisible, candidateDrift: driftCand, returned: fmtHits(hashHits) };
  A('R3-STARVE-HASH-DRIFT-EXACT-K', hashReachable && hashHits.length === K && sameList(hashHits.map((h) => h.refId), hashApprIds) && ascending(hashHits),
    `plan=P-EXACT returned=${hashHits.length} refs=${hashHits.map((h) => h.refId).join(',')}`);

  receipt.assertions = { green, red };
  console.log(`AQ_HNSW_RECEIPT_JSON ${JSON.stringify(receipt)}`);
  console.log(`AQ_HNSW_ASSERT_GREEN ${green.join(',')}`);
  console.log(`AQ_HNSW_ASSERT_RED ${red.join(',') || '-'}`);
  console.log(`\n${fail === 0 ? '✓ rag03-hnsw-completeness（真 Postgres）全部通过' : `✗ ${fail} 项失败`} · GAP-RAG-03 :71 OPEN · coveredCount=8 · releaseEvidence=false · NOT_HA`);
  await pool.end();
  process.exit(fail ? 1 : 0);
}

main().catch(async (err) => {
  console.error(err);
  console.log(`AQ_HNSW_ASSERT_RED ${[...red, 'UNCAUGHT'].join(',')}`);
  await pool.end().catch(() => undefined);
  process.exit(1);
});
