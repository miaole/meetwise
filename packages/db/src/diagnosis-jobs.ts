/**
 * @meetwise/db · 简历诊断(resume-diagnosis)生成 job 队列(api 入队 / worker 消费)。一诊断一 job,租约防并发双跑、崩溃可重领。
 * 镜像 quiz-jobs:诊断只有单一 job 类型(generate),无 answer/seq——结构同。租约字段兼容 reaper/heartbeat 模式。
 */
import type { PoolClient as Client } from 'pg';
import { RESUME_DERIVATIVE_REFERENCE_VERSION } from './quiz-jobs.ts';

const LEASE_SECONDS = 120;
/** claim 续领上限 = reaper 终结边界（单一真相,claim 与 sweep 共用）。 */
export const MAX_DIAGNOSIS_JOB_ATTEMPTS = 5;

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
  const r = await c.query(
    `UPDATE diagnosis_job SET status='running', lease_owner=$2, lease_expires_at=now()+($3||' seconds')::interval, attempts=attempts+1, version=version+1
       WHERE id = (
         SELECT j.id FROM diagnosis_job j
          WHERE j.owner_user_id=$1
            AND (j.status='queued' OR (j.status='running' AND j.lease_expires_at < now() AND j.attempts < $4))
            AND NOT EXISTS (SELECT 1 FROM diagnosis_job r WHERE r.diagnosis_id=j.diagnosis_id AND r.status='running' AND r.lease_expires_at >= now())
          ORDER BY j.created_at ASC FOR UPDATE SKIP LOCKED LIMIT 1)
     RETURNING id, diagnosis_id, resume_id, privacy_epoch, reference_schema_version, attempts`, [owner, leaseOwner, String(LEASE_SECONDS), maxAttempts]);
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
  const r = await c.query("UPDATE diagnosis_job SET status='done', lease_owner=NULL, version=version+1 WHERE id=$1 AND owner_user_id=$2 AND status='running' AND lease_owner=$3", [jobId, owner, leaseOwner]);
  return r.rowCount === 1;
}
export async function markDiagnosisJobFailed(c: Client, owner: string, jobId: string, leaseOwner: string, error: string): Promise<boolean> {
  const r = await c.query("UPDATE diagnosis_job SET status='failed', last_error=$4, lease_owner=NULL, version=version+1 WHERE id=$1 AND owner_user_id=$2 AND status='running' AND lease_owner=$3", [jobId, owner, leaseOwner, error.slice(0, 500)]);
  return r.rowCount === 1;
}

/** 心跳续租（镜像 quiz）：仅当 job 仍 running 且租约仍归本机 → 推后 lease_expires_at。返 false=已被重领/终态→停心跳。 */
export async function renewDiagnosisJobLease(
  c: Client, owner: string, jobId: string, leaseOwner: string, leaseSeconds = LEASE_SECONDS,
): Promise<boolean> {
  const r = await c.query(
    `UPDATE diagnosis_job SET lease_expires_at = now() + ($4||' seconds')::interval
       WHERE id=$1 AND owner_user_id=$2 AND status='running' AND lease_owner=$3`,
    [jobId, owner, leaseOwner, String(leaseSeconds)]);
  return r.rowCount === 1;
}

/** Reaper/对账（镜像 sweepStuckQuizJobs）：诊断 worker 崩在跑 → job 卡 running 且租约过期:
 *  未超上限 → requeue 回 queued;已达上限 → 终结 failed 并返回 diagnosisId 让调用方发 diagnosis_unavailable + 退预留额度。
 *  状态翻转与 lease 过期判定同一条原子 UPDATE,杜绝 heartbeat-vs-reap TOCTOU。 */
export async function sweepStuckDiagnosisJobs(
  c: Client, owner: string, maxAttempts = MAX_DIAGNOSIS_JOB_ATTEMPTS,
): Promise<{ requeued: number; failed: number; failedDiagnoses: string[] }> {
  const dead = await c.query(
    `UPDATE diagnosis_job SET status='failed', last_error='reaped:worker_died', lease_owner=NULL, version=version+1
       WHERE owner_user_id=$1 AND status='running' AND lease_expires_at < now() AND attempts >= $2
     RETURNING diagnosis_id`, [owner, maxAttempts]);
  const rq = await c.query(
    `UPDATE diagnosis_job SET status='queued', lease_owner=NULL, version=version+1
       WHERE owner_user_id=$1 AND status='running' AND lease_expires_at < now() AND attempts < $2`,
    [owner, maxAttempts]);
  return { requeued: rq.rowCount ?? 0, failed: dead.rowCount ?? 0, failedDiagnoses: dead.rows.map((x) => x.diagnosis_id as string) };
}
