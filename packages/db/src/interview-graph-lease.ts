/**
 * 同一面试图执行的双层 fencing。
 *
 * PostgreSQL session advisory lock 覆盖整个 graph invoke（真正串行化 checkpoint 写）；
 * ai_graph_run 的 lease/version 留下可审计 fence，并在旧进程消失后由 TTL 允许接管。
 */
import type { PoolClient as Client } from 'pg';
import { asPrincipal, type DbPool } from './principal.ts';

const GRAPH_NAME = 'adaptive-interview';
const LEASE_SECONDS = 120;

export interface InterviewGraphFence { owner: string; interviewId: string; leaseOwner: string; version: number }

export async function withInterviewGraphFence<T>(
  pool: DbPool, owner: string, interviewId: string, leaseOwner: string, fn: (fence: InterviewGraphFence) => Promise<T>,
): Promise<{ acquired: true; value: T } | { acquired: false }> {
  const lock = await pool.connect();
  let held = false;
  let fence: InterviewGraphFence | null | undefined;
  try {
    const got = await lock.query('SELECT pg_try_advisory_lock(hashtext($1),hashtext($2)) AS ok', [GRAPH_NAME, `${owner}:${interviewId}`]);
    if (!got.rows[0]?.ok) return { acquired: false };
    held = true;
    fence = await asPrincipal(pool, owner, async (c) => {
      const current = await c.query(
        `SELECT run_id,version,lease_owner,lease_expires_at FROM ai_graph_run
          WHERE graph_name=$1 AND thread_id=$2 AND owner_user_id=$3 ORDER BY version DESC LIMIT 1 FOR UPDATE`,
        [GRAPH_NAME, interviewId, owner],
      );
      if (current.rowCount === 0) {
        const ins = await c.query(
          `INSERT INTO ai_graph_run(graph_name,thread_id,owner_user_id,status,version,lease_owner,lease_expires_at)
             VALUES ($1,$2,$3,'active',1,$4,now()+($5||' seconds')::interval) RETURNING version`,
          [GRAPH_NAME, interviewId, owner, leaseOwner, String(LEASE_SECONDS)],
        );
        return { owner, interviewId, leaseOwner, version: Number(ins.rows[0].version) };
      }
      const row = current.rows[0];
      if (row.lease_owner && row.lease_owner !== leaseOwner && new Date(row.lease_expires_at).getTime() >= Date.now()) return null;
      const upd = await c.query(
        `UPDATE ai_graph_run SET status='active',lease_owner=$4,lease_expires_at=now()+($5||' seconds')::interval,version=version+1
          WHERE run_id=$1 AND owner_user_id=$2 AND version=$3 RETURNING version`,
        [row.run_id, owner, row.version, leaseOwner, String(LEASE_SECONDS)],
      );
      return upd.rowCount === 1 ? { owner, interviewId, leaseOwner, version: Number(upd.rows[0].version) } : null;
    });
    if (!fence) return { acquired: false };
    const value = await fn(fence);
    return { acquired: true, value };
  } finally {
    // 无论 invoke/projection 是否抛错都主动让出 durable lease。真正进程崩溃时 finally
    // 不会执行，TTL 才负责接管；正常异常若留下 120s lease 会把可重试错误误变成停摆。
    if (fence) await asPrincipal(pool, owner, (c) => releaseInterviewGraphFence(c, fence!)).catch(() => undefined);
    if (held) await lock.query('SELECT pg_advisory_unlock(hashtext($1),hashtext($2))', [GRAPH_NAME, `${owner}:${interviewId}`]).catch(() => undefined);
    lock.release();
  }
}

/** 业务投影前可调用；fence 版本不一致即代表失去推进权。 */
export async function assertInterviewGraphFence(c: Client, fence: InterviewGraphFence): Promise<boolean> {
  const r = await c.query(
    `SELECT 1 FROM ai_graph_run WHERE graph_name=$1 AND thread_id=$2 AND owner_user_id=$3
      AND lease_owner=$4 AND version=$5 AND lease_expires_at >= now()`,
    [GRAPH_NAME, fence.interviewId, fence.owner, fence.leaseOwner, fence.version],
  );
  return r.rowCount === 1;
}

/** 长模型调用期间续租；版本/owner/未过期三项都相同才允许续，绝不复活已失去的 fence。 */
export async function renewInterviewGraphFence(c: Client, fence: InterviewGraphFence): Promise<boolean> {
  const r = await c.query(
    `UPDATE ai_graph_run SET lease_expires_at=now()+($6||' seconds')::interval
      WHERE graph_name=$1 AND thread_id=$2 AND owner_user_id=$3 AND lease_owner=$4 AND version=$5
        AND lease_expires_at >= now()`,
    [GRAPH_NAME, fence.interviewId, fence.owner, fence.leaseOwner, fence.version, String(LEASE_SECONDS)],
  );
  return r.rowCount === 1;
}

export async function releaseInterviewGraphFence(c: Client, fence: InterviewGraphFence): Promise<void> {
  await c.query(
    `UPDATE ai_graph_run SET lease_owner=NULL,lease_expires_at=NULL,status='waiting_user'
      WHERE graph_name=$1 AND thread_id=$2 AND owner_user_id=$3 AND lease_owner=$4 AND version=$5`,
    [GRAPH_NAME, fence.interviewId, fence.owner, fence.leaseOwner, fence.version],
  );
}
