import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger } from '@nestjs/common';

/**
 * 全局异常过滤(修审计 F3):统一错误信封 + **绝不泄露表名/约束名/堆栈**。
 * - HttpException:透传其状态 + body(业务信封 {error,...} 已规范)。
 * - FST_ERR_CTP_BODY_TOO_LARGE（含被 Nest 收成 HttpException 的形态）→ 按路由 413 业务信封，不泄露 FST_ 内部码。
 * - pg unique 违反(23505)→ 409 conflict(显式映射,不暴露约束名)。
 * - 其余未知错:mask 成 500 internal_error;结构化脱敏日志(reqId/method/url/code/message/堆栈,
 *   不带请求体/响应体/PII/SQL)经 fastify 内置 pino 落卷,响应体依旧零细节(审计#89)。
 */

function bodyLimitErrorFromReq(req: { routeOptions?: { url?: string } } | undefined): 'file_too_large' | 'audio_too_large' | 'payload_too_large' {
  const url = String(req?.routeOptions?.url ?? '');
  if (url === '/resume/file') return 'file_too_large';
  if (url === '/interview/:id/transcribe') return 'audio_too_large';
  return 'payload_too_large';
}

function isFastifyBodyTooLarge(exception: unknown): boolean {
  const walk = (value: unknown, depth: number): boolean => {
    if (value == null || depth > 4 || typeof value !== 'object') return false;
    const rec = value as { code?: unknown; message?: unknown; cause?: unknown; name?: unknown };
    if (rec.code === 'FST_ERR_CTP_BODY_TOO_LARGE') return true;
    const msg = String(rec.message ?? rec.name ?? '');
    if (msg.includes('FST_ERR_CTP_BODY_TOO_LARGE')) return true;
    return walk(rec.cause, depth + 1);
  };
  if (walk(exception, 0)) return true;
  if (exception instanceof HttpException) {
    const res = exception.getResponse();
    const blob = typeof res === 'string' ? res : JSON.stringify(res);
    if (blob.includes('FST_ERR_CTP_BODY_TOO_LARGE')) return true;
  }
  return false;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exceptions');

  catch(exception: unknown, host: ArgumentsHost) {
    const reply: any = host.switchToHttp().getResponse();
    if (reply?.sent || reply?.raw?.headersSent) return;            // SSE 已劫持/已发 → 不重复发
    const req: any = host.switchToHttp().getRequest();

    // FST_ERR_CTP_BODY_TOO_LARGE 不走 setErrorHandler（会覆盖本过滤器并触发 FSTWRN004）。
    // 传输层超限主要由 main.ts onRequest/preParsing 给出业务 413；本处是漏网兜底。
    // FST_ERR_BAD_URL 由 Fastify frameworkErrors 在构造期换成 { error: 'invalid_request' }，
    // 也不经过本过滤器。
    if (isFastifyBodyTooLarge(exception)) {
      return reply.code(413).send({ error: bodyLimitErrorFromReq(req) });
    }
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
