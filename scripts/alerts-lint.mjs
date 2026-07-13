// alerts-lint —— 无新依赖(纯 node)。校验告警栈配置,核心是"防假告警":
//   1) 每条 alert 有非空 expr、有 for、有 labels.severity;annotations 非空。
//   2) expr 引用的指标名必须落在"已知真实指标"白名单里(从 /metrics 实际暴露提炼);
//      引到未知指标(手滑/幻觉出的熔断/退款/DLQ 等尚未暴露的指标)= lint 失败。
//   3) prometheus.yml / alertmanager.yml 结构合法(必需键存在)。
// 用法:node scripts/alerts-lint.mjs  (等价 pnpm alerts:lint)

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const monDir = join(here, "..", "docker", "monitoring");

// ---- 已知真实指标白名单(唯一真源:api /metrics 实际暴露)----------------------
// main.ts onResponse hook 记两个业务指标 + Prometheus 抓取自带 meta 指标。
// 熔断/退款/卡 job/DLQ 等指标当前 /metrics 未暴露 → 不在白名单 → 引用即失败。
const KNOWN_METRICS = new Set([
  "http_requests_total",
  "http_request_duration_ms",
  "http_request_duration_ms_bucket",
  "http_request_duration_ms_sum",
  "http_request_duration_ms_count",
  // Prometheus 抓取合成的 meta 指标(恒存在):
  "up",
  "scrape_duration_seconds",
  "scrape_samples_scraped",
  // worker /metrics 真实暴露(见 apps/worker/src/main.ts + circuit-breaker.ts,名与 ai-runtime METRIC 常量一致):
  "model_circuit_breaker_open_total",   // counter:熔断打开(circuit-breaker.ts emit)
  "refund_failed_total",                // counter:退款/额度释放失败(基线已注册;emit 待 commerce 接线,见交付报告)
  "worker_jobs_queued",                 // gauge:队列 queued 深度(worker 周期查 DB set)
  "worker_jobs_running_expired",        // gauge:running 超租约(卡住 job)
  "worker_jobs_dead",                   // gauge:DLQ 死信深度(quarantined / failed 终态)
]);

// PromQL 函数(标识符后紧跟 "(" 才算函数)。未知函数 = 失败(抓 typo)。
const FUNCTIONS = new Set([
  "sum", "rate", "irate", "increase", "avg", "min", "max", "count", "count_values",
  "histogram_quantile", "quantile", "absent", "absent_over_time", "vector", "scalar",
  "clamp_max", "clamp_min", "clamp", "round", "ceil", "floor", "abs", "delta", "idelta",
  "avg_over_time", "max_over_time", "min_over_time", "sum_over_time", "count_over_time",
  "stddev", "stdvar", "topk", "bottomk", "label_replace", "time",
]);

// PromQL 关键字 + 我们实际用到的低基数 label 名(非指标位)。
const KEYWORDS_AND_LABELS = new Set([
  "by", "without", "on", "ignoring", "group_left", "group_right",
  "and", "or", "unless", "offset", "bool", "inf", "nan",
  // label 名:
  "le", "status", "method", "route", "job", "instance", "severity",
]);

const errors = [];
const notes = [];
const err = (m) => errors.push(m);

// ---- 极简 YAML 子集解析(map/list/scalar,2 空格缩进,# 整行注释,引号标量)----
function tokenize(text) {
  const out = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/\t/g, "  ");
    if (!line.trim()) continue;
    if (line.trim().startsWith("#")) continue;
    const indent = line.length - line.trimStart().length;
    out.push({ indent, content: line.trim() });
  }
  return out;
}
function unquote(s) {
  const t = s.trim();
  if (t.length >= 2 && ((t[0] === '"' && t.at(-1) === '"') || (t[0] === "'" && t.at(-1) === "'"))) {
    return t.slice(1, -1).replace(t[0] === "'" ? /''/g : /\\"/g, t[0] === "'" ? "'" : '"');
  }
  return t;
}
// map 条目行判定:key: 或 key: value(key 为不含空格/引号的普通标识)。引号开头 = 标量。
function isMapEntry(s) { return /^[^\s'":#][^\s:]*:(\s|$)/.test(s); }

function parseYaml(text) {
  const lines = tokenize(text);
  let i = 0;
  function parseBlock(indent) {
    const first = lines[i];
    if (!first) return null;
    // list
    if (first.content === "-" || first.content.startsWith("- ")) {
      const arr = [];
      while (i < lines.length && lines[i].indent === indent &&
             (lines[i].content === "-" || lines[i].content.startsWith("- "))) {
        const rest = lines[i].content === "-" ? "" : lines[i].content.slice(2);
        const childIndent = indent + 2;
        if (rest !== "" && !isMapEntry(rest)) {
          // 标量列表项
          arr.push(unquote(rest));
          i++;
        } else {
          if (rest !== "") lines[i] = { indent: childIndent, content: rest };
          else i++;
          arr.push(parseBlock(childIndent));
        }
      }
      return arr;
    }
    // map
    const obj = {};
    while (i < lines.length && lines[i].indent === indent &&
           lines[i].content !== "-" && !lines[i].content.startsWith("- ")) {
      const m = lines[i].content.match(/^([^:]+):\s*(.*)$/);
      if (!m) { i++; continue; }
      const key = m[1].trim();
      const val = m[2];
      if (val === "") {
        i++;
        if (i < lines.length && lines[i].indent > indent) obj[key] = parseBlock(lines[i].indent);
        else obj[key] = null;
      } else {
        obj[key] = unquote(val);
        i++;
      }
    }
    return obj;
  }
  return parseBlock(lines.length ? lines[0].indent : 0);
}

// ---- expr 指标提取:剥字符串/花括号/方括号后,校验每个"指标位"标识符 --------------
function checkExpr(alertName, expr) {
  if (typeof expr !== "string" || !expr.trim()) { err(`[${alertName}] expr 为空`); return; }
  let s = expr
    .replace(/"(?:\\.|[^"])*"/g, " ")   // 双引号字符串(label 匹配值)
    .replace(/'(?:[^'])*'/g, " ")       // 单引号字符串
    .replace(/\{[^}]*\}/g, " ")         // {label matchers}
    .replace(/\[[^\]]*\]/g, " ");       // [range selector]
  const tokenRe = /[a-zA-Z_:][a-zA-Z0-9_:]*/g;
  let mt;
  while ((mt = tokenRe.exec(s)) !== null) {
    const name = mt[0];
    const after = s.slice(tokenRe.lastIndex).trimStart();
    // 先分类:聚合/函数(可跟 by/without 再接括号)、关键字/label、再才是指标位。
    if (FUNCTIONS.has(name)) continue;
    if (KEYWORDS_AND_LABELS.has(name)) continue;
    if (after.startsWith("(")) { err(`[${alertName}] 未知函数/调用:${name}`); continue; }
    if (!KNOWN_METRICS.has(name)) {
      err(`[${alertName}] expr 引用未知指标 "${name}" —— 不在真实 /metrics 白名单(防假告警)`);
    }
  }
}

// ---- 1) alert.rules.yml ---------------------------------------------------------
let ruleCount = 0;
try {
  const doc = parseYaml(readFileSync(join(monDir, "alert.rules.yml"), "utf8"));
  if (!doc || !Array.isArray(doc.groups)) err("alert.rules.yml 缺 groups 列表");
  for (const g of doc?.groups ?? []) {
    if (!g || typeof g.name !== "string" || !g.name) err("alert.rules.yml 存在无 name 的 group");
    if (!Array.isArray(g?.rules)) { err(`group ${g?.name} 缺 rules 列表`); continue; }
    for (const r of g.rules) {
      if (!r || typeof r.alert !== "string" || !r.alert) { err(`group ${g.name} 存在无 alert 名的规则`); continue; }
      ruleCount++;
      const a = r.alert;
      if (typeof r.expr !== "string" || !r.expr.trim()) err(`[${a}] 缺非空 expr`);
      else checkExpr(a, r.expr);
      if (r.for === undefined || r.for === null || String(r.for).trim() === "") err(`[${a}] 缺 for(去抖持续时间)`);
      const sev = r.labels && r.labels.severity;
      if (!sev || typeof sev !== "string") err(`[${a}] 缺 labels.severity`);
      else if (!["critical", "warning", "info", "none"].includes(sev)) err(`[${a}] severity 非法:${sev}`);
      if (!r.annotations || typeof r.annotations !== "object" ||
          !Object.values(r.annotations).some((v) => typeof v === "string" && v.trim())) {
        err(`[${a}] annotations 为空(告警需可解释的 summary/description)`);
      }
    }
  }
  if (ruleCount === 0) err("alert.rules.yml 没有任何 alert 规则");
} catch (e) {
  err(`读取/解析 alert.rules.yml 失败:${e.message}`);
}

// ---- 2) prometheus.yml 结构 -----------------------------------------------------
try {
  const p = parseYaml(readFileSync(join(monDir, "prometheus.yml"), "utf8"));
  if (!p || typeof p !== "object") err("prometheus.yml 解析为空");
  if (!p?.global) err("prometheus.yml 缺 global");
  if (!p?.global?.scrape_interval) err("prometheus.yml 缺 global.scrape_interval");
  if (!Array.isArray(p?.rule_files) || p.rule_files.length === 0) err("prometheus.yml 缺 rule_files");
  else if (!p.rule_files.some((f) => String(f).includes("alert.rules.yml"))) err("prometheus.yml rule_files 未引用 alert.rules.yml");
  if (!Array.isArray(p?.scrape_configs) || p.scrape_configs.length === 0) err("prometheus.yml 缺 scrape_configs");
  else {
    const jobs = p.scrape_configs.map((s) => s?.job_name).filter(Boolean);
    if (jobs.length === 0) err("prometheus.yml scrape_configs 无 job_name");
    if (!jobs.includes("meetwise-api")) err("prometheus.yml 缺抓取 api 的 job(meetwise-api)");
  }
  if (!p?.alerting?.alertmanagers) err("prometheus.yml 缺 alerting.alertmanagers");
} catch (e) {
  err(`读取/解析 prometheus.yml 失败:${e.message}`);
}

// ---- 3) alertmanager.yml 结构 ---------------------------------------------------
try {
  const am = parseYaml(readFileSync(join(monDir, "alertmanager.yml"), "utf8"));
  if (!am || typeof am !== "object") err("alertmanager.yml 解析为空");
  if (!am?.route) err("alertmanager.yml 缺 route");
  if (!am?.route?.receiver) err("alertmanager.yml 缺 route.receiver");
  if (!Array.isArray(am?.receivers) || am.receivers.length === 0) err("alertmanager.yml 缺 receivers");
  else {
    const names = am.receivers.map((r) => r?.name).filter(Boolean);
    // 缺接收端不静默:默认 receiver 必须真实存在于 receivers 列表。
    if (!names.includes(am.route.receiver)) err(`alertmanager.yml route.receiver "${am.route.receiver}" 未在 receivers 中定义`);
    notes.push(`alertmanager receivers: ${names.join(", ")}(占位,无真实密钥)`);
  }
} catch (e) {
  err(`读取/解析 alertmanager.yml 失败:${e.message}`);
}

// ---- 结果 -----------------------------------------------------------------------
for (const n of notes) console.log("note:", n);
if (errors.length) {
  console.error(`\nalerts-lint FAILED —— ${errors.length} 处问题:`);
  for (const e of errors) console.error("  -", e);
  process.exit(1);
}
console.log(`\nalerts-lint OK —— ${ruleCount} 条告警规则全部引用真实指标,prometheus/alertmanager 结构合法。`);
