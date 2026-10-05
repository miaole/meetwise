/**
 * GAP-PRINCIPAL-POOL-NO-ERROR-LISTENER — pool 'error' listener proof（产品修复刀 · Line P）
 *
 * 修复（dual 裁决候选 B）：`createPool()` 工厂为每个池挂 `'error'` 监听 =
 * error 级脱敏结构化日志（`db_pool_error`）+ `pool_error_total` 计数（维度仅 pool 用途）。
 *
 * 断言口径（pre-exec dual C-6 / mw-privacy-int C-6：fail-closed，缺一不可）：
 *   1. 进程不崩          —— 注入 pool error 后本进程存活到断言行（无监听时首次 idle client
 *                           断开即 uncaughtException，本 proof 根本走不到后续行）。
 *   2. 错误被观测        —— 计数增量 + `db_pool_error` 结构化日志行（stderr）双通道。
 *   3. 脱敏             —— 日志行仅 {event,purpose,count,error_name,error_message} 五键，
 *                           Ban connectionString / 凭据 / SQL / principal / 租户维度。
 *   4. 池后续可用        —— 坏 client 被池丢弃后新连接正常。
 *   5. 请求路径错误语义不变 —— 活跃 client 连接断仍 reject 到调用方（不吞错、不伪装成功）。
 *
 * 注入手段：**客户端侧** `connection.stream.destroy()`（与 FI-1 服务端 terminate 走同一
 * pg Client 'error' → pool.emit('error') 发射路径），对 DB 零破坏性 SQL（无
 * pg_terminate_backend / 无锁）→ 不需要隔离壳 attestation，可在任意显式配置的测试 PG 上运行。
 *
 * 目标来源：与其他 db proof 同口径（DATABASE_URL 或完整 PG 组件，无 localhost 默认回退）。
 * releaseEvidence=false · 本 proof ≠ UC-E2E-004 covered ≠ A3 closed · STOP
 */
import { createPool, readPoolErrorTotal } from '../src/principal.ts';
import type { PoolClient } from 'pg';

let failures = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const PURPOSE = 'pool-error-proof';

/** Poll until the counter advances past `before`; returns the new value or null on timeout. */
async function waitForCounter(before: number, timeoutMs = 8000): Promise<number | null> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const now = readPoolErrorTotal(PURPOSE);
    if (now > before) return now;
    await sleep(100);
  }
  return readPoolErrorTotal(PURPOSE) > before ? readPoolErrorTotal(PURPOSE) : null;
}

function socketOf(client: PoolClient): any {
  return (client as unknown as { connection?: { stream?: import('node:net').Socket } }).connection?.stream;
}

// 环境收集（脱敏断言的负样本：凭据不得出现在日志行）。
const secrets = [process.env.DATABASE_URL, process.env.PGPASSWORD]
  .filter((v): v is string => typeof v === 'string' && v.length > 0);
try {
  if (process.env.DATABASE_URL) secrets.push(new URL(process.env.DATABASE_URL).password);
} catch { /* not a URL */ }
const realSecrets = secrets.filter((s) => s.length >= 4);

console.log('GAP-PRINCIPAL-POOL-NO-ERROR-LISTENER pool error listener proof · releaseEvidence=false · Not HA');
console.log('NOTE: 非破坏性注入（客户端侧 socket 断开，同 pool error 发射路径）· 本绿 ≠ 行翻转（nail 前 backlog :355 stays OPEN）');

// 0) purpose 标签校验（log-injection 守卫）：非法标签 fail-closed，在触碰任何连接配置前拒绝。
{
  let code = '';
  try { createPool({ purpose: 'Bad Label!' }); } catch (e) { code = (e as Error).message; }
  A('POOL-PURPOSE-INVALID-REJECTED', code === 'database_config_invalid:database_pool_purpose_invalid');
}

const pool = createPool({ purpose: PURPOSE, max: 3 });
const baseline = readPoolErrorTotal(PURPOSE);
const baselineDefault = readPoolErrorTotal('default');

// 结构化日志捕获（console.error → stderr；prove/ops 侧即 child stderr 通道）。
const errorLogLines: string[] = [];
const realConsoleError = console.error;
console.error = (...args: unknown[]) => {
  for (const a of args) if (typeof a === 'string' && a.includes('db_pool_error')) errorLogLines.push(a);
  realConsoleError(...args);
};

try {
  // 1) idle client 断开（无监听时 = C'' FI-1 同款 uncaughtException 崩溃点）。
  const idle = await pool.connect();
  await idle.query('SELECT 1');
  idle.release();
  const beforeIdle = readPoolErrorTotal(PURPOSE);
  socketOf(idle)?.destroy();
  const afterIdle = await waitForCounter(beforeIdle);
  // 1a 进程不崩：走到本行 = 上述 pool error 未升级为 uncaughtException（无监听时本行不可达）。
  A('POOL-ERROR-PROCESS-SURVIVES-IDLE-BREAK', true);
  // 1b 错误被观测（计数通道）。
  A('POOL-ERROR-OBSERVED-COUNTER', afterIdle !== null);
  // 1c 错误被观测（结构化日志通道）。
  const idleLog = errorLogLines.find((l) => l.includes(`"purpose":"${PURPOSE}"`));
  A('POOL-ERROR-OBSERVED-LOG', typeof idleLog === 'string');

  // 2) 脱敏：仅五键，无 connectionString/凭据泄漏。
  if (idleLog !== undefined) {
    let keys: string[] = [];
    let parsed: any;
    try { parsed = JSON.parse(idleLog); keys = Object.keys(parsed).sort(); } catch { /* handled below */ }
    A('POOL-ERROR-LOG-FIVE-KEYS-ONLY',
      keys.length === 5 && keys.join(',') === 'count,error_message,error_name,event,purpose');
    A('POOL-ERROR-LOG-NO-SECRETS',
      realSecrets.every((s) => !idleLog.includes(s)) && !idleLog.includes('postgresql://'));
    A('POOL-ERROR-LOG-PG-MESSAGE-RECORDED',
      typeof parsed?.error_message === 'string' && parsed.error_message.length > 0
        && typeof parsed?.error_name === 'string');
    console.log(`OBSERVED ${idleLog.slice(0, 300)}`);
  }

  // 3) 维度隔离：仅 purpose 维度变化；其他标签计数不受影响。
  A('POOL-ERROR-COUNTER-DIMENSION-ISOLATED',
    readPoolErrorTotal('default') === baselineDefault
      && readPoolErrorTotal(PURPOSE) > baseline);

  // 4) 池后续可用：坏 client 已被池丢弃，新连接正常服务。
  const reused = await pool.query('SELECT 1 AS ok');
  A('POOL-ERROR-POOL-STILL-USABLE', reused.rows[0]?.ok === 1);

  // 5) 请求路径错误语义不变：活跃 client 断开 → 该查询仍 reject 到调用方（不吞错）。
  const active = await pool.connect();
  const pending = active.query('SELECT pg_sleep(10)');
  const beforeActive = readPoolErrorTotal(PURPOSE);
  socketOf(active)?.destroy();
  let rejected = false;
  let rejectionMessage = '';
  try { await pending; } catch (e) { rejected = true; rejectionMessage = String((e as Error).message); }
  A('POOL-ERROR-ACTIVE-QUERY-STILL-REJECTS', rejected && /terminated|reset|closed|error/i.test(rejectionMessage));
  A('POOL-ERROR-OBSERVED-COUNTER-ACTIVE-BREAK', await waitForCounter(beforeActive) !== null);
  try { active.release(); } catch { /* broken client may already be discarded by the pool */ }
} finally {
  console.error = realConsoleError;
  await pool.end().catch(() => undefined);
}

console.log(`ATTEMPTS_LEDGER induced_breaks=2 one_shot=true retry_to_green=false destructive_sql=none counter=${PURPOSE}:${readPoolErrorTotal(PURPOSE)} default:${readPoolErrorTotal('default')}`);
console.log(`CMD=pnpm -C packages/db exec tsx test/pool-error-listener.proof.ts EXIT=${failures === 0 ? 0 : 1}`);
process.exit(failures === 0 ? 0 : 1);
