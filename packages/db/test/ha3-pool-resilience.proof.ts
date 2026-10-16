/**
 * HA-3 / R-22 · A1 pool-parameter effectiveness + A2 purpose-gate dynamic face
 * + A4 render-face text (injection-style, zero real IO).
 *
 * A1 assertion face per REQUEST rev2 §4-A.1: Client-construction config as
 * consumed at pg@8.22.0 client.js:95-96 (`c.keepAlive || false`,
 * `c.keepAliveInitialDelayMillis || 0`) read back through `pool.options`
 * (pg-pool index.js:69 `this.options = Object.assign({}, options)`), and the
 * driver query_timeout consumption path client.js:660.  The
 * ConnectionParameters mapping face (keepalives/keepalives_idle,
 * connection-parameters.js:133-139) is BANNED as an assertion target (idle is
 * integer-seconds — a mapping-derived assertion falls through).
 *
 * Run: pnpm -C packages/db prove:ha3-pool-resilience
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { createPool, readRegisteredPoolPurposes, readPoolErrorTotal, renderPoolErrorsTotalLines } from '../src/index.ts';

const KEYS = ['DATABASE_URL', 'NODE_ENV', 'PGPOOL_MAX', 'PG_STATEMENT_TIMEOUT_MS', 'PG_IDLE_TX_TIMEOUT_MS', 'PG_CONN_TIMEOUT_MS', 'PG_IDLE_TIMEOUT_MS', 'PG_KEEPALIVE_INITIAL_DELAY_MS', 'PG_QUERY_TIMEOUT_MS'] as const;
const original = new Map(KEYS.map((key) => [key, process.env[key]]));
let failures = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };

function reset(values: Partial<Record<(typeof KEYS)[number], string>> = {}): void {
  for (const key of KEYS) {
    const value = values[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}

const pools: Array<{ end: () => Promise<void> }> = [];
const track = <T extends { end: () => Promise<void> }>(pool: T): T => { pools.push(pool); return pool; };

try {
  // ---- A1 · preface: no pool registered yet → renderer emits nothing ----
  A('A4 前置·零注册进程渲染为空串（零行零伪序列）', renderPoolErrorsTotalLines() === '');

  // ---- A1 · pg@8.22.0 driver source anchors (effective path, read live) ----
  const require = createRequire(import.meta.url);
  const clientJs = require.resolve('pg/lib/client.js');
  const clientLines = readFileSync(clientJs, 'utf8').split('\n');
  const l95 = clientLines[94] ?? '';
  const l96 = clientLines[95] ?? '';
  const l660 = clientLines[659] ?? '';
  A('A1 源码锚·pg client.js:95 keepAlive 默认 false（消费面）', l95.includes('keepAlive: c.keepAlive || false'));
  A('A1 源码锚·pg client.js:96 keepAliveInitialDelayMillis 默认 0（消费面）', l96.includes('keepAliveInitialDelayMillis: c.keepAliveInitialDelayMillis || 0'));
  A('A1 源码锚·pg client.js:660 query_timeout 消费路径', l660.includes('config.query_timeout || this.connectionParameters.query_timeout'));

  // ---- A1 · defaults pinned through pool.options (explicit env absent) ----
  reset({ DATABASE_URL: 'postgresql://app:pw@db.internal:5432/meetwise' });
  const pool = track(createPool({ purpose: 'proof-defaults' }));
  const o = (pool as unknown as { options: Record<string, unknown> }).options;
  A('A1 keepAlive===true 直钉', o.keepAlive === true);
  A('A1 keepAliveInitialDelayMillis 默认 10000', o.keepAliveInitialDelayMillis === 10000);
  A('A1 query_timeout 默认 15000（driver 级）', o.query_timeout === 15000);
  A('A1 已落四参零改·statement_timeout 15000', o.statement_timeout === 15000);
  A('A1 已落四参零改·idle_in_transaction_session_timeout 15000', o.idle_in_transaction_session_timeout === 15000);
  A('A1 已落四参零改·connectionTimeoutMillis 5000', o.connectionTimeoutMillis === 5000);
  A('A1 已落四参零改·idleTimeoutMillis 30000', o.idleTimeoutMillis === 30000);
  A('A1 已落四参零改·max 默认 20', o.max === 20);

  // ---- A1 · env override path, same assertion face ----
  reset({ DATABASE_URL: 'postgresql://app:pw@db.internal:5432/meetwise', PG_KEEPALIVE_INITIAL_DELAY_MS: '2500', PG_QUERY_TIMEOUT_MS: '3000', PG_CONN_TIMEOUT_MS: '4000' });
  const pool2 = track(createPool({ purpose: 'proof-env-override' }));
  const o2 = (pool2 as unknown as { options: Record<string, unknown> }).options;
  A('A1 env 覆写·PG_KEEPALIVE_INITIAL_DELAY_MS=2500 生效', o2.keepAliveInitialDelayMillis === 2500);
  A('A1 env 覆写·PG_QUERY_TIMEOUT_MS=3000 生效', o2.query_timeout === 3000);
  A('A1 env 覆写不外溢·keepAlive 恒 true（无 PG_KEEPALIVE 关闭通道）', o2.keepAlive === true);
  A('A1 env 覆写·既有 PG_CONN_TIMEOUT_MS 通道不回归', o2.connectionTimeoutMillis === 4000);

  // ---- A2 · purpose gate: invalid label rejected (principal.ts:907) ----
  reset({ DATABASE_URL: 'postgresql://app:pw@db.internal:5432/meetwise' });
  let rejected = '';
  try { track(createPool({ purpose: 'BAD LABEL!' })); } catch (error) { rejected = String((error as Error).message); }
  A('A2 非法标签拒 database_pool_purpose_invalid', rejected.includes('database_pool_purpose_invalid'));

  // ---- A2 · registration: order + dedupe across the four proof labels ----
  const registered = readRegisteredPoolPurposes();
  A('A2 注册序·proof-defaults 先于 proof-env-override（创建序）',
    registered.indexOf('proof-defaults') >= 0 && registered.indexOf('proof-defaults') < registered.indexOf('proof-env-override'));
  track(createPool({ purpose: 'proof-defaults' }));
  A('A2 注册去重·同 purpose 二次创建不重复登记',
    readRegisteredPoolPurposes().filter((p) => p === 'proof-defaults').length === 1);

  // ---- A4 · render face: 0-prefilled series + counter increments ----
  const before = renderPoolErrorsTotalLines();
  A('A4 渲染·TYPE 行恰一',
    before.split('\n').filter((line) => line === '# TYPE meetwise_db_pool_errors_total counter').length === 1);
  A('A4 渲染·proof-defaults 0 值预注册行在', before.includes('meetwise_db_pool_errors_total{purpose="proof-defaults"} 0'));
  A('A4 渲染·proof-env-override 0 值预注册行在', before.includes('meetwise_db_pool_errors_total{purpose="proof-env-override"} 0'));

  const poolA = (pool as unknown as { emit: (event: string, error: Error) => boolean });
  const err1 = new Error('Connection terminated unexpectedly');
  const err2 = new Error('Connection terminated unexpectedly');
  poolA.emit('error', err1);
  poolA.emit('error', err2);
  poolA.emit('error', err1); // same error object re-emitted → WeakSet dedupe → exactly once
  A('A4 计数·两次断连注入计 2（同一 error 对象重发去重=恰一次）', readPoolErrorTotal('proof-defaults') === 2);
  A('A4 渲染·计数行随读数抬升', renderPoolErrorsTotalLines().includes('meetwise_db_pool_errors_total{purpose="proof-defaults"} 2'));
  A('A4 渲染·未受扰 purpose 恒 0', renderPoolErrorsTotalLines().includes('meetwise_db_pool_errors_total{purpose="proof-env-override"} 0'));
  A('A4 渲染·行只含 purpose 标签维度（无连接串/凭据/SQL 字样）',
    !renderPoolErrorsTotalLines().match(/postgresql|password|SELECT/i));

  // ---- A1-live · client storage face (sandbox-authorized only) ----
  // HA3_LIVE_PG_URL set ⇒ a real connection is made and the pg@8.22.0
  // connection.js:24-25 storage face (`client.connection._keepAlive`,
  // `_keepAliveInitialDelayMillis`) is asserted; :47-48
  // `stream.setKeepAlive(true, …)` is the consumption face evidenced by the
  // source anchors above.  Absent (default) ⇒ skipped, printed honestly.
  if (process.env.HA3_LIVE_PG_URL) {
    reset({ DATABASE_URL: process.env.HA3_LIVE_PG_URL });
    const live = track(createPool({ purpose: 'proof-live', max: 1 }));
    const storage: Array<{ keepAlive: unknown; initialDelay: unknown }> = [];
    (live as unknown as { on: (event: string, handler: (client: { connection: { _keepAlive: unknown; _keepAliveInitialDelayMillis: unknown } }) => void) => void })
      .on('connect', (client) => { storage.push({ keepAlive: client.connection._keepAlive, initialDelay: client.connection._keepAliveInitialDelayMillis }); });
    await live.query('SELECT 1');
    A('A1-live·真实连接 client.connection._keepAlive===true（connection.js:24 存储面）', storage.length === 1 && storage[0]!.keepAlive === true);
    A('A1-live·_keepAliveInitialDelayMillis===10000（connection.js:25 存储面）', storage.length === 1 && storage[0]!.initialDelay === 10000);
    await live.query('SELECT 1');
    A('A1-live·连接后查询成功（沙箱 PG 连通性）', storage.length === 1);
  } else {
    console.log('SKIP  A1-live（HA3_LIVE_PG_URL 未设——零真实连接运行）');
  }
} finally {
  for (const pool of pools.reverse()) await pool.end().catch(() => undefined);
  for (const key of KEYS) {
    const value = original.get(key);
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}

console.log(failures === 0 ? '\n✓ HA-3 池参数/purpose 闸/渲染面 proof 全部通过' : `\n✗ ${failures} 项失败`);
process.exit(failures === 0 ? 0 : 1);
