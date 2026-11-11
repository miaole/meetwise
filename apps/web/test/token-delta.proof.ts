/**
 * TOKSTREAM S4b · web token_delta 逐 token 面 proof（门预申明①新 proof · 纯函数零 DB 零模型外呼·actualSpendCny=null）。
 * 形制沿 web-logic.proof（纯函数无浏览器断言门）。
 *
 * R5 验收六臂（REQUEST §2 R5）：
 *   (i)   token_delta 帧无 id 可解析·id 缺席合法（全表唯一 id optional 成员）；
 *   (ii)  unknown kind → null 丢弃回归（向后兼容免费获得）；
 *   (iii) 终态到达清缓冲+权威覆盖（tokenStitch 对照遥测挂账）；
 *   (iv)  seq gap 不死等（缺帧不 degraded 不死等·§C-5）；
 *   (v)   delta 帧后 lastEventId 原值不变·重连 last-event-id 头仍数值（F2 光标守卫臂）；
 *   (vi)  同 (attemptKey,seq) 重复 delta 帧不回退缓冲（max-seq 幂等覆盖）。
 * R6：对照器三态（全等/失配 telemetry 不阻断/缓冲空跳过）+probe-b 曲线 t=ms 重放→L3 rAF 批量 pacing 臂。
 * UX-A：打字机 advanceTypewriter 预算推进+揭示切片+streamingTextDisplay 游标切片。
 *
 * N-13 补臂（本刀）：(1) flag=1 业务拒绝形 SSE → 客户端实收 withdrawn；
 *   (2) 重连丢失撤回后 re-roll 不得拼接被拒草稿（onStreamClosed 清未权威预览 +
 *   runInterviewStream 驱动）。P3-b：空 id: 不得解码成 0 以致撤回帧被水位滤网丢掉。
 * 运行：pnpm -C apps/web prove:token-delta（纯函数直跑）。
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { decodeSSE, toBusinessEvent } from '../lib/stream/business-events.ts';
import { applyEvent, initialView, onStreamClosed } from '../lib/stream/interview-state.ts';
import { runInterviewStream, type StreamOpener } from '../lib/stream/interview-stream.ts';
import type { InterviewView } from '../lib/stream/interview-state.ts';
import { lastEventIdHeaderValue } from '../lib/stream/sse-cursor.ts';
import { makeFrameCoalescer } from '../lib/stream/frame-coalescer.ts';
import { streamingTextDisplay } from '../lib/view-model.ts';
import { advanceTypewriter, typewriterVisible } from '../lib/stream/token-typewriter.ts';
import { gradeTokenStitchIdentityWeb, normalizeForStitchCompareWeb } from '../lib/stream/token-stitch.ts';

let failures = 0;
const A = (name: string, ok: boolean, detail?: unknown) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok && detail !== undefined) console.log(`      ↳ detail: ${JSON.stringify(detail)}`);
  if (!ok) failures++;
};

const deltaFrame = (seq: number, text: string, attemptKey = 'ak', extra = ''): string =>
  `event: token_delta\ndata: {"attemptKey":"${attemptKey}","seq":${seq},"text":"${text}"${extra}}\n\n`;
const deltaEvent = (seq: number, text: string, attemptKey = 'ak') =>
  toBusinessEvent({ id: undefined, event: 'token_delta', data: JSON.stringify({ attemptKey, seq, text }) });
const authorityFrame = (id: number, kind: string, data: Record<string, unknown>): string =>
  `id: ${id}\nevent: ${kind}\ndata: ${JSON.stringify(data)}\n\n`;

async function main() {
  // ===== R5(i)+(ii)：SSE 契约面（decodeSSE/toBusinessEvent 零改·双端注册同刀）=====
  {
    const wire = deltaFrame(1, '你好') + authorityFrame(7, 'question_ready', { question: 'Q', refs: [] }) + 'event: mystery_kind\ndata: {"x":1}\n\n';
    const { frames, rest } = decodeSSE(wire);
    A('R5(i) 混合流解码：delta 帧无 id 字段·权威帧带 id（§C-4 光标防毒）',
      frames.length === 3 && frames[0]!.id === undefined && frames[1]!.id === 7 && rest === '',
      { frames: frames.map((f) => ({ id: f.id, event: f.event })) });
    const delta = toBusinessEvent(frames[0]!);
    const auth = toBusinessEvent(frames[1]!);
    const unknown = toBusinessEvent(frames[2]!);
    A('R5(i) token_delta 解析合法（attemptKey/seq/text 齐备·id 缺席合法）',
      delta !== null && delta.event === 'token_delta' && delta.id === undefined
      && delta.data.seq === 1 && delta.data.text === '你好' && delta.data.attemptKey === 'ak');
    A('R5(ii) unknown kind → null 丢弃回归（旧前端向后兼容免费获得）',
      auth !== null && auth.event === 'question_ready' && unknown === null);
  }

  // ===== R5(v)+(vi)+(iv)：归约面（光标守卫/幂等覆盖/seq gap）=====
  {
    let v: InterviewView = initialView;
    v = applyEvent(v, deltaEvent(1, 'aa'));
    v = applyEvent(v, deltaEvent(2, 'bb'));
    const afterDeltas = v;
    A('R5(v) delta 帧不动 lastEventId（守卫后原值 0 不变·缓冲按序并入）',
      afterDeltas.lastEventId === 0 && afterDeltas.tokenBuffer?.text === 'aabb' && afterDeltas.tokenBuffer.maxSeq === 2,
      { lastEventId: afterDeltas.lastEventId, buffer: afterDeltas.tokenBuffer });
    // 0=无头（全量重放既有语义）——毒化断言面= NaN/非安全整数永不入头（InvalidLastEventIdError 免疫）。
    const hdr = lastEventIdHeaderValue(afterDeltas.lastEventId);
    A('R5(v) 重连 last-event-id 头不毒化（0=无头原值·类型仍 number 非 NaN·Number.isSafeInteger 域）',
      hdr === undefined && typeof afterDeltas.lastEventId === 'number' && Number.isSafeInteger(afterDeltas.lastEventId)
      && lastEventIdHeaderValue(9) === '9' && Number.isSafeInteger(JSON.parse(`{"n":${lastEventIdHeaderValue(9)}}`).n));
    // 幂等覆盖：同 (attemptKey,seq) 重复帧/旧帧 → 不回退不重复
    v = applyEvent(v, deltaEvent(2, 'bb'));
    v = applyEvent(v, deltaEvent(1, 'aa'));
    A('R5(vi) 同 (attemptKey,seq) 重复/回退帧不回退缓冲（max-seq 幂等·文本零重复）',
      v.tokenBuffer?.text === 'aabb' && v.tokenBuffer.maxSeq === 2,
      { buffer: v.tokenBuffer });
    // attemptKey 换代 = 缓冲换代不互毒（F6）
    v = applyEvent(v, deltaEvent(1, 'zz', 'ak2'));
    A('R5(vi) attemptKey 换代=缓冲换代不互毒（旧 attemptKey 缓冲整体让位）',
      v.tokenBuffer?.attemptKey === 'ak2' && v.tokenBuffer.text === 'zz' && v.tokenBuffer.maxSeq === 1,
      { buffer: v.tokenBuffer });
    // seq gap：缺帧不死等不 degraded（缺帧照常并入·唯一恢复=终态权威）
    let g = initialView;
    g = applyEvent(g, deltaEvent(1, 'a'));
    g = applyEvent(g, deltaEvent(5, 'e'));   // 2/3/4 缺失
    A('R5(iv) seq gap 不死等（缺帧不 degraded·phase 不变·缓冲照常并入）',
      g.degraded === false && g.phase === 'connecting' && g.tokenBuffer?.text === 'ae' && g.tokenBuffer.maxSeq === 5,
      { degraded: g.degraded, buffer: g.tokenBuffer });
  }

  // ===== R5(iii)+R6 对照三态：终态到达=对照 telemetry+清缓冲+权威覆盖 =====
  {
    // 三态①：缓冲空（无 delta 前终态到达）→ 跳过对照（无 tokenStitch 挂账）
    let v = applyEvent(initialView, toBusinessEvent({ id: 3, event: 'question_ready', data: JSON.stringify({ question: '权威题面', refs: [] }) })!);
    A('R6 缓冲空跳过对照（无 delta 即无 tokenStitch 挂账·权威面照常接管）',
      v.tokenBuffer === undefined && v.tokenStitch === undefined && v.phase === 'question' && v.turns.length === 1,
      { stitch: v.tokenStitch, phase: v.phase });
    // 三态②：T0 全等（trim+空白折叠后全等）→ pass=true·缓冲清·权威覆盖
    let w = applyEvent(initialView, deltaEvent(1, 'AB  CD'));
    w = applyEvent(w, deltaEvent(2, ' E '));
    w = applyEvent(w, toBusinessEvent({ id: 5, event: 'question_ready', data: JSON.stringify({ question: ' AB\tCD E  ', refs: [] }) })!);
    A('R6 全等态：T0 归一化全等 pass=true+缓冲清空+权威覆盖（trim+空白折叠·终态权威=唯一恢复路径）',
      w.tokenBuffer === undefined && w.tokenStitch?.pass === true && w.tokenStitch.attemptKey === 'ak' && w.phase === 'question',
      { stitch: w.tokenStitch });
    // 三态③：失配 → telemetry 不阻断·仍用终态权威（json_object 卷已知形态：缓冲=JSON 源文·权威=解析字段）
    let m = applyEvent(initialView, deltaEvent(1, '{"q":"模型JSON源文"}'));
    m = applyEvent(m, toBusinessEvent({ id: 6, event: 'question_ready', data: JSON.stringify({ question: '解析后的题面', refs: [] }) })!);
    A('R6 失配态：telemetry 挂账 pass=false·不阻断·仍用终态权威（题面=权威值）',
      m.tokenBuffer === undefined && m.tokenStitch?.pass === false && m.phase === 'question' && m.turns[0]?.q === '解析后的题面',
      { stitch: m.tokenStitch, q: m.turns[0]?.q });
    A('R6 对照器直证三函数面（normalize/lengthRatio/零长安全）',
      normalizeForStitchCompareWeb(' a  b\n ') === 'a b'
      && gradeTokenStitchIdentityWeb('abc', 'abd').pass === false
      && gradeTokenStitchIdentityWeb('', '').pass === true && gradeTokenStitchIdentityWeb('', '').lengthRatio === 0);
  }

  // ===== R6(iv)：probe-b 曲线 t=ms 重放 → L3 rAF 批量 pacing 臂 =====
  {
    const probeB = JSON.parse(readFileSync(
      fileURLToPath(new URL('../../../receipts/archive/2026-09-batch23/receipts/tokstream-s2-probe/2026-10-07/probe-b.json', import.meta.url)), 'utf8')) as {
      attempts: [{ curve: Array<{ i: number; tMs: number; dtMs: number; kind: string; deltaLen?: number }> }];
    };
    const curve = probeB.attempts[0]!.curve;
    // 虚拟 rAF：schedule=登记回调帧号·手动逐帧推进（L3=每浏览器帧至多一次提交）
    const scheduledCallbacks: Array<() => void> = [];
    let commits = 0;
    const coalescer = makeFrameCoalescer<number>(() => { commits += 1; }, (flush) => { scheduledCallbacks.push(flush); return scheduledCallbacks.length; });
    // 按 t=ms 重放：dtMs=0/1 的连续 chunk 落同一浏览器帧窗（offer 后不 flush→合并）
    let lastOfferFrame = -1;
    let maxPerFrame = 0;
    let offersThisFrame = 0;
    for (const chunk of curve) {
      if (chunk.kind !== 'delta') continue;
      coalescer.offer(chunk.accLen ?? 0);
      offersThisFrame += 1;
      if (chunk.dtMs > 16) {   // 帧窗结束（>1 浏览器帧间隔）→ rAF 回调到点 flush
        maxPerFrame = Math.max(maxPerFrame, offersThisFrame);
        offersThisFrame = 0;
        while (scheduledCallbacks.length) scheduledCallbacks.shift()!();
        lastOfferFrame = chunk.tMs;
      }
      void lastOfferFrame;
    }
    if (offersThisFrame > 0) { maxPerFrame = Math.max(maxPerFrame, offersThisFrame); while (scheduledCallbacks.length) scheduledCallbacks.shift()!(); }
    const deltaChunks = curve.filter((c) => c.kind === 'delta').length;
    A('R6(iv) probe-b 曲线重放（S4d 指定行·17 chunk tMs/dtMs·A19 归档现位）',
      curve.length === 17 && deltaChunks >= 2, { chunks: curve.length, deltas: deltaChunks });
    A('R6(iv) L3 rAF 批量：连续 chunk 合并至每浏览器帧至多一次提交（commits < delta chunk 数·零丢失）',
      commits < deltaChunks && scheduledCallbacks.length === 0,
      { deltaChunks, commits, maxPerFrame });
    void maxPerFrame;
  }

  // ===== UX-A 打字机：预算推进+揭示切片+显示面游标切片 =====
  {
    let cursor = advanceTypewriter(undefined, 'ak', 100, 30);
    A('UX-A 首帧预算推进（0→30·min 上界收口）', cursor.revealedChars === 30 && cursor.attemptKey === 'ak');
    cursor = advanceTypewriter(cursor, 'ak', 100, 30);
    A('UX-A 逐帧单调累加（30→60·不回退）', cursor.revealedChars === 60);
    cursor = advanceTypewriter(cursor, 'ak', 40, 30);   // 缓冲缩水（终态覆盖窗口）→ min 上界
    A('UX-A 越界安全收口（min(已缓冲,揭示)·不越缓冲量）', cursor.revealedChars === 40, { cursor });
    const other = advanceTypewriter(cursor, 'ak2', 50, 30);
    A('UX-A attemptKey 换代=揭示从头（不互毒）', other.revealedChars === 30 && other.attemptKey === 'ak2');
    A('UX-A 揭示切片+显示面（streamingTextDisplay 有游标=截取·无游标=全量·缓冲缺省=undefined）',
      typewriterVisible('aabbcc', { attemptKey: 'ak', revealedChars: 4 }) === 'aabb'
      && streamingTextDisplay({ ...initialView, tokenBuffer: { attemptKey: 'ak', text: 'aabbcc', maxSeq: 3 } }, { attemptKey: 'ak', revealedChars: 2 }) === 'aa'
      && streamingTextDisplay({ ...initialView, tokenBuffer: { attemptKey: 'ak', text: 'aabbcc', maxSeq: 3 } }, undefined) === 'aabbcc'
      && streamingTextDisplay(initialView, undefined) === undefined);
    A('R5 终态覆盖显示面（缓冲清空后 streamingTextDisplay=undefined·权威面接管）',
      streamingTextDisplay(applyEvent(
        applyEvent(initialView, deltaEvent(1, 'draft')),
        toBusinessEvent({ id: 4, event: 'question_ready', data: JSON.stringify({ question: 'final', refs: [] }) })!,
      ), undefined) === undefined);
  }

  // ===== N-13 token_withdraw：清对应缓冲、水位拦迟到 delta、同键更高 seq 开新缓冲、光标不毒化 =====
  {
    const withdrawFrame = (seq: number, attemptKey = 'ak', reason = 'business_invalid'): string =>
      `event: token_withdraw\ndata: {"attemptKey":"${attemptKey}","seq":${seq},"reason":"${reason}"}\n\n`;
    const withdrawEvent = (seq: number, attemptKey = 'ak', reason = 'business_invalid') =>
      toBusinessEvent({ id: undefined, event: 'token_withdraw', data: JSON.stringify({ attemptKey, seq, reason }) });

    const wire = deltaFrame(1, '拒') + deltaFrame(2, '稿') + withdrawFrame(3);
    const { frames } = decodeSSE(wire);
    const evs = frames.map((f) => toBusinessEvent(f));
    A('N-13 token_withdraw 可解析（无 id 合法·reason 可选）',
      evs[2] !== null && evs[2]!.event === 'token_withdraw' && evs[2]!.id === undefined
      && evs[2]!.event === 'token_withdraw' && (evs[2] as { data: { seq: number; reason?: string } }).data.seq === 3
      && (evs[2] as { data: { reason?: string } }).data.reason === 'business_invalid',
      { evs: evs.map((e) => e && e.event) });

    let v = applyEvent(initialView, deltaEvent(1, 'verbatim'));
    v = applyEvent(v, deltaEvent(2, '-copy'));
    A('N-13 撤回前缓冲已拼接', v.tokenBuffer?.text === 'verbatim-copy' && v.lastEventId === 0);
    const after = applyEvent(v, withdrawEvent(3)!);
    A('N-13 撤回后缓冲清空 + 显示面 undefined + lastEventId 不毒化',
      after.tokenBuffer === undefined
      && after.tokenWithdrawnByKey?.ak === 3
      && after.lastEventId === 0
      && after.degraded === false
      && after.phase === 'connecting'
      && streamingTextDisplay(after, undefined) === undefined
      && lastEventIdHeaderValue(after.lastEventId) === undefined,
      { after: { buffer: after.tokenBuffer, withdrawn: after.tokenWithdrawnByKey, lastEventId: after.lastEventId } });

    const late = applyEvent(after, deltaEvent(2, 'stale'));
    A('N-13 撤回后迟到旧 seq 丢弃（不复活拒稿）',
      late.tokenBuffer === undefined && late.tokenWithdrawnByKey?.ak === 3);

    const reroll = applyEvent(after, deltaEvent(4, 'new-q'));
    A('N-13 同键更高 seq（re-roll）开新缓冲',
      reroll.tokenBuffer?.text === 'new-q' && reroll.tokenBuffer?.maxSeq === 4,
      { buffer: reroll.tokenBuffer });

    const other = applyEvent(after, deltaEvent(1, 'other', 'ak2'));
    A('N-13 异键 delta 不受本键撤回水位误伤',
      other.tokenBuffer?.attemptKey === 'ak2' && other.tokenBuffer?.text === 'other');

    const unknown = toBusinessEvent({ id: undefined, event: 'token_withdraw', data: JSON.stringify({ attemptKey: 'ak', seq: 1, reason: 'x' }) });
    A('N-13 反证参照：未知 kind 丢弃（mystery_kind→null）不误伤既有解析；token_withdraw 已被识别',
      toBusinessEvent({ id: 1, event: 'mystery_kind', data: '{"x":1}' }) === null
      && unknown !== null && unknown.event === 'token_withdraw');

    // ===== 臂(1) flag=1 业务拒绝形 SSE → 客户端实收 withdrawn =====
    // 形制对齐 API emit（event: token_withdraw / 无 id 行 / reason=业务闸码），不起容器、不调模型。
    {
      const rejectWire = deltaFrame(1, 'verbatim') + deltaFrame(2, '-copy')
        + withdrawFrame(3, 'ak', 'empty_quiz');
      const { frames: rf } = decodeSSE(rejectWire);
      const received = rf.map((f) => toBusinessEvent(f));
      let cv = initialView;
      for (const ev of received) { if (ev) cv = applyEvent(cv, ev); }
      A('N-13 臂(1) flag=1 业务拒绝：客户端实收 withdrawn（清拒稿缓冲 + 水位 + 显示面空）',
        received[2] !== null && received[2]!.event === 'token_withdraw' && received[2]!.id === undefined
        && (received[2] as { data: { reason?: string } }).data.reason === 'empty_quiz'
        && cv.tokenBuffer === undefined
        && cv.tokenWithdrawnByKey?.ak === 3
        && streamingTextDisplay(cv, undefined) === undefined
        && cv.degraded === false,
        { ev: received[2], buffer: cv.tokenBuffer, withdrawn: cv.tokenWithdrawnByKey });
    }

    // ===== P3-b 空 id: 不得解码成 0（否则 runInterviewStream 水位滤网会丢撤回帧）=====
    {
      const emptyIdWire = 'id:\nevent: token_withdraw\ndata: {"attemptKey":"ak","seq":3,"reason":"business_invalid"}\n\n';
      const { frames: ef } = decodeSSE(emptyIdWire);
      const ev = ef[0] ? toBusinessEvent(ef[0]) : null;
      A('N-13 P3-b 空 id: 解码为 undefined（不是 0）且撤回事件可解析',
        ef.length === 1 && ef[0]!.id === undefined
        && ev !== null && ev.event === 'token_withdraw' && ev.id === undefined
        && ev.data.seq === 3,
        { rawId: ef[0]?.id, ev });
    }

    // ===== 臂(2) 重连丢失撤回后 re-roll 不得拼接被拒草稿 =====
    {
      let lost = applyEvent(initialView, deltaEvent(1, 'verbatim')!);
      lost = applyEvent(lost, deltaEvent(2, '-copy')!);
      A('N-13 臂(2) 撤回丢失前缓冲为拒稿', lost.tokenBuffer?.text === 'verbatim-copy');
      // 模拟：撤回帧未达（不 apply withdraw），流关闭。
      const closed = onStreamClosed(lost);
      A('N-13 臂(2) 断流丢弃未权威预览（tokenBuffer 清空；已达撤回水位若有则保留）',
        closed.tokenBuffer === undefined
        && closed.connection === 'reconnecting'
        && closed.tokenWithdrawnByKey === lost.tokenWithdrawnByKey
        && streamingTextDisplay(closed, undefined) === undefined,
        { closedBuffer: closed.tokenBuffer, conn: closed.connection });
      const reroll = applyEvent(closed, deltaEvent(4, 'new-q')!);
      A('N-13 臂(2) 重连丢失撤回后同键更高 seq（re-roll）不得拼接被拒草稿',
        reroll.tokenBuffer?.text === 'new-q' && reroll.tokenBuffer?.maxSeq === 4
        && reroll.tokenBuffer?.text !== 'verbatim-copynew-q',
        { buffer: reroll.tokenBuffer });
    }
  }

  // ===== 臂(2) 驱动：runInterviewStream 跨重连，catch-up 不含撤回 =====
  {
    let opens = 0;
    const seenTexts: Array<string | undefined> = [];
    const open: StreamOpener = () => {
      opens += 1;
      if (opens === 1) {
        // 首连只收到拒稿 delta，随后干净结束——撤回帧丢失（不在本连接、也不在重连 catch-up）。
        return (async function* () { yield deltaFrame(1, 'verbatim') + deltaFrame(2, '-copy'); })();
      }
      // 重连：同键更高 seq 的 re-roll 必须单独成块（与权威帧分 chunk），否则 onView 只看到归约终态、
      // 拼接窗口会被同一 chunk 的 question_ready 清掉。report_ready 收尾（question 非终态，否则会重连到上限）。
      return (async function* () {
        yield deltaFrame(4, 'new-q');
        yield authorityFrame(1, 'question_ready', { question: 'new-q' });
        yield authorityFrame(2, 'report_ready', { overall: 80 });
      })();
    };
    const done = await runInterviewStream({
      open, onView: (v) => { seenTexts.push(v.tokenBuffer?.text); }, sleep: async () => {},
      maxTotalReconnects: 5,
    });
    A('N-13 臂(2) 驱动：重连丢失撤回后 re-roll 文本是 new-q，从不出现 verbatim-copynew-q',
      opens === 2
      && done.phase === 'report_ready'
      && seenTexts.includes('verbatim-copy')
      && seenTexts.includes('new-q')
      && !seenTexts.includes('verbatim-copynew-q')
      && done.tokenBuffer === undefined,
      { opens, seenTexts, phase: done.phase });
  }

  console.log(failures ? `\n✗ ${failures} 项失败` : '\n✓ TOKSTREAM S4b web token_delta 矩阵全部通过（纯函数·零模型外呼·actualSpendCny=null）');
  if (failures) process.exit(1);
}

void main();
