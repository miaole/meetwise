/** 流式语音证明(确定性,无 IO):增量 partial→final · barge-in 打断 TTS · 低延迟边播边出 · modality-agnostic。 pnpm vstream:prove */
import { fakeStreamingAsr, fakeStreamingTts, streamingVoiceTurn } from '../src/index.ts';
let fail = 0; const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };
async function* audio(n: number) { for (let i = 0; i < n; i++) yield new Uint8Array([i]); }
async function* delayedAudio(n: number, ms: number) { await new Promise((r) => setTimeout(r, ms)); yield* audio(n); }

async function main() {
  const ANS = '我用Redis计数器加滑动窗口实现限流';
  const deps = { asr: fakeStreamingAsr(ANS), tts: fakeStreamingTts(4) };

  // ① 正常:播完整问题 + 流式识别出 partial 再 final
  let ttsChunks = 0, partials = 0;
  let r = await streamingVoiceTurn(deps, '谈谈你的限流方案', delayedAudio(5, 10), { onTtsChunk: () => ttsChunks++, onPartial: () => partials++ });
  A('TTS 边播边出块(低延迟,多块)', ttsChunks > 1);
  A('ASR 出增量 partial(边说边出字)', partials >= 1 && r.partials === partials);
  A('final 转写正确,可喂图(modality-agnostic ≡ 文本答案)', r.transcript === ANS);

  // ② 全双工:ASR 与慢 TTS 同时启动。用户第一个 partial 到达时立即打断，不能等 AI 说完。
  let fullDuplexTtsChunks = 0, sawBarge = 0;
  const slowTts = {
    id: 'slow-tts',
    async *synthesizeStream(text: string, signal?: AbortSignal) {
      for (const ch of text) {
        if (signal?.aborted) return;
        fullDuplexTtsChunks++;
        yield new TextEncoder().encode(ch);
        await new Promise((x) => setTimeout(x, 5));
      }
    },
  };
  const rDuplex = await streamingVoiceTurn({ asr: fakeStreamingAsr(ANS), tts: slowTts }, '这是一段足够长的 AI 问题，用来验证用户开口时不会等待朗读结束。', audio(3), {
    onBargeIn: () => sawBarge++,
  });
  A('双向语音:ASR 首个增量到达即打断仍在播放的 TTS', rDuplex.ttsInterrupted && sawBarge === 1 && fullDuplexTtsChunks < 20);
  A('双向语音:被打断后 ASR 仍完整得到 final，不丢用户回答', rDuplex.transcript === ANS);

  // ③ 外部 VAD 可在 ASR 形成 partial 之前先打断。
  let chunks2 = 0;
  const r2 = await streamingVoiceTurn(deps, '一道很长很长很长很长很长的问题文本用来确保有多块', audio(3),
    { onTtsChunk: () => chunks2++, bargeIn: Promise.resolve() });   // 立即 barge-in
  A('barge-in:TTS 被打断(没播完)', r2.ttsInterrupted === true);
  A('打断后仍正常识别用户答(对话不断)', r2.transcript === ANS);

  console.log(`\n${fail === 0 ? '✓ streamingVoiceTurn fake-seam contract passed (not product stream ASR / E2E)' : '✗ ' + fail + ' 失败'}`);
  process.exit(fail === 0 ? 0 : 1);
}
main();
