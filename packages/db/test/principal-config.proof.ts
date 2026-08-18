/** Database target parser proof: no hidden local defaults or URL/component split-brain. */
import { createPool, rebindDatabaseLogin, resolveDatabaseConnectionString } from '../src/index.ts';

const KEYS = ['DATABASE_URL', 'DATABASE_SSL_MODE', 'DATABASE_SSL_CA_PATH', 'NODE_ENV', 'PGHOST', 'PGPORT', 'PGUSER', 'PGPASSWORD', 'PGDATABASE'] as const;
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

function errorCode(fn: () => unknown): string | undefined {
  try { fn(); return undefined; }
  catch (error) { return String((error as Error).message); }
}

try {
  reset();
  A('无 DATABASE_URL 与完整 PG 组件时拒绝，不回退 localhost',
    errorCode(() => resolveDatabaseConnectionString()) === 'database_config_invalid:database_target_missing');

  reset({ DATABASE_URL: 'postgresql://app:pw@db.internal:5432/meetwise' });
  A('仅 DATABASE_URL 解析为唯一目标',
    resolveDatabaseConnectionString() === 'postgresql://app:pw@db.internal:5432/meetwise');

  reset({ DATABASE_URL: 'postgresql://app:pw@db.internal:5432/meetwise', PGHOST: 'other.internal' });
  A('DATABASE_URL 与 PG 组件并存拒绝，防止连接分裂',
    errorCode(() => resolveDatabaseConnectionString()) === 'database_config_invalid:database_url_conflicts_with_pg_components');

  reset({ DATABASE_URL: 'postgresql://migration:pw@db.internal:5432/meetwise?application_name=migrate' });
  const reboundControlUrl = rebindDatabaseLogin(resolveDatabaseConnectionString(), {
    roleName: 'rag_control_job', password: 'rag-control-proof-password',
  });
  const reboundControlTarget = new URL(reboundControlUrl);
  A('专用 control 登录从已验证 DATABASE_URL 派生，不触发 URL/组件冲突且保留目标',
    reboundControlTarget.username === 'rag_control_job'
    && reboundControlTarget.password === 'rag-control-proof-password'
    && reboundControlTarget.hostname === 'db.internal'
    && reboundControlTarget.port === '5432'
    && reboundControlTarget.pathname === '/meetwise'
    && reboundControlTarget.searchParams.get('application_name') === 'migrate');

  reset({ PGHOST: 'db.internal', PGPORT: '5432', PGUSER: 'app', PGPASSWORD: 'pw', PGDATABASE: 'meetwise' });
  A('完整 PG 组件显式构造目标',
    resolveDatabaseConnectionString() === 'postgresql://app:pw@db.internal:5432/meetwise');

  reset({ NODE_ENV: 'production', PGHOST: '127.0.0.1', PGPORT: '5432', PGUSER: 'app', PGPASSWORD: 'pw', PGDATABASE: 'meetwise' });
  A('生产环境拒绝本机数据库目标',
    errorCode(() => resolveDatabaseConnectionString()) === 'database_config_invalid:production_local_database_host');

  reset({ NODE_ENV: 'production', PGHOST: '127.0.0.2', PGPORT: '5432', PGUSER: 'app', PGPASSWORD: 'pw', PGDATABASE: 'meetwise' });
  A('生产环境拒绝所有 IPv4 回环地址（不只 127.0.0.1）',
    errorCode(() => resolveDatabaseConnectionString()) === 'database_config_invalid:production_local_database_host');

  reset({ NODE_ENV: 'production', DATABASE_URL: 'postgresql://app:pw@localhost.:5432/meetwise' });
  A('生产环境拒绝带尾点的 localhost（本地回环别名）',
    errorCode(() => resolveDatabaseConnectionString()) === 'database_config_invalid:production_local_database_host');

  reset({ NODE_ENV: 'production', DATABASE_URL: 'postgresql://app:pw@db.internal:5432/meetwise', DATABASE_SSL_MODE: 'disable' });
  A('生产环境要求 verify-full TLS（完整证书与主机名验证）',
    errorCode(() => createPool()) === 'database_config_invalid:production_tls_verify_full_required');
} finally {
  for (const key of KEYS) {
    const value = original.get(key);
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}

console.log(failures === 0 ? '\n✓ 数据库配置解析 proof 全部通过' : `\n✗ ${failures} 项失败`);
process.exit(failures === 0 ? 0 : 1);
