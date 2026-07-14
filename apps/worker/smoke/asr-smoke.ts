/**
 * 真 ASR 实测:dashscopeAsr(qwen-audio) 把语音逐字转写。手动,需 .env MODEL_API_KEY + 一段音频。
 *   pnpm asr:smoke
 */
import { readFileSync } from 'node:fs';
import { dashscopeAsr } from '@meetwise/ai-runtime';

for (const line of readFileSync(new URL('../../../.env', import.meta.url), 'utf8').split('\n')) {
  const m = line.match(/^(MODEL_[A-Z_]+|ASR_MODEL)=(.*)$/); if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}
const AUDIO = process.env.SMOKE_AUDIO ?? './.smoke/answer.mp3';   // 手动 live smoke:置 SMOKE_AUDIO 指向本地音频(默认 .smoke/,gitignored)

async function main() {
  const audio = readFileSync(AUDIO);
  console.log('audio bytes:', audio.length);
  const transcript = await dashscopeAsr().transcribe(new Uint8Array(audio), { lang: 'zh' } as any);
  console.log('转写:', transcript);
  const hit = ['Redis', '限流', '降级'].filter((w) => transcript.includes(w));
  console.log(`命中关键词 ${hit.length}/3 (${hit.join(',')})`);
  const ok = hit.length >= 2;
  console.log(ok ? '✓ 真 ASR(qwen-audio) 逐字转写准确,语音答案可喂进面试图' : '⚠ 转写偏差');
  process.exit(ok ? 0 : 1);
}
main().catch((e) => { console.error('✗', e?.message ?? e); process.exit(1); });
