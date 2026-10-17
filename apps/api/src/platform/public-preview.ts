import type { FastifyInstance } from 'fastify';
import { resolvePublicPreview } from '@meetwise/contracts/public-preview';

const READ_ONLY_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/** Preview may allow this one ledger write. Other mutating verbs stay closed. */
const PREVIEW_CONTROLLED_WRITE = /^\/interview\/[^/]+\/answers\/?$/;

export const PUBLIC_PREVIEW_READ_ONLY = 'public_preview_read_only';
export const PUBLIC_PREVIEW_CONTROLLED_WRITE_UNAVAILABLE = 'interview_answer_preview_write_unavailable';

/**
 * Thrown when a public-preview deployment attempts to write interview or
 * scoring state after the HTTP method allowlist. Unknown env values still
 * fail closed via resolvePublicPreviewMode, not this class.
 */
export class PublicPreviewReadOnlyError extends Error {
  readonly code = PUBLIC_PREVIEW_READ_ONLY;
  constructor() {
    super(PUBLIC_PREVIEW_READ_ONLY);
    this.name = 'PublicPreviewReadOnlyError';
  }
}

/**
 * Thrown when the preview ledger submit is called while public preview is off.
 * Non-preview must not expose INT-TRANSCRIPT-01 production write.
 */
export class PublicPreviewWriteUnavailableError extends Error {
  readonly code = PUBLIC_PREVIEW_CONTROLLED_WRITE_UNAVAILABLE;
  constructor() {
    super(PUBLIC_PREVIEW_CONTROLLED_WRITE_UNAVAILABLE);
    this.name = 'PublicPreviewWriteUnavailableError';
  }
}

/**
 * Public preview is an explicit, fail-closed deployment mode. It is not an
 * authorization system and it must never be inferred from NODE_ENV or a URL.
 */
export function resolvePublicPreviewMode(raw: unknown = process.env.MEETWISE_PUBLIC_PREVIEW): boolean {
  // Single source: @meetwise/contracts/public-preview. The unknown → string|undefined
  // direct cast is deliberate — no narrowing in between — so non-string raws
  // (e.g. the 1/null inputs pinned by the write-gate proof) still reach the
  // resolver's throw instead of silently degrading to "unset".
  return resolvePublicPreview(raw as string | undefined);
}

/**
 * Service-layer backstop for interview/scoring writes. Ingress already rejects
 * non-allowlist methods; this stops a future GET/internal caller from mutating
 * interview or scoring state while preview is on.
 */
export function assertPublicPreviewWritesClosed(raw: unknown = process.env.MEETWISE_PUBLIC_PREVIEW): void {
  if (resolvePublicPreviewMode(raw)) throw new PublicPreviewReadOnlyError();
}

/**
 * Preview-only ledger submit. Preview=1 is required; preview off is not a
 * production canonical write route.
 */
export function assertPublicPreviewControlledWriteAllowed(
  raw: unknown = process.env.MEETWISE_PUBLIC_PREVIEW,
): void {
  if (!resolvePublicPreviewMode(raw)) throw new PublicPreviewWriteUnavailableError();
}

export function isPublicPreviewControlledWrite(method: string, url: string): boolean {
  if (method !== 'POST') return false;
  const path = String(url ?? '').split('?')[0] ?? '';
  return PREVIEW_CONTROLLED_WRITE.test(path);
}

/**
 * Install this as the first HTTP hook. Safe methods stay open. One preview
 * ledger POST is allowlisted; every other mutating verb is 503.
 */
export function installPublicPreviewIngressGate(fastify: FastifyInstance, enabled: boolean): void {
  if (!enabled) return;
  fastify.addHook('onRequest', async (request, reply) => {
    if (READ_ONLY_METHODS.has(request.method)) return;
    if (isPublicPreviewControlledWrite(request.method, request.url)) return;
    await reply.code(503).send({ error: PUBLIC_PREVIEW_READ_ONLY });
  });
}
