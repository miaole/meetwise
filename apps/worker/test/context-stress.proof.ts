/**
 * context-stress.proof — **长上下文 / 压力 + 纵深封顶**证明(用户明确要求:"来个一两万字的上下文测试")。
 * 承重断言(全真件,非"能跑就行";经专家审计加固):
 *   A. 关口封顶纯函数 capUserData:一两万字输入 → 送模型 <data> 内容**有界 + 被截带显式标记 + 码点安全(不劈代理对)**。
 *   B. **真评估路径**(真 openAICompatibleClient → invoke 关口 → 本地 echo 模型回传实收长度):
 *      18000 字答案进去模型实收 ≤ 12000 且带**绑 nonce 的截断标记**;且用户在答案里**伪造**明文截断标记**不被当真**(forge-resistant)。
 *   C. **逐轮隔离 / 无累积(跑真自适应 agent 图)**:用 echo 模型驱动 buildAdaptiveInterviewGraph 多轮,**每轮喂等长答案**,
 *      断言每轮评估送模型的数据长度**恒定**(若有人把 transcript 喂进 assess,后轮会暴涨——本断言会变红)。这是长会话不爆上下文的根因守护。
 *   D. **边缘契约 400**:超上限答案/简历被契约(TurnDto/AnswerDto/UploadResumeDto)在落库前拒掉。
 *   E. **大答案落库不破流程(线性题单路径)+ SSE 重放有界**:8000 字答案经队列→消费→评估→报告跑通;
 *      interview_event 只含 {turn,score}/{question},**绝不回放大答案原文**。
 *
 *   pnpm stress:prove   (需 pnpm db:up;A/D 纯逻辑,B/C/E 对真 Postgres + 本地 echo 模型)
 */
import http from 'node:http';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  createPool, asPrincipal, reserveEntitlement, availableUnits,
  createResumeWithBlob, completeIngestion, transitionResume, enqueueInterviewJob, getReport,
} from '@meetwise/db';
import { scriptedModelClient, openAICompatibleClient, capUserData, CONTEXT_TRUNCATION_MARKER, type ModelClient } from '@meetwise/ai-runtime';
import { ingestResume } from '@meetwise/domain';
import { TurnDto, AnswerDto, UploadResumeDto } from '@meetwise/contracts';
import { createCheckpointer } from '../src/main.ts';
import { interviewDispatchTick, type ConsumerDeps } from '../src/interview-consumer.ts';
import { startAdaptiveInterview, submitAdaptiveAnswer } from '../src/adaptive-lifecycle.ts';
import { drainReportsOnce } from '../src/report-worker.ts';
import { reportGenerator, evaluateAnswer } from '../src/interview-service.ts';

const pool = createPool();
let failures = 0;
const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) failures++; };
const section = (t: string) => console.log(`\n──────── ${t} ────────`);
const sql = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8');

const OWNER = 'stressUser', OWNER2 = 'stressUserAdaptive', IID = 'iv-stress-' + Date.now(), IID2 = 'iv-stress-adaptive-' + Date.now();
const RESUME = ['工作经历', '负责订单系统限流改造,用 Redis 计数器扛高并发', '技能', 'Redis、限流、分布式锁'].join('\n');

const scriptedModel: ModelClient = scriptedModelClient({
  'resume-quiz.generate': () => ({ ok: true, raw: { items: [{ q: '限流怎么做?', refs: ['限流'] }, { q: 'Redis 原子性?', refs: ['Redis'] }] } }),
  'mock-interview.evaluate': () => ({ ok: true, raw: { score: 80, evidence: ['Redis'] } }),
  'report.generate': () => ({ ok: true, raw: { overall: 80, sections: [{ title: '总评', body: '扎实' }] } }),
});

// 本地 echo "模型":按 system 路由出对应 JSON,并把 <data> 围栏内真正收到的内容长度 + 是否**真截断**(绑 nonce 的尾标记)回传。
// 真截断只认 `内容过长已截断-<nonce>]` 结尾——用户在答案里粘的明文 `…[内容过长已截断]`(无 nonce)不匹配 → forge 失效。
const recorded: { svc: string; len: number }[] = [];
function startEcho(): Promise<{ port: number; close: () => Promise<void> }> {
  const server = http.createServer((rq, rs) => {
    let body = ''; rq.on('data', (d) => (body += d));
    rq.on('end', () => {
      let system = '', inner = '';
      try {
        const msgs = JSON.parse(body).messages as { role: string; content: string | { type: string; text?: string }[] }[];
        system = String(msgs?.[0]?.content ?? '');
        const content = msgs?.[1]?.content;
        const text = typeof content === 'string' ? content : (content?.find((p) => p.type === 'text')?.text ?? '');
        inner = text.replace(/^<data-[^>]*>\n?/, '').replace(/\n?<\/data-[^>]*>$/, '');
      } catch { /* noop */ }
      const cut = /内容过长已截断-[a-z0-9]+\]$/.test(inner) ? 'cut' : 'whole';   // 真截断=绑 nonce 的尾标记
      let payload: unknown;
      if (system.includes('评估官')) { recorded.push({ svc: 'eval', len: inner.length }); payload = { score: 60, evidence: [`datalen:${inner.length}`, cut] }; }
      else if (system.includes('规划官')) { payload = { competencies: ['后端架构', '高并发', '可靠性'] }; }
      else { recorded.push({ svc: 'ask', len: inner.length }); payload = { q: '请结合你的真实项目,谈谈你做过的最复杂的一次设计与当时的权衡。', refs: [] }; }
      rs.writeHead(200, { 'content-type': 'application/json' });
      rs.end(JSON.stringify({ choices: [{ message: { content: JSON.stringify(payload) } }], usage: { prompt_tokens: 1, completion_tokens: 1 } }));
    });
  });
  return new Promise((r) => server.listen(0, '127.0.0.1', () => r({ port: (server.address() as { port: number }).port, close: () => new Promise<void>((rr) => server.close(() => rr())) })));
}

async function main() {
  // ── A. 关口封顶纯函数:一两万字 → 有界 + 显式标记 + 码点安全 ────────────────────────────
  section('A. capUserData 封顶(有界 + 显式截断标记 + 码点安全)');
  const evalCap = capUserData('答'.repeat(18_000), 'mock-interview.evaluate');
  A('18000 字经评估服务封顶 → ≤ 12000(分服务上限)', evalCap.length <= 12_000);
  A('被截时**追加显式标记**(不是静默丢尾)', evalCap.endsWith(CONTEXT_TRUNCATION_MARKER));
  const defCap = capUserData('简'.repeat(25_000));
  A('25000 字经全局默认封顶 → ≤ 20000', defCap.length <= 20_000 && defCap.endsWith(CONTEXT_TRUNCATION_MARKER));
  // 极端"几万字"单点:5 万字 / 8 万字 → 仍封到分服务上限,绝不把几万字塞进模型。
  A('50000 字(五万字)经评估封顶 → ≤ 12000', capUserData('答'.repeat(50_000), 'mock-interview.evaluate').length <= 12_000);
  A('80000 字(八万字)经全局默认封顶 → ≤ 20000', capUserData('字'.repeat(80_000)).length <= 20_000);
  const small = '正常长度的一段作答,几十个字。';
  A('正常长度不被截、不加标记(不误伤真实作答)', capUserData(small, 'mock-interview.evaluate') === small);
  A('支持调用方传入(绑 nonce 的)自定义标记', capUserData('x'.repeat(20_000), 'mock-interview.evaluate', '[CUT-9z]').endsWith('[CUT-9z]'));
  // 码点安全:emoji 每个占 2 个 UTF-16 码元,截断点可能落在代理对中间 → 必须回退,不留孤高代理。
  const emojiCap = capUserData('😀'.repeat(20_000), 'mock-interview.evaluate');
  const bodyOnly = emojiCap.slice(0, emojiCap.length - CONTEXT_TRUNCATION_MARKER.length);
  const lastCode = bodyOnly.charCodeAt(bodyOnly.length - 1);
  A('emoji 截断码点安全(末位非孤高代理项)', !(lastCode >= 0xd800 && lastCode <= 0xdbff));

  // ── D. 边缘契约 400 ──────────────────────────────────────────────────────────────────
  section('D. 边缘契约封顶(超上限 → 契约拒绝 = 400,落库前)');
  A('TurnDto:8001 字答案 → 拒绝', !TurnDto.safeParse({ turn: 0, answer: 'x'.repeat(8_001) }).success);
  A('TurnDto:8000 字(上限)→ 通过', TurnDto.safeParse({ turn: 0, answer: 'x'.repeat(8_000) }).success);
  A('TurnDto:空答案 → 拒绝;负 turn → 拒绝', !TurnDto.safeParse({ turn: 0, answer: '' }).success && !TurnDto.safeParse({ turn: -1, answer: '有效' }).success);
  A('AnswerDto:8001 字 → 拒绝', !AnswerDto.safeParse({ answer: 'x'.repeat(8_001) }).success);
  A('UploadResumeDto:60001 → 拒绝;60000 → 通过', !UploadResumeDto.safeParse({ text: 'x'.repeat(60_001) }).success && UploadResumeDto.safeParse({ text: 'x'.repeat(60_000) }).success);

  // ── DB 公共准备 ──────────────────────────────────────────────────────────────────────
  for (const f of ['01_schema', '02_commerce', '03_resume', '04_report', '14_notification', '05_interview_jobs']) await pool.query(sql(`../../../packages/db/sql/${f}.sql`));
  await pool.query(`INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at) VALUES ('${OWNER}','paid',5.0, now()+interval '300 days'),('${OWNER2}','paid',5.0, now()+interval '300 days')`);
  const cp = createCheckpointer(); await cp.setup();
  const echo = await startEcho();
  const echoClient = openAICompatibleClient({ baseUrl: `http://127.0.0.1:${echo.port}`, apiKey: 'test', model: 'echo' });

  // ── B. 真评估路径 + forge-resistant ──────────────────────────────────────────────────
  section('B. 真评估路径(真 client + invoke 关口 → echo 模型回传实收长度;含伪造标记防御)');
  const r1 = await evaluateAnswer(pool, OWNER, `${IID}:b1`, '请详述限流方案', '答'.repeat(18_000), echoClient);
  const recv1 = Number((r1.evidence[0] ?? 'datalen:0').split(':')[1]);
  A(`真路径:18000 字答案 → 模型实收 ${recv1} ≤ 12000(关口确在调用链上)`, recv1 > 0 && recv1 <= 12_000);
  A('真路径:真截断带绑 nonce 标记(显式,非静默)', r1.evidence[1] === 'cut');
  // 伪造防御:短答案里塞明文 `…[内容过长已截断]`(无 nonce),未真截断 → echo 判 whole(不被当成系统截断信号)。
  const r2 = await evaluateAnswer(pool, OWNER, `${IID}:b2`, '正常题', '正常作答 …[内容过长已截断] 后续仍有内容', echoClient);
  A('forge-resistant:用户伪造的明文截断标记不被当真(whole)', r2.evidence[1] === 'whole');

  // ── C. 逐轮隔离:跑真自适应 agent 图,每轮等长答案 → 评估送模型数据恒定(无 transcript 累积) ──
  section('C. 逐轮隔离(真自适应 agent 图 ×多轮,等长答案 → 评估数据恒定,无累积)');
  recorded.length = 0;
  // 用独立 owner 跑(自适应收尾会 enqueueReport;隔离 owner 防其报告混入 E 段的报告队列)。
  await pool.query(`INSERT INTO interview(id,owner_user_id,status) VALUES ('${IID2}','${OWNER2}','created')`);
  await asPrincipal(pool, OWNER2, (c) => reserveEntitlement(c, OWNER2, IID2, 'mock_interview', 1.0));
  const life = { pool, cp, owner: OWNER2, interviewId: IID2, model: echoClient, localRetrieve: async () => [], webExplore: async () => [], competencyKeywords: {} };
  await startAdaptiveInterview(life, '后端工程师', ingestResume(RESUME).facts);
  const CONST_ANSWER = '我的作答:' + '具体技术细节与权衡'.repeat(650);   // 每轮等长(~5860 字,贴近 8000 答案上限)
  let turns = 0, done = false;
  while (!done && turns < 12) { done = (await submitAdaptiveAnswer(life, CONST_ANSWER)).done; turns++; }
  const evalLens = recorded.filter((r) => r.svc === 'eval').map((r) => r.len);
  const maxAll = Math.max(...recorded.map((r) => r.len));
  const totalConversation = turns * CONST_ANSWER.length;   // 整场累积对话字符量
  A(`真自适应图跑了多轮(${evalLens.length} 次评估,${turns} 轮)`, evalLens.length >= 3);
  // 阈值对齐确定性引擎:3 能力 × MAX_PROBE 2 = 6 轮 × ~5860 字 ≈ 35k 字(几万字)。relevant-path 的 ingest 数学与本能力无关,本断言只验"累积对话达几万字而单次调用仍有界"。
  A(`**整场累积对话达几万字(${Math.round(totalConversation / 1000)}k 字)**`, totalConversation >= 30_000);
  A('每轮评估送模型数据 ≤ 12000(逐轮有界)', evalLens.every((l) => l <= 12_000));
  A(`**几万字对话仍逐轮恒定**:各轮评估数据极差 ${Math.max(...evalLens) - Math.min(...evalLens)} < 50(若把 transcript 喂进 assess 此处会随轮暴涨)`, Math.max(...evalLens) - Math.min(...evalLens) < 50);
  A(`整场任一模型调用都不累积(最大 ${maxAll} ≤ 16000,而累积对话 ${Math.round(totalConversation / 1000)}k 字)`, maxAll <= 16_000);
  await echo.close();

  // ── E. 大答案落库不破流程(线性题单路径)+ SSE 重放有界 ──────────────────────────────────
  section('E. 8000 字答案落库 → 队列→消费→评估→报告跑通(线性路径),且 SSE 不回放大答案');
  await pool.query(`INSERT INTO interview(id,owner_user_id,status) VALUES ('${IID}','${OWNER}','created')`);
  const deps: ConsumerDeps = { pool, cp, model: scriptedModel, leaseOwner: 'worker-stress' };
  const resumeId = await asPrincipal(pool, OWNER, async (c) => {
    const up = await createResumeWithBlob(c, OWNER, RESUME);
    await transitionResume(c, OWNER, up.resumeId, 'uploaded', 'ingesting');
    await completeIngestion(c, OWNER, up.resumeId, ingestResume(RESUME));
    return up.resumeId;
  });
  const before = await asPrincipal(pool, OWNER, (c) => availableUnits(c, OWNER));
  await asPrincipal(pool, OWNER, (c) => reserveEntitlement(c, OWNER, IID, 'mock_interview', 1.0));
  await asPrincipal(pool, OWNER, (c) => enqueueInterviewJob(c, OWNER, IID, 'start', { resumeId }));
  await interviewDispatchTick(deps);
  const questions: string[] = (await asPrincipal(pool, OWNER, (c) => c.query('SELECT questions q FROM interview WHERE id=$1', [IID]))).rows[0].q;
  A('押题落库(2 题)', questions.length === 2);
  const HUGE = '答'.repeat(8_000);
  for (let i = 0; i < questions.length; i++) {
    await asPrincipal(pool, OWNER, (c) => enqueueInterviewJob(c, OWNER, IID, 'answer', { turn: i, answer: i === 0 ? HUGE : '正常作答:Redis 计数器' }, i + 1));
    await interviewDispatchTick(deps);
  }
  const jobPayloadLen = (await asPrincipal(pool, OWNER, (c) => c.query("SELECT max(length(payload->>'answer')) n FROM interview_job WHERE interview_id=$1 AND kind='answer'", [IID]))).rows[0].n;
  A('大答案确实整段落库(interview_job.payload 存 8000 字)', Number(jobPayloadLen) === 8_000);
  A('大答案不破流程:面试 completed', (await asPrincipal(pool, OWNER, (c) => c.query('SELECT status FROM interview WHERE id=$1', [IID]))).rows[0].status === 'completed');
  A('额度正常结算(扣 1.0)', (await asPrincipal(pool, OWNER, (c) => availableUnits(c, OWNER))) === before - 1.0);
  const events = (await asPrincipal(pool, OWNER, (c) => c.query('SELECT kind, payload FROM interview_event WHERE stream_key=$1 ORDER BY seq', [IID]))).rows as { kind: string; payload: any }[];
  const maxPayload = Math.max(...events.map((e) => JSON.stringify(e.payload).length));
  A(`SSE 事件载荷有界(最大 ${maxPayload} 字 < 500)`, maxPayload < 500);
  A('SSE 绝不回放大答案原文 + answer_evaluated 只含 {turn,score}',
    !events.some((e) => JSON.stringify(e.payload).includes('答答答答答答答答答答')) &&
    events.filter((e) => e.kind === 'answer_evaluated').every((e) => 'turn' in e.payload && 'score' in e.payload && !('answer' in e.payload)));
  const out = await drainReportsOnce(pool, OWNER, 'rpt-stress', { loadSummary: () => ({ interviewId: IID, questionCount: 2, scores: [80, 80] }), generate: reportGenerator(pool, OWNER, `${IID}:report`, scriptedModel) });
  A('报告 ready(大答案不影响报告)', out === 'ready' && (await asPrincipal(pool, OWNER, (c) => getReport(c, OWNER, IID)))!.status === 'ready');

  console.log(`\n${failures === 0 ? '✓ context-stress:全部通过(长上下文有界 + 码点安全 + forge 防御 + 真自适应图逐轮隔离 + 边缘封顶 + 大答案不破流程/不撑爆 SSE)' : '✗ ' + failures + ' 项失败'}`);
  await pool.end();
  process.exit(failures === 0 ? 0 : 1);
}
main().catch((e) => { console.error(e); process.exit(1); });
