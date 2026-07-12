/**
 * 报告 worker：报告子图舱壁的**生产调度侧**（审计 High 修复:claim/sweep 不能只写不被调度）。
 * drainReportsOnce = 一次 job 的 3 事务生命周期；runReportWorker = 周期 drain + sweep 的常驻循环（main 启动）。
 * 这样 failed/过期 running 真有人周期跟进（重排/重领/隔离），不是写了机制却无人调用。
 */
import {
  asPrincipal, claimReport, markReportReady, markReportFailed, sweepReports, appendEvent, insertNotification, type DbPool,
} from '@meetwise/db';
import { buildReportGraph, type GenerateReport, type InterviewSummary } from '@meetwise/ai-graphs';

export interface ReportWorkerDeps {
  /** 取面试结果摘要（生产从 interview/事件账本聚合；测试注入）。 */
  loadSummary: (owner: string, interviewId: string) => Promise<InterviewSummary> | InterviewSummary;
  /** 生成报告内容（生产由 ai-runtime.invoke 双校验背书,失败应抛）。 */
  generate: GenerateReport;
}

export type DrainOutcome = 'ready' | 'failed' | 'stale' | 'idle';

/** 跑一次可领的报告 job：**tx1 claim-commit → 模型在事务外 → tx2 finalize**（事件 gate 在 CAS,stale 不发事件）。 */
export async function drainReportsOnce(
  pool: DbPool, owner: string, leaseOwner: string, deps: ReportWorkerDeps,
): Promise<DrainOutcome> {
  const claim = await asPrincipal(pool, owner, (c) => claimReport(c, owner, leaseOwner));   // tx1
  if (!claim) return 'idle';
  const summary = await deps.loadSummary(owner, claim.interviewId);
  let report;
  try {
    report = (await buildReportGraph({ generate: deps.generate }).invoke({ summary }))!.report!;  // 模型在事务外
  } catch (e: any) {
    await asPrincipal(pool, owner, (c) => markReportFailed(c, owner, claim.reportId, leaseOwner, e?.message ?? 'err'));
    return 'failed';
  }
  return asPrincipal(pool, owner, async (c) => {                                            // tx2 finalize
    const ok = await markReportReady(c, owner, claim.reportId, leaseOwner, report);
    if (!ok) return 'stale';                                                                 // 租约被抢/已终态 → 不发事件
    await appendEvent(c, owner, claim.interviewId, 'report_ready', { overall: report.overall });
    await insertNotification(c, owner, `ntf_${claim.reportId}`, 'report_ready', { interviewId: claim.interviewId, overall: report.overall }); // 通知用户
    return 'ready';
  });
}

/** 一次对账：重排到期的 failed、隔离超限 poison-pill，并对被隔离的面试发 **report_unavailable 终态事件**
 *  （审计:quarantined 不能是静默死胡同——否则前端永远转圈;发终态事件让前端优雅降级显示"报告暂不可用"）。 */
export async function sweepReportsOnce(pool: DbPool, owner: string) {
  return asPrincipal(pool, owner, async (c) => {
    const res = await sweepReports(c, owner);
    for (const interviewId of res.quarantinedInterviews) {
      await appendEvent(c, owner, interviewId, 'report_unavailable', { reason: 'max_attempts_exceeded' });
    }
    return res;
  });
}

/** 单 owner 抽干：drain 直到空 + sweep。 */
export async function drainOwner(pool: DbPool, owner: string, leaseOwner: string, deps: ReportWorkerDeps) {
  let outcome: DrainOutcome = 'ready';
  while (outcome !== 'idle') outcome = await drainReportsOnce(pool, owner, leaseOwner, deps);
  return sweepReportsOnce(pool, owner);
}

/** 枚举有待办报告的 owner（**调度层基础设施,需越 RLS 看全租户**）：dev 用 superuser 池;
 *  prod 用最小权限 dispatcher 角色（BYPASSRLS,**只读 owner_user_id**,不碰业务数据）。逐 owner 处理仍走 RLS 限定的 principal。 */
export async function enumerateOwnersWithReportWork(pool: DbPool): Promise<string[]> {
  const r = await pool.query(
    `SELECT DISTINCT owner_user_id FROM ai_report
      WHERE status IN ('queued','failed') OR (status='running' AND lease_expires_at < now())`);
  return r.rows.map((x) => x.owner_user_id as string);
}

/** 一拍调度：枚举活跃 owner → 每个 owner 各 drain+sweep（RLS 限定到该 principal）。这才是多租户全队列真排干。 */
export async function dispatchTick(pool: DbPool, leaseOwner: string, deps: ReportWorkerDeps): Promise<{ owners: number }> {
  const owners = await enumerateOwnersWithReportWork(pool);
  for (const owner of owners) await drainOwner(pool, owner, leaseOwner, deps);
  return { owners: owners.length };
}

/** 常驻调度循环：周期 dispatchTick。stop() 优雅退出。main 启动它即让报告队列在生产真被排干。 */
export function runReportDispatcher(pool: DbPool, leaseOwner: string, deps: ReportWorkerDeps, intervalMs = 2000) {
  let stopped = false;
  const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
  (async () => {
    while (!stopped) {
      await dispatchTick(pool, leaseOwner, deps);
      if (!stopped) await sleep(intervalMs);
    }
  })().catch((e) => console.error('report dispatcher loop error', e));
  return { stop() { stopped = true; } };
}
