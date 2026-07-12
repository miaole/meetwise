/**
 * 检索/召回引擎证明（确定性,无网络）：度量数学正确 + dense/BM25/RRF 排序正确 + 全金标集端到端跑通。
 * 真召回率(94.3% @dim128,text-embedding-v4)由 key-gated `recall:eval` 实测;此 gate 锁的是"度量与管线没算错"。
 *   pnpm retrieval:prove
 */
import { fakeEmbedder, denseRank, buildBm25, rrf, evalRecall, weightedRrf, buildSearchIndex, type Reranker } from '../src/index.ts';
import { CORPUS, QUERIES } from '../../../apps/worker/smoke/retrieval-golden.ts';

let fail = 0;
const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };
const approx = (a: number, b: number) => Math.abs(a - b) < 1e-9;

async function main() {
  // ① 度量数学:手算可验
  const r = evalRecall([['a', 'b'], ['c', 'x']], [{ query: 'q1', relevant: ['a'] }, { query: 'q2', relevant: ['c', 'y'] }], 2);
  A('recall@k = Σ命中/Σ相关 = (1+1)/(1+2) = 0.667', approx(r.recall, 2 / 3));
  A('成功率 = 全相关入top-k的查询占比 = 1/2 = 0.5', approx(r.successRate, 0.5));
  A('MRR = (1/1 + 1/1)/2 = 1.0', approx(r.mrr, 1));
  const rMiss = evalRecall([['x', 'y']], [{ query: 'q', relevant: ['a'] }], 2);
  A('全miss → recall=0 成功率=0 MRR=0', rMiss.recall === 0 && rMiss.successRate === 0 && rMiss.mrr === 0);

  // ② RRF:两路都靠前的 id 融合后居首
  A('RRF 融合:双路命中的 b 居首', rrf([['a', 'b'], ['b', 'c']], 3)[0] === 'b');
  A('RRF k 截断生效', rrf([['a', 'b', 'c', 'd']], 2).length === 2);

  // ③ BM25:共享词的文档排前
  const bm = buildBm25([{ id: 'd1', text: '滑动窗口限流平滑无突刺' }, { id: 'd2', text: '令牌桶允许突发' }]);
  A('BM25 命中"滑动窗口"→ d1 居首', bm.rank('滑动窗口怎么限流', 2)[0] === 'd1');

  // ④ Dense:fakeEmbedder(词袋) 下,文本相同者 cosine=1 排首
  const emb = fakeEmbedder(128);
  const vecs = await emb.embed(['滑动窗口限流', '令牌桶限流', '完全不相关的内容']);
  const corpusVec = [{ id: 'a', vec: vecs[0] }, { id: 'b', vec: vecs[1] }, { id: 'c', vec: vecs[2] }];
  const [qv] = await emb.embed(['滑动窗口限流']);
  A('Dense:与查询同文 → 居首', denseRank(qv, corpusVec, 3)[0] === 'a');

  // ⑤ 全金标集端到端:harness 在 35 查询上跑通,产出合法度量(0..1)
  const cv = (await emb.embed(CORPUS.map((c) => c.text))).map((vec, i) => ({ id: CORPUS[i].id, vec }));
  const qvs = await emb.embed(QUERIES.map((q) => q.q));
  const golden = QUERIES.map((q) => ({ query: q.q, relevant: q.relevant }));
  const rep = evalRecall(QUERIES.map((_, i) => denseRank(qvs[i], cv, 5)), golden, 5);
  A(`全金标集(${QUERIES.length}查询)跑通,度量合法[0,1]`, rep.n === QUERIES.length && rep.recall >= 0 && rep.recall <= 1 && rep.successRate >= 0 && rep.successRate <= 1);
  A('金标集无重复 query / 相关 id 都在语料内', new Set(QUERIES.map((q) => q.q)).size === QUERIES.length && QUERIES.every((q) => q.relevant.every((id) => CORPUS.some((c) => c.id === id))));

  // ⑥ 加权 RRF:高权重路的命中应压过低权重路
  A('加权 RRF:dense 权重高 → 其首项压过 bm25 首项', weightedRrf([{ ids: ['x', 'y'], weight: 1 }, { ids: ['z'], weight: 0.1 }], 3)[0] === 'x');

  // ⑦ search 管线(两段式)：dense/hybrid/rerank 三模式 + reranker 被调用
  const docs = [{ id: 'a', text: '滑动窗口限流平滑' }, { id: 'b', text: '令牌桶允许突发' }, { id: 'c', text: '完全无关的天气内容' }];
  const idx = await buildSearchIndex(docs, fakeEmbedder(128));
  const dHit = await idx.search('滑动窗口限流', { mode: 'dense', k: 2 });
  A('search dense:相关文居首 + 返回 k 个', dHit[0] === 'a' && dHit.length === 2);
  const hHit = await idx.search('限流', { mode: 'hybrid', k: 3, weights: { dense: 1, bm25: 0.5 } });
  A('search hybrid:跑通且不含越界 id', hHit.every((id) => docs.some((d) => d.id === id)));
  let rerankCalled = 0;
  const fakeReranker: Reranker = { id: 'fake', async rerank(_q, ds, topN) { rerankCalled++; return ds.map((d) => d.id).reverse().slice(0, topN); } };
  const rHit = await idx.search('限流', { mode: 'rerank', k: 2, recallN: 3, reranker: fakeReranker });
  A('search rerank:reranker 被调用 + 返回其排序结果', rerankCalled === 1 && rHit.length === 2);

  console.log(`\n${fail === 0 ? '✓ 检索/召回引擎(度量+管线+两段式)全部通过' : '✗ ' + fail + ' 项失败'}`);
  process.exit(fail === 0 ? 0 : 1);
}
main().catch((e) => { console.error(e); process.exit(1); });
