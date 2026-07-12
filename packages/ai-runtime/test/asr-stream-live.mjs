/**
 * 真 WS 流式 ASR 实活 smoke(需 MODEL_API_KEY + 一段 PCM s16le 16k mono)。无 key/无音频则跳过。
 * 备料:say -v Tingting -o u.aiff "我用滑动窗口实现了分布式限流"; ffmpeg -i u.aiff -ar 16000 -ac 1 -f s16le /tmp/utt.pcm
 * 跑:MODEL_API_KEY=sk-... npx tsx packages/ai-runtime/test/asr-stream-live.mjs
 */
import { existsSync, readFileSync } from 'node:fs';
import { dashscopeStreamingAsr } from '../src/voice-stream.ts';
if (!process.env.MODEL_API_KEY || !existsSync('/tmp/utt.pcm')) { console.log('SKIP: 无 MODEL_API_KEY 或 /tmp/utt.pcm'); process.exit(0); }
const pcm = readFileSync('/tmp/utt.pcm');
async function* chunks() { for (let i = 0; i < pcm.length; i += 3200) { yield new Uint8Array(pcm.subarray(i, i + 3200)); await new Promise((r) => setTimeout(r, 80)); } }
let partials = 0, transcript = '';
for await (const ev of dashscopeStreamingAsr().transcribeStream(chunks())) { if (ev.final) transcript = ev.text; else partials++; }
const ok = partials >= 1 && transcript.length >= 4;
console.log(`${ok ? 'PASS' : 'FAIL'}  真 WS 流式 ASR:增量 ${partials} partial + final 转写「${transcript}」`);
process.exit(ok ? 0 : 1);
