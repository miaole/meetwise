import type { FastifyInstance } from 'fastify';

const READ_ONLY_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

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
 * Install this as the first HTTP hook. The allowlist deliberately covers
 * methods rather than trying to maintain a list of every mutating method.
 */
export function installPublicPreviewIngressGate(fastify: FastifyInstance, enabled: boolean): void {
  if (!enabled) return;
  fastify.addHook('onRequest', async (request, reply) => {
    if (READ_ONLY_METHODS.has(request.method)) return;
    await reply.code(503).send({ error: 'public_preview_read_only' });
  });
}
