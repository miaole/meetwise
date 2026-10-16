/**
 * HA-3 / R-22 · A4 worker-face metrics rendering (W2②): startMetricsExposition
 * /metrics text appends purpose-registered meetwise_db_pool_errors_total lines.
 * Worker process set = checkpoint / worker / qbank-control / job-wakeup /
 * privacy-worker / rag-control (rev2 §4-A.4: per-process registered set).
 * Injection-style: pools created but never connected (zero real IO).
 *
 * Run (from repo root): pnpm --filter @meetwise/worker prove:ha3-metrics-pool-errors
 */
export {}; // top-level await module marker
process.env.DATABASE_URL = process.env.DATABASE_URL ?? 'postgresql://app:pw@db.internal:5432/meetwise';
process.env.WORKER_METRICS_PORT = '0';
process.env.WORKER_METRICS_HOST = '127.0.0.1';

const { startMetricsExposition } = await import('../src/main.ts');
const { createPool } = await import('@meetwise/db');

let failures = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };

const WORKER_SET = ['checkpoint', 'worker', 'qbank-control', 'job-wakeup', 'privacy-worker', 'rag-control'] as const;
const pools = WORKER_SET.map((purpose) => createPool({ purpose }));
const server = startMetricsExposition();
try {
  // startMetricsExposition fires listen() without awaiting; poll until the
  // ephemeral port is bound (bounded — fail loud on timeout).
  let address = server.address();
  for (let waited = 0; (address === null || typeof address === 'string') && waited < 5000; waited += 25) {
    await new Promise((resolve) => setTimeout(resolve, 25));
    address = server.address();
  }
  if (address === null || typeof address === 'string') throw new Error('metrics server not listening');
  const text = await (await fetch(`http://127.0.0.1:${address.port}/metrics`)).text();

  A('worker 渲染·TYPE 行恰一', text.split('\n').filter((line) => line === '# TYPE meetwise_db_pool_errors_total counter').length === 1);
  for (const purpose of WORKER_SET) {
    A(`worker 渲染·purpose="${purpose}" 0 值预注册行在`, text.includes(`meetwise_db_pool_errors_total{purpose="${purpose}"} 0`));
  }
  A('worker 渲染·api 进程集合标签不在 worker 面（跨进程全集不冒现）',
    !text.includes('purpose="api"') && !text.includes('purpose="sse-listen"') && !text.includes('purpose="migrate"'));

  // Inject connection-breaks on the worker purpose pool, re-scrape, assert lift.
  const workerPool = pools[1] as unknown as { emit: (event: string, error: Error) => boolean };
  workerPool.emit('error', new Error('Connection terminated unexpectedly'));
  workerPool.emit('error', new Error('server closed the connection unexpectedly'));
  const after = await (await fetch(`http://127.0.0.1:${address.port}/metrics`)).text();
  A('worker 渲染·断连注入后 purpose="worker" 计数抬升至 2', after.includes('meetwise_db_pool_errors_total{purpose="worker"} 2'));
  A('worker 渲染·HTTP 面 text/plain version=0.0.4 形制不变',
    (await fetch(`http://127.0.0.1:${address.port}/metrics`)).headers.get('content-type') === 'text/plain; version=0.0.4');
} finally {
  await new Promise<void>((resolve) => server.close(() => resolve()));
  for (const pool of pools.reverse()) await pool.end().catch(() => undefined);
}

console.log(failures === 0 ? '\n✓ HA-3 worker /metrics 池错误行渲染 proof 全部通过' : `\n✗ ${failures} 项失败`);
process.exit(failures === 0 ? 0 : 1);
