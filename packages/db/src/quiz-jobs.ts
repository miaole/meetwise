/**
 * @meetwise/db · 押题(resume-quiz)生成 job 队列(api 入队 / worker 消费)。一押题一 job,租约防并发双跑、崩溃可重领。
 * 镜像 interview-jobs,但押题只有单一 job 类型(generate),无 answer/seq——故更简。
 * DBSB-1: claim/done/failed/renew/sweep 五件套委托 job-queue.ts 工厂(案B·SQL 逐字符等价由 prove P3 快照断言)。
 */
import type { PoolClient as Client } from 'pg';
import { createJobQueueLifecycle } from './job-queue.ts';

const LEASE_SECONDS = 120;
/** claim 续领上限 = reaper 终结边界（单一真相,claim 与 sweep 共用）。 */
export const MAX_QUIZ_JOB_ATTEMPTS = 5;

/** 入队押题生成 job(api 用)。**幂等**:同押题(owner+quiz_id)重复 begin → 不新建,返已存在 job(防双扣双跑)。 */
export const RESUME_DERIVATIVE_REFERENCE_VERSION = 61;

const quizQueue = createJobQueueLifecycle({
  table: 'quiz_job',
  siblingColumn: 'quiz_id',
  leaseSeconds: LEASE_SECONDS,
  maxAttempts: MAX_QUIZ_JOB_ATTEMPTS,
  claimOrder: 'j.created_at ASC',
  claimReturning: 'id, quiz_id, resume_id, privacy_epoch, reference_schema_version, attempts',
});

/** New jobs never carry a resume locator in JSON.  The typed tuple is checked
 * again by the database trigger against its parent quiz and active resume. */
export async function enqueueQuizJob(
  c: Client, owner: string, quizId: string, resumeId: string, privacyEpoch: number,
): Promise<string> {
  const r = await c.query(
    `INSERT INTO quiz_job(owner_user_id, quiz_id, resume_id, privacy_epoch, reference_schema_version, payload)
     VALUES ($1,$2,$3,$4,$5,'{}'::jsonb)
       ON CONFLICT (owner_user_id, quiz_id) DO NOTHING RETURNING id`,
    [owner, quizId, resumeId, privacyEpoch, RESUME_DERIVATIVE_REFERENCE_VERSION]);
  if (r.rowCount === 1) return r.rows[0].id;
  const ex = await c.query('SELECT id FROM quiz_job WHERE owner_user_id=$1 AND quiz_id=$2', [owner, quizId]);
  return ex.rows[0].id;
}

/** 领取下一个可跑押题 job(FIFO by created_at;租约过期可重领,同押题有 running 的不领——防并发双推同一图)。 */
export async function claimNextQuizJob(
  c: Client, owner: string, leaseOwner: string, maxAttempts = MAX_QUIZ_JOB_ATTEMPTS,
): Promise<{ id: string; quizId: string; resumeId: string | null; privacyEpoch: number | null; referenceSchemaVersion: number | null; attempts: number } | null> {
  const r = await quizQueue.claimNext(c, owner, leaseOwner, maxAttempts);
  if (r.rowCount === 0) return null;
  const x = r.rows[0];
  return {
    id: x.id,
    quizId: x.quiz_id,
    resumeId: x.resume_id ?? null,
    privacyEpoch: x.privacy_epoch == null ? null : Number(x.privacy_epoch),
    referenceSchemaVersion: x.reference_schema_version == null ? null : Number(x.reference_schema_version),
    attempts: x.attempts,
  };
}

export async function markQuizJobDone(c: Client, owner: string, jobId: string, leaseOwner: string): Promise<boolean> {
  return quizQueue.markDone(c, owner, jobId, leaseOwner);
}
export async function markQuizJobFailed(c: Client, owner: string, jobId: string, leaseOwner: string, error: string): Promise<boolean> {
  return quizQueue.markFailed(c, owner, jobId, leaseOwner, error);
}

/** 心跳续租（镜像 interview）：仅当 job 仍 running 且租约仍归本机 → 推后 lease_expires_at。返 false=已被重领/终态→停心跳。 */
export async function renewQuizJobLease(
  c: Client, owner: string, jobId: string, leaseOwner: string, leaseSeconds = LEASE_SECONDS,
): Promise<boolean> {
  return quizQueue.renewLease(c, owner, jobId, leaseOwner, leaseSeconds);
}

/** Reaper/对账（镜像 sweepStuckInterviewJobs）：押题 worker 崩在跑 → job 卡 running 且租约过期：
 *  未超上限 → requeue 回 queued;已达上限 → 终结 failed 并返回 quizId 让调用方发 quiz_unavailable + 退预留额度。
 *  状态翻转与 lease 过期判定同一条原子 UPDATE,杜绝 heartbeat-vs-reap TOCTOU。 */
export async function sweepStuckQuizJobs(
  c: Client, owner: string, maxAttempts = MAX_QUIZ_JOB_ATTEMPTS,
): Promise<{ requeued: number; failed: number; failedQuizzes: string[] }> {
  const r = await quizQueue.sweep(c, owner, maxAttempts);
  return { requeued: r.requeued, failed: r.failed, failedQuizzes: r.failedSiblings };
}
