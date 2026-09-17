#!/usr/bin/env node
/**
 * M0 skeleton prove — static only.
 * Checks ADR + compose + this script exist; compose declares mysql/redis/qdrant;
 * optionally runs `docker compose … config` when the plugin is available.
 * Pins MySQL+Qdrant+Redis sole stack; cutover blocked until proves; no abandon RLS until proves.
 * releaseEvidence=false. Not HA. Does not start containers or touch .env*.
 */
import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const adrPath = join(root, 'ai-docs/delivery/adr-mysql-qdrant-local.md');
const composePath = join(root, 'docker/compose.mysql-local.yml');
const scriptPath = join(root, 'scripts/conn-stack/mysql-stack.skeleton.proof.mjs');

const requiredServices = ['mysql', 'redis', 'qdrant'];
let exitCode = 0;
const lines = [];

function fail(msg) {
  lines.push(`FAIL  ${msg}`);
  exitCode = 1;
}

function pass(msg) {
  lines.push(`PASS  ${msg}`);
}

for (const [label, path] of [
  ['ADR', adrPath],
  ['compose', composePath],
  ['proof script', scriptPath],
]) {
  if (existsSync(path)) pass(`${label} present: ${path}`);
  else fail(`${label} missing: ${path}`);
}

let composeText = '';
if (existsSync(composePath)) {
  composeText = readFileSync(composePath, 'utf8');
  for (const svc of requiredServices) {
    // YAML service key under services: (indented two spaces)
    const re = new RegExp(`^\\s{2}${svc}:\\s*$`, 'm');
    if (re.test(composeText)) pass(`compose service present: ${svc}`);
    else fail(`compose service missing: ${svc}`);
  }
  if (/DRAFT only — under \.tmp/i.test(composeText)) {
    fail('compose still marked as .tmp draft');
  } else {
    pass('compose promoted out of .tmp draft banner');
  }
}

if (existsSync(adrPath)) {
  const adr = readFileSync(adrPath, 'utf8');
  if (/PG 测试数据优先保全|PG 数据优先保全/.test(adr)) {
    fail('ADR title/body still claims PG export-first preservation');
  } else {
    pass('ADR does not claim PG export-first preservation');
  }
  if (/MySQL\s*\+\s*Qdrant\s*\+\s*Redis|MySQL\+Qdrant\+Redis/.test(adr)
    && /唯一真相|sole stack|sole-stack|当前唯一真相/.test(adr)) {
    pass('ADR pins MySQL+Qdrant+Redis as current sole stack truth');
  } else {
    fail('ADR must pin MySQL+Qdrant+Redis as current sole stack / 唯一真相');
  }
  if (/cutover blocked until proves|禁止切流|未绿禁止切流/.test(adr)) {
    pass('ADR pins cutover blocked until proves');
  } else {
    fail('ADR must pin cutover blocked until proves / 未绿禁止切流');
  }
  if (/不得放弃.*RLS|MUST NOT abandon RLS|no abandon RLS|不得放弃代码中的 RLS/i.test(adr)) {
    pass('ADR pins no abandon RLS code until proves');
  } else {
    fail('ADR must pin no abandon RLS code until privacy proves');
  }
  if (/用户改口|取消从阿里云 PG 导出历史测试数据|重构与最终测试 \*\*从 0 开始/.test(adr)) {
    fail('ADR still contains Aliyun PG export-cancel / from-zero memoir wording');
  } else {
    pass('ADR purged export-cancel / from-zero memoir wording');
  }
  if (/\*\*双跑窗口\*\*/.test(adr) || (/双跑窗口/.test(adr) && !/legacy|待删|不是/.test(adr))) {
    fail('ADR must not present dual-run window as product plan');
  } else {
    pass('ADR does not present dual-run as product plan');
  }
  if (/M0/.test(adr) && /compose\.mysql-local|skeleton\.proof|skeleton prove/i.test(adr)) {
    pass('ADR M0 = ADR + compose + skeleton prove');
  } else {
    fail('ADR M0 gate unclear');
  }
  if (/releaseEvidence\s*=\s*false/i.test(adr)) pass('ADR releaseEvidence=false');
  else fail('ADR missing releaseEvidence=false');
  if (/不宣称.*HA|Not HA|非 HA/i.test(adr) && !/releaseEvidence\s*=\s*true/i.test(adr)) {
    pass('ADR forbids HA / does not claim releaseEvidence=true');
  } else {
    fail('ADR must forbid HA claims and keep releaseEvidence=false');
  }
  // Allow forbidding the claim ("不得/不宣称 … controlPlaneClosed=true"); reject bare achievement claims.
  if (/(不宣称|不得|禁止)[^\n]{0,80}controlPlaneClosed|controlPlaneClosed[^\n]{0,80}(不宣称|不得|禁止|冻结)/.test(adr)) {
    pass('ADR forbids controlPlaneClosed=true claims');
  } else if (/controlPlaneClosed\s*=\s*true/.test(adr)) {
    fail('ADR claims controlPlaneClosed=true without forbid language');
  } else {
    pass('ADR does not claim controlPlaneClosed=true');
  }
  if (/应用层 tenant\s*≠\s*RLS|tenant ≠ RLS|≠ RLS 等价/.test(adr)) {
    pass('ADR states app-level tenant ≠ RLS equivalent');
  } else {
    fail('ADR must state 应用层 tenant ≠ RLS 等价物');
  }
  if (/DELETE/.test(adr) && /503/.test(adr) && /冻结|仍为|仍 503|仍为 503/.test(adr)) {
    pass('ADR freezes public DELETE=503');
  } else {
    fail('ADR must freeze public DELETE=503');
  }
  if (/擦除 sink|可证明删除 sink|Qdrant.*sink|sink.*Qdrant/i.test(adr)) {
    pass('ADR names Qdrant as erasure sink requiring proof');
  } else {
    fail('ADR must require Qdrant erasure sink proof');
  }
  if (/隐私不倒退/.test(adr) && /授权根不得静默降级|不得静默降/.test(adr)) {
    pass('ADR has 隐私不倒退: auth root must not silently degrade');
  } else {
    fail('ADR must have 隐私不倒退 section (auth root no silent degrade)');
  }
  if (/privacy-authorization:prove/.test(adr) && /privacy-authorization:crypto:prove/.test(adr) && /privacy-erasure-preview:prove/.test(adr)) {
    pass('ADR lists privacy-authorization / crypto / erasure-preview proves');
  } else {
    fail('ADR must list privacy-authorization:prove / crypto / erasure-preview');
  }
  if (/逐 sink receipt|逐.?sink.?receipt/i.test(adr) && /recall\s*=\s*0|recall=0/.test(adr)) {
    pass('ADR requires recall=0 + per-sink receipt for Qdrant');
  } else {
    fail('ADR must require recall=0 + 逐 sink receipt');
  }
  if (/INT-TRANSCRIPT|控制面/.test(adr) && /(不得|禁止).{0,40}(控制面已关|controlPlaneClosed)/s.test(adr)) {
    pass('ADR forbids claiming INT-TRANSCRIPT / control plane closed');
  } else {
    fail('ADR must forbid INT-TRANSCRIPT / control-plane-closed claims');
  }
  if (/RAG \/ 路由硬缺口/.test(adr) && /\*\*R1\*\*/.test(adr) && /\*\*R5\*\*/.test(adr) && /M4\/M5|M4.*M5/.test(adr)) {
    pass('ADR lists RAG R1–R5 as M4/M5 gates (not M0 file blockers)');
  } else {
    fail('ADR must document RAG R1–R5 as M4/M5 cutover gates');
  }
  if (/MODEL-OP \/ 队列硬缺口/.test(adr) && /\*\*Q1\*\*/.test(adr) && /\*\*Q5\*\*/.test(adr) && /禁止[^\n]*reconciler|不连通绿/.test(adr)) {
    pass('ADR lists MODEL-OP Q1–Q5 as M3 gates (no connectivity-green cutover claim)');
  } else {
    fail('ADR must document MODEL-OP/queue Q1–Q5 M3 gates');
  }
}

// Optional: docker compose config (plugin may be missing — static OK)
const composeCmd = ['docker', 'compose', '-f', composePath, 'config'];
const cmdStr = composeCmd.join(' ');
let composeExit = null;
const dockerCheck = spawnSync('docker', ['compose', 'version'], {
  encoding: 'utf8',
  env: process.env,
});
if (dockerCheck.status === 0) {
  const cfg = spawnSync(composeCmd[0], composeCmd.slice(1), {
    encoding: 'utf8',
    env: process.env,
    cwd: root,
  });
  composeExit = cfg.status ?? 1;
  if (composeExit === 0) pass(`docker compose config OK`);
  else {
    fail(`docker compose config failed status=${composeExit}`);
    if (cfg.stderr) lines.push(`NOTE  compose stderr bytes=${Buffer.byteLength(cfg.stderr)}`);
  }
  lines.push(`CMD=${cmdStr} EXIT=${composeExit}`);
} else {
  const pluginExit = dockerCheck.status ?? 1;
  lines.push(`NOTE  docker compose plugin unavailable; static checks only`);
  lines.push(`CMD=docker compose version EXIT=${pluginExit}`);
  lines.push(`CMD=${cmdStr} EXIT=skipped`);
  pass('static skeleton OK without compose plugin');
}

for (const line of lines) console.log(line);

const finalCmd = `node ${scriptPath}`;
console.log(`CMD=${finalCmd} EXIT=${exitCode}`);
process.exit(exitCode);
