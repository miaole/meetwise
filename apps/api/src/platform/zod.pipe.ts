import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import type { z } from 'zod';

/** zod4-native 校验管道：用共享 @meetwise/contracts schema 在 NestJS+Fastify 校验请求体（替代 ts-rest）。 */
@Injectable()
export class ZodValidationPipe<T> implements PipeTransform {
  constructor(private readonly schema: z.ZodType<T>) {}
  transform(v: unknown): T {
    const r = this.schema.safeParse(v);
    if (!r.success) throw new BadRequestException({ error: 'invalid', issues: r.error.issues });
    return r.data;
  }
}
