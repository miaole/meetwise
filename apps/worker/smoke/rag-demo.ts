/**
 * 端到端生产 RAG 一条龙(真路径,非分开测):真语料 → text-embedding-v4 → **入 pgvector** → **HNSW annSearch 召回** → **gte-rerank 重排** → 测 recall。
 * 用 C-MTEB T2Reranking 池化语料(官方标注)。证明"向量化入库+ANN+重排"是接通的、不是嘴说。
 *   pnpm rag:demo [N]   (需 .env + pnpm db:up;联网拉数据集)
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { createPool, asPrincipal, upsertVectorChunk, annSearch } from '@meetwise/db';
import { dashscopeEmbedder, cachingEmbedder, inMemoryEmbeddingStore, dashscopeReranker, evalRecall } from '@meetwise/ai-runtime';

for (const line of readFileSync(new URL('../../../.env', import.meta.url), 'utf8').split('\n')) {
  const m = line.match(/^(MODEL_[A-Z_]+|EMBED_MODEL|EMBED_DIM|RERANK_MODEL)=(.*)$/); if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}
process.env.EMBED_DIM = '512';
const N = Number(process.argv[2] ?? 60);
const DS = encodeURIComponent('C-MTEB/T2Reranking');
const clean = (s: string) => (s || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 1500) || '空';
const sql = (f: string) => readFileSync(fileURLToPath(new URL(`../../../packages/db/sql/${f}`, import.meta.url)), 'utf8');
const pool = createPool();
const OWNER = 'ragdemo';

async function fetchRows(n: number) {
  const out: any[] = [];
  for (let off = 0; out.length < n; off += 100) {
    const r = await fetch(`https://datasets-server.huggingface.co/rows?dataset=${DS}&config=default&split=dev&offset=${off}&length=100`);
    const j = await r.json() as any; if (!j.rows.length) break;
    for (const x of j.rows) if (x.row.positive?.length && x.row.negative?.length) out.push(x.row);
  }
  return out.slice(0, n);
}

async function main() {
  await pool.query(sql('01_schema.sql')); await pool.query(sql('06_retrieval.sql'));   // 确保 vector_chunk(HNSW) 存在
  const rows = await fetchRows(N);
  const text = new Map<string, string>();                 // ref_id → 原文(prod 在业务表;demo 内存持有)
  const golden: { query: string; relevant: string[] }[] = [];
  const corpus: { id: string; t: string }[] = [];
  rows.forEach((r, i) => {
    const rel: string[] = [];
    r.positive.forEach((t: string, j: number) => { const id = `q${i}_p${j}`; corpus.push({ id, t: clean(t) }); text.set(id, clean(t)); rel.push(id); });
    r.negative.forEach((t: string, j: number) => { const id = `q${i}_n${j}`; corpus.push({ id, t: clean(t) }); text.set(id, clean(t)); });
    golden.push({ query: clean(r.query), relevant: rel });
  });
  console.log(`语料 ${corpus.length} 篇 / 查询 ${golden.length} 条。① 嵌入(512)…`);
  const emb = cachingEmbedder(dashscopeEmbedder({ dim: 512 }), inMemoryEmbeddingStore());
  const cVecs = await emb.embed(corpus.map((c) => c.t));

  console.log('② 向量化**入 pgvector**(upsertVectorChunk,HNSW)…');
  await asPrincipal(pool, OWNER, async (c) => {
    for (let i = 0; i < corpus.length; i++)
      await upsertVectorChunk(c, OWNER, { id: `vc_${corpus[i].id}`, kind: 'qbank', refId: corpus[i].id, contentHash: createHash('sha256').update(corpus[i].id).digest('hex'), embedding: cVecs[i] });
  });
  const cnt = await asPrincipal(pool, OWNER, (c) => c.query("SELECT count(*)::int n FROM vector_chunk WHERE kind='qbank'"));
  console.log(`   入库 ${cnt.rows[0].n} 向量。③ 逐查询:HNSW annSearch 召回 top-20 → gte-rerank 重排 top-10…`);

  const reranker = dashscopeReranker();
  const annOnly: string[][] = [], reranked: string[][] = [];
  for (let i = 0; i < golden.length; i++) {
    const [qv] = await emb.embed([golden[i].query]);
    const hits = await asPrincipal(pool, OWNER, (c) => annSearch(c, OWNER, 'qbank', qv, 20));   // **真 pgvector HNSW 召回**
    annOnly.push(hits.map((h) => h.refId));
    const docs = hits.map((h) => ({ id: h.refId, text: text.get(h.refId) ?? '' }));
    reranked.push(await reranker.rerank(golden[i].query, docs, 10));                              // **真 gte-rerank 重排**
    if ((i + 1) % 20 === 0) console.log(`   …${i + 1}/${golden.length}`);
  }

  console.log('─'.repeat(64));
  for (const k of [5, 10]) {
    const a = evalRecall(annOnly, golden, k), r = evalRecall(reranked, golden, k);
    console.log(`k=${k}  pgvector-ANN  hit@k=${(a.hitRate * 100).toFixed(1)}% recall=${(a.recall * 100).toFixed(1)}% MAP=${a.map.toFixed(3)}`);
    console.log(`k=${k}  +gte-rerank   hit@k=${(r.hitRate * 100).toFixed(1)}% recall=${(r.recall * 100).toFixed(1)}% MAP=${r.map.toFixed(3)}`);
  }
  console.log('─'.repeat(64) + '\n✓ 一条龙打通:真语料→嵌入→入 pgvector→HNSW 召回→gte-rerank 重排→度量(全真路径)');
  await pool.end();
}
main().catch((e) => { console.error('✗', e?.message ?? e); process.exit(1); });
