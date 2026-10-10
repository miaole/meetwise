/**
 * @meetwise/db · 成长链生成核心（#204 GROWTH-GEN · D2a 共享单源）。
 *
 * 三段「读 → @meetwise/domain 纯派生 → upsert」核心自 API 侧 interview-assessment.ts /
 * interview-learning.ts 迁出（API 端点改薄委托，HTTP 信封字节原样——本层错误语义为 plain
 * {code}，409/404 信封映射留在 API 侧）；worker（report-worker tx2 成功后紧邻钩子·D1 形A）
 * 调同一函数——单源防两份 INSERT 漂移。纯派生仍在 @meetwise/domain 不动（deriveAssessment/
 * deriveLearningPlan/deriveCareerPath/requireTrustedPracticeOverall）。
 *
 * 幂等 = 三表现有 UNIQUE(owner_user_id, interview_id)（0001_baseline.sql assessment_report/
 * learning_plan/career_path 三表 DDL）ON CONFLICT version+1——与 ai_report 幂等键
 * (uq_report_interview) 同键域天然对齐（roadmap「需与报告重试的幂等键对齐」由此兑现）。
 * 事务边界由调用方注入：API = 原单 asPrincipal 事务形状；worker = 紧邻 tx2 的独立事务。
 *
 * 职业段（D3 · P3 #187 简化裁定）：单事务读评估→derive→upsert，不复制 API 侧 AiGraphRun
 * 状态机（interview.service.ts generateCareerPath 对外契约冻结·本刀 API 侧零触）。观测面
 * 分叉如实：ai_graph_run(career-path) 行仅在 API 路径产生，worker 自动路径不产生（该表为
 * 观测面非读面，career_path 表是唯一读真相）。
 */
import { randomUUID } from 'node:crypto';
import {
  deriveLearningPlan, deriveCareerPath, deriveScoreCardAssessmentLegacy, requireTrustedPracticeOverall,
  type Assessment, type LearningPlan, type CareerPath,
} from '@meetwise/domain';
import { listScorableScoreCards } from './scoring-aggregation.ts';
import type { Client } from './principal.ts';

function fail(code: string): never { throw Object.assign(new Error(code), { code }); }

/**
 * 评估段：可评分卡（确定性总分·读面 scoring_list_scorable_score_cards）→
 * deriveScoreCardAssessmentLegacy（EXTREV-1 S2 @19ddcbb4 #103 切换承继：legacy 模型整数
 * 路径聚合器退役·D5 形状冻结 {dimension,score,gap,evidence}·INSERT 前在 domain 纯函数派生）
 * → upsert assessment_report status='ready'。fail-closed：零卡 → plain code
 * 'no_scorable_cards'（绝不落 overall=0 的 ready 假报告）；面试不存在（RLS 下含越权）
 * → 'not_found_or_forbidden'。S2 rg 门语义承继且更严：生产面（API 薄委托+worker 自动
 * 路径）零 legacy 聚合器（deriveAssessment）调用方。
 */
export async function generateAssessmentReportCore(c: Client, owner: string, interviewId: string): Promise<Assessment> {
  const iv = await c.query('SELECT 1 FROM interview WHERE id=$1', [interviewId]);
  if (iv.rowCount === 0) fail('not_found_or_forbidden');
  // 得分权威 = ScoreCard(确定性总分)，按 competency 聚合（score_card 经 rubric_id 钉住
  // competency，无需回退问题文本）。
  const cards = await listScorableScoreCards(c, interviewId);
  if (cards.length === 0) fail('no_scorable_cards');
  const a = deriveScoreCardAssessmentLegacy(cards);
  await c.query(
    `INSERT INTO assessment_report(id, owner_user_id, interview_id, status, dimensions, overall)
       VALUES ($1,$2,$3,'ready',$4,$5)
       ON CONFLICT (owner_user_id, interview_id) DO UPDATE SET status='ready', dimensions=EXCLUDED.dimensions, overall=EXCLUDED.overall, version=assessment_report.version+1`,
    [randomUUID(), owner, interviewId, JSON.stringify(a.dimensions), a.overall]);
  return a;
}

/**
 * 学习段：读评估 dimensions → deriveLearningPlan（gap 维度→学习项）→ upsert learning_plan。
 * 需评估先行：无评估行 → plain code 'assessment_required'。
 */
export async function generateLearningPlanCore(c: Client, owner: string, interviewId: string): Promise<LearningPlan> {
  const a = await c.query('SELECT dimensions FROM assessment_report WHERE interview_id=$1', [interviewId]);
  if (a.rowCount === 0) fail('assessment_required');
  const plan = deriveLearningPlan(a.rows[0].dimensions ?? []);
  await c.query(
    `INSERT INTO learning_plan(id, owner_user_id, interview_id, items)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (owner_user_id, interview_id) DO UPDATE SET items=EXCLUDED.items, version=learning_plan.version+1`,
    [randomUUID(), owner, interviewId, JSON.stringify(plan.items)]);
  return plan;
}

/**
 * 职业段（worker 自动路径专用·D3 单事务 upsert 简化形）：读评估 overall+弱项 →
 * requireTrustedPracticeOverall（整体分只信确定性实践分·不足证 → 'insufficient_evidence'）
 * → deriveCareerPath → upsert career_path。API 路径仍走 interview.service.ts 状态机（零触）。
 */
export async function generateCareerPathCore(c: Client, owner: string, interviewId: string): Promise<CareerPath> {
  const a = await c.query('SELECT overall, dimensions FROM assessment_report WHERE interview_id=$1', [interviewId]);
  if (a.rowCount === 0) fail('assessment_required');
  const weaknesses: string[] = (a.rows[0].dimensions ?? []).filter((d: unknown) => (d as { gap?: unknown })?.gap)
    .map((d: unknown) => String((d as { dimension?: unknown })?.dimension));
  const overall = requireTrustedPracticeOverall(a.rows[0].overall);
  const cp = deriveCareerPath(overall, weaknesses);
  await c.query(
    `INSERT INTO career_path(id, owner_user_id, interview_id, readiness, level, milestones)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (owner_user_id, interview_id) DO UPDATE SET readiness=EXCLUDED.readiness, level=EXCLUDED.level, milestones=EXCLUDED.milestones, version=career_path.version+1`,
    [randomUUID(), owner, interviewId, cp.readiness, cp.level, JSON.stringify(cp.milestones)]);
  return cp;
}
