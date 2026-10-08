/**
 * GODFN-1c 拆解 · assessment 域(generateAssessment/getAssessment/getCareerPath 方法体自
 * interview.service.ts 机械迁出,零逻辑变更;三处 guard 调用点的 generateCareerPath 留 facade——
 * 拆出会使 guardInterviewPrivacy 调用点计数漂移,违五值等数机检)。事务边界(db.asPrincipal)与
 * 隐私围栏(guard)由调用方注入;ScoreCard 消费/落库 SQL/409 信封语义逐字节原样。
 */
import { HttpException, HttpStatus } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { listScorableScoreCards } from '@meetwise/db';
import { deriveAssessment } from '@meetwise/domain';
import type { DbService } from '../../platform/db.service';

/** 隐私围栏注入面(=InterviewService.guardInterviewPrivacy 私有方法经 bind 绑定,Roster 六守卫零弱化)。 */
type PrivacyGuard = (c: any, id: string) => Promise<void>;

// 生成能力评估:面试各题 ScoreCard(确定性总分)→ 维度+差距,落库(ready),返回。
// SCOR-02 消费迁移:得分只读 ScoreCard(practice_eligible/b_review_eligible),legacy answer_evaluated.score 结构性不参与。
export async function generateAssessmentFor(db: DbService, guard: PrivacyGuard, principal: string, id: string) {
  return db.asPrincipal(principal, async (c) => {
    await guard(c, id);
    const iv = await c.query('SELECT 1 FROM interview WHERE id=$1', [id]);
    if (iv.rowCount === 0) throw new HttpException({ error: 'not_found_or_forbidden' }, HttpStatus.NOT_FOUND);
    // 得分权威 = ScoreCard(确定性总分),按 competency 聚合(score_card 经 rubric_id 钉住 competency,无需回退问题文本)。
    const cards = await listScorableScoreCards(c, id);
    // fail-closed:无任何可评分卡(未走 SCOR-02/03 评分管线)→ 409,绝不落 overall=0 的 ready 假报告
    // (否则 career 据 0 分误判最低定位、成长曲线注入假 0 点;legacy 事件分数也不得回退兜底)。
    if (cards.length === 0) throw new HttpException({ error: 'no_scorable_cards' }, HttpStatus.CONFLICT);
    const turns = cards.map((card) => ({
      question: card.questionId,   // 仅作 competency 缺失时的维度回退;score_card 恒带 competency,不会触发
      competency: card.competency,
      score: card.deterministicTotal,
    }));
    let a: ReturnType<typeof deriveAssessment>;
    try { a = deriveAssessment(turns); }
    catch (e) {
      if ((e as { code?: string }).code === 'score_aggregate_empty')
        throw new HttpException({ error: 'no_scorable_cards' }, HttpStatus.CONFLICT);
      throw e;
    }
    await c.query(
      `INSERT INTO assessment_report(id, owner_user_id, interview_id, status, dimensions, overall)
         VALUES ($1,$2,$3,'ready',$4,$5)
         ON CONFLICT (owner_user_id, interview_id) DO UPDATE SET status='ready', dimensions=EXCLUDED.dimensions, overall=EXCLUDED.overall, version=assessment_report.version+1`,
      [randomUUID(), principal, id, JSON.stringify(a.dimensions), a.overall]);
    return a;
  });
}

export async function getAssessmentFor(db: DbService, guard: PrivacyGuard, principal: string, id: string) {
  const r = await db.asPrincipal(principal, async (c) => {
    await guard(c, id);
    return c.query('SELECT status, dimensions, overall FROM assessment_report WHERE interview_id=$1', [id]);
  });
  if (r.rowCount === 0) throw new HttpException({ error: 'not_found' }, HttpStatus.NOT_FOUND);
  return r.rows[0];
}

export async function getCareerPathFor(db: DbService, guard: PrivacyGuard, principal: string, id: string) {
  const r = await db.asPrincipal(principal, async (c) => {
    await guard(c, id);
    return c.query('SELECT readiness, level, milestones FROM career_path WHERE interview_id=$1', [id]);
  });
  if (r.rowCount === 0) throw new HttpException({ error: 'not_found' }, HttpStatus.NOT_FOUND);
  return r.rows[0];
}
