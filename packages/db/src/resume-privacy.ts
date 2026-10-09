/**
 * @meetwise/db · resume S1 软删受理（UNSTUB-ERASE rev2 · D6 最低集）。
 *
 * 这里只是 0152 `privacy_begin_resume_soft_delete`（SECURITY DEFINER · 唯一受审
 * 墓碑写入路径）的薄包装。**不是删除完成宣称**：本地围栏（停止处理与访问）即时
 * 生效；物理清除走 S2 已登记的 claim/purge worker——S1 期 `purgePending` 恒真。
 */
import type { PoolClient as Client } from 'pg';

export interface ResumeSoftDeleteReceipt {
  requestId: string;
  resumeId: string;
  /** 同一 (owner, resume) 重复受理 → true（同 requestId，不建第二份账）。 */
  alreadyFenced: boolean;
  /** 墓碑时间戳（行级 `erasure_requested_at`）。 */
  fencedAt: string | null;
}

export async function beginResumeSoftDelete(c: Client, owner: string, resumeId: string): Promise<ResumeSoftDeleteReceipt> {
  const r = await c.query<{
    request_id: string; resume_id: string; already_fenced: boolean; fenced_at: string | null;
  }>('SELECT * FROM privacy_begin_resume_soft_delete($1,$2)', [owner, resumeId]);
  const row = r.rows[0];
  if (!row?.request_id || !row?.resume_id) {
    throw Object.assign(new Error('resume_soft_delete_unavailable'), { code: 'resume_soft_delete_unavailable' });
  }
  return {
    requestId: row.request_id,
    resumeId: row.resume_id,
    alreadyFenced: row.already_fenced === true,
    fencedAt: row.fenced_at ?? null,
  };
}
