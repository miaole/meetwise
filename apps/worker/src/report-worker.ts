/**
 * 报告 worker：报告子图舱壁的**生产调度侧**（审计 High 修复:claim/sweep 不能只写不被调度）。
 * drainReportsOnce = 一次 job 的 3 事务生命周期；runReportWorker = 周期 drain + sweep 的常驻循环（main 启动）。
 * 这样 failed/过期 running 真有人周期跟进（重排/重领/隔离），不是写了机制却无人调用。
 */
import {
  asPrincipal, assertInterviewPrivacyActive, gatewayDispatchOwners, claimReport, markReportReady, markReportFailed, sweepReports, appendEvent, insertNotification, asErr, type DbPool,
  generateAssessmentReportCore, generateLearningPlanCore, generateCareerPathCore,
} from '@meetwise/db';
import { buildReportGraph, type GenerateReport, type InterviewSummary } from '@meetwise/ai-graphs';
import { runDrainLoop } from './drain-loop.ts';
import { drainOwnersInListedOrder } from './owner-queue-drain.ts';

export interface ReportWorkerDeps {
  /** 取面试结果摘要（生产从 interview/事件账本聚合；测试注入）。 */
  loadSummary: (owner: string, interviewId: string) => Promise<InterviewSummary> | InterviewSummary;
  /** 生成报告内容（生产由 ai-runtime.invoke 双校验背书,失败应抛）。 */
  generate: GenerateReport;
  /**
   * Test seam for the pre-egress privacy proof.  Production composition never
   * supplies this and always calls the database SECURITY DEFINER guard below;
   * legacy narrow-schema unit proofs can supply a no-op because they are not
   * privacy evidence.  The real privacy E2E intentionally exercises default.
   */
  privacyCheck?: (owner: string, interviewId: string) => Promise<void> | void;
  /**
   * Test seam（#204 成长链尽力而为面·同 privacyCheck 先例）：仅 prove 注入段级故障。
   * 生产组合恒不提供——growth 钩子本身是 drainReportsOnce 的硬接线生产默认
   * （「机制必须真被调度」，非可选开关），prove 的 /growth 断言族以默认路径为主形。
   */
  growthFaults?: Partial<Record<GrowthSegment, Error>>;
}

export type DrainOutcome = 'ready' | 'failed' | 'stale' | 'idle';

/** 成长链段名（#204）：评估→学习→职业（后两段依赖评估先行）。 */
export type GrowthSegment = 'assessment' | 'learning' | 'career';

/** 单段结局：generated=落库成功；skipped=结构性跳过（空集/无源）；failed=尽力而为失败（计数）。 */
export type GrowthSegmentOutcome = 'generated' | 'skipped' | 'failed';

/** 成长链一次运行的观测面（结构化计数器：fencedSkipped/failedCount 供日志与收据）。 */
export interface GrowthGenOutcome {
  assessment: GrowthSegmentOutcome;
  learning: GrowthSegmentOutcome;
  career: GrowthSegmentOutcome;
  /** 隐私围栏先赢（删除/撤权竞态）：整链跳过，不产任何成长行。 */
  fencedSkipped: boolean;
  /** 尽力而为失败段计数（0=全净）。 */
  failedCount: number;
}

/**
 * #204 成长链自动生成（D1 形A：tx2 成功后·同一 drain 内·紧邻独立事务依次生成）。
 * 评估→学习→职业三段各自独立事务（@meetwise/db D2a 共享单源核心；API 端点薄委托同一函数）。
 * **尽力而为**（失败不回滚/不连累报告）：
 *  - 任一段失败 → 结构化日志+failedCount 计数，后续依赖段跳过（评估失败→学习/职业无源自然跳过；
 *    学习失败不阻断职业——职业只依赖评估）；报告已 ready 状态不动，异常绝不上抛。
 *  - 零可评分卡（明文 /turn 过渡窗·0126 围栏结构性零卡）→ assessment='skipped' 空集跳过（非失败·承 S1 形状）。
 *  - 隐私围栏 → fencedSkipped（fence 先赢，与写卡步 D3 fence 序同语义）。
 *  - **crash 窗口**：tx2 提交后、本函数完成前进程死 → 三区块暂缺，无自动重试；
 *    POST /interview/:id/assessment|learning-plan|career-path 保留为手动补口（收据登记）。
 *  - **ms 级竞态**（D1 裁定接受·登记）：report_ready 事件在 tx2 内先于此处落库——SSE 客户端
 *    收事件即 RSC 取数可能先见区块暂缺，刷新后可见（报告主体已在，非死胡同）。
 * 幂等=三表现有 UNIQUE(owner_user_id,interview_id) ON CONFLICT version+1——重放（手动补口/
 * 报告重试后再 ready）天然零重复。
 */
export async function generateGrowthChain(
  pool: DbPool, owner: string, interviewId: string,
  faults?: Partial<Record<GrowthSegment, Error>>,
): Promise<GrowthGenOutcome> {
  const out: GrowthGenOutcome = { assessment: 'skipped', learning: 'skipped', career: 'skipped', fencedSkipped: false, failedCount: 0 };
  const runSegment = (segment: GrowthSegment, core: (c: Parameters<Parameters<typeof asPrincipal>[2]>[0]) => Promise<unknown>) =>
    asPrincipal(pool, owner, async (c) => {
      if (faults?.[segment]) throw faults[segment];
      return core(c);
    });
  // fence 先赢：生成前显式复核隐私围栏（tx2 与此处之间可能已发生删除/撤权）。
  try {
    await asPrincipal(pool, owner, (c) => assertInterviewPrivacyActive(c, interviewId));
  } catch (e) {
    const err = asErr(e);
    if (err?.message === 'interview_privacy_fenced') {
      out.fencedSkipped = true;
      return out;
    }
    // 非围栏故障（罕见：同池刚提交 tx2）：整链尽力而为失败，计数+日志，不上抛。
    out.assessment = out.learning = out.career = 'failed';
    out.failedCount = 3;
    console.error('growth_gen_fence_check_failed', interviewId, err?.message ?? 'err');
    return out;
  }
  // ① 评估（后续两段的数据源）
  try {
    await runSegment('assessment', (c) => generateAssessmentReportCore(c, owner, interviewId));
    out.assessment = 'generated';
  } catch (e) {
    const code = (asErr(e) as { code?: string } | null)?.code;
    if (code === 'no_scorable_cards') {
      out.assessment = 'skipped';   // 明文 /turn 过渡窗结构性零卡：空集跳过（非失败·承 S1 形状）
      return out;                    // 依赖段无源自然跳过
    }
    out.assessment = 'failed';
    out.failedCount++;
    console.error('growth_gen_assessment_failed', interviewId, code ?? asErr(e)?.message ?? 'err');
    return out;
  }
  // ② 学习（依赖评估；失败不阻断职业）
  try {
    await runSegment('learning', (c) => generateLearningPlanCore(c, owner, interviewId));
    out.learning = 'generated';
  } catch (e) {
    out.learning = 'failed';
    out.failedCount++;
    console.error('growth_gen_learning_failed', interviewId, (asErr(e) as { code?: string } | null)?.code ?? asErr(e)?.message ?? 'err');
  }
  // ③ 职业（依赖评估·#187 单事务 upsert 简化形；ai_graph_run 观测面分叉在案）
  try {
    await runSegment('career', (c) => generateCareerPathCore(c, owner, interviewId));
    out.career = 'generated';
  } catch (e) {
    out.career = 'failed';
    out.failedCount++;
    console.error('growth_gen_career_failed', interviewId, (asErr(e) as { code?: string } | null)?.code ?? asErr(e)?.message ?? 'err');
  }
  return out;
}

/** 跑一次可领的报告 job：**tx1 claim-commit → 模型在事务外 → tx2 finalize**（事件 gate 在 CAS,stale 不发事件）。 */
export async function drainReportsOnce(
  pool: DbPool, owner: string, leaseOwner: string, deps: ReportWorkerDeps,
): Promise<DrainOutcome> {
  const claim = await asPrincipal(pool, owner, (c) => claimReport(c, owner, leaseOwner));   // tx1
  if (!claim) return 'idle';
  let report;
  try {
    // Claim is deliberately a short transaction.  A deletion might commit
    // after that claim, so prove the durable interview fence again before
    // loading a summary or handing it to a model.  The finalization write is
    // independently guarded by the 0059 RLS/trigger fence.
    if (deps.privacyCheck) await deps.privacyCheck(owner, claim.interviewId);
    else await asPrincipal(pool, owner, (c) => assertInterviewPrivacyActive(c, claim.interviewId));
    // 摘要读取也是报告 job 的一部分：若它失败，绝不能把 job 留在 running 直到租约过期。
    // 否则一次事件库/解密/聚合故障会平白增加 120 秒恢复延迟，并让调度器看起来像“没在工作”。
    const summary = await deps.loadSummary(owner, claim.interviewId);
    report = (await buildReportGraph({ generate: deps.generate }).invoke({ summary }))!.report!;  // 模型在事务外
  } catch (e: unknown) {
    const err = asErr(e);
    if (err?.message === 'interview_privacy_fenced') return 'stale';
    await asPrincipal(pool, owner, (c) => markReportFailed(c, owner, claim.reportId, leaseOwner, (err?.message ?? 'err') as string));
    return 'failed';
  }
  const outcome = await asPrincipal(pool, owner, async (c) => {                            // tx2 finalize
    const ok = await markReportReady(c, owner, claim.reportId, leaseOwner, report);
    if (!ok) return 'stale' as const;                                                                 // 租约被抢/已终态 → 不发事件
    await appendEvent(c, owner, claim.interviewId, 'report_ready', { overall: report.overall });
    await insertNotification(c, owner, `ntf_${claim.reportId}`, 'report_ready', { interviewId: claim.interviewId, overall: report.overall }); // 通知用户
    return 'ready' as const;
  });
  if (outcome !== 'ready') return outcome;
  // #204 成长链（D1 形A）：tx2 提交后·尽力而为——生成失败/围栏跳过绝不影响已 ready 的报告
  // （计数只进结构化日志观测面；手动补口 POST 仍在）。
  const growth = await generateGrowthChain(pool, owner, claim.interviewId, deps.growthFaults);
  if (growth.failedCount > 0 || growth.fencedSkipped) {
    console.error('growth_gen_degraded', claim.interviewId, JSON.stringify(growth));
  }
  return outcome;
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

/** 单 owner 抽干：drain 直到空 + sweep。测试/维护助手；生产 tick 走 listed-order 抽干。 */
export async function drainOwner(pool: DbPool, owner: string, leaseOwner: string, deps: ReportWorkerDeps) {
  await drainOwnersInListedOrder(
    { pool, leaseOwner, deps },
    [owner],
    (d, nextOwner) => drainReportsOnce(d.pool, nextOwner, d.leaseOwner, d.deps),
    (outcome) => outcome === 'idle',
  );
  return sweepReportsOnce(pool, owner);
}

/** 枚举有待办报告的 owner：固定网关只返回 owner id，不暴露报告正文；逐 owner 处理仍走 RLS。 */
export async function enumerateOwnersWithReportWork(pool: DbPool): Promise<string[]> {
  return gatewayDispatchOwners(pool, 'report');
}

/** 一拍调度：枚举活跃 owner → 按列表顺序抽干再 sweep。不是面试量子轮转。 */
export async function dispatchTick(pool: DbPool, leaseOwner: string, deps: ReportWorkerDeps): Promise<{ owners: number }> {
  const owners = await enumerateOwnersWithReportWork(pool);
  const bound = { pool, leaseOwner, deps };
  await drainOwnersInListedOrder(
    bound,
    owners,
    (d, owner) => drainReportsOnce(d.pool, owner, d.leaseOwner, d.deps),
    (outcome) => outcome === 'idle',
    { afterOwner: (owner) => sweepReportsOnce(pool, owner).then(() => undefined) },
  );
  return { owners: owners.length };
}

/** 常驻调度循环：周期 dispatchTick。stop() 优雅退出。main 启动它即让报告队列在生产真被排干。 */
export function runReportDispatcher(pool: DbPool, leaseOwner: string, deps: ReportWorkerDeps, intervalMs = 5000) {
  // Share the bounded failure/staleness signal with every other consumer. A
  // process that keeps swallowing database failures is alive but not ready.
  return runDrainLoop(async () => { await dispatchTick(pool, leaseOwner, deps); }, intervalMs);
}
