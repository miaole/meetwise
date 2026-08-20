/**
 * 部署运行路径守卫：防"容器用 tsx、gate 用 swc"的工具链漂移(实跑部署才抓到的 Nest DI 静默失效)。
 * 断言:容器命令必须用 serve/start(= @swc-node/register,发 emitDecoratorMetadata),绝不用 tsx 跑 main。
 * 配合 `docker compose config -q`(编排合法)组成 deploy:check。
 */
import { readFileSync } from 'node:fs';

const compose = readFileSync('docker/compose.prod.yml', 'utf8');
const monitoringCompose = readFileSync('docker/compose.monitoring.yml', 'utf8');
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
// compose 单机：生产必须 pull 镜像（image:），绝不在 ECS 上 build（4G 内存 OOM 根因）。
must(!/^\s+build:\s*$/m.test(compose), '生产 compose 必须 pull 镜像(image:)，不得在 ECS 上 build');
must(/image:\s*\$\{BACKEND_IMAGE:\?/.test(compose) && /image:\s*\$\{WEB_IMAGE:\?/.test(compose), '生产 compose 必须用 BACKEND_IMAGE/WEB_IMAGE 按 @sha256 摘要 pin 的镜像引用');

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
must(!/\bPGHOST\s*:|meetwise_dev_password|localhost:|(?:postgres(?:ql)?|redis|mysql):\/\/127\.0\.0\.1|127\.0\.0\.1:(?:5432|6379|3306)/.test(compose), '生产 compose 不得含本地数据库目标或开发口令');
// app 端口必须宿主回环绑定：0.0.0.0 会把 api/web 直连 tailnet/公网，绕过 funnel 与 edge-close
// 仪式（revoke 关 funnel 后 app 仍可从 :8787/:3000 直达）。唯一公网入口必须仍是 funnel→nginx:80→web:3000。
must(/"127\.0\.0\.1:8787:8787"/.test(compose) && /"127\.0\.0\.1:3000:3000"/.test(compose) && !/^\s*-\s*"0\.0\.0\.0:/m.test(compose), 'app 端口必须绑定 127.0.0.1（仅 funnel/nginx/宿主 loader 可达），不得 0.0.0.0 暴露');
// web 容器的服务端 api 调用（serverFetch / 同源 SSE 代理）必须走 compose 私网 api:8787，
// 缺失会回退到公网 NEXT_PUBLIC_API_BASE 造成经 funnel 自环或失败。
must(/API_BASE_INTERNAL:\s*http:\/\/api:8787/.test(compose), 'web 容器必须经 compose 私网 api:8787 直连，不得回退公网 NEXT_PUBLIC_API_BASE');
must(/x-cloud-runtime-env:[\s\S]*DATABASE_URL:\s*\$\{RUNTIME_DATABASE_URL:\?/.test(compose), 'API/worker 必须从密钥管理注入 runtime DATABASE_URL');
must(/x-migration-env:[\s\S]*DATABASE_URL:\s*\$\{MIGRATION_DATABASE_URL:\?/.test(compose), '迁移任务必须从密钥管理注入独立 MIGRATION_DATABASE_URL');
must(/DATABASE_SSL_MODE:\s*verify-full/.test(compose) && /DATABASE_SSL_CA_PATH:\s*\/run\/secrets\/rds_ca/.test(compose), '生产数据库必须 verify-full TLS 并读取 CA secret');
must(/WEB_ORIGIN:\s*\$\{WEB_ORIGIN:\?/.test(compose), '生产 API 必须从密钥管理注入 WEB_ORIGIN，CORS 缺失时不得部署后才启动失败');
must(/RAG_REDIS_URL:\s*\$\{RAG_REDIS_URL:\?/.test(compose), 'worker 必须从密钥管理注入受管 Tair/Redis URL');
// Text routing and native DashScope capabilities have different protocol and
// data-class boundaries.  The API may receive the latter for voice fallback,
// but never the DeepSeek primary or Qwen text-backup credentials.
const apiBlock = compose.match(/^  api:\n([\s\S]*?)(?=^  worker:)/m)?.[1] ?? '';
const workerBlock = compose.match(/^  worker:\n([\s\S]*?)(?=^  web:)/m)?.[1] ?? '';
const migrationBlock = compose.match(/^  migrate:\n([\s\S]*?)(?=^  api:)/m)?.[1] ?? '';
const workerNativeModelBlock = compose.match(/^x-worker-native-model-env: &worker-native-model-env\n([\s\S]*?)(?=^x-migration-env:)/m)?.[1] ?? '';
const migrationEnvBlock = compose.match(/^x-migration-env: &migration-env\n([\s\S]*?)(?=^services:)/m)?.[1] ?? '';
must(/<<: \[\*cloud-runtime-env, \*worker-native-model-env\]/.test(workerBlock)
  && /DASHSCOPE_EMBED_API_KEY:\s*\$\{DASHSCOPE_EMBED_API_KEY:\?/.test(workerNativeModelBlock)
  && /DASHSCOPE_RERANK_API_KEY:\s*\$\{DASHSCOPE_RERANK_API_KEY:\?/.test(workerNativeModelBlock)
  && /DASHSCOPE_ASR_API_KEY:\s*\$\{DASHSCOPE_ASR_API_KEY:\?/.test(workerNativeModelBlock)
  && /DASHSCOPE_TTS_API_KEY:\s*\$\{DASHSCOPE_TTS_API_KEY:\?/.test(workerNativeModelBlock)
  && /DASHSCOPE_STREAM_ASR_API_KEY:\s*\$\{DASHSCOPE_STREAM_ASR_API_KEY:\?/.test(workerNativeModelBlock)
  && /DASHSCOPE_STREAM_TTS_API_KEY:\s*\$\{DASHSCOPE_STREAM_TTS_API_KEY:\?/.test(workerNativeModelBlock)
  && !/DASHSCOPE_API_KEY\s*:/.test(workerNativeModelBlock)
  && /DASHSCOPE_ENDPOINT_PROFILE:\s*\$\{DASHSCOPE_ENDPOINT_PROFILE:-cn-beijing-public\}/.test(workerNativeModelBlock)
  && /DASHSCOPE_WORKSPACE_ID:\s*\$\{DASHSCOPE_WORKSPACE_ID:-\}/.test(workerNativeModelBlock)
  && !/DASHSCOPE_(?:COMPAT_BASE_URL|TTS_URL|STREAM_URL|RERANK_URL|TEST_TRANSPORT_OVERRIDES):/.test(compose),
  'Worker DashScope 原生能力必须按能力拆分独立 Key 与受控 endpoint profile，不能注入任意 URL 或 broad key');
must(!/DASHSCOPE_(?:API_KEY|EMBED_API_KEY|RERANK_API_KEY|ASR_API_KEY|TTS_API_KEY|STREAM_ASR_API_KEY|STREAM_TTS_API_KEY|VISION_API_KEY|EMBED_API_KEY_FINGERPRINT|RERANK_API_KEY_FINGERPRINT|ASR_API_KEY_FINGERPRINT|TTS_API_KEY_FINGERPRINT|STREAM_ASR_API_KEY_FINGERPRINT|STREAM_TTS_API_KEY_FINGERPRINT|VISION_API_KEY_FINGERPRINT|REVOKED_KEY_FINGERPRINTS|ENDPOINT_PROFILE|WORKSPACE_ID|ASR_MODEL|TTS_MODEL|EMBED_MODEL|RERANK_MODEL|VISION_MODEL|STREAM_ASR_MODEL|STREAM_TTS_MODEL)\s*:/.test(apiBlock),
  'API 语音/OCR fail-closed 时不得挂载任何 DashScope 原生 Key、profile、指纹或模型选择');
must(/DASHSCOPE_VISION_MODEL:\s*\$\{DASHSCOPE_VISION_MODEL:-qwen-vl-max\}/.test(compose),
  'DashScope 视觉 smoke 必须有独立、可替换的原生模型标识');
must(!/MODEL_(?:API_KEY|BACKUP_API_KEY)\s*:/.test(apiBlock),
  'API 不得获得 DeepSeek 主文本 Key 或 Qwen 文本备用 Key');
must(/MODEL_API_KEY:\s*\$\{MODEL_API_KEY:\?/.test(workerBlock)
  && /MODEL_BACKUP_API_KEY:\s*\$\{MODEL_BACKUP_API_KEY:\?/.test(workerBlock),
  'Worker 必须显式接收主文本与备用文本的独立 Key');
must(/MODEL_ENDPOINT_PROFILE:\s*\$\{MODEL_ENDPOINT_PROFILE:-deepseek-cn-public\}/.test(compose)
  && /MODEL_BACKUP_ENDPOINT_PROFILE:\s*\$\{MODEL_BACKUP_ENDPOINT_PROFILE:-dashscope-cn-beijing\}/.test(compose),
  '文本主/备用 endpoint 必须由受控版本化 profile id 指定，不能注入自由 URL');
must(!/MODEL_BASE_URL\s*:/.test(compose) && !/MODEL_BACKUP_BASE_URL\s*:/.test(compose),
  'compose 不得注入旧自由 URL（MODEL_BASE_URL/MODEL_BACKUP_BASE_URL），endpoint 只能走受控 profile');
must(!/MODEL_(?:API_KEY|BACKUP_API_KEY)\s*:/.test(migrationBlock),
  '迁移任务不得获得任何模型 API Key');
// F2 fix: 之前的正则扫整个文件，被 x-migration-env 里的备份计费块满足，从不检查
// worker 块。结果 worker 启动时 resolveModelCostGovernance() 因缺备份计费字段抛
// model_cost_invalid_model_backup_billing_model 也能假绿通过。现在按块断言：worker 块
// 必须自己携带备份计费配置（migrate 服务写账本用的 x-migration-env 不再替它兜底）。
must(/MODEL_BACKUP_BILLING_PROVIDER:\s*\$\{MODEL_BACKUP_BILLING_PROVIDER:\?/.test(workerBlock)
  && /MODEL_FAST_BACKUP_BILLING_PROVIDER:\s*\$\{MODEL_FAST_BACKUP_BILLING_PROVIDER:\?/.test(workerBlock),
  'Worker 块必须自己注册 default/fast 备份的独立费用配置（不能只靠 x-migration-env 满足）');
must(/MODEL_BACKUP_BILLING_PROVIDER:\s*\$\{MODEL_BACKUP_BILLING_PROVIDER:\?/.test(migrationEnvBlock)
  && /MODEL_FAST_BACKUP_BILLING_PROVIDER:\s*\$\{MODEL_FAST_BACKUP_BILLING_PROVIDER:\?/.test(migrationEnvBlock),
  '迁移任务仍须注册备份计费配置（x-migration-env 写不可变账单行，供 worker 启动校验对齐）');
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
must(/^\s{2}prometheus:/m.test(monitoringCompose) && /^\s{2}alertmanager:/m.test(monitoringCompose),
  '监控栈必须声明 Prometheus 和 Alertmanager 服务（独立 compose.monitoring.yml），不能依赖未声明的宿主机监控');
must(/prom\/prometheus:v\d+\.\d+\.\d+/.test(monitoringCompose) && /prom\/alertmanager:v\d+\.\d+\.\d+/.test(monitoringCompose),
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
