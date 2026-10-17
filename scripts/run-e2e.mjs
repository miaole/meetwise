/**
 * E2E 自启动 runner(你要的"做完自己跑 E2E"):起真栈(api + worker,DB 需已 up)→ 等就绪 → 跑 e2e/full.e2e.ts → 拆栈。
 * 全栈真跑:真 Bearer 鉴权 + 真 commerce(下单+HMAC webhook)+ 真简历 + 真 worker 图执行 + 真报告。
 * 用法:pnpm e2e:isolated（包装器注入 E2E_ISOLATED=1）。缺 MODEL_API_KEY 或打开假服务开关会立即失败，不会降级成假绿。
 */
import { spawn } from 'node:child_process';
import { createHmac } from 'node:crypto';
import { readFileSync, existsSync, mkdirSync } from 'node:fs';
import { appendFileSync } from 'node:fs';
import { emitClassifiedE2EFailure, emitE2EFailure, tagE2EFailure } from '../e2e/helpers/failure-class.mjs';
import { assertNoFakeServiceFlags } from './e2e-fake-service-flags.mjs';
import { applyLiveE2ECapabilityEnv } from './e2e-live-capability-env.mjs';

const ROOT = new URL('..', import.meta.url).pathname;
// 测试默认密钥:CI 无 .env 也能起(简历加密/去重键)。外部已设则不覆盖。e2e 每次重建 schema,不需跨运行解密,用测试键安全。
const env = { ...process.env, AUTH_SECRET: process.env.AUTH_SECRET ?? 'e2e-dev-secret-key', PAY_PROVIDER_SECRET: process.env.PAY_PROVIDER_SECRET ?? 'e2e-pay-secret', RESUME_ENC_KEY: process.env.RESUME_ENC_KEY ?? 'e2e-resume-enc-key', RESUME_HASH_SECRET: process.env.RESUME_HASH_SECRET ?? 'e2e-resume-hash-secret', RAG_JOB_ROUTE_INPUT_HASH_KEY: process.env.RAG_JOB_ROUTE_INPUT_HASH_KEY ?? 'e2e-rag03-job-route-input-hmac-key-not-production' };
// 加载 .env(RESUME 加密键 + 模型),不覆盖已设。
// REG-FIX 组8b 测试钩:E2E_SKIP_DOTENV='1' 跳过仓根 .env 回灌(默认零变)——g6-e2e-iso-blocked 行为门用:
// Key-unset 快速失败(live_provider_key_missing)在任何宿主形态(仓根 .env 存/缺)必达,不被 .env 静默绕过。
// ISO-DOTENV-ISOLATION:isolated 形(E2E_ISOLATED=1)无论 E2E_SKIP_DOTENV 与否一律跳 .env 回灌——主仓 .env 在场时其环境语义键(APP_RUNTIME_DB_EXPECTED_ROLE/NODE_ENV/PORT 类)穿透隔离删单(:28-34 只删云凭据)漏入 api/worker 子进程=伪红源(G7K 诊断席环境发现);包装器 baseEnv 已供隔离全套 env,隔离形零回灌需求。
// E2E_SKIP_DOTENV 语义保持:非 isolated 形仍按原钩跳过(默认零变·g6-e2e-iso-blocked 行为门语义不变)。
if (process.env.E2E_SKIP_DOTENV !== '1' && env.E2E_ISOLATED !== '1') {
  if (existsSync(ROOT + '.env')) {
    for (const line of readFileSync(ROOT + '.env', 'utf8').split('\n')) {
      const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
      if (m && !env[m[1]]) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
}
if (env.E2E_ISOLATED === '1') {
  for (const key of [
    'DATABASE_URL', 'DATABASE_SSL_CA_PATH', 'QBANK_CONTROL_DATABASE_URL', 'QBANK_CONTROL_DB_USER', 'QBANK_CONTROL_DB_PASSWORD', 'REDIS_URL', 'RAG_REDIS_URL', 'RAG_REDIS_TEST_URL', 'RAG_QBANK_CACHE_HASH_KEY',
    'OBJECT_STORAGE_ENDPOINT', 'OBJECT_STORAGE_BUCKET', 'OBJECT_STORAGE_ACCESS_KEY', 'OBJECT_STORAGE_SECRET_KEY',
    'OSS_ACCESS_KEY_ID', 'OSS_ACCESS_KEY_SECRET', 'OSS_SECURITY_TOKEN',
    'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_SESSION_TOKEN',
    'LANGSMITH_API_KEY',
  ]) delete env[key];
  // Never let an isolated run evolve into a production tracing writer when a
  // new Langfuse setting is added.  An allowlist of three old names missed
  // BASE_URL/TRACING_ENABLED/CORRELATION_SECRET before; remove the namespace.
  for (const key of Object.keys(env)) if (key.startsWith('LANGFUSE_')) delete env[key];
  env.DATABASE_SSL_MODE = 'disable';
}
if (env.E2E_ISOLATED !== '1') throw tagE2EFailure('capability', 'e2e_isolation_required');
assertNoFakeServiceFlags(env);
const fakeServiceFlags = ['VOICE_FAKE', 'OCR_FAKE', 'E2E_FAKE_MODEL'].filter((name) => {
  const value = String(env[name] ?? '').trim().toLowerCase();
  return value && value !== '0' && value !== 'false';
});
if (fakeServiceFlags.length) throw tagE2EFailure('provider', 'fake_service_mode_forbidden');
if (!String(env.MODEL_API_KEY ?? '').trim()) throw tagE2EFailure('provider', 'live_provider_key_missing');

// Line C G7 FreeTierOnly re-prove (Step3): free-first + shared ¥5 ledger across api/worker processes.
if (String(env.G7_FREETIER_REPROVE ?? process.env.G7_FREETIER_REPROVE ?? '').trim() === '1') {
  env.G7_FREETIER_REPROVE = '1';
  if (String(env.G7_PAID_FALLBACK_ENABLED ?? process.env.G7_PAID_FALLBACK_ENABLED ?? '').trim() === '1') {
    env.G7_PAID_FALLBACK_ENABLED = '1';
  }
  if (!String(env.G7_RUN_COST_LEDGER_PATH ?? '').trim()) {
    const ledgerDir = `${ROOT}/.tmp/g7-ledgers`;
    mkdirSync(ledgerDir, { recursive: true });
    env.G7_RUN_COST_LEDGER_PATH = `${ledgerDir}/g7-${process.pid}-${Date.now()}.ndjson`;
  }
}
applyLiveE2ECapabilityEnv(env);

// A previous E2E used fixed 8787/19091 ports.  Two isolated runs then raced:
// the second runner connected to the first runner's API and reported a false
// result.  Derive a per-run pair (or accept an explicit pair for debugging),
// and pass the API address only to the E2E client—not to production config.
const parsePort = (name, fallback) => {
  const value = Number(env[name] ?? fallback);
  if (!Number.isInteger(value) || value < 10_240 || value > 65_534)
    throw tagE2EFailure('api', 'port_invalid');
  return value;
};
const apiPort = parsePort('E2E_API_PORT', 20_000 + (process.pid % 20_000));
const workerMetricsPort = parsePort('E2E_WORKER_METRICS_PORT', apiPort + 1);
if (workerMetricsPort === apiPort) throw tagE2EFailure('api', 'port_collision');
const apiBase = `http://127.0.0.1:${apiPort}`;

const procs = [];
const processDiagnostics = new Map();
const tailAppend = (name, chunk) => {
  const previous = processDiagnostics.get(name) ?? { chunks: 0, bytes: 0 };
  // Child stdout/stderr is untrusted data: it can contain answers, prompts,
  // bearer tokens or provider echoes.  Failure diagnostics retain only the
  // process identity and byte counts; raw output never enters terminal/CI logs.
  processDiagnostics.set(name, { chunks: previous.chunks + 1, bytes: previous.bytes + Buffer.byteLength(String(chunk)) });
};
const emitFailureDiagnostics = () => {
  for (const [name, summary] of processDiagnostics) {
    if (summary.bytes > 0) console.error(`E2E_PROCESS_OUTPUT_WITHHELD process=${name} chunks=${summary.chunks} bytes=${summary.bytes}`);
  }
};
const run = (name, args, cwd = ROOT, extraEnv = {}, forwardOutput = true) => {
  const p = spawn('node', args, { cwd, env: { ...env, ...extraEnv }, stdio: ['ignore', 'pipe', 'pipe'] });
  p.stdout.on('data', (d) => { tailAppend(`${name}:stdout`, d); if (forwardOutput && process.env.E2E_VERBOSE) process.stdout.write(`[${name}] ${d}`); });
  p.stderr.on('data', (d) => { tailAppend(`${name}:stderr`, d); if (forwardOutput && process.env.E2E_VERBOSE) process.stderr.write(`[${name}] ${d}`); });
  procs.push(p);
  return p;
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const cleanup = () => { for (const p of procs) { try { p.kill('SIGKILL'); } catch {} } };
process.on('exit', cleanup); process.on('SIGINT', () => { cleanup(); process.exit(1); });
// /livez 只证明 HTTP port 已绑定；迁移由隔离包装器在 API/worker 启动前完成。随机不存在账户登录到 401
// 才表示真实 DB 表已可查询，避免把 schema 尚未就绪误判为产品鉴权失败。
async function waitForApiDatabase(tries = 60) {
  for (let i = 0; i < tries; i++) {
    await sleep(1000);
    try {
      const r = await fetch(`${apiBase}/auth/login`, {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: `e2e-ready-${i}@invalid.test`, password: 'strongpw123' }),
      });
      if (r.status === 401) return true;
    } catch { /* API/DB still booting */ }
  }
  return false;
}

const REG = '@swc-node/register/esm-register';
async function main() {
  console.log('E2E: 启 api + worker…');
  // 从各自 app 目录跑(cwd=apps/api 才能解析 @swc-node/register;同 pnpm -C apps/api serve)。
  // 服务路径一律使用真实百炼。模型输出的非确定性必须由结构化契约与发布阈值控制，不能用 fake 覆盖。
  const api = run('api', ['--import', REG, 'src/main.ts'], ROOT + 'apps/api', { PORT: String(apiPort) });
  // The report fault is injected only after a real provider response, only in
  // the isolated suite. Calls 2–4 are the three retries of the dedicated
  // bulkhead sample; later B-side result cases use a real successful report.
  // This proves outage isolation without substituting any external service.
  const worker = run('worker', ['--import', REG, 'src/main.ts'], ROOT + 'apps/worker', { WORKER_BOOTSTRAP: '1', WEB_ALLOWLIST: '', WORKER_METRICS_PORT: String(workerMetricsPort), E2E_REPORT_FAIL_ALL: '1' });

  // 等 api 健康
  let up = false;
  for (let i = 0; i < 40; i++) {
    await sleep(1000);
    try { const r = await fetch(`${apiBase}/livez`); if (r.ok) { up = true; break; } } catch {}
  }
  if (!up) {
    emitE2EFailure({ class: 'api', code: 'api_not_ready' }); cleanup(); process.exit(1);
  }
  if (!(await waitForApiDatabase())) { emitE2EFailure({ class: 'db', code: 'database_not_ready' }); cleanup(); process.exit(1); }
  await sleep(3000);   // 给 worker 消费循环就绪
  // HTTP health only proves API bound its port.  A dead worker previously made
  // the suite wait 90 seconds for an event that could never arrive.
  if (worker.exitCode !== null) throw tagE2EFailure('worker', 'worker_exited_before_test');
  if (api.exitCode !== null) throw tagE2EFailure('api', 'api_exited_before_test');
  // worker 首拍门生效后启动窗内 /readyz/worker 恒 503，单发探测命中启动窗会假红 worker_not_ready——
  // 与同函数 api livez 同形的有界重试环（40×1s，先睡后探），环尽不就绪才落既有败臂。
  let workerReady = false;
  for (let i = 0; i < 40 && !workerReady; i++) {
    await sleep(1000);
    try { const r = await fetch(`http://127.0.0.1:${workerMetricsPort}/readyz/worker`); workerReady = r.ok; } catch {}
  }
  if (!workerReady) throw tagE2EFailure('worker', 'worker_not_ready');

  // B110 处方2: 隔离库播 admin 身份 + 铸测试令牌(注册面无 admin 入口,AdminGuard 只认 is_admin=true 行)。
  // 直插沿 API 负测先例 _neg-harness.ts:161-164;铸形逐字同 domain signToken(payload=base64url{uid,exp,pe} + HMAC-SHA256);
  // pe=0 对齐 pwd_epoch 列默认,secret 同 :14 测试键(API 子进程同键)。seed/铸任一步失败 fail-closed,不在 e2e 面静默降级。
  const seedAdmin = async () => {
    const { createRequire } = await import('node:module');
    const { Client } = createRequire(new URL('../packages/db/package.json', import.meta.url))('pg');
    const pgc = new Client({ host: env.PGHOST, port: Number(env.PGPORT), user: env.PGUSER, password: env.PGPASSWORD, database: env.PGDATABASE, ssl: false, connectionTimeoutMillis: 2000 });
    await pgc.connect();
    try {
      // status/pwd_epoch/role 取列默认(active/0/candidate)→ PrincipalGuard 账户态复核链全过。
      await pgc.query("INSERT INTO user_account(id,email,password_hash,is_admin,role) VALUES ('e2e-admin','e2e-admin@x.com','scrypt$e2e$bootstrap',true,'candidate') ON CONFLICT (id) DO NOTHING");
    } finally {
      await pgc.end().catch(() => {});
    }
    const nowSec = Math.floor(Date.now() / 1000);
    const payload = Buffer.from(JSON.stringify({ uid: 'e2e-admin', exp: nowSec + 3600, pe: 0 })).toString('base64url');
    return `${payload}.${createHmac('sha256', env.AUTH_SECRET).update(payload).digest('base64url')}`;
  };
  let adminToken;
  try {
    adminToken = await seedAdmin();
  } catch {
    throw tagE2EFailure('db', 'admin_bootstrap_failed');
  }

  console.log('E2E: 跑全栈用例…');
  const tsx = run('e2e', [ROOT + 'node_modules/tsx/dist/cli.mjs', 'e2e/full.e2e.ts'], ROOT, {
    E2E_TAG: 'ci' + Math.floor(process.hrtime()[1] / 1000), E2E_BASE: apiBase, E2E_ADMIN_TOKEN: adminToken,
  }, false);
  const tsxErrChunks = []; // G7W-DIAG-NEEDLES N3b: 红路回读面——tsx stderr 有界尾量收集(32KiB 滚动·至多 1 管道块保留)
  tsx.stdout.on('data', (d) => process.stdout.write(d));
  tsx.stderr.on('data', (d) => { tsxErrChunks.push(String(d)); while (tsxErrChunks.length > 1 && Buffer.byteLength(tsxErrChunks.join('')) > 32_768) tsxErrChunks.shift(); process.stderr.write(d); }); // G7W-DIAG-NEEDLES N3b: 转发逐字节零改+前置收集
  const flushTsxStderrTail = (exit) => { try { mkdirSync(`${ROOT}.tmp`, { recursive: true }); appendFileSync(`${ROOT}.tmp/e2e-tsx-stderr-tail.ndjson`, `${JSON.stringify({ bootId: process.pid, step: 'tsx_stderr_tail', exit, tailBytes: Buffer.byteLength(tsxErrChunks.join('')), tail: tsxErrChunks.join('') })}\n`); } catch { /* 防自伤: 尾量落盘自身异常不改写红路 class(:258 7a_diag diag_failed 同形) */ } }; // G7W-DIAG-NEEDLES N3c
  const code = await Promise.race([
    new Promise((res) => tsx.on('exit', res)),
    new Promise((res) => worker.on('exit', (workerCode) => res(`worker_exit:${workerCode ?? 'signal'}`))),
    new Promise((res) => api.on('exit', (apiCode) => res(`api_exit:${apiCode ?? 'signal'}`))),
  ]);
  if (typeof code === 'string') {
    flushTsxStderrTail(code); // G7W-DIAG-NEEDLES N3d: worker/api_exited 红臂 throw 前落盘(绿路零触)
    throw tagE2EFailure(code.startsWith('worker_exit') ? 'worker' : 'api', code.startsWith('worker_exit') ? 'worker_exited_during_test' : 'api_exited_during_test');
  }
  if (code !== 0) flushTsxStderrTail(code); // G7W-DIAG-NEEDLES N3d: client_exited 红臂 throw 前落盘(绿路零触·同条件守卫)
  if (code !== 0) throw tagE2EFailure('api', 'client_exited');
  cleanup();
  process.exit(0);
}
main().catch((e) => {
  emitClassifiedE2EFailure(e, { class: 'api', code: 'client_uncaught' });
  emitFailureDiagnostics();
  cleanup();
  process.exit(1);
});
