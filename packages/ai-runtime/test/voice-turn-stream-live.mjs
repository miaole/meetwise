/** 集成 capstone:完整真流式语音面试回合(真TTS问+真ASR听→转写)。需 MODEL_API_KEY + /tmp/utt.pcm。无则跳过。
 *  MODEL_API_KEY=sk-... npx tsx packages/ai-runtime/test/voice-turn-stream-live.mjs */
import { readFileSync, existsSync } from 'node:fs';
import { dashscopeStreamingAsr, dashscopeStreamingTts, streamingVoiceTurn } from '../src/voice-stream.ts';
if (!process.env.MODEL_API_KEY || !existsSync('/tmp/utt.pcm')) { console.log('SKIP: 无 MODEL_API_KEY 或 /tmp/utt.pcm'); process.exit(0); }
const pcm = readFileSync('/tmp/utt.pcm');
async function* answerAudio() { for (let i = 0; i < pcm.length; i += 3200) { yield new Uint8Array(pcm.subarray(i, i + 3200)); await new Promise(r => setTimeout(r, 70)); } }
let ttsChunks = 0, partials = 0;
const r = await streamingVoiceTurn({ asr: dashscopeStreamingAsr(), tts: dashscopeStreamingTts() }, '请讲讲你的分布式限流方案', answerAudio(), { onTtsChunk: () => ttsChunks++, onPartial: () => partials++ });
const ok = ttsChunks > 1 && partials >= 1 && r.transcript.length >= 4;
console.log(`${ok ? 'PASS' : 'FAIL'}  真流式语音回合:TTS问${ttsChunks}块→ASR听${partials}partial→转写「${r.transcript}」`);
process.exit(ok ? 0 : 1);
