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
 *  W5. 源级臂（#92 残面 N5）：三 e2e runner 脚本 worker 就绪探测 40×1s 有界重试环在源
 *      （for 上限 40 字面+sleep(1000)+/readyz/worker 同现）+ 单发形词面零命中。
 */
import { createServer as createNetServer } from 'node:net';
import { readFileSync } from 'node:fs';
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

  // W5. 源级臂（#92 残面 N5）：登记原文点名的三 e2e runner 脚本，worker 就绪探测必须有界
  //     重试环（40×1s，与 api livez 同形——首拍门生效后启动窗内 /readyz/worker 恒 503，
  //     单发探测命中启动窗会假红 worker_not_ready）。逐脚本断言：重试环形在源（for 上限 40
  //     字面 + sleep(1000) + /readyz/worker 同现）+ 单发形词面零命中（.then((r) => r.ok)）。
  const retryLoopShape = (src: string): boolean =>
    /for \(let i = 0; i < 40 && !workerReady; i\+\+\)/.test(src)
    && src.includes('await sleep(1000);')
    && src.includes('/readyz/worker')
    && src.includes('i < 40');
  const noSingleShotShape = (src: string): boolean => !src.includes('.then((r) => r.ok)');
  const scriptSrc = (rel: string): string => readFileSync(new URL(rel, import.meta.url), 'utf8');
  const runE2e = scriptSrc('../../../scripts/run-e2e.mjs');
  const runE2eUi = scriptSrc('../../../scripts/run-e2e-ui.mjs');
  const runPerfE2e = scriptSrc('../../../scripts/run-performance-e2e.mjs');
  A('W5a run-e2e.mjs 源级：40×1s 重试环在源（for 上限 40 字面+sleep(1000)+/readyz/worker 同现）且单发形词面零命中',
    retryLoopShape(runE2e) && noSingleShotShape(runE2e));
  A('W5b run-e2e-ui.mjs 源级：40×1s 重试环在源（for 上限 40 字面+sleep(1000)+/readyz/worker 同现）且单发形词面零命中',
    retryLoopShape(runE2eUi) && noSingleShotShape(runE2eUi));
  A('W5c run-performance-e2e.mjs 源级：40×1s 重试环在源（for 上限 40 字面+sleep(1000)+/readyz/worker 同现）且单发形词面零命中',
    retryLoopShape(runPerfE2e) && noSingleShotShape(runPerfE2e));

  // ── #157 分域 ready 臂组（P1-P3·判别臂 P2 改前红=新端点改前 404） ────────────
  // P1 缺省（未注入 privacyReady）→ 200 ready：fail-open 形制沿 ragReady（`?? true`）——
  // privacy 域后台 sweep 系 best-effort 观测面非流量闸，缺省不拉闸。
  await startMetrics();
  const p1 = await getReadyz('/readyz/privacy');
  A('P1 /readyz/privacy 缺省（未注入 privacyReady）→ 200 ready（fail-open 形制沿 ragReady·域观测面非流量闸）',
    p1.status === 200 && p1.body.trim() === 'ready');
  await stopMetrics();

  // P2 分域解耦直证：同注入 privacyReady()=false + workerReady()=true——privacy 503
  // degraded 而 worker 200 ready（privacy 红不拖 worker 绿）；改前无该端点=404=判别臂改前红。
  await startMetrics({ privacyReady: () => false, workerReady: () => true });
  const p2privacy = await getReadyz('/readyz/privacy');
  const p2worker = await getReadyz('/readyz/worker');
  A('P2 分域解耦直证：privacyReady()=false → /readyz/privacy 503 degraded 且 workerReady()=true → /readyz/worker 200 ready（privacy 红不拖 worker 绿·改前端点不存在=判别红）',
    p2privacy.status === 503 && p2privacy.body.trim() === 'degraded' && p2worker.status === 200 && p2worker.body.trim() === 'ready');
  await stopMetrics();

  // P3 源级防回焊臂：main.ts workerReady 组合零两 privacy loop ready 耦合词面（AND 链
  // 摘除不回焊）+ privacyReady 组合在源（两 loop 域内收口）。
  const mainSrc = readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8');
  const workerReadySpan = mainSrc.slice(mainSrc.indexOf('workerReady: () =>'), mainSrc.indexOf('privacyReady:'));
  const privacyReadySpan = mainSrc.slice(mainSrc.indexOf('privacyReady:'));
  A('P3 源级防回焊：main.ts workerReady 组合零 privacy loop ready 耦合词面（AND 链摘除）+privacyReady 组合在源（两 loop 域内收口）',
    workerReadySpan.length > 0 && !workerReadySpan.includes('privacyErasureLoop') && !workerReadySpan.includes('vectorPlaneErasureLoop')
    && privacyReadySpan.includes('privacyErasureLoop?.ready()') && privacyReadySpan.includes('vectorPlaneErasureLoop?.ready()'));

  console.log(fail === 0
    ? `\n✓ obs-ready worker prove: ${pass} assertions 全绿 · est live=0 · releaseEvidence=false`
    : `\n✗ obs-ready worker prove: ${fail}/${pass} 失败`);
  process.exit(fail === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
