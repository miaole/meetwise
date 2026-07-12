/**
 * 面试生命周期编排（**生产代码**,worker 侧）：把 audit-clean 切片编成真实可被 api/队列触发的面试流程。
 * 模型经 invoke 关口(interview-service);图/checkpointer/额度/报告舱壁都是已证明的生产件。**不是 demo 脚本——api 真端点经队列触发它。**
 *
 * startInterview: 押题(模型)→ 落题 → 建图首问。 submitAnswer: 凭落库题目重建图 → resume → eval(模型) → 记事件 → 下一题/收尾(确认额度+入队报告)。
 */
import type { PoolClient } from 'pg';
import { asPrincipal, appendEvent, confirmConsumption, enqueueReport, decryptResumeBlob, type DbPool } from '@meetwise/db';
import type { ModelClient } from '@meetwise/ai-runtime';
import { buildResumeQuizGraph, buildMockInterviewGraph } from '@meetwise/ai-graphs';
import { ingestResume } from '@meetwise/domain';
import { Command } from '@langchain/langgraph';
import { quizGenerator, evaluateAnswer } from './interview-service.ts';

type Checkpointer = Parameters<typeof buildMockInterviewGraph>[0];
const pendingQuestion = (snap: any) => snap.tasks?.[0]?.interrupts?.[0]?.value?.question as string | undefined;

/** 开始面试：解密简历 blob 取原文(PII 留加密层,不进 job 载荷)→ 押题(invoke + factuality)→ 落库题目 → active → 首问。 */
export async function startInterview(
  pool: DbPool, cp: Checkpointer, owner: string, interviewId: string, resumeId: string, model: ModelClient,
): Promise<{ questions: string[]; firstQuestion?: string }> {
  const resumeRaw = await asPrincipal(pool, owner, (c: PoolClient) => decryptResumeBlob(c, owner, resumeId)); // 受控解密
  const facts = ingestResume(resumeRaw).facts;
  const quiz = await buildResumeQuizGraph({ generate: quizGenerator(pool, owner, facts, `${interviewId}:quiz`, model) }).invoke({ raw: resumeRaw });
  const questions: string[] = quiz.questions.map((x: any) => x.q);
  await asPrincipal(pool, owner, async (c: PoolClient) => {
    await c.query('UPDATE interview SET questions=$3, status=$4, version=version+1 WHERE id=$1 AND owner_user_id=$2', [interviewId, owner, JSON.stringify(questions), 'active']);
  });
  const g = buildMockInterviewGraph(cp, questions);
  await g.invoke({}, { configurable: { thread_id: interviewId } });           // → interrupt 首题
  const snap = await g.getState({ configurable: { thread_id: interviewId } });
  const firstQuestion = pendingQuestion(snap);
  if (firstQuestion) await asPrincipal(pool, owner, (c: PoolClient) => appendEvent(c, owner, interviewId, 'question_ready', { question: firstQuestion })); // SSE→前端
  return { questions, firstQuestion };
}

/** 提交一题答案：读落库题目重建图 → resume → eval(模型,经 invoke)→ 记 answer_evaluated → 返回下一题/done;done 则确认额度+入队报告。 */
export async function submitAnswer(
  pool: DbPool, cp: Checkpointer, owner: string, interviewId: string, turnIndex: number, answer: string, model: ModelClient,
): Promise<{ score: number; nextQuestion?: string; done: boolean }> {
  const questions: string[] = (await asPrincipal(pool, owner, (c: PoolClient) => c.query('SELECT questions FROM interview WHERE id=$1 AND owner_user_id=$2', [interviewId, owner]))).rows[0]?.questions ?? [];
  const g = buildMockInterviewGraph(cp, questions);
  const cfg = { configurable: { thread_id: interviewId } };
  await g.invoke(new Command({ resume: answer }), cfg);                       // 续会话答题
  const ev = await evaluateAnswer(pool, owner, `${interviewId}:eval:${turnIndex}`, questions[turnIndex] ?? '', answer, model);
  await asPrincipal(pool, owner, (c: PoolClient) => appendEvent(c, owner, interviewId, 'answer_evaluated', { turn: turnIndex, score: ev.score }));
  const snap = await g.getState(cfg);
  const nextQuestion = pendingQuestion(snap);
  if (nextQuestion) await asPrincipal(pool, owner, (c: PoolClient) => appendEvent(c, owner, interviewId, 'question_ready', { question: nextQuestion })); // SSE→前端下一题
  const done = snap.next.length === 0;
  if (done) {
    await asPrincipal(pool, owner, async (c: PoolClient) => {
      // **C2 修:结算校验返回值**(与 adaptive/quiz/diagnosis 同守卫)——confirm 返 error(预留被 reaper/对账 release,release-then-confirm 竞态=未结算)则 throw 回滚,绝不把未结算面试标 completed/入队报告(否则免费出面试+报告)。此前裸 await 忽略返回值 = 潜伏免费交付 bug。
      const conf = await confirmConsumption(c, owner, interviewId, 1);        // 完成 → 全额结算
      if (conf.status === 'error') throw new Error('interview_settlement_failed:' + ((conf as any).reason ?? 'unsettled'));
      await c.query("UPDATE interview SET status='completed', version=version+1 WHERE id=$1 AND owner_user_id=$2 AND status <> 'completed'", [interviewId, owner]);
      await enqueueReport(c, owner, interviewId);                            // 入队报告(report-worker 异步 drain)
    });
  }
  return { score: ev.score, nextQuestion, done };
}
