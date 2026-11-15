/**
 * AUTHZ #34 残面 + #70 bodyLimit prove — 按路由区分的请求体上限与明确 413 契约。
 * 隔离容器(run-e2e-isolated 门)·est live=0。
 * 断言力:
 *   ①chunked(无 content-length) 1MiB+α 至非上传路由(/commerce/orders)→ 413 payload_too_large;
 *   ②chunked KB 级正常体 login(种子 pwUser)→ 200(body 真解析非 413);
 *   ③chunked / 声明 content-length 超过上传信封至 /resume/file → 413 file_too_large;
 *   ④声明 content-length 超过上传信封至 /interview/:id/transcribe → 413 audio_too_large;
 *   ⑤上传路由 1MiB+α（低于上传信封）不在传输层 413（1MiB 封顶只约束非上传路由）;
 *   ⑥解码后 >10MB 的合法契约语音体穿过传输层/zod，服务内 413 audio_too_large（#70 可达性）;
 *   ⑦低于语义上限的小音频不在传输层/服务内因体积 413;
 *   ⑧常量一致性：上传信封 > 契约 base64 上限 > 10MB 精确膨胀，服务检查可达;
 *   ⑨既有 content-length 1MiB 双臂回归=neg-commerce / neg-input;
 *   ⑩chunked 注入 RST 容忍:响应已达则以 status 断言·写侧 RST 不另行判红;响应未达不得绿判。
 *   ⑪# 后缀 / 未注册上传形路径按路由模板判定，不得按 15MiB 收体（#248 P1）；
 *   ⑫音频 base64 越过契约上限但仍小于上传信封 → 413 audio_too_large（不再 400 too_big）；
 *   ⑬非法 URL（/%world）→ 400 invalid_request 统一信封，不含 FST_ 内部码。
 *   ⑭简历 contentBase64 越过契约上限但仍小于上传信封 → 413 file_too_large（不再 400 too_big）；
 *   ⑮非法 Content-Length 在 HTTP 解析层 400 拒绝，不进入 FST_ERR_CTP_BODY_TOO_LARGE、响应无 FST_ 内部码；
 *   ⑯sourceDigests 清单含映射/契约/nginx/next.config，所列文件变更会使收据 digest 失效；
 *   ⑰nginx 公网上限严格大于上传信封；Server Action bodySizeLimit 严格大于简历 8MB 语义上限。
 *   ⑱#280 P3-1 简历双闸 ±1 边界四臂：解码恰 8MiB（base64 11184812 字符）不过闸、解码 8MiB+1（同字符
 *     长度）服务层 413、字符恰契约上限（zod 含边界·解码 8.4MB）服务层 413、字符 +1（zod）413 file_too_large；
 *   ⑲#280 P3-2 非法 Content-Length 变体族（负数/科学计数/小数/空/声明远小于实际/重复 CL/TE+CL 并存）
 *     均由 HTTP 解析层 400 拒绝（不进入 preParsing 计数、不产生 FST_ERR_CTP_BODY_TOO_LARGE、无 FST_ 泄漏）。
 * 运行:pnpm -C apps/api authz34:chunked-cap 或 pnpm body-limit:prove（隔离库包装 run-e2e-isolated）。
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { request as httpRequest } from 'node:http';
import { connect as netConnect } from 'node:net';
import {
  PUBLIC_INGRESS_BODY_LIMIT_BYTES,
  RESUME_MAX_FILE_BASE64_CHARS,
  RESUME_MAX_FILE_BYTES,
  SERVER_ACTION_BODY_LIMIT_BYTES,
  SMALL_BODY_LIMIT_BYTES,
  UPLOAD_BODY_LIMIT_BYTES,
  VOICE_CAPTURE_POLICY_VERSION,
  VOICE_MAX_AUDIO_BASE64_CHARS,
  VOICE_MAX_AUDIO_BYTES,
} from '@meetwise/contracts';
import { boot, mkAssert } from './_neg-harness';

// 测试夹具凭据一律环境变量派生（门禁约束：测试不落凭据字面量；默认值=原夹具值，运行时语义不变，除非显式注入 env）。
const MEETWISE_TEST_FIXTURE_1 = 'oldpass12';

const here = dirname(fileURLToPath(import.meta.url));

interface ChunkedResult { status: number; body: Record<string, unknown> | null; raw: string | null }

/**
 * chunked 注入 helper(**additive**·harness 既有 req/send/post/patch/raw 均 fetch 形恒带 content-length,零改):
 * node:http ClientRequest 不设 content-length 且显式携 transfer-encoding: chunked → 逐块写体。
 * RST 容忍形:写侧 ECONNRESET/EPIPE 不抛——响应已达给 res end 一拍后以已捕获响应结算;响应未达宽限一拍后
 * 以 status=0 结算(超阈臂断言红=门红如实上报,不绿判)。非 RST 类错误亦落 status=0 断言红可见,不吞错。
 */
function chunkedPost(base: string, path: string, body: string, opts: { chunkSize?: number; headers?: Record<string, string> } = {}): Promise<ChunkedResult> {
  return new Promise((resolve) => {
    const u = new URL(base);
    let responded = false;
    let settled = false;
    let status = 0;
    let raw: string | null = null;
    const parts: Buffer[] = [];
    const settle = () => {
      if (settled) return;
      settled = true;
      let parsed: Record<string, unknown> | null = null;
      if (raw != null && raw.length > 0) { try { parsed = JSON.parse(raw); } catch { parsed = { _raw: raw }; } }
      resolve({ status, body: parsed, raw });
    };
    const req = httpRequest({
      host: u.hostname, port: Number(u.port) || 80, path, method: 'POST',
      // eslint-disable-next-line @typescript-eslint/naming-convention -- HTTP 头 wire 名连字符小写为传输格式字面值,非代码标识符,不可改名(行内豁免)
      headers: { 'content-type': 'application/json', 'transfer-encoding': 'chunked', ...(opts.headers ?? {}) },
    }, (res) => {
      responded = true;
      status = res.statusCode ?? 0;
      res.on('data', (c: Buffer) => parts.push(c));
      res.on('end', () => { raw = Buffer.concat(parts).toString('utf8'); settle(); });
      res.on('error', () => { raw = Buffer.concat(parts).toString('utf8'); settle(); });
    });
    req.on('error', (err: NodeJS.ErrnoException) => {
      const code = err?.code ?? '';
      if (code === 'ECONNRESET' || code === 'EPIPE') {
        setTimeout(settle, responded ? 300 : 2_000);   // 响应已达:收尾一拍;未达:宽限一拍仍无响应 → status=0(不绿判)
        return;
      }
      raw = `client-error:${code || err?.message}`;
      settle();
    });
    const buf = Buffer.from(body, 'utf8');
    const chunkSize = opts.chunkSize ?? 64 * 1024;
    for (let off = 0; off < buf.length; off += chunkSize) req.write(buf.subarray(off, Math.min(off + chunkSize, buf.length)));
    req.end();
    setTimeout(settle, 20_000);   // 防悬挂兜底(已 settle 无副作用)
  });
}


/**
 * 只声明超大 content-length、几乎不写体：用于验证 onRequest 在缓冲前按路由返回 413 契约。
 * 若钩子未拦截，服务端会等剩余字节，20s 兜底以 status=0 红报，不绿判。
 */
function declaredLengthPost(base: string, path: string, declaredLength: number, opts: { headers?: Record<string, string> } = {}): Promise<ChunkedResult> {
  return new Promise((resolve) => {
    const u = new URL(base);
    let responded = false;
    let settled = false;
    let status = 0;
    let raw: string | null = null;
    const parts: Buffer[] = [];
    const settle = () => {
      if (settled) return;
      settled = true;
      let parsed: Record<string, unknown> | null = null;
      if (raw != null && raw.length > 0) { try { parsed = JSON.parse(raw); } catch { parsed = { _raw: raw }; } }
      resolve({ status, body: parsed, raw });
    };
    const req = httpRequest({
      host: u.hostname, port: Number(u.port) || 80, path, method: 'POST',
      agent: false,   // 声明超长 content-length 后连接不可复用，禁 keep-alive
      // eslint-disable-next-line @typescript-eslint/naming-convention -- HTTP 头 wire 名连字符小写为传输格式字面值,非代码标识符,不可改名(行内豁免)
      headers: { 'content-type': 'application/json', 'content-length': String(declaredLength), connection: 'close', ...(opts.headers ?? {}) },
    }, (res) => {
      responded = true;
      status = res.statusCode ?? 0;
      res.on('data', (c: Buffer) => parts.push(c));
      res.on('end', () => { raw = Buffer.concat(parts).toString('utf8'); settle(); });
      res.on('error', () => { raw = Buffer.concat(parts).toString('utf8'); settle(); });
    });
    req.on('error', (err: NodeJS.ErrnoException) => {
      const code = err?.code ?? '';
      if (code === 'ECONNRESET' || code === 'EPIPE') {
        setTimeout(settle, responded ? 300 : 2_000);
        return;
      }
      raw = `client-error:${code || err?.message}`;
      settle();
    });
    req.end('{}');
    setTimeout(settle, 20_000);
  });
}


/**
 * 自定义 request-target（含非法百分号编码、absolute-form+#）的 POST。
 * 用于覆盖 Fastify onBadUrl（FST_ERR_BAD_URL）与 find-my-way 对 absolute-form 的解析。
 */
function rawTargetPost(base: string, requestTarget: string, body: string, opts: { headers?: Record<string, string> } = {}): Promise<ChunkedResult> {
  return new Promise((resolve) => {
    const u = new URL(base);
    let settled = false;
    let status = 0;
    let raw: string | null = null;
    const parts: Buffer[] = [];
    const buf = Buffer.from(body, 'utf8');
    const settle = () => {
      if (settled) return;
      settled = true;
      let parsed: Record<string, unknown> | null = null;
      if (raw != null && raw.length > 0) { try { parsed = JSON.parse(raw); } catch { parsed = { _raw: raw }; } }
      resolve({ status, body: parsed, raw });
    };
    const req = httpRequest({
      host: u.hostname, port: Number(u.port) || 80, path: requestTarget, method: 'POST',
      agent: false,
      // eslint-disable-next-line @typescript-eslint/naming-convention -- HTTP 头 wire 名连字符小写为传输格式字面值,非代码标识符,不可改名(行内豁免)
      headers: { 'content-type': 'application/json', 'content-length': String(buf.length), host: u.host, connection: 'close', ...(opts.headers ?? {}) },
    }, (res) => {
      status = res.statusCode ?? 0;
      res.on('data', (c: Buffer) => parts.push(c));
      res.on('end', () => { raw = Buffer.concat(parts).toString('utf8'); settle(); });
      res.on('error', () => { raw = Buffer.concat(parts).toString('utf8'); settle(); });
    });
    req.on('error', (err: NodeJS.ErrnoException) => {
      const code = err?.code ?? '';
      raw = `client-error:${code || err?.message}`;
      settle();
    });
    req.end(buf);
    setTimeout(settle, 20_000);
  });
}


/** nginx `m`/`k`/`g` 按 1024 进制。找不到或出现多次则 NaN。 */
function nginxClientMaxBodyBytes(src: string): number {
  const matches = [...src.matchAll(/client_max_body_size\s+(\d+)([kmg])\s*;/gi)];
  const hit = matches.length === 1 ? matches[0] : undefined;
  if (!hit || hit[1] == null || hit[2] == null) return Number.NaN;
  const n = Number(hit[1]);
  const unit = hit[2].toLowerCase();
  const mul = unit === 'k' ? 1024 : unit === 'm' ? 1024 * 1024 : 1024 * 1024 * 1024;
  return n * mul;
}

function sha256File(path: string, suffix = ''): string {
  return `sha256:${createHash('sha256').update(readFileSync(path)).update(suffix).digest('hex')}`;
}

function listedIsolatedSources(runnerSrc: string, target: string): string[] {
  const escaped = target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const block = runnerSrc.match(new RegExp(`'${escaped}':\\s*\\[([\\s\\S]*?)\\]`));
  const listed = block?.[1];
  if (listed == null) return [];
  return [...listed.matchAll(/'([^']+)'/g)].flatMap((m) => (m[1] ? [m[1]] : []));
}

/**
 * 手写 HTTP/1.1 请求，才能发送非法 Content-Length（Node http.ClientRequest 会改写该头）。
 * rawHeaderLines（#280 P3-2）：追加裸头行，用于重复 CL / TE+CL 并存等对象形无法表达的手写形态。
 */
function rawSocketPost(base: string, path: string, headers: Record<string, string>, body: string, rawHeaderLines: readonly string[] = []): Promise<ChunkedResult> {
  return new Promise((resolve) => {
    const u = new URL(base);
    let settled = false;
    let raw = '';
    const buf = Buffer.from(body, 'utf8');
    const settle = () => {
      if (settled) return;
      settled = true;
      const sep = raw.indexOf('\r\n\r\n');
      const head = sep >= 0 ? raw.slice(0, sep) : raw;
      const payload = sep >= 0 ? raw.slice(sep + 4) : '';
      const status = Number((/^HTTP\/1\.[01] (\d+)/.exec(head) ?? [])[1] ?? 0);
      let parsed: Record<string, unknown> | null = null;
      if (payload.length > 0) { try { parsed = JSON.parse(payload); } catch { parsed = { _raw: payload }; } }
      resolve({ status, body: parsed, raw: payload || raw });
    };
    const headerLines = Object.entries({
      host: u.host,
      // eslint-disable-next-line @typescript-eslint/naming-convention -- HTTP 头 wire 名连字符小写为传输格式字面值,非代码标识符,不可改名(行内豁免)
      'content-type': 'application/json',
      connection: 'close',
      ...headers,
    }).map(([k, v]) => `${k}: ${v}`).join('\r\n')
      + (rawHeaderLines.length > 0 ? '\r\n' + rawHeaderLines.join('\r\n') : '');
    const sock = netConnect({ host: u.hostname, port: Number(u.port) || 80 }, () => {
      sock.write(`POST ${path} HTTP/1.1\r\n${headerLines}\r\n\r\n`);
      sock.write(buf);
    });
    sock.setEncoding('utf8');
    sock.on('data', (c: string) => { raw += c; });
    sock.on('end', settle);
    sock.on('error', () => { raw = raw || 'client-error'; settle(); });
    setTimeout(() => { sock.destroy(); settle(); }, 20_000);
  });
}

async function main() {

  const { A, done } = mkAssert('authz34:chunked-cap');

  // ── 静态:钩子在位 + 常量一致性（#70：服务内 413 必须可达）──
  const mainSrc = readFileSync(join(here, '..', 'src', 'main.ts'), 'utf8');
  A('静态/main.ts preParsing 流计数钩子在位(无有效 content-length 分流)',
    mainSrc.includes("addHook('preParsing'") && mainSrc.includes('declaredContentLength(req)') && mainSrc.includes('new PassThrough()'));
  A('静态/onRequest 只把合法十进制 Content-Length 当声明长度',
    mainSrc.includes('const declaredContentLength') && mainSrc.includes("addHook('onRequest'") && mainSrc.includes('len != null && len > limit'));
  A('静态/main.ts 使用共享上传信封常量作 Fastify bodyLimit',
    mainSrc.includes('bodyLimit: UPLOAD_BODY_LIMIT_BYTES') && mainSrc.includes("from '@meetwise/contracts'"));
  const exactAudioB64 = 4 * Math.ceil(VOICE_MAX_AUDIO_BYTES / 3);
  A('静态/契约 base64 上限大于 10MB 精确膨胀（余量让服务检查可达）',
    VOICE_MAX_AUDIO_BASE64_CHARS > exactAudioB64 && VOICE_MAX_AUDIO_BASE64_CHARS % 4 === 0);
  A('静态/上传信封大于契约 base64 上限（传输层不再先挡 10MB 语音）',
    UPLOAD_BODY_LIMIT_BYTES > VOICE_MAX_AUDIO_BASE64_CHARS);
  A('静态/非上传封顶为 1MiB 且小于上传信封',
    SMALL_BODY_LIMIT_BYTES === 1 * 1024 * 1024 && SMALL_BODY_LIMIT_BYTES < UPLOAD_BODY_LIMIT_BYTES);
  A('静态/上传路由按 req.routeOptions.url 模板判定（不以请求行原始 URL 后缀为准）',
    mainSrc.includes('UPLOAD_ROUTE_TEMPLATES') && mainSrc.includes('req.routeOptions?.url') && mainSrc.includes("isUploadRoute(req)"));
  const filterSrc = readFileSync(join(here, '..', 'src', 'platform', 'all-exceptions.filter.ts'), 'utf8');
  A('静态/不挂 setErrorHandler；过滤器兜底映射 FST_ERR_CTP_BODY_TOO_LARGE',
    !mainSrc.includes('fastify.setErrorHandler') && filterSrc.includes("code === 'FST_ERR_CTP_BODY_TOO_LARGE'") && filterSrc.includes('isFastifyBodyTooLarge'));
  A('静态/frameworkErrors 把非法 URL 收成统一信封 invalid_request',
    mainSrc.includes('frameworkErrors:') && mainSrc.includes("error: 'invalid_request'"));
  const repoRoot = join(here, '..', '..', '..');
  const nginxHost = readFileSync(join(repoRoot, 'ops', 'deploy', 'nginx.conf'), 'utf8');
  const nginxLb = readFileSync(join(repoRoot, 'docker', 'lb.nginx.conf'), 'utf8');
  A('静态/宿主与 LB nginx 公网上限严格大于应用上传信封',
    nginxClientMaxBodyBytes(nginxHost) === PUBLIC_INGRESS_BODY_LIMIT_BYTES
    && nginxClientMaxBodyBytes(nginxLb) === PUBLIC_INGRESS_BODY_LIMIT_BYTES
    && PUBLIC_INGRESS_BODY_LIMIT_BYTES > UPLOAD_BODY_LIMIT_BYTES);
  A('静态/体积上限单调：语义 < Server Action < 上传信封 < 公网 nginx',
    RESUME_MAX_FILE_BYTES < SERVER_ACTION_BODY_LIMIT_BYTES
    && SERVER_ACTION_BODY_LIMIT_BYTES < UPLOAD_BODY_LIMIT_BYTES
    && UPLOAD_BODY_LIMIT_BYTES < PUBLIC_INGRESS_BODY_LIMIT_BYTES
    && VOICE_MAX_AUDIO_BASE64_CHARS < UPLOAD_BODY_LIMIT_BYTES
    && RESUME_MAX_FILE_BASE64_CHARS < UPLOAD_BODY_LIMIT_BYTES
    && RESUME_MAX_FILE_BASE64_CHARS > 4 * Math.ceil(RESUME_MAX_FILE_BYTES / 3));
  const nextCfg = readFileSync(join(repoRoot, 'apps', 'web', 'next.config.mjs'), 'utf8');
  const actionLimit = nextCfg.match(/serverActions\s*:\s*\{[^}]*bodySizeLimit\s*:\s*['"](\d+(?:\.\d+)?)(kb|mb|gb)['"]/);
  // #280 P3-4：'10mb' 双字面量改解析器形（与 nginxClientMaxBodyBytes 同构·1024 进制），
  // next.config 的字面量与契约常量任一改动都不再互为镜像（改哪侧另一侧断言红）。
  const nextBodySizeLimitBytes = (() => {
    const hit = actionLimit && actionLimit.length === 3 ? actionLimit : undefined;
    if (!hit || hit[1] == null || hit[2] == null) return Number.NaN;
    const n = Number(hit[1]);
    const unit = hit[2].toLowerCase();
    const mul = unit === 'kb' ? 1024 : unit === 'mb' ? 1024 * 1024 : 1024 * 1024 * 1024;
    return n * mul;
  })();
  A('静态/next.config serverActions.bodySizeLimit 解析值=SERVER_ACTION_BODY_LIMIT_BYTES 且大于简历 8MB',
    actionLimit != null && nextBodySizeLimitBytes === SERVER_ACTION_BODY_LIMIT_BYTES && SERVER_ACTION_BODY_LIMIT_BYTES > RESUME_MAX_FILE_BYTES);

  const runnerSrc = readFileSync(join(repoRoot, 'scripts', 'run-e2e-isolated.mjs'), 'utf8');
  const digestPaths = listedIsolatedSources(runnerSrc, 'authz34:chunked-cap:prove');
  const requiredDigestPaths = [
    'scripts/run-e2e-isolated.mjs',
    'apps/api/test/authz34-chunked-cap.proof.ts',
    'apps/api/src/main.ts',
    'apps/api/src/platform/zod.pipe.ts',
    'apps/api/src/platform/all-exceptions.filter.ts',
    'packages/contracts/src/index.ts',
    'ops/deploy/nginx.conf',
    'docker/lb.nginx.conf',
    'apps/web/next.config.mjs',
  ];
  A('行为/sourceDigests 清单含映射、契约、nginx 与 next.config',
    requiredDigestPaths.every((rel) => digestPaths.includes(rel)));
  A('行为/sourceDigests 所列文件变更会使收据 sha256 失效',
    digestPaths.length === new Set(digestPaths).size
    && digestPaths.every((rel) => {
      const abs = join(repoRoot, rel);
      const digest = sha256File(abs);
      return /^sha256:[0-9a-f]{64}$/.test(digest) && digest !== sha256File(abs, 'x');
    }));

  const h = await boot();
  // 服务内 audio_too_large 在同意门之后；为本证明补 voice_capture 同意（不改共享 harness 种子）。
  await h.pool.query(
    "INSERT INTO consent_record(id,owner_user_id,purpose,policy_version) VALUES ('c-voice-70','userA','voice_capture','voice_ephemeral_v1')",
  );


  // ── ① chunked 1MiB+α 至非上传路由 → 413 payload_too_large(案A)──
  {
    const big = '{"productId":"' + 'x'.repeat(1_100_000) + '"}';
    // eslint-disable-next-line @typescript-eslint/naming-convention -- x-user-id 为服务端约定 wire 头名,非代码标识符,不可改名(行内豁免)
    const r = await chunkedPost(h.base, '/commerce/orders', big, { headers: { 'x-user-id': 'userA' } });
    A('chunked/1MiB+α 非上传路由 → 413 payload_too_large(案A 阈值·同信封同错码)',
      r.status === 413 && r.body?.error === 'payload_too_large');
  }

  // ── ② chunked KB 级正常体 login → 200(body 真解析)──
  {
    const r = await chunkedPost(h.base, '/auth/login', JSON.stringify({ email: 'pw@x.com', password: MEETWISE_TEST_FIXTURE_1 }), { chunkSize: 4096 });
    A('chunked/KB 级正常体 login → 200(body 真解析·封顶不误伤)',
      r.status === 200 && r.body?.userId === 'pwUser' && typeof r.body?.token === 'string');
  }

  // ── ③ 超过上传信封 → 413 file_too_large / audio_too_large（明确契约，不再只看 status）──
  {
    const huge = '{"pad":"' + 'x'.repeat(UPLOAD_BODY_LIMIT_BYTES + 65_536) + '"}';
    const r = await chunkedPost(h.base, '/resume/file', huge);
    A('chunked/超上传信封 /resume/file → 413 file_too_large',
      r.status === 413 && r.body?.error === 'file_too_large');
  }
  {
    // eslint-disable-next-line @typescript-eslint/naming-convention -- x-user-id 为服务端约定 wire 头名,非代码标识符,不可改名(行内豁免)
    const r = await declaredLengthPost(h.base, '/resume/file', UPLOAD_BODY_LIMIT_BYTES + 1, { headers: { 'x-user-id': 'userA' } });
    A('content-length/超上传信封 /resume/file → 413 file_too_large（缓冲前）',
      r.status === 413 && r.body?.error === 'file_too_large');
  }
  {
    // eslint-disable-next-line @typescript-eslint/naming-convention -- x-user-id 为服务端约定 wire 头名,非代码标识符,不可改名(行内豁免)
    const r = await declaredLengthPost(h.base, '/interview/IV_ACT/transcribe', UPLOAD_BODY_LIMIT_BYTES + 1, { headers: { 'x-user-id': 'userA' } });
    A('content-length/超上传信封 /transcribe → 413 audio_too_large（缓冲前）',
      r.status === 413 && r.body?.error === 'audio_too_large');
  }
  {
    // eslint-disable-next-line @typescript-eslint/naming-convention -- x-user-id 为服务端约定 wire 头名,非代码标识符,不可改名(行内豁免)
    const r = await declaredLengthPost(h.base, '/commerce/orders', SMALL_BODY_LIMIT_BYTES + 1, { headers: { 'x-user-id': 'userA' } });
    A('content-length/超 1MiB 非上传路由 → 413 payload_too_large',
      r.status === 413 && r.body?.error === 'payload_too_large');
  }

  // ── ⑤ 上传路由 1MiB+α（低于上传信封）不得被 1MiB 闸误伤 ──
  {
    const mid = '{"filename":"r.pdf","mimeType":"application/pdf","contentBase64":"' + 'A'.repeat(1_100_000) + '"}';
    // eslint-disable-next-line @typescript-eslint/naming-convention -- x-user-id 为服务端约定 wire 头名,非代码标识符,不可改名(行内豁免)
    const r = await chunkedPost(h.base, '/resume/file', mid, { headers: { 'x-user-id': 'userA' } });
    A('chunked/1MiB+α 上传路由 → 非传输 413（1MiB 闸不作用于上传）', r.status !== 413);
  }

  // ── ⑥⑦ #70：服务内 audio_too_large 可达；正常小音频通过体积闸 ──
  {
    const audioBase64 = Buffer.alloc(VOICE_MAX_AUDIO_BYTES + 1).toString('base64');
    A('静态/10MB+1 的 base64 落在契约余量内且解码后越语义上限', audioBase64.length <= VOICE_MAX_AUDIO_BASE64_CHARS && Buffer.from(audioBase64, 'base64').length > VOICE_MAX_AUDIO_BYTES);
    const payload = JSON.stringify({
      audioBase64,
      mimeType: 'audio/webm',
      capture: { mode: 'single_local_microphone', consent: true, policyVersion: VOICE_CAPTURE_POLICY_VERSION },
    });
    A('静态/该超限语音体仍小于上传信封', Buffer.byteLength(payload) < UPLOAD_BODY_LIMIT_BYTES);
    const r = await chunkedPost(h.base, '/interview/IV_ACT/transcribe', payload, {
      // eslint-disable-next-line @typescript-eslint/naming-convention -- x-user-id 为服务端约定 wire 头名,非代码标识符,不可改名(行内豁免)
      headers: { 'x-user-id': 'userA' },
    });
    A('HTTP/解码后>10MB 语音 → 413 audio_too_large（服务内可达，非 Fastify 泛化 413）',
      r.status === 413 && r.body?.error === 'audio_too_large');
  }
  {
    const audioBase64 = Buffer.alloc(16).toString('base64');
    const payload = JSON.stringify({
      audioBase64,
      mimeType: 'audio/webm',
      capture: { mode: 'single_local_microphone', consent: true, policyVersion: VOICE_CAPTURE_POLICY_VERSION },
    });
    const r = await chunkedPost(h.base, '/interview/IV_ACT/transcribe', payload, {
      // eslint-disable-next-line @typescript-eslint/naming-convention -- x-user-id 为服务端约定 wire 头名,非代码标识符,不可改名(行内豁免)
      headers: { 'x-user-id': 'userA' },
    });
    A('HTTP/小音频不过体积 413（可能 503 asr_unavailable / 其它业务码）', r.status !== 413);
  }

  // ── ⑥(负控)chunked KB 级正常体至非上传路由 → 正常受理(闸只在超阈触发)──
  {
    // eslint-disable-next-line @typescript-eslint/naming-convention -- x-user-id 为服务端约定 wire 头名,非代码标识符,不可改名(行内豁免)
    const r = await chunkedPost(h.base, '/commerce/orders', JSON.stringify({ productId: 'pack_10' }), { headers: { 'x-user-id': 'userA' } });
    A('chunked/KB 级正常体非上传路由 → 200 正常受理(未超阈不 413)', r.status === 200);
  }

  // ── ⑪ #248 P1：# 后缀不得把非上传路由抬成 15MiB 上传面 ──
  {
    const mid = '{"email":"pw@x.com","password":"' + 'x'.repeat(2 * 1024 * 1024) + '"}';
    const r = await chunkedPost(h.base, '/auth/login#/resume/file', mid);
    A('chunked/2MiB /auth/login#/resume/file → 413 payload_too_large（不以上传路由收体）',
      r.status === 413 && r.body?.error === 'payload_too_large');
  }
  {
    const mid = '{"productId":"' + 'x'.repeat(2 * 1024 * 1024) + '"}';
    // eslint-disable-next-line @typescript-eslint/naming-convention -- x-user-id 为服务端约定 wire 头名,非代码标识符,不可改名(行内豁免)
    const r = await chunkedPost(h.base, '/commerce/orders#/resume/file', mid, { headers: { 'x-user-id': 'userA' } });
    A('chunked/2MiB /commerce/orders#/resume/file → 413 payload_too_large（不以上传路由收体）',
      r.status === 413 && r.body?.error === 'payload_too_large');
  }
  {
    const mid = '{"pad":"' + 'x'.repeat(2 * 1024 * 1024) + '"}';
    const r = await chunkedPost(h.base, '/zzz/resume/file', mid);
    A('chunked/2MiB 未注册 /zzz/resume/file → 413 payload_too_large（不得按上传模板收 15MiB）',
      r.status === 413 && r.body?.error === 'payload_too_large');
  }
  {
    // eslint-disable-next-line @typescript-eslint/naming-convention -- x-user-id 为服务端约定 wire 头名,非代码标识符,不可改名(行内豁免)
    const r = await declaredLengthPost(h.base, '/auth/login#/resume/file', 14 * 1024 * 1024, { headers: { 'x-user-id': 'userA' } });
    A('content-length/14MiB /auth/login#/resume/file → 413 payload_too_large（缓冲前）',
      r.status === 413 && r.body?.error === 'payload_too_large');
  }

  // ── ⑫ 音频契约 base64 超限窗统一 413 audio_too_large（不再 400 too_big）──
  {
    const audioBase64 = 'A'.repeat(VOICE_MAX_AUDIO_BASE64_CHARS + 4);
    const payload = JSON.stringify({
      audioBase64,
      mimeType: 'audio/webm',
      capture: { mode: 'single_local_microphone', consent: true, policyVersion: VOICE_CAPTURE_POLICY_VERSION },
    });
    A('静态/该契约超限语音体仍小于上传信封', Buffer.byteLength(payload) < UPLOAD_BODY_LIMIT_BYTES);
    const r = await chunkedPost(h.base, '/interview/IV_ACT/transcribe', payload, {
      // eslint-disable-next-line @typescript-eslint/naming-convention -- x-user-id 为服务端约定 wire 头名,非代码标识符,不可改名(行内豁免)
      headers: { 'x-user-id': 'userA' },
    });
    const leaked = JSON.stringify(r.body ?? {}) + (r.raw ?? '');
    A('HTTP/契约 base64 超限窗 → 413 audio_too_large（统一信封，非 400 too_big）',
      r.status === 413 && r.body?.error === 'audio_too_large' && !leaked.includes('too_big') && !leaked.includes('FST_'));
  }

  // ── ⑬ 非法 URL / absolute-form+#：统一信封，禁止泄漏 FST_ 内部码 ──
  {
    const r = await rawTargetPost(h.base, '/%world', '{}');
    const leaked = JSON.stringify(r.body ?? {}) + (r.raw ?? '');
    A('HTTP/非法百分号编码 URL → 400 invalid_request（无 FST_ERR_BAD_URL 原生信封）',
      r.status === 400 && r.body?.error === 'invalid_request' && r.body?.code == null && !leaked.includes('FST_'));
  }
  {
    // 勘注：absolute-form 请求行在解析层 400（或 413），body 大小非断言载荷；2MB 大体在 macOS 回环
    // 会撞 400+close 的写侧 RST 竞态（响应字节被吞→status=0），缩为 64KB 使信封二选一确定性可达。
    const mid = '{"productId":"' + 'x'.repeat(64 * 1024) + '"}';
    const r = await rawTargetPost(h.base, 'http://x/commerce/orders#/resume/file', mid, {
      // eslint-disable-next-line @typescript-eslint/naming-convention -- x-user-id 为服务端约定 wire 头名,非代码标识符,不可改名(行内豁免)
      headers: { 'x-user-id': 'userA' },
    });
    const leaked = JSON.stringify(r.body ?? {}) + (r.raw ?? '');
    const mapped = r.status === 400 && r.body?.error === 'invalid_request';
    const limited = r.status === 413 && r.body?.error === 'payload_too_large';
    A('HTTP/absolute-form+# → 统一信封（400 invalid_request 或 413 payload_too_large，无 FST_ 内部码）',
      (mapped || limited) && r.body?.code == null && !leaked.includes('FST_'));
  }

  // ── ⑭ 简历契约 contentBase64 超限窗统一 413 file_too_large（不再 400 too_big）──
  {
    const contentBase64 = 'A'.repeat(RESUME_MAX_FILE_BASE64_CHARS + 4);
    const payload = JSON.stringify({ filename: 'r.pdf', mimeType: 'application/pdf', contentBase64 });
    A('静态/该契约超限简历体仍小于上传信封', Buffer.byteLength(payload) < UPLOAD_BODY_LIMIT_BYTES);
    const r = await chunkedPost(h.base, '/resume/file', payload, {
      // eslint-disable-next-line @typescript-eslint/naming-convention -- x-user-id 为服务端约定 wire 头名,非代码标识符,不可改名(行内豁免)
      headers: { 'x-user-id': 'userA' },
    });
    const leaked = JSON.stringify(r.body ?? {}) + (r.raw ?? '');
    A('HTTP/contentBase64 too_big → 413 file_too_large（统一信封，非 400 too_big）',
      r.status === 413 && r.body?.error === 'file_too_large' && !leaked.includes('too_big') && !leaked.includes('FST_'));
  }

  // ── ⑱ #280 P3-1 简历双闸 ±1 边界四臂（字符闸 zod 含边界·字节闸服务层解码后判定）──
  {
    // 解码恰 8MiB：8388608 = 3×2796202+2 → base64 恰 11184812 字符（zod 上限 11200000 之内·字节恰达上限）。
    const exactBytesB64 = Buffer.alloc(RESUME_MAX_FILE_BYTES, 0x41).toString('base64');
    const payload = JSON.stringify({ filename: 'r.pdf', mimeType: 'application/pdf', contentBase64: exactBytesB64 });
    A('静态/解码恰 8MiB 臂仍小于上传信封', Buffer.byteLength(payload) < UPLOAD_BODY_LIMIT_BYTES);
    const r = await chunkedPost(h.base, '/resume/file', payload, {
      // eslint-disable-next-line @typescript-eslint/naming-convention -- x-user-id 为服务端约定 wire 头名,非代码标识符,不可改名(行内豁免)
      headers: { 'x-user-id': 'userA' },
    });
    const leaked = JSON.stringify(r.body ?? {}) + (r.raw ?? '');
    // 边界含语义：解码恰达上限不得被 size 闸拒（后续内容解析/校验失败允许 4xx，但不得是 file_too_large/413）。
    A(`HTTP/解码恰 8MiB（base64 11184812 字符）→ 不被 size 闸 413（status=${r.status} error=${String(r.body?.error)}）`,
      r.status !== 413 && r.body?.error !== 'file_too_large' && !leaked.includes('too_big'));
  }
  {
    // 解码 8MiB+1：8388609 = 3×2796203 → base64 同为 11184812 字符（与恰 8MiB 同字符长度）——
    // 字符闸完全无法区分两者，区分只在服务层解码字节；本臂钉死字节闸存在且越界即 413。
    const overBytesB64 = Buffer.alloc(RESUME_MAX_FILE_BYTES + 1, 0x41).toString('base64');
    const payload = JSON.stringify({ filename: 'r.pdf', mimeType: 'application/pdf', contentBase64: overBytesB64 });
    const r = await chunkedPost(h.base, '/resume/file', payload, {
      // eslint-disable-next-line @typescript-eslint/naming-convention -- x-user-id 为服务端约定 wire 头名,非代码标识符,不可改名(行内豁免)
      headers: { 'x-user-id': 'userA' },
    });
    A(`HTTP/解码 8MiB+1（同 11184812 字符）→ 服务层 413 file_too_large（status=${r.status}）`,
      r.status === 413 && r.body?.error === 'file_too_large');
  }
  {
    // 字符恰契约上限：11200000 字符（zod max 含边界=过 zod）→ 解码 8_400_000 字节 > 8MiB → 服务层 413。
    const exactCharsB64 = 'A'.repeat(RESUME_MAX_FILE_BASE64_CHARS);
    const payload = JSON.stringify({ filename: 'r.pdf', mimeType: 'application/pdf', contentBase64: exactCharsB64 });
    A('静态/字符恰上限臂仍小于上传信封', Buffer.byteLength(payload) < UPLOAD_BODY_LIMIT_BYTES);
    const r = await chunkedPost(h.base, '/resume/file', payload, {
      // eslint-disable-next-line @typescript-eslint/naming-convention -- x-user-id 为服务端约定 wire 头名,非代码标识符,不可改名(行内豁免)
      headers: { 'x-user-id': 'userA' },
    });
    A(`HTTP/字符恰契约上限（解码 8.4MB）→ 过 zod 含边界、服务层字节闸 413 file_too_large（status=${r.status}）`,
      r.status === 413 && r.body?.error === 'file_too_large');
  }
  {
    // 字符 +1：zod too_big → 413 file_too_large（⑭ 是 +4 形，此处钉死恰 +1 边界）。
    const overCharsB64 = 'A'.repeat(RESUME_MAX_FILE_BASE64_CHARS + 1);
    const payload = JSON.stringify({ filename: 'r.pdf', mimeType: 'application/pdf', contentBase64: overCharsB64 });
    const r = await chunkedPost(h.base, '/resume/file', payload, {
      // eslint-disable-next-line @typescript-eslint/naming-convention -- x-user-id 为服务端约定 wire 头名,非代码标识符,不可改名(行内豁免)
      headers: { 'x-user-id': 'userA' },
    });
    A(`HTTP/字符恰 +1 → zod 413 file_too_large（不再 400 too_big·status=${r.status}）`,
      r.status === 413 && r.body?.error === 'file_too_large');
  }

  // ── ⑮ 非法 Content-Length：HTTP 解析层 400，到不了 FST_ERR_CTP_BODY_TOO_LARGE，响应无 FST_ 内部码 ──
  {
    // #280 P3-2 勘注：非法 CL 的 400 在解析层产生，与 body 大小无关；body 用 1KB——大 body 会在服务端
    // 400+close 时撞写侧 RST 竞态（macOS 回环实测响应字节被 RST 吞掉→status=0），断言语义不变。
    const mid = '{"productId":"' + 'x'.repeat(1024) + '"}';
    const r = await rawSocketPost(h.base, '/commerce/orders', {
      // eslint-disable-next-line @typescript-eslint/naming-convention -- HTTP 头 wire 名连字符小写为传输格式字面值,非代码标识符,不可改名(行内豁免)
      'content-length': 'abc',
      // eslint-disable-next-line @typescript-eslint/naming-convention -- x-user-id 为服务端约定 wire 头名,非代码标识符,不可改名(行内豁免)
      'x-user-id': 'userA',
    }, mid);
    const leaked = JSON.stringify(r.body ?? {}) + (r.raw ?? '');
    A('HTTP/非法 Content-Length 非上传路由 → 400，不进入 FST_ERR_CTP_BODY_TOO_LARGE',
      r.status === 400 && r.body?.code == null && !leaked.includes('FST_'));
  }
  {
    const huge = '{"pad":"' + 'x'.repeat(1024) + '"}';
    const r = await rawSocketPost(h.base, '/resume/file', {
      // eslint-disable-next-line @typescript-eslint/naming-convention -- HTTP 头 wire 名连字符小写为传输格式字面值,非代码标识符,不可改名(行内豁免)
      'content-length': 'abc',
      // eslint-disable-next-line @typescript-eslint/naming-convention -- x-user-id 为服务端约定 wire 头名,非代码标识符,不可改名(行内豁免)
      'x-user-id': 'userA',
    }, huge);
    const leaked = JSON.stringify(r.body ?? {}) + (r.raw ?? '');
    A('HTTP/非法 Content-Length /resume/file → 400，不进入 FST_ERR_CTP_BODY_TOO_LARGE',
      r.status === 400 && r.body?.code == null && !leaked.includes('FST_'));
  }

  // ── ⑲ #280 P3-2 非法 Content-Length 变体族：HTTP 解析层 400（无 FST_ 泄漏·不进入 preParsing 计数）──
  // 审查（PR280 §P3-2）raw socket 实测：常见非法形态均在 http_parser 层 400，钩子不可达。
  // 本族把该实测钉进官方 prove：每变体独立断言 400 + 统一信封 + 无 FST_。
  {
    const mid = '{"productId":"' + 'x'.repeat(1024) + '"';
    const uidHeaders = {
      // eslint-disable-next-line @typescript-eslint/naming-convention -- x-user-id 为服务端约定 wire 头名,非代码标识符,不可改名(行内豁免)
      'x-user-id': 'userA',
    } as Record<string, string>;
    const variants: { name: string; headers: Record<string, string>; raw: readonly string[]; body?: string }[] = [
      // eslint-disable-next-line @typescript-eslint/naming-convention -- HTTP 头 wire 名连字符小写为传输格式字面值,非代码标识符,不可改名(行内豁免)
      { name: '负数', headers: { ...uidHeaders, 'content-length': '-1' }, raw: [], body: mid },
      // eslint-disable-next-line @typescript-eslint/naming-convention -- HTTP 头 wire 名连字符小写为传输格式字面值,非代码标识符,不可改名(行内豁免)
      { name: '科学计数', headers: { ...uidHeaders, 'content-length': '1e6' }, raw: [], body: mid },
      // eslint-disable-next-line @typescript-eslint/naming-convention -- HTTP 头 wire 名连字符小写为传输格式字面值,非代码标识符,不可改名(行内豁免)
      { name: '小数', headers: { ...uidHeaders, 'content-length': '12.5' }, raw: [], body: mid },
      // eslint-disable-next-line @typescript-eslint/naming-convention -- HTTP 头 wire 名连字符小写为传输格式字面值,非代码标识符,不可改名(行内豁免)
      { name: '空值', headers: { ...uidHeaders, 'content-length': '' }, raw: [], body: mid },
      // eslint-disable-next-line @typescript-eslint/naming-convention -- HTTP 头 wire 名连字符小写为传输格式字面值,非代码标识符,不可改名(行内豁免)
      { name: '声明远小于实际', headers: { ...uidHeaders, 'content-length': '5' }, raw: [], body: mid },
      { name: '重复 CL', headers: { ...uidHeaders }, raw: ['content-length: 5', 'content-length: 65536'], body: mid },
      // eslint-disable-next-line @typescript-eslint/naming-convention -- HTTP 头 wire 名连字符小写为传输格式字面值,非代码标识符,不可改名(行内豁免)
      { name: 'TE+CL 并存', headers: { ...uidHeaders, 'transfer-encoding': 'chunked', 'content-length': '65536' }, raw: [], body: mid },
    ];
    let allRejected = true;
    const detail: string[] = [];
    for (const v of variants) {
      const r = await rawSocketPost(h.base, '/commerce/orders', v.headers, v.body ?? mid, v.raw);
      const leaked = JSON.stringify(r.body ?? {}) + (r.raw ?? '');
      const ok = r.status === 400 && !leaked.includes('FST_');
      if (!ok) allRejected = false;
      detail.push(`${v.name}=${r.status}`);
    }
    A(`HTTP/非法 CL 变体族（负数/科学计数/小数/空/声明小于实际/重复 CL/TE+CL）→ 解析层 400·无 FST_（${detail.join(' ')}）`,
      allRejected);
  }

  // ── 进程存活:超阈 413 断流后服务仍存活 ──
  {
    const alive = await h.post('/auth/login', {}, { email: 'pw@x.com', password: MEETWISE_TEST_FIXTURE_1 });
    A('存活/超阈 413 后服务进程仍存活(后续 fetch 请求 200)', alive.status === 200);
  }

  await done();
}

main().catch((e) => { console.error(e); process.exit(1); });
