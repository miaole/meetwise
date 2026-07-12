/** 真 WS 流式 TTS 实活 smoke(需 MODEL_API_KEY)。无 key 跳过。 MODEL_API_KEY=sk-... npx tsx packages/ai-runtime/test/tts-stream-live.mjs */
import { dashscopeStreamingTts } from '../src/voice-stream.ts';
if (!process.env.MODEL_API_KEY) { console.log('SKIP: 无 MODEL_API_KEY'); process.exit(0); }
let n = 0, bytes = 0;
for await (const c of dashscopeStreamingTts().synthesizeStream('请讲讲你的限流方案')) { n++; bytes += c.length; }
const ok = n >= 1 && bytes > 5000;
console.log(`${ok ? 'PASS' : 'FAIL'}  真 WS 流式 TTS:${n} 音频块 / ${bytes} 字节`);
process.exit(ok ? 0 : 1);
