/** 熔断器证明（确定性,无 IO）：连败打开→快速失败不打模型(降级)→冷却半开→成功关闭(恢复)。 pnpm breaker:prove */
import { circuitBreaker, rateLimitedModel, resolveModelDeadlineConfig, resolveModelRateLimitConfig, withTimeout, timeoutSignal } from '../src/index.ts';
import type { ModelClient } from '../src/index.ts';
let fail = 0; const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };

let clock = 1000;
let calls = 0; let ok = false;
const inner: ModelClient = { async complete() { calls++; return ok ? { ok: true, raw: { q: 'x' } } : { ok: false, kind: 'transient' }; } };
const br = circuitBreaker(inner, { threshold: 3, cooldownMs: 5000, now: () => clock });

async function main() {
  for (let i = 0; i < 3; i++) await br.complete({ system: '', data: '' } as any, 0);   // 3 连败
  A('连败到阈值 → 熔断打开', br.phase() === 'open');
  const before = calls;
  const r = await br.complete({ system: '', data: '' } as any, 0);
  A('打开时:快速失败(transient)且**不打模型**(降级)', !r.ok && r.kind === 'transient' && calls === before);

  clock += 6000;                                  // 过冷却
  A('冷却后 → 半开', br.phase() === 'half_open');
  ok = true;                                      // 模型恢复
  const r2 = await br.complete({ system: '', data: '' } as any, 0);
  A('半开放行试探 + 成功 → 关闭(快速恢复)', r2.ok && br.phase() === 'closed');
  const c2 = calls;
  await br.complete({ system: '', data: '' } as any, 0);
  A('关闭后正常放行打模型', calls === c2 + 1);

  // Half-open is an admission state, not just a label.  After cooling down,
  // one probe may touch the provider while all concurrent followers fail
  // before dispatch; otherwise a recovered-but-still-broken endpoint receives
  // a thundering herd exactly when it is least healthy.
  let halfClock = 0;
  let halfProviderCalls = 0;
  let resolveHalfProbe!: (value: any) => void;
  const probeRequest = { service: 'breaker-probe', system: '', userData: '' };
  const half = circuitBreaker({
    complete() {
      halfProviderCalls++;
      if (halfProviderCalls === 1) return Promise.resolve({ ok: false as const, kind: 'transient' as const });
      return new Promise((resolve) => { resolveHalfProbe = resolve; });
    },
  }, { threshold: 1, cooldownMs: 10, now: () => halfClock });
  await half.complete(probeRequest, 1); // opens circuit
  halfClock = 11;
  const probe = half.complete(probeRequest, 1);
  await new Promise((resolve) => setTimeout(resolve, 5));
  const followers = await Promise.all([
    half.complete(probeRequest, 1),
    half.complete(probeRequest, 1),
  ]);
  A('半开并发只允许一个探针外呼，其余请求在派发前 known-not-executed',
    halfProviderCalls === 2 && followers.every((r) => !r.ok && r.externalOutcome === 'known_not_executed'));
  resolveHalfProbe({ ok: true, raw: { q: 'recovered' } });
  const recovered = await probe;
  A('唯一半开探针成功后关闭熔断器，后续请求可恢复', recovered.ok && half.phase() === 'closed');

  // An aborted plan that never reaches dispatch must not strand the only
  // half-open probe lease.  The next request remains eligible to test safely.
  let abortClock = 0;
  let abortProviderCalls = 0;
  const abortRequest = { service: 'breaker-abort-probe', system: '', userData: '' };
  const abortable = circuitBreaker({
    async complete() { abortProviderCalls++; return abortProviderCalls === 1 ? { ok: false as const, kind: 'transient' as const } : { ok: true as const, raw: { q: 'next-probe' } }; },
  }, { threshold: 1, cooldownMs: 10, now: () => abortClock });
  await abortable.complete(abortRequest, 1);
  abortClock = 11;
  const abandonedPlan = await abortable.prepare!(abortRequest, 1);
  const abortedSignal = new AbortController(); abortedSignal.abort();
  let cancelledBeforeDispatch = false;
  try {
    if (abandonedPlan.ready && abandonedPlan.admit) await abandonedPlan.admit(abortedSignal.signal);
  }
  catch (error: any) { cancelledBeforeDispatch = error?.message === 'model_execution_aborted'; }
  const nextProbe = await abortable.complete(abortRequest, 1);
  A('半开探针在派发前取消会释放 lease；下一探针仍可执行',
    cancelledBeforeDispatch && nextProbe.ok && abortProviderCalls === 2 && abortable.phase() === 'closed');

  // 超时:挂住的 Promise 到点中断(快速恢复,不无限等)
  let fired = false;
  let timedOut = false;
  try { await withTimeout(new Promise(() => {}), 30, () => { fired = true; }); } catch (e: any) { timedOut = e.message === 'timeout'; }
  A('挂住的调用到点超时(不无限等)+ 触发清理回调', timedOut && fired);
  const ts = timeoutSignal(20); const aborted = await new Promise((res) => { ts.signal.addEventListener('abort', () => res(true)); setTimeout(() => res(false), 100); });
  A('timeoutSignal 到点真 abort(fetch 连接可断)', aborted === true); ts.clear();

  // P0: a request waiting for a local concurrency slot must be cancellable
  // before it crosses `invoke`'s durable dispatch/cost boundary.  Releasing
  // the first request afterwards must not wake an already-aborted waiter.
  let providerCalls = 0;
  let resolveFirst!: (value: any) => void;
  const limited = rateLimitedModel({
    complete(req) {
      providerCalls++;
      if (req.service === 'hold') return new Promise((resolve) => { resolveFirst = resolve; });
      return Promise.resolve({ ok: true as const, raw: { q: 'should-not-send' } });
    },
  }, { maxConcurrent: 1 });
  const first = limited.complete({ service: 'hold', system: '', userData: '' }, 1);
  await new Promise((resolve) => setTimeout(resolve, 5));
  const queuedAbort = new AbortController();
  const queued = limited.complete({ service: 'queued', system: '', userData: '' }, 1, queuedAbort.signal);
  queuedAbort.abort();
  let queueCancelled = false;
  try { await queued; } catch (error: any) { queueCancelled = error?.message === 'model_execution_aborted'; }
  resolveFirst({ ok: true, raw: { q: 'first' } });
  await first;
  await new Promise((resolve) => setTimeout(resolve, 5));
  A('限流排队请求 abort 后永不发送，释放旧槽位也不产生晚到 provider 调用',
    queueCancelled && providerCalls === 1 && limited.inflight() === 0 && limited.queued() === 0);

  const savedDeadlineEnv = {
    execution: process.env.MODEL_EXECUTION_TIMEOUT_MS,
    transport: process.env.MODEL_TIMEOUT_MS,
    wait: process.env.MODEL_INVOCATION_WAIT_MS,
  };
  let invalidDeadlineRejected = false;
  try {
    process.env.MODEL_EXECUTION_TIMEOUT_MS = '1000';
    process.env.MODEL_TIMEOUT_MS = '30000';
    process.env.MODEL_INVOCATION_WAIT_MS = 'not-a-number';
    resolveModelDeadlineConfig();
  } catch (error: any) {
    invalidDeadlineRejected = String(error?.message).startsWith('model_deadline_config_invalid:');
  } finally {
    if (savedDeadlineEnv.execution === undefined) delete process.env.MODEL_EXECUTION_TIMEOUT_MS; else process.env.MODEL_EXECUTION_TIMEOUT_MS = savedDeadlineEnv.execution;
    if (savedDeadlineEnv.transport === undefined) delete process.env.MODEL_TIMEOUT_MS; else process.env.MODEL_TIMEOUT_MS = savedDeadlineEnv.transport;
    if (savedDeadlineEnv.wait === undefined) delete process.env.MODEL_INVOCATION_WAIT_MS; else process.env.MODEL_INVOCATION_WAIT_MS = savedDeadlineEnv.wait;
  }
  A('启动 deadline 配置拒绝 transport 超过 gateway 或非法等待预算（fail-fast）', invalidDeadlineRejected);

  let invalidRateLimitRejected = false;
  try { resolveModelRateLimitConfig({ MODEL_MAX_CONCURRENT: 'not-a-number', MODEL_RPM: 'Infinity' } as NodeJS.ProcessEnv); }
  catch (error: any) { invalidRateLimitRejected = error?.message === 'model_rate_limit_config_invalid:MODEL_MAX_CONCURRENT'; }
  A('非法模型并发/RPM 配置在启动前 fail-fast（不创建永久排队）', invalidRateLimitRejected);

  console.log(`\n${fail === 0 ? '✓ 熔断器(降级+恢复)全部通过' : '✗ ' + fail + ' 失败'}`);
  process.exit(fail === 0 ? 0 : 1);
}
main();
