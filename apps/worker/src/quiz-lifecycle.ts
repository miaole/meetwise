/**
 * 押题生命周期编排(**生产代码**,worker 侧):把 resume-quiz 图编成真实可被 api/队列触发的押题流程。
 * 模型经 invoke 关口(interview-service.quizGenerator,双校验);图侧 factuality 歪曲门过滤幻觉题;额度由业务服务控制——图绝不碰额度。
 *
 * runQuiz: 解密简历 blob 取原文(PII 留加密层,不进 job 载荷)→ generating → 跑图(押题+factuality)→ 逐题发 question_ready
 *          → 落库题目+报告(ready)→ confirm 额度 → 发 quiz_ready 终态事件。前端经 SSE 消费业务事件(非模型 token)。
 */
import type { PoolClient } from 'pg';
import { asPrincipal, appendEvent, confirmConsumption, decryptActiveResumeBlob, type DbPool } from '@meetwise/db';
import type { ModelClient } from '@meetwise/ai-runtime';
import { buildResumeQuizGraph, type QuizItem } from '@meetwise/ai-graphs';
import { ingestResume } from '@meetwise/domain';
import { quizGenerator } from './interview-service.ts';

/** 据简历押题:解密原文 → 跑 resume-quiz 图(押题→factuality 过滤→派生报告)→ 落库 + 逐题事件 + 终态 + 结算额度。 */
export async function runQuiz(
  pool: DbPool, owner: string, quizId: string, resumeId: string, privacyEpoch: number, model: ModelClient,
): Promise<{ questions: QuizItem[]; report: { score: number; grounded: number; summary: string } | null }> {
  // Same transaction holds the resume privacy lock through the active-epoch
  // predicate and decrypt.  A future erase fence uses that lock too.
  const resumeRaw = await asPrincipal(pool, owner, (c: PoolClient) => decryptActiveResumeBlob(c, owner, resumeId, privacyEpoch));
  const facts = ingestResume(resumeRaw).facts;

  await asPrincipal(pool, owner, async (c: PoolClient) => {
    const bound = await c.query(
      `UPDATE resume_quiz
          SET status='generating', resume_id=$3, privacy_epoch=$4, version=version+1
        WHERE id=$1 AND owner_user_id=$2 AND status='created'
          AND (resume_id IS NULL OR (resume_id=$3 AND privacy_epoch=$4))`,
      [quizId, owner, resumeId, privacyEpoch],
    );
    if (bound.rowCount !== 1) throw new Error('quiz_resume_reference_conflict');
    await appendEvent(c, owner, quizId, 'progress', { stage: 'generating' });   // SSE→前端:已开始押题
  });

  // 纯图:parse(摄取)→ generate(经 invoke 双校验)→ validate(factuality 歪曲门)→ make_report(业务派生)。模型在注入边界外。
  const graph = buildResumeQuizGraph({ generate: quizGenerator(pool, owner, facts, `${quizId}:quiz`, model) });
  const out = await graph.invoke({ raw: resumeRaw });
  const questions = (out.questions ?? []) as QuizItem[];
  const report = (out.report ?? null) as { score: number; grounded: number; summary: string } | null;

  // 交付与结算同一事务,且**结算/状态机都校验返回值**(专家审计:不可静默把已退/已被放弃的押题当成功收尾 → 免费交付/状态倒退)。
  await asPrincipal(pool, owner, async (c: PoolClient) => {
    // ① 先结算:若额度已被 abandon 释放/异常 → confirm 返回 error(不抛),此处**显式拒绝成功**,throw 回滚整事务 → 走失败路径。
    const conf = await confirmConsumption(c, owner, quizId, 1);                  // 押题成功 → 全额结算(idempotencyKey=quizId,对终态幂等)
    if (conf.status !== 'confirmed' && conf.status !== 'partial_confirmed')
      throw new Error('quiz_settlement_failed:' + ((conf as any).reason ?? conf.status));
    // ② CAS 落 ready(仅当仍 generating)——被 abandon/并发改态则 0 行 → throw 回滚,绝不交付已放弃的押题。
    const upd = await c.query(
      `UPDATE resume_quiz SET status='ready', questions=$3, report=$4, version=version+1
        WHERE id=$1 AND owner_user_id=$2 AND status='generating'
          AND resume_id=$5 AND privacy_epoch=$6`,
      [quizId, owner, JSON.stringify(questions), JSON.stringify(report), resumeId, privacyEpoch]);
    if (upd.rowCount === 0) throw new Error('quiz_status_conflict');
    // ③ 逐题发 question_ready(前端边到边渲染);refs=接地考察点。终态 quiz_ready 收尾(SSE)。
    for (const it of questions) await appendEvent(c, owner, quizId, 'question_ready', { question: it.q, refs: it.refs });
    await appendEvent(c, owner, quizId, 'quiz_ready', { count: questions.length, report });
  });

  return { questions, report };
}
