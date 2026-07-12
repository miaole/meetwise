/**
 * failover.proof — 跨供应商 failover 链的确定性证明(生产高可用:单供应商=单点故障)。
 * 断言:primary transient→切 backup;primary deterministic→不切;primary ok→不调 backup;全 transient→返 transient。
 * 用法:pnpm -C packages/ai-runtime prove:failover
 */
import { failoverModel } from '../src/failover-model.ts';
import type { ModelClient } from '../src/model-client.ts';
import type { ModelResult } from '../src/invoke.ts';

let fails = 0;
const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fails++; };
const stub = (res: ModelResult, log: string[], tag: string): ModelClient => ({
  async complete() { log.push(tag); return res; },
});
const OK = (raw: unknown): ModelResult => ({ ok: true, raw });

// ① primary transient(熔断/429/超时)→ 切 backup,返 backup 的 ok
{
  const log: string[] = [];
  const m = failoverModel([stub({ ok: false, kind: 'transient' }, log, 'p'), stub(OK({ v: 'backup' }), log, 'b')]);
  const r = await m.complete({ service: 's', system: '', userData: '' } as any, 0);
  A('primary transient → 切 backup 且返 backup', r.ok === true && (r as any).raw?.v === 'backup');
  A('  调用顺序 = primary 后 backup', log.join(',') === 'p,b');
}
// ② primary deterministic(4xx 内容被拒)→ 不 failover,直接返 deterministic
{
  const log: string[] = [];
  const m = failoverModel([stub({ ok: false, kind: 'deterministic' }, log, 'p'), stub(OK({ v: 'backup' }), log, 'b')]);
  const r = await m.complete({ service: 's', system: '', userData: '' } as any, 0);
  A('primary deterministic → 不 failover', r.ok === false && (r as any).kind === 'deterministic');
  A('  backup 未被调用(换供应商也拒)', log.join(',') === 'p');
}
// ③ primary ok → 直接返,backup 不调
{
  const log: string[] = [];
  const m = failoverModel([stub(OK({ v: 'primary' }), log, 'p'), stub(OK({ v: 'backup' }), log, 'b')]);
  const r = await m.complete({ service: 's', system: '', userData: '' } as any, 0);
  A('primary ok → 返 primary,backup 不调', r.ok === true && (r as any).raw?.v === 'primary' && log.join(',') === 'p');
}
// ④ 全 transient → 返 transient(交上层重试/降级)
{
  const log: string[] = [];
  const m = failoverModel([stub({ ok: false, kind: 'transient' }, log, 'p'), stub({ ok: false, kind: 'transient' }, log, 'b')]);
  const r = await m.complete({ service: 's', system: '', userData: '' } as any, 0);
  A('全挂 → transient(上层重试/降级)', r.ok === false && (r as any).kind === 'transient' && log.join(',') === 'p,b');
}

console.log(fails === 0 ? '\n✓ failover 链:primary 故障秒切 backup、内容拒不换供应商、成功不多调、全挂交降级' : `\n✗ ${fails} 条失败`);
process.exit(fails === 0 ? 0 : 1);
