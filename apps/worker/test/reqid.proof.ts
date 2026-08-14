/**
 * 全链路 request-id 证明（对真 Postgres）：一根 reqId 贯穿 HTTP 请求 → worker job → 模型调用 trace。
 * 证明"某次请求为什么失败"能一跳到底查(单表按 request_id 反查本次请求触发的所有模型调用),不用跨表拼 threadId/幂等键。
 *   ① 显式字段:invoke({ requestId }) → 落 ai_invocation_trace.request_id；
 *   ② 端到端(生产接线复刻):reqId 写进 job.payload → 先 claim 元数据、通过安全门后仅读 requestId 标量 → 经 ALS 上下文 → 深埋的 invoke 自动带上 → 落 trace.request_id
 *      → 再按 request_id 单表反查捞回本次请求的调用(一跳到底);
 *   ③ reqId 缺失(旧 job / 无头请求):payload 无 requestId → 不进 ALS → invoke 落 NULL,**不崩**(向后兼容,现有调用零改动);
 *   ④ 显式 spec.requestId 优先于 ALS 环境值(调用方可覆盖);
 *   ⑤ 并发/多 job:两 job 各自 reqId 经并发 ALS 上下文互不串味(re-投下按 payload 重放同一 reqId,不依赖内存)。
 * 用真 DB + fake 模型(确定性,不打网络);复刻 interview-consumer 的出队→ALS→invoke 接线(同一 Symbol 全局 ALS 实例)。
 *   pnpm reqid:prove   (需 pnpm db:up)
 */
import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { createPool, asPrincipal, assertIsolatedTestTarget, enqueueInterviewJob, claimNextInterviewJob, loadClaimedInterviewJobRequestId } from '@meetwise/db';
import { invoke, type Model } from '@meetwise/ai-runtime';

const pool = createPool();
let failures = 0;
const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) failures++; };
const section = (t: string) => console.log(`\n──────── ${t} ────────`);
const OWNER = 'reqidUser';
const LEASE = 'reqid-worker#1';

// 与 ai-runtime 关口共享的同一 ALS(Symbol 全局注册表槽;两包不互 import,单例安全)——即 interview-consumer 出队接力用的那根。
const requestIdStore: AsyncLocalStorage<string> =
  ((globalThis as unknown as Record<symbol, AsyncLocalStorage<string> | undefined>)[Symbol.for('meetwise.ai-runtime.requestIdContext')] ??= new AsyncLocalStorage<string>());

const QSchema = z.object({ question: z.string().min(1) });
// 确定性 fake 模型:不打网络,直接给合法产出(双校验会过)。
const fakeModel = (q: string): Model => ({ async call() { return { ok: true, raw: { question: q } }; } });

/** 读某次调用落库的 request_id(RLS FORCE → 必须 principal 上下文读)。 */
const traceReqId = (key: string) =>
  asPrincipal(pool, OWNER, (c) => c.query('SELECT request_id FROM ai_invocation_trace WHERE owner_user_id=$1 AND idempotency_key=$2', [OWNER, key]))
    .then((r) => (r.rowCount ? (r.rows[0].request_id as string | null) : ('<no-row>' as const)));

/** 复刻 interview-consumer 出队接线:门后读 requestId 标量 → 跑在 ALS 上下文 → 内部 invoke 不传 requestId 字段(全靠环境值)。 */
async function processLikeConsumer(requestId: string | undefined, key: string, q: string) {
  const run = () => invoke({ idempotencyKey: key, schema: QSchema, businessValidate: () => null, model: fakeModel(q) }, pool, OWNER);
  return requestId ? requestIdStore.run(requestId, run) : run();
}

async function main() {
  // Do not rebuild an old shadow schema here: it misses current durable
  // invocation and v64 resume-reference gates. This proof is valid only on
  // the isolated runner's complete migration prefix.
  await assertIsolatedTestTarget(pool);
  const hasCurrentColumns = await pool.query(
    "SELECT count(*)::int AS n FROM information_schema.columns WHERE table_name='ai_model_invocation' AND column_name IN ('request_id','cost_scope_id')",
  );
  A('完整迁移已提供 trace 与 durable invocation 当前列', Number(hasCurrentColumns.rows[0]?.n) === 2);

  section('① 显式字段:invoke({ requestId }) → 落 trace.request_id');
  const REQ1 = 'req-explicit-0001';
  await invoke({ idempotencyKey: 'k:explicit', schema: QSchema, businessValidate: () => null, model: fakeModel('显式题'), requestId: REQ1 }, pool, OWNER);
  A('显式 requestId 落到 trace.request_id', (await traceReqId('k:explicit')) === REQ1);

  section('② 端到端:job.payload.requestId → 安全标量读取 → ALS → invoke → trace.request_id → 按 reqId 反查');
  const REQ2 = 'req-e2e-abc123';
  const IID = 'iv-reqid-' + Date.now();
  const resumeId = randomUUID();
  await asPrincipal(pool, OWNER, async (c) => {
    await c.query("INSERT INTO resume(id,owner_user_id,status,content_sha) VALUES ($1,$2,'ingested',$3)", [resumeId, OWNER, `reqid-resume-${process.pid}`]);
    await c.query("INSERT INTO interview(id,owner_user_id,status,resume_id,resume_privacy_epoch) VALUES ($1,$2,'created',$3,1)", [IID, OWNER, resumeId]);
  });
  await asPrincipal(pool, OWNER, (c) => enqueueInterviewJob(c, OWNER, IID, 'start', { requestId: REQ2 }, 0));
  const job = await asPrincipal(pool, OWNER, (c) => claimNextInterviewJob(c, OWNER, LEASE));
  const jobRequest = job && await asPrincipal(pool, OWNER, (c) => loadClaimedInterviewJobRequestId(c, OWNER, job.id, LEASE));
  A('出队只拿元数据，门后安全标量携带 requestId', !!job && !('payload' in job) && jobRequest?.stillClaimed === true && jobRequest.requestId === REQ2);
  await processLikeConsumer(jobRequest?.requestId, 'k:e2e', '端到端题');   // 内部 invoke **不传** requestId 字段——全靠出队 ALS 接力
  A('安全 requestId 标量 → ALS → invoke → trace.request_id 端到端命中', (await traceReqId('k:e2e')) === REQ2);
  // 一跳到底:给定一根 reqId,单表反查本次请求触发的所有模型调用(不用跨表拼 threadId/幂等键)
  const byReq = await asPrincipal(pool, OWNER, (c) => c.query('SELECT idempotency_key FROM ai_invocation_trace WHERE request_id=$1', [REQ2]));
  A('按 request_id 单表反查捞回本次请求的调用(一跳到底)', byReq.rowCount === 1 && byReq.rows[0].idempotency_key === 'k:e2e');

  section('③ reqId 缺失(旧 job / 无头请求):不进 ALS → trace.request_id=NULL,不崩');
  const IID3 = 'iv-noreq-' + Date.now();
  await asPrincipal(pool, OWNER, (c) => c.query(
    "INSERT INTO interview(id,owner_user_id,status,resume_id,resume_privacy_epoch) VALUES ($1,$2,'created',$3,1)", [IID3, OWNER, resumeId],
  ));
  await asPrincipal(pool, OWNER, (c) => enqueueInterviewJob(c, OWNER, IID3, 'start', {}, 0));   // payload 无 requestId
  const job3 = await asPrincipal(pool, OWNER, (c) => claimNextInterviewJob(c, OWNER, LEASE));
  const job3Request = job3 && await asPrincipal(pool, OWNER, (c) => loadClaimedInterviewJobRequestId(c, OWNER, job3.id, LEASE));
  A('缺 requestId 的 job 正常出队(安全标量为 undefined)', !!job3 && job3Request?.stillClaimed === true && job3Request.requestId === undefined);
  const out3 = await processLikeConsumer(job3Request?.requestId, 'k:noreq', '无reqId题');   // 不应抛
  A('reqId 缺失时 invoke 不崩、照常产出', out3 !== undefined && 'value' in (out3 as any));
  A('trace.request_id 落 NULL(向后兼容,现有调用零改动)', (await traceReqId('k:noreq')) === null);

  section('④ 显式 spec.requestId 优先于 ALS 环境值(调用方可覆盖)');
  const stored4 = await requestIdStore.run('ambient-XXX', () =>
    invoke({ idempotencyKey: 'k:prio', schema: QSchema, businessValidate: () => null, model: fakeModel('优先题'), requestId: 'explicit-YYY' }, pool, OWNER));
  A('spec.requestId 存在 → 覆盖 ALS 环境值', stored4 !== undefined && (await traceReqId('k:prio')) === 'explicit-YYY');

  section('⑤ 并发多 job:各自 reqId 经并发 ALS 上下文互不串味');
  const cReqs = ['req-conc-A', 'req-conc-B', 'req-conc-C'];
  await Promise.all(cReqs.map((rq, i) => {
    const key = 'k:conc:' + i;
    // 每个跑在自己的 ALS 上下文里并发执行,invoke 内部只读环境值
    return requestIdStore.run(rq, () => invoke({ idempotencyKey: key, schema: QSchema, businessValidate: () => null, model: fakeModel('并发题' + i) }, pool, OWNER));
  }));
  const concOk = await Promise.all(cReqs.map((rq, i) => traceReqId('k:conc:' + i).then((v) => v === rq)));
  A('三并发调用各自 reqId 精确落库(ALS 上下文隔离,无串味)', concOk.every(Boolean));
  // 重投稳定性:同一 job(同 payload.requestId)再处理一次 → invoke 幂等命中缓存,reqId 不漂移(首写为准)
  await processLikeConsumer(jobRequest?.requestId, 'k:e2e', '端到端题-重投');
  A('重投同一 job:reqId 稳定不漂移(payload 是持久真相 + invoke 幂等)', (await traceReqId('k:e2e')) === REQ2);

  console.log(`\n${failures === 0 ? '✓ 全部通过' : '✗ ' + failures + ' 项失败'}`);
  await pool.end();
  process.exit(failures === 0 ? 0 : 1);
}
main().catch((e) => { console.error(e); process.exit(1); });
