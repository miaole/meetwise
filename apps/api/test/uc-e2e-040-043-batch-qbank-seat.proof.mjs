#!/usr/bin/env node
/**
 * UC-E2E-040–043 — B 端批匹配 / 题库导入 / 席位 CAS（NON-UI static inventory + GAP mark-red）
 *
 * releaseEvidence=false · Not HA · 本绿 ≠ UC-E2E-040–043 covered · 本绿 ≠ 全链路 E2E covered
 * 矩阵保持 **partial**（单岗位绑定闭环有）+ 批任务/题库导入/席位 CAS **gap**（honest）；
 * EXIT=0 = 诚实钉缺口 ≠ batch/import/seat-CAS 产品/E2E 闭环
 *
 * 搜码结论（本树）：
 *   - 旁证≠covered：full.e2e.ts 岗位幂等+投递+绑定面试；recruiting-bound.spec.ts；recruiter:prove / neg:bend
 *   - 缺：BatchJob 批匹配 saga / partial_failed；B 端题库文件导入 partial_failed；SeatLedger 席位 CAS；
 *     QuestionBankItem 双签采纳；D4 三状态机未进 status-machine 载重
 *   - qbank-ingest / privacy partial_failed ≠ UC-041 / UC-040 BatchJob
 *
 * 若产品浮出（BatchJob HTTP + seat CAS prove / import partial_failed e2e）→ 拒 EXIT=0，
 * 须另刀产品闭环 prove，不得继续用 batch-gap mark-red 叙事。
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

function listMigrations() {
  const abs = resolve(repoRoot, 'packages/db/migrations');
  if (!existsSync(abs)) return [];
  return readdirSync(abs)
    .filter((n) => n.endsWith('.sql'))
    .map((n) => join('packages/db/migrations', n));
}

const gaps = [];
function pinGap(id, detail) {
  gaps.push({ id, detail });
  console.log(`GAP  ${id}  ${detail}`);
}

const BATCH_HTTP_RE =
  /@(Post|Get|Put|Patch|Delete)\(['"`]?(batch|matches|match-batch|seats|seat|qbank-import|question-bank.?import|import-questions)/i;
const BATCH_JOB_TABLE_RE =
  /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:public\.)?batch_job\b/i;
const SEAT_LEDGER_TABLE_RE =
  /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:public\.)?(?:seat_ledger|seat_quota)\b/i;
const QBANK_ITEM_TABLE_RE =
  /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:public\.)?question_bank_item\b/i;
const UC040_SCENARIO_RE = /UC-E2E-040|UC-E2E-041|UC-E2E-042|UC-E2E-043|TC-E2E-040|TC-E2E-041|TC-E2E-042|TC-E2E-043/;

const checks = {
  'S1-recruiter-jobs-no-batch-seat-import-routes': () => {
    const ctrl = read('apps/api/src/modules/recruiter/recruiter.controller.ts');
    assert.match(ctrl, /@Controller\(['"]recruiter['"]\)/, 'recruiter controller present');
    assert.match(ctrl, /@Post\(['"]jobs['"]\)/, 'jobs create present (单岗位旁证面)');
    assert.match(ctrl, /@Get\(['"]jobs\/:id\/candidates['"]\)/, 'candidates list present');
    assert.doesNotMatch(ctrl, BATCH_HTTP_RE, 'recruiter must not expose batch/match/seat/qbank-import routes');
    const svc = read('apps/api/src/modules/recruiter/recruiter.service.ts');
    assert.match(svc, /createJob|listJobs/, 'recruiter service uses job helpers');
    assert.doesNotMatch(
      svc,
      /\b(BatchJob|SeatLedger|QuestionBankItem|batchMatch|seatQuota|seatUsed|partial_failed)\b/,
      'recruiter.service must not host BatchJob/SeatLedger/QuestionBankItem product surface',
    );
  },

  'S2-no-batch-job-seat-ledger-qbank-item-tables': () => {
    const migrations = listMigrations();
    assert.ok(migrations.length >= 10, 'migrations directory should exist');
    let batchHit = null;
    let seatHit = null;
    let qbiHit = null;
    for (const rel of migrations) {
      const body = read(rel);
      if (BATCH_JOB_TABLE_RE.test(body)) batchHit = rel;
      if (SEAT_LEDGER_TABLE_RE.test(body)) seatHit = rel;
      if (QBANK_ITEM_TABLE_RE.test(body)) qbiHit = rel;
    }
    assert.equal(batchHit, null, `inventory: no batch_job table (found in ${batchHit})`);
    assert.equal(seatHit, null, `inventory: no seat_ledger/seat_quota table (found in ${seatHit})`);
    assert.equal(qbiHit, null, `inventory: no question_bank_item table (found in ${qbiHit})`);
  },

  'S3-qbank-ingest-ne-uc041-import-and-privacy-partial-ne-batch': () => {
    // RAG qbank-ingest exists but is NOT B-end HR file import (UC-041)
    const ingest = resolve(repoRoot, 'packages/db/src/qbank-ingest.ts');
    assert.equal(existsSync(ingest), true, 'qbank-ingest.ts present as RAG旁证≠UC-041');
    const qi = readFileSync(ingest, 'utf8');
    assert.doesNotMatch(
      qi,
      /UC-E2E-041|TC-E2E-041|partial_failed|QuestionBankItem|HR.?导入|题库导入批/,
      'qbank-ingest must not claim UC-041 B-end import / partial_failed BatchJob semantics',
    );
    // privacy partial_failed ≠ BatchJob
    const mem = read('packages/domain/src/memory-control-surface.ts');
    assert.match(mem, /partial_failed/, 'privacy/memory deletion uses partial_failed (旁证≠BatchJob)');
    assert.doesNotMatch(mem, /BatchJob|UC-E2E-040|席位/, 'memory-control-surface ≠ BatchJob / UC-040');
  },

  'S4-full-e2e-recruiting-binding-旁证-no-uc040-scenario': () => {
    const full = read('e2e/full.e2e.ts');
    assert.match(full, /recruiter\/jobs|岗位绑定|投递/, 'full.e2e has recruiting/job binding 旁证');
    assert.doesNotMatch(
      full,
      UC040_SCENARIO_RE,
      'full.e2e must not claim UC-E2E-040–043 / TC-E2E-040–043 coverage',
    );
    assert.doesNotMatch(
      full,
      /\b(BatchJob|SeatLedger|partial_failed|席位 CAS|题库导入)\b/,
      'full.e2e recruiting binding ≠ batch/import/seat-CAS',
    );
    const ui = resolve(repoRoot, 'apps/web/e2e-ui/recruiting-bound.spec.ts');
    assert.equal(existsSync(ui), true, 'recruiting-bound.spec.ts present as UI旁证≠covered');
    const uiBody = readFileSync(ui, 'utf8');
    assert.doesNotMatch(uiBody, UC040_SCENARIO_RE, 'recruiting-bound.spec must not pin UC-040–043');
  },

  'S5-scenarios-define-040-043-but-status-machine-d4-absent': () => {
    const scenarios = read('ai-docs/requirements/use-cases/e2e-scenarios.md');
    assert.match(scenarios, /UC-E2E-040/, 'e2e-scenarios defines UC-E2E-040');
    assert.match(scenarios, /UC-E2E-041/, 'e2e-scenarios defines UC-E2E-041');
    assert.match(scenarios, /UC-E2E-042/, 'e2e-scenarios defines UC-E2E-042');
    assert.match(scenarios, /UC-E2E-043/, 'e2e-scenarios defines UC-E2E-043');
    assert.match(scenarios, /BatchJob|SeatLedger|QuestionBankItem/, 'scenarios name D4 state machines');
    const sm = read('ai-docs/rules/global/status-machine.md');
    assert.doesNotMatch(
      sm,
      /\b(BatchJob|SeatLedger|QuestionBankItem)\b/,
      'status-machine load list must not yet include D4 BatchJob/SeatLedger/QuestionBankItem',
    );
    const bend = read('ai-docs/requirements/use-cases/bend-recruiting.md');
    assert.match(bend, /席位|题库|匹配/, 'bend-recruiting TARGET specs exist');
    assert.match(
      bend,
      /TARGET|未建|未全部落地|部分/,
      'bend-recruiting honesty: TARGET / not fully landed',
    );
  },

  'G-GAP-product-surface-or-pins': () => {
    const ctrl = read('apps/api/src/modules/recruiter/recruiter.controller.ts');
    const batchRoutes = BATCH_HTTP_RE.test(ctrl);
    const migrations = listMigrations();
    const tablesWired = migrations.some((rel) => {
      const body = read(rel);
      return BATCH_JOB_TABLE_RE.test(body) || SEAT_LEDGER_TABLE_RE.test(body) || QBANK_ITEM_TABLE_RE.test(body);
    });
    const e2eHits = ['e2e/full.e2e.ts', 'apps/web/e2e-ui/recruiting-bound.spec.ts'].some((rel) => {
      if (!existsSync(resolve(repoRoot, rel))) return false;
      return UC040_SCENARIO_RE.test(read(rel));
    });
    const sm = read('ai-docs/rules/global/status-machine.md');
    const d4Loaded = /\b(BatchJob|SeatLedger|QuestionBankItem)\b/.test(sm);

    if (batchRoutes || tablesWired || e2eHits || d4Loaded) {
      throw new Error(
        'PRODUCT_SURFACE: BatchJob/seat/import routes or D4 status-machine / UC-040 e2e appears wired — refuse gap EXIT=0; wire product isolation prove (TC-E2E-040–043) instead of mark-red',
      );
    }

    pinGap(
      'GAP-UC040-BATCH-PARTIAL',
      'TC-E2E-040-batch / TC-E2E-040-partial / A1: no BatchJob queued→running→partial_failed HTTP/saga; full.e2e recruiting binding = 旁证≠covered',
    );
    pinGap(
      'GAP-UC041-IMPORT-PARTIAL',
      'TC-E2E-041-import-partial / A1: no B-end question-bank file import → partial_failed + draft rows; qbank-ingest RAG ≠ UC-041',
    );
    pinGap(
      'GAP-UC042-DUAL-SIGN',
      'TC-E2E-042-dual-sign / A1–A2: no QuestionBankItem draft→enriched→pinned→adopted dual-sign CAS product path',
    );
    pinGap(
      'GAP-UC043-SEAT-CAS',
      'TC-E2E-043-seat-race / A1: no SeatLedger used<total CAS / exhaust / release; bend-recruiting seat specs = TARGET ≠ prove',
    );
    pinGap(
      'GAP-UC040-043-D4-STATUS',
      'D4: BatchJob/QuestionBankItem/SeatLedger not on status-machine load list; product wiring blocked until D4 in-scope + contracts',
    );
    pinGap(
      'GAP-UC040-043-E2E',
      'No e2e/*.e2e.ts / full.e2e / recruiting-bound scenario pins UC-E2E-040–043 TCs; RLS cross-tenant batch isolation unproven for BatchJob',
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
console.log('NOTE: releaseEvidence=false · Not HA · 本绿≠UC-E2E-040–043 covered · 本绿≠全链路 E2E covered');
console.log('NOTE: matrix=partial(单岗位绑定)+batch/import/seat-CAS gap(honest) · EXIT=0=mark-red ≠ closed');
console.log('NOTE: 旁证≠covered: full.e2e recruiting binding · recruiting-bound.spec · recruiter:prove · neg:bend · qbank-ingest');
console.log(`CMD=pnpm -C apps/api prove:uc040-043-batch-qbank-seat EXIT=${failed === 0 ? 0 : 1}`);
process.exit(failed === 0 ? 0 : 1);
