import 'reflect-metadata';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { getMetrics, resolveModelDeadlineConfig } from '@meetwise/ai-runtime';
import { buildOpenApiDocument } from '@meetwise/contracts/openapi';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './platform/all-exceptions.filter';
import { installPublicPreviewIngressGate, resolvePublicPreviewMode } from './platform/public-preview';

/** 真 NestJS（Fastify + 类型 DI + SWC 运行）。 run: pnpm -C apps/api serve */
export async function createApp(): Promise<NestFastifyApplication> {
  const publicPreview = resolvePublicPreviewMode();
  // Queue producers share the worker's timeout contract; reject a broken
  // deployment before accepting requests that cannot be processed safely.
  // MODEL-OP-02：全局 MODEL_MAX_CONCURRENT/MODEL_RPM 限流已废弃（per-adapter 限流移除），
  // 并发/断路器改由共享权威（迁移 0120 的 ai_model_admission_acquire_scoped）在 invoke() 内裁决。
  resolveModelDeadlineConfig();
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter({ bodyLimit: 12 * 1024 * 1024 }), { logger: false, abortOnError: false });   // 12MB:容 base64 简历文件(8MB 原文)
  const fastify = app.getHttpAdapter().getInstance() as any;
  // Public preview's method allowlist must be the first Fastify lifecycle
  // hook: no request body parsing, authentication, controller or queue work
  // occurs for a rejected method.
  installPublicPreviewIngressGate(fastify, publicPreview);
  app.useGlobalFilters(new AllExceptionsFilter());     // 全局异常过滤(修审计 F3):统一信封 + 不泄露内部细节
  // 系统指标:每个 HTTP 响应记请求数(按 method/route/status)+ 延迟直方图。route 用路由模板(低基数,不爆 label)。
  // **全链路 request-id 起点**:有 x-request-id 头(网关/前端上游给)就沿用,没有就生成一根。
  //  放 req.reqId(controller → service → 写进 job.payload → worker → 模型 trace.request_id)+ 回写响应头,让调用方拿到同一根 id 对账。
  //  客户端可控头需净化:只收安全字符集 + 封顶长度,非法/空 → 换新 UUID(防响应头 CRLF 注入 / 超长值污染 trace 列)。
  fastify.addHook('onRequest', (req: any, reply: any, done: any) => {
    const raw = String(req.headers['x-request-id'] ?? '').trim();
    const reqId = raw && raw.length <= 200 && /^[A-Za-z0-9._-]+$/.test(raw) ? raw : randomUUID();
    req.reqId = reqId;
    reply.header('x-request-id', reqId);
    done();
  });
  // **传输层封顶(纵深 + 防 DoS 放大)**:全局 bodyLimit 为容 base64 简历/音频上传开到 12MB,但纯文本端点逻辑只需 KB 级。
  // 在 body 缓冲/JSON.parse **之前**(onRequest)按 content-length 拒掉超大请求:仅 base64 上传路由放行到 12MB,其余封 1MB →
  // `{"answer":"<11MB>"}` 这类在传输边界即 413,不会先缓冲 11MB + 同步 parse 阻塞事件循环(审计中:Zod 在 parse 之后才跑,挡不住缓冲)。
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
  await app.listen(port, host);
  console.log(`api on ${host}:${port}`);
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
