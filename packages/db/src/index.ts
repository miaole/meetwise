/**
 * @meetwise/db — 数据访问层 + 四生产原语（DAG 最底层，零业务、零模型依赖）。
 *
 * 原语①  asPrincipal      RLS principal 绑定：非 owner app_role + set_config 绑定参数（FORCE RLS 生效，无 GUC 注入）
 * 原语②  casTransition    状态机 CAS：条件更新 + version 自增（陈旧落败=0 行）
 * 原语③  appendEvent      durable ordered event log：advisory 事务锁串行 + INSERT…SELECT MAX+1 RETURNING seq（原子分配）
 * 原语④  acquire/releaseLease  租约：防裂脑并发（过期可抢占）
 * idempotency 由 SQL 层 UNIQUE(owner_user_id, idempotency_key) + ON CONFLICT DO NOTHING 表达（见 sql/01_schema.sql）。
 *
 * 这些原语此前散在 kernel/demo.ts 与 apps/api/db.service.ts 两份手抄实现里——现收敛为单一真相。
 */
import pkg from 'pg';

const { Pool } = pkg;
export type Client = pkg.PoolClient;
export type DbPool = pkg.Pool;

export interface PoolOverrides {
  host?: string; port?: number; user?: string; password?: string; database?: string; max?: number;
}

/** 连接池工厂：env 优先、dev 默认兜底。集中此处，杜绝连接配置在多个 spike 里散抄。 */
export function createPool(o: PoolOverrides = {}): DbPool {
  return new Pool({
    host: o.host ?? process.env.PGHOST ?? '127.0.0.1',
    port: o.port ?? Number(process.env.PGPORT ?? 54329),
    user: o.user ?? process.env.PGUSER ?? 'meetwise',
    password: o.password ?? process.env.PGPASSWORD ?? 'meetwise_dev_password',
    database: o.database ?? process.env.PGDATABASE ?? 'meetwise',
    max: Number(process.env.PGPOOL_MAX ?? o.max ?? 8),
    // HA(修审计 F6):无超时则一条病态查询/idle-in-transaction 能拖死整池 → 生产级零优雅降级的经典事故。
    statement_timeout: Number(process.env.PG_STATEMENT_TIMEOUT_MS ?? 15000),                       // 单条语句上限
    idle_in_transaction_session_timeout: Number(process.env.PG_IDLE_TX_TIMEOUT_MS ?? 15000),        // 事务内挂死自动断
    connectionTimeoutMillis: Number(process.env.PG_CONN_TIMEOUT_MS ?? 5000),                        // 取连接上限(池满快速失败)
    idleTimeoutMillis: Number(process.env.PG_IDLE_TIMEOUT_MS ?? 30000),                             // 空闲连接回收
  });
}

/** 原语①：请求路径事务——非 owner app_role + principal 上下文（RLS/FORCE 生效）。所有业务读写都走它。 */
export async function asPrincipal<T>(pool: DbPool, user: string, fn: (c: Client) => Promise<T>): Promise<T> {
  const c = await pool.connect();
  try {
    await c.query('BEGIN');
    await c.query('SET LOCAL ROLE app_role');
    await c.query("SELECT set_config('app.principal_user', $1, true)", [user]); // 绑定参数，无 GUC 注入
    const r = await fn(c);
    await c.query('COMMIT');
    return r;
  } catch (e) { await c.query('ROLLBACK'); throw e; } finally { c.release(); }
}

/** 原语②：状态机 CAS——仅当当前态 == from 时迁移到 to 并 version+1，返回是否生效（陈旧落败=0 行）。 */
export async function casTransition(c: Client, id: string, from: string, to: string): Promise<boolean> {
  const r = await c.query('UPDATE interview SET status=$3, version=version+1 WHERE id=$1 AND status=$2', [id, from, to]);
  return r.rowCount === 1;
}

/** 原语③：durable ordered event log——同 stream advisory 事务锁串行 + INSERT…SELECT MAX+1，返回分配到的 seq。 */
export async function appendEvent(c: Client, owner: string, stream: string, kind: string, payload: unknown): Promise<number> {
  await c.query('SELECT pg_advisory_xact_lock(hashtext($1))', [stream]);
  const r = await c.query(
    `INSERT INTO interview_event(owner_user_id,stream_key,seq,kind,payload)
     SELECT $1,$2,COALESCE(MAX(seq),0)+1,$3,$4 FROM interview_event WHERE stream_key=$2
     RETURNING seq`, [owner, stream, kind, JSON.stringify(payload)]);
  return Number(r.rows[0].seq);
}

/** 原语④：抢租约——空或已过期才能抢（防裂脑并发推进）。 */
export async function acquireLease(c: Client, threadId: string, leaseOwner: string): Promise<boolean> {
  const r = await c.query(
    `UPDATE ai_graph_run SET lease_owner=$2, lease_expires_at=now()+interval '30 seconds', version=version+1
       WHERE thread_id=$1 AND (lease_owner IS NULL OR lease_expires_at < now())`, [threadId, leaseOwner]);
  return r.rowCount === 1;
}

export async function releaseLease(c: Client, threadId: string, leaseOwner: string): Promise<void> {
  await c.query('UPDATE ai_graph_run SET lease_owner=NULL WHERE thread_id=$1 AND lease_owner=$2', [threadId, leaseOwner]);
}

// commerce saga（共享权益池 reserve/confirm/release + 租约心跳 + 结算消费者 + 对账）
export {
  reserveEntitlement, confirmConsumption, releaseConsumption, availableUnits,
  renewReservationLease, sweepExpiredReservations, settleOutbox, reconcile,
  MIN_UNIT, DEFAULT_LEASE_SECONDS,
} from './commerce.ts';
export type { Allocation, ReserveResult, ConfirmResult, ReleaseResult, SweptReservation } from './commerce.ts';

// 招聘方(B 端)岗位仓储(多租户 RLS 隔离)+ 候选人申请闭环(多方 RLS)
export {
  createJob, listJobs, getJob, closeJob,
  listOpenJobs, applyToJob, listMyApplications, listJobCandidates, finalizeApplication,
  inviteCandidate, startApplicationInterview, declineInvitation, listTalentPool,
} from './recruiter.ts';
export type { JobPosting, JobApplication, TalentRow, TalentQuery } from './recruiter.ts';

// resume 存储 ops（S2 摄取存储侧：加密原文 + 状态机 + 脱敏 profile）
export {
  createResumeWithBlob, transitionResume, persistResumeProfile, completeIngestion, failIngestion,
  decryptResumeBlob, contentDigest, RESUME_KEY_VERSION,
} from './resume.ts';
export type { ResumeStatus, IngestedProfile } from './resume.ts';

// report job ops（报告子图舱壁：持久 job + 状态机 + 租约 + 重试）
export {
  enqueueReport, claimReport, markReportReady, markReportFailed, requeueFailedReport, sweepReports, getReport,
  MAX_REPORT_ATTEMPTS,
} from './report.ts';
export type { ReportStatus } from './report.ts';

// 面试 job 队列（api 入队 / worker 消费）+ 心跳续租 + reaper 收割孤儿 running
export {
  enqueueInterviewJob, claimNextInterviewJob, markJobDone, markJobFailed, enumerateOwnersWithJobs,
  renewInterviewJobLease, sweepStuckInterviewJobs, MAX_INTERVIEW_JOB_ATTEMPTS,
} from './interview-jobs.ts';
export type { JobKind } from './interview-jobs.ts';

// 押题(resume-quiz)生成 job 队列（api 入队 / worker 消费）+ 心跳续租 + reaper 收割
export {
  enqueueQuizJob, claimNextQuizJob, markQuizJobDone, markQuizJobFailed,
  renewQuizJobLease, sweepStuckQuizJobs, MAX_QUIZ_JOB_ATTEMPTS,
} from './quiz-jobs.ts';

// 简历诊断(resume-diagnosis)生成 job 队列（api 入队 / worker 消费）+ 心跳续租 + reaper 收割
export {
  enqueueDiagnosisJob, claimNextDiagnosisJob, markDiagnosisJobDone, markDiagnosisJobFailed,
  renewDiagnosisJobLease, sweepStuckDiagnosisJobs, MAX_DIAGNOSIS_JOB_ATTEMPTS,
} from './diagnosis-jobs.ts';

// 生产向量库（pgvector HNSW）
export { upsertVectorChunk, annSearch } from './retrieval-store.ts';

// 长期记忆存储
export { insertMemory, getMemoriesByRefIds, episodeSeen } from './memory-store.ts';
export type { MemoryKind, MemoryRow } from './memory-store.ts';

// 支付订单（幂等入账）
export { createOrder, getOrder, markOrderPaidAndCredit } from './payment.ts';
export type { CreditResult } from './payment.ts';

// 站内通知
export { insertNotification, listNotifications, markNotificationRead, markAllNotificationsRead, unreadCount } from './notification.ts';

// 版本化迁移运行器
export { runMigrations, loadMigrations } from './migrate.ts';
export type { Migration } from './migrate.ts';

// admin 审计(append-only)
export { appendAudit, listAudit } from './audit.ts';
