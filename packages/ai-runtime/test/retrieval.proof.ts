/**
 * 检索/召回引擎证明（确定性,无网络）：度量数学正确 + dense/BM25/RRF 排序正确 + 全金标集端到端跑通。
 * 此 gate 锁的是“度量与管线没算错”；真实模型质量仅由当前 57-query 发布集的独立 eval 报告。
 *   pnpm retrieval:prove
 */
import {
  fakeEmbedder, denseRank, buildBm25, rrf, evalRecall, weightedRrf, buildSearchIndex,
  expandQuery, multiQuerySearch, type QueryExpansionInvoker, type Reranker,
} from '../src/index.ts';
import { ADVERSARIAL_CORPUS, ADVERSARIAL_QUERIES } from '../../../apps/worker/smoke/retrieval-adversarial-golden.ts';

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
  const corpusVec = [{ id: 'a', vec: vecs[0]! }, { id: 'b', vec: vecs[1]! }, { id: 'c', vec: vecs[2]! }];
  const [qv] = await emb.embed(['滑动窗口限流']);
  if (!qv) throw new Error('test_embedder_returned_no_query_vector');
  A('Dense:与查询同文 → 居首', denseRank(qv, corpusVec, 3)[0] === 'a');

  // ⑤ 当前发布集的可回答子集端到端：只验证 harness 与度量范围，不将 fake embedding 当质量结论。
  const answerable = ADVERSARIAL_QUERIES.filter((q) => !q.noAnswer);
  const cv = (await emb.embed(ADVERSARIAL_CORPUS.map((c) => c.text))).map((vec, i) => ({ id: ADVERSARIAL_CORPUS[i]!.id, vec }));
  const qvs = await emb.embed(answerable.map((q) => q.query));
  const golden = answerable.map((q) => ({ query: q.query, relevant: q.relevant }));
  if (qvs.length !== answerable.length || qvs.some((vec) => !vec)) throw new Error('test_embedder_returned_incomplete_batch');
  const rep = evalRecall(answerable.map((_, i) => denseRank(qvs[i]!, cv, 5)), golden, 5);
  A(`当前发布集可回答子集(${answerable.length}查询)跑通,度量合法[0,1]`, rep.n === answerable.length && rep.recall >= 0 && rep.recall <= 1 && rep.successRate >= 0 && rep.successRate <= 1);
  A('发布集无重复 query / 相关 id 都在语料内', new Set(answerable.map((q) => q.query)).size === answerable.length && answerable.every((q) => q.relevant.every((id) => ADVERSARIAL_CORPUS.some((c) => c.id === id))));

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

  // ⑧ 多查询扩展:真实 OpenAI-compatible client returns a parsed object,
  // while some adapters return a JSON string. Both must work, but malformed
  // model output must not become an embedding query or an exception.
  let expansionCalls = 0;
  const objectExpansion: QueryExpansionInvoker = {
    async invokeQueryExpansion() {
      expansionCalls++;
      return { queries: ['令牌桶 限流 原理', '令牌桶 限流 原理', '滑动窗口与令牌桶差异', '原问题'] };
    },
  };
  const objectVariants = await expandQuery('原问题', objectExpansion, 3);
  A('多查询扩展兼容已解析对象，去重且排除原 query', expansionCalls === 1
    && objectVariants.join('|') === '令牌桶 限流 原理|滑动窗口与令牌桶差异');
  const stringVariants = await expandQuery('原问题', {
    async invokeQueryExpansion() { return JSON.stringify({ queries: ['JSON 字符串变体'] }); },
  });
  A('多查询扩展兼容 JSON 字符串返回', stringVariants.length === 1 && stringVariants[0] === 'JSON 字符串变体');
  const malformedVariants = await expandQuery('原问题', {
    async invokeQueryExpansion() { return { queries: ['ok'], injected: 'not allowed' }; },
  });
  A('畸形/越界模型输出 fail-soft，不进入后续检索', malformedVariants.length === 0);
  const multi = await multiQuerySearch('令牌桶限流', idx, objectExpansion, { k: 2, recallN: 3 });
  A('multiQuerySearch 仅接受受治理调用 seam，扩展后仍返回语料内结果', multi.length === 2 && multi.every((id) => docs.some((d) => d.id === id)));

  console.log(`\n${fail === 0 ? '✓ 检索/召回引擎(度量+管线+两段式)全部通过' : '✗ ' + fail + ' 项失败'}`);
  process.exit(fail === 0 ? 0 : 1);
}
main().catch((e) => { console.error(e); process.exit(1); });
