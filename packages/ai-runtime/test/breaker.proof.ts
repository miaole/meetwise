/** 熔断器证明（确定性,无 IO）：连败打开→快速失败不打模型(降级)→冷却半开→成功关闭(恢复)。 pnpm breaker:prove */
import { circuitBreaker, withTimeout, timeoutSignal } from '../src/index.ts';
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

  // 超时:挂住的 Promise 到点中断(快速恢复,不无限等)
  let fired = false;
  let timedOut = false;
  try { await withTimeout(new Promise(() => {}), 30, () => { fired = true; }); } catch (e: any) { timedOut = e.message === 'timeout'; }
  A('挂住的调用到点超时(不无限等)+ 触发清理回调', timedOut && fired);
  const ts = timeoutSignal(20); const aborted = await new Promise((res) => { ts.signal.addEventListener('abort', () => res(true)); setTimeout(() => res(false), 100); });
  A('timeoutSignal 到点真 abort(fetch 连接可断)', aborted === true); ts.clear();

  console.log(`\n${fail === 0 ? '✓ 熔断器(降级+恢复)全部通过' : '✗ ' + fail + ' 失败'}`);
  process.exit(fail === 0 ? 0 : 1);
}
main();
