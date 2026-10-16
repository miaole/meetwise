/**
 * HA-3 / R-22 · A3 migrate connect-layer retry classification (injection-style,
 * fake op/clock/sleep — zero real IO, zero DDL).
 *
 * Boundary (REQUEST §1-W3): retry covers ONLY connect-level faults
 * (ECONNREFUSED/ETIMEDOUT/ECONNRESET/57P01/53300 + pg connection-teardown
 * family).  runMigrations internals (advisory lock/transactions/checksum/DDL)
 * are never wrapped — asserted structurally in
 * test/ha3-purpose-census.proof.ts (runMigrations call sits outside any
 * withConnectRetry in migrate-cli.ts) and here by the fatal-classifier table.
 *
 * Run: pnpm -C packages/db prove:ha3-migrate-connect-retry
 */
import { classifyConnectError, withConnectRetry } from '../src/index.ts';

const ENV_KEYS = ['MIGRATE_CONNECT_RETRY_BASE_MS', 'MIGRATE_CONNECT_BUDGET_MS'] as const;
const original = new Map(ENV_KEYS.map((key) => [key, process.env[key]]));
let failures = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };

function reset(values: Partial<Record<(typeof ENV_KEYS)[number], string>> = {}): void {
  for (const key of ENV_KEYS) {
    const value = values[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}

try {
  // ---- classification table (A3 error-classifier face) ----
  A('分类·ECONNREFUSED → connect', classifyConnectError({ code: 'ECONNREFUSED', message: 'connect ECONNREFUSED 127.0.0.1:5432' }) === 'connect');
  A('分类·ETIMEDOUT → connect', classifyConnectError({ code: 'ETIMEDOUT', message: 'connect ETIMEDOUT' }) === 'connect');
  A('分类·ECONNRESET → connect', classifyConnectError({ code: 'ECONNRESET', message: 'read ECONNRESET' }) === 'connect');
  A('分类·57P01 admin_shutdown → connect', classifyConnectError({ code: '57P01', message: 'terminating connection due to administrator command' }) === 'connect');
  A('分类·53300 too_many_connections → connect', classifyConnectError({ code: '53300', message: 'sorry, too many clients already' }) === 'connect');
  A('分类·pg teardown message 族 → connect', classifyConnectError(new Error('Connection terminated unexpectedly')) === 'connect'
    && classifyConnectError(new Error('server closed the connection unexpectedly')) === 'connect');
  A('分类·DDL 42601 → fatal（零重试类）', classifyConnectError({ code: '42601', message: 'syntax error at or near' }) === 'fatal');
  A('分类·checksum 漂移类普通 Error → fatal', classifyConnectError(new Error('migration checksum mismatch')) === 'fatal');
  A('分类·唯一冲突 23505 → fatal', classifyConnectError({ code: '23505', message: 'duplicate key' }) === 'fatal');
  A('分类·非 Error 值 → fatal', classifyConnectError('boom') === 'fatal');

  // ---- retry behaviour: backoff then success within budget (fake clock) ----
  reset({ MIGRATE_CONNECT_RETRY_BASE_MS: '1000', MIGRATE_CONNECT_BUDGET_MS: '30000' });
  let now = 1000;
  const sleeps: number[] = [];
  const logs: string[] = [];
  let attempts = 0;
  const result = await withConnectRetry(async () => {
    attempts += 1;
    if (attempts < 3) throw Object.assign(new Error('connect ECONNREFUSED 127.0.0.1:5432'), { code: 'ECONNREFUSED' });
    return 'applied';
  }, {
    now: () => now,
    sleep: async (ms) => { sleeps.push(ms); now += ms; },
    log: (line) => logs.push(line),
  });
  A('重试·连接级两败后第三次于预算内成功', result === 'applied' && attempts === 3);
  A('重试·指数退避序列 [1000,2000]（base 1s）', JSON.stringify(sleeps) === '[1000,2000]');
  A('重试·重试日志含 attempt 序号与错误分类', logs.length === 2
    && logs[0]!.includes('attempt=1') && logs[0]!.includes('class=connect')
    && logs[1]!.includes('attempt=2') && logs[1]!.includes('class=connect'));

  // ---- fatal error: zero retry, immediate rethrow ----
  reset({});
  let fatalAttempts = 0;
  const fatalSleeps: number[] = [];
  let fatalThrew = false;
  try {
    await withConnectRetry(async () => {
      fatalAttempts += 1;
      throw Object.assign(new Error('syntax error at or near "DROP"'), { code: '42601' });
    }, { now: () => 0, sleep: async (ms) => { fatalSleeps.push(ms); }, log: () => {} });
  } catch { fatalThrew = true; }
  A('DDL/事务类·零重试立即抛（attempts=1·零 sleep）', fatalThrew && fatalAttempts === 1 && fatalSleeps.length === 0);

  // ---- budget exhaustion: bounded attempts, then rethrow (fail-loud) ----
  reset({ MIGRATE_CONNECT_RETRY_BASE_MS: '1000', MIGRATE_CONNECT_BUDGET_MS: '5000' });
  now = 0;
  const budgetSleeps: number[] = [];
  const budgetLogs: string[] = [];
  let budgetAttempts = 0;
  let budgetThrew = false;
  try {
    await withConnectRetry(async () => {
      budgetAttempts += 1;
      throw Object.assign(new Error('connect ETIMEDOUT'), { code: 'ETIMEDOUT' });
    }, {
      now: () => now,
      sleep: async (ms) => { budgetSleeps.push(ms); now += ms; },
      log: (line) => budgetLogs.push(line),
    });
  } catch { budgetThrew = true; }
  // timeline: attempt@0 fail → sleep1000 → attempt@1000 fail → sleep2000 →
  // attempt@3000 fail → sleep2000(clamped to budget) → attempt@5000 = deadline → rethrow
  A('超预算·exit 1 fail-loud 语义（错误原样上抛）', budgetThrew);
  A('超预算·attempt 有界（≤5 次）', budgetAttempts <= 5);
  A('超预算·预算耗尽账目行在（budget_exhausted+attempts 数）',
    budgetLogs.some((line) => line.includes('budget_exhausted') && line.includes(`attempts=${budgetAttempts}`)));
  A('超预算·每次等待 deadline 钳制（无超预算等待）', budgetSleeps.every((ms) => ms <= 15000));

  // ---- deadline clamp: remaining budget smaller than next backoff step ----
  reset({ MIGRATE_CONNECT_RETRY_BASE_MS: '1000', MIGRATE_CONNECT_BUDGET_MS: '1500' });
  now = 0;
  const clampedSleeps: number[] = [];
  let clampThrew = false;
  try {
    await withConnectRetry(async () => {
      throw Object.assign(new Error('connect ECONNRESET'), { code: 'ECONNRESET' });
    }, {
      now: () => now,
      sleep: async (ms) => { clampedSleeps.push(ms); now += ms; },
      log: () => {},
    });
  } catch { clampThrew = true; }
  A('钳制·尾次等待被预算钳到 500ms（1000→剩余 500）', clampThrew && clampedSleeps[0] === 1000 && clampedSleeps[1] === 500);
} finally {
  for (const key of ENV_KEYS) {
    const value = original.get(key);
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}

console.log(failures === 0 ? '\n✓ HA-3 migrate 连接层重试分类 proof 全部通过' : `\n✗ ${failures} 项失败`);
process.exit(failures === 0 ? 0 : 1);
