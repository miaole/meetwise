import 'reflect-metadata';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { PassThrough } from 'node:stream';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { configureG7RuntimeInjection, getMetrics, isG7FreetierReproveEnabled, resolveModelDeadlineConfig } from '@meetwise/ai-runtime';
import { buildOpenApiDocument } from '@meetwise/contracts/openapi';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './platform/all-exceptions.filter';
import { installPublicPreviewIngressGate, resolvePublicPreviewMode } from './platform/public-preview';
import { assertCriticalEnv } from './platform/env-schema';
import { getSseRegistry, type SseRegistry } from './platform/sse-registry';

// GODFN-1b composition-root single read point: G7_FREETIER_REPROVE is read
// exactly ONCE here (env key name and `=1` activation semantics unchanged —
// guard `trim() === '1'` pinned). The pre-1b unconditional
// `import '@meetwise/ai-runtime/g7-bootstrap'` became assembly by this switch:
// only a G7 process dynamically loads the test-support interceptor and injects
// predicate + outbound ticket into the runtime package. Production builds
// carry zero static g7-bootstrap import (prove:g7-bootstrap-zero-prod-import).
const g7FreetierReproveEnabled = isG7FreetierReproveEnabled(process.env);
// AUTHZ-HARDEN 5A-2 #168(G7 生产拒启):测试支撑拦截器仅限非生产调试——production 组合根上开关为真
// 即配置错误 → fail-closed throw 拒启(先于任何动态 import/端口绑定;非 production 放行)。
// GODFN-1b 单读点不变:本守卫只复用上方唯一一次读取结果,不二次读 G7_FREETIER_REPROVE。
if (g7FreetierReproveEnabled && process.env.NODE_ENV === 'production') {
  throw new Error('refusing_to_start: G7_FREETIER_REPROVE=1 is test-support only and is forbidden when NODE_ENV=production (#168)');
}
if (g7FreetierReproveEnabled) {
  const support = await import('@meetwise/ai-runtime/g7-test-support');
  configureG7RuntimeInjection({
    freetierReproveEnabled: () => g7FreetierReproveEnabled,
    withOutboundAllow: support.withG7OutboundAllow,
  });
  support.installG7OutboundInterceptor(process.env);
}

// ── HA-2 优雅停机(R-18·REQUEST §1 W1)──────────────────────────────────────────
// 导出为注入式 proof 缝(ha-2-drain.proof.ts 沿 createApp 既有导出先例);生产装配在
// bootstrap()——E2E/嵌入者导入 createApp 零感(旗/handler 只在直执行模块内挂)。

/** 健康探针豁免清单:排水期 /livez 恒 200;/readyz/api 与 /health(同 handler)由 C4 翻 503。 */
export const HEALTH_PROBE_PATHS: ReadonlySet<string> = new Set(['/livez', '/readyz/api', '/health']);

/**
 * W1② onRequest 拒新门:排水期非健康探针路由即刻 503 service_unavailable_draining
 * (信封沿 AllExceptionsFilter 形制 + connection: close)。装配序在 public-preview 门
 * 之后、路由 handler 之前(onRequest 先于 body 解析/鉴权)。
 */
export function drainGateHook(registry: Pick<SseRegistry, 'isDraining'>) {
  return (req: any, reply: any, done: (err?: Error) => void): void => {
    if (!registry.isDraining()) { done(); return; }
    const path = String(req.url ?? '').split('?')[0] ?? '';
    if (HEALTH_PROBE_PATHS.has(path)) { done(); return; }
    reply.code(503).header('connection', 'close').send({ error: 'service_unavailable_draining' });
  };
}

export interface ApiShutdownChainDeps {
  registry: SseRegistry;
  /** 真 app.close():点亮 SseNotifyLifecycle 既有钩子(LISTEN 池首次被真正收掉)。 */
  closeApp: () => Promise<void>;
  timeoutMs: number;
  exit: (code: number) => void;
  log: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
}

/**
 * W1①③④ 关闭链(R2:禁 enableShutdownHooks——Nest 自注册 SIGTERM 与自定义 handler
 * 并存 = 同信号双路各触发 app.close()〔@nestjs/core 11.1.27 nest-application-context.js
 * :126-132/:168-182 亲证〕;本自定义 handler 是唯一关闭单路)。顺序:
 *   beginDrain(单源旗:503 门+readiness 翻脸即刻生效) → drainAll(SSE 帧间停取,R1 置旗
 *   不 end) → 等注册表归零(各泵在帧边界完成单点 end) → await app.close() → exit 0;
 *   API_SHUTDOWN_TIMEOUT_MS(默认 10s)deadline 计时器(不 unref)全程兜底,到点
 *   api_drain_timeout + exit 0——内部上限 < 容器宽限(W4 钉 15s),SIGKILL 兜不到。
 */
export function createApiShutdownChain(deps: ApiShutdownChainDeps): (signal: string) => void {
  let shuttingDown = false;
  return (signal: string) => {
    if (shuttingDown) return;                       // SIGTERM/SIGINT 双落·重复信号幂等
    shuttingDown = true;
    void (async () => {
      deps.registry.beginDrain();
      const registered = deps.registry.drainAll();
      deps.log(`api_drain_start signal=${signal} sse_registered=${registered}`);
      const timer = setTimeout(() => {
        deps.error('api_drain_timeout');
        deps.exit(0);
      }, deps.timeoutMs);                           // 不 unref:进程生命周期必须被上限钉住
      while (deps.registry.count() > 0) {           // 等各泵帧边界收尾(异常滞留由上方 deadline 裁决)
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
      await deps.closeApp();
      clearTimeout(timer);
      deps.log('api_drained, exiting');
      deps.exit(0);
    })();
  };
}

/** 真 NestJS（Fastify + 类型 DI + SWC 运行）。 run: pnpm -C apps/api serve */
export async function createApp(): Promise<NestFastifyApplication> {  // 审计 #91 配置集中校验刀:关键必需 env(AUTH_SECRET/数据库目标)启动期 fail-fast,
  // 缺失/格式错 → 抛 env_schema_invalid(一次性列全缺失项),进程启动即死——
  // 不再出现「AUTH_SECRET 缺失照常启动并通过 readiness、登录/验签运行时才全瘫」。
  // 只做启动校验层,不改写散落的 process.env 读法(审计口径 Ban 大规模重构)。
  assertCriticalEnv();
  const publicPreview = resolvePublicPreviewMode();
  // Queue producers share the worker's timeout contract; reject a broken
  // deployment before accepting requests that cannot be processed safely.
  // MODEL-OP-02：全局 MODEL_MAX_CONCURRENT/MODEL_RPM 限流已废弃（per-adapter 限流移除），
  // 并发/断路器改由共享权威（迁移 0120 的 ai_model_admission_acquire_scoped）在 invoke() 内裁决。
  resolveModelDeadlineConfig();
  // **可观测性(审计#89)**:pino 由 fastify 内置,这里开 level=info 的访问日志。
  // 序列化面仅 method/url/status/reqId/耗时/err 堆栈——fastify 默认 req/res serializer 本就不含
  // body/headers;redact authorization/cookie 作纵深。**Ban 打印请求体/响应体/提示词/PII**。
  // NestFactory 层 logger:false 保持(免 Nest 启动噪音双写;异常日志见 all-exceptions.filter 走 pino)。
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      // 12MiB=简历+语音共享的**传输信封**（为 ~8MB 简历原文 base64≈10.7MB+JSON 余量校准）。
      // #70 勘误（5E 2026-10-12）：此值不再是第三个「语音上限」——语音语义上限单源=contracts
      // VOICE_MAX_AUDIO_BYTES(10MB，契约 base64 字符上限由其派生，超限由服务内 413 audio_too_large 兜底)。
      bodyLimit: 12 * 1024 * 1024,
      logger: {
        level: 'info',
        redact: { paths: ['req.headers.authorization', 'req.headers.cookie'], censor: '[REDACTED]' },
      },
      // reqId 单源:与下方 onRequest 钩子同一套净化规则(x-request-id 仅安全字符集+封顶,
      // 非法/空→新 UUID,防响应头 CRLF 注入)。fastify 日志的 reqId === 响应头 x-request-id ===
      // req.reqId(controller→service→job.payload→worker trace)——全链路对账一根 id。
      genReqId: (req: { headers: Record<string, unknown> }) => {
        const raw = String(req.headers['x-request-id'] ?? '').trim();
        return raw && raw.length <= 200 && /^[A-Za-z0-9._-]+$/.test(raw) ? raw : randomUUID();
      },
    }),
    { logger: false, abortOnError: false },
  );
  const fastify = app.getHttpAdapter().getInstance() as any;
  // Public preview's method allowlist must be the first Fastify lifecycle
  // hook: no request body parsing, authentication, controller or queue work
  // occurs for a rejected method.
  installPublicPreviewIngressGate(fastify, publicPreview);
  app.useGlobalFilters(new AllExceptionsFilter());     // 全局异常过滤(修审计 F3):统一信封 + 不泄露内部细节
  // 系统指标:每个 HTTP 响应记请求数(按 method/route/status)+ 延迟直方图。route 用路由模板(低基数,不爆 label)。
  // **全链路 request-id 起点**:有 x-request-id 头(网关/前端上游给)就沿用,没有就生成一根。
  //  放 req.reqId(controller → service → 写进 job.payload → worker → 模型 trace.request_id)+ 回写响应头,让调用方拿到同一根 id 对账。
  //  净化规则已上移到 FastifyAdapter.genReqId(单源):req.id 即净化结果,这里只透传到 req.reqId + 响应头。
  fastify.addHook('onRequest', (req: any, reply: any, done: any) => {
    req.reqId = req.id;
    reply.header('x-request-id', req.reqId);
    done();
  });
  // **传输层封顶(纵深 + 防 DoS 放大)**:全局 bodyLimit 为容 base64 简历/音频上传开到 12MB,但纯文本端点逻辑只需 KB 级。
  // 在 body 缓冲/JSON.parse **之前**拒掉超大请求:仅 base64 上传路由放行到 12MB,其余封 1MB →
  // `{"answer":"<11MB>"}` 这类在传输边界即 413,不会先缓冲 11MB + 同步 parse 阻塞事件循环(审计中:Zod 在 parse 之后才跑,挡不住缓冲)。
  // #34 残半:content-length 只覆盖有头形态——chunked(transfer-encoding)/HTTP/1.0 close-delimited 无 content-length,
  // 下钩 len=0 恒放行 → 差异化 1MiB 封顶失守回落 12MiB 信封。补下方 preParsing 流计数闸:无 content-length 的
  // 非上传请求按**流计数**封同一 SMALL_BODY_LIMIT(案A·chunked 与 content-length 同政策),上传路由不增钩——
  // fastify bodyLimit 的 content-type-parser 流计数对 chunked 已按 12MiB 信封兜底,不重复其职责。
  const UPLOAD_ROUTES = [/\/resume\/file$/, /\/interview\/[^/]+\/transcribe$/];
  const SMALL_BODY_LIMIT = 1 * 1024 * 1024;   // 非上传端点 1MB(简历文本 60000 字 UTF-8 ≈180KB,绰绰有余)
  fastify.addHook('onRequest', (req: any, reply: any, done: any) => {
    const len = Number(req.headers['content-length'] ?? 0);
    if (len > SMALL_BODY_LIMIT) {
      const url = String(req.url ?? '').split('?')[0] ?? '';
      if (!UPLOAD_ROUTES.some((re) => re.test(url))) { reply.code(413).send({ error: 'payload_too_large' }); return; }
    }
    done();
  });
  // #34 残半 chunked 封顶(preParsing 流计数):onRequest 生命周期拿不到 body 流,preParsing 才收到——
  // 仅覆盖**无 content-length** 形(有头路径行为零改,仍走上方 onRequest 钩子);计数包装转发(PassThrough),
  // 超阈即 413 与既有 1MiB 钩子同信封同错码,并销毁包装流停转发(content-type-parser 不再缓冲);
  // GET/HEAD(bodyless)必直通零包装:fastify 对 bodyless 不缓冲不 parse 封顶无对象,且对流挂 data/end
  // 即把 bodyless req.raw 推入 flowing——消息即刻消费完成,'close' 在连接未断时就提前发出,SSE 泵
  // 事后挂的 reqRaw close 侦测失聪(断开后 waiter/槽滞留至 deadline=真泄漏)。超阈后 content-type-parser
  // 对包装流的等待由 reply.sent 短路终结(hooks.js preParsingHookRunner `if (reply.sent) return` + handleRequest 首行守卫)。
  fastify.addHook('preParsing', (req: any, reply: any, body: any, done: any) => {
    const method = String(req.method ?? '').toUpperCase();
    const url = String(req.url ?? '').split('?')[0] ?? '';
    if (method === 'GET' || method === 'HEAD' || UPLOAD_ROUTES.some((re) => re.test(url)) || req.headers['content-length'] !== undefined) { done(null, body); return; }
    const capped = new PassThrough();
    let received = 0;
    let settled = false;
    body.on('data', (chunk: Buffer | string) => {
      if (settled) return;
      received += typeof chunk === 'string' ? Buffer.byteLength(chunk) : chunk.length;
      if (received > SMALL_BODY_LIMIT) {
        settled = true;
        reply.code(413).send({ error: 'payload_too_large' });   // 与既有 1MiB 钩子同信封同错码
        capped.destroy();   // 停转发:下游不再缓冲;请求体未消费,响应后由 Node 关闭连接
        return;
      }
      capped.write(chunk);
    });
    body.once('end', () => { if (!settled) capped.end(); });
    body.once('error', (err: Error) => { if (!settled) capped.destroy(err); });
    done(null, capped);
  });
  fastify.addHook('onResponse', (req: any, reply: any, done: any) => {
    const route = req.routeOptions?.url ?? req.routerPath ?? 'unknown';   // /interview/:id 模板,非具体 id
    const labels = { method: req.method, route };
    getMetrics().inc('http_requests_total', { ...labels, status: String(reply.statusCode) });
    getMetrics().observe('http_request_duration_ms', reply.elapsedTime ?? 0, labels);
    done();
  });
  // CORS:允许浏览器前端(Next)跨域调 api。**生产 fail-closed**(安全审计#4:`?? true` 会反射任意 Origin+credentials)——
  //  生产必须显式配 WEB_ORIGIN,漏配即拒绝启动;非生产才回退放开便于本地点穿。x-user-id 头仅开发回退用。
  const isProd = process.env.NODE_ENV === 'production';
  if (isProd && !process.env.WEB_ORIGIN) throw new Error('WEB_ORIGIN 必须在生产配置(CORS fail-closed,拒绝反射任意 Origin)');
  app.enableCors({
    origin: process.env.WEB_ORIGIN ?? true,   // 非生产才 true
    credentials: true,
    allowedHeaders: ['content-type', 'authorization', ...(isProd ? [] : ['x-user-id']), 'idempotency-key', 'resume-id', 'last-event-id'],
  });
  // 多端契约:从 zod 生成的 OpenAPI(异构端 codegen 源)+ Swagger UI(CDN,免依赖)。public。
  const openapiDoc = buildOpenApiDocument({ servers: [process.env.PUBLIC_API_URL ?? '/'] });
  fastify.get('/openapi.json', (_req: any, reply: any) => { reply.header('cache-control', 'public, max-age=300').send(openapiDoc); });
  fastify.get('/docs', (_req: any, reply: any) => {
    reply.type('text/html').send(`<!doctype html><html><head><meta charset="utf-8"><title>Meetwise API</title>
<link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css"></head>
<body><div id="swagger"></div>
<script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
<script>SwaggerUIBundle({ url: '/openapi.json', dom_id: '#swagger' });</script></body></html>`);
  });
  return app;
}

async function bootstrap() {
  const app = await createApp();
  const port = Number(process.env.PORT || 8787);
  const host = process.env.HOST || '127.0.0.1';   // 默认仅回环;容器/反向代理需显式 HOST=0.0.0.0(审计:默认 0.0.0.0 会把写 API+/docs 暴露到所有网卡)
  // HA-2 W1②:排水拒新门挂在直执行 bootstrap(createApp 复用面零感);序在
  // public-preview 门(其在 createApp 内先行注册)之后、路由 handler 之前。
  const fastify = app.getHttpAdapter().getInstance() as any;
  fastify.addHook('onRequest', drainGateHook(getSseRegistry()));
  await app.listen(port, host);
  console.log(`api on ${host}:${port}`);
  // HA-2 W1①③④:SIGTERM/SIGINT 同链(容器 stop 与本地 Ctrl+C 同语义);deadline
  // API_SHUTDOWN_TIMEOUT_MS 默认 10_000 < 容器宽限(compose.prod api 15s)。
  const rawTimeout = Number(process.env.API_SHUTDOWN_TIMEOUT_MS || 10_000);
  const shutdown = createApiShutdownChain({
    registry: getSseRegistry(),
    closeApp: () => app.close(),
    timeoutMs: Number.isFinite(rawTimeout) && rawTimeout > 0 ? rawTimeout : 10_000,
    exit: (code) => process.exit(code),
    log: console.log,
    error: console.error,
  });
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

// `createApp()` is deliberately exported for real HTTP E2E tests and embedders.
// Importing this module must not also bind the production port: that created a
// hidden second server, obscured test failures, and could race a real worker
// process.  Only the directly executed module owns process bootstrap.
const executedFile = process.argv[1] ? resolve(process.argv[1]) : '';
if (executedFile === fileURLToPath(import.meta.url)) {
  bootstrap().catch((error) => {
    console.error(error instanceof Error ? error.message : 'api_bootstrap_failed');
    process.exitCode = 1;
  });
}
