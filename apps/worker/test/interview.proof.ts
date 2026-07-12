/**
 * 面试进程接线证明（对真 Postgres）：**真请求经队列驱动 agent**——api 入队(start/answer) → worker 消费循环 → 生命周期跑图/模型。
 *   enqueue start → dispatchTick(消费) → 押题落库+首问 → 逐轮 enqueue answer → dispatchTick → eval+续图 → 末轮完成+入队报告 → 报告 drain。
 * 测的全是生产件(interview-jobs/interview-consumer/interview-lifecycle);模型注脚本(CI)。
 *   pnpm interview:prove   (需 pnpm db:up)
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  createPool, asPrincipal, reserveEntitlement, availableUnits,
  createResumeWithBlob, completeIngestion, transitionResume, enqueueInterviewJob, getReport,
} from '@meetwise/db';
import { scriptedModelClient, type ModelClient } from '@meetwise/ai-runtime';
import { ingestResume } from '@meetwise/domain';
import { createCheckpointer } from '../src/main.ts';
import { interviewDispatchTick, type ConsumerDeps } from '../src/interview-consumer.ts';
import { drainReportsOnce } from '../src/report-worker.ts';
import { reportGenerator } from '../src/interview-service.ts';

const pool = createPool();
let failures = 0;
const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) failures++; };
const section = (t: string) => console.log(`\n──────── ${t} ────────`);
const sql = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8');
const OWNER = 'apiUser', IID = 'iv-' + Date.now();
const RESUME = ['工作经历', '负责订单系统限流改造,用 Redis 计数器扛高并发', '技能', 'Redis、限流、分布式锁'].join('\n');

const baseModel = scriptedModelClient({
  'resume-quiz.generate': () => ({ ok: true, raw: { items: [{ q: '限流怎么做?', refs: ['限流'] }, { q: 'Redis 原子性?', refs: ['Redis'] }, { q: '3 年 Go?', refs: ['Go'] }] } }),
  'mock-interview.evaluate': () => ({ ok: true, raw: { score: 80, evidence: ['Redis'] } }),
  'report.generate': () => ({ ok: true, raw: { overall: 80, sections: [{ title: '总评', body: '扎实' }] } }),
});
const model: ModelClient = baseModel;

async function main() {
  for (const f of ['01_schema', '02_commerce', '03_resume', '04_report','14_notification', '05_interview_jobs']) await pool.query(sql(`../../../packages/db/sql/${f}.sql`));
  await pool.query(`INSERT INTO interview(id,owner_user_id,status) VALUES ('${IID}','${OWNER}','created')`);
  await pool.query(`INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at) VALUES ('${OWNER}','paid',5.0, now()+interval '300 days')`);
  const cp = createCheckpointer(); await cp.setup();
  const deps: ConsumerDeps = { pool, cp, model, leaseOwner: 'worker-1' };

  // api POST /interview 等价:摄取 + 扣额度 + 入队 start
  const resumeId = await asPrincipal(pool, OWNER, async (c) => {
    const up = await createResumeWithBlob(c, OWNER, RESUME);
    await transitionResume(c, OWNER, up.resumeId, 'uploaded', 'ingesting');
    await completeIngestion(c, OWNER, up.resumeId, ingestResume(RESUME));
    return up.resumeId;
  });
  const before = await asPrincipal(pool, OWNER, (c) => availableUnits(c, OWNER));
  await asPrincipal(pool, OWNER, (c) => reserveEntitlement(c, OWNER, IID, 'mock_interview', 1.0));
  await asPrincipal(pool, OWNER, (c) => enqueueInterviewJob(c, OWNER, IID, 'start', { resumeId }));

  section('① worker 消费 start job → 押题落库 + 首问(api 不跑图,worker 跑)');
  const tick1 = await interviewDispatchTick(deps);
  A('dispatchTick 消费到 owner', tick1.owners >= 1);
  const ivRow = await asPrincipal(pool, OWNER, (c) => c.query('SELECT status, jsonb_array_length(questions) n FROM interview WHERE id=$1', [IID]));
  A('面试 active 且题目落库(过滤幻觉 Go 后 2 题)', ivRow.rows[0].status === 'active' && ivRow.rows[0].n === 2);
  const questions: string[] = (await asPrincipal(pool, OWNER, (c) => c.query('SELECT questions q FROM interview WHERE id=$1', [IID]))).rows[0].q;

  section('② 逐轮 enqueue answer → 消费 → eval+续图(保序)');
  for (let i = 0; i < questions.length; i++) {
    await asPrincipal(pool, OWNER, (c) => enqueueInterviewJob(c, OWNER, IID, 'answer', { turn: i, answer: `答案${i + 1}:Redis 计数器` }, i + 1));
    await interviewDispatchTick(deps);
    const evc = await asPrincipal(pool, OWNER, (c) => c.query("SELECT count(*)::int n FROM interview_event WHERE stream_key=$1 AND kind='answer_evaluated'", [IID]));
    A(`第${i + 1}轮 answer 消费后 answer_evaluated 累计 ${i + 1} 条`, evc.rows[0].n === i + 1);
  }

  section('③ 末轮完成:interview=completed + 额度结算 + 报告入队');
  const fin = await asPrincipal(pool, OWNER, (c) => c.query('SELECT status FROM interview WHERE id=$1', [IID]));
  A('面试 completed', fin.rows[0].status === 'completed');
  A('额度已结算(扣 1.0)', (await asPrincipal(pool, OWNER, (c) => availableUnits(c, OWNER))) === before - 1.0);
  A('报告已入队(submitAnswer 末轮 enqueue)', (await asPrincipal(pool, OWNER, (c) => getReport(c, OWNER, IID)))!.status === 'queued');

  section('④ 报告舱壁 drain → ready(全程经队列+消费循环,真请求驱动)');
  const out = await drainReportsOnce(pool, OWNER, 'rpt-1', { loadSummary: () => ({ interviewId: IID, questionCount: 2, scores: [80, 80] }), generate: reportGenerator(pool, OWNER, `${IID}:report`, model) });
  A('报告 ready', out === 'ready' && (await asPrincipal(pool, OWNER, (c) => getReport(c, OWNER, IID)))!.status === 'ready');

  section('⑤ 队列 job 全 done + 关口 trace + RLS');
  A('所有 interview_job 已 done(无卡 running/queued)', (await asPrincipal(pool, OWNER, (c) => c.query("SELECT count(*)::int n FROM interview_job WHERE owner_user_id=$1 AND status!='done'", [OWNER]))).rows[0].n === 0);
  A('模型调用经 invoke 关口留 trace(quiz+2eval+report=4)', (await asPrincipal(pool, OWNER, (c) => c.query('SELECT count(*)::int n FROM ai_invocation_trace WHERE owner_user_id=$1', [OWNER]))).rows[0].n === 4);
  A('userB 看不到 apiUser 的 job(RLS)', (await asPrincipal(pool, 'userB', (c) => c.query(`SELECT count(*)::int n FROM interview_job WHERE owner_user_id='${OWNER}'`))).rows[0].n === 0);

  console.log(`\n${failures === 0 ? '✓ 面试进程接线(api 入队→worker 消费→生命周期)全部通过' : '✗ ' + failures + ' 项失败'}`);
  await pool.end();
  process.exit(failures === 0 ? 0 : 1);
}
main().catch((e) => { console.error(e); process.exit(1); });
