/**
 * UC-E2E-052 Line B · GAP-PRIV-CHECKPOINT-FENCE-ONLY
 * Physical purge of LangGraph checkpoint_writes / checkpoint_blobs / checkpoints
 * on real PG after UC-052 authz (JWS verify → consume → 0091 claim → purge).
 *
 * Ban: new HTTP route · app_role re-GRANT of privacy_begin_checkpoint_erasure ·
 * ledger-bypass direct purge · forge completed while externals retention_pending ·
 * digest trim.
 */
import { createHash } from 'node:crypto';
import type { Client, DbPool } from './principal.ts';
import {
  claimAuthorizationTarget,
  consumeAuthorizationSnapshotBound,
  issueAuthorizationSnapshot,
  recordDeletionReceipt,
} from './privacy-authorization.ts';
import {
  beginCheckpointErasure,
  purgeCheckpointErasureTarget,
  type CheckpointErasureRequest,
} from './checkpoint-privacy.ts';
import {
  canonicalTargetSetDigest,
  PrivacyAuthzKeyRegistry,
  signPrivacyAuthorizationSnapshot,
  verifyPrivacyAuthorizationSnapshot,
  type EcJwk,
  type PrivacyAuthzTarget,
} from '@meetwise/domain';
import {
  loadRequestStatus,
  loadRequestTargets,
  reassessRequestStatus,
  type Uc052ErasureTarget,
  type Uc052SignKeys,
} from './uc052-internal-erasure.ts';

type Sql = DbPool | Client;

export interface Uc052CheckpointPhysicalResult {
  requestId: string;
  requestStatus: string;
  privacyEpoch: number;
  targetSetDigest: string;
  checkpointTargetId: string;
  deletedCount: number;
  targets: Uc052ErasureTarget[];
  jti: string;
  jws: string;
  fenceEpoch: number | null;
}

/** Seal privacy_epoch + target_set_digest so 0091 claim can re-verify (begin does not set them). */
export async function sealCheckpointErasureAuthz(
  c: Sql,
  requestId: string,
  privacyEpoch: number,
): Promise<{ targetSetDigest: string; targets: Uc052ErasureTarget[] }> {
  if (!Number.isSafeInteger(privacyEpoch) || privacyEpoch < 1) {
    throw Object.assign(new Error('uc052_ckpt_epoch_invalid'), { code: 'uc052_ckpt_epoch_invalid' });
  }
  const targets = await loadRequestTargets(c, requestId);
  if (targets.length === 0) {
    throw Object.assign(new Error('uc052_ckpt_no_targets'), { code: 'uc052_ckpt_no_targets' });
  }
  // C-NO-DIGEST-TRIM: digest over the full live set (checkpoint + job payload + externals).
  const targetSetDigest = canonicalTargetSetDigest(
    targets.map((t) => ({ kind: t.sink, resource: t.resourceHmac })),
  );
  await c.query(
    `UPDATE privacy_erasure_request
        SET privacy_epoch = $2,
            target_set_digest = $3,
            updated_at = now(),
            version = version + 1
      WHERE id = $1::uuid`,
    [requestId, privacyEpoch, targetSetDigest],
  );
  return { targetSetDigest, targets };
}

export interface RunAuthorizedCheckpointPhysicalInput {
  /** Privileged begin (NOT app_role) — e.g. SET ROLE privacy_api_owner. Ban re-GRANT to app_role. */
  begin: (fn: (c: Client) => Promise<CheckpointErasureRequest>) => Promise<CheckpointErasureRequest>;
  issue: (fn: (c: Client) => Promise<void>) => Promise<void>;
  consume: <T>(fn: (c: Client) => Promise<T>) => Promise<T>;
  asWorkerPrincipal: <T>(owner: string, fn: (c: Client) => Promise<T>) => Promise<T>;
  admin: DbPool;
  owner: string;
  threadId: string;
  idempotencyKeyHash: string;
  keys: Uc052SignKeys;
  workerId: string;
  privacyEpoch: number;
  nowSec?: number;
  ttlSec?: number;
  /** When true: claim then mark target failed without purge (FAULT-01). */
  failBeforePurge?: boolean;
}

/**
 * Authorized physical checkpoint purge:
 * privileged begin → seal digest/epoch → sign → JWS verify → consume → 0091 claim → purge.
 */
export async function runAuthorizedCheckpointPhysicalPurge(
  input: RunAuthorizedCheckpointPhysicalInput,
): Promise<Uc052CheckpointPhysicalResult> {
  const {
    begin, issue, consume, asWorkerPrincipal, admin,
    owner, threadId, idempotencyKeyHash, keys, workerId, privacyEpoch,
    nowSec = Math.floor(Date.now() / 1000), ttlSec = 600, failBeforePurge = false,
  } = input;

  const begun = await begin((c) => beginCheckpointErasure(c, threadId, idempotencyKeyHash));
  const sealed = await sealCheckpointErasureAuthz(admin, begun.requestId, privacyEpoch);
  if (sealed.targetSetDigest.length !== 64) {
    throw Object.assign(new Error('uc052_ckpt_digest_invalid'), { code: 'uc052_ckpt_digest_invalid' });
  }

  const signTargets: PrivacyAuthzTarget[] = sealed.targets.map((t) => ({
    kind: t.sink, resource: t.resourceHmac,
  }));
  const signed = signPrivacyAuthorizationSnapshot({
    privateKeyPem: keys.privateKeyPem, kid: keys.kid, actor: owner, owner, interview: threadId,
    purpose: 'interview_data_erasure', privacyEpoch, targets: signTargets, nowSec, ttlSec,
  });
  if (signed.targetSetDigest !== sealed.targetSetDigest) {
    throw Object.assign(new Error('uc052_ckpt_signed_digest_mismatch'), { code: 'uc052_ckpt_signed_digest_mismatch' });
  }

  await issue(async (c) => {
    await issueAuthorizationSnapshot(c, {
      jti: signed.jti, keyId: keys.kid, actor: owner, interviewId: threadId,
      purpose: 'interview_data_erasure', privacyEpoch, targetSetDigest: signed.targetSetDigest,
      expiresAt: new Date(signed.expiresAtMs),
    });
  });

  // C1/C-AUTHZ: JWS verify BEFORE consume.
  const registry = new PrivacyAuthzKeyRegistry();
  registry.activate(keys.kid, keys.publicJwk);
  const verified = verifyPrivacyAuthorizationSnapshot({
    jws: signed.jws, resolveJwk: registry.resolve.bind(registry), nowSec,
  });
  if (!verified) {
    throw Object.assign(new Error('uc052_ckpt_jws_verify_failed'), { code: 'uc052_ckpt_jws_verify_failed' });
  }

  await consume((c) => consumeAuthorizationSnapshotBound(c, verified, workerId));

  const claimed = await asWorkerPrincipal(owner, (c) =>
    claimAuthorizationTarget(c, signed.jti, begun.checkpointTargetId, workerId, 60));
  if (!claimed?.leaseToken) {
    throw Object.assign(new Error('uc052_ckpt_claim_failed'), { code: 'uc052_ckpt_claim_failed' });
  }

  if (failBeforePurge) {
    await admin.query(
      `UPDATE privacy_deletion_target
          SET status = 'failed', lease_token = NULL, lease_expires_at = NULL, lease_owner = NULL, updated_at = now()
        WHERE id = $1::uuid`,
      [begun.checkpointTargetId],
    );
    const requestStatus = await reassessRequestStatus(admin, begun.requestId);
    return {
      requestId: begun.requestId,
      requestStatus,
      privacyEpoch,
      targetSetDigest: sealed.targetSetDigest,
      checkpointTargetId: begun.checkpointTargetId,
      deletedCount: 0,
      targets: await loadRequestTargets(admin, begun.requestId),
      jti: signed.jti,
      jws: signed.jws,
      fenceEpoch: begun.fenceEpoch,
    };
  }

  const purged = await asWorkerPrincipal(owner, (c) =>
    purgeCheckpointErasureTarget(c, begun.checkpointTargetId, claimed.leaseToken));
  await asWorkerPrincipal(owner, (c) =>
    recordDeletionReceipt(
      c, begun.checkpointTargetId, 'local_erased',
      createHash('sha256').update(`${begun.checkpointTargetId}:local_erased:${purged.deletedCount}`).digest('hex'),
      workerId,
    ));

  // Prefer purge-returned status; reassess mirrors 0096 CASE for honesty.
  const requestStatus = await reassessRequestStatus(admin, begun.requestId);

  return {
    requestId: begun.requestId,
    requestStatus,
    privacyEpoch,
    targetSetDigest: sealed.targetSetDigest,
    checkpointTargetId: begun.checkpointTargetId,
    deletedCount: purged.deletedCount,
    targets: await loadRequestTargets(admin, begun.requestId),
    jti: signed.jti,
    jws: signed.jws,
    fenceEpoch: begun.fenceEpoch,
  };
}

/** Retry a failed checkpoint_rows target: 0091 claim → physical purge. */
export async function retryFailedCheckpointPhysicalTarget(input: {
  admin: DbPool;
  asWorkerPrincipal: <T>(owner: string, fn: (c: Client) => Promise<T>) => Promise<T>;
  owner: string;
  jti: string;
  checkpointTargetId: string;
  workerId: string;
}): Promise<{ deletedCount: number; requestStatus: string }> {
  const { admin, asWorkerPrincipal, owner, jti, checkpointTargetId, workerId } = input;
  const claimed = await asWorkerPrincipal(owner, (c) =>
    claimAuthorizationTarget(c, jti, checkpointTargetId, workerId, 60));
  if (!claimed?.leaseToken) {
    throw Object.assign(new Error('uc052_ckpt_retry_claim_failed'), { code: 'uc052_ckpt_retry_claim_failed' });
  }
  const purged = await asWorkerPrincipal(owner, (c) =>
    purgeCheckpointErasureTarget(c, checkpointTargetId, claimed.leaseToken));
  await asWorkerPrincipal(owner, (c) =>
    recordDeletionReceipt(
      c, checkpointTargetId, 'local_erased',
      createHash('sha256').update(`${checkpointTargetId}:retry:${purged.deletedCount}`).digest('hex'),
      workerId,
    ));
  const req = await admin.query<{ request_id: string }>(
    `SELECT request_id FROM privacy_deletion_target WHERE id = $1::uuid`, [checkpointTargetId],
  );
  return {
    deletedCount: purged.deletedCount,
    requestStatus: await reassessRequestStatus(admin, req.rows[0]!.request_id),
  };
}

export { loadRequestStatus, loadRequestTargets, reassessRequestStatus };
export type { Uc052SignKeys, EcJwk };
