import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertIsolatedTestTarget, createPool } from '@meetwise/db';
import type { DbPool } from '@meetwise/db';

/**
 * 审计 #91「配置集中校验刀」prove（零外呼·est live=0）。
 *
 * 覆盖面（REQUEST §prove）：
 *  A. 纯函数单元面：parseCriticalEnv 三档定谳清单逐项 + assertCriticalEnv 错误消息一次性列全。
 *  B/C/D. spawn 死亡面：缺 AUTH_SECRET / 缺数据库目标（列全）/ 格式错 → 启动即死，
 *         断言退出码 + 错误信息（env_schema_invalid + 缺失项机器码）+ 从未监听（无 `api on`）。
 *  E. 全配置正常启动 OK + readiness 含配置状态：真库上 boot 成功，/readyz/api 200 且
 *     body.config.envSchema === 'ok'（/livez 与旧 /health 别名同面核对）。
 *  F. readiness 配置位 fail-closed 面：env 被清掉关键项后 HealthService.configReady() === false。
 */

let pass = 0;
let fail = 0;
const A = (name: string, cond: boolean) => { pass++; if (!cond) { fail++; console.log(`FAIL  ${name}`); } else console.log(`PASS  ${name}`); };

const here = dirname(fileURLToPath(import.meta.url));
const apiRoot = resolve(here, '..');
const SERVE_CMD = process.execPath;
const SERVE_ARGS = ['--import', '@swc-node/register/esm-register', resolve(apiRoot, 'src/main.ts')];

/** 最小 spawn 环境：只留进程运转必需项，关键 env 由各用例显式给定（防本机 dotenv 污染）。 */
const BASE_SPAWN_ENV: NodeJS.ProcessEnv = {
  PATH: process.env.PATH ?? '/usr/bin:/bin',
  HOME: process.env.HOME ?? '/tmp',
  LANG: process.env.LANG ?? 'en_US.UTF-8',
};

interface SpawnOutcome { code: number | null; signal: string | null; output: string }

function spawnServe(env: NodeJS.ProcessEnv, timeoutMs = 90_000): Promise<SpawnOutcome> {
  return new Promise((resolveSpawn) => {
    const child = spawn(SERVE_CMD, SERVE_ARGS, {
      cwd: apiRoot,
      env: { ...BASE_SPAWN_ENV, ...env },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let output = '';
    child.stdout.on('data', (d: Buffer) => { output += d.toString(); });
    child.stderr.on('data', (d: Buffer) => { output += d.toString(); });
    const timer = setTimeout(() => { child.kill('SIGKILL'); }, timeoutMs);
    child.on('close', (code, signal) => { clearTimeout(timer); resolveSpawn({ code, signal, output }); });
  });
}

// ────────────────────────── A. 纯函数单元面 ──────────────────────────
const { parseCriticalEnv, assertCriticalEnv, ENV_SCHEMA_INVALID } = await import('../src/platform/env-schema.ts');

A('A1 全配置（URL 路径）→ ok', parseCriticalEnv({ AUTH_SECRET: 's', DATABASE_URL: 'postgresql://u:p@h:5432/d' } as NodeJS.ProcessEnv).ok === true);
A('A2 全配置（PG 五件套路径·空密码合法）→ ok',
  parseCriticalEnv({ AUTH_SECRET: 's', PGHOST: 'h', PGPORT: '5432', PGUSER: 'u', PGPASSWORD: '', PGDATABASE: 'd' } as NodeJS.ProcessEnv).ok === true);
A('A3 缺 AUTH_SECRET → missing:AUTH_SECRET',
  JSON.stringify(parseCriticalEnv({ DATABASE_URL: 'postgresql://u:p@h:5432/d' } as NodeJS.ProcessEnv)) ===
    JSON.stringify({ ok: false, problems: ['missing:AUTH_SECRET'] }));
A('A4 AUTH_SECRET 空白视同缺失 + URL 协议错列 invalid',
  (() => {
    const r = parseCriticalEnv({ AUTH_SECRET: '   ', DATABASE_URL: 'ftp://x' } as NodeJS.ProcessEnv);
    return !r.ok && r.problems.includes('missing:AUTH_SECRET')
      && r.problems.some((p) => p.startsWith('invalid:DATABASE_URL'));
  })());
A('A5 缺数据库目标（两路全缺）→ database_target_missing 且列出全部组件名',
  (() => {
    const r = parseCriticalEnv({ AUTH_SECRET: 's' } as NodeJS.ProcessEnv);
    return !r.ok && r.problems.length === 1 && r.problems[0]!.startsWith('database_target_missing')
      && r.problems[0]!.includes('PGHOST,PGPORT,PGUSER,PGPASSWORD,PGDATABASE');
  })());
A('A6 PG 五件套缺一件（无 PGPORT）→ database_target_missing 只列缺件',
  (() => {
    const r = parseCriticalEnv({ AUTH_SECRET: 's', PGHOST: 'h', PGUSER: 'u', PGPASSWORD: 'p', PGDATABASE: 'd' } as NodeJS.ProcessEnv);
    return !r.ok && r.problems.length === 1 && r.problems[0]!.endsWith('(lacking: PGPORT)');
  })());
A('A7 PGPORT 越界 → invalid:PGPORT 且数据库目标仍按缺件列（去重不重复计）',
  (() => {
    const r = parseCriticalEnv({ AUTH_SECRET: 's', PGPORT: '99999' } as NodeJS.ProcessEnv);
    return !r.ok && r.problems.some((p) => p.startsWith('invalid:PGPORT'))
      && r.problems.filter((p) => p.startsWith('database_target_missing')).length === 1;
  })());
A('A8 空串 DATABASE_URL/PGHOST 视同缺失（与 @meetwise/db nonEmpty 口径一致）',
  (() => {
    const r = parseCriticalEnv({ AUTH_SECRET: 's', DATABASE_URL: '', PGHOST: ' ' } as NodeJS.ProcessEnv);
    return !r.ok && r.problems.length === 1 && r.problems[0]!.startsWith('database_target_missing');
  })());
A('A9 assertCriticalEnv 抛 env_schema_invalid 且消息一次性列全缺失项',
  (() => {
    try { assertCriticalEnv({ DATABASE_URL: 'postgresql://u:p@h:5432/d' } as NodeJS.ProcessEnv); return false; }
    catch (e) { return e instanceof Error && e.message.startsWith(`${ENV_SCHEMA_INVALID}: `) && e.message.includes('missing:AUTH_SECRET'); }
  })());
// A10（post-dual FAIL 处方·勘误回归钉）：五件套齐全+仅缺 AUTH_SECRET → 不得误报
// database_target_missing（修复前 parse 失败分支以 {} 传入致组件存在性被丢弃）。
A('A10 PG 五件套齐全+仅缺 AUTH_SECRET → problems 精确等于 [missing:AUTH_SECRET]（禁含 database_target_missing）',
  (() => {
    const r = parseCriticalEnv({ PGHOST: 'h', PGPORT: '5432', PGUSER: 'u', PGPASSWORD: 'p', PGDATABASE: 'd' } as NodeJS.ProcessEnv);
    return !r.ok && JSON.stringify(r.problems) === JSON.stringify(['missing:AUTH_SECRET']);
  })());

// ────────────────────────── P. PREVIEW 严格三态 + RESUME 双键启动聚合（纯 parse 面） ──────────────────────────
const PREVIEW_PROBLEM = 'invalid:MEETWISE_PUBLIC_PREVIEW:strict_three_state';
// eslint-disable-next-line @typescript-eslint/naming-convention -- env 名为外部 wire 字面值,非代码标识符,不可改名(行内豁免·authz34 先例形)
const fullLegalEnv = { AUTH_SECRET: 's', DATABASE_URL: 'postgresql://u:p@h:5432/d' } as NodeJS.ProcessEnv;
/** fullLegalEnv 基础上以成员赋值注入变量（不引入新对象字面量键）。 */
const envWith = (patch: (e: NodeJS.ProcessEnv) => void): NodeJS.ProcessEnv => {
  const e = { ...fullLegalEnv };
  patch(e);
  return e;
};

A('P1 PREVIEW 合法三态（剔除/\'0\'/\'1\'）→ ok',
  parseCriticalEnv(fullLegalEnv).ok === true
  && parseCriticalEnv(envWith((e) => { e.MEETWISE_PUBLIC_PREVIEW = '0'; })).ok === true
  && parseCriticalEnv(envWith((e) => { e.MEETWISE_PUBLIC_PREVIEW = '1'; })).ok === true);
A('P2 PREVIEW 非常值（空串/\'true\'/带空白/\'2\'）→ strict_three_state 单列（空串不视同缺失）',
  (['', 'true', ' 1', '2'] as const).every((v) =>
    JSON.stringify(parseCriticalEnv(envWith((e) => { e.MEETWISE_PUBLIC_PREVIEW = v; })))
      === JSON.stringify({ ok: false, problems: [PREVIEW_PROBLEM] })));
A('P3 RESUME_ENC_KEY 15 字符 → invalid:min_length_16',
  JSON.stringify(parseCriticalEnv(envWith((e) => { e.RESUME_ENC_KEY = 'a'.repeat(15); })))
    === JSON.stringify({ ok: false, problems: ['invalid:RESUME_ENC_KEY:min_length_16'] }));
A('P4 RESUME_ENC_KEY 恰 16 字符 → ok（下界含等号）',
  parseCriticalEnv(envWith((e) => { e.RESUME_ENC_KEY = 'a'.repeat(16); })).ok === true);
A('P5 生产缺 RESUME_HASH_SECRET → missing:prod_required（非 prod 同态 → ok=dev 默认支）',
  JSON.stringify(parseCriticalEnv(envWith((e) => { e.NODE_ENV = 'production'; e.RESUME_ENC_KEY = 'a'.repeat(16); })))
    === JSON.stringify({ ok: false, problems: ['missing:RESUME_HASH_SECRET:prod_required'] })
  && parseCriticalEnv(envWith((e) => { e.NODE_ENV = 'test'; })).ok === true);
A('P6 双键同坏 + PREVIEW 非法同现 → problems 一次列全三问题（聚合不短路）',
  JSON.stringify(parseCriticalEnv(envWith((e) => {
    e.MEETWISE_PUBLIC_PREVIEW = 'true';
    e.RESUME_ENC_KEY = 'a'.repeat(15);
    e.RESUME_HASH_SECRET = 'b'.repeat(15);
  })))
    === JSON.stringify({ ok: false, problems: [PREVIEW_PROBLEM, 'invalid:RESUME_ENC_KEY:min_length_16', 'invalid:RESUME_HASH_SECRET:min_length_16'] }));

// ────────────────────────── P-SRC. signup 前置校验源级臂（零新脚本零 DB 面） ──────────────────────────
const authServiceSrc = readFileSync(resolve(here, '../src/modules/auth/auth.service.ts'), 'utf8');
const authPrecheckAt = authServiceSrc.indexOf("process.env.AUTH_SECRET ?? ''");
const signupWriteAt = authServiceSrc.indexOf('SELECT gateway_auth_signup(');
A('P-SRC1 AUTH_SECRET 前置校验行位于 signup 网关写点之前（写点前移零半成功）',
  authPrecheckAt !== -1 && signupWriteAt !== -1 && authPrecheckAt < signupWriteAt);
A('P-SRC2 auth_not_configured 错误词在 auth.service 源内 + 网关写点恰 1 处',
  authServiceSrc.includes('auth_not_configured')
  && authServiceSrc.split('SELECT gateway_auth_signup(').length - 1 === 1);

// ────────────────────────── B/C/D. spawn 死亡面 ──────────────────────────
const dead1 = await spawnServe({ DATABASE_URL: 'postgresql://u:p@h:5432/d' });   // 只缺 AUTH_SECRET
A('B1 缺 AUTH_SECRET spawn → 退出码 1（启动即死）', dead1.code === 1 && dead1.signal === null);
A('B2 错误信息含 env_schema_invalid + missing:AUTH_SECRET',
  dead1.output.includes('env_schema_invalid') && dead1.output.includes('missing:AUTH_SECRET'));
A('B3 未监听即死（无 api on 横幅）', !dead1.output.includes('api on'));

const dead2 = await spawnServe({});   // AUTH_SECRET + 数据库目标双缺 → 列全
A('C1 双缺 spawn → 退出码 1 且错误信息一次性列全（AUTH_SECRET 与 database_target_missing 同现）',
  dead2.code === 1 && dead2.output.includes('missing:AUTH_SECRET') && dead2.output.includes('database_target_missing'));

const dead3 = await spawnServe({ AUTH_SECRET: 's', DATABASE_URL: 'ftp://not-a-database' });   // 格式错
A('D1 DATABASE_URL 协议错 spawn → 退出码 1 且 invalid:DATABASE_URL 入错误信息（target_missing 不双报）',
  dead3.code === 1 && dead3.output.includes('invalid:DATABASE_URL') && !dead3.output.includes('database_target_missing'));

// ────────────────────────── E/F. 全配置启动 + readiness 配置位 ──────────────────────────
const admin: DbPool = createPool();
await assertIsolatedTestTarget(admin);
console.log('ISOLATED_TARGET_ATTESTATION ok loopback+nonce verified');

const authSecret = `env-schema-proof-${randomUUID()}`;
const savedEnv = new Map(['AUTH_SECRET', 'MEETWISE_PUBLIC_PREVIEW', 'OCR_ENABLED', 'NODE_ENV', 'WEB_ORIGIN'].map((k) => [k, process.env[k]]));
Object.assign(process.env, {
  AUTH_SECRET: authSecret,
  MEETWISE_PUBLIC_PREVIEW: '0',
  OCR_ENABLED: '0',
  NODE_ENV: 'test',
  WEB_ORIGIN: 'https://web.example.test',
});
try {
  const { createApp } = await import('../src/main.ts');
  const app = await createApp();
  await app.listen(0, '127.0.0.1');
  const base = (await app.getUrl()).replace('[::1]', '127.0.0.1');
  const get = async (path: string) => {
    const res = await fetch(base + path);
    return { status: res.status, body: await res.json().catch(() => ({})) as any };
  };

  const readyz = await get('/readyz/api');
  A('E1 全配置启动后 /readyz/api → 200 且 status=ok', readyz.status === 200 && readyz.body.status === 'ok');
  A('E2 readiness 含配置状态（body.config.envSchema === ok）', readyz.body?.config?.envSchema === 'ok');
  const healthAlias = await get('/health');
  A('E3 旧 /health 别名同面（200 + config.envSchema=ok）', healthAlias.status === 200 && healthAlias.body?.config?.envSchema === 'ok');
  const livez = await get('/livez');
  A('E4 /livez 不受配置位影响（恒 200 存活语义）', livez.status === 200 && livez.body.status === 'ok');

  // F. 配置位 fail-closed：清掉关键项后 configReady()=false（同一纯函数，不缓存）。
  const { HealthService } = await import('../src/modules/health/health.service.ts');
  const healthService = app.get(HealthService);
  A('F1 配置齐备时 configReady() === true', healthService.configReady() === true);
  delete process.env.AUTH_SECRET;
  A('F2 缺 AUTH_SECRET 时 configReady() === false（readiness 配置位 fail-closed）', healthService.configReady() === false);
  process.env.AUTH_SECRET = authSecret;
  A('F3 恢复后 configReady() === true（每次现算不缓存）', healthService.configReady() === true);

  await app.close();
} finally {
  for (const [key, value] of savedEnv) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  await admin.end().catch(() => {});
}

console.log(fail === 0
  ? `\n✓ env-schema prove: ${pass} assertions 全绿 · est live=0 · releaseEvidence=false`
  : `\n✗ env-schema prove: ${fail}/${pass} 失败`);
process.exit(fail === 0 ? 0 : 1);
