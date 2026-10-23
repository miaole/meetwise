/** 费用治理启动门：开发可观察，生产缺任一价格/预算字段必须拒绝启动。缺用量以外的实量拒绝不依赖数据库。全部命中不连库。 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { cjkWeightedEstimate, type Embedder, type EmbeddingStore } from '@meetwise/ai-runtime';
import type { DbPool } from '@meetwise/db';
import { budgetedQbankEmbedding, RagCostError, resolveRagCostGovernance, type RagCostGovernanceConfig } from '../src/rag-cost-governance.ts';

let failures = 0;
const check = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };
const fails = (env: NodeJS.ProcessEnv, code: string) => {
  try { resolveRagCostGovernance(env); return false; } catch (error) { return String(error).includes(code); }
};

const development = resolveRagCostGovernance({ NODE_ENV: 'development' });
check('开发默认 observe，保留本地样例可运行性', development.mode === 'observe' && development.maxInputTokens === 16_000);
check('生产不能以 observe 启动', fails({ NODE_ENV: 'production', RAG_COST_ENFORCEMENT: 'observe' }, 'rag_cost_enforcement_required_in_production'));
check('生产缺价格表或月度预算配置即拒绝启动', fails({ NODE_ENV: 'production', RAG_COST_ENFORCEMENT: 'enforce' }, 'rag_cost_invalid_provider'));
const production = resolveRagCostGovernance({
  NODE_ENV: 'production', RAG_COST_ENFORCEMENT: 'enforce', RAG_EMBED_MAX_INPUT_TOKENS: '16000',
  RAG_EMBED_BILLING_PROVIDER: 'dashscope', RAG_EMBED_BILLING_MODEL: 'text-embedding-v4', RAG_EMBED_BILLING_REGION: 'cn-beijing',
  RAG_EMBED_PRICE_REVISION: '2026-08-03', RAG_EMBED_INPUT_MICRO_CNY_PER_MILLION: '500000',
  RAG_EMBED_PRICE_SOURCE_URL: 'https://help.aliyun.com/zh/model-studio/text-embedding-v4',
  RAG_EMBED_MONTHLY_BUDGET_MICRO_CNY: '100000000', RAG_EMBED_BUDGET_SCOPE: 'rag-embedding-prod',
});
check('生产只有完整的价格 revision、硬预算、输入上界时才进入 enforce', production.mode === 'enforce'
  && production.maxInputTokens === 16_000 && production.inputMicroCnyPerMillion === 500_000 && production.monthlyBudgetMicroCny === 100_000_000);

// 预留和派发必须先返回，范围检查才跑得到。结算语句仍默认抛错，避免把估算写进账。
function scriptedPool(): { pool: DbPool; settleTokens: unknown[] } {
  const settleTokens: unknown[] = [];
  const empty = { rows: [], rowCount: 0 };
  const client = {
    async query(sql: unknown, params?: unknown[]) {
      const text = typeof sql === 'string' ? sql : String(sql);
      if (text.includes('ai_cost_settle')) {
        settleTokens.push(params?.[3]);
        throw new Error('proof_settle_queried');
      }
      if (text === 'BEGIN' || text === 'COMMIT' || text === 'ROLLBACK' || text.startsWith('SET LOCAL ROLE ') || text.includes('set_config')) return empty;
      if (text.includes('ai_cost_reserve_text_scoped')) {
        return { rows: [{ decision: 'reserved', ['reserved_micro_cny']: 1000, ['price_revision']: 'r-proof' }], rowCount: 1 };
      }
      if (text.includes('ai_cost_mark_dispatched_scoped') || text.includes('ai_cost_mark_unknown_scoped') || text.includes('ai_cost_release_scoped')) {
        return { rows: [{ ok: true }], rowCount: 1 };
      }
      throw new Error(`proof_query_refused:${text}`);
    },
    release() { /* 假连接无会话可释放 */ },
  };
  return { pool: { async connect() { return client; } } as unknown as DbPool, settleTokens };
}

const rejectCfg: RagCostGovernanceConfig = {
  mode: 'enforce', provider: 'proof', model: 'embed-proof', region: 'cn-test', priceRevision: 'r-proof',
  inputMicroCnyPerMillion: 1_000_000, priceSourceUrl: 'https://pricing.invalid/proof', monthlyBudgetMicroCny: 3_000,
  scopeId: 'rag-proof-reject', maxInputTokens: 1000,
};

async function rejectReported(name: string, inputTokens: number | null): Promise<void> {
  const script = scriptedPool();
  let calls = 0;
  const embedder: Embedder = {
    dim: 512, id: 'embed-proof',
    async embed(texts) { calls++; return texts.map(() => [1, 0]); },
    async embedWithUsage(texts) {
      calls++;
      return { vectors: texts.map(() => [1, 0]), inputTokens: inputTokens as unknown as number };
    },
  };
  let rejected = false;
  let error: unknown = undefined;
  try {
    await budgetedQbankEmbedding(script.pool, 'rag-proof-owner', embedder, rejectCfg)(
      ['中文测试'], { cacheKey: name, invocationId: name, mode: 'claimed' },
    );
  } catch (caught: unknown) {
    rejected = true;
    error = caught;
  }
  const message = error instanceof Error ? error.message : '';
  const code = error instanceof RagCostError ? error.code : '';
  const ok = rejected && calls === 1 && script.settleTokens.length === 0
    && message === 'external_outcome_unknown' && code === 'external_outcome_unknown';
  check(name, ok);
  if (!ok) console.log(`  detail calls=${calls} settles=${script.settleTokens.join(',')} message=${message} code=${code}`);
}

function segmentEstimate(texts: string[], max: number): number {
  return Math.min(texts.reduce((sum, text) => sum + cjkWeightedEstimate(text), 0), max);
}

function vectorKey(id: string, dim: number, text: string): string {
  return `${id}:${dim}:${createHash('sha256').update(text).digest('hex')}`;
}

function sameVectors(actual: number[][] | undefined, expected: number[][]): boolean {
  if (!actual || actual.length !== expected.length) return false;
  return actual.every((row, i) => {
    const want = expected[i];
    return !!want && row.length === want.length && row.every((n, j) => n === want[j]);
  });
}

function openLedger(reserve: 'reserved' | 'price_missing' = 'reserved'): {
  pool: DbPool; connects: () => number; settleTokens: unknown[]; sql: string[];
} {
  let connects = 0;
  const settleTokens: unknown[] = [];
  const sql: string[] = [];
  const empty = { rows: [], rowCount: 0 };
  const client = {
    async query(statement: unknown, params?: unknown[]) {
      const text = typeof statement === 'string' ? statement : String(statement);
      sql.push(text);
      if (text.includes('ai_cost_settle')) {
        settleTokens.push(params?.[3]);
        return { rows: [{ ['micro_cny']: 1 }], rowCount: 1 };
      }
      if (text === 'BEGIN' || text === 'COMMIT' || text === 'ROLLBACK' || text.startsWith('SET LOCAL ROLE ') || text.includes('set_config')) return empty;
      if (text.includes('ai_cost_reserve_text_scoped')) {
        if (reserve === 'price_missing') {
          return { rows: [{ decision: 'price_missing', ['reserved_micro_cny']: 0, ['price_revision']: null }], rowCount: 1 };
        }
        return { rows: [{ decision: 'reserved', ['reserved_micro_cny']: 1000, ['price_revision']: 'r-proof' }], rowCount: 1 };
      }
      if (text.includes('ai_cost_mark_dispatched_scoped') || text.includes('ai_cost_mark_unknown_scoped') || text.includes('ai_cost_release_scoped')) {
        return { rows: [{ ok: true }], rowCount: 1 };
      }
      throw new Error(`proof_query_refused:${text}`);
    },
    release() { /* 假连接无会话可释放 */ },
  };
  const pool = { async connect() { connects += 1; return client; } } as unknown as DbPool;
  return { pool, connects: () => connects, settleTokens, sql };
}

function recordingStore(seed: ReadonlyArray<[string, number[]]>): EmbeddingStore & {
  gets: string[][];
  puts: { key: string; vec: number[] }[][];
} {
  const saved = new Map<string, number[]>(seed);
  const gets: string[][] = [];
  const puts: { key: string; vec: number[] }[][] = [];
  return {
    gets,
    puts,
    async getMany(keys) {
      gets.push([...keys]);
      return keys.map((key) => saved.get(key) ?? null);
    },
    async putMany(items) {
      puts.push(items.map((item) => ({ key: item.key, vec: [...item.vec] })));
      for (const item of items) saved.set(item.key, item.vec);
    },
  };
}

function readSrc(rel: string): string {
  return readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8');
}

async function proveQueryCache(): Promise<void> {
  const gov = readSrc('../src/rag-cost-governance.ts');
  const main = readSrc('../src/main.ts');
  const observeAt = gov.indexOf("if (cfg.mode === 'observe')");
  const embedObserveAt = gov.indexOf('return embedder.embed(texts)');
  const getManyAt = gov.indexOf('store.getMany(');
  const reserveAt = gov.indexOf('reserveAiTextCost(');
  const putManyAt = gov.indexOf('store.putMany(');
  const settleAt = gov.indexOf('settleAiCost(');
  const rangeAt = gov.indexOf("throw new Error('provider_usage_out_of_reserved_range')");
  check('observe 提前返回仍在存储查询之前', observeAt !== -1 && embedObserveAt !== -1 && getManyAt !== -1 && observeAt < embedObserveAt && embedObserveAt < getManyAt);
  check('getMany 在 reserveAiTextCost 之前', getManyAt !== -1 && reserveAt !== -1 && getManyAt < reserveAt);
  check('只有未命中文本进入嵌入', gov.includes('embedder.embedWithUsage(missTexts)') && gov.includes('embedder.embed(missTexts)'));
  check('putMany 在 settleAiCost 之前', putManyAt !== -1 && settleAt !== -1 && reserveAt < putManyAt && putManyAt < settleAt && rangeAt !== -1 && rangeAt < putManyAt);
  check('缺用量仍只在 undefined 时按段估算并截断', gov.includes('reportedTokens === undefined')
    && gov.includes('cjkWeightedEstimate(text)') && gov.includes('cfg.maxInputTokens')
    && !gov.includes('?? cfg.maxInputTokens') && !gov.includes('inputTokens ??'));
  const storeAssign = main.indexOf('const embeddingStore = inMemoryEmbeddingStore()');
  const trackAt = main.indexOf('trackLocal:');
  const budgetLines = main.split('\n').filter((line) => line.includes('budgetedQbankEmbedding('));
  check('inMemoryEmbeddingStore() 只调用一次', main.split('inMemoryEmbeddingStore()').length - 1 === 1);
  const embedFactory = 'dashscope' + 'Embedder';
  check('生产嵌入工厂仍直接出现在 main.ts', main.split(`${embedFactory}(`).length - 1 === 1);
  check('同一存储绑定交给 cachingEmbedder', main.includes('cachingEmbedder(rawEmbedder, embeddingStore)'));
  check('存储绑定在按 owner 的工厂之外', storeAssign !== -1 && trackAt !== -1 && storeAssign < trackAt);
  check('两处检索仍按 enforce 选 rawEmbedder 并传入同一存储', budgetLines.length === 2
    && budgetLines.every((line) => line.includes("ragCost.mode === 'enforce' ? rawEmbedder : embedder") && line.includes('embeddingStore')));

  const rawId = 'embed-proof';
  const dim = 512;
  const keep = [0, 4];
  const also = [5, 6];
  const ctx = (id: string) => ({ cacheKey: id, invocationId: id, mode: 'claimed' as const });
  const hitStore = recordingStore([
    [vectorKey(rawId, dim, 'keep'), keep],
    [vectorKey(rawId, dim, 'also'), also],
  ]);
  let embedCalls = 0;
  let usageCalls = 0;
  const hitEmbedder: Embedder = {
    dim, id: rawId,
    async embed() { embedCalls += 1; throw new Error('embed called'); },
    async embedWithUsage() { usageCalls += 1; throw new Error('embedWithUsage called'); },
  };
  const hitLedger = openLedger();
  let hitVectors: number[][] | undefined;
  let hitError: unknown;
  try {
    hitVectors = await budgetedQbankEmbedding(hitLedger.pool, 'rag-proof-owner', hitEmbedder, rejectCfg, hitStore)(
      ['also', 'keep', 'also'], ctx('cache-all-hit'),
    );
  } catch (error) { hitError = error; }
  const hitOk = !hitError && sameVectors(hitVectors, [also, keep, also])
    && hitLedger.connects() === 0 && embedCalls === 0 && usageCalls === 0 && hitStore.puts.length === 0
    && hitStore.gets.length === 1 && hitStore.gets[0]!.every((key, i) => key === vectorKey(rawId, dim, ['also', 'keep', 'also'][i]!));
  check('全部按 rawEmbedder.id 命中时保序返回且不连库不外呼', hitOk);
  if (!hitOk) console.log(`  detail connects=${hitLedger.connects()} embed=${embedCalls} usage=${usageCalls} error=${String(hitError)}`);

  const poisoned = [7, 7];
  const wrapperStore = recordingStore([[vectorKey(`${rawId}+cache`, dim, 'keep'), poisoned]]);
  let wrapperEmbed = 0;
  let wrapperUsage = 0;
  const wrapperEmbedder: Embedder = {
    dim, id: rawId,
    async embed() { wrapperEmbed += 1; throw new Error('embed called'); },
    async embedWithUsage() { wrapperUsage += 1; throw new Error('embedWithUsage called'); },
  };
  const wrapperLedger = openLedger('price_missing');
  let wrapperVectors: number[][] | undefined;
  let wrapperError: unknown;
  try {
    wrapperVectors = await budgetedQbankEmbedding(wrapperLedger.pool, 'rag-proof-owner', wrapperEmbedder, rejectCfg, wrapperStore)(
      ['keep'], ctx('cache-wrapper-id'),
    );
  } catch (error) { wrapperError = error; }
  const wrapperCode = wrapperError instanceof RagCostError ? wrapperError.code : '';
  const wrapperOk = !wrapperVectors && wrapperCode === 'rag_cost_price_missing'
    && wrapperLedger.connects() >= 1 && wrapperEmbed === 0 && wrapperUsage === 0 && wrapperStore.puts.length === 0
    && wrapperLedger.settleTokens.length === 0
    && wrapperStore.gets.length === 1 && wrapperStore.gets[0]![0] === vectorKey(rawId, dim, 'keep')
    && !wrapperLedger.sql.some((text) => text.includes('ai_cost_settle') || text.includes('ai_cost_mark_dispatched'));
  check('只按 id+cache 写入时不得当成命中', wrapperOk);
  if (!wrapperOk) console.log(`  detail code=${wrapperCode} connects=${wrapperLedger.connects()} embed=${wrapperEmbed} usage=${wrapperUsage}`);

  const partialSeen: string[][] = [];
  let partialEmbed = 0;
  let partialUsage = 0;
  const partialEmbedder: Embedder = {
    dim, id: rawId,
    async embed(texts) { partialEmbed += 1; partialSeen.push([...texts]); return texts.map(() => [1, 1]); },
    async embedWithUsage(texts) {
      partialUsage += 1;
      partialSeen.push([...texts]);
      return { vectors: texts.map(() => [8, 8]), inputTokens: 9 };
    },
  };
  const partialStore = recordingStore([
    [vectorKey(rawId, dim, 'keep'), keep],
    [vectorKey(rawId, dim, 'also'), also],
  ]);
  const partialLedger = openLedger();
  let partialVectors: number[][] | undefined;
  let partialError: unknown;
  try {
    partialVectors = await budgetedQbankEmbedding(partialLedger.pool, 'rag-proof-owner', partialEmbedder, rejectCfg, partialStore)(
      ['keep', 'miss-me', 'also'], ctx('cache-partial'),
    );
  } catch (error) { partialError = error; }
  const partialPut = partialStore.puts[0] ?? [];
  const partialOk = !partialError && sameVectors(partialVectors, [keep, [8, 8], also])
    && partialEmbed === 0 && partialUsage === 1 && partialSeen.length === 1 && partialSeen[0]!.length === 1 && partialSeen[0]![0] === 'miss-me'
    && partialLedger.settleTokens[0] === 9 && partialPut.length === 1
    && partialPut[0]!.key === vectorKey(rawId, dim, 'miss-me') && !partialPut[0]!.key.includes('miss-me')
    && sameVectors([partialPut[0]!.vec], [[8, 8]]);
  check('未命中只嵌入缺失段并按原下标拼回', partialOk);
  if (!partialOk) console.log(`  detail settle=${String(partialLedger.settleTokens[0])} seen=${JSON.stringify(partialSeen)} error=${String(partialError)}`);

  const omitSeen: string[][] = [];
  const omitEmbedder: Embedder = {
    dim, id: rawId,
    async embed(texts) { omitSeen.push([...texts]); return texts.map(() => [3, 3]); },
    async embedWithUsage(texts) {
      omitSeen.push([...texts]);
      return { vectors: texts.map(() => [3, 3]) };
    },
  };
  const omitStore = recordingStore([[vectorKey(rawId, dim, 'keep'), keep]]);
  const omitLedger = openLedger();
  const omitTexts = ['keep', '中文'];
  let omitError: unknown;
  try {
    await budgetedQbankEmbedding(omitLedger.pool, 'rag-proof-owner', omitEmbedder, rejectCfg, omitStore)(omitTexts, ctx('cache-omit'));
  } catch (error) { omitError = error; }
  const missEstimate = segmentEstimate(['中文'], rejectCfg.maxInputTokens);
  const allEstimate = segmentEstimate(omitTexts, rejectCfg.maxInputTokens);
  const omitOk = !omitError && omitLedger.settleTokens[0] === missEstimate && missEstimate !== allEstimate
    && omitSeen.length === 1 && omitSeen[0]!.length === 1 && omitSeen[0]![0] === '中文';
  check('未命中且用量缺失时只估算这次未命中文本', omitOk);
  if (!omitOk) console.log(`  detail settle=${String(omitLedger.settleTokens[0])} miss=${missEstimate} all=${allEstimate} error=${String(omitError)}`);

  const capCfg: RagCostGovernanceConfig = { ...rejectCfg, maxInputTokens: 3, scopeId: 'rag-proof-cache-cap' };
  const capLedger = openLedger();
  const capEmbedder: Embedder = {
    dim, id: rawId,
    async embed(texts) { return texts.map(() => [2, 2]); },
    async embedWithUsage(texts) { return { vectors: texts.map(() => [2, 2]) }; },
  };
  let capVectors: number[][] | undefined;
  let capError: unknown;
  try {
    capVectors = await budgetedQbankEmbedding(capLedger.pool, 'rag-proof-owner', capEmbedder, capCfg, recordingStore([]))(
      ['中文测试'], ctx('cache-cap'),
    );
  } catch (error) { capError = error; }
  const capped = segmentEstimate(['中文测试'], capCfg.maxInputTokens);
  check('用量缺失时估算仍在范围检查前截到上限', !capError && sameVectors(capVectors, [[2, 2]]) && capLedger.settleTokens[0] === capped && capped === 3);

  const plainSeen: string[][] = [];
  const plainEmbedder: Embedder = {
    dim, id: rawId,
    async embed(texts) { plainSeen.push([...texts]); return texts.map(() => [1, 0]); },
    async embedWithUsage(texts) { plainSeen.push([...texts]); return { vectors: texts.map(() => [1, 0]) }; },
  };
  const plainLedger = openLedger();
  const plainTexts = ['中文', 'a'];
  let plainError: unknown;
  try {
    await budgetedQbankEmbedding(plainLedger.pool, 'rag-proof-owner', plainEmbedder, rejectCfg)(plainTexts, ctx('cache-no-store'));
  } catch (error) { plainError = error; }
  check('不传存储时仍预留并按全部文本估算', !plainError && plainLedger.connects() > 0
    && plainSeen.length === 1 && plainSeen[0]!.length === 2
    && plainLedger.settleTokens[0] === segmentEstimate(plainTexts, rejectCfg.maxInputTokens));

  const zeroLedger = openLedger();
  const zeroEmbedder: Embedder = {
    dim, id: rawId,
    async embed(texts) { return texts.map(() => [1, 0]); },
    async embedWithUsage(texts) { return { vectors: texts.map(() => [1, 0]), inputTokens: 0 }; },
  };
  let zeroError: unknown;
  try {
    await budgetedQbankEmbedding(zeroLedger.pool, 'rag-proof-owner', zeroEmbedder, rejectCfg)(['中文测试'], ctx('cache-zero'));
  } catch (error) { zeroError = error; }
  check('带回的 0 不改成文本估算', !zeroError && zeroLedger.settleTokens[0] === 0);

  const mismatchSeen: string[][] = [];
  const mismatchEmbedder: Embedder = {
    dim, id: rawId,
    async embed(texts) { return texts.map(() => [1, 1]); },
    async embedWithUsage(texts) {
      mismatchSeen.push([...texts]);
      return { vectors: [[1, 1], [2, 2]], inputTokens: 4 };
    },
  };
  const mismatchStore = recordingStore([[vectorKey(rawId, dim, 'keep'), keep]]);
  const mismatchLedger = openLedger();
  let mismatchError: unknown;
  try {
    await budgetedQbankEmbedding(mismatchLedger.pool, 'rag-proof-owner', mismatchEmbedder, rejectCfg, mismatchStore)(
      ['keep', 'miss-me'], ctx('cache-mismatch'),
    );
  } catch (error) { mismatchError = error; }
  const mismatchCode = mismatchError instanceof RagCostError ? mismatchError.code : '';
  check('向量个数与未命中条数不一致时不回填不结算', mismatchCode === 'external_outcome_unknown'
    && mismatchStore.puts.length === 0 && mismatchLedger.settleTokens.length === 0
    && mismatchSeen.length === 1 && mismatchSeen[0]!.length === 1 && mismatchSeen[0]![0] === 'miss-me');

  const embedOnlySeen: string[][] = [];
  const embedOnly: Embedder = {
    dim, id: rawId,
    async embed(texts) { embedOnlySeen.push([...texts]); return texts.map(() => [4, 4]); },
  };
  const embedOnlyStore = recordingStore([[vectorKey(rawId, dim, 'keep'), keep]]);
  const embedOnlyLedger = openLedger();
  let embedOnlyVectors: number[][] | undefined;
  let embedOnlyError: unknown;
  try {
    embedOnlyVectors = await budgetedQbankEmbedding(embedOnlyLedger.pool, 'rag-proof-owner', embedOnly, rejectCfg, embedOnlyStore)(
      ['keep', '中文'], ctx('cache-embed-only'),
    );
  } catch (error) { embedOnlyError = error; }
  check('没有 embedWithUsage 时只把未命中交给 embed', !embedOnlyError && sameVectors(embedOnlyVectors, [keep, [4, 4]])
    && embedOnlySeen.length === 1 && embedOnlySeen[0]!.length === 1 && embedOnlySeen[0]![0] === '中文'
    && embedOnlyLedger.settleTokens[0] === segmentEstimate(['中文'], rejectCfg.maxInputTokens));

  let observeGets = 0;
  let observeEmbeds = 0;
  let observeConnects = 0;
  const observeStore: EmbeddingStore = {
    async getMany(keys) { observeGets += 1; return keys.map(() => [1, 1]); },
    async putMany() { throw new Error('observe put'); },
  };
  const observeEmbedder: Embedder = {
    dim, id: rawId,
    async embed(texts) { observeEmbeds += 1; return texts.map(() => [9, 9]); },
  };
  const observePool = { async connect() { observeConnects += 1; throw new Error('observe connected'); } } as unknown as DbPool;
  let observeVectors: number[][] | undefined;
  let observeError: unknown;
  try {
    observeVectors = await budgetedQbankEmbedding(observePool, 'rag-proof-owner', observeEmbedder, { mode: 'observe', maxInputTokens: 1000 }, observeStore)(
      ['keep'], ctx('cache-observe'),
    );
  } catch (error) { observeError = error; }
  check('observe 仍直接 embed 且不读存储', !observeError && sameVectors(observeVectors, [[9, 9]])
    && observeEmbeds === 1 && observeGets === 0 && observeConnects === 0);
}

rejectReported('空值拒绝且不按文本估算入账', null)
  .then(() => rejectReported('小数拒绝且不按文本估算入账', 1.5))
  .then(() => rejectReported('负数拒绝且不按文本估算入账', -1))
  .then(() => rejectReported('超过上限的实量拒绝且不截断入账', 1001))
  .then(() => proveQueryCache())
  .then(() => {
    console.log(`\n${failures === 0 ? '✓ RAG 费用治理启动门全部通过' : `✗ ${failures} 项失败`}`);
    process.exit(failures === 0 ? 0 : 1);
  })
  .catch((error) => { console.error(error); process.exit(1); });
