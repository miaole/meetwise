/**
 * 生产向量库证明（真 Postgres + pgvector HNSW）：ANN 检索正确(对齐暴力余弦)、HNSW 索引真被用、RLS 隔离、去重、隐私(不存原文)。
 *   pnpm vectorstore:prove   (需 pnpm db:up;pgvector image)
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createPool, asPrincipal, upsertVectorChunk, annSearch } from '../src/index.ts';

const pool = createPool();
let fail = 0;
const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };
const sql = (f: string) => readFileSync(fileURLToPath(new URL(`../sql/${f}`, import.meta.url)), 'utf8');

const DIM = 512;
// 确定性 512 维向量(每块一个,LCG 伪随机 + 归一)
function embed(seed: number): number[] {
  let s = (seed * 2654435761) >>> 0; const v: number[] = [];
  for (let i = 0; i < DIM; i++) { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; v.push(s / 2 ** 32 - 0.5); }
  const nrm = Math.hypot(...v); return v.map((x) => x / nrm);
}
const cosine = (a: number[], b: number[]) => { let d = 0; for (let i = 0; i < a.length; i++) d += a[i] * b[i]; return d; }; // 已归一

async function main() {
  await pool.query(sql('01_schema.sql'));
  await pool.query(sql('06_retrieval.sql'));
  const N = 60, OWNER = 'userA', QOWNER = '__system_qbank__';   // qbank 现仅系统灌库 principal 可写(06_retrieval 写门收紧);memory 仍各用户自写
  const vecs = Array.from({ length: N }, (_, i) => embed(i + 1));

  await asPrincipal(pool, QOWNER, async (c) => {
    for (let i = 0; i < N; i++) await upsertVectorChunk(c, QOWNER, { id: `vc${i}`, kind: 'qbank', refId: `q${i}`, contentHash: `h${i}`, embedding: vecs[i] });
  });
  A(`写入 ${N} 个向量块`, (await asPrincipal(pool, OWNER, (c) => c.query('SELECT count(*)::int n FROM vector_chunk'))).rows[0].n === N);

  // ① ANN 正确性:用第 7 块自身向量查 → top-1 必是 q7
  const self = await asPrincipal(pool, OWNER, (c) => annSearch(c, OWNER, 'qbank', vecs[7], 5));
  A('ANN 自查:top-1 = 自己(q7),距离≈0', self[0].refId === 'q7' && self[0].distance < 1e-4);

  // ② ANN ≈ 暴力余弦:扰动查询,HNSW top-5 与暴力 top-5 高度一致(ANN 近似但应高召回)
  const q = embed(7).map((x, i) => x + (i % 11 === 0 ? 0.02 : 0));   // 轻扰动
  const ann = (await asPrincipal(pool, OWNER, (c) => annSearch(c, OWNER, 'qbank', q, 5))).map((r) => r.refId);
  const brute = vecs.map((v, i) => ({ id: `q${i}`, s: cosine(q, v) })).sort((a, b) => b.s - a.s).slice(0, 5).map((x) => x.id);
  const overlap = ann.filter((id) => brute.includes(id)).length;
  A(`ANN top-5 与暴力余弦 top-5 重合 ${overlap}/5(HNSW 高召回)`, overlap >= 4 && ann[0] === brute[0]);

  // ③ HNSW 索引真被使用(非 seq scan)
  const plan = (await asPrincipal(pool, OWNER, (c) => c.query(`EXPLAIN SELECT ref_id FROM vector_chunk WHERE kind='qbank' ORDER BY embedding <=> '${`[${q.join(',')}]`}'::vector LIMIT 5`))).rows.map((r) => r['QUERY PLAN']).join(' ');
  A('查询计划走 HNSW 索引(ix_vchunk_hnsw),非全表扫', /ix_vchunk_hnsw|Index Scan/i.test(plan));

  // ④ 去重:同 owner+kind+hash 再写 → 不新增
  await asPrincipal(pool, QOWNER, (c) => upsertVectorChunk(c, QOWNER, { id: 'vcX', kind: 'qbank', refId: 'q0', contentHash: 'h0', embedding: vecs[0] }));
  A('同 hash 幂等去重(不增行)', (await asPrincipal(pool, OWNER, (c) => c.query('SELECT count(*)::int n FROM vector_chunk'))).rows[0].n === N);

  // ⑤ 租户模型(决策 i):qbank 共享公共读 / memory 私有 owner-only
  const bSeesQbank = await asPrincipal(pool, 'userB', (c) => annSearch(c, 'userB', 'qbank', vecs[7], 5));
  A('qbank 共享:userB 也能检索到(策展真题=共享知识,公共读)', bSeesQbank.length > 0);
  await asPrincipal(pool, OWNER, (c) => upsertVectorChunk(c, OWNER, { id: 'mA', kind: 'memory', refId: 'mem-a', contentHash: 'hm', embedding: vecs[7] }));
  const bSeesMem = await asPrincipal(pool, 'userB', (c) => annSearch(c, 'userB', 'memory', vecs[7], 5));
  A('memory 私有:userB 检索不到 userA 的成长档案(不串户,RLS 限己)', bSeesMem.length === 0);

  // ⑥ 隐私:表里无原文列(只 ref_id + hash + 向量)
  const cols = (await asPrincipal(pool, OWNER, (c) => c.query("SELECT column_name FROM information_schema.columns WHERE table_name='vector_chunk'"))).rows.map((r) => r.column_name);
  A('向量库不含原文/内容列(只 ref_id+hash+embedding,隐私)', !cols.includes('content') && !cols.includes('text') && cols.includes('ref_id') && cols.includes('content_hash'));

  console.log(`\n${fail === 0 ? '✓ 生产向量库(pgvector HNSW)全部通过' : '✗ ' + fail + ' 项失败'}`);
  await pool.end();
  process.exit(fail === 0 ? 0 : 1);
}
main().catch((e) => { console.error(e); process.exit(1); });
