/**
 * 真浏览器 E2E 自启动 runner:起真栈(api + worker + web,production `next start`)→ 等就绪 →
 * 跑 Playwright(headless chromium + Pixel 5 两端)驱动真实 UI → 拆栈。
 * 这是 HTTP 层 e2e(run-e2e.mjs)之外的浏览器证据:cookie 鉴权 / middleware 在真实浏览器里端到端跑通。
 * 用法:pnpm e2e:ui(需 docker DB 在跑;web 需已 `pnpm -C apps/web build` 出 .next——本脚本不重新构建,构建太慢)。
 */
import { spawn } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { emitClassifiedE2EFailure, emitE2EFailure, tagE2EFailure } from '../e2e/helpers/failure-class.mjs';

const ROOT = new URL('..', import.meta.url).pathname;
const env = {
  ...process.env,
  AUTH_SECRET: process.env.AUTH_SECRET ?? 'e2e-dev-secret-key',
  PAY_PROVIDER_SECRET: process.env.PAY_PROVIDER_SECRET ?? 'e2e-pay-secret',
  RESUME_ENC_KEY: process.env.RESUME_ENC_KEY ?? 'e2e-resume-enc-key',
  RESUME_HASH_SECRET: process.env.RESUME_HASH_SECRET ?? 'e2e-resume-hash-secret',
  RAG_JOB_ROUTE_INPUT_HASH_KEY: process.env.RAG_JOB_ROUTE_INPUT_HASH_KEY ?? 'e2e-rag03-job-route-input-hmac-key-not-production',
};
// 加载 .env(RESUME 加密键 + 模型),不覆盖已设
if (existsSync(ROOT + '.env')) {
  for (const line of readFileSync(ROOT + '.env', 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !env[m[1]]) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
if (env.E2E_ISOLATED === '1') {
  for (const key of [
    'DATABASE_URL', 'DATABASE_SSL_CA_PATH', 'REDIS_URL', 'RAG_REDIS_URL', 'RAG_REDIS_TEST_URL', 'RAG_QBANK_CACHE_HASH_KEY',
    'OBJECT_STORAGE_ENDPOINT', 'OBJECT_STORAGE_BUCKET', 'OBJECT_STORAGE_ACCESS_KEY', 'OBJECT_STORAGE_SECRET_KEY',
    'OSS_ACCESS_KEY_ID', 'OSS_ACCESS_KEY_SECRET', 'OSS_SECURITY_TOKEN',
    'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_SESSION_TOKEN',
    'LANGSMITH_API_KEY',
  ]) delete env[key];
  for (const key of Object.keys(env)) if (key.startsWith('LANGFUSE_')) delete env[key];
  env.DATABASE_SSL_MODE = 'disable';
}
if (env.E2E_ISOLATED !== '1') throw tagE2EFailure('capability', 'e2e_ui_isolation_required');
const fakeServiceFlags = ['VOICE_FAKE', 'OCR_FAKE', 'E2E_FAKE_MODEL'].filter((name) => {
  const value = String(env[name] ?? '').trim().toLowerCase();
  return value && value !== '0' && value !== 'false';
});
if (fakeServiceFlags.length) throw tagE2EFailure('provider', 'fake_service_mode_forbidden');
if (!String(env.MODEL_API_KEY ?? '').trim()) throw tagE2EFailure('provider', 'live_provider_key_missing');

// Fixed 8787/19091/3100 lets a parallel UI run attach its browser to another
// stack.  Each run gets an independent pair/triple and propagates those
// values only through explicit E2E variables, never production defaults.
const parsePort = (name, fallback) => {
  const value = Number(env[name] ?? fallback);
  if (!Number.isInteger(value) || value < 10_240 || value > 65_534) {
    throw tagE2EFailure('api', 'port_invalid');
  }
  return value;
};
const apiPort = parsePort('E2E_API_PORT', 20_000 + (process.pid % 20_000));
const workerMetricsPort = parsePort('E2E_WORKER_METRICS_PORT', apiPort + 1);
const webPort = parsePort('E2E_WEB_PORT', apiPort + 2);
if (new Set([apiPort, workerMetricsPort, webPort]).size !== 3) throw tagE2EFailure('api', 'port_collision');
const apiBase = `http://127.0.0.1:${apiPort}`;
const webBase = `http://127.0.0.1:${webPort}`;

const procs = [];
const processDiagnostics = new Map();
const tailAppend = (name, chunk) => {
  const previous = processDiagnostics.get(name) ?? { chunks: 0, bytes: 0 };
  processDiagnostics.set(name, { chunks: previous.chunks + 1, bytes: previous.bytes + Buffer.byteLength(String(chunk)) });
};
const emitFailureDiagnostics = () => {
  for (const [name, summary] of processDiagnostics) {
    if (summary.bytes > 0) console.error(`E2E_PROCESS_OUTPUT_WITHHELD process=${name} chunks=${summary.chunks} bytes=${summary.bytes}`);
  }
};
const spawnProc = (name, cmd, args, cwd = ROOT, extraEnv = {}, forwardOutput = true) => {
  const p = spawn(cmd, args, { cwd, env: { ...env, ...extraEnv }, stdio: ['ignore', 'pipe', 'pipe'] });
  p.stdout.on('data', (d) => {
    tailAppend(`${name}:stdout`, d);
    if (forwardOutput && process.env.E2E_VERBOSE) process.stdout.write(`[${name}] ${d}`);
  });
  p.stderr.on('data', (d) => {
    tailAppend(`${name}:stderr`, d);
    if (forwardOutput && process.env.E2E_VERBOSE) process.stderr.write(`[${name}] ${d}`);
  });
  procs.push(p);
  return p;
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const cleanup = () => { for (const p of procs) { try { p.kill('SIGKILL'); } catch {} } };
process.on('exit', cleanup); process.on('SIGINT', () => { cleanup(); process.exit(1); });

const waitFor = async (url, label, tries = 60) => {
  for (let i = 0; i < tries; i++) {
    await sleep(1000);
    try { const r = await fetch(url); if (r.ok || r.status === 307 || r.status === 308) return true; } catch {}
  }
  emitE2EFailure({ class: label === 'web' ? 'frontend' : 'api', code: label === 'web' ? 'web_not_ready' : 'api_not_ready' });
  return false;
};
// /livez 不能代表 migration 完成。隔离包装器会先迁移；随机不存在账户登录到 401
// 表示 API 已真正读到 user_account，Playwright 不会因启动竞态而得到假 500。
const waitForApiDatabase = async (tries = 60) => {
  for (let i = 0; i < tries; i++) {
    await sleep(1000);
    try {
      const r = await fetch(`${apiBase}/auth/login`, {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: `e2e-ready-${i}@invalid.test`, password: 'strongpw123' }),
      });
      if (r.status === 401) return true;
    } catch { /* still booting */ }
  }
  return false;
};

const REG = '@swc-node/register/esm-register';
const NEXT_BIN = ROOT + 'apps/web/node_modules/next/dist/bin/next';
async function main() {
  console.log('E2E-UI: 启 api + worker…');
  const api = spawnProc('api', 'node', ['--import', REG, 'src/main.ts'], ROOT + 'apps/api', { PORT: String(apiPort) });
  const worker = spawnProc('worker', 'node', ['--import', REG, 'src/main.ts'], ROOT + 'apps/worker', { WORKER_BOOTSTRAP: '1', WEB_ALLOWLIST: '', WORKER_METRICS_PORT: String(workerMetricsPort) });
  if (!(await waitFor(`${apiBase}/livez`, 'api', 40))) { cleanup(); process.exit(1); }
  if (!(await waitForApiDatabase())) { emitE2EFailure({ class: 'db', code: 'database_not_ready' }); cleanup(); process.exit(1); }
  await sleep(3000);   // 给 worker 消费循环就绪
  if (worker.exitCode !== null) throw tagE2EFailure('worker', 'worker_exited_before_test');
  if (api.exitCode !== null) throw tagE2EFailure('api', 'api_exited_before_test');
  const workerReady = await fetch(`http://127.0.0.1:${workerMetricsPort}/readyz/worker`).then((r) => r.ok).catch(() => false);
  if (!workerReady) throw tagE2EFailure('worker', 'worker_not_ready');

  console.log(`E2E-UI: 启 web(production next start, :${webPort})…`);
  // 假设 .next 已构建(构建太慢,不在此重建)。next start 直接服务 .next + 静态资源。
  spawnProc('web', 'node', [NEXT_BIN, 'start', '-p', String(webPort)], ROOT + 'apps/web', {
    PORT: String(webPort),
    API_BASE_INTERNAL: apiBase,
    NEXT_PUBLIC_API_BASE: apiBase,
    E2E_UI_STRESS: '1',
  });
  if (!(await waitFor(`${webBase}/`, 'web', 60))) { cleanup(); process.exit(1); }

  console.log('E2E-UI: 跑 Playwright 浏览器用例…');
  // 演示截图是显式采集工序，只写未跟踪临时目录；不能混进可重复、无工作树副作用的验证门。
  const playwrightArgs = ['pnpm', '-C', 'apps/web', 'exec', 'playwright', 'test', '--grep-invert', 'capture README screenshots'];
  // A focused real-browser rerun is useful after a rendering regression. It
  // remains opt-in and cannot broaden the default suite or select tests by an
  // untrusted request value in production (this runner is isolation-gated).
  if (env.E2E_UI_GREP?.trim()) playwrightArgs.push('--grep', env.E2E_UI_GREP.trim());
  if (env.E2E_UI_PROJECT?.trim()) playwrightArgs.push('--project', env.E2E_UI_PROJECT.trim());
  const pw = spawnProc('playwright', 'corepack', playwrightArgs, ROOT, {
    PLAYWRIGHT_BASE_URL: webBase,
    E2E_API_BASE: apiBase,
  }, false);
  pw.stdout.on('data', (d) => process.stdout.write(d));
  pw.stderr.on('data', (d) => process.stderr.write(d));
  const code = await new Promise((res) => pw.on('exit', res));
  if (code !== 0) {
    emitFailureDiagnostics();
    emitE2EFailure({ class: 'frontend', code: 'client_exited' });
  }
  cleanup();
  process.exit(code ?? 1);
}
main().catch((e) => {
  emitFailureDiagnostics();
  emitClassifiedE2EFailure(e, { class: 'frontend', code: 'client_uncaught' });
  cleanup();
  process.exit(1);
});
