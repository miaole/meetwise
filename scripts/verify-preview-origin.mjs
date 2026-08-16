import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { verifyManifest } from '../ops/ecs/preview-release-manifest.mjs';

const root = process.cwd();
const manifestArgument = process.argv[2] ?? 'preview-site/release-manifest.json';
const manifest = JSON.parse(await readFile(resolve(root, manifestArgument), 'utf8'));
const publicKey = await readFile(resolve(root, 'ops/ecs/keys/preview-release-ed25519.pub.pem'), 'utf8');

try {
  verifyManifest(manifest, publicKey);
  if (manifest.status !== 'verified' || manifest.revoked !== false) throw new Error('preview_origin_not_verified');
  const page = await fetch(`${manifest.origin}/`, { redirect: 'error', signal: AbortSignal.timeout(20_000) });
  const html = await page.text();
  if (!page.ok || !html.includes(`<meta name="meetwise-preview-release" content="${manifest.releaseDigest}"`)) throw new Error('preview_origin_release_marker_invalid');
  const { createHash } = await import('node:crypto');
  if (createHash('sha256').update(html).digest('hex') !== manifest.receipts.edge) throw new Error('preview_origin_edge_digest_invalid');
  const write = await fetch(`${manifest.origin}/`, { method: 'POST', redirect: 'error', signal: AbortSignal.timeout(20_000) });
  if (write.status !== 503 || (await write.text()) !== '{"error":"public_preview_read_only"}') throw new Error('preview_origin_method_gate_invalid');
  const api = await fetch(`${manifest.origin}/api/privacy/export`, { redirect: 'error', signal: AbortSignal.timeout(20_000) });
  if (api.status !== 404) throw new Error('preview_origin_api_path_invalid');
  for (const path of ['/features', '/faq', '/legal']) {
    const allowed = await fetch(`${manifest.origin}${path}`, { redirect: 'error', signal: AbortSignal.timeout(20_000), headers: { cookie: 'mw_token=must_not_forward', authorization: 'Bearer must_not_forward' } });
    if (!allowed.ok || !(await allowed.text()).includes(`<meta name="meetwise-preview-release" content="${manifest.releaseDigest}"`)) throw new Error('preview_origin_allowed_path_invalid');
  }
  for (const path of ['/login', '/dashboard', '/interviews', '/api/privacy/export?x=1']) {
    const blocked = await fetch(`${manifest.origin}${path}`, { redirect: 'error', signal: AbortSignal.timeout(20_000), headers: { cookie: 'mw_token=must_not_forward', authorization: 'Bearer must_not_forward' } });
    if (blocked.status !== 404) throw new Error('preview_origin_blocked_path_invalid');
  }
  console.log(`✓ signed preview origin online: ${manifest.releaseDigest}`);
} catch (error) {
  console.error(`preview origin disabled: ${error instanceof Error ? error.message : 'unknown_error'}`);
  process.exitCode = 1;
}
