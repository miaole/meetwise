/**
 * F1/F2 部署回归证明：compose.prod.yml 的 worker 环境必须携带完整备份计费字段，
 * 使得 `resolveModelCostGovernance()`（worker 启动路径）用 compose 解析出的 worker
 * env 字面量运行时不抛 `model_cost_invalid_model_backup_billing_*`。
 *
 * 背景（BAILIAN 双审计致命项）：`docker/compose.prod.yml` 的 worker 块曾只挂
 * `MODEL_BACKUP_API_KEY` + 名称，而把 `MODEL_BACKUP_*` / `MODEL_FAST_BACKUP_*` 计费字段
 * 只写在 `x-migration-env`（供 migrate 服务写账本）。结果是 `isTextBackupEnabled()`
 * 因备份 Key 挂载而返回 true → `endpoint('MODEL_BACKUP')` 读不到 `MODEL_BACKUP_BILLING_MODEL`
 * → worker 启动即抛。deploy-check 的旧正则扫整个文件，被 x-migration-env 满足，从不查
 * worker 块，于是该致命缺陷假绿。
 *
 * 本证明从 compose 文本里解析出 worker 合并环境（cloud-runtime-env + worker-native-model-env
 * + worker 块自身）的键集合，然后：① 断言备份计费字段必须在 worker 块/锚里声明；② 用
 * 这些键构造字面量 env 复现修复前的启动抛错；③ 用修复后的完整字面量证明不再抛、且
 * 两个备份费用策略都被加载。无网络、无 DB、无真实凭据。
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolveModelCostGovernance } from '../src/model-cost-governance.ts';

let failures = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };

const composePath = fileURLToPath(new URL('../../../docker/compose.prod.yml', import.meta.url));
const compose = readFileSync(composePath, 'utf8');

/** 从 compose 文本中截取一个块（start 匹配首行，end 是该块之后下一个块的标记）。 */
function blockBetween(startMarker: string, endMarker: string): string {
  const start = compose.indexOf(startMarker);
  if (start < 0) return '';
  const from = compose.indexOf('\n', start) + 1;
  const end = compose.indexOf(endMarker, from);
  if (end < 0) return compose.slice(from);
  // 回退到 end 块标记所在行的行首，避免把 end 块自身的行吞进来。
  return compose.slice(from, compose.lastIndexOf('\n', end));
}

/** 解析一个 YAML 映射块里所有 `KEY:` 行（只认大写 env 名；跳过注释与 `<<:` 合并行）。 */
function parseEnvKeys(block: string): Set<string> {
  const keys = new Set<string>();
  for (const line of block.split('\n')) {
    const m = line.match(/^\s+([A-Z][A-Z0-9_]*)\s*:/);
    const key = m?.[1];
    if (key) keys.add(key);
  }
  return keys;
}

// 与 deploy-check 同一套锚点：worker 合并环境 = cloud-runtime-env + worker-native-model-env + worker 块自身。
const cloudRuntimeEnv = blockBetween('x-cloud-runtime-env: &cloud-runtime-env', 'x-worker-native-model-env:');
const workerNativeModelEnv = blockBetween('x-worker-native-model-env: &worker-native-model-env', 'x-migration-env:');
const workerBlock = blockBetween('  worker:', '  prometheus:');
const declared = new Set<string>([
  ...parseEnvKeys(cloudRuntimeEnv),
  ...parseEnvKeys(workerNativeModelEnv),
  ...parseEnvKeys(workerBlock),
]);

/** resolveModelCostGovernance 需要的、且必须由 worker 合并环境声明的完整键集合（值即修复后的字面量）。 */
function endpointValues(prefix: string, model: string): Record<string, string> {
  return {
    [`${prefix}_BILLING_PROVIDER`]: 'dashscope',
    [`${prefix}_BILLING_MODEL`]: model,
    [`${prefix}_BILLING_REGION`]: 'cn-beijing',
    [`${prefix}_PRICE_REVISION`]: '2026-08-03-r1',
    [`${prefix}_INPUT_MICRO_CNY_PER_MILLION`]: '1000000',
    [`${prefix}_OUTPUT_MICRO_CNY_PER_MILLION`]: '2000000',
    [`${prefix}_PRICE_SOURCE_URL`]: 'https://help.aliyun.com/zh/model-studio/example',
    [`${prefix}_MAX_INPUT_TOKENS`]: '16000',
    [`${prefix}_MAX_OUTPUT_TOKENS`]: '4000',
    [`${prefix}_CONTEXT_WINDOW_TOKENS`]: '32768',
    [`${prefix}_CONTEXT_ESTIMATOR`]: 'utf8-bytes-v1',
    [`${prefix}_CONTEXT_SAFETY_MARGIN_TOKENS`]: '512',
  };
}

const literal: NodeJS.ProcessEnv = {
  NODE_ENV: 'production',
  MODEL_COST_ENFORCEMENT: 'enforce',
  MODEL_COST_BUDGET_SCOPE: 'model-inference-prod',
  MODEL_COST_MONTHLY_BUDGET_MICRO_CNY: '100000000',
  MODEL_NAME: 'qwen-plus',
  MODEL_FAST_NAME: 'qwen-turbo',
  MODEL_BACKUP_NAME: 'qwen-plus-backup',
  MODEL_FAST_BACKUP_NAME: 'qwen-turbo-backup',
  // 备用端点的启用开关（isTextBackupEnabled）只看 Key 是否挂载；这是 worker 块原本就有的。
  MODEL_BACKUP_API_KEY: 'backup-key-proof-only',
  ...endpointValues('MODEL_PRIMARY', 'qwen-plus'),
  ...endpointValues('MODEL_FAST', 'qwen-turbo'),
  ...endpointValues('MODEL_BACKUP', 'qwen-plus-backup'),
  ...endpointValues('MODEL_FAST_BACKUP', 'qwen-turbo-backup'),
};

function main() {
  // ① worker 合并环境必须声明 resolveModelCostGovernance 所需的每一个键。
  //   这是 F2 的块级断言在证明层的等价物：任何键缺失都会在这里 FAIL，而非等启动才炸。
  const missing = Object.keys(literal).filter((key) => !declared.has(key));
  A('compose worker 合并环境声明了 resolveModelCostGovernance 所需的全部计费/模型字段',
    missing.length === 0);
  if (missing.length) console.log(`      缺失: ${missing.join(', ')}`);

  // ② 修复前复现：备份 Key 挂载但备份计费字段缺失 → 启动必抛。
  //    证明本文件真能抓到 F1 那个致命缺陷，而非凭空断言。
  const beforeFix = { ...literal };
  for (const key of Object.keys(beforeFix)) {
    if (key.startsWith('MODEL_BACKUP_BILLING_') || key.startsWith('MODEL_FAST_BACKUP_BILLING_')) delete beforeFix[key];
  }
  let beforeError = 'no_error';
  try { resolveModelCostGovernance(beforeFix); } catch (error) { beforeError = error instanceof Error ? error.message : String(error); }
  A('修复前 worker env（有备份 Key 无备份计费）抛出精确的 model_cost_invalid_model_backup_billing_model',
    beforeError === 'model_cost_invalid_model_backup_billing_model');

  // ③ 修复后：compose 解析出的 worker 字面量 env 不再抛，且两个备份费用策略都被加载。
  let after: ReturnType<typeof resolveModelCostGovernance> | undefined;
  let afterError = 'no_error';
  try { after = resolveModelCostGovernance(literal); } catch (error) { afterError = error instanceof Error ? error.message : String(error); }
  A('修复后 compose 解析出的 worker env 运行 resolveModelCostGovernance 不抛', afterError === 'no_error');
  A('修复后加载 primary/fast + backup/fastBackup 四条受限费用策略',
    after !== undefined && after.priceRows.length === 4
    && after.policies.primary?.model === 'qwen-plus'
    && after.policies.fastPrimary?.model === 'qwen-turbo'
    && after.policies.backup?.model === 'qwen-plus-backup'
    && after.policies.fastBackup?.model === 'qwen-turbo-backup');

  console.log(`\n${failures === 0 ? '✓ 部署 worker 环境费用治理回归证明全部通过' : `✗ ${failures} 项失败`}`);
  process.exit(failures === 0 ? 0 : 1);
}

main();
