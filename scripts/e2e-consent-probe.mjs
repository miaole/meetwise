/**
 * G7P-3 consent 端点定靶探针（REQUEST rev2 @d0549c20 — ai-docs/delivery/harness/g7p3-consent-probe.md）。
 *
 * 目标：拿 POST /privacy/consent 的精确 HTTP status + response body + 耗时（三元组），切红因
 * （预注册五向：5xx→DB 层 / 4xx→契约面 / fetch-throw→keep-alive 连接层 / 200 双 run→上下文差 /
 * 间歇→状态依赖+冷热敏感）。零产品码·零 wrapper 改·helpers 只读复用（auth.ts/resume.ts 形态
 * 探针内自实现，不打扰 helpers 本体）。
 *
 * 蓝本：G7P-1 scripts/e2e-boot-probe.mjs blob d6cdce7f（commit 7b8eb37c·钉收据）——环境段逐块
 * 复刻（容器/迁移/spawn/livez/login-401 DB 门/worker 里程碑/readyz）。蓝本行号引用为其分支
 * 快照锚；本分支（主线 94650e43 后）现行锚如下（内容等价·已亲核）：
 *   云凭据剥离+baseEnv PG 管道 ≡ scripts/run-e2e-isolated.mjs:2121-2149（蓝本引 2037-2063）
 *   waitForPostgres consecutive=3 ≡ scripts/run-e2e-isolated.mjs:2307-2330（蓝本引 2221-2248）
 *   migrate 2-试恢复            ≡ scripts/run-e2e-isolated.mjs:2336-2350（蓝本引 2250-2263）
 *   post-migrate/pre-probe 再探 ≡ scripts/run-e2e-isolated.mjs:2483/:2494（蓝本引 2392-2405）
 *   docker run/端口解析         ≡ scripts/run-e2e-isolated.mjs:2457-2472（蓝本引 2370-2383）
 *   api+worker spawn            ≡ scripts/run-e2e.mjs:119/:124（现行一致）
 *   /livez 40×1s                ≡ scripts/run-e2e.mjs:127-131（现行一致）
 *   login-401 DB 门             ≡ scripts/run-e2e.mjs:100-112（现行一致）
 *   3s sleep+exitCode+readyz    ≡ scripts/run-e2e.mjs:136/:139-140/:141（现行一致）
 *
 * 五段（rev2 §2）：
 *   probe_env_1             等价环境整段（蓝本段 1-7 收拢为一段；红时 detail 以 env_face:<子面> 定位）
 *   probe_signup_2          signupOrLogin 同式自实现（e2e/helpers/auth.ts:35-49 形态：signup 非 200
 *                           落 login·200+token 才算过·不造 token）
 *   probe_consent_post_3    POST /privacy/consent body {purpose:'resume_processing'}
 *                           （e2e/helpers/resume.ts:12-19 同式）——打印精确 status+body+elapsed
 *   probe_consent_status_4  GET /privacy/consent 状态对照·无条件照跑
 *   probe_repost_5          条件段：段 3 呈 4xx/5xx/throw 时复打一次（状态依赖探测）；条件未中=skipped
 *
 * EXIT 语义（rev2 §2·显式覆写 G7P-1 早退）：EXIT=首个红段号（1-5·fail 与 timeout 均计红·
 * skipped 不计红）；EXIT=0=无红段；EXIT=9=脚本未捕获崩溃专属码（含 120s 挂死界 watchdog 触发=
 * 崩溃类·预注册）。【consent 红≠早退】段 3 红后续行：段 4 无条件照跑·段 5 条件照跑·段行全打印·
 * 首红为准（后续段行供判读）。段 1/2 红仍沿 G7P-1 早退语义：段 1 红=无 api 可探·段 2 红=无
 * token 面（探针改打无鉴权面会离开红面·污染判读）——非 consent 红·不在覆写范围。
 * PROBE_SEGMENT 行文法：PROBE_SEGMENT segment=<id> status=<ok|fail|timeout|skipped> elapsed_ms=<n>
 * ts=<ISO8601> [detail=...]（skipped=probe-local 扩充值·条件未中·不计红·收据注明）。
 *
 * fetch 预算（rev2 §3 预注册）：业务面 fetch（signup/login/consent POST/GET/repost）每发 30s
 * 超时预算（AbortSignal.timeout(30_000)·超→status=timeout）；环境门轮询 fetch（livez/login 门）
 * 沿蓝本 5s/发（1s 节拍轮询的封顶·非业务面）。挂死界 watchdog：120s 无进展即 finalize(9)（沿
 * G7P-2 watchdog 形态·进程内可重置实现——喂狗点=段边界/环境子步/PG 就绪每试/migrate 每输出块/
 * 每次 fetch 完成；外杀需 wrapper 改动被 Ban·残留盲区见下）。
 *
 * MODEL_API_KEY 面（rev2 §3·复刻红面）：红环境（full.e2e 经 run-e2e.mjs:43 门）MODEL_API_KEY
 * 必为 set；G7P-1 探针为 unset（G7P-1↔红环境唯一实测登记差）。本探针按 loader 面 set 复刻：
 * KEY 只经进程 env 注入（调用侧 export·不落盘不回显）→inheritedEnv 透传（剥离清单不含
 * MODEL_API_KEY）→buildChildEnv（.env 不覆盖已 set 值·蓝本同式）→applyLiveE2ECapabilityEnv
 * （key set+profile unset→pin dashscope-cn-beijing·loader 同行为）。PROBE_META 仅记 name-only
 * 面 model_api_key=set|unset——任何输出不回显 KEY 值。est 0 live：consent/signup 链零模型面已实证。
 *
 * 已知盲区（收据必注）：(1) 与 full.e2e 上下文差——email 生成策略（本探针每 run 全新
 * `g7p3-consent-*` 邮箱=纯 signup 面 vs full.e2e `e2e_<tag>@x.com` 标签邮箱重跑落 login 面）、
 * 无 tsx 装载段、undici 连接池使用史不同（full.e2e 在 consent 前已有同池多请求）；200 双 run
 * 判读即落此向。(2) 段 5 条件严格限 4xx/5xx/throw（timeout 不复打·预算已尽·预注册）。(3) 进程内
 * watchdog 对事件环真冻结（同步死循环类）无能为力——该形态需外杀（wrapper 改动 Ban·沿 G7P-2
 * 外部 watchdog 才覆盖）。
 *
 * 用法：node scripts/e2e-consent-probe.mjs <runLabel>   （runLabel 仅入 PROBE_META/收据，如 A/B）
 */
import { spawn } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { captureBounded } from './bounded-command.mjs';
import { applyLiveE2ECapabilityEnv } from './e2e-live-capability-env.mjs';
import { withheldOutputSummary } from './withheld-output.mjs';

const ROOT = new URL('..', import.meta.url).pathname;
const runLabel = process.argv[2] ?? 'unlabeled';
const container = `meetwise-g7p3-consent-${process.pid}-${Date.now()}`;
const LEGACY_PG_IMAGE_DEFAULT = 'pgvector/pgvector:pg16';
const image = process.env.E2E_PG_IMAGE ?? LEGACY_PG_IMAGE_DEFAULT;
const targetToken = randomUUID();
const REG = '@swc-node/register/esm-register';
const FETCH_BUDGET_MS = 30_000; // rev2 §3 预注册：业务面每 fetch 30s 超时预算
const WATCHDOG_BOUNDARY_MS = 120_000; // rev2 §3 预注册：120s 无进展挂死界（G7P-2 形态）
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// —— 宿主 shell 云凭据剥离 + baseEnv PG 管道（≡ run-e2e-isolated.mjs:2121-2149；MODEL_API_KEY 不在剥离清单=loader 透传红面）——
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

// —— 宿主 TCP/SQL 再探（≡ run-e2e-isolated.mjs:2192-2202 现行同式；pg 从 packages/db workspace 解析）——
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

// —— PG ready：N 连续（≡ run-e2e-isolated.mjs:2307-2330，语义不弱于 consecutive=3）——
async function waitForPostgres(env, { consecutive = 3, label = 'boot' } = {}) {
  let streak = 0;
  for (let attempt = 0; attempt < 90; attempt++) {
    feedWatchdog(`pg_wait:${label}:attempt_${attempt + 1}`); // 每试喂狗：合法重试轮不触 120s 界
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

// —— migrate 子进程：stdio 管道化前传（输出可见性≡run-e2e-isolated.mjs 继承式）·每输出块喂狗（有输出=有进展·静默无退出=挂死界可触）——
function runMigrateFeed(env) {
  return new Promise((resolve, reject) => {
    const child = spawn('pnpm', ['-C', 'packages/db', 'migrate'], { cwd: ROOT, env, stdio: ['ignore', 'pipe', 'pipe'] });
    child.stdout?.on('data', (d) => { feedWatchdog('migrate:stdout'); process.stdout.write(d); });
    child.stderr?.on('data', (d) => { feedWatchdog('migrate:stderr'); process.stderr.write(d); });
    child.on('error', reject);
    child.on('exit', (code) => { feedWatchdog('migrate:exit'); resolve(code ?? 1); });
  });
}

// —— migrate 2-试恢复（≡ run-e2e-isolated.mjs:2336-2350）——
async function migrateWithRecovery(env) {
  for (let attempt = 1; attempt <= 2; attempt++) {
    feedWatchdog(`migrate:attempt_${attempt}_spawn`);
    const code = await runMigrateFeed(env);
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

// —— 120s 无进展挂死界 watchdog（rev2 §3 预注册·G7P-2 形态进程内适配：每段边界/子步/每次 fetch 完成喂狗）——
let watchdogTimer = null;
let watchdogWhere = 'pre_main';
let finalized = false;
function feedWatchdog(where) {
  watchdogWhere = where;
  if (watchdogTimer) clearTimeout(watchdogTimer);
  watchdogTimer = setTimeout(() => {
    console.error(`PROBE_WATCHDOG boundary_ms=${WATCHDOG_BOUNDARY_MS} stuck_at=${watchdogWhere} ts=${new Date().toISOString()}`);
    finalize(9, `watchdog_hang:no_progress_${WATCHDOG_BOUNDARY_MS}ms_at_${watchdogWhere}`);
  }, WATCHDOG_BOUNDARY_MS);
}

// 业务面单发 fetch（30s 预算·精确三元组捕获）：应答→{kind:'http',status,bodyText,ms}；超时→timeout；其余 throw→err 面。
async function probeFetch(label, path, init = {}) {
  const t0 = Date.now();
  feedWatchdog(`fetch:${label}`);
  try {
    const response = await fetch(`${apiBase}${path}`, { ...init, signal: AbortSignal.timeout(FETCH_BUDGET_MS) });
    const bodyText = await response.text().catch(() => '<body_unreadable>');
    feedWatchdog(`fetch:${label}:done`);
    return { kind: 'http', status: response.status, bodyText, ms: Date.now() - t0 };
  } catch (e) {
    feedWatchdog(`fetch:${label}:threw`);
    return { kind: 'err', errName: e?.name ?? 'unknown', errCode: e?.code ?? null, ms: Date.now() - t0 };
  }
}
function classifyProbeFetch(r, label) {
  if (r.kind === 'http') return { status: 'ok', httpStatus: r.status, ...r };
  if (r.errName === 'TimeoutError' || r.errName === 'AbortError') return { status: 'timeout', detail: `${label}:no_response_within_${FETCH_BUDGET_MS}ms` };
  return { status: 'fail', detail: `segment_throw:${label}:err=${r.errCode ?? r.errName}` };
}
// body 单行化（≤400 字符截断·三元组打印用）
function bodyOneLine(bodyText) {
  const flat = String(bodyText ?? '').replace(/\s+/g, ' ').trim();
  const single = JSON.stringify(flat.length > 400 ? `${flat.slice(0, 400)}…<truncated>` : flat);
  return single === '' ? '""' : single;
}
function printConsentTriple(op, r) {
  if (r.kind === 'http') {
    console.log(`PROBE_CONSENT op=${op} status=${r.status} body=${bodyOneLine(r.bodyText)} elapsed_ms=${r.ms} ts=${new Date().toISOString()}`);
  } else {
    console.log(`PROBE_CONSENT op=${op} status=throw err_name=${r.errName}${r.errCode ? ` err_code=${r.errCode}` : ''} elapsed_ms=${r.ms} ts=${new Date().toISOString()}`);
  }
}

// 单发 fetch 的 fail/timeout 判（环境门轮询用·蓝本同式）：信号超时=timeout；连接类错误=fail。
function classifyFetchError(e, label) {
  if (e?.name === 'TimeoutError' || e?.name === 'AbortError') return { status: 'timeout', detail: `${label}:no_response_within_bound` };
  return { status: 'fail', detail: `${label}:err=${e?.code ?? e?.name ?? 'unknown'}` };
}

// ============ 五段探针（rev2 §2 段序） ============
let created = false;
let pgEnv = null;
let consentPostResult = null; // 段 3 结果（段 5 条件判据）
let sessionState = null; // 段 2 产出 {token,email}——段 3-5 的 Bearer 面

async function segProbeEnv() {
  // 子面 a：docker 起 PG + consecutive=3 就绪（蓝本 probe_pg_1 同式）
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
    return { status: 'fail', detail: `env_face:docker_run:${e?.code ?? e?.name ?? 'unknown'}` };
  }
  created = true;
  feedWatchdog('env:docker_run_done');
  let portOutput;
  try {
    portOutput = await capture('docker', ['port', container, '5432/tcp'], baseEnv, ROOT, 10_000);
  } catch (e) {
    return { status: 'fail', detail: `env_face:docker_port:${e?.code ?? e?.name ?? 'unknown'}` };
  }
  const match = String(portOutput).match(/127\.0\.0\.1:(\d+)/);
  if (!match) return { status: 'fail', detail: 'env_face:isolated_postgres_port_unparseable' };
  pgEnv = { ...baseEnv, PGPORT: match[1] };
  console.log(`E2E isolated PostgreSQL: ${container} on 127.0.0.1:${pgEnv.PGPORT}`);
  feedWatchdog('env:port_parsed');
  const ready = await waitForPostgres(pgEnv);
  if (!ready.ok) return { status: 'timeout', detail: 'env_face:isolated_postgres_database_not_ready:boot' };
  feedWatchdog('env:pg_ready');

  // 子面 b：migrate 2-试 + post-migrate/pre-prove 再探（蓝本 probe_migrate_2 同式）
  const mig = await migrateWithRecovery(pgEnv);
  if (!mig.ok) return { status: 'fail', detail: `env_face:isolated_e2e_migrate_failed:code=${mig.code},attempts=${mig.attempts}` };
  feedWatchdog('env:migrate_done');
  const post = await waitForPostgres(pgEnv, { consecutive: 3, label: 'post-migrate' });
  if (!post.ok) return { status: 'timeout', detail: 'env_face:isolated_postgres_database_not_ready:post-migrate' };
  const still = await capture('docker', ['inspect', '--format', '{{.State.Running}}', container], baseEnv, ROOT, 5_000).catch(() => 'false');
  if (String(still).trim() !== 'true') return { status: 'fail', detail: `env_face:isolated_postgres_container_not_running_before_probe:${String(still).trim()}` };
  const pre = await waitForPostgres(pgEnv, { consecutive: 3, label: 'pre-probe' });
  if (!pre.ok) return { status: 'timeout', detail: 'env_face:isolated_postgres_database_not_ready:pre-probe' };
  feedWatchdog('env:pre_probe_ready');

  // 子面 c：api+worker 背靠背并发 spawn（蓝本 probe_spawn_3 同式·两 spawn 之间零 await）
  const childEnv = buildChildEnv(pgEnv);
  api = spawn('node', ['--import', REG, 'src/main.ts'], { cwd: ROOT + 'apps/api', env: { ...childEnv, PORT: String(apiPort) }, stdio: ['ignore', 'pipe', 'pipe'] });
  worker = spawn('node', ['--import', REG, 'src/main.ts'], { cwd: ROOT + 'apps/worker', env: { ...childEnv, WORKER_BOOTSTRAP: '1', WEB_ALLOWLIST: '', WORKER_METRICS_PORT: String(workerMetricsPort), E2E_REPORT_FAIL_ALL: '1' }, stdio: ['ignore', 'pipe', 'pipe'] });
  wireChild('api', api);
  wireChild('worker', worker);
  await sleep(500); // 仅捕获同步 spawn 错误/即刻退出；更晚的死亡由子面 d-f 捕获。
  if (spawnErrors.size) return { status: 'fail', detail: `env_face:spawn_error:${[...spawnErrors].map(([n, c]) => `${n}:${c}`).join('+')}` };
  if (api.exitCode !== null) return { status: 'fail', detail: `env_face:early_exit:api:code=${api.exitCode}` };
  if (worker.exitCode !== null) return { status: 'fail', detail: `env_face:early_exit:worker:code=${worker.exitCode}` };
  feedWatchdog('env:spawn_settled');

  // 子面 d：/livez 40×1s（蓝本 probe_api_livez_4 同式）
  let httpSeen = false;
  let livezOk = false;
  for (let i = 0; i < 40; i++) {
    await sleep(1000);
    if (api.exitCode !== null) return { status: 'fail', detail: `env_face:api_exited_during_livez_poll:code=${api.exitCode}` };
    feedWatchdog(`env:livez_poll_${i + 1}`);
    try {
      const r = await fetch(`${apiBase}/livez`, { signal: AbortSignal.timeout(5_000) });
      httpSeen = true;
      if (r.ok) { livezOk = true; break; }
    } catch { /* api still booting */ }
  }
  if (!livezOk) return httpSeen ? { status: 'fail', detail: 'env_face:livez_http_non_ok_after_40_polls' } : { status: 'timeout', detail: 'env_face:livez_no_response_after_40_polls' };
  feedWatchdog('env:livez_ok');

  // 子面 e：login-401 DB 门 60×1s（蓝本 probe_db_gate_5 同式）
  let lastStatus = null;
  let gateOk = false;
  for (let i = 0; i < 60; i++) {
    await sleep(1000);
    if (api.exitCode !== null) return { status: 'fail', detail: `env_face:api_exited_during_db_gate:code=${api.exitCode}` };
    feedWatchdog(`env:db_gate_poll_${i + 1}`);
    try {
      const r = await fetch(`${apiBase}/auth/login`, {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: `e2e-ready-${i}@invalid.test`, password: 'strongpw123' }),
        signal: AbortSignal.timeout(5_000),
      });
      lastStatus = r.status;
      if (r.status === 401) { gateOk = true; break; }
    } catch { /* API/DB still booting */ }
  }
  if (!gateOk) return lastStatus !== null ? { status: 'fail', detail: `env_face:db_gate_last_http_status=${lastStatus}` } : { status: 'timeout', detail: 'env_face:db_gate_no_http_after_60_polls' };
  feedWatchdog('env:db_gate_ok');

  // 子面 f：3s sleep+exitCode+worker 里程碑（蓝本 probe_exit_check_6 同式）
  await sleep(3000); // ≡ run-e2e.mjs:136 给 worker 消费循环就绪
  if (worker.exitCode !== null) return { status: 'fail', detail: `env_face:worker_exited_before_probe:code=${worker.exitCode}` };
  if (api.exitCode !== null) return { status: 'fail', detail: `env_face:api_exited_before_probe:code=${api.exitCode}` };
  try {
    const r = await fetch(`http://127.0.0.1:${workerMetricsPort}/livez`, { signal: AbortSignal.timeout(10_000) });
    if (!r.ok) return { status: 'fail', detail: `env_face:worker_livez_http=${r.status}` };
  } catch (e) {
    const cls = classifyFetchError(e, 'worker_livez');
    return { status: cls.status, detail: `env_face:${cls.detail}` };
  }
  try {
    const r = await fetch(`http://127.0.0.1:${workerMetricsPort}/readyz/worker`, { signal: AbortSignal.timeout(10_000) });
    if (!r.ok) return { status: 'fail', detail: `env_face:worker_not_ready:http=${r.status}` };
  } catch (e) {
    const cls = classifyFetchError(e, 'worker_readyz');
    return { status: cls.status, detail: `env_face:${cls.detail}` };
  }
  feedWatchdog('env:worker_milestones_ok');

  // 子面 g：/readyz/api（蓝本 probe_api_readyz_7 同式·probe-local 10×1s 预算）
  let readyLastStatus = null;
  let readyOk = false;
  for (let i = 0; i < 10; i++) {
    await sleep(1000);
    if (api.exitCode !== null) return { status: 'fail', detail: `env_face:api_exited_during_readyz_poll:code=${api.exitCode}` };
    feedWatchdog(`env:readyz_poll_${i + 1}`);
    try {
      const r = await fetch(`${apiBase}/readyz/api`, { signal: AbortSignal.timeout(5_000) });
      readyLastStatus = r.status;
      if (r.ok) { readyOk = true; break; }
    } catch { /* api not answering yet */ }
  }
  if (!readyOk) return readyLastStatus !== null ? { status: 'fail', detail: `env_face:readyz_api_last_http=${readyLastStatus}` } : { status: 'timeout', detail: 'env_face:readyz_api_no_response_after_10_polls' };
  return { status: 'ok', detail: `pg_port=${pgEnv.PGPORT},ready_attempt=${ready.attempt},migrate_attempts=${mig.attempts},post_migrate_attempt=${post.attempt},pre_probe_attempt=${pre.attempt},api_pid=${api.pid},worker_pid=${worker.pid},mode=back-to-back` };
}

// signupOrLogin 同式自实现（e2e/helpers/auth.ts:35-49 形态：非 200 signup 落 login·200+token 过门·不造 token）
async function signupOrLoginSelf(email, password) {
  const postAuth = async (path, body) => probeFetch(path === '/auth/signup' ? 'signup' : 'login', path, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
  });
  let r = await postAuth('/auth/signup', { email, password });
  let via = 'signup';
  if (r.kind === 'http' && r.status !== 200) {
    r = await postAuth('/auth/login', { email, password });
    via = 'login';
  }
  if (r.kind !== 'http') return { r, via, token: null };
  let token = null;
  try { const j = JSON.parse(r.bodyText); token = typeof j?.token === 'string' && j.token.length > 0 ? j.token : null; } catch { /* body 非契约面·token 判缺 */ }
  return { r, via, token };
}

async function segProbeSignup() {
  const email = `g7p3-consent-${runLabel}-${process.pid}-${Date.now()}@invalid.test`;
  const { r, via, token } = await signupOrLoginSelf(email, 'strongpw123');
  printConsentTriple(`auth_${via}`, r);
  if (r.kind === 'http') {
    if (r.status === 200 && token) {
      sessionState = { token, email };
      return { status: 'ok', detail: `via=${via},http=${r.status},token_present=true,elapsed_ms=${r.ms}` };
    }
    return { status: 'fail', detail: `via=${via},http=${r.status},token_present=${Boolean(token)}` };
  }
  const cls = classifyProbeFetch(r, 'signup');
  return { status: cls.status, detail: `via=${via},${cls.detail}` };
}

// POST /privacy/consent body {purpose:'resume_processing'}（e2e/helpers/resume.ts:12-19 同式 +
// e2e/helpers/http.ts jsonHeaders 同式 Bearer 头）——精确 status+body+elapsed 三元组。
async function segProbeConsentPost() {
  const r = await probeFetch('consent_post', '/privacy/consent', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${sessionState.token}` },
    body: JSON.stringify({ purpose: 'resume_processing' }),
  });
  printConsentTriple('consent_post', r);
  consentPostResult = r;
  if (r.kind === 'http') {
    return r.status >= 200 && r.status < 300
      ? { status: 'ok', detail: `http=${r.status},elapsed_ms=${r.ms}` }
      : { status: 'fail', detail: `http=${r.status},elapsed_ms=${r.ms}` };
  }
  const cls = classifyProbeFetch(r, 'consent_post');
  return { status: cls.status, detail: cls.detail };
}

// GET /privacy/consent 状态对照·无条件照跑（rev2 §2）。
async function segProbeConsentStatus() {
  const r = await probeFetch('consent_status_get', '/privacy/consent', {
    headers: { 'content-type': 'application/json', authorization: `Bearer ${sessionState.token}` },
  });
  printConsentTriple('consent_status_get', r);
  if (r.kind === 'http') {
    return r.status >= 200 && r.status < 300
      ? { status: 'ok', detail: `http=${r.status},elapsed_ms=${r.ms}` }
      : { status: 'fail', detail: `http=${r.status},elapsed_ms=${r.ms}` };
  }
  const cls = classifyProbeFetch(r, 'consent_status_get');
  return { status: cls.status, detail: cls.detail };
}

// 复打（条件段：段 3 呈 4xx/5xx/throw 时·timeout 不复打·预算已尽·预注册 rev2 §2）。
async function segProbeRepost() {
  if (!consentPostResult) return { status: 'skipped', detail: 'condition_not_met:no_segment3_result' };
  const is4xx5xx = consentPostResult.kind === 'http' && consentPostResult.status >= 400;
  const isThrow = consentPostResult.kind === 'err';
  if (!is4xx5xx && !isThrow) {
    return { status: 'skipped', detail: `condition_not_met:segment3_http=${consentPostResult.kind === 'http' ? consentPostResult.status : 'n/a'}` };
  }
  const r = await probeFetch('consent_repost', '/privacy/consent', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${sessionState.token}` },
    body: JSON.stringify({ purpose: 'resume_processing' }),
  });
  printConsentTriple('consent_repost', r);
  if (r.kind === 'http') {
    return r.status >= 200 && r.status < 300
      ? { status: 'ok', detail: `http=${r.status},elapsed_ms=${r.ms}` }
      : { status: 'fail', detail: `http=${r.status},elapsed_ms=${r.ms}` };
  }
  const cls = classifyProbeFetch(r, 'consent_repost');
  return { status: cls.status, detail: cls.detail };
}

// ============ 段执行器 + 收尾 ============
const SEGMENTS = [
  { id: 'probe_env_1', exit: 1, fn: segProbeEnv, earlyExitOnRed: true },
  { id: 'probe_signup_2', exit: 2, fn: segProbeSignup, earlyExitOnRed: true },
  { id: 'probe_consent_post_3', exit: 3, fn: segProbeConsentPost, earlyExitOnRed: false },
  { id: 'probe_consent_status_4', exit: 4, fn: segProbeConsentStatus, earlyExitOnRed: false },
  { id: 'probe_repost_5', exit: 5, fn: segProbeRepost, earlyExitOnRed: false },
];

const segmentRecords = [];
const runStart = Date.now();

function cleanup() {
  if (watchdogTimer) clearTimeout(watchdogTimer);
  for (const p of [api, worker]) {
    if (p && p.exitCode === null) { try { p.kill('SIGKILL'); } catch { /* already gone */ } }
  }
}
process.on('exit', cleanup);
process.on('SIGINT', () => { cleanup(); process.exit(130); });

async function finalize(exitCode, crashReason) {
  if (finalized) return;
  finalized = true;
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
  feedWatchdog('main_start');
  const selfPath = new URL(import.meta.url).pathname;
  const digest = createHash('sha256').update(readFileSync(selfPath)).digest('hex');
  console.log(`PROBE_SCRIPT_SHA256 path=scripts/e2e-consent-probe.mjs sha256=${digest}`);
  console.log(`PROBE_META label=${runLabel} pid=${process.pid} ts=${new Date().toISOString()} container=${container} image=${image} api_port=${apiPort} worker_metrics_port=${workerMetricsPort} node=${process.version} model_api_key=${String(process.env.MODEL_API_KEY ?? '').trim() ? 'set' : 'unset'} model_api_key_face=name_only dot_env_present=${existsSync(ROOT + '.env')} g7_freetier_reprove=${String(process.env.G7_FREETIER_REPROVE ?? '').trim() ? 'set' : 'unset'} fetch_budget_ms=${FETCH_BUDGET_MS} watchdog_boundary_ms=${WATCHDOG_BOUNDARY_MS}`);
  let firstRedExit = null;
  for (const seg of SEGMENTS) {
    const t0 = Date.now();
    let res;
    try {
      res = await seg.fn();
    } catch (e) {
      res = { status: 'fail', detail: `segment_throw:${e?.code ?? e?.name ?? 'unknown'}` };
    }
    feedWatchdog(`segment_done:${seg.id}`);
    const elapsed = Date.now() - t0;
    const line = `PROBE_SEGMENT segment=${seg.id} status=${res.status} elapsed_ms=${elapsed} ts=${new Date().toISOString()}${res.detail ? ` detail=${res.detail}` : ''}`;
    console.log(line);
    segmentRecords.push({ id: seg.id, status: res.status, elapsedMs: elapsed, detail: res.detail ?? null });
    const red = res.status === 'fail' || res.status === 'timeout';
    if (red) {
      if (firstRedExit === null) firstRedExit = seg.exit; // EXIT=首个红段号（多红首红为准·后续段行供判读）
      if (seg.earlyExitOnRed) await finalize(firstRedExit, null); // 段 1/2 红沿 G7P-1 早退（无 api/无 token 面·非 consent 红）
    }
  }
  await finalize(firstRedExit ?? 0, null);
}

main().catch((e) => finalize(9, `${e?.name ?? 'Error'}${e?.code ? ':' + e.code : ''}`));
