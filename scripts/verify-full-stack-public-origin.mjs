#!/usr/bin/env node
import { createHash, createPrivateKey, sign } from 'node:crypto';
import { open, readFile } from 'node:fs/promises';
import { canonicalJson, manifestFingerprint, verifyManifest } from '../ops/ecs/preview-release-manifest.mjs';

const NONCE = /^[a-f0-9]{64}$/;
const RECEIPT_SIGNING_KEY_ID = 'probe-receipt-ed25519-v1';
const MAX_BYTES = 2_000_000;
const ALLOWED_ORIGIN = /^https:\/\/[a-z0-9-]+\.tail[0-9a-f]+\.ts\.net$/;
const sha256 = (value) => createHash('sha256').update(value).digest('hex');

function option(args, name) {
  const index = args.indexOf(name);
  return index < 0 ? undefined : args[index + 1];
}

async function boundedText(fetchImpl, url, signal) {
  const response = await fetchImpl(url, { method: 'GET', redirect: 'error', cache: 'no-store', signal, headers: { accept: 'text/html,application/json' } });
  if (response.status !== 200 || response.url !== url) throw new Error(`full_stack_public_surface_invalid:${url}`);
  const advertised = Number(response.headers.get('content-length'));
  if (Number.isFinite(advertised) && advertised > MAX_BYTES) throw new Error('full_stack_public_surface_too_large');
  if (!response.body) return '';
  const reader = response.body.getReader();
  const chunks = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BYTES) { await reader.cancel(); throw new Error('full_stack_public_surface_too_large'); }
    chunks.push(value);
  }
  return Buffer.concat(chunks).toString('utf8');
}

export async function verifyFullStackPublicOrigin({ origin, probeNonce, publicKeyPem, signingKeyPem, fetchImpl = fetch, now = Date.now() }) {
  if (!ALLOWED_ORIGIN.test(origin ?? '') || new URL(origin).origin !== origin || !NONCE.test(probeNonce ?? '')) throw new Error('full_stack_public_probe_input_invalid');
  if (typeof signingKeyPem !== 'string' || !signingKeyPem.includes('PRIVATE KEY')) throw new Error('full_stack_probe_signing_key_invalid');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);
  try {
    const rootUrl = `${origin}/`;
    const loginUrl = `${origin}/login`;
    const manifestUrl = `${origin}/preview-release-manifest.json`;
    const [rootHtml, loginHtml, manifestText] = await Promise.all([
      boundedText(fetchImpl, rootUrl, controller.signal),
      boundedText(fetchImpl, loginUrl, controller.signal),
      boundedText(fetchImpl, manifestUrl, controller.signal),
    ]);
    const manifest = JSON.parse(manifestText);
    verifyManifest(manifest, publicKeyPem, { now });
    if (manifest.status !== 'verified' || manifest.revoked !== false || manifest.mode !== 'public-full-stack-probe' || manifest.origin !== origin) throw new Error('full_stack_public_manifest_invalid');
    if (!rootHtml.includes('Meetwise 知面') || !rootHtml.includes('href="/login"') || !loginHtml.includes('name="email"') || !loginHtml.includes('name="password"') || !loginHtml.includes('登录 / 注册')) throw new Error('full_stack_public_surface_invalid');
    const root = { status: 200, bytes: Buffer.byteLength(rootHtml), sha256: sha256(rootHtml) };
    const login = { status: 200, bytes: Buffer.byteLength(loginHtml), sha256: sha256(loginHtml) };
    const blackboxSha256 = sha256(canonicalJson({ root, login }));
    if (manifest.receipts?.edge !== root.sha256 || manifest.receipts?.blackbox !== blackboxSha256) throw new Error('full_stack_public_surface_receipt_mismatch');
    // ADR-0021: 公网激活不是 ECS 自证。回执必须由「ECS 之外的验证器」持有私钥签名，
    // 否则 ECS（或 meetwise-cd）可自证公开可用。私钥只存在于 GitHub Actions，绝不上 ECS。
    const unsigned = {
      schemaVersion: 1,
      origin,
      probeNonce,
      checkedAt: new Date(now).toISOString(),
      manifestSha256: manifestFingerprint(manifest),
      rootStatus: 200,
      loginStatus: 200,
      manifestStatus: 200,
      rootUrl,
      loginUrl,
      manifestUrl,
      rootSha256: root.sha256,
      blackboxSha256,
      signingKeyId: RECEIPT_SIGNING_KEY_ID,
    };
    return {
      ...unsigned,
      signature: sign(null, Buffer.from(canonicalJson(unsigned)), createPrivateKey(signingKeyPem)).toString('base64'),
    };
  } finally {
    clearTimeout(timeout);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const origin = option(process.argv.slice(2), '--origin');
  const probeNonce = option(process.argv.slice(2), '--probe-nonce');
  const publicKeyPath = option(process.argv.slice(2), '--public-key');
  const signingKeyPath = option(process.argv.slice(2), '--signing-key');
  const output = option(process.argv.slice(2), '--out');
  if (!origin || !probeNonce || !publicKeyPath || !signingKeyPath || !output) throw new Error('usage: verify-full-stack-public-origin.mjs --origin <origin> --probe-nonce <64hex> --public-key <path> --signing-key <path> --out <path>');
  const receipt = await verifyFullStackPublicOrigin({ origin, probeNonce, publicKeyPem: await readFile(publicKeyPath, 'utf8'), signingKeyPem: await readFile(signingKeyPath, 'utf8') });
  const handle = await open(output, 'wx', 0o600);
  try { await handle.writeFile(`${JSON.stringify(receipt, null, 2)}\n`); await handle.sync(); } finally { await handle.close(); }
}
