/**
 * 双向语音回路实测:真 TTS(qwen-tts) 合成问题 → 真 ASR(qwen-audio) 转写回来 → 文本应基本一致。
 * 证明**听到题→答→听到下一题**的完整语音回路两端都真。手动,需 .env MODEL_API_KEY。
 *   pnpm voice:loop
 */
import { readFileSync } from 'node:fs';
import { dashscopeTts, dashscopeAsr } from '@meetwise/ai-runtime';

for (const line of readFileSync(new URL('../../../.env', import.meta.url), 'utf8').split('\n')) {
  const m = line.match(/^(MODEL_[A-Z_]+|TTS_[A-Z_]+|ASR_MODEL)=(.*)$/); if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}

async function main() {
  const text = '滑动窗口和固定窗口的区别是什么';
  console.log('① 面试官问题(文本):', text);
  const audio = await dashscopeTts().synthesize(text);
  console.log('② 真 TTS(qwen-tts) 合成语音:', audio.length, 'bytes wav');
  const back = await dashscopeAsr().transcribe(audio, { format: 'wav' } as any);
  console.log('③ 真 ASR(qwen-audio) 转写回来:', back);
  const hit = ['滑动窗口', '固定窗口', '区别'].filter((w) => back.includes(w));
  console.log(`④ 关键词存活 ${hit.length}/3 (${hit.join('、')})`);
  const ok = audio.length > 1000 && hit.length >= 2;
  console.log(ok ? '✓ 双向语音回路打通:TTS 出声、ASR 听懂,两端皆真' : '⚠ 回路有损');
  process.exit(ok ? 0 : 1);
}
main().catch((e) => { console.error('✗', e?.message ?? e); process.exit(1); });
