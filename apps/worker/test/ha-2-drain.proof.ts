/**
 * HA-2 · worker 排水上限证明（注入式确定性·无 IO，沿 drain-loop.proof.ts 形制）。
 * 覆盖 REQUEST §4 A.3（stop() 与 deadline 竞速：自然完退/deadline 裁决+在飞名）与
 * A.4（SIGTERM/SIGINT 同链注入等价 + drainStops 清单逐项断言·防再漏
 * vectorPlaneErasureLoop）。两阶段排空分相断言（分相序/份额保护/逐相在飞名/退化
 * 形态/源级相位贴标）另见本卷 §5/§6。 pnpm -C apps/worker prove:ha2-drain
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
  A(`读数钉在 loop 相份额 deadline 附近（${elapsed}ms ≈ 56ms=ceil(80×0.7)·非真睡 30s）`, elapsed >= 56 && elapsed < 500);
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
  // R3 勘误清点（rev3 重钉·协调方 wave70 授权·预存漂移非本刀引入）：16 项既有（64522c62 钉时真值=17 臂绿）
  // + usage-calibration-retention（0dcc73f0 ag-cost2 接线·drainStops 16→17）+ qbank-release-sweep（b20ee350
  // qbank-control-sec 接线·drainStops 17 项）= 18 具名项——两姊妹支线各增一笔均未回钉本清单（0dcc73f0 非本线
  // b20ee350 祖先·本线 first-parent 组装点 d31be795 起真值 19 vs 钉 17）；stub-tick 为 env-gated 附加项。
  const required = [
    'report', 'interview', 'quiz', 'diagnosis', 'route-classify', 'commerce',
    'model-invocation-reconcile', 'usage-calibration-reconcile', 'usage-calibration-retention',
    'qbank-release-sweep', 'privacy-erasure',
    'vector-plane-erasure', 'gauge', 'rag-cache', 'privacy-pool', 'qbank-control-pool',
    'rag-control-pool', 'langfuse',
  ] as const;
  for (const name of required) {
    A(`清单项在位：${name}`, new RegExp(`\\{ name: '${name}', stop:`).test(src));
  }
  const drainBlock = src.slice(src.indexOf('const drainStops'), src.indexOf('let workerShuttingDown'));
  A(`清单实数=18 具名项 + env-gated stub-tick（条件展开·实数 ${((drainBlock.match(/\{ name: '/g) ?? []).length)}）`, (drainBlock.match(/\{ name: '/g) ?? []).length === 19 && /\.\.\.\(stubLoop \? \[\{ name: 'stub-tick'/.test(drainBlock));
  A('补漏件 vectorPlaneErasureLoop.stop 实接线（非仅字符串）', /vectorPlaneErasureLoop\?\.stop\(\) \?\? Promise\.resolve\(\)/.test(src));
  A('SIGTERM/SIGINT 同链接线（wireSignalShutdown 双信号）', /wireSignalShutdown\(\['SIGTERM', 'SIGINT'\]/.test(src));
  A('重复信号幂等闸在位（workerShuttingDown）', /if \(workerShuttingDown\) return/.test(src));
  A('WORKER_DRAIN_TIMEOUT_MS 默认 30_000（内部上限）', /boundedIntEnv\('WORKER_DRAIN_TIMEOUT_MS', 30_000, 1_000, 300_000\)/.test(src));
  A('worker_drain_timeout 结构化日志含 signal+phase+in_flight', /worker_drain_timeout signal=\$\{signal\} phase=\$\{phase\} in_flight=\$\{inFlight\.join\(','\)\}/.test(src));
  A('metricsServer.close() 收口带 2s 上限 race（无无界 await）', /new Promise<void>\(\(resolve\) => metricsServer\.close\(\(\) => resolve\(\)\)\)/.test(src) && /setTimeout\(resolve, 2_000\)/.test(src));
  A('终态 exit(0)（非 137）', /process\.exit\(0\)/.test(src));
  // stub 纪律（rev2-R4）：env-gated·绝不触真实模型。
  A('stub 为 env-gated（MEETWISE_HA2_STUB_TICK_MODE 未设零行为）', /process\.env\.MEETWISE_HA2_STUB_TICK_MODE\?\.trim\(\)/.test(src));
  const stubBlock = src.match(/const stubLoop =[\s\S]*?\}, 200\) : undefined;/);
  A('stub 路径零模型调用（仅挂死/PG 往返·无 .invoke(/model 引用）', stubBlock !== null && !/\.invoke\(/.test(stubBlock[0]) && !/[Mm]odel/.test(stubBlock[0]));
  A('B7 挂死形态为纯 sleep 挂起（非模型重试）', stubBlock !== null && /new Promise<void>\(\(\) => \{\}\)/.test(stubBlock[0]));
}

// ── 5) 两阶段排空分相断言（A 分相序/B 份额/C 逐相在飞名/D 退化形态） ─────────────
async function phaseDrainArms() {
  console.log('--- 两阶段排空：loop 相先行→deps 相后行（依赖相后行直证） ---');
  // A) 分相序：deps stop 起跑时点 ≥ loop 相全 settle 时点（事件序直证）。
  const events: string[] = [];
  const outcomeA = await drainWithDeadline([
    { name: 'loop-a', stop: async () => { await sleep(20); events.push('loop-a:settled'); }, phase: 'loop' },
    { name: 'loop-b', stop: () => { events.push('loop-b:settled'); }, phase: 'loop' },
    { name: 'dep-cache', stop: () => { events.push('dep-cache:started'); }, phase: 'deps' },
  ], 2_000);
  A(`分相序全 drain outcome=drained（实得 ${outcomeA}）`, outcomeA === 'drained');
  A('deps stop 起跑 ≥ loop 相全 settle（事件序：dep-cache 在双 loop settle 之后）', events.indexOf('dep-cache:started') > events.indexOf('loop-a:settled') && events.indexOf('dep-cache:started') > events.indexOf('loop-b:settled'));

  console.log('--- 份额保护：loop 相挂死→≈70% 到点·deps 相仍获余量跑完 ---');
  // B) 份额：timeoutMs=100 注入→loopShare=ceil(100×0.7)=70·depsShare=30（和恒等 100）。
  let depsSettled = 0;
  const timeoutsB: Array<{ names: string[]; phase: string }> = [];
  const t0 = Date.now();
  const outcomeB = await drainWithDeadline([
    { name: 'hang-loop', stop: () => new Promise<void>(() => {}), phase: 'loop' },
    { name: 'dep-cache', stop: async () => { await sleep(5); depsSettled++; }, phase: 'deps' },
  ], 100, (names, phase) => timeoutsB.push({ names, phase }));
  const elapsedB = Date.now() - t0;
  A(`份额臂 outcome=timeout（实得 ${outcomeB}）`, outcomeB === 'timeout');
  A(`loop 相 ≈70ms 份额到点（${elapsedB}ms ≥ 70=ceil(100×0.7)·非 100ms 全额即断）`, elapsedB >= 70 && elapsedB < 500);
  A('deps 相后行仍获余量跑完（settle 计数=1·份额保护直证）', depsSettled === 1);

  console.log('--- 逐相在飞名：onTimeout 第二参 phase 逐相正确 ---');
  // C) 逐相在飞名：各相超时各自报·相位标签逐一正确。
  const callsC: Array<{ names: string[]; phase: string }> = [];
  const outcomeC1 = await drainWithDeadline([
    { name: 'hang-loop-a', stop: () => new Promise<void>(() => {}), phase: 'loop' },
    { name: 'hang-loop-b', stop: () => new Promise<void>(() => {}), phase: 'loop' },
  ], 60, (names, phase) => callsC.push({ names, phase }));
  A(`loop 相挂死 outcome=timeout（实得 ${outcomeC1}）`, outcomeC1 === 'timeout');
  A(`onTimeout(names,'loop') 收 loop 相在飞名（实得 [${callsC[0]?.names.join(',')}]·相位=${callsC[0]?.phase}）`, callsC.length === 1 && callsC[0]?.phase === 'loop' && callsC[0]?.names.includes('hang-loop-a') && callsC[0]?.names.includes('hang-loop-b'));
  callsC.length = 0;
  const outcomeC2 = await drainWithDeadline([
    { name: 'quick-loop', stop: () => {}, phase: 'loop' },
    { name: 'hang-dep', stop: () => new Promise<void>(() => {}), phase: 'deps' },
  ], 60, (names, phase) => callsC.push({ names, phase }));
  A(`loop 相 drained→deps 相挂死 outcome=timeout（实得 ${outcomeC2}）`, outcomeC2 === 'timeout');
  A(`onTimeout(names,'deps') 收 deps 相在飞名（实得 [${callsC[0]?.names.join(',')}]·相位=${callsC[0]?.phase}）`, callsC.length === 1 && callsC[0]?.phase === 'deps' && callsC[0]?.names.includes('hang-dep') && !callsC[0]?.names.includes('quick-loop'));

  console.log('--- 退化形态：全 loop 相集·deps 空（语义与今日恒等） ---');
  // D) 退化形态：全 loop 相集（含缺省无标项）·deps 空=allSettled(空)即 drained。
  //    双审落字：本臂断言只钉 outcome/在飞名/相位语义面，时序窗显式豁免（不钉墙钟——
  //    两相化后总读数由两相份额调度决定，属机制内已知取舍）。
  const callsD: Array<{ names: string[]; phase: string }> = [];
  const outcomeD = await drainWithDeadline([
    { name: 'hang-default', stop: () => new Promise<void>(() => {}) },   // 缺省 phase=loop
    { name: 'quick-default', stop: () => {} },
  ], 60, (names, phase) => callsD.push({ names, phase }));
  A(`退化形态 outcome=timeout（语义与今日恒等·时序窗显式豁免不钉墙钟）`, outcomeD === 'timeout');
  A(`缺省无标项入 loop 相（在飞名=[${callsD[0]?.names.join(',')}]·相位=${callsD[0]?.phase}·时序窗豁免）`, callsD.length === 1 && callsD[0]?.phase === 'loop' && callsD[0]?.names.includes('hang-default') && !callsD[0]?.names.includes('quick-default'));
  const outcomeD2 = await drainWithDeadline([{ name: 'only-loop', stop: () => {} }], 2_000);
  A('空 deps 相 allSettled(空)即 drained（零行为漂移·零拖尾）', outcomeD2 === 'drained');
}

// ── 6) 源级两相化断言（E·相位贴标/份额恒等式/日志相位要素落源） ──────────────────
function phaseSourceAssertions() {
  console.log('--- E 源级两相化断言（main.ts + drain-loop.ts） ---');
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const src = readFileSync(join(root, 'src/main.ts'), 'utf8');
  const loopSrc = readFileSync(join(root, 'src/drain-loop.ts'), 'utf8');
  const depsLabels = (src.match(/phase: 'deps'/g) ?? []).length;
  const loopLabels = (src.match(/phase: 'loop'/g) ?? []).length;
  A(`main.ts 相位贴标 deps 相恰 5 处（实得 ${depsLabels}）`, depsLabels === 5);
  A(`main.ts 相位贴标 loop 相恰 14 处（实得 ${loopLabels}）`, loopLabels === 14);
  A('drain-loop.ts 份额常量 0.7 具名落源（机检可锚）', /LOOP_PHASE_SHARE = 0\.7/.test(loopSrc));
  A('drain-loop.ts 两相份额和恒等式在源（depsShare = timeoutMs - loopShare）', /depsShare = timeoutMs - loopShare/.test(loopSrc));
  A('main.ts 超时日志行含 phase= 相位要素', /worker_drain_timeout signal=\$\{signal\} phase=\$\{phase\}/.test(src));
}

async function main() {
  await drainedWins();
  await deadlineWins();
  signalWiring();
  await phaseDrainArms();
  drainChecklistSourceAssertions();
  phaseSourceAssertions();
  console.log(`\n===== ha2-drain.proof(worker) PASS=${pass} FAIL=${fail} =====`);
  if (fail > 0) process.exitCode = 1;
}

await main();
