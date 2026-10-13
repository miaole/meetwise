/**
 * HA-2 · API 优雅停机证明（注入式确定性·无 IO，沿 drain-loop.proof.ts 形制）。
 * 覆盖 REQUEST §4 A.1（拒新放旧+关闭链时序）、A.2（SSE 不发半截+干净收口+end 恰一次
 * +end 后 write=0）、A.4-api 侧（SIGTERM/SIGINT 同链幂等 + R2 禁 enableShutdownHooks
 * + deadline 强退不 unref）与 §3 C1/C2/C4 单元面。 pnpm -C apps/api prove:ha2-drain
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import Fastify from 'fastify';
import { createSseRegistry, getSseRegistry, type SseRegistry, type SseRegistryEntry } from '../src/platform/sse-registry.ts';
import { pumpSseEvents, type SseEventRow, type SsePumpOptions } from '../src/platform/sse-pump.ts';
import { drainGateHook, createApiShutdownChain, HEALTH_PROBE_PATHS } from '../src/main.ts';
import { HealthController } from '../src/modules/health/health.controller.ts';
import type { SseNotifyService } from '../src/platform/sse-notify.service.ts';

let fail = 0;
let pass = 0;
const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); c ? pass++ : fail++; };
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const orTimeout = (p: Promise<void>, label: string) => Promise.race([p, sleep(500).then(() => { throw new Error(label); })]);

// ── fake 组装（沿泵注入缝：reply.raw / reqRaw / notify 全 fake，零 socket）─────────
function fakeSseTarget() {
  const frames: string[] = [];
  const closeListeners: Array<() => void> = [];
  let endCount = 0;
  let writesAfterEnd = 0;
  let ended = false;
  const raw = {
    writeHead(_code: number, _h: Record<string, string>) { /* 头非本刀断言面 */ },
    write(s: string) {
      if (ended) { writesAfterEnd++; throw new Error('ERR_STREAM_WRITE_AFTER_END'); }
      frames.push(s);
      return true;
    },
    end() {
      if (ended) throw new Error('ERR_STREAM_DOUBLE_END');
      ended = true;
      endCount++;
    },
  };
  return {
    frames,
    reply: { hijack() {}, raw },
    reqRaw: { on(_e: 'close', l: () => void) { closeListeners.push(l); } },
    fireClose() { for (const l of closeListeners) l(); },
    stats: { get endCount() { return endCount; }, get writesAfterEnd() { return writesAfterEnd; } },
  };
}

function fakeNotify(): SseNotifyService {
  return {
    health: () => ({ healthy: true }),   // healthy → 走 fallbackMsHealthy 注入缝(快轮询)
    waitFor: (_streamKey: string) => ({ promise: new Promise<void>(() => {}), dispose() {} }),
  } as unknown as SseNotifyService;
}

/** fetchMore 受控：由 proof 逐发 resolve（确定性时序，零真实库）。 */
function controlledFetch() {
  const pending: Array<(v: { rows: SseEventRow[] } | null) => void> = [];
  return {
    fetchMore: (_lastSeq: number) => new Promise<{ rows: SseEventRow[] } | null>((res) => pending.push(res)),
    resolveNext(value: { rows: SseEventRow[] } | null) { pending.shift()!(value); },
    get inFlight() { return pending.length; },
  };
}

function runPump(o: Partial<SsePumpOptions> & { registry: SseRegistry }) {
  const target = fakeSseTarget();
  const fetch = controlledFetch();
  const done = pumpSseEvents({
    reply: target.reply as never,
    reqRaw: target.reqRaw,
    streamKey: 'proof-stream',
    initial: { lastId: 0, rows: [] },
    fetchMore: fetch.fetchMore,
    isTerminal: (k) => k === 'terminal',
    notify: fakeNotify(),
    fallbackMsHealthy: 50,
    ...o,
  } as SsePumpOptions).then(() => undefined);
  return { done, target, fetch };
}

// ── 1) C1 注册表单元 ────────────────────────────────────────────────────────────
function registryUnit() {
  console.log('--- C1 sse-registry 单元 ---');
  const r = createSseRegistry();
  A('空表 count=0', r.count() === 0);
  A('未排水时 isDraining=false', r.isDraining() === false);
  A('空表 drainAll 返回 0（此时旗已翻——beginDrain 先行是生产序，语义见下行）', r.drainAll() === 0 && r.isDraining() === true);
  let drained1 = 0;
  const e1: SseRegistryEntry = { requestDrain: () => { drained1++; } };
  r.register('k1', e1);
  r.register('k1', e1);                       // 同条目重复注册：identity 去重
  A('同条目重复注册 identity 去重 count=1', r.count() === 1);
  A('drainAll 返回在册条数=1 且同步置旗', r.drainAll() === 1 && drained1 >= 1);
  A('重复 drainAll 幂等（返回条数不变·requestDrain 可重入，end 只由泵单点触发）', r.drainAll() === 1);
  r.unregister('k1', e1);
  A('unregister 后 count=0（置旗不 end——R1：条目只持旗）', r.count() === 0 && drained1 >= 1);
  r.unregister('k1', e1);
  A('unregister 幂等（不抛）', true);
  const r2 = createSseRegistry();
  r2.beginDrain();
  A('beginDrain 只翻旗不动条目', r2.isDraining() === true && r2.count() === 0);
  const singletonA = getSseRegistry();
  A('进程单例同读一份（门/readiness/泵同源）', getSseRegistry() === singletonA);
  A('HEALTH_PROBE_PATHS 钉三别名（livez/readyz/api/health·C4 钉）',
    HEALTH_PROBE_PATHS.has('/livez') && HEALTH_PROBE_PATHS.has('/readyz/api') && HEALTH_PROBE_PATHS.has('/health') && HEALTH_PROBE_PATHS.size === 3);
}

// ── 2) A.2 泵 × 注册表：不发半截 + 干净收口 + end 恰一次 + end 后 write=0 ───────
// 时序纪律：fallbackMsHealthy=50ms 兜底窗 → fetchMore#1 于 t≈50ms 在飞；确定性排布
// drain 落点（等待臂 vs 取数窗），零竞态。
async function pumpDrainProof() {
  console.log('--- A.2 泵注册表排水（drain 落等待臂） ---');
  {
    const reg = createSseRegistry();
    const { done, target, fetch } = runPump({ registry: reg, initial: { lastId: 0, rows: [{ seq: 1, kind: 'message', payload: { n: 1 } }] } });
    await sleep(60);                          // iter1 兜底臂醒来 → fetchMore#1 在飞
    fetch.resolveNext({ rows: [{ seq: 2, kind: 'message', payload: { n: 2 } }] });   // frame2 发出 → iter2 等待臂（50ms 窗）
    await sleep(10);                          // t≈70：恰在 iter2 等待臂内
    const drained = reg.drainAll();           // drain 落等待臂：requestDrain 置旗 + 唤醒本轮 race
    await orTimeout(done, 'pump_not_drained');
    A(`drainAll 返回在册 1（实得 ${drained}）`, drained === 1);
    A(`全部 write 为完整帧（尾 \\n\\n·不发半截·共 ${target.frames.length} 帧）`, target.frames.length >= 2 && target.frames.every((f) => f.endsWith('\n\n')));
    A('raw.end() 恰一次（泵内单点）', target.stats.endCount === 1);
    A('end 后 write=0（R1：写后关封死·零 ERR_STREAM_WRITE_AFTER_END）', target.stats.writesAfterEnd === 0);
    A('排空后在册=0（泄漏断言）', reg.count() === 0);
  }
  console.log('--- A.2 drain 落取数窗（禁 emit·防写后关） ---');
  {
    const reg = createSseRegistry();
    const { done, target, fetch } = runPump({ registry: reg, initial: { lastId: 0, rows: [{ seq: 1, kind: 'message', payload: { n: 1 } }] } });
    await sleep(60);                          // fetchMore#1 在飞
    assert.ok(fetch.inFlight === 1);
    reg.drainAll();                           // drain 落取数窗（此时 wakeOnClose=undefined，仅置旗）
    fetch.resolveNext({ rows: [{ seq: 2, kind: 'message', payload: { n: 2 } }] });   // 取数带回新行
    await orTimeout(done, 'pump_not_drained');
    A('取数窗 drain：新行不 emit（写面停在 drain 前末帧）', target.frames.length === 1);
    A('end 恰一次 · end 后 write=0', target.stats.endCount === 1 && target.stats.writesAfterEnd === 0);
    A('在册=0', reg.count() === 0);
  }
  console.log('--- A.2 其余退出路径全注销（断开/终态/取数失败/晚到连接） ---');
  {
    const reg = createSseRegistry();
    const { done, target, fetch } = runPump({ registry: reg, initial: { lastId: 0, rows: [{ seq: 1, kind: 'message', payload: {} }] } });
    await sleep(60);
    fetch.resolveNext({ rows: [{ seq: 2, kind: 'message', payload: {} }] });
    await sleep(10);                          // iter2 等待臂内
    target.fireClose();                       // 客户端断开（唤醒 + closed）
    await orTimeout(done, 'pump_not_closed');
    A('断开路径：注销 count=0 · 不 end（socket 已亡，语义原值）', reg.count() === 0 && target.stats.endCount === 0);
  }
  {
    const reg = createSseRegistry();
    const { done, target, fetch } = runPump({ registry: reg, initial: { lastId: 0, rows: [{ seq: 1, kind: 'message', payload: {} }] } });
    await sleep(60);
    fetch.resolveNext({ rows: [{ seq: 2, kind: 'terminal', payload: {} }] });
    await orTimeout(done, 'pump_not_terminal');
    A('终态路径：end 恰一次 · count=0', target.stats.endCount === 1 && reg.count() === 0);
  }
  {
    const reg = createSseRegistry();
    const { done, target, fetch } = runPump({ registry: reg, initial: { lastId: 0, rows: [{ seq: 1, kind: 'message', payload: {} }] } });
    await sleep(60);
    fetch.resolveNext(null);                  // 取数失败 → 收尾
    await orTimeout(done, 'pump_not_failed');
    A('取数失败路径：end 恰一次 · count=0', target.stats.endCount === 1 && reg.count() === 0);
  }
  {
    const reg = createSseRegistry();
    reg.beginDrain();                         // drain 已开 → 晚到连接即刻持旗
    const { done, target } = runPump({ registry: reg, initial: { lastId: 0, rows: [{ seq: 1, kind: 'message', payload: {} }] } });
    await orTimeout(done, 'late_pump_held');
    A('晚到连接（drain 已开）：零写 · end 恰一次 · count=0', target.frames.length === 0 && target.stats.endCount === 1 && reg.count() === 0);
  }
}

// ── 3) A.1 拒新放旧：gate 钩子（真 fastify 实例注入） + 关闭链时序 ───────────────
async function gateProof() {
  console.log('--- A.1 drainGateHook（真 fastify inject） ---');
  const registry = createSseRegistry();
  const app = Fastify();
  app.addHook('onRequest', drainGateHook(registry));   // 与 bootstrap 同一装配序（public-preview 之后）
  app.get('/hello', async () => ({ ok: true }));
  app.get('/livez', async () => ({ status: 'ok' }));
  const ok = await app.inject({ method: 'GET', url: '/hello' });
  A('未排水：普通路由 200', ok.statusCode === 200);
  registry.beginDrain();
  const denied = await app.inject({ method: 'GET', url: '/hello?x=1' });
  A('排水期普通路由 503', denied.statusCode === 503);
  A('信封 service_unavailable_draining（AllExceptionsFilter 形制）', (denied.json() as { error?: string }).error === 'service_unavailable_draining');
  A('connection: close 头', String(denied.headers.connection).toLowerCase() === 'close');
  const livez = await app.inject({ method: 'GET', url: '/livez' });
  A('/livez 恒 200（进程存活信号·门豁免）', livez.statusCode === 200);
  const readyz = await app.inject({ method: 'GET', url: '/readyz/api' });
  A('/readyz/api 门豁免（放行至路由层——翻脸由 C4 handler 承担）', readyz.statusCode === 404);   // 裸 app 无该路由：404=门已放行
  await app.close();

  console.log('--- A.1 createApiShutdownChain（注入 closeApp/registry/计时） ---');
  {
    const reg = createSseRegistry();
    let handlerResolvedAt = 0;
    let closeCompletedAt = 0;
    let exitCode: number | undefined;
    const logs: string[] = [];
    const errs: string[] = [];
    const entry: SseRegistryEntry = {
      requestDrain() { void sleep(30).then(() => reg.unregister('s', entry)); },   // 泵帧边界收尾模拟
    };
    reg.register('s', entry);
    let releaseInFlight!: () => void;
    const inFlight = new Promise<void>((r) => { releaseInFlight = r; });
    const chain = createApiShutdownChain({
      registry: reg,
      closeApp: async () => { await inFlight; closeCompletedAt = Date.now(); },    // app.close 等在飞完成
      timeoutMs: 5_000,
      exit: (code) => { exitCode = code; },
      log: (...m: unknown[]) => logs.push(m.join(' ')),
      error: (...m: unknown[]) => errs.push(m.join(' ')),
    });
    chain('SIGTERM');
    await sleep(10);
    A('链入口即翻旗（503 门/readiness 立即生效）', reg.isDraining() === true);
    await sleep(40);                                   // 泵模拟先收尾
    handlerResolvedAt = Date.now();
    releaseInFlight();                                 // 在飞 handler 后完成
    await sleep(30);
    A('exit 0（进程自退·非 137）', exitCode === 0);
    A('close 完成 ≥ 在飞 handler resolve（放旧时序）', closeCompletedAt >= handlerResolvedAt && closeCompletedAt > 0);
    A('api_drained 日志在卷', logs.some((l) => l.includes('api_drained')));
    A('未触 deadline（api_drain_timeout 零命中）', errs.length === 0);
    A('排空后在册=0', reg.count() === 0);
    chain('SIGINT');                                   // 双信号：第二次 no-op
    await sleep(20);
    A('SIGTERM 后 SIGINT 幂等（不二次 close/exit）', errs.length === 0 && exitCode === 0);
  }
  {
    const reg = createSseRegistry();
    const stuck: SseRegistryEntry = { requestDrain() {} };   // 永不收尾（fetchMore 挂死形态）
    reg.register('s', stuck);
    let exitCode: number | undefined;
    const errs: string[] = [];
    const chain = createApiShutdownChain({
      registry: reg,
      closeApp: async () => { await new Promise<void>(() => {}); },
      timeoutMs: 40,
      exit: (code) => { exitCode = code; },
      log: () => {},
      error: (...m: unknown[]) => errs.push(m.join(' ')),
    });
    chain('SIGTERM');
    await sleep(120);
    A('deadline 到点 api_drain_timeout 日志', errs.some((l) => l.includes('api_drain_timeout')));
    A('deadline 强退 exit 0（内部上限 < 容器宽限）', exitCode === 0);
    // proof 收尾纪律：生产 deadline 路径 process.exit 是真退出；本 proof exit 为 fake，
    // 链内 poll 循环仍在 10ms 计时——注销 stuck 条目让 poll 排空，进程可自然退出。
    reg.unregister('s', stuck);
    await sleep(30);
  }
}

// ── 4) A.4-api：源级断言（R2 禁 enableShutdownHooks + 双信号同 handler + R1 面） ──
function sourceAssertions() {
  console.log('--- A.4-api 源级断言（main.ts / sse-pump.ts 接线） ---');
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const mainSrc = readFileSync(join(root, 'src/main.ts'), 'utf8');
  A('R2：main.ts 零 enableShutdownHooks 调用', !/enableShutdownHooks\s*\(/.test(mainSrc));
  A('SIGTERM 与 SIGINT 注册同一 shutdown handler', /process\.on\('SIGTERM', \(\) => shutdown\('SIGTERM'\)\)/.test(mainSrc) && /process\.on\('SIGINT', \(\) => shutdown\('SIGINT'\)\)/.test(mainSrc));
  A('deadline 强退面在位（api_drain_timeout + exit(0)）', mainSrc.includes("'api_drain_timeout'") && /deps\.exit\(0\)/.test(mainSrc));
  const deadlineBlock = mainSrc.match(/setTimeout\(\(\) => \{[\s\S]*?api_drain_timeout[\s\S]*?\}, deps\.timeoutMs\)/);
  A('deadline 计时器不 unref（进程生命周期被上限钉住）', deadlineBlock !== null && !deadlineBlock[0].includes('unref'));
  const pumpSrc = readFileSync(join(root, 'src/platform/sse-pump.ts'), 'utf8');
  A('R1：raw.end 保持泵内单点（end 调用恰一处）', pumpSrc.match(/reply\.raw\.end\(\)/g)?.length === 1);
  A('R1：while 条件同读 drain 旗（!draining）', /while \(!done && !closed && !draining && Date\.now\(\) < deadline\)/.test(pumpSrc));
  const regSrc = readFileSync(join(root, 'src/platform/sse-registry.ts'), 'utf8');
  A('C1：drainAll 只置旗（零 end 调用·剥注释后判）', !/\.end\(/.test(regSrc.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '')));
}

// ── 5) C4 readiness 翻脸（真 HealthController + fake HealthService；置旗段置底） ──
async function healthControllerProof() {
  console.log('--- C4 /readyz/api·/health 排水翻脸（同 handler） ---');
  const fakeHealth = { livez: () => ({ status: 'ok' }), configReady: () => true, apiReady: async () => true } as never;
  const controller = new HealthController(fakeHealth);
  const okBody = await controller.apiReady();
  assert.deepEqual(okBody, { status: 'ok', config: { envSchema: 'ok' } });
  A('未排水 readiness ok', true);
  getSseRegistry().beginDrain();   // 进程单例置排水态（本段置底：后续断言不再依赖未排水态）
  try {
    await controller.apiReady();
    A('排水期 readiness 503', false);
  } catch (e) {
    const hx = e as { getStatus?: () => number; getResponse?: () => unknown };
    A('排水期 readiness 503（/readyz/api 与 /health 同 handler 同翻）', hx.getStatus?.() === 503 && (hx.getResponse?.() as { status?: string } | undefined)?.status === 'draining');
  }
}

async function main() {
  registryUnit();
  await pumpDrainProof();
  await gateProof();
  sourceAssertions();
  await healthControllerProof();
  console.log(`\n===== ha2-drain.proof(api) PASS=${pass} FAIL=${fail} =====`);
  if (fail > 0) process.exitCode = 1;
}

await main();
