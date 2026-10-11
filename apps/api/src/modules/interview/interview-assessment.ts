/**
 * GODFN-1c 拆解 · assessment 域(generateAssessment/getAssessment/getCareerPath 方法体自
 * interview.service.ts 机械迁出,零逻辑变更;三处 guard 调用点的 generateCareerPath 留 facade——
 * 拆出会使 guardInterviewPrivacy 调用点计数漂移,违五值等数机检)。事务边界(db.asPrincipal)与
 * 隐私围栏(guard)由调用方注入;ScoreCard 消费/落库 SQL/409 信封语义逐字节原样。
 *
 * #204 GROWTH-GEN D2a：generateAssessmentFor 改薄委托 @meetwise/db generateAssessmentReportCore
 * （读卡→derive→upsert 共享单源·worker 钩子调同一函数）；本层只留 guard+信封映射
 * （plain {code} → 404 not_found_or_forbidden / 409 no_scorable_cards），HTTP 信封字节原样
 * （neg-interview.proof assessment 段既有断言守卫）。getAssessment/getCareerPath 零改动。
 *
 * #103 切换（EXTREV-1 S2 @19ddcbb4 先落·本刀 rebase 承继）：legacy 模型整数路径聚合器 →
 * deriveScoreCardAssessmentLegacy（D5 legacy-parity 适配：gap=60 单源 GAP·持久化维度形状冻结
 * {dimension,score,gap,evidence}·INSERT 前在 domain 纯函数派生）。本刀 D2a 后该切换收口进共享
 * 核心 growth-generation.ts（API 薄委托与 worker 钩子同源）——S2 rg 门语义承继且更严：
 * 生产面（API+worker 自动路径）零 legacy 聚合器（deriveAssessment）调用方。
 */
import { HttpException, HttpStatus } from '@nestjs/common';
import { aggregateInterviewScores, generateAssessmentReportCore } from '@meetwise/db';
import type { Client } from '@meetwise/db';
import type { DbService } from '../../platform/db.service';

/** 隐私围栏注入面(=InterviewService.guardInterviewPrivacy 私有方法经 bind 绑定,Roster 六守卫零弱化)。 */
type PrivacyGuard = (c: any, id: string) => Promise<void>;

/**
 * G5 SCOR-S3 GET 重闸（ADR-0020 :56 「GET 不重跑诚实闸」现状收口·D2 EXEC 落卷）：
 * GET 读 persisted 行**之后**、返回之前，事务内复核现行可评分卡资格（复用 0161 收窄后
 * aggregateInterviewScores 单源；eligible=practice_eligible 单态，superseded/fenced 天然排除）。
 * 落点=读后校验：无 persisted 行先 404（「未生成」语义原值·neg:interview 既有断言零翻），
 * 有行而底层卡资格已空（fence/supersede/撤权，ADR :39 缺口面）→ fail-closed 409，绝不发出失配行。
 * 失败信封复用既有码零新增：assessment GET → 409 `no_scorable_cards`（对齐 POST assessment
 * interview-assessment.ts 既有映射）；career-path GET → 409 `insufficient_evidence`
 * （对齐 POST career-path interview.service 既有先例）。
 */
async function requireCurrentScorableCards(c: Client, id: string, code: 'no_scorable_cards' | 'insufficient_evidence'): Promise<void> {
  const agg = await aggregateInterviewScores(c, id);
  if (agg.eligibleCardCount === 0) throw new HttpException({ error: code }, HttpStatus.CONFLICT);
}

// 生成能力评估:面试各题 ScoreCard(确定性总分)→ 维度+差距,落库(ready),返回。
// SCOR-02 消费迁移:得分只读 ScoreCard C 端可读态(practice_eligible 单态·0161/ADR-0020 :54 收窄),
// legacy answer_evaluated.score 结构性不参与。
// 生成核心已迁 @meetwise/db（#204 D2a 共享单源·worker 自动路径同函数·#103 切换收口于核心）。
export async function generateAssessmentFor(db: DbService, guard: PrivacyGuard, principal: string, id: string) {
  return db.asPrincipal(principal, async (c) => {
    await guard(c, id);
    try {
      return await generateAssessmentReportCore(c, principal, id);
    } catch (e) {
      const code = (e as { code?: string }).code;
      // fail-closed:无任何可评分卡(未走 SCOR-02/03 评分管线)→ 409,绝不落 overall=0 的 ready 假报告
      // (否则 career 据 0 分误判最低定位、成长曲线注入假 0 点;legacy 事件分数也不得回退兜底)。
      if (code === 'not_found_or_forbidden') throw new HttpException({ error: 'not_found_or_forbidden' }, HttpStatus.NOT_FOUND);
      if (code === 'no_scorable_cards' || code === 'score_aggregate_empty') throw new HttpException({ error: 'no_scorable_cards' }, HttpStatus.CONFLICT);
      throw e;
    }
  });
}

export async function getAssessmentFor(db: DbService, guard: PrivacyGuard, principal: string, id: string) {
  const r = await db.asPrincipal(principal, async (c) => {
    await guard(c, id);
    const persisted = await c.query('SELECT status, dimensions, overall FROM assessment_report WHERE interview_id=$1', [id]);
    if (persisted.rowCount === 0) return persisted;    // 无行 → 下方 404 语义原值（D2 读后校验落点）
    await requireCurrentScorableCards(c, id, 'no_scorable_cards');   // G5 GET 重闸 fail-closed
    return persisted;
  });
  if (r.rowCount === 0) throw new HttpException({ error: 'not_found' }, HttpStatus.NOT_FOUND);
  return r.rows[0];
}

export async function getCareerPathFor(db: DbService, guard: PrivacyGuard, principal: string, id: string) {
  const r = await db.asPrincipal(principal, async (c) => {
    await guard(c, id);
    const persisted = await c.query('SELECT readiness, level, milestones FROM career_path WHERE interview_id=$1', [id]);
    if (persisted.rowCount === 0) return persisted;    // 无行 → 下方 404 语义原值（D2 读后校验落点）
    await requireCurrentScorableCards(c, id, 'insufficient_evidence');   // G5 GET 重闸 fail-closed（对齐 POST career-path 先例）
    return persisted;
  });
  if (r.rowCount === 0) throw new HttpException({ error: 'not_found' }, HttpStatus.NOT_FOUND);
  return r.rows[0];
}
