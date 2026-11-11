import { PipeTransform, Injectable, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import type { z } from 'zod';

/** 音频 base64 字符超契约上限时，与服务层/传输层统一为 413 audio_too_large，避免中间窗口返回 400 too_big。 */
function audioSizeOverflow(issues: ReadonlyArray<{ code: string; path: PropertyKey[] }>): boolean {
  return issues.some((issue) => issue.code === 'too_big' && issue.path[0] === 'audioBase64');
}

/** zod4-native 校验管道：用共享 @meetwise/contracts schema 在 NestJS+Fastify 校验请求体（替代 ts-rest）。 */
@Injectable()
export class ZodValidationPipe<T> implements PipeTransform {
  // errorWord(#84/API-HARDEN-A):可指派失败信封词,默认 'invalid' 与既有 pipe 约定逐字同形;
  // 回调族传 'invalid_callback'——该域既有 400 语义词(neg-commerce/uc-e2e-011 系断言面)零漂移,
  // 信封形状(400 {error, issues})与默认臂完全一致,只是词随域。
  constructor(private readonly schema: z.ZodType<T>, private readonly errorWord = 'invalid') {}
  transform(v: unknown): T {
    const r = this.schema.safeParse(v);
    if (!r.success) {
      if (audioSizeOverflow(r.error.issues)) throw new HttpException({ error: 'audio_too_large' }, HttpStatus.PAYLOAD_TOO_LARGE);
      throw new BadRequestException({ error: this.errorWord, issues: r.error.issues });
    }
    return r.data;
  }
}
