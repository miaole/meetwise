/**
 * 同一面试图执行的双层 fencing。
 *
 * PostgreSQL 事务级 advisory lock（pg_advisory_xact_lock，与旧 session 锁同键）只
 * 覆盖 begin 竞态窗：事务 COMMIT 即自动释放，不再独占池连接（PgBouncer 事务池
 * 语义下成立；对齐 0037 durable-claim 先例——长模型调用不由事务锁承重）；
 * ai_graph_run 的 lease/version 是 invoke 全程的唯一可审计 fence，并在旧进程消失
 * 后由 TTL 允许接管。
 */
import type { PoolClient as Client } from 'pg';
import { asPrincipal, type DbPool } from '../principal.ts';

const GRAPH_NAME = 'adaptive-interview';
const LEASE_SECONDS = 120;

export interface InterviewGraphFence { owner: string; interviewId: string; leaseOwner: string; version: number }

export async function withInterviewGraphFence<T>(
  pool: DbPool, owner: string, interviewId: string, leaseOwner: string, fn: (fence: InterviewGraphFence) => Promise<T>,
): Promise<{ acquired: true; value: T } | { acquired: false }> {
  // 单个短事务：同键事务级锁串行化首 begin 竞态（否则双 INSERT 撞 uq_active_run=粗糙
  // 500）→既有 lease 行 FOR UPDATE/INSERT/CAS 判定→COMMIT 后锁随事务自动释放，
  // 连接即归还池；fn（可含分钟级模型 RPC）在事务外运行，锁不覆盖 invoke 全程。
  const fence = await asPrincipal(pool, owner, async (c) => {
    await c.query('SELECT pg_advisory_xact_lock(hashtext($1),hashtext($2))', [GRAPH_NAME, `${owner}:${interviewId}`]);
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
  try {
    const value = await fn(fence);
    return { acquired: true, value };
  } finally {
    // 无论 invoke/projection 是否抛错都主动让出 durable lease。真正进程崩溃时 finally
    // 不会执行，TTL 才负责接管；正常异常若留下 120s lease 会把可重试错误误变成停摆。
    await asPrincipal(pool, owner, (c) => releaseInterviewGraphFence(c, fence)).catch(() => undefined);
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
