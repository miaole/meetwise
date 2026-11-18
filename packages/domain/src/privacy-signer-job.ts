/**
 * Cloud-before software deletion signer job.
 *
 * Reuses sign / verify. The private key stays in the signer process.
 * Issue and consume are injected so this module never opens a worker role
 * and never marks a request completed. External sinks stay pending.
 */
import {
  canonicalTargetSetDigest,
  PrivacyAuthzKeyRegistry,
  signPrivacyAuthorizationSnapshot,
  verifyPrivacyAuthorizationSnapshot,
  type EcJwk,
  type PrivacyAuthzPurpose,
  type PrivacyAuthzTarget,
  type VerifiedPrivacyAuthorization,
} from './privacy-authorization.ts';

const EXTERNAL_SINKS = new Set(['oss', 'redis', 'langfuse']);
const SCOPE_PURPOSE: Record<string, PrivacyAuthzPurpose> = {
  interview_data: 'interview_data_erasure',
  resume_data: 'resume_data_erasure',
  account_data: 'account_data_erasure',
};

export interface SignerKeyMaterial {
  kid: string;
  privateKeyPem: string;
  publicJwk: EcJwk;
}

export interface LiveDeletionTarget {
  sink: string;
  resourceHmac: string;
}

export interface LiveDeletionRequest {
  requestId: string;
  owner: string;
  subjectId: string;
  scope: string;
  privacyEpoch: number;
  targetSetDigest: string;
  targets: LiveDeletionTarget[];
}

export interface SignerJobPorts {
  load: (requestId: string) => Promise<LiveDeletionRequest | null>;
  issue: (input: {
    jti: string;
    keyId: string;
    actor: string;
    interviewId: string;
    purpose: PrivacyAuthzPurpose;
    privacyEpoch: number;
    targetSetDigest: string;
    expiresAt: Date;
  }) => Promise<void>;
  consume: (verified: VerifiedPrivacyAuthorization, worker: string) => Promise<void>;
}

export interface SignerJobResult {
  ok: boolean;
  completed: false;
  retryable: boolean;
  externalPending: boolean;
  error?: string;
  jti?: string;
}

function refused(error: string, retryable: boolean): SignerJobResult {
  return { ok: false, completed: false, retryable, externalPending: true, error };
}

export async function authorizeLiveDeletion(
  material: SignerKeyMaterial | null,
  requestId: string,
  ports: SignerJobPorts,
  nowSec: number,
  ttlSec = 3600,
  workerLabel = 'privacy-signer',
): Promise<SignerJobResult> {
  if (!material?.privateKeyPem || !material.kid || !material.publicJwk) {
    return refused('signer_key_unavailable', true);
  }
  const live = await ports.load(requestId);
  if (!live) return refused('signer_request_missing', true);
  const purpose = SCOPE_PURPOSE[live.scope];
  if (!purpose) return refused('signer_scope_invalid', false);
  if (!live.targets.some((t) => EXTERNAL_SINKS.has(t.sink))) {
    return refused('external_targets_missing', true);
  }
  const signTargets: PrivacyAuthzTarget[] = live.targets.map((t) => ({ kind: t.sink, resource: t.resourceHmac }));
  let digest = '';
  try {
    digest = canonicalTargetSetDigest(signTargets);
  } catch {
    return refused('signer_targets_invalid', false);
  }
  if (digest !== live.targetSetDigest) return refused('target_set_drift', true);

  let signed;
  try {
    signed = signPrivacyAuthorizationSnapshot({
      privateKeyPem: material.privateKeyPem,
      kid: material.kid,
      actor: live.owner,
      owner: live.owner,
      interview: live.subjectId,
      purpose,
      privacyEpoch: live.privacyEpoch,
      targets: signTargets,
      nowSec,
      ttlSec,
    });
  } catch (error: unknown) {
    const code = typeof error === 'object' && error && 'code' in error && typeof error.code === 'string'
      ? error.code : 'signer_sign_failed';
    return refused(code, false);
  }
  if (signed.targetSetDigest !== live.targetSetDigest) return refused('target_set_drift', true);

  const registry = new PrivacyAuthzKeyRegistry();
  registry.activate(material.kid, material.publicJwk);
  const verified = verifyPrivacyAuthorizationSnapshot({
    jws: signed.jws,
    resolveJwk: registry.resolve.bind(registry),
    nowSec,
  });
  if (!verified || verified.owner !== live.owner || verified.targetSetDigest !== live.targetSetDigest) {
    return refused('signer_verify_failed', false);
  }

  await ports.issue({
    jti: signed.jti,
    keyId: material.kid,
    actor: live.owner,
    interviewId: live.subjectId,
    purpose,
    privacyEpoch: live.privacyEpoch,
    targetSetDigest: signed.targetSetDigest,
    expiresAt: new Date(signed.expiresAtMs),
  });
  await ports.consume(verified, workerLabel);
  return { ok: true, completed: false, retryable: false, externalPending: true, jti: signed.jti };
}
