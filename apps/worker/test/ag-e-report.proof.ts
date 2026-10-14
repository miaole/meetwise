/**
 * AG 修复轨刀 E proof（AG-03 报告重试真实化 + EG-A1 单调派发序号 + AG-10 守卫同批）。
 *
 * REQUEST: ai-docs/delivery/harness/ag-e-report-REQUEST.md rev2 · line/ag-e-report · 双审 BOTH PASS + 协调方常设 loop 授权
 *
 * 注入点（§2-①·EXEC 定深度=全链 invoke 形）：本地 http 脚本 provider（沿 ag-b-classify.proof /
 * context-stress.proof 既有缝 NODE_ENV=test + MODEL_TEST_TRANSPORT_OVERRIDES=1）+ 真实隔离 PG +
 * **生产组合根闭包**（main.ts reportWorkerDeps·loadSummary 摘要面测试注入=report-bulkhead 同先例）
 * + drainReportsOnce 生产三事务骨架。零真实 provider 外呼（est live=0）。
 *
 * 断言族（§2 五臂）：
 *  A. AG-03 主臂：a1 假体 provider 返回 businessValidate 拒绝（段落重复）→ markReportFailed → sweep
 *     重排 → 第二派发：provider 调用计数=2（真调模型·非 cached/failed 终态重放）+ 新账本行键
 *     `${id}:report:a2` ≠ `:a1`（:a1 failed 行独立在册未被重放）。
 *  B. EG-A1 手动重试臂：a1 failed 后 requeueFailedReport（attempts=0/next_attempt_at=NULL·job 层
 *     语义原样）→ 再派发键=`:a2` 绝不为 `:a1`（派发序跨预算轮单调·旧 failed 行零重放·provider 计数+1）；
 *     终态 attempts=1 ≠ dispatch_seq=2（两列解耦的机器证明）。
 *  C. 上限臂：连续 3 次假体失败 → 键序恰 a1/a2/a3（各真调一次）→ quarantined 终态 → 无 a4 派发
 *     （drain=idle·provider 计数封冻）·sweep 零接管。
 *  D. AG-10 臂（eligible=0）：C 端 unbound 全 skip 场真实 graph 收尾 → 报告行确定性终态
 *     ready+模板 content（零模型：报告键模型调用行=0·attempts=0·dispatch_seq=0）+ report_ready 事件
 *     恰一 + 无 doomed 重排循环（drain=idle·sweep 零接管）；**B 端 bound 对照臂**：
 *     markApplicationNoEligibleScore 终态 + assessment_unavailable 事件 + 零 ai_report 行（原样零触）。
 *  E. 静态门：键串 charset 门（`${uuid}:report:a12` 形）；requeueFailedReport 源码不含派发序复位
 *     （EG-A1 铁律）+ claimReport CAS 同语句 `dispatch_seq=dispatch_seq+1`；MAX_REPORT_ATTEMPTS=3
 *     既有值；报告链五文件 reserve/confirm/release 非测试调用=0（P3 同形复核·含 adaptive-lifecycle
 *     收尾新写入面）；0130 终态重放语义原样（本刀=换键绕行非改重放）；迁移 0178 列在场（隔离库实 schema）。
 *
 *   pnpm ag-e-report:prove   （root · 隔离库 runner）
 *   pnpm -C apps/worker prove:ag-e-report
 */
import http from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { MemorySaver } from '@langchain/langgraph';
import {
  asPrincipal, assertIsolatedTestTarget, createPool, reserveEntitlement, availableUnits,
  completeInterviewAndConfirm, enqueueReport, requeueFailedReport,
  NO_EVIDENCE_REPORT_CONTENT, MAX_REPORT_ATTEMPTS,
  createJob, classifyJobRoute, inviteCandidate, startApplicationInterview, claimInterviewAnswer, answerHash,
} from '@meetwise/db';
import { openAICompatibleClient, registerBaselineMetrics, scriptedModelClient, type ModelClient, type ModelCostPolicy } from '@meetwise/ai-runtime';
import { startAdaptiveInterview, submitAdaptiveAnswer, type AdaptiveLifecycleDeps } from '../src/adaptive-lifecycle.ts';
import { drainReportsOnce, sweepReportsOnce, reportDispatchKey, type ReportWorkerDeps } from '../src/report-worker.ts';
import { reportWorkerDeps } from '../src/main.ts';

process.env.NODE_ENV = 'test';
process.env.MODEL_TEST_TRANSPORT_OVERRIDES = '1';   // 本地 http loopback 脚本 provider 缝（context-stress :146 同源）
process.env.RAG_JOB_ROUTE_INPUT_HASH_KEY ??= 'ag-e-report-job-route-input-hmac-proof-key-not-production-01';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
function readRepo(rel: string): string {
  const p = resolve(repoRoot, rel);
  if (!existsSync(p)) throw new Error(`missing ${rel}`);
  return readFileSync(p, 'utf8');
}

registerBaselineMetrics();

const pool = createPool();
let fail = 0;
const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };
const section = (t: string) => console.log(`\n──────── ${t} ────────`);
const S = Date.now().toString(36);
const OWN = (k: string) => `ag-e-${k}-${S}`;
const IID = (k: string) => `iv-age-${k}-${S}`;

// ── 脚本 provider（ag-b-classify 同形制·确定性零外呼）────────────────────────────
type Mode = 'dupsections' | 'good';
let mode: Mode = 'good';
let providerRequests = 0;
function startScriptedProvider(): Promise<{ port: number; close: () => Promise<void> }> {
  const server = http.createServer((_request, response) => {
    providerRequests++;
    const usage = { prompt_tokens: 90, completion_tokens: 30 };
    const content = mode === 'good'
      ? JSON.stringify({ sections: [{ title: '总评', body: 'candidate shows solid reasoning across turns' }] })
      // schema 合法（两段均非空）但 businessValidate 必拒：report_duplicate_section
      : JSON.stringify({ sections: [{ title: 't', body: 'dup' }, { title: 't', body: 'dup' }] });
    response.writeHead(200, { 'content-type': 'application/json' });
    response.end(JSON.stringify({ choices: [{ message: { content } }], usage }));
  });
  return new Promise((res) => server.listen(0, '127.0.0.1', () => res({
    port: (server.address() as { port: number }).port,
    close: () => new Promise<void>((done) => server.close(() => done())),
  })));
}

const SCOPE = `ag-e-scope-${S}`;
const PROVIDER = `ag-e-provider-${S}`;
const MODEL = 'ag-e-report-echo';
const policy: ModelCostPolicy = {
  scopeId: SCOPE, provider: PROVIDER, model: MODEL, region: 'cn-proof', priceRevision: 'ag-e-r1',
  maxInputTokens: 1000, maxOutputTokens: 500,
  contextWindowTokens: 2000, contextEstimator: 'utf8-bytes-v1', contextSafetyMarginTokens: 64,
};

/** 生产组合根闭包（键构造单一真相）+ 摘要面测试注入（report-bulkhead 同先例·摘要非 AG-03 触面）。 */
function reportDeps(client: ModelClient, scores = [68, 80]): ReportWorkerDeps {
  const deps = reportWorkerDeps(pool, client);
  deps.loadSummary = (_owner, interviewId) => ({ interviewId, questionCount: scores.length, scores, owner: _owner });
  return deps;
}

/** 付费基座（report-retry.proof seed+setupConfirmedWithReport 同形）：confirmed 账本上跑报告 job，零新增扣费口。 */
async function setupConfirmedWithReport(owner: string, interviewId: string) {
  await pool.query(
    "INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at) VALUES ($1,'paid',5.0, now()+interval '300 days')",
    [owner]);
  await pool.query("INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'created')", [interviewId, owner]);
  await asPrincipal(pool, owner, (c) => reserveEntitlement(c, owner, interviewId, 'mock_interview', 1.0));
  await asPrincipal(pool, owner, (c) => completeInterviewAndConfirm(c, owner, interviewId));
  return (await asPrincipal(pool, owner, (c) => enqueueReport(c, owner, interviewId))).reportId;
}

async function bypassBackoff(owner: string, interviewId: string) {
  // ai_report 挂 0059 投影围栏触发器：写面必须带 principal 上下文（report-retry.proof bypassBackoff 同形）。
  await asPrincipal(pool, owner, (c) => c.query(
    "UPDATE ai_report SET next_attempt_at = now() - interval '1 second' WHERE interview_id=$1 AND owner_user_id=$2 AND status='failed'",
    [interviewId, owner]));
}

/** 报告键账本行（本刀断言锚：键版本化+终态独立在册）。 */
async function reportInvocationRows(owner: string, interviewId: string) {
  return pool.query<{ idempotency_key: string; status: string }>(
    "SELECT idempotency_key, status FROM ai_model_invocation WHERE owner_user_id=$1 AND idempotency_key LIKE $2 ORDER BY idempotency_key",
    [owner, `${interviewId}:report:%`]);
}
const reportKeyCount = async (owner: string, interviewId: string) =>
  Number((await pool.query<{ n: number }>(
    "SELECT count(*)::int n FROM ai_model_invocation WHERE owner_user_id=$1 AND idempotency_key LIKE $2",
    [owner, `${interviewId}:report:%`])).rows[0]?.n ?? 0);

async function main() {
  await assertIsolatedTestTarget(pool);
  console.log('AG-E REPORT prove（AG-03 重试真实化+EG-A1 单调派发序+AG-10 守卫）· releaseEvidence=false · Not HA · est live=0');
  console.log('NOTE: 全假体 provider+隔离 PG；本绿≠全链路 E2E covered；≠ UC-E2E-011/019 covered');

  await pool.query(
    `INSERT INTO ai_cost_price_book(provider,model,region,revision,input_micro_cny_per_million,output_micro_cny_per_million,source_url,effective_at)
     VALUES($1,$2,$3,$4,1000000,1000000,'https://example.test/ag-e',clock_timestamp())`,
    [PROVIDER, MODEL, 'cn-proof', 'ag-e-r1']);
  await pool.query('INSERT INTO ai_cost_budget_policy(scope_id,monthly_limit_micro_cny,enabled) VALUES($1,1000000,true)', [SCOPE]);
  const provider = await startScriptedProvider();
  const client = openAICompatibleClient({ baseUrl: `http://127.0.0.1:${provider.port}`, apiKey: 'test', model: MODEL, costPolicy: policy });
  const deps = reportDeps(client);

  // ══ A. AG-03 主臂：失败→sweep 重排→新键真调模型（§2-①主臂）══════════════════
  section('A. AG-03 主臂：a1 业务校验拒绝 → sweep 重排 → a2 新键真调模型（provider 计数=2·终态重放未吞）');
  {
    const owner = OWN('a1'), id = IID('a1');
    await setupConfirmedWithReport(owner, id);
    const baseRequests = providerRequests;

    mode = 'dupsections';
    A('A 第 1 派发 → failed（claim dispatchSeq=1·真调 provider 一次）',
      (await drainReportsOnce(pool, owner, 'w-a1', deps)) === 'failed' && providerRequests - baseRequests === 1);
    const rows1 = await reportInvocationRows(owner, id);
    A('A 账本键恰 :a1 一行·failed（终态在册）',
      rows1.rows.length === 1 && rows1.rows[0]?.idempotency_key === reportDispatchKey(id, 1) && rows1.rows[0]?.status === 'failed');

    await bypassBackoff(owner, id);
    A('A sweep 重排（requeued=1·既有预算轮语义）', (await sweepReportsOnce(pool, owner)).requeued === 1);

    mode = 'good';
    A('A 第 2 派发 → ready（provider 计数=2：第二派发真调模型·非 cached/failed 终态重放）',
      (await drainReportsOnce(pool, owner, 'w-a1', deps)) === 'ready' && providerRequests - baseRequests === 2);
    const rows2 = await reportInvocationRows(owner, id);
    A('A 新账本行键=:a2 ≠ :a1（键/revision 双换·每轮派发新键）',
      rows2.rows.length === 2 && rows2.rows.some((r) => r.idempotency_key === reportDispatchKey(id, 2) && r.status === 'succeeded')
        && rows2.rows.some((r) => r.idempotency_key === reportDispatchKey(id, 1) && r.status === 'failed'));
    const rep = await getReportRow(owner, id);
    A('A 报告 ready·attempts=2·dispatch_seq=2（job 预算与派发序同向递增）',
      rep?.status === 'ready' && rep?.attempts === 2 && rep?.dispatchSeq === 2);
    A('A ready 才发 report_ready 事件（事件面原样）', await eventCount(id, 'report_ready') === 1);
  }

  // ══ B. EG-A1 手动重试臂：requeue 只重置 job 层预算·键跨预算轮单调（§2-①臂二）══
  section('B. EG-A1 手动重试臂：requeueFailedReport（attempts=0）→ 新预算轮键=:a2 绝不为 :a1');
  {
    const owner = OWN('a2'), id = IID('a2');
    const reportId = await setupConfirmedWithReport(owner, id);
    const baseRequests = providerRequests;

    mode = 'dupsections';
    A('B 第 1 派发 → failed（a1）', (await drainReportsOnce(pool, owner, 'w-a2', deps)) === 'failed');

    A('B requeueFailedReport → true（生产手动出口·同 interview-report.ts 调用面）',
      await asPrincipal(pool, owner, (c) => requeueFailedReport(c, owner, reportId)) === true);
    const after = await getReportRow(owner, id);
    A('B job 层预算重置原样：queued + attempts=0 + next_attempt_at=NULL（#229 D2 保真）',
      after?.status === 'queued' && after?.attempts === 0 && after?.nextAttemptAt === null);
    A('B EG-A1 铁律：dispatch_seq 不复位（仍=1·键空间不重访）', after?.dispatchSeq === 1);

    mode = 'good';
    A('B 新预算轮派发 → ready（provider 计数+1：真请求非账本回放）',
      (await drainReportsOnce(pool, owner, 'w-a2', deps)) === 'ready' && providerRequests - baseRequests === 2);
    const rows = await reportInvocationRows(owner, id);
    A('B 键=:a2 绝不为 :a1（旧 failed 行零重放·派发序跨预算轮单调）',
      rows.rows.length === 2 && rows.rows[0]?.idempotency_key === reportDispatchKey(id, 1) && rows.rows[0]?.status === 'failed'
        && rows.rows[1]?.idempotency_key === reportDispatchKey(id, 2) && rows.rows[1]?.status === 'succeeded');
    const rep = await getReportRow(owner, id);
    A('B 终态 attempts=1 ≠ dispatch_seq=2（重置列与单调列解耦的机器证明）',
      rep?.status === 'ready' && rep?.attempts === 1 && rep?.dispatchSeq === 2);
  }

  // ══ C. 上限臂：连续 3 败 → 键序恰 a1/a2/a3 → quarantined·无 a4（§2-①臂三）════
  section('C. 上限臂：3 次假体失败 → 键序恰 a1/a2/a3 → quarantined 终态·无 a4 派发');
  {
    const owner = OWN('a3'), id = IID('a3');
    await setupConfirmedWithReport(owner, id);
    const baseRequests = providerRequests;
    mode = 'dupsections';

    for (let i = 1; i <= MAX_REPORT_ATTEMPTS; i++) {
      const outcome = await drainReportsOnce(pool, owner, `w-a3-${i}`, deps);
      await bypassBackoff(owner, id);
      const sw = await sweepReportsOnce(pool, owner);
      A(`C 第 ${i} 轮 failed→sweep（i<max 重排·i=max 隔离）`, outcome === 'failed' && (i < MAX_REPORT_ATTEMPTS ? sw.requeued === 1 : sw.quarantined === 1));
    }
    A(`C 键序恰 a1/a2/a3·各真调一次（provider 计数=${MAX_REPORT_ATTEMPTS}）`,
      providerRequests - baseRequests === MAX_REPORT_ATTEMPTS
      && (await reportInvocationRows(owner, id)).rows.map((r) => r.idempotency_key)
        .join(',') === [1, 2, 3].map((n) => reportDispatchKey(id, n)).join(','));
    const rep = await getReportRow(owner, id);
    A(`C quarantined 终态·attempts=${MAX_REPORT_ATTEMPTS}·dispatch_seq=${MAX_REPORT_ATTEMPTS}`,
      rep?.status === 'quarantined' && rep?.attempts === MAX_REPORT_ATTEMPTS && rep?.dispatchSeq === MAX_REPORT_ATTEMPTS);
    A('C 无 a4 派发（drain=idle·provider 计数封冻）',
      (await drainReportsOnce(pool, owner, 'w-a3-x', deps)) === 'idle' && providerRequests - baseRequests === MAX_REPORT_ATTEMPTS);
    const sw2 = await sweepReportsOnce(pool, owner);
    A('C sweep 零接管（requeued=0·quarantined=0·无 doomed 重排循环）', sw2.requeued === 0 && sw2.quarantined === 0);
    A('C report_unavailable 终态事件照常（隔离非静默死胡同·原样）', await eventCount(id, 'report_unavailable') === 1);
  }

  // ══ D. AG-10 臂：eligible=0 C 端 unbound → 确定性模板报告零模型调用 + B 端 bound 对照（§2-①臂四）══
  section('D. AG-10 臂：C 端 unbound 全 skip 收尾 → ready 模板报告（零模型）·B 端 bound 对照原样');
  {
    // —— D1：C 端 unbound（无 application 投影）——
    const owner = OWN('d1'), id = IID('d1');
    await pool.query("INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'created')", [id, owner]);
    await pool.query("INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at) VALUES ($1,'paid',5.0, now()+interval '300 days')", [owner]);
    await asPrincipal(pool, owner, (c) => reserveEntitlement(c, owner, id, 'mock_interview', 1.0));
    let askSeq = 0;   // 题面逐轮唯一（adaptive-lifecycle.proof 同形）——固定题面会触发 generation_duplicate_question 收尾岔路
    const graphModel = scriptedModelClient({
      'planner.competencies': () => ({ ok: true, raw: { competencies: ['并发'] } }),
      'interviewer.ask': () => ({ ok: true, raw: { q: `请结合真实经历谈谈高并发限流（第 ${++askSeq} 轮）。`, refs: [] } }),
    });
    const d: AdaptiveLifecycleDeps = { pool, cp: new MemorySaver(), owner, interviewId: id, model: graphModel, localRetrieve: async () => [], webExplore: async () => [] };
    const start = await startAdaptiveInterview(d, '后端工程师', ['限流改造']);
    let qid = start.questionId!, done = false;
    for (let guard = 0; !done && guard < 8; guard++) {
      const row = (await asPrincipal(pool, owner, async (c) => (await c.query(
        'SELECT state_version,turn FROM interview_question WHERE interview_id=$1 AND question_id=$2', [id, qid])).rows[0]));
      const skipped = '跳过';   // isSkip → verdict=unresolved → answer_evaluated(outcome=unresolved) 不计 eligible·unscored 事件为零
      const input = { questionId: qid, stateVersion: Number(row.state_version), turn: Number(row.turn), answerId: randomUUID(), answerHash: answerHash(skipped), answer: skipped };
      await asPrincipal(pool, owner, (c) => claimInterviewAnswer(c, owner, id, input));
      const r = await submitAdaptiveAnswer(d, input);
      done = r.done; if (!done) qid = r.nextQuestionId!;
    }
    A('D1 C 端全 skip 真实 graph 收尾（done·unscored=0∧eligible=0 场成立）', done === true);
    const evd = (await asPrincipal(pool, owner, (c) => c.query(
      "SELECT count(*)::int n FROM interview_event WHERE stream_key=$1 AND kind='answer_evaluated' AND COALESCE(payload->>'outcome','answered')='unresolved'", [id]))).rows[0].n;
    A('D1 收尾证据面：unresolved 评估在场（eligible 计数剔除·unscored 事件=0）',
      Number(evd) >= 1 && (await asPrincipal(pool, owner, (c) => c.query(
        "SELECT count(*)::int n FROM interview_event WHERE stream_key=$1 AND kind='answer_unscored'", [id]))).rows[0].n === 0);
    const rep1 = await getReportRow(owner, id);
    A('D1 AG-10 守卫：报告行确定性 ready（非 queued/doomed 入队）·attempts=0·dispatch_seq=0（零 claim）',
      rep1?.status === 'ready' && rep1?.attempts === 0 && rep1?.dispatchSeq === 0);
    const tpl = rep1?.content as { overall?: number; sections?: { title?: string; body?: string }[] } | undefined;
    A('D1 模板 content 恒等（如实「证据不足」·零模型零虚构·语义深比 jsonb 归一）',
      tpl?.overall === NO_EVIDENCE_REPORT_CONTENT.overall
        && tpl?.sections?.length === 1
        && tpl?.sections[0]?.title === NO_EVIDENCE_REPORT_CONTENT.sections[0].title
        && tpl?.sections[0]?.body === NO_EVIDENCE_REPORT_CONTENT.sections[0].body);
    A('D1 零模型调用：该场报告键模型调用行=0（含守卫前后）', await reportKeyCount(owner, id) === 0);
    A('D1 report_ready 事件恰一（前端无新态·created gating 重放安全）', await eventCount(id, 'report_ready') === 1);
    A('D1 无 doomed 重排循环：drain=idle·sweep 零接管',
      (await drainReportsOnce(pool, owner, 'w-d1', deps)) === 'idle'
      && ((await sweepReportsOnce(pool, owner)).quarantined === 0));
    const cons1 = (await pool.query("SELECT status FROM entitlement_consumption WHERE owner_user_id=$1 AND idempotency_key=$2", [owner, id])).rows[0];
    A('D1 结算原样：interview completed·consumption confirmed（零触结算维度）',
      (await pool.query('SELECT status FROM interview WHERE id=$1', [id])).rows[0].status === 'completed' && cons1?.status === 'confirmed');

    // —— D2：B 端 bound 对照臂（markApplicationNoEligibleScore 现状零触）——
    const recruiter = OWN('d2-rec');
    const resumeId = randomUUID();
    const jobRow = await asPrincipal(pool, recruiter, (c) => createJob(c, recruiter, {
      title: 'Node.js 服务端工程师', description: '使用 NestJS 构建服务', competencies: ['nestjs', 'express', 'koa'],
    }));
    const rev = Number((await pool.query('SELECT COALESCE(MAX(revision),0)::int AS n FROM job_semantic_revision WHERE job_id=$1', [jobRow.id])).rows[0].n);
    await classifyJobRoute(pool, recruiter, jobRow.id, rev, { modelClassify: async () => { throw new Error('B-side seed must rule-decide'); } });
    await pool.query("INSERT INTO resume(id,owner_user_id,status,content_sha) VALUES ($1,$2,'ingested',$3)", [resumeId, owner, `ag-e:${id}`]);
    const app = await asPrincipal(pool, recruiter, (c) => inviteCandidate(c, recruiter, jobRow.id, owner));
    const started = await asPrincipal(pool, owner, (c) => startApplicationInterview(c, owner, app!.applicationId, resumeId));
    const bid = (started.status === 'started' || started.status === 'reused') ? started.interviewId : undefined;
    A('D2 B 端 bound 场建立（application 投影在场）', typeof bid === 'string' && bid.length > 0);
    if (bid) {
      await asPrincipal(pool, owner, (c) => reserveEntitlement(c, owner, bid, 'mock_interview', 1.0));
      const bd: AdaptiveLifecycleDeps = { pool, cp: new MemorySaver(), owner, interviewId: bid, model: graphModel, localRetrieve: async () => [], webExplore: async () => [] };
      const bstart = await startAdaptiveInterview(bd, '后端工程师', ['限流改造']);
      let bq = bstart.questionId!, bdone = false;
      for (let guard = 0; !bdone && guard < 8; guard++) {
        const row = (await asPrincipal(pool, owner, async (c) => (await c.query(
          'SELECT state_version,turn FROM interview_question WHERE interview_id=$1 AND question_id=$2', [bid, bq])).rows[0]));
        const skipped = '跳过';
        const input = { questionId: bq, stateVersion: Number(row.state_version), turn: Number(row.turn), answerId: randomUUID(), answerHash: answerHash(skipped), answer: skipped };
        await asPrincipal(pool, owner, (c) => claimInterviewAnswer(c, owner, bid, input));
        const r = await submitAdaptiveAnswer(bd, input);
        bdone = r.done; if (!bdone) bq = r.nextQuestionId!;
      }
      A('D2 B 端全 skip 收尾 done', bdone === true);
      const bstate = (await pool.query(
        `SELECT ja.status AS application_status,
                (SELECT count(*)::int FROM ai_report r WHERE r.interview_id=i.id) AS report_count,
                (SELECT count(*)::int FROM interview_event e WHERE e.stream_key=i.id AND e.kind='assessment_unavailable'
                  AND e.event_key='assessment_unavailable:no_eligible_scored_answer') AS terminal_events
           FROM interview i JOIN job_application ja ON ja.id=i.application_id WHERE i.id=$1`, [bid])).rows[0];
      A('D2 B 端 bound 原样零触：scoreless 可重试终态+assessment_unavailable 恰一+零 ai_report 行（不产模板不 enqueue）',
        bstate?.application_status === 'assessment_unavailable' && Number(bstate?.terminal_events) === 1 && Number(bstate?.report_count) === 0);
      A('D2 B 端零报告键模型调用·零 report_ready', await reportKeyCount(owner, bid) === 0 && await eventCount(bid, 'report_ready') === 0);
    }
  }

  // ══ E. 静态门（§2-①臂五）══════════════════════════════════════════════════
  section('E. 静态门：charset 门/EG-A1 铁律/上限既有值/结算零触/0130 重放原样/迁移 0178 在场');
  {
    const keyShape = reportDispatchKey(randomUUID(), 12);
    A('E 键串过 registry charset 门（uuid 起首字母数字 + `:report:a12` 集内）',
      /^[A-Za-z0-9][A-Za-z0-9._:-]{0,255}$/.test(keyShape) && keyShape.endsWith(':report:a12'));

    const reportDb = readRepo('packages/db/src/report/report.ts');
    const requeueBody = reportDb.slice(reportDb.indexOf('export async function requeueFailedReport'));
    const requeueSlice = requeueBody.slice(0, requeueBody.indexOf('\nexport ', 1));
    A('E EG-A1 铁律：requeueFailedReport 源码不含派发序复位（只重置 job 层 attempts）',
      !requeueSlice.includes('dispatch_seq') && requeueSlice.includes('attempts=0'));
    const claimSliceStart = reportDb.indexOf('export async function claimReport');
    const claimSlice = reportDb.slice(claimSliceStart, reportDb.indexOf('\nexport ', claimSliceStart));
    A('E 单调源唯一：claimReport CAS 同语句 `dispatch_seq=dispatch_seq+1`（与 attempts++ 同租约语义）',
      claimSlice.includes('attempts=attempts+1') && claimSlice.includes('dispatch_seq=dispatch_seq+1')
      && (reportDb.match(/dispatch_seq=dispatch_seq\+1/g) ?? []).length === 1);
    A('E AG-10 模板直写单点：writeNoEvidenceReadyReport ON CONFLICT DO NOTHING（enqueue 唯一行语义改直写 ready 形）',
      /INSERT INTO ai_report\(owner_user_id, interview_id, status, content\)/.test(reportDb)
        && /ON CONFLICT \(owner_user_id, interview_id\) DO NOTHING/.test(reportDb));

    const worker = readRepo('apps/worker/src/report-worker.ts');
    const mainSrc = readRepo('apps/worker/src/main.ts');
    const lifecycle = readRepo('apps/worker/src/adaptive-lifecycle.ts');
    A('E 键构造单一真相：组合根经 reportDispatchKey 消费·缺派发序 fail-closed 拒派（绝不静默回落同键）',
      /reportDispatchKey\(s\.interviewId, s\.reportDispatchSeq\)/.test(mainSrc)
        && mainSrc.includes('report_dispatch_seq_missing'));
    A('E 序号穿透：drainReportsOnce claim 携出 dispatchSeq 入 summary（非模型字段）',
      worker.includes('reportDispatchSeq: claim.dispatchSeq'));
    A('E AG-10 守卫同批：unbound 臂 writeNoEvidenceReadyReport 替换 enqueueReport（doomed 类源头删除）',
      lifecycle.includes('writeNoEvidenceReadyReport(c, d.owner, d.interviewId)')
        && (lifecycle.match(/enqueueReport\(/g) ?? []).length === 1);   // 仅剩 eligible>0 臂一处

    A(`E 上限既有值不动：MAX_REPORT_ATTEMPTS=3 导出原样（每轮预算 3 次·不放大）`,
      /export const MAX_REPORT_ATTEMPTS = 3;/.test(reportDb) && MAX_REPORT_ATTEMPTS === 3);

    // 结算维度零触（红事实 D·P3 同形复核+本刀新写入面 adaptive-lifecycle 一并入扫）
    const chainFiles = [
      'apps/api/src/modules/interview/interview-report.ts',
      'packages/db/src/report/report.ts',
      'apps/worker/src/report-worker.ts',
      'apps/web/app/report/[id]/actions.ts',
      'apps/worker/src/adaptive-lifecycle.ts',
    ];
    for (const f of chainFiles) {
      const hits = readRepo(f).match(/\b(reserveEntitlement|confirmConsumption|releaseConsumption)\b/g) ?? [];
      A(`E 结算零触静态门 ${f}：reserve/confirm/release 非测试调用=0`, hits.length === 0);
    }

    const migration0130 = readRepo('packages/db/migrations/0130_model_invocation_same_key_claim_join.sql');
    A('E 0130 终态重放语义零字节（本刀=换键绕行非改重放）',
      migration0130.includes("IF invocation.status='failed' THEN")
        && migration0130.includes("IF invocation.status='unknown' THEN")
        && migration0130.includes('idempotency_key_payload_mismatch'));

    const migration0178 = readRepo('packages/db/migrations/0178_ag_e_report_dispatch_seq.sql');
    A('E 迁移 0178 落盘 + 隔离库实 schema 列在场（expand-only DEFAULT 0）',
      migration0178.includes('ADD COLUMN IF NOT EXISTS dispatch_seq int NOT NULL DEFAULT 0')
        && (await pool.query("SELECT count(*)::int n FROM information_schema.columns WHERE table_name='ai_report' AND column_name='dispatch_seq'")).rows[0].n === 1);
    A('E 频控零触：REPORT_RETRY_RL 常量原样（3/时/份·S12 追认/多实例 Redis 归计费战役·§3-5）',
      /REPORT_RETRY_RL = \{ capacity: 3, refillPerSec: 3 \/ 3600 \}/.test(readRepo('apps/api/src/modules/interview/interview.service.ts')));
    A('E 零扣费总账对照（A/B/C 三臂全链后）：confirmed 基座上额度无抖动',
      (await asPrincipal(pool, OWN('a1'), (c) => availableUnits(c, OWN('a1')))) === 4.0);
  }

  console.log(`\n${fail === 0
    ? '✓ AG-E REPORT prove passed（AG-03 键双换+EG-A1 单调派发序+AG-10 守卫同批·五臂全绿；≠ covered；HTTP/频控面 → 既有 report-retry-http.proof）'
    : `✗ ${fail} AG-E REPORT asserts failed`}`);
  console.log('NOTE: est live=0 · 全假体 provider/隔离库 · 零扣费承诺=完成时 confirm 一次（uc011 R2/R3 账本边界原样不改）');
  await provider.close();
  await pool.end();
  process.exit(fail ? 1 : 0);
}

async function getReportRow(owner: string, interviewId: string): Promise<{ status: string; attempts: number; dispatchSeq: number; content: unknown; nextAttemptAt: Date | null } | null> {
  const r = await pool.query<{ status: string; attempts: number; dispatch_seq: number; content: unknown; next_attempt_at: Date | null }>(
    'SELECT status, attempts, dispatch_seq, content, next_attempt_at FROM ai_report WHERE owner_user_id=$1 AND interview_id=$2', [owner, interviewId]);
  const x = r.rows[0];
  if (!x) return null;
  return { status: x.status, attempts: x.attempts, dispatchSeq: x.dispatch_seq, content: x.content, nextAttemptAt: x.next_attempt_at };
}

async function eventCount(interviewId: string, kind: string): Promise<number> {
  return Number((await pool.query<{ n: number }>(
    'SELECT count(*)::int n FROM interview_event WHERE stream_key=$1 AND kind=$2', [interviewId, kind])).rows[0]?.n ?? 0);
}

main().catch((e) => { console.error('✗', e?.message ?? e, '\n', e?.stack ?? e); process.exit(1); });
