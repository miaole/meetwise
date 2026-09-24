#!/usr/bin/env node
/**
 * UC-E2E-028 — trace/账本失败不阻塞（NON-UI static inventory + GAP mark-red）
 *
 * releaseEvidence=false · Not HA · 本绿 ≠ UC-E2E-028 covered · 本绿 ≠ 全链路 E2E covered
 * 矩阵保持 **gap**（honest）；EXIT=0 = 诚实钉缺口 ≠ A1 fail-open / A2 recon / A3 E2E 闭环
 *
 * 搜码结论（本树）：
 *   - Spec（ai-safety / UC-E2E-028）：ai_invocation_traces = best-effort，写失败不阻断业务
 *   - Code：persistTrace 与 settleAiTextCost / completeModelInvocation 同 asPrincipal 事务；
 *     INSERT 失败落入 catch → return external_outcome_unknown（阻塞成功路径，非 fail-open）
 *   - 无 missing-trace 重写队列 / 对账补写；无 e2e TC-E2E-028 注入
 *   - 旁证≠covered：report-bulkhead（报告舱壁）· releaseSharedAdmissionBestEffort · reqid/estimate-threading
 *
 * 若产品浮出（persistTrace 旁路 best-effort + 注入 prove / recon）→ 拒 EXIT=0，
 * 须另刀 fail-open isolation prove，不得继续用 gap mark-red 叙事。
 */
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const apiRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = resolve(apiRoot, '../..');

function read(rel) {
  const p = resolve(repoRoot, rel);
  assert.equal(existsSync(p), true, `missing file: ${rel}`);
  return readFileSync(p, 'utf8');
}

function listFiles(dirRel, pred) {
  const abs = resolve(repoRoot, dirRel);
  if (!existsSync(abs)) return [];
  return readdirSync(abs)
    .filter((n) => pred(n))
    .map((n) => join(dirRel, n));
}

const gaps = [];
function pinGap(id, detail) {
  gaps.push({ id, detail });
  console.log(`GAP  ${id}  ${detail}`);
}

const FAIL_OPEN_WRAP_RE =
  /persistTrace[\s\S]{0,120}\.catch\s*\(|await\s+persistTrace[\s\S]{0,80}\.catch|try\s*\{\s*await\s+persistTrace[\s\S]{0,200}\}\s*catch/i;
const RECON_QUEUE_RE =
  /\b(trace_rewrite|rewrite_trace|missing_trace|trace_backfill|trace_reconcil|补写.*trace|trace.*补写)\b/i;

const checks = {
  'S1-persistTrace-inserts-ai_invocation_trace': () => {
    const invoke = read('packages/ai-runtime/src/invoke.ts');
    assert.match(invoke, /async function persistTrace\s*\(/, 'persistTrace function present');
    assert.match(
      invoke,
      /INSERT INTO ai_invocation_trace\s*\(/,
      'persistTrace must INSERT ai_invocation_trace',
    );
    // Comment inventory: intentional non-silent for missing column — not UC-028 fail-open
    assert.match(
      invoke,
      /persistTrace 无条件写入|若库缺它应让 INSERT 报错/,
      'inventory: persistTrace documented as unconditional write (migration gap expose), not silent fail-open',
    );
  },

  'S2-persistTrace-coupled-in-settle-txn': () => {
    const invoke = read('packages/ai-runtime/src/invoke.ts');
    // Locate the post-validate settle block that calls persistTrace
    const settleIdx = invoke.indexOf('await settleAiTextCost');
    assert.ok(settleIdx >= 0, 'settleAiTextCost call present');
    const region = invoke.slice(settleIdx, settleIdx + 3500);
    assert.match(region, /await completeModelInvocation\s*\(/, 'same region completes model invocation');
    assert.match(region, /if\s*\(\s*!error\s*\)\s*await\s+persistTrace\s*\(/, 'persistTrace awaited in same settle region');
    // Catch of that try returns external_outcome_unknown — coupling = block success
    const tryCatch = invoke.slice(invoke.lastIndexOf('try {', settleIdx), settleIdx + 4500);
    assert.match(
      tryCatch,
      /return\s*\{\s*error:\s*['"]external_outcome_unknown['"]\s*\}/,
      'settle/record catch returns external_outcome_unknown (trace fail shares this path)',
    );
    // Must NOT already be best-effort-wrapped in this region
    assert.doesNotMatch(
      region,
      FAIL_OPEN_WRAP_RE,
      'inventory: persistTrace must not already be .catch best-effort in settle region (else refuse gap narrative)',
    );
  },

  'S3-no-missing-trace-rewrite-queue': () => {
    const invoke = read('packages/ai-runtime/src/invoke.ts');
    assert.doesNotMatch(invoke, RECON_QUEUE_RE, 'invoke.ts must not host missing-trace rewrite/recon');
    const reconciler = resolve(repoRoot, 'packages/ai-runtime/src/usage-calibration-reconciler.ts');
    if (existsSync(reconciler)) {
      const body = readFileSync(reconciler, 'utf8');
      assert.doesNotMatch(
        body,
        /\bmissing_trace\b|\btrace_rewrite\b|\brewrite_trace\b/i,
        'usage-calibration-reconciler ≠ UC-028 missing-trace rewrite queue',
      );
    }
    // Worker / domain quick inventory for dedicated rewrite
    for (const rel of [
      'packages/ai-runtime/src/index.ts',
      'apps/worker/src/main.ts',
    ]) {
      const body = read(rel);
      assert.doesNotMatch(body, /\btrace_rewrite_queue\b|\bmissing_trace_backfill\b/i, `${rel}: no rewrite queue symbol`);
    }
  },

  'S4-no-e2e-uc028-scenario': () => {
    const e2eFiles = listFiles('e2e', (n) => n.endsWith('.e2e.ts') || n === 'full.e2e.ts');
    assert.ok(e2eFiles.length >= 1, 'e2e suite files should exist');
    for (const rel of e2eFiles) {
      const body = read(rel);
      assert.doesNotMatch(
        body,
        /UC-E2E-028|TC-E2E-028|trace-fail-open|trace_ledger_fail/i,
        `${rel} must not claim UC-E2E-028 coverage`,
      );
    }
    const helpersDir = resolve(repoRoot, 'e2e/helpers');
    if (existsSync(helpersDir)) {
      for (const n of readdirSync(helpersDir)) {
        if (!/\.(ts|mjs|js)$/.test(n)) continue;
        const body = readFileSync(join(helpersDir, n), 'utf8');
        assert.doesNotMatch(
          body,
          /TC-E2E-028|UC-E2E-028/,
          `e2e/helpers/${n} must not pin UC-E2E-028`,
        );
      }
    }
  },

  'S5-spec-best-effort-vs-code-coupling': () => {
    const safety = read('ai-docs/requirements/use-cases/ai-safety-system.md');
    assert.match(
      safety,
      /ai_invocation_traces[\s\S]{0,80}best-effort|best-effort[\s\S]{0,80}不阻断/,
      'spec pins ai_invocation_traces as best-effort / non-blocking',
    );
    const scenarios = read('ai-docs/requirements/use-cases/e2e-scenarios.md');
    assert.match(scenarios, /UC-E2E-028/, 'e2e-scenarios defines UC-E2E-028');
    assert.match(scenarios, /trace 写入失败\*\*不回滚业务事务\*\*|不回滚业务事务/, 'UC-028 requires non-rollback on trace fail');
    // 旁证：report bulkhead exists but ≠ UC-028 fail-open
    const bulkhead = resolve(repoRoot, 'apps/worker/test/report-bulkhead.proof.ts');
    assert.equal(existsSync(bulkhead), true, 'report-bulkhead.proof.ts present as 旁证≠UC-028');
    const bh = readFileSync(bulkhead, 'utf8');
    assert.match(bh, /不阻塞|enqueue/, 'report-bulkhead asserts report isolation (旁证)');
    assert.doesNotMatch(bh, /UC-E2E-028|persistTrace/, 'report-bulkhead must not claim UC-028 / persistTrace fail-open');
  },

  'G-GAP-product-surface-or-pins': () => {
    const invoke = read('packages/ai-runtime/src/invoke.ts');
    const settleIdx = invoke.indexOf('await settleAiTextCost');
    const region = settleIdx >= 0 ? invoke.slice(settleIdx, settleIdx + 3500) : '';
    const failOpenWired = FAIL_OPEN_WRAP_RE.test(region) || FAIL_OPEN_WRAP_RE.test(invoke);
    const reconWired = RECON_QUEUE_RE.test(invoke);
    const e2eHits = listFiles('e2e', (n) => n.endsWith('.e2e.ts') || n === 'full.e2e.ts').some((rel) =>
      /UC-E2E-028|TC-E2E-028/.test(read(rel)),
    );

    if (failOpenWired || reconWired || e2eHits) {
      throw new Error(
        'PRODUCT_SURFACE: persistTrace fail-open / rewrite queue / UC-028 e2e appears wired — refuse gap EXIT=0; wire fail-open isolation prove (TC-E2E-028-*) instead of mark-red',
      );
    }

    pinGap(
      'GAP-UC028-FAIL-OPEN',
      'TC-E2E-028-trace-fail / A1: persistTrace shares settle txn; INSERT fail → external_outcome_unknown (blocks success); no best-effort isolation prove',
    );
    pinGap(
      'GAP-UC028-RECON',
      'TC-E2E-028-recon / A2: no missing-trace rewrite queue / event-ledger backfill path; usage-calibration-reconciler ≠ UC-028 recon',
    );
    pinGap(
      'GAP-UC028-TRUTH-BLOCK-E2E',
      'TC-E2E-028-truth-block / A3: cost/settlement failure→unknown exists in invoke catch (inventory only); no dedicated E2E contrast that business-truth fail blocks while trace fail must not',
    );
    pinGap(
      'GAP-UC028-INJECT',
      'No fault-inject harness for ai_invocation_trace write failure under live interview completed + consumption confirmed; no e2e/*.e2e.ts UC-028 scenario',
    );
  },
};

let failed = 0;
for (const [name, fn] of Object.entries(checks)) {
  try {
    fn();
    console.log(`PASS ${name}`);
  } catch (e) {
    failed += 1;
    console.log(`FAIL ${name}: ${(e && e.message) || e}`);
  }
}

console.log('');
console.log(`GAPS=${gaps.length} ${gaps.map((g) => g.id).join(',')}`);
console.log('NOTE: releaseEvidence=false · Not HA · 本绿≠UC-E2E-028 covered · 本绿≠全链路 E2E covered');
console.log('NOTE: matrix=gap(honest) · EXIT=0=mark-red honesty ≠ A1 fail-open / A2 recon / A3 E2E closed');
console.log('NOTE: 旁证≠covered: report-bulkhead · releaseSharedAdmissionBestEffort · reqid/estimate-threading · model-invocation-reconcile');
console.log(`CMD=pnpm -C apps/api prove:uc028-trace-fail-open EXIT=${failed === 0 ? 0 : 1}`);
process.exit(failed === 0 ? 0 : 1);
