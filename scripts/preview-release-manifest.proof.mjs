import assert from 'node:assert/strict';
import { generateKeyPairSync } from 'node:crypto';
import { manifestFingerprint, signManifest, verifyManifest } from '../ops/ecs/preview-release-manifest.mjs';

const { privateKey, publicKey } = generateKeyPairSync('ed25519');
const now = Date.now();
const valid = {
  schemaVersion: 1,
  status: 'verified',
  releaseDigest: 'c3de7fe',
  commit: 'c3de7fe3e67c917c3d73e0065165aaa8ddab7fe8',
  tree: '1'.repeat(40),
  webBuildSha256: 'a'.repeat(64),
  staticAssetsSha256: 'b'.repeat(64),
  origin: 'https://preview.tail39416d.ts.net',
  mode: 'public-read-only',
  issuedAt: new Date(now - 60_000).toISOString(),
  expiresAt: new Date(now + 60_000).toISOString(),
  revoked: false,
  receipts: { candidate: 'c'.repeat(64), loopback: 'd'.repeat(64), methodGate: 'e'.repeat(64), edge: 'f'.repeat(64), blackbox: '0'.repeat(64) },
  signingKeyId: 'ecs-preview-ed25519-v1',
};
const signed = signManifest(valid, privateKey.export({ type: 'pkcs8', format: 'pem' }));
const publicPem = publicKey.export({ type: 'spki', format: 'pem' });

assert.equal(verifyManifest(signed, publicPem, { now }).origin, valid.origin);
assert.equal(manifestFingerprint(JSON.parse(JSON.stringify(signed))), manifestFingerprint(signed));
assert.throws(() => verifyManifest({ ...signed, origin: 'https://other.tail39416d.ts.net' }, publicPem, { now }), /signature_mismatch/);
assert.throws(() => verifyManifest({ ...signed, expiresAt: new Date(now - 1).toISOString() }, publicPem, { now }), /expired/);
assert.equal(verifyManifest(signManifest({ ...valid, status: 'revoked', revoked: true }, privateKey.export({ type: 'pkcs8', format: 'pem' })), publicPem, { now }).status, 'revoked');
assert.throws(() => signManifest({ ...valid, origin: 'http://preview.tail39416d.ts.net' }, privateKey.export({ type: 'pkcs8', format: 'pem' })), /origin_invalid/);
assert.throws(() => signManifest({ ...valid, receipts: { ...valid.receipts, edge: 'not-a-digest' } }, privateKey.export({ type: 'pkcs8', format: 'pem' })), /receipts_invalid/);
console.log('✓ preview release manifest 7/7 assertions passed; releaseEvidence=false');
