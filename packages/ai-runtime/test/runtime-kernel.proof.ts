/**
 * 运行内核集成证明（对真 Postgres）：db 四原语 + ai-runtime invoke 关口合验。
 * 审计 H1-H3/H5：业务读写全走非 owner app_role + principal 上下文（FORCE RLS 真生效），写入带 owner，
 * WITH CHECK 防越权写，幂等键/trace 按 principal 作用域。超级用户连接仅做 setup/seed。
 *   pnpm runtime:prove   (需 pnpm db:up)
 */
import { z } from 'zod';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createPool, asPrincipal, casTransition, appendEvent, acquireLease, releaseLease } from '@meetwise/db';
import { invoke, recordingTracer, setTracer, langfuseSafeModelMetadata, pseudonymizeLangfuseIdentifier, type Model, type ModelCallSpan } from '../src/index.ts';

const pool = createPool();
let failures = 0;
function assert(name: string, cond: boolean) { console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}`); if (!cond) failures++; }
function section(t: string) { console.log(`\n──────── ${t} ────────`); }

const RESUME_FACTS = ['参与了订单系统', '熟悉 Redis'];
const qModel: Model & { calls: number } = { calls: 0, async call() { this.calls++; return { ok: true, raw: { question: '如何设计一个高并发限流器？' } }; } };
const evalModel: Model & { calls: number } = { calls: 0, async call() { this.calls++; return { ok: true, raw: { score: 68, evidence: ['Redis 计数器'] } }; } };
const halluModel: Model & { calls: number } = { calls: 0, async call() { this.calls++; return { ok: true, raw: { score: 99, claim: '有 3 年 Go 经验' } }; } };
const refuseModel: Model & { calls: number } = { calls: 0, async call() { this.calls++; return { ok: false, kind: 'deterministic' }; } };
const QSchema = z.object({ question: z.string().min(1) });
const EvalSchema = z.object({ score: z.number().min(0).max(100), evidence: z.array(z.string()) });
const HalluSchema = z.object({ score: z.number(), claim: z.string() });

async function main() {
  const SCHEMA = readFileSync(fileURLToPath(new URL('../../db/sql/01_schema.sql', import.meta.url)), 'utf8');
  await pool.query(SCHEMA);                                   // 超级用户：建表 + 装 RLS（绕过 RLS）
  for (const migration of [
    '0033_ai_cost_governance.sql', '0035_ai_cost_principal_scope.sql', '0036_ai_text_cost_governance.sql',
    '0037_ai_model_invocation_durable_claim.sql', '0056_model_invocation_reconcile.sql',
    '0057_model_invocation_cost_scope.sql', '0083_ai_text_cost_price_revision_binding.sql',
    '0085_ai_model_logical_node_dispatch_slot.sql',
    '0088_ai_model_invocation_controlled_state_machine.sql',
    '0119_usage_reconciliation_wiring.sql',
  ]) {
    await pool.query(readFileSync(fileURLToPath(new URL(`../../db/migrations/${migration}`, import.meta.url)), 'utf8'));
  }
  // 0037 是增量表，01_schema 的演示基座不会删除它。显式清理避免上一次
  // proof 的幂等键被误当成当前进程的缓存命中，导致模型调用/观测断言失真。
  await pool.query('TRUNCATE ai_model_invocation');
  await pool.query("INSERT INTO interview(id,owner_user_id,status) VALUES ('R1','userA','created'),('R9','userB','created')");
  await pool.query("INSERT INTO ai_graph_run(graph_name,thread_id,owner_user_id,status) VALUES ('mock-interview','R1','userA','created')");

  section('进程 A：面试官启动一轮 · 全程 principal 上下文(FORCE RLS 生效)');
  await asPrincipal(pool, 'userA', async (c) => {
    assert('A 抢到 thread 租约', await acquireLease(c, 'R1', 'procA'));
    assert('状态 created→active（CAS）', await casTransition(c, 'R1', 'created', 'active'));
  });
  const q = await invoke({ idempotencyKey: 'R1:q:1', schema: QSchema, businessValidate: () => null, model: qModel }, pool, 'userA');
  assert('invoke 拿到合法问题', 'value' in q && (q as any).value.question.length > 0);
  assert('单次逻辑调用仅派发一次模型请求', qModel.calls === 1);
  await asPrincipal(pool, 'userA', async (c) => {
    const s = await appendEvent(c, 'userA', 'R1', 'question_ready', { question: (q as any).value.question });
    assert('事件 seq=1（原子分配）', s === 1);
    assert('状态 active→waiting_user（持久化等待）', await casTransition(c, 'R1', 'active', 'waiting_user'));
  });
  await asPrincipal(pool, 'userA', (c) => releaseLease(c, 'R1', 'procA'));

  section('并发控制：B 持租约时 C 并发 resume 被拒');
  assert('B 抢到租约', await asPrincipal(pool, 'userA', (c) => acquireLease(c, 'R1', 'procB')));
  assert('C 并发抢租约被拒（防裂脑）', !(await asPrincipal(pool, 'userA', (c) => acquireLease(c, 'R1', 'procC'))));

  section('可中断可恢复：进程 B 纯从 DB 恢复（无内存 session）');
  const st = await asPrincipal(pool, 'userA', (c) => c.query("SELECT status FROM interview WHERE id='R1'"));
  assert('重启后从 DB 读到 waiting_user', st.rows[0].status === 'waiting_user');
  const ev = await asPrincipal(pool, 'userA', (c) => c.query("SELECT payload->>'question' q FROM interview_event WHERE stream_key='R1' AND seq=1"));
  assert('从事件账本恢复出第 1 题', ev.rows[0].q.includes('限流器'));

  section('提交答案：幂等（双击/断线重发只评一次）');
  async function submitAnswer(key: string): Promise<'ok' | 'dup'> {
    const claimed = await asPrincipal(pool, 'userA', async (c) => {
      const ins = await c.query("INSERT INTO consumption_record(owner_user_id,idempotency_key,interview_id) VALUES('userA',$1,'R1') ON CONFLICT (owner_user_id,idempotency_key) DO NOTHING", [key]);
      if (ins.rowCount === 0) return 'dup';
      return 'claimed';
    });
    if (claimed === 'dup') return 'dup';
    const e = await invoke({ idempotencyKey: 'R1:eval:1', schema: EvalSchema, businessValidate: () => null, model: evalModel }, pool, 'userA');
    await asPrincipal(pool, 'userA', async (c) => {
      await appendEvent(c, 'userA', 'R1', 'answer_evaluated', { score: (e as any).value.score });
    });
    return 'ok';
  }
  assert('首次提交记账+评估', (await submitAnswer('ans-1')) === 'ok');
  assert('重复提交被幂等忽略', (await submitAnswer('ans-1')) === 'dup');
  const cnt = await asPrincipal(pool, 'userA', (c) => c.query("SELECT count(*)::int n FROM interview_event WHERE stream_key='R1' AND kind='answer_evaluated'"));
  assert('answer_evaluated 仅 1 条', cnt.rows[0].n === 1);
  assert('invoke 幂等：eval 模型仅被真正调用 1 次', evalModel.calls === 1);

  section('并发同键去重：两并发 invoke 由 durable claim（持久领取）协调，只派发一次');
  const concModel: Model & { calls: number } = { calls: 0, async call() { this.calls++; await new Promise((r) => setTimeout(r, 30)); return { ok: true, raw: { question: '并发限流题' } }; } };
  const both = await Promise.all([
    invoke({ idempotencyKey: 'R1:conc', schema: QSchema, businessValidate: () => null, model: concModel }, pool, 'userA'),
    invoke({ idempotencyKey: 'R1:conc', schema: QSchema, businessValidate: () => null, model: concModel }, pool, 'userA'),
  ]);
  assert('两并发 invoke 模型仅真调 1 次（同键持久领取去重，避免重复派发）', concModel.calls === 1);
  assert('两者返回同一值(不发散)', 'value' in both[0] && 'value' in both[1] && JSON.stringify((both[0] as any).value) === JSON.stringify((both[1] as any).value));

  section('双校验 & 重试分类');
  const h = await invoke({ idempotencyKey: 'R1:hallu', schema: HalluSchema, model: halluModel, businessValidate: (v) => (v.claim && !RESUME_FACTS.includes(v.claim) ? '幻觉简历事实' : null) }, pool, 'userA');
  assert('幻觉简历事实被业务校验拦截（schema 通过≠业务合法）', 'error' in h && (h as any).error.startsWith('business'));
  const d = await invoke({ idempotencyKey: 'R1:refuse', schema: QSchema, businessValidate: () => null, model: refuseModel }, pool, 'userA');
  assert('确定性拒绝不重试（模型仅调 1 次）', 'error' in d && (d as any).error === 'deterministic_refusal' && refuseModel.calls === 1);

  section('UC-E2E-012：已派发模型 Promise 永不收口 → unknown，绝不无限续租或自动重发');
  const hungCalls = { n: 0 };
  const hungModel: Model = { async call() { hungCalls.n++; return await new Promise<never>(() => {}); } };
  const timeoutStarted = performance.now();
  const firstTimeout = await invoke({
    idempotencyKey: 'R1:execution-timeout', schema: QSchema, businessValidate: () => null,
    model: hungModel, executionTimeoutMs: 35,
  }, pool, 'userA');
  const timeoutElapsed = performance.now() - timeoutStarted;
  const timeoutRow = await asPrincipal(pool, 'userA', (c) => c.query(
    "SELECT status,error_code FROM ai_model_invocation WHERE owner_user_id='userA' AND idempotency_key='R1:execution-timeout'",
  ));
  assert('E5：永不 resolve 的已派发调用在硬时限内收口为 unknown（而非无限等待）',
    'error' in firstTimeout && (firstTimeout as any).error === 'external_outcome_unknown' && timeoutElapsed >= 25 && timeoutElapsed < 1_000
      && timeoutRow.rows[0]?.status === 'unknown' && timeoutRow.rows[0]?.error_code === 'model_execution_timeout');
  const replayTimeout = await invoke({
    idempotencyKey: 'R1:execution-timeout', schema: QSchema, businessValidate: () => null,
    model: hungModel, executionTimeoutMs: 35,
  }, pool, 'userA');
  assert('E1：unknown 同幂等键重放不发第二次供应商请求',
    'error' in replayTimeout && (replayTimeout as any).error === 'model_execution_timeout' && hungCalls.n === 1);

  // A non-cooperative SDK can resolve after its AbortSignal.  The gateway must
  // have detached its completion path: no late success, trace, or sensitive
  // persistence is allowed after the durable unknown terminal state.
  let resolveLate!: (result: any) => void;
  let lateAborts = 0;
  let latePersisted = 0;
  const lateTracer = recordingTracer(); setTracer(lateTracer);
  const lateModel: Model = {
    call(_attempt, signal) {
      signal?.addEventListener('abort', () => { lateAborts++; }, { once: true });
      return new Promise((resolve) => { resolveLate = resolve; });
    },
  };
  const lateOutcome = await invoke({
    idempotencyKey: 'R1:execution-timeout-late-success', schema: QSchema, businessValidate: () => null,
    model: lateModel, executionTimeoutMs: 35,
    persistValidatedOutput: async () => { latePersisted++; },
  }, pool, 'userA');
  resolveLate({ ok: true, raw: { question: '迟到的供应商成功响应' } });
  await new Promise((resolve) => setTimeout(resolve, 20));
  const lateRow = await asPrincipal(pool, 'userA', (c) => c.query(
    "SELECT status,error_code FROM ai_model_invocation WHERE owner_user_id='userA' AND idempotency_key='R1:execution-timeout-late-success'",
  ));
  const lateTrace = await asPrincipal(pool, 'userA', (c) => c.query(
    "SELECT count(*)::int n FROM ai_invocation_trace WHERE owner_user_id='userA' AND idempotency_key='R1:execution-timeout-late-success'",
  ));
  assert('E6：超时 abort 后的迟到成功响应不能覆盖 unknown、写入工件或成功 trace',
    'error' in lateOutcome && lateOutcome.error === 'external_outcome_unknown'
      && lateAborts === 1 && latePersisted === 0 && lateRow.rows[0]?.status === 'unknown'
      && lateRow.rows[0]?.error_code === 'model_execution_timeout' && Number(lateTrace.rows[0]?.n) === 0
      && !lateTracer.spans.some((entry) => entry.outcome === 'ok'));
  setTracer({ record() {} });

  let prepareAborts = 0;
  let preparedCall = 0;
  const neverPrepares: Model = {
    async call() { preparedCall++; return { ok: true, raw: { question: 'unreachable' } }; },
    prepare(_attempt, signal) {
      signal?.addEventListener('abort', () => { prepareAborts++; }, { once: true });
      return new Promise(() => {});
    },
  };
  const prepareOutcome = await invoke({ idempotencyKey: 'R1:prepare-timeout', schema: QSchema, businessValidate: () => null, model: neverPrepares, executionTimeoutMs: 35 }, pool, 'userA');
  const prepareRow = await asPrincipal(pool, 'userA', (c) => c.query(
    "SELECT count(*)::int n FROM ai_model_invocation WHERE owner_user_id='userA' AND idempotency_key='R1:prepare-timeout'",
  ));
  assert('E3：pre-dispatch prepare 超时会 abort，且不创建可计费调用 claim',
    'error' in prepareOutcome && prepareOutcome.error === 'model_prepare_timeout' && prepareAborts === 1 && preparedCall === 0 && Number(prepareRow.rows[0]?.n) === 0);

  const originalNodeEnv = process.env.NODE_ENV;
  let productionRejectsTinyDeadline = false;
  try {
    process.env.NODE_ENV = 'production';
    await invoke({
      idempotencyKey: 'R1:production-tiny-deadline',
      logicalNodeKey: 'runtime-kernel:production-tiny-deadline:v1',
      schema: QSchema,
      businessValidate: () => null,
      model: qModel,
      executionTimeoutMs: 35,
    }, pool, 'userA');
  } catch (error: any) { productionRejectsTinyDeadline = error?.message === 'model_execution_timeout_invalid'; }
  finally {
    if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = originalNodeEnv;
  }
  assert('生产环境拒绝小于 1000ms 的执行时限（毫秒级值仅测试 seam）', productionRejectsTinyDeadline);

  let invalidWaitRejected = false;
  try {
    await invoke({ idempotencyKey: 'R1:invalid-wait', schema: QSchema, businessValidate: () => null, model: qModel, waitMs: Number.NaN }, pool, 'userA');
  } catch (error: any) { invalidWaitRejected = error?.message === 'model_invocation_wait_invalid'; }
  assert('非法同键等待预算不会变成无限轮询', invalidWaitRejected);

  const concurrentHungCalls = { n: 0 };
  const concurrentHung: Model = { async call() { concurrentHungCalls.n++; return await new Promise<never>(() => {}); } };
  const concurrentTimeout = await Promise.all([
    invoke({ idempotencyKey: 'R1:execution-timeout-concurrent', schema: QSchema, businessValidate: () => null, model: concurrentHung, executionTimeoutMs: 40, waitMs: 500 }, pool, 'userA'),
    invoke({ idempotencyKey: 'R1:execution-timeout-concurrent', schema: QSchema, businessValidate: () => null, model: concurrentHung, executionTimeoutMs: 40, waitMs: 500 }, pool, 'userA'),
  ]);
  assert('E2：两个并发超时调用最多派发一次，二者均以未知终态收口',
    concurrentHungCalls.n === 1
      && concurrentTimeout.filter((outcome) => 'error' in outcome && outcome.error === 'external_outcome_unknown').length === 1
      && concurrentTimeout.filter((outcome) => 'error' in outcome && outcome.error === 'model_execution_timeout').length === 1);

  section('可观测埋点：invoke 关口每次模型调用出 span(脱敏标量,observability-strategy §6)');
  const rec = recordingTracer(); setTracer(rec);
  const okM: Model & { calls: number } = { calls: 0, async call() { this.calls++; return { ok: true, raw: { question: '埋点题' } }; } };
  await invoke({ idempotencyKey: 'R1:obs', schema: QSchema, businessValidate: () => null, model: okM }, pool, 'userA');
  await invoke({ idempotencyKey: 'R1:obs', schema: QSchema, businessValidate: () => null, model: okM }, pool, 'userA'); // 第二次命中缓存
  assert('ok span 出且带延迟(latencyMs>=0)', rec.spans.some((s) => s.outcome === 'ok' && s.latencyMs >= 0));
  assert('cached span 出(命中未真打模型)', rec.spans.some((s) => s.outcome === 'cached') && okM.calls === 1);
  assert('span 只含标量字段(无 prompt/简历原文,脱敏 by construction)',
    rec.spans.every((s) => Object.keys(s).sort().join(',') === 'attempt,idempotencyKey,inputTokens,latencyMs,outcome,outputTokens,owner,retrieval,service,sources,threadId'));
  // 成本观测:模型返回 usage → span 带 token 数(喂 Langfuse 成本看板)
  const rec2 = recordingTracer(); setTracer(rec2);
  const tokM: Model = { async call() { return { ok: true, raw: { question: '带token题' }, usage: { inputTokens: 123, outputTokens: 45 } }; } };
  await invoke({ idempotencyKey: 'TOK:1', schema: QSchema, businessValidate: () => null, model: tokM, service: 's' }, pool, 'userA');
  const tokSpan = rec2.spans.find((s) => s.outcome === 'ok');
  assert('span 带 token usage(input=123,output=45,标量非内容)', tokSpan?.inputTokens === 123 && tokSpan?.outputTokens === 45);
  setTracer({ record() {} });

  section('Langfuse v5 观测适配器：外送 ID 伪名化 + 元数据白名单');
  const telemetrySpan: ModelCallSpan = {
    owner: 'userA', idempotencyKey: 'LF:answer-sha256:known-value', threadId: 'IV1',
    attempt: 1, outcome: 'ok', latencyMs: 10, service: 'mock-interview.evaluate',
    sources: ['qbank:b3', 'memory:m7'], retrieval: [{ ref: 'qbank:b3', score: 0.82 }], inputTokens: 100, outputTokens: 20,
  };
  const metadata = langfuseSafeModelMetadata(telemetrySpan, 'fixture-correlation-secret');
  const external = JSON.stringify(metadata);
  assert('外送元数据只含数值/枚举/HMAC 伪名，不含原 owner/thread/幂等键/来源',
    !external.includes('userA') && !external.includes('IV1') && !external.includes('LF:answer') && !external.includes('qbank:b3')
      && Object.keys(metadata).sort().join(',') === 'attempt,inputTokens,invocationRef,latencyMs,outcome,outputTokens,ownerRef,retrievalCount,sourceCount,threadRef,topRetrievalScore');
  assert('同密钥同标识的外送伪名稳定、不同命名空间不可混用',
    pseudonymizeLangfuseIdentifier('fixture-correlation-secret', 'owner', 'userA') === metadata.ownerRef
      && pseudonymizeLangfuseIdentifier('fixture-correlation-secret', 'thread', 'userA') !== metadata.ownerRef);
  setTracer({ record() {} });

  section('RLS：FORCE + 越权读=0 fail-closed + WITH CHECK 防越权写');
  await asPrincipal(pool, '', async (c) => { const r = await c.query("SELECT count(*)::int n FROM interview"); assert('未绑 principal 可见=0（fail-closed）', r.rows[0].n === 0); });
  await asPrincipal(pool, 'userB', async (c) => { const r = await c.query("SELECT count(*)::int n FROM interview WHERE id='R1'"); assert('userB 越权读 userA 的 R1=0 行', r.rows[0].n === 0); });
  await asPrincipal(pool, 'userA', async (c) => { const r = await c.query("SELECT count(*)::int n FROM interview WHERE id='R1'"); assert('userA 能读自己的 R1', r.rows[0].n === 1); });
  await asPrincipal(pool, 'userB', async (c) => { const r = await c.query("SELECT count(*)::int n FROM interview_event WHERE stream_key='R1'"); assert('userB 越权读 R1 事件账本=0 行', r.rows[0].n === 0); });
  let blocked = false;
  try { await asPrincipal(pool, 'userA', (c) => c.query("INSERT INTO interview_event(owner_user_id,stream_key,seq,kind) VALUES('userB','R1',999,'x')")); } catch { blocked = true; }
  assert('WITH CHECK：userA 写 owner=userB 被拒（防越权搬数据）', blocked);

  console.log(`\n${failures === 0 ? '✓ 全部通过' : '✗ ' + failures + ' 项失败'}`);
  await pool.end();
  process.exit(failures === 0 ? 0 : 1);
}
main().catch((e) => { console.error(e); process.exit(1); });
