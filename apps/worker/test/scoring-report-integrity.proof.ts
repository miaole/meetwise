/**
 * 评分 / 报告正确性回归（真 Postgres + 真 invoke + 真图）。
 *
 * 覆盖审计 P0：hasHook 不丢失；证据必须可在答案中逐字验证；同 turn 不同答案
 * 不共享缓存；模型故障不伪造 50 分；报告总分不可由模型篡改；重复段落不可入库。
 * pnpm scoring-integrity:prove
 */
import { fileURLToPath } from 'node:url';
import { MemorySaver, Command } from '@langchain/langgraph';
import { createPool, asPrincipal, loadMigrations, runMigrations } from '@meetwise/db';
import { scriptedModelClient, type ModelClient } from '@meetwise/ai-runtime';
import { buildAdaptiveInterviewGraph, buildReportGraph, createEphemeralAnswerVault } from '@meetwise/ai-graphs';
import { aggregateScores } from '@meetwise/domain';
import { evaluateAnswer, reportGenerator } from '../src/interview-service.ts';
import { buildAdaptiveDeps } from '../src/adaptive-interview-service.ts';

const pool = createPool();
let failures = 0;
const A = (name: string, condition: boolean) => { console.log(`${condition ? 'PASS' : 'FAIL'}  ${name}`); if (!condition) failures++; };
const expectThrow = async (fn: () => Promise<unknown>) => {
  try { await fn(); return false; } catch { return true; }
};

function answerFromData(data: string): string {
  return data.match(/(?:^|\n)回答:([\s\S]*)$/)?.[1]?.trim() ?? data.trim();
}

async function main() {
  await runMigrations(pool, loadMigrations(fileURLToPath(new URL('../../../packages/db/migrations', import.meta.url))));
  const owner = `score-integrity-${Date.now()}`;
  let calls = 0;
  const validModel: ModelClient = {
    async complete(req) {
      calls++;
      const answer = answerFromData(req.userData);
      return {
        ok: true,
        raw: {
          score: 84, relevant: true, hasHook: true,
          evidence: [{ criterion: '提供了具体权衡', quote: answer.slice(0, 24) }],
        },
      };
    },
  };

  console.log('\n──── ① 可验证证据 + hasHook + answer hash 幂等 ────');
  const first = await evaluateAnswer(pool, owner, 'turn:0', '请设计限流', '我用 Redis 令牌桶，超限返回 429。', validModel);
  const replay = await evaluateAnswer(pool, owner, 'turn:0', '请设计限流', '我用 Redis 令牌桶，超限返回 429。', validModel);
  A('hasHook 通过 schema/invoke 保留', first.status === 'scored' && first.hasHook === true);
  A('结构化证据仅保留可重验 span+hash，不落候选人 quote 原文', first.status === 'scored' && first.evidenceRecords[0]?.start === 0 && first.evidenceRecords[0]?.end > 0 && first.evidenceRecords[0]?.quoteSha256.length === 64 && !('quote' in first.evidenceRecords[0]!));
  A('同 answer 重放命中缓存，模型只打 1 次', replay.status === 'scored' && calls === 1);
  const changed = await evaluateAnswer(pool, owner, 'turn:0', '请设计限流', '我用滑动窗口，超限快速失败。', validModel);
  A('同 turn 换答案必须重新评分（answer SHA-256 参与幂等键）', changed.status === 'scored' && calls === 2);
  const traces = await asPrincipal(pool, owner, (c) => c.query("SELECT count(*)::int AS n FROM ai_invocation_trace WHERE idempotency_key LIKE 'turn:0:answer:%'"));
  A('存储层为两个不同答案留两个幂等实体', traces.rows[0].n === 2);
  const persisted = await asPrincipal(pool, owner, (c) => c.query("SELECT output FROM ai_invocation_trace WHERE idempotency_key LIKE 'turn:0:answer:%' ORDER BY idempotency_key LIMIT 1"));
  const persistedText = JSON.stringify(persisted.rows[0]?.output ?? {});
  A('评分 trace 不存候选人 quote 原文，只存 span+hash', !persistedText.includes('我用 Redis 令牌桶') && persistedText.includes('quoteSha256') && persistedText.includes('"start"'));

  console.log('\n──── ①b quote evidence 单次拒绝（真 DB + invoke）────');
  const repairRequests: { system: string; userData: string }[] = [];
  const quoteRepairModel: ModelClient = {
    async complete(req) {
      repairRequests.push({ system: req.system, userData: req.userData });
      return { ok: true, raw: { score: 73, relevant: true, hasHook: false, evidence: [{ criterion: '给出令牌桶与过载处置', quote: '不存在于本次回答' }] } };
    },
  };
  const repairAnswer = '我会使用 Redis 令牌桶，超限快速失败，并对热点接口做降级。';
  const rejected = await evaluateAnswer(pool, owner, 'turn:quote-repair', '如何实现高峰限流？', repairAnswer, quoteRepairModel);
  A('quote 校验失败只调用一次模型，并以 unscored 拒绝结果收口', rejected.status === 'unscored' && repairRequests.length === 1);
  const rejectedReplay = await evaluateAnswer(pool, owner, 'turn:quote-repair', '如何实现高峰限流？', repairAnswer, quoteRepairModel);
  A('quote 拒绝重放读取同一失败状态，不再重打模型', rejectedReplay.status === 'unscored' && repairRequests.length === 1);
  const repairTrace = await asPrincipal(pool, owner, (c) => c.query("SELECT idempotency_key FROM ai_invocation_trace WHERE idempotency_key LIKE 'turn:quote-repair:answer:%'"));
  A('DB 不持久化未通过逐字校验的 quote 输出', repairTrace.rowCount === 0);

  console.log('\n──── ①c graph 只消费一次评分结果，不新开业务 turn ────');
  const graphEvalRequests: { system: string }[] = [];
  const graphRepairModel: ModelClient = {
    async complete(req) {
      if (req.service === 'interviewer.ask') return { ok: true, raw: { q: '请说明高峰限流方案？', refs: [] } };
      if (req.service !== 'mock-interview.evaluate') return { ok: false, kind: 'deterministic' };
      graphEvalRequests.push({ system: req.system });
      return { ok: true, raw: { score: 76, relevant: true, hasHook: false, evidence: [{ criterion: '说明令牌桶和降级', quote: '伪造引文' }] } };
    },
  };
  const graphThread = `quote-repair-graph-${Date.now()}`;
  const repairAnswerVault = createEphemeralAnswerVault();
  const repairGraph = buildAdaptiveInterviewGraph(new MemorySaver(), buildAdaptiveDeps({
    pool, owner, threadId: graphThread, model: graphRepairModel, competencies: ['并发'],
    localRetrieve: async () => [], webExplore: async () => [], loadAnswer: repairAnswerVault.loadAnswer,
  }));
  const repairGraphCfg = { configurable: { thread_id: graphThread } };
  await repairGraph.invoke({}, repairGraphCfg);
  await repairGraph.invoke(new Command({ resume: repairAnswerVault.issue('我使用令牌桶并对超限降级，保护下游依赖。') }), repairGraphCfg);
  const repairGraphState: any = await repairGraph.getState(repairGraphCfg);
  const graphTurn = repairGraphState.values.transcript.at(-1);
  const graphTrace = await asPrincipal(pool, owner, (c) => c.query('SELECT idempotency_key FROM ai_invocation_trace WHERE owner_user_id=$1 AND idempotency_key LIKE $2', [owner, `${graphThread}:eval:q:q-v1-t0-c0:v:1:t:0:answer:%`]));
  A('graph 经同一 pending question identity 评分；quote 不可核验只调用一次并进入同题 clarify', graphEvalRequests.length === 1 && graphTurn?.outcome === 'clarify' && graphTurn?.score === 0 && graphTrace.rowCount === 0);
  A('clarify turn 不在 checkpoint 复制原始回答', !Object.hasOwn(graphTurn, 'a'));

  const exhaustedGraphModel: ModelClient = {
    async complete(req) {
      if (req.service === 'interviewer.ask') return { ok: true, raw: { q: '请说明高峰限流方案？', refs: [] } };
      if (req.service === 'mock-interview.evaluate') return { ok: true, raw: { score: 91, relevant: true, hasHook: false, evidence: [{ criterion: '伪造', quote: '永远不在回答中的引文' }] } };
      return { ok: false, kind: 'deterministic' };
    },
  };
  const exhaustedThread = `quote-repair-exhausted-${Date.now()}`;
  const exhaustedAnswerVault = createEphemeralAnswerVault();
  const exhaustedGraph = buildAdaptiveInterviewGraph(new MemorySaver(), buildAdaptiveDeps({
    pool, owner, threadId: exhaustedThread, model: exhaustedGraphModel, competencies: ['并发'],
    localRetrieve: async () => [], webExplore: async () => [], loadAnswer: exhaustedAnswerVault.loadAnswer,
  }));
  const exhaustedCfg = { configurable: { thread_id: exhaustedThread } };
  await exhaustedGraph.invoke({}, exhaustedCfg);
  await exhaustedGraph.invoke(new Command({ resume: exhaustedAnswerVault.issue('我用令牌桶限制入口流量，超限时对下游做降级。') }), exhaustedCfg);
  const exhaustedState: any = await exhaustedGraph.getState(exhaustedCfg);
  const exhaustedTurn = exhaustedState.values.transcript.at(-1);
  A('quote 校验失败且输入仍有效 → clarify；不写 91 分、不标记 unscored 终止', exhaustedTurn?.outcome === 'clarify' && exhaustedTurn?.score === 0 && exhaustedState.values.concluded === false && !!exhaustedState.values.pending);
  A('quote-repair clarify turn 不在完成态 checkpoint 复制原始回答', !Object.hasOwn(exhaustedTurn, 'a'));

  console.log('\n──── ② 失败只能是 unscored，不得冒充人的分数 ────');
  const foreignEvidence = scriptedModelClient({
    'mock-interview.evaluate': () => ({ ok: true, raw: { score: 99, relevant: true, hasHook: true, evidence: [{ criterion: '高质量', quote: '不在本次答案的语句' }] } }),
  });
  const invalid = await evaluateAnswer(pool, owner, 'turn:invalid', '题目', '本次答案有效内容', foreignEvidence);
  A('repair 后引文仍不属于答案 → unscored，不可写入 99 分', invalid.status === 'unscored' && !('score' in invalid));
  const unavailable = await evaluateAnswer(pool, owner, 'turn:down', '题目', '本次答案有效内容', scriptedModelClient({}));
  A('供应商不可用 → unscored 带可审计原因，绝不生成 50 分', unavailable.status === 'unscored' && unavailable.reason.length > 0 && !('score' in unavailable));

  const unavailableAnswerVault = createEphemeralAnswerVault();
  const graph = buildAdaptiveInterviewGraph(new MemorySaver(), {
    competencies: ['并发'],
    retrieveAndGenerate: async () => ({ question: '你怎么做限流？', sources: [] }),
    assess: async () => ({ status: 'unscored', reason: 'evaluation_exhausted_retries' }),
    loadAnswer: unavailableAnswerVault.loadAnswer,
  });
  const cfg = { configurable: { thread_id: `unscored-${Date.now()}` } };
  await graph.invoke({}, cfg);
  await graph.invoke(new Command({ resume: unavailableAnswerVault.issue('我用令牌桶处理突发流量，超限时快速失败并降级。') }), cfg);
  const snapshot: any = await graph.getState(cfg);
  const unscoredTurn = snapshot.values.transcript.at(-1);
  A('unscored 使 Agent 明确收敛，不驱动能力画像/追问', snapshot.values.concluded === true && snapshot.values.degraded?.reason === 'evaluation_exhausted_retries' && unscoredTurn?.score === null && unscoredTurn?.outcome === 'unscored');
  A('unscored turn 不在完成态 checkpoint 复制原始回答', !Object.hasOwn(unscoredTurn, 'a'));

  console.log('\n──── ③ 报告总分、段落去重与模型越权防护 ────');
  const summary = { interviewId: 'report-integrity', questionCount: 2, scores: [70, 80] };
  const reportModel = scriptedModelClient({
    // overall=1 故意错误：返回中即使带它也必须被服务端忽略。
    'report.generate': () => ({ ok: true, raw: { overall: 1, sections: [{ title: '总结', body: '候选人能给出清晰的权衡。' }] } }),
  });
  const generated = await reportGenerator(pool, owner, 'report:deterministic', reportModel)(summary);
  A('报告 overall 为确定性 aggregateScores([70,80])=75，模型 1 分无效', generated.overall === 75 && aggregateScores(summary.scores) === 75);
  A('报告图拒绝模型编造的 overall', await expectThrow(async () => buildReportGraph({ generate: () => ({ overall: 1, sections: [{ title: '总结', body: '合理' }] }) }).invoke({ summary })));
  A('报告图拒绝重复 section', await expectThrow(async () => buildReportGraph({ generate: () => ({ overall: 75, sections: [{ title: '总结', body: '合理建议。' }, { title: '总结', body: '合理建议。' }] }) }).invoke({ summary })));
  const repeated = '令牌桶限流具备突发平滑能力。';
  A('报告图拒绝不同 section 重复同一段落', await expectThrow(async () => buildReportGraph({ generate: () => ({ overall: 75, sections: [{ title: '优势', body: repeated }, { title: '风险', body: repeated }] }) }).invoke({ summary })));
  A('空 score 集合不是 0 分，必须走 unavailable/unscored', (() => { try { aggregateScores([]); return false; } catch { return true; } })());

  console.log(`\n${failures === 0 ? '✓ 评分/报告 P0 完整性全部通过' : `✗ ${failures} 项失败`}`);
  await pool.end();
  process.exit(failures ? 1 : 0);
}
main().catch((error) => { console.error(error); process.exit(1); });
