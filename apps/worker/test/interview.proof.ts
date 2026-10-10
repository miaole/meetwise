/**
 * 当前生产面试链路证明：C 端已入队的 v64 start/answer → 当前自适应
 * consumer（消费者）→ LangGraph（图编排框架）→ 账本/报告舱壁。
 *
 * 此测试只能由 `scripts/run-e2e-isolated.mjs` 在完整版本化迁移后运行。
 * 禁止用 `packages/db/sql/` 影子 schema（影子数据库结构）伪造通过，因为
 * 生产 consumer 已不支持旧固定题单图，且 v64 简历世代门必须真实存在。
 */
import { randomUUID } from 'node:crypto';
import { MemorySaver } from '@langchain/langgraph';
import {
  assertIsolatedTestTarget, asPrincipal, asScoringWorkerPrincipal, availableUnits, claimInterviewAnswer,
  createPool, createResumeWithBlob, enqueueInterviewJob, enqueueReport, getReport, listScorableScoreCards,
  historicalWeakDimensions,
  reserveEntitlement, transitionResume, completeIngestion, answerHash, supplyCandidateProfileRoute,
  submitInterviewAnswer, createScoreRequestForSubmission, publishRubricAndIssueContract,
  claimScoreRequest, SCORING_ISSUE_PRIVACY_EPOCH,
} from '@meetwise/db';
import { scriptedModelClient, type ModelClient } from '@meetwise/ai-runtime';
import { deriveGrowth, ingestResume, toGrowthRow, scoreSpanDigest, SCORE_SPAN_OFFSET_KIND, utf8ByteLength, type ScoredCriterionDisposition } from '@meetwise/domain';
import { drainReportsOnce, generateGrowthChain } from '../src/report-worker.ts';
import { biasByPastWeakness } from '../src/adaptive-interview-service.ts';
import { interviewDispatchTick, type ConsumerDeps } from '../src/interview-consumer.ts';
import { reportGenerator } from '../src/interview-service.ts';
import { writeScoreCardAfterProjection } from '../src/score-writer.ts';

const pool = createPool();
let failures = 0;
const A = (name: string, condition: boolean) => {
  console.log(`${condition ? 'PASS' : 'FAIL'}  ${name}`);
  if (!condition) failures++;
};
const section = (title: string) => console.log(`\n──────── ${title} ────────`);

const OWNER = `interview-proof-${process.pid}`;
const INTERVIEW_ID = `interview-proof-${Date.now()}`;
const RESUME = [
  '工作经历',
  '负责订单系统限流改造，使用 Redis 计数器和滑动窗口保护下游。',
  '技能',
  'Redis、限流、分布式锁',
].join('\n');

let askSeq = 0;
const model: ModelClient = scriptedModelClient({
  'planner.competencies': () => ({ ok: true, raw: { competencies: ['高并发'] } }),
  'interviewer.ask': () => ({ ok: true, raw: { q: `请说明高并发限流的取舍，并给出第 ${++askSeq} 轮验证方法。`, refs: [] } }),
  // #52 v6：模型直出 per-criterion 档位（非 0-100 总分）；quote 必须是回答原文子串（逐字校验门）。
  'mock-interview.evaluate': () => ({ ok: true, raw: { relevant: true, hasHook: false, dispositions: [{ criterionId: 'answer_quality', disposition: 'meets', quote: 'Redis' }] } }),
  'report.generate': () => ({ ok: true, raw: { overall: 80, sections: [{ title: '总评', body: '能说明限流取舍。' }] } }),
});
/** ②b 直接行使 score-writer 时的 v6 证据构造（整答案 span；与 evaluate 侧派生同域单源）。 */
function fullSpanDisposition(answerText: string, disposition: 'below' | 'meets' | 'exceeds'): ScoredCriterionDisposition[] {
  const span = { offsetKind: SCORE_SPAN_OFFSET_KIND, start: 0, end: utf8ByteLength(answerText) } as const;
  return [{ criterionId: 'answer_quality', disposition, span, spanDigest: scoreSpanDigest(answerText, span) }];
}

async function main() {
  await assertIsolatedTestTarget(pool);
  await asPrincipal(pool, OWNER, async (c) => {
    await c.query(
      "INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at) VALUES ($1,'paid',5.0,now()+interval '30 days')",
      [OWNER],
    );
  });

  const resume = await asPrincipal(pool, OWNER, async (c) => {
    const created = await createResumeWithBlob(c, OWNER, RESUME);
    await transitionResume(c, OWNER, created.resumeId, 'uploaded', 'ingesting');
    await completeIngestion(c, OWNER, created.resumeId, ingestResume(RESUME));
    return created.resumeId;
  });
  const epoch = await asPrincipal(pool, OWNER, async (c) => {
    const row = await c.query<{ privacy_epoch: number }>(
      'SELECT privacy_epoch FROM resume WHERE id=$1 AND owner_user_id=$2', [resume, OWNER],
    );
    return Number(row.rows[0]?.privacy_epoch);
  });
  await asPrincipal(pool, OWNER, (c) => c.query(
    "INSERT INTO interview(id,owner_user_id,status,resume_id,resume_privacy_epoch) VALUES ($1,$2,'created',$3,$4)",
    [INTERVIEW_ID, OWNER, resume, epoch],
  ));
  // S1 fixture 修复（既有 base 红根因）：R1 起 MEETWISE_TECH_ROLE_FAIL_CLOSED 默认 ON，consumer
  // 的角色解析 fail-closed 只认 route snapshot（deps.role 在 ON 态结构性不足过门）——本 proof
  // 自 R1 后未跟进 0142 供给面，start job 全部 adaptive_role_route_missing 失败（7 项连锁红，
  // pristine base 亲证）。沿 adaptive-consumer.proof.ts:86 同款**生产同链**供给修复（简历
  // Redis/限流/分布式锁 rule 命中唯一叶），非 MEETWISE_TECH_ROLE_FAIL_CLOSED opt-out。
  const routeSupply = await asPrincipal(pool, OWNER, (c) => supplyCandidateProfileRoute(c, OWNER, INTERVIEW_ID, resume));
  A('fixture 经生产同链供给 route snapshot（0142 decision+snapshot）', routeSupply.status === 'supplied');

  const before = await asPrincipal(pool, OWNER, (c) => availableUnits(c, OWNER));
  await asPrincipal(pool, OWNER, (c) => reserveEntitlement(c, OWNER, INTERVIEW_ID, 'mock_interview', 1));
  await asPrincipal(pool, OWNER, (c) => enqueueInterviewJob(c, OWNER, INTERVIEW_ID, 'start', { requestId: 'interview-proof-request' }, 0));

  const deps: ConsumerDeps = {
    pool,
    cp: new MemorySaver() as any,
    model,
    leaseOwner: `interview-proof-worker-${process.pid}`,
    adaptive: {
      role: '后端工程师',
      maxTurns: 2,
      absoluteMaxTurns: 2,
      localRetrieve: async () => [],
      webExplore: async () => [],
    },
  };

  section('① v64 start 由当前 consumer 消费并投影首题');
  const firstTick = await interviewDispatchTick(deps);
  const start = await asPrincipal(pool, OWNER, async (c) => {
    const interview = await c.query<{ status: string }>('SELECT status FROM interview WHERE id=$1', [INTERVIEW_ID]);
    const question = await c.query<{ question_id: string; state_version: number; turn: number }>(
      "SELECT question_id,state_version,turn FROM interview_question WHERE interview_id=$1 AND status='issued' ORDER BY state_version DESC LIMIT 1",
      [INTERVIEW_ID],
    );
    const job = await c.query<{ reference_schema_version: number; resume_id: string; resume_privacy_epoch: number }>(
      "SELECT reference_schema_version,resume_id,resume_privacy_epoch FROM interview_job WHERE interview_id=$1 AND kind='start'",
      [INTERVIEW_ID],
    );
    return { status: interview.rows[0]?.status, question: question.rows[0], job: job.rows[0] };
  });
  A('调度器发现且消费 owner 队列', firstTick.owners === 1);
  A('start 任务保留 parent 的 v64 简历标识与世代', start.job?.reference_schema_version === 64 && start.job.resume_id === resume && Number(start.job.resume_privacy_epoch) === epoch);
  // 自适应流程以 `created + start job` 表示已开始，逐轮状态在 question ledger（题目账本）与图检查点；
  // 不沿用旧固定题单的 `interview.status='active'` 断言。
  A('当前自适应图投影 issued 首题', start.status === 'created' && !!start.question);

  section('② API 身份领取 → v64 answer 队列 → 自适应评估/收口');
  let completed = false;
  let answerTurns = 0;
  for (; answerTurns < 4 && !completed; answerTurns++) {
    const question = await asPrincipal(pool, OWNER, async (c) => (await c.query<{
      question_id: string; state_version: number; turn: number;
    }>(
      "SELECT question_id,state_version,turn FROM interview_question WHERE interview_id=$1 AND status='issued' ORDER BY state_version DESC LIMIT 1",
      [INTERVIEW_ID],
    )).rows[0]);
    if (!question) break;
    const answer = `第 ${Number(question.turn) + 1} 题：我会用 Redis 计数器、滑动窗口和降级保护下游。`;
    const input = {
      questionId: question.question_id,
      stateVersion: Number(question.state_version),
      turn: Number(question.turn),
      answerId: randomUUID(),
      answerHash: answerHash(answer),
      answer,
    };
    const claimed = await asPrincipal(pool, OWNER, (c) => claimInterviewAnswer(c, OWNER, INTERVIEW_ID, input));
    A(`第 ${input.turn + 1} 题 API 身份账本接受`, claimed.status === 'accepted');
    await asPrincipal(pool, OWNER, (c) => enqueueInterviewJob(c, OWNER, INTERVIEW_ID, 'answer', input, input.turn + 1));
    await interviewDispatchTick(deps);
    completed = await asPrincipal(pool, OWNER, async (c) => {
      const row = await c.query<{ status: string }>('SELECT status FROM interview WHERE id=$1', [INTERVIEW_ID]);
      return row.rows[0]?.status === 'completed';
    });
  }
  const after = await asPrincipal(pool, OWNER, async (c) => {
    const events = await c.query<{ n: number }>(
      "SELECT count(*)::int AS n FROM interview_event WHERE stream_key=$1 AND kind='answer_evaluated'", [INTERVIEW_ID],
    );
    const jobs = await c.query<{ n: number }>(
      "SELECT count(*)::int AS n FROM interview_job WHERE interview_id=$1 AND status!='done'", [INTERVIEW_ID],
    );
    return { evaluated: Number(events.rows[0]?.n), unfinished: Number(jobs.rows[0]?.n) };
  });
  A('自适应图在有限轮数内完成', completed && answerTurns >= 1);
  A('每个已完成回答都有 answer_evaluated 业务事件', after.evaluated >= 1);
  A('start/answer durable job（持久任务）均收口为 done', after.unfinished === 0);
  A('权益确认后可用额度精确减少 1', (await asPrincipal(pool, OWNER, (c) => availableUnits(c, OWNER))) === before - 1);

  section('②a S1 D1 接线：出题投影事务逐题发布 rubric+冻结契约（图状态 difficulty plumbing）');
  // question_rubric(_criterion) 是全局内容表：app_role 无 SELECT（0100 只授 scoring_definer_owner，
  // 读写均走 DEFINER 链）——prove 观测用直连读面（迁移 owner），非生产路径；owner 作用域表仍走 asPrincipal。
  const d1Global = await pool.query<{ n: number }>(
    "SELECT count(*)::int AS n FROM question_rubric WHERE question_id LIKE $1", [`iv:${INTERVIEW_ID}:%`],
  );
  const d1Criteria = await pool.query<{ n: number }>(
    `SELECT count(*)::int AS n FROM question_rubric_criterion crc
       JOIN question_rubric r ON r.id=crc.rubric_id
      WHERE r.question_id LIKE $1 AND crc.criterion_id='answer_quality'`, [`iv:${INTERVIEW_ID}:%`],
  );
  const d1 = await asPrincipal(pool, OWNER, async (c) => {
    const questions = await c.query<{ n: number }>(
      'SELECT count(*)::int AS n FROM interview_question WHERE interview_id=$1', [INTERVIEW_ID],
    );
    const contracts = await c.query<{ n: number; bad_difficulty: number }>(
      `SELECT count(*)::int AS n, count(*) FILTER (WHERE difficulty NOT BETWEEN 1 AND 5)::int AS bad_difficulty
         FROM issued_question_contract WHERE interview_id=$1`, [INTERVIEW_ID],
    );
    const scoring = await c.query<{ requests: number; cards: number }>(
      `SELECT (SELECT count(*)::int FROM score_request WHERE interview_id=$1) AS requests,
              (SELECT count(*)::int FROM score_card WHERE interview_id=$1) AS cards`, [INTERVIEW_ID],
    );
    return {
      questions: Number(questions.rows[0]?.n), contracts: Number(contracts.rows[0]?.n),
      badDifficulty: Number(contracts.rows[0]?.bad_difficulty),
      requests: Number(scoring.rows[0]?.requests), cards: Number(scoring.rows[0]?.cards),
    };
  });
  const rubricCount = Number(d1Global.rows[0]?.n);
  A('每道已投影题在同一投影事务内发布 rubric（D1·逐题 seed·幂等不重复）', d1.questions >= 1 && rubricCount === d1.questions);
  A('每 rubric 冻结单分项 seed（answer_quality·weight 1）', Number(d1Criteria.rows[0]?.n) === rubricCount);
  A('每道已投影题冻结题面契约且 difficulty 由图状态 plumbing 落 1..5 域（D1）',
    d1.contracts === d1.questions && d1.badDifficulty === 0);
  // 0126 双写围栏诚实面：本面试走明文 /turn 家族（图驱动）→ 结构性无 0092 账本 → D2 无处
  // 绑 score_request → 写卡步 no_request 跳过（S1 过渡形状，非回归；收据声明）。ledger 家族
  // 的全链（D2 request+D4 写卡）在 ②b 用独立面试行使。
  A('明文 /turn 家族结构性零 score_request/零卡（0126 围栏·S1 过渡形状如实）', d1.requests === 0 && d1.cards === 0);

  section('②b S1 全链：D2 submit 事务 request → D3 claim → D4 写卡（#52 v6 直供档位·卡数断言）');
  const IID2 = `${INTERVIEW_ID}-ledger`;
  await asPrincipal(pool, OWNER, (c) => c.query(
    "INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'created')", [IID2, OWNER],
  ));
  const LEDGER_TURNS = [
    { q: 'q-v1-t0-c0', stateVersion: 1, turn: 0, band: 'meets', expect: 50 },
    { q: 'q-v1-t1-c0', stateVersion: 2, turn: 1, band: 'below', expect: 0 },
    { q: 'q-v1-t2-c0', stateVersion: 3, turn: 2, band: 'exceeds', expect: 100 },
  ] as const;
  for (const t of LEDGER_TURNS) {
    const answer = `第 ${t.turn + 1} 题作答：Redis 令牌桶 + 滑动窗口限流，超限降级保护下游（band=${t.band}）。`;
    // D1：与生产投影同款 helper 发布 rubric+契约（这里由 prove 直接行使投影面）。
    await asPrincipal(pool, OWNER, (c) => publishRubricAndIssueContract(c, {
      interviewId: IID2, questionId: t.q, stateVersion: t.stateVersion, turn: t.turn,
      question: `请说明第 ${t.turn + 1} 个限流取舍？`, competency: '高并发', difficulty: 3, kind: 'fundamental',
    }));
    // D2：API submit 事务邻域——0092 账本写入与 createScoreRequest **同一 asPrincipal 事务**原子
    //（与 interview.service.ts submitPreviewAnswer 同形；此处 prove 直连 db 层行使同一事务形状）。
    const { request } = await asPrincipal(pool, OWNER, async (c) => {
      const submitted = await submitInterviewAnswer(c, {
        interviewId: IID2, questionId: t.q, stateVersion: t.stateVersion,
        clientSubmissionKey: `s1-ledger-${t.q}`, answer, privacyEpoch: SCORING_ISSUE_PRIVACY_EPOCH,
      });
      const request = await createScoreRequestForSubmission(c, {
        interviewId: IID2, questionId: t.q, stateVersion: t.stateVersion,
        submissionId: submitted.submissionId, artifactId: submitted.artifactId,
        canonicalBodyHmac: submitted.canonicalBodyHmac, privacyEpoch: submitted.privacyEpoch,
      });
      return { request };
    });
    A(`D2 同事务落 score_request（${t.q}）`, request.created === true && request.replayed === false);
    // D3+D4：drain 写卡步本体（claim→lease→writeFinal·#52 v6 模型直供档位证据，过渡桥已废除）。
    const written = await writeScoreCardAfterProjection(
      { pool, owner: OWNER, leaseOwner: `s1-proof-scoring-${process.pid}` },
      { interviewId: IID2, questionId: t.q, stateVersion: t.stateVersion, answerText: answer, dispositions: fullSpanDisposition(answer, t.band) },
    );
    A(`D4 写卡成功且总分=0/50/100 档位化值（v6 档位 ${t.band}→${t.expect}，模型直供档位·非 hint 分派档）`,
      written.kind === 'written' && written.deterministicTotal === t.expect);
  }
  // D4 恢复钉：crash 于 claim 与写卡之间 → 重放复用既有 lease_token（禁新造，否则永久 claim 不到）。
  {
    const q4 = 'q-v1-t3-c0';
    const answer = '第 4 题作答：分布式锁 Redlock 权衡与 fencing token（hint=90 预占 lease）。';
    await asPrincipal(pool, OWNER, (c) => publishRubricAndIssueContract(c, {
      interviewId: IID2, questionId: q4, stateVersion: 4, turn: 3,
      question: '请说明分布式锁的取舍？', competency: '高并发', difficulty: 3, kind: 'fundamental',
    }));
    const { request } = await asPrincipal(pool, OWNER, async (c) => {
      const submitted = await submitInterviewAnswer(c, {
        interviewId: IID2, questionId: q4, stateVersion: 4,
        clientSubmissionKey: `s1-ledger-${q4}`, answer, privacyEpoch: SCORING_ISSUE_PRIVACY_EPOCH,
      });
      const request = await createScoreRequestForSubmission(c, {
        interviewId: IID2, questionId: q4, stateVersion: 4,
        submissionId: submitted.submissionId, artifactId: submitted.artifactId,
        canonicalBodyHmac: submitted.canonicalBodyHmac, privacyEpoch: submitted.privacyEpoch,
      });
      return { request };
    });
    // 模拟 crash：claim 已发生（pending→claimed 单次 CAS），写卡未发生。
    const claimed = await asScoringWorkerPrincipal(pool, OWNER, (c) => claimScoreRequest(
      c, (request as { requestId: string }).requestId, `s1-proof-crash-${process.pid}`, randomUUID(),
    ));
    A('模拟 crash：首 claim 单次 CAS 成功', claimed.claimed === true);
    const written = await writeScoreCardAfterProjection(
      { pool, owner: OWNER, leaseOwner: `s1-proof-scoring-${process.pid}` },
      { interviewId: IID2, questionId: q4, stateVersion: 4, answerText: answer, dispositions: fullSpanDisposition(answer, 'exceeds') },
    );
    A('D4 恢复钉：重放复用既有 lease_token 写卡成功（禁新造）', written.kind === 'written' && written.deterministicTotal === 100);
  }
  const ledger = await asPrincipal(pool, OWNER, async (c) => {
    const cards = await c.query<{ total: number }>(
      'SELECT deterministic_total::int AS total FROM score_card WHERE interview_id=$1 ORDER BY created_at', [IID2],
    );
    const requests = await c.query<{ scored: number }>(
      "SELECT count(*) FILTER (WHERE status='scored')::int AS scored FROM score_request WHERE interview_id=$1", [IID2],
    );
    const events = await c.query<{ n: number }>(
      "SELECT count(*)::int AS n FROM interview_event WHERE stream_key=$1 AND kind='score_card_written'", [IID2],
    );
    return {
      cards: cards.rows.map((r) => Number(r.total)),
      scored: Number(requests.rows[0]?.scored), events: Number(events.rows[0]?.n),
    };
  });
  // 0092 权限边界：app_role 对 interview_answer_submission 无 SELECT（只走 DEFINER 回执读）——
  // 「已答题数」用直连观测面计数（prove 观测，非生产路径）。
  const ledgerSubmissions = Number((await pool.query(
    'SELECT count(*)::int AS n FROM interview_answer_submission WHERE interview_id=$1', [IID2],
  )).rows[0]?.n);
  A('score_card 行数 = 已答（ledger 提交）题数（S1 卡数断言）', ledger.cards.length === ledgerSubmissions && ledgerSubmissions === 4);
  A('卡总分全为 0/50/100 档位化值（#52 v6 档位确定性分量·模型直供档位）',
    ledger.cards.length === 4 && ledger.cards.every((t) => [0, 50, 100].includes(t)));
  A('全部 score_request 经 CAS 收口 scored（0100 单 winner）', ledger.scored === 4);
  A('写卡同事务原子追加 score_card_written 事件（0103 原语④）', ledger.events === 4);
  // 幂等重放：已 scored 的请求不在 findActiveScoreRequest 的在途集（pending/claimed/dispatched）
  // → 写卡步 no_request 跳过（活性面幂等）；零重复卡由 0100 唯一终态卡索引+CAS 双重兜底。
  const replay = await writeScoreCardAfterProjection(
    { pool, owner: OWNER, leaseOwner: `s1-proof-scoring-${process.pid}` },
    { interviewId: IID2, questionId: LEDGER_TURNS[0].q, stateVersion: LEDGER_TURNS[0].stateVersion,
      answerText: '重放作答', dispositions: fullSpanDisposition('重放作答', 'exceeds') },
  );
  const cardsAfterReplay = await asPrincipal(pool, OWNER, (c) => c.query<{ n: number }>(
    'SELECT count(*)::int AS n FROM score_card WHERE interview_id=$1', [IID2],
  ));
  A('at-least-once 重放幂等：scored 请求跳过·零重复卡', replay.kind === 'skipped' && Number(cardsAfterReplay.rows[0]?.n) === 4);


  section('③ 报告舱壁独立领取并形成 ready（S2 真实 loadSummary 化·去桩·#50 v3 competency 面）');
  const report = await asPrincipal(pool, OWNER, (c) => getReport(c, OWNER, INTERVIEW_ID));
  A('面试完成只入队报告，不在图内生成报告', report?.status === 'queued');
  // 去 :315-316 loadSummary 桩（伪造 80 分数组的假绿面）——改用**生产同形制真实 loadSummary**
  // （=main.ts reportWorkerDeps.loadSummary 同链：listScorableScoreCards→scores，#50 v3 加 items）。
  const realLoadSummary = (owner: string, interviewId: string) => asPrincipal(pool, owner, async (c) => {
    const cards = await listScorableScoreCards(c, interviewId);
    const scores = cards.map((card) => card.deterministicTotal);
    return {
      interviewId, questionCount: scores.length, scores, owner,
      items: cards.map((card) => ({ questionId: card.questionId, competency: card.competency, score: card.deterministicTotal, cardId: card.cardId })),
    };
  });
  // 诚实面 1（fail-closed·#20 形状如实）：图家族（明文 /turn·0126 围栏）结构性零卡 →
  // aggregateScores 抛 score_aggregate_empty → report failed。绝不回退 legacy/桩分数。
  const graphDrain = await drainReportsOnce(pool, OWNER, `interview-proof-report-graph-${process.pid}`, {
    loadSummary: realLoadSummary,
    generate: reportGenerator(pool, OWNER, `${INTERVIEW_ID}:report`, model),
  });
  const graphReportAfter = await asPrincipal(pool, OWNER, (c) => getReport(c, OWNER, INTERVIEW_ID));
  A('图家族报告真实 loadSummary 零卡 → fail-closed failed（0126 围栏·无卡绝不回退桩/legacy 分数）',
    graphDrain === 'failed' && graphReportAfter?.status === 'failed');
  // 诚实面 2（真实路径绿·S2 验收）：账本家族 IID2 有 4 张实卡 → 生产同链 enqueue → drain → ready。
  const ledgerEnqueue = await asPrincipal(pool, OWNER, (c) => enqueueReport(c, OWNER, IID2));
  A('账本家族生产同链入队报告 job（幂等 enqueue）', ledgerEnqueue.created === true);
  const reportResult = await drainReportsOnce(pool, OWNER, `interview-proof-report-${process.pid}`, {
    loadSummary: realLoadSummary,
    generate: reportGenerator(pool, OWNER, `${IID2}:report`, model),
  });
  const ledgerReportAfter = await asPrincipal(pool, OWNER, (c) => getReport(c, OWNER, IID2));
  A('报告 worker（后台进程）真实 loadSummary 独立收口 ready（实卡·aggregateScores 不抛）',
    reportResult === 'ready' && ledgerReportAfter?.status === 'ready');
  // 报告 overall=确定性聚合 of 实卡总分 round((50+0+100+100)/4)=63——桩假绿（恒 80）已废除。
  const ledgerContent = ledgerReportAfter?.content as { overall?: number; sections?: unknown[] } | undefined;
  A('报告 overall=确定性聚合 of 实卡总分（63）·sections 非空（#50 v3 结构化输入真链）',
    ledgerContent?.overall === 63 && Array.isArray(ledgerContent?.sections) && ledgerContent.sections.length >= 1);
  const unavailableEvents = await asPrincipal(pool, OWNER, async (c) => {
    const r = await c.query<{ n: number }>(
      "SELECT count(*)::int AS n FROM interview_event WHERE stream_key=$1 AND kind='report_unavailable'", [IID2]);
    return Number(r.rows[0]?.n);
  });
  A('账本家族事件流零 report_unavailable（S2 验收 roadmap:54-55）', unavailableEvents === 0);

  // ─────────────────────────────────────────────────────────────────────────
  // ③a 成长链自动生成（#204 GROWTH-GEN·D1 形A：tx2 成功后紧邻事务·尽力而为）。
  // SCORE 域 ①-③ 断言（S2 已去桩·真实 loadSummary 化）零改动；本段为纯追加。
  // 注：上方 ③ 段账本家族 IID2 的 drain 已在本刀默认 growth 钩子下自动产出评估
  // （[50,0,100,100]→「高并发」63 分·不 gap——对照面）。
  // ─────────────────────────────────────────────────────────────────────────
  section('③a 成长链自动生成（报告 ready → 评估→学习→职业·#204）');
  // fixture：IID3 独立面试（ledger 家族供卡）——两题 v6 档位=below → 卡总分 [0,0] →
  // 维度分 0 < GAP=60 → gap=true（对照 ②b IID2 [50,0,100,100] 均分 63 不 gap，
  // 故须独立面试+定向档位钉死弱项产出维度；维度分/overall 对聚合语义为纯函数可预期）。
  const IID3 = `${INTERVIEW_ID}-growth`;
  await asPrincipal(pool, OWNER, (c) => c.query(
    "INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'created')", [IID3, OWNER],
  ));
  const GROWTH_TURNS = [
    { q: 'q-v1-t0-c0', stateVersion: 1, turn: 0 },
    { q: 'q-v1-t1-c0', stateVersion: 2, turn: 1 },
  ] as const;
  for (const t of GROWTH_TURNS) {
    const answer = `第 ${t.turn + 1} 题作答：Redis 令牌桶 + 滑动窗口限流（band=below 钉死弱项维度）。`;
    await asPrincipal(pool, OWNER, (c) => publishRubricAndIssueContract(c, {
      interviewId: IID3, questionId: t.q, stateVersion: t.stateVersion, turn: t.turn,
      question: `请说明第 ${t.turn + 1} 个高并发取舍？`, competency: '高并发', difficulty: 3, kind: 'fundamental',
    }));
    const { request } = await asPrincipal(pool, OWNER, async (c) => {
      const submitted = await submitInterviewAnswer(c, {
        interviewId: IID3, questionId: t.q, stateVersion: t.stateVersion,
        clientSubmissionKey: `growth-${t.q}`, answer, privacyEpoch: SCORING_ISSUE_PRIVACY_EPOCH,
      });
      const request = await createScoreRequestForSubmission(c, {
        interviewId: IID3, questionId: t.q, stateVersion: t.stateVersion,
        submissionId: submitted.submissionId, artifactId: submitted.artifactId,
        canonicalBodyHmac: submitted.canonicalBodyHmac, privacyEpoch: submitted.privacyEpoch,
      });
      return { request };
    });
    A(`③a fixture 供卡 score_request（${t.q}）`, request.created === true && request.replayed === false);
    const written = await writeScoreCardAfterProjection(
      { pool, owner: OWNER, leaseOwner: `growth-proof-scoring-${process.pid}` },
      { interviewId: IID3, questionId: t.q, stateVersion: t.stateVersion, answerText: answer, dispositions: fullSpanDisposition(answer, 'below') },
    );
    A(`③a fixture 卡总分=0（v6 档位 below→0·钉死 gap 维度）`, written.kind === 'written' && written.deterministicTotal === 0);
  }
  // 报告入队 → 生产 deps drain（loadSummary=③ 同款真实读面·growth 钩子=drainReportsOnce 硬接线默认）。
  await asPrincipal(pool, OWNER, (c) => enqueueReport(c, OWNER, IID3));
  const growthDrain = await drainReportsOnce(pool, OWNER, `growth-proof-report-${process.pid}`, {
    loadSummary: realLoadSummary,
    generate: reportGenerator(pool, OWNER, `${IID3}:report`, model),
  });
  A('③a 报告 drain 收口 ready（生产 deps·growth 钩子默认接线·非注入桩）',
    growthDrain === 'ready' && (await asPrincipal(pool, OWNER, (c) => getReport(c, OWNER, IID3)))?.status === 'ready');

  const blocks = await asPrincipal(pool, OWNER, async (c) => {
    const ar = await c.query<{ status: string; dimensions: Array<{ dimension: string; score: number; gap: boolean }>; overall: number }>(
      'SELECT status, dimensions, overall FROM assessment_report WHERE interview_id=$1', [IID3]);
    const lp = await c.query<{ items: Array<{ topic: string; priority: string; action: string }> }>(
      'SELECT items FROM learning_plan WHERE interview_id=$1', [IID3]);
    const cp = await c.query<{ readiness: string; level: string; milestones: Array<{ stage: string; goal: string }> }>(
      'SELECT readiness, level, milestones FROM career_path WHERE interview_id=$1', [IID3]);
    return { ar: ar.rows[0], lp: lp.rows[0], cp: cp.rows[0] };
  });
  A('区块一 assessment_report：status=ready·dimensions 非空·overall=0（三区块之一）',
    blocks.ar?.status === 'ready' && Array.isArray(blocks.ar.dimensions) && blocks.ar.dimensions.length > 0 && blocks.ar.overall === 0);
  A('评估弱项钉死：「高并发」维度分 0<GAP=60 → gap=true',
    !!blocks.ar && Array.isArray(blocks.ar.dimensions) && blocks.ar.dimensions.some((d) => d.dimension === '高并发' && d.score === 0 && d.gap === true));
  A('区块二 learning_plan：gap 维度→topic 在列·priority=high（score<40 最弱优先）',
    !!blocks.lp && Array.isArray(blocks.lp.items) && blocks.lp.items.length > 0
    && blocks.lp.items.some((it) => it.topic === '高并发' && it.priority === 'high'));
  A('区块三 career_path：readiness/level/milestones 非空·弱项→「补短板」里程碑（overall=0→junior）',
    !!blocks.cp?.readiness && blocks.cp?.level === 'junior' && Array.isArray(blocks.cp?.milestones) && blocks.cp.milestones.length > 0
    && blocks.cp.milestones.some((m) => m.stage === '补短板' && m.goal.includes('高并发')));
  // 空集跳过（明文 /turn 过渡窗·承 S1 形状非回归）：图家族报告 failed（③ 段 fail-closed·钩子未达）
  // ——此处直行使 growth 钩子本体对零卡面试的尽力而为语义：assessment='skipped'·零失败计数·依赖段跳过。
  const skipOutcome = await generateGrowthChain(pool, OWNER, INTERVIEW_ID);
  A('零卡空集跳过：assessment=skipped·failedCount=0·学习/职业无源跳过（/turn 过渡窗·非失败）',
    skipOutcome.assessment === 'skipped' && skipOutcome.learning === 'skipped' && skipOutcome.career === 'skipped'
    && skipOutcome.failedCount === 0 && skipOutcome.fencedSkipped === false);

  // /growth 出点：profile.growth 同一 SQL 谓词 → toGrowthRow+deriveGrowth（domain 单一真相映射同源）。
  // ③ 段 IID2 已由默认钩子自动入曲线（63·不 gap）+ 本段 IID3（0·gap）→ 两点。
  const growthView = await asPrincipal(pool, OWNER, async (c) => {
    const rep = await c.query(
      "SELECT interview_id, overall, dimensions, created_at FROM assessment_report WHERE owner_user_id=$1 AND status='ready' AND interview_privacy_active(assessment_report.interview_id) ORDER BY created_at ASC, interview_id ASC",
      [OWNER]);
    const ans = await c.query<{ n: number }>(
      "SELECT count(*)::int AS n FROM score_card WHERE status IN ('practice_eligible','b_review_eligible')");
    return deriveGrowth(rep.rows.map(toGrowthRow), Number(ans.rows[0]?.n));
  });
  const growthIds = growthView.points.map((p) => p.interviewId);
  A('/growth 出点：deriveGrowth 两点在曲线（③ IID2 自动评估 + ③a IID3·成长链断→通）',
    growthView.points.length === 2 && growthIds.includes(IID2) && growthIds.includes(IID3));
  A('/growth 维度集合含弱项维度', growthView.dimensions.includes('高并发'));
  A('（辅·S1 已落面）Dashboard 读面 avgScore 非 null（score_card 均分）',
    (await asPrincipal(pool, OWNER, (c) => c.query<{ avg: string | null }>(
      "SELECT avg(deterministic_total) avg FROM score_card WHERE status IN ('practice_eligible','b_review_eligible')",
    ))).rows[0]?.avg != null);

  // S2 弱项偏置断言链：评估自动落库 → historicalWeakDimensions（只读投影）自动非空 → 稳定分区前移。
  const weak = await asPrincipal(pool, OWNER, (c) => historicalWeakDimensions(c, OWNER));
  A('S2 断链根因解除：historicalWeakDimensions 含「高并发」（此前恒空→偏置恒 no-op）', weak.includes('高并发'));
  const biasedNames = await biasByPastWeakness(pool, OWNER, ['项目经验', '高并发', '技术深度']);
  A('S2 弱项偏置非 no-op：biasByPastWeakness 弱项稳定前移·非弱项原序（生产函数直行使）',
    biasedNames[0] === '高并发' && biasedNames.length === 3 && biasedNames.slice(1).join('|') === '项目经验|技术深度');

  // 幂等（主形=直接重放 growth 钩子·席2 注记②）：三表现有 UNIQUE + version+1 → 零重复行。
  const growthReplay = await generateGrowthChain(pool, OWNER, IID3);
  const growthRows = await asPrincipal(pool, OWNER, async (c) => {
    const one = async (table: string) => Number((await c.query<{ n: number }>(
      `SELECT count(*)::int AS n FROM ${table} WHERE interview_id=$1`, [IID3])).rows[0]?.n);
    return { ar: await one('assessment_report'), lp: await one('learning_plan'), cp: await one('career_path') };
  });
  A('幂等：重放 growth 钩子三段全 generated·三表行数各=1（UNIQUE+version+1·零重复）',
    growthReplay.assessment === 'generated' && growthReplay.learning === 'generated' && growthReplay.career === 'generated'
    && growthReplay.failedCount === 0 && growthRows.ar === 1 && growthRows.lp === 1 && growthRows.cp === 1);

  // 尽力而为故障注入（IID4·deps.growthFaults 注入职业段失败）：报告不连累·依赖段保留·计数+1·不上抛。
  const IID4 = `${INTERVIEW_ID}-growth-fault`;
  await asPrincipal(pool, OWNER, (c) => c.query(
    "INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'created')", [IID4, OWNER],
  ));
  {
    const q4 = 'q-v1-t0-c0';
    const answer = '第 1 题作答：Redis 令牌桶限流（band=below·故障注入面试）。';
    await asPrincipal(pool, OWNER, (c) => publishRubricAndIssueContract(c, {
      interviewId: IID4, questionId: q4, stateVersion: 1, turn: 0,
      question: '请说明高并发限流的取舍？', competency: '高并发', difficulty: 3, kind: 'fundamental',
    }));
    const { request } = await asPrincipal(pool, OWNER, async (c) => {
      const submitted = await submitInterviewAnswer(c, {
        interviewId: IID4, questionId: q4, stateVersion: 1,
        clientSubmissionKey: `growth-fault-${q4}`, answer, privacyEpoch: SCORING_ISSUE_PRIVACY_EPOCH,
      });
      const request = await createScoreRequestForSubmission(c, {
        interviewId: IID4, questionId: q4, stateVersion: 1,
        submissionId: submitted.submissionId, artifactId: submitted.artifactId,
        canonicalBodyHmac: submitted.canonicalBodyHmac, privacyEpoch: submitted.privacyEpoch,
      });
      return { request };
    });
    A('③a 故障注入 fixture 供卡 score_request', request.created === true && request.replayed === false);
    const written = await writeScoreCardAfterProjection(
      { pool, owner: OWNER, leaseOwner: `growth-proof-scoring-${process.pid}` },
      { interviewId: IID4, questionId: q4, stateVersion: 1, answerText: answer, dispositions: fullSpanDisposition(answer, 'below') },
    );
    A('③a 故障注入 fixture 卡总分=0', written.kind === 'written' && written.deterministicTotal === 0);
  }
  await asPrincipal(pool, OWNER, (c) => enqueueReport(c, OWNER, IID4));
  const faultDrain = await drainReportsOnce(pool, OWNER, `growth-fault-report-${process.pid}`, {
    loadSummary: realLoadSummary,
    generate: reportGenerator(pool, OWNER, `${IID4}:report`, model),
    growthFaults: { career: new Error('injected_career_failure') },
  });
  A('尽力而为：职业段注入失败 → 报告仍 ready·drain 无异常上抛',
    faultDrain === 'ready' && (await asPrincipal(pool, OWNER, (c) => getReport(c, OWNER, IID4)))?.status === 'ready');
  const faultState = await asPrincipal(pool, OWNER, async (c) => {
    const ar = await c.query<{ n: number }>('SELECT count(*)::int AS n FROM assessment_report WHERE interview_id=$1', [IID4]);
    const lp = await c.query<{ n: number }>('SELECT count(*)::int AS n FROM learning_plan WHERE interview_id=$1', [IID4]);
    const cp = await c.query<{ n: number }>('SELECT count(*)::int AS n FROM career_path WHERE interview_id=$1', [IID4]);
    return { ar: Number(ar.rows[0]?.n), lp: Number(lp.rows[0]?.n), cp: Number(cp.rows[0]?.n) };
  });
  A('尽力而为：评估+学习仍在·职业缺位（依赖段不连累）', faultState.ar === 1 && faultState.lp === 1 && faultState.cp === 0);
  const faultReplay = await generateGrowthChain(pool, OWNER, IID4, { career: new Error('injected_career_failure') });
  A('尽力而为：failedCount=1·career=failed·评估/学习照常（结构化计数器核对）',
    faultReplay.failedCount === 1 && faultReplay.career === 'failed'
    && faultReplay.assessment === 'generated' && faultReplay.learning === 'generated'
    && faultReplay.fencedSkipped === false);

  console.log(`\n${failures === 0 ? '✓ 当前 v64 面试链路全部通过' : `✗ ${failures} 项失败`}`);
  await pool.end();
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(async (error) => {
  console.error(error);
  await pool.end().catch(() => undefined);
  process.exit(1);
});
