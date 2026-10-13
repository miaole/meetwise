/**
 * HA-2 · worker 排水上限证明（注入式确定性·无 IO，沿 drain-loop.proof.ts 形制）。
 * 覆盖 REQUEST §4 A.3（stop() 与 deadline 竞速：自然完退/deadline 裁决+在飞名）与
 * A.4（SIGTERM/SIGINT 同链注入等价 + drainStops 清单逐项断言·防再漏
 * vectorPlaneErasureLoop）。 pnpm -C apps/worker prove:ha2-drain
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { drainWithDeadline, wireSignalShutdown, type NamedStop } from '../src/drain-loop.ts';

let fail = 0;
let pass = 0;
const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); c ? pass++ : fail++; };
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ── 1) A.3 deadline race：自然完退（drained 胜出） ─────────────────────────────
async function drainedWins() {
  console.log('--- A.3 tick 自然完退：stop 先 resolve（正常排水） ---');
  let finished = 0;
  const stops: NamedStop[] = [
    { name: 'fast-loop', stop: async () => { await sleep(30); finished++; } },
    { name: 'instant-loop', stop: () => { finished++; } },
  ];
  const timeouts: string[][] = [];
  const t0 = Date.now();
  const outcome = await drainWithDeadline(stops, 2_000, (inFlight) => timeouts.push(inFlight));
  const elapsed = Date.now() - t0;
  A(`自然完退 outcome=drained（实得 ${outcome}）`, outcome === 'drained');
  A('全部 stop settle（在飞 tick 完整收尾）', finished === 2);
  A(`未触 deadline（${elapsed}ms << 2000ms 上限）`, elapsed < 2_000);
  A('onTimeout 零调用', timeouts.length === 0);
}

// ── 2) A.3 deadline race：挂死 tick（timeout 胜出·在飞名入日志） ────────────────
async function deadlineWins() {
  console.log('--- A.3 挂死 tick：deadline 裁决（fake 计时确定性读数·不真睡 30s） ---');
  let fastDone = 0;
  const stops: NamedStop[] = [
    { name: 'hang-loop', stop: () => new Promise<void>(() => {}) },          // 挂死：永不 resolve
    { name: 'fast-loop', stop: async () => { await sleep(10); fastDone++; } },
    { name: 'reject-loop', stop: async () => { await sleep(5); throw new Error('stop_rejected'); } },   // reject 不拖垮 race
  ];
  const timeouts: string[][] = [];
  const t0 = Date.now();
  const outcome = await drainWithDeadline(stops, 80, (inFlight) => timeouts.push(inFlight));
  const elapsed = Date.now() - t0;
  A(`deadline 胜出 outcome=timeout（实得 ${outcome}）`, outcome === 'timeout');
  A(`读数钉在 deadline 附近（${elapsed}ms ≈ 80ms·非真睡 30s）`, elapsed >= 80 && elapsed < 500);
  const timeoutNames = timeouts[0] ?? [];
  A(`worker_drain_timeout 在飞名单=挂死者（实得 [${timeoutNames.join(',')}]）`, timeouts.length === 1 && timeoutNames.includes('hang-loop'));
  A('已 settle 者不入在飞名单', !timeoutNames.includes('fast-loop') && !timeoutNames.includes('reject-loop'));
  A('reject 的 stop 视为已 settle（allSettled 语义）', fastDone === 1);
}

// ── 3) A.4 SIGTERM/SIGINT 同链（注入注册表断言等价） ────────────────────────────
function signalWiring() {
  console.log('--- A.4 双信号同一 handler（注入等价） ---');
  const registered: Array<{ signal: string; handler: () => void }> = [];
  let calls = 0;
  const handler = () => { calls++; };
  wireSignalShutdown(['SIGTERM', 'SIGINT'], handler, (signal, h) => registered.push({ signal, handler: h }));
  const firstReg = registered[0];
  const secondReg = registered[1];
  A('两信号各注册一次', registered.length === 2 && firstReg?.signal === 'SIGTERM' && secondReg?.signal === 'SIGINT');
  A('两信号 handler 同一引用（同链·容器 stop 与 Ctrl+C 同语义）', firstReg?.handler === secondReg?.handler && firstReg?.handler === handler);
  registered.forEach((r) => r.handler());
  A('触发任一信号等价（同一 handler 被调）', calls === 2);
}

// ── 4) A.4 清单逐项断言（main.ts drainStops 16 项·防再漏 vectorPlaneErasureLoop） ─
function drainChecklistSourceAssertions() {
  console.log('--- A.4 C5 源级清单断言（main.ts） ---');
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const src = readFileSync(join(root, 'src/main.ts'), 'utf8');
  // R3 勘误清点：15 项既有 + 补漏 vector-plane-erasure = 16；stub-tick 为 env-gated 附加项。
  const required = [
    'report', 'interview', 'quiz', 'diagnosis', 'route-classify', 'commerce',
    'model-invocation-reconcile', 'usage-calibration-reconcile', 'privacy-erasure',
    'vector-plane-erasure', 'gauge', 'rag-cache', 'privacy-pool', 'qbank-control-pool',
    'rag-control-pool', 'langfuse',
  ] as const;
  for (const name of required) {
    A(`清单项在位：${name}`, new RegExp(`\\{ name: '${name}', stop:`).test(src));
  }
  const drainBlock = src.slice(src.indexOf('const drainStops'), src.indexOf('let workerShuttingDown'));
  A(`清单实数=16 具名项 + env-gated stub-tick（条件展开·实数 ${((drainBlock.match(/\{ name: '/g) ?? []).length)}）`, (drainBlock.match(/\{ name: '/g) ?? []).length === 17 && /\.\.\.\(stubLoop \? \[\{ name: 'stub-tick'/.test(drainBlock));
  A('补漏件 vectorPlaneErasureLoop.stop 实接线（非仅字符串）', /vectorPlaneErasureLoop\?\.stop\(\) \?\? Promise\.resolve\(\)/.test(src));
  A('SIGTERM/SIGINT 同链接线（wireSignalShutdown 双信号）', /wireSignalShutdown\(\['SIGTERM', 'SIGINT'\]/.test(src));
  A('重复信号幂等闸在位（workerShuttingDown）', /if \(workerShuttingDown\) return/.test(src));
  A('WORKER_DRAIN_TIMEOUT_MS 默认 30_000（内部上限）', /boundedIntEnv\('WORKER_DRAIN_TIMEOUT_MS', 30_000, 1_000, 300_000\)/.test(src));
  A('worker_drain_timeout 结构化日志含 signal+in_flight', /worker_drain_timeout signal=\$\{signal\} in_flight=\$\{inFlight\.join\(','\)\}/.test(src));
  A('metricsServer.close() 收口带 2s 上限 race（无无界 await）', /new Promise<void>\(\(resolve\) => metricsServer\.close\(\(\) => resolve\(\)\)\)/.test(src) && /setTimeout\(resolve, 2_000\)/.test(src));
  A('终态 exit(0)（非 137）', /process\.exit\(0\)/.test(src));
  // stub 纪律（rev2-R4）：env-gated·绝不触真实模型。
  A('stub 为 env-gated（MEETWISE_HA2_STUB_TICK_MODE 未设零行为）', /process\.env\.MEETWISE_HA2_STUB_TICK_MODE\?\.trim\(\)/.test(src));
  const stubBlock = src.match(/const stubLoop =[\s\S]*?\}, 200\) : undefined;/);
  A('stub 路径零模型调用（仅挂死/PG 往返·无 .invoke(/model 引用）', stubBlock !== null && !/\.invoke\(/.test(stubBlock[0]) && !/[Mm]odel/.test(stubBlock[0]));
  A('B7 挂死形态为纯 sleep 挂起（非模型重试）', stubBlock !== null && /new Promise<void>\(\(\) => \{\}\)/.test(stubBlock[0]));
}

async function main() {
  await drainedWins();
  await deadlineWins();
  signalWiring();
  drainChecklistSourceAssertions();
  console.log(`\n===== ha2-drain.proof(worker) PASS=${pass} FAIL=${fail} =====`);
  if (fail > 0) process.exitCode = 1;
}

await main();
