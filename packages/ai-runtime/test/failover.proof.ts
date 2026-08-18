/**
 * Pre-dispatch failover proof. A billable request may select backup only when
 * primary is already known unavailable; post-dispatch transient responses are
 * never replayed to another supplier under the same idempotency key.
 */
import { failoverModel } from '../src/failover-model.ts';
import type { ModelClient } from '../src/model-client.ts';
import type { ModelResult } from '../src/invoke.ts';

let fails = 0;
const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fails++; };
const stub = (res: ModelResult, log: string[], tag: string): ModelClient => ({ async complete() { log.push(tag); return res; } });
const unavailable = (log: string[], tag: string): ModelClient => ({
  async complete() { log.push(tag); return { ok: false, kind: 'transient', externalOutcome: 'known_not_executed' }; },
  prepare() { log.push(`${tag}:preflight`); return { ready: false, error: 'model_circuit_open' }; },
});
const OK = (raw: unknown): ModelResult => ({ ok: true, raw });

// ① Primary accepted the send boundary then timed out: backup must not be sent.
{
  const log: string[] = [];
  const m = failoverModel([stub({ ok: false, kind: 'transient', externalOutcome: 'unknown' }, log, 'p'), stub(OK({ v: 'backup' }), log, 'b')]);
  const r = await m.complete({ service: 's', system: '', userData: '' }, 0);
  A('主端点结果不明 → 不向 backup 重发', r.ok === false && (r as any).externalOutcome === 'unknown');
  A('  实际外发仅 primary 一次', log.join(',') === 'p');
}
// ② Primary already-open circuit: select backup before any external dispatch.
{
  const log: string[] = [];
  const m = failoverModel([unavailable(log, 'p'), stub(OK({ v: 'backup' }), log, 'b')]);
  const r = await m.complete({ service: 's', system: '', userData: '' }, 0);
  A('发送前已知主端点不可用 → 选择 backup', r.ok === true && (r as any).raw?.v === 'backup');
  A('  primary 没有外发，backup 只发一次', log.join(',') === 'p:preflight,b');
}
// ③ Explicit rejection stays on the selected endpoint; no cross-provider semantic drift.
{
  const log: string[] = [];
  const m = failoverModel([stub({ ok: false, kind: 'deterministic', externalOutcome: 'known_not_executed' }, log, 'p'), stub(OK({ v: 'backup' }), log, 'b')]);
  const r = await m.complete({ service: 's', system: '', userData: '' }, 0);
  A('主端点明确拒绝 → 不换供应商', r.ok === false && (r as any).kind === 'deterministic' && log.join(',') === 'p');
}

console.log(fails === 0 ? '\n✓ failover：仅发送前选健康端点；结果不明不重复派发' : `\n✗ ${fails} 条失败`);
process.exit(fails === 0 ? 0 : 1);
