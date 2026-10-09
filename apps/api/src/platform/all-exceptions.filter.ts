import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger } from '@nestjs/common';

/**
 * 全局异常过滤(修审计 F3):统一错误信封 + **绝不泄露表名/约束名/堆栈**。
 * - HttpException:透传其状态 + body(业务信封 {error,...} 已规范)。
 * - pg unique 违反(23505)→ 409 conflict(显式映射,不暴露约束名)。
 * - 其余未知错:mask 成 500 internal_error;结构化脱敏日志(reqId/method/url/code/message/堆栈,
 *   不带请求体/响应体/PII/SQL)经 fastify 内置 pino 落卷,响应体依旧零细节(审计#89)。
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exceptions');

  catch(exception: unknown, host: ArgumentsHost) {
    const reply: any = host.switchToHttp().getResponse();
    if (reply?.sent || reply?.raw?.headersSent) return;            // SSE 已劫持/已发 → 不重复发

    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      return reply.code(exception.getStatus()).send(typeof res === 'object' ? res : { error: res });
    }
    const code = (exception as { code?: string })?.code;
    if (code === '23505') return reply.code(409).send({ error: 'conflict' });   // unique 违反
    // 未知错:结构化日志(审计#89:500 必须带 reqId/路径/堆栈,排障前提) + 不透明 500(防泄露内部细节)。
    // 堆栈只进日志、绝不进响应体。日志走 fastify 内置 pino(reply.log,NestFactory logger:false 下
    // Nest Logger 不落盘);无 pino 时退回 Nest Logger(尽力而为)。url 去掉 query,避免入日志。
    const err = exception as Error;
    const req: any = host.switchToHttp().getRequest();
    const payload = {
      // reqId 不重复塞:pino child binding(fastify genReqId 单源)已在每行顶层带 reqId。
      method: req?.method,
      url: String(req?.url ?? '').split('?')[0] ?? '',
      code: code ?? undefined,
      err: { name: err?.name, message: err?.message, stack: err?.stack },   // 手搓序列化:不依赖 pino err serializer,堆栈必落卷
    };
    const label = `unhandled${code ? ` [${code}]` : ''}`;
    if (typeof reply?.log?.error === 'function') reply.log.error(payload, label);
    else this.logger.error(`${label}: ${err?.message ?? String(exception)}`, err?.stack);
    return reply.code(500).send({ error: 'internal_error' });
  }
}
