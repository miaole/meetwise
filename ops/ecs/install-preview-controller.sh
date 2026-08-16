#!/usr/bin/env bash
# Verified controller payload. This file is deliberately *not* a first-root
# bootstrap: it runs only after an independent, pre-installed root bootstrap
# has verified the attested archive and staged this exact payload below a
# root-owned path. Never invoke this archive member directly with sudo.
set -euo pipefail
PATH=/usr/sbin:/usr/bin:/sbin:/bin
export PATH

controller_root=/usr/local/lib/meetwise-preview-controller
bootstrap_root=/var/lib/meetwise-preview-bootstrap/verified-controller
payload_root="$bootstrap_root/payload"
archive="$bootstrap_root/controller.tar.gz"
bootstrap_receipt="$bootstrap_root/bootstrap.json"
repository=miaole/meetwise
signer_workflow='miaole/meetwise/.github/workflows/build-preview-web.yml@refs/heads/main'

if [[ "$EUID" -ne 0 || $# -ne 0 ]]; then
  printf '%s\n' 'usage: internal verified-controller installer payload' >&2
  exit 64
fi
[[ "$(readlink -f "$0")" == "$payload_root/ops/ecs/install-preview-controller.sh" ]] \
  || { printf '%s\n' 'controller installer must run only from the verified bootstrap payload' >&2; exit 77; }
[[ -f "$archive" && -f "$bootstrap_receipt" && -d "$payload_root" ]] \
  || { printf '%s\n' 'verified controller bootstrap staging is incomplete' >&2; exit 69; }
[[ "$(stat -c '%U:%G:%a' "$archive")" == root:root:600 && "$(stat -c '%U:%G:%a' "$bootstrap_receipt")" == root:root:600 ]] \
  || { printf '%s\n' 'verified controller bootstrap staging metadata is invalid' >&2; exit 77; }
[[ "$(stat -c '%U:%G:%a' "$payload_root")" == root:root:700 && ! -L "$payload_root" ]] \
  || { printf '%s\n' 'verified controller payload root metadata is invalid' >&2; exit 77; }
! find -P "$payload_root" -xdev \( -type l -o ! -user root -o ! -group root -o -perm /022 \) -print -quit | grep -q . \
  || { printf '%s\n' 'verified controller payload tree metadata is invalid' >&2; exit 77; }

# No archive member is executable until a receipt from the independent root
# bootstrap binds both its bytes and its extracted regular-file tree. This
# check deliberately uses the system Node runtime, never a candidate module.
payload_tree_sha256="$(
  cd "$payload_root"
  find -P . -type f -print0 | LC_ALL=C sort -z | xargs -0 sha256sum | sha256sum | awk '{print $1}'
)"
/usr/bin/node --input-type=module - "$bootstrap_receipt" "$archive" "$payload_tree_sha256" <<'NODE'
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const [receiptPath, archivePath, payloadTreeSha256] = process.argv.slice(2);
const receipt = JSON.parse(await readFile(receiptPath, 'utf8'));
const archiveSha256 = createHash('sha256').update(await readFile(archivePath)).digest('hex');
if (receipt.schemaVersion !== 1
  || receipt.archiveSha256 !== archiveSha256
  || receipt.payloadTreeSha256 !== payloadTreeSha256
  || typeof receipt.attestationVerifiedAt !== 'string'
  || !Number.isFinite(Date.parse(receipt.attestationVerifiedAt))) {
  throw new Error('preview_bootstrap_receipt_invalid');
}
NODE

# Controller replacement must not race a release which has already validated
# a different root-owned controller tree. This bootstrap payload is trusted at
# this point, but it still refuses rather than stealing an active release lock.
runtime_dir=/run/meetwise-preview-controller
lock_path="$runtime_dir/controller.lock"
install -d -o root -g root -m 0700 "$runtime_dir"
[[ "$(stat -c '%U:%G:%a' "$runtime_dir")" == root:root:700 && ! -L "$runtime_dir" && ! -L "$lock_path" && ( ! -e "$lock_path" || -f "$lock_path" ) ]] \
  || { printf '%s\n' 'preview controller lock path is unsafe' >&2; exit 77; }
(umask 077; : >>"$lock_path")
exec 9>>"$lock_path"
flock -n 9 || { printf '%s\n' 'active preview release prevents controller replacement' >&2; exit 75; }

command -v gh >/dev/null || { printf '%s\n' 'GitHub CLI is required to verify the controller attestation' >&2; exit 69; }

scratch="$(mktemp -d "$bootstrap_root/install.XXXXXX")"
cleanup() { rm -rf "$scratch"; }
trap cleanup EXIT
gh attestation verify "$archive" --repo "$repository" --signer-workflow "$signer_workflow" >/dev/null

# The independent bootstrap has already validated/extracted the archive. The
# payload repeats both checks as defence in depth, but they are not the source
# of first-root trust.
node "$payload_root/ops/ecs/archive-safety.mjs" validate "$archive" ops/ecs >/dev/null
source_root="$payload_root/ops/ecs"
[[ -f "$source_root/controller-files.txt" ]] || { printf '%s\n' 'controller archive is missing its file map' >&2; exit 65; }
node "$source_root/archive-safety.mjs" verify-extracted "$source_root" >/dev/null

install -d -o root -g root -m 0755 "$controller_root.new"
while IFS=$'\t' read -r source target; do
  [[ -n "$source" && "${source:0:1}" != '#' ]] || continue
  [[ "$source" != *'..'* && "$target" =~ ^[A-Za-z0-9._-]+$ && -f "$source_root/$source" ]] || { printf '%s\n' 'controller file map is invalid' >&2; exit 65; }
  mode=0644
  [[ "$target" == *.sh ]] && mode=0755
  install -D -o root -g root -m "$mode" "$source_root/$source" "$controller_root.new/$target"
done < "$source_root/controller-files.txt"
(
  cd "$controller_root.new"
  find . -type f ! -name controller.sha256 ! -name controller-version.json -print0 | LC_ALL=C sort -z | xargs -0 sha256sum > controller.sha256
)
install -o root -g root -m 0600 /dev/stdin "$controller_root.new/controller-version.json" <<EOF
{"schemaVersion":1,"archiveSha256":"$(sha256sum "$archive" | awk '{print $1}')","installedAt":"$(date -u +%Y-%m-%dT%H:%M:%SZ)"}
EOF
chown -R root:root "$controller_root.new"
chmod -R go-w "$controller_root.new"
if [[ -e "$controller_root" ]]; then mv -T "$controller_root" "$controller_root.previous"; fi
mv -T "$controller_root.new" "$controller_root"
rm -rf "$controller_root.previous"
install -D -o root -g root -m 0644 "$controller_root/meetwise-preview-recovery.service" /etc/systemd/system/meetwise-preview-recovery.service
install -D -o root -g root -m 0644 "$controller_root/meetwise-preview-edge-probe-expiry.service" /etc/systemd/system/meetwise-preview-edge-probe-expiry.service
install -D -o root -g root -m 0644 "$controller_root/meetwise-preview-edge-probe-expiry.timer" /etc/systemd/system/meetwise-preview-edge-probe-expiry.timer
install -D -o root -g root -m 0644 "$controller_root/meetwise-preview-edge-probe-watchdog.service" /etc/systemd/system/meetwise-preview-edge-probe-watchdog.service
install -d -o root -g root -m 0755 /srv/meetwise/releases
install -d -o root -g root -m 0700 /var/lib/meetwise-preview-controller
install -d -o root -g root -m 0755 /usr/share/meetwise-preview
# The immutable replacement is complete. Release the installer-held lock
# before invoking the recovery unit, which independently acquires it.
flock -u 9
exec 9>&-
systemctl daemon-reload
systemctl enable meetwise-preview-recovery.service
systemctl restart meetwise-preview-recovery.service
systemctl is-active --quiet meetwise-preview-recovery.service
printf '%s\n' 'installed root-owned preview controller; candidate release scripts are not executable control-plane entries'
