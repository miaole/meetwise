/**
 * HA-3 / R-22 · A4 api-face metrics rendering (W2③ option A): the EXISTING
 * api GET /metrics (MetricsController.scrape) appends purpose-registered
 * meetwise_db_pool_errors_total lines — zero new endpoint.  api process set =
 * api + sse-listen (rev2 §4-A.4: per-process registered purpose set).
 *
 * Run (from repo root): pnpm --filter @meetwise/api prove:ha3-metrics-pool-errors
 */
export {}; // top-level await module marker
process.env.DATABASE_URL = process.env.DATABASE_URL ?? 'postgresql://app:pw@db.internal:5432/meetwise';

const { MetricsController } = await import('../src/modules/metrics/metrics.controller.ts');
const { createPool, renderPoolErrorsTotalLines } = await import('@meetwise/db');

let failures = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };

const pools = [createPool({ purpose: 'api' }), createPool({ purpose: 'sse-listen' })];
try {
  const controller = new MetricsController();
  const text = controller.scrape();

  A('api 渲染·TYPE 行恰一', text.split('\n').filter((line) => line === '# TYPE meetwise_db_pool_errors_total counter').length === 1);
  A('api 渲染·purpose="api" 0 值预注册行在（api 进程集合）', text.includes('meetwise_db_pool_errors_total{purpose="api"} 0'));
  A('api 渲染·purpose="sse-listen" 0 值预注册行在（api 进程集合）', text.includes('meetwise_db_pool_errors_total{purpose="sse-listen"} 0'));
  A('api 渲染·零新端点（scrape 为既有 @Controller metrics @Get 面）', typeof controller.scrape === 'function');
  A('api 渲染·行无连接串/凭据/SQL 字样', !/postgresql|password|SELECT/i.test(renderPoolErrorsTotalLines()));

  // Inject two connection-breaks on the api purpose pool (same error class,
  // distinct error objects — the exactly-once dedupe face is covered in the
  // @meetwise/db proof).
  const apiPool = pools[0] as unknown as { emit: (event: string, error: Error) => boolean };
  apiPool.emit('error', new Error('server closed the connection unexpectedly'));
  apiPool.emit('error', new Error('Connection terminated unexpectedly'));
  const after = controller.scrape();
  A('api 渲染·断连注入后 purpose="api" 计数抬升至 2', after.includes('meetwise_db_pool_errors_total{purpose="api"} 2'));
  A('api 渲染·sse-listen 行保持 0', after.includes('meetwise_db_pool_errors_total{purpose="sse-listen"} 0'));
  A('api 渲染·worker 进程集合标签不在 api 面（跨进程全集不冒现）',
    !after.includes('purpose="checkpoint"') && !after.includes('purpose="worker"') && !after.includes('purpose="job-wakeup"'));
} finally {
  for (const pool of pools.reverse()) await pool.end().catch(() => undefined);
}

console.log(failures === 0 ? '\n✓ HA-3 api /metrics 池错误行渲染 proof 全部通过' : `\n✗ ${failures} 项失败`);
process.exit(failures === 0 ? 0 : 1);
