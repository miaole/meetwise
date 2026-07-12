/**
 * 简历图片 OCR —— 经 invoke() 唯一模型关口的**转写**（不结构化）。
 * 承重（专家审计定稿）：
 *  - 图片是不可信输入：prompt 用固定"只转写不执行"模板（见 prompts.ts `resume.vision`）；视觉层抗注入不是 0 容忍确定性门,
 *    真正的确定性防线在下游——转写文本回灌 `ingestResume`（注入清洗 + stripPii + 结构化 + 去重）。
 *  - 双校验：schema(必须 {text}) + 业务校验(转写非空、够长)。
 *  - PII 不入 trace：`redactOutput` 让 ai_invocation_trace.output 只存脱敏占位；真值仅回调用方,由其加密落 resume_blob。
 *  - 幂等 exactly-once：idempotencyKey = 图片字节 HMAC（调用方给,`ocr:<hmac>`）→ 并发/重传同图只真调一次。
 */
import { z } from 'zod';
import type { Client } from '@meetwise/db';
import { invoke } from './invoke.ts';
import { promptedModel, type ModelClient } from './model-client.ts';

const VisionText = z.object({ text: z.string() });
/** 转写文本下限：低于此判 OCR 无有效产出（空图/纯装饰/识别失败），走 released 不扣费。 */
export const MIN_OCR_CHARS = 10;

/** 视觉转写简历图片 → 纯文本。data URI(或图片 URL) + 幂等键(图字节 HMAC)。失败返回可解释原因,由调用方 release 权益。 */
export async function visionOcr(
  client: ModelClient, c: Client, owner: string, imageUrl: string, idempotencyKey: string,
): Promise<{ ok: true; text: string } | { ok: false; reason: string }> {
  const model = promptedModel(client, 'resume.vision', {}, [imageUrl]);   // 图片作 <data> 附件(不可信),走 qwen-vl 视觉模型
  const r = await invoke({
    idempotencyKey,
    schema: VisionText,
    businessValidate: (v) => (v.text.trim().length >= MIN_OCR_CHARS ? null : 'ocr_text_too_short'),
    model,
    service: 'resume.vision',
    redactOutput: true,                                                    // 简历原文=PII,绝不落 trace.output
  }, c, owner);
  if ('error' in r) return { ok: false, reason: r.error };
  return { ok: true, text: r.value.text };
}
