/**
 * GODFN-1c 拆解 · learning 域(generateLearningPlan/getLearningPlan/completeLearningItem 方法体自
 * interview.service.ts 机械迁出,零逻辑变更)。事务边界(db.asPrincipal)与隐私围栏(guard)由调用方注入;
 * 落库 SQL/幂等(ON CONFLICT)/完成度标记语义逐字节原样。
 */
import { HttpException, HttpStatus } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { deriveLearningPlan } from '@meetwise/domain';
import type { DbService } from '../../platform/db.service';

/** 隐私围栏注入面(=InterviewService.guardInterviewPrivacy 私有方法,Roster 六守卫零弱化)。 */
type PrivacyGuard = (c: any, id: string) => Promise<void>;

// 学习计划:据评估差距维度生成学习项,落库。需先有评估。
export async function generateLearningPlanFor(db: DbService, guard: PrivacyGuard, principal: string, id: string) {
  return db.asPrincipal(principal, async (c) => {
    await guard(c, id);
    const a = await c.query('SELECT dimensions FROM assessment_report WHERE interview_id=$1', [id]);
    if (a.rowCount === 0) throw new HttpException({ error: 'assessment_required' }, HttpStatus.CONFLICT);
    const plan = deriveLearningPlan(a.rows[0].dimensions ?? []);
    await c.query(
      `INSERT INTO learning_plan(id, owner_user_id, interview_id, items)
         VALUES ($1,$2,$3,$4)
         ON CONFLICT (owner_user_id, interview_id) DO UPDATE SET items=EXCLUDED.items, version=learning_plan.version+1`,
      [randomUUID(), principal, id, JSON.stringify(plan.items)]);
    return plan;
  });
}

export async function getLearningPlanFor(db: DbService, guard: PrivacyGuard, principal: string, id: string) {
  return db.asPrincipal(principal, async (c) => {
    await guard(c, id);
    const r = await c.query('SELECT status, items FROM learning_plan WHERE interview_id=$1', [id]);
    if (r.rowCount === 0) throw new HttpException({ error: 'not_found' }, HttpStatus.NOT_FOUND);
    const doneRows = await c.query('SELECT topic FROM learning_progress WHERE interview_id=$1', [id]);
    const done = new Set(doneRows.rows.map((x: any) => x.topic));
    const items = (r.rows[0].items ?? []).map((it: any) => ({ ...it, done: done.has(it.topic) }));   // 标完成度
    const completed = items.filter((it: any) => it.done).length;
    return { status: r.rows[0].status, items, progress: { completed, total: items.length } };
  });
}

// 标记某学习项完成(留存:打卡学过的)。topic 为键;幂等。
export async function completeLearningItemFor(db: DbService, guard: PrivacyGuard, principal: string, id: string, b: { topic?: string }) {
  await db.asPrincipal(principal, async (c) => {
    await guard(c, id);
    await c.query('INSERT INTO learning_progress(owner_user_id, interview_id, topic) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING', [principal, id, b.topic]);
  });
  return { done: true };
}
