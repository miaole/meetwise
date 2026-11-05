#!/usr/bin/env node
/**
 * STALE_BUILD_GUARD 意图判 proof（无浏览器·纯决策/扫描函数 + runner 源级钉）。
 *
 * 覆盖（stale-build-guard-REQUEST.md 卷 §2 门 1）：
 *   - decideBuildReuse 决策矩阵全格：新鲜无压测源→重建 / 新鲜有压测源→复用 / 陈旧→重建 / 产物缺失→重建
 *     / 新鲜度判不可得两态 / mtime 读失败形态 / 反向意图（无压测意图携压测源→重建）/ mtime==head 边界。
 *   - scanServerStressMarkers 扫描语义：三载荷串在/缺/部分缺/目录缺/非 .js 不计/嵌套 chunk 拆分在。
 *   - runner 源级钉：run-e2e-ui.mjs 接线（import+决策调用+缺源告警行+E2E_UI_STRESS='1' build/start
 *     两阶段恒在+旧新鲜度告警行保持）；perf 套件步1 生产构建零触（无 E2E_UI_STRESS 词面）。
 *   - 检测串假阳守卫：STRESS_BUILD_MARKERS 不含 `__e2e_stream_` id 族（clean 构建客户端 chunk 仍保留
 *     id 族→id 串必假阳）·三载荷串在 events/route.ts 源内在场且门面 `__E2E_UI_STRESS__ === '1'` 在。
 *
 * EXIT=0 = 守卫决策/扫描语义与 runner 接线在位 ≠ 全量 e2e:ui 绿 ≠ stream-window 全绿（真机臂归
 * run-e2e-ui.mjs 真跑）≠ perf 套件全绿。releaseEvidence=false · Not HA。
 */
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { decideBuildReuse, scanServerStressMarkers, STRESS_BUILD_MARKERS } from './e2e-platform/stale-build-guard.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

let exitCode = 0;
const lines = [];
function fail(msg) { lines.push(`FAIL  ${msg}`); exitCode = 1; }
function pass(msg) { lines.push(`PASS  ${msg}`); }
function note(msg) { lines.push(`NOTE  ${msg}`); }
function assert(cond, msg) { if (cond) pass(msg); else fail(msg); }

const read = (rel) => readFileSync(join(root, rel), 'utf8');

// ---------- 决策矩阵 ----------
const HEAD = 1_700_000_000;
const FRESH_MS = (HEAD + 60) * 1000;
const STALE_MS = (HEAD - 60) * 1000;

{
  const r = decideBuildReuse({ buildIdExists: true, buildIdMtimeMs: FRESH_MS, headTimeSec: HEAD, stressExpected: true, stressSourcePresent: false });
  assert(r.reuse === false && r.reason === 'stress_source_missing', 'decide: 新鲜+期望压测+源缺 → 重建(stress_source_missing)');
}
{
  const r = decideBuildReuse({ buildIdExists: true, buildIdMtimeMs: FRESH_MS, headTimeSec: HEAD, stressExpected: true, stressSourcePresent: true });
  assert(r.reuse === true && r.reason === 'reuse', 'decide: 新鲜+期望压测+源在 → 复用');
}
{
  const r = decideBuildReuse({ buildIdExists: true, buildIdMtimeMs: STALE_MS, headTimeSec: HEAD, stressExpected: true, stressSourcePresent: true });
  assert(r.reuse === false && r.reason === 'stale_vs_head', 'decide: 陈旧(mtime<head) → 重建(stale_vs_head)');
}
{
  const r = decideBuildReuse({ buildIdExists: false, buildIdMtimeMs: FRESH_MS, headTimeSec: HEAD, stressExpected: true, stressSourcePresent: true });
  assert(r.reuse === false && r.reason === 'build_id_missing', 'decide: 产物缺失(BUILD_ID 无) → 重建(build_id_missing)');
}
{
  const r = decideBuildReuse({ buildIdExists: true, buildIdMtimeMs: FRESH_MS, headTimeSec: null, stressExpected: true, stressSourcePresent: true });
  assert(r.reuse === true, 'decide: HEAD time 不可得(git 不可用/非 git 树)+源在 → 复用(fail-open 语义保持)');
}
{
  const r = decideBuildReuse({ buildIdExists: true, buildIdMtimeMs: FRESH_MS, headTimeSec: null, stressExpected: true, stressSourcePresent: false });
  assert(r.reuse === false && r.reason === 'stress_source_missing', 'decide: HEAD time 不可得+源缺 → 重建(意图判不受 git 可用性影响)');
}
{
  const r = decideBuildReuse({ buildIdExists: true, buildIdMtimeMs: null, headTimeSec: HEAD, stressExpected: true, stressSourcePresent: false });
  assert(r.reuse === false && r.reason === 'stress_source_missing', 'decide: mtime 读失败+源缺 → 重建(意图判照检)');
}
{
  const r = decideBuildReuse({ buildIdExists: true, buildIdMtimeMs: null, headTimeSec: HEAD, stressExpected: true, stressSourcePresent: true });
  assert(r.reuse === true, 'decide: mtime 读失败+源在 → 复用(不单凭新鲜度强拆语义保持)');
}
{
  const r = decideBuildReuse({ buildIdExists: true, buildIdMtimeMs: HEAD * 1000, headTimeSec: HEAD, stressExpected: true, stressSourcePresent: true });
  assert(r.reuse === true, 'decide: mtime==head 边界(不等早于) → 复用');
}
{
  const r = decideBuildReuse({ buildIdExists: true, buildIdMtimeMs: FRESH_MS, headTimeSec: HEAD, stressExpected: false, stressSourcePresent: true });
  assert(r.reuse === false && r.reason === 'stress_source_unexpected', 'decide: 反向意图(无压测期望+携压测源) → 重建(stress_source_unexpected)');
}
{
  const r = decideBuildReuse({ buildIdExists: true, buildIdMtimeMs: FRESH_MS, headTimeSec: HEAD, stressExpected: false, stressSourcePresent: false });
  assert(r.reuse === true, 'decide: 无压测期望+源不在 → 复用');
}

// ---------- 扫描语义（临时 fixtures） ----------
const fixtureRoot = mkdtempSync(join(tmpdir(), 'sbg-proof-'));
try {
  // a. 三串各居一嵌套 chunk 文件（chunk 拆分形态）→ 在。
  const spread = join(fixtureRoot, 'spread', 'server');
  mkdirSync(join(spread, 'app', 'api', 'interview', '[id]', 'events'), { recursive: true });
  mkdirSync(join(spread, 'chunks'), { recursive: true });
  writeFileSync(join(spread, 'app', 'api', 'interview', '[id]', 'events', 'route.js'), 'x("压力回放题")y');
  writeFileSync(join(spread, 'chunks', 'a.js'), '"进度预演题"');
  writeFileSync(join(spread, 'chunks', 'b.js'), 'q("静默连接题")');
  {
    const s = scanServerStressMarkers(spread);
    assert(s.present === true && s.missing.length === 0 && s.scannedFiles === 3, 'scan: 三串分居嵌套 chunk 文件 → present(拆 chunk 不假阴)');
  }

  // b. 空目录 → 缺；目录不存在 → 缺。
  mkdirSync(join(fixtureRoot, 'empty'), { recursive: true });
  {
    const s = scanServerStressMarkers(join(fixtureRoot, 'empty'));
    assert(s.present === false && s.missing.length === STRESS_BUILD_MARKERS.length, 'scan: 空目录 → absent(全缺)');
  }
  {
    const s = scanServerStressMarkers(join(fixtureRoot, 'no-such-dir'));
    assert(s.present === false, 'scan: 目录缺 → absent(fail-safe 缺源方向)');
  }

  // c. 部分缺（只 1/3）→ absent 且 missing 恰列另二。
  const partial = join(fixtureRoot, 'partial', 'server');
  mkdirSync(partial, { recursive: true });
  writeFileSync(join(partial, 'route.js'), '"压力回放题"');
  {
    const s = scanServerStressMarkers(partial);
    const others = STRESS_BUILD_MARKERS.filter((m) => m !== '压力回放题');
    assert(s.present === false && s.missing.length === 2 && others.every((m) => s.missing.includes(m)), 'scan: 部分缺(1/3) → absent 且 missing 精确');
  }

  // d. 串只在非 .js → 不计（扩展名门）。
  const nonJs = join(fixtureRoot, 'nonjs', 'server');
  mkdirSync(nonJs, { recursive: true });
  for (const marker of STRESS_BUILD_MARKERS) writeFileSync(join(nonJs, 'notes.txt'), marker);
  {
    const s = scanServerStressMarkers(nonJs);
    assert(s.present === false, 'scan: 串仅在非 .js → absent(非编译产物不计防假阳)');
  }
} finally {
  rmSync(fixtureRoot, { recursive: true, force: true });
}

// ---------- 检测串选型钉（假阳守卫） ----------
{
  const bad = STRESS_BUILD_MARKERS.filter((m) => m.includes('__e2e_stream_'));
  assert(bad.length === 0, 'markers: 检测串不含 __e2e_stream_ id 族(clean 构建客户端 chunk 保留 id 族·id 串必假阳)');
}
{
  const routePath = 'apps/web/app/api/interview/[id]/events/route.ts';
  let route = '';
  try { route = read(routePath); } catch { fail(`missing file: ${routePath}`); }
  if (route) {
    assert(STRESS_BUILD_MARKERS.every((m) => route.includes(m)), 'markers: 三载荷串在 events/route.ts 源内在场');
    assert(route.includes("__E2E_UI_STRESS__ === '1'"), 'markers: 构建期内联门 `__E2E_UI_STRESS__ === \'1\'` 在 route.ts 在场');
    {
      const gateIdx = route.indexOf("__E2E_UI_STRESS__ === '1'");
      const fnIdx = route.indexOf('function e2eStressStream');
      const callIdx = route.indexOf('e2eStressStream(', gateIdx);
      assert(fnIdx !== -1 && route.indexOf('压力回放题') > fnIdx && callIdx !== -1, 'markers: 压测载荷串在 e2eStressStream 函数体·其唯一调用点在 GET 门分支内（门假→随分支死码剔除·产物两形实测见卷）');
    }
  }
}

// ---------- runner 源级钉（接线在位） ----------
{
  let runner = '';
  try { runner = read('scripts/run-e2e-ui.mjs'); } catch { fail('missing file: scripts/run-e2e-ui.mjs'); }
  if (runner) {
    assert(runner.includes("from './e2e-platform/stale-build-guard.mjs'"), 'runner: import 守卫模块在');
    assert(runner.includes('scanServerStressMarkers(') && runner.includes('decideBuildReuse('), 'runner: 扫描+决策两调用在');
    assert(runner.includes('stressExpected: true'), 'runner: 意图恒含压测源钉在（build/start 两阶段恒 E2E_UI_STRESS=\'1\'）');
    assert(runner.includes('既有构建缺压测源'), 'runner: 缺源强制重建告警行在');
    assert(runner.includes('防陈旧构建假红'), 'runner: 旧新鲜度告警行保持（陈旧防线零弱化）');
    const stressOnes = runner.match(/E2E_UI_STRESS: '1'/g) ?? [];
    assert(stressOnes.length >= 2, `runner: build/start 两阶段 E2E_UI_STRESS: '1' 恒在(实测 ${stressOnes.length} 处≥2)`);
    assert(runner.includes("[NEXT_BIN, 'build']"), 'runner: 强制重建臂仍内嵌 next build');
  }
}
{
  let suite = '';
  try { suite = read('scripts/run-e2e-performance-suite.mjs'); } catch { fail('missing file: scripts/run-e2e-performance-suite.mjs'); }
  if (suite) {
    assert(!suite.includes('E2E_UI_STRESS'), 'suite: perf 套件步1 生产构建零触(无 E2E_UI_STRESS 词面·步1 仍真实生产形不被测试开关污染)');
  }
}

// ---------- 真树只读观测（不判门·本机构建态各异） ----------
{
  const realServer = join(root, 'apps/web', '.next', 'server');
  if (existsSync(realServer)) {
    const s = scanServerStressMarkers(realServer);
    note(`real-tree observation: apps/web/.next/server scanned=${s.scannedFiles} stressSourcePresent=${s.present} (diagnostic only, no gate)`);
  } else {
    note('real-tree observation: apps/web/.next/server absent (no build in tree)');
  }
}

// ---------- node --check 两改动脚本 ----------
for (const rel of ['scripts/run-e2e-ui.mjs', 'scripts/e2e-platform/stale-build-guard.mjs', 'scripts/e2e-ui-stale-build-guard.proof.mjs']) {
  const r = spawnSync(process.execPath, ['--check', join(root, rel)], { encoding: 'utf8' });
  assert(r.status === 0, `node --check ${rel}`);
}

console.log(lines.join('\n'));
console.log(exitCode === 0 ? 'STALE-BUILD-GUARD-PROOF PASS (browser-less, decision/scan/runner-pin)' : 'STALE-BUILD-GUARD-PROOF FAIL');
process.exit(exitCode);
