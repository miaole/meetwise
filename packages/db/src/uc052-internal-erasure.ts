/**
 * UC-E2E-052 Line B · internal authorized interview erasure (first knife).
 *
 * No public HTTP · no app_role re-GRANT of privacy_begin_checkpoint_erasure.
 * Projection begin (event/ai_graph_run/report + checkpoint fence) + attach
 * oss/redis/langfuse as retention_pending → happy terminal pending_external.
 */
import { createHash, createHmac } from 'node:crypto';
import type { Client } from './principal.ts';
import {
  purgeInterviewProjectionTarget,
} from './int-transcript-projection.ts';
import {
  claimAuthorizationTarget,
  consumeAuthorizationSnapshotBound,
  issueAuthorizationSnapshot,
  recordDeletionReceipt,
} from './privacy-authorization.ts';
import {
  canonicalTargetSetDigest,
  PrivacyAuthzKeyRegistry,
  signPrivacyAuthorizationSnapshot,
  verifyPrivacyAuthorizationSnapshot,
  type EcJwk,
  type PrivacyAuthzTarget,
} from '@meetwise/domain';

const EXTERNAL_SINKS = ['oss', 'redis', 'langfuse'] as const;
const LOCAL_PURGE_SINKS = new Set(['event', 'ai_graph_run', 'report']);

export type Uc052ErasureSink =
  | 'event' | 'ai_graph_run' | 'report' | 'checkpoint_rows'
  | 'oss' | 'redis' | 'langfuse';

export interface Uc052ErasureTarget {
  sink: Uc052ErasureSink;
  resourceHmac: string;
  targetId: string;
  status?: string;
}

export interface Uc052InternalErasureResult {
  requestId: string;
  requestStatus: string;
  privacyEpoch: number;
  targetSetDigest: string;
  targets: Uc052ErasureTarget[];
  purgedLocalSinks: string[];
  jti: string;
  jws: string;
}

export interface Uc052SignKeys {
  privateKeyPem: string;
  publicJwk: EcJwk;
  kid: string;
}

function resourceHmac(interviewId: string, sink: string, requestId: string, keyHash: string): string {
  // Match pgcrypto hmac(text, text, 'sha256'): key is the hex string bytes, not decoded.
  return createHmac('sha256', keyHash).update(`${interviewId}:${sink}:${requestId}`).digest('hex');
}

function digestFromTargets(targets: Array<{ sink: string; resourceHmac: string }>): string {
  return canonicalTargetSetDigest(targets.map((t) => ({ kind: t.sink, resource: t.resourceHmac })));
}

export async function attachExternalRetentionPendingTargets(
  c: Client,
  requestId: string,
  interviewId: string,
  idempotencyKeyHash: string,
): Promise<void> {
  for (const sink of EXTERNAL_SINKS) {
    const hmac = resourceHmac(interviewId, sink, requestId, idempotencyKeyHash);
    await c.query(
      `INSERT INTO privacy_deletion_target(request_id, sink, resource_hmac, status)
       VALUES ($1::uuid, $2, $3, 'retention_pending')
       ON CONFLICT (request_id, sink, resource_hmac) DO NOTHING`,
      [requestId, sink, hmac],
    );
  }
  const dig = await c.query<{ d: string }>(
    `SELECT encode(digest(string_agg(d.sink || ':' || d.resource_hmac, E'\\n' ORDER BY d.sink, d.resource_hmac), 'sha256'), 'hex') AS d
       FROM privacy_deletion_target d WHERE d.request_id = $1::uuid`,
    [requestId],
  );
  const digest = dig.rows[0]?.d;
  if (!digest || !/^[a-f0-9]{64}$/.test(digest)) {
    throw Object.assign(new Error('uc052_external_digest_invalid'), { code: 'uc052_external_digest_invalid' });
  }
  await c.query(
    `UPDATE privacy_erasure_request
        SET target_set_digest = $2, updated_at = now(), version = version + 1
      WHERE id = $1::uuid`,
    [requestId, digest],
  );
}

export async function loadRequestTargets(c: Client, requestId: string): Promise<Uc052ErasureTarget[]> {
  const rows = await c.query<{ id: string; sink: string; resource_hmac: string; status: string }>(
    `SELECT id, sink, resource_hmac, status FROM privacy_deletion_target WHERE request_id = $1::uuid ORDER BY sink`,
    [requestId],
  );
  return rows.rows.map((r) => ({
    sink: r.sink as Uc052ErasureSink,
    resourceHmac: r.resource_hmac,
    targetId: r.id,
    status: r.status,
  }));
}

export async function loadRequestStatus(c: Client, requestId: string): Promise<string> {
  const r = await c.query<{ status: string }>(
    `SELECT status FROM privacy_erasure_request WHERE id = $1::uuid`,
    [requestId],
  );
  const s = r.rows[0]?.status;
  if (!s) throw Object.assign(new Error('uc052_request_missing'), { code: 'uc052_request_missing' });
  return s;
}

/** Mirror 0096 L576–583 CASE so FAULT paths without a final purge still settle status. */
export async function reassessRequestStatus(c: Client, requestId: string): Promise<string> {
  await c.query(
    `UPDATE privacy_erasure_request AS r
        SET status = CASE
          WHEN EXISTS (SELECT 1 FROM privacy_deletion_target t WHERE t.request_id=r.id AND t.status IN ('pending','leased')) THEN 'purging'
          WHEN EXISTS (SELECT 1 FROM privacy_deletion_receipt rc WHERE rc.request_id=r.id AND rc.receipt_kind='external_pending') THEN 'pending_external'
          WHEN EXISTS (SELECT 1 FROM privacy_deletion_target t WHERE t.request_id=r.id AND t.status='retention_pending') THEN 'pending_external'
          WHEN EXISTS (SELECT 1 FROM privacy_deletion_receipt rc WHERE rc.request_id=r.id AND rc.receipt_kind='failed_cleanup') THEN 'partial_failed'
          WHEN EXISTS (SELECT 1 FROM privacy_deletion_target t WHERE t.request_id=r.id AND t.status='failed') THEN 'partial_failed'
          ELSE 'completed' END,
            version = r.version + 1, updated_at = now()
      WHERE r.id = $1::uuid`,
    [requestId],
  );
  return loadRequestStatus(c, requestId);
}

export interface RunAuthorizedInterviewErasureInput {
  /** Already-committed begin + attachExternal result. */
  preBegun: { requestId: string; privacyEpoch: number };
  issue: (fn: (c: Client) => Promise<void>) => Promise<void>;
  consumeClient: Client;
  asWorkerPrincipal: <T>(owner: string, fn: (c: Client) => Promise<T>) => Promise<T>;
  admin: Client;
  owner: string;
  interviewId: string;
  keys: Uc052SignKeys;
  workerId: string;
  nowSec?: number;
  ttlSec?: number;
  failSink?: 'event' | 'ai_graph_run' | 'report';
}

export async function runAuthorizedInterviewErasure(
  input: RunAuthorizedInterviewErasureInput,
): Promise<Uc052InternalErasureResult> {
  const {
    preBegun, issue, consumeClient, asWorkerPrincipal, admin,
    owner, interviewId, keys, workerId,
    nowSec = Math.floor(Date.now() / 1000), ttlSec = 600, failSink,
  } = input;

  const privacyEpoch = preBegun.privacyEpoch;
  const sealedTargets = await loadRequestTargets(admin, preBegun.requestId);
  const sealedDigest = digestFromTargets(sealedTargets);
  const reqDig = await admin.query<{ target_set_digest: string }>(
    `SELECT target_set_digest FROM privacy_erasure_request WHERE id = $1::uuid`,
    [preBegun.requestId],
  );
  if (reqDig.rows[0]?.target_set_digest !== sealedDigest) {
    throw Object.assign(new Error('uc052_digest_mismatch_after_attach'), { code: 'uc052_digest_mismatch_after_attach' });
  }

  const signTargets: PrivacyAuthzTarget[] = sealedTargets.map((t) => ({ kind: t.sink, resource: t.resourceHmac }));
  const signed = signPrivacyAuthorizationSnapshot({
    privateKeyPem: keys.privateKeyPem, kid: keys.kid, actor: owner, owner, interview: interviewId,
    purpose: 'interview_data_erasure', privacyEpoch, targets: signTargets, nowSec, ttlSec,
  });
  if (signed.targetSetDigest !== sealedDigest) {
    throw Object.assign(new Error('uc052_signed_digest_mismatch'), { code: 'uc052_signed_digest_mismatch' });
  }

  await issue(async (c) => {
    await issueAuthorizationSnapshot(c, {
      jti: signed.jti, keyId: keys.kid, actor: owner, interviewId,
      purpose: 'interview_data_erasure', privacyEpoch, targetSetDigest: signed.targetSetDigest,
      expiresAt: new Date(signed.expiresAtMs),
    });
  });

  // C2: JWS verify BEFORE consume.
  const registry = new PrivacyAuthzKeyRegistry();
  registry.activate(keys.kid, keys.publicJwk);
  const verified = verifyPrivacyAuthorizationSnapshot({
    jws: signed.jws, resolveJwk: registry.resolve.bind(registry), nowSec,
  });
  if (!verified) {
    throw Object.assign(new Error('uc052_jws_verify_failed'), { code: 'uc052_jws_verify_failed' });
  }

  await consumeAuthorizationSnapshotBound(consumeClient, verified, workerId);

  const purgedLocalSinks: string[] = [];
  for (const t of sealedTargets) {
    if (!LOCAL_PURGE_SINKS.has(t.sink)) continue;
    if (failSink && t.sink === failSink) {
      await admin.query(
        `UPDATE privacy_deletion_target
            SET status = 'failed', lease_token = NULL, lease_expires_at = NULL, lease_owner = NULL, updated_at = now()
          WHERE id = $1::uuid`,
        [t.targetId],
      );
      continue;
    }
    const claimed = await asWorkerPrincipal(owner, (c) =>
      claimAuthorizationTarget(c, signed.jti, t.targetId, workerId, 60));
    if (!claimed?.leaseToken) {
      throw Object.assign(new Error('uc052_claim_failed'), { code: 'uc052_claim_failed', sink: t.sink });
    }
    await asWorkerPrincipal(owner, (c) =>
      purgeInterviewProjectionTarget(c, t.targetId, claimed.leaseToken));
    await asWorkerPrincipal(owner, (c) =>
      recordDeletionReceipt(
        c, t.targetId, 'local_erased',
        createHash('sha256').update(`${t.targetId}:local_erased`).digest('hex'), workerId,
      ));
    purgedLocalSinks.push(t.sink);
  }

  const requestStatus = await reassessRequestStatus(admin, preBegun.requestId);

  return {
    requestId: preBegun.requestId,
    requestStatus,
    privacyEpoch,
    targetSetDigest: sealedDigest,
    targets: await loadRequestTargets(admin, preBegun.requestId),
    purgedLocalSinks,
    jti: signed.jti,
    jws: signed.jws,
  };
}

export async function retryFailedLocalTarget(input: {
  admin: Client;
  asWorkerPrincipal: <T>(owner: string, fn: (c: Client) => Promise<T>) => Promise<T>;
  owner: string;
  jti: string;
  targetId: string;
  workerId: string;
}): Promise<{ requestStatus: string }> {
  const { admin, asWorkerPrincipal, owner, jti, targetId, workerId } = input;
  const claimed = await asWorkerPrincipal(owner, (c) =>
    claimAuthorizationTarget(c, jti, targetId, workerId, 60));
  if (!claimed?.leaseToken) {
    throw Object.assign(new Error('uc052_retry_claim_failed'), { code: 'uc052_retry_claim_failed' });
  }
  await asWorkerPrincipal(owner, (c) => purgeInterviewProjectionTarget(c, targetId, claimed.leaseToken));
  await asWorkerPrincipal(owner, (c) =>
    recordDeletionReceipt(
      c, targetId, 'local_erased',
      createHash('sha256').update(`${targetId}:retry`).digest('hex'), workerId,
    ));
  const req = await admin.query<{ request_id: string }>(
    `SELECT request_id FROM privacy_deletion_target WHERE id = $1::uuid`, [targetId],
  );
  return { requestStatus: await reassessRequestStatus(admin, req.rows[0]!.request_id) };
}
