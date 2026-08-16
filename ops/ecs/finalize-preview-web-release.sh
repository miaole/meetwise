#!/usr/bin/env bash
set -euo pipefail

source /usr/local/lib/meetwise-preview-controller/controller-lib.sh
controller_entry_guard finalize-preview-web-release.sh
controller_require_lock

controller_root=/usr/local/lib/meetwise-preview-controller
private_key=/etc/meetwise/preview-release-ed25519.pem
public_manifest=/usr/share/meetwise-preview/preview-release-manifest.json
public_key="$controller_root/preview-release-ed25519.pub.pem"

if [[ $# -ne 2 ]]; then
  printf '%s\n' 'usage: internal finalize-preview-web-release.sh /srv/meetwise/releases/<release-digest> <expires-at-iso>' >&2
  exit 64
fi

release_dir="$(controller_release_dir "$1")"
release_id="$(basename "$release_dir")"
artifact="$release_dir/.meetwise-preview-web-artifact.json"
loopback_receipt="$release_dir/.meetwise-preview-loopback-receipt.json"
blackbox_receipt="$release_dir/.meetwise-preview-blackbox-receipt.json"
manifest="$release_dir/.meetwise-preview-release-manifest.json"
[[ -f "$artifact" && -f "$loopback_receipt" && -f "$blackbox_receipt" && -f "$private_key" && -f "$public_key" ]] || controller_fail 'required trusted attestation input is missing' 65
[[ "$(stat -c '%U:%G:%a' "$private_key")" == root:root:600 ]] || controller_fail 'preview signing key ownership or mode is invalid' 77
[[ "$(readlink -f /srv/meetwise/current)" == "$release_dir" ]] || controller_fail 'candidate release is not active' 70
[[ "$(stat -c '%U:%G' "$release_dir")" == root:root ]] || controller_fail 'candidate release ownership is invalid' 70
! runuser -u meetwise -- test -w "$release_dir"
artifact_json="$(node "$controller_root/preview-release-artifact.mjs" verify "$release_dir")"
ledger="$(controller_ledger_read)"
node - "$ledger" "$release_id" "$blackbox_receipt" <<'NODE'
const fs = require('node:fs');
const ledger = JSON.parse(process.argv[2]);
const release = process.argv[3];
const receipt = JSON.parse(fs.readFileSync(process.argv[4], 'utf8'));
if (ledger.state !== 'active_unpublished' || ledger.releaseDigest !== release) throw new Error('preview_ledger_active_release_mismatch');
if (receipt.releaseDigest !== release || typeof receipt.origin !== 'string' || !/^[a-f0-9]{64}$/.test(receipt.edge ?? '') || !/^[a-f0-9]{64}$/.test(receipt.allowedPathDigest ?? '') || !/^[a-f0-9]{64}$/.test(receipt.writeGateDigest ?? '')) throw new Error('preview_blackbox_receipt_invalid');
NODE

scratch="$(mktemp -d)"
cleanup() { rm -rf "$scratch"; }
trap cleanup EXIT
tailscale status --json > "$scratch/tailnet.json"
preview_host="$(node "$controller_root/preview-funnel-target.mjs" host "$scratch/tailnet.json")"
tailscale funnel status --json > "$scratch/funnel.json"
origin="$(node "$controller_root/preview-funnel-target.mjs" assert "$scratch/funnel.json" "$preview_host")"
node --input-type=module - "$artifact" "$loopback_receipt" "$blackbox_receipt" "$origin" "$2" "$private_key" "$public_key" "$manifest" "$controller_root/preview-release-manifest.mjs" <<'NODE'
import { readFile, writeFile } from 'node:fs/promises';
import { createPrivateKey, createPublicKey } from 'node:crypto';
const [artifactPath, receiptPath, blackboxPath, origin, expiresAt, privateKeyPath, publicKeyPath, output, signerPath] = process.argv.slice(2);
const [artifact, receipt, blackbox, privateKey, publicKey, { signManifest }] = await Promise.all([
  readFile(artifactPath, 'utf8').then(JSON.parse),
  readFile(receiptPath, 'utf8').then(JSON.parse),
  readFile(blackboxPath, 'utf8').then(JSON.parse),
  readFile(privateKeyPath, 'utf8'),
  readFile(publicKeyPath, 'utf8'),
  import(signerPath),
]);
if (createPublicKey(createPrivateKey(privateKey)).export({ type: 'spki', format: 'pem' }) !== publicKey) throw new Error('preview_signing_key_public_pair_mismatch');
if (blackbox.origin !== origin) throw new Error('preview_blackbox_origin_mismatch');
const unsigned = {
  schemaVersion: 1,
  status: 'verified',
  releaseDigest: artifact.releaseDigest,
  commit: artifact.commit,
  tree: artifact.tree,
  webBuildSha256: artifact.webBuildSha256,
  staticAssetsSha256: artifact.staticAssetsSha256,
  origin,
  mode: 'public-read-only',
  issuedAt: new Date().toISOString(),
  expiresAt,
  revoked: false,
  receipts: {
    candidate: receipt.candidate,
    loopback: receipt.loopback,
    methodGate: receipt.methodGate,
    edge: blackbox.edge,
    blackbox: (await import('node:crypto')).createHash('sha256').update(await readFile(blackboxPath)).digest('hex'),
  },
  signingKeyId: 'ecs-preview-ed25519-v1',
};
await writeFile(output, `${JSON.stringify(signManifest(unsigned, privateKey), null, 2)}\n`, { mode: 0o644 });
NODE
node "$controller_root/preview-release-manifest.mjs" verify --manifest "$manifest" --public-key "$public_key" >/dev/null
manifest_fingerprint="$(node --input-type=module - "$manifest" "$controller_root/preview-release-manifest.mjs" <<'NODE'
import { readFile } from 'node:fs/promises';
const [path, manifestModule] = process.argv.slice(2);
const [{ manifestFingerprint }, signed] = await Promise.all([import(manifestModule), readFile(path, 'utf8').then(JSON.parse)]);
process.stdout.write(manifestFingerprint(signed));
NODE
)"
# Persist recovery intent before the public manifest can make the Pages link
# eligible. A later disk/ledger error therefore leaves a durable state that
# forces revocation before release rollback.
controller_ledger_transition active_unpublished publishing "$release_id" "$manifest_fingerprint" "$origin" disabled >/dev/null
install -d -o root -g root -m 0755 /usr/share/meetwise-preview
install -o root -g root -m 0644 "$manifest" "$public_manifest.new"
mv -Tf "$public_manifest.new" "$public_manifest"
controller_ledger_transition publishing verified "$release_id" "$manifest_fingerprint" "$origin" disabled >/dev/null
printf '%s\n' "signed verified release manifest: $manifest"
