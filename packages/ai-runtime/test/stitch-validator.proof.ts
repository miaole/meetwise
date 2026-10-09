/**
 * TOKSTREAM S4a 拼接校验器单测（REQUEST §1 ⑦ · §G「S4a/S4d：拼接校验器单测（归一化全等/锚/长度带·
 * T3 定性器仅诊断工具不断言——误报实证入 fixture 注记）」）。
 *
 * 全 fake seam 零模型外呼（纯函数面）。判据值全部出自 S2 收据
 * receipts/tokstream-s2-probe/2026-10-07/stitch-compare.json `grading`（亲读）：
 *   T0 definition="normalized equality (trim + whitespace collapse)"
 *   T1 anchorLen=50（"prefix+suffix anchor (50 chars)"）
 *   T2 band="|Δ|/len ≤ 10%"
 *   T3（仅诊断·禁断言）：pass:false, overlapViolations:1, resendViolations:1 —— 误报实证：
 *   probe-b chunk#3 delta「SE 是」被裸前缀重叠启发式误标 overlap=1/resendFull=true，实为纯追加；
 *   该启发式若入运行时会改坏正确输出（「SSE 是…」→「SE 是…」），故只许存在于离线诊断工具（§E-⑦），
 *   本文件仅以负例演示其危害，绝不实现该启发式。
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  gradeStitchIdentity,
  normalizeForStitchCompare,
  STITCH_T1_ANCHOR_LEN,
  STITCH_T2_LENGTH_BAND_RATIO,
} from '../src/model-client.ts';

let failures = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };

const S2_DIR = '../../../ai-docs/delivery/receipts/tokstream-s2-probe/2026-10-07';
interface StitchCompareShape {
  grading: {
    normalized: { lenA: number; lenB: number; lengthRatio: number };
    prefixAnchor: string;
    suffixAnchor: string;
    T0: { pass: boolean; definition: string };
    T1: { pass: boolean; anchorLen: number; definition: string };
    T2: { pass: boolean; band: string; lengthRatio: number };
    T3: { pass: boolean; overlapViolations: number; resendViolations: number; definition: string };
  };
}
const stitch = JSON.parse(readFileSync(fileURLToPath(new URL(`${S2_DIR}/stitch-compare.json`, import.meta.url)), 'utf8')) as StitchCompareShape;
interface ProbeBShape {
  attempts: [{ facts: { stitchedText: string } }];
}
const probeB = JSON.parse(readFileSync(fileURLToPath(new URL(`${S2_DIR}/probe-b.json`, import.meta.url)), 'utf8')) as ProbeBShape;
const stitchedText = probeB.attempts[0]!.facts.stitchedText;

function main() {
  // 收据锚（判据值出自 S2 收据·禁造数）
  A('收据锚：grading.T0/T1/T2 定义与 band 亲读在场',
    stitch.grading.T0.definition === 'normalized equality (trim + whitespace collapse)'
    && stitch.grading.T1.anchorLen === 50 && stitch.grading.T1.definition === 'prefix+suffix anchor (50 chars)'
    && stitch.grading.T2.band === '|Δ|/len ≤ 10%');
  A('收据锚：stitchedText 与 grading.normalized 一致（lenA=lenB=72·ratio=0）',
    stitchedText.length === 72 && stitch.grading.normalized.lenA === 72 && stitch.grading.normalized.lenB === 72);

  // T0 归一化全等
  A('T0 原语：trim+折叠空白（空白归一到单空格·trim 两端）',
    normalizeForStitchCompare('  a\t b \n c ') === 'a b c'
    && normalizeForStitchCompare('a  b') === normalizeForStitchCompare('a b'));
  const g0 = gradeStitchIdentity(stitchedText, stitchedText);
  A('T0 收据复现：全等输入 → pass（definition 逐字一致）',
    g0.T0.pass === true && g0.T0.definition === stitch.grading.T0.definition);
  const spacedVariant = stitchedText.replace('的 HTTP 长连接', '的  HTTP  长连接');
  A('T0 容差：空白差异变体 → 归一化后仍全等（原文本不等）',
    spacedVariant !== stitchedText && gradeStitchIdentity(spacedVariant, stitchedText).T0.pass === true);
  A('T0 负例：内容不同 → fail',
    gradeStitchIdentity('完全不同的另一段输出文本', stitchedText).T0.pass === false);

  // T1 锚（anchorLen=50·prefix+suffix）
  A('T1 语义对齐：authoritative 前/后 50 字符 === 收据 prefixAnchor/suffixAnchor',
    stitchedText.slice(0, STITCH_T1_ANCHOR_LEN) === stitch.grading.prefixAnchor
    && stitchedText.slice(-STITCH_T1_ANCHOR_LEN) === stitch.grading.suffixAnchor
    && STITCH_T1_ANCHOR_LEN === stitch.grading.T1.anchorLen);
  A('T1 收据复现：全等输入 → pass（anchorLen/definition 逐字一致）',
    g0.T1.pass === true && g0.T1.anchorLen === 50 && g0.T1.definition === stitch.grading.T1.definition);
  const suffixBroken = stitchedText.slice(0, stitchedText.length - 1);
  A('T1 负例：尾字符缺失（suffix 锚破） → fail（T2 仍在带内=两面独立）',
    gradeStitchIdentity(suffixBroken, stitchedText).T1.pass === false
    && gradeStitchIdentity(suffixBroken, stitchedText).T2.pass === true);
  const prefixBroken = 'X' + stitchedText.slice(1);
  A('T1 负例：首字符改写（prefix 锚破） → fail',
    gradeStitchIdentity(prefixBroken, stitchedText).T1.pass === false);

  // T2 长度带（|Δ|/len ≤ 10%）
  A('T2 收据复现：ratio=0 → pass（band 逐字一致·阈值=0.1）',
    g0.T2.pass === true && g0.T2.band === stitch.grading.T2.band && STITCH_T2_LENGTH_BAND_RATIO === 0.1);
  const authority100 = 'x'.repeat(100);
  A('T2 边界：80/100 → ratio 0.2 > 10% → fail；90/100 → ratio 0.1 ≤ 10% → pass',
    gradeStitchIdentity('x'.repeat(80), authority100).T2.pass === false
    && gradeStitchIdentity('x'.repeat(90), authority100).T2.pass === true);

  // T3 定性器：仅诊断禁断言（结构性证明：运行时校验器零 T3 面）
  const verdictJson = JSON.stringify(gradeStitchIdentity(stitchedText, stitchedText));
  A('T3 禁断言（结构）：校验器判定输出零 T3/overlap 字段',
    !verdictJson.includes('T3') && !verdictJson.toLowerCase().includes('overlap'));
  // 注释先剥（沿 model-slot-bypass.static.proof.ts invokeHasNoDirectLeaseAcquire 惯例）：
  // 查的是**代码面**无该启发式；文件头/注释中的 T3 误报实证引文属文档，不在禁入面内。
  const runtimeSrc = readFileSync(fileURLToPath(new URL('../src/model-client.ts', import.meta.url)), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '');
  A('T3 禁入运行时（结构）：model-client.ts 代码面零裸前缀重叠启发式标识符',
    !runtimeSrc.includes('overlapViolations') && !runtimeSrc.includes('resendViolations')
    && !runtimeSrc.includes('T3FilledBy'));

  // T3 误报实证 fixture 注记（合成演示·诊断性负例，绝非运行时启发式）：
  // probe-b chunk#2/#3 delta 序列 ['S','SE 是'] —— 裸前缀重叠启发式会把「SE 是」startsWith('S') 误判为
  // 重发并剥前缀 → 拼接被改坏为「SE 是…」（≠收据权威「SSE 是…」）；实际纯追加拼接与权威逐字一致。
  const actualPrefix = 'S' + 'SE 是';
  const heuristicCorrupted = 'SE 是'.startsWith('S') ? 'SE 是'.slice(1) : 'SE 是';
  A('T3 误报实证（fixture 注记）：裸前缀启发式会改坏正确输出（「SE 是」≠「SSE 是」）',
    heuristicCorrupted === 'E 是' && heuristicCorrupted !== actualPrefix);
  A('T3 误报实证（fixture 注记）：纯追加拼接与收据权威逐字一致（前 5 字符）——证明 T3 误报',
    actualPrefix === stitchedText.slice(0, 5) && stitch.grading.T3.pass === false
    && stitch.grading.T3.overlapViolations === 1 && stitch.grading.T3.resendViolations === 1);

  console.log(`\n${failures === 0 ? '✓ 拼接校验器单测全部通过（T0/T1/T2 承重·T3 仅诊断禁断言·零模型外呼）' : `✗ ${failures} 项失败`}`);
  process.exit(failures === 0 ? 0 : 1);
}

main();
