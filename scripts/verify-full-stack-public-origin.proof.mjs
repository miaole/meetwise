import assert from 'node:assert/strict';
import { createPublicKey, generateKeyPairSync, verify } from 'node:crypto';
import { canonicalJson, signManifest } from '../ops/ecs/preview-release-manifest.mjs';
import { surfaceReceipt } from '../ops/ecs/full-stack/full-stack-preview-publisher.mjs';
import { verifyFullStackPublicOrigin } from './verify-full-stack-public-origin.mjs';

const origin = 'https://preview.tail0000000.ts.net';
const nonce = 'a'.repeat(64);
const now = Date.now();
const root = '<title>Meetwise 知面</title><a href="/login">登录</a>';
const login = '<h1>登录 / 注册</h1><input name="email"><input name="password">';
// 回执签名密钥对（私钥只存在于 ECS 之外的验证器，公钥在 ECS 验签）。
const receiptKeys = generateKeyPairSync('ed25519');
const receiptPrivatePem = receiptKeys.privateKey.export({ type: 'pkcs8', format: 'pem' });
const receiptPublicPem = receiptKeys.publicKey.export({ type: 'spki', format: 'pem' });
// manifest 签名密钥对（与回执签名密钥对独立，互不混淆）。
const { privateKey, publicKey } = generateKeyPairSync('ed25519');
const privatePem = privateKey.export({ type: 'pkcs8', format: 'pem' });
const publicPem = publicKey.export({ type: 'spki', format: 'pem' });
const surface = surfaceReceipt(root, login);
const manifest = signManifest({
  schemaVersion: 1, status: 'verified', releaseDigest: 'abcdef0', commit: 'a'.repeat(40), tree: 'b'.repeat(40),
  webBuildSha256: '1'.repeat(64), staticAssetsSha256: '2'.repeat(64), origin, mode: 'public-full-stack-probe',
  issuedAt: new Date(now - 1_000).toISOString(), expiresAt: new Date(now + 60_000).toISOString(), revoked: false,
  receipts: { runtime: '3'.repeat(64), synthetic: '4'.repeat(64), database: '5'.repeat(64), edge: surface.root.sha256, blackbox: surface.digest },
  signingKeyId: 'ecs-preview-ed25519-v1',
}, privatePem);

function response(url, body, status = 200) {
  const value = new Response(body, { status, headers: { 'content-type': url.endsWith('.json') ? 'application/json' : 'text/html' } });
  Object.defineProperty(value, 'url', { value: url });
  return value;
}
const goodFetch = async (url, options) => {
  assert.equal(options.redirect, 'error');
  if (url === `${origin}/`) return response(url, root);
  if (url === `${origin}/login`) return response(url, login);
  if (url === `${origin}/preview-release-manifest.json`) return response(url, JSON.stringify(manifest));
  throw new Error('unexpected_url');
};

// 回执验签（与 publisher.confirmPublic 逐字节一致：去掉 signature 后对 canonicalJson 验 Ed25519）。
function receiptSignatureValid(receipt, publicPem) {
  const { signature, ...unsigned } = receipt;
  if (receipt.signingKeyId !== 'probe-receipt-ed25519-v1' || typeof signature !== 'string' || !/^[A-Za-z0-9+/]+={0,2}$/.test(signature)) return false;
  return verify(null, Buffer.from(canonicalJson(unsigned)), createPublicKey(publicPem), Buffer.from(signature, 'base64'));
}

const receipt = await verifyFullStackPublicOrigin({ origin, probeNonce: nonce, publicKeyPem: publicPem, signingKeyPem: receiptPrivatePem, fetchImpl: goodFetch, now });
assert.equal(receipt.probeNonce, nonce);
assert.equal(receipt.rootSha256, surface.root.sha256);
assert.equal(receipt.blackboxSha256, surface.digest);
assert.equal(receipt.signingKeyId, 'probe-receipt-ed25519-v1');
assert.ok(receiptSignatureValid(receipt, receiptPublicPem), 'receipt signature must verify against the probe-receipt public key');
// 篡改回执（换 nonce）必须使签名失效。
assert.equal(receiptSignatureValid({ ...receipt, probeNonce: 'b'.repeat(64) }, receiptPublicPem), false, 'tampered receipt must fail signature');
// 用错误的公钥验签必须失败（manifest 公钥 ≠ 回执公钥）。
assert.equal(receiptSignatureValid(receipt, publicPem), false, 'manifest public key must not verify the receipt');

// 输入校验与表面不匹配仍必须拒绝（签名不影响这些 fail-closed 断言）。
await assert.rejects(() => verifyFullStackPublicOrigin({ origin: 'http://127.0.0.1', probeNonce: nonce, publicKeyPem: publicPem, signingKeyPem: receiptPrivatePem, fetchImpl: goodFetch, now }));
await assert.rejects(() => verifyFullStackPublicOrigin({ origin, probeNonce: 'bad', publicKeyPem: publicPem, signingKeyPem: receiptPrivatePem, fetchImpl: goodFetch, now }));
await assert.rejects(() => verifyFullStackPublicOrigin({ origin, probeNonce: nonce, publicKeyPem: publicPem, signingKeyPem: receiptPrivatePem, fetchImpl: async (url, options) => url.endsWith('/login') ? response(url, '<h1>wrong</h1>') : goodFetch(url, options), now }));
await assert.rejects(() => verifyFullStackPublicOrigin({ origin, probeNonce: nonce, publicKeyPem: publicPem, signingKeyPem: receiptPrivatePem, fetchImpl: async (url, options) => url.endsWith('.json') ? response(url, JSON.stringify({ ...manifest, origin: 'https://evil.tail0000000.ts.net' })) : goodFetch(url, options), now }));
// 缺少签名私钥必须拒绝（回执未签名则 confirm-public 无法验签）。
await assert.rejects(() => verifyFullStackPublicOrigin({ origin, probeNonce: nonce, publicKeyPem: publicPem, fetchImpl: goodFetch, now }));

console.log('full-stack public origin verifier proof passed');
