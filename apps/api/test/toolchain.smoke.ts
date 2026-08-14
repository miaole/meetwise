/**
 * 基建蓝图 must-smoke：NestJS × SWC(发装饰器元数据) × Fastify × 类型 DI 跑不跑得通。
 * 通 = 废弃 @Inject 字符串绕法、回到惯用类型 DI；不通 = 蓝图说退 Express。
 * 运行：node --import @swc-node/register/esm-register test/toolchain.smoke.ts
 */
import 'reflect-metadata';
import { Module, Injectable, Controller, Get } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

@Injectable()
class PingService { ping() { return 'pong'; } }

@Controller()
class PingController {
  constructor(private readonly svc: PingService) {} // 类型 DI：需 SWC 发 design:paramtypes 元数据
  @Get('/ping') ping() { return { msg: this.svc.ping() }; }
}

@Module({ controllers: [PingController], providers: [PingService] })
class AppModule {}

async function main() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), { logger: false });
  await app.listen(0, '127.0.0.1');
  const url = await app.getUrl();
  const res = await fetch(url + '/ping');
  const body: any = await res.json();
  const ok = body?.msg === 'pong';
  console.log(ok ? 'PASS  NestJS×SWC×Fastify×类型DI 跑通（无需 @Inject 绕法）' : 'FAIL  ' + JSON.stringify(body));
  await app.close();
  process.exit(ok ? 0 : 1);
}
main().catch((e) => { console.error('FAIL', e); process.exit(1); });
