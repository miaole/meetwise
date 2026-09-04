/**
 * Sealed resume-OCR provenance (MODEL-OP-01 interview seam).
 *
 * Pure domain: zero IO, zero model, zero db.  Interview may treat an
 * OCR-sourced profile as authorized only when this snapshot matches the
 * frozen `resume.ocr.v1` identity.  The snapshot is not a trust of the
 * transcript — OCR text remains untrusted input for `ingestResume`.
 *
 * The snapshot is an identity label (operation / registry / profile id /
 * recipe / media digest). It is not an outbound host pin and not an
 * invocation↔blob hash chain.
 *
 * Forbidden in a sealed snapshot: raw text, prompts, provider URLs, API keys.
 */
export const SEALED_OCR_OPERATION_ID = 'resume.ocr.v1';
export const SEALED_OCR_REGISTRY_VERSION = 'model-op-registry-v1';
export const SEALED_OCR_INPUT_KIND = 'vision-ocr';
export const SEALED_OCR_CAPABILITY = 'vision';
export const SEALED_OCR_ENDPOINT_PROFILE_ID = 'dashscope-cn-beijing';
export const SEALED_OCR_REGION = 'cn-beijing';
export const SEALED_OCR_MODEL_OR_RECIPE = 'vision-ocr';
export const SEALED_OCR_ADMISSION_KEY = 'dashscope-native|cn-beijing|vision-ocr|resume.ocr.v1';

export const RESUME_SOURCE_KINDS = ['text', 'pdf', 'image'] as const;
export type ResumeSourceKind = (typeof RESUME_SOURCE_KINDS)[number];

const SHA256_HEX = /^[0-9a-f]{64}$/;
const ALLOWED_PROVENANCE_KEYS = [
  'operationId', 'registryVersion', 'inputKind', 'capability', 'endpointProfileId',
  'region', 'modelOrRecipe', 'admissionKey', 'mediaDigest', 'wired',
] as const;

export interface SealedOcrProvenance {
  readonly operationId: typeof SEALED_OCR_OPERATION_ID;
  readonly registryVersion: typeof SEALED_OCR_REGISTRY_VERSION;
  readonly inputKind: typeof SEALED_OCR_INPUT_KIND;
  readonly capability: typeof SEALED_OCR_CAPABILITY;
  readonly endpointProfileId: typeof SEALED_OCR_ENDPOINT_PROFILE_ID;
  readonly region: typeof SEALED_OCR_REGION;
  readonly modelOrRecipe: typeof SEALED_OCR_MODEL_OR_RECIPE;
  readonly admissionKey: typeof SEALED_OCR_ADMISSION_KEY;
  readonly mediaDigest: string;
  readonly wired: true;
}

export type InterviewResumeAdmitError =
  | 'ocr_binding_missing'
  | 'ocr_binding_invalid'
  | 'ocr_binding_unwired'
  | 'ocr_ad_hoc_forbidden'
  | 'ocr_source_kind_invalid';

export type InterviewResumeAdmission =
  | { ok: true; resumeProfileAvailable: boolean; sourceKind: ResumeSourceKind }
  | { ok: false; error: InterviewResumeAdmitError; resumeProfileAvailable: false };

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function hasFacts(facts: readonly unknown[] | undefined): boolean {
  return Array.isArray(facts) && facts.some((value) => typeof value === 'string' && value.trim().length > 0);
}

/** Parse a caller/DB snapshot. Unknown fields and secret/text carriers fail closed. */
export function parseSealedOcrProvenance(candidate: unknown): SealedOcrProvenance | null {
  if (!isRecord(candidate)) return null;
  const keys = Object.keys(candidate);
  if (keys.length !== ALLOWED_PROVENANCE_KEYS.length) return null;
  if (!ALLOWED_PROVENANCE_KEYS.every((key) => keys.includes(key))) return null;
  if (candidate.operationId !== SEALED_OCR_OPERATION_ID) return null;
  if (candidate.registryVersion !== SEALED_OCR_REGISTRY_VERSION) return null;
  if (candidate.inputKind !== SEALED_OCR_INPUT_KIND) return null;
  if (candidate.capability !== SEALED_OCR_CAPABILITY) return null;
  if (candidate.endpointProfileId !== SEALED_OCR_ENDPOINT_PROFILE_ID) return null;
  if (candidate.region !== SEALED_OCR_REGION) return null;
  if (candidate.modelOrRecipe !== SEALED_OCR_MODEL_OR_RECIPE) return null;
  if (candidate.admissionKey !== SEALED_OCR_ADMISSION_KEY) return null;
  if (candidate.wired !== true) return null;
  if (typeof candidate.mediaDigest !== 'string' || !SHA256_HEX.test(candidate.mediaDigest)) return null;
  return Object.freeze({
    operationId: SEALED_OCR_OPERATION_ID,
    registryVersion: SEALED_OCR_REGISTRY_VERSION,
    inputKind: SEALED_OCR_INPUT_KIND,
    capability: SEALED_OCR_CAPABILITY,
    endpointProfileId: SEALED_OCR_ENDPOINT_PROFILE_ID,
    region: SEALED_OCR_REGION,
    modelOrRecipe: SEALED_OCR_MODEL_OR_RECIPE,
    admissionKey: SEALED_OCR_ADMISSION_KEY,
    mediaDigest: candidate.mediaDigest,
    wired: true,
  });
}

/**
 * Interview authorization for a stored resume.  Image-sourced profiles require
 * a sealed OCR binding; text/PDF must not carry a forged OCR snapshot.
 * Failure never authorizes an ad-hoc vision/LLM OCR call.
 */
export function admitInterviewResume(input: {
  sourceKind: string;
  facts?: readonly unknown[];
  ocrBinding?: unknown;
}): InterviewResumeAdmission {
  if (!(RESUME_SOURCE_KINDS as readonly string[]).includes(input.sourceKind)) {
    return { ok: false, error: 'ocr_source_kind_invalid', resumeProfileAvailable: false };
  }
  const sourceKind = input.sourceKind as ResumeSourceKind;
  const available = hasFacts(input.facts);

  if (sourceKind === 'text' || sourceKind === 'pdf') {
    if (input.ocrBinding != null) {
      return { ok: false, error: 'ocr_binding_invalid', resumeProfileAvailable: false };
    }
    return { ok: true, resumeProfileAvailable: available, sourceKind };
  }

  if (input.ocrBinding == null) {
    return { ok: false, error: 'ocr_binding_missing', resumeProfileAvailable: false };
  }
  const sealed = parseSealedOcrProvenance(input.ocrBinding);
  if (!sealed) return { ok: false, error: 'ocr_binding_invalid', resumeProfileAvailable: false };
  if (sealed.wired !== true) return { ok: false, error: 'ocr_binding_unwired', resumeProfileAvailable: false };
  return { ok: true, resumeProfileAvailable: available, sourceKind };
}

/**
 * Explicit refuse for any interview/graph attempt to run OCR itself.
 * There is no successful path: the only legal OCR producer is the resume
 * ingest binding seam.
 */
export function refuseInterviewAdHocOcr(
  _intent: 'vision-ocr' | 'ad-hoc-llm-ocr' | 'raw-image-to-model',
): InterviewResumeAdmission {
  return { ok: false, error: 'ocr_ad_hoc_forbidden', resumeProfileAvailable: false };
}
