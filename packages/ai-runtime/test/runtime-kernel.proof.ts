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
import { invoke, recordingTracer, setTracer, langfuseTracer, toLangfuseBatch, type Model, type SpanEvent, type SpanTransport } from '../src/index.ts';

const pool = createPool();
let failures = 0;
function assert(name: string, cond: boolean) { console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}`); if (!cond) failures++; }
function section(t: string) { console.log(`\n──────── ${t} ────────`); }

const RESUME_FACTS = ['参与了订单系统', '熟悉 Redis'];
const qModel: Model & { calls: number } = { calls: 0, async call(attempt) { this.calls++; return attempt === 1 ? { ok: true, raw: { nope: 1 } } : { ok: true, raw: { question: '如何设计一个高并发限流器？' } }; } };
const evalModel: Model & { calls: number } = { calls: 0, async call() { this.calls++; return { ok: true, raw: { score: 68, evidence: ['Redis 计数器'] } }; } };
const halluModel: Model & { calls: number } = { calls: 0, async call() { this.calls++; return { ok: true, raw: { score: 99, claim: '有 3 年 Go 经验' } }; } };
const refuseModel: Model & { calls: number } = { calls: 0, async call() { this.calls++; return { ok: false, kind: 'deterministic' }; } };
const QSchema = z.object({ question: z.string().min(1) });
const EvalSchema = z.object({ score: z.number().min(0).max(100), evidence: z.array(z.string()) });
const HalluSchema = z.object({ score: z.number(), claim: z.string() });

async function main() {
  const SCHEMA = readFileSync(fileURLToPath(new URL('../../db/sql/01_schema.sql', import.meta.url)), 'utf8');
  await pool.query(SCHEMA);                                   // 超级用户：建表 + 装 RLS（绕过 RLS）
  await pool.query("INSERT INTO interview(id,owner_user_id,status) VALUES ('R1','userA','created'),('R9','userB','created')");
  await pool.query("INSERT INTO ai_graph_run(graph_name,thread_id,owner_user_id,status) VALUES ('mock-interview','R1','userA','created')");

  section('进程 A：面试官启动一轮 · 全程 principal 上下文(FORCE RLS 生效)');
  await asPrincipal(pool, 'userA', async (c) => {
    assert('A 抢到 thread 租约', await acquireLease(c, 'R1', 'procA'));
    assert('状态 created→active（CAS）', await casTransition(c, 'R1', 'created', 'active'));
  });
  const q = await asPrincipal(pool, 'userA', (c) => invoke({ idempotencyKey: 'R1:q:1', schema: QSchema, businessValidate: () => null, model: qModel }, c, 'userA'));
  assert('invoke 拿到合法问题', 'value' in q && (q as any).value.question.length > 0);
  assert('schema 失败触发了一次重试（模型被调 2 次）', qModel.calls === 2);
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
    return asPrincipal(pool, 'userA', async (c) => {
      const ins = await c.query("INSERT INTO consumption_record(owner_user_id,idempotency_key,interview_id) VALUES('userA',$1,'R1') ON CONFLICT (owner_user_id,idempotency_key) DO NOTHING", [key]);
      if (ins.rowCount === 0) return 'dup';
      const e = await invoke({ idempotencyKey: 'R1:eval:1', schema: EvalSchema, businessValidate: () => null, model: evalModel }, c, 'userA');
      await appendEvent(c, 'userA', 'R1', 'answer_evaluated', { score: (e as any).value.score });
      return 'ok';
    });
  }
  assert('首次提交记账+评估', (await submitAnswer('ans-1')) === 'ok');
  assert('重复提交被幂等忽略', (await submitAnswer('ans-1')) === 'dup');
  const cnt = await asPrincipal(pool, 'userA', (c) => c.query("SELECT count(*)::int n FROM interview_event WHERE stream_key='R1' AND kind='answer_evaluated'"));
  assert('answer_evaluated 仅 1 条', cnt.rows[0].n === 1);
  assert('invoke 幂等：eval 模型仅被真正调用 1 次', evalModel.calls === 1);

  section('并发 exactly-once：两并发 invoke 同 key,模型只调 1 次(advisory 锁串行,审计 HIGH)');
  const concModel: Model & { calls: number } = { calls: 0, async call() { this.calls++; await new Promise((r) => setTimeout(r, 30)); return { ok: true, raw: { question: '并发限流题' } }; } };
  const both = await Promise.all([
    asPrincipal(pool, 'userA', (c) => invoke({ idempotencyKey: 'R1:conc', schema: QSchema, businessValidate: () => null, model: concModel }, c, 'userA')),
    asPrincipal(pool, 'userA', (c) => invoke({ idempotencyKey: 'R1:conc', schema: QSchema, businessValidate: () => null, model: concModel }, c, 'userA')),
  ]);
  assert('两并发 invoke 模型仅真调 1 次(exactly-once,不双花)', concModel.calls === 1);
  assert('两者返回同一值(不发散)', 'value' in both[0] && 'value' in both[1] && JSON.stringify((both[0] as any).value) === JSON.stringify((both[1] as any).value));

  section('双校验 & 重试分类');
  const h = await asPrincipal(pool, 'userA', (c) => invoke({ idempotencyKey: 'R1:hallu', schema: HalluSchema, model: halluModel, businessValidate: (v) => (v.claim && !RESUME_FACTS.includes(v.claim) ? '幻觉简历事实' : null) }, c, 'userA'));
  assert('幻觉简历事实被业务校验拦截（schema 通过≠业务合法）', 'error' in h && (h as any).error.startsWith('business'));
  const d = await asPrincipal(pool, 'userA', (c) => invoke({ idempotencyKey: 'R1:refuse', schema: QSchema, businessValidate: () => null, model: refuseModel }, c, 'userA'));
  assert('确定性拒绝不重试（模型仅调 1 次）', 'error' in d && (d as any).error === 'deterministic_refusal' && refuseModel.calls === 1);

  section('可观测埋点：invoke 关口每次模型调用出 span(脱敏标量,observability-strategy §6)');
  const rec = recordingTracer(); setTracer(rec);
  const okM: Model & { calls: number } = { calls: 0, async call() { this.calls++; return { ok: true, raw: { question: '埋点题' } }; } };
  await asPrincipal(pool, 'userA', (c) => invoke({ idempotencyKey: 'R1:obs', schema: QSchema, businessValidate: () => null, model: okM }, c, 'userA'));
  await asPrincipal(pool, 'userA', (c) => invoke({ idempotencyKey: 'R1:obs', schema: QSchema, businessValidate: () => null, model: okM }, c, 'userA')); // 第二次命中缓存
  assert('ok span 出且带延迟(latencyMs>=0)', rec.spans.some((s) => s.outcome === 'ok' && s.latencyMs >= 0));
  assert('cached span 出(命中未真打模型)', rec.spans.some((s) => s.outcome === 'cached') && okM.calls === 1);
  assert('span 只含标量字段(无 prompt/简历原文,脱敏 by construction)',
    rec.spans.every((s) => Object.keys(s).sort().join(',') === 'attempt,idempotencyKey,inputTokens,latencyMs,outcome,outputTokens,owner,retrieval,service,sources,threadId'));
  // 成本观测:模型返回 usage → span 带 token 数(喂 Langfuse 成本看板)
  const rec2 = recordingTracer(); setTracer(rec2);
  const tokM: Model = { async call() { return { ok: true, raw: { question: '带token题' }, usage: { inputTokens: 123, outputTokens: 45 } }; } };
  await asPrincipal(pool, 'userA', (c) => invoke({ idempotencyKey: 'TOK:1', schema: QSchema, businessValidate: () => null, model: tokM, service: 's' }, c, 'userA'));
  const tokSpan = rec2.spans.find((s) => s.outcome === 'ok');
  assert('span 带 token usage(input=123,output=45,标量非内容)', tokSpan?.inputTokens === 123 && tokSpan?.outputTokens === 45);
  setTracer({ record() {} });

  section('Langfuse 观测适配器:脱敏投递 + fail-open + 非阻塞批量');
  const shipped: SpanEvent[] = [];
  const fakeTransport: SpanTransport = { async send(evts) { shipped.push(...evts); } };
  const lf = langfuseTracer(fakeTransport, { flushAt: 100 });
  setTracer(lf);
  const okM2: Model & { calls: number } = { calls: 0, async call() { this.calls++; return { ok: true, raw: { question: '观测题' } }; } };
  await asPrincipal(pool, 'userA', (c) => invoke({ idempotencyKey: 'LF:1', schema: QSchema, businessValidate: () => null, model: okM2, service: 'mock-interview.evaluate' }, c, 'userA'));
  await lf.flush();
  assert('span 投递到 transport(经 invoke 关口)', shipped.length >= 1 && shipped[0].name === 'model:mock-interview.evaluate');
  assert('投递事件只含标量+标识+来源id+token(无 prompt/PII/原文字段)',
    shipped.every((e) => Object.keys(e).sort().join(',') === 'metadata,name,obsId,traceId,userId'
      && Object.keys(e.metadata).sort().join(',') === 'attempt,inputTokens,latencyMs,outcome,outputTokens,service,sources,topScore'));
  assert('userId/traceId 是标识非内容(脱敏 by construction)', shipped[0].userId === 'userA' && shipped[0].traceId === 'LF:1');
  // provenance:带检索来源的生成,sources 记入 span(可审计"凭哪些来源生成")
  shipped.length = 0;
  const provM: Model = { async call() { return { ok: true, raw: { question: '据来源出题' } }; } };
  await asPrincipal(pool, 'userA', (c) => invoke({ idempotencyKey: 'PROV:1', schema: QSchema, businessValidate: () => null, model: provM, service: 'resume-quiz.generate', sources: ['qbank:b3', 'memory:m7'] }, c, 'userA'));
  await lf.flush();
  assert('provenance:生成记录检索来源 ref_ids(可审计可引用)', JSON.stringify(shipped[0].metadata.sources) === JSON.stringify(['qbank:b3', 'memory:m7']));
  // fail-open:transport 抛错,record/flush 绝不抛,业务不受影响
  const boomTransport: SpanTransport = { async send() { throw new Error('langfuse_down'); } };
  const lf2 = langfuseTracer(boomTransport, { flushAt: 1 });
  let threw = false;
  try { lf2.record({ owner: 'userA', idempotencyKey: 'x', attempt: 0, outcome: 'ok', latencyMs: 1, service: 's' }); await lf2.flush(); } catch { threw = true; }
  assert('观测后端挂 → record/flush 不抛(fail-open,不拖垮业务)', threw === false);

  section('Langfuse ingestion 线格式:toLangfuseBatch 构真实 schema(trace-create + generation-create 带 usage)');
  const lfEv: SpanEvent = { name: 'model:s', userId: 'userA', traceId: 'IV1', obsId: 'IV1:quiz', metadata: { service: 's', outcome: 'ok', attempt: 1, latencyMs: 10, sources: ['qbank:b1'], inputTokens: 100, outputTokens: 20, topScore: 0.82 } };
  const batch = toLangfuseBatch([lfEv], '2026-06-27T00:00:00.000Z') as any[];
  assert('每 span 产 trace-create + generation-create 两事件', batch.length === 2 && batch[0].type === 'trace-create' && batch[1].type === 'generation-create');
  assert('generation 带 usage(input/output/total TOKENS)→ Langfuse 成本看板靠它', batch[1].body.usage.input === 100 && batch[1].body.usage.output === 20 && batch[1].body.usage.total === 120 && batch[1].body.usage.unit === 'TOKENS');
  assert('generation 带 startTime/endTime → 延迟看板能算', typeof batch[1].body.startTime === 'string' && typeof batch[1].body.endTime === 'string');
  // ① 一场面试一棵树:同 threadId 的两次调用 → 同一 traceId,两个 generation 挂其下
  const twoCalls = toLangfuseBatch([
    { name: 'model:quiz', userId: 'userA', traceId: 'IV1', obsId: 'IV1:quiz', metadata: { service: 'quiz', outcome: 'ok', attempt: 1, latencyMs: 5, sources: [], inputTokens: 10, outputTokens: 5, topScore: null } },
    { name: 'model:eval', userId: 'userA', traceId: 'IV1', obsId: 'IV1:eval', metadata: { service: 'eval', outcome: 'ok', attempt: 1, latencyMs: 5, sources: [], inputTokens: 10, outputTokens: 5, topScore: null } },
  ], '2026-06-27T00:00:00.000Z') as any[];
  const gens = twoCalls.filter((x) => x.type === 'generation-create');
  assert('一场面试一棵树:两次调用的 generation 挂同一 traceId(可跨调用 RCA)', gens.length === 2 && gens[0].body.traceId === 'IV1' && gens[1].body.traceId === 'IV1');
  assert('trace sessionId=traceId=threadId(按面试归一 session)', batch[0].body.sessionId === 'IV1');
  // ② 检索质量信号:topScore 进 generation;低分打 low_recall tag(分"没召到"vs"没用好")
  assert('检索 topScore 进 generation metadata(0.82)', batch[1].body.metadata.topScore === 0.82);
  const lowEv: SpanEvent = { name: 'model:s', userId: 'u', traceId: 'IV2', obsId: 'IV2:q', metadata: { service: 's', outcome: 'ok', attempt: 1, latencyMs: 1, sources: [], inputTokens: 1, outputTokens: 1, topScore: 0.12 } };
  const lowBatch = toLangfuseBatch([lowEv], '2026-06-27T00:00:00.000Z') as any[];
  assert('召回弱(topScore<0.3)→ trace 打 low_recall tag(一眼看出"没召到")', lowBatch[0].body.tags.includes('low_recall'));
  assert('线格式仍脱敏:整个 batch 无 prompt/答案/原文(只标量+id+分数)', !JSON.stringify(batch).match(/prompt|简历|答案|content/));
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
