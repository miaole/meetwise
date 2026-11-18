/**
 * Independent deletion signer process. The PEM is read from the environment
 * of this process only. API and worker must not import this file.
 *
 * Local database login must be able to SET ROLE privacy_issuer without a
 * membership GRANT (superuser, same as the issuer proofs). Granting the
 * NOLOGIN role to a login fails the existing issuer identity gate.
 * This process does not set the worker role and does not purge.
 *
 * Run: PRIVACY_AUTHZ_PRIVATE_KEY_PEM=... PRIVACY_AUTHZ_KID=... PRIVACY_AUTHZ_PUBLIC_JWK=... PRIVACY_SIGNER_SOCKET=/path pnpm exec tsx scripts/privacy-signer-serve.ts
 */
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { chmodSync, unlinkSync } from 'node:fs';
import { authorizeLiveDeletion, type SignerKeyMaterial } from '@meetwise/domain';
import { asPrivacyIssuer, consumeAuthorizationSnapshotBound, createPool, issueAuthorizationSnapshot, type Client } from '@meetwise/db';

function materialFromEnv(env: NodeJS.ProcessEnv): SignerKeyMaterial | null {
  const pem = env.PRIVACY_AUTHZ_PRIVATE_KEY_PEM;
  const kid = env.PRIVACY_AUTHZ_KID;
  const jwkRaw = env.PRIVACY_AUTHZ_PUBLIC_JWK;
  if (!pem || !kid || !jwkRaw) return null;
  let publicJwk: { kty?: string; crv?: string; x?: string; y?: string };
  try { publicJwk = JSON.parse(jwkRaw) as { kty?: string; crv?: string; x?: string; y?: string }; } catch { return null; }
  if (publicJwk.kty !== 'EC' || publicJwk.crv !== 'P-256' || !publicJwk.x || !publicJwk.y) return null;
  return { kid, privateKeyPem: pem, publicJwk: { kty: 'EC', crv: 'P-256', x: publicJwk.x, y: publicJwk.y } };
}

async function readBody(req: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  return Buffer.concat(chunks).toString('utf8');
}

function send(res: ServerResponse, status: number, body: unknown) {
  const raw = JSON.stringify(body);
  res.writeHead(status, { 'content-type': 'application/json' });
  res.end(raw);
}

export function createSignerServer(material: SignerKeyMaterial | null) {
  const pool = material ? createPool({ purpose: 'privacy-signer' }) : null;
  return createServer(async (req, res) => {
    if (req.method !== 'POST' || req.url !== '/v1/authorize') {
      send(res, 404, { error: 'not_found', completed: false, retryable: false });
      return;
    }
    if (!material || !pool) {
      send(res, 503, { error: 'signer_key_unavailable', completed: false, retryable: true });
      return;
    }
    let payload: { requestIds?: unknown; privateKeyPem?: unknown; owner?: unknown };
    try { payload = JSON.parse(await readBody(req)) as { requestIds?: unknown; privateKeyPem?: unknown }; } catch {
      send(res, 400, { error: 'invalid_body', completed: false, retryable: false });
      return;
    }
    if ('privateKeyPem' in payload) {
      send(res, 400, { error: 'key_not_accepted', completed: false, retryable: false });
      return;
    }
    const owner = typeof payload.owner === 'string' ? payload.owner : '';
    if (owner.length === 0 || owner.length > 200 || /[\u0000-\u001f]/.test(owner)) {
      send(res, 400, { error: 'owner_required', completed: false, retryable: false });
      return;
    }
    const ids = Array.isArray(payload.requestIds) ? payload.requestIds.filter((id): id is string => typeof id === 'string') : [];
    const results = [];
    console.error(`privacy_signer_request n=${ids.length}`);
    try {
    for (const requestId of ids) {
      const result = await authorizeLiveDeletion(material, requestId, {
        async load(id) {
          return asPrivacyIssuer(pool, owner, async (c: Client) => {
            const rows = await c.query<{
              owner_user_id: string; subject_id: string; scope: string; privacy_epoch: string | number;
              target_set_digest: string; sink: string; resource_hmac: string;
            }>('SELECT * FROM privacy_signer_live_target_set($1::uuid)', [id]);
            const first = rows.rows[0];
            if (!first || first.owner_user_id !== owner) return null;
            const epoch = Number(first.privacy_epoch);
            return {
              requestId: id,
              owner: first.owner_user_id,
              subjectId: first.subject_id,
              scope: first.scope,
              privacyEpoch: epoch,
              targetSetDigest: first.target_set_digest,
              targets: rows.rows.map((row) => ({ sink: row.sink, resourceHmac: row.resource_hmac })),
            };
          });
        },
        async issue(input) {
          await asPrivacyIssuer(pool, input.actor, (c: Client) => issueAuthorizationSnapshot(c, input));
        },
        async consume(verified, worker) {
          await asPrivacyIssuer(pool, verified.owner, (c: Client) => consumeAuthorizationSnapshotBound(c, verified, worker));
        },
      }, Math.floor(Date.now() / 1000));
      results.push({ requestId, ok: result.ok, completed: false, retryable: result.retryable, error: result.error });
      console.error(`privacy_signer_result ok=${result.ok} error=${result.error ?? 'none'}`);
    }
    send(res, 200, { completed: false, results });
    } catch (error: unknown) {
      const code = typeof error === 'object' && error && 'code' in error && typeof error.code === 'string'
        ? error.code : 'signer_fault';
      console.error(`privacy_signer_fault code=${code}`);
      send(res, 503, { error: code, completed: false, retryable: true, results: [] });
    }
  });
}

const invoked = process.argv[1]?.includes('privacy-signer-serve') === true;
if (invoked) {
  const socketPath = process.env.PRIVACY_SIGNER_SOCKET;
  const material = materialFromEnv(process.env);
  if (!socketPath || !material) {
    console.error('signer_key_unavailable');
    process.exit(1);
  }
  try { unlinkSync(socketPath); } catch { /* absent */ }
  const server = createSignerServer(material);
  server.listen(socketPath, () => {
    chmodSync(socketPath, 0o600);
    console.error('privacy_signer_listening');
  });
}
