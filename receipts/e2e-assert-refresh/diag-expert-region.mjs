/**
 * DIAG-NOT-A-SUITE: 定位 e2e/full.e2e.ts :365-:378 区（:344 后 15 位首行使面·从未在
 * 0154/0155 后行使）class=api 红的确切断言位。先例=receipts/live-rerun-2026-10-11/
 * diag-entitlement-flow.mjs（采证席授权形）。只打印各步实际 status/body，零断言套件、
 * 零收据谎称。LIVE 协议：MODEL_API_KEY 只经 shell loader 注入（本脚本零 .env 读取）；
 * 容器生命周期归 caller（本席 shell 即用即灭）。
 * 状态链最小集：H 主用户 / R recruiter（真 admin approve）/ user2 candidate / 同一 job。
 * 覆盖位：order2 / badSig403 / unknownOrder404 / apply2 幂等 / finalize 409 / finalize strict-DTO 400。
 */
import { spawn } from 'node:child_process';
import { createHmac, randomUUID } from 'node:crypto';

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
  'OSS_ACCESS_KEY_ID', 'OSS_ACCESS_KEY_SECRET', 'OSS_SECURITY_TOKEN',
  'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_SESSION_TOKEN', 'LANGSMITH_API_KEY',
]) delete env[key];
for (const key of Object.keys(env)) if (key.startsWith('LANGFUSE_')) delete env[key];
env.DATABASE_SSL_MODE = 'disable';
env.E2E_ISOLATED = '1';
env.E2E_SKIP_DOTENV = '1';
env.PGHOST = '127.0.0.1';
env.PGUSER = 'meetwise';
env.PGPASSWORD = 'meetwise_dev_password';
env.PGDATABASE = 'meetwise';
env.PGPORT = process.env.DIAG_PGPORT;
const API_PORT = Number(process.env.DIAG_API_PORT ?? 28877);
env.PORT = String(API_PORT);
const BASE = `http://127.0.0.1:${API_PORT}`;
const tag = `diag${Math.floor(process.hrtime()[1] / 1000)}`;

const procs = [];
const api = spawn(process.execPath, ['--import', '@swc-node/register/esm-register', 'src/main.ts'], {
  cwd: ROOT + 'apps/api', env, stdio: ['ignore', 'pipe', 'pipe'],
});
procs.push(api);
api.stderr.on('data', (d) => process.stderr.write(`[api:err] ${d}`));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
for (let i = 0; i < 60; i++) {
  await sleep(1000);
  try { const r = await fetch(`${BASE}/livez`); if (r.ok) break; } catch {}
}
for (let i = 0; i < 60; i++) {
  await sleep(1000);
  try {
    const r = await fetch(`${BASE}/auth/login`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: `e2e-ready-${i}@invalid.test`, password: 'strongpw123' }) });
    if (r.status === 401) break;
  } catch {}
}

const readJson = async (r) => { try { return await r.json(); } catch { return {}; } };
const signup = async (email, role) => {
  const r = await fetch(`${BASE}/auth/signup`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, password: 'strongpw123', ...(role ? { role } : {}) }) });
  return { status: r.status, body: await readJson(r) };
};
const log = (step, v) => console.log(`DIAG ${step}: ${JSON.stringify(v).slice(0, 300)}`);

// seed admin + mint token（run-e2e.mjs C1 同形·AUTH_SECRET 测试键）
const { createRequire } = await import('node:module');
const { Client } = createRequire(new URL('../../packages/db/package.json', import.meta.url))('pg');
const pgc = new Client({ host: '127.0.0.1', port: Number(process.env.DIAG_PGPORT), user: 'meetwise', password: 'meetwise_dev_password', database: 'meetwise', ssl: false, connectionTimeoutMillis: 2000 });
await pgc.connect();
await pgc.query("INSERT INTO user_account(id,email,password_hash,is_admin,role) VALUES ('e2e-admin','e2e-admin@x.com','scrypt$e2e$bootstrap',true,'candidate') ON CONFLICT (id) DO NOTHING");
const nowSec = Math.floor(Date.now() / 1000);
const payload = Buffer.from(JSON.stringify({ uid: 'e2e-admin', exp: nowSec + 3600, pe: 0 })).toString('base64url');
const adminToken = `${payload}.${createHmac('sha256', env.AUTH_SECRET).update(payload).digest('base64url')}`;
await pgc.end();
const AH = { authorization: `Bearer ${adminToken}`, 'content-type': 'application/json' };

const suffix = randomUUID();
const H = (await signup(`diag-main-${tag}@x.com`)).body.token;
const R = (await signup(`diag-rec-${tag}@x.com`, 'recruiter')).body.token;
{
  const q = await fetch(`${BASE}/admin/recruiter-approvals`, { headers: AH });
  const { approvals } = await readJson(q);
  const target = (approvals ?? []).find((a) => a.email === `diag-rec-${tag}@x.com`);
  log('admin-queue-target', { found: Boolean(target), approval_status: target?.approval_status });
  const d = await fetch(`${BASE}/admin/recruiter-approvals/${target.id}/decision`, { method: 'POST', headers: AH, body: JSON.stringify({ decision: 'approve' }) });
  log('admin-approve', { status: d.status, body: await readJson(d) });
}
const HR = { authorization: `Bearer ${R}`, 'content-type': 'application/json' };
const job = await (async () => { const r = await fetch(`${BASE}/recruiter/jobs`, { method: 'POST', headers: HR, body: JSON.stringify({ title: `diag-job-${tag}`, competencies: ['diag'] }) }); return { status: r.status, body: await readJson(r) }; })();
log('job-create', { status: job.status, id: job.body.id });
const jobId = job.body.id;

const user2 = (await signup(`diag-cand-${tag}@x.com`)).body.token;
const H2 = { authorization: `Bearer ${user2}`, 'content-type': 'application/json' };
const apply1 = await (async () => { const r = await fetch(`${BASE}/jobs/${jobId}/apply`, { method: 'POST', headers: H2, body: '{}' }); return { status: r.status, body: await readJson(r) }; })();
log('user2-apply1', { status: apply1.status, applicationId: apply1.body.applicationId });
const applicationId = apply1.body.applicationId;

const app1 = await (async () => { const r = await fetch(`${BASE}/jobs/${jobId}/apply`, { method: 'POST', headers: { authorization: `Bearer ${H}`, 'content-type': 'application/json' }, body: '{}' }); return { status: r.status, body: await readJson(r) }; })();
log('H-apply(app1)', { status: app1.status, applicationId: app1.body.applicationId });

// ── 嫌疑位逐一定位（full.e2e.ts :365-:378 同形）──
const order2 = await (async () => { const r = await fetch(`${BASE}/commerce/orders`, { method: 'POST', headers: { authorization: `Bearer ${H}`, 'content-type': 'application/json', 'idempotency-key': `${tag}:order2` }, body: JSON.stringify({ productId: 'pack_10' }) }); return { status: r.status, body: await readJson(r) }; })();
log('pos:365-order2 (expect 200+orderId)', { status: order2.status, body: order2.body });

{
  const sig = createHmac('sha256', env.PAY_PROVIDER_SECRET).update(`${order2.body.orderId}:t:paid`).digest('hex');
  const bad = await (async () => { const r = await fetch(`${BASE}/commerce/webhook/pay/${order2.body.orderId}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ providerTxn: 't', sig: 'deadbeef' }) }); return { status: r.status, body: await readJson(r) }; })();
  log('pos:367-badSig (expect 403)', { status: bad.status, body: bad.body });
  // 套件 :369 形=paidWebhookSignature('nope','t')=对 unknown 单的【有效】签名（查不到单不入账 404 面）。
  const sigNope = createHmac('sha256', env.PAY_PROVIDER_SECRET).update('nope:t:paid').digest('hex');
  const unknown = await (async () => { const r = await fetch(`${BASE}/commerce/webhook/pay/nope`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ providerTxn: 't', sig: sigNope }) }); return { status: r.status, body: await readJson(r) }; })();
  log('pos:369-unknownOrder-valid-sig (suite expects 404)', { status: unknown.status, body: unknown.body });
}

const apply2 = await (async () => { const r = await fetch(`${BASE}/jobs/${jobId}/apply`, { method: 'POST', headers: H2, body: '{}' }); return { status: r.status, body: await readJson(r) }; })();
log('pos:372-apply2 (expect same applicationId)', { status: apply2.status, applicationId: apply2.body.applicationId, same: apply2.body.applicationId === applicationId });

{
  const f409 = await (async () => { const r = await fetch(`${BASE}/applications/${app1.body.applicationId}/finalize`, { method: 'POST', headers: { authorization: `Bearer ${H}`, 'content-type': 'application/json' }, body: '{}' }); return { status: r.status, body: await readJson(r) }; })();
  log('pos:376-finalize-empty (expect 409)', { status: f409.status, body: f409.body });
  const f400 = await (async () => { const r = await fetch(`${BASE}/applications/${app1.body.applicationId}/finalize`, { method: 'POST', headers: { authorization: `Bearer ${H}`, 'content-type': 'application/json' }, body: JSON.stringify({ interviewId: 'iv_diag_probe' }) }); return { status: r.status, body: await readJson(r) }; })();
  log('pos:378-finalize-smuggled-iv (expect 400)', { status: f400.status, body: f400.body });
}

console.log('DIAG DONE');
for (const p of procs) { try { p.kill('SIGKILL'); } catch {} }
process.exit(0);
