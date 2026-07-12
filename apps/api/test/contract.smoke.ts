/**
 * 契约层 must-smoke：共享 @meetwise/contracts 的 zod4 schema + 平台 ZodValidationPipe
 * 在 NestJS+Fastify 校验请求体。证明契约包独立后前后端可共用同一份、零额外契约依赖。
 * run: node --import @swc-node/register/esm-register test/contract.smoke.ts
 */
import 'reflect-metadata';
import { Module, Controller, Post, Body } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AnswerDto } from '@meetwise/contracts';
import { ZodValidationPipe } from '../src/platform/zod.pipe';

@Controller()
class C {
  @Post('/answer')
  submit(@Body(new ZodValidationPipe(AnswerDto)) body: AnswerDto) {
    return { ok: true, len: body.answer.length };
  }
}
@Module({ controllers: [C] })
class M {}

async function main() {
  const app = await NestFactory.create<NestFastifyApplication>(M, new FastifyAdapter(), { logger: false });
  await app.listen(0, '127.0.0.1');
  const base = (await app.getUrl()).replace('[::1]', '127.0.0.1');
  const post = (b: any) => fetch(base + '/answer', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(b) }).then(async (r) => ({ s: r.status, b: await r.json() as any }));
  let fails = 0; const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fails++; };
  let r = await post({ answer: 'hello' }); A('合法 body → 200', (r.s === 200 || r.s === 201) && r.b.len === 5);
  r = await post({ answer: '' }); A('非法 body(空) → 400（zod4 拦截）', r.s === 400);
  r = await post({ nope: 1 }); A('缺字段 → 400', r.s === 400);
  console.log(fails === 0 ? '✓ zod4 契约校验在 NestJS+Fastify 跑通（@meetwise/contracts 共享，无需 ts-rest）' : '✗ ' + fails + ' 失败');
  await app.close(); process.exit(fails ? 1 : 0);
}
main().catch((e) => { console.error('FAIL', e); process.exit(1); });
