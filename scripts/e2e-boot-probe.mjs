/**
 * G7P-1 boot-phase probe (REQUEST rev4 @58ec2c34 — ai-docs/delivery/harness/g7p-bootphase-probe.md).
 *
 * 段级时序探针：自管一套与 run-e2e-isolated.mjs 等价的隔离 PG 容器/迁移流程，然后
 * 复刻 run-e2e.mjs 的启动链（api+worker 并发 spawn → /livez → login-401 DB 门 →
 * 3s sleep+exitCode → worker 里程碑 → /readyz/api → 首个业务面 signup），每段一行
 * 机器可读 PROBE_SEGMENT 行。不跑全旅程、不 spawn tsx、零模型调用面。
 *
 * 等价钉死（rev4 §2.1，行号 = 本仓库 scripts/run-e2e-isolated.mjs / scripts/run-e2e.mjs）：
 *   docker run           ≡ run-e2e-isolated.mjs:2370-2378（--rm -d、loopback 随机端口、run_token 注入）
 *   docker port          ≡ run-e2e-isolated.mjs:2380-2383（/127\.0\.0\.1:(\d+)/ 解析）
 *   waitForPostgres      ≡ run-e2e-isolated.mjs:2233-2247（consecutive=3、90 attempts、
 *                          in-container psql + 宿主 SQL 双探——GAP-PRIV-AUTHZ-PROVE-FLAKE 先例）
 *   migrate              ≡ run-e2e-isolated.mjs:2250-2263（2-试恢复：waitForPostgres+500ms+宿主再探）
 *   post-migrate/pre-prove ≡ run-e2e-isolated.mjs:2392-2395 / :2400-2405（consecutive=3 再探 + 容器 Running 核）
 *   baseEnv PG 管道      ≡ run-e2e-isolated.mjs:2052-2063（+ :2037-2049 云凭据剥离）
 *   api+worker spawn     ≡ run-e2e.mjs:119/:124（背靠背并发、cwd=apps/*、--import swc-register、
 *                          PORT / WORKER_BOOTSTRAP+WEB_ALLOWLIST=''+WORKER_METRICS_PORT+E2E_REPORT_FAIL_ALL）
 *   /livez 40×1s         ≡ run-e2e.mjs:127-131（先 sleep 后 fetch）
 *   login-401 DB 门      ≡ run-e2e.mjs:100-112（60×1s、随机不存在账户、仅 401 过门）
 *   3s sleep+exitCode    ≡ run-e2e.mjs:136/:139-140（worker/api_exited_before_test）
 *   /readyz/worker 单发  ≡ run-e2e.mjs:141（本探针另加 worker /livez 里程碑，run-e2e.mjs 无此调用）
 *   /readyz/api          ≡ apps/api/src/modules/health/health.controller.ts:19（实名）
 *
 * EXIT 语义（rev4 §2.3）：EXIT=段号（1..8，fail 与 timeout 均计红）；EXIT=0=全段过；
 * EXIT=9=脚本未捕获崩溃专属码（双保险：EXIT=1 且无任何 PROBE_SEGMENT 行亦=崩溃非段红）。
 * PROBE_SEGMENT 行文法：PROBE_SEGMENT segment=<id> status=<ok|fail|timeout> elapsed_ms=<n> ts=<ISO8601> [detail=...]
 *   status 约定（预注册）：ok=成功；fail=确定性红（命令非零退出/HTTP 应答非预期/进程退出）；
 *   timeout=预算耗尽且从未观察到确定性红（始终无 HTTP 应答/探针全拒）。
 *   探针轮询段附子进程退出早停（仅时序锐化，不改变 run-e2e.mjs 的判定语义）。
 *
 * 已知盲区（rev4 §3·收据必注）：本探针不 spawn tsx——full.e2e.ts 装载段红（import 断链类）
 * 在本探针呈 EXIT 0 绿；wrapper 级前置门（live_provider_key_missing / fake-service flags /
 * port_invalid）不在启动链内，本探针不复刻。
 *
 * 用法：node scripts/e2e-boot-probe.mjs <runLabel>   （runLabel 仅入 PROBE_META/收据，如 A/B）
 */
import { spawn } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { captureBounded } from './bounded-command.mjs';
import { applyLiveE2ECapabilityEnv } from './e2e-live-capability-env.mjs';
import { withheldOutputSummary } from './withheld-output.mjs';

const ROOT = new URL('..', import.meta.url).pathname;
const runLabel = process.argv[2] ?? 'unlabeled';
const container = `meetwise-g7p-probe-${process.pid}-${Date.now()}`;
const LEGACY_PG_IMAGE_DEFAULT = 'pgvector/pgvector:pg16';
const image = process.env.E2E_PG_IMAGE ?? LEGACY_PG_IMAGE_DEFAULT;
const targetToken = randomUUID();
const REG = '@swc-node/register/esm-register';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// —— 宿主 shell 云凭据剥离 + baseEnv PG 管道（≡ run-e2e-isolated.mjs:2037-2063）——
const inheritedEnv = { ...process.env };
for (const key of [
  'DATABASE_URL', 'DATABASE_SSL_MODE', 'DATABASE_SSL_CA_PATH', 'QBANK_CONTROL_DATABASE_URL', 'QBANK_CONTROL_DB_USER', 'QBANK_CONTROL_DB_PASSWORD',
  'REDIS_URL', 'RAG_REDIS_URL', 'RAG_REDIS_TEST_URL', 'RAG_QBANK_CACHE_HASH_KEY',
  'RAG_QBANK_COMPUTE_CACHE_HASH_KEY', 'RAG_QBANK_COMPUTE_CACHE_VALUE_HASH_KEY', 'RAG_JOB_ROUTE_INPUT_HASH_KEY', 'RAG_FREE_TEXT_ROUTE_INPUT_HASH_KEY',
  'OBJECT_STORAGE_ENDPOINT', 'OBJECT_STORAGE_BUCKET', 'OBJECT_STORAGE_ACCESS_KEY', 'OBJECT_STORAGE_SECRET_KEY',
  'OSS_ACCESS_KEY_ID', 'OSS_ACCESS_KEY_SECRET', 'OSS_SECURITY_TOKEN',
  'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_SESSION_TOKEN',
  'MINIO_USER', 'MINIO_PASSWORD', 'LANGSMITH_API_KEY',
  'DASHSCOPE_API_KEY', 'DASHSCOPE_ENDPOINT_PROFILE', 'DASHSCOPE_WORKSPACE_ID',
  'DASHSCOPE_COMPAT_BASE_URL', 'DASHSCOPE_TTS_URL', 'DASHSCOPE_STREAM_URL', 'DASHSCOPE_RERANK_URL',
  'DASHSCOPE_ASR_MODEL', 'DASHSCOPE_TTS_MODEL', 'DASHSCOPE_EMBED_MODEL', 'DASHSCOPE_RERANK_MODEL', 'DASHSCOPE_VISION_MODEL', 'DASHSCOPE_STREAM_ASR_MODEL', 'DASHSCOPE_STREAM_TTS_MODEL',
]) delete inheritedEnv[key];
for (const key of Object.keys(inheritedEnv)) if (key.startsWith('LANGFUSE_')) delete inheritedEnv[key];
const baseEnv = {
  ...inheritedEnv,
  E2E_ISOLATED: '1',
  E2E_TEST_CONTAINER: container,
  E2E_TEST_TARGET_TOKEN: targetToken,
  DATABASE_SSL_MODE: 'disable',
  PGHOST: '127.0.0.1',
  PGUSER: 'meetwise',
  PGPASSWORD: 'meetwise_dev_password',
  PGDATABASE: 'meetwise',
};

// —— 端口推导（≡ run-e2e.mjs:63-71；非法显式端口=操作员面错误→崩溃码 9）——
const parsePort = (name, fallback) => {
  const value = Number(process.env[name] ?? fallback);
  if (!Number.isInteger(value) || value < 10_240 || value > 65_534) throw new Error('probe_port_invalid');
  return value;
};
let apiPort;
let workerMetricsPort;
try {
  apiPort = parsePort('E2E_API_PORT', 20_000 + (process.pid % 20_000));
  workerMetricsPort = parsePort('E2E_WORKER_METRICS_PORT', apiPort + 1);
  if (workerMetricsPort === apiPort) throw new Error('probe_port_collision');
} catch {
  console.error('PROBE_CRASH reason=probe_port_invalid segments_completed=0');
  process.exit(9);
}
const apiBase = `http://127.0.0.1:${apiPort}`;

function capture(command, args, env = baseEnv, cwd = ROOT, timeoutMs = 15_000) {
  return captureBounded(command, args, { cwd, env, timeoutMs });
}

function run(command, args, env = baseEnv) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: ROOT, env, stdio: 'inherit' });
    child.on('error', reject);
    child.on('exit', (code) => resolve(code ?? 1));
  });
}

// —— 宿主 TCP/SQL 再探（≡ run-e2e-isolated.mjs:2192-2202；pg 从 packages/db workspace 解析）——
const HOST_SQL_PROBE = [
  "import { Client } from 'pg';",
  "const client = new Client({ host: process.env.PGHOST, port: Number(process.env.PGPORT), user: process.env.PGUSER, password: process.env.PGPASSWORD, database: process.env.PGDATABASE, ssl: false, connectionTimeoutMillis: 2000 });",
  "try { await client.connect(); await client.query('SELECT 1'); } finally { await client.end().catch(() => undefined); }",
].join(' ');
async function probeHostSql(env) {
  await capture('node', ['--input-type=module', '--eval', HOST_SQL_PROBE], env, `${ROOT}packages/db`, 5_000);
}

async function dockerDiagnostic(args) {
  return captureBounded('docker', args, { cwd: ROOT, env: baseEnv, timeoutMs: 5_000 })
    .catch(() => 'docker_diagnostic_unavailable');
}

// —— PG ready：N 连续（≡ run-e2e-isolated.mjs:2221-2248，语义不弱于 consecutive=3）——
async function waitForPostgres(env, { consecutive = 3, label = 'boot' } = {}) {
  let streak = 0;
  for (let attempt = 0; attempt < 90; attempt++) {
    try {
      await capture('docker', ['exec', container, 'psql', '-v', 'ON_ERROR_STOP=1', '-U', 'meetwise', '-d', 'meetwise', '-Atqc', 'SELECT 1']);
      if (env) await probeHostSql(env);
      streak += 1;
      if (streak >= consecutive) {
        console.log(`E2E_POSTGRES_READY label=${label} consecutive=${streak} attempt=${attempt + 1}`);
        return { ok: true, attempt: attempt + 1 };
      }
    } catch {
      streak = 0;
      await sleep(1_000);
    }
  }
  return { ok: false, attempt: 90 };
}

// —— migrate 2-试恢复（≡ run-e2e-isolated.mjs:2250-2263）——
async function migrateWithRecovery(env) {
  for (let attempt = 1; attempt <= 2; attempt++) {
    const code = await run('pnpm', ['-C', 'packages/db', 'migrate'], env);
    if (code === 0) return { ok: true, attempts: attempt };
    console.error(`ISOLATED_E2E_MIGRATE_ATTEMPT_FAILED attempt=${attempt}/2`);
    if (attempt === 2) return { ok: false, code, attempts: attempt };
    await waitForPostgres(env);
    await sleep(500);
    await probeHostSql(env);
  }
  return { ok: false, code: 1, attempts: 2 };
}

// —— 子进程输出只计块数/字节数（≡ run-e2e.mjs:76-87；E2E_VERBOSE 时前缀回显）——
let api = null;
let worker = null;
const processDiagnostics = new Map();
const spawnErrors = new Map();
const tailAppend = (name, chunk) => {
  const previous = processDiagnostics.get(name) ?? { chunks: 0, bytes: 0 };
  processDiagnostics.set(name, { chunks: previous.chunks + 1, bytes: previous.bytes + Buffer.byteLength(String(chunk)) });
};
function wireChild(name, p) {
  p.stdout?.on('data', (d) => { tailAppend(`${name}:stdout`, d); if (process.env.E2E_VERBOSE) process.stdout.write(`[${name}] ${d}`); });
  p.stderr?.on('data', (d) => { tailAppend(`${name}:stderr`, d); if (process.env.E2E_VERBOSE) process.stderr.write(`[${name}] ${d}`); });
  p.on('error', (e) => { spawnErrors.set(name, e?.code ?? e?.name ?? 'spawn_error'); });
}
function emitFailureDiagnostics() {
  for (const [name, summary] of processDiagnostics) {
    if (summary.bytes > 0) console.error(`E2E_PROCESS_OUTPUT_WITHHELD process=${name} chunks=${summary.chunks} bytes=${summary.bytes}`);
  }
}
async function emitDockerFailureDiagnostic() {
  if (!created) return;
  const [state, logs] = await Promise.all([
    dockerDiagnostic(['inspect', '--format', '{{json .State}}', container]),
    dockerDiagnostic(['logs', '--tail', '80', container]),
  ]);
  console.error(`ISOLATED_POSTGRES_OUTPUT_WITHHELD container=${container} ${withheldOutputSummary('state', state)} ${withheldOutputSummary('logs', logs)}`);
}

// —— api/worker 子进程 env（≡ run-e2e.mjs:14/:16-21/:22-35/:57：测试默认密钥+ .env 不覆盖 + E2E_ISOLATED 剥离）——
function buildChildEnv(env) {
  const child = {
    ...env,
    AUTH_SECRET: env.AUTH_SECRET ?? 'e2e-dev-secret-key',
    PAY_PROVIDER_SECRET: env.PAY_PROVIDER_SECRET ?? 'e2e-pay-secret',
    RESUME_ENC_KEY: env.RESUME_ENC_KEY ?? 'e2e-resume-enc-key',
    RESUME_HASH_SECRET: env.RESUME_HASH_SECRET ?? 'e2e-resume-hash-secret',
    RAG_JOB_ROUTE_INPUT_HASH_KEY: env.RAG_JOB_ROUTE_INPUT_HASH_KEY ?? 'e2e-rag03-job-route-input-hmac-key-not-production',
  };
  if (existsSync(ROOT + '.env')) {
    for (const line of readFileSync(ROOT + '.env', 'utf8').split('\n')) {
      const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
      if (m && !child[m[1]]) child[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
  for (const key of [
    'DATABASE_URL', 'DATABASE_SSL_CA_PATH', 'QBANK_CONTROL_DATABASE_URL', 'QBANK_CONTROL_DB_USER', 'QBANK_CONTROL_DB_PASSWORD', 'REDIS_URL', 'RAG_REDIS_URL', 'RAG_REDIS_TEST_URL', 'RAG_QBANK_CACHE_HASH_KEY',
    'OBJECT_STORAGE_ENDPOINT', 'OBJECT_STORAGE_BUCKET', 'OBJECT_STORAGE_ACCESS_KEY', 'OBJECT_STORAGE_SECRET_KEY',
    'OSS_ACCESS_KEY_ID', 'OSS_ACCESS_KEY_SECRET', 'OSS_SECURITY_TOKEN',
    'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_SESSION_TOKEN',
    'LANGSMITH_API_KEY',
  ]) delete child[key];
  for (const key of Object.keys(child)) if (key.startsWith('LANGFUSE_')) delete child[key];
  child.DATABASE_SSL_MODE = 'disable';
  applyLiveE2ECapabilityEnv(child);
  return child;
}

// 单发 fetch 的 fail/timeout 判：信号超时=timeout（预算内无应答）；连接类错误=fail（确定性拒达）。
function classifyFetchError(e, label) {
  if (e?.name === 'TimeoutError' || e?.name === 'AbortError') return { status: 'timeout', detail: `${label}:no_response_within_bound` };
  return { status: 'fail', detail: `${label}:err=${e?.code ?? e?.name ?? 'unknown'}` };
}

// ============ 八段探针（rev4 §2.2 段序） ============
let created = false;
let pgEnv = null;

async function segProbePg() {
  try {
    await capture('docker', [
      'run', '--rm', '-d', '--name', container,
      '-e', 'POSTGRES_USER=meetwise',
      '-e', 'POSTGRES_PASSWORD=meetwise_dev_password',
      '-e', 'POSTGRES_DB=meetwise',
      '-p', '127.0.0.1::5432', image,
      'postgres', '-c', `meetwise.e2e_run_token=${targetToken}`,
    ], baseEnv, ROOT, 120_000);
  } catch (e) {
    return { status: 'fail', detail: `docker_run:${e?.code ?? e?.name ?? 'unknown'}` };
  }
  created = true;
  let portOutput;
  try {
    portOutput = await capture('docker', ['port', container, '5432/tcp'], baseEnv, ROOT, 10_000);
  } catch (e) {
    return { status: 'fail', detail: `docker_port:${e?.code ?? e?.name ?? 'unknown'}` };
  }
  const match = String(portOutput).match(/127\.0\.0\.1:(\d+)/);
  if (!match) return { status: 'fail', detail: 'isolated_postgres_port_unparseable' };
  pgEnv = { ...baseEnv, PGPORT: match[1] };
  console.log(`E2E isolated PostgreSQL: ${container} on 127.0.0.1:${pgEnv.PGPORT}`);
  const r = await waitForPostgres(pgEnv);
  if (!r.ok) return { status: 'timeout', detail: 'isolated_postgres_database_not_ready:boot' };
  return { status: 'ok', detail: `pg_port=${pgEnv.PGPORT},ready_attempt=${r.attempt}` };
}

async function segProbeMigrate() {
  const mig = await migrateWithRecovery(pgEnv);
  if (!mig.ok) return { status: 'fail', detail: `isolated_e2e_migrate_failed:code=${mig.code},attempts=${mig.attempts}` };
  const post = await waitForPostgres(pgEnv, { consecutive: 3, label: 'post-migrate' });
  if (!post.ok) return { status: 'timeout', detail: 'isolated_postgres_database_not_ready:post-migrate' };
  const still = await capture('docker', ['inspect', '--format', '{{.State.Running}}', container], baseEnv, ROOT, 5_000).catch(() => 'false');
  if (String(still).trim() !== 'true') return { status: 'fail', detail: `isolated_postgres_container_not_running_before_prove:${String(still).trim()}` };
  const pre = await waitForPostgres(pgEnv, { consecutive: 3, label: 'pre-prove' });
  if (!pre.ok) return { status: 'timeout', detail: 'isolated_postgres_database_not_ready:pre-prove' };
  return { status: 'ok', detail: `migrate_attempts=${mig.attempts},post_migrate_attempt=${post.attempt},pre_prove_attempt=${pre.attempt}` };
}

async function segProbeSpawn() {
  const childEnv = buildChildEnv(pgEnv);
  // 背靠背并发 spawn（≡ run-e2e.mjs:119/:124——两 spawn 之间零 await）。
  api = spawn('node', ['--import', REG, 'src/main.ts'], { cwd: ROOT + 'apps/api', env: { ...childEnv, PORT: String(apiPort) }, stdio: ['ignore', 'pipe', 'pipe'] });
  worker = spawn('node', ['--import', REG, 'src/main.ts'], { cwd: ROOT + 'apps/worker', env: { ...childEnv, WORKER_BOOTSTRAP: '1', WEB_ALLOWLIST: '', WORKER_METRICS_PORT: String(workerMetricsPort), E2E_REPORT_FAIL_ALL: '1' }, stdio: ['ignore', 'pipe', 'pipe'] });
  wireChild('api', api);
  wireChild('worker', worker);
  await sleep(500); // 仅捕获同步 spawn 错误/即刻退出；更晚的死亡由段 4-6 捕获。
  if (spawnErrors.size) return { status: 'fail', detail: [...spawnErrors].map(([n, c]) => `spawn_error:${n}:${c}`).join('+') };
  if (api.exitCode !== null) return { status: 'fail', detail: `early_exit:api:code=${api.exitCode}` };
  if (worker.exitCode !== null) return { status: 'fail', detail: `early_exit:worker:code=${worker.exitCode}` };
  return { status: 'ok', detail: `api_pid=${api.pid},worker_pid=${worker.pid},mode=back-to-back` };
}

async function segProbeApiLivez() {
  let httpSeen = false;
  for (let i = 0; i < 40; i++) {
    await sleep(1000);
    if (api.exitCode !== null) return { status: 'fail', detail: `api_exited_during_livez_poll:code=${api.exitCode}` };
    try {
      const r = await fetch(`${apiBase}/livez`, { signal: AbortSignal.timeout(5_000) });
      httpSeen = true;
      if (r.ok) return { status: 'ok', detail: `first_200_attempt=${i + 1}` };
    } catch { /* api still booting */ }
  }
  return httpSeen ? { status: 'fail', detail: 'livez_http_non_ok_after_40_polls' } : { status: 'timeout', detail: 'livez_no_response_after_40_polls' };
}

async function segProbeDbGate() {
  let lastStatus = null;
  for (let i = 0; i < 60; i++) {
    await sleep(1000);
    if (api.exitCode !== null) return { status: 'fail', detail: `api_exited_during_db_gate:code=${api.exitCode}` };
    try {
      const r = await fetch(`${apiBase}/auth/login`, {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: `e2e-ready-${i}@invalid.test`, password: 'strongpw123' }),
        signal: AbortSignal.timeout(5_000),
      });
      lastStatus = r.status;
      if (r.status === 401) return { status: 'ok', detail: `login_401_attempt=${i + 1}` };
    } catch { /* API/DB still booting */ }
  }
  return lastStatus !== null ? { status: 'fail', detail: `db_gate_last_http_status=${lastStatus}` } : { status: 'timeout', detail: 'db_gate_no_http_after_60_polls' };
}

async function segProbeExitCheck() {
  await sleep(3000); // ≡ run-e2e.mjs:136 给 worker 消费循环就绪
  if (worker.exitCode !== null) return { status: 'fail', detail: `worker_exited_before_test:code=${worker.exitCode}` };
  if (api.exitCode !== null) return { status: 'fail', detail: `api_exited_before_test:code=${api.exitCode}` };
  try {
    const r = await fetch(`http://127.0.0.1:${workerMetricsPort}/livez`, { signal: AbortSignal.timeout(10_000) });
    if (!r.ok) return { status: 'fail', detail: `worker_livez_http=${r.status}` };
  } catch (e) {
    return classifyFetchError(e, 'worker_livez');
  }
  try {
    const r = await fetch(`http://127.0.0.1:${workerMetricsPort}/readyz/worker`, { signal: AbortSignal.timeout(10_000) });
    if (!r.ok) return { status: 'fail', detail: `worker_not_ready:http=${r.status}` };
  } catch (e) {
    return classifyFetchError(e, 'worker_readyz');
  }
  return { status: 'ok', detail: 'api_exit=null,worker_exit=null,worker_livez=ok,readyz_worker=ok' };
}

async function segProbeApiReadyz() {
  let lastStatus = null;
  for (let i = 0; i < 10; i++) { // probe-local 预算（/readyz/api 不在 run-e2e.mjs 链内，取温和 10×1s）
    await sleep(1000);
    if (api.exitCode !== null) return { status: 'fail', detail: `api_exited_during_readyz_poll:code=${api.exitCode}` };
    try {
      const r = await fetch(`${apiBase}/readyz/api`, { signal: AbortSignal.timeout(5_000) });
      lastStatus = r.status;
      if (r.ok) return { status: 'ok', detail: `readyz_api_200_attempt=${i + 1}` };
    } catch { /* api not answering yet */ }
  }
  return lastStatus !== null ? { status: 'fail', detail: `readyz_api_last_http=${lastStatus}` } : { status: 'timeout', detail: 'readyz_api_no_response_after_10_polls' };
}

async function segProbeFirstSignup() {
  const email = `g7p1-probe-${runLabel}-${process.pid}-${Date.now()}@invalid.test`;
  try {
    const r = await fetch(`${apiBase}/auth/signup`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password: 'strongpw123' }),
      signal: AbortSignal.timeout(15_000),
    });
    if (r.status === 200) {
      let tokenPresent = false;
      try { const j = await r.json(); tokenPresent = typeof j?.token === 'string' && j.token.length > 0; } catch { /* body 非契约面 */ }
      return { status: 'ok', detail: `signup_http=200,token_present=${tokenPresent}` };
    }
    return { status: 'fail', detail: `signup_http=${r.status}` };
  } catch (e) {
    return classifyFetchError(e, 'signup');
  }
}

// ============ 段执行器 + 收尾 ============
const SEGMENTS = [
  { id: 'probe_pg_1', exit: 1, fn: segProbePg },
  { id: 'probe_migrate_2', exit: 2, fn: segProbeMigrate },
  { id: 'probe_spawn_3', exit: 3, fn: segProbeSpawn },
  { id: 'probe_api_livez_4', exit: 4, fn: segProbeApiLivez },
  { id: 'probe_db_gate_5', exit: 5, fn: segProbeDbGate },
  { id: 'probe_exit_check_6', exit: 6, fn: segProbeExitCheck },
  { id: 'probe_api_readyz_7', exit: 7, fn: segProbeApiReadyz },
  { id: 'probe_first_signup_8', exit: 8, fn: segProbeFirstSignup },
];

const segmentRecords = [];
const runStart = Date.now();

function cleanup() {
  for (const p of [api, worker]) {
    if (p && p.exitCode === null) { try { p.kill('SIGKILL'); } catch { /* already gone */ } }
  }
}
process.on('exit', cleanup);
process.on('SIGINT', () => { cleanup(); process.exit(130); });

async function finalize(exitCode, crashReason) {
  const totalMs = Date.now() - runStart;
  if (crashReason) console.error(`PROBE_CRASH reason=${crashReason} segments_completed=${segmentRecords.length}`);
  if (exitCode !== 0) {
    emitFailureDiagnostics();
    await emitDockerFailureDiagnostic();
  }
  const parts = segmentRecords.map((r) => `${r.id}:${r.status}:${r.elapsedMs}ms`);
  console.log(`PROBE_SUMMARY exit=${exitCode} total_ms=${totalMs} segments_completed=${segmentRecords.length}${parts.length ? ` segment_parts=${parts.join(',')}` : ''}`);
  if (created) await capture('docker', ['rm', '-f', container]).catch(() => {});
  cleanup();
  process.exit(exitCode);
}

process.on('uncaughtException', (e) => { finalize(9, `${e?.name ?? 'Error'}${e?.code ? ':' + e.code : ''}`); });
process.on('unhandledRejection', (e) => { finalize(9, `${e?.name ?? 'Error'}${e?.code ? ':' + e.code : ''}`); });

async function main() {
  const selfPath = new URL(import.meta.url).pathname;
  const digest = createHash('sha256').update(readFileSync(selfPath)).digest('hex');
  console.log(`PROBE_SCRIPT_SHA256 path=scripts/e2e-boot-probe.mjs sha256=${digest}`);
  console.log(`PROBE_META label=${runLabel} pid=${process.pid} ts=${new Date().toISOString()} container=${container} image=${image} api_port=${apiPort} worker_metrics_port=${workerMetricsPort} node=${process.version}`);
  for (const seg of SEGMENTS) {
    const t0 = Date.now();
    let res;
    try {
      res = await seg.fn();
    } catch (e) {
      res = { status: 'fail', detail: `segment_throw:${e?.code ?? e?.name ?? 'unknown'}` };
    }
    const elapsed = Date.now() - t0;
    const line = `PROBE_SEGMENT segment=${seg.id} status=${res.status} elapsed_ms=${elapsed} ts=${new Date().toISOString()}${res.detail ? ` detail=${res.detail}` : ''}`;
    console.log(line);
    segmentRecords.push({ id: seg.id, status: res.status, elapsedMs: elapsed, detail: res.detail ?? null });
    if (res.status !== 'ok') await finalize(seg.exit, null);
  }
  await finalize(0, null);
}

main().catch((e) => finalize(9, `${e?.name ?? 'Error'}${e?.code ? ':' + e.code : ''}`));
