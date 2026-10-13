/**
 * DIAG-NOT-A-SUITE: boots the worker exactly like scripts/run-e2e.mjs does
 * (same env shape: shell -> .env non-overriding -> isolated deletions -> defaults),
 * against a caller-provided disposable PG, prints the worker's raw stdout/stderr,
 * polls /readyz/worker, then kills the child. No assertions, no receipts written
 * by the suite, no container lifecycle here (caller owns the container).
 */
import { spawn } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';

const ROOT = new URL('../../', import.meta.url).pathname;
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
for (const key of [
  'DATABASE_URL', 'DATABASE_SSL_CA_PATH', 'QBANK_CONTROL_DATABASE_URL', 'QBANK_CONTROL_DB_USER', 'QBANK_CONTROL_DB_PASSWORD', 'REDIS_URL', 'RAG_REDIS_URL', 'RAG_REDIS_TEST_URL', 'RAG_QBANK_CACHE_HASH_KEY',
  'OBJECT_STORAGE_ENDPOINT', 'OBJECT_STORAGE_BUCKET', 'OBJECT_STORAGE_ACCESS_KEY', 'OBJECT_STORAGE_SECRET_KEY',
  'OSS_ACCESS_KEY_ID', 'OSS_ACCESS_KEY_SECRET', 'OSS_SECURITY_TOKEN',
  'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_SESSION_TOKEN',
  'LANGSMITH_API_KEY',
]) delete env[key];
for (const key of Object.keys(env)) if (key.startsWith('LANGFUSE_')) delete env[key];
env.DATABASE_SSL_MODE = 'disable';
env.E2E_ISOLATED = '1';
env.PGHOST = '127.0.0.1';
env.PGUSER = 'meetwise';
env.PGPASSWORD = 'meetwise_dev_password';
env.PGDATABASE = 'meetwise';
env.PGPORT = process.env.DIAG_PGPORT;
env.WORKER_BOOTSTRAP = '1';
env.WEB_ALLOWLIST = '';
env.WORKER_METRICS_PORT = process.env.DIAG_METRICS_PORT;
env.E2E_REPORT_FAIL_ALL = '1';

const child = spawn(process.execPath, ['--import', '@swc-node/register/esm-register', 'src/main.ts'], {
  cwd: ROOT + 'apps/worker', env, stdio: ['ignore', 'pipe', 'pipe'],
});
const t0 = Date.now();
child.stdout.on('data', (d) => process.stdout.write(`[worker ${Date.now() - t0}ms] ${d}`));
child.stderr.on('data', (d) => process.stderr.write(`[worker:err ${Date.now() - t0}ms] ${d}`));
child.on('exit', (code, sig) => { console.log(`[diag] worker exit code=${code} sig=${sig} at ${Date.now() - t0}ms`); process.exit(0); });

let readySeen = false;
const poll = setInterval(async () => {
  try {
    const r = await fetch(`http://127.0.0.1:${env.WORKER_METRICS_PORT}/readyz/worker`);
    const body = await r.text();
    console.log(`[diag] readyz/worker -> ${r.status} ${body.trim()} at ${Date.now() - t0}ms`);
    if (r.ok) readySeen = true;
  } catch { /* not up yet */ }
}, 3000);
setTimeout(() => {
  clearInterval(poll);
  console.log(`[diag] diag window over readySeen=${readySeen}; killing worker`);
  try { child.kill('SIGKILL'); } catch {}
}, Number(process.env.DIAG_WINDOW_MS ?? 45000));
