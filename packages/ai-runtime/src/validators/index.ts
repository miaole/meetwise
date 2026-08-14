/**
 * 双校验内核：schema 校验 → 业务校验。模型产出进入业务逻辑前必须过两道，绝不裸 JSON.parse。
 * 关口内部件：只许经 @meetwise/ai-runtime 公共面间接使用，外部禁止深链 import（见 .dependency-cruiser.cjs）。
 */
import type { z } from 'zod';

export type DoubleValidateResult<T> =
  | { ok: true; value: T }
  | { ok: false; stage: 'schema'; issues: unknown }
  | { ok: false; stage: 'business'; reason: string };

/** 第一道 schema、第二道业务。schema 失败可重试/降级；业务失败是确定性错误（如幻觉简历事实），不盲目重试。 */
export function doubleValidate<T>(
  schema: z.ZodType<T>,
  businessValidate: (v: T) => string | null,
  raw: unknown,
): DoubleValidateResult<T> {
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return { ok: false, stage: 'schema', issues: parsed.error.issues };
  const bizErr = businessValidate(parsed.data);
  if (bizErr) return { ok: false, stage: 'business', reason: bizErr };
  return { ok: true, value: parsed.data };
}
