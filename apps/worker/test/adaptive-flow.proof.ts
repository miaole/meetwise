/** 真 deps 接线证明:规划官/面试官/评估官/报告官 各自经 invoke 关口 + CRAG + threadId,驱动自适应图端到端。
 *  脚本模型(CI 确定);真 deps 工厂(非 fake)。 pnpm adaptive-flow:prove (需 db:up) */
import { fileURLToPath } from 'node:url';
import { MemorySaver, Command } from '@langchain/langgraph';
import { createPool, asPrincipal, loadMigrations, runMigrations } from '@meetwise/db';
import { scriptedModelClient, type ModelClient } from '@meetwise/ai-runtime';
import { buildAdaptiveInterviewGraph, createEphemeralAnswerVault } from '@meetwise/ai-graphs';
import { buildAdaptiveDeps, planCompetencies } from '../src/adaptive-interview-service.ts';

const pool = createPool();
let fail = 0; const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };
const OWNER = 'adaptA', TID = 'adapt-' + Date.now();
let calls = 0;
let askSeq = 0;
const base = scriptedModelClient({
  'planner.competencies': () => ({ ok: true, raw: { competencies: ['并发', '缓存'] } }),
  // Critique duplicate now fail-closes (no invented replacement stem). A
  // multi-turn scripted interviewer must emit distinct questions.
  'interviewer.ask': () => ({
    ok: true,
    raw: { q: `结合你的限流经历谈谈高并发下如何兼顾吞吐与一致性，并说明第 ${++askSeq} 轮验证方法`, refs: [] },
  }),
  'mock-interview.evaluate': () => ({ ok: true, raw: { score: 88, evidence: [{ criterion: '讲清了滑动窗口', quote: '滑动窗口' }] } }),
});
const model: ModelClient = { complete: (r, a) => { calls++; return base.complete(r, a); } };

async function main() {
  await runMigrations(pool, loadMigrations(fileURLToPath(new URL('../../../packages/db/migrations', import.meta.url))));

  // 每个 invoke 都带 privacyInterviewId=TID；预派发隐私围栏要求该 interview 真实存在且 owner 匹配。
  // 若缺此行会走隐私围栏拒绝分支(privacy_fenced_pre_dispatch)，模型从未被调用、4 角色 trace=0，与本 proof 要证明的
  // 「角色拆分+invoke 关口+CRAG+threadId」无关(adaptive-degrade 同样 seed 了 owner-scoped parent)。
  await asPrincipal(pool, OWNER, async (c) => {
    await c.query("INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'active')", [TID, OWNER]);
  });

  const comps = await planCompetencies(pool, OWNER, TID, model, '后端工程师', ['限流改造', 'Redis 计数器']);
  A('① 规划官经 invoke 产出目标能力规格(≥2,top1-2 标 core,附行为槽)', comps.length >= 2 && comps.some((c) => c.name === '并发') && comps.some((c) => c.behavioral));

  const answerVault = createEphemeralAnswerVault();
  const deps = buildAdaptiveDeps({
    pool, owner: OWNER, threadId: TID, model, competencies: comps,
    localRetrieve: async () => [{ ref: 'qbank:a', score: 0.9 }],   // 本地够好(CRAG use_local,不探 web)
    webExplore: async () => [],
    loadAnswer: answerVault.loadAnswer,
  });
  const g = buildAdaptiveInterviewGraph(new MemorySaver(), deps);
  const cfg = { configurable: { thread_id: TID } };
  let res: any = await g.invoke({}, cfg); let guard = 0;
  while (res.__interrupt__ && guard++ < 20) res = await g.invoke(new Command({ resume: answerVault.issue('我用 Redis 计数器+滑动窗口扛住高并发,超阈值降级') }), cfg);

  A('② 面试官 CRAG 出题 + ③ 评估官打分:图跑完每题有转写', res.transcript.length >= 2 && res.transcript.every((t: any) => t.score === 88));
  A('④ 收尾标记 concluded(报告走舱壁,不在图内出)', res.concluded === true);
  const tr = await asPrincipal(pool, OWNER, (c) => c.query('SELECT count(*)::int n FROM ai_invocation_trace WHERE owner_user_id=$1 AND idempotency_key LIKE $2', [OWNER, TID + '%']));
  A('全部 4 角色调用经 invoke 关口留 trace 且键带 threadId(Langfuse 一棵树)', tr.rows[0].n >= 4);
  A('真模型调用确实发生(非空跑)', calls >= 4);

  console.log(`\n${fail === 0 ? '✓ 真 deps 接线(角色拆分+invoke关口+CRAG+threadId)驱动自适应图端到端通过' : '✗ ' + fail + ' 失败'}`);
  await pool.end(); process.exit(fail ? 1 : 0);
}
main().catch((e) => { console.error('✗', e?.message ?? e); process.exit(1); });
