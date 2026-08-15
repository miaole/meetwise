#!/usr/bin/env bash
set -euo pipefail
PATH=/usr/sbin:/usr/bin:/sbin:/bin
export PATH

source /usr/local/lib/meetwise-preview-controller/controller-lib.sh
controller_entry_guard prepare-preview-web-release.sh
controller_require_lock

release_root=/srv/meetwise/releases
repository=miaole/meetwise
signer_workflow='miaole/meetwise/.github/workflows/build-preview-web.yml@refs/heads/main'

if [[ $# -ne 1 || ! -f "$1" ]]; then
  printf '%s\n' 'usage: sudo /usr/local/lib/meetwise-preview-controller/release-preview-web.sh <attested-web-archive> <expires-at-iso>' >&2
  exit 64
fi

input_archive="$(realpath -e "$1")"
[[ "$input_archive" != /srv/meetwise/releases/* ]] || { printf '%s\n' 'release archive cannot be read from an active release directory' >&2; exit 64; }
command -v gh >/dev/null || { printf '%s\n' 'GitHub CLI is required to verify the build attestation' >&2; exit 69; }

install -d -o root -g root -m 0755 "$release_root"
scratch="$(mktemp -d "$release_root/.incoming.XXXXXX")"
cleanup() { rm -rf "$scratch"; }
trap cleanup EXIT
archive="$scratch/web-release.tar.gz"
# Treat the supplied artifact as untrusted until the root-owned staging copy
# has passed provenance and tar-member validation.  No operation after this
# point reads the caller-controlled pathname again.
install -o root -g root -m 0600 "$input_archive" "$archive"
gh attestation verify "$archive" --repo "$repository" --signer-workflow "$signer_workflow" >/dev/null
node /usr/local/lib/meetwise-preview-controller/archive-safety.mjs validate "$archive" release >/dev/null
archive_sha256="$(sha256sum "$archive" | awk '{print $1}')"

payload="$scratch/payload"
install -d -o root -g root -m 0700 "$payload"
tar --no-same-owner --no-same-permissions -xzf "$archive" -C "$payload"
[[ -d "$payload/release" ]] || { printf '%s\n' 'attested archive is missing the release root' >&2; exit 65; }
node /usr/local/lib/meetwise-preview-controller/archive-safety.mjs verify-extracted "$payload/release" >/dev/null
artifact="$(node /usr/local/lib/meetwise-preview-controller/preview-release-artifact.mjs verify "$payload/release")"
release_id="$(node -e 'console.log(JSON.parse(process.argv[1]).releaseDigest)' "$artifact")"
target="$release_root/$release_id"
if [[ -e "$target" ]]; then
  node /usr/local/lib/meetwise-preview-controller/preview-release-artifact.mjs verify "$target" >/dev/null
  [[ -f "$target/.meetwise-preview-archive.sha256" ]] || controller_fail 'existing release is missing its archive identity' 70
  [[ "$(cat "$target/.meetwise-preview-archive.sha256")" == "$archive_sha256" ]] || controller_fail 'same release digest arrived with a different archive' 70
else
  mv "$payload/release" "$target"
  chown -R root:root "$target"
  chmod -R go-w "$target"
  printf '%s\n' "$archive_sha256" | install -o root -g root -m 0644 /dev/stdin "$target/.meetwise-preview-archive.sha256"
fi
[[ "$(stat -c '%U:%G' "$target")" == root:root ]] || { printf '%s\n' 'prepared release ownership is invalid' >&2; exit 70; }
! runuser -u meetwise -- test -w "$target"
prior="$(node -e 'console.log(JSON.parse(process.argv[1]).state)' "$(controller_ledger_read)")"
controller_ledger_transition "$prior" staged "$release_id" "$archive_sha256" '' disabled >/dev/null
printf '%s\n' "$target"
