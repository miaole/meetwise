import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { canonicalJson, verifyManifest } from '../ops/ecs/preview-release-manifest.mjs';

async function boundedText(url, options = {}) {
  const response = await fetch(url, { ...options, redirect: 'error', signal: AbortSignal.timeout(20_000) });
  const declared = Number(response.headers.get('content-length'));
  if (Number.isFinite(declared) && declared > 2_000_000) throw new Error('preview_origin_body_too_large');
  if (!response.body) return { response, text: '' };
  const reader = response.body.getReader();
  const chunks = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 2_000_000) { await reader.cancel(); throw new Error('preview_origin_body_too_large'); }
    chunks.push(value);
  }
  return { response, text: Buffer.concat(chunks).toString('utf8') };
}

const root = process.cwd();
const manifestArgument = process.argv[2] ?? 'preview-site/release-manifest.json';
const manifest = JSON.parse(await readFile(resolve(root, manifestArgument), 'utf8'));
const publicKey = await readFile(resolve(root, 'ops/ecs/keys/preview-release-ed25519.pub.pem'), 'utf8');

try {
  verifyManifest(manifest, publicKey);
  if (manifest.status !== 'verified' || manifest.revoked !== false) throw new Error('preview_origin_not_verified');
  if (manifest.mode === 'public-full-stack-probe') throw new Error('preview_origin_probe_not_confirmed');
  const { response: page, text: html } = await boundedText(`${manifest.origin}/`);
  if (!page.ok || html.length > 2_000_000) throw new Error('preview_origin_root_invalid');
  const { createHash } = await import('node:crypto');
  if (createHash('sha256').update(html).digest('hex') !== manifest.receipts.edge) throw new Error('preview_origin_edge_digest_invalid');
  if (manifest.mode === 'public-read-only') {
    if (!html.includes(`<meta name="meetwise-preview-release" content="${manifest.releaseDigest}"`)) throw new Error('preview_origin_release_marker_invalid');
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
  } else if (manifest.mode === 'public-full-stack') {
    if (!html.includes('Meetwise 知面') || !html.includes('href="/login"')) throw new Error('preview_origin_root_surface_invalid');
    const { response: login, text: loginHtml } = await boundedText(`${manifest.origin}/login`);
    if (
      !login.ok
      || loginHtml.length > 2_000_000
      || !loginHtml.includes('name="email"')
      || !loginHtml.includes('name="password"')
      || !loginHtml.includes('登录 / 注册')
    ) throw new Error('preview_origin_login_surface_invalid');
    const rootSurface = { status: page.status, bytes: Buffer.byteLength(html), sha256: createHash('sha256').update(html).digest('hex') };
    const loginSurface = { status: login.status, bytes: Buffer.byteLength(loginHtml), sha256: createHash('sha256').update(loginHtml).digest('hex') };
    if (createHash('sha256').update(canonicalJson({ root: rootSurface, login: loginSurface })).digest('hex') !== manifest.receipts.blackbox) throw new Error('preview_origin_blackbox_digest_invalid');
  } else {
    throw new Error('preview_origin_mode_invalid');
  }
  console.log(`✓ signed preview origin online: ${manifest.releaseDigest}`);
} catch (error) {
  console.error(`preview origin disabled: ${error instanceof Error ? error.message : 'unknown_error'}`);
  process.exitCode = 1;
}
