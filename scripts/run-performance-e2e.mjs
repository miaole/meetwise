/**
 * 性能 E2E 启动器：与 HTTP E2E 同样启动真 API/worker，但只跑可重复、无外部模型的 API 并发门。
 * 外部模型或 embedding 的 live benchmark 必须单独运行并记录供应商/网络状态，不能掺进这里。
 */
import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { emitClassifiedE2EFailure, tagE2EFailure } from '../e2e/helpers/failure-class.mjs';
import { assertNoFakeServiceFlags } from './e2e-fake-service-flags.mjs';

const ROOT = new URL('..', import.meta.url).pathname;
const env = {
  ...process.env,
  AUTH_SECRET: process.env.AUTH_SECRET ?? 'e2e-dev-secret-key',
  PAY_PROVIDER_SECRET: process.env.PAY_PROVIDER_SECRET ?? 'e2e-pay-secret',
  RESUME_ENC_KEY: process.env.RESUME_ENC_KEY ?? 'e2e-resume-enc-key',
  RESUME_HASH_SECRET: process.env.RESUME_HASH_SECRET ?? 'e2e-resume-hash-secret',
  RAG_JOB_ROUTE_INPUT_HASH_KEY: process.env.RAG_JOB_ROUTE_INPUT_HASH_KEY ?? 'e2e-rag03-job-route-input-hmac-key-not-production',
};
if (existsSync(ROOT + '.env')) {
  for (const line of readFileSync(ROOT + '.env', 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !env[m[1]]) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
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
  for (const key of Object.keys(env)) if (key.startsWith('LANGFUSE_')) delete env[key];
  env.DATABASE_SSL_MODE = 'disable';
}
if (env.E2E_ISOLATED !== '1') throw tagE2EFailure('capability', 'performance_e2e_isolation_required');
assertNoFakeServiceFlags(env);
const fakeServiceFlags = ['VOICE_FAKE', 'OCR_FAKE', 'E2E_FAKE_MODEL'].filter((name) => {
  const value = String(env[name] ?? '').trim().toLowerCase();
  return value && value !== '0' && value !== 'false';
});
if (fakeServiceFlags.length) throw tagE2EFailure('provider', 'fake_service_mode_forbidden');

// A fixed 8787/19091 pair lets parallel isolated runs attach to another
// runner's API and accidentally report its result.  Keep the process-local
// pair deterministic for diagnostics, permit an explicit pair when needed,
// and pass the base only to the performance client.
const parsePort = (name, fallback) => {
  const value = Number(env[name] ?? fallback);
  if (!Number.isInteger(value) || value < 10_240 || value > 65_534) {
    throw tagE2EFailure('api', 'port_invalid');
  }
  return value;
};
const apiPort = parsePort('E2E_API_PORT', 20_000 + (process.pid % 20_000));
const workerMetricsPort = parsePort('E2E_WORKER_METRICS_PORT', apiPort + 1);
if (apiPort === workerMetricsPort) throw tagE2EFailure('api', 'port_collision');
const apiBase = `http://127.0.0.1:${apiPort}`;

const processes = [];
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const spawnNode = (name, args, cwd = ROOT, extraEnv = {}, forwardOutput = true) => {
  const child = spawn('node', args, { cwd, env: { ...env, ...extraEnv }, stdio: ['ignore', 'pipe', 'pipe'] });
  child.stdout.on('data', (data) => forwardOutput && process.env.E2E_VERBOSE && process.stdout.write(`[${name}] ${data}`));
  child.stderr.on('data', (data) => forwardOutput && process.env.E2E_VERBOSE && process.stderr.write(`[${name}] ${data}`));
  processes.push(child);
  return child;
};
const cleanup = () => { for (const child of processes) { try { child.kill('SIGKILL'); } catch {} } };
process.on('exit', cleanup);
process.on('SIGINT', () => { cleanup(); process.exit(1); });

async function databaseReady() {
  for (let i = 0; i < 60; i++) {
    await sleep(1_000);
    try {
      const r = await fetch(`${apiBase}/auth/login`, {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: `perf-ready-${i}@invalid.test`, password: 'strongpw123' }),
      });
      if (r.status === 401) return true;
    } catch {}
  }
  return false;
}

async function main() {
  console.log('PERF-E2E: 启 API + worker（禁止 fake 服务；该 API 压测不把模型时延计入结果）…');
  const reg = '@swc-node/register/esm-register';
  const api = spawnNode('api', ['--import', reg, 'src/main.ts'], ROOT + 'apps/api', { PORT: String(apiPort) });
  const worker = spawnNode('worker', ['--import', reg, 'src/main.ts'], ROOT + 'apps/worker', { WORKER_BOOTSTRAP: '1', WEB_ALLOWLIST: '', WORKER_METRICS_PORT: String(workerMetricsPort) });
  if (!(await databaseReady())) throw tagE2EFailure('db', 'database_not_ready');
  // HTTP 能访问只说明 API 已监听端口。性能门禁必须同时确认 worker
  // 没有在启动期退出，否则会把残缺栈误报成可用系统。
  await sleep(3_000);
  if (worker.exitCode !== null) throw tagE2EFailure('worker', 'worker_exited_before_test');
  if (api.exitCode !== null) throw tagE2EFailure('api', 'api_exited_before_test');
  const workerReady = await fetch(`http://127.0.0.1:${workerMetricsPort}/readyz/worker`).then((r) => r.ok).catch(() => false);
  if (!workerReady) throw tagE2EFailure('worker', 'worker_not_ready');
  const test = spawnNode('performance', [ROOT + 'node_modules/tsx/dist/cli.mjs', 'e2e/performance.e2e.ts'], ROOT, { E2E_BASE: apiBase }, false);
  test.stdout.on('data', (data) => process.stdout.write(data));
  test.stderr.on('data', (data) => process.stderr.write(data));
  const code = await Promise.race([
    new Promise((resolve) => test.on('exit', resolve)),
    new Promise((resolve) => worker.on('exit', (workerCode) => resolve(`worker_exit:${workerCode ?? 'signal'}`))),
    new Promise((resolve) => api.on('exit', (apiCode) => resolve(`api_exit:${apiCode ?? 'signal'}`))),
  ]);
  if (typeof code === 'string') {
    throw tagE2EFailure(code.startsWith('worker_exit') ? 'worker' : 'api', code.startsWith('worker_exit') ? 'worker_exited_during_test' : 'api_exited_during_test');
  }
  cleanup();
  process.exit(code ?? 1);
}

main().catch((error) => {
  emitClassifiedE2EFailure(error, { class: 'api', code: 'client_uncaught' });
  cleanup();
  process.exit(1);
});
