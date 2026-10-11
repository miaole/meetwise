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
  "worker_jobs_failed_total",           // counter:worker 侧 job 终态失败次数(HA-7 R-24·四消费端终态失败臂 emit;速率告警规则归 S15 常驻后一并评估·R-22 同判)
  "rag_retrieval_total",                // counter:本地 RAG 结果/降级原因
  "rag_retrieval_latency_ms",
  "rag_retrieval_latency_ms_bucket",
  "rag_retrieval_latency_ms_sum",
  "rag_retrieval_latency_ms_count",
  "rag_cost_decisions_total",           // counter:预留/预算拒绝/未知外部结果
  "rag_cost_governance_enabled",        // gauge:生产硬门是否真正启用
  "rag_cost_budget_remaining_ratio",    // gauge:本月剩余预算比例
  "rag_cost_unknown_reservations",      // gauge:需要供应商/人工对账的调用数
  "model_cost_decisions_total",         // counter:文本/视觉模型预留、结算、预算拒绝、未知结果
  "model_cost_governance_enabled",      // gauge:模型费用治理硬门
  "model_cost_budget_remaining_ratio",  // gauge:模型本月剩余预算比例
  "model_cost_unknown_reservations",    // gauge:模型外部结果未知、等待人工对账的记录数
  "model_invocation_reconcile_invocations_total", // counter:陈旧已派发调用被冻结或对账循环失败
  "model_invocation_reconcile_frozen_costs_total", // counter:与上述调用一起冻结的费用预留数
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

// ---- 4) 事件目录 + 白名单 + runbook 锚（HA-5 §1 W4 + §4.9 · 静态·零 docker 依赖）----
// HA-5 EXEC 落点（rev2 裁决：runbook 锚机检载体=本 lint 扩展；check-alerts 运行时判定器不背文档机检职责）。
// 断言三件（REQUEST §4.9）：① runbook 文件存在；② 目录每条 runbook 锚解析到 runbook 实际小节
// （显式锚 id="<anchor>" 存在性·悬空锚=失败）；③ runbook 含 S15 登记节 + Page/Ticket/Trend 分层词面。
// 另含 W4 目录结构校验：每条目必含 event 名/matcher/severity/runbook 锚；白名单条目必含到期日——缺任一即 lint 失败。
// 测试覆盖缝（默认零改）：env ALERTS_LINT_CATALOG / ALERTS_LINT_WHITELIST / ALERTS_LINT_RUNBOOK 可指到腐化夹具。
const alertsDir = join(here, "alerts");
const catalogPath = process.env.ALERTS_LINT_CATALOG || join(alertsDir, "event-catalog.json");
const whitelistPath = process.env.ALERTS_LINT_WHITELIST || join(alertsDir, "alert-whitelist.json");
const runbookPath = process.env.ALERTS_LINT_RUNBOOK || join(here, "..", "ai-docs", "observability", "alerting-runbook.md");
const EVENT_SEVERITIES = ["Page", "Ticket", "Trend"];
const MATCHER_TYPES = ["json", "regex", "compose_exit", "df_watermark", "metrics_gauge"];   // metrics_gauge=HA-7 R-24 第四形制（W2③ 联动注册·否则 W2 新三事件机检必红）
let catalogEventCount = 0;
let whitelistEntryCount = 0;
let runbookAnchorCount = 0;

// 4a) 事件目录结构（唯一真源：scripts/alerts/event-catalog.json）。
let catalog = null;
try {
  catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
  if (!catalog || !Array.isArray(catalog.events) || catalog.events.length === 0) {
    err("event-catalog.json events 列表缺失/为空");
  } else {
    catalogEventCount = catalog.events.length;
    if (catalogEventCount < 6) err(`event-catalog.json 首批事件少于 6（实数 ${catalogEventCount}·REQUEST C1 ≥6）`);
    const seen = new Set();
    for (const ev of catalog.events) {
      const name = ev && typeof ev.event === "string" ? ev.event : "";
      if (!name) { err("event-catalog.json 存在缺 event 名的条目"); continue; }
      if (seen.has(name)) err(`event-catalog.json 事件重名:${name}`);
      seen.add(name);
      if (!Array.isArray(ev.matchers) || ev.matchers.length === 0) { err(`[${name}] 缺 matchers（目录腐化机检）`); continue; }
      for (const m of ev.matchers) {
        if (!m || !MATCHER_TYPES.includes(m.type)) { err(`[${name}] matcher type 非法:${m && m.type}`); continue; }
        if (m.type === "json" && !(typeof m.field === "string" && m.field && typeof m.value === "string" && m.value)) err(`[${name}] json matcher 缺 field/value`);
        if (m.type === "regex") { try { new RegExp(m.pattern); } catch { err(`[${name}] regex pattern 非法:${m.pattern}`); } if (typeof m.pattern !== "string" || !m.pattern) err(`[${name}] regex matcher 缺 pattern`); }
        if (m.type === "compose_exit" && !(typeof m.service === "string" && m.service)) err(`[${name}] compose_exit matcher 缺 service`);
        if (m.type === "df_watermark" && !(Number.isFinite(Number(m.threshold_pct)) && Number(m.threshold_pct) > 0 && Number(m.threshold_pct) <= 100)) err(`[${name}] df_watermark 缺 threshold_pct(0-100)`);
        // HA-7 R-24：metrics_gauge 形制校验——metric 必须在 KNOWN_METRICS 白名单（单一真源防漂移）+ threshold 有限正数。
        if (m.type === "metrics_gauge" && !(typeof m.metric === "string" && KNOWN_METRICS.has(m.metric) && Number.isFinite(Number(m.threshold)) && Number(m.threshold) > 0)) {
          err(`[${name}] metrics_gauge matcher 缺 metric(须在白名单)/threshold(>0)`);
        }
      }
      if (!EVENT_SEVERITIES.includes(ev.severity)) err(`[${name}] 缺/非法 severity（Page/Ticket/Trend·目录腐化机检）`);
      if (typeof ev.source !== "string" || !/^[A-Za-z0-9_@./-]+:[0-9]+$/.test(ev.source)) err(`[${name}] 缺 source 码锚(file:line 形)`);
      if (typeof ev.runbook !== "string" || !ev.runbook.includes("#")) err(`[${name}] 缺 runbook 锚(#锚形)`);
    }
  }
} catch (e) {
  err(`读取/解析 event-catalog.json 失败:${e.message}`);
}

// 4b) 白名单防腐化：每条目必含 event + reason + expires（ISO 到期日）——无到期日=结构非法。
try {
  const wl = JSON.parse(readFileSync(whitelistPath, "utf8"));
  const entries = Array.isArray(wl?.entries) ? wl.entries : [];
  whitelistEntryCount = entries.length;
  for (const w of entries) {
    const name = w && typeof w.event === "string" ? w.event : "(unnamed)";
    if (!name || name === "(unnamed)") err("alert-whitelist.json 存在缺 event 名的条目");
    else if (typeof w.reason !== "string" || !w.reason.trim()) err(`[whitelist:${name}] 缺 reason（窗口理由）`);
    else if (typeof w.expires !== "string" || !w.expires.trim() || Number.isNaN(Date.parse(w.expires))) {
      err(`[whitelist:${name}] 缺合法 expires 到期日（白名单防腐化·无到期日条目=结构非法）`);
    }
  }
} catch (e) {
  err(`读取/解析 alert-whitelist.json 失败:${e.message}`);
}

// 4c) runbook 锚解析（§4.9 三断言·防 runbook 与目录漂移）。
try {
  const rb = readFileSync(runbookPath, "utf8"); // 不存在时在此抛出 → 断言① 失败
  if (catalog) {
    for (const ev of catalog.events ?? []) {
      if (typeof ev?.runbook !== "string" || !ev.runbook.includes("#")) continue;
      const anchor = ev.runbook.slice(ev.runbook.lastIndexOf("#") + 1);
      if (!anchor) { err(`[${ev.event}] runbook 锚空`); continue; }
      if (!rb.includes(`id="${anchor}"`)) {
        err(`[${ev.event}] runbook 锚悬空:id="${anchor}" 未在 ${runbookPath.split("/").slice(-2).join("/")} 解析到实际小节（§4.9 断言②）`);
      } else runbookAnchorCount++;
    }
  }
  if (!/^#+.*S15.*登记/m.test(rb)) err(`runbook 缺 S15 登记节（§4.9 断言③·标题行含 "S15"+登记）`);
  for (const face of EVENT_SEVERITIES) {
    if (!rb.includes(face)) err(`runbook 缺分层词面 "${face}"（observability-strategy.md:112-116 口径机检）`);
  }
} catch (e) {
  err(`读取 runbook 失败（§4.9 断言① 文件存在）:${e.message}`);
}

// ---- 结果 -----------------------------------------------------------------------
for (const n of notes) console.log("note:", n);
if (errors.length) {
  console.error(`\nalerts-lint FAILED —— ${errors.length} 处问题:`);
  for (const e of errors) console.error("  -", e);
  process.exit(1);
}
console.log(`\nalerts-lint OK —— ${ruleCount} 条告警规则全部引用真实指标,prometheus/alertmanager 结构合法;事件目录 ${catalogEventCount} 条 + 白名单 ${whitelistEntryCount} 条 + runbook 锚解析 ${runbookAnchorCount} 条（HA-5 §4.9）全部通过。`);
