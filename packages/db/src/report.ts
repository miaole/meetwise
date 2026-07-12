/**
 * @meetwise/db · report job ops — 报告子图舱壁的**持久 job 侧**（状态机 + 租约 + 重试）。
 * 报告作为独立后台 job：面试完成只做一次幂等 enqueue（不阻塞、不等报告）；worker 异步 claim 跑;失败不碰 interview。
 */
import type { PoolClient as Client } from 'pg';

export type ReportStatus = 'queued' | 'running' | 'ready' | 'failed' | 'quarantined';
const DEFAULT_LEASE_SECONDS = 120;
/** 重试上限：超过 → 隔离转人工(quarantined),不再无限重试/崩溃循环（审计 S1/S2:poison-pill 兜底）。 */
export const MAX_REPORT_ATTEMPTS = 3;

/** 面试完成时 enqueue 报告 job（幂等：一场面试一份;重复 enqueue 返回既有,不重排）。 */
export async function enqueueReport(c: Client, owner: string, interviewId: string): Promise<{ reportId: string; created: boolean }> {
  const ins = await c.query(
    `INSERT INTO ai_report(owner_user_id, interview_id) VALUES ($1,$2)
     ON CONFLICT (owner_user_id, interview_id) DO NOTHING RETURNING id`, [owner, interviewId]);
  if (ins.rowCount === 1) return { reportId: ins.rows[0].id, created: true };
  const ex = await c.query('SELECT id FROM ai_report WHERE owner_user_id=$1 AND interview_id=$2', [owner, interviewId]);
  return { reportId: ex.rows[0].id, created: false };
}

/** worker 领取一个可跑的报告（queued,或租约过期的 running——崩溃兜底,但 attempts 未超上限才再领,否则留给 sweeper 隔离）。
 *  CAS→running + 租约 + attempts++,FOR UPDATE SKIP LOCKED 防并发双跑、不抢活租约。**model 必须在本事务提交后、事务外跑**(审计 S1:勿持连接/锁过模型调用)。 */
export async function claimReport(
  c: Client, owner: string, leaseOwner: string,
  leaseSeconds: number = DEFAULT_LEASE_SECONDS, maxAttempts: number = MAX_REPORT_ATTEMPTS,
): Promise<{ reportId: string; interviewId: string; attempts: number } | null> {
  const r = await c.query(
    `UPDATE ai_report SET status='running', lease_owner=$2, lease_expires_at=now()+($3||' seconds')::interval, attempts=attempts+1, version=version+1
       WHERE id = (
         SELECT id FROM ai_report
          WHERE owner_user_id=$1
            AND (status='queued' OR (status='running' AND lease_expires_at < now() AND attempts < $4))
          ORDER BY created_at ASC FOR UPDATE SKIP LOCKED LIMIT 1)
     RETURNING id, interview_id, attempts`, [owner, leaseOwner, String(leaseSeconds), maxAttempts]);
  if (r.rowCount === 0) return null;
  return { reportId: r.rows[0].id, interviewId: r.rows[0].interview_id, attempts: r.rows[0].attempts };
}

/** 报告成功：running→ready + content（仅持租约者,CAS）。 */
export async function markReportReady(c: Client, owner: string, reportId: string, leaseOwner: string, content: unknown): Promise<boolean> {
  const r = await c.query(
    `UPDATE ai_report SET status='ready', content=$4, lease_owner=NULL, version=version+1
       WHERE id=$1 AND owner_user_id=$2 AND status='running' AND lease_owner=$3`,
    [reportId, owner, leaseOwner, JSON.stringify(content)]);
  return r.rowCount === 1;
}

/** 报告失败：running→failed + last_error + 指数退避 next_attempt_at（**不碰 interview**——舱壁:报告失败不影响面试结果）。 */
export async function markReportFailed(c: Client, owner: string, reportId: string, leaseOwner: string, error: string): Promise<boolean> {
  const r = await c.query(
    `UPDATE ai_report SET status='failed', last_error=$4, lease_owner=NULL, version=version+1,
            next_attempt_at = now() + make_interval(secs => least(power(2, attempts)::int, 300))   -- 2^attempts 秒,封顶 5min
       WHERE id=$1 AND owner_user_id=$2 AND status='running' AND lease_owner=$3`,
    [reportId, owner, leaseOwner, error.slice(0, 500)]);
  return r.rowCount === 1;
}

/** 手动重排单个失败报告（failed→queued）。批量/自动走 sweepReports。 */
export async function requeueFailedReport(c: Client, owner: string, reportId: string): Promise<boolean> {
  const r = await c.query(
    "UPDATE ai_report SET status='queued', lease_owner=NULL, version=version+1 WHERE id=$1 AND owner_user_id=$2 AND status='failed'",
    [reportId, owner]);
  return r.rowCount === 1;
}

/**
 * 报告对账 sweeper（周期后台跑,审计 S1/S2:failed 不能是无人跟进的死胡同、崩溃循环不能无界）：
 *  - 未超上限的 failed → 重排 queued 重试;
 *  - 超上限的 failed,以及 attempts 已超上限却卡 running(租约过期=worker 崩在跑) → quarantined 终态转人工。
 * 这样 poison-pill 最多跑 maxAttempts 次就被隔离,且没有报告永远卡 running/failed。
 */
export async function sweepReports(
  c: Client, owner: string, maxAttempts: number = MAX_REPORT_ATTEMPTS,
): Promise<{ requeued: number; quarantined: number; quarantinedInterviews: string[] }> {
  const q = await c.query(
    `UPDATE ai_report SET status='quarantined', lease_owner=NULL, version=version+1
       WHERE owner_user_id=$1 AND attempts >= $2
         AND (status='failed' OR (status='running' AND lease_expires_at < now()))
     RETURNING interview_id`, [owner, maxAttempts]);    // 返回被隔离的面试 → 调用方发 report_unavailable 终态事件（防前端无限转圈）
  const r = await c.query(
    `UPDATE ai_report SET status='queued', lease_owner=NULL, version=version+1
       WHERE owner_user_id=$1 AND status='failed' AND attempts < $2
         AND (next_attempt_at IS NULL OR next_attempt_at <= now())`, [owner, maxAttempts]); // 退避未到不重排
  return { requeued: r.rowCount ?? 0, quarantined: q.rowCount ?? 0, quarantinedInterviews: q.rows.map((x) => x.interview_id) };
}

export async function getReport(c: Client, owner: string, interviewId: string): Promise<{ status: ReportStatus; content: unknown; attempts: number } | null> {
  const r = await c.query('SELECT status, content, attempts FROM ai_report WHERE owner_user_id=$1 AND interview_id=$2', [owner, interviewId]);
  if (r.rowCount === 0) return null;
  return { status: r.rows[0].status, content: r.rows[0].content, attempts: r.rows[0].attempts };
}
