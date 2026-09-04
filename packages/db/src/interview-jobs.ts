/**
 * @meetwise/db · 面试 job 队列 ops（api 入队 / worker 消费）。同面试内按 seq 保序;租约防并发双跑、崩溃可重领。
 */
import type { PoolClient as Client } from 'pg';
import { assertInterviewPrivacyActive } from './checkpoint-privacy.ts';
import {
  assertInterviewAnswerLegacyPlaintextAllowed, plaintextAnswerIdentity, remapInterviewAnswerDualWriteError,
} from './interview-answer-dual-write.ts';

export type JobKind = 'start' | 'answer';
const LEASE_SECONDS = 120;
/** 当前可运行的面试简历引用版本。49/50/NULL 只允许被 worker 安全终结。 */
export const INTERVIEW_RESUME_REFERENCE_VERSION = 64;
/** claim 续领上限 = reaper 终结边界（单一真相,claim 与 sweep 共用,杜绝 off-by-one 死循环/早夭）。 */
export const MAX_INTERVIEW_JOB_ATTEMPTS = 5;

/** 入队 job（api 用）。answer 用 seq 保证按答题顺序消费。**幂等**:同面试同题(owner+interview+kind+seq)重复提交 → 不新建,返已存在 job(防双提交错位)。 */
export async function enqueueInterviewJob(
  c: Client, owner: string, interviewId: string, kind: JobKind, payload: unknown, seq = 0,
): Promise<string> {
  // Holds the per-interview transaction advisory lock until commit.  The
  // privacy delete path takes the same lock, so it either observes and
  // redacts this row or commits first and makes the insert fail before any
  // payload is persisted.
  await assertInterviewPrivacyActive(c, interviewId);
  // The parent interview is the sole source of truth.  Never accept a source
  // id/epoch from a caller or JSON payload: a stale client could otherwise
  // attach a task to another resume generation.  Answer jobs retain only the
  // authorization epoch (not a resume locator) so the durable job can prove
  // it belongs to this exact parent snapshot.
  const parent = await c.query<{ resume_id: string; resume_privacy_epoch: number }>(
    `SELECT i.resume_id::text, i.resume_privacy_epoch
       FROM interview i
       JOIN resume r ON r.id=i.resume_id AND r.owner_user_id=i.owner_user_id
      WHERE i.id=$1
        AND i.owner_user_id=$2
        AND i.resume_id IS NOT NULL
        AND i.resume_privacy_epoch IS NOT NULL
        AND r.status='ingested'
        AND r.privacy_epoch=i.resume_privacy_epoch
      FOR KEY SHARE OF i, r`, [interviewId, owner],
  );
  if (parent.rowCount !== 1) {
    throw Object.assign(new Error('interview_resume_reference_unavailable'), { code: 'interview_resume_reference_unavailable' });
  }
  const reference = parent.rows[0]!;
  const sourceResumeId = kind === 'start' ? reference.resume_id : null;
  const sourceEpoch = Number(reference.resume_privacy_epoch);
  // 0126 双写互斥：有 ledger artifact 时禁止再持久化顶层 answer 键。kind 不豁免
  //（start 带 answer 同样拦截）。无 answer 键不受影响。触发器是安全边界；
  // 这里先调同一 SECURITY DEFINER，错误码与 raw SQL 一致。
  const identity = plaintextAnswerIdentity(payload);
  if (identity) {
    await assertInterviewAnswerLegacyPlaintextAllowed(c, interviewId, identity.questionId, identity.stateVersion);
  }
  let r;
  try {
    r = await c.query(
      `INSERT INTO interview_job(owner_user_id, interview_id, kind, seq, payload, resume_id, resume_privacy_epoch, reference_schema_version)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         ON CONFLICT (owner_user_id, interview_id, kind, seq) DO NOTHING RETURNING id`,
      [owner, interviewId, kind, seq, JSON.stringify(payload), sourceResumeId, sourceEpoch, INTERVIEW_RESUME_REFERENCE_VERSION]);
  } catch (error) {
    remapInterviewAnswerDualWriteError(error);
  }
  if (r.rowCount === 1) return r.rows[0].id;
  // A unique-key conflict is idempotent only for the same v64 parent epoch.
  // Returning an old v50/NULL row would falsely report a safe retry while the
  // worker later terminates it, and attempting an in-place upgrade would
  // violate the no-guess legacy rule.
  const ex = await c.query<{ id: string }>(
    `SELECT id
       FROM interview_job
      WHERE owner_user_id=$1 AND interview_id=$2 AND kind=$3 AND seq=$4
        AND reference_schema_version=$5
        AND resume_privacy_epoch=$6
        AND (
          (kind='start' AND resume_id=$7)
          OR (kind='answer' AND resume_id IS NULL)
        )`,
    [owner, interviewId, kind, seq, INTERVIEW_RESUME_REFERENCE_VERSION, sourceEpoch, reference.resume_id],
  );
  if (ex.rowCount !== 1) {
    throw Object.assign(new Error('interview_job_reference_epoch_conflict'), { code: 'interview_job_reference_epoch_conflict' });
  }
  return ex.rows[0]!.id;
}

/** 领取下一个可跑 job（FIFO by seq,created_at;租约过期可重领,但**同面试有 running 的不领**——保序、防并发推同一图）。 */
export type ClaimedInterviewJob = {
  id: string;
  interviewId: string;
  kind: JobKind;
  seq: number;
  resumeId: string | null;
  resumePrivacyEpoch: number | null;
  referenceSchemaVersion: number | null;
  attempts: number;
};

/**
 * Claim returns metadata only.  Old queue rows may contain `resumeRaw` or
 * other historical PII in JSON; a worker must decide the v50 reference gate
 * before that JSON can cross the database process boundary.
 */
export async function claimNextInterviewJob(
  c: Client, owner: string, leaseOwner: string, maxAttempts = MAX_INTERVIEW_JOB_ATTEMPTS,
): Promise<ClaimedInterviewJob | null> {
  const r = await c.query(
    `UPDATE interview_job SET status='running', lease_owner=$2, lease_expires_at=now()+($3||' seconds')::interval, attempts=attempts+1, version=version+1
       WHERE id = (
         SELECT j.id FROM interview_job j
          WHERE j.owner_user_id=$1
            AND interview_privacy_active(j.interview_id)
            AND (j.status='queued' OR (j.status='running' AND j.lease_expires_at < now() AND j.attempts < $4))
            AND NOT EXISTS (SELECT 1 FROM interview_job r WHERE r.interview_id=j.interview_id AND r.status='running' AND r.lease_expires_at >= now())
            -- 僵尸兄弟守卫(专家审计 F3):同面试任一 job 已终态 failed → 面试已死(已发 interview_unavailable+退款),
            -- 绝不再领其后续 seq job(否则对已宣告不可用/已退款的面试乱序跑答题 → 重复假终态 + churn)。
            AND NOT EXISTS (SELECT 1 FROM interview_job f WHERE f.interview_id=j.interview_id AND f.status='failed')
          ORDER BY j.seq ASC, j.created_at ASC FOR UPDATE SKIP LOCKED LIMIT 1)
     RETURNING id, interview_id, kind, seq, resume_id, resume_privacy_epoch, reference_schema_version, attempts`, [owner, leaseOwner, String(LEASE_SECONDS), maxAttempts]);
  if (r.rowCount === 0) return null;
  const x = r.rows[0];
  return {
    id: x.id, interviewId: x.interview_id, kind: x.kind, seq: x.seq,
    resumeId: x.resume_id ?? null,
    resumePrivacyEpoch: x.resume_privacy_epoch == null ? null : Number(x.resume_privacy_epoch),
    referenceSchemaVersion: x.reference_schema_version == null ? null : Number(x.reference_schema_version), attempts: x.attempts,
  };
}

export type ClaimedInterviewJobRequestId = { stillClaimed: boolean; requestId?: string };

/** Read only the safe correlation scalar after the reference gate succeeds. */
export async function loadClaimedInterviewJobRequestId(
  c: Client, owner: string, jobId: string, leaseOwner: string,
): Promise<ClaimedInterviewJobRequestId> {
  const r = await c.query<{ request_id: string | null }>(
    `SELECT payload->>'requestId' AS request_id
       FROM interview_job
      WHERE id=$1 AND owner_user_id=$2 AND status='running' AND lease_owner=$3`,
    [jobId, owner, leaseOwner],
  );
  if (r.rowCount !== 1) return { stillClaimed: false };
  const requestId = r.rows[0]?.request_id;
  return { stillClaimed: true, ...(typeof requestId === 'string' && requestId ? { requestId } : {}) };
}

export type ClaimedInterviewAnswerPayload = { stillClaimed: boolean; payload?: unknown };

/**
 * Answer text is intentionally read only after v50 validation and current
 * lease verification.  Start jobs never need this function, so legacy start
 * JSON is never materialized by a consumer.
 */
export async function loadClaimedInterviewAnswerPayload(
  c: Client, owner: string, jobId: string, leaseOwner: string,
): Promise<ClaimedInterviewAnswerPayload> {
  const r = await c.query<{ payload: unknown }>(
    `SELECT payload
       FROM interview_job
      WHERE id=$1 AND owner_user_id=$2 AND kind='answer' AND status='running' AND lease_owner=$3
        AND reference_schema_version=$4
        AND resume_id IS NULL
        AND resume_privacy_epoch IS NOT NULL
        AND interview_privacy_active(interview_job.interview_id)
        AND EXISTS (
          SELECT 1
            FROM interview i
            JOIN resume r ON r.id=i.resume_id AND r.owner_user_id=i.owner_user_id
           WHERE i.id=interview_job.interview_id
             AND i.owner_user_id=interview_job.owner_user_id
             AND i.resume_id IS NOT NULL
             AND i.resume_privacy_epoch=interview_job.resume_privacy_epoch
             AND r.status='ingested'
             AND r.privacy_epoch=i.resume_privacy_epoch
        )`,
    [jobId, owner, leaseOwner, INTERVIEW_RESUME_REFERENCE_VERSION],
  );
  if (r.rowCount !== 1) return { stillClaimed: false };
  return { stillClaimed: true, payload: r.rows[0]?.payload };
}

export async function markJobDone(c: Client, owner: string, jobId: string, leaseOwner: string): Promise<boolean> {
  // An answer is needed only until graph evaluation and business projection
  // have both committed.  A completed durable job keeps its identity/trace but
  // never keeps the plaintext answer for later queue inspection or replay.
  const r = await c.query("UPDATE interview_job SET status='done', lease_owner=NULL, payload=payload-'answer', version=version+1 WHERE id=$1 AND owner_user_id=$2 AND status='running' AND lease_owner=$3", [jobId, owner, leaseOwner]);
  return r.rowCount === 1;
}
export async function markJobFailed(c: Client, owner: string, jobId: string, leaseOwner: string, error: string): Promise<boolean> {
  const r = await c.query("UPDATE interview_job SET status='failed', last_error=$4, lease_owner=NULL, payload=payload-'answer', version=version+1 WHERE id=$1 AND owner_user_id=$2 AND status='running' AND lease_owner=$3", [jobId, owner, leaseOwner, error.slice(0, 500)]);
  return r.rowCount === 1;
}

/** 未取得 graph fence 时归还 job；仅当前 lease owner 可操作，不能把别的 worker 的 job 偷回 queued。 */
export async function requeueInterviewJob(c: Client, owner: string, jobId: string, leaseOwner: string): Promise<boolean> {
  const r = await c.query(
    "UPDATE interview_job SET status='queued', lease_owner=NULL, lease_expires_at=NULL, version=version+1 WHERE id=$1 AND owner_user_id=$2 AND status='running' AND lease_owner=$3",
    [jobId, owner, leaseOwner],
  );
  return r.rowCount === 1;
}

/** 心跳续租（job 运行期间周期调）：仅当 job 仍 running 且租约仍归本机 → 把 lease_expires_at 往后推。
 *  慢但活着的 job 因此不被 reaper 误判崩溃(=防 heartbeat-vs-reap TOCTOU,与 sweepStuckInterviewJobs 同条件互斥)。
 *  返回 false = 已被重领/已终态 → 调用方停止心跳(绝不强续他人租约)。 */
export async function renewInterviewJobLease(
  c: Client, owner: string, jobId: string, leaseOwner: string, leaseSeconds = LEASE_SECONDS,
): Promise<boolean> {
  const r = await c.query(
    `UPDATE interview_job SET lease_expires_at = now() + ($4||' seconds')::interval
       WHERE id=$1 AND owner_user_id=$2 AND status='running' AND lease_owner=$3`,
    [jobId, owner, leaseOwner, String(leaseSeconds)]);
  return r.rowCount === 1;
}

/**
 * Reaper/对账（周期后台跑,北极星:无静默死胡同 + 无额度泄漏）。worker 崩在跑 → job 卡 running 且租约过期：
 *  - 未超上限 → requeue 回 queued(lease NULL,可被重领;attempts 由下次 claim 再自增,故此处不增,杜绝双增早夭);
 *  - 已达上限(poison-pill/反复崩) → 终结为 failed,返回其 interviewId 让调用方发 interview_unavailable 终态事件 + 退预留额度。
 * 关键(镜像 sweepExpiredReservations):状态翻转与 lease 过期判定在**同一条原子 UPDATE**里(行锁下复核 lease_expires_at<now()),
 * 杜绝"刚心跳续约成功却仍被收割"的活 job TOCTOU。 */
export async function sweepStuckInterviewJobs(
  c: Client, owner: string, maxAttempts = MAX_INTERVIEW_JOB_ATTEMPTS,
): Promise<{ requeued: number; failed: number; failedInterviews: string[] }> {
  const dead = await c.query(
    `UPDATE interview_job SET status='failed', last_error='reaped:worker_died', lease_owner=NULL, version=version+1
       WHERE owner_user_id=$1 AND status='running' AND lease_expires_at < now() AND attempts >= $2
     RETURNING interview_id`, [owner, maxAttempts]);
  const rq = await c.query(
    `UPDATE interview_job SET status='queued', lease_owner=NULL, version=version+1
       WHERE owner_user_id=$1 AND status='running' AND lease_expires_at < now() AND attempts < $2`,
    [owner, maxAttempts]);
  return { requeued: rq.rowCount ?? 0, failed: dead.rowCount ?? 0, failedInterviews: dead.rows.map((x) => x.interview_id as string) };
}

/** 枚举有待办 job 的 owner（调度层,需越 RLS;生产用 BYPASSRLS dispatcher 角色,只读 owner_user_id）。 */
export async function enumerateOwnersWithJobs(c: Client): Promise<string[]> {
  const r = await c.query("SELECT DISTINCT owner_user_id FROM interview_job WHERE status='queued' OR (status='running' AND lease_expires_at < now())");
  return r.rows.map((x) => x.owner_user_id as string);
}
