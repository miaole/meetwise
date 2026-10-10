/**
 * TOKSTREAM S4a L1 合帧行为面 prove（REQUEST §1 ⑨ · §G 行 1「S4a：L1 合帧行为（重放→合帧后帧率/
 * 字节上界断言）」+ 合成卷④>4KB 码点安全切分卷）。
 *
 * 全 fake seam 零模型外呼（纯函数面）。重放卷出自 S2 收据 @receipts/tokstream-s2-probe/2026-10-07/：
 *   - probe-b.json **attempts[0].curve**（E1 勘误：curve 数据在 attempts[0].curve 非 facts.curve——
 *     双审席1+席2 同证；17 chunk·间隔 1–153ms）供 t=ms 时间轴；
 *   - probe-b-sse-chunks.redacted.txt（17 行 `t=<ms> data: <raw>`）供 delta 内容；
 *   两卷 17 行一一对应，13 个非空 delta 逐行 cross-check（deltaLen 相等）后合成时间轴重放。
 * 参数沿设计钉值：~100ms 窗（§D-3）·≤4KB 字节上界（§C-2=NOTIFY 8KB 安全半幅）·码点安全切分
 * （§C-2「绝不拆孤立代理项」）。worker TokenSink 生产接线=S4b（§I），本面只 declare 行为语义。
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  coalesceTokenDeltas,
  MODEL_STREAM_FRAME_MAX_BYTES,
  MODEL_STREAM_L1_COALESCE_WINDOW_MS,
  splitCodepointSafeByBytes,
  type TokenDeltaFrameInput,
} from '../src/model-client.ts';

let failures = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };
const hasLoneSurrogate = (s: string) => {
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c >= 0xd800 && c <= 0xdbff) { const n = s.charCodeAt(i + 1); if (!(n >= 0xdc00 && n <= 0xdfff)) return true; }
    if (c >= 0xdc00 && c <= 0xdfff) { const p = i > 0 ? s.charCodeAt(i - 1) : NaN; if (!(p >= 0xd800 && p <= 0xdbff)) return true; }
  }
  return false;
};

const S2_DIR = '../../../ai-docs/delivery/receipts/tokstream-s2-probe/2026-10-07';
interface ProbeBShape {
  attempts: [{
    facts: { stitchedText: string; nonEmptyDeltas: number; chunkCount: number };
    curve: { i: number; tMs: number; kind: string; deltaLen?: number }[];
  }];
}
const probeB = JSON.parse(readFileSync(fileURLToPath(new URL(`${S2_DIR}/probe-b.json`, import.meta.url)), 'utf8')) as ProbeBShape;
const sseLines = readFileSync(fileURLToPath(new URL(`${S2_DIR}/probe-b-sse-chunks.redacted.txt`, import.meta.url)), 'utf8')
  .split('\n').map((l) => l.trim()).filter(Boolean);

function main() {
  // 钉值锚
  A('钉值：L1 合帧窗 ~100ms（§D-3）·单帧字节上界 ≤4KB=4096（§C-2 NOTIFY 8KB 安全半幅）',
    MODEL_STREAM_L1_COALESCE_WINDOW_MS === 100 && MODEL_STREAM_FRAME_MAX_BYTES === 4 * 1024);

  // 码点安全切分原语（④切点零孤立代理项）
  A('切分原语：代理对永不拆（a👍b @3B → a/👍/b·拼接全等）',
    JSON.stringify(splitCodepointSafeByBytes('a👍b', 3)) === JSON.stringify(['a', '👍', 'b'])
    && splitCodepointSafeByBytes('a👍b', 3).join('') === 'a👍b');
  A('切分原语：单片自身超预算（👍 @1B）保真原样出片·绝不制造残片',
    JSON.stringify(splitCodepointSafeByBytes('👍', 1)) === JSON.stringify(['👍']));
  A('切分原语：非法预算 fail-closed（0/负数抛 model_stream_frame_byte_budget_invalid）',
    (() => { try { splitCodepointSafeByBytes('x', 0); return false; } catch (e) { return e instanceof Error && e.message === 'model_stream_frame_byte_budget_invalid'; } })());

  // 窗语义（~100ms）
  const inWindow = coalesceTokenDeltas([{ tMs: 0, text: 'a' }, { tMs: 90, text: 'b' }]);
  const outWindow = coalesceTokenDeltas([{ tMs: 0, text: 'a' }, { tMs: 101, text: 'b' }]);
  A('窗语义：窗内两 delta 合一帧（coalesced=true·tMs=首片）；窗外（>100ms）分两帧',
    inWindow.length === 1 && inWindow[0]?.coalesced === true && inWindow[0]?.tMs === 0 && inWindow[0]?.text === 'ab'
    && outWindow.length === 2 && outWindow.every((f) => f.coalesced === false));

  // ===== 合成卷④（synthetic）：>4KB 码点安全切分卷（astral 码点密集·单 delta ≈13KB）=====
  const astralBase = '赞👍𠀀🄯fict→→答';
  const syntheticLong = astralBase.repeat(800);   // synthetic：手工构造·>4KB 多倍
  const frames4 = coalesceTokenDeltas([{ tMs: 0, text: syntheticLong }]);
  A('合成卷④>4KB（synthetic）：全部帧 ≤4096 字节·切点零孤立代理项（帧首尾码点完整）',
    frames4.length > 1 && frames4.every((f) => f.byteLen <= MODEL_STREAM_FRAME_MAX_BYTES)
    && frames4.every((f) => !hasLoneSurrogate(f.text)));
  A('合成卷④守恒：Σ帧文本==原 delta（ΣdeltaLen==accLen）+拼接全等+字节账一致',
    frames4.reduce((n, f) => n + f.text.length, 0) === syntheticLong.length
    && frames4.map((f) => f.text).join('') === syntheticLong
    && frames4.reduce((n, f) => n + f.byteLen, 0) === Buffer.byteLength(syntheticLong, 'utf8'));
  const twoLarge = coalesceTokenDeltas([
    { tMs: 0, text: 'x'.repeat(3000) },
    { tMs: 10, text: 'y'.repeat(3000) },
  ]);
  A('合成卷④跨 delta 触顶：窗内合并遇字节预算先冲帧（帧各自 ≤4096·内容零丢）',
    twoLarge.every((f) => f.byteLen <= MODEL_STREAM_FRAME_MAX_BYTES)
    && twoLarge.map((f) => f.text).join('') === 'x'.repeat(3000) + 'y'.repeat(3000));

  // ===== ⑨probe-b 重放（E1：curve 在 attempts[0].curve）=====
  const facts = probeB.attempts[0]!.facts;
  const curve = probeB.attempts[0]!.curve;   // E1 勘误：attempts[0].curve（非 facts.curve）
  const deltaContents: string[] = [];
  for (const line of sseLines) {
    const m = /^t=\d+ms data: (.*)$/.exec(line);
    if (!m || !m[1]) throw new Error(`sse fixture line malformed: ${line}`);
    if (!m[1].startsWith('{')) continue;   // [DONE] 等非 JSON 终结行不是内容 chunk
    const chunk = JSON.parse(m[1]) as { choices?: { delta?: { content?: unknown } }[] | null };
    const content = chunk.choices?.[0]?.delta?.content;
    if (typeof content === 'string' && content) deltaContents.push(content);
  }
  const curveDeltas = curve.filter((r) => r.kind === 'delta');
  A('重放前置：两卷 17 行对应（chunkCount=17·非空 delta=13·逐行 deltaLen cross-check 相等）',
    sseLines.length === facts.chunkCount && curve.length === facts.chunkCount
    && deltaContents.length === facts.nonEmptyDeltas && curveDeltas.length === deltaContents.length
    && curveDeltas.every((r, i) => r.deltaLen === deltaContents[i]?.length));
  const timeline: TokenDeltaFrameInput[] = deltaContents.map((text, i) => ({ tMs: curveDeltas[i]!.tMs, text }));
  const frames = coalesceTokenDeltas(timeline);
  const rawFps = deltaContents.length / ((curveDeltas[curveDeltas.length - 1]!.tMs - curveDeltas[0]!.tMs) / 1000);
  const coalescedFps = frames.length / ((curveDeltas[curveDeltas.length - 1]!.tMs - curveDeltas[0]!.tMs) / 1000);
  A('⑨合帧率：17 chunk 重放 → 合帧后帧数 < 非空 delta 数（帧率下降·实测入收据）',
    frames.length > 0 && frames.length < deltaContents.length);
  A('⑨字节上界：合帧后单帧全部 ≤4096 字节（§C-2）',
    frames.every((f) => f.byteLen <= MODEL_STREAM_FRAME_MAX_BYTES));
  A('⑨守恒+全等：Σ帧文本==72·拼接全等==收据 stitchedText·零孤立代理项',
    frames.reduce((n, f) => n + f.text.length, 0) === facts.stitchedText.length
    && frames.map((f) => f.text).join('') === facts.stitchedText
    && frames.every((f) => !hasLoneSurrogate(f.text)));
  A('⑨合帧标记：窗内合并帧 coalesced=true（帧≠供应商 chunk 边界·§C-2 帧契约）',
    frames.some((f) => f.coalesced === true) && frames.some((f) => f.coalesced === false));
  console.log(`重放实测：rawDeltas=${deltaContents.length}（${rawFps.toFixed(1)} fps）→ coalescedFrames=${frames.length}（${coalescedFps.toFixed(1)} fps）·帧字节=[${frames.map((f) => f.byteLen).join(',')}]`);

  console.log(`\n${failures === 0 ? '✓ L1 合帧行为面 prove 全部通过（probe-b 重放+合成卷④·零模型外呼）' : `✗ ${failures} 项失败`}`);
  process.exit(failures === 0 ? 0 : 1);
}

main();
