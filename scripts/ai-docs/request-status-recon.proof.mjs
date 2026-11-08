#!/usr/bin/env node
// request-status-recon.proof.mjs — 普查提取器显式标记读法 proof（受管脚本）。
//
// 断言面：三类显式翻面标记（`终值裁定=`/`有效态翻面→`/`STOP 收口`态字``）与闭卷/归档注的
// 「规范注头共线 + marker 非反引号引述 + 态字紧邻（marker 后只容包裹字符）」读法
// （2026-11-06 rev：正文引述格式示例/prose 提及不再伪翻——small-fixes-1105 §0 表行 :13 原文
// 曾被读成 executed 的 P1 根因面）。
//   固定样本臂（2026-11-06 post r2）：探针卷自本 proof 旁 `request-status-recon.proof-samples/`
//   固定样本目录装入（各状态×各形态：引述免疫/bare 与无日期免疫/态字不紧邻免疫/终裁注正控/
//   翻面注正控/关闭注正控/独立终裁注前后位两臂/零状态注防漏卷）——不再钉任何真实卷状态
//   （真实卷随生命周期翻面，钉 draft 族在 EXEC 翻面后必红=xs-post-1 P1 原因面）。
//   门行为臂：防漏门（零锚卷 EXIT=1 逐卷点名）与卷数收缩门（HEAD 默认读法 < 下界 EXIT=1；
//   显式 --ref= 不设界）保持如实红。
//   真仓臂：只留与任何单卷状态无关的普查级不变量——HEAD 默认读法 EXIT=0（收缩门下界绿）+
//   ②向差异清单为空（无不存在的 draft→executed 迁移）。
// 用法：node scripts/ai-docs/request-status-recon.proof.mjs
//   RECON_SCRIPT=<path> 覆盖被测脚本路径（红证用：指向修订前脚本副本，proof 应 FAIL）。

import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..', '..');
const RECON = process.env.RECON_SCRIPT ? resolve(process.env.RECON_SCRIPT) : join(here, 'request-status-recon.mjs');
const SAMPLES_DIR = join(here, 'request-status-recon.proof-samples');
const LEAK_SAMPLE = 'silent-volume-REQUEST.md'; // 零状态注卷：防漏门 fixture（不进正控探针仓）

let exitCode = 0;
const lines = [];
function pass(msg) { lines.push(`PASS  ${msg}`); }
function fail(msg) { lines.push(`FAIL  ${msg}`); exitCode = 1; }
function check(ok, okMsg, failMsg, detail) {
  if (ok) pass(okMsg);
  else fail(`${failMsg}${detail === undefined ? '' : ` :: ${JSON.stringify(detail).slice(0, 500)}`}`);
}

function runRecon(cwd, args = []) {
  const r = spawnSync(process.execPath, [RECON, ...args], { cwd, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
  return { status: r.status, stdout: r.stdout ?? '', stderr: r.stderr ?? '' };
}

function git(cwd, args) {
  return execFileSync('git', ['-C', cwd, ...args], { encoding: 'utf8' });
}

function makeProbeRepo(name, volumes) {
  const dir = mkdtempSync(join(tmpdir(), `recon-proof-${name}-`));
  mkdirSync(join(dir, 'ai-docs', 'delivery', 'harness'), { recursive: true });
  for (const [file, text] of Object.entries(volumes)) {
    writeFileSync(join(dir, 'ai-docs', 'delivery', 'harness', file), text);
  }
  git(dir, ['init', '-q']);
  git(dir, ['config', 'user.email', 'probe@example.invalid']);
  git(dir, ['config', 'user.name', 'recon-proof']);
  git(dir, ['add', '-A']);
  git(dir, ['commit', '-q', '-m', 'probe corpus']);
  return dir;
}

// 全表单行读取：`- <vol> | raw=<anchor>:<line> <value> | 终值=<...>`
function rowFor(out, vol) {
  const m = out.split('\n').find((l) => l.startsWith(`- ${vol} |`));
  return m ?? '';
}

// ── 固定样本装入：proof 旁 request-status-recon.proof-samples/（各状态×各形态）────────
// 文件名（去 -REQUEST.md 后缀）即探针卷名，文件内容即探针卷全文逐字节——样本卷的机读行为
// 由下方断言逐卷钉住；样本改动必过本 proof。
const samples = Object.fromEntries(
  readdirSync(SAMPLES_DIR)
    .filter((f) => f.endsWith('-REQUEST.md'))
    .sort()
    .map((f) => [f, readFileSync(join(SAMPLES_DIR, f), 'utf8')]),
);
if (!samples[LEAK_SAMPLE]) {
  console.error(`FAIL  missing leak fixture ${LEAK_SAMPLE} in ${SAMPLES_DIR}`);
  process.exit(1);
}
const corpus = Object.fromEntries(Object.entries(samples).filter(([f]) => f !== LEAK_SAMPLE));

const probe1 = makeProbeRepo('forms', corpus);

// 探针臂统一走显式 --ref=HEAD（=真仓全量跑同读法·且绕开 HEAD 默认读法的卷数收缩门）。
const p1 = runRecon(probe1, ['--ref=HEAD', '--all']);
check(p1.status === 0, 'probe corpus runs clean (explicit --ref=HEAD)', 'probe corpus run should exit 0', { status: p1.status, stderr: p1.stderr.slice(0, 300) });

const quoteRow = rowFor(p1.stdout, 'quote-formats');
check(
  quoteRow.includes('draft:awaiting_pre_exec_dual') && quoteRow.includes('随 raw') && !/executed|closed/.test(quoteRow),
  'P1 core: quoted format-spec row (:13 verbatim) keeps volume at draft, no phantom flip',
  'quoted format-spec volume must read draft without executed/closed terminal',
  quoteRow,
);
const closeQuoteRow = rowFor(p1.stdout, 'quote-close-note');
check(
  closeQuoteRow.includes('随 raw') && !/executed|closed/.test(closeQuoteRow),
  'undated 【闭卷注 quote + bare `终值裁定=` line do not flip (documented semantics)',
  'quote-close-note volume must stay draft',
  closeQuoteRow,
);
const nonadjRow = rowFor(p1.stdout, 'nonadjacent');
check(
  nonadjRow.includes('随 raw') && !/executed|closed/.test(nonadjRow),
  'non-adjacent state word after marker (prose gap) does not flip',
  'nonadjacent volume must stay draft',
  nonadjRow,
);
const adjudRow = rowFor(p1.stdout, 'real-adjud');
check(
  adjudRow.includes('proofed:dual_pass') && adjudRow.includes('marker'),
  'positive control: real 【终裁注 form still flips to proofed:dual_pass',
  'real-adjud volume must flip to proofed:dual_pass',
  adjudRow,
);
const reconRow = rowFor(p1.stdout, 'real-recon-flip');
check(
  /\bclosed\b/.test(reconRow) && reconRow.includes('marker'),
  'positive control: real 【翻面 对账刀 form still flips to closed',
  'real-recon-flip volume must flip to closed',
  reconRow,
);
const realCloseRow = rowFor(p1.stdout, 'real-close');
check(
  /\bclosed\b/.test(realCloseRow) && realCloseRow.includes('marker'),
  'positive control: real 【关闭 STOP 收口 form still flips to closed',
  'real-close volume must flip to closed',
  realCloseRow,
);
const adjudAfterRow = rowFor(p1.stdout, 'adjud-after-chain');
check(
  /\bclosed\b/.test(adjudAfterRow) && !/executed/.test(adjudAfterRow),
  'P1 r2: standalone 【终裁注 line after position-last EXEC flip beats executed → closed',
  'adjud-after-chain volume must read closed (not executed)',
  adjudAfterRow,
);
const adjudBeforeRow = rowFor(p1.stdout, 'adjud-before-chain');
check(
  /\bclosed\b/.test(adjudBeforeRow) && !/executed/.test(adjudBeforeRow),
  'P1 r2: standalone 【终裁注 line before position-last EXEC flip still wins → closed',
  'adjud-before-chain volume must read closed (not executed)',
  adjudBeforeRow,
);

// 卷数收缩门：HEAD 默认读法（未显式 --ref=）在探针仓（卷数 < 下界）必须如实红；
// 显式 --ref=HEAD 同读法不设界（历史 ref/探针仓回读自由）。
const defaultRun = runRecon(probe1, []);
check(
  defaultRun.status === 1 && defaultRun.stderr.includes('census shrink'),
  'shrink gate: default HEAD read below floor exits 1 with census shrink report',
  'default run on small corpus must fail with census shrink',
  { status: defaultRun.status, stderr: defaultRun.stderr.slice(0, 300) },
);
check(
  p1.status === 0 && !p1.stderr.includes('census shrink'),
  'shrink gate: explicit --ref=HEAD read is floor-free (historical/probe reads stay free)',
  'explicit --ref=HEAD run must not trip the shrink gate',
  { stderr: p1.stderr.slice(0, 300) },
);
rmSync(probe1, { recursive: true, force: true });

// 防漏门臂：零锚卷（无任何状态行·固定样本 silent-volume）→ EXIT=1 逐卷点名（先出报告后裁决）。
const probe2 = makeProbeRepo('leak', { [LEAK_SAMPLE]: samples[LEAK_SAMPLE] });
const p2 = runRecon(probe2, ['--ref=HEAD']);
check(
  p2.status === 1 && p2.stdout.includes('卷数=1') && p2.stderr.includes('census leak') && p2.stderr.includes('silent-volume'),
  'leak gate: status-less volume exits 1 with per-volume report after stdout',
  'leak probe must exit 1 with census leak naming silent-volume',
  { status: p2.status, stderr: p2.stderr.slice(0, 300) },
);
rmSync(probe2, { recursive: true, force: true });

// 真仓臂（2026-11-06 post r2 收窄）：只断言与任何单卷状态无关的普查级不变量——HEAD 默认读法
// EXIT=0（收缩门下界绿）+ ②向差异清单为空（无不存在的 draft→executed 迁移）。
// 真实单卷状态钉定已撤（样本目录承接种状态×形态覆盖；真实卷随生命周期翻面，钉态必红）。
const real = runRecon(repoRoot, []);
check(real.status === 0, 'real repo HEAD default read exits 0 (shrink gate green at floor)', 'real repo default read must exit 0', { status: real.status, stderr: real.stderr.slice(0, 300) });
const dir2Section = real.stdout.slice(real.stdout.indexOf('## ②向差异清单'));
const dir2Body = dir2Section.slice(dir2Section.indexOf('\n'), dir2Section.indexOf('\n## '));
check(
  real.stdout.includes('②向 raw-draft→executed族=0') && dir2Body.trim() === '',
  'real repo: ②向差异清单 empty (no phantom draft→executed migrations)',
  'real repo ②向 list must be empty with count 0',
  { head: real.stdout.split('\n')[3] },
);

const failedCount = lines.filter((l) => l.startsWith('FAIL')).length;
console.log(lines.join('\n'));
console.log(
  failedCount === 0
    ? `\n✓ request-status-recon 显式标记读法 proof 全部通过（${lines.length} PASS）`
    : `\n✗ ${failedCount} 项失败`,
);
process.exit(exitCode);
