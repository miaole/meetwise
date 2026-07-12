import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger } from '@nestjs/common';

/**
 * 全局异常过滤(修审计 F3):统一错误信封 + **绝不泄露表名/约束名/堆栈**。
 * - HttpException:透传其状态 + body(业务信封 {error,...} 已规范)。
 * - pg unique 违反(23505)→ 409 conflict(显式映射,不暴露约束名)。
 * - 其余未知错:mask 成 500 internal_error;脱敏日志(只记 code/简短 message,不带 PII/SQL)。
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
    // 未知错:脱敏日志 + 不透明 500(防泄露内部细节)
    this.logger.error(`unhandled${code ? ` [${code}]` : ''}: ${(exception as Error)?.message ?? String(exception)}`);
    return reply.code(500).send({ error: 'internal_error' });
  }
}
