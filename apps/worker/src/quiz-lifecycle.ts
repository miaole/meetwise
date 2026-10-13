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

/** 面试 begin 输入的新鲜度窗口(GAP-UC025-NEG-01 真接线):置 ready 时写 expires_at = now()+TTL;
 *  过期工件在 interview begin 被 stale_quiz 409 拒绝。TTL 变更=产品决策,改这里并留痕。 */
const QUIZ_FRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/** 据简历押题:解密原文 → 跑 resume-quiz 图(押题→factuality 过滤→派生报告)→ 落库 + 逐题事件 + 终态 + 结算额度。
 *  #230 可选 targetRole(additive 第 7 参):仅透传 generator→prompt data 条件段;undefined=与从前逐字节一致(零回归)。 */
export async function runQuiz(
  pool: DbPool, owner: string, quizId: string, resumeId: string, privacyEpoch: number, model: ModelClient, targetRole?: string,
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

  // G4 #209 facts 空前置拦截(binding 后 dispatch 前):空 facts 简历注定全滤空(押题 refs 必须接地于 facts)——
  // 此处拦下,省一次注定空转的模型外呼;job 已 generating → 消费者既有失败路径置 failed+退额,不留孤儿 created。
  if (facts.length === 0) throw new Error('quiz_empty_facts');

  // 纯图:parse(摄取)→ generate(经 invoke 双校验)→ validate(factuality 歪曲门)→ make_report(业务派生)。模型在注入边界外。
  // progressStream=quizId(TOKSTREAM 阶段1):押题模型调用发生成进度事件(SSE→前端 loading 变真实进度)。
  const graph = buildResumeQuizGraph({ generate: quizGenerator(pool, owner, facts, `${quizId}:quiz`, model, quizId, targetRole) });
  const out = await graph.invoke({ raw: resumeRaw });
  const questions = (out.questions ?? []) as QuizItem[];
  const report = (out.report ?? null) as { score: number; grounded: number; summary: string } | null;

  // 交付与结算同一事务,且**结算/状态机都校验返回值**(专家审计:不可静默把已退/已被放弃的押题当成功收尾 → 免费交付/状态倒退)。
  await asPrincipal(pool, owner, async (c: PoolClient) => {
    // G4 #209 空结果失败退额:滤后 0 题=factuality 歪曲门把幻觉题滤光(生成器闸 'empty_quiz' 只拦 items 空,拦不住
    // 「有题但全幻觉」)——confirm 之前 throw 稳定码(裁定③:事务内 confirm 前)→ 回滚整事务 → 消费者既有失败路径
    // (markFailed+quiz_unavailable 终态事件+releaseConsumption 退额)收口,绝不「扣全额交白卷」。
    if (questions.length === 0) throw new Error('quiz_empty_questions');
    // ① 先结算:若额度已被 abandon 释放/异常 → confirm 返回 error(不抛),此处**显式拒绝成功**,throw 回滚整事务 → 走失败路径。
    const conf = await confirmConsumption(c, owner, quizId, 1);                  // 押题成功 → 全额结算(idempotencyKey=quizId,对终态幂等)
    if (conf.status !== 'confirmed' && conf.status !== 'partial_confirmed')
      throw new Error('quiz_settlement_failed:' + ((conf as any).reason ?? conf.status));
    // ② CAS 落 ready(仅当仍 generating)——被 abandon/并发改态则 0 行 → throw 回滚,绝不交付已放弃的押题。
    //    同事务写新鲜度锚点 expires_at(GAP-UC025-NEG-01):锚点与 ready 同生,begin 的 stale 校验才有真比较对象。
    const freshUntil = new Date(Date.now() + QUIZ_FRESH_TTL_MS);
    const upd = await c.query(
      `UPDATE resume_quiz SET status='ready', questions=$3, report=$4, expires_at=$5, version=version+1
        WHERE id=$1 AND owner_user_id=$2 AND status='generating'
          AND resume_id=$6 AND privacy_epoch=$7`,
      [quizId, owner, JSON.stringify(questions), JSON.stringify(report), freshUntil, resumeId, privacyEpoch]);
    if (upd.rowCount === 0) throw new Error('quiz_status_conflict');
    // ③ 逐题发 question_ready(前端边到边渲染);refs=接地考察点。终态 quiz_ready 收尾(SSE)。
    for (const it of questions) await appendEvent(c, owner, quizId, 'question_ready', { question: it.q, refs: it.refs });
    await appendEvent(c, owner, quizId, 'quiz_ready', { count: questions.length, report });
  });

  return { questions, report };
}
