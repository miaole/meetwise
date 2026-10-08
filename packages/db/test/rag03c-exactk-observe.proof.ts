/**
 * GAP-RAG-03 · RAG03-C exact-K fill observation proof（Line RAG03-C · EXEC @REQUEST 9404c4c4 ·
 * pre-exec dual BOTH PASS + coordinator standing authorize per harness §3⑤）.
 *
 * Harness: ai-docs/delivery/harness/rag03c-exactk-observe.md §1-§5（预注册多结局 · 判别读数=记录非门禁）.
 * AQ face承卷（zero re-prove）: path-exercised + live-plan + safety 已闭（PROVE 19d69d72 · CODE 49cfce97）。
 * This knife observes the NOT-yet-exercised exact-K fill face under a LEGAL non-degenerate fixture:
 *   - P1 main arm: F-ND non-degenerate interleave — 10 out-of-scope nearest (0.01-0.05) ·
 *     5 in-scope approved次近 (0.06-0.10, all inside ef_search=40 first window) · 45 in-scope
 *     unapproved after (0.12-0.56) · K=5 · corpus 60 (axis construction, query on-axis = same
 *     distribution as library).
 *   - P2 contrast arm (RAG03C_ARM=P2): F-SCALE ~2000 rows, same order invariants, random-unit
 *     mass beyond approved; P-DEFAULT natural-planner HNSW reading + P-HNSW GUCs dual reading.
 * Gates (pre-registered · ONLY these five): R3C-FIXTURE-REACHABLE · R3C-P1-HNSW-USED (P1 arm) ·
 * R3C-SAFETY · R3C-PEXACT-EXACT-K · R3C-READINGS-RECORDED. Discriminating readings are recorded,
 * never gated: hnswReturned=<n> · hnswExactFillObserved=<bool> · planFilterShape=<label> (live +
 * substituted_body) · P-DEFAULT-HNSW-USED. Any reading value (0/<K/false) does NOT red the run.
 * Ban: shared schema/DDL/migration (proof-local corpus via existing write paths only) · MySQL ·
 * FULLTEXT · Qdrant · production data · secrets · retry-to-green. GAP-RAG-03 `:71` stays OPEN ·
 * coveredCount=8 · NOT_HA · releaseEvidence=false · PG-retained · DELETE=503 · actualSpendCny=null.
 *
 * pnpm rag03c-exactk-observe:prove        (main arm P1)
 * RAG03C_ARM=P2 pnpm rag03c-exactk-observe:prove   (contrast arm P2)
 */
import type { PoolClient } from 'pg';
import {
  assertIsolatedTestTarget, createPool, asPrincipal, asQbankControlExecutor,
  ingestQbank, hybridQbankSearch,
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
const T1 = 'v1';
const S1 = 'backend/nodejs';
const S_OTHER = 'backend/java';       // out-of-scope leaf（同 taxonomy · 承 F-STARVE starveOut 骨架）
const PRINCIPAL = 'rag03c_' + Math.random().toString(36).slice(2, 8);
const SCOPE = { taxonomyVersion: T1, servingScopeId: S1 };
const NO_LEXICAL_QUERY = 'qwvzkx';    // 不出现在任何 chunk 文本 → lexical 0 行（dense-only 判读面）
const ARM = (String(process.env.RAG03C_ARM ?? 'P1').trim().toUpperCase() === 'P2') ? 'P2' : 'P1';
const P2_MASS = 1985;                 // F-SCALE 主体未批准随机单位向量数（+10 out +5 appr = 2000）

/* ─────────────────────────── 精确距离向量构造（承 AQ axis 机理 · 同分布查询） ─────────────────────────── */
// q = e_axis；doc = s·e_axis + sqrt(1-s²)·e_j（j 独占正交轴）→ cos distance = 1 - s（精确可控）。
function axis(i: number): number[] { const v = new Array<number>(DIM).fill(0); v[i] = 1; return v; }
function atDistance(queryAxis: number, ownAxis: number, d: number): number[] {
  const s = 1 - d;
  const v = new Array<number>(DIM).fill(0);
  v[queryAxis] = s; v[ownAxis] = Math.sqrt(Math.max(0, 1 - s * s));
  return v;
}
function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function randomUnit(seed: number): number[] {
  const rnd = mulberry32(seed);
  const v = Array.from({ length: DIM }, () => rnd() * 2 - 1);
  let n = 0; for (const x of v) n += x * x; n = Math.sqrt(n);
  return v.map((x) => x / n);
}
function cosDist(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i]! * b[i]!; na += a[i]! * a[i]!; nb += b[i]! * b[i]!; }
  return 1 - dot / (Math.sqrt(na) * Math.sqrt(nb));
}
const vecLit = (e: number[]) => `[${e.join(',')}]`;
const round = (x: number) => Math.round(x * 1e6) / 1e6;

interface FixtureRef { refId: string; taxonomyVersion: string; servingScopeId: string; dist: number; vector: number[]; group: string; approved: boolean }
const vectorByRef = new Map<string, number[]>();

function mkRefs(prefix: string, group: string, n: number, queryAxis: number, axisStart: number,
  distOf: (i: number) => number, servingScopeId: string, approved: boolean): FixtureRef[] {
  return Array.from({ length: n }, (_, i) => {
    const refId = `${prefix}_${String(i).padStart(2, '0')}`;
    const dist = round(distOf(i));
    const vector = atDistance(queryAxis, axisStart + i, dist);
    vectorByRef.set(refId, vector);
    return { refId, taxonomyVersion: T1, servingScopeId, dist, vector, group, approved };
  });
}
function mkMass(prefix: string, group: string, n: number, query: number[], seedBase: number): FixtureRef[] {
  return Array.from({ length: n }, (_, i) => {
    const refId = `${prefix}_${String(i).padStart(4, '0')}`;
    const vector = randomUnit(seedBase + i);
    vectorByRef.set(refId, vector);
    return { refId, taxonomyVersion: T1, servingScopeId: S1, dist: round(cosDist(query, vector)), vector, group, approved: false };
  });
}

/** generation 模式 ingest 不调用 embedder；向量由 vectorByRef 在 generation 构建时写入。 */
const unusedEmbedder: QbankEmbedder = {
  dim: DIM, id: 'rag03c-proof-embedder:v1',
  embed: async () => { throw new Error('rag03c_embedder_must_not_be_called_in_generation_mode'); },
};

async function ingest(refs: FixtureRef[]): Promise<void> {
  const items: QbankItem[] = refs.map((r) => ({
    refId: r.refId,
    text: `rag03c exactk observe fixture ${r.group} ${r.refId} alpha bravo charlie`,
    taxonomyVersion: r.taxonomyVersion, servingScopeId: r.servingScopeId, annotationSource: 'seed_v1_reviewed',
  }));
  const n = await ingestQbank(pool, items, unusedEmbedder);
  if (n !== items.length) throw new Error(`rag03c_ingest_short:${n}/${items.length}`);
}

/* ─────────────────────────── generation 构建（承 AQ 内联 worker 流程 · 只经既有写入路径） ─────────────────────────── */
const RECIPE_MANIFEST = {
  schema: 'qbank-embedding-recipe:v1', provider: 'openai-compatible', model: 'rag03c-proof-embedder:v1',
  providerRevision: 'rag03c-proof-unverified', dimensions: DIM, chunkerVersion: 'whole-qbank-item:v1',
  normalizationVersion: 'utf8-nfc-trim:v1', documentPrefixVersion: 'none:v1', queryPrefixVersion: 'none:v1',
} as const;
const recipeHash = (await import('node:crypto')).createHash('sha256').update(JSON.stringify(RECIPE_MANIFEST)).digest('hex');
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

/** 构建并激活 generation。includeUnapprovedRefIds 承 AQ fixtureConstruction 披露口径：
 *  未批准 = 先经既有 revoke 路径置 rejected，builder 事实集仍写 visible 行（经既有 INSERT · 不绕 trigger）。 */
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
  const generationId = 'qgen-' + (await import('node:crypto')).randomUUID();
  await asQbankControlExecutor(pool, async (c) => {
    await c.query(`INSERT INTO qbank_vector_generation(id,recipe_id,source_epoch,expected_chunk_count,state)
                   VALUES ($1,$2,$3::bigint,$4,'building')`, [generationId, recipeId, epoch, facts.length]);
    await c.query('SELECT qbank_prepare_generation_partition($1)', [generationId]);
  });
  // 分块写入（P2 2000 行 → 5×400，避免单语句过大；逐块同事务语义与 AQ 单批一致）
  const CHUNK = 400;
  for (let off = 0; off < facts.length; off += CHUNK) {
    const slice = facts.slice(off, off + CHUNK);
    await asQbankControlExecutor(pool, async (c) => {
      const params: unknown[] = [];
      const values = slice.map((f, i) => {
        const v = vectorByRef.get(f.refId);
        if (!v) throw new Error(`rag03c_missing_vector:${f.refId}`);
        const p = i * 6;
        params.push(generationId, f.refId, f.taxonomyVersion, f.servingScopeId, f.contentHash, vecLit(v));
        return `($${p + 1},$${p + 2},$${p + 3},$${p + 4},$${p + 5},$${p + 6}::vector)`;
      }).join(',');
      await c.query(`INSERT INTO qbank_generation_chunk(generation_id,ref_id,taxonomy_version,serving_scope_id,content_hash,embedding)
                     VALUES ${values}`, params);
    });
  }
  await asQbankControlExecutor(pool, (c) => c.query('SELECT qbank_validate_generation($1)', [generationId]));
  await asQbankControlExecutor(pool, (c) => c.query('SELECT qbank_activate_generation($1)', [generationId]));
  return generationId;
}

/** approved → rejected（承 AQ control-executor 撤销路径 · 不绕 trigger）。 */
async function revoke(refIds: string[]): Promise<number> {
  return asQbankControlExecutor(pool, async (c) => {
    const r = await c.query(
      `UPDATE qbank_source s
          SET status='rejected', reviewed_by='rag03c-proof', review_note='RAG03-C exactk fixture: unapproved',
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

/* ─────────────────────────── 计划 · EXPLAIN（承 AQ 双口径机理） ─────────────────────────── */
type PlanName = 'P-EXACT' | 'P-DEFAULT' | 'P-HNSW';
const PLAN_GUCS: Record<PlanName, string[]> = {
  'P-EXACT': ['SET LOCAL enable_indexscan = off', 'SET LOCAL enable_bitmapscan = off'],
  'P-DEFAULT': [],
  'P-HNSW': ['SET LOCAL enable_seqscan = off', 'SET LOCAL enable_sort = off'],
};

let annFunctionBody: string | undefined;
async function catalogAnnBody(): Promise<string> {
  if (annFunctionBody) return annFunctionBody;
  const r = await pool.query("SELECT pg_get_functiondef('qbank_generation_ann_search(text,vector,integer)'::regprocedure) AS def");
  const def = String(r.rows[0].def);
  const m = def.match(/AS \$function\$([\s\S]*)\$function\$/);
  if (!m?.[1]) throw new Error('rag03c_ann_body_unparseable');
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
    if (!n || typeof n === 'object') return;
    if ((n['Node Type'] === 'Index Scan' || n['Node Type'] === 'Index Only Scan')
      && String(n['Index Name'] ?? '').startsWith('qgc_hnsw_visible_')) found = String(n['Index Name']);
    if (Array.isArray(n)) n.forEach(walk); else Object.values(n).forEach(walk);
  };
  walk(json);
  return found;
}
/** 判别读数①：HNSW 节点形态 — same-table Filter（同表 recheck）vs join（HNSW 之上为 JOIN 节点）vs none。 */
function planFilterShape(json: unknown): string {
  const isJoin = (t: string) => /Join/i.test(t);
  let label = 'none';
  const walk = (n: any, joinAbove: boolean): void => {
    if (!n || typeof n !== 'object' || Array.isArray(n)) {
      if (Array.isArray(n)) n.forEach((x) => walk(x, joinAbove));
      return;
    }
    const nodeType = String(n['Node Type'] ?? '');
    const hereJoin = joinAbove || isJoin(nodeType);
    if ((nodeType === 'Index Scan' || nodeType === 'Index Only Scan') && String(n['Index Name'] ?? '').startsWith('qgc_hnsw_visible_')) {
      const hasSameTableFilter = typeof n['Filter'] === 'string' && n['Filter'].length > 0;
      const hasRecheck = typeof n['Recheck Cond'] === 'string' && n['Recheck Cond'].length > 0;
      label = hasSameTableFilter ? 'same-table-filter' : (hereJoin ? 'join' : (hasRecheck ? 'index-cond-only' : 'none'));
      return;
    }
    if (Array.isArray(n['Plans'])) n['Plans'].forEach((x: any) => walk(x, hereJoin));
  };
  walk(json, false);
  return label;
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
  subShape: string; liveShape: string;
  rows: { refId: string; distance: number }[]; noticeCount: number;
}
/** 同一事务：替换体 EXPLAIN + 真函数调用；auto_explain 捕获 live 内层计划（承 AQ CC-H2 方法 · 本刀只读数）。 */
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
    // Mirror 0139 function SET on substituted body so EXPLAIN matches live iterative_scan（承 AQ P-HNSW 口径）。
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
    return {
      plan, explain, liveExplain,
      planSource: liveExplain ? 'auto_explain_nested+substituted_body' : 'substituted_body_only',
      livePlan: liveExplain ? 'LIVE_PLAN_CAPTURED_AUTO_EXPLAIN' : 'LIVE_PLAN_NOT_CAPTURED',
      hnswUsed: subHnsw || liveHnsw, hnswIndexName: extractHnswIndexName(liveExplain) ?? extractHnswIndexName(explain),
      subShape: planFilterShape(explain), liveShape: liveExplain ? planFilterShape(liveExplain) : 'live-plan-not-captured',
      rows: live.rows.map((r) => ({ refId: String(r.ref_id), distance: Number(r.distance) })), noticeCount: notices.length,
    };
  } catch (e) { await c.query('ROLLBACK').catch(() => undefined); throw e; }
  finally { c.off('notice', onNotice); c.release(); }
}

/** serving 路径（hybridQbankSearch · app_role）在 P-EXACT 会话 GUC 下调用。 */
async function servingSearch(embedding: number[], generationId: string): Promise<QbankHybridHit[]> {
  return asPrincipal(pool, PRINCIPAL, async (c) => {
    for (const g of PLAN_GUCS['P-EXACT']) await c.query(g);
    return hybridQbankSearch(c, { query: NO_LEXICAL_QUERY, embedding, k: K, expectedRecipeId: recipeId, retrievalMode: 'dense', scope: SCOPE });
  });
}

const fmtHits = (hits: { refId: string; distance: number }[]) => hits.map((h) => ({ refId: h.refId, distance: round(h.distance) }));
const sameList = (a: string[], b: string[]) => a.length === b.length && a.every((x, i) => x === b[i]);
const ascending = (hits: { distance: number }[]) => hits.every((h, i) => i === 0 || hits[i - 1]!.distance <= h.distance);

/* ─────────────────────────── main ─────────────────────────── */
async function main() {
  const t0 = new Date(Date.now() + 8 * 3600e3).toISOString().replace('Z', '+08:00');
  await assertIsolatedTestTarget(pool);
  const receipt: Record<string, unknown> = {
    knife: 'RAG03C-GAP-RAG-03-EXACTK-OBSERVE', requestSha: '9404c4c4', principal: PRINCIPAL, arm: ARM,
    stack: 'PG-retained (Postgres/pgvector) · Ban MySQL/Qdrant/FULLTEXT', gapRag03: 'OPEN',
    pins: { haStatus: 'NOT_HA', releaseEvidence: false, claimProductionHA: false, coveredCount: 8, deletePublic: 503, g7SuiteGreen: false, actualSpendCny: null },
    e2eTestContainer: process.env.E2E_TEST_CONTAINER ?? null,
    startedAt: t0,
    readingDiscipline: 'discriminating readings are recorded-not-gated (harness §1/§3); any value 0/<K/false is a legal outcome; verdict authority = coordinator',
  };
  const ext = await pool.query("SELECT extversion FROM pg_extension WHERE extname='vector'");
  const pgv = await pool.query('SELECT version() AS v');
  receipt.pgvectorExtversion = ext.rows[0]?.extversion ?? null;
  receipt.serverVersion = pgv.rows[0]?.v ?? null;
  const cfg = await pool.query(`SELECT proconfig FROM pg_proc WHERE oid='qbank_generation_ann_search(text,vector,integer)'::regprocedure`);
  const proconfig = (cfg.rows[0]?.proconfig as string[] | null) ?? [];
  receipt.annSearchProconfig = proconfig;
  const efSearch = (await pool.query("SELECT current_setting('hnsw.ef_search', true) AS v")).rows[0]?.v as string | null;
  receipt.hnswEfSearch = efSearch && efSearch !== '' ? efSearch : 'default(40)';
  console.log(`RAG03C_RECEIPT arm=${ARM} pgvector_extversion=${String(receipt.pgvectorExtversion)} ef_search=${String(receipt.hnswEfSearch)} container=${String(receipt.e2eTestContainer)}`);

  /* ── 夹具（arm 选择 · 顺序不变量承 harness §2.1） ── */
  section(`fixture build（arm=${ARM}）`);
  const QA = 0;
  const query = axis(QA);
  const outRows = mkRefs('r3c_out', 'out_of_scope', 10, QA, 1, (i) => 0.01 + i * (0.04 / 9), S_OTHER, true);
  const apprRows = mkRefs('r3c_appr', 'approved_in_scope', 5, QA, 11, (i) => 0.06 + i * 0.01, S1, true);
  let unapprRows: FixtureRef[];
  if (ARM === 'P2') {
    unapprRows = mkMass('r3c_mass', 'unapproved_mass', P2_MASS, query, 0x5a5a0001);
    const minMassDist = Math.min(...unapprRows.map((r) => r.dist));
    receipt.p2MinMassDist = minMassDist;
    if (!(minMassDist > 0.10)) console.log(`FIXTURE_UNREACHABLE F-SCALE minMassDist=${minMassDist} (order invariant ③ violated)`);
  } else {
    unapprRows = mkRefs('r3c_unappr', 'unapproved_in_scope', 45, QA, 16, (i) => 0.12 + i * 0.01, S1, false);
  }
  const all = [...outRows, ...apprRows, ...unapprRows];
  await ingest(all);
  const unapprIds = unapprRows.map((r) => r.refId);
  const apprIds = apprRows.map((r) => r.refId);
  const outIds = outRows.map((r) => r.refId);
  const revoked = await revoke(unapprIds);
  const generationId = await buildActiveGeneration(unapprIds);
  const visibleUnappr = await generationVisibleCount(generationId, unapprIds);
  const candUnappr = await candidateCount(unapprIds);
  const candAppr = await candidateCount(apprIds);
  const candOut = await candidateCount(outIds);
  const apprSet = new Set(apprIds);
  const unapprSet = new Set(unapprIds);
  const outSet = new Set(outIds);
  // 顺序不变量：① 越界全局最近 ② 批准次近且全部进首窗（corpus ≤ ef_search=40 约束于 P1；P2 由距离序保证）
  const orderInvariant = Math.max(...outRows.map((r) => r.dist)) < Math.min(...apprRows.map((r) => r.dist))
    && Math.max(...apprRows.map((r) => r.dist)) < Math.min(...unapprRows.map((r) => r.dist));
  const reachable = revoked === unapprRows.length && visibleUnappr === unapprRows.length
    && candUnappr === 0 && candAppr === 5 && candOut === 10 && orderInvariant;
  if (!reachable) console.log(`FIXTURE_UNREACHABLE arm=${ARM} revoked=${revoked} visibleUnappr=${visibleUnappr} candUnappr=${candUnappr} candAppr=${candAppr} candOut=${candOut} orderInvariant=${orderInvariant}`);
  receipt.fixture = {
    arm: ARM, generationId, corpusRows: all.length, revoked, visibleUnapproved: visibleUnappr,
    candidateUnapproved: candUnappr, candidateApproved: candAppr, candidateOutOfScope: candOut,
    orderInvariant, fixtureConstruction: 'unapproved = qbank_source.status=rejected via control-executor revoke BEFORE build (AQ口径); existing write paths only; zero DDL; zero trigger bypass',
    dists: { out: [outRows[0]!.dist, outRows[outRows.length - 1]!.dist], approved: apprRows.map((r) => r.dist), unapproved: ARM === 'P1' ? [unapprRows[0]!.dist, unapprRows[unapprRows.length - 1]!.dist] : 'random-unit ~0.85-1.15 (min recorded p2MinMassDist)' },
  };
  A('R3C-FIXTURE-REACHABLE', reachable,
    `arm=${ARM} corpus=${all.length} revoked=${revoked}/${unapprRows.length} visible=${visibleUnappr} candUnappr=${candUnappr} candAppr=${candAppr} orderInv=${orderInvariant}`);

  const exactFive = (hits: { refId: string; distance: number }[]) => reachable && hits.length === K
    && sameList(hits.map((h) => h.refId), apprIds) && ascending(hits);
  const safe = (hits: { refId: string }[]) => hits.length <= K && hits.every((h) => apprSet.has(h.refId))
    && !hits.some((h) => unapprSet.has(h.refId) || outSet.has(h.refId));

  /* ── 门禁：EXACT 回归面（serving + direct · 承 R3-STARVE-EXACT-K 口径） ── */
  section('gates: EXACT regression face（serving + P-EXACT direct）');
  const servingDense = await servingSearch(query, generationId);
  receipt.servingDense = fmtHits(servingDense);
  A('R3C-PEXACT-EXACT-K', exactFive(servingDense), `path=hybridQbankSearch plan=P-EXACT returned=${servingDense.length} refs=${servingDense.map((h) => h.refId).join(',')}`);
  const pExact = await runUnderPlan('P-EXACT', generationId, query, K);
  receipt.pExact = { planSource: pExact.planSource, livePlan: pExact.livePlan, rows: fmtHits(pExact.rows), shape: pExact.subShape };
  A('R3C-PEXACT-EXACT-K', exactFive(pExact.rows), `path=direct_call plan=P-EXACT returned=${pExact.rows.length}`);

  /* ── 判别读数：P-HNSW（强制计划） ── */
  section('readings: P-HNSW（GUC-forced ordered HNSW）');
  const pHnsw = await runUnderPlan('P-HNSW', generationId, query, K);
  receipt.pHnsw = {
    planSource: pHnsw.planSource, livePlan: pHnsw.livePlan, HNSW_USED: pHnsw.hnswUsed, hnswIndexName: pHnsw.hnswIndexName,
    hnswReturned: pHnsw.rows.length, hnswExactFillObserved: exactFive(pHnsw.rows),
    planFilterShape: { substituted_body: pHnsw.subShape, live: pHnsw.liveShape },
    returned: fmtHits(pHnsw.rows), noticeCount: pHnsw.noticeCount,
    explainJson: pHnsw.explain, liveExplainJson: pHnsw.liveExplain,
  };
  console.log(`RAG03C_READING P-HNSW HNSW_USED=${pHnsw.hnswUsed} hnswReturned=${pHnsw.rows.length} hnswExactFillObserved=${receipt.pHnsw.hnswExactFillObserved} shape sub=${pHnsw.subShape} live=${pHnsw.liveShape} index=${pHnsw.hnswIndexName} returned=${JSON.stringify(fmtHits(pHnsw.rows))}`);
  if (ARM === 'P1') {
    A('R3C-P1-HNSW-USED', pHnsw.hnswUsed && !!pHnsw.hnswIndexName, `HNSW_USED=${pHnsw.hnswUsed} index=${pHnsw.hnswIndexName}`);
  } else {
    console.log(`RAG03C_READING P2 P-HNSW-USED=${pHnsw.hnswUsed} (reading only · not a gate on P2 arm)`);
  }
  A('R3C-SAFETY', safe(pHnsw.rows),
    `plan=P-HNSW returned=${pHnsw.rows.length} unapproved=${pHnsw.rows.filter((h) => unapprSet.has(h.refId)).length} outOfScope=${pHnsw.rows.filter((h) => outSet.has(h.refId)).length}`);

  /* ── 判别读数：P-DEFAULT（自然规划器） ── */
  section('readings: P-DEFAULT（natural planner）');
  const pDefault = await runUnderPlan('P-DEFAULT', generationId, query, K);
  receipt.pDefault = {
    planSource: pDefault.planSource, livePlan: pDefault.livePlan, HNSW_USED: pDefault.hnswUsed,
    hnswIndexName: pDefault.hnswIndexName, returned: fmtHits(pDefault.rows),
    planFilterShape: { substituted_body: pDefault.subShape, live: pDefault.liveShape },
  };
  console.log(`RAG03C_READING P-DEFAULT HNSW_USED=${pDefault.hnswUsed} returned=${pDefault.rows.length} shape sub=${pDefault.subShape} live=${pDefault.liveShape} rows=${JSON.stringify(fmtHits(pDefault.rows))}`);
  A('R3C-SAFETY', safe(pDefault.rows), `plan=P-DEFAULT returned=${pDefault.rows.length}`);

  /* ── 门禁：读数全录 ── */
  const readingsRecorded = typeof receipt.pHnsw.hnswReturned === 'number'
    && typeof receipt.pHnsw.hnswExactFillObserved === 'boolean'
    && typeof receipt.pHnsw.planFilterShape.substituted_body === 'string'
    && typeof (receipt.pHnsw.planFilterShape as { live: string }).live === 'string'
    && typeof receipt.pDefault.HNSW_USED === 'boolean'
    && typeof receipt.pDefault.planFilterShape.substituted_body === 'string';
  receipt.readingsRecorded = readingsRecorded;
  A('R3C-READINGS-RECORDED', readingsRecorded,
    `hnswReturned=${receipt.pHnsw.hnswReturned} exactFill=${receipt.pHnsw.hnswExactFillObserved} shapes=${receipt.pHnsw.planFilterShape.substituted_body}/${(receipt.pHnsw.planFilterShape as { live: string }).live} defaultUsed=${receipt.pDefault.HNSW_USED}`);

  /* ── 结局预注册映射（登记非定谳 · 定谳权归协调方） ── */
  const n = pHnsw.rows.length;
  const outcome = !reachable ? 'FIXTURE_UNREACHABLE'
    : n === K ? 'H-E1-candidate（登记非定谳：非退化分布下 HNSW 候选返回>0 且 exact-K fill 可观测——「与分布退化一致」≠「E1 已证」）'
    : n === 0 ? 'H-E2/H-E3-upweight（仍=0 · 按计划形态分流：same-table-filter→参数面可议 / join|none→机制面；E2/E3 归一或分流=登记非定谳）'
    : `half-fill（0<${n}<K · 合法结局 · 如实登记归协调方）`;
  receipt.registeredOutcomeMapping = outcome;
  receipt.gapRag03StillOpen = true;
  console.log(`RAG03C_OUTCOME arm=${ARM} hnswReturned=${n} → ${outcome}`);

  receipt.assertions = { green, red };
  receipt.finishedAt = new Date(Date.now() + 8 * 3600e3).toISOString().replace('Z', '+08:00');
  console.log(`RAG03C_RECEIPT_JSON ${JSON.stringify(receipt)}`);
  console.log(`RAG03C_ASSERT_GREEN ${green.join(',')}`);
  console.log(`RAG03C_ASSERT_RED ${red.join(',') || '-'}`);
  console.log(`\n${fail === 0 ? '✓ rag03c-exactk-observe（真 Postgres）全部通过' : `✗ ${fail} 项失败`} · GAP-RAG-03 :71 OPEN · coveredCount=8 · releaseEvidence=false · NOT_HA`);
  await pool.end();
  process.exit(fail ? 1 : 0);
}

main().catch(async (err) => {
  console.error(err);
  console.log(`RAG03C_ASSERT_RED ${[...red, 'UNCAUGHT'].join(',')}`);
  await pool.end().catch(() => undefined);
  process.exit(1);
});
