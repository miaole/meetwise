/**
 * Tell the local signer process that a fenced request is ready.
 * The API never sees the signing key. No URL is fetched: the socket path
 * is a local filesystem endpoint, so this is not an outbound host request.
 * Unset socket, connect failure, and a non-ok signer all stay retryable
 * and never report the erasure completed.
 */
import { request as httpRequest } from 'node:http';

export interface SignerNotifyResult {
  accepted: boolean;
  retryable: boolean;
  completed: false;
  reason?: string;
}

const SOCKET_PATH = /^\/(?!.*\.\.)[A-Za-z0-9._/-]{1,200}$/;

export function signerSocketPath(env: NodeJS.ProcessEnv = process.env): string | null {
  const raw = env.PRIVACY_SIGNER_SOCKET;
  if (!raw || !SOCKET_PATH.test(raw)) return null;
  return raw;
}

export async function notifyDeletionSigner(requestIds: string[], env: NodeJS.ProcessEnv = process.env, owner = ''): Promise<SignerNotifyResult> {
  const socketPath = signerSocketPath(env);
  const ids = requestIds.filter((id) => /^[0-9a-f-]{36}$/i.test(id));
  if (!owner) return { accepted: false, retryable: true, completed: false, reason: 'owner_required' };
  if (!socketPath || ids.length === 0) return { accepted: false, retryable: true, completed: false };
  const body = JSON.stringify({ requestIds: ids, owner });
  try {
    const replied = await new Promise<{ status: number; raw: string }>((resolve, reject) => {
      const req = httpRequest({
        socketPath,
        path: '/v1/authorize',
        method: 'POST',
        headers: { 'content-type': 'application/json', 'content-length': Buffer.byteLength(body) },
      }, (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
        res.on('end', () => resolve({ status: res.statusCode ?? 0, raw: Buffer.concat(chunks).toString('utf8') }));
      });
      req.setTimeout(8000, () => req.destroy(new Error('signer_timeout')));
      req.on('error', reject);
      req.end(body);
    });
    if (replied.status < 200 || replied.status >= 300) {
      return { accepted: false, retryable: true, completed: false, reason: `http_${replied.status}` };
    }
    let parsed: { error?: unknown; results?: { ok?: unknown; retryable?: unknown; error?: unknown }[] };
    try { parsed = JSON.parse(replied.raw) as { error?: unknown; results?: { ok?: unknown; retryable?: unknown; error?: unknown }[] }; } catch {
      return { accepted: false, retryable: true, completed: false, reason: 'invalid_signer_body' };
    }
    const results = Array.isArray(parsed.results) ? parsed.results : [];
    const reason = results.map((row) => typeof row.error === 'string' ? row.error : '').find((item) => item.length > 0)
      ?? (typeof parsed.error === 'string' ? parsed.error : undefined);
    if (results.length === 0 || results.some((row) => row.ok !== true)) {
      return {
        accepted: false,
        retryable: results.length === 0 || results.some((row) => row.retryable === true),
        completed: false,
        reason,
      };
    }
    return { accepted: true, retryable: false, completed: false };
  } catch {
    return { accepted: false, retryable: true, completed: false };
  }
}
