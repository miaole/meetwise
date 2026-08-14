/**
 * Reaper（孤儿 job 收割）证明（对真 Postgres）：消除"静默转圈"——worker 崩在跑 → job 卡 running 且租约过期。
 *   ① 心跳续租(本机持租)→ lease 未过期 → reaper 不误收(heartbeat-vs-reap TOCTOU);非持租续租被拒；
 *   ② 未超上限(attempts=MAX-1 下边界)孤儿 → requeue 回 queued,attempts **不双增**；
 *   ③ 已达上限(attempts=MAX 上边界)poison-pill → 终结 failed + *_unavailable 终态事件 + **退预留额度**(无泄漏) + 二次 reap 幂等；
 *   ④ 押题线同构(requeue / 终结 / 退款 / resume_quiz=failed)；
 *   ⑤ 僵尸兄弟守卫:面试已有 failed job → 其后续 seq job 不被 claim(不乱序跑已死面试)；
 *   ⑥ 已结算面试被 reap → **不发假终态、不重复退款**(release 返 already_confirmed → 跳过事件,已扣费不倒退)；
 *   ⑦ 心跳调度器(startHeartbeat):renew 返 false 自停、stop() 后不再续租、stop() 幂等。
 * 终态事件 → degraded 视图归约由 apps/web web:prove 覆盖(arch 禁 apps 互 import)。测的全是生产件。
 *   pnpm reaper:prove   (需 pnpm db:up;跑前 pkill -f 'esm-register.*main.ts')
 */
import {
  assertIsolatedTestTarget, createPool, asPrincipal, reserveEntitlement, confirmConsumption, availableUnits,
  claimNextInterviewJob, renewInterviewJobLease, sweepStuckInterviewJobs, MAX_INTERVIEW_JOB_ATTEMPTS,
  sweepStuckQuizJobs, MAX_QUIZ_JOB_ATTEMPTS,
  createResumeWithBlob, completeIngestion, transitionResume, enqueueInterviewJob, enqueueQuizJob,
} from '@meetwise/db';
import { ingestResume } from '@meetwise/domain';
import { reapStuckInterviewJobs, type ConsumerDeps } from '../src/interview-consumer.ts';
import { reapStuckQuizJobs, type QuizConsumerDeps } from '../src/quiz-consumer.ts';
import { startHeartbeat } from '../src/job-heartbeat.ts';

const pool = createPool();
let failures = 0;
const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) failures++; };
const section = (t: string) => console.log(`\n──────── ${t} ────────`);
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const OWNER = 'reaperUser';
const IID = 'rv-' + Date.now();
const QID = 'rq-' + Date.now();
const CID = 'rc-' + Date.now();   // 已结算面试(证 reaper 不发假终态)

/** 把 job 强行置成"孤儿 running"(租约已过期),模拟 worker 崩在跑。 */
const orphanInterview = (id: string, attempts: number) => asPrincipal(pool, OWNER, (c) => c.query(
  `UPDATE interview_job SET status='running', lease_owner='dead-worker#1', lease_expires_at=now()-interval '5 minutes', attempts=$2 WHERE interview_id=$1`,
  [id, attempts]));
const orphanQuiz = (attempts: number) => asPrincipal(pool, OWNER, (c) => c.query(
  `UPDATE quiz_job SET status='running', lease_owner='dead-worker#1', lease_expires_at=now()-interval '5 minutes', attempts=$1 WHERE quiz_id=$2`,
  [attempts, QID]));
const jobRow = (table: string, col: string, id: string) =>
  asPrincipal(pool, OWNER, (c) => c.query(`SELECT status, lease_owner, attempts FROM ${table} WHERE ${col}=$1`, [id])).then((r) => r.rows[0]);
const events = (streamKey: string) =>
  asPrincipal(pool, OWNER, (c) => c.query("SELECT kind FROM interview_event WHERE stream_key=$1 ORDER BY seq", [streamKey]))
    .then((r) => r.rows.map((x: any) => x.kind as string));
const avail = () => asPrincipal(pool, OWNER, (c) => availableUnits(c, OWNER));

async function main() {
  await assertIsolatedTestTarget(pool);
  const resumeId = await asPrincipal(pool, OWNER, async (c) => {
    const upload = await createResumeWithBlob(c, OWNER, '经历：负责分布式限流与订单系统可靠性');
    await transitionResume(c, OWNER, upload.resumeId, 'uploaded', 'ingesting');
    await completeIngestion(c, OWNER, upload.resumeId, ingestResume('经历：负责分布式限流与订单系统可靠性'));
    return upload.resumeId;
  });
  const resumeEpoch = await asPrincipal(pool, OWNER, async (c) => Number((await c.query<{ privacy_epoch: number }>(
    'SELECT privacy_epoch FROM resume WHERE id=$1 AND owner_user_id=$2', [resumeId, OWNER],
  )).rows[0]!.privacy_epoch));
  await asPrincipal(pool, OWNER, async (c) => {
    await c.query(
      `INSERT INTO interview(id,owner_user_id,status,resume_id,resume_privacy_epoch)
       VALUES ($1,$2,'active',$3,$4),($5,$2,'active',$3,$4)`,
      [IID, OWNER, resumeId, resumeEpoch, CID],
    );
    await c.query(`INSERT INTO resume_quiz(id,owner_user_id,status) VALUES ($1,$2,'created')`, [QID, OWNER]);
    await c.query('UPDATE resume_quiz SET resume_id=$3, privacy_epoch=$4 WHERE id=$1 AND owner_user_id=$2', [QID, OWNER, resumeId, resumeEpoch]);
    await c.query("INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at) VALUES ($1,'paid',10.0, now()+interval '300 days')", [OWNER]);
  });
  // api 入队等价:预留 1.0 额度 + 一条 job(随后强行孤儿化)。
  await asPrincipal(pool, OWNER, (c) => reserveEntitlement(c, OWNER, IID, 'mock_interview', 1.0));
  await asPrincipal(pool, OWNER, (c) => reserveEntitlement(c, OWNER, QID, 'resume_quiz', 1.0));
  await asPrincipal(pool, OWNER, (c) => enqueueInterviewJob(c, OWNER, IID, 'start', {}, 0));
  await asPrincipal(pool, OWNER, (c) => enqueueQuizJob(c, OWNER, QID, resumeId, resumeEpoch));
  const reservedBalance = await avail();   // 已扣 2×1.0
  const iDeps = { pool, leaseOwner: 'reaper-1' } as unknown as ConsumerDeps;
  const qDeps = { pool, leaseOwner: 'reaper-1' } as unknown as QuizConsumerDeps;

  section('① 心跳保护:worker 续租把 lease 推到未来 → reaper 不误收(TOCTOU)');
  await asPrincipal(pool, OWNER, (c) => c.query(
    "UPDATE interview_job SET status='running', lease_owner='reaper-1', lease_expires_at=now()-interval '5 minutes', attempts=1 WHERE interview_id=$1",
    [IID],
  ));
  const jid = await jobId('interview_job', 'interview_id', IID);
  const renewed = await asPrincipal(pool, OWNER, (c) => renewInterviewJobLease(c, OWNER, jid, 'reaper-1'));
  A('心跳续租成功(本机持租 → lease 推后)', renewed === true);
  const noReap = await asPrincipal(pool, OWNER, (c) => sweepStuckInterviewJobs(c, OWNER));
  A('续租后 lease 未过期 → reaper 不收割(防误收活 job)', noReap.requeued === 0 && noReap.failed === 0);
  A('活 job 仍 running(未被动)', (await jobRow('interview_job', 'interview_id', IID)).status === 'running');
  A('非持租 worker 续租被拒(返 false,不抢他人租约)', (await asPrincipal(pool, OWNER, (c) => renewInterviewJobLease(c, OWNER, jid, 'other-worker'))) === false);

  section('② 面试:下边界 attempts=MAX-1 孤儿 → requeue 回 queued,attempts 不双增');
  await orphanInterview(IID, MAX_INTERVIEW_JOB_ATTEMPTS - 1);   // =4 < 5,下边界:必须 requeue 不终结
  const r1 = await reapStuckInterviewJobs(iDeps, OWNER);
  A('下边界 requeued=1 failed=0(attempts<max 必 requeue,非早夭)', r1.requeued === 1 && r1.failed === 0);
  const after1 = await jobRow('interview_job', 'interview_id', IID);
  A('job 回 queued 且 lease 释放(NULL)', after1.status === 'queued' && after1.lease_owner === null);
  A('attempts 未被双增(仍=MAX-1,留给下次 claim +1)', after1.attempts === MAX_INTERVIEW_JOB_ATTEMPTS - 1);
  A('额度未动(仅 requeue,不退款)', (await avail()) === reservedBalance);

  section('③ 面试:上边界 attempts=MAX poison-pill → 终结 failed + interview_unavailable + 退款 + 二次 reap 幂等');
  await orphanInterview(IID, MAX_INTERVIEW_JOB_ATTEMPTS);   // =5 >= 5
  const r2 = await reapStuckInterviewJobs(iDeps, OWNER);
  A('上边界 failed=1 requeued=0', r2.failed === 1 && r2.requeued === 0);
  A('job 终态 failed(不无限重试)', (await jobRow('interview_job', 'interview_id', IID)).status === 'failed');
  A('发 interview_unavailable 终态事件(无静默死胡同)', (await events(IID)).includes('interview_unavailable'));
  A('**失败退款**:预留额度退还(回到预留前余额)', (await avail()) === reservedBalance + 1.0);
  const r2b = await reapStuckInterviewJobs(iDeps, OWNER);
  A('二次 reap 幂等(failed=0,无重复退款/重复事件)', r2b.failed === 0 && (await avail()) === reservedBalance + 1.0 && (await events(IID)).filter((k) => k === 'interview_unavailable').length === 1);

  section('④ 押题:下边界 requeue;上边界 failed + quiz_unavailable + 退款 + resume_quiz=failed');
  await orphanQuiz(MAX_QUIZ_JOB_ATTEMPTS - 1);
  const q1 = await reapStuckQuizJobs(qDeps, OWNER);
  A('押题下边界 → requeued=1 failed=0', q1.requeued === 1 && q1.failed === 0);
  A('押题 job 回 queued', (await jobRow('quiz_job', 'quiz_id', QID)).status === 'queued');
  await orphanQuiz(MAX_QUIZ_JOB_ATTEMPTS);
  const q2 = await reapStuckQuizJobs(qDeps, OWNER);
  A('押题上边界 → failed=1 requeued=0', q2.failed === 1 && q2.requeued === 0);
  A('押题 job 终态 failed', (await jobRow('quiz_job', 'quiz_id', QID)).status === 'failed');
  A('resume_quiz 标 failed(非 ready 才退)', (await asPrincipal(pool, OWNER, (c) => c.query('SELECT status FROM resume_quiz WHERE id=$1', [QID]))).rows[0].status === 'failed');
  A('发 quiz_unavailable 终态事件', (await events(QID)).includes('quiz_unavailable'));
  A('押题失败退款:预留退还', (await avail()) === reservedBalance + 2.0);

  section('⑤ 僵尸兄弟守卫:面试已有 failed start → 数据库拒绝后续 answer(不乱序跑已死面试)');
  // v64 的 answer 引用必须有 queued/running/done start 祖先；failed start 不可再
  // 生成 answer job。数据库前置拒绝比“先插入、再由 claim 返回 null”更早阻断。
  let answerInsertRejected = false;
  try { await asPrincipal(pool, OWNER, (c) => enqueueInterviewJob(c, OWNER, IID, 'answer', { answer: '迟到回答' }, 1)); }
  catch { answerInsertRejected = true; }
  A('failed start 后 answer 入队被 v64 祖先约束拒绝', answerInsertRejected);
  const claimed = await asPrincipal(pool, OWNER, (c) => claimNextInterviewJob(c, OWNER, 'reaper-1'));
  A('有 failed 兄弟且无可入队 answer → claim 返回 null(不领已死面试)', claimed === null);

  section('⑥ 已结算面试被 reap → 不发假终态、不重复退款(release 返 already_confirmed)');
  await asPrincipal(pool, OWNER, (c) => reserveEntitlement(c, OWNER, CID, 'mock_interview', 1.0));
  await asPrincipal(pool, OWNER, (c) => confirmConsumption(c, OWNER, CID, 1));   // 面试确实跑完结算
  await asPrincipal(pool, OWNER, (c) => enqueueInterviewJob(c, OWNER, CID, 'start', {}, 0));
  const availBeforeC = await avail();
  await orphanInterview(CID, MAX_INTERVIEW_JOB_ATTEMPTS);   // job 没 markDone 就崩,卡 running 到上限
  const rc = await reapStuckInterviewJobs(iDeps, OWNER);
  A('已结算面试的孤儿 job 仍被终结 failed(清理 job)', rc.failed === 1 && (await jobRow('interview_job', 'interview_id', CID)).status === 'failed');
  A('**不发假 interview_unavailable**(面试已交付,报告舱壁自会发 report_*)', !(await events(CID)).includes('interview_unavailable'));
  A('**不重复退款**:已结算额度不倒退(余额不变)', (await avail()) === availBeforeC);

  section('⑦ 心跳调度器(startHeartbeat):renew 返 false 自停 / stop() 后不再续 / stop() 幂等');
  let c1 = 0;
  startHeartbeat(async () => { c1++; return c1 < 3; }, 10);   // true,true,false(第3拍)→ 自停
  await sleep(80);
  A('renew 返 false 即自停(续租计数封顶=3,不再调用)', c1 === 3);
  let c2 = 0;
  const hb = startHeartbeat(async () => { c2++; return true; }, 10);
  await sleep(35);
  await hb.stop();
  const atStop = c2;
  await sleep(40);
  A('stop() 后心跳不再续租(无僵尸续约)', c2 === atStop && atStop >= 1);
  let threw = false;
  try { await hb.stop(); } catch { threw = true; }
  A('stop() 幂等(重复调用不抛)', threw === false);

  console.log(`\n${failures === 0 ? '✓ Reaper(心跳防误收 + 双边界 requeue/终结 + 终态事件 + 退款 + 僵尸守卫 + 已结算不误终态)全部通过' : '✗ ' + failures + ' 项失败'}`);
  await pool.end();
  process.exit(failures === 0 ? 0 : 1);
}

/** 取 job id（async,内联用)。 */
async function jobId(table: string, col: string, id: string): Promise<string> {
  const r = await asPrincipal(pool, OWNER, (c) => c.query(`SELECT id FROM ${table} WHERE ${col}=$1`, [id]));
  return r.rows[0].id;
}

main().catch((e) => { console.error(e); process.exit(1); });
