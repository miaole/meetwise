/**
 * RMS endpointing determinism prove (pure, zero IO, zero provider).
 * 语音端点检测(第三刀·服务端 turn-taking):滑动窗 RMS 纯确定性判 end_of_turn——
 * 见语音→连续静音 N 帧恰一切回合;未见语音纯静音永不切;说话→短停→再说话只切一次;
 * 字节跨块奇数对齐;withRmsEndOfTurn 触发即收流(上游 for-await finally 关闭)。
 * 这是纯函数合同,不是真机声学、产品 E2E 或生产 SLO。pnpm -C packages/ai-runtime prove:voice-endpointing
 */
import {
  createRmsEndpointer, rmsOf, withRmsEndOfTurn,
  RMS_ENDPOINTING_DEFAULTS, type RmsEndpointEvent, type RmsEndpointingConfig,
} from '../src/index.ts';

let fail = 0; const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };

/** 定幅正弦 int16 帧(纯确定性):振幅 amp 的 RMS ≈ amp/√2。 */
function toneFrame(frameSamples: number, amp: number): Int16Array {
  const f = new Int16Array(frameSamples);
  for (let i = 0; i < frameSamples; i++) f[i] = Math.round(amp * Math.sin((2 * Math.PI * i) / frameSamples));
  return f;
}
function silenceFrame(frameSamples: number): Int16Array { return new Int16Array(frameSamples); }
function frames(kind: 'tone' | 'silence', n: number, frameSamples = 480, amp = 2000): Int16Array[] {
  return Array.from({ length: n }, () => (kind === 'tone' ? toneFrame(frameSamples, amp) : silenceFrame(frameSamples)));
}
function feedAll(ep: ReturnType<typeof createRmsEndpointer>, fs: Int16Array[]) {
  return fs.flatMap((f) => ep.feedFrame(f));
}
const events = (fs: Int16Array[], cfg?: RmsEndpointingConfig) => { const ep = createRmsEndpointer(cfg); return { ep, ev: feedAll(ep, fs) }; };

async function main() {
  const F = RMS_ENDPOINTING_DEFAULTS.frameSamples;

  // ① 纯 RMS 数学:静音=0,定幅正弦≈amp/√2(±5%),空帧=0。
  A('① rmsOf:静音帧=0·正弦帧≈amp/√2·空帧=0',
    rmsOf(silenceFrame(F)) === 0
    && Math.abs(rmsOf(toneFrame(F, 2000)) - 2000 / Math.SQRT2) < 2000 / Math.SQRT2 * 0.05
    && rmsOf(new Int16Array(0)) === 0);

  // ② 语音→静音:恰在 silenceFramesToEndTurn 帧后一次 end_of_turn;speech_started 恰一次。
  const N = RMS_ENDPOINTING_DEFAULTS.silenceFramesToEndTurn;
  const { ep, ev } = events([...frames('tone', 6), ...frames('silence', N + 5)]);
  const starts = ev.filter((e) => e.type === 'speech_started');
  const ends = ev.filter((e) => e.type === 'end_of_turn');
  A('② 见语音(6 帧)→连续静音:第 N 静音帧恰发一次 end_of_turn(speech_started 恰一次)',
    starts.length === 1 && ends.length === 1
    && (ends[0] as { frame: number }).frame === 6 + N
    && (ends[0] as { silenceFrames: number }).silenceFrames === N
    && (ends[0] as { speechFrames: number }).speechFrames === 6
    && ep.ended === true && ep.speechFrames === 6);
  A('② ended 后继续喂帧零新事件(sticky 收口)', feedAll(ep, frames('tone', 3)).length === 0);

  // ③ 未见语音:纯静音任意长永不切回合(纯静音房间不空切)。
  const { ev: evSilence } = events(frames('silence', 500));
  A('③ 纯静音 500 帧零 end_of_turn(必须先见语音)', evSilence.filter((e) => e.type === 'end_of_turn').length === 0);

  // ④ 短停顿不切:说话→静音(<N)→再说话→静音(≥N) 才切一次;且停顿重置静音计数。
  const { ev: evResume } = events([...frames('tone', 5), ...frames('silence', N - 1), ...frames('tone', 5), ...frames('silence', N + 3)]);
  const endsResume = evResume.filter((e) => e.type === 'end_of_turn');
  A('④ 说话→短停(N-1)→再说话→静音≥N:恰一次 end_of_turn 且不在第一次停顿内',
    endsResume.length === 1 && (endsResume[0] as { frame: number }).frame === 5 + (N - 1) + 5 + N);

  // ⑤ minSpeechFrames 门:仅 1-2 帧语音+长静音不切(咳嗽/click 不空切);恰 3 帧语音可切。
  const { ev: evWeak } = events([...frames('tone', 2), ...frames('silence', N + 10)]);
  const { ev: evStrong } = events([...frames('tone', 3), ...frames('silence', N + 10)]);
  A('⑤ minSpeechFrames=3:2 帧语音+长静音零切·3 帧语音恰切一次',
    evWeak.filter((e) => e.type === 'end_of_turn').length === 0
    && evStrong.filter((e) => e.type === 'end_of_turn').length === 1);

  // ⑥ 字节流对齐:奇数偏移切块喂 feed() → 帧边界跨块精确重组,事件序列与整块喂完全一致。
  const toneBytes = [...frames('tone', 6), ...frames('silence', N + 2)].flatMap((f) => Array.from(new Uint8Array(f.buffer, 0, f.byteLength)));
  const all = new Uint8Array(toneBytes);
  const aligned = createRmsEndpointer();
  const alignedEv = aligned.feed(all);
  const oddEv: RmsEndpointEvent[] = [];
  {
    const odd = createRmsEndpointer();
    let offset = 0;
    const cuts = [1, 7, 993, 4096];                       // 首块奇数长度制造跨块奇样本
    let ci = 0;
    while (offset < all.byteLength) {
      const step = ci < cuts.length ? cuts[ci]! : 1009;   // 全奇数块长
      ci++;
      oddEv.push(...odd.feed(all.subarray(offset, Math.min(offset + step, all.byteLength))));
      offset += step;
    }
  }
  const oddEnds = oddEv.filter((e) => e.type === 'end_of_turn');
  const alignedEnds = alignedEv.filter((e) => e.type === 'end_of_turn');
  A('⑥ 奇数字节切块跨块重组:帧边界精确·end_of_turn 帧号与整块喂一致',
    alignedEnds.length === 1 && oddEnds.length === 1
    && (oddEnds[0] as { frame: number }).frame === (alignedEnds[0] as { frame: number }).frame);

  // ⑦ withRmsEndOfTurn:字节流收口——触发帧所在块仍转发(ASR 听全尾音),其后上游关闭(finally 置位,不悬挂)。
  {
    let upstreamClosed = false as boolean;               // boolean 宽化:闭包内置位不被 CFA 收窄
    let yielded = 0;
    const chunkBytes = 3200;                              // 产品 PCM 块形(100ms@16k)
    const pcm = [...frames('tone', 6), ...frames('silence', N + 2)];
    const raw = new Uint8Array(pcm.reduce((n, f) => n + f.byteLength, 0));
    let off = 0;
    for (const f of pcm) { raw.set(new Uint8Array(f.buffer, 0, f.byteLength), off); off += f.byteLength; }
    async function* upstream() {
      try {
        for (let o = 0; o < raw.byteLength; o += chunkBytes) yield raw.subarray(o, Math.min(o + chunkBytes, raw.byteLength));
      } finally { upstreamClosed = true; }
    }
    const seen: Uint8Array[] = [];
    for await (const c of withRmsEndOfTurn(upstream())) { seen.push(c); yielded++; }
    const endByte = (6 + N) * F * 2;                      // end_of_turn 帧结束字节
    const expectedYields = Math.ceil(endByte / chunkBytes);   // 触发帧所在块仍转发,其后静音尾块不再转发
    A('⑦ withRmsEndOfTurn:end_of_turn 后收流(上游 finally 关闭·尾部静音块不转发·语音块全转发)',
      upstreamClosed === true && yielded === expectedYields
      && seen.slice(0, Math.ceil((6 * F * 2) / chunkBytes)).every((c) => c.byteLength > 0));
  }

  // ⑧ 确定性:同输入两次喂→事件序列逐项相等;config 非法 fail-closed。
  const a = events([...frames('tone', 4), ...frames('silence', N)]);
  const b = events([...frames('tone', 4), ...frames('silence', N)]);
  let cfgErr = 'no_error';
  try { createRmsEndpointer({ silenceFramesToEndTurn: 0 }); } catch (e) { cfgErr = e instanceof Error ? e.message : String(e); }
  A('⑧ 确定性复现+非法 config fail-closed(rms_endpointing_config_invalid)',
    JSON.stringify(a.ev) === JSON.stringify(b.ev) && cfgErr === 'rms_endpointing_config_invalid');

  // ⑨ 自定义形:8k 采样率/20ms 帧/静音阈 60/N=2 数学换算正确(frameSamples=160)。
  const { ev: ev8k } = events([...frames('tone', 2, 160, 900), ...frames('silence', 2, 160)], { sampleRate: 8000, frameMs: 20, silenceRms: 60, silenceFramesToEndTurn: 2, minSpeechFrames: 2 });
  const end8k = ev8k.find((e) => e.type === 'end_of_turn') as { frame: number } | undefined;
  A('⑨ 自定义 config:8k/20ms→frameSamples=160·N=2 恰第 4 帧切', end8k?.frame === 4);

  console.log(`\n${fail === 0 ? '✓ RMS endpointing determinism passed (pure contract; not real-mic acoustics / product E2E)' : '✗ ' + fail + ' failed'}`);
  process.exit(fail === 0 ? 0 : 1);
}
void main();
