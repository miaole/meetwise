/**
 * usage-estimate-threading.proof — 派发前保守估算穿过关口(complete → usage.estimateInputTokens)与请求摘要含 rag 的承重证明。
 * 纯 fake transport,无 DB / 无真模型。断言:
 *   (1) complete 返回 usage.estimateInputTokens = planContextBudget 的 inputTokens(byteEstimate 字节上界);
 *   (2) 带 rag / 带图片的请求同样带回估算(分账/图片 reserve 都计入);
 *   (3) 估算 ≤ maxInputTokens(保守上界不越预算);
 *   (4) 请求摘要含 rag:同 key 换检索素材 → digest 变化(幂等不误判"重放"而返回旧结果);
 *   (5) 供应商未上报 usage → usage=undefined(不伪造对账证据,交给 invoke 保守封顶 fallback)。
 */
import { openAICompatibleClient, planContextBudget, modelFor, type ModelCostPolicy } from '../src/index.ts';

let failures = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };

// BAILIAN-04: fake transport 注入需测试专用 override 缝（NODE_ENV=test + MODEL_TEST_TRANSPORT_OVERRIDES=1）。
process.env.NODE_ENV = 'test';
process.env.MODEL_TEST_TRANSPORT_OVERRIDES = '1';

const policy: ModelCostPolicy = {
  scopeId: 'usage-estimate-proof', provider: 'proof', model: 'proof-model', region: 'cn-proof', priceRevision: 'r1',
  maxInputTokens: 200_000, maxOutputTokens: 8_000, contextWindowTokens: 200_000,
  contextEstimator: 'utf8-bytes-v1', contextSafetyMarginTokens: 1_000,
};

async function main() {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async () => new Response(JSON.stringify({
    choices: [{ message: { content: JSON.stringify({ ok: true }) } }],
    usage: { prompt_tokens: 1234, completion_tokens: 56 },
  }), { status: 200, headers: { 'content-type': 'application/json' } })) as typeof fetch;
  try {
    const client = openAICompatibleClient({ baseUrl: 'https://model.invalid', apiKey: 'test-only', model: policy.model, costPolicy: policy });

    const req = { service: 'proof.estimate', system: '系统指令', userData: '用户答案' };
    const planned = planContextBudget(req, policy);
    const result = await client.complete(req, 1);
    A('complete 返回 usage.estimateInputTokens = planContextBudget 的字节上界',
      planned.ok && result.ok && result.usage?.estimateInputTokens === planned.plan.inputTokens);
    A('估算 ≤ maxInputTokens(保守上界不越预算)',
      planned.ok && result.ok && result.usage?.estimateInputTokens !== undefined && result.usage.estimateInputTokens <= policy.maxInputTokens);

    const ragReq = { service: 'proof.estimate-rag', system: 's', userData: 'u', rag: '[UNTRUSTED_RESEARCH_SOURCE]不可信素材' };
    const ragPlanned = planContextBudget(ragReq, policy);
    const ragResult = await client.complete(ragReq, 1);
    A('带 rag 请求带回估算且含 RAG 分账', ragPlanned.ok && ragResult.ok
      && ragResult.usage?.estimateInputTokens === ragPlanned.plan.inputTokens && ragPlanned.plan.ragTokens > 0);

    const imgPolicy = { ...policy, imageInputTokensPerImage: 1024 };
    const imgClient = openAICompatibleClient({ baseUrl: 'https://model.invalid', apiKey: 'test-only', model: policy.model, costPolicy: imgPolicy });
    const imgReq = { service: 'proof.estimate-img', system: 's', userData: 'u', images: ['https://img.invalid/a.png'] };
    const imgPlanned = planContextBudget(imgReq, imgPolicy);
    const imgResult = await imgClient.complete(imgReq, 1);
    A('带图片请求带回估算且含图片 reserve', imgPlanned.ok && imgResult.ok
      && imgResult.usage?.estimateInputTokens === imgPlanned.plan.inputTokens && imgPlanned.plan.imageReserveTokens === 1024);

    // 请求摘要含 rag:同 service/system/userData,仅 rag 不同 → digest 必须不同(否则幂等误判重放)。
    const d1 = modelFor(client, { service: 'proof.digest', system: 's', userData: 'u', rag: '素材A' }).requestDigest;
    const d2 = modelFor(client, { service: 'proof.digest', system: 's', userData: 'u', rag: '素材B' }).requestDigest;
    const d3 = modelFor(client, { service: 'proof.digest', system: 's', userData: 'u' }).requestDigest;
    A('请求摘要含 rag:换检索素材 → digest 变化(幂等不误判重放)', d1 !== d2 && d1 !== d3 && d2 !== d3);

    // 供应商未上报 usage → usage=undefined(不伪造对账证据)。
    globalThis.fetch = (async () => new Response(JSON.stringify({
      choices: [{ message: { content: JSON.stringify({ ok: true }) } }],
    }), { status: 200, headers: { 'content-type': 'application/json' } })) as typeof fetch;
    const noUsageResult = await client.complete(req, 1);
    A('供应商未上报 usage → usage=undefined(交给 invoke 保守封顶 fallback)', noUsageResult.ok && noUsageResult.usage === undefined);
  } finally {
    globalThis.fetch = originalFetch;
  }
  console.log(`\n${failures === 0 ? '✓ usage 估算穿线 + 摘要含 rag 全部通过' : `✗ ${failures} 失败`}`);
  process.exit(failures === 0 ? 0 : 1);
}
void main();
