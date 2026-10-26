/**
 * interview_event 保留期清扫（progress-write 件③ TTL 留槽承接·event-ttl 刀件②）。
 *
 * 只经 SECURITY DEFINER `interview_event_retention_purge(keep_days, batch_cap)` 到达
 * （0219·definer=event_retention_worker·批删 kind 恰 4 值 ephemeral 族 progress/
 * generation_started/model_first_token/generation_progress 且 created_at 早于保留期的行）。
 * app_role 对 interview_event 保持无 DELETE（0096:255 REVOKE 纪律零破坏）——清除只经 0219
 * SECURITY DEFINER 函数（0208 additive 释放臂放行·专用 GUC app.event_ttl_sweep 事务局域）。
 * business 终态 kind（question_ready/answer_evaluated/report_ready 等）永久划出清扫域。
 *
 * 天数 30..3650、批大小 1..10000，越界即抛（SQL 侧 fail-closed 同域·0219 界检查双面）。
 */
import type { Client } from '../principal.ts';

const INTERVIEW_EVENT_RETENTION_MIN_KEEP_DAYS = 30;
const INTERVIEW_EVENT_RETENTION_MAX_KEEP_DAYS = 3650;
const INTERVIEW_EVENT_RETENTION_MIN_BATCH = 1;
const INTERVIEW_EVENT_RETENTION_MAX_BATCH = 10000;

/**
 * interview_event 行按保留期分批删除。只经 SECURITY DEFINER 函数到达，
 * app_role 对 interview_event 仍无 DELETE。天数 30..3650，批大小 1..10000，越界即抛。
 */
export async function purgeExpiredInterviewEvents(c: Client, keepDays: number, batchCap: number): Promise<number> {
  if (!Number.isSafeInteger(keepDays) || keepDays < INTERVIEW_EVENT_RETENTION_MIN_KEEP_DAYS || keepDays > INTERVIEW_EVENT_RETENTION_MAX_KEEP_DAYS
    || !Number.isSafeInteger(batchCap) || batchCap < INTERVIEW_EVENT_RETENTION_MIN_BATCH || batchCap > INTERVIEW_EVENT_RETENTION_MAX_BATCH) {
    throw Object.assign(new Error('interview_event_retention_invalid'), { code: 'interview_event_retention_invalid' });
  }
  const r = await c.query(
    `SELECT interview_event_retention_purge($1, $2) AS purged`,
    [keepDays, batchCap],
  );
  return Number(r.rows[0]?.purged ?? 0);
}
