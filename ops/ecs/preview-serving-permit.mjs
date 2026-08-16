import { mkdir, open, readFile, rename, rm, unlink } from 'node:fs/promises';
import { dirname } from 'node:path';
import { randomUUID } from 'node:crypto';

const DIGEST = /^[a-f0-9]{64}$/;
const RELEASE = /^[a-f0-9]{7,64}$/;
const LEDGER_STATES = new Set(['idle', 'staged', 'active_unpublished', 'edge_probing', 'publishing', 'verified', 'revoked', 'failed']);

function invalid(reason) {
  return { action: 'block', reason };
}

function currentMatches(ledger, current) {
  return current?.state === 'present' && current.releaseDigest === ledger.releaseDigest;
}

/**
 * This decision is intentionally stricter than the ledger state machine.  A
 * durable `current` symlink alone cannot start a process; only the returned
 * action is eligible for a root-owned serving permit.
 */
export function decideServingPermit({ ledger, current, manifest }) {
  if (!ledger || !LEDGER_STATES.has(ledger.state) || !Number.isInteger(ledger.generation) || ledger.generation < 0) {
    return invalid('preview_permit_ledger_invalid');
  }
  if (!current || !['present', 'absent', 'invalid'].includes(current.state)) return invalid('preview_permit_current_invalid');
  if (current.state === 'invalid') return invalid(`preview_permit_current_${current.reason ?? 'invalid'}`);

  if (ledger.state === 'active_unpublished') {
    if (!currentMatches(ledger, current)) return invalid('preview_permit_unpublished_current_mismatch');
    return { action: 'serve_loopback', releaseDigest: ledger.releaseDigest, generation: ledger.generation, fingerprint: ledger.fingerprint ?? null };
  }

  if (ledger.state === 'edge_probing') {
    if (!currentMatches(ledger, current)) return invalid('preview_permit_edge_probe_current_mismatch');
    // A verified public manifest is never compatible with a temporary probe.
    // `null` is the normal first-release case; a revoked predecessor is safe.
    if (manifest !== null && manifest.status !== 'revoked') return invalid('preview_permit_edge_probe_manifest_invalid');
    return { action: 'serve_edge_probe', releaseDigest: ledger.releaseDigest, generation: ledger.generation, fingerprint: ledger.fingerprint ?? null };
  }

  // A signed staging manifest lets the Web process prove its public permit
  // before the manifest is copied to the Nginx/Pages-visible path. Recovery
  // never resumes this state; it closes it if public publication is absent.
  if (ledger.state === 'publishing') {
    if (!currentMatches(ledger, current)) return invalid('preview_permit_publishing_current_mismatch');
    if (!manifest || manifest.status !== 'verified' || manifest.expired === true
      || manifest.releaseDigest !== ledger.releaseDigest || manifest.fingerprint !== ledger.fingerprint
      || !RELEASE.test(manifest.releaseDigest ?? '') || !DIGEST.test(manifest.fingerprint ?? '')) {
      return invalid('preview_permit_publishing_manifest_mismatch');
    }
    return { action: 'serve_public', releaseDigest: ledger.releaseDigest, generation: ledger.generation, fingerprint: ledger.fingerprint };
  }

  if (ledger.state !== 'verified') return invalid(`preview_permit_state_not_runnable:${ledger.state}`);
  if (!currentMatches(ledger, current)) return invalid('preview_permit_verified_current_mismatch');
  if (!manifest || manifest.status !== 'verified' || manifest.expired === true
    || manifest.releaseDigest !== ledger.releaseDigest || manifest.fingerprint !== ledger.fingerprint
    || !RELEASE.test(manifest.releaseDigest ?? '') || !DIGEST.test(manifest.fingerprint ?? '')) {
    return invalid('preview_permit_verified_manifest_mismatch');
  }
  return { action: 'serve_public', releaseDigest: ledger.releaseDigest, generation: ledger.generation, fingerprint: ledger.fingerprint };
}

async function syncDirectory(path) {
  const handle = await open(path, 'r');
  try {
    await handle.sync();
  } finally {
    await handle.close();
  }
}

async function writeAtomic(path, permit) {
  await mkdir(dirname(path), { recursive: true, mode: 0o700 });
  const temporary = `${path}.${process.pid}.${randomUUID()}.tmp`;
  const handle = await open(temporary, 'wx', 0o600);
  try {
    await handle.writeFile(`${JSON.stringify(permit)}\n`);
    await handle.sync();
  } finally {
    await handle.close();
  }
  try {
    await rename(temporary, path);
  } catch (error) {
    await rm(temporary, { force: true });
    throw error;
  }
  await syncDirectory(dirname(path));
}

export async function issueServingPermit(path, decision) {
  if (!['serve_loopback', 'serve_edge_probe', 'serve_public'].includes(decision?.action)) throw new Error('preview_permit_decision_not_runnable');
  const permit = {
    schemaVersion: 1,
    mode: decision.action === 'serve_public' ? 'public' : decision.action === 'serve_edge_probe' ? 'edge-probe' : 'loopback',
    releaseDigest: decision.releaseDigest,
    generation: decision.generation,
    fingerprint: decision.fingerprint,
  };
  await writeAtomic(path, permit);
  return permit;
}

export async function clearServingPermit(path) {
  try {
    await unlink(path);
  } catch (error) {
    if (!error || typeof error !== 'object' || error.code !== 'ENOENT') throw error;
  }
  await mkdir(dirname(path), { recursive: true, mode: 0o700 });
  await syncDirectory(dirname(path));
}

export async function validateServingPermit(path, decision) {
  if (!['serve_loopback', 'serve_edge_probe', 'serve_public'].includes(decision?.action)) throw new Error('preview_permit_decision_not_runnable');
  const permit = JSON.parse(await readFile(path, 'utf8'));
  const expected = {
    schemaVersion: 1,
    mode: decision.action === 'serve_public' ? 'public' : decision.action === 'serve_edge_probe' ? 'edge-probe' : 'loopback',
    releaseDigest: decision.releaseDigest,
    generation: decision.generation,
    fingerprint: decision.fingerprint,
  };
  if (JSON.stringify(permit) !== JSON.stringify(expected)) throw new Error('preview_permit_mismatch');
  return permit;
}

function option(args, name) {
  const index = args.indexOf(name);
  if (index < 0 || index === args.length - 1) throw new Error(`preview_permit_${name.slice(2)}_required`);
  return args[index + 1];
}

function decisionFromArgs(args) {
  return decideServingPermit({
    ledger: JSON.parse(option(args, '--ledger')),
    current: JSON.parse(option(args, '--current')),
    manifest: JSON.parse(option(args, '--manifest')),
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [, , command, ...args] = process.argv;
  const path = option(args, '--path');
  if (command === 'issue') {
    process.stdout.write(`${JSON.stringify(await issueServingPermit(path, decisionFromArgs(args)))}\n`);
  } else if (command === 'validate') {
    process.stdout.write(`${JSON.stringify(await validateServingPermit(path, decisionFromArgs(args)))}\n`);
  } else if (command === 'clear') {
    await clearServingPermit(path);
  } else {
    throw new Error('usage: preview-serving-permit.mjs issue|validate|clear');
  }
}
