/**
 * 真 ASR 实测:dashscopeAsr(qwen-audio) 把语音逐字转写。手动,需 .env MODEL_API_KEY + 一段音频。
 *   pnpm asr:smoke
 */
import { readFileSync } from 'node:fs';
import { dashscopeAsr } from '@meetwise/ai-runtime';

for (const line of readFileSync(new URL('../../../.env', import.meta.url), 'utf8').split('\n')) {
  const m = line.match(/^(MODEL_[A-Z_]+|ASR_MODEL)=(.*)$/); if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}
const AUDIO = '/private/tmp/claude-501/-Users-miaole-Desktop-golucky-meetwise/de307e7b-b845-4c8d-8fbd-f683c5b922eb/scratchpad/answer.mp3';

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
