/**
 * Fail-closed question generation: a provider miss must not become interview
 * content.  Callers persist provenance; they never invent a stem to keep the
 * graph moving.
 */
export const QUESTION_GENERATION_ERROR_CODES = [
  'provider_not_configured',
  'provider_timeout',
  'provider_malformed',
  'external_outcome_unknown',
  'schema_invalid',
  'business_invalid',
  'duplicate_question',
  'attempt_replay_forbidden',
  'generation_unavailable',
] as const;

export type QuestionGenerationErrorCode = (typeof QUESTION_GENERATION_ERROR_CODES)[number];

export const QUESTION_GENERATION_ORIGINS = ['model', 'approved_template', 'unavailable'] as const;
export type QuestionGenerationOrigin = (typeof QUESTION_GENERATION_ORIGINS)[number];

/** Audit-safe generation receipt. Never holds prompts, keys, résumé text or raw model output. */
export interface QuestionGenerationProvenance {
  readonly origin: QuestionGenerationOrigin;
  readonly operationId?: string;
  readonly idempotencyKey?: string;
  readonly errorCode?: QuestionGenerationErrorCode;
  /** Stable invoke/adapter error token (ASCII). Must not contain secrets or user content. */
  readonly invokeError?: string;
}

export type QuestionGenerationResult =
  | { ok: true; question: string; sources: string[]; provenance: QuestionGenerationProvenance }
  | { ok: false; error: QuestionGenerationErrorCode; provenance: QuestionGenerationProvenance };

const NOT_CONFIGURED = /not_configured|policy_required|known_not_executed|provider_rejected|deterministic_refusal|admission|project_missing|project_disabled|operation_unknown|operation_blocked|prepare_failed|operation_policy/;
const TIMEOUT = /timeout|timed_out|deadline_exceeded/;
const MALFORMED = /schema_validation_failed|malformed|json_invalid|parse_error|empty_content|no_audio|usage_invalid/;

export function classifyQuestionGenerationError(invokeError: string): QuestionGenerationErrorCode {
  if (typeof invokeError !== 'string' || invokeError.length < 1 || invokeError.length > 200) {
    return 'generation_unavailable';
  }
  if (invokeError.startsWith('business:')) return 'business_invalid';
  if (invokeError === 'schema_validation_failed') return 'schema_invalid';
  if (invokeError === 'external_outcome_unknown') return 'external_outcome_unknown';
  if (TIMEOUT.test(invokeError)) return 'provider_timeout';
  if (NOT_CONFIGURED.test(invokeError)) return 'provider_not_configured';
  if (MALFORMED.test(invokeError)) return 'provider_malformed';
  return 'generation_unavailable';
}

export function unavailableGeneration(
  error: QuestionGenerationErrorCode,
  extra: Omit<QuestionGenerationProvenance, 'origin' | 'errorCode'> = {},
): QuestionGenerationResult {
  return {
    ok: false,
    error,
    provenance: { origin: 'unavailable', errorCode: error, ...extra },
  };
}

export function approvedTemplateGeneration(question: string): QuestionGenerationResult {
  return {
    ok: true,
    question,
    sources: [],
    provenance: { origin: 'approved_template' },
  };
}

export function modelGeneration(question: string, sources: string[], extra: Omit<QuestionGenerationProvenance, 'origin'> = {}): QuestionGenerationResult {
  return { ok: true, question, sources, provenance: { origin: 'model', ...extra } };
}

/** Graph test seams may still return the legacy `{question,sources}` shape. */
export function normalizeQuestionGenerationResult(
  raw: QuestionGenerationResult | { question: string; sources?: string[] },
): QuestionGenerationResult {
  if ('ok' in raw) return raw;
  if (typeof raw.question !== 'string' || raw.question.trim().length < 1) {
    return unavailableGeneration('generation_unavailable');
  }
  return modelGeneration(raw.question, Array.isArray(raw.sources) ? raw.sources : []);
}

export function isQuestionGenerationFailure(result: QuestionGenerationResult): result is Extract<QuestionGenerationResult, { ok: false }> {
  return result.ok === false;
}
