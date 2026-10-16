#!/usr/bin/env node
/**
 * Meetwise check-alerts proof — HA-5 §4 A 组注入式确定性 proof（无 docker 依赖）+ §4.9 静态机检
 * + §4.5 reaper 真源断言 + §4.7 静态边界断言。沿仓内 *.proof.mjs 形制（fail 即非零退出）。
 *
 *   node scripts/alerts/check-alerts.proof.mjs
 *   ALERTS_PROOF_BASE=9f6edf8f node scripts/alerts/check-alerts.proof.mjs   # §4.5/§4.7 diff 基线
 *
 * 判据（REQUEST §4）：
 *   §4.1 事件→告警条目（九事件各 ≥1·双形 matcher 各 ≥1 断言）
 *   §4.2 EXIT 语义（未决 Page/Ticket=1 / 干净=0 / --report 恒 0）
 *   §4.3 假阳性防（白名单带到期日→翻绿 / 过期条目→重新告警）
 *   §4.4+§4.9 目录腐化机检（缺 severity / 缺 matcher / 白名单缺到期日 / runbook 锚悬空 → alerts-lint 拒绝）
 *   §4.5 reaper_takeover 真源（三处 sweep requeue 成功路径·diff 仅 ±观测日志行）
 *   §4.7 静态边界（git diff 零触监控栈四文件 + compose.prod.yml）
 * 夹具全部落 .tmp/（gitignored）；收据落 receipts/ha-5/check-alerts.proof.receipt.json。
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '../..');
const TMP = join(ROOT, '.tmp/ha5-proof');
const CHECK = join(__dirname, 'check-alerts.mjs');
const LINT = join(ROOT, 'scripts/alerts-lint.mjs');
const BASE = process.env.ALERTS_PROOF_BASE || '9f6edf8f';
const RECEIPT_OUT = join(ROOT, 'receipts/ha-5/check-alerts.proof.receipt.json');

rmSync(TMP, { recursive: true, force: true });
mkdirSync(TMP, { recursive: true });
mkdirSync(dirname(RECEIPT_OUT), { recursive: true });

let failures = 0;
const ledger = [];
const A = (id, name, ok, detail) => {
  ledger.push({ id, name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${id} ${name}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures++;
};
const sh = (bin, args, env) =>
  spawnSync(bin, args, { encoding: 'utf8', cwd: ROOT, maxBuffer: 32 * 1024 * 1024, env: env ?? process.env });

function runCheck(args, env) {
  const r = spawnSync(process.execPath, [CHECK, ...args], { encoding: 'utf8', cwd: ROOT, maxBuffer: 32 * 1024 * 1024, env: env ?? process.env });
  return { exit: r.status ?? 1, stdout: r.stdout || '', stderr: r.stderr || '' };
}
function readReceipt(p) {
  return JSON.parse(readFileSync(p, 'utf8'));
}

// ---------------------------------------------------------------- fixtures
const FUTURE = '2099-01-01';
const PAST = '2026-01-01';
const JP = (o, ts) => `${ts} meetwise-ha5-app-1 | ${JSON.stringify(o)}`; // compose logs --timestamps 前缀形（JSON matcher 须容忍）
writeFileSync(join(TMP, 'full.log'), [
  JP({ event: 'db_pool_error', purpose: 'default', count: 1, error_name: 'ECONNRESET', error_message: 'connection reset by peer' }, '2026-10-10T01:00:00.000000000Z'),
  '2026-10-10T01:00:01.000000000Z meetwise-ha5-worker-1 | worker_drain_timeout signal=SIGTERM in_flight=interview-job-1',
  '2026-10-10T01:00:02.000000000Z meetwise-ha5-api-1 | api_drain_timeout',
  JP({ event: 'reaper_takeover', kind: 'interview', job_ref: 'requeued:2', prev_lease_expired: true }, '2026-10-10T01:00:03.000000000Z'),
  JP({ event: 'generation_progress_write_failed', streamKey: 'st-1', kind: 'start', errorName: 'Error' }, '2026-10-10T01:00:04.000000000Z'),
  JP({ event: 'ai_trace_persist_failed', service: 'score', idempotencyKey: 'ik-1', errorName: 'PostgresError', pgCode: 'P0001' }, '2026-10-10T01:00:05.000000000Z'),
  '2026-10-10T01:00:06.000000000Z meetwise-ha5-api-1 |ModelError: No space left on device',
  '2026-10-10T01:00:07.000000000Z meetwise-ha5-worker-1 | backup write failed: ENOSPC',
  'benign line: migrate applied 159 versions, all healthy',
].join('\n'));
writeFileSync(join(TMP, 'full-ps.json'), JSON.stringify([
  { Service: 'migrate', State: 'exited', ExitCode: 1 },
  { Service: 'api', State: 'running', Health: 'healthy' },
]));
writeFileSync(join(TMP, 'full-df.txt'), 'Filesystem 1024-blocks Used Available Capacity Mounted on\n/dev/disk1 1000000 870000 130000 87% /\n');
writeFileSync(join(TMP, 'clean.log'), '2026-10-10T02:00:00.000000000Z meetwise-ha5-api-1 | GET /readyz 200\n');
writeFileSync(join(TMP, 'clean-ps.json'), JSON.stringify([{ Service: 'migrate', State: 'exited', ExitCode: 0 }]));
writeFileSync(join(TMP, 'clean-df.txt'), 'Filesystem 1024-blocks Used Available Capacity Mounted on\n/dev/disk1 1000000 400000 600000 40% /\n');
writeFileSync(join(TMP, 'wl-all.json'), JSON.stringify({ version: 1, entries: [
  { event: 'db_pool_error', reason: 'proof: restart-window burst one-shot', expires: FUTURE },
  { event: 'worker_drain_timeout', reason: 'proof: deploy-window drain one-shot', expires: FUTURE },
  { event: 'api_drain_timeout', reason: 'proof: deploy-window drain one-shot', expires: FUTURE },
  { event: 'reaper_takeover', reason: 'proof: crash-drill window', expires: FUTURE },
  { event: 'migrate_failed', reason: 'proof: deploy-window single migrate retry', expires: FUTURE },
  { event: 'disk_enospc', reason: 'proof: fixture disk', expires: FUTURE },
  { event: 'disk_watermark', reason: 'proof: fixture disk', expires: FUTURE },
] }));
writeFileSync(join(TMP, 'wl-expired.json'), JSON.stringify({ version: 1, entries: [
  { event: 'db_pool_error', reason: 'proof: stale suppression that must re-alert', expires: PAST },
] }));

const FULL_ARGS = ['--offline', '--log-file', join(TMP, 'full.log'), '--ps-file', join(TMP, 'full-ps.json'), '--df-file', join(TMP, 'full-df.txt'), '--receipt', join(TMP, 'full-receipt.json')];
const CLEAN_ARGS = ['--offline', '--log-file', join(TMP, 'clean.log'), '--ps-file', join(TMP, 'clean-ps.json'), '--df-file', join(TMP, 'clean-df.txt'), '--receipt', join(TMP, 'clean-receipt.json')];

// ---------------------------------------------------------------- §4.1 事件→告警条目
const p1 = runCheck(FULL_ARGS);
const r1 = p1.exit === 1 ? readReceipt(join(TMP, 'full-receipt.json')) : { alerts: [] };
const byEvent = new Map((r1.alerts ?? []).map((a) => [a.event, a]));
const EXPECT = [
  ['db_pool_error', 'Ticket'],
  ['worker_drain_timeout', 'Ticket'],
  ['api_drain_timeout', 'Ticket'],
  ['reaper_takeover', 'Ticket'],
  ['migrate_failed', 'Page'],
  ['disk_enospc', 'Page'],
  ['disk_watermark', 'Ticket'],
  ['generation_progress_write_failed', 'Trend'],
  ['ai_trace_persist_failed', 'Trend'],
];
{
  const missing = EXPECT.filter(([e]) => !byEvent.has(e)).map(([e]) => e);
  const sevWrong = EXPECT.filter(([e, s]) => byEvent.get(e) && byEvent.get(e).severity !== s).map(([e, s]) => `${e}:${byEvent.get(e)?.severity}!=${s}`);
  A('P1.1', '§4.1 九事件全部产出告警条目', p1.exit === 1 && missing.length === 0, missing.length ? `missing=${missing.join(',')}` : '9/9 present');
  A('P1.2', '§4.1 severity 逐字段对', sevWrong.length === 0, sevWrong.length ? sevWrong.join(',') : 'Page/Ticket/Trend 逐条对');
  A('P1.3', '§4.1 JSON 形 matcher（compose 前缀容忍）', byEvent.get('db_pool_error')?.count === 1 && byEvent.get('reaper_takeover')?.count === 1,
    `db_pool_error=${byEvent.get('db_pool_error')?.count} reaper_takeover=${byEvent.get('reaper_takeover')?.count}`);
  A('P1.4', '§4.1 文本形 matcher（key=value 兼容）', byEvent.get('worker_drain_timeout')?.count === 1 && byEvent.get('api_drain_timeout')?.count === 1,
    `worker=${byEvent.get('worker_drain_timeout')?.count} api=${byEvent.get('api_drain_timeout')?.count}`);
  A('P1.5', '§4.1 compose_exit/df_watermark 源', byEvent.get('migrate_failed')?.count === 1 && byEvent.get('disk_watermark')?.count === 1,
    `migrate_failed=${byEvent.get('migrate_failed')?.count} disk_watermark=${byEvent.get('disk_watermark')?.count}`);
  A('P1.6', '§4.1 样本行入条目（可下钻）', (byEvent.get('db_pool_error')?.samples?.[0] ?? '').includes('ECONNRESET'), 'sample carries raw line');
}

// ---------------------------------------------------------------- §4.2 EXIT 语义
A('P2.1', '§4.2 未决 Page/Ticket → EXIT=1', p1.exit === 1, `exit=${p1.exit}`);
{
  const p2 = runCheck([...FULL_ARGS, '--report']);
  const r2 = readReceipt(join(TMP, 'full-receipt.json'));
  A('P2.2', '§4.2 同样本 --report → 恒 EXIT=0 且清单照出', p2.exit === 0 && (r2.alerts?.length ?? 0) === 9, `exit=${p2.exit} alerts=${r2.alerts?.length}`);
}
{
  const p3 = runCheck(CLEAN_ARGS);
  const r3 = readReceipt(join(TMP, 'clean-receipt.json'));
  A('P2.3', '§4.2 干净样本 → EXIT=0', p3.exit === 0 && (r3.alerts?.length ?? 0) === 0, `exit=${p3.exit} alerts=${r3.alerts?.length}`);
}

// ---------------------------------------------------------------- §4.3 假阳性防
{
  const p4 = runCheck([...FULL_ARGS, '--whitelist', join(TMP, 'wl-all.json'), '--receipt', join(TMP, 'wl-receipt.json')]);
  const r4 = readReceipt(join(TMP, 'wl-receipt.json'));
  const openNames = new Set((r4.alerts ?? []).map((a) => a.event));
  const whitelisted = ['db_pool_error', 'worker_drain_timeout', 'api_drain_timeout', 'reaper_takeover', 'migrate_failed', 'disk_enospc', 'disk_watermark'];
  const leaked = whitelisted.filter((e) => openNames.has(e));
  const openPageTicket = (r4.alerts ?? []).filter((a) => a.severity === 'Page' || a.severity === 'Ticket');
  A('P3.1', '§4.3 白名单（带到期日）→ 白名单事件清单零条目、Page/Ticket 零未决、EXIT 翻绿（Trend 照列不打扰 EXIT）',
    p4.exit === 0 && leaked.length === 0 && openPageTicket.length === 0 && (r4.suppressed?.length ?? 0) === 7,
    `exit=${p4.exit} leaked=${leaked.join(',')} openPageTicket=${openPageTicket.length} suppressed=${r4.suppressed?.length}`); 
}
{
  const p5 = runCheck(['--offline', '--log-file', join(TMP, 'full.log'), '--ps-file', join(TMP, 'full-ps.json'), '--df-file', join(TMP, 'full-df.txt'),
    '--whitelist', join(TMP, 'wl-expired.json'), '--receipt', join(TMP, 'wlx-receipt.json')]);
  const r5 = readReceipt(join(TMP, 'wlx-receipt.json'));
  const still = (r5.alerts ?? []).find((a) => a.event === 'db_pool_error');
  A('P3.2', '§4.3 过期白名单条目 → 必须重新告警', p5.exit === 1 && still?.count === 1 && (r5.whitelist?.expired ?? []).includes('db_pool_error'),
    `exit=${p5.exit} db_pool_error re-alerted=${Boolean(still)} expired=${(r5.whitelist?.expired ?? []).join(',')}`);
}

// ---------------------------------------------------------------- §4.4+§4.9 目录腐化机检（alerts-lint 载体）
function corrupt(name, mutate) {
  const catalog = JSON.parse(readFileSync(join(ROOT, 'scripts/alerts/event-catalog.json'), 'utf8'));
  mutate(catalog);
  const p = join(TMP, name);
  writeFileSync(p, JSON.stringify(catalog));
  return p;
}
function runLint(envExtra) {
  const r = spawnSync(process.execPath, [LINT], { encoding: 'utf8', cwd: ROOT, maxBuffer: 32 * 1024 * 1024, env: { ...process.env, ...envExtra } });
  return { exit: r.status ?? 1, stdout: r.stdout || '', stderr: r.stderr || '' };
}
{
  const noSev = corrupt('cat-nosev.json', (c) => { delete c.events[0].severity; });
  const r = runLint({ ALERTS_LINT_CATALOG: noSev });
  A('P4.1', '§4.4 缺 severity → 机检拒绝', r.exit === 1 && r.stderr.includes('severity'), `exit=${r.exit}`);
}
{
  const noMatcher = corrupt('cat-nomatcher.json', (c) => { delete c.events[0].matchers; });
  const r = runLint({ ALERTS_LINT_CATALOG: noMatcher });
  A('P4.2', '§4.4 缺 matcher → 机检拒绝', r.exit === 1 && r.stderr.includes('matchers'), `exit=${r.exit}`);
}
{
  const wl = JSON.parse(readFileSync(join(TMP, 'wl-all.json'), 'utf8'));
  delete wl.entries[0].expires;
  const p = join(TMP, 'wl-noexp.json');
  writeFileSync(p, JSON.stringify(wl));
  const r = runLint({ ALERTS_LINT_WHITELIST: p });
  A('P4.3', '§4.4 白名单缺到期日 → 机检拒绝', r.exit === 1 && r.stderr.includes('expires'), `exit=${r.exit}`);
}
{
  const rb = readFileSync(join(ROOT, 'ai-docs/observability/alerting-runbook.md'), 'utf8').replace('<a id="ev-disk_watermark"></a>\n', '');
  const p = join(TMP, 'runbook-dangling.md');
  writeFileSync(p, rb);
  const r = runLint({ ALERTS_LINT_RUNBOOK: p });
  A('P4.4', '§4.9 runbook 锚悬空 → 机检拒绝', r.exit === 1 && r.stderr.includes('id="ev-disk_watermark"'), `exit=${r.exit}`);
}
{
  const r = runLint({});
  A('P4.5', '§4.9 真文件默认 lint 全绿（runbook 存在+九锚解析+S15 节+分层词面）', r.exit === 0, r.stdout.trim().split('\n').pop() ?? '');
}

// ---------------------------------------------------------------- §4.5 reaper_takeover 真源
{
  const files = ['packages/db/src/interview/interview-jobs.ts', 'packages/db/src/report/report.ts', 'packages/db/src/jobs/quiz-jobs.ts'];
  const kinds = ['interview', 'report', 'quiz'];
  const checks = files.map((f, i) => {
    const text = readFileSync(join(ROOT, f), 'utf8');
    const lines = text.split('\n');
    const evLine = lines.findIndex((l) => l.includes("event: 'reaper_takeover'"));
    const requeueIdx = lines.findIndex((l) => l.includes("SET status='queued'"));
    const inCatch = lines.slice(Math.max(0, evLine - 6), evLine + 1).some((l) => /\bcatch\b/.test(l));
    return {
      f,
      found: evLine >= 0,
      afterRequeue: evLine > requeueIdx,
      kindOk: lines[evLine]?.includes(`kind: '${kinds[i]}'`) ?? false,
      guarded: lines[evLine]?.includes('.rowCount)') ?? false,
      notInCatch: !inCatch,
      lineNo: evLine + 1,
    };
  });
  A('P5.1', '§4.5 三处 sweep requeue 成功路径含 reaper_takeover（非 catch/失败分支）',
    checks.every((c) => c.found && c.afterRequeue && c.kindOk && c.guarded && c.notInCatch),
    checks.map((c) => `${c.f.split('/').pop()}:${c.lineNo}(afterRequeue=${c.afterRequeue},catch=${!c.notInCatch})`).join(' '));
  const d = sh('git', ['diff', BASE, '--', ...files]);
  const added = d.stdout.split('\n').filter((l) => l.startsWith('+') && !l.startsWith('+++'));
  const removed = d.stdout.split('\n').filter((l) => l.startsWith('-') && !l.startsWith('---'));
  const additiveOnly = added.length === 3 && removed.length === 0 && added.every((l) => l.includes("console.warn(JSON.stringify({ event: 'reaper_takeover'"));
  A('P5.2', `§4.5 diff ${BASE}..worktree 仅 ±观测日志行（三处各 +1·零删·sweep 选取/租约/CAS 零改）`, additiveOnly, `+${added.length}/-${removed.length}`);
}

// ---------------------------------------------------------------- §4.7 静态边界
{
  const FORBIDDEN = ['docker/compose.monitoring.yml', 'docker/monitoring/prometheus.yml', 'docker/monitoring/alert.rules.yml', 'docker/monitoring/alertmanager.yml', 'docker/compose.prod.yml'];
  const names = sh('git', ['diff', BASE, '--name-only']).stdout.split('\n').filter(Boolean);
  const status = sh('git', ['status', '--porcelain']).stdout.split('\n').filter(Boolean).map((l) => l.slice(3).trim());
  const hit = FORBIDDEN.filter((f) => names.some((n) => n === f) || status.some((s) => s === f || s.startsWith(f)));
  A('P6.1', '§4.7 监控栈四文件+compose.prod.yml 零出现在改动清单', hit.length === 0, hit.length ? `hit=${hit.join(',')}` : `diff ${names.length} files + status ${status.length} entries all clean`);
}

// ---------------------------------------------------------------- fail-closed 源失效 + 运行时坏目录
{
  const noPath = { ...process.env, PATH: '/nonexistent-ha5-proof' };
  const r = runCheck([], noPath);
  A('P7.1', 'fail-closed：live 模式源失效（docker 不可用）→ EXIT=1', r.exit === 1, `exit=${r.exit}`);
}
{
  const r = runCheck(['--offline', '--log-file', join(TMP, 'clean.log'), '--catalog', join(TMP, 'cat-nosev.json'), '--receipt', join(TMP, 'badcat-receipt.json')]);
  A('P7.2', 'fail-closed：运行时坏目录（缺 severity）→ EXIT=1', r.exit === 1, `exit=${r.exit}`);
}

// ---------------------------------------------------------------- ledger
const receipt = {
  at: new Date().toISOString(),
  base: BASE,
  total: ledger.length,
  failures,
  result: failures === 0 ? 'OK' : 'FAIL',
  assertions: ledger,
};
writeFileSync(RECEIPT_OUT, `${JSON.stringify(receipt, null, 2)}\n`);
console.log(`\ncheck-alerts.proof ${receipt.result} —— ${ledger.length - failures}/${ledger.length} assertions passed. receipt: ${RECEIPT_OUT}`);
console.log(`CMD=node scripts/alerts/check-alerts.proof.mjs EXIT=${failures === 0 ? 0 : 1}`);
process.exit(failures === 0 ? 0 : 1);
