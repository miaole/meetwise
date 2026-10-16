/**
 * Provider-input recipe (RAG-FUNNEL-02A).
 *
 * This is the typed, validatable description of the RAG context that actually
 * feeds a model for ONE serving leaf — the "projection chunk → provider input"
 * contract.  It is deliberately NOT the MODEL-OP model catalog (PRD-TEST-009),
 * which answers "which model / region / prompt version"; this recipe answers
 * "which reviewed chunks, in what order and under which serving scope, become
 * the data block a model sees".  The two never share a hash space.
 *
 * It lives in the data plane (`@meetwise/db`) rather than `packages/contracts`
 * because it is server-internal: the frontend never sees provider-input chunks,
 * and nothing here is a shared front/back API schema.  It carries zero model
 * dependency and no raw PII by construction — only refs, roles, and bounded
 * excerpts of reviewed corpus text.
 */
import { createHash } from 'node:crypto';
import type { QbankQuestionChunkRole } from './qbank-ingest.ts';

export const QBANK_PROVIDER_INPUT_SCHEMA = 'qbank-provider-input:v1' as const;

/** A raw (non-question) cut may also feed a model as standalone reference material. */
export type QbankProviderInputRole = QbankQuestionChunkRole | 'reference';

const GENERATION_ID = /^qgen-[0-9a-f-]{36}$/;
const SAFE_REF_ID = /^[A-Za-z0-9:_-]{1,160}$/;
const TAXONOMY_VERSION = /^v[1-9][0-9]{0,15}$/;
const SERVING_SCOPE = /^[a-z][a-z0-9_]*(\/[a-z][a-z0-9_]*){0,3}$/;
const ROLES: readonly QbankProviderInputRole[] = [
  'prompt', 'rubric', 'follow_up', 'example', 'anti_pattern', 'source_note', 'reference',
];
/** Mirrors the bounded evidence readers: a provider input never exceeds one bounded excerpt per part. */
export const QBANK_PROVIDER_INPUT_MAX_EXCERPT = 1200;
const MAX_PARTS = 200;

export interface QbankProviderInputPart {
  refId: string;
  role: QbankProviderInputRole;
  ordinal: number;
  required: boolean;
  /** Bounded, pre-validated corpus excerpt.  Never a full source body or PII. */
  excerpt: string;
}

/**
 * A scope-homogeneous provider input: every part belongs to exactly this
 * `servingScopeId` / `taxonomyVersion`, which is the track-local guarantee that
 * a wrong-track chunk can never be spliced into a model prompt.
 */
export interface QbankProviderInputRecipe {
  schema: typeof QBANK_PROVIDER_INPUT_SCHEMA;
  generationId: string;
  taxonomyVersion: string;
  servingScopeId: string;
  parts: readonly QbankProviderInputPart[];
}

export interface BuildQbankProviderInput {
  generationId: string;
  taxonomyVersion: string;
  servingScopeId: string;
  parts: readonly QbankProviderInputPart[];
}

/** Fail-closed structural validation; business "no eligible context" (05) is a caller decision, not a shape error. */
export function validateQbankProviderInputRecipe(recipe: QbankProviderInputRecipe): void {
  if (recipe.schema !== QBANK_PROVIDER_INPUT_SCHEMA) throw new Error('qbank_provider_input_schema_mismatch');
  if (!GENERATION_ID.test(recipe.generationId)) throw new Error('qbank_provider_input_invalid_generation');
  if (!TAXONOMY_VERSION.test(recipe.taxonomyVersion)) throw new Error('qbank_provider_input_invalid_taxonomy_version');
  if (!SERVING_SCOPE.test(recipe.servingScopeId)) throw new Error('qbank_provider_input_invalid_serving_scope');
  if (!Array.isArray(recipe.parts) || recipe.parts.length > MAX_PARTS) throw new Error('qbank_provider_input_invalid_part_count');
  const seen = new Set<string>();
  for (const part of recipe.parts) {
    if (!part || !SAFE_REF_ID.test(part.refId)) throw new Error('qbank_provider_input_invalid_ref');
    if (!(ROLES as readonly string[]).includes(part.role)) throw new Error('qbank_provider_input_invalid_role');
    if (!Number.isInteger(part.ordinal) || part.ordinal < 0 || part.ordinal > 99) throw new Error('qbank_provider_input_invalid_ordinal');
    if (typeof part.required !== 'boolean') throw new Error('qbank_provider_input_invalid_required');
    if (typeof part.excerpt !== 'string' || !part.excerpt.trim()
      || part.excerpt.length > QBANK_PROVIDER_INPUT_MAX_EXCERPT) {
      throw new Error('qbank_provider_input_invalid_excerpt');
    }
    const key = `${part.refId}\u0000${part.role}\u0000${part.ordinal}`;
    if (seen.has(key)) throw new Error('qbank_provider_input_duplicate_part');
    seen.add(key);
  }
}

/**
 * Byte-stable canonical digest over a fixed key order, like the artifact and
 * serving-metadata receipts.  It is a provenance anchor: two structurally
 * equal recipes always hash equal; any part or scope change flips the digest.
 */
export function qbankProviderInputDigest(recipe: QbankProviderInputRecipe): string {
  return createHash('sha256').update(JSON.stringify({
    schema: recipe.schema,
    generationId: recipe.generationId,
    taxonomyVersion: recipe.taxonomyVersion,
    servingScopeId: recipe.servingScopeId,
    parts: recipe.parts.map((part) => ({
      refId: part.refId, role: part.role, ordinal: part.ordinal, required: part.required, excerpt: part.excerpt,
    })),
  })).digest('hex');
}

/** Constructs and validates a recipe in one step so no unvalidated recipe can reach a model call site. */
export function buildQbankProviderInputRecipe(input: BuildQbankProviderInput): QbankProviderInputRecipe {
  const recipe: QbankProviderInputRecipe = {
    schema: QBANK_PROVIDER_INPUT_SCHEMA,
    generationId: input.generationId,
    taxonomyVersion: input.taxonomyVersion,
    servingScopeId: input.servingScopeId,
    parts: [...input.parts],
  };
  validateQbankProviderInputRecipe(recipe);
  return recipe;
}
