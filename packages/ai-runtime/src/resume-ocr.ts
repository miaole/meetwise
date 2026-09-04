/**
 * 简历图片 OCR —— 经 typed binding + invoke() 唯一模型关口的**转写**（不结构化）。
 * 承重（专家审计定稿）：
 *  - 图片是不可信输入：prompt 用固定"只转写不执行"模板（见 prompts.ts `resume.vision`）；视觉层抗注入不是 0 容忍确定性门,
 *    真正的确定性防线在下游——转写文本回灌 `ingestResume`（注入清洗 + stripPii + 结构化 + 去重）。
 *  - 双校验：schema(必须 {text}) + 业务校验(转写非空、够长)。
 *  - PII 不入 trace：`redactOutput` 让 ai_invocation_trace.output 只存脱敏占位；真值仅回调用方,由其加密落 resume_blob。
 *  - 幂等 exactly-once：idempotencyKey = 图片字节 HMAC（调用方给,`ocr:<hmac>`）→ 并发/重传同图只真调一次。
 *  - MODEL-OP-01：未解析到冻结 `resume.ocr.v1` identity 则零 invoke / 零 claim；成功转写附带密封 provenance。
 *    Provenance 是身份封印，不是出站 host pin：HTTP 仍走注入的 `ModelClient`。
 */
import { createHash } from 'node:crypto';
import { z } from 'zod';
import type { Client, DbPool } from '@meetwise/db';
import {
  SEALED_OCR_OPERATION_ID, parseSealedOcrProvenance, type SealedOcrProvenance,
} from '@meetwise/domain';
import { invoke } from './invoke.ts';
import { promptedModel, type ModelClient } from './model-client.ts';
import { MODEL_OPERATION_REGISTRY_VERSION, lookupModelOperation } from './model-operation-registry.ts';
import { INPUT_KIND_ENDPOINT_PROFILES, resolveModelOperationBinding } from './operation-binding.ts';

const VisionText = z.object({ text: z.string() });
/** 转写文本下限：低于此判 OCR 无有效产出（空图/纯装饰/识别失败），走 released 不扣费。 */
export const MIN_OCR_CHARS = 10;
export const RESUME_OCR_OPERATION_ID = SEALED_OCR_OPERATION_ID;

/**
 * MODEL-OP-01 硬拒绝 #3（provider URL）在 OCR 媒体的落地：图片内容必须内联为
 * `data:` URI（进入 <data> 围栏，作为不可信附件交给视觉模型），绝不接受任何
 * http/https/wss/ftp URL——否则视觉请求会被用来指到任意 provider/内网目标。
 * 非 data: 形态一律按 URL 走私尝试处理（本边界下合法形态只有 data URI 一种）。
 */
const OCR_MEDIA_DATA_URI = /^data:/i;
const SHA256_HEX = /^[0-9a-f]{64}$/;
const OCR_KEY_PREFIX = 'ocr:';

export type ResumeOcrBindError =
  | 'model_operation_unknown'
  | 'model_operation_kind_unknown'
  | 'model_operation_input_invalid'
  | 'model_operation_provider_url_forbidden'
  | 'model_operation_endpoint_profile_invalid'
  | 'model_operation_not_wired'
  | 'ocr_binding_invalid'
  | 'ocr_media_digest_invalid';

export type ResumeOcrBindDecision =
  | { ok: true; provenance: SealedOcrProvenance }
  | { ok: false; error: ResumeOcrBindError };

function sha256Bytes(value: Buffer): string {
  return createHash('sha256').update(value).digest('hex');
}

/** Hash the inline data-URI payload. Missing/malformed payloads are not a digest. */
export function resumeOcrMediaDigest(imageUrl: string): string | null {
  if (!OCR_MEDIA_DATA_URI.test(imageUrl)) return null;
  const comma = imageUrl.indexOf(',');
  if (comma < 0 || comma === imageUrl.length - 1) return null;
  try {
    const payload = Buffer.from(imageUrl.slice(comma + 1), 'base64');
    if (payload.length === 0) return null;
    return sha256Bytes(payload);
  } catch {
    return null;
  }
}

/**
 * Resolve the frozen resume-OCR binding.  Callers (and tests) may pass a
 * non-registry operation id to prove fail-closed; `visionOcr` always uses
 * `resume.ocr.v1`.  No network, no Key.
 */
export function bindResumeOcrOperation(operationId: string, mediaDigest: string): ResumeOcrBindDecision {
  if (!SHA256_HEX.test(mediaDigest)) return { ok: false, error: 'ocr_media_digest_invalid' };
  const endpoint = INPUT_KIND_ENDPOINT_PROFILES['vision-ocr'];
  const candidate = {
    inputKind: 'vision-ocr' as const,
    promptContract: RESUME_OCR_OPERATION_ID,
    outputContract: 'resume.text.v1',
    mediaRefs: [{ kind: 'resume-page', digest: mediaDigest }],
    endpointProfileId: endpoint.profileId,
    maxPages: 1,
  };
  const bound = resolveModelOperationBinding(operationId, candidate);
  if (!bound.ok) return { ok: false, error: bound.error };
  if (!bound.binding.wired) return { ok: false, error: 'model_operation_not_wired' };
  const definition = lookupModelOperation(bound.binding.operationId);
  if (!definition) return { ok: false, error: 'model_operation_unknown' };
  const snapshot = {
    operationId: bound.binding.operationId,
    registryVersion: MODEL_OPERATION_REGISTRY_VERSION,
    inputKind: bound.binding.inputKind,
    capability: bound.binding.capability,
    endpointProfileId: bound.binding.endpoint.profileId,
    region: bound.binding.endpoint.region,
    modelOrRecipe: definition.admission.modelOrRecipe,
    admissionKey: bound.binding.admissionKey,
    mediaDigest,
    wired: true as const,
  };
  const provenance = parseSealedOcrProvenance(snapshot);
  if (!provenance) return { ok: false, error: 'ocr_binding_invalid' };
  return { ok: true, provenance };
}

export function bindResumeOcr(mediaDigest: string): ResumeOcrBindDecision {
  return bindResumeOcrOperation(RESUME_OCR_OPERATION_ID, mediaDigest);
}

export type VisionOcrResult =
  | { ok: true; text: string; provenance: SealedOcrProvenance }
  | { ok: false; reason: string };

/** 视觉转写简历图片 → 纯文本 + 密封 binding 出处。data URI + 幂等键。失败由调用方 release 权益。 */
export async function visionOcr(
  client: ModelClient, pool: DbPool, owner: string, imageUrl: string, idempotencyKey: string,
  opts: { persistValidatedText?: (c: Client, text: string) => Promise<void> } = {},
): Promise<VisionOcrResult> {
  // 早退守卫：在任何 DB / invoke / binding 构造之前拒绝 provider URL 媒体。
  if (!OCR_MEDIA_DATA_URI.test(imageUrl)) return { ok: false, reason: 'ocr_provider_url_forbidden' };
  const mediaDigest = resumeOcrMediaDigest(imageUrl);
  if (!mediaDigest) return { ok: false, reason: 'ocr_media_digest_invalid' };
  const keyDigest = idempotencyKey.startsWith(OCR_KEY_PREFIX) ? idempotencyKey.slice(OCR_KEY_PREFIX.length) : '';
  if (!SHA256_HEX.test(keyDigest) || keyDigest !== mediaDigest) {
    return { ok: false, reason: 'ocr_media_digest_mismatch' };
  }
  const bound = bindResumeOcr(mediaDigest);
  if (!bound.ok) return { ok: false, reason: bound.error };

  const model = promptedModel(client, 'resume.vision', {}, [imageUrl]);
  const r = await invoke({
    idempotencyKey,
    // node identity 由 registry 派生（resume.ocr.v1 + 图字节 HMAC 为 businessRevision）。
    operation: { id: RESUME_OCR_OPERATION_ID, businessRevision: idempotencyKey },
    schema: VisionText,
    businessValidate: (v) => (v.text.trim().length >= MIN_OCR_CHARS ? null : 'ocr_text_too_short'),
    model,
    service: 'resume.vision',
    redactOutput: true,
    persistValidatedOutput: opts.persistValidatedText
      ? async (c, value) => opts.persistValidatedText!(c, value.text)
      : undefined,
  }, pool, owner);
  if ('error' in r) return { ok: false, reason: r.error };
  return { ok: true, text: r.value.text, provenance: bound.provenance };
}
