#!/usr/bin/env node
// request-status-recon.proof.mjs — 普查提取器显式标记读法 proof（受管脚本）。
//
// 断言面：三类显式翻面标记（`终值裁定=`/`有效态翻面→`/`STOP 收口`态字``）与闭卷/归档注的
// 「规范注头共线 + marker 非反引号引述 + 态字紧邻（marker 后只容包裹字符）」读法
// （2026-11-06 rev：正文引述格式示例/prose 提及不再伪翻——small-fixes-1105 §0 表行 :13 原文
// 曾被读成 executed 的 P1 根因面）。
//   探针仓臂：/tmp 临时 git 仓构造会误判样例卷（含 :13 原文逐字）断言不再伪翻 + 真翻面注
//   原形（携注头）正控照常翻面；bare `终值裁定=` 不翻系钉死语义一并钉住。
//   门行为臂：防漏门（零锚卷 EXIT=1 逐卷点名）与卷数收缩门（HEAD 默认读法 < 下界 EXIT=1；
//   显式 --ref= 不设界）保持如实红。
//   真仓臂：HEAD 默认读法 ②向差异清单为空（无不存在的 draft→executed 迁移）+
//   small-fixes-1105 读 draft 族（不落 executed/closed）。
// 用法：node scripts/ai-docs/request-status-recon.proof.mjs
//   RECON_SCRIPT=<path> 覆盖被测脚本路径（红证用：指向修订前脚本副本，proof 应 FAIL）。

import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..', '..');
const RECON = process.env.RECON_SCRIPT ? resolve(process.env.RECON_SCRIPT) : join(here, 'request-status-recon.mjs');

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

// ── small-fixes-1105 §0 表行 :13 原文逐字（本 proof 的核心样例）──────────────────
const QUOTED_FORMATS_ROW =
  '| 1 | 普查门提取器 | `scripts/ai-docs/request-status-recon.mjs:66-67` 硬编码 `EXPECTED_VOLUME_COUNT=274`+默认 ref `e647fcffa`；HEAD 287 卷被 census drift guard 拒绝 EXIT=1（亲跑）；rc 后四种关闭注（`有效态翻面→`态字`` / `【关闭…STOP 收口 `closed`` / `【闭卷注|【归档注…本卷闭卷|归档登记】` / `终值裁定=`）不识别——287 卷被伪读为 executed/无状态行 |';

const probe1 = makeProbeRepo('forms', {
  // 引述格式示例卷：正文引用四关闭注格式原文（含 :13 行逐字）——须读 draft 不伪翻。
  'quote-formats-REQUEST.md': [
    '# QUOTE-FORMATS REQUEST',
    '**Status**: **`draft:awaiting_pre_exec_dual`**（起草落卷即停）',
    '',
    QUOTED_FORMATS_ROW,
    '',
    'STOP: `draft:awaiting_pre_exec_dual`',
    '',
  ].join('\n'),
  // 关闭注引述卷：日期缺位的【闭卷注引述+bare `终值裁定=` 行——均不翻（钉死语义）。
  'quote-close-note-REQUEST.md': [
    '# QUOTE-CLOSE-NOTE REQUEST',
    '**Status**: **`draft:awaiting_pre_exec_dual`**（起草落卷即停）',
    '',
    '可补【闭卷注 （示例引用） 本卷闭卷登记——详见真卷】。',
    '',
    '终值裁定=closed',
    '',
  ].join('\n'),
  // 正控·对账翻面注+终裁注并存原形（regw `:3` 形）：裁定注胜翻面注 → 照常翻 proofed:dual_pass。
  'real-adjud-REQUEST.md': [
    '# REAL-ADJUD REQUEST',
    '**Status**: **`draft:awaiting_pre_exec_dual`**（起草落卷即停）',
    '',
    '【翻面 2026-11-03（STATUS-RECON 对账刀·协调方授权裁定 131·append-only）: 本行活值 `draft:awaiting_pre_exec_dual` 史录零洗·有效态翻面→`closed`】【终裁注 2026-11-05（U5a·协调方终裁授权行使·append-only）: 本行并存两注——翻面注（有效态翻面→`closed`·2026-11-03）与补转注（状态补转 `proofed:dual_pass`·2026-11-03）——终值裁定=**`proofed:dual_pass`**（取时间后位·两注并存史录零洗·本注只钉终值读序·翻面权归协调方）】',
    '',
  ].join('\n'),
  // 正控·对账刀翻面注原形（cap-sanction-2232 形）→ 照常翻 closed。
  'real-recon-flip-REQUEST.md': [
    '# REAL-RECON-FLIP REQUEST',
    '**Status**: **`draft:awaiting_pre_exec_dual`**（起草落卷即停）',
    '',
    '【翻面 2026-11-03（STATUS-RECON 对账刀·协调方授权裁定 131·append-only）: 本行活值 `draft:awaiting_pre_exec_dual` 史录零洗·有效态翻面→`closed`】',
    '',
  ].join('\n'),
  // 正控·批量关闭注原形（g2-report-page 形）→ 照常翻 closed。
  'real-close-REQUEST.md': [
    '# REAL-CLOSE REQUEST',
    '**Status**: **`draft:awaiting_pre_exec_dual`**（起草落卷即停）',
    '',
    '【关闭 2026-11-03（DRAFT-FLIP 批量关闭刀·协调方授权·append-only）: 卷内 §9 已落·**零残面**·STOP 收口 `closed`】',
    '',
  ].join('\n'),
  // 紧邻判据隔离臂：注头与 marker 原形俱在、但态字不紧邻（marker 后 prose 隔断）→ 不翻。
  'nonadjacent-REQUEST.md': [
    '# NONADJACENT REQUEST',
    '**Status**: **`draft:awaiting_pre_exec_dual`**（起草落卷即停）',
    '',
    '【翻面 2026-11-03（STATUS-RECON 对账刀·append-only）: 本行系引述非注记原行·有效态翻面→ 的态字须紧邻 marker 方命中·真注在真卷读 closed】',
    '',
  ].join('\n'),
});

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

// 防漏门臂：零锚卷（无任何状态行）→ EXIT=1 逐卷点名（先出报告后裁决）。
const probe2 = makeProbeRepo('leak', {
  'silent-volume-REQUEST.md': ['# SILENT VOLUME', '', '本卷无任何状态注。', ''].join('\n'),
});
const p2 = runRecon(probe2, ['--ref=HEAD']);
check(
  p2.status === 1 && p2.stdout.includes('卷数=1') && p2.stderr.includes('census leak') && p2.stderr.includes('silent-volume'),
  'leak gate: status-less volume exits 1 with per-volume report after stdout',
  'leak probe must exit 1 with census leak naming silent-volume',
  { status: p2.status, stderr: p2.stderr.slice(0, 300) },
);
rmSync(probe2, { recursive: true, force: true });

// 真仓臂：HEAD 默认读法（收缩门过界=现值恰等下界）②向差异清单为空 + 本卷读 draft 族。
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
const realAll = runRecon(repoRoot, ['--ref=HEAD', '--all']);
const smallFixesRow = rowFor(realAll.stdout, 'small-fixes-1105');
check(
  smallFixesRow.includes('draft:awaiting_pre_exec_dual') && !/executed|closed/.test(smallFixesRow),
  'real repo: small-fixes-1105 reads draft family (not executed/closed)',
  'small-fixes-1105 must read draft at HEAD',
  smallFixesRow,
);

const failedCount = lines.filter((l) => l.startsWith('FAIL')).length;
console.log(lines.join('\n'));
console.log(
  failedCount === 0
    ? `\n✓ request-status-recon 显式标记读法 proof 全部通过（${lines.length} PASS）`
    : `\n✗ ${failedCount} 项失败`,
);
process.exit(exitCode);
