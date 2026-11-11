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
 *
 * G4 / #247（PR #238）隐私擦除 worker 启动与编排契约也并入本文件，避免再新增受管
 * `.ts` 触顶 public-text-policy `MAX_FILES=2530`（PTP_FILE_LIMIT）。原独立
 * `privacy-worker-runtime.proof.ts` 已删除；`prove:privacy-worker-runtime` 指向本文件。
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveModelCostGovernance } from '../src/model-cost-governance.ts';
import { initializePrivacyWorkerStartup } from '../src/privacy-worker-runtime.ts';
const MEETWISE_TEST_FIXTURE_MODEL_BACKUP_API_KEY_DWE = 'backup-key-proof-only';


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
  MODEL_BACKUP_API_KEY: MEETWISE_TEST_FIXTURE_MODEL_BACKUP_API_KEY_DWE,
  ...endpointValues('MODEL_PRIMARY', 'qwen-plus'),
  ...endpointValues('MODEL_FAST', 'qwen-turbo'),
  ...endpointValues('MODEL_BACKUP', 'qwen-plus-backup'),
  ...endpointValues('MODEL_FAST_BACKUP', 'qwen-turbo-backup'),
};

async function assertPrivacyWorkerG4(): Promise<void> {
  /* eslint-disable @typescript-eslint/naming-convention -- env keys are documented names */
  const repoRoot = fileURLToPath(new URL('../../..', import.meta.url)).replace(/[/\\]+$/, '');
  const composeText = readFileSync(new URL('../../../docker/compose.prod.yml', import.meta.url), 'utf8');
  const workerExample = readFileSync(new URL('../../../docker/env/worker.env.example', import.meta.url), 'utf8');
  const haCompose = readFileSync(new URL('../../../docker/compose.ha.yml', import.meta.url), 'utf8');
  const migrateExample = readFileSync(new URL('../../../docker/env/migrate.env.example', import.meta.url), 'utf8');
  const deleteController = readFileSync(new URL('../../api/src/modules/privacy/privacy.controller.ts', import.meta.url), 'utf8');
  const deleteService = readFileSync(new URL('../../api/src/modules/privacy/privacy.service.ts', import.meta.url), 'utf8');
  const workerSection = composeText.match(/^  worker:\n([\s\S]*?)(?=^  web:)/m)?.[1] ?? '';
  const apiSection = composeText.match(/^  api:\n([\s\S]*?)(?=^  worker:)/m)?.[1] ?? '';
  const migrationEnvBlock = composeText.match(/^x-migration-env: &migration-env\n([\s\S]*?)(?=^services:)/m)?.[1] ?? '';

  type FakePool = { end: () => Promise<void>; id: string };
  const unusedDeps = {
    createPool: () => { throw new Error('createPool_should_not_run'); },
    assertIdentity: async () => { throw new Error('assertIdentity_should_not_run'); },
  };

  A('G4 非生产且未配置 URL 时返回 undefined，不建池', await initializePrivacyWorkerStartup({}, unusedDeps) === undefined);
  A('G4 development 缺 URL 仍返回 undefined（本地可无专用登录启动）',
    await initializePrivacyWorkerStartup({ NODE_ENV: 'development' }, unusedDeps) === undefined);

  let productionError: unknown;
  try { await initializePrivacyWorkerStartup({ NODE_ENV: 'production' }, unusedDeps); } catch (error) { productionError = error; }
  A('G4 production 缺 URL 以 privacy_worker_database_url_missing 失败关闭',
    productionError instanceof Error && productionError.message === 'privacy_worker_database_url_missing');

  let mixedCaseError: unknown;
  try { await initializePrivacyWorkerStartup({ NODE_ENV: 'Production' }, unusedDeps); } catch (error) { mixedCaseError = error; }
  A('G4 NODE_ENV=Production（大小写混合）缺 URL 同样失败关闭',
    mixedCaseError instanceof Error && mixedCaseError.message === 'privacy_worker_database_url_missing');

  let blankError: unknown;
  try {
    await initializePrivacyWorkerStartup({ NODE_ENV: 'production', PRIVACY_WORKER_DATABASE_URL: '   ' }, unusedDeps);
  } catch (error) { blankError = error; }
  A('G4 production 下仅空白 URL 视为缺失并失败关闭',
    blankError instanceof Error && blankError.message === 'privacy_worker_database_url_missing');

  const pool: FakePool = { id: 'privacy-pool', end: async () => undefined };
  let createPoolCalls = 0;
  let assertCalls = 0;
  const started = await initializePrivacyWorkerStartup(
    { NODE_ENV: 'production', PRIVACY_WORKER_DATABASE_URL: 'postgresql://privacy-worker.test/meetwise' },
    {
      createPool: (options) => {
        createPoolCalls += 1;
        if (options.purpose !== 'privacy-worker') throw new Error('unexpected_purpose');
        if (options.connectionString !== 'postgresql://privacy-worker.test/meetwise') {
          throw new Error('unexpected_connection_string');
        }
        return pool as never;
      },
      assertIdentity: async (received) => {
        assertCalls += 1;
        if ((received as unknown) !== pool) throw new Error('unexpected_pool');
      },
    },
  );
  A('G4 production 配置了 URL 后会建池并校验身份', (started as unknown) === pool && createPoolCalls === 1 && assertCalls === 1);
  A('G4 compose.prod.yml worker 段以 :?required 挂载 PRIVACY_WORKER_DATABASE_URL',
    /PRIVACY_WORKER_DATABASE_URL:\s*\$\{PRIVACY_WORKER_DATABASE_URL:\?/.test(workerSection));
  A('G4 compose.prod.yml 迁移环境以 :?required 注入 PRIVACY_WORKER_DB_USER/PASSWORD',
    /PRIVACY_WORKER_DB_USER:\s*\$\{PRIVACY_WORKER_DB_USER:\?/.test(migrationEnvBlock)
      && /PRIVACY_WORKER_DB_PASSWORD:\s*\$\{PRIVACY_WORKER_DB_PASSWORD:\?/.test(migrationEnvBlock));
  A('G4 API 段不得挂载 PRIVACY_WORKER_DATABASE_URL 或 provision 口令',
    !/PRIVACY_WORKER_DATABASE_URL\s*:/.test(apiSection)
      && !/PRIVACY_WORKER_DB_(?:USER|PASSWORD)\s*:/.test(apiSection));
  A('G4 worker.env.example 记录 PRIVACY_WORKER_DATABASE_URL 占位（无真实凭据）',
    /^PRIVACY_WORKER_DATABASE_URL=$/m.test(workerExample)
      && !/postgresql:\/\/\S+:\S+@/.test(workerExample.split('PRIVACY_WORKER_DATABASE_URL=')[1]?.split('\n')[0] ?? 'x'));
  A('G4 migrate.env.example 仍保留 PRIVACY_WORKER_DB_USER/PASSWORD 空占位',
    /^PRIVACY_WORKER_DB_USER=$/m.test(migrateExample)
      && /^PRIVACY_WORKER_DB_PASSWORD=$/m.test(migrateExample));
  A('G4 compose.ha.yml worker-a/worker-b 同步挂载 PRIVACY_WORKER_DATABASE_URL（锚不跨文件）',
    (haCompose.match(/PRIVACY_WORKER_DATABASE_URL:\s*\$\{PRIVACY_WORKER_DATABASE_URL:\?/g) ?? []).length >= 2);
  A('G4 公开 DELETE 面试数据接口仍固定 503（本修复不得改此语义）',
    /@Delete\('interview-data\/:id'\)/.test(deleteController)
      && /@HttpCode\(HttpStatus\.SERVICE_UNAVAILABLE\)/.test(deleteController)
      && /interview_erasure_authorization_not_available/.test(deleteService)
      && /HttpStatus\.SERVICE_UNAVAILABLE/.test(deleteService));
  A('G4 本证明读取的仓库根路径可定位 compose 文件',
    existsSync(path.join(repoRoot, 'pnpm-workspace.yaml'))
      && existsSync(path.join(repoRoot, 'docker/compose.prod.yml')));
  /* eslint-enable @typescript-eslint/naming-convention */
}

async function main() {
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

  await assertPrivacyWorkerG4();

  console.log(`\n${failures === 0 ? '✓ 部署 worker 环境费用治理与 G4 隐私 worker 契约证明全部通过' : `✗ ${failures} 项失败`}`);
  process.exit(failures === 0 ? 0 : 1);
}

void main();
