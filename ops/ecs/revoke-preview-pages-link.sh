#!/usr/bin/env bash
set -euo pipefail

source /usr/local/lib/meetwise-preview-controller/controller-lib.sh
controller_entry_guard revoke-preview-pages-link.sh
controller_require_lock

controller_root=/usr/local/lib/meetwise-preview-controller
private_key=/etc/meetwise/preview-release-ed25519.pem
public_manifest=/usr/share/meetwise-preview/preview-release-manifest.json
public_key="$controller_root/preview-release-ed25519.pub.pem"
pages_state_url=https://miaole.github.io/meetwise/preview-link-state.json

ledger="$(controller_ledger_read)"
ledger_state="$(node -e 'const state=JSON.parse(process.argv[1]); if (state.state === "revoked") process.exit(64); process.stdout.write(state.state)' "$ledger")" || controller_fail 'a revoked preview release cannot be revoked again' 64
[[ -f "$public_manifest" && ! -L "$public_manifest" && "$(stat -c '%U:%G:%a' "$public_manifest")" == root:root:644 ]] \
  || controller_fail 'a signed public preview manifest is required before revocation' 65
[[ -f "$private_key" && -f "$public_key" ]] || controller_fail 'preview signing material is unavailable' 65
[[ "$(stat -c '%U:%G:%a' "$private_key")" == root:root:600 ]] || controller_fail 'preview signing key ownership or mode is invalid' 77

scratch="$(mktemp -d)"
cleanup() { rm -rf "$scratch"; }
trap cleanup EXIT
manifest_state="$(node --input-type=module - "$public_manifest" "$public_key" "$private_key" "$scratch/revoked.json" "$controller_root/preview-release-manifest.mjs" <<'NODE'
import { readFile, writeFile } from 'node:fs/promises';
const [input, publicKeyPath, privateKeyPath, output, signerPath] = process.argv.slice(2);
const [{ verifyManifest, unsignedManifest, signManifest, manifestFingerprint }, manifest, publicKey, privateKey] = await Promise.all([
  import(signerPath),
  readFile(input, 'utf8').then(JSON.parse),
  readFile(publicKeyPath, 'utf8'),
  readFile(privateKeyPath, 'utf8'),
]);
const signed = verifyManifest(manifest, publicKey, { allowExpired: true });
if (signed.status === 'revoked') {
  process.stdout.write(JSON.stringify({
    releaseDigest: signed.releaseDigest,
    fingerprint: manifestFingerprint(signed),
    alreadyRevoked: true,
  }));
  process.exit(0);
}
if (signed.status !== 'verified') throw new Error('preview_public_manifest_status_invalid');
const now = new Date();
const revoked = signManifest({
  ...unsignedManifest(signed),
  status: 'revoked',
  revoked: true,
  issuedAt: now.toISOString(),
  expiresAt: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
}, privateKey);
await writeFile(output, `${JSON.stringify(revoked, null, 2)}\n`, { mode: 0o600 });
process.stdout.write(JSON.stringify({
  releaseDigest: revoked.releaseDigest,
  fingerprint: manifestFingerprint(revoked),
  alreadyRevoked: false,
}));
NODE
)"
release_id="$(node -e 'process.stdout.write(JSON.parse(process.argv[1]).releaseDigest)' "$manifest_state")"
fingerprint="$(node -e 'process.stdout.write(JSON.parse(process.argv[1]).fingerprint)' "$manifest_state")"
already_revoked="$(node -e 'process.stdout.write(String(JSON.parse(process.argv[1]).alreadyRevoked))' "$manifest_state")"
if [[ "$already_revoked" != true ]]; then
  controller_publish_manifest "$scratch/revoked.json" "$public_manifest"
fi

# The next release must not overwrite the edge while Pages still offers a link
# whose signed release record identifies the old build. Pages republishes its
# disabled state on the hourly verification schedule.
receipt_confirmed=0
for _ in {1..260}; do
  if curl --fail --silent --show-error --proto '=https' --tlsv1.2 --max-time 20 "$pages_state_url?manifest=$fingerprint" -o "$scratch/pages-state.json"; then
    if node - "$scratch/pages-state.json" "$fingerprint" <<'NODE'
const fs = require('node:fs');
const [path, fingerprint] = process.argv.slice(2);
const state = JSON.parse(fs.readFileSync(path, 'utf8'));
process.exit(state.state === 'disabled' && state.manifestSha256 === fingerprint ? 0 : 1);
NODE
    then
      receipt_confirmed=1
      break
    fi
  fi
  sleep 15
done
[[ "$receipt_confirmed" == 1 ]] || controller_fail 'Pages revocation receipt did not arrive before the release deadline' 70

# Persist terminal revocation only after the independently published receipt.
# If a process dies before this line, reconciliation observes the actual
# revoked manifest and completes confirmation before any release switch.
controller_ledger_transition "$ledger_state" revoked "$release_id" "$fingerprint" '' disabled >/dev/null
printf '%s\n' 'Pages confirmed the preview link is disabled'
