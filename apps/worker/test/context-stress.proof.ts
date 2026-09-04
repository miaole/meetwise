/**
 * 长上下文与大载荷真实回归。
 *
 * 这不是旧固定题单的影子 schema（影子数据库结构）测试：必须在完整迁移、v64
 * `(resume_id,resume_privacy_epoch)`（简历标识、隐私世代）和当前自适应 consumer
 * （消费者）上运行。它验证数万字多轮会话时，每次模型调用只水合当前答案，事件流
 * 不回放原文，完成 job（任务）也会清除答案载荷。
 */
import http from 'node:http';
import { randomUUID } from 'node:crypto';
import { MemorySaver } from '@langchain/langgraph';
import {
  answerHash, assertIsolatedTestTarget, asPrincipal, availableUnits,
  claimInterviewAnswer, completeIngestion, createPool, createResumeWithBlob,
  enqueueInterviewJob, getReport, reserveEntitlement, transitionResume,
} from '@meetwise/db';
import { capUserData, CONTEXT_TRUNCATION_MARKER, openAICompatibleClient, scriptedModelClient, type ModelClient } from '@meetwise/ai-runtime';
import { AnswerDto, TurnDto, UploadResumeDto } from '@meetwise/contracts';
import { ingestResume } from '@meetwise/domain';
import { interviewDispatchTick, type ConsumerDeps } from '../src/interview-consumer.ts';
import { evaluateAnswer, reportGenerator } from '../src/interview-service.ts';
import { drainReportsOnce } from '../src/report-worker.ts';

const pool = createPool();
let failures = 0;
const A = (name: string, condition: boolean) => {
  console.log(`${condition ? 'PASS' : 'FAIL'}  ${name}`);
  if (!condition) failures++;
};
const section = (title: string) => console.log(`\n──────── ${title} ────────`);
const RESUME = ['工作经历', '负责订单系统限流改造，使用 Redis 计数器和滑动窗口保护下游。', '技能', 'Redis、限流、分布式锁'].join('\n');

const recorded: Array<{ service: 'ask' | 'eval'; length: number }> = [];
function startEcho(): Promise<{ port: number; close: () => Promise<void> }> {
  const server = http.createServer((request, response) => {
    let body = '';
    request.on('data', (chunk) => { body += chunk; });
    request.on('end', () => {
      let system = '';
      let data = '';
      try {
        const messages = JSON.parse(body).messages as Array<{ content: string | Array<{ type: string; text?: string }> }>;
        system = String(messages?.[0]?.content ?? '');
        const content = messages?.[1]?.content;
        const text = typeof content === 'string' ? content : content?.find((part) => part.type === 'text')?.text ?? '';
        data = text.replace(/^<data-[^>]*>\n?/, '').replace(/\n?<\/data-[^>]*>$/, '');
      } catch { /* deterministic fake transport keeps malformed input empty */ }
      const wasTruncated = /内容过长已截断-[a-z0-9]+\]$/.test(data);
      let payload: unknown;
      if (system.includes('评估官')) {
        recorded.push({ service: 'eval', length: data.length });
        const answer = data.match(/(?:^|\n)回答:([\s\S]*)$/)?.[1]?.trim() ?? data.trim();
        payload = { score: 60, evidence: [{ criterion: `datalen:${data.length}`, quote: answer.slice(0, 80) }, { criterion: wasTruncated ? 'cut' : 'whole', quote: answer.slice(0, 80) }] };
      } else if (system.includes('规划官')) {
        payload = { competencies: ['高并发'] };
      } else {
        recorded.push({ service: 'ask', length: data.length });
        payload = { q: '请结合你的经验，说明高并发限流的关键取舍和验证方法。', refs: [] };
      }
      response.writeHead(200, { 'content-type': 'application/json' });
      response.end(JSON.stringify({ choices: [{ message: { content: JSON.stringify(payload) } }], usage: { prompt_tokens: 1, completion_tokens: 1 } }));
    });
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve({
    port: (server.address() as { port: number }).port,
    close: () => new Promise<void>((done) => server.close(() => done())),
  })));
}

async function prepareInterview(owner: string, interviewId: string): Promise<{ resumeId: string; epoch: number; before: number }> {
  await asPrincipal(pool, owner, async (c) => {
    await c.query("INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at) VALUES ($1,'paid',5.0,now()+interval '30 days')", [owner]);
  });
  const resumeId = await asPrincipal(pool, owner, async (c) => {
    const created = await createResumeWithBlob(c, owner, RESUME);
    await transitionResume(c, owner, created.resumeId, 'uploaded', 'ingesting');
    await completeIngestion(c, owner, created.resumeId, ingestResume(RESUME));
    return created.resumeId;
  });
  const epoch = await asPrincipal(pool, owner, async (c) => Number((await c.query<{ privacy_epoch: number }>(
    'SELECT privacy_epoch FROM resume WHERE id=$1 AND owner_user_id=$2', [resumeId, owner],
  )).rows[0]?.privacy_epoch));
  let before = 0;
  await asPrincipal(pool, owner, async (c) => {
    await c.query("INSERT INTO interview(id,owner_user_id,status,resume_id,resume_privacy_epoch) VALUES ($1,$2,'created',$3,$4)", [interviewId, owner, resumeId, epoch]);
    before = await availableUnits(c, owner);
    await reserveEntitlement(c, owner, interviewId, 'mock_interview', 1);
  });
  return { resumeId, epoch, before };
}

function adaptiveDeps(owner: string, model: ModelClient, maxTurns: number): ConsumerDeps {
  return {
    pool,
    cp: new MemorySaver() as any,
    model,
    leaseOwner: `stress-worker-${owner}-${process.pid}`,
    adaptive: {
      role: '后端工程师',
      maxTurns,
      absoluteMaxTurns: maxTurns,
      localRetrieve: async () => [],
      webExplore: async () => [],
    },
  };
}

async function currentIssuedQuestion(owner: string, interviewId: string) {
  return asPrincipal(pool, owner, async (c) => (await c.query<{
    question_id: string; state_version: number; turn: number;
  }>(
    "SELECT question_id,state_version,turn FROM interview_question WHERE interview_id=$1 AND status='issued' ORDER BY state_version DESC LIMIT 1",
    [interviewId],
  )).rows[0]);
}

async function isCompleted(owner: string, interviewId: string) {
  return asPrincipal(pool, owner, async (c) => (await c.query<{ status: string }>(
    'SELECT status FROM interview WHERE id=$1', [interviewId],
  )).rows[0]?.status === 'completed');
}

async function main() {
  section('A. 入口上下文封顶与码点安全');
  const evalCap = capUserData('答'.repeat(18_000), 'mock-interview.evaluate');
  A('18000 字评估输入封顶至 ≤ 12000', evalCap.length <= 12_000 && evalCap.endsWith(CONTEXT_TRUNCATION_MARKER));
  A('50000 字评估输入仍封顶至 ≤ 12000', capUserData('答'.repeat(50_000), 'mock-interview.evaluate').length <= 12_000);
  A('80000 字默认输入封顶至 ≤ 20000', capUserData('字'.repeat(80_000)).length <= 20_000);
  A('正常短答案不被篡改', capUserData('正常长度的一段作答。', 'mock-interview.evaluate') === '正常长度的一段作答。');
  A('调用方 nonce（随机一次性标识）截断标记被保留', capUserData('x'.repeat(20_000), 'mock-interview.evaluate', '[CUT-9z]').endsWith('[CUT-9z]'));
  const emoji = capUserData('😀'.repeat(20_000), 'mock-interview.evaluate');
  const body = emoji.slice(0, emoji.length - CONTEXT_TRUNCATION_MARKER.length);
  const last = body.charCodeAt(body.length - 1);
  A('emoji 截断不留下孤立高代理项', !(last >= 0xd800 && last <= 0xdbff));

  section('B. 边缘契约在落库前拒绝异常大输入');
  const turnBody = (answer: string) => ({ questionId: 'q-v1-t0-c0', stateVersion: 1, answerId: randomUUID(), answerHash: answerHash(answer), turn: 0, answer });
  A('TurnDto（答题契约）8001 字拒绝、8000 字接受', !TurnDto.safeParse(turnBody('x'.repeat(8_001))).success && TurnDto.safeParse(turnBody('x'.repeat(8_000))).success);
  A('AnswerDto（旧答题契约）8001 字拒绝', !AnswerDto.safeParse({ answer: 'x'.repeat(8_001) }).success);
  A('UploadResumeDto（上传简历契约）60001 字拒绝、60000 字接受', !UploadResumeDto.safeParse({ text: 'x'.repeat(60_001) }).success && UploadResumeDto.safeParse({ text: 'x'.repeat(60_000) }).success);

  await assertIsolatedTestTarget(pool);
  // BAILIAN-04: 本地 loopback echo（http）仅测试专用 override 缝放行（NODE_ENV=test + MODEL_TEST_TRANSPORT_OVERRIDES=1）。
  process.env.NODE_ENV = 'test';
  process.env.MODEL_TEST_TRANSPORT_OVERRIDES = '1';
  const echo = await startEcho();
  const echoModel = openAICompatibleClient({ baseUrl: `http://127.0.0.1:${echo.port}`, apiKey: 'test', model: 'echo' });

  section('C. 真 invoke（模型网关）路径：截断不可由用户伪造');
  const directOwner = `stress-direct-${process.pid}`;
  await asPrincipal(pool, directOwner, async (c) => {
    await c.query("INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at) VALUES ($1,'paid',5.0,now()+interval '30 days')", [directOwner]);
  });
  const direct = await evaluateAnswer(pool, directOwner, `stress-direct-${Date.now()}`, '请说明限流方案', '答'.repeat(18_000), echoModel);
  const directLength = Number((direct.evidence[0] ?? 'datalen:0').split(':')[1]);
  A('18000 字经真实 HTTP 模型适配器实收 ≤ 12000', directLength > 0 && directLength <= 12_000);
  A('真实截断带 nonce 标记', direct.evidence[1] === 'cut');
  const forged = await evaluateAnswer(pool, directOwner, `stress-forged-${Date.now()}`, '正常题', '正常作答 …[内容过长已截断] 后续仍有内容', echoModel);
  A('用户伪造无 nonce 截断字样不会被当作系统截断', forged.evidence[1] === 'whole');

  section('D. 数万字多轮经 v64 队列与当前自适应图，逐轮评估不累积 transcript');
  const owner = `stress-graph-${process.pid}`;
  const interviewId = `stress-graph-${Date.now()}`;
  await prepareInterview(owner, interviewId);
  const graphDeps = adaptiveDeps(owner, echoModel, 6);
  recorded.length = 0;
  await asPrincipal(pool, owner, (c) => enqueueInterviewJob(c, owner, interviewId, 'start', {}, 0));
  await interviewDispatchTick(graphDeps);
  const answer = '我的作答：' + '具体技术细节、指标、取舍与复盘。'.repeat(650);
  let turns = 0;
  while (turns < 8 && !await isCompleted(owner, interviewId)) {
    const question = await currentIssuedQuestion(owner, interviewId);
    if (!question) break;
    const input = { questionId: question.question_id, stateVersion: Number(question.state_version), turn: Number(question.turn), answerId: randomUUID(), answerHash: answerHash(answer), answer };
    const claim = await asPrincipal(pool, owner, (c) => claimInterviewAnswer(c, owner, interviewId, input));
    A(`第 ${input.turn + 1} 轮身份账本接受`, claim.status === 'accepted');
    await asPrincipal(pool, owner, (c) => enqueueInterviewJob(c, owner, interviewId, 'answer', input, input.turn + 1));
    await interviewDispatchTick(graphDeps);
    turns++;
  }
  const evalLengths = recorded.filter((item) => item.service === 'eval').map((item) => item.length);
  const totalConversation = turns * answer.length;
  const spread = evalLengths.length ? Math.max(...evalLengths) - Math.min(...evalLengths) : Infinity;
  A('当前图实际完成至少 3 次评估', evalLengths.length >= 3);
  A(`累计会话达到 ≥ 30000 字（实际 ${Math.round(totalConversation / 1000)}k）`, totalConversation >= 30_000);
  A('每次评估请求 ≤ 12000 字', evalLengths.every((length) => length <= 12_000));
  A(`同等长度回答的评估输入极差 < 50（实际 ${spread}）`, spread < 50);

  section('E. 8000 字答案在 v64 队列中短暂存在、消费后清除，SSE 不回放正文');
  const largeOwner = `stress-large-${process.pid}`;
  const largeInterview = `stress-large-${Date.now()}`;
  const prepared = await prepareInterview(largeOwner, largeInterview);
  const scripted: ModelClient = scriptedModelClient({
    'planner.competencies': () => ({ ok: true, raw: { competencies: ['Redis'] } }),
    'interviewer.ask': () => ({ ok: true, raw: { q: '请说明 Redis 限流实现。', refs: [] } }),
    'mock-interview.evaluate': () => ({ ok: true, raw: { score: 80, evidence: [{ criterion: 'Redis', quote: 'Redis' }] } }),
    'report.generate': () => ({ ok: true, raw: { overall: 80, sections: [{ title: '总评', body: '通过。' }] } }),
  });
  const largeDeps = adaptiveDeps(largeOwner, scripted, 2);
  await asPrincipal(pool, largeOwner, (c) => enqueueInterviewJob(c, largeOwner, largeInterview, 'start', {}, 0));
  await interviewDispatchTick(largeDeps);
  let maximumQueuedAnswer = 0;
  for (let guard = 0; guard < 4 && !await isCompleted(largeOwner, largeInterview); guard++) {
    const question = await currentIssuedQuestion(largeOwner, largeInterview);
    if (!question) break;
    const largeAnswer = guard === 0 ? `Redis${'答'.repeat(7_995)}` : 'Redis 计数器与滑动窗口。';
    const input = { questionId: question.question_id, stateVersion: Number(question.state_version), turn: Number(question.turn), answerId: randomUUID(), answerHash: answerHash(largeAnswer), answer: largeAnswer };
    A(`8000 字链路第 ${input.turn + 1} 轮身份领取`, (await asPrincipal(pool, largeOwner, (c) => claimInterviewAnswer(c, largeOwner, largeInterview, input))).status === 'accepted');
    await asPrincipal(pool, largeOwner, (c) => enqueueInterviewJob(c, largeOwner, largeInterview, 'answer', input, input.turn + 1));
    const queuedLength = await asPrincipal(pool, largeOwner, async (c) => Number((await c.query<{ length: number }>(
      "SELECT length(payload->>'answer')::int AS length FROM interview_job WHERE interview_id=$1 AND kind='answer' AND seq=$2",
      [largeInterview, input.turn + 1],
    )).rows[0]?.length ?? 0));
    maximumQueuedAnswer = Math.max(maximumQueuedAnswer, queuedLength);
    await interviewDispatchTick(largeDeps);
  }
  const largeState = await asPrincipal(pool, largeOwner, async (c) => {
    const payload = await c.query<{ payload: unknown }>('SELECT payload FROM interview_job WHERE interview_id=$1 AND kind=\'answer\'', [largeInterview]);
    const events = await c.query<{ payload: unknown }>('SELECT payload FROM interview_event WHERE stream_key=$1', [largeInterview]);
    const unfinished = await c.query<{ n: number }>("SELECT count(*)::int AS n FROM interview_job WHERE interview_id=$1 AND status!='done'", [largeInterview]);
    return { payload: payload.rows, events: events.rows, unfinished: Number(unfinished.rows[0]?.n) };
  });
  A('队列在消费前确实承载 8000 字答案', maximumQueuedAnswer === 8_000);
  A('消费完成后 answer payload（回答载荷）已清除', largeState.payload.every((row) => !Object.prototype.hasOwnProperty.call((row.payload ?? {}) as object, 'answer')));
  A('SSE（服务器推送事件）载荷不含 8000 字正文且每条 < 500 字', largeState.events.every((row) => {
    const text = JSON.stringify(row.payload);
    return text.length < 500 && !text.includes('答答答答答答答答答答');
  }));
  A('大答案链路所有 job 收口为 done、额度精确扣 1', largeState.unfinished === 0 && (await asPrincipal(pool, largeOwner, (c) => availableUnits(c, largeOwner))) === prepared.before - 1);
  const report = await asPrincipal(pool, largeOwner, (c) => getReport(c, largeOwner, largeInterview));
  const reportResult = await drainReportsOnce(pool, largeOwner, `stress-report-${process.pid}`, {
    loadSummary: () => ({ interviewId: largeInterview, questionCount: 2, scores: [80, 80] }),
    generate: reportGenerator(pool, largeOwner, `${largeInterview}:report`, scripted),
  });
  A('大答案不阻塞报告舱壁', report?.status === 'queued' && reportResult === 'ready');

  await echo.close();
  console.log(`\n${failures === 0 ? '✓ 长上下文真实 v64 队列/图/报告链路全部通过' : `✗ ${failures} 项失败`}`);
  await pool.end();
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(async (error) => {
  console.error(error);
  await pool.end().catch(() => undefined);
  process.exit(1);
});
