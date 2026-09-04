/**
 * UC-MODEL-OCR-01 domain proof (纯域、确定性、零 IO / 零模型 / 零 DB)。
 * `pnpm -C packages/domain prove:sealed-ocr-binding`
 */
import {
  SEALED_OCR_ADMISSION_KEY, SEALED_OCR_ENDPOINT_PROFILE_ID, SEALED_OCR_MODEL_OR_RECIPE,
  SEALED_OCR_OPERATION_ID, admitInterviewResume, parseSealedOcrProvenance, refuseInterviewAdHocOcr,
} from '../src/index.ts';

let failures = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };

const DIGEST = 'a'.repeat(64);
const sealed = {
  operationId: SEALED_OCR_OPERATION_ID,
  registryVersion: 'model-op-registry-v1',
  inputKind: 'vision-ocr',
  capability: 'vision',
  endpointProfileId: SEALED_OCR_ENDPOINT_PROFILE_ID,
  region: 'cn-beijing',
  modelOrRecipe: SEALED_OCR_MODEL_OR_RECIPE,
  admissionKey: SEALED_OCR_ADMISSION_KEY,
  mediaDigest: DIGEST,
  wired: true as const,
};

A('TC-MODEL-OCR-01-main：合法 provenance 解析为冻结快照',
  parseSealedOcrProvenance(sealed)?.operationId === SEALED_OCR_OPERATION_ID
  && parseSealedOcrProvenance(sealed)?.modelOrRecipe === SEALED_OCR_MODEL_OR_RECIPE
  && parseSealedOcrProvenance(sealed)?.endpointProfileId === SEALED_OCR_ENDPOINT_PROFILE_ID
  && Object.isFrozen(parseSealedOcrProvenance(sealed)));

const imageOk = admitInterviewResume({ sourceKind: 'image', facts: ['Go'], ocrBinding: sealed });
A('TC-MODEL-OCR-01-main：图片源 + 密封 binding + 事实 → 面试可授权画像',
  imageOk.ok === true && imageOk.resumeProfileAvailable === true && imageOk.sourceKind === 'image');

const textOk = admitInterviewResume({ sourceKind: 'text', facts: ['Redis'] });
A('文本/PDF 无 OCR binding 仍可授权（不强迫每场面试走 OCR）',
  textOk.ok === true && textOk.resumeProfileAvailable === true);

A('TC-MODEL-OCR-01-E4/E5：图片源缺 binding → fail-closed，画像不可用',
  admitInterviewResume({ sourceKind: 'image', facts: ['Go'] }).ok === false
  && admitInterviewResume({ sourceKind: 'image', facts: ['Go'] }).error === 'ocr_binding_missing'
  && admitInterviewResume({ sourceKind: 'image', facts: ['Go'] }).resumeProfileAvailable === false);

A('TC-MODEL-OCR-01-特：文本简历挂伪造 OCR provenance → 拒绝',
  admitInterviewResume({ sourceKind: 'text', facts: ['Go'], ocrBinding: sealed }).error === 'ocr_binding_invalid'
  && admitInterviewResume({ sourceKind: 'pdf', facts: ['Go'], ocrBinding: sealed }).resumeProfileAvailable === false);

A('TC-MODEL-OCR-01-刁：provenance 夹带 text/apiKey/url 或换 operation → 拒绝',
  parseSealedOcrProvenance({ ...sealed, text: '技能 Go' }) === null
  && parseSealedOcrProvenance({ ...sealed, apiKey: 'sk-x' }) === null
  && parseSealedOcrProvenance({ ...sealed, url: 'https://evil.example.test' }) === null
  && parseSealedOcrProvenance({ ...sealed, operationId: 'interview.question-generation.v1' }) === null
  && parseSealedOcrProvenance({ ...sealed, modelOrRecipe: 'qwen-vl-plus' }) === null
  && parseSealedOcrProvenance({ ...sealed, wired: false }) === null
  && parseSealedOcrProvenance({ ...sealed, mediaDigest: 'not-hex' }) === null);

A('TC-MODEL-OCR-01-E5：面试路径显式拒绝临时视觉/LLM OCR',
  refuseInterviewAdHocOcr('vision-ocr').error === 'ocr_ad_hoc_forbidden'
  && refuseInterviewAdHocOcr('ad-hoc-llm-ocr').resumeProfileAvailable === false
  && refuseInterviewAdHocOcr('raw-image-to-model').ok === false);

const emptyImage = admitInterviewResume({ sourceKind: 'image', facts: ['  '], ocrBinding: sealed });
A('图片源 binding 合法但无事实 → 授权门通过、画像仍不可用（不伪造 grounded）',
  emptyImage.ok === true && emptyImage.resumeProfileAvailable === false);

A('非法 source_kind fail-closed',
  admitInterviewResume({ sourceKind: 'scan', facts: ['Go'], ocrBinding: sealed }).error === 'ocr_source_kind_invalid');

console.log(failures === 0
  ? '\n✓ sealed OCR interview admission 全部通过（本地静态证据）'
  : `\n✗ ${failures} 项失败`);
process.exit(failures === 0 ? 0 : 1);
