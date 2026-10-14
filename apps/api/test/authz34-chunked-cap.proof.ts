/**
 * AUTHZ #34 残面小刀 prove — chunked(无 content-length)封顶钩子·隔离容器(run-e2e-isolated 门)·est live=0。
 * 断言力(REQUEST §2-2·阈值=裁决项①案A 1MiB 协调方确认):
 *   ①chunked(无 content-length·node:http ClientRequest 写体不设 content-length → transfer-encoding: chunked)
 *     1MiB+α 至非上传路由(/commerce/orders)→ 413 payload_too_large(案A 阈值形·与既有 onRequest 钩子同信封同错码);
 *   ②chunked KB 级正常体 login(种子 pwUser)→ 200(body 真解析非 413);
 *   ③chunked >12MiB 至上传路由 /resume/file → 413(fastify bodyLimit 兜底·status-only 断言沿 neg-commerce
 *     :312/:532 形·信封 body 不钉——fastify CTP 错误信封与 app 信封异形属既有事实);
 *   ④既有 content-length 1MiB 双臂回归=neg-commerce.proof.ts 原值(不扰动·由 neg:commerce 门承载);
 *   ⑤chunked 注入 RST 容忍(rev2 N2):服务端 413 提前断流形下写侧可能 ECONNRESET/EPIPE——helper 按
 *     「响应已达则以 status 断言·写侧 RST 不另行判红」容忍形实现;响应未达不得绿判(status=0 → 断言红如实上报)。
 * 运行:pnpm -C apps/api authz34:chunked-cap(隔离库包装 run-e2e-isolated authz34:chunked-cap:prove)。
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { request as httpRequest } from 'node:http';
import { boot, mkAssert } from './_neg-harness';

const here = dirname(fileURLToPath(import.meta.url));

interface ChunkedResult { status: number; body: any; raw: string | null }

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
      let parsed: any = null;
      if (raw != null && raw.length > 0) { try { parsed = JSON.parse(raw); } catch { parsed = { _raw: raw }; } }
      resolve({ status, body: parsed, raw });
    };
    const req = httpRequest({
      host: u.hostname, port: Number(u.port) || 80, path, method: 'POST',
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

async function main() {
  const { A, done } = mkAssert('authz34:chunked-cap');

  // ── 静态:钩子在位 + 有头路径零改(既有 onRequest 钩子原样)──
  const mainSrc = readFileSync(join(here, '..', 'src', 'main.ts'), 'utf8');
  A('静态/main.ts preParsing 流计数钩子在位(无 content-length 分流)',
    mainSrc.includes("addHook('preParsing'") && mainSrc.includes("req.headers['content-length'] !== undefined") && mainSrc.includes('new PassThrough()'));
  A('静态/既有 onRequest content-length 钩子原值在位(有头路径零改)',
    mainSrc.includes("Number(req.headers['content-length'] ?? 0)") && mainSrc.includes("addHook('onRequest'"));

  const h = await boot();

  // ── ① chunked 1MiB+α 至非上传路由 → 413 payload_too_large(案A)──
  {
    const big = '{"productId":"' + 'x'.repeat(1_100_000) + '"}';
    const r = await chunkedPost(h.base, '/commerce/orders', big, { headers: { 'x-user-id': 'userA' } });
    A('chunked/1MiB+α 非上传路由 → 413 payload_too_large(案A 阈值·同信封同错码)',
      r.status === 413 && r.body?.error === 'payload_too_large');
  }

  // ── ② chunked KB 级正常体 login → 200(body 真解析)──
  {
    const r = await chunkedPost(h.base, '/auth/login', JSON.stringify({ email: 'pw@x.com', password: 'oldpass12' }), { chunkSize: 4096 });
    A('chunked/KB 级正常体 login → 200(body 真解析·封顶不误伤)',
      r.status === 200 && r.body?.userId === 'pwUser' && typeof r.body?.token === 'string');
  }

  // ── ③ chunked >12MiB 至上传路由 → 413(fastify bodyLimit 兜底·status-only)──
  {
    const huge = '{"pad":"' + 'x'.repeat(12 * 1024 * 1024 + 65_536) + '"}';
    const r = await chunkedPost(h.base, '/resume/file', huge);
    A('chunked/>12MiB 上传路由 → 413(fastify bodyLimit 兜底·status-only 沿 neg-commerce 形)', r.status === 413);
  }

  // ── ⑥(负控)chunked KB 级正常体至非上传路由 → 正常受理(闸只在超阈触发)──
  {
    const r = await chunkedPost(h.base, '/commerce/orders', JSON.stringify({ productId: 'pack_10' }), { headers: { 'x-user-id': 'userA' } });
    A('chunked/KB 级正常体非上传路由 → 200 正常受理(未超阈不 413)', r.status === 200);
  }

  // ── 进程存活:超阈 413 断流后服务仍存活 ──
  {
    const alive = await h.post('/auth/login', {}, { email: 'pw@x.com', password: 'oldpass12' });
    A('存活/超阈 413 后服务进程仍存活(后续 fetch 请求 200)', alive.status === 200);
  }

  await done();
}

main().catch((e) => { console.error(e); process.exit(1); });
