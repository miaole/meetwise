/**
 * 自适应面试生命周期（**生产主线**:api 入队 → worker → 自适应 agent 图 → SSE 事件）。
 * 换掉旧固定题单 lifecycle:start 跑图到首题(interrupt) → question_ready;submit resume 答案 → 评估 → answer_evaluated →
 *   动态下一题(question_ready)或收尾(confirmConsumption + completed + enqueueReport,复用报告舱壁)。
 * threadId = interviewId;deps 每次重建无内存态,幂等键靠图持久 turn(跨进程 resume 不碰撞)。
 */
import { asPrincipal, appendEvent, confirmConsumption, enqueueReport, type DbPool } from '@meetwise/db';
import { Command } from '@langchain/langgraph';
import { buildAdaptiveInterviewGraph } from '@meetwise/ai-graphs';
import type { ModelClient } from '@meetwise/ai-runtime';
import type { ScoredRef, SourceDoc, CompetencySpec } from '@meetwise/domain';
import { buildAdaptiveDeps, planCompetencies } from './adaptive-interview-service.ts';

const pendingQuestion = (snap: any): string | undefined => snap.tasks?.[0]?.interrupts?.[0]?.value?.question;

export interface AdaptiveLifecycleDeps {
  pool: DbPool; cp: any; owner: string; interviewId: string; model: ModelClient;
  fastModel?: ModelClient;     // 快模型(评分/规划等约束性任务,降反问延迟);缺省回退 model
  localRetrieve: (q: string) => Promise<ScoredRef[]>;
  webExplore: (q: string) => Promise<SourceDoc[]>;
  competencyKeywords?: Record<string, string[]>;
}

function makeDeps(d: AdaptiveLifecycleDeps, competencies: (string | CompetencySpec)[], resumeFacts: string[] = []) {
  return buildAdaptiveDeps({
    pool: d.pool, owner: d.owner, threadId: d.interviewId, model: d.model, fastModel: d.fastModel,
    competencies, resumeFacts, localRetrieve: d.localRetrieve, webExplore: d.webExplore, competencyKeywords: d.competencyKeywords,
  });
}

/** 开始:规划官定能力 → 跑图到首题(interrupt)→ 发 question_ready。 */
export async function startAdaptiveInterview(d: AdaptiveLifecycleDeps, role: string, facts: string[]): Promise<{ question?: string }> {
  const competencies = await planCompetencies(d.pool, d.owner, d.interviewId, d.fastModel ?? d.model, role, facts);   // plan 经 invoke(约束性任务走快模型)
  const g = buildAdaptiveInterviewGraph(d.cp, makeDeps(d, competencies, facts));   // facts → 图状态 → 出题个性化
  const cfg = { configurable: { thread_id: d.interviewId } };
  await g.invoke({}, cfg);
  const snap = await g.getState(cfg);
  const question = pendingQuestion(snap);
  const competency = (snap.values?.route as any)?.competency;   // 当前所探能力(前端据"是否同上题"判追问/换题)
  const qkind = (snap.values?.route as any)?.qkind;            // 题型(grounded/fundamental/scenario/behavioral);用 qkind 命名,避免与 interview_event 的列 kind(事件类型)同名歧义
  if (question) await asPrincipal(d.pool, d.owner, (c) => appendEvent(c, d.owner, d.interviewId, 'question_ready', { question, competency, qkind }));
  return { question };
}

/** 提交答案:resume → 评估 → answer_evaluated → 下一题 或 收尾(结算+完成+入队报告)。
 *  **非作答/答非所问分支(承重)**:不发 answer_evaluated(不把非作答当弱答),改发 clarification_needed(引导重答同题,非终态、可跳过,无死胡同)。 */
export async function submitAdaptiveAnswer(d: AdaptiveLifecycleDeps, answer: string): Promise<{ score?: number; nextQuestion?: string; done: boolean; clarifying: boolean }> {
  const g = buildAdaptiveInterviewGraph(d.cp, makeDeps(d, []));   // resume 不重跑 plan,competencies 用不到
  const cfg = { configurable: { thread_id: d.interviewId } };
  await g.invoke(new Command({ resume: answer }), cfg);
  const snap = await g.getState(cfg);
  const transcript = (snap.values.transcript ?? []) as { score: number; outcome?: string; competency?: string; q?: string; hint?: string }[];
  const last = transcript[transcript.length - 1];
  const turn = transcript.length - 1;
  const nextQuestion = pendingQuestion(snap);
  const nextCompetency = (snap.values?.route as any)?.competency;
  const nextKind = (snap.values?.route as any)?.qkind;
  const clarifying = last?.outcome === 'clarify';
  const lastCompetency = last?.competency;   // 本轮所评能力(与 question_ready 同源 route.competency):随 answer_evaluated 落库,使评估按能力分组自洽(无需依赖遗留 questions[] 下标对齐)
  const done = (snap.next?.length ?? 0) === 0;
  if (clarifying && !done) {
    // 引导事件(**仅非收尾时**):携带 hint + 同一题 + 能力。前端展示"没正面回应,想了解的是…,可重答或跳过"。**不发 answer_evaluated、不发 question_ready**(题在本事件里,避免重复 + 不污染报告分)。
    await asPrincipal(d.pool, d.owner, (c) => appendEvent(c, d.owner, d.interviewId, 'clarification_needed',
      { hint: last!.hint ?? '', question: nextQuestion ?? last!.q ?? '', competency: last!.competency ?? nextCompetency }));
  } else {
    // 带 outcome:'answered'|'unresolved'。**unresolved(跳过/探尽未决)不是"得0分"** —— 报告侧据此剔除(career advice 不把"未展开"误述为"答砸了得0");前端据此标 skipped 不展示惩罚分。
    // **E1 修:非作答恰好撞收尾(clarify && done)时,降级成 unresolved 并正常收尾**——绝不发"请重答"(否则已结算 completed 的面试 UI 永远卡在请重答死胡同)。
    const outcome = clarifying ? 'unresolved' : (last?.outcome ?? 'answered');
    // **E2 修:题面随 answer_evaluated 落库**(last.q = 刚评的那题)——转写据此天然对齐 turn↔题↔分↔outcome,不再靠"question_ready 序号 vs turn"两套计数 join(clarify 轮会错位)。
    if (last) await asPrincipal(d.pool, d.owner, (c) => appendEvent(c, d.owner, d.interviewId, 'answer_evaluated', { turn, score: last.score, outcome, competency: lastCompetency, question: last.q ?? '' }));
    if (nextQuestion) await asPrincipal(d.pool, d.owner, (c) => appendEvent(c, d.owner, d.interviewId, 'question_ready', { question: nextQuestion, competency: nextCompetency, qkind: nextKind }));
  }
  if (done) {
    await asPrincipal(d.pool, d.owner, async (c) => {
      // **结算校验返回值(专家审计:此前忽略返回值=免费交付 bug)**:
      // confirm 幂等——首次返 confirmed/partial、重跑返 noop(已结算,扣费成立);仅 **error**(预留被 reaper/对账 release 走 =
      // release-then-confirm 竞态)才是"未结算"→ throw 回滚整事务,绝不把未结算的面试标 completed/入队报告(否则免费出面试+报告)。
      const conf = await confirmConsumption(c, d.owner, d.interviewId, 1);                            // 完成 → 结算
      if (conf.status === 'error')
        throw new Error('interview_settlement_failed:' + ((conf as any).reason ?? 'unsettled'));
      // 落 completed(`<> completed` 仅避免重跑时无谓 version churn;**不** throw-on-0-rows——
      // 收尾本就幂等:confirm noop + enqueueReport 幂等。F2 双跑/重投下重复收尾应是无害幂等,不能制造假 interview_unavailable。
      await c.query("UPDATE interview SET status='completed', version=version+1 WHERE id=$1 AND owner_user_id=$2 AND status <> 'completed'", [d.interviewId, d.owner]);
      await enqueueReport(c, d.owner, d.interviewId);                                                 // 报告走舱壁(异步隔离,幂等)
    });
  }
  return { score: last?.score, nextQuestion, done, clarifying };
}
