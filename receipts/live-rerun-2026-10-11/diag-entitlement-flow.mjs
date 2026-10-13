/**
 * DIAG-NOT-A-SUITE: reproduces e2e/full.e2e.ts:332-345 flow (no-entitlement begin)
 * against a caller-provided disposable stack and prints ACTUAL status/body per step.
 * Env shape mirrors scripts/run-e2e.mjs (loader protocol: no .env load).
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
for (const key of [
  'DATABASE_URL', 'DATABASE_SSL_CA_PATH', 'QBANK_CONTROL_DATABASE_URL', 'QBANK_CONTROL_DB_USER', 'QBANK_CONTROL_DB_PASSWORD', 'REDIS_URL', 'RAG_REDIS_URL', 'RAG_REDIS_TEST_URL', 'RAG_QBANK_CACHE_HASH_KEY',
  'OBJECT_STORAGE_ENDPOINT', 'OBJECT_STORAGE_BUCKET', 'OBJECT_STORAGE_ACCESS_KEY', 'OBJECT_STORAGE_SECRET_KEY',
  'OSS_ACCESS_KEY_ID', 'OSS_ACCESS_KEY_SECRET', 'OSS_SECURITY_TOKEN', 'LANGSMITH_API_KEY',
]) delete env[key];
for (const key of Object.keys(env)) if (key.startsWith('LANGFUSE_')) delete env[key];
env.DATABASE_SSL_MODE = 'disable';
env.E2E_ISOLATED = '1';
env.PGHOST = '127.0.0.1';
env.PGUSER = 'meetwise';
env.PGPASSWORD = 'meetwise_dev_password';
env.PGDATABASE = 'meetwise';
env.PGPORT = process.env.DIAG_PGPORT;
const PORT = process.env.DIAG_METRICS_PORT;
env.PORT = PORT;

const REG = '@swc-node/register/esm-register';
const procs = [];
const spawnApp = (cwd, name) => {
  const p = spawn(process.execPath, ['--import', REG, 'src/main.ts'], { cwd, env, stdio: ['ignore', 'pipe', 'pipe'] });
  p.stdout.on('data', () => {});
  p.stderr.on('data', (d) => process.stderr.write(`[${name}:err] ${d}`));
  procs.push(p);
  return p;
};
const api = spawnApp(ROOT + 'apps/api', 'api');
spawnApp(ROOT + 'apps/worker', 'worker');
const BASE = `http://127.0.0.1:${PORT}`;
const t0 = Date.now();

const waitApi = async () => {
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    try { const r = await fetch(`${BASE}/livez`); if (r.ok) return true; } catch {}
  }
  return false;
};
const waitDb = async () => {
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    try {
      const r = await fetch(`${BASE}/auth/login`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: `e2e-ready-${i}@invalid.test`, password: 'strongpw123' }) });
      if (r.status === 401) return true;
    } catch {}
  }
  return false;
};
const j = (h, extra = {}) => ({ 'content-type': 'application/json', ...h, ...extra });
const show = async (label, res) => {
  const body = await res.text();
  console.log(`[diag] ${label} -> ${res.status} ${body.slice(0, 400)}`);
  return body;
};

(async () => {
  if (!(await waitApi())) { console.log('[diag] api never livez'); process.exit(1); }
  console.log(`[diag] api livez ok at ${Date.now() - t0}ms`);
  if (!(await waitDb())) { console.log('[diag] db never ready (login 401 probe)'); process.exit(1); }
  await new Promise((r) => setTimeout(r, 3000));

  const email = `e2e3_diag${Date.now()}@x.com`;
  const password = 'strongpw123';
  let res = await fetch(`${BASE}/auth/signup`, { method: 'POST', headers: j(), body: JSON.stringify({ email, password }) });
  let body = await show('signup', res);
  let tok;
  try { tok = JSON.parse(body).token ?? JSON.parse(body).accessToken ?? null; } catch { tok = null; }
  if (!tok && res.status !== 200) {
    res = await fetch(`${BASE}/auth/login`, { method: 'POST', headers: j(), body: JSON.stringify({ email, password }) });
    body = await show('login', res);
    try { tok = JSON.parse(body).token ?? JSON.parse(body).accessToken ?? null; } catch { tok = null; }
  }
  if (!tok) { console.log('[diag] no token; abort'); process.exit(1); }
  const H = { authorization: `Bearer ${tok}` };

  res = await fetch(`${BASE}/privacy/consent`, { method: 'POST', headers: j(H), body: JSON.stringify({ purpose: 'resume_processing' }) });
  await show('consent', res);
  res = await fetch(`${BASE}/resume`, { method: 'POST', headers: j(H), body: JSON.stringify({ text: '合成后端工程师简历：三年分布式系统经验，熟悉 PostgreSQL、Redis、限流与消息队列。' }) });
  body = await show('resume upload', res);
  let resumeId; try { resumeId = JSON.parse(body).resumeId; } catch {}
  res = await fetch(`${BASE}/interview`, { method: 'POST', headers: j(H), body: '{}' });
  body = await show('interview create', res);
  let iv; try { iv = JSON.parse(body).interviewId; } catch {}
  if (!iv) { console.log('[diag] no interviewId; abort'); process.exit(1); }
  res = await fetch(`${BASE}/interview/${iv}/begin`, { method: 'POST', headers: j(H, { 'resume-id': resumeId ?? '' }), body: '{}' });
  await show('INTERVIEW BEGIN (assertion expects 402 insufficient_entitlement)', res);
  process.exitCode = 0;
})().finally(() => { for (const p of procs) { try { p.kill('SIGKILL'); } catch {} } });
