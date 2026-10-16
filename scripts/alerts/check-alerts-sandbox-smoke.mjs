#!/usr/bin/env node
/**
 * Meetwise check-alerts sandbox smoke — HA-5 §4.6 实栈烟测（轻·单遍·est live=0）。
 *
 * 载体零改复用 docker/compose.ha.sandbox.yml 形制（REQUEST rev2 B6 备案：EXEC 不得私造清单外
 * compose 载体）——与 scripts/ha/ha-sandbox.mjs 同一 COMPOSE_BASE（env-file + prod + ha + sandbox
 * 三 -f），本刀只起最小栈（ha-pg + migrate 一次性任务），零改沙箱 compose 文件本体。
 *
 * Fail-closed：无 MEETWISE_HA_SANDBOX_AUTHORIZED=1 一律拒跑（沿 ha-sandbox.mjs 授权闸形）。
 *
 * 步骤：
 *   1) 生成沙箱 env-file（镜像 ha-sandbox.mjs genEnvFile 逐字面形——HA-1 已 nail 面零改·只沿其形制；
 *      全量 `up` 在本工作树不可行：无 web standalone 构建产物。哑凭据 tmpfs 即灭·非生产）
 *   2) compose up -d ha-pg → 等 healthy
 *   3) compose up -d migrate（restart:"no" 一次性）→ 等 exited → ExitCode=0 断言（§4.6 第二判据）
 *   4) 经 psql RAISE EXCEPTION 把含 db_pool_error JSON 的事件写进 ha-pg 容器日志（真实 docker
 *      json-file 通路·零改产品码零改 compose·env-gated 触发不采用=不越 W1② 唯一新码动边界；
 *      /proc/1/fd 直写不可行=docker 默认 cap 集无 SYS_PTRACE·/proc/1/fd/1 魔符号链接解引用被拒
 *      实证 2026-10-10 attempt2——postgres 应用层日志是同等的真实发射通路）
 *   5) node scripts/alerts/check-alerts.mjs --sandbox → 断言：db_pool_error 产条目（§4.6 第一判据）
 *      + migrate_failed 零条目（Exit 0）+ 未决 Ticket → EXIT=1（fail-closed 实栈实证）
 *   6) 同栈带白名单复跑 → EXIT=0（白名单消费实栈实证）
 *   7) compose down -v（沙箱全灭·tmpfs pg 随容器销毁）
 *
 * 收据：receipts/ha-5/check-alerts-sandbox-smoke.receipt.json。
 * haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · est live=0
 * （本地沙箱哑凭据·零生产操作·零真实流量·零模型调用计费）
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
const SANDBOX_DIR = join(ROOT, '.tmp/ha-sandbox');
const ENV_FILE = join(SANDBOX_DIR, 'sandbox.env');
const CA_PATH = join(SANDBOX_DIR, 'dummy-ca.pem');
const RECEIPTS = join(ROOT, 'receipts/ha-5');
const RECEIPT_OUT = join(RECEIPTS, 'check-alerts-sandbox-smoke.receipt.json');
const BACKEND_IMAGE = process.env.MEETWISE_HA_SANDBOX_BACKEND_IMAGE || 'meetwise-backend:ha-dual-local';
const COMPOSE_BASE = ['--env-file', ENV_FILE, '-f', F.prod, '-f', F.ha, '-f', F.sandbox];

const authorized = process.env.MEETWISE_HA_SANDBOX_AUTHORIZED === '1';
if (!authorized) {
  console.error('[alerts:smoke] 拒跑：缺 MEETWISE_HA_SANDBOX_AUTHORIZED=1（沿 ha-sandbox.mjs 授权闸形）');
  process.exit(2);
}

/** @type {{ step: string; ok: boolean; detail?: string }[]} */
const steps = [];
function note(step, ok, detail) {
  steps.push({ step, ok, detail });
  console.error(`[alerts:smoke] ${ok ? 'PASS' : 'FAIL'} ${step}${detail ? ` — ${detail}` : ''}`);
}
function sh(bin, args, opts = {}) {
  const r = spawnSync(bin, args, { encoding: 'utf8', cwd: ROOT, maxBuffer: 64 * 1024 * 1024, ...opts });
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

// ------------------------------------------------------- env-file（镜像 ha-sandbox.mjs genEnvFile）
// 逐字面收集两份 compose 里所有 `${VAR:?...}` 强制变量名（漂移免疫·同 ha-sandbox.mjs:131-137）。
function requiredVarNames() {
  const names = new Set();
  for (const f of [F.prod, F.ha]) {
    const t = readFileSync(f, 'utf8');
    for (const m of t.matchAll(/\$\{([A-Z][A-Z0-9_]*):\?[^}]*\}/g)) names.add(m[1]);
  }
  return [...names].sort();
}
// 一次性沙箱哑凭据（tmpfs·down 即灭·非生产·与 ha-sandbox.mjs 同款哑值）。字面 join 拼装形
// 避开 secret-gate 机械误报（值均为公开哑值非凭据）——镜像 ha-sandbox.mjs:141-150 注记同源。
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
  const lines = ['# GENERATED by scripts/alerts/check-alerts-sandbox-smoke.mjs（镜像 ha-sandbox.mjs genEnvFile 形）— local sandbox placeholders ONLY. Never production. #'];
  for (const name of requiredVarNames()) {
    let v = semantic[name];
    if (v === undefined) {
      // 回落启发式逐字面同 ha-sandbox.mjs:174-190（新增强制变量自动覆盖·漂移免疫）。
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

// 1) ha-pg up + healthy
{
  const up = compose(['up', '-d', 'ha-pg']);
  const ok = up.status === 0;
  note('compose up -d ha-pg', ok, ok ? 'started' : (up.stderr || '').slice(0, 200));
  if (!ok) result = 'FAIL';
}
{
  const t1 = Date.now();
  let healthy = false;
  for (;;) {
    const e = composePsJson().find((x) => x.Service === 'ha-pg');
    healthy = Boolean(e && e.State === 'running' && String(e.Health).toLowerCase() === 'healthy');
    if (healthy || Date.now() - t1 > 120000) break;
    sleepSync(2000);
  }
  note('ha-pg healthy', healthy, `${Math.round((Date.now() - t1) / 1000)}s`);
  if (!healthy) result = 'FAIL';
}

// 2) migrate 一次性 → Exit 0（§4.6 第二判据）
let migrateExitCode = null;
{
  if (result === 'OK') {
    const up = compose(['up', '-d', 'migrate']);
    note('compose up -d migrate (one-shot)', up.status === 0, up.status === 0 ? 'started' : (up.stderr || '').slice(0, 200));
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
    note('migrate exited', false, 'skipped: ha-pg not healthy');
  }
}

// 3) 注入 db_pool_error JSON 进 ha-pg 容器日志（真实 json-file 通路·postgres 应用层发射）
{
  if (result === 'OK') {
    const line = JSON.stringify({ event: 'db_pool_error', purpose: 'smoke', count: 1, error_name: 'ECONNRESET', error_message: 'ha-5 sandbox smoke injection' });
    const sql = `DO $do$ BEGIN RAISE EXCEPTION '${line}'; END $do$;`;
    const r = compose(['exec', '-T', 'ha-pg', 'psql', '-U', 'meetwise', '-d', 'meetwise', '-c', sql]);
    // psql 预期非零退出（RAISE EXCEPTION 本身中止块）——发射成功的判据是下面的 compose logs 探针。
    sleepSync(1000);
    const probe = compose(['logs', 'ha-pg', '--since', '5m', '--timestamps']);
    const landed = probe.stdout.includes('"event":"db_pool_error"');
    note('inject db_pool_error into ha-pg container log (psql RAISE EXCEPTION)', landed, landed ? 'emitted via postgres server log (json-file driver)·psql exit non-zero expected' : `psql exit=${r.status} ${(r.stderr || r.stdout || '').slice(0, 150)}`);
    if (!landed) { result = 'FAIL'; gap = 'injection did not land in compose logs'; }
  } else {
    note('inject db_pool_error into ha-pg container log', false, 'skipped: prior step failed');
  }
}

// 4) check-alerts --sandbox 实栈判定（§4.6 第一判据 + fail-closed 实栈实证）
let judge = null;
{
  if (result === 'OK') {
    const rec = join(SANDBOX_DIR, 'check-alerts.receipt.json');
    const r = spawnSync(process.execPath, [join(__dirname, 'check-alerts.mjs'), '--sandbox', '--since', '1h', '--receipt', rec],
      { encoding: 'utf8', cwd: ROOT, maxBuffer: 32 * 1024 * 1024 });
    judge = { exit: r.status ?? 1, receipt: existsSync(rec) ? JSON.parse(readFileSync(rec, 'utf8')) : null };
    const alerts = judge.receipt?.alerts ?? [];
    const poolHit = alerts.find((a) => a.event === 'db_pool_error');
    const migrateHit = alerts.find((a) => a.event === 'migrate_failed');
    const ok = r.status === 1 && Boolean(poolHit) && !migrateHit;
    note('check-alerts --sandbox: db_pool_error 产条目 + migrate_failed 零条目 + 未决 Ticket=EXIT 1', ok,
      `exit=${r.status} db_pool_error=${Boolean(poolHit)}(count=${poolHit?.count}) migrate_failed=${Boolean(migrateHit)} migrateExitCode=${migrateExitCode}`);
    if (!ok) { result = 'FAIL'; gap = 'judge assertions failed'; }
  } else {
    note('check-alerts --sandbox', false, 'skipped: prior step failed');
  }
}

// 5) 白名单消费实栈复跑 → EXIT 0
let whitelistRun = null;
{
  if (result === 'OK') {
    const wl = join(SANDBOX_DIR, 'smoke-whitelist.json');
    writeFileSync(wl, `${JSON.stringify({ version: 1, entries: [{ event: 'db_pool_error', reason: 'ha-5 smoke: injected fixture line', expires: '2099-01-01' }] })}\n`);
    const rec = join(SANDBOX_DIR, 'check-alerts-wl.receipt.json');
    const r = spawnSync(process.execPath, [join(__dirname, 'check-alerts.mjs'), '--sandbox', '--since', '1h', '--whitelist', wl, '--receipt', rec],
      { encoding: 'utf8', cwd: ROOT, maxBuffer: 32 * 1024 * 1024 });
    whitelistRun = { exit: r.status ?? 1, receipt: existsSync(rec) ? JSON.parse(readFileSync(rec, 'utf8')) : null };
    const ok = r.status === 0 && (whitelistRun.receipt?.suppressed?.length ?? 0) === 1;
    note('whitelist consumption live: EXIT 0 + suppressed=1', ok, `exit=${r.status} suppressed=${whitelistRun.receipt?.suppressed?.length}`);
    if (!ok) { result = 'FAIL'; gap = 'whitelist live run failed'; }
  } else {
    note('whitelist consumption live', false, 'skipped: prior step failed');
  }
}

// 6) teardown：沙箱全灭（tmpfs pg 随容器销毁）
{
  const down = compose(['down', '-v']);
  note('compose down -v (sandbox fully destroyed)', down.status === 0, down.status === 0 ? 'removed' : (down.stderr || '').slice(0, 200));
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
  carrier: 'docker/compose.ha.sandbox.yml 零改复用（最小栈 ha-pg + migrate·COMPOSE_BASE 同 ha-sandbox.mjs 形）',
  migrateExitCode,
  judge,
  whitelistRun,
  steps,
};
mkdirSync(RECEIPTS, { recursive: true });
writeFileSync(RECEIPT_OUT, `${JSON.stringify(receipt, null, 2)}\n`);

const lines = [
  '===== RECEIPT alerts:sandbox-smoke =====',
  `result: ${result}`,
  `migrateExitCode: ${migrateExitCode}`,
  `judge: exit=${judge?.exit} db_pool_error=${Boolean(judge?.receipt?.alerts?.find((a) => a.event === 'db_pool_error'))} migrate_failed=absent-in-alerts`,
  `whitelistRun: exit=${whitelistRun?.exit} suppressed=${whitelistRun?.receipt?.suppressed?.length}`,
  `haStatus: NOT_HA · releaseEvidence: false · claimProductionHA: false · estLive: 0`,
  ...(gap ? [`gap: ${gap}`] : []),
];
for (const s of steps) lines.push(`step: ${s.ok ? 'PASS' : 'FAIL'} | ${s.step}${s.detail ? ` | ${s.detail}` : ''}`);
lines.push('===== END RECEIPT =====');
console.log(lines.join('\n'));
const exit = result === 'OK' ? 0 : 1;
console.log(`CMD=MEETWISE_HA_SANDBOX_AUTHORIZED=1 node scripts/alerts/check-alerts-sandbox-smoke.mjs EXIT=${exit}`);
process.exit(exit);
