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
import type { Client, DbPool } from '@meetwise/db';
import { invoke } from './invoke.ts';
import { promptedModel, type ModelClient } from './model-client.ts';

const VisionText = z.object({ text: z.string() });
/** 转写文本下限：低于此判 OCR 无有效产出（空图/纯装饰/识别失败），走 released 不扣费。 */
export const MIN_OCR_CHARS = 10;

/**
 * MODEL-OP-01 硬拒绝 #3（provider URL）在 OCR 媒体的落地：图片内容必须内联为
 * `data:` URI（进入 <data> 围栏，作为不可信附件交给视觉模型），绝不接受任何
 * http/https/wss/ftp URL——否则视觉请求会被用来指到任意 provider/内网目标。
 * 非 data: 形态一律按 URL 走私尝试处理（本边界下合法形态只有 data URI 一种）。
 */
const OCR_MEDIA_DATA_URI = /^data:/i;

/** 视觉转写简历图片 → 纯文本。data URI(图片内容内联) + 幂等键(图字节 HMAC)。失败返回可解释原因,由调用方 release 权益。 */
export async function visionOcr(
  client: ModelClient, pool: DbPool, owner: string, imageUrl: string, idempotencyKey: string,
  opts: { persistValidatedText?: (c: Client, text: string) => Promise<void> } = {},
): Promise<{ ok: true; text: string } | { ok: false; reason: string }> {
  // 早退守卫：在任何 DB / invoke 之前拒绝 provider URL 媒体，证明「URL 拒绝」是零外呼、零 claim 的确定性拒绝。
  if (!OCR_MEDIA_DATA_URI.test(imageUrl)) return { ok: false, reason: 'ocr_provider_url_forbidden' };
  const model = promptedModel(client, 'resume.vision', {}, [imageUrl]);   // 图片作 <data> 附件(不可信),走 qwen-vl 视觉模型
  const r = await invoke({
    idempotencyKey,
    // MODEL-OP-01: node identity 由 registry 派生（resume.ocr.v1 + 图字节 HMAC 为 businessRevision），
    // 不再由 caller 直传 logicalNodeKey。同图重传 = 同 businessRevision = 同 durable header，
    // 语义与从前一致，但身份根从「caller 文本」收口为「frozen registry operation」。
    operation: { id: 'resume.ocr.v1', businessRevision: idempotencyKey },
    schema: VisionText,
    businessValidate: (v) => (v.text.trim().length >= MIN_OCR_CHARS ? null : 'ocr_text_too_short'),
    model,
    service: 'resume.vision',
    redactOutput: true,                                                    // 简历原文=PII,绝不落 trace.output
    // 与 durable success 同一短事务保存加密领域工件。没有它，红色输出不允许
    // 回放时，模型成功后的进程崩溃会留下不可恢复的已派发请求。
    persistValidatedOutput: opts.persistValidatedText
      ? async (c, value) => opts.persistValidatedText!(c, value.text)
      : undefined,
  }, pool, owner);
  if ('error' in r) return { ok: false, reason: r.error };
  return { ok: true, text: r.value.text };
}
