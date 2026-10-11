#!/usr/bin/env node
/**
 * Meetwise check-alerts — HA-5 R-47 日志面告警判定器（非 daemon·单遍扫完即退·fail-closed）。
 *
 * 形制沿 scripts/ha/ha-status.mjs（RECEIPT 块 + CMD+EXIT 行 + 机器可读 JSON 收据）。
 * Prometheus 不常驻是现状裁决（docker/compose.prod.yml:329「单机 4G 预览不常驻 Prometheus」）——
 * 本判定器按需评估「结构化日志 + compose 事件 + 宿主水位」三路原料，零常驻进程；
 * 指标面（alert.rules.yml）归 S15 常驻后启用（ai-docs/observability/alerting-runbook.md 分工声明）。
 *
 * 输入四路（目录驱动·scripts/alerts/event-catalog.json 唯一真源）：
 *   1) docker compose logs --since <窗> --timestamps（JSON 事件形 + key=value 文本形双兼容）
 *   2) docker compose ps --format json --all（compose_exit 源：migrate Exit 非 0）
 *   3) 宿主 df（disk_watermark 水位·阈值默认 85%）
 *   4) worker /metrics（HA-7 R-24 队列积压·metrics_gauge 源）：live 单遍 GET（WORKER_METRICS_URL 可覆写，
 *      默认 http://127.0.0.1:${WORKER_METRICS_PORT:-9091}/metrics·抓完即退）；offline 注入缝 --metrics-file（CI/本地样本）。
 *      阈值/severity 逐字对齐 docker/monitoring/alert.rules.yml:116-143（100/5/10·快照无 for 去抖·差异声明 runbook §3.10-3.13）。
 *
 * 用法：
 *   node scripts/alerts/check-alerts.mjs                        # 实栈四路扫描（默认 prod+ha 叠加）
 *   node scripts/alerts/check-alerts.mjs --sandbox              # 沙箱 env-file + 三 -f（沿 ha-status --sandbox 同形）
 *   node scripts/alerts/check-alerts.mjs --since 24h            # 日志窗（默认 env CHECK_ALERTS_SINCE 或 24h）
 *   node scripts/alerts/check-alerts.mjs --offline --log-file a.log [--log-file b.log]
 *                                        [--ps-file ps.json] [--df-file df.txt] [--metrics-file metrics.txt]
 *                                                       # 无 docker 注入缝（CI/本地样本·A 组 proof 依赖）
 *   node scripts/alerts/check-alerts.mjs --report               # 评估降级输出·恒 EXIT=0（沿 ha-status --report 先例）
 *   node scripts/alerts/check-alerts.mjs --catalog p --whitelist p --receipt p   # 测试覆盖路径
 *
 * EXIT 语义（fail-closed）：
 *   存在未决（非白名单）Page/Ticket 告警 → 1；干净 → 0；--report 恒 0；
 *   live 模式下输入源失效（docker 不可用/读失败/worker /metrics 抓取失败）→ 1（无法证明干净 = 不干净；
 *   metrics 源失效顺带充当「worker /metrics 不可达」探测信号）；
 *   目录/白名单文件不可读或结构非法 → 1（白名单非法条目不静默——坏白名单不得消音告警）。
 *
 * 收据：receipts/ha-5/check-alerts.receipt.json（--receipt 可覆盖）。
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '../..');
const DEFAULT_CATALOG = join(__dirname, 'event-catalog.json');
const DEFAULT_WHITELIST = join(__dirname, 'alert-whitelist.json');
const DEFAULT_RECEIPT = join(ROOT, 'receipts/ha-5/check-alerts.receipt.json');
const FILES = {
  prod: join(ROOT, 'docker/compose.prod.yml'),
  ha: join(ROOT, 'docker/compose.ha.yml'),
  sandbox: join(ROOT, 'docker/compose.ha.sandbox.yml'),
};
const SANDBOX_ENV = join(ROOT, '.tmp/ha-sandbox/sandbox.env');

// ---------------------------------------------------------------- CLI
const argv = process.argv.slice(2);
function argValue(name) {
  // 后写覆盖先写（同名 flag 重复给出时取最后一个——测试覆盖缝依赖此语义）。
  const i = argv.lastIndexOf(name);
  return i >= 0 && i + 1 < argv.length ? argv[i + 1] : undefined;
}
const sandboxMode = argv.includes('--sandbox');
const reportOnly = argv.includes('--report');
const offlineMode = argv.includes('--offline');
const since = argValue('--since') ?? process.env.CHECK_ALERTS_SINCE ?? '24h';
const catalogPath = argValue('--catalog') ?? DEFAULT_CATALOG;
const whitelistPath = argValue('--whitelist') ?? DEFAULT_WHITELIST;
const receiptPath = argValue('--receipt') ? resolve(ROOT, argValue('--receipt')) : DEFAULT_RECEIPT;
const logFiles = argv.includes('--log-file') ? argv.flatMap((a, i) => (a === '--log-file' && argv[i + 1] ? [resolve(ROOT, argv[i + 1])] : [])) : [];
const psFile = argValue('--ps-file') ? resolve(ROOT, argValue('--ps-file')) : undefined;
const dfFile = argValue('--df-file') ? resolve(ROOT, argValue('--df-file')) : undefined;
const metricsFile = argValue('--metrics-file') ? resolve(ROOT, argValue('--metrics-file')) : undefined;   // HA-7 R-24 第四注入缝

/** @type {{ step: string; ok: boolean; detail?: string }[]} */
const steps = [];
function note(step, ok, detail) {
  steps.push({ step, ok, detail });
  console.error(`[alerts:check] ${ok ? 'PASS' : 'FAIL'} ${step}${detail ? ` — ${detail}` : ''}`);
}

function sh(bin, args) {
  const r = spawnSync(bin, args, { encoding: 'utf8', cwd: ROOT, maxBuffer: 64 * 1024 * 1024 });
  return { status: r.status ?? 1, stdout: r.stdout || '', stderr: r.stderr || '', error: r.error?.message };
}

function composeArgs() {
  const base = ['-f', FILES.prod, '-f', FILES.ha];
  if (sandboxMode) {
    if (!existsSync(SANDBOX_ENV)) return null;
    return ['--env-file', SANDBOX_ENV, ...base, '-f', FILES.sandbox];
  }
  return base;
}

// ---------------------------------------------------------------- inputs
function readInjected(name, path) {
  if (!existsSync(path)) return { error: `${name} not found: ${path}` };
  try {
    return { text: readFileSync(path, 'utf8') };
  } catch (e) {
    return { error: `${name} read failed: ${e.message}` };
  }
}

function collectLogs() {
  if (logFiles.length > 0) {
    const parts = [];
    for (const f of logFiles) {
      const r = readInjected('--log-file', f);
      if (r.error) return { error: r.error };
      parts.push(r.text);
    }
    return { lines: parts.join('\n').split('\n').filter((l) => l.trim()), injected: true };
  }
  if (offlineMode) return { lines: [], injected: false, skipped: 'offline injection mode (no --log-file given)' };
  const args = composeArgs();
  if (!args) return { error: 'sandbox env-file missing (.tmp/ha-sandbox/sandbox.env) — run scripts/ha/ha-sandbox.mjs up first' };
  const r = sh('docker', ['compose', ...args, 'logs', '--since', since, '--timestamps']);
  if (r.status !== 0) return { error: `compose logs failed: ${(r.stderr || r.error || '').slice(0, 200)}` };
  return { lines: r.stdout.split('\n').filter((l) => l.trim()), injected: false };
}

function collectPs() {
  if (psFile) {
    const r = readInjected('--ps-file', psFile);
    if (r.error) return { error: r.error };
    try {
      const parsed = JSON.parse(r.text);
      return { entries: Array.isArray(parsed) ? parsed : [parsed], injected: true };
    } catch (e) {
      return { error: `--ps-file parse failed: ${e.message}` };
    }
  }
  if (offlineMode) return { entries: [], injected: false, skipped: 'offline injection mode (no --ps-file given)' };
  const args = composeArgs();
  if (!args) return { error: 'sandbox env-file missing (.tmp/ha-sandbox/sandbox.env)' };
  const r = sh('docker', ['compose', ...args, 'ps', '--format', 'json', '--all']);
  if (r.status !== 0 && !r.stdout.trim()) return { error: `compose ps failed: ${(r.stderr || r.error || '').slice(0, 200)}` };
  const entries = [];
  const out = r.stdout.trim();
  try {
    const parsed = JSON.parse(out);
    entries.push(...(Array.isArray(parsed) ? parsed : [parsed]));
  } catch {
    for (const line of out.split('\n')) {
      if (!line.trim()) continue;
      try { entries.push(JSON.parse(line)); } catch { /* skip */ }
    }
  }
  return { entries, injected: false };
}

function collectDf() {
  if (dfFile) {
    const r = readInjected('--df-file', dfFile);
    if (r.error) return { error: r.error };
    return { text: r.text, injected: true };
  }
  if (offlineMode) return { text: '', injected: false, skipped: 'offline injection mode (no --df-file given)' };
  const r = sh('df', ['-P', '/']);
  if (r.status !== 0) return { error: `df failed: ${(r.stderr || r.error || '').slice(0, 200)}` };
  return { text: r.stdout, injected: false };
}

// HA-7 R-24 第四采集器（沿 collectLogs/collectPs/collectDf 三兄弟同形）：live 单遍 GET worker /metrics 抓完即退（非 daemon），
// offline 走 --metrics-file 注入缝。live 抓取失败 = 源失效（fail-closed=1，「无法证明干净 = 不干净」既有语义）。
async function collectMetrics() {
  if (metricsFile) {
    const r = readInjected('--metrics-file', metricsFile);
    if (r.error) return { error: r.error };
    return { text: r.text, injected: true };
  }
  if (offlineMode) return { text: '', injected: false, skipped: 'offline injection mode (no --metrics-file given)' };
  const url = process.env.WORKER_METRICS_URL || `http://127.0.0.1:${process.env.WORKER_METRICS_PORT || 9091}/metrics`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return { error: `worker /metrics HTTP ${res.status} (${url})` };
    return { text: await res.text(), injected: false };
  } catch (e) {
    return { error: `worker /metrics fetch failed (${url}): ${String(e?.message ?? e).slice(0, 200)}` };
  }
}

// ---------------------------------------------------------------- matchers
/** 从日志行提取 JSON 对象：整行可解析直接用；否则取首 "{ 到末 "}" 子串（容忍 compose logs 前缀）。 */
function extractJsonObject(line) {
  const trimmed = line.trim();
  try {
    return JSON.parse(trimmed);
  } catch { /* fall through to substring */ }
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start < 0 || end <= start) return undefined;
  try {
    const v = JSON.parse(trimmed.slice(start, end + 1));
    return v && typeof v === 'object' && !Array.isArray(v) ? v : undefined;
  } catch {
    return undefined;
  }
}

// HA-7 R-24：metrics_gauge 形制助手——解析 Prometheus 文本行 `name{labels} value`，按 queue 标签取每队列 max
// （metrics.ts:68 多实例口径：gauge=全局绝对值，同 queue 多实例行取 max 去重，切勿 sum 翻倍）。
function parseMetricSeries(text, metric) {
  const series = [];
  const re = new RegExp(`^${metric}(\\{[^}]*\\})?\\s+(\\S+)$`);
  for (const raw of String(text ?? '').split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const m = line.match(re);
    if (!m) continue;
    const labels = {};
    for (const lm of (m[1] ?? '').matchAll(/([a-zA-Z_][a-zA-Z0-9_]*)="((?:\\.|[^"])*)"/g)) labels[lm[1]] = lm[2];
    const value = Number(m[2]);
    if (!Number.isFinite(value)) continue;
    series.push({ labels, value });
  }
  return series;
}

function maxGaugeByQueue(text, metric) {
  const byQueue = new Map();
  for (const s of parseMetricSeries(text, metric)) {
    const q = s.labels.queue ?? '';
    byQueue.set(q, Math.max(byQueue.get(q) ?? -Infinity, s.value));
  }
  return byQueue;
}

/** 任一队列 max 值严格大于 threshold（对齐 alert.rules.yml expr `> N` 语义）→ 命中队列清单。 */
function gaugeThresholdHits(matcher, metricsText) {
  const threshold = Number(matcher.threshold);
  const out = [];
  for (const [queue, max] of maxGaugeByQueue(metricsText, matcher.metric)) {
    if (max > threshold) out.push({ queue, max });
  }
  return out;
}

function matcherHits(matcher, line, psEntries, dfText, metricsText) {
  if (matcher.type === 'json') {
    const obj = extractJsonObject(line);
    return obj !== undefined && String(obj[matcher.field]) === String(matcher.value);
  }
  if (matcher.type === 'regex') {
    return new RegExp(matcher.pattern).test(line);
  }
  if (matcher.type === 'compose_exit') {
    const e = psEntries.find((x) => x && x.Service === matcher.service);
    if (!e) return false; // 服务不在 ps -a（如未跑过）≠ Exit 非 0 → 不告警，登记 absent 注记
    const code = Number(e.ExitCode);
    return e.State === 'exited' && Number.isFinite(code) && code !== 0;
  }
  if (matcher.type === 'df_watermark') {
    let maxPct = 0;
    for (const m of dfText.matchAll(/\s(\d{1,3})%\s/g)) {
      const pct = Number(m[1]);
      if (pct > maxPct) maxPct = pct;
    }
    return maxPct >= Number(matcher.threshold_pct);
  }
  if (matcher.type === 'metrics_gauge') {   // HA-7 R-24 第四形制（metricsText 由调用方传入；逐队列 max 严格大于阈值）
    return gaugeThresholdHits(matcher, metricsText).length > 0;
  }
  return false;
}

const VALID_SEVERITIES = ['Page', 'Ticket', 'Trend'];

function loadCatalog() {
  if (!existsSync(catalogPath)) return { error: `catalog not found: ${catalogPath}` };
  let doc;
  try {
    doc = JSON.parse(readFileSync(catalogPath, 'utf8'));
  } catch (e) {
    return { error: `catalog parse failed: ${e.message}` };
  }
  if (!doc || !Array.isArray(doc.events) || doc.events.length === 0) return { error: 'catalog.events empty/missing' };
  for (const ev of doc.events) {
    if (!ev || typeof ev.event !== 'string' || !ev.event) return { error: 'catalog entry missing event name' };
    if (!ev || !Array.isArray(ev.matchers) || ev.matchers.length === 0) return { error: `catalog entry ${ev?.event} missing matchers` };
    if (!ev || !VALID_SEVERITIES.includes(ev.severity)) return { error: `catalog entry ${ev?.event} invalid severity` };
  }
  return { doc };
}

function loadWhitelist() {
  if (!existsSync(whitelistPath)) return { error: `whitelist not found: ${whitelistPath}` };
  let doc;
  try {
    doc = JSON.parse(readFileSync(whitelistPath, 'utf8'));
  } catch (e) {
    return { error: `whitelist parse failed: ${e.message}` };
  }
  const entries = Array.isArray(doc?.entries) ? doc.entries : [];
  const today = new Date().toISOString().slice(0, 10);
  const valid = [];
  const invalid = [];
  const expired = [];
  for (const w of entries) {
    const expires = typeof w?.expires === 'string' ? w.expires : '';
    const isDate = Number.isFinite(Date.parse(expires));
    if (!w?.event || !w?.reason || !isDate) { invalid.push(w?.event ?? '(unnamed)'); continue; }
    if (expires < today) { expired.push(w.event); continue; }
    valid.push(w);
  }
  return { valid, invalid, expired };
}

// ---------------------------------------------------------------- main
const t0 = Date.now();
const catalog = loadCatalog();
if (catalog.error) {
  note('catalog load', false, catalog.error);
  console.error(`[alerts:check] fail-closed: ${catalog.error}`);
  process.exit(1);
}
const whitelist = loadWhitelist();
if (whitelist.error) note('whitelist load', false, whitelist.error);
if (whitelist.invalid?.length) note('whitelist invalid entries ignored (must not silence alerts)', false, `invalid=${whitelist.invalid.join(',')}`);
if (whitelist.expired?.length) note('whitelist expired entries re-alert', true, `expired=${whitelist.expired.join(',')}`);

const logs = collectLogs();
const ps = collectPs();
const df = collectDf();
const metrics = await collectMetrics();
if (logs.error) note('source compose logs', false, logs.error);
else note('source compose logs', true, logs.injected ? `injected ${logs.lines.length} lines` : (logs.skipped ?? `${logs.lines.length} lines since=${since}`));
if (ps.error) note('source compose ps', false, ps.error);
else note('source compose ps', true, ps.injected ? 'injected' : (ps.skipped ?? `${ps.entries.length} entries`));
if (df.error) note('source df', false, df.error);
else note('source df', true, df.injected ? 'injected' : (df.skipped ?? 'host /'));
if (metrics.error) note('source worker /metrics', false, metrics.error);
else note('source worker /metrics', true, metrics.injected ? 'injected' : (metrics.skipped ?? 'live GET ok'));

const sourceErrors = [logs.error, ps.error, df.error, metrics.error].filter(Boolean);
const absentServices = [];
const suppressed = [];
/** @type {Map<string, { event: string; severity: string; count: number; first_seen: string|null; samples: string[]; runbook: string; source: string }>} */
const alerts = new Map();

if (!sourceErrors.length) {
  for (const ev of catalog.doc.events) {
    const hit = (sample, firstSeen) => {
      const cur = alerts.get(ev.event);
      if (cur) {
        cur.count += 1;
        if (cur.samples.length < 3 && sample && !cur.samples.includes(sample)) cur.samples.push(sample);
        return;
      }
      alerts.set(ev.event, {
        event: ev.event,
        severity: ev.severity,
        count: 1,
        first_seen: firstSeen ?? null,
        samples: sample ? [sample] : [],
        runbook: ev.runbook,
        source: ev.source,
      });
    };
    const lineMatchers = ev.matchers.filter((m) => m.type === 'json' || m.type === 'regex');
    const otherMatchers = ev.matchers.filter((m) => m.type === 'compose_exit' || m.type === 'df_watermark');
    const gaugeMatchers = ev.matchers.filter((m) => m.type === 'metrics_gauge');   // HA-7 R-24 队列积压形制
    if (lineMatchers.length) {
      for (const line of logs.lines ?? []) {
        if (lineMatchers.some((m) => matcherHits(m, line, ps.entries ?? [], df.text ?? ''))) {
          const ts = line.match(/^(\S+)\s/)?.[1] ?? null;
          const firstSeen = ts && Number.isFinite(Date.parse(ts)) ? ts : null;
          const sample = line.length > 200 ? `${line.slice(0, 200)}…` : line;
          hit(sample, firstSeen);
        }
      }
    }
    for (const m of otherMatchers) {
      if (m.type === 'compose_exit') {
        const e = (ps.entries ?? []).find((x) => x && x.Service === m.service);
        if (!e) absentServices.push(m.service);
        else if (matcherHits(m, '', ps.entries ?? [], df.text ?? '')) hit(`compose ps: ${m.service} State=${e.State} ExitCode=${e.ExitCode}`, null);
      } else if (m.type === 'df_watermark' && matcherHits(m, '', [], df.text ?? '')) {
        const pct = Math.max(0, ...(df.text ?? '').matchAll(/\s(\d{1,3})%\s/g).map((x) => Number(x[1])));
        hit(`df /: use ${pct}% >= ${m.threshold_pct}%`, null);
      }
    }
    for (const m of gaugeMatchers) {   // HA-7 R-24：逐队列 max 评估；每超阈队列一条目（sample 带 queue/max 供下钻）
      for (const h of gaugeThresholdHits(m, metrics.text ?? '')) {
        hit(`${m.metric}{queue="${h.queue}"} max=${h.max} > ${m.threshold}（快照单遍·无 for 去抖·阈值对齐 alert.rules.yml）`, null);
      }
    }
  }
}

// 白名单消费：命中且未过期的条目移出告警清单（防假阳性）；过期条目已在上游失效=重新告警。
for (const [name, alert] of alerts) {
  const w = (whitelist.valid ?? []).find((x) => x.event === name);
  if (w) {
    suppressed.push({ ...alert, whitelist_reason: w.reason, whitelist_expires: w.expires });
    alerts.delete(name);
  }
}

const alertList = [...alerts.values()];
const openPageTicket = alertList.filter((a) => a.severity === 'Page' || a.severity === 'Ticket');
let exit = openPageTicket.length > 0 || sourceErrors.length > 0 ? 1 : 0;
if (reportOnly) exit = 0;

const verdict = {
  at: new Date().toISOString(),
  durationMs: Date.now() - t0,
  mode: { sandbox: sandboxMode, offline: offlineMode, report: reportOnly, since },
  catalog: { path: catalogPath, events: catalog.doc.events.length },
  whitelist: { path: whitelistPath, valid: whitelist.valid?.length ?? 0, invalid: whitelist.invalid ?? [], expired: whitelist.expired ?? [] },
  sources: {
    logs: logs.error ?? (logs.skipped ?? `lines=${logs.lines?.length ?? 0}${logs.injected ? ' (injected)' : ''}`),
    ps: ps.error ?? (ps.skipped ?? `entries=${ps.entries?.length ?? 0}${ps.injected ? ' (injected)' : ''}`),
    df: df.error ?? (df.skipped ?? 'host /'),
    metrics: metrics.error ?? (metrics.skipped ?? `bytes=${metrics.text?.length ?? 0}${metrics.injected ? ' (injected)' : ' (live)'}·HA-7 R-24`),
    sourceErrors,
    absentServices: [...new Set(absentServices)],
  },
  alerts: alertList,
  suppressed,
  openPageTicketCount: openPageTicket.length,
  exit,
  semantics: 'fail-closed: 未决 Page/Ticket 或源失效=1；干净=0；--report 恒 0；本判定器≠告警闭环全量（常驻评估+通知+值班归 S15）',
};
mkdirSync(dirname(receiptPath), { recursive: true });
writeFileSync(receiptPath, `${JSON.stringify({ ...verdict, steps }, null, 2)}\n`, 'utf8');

const lines = [
  '===== RECEIPT alerts:check =====',
  `result: ${exit === 0 ? 'CLEAN' : reportOnly ? 'OPEN_ALERTS_REPORT_ONLY' : 'OPEN_ALERTS_OR_SOURCE_ERROR'}`,
  `mode: sandbox=${sandboxMode} offline=${offlineMode} report=${reportOnly} since=${since}`,
  `catalog: ${catalog.doc.events.length} events (${catalogPath})`,
  `alerts: ${alertList.length} open / ${suppressed.length} suppressed / openPageTicket=${openPageTicket.length}`,
  ...alertList.map((a) => `alert: ${a.severity} ${a.event} count=${a.count} first_seen=${a.first_seen ?? 'n/a'} runbook=${a.runbook}`),
  ...suppressed.map((a) => `suppressed: ${a.event} until=${a.whitelist_expires} reason=${a.whitelist_reason}`),
  ...(sourceErrors.length ? [`sourceErrors: ${sourceErrors.join(' | ')}`] : []),
  ...(verdict.sources.absentServices.length ? [`absentServices(compose_exit, no hit): ${verdict.sources.absentServices.join(',')}`] : []),
  `receipt: ${receiptPath}`,
];
for (const s of steps) lines.push(`step: ${s.ok ? 'PASS' : 'FAIL'} | ${s.step}${s.detail ? ` | ${s.detail}` : ''}`);
lines.push('===== END RECEIPT =====');
console.log(lines.join('\n'));

const cmd = `node scripts/alerts/check-alerts.mjs${sandboxMode ? ' --sandbox' : ''}${offlineMode ? ' --offline' : ''}${reportOnly ? ' --report' : ''}${since !== '24h' ? ` --since ${since}` : ''}${logFiles.length ? ` --log-file x${logFiles.length}` : ''}${psFile ? ' --ps-file' : ''}${dfFile ? ' --df-file' : ''}${metricsFile ? ' --metrics-file' : ''}`;
console.log(`CMD=${cmd} EXIT=${exit}`);
process.exit(exit);
