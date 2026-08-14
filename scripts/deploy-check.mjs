/**
 * 部署运行路径守卫：防"容器用 tsx、gate 用 swc"的工具链漂移(实跑部署才抓到的 Nest DI 静默失效)。
 * 断言:容器命令必须用 serve/start(= @swc-node/register,发 emitDecoratorMetadata),绝不用 tsx 跑 main。
 * 配合 `docker compose config -q`(编排合法)组成 deploy:check。
 */
import { readFileSync } from 'node:fs';

const compose = readFileSync('docker/compose.prod.yml', 'utf8');
const prometheus = readFileSync('docker/monitoring/prometheus.yml', 'utf8');
const prometheusWithoutComments = prometheus.replace(/^\s*#.*$/gm, '');
const dockerfile = readFileSync('Dockerfile', 'utf8');
const apiPkg = JSON.parse(readFileSync('apps/api/package.json', 'utf8'));
const workerPkg = JSON.parse(readFileSync('apps/worker/package.json', 'utf8'));

const fails = [];
const must = (cond, msg) => { if (!cond) fails.push(msg); };

// ① 容器命令用 serve/start,不用 tsx 跑 main(tsx 不发装饰器元数据 → Nest DI 失效)
must(/"apps\/api",\s*"serve"/.test(compose), 'compose api 应 command: pnpm -C apps/api serve');
must(/"apps\/worker",\s*"start"/.test(compose), 'compose worker 应 command: pnpm -C apps/worker start');
must(!/"tsx","src\/main/.test(compose), 'compose 不得用 tsx 跑 main(DI 元数据缺失)');
must(/apps\/api","serve"/.test(dockerfile) && !/"tsx","src\/main/.test(dockerfile), 'Dockerfile CMD 应 serve、非 tsx main');
// ② serve/start 脚本确实走 @swc-node/register(发元数据,与 gate api:validate 同路径)
must(/@swc-node\/register/.test(apiPkg.scripts?.serve ?? ''), 'apps/api serve 必须经 @swc-node/register');
must(/@swc-node\/register/.test(workerPkg.scripts?.start ?? ''), 'apps/worker start 必须经 @swc-node/register');

// ③ 部署迁移:只能由一次性 migrate 服务执行版本化 migrations。基础 sql 含 DROP，
// 绝不可作为 postgres init-script 与增量迁移混用。
import { readdirSync, readFileSync as rf } from 'node:fs';
must(!/docker-entrypoint-initdb\.d/.test(compose), 'compose 不得挂载基础 sql 到 postgres initdb');
must(/packages\/db(?:","migrate"|\s+migrate\b)/.test(compose), 'compose 须有独立 packages/db migrate 服务');
must((compose.match(/condition:\s*service_completed_successfully/g) ?? []).length >= 2, 'api/worker 须依赖 migrate 成功完成');
// ④ production compose 是云端唯一数据面：本地服务只能留在 dev/demo 文件，
// 且所有连接字符串必须由部署期密钥管理注入，不能回退 PGHOST/默认口令。
must(!/^\s{2}(postgres|redis|minio):/m.test(compose), '生产 compose 不得声明本地 postgres/redis/minio 服务');
must(!/^volumes:/m.test(compose), '生产 compose 不得声明本地数据卷');
must(!/\bPGHOST\s*:|meetwise_dev_password|localhost:|127\.0\.0\.1:/.test(compose), '生产 compose 不得含本地数据库目标或开发口令');
must(/x-cloud-runtime-env:[\s\S]*DATABASE_URL:\s*\$\{RUNTIME_DATABASE_URL:\?/.test(compose), 'API/worker 必须从密钥管理注入 runtime DATABASE_URL');
must(/x-migration-env:[\s\S]*DATABASE_URL:\s*\$\{MIGRATION_DATABASE_URL:\?/.test(compose), '迁移任务必须从密钥管理注入独立 MIGRATION_DATABASE_URL');
must(/DATABASE_SSL_MODE:\s*verify-full/.test(compose) && /DATABASE_SSL_CA_PATH:\s*\/run\/secrets\/rds_ca/.test(compose), '生产数据库必须 verify-full TLS 并读取 CA secret');
must(/WEB_ORIGIN:\s*\$\{WEB_ORIGIN:\?/.test(compose), '生产 API 必须从密钥管理注入 WEB_ORIGIN，CORS 缺失时不得部署后才启动失败');
must(/RAG_REDIS_URL:\s*\$\{RAG_REDIS_URL:\?/.test(compose), 'worker 必须从密钥管理注入受管 Tair/Redis URL');
// Text routing and native DashScope capabilities have different protocol and
// data-class boundaries.  The API may receive the latter for voice fallback,
// but never the DeepSeek primary or Qwen text-backup credentials.
const apiBlock = compose.match(/^  api:\n([\s\S]*?)(?=^  worker:)/m)?.[1] ?? '';
const workerBlock = compose.match(/^  worker:\n([\s\S]*?)(?=^  prometheus:)/m)?.[1] ?? '';
const migrationBlock = compose.match(/^  migrate:\n([\s\S]*?)(?=^  api:)/m)?.[1] ?? '';
const workerNativeModelBlock = compose.match(/^x-worker-native-model-env: &worker-native-model-env\n([\s\S]*?)(?=^x-migration-env:)/m)?.[1] ?? '';
must(/<<: \[\*cloud-runtime-env, \*worker-native-model-env\]/.test(workerBlock)
  && /DASHSCOPE_API_KEY:\s*\$\{DASHSCOPE_API_KEY:\?/.test(workerNativeModelBlock)
  && /DASHSCOPE_ENDPOINT_PROFILE:\s*\$\{DASHSCOPE_ENDPOINT_PROFILE:-cn-beijing-public\}/.test(workerNativeModelBlock)
  && /DASHSCOPE_WORKSPACE_ID:\s*\$\{DASHSCOPE_WORKSPACE_ID:-\}/.test(workerNativeModelBlock)
  && !/DASHSCOPE_(?:COMPAT_BASE_URL|TTS_URL|STREAM_URL|RERANK_URL|TEST_TRANSPORT_OVERRIDES):/.test(compose),
  'Worker DashScope 原生能力必须使用独立 Key 与受控 endpoint profile，不能注入任意 URL');
must(!/DASHSCOPE_(?:API_KEY|ENDPOINT_PROFILE|WORKSPACE_ID|ASR_MODEL|TTS_MODEL|EMBED_MODEL|RERANK_MODEL|VISION_MODEL|STREAM_ASR_MODEL|STREAM_TTS_MODEL)\s*:/.test(apiBlock),
  'API 语音/OCR fail-closed 时不得挂载任何 DashScope 原生 Key、profile 或模型选择');
must(/DASHSCOPE_VISION_MODEL:\s*\$\{DASHSCOPE_VISION_MODEL:-qwen-vl-max\}/.test(compose),
  'DashScope 视觉 smoke 必须有独立、可替换的原生模型标识');
must(!/MODEL_(?:API_KEY|BACKUP_API_KEY)\s*:/.test(apiBlock),
  'API 不得获得 DeepSeek 主文本 Key 或 Qwen 文本备用 Key');
must(/MODEL_API_KEY:\s*\$\{MODEL_API_KEY:\?/.test(workerBlock)
  && /MODEL_BACKUP_API_KEY:\s*\$\{MODEL_BACKUP_API_KEY:\?/.test(workerBlock),
  'Worker 必须显式接收主文本与备用文本的独立 Key');
must(!/MODEL_(?:API_KEY|BACKUP_API_KEY)\s*:/.test(migrationBlock),
  '迁移任务不得获得任何模型 API Key');
must(/MODEL_BACKUP_BILLING_PROVIDER:\s*\$\{MODEL_BACKUP_BILLING_PROVIDER:\?/.test(compose)
  && /MODEL_FAST_BACKUP_BILLING_PROVIDER:\s*\$\{MODEL_FAST_BACKUP_BILLING_PROVIDER:\?/.test(compose),
  '启用文本备用端点时须同时注册 default/fast 的独立费用配置');
must(/QBANK_CONTROL_DB_USER:\s*\$\{QBANK_CONTROL_DB_USER:\?/.test(compose)
  && /QBANK_CONTROL_DB_PASSWORD:\s*\$\{QBANK_CONTROL_DB_PASSWORD:\?/.test(compose)
  && /worker:[\s\S]*?QBANK_CONTROL_DATABASE_URL:\s*\$\{QBANK_CONTROL_DATABASE_URL:\?/.test(compose),
  '迁移任务须 provision 独立 qbank 控制登录，且仅 worker 挂载 QBANK_CONTROL_DATABASE_URL');
must(/secrets:\s*\[rds_ca\]/.test(compose), '云端运行服务必须挂载 RDS CA secret');
// ⑤ Worker 关键业务指标必须由同一私网内的 Prometheus 实际抓取。不能把
// 127.0.0.1 / host.docker.internal 当作云部署服务发现，否则告警规则虽能 lint
// 也永远拿不到模型对账、队列与就绪状态的数据。
must(/worker:[\s\S]*?WORKER_METRICS_HOST:\s*0\.0\.0\.0[\s\S]*?expose:\s*\n\s*-\s*"9091"/.test(compose),
  'worker 必须只在 compose 私网 expose 9091，并显式监听 0.0.0.0');
must(/^\s{2}prometheus:/m.test(compose) && /^\s{2}alertmanager:/m.test(compose),
  '生产 compose 必须携带 Prometheus 和 Alertmanager 服务，不能依赖未声明的宿主机监控');
must(/prom\/prometheus:v\d+\.\d+\.\d+/.test(compose) && /prom\/alertmanager:v\d+\.\d+\.\d+/.test(compose),
  '监控镜像必须固定版本，禁止 latest');
must(/targets:\s*\n\s*- api:8787/.test(prometheus) && /targets:\s*\n\s*- worker:9091/.test(prometheus),
  'Prometheus 必须通过 compose 服务名抓 api:8787 与 worker:9091');
must(!/host\.docker\.internal/.test(prometheusWithoutComments), '生产 Prometheus 不得依赖 host.docker.internal');
const migrations = readdirSync('packages/db/migrations').filter((f) => f.endsWith('.sql')).sort();
must(migrations.length >= 30 && migrations[0] === '0001_baseline.sql', `版本化 migrations 按序齐全(现 ${migrations.length} 个,0001 起)`);
const proofInMigrations = migrations.filter((f) => /\\(set|pset)\b/.test(rf(`packages/db/migrations/${f}`, 'utf8')));
must(proofInMigrations.length === 0, `migration 目录混入 psql 证明文件:${proofInMigrations.join(',')}`);

if (fails.length) { console.error('✗ 部署校验失败:\n  - ' + fails.join('\n  - ')); process.exit(1); }
console.log(`✓ deploy-check-ok（命令经 @swc-node/register 无 tsx 漂移 · 云端唯一数据面 · ${migrations.length} 个版本化迁移由一次性服务执行）`);
