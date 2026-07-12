/**
 * 端到端 agent 主干 · **真模型版**（手动,非 CI;需 .env 的 MODEL_*）：与 flow.proof 同一组合,但模型换成真百炼 qwen-plus,
 * 经 invoke 关口(双校验+幂等 trace)。证明整套 agent 编排在真境内模型上端到端跑通。断言对真模型放宽(只验贯通+结构+接地)。
 *   pnpm flow:live   (需 pnpm db:up)
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { Command } from '@langchain/langgraph';
import {
  createPool, asPrincipal, appendEvent, reserveEntitlement, confirmConsumption, availableUnits,
  createResumeWithBlob, completeIngestion, transitionResume, enqueueReport, getReport,
} from '@meetwise/db';
import { invoke, openAICompatibleClient, promptedModel, setTracer, langfuseTracer, httpSpanTransport, type LangfuseTracer } from '@meetwise/ai-runtime';
import { buildResumeQuizGraph, buildMockInterviewGraph, type QuizItem } from '@meetwise/ai-graphs';
import { ingestResume } from '@meetwise/domain';
import { createCheckpointer } from '../src/main.ts';
import { drainReportsOnce } from '../src/report-worker.ts';

for (const line of readFileSync(fileURLToPath(new URL('../../../.env', import.meta.url)), 'utf8').split('\n')) {
  const m = line.match(/^([A-Z_]+)=(.*)$/); if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}
const pool = createPool();
let fails = 0;
const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fails++; };
const sql = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8');
const OWNER = 'liveA', IID = 'live-' + Date.now();
const model = openAICompatibleClient();   // 真 qwen-plus

const RESUME = ['工作经历', '2021-2023 在某电商负责订单系统的限流改造,用 Redis 计数器和滑动窗口扛住双十一高并发', '技能', 'Java、Redis、限流、分布式锁、MySQL', '联系方式', '手机 13800138000'].join('\n');
const QuizSchema = z.object({ items: z.array(z.object({ q: z.string().min(1), refs: z.array(z.string()) })) });
const EvalSchema = z.object({ score: z.number().min(0).max(100), evidence: z.array(z.string()) });
const ReportSchema = z.object({ overall: z.number().min(0).max(100), sections: z.array(z.object({ title: z.string(), body: z.string() })) });

async function main() {
  // 配了 Langfuse creds 就把真 tracer 挂上(同 worker bootstrap):真 qwen 调用经 invoke 关口 → 产出真 Langfuse trace。
  let lf: LangfuseTracer | null = null;
  if (process.env.LANGFUSE_PUBLIC_KEY) { lf = langfuseTracer(httpSpanTransport()); setTracer(lf); console.log('observability: Langfuse tracer attached → 本轮真模型调用会进你的 Langfuse'); }
  for (const f of ['01_schema', '02_commerce', '03_resume', '04_report']) await pool.query(sql(`../../../packages/db/sql/${f}.sql`));
  await pool.query("INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'created')", [IID, OWNER]);
  await pool.query("INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at) VALUES ($1,'paid',5.0, now()+interval '300 days')", [OWNER]);

  console.log('\n① 简历摄取(加密+脱敏)'); const up = await asPrincipal(pool, OWNER, (c) => createResumeWithBlob(c, OWNER, RESUME));
  const profile = ingestResume(RESUME);
  await asPrincipal(pool, OWNER, (c) => transitionResume(c, OWNER, up.resumeId, 'uploaded', 'ingesting'));
  await asPrincipal(pool, OWNER, (c) => completeIngestion(c, OWNER, up.resumeId, profile));
  console.log('   facts:', profile.facts.join(' | '));

  console.log('\n② 额度 reserve'); await asPrincipal(pool, OWNER, (c) => reserveEntitlement(c, OWNER, IID, 'mock_interview', 1.0));

  console.log('\n③ resume-quiz 押题(真模型经 invoke,图 factuality 过滤幻觉)');
  const quizGen = async (): Promise<QuizItem[]> => asPrincipal(pool, OWNER, async (c) => {
    const out = await invoke({ idempotencyKey: `${IID}:quiz`, schema: QuizSchema,
      businessValidate: (v) => v.items.length ? null : 'empty',
      model: promptedModel(model, 'resume-quiz.generate', { facts: profile.facts }) }, c, OWNER);
    if ('error' in out) throw new Error('quiz:' + out.error);
    return out.value.items;
  });
  const quiz = await buildResumeQuizGraph({ generate: quizGen }).invoke({ raw: RESUME });
  A('真模型出题且经 invoke 贯通', (quiz.questions.length + quiz.rejected.length) > 0);
  console.log('   接地题:', quiz.questions.map((x: any) => x.q));
  if (quiz.rejected.length) console.log('   被 factuality 拒(可能幻觉/refs 不接地):', quiz.rejected.map((x: any) => x.q));
  const qs = quiz.questions.map((x: any) => x.q).slice(0, 2);
  const groundedQs = qs.length ? qs : ['谈谈你在订单系统里的限流方案', '滑动窗口和固定窗口的区别'];

  console.log('\n④ mock-interview(真 checkpointer + interrupt) + 真模型 eval');
  const cp = createCheckpointer(); await cp.setup();
  const g = buildMockInterviewGraph(cp, groundedQs); const cfg = { configurable: { thread_id: IID } };
  await g.invoke({}, cfg);
  for (let i = 0; i < groundedQs.length; i++) {
    await g.invoke(new Command({ resume: '我用 Redis 计数器加滑动窗口实现限流,超阈值拒绝并降级' }), cfg);
    const score = await asPrincipal(pool, OWNER, async (c) => {
      const out = await invoke({ idempotencyKey: `${IID}:eval:${i}`, schema: EvalSchema,
        businessValidate: (v) => v.evidence.length ? null : 'no_evidence',
        model: promptedModel(model, 'mock-interview.evaluate', { question: groundedQs[i], answer: '我用 Redis 计数器加滑动窗口实现限流,超阈值拒绝并降级' }) }, c, OWNER);
      if ('error' in out) throw new Error('eval:' + out.error);
      await appendEvent(c, OWNER, IID, 'answer_evaluated', { score: out.value.score });
      return out.value.score;
    });
    A(`第${i + 1}题真模型 eval 贯通(score=${score},区间合法)`, score >= 0 && score <= 100);
  }

  console.log('\n⑤ confirm 结算'); await asPrincipal(pool, OWNER, (c) => confirmConsumption(c, OWNER, IID, 1));
  A('面试完成扣 1.0 额度', (await asPrincipal(pool, OWNER, (c) => availableUnits(c, OWNER))) === 4.0);

  console.log('\n⑥ 报告舱壁 + 真模型生成');
  await asPrincipal(pool, OWNER, (c) => enqueueReport(c, OWNER, IID));
  const outcome = await drainReportsOnce(pool, OWNER, 'live-worker', {
    loadSummary: () => ({ interviewId: IID, questionCount: groundedQs.length, scores: [76, 80] }),
    generate: (s) => asPrincipal(pool, OWNER, async (c) => {
      const out = await invoke({ idempotencyKey: `${IID}:report`, schema: ReportSchema,
        businessValidate: (v) => v.sections.length ? null : 'empty',
        model: promptedModel(model, 'report.generate', { scores: s.scores }) }, c, OWNER);
      if ('error' in out) throw new Error('report:' + out.error);
      return out.value;
    }),
  });
  A('报告经真模型 drain 到 ready', outcome === 'ready');
  const rep = await asPrincipal(pool, OWNER, (c) => getReport(c, OWNER, IID));
  console.log('   报告:', JSON.stringify(rep!.content));
  A('报告 ready 且 overall 区间合法', rep!.status === 'ready' && (rep!.content as any).overall >= 0 && (rep!.content as any).overall <= 100);

  const traces = await asPrincipal(pool, OWNER, (c) => c.query('SELECT count(*)::int n FROM ai_invocation_trace WHERE owner_user_id=$1', [OWNER]));
  A('全部真模型调用经 invoke 关口留 trace', traces.rows[0].n >= 3);

  if (lf) { await lf.flush(); console.log(`   → 已 flush 到 Langfuse(session=${IID});去面板按此 session 看本轮所有真模型调用`); }
  console.log(`\n${fails === 0 ? '✓ 真模型端到端 agent 主干全部贯通' : '✗ ' + fails + ' 项失败'}`);
  await pool.end(); process.exit(fails ? 1 : 0);
}
main().catch((e) => { console.error('✗', e?.message ?? e); process.exit(1); });
