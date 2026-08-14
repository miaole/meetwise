/**
 * Production-like HTTP proof on an isolated PostgreSQL cluster: the Nest API
 * uses a NOINHERIT runtime login, while signup/login use only fixed gateway
 * functions and profile reads use principal-scoped RLS transactions.
 */
import 'reflect-metadata';
import { fileURLToPath } from 'node:url';
import { createPool, loadMigrations, provisionRuntimeLogin, runMigrations } from '@meetwise/db';

const admin = createPool();
const role = `api_runtime_${process.pid}`;
const password = 'api-runtime-role-password-2026';
let failures = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };
const rejects = async (fn: () => Promise<unknown>) => { try { await fn(); return false; } catch { return true; } };

async function main() {
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
    const livez = await fetch(`${base}/livez`);
    A('低权 API livez 不读数据库仍为 200', livez.status === 200 && (await livez.json() as any).status === 'ok');
    const readyz = await fetch(`${base}/readyz/api`);
    A('低权 API readyz/api 使用无表权限 SELECT 1 仍为 200', readyz.status === 200 && (await readyz.json() as any).status === 'ok');

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
