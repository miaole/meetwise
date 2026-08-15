/**
 * 当前生产面试链路证明：C 端已入队的 v64 start/answer → 当前自适应
 * consumer（消费者）→ LangGraph（图编排框架）→ 账本/报告舱壁。
 *
 * 此测试只能由 `scripts/run-e2e-isolated.mjs` 在完整版本化迁移后运行。
 * 禁止用 `packages/db/sql/` 影子 schema（影子数据库结构）伪造通过，因为
 * 生产 consumer 已不支持旧固定题单图，且 v64 简历世代门必须真实存在。
 */
import { randomUUID } from 'node:crypto';
import { MemorySaver } from '@langchain/langgraph';
import {
  assertIsolatedTestTarget, asPrincipal, availableUnits, claimInterviewAnswer,
  createPool, createResumeWithBlob, enqueueInterviewJob, getReport,
  reserveEntitlement, transitionResume, completeIngestion, answerHash,
} from '@meetwise/db';
import { scriptedModelClient, type ModelClient } from '@meetwise/ai-runtime';
import { ingestResume } from '@meetwise/domain';
import { drainReportsOnce } from '../src/report-worker.ts';
import { interviewDispatchTick, type ConsumerDeps } from '../src/interview-consumer.ts';
import { reportGenerator } from '../src/interview-service.ts';

const pool = createPool();
let failures = 0;
const A = (name: string, condition: boolean) => {
  console.log(`${condition ? 'PASS' : 'FAIL'}  ${name}`);
  if (!condition) failures++;
};
const section = (title: string) => console.log(`\n──────── ${title} ────────`);

const OWNER = `interview-proof-${process.pid}`;
const INTERVIEW_ID = `interview-proof-${Date.now()}`;
const RESUME = [
  '工作经历',
  '负责订单系统限流改造，使用 Redis 计数器和滑动窗口保护下游。',
  '技能',
  'Redis、限流、分布式锁',
].join('\n');

const model: ModelClient = scriptedModelClient({
  'planner.competencies': () => ({ ok: true, raw: { competencies: ['高并发'] } }),
  'interviewer.ask': () => ({ ok: true, raw: { q: '请说明高并发限流的取舍，并给出验证方法。', refs: [] } }),
  'mock-interview.evaluate': () => ({ ok: true, raw: { score: 80, evidence: [{ criterion: 'Redis', quote: 'Redis' }] } }),
  'report.generate': () => ({ ok: true, raw: { overall: 80, sections: [{ title: '总评', body: '能说明限流取舍。' }] } }),
});

async function main() {
  await assertIsolatedTestTarget(pool);
  await asPrincipal(pool, OWNER, async (c) => {
    await c.query(
      "INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at) VALUES ($1,'paid',5.0,now()+interval '30 days')",
      [OWNER],
    );
  });

  const resume = await asPrincipal(pool, OWNER, async (c) => {
    const created = await createResumeWithBlob(c, OWNER, RESUME);
    await transitionResume(c, OWNER, created.resumeId, 'uploaded', 'ingesting');
    await completeIngestion(c, OWNER, created.resumeId, ingestResume(RESUME));
    return created.resumeId;
  });
  const epoch = await asPrincipal(pool, OWNER, async (c) => {
    const row = await c.query<{ privacy_epoch: number }>(
      'SELECT privacy_epoch FROM resume WHERE id=$1 AND owner_user_id=$2', [resume, OWNER],
    );
    return Number(row.rows[0]?.privacy_epoch);
  });
  await asPrincipal(pool, OWNER, (c) => c.query(
    "INSERT INTO interview(id,owner_user_id,status,resume_id,resume_privacy_epoch) VALUES ($1,$2,'created',$3,$4)",
    [INTERVIEW_ID, OWNER, resume, epoch],
  ));

  const before = await asPrincipal(pool, OWNER, (c) => availableUnits(c, OWNER));
  await asPrincipal(pool, OWNER, (c) => reserveEntitlement(c, OWNER, INTERVIEW_ID, 'mock_interview', 1));
  await asPrincipal(pool, OWNER, (c) => enqueueInterviewJob(c, OWNER, INTERVIEW_ID, 'start', { requestId: 'interview-proof-request' }, 0));

  const deps: ConsumerDeps = {
    pool,
    cp: new MemorySaver() as any,
    model,
    leaseOwner: `interview-proof-worker-${process.pid}`,
    adaptive: {
      role: '后端工程师',
      maxTurns: 2,
      localRetrieve: async () => [],
      webExplore: async () => [],
    },
  };

  section('① v64 start 由当前 consumer 消费并投影首题');
  const firstTick = await interviewDispatchTick(deps);
  const start = await asPrincipal(pool, OWNER, async (c) => {
    const interview = await c.query<{ status: string }>('SELECT status FROM interview WHERE id=$1', [INTERVIEW_ID]);
    const question = await c.query<{ question_id: string; state_version: number; turn: number }>(
      "SELECT question_id,state_version,turn FROM interview_question WHERE interview_id=$1 AND status='issued' ORDER BY state_version DESC LIMIT 1",
      [INTERVIEW_ID],
    );
    const job = await c.query<{ reference_schema_version: number; resume_id: string; resume_privacy_epoch: number }>(
      "SELECT reference_schema_version,resume_id,resume_privacy_epoch FROM interview_job WHERE interview_id=$1 AND kind='start'",
      [INTERVIEW_ID],
    );
    return { status: interview.rows[0]?.status, question: question.rows[0], job: job.rows[0] };
  });
  A('调度器发现且消费 owner 队列', firstTick.owners === 1);
  A('start 任务保留 parent 的 v64 简历标识与世代', start.job?.reference_schema_version === 64 && start.job.resume_id === resume && Number(start.job.resume_privacy_epoch) === epoch);
  // 自适应流程以 `created + start job` 表示已开始，逐轮状态在 question ledger（题目账本）与图检查点；
  // 不沿用旧固定题单的 `interview.status='active'` 断言。
  A('当前自适应图投影 issued 首题', start.status === 'created' && !!start.question);

  section('② API 身份领取 → v64 answer 队列 → 自适应评估/收口');
  let completed = false;
  let answerTurns = 0;
  for (; answerTurns < 4 && !completed; answerTurns++) {
    const question = await asPrincipal(pool, OWNER, async (c) => (await c.query<{
      question_id: string; state_version: number; turn: number;
    }>(
      "SELECT question_id,state_version,turn FROM interview_question WHERE interview_id=$1 AND status='issued' ORDER BY state_version DESC LIMIT 1",
      [INTERVIEW_ID],
    )).rows[0]);
    if (!question) break;
    const answer = `第 ${Number(question.turn) + 1} 题：我会用 Redis 计数器、滑动窗口和降级保护下游。`;
    const input = {
      questionId: question.question_id,
      stateVersion: Number(question.state_version),
      turn: Number(question.turn),
      answerId: randomUUID(),
      answerHash: answerHash(answer),
      answer,
    };
    const claimed = await asPrincipal(pool, OWNER, (c) => claimInterviewAnswer(c, OWNER, INTERVIEW_ID, input));
    A(`第 ${input.turn + 1} 题 API 身份账本接受`, claimed.status === 'accepted');
    await asPrincipal(pool, OWNER, (c) => enqueueInterviewJob(c, OWNER, INTERVIEW_ID, 'answer', input, input.turn + 1));
    await interviewDispatchTick(deps);
    completed = await asPrincipal(pool, OWNER, async (c) => {
      const row = await c.query<{ status: string }>('SELECT status FROM interview WHERE id=$1', [INTERVIEW_ID]);
      return row.rows[0]?.status === 'completed';
    });
  }
  const after = await asPrincipal(pool, OWNER, async (c) => {
    const events = await c.query<{ n: number }>(
      "SELECT count(*)::int AS n FROM interview_event WHERE stream_key=$1 AND kind='answer_evaluated'", [INTERVIEW_ID],
    );
    const jobs = await c.query<{ n: number }>(
      "SELECT count(*)::int AS n FROM interview_job WHERE interview_id=$1 AND status!='done'", [INTERVIEW_ID],
    );
    return { evaluated: Number(events.rows[0]?.n), unfinished: Number(jobs.rows[0]?.n) };
  });
  A('自适应图在有限轮数内完成', completed && answerTurns >= 1);
  A('每个已完成回答都有 answer_evaluated 业务事件', after.evaluated >= 1);
  A('start/answer durable job（持久任务）均收口为 done', after.unfinished === 0);
  A('权益确认后可用额度精确减少 1', (await asPrincipal(pool, OWNER, (c) => availableUnits(c, OWNER))) === before - 1);

  section('③ 报告舱壁独立领取并形成 ready');
  const report = await asPrincipal(pool, OWNER, (c) => getReport(c, OWNER, INTERVIEW_ID));
  A('面试完成只入队报告，不在图内生成报告', report?.status === 'queued');
  const reportResult = await drainReportsOnce(pool, OWNER, `interview-proof-report-${process.pid}`, {
    loadSummary: () => ({ interviewId: INTERVIEW_ID, questionCount: after.evaluated, scores: Array.from({ length: after.evaluated }, () => 80) }),
    generate: reportGenerator(pool, OWNER, `${INTERVIEW_ID}:report`, model),
  });
  A('报告 worker（后台进程）独立收口 ready', reportResult === 'ready' && (await asPrincipal(pool, OWNER, (c) => getReport(c, OWNER, INTERVIEW_ID)))?.status === 'ready');

  console.log(`\n${failures === 0 ? '✓ 当前 v64 面试链路全部通过' : `✗ ${failures} 项失败`}`);
  await pool.end();
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(async (error) => {
  console.error(error);
  await pool.end().catch(() => undefined);
  process.exit(1);
});
