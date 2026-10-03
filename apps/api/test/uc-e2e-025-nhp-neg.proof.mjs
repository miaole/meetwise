#!/usr/bin/env node
/**
 * UC-E2E-025 · first NHP column only · NEG · NHP-025-NEG-01
 * Stale / expired quiz used as interview input must be rejected.
 *
 * Pins: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false
 * gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false
 * PG-retained · public DELETE stays 503
 *
 * Not FAULT. Not BOUND. Not ADV. Not UC-E2E-018. Not UC-E2E-052.
 * Does not edit the coverage matrix or any SSOT. No nail.
 *
 * The older `pnpm uc025:stale-quiz-expiry:prove` is the mark-red honesty pin
 * whose harness (`uc-e2e-025-stale-quiz-expiry.md`) already says EXIT 0.
 * That EXIT 0 is not this case and is not covered.
 *
 * This prove exits 0 only when interview begin actually refuses a stale quiz.
 * If that path is unwired, it prints an explicit gap marker and exits non-zero.
 * Do not invent a pass. The row stays gap either way (matrix not flipped).
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

const STALE_THROW_RE =
  /throw\s+new\s+HttpException\s*\(\s*\{[^}]{0,240}?error:\s*['"](stale_quiz|quiz_expired|quiz_stale|quiz_artifact_expired|expired_quiz_input)['"]/s;

function beginSignature(src, label) {
  const m = src.match(/begin\s*\([^)]*\)/);
  assert.ok(m, `${label} begin signature parseable`);
  return m[0];
}

function beginRegion(svc) {
  const i = svc.indexOf('begin(principal');
  assert.ok(i >= 0, 'interview.service begin(principal) present');
  return svc.slice(i, i + 4500);
}

const ctrl = read('apps/api/src/modules/interview/interview.controller.ts');
const svc = read('apps/api/src/modules/interview/interview.service.ts');
const mig = read('packages/db/migrations/0007_resume_quiz.sql');
const contracts = read('packages/contracts/src/index.ts');

const ctrlBegin = beginSignature(ctrl, 'controller');
const svcBegin = beginSignature(svc, 'service');
const region = beginRegion(svc);
const acceptsQuiz = /quiz-id|quizId|sourceQuiz|source_quiz/.test(ctrlBegin + svcBegin);
const realReject = STALE_THROW_RE.test(region);

const tableBlock = mig.match(/CREATE TABLE IF NOT EXISTS resume_quiz\s*\(([\s\S]*?)\);/);
assert.ok(tableBlock, 'resume_quiz CREATE TABLE block parseable');
const quizHasExpiry = /\bexpires_at\b|\bfresh_until\b|\bstale_after\b/i.test(tableBlock[1]);

console.log('UC-E2E-025 NHP-025-NEG-01 stale quiz as interview input (NEG column only)');
console.log('releaseEvidence=false · haStatus=NOT_HA · claimProductionHA=false · coveredCount=8 · PG-retained · DELETE=503');
console.log('Not FAULT · Not BOUND · Not ADV · no nail · matrix not edited');
console.log(`inventory acceptsQuiz=${acceptsQuiz} realStaleReject=${realReject} resume_quiz_expiry_column=${quizHasExpiry}`);
console.log(`contracts_stale_token=${/\bstale_quiz\b|\bquiz_expired\b|\bquiz_artifact_expired\b/.test(contracts)}`);

if (acceptsQuiz && realReject) {
  console.log('PASS  NHP-025-NEG-01  interview begin throws a stale-quiz HttpException');
  console.log('ROW_STILL_GAP  UC-E2E-025 §1.0.1 NEG was not flipped. The row is still gap.');
  console.log('NOTE  case pass ≠ covered ≠ nail ≠ FAULT/BOUND/ADV');
  console.log('\nCMD=pnpm uc025:nhp-neg:prove EXIT=0');
  process.exit(0);
}

console.log('GAP  GAP-UC025-NEG-01  NHP-025-NEG-01 product reject unwired: interview begin does not take a quiz artifact and does not throw a stale-quiz error');
console.log('ROW_STILL_GAP  UC-E2E-025 §1.0.1 NEG remains gap. The row is still gap.');
console.log('NOTE  pnpm uc025:stale-quiz-expiry:prove EXIT 0 is the older mark-red pin and is not this case passing');
console.log('NOTE  do not read this non-zero as a product refusal. Refusal is not implemented.');
console.log('\nCMD=pnpm uc025:nhp-neg:prove EXIT=1');
process.exit(1);
