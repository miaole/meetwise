/** 全链路证明:种子灌库 → 真 annSearch 检索(共享读)→ 自适应 deps 真检索 → 接地出题端到端。 pnpm qbank-pipeline:prove (db:up) */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { MemorySaver, Command } from '@langchain/langgraph';
import { createPool, asPrincipal, annSearch } from '@meetwise/db';
import { fakeEmbedder, scriptedModelClient, type ModelClient } from '@meetwise/ai-runtime';
import { buildAdaptiveInterviewGraph } from '@meetwise/ai-graphs';
import { ingestQbank } from '../src/qbank-ingest.ts';
import { QBANK_SEED } from '../src/qbank-seed.ts';
import { buildAdaptiveDeps } from '../src/adaptive-interview-service.ts';

const pool = createPool();
let fail = 0; const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };
const sql = (f: string) => readFileSync(fileURLToPath(new URL(`../../../packages/db/sql/${f}.sql`, import.meta.url)), 'utf8');
const emb = fakeEmbedder(512);
const TID = 'pipe-' + Date.now(), OWNER = 'pipeUser';
const model: ModelClient = scriptedModelClient({
  'interviewer.ask': () => ({ ok: true, raw: { q: '结合检索素材改写:谈谈你做过的限流与降级', refs: ['seed:limit-1'] } }),
  'mock-interview.evaluate': () => ({ ok: true, raw: { score: 88, evidence: ['滑动窗口'] } }),
});

async function main() {
  for (const f of ['01_schema', '06_retrieval']) await pool.query(sql(f));
  const n = await ingestQbank(pool, QBANK_SEED, emb);
  A('① 起步题库灌入(自撰通用题,无版权)', n === QBANK_SEED.length && n >= 12);

  // ② 真 localRetrieve:任意用户 embed 查询 → annSearch 共享题库 → 命中种子
  const localRetrieveFor = (owner: string) => async (q: string) => {
    const [v] = await emb.embed([q]);
    const hits = await asPrincipal(pool, owner, (c) => annSearch(c, owner, 'qbank', v, 5));
    return hits.map((h) => ({ ref: h.refId, score: Math.max(0, 1 - h.distance) }));
  };
  const hits = await localRetrieveFor(OWNER)('限流 降级');
  A('② 真 annSearch 检索共享题库命中种子(CRAG 有真数据,非降级)', hits.length >= 1 && hits.some((h) => h.ref.startsWith('seed:')));

  // ③ 自适应图 + 真检索 deps + 脚本模型 → 端到端跑通
  const deps = buildAdaptiveDeps({ pool, owner: OWNER, threadId: TID, model, competencies: ['并发'], localRetrieve: localRetrieveFor(OWNER), webExplore: async () => [] });
  const g = buildAdaptiveInterviewGraph(new MemorySaver(), deps);
  const cfg = { configurable: { thread_id: TID } };
  let res: any = await g.invoke({}, cfg); let guard = 0;
  while (res.__interrupt__ && guard++ < 6) res = await g.invoke(new Command({ resume: '我用滑动窗口+令牌桶' }), cfg);
  A('③ 全链路端到端:种子题库→真检索→接地出题→自适应跑通', res.concluded === true && res.transcript.length >= 1);
  A('④ 出题带检索来源(provenance,真接地非凭空)', res.transcript[0].sources.length >= 1);

  console.log(`\n${fail === 0 ? '✓ 全链路(种子题库→真annSearch检索→接地出题→自适应面试)全部通过' : '✗ ' + fail + ' 失败'}`);
  await pool.end(); process.exit(fail ? 1 : 0);
}
main().catch((e) => { console.error('✗', e?.stack ?? e); process.exit(1); });
