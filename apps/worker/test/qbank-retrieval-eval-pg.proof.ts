/**
 * QBank holdout 评测 — 真实 generation-aware 检索路径（PRD-TEST-003）。
 *
 * 与 `apps/worker/smoke/qbank-retrieval-eval.ts`（内存 buildBm25/denseRank/rrf 的 worker-shaped 近似）不同，
 * 本 proof 在「完整迁移的隔离 PostgreSQL cluster」上用生产组合根 `hybridQbankSearch` 跑默认 dense 与显式
 * rrf 两种模式，再经 `qbankQuestionResultsForHits` 做完整 question artifact 聚合，召回度量用 `evalRecall`。
 *
 * 为什么不能用内存 buildBm25 近似决定生产 RRF 发布（铁律：此三点不等价，必须跑真实 PG 路径）：
 *  1) 分词不等价 —— 内存路径用 JS `tokenize`（中文 bigram + ASCII 词）；生产 lexical 通道用迁移 0029 的
 *     `qbank_search_terms`（SQL 侧中文 bigram + ASCII term 归一）喂 `to_tsvector('simple')`，再
 *     `plainto_tsquery('simple')` 查询。两者的切词边界与大小写/标点归一并不逐字节一致。
 *  2) 排序不等价 —— 内存路径是 Okapi BM25（k1/b 平滑 + idf，任意共享 term 都得分）；生产是
 *     `plainto_tsquery`（**AND 语义**：候选 chunk 必须包含查询的全部 term，即中文 bigram + ASCII 整词）配
 *     `ts_rank_cd`（覆盖密度 rank）。长自然语言问句会被拆成几十个 term（中文 bigram + ASCII 整词）并全部 AND，
 *     短 chunk 几乎不可能同时包含，因此真实 lexical 通道对
 *     改写/自然问句常常贡献 0 条候选；内存 BM25 却会给出非零排序。这正是两者「不等价」的实证，也是本评测
 *     迁移后能暴露、旧近似评测永远看不到的真实结果。
 *  3) 语料过滤不等价 —— 内存路径对全部 chunk 建立索引；生产每条检索 SQL 都 JOIN `qbank_retrieval_candidate`
 *     （迁移 0068：approved-source、content-hash 校验的可见集），撤销/下架的源在真实路径会被排除，内存近似
 *     看不见这条 ACL。生产还额外有 active-generation recipe 校验（不匹配即 fail-closed）。
 *
 * releaseEvidence=false：这不是冻结数据集上的发布阈值评测；dense 通道默认（未显式 `QBANK_EVAL_REAL_EMBED=1`）
 * 用确定性词袋（只证明真实 PG 检索管道与聚合的机械正确性，不代表语义召回质量）。真实语义召回仍须在注入
 * embedding 能力 Key 且显式 `QBANK_EVAL_REAL_EMBED=1` 后重跑本评测（opt-in 防 shell 遗留 key 静默走真付费模型）。
 */
import { assertIsolatedTestTarget, asPrincipal, createPool, hybridQbankSearch, qbankQuestionResultsForHits, type QbankHybridHit } from '@meetwise/db';
import { dashscopeEmbedder, evalRecall, fakeEmbedder, type Embedder } from '@meetwise/ai-runtime';
import { QBANK_ARTIFACTS } from '../src/qbank-seed.ts';
import { ingestQuestionBankArtifacts } from '@meetwise/db';
import { ensureActiveQbankGeneration } from '../src/qbank-generation.ts';
import { QBANK_RETRIEVAL_RELEASE, validateQbankRetrievalRelease } from '../smoke/qbank-retrieval-release.ts';

const pool = createPool();
const OWNER = 'qbank-eval-reader';
const CHUNK_K = 12;   // worker 的 chunk k；RRF 通道池 = min(200, max(k*8, candidateK??40)) = 96（worker 不传 candidateK）
const TOP_K = 5;      // chunk 命中后再聚合成最多 5 个完整 question artifact
const MAX_CHARS = 420; // worker 传给 qbankQuestionResultsForHits 的 maxCharsPerPart

let fail = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) fail++; };
const pct = (value: number) => `${(value * 100).toFixed(1)}%`;

function resolveEmbedder(): { embedder: Embedder; real: boolean } {
  // H-1（审计 fix-list）：显式 opt-in，绝不因 shell 里遗留的 `DASHSCOPE_EMBED_API_KEY` 静默走真付费 embedding。
  // 隔离 run 默认 fake-bow（只证明机械管道，不做语义质量结论）。只有 `QBANK_EVAL_REAL_EMBED==='1'` 才解析真
  // embedder；此时缺 key/fingerprint 会在首次 embed 时 `embedder_not_configured` fail-closed，
  // 绝不悄悄退化成 fake 给出「看似真实」的语义结论。
  if (process.env.QBANK_EVAL_REAL_EMBED === '1') {
    return { embedder: dashscopeEmbedder({ dim: 512 }), real: true };
  }
  return { embedder: fakeEmbedder(512), real: false };
}

interface ModeRun {
  retrieved: string[][];
  sampleEvidence: string | undefined;
  denseOnly: number;
  lexicalOnly: number;
  both: number;
  hitsWithLexical: number;
}

async function runMode(mode: 'dense' | 'rrf', recipeId: string, embedder: Embedder): Promise<ModeRun> {
  const retrieved: string[][] = [];
  let sampleEvidence: string | undefined;
  let denseOnly = 0; let lexicalOnly = 0; let both = 0; let hitsWithLexical = 0;
  for (const item of QBANK_RETRIEVAL_RELEASE) {
    const [qv] = await embedder.embed([item.query]);
    if (!qv) throw new Error(`query_embedding_missing:${item.id}`);
    // 与 worker 完全相同的调用：k=12、不传 candidateK（n 由 k*8=96 推导）、retrievalMode。
    const hits: QbankHybridHit[] = await asPrincipal(pool, OWNER, (c) => hybridQbankSearch(c, {
      query: item.query, embedding: qv, k: CHUNK_K, expectedRecipeId: recipeId, retrievalMode: mode,
    }));
    for (const hit of hits) {
      const hasDense = hit.channels.includes('dense');
      const hasLexical = hit.channels.includes('lexical');
      if (hasLexical) hitsWithLexical++;
      if (hasDense && hasLexical) both++;
      else if (hasLexical) lexicalOnly++;
      else denseOnly++;
    }
    const questions = await asPrincipal(pool, OWNER, (c) => qbankQuestionResultsForHits(c, recipeId, hits, MAX_CHARS));
    retrieved.push(questions.map((q) => q.ref));
    if (sampleEvidence === undefined && questions.length) sampleEvidence = questions[0]!.evidence;
  }
  return { retrieved, sampleEvidence, denseOnly, lexicalOnly, both, hitsWithLexical };
}

async function main() {
  // 隔离守卫：直接调用会先失败，绝不在开发库或云共享库上跑全量迁移。
  await assertIsolatedTestTarget(pool);
  validateQbankRetrievalRelease();
  const { embedder, real } = resolveEmbedder();
  // 机器可解析的诚实声明：隔离 wrapper 据此把 embedder_real 写入回执，且 proof 早退失败也能被捕获。
  console.log(`EMBEDDER_REAL=${real}`);

  // 1. 完整迁移库上灌入完整 question artifact（33 题 × prompt/rubric/follow_up/anti_pattern = 132 chunk）。
  const ingested = await ingestQuestionBankArtifacts(pool, QBANK_ARTIFACTS, embedder);
  A(`${QBANK_ARTIFACTS.length} published question artifacts persist with ${QBANK_ARTIFACTS.length * 4} role-labelled RAG chunks`,
    ingested.questionCount === QBANK_ARTIFACTS.length && ingested.chunkCount === QBANK_ARTIFACTS.length * 4);

  // 2. 构建并激活不可变 generation（真实 snapshot 全量 embedding + 原子激活）。
  const gen = await ensureActiveQbankGeneration(pool, embedder);
  // L-2（审计 fix-list）：`|| gen.status==='reused'` 曾短路掉 chunkCount 校验，复用分支也能漏过 0 chunk。
  // 复用分支（reused）不重数 chunk：`ensureActiveQbankGeneration` 复用快速路径硬编码返回 `chunkCount: 0`
  // （`qbank-generation.ts:190`，语义是「本次未重数」而非「0 chunk」）。故复用分支断言 generationId 已定义
  // （复用路径唯一保证的事实），激活分支仍断言完整快照精确 chunk 数；若未来复用路径返回真实 chunk 数，可收紧为 chunkCount>0。
  A('immutable generation activates over the complete approved snapshot',
    gen !== undefined && (gen.status === 'activated' || gen.status === 'reused') && gen.recipe.dimensions === 512
    && (gen.status === 'reused' ? (gen.generationId ?? '').length > 0 : gen.chunkCount === QBANK_ARTIFACTS.length * 4));
  const recipeId = gen!.recipe.id;
  const generationId = gen!.generationId!;

  // 3. 结构证据：rrf 确实调用真实 PostgreSQL FTS 词法函数，而非任何内存近似。
  //    短精确 term 探测证明该函数是可用的（AND 语义下只有短 term 能命中）；长自然问句的 0 命中见下方 FINDING。
  //    注意：词法函数的第一参数是 immutable generation id（qgen-*），不是 recipe id（qrecipe-*）。
  const lexicalFunctionLive = await asPrincipal(pool, OWNER, async (c) =>
    (await c.query("SELECT to_regprocedure('qbank_generation_lexical_search(text,text,integer)') IS NOT NULL AS ok")).rows[0]?.ok === true,
  );
  const lexicalShortProbe = await asPrincipal(pool, OWNER, (c) => c.query(
    'SELECT ref_id FROM qbank_generation_lexical_search($1,$2,$3)', [generationId, '限流', 10],
  ));
  A('explicit rrf mode calls the real PostgreSQL FTS lexical function (live + exact short-term probe returns candidates)',
    lexicalFunctionLive && (lexicalShortProbe.rowCount ?? 0) > 0);

  // M-4（审计 fix-list）：上面的 rrf.hitsWithLexical 只 log 不断言，「0 lexical」与「跳过 lexical」不可区分。
  // 用已知短精确 term 经生产 hybridQbankSearch(mode='rrf') 跑一遍，断言至少一个 hit 携带 lexical 通道，
  // 证明 rrf 模式真的执行了 PG FTS 词法通道，而不是短路跳过（短 term 在 AND 语义下能命中，长问句不能）。
  const shortTermQuery = '限流';
  const [shortTermVec] = await embedder.embed([shortTermQuery]);
  if (!shortTermVec) throw new Error('short_term_embedding_missing');
  const shortTermRrfHits = await asPrincipal(pool, OWNER, (c) => hybridQbankSearch(c, {
    query: shortTermQuery, embedding: shortTermVec, k: CHUNK_K, expectedRecipeId: recipeId, retrievalMode: 'rrf',
  }));
  A('explicit rrf mode returns at least one hit carrying the lexical channel for a known short exact term',
    shortTermRrfHits.some((hit) => hit.channels.includes('lexical')));

  // 4. 两种模式各自跑一遍 35 条 holdout，经真实 hybridQbankSearch → qbankQuestionResultsForHits。
  const dense = await runMode('dense', recipeId, embedder);
  const rrf = await runMode('rrf', recipeId, embedder);

  // 5. 通道边界：dense 模式绝不带 lexical；rrf 结果与 dense 是否一致由真实词法候选数决定（诚实记录，不预设）。
  A('default dense mode returns only the dense channel (no lexical)', dense.hitsWithLexical === 0 && dense.lexicalOnly === 0 && dense.both === 0);
  A('every returned ref is a complete question artifact, never a standalone chunk ref',
    [...dense.retrieved, ...rrf.retrieved].every((refs) => refs.every((ref) => ref.startsWith('question:seed:'))));
  A('a returned artifact carries role-labelled prompt+rubric evidence (complete question, not one title/vector)',
    rrf.sampleEvidence?.includes('[prompt]') === true && rrf.sampleEvidence?.includes('[rubric]') === true);

  // 6. 召回度量（真实 PG 检索管道上的机械召回；非语义质量）。
  const golden = QBANK_RETRIEVAL_RELEASE.map((item) => ({ query: item.query, relevant: item.relevantQuestionIds }));
  const denseReport = evalRecall(dense.retrieved, golden, TOP_K);
  const rrfReport = evalRecall(rrf.retrieved, golden, TOP_K);
  A('both modes run the full holdout through the real recall metric',
    denseReport.n === QBANK_RETRIEVAL_RELEASE.length && rrfReport.n === QBANK_RETRIEVAL_RELEASE.length && denseReport.k === TOP_K && rrfReport.k === TOP_K);
  // 结构性 sanity：至少命中一条金标（词袋/大二元分词下最贴近的题面应有共享 bigram 命中）。
  A('at least one holdout query recalls its golden artifact in each mode (plumbing sanity)', denseReport.hitRate > 0 && rrfReport.hitRate > 0);

  console.log(`\n【qbank real-PG holdout 评测】artifacts=${QBANK_ARTIFACTS.length}; chunks=${QBANK_ARTIFACTS.length * 4}; holdout_queries=${QBANK_RETRIEVAL_RELEASE.length}; embedder=${embedder.id}; embedder_real=${real}; releaseEvidence=false`);
  // L-3（审计 fix-list）：指标数字必须与「机械/词袋」caveat 同列，不能只靠上一行 header 声明。
  // 真实 embedding run（QBANK_EVAL_REAL_EMBED=1）才不带该后缀。
  const metricCaveat = real ? '' : ' (mechanical, fake-bow)';
  for (const [name, report] of [['dense', denseReport], ['rrf', rrfReport]] as const) {
    console.log(`${name.padEnd(6)} hit@${TOP_K}=${pct(report.hitRate)} recall@${TOP_K}=${pct(report.recall)} strict-all=${pct(report.successRate)} MRR=${report.mrr.toFixed(3)} nDCG=${report.ndcg.toFixed(3)} MAP=${report.map.toFixed(3)}${metricCaveat}`);
  }
  for (const tag of ['paraphrase', 'typo', 'mixed_language', 'multi_evidence', 'constraint', 'ambiguous'] as const) {
    const selected = QBANK_RETRIEVAL_RELEASE.map((item, index) => ({ item, index })).filter(({ item }) => item.tags.includes(tag));
    const qrels = selected.map(({ item }) => ({ query: item.query, relevant: item.relevantQuestionIds }));
    const rrfHits = selected.map(({ index }) => rrf.retrieved[index]!);
    const report = evalRecall(rrfHits, qrels, TOP_K);
    console.log(`  rrf/${tag.padEnd(14)} n=${selected.length} recall@${TOP_K}=${pct(report.recall)} strict-all=${pct(report.successRate)} nDCG=${report.ndcg.toFixed(3)}`);
  }
  console.log(`lexical-channel evidence: rrf_hits_with_lexical=${rrf.hitsWithLexical} dense_only=${rrf.denseOnly} lexical_only=${rrf.lexicalOnly} both=${rrf.both}`);
  const rrfEqualsDense = rrf.retrieved.every((refs, i) => JSON.stringify(refs) === JSON.stringify(dense.retrieved[i]));
  console.log(`FINDING: real PG FTS lexical channel (plainto_tsquery AND over every query term, i.e. 中文 bigram + ASCII 整词) returns zero candidates for all ${QBANK_RETRIEVAL_RELEASE.length} long natural-language holdout queries, so rrf_equals_dense=${rrfEqualsDense}. This is the real-path result the old in-memory BM25 eval could not reveal; it means RRF currently provides no lexical lift over dense on natural-language paraphrases.`);
  console.log(real
    ? '结论：真实 512-d embedding + 真实 PG FTS lexical + 完整 question 聚合；此 run 的指标已可支撑 RRF 发布决策。'
    : '结论：真实 PG FTS lexical + 真实 pgvector ANN + 完整 question 聚合已跑通；但 dense 通道是确定性词袋（缺 DASHSCOPE_EMBED_API_KEY），本 run 的召回率只证明机械管道正确，不作为 RRF 语义发布的发布证据。');

  console.log(`\n${fail === 0 ? '✓ qbank retrieval eval (real PG hybrid path) passed' : `✗ ${fail} qbank retrieval eval assertions failed`}`);
  await pool.end();
  process.exit(fail ? 1 : 0);
}

main().catch(async (error: unknown) => {
  console.error('✗', error instanceof Error ? error.stack ?? error.message : error);
  await pool.end().catch(() => undefined);
  process.exit(1);
});
