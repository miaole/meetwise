import { modelCostPriceBindings, resolveModelCostGovernance, verifyModelCostGovernance } from '../src/model-cost-governance.ts';

let failures = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };
const fails = (env: NodeJS.ProcessEnv, expected: string) => {
  try { resolveModelCostGovernance(env); return false; } catch (e) { return String((e as Error).message) === expected; }
};
const endpoint = (prefix: string, model: string) => ({
  [`${prefix}_BILLING_PROVIDER`]: 'dashscope',
  [`${prefix}_BILLING_MODEL`]: model,
  [`${prefix}_BILLING_REGION`]: 'cn-beijing',
  [`${prefix}_PRICE_REVISION`]: '2026-08-03-r1',
  [`${prefix}_INPUT_MICRO_CNY_PER_MILLION`]: '1000000',
  [`${prefix}_OUTPUT_MICRO_CNY_PER_MILLION`]: '2000000',
  [`${prefix}_PRICE_SOURCE_URL`]: 'https://example.test/pricing',
  [`${prefix}_MAX_INPUT_TOKENS`]: '16000',
  [`${prefix}_MAX_OUTPUT_TOKENS`]: '4000',
  [`${prefix}_CONTEXT_WINDOW_TOKENS`]: '32768',
  [`${prefix}_CONTEXT_ESTIMATOR`]: 'utf8-bytes-v1',
  [`${prefix}_CONTEXT_SAFETY_MARGIN_TOKENS`]: '512',
});
const base = {
  NODE_ENV: 'production', MODEL_COST_ENFORCEMENT: 'enforce', MODEL_COST_BUDGET_SCOPE: 'model-prod', MODEL_COST_MONTHLY_BUDGET_MICRO_CNY: '100000000',
  MODEL_NAME: 'qwen-plus', MODEL_FAST_NAME: 'qwen-turbo',
  ...endpoint('MODEL_PRIMARY', 'qwen-plus'), ...endpoint('MODEL_FAST', 'qwen-turbo'),
} as NodeJS.ProcessEnv;

A('生产不能 observation-only 启动', fails({ NODE_ENV: 'production', MODEL_COST_ENFORCEMENT: 'observe' }, 'model_cost_enforcement_required_in_production'));
A('生产缺模型价格、预算或上下文上限配置即拒绝启动', fails({ NODE_ENV: 'production', MODEL_COST_ENFORCEMENT: 'enforce' }, 'model_cost_invalid_model_cost_budget_scope'));
A('价格条目必须绑定实际 primary 模型，不能记错模型名', fails({ ...base, MODEL_PRIMARY_BILLING_MODEL: 'other' }, 'model_cost_model_binding_mismatch:model_primary'));
A('模型窗口不足以容纳输入、输出和安全余量时拒绝启动', fails({ ...base, MODEL_PRIMARY_CONTEXT_WINDOW_TOKENS: '20000' }, 'model_cost_invalid_model_primary_context_budget'));
const parsed = resolveModelCostGovernance(base);
A('生产配置生成 primary 与 fast 两个受限费用策略', parsed.mode === 'enforce' && parsed.priceRows.length === 2 && parsed.policies.primary?.model === 'qwen-plus' && parsed.policies.fastPrimary?.model === 'qwen-turbo');
const backup = resolveModelCostGovernance({
  ...base, MODEL_BACKUP_BASE_URL: 'https://backup.example.test', MODEL_BACKUP_API_KEY: 'backup-test-only', MODEL_BACKUP_NAME: 'qwen-plus-backup', MODEL_FAST_BACKUP_NAME: 'qwen-turbo-backup',
  ...endpoint('MODEL_BACKUP', 'qwen-plus-backup'), ...endpoint('MODEL_FAST_BACKUP', 'qwen-turbo-backup'),
});
A('启用备用端点时，两个备用模型均须有独立费率且被加载', backup.priceRows.length === 4 && backup.policies.backup?.model === 'qwen-plus-backup' && backup.policies.fastBackup?.model === 'qwen-turbo-backup');
A('配置备用 endpoint 但没有备用 Key 时在启动前拒绝',
  fails({ ...base, MODEL_BACKUP_BASE_URL: 'https://backup.example.test', MODEL_BACKUP_NAME: 'qwen-plus-backup', MODEL_FAST_BACKUP_NAME: 'qwen-turbo-backup',
    ...endpoint('MODEL_BACKUP', 'qwen-plus-backup'), ...endpoint('MODEL_FAST_BACKUP', 'qwen-turbo-backup') },
  'model_cost_invalid_model_backup_api_key'));

const bindings = modelCostPriceBindings(parsed);
A('运行时价格校验派生完整的 provider/model/region/revision/rate/source 绑定', bindings.length === 2
  && bindings.every((binding) => binding.scopeId === 'model-prod' && binding.priceRevision === '2026-08-03-r1'
    && binding.inputMicroCnyPerMillion === 1000000 && binding.outputMicroCnyPerMillion === 2000000));
let checked = 0;
await verifyModelCostGovernance({} as any, parsed, async (binding) => {
  checked++;
  return binding.model !== 'qwen-turbo';
}).then(() => false, (error) => String((error as Error).message) === 'model_cost_price_binding_not_provisioned:qwen-turbo')
  .then((failedClosed) => A('任一精确价格行缺失时 worker 在启动消费者前 fail-closed', failedClosed && checked === 2));

console.log(failures ? `\n✗ ${failures} 项失败` : '\n✓ 模型费用生产配置门禁全部通过');
process.exit(failures ? 1 : 0);
