/** 生产主线替换证明:自适应 lifecycle(start/submit)驱动自适应图,发 SSE 事件 + 收尾结算 + 报告走舱壁。
 *  脚本模型(CI);MemorySaver。 pnpm adaptive-life:prove (需 db:up) */
import { fileURLToPath } from 'node:url';
import { MemorySaver } from '@langchain/langgraph';
import { randomUUID } from 'node:crypto';
import { createPool, asPrincipal, reserveEntitlement, appendEvent, answerHash, claimInterviewAnswer, loadMigrations, runMigrations, inviteCandidate, startApplicationInterview, createJob, classifyJobRoute, finalizeApplication, failInterviewAndRelease } from '@meetwise/db';
import { scriptedModelClient, type ModelClient } from '@meetwise/ai-runtime';
import { startAdaptiveInterview, submitAdaptiveAnswer, type AdaptiveLifecycleDeps } from '../src/adaptive-lifecycle.ts';

// Test-only HMAC key for createJob/classifyJobRoute (same pattern as rag03/r4 proofs; not production).
process.env.RAG_JOB_ROUTE_INPUT_HASH_KEY ??= 'adaptive-life-job-route-input-hmac-proof-key-not-production-01';

const pool = createPool();
let fail = 0; const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };
const OWNER = 'lifeA', IID = 'life-' + Date.now();
let askSeq = 0;
const base = scriptedModelClient({
  'planner.competencies': () => ({ ok: true, raw: { competencies: ['并发', '缓存'] } }),
  'interviewer.ask': () => ({
    ok: true,
    raw: { q: `结合你的限流经历聊聊高并发下怎么兼顾吞吐与一致，并说明第 ${++askSeq} 轮验证方法`, refs: [] },
  }),
  'mock-interview.evaluate': () => ({ ok: true, raw: { relevant: true, hasHook: false, dispositions: [{ criterionId: 'answer_quality', disposition: 'exceeds', quote: '滑动窗口' }] } }),
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
  // #52 v6：score=档位确定性派生（fixture exceeds→100），非 v5 自由 hint 分。
  A('首答 → 评分且得到下一题 identity', first.score === 100 && !!first.nextQuestionId && first.done === false);
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
  A('每答经评估(档位派生 score=100)', lastScore === 100);

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
  // R2 P-START：无 route_decided → start 拒启 interview_ineligible_route（无 interviewId）。
  // 旧 raw job_posting INSERT 跳过 semantic revision / classify → reserve(undefined) 炸 NOT NULL idempotency_key。
  // 诚实最小修：createJob → rule-classify → invite → start，再 reserve 真实 interviewId。
  const noScoreRecruiter = `life-no-score-rec-${Date.now()}`;
  const noScoreResume = randomUUID();
  const noScoreJobRow = await asPrincipal(pool, noScoreRecruiter, (c) => createJob(c, noScoreRecruiter, {
    title: 'Node.js 服务端工程师',
    description: '使用 NestJS 构建服务',
    competencies: ['nestjs', 'express', 'koa'],
  }));
  const noScoreJob = noScoreJobRow.id;
  const noScoreRev = Number((await pool.query(
    'SELECT COALESCE(MAX(revision),0)::int AS n FROM job_semantic_revision WHERE job_id=$1', [noScoreJob],
  )).rows[0].n);
  const noScoreClassify = await classifyJobRoute(pool, noScoreRecruiter, noScoreJob, noScoreRev, {
    modelClassify: async () => { throw new Error('B-side seed must rule-decide; model path unexpected'); },
  });
  A('B 端岗位 rule-classified route_decided（start 前置）', noScoreClassify.status === 'route_decided' && noScoreClassify.attemptOutcome === 'rule_decided');
  await pool.query("INSERT INTO resume(id,owner_user_id,status,content_sha) VALUES ($1,$2,'ingested',$3)", [noScoreResume, OWNER, `life-no-score:${IID}`]);
  const noScoreApplication = await asPrincipal(pool, noScoreRecruiter, (c) => inviteCandidate(c, noScoreRecruiter, noScoreJob, OWNER));
  const noScoreStart = await asPrincipal(pool, OWNER, (c) => startApplicationInterview(c, OWNER, noScoreApplication!.applicationId, noScoreResume));
  const noScoreInterviewId = (noScoreStart.status === 'started' || noScoreStart.status === 'reused') ? noScoreStart.interviewId : undefined;
  A('B 端 startApplicationInterview 返回 interviewId', typeof noScoreInterviewId === 'string' && noScoreInterviewId.length > 0);
  if (!noScoreInterviewId) throw Object.assign(new Error('b_side_start_missing_interview_id'), { code: 'b_side_start_missing_interview_id', start: noScoreStart });
  await asPrincipal(pool, OWNER, (c) => reserveEntitlement(c, OWNER, noScoreInterviewId, 'mock_interview', 1.0));
  const noScoreDeps: AdaptiveLifecycleDeps = { ...d, cp: new MemorySaver(), interviewId: noScoreInterviewId };
  const noScoreFirst = await startAdaptiveInterview(noScoreDeps, '后端工程师', ['限流改造']);
  let noScoreQuestionId = noScoreFirst.questionId!;
  let noScoreDone = false;
  for (let guard = 0; !noScoreDone && guard < 12; guard++) {
    const row = await asPrincipal(pool, OWNER, async (c) => (await c.query(
      'SELECT state_version,turn FROM interview_question WHERE interview_id=$1 AND question_id=$2', [noScoreInterviewId, noScoreQuestionId],
    )).rows[0]);
    const skipped = '跳过';
    const input = { questionId: noScoreQuestionId, stateVersion: Number(row.state_version), turn: Number(row.turn), answerId: randomUUID(), answerHash: answerHash(skipped), answer: skipped };
    A(`B 端 skip 回合 ${guard} 的 identity 被接受`, (await asPrincipal(pool, OWNER, (c) => claimInterviewAnswer(c, OWNER, noScoreInterviewId, input))).status === 'accepted');
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
      WHERE i.id=$1`, [noScoreInterviewId],
  )).rows[0];
  const noScoreEvents = await asPrincipal(pool, OWNER, (c) => c.query(
    "SELECT count(*)::int AS n FROM interview_event WHERE stream_key=$1 AND kind='answer_evaluated' AND COALESCE(payload->>'outcome','answered')='unresolved'", [noScoreInterviewId],
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
        return { ok: true, raw: { relevant: true, hasHook: true, dispositions: [{ criterionId: 'answer_quality', disposition: 'exceeds', quote: '不属于这次回答的文本' }] } };
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

  console.log('\n──── G7FIX-4：generation 族 bound 面对称标记 + finalize 200 面 + mark-then-recover ────');
  // 与上方 C 端 unbound 面（failIid→interview_unavailable）同族对照。REQUEST rev3 @ea3e38a7：
  // bound 面 generation 失败与 job 失败族（interview-consumer.ts terminalizeUnsettledInterview）
  // 对称——failInterviewAndRelease 之后同事务标记 application=assessment_unavailable（unbound
  // 舱壁/'stale' 旧 worker 双闸原样）；事件分流对齐 consumer.ts:91-95（updated/replayed→
  // assessment_unavailable·unbound→interview_unavailable·stale 不补事件）；事件键循
  // consumer.ts:92 先例 `assessment_unavailable:${reason}`，reason 恒 generation_* 前缀，
  // 与 no_eligible_scored_answer / evaluation_unscored 固定键零碰撞。
  const g7fix4Recruiter = `life-g7fix4-rec-${Date.now()}`;
  const g7fix4Resume = randomUUID();
  const g7fix4JobRow = await asPrincipal(pool, g7fix4Recruiter, (c) => createJob(c, g7fix4Recruiter, {
    title: 'Node.js 服务端工程师',
    description: '使用 NestJS 构建服务',
    competencies: ['nestjs', 'express'],
  }));
  const g7fix4Job = g7fix4JobRow.id;
  const g7fix4Rev = Number((await pool.query(
    'SELECT COALESCE(MAX(revision),0)::int AS n FROM job_semantic_revision WHERE job_id=$1', [g7fix4Job],
  )).rows[0].n);
  const g7fix4Classify = await classifyJobRoute(pool, g7fix4Recruiter, g7fix4Job, g7fix4Rev, {
    modelClassify: async () => { throw new Error('B-side seed must rule-decide; model path unexpected'); },
  });
  A('G7FIX-4 B 端岗位 rule-classified route_decided（start 前置）', g7fix4Classify.status === 'route_decided' && g7fix4Classify.attemptOutcome === 'rule_decided');
  await pool.query("INSERT INTO resume(id,owner_user_id,status,content_sha) VALUES ($1,$2,'ingested',$3)", [g7fix4Resume, OWNER, `life-g7fix4:${IID}`]);
  const g7fix4Application = await asPrincipal(pool, g7fix4Recruiter, (c) => inviteCandidate(c, g7fix4Recruiter, g7fix4Job, OWNER));
  const g7fix4First = await asPrincipal(pool, OWNER, (c) => startApplicationInterview(c, OWNER, g7fix4Application!.applicationId, g7fix4Resume));
  const g7fix4Iid = (g7fix4First.status === 'started' || g7fix4First.status === 'reused') ? g7fix4First.interviewId : undefined;
  A('G7FIX-4 B 端 startApplicationInterview 返回 interviewId（attempt=1）', typeof g7fix4Iid === 'string' && g7fix4Iid.length > 0
    && Number((await pool.query('SELECT interview_attempt FROM job_application WHERE id=$1', [g7fix4Application!.applicationId])).rows[0]?.interview_attempt) === 1);
  if (!g7fix4Iid) throw Object.assign(new Error('g7fix4_start_missing_interview_id'), { code: 'g7fix4_start_missing_interview_id', start: g7fix4First });
  await asPrincipal(pool, OWNER, (c) => reserveEntitlement(c, OWNER, g7fix4Iid, 'mock_interview', 1.0));
  const g7fix4FailingAsk = scriptedModelClient({
    'planner.competencies': () => ({ ok: true, raw: { competencies: ['并发'] } }),
  });
  const g7fix4GenFail = await startAdaptiveInterview({
    pool, cp: new MemorySaver(), owner: OWNER, interviewId: g7fix4Iid, model: g7fix4FailingAsk,
    localRetrieve: async () => [], webExplore: async () => [],
  }, '后端工程师', []);
  const g7fix4State = (await pool.query(
    `SELECT i.status AS interview_status, ja.status AS application_status, ja.score,
            ec.status AS consumption_status
       FROM interview i
       JOIN job_application ja ON ja.id=i.application_id AND ja.interview_id=i.id
       LEFT JOIN entitlement_consumption ec ON ec.owner_user_id=i.owner_user_id AND ec.idempotency_key=i.id
      WHERE i.id=$1`, [g7fix4Iid],
  )).rows[0];
  const g7fix4Events = await asPrincipal(pool, OWNER, (c) => c.query(
    "SELECT kind, event_key, payload FROM interview_event WHERE stream_key=$1 AND kind IN ('assessment_unavailable','interview_unavailable','question_ready') ORDER BY seq", [g7fix4Iid],
  ));
  const g7fix4MarkedEvent = g7fix4Events.rows.find((r: any) => r.kind === 'assessment_unavailable');
  A('generation 失败（bound 面）→ 不发明 question_ready 且 start 返回 unavailable',
    !g7fix4GenFail.question && !g7fix4GenFail.questionId && !!g7fix4GenFail.unavailable
    && !g7fix4Events.rows.some((r: any) => r.kind === 'question_ready'));
  A('generation 族对称标记：application=assessment_unavailable、score=NULL、interview=failed、预留释放',
    g7fix4State?.application_status === 'assessment_unavailable' && g7fix4State?.score === null
    && g7fix4State?.interview_status === 'failed' && g7fix4State?.consumption_status === 'released');
  A('bound 面终态事件恰一：assessment_unavailable:generation_* 键（循 consumer.ts:92 先例）·零 interview_unavailable',
    g7fix4Events.rows.length === 1 && !!g7fix4MarkedEvent
    && /^assessment_unavailable:generation_/.test(g7fix4MarkedEvent.event_key)
    && String(g7fix4MarkedEvent.payload?.reason ?? '').startsWith('generation_')
    && g7fix4MarkedEvent.payload?.provenance?.origin === 'unavailable');

  // finalize 面（REQUEST §2：200 + outcome='assessment_unavailable' + replayed:false）：
  // DB 层命中 recruiter.ts:205 既有 assessment_unavailable 幂等面（≠:204 completed→replayed
  // 面）；服务层映射（applications.service.ts:82-88）r!=='replayed' → replayed:false、
  // outcome 恒 assessment_unavailable、零 HttpException → HTTP 200。服务脸另由
  // g7fix4:finalize:prove 直证。
  const g7fix4Finalize: string = await asPrincipal(pool, OWNER, (c) => finalizeApplication(c, OWNER, g7fix4Application!.applicationId));
  A('finalize DB 面：显式 assessment_unavailable（→ 200 + outcome=assessment_unavailable）',
    g7fix4Finalize === 'assessment_unavailable');
  A('finalize ≠ replayed（replayed:false——:204 replayed 面为 completed 专有，本面绝非它）',
    g7fix4Finalize !== 'replayed' && g7fix4Finalize !== 'not_ready');

  // 正向可重试（既有 assessment_unavailable 恢复形）：新 attempt=2 started。
  const g7fix4Retry = await asPrincipal(pool, OWNER, (c) => startApplicationInterview(c, OWNER, g7fix4Application!.applicationId, g7fix4Resume));
  const g7fix4RetryIid = g7fix4Retry.status === 'started' ? g7fix4Retry.interviewId : undefined;
  const g7fix4RetryState = (await pool.query('SELECT status,interview_id,interview_attempt FROM job_application WHERE id=$1', [g7fix4Application!.applicationId])).rows[0];
  A('assessment_unavailable 重试恢复形（既有面）：started 新 interview·attempt=2',
    g7fix4Retry.status === 'started' && !!g7fix4RetryIid && g7fix4RetryIid !== g7fix4Iid
    && g7fix4RetryState?.status === 'in_progress' && g7fix4RetryState?.interview_id === g7fix4RetryIid
    && Number(g7fix4RetryState?.interview_attempt) === 2);

  // mark-then-recover 单触点（REQUEST rev3）：构造真实卡死态（interview failed 但
  // application 仍 in_progress——本刀前 generation 族/历史窗口遗留死路）。
  await asPrincipal(pool, OWNER, (c) => failInterviewAndRelease(c, OWNER, g7fix4RetryIid!));
  const g7fix4Stuck = (await pool.query(
    'SELECT ja.status AS application_status, i.status AS interview_status FROM job_application ja JOIN interview i ON i.id=ja.interview_id WHERE ja.id=$1',
    [g7fix4Application!.applicationId],
  )).rows[0];
  A('卡死态复现：application 仍 in_progress 且绑定 interview 已 failed',
    g7fix4Stuck?.application_status === 'in_progress' && g7fix4Stuck?.interview_status === 'failed');
  A('卡死态下 finalize 仍 not_ready（服务层 409 cannot_finalize——本刀消的死路面）',
    await asPrincipal(pool, OWNER, (c) => finalizeApplication(c, OWNER, g7fix4Application!.applicationId)) === 'not_ready');
  const g7fix4WrongResume = await asPrincipal(pool, OWNER, (c) => startApplicationInterview(c, OWNER, g7fix4Application!.applicationId, randomUUID()));
  A('卡死态 + 异 resume → binding_invalid 且不触发 mark（resume 恒等镜像闸）',
    g7fix4WrongResume.status === 'binding_invalid'
    && (await pool.query('SELECT status FROM job_application WHERE id=$1', [g7fix4Application!.applicationId])).rows[0]?.status === 'in_progress');
  const g7fix4Recover = await asPrincipal(pool, OWNER, (c) => startApplicationInterview(c, OWNER, g7fix4Application!.applicationId, g7fix4Resume));
  const g7fix4RecoverIid = g7fix4Recover.status === 'started' ? g7fix4Recover.interviewId : undefined;
  const g7fix4RecoverState = (await pool.query('SELECT status,interview_id,interview_attempt,score FROM job_application WHERE id=$1', [g7fix4Application!.applicationId])).rows[0];
  A('mark-then-recover：同 resume 重启 → started 新 attempt=3（旧 interview 保 failed·score=NULL·mark 先行经 assessment_unavailable 恢复形）',
    g7fix4Recover.status === 'started' && !!g7fix4RecoverIid && g7fix4RecoverIid !== g7fix4RetryIid
    && g7fix4RecoverState?.status === 'in_progress' && g7fix4RecoverState?.interview_id === g7fix4RecoverIid
    && Number(g7fix4RecoverState?.interview_attempt) === 3 && g7fix4RecoverState?.score === null);
  const g7fix4Ledger = (await pool.query('SELECT application_attempt, status FROM interview WHERE application_id=$1 ORDER BY application_attempt', [g7fix4Application!.applicationId])).rows;
  A('attempts 全账：attempt1 failed（对称标记面）/attempt2 failed（卡死源）/attempt3 created（恢复新绑定）',
    g7fix4Ledger.length === 3
    && g7fix4Ledger[0]?.status === 'failed' && Number(g7fix4Ledger[0]?.application_attempt) === 1
    && g7fix4Ledger[1]?.status === 'failed' && Number(g7fix4Ledger[1]?.application_attempt) === 2
    && g7fix4Ledger[2]?.status === 'created' && Number(g7fix4Ledger[2]?.application_attempt) === 3);

  console.log(`\n${fail === 0 ? '✓ 生产主线替换:自适应 agent 图驱动真面试生命周期(SSE 事件+结算+舱壁报告)全部通过' : '✗ ' + fail + ' 失败'}`);
  await pool.end(); process.exit(fail ? 1 : 0);
}
main().catch((e) => { console.error('✗', e?.message ?? e); process.exit(1); });
