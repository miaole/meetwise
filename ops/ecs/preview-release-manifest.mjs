import { mkdir, open, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { createHash, createPublicKey, createPrivateKey, randomUUID, sign, verify } from 'node:crypto';
import { dirname } from 'node:path';

const DIGEST = /^[a-f0-9]{64}$/;
const RELEASE = /^[a-f0-9]{7,64}$/;
const COMMIT = /^[a-f0-9]{40}$/;
const TAILSCALE_ORIGIN = /^https:\/\/[a-z0-9-]+\.tail[a-z0-9]+\.ts\.net$/;
const REQUIRED_RECEIPTS = ['candidate', 'loopback', 'methodGate', 'edge', 'blackbox'];

export function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

export function unsignedManifest(manifest) {
  const { signature, ...unsigned } = manifest;
  return unsigned;
}

// Pages and the ECS controller use this exact canonical fingerprint when they
// exchange revocation receipts.  It deliberately covers the signature too:
// a revoked record cannot be confused with a differently signed predecessor.
export function manifestFingerprint(manifest) {
  return createHash('sha256').update(canonicalJson(manifest)).digest('hex');
}

function parseTime(value, field) {
  const at = Date.parse(value);
  if (!Number.isFinite(at)) throw new Error(`preview_manifest_${field}_invalid`);
  return at;
}

export function validateUnsignedManifest(manifest, { now = Date.now(), allowExpired = false } = {}) {
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) throw new Error('preview_manifest_invalid');
  if (manifest.schemaVersion !== 1 || !['verified', 'revoked'].includes(manifest.status)) throw new Error('preview_manifest_status_invalid');
  if (!RELEASE.test(manifest.releaseDigest ?? '') || !COMMIT.test(manifest.commit ?? '') || !COMMIT.test(manifest.tree ?? '')) throw new Error('preview_manifest_identity_invalid');
  if (![manifest.webBuildSha256, manifest.staticAssetsSha256].every((value) => DIGEST.test(value ?? ''))) throw new Error('preview_manifest_artifact_digest_invalid');
  if (typeof manifest.origin !== 'string' || !TAILSCALE_ORIGIN.test(manifest.origin)) throw new Error('preview_manifest_origin_invalid');
  if (manifest.mode !== 'public-read-only' || manifest.signingKeyId !== 'ecs-preview-ed25519-v1') throw new Error('preview_manifest_mode_invalid');
  if ((manifest.status === 'verified' && manifest.revoked !== false) || (manifest.status === 'revoked' && manifest.revoked !== true)) throw new Error('preview_manifest_revocation_invalid');
  const issuedAt = parseTime(manifest.issuedAt, 'issued_at');
  const expiresAt = parseTime(manifest.expiresAt, 'expires_at');
  if (issuedAt >= expiresAt || expiresAt - issuedAt > 14 * 24 * 60 * 60 * 1000) throw new Error('preview_manifest_expiry_invalid');
  if (!allowExpired && expiresAt <= now) throw new Error('preview_manifest_expired');
  if (!manifest.receipts || typeof manifest.receipts !== 'object' || REQUIRED_RECEIPTS.some((key) => !DIGEST.test(manifest.receipts[key] ?? ''))) throw new Error('preview_manifest_receipts_invalid');
  return manifest;
}

export function verifyManifest(manifest, publicKeyPem, options) {
  validateUnsignedManifest(unsignedManifest(manifest), options);
  if (typeof manifest.signature !== 'string' || !/^[A-Za-z0-9+/]+={0,2}$/.test(manifest.signature)) throw new Error('preview_manifest_signature_invalid');
  const valid = verify(null, Buffer.from(canonicalJson(unsignedManifest(manifest))), createPublicKey(publicKeyPem), Buffer.from(manifest.signature, 'base64'));
  if (!valid) throw new Error('preview_manifest_signature_mismatch');
  return manifest;
}

export function signManifest(unsigned, privateKeyPem) {
  validateUnsignedManifest(unsigned);
  return {
    ...unsigned,
    signature: sign(null, Buffer.from(canonicalJson(unsigned)), createPrivateKey(privateKeyPem)).toString('base64'),
  };
}

/**
 * Durably replace the controller's public manifest.  The caller must have
 * verified the input before publishing it; this helper solely guarantees that
 * a crash cannot leave a partially written target or a rename not persisted
 * in its parent directory.
 */
export async function publishManifestAtomically(inputPath, outputPath, mode = 0o644) {
  const content = await readFile(inputPath, 'utf8');
  JSON.parse(content);
  await mkdir(dirname(outputPath), { recursive: true, mode: 0o755 });
  const temporary = `${outputPath}.${process.pid}.${randomUUID()}.tmp`;
  const handle = await open(temporary, 'wx', mode);
  try {
    await handle.writeFile(content);
    await handle.sync();
  } finally {
    await handle.close();
  }
  try {
    await rename(temporary, outputPath);
  } catch (error) {
    await rm(temporary, { force: true });
    throw error;
  }
  const directory = await open(dirname(outputPath), 'r');
  try {
    await directory.sync();
  } finally {
    await directory.close();
  }
}

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

function option(args, name) {
  const index = args.indexOf(name);
  return index < 0 ? undefined : args[index + 1];
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [, , command, ...args] = process.argv;
  if (command === 'verify') {
    const manifest = await readJson(option(args, '--manifest'));
    const publicKey = await readFile(option(args, '--public-key'), 'utf8');
    verifyManifest(manifest, publicKey);
    process.stdout.write(`${canonicalJson(unsignedManifest(manifest))}\n`);
  } else if (command === 'sign') {
    const input = await readJson(option(args, '--input'));
    const privateKey = await readFile(option(args, '--private-key'), 'utf8');
    const output = option(args, '--out');
    if (!output) throw new Error('preview_manifest_output_required');
    await writeFile(output, `${JSON.stringify(signManifest(input, privateKey), null, 2)}\n`, { mode: 0o600 });
  } else if (command === 'publish') {
    const input = option(args, '--input');
    const output = option(args, '--output');
    if (!input || !output) throw new Error('preview_manifest_publish_arguments_required');
    const requestedMode = option(args, '--mode') ?? '644';
    if (!/^(600|644)$/.test(requestedMode)) throw new Error('preview_manifest_publish_mode_invalid');
    await publishManifestAtomically(input, output, Number.parseInt(requestedMode, 8));
  } else {
    throw new Error('usage: preview-release-manifest.mjs verify|sign|publish');
  }
}
