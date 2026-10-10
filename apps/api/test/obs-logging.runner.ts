/**
 * obs-logging.proof 的受控 runner(由 proof 以子进程拉起,自身不是门)。
 * boot 真 HTTP 服务器(127.0.0.1 随机口)+ 挂一条一次性 500 探针路由;日志走 fastify 内置 pino。
 * 日志收据必须从**子进程 stdout** 抓:pino 默认 destination 是 sonic-boom 直写 fd1,
 * 进程内劫持 process.stdout.write 拦不到。READY 行带端口供 proof 解析。
 */
import { createApp } from '../src/main.ts';

const app = await createApp();
const fastify = app.getHttpAdapter().getInstance() as any;
// 一次性探针路由(仅本 runner 进程内存在,不进产品面):抛未处理错 → 走 AllExceptionsFilter 500 分支。
fastify.post('/__obs-proof-500', async () => {
  throw new Error('obs_proof_marker_e41c: synthetic unhandled for #89 receipt');
});
await app.listen(0, '127.0.0.1');
const addr: any = fastify.server.address();
process.stdout.write(`__OBS_PROOF_READY__ port=${addr.port} pid=${process.pid}\n`);

const shutdown = () => { void app.close().then(() => process.exit(0)); };
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
