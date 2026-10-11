#!/usr/bin/env node
/**
 * Meetwise check-alerts metrics smoke — HA-7 R-24 §4 B.8 实栈烟测（轻·单遍·沙箱哑凭据·est live=0）。
 *
 * 载体零改复用 docker/compose.ha.sandbox.yml 形制（同 scripts/alerts/check-alerts-sandbox-smoke.mjs HA-5 先例：
 * env-file + prod + ha + sandbox 三 -f · ha-pg/ha-redis/migrate + worker-a 沙箱材质）。
 *
 * Fail-closed：无 MEETWISE_HA_SANDBOX_AUTHORIZED=1 一律拒跑（沿 ha-sandbox.mjs 授权闸形）。
 *
 * 步骤：
 *   1) 生成沙箱 env-file（镜像 ha-sandbox.mjs genEnvFile 逐字面形——哑凭据 tmpfs 即灭·非生产）
 *   2) compose up -d ha-pg ha-redis → 等 healthy
 *   3) compose up -d migrate（restart:"no" 一次性）→ ExitCode=0
 *   4) compose run -d --name ha7-worker-metrics -p 19091:9091 worker-a（沙箱材质·一次性容器·显式发布 9091 到宿主；
 *      零改 compose 文件本体——monitoring 栈四文件与 compose.prod/ha/sandbox 皆零触）
 *   5) 宿主 GET /metrics（真通路）→ 断言三 gauge + 新 counter 全 12 序列（4 指标 × 4 queue）
 *   6) check-alerts --sandbox live 通路对真 /metrics 评估（WORKER_METRICS_URL 指向宿主发布口）→ 干净栈 EXIT=0 + RECEIPT
 *      （metrics_gauge 三事件零条目；logs/ps/df 同真通路干净）
 *   7) 交叉验证：同一 /metrics 快照经 --metrics-file 注入缝 offline 复评 → 同判 EXIT=0（注入缝与 live 通路 parity）
 *   8) teardown：docker rm -f 一次性容器 + compose down -v（沙箱全灭）
 *
 * 收据：receipts/ha-7/check-alerts-metrics-smoke.receipt.json。
 * haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · est live=0
 * （本地沙箱哑凭据·零生产操作·零真实流量·零模型调用计费——worker 价格源 ha-sandbox.invalid 哑值·embedder 哑 Key）
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '../..');
const F = {
  prod: join(ROOT, 'docker/compose.prod.yml'),
  ha: join(ROOT, 'docker/compose.ha.yml'),
  sandbox: join(ROOT, 'docker/compose.ha.sandbox.yml'),
};
const SANDBOX_DIR = join(ROOT, '.tmp/ha7-smoke');
// env-file 必须落 check-alerts.mjs --sandbox 的 canonical 路径（.tmp/ha-sandbox/sandbox.env·HA-5/ha-sandbox.mjs 同址）——判定器三缝按此路径拼 compose args。
const ENV_FILE = join(ROOT, '.tmp/ha-sandbox', 'sandbox.env');
const CA_PATH = join(ROOT, '.tmp/ha-sandbox', 'dummy-ca.pem');
const SNAPSHOT = join(SANDBOX_DIR, 'metrics-snapshot.txt');
const RECEIPTS = join(ROOT, 'receipts/ha-7');
const RECEIPT_OUT = join(RECEIPTS, 'check-alerts-metrics-smoke.receipt.json');
const HOST_METRICS_PORT = process.env.HA7_METRICS_HOST_PORT || '19091';
const WORKER_CONTAINER = 'ha7-worker-metrics';
const COMPOSE_BASE = ['--env-file', ENV_FILE, '-f', F.prod, '-f', F.ha, '-f', F.sandbox];
const METRICS_URL = `http://127.0.0.1:${HOST_METRICS_PORT}/metrics`;

const authorized = process.env.MEETWISE_HA_SANDBOX_AUTHORIZED === '1';
if (!authorized) {
  console.error('[alerts:smoke7] 拒跑：缺 MEETWISE_HA_SANDBOX_AUTHORIZED=1（沿 ha-sandbox.mjs 授权闸形）');
  process.exit(2);
}

/** @type {{ step: string; ok: boolean; detail?: string }[]} */
const steps = [];
function note(step, ok, detail) {
  steps.push({ step, ok, detail });
  console.error(`[alerts:smoke7] ${ok ? 'PASS' : 'FAIL'} ${step}${detail ? ` — ${detail}` : ''}`);
}
function sh(bin, args) {
  const r = spawnSync(bin, args, { encoding: 'utf8', cwd: ROOT, maxBuffer: 64 * 1024 * 1024 });
  return { status: r.status ?? 1, stdout: r.stdout || '', stderr: r.stderr || '' };
}
function compose(args) {
  return sh('docker', ['compose', ...COMPOSE_BASE, ...args]);
}
function sleepSync(ms) {
  const till = Date.now() + ms;
  while (Date.now() < till) { /* busy wait 同 ha-sandbox waitContainerRestarted 形 */ }
}
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
async function fetchMetricsText(url, timeoutMs = 5000) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
    if (!res.ok) return { error: `HTTP ${res.status}` };
    return { text: await res.text() };
  } catch (e) {
    return { error: String(e?.message ?? e) };
  }
}

// ------------------------------------------------------- env-file（镜像 ha-sandbox.mjs genEnvFile·同 HA-5 smoke 逐字面形）
function requiredVarNames() {
  const names = new Set();
  for (const f of [F.prod, F.ha]) {
    const t = readFileSync(f, 'utf8');
    for (const m of t.matchAll(/\$\{([A-Z][A-Z0-9_]*):\?[^}]*\}/g)) names.add(m[1]);
  }
  return [...names].sort();
}
const PW = {
  pgSuper: ['meetwise', '_ha_pg_dev_', 'password'].join(''),
  runtime: ['ha_', 'runtime_dev_', 'pw'].join(''),
  qbank: ['ha_', 'qbank_control_dev_', 'pw'].join(''),
  rag: ['ha_', 'rag_control_dev_', 'pw'].join(''),
  auth: ['ha-sandbox-dev-', 'secret-', '0'.repeat(32)].join(''),
  dummy: ['ha-sandbox-', 'dummy-', 'key'].join(''),
};
function genEnvFile() {
  mkdirSync(SANDBOX_DIR, { recursive: true });
  mkdirSync(dirname(ENV_FILE), { recursive: true });   // env-file canonical 目录（.tmp/ha-sandbox/·check-alerts --sandbox 按此路径取）
  const PG = `postgres://meetwise:${PW.pgSuper}@ha-pg:5432/meetwise`;
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
    BACKEND_IMAGE: process.env.MEETWISE_HA_SANDBOX_BACKEND_IMAGE || 'meetwise-backend:ha-dual-local',
    WEB_IMAGE: 'node:22-slim@sha256:d649c27dae7ba0137b3cef5dd75baa422c08dc3d9e3fc0c23db172dc3cc6436',
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
  const lines = ['# GENERATED by scripts/alerts/check-alerts-metrics-smoke.mjs（镜像 ha-sandbox.mjs genEnvFile 形）— local sandbox placeholders ONLY. Never production. #'];
  for (const name of requiredVarNames()) {
    let v = semantic[name];
    if (v === undefined) {
      // 回落启发式逐字面同 ha-sandbox.mjs（新增强制变量自动覆盖·漂移免疫）。
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
  if (!lines.some((l) => l.startsWith('MEETWISE_HA_WEB_B_HOST_PORT='))) {
    lines.push(`MEETWISE_HA_WEB_B_HOST_PORT=${process.env.MEETWISE_HA_WEB_B_HOST_PORT || '13001'}`);
  }
  writeFileSync(ENV_FILE, `${lines.join('\n')}\n`, 'utf8');
  writeFileSync(CA_PATH, '-----BEGIN CERTIFICATE-----\nha-sandbox-dummy-ca (SSL disabled in sandbox; placeholder only)\n-----END CERTIFICATE-----\n', 'utf8');
  note('sandbox env-file generated (mirrored form)', true, `${requiredVarNames().length} required vars + knob; ${ENV_FILE}`);
}

// ---------------------------------------------------------------- main
const t0 = Date.now();
let result = 'OK';
let gap;
genEnvFile();

// 1) ha-pg + ha-redis up + healthy
{
  const up = compose(['up', '-d', 'ha-pg', 'ha-redis']);
  const ok = up.status === 0;
  note('compose up -d ha-pg ha-redis', ok, ok ? 'started' : (up.stderr || '').slice(0, 200));
  if (!ok) result = 'FAIL';
}
{
  const t1 = Date.now();
  let healthy = false;
  for (;;) {
    const es = composePsJson();
    const pg = es.find((x) => x.Service === 'ha-pg');
    const rd = es.find((x) => x.Service === 'ha-redis');
    healthy = Boolean(pg && pg.State === 'running' && String(pg.Health).toLowerCase() === 'healthy'
      && rd && rd.State === 'running' && String(rd.Health).toLowerCase() === 'healthy');
    if (healthy || Date.now() - t1 > 120000) break;
    sleepSync(2000);
  }
  note('ha-pg + ha-redis healthy', healthy, `${Math.round((Date.now() - t1) / 1000)}s`);
  if (!healthy) result = 'FAIL';
}

// 2) migrate 一次性 → Exit 0
let migrateExitCode = null;
{
  if (result === 'OK') {
    compose(['up', '-d', 'migrate']);
    const t1 = Date.now();
    for (;;) {
      const e = composePsJson().find((x) => x.Service === 'migrate');
      if (e && e.State === 'exited') { migrateExitCode = Number(e.ExitCode); break; }
      if (Date.now() - t1 > 420000) break;
      sleepSync(3000);
    }
    const ok = migrateExitCode === 0;
    note('migrate exited', ok, `ExitCode=${migrateExitCode} in ${Math.round((Date.now() - t1) / 1000)}s`);
    if (!ok) { result = 'FAIL'; gap = 'migrate did not exit 0 in window'; }
  } else {
    note('migrate exited', false, 'skipped: prior step failed');
  }
}

// 3) 一次性 worker 容器（compose run·显式发布 9091 到宿主——零改 compose 文件）
{
  if (result === 'OK') {
    sh('docker', ['rm', '-f', WORKER_CONTAINER]);
    const run = compose(['run', '-d', '--name', WORKER_CONTAINER, '-p', `${HOST_METRICS_PORT}:9091`, 'worker-a']);
    const ok = run.status === 0;
    note(`compose run -d --name ${WORKER_CONTAINER} -p ${HOST_METRICS_PORT}:9091 worker-a`, ok, ok ? 'started' : (run.stderr || '').slice(0, 200));
    if (!ok) { result = 'FAIL'; gap = 'compose run worker-a failed'; }
  } else {
    note('compose run worker-a', false, 'skipped: prior step failed');
  }
}

// 4) 宿主 GET /metrics 真通路 → 等 gauge 循环首拍（15s 级）→ 12 序列断言（4 指标 × 4 queue）
let metricsText = '';
{
  if (result === 'OK') {
    const t1 = Date.now();
    let ready = false;
    for (;;) {
      const r = await fetchMetricsText(METRICS_URL);
      if (!r.error) { ready = true; metricsText = r.text; break; }
      if (Date.now() - t1 > 180000) { gap = `worker /metrics unreachable: ${r.error}`; break; }
      sleepSync(3000);
    }
    note('worker /metrics reachable from host (live GET)', ready, ready ? `${metricsText.split('\n').length} lines in ${Math.round((Date.now() - t1) / 1000)}s` : (gap ?? ''));
    if (!ready) result = 'FAIL';
  } else {
    note('worker /metrics reachable', false, 'skipped: prior step failed');
  }
}
const QUEUE_SERIES = ['worker_jobs_queued', 'worker_jobs_running_expired', 'worker_jobs_dead', 'worker_jobs_failed_total'];
const QUEUES = ['interview_job', 'report', 'quiz_job', 'diagnosis_job'];
{
  if (result === 'OK') {
    let series = 0;
    const missing = [];
    for (const metric of QUEUE_SERIES) {
      for (const q of QUEUES) {
        const re = new RegExp(`^${metric}\\{queue="${q}"\\} \\d+(\\.\\d+)?$`, 'm');
        if (re.test(metricsText)) series++;
        else missing.push(`${metric}{queue="${q}"}`);
      }
    }
    const ok = series === 16;
    note('/metrics 全序列（三 gauge 12 序列 + 新 counter worker_jobs_failed_total 4 队列 = 4 指标×4 队列全覆盖）', ok, ok ? '16/16' : `got=${series} missing=${missing.join(',')}`);
    if (!ok) { result = 'FAIL'; gap = `expected 12 series, got ${series}`; }
    writeFileSync(SNAPSHOT, metricsText, 'utf8');
  } else {
    note('/metrics 12 序列', false, 'skipped: prior step failed');
  }
}

// 5) check-alerts --sandbox live 通路对真 /metrics 评估 → 干净栈 EXIT=0
let judge = null;
{
  if (result === 'OK') {
    const rec = join(SANDBOX_DIR, 'check-alerts.receipt.json');
    const r = spawnSync(process.execPath, [join(__dirname, 'check-alerts.mjs'), '--sandbox', '--since', '1h', '--receipt', rec],
      { encoding: 'utf8', cwd: ROOT, maxBuffer: 32 * 1024 * 1024, env: { ...process.env, WORKER_METRICS_URL: METRICS_URL } });
    judge = { exit: r.status ?? 1, receipt: existsSync(rec) ? JSON.parse(readFileSync(rec, 'utf8')) : null };
    const alerts = judge.receipt?.alerts ?? [];
    const srcMetrics = String(judge.receipt?.sources?.metrics ?? '');
    const ok = r.status === 0 && alerts.length === 0 && srcMetrics.includes('(live)');
    note('check-alerts --sandbox live 对真 /metrics：干净栈 EXIT=0 + 零条目 + metrics 源 (live)', ok,
      `exit=${r.status} alerts=${alerts.length} sources.metrics=${srcMetrics.slice(0, 80)} sourceErrors=${JSON.stringify(judge.receipt?.sources?.sourceErrors ?? [])}`);
    if (!ok) { result = 'FAIL'; gap = 'live judge not clean (see receipt sources/alerts)'; }
  } else {
    note('check-alerts --sandbox live', false, 'skipped: prior step failed');
  }
}

// 6) 交叉验证：同一 /metrics 快照经 --metrics-file 注入缝 offline 复评 → 同判（通路 parity）
{
  if (result === 'OK') {
    // 夹具先落盘再跑（logs/ps/df 三缝 clean 样本——只验证 metrics 注入缝 parity,不掺其他源噪声）。
    writeFileSync(join(SANDBOX_DIR, 'clean-empty.log'), '2026-10-11T00:00:00.000000000Z meetwise-ha7-api-1 | GET /readyz 200\n');
    writeFileSync(join(SANDBOX_DIR, 'clean-ps.json'), JSON.stringify([{ Service: 'migrate', State: 'exited', ExitCode: 0 }]));
    writeFileSync(join(SANDBOX_DIR, 'clean-df.txt'), 'Filesystem 1024-blocks Used Available Capacity Mounted on\n/dev/disk1 1000000 400000 600000 40% /\n');
    const rec = join(SANDBOX_DIR, 'check-alerts-injected.receipt.json');
    const r = spawnSync(process.execPath, [join(__dirname, 'check-alerts.mjs'), '--offline',
      '--log-file', join(SANDBOX_DIR, 'clean-empty.log'), '--ps-file', join(SANDBOX_DIR, 'clean-ps.json'),
      '--df-file', join(SANDBOX_DIR, 'clean-df.txt'), '--metrics-file', SNAPSHOT, '--receipt', rec],
      { encoding: 'utf8', cwd: ROOT, maxBuffer: 32 * 1024 * 1024 });
    const rj = existsSync(rec) ? JSON.parse(readFileSync(rec, 'utf8')) : null;
    const ok = r.status === 0 && (rj?.alerts?.length ?? 0) === 0 && String(rj?.sources?.metrics ?? '').includes('(injected)');
    note('同一快照经 --metrics-file offline 复评 → 同判 EXIT=0（注入缝 parity）', ok, `exit=${r.status} alerts=${rj?.alerts?.length} sources.metrics=${String(rj?.sources?.metrics).slice(0, 80)}`);
    if (!ok) { result = 'FAIL'; gap = 'injected-seam parity check failed'; }
  } else {
    note('--metrics-file parity', false, 'skipped: prior step failed');
  }
}

// 7) teardown：一次性容器 + 沙箱全灭（tmpfs pg/redis 随容器销毁）
{
  sh('docker', ['rm', '-f', WORKER_CONTAINER]);
  const down = compose(['down', '-v']);
  note('teardown: rm one-shot worker + compose down -v (sandbox fully destroyed)', down.status === 0, down.status === 0 ? 'removed' : (down.stderr || '').slice(0, 200));
}

const receipt = {
  at: new Date().toISOString(),
  durationMs: Date.now() - t0,
  result,
  gap,
  haStatus: 'NOT_HA',
  releaseEvidence: false,
  claimProductionHA: false,
  estLive: '0 (local sandbox dumb credentials; zero production operations, zero real traffic, zero model calls billed)',
  carrier: 'docker/compose.ha.sandbox.yml 零改复用（ha-pg+ha-redis+migrate+worker-a 沙箱材质·compose run 显式发布 9091·compose 文件本体零触）',
  migrateExitCode,
  metricsUrl: METRICS_URL,
  judge,
  steps,
};
mkdirSync(RECEIPTS, { recursive: true });
writeFileSync(RECEIPT_OUT, `${JSON.stringify(receipt, null, 2)}\n`);

const lines = [
  '===== RECEIPT alerts:metrics-smoke (HA-7) =====',
  `result: ${result}`,
  `migrateExitCode: ${migrateExitCode}`,
  `judge: exit=${judge?.exit} alerts=${judge?.receipt?.alerts?.length ?? 'n/a'} sources.metrics=${String(judge?.receipt?.sources?.metrics ?? 'n/a').slice(0, 80)}`,
  `haStatus: NOT_HA · releaseEvidence: false · claimProductionHA: false · estLive: 0`,
  ...(gap ? [`gap: ${gap}`] : []),
];
for (const s of steps) lines.push(`step: ${s.ok ? 'PASS' : 'FAIL'} | ${s.step}${s.detail ? ` | ${s.detail}` : ''}`);
lines.push('===== END RECEIPT =====');
console.log(lines.join('\n'));
const exit = result === 'OK' ? 0 : 1;
console.log(`CMD=MEETWISE_HA_SANDBOX_AUTHORIZED=1 node scripts/alerts/check-alerts-metrics-smoke.mjs EXIT=${exit}`);
process.exit(exit);
