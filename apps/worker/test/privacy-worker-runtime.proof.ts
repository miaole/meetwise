/* eslint-disable @typescript-eslint/naming-convention */
/**
 * Unit proof for privacy-worker production fail-closed startup (#247 / G4).
 * Does not open a real database. Public DELETE 503 is pinned by grep only
 * and is not modified by this change.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { initializePrivacyWorkerStartup } from '../src/privacy-worker-runtime.ts';

let failures = 0;
const check = (name: string, condition: boolean) => {
  console.log(`${condition ? 'PASS' : 'FAIL'}  ${name}`);
  if (!condition) failures++;
};

const repoRoot = fileURLToPath(new URL('../../..', import.meta.url));
const compose = readFileSync(new URL('../../../docker/compose.prod.yml', import.meta.url), 'utf8');
const workerExample = readFileSync(new URL('../../../docker/env/worker.env.example', import.meta.url), 'utf8');
const haCompose = readFileSync(new URL('../../../docker/compose.ha.yml', import.meta.url), 'utf8');
const migrateExample = readFileSync(new URL('../../../docker/env/migrate.env.example', import.meta.url), 'utf8');
const deleteController = readFileSync(new URL('../../api/src/modules/privacy/privacy.controller.ts', import.meta.url), 'utf8');
const deleteService = readFileSync(new URL('../../api/src/modules/privacy/privacy.service.ts', import.meta.url), 'utf8');

const workerBlock = compose.match(/^  worker:\n([\s\S]*?)(?=^  web:)/m)?.[1] ?? '';
const apiBlock = compose.match(/^  api:\n([\s\S]*?)(?=^  worker:)/m)?.[1] ?? '';
const migrationEnvBlock = compose.match(/^x-migration-env: &migration-env\n([\s\S]*?)(?=^services:)/m)?.[1] ?? '';

type FakePool = { end: () => Promise<void>; id: string };
const unusedDeps = {
  createPool: () => { throw new Error('createPool_should_not_run'); },
  assertIdentity: async () => { throw new Error('assertIdentity_should_not_run'); },
};

const missing = await initializePrivacyWorkerStartup({}, unusedDeps);
check('非生产且未配置 URL 时返回 undefined，不建池', missing === undefined);

const missingDev = await initializePrivacyWorkerStartup({ NODE_ENV: 'development' }, unusedDeps);
check('development 缺 URL 仍返回 undefined（本地可无专用登录启动）', missingDev === undefined);

let productionError: unknown;
try {
  await initializePrivacyWorkerStartup({ NODE_ENV: 'production' }, unusedDeps);
} catch (error) {
  productionError = error;
}
check(
  'production 缺 URL 以 privacy_worker_database_url_missing 失败关闭',
  productionError instanceof Error && productionError.message === 'privacy_worker_database_url_missing',
);

let mixedCaseError: unknown;
try {
  await initializePrivacyWorkerStartup({ NODE_ENV: 'Production' }, unusedDeps);
} catch (error) {
  mixedCaseError = error;
}
check(
  'NODE_ENV=Production（大小写混合）缺 URL 同样失败关闭',
  mixedCaseError instanceof Error && mixedCaseError.message === 'privacy_worker_database_url_missing',
);

let blankError: unknown;
try {
  await initializePrivacyWorkerStartup(
    { NODE_ENV: 'production', PRIVACY_WORKER_DATABASE_URL: '   ' },
    unusedDeps,
  );
} catch (error) {
  blankError = error;
}
check(
  'production 下仅空白 URL 视为缺失并失败关闭',
  blankError instanceof Error && blankError.message === 'privacy_worker_database_url_missing',
);

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
check('production 配置了 URL 后会建池并校验身份', (started as unknown) === pool && createPoolCalls === 1 && assertCalls === 1);

check(
  'compose.prod.yml worker 段以 :?required 挂载 PRIVACY_WORKER_DATABASE_URL',
  /PRIVACY_WORKER_DATABASE_URL:\s*\$\{PRIVACY_WORKER_DATABASE_URL:\?/.test(workerBlock),
);
check(
  'compose.prod.yml 迁移环境以 :?required 注入 PRIVACY_WORKER_DB_USER/PASSWORD',
  /PRIVACY_WORKER_DB_USER:\s*\$\{PRIVACY_WORKER_DB_USER:\?/.test(migrationEnvBlock)
    && /PRIVACY_WORKER_DB_PASSWORD:\s*\$\{PRIVACY_WORKER_DB_PASSWORD:\?/.test(migrationEnvBlock),
);
check(
  'API 段不得挂载 PRIVACY_WORKER_DATABASE_URL 或 provision 口令',
  !/PRIVACY_WORKER_DATABASE_URL\s*:/.test(apiBlock)
    && !/PRIVACY_WORKER_DB_(?:USER|PASSWORD)\s*:/.test(apiBlock),
);
check(
  'worker.env.example 记录 PRIVACY_WORKER_DATABASE_URL 占位（无真实凭据）',
  /^PRIVACY_WORKER_DATABASE_URL=$/m.test(workerExample)
    && !/postgresql:\/\/\S+:\S+@/.test(workerExample.split('PRIVACY_WORKER_DATABASE_URL=')[1]?.split('\n')[0] ?? 'x'),
);
check(
  'migrate.env.example 仍保留 PRIVACY_WORKER_DB_USER/PASSWORD 空占位',
  /^PRIVACY_WORKER_DB_USER=$/m.test(migrateExample)
    && /^PRIVACY_WORKER_DB_PASSWORD=$/m.test(migrateExample),
);
check(
  'compose.ha.yml worker-a/worker-b 同步挂载 PRIVACY_WORKER_DATABASE_URL（锚不跨文件）',
  (haCompose.match(/PRIVACY_WORKER_DATABASE_URL:\s*\$\{PRIVACY_WORKER_DATABASE_URL:\?/g) ?? []).length >= 2,
);
check(
  '公开 DELETE 面试数据接口仍固定 503（本修复不得改此语义）',
  /@Delete\('interview-data\/:id'\)/.test(deleteController)
    && /@HttpCode\(HttpStatus\.SERVICE_UNAVAILABLE\)/.test(deleteController)
    && /interview_erasure_authorization_not_available/.test(deleteService)
    && /HttpStatus\.SERVICE_UNAVAILABLE/.test(deleteService),
);
check('本证明读取的仓库根路径可定位 compose 文件', repoRoot.endsWith('meetwise') || repoRoot.includes('mw-fix-g4'));

if (failures) process.exit(1);
console.log('✓ privacy-worker production fail-closed proof 全部通过');
