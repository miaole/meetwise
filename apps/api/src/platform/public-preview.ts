import type { FastifyInstance } from 'fastify';

const READ_ONLY_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export const PUBLIC_PREVIEW_READ_ONLY = 'public_preview_read_only';

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
 * Public preview is an explicit, fail-closed deployment mode. It is not an
 * authorization system and it must never be inferred from NODE_ENV or a URL.
 */
export function resolvePublicPreviewMode(raw: unknown = process.env.MEETWISE_PUBLIC_PREVIEW): boolean {
  if (raw === undefined || raw === '0') return false;
  if (raw === '1') return true;
  throw new Error('invalid_meetwise_public_preview');
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
 * Install this as the first HTTP hook. The allowlist deliberately covers
 * methods rather than trying to maintain a list of every mutating method.
 */
export function installPublicPreviewIngressGate(fastify: FastifyInstance, enabled: boolean): void {
  if (!enabled) return;
  fastify.addHook('onRequest', async (request, reply) => {
    if (READ_ONLY_METHODS.has(request.method)) return;
    await reply.code(503).send({ error: PUBLIC_PREVIEW_READ_ONLY });
  });
}
