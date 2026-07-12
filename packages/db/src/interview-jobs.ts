/**
 * @meetwise/db · 面试 job 队列 ops（api 入队 / worker 消费）。同面试内按 seq 保序;租约防并发双跑、崩溃可重领。
 */
import type { PoolClient as Client } from 'pg';

export type JobKind = 'start' | 'answer';
const LEASE_SECONDS = 120;
/** claim 续领上限 = reaper 终结边界（单一真相,claim 与 sweep 共用,杜绝 off-by-one 死循环/早夭）。 */
export const MAX_INTERVIEW_JOB_ATTEMPTS = 5;

/** 入队 job（api 用）。answer 用 seq 保证按答题顺序消费。**幂等**:同面试同题(owner+interview+kind+seq)重复提交 → 不新建,返已存在 job(防双提交错位)。 */
export async function enqueueInterviewJob(
  c: Client, owner: string, interviewId: string, kind: JobKind, payload: unknown, seq = 0,
): Promise<string> {
  const r = await c.query(
    `INSERT INTO interview_job(owner_user_id, interview_id, kind, seq, payload) VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (owner_user_id, interview_id, kind, seq) DO NOTHING RETURNING id`,
    [owner, interviewId, kind, seq, JSON.stringify(payload)]);
  if (r.rowCount === 1) return r.rows[0].id;
  // 冲突=重复提交同一题 → 返回已存在 job(幂等,不重复入队 → worker 不会二次 resume 错位)
  const ex = await c.query('SELECT id FROM interview_job WHERE owner_user_id=$1 AND interview_id=$2 AND kind=$3 AND seq=$4', [owner, interviewId, kind, seq]);
  return ex.rows[0].id;
}

/** 领取下一个可跑 job（FIFO by seq,created_at;租约过期可重领,但**同面试有 running 的不领**——保序、防并发推同一图）。 */
export async function claimNextInterviewJob(
  c: Client, owner: string, leaseOwner: string, maxAttempts = MAX_INTERVIEW_JOB_ATTEMPTS,
): Promise<{ id: string; interviewId: string; kind: JobKind; seq: number; payload: any; attempts: number } | null> {
  const r = await c.query(
    `UPDATE interview_job SET status='running', lease_owner=$2, lease_expires_at=now()+($3||' seconds')::interval, attempts=attempts+1, version=version+1
       WHERE id = (
         SELECT j.id FROM interview_job j
          WHERE j.owner_user_id=$1
            AND (j.status='queued' OR (j.status='running' AND j.lease_expires_at < now() AND j.attempts < $4))
            AND NOT EXISTS (SELECT 1 FROM interview_job r WHERE r.interview_id=j.interview_id AND r.status='running' AND r.lease_expires_at >= now())
            -- 僵尸兄弟守卫(专家审计 F3):同面试任一 job 已终态 failed → 面试已死(已发 interview_unavailable+退款),
            -- 绝不再领其后续 seq job(否则对已宣告不可用/已退款的面试乱序跑答题 → 重复假终态 + churn)。
            AND NOT EXISTS (SELECT 1 FROM interview_job f WHERE f.interview_id=j.interview_id AND f.status='failed')
          ORDER BY j.seq ASC, j.created_at ASC FOR UPDATE SKIP LOCKED LIMIT 1)
     RETURNING id, interview_id, kind, seq, payload, attempts`, [owner, leaseOwner, String(LEASE_SECONDS), maxAttempts]);
  if (r.rowCount === 0) return null;
  const x = r.rows[0];
  return { id: x.id, interviewId: x.interview_id, kind: x.kind, seq: x.seq, payload: x.payload, attempts: x.attempts };
}

export async function markJobDone(c: Client, owner: string, jobId: string, leaseOwner: string): Promise<boolean> {
  const r = await c.query("UPDATE interview_job SET status='done', lease_owner=NULL, version=version+1 WHERE id=$1 AND owner_user_id=$2 AND status='running' AND lease_owner=$3", [jobId, owner, leaseOwner]);
  return r.rowCount === 1;
}
export async function markJobFailed(c: Client, owner: string, jobId: string, leaseOwner: string, error: string): Promise<boolean> {
  const r = await c.query("UPDATE interview_job SET status='failed', last_error=$4, lease_owner=NULL, version=version+1 WHERE id=$1 AND owner_user_id=$2 AND status='running' AND lease_owner=$3", [jobId, owner, leaseOwner, error.slice(0, 500)]);
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
