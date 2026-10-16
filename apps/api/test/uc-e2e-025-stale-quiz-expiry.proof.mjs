#!/usr/bin/env node
/**
 * UC-E2E-025 — 押题产物过期作面试输入（NON-UI static inventory · mark-red → wired 过渡）
 *
 * releaseEvidence=false · Not HA · 本绿 ≠ UC-E2E-025 covered · 本绿 ≠ 全链路 E2E covered
 *
 * REG-FIX 组4f supersession 注记（2026-10-10·按本文件自带 PRODUCT_SURFACE 设计翻转 wired 分支）：
 * 起草时点产品未接线（begin 无 quizId / begin 不查 resume_quiz）→ S1-S4 库存 + G-GAP-* 诚实 mark-red。
 * 今产品已接线：controller begin 收可选 quiz-id 头并真透传（ROLE#259 targetRole / H4 focus 相随）·
 * service begin 委托收可选 sourceQuizId · beginInterviewCore 单查 owner-scoped resume_quiz 且 NEG
 * stale_quiz 先行真抛——surface 在场 → 本 prove 按自带设计 refuse gap：GAP mark-red 分支退役，
 * wired 分支断言 realReject（stale 拒绝已接线·活证面指 uc025:nhp-neg / nhp-fault / nhp-bound / nhp-adv）。
 * 诚实面不变：本绿 = 接线静态证据 ≠ UC-E2E-025 covered ≠ reject/accept 全闭环 HTTP 实跑（归活证键）。
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

const PRODUCT_SURFACE_RE =
  /quizId|source_quiz|sourceQuiz|quiz_artifact|resume_quiz|quizFresh|quiz_fresh|expires_at.*quiz|quiz.*expires/i;

// B271 片2 后 begin 事务体=beginInterviewCore 模块体(REG-FIX 组4f 锚随演):4500 定窗废除 → 端锚切片。
function beginCoreRegion(svc) {
  const i = svc.indexOf('export async function beginInterviewCore(');
  assert.ok(i >= 0, 'beginInterviewCore present');
  const j = svc.indexOf('export class InterviewService', i);
  assert.ok(j > i, 'InterviewService end anchor present');
  return svc.slice(i, j);
}

const checks = {
  // S1 语义翻转(mark-red → wired·REG-FIX 组4f):断言 begin-quiz-input 已接线——controller 收可选 quiz-id
  // 头并转发·service begin 委托/beginInterviewCore 核心同参在位(断言名随改 begin-quiz-input-wired)。
  'S1-begin-quiz-input-wired': () => {
    const ctrl = read('apps/api/src/modules/interview/interview.controller.ts');
    const svc = read('apps/api/src/modules/interview/interview.service.ts');
    // Controller: begin 收可选 quiz-id 头(GAP-UC025-NEG-01 真接线)并转发进 service begin
    const anchorAt = ctrl.indexOf('begin(@Param');
    assert.ok(anchorAt >= 0, 'controller begin(@Param) present');
    const beginCb = ctrl.slice(anchorAt, ctrl.indexOf('\n  }', anchorAt));
    assert.ok(beginCb.length > 0, 'controller begin body parseable');
    assert.match(beginCb, /@Headers\('quiz-id'\)\s*quizId\?/, 'controller begin must take optional quiz-id header');
    assert.match(beginCb, /\.begin\([^)]*\bquizId\b[^)]*\)/, 'controller begin must forward quizId into service begin');
    // Service: begin 委托收可选 sourceQuizId·beginInterviewCore 核心同参在位
    assert.match(
      svc,
      /begin\(\s*principal:\s*string,\s*id:\s*string,\s*resumeId:\s*string,\s*requestId\?:\s*string,\s*sourceQuizId\?:\s*string/,
      'service begin(principal, id, resumeId, requestId?, sourceQuizId?, ...) accepts optional sourceQuizId',
    );
    assert.match(
      svc,
      /export async function beginInterviewCore\([\s\S]{0,200}sourceQuizId\?:\s*string/,
      'beginInterviewCore accepts optional sourceQuizId',
    );
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

  // S3 锚改 beginInterviewCore 后语义翻转(REG-FIX 组4f):begin 核心现真抛 stale_quiz(NEG 先行·C-1 窄保留
  // NULL≠stale)——match 替代 doesNotMatch;contracts 侧库存断言零漂(仍不得引入本面错误码)。
  'S3-stale-reject-wired-in-begin-core': () => {
    const svc = read('apps/api/src/modules/interview/interview.service.ts');
    const contracts = read('packages/contracts/src/index.ts');
    const beginCore = beginCoreRegion(svc);
    assert.match(beginCore, /throw new HttpException\(\{ error: 'stale_quiz' \}, HttpStatus\.CONFLICT\)/, 'begin core must throw stale_quiz on stale/not-ready quiz artifact');
    const staleAt = beginCore.indexOf("error: 'stale_quiz'");
    const quizQueryAt = beginCore.indexOf('FROM resume_quiz');
    assert.ok(quizQueryAt >= 0 && quizQueryAt < staleAt, 'single owner-scoped quiz read precedes stale throw (NEG first)');
    // contracts may have unrelated "expired" enums (memory etc.) — only pin quiz-as-interview tokens
    assert.doesNotMatch(contracts, /\bstale_quiz\b|\bquiz_expired\b|\bresume_version_mismatch\b|\bquiz_artifact_expired\b/, 'contracts: no UC-025 interview-input stale error codes');
  },

  // S4 锚改 beginInterviewCore 后语义翻转(REG-FIX 组4f):begin 核心现单查 owner-scoped resume_quiz
  // (GODFN-1c 合并形·恰一条 3→1)——match 替代 doesNotMatch。
  'S4-begin-queries-resume-quiz-owner-scoped': () => {
    const svc = read('apps/api/src/modules/interview/interview.service.ts');
    const beginCore = beginCoreRegion(svc);
    assert.match(beginCore, /\bresume_quiz\b/, 'begin core reads resume_quiz (wired)');
    assert.equal((beginCore.match(/FROM\s+resume_quiz/g) || []).length, 1, 'exactly one merged resume_quiz statement (3→1)');
    assert.match(beginCore, /WHERE q\.id=\$1 AND q\.owner_user_id=\$2/, 'quiz read is owner-scoped');
  },

  // G 按本文件自带 PRODUCT_SURFACE 设计翻转 wired 分支(REG-FIX 组4f):surface 在场 → refuse gap →
  // 断言 realReject(stale 拒绝已接线)·四条 GAP 虚称行退役(mark-red → wired 过渡)。
  'G-wired-realReject-gap-retired': () => {
    const ctrl = read('apps/api/src/modules/interview/interview.controller.ts');
    const svc = read('apps/api/src/modules/interview/interview.service.ts');
    const beginCore = beginCoreRegion(svc);
    const anchorAt = ctrl.indexOf('begin(@Param');
    const beginCb = anchorAt >= 0 ? ctrl.slice(anchorAt, ctrl.indexOf('\n  }', anchorAt)) : '';
    const surface =
      /quiz-id|quizId/.test(beginCb) ||
      PRODUCT_SURFACE_RE.test(beginCore) && /\bresume_quiz\b/.test(beginCore);

    // 设计原文(:101-105 旧行引)：「surface 出现→refuse gap EXIT=0; wire ... prove instead of mark-red」。
    assert.ok(surface, 'PRODUCT_SURFACE absent — wired branch requires quiz input + resume_quiz freshness guard (GAP branch would apply)');

    // realReject: stale 拒绝已接线(begin 核心真抛 stale_quiz·活证指 uc025:nhp-neg:prove)。
    assert.match(beginCore, /throw new HttpException\(\{ error: 'stale_quiz' \}, HttpStatus\.CONFLICT\)/, 'realReject: stale-quiz HttpException wired in begin core');
  },
};

let failed = 0;
console.log('UC-E2E-025 stale-quiz-as-interview-input prove (static inventory; NON-UI · mark-red→wired 过渡)');
console.log('releaseEvidence=false · Not HA · ≠ covered\n');

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
  // wired 分支(REG-FIX 组4f):GAP 退役后零 GAP pin 是 wired 模式的诚实输出——honesty 由 S1/S3/S4/G 的
  // wired 断言承(reject/accept 全闭环活证指 uc025:nhp-neg / nhp-fault / nhp-bound / nhp-adv 四键)。
  console.log('NOTE  wired: PRODUCT_SURFACE 在场 → 四条 GAP 虚称行退役(mark-red→wired 过渡·本文件自带设计)');
  console.log('NOTE  本绿 = begin-quiz-input 接线 + stale reject in-core 静态证据 · ≠ UC-E2E-025 covered · ≠ reject/accept 全闭环 HTTP 实跑');
  console.log('NOTE  活证面: uc025:nhp-neg:prove(NEG) · uc025:nhp-fault:prove(FAULT) · uc025:nhp-bound:prove(BOUND) · uc025:nhp-adv:prove(ADV)');
} else {
  console.log(`NOTE  honesty GAP pins=${gaps.length}: ${gaps.map((g) => g.id).join(', ')}`);
  console.log('NOTE  EXIT=0 with GAP pins = honest mark-red ≠ product closed ≠ UC-E2E-025 covered');
}

const exitCode = failed === 0 ? 0 : 1;
console.log(`\nCMD=pnpm uc025:stale-quiz-expiry:prove EXIT=${exitCode}`);
console.log('本绿≠全链路 E2E covered；≠ UC-E2E-025 covered；wired 过渡(mark-red 退役)·活证归 uc025:nhp-* 四键');
process.exit(exitCode);
