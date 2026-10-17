/**
 * GODFN-1c 拆解 · learning 域(generateLearningPlan/getLearningPlan/completeLearningItem 方法体自
 * interview.service.ts 机械迁出,零逻辑变更)。事务边界(db.asPrincipal)与隐私围栏(guard)由调用方注入;
 * 落库 SQL/幂等(ON CONFLICT)/完成度标记语义逐字节原样。
 *
 * #204 GROWTH-GEN D2a：generateLearningPlanFor 改薄委托 @meetwise/db generateLearningPlanCore
 * （读评估→derive→upsert 共享单源·worker 钩子调同一函数）；本层只留 guard+409 assessment_required
 * 信封映射（HTTP 信封字节原样·neg-interview.proof learning-plan 段既有断言守卫）。其余零改动。
 */
import { HttpException, HttpStatus } from '@nestjs/common';
import { generateLearningPlanCore } from '@meetwise/db';
import type { DbService } from '../../platform/db.service';

/** 隐私围栏注入面(=InterviewService.guardInterviewPrivacy 私有方法,Roster 六守卫零弱化)。 */
type PrivacyGuard = (c: any, id: string) => Promise<void>;

// 学习计划:据评估差距维度生成学习项,落库。需先有评估。
// 生成核心已迁 @meetwise/db（#204 D2a 共享单源·worker 自动路径同函数）。
export async function generateLearningPlanFor(db: DbService, guard: PrivacyGuard, principal: string, id: string) {
  return db.asPrincipal(principal, async (c) => {
    await guard(c, id);
    try {
      return await generateLearningPlanCore(c, principal, id);
    } catch (e) {
      if ((e as { code?: string }).code === 'assessment_required')
        throw new HttpException({ error: 'assessment_required' }, HttpStatus.CONFLICT);
      throw e;
    }
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
// #121（5E 2026-10-12·blueprint :395 修法列后段）：topic 限定为**该场弱项**——只接受本场 ready 评估
// 报告里 gap=true 的维度名（学习计划 generateLearningPlanCore→deriveLearningPlan 即由同源 gap 维度
// 派生,item.topic=d.dimension 逐字,两源天然互洽）。此前任意字符串静默落 learning_progress 行=
// 「learning_progress.topic 不对应真实弱项」审计面。如实注:本文件头注「机械迁出·零逻辑变更」纪律
// 自本刀起对本函数失效（其余两函数零触）。
export async function completeLearningItemFor(db: DbService, guard: PrivacyGuard, principal: string, id: string, b: { topic?: string }) {
  await db.asPrincipal(principal, async (c) => {
    await guard(c, id);
    const ok = await c.query(
      `SELECT 1 FROM assessment_report ar, jsonb_array_elements(ar.dimensions) d
       WHERE ar.interview_id=$1 AND ar.owner_user_id=$2 AND ar.status='ready'
         AND interview_privacy_active_read(ar.interview_id)
         AND coalesce(btrim(d->>'dimension'),'')=$3 AND coalesce(d->>'gap','false')='true'
       LIMIT 1`, [id, principal, b.topic]);
    if (ok.rowCount === 0) throw new HttpException({ error: 'invalid_topic' }, HttpStatus.BAD_REQUEST);
    await c.query('INSERT INTO learning_progress(owner_user_id, interview_id, topic) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING', [principal, id, b.topic]);
  });
  return { done: true };
}
