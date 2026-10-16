/**
 * #67-API CSP/安全头门 prove（api 面零豁免·hash 自洽·源级接线断言·est live=0）。
 * 臂面：
 *   H1 GLOBAL-200    bare fastify+installSecurityHeaderGate：普通 200 出口 nosniff+frame-ancestors 在场；
 *   H2 HOOK-503      onRequest 钩子源 503（public-preview 门同形：async hook 内 await reply.code(503).send）
 *                    出口同样两头在场（零豁免直证·onSend 生命周期位承重）；
 *   H3 ROUTE-NOBUMP  路由级 CSP 先设→onSend 不覆盖（单 CSP 头·值恒等 DOCS_CONTENT_SECURITY_POLICY·防双头交集直证）
 *                    +全局 nosniff 仍在场；
 *   H4 HASH-SELF     main.ts 源 /docs 模板内联脚本现算 sha256-base64 恰等 DOCS_CONTENT_SECURITY_POLICY 内
 *                    hash 常量（HTML↔hash 漂移 fail-closed·模板体零字节纪律的执法点）；
 *   H5 STATIC        script-src 指令内联放行字面量禁入 + createApp 接线行在源 + /docs 路由接线在源。
 * 运行：pnpm -C apps/api prove:csp-headers · releaseEvidence=false · Not HA · actualSpendCny=null
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import Fastify from 'fastify';
import { DOCS_CONTENT_SECURITY_POLICY, installSecurityHeaderGate } from '../src/main.ts';

let fail = 0;
let pass = 0;
const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); c ? pass++ : fail++; };

const here = dirname(fileURLToPath(import.meta.url));   // apps/api/test
const apiRoot = join(here, '..');                        // apps/api

const GLOBAL_CSP = "frame-ancestors 'none'";

async function headerProof() {
  // H1 普通 200 出口
  const app1 = Fastify();
  installSecurityHeaderGate(app1);
  app1.get('/ping', async () => ({ ok: true }));
  const r1 = await app1.inject({ method: 'GET', url: '/ping' });
  A('H1a 200 出口 nosniff 在场', r1.headers['x-content-type-options'] === 'nosniff');
  A('H1b 200 出口 CSP=frame-ancestors none', r1.headers['content-security-policy'] === GLOBAL_CSP);
  // H2 钩子源 503（零豁免直证·钩形照抄 public-preview 门 async-hook-send 形）
  const app2 = Fastify();
  installSecurityHeaderGate(app2);
  app2.addHook('onRequest', async (_req, reply) => { await reply.code(503).send({ error: 'gate' }); });
  app2.get('/gated', async () => ({ ok: true }));
  const r2 = await app2.inject({ method: 'GET', url: '/gated' });
  A('H2a 钩子源 503 status', r2.statusCode === 503);
  A('H2b 钩子源 503 nosniff 在场（零豁免）', r2.headers['x-content-type-options'] === 'nosniff');
  A('H2c 钩子源 503 CSP 在场（零豁免）', r2.headers['content-security-policy'] === GLOBAL_CSP);
  // H3 路由级 CSP 先设→onSend 不覆盖
  const app3 = Fastify();
  installSecurityHeaderGate(app3);
  app3.get('/docs', (_req, reply) => { reply.header('content-security-policy', DOCS_CONTENT_SECURITY_POLICY).type('text/html').send('<html></html>'); });
  const r3 = await app3.inject({ method: 'GET', url: '/docs' });
  A('H3a /docs 单 CSP 头=路由级策略（onSend 不覆盖）', r3.headers['content-security-policy'] === DOCS_CONTENT_SECURITY_POLICY);
  A('H3b /docs nosniff 全局仍在场', r3.headers['x-content-type-options'] === 'nosniff');
  await app1.close(); await app2.close(); await app3.close();
}

function hashAndStaticProof() {
  const src = readFileSync(join(apiRoot, 'src/main.ts'), 'utf8');
  // H4 hash 自洽：抽 /docs 模板内联 script（非 src 引用形）现算 sha256-base64 对 DOCS_CSP 常量
  const inline = [...src.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  A('H4a /docs 模板恰 1 内联 script', inline.length === 1);
  const digest = createHash('sha256').update(inline[0] ?? '', 'utf8').digest('base64');
  A('H4b 内联脚本 sha256 恰等 DOCS_CSP hash 常量（漂移 fail-closed）', DOCS_CONTENT_SECURITY_POLICY.includes(`'sha256-${digest}'`));
  // H5 静态断言（词面运行时组装防自匹配）
  const scriptSrc = DOCS_CONTENT_SECURITY_POLICY.split(';').map((s) => s.trim()).find((s) => s.startsWith('script-src')) ?? '';
  A('H5a script-src 指令内联放行字面量禁入', scriptSrc.length > 0 && !scriptSrc.includes(['u', 'n', 's', 'a', 'f', 'e'].join('') + '-inline'));
  A('H5b createApp 接线行在源', /installSecurityHeaderGate\(fastify\)/.test(src));
  A('H5c /docs 路由接线在源', /reply\.header\('content-security-policy', DOCS_CONTENT_SECURITY_POLICY\)/.test(src));
}

async function main() {
  await headerProof();
  hashAndStaticProof();
  console.log(`\n===== csp-headers.proof(api) PASS=${pass} FAIL=${fail} =====`);
  if (fail > 0) process.exitCode = 1;
}

await main();
