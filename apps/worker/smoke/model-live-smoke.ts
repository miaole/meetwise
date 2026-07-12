/**
 * 真模型连通性 smoke（手动跑,**非 CI gate**;需 .env 里的 MODEL_*)：用真 openAICompatibleClient 打一次百炼,
 * 验证 endpoint/key/JSON 输出贯通。仅发 benign "ping",不含任何 PII。
 *   pnpm model:smoke
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { openAICompatibleClient } from '@meetwise/ai-runtime';

// 载入 .env 的 MODEL_*(openAICompatibleClient 在构造时读 process.env)
for (const line of readFileSync(fileURLToPath(new URL('../../../.env', import.meta.url)), 'utf8').split('\n')) {
  const m = line.match(/^(MODEL_[A-Z_]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}

async function main() {
  console.log('endpoint:', process.env.MODEL_BASE_URL, '| model:', process.env.MODEL_NAME, '| key:', (process.env.MODEL_API_KEY ?? '').slice(0, 8) + '…(hidden)');
  const client = openAICompatibleClient();
  const res = await client.complete({
    service: 'smoke',
    system: '你只返回一个 JSON 对象 {"status":"ok"}，不要任何其它内容。',
    userData: 'ping',
  }, 1);
  console.log('result:', JSON.stringify(res));
  if (res.ok) { console.log('✓ 真模型贯通(endpoint+key+JSON 输出 OK)'); process.exit(0); }
  console.log('✗ 未贯通(', res.kind, ')——可能是 key 类型/endpoint/模型名或 json_object 不被支持'); process.exit(1);
}
main().catch((e) => { console.error('✗ 异常', e?.message ?? e); process.exit(1); });
