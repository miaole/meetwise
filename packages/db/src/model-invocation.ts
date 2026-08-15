/**
 * Durable model-invocation claim.  Every function here runs inside one short
 * principal transaction; callers must never hold this transaction while doing
 * network I/O.  The lease only protects `claimed` (pre-dispatch) work.  Once
 * a request becomes dispatching, a timeout is an auditable unknown rather than
 * an invitation to send the same billable request again.
 */
import { createHash } from 'node:crypto';
import type { Client } from './principal.ts';

export type ModelInvocationClaim =
  | { action: 'execute'; leaseToken: string }
  | { action: 'cached'; output: unknown }
  | { action: 'wait' }
  | { action: 'failed'; error: string }
  | { action: 'unknown'; error: string };

export interface ClaimModelInvocationInput {
  owner: string;
  idempotencyKey: string;
  /**
   * Server-computed business-node identity.  Only its digest is persisted;
   * direct database writers never receive a raw prompt, answer, or route.
   *
   * The fallback exists solely for older local proof seams. Production invoke
   * rejects an omitted key before it reaches this helper.
   */
  logicalNodeKey?: string;
  requestDigest: string;
  service?: string;
  requestId?: string | null;
  /** Immutable cost-budget scope selected by the pure pre-dispatch route. */
  costScopeId?: string;
  leaseToken: string;
  leaseSeconds: number;
}

function logicalNodeKeyDigest(input: ClaimModelInvocationInput): string {
  const key = input.logicalNodeKey ?? `legacy:${input.idempotencyKey}`;
  if (key.length < 1 || key.length > 512 || /[\u0000\r\n]/.test(key))
    throw new Error('model_logical_node_key_invalid');
  return createHash('sha256').update(key, 'utf8').digest('hex');
}

export async function claimModelInvocation(c: Client, input: ClaimModelInvocationInput): Promise<ModelInvocationClaim> {
  const nodeDigest = logicalNodeKeyDigest(input);
  const r = await c.query<{ action: string; lease_token: string | null; output: unknown; error_code: string | null }>(
    `SELECT action,lease_token,output,error_code
       FROM ai_model_claim_invocation_scoped($1,$2,$3,$4,$5,$6,$7,$8::uuid,$9)`,
    [
      input.owner, input.idempotencyKey, nodeDigest, input.requestDigest,
      input.service ?? null, input.requestId ?? null, input.costScopeId ?? null,
      input.leaseToken, input.leaseSeconds,
    ],
  );
  const row = r.rows[0];
  if (!row) throw new Error('model_invocation_claim_no_decision');
  const action = String(row.action);
  if (action === 'execute' && row.lease_token) return { action, leaseToken: String(row.lease_token) };
  if (action === 'cached') return { action, output: row.output };
  if (action === 'wait') return { action };
  if (action === 'failed' || action === 'unknown')
    return { action, error: String(row.error_code ?? (action === 'failed' ? 'model_invocation_failed' : 'external_outcome_unknown')) };
  throw new Error('model_invocation_claim_invalid_decision');
}

/** Atomically establishes the durable post-dispatch boundary. */
export async function markModelInvocationDispatched(
  c: Client, owner: string, idempotencyKey: string, leaseToken: string, costScopeId?: string,
): Promise<boolean> {
  const r = await c.query(
    'SELECT ai_model_transition_dispatched_scoped($1,$2,$3::uuid,$4) AS ok',
    [owner, idempotencyKey, leaseToken, costScopeId ?? null],
  );
  return r.rows[0]?.ok === true;
}

/** Fails a pre-dispatch claim without ever recording an external-send boundary. */
export async function failModelInvocationClaim(c: Client, owner: string, idempotencyKey: string, leaseToken: string, error: string): Promise<boolean> {
  const r = await c.query(
    'SELECT ai_model_fail_claim_scoped($1,$2,$3::uuid,$4) AS ok',
    [owner, idempotencyKey, leaseToken, error],
  );
  return r.rows[0]?.ok === true;
}

export interface CompleteModelInvocationInput {
  owner: string;
  idempotencyKey: string;
  output?: unknown;
  replayable?: boolean;
  error?: string;
  inputTokens?: number;
  outputTokens?: number;
  latencyMs?: number;
}

export async function completeModelInvocation(c: Client, input: CompleteModelInvocationInput): Promise<boolean> {
  const succeeded = input.error === undefined;
  const r = await c.query(
    `SELECT ai_model_terminalize_scoped($1,$2,$3,$4,$5::jsonb,$6,$7,$8,$9) AS ok`,
    [
      input.owner, input.idempotencyKey, succeeded ? 'succeeded' : 'failed', input.error ?? null,
      succeeded ? JSON.stringify(input.output) : null, input.replayable ?? true,
      input.inputTokens ?? null, input.outputTokens ?? null, input.latencyMs ?? null,
    ],
  );
  return r.rows[0]?.ok === true;
}

export async function markModelInvocationUnknown(c: Client, owner: string, idempotencyKey: string, error: string): Promise<boolean> {
  const r = await c.query(
    `SELECT ai_model_terminalize_scoped($1,$2,'unknown',$3,NULL::jsonb,true,NULL,NULL,NULL) AS ok`,
    [owner, idempotencyKey, error],
  );
  return r.rows[0]?.ok === true;
}

export interface ReconciledModelInvocation { idempotencyKey: string; costScopeId?: string }

/**
 * Terminalizes only stale post-dispatch records.  The caller must freeze the
 * corresponding cost rows in the same principal transaction.  `SKIP LOCKED`
 * makes overlapping reconcilers cooperate without a global process lock.
 */
export async function reconcileStaleModelInvocations(
  c: Client, owner: string, olderThanMs: number, limit: number,
): Promise<ReconciledModelInvocation[]> {
  if (!Number.isSafeInteger(olderThanMs) || olderThanMs < 35_000 || olderThanMs > 3_600_000)
    throw new Error('model_invocation_reconcile_window_invalid');
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 1_000)
    throw new Error('model_invocation_reconcile_limit_invalid');
  const r = await c.query<{ idempotency_key: string; cost_scope_id: string | null }>(
    `SELECT idempotency_key,cost_scope_id
       FROM ai_model_reconcile_stale_scoped($1,$2,$3)`,
    [owner, olderThanMs, limit],
  );
  return r.rows.map((row) => ({
    idempotencyKey: String(row.idempotency_key),
    ...(row.cost_scope_id ? { costScopeId: String(row.cost_scope_id) } : {}),
  }));
}
