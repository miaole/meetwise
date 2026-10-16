/**
 * H4 WEAKNESS-LOOP R5（#205 学习计划回灌 · worker 侧回灌单源）。
 *
 * 再练面试评估 ready 后：按**本场** assessment_report 的 gap 维度名，确定性匹配该 owner **历史**
 * learning_plan 学习项（不含本场），命中项落 learning_progress 勾选——「再练结果自动更新进度」，
 * worker 读 learning_plan 零读者现状由此接通。匹配算法随 R7 终形（weaknessMatches 确定性相似度，
 * 禁 embedding；memory lean MVP 注记照守）。**Ban 一次性覆盖写 learning_plan**：回灌只 INSERT
 * learning_progress，计划本体（growth-generation.ts:61-75 upsert 形状冻结）零触碰；计划重写面
 * （智能面）登记 Non-claims 归后刀。
 *
 * 边界（收据登记）：仅勾选「learning_plan 已派生项」，不新增/不改写 items（R4 手动打卡端点
 * completeLearningItem 契约原样，自动勾选为主径=修法原文二径取一）；幂等=PK(owner,interview,topic)
 * ON CONFLICT DO NOTHING（重放/重试零重复）；隐私=interview_privacy_active 过滤历史计划（围栏场不回灌）。
 */
import { asPrincipal, type DbPool } from '@meetwise/db';
import { weaknessMatches } from './adaptive-interview-service.ts';

export interface LearningBackfillOutcome {
  /** 读到的历史计划数（不含本场）。 */
  plansRead: number;
  /** 本次实际新勾选行数（INSERT 受理；幂等重放=0）。 */
  marked: number;
  /** 本场 gap 维度名（provenance 观测面）。 */
  gapDimensions: string[];
}

/**
 * 回灌主径：本场 gap 维度 → 历史 learning_plan items 确定性匹配 → learning_progress 勾选。
 * 单 asPrincipal 事务（RLS owner 域内 + 显式 owner 谓词双层，沿 memory-store 租户硬过滤先例）。
 * 由 generateGrowthChain 评估段成功后调用（best-effort，失败仅结构化日志，绝不连累成长链）。
 */
export async function backfillLearningProgressFromAssessment(pool: DbPool, owner: string, interviewId: string): Promise<LearningBackfillOutcome> {
  const out: LearningBackfillOutcome = { plansRead: 0, marked: 0, gapDimensions: [] };
  await asPrincipal(pool, owner, async (c) => {
    // ① 本场评估 gap 维度（弱项真相=assessment_report.dimensions;未 ready/缺行 → 零回灌）。
    const a = await c.query<{ dimensions: unknown }>(
      `SELECT dimensions FROM assessment_report
        WHERE owner_user_id=$1 AND interview_id=$2 AND status='ready'`, [owner, interviewId]);
    const dims = Array.isArray(a.rows[0]?.dimensions) ? (a.rows[0].dimensions as Array<{ dimension?: unknown; gap?: unknown }>) : [];
    const gaps = dims
      .filter((d) => d?.gap === true && typeof d.dimension === 'string' && d.dimension.trim().length > 0)
      .map((d) => String(d.dimension).trim());
    if (gaps.length === 0) return out;
    out.gapDimensions = gaps;
    // ② 历史 learning_plan（不含本场;RLS 之上显式 owner 谓词;围栏场跳过=已删场不回灌）。
    const plans = await c.query<{ interview_id: string; items: unknown }>(
      `SELECT lp.interview_id, lp.items
         FROM learning_plan lp
        WHERE lp.owner_user_id=$1 AND lp.interview_id <> $2
          AND interview_privacy_active(lp.interview_id)`, [owner, interviewId]);
    out.plansRead = plans.rowCount ?? 0;
    for (const plan of plans.rows) {
      const items = Array.isArray(plan.items) ? (plan.items as Array<{ topic?: unknown }>) : [];
      for (const item of items) {
        if (typeof item?.topic !== 'string' || item.topic.trim().length === 0) continue;
        const topic = item.topic.trim();
        // ③ R7 终形确定性匹配:任一本场 gap 维度与学习项 topic 相似即勾选(精确相等短路恒命中)。
        if (!gaps.some((g) => weaknessMatches(g, topic))) continue;
        const ins = await c.query(
          `INSERT INTO learning_progress(owner_user_id, interview_id, topic) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING`,
          [owner, plan.interview_id, topic]);
        out.marked += ins.rowCount ?? 0;
      }
    }
    return out;
  });
  return out;
}
