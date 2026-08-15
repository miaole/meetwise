#!/usr/bin/env bash
set -euo pipefail

source /usr/local/lib/meetwise-preview-controller/controller-lib.sh
controller_entry_guard revoke-preview-pages-link.sh
controller_require_lock

controller_root=/usr/local/lib/meetwise-preview-controller
private_key=/etc/meetwise/preview-release-ed25519.pem
public_manifest=/usr/share/meetwise-preview/preview-release-manifest.json
pages_state_url=https://miaole.github.io/meetwise/preview-link-state.json

ledger="$(controller_ledger_read)"
release_id="$(node -e 'const state=JSON.parse(process.argv[1]); if (state.state !== "verified") process.exit(64); console.log(state.releaseDigest)' "$ledger")" || controller_fail 'no verified Pages-linked preview release can be revoked' 64
release_dir="$(controller_release_dir "/srv/meetwise/releases/$release_id")"
previous="$release_dir/.meetwise-preview-release-manifest.json"
[[ -f "$previous" && -f "$private_key" ]] || controller_fail 'verified manifest or signing key is unavailable' 65

scratch="$(mktemp -d)"
cleanup() { rm -rf "$scratch"; }
trap cleanup EXIT
node --input-type=module - "$previous" "$private_key" "$scratch/revoked.json" "$controller_root/preview-release-manifest.mjs" <<'NODE'
import { readFile, writeFile } from 'node:fs/promises';
const [input, privateKeyPath, output, signerPath] = process.argv.slice(2);
const [{ signature, ...unsigned }, privateKey, { signManifest }] = await Promise.all([
  readFile(input, 'utf8').then(JSON.parse),
  readFile(privateKeyPath, 'utf8'),
  import(signerPath),
]);
const now = new Date();
const revoked = {
  ...unsigned,
  status: 'revoked',
  revoked: true,
  issuedAt: now.toISOString(),
  expiresAt: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
};
const signed = signManifest(revoked, privateKey);
await writeFile(output, `${JSON.stringify(signed, null, 2)}\n`, { mode: 0o644 });
NODE
install -d -o root -g root -m 0755 /usr/share/meetwise-preview
install -o root -g root -m 0644 "$scratch/revoked.json" "$public_manifest.new"
mv -Tf "$public_manifest.new" "$public_manifest"
fingerprint="$(node --input-type=module - "$scratch/revoked.json" "$controller_root/preview-release-manifest.mjs" <<'NODE'
import { readFile } from 'node:fs/promises';
const [path, manifestModule] = process.argv.slice(2);
const [{ manifestFingerprint }, manifest] = await Promise.all([import(manifestModule), readFile(path, 'utf8').then(JSON.parse)]);
process.stdout.write(manifestFingerprint(manifest));
NODE
)"
controller_ledger_transition verified revoked "$release_id" "$fingerprint" '' disabled >/dev/null

# The next release must not overwrite the edge while Pages still offers a link
# whose signed release record identifies the old build.  Pages republishes its
# disabled state on the hourly verification schedule.
for _ in {1..260}; do
  if curl --fail --silent --show-error --proto '=https' --tlsv1.2 --max-time 20 "$pages_state_url?manifest=$fingerprint" -o "$scratch/pages-state.json"; then
    if node - "$scratch/pages-state.json" "$fingerprint" <<'NODE'
const fs = require('node:fs');
const [path, fingerprint] = process.argv.slice(2);
const state = JSON.parse(fs.readFileSync(path, 'utf8'));
process.exit(state.state === 'disabled' && state.manifestSha256 === fingerprint ? 0 : 1);
NODE
    then
      printf '%s\n' 'Pages confirmed the preview link is disabled'
      exit 0
    fi
  fi
  sleep 15
done
controller_fail 'Pages revocation receipt did not arrive before the release deadline' 70
