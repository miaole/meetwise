/**
 * 旧 pgvector compatibility evaluation：真实 embedding → 临时独占 PostgreSQL/
 * pgvector（建 HNSW）→ legacy annSearch(RLS + qbank 可见集)。当前 production
 * QBank 已走 generation-aware hybridQbankSearch/题目工件路径；本文件不能验证
 * 那条 serving 路径。不触碰开发库；结束后 DROP 专用数据库。它只量候选召回，并
 * 显式打印小样本的实际查询计划，不把“创建了 HNSW 索引”偷换成“这一次查询已走
 * HNSW”或“已完成大规模压测”。
 */
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { annSearchLegacy, asPrincipal, createPool, upsertVectorChunk } from '@meetwise/db';
import { dashscopeEmbedder, evalRecall } from '@meetwise/ai-runtime';
import { classifyInterviewResearchBoundary, gradeRetrieval, type ScoredRef } from '@meetwise/domain';
import {
  ADVERSARIAL_CORPUS,
  ADVERSARIAL_QUERIES,
  ADVERSARIAL_STRESSORS,
  validateAdversarialFixture,
} from './retrieval-adversarial-golden.ts';

for (const line of readFileSync(new URL('../../../.env', import.meta.url), 'utf8').split('\n')) {
  const m = line.match(/^(MODEL_[A-Z_]+|EMBED_MODEL)=(.*)$/);
  if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}

const K = 5;
const DIM = 1024;
const SYSTEM = '__system_qbank__';
const proofDatabase = `meetwise_rag_adversarial_${randomUUID().replaceAll('-', '')}`;
const admin = createPool({ database: 'postgres' });
const pool = createPool({ database: proofDatabase });
const answerable = ADVERSARIAL_QUERIES.filter((q) => !q.noAnswer);
const buckets = [...new Set(answerable.map((q) => q.bucket))];
const pct = (x: number) => `${(x * 100).toFixed(1)}%`;

function provisionSql(): string {
  return `
    CREATE EXTENSION IF NOT EXISTS vector;
    CREATE TABLE vector_chunk (
      id text PRIMARY KEY, owner_user_id text NOT NULL,
      kind text NOT NULL CHECK (kind IN ('qbank','memory')),
      ref_id text NOT NULL, content_hash text NOT NULL,
      embedding vector(${DIM}) NOT NULL, created_at timestamptz NOT NULL DEFAULT now(),
      UNIQUE(owner_user_id, kind, content_hash)
    );
    CREATE INDEX vector_chunk_hnsw_cosine ON vector_chunk USING hnsw (embedding vector_cosine_ops);
    GRANT SELECT, INSERT, UPDATE, DELETE ON vector_chunk TO app_role;
    ALTER TABLE vector_chunk ENABLE ROW LEVEL SECURITY;
    ALTER TABLE vector_chunk FORCE ROW LEVEL SECURITY;
    CREATE POLICY adversarial_read ON vector_chunk FOR SELECT
      USING ((kind='qbank' AND owner_user_id='${SYSTEM}') OR owner_user_id=current_setting('app.principal_user', true));
    CREATE POLICY adversarial_write ON vector_chunk FOR ALL
      USING (owner_user_id=current_setting('app.principal_user', true))
      WITH CHECK (owner_user_id=current_setting('app.principal_user', true));
    CREATE VIEW qbank_visible_ref WITH (security_invoker = true) AS
      SELECT ref_id FROM vector_chunk WHERE kind='qbank' AND owner_user_id='${SYSTEM}';
    GRANT SELECT ON qbank_visible_ref TO app_role;
  `;
}

function printStressCoverage(): void {
  console.log('【样本构成（同一 query 可属于多个压力标签）】');
  console.log(`  corpus=${ADVERSARIAL_CORPUS.length}; release=${ADVERSARIAL_QUERIES.length}; answerable=${answerable.length}; no_answer=${ADVERSARIAL_QUERIES.length - answerable.length}`);
  for (const [tag, ids] of Object.entries(ADVERSARIAL_STRESSORS)) console.log(`  ${tag.padEnd(20)} n=${ids.length} ids=${ids.join(',')}`);
}

function printReport(ids: string[][]): void {
  const report = (qs: typeof answerable) => evalRecall(qs.map((q) => ids[ADVERSARIAL_QUERIES.indexOf(q)]), qs.map((q) => ({ query: q.query, relevant: q.relevant })), K);
  for (const [title, qs] of [[`当前 ${answerable.length} 条可回答异常 query`, answerable]] as const) {
    const total = report(qs);
    console.log(`【${title}：legacy compatibility embedding → pgvector/RLS/annSearch 候选排序】`);
    console.log(`  hit@${K}=${pct(total.hitRate)} recall@${K}=${pct(total.recall)} strict-all=${pct(total.successRate)} MRR=${total.mrr.toFixed(3)} nDCG=${total.ndcg.toFixed(3)} MAP=${total.map.toFixed(3)} n=${total.n}`);
    for (const bucket of buckets) {
      const q = qs.filter((x) => x.bucket === bucket); if (!q.length) continue;
      const r = report(q);
      console.log(`  ${bucket.padEnd(18)} n=${r.n} hit=${pct(r.hitRate)} recall=${pct(r.recall)} strict-all=${pct(r.successRate)} MRR=${r.mrr.toFixed(3)} nDCG=${r.ndcg.toFixed(3)}`);
    }
  }
}

function printNoAnswer(scores: ScoredRef[][]): void {
  const noAnswer = ADVERSARIAL_QUERIES.filter((q) => q.noAnswer);
  const mustRejectOrClarify = noAnswer.filter((q) => q.noAnswerBoundary === 'reject_or_clarify');
  let erroneousUseLocal = 0;
  const actionCounts = new Map<string, number>();
  let rejectOrClarifyCovered = 0;
  console.log('【无答案：annSearch 距离按生产 localRetrieve 的 1-distance 映射到 CRAG】');
  for (const q of noAnswer) {
    const result = scores[ADVERSARIAL_QUERIES.indexOf(q)];
    const boundary = classifyInterviewResearchBoundary(q.query);
    const action = boundary.action === 'allow' ? gradeRetrieval(result).action : boundary.action;
    if (action === 'use_local') erroneousUseLocal++;
    if (q.noAnswerBoundary === 'reject_or_clarify' && (action === 'refuse' || action === 'deny_external')) rejectOrClarifyCovered++;
    actionCounts.set(action, (actionCounts.get(action) ?? 0) + 1);
    const top = result[0];
    console.log(`  ${q.id}: expected=${q.noAnswerBoundary} top=${top ? `${top.ref}@${top.score.toFixed(3)}` : 'none'} boundary=${boundary.action} → ${action}`);
  }
  console.log(`  action counts: ${[...actionCounts.entries()].map(([action, n]) => `${action}=${n}`).join(', ')}`);
  console.log(`  local-suppression=${noAnswer.length - erroneousUseLocal}/${noAnswer.length} (${pct((noAnswer.length - erroneousUseLocal) / noAnswer.length)}); erroneous-use_local=${erroneousUseLocal}/${noAnswer.length} (${pct(erroneousUseLocal / noAnswer.length)})`);
  console.log(`  reject-or-clarify contract coverage=${rejectOrClarifyCovered}/${mustRejectOrClarify.length} (${pct(rejectOrClarifyCovered / (mustRejectOrClarify.length || 1))}): boundary 在 local/web 前拒绝；它只保护 interview research egress，不能替代通用 RAG router。`);
}

async function main() {
  validateAdversarialFixture();
  printStressCoverage();
  await admin.query(`CREATE DATABASE "${proofDatabase}"`);
  const started = Date.now();
  try {
    await pool.query(provisionSql());
    const embedder = dashscopeEmbedder({ dim: DIM });
    const docVecs = await embedder.embed(ADVERSARIAL_CORPUS.map((d) => d.text));
    for (let i = 0; i < ADVERSARIAL_CORPUS.length; i++) {
      const d = ADVERSARIAL_CORPUS[i];
      await asPrincipal(pool, SYSTEM, (c) => upsertVectorChunk(c, SYSTEM, {
        id: `rag-adversarial:${d.id}`, kind: 'qbank', refId: d.id, contentHash: `rag-adversarial:${d.id}:v1`, embedding: docVecs[i],
      }));
    }
    const qVecs = await embedder.embed(ADVERSARIAL_QUERIES.map((q) => q.query));
    const planVector = qVecs[0];
    if (!planVector) throw new Error('fixture_missing_query_embedding');
    const reader = `rag-adversarial-reader-${process.pid}`;
    const queryPlan = await asPrincipal(pool, reader, async (c) => c.query(
      `EXPLAIN (FORMAT JSON)
       SELECT ref_id, dist FROM (
         SELECT DISTINCT ON (v.ref_id) v.ref_id AS ref_id, v.embedding <=> $1::vector AS dist
           FROM vector_chunk v
           JOIN qbank_visible_ref vr ON vr.ref_id = v.ref_id
          WHERE v.kind='qbank' AND v.owner_user_id=$3
          ORDER BY v.ref_id, v.embedding <=> $1::vector
       ) t ORDER BY dist LIMIT $2`,
      [`[${planVector.join(',')}]`, K, SYSTEM],
    ));
    const planJson = JSON.stringify(queryPlan.rows[0]?.['QUERY PLAN'] ?? queryPlan.rows[0]);
    const plannerUsesHnsw = planJson.includes('vector_chunk_hnsw_cosine');
    const ids: string[][] = [];
    const scores: ScoredRef[][] = [];
    for (const vec of qVecs) {
      const rows = await asPrincipal(pool, reader, (c) => annSearchLegacy(c, 'qbank', vec, K));
      ids.push(rows.map((r) => r.refId));
      scores.push(rows.map((r) => ({ ref: r.refId, score: Math.max(0, 1 - r.distance) })));
    }
    const count = await asPrincipal(pool, reader, (c) => c.query("SELECT count(*)::int n FROM vector_chunk WHERE kind='qbank'"));
    console.log(`临时库：${count.rows[0].n} chunks，${ADVERSARIAL_QUERIES.length} queries，耗时 ${Date.now() - started}ms；HNSW index installed=yes；this small-fixture qbank query planner uses HNSW=${plannerUsesHnsw ? 'yes' : 'no'}`);
    printReport(ids);
    printNoAnswer(scores);
    console.log('✓ 已覆盖 legacy compatibility 路径：真实 embedding → pgvector（HNSW 已建）→ app_role/RLS → qbank_visible_ref → annSearchLegacy。它不覆盖 generation-aware hybridQbankSearch、artifact evidence 或 serving cache。上方 plan 只代表 24-chunk fixture；不能外推为 10 万+ 语料性能。临时数据库将删除。');
  } finally {
    await pool.end();
    await admin.query(`DROP DATABASE IF EXISTS "${proofDatabase}"`);
    await admin.end();
  }
}
main().catch(async (e: unknown) => {
  // Retain a machine-readable transport diagnosis while never exposing model credentials, endpoint URLs or prompts.
  const err = e as { name?: unknown; message?: unknown; cause?: { code?: unknown; name?: unknown } };
  const cause = err.cause;
  console.error('✗', JSON.stringify({
    kind: 'real_embedding_pg_eval_failed',
    name: typeof err.name === 'string' ? err.name : 'Error',
    message: typeof err.message === 'string' ? err.message : String(e),
    causeCode: typeof cause?.code === 'string' ? cause.code : undefined,
    causeName: typeof cause?.name === 'string' ? cause.name : undefined,
  }));
  await pool.end().catch(() => undefined);
  await admin.query(`DROP DATABASE IF EXISTS "${proofDatabase}"`).catch(() => undefined);
  await admin.end().catch(() => undefined);
  process.exit(1);
});
