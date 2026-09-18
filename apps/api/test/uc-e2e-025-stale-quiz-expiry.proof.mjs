#!/usr/bin/env node
/**
 * UC-E2E-025 — 押题产物过期作面试输入（NON-UI static inventory + GAP mark-red）
 *
 * releaseEvidence=false · Not HA · 本绿 ≠ UC-E2E-025 covered · 本绿 ≠ 全链路 E2E covered
 * 矩阵保持 **gap**（honest）；EXIT=0 = 诚实钉缺口 ≠ A1/A2 reject/accept 闭环
 *
 * 搜码结论（本树）：interview.begin 仅 resume-id；resume_quiz 无 expires_at；
 * 无 stale_quiz / quiz_expired / resume_version_mismatch 面试输入错误码。
 *
 * 若产品浮出（begin 接 quizId / 查 resume_quiz 新鲜度）→ 拒 EXIT=0，须另刀 reject/accept prove。
 */
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const apiRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = resolve(apiRoot, '../..');

function read(rel) {
  const p = resolve(repoRoot, rel);
  assert.equal(existsSync(p), true, `missing file: ${rel}`);
  return readFileSync(p, 'utf8');
}

const gaps = [];
function pinGap(id, detail) {
  gaps.push({ id, detail });
  console.log(`GAP  ${id}  ${detail}`);
}

const STALE_ERR_RE =
  /\b(stale_quiz|quiz_expired|quiz_stale|resume_version_mismatch|quiz_artifact_expired|expired_quiz_input)\b/i;
const PRODUCT_SURFACE_RE =
  /quizId|source_quiz|sourceQuiz|quiz_artifact|resume_quiz|quizFresh|quiz_fresh|expires_at.*quiz|quiz.*expires/i;

const checks = {
  'S1-begin-no-quiz-input': () => {
    const ctrl = read('apps/api/src/modules/interview/interview.controller.ts');
    const svc = read('apps/api/src/modules/interview/interview.service.ts');
    // Controller: begin(id, req, resumeId) — resume-id header only
    assert.match(
      ctrl,
      /begin\s*\(\s*@Param\('id'\)\s*id:\s*string,\s*@Req\(\)\s*req:\s*any,\s*@Headers\('resume-id'\)\s*resumeId:\s*string\s*\)/,
      'interview.controller begin must take resume-id header only (no quiz header in signature)',
    );
    assert.doesNotMatch(ctrl, /@Headers\(['"]quiz-id['"]\)|quizId:\s*string/, 'controller begin must not take quiz-id');
    // Service: begin(principal, id, resumeId, requestId?)
    assert.match(
      svc,
      /begin\s*\(\s*principal:\s*string,\s*id:\s*string,\s*resumeId:\s*string/,
      'interview.service begin(principal, id, resumeId) signature',
    );
    const beginSig = svc.match(/begin\s*\(\s*principal:\s*string,\s*id:\s*string,\s*resumeId:\s*string[^)]*\)/);
    assert.ok(beginSig, 'begin signature parseable');
    assert.doesNotMatch(beginSig[0], /quizId|quiz_id|sourceQuiz/, 'service begin signature must not accept quizId');
  },

  'S2-schema-no-expiry-column': () => {
    const mig = read('packages/db/migrations/0007_resume_quiz.sql');
    assert.match(mig, /CREATE TABLE IF NOT EXISTS resume_quiz/, 'resume_quiz table present');
    const tableBlock = mig.match(/CREATE TABLE IF NOT EXISTS resume_quiz\s*\(([\s\S]*?)\);/);
    assert.ok(tableBlock, 'resume_quiz CREATE TABLE block parseable');
    assert.doesNotMatch(tableBlock[1], /\bexpires_at\b|\bfresh_until\b|\bstale_after\b/i, 'resume_quiz must not declare expiry/freshness column (inventory)');
    // later migrations may add columns — scan derivative guard too for expires_at on resume_quiz
    const guard = read('packages/db/migrations/0061_resume_derivative_reference_guard.sql');
    const quizExpires = [...guard.matchAll(/resume_quiz[\s\S]{0,200}expires_at|expires_at[\s\S]{0,200}resume_quiz/gi)];
    assert.equal(quizExpires.length, 0, '0061 must not add resume_quiz.expires_at');
  },

  'S3-no-stale-interview-error-codes': () => {
    const svc = read('apps/api/src/modules/interview/interview.service.ts');
    const contracts = read('packages/contracts/src/index.ts');
    // narrow: interview begin / create surface — whole service + contracts inventory
    const beginRegion = (() => {
      const i = svc.indexOf('begin(principal');
      assert.ok(i >= 0, 'begin(principal) present');
      return svc.slice(i, i + 4500);
    })();
    assert.doesNotMatch(beginRegion, STALE_ERR_RE, 'begin region must not emit stale_quiz / quiz_expired / resume_version_mismatch');
    // contracts may have unrelated "expired" enums (memory etc.) — only pin quiz-as-interview tokens
    assert.doesNotMatch(contracts, /\bstale_quiz\b|\bquiz_expired\b|\bresume_version_mismatch\b|\bquiz_artifact_expired\b/, 'contracts: no UC-025 interview-input stale error codes');
  },

  'S4-begin-no-resume-quiz-join': () => {
    const svc = read('apps/api/src/modules/interview/interview.service.ts');
    const beginRegion = (() => {
      const i = svc.indexOf('begin(principal');
      return svc.slice(i, i + 4500);
    })();
    assert.doesNotMatch(beginRegion, /\bresume_quiz\b/, 'begin path must not query/join resume_quiz');
    assert.doesNotMatch(beginRegion, /\bFROM\s+quiz\b|\bJOIN\s+quiz\b/i, 'begin path must not join quiz alias');
  },

  'G-GAP-product-surface-or-pins': () => {
    const ctrl = read('apps/api/src/modules/interview/interview.controller.ts');
    const svc = read('apps/api/src/modules/interview/interview.service.ts');
    const beginRegion = (() => {
      const i = svc.indexOf('begin(principal');
      return svc.slice(i, i + 4500);
    })();
    const surface =
      /quiz-id|quizId/.test(ctrl.match(/begin\s*\([^)]*\)/)?.[0] ?? '') ||
      PRODUCT_SURFACE_RE.test(beginRegion) && /\bresume_quiz\b/.test(beginRegion);

    if (surface) {
      throw new Error(
        'PRODUCT_SURFACE: interview begin appears to bind quiz/freshness — refuse gap EXIT=0; wire reject/accept HTTP prove instead of mark-red',
      );
    }

    pinGap(
      'GAP-UC025-STALE-REJECT',
      'TC-E2E-025-stale-quiz: no reject path when opening interview with expired/stale quiz artifact (begin has no quiz input / no freshness guard)',
    );
    pinGap(
      'GAP-UC025-VERSION-PIN',
      'TC-E2E-025-version-mismatch: no resumeVersion / quiz artifact version pin at interview start',
    );
    pinGap(
      'GAP-UC025-REGEN-ENTRY',
      'escape/regen: no re-quiz entry wired from stale-input reject (product surface absent)',
    );
    pinGap(
      'GAP-UC025-ACCEPT-FRESH',
      'accept honesty: no provable accept path (fresh quiz + version pin → allow begin); cannot nail reject/accept asymmetry until product lands',
    );

    assert.ok(gaps.length >= 4, 'expected ≥4 GAP pins while product surface absent');
  },
};

let failed = 0;
console.log('UC-E2E-025 stale-quiz-as-interview-input prove (static inventory; NON-UI)');
console.log('releaseEvidence=false · Not HA · ≠ covered · matrix stays gap (honest)\n');

for (const [name, fn] of Object.entries(checks)) {
  try {
    fn();
    console.log(`PASS  ${name}`);
  } catch (err) {
    failed += 1;
    console.error(`FAIL  ${name}: ${err instanceof Error ? err.message : err}`);
  }
}

console.log('');
if (gaps.length === 0) {
  console.log('NOTE  no GAP pins emitted — unexpected; do not auto-promote covered / partial-closed');
  if (failed === 0) {
    failed += 1;
    console.error('FAIL  honesty: EXIT must not be 0 without GAP pins or reject/accept prove');
  }
} else {
  console.log(`NOTE  honesty GAP pins=${gaps.length}: ${gaps.map((g) => g.id).join(', ')}`);
  console.log('NOTE  EXIT=0 with GAP pins = honest mark-red ≠ product closed ≠ UC-E2E-025 covered');
}

const exitCode = failed === 0 ? 0 : 1;
console.log(`\nCMD=pnpm uc025:stale-quiz-expiry:prove EXIT=${exitCode}`);
console.log('本绿≠全链路 E2E covered；≠ UC-E2E-025 covered；矩阵保持 gap（honest）');
process.exit(exitCode);
