#!/usr/bin/env node
/**
 * Meetwise ha-status — HA-1 拓扑判定器（A1-A6 机械判据·fail-closed）。
 *
 * pins 不变式：haStatus=NOT_HA 维持（翻转非本刀·B5/B6）；本判定器只产出
 * 「拓扑级」eligible 结论（HA_TOPOLOGY_LOCAL 语义=单机进程级冗余·≠宿主 HA·≠生产 HA），
 * 供簇收口刀引用；不写任何 pin，不改既有 NOT_HA 常量钉（append-only 精神）。
 *
 * 判据（REQUEST rev2 §2.3 A 组）：
 *   A1 api×2 每副本 /readyz/api healthy（compose ps Health）
 *   A2 web×2 每副本 healthcheck healthy
 *   A3 worker×2 每副本 /readyz/worker healthy
 *   A4 LB 在位（running+healthy）+ compose lb upstream≥2 + 宿主 nginx upstream≥2
 *      + 分流实证（X-HA-Upstream 分布 ≥2 后端·INSTANCE_ID 注入实证）
 *   A5 kill+heal 成对收据（v2）且现势 healthy
 *   A6 down 窗零失败收据（v3）
 *   RX-1 附加排除断言：原 api/worker/web 不在 running（副本计数不得被旧 service 污染）
 *   V6 可选（RX-4）：v6 收据存在时附 takeoverSeconds+rx4CasRowCount=0 断言
 *
 * 用法：
 *   node scripts/ha/ha-status.mjs                       # 判定；拓扑不齐 EXIT=1（fail-closed）
 *   node scripts/ha/ha-status.mjs --sandbox             # 用沙箱 env-file/三 -f 读 compose ps
 *   node scripts/ha/ha-status.mjs --report              # 只评估不因未跑收据而 EXIT=1（收据缺失降级 FAIL 仍输出）
 *
 * 收据源：receipts/ha-1/（v1/v2/v3/v4/v6 + resource-budget）。机器可读 JSON 落
 * receipts/ha-1/ha-status.receipt.json；stdout 为 RECEIPT 块 + CMD+EXIT 行（沿 probe.multi.mjs 形）。
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '../..');
const RECEIPTS = join(ROOT, 'receipts/ha-1');
const SANDBOX_ENV = join(ROOT, '.tmp/ha-sandbox/sandbox.env');
const FILES = {
  prod: join(ROOT, 'docker/compose.prod.yml'),
  ha: join(ROOT, 'docker/compose.ha.yml'),
  sandbox: join(ROOT, 'docker/compose.ha.sandbox.yml'),
  lbConf: join(ROOT, 'docker/lb.nginx.conf'),
  nginxConf: join(ROOT, 'ops/deploy/nginx.conf'),
};

const argv = process.argv.slice(2);
const sandboxMode = argv.includes('--sandbox');
const reportOnly = argv.includes('--report');

const HA_SERVICES = ['api-a', 'api-b', 'web-a', 'web-b', 'worker-a', 'worker-b', 'lb'];
const ORIG3 = ['api', 'worker', 'web'];
const REPLICA_GROUPS = { api: ['api-a', 'api-b'], web: ['web-a', 'web-b'], worker: ['worker-a', 'worker-b'] };

/** @type {{ step: string; ok: boolean; detail?: string }[]} */
const steps = [];
function note(step, ok, detail) {
  steps.push({ step, ok, detail });
  console.error(`[ha:status] ${ok ? 'PASS' : 'FAIL'} ${step}${detail ? ` — ${detail}` : ''}`);
}

function sh(bin, args) {
  const r = spawnSync(bin, args, { encoding: 'utf8', cwd: ROOT, maxBuffer: 32 * 1024 * 1024 });
  return { status: r.status ?? 1, stdout: r.stdout || '', stderr: r.stderr || '' };
}

function composeArgs() {
  const base = ['-f', FILES.prod, '-f', FILES.ha];
  if (sandboxMode) {
    if (!existsSync(SANDBOX_ENV)) return null;
    return ['--env-file', SANDBOX_ENV, ...base, '-f', FILES.sandbox];
  }
  return base;
}

function composePsJson() {
  const args = composeArgs();
  if (!args) return { entries: [], error: 'sandbox env-file missing (.tmp/ha-sandbox/sandbox.env) — run ha-sandbox.mjs up first' };
  const r = sh('docker', ['compose', ...args, 'ps', '--format', 'json', '--all']);
  if (r.status !== 0 && !r.stdout.trim()) return { entries: [], error: `compose ps failed: ${r.stderr.slice(0, 200)}` };
  const out = r.stdout.trim();
  const entries = [];
  try {
    const parsed = JSON.parse(out);
    entries.push(...(Array.isArray(parsed) ? parsed : [parsed]));
  } catch {
    for (const line of out.split('\n')) {
      if (!line.trim()) continue;
      try { entries.push(JSON.parse(line)); } catch { /* skip */ }
    }
  }
  return { entries };
}

function upstreamServerCount(file) {
  if (!existsSync(file)) return -1;
  const t = readFileSync(file, 'utf8');
  const m = t.match(/upstream\s+\w+\s*\{([^}]*)\}/);
  if (!m) return 0;
  return (m[1].match(/^\s*server\s+\S+/gm) || []).length;
}

function readJsonReceipt(name) {
  const p = join(RECEIPTS, name);
  if (!existsSync(p)) return null;
  try { return JSON.parse(readFileSync(p, 'utf8')); } catch { return { parseError: true }; }
}

// ----------------------------------------------------------------------- main

const criteria = {};
const evidence = { receipts: {}, exclusions: {} };

note('honesty banner', true, 'haStatus=NOT_HA maintained (pin unchanged; flip not this knife — B5/B6); topology-local verdict only');

const { entries, error } = composePsJson();
if (error) note('compose ps', false, error);
const running = new Map(entries.map((e) => [e.Service, e]));
const healthy = (svc) => {
  const e = running.get(svc);
  return Boolean(e && e.State === 'running' && String(e.Health).toLowerCase() === 'healthy');
};

// RX-1 排除断言（先于 A1-A3：计数不得被旧 service 污染）。
const origRunning = ORIG3.filter((s) => {
  const e = running.get(s);
  return e && e.State === 'running';
});
evidence.exclusions.rx1OriginalThreeRunning = origRunning;
note('RX-1 original api/worker/web not running', origRunning.length === 0, origRunning.length ? origRunning.join(',') : 'absent/never created');

// A1-A3：显式服务名清单副本计数 + 每副本 healthy。
for (const [comp, svcs] of Object.entries(REPLICA_GROUPS)) {
  const count = svcs.filter((s) => running.has(s) && running.get(s).State === 'running').length;
  const allHealthy = svcs.every((s) => healthy(s));
  criteria[`A${comp === 'api' ? 1 : comp === 'web' ? 2 : 3}`] = count >= 2 && allHealthy && origRunning.length === 0;
  evidence[comp] = svcs.map((s) => ({ service: s, state: running.get(s)?.State ?? 'absent', health: running.get(s)?.Health ?? 'n/a' }));
  note(`A${comp === 'api' ? 1 : comp === 'web' ? 2 : 3} ${comp}×2 healthy`, criteria[`A${comp === 'api' ? 1 : comp === 'web' ? 2 : 3}`], `running=${count} healthy=${svcs.filter(healthy).length}`);
}

// A4：LB 在位 + 双层 upstream 静态 ≥2 + 分流实证。
const lbOk = healthy('lb');
const lbUpstreams = upstreamServerCount(FILES.lbConf);
const hostUpstreams = upstreamServerCount(FILES.nginxConf);
note('A4 lb running+healthy', lbOk, `lbConf=${lbUpstreams} servers, hostNginx=${hostUpstreams} servers`);
const v4 = readJsonReceipt('v4-split.receipt.json');
evidence.receipts.v4 = v4 ? 'present' : 'missing';
const distinctBackends = v4 && v4.preStop ? Object.keys(v4.preStop.upstreams || {}).length : 0;
const idsOk = Boolean(v4 && v4.instanceIds && v4.instanceIds['api-a'] === 'api-a' && v4.instanceIds['api-b'] === 'api-b');
criteria.A4 = lbOk && lbUpstreams >= 2 && hostUpstreams >= 2 && distinctBackends >= 2 && idsOk;
note('A4 split proof', criteria.A4, `distinct=${distinctBackends} instanceIds=${idsOk}`);

// A5：kill+heal 成对收据 + 现势 healthy。
const v2 = readJsonReceipt('v2-kill-heal.receipt.json');
evidence.receipts.v2 = v2 ? 'present' : 'missing';
const v2Ok = Boolean(v2 && Array.isArray(v2.kills) && v2.kills.length >= 3 && v2.kills.every((k) => k.healed && k.healSeconds !== undefined));
criteria.A5 = v2Ok && REPLICA_GROUPS.api.every(healthy);
note('A5 kill+heal receipts', criteria.A5, v2Ok ? `${v2.kills.length} kills healed` : 'v2 receipt missing/incomplete');

// A6：down 窗零失败收据。
const v3 = readJsonReceipt('v3-failover.receipt.json');
evidence.receipts.v3 = v3 ? 'present' : 'missing';
criteria.A6 = Boolean(v3 && v3.result === 'OK' && v3.failureCount === 0 && v3.healed === true);
note('A6 down-window zero failure', criteria.A6, v3 ? `failures=${v3.failureCount} window=${v3.windowSeconds}s` : 'v3 receipt missing');

// V1 拓扑收据存在性（起得来证明）。
const v1 = readJsonReceipt('v1-topology.receipt.json');
evidence.receipts.v1 = v1 ? 'present' : 'missing';
note('V1 topology receipt', Boolean(v1 && v1.result === 'OK'), v1 ? `healthySeconds=${v1.healthySeconds}` : 'missing');

// V6 可选（RX-4）：收据在则附 CAS 断言。
const v6 = readJsonReceipt('v6-lease.receipt.json');
evidence.receipts.v6 = v6 ? 'present' : 'missing';
evidence.v6 = v6
  ? { takeoverBy: v6.takeoverBy, takeoverSeconds: v6.takeoverSeconds, rx4CasRowCount: v6.rx4CasRowCount, rx4AssertOk: v6.rx4CasRowCount === 0 }
  : { note: 'optional (RX-4) — not run; judge does not gate on it' };
if (v6) note('V6 optional RX-4 assertion', v6.rx4CasRowCount === 0, `takeover=${v6.takeoverBy} in ${v6.takeoverSeconds}s casRowCount=${v6.rx4CasRowCount}`);

// 资源预算表落卷检查（§5-4）。
const budget = readJsonReceipt('resource-budget.json');
evidence.receipts.resourceBudget = budget ? budget.decision : 'missing';
note('resource budget receipt', Boolean(budget && budget.decision === 'A_4c8g_host_upgrade'), budget ? `totalMib=${budget.totalMib}` : 'missing');

const allGreen = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6'].every((k) => criteria[k] === true);
const topologyVerdict = allGreen ? 'HA_TOPOLOGY_LOCAL_ELIGIBLE' : 'NOT_ELIGIBLE';

const verdict = {
  at: new Date().toISOString(),
  sandboxMode,
  haStatus: 'NOT_HA',
  haStatusBasis: 'pin 十一值零翻转（north-star-ha.md:67 + REQUEST §6）；翻转须 B1-B6（含 G7 全量收据）+协调方裁定·非本刀',
  topologyVerdict,
  topologySemantics: 'HA_TOPOLOGY_LOCAL=单机进程级冗余（多副本+健康检查+自愈+LB）·宿主仍是 SPOF·≠生产 100% HA',
  criteria,
  rx1ExclusionPass: origRunning.length === 0,
  evidence,
  note: allGreen
    ? 'A1-A6 全绿=进程级冗余本体齐（拓扑级证据）·仍 NOT_HA·仍 releaseEvidence=false·≠宿主 HA'
    : 'A1-A6 未全绿 — fail-closed 拒 eligible；缺口见 steps/ack',
};

mkdirSync(RECEIPTS, { recursive: true });
writeFileSync(join(RECEIPTS, 'ha-status.receipt.json'), `${JSON.stringify({ ...verdict, steps }, null, 2)}\n`, 'utf8');

const lines = [
  '===== RECEIPT ha:status =====',
  `result: ${topologyVerdict}`,
  `haStatus: NOT_HA (pin unchanged)`,
  `releaseEvidence: false`,
  `claimProductionHA: false`,
  `criteria: ${JSON.stringify(criteria)}`,
  `rx1Exclusion: ${origRunning.length === 0 ? 'PASS' : `FAIL(${origRunning.join(',')})`}`,
  `receipts: ${JSON.stringify(evidence.receipts)}`,
  `sandboxMode: ${sandboxMode}`,
];
for (const s of steps) lines.push(`step: ${s.ok ? 'PASS' : 'FAIL'} | ${s.step}${s.detail ? ` | ${s.detail}` : ''}`);
lines.push('===== END RECEIPT =====');
console.log(lines.join('\n'));

const exit = allGreen ? 0 : reportOnly ? 0 : 1;
console.log(`CMD=node scripts/ha/ha-status.mjs${sandboxMode ? ' --sandbox' : ''}${reportOnly ? ' --report' : ''} EXIT=${exit}`);
process.exit(exit);
