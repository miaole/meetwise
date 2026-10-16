#!/usr/bin/env node
/**
 * Meetwise check-alerts queue proof — HA-7 R-24 §4 A 组注入式确定性 proof（--metrics-file 注入缝喂样本·无 docker 依赖）
 * + C2 emit 真源断言 + 静态边界断言。沿 scripts/alerts/check-alerts.proof.mjs（HA-5 卷）同形（fail 即非零退出）。
 *
 *   node scripts/alerts/check-alerts-queue.proof.mjs
 *
 * 判据（ha-7 REQUEST §4）：
 *   Q1 §4.1 阈值三向×四队列（>100/5/10 严格大于·超/恰/欠各断言·三指标×四 queue 各至少一命中）
 *   Q2 §4.2 EXIT 语义（未决 Page/Ticket=1 / 干净=0 / --report 恒 0 / live metrics 源失效 fail-closed=1 / offline 无 --metrics-file=skipped 不误红）
 *   Q3 §4.3 多实例 max 去重（同 queue 异值取 max 评估·非 sum）
 *   Q4 §4.4 白名单假阳性防（带到期日→翻绿 / 过期→重新告警）
 *   Q5 §4.5 既有九事件零翻（HA-5 check-alerts.proof.mjs 全量原样通过 + 目录 diff 纯追加零删）
 *   Q6 §4.6 新 counter render（metrics:prove 追加断言）+ C2 四落点 emit 真源（终态失败臂·非 requeue 臂）+ diff 形断言（仅 ±观测行）
 *   Q7 §4.7 runbook 锚机检（alerts-lint 第 4 节载体：3.10-3.12 锚解析+DLQ 只增不减+快照/for 差异声明词面）+ 阈值/severity 逐字对齐 alert.rules.yml
 *   Q8 §4.9 静态边界（监控栈四文件+compose.prod.yml+migrations 零出现在改动清单）
 * 夹具全部落 .tmp/（gitignored）；收据落 receipts/ha-7/check-alerts-queue.proof.receipt.json。
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '../..');
const TMP = join(ROOT, '.tmp/ha7-queue-proof');
const CHECK = join(__dirname, 'check-alerts.mjs');
const LINT = join(ROOT, 'scripts/alerts-lint.mjs');
const BASE_COMMIT = '20186718';
const RECEIPT_OUT = join(ROOT, 'receipts/ha-7/check-alerts-queue.proof.receipt.json');

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

function runCheck(args, env) {
  const r = spawnSync(process.execPath, [CHECK, ...args], { encoding: 'utf8', cwd: ROOT, maxBuffer: 32 * 1024 * 1024, env: env ?? process.env });
  return { exit: r.status ?? 1, stdout: r.stdout || '', stderr: r.stderr || '' };
}
function readReceipt(p) {
  return JSON.parse(readFileSync(p, 'utf8'));
}
function sh(bin, args) {
  const r = spawnSync(bin, args, { encoding: 'utf8', cwd: ROOT, maxBuffer: 32 * 1024 * 1024 });
  return { status: r.status ?? 1, stdout: r.stdout || '', stderr: r.stderr || '' };
}
function git(args) {
  return sh('git', args).stdout;
}

// ---------------------------------------------------------------- fixtures
const QUEUES = ['interview_job', 'report', 'quiz_job', 'diagnosis_job'];
const EVENTS = [
  { event: 'queue_backlog', metric: 'worker_jobs_queued', threshold: 100, severity: 'Ticket' },
  { event: 'queue_stuck_running', metric: 'worker_jobs_running_expired', threshold: 5, severity: 'Ticket' },
  { event: 'queue_dead_letter', metric: 'worker_jobs_dead', threshold: 10, severity: 'Page' },
];
/** 构造 /metrics 文本样本：每指标全四队列置同一 value（# TYPE 头沿 worker 真曝光形）。 */
function metricsSample(valueOf) {
  const lines = [];
  for (const ev of EVENTS) {
    lines.push(`# TYPE ${ev.metric} gauge`);
    for (const q of QUEUES) lines.push(`${ev.metric}{queue="${q}"} ${valueOf(ev, q)}`);
  }
  lines.push('# TYPE worker_jobs_failed_total counter');
  for (const q of QUEUES) lines.push(`worker_jobs_failed_total{queue="${q}"} 0`);
  return `${lines.join('\n')}\n`;
}
const overSample = metricsSample((ev) => ev.threshold + 1);   // 全队列恰超阈 1
const exactSample = metricsSample((ev) => ev.threshold);      // 恰等于阈（严格大于语义 → 零条目）
const underSample = metricsSample((ev) => ev.threshold - 1);  // 欠阈 → 零条目
const cleanSample = metricsSample(() => 0);
writeFileSync(join(TMP, 'over.metrics.txt'), overSample);
writeFileSync(join(TMP, 'exact.metrics.txt'), exactSample);
writeFileSync(join(TMP, 'under.metrics.txt'), underSample);
writeFileSync(join(TMP, 'clean.metrics.txt'), cleanSample);
// 多实例双行样本：同 queue 异值（A3 max 去重判别样本——sum 会翻超阈,max 不会）
const dupLines = [];
dupLines.push('# TYPE worker_jobs_queued gauge');
for (const q of QUEUES) dupLines.push(`worker_jobs_queued{queue="${q}"} 60`);
dupLines.push('worker_jobs_queued{queue="report"} 45');   // 同 queue 第二实例行 45：sum=105>100 会误报,max=60 不报
dupLines.push('worker_jobs_queued{queue="interview_job"} 101');
dupLines.push('worker_jobs_queued{queue="interview_job"} 3');   // 同 queue 101+3：报 max=101,非 sum=104
writeFileSync(join(TMP, 'dup.metrics.txt'), `${dupLines.join('\n')}\n`);
writeFileSync(join(TMP, 'clean.log'), '2026-10-11T00:00:00.000000000Z meetwise-ha7-api-1 | GET /readyz 200\n');
writeFileSync(join(TMP, 'clean-ps.json'), JSON.stringify([{ Service: 'migrate', State: 'exited', ExitCode: 0 }]));
writeFileSync(join(TMP, 'clean-df.txt'), 'Filesystem 1024-blocks Used Available Capacity Mounted on\n/dev/disk1 1000000 400000 600000 40% /\n');

const args = (metricsFile, extra = []) => ['--offline', '--log-file', join(TMP, 'clean.log'), '--ps-file', join(TMP, 'clean-ps.json'), '--df-file', join(TMP, 'clean-df.txt'), '--metrics-file', join(TMP, metricsFile), '--receipt', join(TMP, 'receipt.json'), ...extra];
const cleanArgs = ['--offline', '--log-file', join(TMP, 'clean.log'), '--ps-file', join(TMP, 'clean-ps.json'), '--df-file', join(TMP, 'clean-df.txt'), '--receipt', join(TMP, 'receipt.json')];

// ---------------------------------------------------------------- Q1 §4.1 阈值三向×四队列
{
  const p = runCheck(args('over.metrics.txt'));
  const r = readReceipt(join(TMP, 'receipt.json'));
  const byEvent = new Map((r.alerts ?? []).map((a) => [a.event, a]));
  const missing = EVENTS.filter((ev) => !byEvent.has(ev.event)).map((ev) => ev.event);
  const countsOk = EVENTS.every((ev) => byEvent.get(ev.event)?.count === 4);
  const sevOk = EVENTS.every((ev) => byEvent.get(ev.event)?.severity === ev.severity);
  const sampleOk = EVENTS.every((ev) => (byEvent.get(ev.event)?.samples ?? []).some((s) => s.includes(`max=${ev.threshold + 1}`)));
  A('Q1.1', '§4.1 全队列超阈（T+1）→ 三事件各产出且 count=4（四 queue 标签各一命中）', p.exit === 1 && missing.length === 0 && countsOk,
    `exit=${p.exit} missing=${missing.join(',')} counts=${EVENTS.map((ev) => `${ev.event}=${byEvent.get(ev.event)?.count}`).join(' ')}`);
  A('Q1.2', '§4.1 severity 逐事件对齐目录（Ticket/Ticket/Page）', sevOk, EVENTS.map((ev) => `${ev.event}:${byEvent.get(ev.event)?.severity}`).join(' '));
  A('Q1.3', '§4.1 sample 带 queue/max 阈值对（可下钻）', sampleOk, 'samples carry max=T+1');
  const pe = runCheck(args('exact.metrics.txt'));
  const re = readReceipt(join(TMP, 'receipt.json'));
  A('Q1.4', '§4.1 恰等于阈（=T）→ 零条目（严格大于 > 语义·对齐 alert.rules.yml expr）', pe.exit === 0 && (re.alerts?.length ?? 0) === 0,
    `exit=${pe.exit} alerts=${re.alerts?.length}`);
  const pu = runCheck(args('under.metrics.txt'));
  const ru = readReceipt(join(TMP, 'receipt.json'));
  A('Q1.5', '§4.1 欠阈（T-1）→ 零条目', pu.exit === 0 && (ru.alerts?.length ?? 0) === 0, `exit=${pu.exit} alerts=${ru.alerts?.length}`);
}

// ---------------------------------------------------------------- Q2 §4.2 EXIT 语义
{
  const po = runCheck(args('over.metrics.txt', ['--report']));
  const ro = readReceipt(join(TMP, 'receipt.json'));
  A('Q2.1', '§4.2 超阈样本 --report → 恒 EXIT=0 且清单照出（3 事件·count=4）', po.exit === 0 && (ro.alerts?.length ?? 0) === 3 && ro.alerts.every((a) => a.count === 4),
    `exit=${po.exit} alerts=${ro.alerts?.length}`);
  const pc = runCheck(cleanArgs);
  const rc = readReceipt(join(TMP, 'receipt.json'));
  A('Q2.2', '§4.2 干净样本（全 0）→ EXIT=0', pc.exit === 0 && (rc.alerts?.length ?? 0) === 0, `exit=${pc.exit} alerts=${rc.alerts?.length}`);
  const pf = runCheck(['--receipt', join(TMP, 'live-fail.json')], { ...process.env, WORKER_METRICS_URL: 'http://127.0.0.1:1/metrics' });
  const rf = readReceipt(join(TMP, 'live-fail.json'));
  const metricsFailed = rf?.sources?.metrics ? /fetch failed|HTTP/.test(String(rf.sources.metrics)) : false;
  A('Q2.3', '§4.2 live 模式 metrics 源失效（连接拒）→ fail-closed EXIT=1 + 收据 metrics 源探测信号（receipt 落 .tmp·不覆写 HA-5 卷收据）', pf.exit === 1 && metricsFailed,
    `exit=${pf.exit} sources.metrics=${String(rf?.sources?.metrics).slice(0, 90)}`);
  const ps = runCheck(cleanArgs);
  A('Q2.4', '§4.2 offline 无 --metrics-file → skipped 不误红（EXIT=0）', ps.exit === 0 && readReceipt(join(TMP, 'receipt.json')).sources?.metrics === 'offline injection mode (no --metrics-file given)',
    `exit=${ps.exit} sources.metrics=${readReceipt(join(TMP, 'receipt.json')).sources?.metrics}`);
}

// ---------------------------------------------------------------- Q3 §4.3 多实例 max 去重
{
  const p1 = runCheck(args('dup.metrics.txt'));
  const r1 = readReceipt(join(TMP, 'receipt.json'));
  const backlog = (r1.alerts ?? []).find((a) => a.event === 'queue_backlog');
  const stuckOrDead = (r1.alerts ?? []).filter((a) => a.event !== 'queue_backlog');
  A('Q3.1', '§4.3 同 queue 60+45（sum=105 会误报）→ max=60 不报（max 去重·非 sum）',
    p1.exit === 1 && backlog && backlog.count === 1, `exit=${p1.exit} backlog.count=${backlog?.count}`);
  A('Q3.2', '§4.3 同 queue 101+3 → sample 报 max=101（非 sum=104）',
    (backlog?.samples ?? []).some((s) => s.includes('max=101')) && !(backlog?.samples ?? []).some((s) => s.includes('max=104')),
    `samples=${JSON.stringify(backlog?.samples)}`);
  A('Q3.3', '§4.3 其余两指标全 0 → 零条目（只有 backlog 一事件）', stuckOrDead.length === 0, `others=${stuckOrDead.map((a) => a.event).join(',')}`);
}

// ---------------------------------------------------------------- Q4 §4.4 白名单假阳性防
{
  writeFileSync(join(TMP, 'wl-backlog.json'), JSON.stringify({ version: 1, entries: [
    { event: 'queue_backlog', reason: 'proof: batch enqueue burst window', expires: '2099-01-01' },
  ] }));
  const p = runCheck(args('over.metrics.txt', ['--whitelist', join(TMP, 'wl-backlog.json'), '--receipt', join(TMP, 'wl-receipt.json')]));
  const r = readReceipt(join(TMP, 'wl-receipt.json'));
  const openNames = new Set((r.alerts ?? []).map((a) => a.event));
  A('Q4.1', '§4.4 队列事件进白名单（带到期日）→ 清单零该条目、其余照告警', p.exit === 1 && !openNames.has('queue_backlog') && openNames.has('queue_dead_letter') && (r.suppressed?.length ?? 0) === 1,
    `exit=${p.exit} open=${[...openNames].join(',')} suppressed=${r.suppressed?.length}`);
  writeFileSync(join(TMP, 'wl-all.json'), JSON.stringify({ version: 1, entries: EVENTS.map((ev) => ({ event: ev.event, reason: 'proof: queue window', expires: '2099-01-01' })) }));
  const p2 = runCheck(args('over.metrics.txt', ['--whitelist', join(TMP, 'wl-all.json'), '--receipt', join(TMP, 'wl2-receipt.json')]));
  const r2 = readReceipt(join(TMP, 'wl2-receipt.json'));
  A('Q4.2', '§4.4 三队列事件全白名单 → 清单零条目 EXIT 翻绿（suppressed=3）', p2.exit === 0 && (r2.alerts?.length ?? 0) === 0 && (r2.suppressed?.length ?? 0) === 3,
    `exit=${p2.exit} suppressed=${r2.suppressed?.length}`);
  writeFileSync(join(TMP, 'wl-expired.json'), JSON.stringify({ version: 1, entries: [
    { event: 'queue_backlog', reason: 'proof: stale suppression must re-alert', expires: '2026-01-01' },
  ] }));
  const p3 = runCheck(args('over.metrics.txt', ['--whitelist', join(TMP, 'wl-expired.json'), '--receipt', join(TMP, 'wl3-receipt.json')]));
  const r3 = readReceipt(join(TMP, 'wl3-receipt.json'));
  A('Q4.3', '§4.4 过期白名单条目 → 重新告警（防腐化同 HA-5 形制）', p3.exit === 1 && (r3.alerts ?? []).some((a) => a.event === 'queue_backlog') && (r3.whitelist?.expired ?? []).includes('queue_backlog'),
    `exit=${p3.exit} expired=${(r3.whitelist?.expired ?? []).join(',')}`);
}

// ---------------------------------------------------------------- Q5 §4.5 既有九事件零翻
{
  const p = sh(process.execPath, [join(__dirname, 'check-alerts.proof.mjs')]);
  const failIds = p.stdout.split('\n').filter((l) => l.startsWith('FAIL')).map((l) => l.split(/\s+/)[1]);
  // 预存红对账（ha-5 rev2 口径·禁 skip-as-pass）：HA-5 卷 P5.2 的 diff 基 9f6edf8f 被主线 h4 #252 focus（interview-jobs.ts
  // additive）漂移——该红在本刀 base 20186718 已预存（git diff 9f6edf8f 20186718 同形 +10/-3），本刀对该三文件零字节。
  const reaperFiles = ['packages/db/src/interview/interview-jobs.ts', 'packages/db/src/report/report.ts', 'packages/db/src/jobs/quiz-jobs.ts'];
  const myDelta = git(['diff', BASE_COMMIT, '--', ...reaperFiles]).split('\n').filter((l) => (l.startsWith('+') && !l.startsWith('+++')) || (l.startsWith('-') && !l.startsWith('---')));
  const pristine = git(['diff', '9f6edf8f', BASE_COMMIT, '--', ...reaperFiles]);
  const pristineAdded = pristine.split('\n').filter((l) => l.startsWith('+') && !l.startsWith('+++')).length;
  const pristineRemoved = pristine.split('\n').filter((l) => l.startsWith('-') && !l.startsWith('---')).length;
  const worktreeAdded = git(['diff', '9f6edf8f', '--', ...reaperFiles]).split('\n').filter((l) => l.startsWith('+') && !l.startsWith('+++')).length;
  A('Q5.1', `§4.5 HA-5 proof 断言零新增红（唯一 FAIL=P5.2 预存红：基 9f6edf8f 被主线 h4 漂移·本刀对三文件零字节·worktree 与 pristine 逐行同形 +${pristineAdded}/-${pristineRemoved}）`,
    p.stdout.includes('assertions passed') && failIds.every((id) => id === 'P5.2') && myDelta.length === 0 && worktreeAdded === pristineAdded,
    `exit=${p.status} failIds=${failIds.join(',')} myDelta=${myDelta.length} pristine=+${pristineAdded}/-${pristineRemoved} worktree=+${worktreeAdded}`);
  const removed = git(['diff', '--', 'scripts/alerts/event-catalog.json']).split('\n').filter((l) => l.startsWith('-') && !l.startsWith('---'));
  A('Q5.2', '§4.5 目录既有九条目 git diff 逐字节零动（纯追加·零删改行）', removed.length === 0, `removed=${removed.length}`);
  const catalog = JSON.parse(readFileSync(join(ROOT, 'scripts/alerts/event-catalog.json'), 'utf8'));
  A('Q5.3', '§4.5 目录 12 事件（9 既有 + 3 新增）且新事件恰为 queue_* 三条', catalog.events.length === 12
    && catalog.events.slice(9).map((e) => e.event).join(',') === 'queue_backlog,queue_stuck_running,queue_dead_letter',
    `events=${catalog.events.length}`);
}

// ---------------------------------------------------------------- Q6 §4.6 新 counter render + C2 emit 真源
{
  const pm = sh('pnpm', ['-C', 'packages/ai-runtime', 'prove:metrics']);
  A('Q6.1', '§4.6 metrics:prove 全绿（含 HA-7 追加：jobsFailed 常量/四队列 0 预填/inc 渲染/# TYPE counter）', pm.status === 0,
    `exit=${pm.status} ${(pm.stdout.trim().split('\n').pop() ?? '').slice(0, 90)}`);

  // C2 四落点真源：每文件恰一处 jobsFailed inc，且在终态失败臂（markFailed CAS 胜出后·非 requeue/成功臂）。
  const emitChecks = [
    { f: 'apps/worker/src/interview-consumer.ts', queue: 'interview_job', seat: 'markJobFailed(c, owner', guard: 'if (!stillMine) return;' },
    { f: 'apps/worker/src/quiz-consumer.ts', queue: 'quiz_job', seat: 'markQuizJobFailed(c, owner', guard: 'if (!stillMine) return;' },
    { f: 'apps/worker/src/diagnosis-consumer.ts', queue: 'diagnosis_job', seat: 'markDiagnosisJobFailed(c, owner', guard: 'if (!stillMine) return;' },
    { f: 'apps/worker/src/report-worker.ts', queue: 'report', seat: 'markReportFailed(c, owner, claim.reportId', guard: null },
  ];
  for (const c of emitChecks) {
    const lines = readFileSync(join(ROOT, c.f), 'utf8').split('\n');
    const incIdxs = lines.map((l, i) => (l.includes('getMetrics().inc(METRIC.jobsFailed') ? i : -1)).filter((i) => i >= 0);
    const seatIdx = lines.findIndex((l) => l.includes(c.seat));
    const queueOk = incIdxs.length === 1 && lines[incIdxs[0]]?.includes(`queue: '${c.queue}'`);
    const afterSeat = seatIdx >= 0 && incIdxs[0] > seatIdx;
    const withinArm = c.guard ? incIdxs[0] - lines.findIndex((l) => l.includes(c.guard)) <= 3 : incIdxs[0] - seatIdx <= 2;
    // 非 requeue 臂：inc 行不与 requeue 调用同臂相邻（±2 行内无 requeue 调用）
    const nearRequeue = lines.slice(Math.max(0, incIdxs[0] - 2), incIdxs[0] + 3).some((l) => /requeue\w*\(/.test(l));
    A(`Q6.2.${c.queue}`, `§4.6 C2 ${c.f.split('/').pop()} emit 恰一行且在终态失败臂（seat 后·guard 内·非 requeue 邻域）`,
      queueOk && afterSeat && withinArm && !nearRequeue,
      `line=${incIdxs[0] + 1} seat=${seatIdx + 1} nearRequeue=${nearRequeue}`);
  }
  // diff 形断言：四消费端仅 ±观测行（新增 import/inc/注释；删除行仅限旧 type-import），失败判定/重试/quarantine 逻辑零改。
  const consumerFiles = emitChecks.map((c) => c.f);
  const d = git(['diff', '--', ...consumerFiles]);
  const added = d.split('\n').filter((l) => l.startsWith('+') && !l.startsWith('+++'));
  const removedC = d.split('\n').filter((l) => l.startsWith('-') && !l.startsWith('---'));
  const addedOk = added.every((l) => /jobsFailed|getMetrics, METRIC|from '@meetwise\/ai-runtime';|^\+\s*\/\/|^\+\s*$/.test(l.slice(1)) || l.slice(1).trim().startsWith('//'));
  const removedOk = removedC.every((l) => l.includes('import') && l.includes('ModelClient'));
  // 语义零触机检：只看新增行的**码面**（剥整行注释与行尾 // 注释）——注释词面（如「markFailed CAS 胜出」）不是语义。
  const codeAdded = added
    .map((l) => l.replace(/^(\+(?!\+\+))\s*\/\/.*$/, '').replace(/\/\/.*$/, ''))
    .filter((l) => l.trim() !== '+' && l.trim() !== '');
  const semanticUntouched = !/markJobFailed|markQuizJobFailed|markDiagnosisJobFailed|markReportFailed|attempts|quarantin|status\s*=\s*'failed'|requeue\w*\(|WHERE|UPDATE/.test(codeAdded.join('\n'));
  A('Q6.3', '§4.6 消费端 diff 仅 ±观测行/import（+行为 inc·注释·import；-行仅旧 type-import）', addedOk && removedOk,
    `+${added.length}/-${removedC.length}`);
  A('Q6.4', '§4.6 新增码面零触失败判定/重试上限/quarantine 语义（码面关键词机检·注释词面不计）', semanticUntouched, `codeAdded=${codeAdded.length} lines`);
}

// ---------------------------------------------------------------- Q7 §4.7 runbook 锚机检 + 阈值逐字对齐
{
  const pl = sh(process.execPath, [LINT]);
  A('Q7.1', '§4.7 alerts-lint 全绿（12 事件·runbook 锚 3.10-3.12 解析·metrics_gauge 白名单机检）', pl.status === 0,
    (pl.stdout.trim().split('\n').pop() ?? '').slice(0, 140));
  const rb = readFileSync(join(ROOT, 'ai-docs/observability/alerting-runbook.md'), 'utf8');
  const anchorsOk = ['ev-queue_backlog', 'ev-queue_stuck_running', 'ev-queue_dead_letter'].every((a) => rb.includes(`id="${a}"`));
  const dlqRisk = rb.includes('只增不减');
  const snapshotDiff = rb.includes('for') && rb.includes('不伪装等价');
  A('Q7.2', '§4.7 runbook 三新锚在位 + DLQ 只增不减已知风险登记 + 快照/for 差异声明词面', anchorsOk && dlqRisk && snapshotDiff,
    `anchors=${anchorsOk} dlqRisk=${dlqRisk} snapshotDiff=${snapshotDiff}`);
  const rules = readFileSync(join(ROOT, 'docker/monitoring/alert.rules.yml'), 'utf8');
  const aligned = EVENTS.every((ev) => rules.includes(`max(${ev.metric}) > ${ev.threshold}`));
  const dlqCritical = /WorkerDeadLetterBacklog[\s\S]{0,240}?severity: critical/.test(rules);
  const backlogWarning = /WorkerQueueBacklog[\s\S]{0,240}?severity: warning/.test(rules);
  A('Q7.3', '§4.7 阈值逐字对齐 alert.rules.yml（100/5/10 严格同数·不另造第二套数）+ severity 分层映射（warning→Ticket·critical→Page）',
    aligned && dlqCritical && backlogWarning, `expr=${aligned} critical=${dlqCritical} warning=${backlogWarning}`);
}

// ---------------------------------------------------------------- Q8 §4.9 静态边界
{
  const FORBIDDEN = [
    'docker/compose.monitoring.yml', 'docker/monitoring/prometheus.yml', 'docker/monitoring/alert.rules.yml',
    'docker/monitoring/alertmanager.yml', 'docker/compose.prod.yml',
  ];
  const names = git(['diff', BASE_COMMIT, '--name-only']).split('\n').concat(git(['diff', '--name-only']).split('\n')).filter(Boolean);
  const status = sh('git', ['status', '--porcelain']).stdout.split('\n').filter(Boolean).map((l) => l.slice(3).trim());
  const migrations = [...names, ...status].filter((n) => n.startsWith('packages/db/migrations/'));
  const hit = FORBIDDEN.filter((f) => [...names, ...status].some((n) => n === f || n.startsWith(f)));
  A('Q8.1', `§4.9 静态边界：监控栈四文件+compose.prod.yml+migrations 零出现在改动清单（git diff ${BASE_COMMIT} + status）`,
    hit.length === 0 && migrations.length === 0, hit.length ? `hit=${hit.join(',')}` : `migrations=${migrations.length}`);
}

// ---------------------------------------------------------------- ledger
const receipt = {
  at: new Date().toISOString(),
  base: BASE_COMMIT,
  total: ledger.length,
  failures,
  result: failures === 0 ? 'OK' : 'FAIL',
  assertions: ledger,
};
writeFileSync(RECEIPT_OUT, `${JSON.stringify(receipt, null, 2)}\n`);
console.log(`\ncheck-alerts-queue.proof ${receipt.result} —— ${ledger.length - failures}/${ledger.length} assertions passed. receipt: ${RECEIPT_OUT}`);
console.log(`CMD=node scripts/alerts/check-alerts-queue.proof.mjs EXIT=${failures === 0 ? 0 : 1}`);
process.exit(failures === 0 ? 0 : 1);
