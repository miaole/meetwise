/**
 * Job route classify — MODEL-OP-01 typed binding + sole Worker modelClassify seam
 * for UC `job_route_classify` (registry id `job.route-classify.v1`).
 *
 * P-MODEL: frozen chat binding + sealed provenance (no network, no Key).
 * P-WORKER: `createJobRouteModelClassify` injects an honest modelClassify into
 * `classifyJobRoute` via bind + invoke (not a fake rule-only classifier).
 * Without Key / pre-dispatch refusal → known_not_sent fail-closed.
 * Post-dispatch unknown → throw `dispatched_unknown` (sticky terminal).
 *
 * Forbidden: raw prompt strings in binding, provider URLs, free model names.
 * Content identity travels as TypedRef digests (job-semantic sha256); job text
 * is rendered only as untrusted <data> via the versioned prompt registry.
 *
 * Closing P-WORKER ≠ R2 closed (P-API may remain). releaseEvidence=false · Not HA.
 */
import { z } from 'zod';
import {
  SEALED_JOB_ROUTE_CLASSIFY_OPERATION_ID,
  SEALED_JOB_ROUTE_CLASSIFY_PROMPT_CONTRACT,
  SEALED_JOB_ROUTE_CLASSIFY_PROMPT_VERSION,
  SEALED_JOB_ROUTE_CLASSIFY_OUTPUT_CONTRACT,
  parseSealedJobRouteClassifyProvenance,
  canonicalJobSemanticDigest,
  type SealedJobRouteClassifyProvenance,
  type JobRouteModelOutput,
} from '@meetwise/domain';
import type { DbPool } from '@meetwise/db';
import type { JobRouteModelClassify, JobRouteModelInput } from '@meetwise/db';
import { MODEL_OPERATION_REGISTRY_VERSION, lookupModelOperation } from './model-operation-registry.ts';
import { INPUT_KIND_ENDPOINT_PROFILES, resolveModelOperationBinding } from './operation-binding.ts';
import { invoke } from './invoke.ts';
import { promptedModel, type ModelClient } from './model-client.ts';

export const JOB_ROUTE_CLASSIFY_OPERATION_ID = SEALED_JOB_ROUTE_CLASSIFY_OPERATION_ID;
export const JOB_ROUTE_CLASSIFY_PROMPT_SERVICE = SEALED_JOB_ROUTE_CLASSIFY_PROMPT_CONTRACT;

const SHA256_HEX = /^[0-9a-f]{64}$/;

export type JobRouteClassifyBindError =
  | 'model_operation_unknown'
  | 'model_operation_kind_unknown'
  | 'model_operation_input_invalid'
  | 'model_operation_provider_url_forbidden'
  | 'model_operation_endpoint_profile_invalid'
  | 'model_operation_not_wired'
  | 'job_route_classify_binding_invalid'
  | 'job_route_semantic_digest_invalid';

export type JobRouteClassifyBindDecision =
  | { ok: true; provenance: SealedJobRouteClassifyProvenance }
  | { ok: false; error: JobRouteClassifyBindError };

/**
 * Resolve the frozen job-route-classify binding.  Callers/tests may pass a
 * non-registry operation id to prove fail-closed.  Production helper always
 * uses `job.route-classify.v1`.  No network, no Key.
 */
export function bindJobRouteClassifyOperation(
  operationId: string,
  semanticDigest: string,
): JobRouteClassifyBindDecision {
  if (!SHA256_HEX.test(semanticDigest)) {
    return { ok: false, error: 'job_route_semantic_digest_invalid' };
  }
  const endpoint = INPUT_KIND_ENDPOINT_PROFILES.chat;
  const candidate = {
    inputKind: 'chat' as const,
    promptContract: SEALED_JOB_ROUTE_CLASSIFY_PROMPT_CONTRACT,
    promptVersion: SEALED_JOB_ROUTE_CLASSIFY_PROMPT_VERSION,
    outputContract: SEALED_JOB_ROUTE_CLASSIFY_OUTPUT_CONTRACT,
    refs: [{ kind: 'job-semantic', digest: semanticDigest }],
  };
  const bound = resolveModelOperationBinding(operationId, candidate);
  if (!bound.ok) return { ok: false, error: bound.error };
  if (!bound.binding.wired) return { ok: false, error: 'model_operation_not_wired' };
  if (bound.binding.endpoint.profileId !== endpoint.profileId) {
    return { ok: false, error: 'model_operation_endpoint_profile_invalid' };
  }
  const definition = lookupModelOperation(bound.binding.operationId);
  if (!definition) return { ok: false, error: 'model_operation_unknown' };
  const snapshot = {
    operationId: bound.binding.operationId,
    registryVersion: MODEL_OPERATION_REGISTRY_VERSION,
    inputKind: bound.binding.inputKind,
    capability: bound.binding.capability,
    endpointProfileId: bound.binding.endpoint.profileId,
    region: definition.admission.region,
    modelOrRecipe: definition.admission.modelOrRecipe,
    admissionKey: bound.binding.admissionKey,
    semanticDigest,
    wired: true as const,
  };
  const provenance = parseSealedJobRouteClassifyProvenance(snapshot);
  if (!provenance) return { ok: false, error: 'job_route_classify_binding_invalid' };
  return { ok: true, provenance };
}

export function bindJobRouteClassify(semanticDigest: string): JobRouteClassifyBindDecision {
  return bindJobRouteClassifyOperation(JOB_ROUTE_CLASSIFY_OPERATION_ID, semanticDigest);
}

const JobRouteModelOutputSchema = z.object({
  allocations: z.array(z.object({
    leafTrackId: z.string().min(1).max(64),
    allocationBps: z.number().int(),
  })).max(4),
  confidenceBps: z.number().int(),
  marginBps: z.number().int(),
  reasonCodes: z.array(z.string().min(1).max(64)).max(16),
});

const PRE_DISPATCH_KNOWN_NOT_SENT = new Set([
  'model_prepare_failed',
  'model_prepare_timeout',
  'model_logical_node_key_required',
  'model_logical_node_key_conflict',
  'model_invocation_wait_timeout',
  'model_dispatch_preflight_failed',
  'deterministic_refusal',
  'provider_rejected',
  'privacy_fenced_pre_dispatch',
  'job_route_classify_binding_invalid',
  'job_route_semantic_digest_invalid',
  'job_route_semantic_digest_mismatch',
  'model_not_configured',
  'model_key_missing',
]);

function knownNotSent(reason: string): JobRouteModelOutput {
  return { allocations: [], confidenceBps: 0, marginBps: 0, reasonCodes: [reason] };
}

export interface CreateJobRouteModelClassifyDeps {
  pool: DbPool;
  owner: string;
  model: ModelClient;
}

/**
 * Honest modelClassify for sole Worker: bindJobRouteClassify → invoke.
 * Not a rule-only fake. Fail-closed without Key / binding / pre-dispatch.
 */
export function createJobRouteModelClassify(deps: CreateJobRouteModelClassifyDeps): JobRouteModelClassify {
  return async (input: JobRouteModelInput): Promise<JobRouteModelOutput> => {
    const digest = canonicalJobSemanticDigest({
      title: input.title,
      description: input.description,
      competencies: input.competencies,
    });
    const bound = bindJobRouteClassify(digest);
    if (!bound.ok) return knownNotSent(bound.error);

    const idempotencyKey = `job-route-classify:${input.jobId}:${input.revision}:${digest}`;
    const model = promptedModel(deps.model, JOB_ROUTE_CLASSIFY_PROMPT_SERVICE, {
      title: input.title,
      description: input.description,
      competencies: input.competencies,
      taxonomyLeaves: 'backend/nodejs,backend/java,backend/go,backend/python,backend/general,frontend/web,qa/quality_engineering,ai_ml/applied',
    });

    let outcome: { value: z.infer<typeof JobRouteModelOutputSchema> } | { error: string };
    try {
      outcome = await invoke({
        idempotencyKey,
        operation: { id: JOB_ROUTE_CLASSIFY_OPERATION_ID, businessRevision: `${input.jobId}:${input.revision}` },
        schema: JobRouteModelOutputSchema,
        businessValidate: (v) => (Array.isArray(v.reasonCodes) ? null : 'job_route_output_invalid'),
        model,
        service: JOB_ROUTE_CLASSIFY_PROMPT_SERVICE,
        redactOutput: true,
      }, deps.pool, deps.owner);
    } catch (err) {
      const code = (err as { code?: string } | undefined)?.code;
      if (code === 'dispatched_unknown') throw err;
      // Unexpected throw before/around dispatch: treat as known_not_sent so
      // classifyJobRoute can terminalize without inventing a fake rule decision.
      const msg = code ?? (err instanceof Error ? err.message : 'model_classify_threw');
      if (/not_configured|api_key|key_missing|model_endpoint/i.test(msg)) {
        return knownNotSent('model_key_missing');
      }
      return knownNotSent(msg.slice(0, 64) || 'model_classify_threw');
    }

    if ('error' in outcome) {
      if (outcome.error === 'external_outcome_unknown') {
        throw Object.assign(new Error('dispatched_unknown'), { code: 'dispatched_unknown' });
      }
      if (PRE_DISPATCH_KNOWN_NOT_SENT.has(outcome.error) || outcome.error.startsWith('cost_')
        || outcome.error.startsWith('model_operation_') || outcome.error.startsWith('shared_')) {
        return knownNotSent(outcome.error.slice(0, 64));
      }
      // Conservative: unknown error codes after invoke without clear unknown
      // marker still fail-closed as known_not_sent (no fake route_decided).
      return knownNotSent(outcome.error.slice(0, 64) || 'invoke_error');
    }

    return {
      allocations: outcome.value.allocations.map((a) => ({
        leafTrackId: a.leafTrackId,
        allocationBps: a.allocationBps,
      })),
      confidenceBps: outcome.value.confidenceBps,
      marginBps: outcome.value.marginBps,
      reasonCodes: outcome.value.reasonCodes.slice(),
    };
  };
}
