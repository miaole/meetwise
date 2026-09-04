/** 生产主线替换证明:自适应 lifecycle(start/submit)驱动自适应图,发 SSE 事件 + 收尾结算 + 报告走舱壁。
 *  脚本模型(CI);MemorySaver。 pnpm adaptive-life:prove (需 db:up) */
import { fileURLToPath } from 'node:url';
import { MemorySaver } from '@langchain/langgraph';
import { randomUUID } from 'node:crypto';
import { createPool, asPrincipal, reserveEntitlement, appendEvent, answerHash, claimInterviewAnswer, loadMigrations, runMigrations, inviteCandidate, startApplicationInterview } from '@meetwise/db';
import { scriptedModelClient, type ModelClient } from '@meetwise/ai-runtime';
import { startAdaptiveInterview, submitAdaptiveAnswer, type AdaptiveLifecycleDeps } from '../src/adaptive-lifecycle.ts';

const pool = createPool();
let fail = 0; const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };
const OWNER = 'lifeA', IID = 'life-' + Date.now();
const base = scriptedModelClient({
  'planner.competencies': () => ({ ok: true, raw: { competencies: ['并发', '缓存'] } }),
  'interviewer.ask': () => ({ ok: true, raw: { q: '结合你的限流经历聊聊高并发下怎么兼顾吞吐与一致', refs: ['qbank:a'] } }),
  'mock-interview.evaluate': () => ({ ok: true, raw: { score: 88, evidence: [{ criterion: '讲清滑动窗口', quote: '滑动窗口' }] } }),
});
const model: ModelClient = base;

async function main() {
  await runMigrations(pool, loadMigrations(fileURLToPath(new URL('../../../packages/db/migrations', import.meta.url))));
  await pool.query("INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'active')", [IID, OWNER]);
  await pool.query("INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at) VALUES ($1,'paid',5.0, now()+interval '300 days')", [OWNER]);
  await asPrincipal(pool, OWNER, (c) => reserveEntitlement(c, OWNER, IID, 'mock_interview', 1.0));   // begin 预留

  const d: AdaptiveLifecycleDeps = { pool, cp: new MemorySaver(), owner: OWNER, interviewId: IID, model,
    localRetrieve: async () => [{ ref: 'qbank:a', score: 0.9 }], webExplore: async () => [] };

  // 旧 worker 若已失去 durable graph fence，允许模型/checkpoint 的旧计算存在，但禁止其
  // 投影 question ledger/SSE；下一持有者可从同一 checkpoint 安全补投影。
  let fenceLost = false;
  try {
    await startAdaptiveInterview({ ...d, fence: { owner: OWNER, interviewId: IID, leaseOwner: 'lost-worker', version: 999 } }, '后端工程师', ['限流改造']);
  } catch (e: any) { fenceLost = e?.code === 'graph_fence_lost'; }
  const staleWrites = await asPrincipal(pool, OWNER, async (c) => (await c.query(
    "SELECT (SELECT count(*) FROM interview_question WHERE interview_id=$1)::int AS questions, (SELECT count(*) FROM interview_event WHERE stream_key=$1)::int AS events", [IID],
  )).rows[0]);
  A('失去 graph fence → 拒绝业务投影(ledger/SSE 都是 0)', fenceLost && staleWrites.questions === 0 && staleWrites.events === 0);

  const s = await startAdaptiveInterview(d, '后端工程师', ['限流改造', 'Redis 计数器']);
  A('start → 首题(question_ready + server question identity)', !!s.question && s.question.length > 0 && !!s.questionId && s.stateVersion === 1);

  const answer = '我用 Redis 计数器+滑动窗口扛高并发';
  let guard = 0, lastScore = 0, done = false, questionId = s.questionId!;
  const firstInput = { questionId, stateVersion: s.stateVersion!, answerId: randomUUID(), answerHash: answerHash(answer), turn: 0, answer };
  A('API identity ledger 接受当前问题的首答', (await asPrincipal(pool, OWNER, (c) => claimInterviewAnswer(c, OWNER, IID, firstInput))).status === 'accepted');
  const first = await submitAdaptiveAnswer(d, firstInput);
  A('首答 → 评分且得到下一题 identity', first.score === 88 && !!first.nextQuestionId && first.done === false);
  // crash after checkpoint before event projection/requeue 的等价重放：同 answer identity 只重放投影，不会再次 resume 或二次事件。
  const replay = await submitAdaptiveAnswer(d, firstInput);
  A('同 answer identity 重放 → 不重评且 next question 不变', replay.score === first.score && replay.nextQuestionId === first.nextQuestionId);
  const dup = await asPrincipal(pool, OWNER, (c) => c.query("SELECT count(*)::int n FROM interview_event WHERE stream_key=$1 AND kind='answer_evaluated' AND event_key=$2", [IID, `answer_evaluated:${firstInput.questionId}`]));
  A('重放后 answer_evaluated 仍恰 1 条', dup.rows[0].n === 1);
  questionId = first.nextQuestionId!;
  guard = 1;
  while (!done && guard++ < 10) {
    const turn = guard - 1;
    const stateVersion = Number((await asPrincipal(pool, OWNER, async (c) => (await c.query(
      'SELECT state_version FROM interview_question WHERE interview_id=$1 AND question_id=$2', [IID, questionId],
    )).rows[0])).state_version);
    const input = { questionId, stateVersion, answerId: randomUUID(), answerHash: answerHash(answer), turn, answer };
    A(`第${turn}题 identity 被接受`, (await asPrincipal(pool, OWNER, (c) => claimInterviewAnswer(c, OWNER, IID, input))).status === 'accepted');
    const r = await submitAdaptiveAnswer(d, input);
    lastScore = r.score ?? 0; done = r.done; questionId = r.nextQuestionId ?? questionId;
  }
  A('submit 循环到收尾(done)', done === true);
  A('每答经评估(score=88)', lastScore === 88);

  const ev = await asPrincipal(pool, OWNER, (c) => c.query("SELECT kind, count(*)::int n FROM interview_event WHERE stream_key=$1 GROUP BY kind", [IID]));
  const kinds = Object.fromEntries(ev.rows.map((r: any) => [r.kind, r.n]));
  A('发了 question_ready 事件(SSE 首题+后续)', (kinds['question_ready'] ?? 0) >= 1);
  A('发了 answer_evaluated 事件(每答)', (kinds['answer_evaluated'] ?? 0) >= 2);
  const st = await asPrincipal(pool, OWNER, (c) => c.query("SELECT status FROM interview WHERE id=$1", [IID]));
  A('收尾:interview=completed', st.rows[0].status === 'completed');
  const rep = await asPrincipal(pool, OWNER, (c) => c.query("SELECT count(*)::int n FROM ai_report WHERE interview_id=$1", [IID]));
  A('报告入队走舱壁(ai_report 有行,异步隔离)', rep.rows[0].n === 1);

  // 报告只消费 worker 绑定的事件；无 identity 的历史/旁路事件既不能
  // 参与计分，也不能以 0 分拉低综合分。
  const evOut = await asPrincipal(pool, OWNER, (c) => c.query("SELECT count(*)::int n FROM interview_event WHERE stream_key=$1 AND kind='answer_evaluated' AND payload ? 'outcome'", [IID]));
  A('真实作答的 answer_evaluated 均带 outcome 标记', evOut.rows[0].n >= 2);
  await asPrincipal(pool, OWNER, async (c) => {
    await appendEvent(c, OWNER, IID, 'answer_evaluated', { turn: 99, score: 0, outcome: 'unresolved' });   // 注入一条无身份历史事件
  });
  // 复用 report-worker 同款计分查询：旁路事件即使带数字也被整体剔除。
  const scored = await asPrincipal(pool, OWNER, (c) => c.query(
    "SELECT (payload->>'score')::int AS s FROM interview_event WHERE stream_key=$1 AND kind='answer_evaluated' AND payload ?& ARRAY['questionId','stateVersion','answerId','answerHash','competency'] AND COALESCE(payload->>'questionId','') <> '' AND COALESCE(payload->>'answerId','') <> '' AND COALESCE(payload->>'answerHash','') ~ '^[a-f0-9]{64}$' AND COALESCE(payload->>'competency','') <> '' AND COALESCE(payload->>'stateVersion','') ~ '^[0-9]+$' AND COALESCE(payload->>'score','') ~ '^[0-9]+(\\.[0-9]+)?$' AND (payload->>'score')::numeric BETWEEN 0 AND 100 AND COALESCE(payload->>'outcome','answered') <> 'unresolved' ORDER BY seq", [IID]));
  const qualified = await asPrincipal(pool, OWNER, (c) => c.query("SELECT count(*)::int n FROM interview_event WHERE stream_key=$1 AND kind='answer_evaluated' AND payload ?& ARRAY['questionId','stateVersion','answerId','answerHash','competency'] AND COALESCE(payload->>'questionId','') <> '' AND COALESCE(payload->>'answerId','') <> '' AND COALESCE(payload->>'answerHash','') ~ '^[a-f0-9]{64}$' AND COALESCE(payload->>'competency','') <> '' AND COALESCE(payload->>'stateVersion','') ~ '^[0-9]+$'", [IID]));
  const allEvals = await asPrincipal(pool, OWNER, (c) => c.query("SELECT count(*)::int n FROM interview_event WHERE stream_key=$1 AND kind='answer_evaluated'", [IID]));
  A('计分集只消费 worker identity，旁路事件不计入报告综合分', scored.rows.every((r: any) => r.s !== 0) && scored.rows.length === qualified.rows[0].n && allEvals.rows[0].n === qualified.rows[0].n + 1);

  console.log('\n──── B 端全 unresolved 收口证明 ────');
  const noScoreRecruiter = `life-no-score-rec-${Date.now()}`;
  const noScoreJob = `life-no-score-job-${Date.now()}`;
  const noScoreResume = randomUUID();
  await pool.query("INSERT INTO job_posting(id,owner_user_id,title,competencies,status) VALUES ($1,$2,'后端工程师',$3,'open')", [noScoreJob, noScoreRecruiter, JSON.stringify(['并发'])]);
  await pool.query("INSERT INTO resume(id,owner_user_id,status,content_sha) VALUES ($1,$2,'ingested',$3)", [noScoreResume, OWNER, `life-no-score:${IID}`]);
  const noScoreApplication = await asPrincipal(pool, noScoreRecruiter, (c) => inviteCandidate(c, noScoreRecruiter, noScoreJob, OWNER));
  const noScoreStart = await asPrincipal(pool, OWNER, (c) => startApplicationInterview(c, OWNER, noScoreApplication!.applicationId, noScoreResume)) as any;
  await asPrincipal(pool, OWNER, (c) => reserveEntitlement(c, OWNER, noScoreStart.interviewId, 'mock_interview', 1.0));
  const noScoreDeps: AdaptiveLifecycleDeps = { ...d, cp: new MemorySaver(), interviewId: noScoreStart.interviewId };
  const noScoreFirst = await startAdaptiveInterview(noScoreDeps, '后端工程师', ['限流改造']);
  let noScoreQuestionId = noScoreFirst.questionId!;
  let noScoreDone = false;
  for (let guard = 0; !noScoreDone && guard < 12; guard++) {
    const row = await asPrincipal(pool, OWNER, async (c) => (await c.query(
      'SELECT state_version,turn FROM interview_question WHERE interview_id=$1 AND question_id=$2', [noScoreStart.interviewId, noScoreQuestionId],
    )).rows[0]);
    const skipped = '跳过';
    const input = { questionId: noScoreQuestionId, stateVersion: Number(row.state_version), turn: Number(row.turn), answerId: randomUUID(), answerHash: answerHash(skipped), answer: skipped };
    A(`B 端 skip 回合 ${guard} 的 identity 被接受`, (await asPrincipal(pool, OWNER, (c) => claimInterviewAnswer(c, OWNER, noScoreStart.interviewId, input))).status === 'accepted');
    const outcome = await submitAdaptiveAnswer(noScoreDeps, input);
    noScoreDone = outcome.done;
    if (!noScoreDone) noScoreQuestionId = outcome.nextQuestionId!;
  }
  const noScoreState = (await pool.query(
    `SELECT i.status AS interview_status, ja.status AS application_status, ja.score,
            ec.status AS consumption_status,
            (SELECT count(*)::int FROM ai_report r WHERE r.interview_id=i.id) AS report_count,
            (SELECT count(*)::int FROM interview_event e WHERE e.stream_key=i.id AND e.kind='assessment_unavailable'
              AND e.event_key='assessment_unavailable:no_eligible_scored_answer') AS terminal_events
       FROM interview i
       JOIN job_application ja ON ja.id=i.application_id
       LEFT JOIN entitlement_consumption ec ON ec.owner_user_id=i.owner_user_id AND ec.idempotency_key=i.id
      WHERE i.id=$1`, [noScoreStart.interviewId],
  )).rows[0];
  const noScoreEvents = await asPrincipal(pool, OWNER, (c) => c.query(
    "SELECT count(*)::int AS n FROM interview_event WHERE stream_key=$1 AND kind='answer_evaluated' AND COALESCE(payload->>'outcome','answered')='unresolved'", [noScoreStart.interviewId],
  ));
  A('全 skip/unresolved 的 B 端真实 graph 可收尾（不无限澄清）', noScoreDone === true && Number(noScoreEvents.rows[0].n) >= 1);
  A('全 unresolved → completed+confirmed，但申请 scoreless 终态、无报告 job、终态事件恰一', noScoreState?.interview_status === 'completed'
    && noScoreState?.consumption_status === 'confirmed' && noScoreState?.application_status === 'assessment_unavailable'
    && noScoreState?.score === null && Number(noScoreState?.report_count) === 0 && Number(noScoreState?.terminal_events) === 1);

  console.log('\n──── quote evidence 单次拒绝的 lifecycle/权益投影证明 ────');
  const repairIid = `life-quote-repair-${Date.now()}`;
  await pool.query("INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'active')", [repairIid, OWNER]);
  await asPrincipal(pool, OWNER, (c) => reserveEntitlement(c, OWNER, repairIid, 'mock_interview', 1.0));
  const repairCalls: { system: string }[] = [];
  const repairModel: ModelClient = {
    async complete(req) {
      if (req.service === 'planner.competencies') return { ok: true, raw: { competencies: ['并发'] } };
      if (req.service === 'interviewer.ask') return { ok: true, raw: { q: '请说明高峰限流方案？', refs: [] } };
      if (req.service === 'mock-interview.evaluate') {
        repairCalls.push({ system: req.system });
        // 有效答案故意碰到逐字 quote 失败；已派发的评分不得用 repair key 再发一次。
        return { ok: true, raw: { score: 97, relevant: true, hasHook: true, evidence: [{ criterion: '伪造引文', quote: '不属于这次回答的文本' }] } };
      }
      return { ok: false, kind: 'deterministic' };
    },
  };
  const repairDeps: AdaptiveLifecycleDeps = { pool, cp: new MemorySaver(), owner: OWNER, interviewId: repairIid, model: repairModel,
    localRetrieve: async () => [], webExplore: async () => [] };
  const repairStart = await startAdaptiveInterview(repairDeps, '后端工程师', []);
  const repairAnswer = '我会用 Redis 令牌桶限制入口流量，超限时快速失败并给下游降级。';
  const repairInput = { questionId: repairStart.questionId!, stateVersion: repairStart.stateVersion!, answerId: randomUUID(), answerHash: answerHash(repairAnswer), turn: 0, answer: repairAnswer };
  A('quote 证据拒绝场景的 server question identity 可被 API/DB ledger 接受', (await asPrincipal(pool, OWNER, (c) => claimInterviewAnswer(c, OWNER, repairIid, repairInput))).status === 'accepted');
  const repairResult = await submitAdaptiveAnswer(repairDeps, repairInput);
  const repairEvents = await asPrincipal(pool, OWNER, (c) => c.query("SELECT kind,count(*)::int n FROM interview_event WHERE stream_key=$1 GROUP BY kind", [repairIid]));
  const repairKinds = Object.fromEntries(repairEvents.rows.map((r: any) => [r.kind, r.n]));
  const repairConsumption = await asPrincipal(pool, OWNER, (c) => c.query('SELECT status,count(*)::int n FROM entitlement_consumption WHERE owner_user_id=$1 AND idempotency_key=$2 GROUP BY status', [OWNER, repairIid]));
  A('quote 不可核验仅执行一次评分；lifecycle 返回 clarifying，而非 97 分/终止 unscored', repairCalls.length === 1 && repairResult.clarifying === true && repairResult.score === 0 && repairResult.degraded === false);
  A('clarify 投影不产生 answer_evaluated/answer_unscored，不更新能力画像计分事件', (repairKinds['clarification_needed'] ?? 0) === 1 && (repairKinds['answer_evaluated'] ?? 0) === 0 && (repairKinds['answer_unscored'] ?? 0) === 0);
  A('clarify 不确认或重复权益：同一面试仅保留一条 reserved consumption', repairConsumption.rowCount === 1 && repairConsumption.rows[0]?.status === 'reserved' && repairConsumption.rows[0]?.n === 1);

  // TC-MODEL-ROUTE-04-E4: 出题 invoke 失败不得发明 question_ready。
  const failIid = 'life-fail-' + Date.now();
  await pool.query("INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'active')", [failIid, OWNER]);
  await asPrincipal(pool, OWNER, (c) => reserveEntitlement(c, OWNER, failIid, 'mock_interview', 1.0));
  const failingAsk = scriptedModelClient({
    'planner.competencies': () => ({ ok: true, raw: { competencies: ['并发'] } }),
  });
  const failStart = await startAdaptiveInterview({
    pool, cp: new MemorySaver(), owner: OWNER, interviewId: failIid, model: failingAsk,
    localRetrieve: async () => [], webExplore: async () => [],
  }, '后端工程师', []);
  const failEv = await asPrincipal(pool, OWNER, (c) => c.query(
    "SELECT kind, payload FROM interview_event WHERE stream_key=$1 ORDER BY seq", [failIid],
  ));
  const failKinds = failEv.rows.map((r: any) => r.kind);
  const unavail = failEv.rows.find((r: any) => r.kind === 'interview_unavailable');
  const failStatus = await asPrincipal(pool, OWNER, (c) => c.query('SELECT status FROM interview WHERE id=$1', [failIid]));
  const failCons = await asPrincipal(pool, OWNER, (c) => c.query('SELECT status FROM entitlement_consumption WHERE owner_user_id=$1 AND idempotency_key=$2', [OWNER, failIid]));
  A('出题失败 → 不发明 question_ready / 题面',
    !failStart.question && !failStart.questionId && !!failStart.unavailable
    && !failKinds.includes('question_ready'));
  A('出题失败 → interview_unavailable 含 provenance.origin=unavailable',
    unavail?.payload?.reason && unavail.payload.provenance?.origin === 'unavailable'
    && typeof unavail.payload.provenance?.errorCode === 'string');
  A('出题失败 → 面试 failed 且预留释放',
    failStatus.rows[0]?.status === 'failed' && failCons.rows[0]?.status === 'released');

  console.log(`\n${fail === 0 ? '✓ 生产主线替换:自适应 agent 图驱动真面试生命周期(SSE 事件+结算+舱壁报告)全部通过' : '✗ ' + fail + ' 失败'}`);
  await pool.end(); process.exit(fail ? 1 : 0);
}
main().catch((e) => { console.error('✗', e?.message ?? e); process.exit(1); });
