/**
 * @meetwise/db · 简历诊断(resume-diagnosis)生成 job 队列(api 入队 / worker 消费)。一诊断一 job,租约防并发双跑、崩溃可重领。
 * 镜像 quiz-jobs:诊断只有单一 job 类型(generate),无 answer/seq——结构同。租约字段兼容 reaper/heartbeat 模式。
 * DBSB-1: claim/done/failed/renew/sweep 五件套委托 job-queue.ts 工厂(案B·SQL 逐字符等价由 prove P3 快照断言)。
 */
import type { PoolClient as Client } from 'pg';
import { createJobQueueLifecycle } from './job-queue.ts';
import { RESUME_DERIVATIVE_REFERENCE_VERSION } from './quiz-jobs.ts';

const LEASE_SECONDS = 120;
/** claim 续领上限 = reaper 终结边界（单一真相,claim 与 sweep 共用）。 */
export const MAX_DIAGNOSIS_JOB_ATTEMPTS = 5;

const diagnosisQueue = createJobQueueLifecycle({
  table: 'diagnosis_job',
  siblingColumn: 'diagnosis_id',
  leaseSeconds: LEASE_SECONDS,
  maxAttempts: MAX_DIAGNOSIS_JOB_ATTEMPTS,
  claimOrder: 'j.created_at ASC',
  claimReturning: 'id, diagnosis_id, resume_id, privacy_epoch, reference_schema_version, attempts',
});

/** 入队诊断生成 job(api 用)。**幂等**:同诊断(owner+diagnosis_id)重复 begin → 不新建,返已存在 job(防双扣双跑)。 */
/** New jobs carry no JSON resume locator or role; both live in typed tables. */
export async function enqueueDiagnosisJob(
  c: Client, owner: string, diagnosisId: string, resumeId: string, privacyEpoch: number,
): Promise<string> {
  const r = await c.query(
    `INSERT INTO diagnosis_job(owner_user_id, diagnosis_id, resume_id, privacy_epoch, reference_schema_version, payload)
     VALUES ($1,$2,$3,$4,$5,'{}'::jsonb)
       ON CONFLICT (owner_user_id, diagnosis_id) DO NOTHING RETURNING id`,
    [owner, diagnosisId, resumeId, privacyEpoch, RESUME_DERIVATIVE_REFERENCE_VERSION]);
  if (r.rowCount === 1) return r.rows[0].id;
  const ex = await c.query('SELECT id FROM diagnosis_job WHERE owner_user_id=$1 AND diagnosis_id=$2', [owner, diagnosisId]);
  return ex.rows[0].id;
}

/** 领取下一个可跑诊断 job(FIFO by created_at;租约过期可重领,同诊断有 running 的不领——防并发双推同一图)。 */
export async function claimNextDiagnosisJob(
  c: Client, owner: string, leaseOwner: string, maxAttempts = MAX_DIAGNOSIS_JOB_ATTEMPTS,
): Promise<{ id: string; diagnosisId: string; resumeId: string | null; privacyEpoch: number | null; referenceSchemaVersion: number | null; attempts: number } | null> {
  const r = await diagnosisQueue.claimNext(c, owner, leaseOwner, maxAttempts);
  if (r.rowCount === 0) return null;
  const x = r.rows[0];
  return {
    id: x.id,
    diagnosisId: x.diagnosis_id,
    resumeId: x.resume_id ?? null,
    privacyEpoch: x.privacy_epoch == null ? null : Number(x.privacy_epoch),
    referenceSchemaVersion: x.reference_schema_version == null ? null : Number(x.reference_schema_version),
    attempts: x.attempts,
  };
}

export async function markDiagnosisJobDone(c: Client, owner: string, jobId: string, leaseOwner: string): Promise<boolean> {
  return diagnosisQueue.markDone(c, owner, jobId, leaseOwner);
}
export async function markDiagnosisJobFailed(c: Client, owner: string, jobId: string, leaseOwner: string, error: string): Promise<boolean> {
  return diagnosisQueue.markFailed(c, owner, jobId, leaseOwner, error);
}

/** 心跳续租（镜像 quiz）：仅当 job 仍 running 且租约仍归本机 → 推后 lease_expires_at。返 false=已被重领/终态→停心跳。 */
export async function renewDiagnosisJobLease(
  c: Client, owner: string, jobId: string, leaseOwner: string, leaseSeconds = LEASE_SECONDS,
): Promise<boolean> {
  return diagnosisQueue.renewLease(c, owner, jobId, leaseOwner, leaseSeconds);
}

/** Reaper/对账（镜像 sweepStuckQuizJobs）：诊断 worker 崩在跑 → job 卡 running 且租约过期:
 *  未超上限 → requeue 回 queued;已达上限 → 终结 failed 并返回 diagnosisId 让调用方发 diagnosis_unavailable + 退预留额度。
 *  状态翻转与 lease 过期判定同一条原子 UPDATE,杜绝 heartbeat-vs-reap TOCTOU。 */
export async function sweepStuckDiagnosisJobs(
  c: Client, owner: string, maxAttempts = MAX_DIAGNOSIS_JOB_ATTEMPTS,
): Promise<{ requeued: number; failed: number; failedDiagnoses: string[] }> {
  const r = await diagnosisQueue.sweep(c, owner, maxAttempts);
  return { requeued: r.requeued, failed: r.failed, failedDiagnoses: r.failedSiblings };
}
