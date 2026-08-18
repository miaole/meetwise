/** 费用治理启动门：开发可观察，生产缺任一价格/预算字段必须拒绝启动。 */
import { resolveRagCostGovernance } from '../src/rag-cost-governance.ts';

let failures = 0;
const check = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };
const fails = (env: NodeJS.ProcessEnv, code: string) => {
  try { resolveRagCostGovernance(env); return false; } catch (error) { return String(error).includes(code); }
};

const development = resolveRagCostGovernance({ NODE_ENV: 'development' });
check('开发默认 observe，保留本地样例可运行性', development.mode === 'observe' && development.maxInputTokens === 16_000);
check('生产不能以 observe 启动', fails({ NODE_ENV: 'production', RAG_COST_ENFORCEMENT: 'observe' }, 'rag_cost_enforcement_required_in_production'));
check('生产缺价格表或月度预算配置即拒绝启动', fails({ NODE_ENV: 'production', RAG_COST_ENFORCEMENT: 'enforce' }, 'rag_cost_invalid_provider'));
const production = resolveRagCostGovernance({
  NODE_ENV: 'production', RAG_COST_ENFORCEMENT: 'enforce', RAG_EMBED_MAX_INPUT_TOKENS: '16000',
  RAG_EMBED_BILLING_PROVIDER: 'dashscope', RAG_EMBED_BILLING_MODEL: 'text-embedding-v4', RAG_EMBED_BILLING_REGION: 'cn-beijing',
  RAG_EMBED_PRICE_REVISION: '2026-08-03', RAG_EMBED_INPUT_MICRO_CNY_PER_MILLION: '500000',
  RAG_EMBED_PRICE_SOURCE_URL: 'https://help.aliyun.com/zh/model-studio/text-embedding-v4',
  RAG_EMBED_MONTHLY_BUDGET_MICRO_CNY: '100000000', RAG_EMBED_BUDGET_SCOPE: 'rag-embedding-prod',
});
check('生产只有完整的价格 revision、硬预算、输入上界时才进入 enforce', production.mode === 'enforce'
  && production.maxInputTokens === 16_000 && production.inputMicroCnyPerMillion === 500_000 && production.monthlyBudgetMicroCny === 100_000_000);

console.log(`\n${failures === 0 ? '✓ RAG 费用治理启动门全部通过' : `✗ ${failures} 项失败`}`);
process.exit(failures === 0 ? 0 : 1);
