#!/usr/bin/env node
/**
 * STALE_BUILD_GUARD proof（无浏览器·无 DB·秒级）。
 *
 * 覆盖（stale-build-guard-REQUEST.md 卷 §2 门 1 与 §9 修订注记）：
 *   - decideBuildReuse 完整决策表：BUILD_ID 在/缺 × mtime 五态 × HEAD 时间两态 × 压测意图两态 × 压测源两态
 *     = 80 格。期望值按状态标签查表，不含数值比较，时间比较写反会逐格对不上；另加非法入参格。
 *   - scanServerStressMarkers 扫描语义：三串分居嵌套 chunk / 空目录 / 目录缺 / 部分缺 / 串只在非 .js（配同内容
 *     .js 正对照，防空转）/ .js.map 不计 / 不可读文件不计。
 *   - evaluateExistingBuild 在假 .next 目录上的行为：BUILD_ID 与 mtime 走真实文件，含串只落在 cache/static/
 *     standalone 等扫描面之外、clean 构建保留 id 串的假阳形态。
 *   - runner 行为：把 run-e2e-ui.mjs 两界标之间的真实源码截出来，跑在假 .next 与替身 build 命令上，断言
 *     按判定结果构建或不构建、构建与启动都带 E2E_UI_STRESS='1'、构建失败走 web_not_ready。
 *   - 防回退钉：runner 无本地判定词面、界标外无构建/启动调用；压测载荷串与三函数的调用点都在构建期门内；
 *     检测依赖的 next 配置未被关闭；perf 套件未把压测开关写进构建。
 *
 * EXIT=0 = 判定、扫描与 runner 判定段的行为符合上表 ≠ 全量 e2e:ui 绿 ≠ stream-window 全绿（真机臂归
 * run-e2e-ui.mjs 真跑）≠ perf 套件全绿。替身 build 不验证 next 真实产物，两形构建实测在卷。界标之外的
 * runner 代码不被执行，只受防回退钉约束。releaseEvidence=false · Not HA。
 */
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, utimesSync, writeFileSync } from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { decideBuildReuse, evaluateExistingBuild, scanServerStressMarkers, STRESS_BUILD_MARKERS } from './e2e-platform/stale-build-guard.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

let exitCode = 0;
const lines = [];
function fail(msg) { lines.push(`FAIL  ${msg}`); exitCode = 1; }
function pass(msg) { lines.push(`PASS  ${msg}`); }
function note(msg) { lines.push(`NOTE  ${msg}`); }
function assert(cond, msg) { if (cond) pass(msg); else fail(msg); }
// 崩溃也要交出已跑结果：否则一处异常会吞掉全部断言读数，失败看不出是哪条。
process.on('uncaughtException', (e) => {
  fail(`proof crashed: ${e?.stack ?? e}`);
  console.log(lines.join('\n'));
  console.log('STALE-BUILD-GUARD-PROOF FAIL (crashed)');
  process.exit(1);
});

const read = (rel) => readFileSync(join(root, rel), 'utf8');
const sameList = (a, b) => JSON.stringify(a) === JSON.stringify(b);

const HEAD = 1_700_000_000;
const FRESH_MS = (HEAD + 60) * 1000;
const STALE_MS = (HEAD - 60) * 1000;
const NO_BUILD_LOG = 'E2E-UI: 无 .next/BUILD_ID，先 next build 再 next start…';
const FORCED_BUILD_LOG = 'E2E-UI: STALE_BUILD_GUARD 判定重建(陈旧/缺压测源) → 强制 next build…';
const HEAD_UNKNOWN = 'HEAD commit time 不可得';
const MTIME_UNKNOWN = 'BUILD_ID mtime 读取失败';
const REASON_WARNING = {
  stale_vs_head: '防陈旧构建假红',
  stress_source_missing: '既有构建缺压测源',
  stress_source_unexpected: '压测源不进非压测服务面',
};
const SCAN_PRESENT = Object.freeze({ present: true, missing: [], scannedFiles: 1 });
const SCAN_ABSENT = Object.freeze({ present: false, missing: [...STRESS_BUILD_MARKERS], scannedFiles: 1 });

// ---------- 完整决策表 ----------
const MTIME_STATES = { fresh: FRESH_MS, equal: HEAD * 1000, justBefore: HEAD * 1000 - 1, stale: STALE_MS, unreadable: null };
const expectedReason = ({ exists, mtime, headKnown, intent, present }) => {
  if (!exists) return 'build_id_missing';
  if (headKnown && (mtime === 'stale' || mtime === 'justBefore')) return 'stale_vs_head';
  if (intent && !present) return 'stress_source_missing';
  if (!intent && present) return 'stress_source_unexpected';
  return 'reuse';
};
const expectedWarnings = ({ exists, mtime, headKnown }, reason) => {
  if (!exists) return [];
  const leading = !headKnown ? [HEAD_UNKNOWN] : mtime === 'unreadable' ? [MTIME_UNKNOWN] : [];
  return REASON_WARNING[reason] ? [...leading, REASON_WARNING[reason]] : leading;
};
{
  const bad = [];
  let cells = 0;
  for (const exists of [true, false]) for (const mtime of Object.keys(MTIME_STATES)) for (const headKnown of [true, false]) {
    for (const intent of [true, false]) for (const present of [true, false]) {
      cells += 1;
      const cell = { exists, mtime, headKnown, intent, present };
      const input = {
        buildIdExists: exists,
        buildIdMtimeMs: MTIME_STATES[mtime],
        headTimeSec: headKnown ? HEAD : null,
        stressExpected: intent,
        stressScan: present ? SCAN_PRESENT : SCAN_ABSENT,
      };
      const r = decideBuildReuse(input);
      const reason = expectedReason(cell);
      const wanted = expectedWarnings(cell, reason);
      const buildLog = reason === 'reuse' ? null : reason === 'build_id_missing' ? NO_BUILD_LOG : FORCED_BUILD_LOG;
      const ok = r.reason === reason && r.rebuild === (reason !== 'reuse') && r.buildLog === buildLog
        && r.warnings.length === wanted.length && wanted.every((w, i) => r.warnings[i]?.includes(w))
        && JSON.stringify(decideBuildReuse(input)) === JSON.stringify(r);
      if (!ok) bad.push(`${JSON.stringify(cell)} want=${reason} got=${r.reason}/${r.rebuild}`);
    }
  }
  assert(cells === 80 && bad.length === 0, `decide: 完整决策表 ${cells} 格(优先级/告警行/构建日志/同入同出) 错 ${bad.length} 格${bad.length ? `: ${bad.slice(0, 4).join(' | ')}` : ''}`);
}
{
  const fresh = { buildIdExists: true, buildIdMtimeMs: FRESH_MS, headTimeSec: HEAD, stressExpected: true };
  for (const [label, stressScan] of [['null', null], ['undefined', undefined], ['present=字串', { present: 'true' }], ['present=1', { present: 1 }]]) {
    const r = decideBuildReuse({ ...fresh, stressScan });
    assert(r.rebuild === true && r.reason === 'stress_source_missing', `decide: 扫描结果 ${label} → 按缺源计(只认 present===true)`);
  }
  for (const [label, headTimeSec] of [['0', 0], ['NaN', Number.NaN], ['字串', String(HEAD)], ['负数', -1]]) {
    const r = decideBuildReuse({ ...fresh, buildIdMtimeMs: STALE_MS, headTimeSec, stressScan: SCAN_PRESENT });
    assert(r.rebuild === false && r.warnings.length === 1 && r.warnings[0].includes(HEAD_UNKNOWN), `decide: HEAD 时间=${label} → 按不可得 fail-open 并告警`);
  }
  for (const [label, buildIdMtimeMs] of [['NaN', Number.NaN], ['字串', String(STALE_MS)]]) {
    const r = decideBuildReuse({ ...fresh, buildIdMtimeMs, stressScan: SCAN_PRESENT });
    assert(r.rebuild === false && r.warnings.length === 1 && r.warnings[0].includes(MTIME_UNKNOWN), `decide: mtime=${label} → 按读失败 fail-open 并告警`);
  }
  const stale = decideBuildReuse({ ...fresh, buildIdMtimeMs: STALE_MS, stressScan: SCAN_PRESENT });
  assert(stale.warnings[0]?.includes(new Date(STALE_MS).toISOString()) && stale.warnings[0]?.includes(new Date(HEAD * 1000).toISOString()), 'decide: 陈旧告警行带 BUILD_ID 与 HEAD 两个时间');
  const noList = decideBuildReuse({ ...fresh, stressScan: { present: false, missing: [] } });
  assert(noList.warnings.length === 1 && !noList.warnings[0].includes('·缺 '), 'decide: 缺串清单为空时告警行不留空清单');
}

const fixtureRoot = mkdtempSync(join(tmpdir(), 'sbg-proof-'));
const STRESS_BODY = STRESS_BUILD_MARKERS.map((m) => JSON.stringify(m)).join(';');
const writeAt = (base, rel, body) => {
  const full = join(base, rel);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, body);
};
// 假 web 目录：files 的键相对 .next；buildIdMs=undefined 时不写 BUILD_ID。
const fakeWeb = (webDir, { buildIdMs, files = {} }) => {
  mkdirSync(webDir, { recursive: true });
  for (const [rel, body] of Object.entries(files)) writeAt(join(webDir, '.next'), rel, body);
  if (buildIdMs === undefined) return webDir;
  writeAt(webDir, '.next/BUILD_ID', 'fake-build');
  utimesSync(join(webDir, '.next', 'BUILD_ID'), new Date(buildIdMs), new Date(buildIdMs));
  return webDir;
};
const STRESS_FILES = { 'server/app/api/interview/[id]/events/route.js': STRESS_BODY };

try {
  // ---------- 扫描语义 ----------
  {
    const dir = join(fixtureRoot, 'scan-spread');
    writeAt(dir, 'app/api/interview/[id]/events/route.js', 'x("压力回放题")y');
    writeAt(dir, 'chunks/a.js', '"进度预演题"');
    writeAt(dir, 'chunks/b.js', 'q("静默连接题")');
    const s = scanServerStressMarkers(dir);
    assert(s.present === true && s.missing.length === 0 && s.scannedFiles === 3, 'scan: 三串分居嵌套 chunk 文件 → present(拆 chunk 不假阴)');
  }
  {
    mkdirSync(join(fixtureRoot, 'scan-empty'), { recursive: true });
    const s = scanServerStressMarkers(join(fixtureRoot, 'scan-empty'));
    assert(s.present === false && sameList(s.missing, [...STRESS_BUILD_MARKERS]) && s.scannedFiles === 0, 'scan: 空目录 → absent(全缺)');
    const gone = scanServerStressMarkers(join(fixtureRoot, 'scan-no-such-dir'));
    assert(gone.present === false && sameList(gone.missing, [...STRESS_BUILD_MARKERS]), 'scan: 目录缺 → absent(fail-safe 缺源方向)');
  }
  {
    const dir = join(fixtureRoot, 'scan-partial');
    writeAt(dir, 'route.js', '"压力回放题"');
    const s = scanServerStressMarkers(dir);
    assert(s.present === false && sameList(s.missing, ['进度预演题', '静默连接题']), 'scan: 部分缺(1/3) → absent 且 missing 精确');
  }
  {
    const dir = join(fixtureRoot, 'scan-nonjs');
    STRESS_BUILD_MARKERS.forEach((marker, i) => writeAt(dir, `notes-${i}.txt`, marker));
    writeAt(dir, 'manifest.json', STRESS_BODY);
    const s = scanServerStressMarkers(dir);
    assert(s.present === false && s.missing.length === STRESS_BUILD_MARKERS.length && s.scannedFiles === 0, 'scan: 三串全部只在非 .js → absent 且一个文件都不读(扩展名门)');
    const control = join(fixtureRoot, 'scan-nonjs-control');
    STRESS_BUILD_MARKERS.forEach((marker, i) => writeAt(control, `notes-${i}.js`, marker));
    assert(scanServerStressMarkers(control).present === true, 'scan: 同内容换成 .js → present(上一格的正对照)');
  }
  {
    const dir = join(fixtureRoot, 'scan-map');
    writeAt(dir, 'route.js.map', STRESS_BODY);
    const s = scanServerStressMarkers(dir);
    assert(s.present === false && s.scannedFiles === 0, 'scan: 串只在 .js.map → absent(source map 不计)');
  }
  if (process.getuid?.() === 0) {
    note('scan: 不可读文件格跳过(root 不受文件权限限制)');
  } else {
    const dir = join(fixtureRoot, 'scan-unreadable');
    writeAt(dir, 'locked.js', STRESS_BODY);
    chmodSync(join(dir, 'locked.js'), 0o000);
    const s = scanServerStressMarkers(dir);
    chmodSync(join(dir, 'locked.js'), 0o600);
    assert(s.present === false && s.scannedFiles === 0, 'scan: .js 读失败 → 按缺源计且不计入 scannedFiles');
  }

  // ---------- 假 .next 上的判定 ----------
  const evalCases = [
    ['BUILD_ID 缺(串在)', { files: STRESS_FILES }, HEAD, true, 'build_id_missing', []],
    ['新鲜+串全在', { buildIdMs: FRESH_MS, files: STRESS_FILES }, HEAD, true, 'reuse', []],
    ['新鲜+server 目录缺', { buildIdMs: FRESH_MS }, HEAD, true, 'stress_source_missing', ['缺 压力回放题/进度预演题/静默连接题']],
    ['陈旧+串全在', { buildIdMs: STALE_MS, files: STRESS_FILES }, HEAD, true, 'stale_vs_head', ['防陈旧构建假红']],
    ['陈旧+串缺(陈旧优先)', { buildIdMs: STALE_MS }, HEAD, true, 'stale_vs_head', ['防陈旧构建假红']],
    ['mtime==head+串全在', { buildIdMs: HEAD * 1000, files: STRESS_FILES }, HEAD, true, 'reuse', []],
    ['HEAD 不可得+串全在', { buildIdMs: FRESH_MS, files: STRESS_FILES }, null, true, 'reuse', [HEAD_UNKNOWN]],
    ['HEAD 不可得+串缺', { buildIdMs: FRESH_MS }, null, true, 'stress_source_missing', [HEAD_UNKNOWN, '既有构建缺压测源']],
    ['串只在 server 下非 .js', { buildIdMs: FRESH_MS, files: { 'server/a.txt': STRESS_BODY, 'server/b.json': STRESS_BODY } }, HEAD, true, 'stress_source_missing', ['既有构建缺压测源']],
    ['串只在 .next/cache', { buildIdMs: FRESH_MS, files: { 'cache/webpack/x.js': STRESS_BODY } }, HEAD, true, 'stress_source_missing', ['既有构建缺压测源']],
    ['串只在 .next/static', { buildIdMs: FRESH_MS, files: { 'static/chunks/x.js': STRESS_BODY } }, HEAD, true, 'stress_source_missing', ['既有构建缺压测源']],
    ['串只在 .next/standalone', { buildIdMs: FRESH_MS, files: { 'standalone/apps/web/.next/server/x.js': STRESS_BODY } }, HEAD, true, 'stress_source_missing', ['既有构建缺压测源']],
    ['clean 构建只留 id 串', { buildIdMs: FRESH_MS, files: { 'server/app/interview/[resultId]/page.js': '["__e2e_stream_stress__","__e2e_stream_progress__","__e2e_stream_silent__"]' } }, HEAD, true, 'stress_source_missing', ['既有构建缺压测源']],
    ['部分缺 1/3', { buildIdMs: FRESH_MS, files: { 'server/route.js': '"压力回放题"' } }, HEAD, true, 'stress_source_missing', ['缺 进度预演题/静默连接题']],
    ['无压测意图+串在', { buildIdMs: FRESH_MS, files: STRESS_FILES }, HEAD, false, 'stress_source_unexpected', ['压测源不进非压测服务面']],
    ['无压测意图+串缺', { buildIdMs: FRESH_MS }, HEAD, false, 'reuse', []],
  ];
  evalCases.forEach(([label, spec, headTimeSec, stressExpected, reason, warned], i) => {
    const webDir = fakeWeb(join(fixtureRoot, `eval-${i}`, 'apps/web'), spec);
    const r = evaluateExistingBuild({ webDir, headTimeSec, stressExpected });
    const ok = r.reason === reason && r.rebuild === (reason !== 'reuse')
      && r.warnings.length === warned.length && warned.every((w, j) => r.warnings[j]?.includes(w));
    assert(ok, `evaluate: ${label} → ${reason}${ok ? '' : ` (got ${r.reason}/${r.rebuild}/${r.warnings.length})`}`);
  });

  // ---------- runner 判定段真跑 ----------
  const BEGIN = '// STALE_BUILD_GUARD_SEGMENT_BEGIN';
  const END = '// STALE_BUILD_GUARD_SEGMENT_END';
  const runner = read('scripts/run-e2e-ui.mjs');
  const beginAt = runner.indexOf(BEGIN);
  const endAt = runner.indexOf(END);
  const markersOnce = beginAt !== -1 && endAt > beginAt && runner.lastIndexOf(BEGIN) === beginAt && runner.lastIndexOf(END) === endAt;
  assert(markersOnce, 'runner: 判定段 BEGIN/END 界标各恰一处且顺序正确');
  const segment = markersOnce ? runner.slice(beginAt + BEGIN.length, endAt) : 'throw new Error("segment markers missing");';
  const outside = markersOnce ? runner.slice(0, beginAt) + runner.slice(endAt) : runner;

  const stubPath = join(fixtureRoot, 'stub-next.mjs');
  writeFileSync(stubPath, `
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
if (process.argv[2] !== 'build') process.exit(90);
console.log('stub stdout');
console.error('stub stderr');
const mode = process.env.SBG_STUB_MODE;
if (mode === 'fail') process.exit(3);
rmSync('.next', { recursive: true, force: true });
if (mode === 'no-build-id') process.exit(0);
mkdirSync('.next/server', { recursive: true });
writeFileSync('.next/server/route.js', process.env.E2E_UI_STRESS === '1' ? ${JSON.stringify(STRESS_BODY)} : 'clean');
writeFileSync('.next/BUILD_ID', 'stub-build');
`);
  const stubEnv = { ...process.env };
  delete stubEnv.E2E_UI_STRESS;
  const AsyncFunction = (async () => {}).constructor;
  const WEB_PORT = 3999;
  const API_BASE = 'http://127.0.0.1:3998';

  const runSegment = async (webRoot, { head = HEAD, stubMode = 'ok' } = {}) => {
    const trace = { spawned: [], warns: [], logs: [], sink: [], failures: [], steps: [], exit: null, crash: null };
    const closing = [];
    const exitSignal = Symbol('process.exit');
    const deps = {
      ROOT: webRoot,
      NEXT_BIN: stubPath,
      webPort: WEB_PORT,
      apiBase: API_BASE,
      headTimeSec: () => head,
      evaluateExistingBuild,
      existsSync,
      spawnProc: (name, cmd, args, cwd, extraEnv) => {
        trace.spawned.push({ name, cmd, args, cwd, extraEnv });
        if (name !== 'web-build') return {};
        const child = spawn(cmd, args, { cwd, env: { ...stubEnv, ...extraEnv, SBG_STUB_MODE: stubMode }, stdio: ['ignore', 'pipe', 'pipe'] });
        closing.push(new Promise((res) => child.on('close', res)));
        child.on('error', (e) => { trace.crash = e; child.emit('exit', 127); });
        return child;
      },
      buildSink: (stream) => trace.sink.push(stream),
      writeBuildLog: () => trace.steps.push('writeBuildLog'),
      emitFailureDiagnostics: () => trace.steps.push('emitFailureDiagnostics'),
      emitE2EFailure: (failure) => trace.failures.push(failure),
      cleanup: () => trace.steps.push('cleanup'),
      process: { exit: (code) => { trace.exit = code; throw exitSignal; } },
      console: { log: (line) => trace.logs.push(line), warn: (line) => trace.warns.push(line) },
    };
    const names = Object.keys(deps);
    try {
      await new AsyncFunction(...names, `'use strict';\n${segment}`)(...names.map((name) => deps[name]));
    } catch (e) {
      if (e !== exitSignal) trace.crash = e;
    }
    await Promise.all(closing);
    return trace;
  };
  const spawnedNames = (t) => t.spawned.map((s) => s.name);
  const callOf = (t, name) => t.spawned.find((s) => s.name === name);
  const serverEnvOk = (call) => call?.extraEnv?.E2E_UI_STRESS === '1' && call.extraEnv.PORT === String(WEB_PORT)
    && call.extraEnv.API_BASE_INTERNAL === API_BASE && call.extraEnv.NEXT_PUBLIC_API_BASE === API_BASE;
  const runnerRoot = (name, spec) => {
    const webRoot = `${join(fixtureRoot, name)}/`;
    fakeWeb(`${webRoot}apps/web`, spec);
    return webRoot;
  };
  const assertRebuilt = (t, webRoot, label) => {
    const build = callOf(t, 'web-build');
    assert(t.crash === null && sameList(spawnedNames(t), ['web-build', 'web']), `runner: ${label} → 先构建后启动${t.crash ? ` (${t.crash.message})` : ` (${spawnedNames(t).join(',')})`}`);
    assert(build?.cmd === 'node' && sameList(build?.args, [stubPath, 'build']) && build?.cwd === `${webRoot}apps/web`, `runner: ${label} → 构建命令与工作目录正确`);
    assert(serverEnvOk(build) && serverEnvOk(callOf(t, 'web')), `runner: ${label} → 构建与启动都带 E2E_UI_STRESS='1' 及端口/API 环境`);
    assert(t.exit === null && t.failures.length === 0, `runner: ${label} → 构建成功不退出不报 web_not_ready`);
  };

  {
    const webRoot = runnerRoot('run-clean', { buildIdMs: FRESH_MS, files: { 'server/route.js': 'clean' } });
    const t = await runSegment(webRoot);
    assertRebuilt(t, webRoot, '事故形(新鲜无压测源)');
    assert(t.warns.length === 1 && t.warns[0].includes('既有构建缺压测源') && sameList(t.logs.slice(0, 1), [FORCED_BUILD_LOG]), 'runner: 事故形 → 打缺源告警与判定重建日志');
    assert(t.sink.includes('stdout') && t.sink.includes('stderr'), 'runner: 事故形 → 构建 stdout/stderr 都进扣留缓冲');
    const second = await runSegment(webRoot);
    assert(second.crash === null && sameList(spawnedNames(second), ['web']) && second.warns.length === 0, 'runner: 重建后再跑同一目录 → 复用不再构建(替身按 E2E_UI_STRESS 产出压测源)');
  }
  {
    const webRoot = runnerRoot('run-reuse', { buildIdMs: FRESH_MS, files: STRESS_FILES });
    const t = await runSegment(webRoot);
    assert(t.crash === null && sameList(spawnedNames(t), ['web']) && t.warns.length === 0 && serverEnvOk(callOf(t, 'web')), 'runner: 新鲜有压测源 → 不构建直接启动');
    assert(readFileSync(`${webRoot}apps/web/.next/BUILD_ID`, 'utf8') === 'fake-build', 'runner: 复用臂不改动既有产物');
  }
  {
    const webRoot = runnerRoot('run-stale', { buildIdMs: STALE_MS, files: STRESS_FILES });
    const t = await runSegment(webRoot);
    assertRebuilt(t, webRoot, '陈旧构建');
    assert(t.warns.length === 1 && t.warns[0].includes('防陈旧构建假红'), 'runner: 陈旧构建 → 打陈旧告警');
  }
  {
    const webRoot = runnerRoot('run-missing', {});
    const t = await runSegment(webRoot);
    assertRebuilt(t, webRoot, 'BUILD_ID 缺失');
    assert(t.warns.length === 0 && sameList(t.logs.slice(0, 1), [NO_BUILD_LOG]), 'runner: BUILD_ID 缺失 → 打无构建日志不打告警');
  }
  {
    const webRoot = runnerRoot('run-no-head', { buildIdMs: STALE_MS, files: STRESS_FILES });
    const t = await runSegment(webRoot, { head: null });
    assert(t.crash === null && sameList(spawnedNames(t), ['web']) && t.warns.length === 1 && t.warns[0].includes(HEAD_UNKNOWN), 'runner: HEAD 时间不可得+有压测源 → 告警后复用(fail-open)');
  }
  {
    const webRoot = runnerRoot('run-fail', { buildIdMs: FRESH_MS });
    const t = await runSegment(webRoot, { stubMode: 'fail' });
    assert(t.exit === 3 && sameList(spawnedNames(t), ['web-build']), 'runner: 构建非零退出 → 按构建退出码退出且不启动');
    assert(sameList(t.failures, [{ class: 'frontend', code: 'web_not_ready' }]) && sameList(t.steps, ['writeBuildLog', 'emitFailureDiagnostics', 'cleanup']), 'runner: 构建非零退出 → 落构建日志、报 web_not_ready、清理');
  }
  {
    const webRoot = runnerRoot('run-no-id', { buildIdMs: FRESH_MS });
    const t = await runSegment(webRoot, { stubMode: 'no-build-id' });
    assert(t.exit === 1 && sameList(spawnedNames(t), ['web-build']) && sameList(t.failures, [{ class: 'frontend', code: 'web_not_ready' }]), 'runner: 构建退出 0 但无 BUILD_ID → 退出 1 且报 web_not_ready');
  }

  // ---------- runner 防回退钉 ----------
  assert(/^import \{ evaluateExistingBuild \} from '\.\/e2e-platform\/stale-build-guard\.mjs';$/m.test(runner), 'runner: 判定函数来自守卫模块(判定段真跑注入的是同一函数)');
  {
    const localDecision = ['forceRebuild', 'stressSourcePresent', 'scanServerStressMarkers', 'decideBuildReuse', 'statSync', 'mtimeMs', 'guard.reason', 'stale_vs_head', 'stress_source_'].filter((word) => runner.includes(word));
    assert(localDecision.length === 0, `runner: 无本地判定词面${localDecision.length ? ` (命中 ${localDecision.join(',')})` : ''}`);
    const outsideCalls = ['evaluateExistingBuild(', "spawnProc('web-build'", "spawnProc('web'", '[NEXT_BIN'].filter((word) => outside.includes(word));
    assert(outsideCalls.length === 0, `runner: 判定、构建、启动调用都在判定段内${outsideCalls.length ? ` (界标外命中 ${outsideCalls.join(',')})` : ''}`);
  }

  // ---------- 检测串与产物前提钉 ----------
  assert(STRESS_BUILD_MARKERS.every((m) => !m.includes('__e2e_stream_')), 'markers: 检测串不含 __e2e_stream_ id 族(id 族在 clean 构建的服务端组件页 bundle 里仍保留·id 串必假阳)');
  {
    const route = read('apps/web/app/api/interview/[id]/events/route.ts');
    const gate = "&& __E2E_UI_STRESS__ === '1') {";
    const gateAt = route.indexOf(gate);
    let depth = 1;
    let gateEnd = gateAt + gate.length;
    while (gateAt !== -1 && depth > 0 && gateEnd < route.length) {
      if (route[gateEnd] === '{') depth += 1;
      if (route[gateEnd] === '}') depth -= 1;
      gateEnd += 1;
    }
    assert(gateAt !== -1 && depth === 0, 'markers: 构建期内联门在 route.ts 在场');
    for (const [fn, marker] of [['e2eStressStream', '压力回放题'], ['e2eProgressStream', '进度预演题'], ['e2eSilentStream', '静默连接题']]) {
      const declaredAt = route.indexOf(`function ${fn}(`);
      const bodyEnd = route.indexOf('\n}\n', declaredAt);
      const markerAt = route.indexOf(marker);
      const uses = [...route.matchAll(new RegExp(`\\b${fn}\\(`, 'g'))].map((m) => m.index);
      const callAt = uses.find((at) => at !== declaredAt + 'function '.length);
      assert(declaredAt !== -1 && markerAt > declaredAt && markerAt < bodyEnd && route.lastIndexOf(marker) === markerAt, `markers: ${marker} 恰一处且在 ${fn} 函数体内`);
      assert(uses.length === 2 && callAt > gateAt && callAt < gateEnd, `markers: ${fn} 除声明外只有一处调用且在构建期门分支内(实测 ${uses.length} 处)`);
      assert(!new RegExp(`export\\s+(?:async\\s+)?function\\s+${fn}\\b|export\\s*\\{[^}]*\\b${fn}\\b`).test(route), `markers: ${fn} 未导出(导出会让门假时函数体留在产物里)`);
    }
  }
  {
    const nextConfig = read('apps/web/next.config.mjs');
    assert(nextConfig.includes("__E2E_UI_STRESS__: process.env.E2E_UI_STRESS === '1' ? '1' : '0'"), 'next: 压测开关仍是构建期内联');
    assert(!/serverMinification\s*:\s*false/.test(nextConfig) && !/cleanDistDir\s*:\s*false/.test(nextConfig), 'next: 未关闭 serverMinification/cleanDistDir(clean 构建三串为零依赖这两项默认开)');
  }
  {
    const suite = read('scripts/run-e2e-performance-suite.mjs');
    assert(!/E2E_UI_STRESS\s*[:=]\s*['"]?1/.test(suite), "suite: perf 套件未把 E2E_UI_STRESS 置 1(步1 继承运营者 env，前提是 shell 未导出该开关)");
  }

  // ---------- 真树只读观测（不判门·本机构建态各异） ----------
  const realServer = join(root, 'apps/web', '.next', 'server');
  if (existsSync(realServer)) {
    const s = scanServerStressMarkers(realServer);
    note(`real-tree observation: apps/web/.next/server scanned=${s.scannedFiles} stressSourcePresent=${s.present} (diagnostic only, no gate)`);
  } else {
    note('real-tree observation: apps/web/.next/server absent (no build in tree)');
  }
} finally {
  rmSync(fixtureRoot, { recursive: true, force: true });
}

// ---------- node --check 改动脚本 ----------
for (const rel of ['scripts/run-e2e-ui.mjs', 'scripts/e2e-platform/stale-build-guard.mjs', 'scripts/e2e-ui-stale-build-guard.proof.mjs']) {
  const r = spawnSync(process.execPath, ['--check', join(root, rel)], { encoding: 'utf8' });
  assert(r.status === 0, `node --check ${rel}`);
}

console.log(lines.join('\n'));
const passed = lines.filter((line) => line.startsWith('PASS')).length;
const failed = lines.filter((line) => line.startsWith('FAIL')).length;
console.log(exitCode === 0 ? `STALE-BUILD-GUARD-PROOF PASS ${passed} (browser-less, decision/scan/runner-segment)` : `STALE-BUILD-GUARD-PROOF FAIL ${failed} of ${passed + failed}`);
process.exit(exitCode);
