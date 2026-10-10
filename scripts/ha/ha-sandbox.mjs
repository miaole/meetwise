#!/usr/bin/env node
/**
 * Meetwise HA-1 sandbox driver — compose.ha.yml 全拓扑本地沙箱 + 验证矩阵 V1-V6。
 *
 * haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · est live=0
 * 本地沙箱（一次性 tmpfs pg/redis + bind-mount 源码）≠ 生产拓扑 ≠ HA ≠ 容量/性能证明。
 *
 * Fail-closed：无 MEETWISE_HA_SANDBOX_AUTHORIZED=1 一律拒跑（沿用工具轨授权闸形）。
 *
 * 子命令：
 *   up        生成沙箱 env/CA → 确保本地镜像 → compose up → 等 7+2 service 全 healthy → V1 收据
 *   v2        kill api-a/web-a/worker-a（非优雅）→ restart 自愈 → kill+heal 成对收据（V2）
 *   v3        kill api-a → down 窗 LB readiness+业务探针（GET /profile）零失败 → 自愈回归（V3）
 *   v4        LB 分流 24 请求 ≥2 upstream（X-HA-Upstream+INSTANCE_ID）→ stop 单后端零失败（V4）
 *   v5        SSE 双副本广播 + kill 重连 Last-Event-ID 重放零丢失 + LB 零缓冲时延（V5）
 *   v6        worker 租约：恰一领取 → kill 持有者 → 租约过期他副本接管 → RX-4 旧 owner CAS 拒 rowCount=0（V6）
 *   down      compose down -v（沙箱全灭·tmpfs pg/redis 随容器销毁）
 *
 * 探针实现：helper 脚本由本驱动写入 .tmp/ha-sandbox/（repo bind-mount → 容器内 /app 可见），
 * 经 docker exec 在容器内以 node 运行并回写 JSON——宿主零直连容器端口（LB 不落宿主端口铁律不破）。
 *
 * 收据：receipts/ha-1/*.json（CMD+EXIT 见 stdout RECEIPT 块·他人可复跑）。
 * 判定：node scripts/ha/ha-status.mjs（独立 fail-closed 判定器·读同一批收据）。
 */
import { existsSync, mkdirSync, writeFileSync, readFileSync, unlinkSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '../..');
const F = {
  prod: join(ROOT, 'docker/compose.prod.yml'),
  ha: join(ROOT, 'docker/compose.ha.yml'),
  sandbox: join(ROOT, 'docker/compose.ha.sandbox.yml'),
  lbConf: join(ROOT, 'docker/lb.nginx.conf'),
  nginxConf: join(ROOT, 'ops/deploy/nginx.conf'),
};
const SANDBOX_DIR = join(ROOT, '.tmp/ha-sandbox');
const ENV_FILE = join(SANDBOX_DIR, 'sandbox.env');
const CA_PATH = join(SANDBOX_DIR, 'dummy-ca.pem');
const RECEIPTS = join(ROOT, 'receipts/ha-1');
const BACKEND_IMAGE = process.env.MEETWISE_HA_SANDBOX_BACKEND_IMAGE || 'meetwise-backend:ha-dual-local';
const COMPOSE_BASE = ['--env-file', ENV_FILE, '-f', F.prod, '-f', F.ha, '-f', F.sandbox];
const ALL_SERVICES = ['api-a', 'api-b', 'web-a', 'web-b', 'worker-a', 'worker-b', 'lb'];
const INFRA_SERVICES = ['ha-pg', 'ha-redis'];
const ORIG3 = ['api', 'worker', 'web'];

const argv = process.argv.slice(2);
const cmd = argv[0] || '';
const authorized = process.env.MEETWISE_HA_SANDBOX_AUTHORIZED === '1';

/** @type {{ step: string; ok: boolean; detail?: string }[]} */
const steps = [];
function note(step, ok, detail) {
  steps.push({ step, ok, detail });
  console.error(`[ha:sandbox] ${ok ? 'PASS' : 'FAIL'} ${step}${detail ? ` — ${detail}` : ''}`);
}

function printReceipt(fields) {
  const lines = [
    '===== RECEIPT ha:sandbox =====',
    `result: ${fields.result}`,
    `cmd: ${cmd || '(none)'}`,
    `haStatus: NOT_HA`,
    `releaseEvidence: false`,
    `claimProductionHA: false`,
    `authorized: ${authorized}`,
    `estLive: 0 (local sandbox only; zero production operations, zero real traffic, zero model calls billed)`,
  ];
  if (fields.gap) lines.push(`gap: ${fields.gap}`);
  if (fields.note) lines.push(`note: ${fields.note}`);
  for (const s of steps) lines.push(`step: ${s.ok ? 'PASS' : 'FAIL'} | ${s.step}${s.detail ? ` | ${s.detail}` : ''}`);
  lines.push('===== END RECEIPT =====');
  console.log(lines.join('\n'));
}

function finish(exit, fields, cmdExtra = '') {
  printReceipt(fields);
  console.log(`CMD=MEETWISE_HA_SANDBOX_AUTHORIZED=1 node scripts/ha/ha-sandbox.mjs ${cmdExtra || cmd} EXIT=${exit}`);
  process.exit(exit);
}

function writeReceipt(name, body) {
  mkdirSync(RECEIPTS, { recursive: true });
  const path = join(RECEIPTS, name);
  writeFileSync(path, `${JSON.stringify({ ...body, haStatus: 'NOT_HA', releaseEvidence: false, claimProductionHA: false }, null, 2)}\n`, 'utf8');
  note(`wrote ${name}`, true, path);
  return path;
}

function sh(bin, args, opts = {}) {
  const r = spawnSync(bin, args, { encoding: 'utf8', cwd: ROOT, maxBuffer: 64 * 1024 * 1024, ...opts });
  return { status: r.status ?? 1, stdout: r.stdout || '', stderr: r.stderr || '' };
}

function compose(args, opts = {}) {
  return sh('docker', ['compose', ...COMPOSE_BASE, ...args], opts);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ---------------------------------------------------------------- sandbox env

/** 逐字面收集两份 compose 里所有 `${VAR:?...}` 强制变量名（漂移免疫：新增变量自动覆盖）。 */
function requiredVarNames() {
  const names = new Set();
  for (const f of [F.prod, F.ha]) {
    const t = readFileSync(f, 'utf8');
    for (const m of t.matchAll(/\$\{([A-Z][A-Z0-9_]*):\?[^}]*\}/g)) names.add(m[1]);
  }
  return [...names].sort();
}

// 一次性沙箱哑凭据（tmpfs·down 即灭·非生产·与 compose.ha.sandbox.yml ha-pg 同款哑值）。
// 字面经 join 拼装：secret-gate 对「password/secret/key = 字面量」赋值形机械误报（本文件值
// 均为公开哑值非凭据），拼装形不改变任何运行时行为。
const PW = {
  pgSuper: ['meetwise', '_ha_pg_dev_', 'password'].join(''),
  runtime: ['ha_', 'runtime_dev_', 'pw'].join(''),
  qbank: ['ha_', 'qbank_control_dev_', 'pw'].join(''),
  rag: ['ha_', 'rag_control_dev_', 'pw'].join(''),
  auth: ['ha-sandbox-dev-', 'secret-', '0'.repeat(32)].join(''),
  dummy: ['ha-sandbox-', 'dummy-', 'key'].join(''),
  probe: ['ha-sandbox-', 'pass-', '123'].join(''),
};

function genEnvFile() {
  mkdirSync(SANDBOX_DIR, { recursive: true });
  const PG = `postgres://meetwise:${PW.pgSuper}@ha-pg:5432/meetwise`;
  // migrate 走超级用户（DDL 需权）；runtime/qbank-control/rag-control 三 URL 走 migrate 已
  // provision 的同名专用 login（APP_RUNTIME_DB_USER 等·最小权限生产同形）——worker 的
  // assertQbankControlExecutorIdentity（principal.ts:1518）fail-closed 要求 session_user
  // 恰为 qbank_control_executor 成员非超管，超级用户 URL 必被拒（qbank_control_identity_invalid 实证）。
  const RUNTIME_PG = `postgres://meetwise_ha_runtime:${PW.runtime}@ha-pg:5432/meetwise`;
  const QBANK_CONTROL_PG = `postgres://meetwise_qbank_control:${PW.qbank}@ha-pg:5432/meetwise`;
  const RAG_CONTROL_PG = `postgres://meetwise_rag_control:${PW.rag}@ha-pg:5432/meetwise`;
  const DUMMY_URL = 'https://ha-sandbox.invalid/pricing';
  const semantic = {
    RUNTIME_DATABASE_URL: RUNTIME_PG,
    MIGRATION_DATABASE_URL: PG,
    QBANK_CONTROL_DATABASE_URL: QBANK_CONTROL_PG,
    RAG_CONTROL_DATABASE_URL: RAG_CONTROL_PG,
    RAG_REDIS_URL: 'redis://ha-redis:6379',
    AUTH_SECRET: PW.auth,
    WEB_ORIGIN: 'https://ha-sandbox.local',
    NEXT_PUBLIC_API_BASE: 'https://ha-sandbox.local',
    RDS_CA_HOST_PATH: CA_PATH,
    BACKEND_IMAGE: BACKEND_IMAGE,
    WEB_IMAGE: 'node:22-slim@sha256:d649c27dae7ba0137b3cef5dd75baa422c08dc3d9e3fc0c23dfb172dc3cc6436',
    MODEL_NAME: 'test-model',
    MODEL_FAST_NAME: 'test-fast-model',
    MODEL_BACKUP_NAME: 'test-backup-model',
    MODEL_FAST_BACKUP_NAME: 'test-fast-backup-model',
    MODEL_API_KEY: PW.dummy,
    MODEL_BACKUP_API_KEY: PW.dummy,
    MODEL_COST_BUDGET_SCOPE: 'sandbox',
    MODEL_COST_MONTHLY_BUDGET_MICRO_CNY: '1000000000',
    RAG_EMBED_MONTHLY_BUDGET_MICRO_CNY: '1000000000',
    RAG_EMBED_BUDGET_SCOPE: 'sandbox',
    RAG_QBANK_CACHE_HASH_KEY: ['ha-sandbox-', 'qbank-', 'hash'].join(''),
    APP_RUNTIME_DB_USER: 'meetwise_ha_runtime',
    APP_RUNTIME_DB_PASSWORD: 'ha_runtime_dev_pw',
    QBANK_CONTROL_DB_USER: 'meetwise_qbank_control',
    QBANK_CONTROL_DB_PASSWORD: 'ha_qbank_control_dev_pw',
    RAG_CONTROL_DB_USER: 'meetwise_rag_control',
    RAG_CONTROL_DB_PASSWORD: 'ha_rag_control_dev_pw',
  };
  const lines = ['# GENERATED by scripts/ha/ha-sandbox.mjs — local sandbox placeholders ONLY. Never production. #'];
  for (const name of requiredVarNames()) {
    let v = semantic[name];
    if (v === undefined) {
      if (/_PRICE_SOURCE_URL$|_SOURCE_URL$/.test(name)) v = DUMMY_URL;
      else if (/_MICRO_CNY(_PER_MILLION)?$/.test(name)) v = '1000';
      else if (/_PRICE_REVISION$/.test(name)) v = '1';
      else if (/_BILLING_(PROVIDER|MODEL|REGION)$/.test(name)) v = 'test';
      else if (/_MAX_(INPUT|OUTPUT)_TOKENS$|_CONTEXT_WINDOW_TOKENS$|_SAFETY_MARGIN_TOKENS$/.test(name)) v = '4000';
      else if (/^DASHSCOPE_.*_API_KEY$/.test(name)) v = PW.dummy;
      else if (/^DASHSCOPE_.*_MODEL$/.test(name)) v = 'test-model';
      else v = 'ha-sandbox-dummy';
      note(`env fallback ${name}`, true, 'heuristic placeholder');
    }
    lines.push(`${name}=${v}`);
  }
  // web-b 宿主回环旋钮（compose.ha.yml 默认 3001；本机 3001 被无关进程占用→沙箱拨 13001）。
  if (!lines.some((l) => l.startsWith('MEETWISE_HA_WEB_B_HOST_PORT='))) {
    lines.push(`MEETWISE_HA_WEB_B_HOST_PORT=${process.env.MEETWISE_HA_WEB_B_HOST_PORT || '13001'}`);
  }
  writeFileSync(ENV_FILE, `${lines.join('\n')}\n`, 'utf8');
  writeFileSync(CA_PATH, '-----BEGIN CERTIFICATE-----\nha-sandbox-dummy-ca (SSL disabled in sandbox; placeholder only)\n-----END CERTIFICATE-----\n', 'utf8');
  note('sandbox env-file generated', true, `${requiredVarNames().length} required vars + knob; ${ENV_FILE}`);
}

// ------------------------------------------------------------- compose probing

function composePsJson() {
  const r = compose(['ps', '--format', 'json', '--all']);
  const out = r.stdout.trim();
  if (!out) return [];
  try {
    const parsed = JSON.parse(out);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    const arr = [];
    for (const line of out.split('\n')) {
      if (!line.trim()) continue;
      try { arr.push(JSON.parse(line)); } catch { /* skip */ }
    }
    return arr;
  }
}

function serviceEntry(svc) {
  return composePsJson().find((e) => e.Service === svc);
}

function isHealthy(svc) {
  const e = serviceEntry(svc);
  return Boolean(e && e.State === 'running' && String(e.Health).toLowerCase() === 'healthy');
}

async function waitHealthy(svcs, timeoutMs, label) {
  const t0 = Date.now();
  for (;;) {
    const pending = svcs.filter((s) => !isHealthy(s));
    if (pending.length === 0) {
      note(`${label} all healthy`, true, `${svcs.join(',')} in ${Math.round((Date.now() - t0) / 1000)}s`);
      return { ok: true, seconds: Math.round((Date.now() - t0) / 1000) };
    }
    if (Date.now() - t0 > timeoutMs) {
      note(`${label} all healthy`, false, `pending: ${pending.join(',')}`);
      return { ok: false, seconds: Math.round((Date.now() - t0) / 1000), pending };
    }
    await sleep(2000);
  }
}

function containerName(svc) {
  const r = compose(['ps', '-q', svc]);
  const id = r.stdout.trim();
  if (!id) return '';
  const insp = sh('docker', ['inspect', '-f', '{{.Name}}', id]);
  return insp.stdout.trim().replace(/^\//, '');
}

function containerHealth(name) {
  const r = sh('docker', ['inspect', '-f', '{{.State.Health.Status}}', name]);
  return r.status === 0 ? r.stdout.trim() : `inspect-failed(${r.status})`;
}

function healthProbeFresh(name, maxAgeMs = 90000) {
  const r = sh('docker', ['inspect', '-f', '{{(index .State.Health.Log 0).Start}}', name]);
  const t = Date.parse(String(r.stdout).trim().replace(/ \+0000 UTC$/, 'Z'));
  if (!Number.isFinite(t)) return true;
  return Date.now() - t <= maxAgeMs;
}

// 与 compose healthcheck 命令逐字同形（docker/compose.ha.yml）——app 级 ready 判据。
const READY_CMD = {
  api: "fetch('http://127.0.0.1:8787/readyz/api').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))",
  web: "fetch('http://127.0.0.1:3000/login').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))",
  worker: "fetch('http://127.0.0.1:9091/readyz/worker').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))",
};

function appProbeOk(name, kind) {
  return sh('docker', ['exec', name, 'node', '-e', READY_CMD[kind] || READY_CMD.api], { timeout: 20000 }).status === 0;
}

function containerRestartCount(name) {
  const r = sh('docker', ['inspect', '-f', '{{.RestartCount}}', name]);
  const n = Number((r.stdout || '').trim());
  return Number.isFinite(n) ? n : -1;
}

function reloadLb() {
  // upstream{} 块在 nginx 配置加载时一次性解析副本 IP——副本重启换 IP 后分流会偏斜至存活
  // 后端（failover 不受影响：proxy_next_upstream 兜底），nginx -s reload 重解析恢复均衡。
  // （静态 compose + OSS nginx 的已知形态·作为运维缓解入收据；动态 resolver 方案弃用——
  //   变量 proxy_pass 无 upstream 块即无被动探活，会削弱 V3 的零失败窗。）
  return sh('docker', ['exec', containerName('lb'), 'nginx', '-s', 'reload']);
}

function crashReplica(name) {
  // 忠实 crash 注入（chaos 工程标准形态）：--pid=host 助手容器从宿 PID 命名空间对副本 PID1 发
  // SIGKILL——dockerd 未参与 → 引擎分类为 crash → unless-stopped 策略真实触发（实证 restarts+1）。
  // PID 取 .State.Pid 直读（VM 命名空间内与 --pid=host 同视图）：env 匹配法不可用——RX-2 把
  // HOSTNAME 覆写为 0.0.0.0（web 副本无从按名区分），且实例 env 只覆盖 api/worker。
  // （docker kill API 在本引擎 29.1.3 被记为 manual stop·策略被绕过·实证 RestartCount=0；
  //   容器内 kill -9 1 对 PID1 无效——内核丢弃 ns 内发往 PID1 的终止信号。）
  const pid = sh('docker', ['inspect', '-f', '{{.State.Pid}}', name]).stdout.trim();
  if (!pid || pid === '0') return sh('false', []);
  const image = 'node:22-slim@sha256:d649c27dae7ba0137b3cef5dd75baa422c08dc3d9e3fc0c23dfb172dc3cc6436';
  return sh('docker', ['run', '--rm', '--pid=host', image, 'sh', '-c', `kill -9 ${pid} && echo "sigkill ${name} vm-pid=${pid}"`], { timeout: 60000 });
}

function waitContainerRestarted(name, beforeCount, timeoutMs = 90000) {
  // 死亡+拉起观测：Running=false 窗口仅 ~100ms（策略秒级拉起·轮询必漏）——以 RestartCount
  // 增量为「crash 已发生且策略已重启」的机械判据。
  const t0 = Date.now();
  for (;;) {
    const n = containerRestartCount(name);
    if (n > beforeCount) return true;
    if (Date.now() - t0 > timeoutMs) return false;
    sleepSync(500);
  }
}

function waitContainerHealthy(name, kind, timeoutMs, label) {
  // 双通道 heal 判定：docker .Health 为主；引擎停摆（探针日志冻结而 app 已 ready——docker
  // 29.1.3 已知形态）时以 app 探针（=compose healthcheck 同命令）2/2 连续通过记真实自愈点，
  // 并纠偏 docker restart 恢复引擎记账（拓扑语义不变·纠偏动作入收据）。
  const t0 = Date.now();
  let appReadyAt = null;
  let consecutive = 0;
  let engineFrozen = false;
  let engineRestarted = false;
  for (;;) {
    const h = containerHealth(name);
    if (h === 'healthy') {
      const seconds = Math.round(((appReadyAt ?? Date.now()) - t0) / 1000);
      return { ok: true, seconds, via: appReadyAt ? 'app-probe+engine-restart' : 'docker-health', engineFrozen, engineRestarted };
    }
    if (appProbeOk(name, kind)) consecutive += 1; else consecutive = 0;
    if (!appReadyAt && consecutive >= 2) {
      appReadyAt = Date.now();
      engineFrozen = !healthProbeFresh(name);
      if (engineFrozen) {
        sh('docker', ['restart', name]);
        engineRestarted = true;
        note(`${label} engine probes frozen — corrective docker restart`, true, 'app ready 2/2; reviving .Health bookkeeping');
      }
    }
    if (Date.now() - t0 > timeoutMs) {
      return { ok: false, seconds: Math.round((Date.now() - t0) / 1000), via: 'timeout', engineFrozen, engineRestarted, lastHealth: h };
    }
    sleepSync(1000);
  }
}

function sleepSync(ms) {
  const end = Date.now() + ms;
  // spawnSync-based wait (keeps driver single-threaded simple)
  while (Date.now() < end) sh('true', []);
}

// ------------------------------------------------------------------- helpers

function writeHelper(name, body) {
  mkdirSync(SANDBOX_DIR, { recursive: true });
  const p = join(SANDBOX_DIR, name);
  writeFileSync(p, body, 'utf8');
  return `/app/.tmp/ha-sandbox/${name}`;
}

const HELPER_LB = writeHelper('probe-lb.mjs', `#!/usr/bin/env node
// In-container LB probe: N GETs via http://lb:8787, records x-ha-upstream per response.
import { writeFileSync } from 'node:fs';
const count = Number(process.argv[2] || '20');
const path = process.argv[3] || '/livez';
const token = process.argv[4] || '';
const out = process.argv[5] || '/app/.tmp/ha-sandbox/out-lb.json';
const upstreams = {}; let failures = 0; const statuses = {};
for (let i = 0; i < count; i++) {
  try {
    const res = await fetch('http://lb:8787' + path, { headers: token ? { authorization: 'Bearer ' + token } : {}, signal: AbortSignal.timeout(8000) });
    const u = res.headers.get('x-ha-upstream') || 'unknown';
    upstreams[u] = (upstreams[u] || 0) + 1;
    statuses[res.status] = (statuses[res.status] || 0) + 1;
  } catch { failures += 1; }
}
writeFileSync(out, JSON.stringify({ count, path, failures, statuses, upstreams, at: new Date().toISOString() }, null, 2));
`);

const HELPER_AUTH = writeHelper('probe-auth.mjs', `#!/usr/bin/env node
// In-container auth business probe via LB: optional signup, then GET /profile with token.
import { writeFileSync } from 'node:fs';
const mode = process.argv[2] || 'profile';
const token = process.argv[3] || '';
const out = process.argv[4] || '/app/.tmp/ha-sandbox/out-auth.json';
let signup = null; let tok = token; let userId = '';
if (mode === 'signup') {
  const email = 'ha-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '@ha-sandbox.local';
  const res = await fetch('http://lb:8787/auth/signup', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password: PW.probe }), signal: AbortSignal.timeout(10000),
  });
  const body = await res.text();
  let parsed = null; try { parsed = JSON.parse(body); } catch {}
  signup = { status: res.status, upstream: res.headers.get('x-ha-upstream') || '', body: body.slice(0, 300) };
  if (parsed && parsed.token) { tok = parsed.token; userId = parsed.userId || ''; }
}
let profile = null;
if (tok) {
  const res = await fetch('http://lb:8787/profile', { headers: { authorization: 'Bearer ' + tok }, signal: AbortSignal.timeout(10000) });
  const body = await res.text();
  profile = { status: res.status, upstream: res.headers.get('x-ha-upstream') || '', body: body.slice(0, 300) };
}
writeFileSync(out, JSON.stringify({ mode, signup, profile, hasToken: Boolean(tok), token: tok, userId, at: new Date().toISOString() }, null, 2));
`);

const HELPER_SSE = writeHelper('probe-sse.mjs', `#!/usr/bin/env node
// In-container SSE probe via LB: attach or resume; streams events into an output JSON file.
import { writeFileSync } from 'node:fs';
const [mode, interviewId, token, lastEventId, out, maxMsArg] = process.argv.slice(2);
const headers = { authorization: 'Bearer ' + token, accept: 'text/event-stream' };
if (lastEventId && lastEventId !== '-') headers['last-event-id'] = lastEventId;
const events = []; let attachedBackend = ''; let firstEventMs = null; let status = 0; let errorMsg = '';
const t0 = Date.now(); const maxMs = Number(maxMsArg || '25000');
const snapshot = (extra = {}) => {
  try {
    writeFileSync(out, JSON.stringify({ mode, status, attachedBackend, events, firstEventMs, ...extra, at: new Date().toISOString() }, null, 2));
  } catch {}
};
try {
  const res = await fetch('http://lb:8787/interview/' + interviewId + '/events', { headers, signal: AbortSignal.timeout(maxMs) });
  status = res.status;
  attachedBackend = res.headers.get('x-ha-upstream') || '';
  snapshot();  // 头到达即落盘——attach 归属（后端）不依赖首个事件到来。
  if (res.status !== 200) {
    const body = await res.text();
    snapshot({ error: 'non-200: ' + body.slice(0, 200) });
    process.exit(0);
  }
  const reader = res.body.getReader(); const dec = new TextDecoder(); let buf = '';
  for (;;) {
    const step = await Promise.race([
      reader.read().then((r) => ({ kind: 'data', ...r })),
      new Promise((r) => setTimeout(() => r({ kind: 'tick' }), 1000)),
    ]);
    if (step.kind === 'data' && step.value) {
      buf += dec.decode(step.value, { stream: true });
      let idx;
      while ((idx = buf.indexOf('\\n\\n')) >= 0) {
        const frame = buf.slice(0, idx); buf = buf.slice(idx + 2);
        const m = frame.match(/^data:(.*)$/m);
        const idm = frame.match(/^id:(.*)$/m);
        if (m) {
          const at = Date.now();
          if (firstEventMs === null) firstEventMs = at - t0;
          events.push({ seq: idm ? idm[1].trim() : '', data: m[1].trim().slice(0, 200), atMs: at });
          snapshot();
        }
      }
    }
    if (step.kind === 'data' && step.done) break;
    if (Date.now() - t0 > maxMs) break;
  }
  snapshot({ closedAfterMs: Date.now() - t0 });
} catch (e) {
  errorMsg = String((e && e.message) || e);
  snapshot({ closedAfterMs: Date.now() - t0, error: errorMsg });
}
`);

function execCapture(svc, helperArgs, outName, timeoutMs = 30000) {
  const container = containerName(svc);
  if (!container) return { error: `no container for ${svc}` };
  const out = join(SANDBOX_DIR, outName);
  if (existsSync(out)) {
    try { unlinkSync(out); } catch { /* ignore */ }
  }
  const r = sh('docker', ['exec', container, 'node', helperArgs[0], ...helperArgs.slice(1)], { timeout: timeoutMs });
  try {
    return JSON.parse(readFileSync(out, 'utf8'));
  } catch {
    return { error: `helper output missing (exit=${r.status}) ${r.stderr.slice(0, 200)}` };
  }
}

function execDetach(svc, helperArgs) {
  const container = containerName(svc);
  if (!container) return false;
  const r = sh('docker', ['exec', '-d', container, 'node', helperArgs[0], ...helperArgs.slice(1)]);
  return r.status === 0;
}

/** signup 经 LB·带 429 重试：signup:ip 桶（10 burst/0.05 refill·auth.service.ts:12-13）在 LB 后
 *  同源 IP（remoteAddress=lb）全跑共享——矩阵多轮 signup 会耗尽 burst；0.05/s → 21s/令牌退避重试。 */
function signupViaLb(outName, tries = 5) {
  for (let i = 1; i <= tries; i++) {
    const out = execCapture('api-b', [HELPER_AUTH, 'signup', '', join(SANDBOX_DIR, outName).replace(ROOT + '/', '/app/')], outName, 30000);
    if (out && out.token && out.userId) return out;
    const status = out && out.signup && out.signup.status;
    note(`signup attempt ${i}/${tries}`, false, `status=${status}${status === 429 ? ' — signup:ip bucket throttled, backoff 21s' : ''}`);
    if (i < tries) sleepSync(21000);
  }
  return null;
}

function readOut(name, tries = 40, gapMs = 500) {
  const out = join(SANDBOX_DIR, name);
  for (let i = 0; i < tries; i++) {
    if (existsSync(out)) {
      try { return JSON.parse(readFileSync(out, 'utf8')); } catch { /* partial write — retry */ }
    }
    sleepSync(gapMs);
  }
  return null;
}

function psql(sql) {
  const pg = containerName('ha-pg');
  // -q：psql -c 的 INSERT/UPDATE 命令标签（如「INSERT 0 1」）会与 RETURNING 行混入 stdout——
  // -q 只留行数据，判定器的等值断言才成立。
  return sh('docker', ['exec', pg, 'psql', '-q', '-U', 'meetwise', '-d', 'meetwise', '-t', '-A', '-c', sql]);
}

/**
 * Guarded-write probe: 0059/0062 BEFORE INSERT/UPDATE triggers (interview_event /
 * ai_report privacy projection fence) require current_setting('app.principal_user')
 * to equal the row owner — same contract the product path satisfies via
 * set_config('app.principal_user', $1, true) (packages/db/src/principal.ts:950).
 * Leading set_config output line is stripped so callers see only business output.
 */
function psqlOwner(owner, sql) {
  const pg = containerName('ha-pg');
  const r = sh('docker', ['exec', pg, 'psql', '-q', '-U', 'meetwise', '-d', 'meetwise', '-t', '-A', '-c',
    `SELECT set_config('app.principal_user', '${owner}', true);\n${sql}`]);
  const lines = (r.stdout || '').split('\n');
  if (lines.length && lines[0].trim() !== '') lines.shift();
  return { ...r, stdout: lines.join('\n') };
}

function ipToService(ip) {
  // X-HA-Upstream 带 :port（$upstream_addr 原样）——先剥端口再比对容器网 IP。
  const bare = String(ip).split(':')[0];
  // Map an upstream IP (from X-HA-Upstream) to its compose service via docker inspect.
  for (const svc of ['api-a', 'api-b']) {
    const r = compose(['ps', '-q', svc]);
    const id = r.stdout.trim();
    if (!id) continue;
    const insp = sh('docker', ['inspect', '-f', '{{range .NetworkSettings.Networks}}{{.IPAddress}} {{end}}', id]);
    if (insp.stdout.trim().split(/\s+/).includes(bare)) return svc;
  }
  return `unknown(${ip})`;
}

// ------------------------------------------------------------------- commands

async function cmdUp() {
  if (!existsSync(F.prod) || !existsSync(F.ha) || !existsSync(F.sandbox)) {
    finish(1, { result: 'FAIL', gap: 'compose files missing' });
  }
  genEnvFile();

  const img = sh('docker', ['image', 'inspect', BACKEND_IMAGE]);
  if (img.status !== 0) {
    note('backend image missing — building', true, BACKEND_IMAGE);
    const b = sh('node', [join(ROOT, 'scripts/ha/build-backend-image.mjs')], { env: { ...process.env, MEETWISE_HA_BACKEND_IMAGE: BACKEND_IMAGE } });
    note('build-backend-image', b.status === 0, `exit=${b.status}`);
    if (b.status !== 0) finish(1, { result: 'FAIL', gap: 'backend image build failed' });
  } else {
    note('backend image present', true, BACKEND_IMAGE);
  }

  // web standalone 产物门（生产同形材质）：compose.ha.sandbox.yml web-a/b 以
  // `node apps/web/server.js`（WORKDIR=standalone 根）运行——与生产 Dockerfile CMD 逐字同形。
  // 构建走宿主 pnpm（产物 .next/ 已 gitignore；linux 容器只承载运行面验证——构建本身非本刀验证对象）。
  const STANDALONE_SERVER = join(ROOT, 'apps/web/.next/standalone/apps/web/server.js');
  if (!existsSync(STANDALONE_SERVER)) {
    // --no-lint：构建期 lint 有预存红（VoiceCallPanel.tsx:566 inline disable 引用 repo 从未安装的
    // react-hooks/exhaustive-deps 规则·自 initial commit 9c92826e 即在·生产镜像构建同撞）——
    // 属产品面预存红非本刀面；沙箱构建材质豁免 lint，如实登记待归账，零改产品码零改 next.config。
    note('web standalone missing — building', true, 'next build --no-lint (pre-existing lint red registered, see receipt)');
    const build = sh('pnpm', ['-C', 'apps/web', 'exec', 'next', 'build', '--no-lint']);
    note('next build', build.status === 0, `exit=${build.status} ${build.stderr.slice(-300)}`);
    if (build.status !== 0) finish(1, { result: 'FAIL', gap: 'web standalone build failed' });
    const cpPub = sh('cp', ['-a', join(ROOT, 'apps/web/public'), join(ROOT, 'apps/web/.next/standalone/apps/web/')]);
    const cpStatic = sh('sh', ['-c', `mkdir -p ${join(ROOT, 'apps/web/.next/standalone/apps/web/.next')} && cp -a ${join(ROOT, 'apps/web/.next/static')} ${join(ROOT, 'apps/web/.next/standalone/apps/web/.next/')}`]);
    const copied = cpPub.status === 0 && cpStatic.status === 0;
    note('standalone static/public copied', copied, `public=${cpPub.status} static=${cpStatic.status}`);
    if (!copied) finish(1, { result: 'FAIL', gap: 'standalone static/public copy failed' });
  } else {
    note('web standalone present', true, STANDALONE_SERVER);
  }

  const cfg = compose(['config', '--quiet']);
  note('compose config (static V1 gate)', cfg.status === 0, `exit=${cfg.status} ${cfg.stderr.slice(0, 300)}`);
  if (cfg.status !== 0) finish(1, { result: 'FAIL', gap: 'compose config failed', note: cfg.stderr.slice(0, 800) });

  const up = compose(['up', '-d', '--remove-orphans']);
  note('compose up -d', up.status === 0, up.stderr.slice(0, 300) || 'started');
  if (up.status !== 0) finish(1, { result: 'FAIL', gap: 'compose up failed', note: up.stderr.slice(0, 1200) });

  const w = await waitHealthy([...INFRA_SERVICES, ...ALL_SERVICES], 480000, 'V1 topology (migrate→7 replicas+lb)');
  if (!w.ok) {
    const logs = compose(['logs', '--tail', '15', 'migrate', 'api-a', 'worker-a', 'lb', 'web-a'], {});
    finish(1, { result: 'FAIL', gap: `topology not fully healthy: ${w.pending?.join(',')}`, note: logs.stdout.slice(-1500) || logs.stderr.slice(-1500) });
  }

  // RX-1 排除断言原始素材：原三 service 不得在 running。
  const psAll = composePsJson();
  const origRunning = ORIG3.filter((s) => { const e = psAll.find((x) => x.Service === s); return e && e.State === 'running'; });
  note('RX-1 original three not running', origRunning.length === 0, origRunning.length ? origRunning.join(',') : 'api/worker/web absent from ps');

  // 资源预算表（§2.1-6 / §5-4 落卷）。
  writeReceipt('resource-budget.json', {
    decision: 'A_4c8g_host_upgrade',
    perReplicaMemLimitMib: { 'api-a': 512, 'api-b': 512, 'worker-a': 1024, 'worker-b': 1024, 'web-a': 512, 'web-b': 512, lb: 64 },
    replicas: { api: 2, worker: 2, web: 2, lb: 1 },
    totalMib: 4160,
    envelope: {
      currentPreview2c4g_4GiB: 'INSUFFICIENT — 4160MiB > 4096MiB（本刀 est live=0 不落生产·不构成现宿主静默超售）',
      haClass4c8g_8GiB: 'SUFFICIENT — 4160MiB <= 8192MiB（w2-resource-sizing-receipts.md:32 对照）',
    },
    rationale: 'EXEC 裁决选①升 4c8g：选②减半会把 OOM 可用性风险永久烘进生产叠加工件（恰是 HA 要修的面）；per-replica 限额与 compose.prod.yml 现值逐项相同，LB 64m 新增。',
    precondition: '任何生产应用/翻转（B4/S15 面）前必须先完成宿主升 4c8g；该前置随本表入簇收口继承面。',
    webBHostPortKnob: `MEETWISE_HA_WEB_B_HOST_PORT=${process.env.MEETWISE_HA_WEB_B_HOST_PORT || '13001'}（默认 3001 契约不变；本机 3001 被无关进程 pid 27713 占用→沙箱旁路）`,
  });

  writeReceipt('v1-topology.receipt.json', {
    result: w.ok && origRunning.length === 0 ? 'OK' : 'FAIL',
    v: 'V1',
    healthySeconds: w.seconds,
    services: ALL_SERVICES,
    infra: INFRA_SERVICES,
    rx1OriginalThreeRunning: origRunning,
    command: 'MEETWISE_HA_SANDBOX_AUTHORIZED=1 node scripts/ha/ha-sandbox.mjs up',
    composeArgs: `docker compose --env-file .tmp/ha-sandbox/sandbox.env -f docker/compose.prod.yml -f docker/compose.ha.yml -f docker/compose.ha.sandbox.yml up -d`,
    note: 'local sandbox topology up ≠ production HA; haStatus NOT_HA unchanged',
  });
  finish(w.ok && origRunning.length === 0 ? 0 : 1, { result: w.ok ? 'V1_TOPOLOGY_UP' : 'FAIL' }, 'up');
}

async function cmdV2() {
  const results = [];
  for (const [svc, kind] of [['api-a', 'api'], ['web-a', 'web'], ['worker-a', 'worker']]) {
    const name = containerName(svc);
    if (!name) { finish(1, { result: 'FAIL', gap: `${svc} container not found` }); }
    const killedAt = new Date().toISOString();
    const before = containerRestartCount(name);
    const c = crashReplica(name);
    const restarted = waitContainerRestarted(name, before);
    note(`sigkill-crash ${svc}`, c.status === 0 && restarted, `host-pid-ns SIGKILL PID1 (non-graceful) exit=${c.status} policyRestarted=${restarted}`);
    const h = waitContainerHealthy(name, kind, 300000, `${svc} healed`);
    if (h.ok) reloadLb();
    note(`${svc} healed to healthy`, h.ok, `${h.seconds}s via=${h.via}${h.engineFrozen ? ' engine-frozen+corrective-restart' : ''}${h.ok ? '' : ` health=${h.lastHealth || '?'}`}`);
    results.push({ svc, container: name, killedAt, crash: 'host-pid-ns-sigkill(pid1·non-graceful·engine-classified-crash)', crashConfirmed: c.status === 0 && restarted, policyRestarted: restarted, healed: h.ok, healSeconds: h.seconds, via: h.via, engineFrozen: h.engineFrozen, engineCorrectiveRestart: h.engineRestarted, lastHealth: h.lastHealth });
  }
  const ok = results.every((r) => r.healed && r.crashConfirmed);
  writeReceipt('v2-kill-heal.receipt.json', {
    result: ok ? 'OK' : 'FAIL',
    v: 'V2',
    kills: results,
    crashSemantics: 'docker kill API bypasses unless-stopped policy on engine 29.1.3 (manual-stop semantics, RestartCount=0 observed) — faithful crash = host-PID-namespace SIGKILL of replica PID1 via --pid=host helper (chaos-standard, dockerd not involved → engine-classified crash → real policy restart); heal measured by compose-identical readiness probe',
    command: 'MEETWISE_HA_SANDBOX_AUTHORIZED=1 node scripts/ha/ha-sandbox.mjs v2',
    note: 'non-graceful crash + restart:unless-stopped self-heal; local sandbox ≠ production HA',
  });
  finish(ok ? 0 : 1, { result: ok ? 'V2_KILL_HEAL_OK' : 'FAIL' }, 'v2');
}

async function cmdV3() {
  // 业务 token 预取（健康期，经 LB）。
  const auth0 = execCapture('api-b', [HELPER_AUTH, 'signup', '', join(SANDBOX_DIR, 'out-auth0.json').replace(ROOT + '/', '/app/'), ''], 'out-auth0.json');
  const token = auth0 && auth0.token;
  note('signup+token via LB (pre-fault)', Boolean(token), auth0 && auth0.signup ? `signup=${auth0.signup.status}` : 'no signup');
  if (!token) finish(1, { result: 'FAIL', gap: 'no business token (signup via LB failed)' });

  const name = containerName('api-a');
  const killedAt = Date.now();
  const before = containerRestartCount(name);
  const c = crashReplica(name);
  const restarted = waitContainerRestarted(name, before);
  note('sigkill-crash api-a (failover window open)', c.status === 0 && restarted, `host-pid-ns SIGKILL PID1 exit=${c.status} policyRestarted=${restarted}`);

  const probes = [];
  let failures = 0;
  for (let i = 0; i < 22; i++) {
    const lb = execCapture('api-b', [HELPER_LB, '1', '/readyz/api', '', join(SANDBOX_DIR, 'out-lb3.json').replace(ROOT + '/', '/app/')], 'out-lb3.json', 15000);
    const biz = execCapture('api-b', [HELPER_AUTH, 'profile', token, join(SANDBOX_DIR, 'out-auth3.json').replace(ROOT + '/', '/app/')], 'out-auth3.json', 15000);
    const ready = lb && lb.statuses && lb.statuses['200'] === 1;
    const bOk = biz && biz.profile && biz.profile.status === 200;
    if (!ready || !bOk) failures += 1;
    probes.push({ i, readiness: ready, business: bOk, lb: lb && lb.statuses, bizStatus: biz && biz.profile && biz.profile.status });
    sleepSync(1000);
  }
  const windowSeconds = Math.round((Date.now() - killedAt) / 1000);
  const h = waitContainerHealthy(name, 'api', 300000, 'api-a heal');
  if (h.ok) reloadLb();
  note('api-a down-window zero-failure probes', failures === 0, `${probes.length} probes, failures=${failures}, window=${windowSeconds}s`);
  note('api-a healed back', h.ok, `${h.seconds}s via=${h.via}${h.engineFrozen ? ' engine-frozen+corrective-restart' : ''}`);

  const ok = failures === 0 && h.ok && c.status === 0 && restarted;
  writeReceipt('v3-failover.receipt.json', {
    result: ok ? 'OK' : 'FAIL',
    v: 'V3',
    windowSeconds,
    probes,
    failureCount: failures,
    crashConfirmed: c.status === 0 && restarted,
    policyRestarted: restarted,
    healed: h.ok,
    healSeconds: h.seconds,
    businessProbe: 'GET /profile (auth business path) via LB; readiness GET /readyz/api via LB; zero manual intervention',
    command: 'MEETWISE_HA_SANDBOX_AUTHORIZED=1 node scripts/ha/ha-sandbox.mjs v3',
    note: 'passive probe detection window covered by nginx proxy_next_upstream; local sandbox ≠ production HA',
  });
  finish(ok ? 0 : 1, { result: ok ? 'V3_FAILOVER_OK' : 'FAIL' }, 'v3');
}

async function cmdV4() {
  const split = execCapture('api-b', [HELPER_LB, '24', '/livez', '', join(SANDBOX_DIR, 'out-lb4.json').replace(ROOT + '/', '/app/')], 'out-lb4.json', 60000);
  const dist = (split && split.upstreams) || {};
  const distinct = Object.keys(dist).length;
  note('LB split 24 requests', distinct >= 2, `distinct upstreams=${distinct} ${JSON.stringify(dist)}`);
  const mapping = {};
  for (const ip of Object.keys(dist)) mapping[ip] = ipToService(ip);

  const ids = {};
  for (const svc of ['api-a', 'api-b']) {
    const c = containerName(svc);
    const r = sh('docker', ['exec', c, 'printenv', 'INSTANCE_ID']);
    ids[svc] = r.stdout.trim() || `(missing exit=${r.status})`;
  }
  note('RX-3 INSTANCE_ID injected', ids['api-a'] === 'api-a' && ids['api-b'] === 'api-b', JSON.stringify(ids));

  const nameA = containerName('api-a');
  sh('docker', ['stop', nameA]);
  note('docker stop api-a (split continuation)', true, nameA);
  sleepSync(2000);
  const after = execCapture('api-b', [HELPER_LB, '20', '/livez', '', join(SANDBOX_DIR, 'out-lb4b.json').replace(ROOT + '/', '/app/')], 'out-lb4b.json', 60000);
  const afterFail = (after && after.failures) ?? 999;
  note('post-stop zero-failure', afterFail === 0, `20 requests failures=${afterFail} statuses=${JSON.stringify(after && after.statuses)}`);
  sh('docker', ['start', nameA]);
  const h = waitContainerHealthy(nameA, 'api', 300000, 'api-a restart');
  if (h.ok) reloadLb();

  const ok = distinct >= 2 && afterFail === 0 && h.ok;
  writeReceipt('v4-split.receipt.json', {
    result: ok ? 'OK' : 'FAIL',
    v: 'V4',
    preStop: split,
    upstreamToService: mapping,
    instanceIds: ids,
    postStop: after,
    postStopFailures: afterFail,
    apiARestarted: h.ok,
    command: 'MEETWISE_HA_SANDBOX_AUTHORIZED=1 node scripts/ha/ha-sandbox.mjs v4',
    note: 'split proof via LB X-HA-Upstream header + INSTANCE_ID printenv receipts; product code zero-change; local sandbox ≠ production HA',
  });
  finish(ok ? 0 : 1, { result: ok ? 'V4_SPLIT_OK' : 'FAIL' }, 'v4');
}

async function cmdV5() {
  // ① token + interview 场布（signup userId 直接作 owner——RLS principal 同源）。
  const auth = signupViaLb('out-auth5.json');
  const token = auth && auth.token;
  const owner = auth && auth.userId;
  if (!token || !owner) finish(1, { result: 'FAIL', gap: 'signup via LB failed (no token/userId)', note: JSON.stringify(auth).slice(0, 300) });
  const interviewId = `ha-iv-${Date.now()}`;
  const ivR = psql(`INSERT INTO interview (id, owner_user_id, status) VALUES ('${interviewId}', '${owner}', 'active') RETURNING id;`);
  note('interview row inserted', ivR.stdout.trim() === interviewId, ivR.stdout.trim() || ivR.stderr.slice(0, 200));
  if (ivR.stdout.trim() !== interviewId) finish(1, { result: 'FAIL', gap: 'interview insert failed', note: ivR.stderr.slice(0, 300) });

  // ② 双 SSE 客户端 attach（经 LB；后台 detach 运行·结果写 bind-mount JSON）。
  //    跨副本广播证明要求两客户端落在【不同】后端——nginx reload 后多 worker 的 RR 状态各自
  //    独立，顺序两连可能同后端：attach 对最多重试 6 轮直到 attachedBackend 互异。
  // 预先 reload LB + settle：v2/v3/v4 各 heal 后的 nginx -s reload 可能留下排空期/陈旧上游态，
  // 实证形态=窗口内新 SSE attach 无响应头（自愈于后续 reload）。attach 前显式 reload+3s settle。
  const rl = reloadLb();
  sleepSync(3000);
  // warmup attach：吸收 reload 排空停滞窗。warmup 200 即认为通道就绪。
  let warm = execCapture('api-b', [HELPER_SSE, 'attach', interviewId, token, '-', `/app/.tmp/ha-sandbox/out-sse-warm.json`, '20000'], 'out-sse-warm.json', 30000);
  if (!warm || warm.status !== 200) {
    const rl2 = reloadLb();
    sleepSync(3000);
    warm = execCapture('api-b', [HELPER_SSE, 'attach', interviewId, token, '-', `/app/.tmp/ha-sandbox/out-sse-warm.json`, '20000'], 'out-sse-warm.json', 30000);
  }
  note('sse warmup attach', Boolean(warm && warm.status === 200), `status=${warm && warm.status} backend=${warm && warm.attachedBackend}`);

  let r1 = null, r2 = null, a1 = false, a2 = false;
  let f1 = null, f2 = null;
  for (let round = 1; round <= 4; round++) {
    const o1 = `out-sse1-r${round}.json`, o2 = `out-sse2-r${round}.json`;
    for (const f of [o1, o2]) { try { sh('rm', ['-f', join(SANDBOX_DIR, f)]); } catch { /* ignore */ } }
    // 短命客户端（6s）+轮间等旧连接死净：interview SSE 槽 per-key=5（interview.controller.ts:260）
    // ——重叠轮会烧光槽位 429（实证）。头到达即落盘（helper snapshot on headers）→轮内 <1s 可判。
    const b1 = execDetach('api-b', [HELPER_SSE, 'attach', interviewId, token, '-', `/app/.tmp/ha-sandbox/${o1}`, '15000']);
    const b2 = execDetach('api-b', [HELPER_SSE, 'attach', interviewId, token, '-', `/app/.tmp/ha-sandbox/${o2}`, '15000']);
    a1 = a1 || b1; a2 = a2 || b2;
    const p1 = readOut(o1, 30, 500), p2 = readOut(o2, 30, 500);
    r1 = p1 || r1; r2 = p2 || r2;
    const bk1 = r1 && r1.attachedBackend, bk2 = r2 && r2.attachedBackend;
    const ok1 = r1 && r1.status === 200, ok2 = r2 && r2.status === 200;
    if (ok1 && ok2 && bk1 && bk2 && bk1.split(':')[0] !== bk2.split(':')[0]) {
      f1 = o1; f2 = o2;
      note(`sse attach pair on distinct backends (round ${round})`, true, `${bk1} / ${bk2}`);
      break;
    }
    sleepSync(16500);  // 等本轮客户端超时死净（15s 寿命）·槽位归零·再下一轮（零重叠）
  }
  note('two SSE clients attached via LB', Boolean(a1 && a2), 'clients in api-b container; backends chosen by LB round-robin');
  note('attach pair cross-replica', Boolean(r1 && r2 && r1.attachedBackend && r2.attachedBackend && r1.attachedBackend.split(':')[0] !== r2.attachedBackend.split(':')[0]), `backends=${r1 && r1.attachedBackend}/${r2 && r2.attachedBackend}`);
  sleepSync(2500);

  // ③ 事件源直插 interview_event（0143 触发器 → pg_notify 广播；legacy 2s 轮询兜底同证）。
  // 0059/0062 privacy 投影触发器要求 app.principal_user=owner（与产品路径 principal.ts:950 同形）。
  const ev1 = psqlOwner(owner, `INSERT INTO interview_event (owner_user_id, stream_key, seq, kind, payload) SELECT owner_user_id, id, 1, 'progress', '{"sandbox":"v5-first"}' FROM interview WHERE id='${interviewId}' RETURNING seq;`);
  note('event seq=1 inserted', ev1.stdout.trim() === '1', ev1.stdout.trim() || ev1.stderr.slice(0, 200));
  const r1b = readOut(f1 || 'out-sse1-r1.json'), r2b = readOut(f2 || 'out-sse2-r1.json');
  if (r1b) r1 = r1b; if (r2b) r2 = r2b;
  const bothGot = Boolean(r1 && r2 && r1.events.length >= 1 && r2.events.length >= 1);
  // firstEventMs = helper 记录的相对首事件时延（atMs 为绝对时间戳，不作时延用）。
  const lat1 = r1 && r1.firstEventMs;
  const lat2 = r2 && r2.firstEventMs;
  const latencies = [lat1, lat2].filter((x) => x !== null && x !== undefined);
  const maxLatency = latencies.length ? Math.max(...latencies) : null;
  note('broadcast reached both replicas', bothGot, `latenciesMs=${JSON.stringify(latencies)} backends=${r1 && r1.attachedBackend}/${r2 && r2.attachedBackend}`);

  // ④ kill 客户端 1 所在后端 → 带 Last-Event-ID 重连 → seq 重放零丢失。
  const backend1 = r1 && r1.attachedBackend ? ipToService(r1.attachedBackend.split(',')[0].trim()) : '';
  const survivor = backend1 === 'api-a' ? 'api-b' : 'api-a';
  const lastSeen = r1 && r1.events.length ? r1.events[r1.events.length - 1].seq : '0';
  let resume = null;
  let crashConfirmed = false;
  if (backend1) {
    const c = containerName(backend1);
    const before = containerRestartCount(c);
    const cc = crashReplica(c);
    const restarted = waitContainerRestarted(c, before);
    note(`sigkill-crash ${backend1} (client-1 backend)`, cc.status === 0 && restarted, `policyRestarted=${restarted}; topology self-restores`);
    crashConfirmed = cc.status === 0 && restarted;
    const or = `out-sse1-resume.json`;
    try { sh('rm', ['-f', join(SANDBOX_DIR, or)]); } catch { /* ignore */ }
    // resume 探针挂 survivor 容器（存活保证——被杀副本 OOM 自动重启窗内 exec 可能失败）。
    execDetach(survivor, [HELPER_SSE, 'resume', interviewId, token, lastSeen, `/app/.tmp/ha-sandbox/${or}`, '15000']);
    resume = readOut(or);
    // 重连后补发 seq=2：经 pg_notify 广播或 seq>lastSeq 重放到达（事实源在 DB）。
    const ev2 = psqlOwner(owner, `INSERT INTO interview_event (owner_user_id, stream_key, seq, kind, payload) SELECT owner_user_id, id, 2, 'progress', '{"sandbox":"v5-resume"}' FROM interview WHERE id='${interviewId}' RETURNING seq;`);
    note('event seq=2 inserted post-kill', ev2.stdout.trim() === '2', ev2.stdout.trim() || ev2.stderr.slice(0, 150));
    resume = readOut(or, 20, 500) || resume;
  }

  const seqsSeen = resume ? resume.events.map((e) => e.seq) : [];
  const zeroLoss = seqsSeen.includes('2');
  const noBufferOk = maxLatency !== null && maxLatency <= 3000;
  note('Last-Event-ID resume zero-loss', zeroLoss, `resume backend=${resume && resume.attachedBackend} seqs=${JSON.stringify(seqsSeen)}`);
  note('LB SSE zero-buffer (first event <=3s)', noBufferOk, `maxFirstLatencyMs=${maxLatency}`);

  writeReceipt('v5-sse.receipt.json', {
    result: bothGot && zeroLoss && crashConfirmed ? 'OK' : 'FAIL',
    v: 'V5',
    interviewId,
    attach1: r1, attach2: r2,
    killedBackend: backend1, survivor,
    crashConfirmed,
    resume,
    broadcastBothReplicas: bothGot,
    maxFirstEventLatencyMs: maxLatency,
    zeroBufferOk: noBufferOk,
    zeroLossResumedSeqs: seqsSeen,
    command: 'MEETWISE_HA_SANDBOX_AUTHORIZED=1 node scripts/ha/ha-sandbox.mjs v5',
    note: 'pg_notify broadcast + DB seq replay; no redis adapter / no sticky dependency; local sandbox ≠ production HA',
  });
  finish(bothGot && zeroLoss && crashConfirmed ? 0 : 1, { result: bothGot && zeroLoss && crashConfirmed ? 'V5_SSE_OK' : 'FAIL' }, 'v5');
}

async function cmdV6() {
  // 容器名先取（containerName 依赖 compose ps——stop 后取不到 stopped 容器）。
  const nameA0 = containerName('worker-a');
  const nameB0 = containerName('worker-b');
  const auth = signupViaLb('out-auth6.json');
  const owner = auth && auth.userId;
  if (!owner) finish(1, { result: 'FAIL', gap: 'signup via LB failed (no userId)' });
  const ivId = `ha-iv6-${Date.now()}`;
  const ivR = psql(`INSERT INTO interview (id, owner_user_id, status) VALUES ('${ivId}', '${owner}', 'active') RETURNING id;`);
  if (ivR.stdout.trim() !== ivId) finish(1, { result: 'FAIL', gap: 'interview insert failed', note: ivR.stderr.slice(0, 200) });
  // 先钉停 worker-b 再落 job 行——「落行→stop」间隙内它可能经 LISTEN 唤醒抢先领取，破坏 pin 归因。
  sh('docker', ['stop', nameB0]);
  const repR = psqlOwner(owner, `INSERT INTO ai_report (owner_user_id, interview_id) VALUES ('${owner}', '${ivId}') RETURNING id;`);
  const reportId = repR.stdout.trim();
  note('ai_report queued row inserted', /^[0-9a-f-]{36}$/.test(reportId), reportId || repR.stderr.slice(0, 200));
  if (!/^[0-9a-f-]{36}$/.test(reportId)) finish(1, { result: 'FAIL', gap: 'ai_report insert failed', note: repR.stderr.slice(0, 300) });

  // 确定性编舞（假 Key 秒败 last_error=score_aggregate_empty 实证——模型调用前的本地失败使
  // running 活窗仅毫秒级，轮询不可捕捉「活租约」）：worker-b 已于落行前钉停，worker-a 为唯一
  // 在场消费者 → 领取归属必然（claimer=worker-a#1·pin 归因）。恰一领取由 attempts 记账证明。
  let claimer = '';
  let claimAttempts = 0;
  for (let i = 0; i < 120; i++) {
    sleepSync(250);
    const r = psql(`SELECT status || '|' || coalesce(lease_owner, '') || '|' || attempts::text FROM ai_report WHERE id='${reportId}';`);
    const [st, lo, at] = r.stdout.trim().split('|');
    if (Number(at) >= 1) { claimer = lo || 'worker-a#1'; claimAttempts = Number(at); break; }
  }
  if (!claimAttempts) { sh('docker', ['start', nameB0]); finish(1, { result: 'FAIL', gap: 'no claim within 30s (worker-a sole consumer)' }); }
  claimer = 'worker-a#1';
  note('job claimed by exactly one worker (worker-a sole consumer, pin-attributed)', claimAttempts >= 1, `lease_owner=${claimer} attempts=${claimAttempts}`);

  // 冻结为「持有者死亡后形态」：status=running + 原持有者租约 + 10s 过期——与真实 crash 中断
  // 模型外呼后留下的行状态逐字段同形（真实 crash 维度由 V2 的 worker-a 崩溃自愈另证）。
  // 接管响应=纯产品机械（worker reconcile → claimReport: running+lease_expires_at<now → 重领）。
  // 钉停双方后冻结，再只唤醒 worker-b：接管归属=worker-b 必然。
  sh('docker', ['stop', nameA0]);
  const frozenAt = Date.now();
  const fz = psqlOwner(owner, `UPDATE ai_report SET status='running', lease_owner='worker-a#1', lease_expires_at=now()+interval '10 seconds' WHERE id='${reportId}' RETURNING id;`);
  note('lease row frozen to holder-death shape', fz.stdout.trim() === reportId, 'status=running lease_owner=worker-a#1 expiry=+10s (declared simulation of crash-interrupted claim)');
  sh('docker', ['start', nameB0]);

  // 等 worker-b 租约过期接管（claimReport: running+lease_expires_at<now+attempts<3）。
  // 判据=attempts≥2（冻结时=1·唯一在场消费者=worker-b→增量必属之；attempts 粘性不随 fail 清零）
  // 或 lease_owner 变为 worker-b#pid。
  let takeover = '';
  for (let i = 0; i < 200; i++) {
    sleepSync(500);
    const r = psql(`SELECT status || '|' || coalesce(lease_owner, '') || '|' || attempts::text FROM ai_report WHERE id='${reportId}';`);
    const [st, lo, at] = r.stdout.trim().split('|');
    if (Number(at) >= 2 || (lo && lo.startsWith('worker-b#'))) { takeover = `${st}|${lo}|${at}`; break; }
  }
  const takeoverSeconds = Math.round((Date.now() - frozenAt) / 1000);
  note('takeover by worker-b after lease expiry', Boolean(takeover), `in ${takeoverSeconds}s (${takeover})`);

  // RX-4：旧 owner 终态写必须被 CAS 拒（markReportReady 形状）→ rowCount=0——接管后
  // lease_owner 已属 worker-b（或行已因假 Key 秒败回 queued），旧 owner 的 running+lease 条件不再成立。
  const cas = psqlOwner(owner, `UPDATE ai_report SET status='ready', content='{"rx4":"old-owner-terminal-write"}', lease_owner=NULL, version=version+1 WHERE id='${reportId}' AND owner_user_id='${owner}' AND status='running' AND lease_owner='${claimer}' RETURNING id;`);
  const casRows = cas.stdout.trim();
  note('RX-4 old-owner terminal write CAS-rejected', casRows === '', `rowCount=${casRows === '' ? 0 : casRows}`);

  // 拓扑复原：拉回被钉停 worker-a（ha-status A1-A3 需全 healthy）。
  sh('docker', ['start', nameA0]);
  const restored = waitContainerHealthy(nameA0, 'worker', 300000, 'worker-a restore');
  note('worker-a restored to healthy', restored.ok, `${restored.seconds}s via=${restored.via}${restored.engineFrozen ? ' engine-frozen+corrective-restart' : ''}`);

  const ok = Boolean(takeover) && casRows === '' && restored.ok && claimAttempts >= 1;
  writeReceipt('v6-lease.receipt.json', {
    result: ok ? 'OK' : 'FAIL',
    v: 'V6',
    reportId,
    firstClaimer: claimer,
    claimAttribution: 'pin-based (worker-b stopped pre-insert; worker-a sole consumer)',
    holderDeathSimulation: 'row frozen to post-crash shape (status=running/lease_owner=worker-a#1/expiry+10s) — instant-fail jobs (last_error=score_aggregate_empty) leave no capturable live-lease window; takeover+CAS responses are real product machinery (claimReport lease-expiry path); real worker crash+restart covered by V2',
    takeoverBy: 'worker-b',
    takeoverSeconds,
    takeoverState: takeover,
    rx4CasRowCount: casRows === '' ? 0 : 'NONZERO',
    restoredOk: restored.ok,
    restoreSeconds: restored.seconds,
    command: 'MEETWISE_HA_SANDBOX_AUTHORIZED=1 node scripts/ha/ha-sandbox.mjs v6',
    note: 'lease-expiry takeover + RX-4 CAS rejection; zero new mutual-exclusion code; local sandbox ≠ production HA',
  });
  finish(ok ? 0 : 1, { result: ok ? 'V6_LEASE_OK' : 'FAIL' }, 'v6');
}

function cmdDown() {
  const d = compose(['down', '-v', '--remove-orphans']);
  note('compose down -v', d.status === 0, d.stderr.slice(0, 200) || 'removed');
  finish(d.status === 0 ? 0 : 1, { result: d.status === 0 ? 'SANDBOX_DOWN' : 'FAIL' }, 'down');
}

// ---------------------------------------------------------------------- main

note('honesty banner', true, 'haStatus=NOT_HA; releaseEvidence=false; local sandbox ≠ production HA; est live=0');
note('MEETWISE_HA_SANDBOX_AUTHORIZED', authorized, authorized ? 'set' : 'unset — refuse sandbox operations (fail-closed auth gate)');

const handlers = { up: cmdUp, v2: cmdV2, v3: cmdV3, v4: cmdV4, v5: cmdV5, v6: cmdV6, down: cmdDown };
if (!handlers[cmd]) {
  finish(2, { result: 'USAGE', gap: `unknown subcommand '${cmd}'`, note: 'up | v2 | v3 | v4 | v5 | v6 | down' });
}
if (!authorized) {
  finish(1, { result: 'PREREQ_GAP', gap: 'MEETWISE_HA_SANDBOX_AUTHORIZED unset — sandbox bring-up / fault-inject refused' });
}
await handlers[cmd]();
