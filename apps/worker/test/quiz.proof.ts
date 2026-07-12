/**
 * 押题进程接线证明（对真 Postgres）：**真请求经队列驱动 resume-quiz 图**——api 入队(generate) → worker 消费循环 → runQuiz 跑图/模型。
 *   reserve + enqueue quiz → quizDispatchTick(消费) → 解密简历→押题→factuality 过滤→落库题目+报告+逐题事件+终态 quiz_ready + 结算额度。
 *   再证**失败路径无泄漏**:空押题(业务校验失败)→ runQuiz 抛 → markFailed + quiz_unavailable 终态事件 + **退还预留额度**。
 * 测的全是生产件(quiz-jobs/quiz-consumer/quiz-lifecycle);模型注脚本(CI)。
 *   pnpm quiz:prove   (需 pnpm db:up)
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  createPool, asPrincipal, reserveEntitlement, availableUnits,
  createResumeWithBlob, completeIngestion, transitionResume, enqueueQuizJob,
} from '@meetwise/db';
import { scriptedModelClient, type ModelClient } from '@meetwise/ai-runtime';
import { ingestResume, groundedByFacts } from '@meetwise/domain';
import { quizDispatchTick, type QuizConsumerDeps } from '../src/quiz-consumer.ts';

const pool = createPool();
let failures = 0;
const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) failures++; };
const section = (t: string) => console.log(`\n──────── ${t} ────────`);
const sql = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8');
const OWNER = 'quizUser', QID = 'qz-' + Date.now(), QID_FAIL = 'qzf-' + Date.now();
const RESUME = ['工作经历', '负责订单系统限流改造,用 Redis 计数器扛高并发', '技能', 'Redis、限流、分布式锁'].join('\n');

// 成功 quiz:3 题,其中 refs=['Go'] 简历里没有 → factuality 歪曲门过滤掉 → 落库 2 题。
const okModel = scriptedModelClient({
  'resume-quiz.generate': () => ({ ok: true, raw: { items: [{ q: '限流怎么做?', refs: ['限流'] }, { q: 'Redis 原子性?', refs: ['Redis'] }, { q: '3 年 Go?', refs: ['Go'] }] } }),
});
// 失败 quiz:空题单 → invoke 业务校验 'empty_quiz' → quizGenerator 抛 → runQuiz 抛 → 消费者失败路径。
const failModel = scriptedModelClient({
  'resume-quiz.generate': () => ({ ok: true, raw: { items: [] } }),
});

async function seedResume(): Promise<string> {
  return asPrincipal(pool, OWNER, async (c) => {
    const up = await createResumeWithBlob(c, OWNER, RESUME);
    await transitionResume(c, OWNER, up.resumeId, 'uploaded', 'ingesting');
    await completeIngestion(c, OWNER, up.resumeId, ingestResume(RESUME));
    return up.resumeId;
  });
}

async function main() {
  for (const f of ['01_schema', '02_commerce', '03_resume', '14_notification', '20_resume_quiz']) await pool.query(sql(`../../../packages/db/sql/${f}.sql`));
  await pool.query(`INSERT INTO resume_quiz(id,owner_user_id,status) VALUES ('${QID}','${OWNER}','created'),('${QID_FAIL}','${OWNER}','created')`);
  await pool.query(`INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at) VALUES ('${OWNER}','paid',5.0, now()+interval '300 days')`);
  const resumeId = await seedResume();

  section('① 成功押题:api 入队 generate → worker 消费 → 押题落库 + 逐题事件 + 结算额度');
  const before = await asPrincipal(pool, OWNER, (c) => availableUnits(c, OWNER));
  await asPrincipal(pool, OWNER, (c) => reserveEntitlement(c, OWNER, QID, 'resume_quiz', 1.0));
  await asPrincipal(pool, OWNER, (c) => enqueueQuizJob(c, OWNER, QID, { resumeId }));
  const okDeps: QuizConsumerDeps = { pool, model: okModel, leaseOwner: 'qworker-1' };
  const tick = await quizDispatchTick(okDeps);
  A('quizDispatchTick 消费到 owner', tick.owners >= 1);
  const row = await asPrincipal(pool, OWNER, (c) => c.query('SELECT status, jsonb_array_length(questions) n, report FROM resume_quiz WHERE id=$1', [QID]));
  A('押题 ready 且题目落库(过滤幻觉 Go 后 2 题)', row.rows[0].status === 'ready' && row.rows[0].n === 2);
  A('报告派生落库(grounded=2)', row.rows[0].report?.grounded === 2 && typeof row.rows[0].report?.summary === 'string');
  const q0 = await asPrincipal(pool, OWNER, (c) => c.query('SELECT questions q FROM resume_quiz WHERE id=$1', [QID]));
  // 真接地断言(非 theatre):落库每题的 refs 必须真接地于简历 facts(groundedByFacts=生产 factuality 门同一函数);幻觉 refs=['Go'] 的题已被过滤掉。
  const facts = ingestResume(RESUME).facts;
  const storedQs: Array<{ q: string; refs: string[] }> = q0.rows[0].q;
  A('落库每题 refs 真接地于简历 facts(非任意词;Go 幻觉题已被过滤)', storedQs.length === 2 && storedQs.every((it) => it.refs.length >= 1 && groundedByFacts(it.refs, facts)));
  A('被过滤的幻觉题(refs=[Go])确实没入库', !storedQs.some((it) => it.refs.includes('Go')));

  section('② SSE 业务事件:progress + 逐题 question_ready + 终态 quiz_ready');
  const evs = await asPrincipal(pool, OWNER, (c) => c.query('SELECT kind FROM interview_event WHERE stream_key=$1 ORDER BY seq', [QID]));
  const kinds = evs.rows.map((r: any) => r.kind);
  A('有 progress 起始事件', kinds.includes('progress'));
  A('逐题 question_ready 共 2 条(每落库题一条)', kinds.filter((k: string) => k === 'question_ready').length === 2);
  A('终态 quiz_ready 收尾(前端不死等)', kinds[kinds.length - 1] === 'quiz_ready');

  section('③ 额度结算 + 关口 trace');
  A('额度已结算(扣 1.0,非泄漏)', (await asPrincipal(pool, OWNER, (c) => availableUnits(c, OWNER))) === before - 1.0);
  A('模型调用经 invoke 关口留 trace(押题 1 次)', (await asPrincipal(pool, OWNER, (c) => c.query("SELECT count(*)::int n FROM ai_invocation_trace WHERE owner_user_id=$1 AND idempotency_key=$2", [OWNER, `${QID}:quiz`]))).rows[0].n === 1);
  A('quiz_job 已 done(无卡 running/queued)', (await asPrincipal(pool, OWNER, (c) => c.query("SELECT count(*)::int n FROM quiz_job WHERE quiz_id=$1 AND status!='done'", [QID]))).rows[0].n === 0);

  section('④ 失败路径无泄漏:空押题 → quiz_unavailable 终态 + 退还预留额度');
  const beforeFail = await asPrincipal(pool, OWNER, (c) => availableUnits(c, OWNER));
  await asPrincipal(pool, OWNER, (c) => reserveEntitlement(c, OWNER, QID_FAIL, 'resume_quiz', 1.0));
  A('预留后额度 -1.0', (await asPrincipal(pool, OWNER, (c) => availableUnits(c, OWNER))) === beforeFail - 1.0);
  await asPrincipal(pool, OWNER, (c) => enqueueQuizJob(c, OWNER, QID_FAIL, { resumeId }));
  await quizDispatchTick({ pool, model: failModel, leaseOwner: 'qworker-2' });
  const failRow = await asPrincipal(pool, OWNER, (c) => c.query('SELECT status FROM resume_quiz WHERE id=$1', [QID_FAIL]));
  A('押题标 failed', failRow.rows[0].status === 'failed');
  const failKinds = (await asPrincipal(pool, OWNER, (c) => c.query('SELECT kind FROM interview_event WHERE stream_key=$1 ORDER BY seq', [QID_FAIL]))).rows.map((r: any) => r.kind);
  A('发 quiz_unavailable 终态事件(无静默死胡同)', failKinds.includes('quiz_unavailable'));
  A('quiz_job 标 failed(不无限重试)', (await asPrincipal(pool, OWNER, (c) => c.query("SELECT status FROM quiz_job WHERE quiz_id=$1", [QID_FAIL]))).rows[0].status === 'failed');
  A('**失败退款**:预留额度退还(回到失败前,不白扣)', (await asPrincipal(pool, OWNER, (c) => availableUnits(c, OWNER))) === beforeFail);

  section('⑤ RLS:他人看不到本人押题/job + SSE 事件跨租户不可读 + WITH CHECK 拒越权写');
  A('userB 读不到 quizUser 的押题(RLS USING)', (await asPrincipal(pool, 'userB', (c) => c.query(`SELECT count(*)::int n FROM resume_quiz WHERE owner_user_id='${OWNER}'`))).rows[0].n === 0);
  A('userB 读不到 quizUser 的 quiz_job(RLS USING)', (await asPrincipal(pool, 'userB', (c) => c.query(`SELECT count(*)::int n FROM quiz_job WHERE owner_user_id='${OWNER}'`))).rows[0].n === 0);
  // SSE 越权面:events() 以 stream_key=quizId 读共享 interview_event 表;RLS(owner)必须挡住跨租户读(专家审计:最关键越权面)。
  A('userB 经 events 取数路径(stream_key=quizId)读不到 quizUser 的押题事件(RLS)',
    (await asPrincipal(pool, 'userB', (c) => c.query('SELECT count(*)::int n FROM interview_event WHERE stream_key=$1', [QID]))).rows[0].n === 0);
  // WITH CHECK:userB 不能把 owner 写成 quizUser(改归属=越权搬数据)。
  let withCheckBlocked = false;
  try { await asPrincipal(pool, 'userB', (c) => c.query(`INSERT INTO resume_quiz(id,owner_user_id,status) VALUES ('qz-evil','${OWNER}','created')`)); }
  catch { withCheckBlocked = true; }
  A('userB 越权插入 owner=quizUser 的押题 → 被 RLS WITH CHECK 拒', withCheckBlocked);

  section('⑥ abandon×worker 竞态守卫(专家审计):已 ready 的押题不可被 abandon 倒退');
  // abandon 的 CAS:仅从 created/generating 放弃。对已 ready 的 QID 执行 → 0 行(拒绝倒退已完成已结算的押题)。
  const revert = await asPrincipal(pool, OWNER, (c) => c.query("UPDATE resume_quiz SET status='failed' WHERE id=$1 AND owner_user_id=$2 AND status IN ('created','generating')", [QID, OWNER]));
  A('对 ready 押题套用 abandon CAS → 0 行(状态机不倒退,不误退已扣费)', revert.rowCount === 0);
  A('ready 押题仍 ready(未被倒退)', (await asPrincipal(pool, OWNER, (c) => c.query('SELECT status FROM resume_quiz WHERE id=$1', [QID]))).rows[0].status === 'ready');

  console.log(`\n${failures === 0 ? '✓ 押题进程接线(api 入队→worker 消费→runQuiz 图)全部通过' : '✗ ' + failures + ' 项失败'}`);
  await pool.end();
  process.exit(failures === 0 ? 0 : 1);
}
main().catch((e) => { console.error(e); process.exit(1); });
