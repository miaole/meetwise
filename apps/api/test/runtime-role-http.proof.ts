/**
 * Production-like HTTP proof on an isolated PostgreSQL cluster: the Nest API
 * uses a NOINHERIT runtime login, while signup/login use only fixed gateway
 * functions and profile reads use principal-scoped RLS transactions.
 */
import 'reflect-metadata';
import { fileURLToPath } from 'node:url';
import { asGateway, assertIsolatedTestTarget, createPool, loadMigrations, provisionRuntimeLogin, runMigrations } from '@meetwise/db';
const MEETWISE_TEST_FIXTURE_PASSWORD_RT = 'api-runtime-role-password-2026';


const admin = createPool();
const role = `api_runtime_${process.pid}`;
const password = MEETWISE_TEST_FIXTURE_PASSWORD_RT;
let failures = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };
const rejects = async (fn: () => Promise<unknown>) => { try { await fn(); return false; } catch { return true; } };

async function main() {
  // 隔离靶自证（E2E_ISOLATED 五件套+容器 nonce·破坏性 DROP 账本前向断言·沿 turn-idempotency.proof 同形）。
  await assertIsolatedTestTarget(admin);
  await admin.query('DROP TABLE IF EXISTS schema_migrations CASCADE');
  await runMigrations(admin, loadMigrations(fileURLToPath(new URL('../../../packages/db/migrations', import.meta.url))));
  await provisionRuntimeLogin(admin, { roleName: role, password });
  Object.assign(process.env, {
    // A disposable loopback PostgreSQL container is an isolated test target,
    // never a production cloud database.  The proof still uses a NOINHERIT
    // runtime login and production-equivalent authentication contract.
    NODE_ENV: 'test', WEB_ORIGIN: 'https://web.example.test', AUTH_SECRET: 'api-runtime-proof-auth-secret',
    PGUSER: role, PGPASSWORD: password,
  });
  const { createApp } = await import('../src/main.ts');
  const { DbService } = await import('../src/platform/db.service.ts');
  const app = await createApp();
  await app.listen(0, '127.0.0.1');
  const base = (await app.getUrl()).replace('[::1]', '127.0.0.1');
  try {
    const db = app.get(DbService);
    A('API 运行登录不能绕过网关直接读 user_account', await rejects(() => db.pool.query('SELECT id,password_hash FROM user_account')));
    // #92 readiness 深化曾把账本读（SELECT max(version) FROM schema_migrations）放进探针位：
    // 探针在 NOINHERIT 运行时登录裸连接上运行（绝不 SET ROLE app_role），直读表即
    // permission-denied（42501）→ readyz 恒 503 migration_mismatch——生产身份下 readiness
    // 永久假红的真实回归（regr-draft 刀判定）。修法沿 0040/0041/0042 网关元数据先例：
    // 0225 固定 SECURITY DEFINER 函数 gateway_migration_ledger_max()，经 app_gateway_role
    // SET LOCAL ROLE 执行；运行时登录仍零表授权。这里钉四层：①登录直读账本仍拒（表授权
    // 不变量不破）；②登录直调网关函数仍拒（EXECUTE 只授 app_gateway_role，NOINHERIT 成员
    // 不自动继承——唯一路径=评审过的 SET ROLE 门）；③经 asGateway 网关账本读返回与真实
    // 账本一致的 max（探针元数据路径在真实生产身份下可用·抓回归主断言）；④HTTP readyz
    // 200（回归前此断言 503）。
    A('运行登录不能直读迁移账本（零表授权不变量）', await rejects(() => db.pool.query('SELECT max(version COLLATE "C") AS v FROM schema_migrations')));
    A('运行登录不能直调网关卡尺函数（EXECUTE 只经 app_gateway_role SET ROLE 门）', await rejects(() => db.pool.query('SELECT gateway_migration_ledger_max()')));
    const gatewayMax = await asGateway(db.pool, (c) => c.query<{ v: string | null }>('SELECT gateway_migration_ledger_max() AS v'));
    const adminMax = (await admin.query<{ v: string | null }>('SELECT max(version COLLATE "C") AS v FROM schema_migrations')).rows[0]?.v ?? null;
    A('网关账本读返回真实账本 max（readyz 元数据路径在生产身份下可用）', typeof adminMax === 'string' && adminMax.length > 0 && gatewayMax.rows[0]?.v === adminMax);
    const livez = await fetch(`${base}/livez`);
    A('低权 API livez 不读数据库仍为 200', livez.status === 200 && (await livez.json() as any).status === 'ok');
    const readyz = await fetch(`${base}/readyz/api`);
    A('低权 API readyz/api（SELECT 1 + 网关函数账本读）仍为 200', readyz.status === 200 && (await readyz.json() as any).status === 'ok');

    const signup = await fetch(`${base}/auth/signup`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'runtime-api@example.test', password: 'runtime-api-password-2026', role: 'candidate' }),
    });
    const signupBody = await signup.json() as any;
    A('低权 API 注册只经网关函数并签发 token', signup.status === 200 && typeof signupBody.token === 'string');
    const profile = await fetch(`${base}/profile`, { headers: { authorization: `Bearer ${signupBody.token}` } });
    const profileBody = await profile.json() as any;
    A('Bearer 请求经 user_account RLS 读取本人资料', profile.status === 200 && profileBody.email === 'runtime-api@example.test' && profileBody.password_hash === undefined);
    const login = await fetch(`${base}/auth/login`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'runtime-api@example.test', password: 'runtime-api-password-2026' }),
    });
    A('低权 API 登录只经网关函数且保持原 HTTP 契约', login.status === 200 && typeof (await login.json() as any).token === 'string');
  } finally {
    await app.close();
    await admin.query(`DROP ROLE IF EXISTS ${role}`);
    await admin.end();
  }
  console.log(failures === 0 ? '\n✓ 低权 API HTTP proof 全部通过' : `\n✗ ${failures} 项失败`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(async (error) => { console.error(error); await admin.end().catch(() => undefined); process.exit(1); });
