/**
 * 审计 #92「readiness 深化刀」worker 侧 prove（纯进程内/本机回环 · 零 DB · 零外呼 · est live=0）。
 * pnpm -C apps/worker prove:obs-ready
 *
 * 覆盖面（REQUEST §prove worker 部分）：
 *  W1. startMetricsExposition() **未注入** workerReady 回调 → /readyz/worker 503 unready
 *      （审计原文「缺省 fail-open」：#92 前 `?? true` 恒 200；改后缺省 fail-closed）。
 *  W2. 注入 false → 503；注入 true → 200 ready（谓词通路仍有效）。
 *  W3. 启动窗端到端：gated drain-loop（首拍挂起未成功）作为 workerReady → 503；
 *      释放首拍成功后 → 200（「ready() 未成功前不就绪」全链）。
 *  W4. ragReady 缺省保持 #92 前语义（本刀只动 workerReady，钉住不漂移）。
 */
import { createServer as createNetServer } from 'node:net';
import type { Server } from 'node:http';
import { startMetricsExposition } from '../src/main.ts';
import { runDrainLoop } from '../src/drain-loop.ts';

let pass = 0;
let fail = 0;
const A = (name: string, cond: boolean) => { pass++; if (!cond) { fail++; console.log(`FAIL  ${name}`); } else console.log(`PASS  ${name}`); };
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** 取一个当前空闲的本机回环端口（WORKER_METRICS_PORT 不支持 0=ephemeral，故先探测再显式指派）。 */
async function freePort(): Promise<number> {
  const probe = createNetServer();
  await new Promise<void>((resolve) => probe.listen(0, '127.0.0.1', resolve));
  const port = (probe.address() as { port: number }).port;
  await new Promise<void>((resolve) => probe.close(() => resolve()));
  return port;
}

async function getReadyz(path: string, attempts = 40): Promise<{ status: number; body: string }> {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}${path}`);
      return { status: res.status, body: await res.text() };
    } catch { await sleep(25); }                                     // listen 尚未就绪 → 退避重试
  }
  throw new Error('metrics_server_never_accepted');
}

let port = 0;
let server: Server | undefined;
async function startMetrics(options?: Parameters<typeof startMetricsExposition>[0]): Promise<void> {
  port = await freePort();
  process.env.WORKER_METRICS_PORT = String(port);
  process.env.WORKER_METRICS_HOST = '127.0.0.1';
  server = startMetricsExposition(options);
}

async function stopMetrics(): Promise<void> {
  await new Promise<void>((resolve) => server?.close(() => resolve()));
  server = undefined;
}

async function main() {
  // W1. 缺省（无回调）→ fail-closed。
  await startMetrics();
  const w1 = await getReadyz('/readyz/worker');
  A('W1 未注入 workerReady 回调 → /readyz/worker 503 unready（缺省 fail-closed，#92 前 fail-open 恒 200）',
    w1.status === 503 && w1.body.trim() === 'unready');
  const w1rag = await getReadyz('/readyz/rag');
  A('W1b ragReady 缺省保持原语义（本刀只动 workerReady）', w1rag.status === 200 && w1rag.body.trim() === 'ready');
  await stopMetrics();

  // W2. 谓词通路：false → 503，true → 200。
  await startMetrics({ workerReady: () => false });
  const w2down = await getReadyz('/readyz/worker');
  A('W2a workerReady()=false → 503 unready', w2down.status === 503 && w2down.body.trim() === 'unready');
  await stopMetrics();
  await startMetrics({ workerReady: () => true });
  const w2up = await getReadyz('/readyz/worker');
  A('W2b workerReady()=true → 200 ready', w2up.status === 200 && w2up.body.trim() === 'ready');
  await stopMetrics();

  // W3. 启动窗端到端：真实 drain-loop 首拍挂起（零次成功）作谓词 → 503；首拍成功 → 200。
  let gatedTicks = 0;
  let releaseGated!: () => void;
  const gatedFirstTick = new Promise<void>((resolve) => { releaseGated = resolve; });
  const gated = runDrainLoop(async () => { gatedTicks++; await gatedFirstTick; }, 1_000);
  await startMetrics({ workerReady: () => gated.ready() });
  const w3startup = await getReadyz('/readyz/worker');
  A('W3a 启动窗（首拍在飞未成功）→ /readyz/worker 503（ready() 未成功前不就绪）',
    gatedTicks === 1 && w3startup.status === 503 && w3startup.body.trim() === 'unready');
  releaseGated();
  await sleep(10);
  const w3ready = await getReadyz('/readyz/worker');
  A('W3b 首拍成功后 → /readyz/worker 200 ready', gated.ready() && w3ready.status === 200 && w3ready.body.trim() === 'ready');
  await stopMetrics();
  await gated.stop();

  console.log(fail === 0
    ? `\n✓ obs-ready worker prove: ${pass} assertions 全绿 · est live=0 · releaseEvidence=false`
    : `\n✗ obs-ready worker prove: ${fail}/${pass} 失败`);
  process.exit(fail === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
