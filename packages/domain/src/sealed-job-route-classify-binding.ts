/**
 * Sealed `job.route-classify.v1` provenance (MODEL-OP-01 · R2 P-MODEL).
 *
 * UC / docs name this operation `job_route_classify`; the registry id must match
 * OPERATION_ID_PATTERN (no underscores) → `job.route-classify.v1`.
 *
 * Pure domain: zero IO, zero model, zero db.  Future sole classify Worker may
 * treat a modelClassify attempt as authorized only when this snapshot matches
 * the frozen identity.  Forbidden carriers: raw title/description, prompts,
 * provider URLs, API keys.
 *
 * This closes P-MODEL (typed binding identity).  It does NOT close R2:
 * P-WORKER may wire sole classifyJobRoute( via route-classify-consumer;
 * P-API must remain zero classify consumers.
 */
export const SEALED_JOB_ROUTE_CLASSIFY_OPERATION_ID = 'job.route-classify.v1';
/** Product / UC alias — same operation as SEALED_JOB_ROUTE_CLASSIFY_OPERATION_ID. */
export const JOB_ROUTE_CLASSIFY_UC_ALIAS = 'job_route_classify';
export const SEALED_JOB_ROUTE_CLASSIFY_REGISTRY_VERSION = 'model-op-registry-v1';
export const SEALED_JOB_ROUTE_CLASSIFY_INPUT_KIND = 'chat';
export const SEALED_JOB_ROUTE_CLASSIFY_CAPABILITY = 'text-small';
export const SEALED_JOB_ROUTE_CLASSIFY_ENDPOINT_PROFILE_ID = 'text-cn-public';
export const SEALED_JOB_ROUTE_CLASSIFY_REGION = 'cn-beijing';
export const SEALED_JOB_ROUTE_CLASSIFY_MODEL_OR_RECIPE = 'job-route-classifier';
export const SEALED_JOB_ROUTE_CLASSIFY_ADMISSION_KEY =
  'dashscope-main|cn-beijing|job-route-classifier|job.route-classify.v1';
export const SEALED_JOB_ROUTE_CLASSIFY_PROMPT_CONTRACT = 'job.route-classify.v1';
export const SEALED_JOB_ROUTE_CLASSIFY_PROMPT_VERSION = 'p.v1';
export const SEALED_JOB_ROUTE_CLASSIFY_OUTPUT_CONTRACT = 'job.route-decision.schema.v1';

const SHA256_HEX = /^[0-9a-f]{64}$/;
const ALLOWED_PROVENANCE_KEYS = [
  'operationId', 'registryVersion', 'inputKind', 'capability', 'endpointProfileId',
  'region', 'modelOrRecipe', 'admissionKey', 'semanticDigest', 'wired',
] as const;

export interface SealedJobRouteClassifyProvenance {
  readonly operationId: typeof SEALED_JOB_ROUTE_CLASSIFY_OPERATION_ID;
  readonly registryVersion: typeof SEALED_JOB_ROUTE_CLASSIFY_REGISTRY_VERSION;
  readonly inputKind: typeof SEALED_JOB_ROUTE_CLASSIFY_INPUT_KIND;
  readonly capability: typeof SEALED_JOB_ROUTE_CLASSIFY_CAPABILITY;
  readonly endpointProfileId: typeof SEALED_JOB_ROUTE_CLASSIFY_ENDPOINT_PROFILE_ID;
  readonly region: typeof SEALED_JOB_ROUTE_CLASSIFY_REGION;
  readonly modelOrRecipe: typeof SEALED_JOB_ROUTE_CLASSIFY_MODEL_OR_RECIPE;
  readonly admissionKey: typeof SEALED_JOB_ROUTE_CLASSIFY_ADMISSION_KEY;
  /** Canonical job semantic digest (sha256 hex); never raw title/description. */
  readonly semanticDigest: string;
  readonly wired: true;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/** Parse a caller/DB snapshot. Unknown fields and secret/text carriers fail closed. */
export function parseSealedJobRouteClassifyProvenance(candidate: unknown): SealedJobRouteClassifyProvenance | null {
  if (!isRecord(candidate)) return null;
  const keys = Object.keys(candidate);
  if (keys.length !== ALLOWED_PROVENANCE_KEYS.length) return null;
  if (!ALLOWED_PROVENANCE_KEYS.every((key) => keys.includes(key))) return null;
  if (candidate.operationId !== SEALED_JOB_ROUTE_CLASSIFY_OPERATION_ID) return null;
  if (candidate.registryVersion !== SEALED_JOB_ROUTE_CLASSIFY_REGISTRY_VERSION) return null;
  if (candidate.inputKind !== SEALED_JOB_ROUTE_CLASSIFY_INPUT_KIND) return null;
  if (candidate.capability !== SEALED_JOB_ROUTE_CLASSIFY_CAPABILITY) return null;
  if (candidate.endpointProfileId !== SEALED_JOB_ROUTE_CLASSIFY_ENDPOINT_PROFILE_ID) return null;
  if (candidate.region !== SEALED_JOB_ROUTE_CLASSIFY_REGION) return null;
  if (candidate.modelOrRecipe !== SEALED_JOB_ROUTE_CLASSIFY_MODEL_OR_RECIPE) return null;
  if (candidate.admissionKey !== SEALED_JOB_ROUTE_CLASSIFY_ADMISSION_KEY) return null;
  if (candidate.wired !== true) return null;
  if (typeof candidate.semanticDigest !== 'string' || !SHA256_HEX.test(candidate.semanticDigest)) return null;
  return Object.freeze({
    operationId: SEALED_JOB_ROUTE_CLASSIFY_OPERATION_ID,
    registryVersion: SEALED_JOB_ROUTE_CLASSIFY_REGISTRY_VERSION,
    inputKind: SEALED_JOB_ROUTE_CLASSIFY_INPUT_KIND,
    capability: SEALED_JOB_ROUTE_CLASSIFY_CAPABILITY,
    endpointProfileId: SEALED_JOB_ROUTE_CLASSIFY_ENDPOINT_PROFILE_ID,
    region: SEALED_JOB_ROUTE_CLASSIFY_REGION,
    modelOrRecipe: SEALED_JOB_ROUTE_CLASSIFY_MODEL_OR_RECIPE,
    admissionKey: SEALED_JOB_ROUTE_CLASSIFY_ADMISSION_KEY,
    semanticDigest: candidate.semanticDigest,
    wired: true,
  });
}
